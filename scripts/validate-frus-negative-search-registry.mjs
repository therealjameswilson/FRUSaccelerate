#!/usr/bin/env node

import fs from "node:fs";

const RECORD_TYPES = new Set([
  "minutes",
  "formal_minutes",
  "memorandum_of_conversation",
  "telcon",
  "draft",
  "attachment",
  "tab",
  "enclosure",
  "source_path",
  "unknown"
]);

const RELATIONSHIPS = new Set([
  "meeting_record_absent",
  "record_not_found",
  "attachment_not_attached",
  "attachment_not_found_attached",
  "rac_attachment_ambiguity",
  "found_elsewhere",
  "unknown"
]);

const VERIFICATION_STATUSES = new Set([
  "verified_published_negative_search",
  "verified_local_negative_search",
  "needs_search_log",
  "needs_attachment_basis",
  "needs_record_identity",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-negative-search-registry.mjs --registry <negative-search-registry.json|-> [--format json|text]");
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
  if (registry.schema_version !== "frus-negative-search-registry-v1") {
    errors.push("$.schema_version: must be frus-negative-search-registry-v1");
  }
  requireString(registry.negative_search_registry_id, "$.negative_search_registry_id", errors);
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
  const relationshipCounts = {};
  const statusCounts = {};

  registry.records.forEach((record, index) => {
    const label = `$.records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "negative_search_id",
      "volume_id",
      "document_id",
      "document_number",
      "record_type",
      "approved_phrase",
      "search_scope_or_basis",
      "relationship_to_document",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (ids.has(record.negative_search_id)) {
      errors.push(`${label}.negative_search_id: duplicate ${record.negative_search_id}`);
    }
    ids.add(record.negative_search_id);
    if (!RECORD_TYPES.has(record.record_type)) {
      errors.push(`${label}.record_type: invalid value ${JSON.stringify(record.record_type)}`);
    }
    if (!RELATIONSHIPS.has(record.relationship_to_document)) {
      errors.push(`${label}.relationship_to_document: invalid value ${JSON.stringify(record.relationship_to_document)}`);
    }
    if (!VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
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
    typeCounts[record.record_type] = (typeCounts[record.record_type] || 0) + 1;
    relationshipCounts[record.relationship_to_document] = (relationshipCounts[record.relationship_to_document] || 0) + 1;
    statusCounts[record.verification_status] = (statusCounts[record.verification_status] || 0) + 1;

    const forms = [record.approved_phrase, ...(record.variant_forms || [])].map(normalizeForm).filter(Boolean);
    for (const form of forms) {
      const key = `${record.volume_id}\u0000${record.document_id}\u0000${record.record_type}\u0000${record.relationship_to_document}\u0000${form}`;
      const existing = formMap.get(key);
      if (existing && existing !== record.negative_search_id) {
        warnings.push(`${label}: phrase ${JSON.stringify(form)} also appears in ${existing} for ${record.volume_id}`);
      } else {
        formMap.set(key, record.negative_search_id);
      }
    }
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_record_type: typeCounts,
      by_relationship: relationshipCounts,
      by_verification_status: statusCounts
    }
  };
}

function renderText(result) {
  if (result.status === "pass" || result.status === "warning") {
    const lines = [
      `FRUS negative-search registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    ];
    for (const warning of result.warnings) lines.push(`warning: ${warning}`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [`FRUS negative-search registry validation failed: ${result.errors.length} errors.`];
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-negative-search-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || {
      records: 0,
      by_record_type: {},
      by_relationship: {},
      by_verification_status: {}
    },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS negative-search registry validation failed: ${error.message}`);
  process.exit(1);
}
