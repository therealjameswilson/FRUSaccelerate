#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-chronology-registry-v1";
const ALLOWED_CHRONOLOGY_TYPES = new Set([
  "daily_diary_meeting_time",
  "no_precise_time",
  "actual_vs_planned_meeting_time",
  "call_time",
  "briefing_time",
  "event_sequence",
  "travel_time",
  "time_zone_basis",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_chronology_record",
  "verified_local_chronology_record",
  "needs_diary_basis",
  "needs_schedule_basis",
  "needs_call_log_basis",
  "needs_time_zone_basis",
  "needs_event_sequence_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-chronology-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["chronology_registry_id", "captured_at", "scope"]) {
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
      "chronology_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "chronology_type",
      "approved_phrase",
      "event_date",
      "start_time",
      "end_time",
      "time_basis",
      "place",
      "participants_or_actors",
      "relationship_to_document",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.chronology_id === "string") {
      if (seen.has(record.chronology_id)) errors.push(`${label}.chronology_id: duplicate ${record.chronology_id}`);
      seen.add(record.chronology_id);
    }
    if (typeof record.chronology_type === "string" && !ALLOWED_CHRONOLOGY_TYPES.has(record.chronology_type)) {
      warnings.push(`${label}.chronology_type: unknown value ${record.chronology_type}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (typeof record.event_date === "string" && record.event_date && !/^\d{4}-\d{2}-\d{2}$/.test(record.event_date)) {
      warnings.push(`${label}.event_date: expected YYYY-MM-DD when a precise event date is supplied`);
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
    schema_version: "frus-chronology-registry-validation-v1",
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
    console.log(`FRUS chronology registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS chronology registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS chronology registry validation failed: ${error.message}`);
  process.exit(1);
}
