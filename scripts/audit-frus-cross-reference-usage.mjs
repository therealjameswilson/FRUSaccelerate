#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const CROSS_REFERENCE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "front_matter",
  "unknown_editorial_text"
]);
const CROSS_REFERENCE_PATTERN =
  /\b(?:see (?:document|footnote|foreign relations|appendix|attachment|tab|tabs)|scheduled for publication|also printed in|printed in foreign relations|for the record of|additional documentation|documentation on|cross[- ]reference|xref|slug|clue)\b/i;
const CROSS_REFERENCE_DIRECT_EDIT_PATTERN =
  /\b(?:see (?:document|footnote|foreign relations|appendix|attachment|tab|tabs)|scheduled for publication|also printed in|printed in foreign relations|for the record of|additional documentation|documentation on|cross[- ]reference|target document|target volume|document number)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-cross-reference-usage.mjs --units <extracted-units.json|-> --registry <cross-reference-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
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
  if (!isPlainObject(registry)) return ["registry: expected cross-reference-registry object"];
  if (registry.schema_version !== "frus-cross-reference-registry-v1") {
    errors.push("registry.schema_version: must be frus-cross-reference-registry-v1");
  }
  if (typeof registry.cross_reference_registry_id !== "string" || registry.cross_reference_registry_id.length === 0) {
    errors.push("registry.cross_reference_registry_id: expected non-empty string");
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
      "cross_reference_id",
      "volume_id",
      "source_document_id",
      "source_document_number",
      "source_unit_label",
      "reference_type",
      "approved_phrase",
      "target_volume_id",
      "target_document_id",
      "target_document_number",
      "target_footnote",
      "target_chapter_or_part",
      "direction",
      "publication_status",
      "cross_reference_basis",
      "source_url",
      "target_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (!Array.isArray(record.required_slug_elements)) errors.push(`${label}.required_slug_elements: expected array`);
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.cross_reference_id === "string") {
      if (seen.has(record.cross_reference_id)) {
        errors.push(`${label}.cross_reference_id: duplicate ${record.cross_reference_id}`);
      }
      seen.add(record.cross_reference_id);
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

function checkerCrossReferenceDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const reviewText = [
      check.category,
      check.evidence_request,
      check.rule_id,
      check.finding,
      check.original_text,
      check.replacement_text,
      check.comment_text,
      check.verification_target
    ]
      .filter(Boolean)
      .join(" ");
    const crossReferenceSignal =
      ["citation", "attachment", "volume_preparation_scope"].includes(check.category) ||
      ["cross_reference", "document_number", "publication_status"].includes(check.evidence_request) ||
      /^FAS-XREF-\d{3}$/.test(check.rule_id || "") ||
      CROSS_REFERENCE_DIRECT_EDIT_PATTERN.test(reviewText);
    if (!crossReferenceSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_cross_reference_context";
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_cross_reference";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved cross-reference phrase for ${record.volume_id} ${record.reference_type}.`;
  }
  if (status === "cross_volume_cross_reference") {
    return `Matched cross-reference language tied to ${record.volume_id}; confirm source volume, target document, target volume, and direction before changing the reference.`;
  }
  if (status === "needs_cross_reference_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; cross-reference basis is needed before direct edits.`;
  }
  return `Matched a cross-reference variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
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
      cross_reference_id: record.cross_reference_id,
      volume_id: record.volume_id,
      source_document_id: record.source_document_id,
      source_document_number: record.source_document_number,
      source_unit_label: record.source_unit_label,
      reference_type: record.reference_type,
      approved_phrase: record.approved_phrase,
      target_volume_id: record.target_volume_id,
      target_document_id: record.target_document_id,
      target_document_number: record.target_document_number,
      target_footnote: record.target_footnote,
      target_chapter_or_part: record.target_chapter_or_part,
      direction: record.direction,
      publication_status: record.publication_status,
      required_slug_elements: record.required_slug_elements || [],
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, record, match),
      cross_reference_basis: record.cross_reference_basis,
      source_url: record.source_url,
      target_url: record.target_url,
      verification_status: record.verification_status
    };
  });
}

function isCrossReferenceLikeUnit(unit) {
  return CROSS_REFERENCE_UNIT_TYPES.has(unit.unit_type) && CROSS_REFERENCE_PATTERN.test(unitText(unit));
}

function slugDiagnosticsForUnit(unit) {
  const text = unitText(unit);
  if (!/\b(?:xref|cross[- ]reference|slug|clue)\b/i.test(text)) return [];
  const missing = [];
  if (!/\b(?:19|20)\d{2}-\d{2}-\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i.test(text)) {
    missing.push("date");
  }
  if (!/\b(?:from|to|sender|recipient|author|addressee|->|=>)\b/i.test(text)) {
    missing.push("sender_recipient");
  }
  if (!/\b(?:telegram|memorandum|letter|editorial note|message|minutes|paper|document)\b/i.test(text)) {
    missing.push("type");
  }
  if (!/\b(?:above|below|chapter|same volume|same-volume|other volume|inter-volume|intra-volume)\b/i.test(text)) {
    missing.push("direction_or_chapter");
  }
  if (missing.length === 0) return [];
  return [
    {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      diagnostic_type: "incomplete_cross_reference_slug",
      missing_slug_elements: missing,
      finding:
        "Cross-reference slug or clue is incomplete; it should carry date, sender/recipient, document type, and above/below/chapter or volume direction before it is used for a direct edit.",
      recommended_action: "comment_only",
      evidence_request: "cross_reference"
    }
  ];
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

function auditCrossReferences({ unitsDocument, registry, checkerOutput, targetVolume, failOnWarning }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-cross-reference-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        cross_reference_usages: 0,
        warnings: 0,
        unmatched_cross_reference_like_units: 0,
        incomplete_cross_reference_slug_units: 0,
        direct_cross_reference_edit_conflicts: 0,
        by_usage_status: {},
        by_reference_type: {}
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
    const slugDiagnostics = slugDiagnosticsForUnit(unit);
    if (slugDiagnostics.length > 0) {
      diagnostics.push(...slugDiagnostics);
      for (const diagnostic of slugDiagnostics) warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
    if (unitUsages.length === 0 && slugDiagnostics.length === 0 && isCrossReferenceLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_cross_reference_like_unit",
        finding:
          "Cross-reference, related-volume, scheduled-publication, appendix/tab, or `See Document` unit had no match in the supplied cross-reference registry.",
        recommended_action: "comment_only",
        evidence_request: "cross_reference"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directConflicts = [];
  for (const [unitId, checks] of checkerCrossReferenceDirectEdits(checkerOutput).entries()) {
    const unitUsages = usagesByUnit.get(unitId) || [];
    for (const check of checks) {
      if (!directEditSupported(check, unitUsages)) {
        directConflicts.push({
          unit_id: unitId,
          rule_id: check.rule_id || "",
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding: "Direct cross-reference edit lacks a target-volume approved registry match.",
          required_action:
            "Downgrade to comment_only until source document, target document or volume, target footnote/tab/chapter, direction, date, sender/recipient, and document type are supplied."
        });
      }
    }
  }

  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  if (failOnWarning && warnings.length > 0) {
    hardErrors.push(...warnings.map((warning) => `warning escalated: ${warning}`));
  }
  const summary = {
    units_scanned: unitsDocument.units.length,
    cross_reference_usages: usages.length,
    warnings: warnings.length,
    unmatched_cross_reference_like_units: unmatched,
    incomplete_cross_reference_slug_units: diagnostics.filter(
      (diagnostic) => diagnostic.diagnostic_type === "incomplete_cross_reference_slug"
    ).length,
    direct_cross_reference_edit_conflicts: directConflicts.length,
    by_usage_status: countBy(usages.map((item) => item.usage_status)),
    by_reference_type: countBy(usages.map((item) => item.reference_type))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-cross-reference-usage-audit-v1",
    status,
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
    lines.push(`FRUS cross-reference usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS cross-reference usage audit ${result.status}: ${result.summary.cross_reference_usages} usages, ${result.summary.unmatched_cross_reference_like_units} unmatched cross-reference-like units, ${result.summary.incomplete_cross_reference_slug_units} incomplete slugs.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditCrossReferences({
    unitsDocument: readJson(options.unitsPath, "units"),
    registry: readJson(options.registryPath, "registry"),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath, "checker_output") : null,
    targetVolume: options.targetVolume,
    failOnWarning: options.failOnWarning
  });
  if (options.format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS cross-reference usage audit failed: ${error.message}`);
  process.exit(1);
}
