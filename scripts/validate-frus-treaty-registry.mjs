#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-treaty-registry-v1";
const ALLOWED_COMPONENT_TYPES = new Set([
  "treaty_text",
  "annex",
  "protocol",
  "memorandum_of_understanding",
  "associated_document",
  "associated_letter",
  "joint_statement",
  "separate_executive_agreement",
  "senate_transmittal",
  "ratification",
  "notification",
  "entry_into_force",
  "treaty_doc",
  "legal_authority",
  "draft_treaty",
  "draft_protocol",
  "draft_mou",
  "technical_definition",
  "verification_regime",
  "monitoring_inspection",
  "arms_control_constraint",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_treaty_record",
  "verified_local_treaty_record",
  "needs_component_basis",
  "needs_publication_basis",
  "needs_signature_basis",
  "needs_ratification_basis",
  "needs_entry_into_force_basis",
  "needs_legal_authority_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-treaty-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["treaty_registry_id", "captured_at", "scope"]) {
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
      "treaty_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "treaty_component_type",
      "approved_phrase",
      "instrument_or_package",
      "component_label",
      "signature_or_publication_date",
      "publication_or_source_basis",
      "selected_or_supplemental_status",
      "integral_or_associated_status",
      "legal_status_or_process",
      "relationship_to_document",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.treaty_id === "string") {
      if (seen.has(record.treaty_id)) errors.push(`${label}.treaty_id: duplicate ${record.treaty_id}`);
      seen.add(record.treaty_id);
    }
    if (typeof record.treaty_component_type === "string" && !ALLOWED_COMPONENT_TYPES.has(record.treaty_component_type)) {
      warnings.push(`${label}.treaty_component_type: unknown value ${record.treaty_component_type}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (
      typeof record.signature_or_publication_date === "string" &&
      record.signature_or_publication_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(record.signature_or_publication_date)
    ) {
      warnings.push(`${label}.signature_or_publication_date: expected YYYY-MM-DD when a precise date is supplied`);
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
    schema_version: "frus-treaty-registry-validation-v1",
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
    console.log(`FRUS treaty registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS treaty registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS treaty registry validation failed: ${error.message}`);
  process.exit(1);
}
