#!/usr/bin/env node

import fs from "node:fs";

const REFERENCE_TYPES = new Set([
  "same_volume_document",
  "same_volume_footnote",
  "attachment_target_document",
  "related_volume_scheduled_publication",
  "related_volume_also_printed",
  "related_volume_document_range",
  "appendix_or_tab_reference",
  "public_source_full_text",
  "unknown"
]);

const VERIFICATION_STATUSES = new Set([
  "verified_published_cross_reference",
  "verified_local_cross_reference",
  "needs_target_document",
  "needs_target_volume",
  "needs_slug_elements",
  "unknown"
]);

const TARGET_VOLUME_TYPES = new Set([
  "related_volume_scheduled_publication",
  "related_volume_also_printed",
  "related_volume_document_range"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-cross-reference-registry.mjs --registry <cross-reference-registry.json|-> [--format json|text]");
  process.exit(2);
}

function parseArgs(argv) {
  let registryPath = null;
  let format = "text";
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--registry") {
      registryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }
  if (!registryPath || !new Set(["json", "text"]).has(format)) usage();
  return { registryPath, format };
}

function readJson(file) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
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

function requireString(value, label, errors, { nonempty = true } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
  } else if (nonempty && value.length === 0) {
    errors.push(`${label}: must not be empty`);
  }
}

function duplicateValues(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== "frus-cross-reference-registry-v1") {
    errors.push("$.schema_version: must be frus-cross-reference-registry-v1");
  }
  requireString(registry.cross_reference_registry_id, "$.cross_reference_registry_id", errors);
  requireString(registry.captured_at, "$.captured_at", errors);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(registry.captured_at || "")) {
    errors.push("$.captured_at: expected YYYY-MM-DD");
  }
  if (!Array.isArray(registry.source_urls) || registry.source_urls.length === 0) {
    errors.push("$.source_urls: expected non-empty array");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("$.records: expected array");
    return { errors, warnings };
  }

  const ids = new Set();
  const formMap = new Map();
  const typeCounts = {};
  const statusCounts = {};

  registry.records.forEach((record, index) => {
    const label = `$.records[${index}]`;
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
      const optionalEmpty = [
        "target_volume_id",
        "target_document_id",
        "target_document_number",
        "target_footnote",
        "target_chapter_or_part",
        "target_url"
      ].includes(key);
      requireString(record[key], `${label}.${key}`, errors, { nonempty: !optionalEmpty });
    }
    if (ids.has(record.cross_reference_id)) {
      errors.push(`${label}.cross_reference_id: duplicate ${record.cross_reference_id}`);
    }
    ids.add(record.cross_reference_id);
    if (!REFERENCE_TYPES.has(record.reference_type)) {
      errors.push(`${label}.reference_type: invalid value ${JSON.stringify(record.reference_type)}`);
    }
    if (!VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (TARGET_VOLUME_TYPES.has(record.reference_type) && !String(record.target_volume_id || "").trim()) {
      errors.push(`${label}.target_volume_id: required for ${record.reference_type}`);
    }
    if (
      ["same_volume_document", "same_volume_footnote", "attachment_target_document"].includes(record.reference_type) &&
      !String(record.target_document_number || "").trim()
    ) {
      errors.push(`${label}.target_document_number: required for ${record.reference_type}`);
    }
    if (!Array.isArray(record.required_slug_elements)) {
      errors.push(`${label}.required_slug_elements: expected array`);
    }
    if (!Array.isArray(record.variant_forms)) {
      errors.push(`${label}.variant_forms: expected array`);
    } else {
      const normalizedVariants = record.variant_forms.map(normalizeForm).filter(Boolean);
      for (const dupe of duplicateValues(normalizedVariants)) {
        warnings.push(`${label}.variant_forms: repeated normalized variant ${JSON.stringify(dupe)}`);
      }
    }
    if (!/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.source_url || "")) {
      warnings.push(`${label}.source_url: not a history.state.gov historicaldocuments URL`);
    }
    if (record.target_url && !/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.target_url)) {
      warnings.push(`${label}.target_url: not a history.state.gov historicaldocuments URL`);
    }
    typeCounts[record.reference_type] = (typeCounts[record.reference_type] || 0) + 1;
    statusCounts[record.verification_status] = (statusCounts[record.verification_status] || 0) + 1;

    const forms = [record.approved_phrase, ...(record.variant_forms || [])].map(normalizeForm).filter(Boolean);
    for (const form of forms) {
      const key = `${record.volume_id}\u0000${record.source_document_id}\u0000${record.source_unit_label}\u0000${form}`;
      const existing = formMap.get(key);
      if (existing && existing !== record.cross_reference_id) {
        warnings.push(`${label}: cross-reference phrase ${JSON.stringify(form)} also appears in ${existing}`);
      } else {
        formMap.set(key, record.cross_reference_id);
      }
    }
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_reference_type: typeCounts,
      by_verification_status: statusCounts
    }
  };
}

function renderText(result) {
  if (result.status === "pass" || result.status === "warning") {
    const lines = [
      `FRUS cross-reference registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    ];
    for (const warning of result.warnings) lines.push(`warning: ${warning}`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [`FRUS cross-reference registry validation failed: ${result.errors.length} errors.`];
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-cross-reference-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || {
      records: 0,
      by_reference_type: {},
      by_verification_status: {}
    },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS cross-reference registry validation failed: ${error.message}`);
  process.exit(1);
}
