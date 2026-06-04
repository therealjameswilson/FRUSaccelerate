#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_text",
  "transcribed_document_text",
  "quoted_document_text",
  "unknown_editorial_text"
]);
const PROTECTED_TEXT_UNIT_TYPES = new Set(["document_text", "transcribed_document_text", "quoted_document_text"]);
const EDITORIAL_METHOD_PATTERN =
  /\b(?:all brackets are in the original|brackets are in the original|brackets and ellipses are in the original|ellipses are in the original|footnote is in the original|underlined|underlining|italics|sic|misspell(?:ed|ing)|spelling|punctuation|capitalization|contraction|abbreviation|bracketed correction|bracketed addition|document text|original text)\b/i;
const RISKY_TEXT_CHANGE_PATTERN =
  /\b(?:spell(?:ing|check)?|grammar|punctuation|capitalization|moderniz(?:e|ed|ing)|standardiz(?:e|ed|ing)|clean(?:ed)? up|typo|contraction|abbreviation|bracket|ellipsis|underlin|italics|telegram number|SECTO|TOSEC|Secto|Tosec)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-editorial-method-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume VOLUME-ID] [--format text|json]"
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

function readJson(file, label) {
  const text = fs.readFileSync(file, "utf8");
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
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
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
  if (!isPlainObject(registry)) return ["registry: expected editorial-method-registry object"];
  if (registry.schema_version !== "frus-editorial-method-registry-v1") {
    errors.push("registry.schema_version: must be frus-editorial-method-registry-v1");
  }
  if (!Array.isArray(registry.records)) errors.push("registry.records: expected array");
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!output) return errors;
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function registryForms(registry) {
  const forms = [];
  for (const record of registry.records || []) {
    for (const form of [record.approved_phrase, ...(record.variant_forms || [])]) {
      if (!String(form || "").trim()) continue;
      forms.push({ form, normalized_form: normalizeForm(form), record });
    }
  }
  return forms;
}

function makeLiteralPattern(form) {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}\\.?(?![A-Za-z0-9])`, "gi");
}

function suppressContainedMatches(matches) {
  const sorted = matches
    .slice()
    .sort((a, b) => b.length - a.length || a.offset - b.offset || a.editorial_method_id.localeCompare(b.editorial_method_id));
  const accepted = [];
  for (const match of sorted) {
    const start = match.offset;
    const end = match.offset + match.length;
    const contained = accepted.some((item) => {
      const itemStart = item.offset;
      const itemEnd = item.offset + item.length;
      return start >= itemStart && end <= itemEnd;
    });
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || a.editorial_method_id.localeCompare(b.editorial_method_id));
}

function approvedMatchesForUnit(unit, forms, targetVolume) {
  const text = unitText(unit);
  const matches = [];
  const seen = new Set();
  for (const item of forms) {
    const pattern = makeLiteralPattern(item.form);
    for (const match of text.matchAll(pattern)) {
      const key = `${item.record.editorial_method_id}:${match.index}:${match[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const isApprovedPhrase = normalizeForm(match[0]) === normalizeForm(item.record.approved_phrase);
      const isTargetVolume = !targetVolume || item.record.volume_id === targetVolume;
      matches.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        editorial_method_id: item.record.editorial_method_id,
        volume_id: item.record.volume_id,
        document_id: item.record.document_id,
        document_number: item.record.document_number,
        unit_scope: item.record.unit_scope,
        method_type: item.record.method_type,
        approved_phrase: item.record.approved_phrase,
        matched_text: match[0],
        match_kind: isApprovedPhrase ? "approved_phrase" : "variant_form",
        usage_status: isTargetVolume ? (isApprovedPhrase ? "approved" : "variant_needs_review") : "cross_volume_editorial_method_context",
        protected_text_or_feature: item.record.protected_text_or_feature,
        editorial_method_basis: item.record.editorial_method_basis,
        direct_edit_rule: item.record.direct_edit_rule,
        source_or_context: item.record.source_or_context,
        source_url: item.record.source_url,
        verification_status: item.record.verification_status,
        offset: match.index || 0,
        length: match[0].length
      });
    }
  }
  return suppressContainedMatches(matches);
}

function appliesToUnit(unit) {
  return UNIT_TYPES.has(unit.unit_type) || EDITORIAL_METHOD_PATTERN.test(unitText(unit));
}

