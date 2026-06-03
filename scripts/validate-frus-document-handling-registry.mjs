#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-document-handling-registry-v1";
const ALLOWED_HANDLING_TYPES = new Set([
  "initials",
  "initials_and_marginalia",
  "initials_and_written_date",
  "handwritten_note",
  "handwritten_marginalia",
  "underlining",
  "checkmark",
  "underlining_and_checkmark",
  "vertical_line",
  "bracket",
  "stamped_notation",
  "stamped_saw_notation",
  "routing",
  "routing_and_stamped_notation",
  "approval",
  "preference",
  "routing_copy_status_and_stamped_saw_notation",
  "unknown_hand",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_document_handling_record",
  "verified_local_document_handling_record",
  "needs_source_image",
  "needs_handling_basis",
  "needs_actor_basis",
  "needs_mark_location",
  "needs_copy_status_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-document-handling-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["document_handling_registry_id", "captured_at", "scope"]) {
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
      "document_handling_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "handling_type",
      "approved_phrase",
      "actor",
      "action",
      "mark_location",
      "mark_text_or_summary",
      "routing_or_decision_status",
      "copy_or_transcription_status",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.document_handling_id === "string") {
      if (seen.has(record.document_handling_id)) {
        errors.push(`${label}.document_handling_id: duplicate ${record.document_handling_id}`);
      }
      seen.add(record.document_handling_id);
    }
    if (typeof record.handling_type === "string" && !ALLOWED_HANDLING_TYPES.has(record.handling_type)) {
      warnings.push(`${label}.handling_type: unknown value ${record.handling_type}`);
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
  return {
    schema_version: "frus-document-handling-registry-validation-v1",
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
    console.log(`FRUS document handling registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS document handling registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS document handling registry validation failed: ${error.message}`);
  process.exit(1);
}
