#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-document-status-lifecycle-registry-v1";
const STATUS_TYPES = new Set([
  "prepared_by",
  "drafted_and_cleared",
  "copy_or_version_status",
  "sent_for_action",
  "sent_for_information",
  "sent_through",
  "stamped_seen_or_signed",
  "read_or_approval_status",
  "no_minutes_or_no_record",
  "draft_or_prior_version",
  "missing_or_incomplete_copy",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set([
  "verified_published_lifecycle_record",
  "verified_local_lifecycle_record",
  "needs_source_image",
  "needs_drafting_basis",
  "needs_routing_basis",
  "needs_copy_status",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-document-status-lifecycle-registry.mjs --registry registry.json [--format text|json]"
  );
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
  for (const key of ["document_status_lifecycle_registry_id", "captured_at", "scope"]) {
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
  const byStatusType = {};
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "document_status_item_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "status_type",
      "approved_phrase",
      "source_note_component",
      "copy_or_version_status",
      "drafting_or_clearance_basis",
      "routing_or_distribution_status",
      "read_or_approval_status",
      "caveat_or_limitation",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors);
    }
    if (typeof record.document_status_item_id === "string") {
      if (seen.has(record.document_status_item_id)) {
        errors.push(`${label}.document_status_item_id: duplicate ${record.document_status_item_id}`);
      }
      seen.add(record.document_status_item_id);
    }
    if (typeof record.status_type === "string" && !STATUS_TYPES.has(record.status_type)) {
      errors.push(`${label}.status_type: invalid value ${JSON.stringify(record.status_type)}`);
    }
    if (typeof record.verification_status === "string" && !VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
    byStatusType[record.status_type] = (byStatusType[record.status_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_status_type: byStatusType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath, options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-document-status-lifecycle-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, warnings: validation.warnings.length, errors: validation.errors.length },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(
      `FRUS document-status lifecycle registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`
    );
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(
      `FRUS document-status lifecycle registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS document-status lifecycle registry validation failed: ${error.message}`);
  process.exit(1);
}
