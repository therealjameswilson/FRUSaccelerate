#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-footnote-referback-registry-v1";
const REFERBACK_TYPES = new Set([
  "cross_document_footnote",
  "multi_target_footnote_cluster",
  "document_and_thereto",
  "same_document_above",
  "same_document_local_context",
  "plural_footnotes_same_document",
  "mixed_footnote_document_reference",
  "plain_document_reference",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set(["verified_published_form", "verified_local_form", "needs_target_check", "unknown"]);

function usage() {
  console.error("Usage: node scripts/validate-frus-footnote-referback-registry.mjs --registry registry.json [--format text|json]");
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

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label, errors, { nonempty = true } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
  } else if (nonempty && value.trim() === "") {
    errors.push(`${label}: must not be empty`);
  }
}

function requirePositiveInteger(value, label, errors, { min = 1, max = 10 } = {}) {
  if (!Number.isInteger(value)) {
    errors.push(`${label}: expected integer`);
  } else if (value < min || value > max) {
    errors.push(`${label}: expected integer between ${min} and ${max}`);
  }
}

function validateTargetReference(reference, label, errors) {
  if (!isPlainObject(reference)) {
    errors.push(`${label}: expected object`);
    return;
  }
  for (const key of ["target_document_id", "target_document_number", "target_footnote_number", "target_label", "target_url"]) {
    requireString(reference[key], `${label}.${key}`, errors, {
      nonempty: !["target_document_id", "target_document_number", "target_footnote_number", "target_url"].includes(key)
    });
  }
  if (reference.target_url && !/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(reference.target_url)) {
    errors.push(`${label}.target_url: expected history.state.gov historicaldocuments URL`);
  }
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["footnote_referback_registry_id", "captured_at", "scope", "rule_summary", "repeat_threshold_action"]) {
    requireString(registry[key], key, errors);
  }
  requirePositiveInteger(registry.repeat_threshold, "repeat_threshold", errors, { min: 2, max: 5 });
  if (!Array.isArray(registry.source_urls) || registry.source_urls.length === 0) {
    errors.push("source_urls: expected non-empty array");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("records: expected array");
    return { errors, warnings };
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
      "referback_id",
      "volume_id",
      "source_document_id",
      "source_document_number",
      "source_unit_label",
      "referback_type",
      "approved_phrase",
      "rule_basis",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (typeof record.referback_id === "string") {
      if (seen.has(record.referback_id)) errors.push(`${label}.referback_id: duplicate ${record.referback_id}`);
      seen.add(record.referback_id);
    }
    if (typeof record.referback_type === "string" && !REFERBACK_TYPES.has(record.referback_type)) {
      errors.push(`${label}.referback_type: invalid value ${JSON.stringify(record.referback_type)}`);
    }
    if (typeof record.verification_status === "string" && !VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (!Array.isArray(record.target_references)) {
      errors.push(`${label}.target_references: expected array`);
    } else {
      record.target_references.forEach((reference, referenceIndex) =>
        validateTargetReference(reference, `${label}.target_references[${referenceIndex}]`, errors)
      );
    }
    if (!/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.source_url || "")) {
      warnings.push(`${label}.source_url: not a history.state.gov historicaldocuments URL`);
    }
    byType[record.referback_type] = (byType[record.referback_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      repeat_threshold: registry.repeat_threshold,
      by_referback_type: byType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-footnote-referback-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, by_referback_type: {} },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS footnote refer-back registry validation failed: ${result.errors.length} errors.`);
    for (const error of result.errors) console.log(`- ${error}`);
  } else {
    console.log(`FRUS footnote refer-back registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS footnote refer-back registry validation failed: ${error.message}`);
  process.exit(1);
}
