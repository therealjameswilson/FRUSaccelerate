#!/usr/bin/env node

import fs from "node:fs";

const DOCUMENT_TYPES = new Set([
  "memorandum",
  "information_memorandum",
  "letter",
  "paper",
  "editorial_note",
  "attachment",
  "telegram",
  "message",
  "memorandum_of_conversation",
  "note",
  "unknown"
]);

const VERIFICATION_STATUSES = new Set([
  "verified_published_document",
  "verified_local_document",
  "needs_document_page",
  "needs_heading_review",
  "needs_date_line",
  "needs_subject",
  "needs_source_note_link",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-document-metadata-registry.mjs --registry <document-metadata-registry.json|-> [--format json|text]");
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
  if (registry.schema_version !== "frus-document-metadata-registry-v1") {
    errors.push("$.schema_version: must be frus-document-metadata-registry-v1");
  }
  requireString(registry.document_metadata_registry_id, "$.document_metadata_registry_id", errors);
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
  const volumeDocumentMap = new Map();
  const typeCounts = {};
  const statusCounts = {};

  registry.records.forEach((record, index) => {
    const label = `$.records[${index}]`;
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
      "sender_or_originator",
      "recipient_or_audience",
      "attachment_behavior",
      "source_note_basis",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    requireString(record.date_line, `${label}.date_line`, errors, { nonempty: false });
    requireString(record.subject_or_title, `${label}.subject_or_title`, errors, { nonempty: false });
    if (ids.has(record.document_metadata_id)) {
      errors.push(`${label}.document_metadata_id: duplicate ${record.document_metadata_id}`);
    }
    ids.add(record.document_metadata_id);
    if (!DOCUMENT_TYPES.has(record.document_type)) {
      errors.push(`${label}.document_type: invalid value ${JSON.stringify(record.document_type)}`);
    }
    if (!VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) {
      errors.push(`${label}.variant_forms: expected array`);
    } else {
      const normalizedVariants = record.variant_forms.map(normalizeForm).filter(Boolean);
      for (const dupe of duplicateValues(normalizedVariants)) {
        errors.push(`${label}.variant_forms: duplicate variant ${JSON.stringify(dupe)}`);
      }
    }
    if (!/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.source_url || "")) {
      warnings.push(`${label}.source_url: not a history.state.gov historicaldocuments URL`);
    }
    typeCounts[record.document_type] = (typeCounts[record.document_type] || 0) + 1;
    statusCounts[record.verification_status] = (statusCounts[record.verification_status] || 0) + 1;

    const documentKey = `${record.volume_id}\u0000${record.document_id}\u0000${record.document_type}\u0000${normalizeForm(record.approved_heading_form)}`;
    const existing = volumeDocumentMap.get(documentKey);
    if (existing && existing !== record.document_metadata_id) {
      warnings.push(`${label}: heading also appears in ${existing} for ${record.document_id}`);
    } else {
      volumeDocumentMap.set(documentKey, record.document_metadata_id);
    }
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_document_type: typeCounts,
      by_verification_status: statusCounts
    }
  };
}

function renderText(result) {
  if (result.status === "pass" || result.status === "warning") {
    const lines = [
      `FRUS document-metadata registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    ];
    for (const warning of result.warnings) lines.push(`warning: ${warning}`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [`FRUS document-metadata registry validation failed: ${result.errors.length} errors.`];
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-document-metadata-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, by_document_type: {}, by_verification_status: {} },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS document-metadata registry validation failed: ${error.message}`);
  process.exit(1);
}
