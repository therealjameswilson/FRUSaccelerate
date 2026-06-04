#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-summit-public-event-registry-v1";
const ALLOWED_EVENT_TYPES = new Set([
  "foreign_travel_and_summit",
  "delegation_meeting",
  "working_lunch_or_dinner",
  "arrival_or_departure",
  "signing_ceremony",
  "news_conference",
  "public_address",
  "united_nations_address",
  "television_interview",
  "toast_or_remarks",
  "press_backgrounder",
  "congressional_testimony",
  "campaign_statement",
  "summit_working_sequence",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_summit_public_event_record",
  "verified_local_summit_public_event_record",
  "needs_time_or_place",
  "needs_public_source",
  "needs_diary_or_schedule",
  "needs_press_basis",
  "needs_full_record_target",
  "needs_participant_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-summit-public-event-registry.mjs --registry registry.json [--format text|json]"
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

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function requireString(record, key, label, errors) {
  if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["event_chronology_registry_id", "captured_at", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
  if (!Array.isArray(registry.source_urls)) errors.push("source_urls: expected array");
  if (!Array.isArray(registry.events)) {
    errors.push("events: expected array");
    return { errors, warnings };
  }

  const seen = new Set();
  registry.events.forEach((event, index) => {
    const label = `events[${index}]`;
    if (!isPlainObject(event)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "event_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "event_family",
      "event_type",
      "approved_phrase",
      "date_span",
      "place",
      "public_source_basis",
      "schedule_or_diary_basis",
      "related_full_record_target",
      "press_or_ceremony_component",
      "participants_or_actors",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(event, key, label, errors);
    }
    if (typeof event.event_id === "string") {
      if (seen.has(event.event_id)) errors.push(`${label}.event_id: duplicate ${event.event_id}`);
      seen.add(event.event_id);
    }
    if (typeof event.event_type === "string" && !ALLOWED_EVENT_TYPES.has(event.event_type)) {
      warnings.push(`${label}.event_type: unknown value ${event.event_type}`);
    }
    if (typeof event.verification_status === "string" && !ALLOWED_STATUSES.has(event.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${event.verification_status}`);
    }
    if (!Array.isArray(event.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof event.source_url === "string" && !event.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
  });
  return { errors, warnings };
}

function resultFor(registryPath, registry) {
  const { errors, warnings } = validateRegistry(registry);
  const events = Array.isArray(registry?.events) ? registry.events : [];
  return {
    schema_version: "frus-summit-public-event-registry-validation-v1",
    registry: registryPath,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    summary: {
      events: events.length,
      warnings: warnings.length,
      errors: errors.length,
      by_event_type: countBy(events.map((event) => event.event_type || "unknown")),
      by_event_family: countBy(events.map((event) => event.event_family || "unknown"))
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
    console.log(
      `FRUS summit/public-event registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`
    );
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(
      `FRUS summit/public-event registry validation ${result.status}: ${result.summary.events} events, ${result.summary.warnings} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS summit/public-event registry validation failed: ${error.message}`);
  process.exit(1);
}
