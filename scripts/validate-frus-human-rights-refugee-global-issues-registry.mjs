#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-human-rights-refugee-global-issues-registry-v1";
const ALLOWED_RECORD_TYPES = new Set([
  "source_ecology",
  "human_rights_public_report",
  "human_rights_sanctions",
  "human_rights_condition_or_waiver",
  "public_report_or_country_report",
  "famine_policy_and_conference",
  "refugee_relief_and_food_assistance",
  "immigration_or_asylum_policy",
  "migration_and_refugee_assistance",
  "pl480_food_assistance",
  "aids_policy",
  "population_policy_public_controversy",
  "environmental_global_issue",
  "international_organization_relief",
  "pvo_relief",
  "status_page_family_context",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_human_rights_refugee_global_issues_record",
  "verified_local_human_rights_refugee_global_issues_record",
  "needs_human_rights_refugee_global_issues_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs --registry registry.json [--format text|json]"
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
  for (const key of ["human_rights_refugee_global_issues_registry_id", "captured_at", "scope"]) {
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
      "humanitarian_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "record_type",
      "approved_phrase",
      "issue_area",
      "institution_or_actor",
      "source_family",
      "public_or_archival_basis",
      "legal_or_program_basis",
      "quantity_or_metric",
      "stage_or_status",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record, key, label, errors);
    }
    if (typeof record.humanitarian_id === "string") {
      if (seen.has(record.humanitarian_id)) {
        errors.push(`${label}.humanitarian_id: duplicate ${record.humanitarian_id}`);
      }
      seen.add(record.humanitarian_id);
    }
    if (typeof record.record_type === "string" && !ALLOWED_RECORD_TYPES.has(record.record_type)) {
      warnings.push(`${label}.record_type: unknown value ${record.record_type}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_STATUSES.has(record.verification_status)) {
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
  const records = Array.isArray(registry?.records) ? registry.records : [];
  return {
    schema_version: "frus-human-rights-refugee-global-issues-registry-validation-v1",
    registry: registryPath,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    summary: {
      records: records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_record_type: countBy(records.map((record) => record.record_type || "unknown"))
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
      `FRUS human-rights/refugee/global-issues registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`
    );
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(
      `FRUS human-rights/refugee/global-issues registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS human-rights/refugee/global-issues registry validation failed: ${error.message}`);
  process.exit(1);
}
