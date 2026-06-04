#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-source-surrogate-registry-v1";
const SURROGATE_TYPES = new Set([
  "rac_scan_caution",
  "nlr_identifier",
  "no_n_number",
  "electronic_telegram_surrogate",
  "foia_or_mandatory_review_identifier",
  "nara_catalog_identifier",
  "digital_scan_url",
  "pdf_filename",
  "release_package",
  "working_discovery_label",
  "source_list_transfer",
  "w_files_or_profs_context",
  "mixed_identifier_family",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set([
  "verified_published_surrogate_record",
  "verified_local_surrogate_record",
  "needs_identifier",
  "needs_source_family",
  "needs_release_basis",
  "needs_source_image",
  "needs_archival_path",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-source-surrogate-registry.mjs --registry registry.json [--format text|json]");
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
  if (!registryPath || !new Set(["text", "json"]).has(format)) usage();
  return { registryPath, format };
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

function requireString(value, label, errors) {
  if (typeof value !== "string") errors.push(`${label}: expected string`);
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings, summary: null };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["source_surrogate_registry_id", "captured_at", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
  if (!Array.isArray(registry.source_urls)) errors.push("source_urls: expected array");
  if (!Array.isArray(registry.records)) {
    errors.push("records: expected array");
    return { errors, warnings, summary: null };
  }

  const seen = new Set();
  const byType = {};
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "source_surrogate_item_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "surrogate_type",
      "approved_phrase",
      "repository_or_source_family",
      "surrogate_identifier",
      "release_or_access_basis",
      "source_image_or_copy_status",
      "archival_path_or_url",
      "publication_or_attachment_status",
      "caveat_or_limitation",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (typeof record.source_surrogate_item_id === "string") {
      if (seen.has(record.source_surrogate_item_id)) {
        errors.push(`${label}.source_surrogate_item_id: duplicate ${record.source_surrogate_item_id}`);
      }
      seen.add(record.source_surrogate_item_id);
    }
    if (typeof record.surrogate_type === "string" && !SURROGATE_TYPES.has(record.surrogate_type)) {
      errors.push(`${label}.surrogate_type: invalid value ${JSON.stringify(record.surrogate_type)}`);
    }
    if (typeof record.verification_status === "string" && !VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
    byType[record.surrogate_type] = (byType[record.surrogate_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_surrogate_type: byType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath, options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-source-surrogate-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, warnings: validation.warnings.length, errors: validation.errors.length },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS source-surrogate registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS source-surrogate registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS source-surrogate registry validation failed: ${error.message}`);
  process.exit(1);
}
