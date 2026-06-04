#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const TIME_ZONE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_heading",
  "front_matter",
  "unknown_editorial_text"
]);
const TIME_ZONE_PATTERN =
  /\b(?:Washington time|local time|Greenwich Mean Time|GMT|Zulu|[0-9]{3,4}Z|EST|EDT|date-time group|as of [0-9]{3,4}|open of business|a\.m\.|p\.m\.|no indication as to when precisely|telephone calls took place|meeting took place|from [0-9]{1,2}:[0-9]{2}|until [0-9]{1,2}:[0-9]{2}|lasting from|convert(?:ed|ing)?|time zone)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-time-zone-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
  let targetVolume = "";
  let format = "text";
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
    } else {
      usage();
    }
  }
  if (!unitsPath || !registryPath || !new Set(["text", "json"]).has(format)) usage();
  return { unitsPath, registryPath, checkerOutputPath, targetVolume, format };
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function normalizeForm(value) {
  return String(value || "")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
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
  if (!Array.isArray(unitsDocument.units)) errors.push("units.units: expected array");
  return errors;
}

function validateRegistry(registry) {
  const errors = [];
  if (!isPlainObject(registry)) return ["registry: expected object"];
  if (registry.schema_version !== "frus-time-zone-registry-v1") {
    errors.push("registry.schema_version: must be frus-time-zone-registry-v1");
  }
  if (!Array.isArray(registry.records)) errors.push("registry.records: expected array");
  return errors;
}

function validateOutput(output) {
  if (!output) return [];
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  const errors = [];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
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
    const exactDuplicate = matches.some((item) => item.offset === (match.index || 0) && item.matched_text === match[0]);
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

function checkerTimeZoneDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const timeZoneSignal =
      ["time_zone_chronology", "chronology", "communications_record", "treaty_legal_instrument", "summit_public_event"].includes(
        check.category
      ) ||
      ["time_zone_basis", "communications_metadata", "chronology", "event_chronology", "treaty_component"].includes(
        check.evidence_request
      ) ||
      /^FAS-(?:TIME|TZ|CHRON)-\d{3}$/.test(check.rule_id || "") ||
      TIME_ZONE_PATTERN.test(`${check.original_text || ""}\n${check.replacement_text || ""}`);
    if (!timeZoneSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_time_zone_context";
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_time_zone";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved time-zone chronology phrase for ${record.document_id} ${record.time_claim_type}.`;
  }
  if (status === "cross_volume_time_zone") {
    return `Matched time-zone/date-time language tied to ${record.volume_id}; confirm target volume before changing Z/GMT/local/Washington labels, conversions, deadlines, or chronological placement.`;
  }
  if (status === "needs_time_zone_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; time-zone basis is needed before direct edits.`;
  }
  return `Matched a time-zone chronology variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const rawMatches = [];
  for (const record of registry.records || []) {
    const explicitForms = [record.approved_phrase, ...(record.variant_forms || [])];
    const approved = findMatches(text, record.approved_phrase, "approved_phrase", explicitForms);
    const variants = (record.variant_forms || []).flatMap((form) => findMatches(text, form, "variant_form", explicitForms));
    for (const match of [...approved, ...variants]) rawMatches.push({ record, match });
  }
  return suppressContainedMatches(rawMatches).map(({ record, match }) => {
    const status = usageStatus({ record, match, targetVolume });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      time_zone_item_id: record.time_zone_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      time_claim_type: record.time_claim_type,
      approved_phrase: record.approved_phrase,
      source_time_basis: record.source_time_basis,
      display_time: record.display_time,
      conversion_status: record.conversion_status,
      chronological_placement: record.chronological_placement,
      event_or_document_context: record.event_or_document_context,
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, record, match),
      source_url: record.source_url,
      verification_status: record.verification_status
    };
  });
}

function isTimeZoneLikeUnit(unit) {
  return TIME_ZONE_UNIT_TYPES.has(unit.unit_type) && TIME_ZONE_PATTERN.test(unitText(unit));
}

function replacementContainsApprovedEvidence(check, usage) {
  const replacement = normalizeForm(check.replacement_text || "");
  if (!replacement) return false;
  const approvedPieces = [
    usage.approved_phrase,
    usage.display_time,
    usage.source_time_basis,
    usage.conversion_status,
    usage.chronological_placement
  ]
    .map(normalizeForm)
    .filter(Boolean);
  return approvedPieces.some((piece) => replacement === piece || replacement.includes(piece));
}

function directEditSupported(check, unitUsages) {
  return unitUsages.some((usage) => usage.usage_status === "approved" && replacementContainsApprovedEvidence(check, usage));
}

function auditTimeZones({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-time-zone-usage-audit-v1",
      status: "fail",
      target_volume: targetVolume,
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        time_zone_usages: 0,
        warnings: 0,
        unmatched_time_zone_like_units: 0,
        direct_time_zone_edit_conflicts: 0,
        by_usage_status: {},
        by_time_claim_type: {},
        by_conversion_status: {}
      },
      usages: [],
      diagnostics: [],
      direct_edit_conflicts: []
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
      for (const item of unitUsages) {
        if (item.recommended_action === "comment_only") warnings.push(`${item.unit_id}: ${item.finding}`);
      }
    }
    if (unitUsages.length === 0 && isTimeZoneLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_time_zone_like_unit",
        finding:
          "Time-zone, date-time-group, Z/GMT/local/Washington-time, no-precise-time, deadline, or conversion language had no match in the supplied time-zone registry.",
        recommended_action: "comment_only",
        evidence_request: "time_zone_basis"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directConflicts = [];
  for (const [unitId, checks] of checkerTimeZoneDirectEdits(checkerOutput).entries()) {
    const unitUsages = usagesByUnit.get(unitId) || [];
    for (const check of checks) {
      if (!directEditSupported(check, unitUsages)) {
        directConflicts.push({
          unit_id: unitId,
          rule_id: check.rule_id || "",
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding: "Direct time-zone or date-time edit lacks a target-volume approved registry match.",
          required_action:
            "Downgrade to comment_only until Z/GMT/local/Washington label, date-time group, conversion, deadline, ambiguity caveat, and chronological-placement basis are supplied."
        });
      }
    }
  }

  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    time_zone_usages: usages.length,
    warnings: warnings.length,
    unmatched_time_zone_like_units: unmatched,
    direct_time_zone_edit_conflicts: directConflicts.length,
    by_usage_status: countBy(usages.map((item) => item.usage_status)),
    by_time_claim_type: countBy(usages.map((item) => item.time_claim_type)),
    by_conversion_status: countBy(usages.map((item) => item.conversion_status))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-time-zone-usage-audit-v1",
    status,
    target_volume: targetVolume,
    errors: hardErrors,
    warnings,
    summary,
    usages,
    diagnostics,
    direct_edit_conflicts: directConflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS time-zone usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS time-zone usage audit ${result.status}: ${result.summary.time_zone_usages} matches across ${result.summary.units_scanned} units.`
    );
    lines.push(`Warnings: ${result.summary.warnings}; unmatched time-zone-like units: ${result.summary.unmatched_time_zone_like_units}.`);
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditTimeZones({
    unitsDocument: readJson(options.unitsPath),
    registry: readJson(options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath) : null,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS time-zone usage audit failed: ${error.message}`);
  process.exit(1);
}
