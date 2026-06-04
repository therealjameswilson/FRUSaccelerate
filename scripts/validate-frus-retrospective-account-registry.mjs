#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-retrospective-account-registry-v1";
const ALLOWED_RECORD_TYPES = new Set([
  "memoir_recollection",
  "published_personal_diary",
  "published_personal_diary_and_memoir",
  "personal_diary",
  "oral_history",
  "later_interview",
  "press_retrospective",
  "newspaper_account",
  "published_account",
  "private_diary_context",
  "editorial_recollection_context",
  "unknown"
]);
const ALLOWED_SELECTED_STATUSES = new Set([
  "selected_public_document",
  "supplemental_recollection",
  "supplemental_diary_context",
  "supplemental_diary_and_recollection",
  "corroborating_public_account",
  "conflicting_recollection",
  "background_only",
  "unknown"
]);
const ALLOWED_CONFLICT_STATUSES = new Set([
  "no_conflict_noted",
  "conflict_checked",
  "conflicts_with_official_record",
  "needs_conflict_check",
  "unknown"
]);
const ALLOWED_VERIFICATION_STATUSES = new Set([
  "verified_published_retrospective_account",
  "verified_local_retrospective_account",
  "needs_publication_details",
  "needs_page_or_locator",
  "needs_author_or_editor_basis",
  "needs_event_match",
  "needs_official_record_relationship",
  "needs_corroborating_record",
  "needs_selection_status",
  "needs_conflict_check",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-retrospective-account-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["retrospective_account_registry_id", "captured_at", "scope"]) {
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
      "retrospective_account_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "record_type",
      "approved_phrase",
      "account_author_or_source",
      "publication_or_collection",
      "page_or_locator",
      "event_or_document_described",
      "official_record_relationship",
      "selected_or_supplemental_status",
      "corroborating_record",
      "conflict_status",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.retrospective_account_id === "string") {
      if (seen.has(record.retrospective_account_id)) {
        errors.push(`${label}.retrospective_account_id: duplicate ${record.retrospective_account_id}`);
      }
      seen.add(record.retrospective_account_id);
    }
    if (typeof record.record_type === "string" && !ALLOWED_RECORD_TYPES.has(record.record_type)) {
      warnings.push(`${label}.record_type: unknown value ${record.record_type}`);
    }
    if (
      typeof record.selected_or_supplemental_status === "string" &&
      !ALLOWED_SELECTED_STATUSES.has(record.selected_or_supplemental_status)
    ) {
      warnings.push(`${label}.selected_or_supplemental_status: unknown value ${record.selected_or_supplemental_status}`);
    }
    if (typeof record.conflict_status === "string" && !ALLOWED_CONFLICT_STATUSES.has(record.conflict_status)) {
      warnings.push(`${label}.conflict_status: unknown value ${record.conflict_status}`);
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
    schema_version: "frus-retrospective-account-registry-validation-v1",
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
    console.log(`FRUS retrospective-account registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS retrospective-account registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS retrospective-account registry validation failed: ${error.message}`);
  process.exit(1);
}
