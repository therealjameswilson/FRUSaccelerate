#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const DECLASSIFICATION_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "declassification_note",
  "front_matter",
  "unknown_editorial_text"
]);
const DECLASSIFICATION_PATTERN =
  /\b(?:not declassified|handling restriction not declassified|portion marking not declassified|pages? not declassified|paragraphs?.*not declassified|lines? not declassified|withhold|withheld|excise|excisions|declassification review)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-declassification-usage.mjs --units <extracted-units.json|-> --registry <declassification-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
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
  if (!isPlainObject(registry)) return ["registry: expected declassification-registry object"];
  if (registry.schema_version !== "frus-declassification-registry-v1") {
    errors.push("registry.schema_version: must be frus-declassification-registry-v1");
  }
  if (typeof registry.declassification_registry_id !== "string" || registry.declassification_registry_id.length === 0) {
    errors.push("registry.declassification_registry_id: expected non-empty string");
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
      "declassification_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "declassification_type",
      "approved_phrase",
      "quantity",
      "quantity_unit",
      "review_outcome",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.declassification_id === "string") {
      if (seen.has(record.declassification_id)) errors.push(`${label}.declassification_id: duplicate ${record.declassification_id}`);
      seen.add(record.declassification_id);
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
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}(?=$|[^A-Za-z0-9])`, flags);
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

function suppressContainedMatches(matches) {
  const sorted = matches.slice().sort((a, b) => b.match.length - a.match.length || a.match.offset - b.match.offset);
  const accepted = [];
  for (const item of sorted) {
    const contained = accepted.some(
      (acceptedItem) =>
        item.match.offset >= acceptedItem.match.offset &&
        item.match.offset + item.match.length <= acceptedItem.match.offset + acceptedItem.match.length
    );
    if (!contained) accepted.push(item);
  }
  return accepted.sort((a, b) => a.match.offset - b.match.offset || b.match.length - a.match.length);
}

function checkerDeclassificationDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const declassificationSignal =
      check.category === "declassification" ||
      ["declassification_status", "release_apparatus_basis", "editorial_method_basis"].includes(check.evidence_request) ||
      /^FAS-(?:DEC|EDM)-\d{3}$/.test(check.rule_id || "");
    if (!declassificationSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_declassification_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) {
    return "cross_volume_declassification";
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
    return `Matched approved declassification/omission phrase for ${record.document_id} ${record.unit_scope}.`;
  }
  if (status === "cross_volume_declassification") {
    return `Matched declassification/omission language tied to ${record.volume_id}; confirm target volume before changing withholding, excision, page-count, or review-statistics language.`;
  }
  if (status === "needs_declassification_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; review outcome, omitted quantity, and source-note basis are needed before direct edits.`;
  }
  return `Matched a declassification/omission variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const rawMatches = [];
  for (const record of registry.records || []) {
    const explicitForms = [record.approved_phrase, ...(record.variant_forms || [])];
    const approved = findMatches(text, record.approved_phrase, "approved_phrase", explicitForms);
    const variants = (record.variant_forms || []).flatMap((form) =>
      findMatches(text, form, "variant_form", explicitForms)
    );
    for (const match of [...approved, ...variants]) rawMatches.push({ record, match });
  }
  return suppressContainedMatches(rawMatches).map(({ record, match }) => {
    const status = usageStatus({ record, match, targetVolume });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      declassification_id: record.declassification_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      declassification_type: record.declassification_type,
      approved_phrase: record.approved_phrase,
      quantity: record.quantity,
      quantity_unit: record.quantity_unit,
      review_outcome: record.review_outcome,
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, record, match),
      source_or_context: record.source_or_context,
      source_url: record.source_url,
      verification_status: record.verification_status
    };
  });
}

function isDeclassificationLikeUnit(unit) {
  return DECLASSIFICATION_UNIT_TYPES.has(unit.unit_type) && DECLASSIFICATION_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status === "approved" && replacement === normalizeForm(usage.approved_phrase)) {
      return true;
    }
  }
  return false;
}

function auditDeclassification({ unitsDocument, registry, checkerOutput, targetVolume }) {
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
        declassification_usages: 0,
        warnings: 0,
        unmatched_declassification_like_units: 0,
        direct_declassification_edit_conflicts: 0,
        by_usage_status: {},
        by_declassification_type: {}
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
    if (unitUsages.length === 0 && isDeclassificationLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_declassification_like_unit",
        finding: "Declassification/omission unit had no match in the supplied declassification registry.",
        recommended_action: "comment_only",
        evidence_request: "declassification_status"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerDeclassificationDirectEdits(checkerOutput);
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
          finding: "Direct declassification/omission edit lacks a target-volume approved registry match.",
          required_action: "Downgrade to comment_only until withholding result, omitted quantity, source-note basis, and volume review statistics are supplied."
        });
      }
    }
  }

  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    declassification_usages: usages.length,
    warnings: warnings.length,
    unmatched_declassification_like_units: unmatched,
    direct_declassification_edit_conflicts: directConflicts.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_declassification_type: countBy(usages.map((usage) => usage.declassification_type))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return { status, errors: hardErrors, warnings, summary, usages, diagnostics, direct_edit_conflicts: directConflicts };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS declassification usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS declassification usage audit ${result.status}: ${result.summary.declassification_usages} matches across ${result.summary.units_scanned} units.`
    );
    lines.push(
      `Variants/cross-volume/context warnings: ${result.summary.warnings}; unmatched declassification-like units: ${result.summary.unmatched_declassification_like_units}.`
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
  const audit = auditDeclassification({ unitsDocument, registry, checkerOutput, targetVolume: options.targetVolume });
  const result = {
    schema_version: "frus-declassification-usage-audit-v1",
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
  console.error(`FRUS declassification usage audit failed: ${error.message}`);
  process.exit(1);
}
