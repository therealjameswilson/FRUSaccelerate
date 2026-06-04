#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const METADATA_UNIT_TYPES = new Set(["document_heading", "editorial_note", "front_matter"]);
const VERIFIED_PREFIX = "verified_";

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-document-metadata-usage.mjs --units <extracted-units.json|-> --registry <document-metadata-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
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
  if (!isPlainObject(registry)) return ["registry: expected document-metadata-registry object"];
  if (registry.schema_version !== "frus-document-metadata-registry-v1") {
    errors.push("registry.schema_version: must be frus-document-metadata-registry-v1");
  }
  if (typeof registry.document_metadata_registry_id !== "string" || registry.document_metadata_registry_id.length === 0) {
    errors.push("registry.document_metadata_registry_id: expected non-empty string");
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
      "document_metadata_id",
      "volume_id",
      "document_id",
      "document_number",
      "document_type",
      "approved_heading_form",
      "date_line",
      "subject_or_title",
      "sender_or_originator",
      "recipient_or_audience",
      "attachment_behavior",
      "source_note_basis",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.document_metadata_id === "string") {
      if (seen.has(record.document_metadata_id)) errors.push(`${label}.document_metadata_id: duplicate ${record.document_metadata_id}`);
      seen.add(record.document_metadata_id);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
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
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}(?![A-Za-z0-9])`, flags);
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
  const sorted = matches.slice().sort((a, b) => b.length - a.length || a.offset - b.offset);
  const accepted = [];
  for (const match of sorted) {
    const contained = accepted.some(
      (item) => match.offset >= item.offset && match.offset + match.length <= item.offset + item.length
    );
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || b.length - a.length);
}

function checkerMetadataDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const metadataSignal =
      check.category === "document_metadata" ||
      check.evidence_request === "document_metadata" ||
      check.evidence_request === "document_number" ||
      /^FAS-DM-\d{3}$/.test(check.rule_id || "");
    if (!metadataSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_document_metadata_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) {
    return "cross_volume_metadata";
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
    return `Matched approved ${record.document_type} metadata for ${record.document_id}.`;
  }
  if (status === "cross_volume_metadata") {
    return `Matched document metadata tied to ${record.volume_id}; confirm the target volume and document page before changing heading text.`;
  }
  if (status === "needs_document_metadata_context") {
    return `Matched ${record.document_type} metadata, but the registry record is not verified for final use.`;
  }
  if (match.match_kind === "case_or_punctuation_variant") {
    return `Matched a case or punctuation variant of approved document metadata ${JSON.stringify(record.approved_heading_form)}.`;
  }
  return `Matched a document-metadata variant; review against the approved heading ${JSON.stringify(record.approved_heading_form)}.`;
}

function metadataLikeTextWithoutHits(unit) {
  const text = unitText(unit);
  if (!METADATA_UNIT_TYPES.has(unit.unit_type)) return false;
  return /\b(?:Memorandum|Information Memorandum|Editorial Note|SUBJECT|Washington,|undated|Location and date uncertain|Document\s+\d+|\d+\.)\b/i.test(text);
}

function normalizedIncludes(text, form) {
  const normalizedForm = normalizeForm(form);
  if (!normalizedForm) return true;
  return normalizeForm(text).includes(normalizedForm);
}

function recordFormEntries(record) {
  return [
    { form: record.approved_heading_form, kind: "approved_heading_form" },
    { form: record.date_line, kind: "approved_date_line" },
    { form: record.subject_or_title, kind: "approved_subject_or_title" },
    ...(record.variant_forms || []).map((form) => ({ form, kind: "variant_form" }))
  ].filter((entry) => String(entry.form || "").trim());
}

function buildDocumentMetadataAudit({ unitsDocument, registry, checkerOutput, targetVolume, sourceFiles }) {
  const errors = [];
  const warnings = [];
  const directEditsByUnit = checkerMetadataDirectEdits(checkerOutput);
  const usages = [];
  const unitsWithHits = new Set();

  for (const unit of unitsDocument.units) {
    const text = unitText(unit);
    for (const record of registry.records) {
      const formEntries = recordFormEntries(record);
      const explicitForms = formEntries.map((entry) => entry.form);
      const rawMatches = [];
      for (const entry of formEntries) {
        for (const match of findMatches(text, entry.form, entry.kind, explicitForms)) rawMatches.push(match);
      }
      for (const match of suppressContainedMatches(rawMatches)) {
        const status = usageStatus({ record, match, targetVolume });
        const directEditChecks = directEditsByUnit.get(unit.unit_id) || [];
        const directEditRequested = directEditChecks.length > 0;
        const usage = {
          usage_id: `document-metadata-usage-${String(usages.length + 1).padStart(4, "0")}`,
          unit_id: unit.unit_id,
          unit_type: unit.unit_type,
          location: unit.location || "",
          document_metadata_id: record.document_metadata_id,
          volume_id: record.volume_id,
          target_volume: targetVolume,
          document_id: record.document_id,
          document_number: record.document_number,
          document_type: record.document_type,
          matched_text: match.matched_text,
          match_kind: match.match_kind,
          approved_heading_form: record.approved_heading_form,
          date_line: record.date_line,
          subject_or_title: record.subject_or_title,
          sender_or_originator: record.sender_or_originator,
          recipient_or_audience: record.recipient_or_audience,
          attachment_behavior: record.attachment_behavior,
          source_note_basis: record.source_note_basis,
          source_url: record.source_url,
          verification_status: record.verification_status,
          usage_status: status,
          recommended_action: actionForStatus(status),
          evidence_request: status === "approved" ? "none" : "document_metadata",
          evidence_request_detail:
            status === "approved"
              ? ""
              : "Confirm the target volume's document page, heading, date line, subject/title, source note, and attachment behavior before direct redline.",
          direct_edit_requested: directEditRequested,
          direct_edit_check_count: directEditChecks.length,
          finding: findingForStatus(status, record, match)
        };
        usages.push(usage);
        unitsWithHits.add(unit.unit_id);
        if (status !== "approved") warnings.push(`${unit.unit_id}: ${usage.finding}`);
        if (directEditRequested && status !== "approved") {
          errors.push(`${unit.unit_id}: direct document-metadata edit requested while usage status is ${status}`);
        }
      }
    }
  }

  const componentGaps = [];
  const metadataUnitRecordPairs = new Map();
  for (const usage of usages) {
    if (!["document_heading", "editorial_note"].includes(usage.unit_type)) continue;
    const key = `${usage.unit_id}\u0000${usage.document_metadata_id}`;
    const existing = metadataUnitRecordPairs.get(key) || {
      unit_id: usage.unit_id,
      document_metadata_id: usage.document_metadata_id,
      unit_type: usage.unit_type,
      location: usage.location,
      record: registry.records.find((record) => record.document_metadata_id === usage.document_metadata_id),
      match_kinds: new Set()
    };
    existing.match_kinds.add(usage.match_kind);
    metadataUnitRecordPairs.set(key, existing);
  }

  for (const pair of metadataUnitRecordPairs.values()) {
    const record = pair.record;
    if (!record || !String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) continue;
    if (targetVolume && record.volume_id !== targetVolume) continue;
    const unit = unitsDocument.units.find((item) => item.unit_id === pair.unit_id);
    if (!unit) continue;
    const text = unitText(unit);
    const gaps = [];
    if (record.approved_heading_form && !normalizedIncludes(text, record.approved_heading_form)) gaps.push("approved_heading_form");
    if (record.date_line && !normalizedIncludes(text, record.date_line)) gaps.push("date_line");
    if (record.subject_or_title && record.document_type !== "editorial_note" && !normalizedIncludes(text, record.subject_or_title)) {
      gaps.push("subject_or_title");
    }
    for (const component of gaps) {
      const gap = {
        unit_id: pair.unit_id,
        unit_type: pair.unit_type,
        location: pair.location,
        document_metadata_id: record.document_metadata_id,
        document_id: record.document_id,
        document_number: record.document_number,
        component,
        evidence_request: "document_metadata",
        finding: `Document metadata match is missing required ${component.replace(/_/g, " ")} for ${record.document_id}.`,
        required_action:
          "Confirm the target document page and complete the heading, date line, and subject/title block before treating the document metadata as final."
      };
      componentGaps.push(gap);
      warnings.push(`${gap.unit_id}: ${gap.finding}`);
    }
  }

  const componentGapUnits = new Set(componentGaps.map((gap) => gap.unit_id));
  for (const [unitId] of directEditsByUnit) {
    if (componentGapUnits.has(unitId)) {
      errors.push(`${unitId}: direct document-metadata edit requested while required heading/date/subject components are missing`);
    }
  }

  const unmatched_metadata_units = unitsDocument.units
    .filter((unit) => !unitsWithHits.has(unit.unit_id))
    .filter(metadataLikeTextWithoutHits)
    .map((unit) => ({
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      evidence_request: "document_metadata",
      finding: "Metadata-like unit had no match in the supplied document-metadata registry."
    }));
  for (const unit of unmatched_metadata_units) warnings.push(`${unit.unit_id}: ${unit.finding}`);

  for (const [unitId] of directEditsByUnit) {
    if (!unitsWithHits.has(unitId)) {
      errors.push(`${unitId}: direct document-metadata edit requested but no supplied registry metadata matched the unit`);
    }
  }

  const resultStatus = errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-document-metadata-usage-audit-v1",
    generated_at: new Date().toISOString(),
    status: resultStatus,
    target_volume: targetVolume,
    source_files: sourceFiles,
    document_metadata_registry: {
      document_metadata_registry_id: registry.document_metadata_registry_id || "",
      captured_at: registry.captured_at || "",
      source_urls: registry.source_urls || [],
      records: registry.records.length
    },
    summary: {
      units_scanned: unitsDocument.units.length,
      units_with_document_metadata_hits: unitsWithHits.size,
      document_metadata_usages: usages.length,
      metadata_component_gaps: componentGaps.length,
      by_component_gap: countBy(componentGaps.map((item) => item.component)),
      unmatched_metadata_units: unmatched_metadata_units.length,
      by_document_type: countBy(usages.map((item) => item.document_type)),
      by_usage_status: countBy(usages.map((item) => item.usage_status)),
      warnings: warnings.length,
      errors: errors.length,
      direct_document_metadata_edit_conflicts: errors.filter((error) => error.includes("direct document-metadata edit")).length
    },
    usages,
    component_gaps: componentGaps,
    unmatched_metadata_units,
    warnings,
    errors
  };
}

function renderText(report) {
  const lines = [
    `FRUS document-metadata usage audit ${report.status}: ${report.summary.document_metadata_usages} matches across ${report.summary.units_with_document_metadata_hits} units.`,
    `Variants needing review: ${report.summary.by_usage_status.variant_needs_review || 0}; cross-volume metadata: ${report.summary.by_usage_status.cross_volume_metadata || 0}; component gaps: ${report.summary.metadata_component_gaps}; unmatched metadata units: ${report.summary.unmatched_metadata_units}.`
  ];
  for (const warning of report.warnings.slice(0, 12)) lines.push(`warning: ${warning}`);
  for (const error of report.errors.slice(0, 12)) lines.push(`error: ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const registry = readJson(options.registryPath, options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null;
  const validationErrors = [
    ...validateUnits(unitsDocument),
    ...validateRegistry(registry),
    ...validateOutput(checkerOutput)
  ];
  if (validationErrors.length > 0) {
    const report = {
      schema_version: "frus-document-metadata-usage-audit-v1",
      generated_at: new Date().toISOString(),
      status: "fail",
      target_volume: options.targetVolume,
      source_files: {
        units: options.unitsPath,
        registry: options.registryPath,
        checker_output: options.checkerOutputPath || ""
      },
      document_metadata_registry: {},
      summary: {
        units_scanned: 0,
        units_with_document_metadata_hits: 0,
        document_metadata_usages: 0,
        metadata_component_gaps: 0,
        by_component_gap: {},
        unmatched_metadata_units: 0,
        by_document_type: {},
        by_usage_status: {},
        warnings: 0,
        errors: validationErrors.length,
        direct_document_metadata_edit_conflicts: 0
      },
      usages: [],
      component_gaps: [],
      unmatched_metadata_units: [],
      warnings: [],
      errors: validationErrors
    };
    if (options.format === "json") process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else process.stdout.write(renderText(report));
    process.exit(1);
  }
  const report = buildDocumentMetadataAudit({
    unitsDocument,
    registry,
    checkerOutput,
    targetVolume: options.targetVolume,
    sourceFiles: {
      units: options.unitsPath,
      registry: options.registryPath,
      checker_output: options.checkerOutputPath || ""
    }
  });
  if (options.format === "json") process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(renderText(report));
  if (report.status === "fail" || (options.failOnWarning && report.status === "warning")) process.exit(1);
} catch (error) {
  console.error(`FRUS document-metadata usage audit failed: ${error.message}`);
  process.exit(1);
}
