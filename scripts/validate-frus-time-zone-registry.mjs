#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-time-zone-registry-v1";
const ALLOWED_CLAIM_TYPES = new Set([
  "volume_chronology_standard",
  "telegram_date_time_group",
  "telegram_date_time_group_and_washington_target",
  "local_meeting_time",
  "no_precise_time",
  "actual_vs_planned_meeting_time",
  "event_time",
  "situation_report_as_of",
  "situation_report_as_of_and_local_times",
  "treaty_notification_time_rule",
  "deadline_or_target_time",
  "ambiguous_time",
  "unknown"
]);
const ALLOWED_CONVERSION_STATUSES = new Set([
  "no_conversion_needed",
  "conversion_supplied_by_source",
  "conversion_not_supplied",
  "local_times_preserved",
  "treaty_rule_do_not_convert",
  "ambiguous_do_not_resolve",
  "needs_time_zone_basis",
  "unknown"
]);
const ALLOWED_VERIFICATION_STATUSES = new Set([
  "verified_published_time_zone_record",
  "verified_published_pattern",
  "verified_local_time_zone_record",
  "needs_time_zone_basis",
  "needs_date_time_group",
  "needs_local_time_basis",
  "needs_conversion_basis",
  "needs_chronological_placement_basis",
  "needs_treaty_time_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-time-zone-registry.mjs --registry registry.json [--format text|json]");
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

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["time_zone_registry_id", "captured_at", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
  if (!Array.isArray(registry.source_urls)) errors.push("source_urls: expected array");
  if (!Array.isArray(registry.records)) {
    errors.push("records: expected array");
    return { errors, warnings };
  }

  const seen = new Set();
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "time_zone_item_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "time_claim_type",
      "approved_phrase",
      "source_time_basis",
      "display_time",
      "conversion_status",
      "chronological_placement",
      "event_or_document_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.time_zone_item_id === "string") {
      if (seen.has(record.time_zone_item_id)) errors.push(`${label}.time_zone_item_id: duplicate ${record.time_zone_item_id}`);
      seen.add(record.time_zone_item_id);
    }
    if (typeof record.time_claim_type === "string" && !ALLOWED_CLAIM_TYPES.has(record.time_claim_type)) {
      warnings.push(`${label}.time_claim_type: unknown value ${record.time_claim_type}`);
    }
    if (typeof record.conversion_status === "string" && !ALLOWED_CONVERSION_STATUSES.has(record.conversion_status)) {
      warnings.push(`${label}.conversion_status: unknown value ${record.conversion_status}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_VERIFICATION_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
  });
  return { errors, warnings };
}

function resultFor(registryPath, registry) {
  const { errors, warnings } = validateRegistry(registry);
  return {
    schema_version: "frus-time-zone-registry-validation-v1",
    registry: registryPath,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    summary: {
      records: Array.isArray(registry?.records) ? registry.records.length : 0,
      warnings: warnings.length,
      errors: errors.length
    },
    warnings,
    errors
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const result = resultFor(options.registryPath, registry);
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS time-zone registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS time-zone registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS time-zone registry validation failed: ${error.message}`);
  process.exit(1);
}
