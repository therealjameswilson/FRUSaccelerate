#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-public-source-registry-v1";
const ALLOWED_PUBLIC_SOURCE_TYPES = new Set([
  "public_papers_citation",
  "selected_public_remarks",
  "press_conference",
  "press_briefing",
  "interview",
  "testimony",
  "broadcast",
  "department_bulletin",
  "department_dispatch",
  "newspaper_excerpt",
  "official_transcript",
  "public_report",
  "public_source_context",
  "archival_speech_file_context",
  "treaty_publication",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_public_source_record",
  "verified_local_public_source_record",
  "needs_publication_basis",
  "needs_delivery_basis",
  "needs_full_text_target",
  "needs_archival_draft_basis",
  "needs_selected_status_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-public-source-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["public_source_registry_id", "captured_at", "scope"]) {
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
      "public_source_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "public_source_type",
      "approved_phrase",
      "public_event_or_document",
      "publication_or_broadcast_basis",
      "delivery_or_release_date",
      "selected_or_supplemental_status",
      "full_text_or_source_target",
      "archival_or_draft_context",
      "relationship_to_document",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.public_source_id === "string") {
      if (seen.has(record.public_source_id)) errors.push(`${label}.public_source_id: duplicate ${record.public_source_id}`);
      seen.add(record.public_source_id);
    }
    if (typeof record.public_source_type === "string" && !ALLOWED_PUBLIC_SOURCE_TYPES.has(record.public_source_type)) {
      warnings.push(`${label}.public_source_type: unknown value ${record.public_source_type}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (
      typeof record.delivery_or_release_date === "string" &&
      record.delivery_or_release_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(record.delivery_or_release_date)
    ) {
      warnings.push(`${label}.delivery_or_release_date: expected YYYY-MM-DD when a precise date is supplied`);
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
    schema_version: "frus-public-source-registry-validation-v1",
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
    console.log(`FRUS public-source registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS public-source registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS public-source registry validation failed: ${error.message}`);
  process.exit(1);
}
