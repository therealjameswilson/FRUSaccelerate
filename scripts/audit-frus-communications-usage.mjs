#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const COMMUNICATIONS_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "document_heading",
  "attachment_note",
  "unknown_editorial_text"
]);
const COMMUNICATIONS_PATTERN =
  /\b(?:telegram|cable|cables|tosec|secto|state\s+\d+|dtg\s+\d{6}z|[0-9]{4}z|electronic telegrams|central foreign policy file|sent for information|drafted by|cleared by|approved by|joint state\/defense message|nodis|exdis|immediate|priority)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-communications-usage.mjs --units <extracted-units.json|-> --registry <communications-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
  let targetVolume = "";
  let format = "json";
  let failOnWarning = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--registry") {
      registryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--target-volume") {
      targetVolume = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else if (arg === "--fail-on-warning") {
      failOnWarning = true;
    } else {
      usage();
    }
  }

  if (
    !unitsPath ||
    !registryPath ||
    (unitsPath === "-" && checkerOutputPath === "-") ||
    (registryPath === "-" && checkerOutputPath === "-") ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }
  return { unitsPath, registryPath, checkerOutputPath, targetVolume, format, failOnWarning };
}

function readJson(filePath, label) {
  const text = filePath === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeForm(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function validateUnits(unitsDocument) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) return ["units: expected extracted-units object"];
  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push("units.schema_version: must be frus-extracted-units-v1");
  }
  if (!Array.isArray(unitsDocument.units)) {
    errors.push("units.units: expected array");
    return errors;
  }
  const seen = new Set();
  unitsDocument.units.forEach((unit, index) => {
    const label = `units.units[${index}]`;
    if (!isPlainObject(unit)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${label}.unit_id: expected non-empty string`);
    } else if (seen.has(unit.unit_id)) {
      errors.push(`${label}.unit_id: duplicate ${unit.unit_id}`);
    } else {
      seen.add(unit.unit_id);
    }
    for (const key of ["unit_type", "exact_text", "display_text"]) {
      if (typeof unit[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
  });
  return errors;
}

function validateRegistry(registry) {
  const errors = [];
  if (!isPlainObject(registry)) return ["registry: expected communications-registry object"];
  if (registry.schema_version !== "frus-communications-registry-v1") {
    errors.push("registry.schema_version: must be frus-communications-registry-v1");
  }
  if (typeof registry.communications_registry_id !== "string" || registry.communications_registry_id.length === 0) {
    errors.push("registry.communications_registry_id: expected non-empty string");
  }
  if (typeof registry.captured_at !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(registry.captured_at)) {
    errors.push("registry.captured_at: expected YYYY-MM-DD");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("registry.records: expected array");
    return errors;
  }
  const seen = new Set();
  registry.records.forEach((record, index) => {
    const label = `registry.records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "communications_id",
      "volume_id",
      "document_id",
      "document_number",
      "communications_type",
      "approved_heading_form",
      "message_identifier",
      "special_designator",
      "origin",
      "addressees",
      "date_time_line",
      "date_time_group",
      "subject_or_title",
      "source_family",
      "source_note_form",
      "classification_or_handling_summary",
      "drafting_clearance_approval",
      "reference_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.communications_id === "string") {
      if (seen.has(record.communications_id)) errors.push(`${label}.communications_id: duplicate ${record.communications_id}`);
      seen.add(record.communications_id);
    }
  });
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!output) return errors;
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  if (output.schema_version !== "checker-output-v1") {
    errors.push("checker_output.schema_version: must be checker-output-v1");
  }
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeLiteralPattern(form, flags = "g") {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}\\.?\\b`, flags);
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
}

function findMatches(text, form, kind, explicitForms = []) {
  const matches = [];
  if (!String(form || "").trim()) return matches;
  const exactPattern = makeLiteralPattern(form, "g");
  for (const match of text.matchAll(exactPattern)) {
    matches.push({
      matched_text: match[0],
      match_kind: kind,
      offset: match.index || 0,
      length: match[0].length,
      normalized_form: normalizeForm(form)
    });
  }
  const foldedPattern = makeLiteralPattern(form, "gi");
  for (const match of text.matchAll(foldedPattern)) {
    const explicitDuplicate = explicitForms.some((explicitForm) => explicitForm === match[0]);
    const exactDuplicate = matches.some(
      (item) => item.offset === (match.index || 0) && item.matched_text === match[0]
    );
    if (!explicitDuplicate && !exactDuplicate && normalizeForm(match[0]) === normalizeForm(form)) {
      matches.push({
        matched_text: match[0],
        match_kind: "case_or_punctuation_variant",
        offset: match.index || 0,
        length: match[0].length,
        normalized_form: normalizeForm(form)
      });
    }
  }
  return matches;
}

function bestMatch(matches) {
  if (matches.length === 0) return null;
  return matches
    .slice()
    .sort((a, b) => {
      const aApproved = a.match_kind.startsWith("approved_") ? 1 : 0;
      const bApproved = b.match_kind.startsWith("approved_") ? 1 : 0;
      return bApproved - aApproved || b.length - a.length || a.offset - b.offset;
    })[0];
}

function recordForms(record) {
  return [
    ["approved_heading_form", record.approved_heading_form],
    ["approved_message_identifier", record.message_identifier],
    ["approved_date_time_line", record.date_time_line],
    ["approved_date_time_group", record.date_time_group],
    ["approved_source_note_form", record.source_note_form],
    ["approved_reference_context", record.reference_context]
  ];
}

function approvedForms(record) {
  return recordForms(record)
    .map(([, form]) => form)
    .filter((form) => String(form || "").trim());
}

function checkerCommunicationsDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const communicationsSignal =
      ["communications_record", "time_zone_chronology"].includes(check.category) ||
      ["communications_metadata", "time_zone_basis"].includes(check.evidence_request) ||
      /^FAS-(?:COM|CHRON)-\d{3}$/.test(check.rule_id || "");
    if (!communicationsSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_communications_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) {
    return "cross_volume_communications";
  }
  if (match.match_kind.startsWith("approved_")) {
    return "approved";
  }
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved communications metadata for ${record.document_id} ${record.message_identifier || record.approved_heading_form}.`;
  }
  if (status === "cross_volume_communications") {
    return `Matched communications metadata tied to ${record.volume_id}; confirm target volume before changing message identifiers, time groups, routing, or source-family language.`;
  }
  if (status === "needs_communications_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; message identifier, time group, routing, and source-note proof are needed before direct edits.`;
  }
  return `Matched a communications metadata variant; review against approved forms for ${record.message_identifier || record.approved_heading_form}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const usages = [];
  for (const record of registry.records || []) {
    const explicitForms = [...approvedForms(record), ...(record.variant_forms || [])];
    const matches = [];
    for (const [kind, form] of recordForms(record)) {
      matches.push(...findMatches(text, form, kind, explicitForms));
    }
    for (const form of record.variant_forms || []) {
      matches.push(...findMatches(text, form, "variant_form", explicitForms));
    }
    const match = bestMatch(matches);
    if (!match) continue;
    const status = usageStatus({ record, match, targetVolume });
    usages.push({
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      communications_id: record.communications_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      communications_type: record.communications_type,
      approved_heading_form: record.approved_heading_form,
      message_identifier: record.message_identifier,
      special_designator: record.special_designator,
      date_time_line: record.date_time_line,
      date_time_group: record.date_time_group,
      source_note_form: record.source_note_form,
      approved_forms: approvedForms(record),
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, record, match),
      source_url: record.source_url,
      verification_status: record.verification_status
    });
  }
  return usages.sort((a, b) => a.location.localeCompare(b.location) || a.communications_id.localeCompare(b.communications_id));
}

function isCommunicationsLikeUnit(unit) {
  return COMMUNICATIONS_UNIT_TYPES.has(unit.unit_type) && COMMUNICATIONS_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status !== "approved") continue;
    for (const form of usage.approved_forms || []) {
      if (replacement === normalizeForm(form)) return true;
    }
  }
  return false;
}

function auditCommunications({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [
    ...validateUnits(unitsDocument),
    ...validateRegistry(registry),
    ...validateOutput(checkerOutput)
  ];
  if (errors.length > 0) {
    return {
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        communications_usages: 0,
        warnings: 0,
        unmatched_communications_like_units: 0,
        direct_communications_edit_conflicts: 0,
        by_usage_status: {},
        by_communications_type: {}
      },
      usages: [],
      diagnostics: []
    };
  }

  const warnings = [];
  const usages = [];
  const diagnostics = [];
  const usagesByUnit = new Map();
  let unmatched = 0;

  for (const unit of unitsDocument.units) {
    const unitUsages = registryMatchesForUnit(unit, registry, targetVolume);
    if (unitUsages.length > 0) {
      usages.push(...unitUsages);
      usagesByUnit.set(unit.unit_id, unitUsages);
      for (const usage of unitUsages) {
        if (usage.recommended_action === "comment_only") warnings.push(`${usage.unit_id}: ${usage.finding}`);
      }
    }
    if (unitUsages.length === 0 && isCommunicationsLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_communications_like_unit",
        finding: "Telegram/cable/message unit had no match in the supplied communications registry.",
        recommended_action: "comment_only",
        evidence_request: "communications_metadata"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerCommunicationsDirectEdits(checkerOutput);
  const directConflicts = [];
  for (const [unitId, checks] of directEdits.entries()) {
    const unitUsages = usagesByUnit.get(unitId) || [];
    for (const check of checks) {
      if (!directEditSupported(check, unitUsages)) {
        directConflicts.push({
          unit_id: unitId,
          rule_id: check.rule_id || "",
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding: "Direct communications metadata edit lacks a target-volume approved registry match.",
          required_action: "Downgrade to comment_only until the message identifier, special designator, origin/addressee, date-time line, source family, and handling/routing basis are supplied."
        });
      }
    }
  }

  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    communications_usages: usages.length,
    warnings: warnings.length,
    unmatched_communications_like_units: unmatched,
    direct_communications_edit_conflicts: directConflicts.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_communications_type: countBy(usages.map((usage) => usage.communications_type))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return { status, errors: hardErrors, warnings, summary, usages, diagnostics, direct_edit_conflicts: directConflicts };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS communications usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS communications usage audit ${result.status}: ${result.summary.communications_usages} matches across ${result.summary.units_scanned} units.`
    );
    lines.push(
      `Variants/cross-volume/context warnings: ${result.summary.warnings}; unmatched communications-like units: ${result.summary.unmatched_communications_like_units}.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const registry = readJson(options.registryPath, options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null;
  const audit = auditCommunications({ unitsDocument, registry, checkerOutput, targetVolume: options.targetVolume });
  const result = {
    schema_version: "frus-communications-usage-audit-v1",
    units: options.unitsPath === "-" ? "stdin" : options.unitsPath,
    registry: options.registryPath === "-" ? "stdin" : options.registryPath,
    checker_output: options.checkerOutputPath || "",
    target_volume: options.targetVolume,
    status: audit.status,
    summary: audit.summary,
    usages: audit.usages,
    diagnostics: audit.diagnostics,
    direct_edit_conflicts: audit.direct_edit_conflicts || [],
    warnings: audit.warnings,
    errors: audit.errors
  };
  if (options.format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail" || (result.status === "warning" && options.failOnWarning)) process.exit(1);
} catch (error) {
  console.error(`FRUS communications usage audit failed: ${error.message}`);
  process.exit(1);
}
