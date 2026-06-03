#!/usr/bin/env node

import fs from "node:fs";

const SOURCE_TYPES = new Set([
  "repository",
  "collection",
  "lot_file",
  "presidential_library_series",
  "published_source",
  "source_family",
  "electronic_file",
  "file_group",
  "front_matter_section",
  "unknown"
]);

const VERIFICATION_STATUSES = new Set([
  "verified_published_sources",
  "verified_local_sources",
  "needs_sources_page",
  "needs_source_list",
  "needs_repository_parent",
  "needs_variant_map",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-source-list-registry.mjs --registry <source-list-registry.json|-> [--format json|text]");
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
  if (registry.schema_version !== "frus-source-list-registry-v1") {
    errors.push("$.schema_version: must be frus-source-list-registry-v1");
  }
  requireString(registry.source_list_registry_id, "$.source_list_registry_id", errors);
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
  const volumeFormMap = new Map();
  const typeCounts = {};
  const statusCounts = {};

  registry.records.forEach((record, index) => {
    const label = `$.records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "source_item_id",
      "source_type",
      "volume_id",
      "approved_source_form",
      "repository_or_parent",
      "front_matter_section",
      "source_note_usage",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (ids.has(record.source_item_id)) {
      errors.push(`${label}.source_item_id: duplicate ${record.source_item_id}`);
    }
    ids.add(record.source_item_id);
    if (!SOURCE_TYPES.has(record.source_type)) {
      errors.push(`${label}.source_type: invalid value ${JSON.stringify(record.source_type)}`);
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
    typeCounts[record.source_type] = (typeCounts[record.source_type] || 0) + 1;
    statusCounts[record.verification_status] = (statusCounts[record.verification_status] || 0) + 1;

    const forms = [record.approved_source_form, ...(record.variant_forms || [])].map(normalizeForm).filter(Boolean);
    for (const form of forms) {
      const key = `${record.volume_id}\u0000${record.source_type}\u0000${form}`;
      const existing = volumeFormMap.get(key);
      if (existing && existing !== record.source_item_id) {
        warnings.push(`${label}: form ${JSON.stringify(form)} also appears in ${existing} for ${record.volume_id}`);
      } else {
        volumeFormMap.set(key, record.source_item_id);
      }
    }
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_source_type: typeCounts,
      by_verification_status: statusCounts
    }
  };
}

function renderText(result) {
  if (result.status === "pass" || result.status === "warning") {
    const lines = [
      `FRUS source-list registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    ];
    for (const warning of result.warnings) lines.push(`warning: ${warning}`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [`FRUS source-list registry validation failed: ${result.errors.length} errors.`];
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-source-list-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, by_source_type: {}, by_verification_status: {} },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS source-list registry validation failed: ${error.message}`);
  process.exit(1);
}
