#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const CLASSIFICATION_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "attachment_note",
  "declassification_note",
  "unknown_editorial_text"
]);
const RELEASE_STATUS_PATTERN =
  /\b(?:declassified|sanitized|redacted|released in full|released in part|withheld|excised|not declassified|declassification review)\b/i;
const CLASSIFICATION_LIKE_PATTERN =
  /\b(?:top secret|secret|confidential|sensitive|eyes only|not for the system|noforn|nodis|exdis|no classification(?: marking)?|declassified|released in full|released in part|sanitized|redacted)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-classification-usage.mjs --units <extracted-units.json|-> --registry <classification-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
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
  if (!isPlainObject(registry)) return ["registry: expected classification-registry object"];
  if (registry.schema_version !== "frus-classification-registry-v1") {
    errors.push("registry.schema_version: must be frus-classification-registry-v1");
  }
  if (typeof registry.classification_registry_id !== "string" || registry.classification_registry_id.length === 0) {
    errors.push("registry.classification_registry_id: expected non-empty string");
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
      "classification_item_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "approved_marking",
      "source_note_basis",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    for (const key of ["marking_components", "handling_controls", "variant_forms", "direct_edit_safe_variants"]) {
      if (!Array.isArray(record[key])) errors.push(`${label}.${key}: expected array`);
    }
    if (typeof record.classification_item_id === "string") {
      if (seen.has(record.classification_item_id)) errors.push(`${label}.classification_item_id: duplicate ${record.classification_item_id}`);
      seen.add(record.classification_item_id);
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

function checkerClassificationDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const classificationSignal =
      check.category === "classification_handling" ||
      check.evidence_request === "classification_marking" ||
      check.evidence_request === "declassification_status" ||
      /^FAS-CLS-\d{3}$/.test(check.rule_id || "");
    if (!classificationSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_classification_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) {
    return "cross_volume_classification";
  }
  if (match.match_kind === "direct_edit_safe_variant") {
    return "safe_variant_normalization";
  }
  if (match.match_kind.startsWith("approved_")) {
    return "approved";
  }
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" || status === "safe_variant_normalization" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") return `Matched approved classification/handling marking for ${record.document_id}.`;
  if (status === "safe_variant_normalization") {
    return `Matched a safe variant for ${record.document_id}; direct edit may normalize only to ${JSON.stringify(record.approved_marking)}.`;
  }
  if (status === "cross_volume_classification") {
    return `Matched classification evidence tied to ${record.volume_id}; confirm the target volume and source note before changing marking text.`;
  }
  if (status === "needs_classification_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; source-image proof is needed before direct edits.`;
  }
  return `Matched a classification/handling variant; review against the approved form ${JSON.stringify(record.approved_marking)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const rawMatches = [];
  for (const record of registry.records || []) {
    const approved = findMatches(text, record.approved_marking, "approved_marking");
    const variants = (record.variant_forms || []).flatMap((form) =>
      findMatches(text, form, "variant_form", [record.approved_marking])
    );
    const safeVariants = (record.direct_edit_safe_variants || []).flatMap((form) =>
      findMatches(text, form, "direct_edit_safe_variant", [record.approved_marking, ...(record.variant_forms || [])])
    );
    for (const match of [...approved, ...variants, ...safeVariants]) {
      rawMatches.push({ record, match });
    }
  }
  return suppressContainedMatches(rawMatches).map(({ record, match }) => {
    const status = usageStatus({ record, match, targetVolume });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      classification_item_id: record.classification_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      approved_marking: record.approved_marking,
      marking_components: record.marking_components || [],
      handling_controls: record.handling_controls || [],
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

function isClassificationLikeUnit(unit) {
  return CLASSIFICATION_UNIT_TYPES.has(unit.unit_type) && CLASSIFICATION_LIKE_PATTERN.test(unitText(unit));
}

function releaseStatusDiagnostic(unit) {
  if (!RELEASE_STATUS_PATTERN.test(unitText(unit))) return null;
  return {
    unit_id: unit.unit_id,
    unit_type: unit.unit_type,
    location: unit.location || "",
    diagnostic_type: "release_status_confusion",
    finding: "Release/declassification language appears where original classification marking evidence is required.",
    recommended_action: "comment_only",
    evidence_request: "classification_marking"
  };
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    const approved = normalizeForm(usage.approved_marking);
    if ((usage.usage_status === "approved" || usage.usage_status === "safe_variant_normalization") && replacement === approved) {
      return true;
    }
  }
  return false;
}

function auditClassification({ unitsDocument, registry, checkerOutput, targetVolume }) {
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
        classification_usages: 0,
        warnings: 0,
        release_status_confusions: 0,
        unmatched_classification_like_units: 0,
        direct_classification_edit_conflicts: 0,
        by_usage_status: {}
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
  let releaseStatusConfusions = 0;

  for (const unit of unitsDocument.units) {
    const unitUsages = registryMatchesForUnit(unit, registry, targetVolume);
    if (unitUsages.length > 0) {
      usages.push(...unitUsages);
      usagesByUnit.set(unit.unit_id, unitUsages);
      for (const usage of unitUsages) {
        if (usage.recommended_action === "comment_only") warnings.push(`${usage.unit_id}: ${usage.finding}`);
      }
    }
    const releaseDiagnostic = releaseStatusDiagnostic(unit);
    if (releaseDiagnostic) {
      releaseStatusConfusions += 1;
      diagnostics.push(releaseDiagnostic);
      warnings.push(`${unit.unit_id}: ${releaseDiagnostic.finding}`);
    }
    if (unitUsages.length === 0 && isClassificationLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_classification_like_unit",
        finding: "Classification-like unit had no match in the supplied classification registry.",
        recommended_action: "comment_only",
        evidence_request: "classification_marking"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerClassificationDirectEdits(checkerOutput);
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
          finding: "Direct classification/handling edit lacks a target-volume approved registry match or safe normalization target.",
          required_action: "Downgrade to comment_only until original marking evidence is supplied."
        });
      }
    }
  }

  const statusCounts = countBy(usages.map((usage) => usage.usage_status));
  const summary = {
    units_scanned: unitsDocument.units.length,
    classification_usages: usages.length,
    warnings: warnings.length,
    release_status_confusions: releaseStatusConfusions,
    unmatched_classification_like_units: unmatched,
    direct_classification_edit_conflicts: directConflicts.length,
    by_usage_status: statusCounts
  };
  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return { status, errors: hardErrors, warnings, summary, usages, diagnostics, direct_edit_conflicts: directConflicts };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS classification usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS classification usage audit ${result.status}: ${result.summary.classification_usages} matches across ${result.summary.units_scanned} units.`
    );
    lines.push(
      `Variants/cross-volume/context warnings: ${result.summary.warnings}; release-status confusions: ${result.summary.release_status_confusions}; unmatched classification-like units: ${result.summary.unmatched_classification_like_units}.`
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
  const audit = auditClassification({ unitsDocument, registry, checkerOutput, targetVolume: options.targetVolume });
  const result = {
    schema_version: "frus-classification-usage-audit-v1",
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
  console.error(`FRUS classification usage audit failed: ${error.message}`);
  process.exit(1);
}
