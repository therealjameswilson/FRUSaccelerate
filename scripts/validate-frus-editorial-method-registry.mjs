#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-editorial-method-registry-v1";
const METHOD_TYPES = new Set([
  "original_brackets",
  "original_ellipses",
  "original_brackets_and_ellipses",
  "footnote_in_original",
  "original_underlining",
  "document_text_integrity",
  "bracketed_addition_or_correction",
  "capitalization_punctuation_abbreviation",
  "original_quotation",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set([
  "verified_published_editorial_method_record",
  "verified_local_editorial_method_record",
  "needs_source_image",
  "needs_editorial_method_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-editorial-method-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["editorial_method_registry_id", "captured_at", "scope"]) {
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
  const byMethodType = {};
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "editorial_method_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "method_type",
      "approved_phrase",
      "protected_text_or_feature",
      "editorial_method_basis",
      "direct_edit_rule",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (typeof record.editorial_method_id === "string") {
      if (seen.has(record.editorial_method_id)) {
        errors.push(`${label}.editorial_method_id: duplicate ${record.editorial_method_id}`);
      }
      seen.add(record.editorial_method_id);
    }
    if (typeof record.method_type === "string" && !METHOD_TYPES.has(record.method_type)) {
      errors.push(`${label}.method_type: invalid value ${JSON.stringify(record.method_type)}`);
    }
    if (typeof record.verification_status === "string" && !VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
    byMethodType[record.method_type] = (byMethodType[record.method_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_method_type: byMethodType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath, options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-editorial-method-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, warnings: validation.warnings.length, errors: validation.errors.length },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS editorial-method registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS editorial-method registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS editorial-method registry validation failed: ${error.message}`);
  process.exit(1);
}