function directEditTouchesEditorialMethod(check, unit) {
  const text = [
    check.original_text || "",
    check.replacement_text || "",
    check.finding || "",
    check.standard || "",
    check.comment_text || "",
    unit?.unit_type || ""
  ].join(" ");
  return (
    PROTECTED_TEXT_UNIT_TYPES.has(unit?.unit_type || "") ||
    EDITORIAL_METHOD_PATTERN.test(text) ||
    RISKY_TEXT_CHANGE_PATTERN.test(text) ||
    check.category === "editorial_method_transcription" ||
    check.evidence_request === "editorial_method_basis" ||
    /^FAS-EDM-\d{3}$/.test(check.rule_id || "")
  );
}

function directEditConflicts(output, registry, targetVolume, unitsById) {
  if (!output || !Array.isArray(output.checks)) return [];
  const approvedTargetForms = new Set(
    registryForms(registry)
      .filter((item) => !targetVolume || item.record.volume_id === targetVolume)
      .map((item) => normalizeForm(item.record.approved_phrase))
  );
  const conflicts = [];
  for (const check of output.checks) {
    if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const unit = unitsById.get(check.unit_id || "");
    if (!directEditTouchesEditorialMethod(check, unit)) continue;
    const replacementApproved = approvedTargetForms.has(normalizeForm(check.replacement_text || ""));
    if (!replacementApproved) {
      conflicts.push({
        unit_id: check.unit_id || "",
        rule_id: check.rule_id || "",
        unit_type: unit?.unit_type || "",
        original_text: check.original_text || "",
        replacement_text: check.replacement_text || "",
        finding: "Direct edit touches original document text or editorial-method apparatus without target-volume method authority.",
        required_action:
          "Downgrade to comment_only unless the source image, official transcript, or supplied editorial-method registry proves the exact direct edit."
      });
    }
  }
  return conflicts;
}

function auditEditorialMethod({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-editorial-method-usage-audit-v1",
      status: "fail",
      target_volume: targetVolume,
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        editorial_method_usages: 0,
        unmatched_editorial_method_like_units: 0,
        direct_editorial_method_edit_conflicts: 0,
        warnings: 0,
        by_usage_status: {},
        by_method_type: {}
      },
      usages: [],
      unmatched_units: [],
      direct_edit_conflicts: []
    };
  }

  const forms = registryForms(registry);
  const usages = [];
  const unmatchedUnits = [];
  const unitsById = new Map();
  for (const unit of unitsDocument.units) {
    unitsById.set(unit.unit_id, unit);
    if (!appliesToUnit(unit)) continue;
    const matches = approvedMatchesForUnit(unit, forms, targetVolume);
    if (matches.length > 0) {
      usages.push(...matches);
    } else if (EDITORIAL_METHOD_PATTERN.test(unitText(unit)) || PROTECTED_TEXT_UNIT_TYPES.has(unit.unit_type)) {
      unmatchedUnits.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        matched_text: unitText(unit).slice(0, 240),
        finding: "Original-text/editorial-method-like unit had no match in the supplied registry.",
        required_action:
          "Use comment_only and request source-image, official transcript, original-bracket, original-ellipsis, underlining/italic, or editorial-method basis before direct editing."
      });
    }
  }
  const conflicts = directEditConflicts(checkerOutput, registry, targetVolume, unitsById);
  const warnings = [
    ...usages
      .filter((usage) => usage.usage_status !== "approved")
      .map((usage) => `${usage.unit_id}: ${usage.usage_status} for ${usage.editorial_method_id}`),
    ...unmatchedUnits.map((unit) => `${unit.unit_id}: ${unit.finding}`)
  ];
  const hardErrors = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    editorial_method_usages: usages.length,
    unmatched_editorial_method_like_units: unmatchedUnits.length,
    direct_editorial_method_edit_conflicts: conflicts.length,
    warnings: warnings.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_method_type: countBy(usages.map((usage) => usage.method_type))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-editorial-method-usage-audit-v1",
    status,
    target_volume: targetVolume,
    errors: hardErrors,
    warnings,
    summary,
    usages,
    unmatched_units: unmatchedUnits,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS editorial-method usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS editorial-method usage audit ${result.status}: ${result.summary.editorial_method_usages} usages, ${result.summary.unmatched_editorial_method_like_units} unmatched original-text/editorial-method-like units, ${result.summary.direct_editorial_method_edit_conflicts} direct-edit conflicts.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditEditorialMethod({
    unitsDocument: readJson(options.unitsPath, options.unitsPath),
    registry: readJson(options.registryPath, options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS editorial-method usage audit failed: ${error.message}`);
  process.exit(1);
}
