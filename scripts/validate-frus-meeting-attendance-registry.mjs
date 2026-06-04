#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-meeting-attendance-registry-v1";
const ALLOWED_ATTENDANCE_TYPES = new Set([
  "daily_diary_attendance",
  "daily_diary_partial_attendance",
  "nsc_meeting_attendance",
  "participant_list_not_attached",
  "participant_list_attached_not_printed",
  "meeting_note_no_minutes",
  "meeting_note_no_memcon",
  "telephone_call_attendance",
  "unknown"
]);
const ALLOWED_PARTICIPANT_LIST_STATUSES = new Set([
  "not_applicable",
  "not_attached",
  "attached_not_printed",
  "printed_elsewhere",
  "cited_tab_missing",
  "unknown"
]);
const ALLOWED_RECORD_STATUSES = new Set([
  "no_minutes_found",
  "no_memcon_found",
  "diary_entry_only",
  "participant_list_missing",
  "not_applicable",
  "unknown"
]);
const ALLOWED_VERIFICATION_STATUSES = new Set([
  "verified_published_attendance_record",
  "verified_local_attendance_record",
  "needs_daily_diary_basis",
  "needs_participant_list_basis",
  "needs_source_note_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-meeting-attendance-registry.mjs --registry registry.json [--format text|json]");
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

function requireString(record, key, label, errors) {
  if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["meeting_attendance_registry_id", "captured_at", "scope"]) {
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
  const byAttendanceType = {};
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "meeting_attendance_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "attendance_type",
      "approved_phrase",
      "meeting_or_call_date",
      "meeting_or_call_title",
      "attendance_basis",
      "participants_or_attendance",
      "participant_list_status",
      "record_status",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record, key, label, errors);
    }
    if (typeof record.meeting_attendance_id === "string") {
      if (seen.has(record.meeting_attendance_id)) {
        errors.push(`${label}.meeting_attendance_id: duplicate ${record.meeting_attendance_id}`);
      }
      seen.add(record.meeting_attendance_id);
    }
    if (typeof record.attendance_type === "string" && !ALLOWED_ATTENDANCE_TYPES.has(record.attendance_type)) {
      warnings.push(`${label}.attendance_type: unknown value ${record.attendance_type}`);
    }
    if (
      typeof record.participant_list_status === "string" &&
      !ALLOWED_PARTICIPANT_LIST_STATUSES.has(record.participant_list_status)
    ) {
      warnings.push(`${label}.participant_list_status: unknown value ${record.participant_list_status}`);
    }
    if (typeof record.record_status === "string" && !ALLOWED_RECORD_STATUSES.has(record.record_status)) {
      warnings.push(`${label}.record_status: unknown value ${record.record_status}`);
    }
    if (
      typeof record.verification_status === "string" &&
      !ALLOWED_VERIFICATION_STATUSES.has(record.verification_status)
    ) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (
      typeof record.meeting_or_call_date === "string" &&
      record.meeting_or_call_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(record.meeting_or_call_date)
    ) {
      warnings.push(`${label}.meeting_or_call_date: expected YYYY-MM-DD when a precise date is supplied`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
    byAttendanceType[record.attendance_type] = (byAttendanceType[record.attendance_type] || 0) + 1;
  });
  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_attendance_type: byAttendanceType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-meeting-attendance-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, warnings: validation.warnings.length, errors: validation.errors.length },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS meeting attendance registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(
      `FRUS meeting attendance registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS meeting attendance registry validation failed: ${error.message}`);
  process.exit(1);
}
