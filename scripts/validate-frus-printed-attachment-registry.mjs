#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-printed-attachment-registry-v1";
const ALLOWED_RELATIONSHIPS = new Set([
  "printed_nested_attachment",
  "printed_as_document",
  "printed_as_tab_or_attachment",
  "attached_but_not_printed",
  "not_attached",
  "not_found_attached",
  "appendix_or_facsimile",
  "foreign_paper_attachment",
  "translation_or_original_text_pair",
  "treaty_component_attachment",
  "participant_list_or_agenda",
  "unknown"
]);
const ALLOWED_EDITORIAL_STATUSES = new Set([
  "printed_in_parent",
  "printed_elsewhere",
  "attached_not_printed",
  "not_attached",
  "not_found_attached",
  "excerpted",
  "appendix",
  "scheduled_elsewhere",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_printed_attachment_record",
  "verified_local_printed_attachment_record",
  "needs_child_heading",
  "needs_child_source_note",
  "needs_child_classification",
  "needs_printed_target",
  "needs_parent_child_map",
  "needs_translation_or_original_text_status",
  "needs_attachment_status",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-printed-attachment-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["printed_attachment_registry_id", "captured_at", "scope"]) {
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
      "printed_attachment_id",
      "volume_id",
      "parent_document_id",
      "parent_document_number",
      "child_unit_label",
      "relationship_type",
      "approved_phrase",
      "tab_or_attachment_label",
      "child_heading",
      "child_date_or_place",
      "child_title_or_subject",
      "child_source_note_or_footnote",
      "child_classification_or_marking",
      "editorial_status",
      "printed_target",
      "cross_reference_target",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.printed_attachment_id === "string") {
      if (seen.has(record.printed_attachment_id)) {
        errors.push(`${label}.printed_attachment_id: duplicate ${record.printed_attachment_id}`);
      }
      seen.add(record.printed_attachment_id);
    }
    if (typeof record.relationship_type === "string" && !ALLOWED_RELATIONSHIPS.has(record.relationship_type)) {
      warnings.push(`${label}.relationship_type: unknown value ${record.relationship_type}`);
    }
    if (typeof record.editorial_status === "string" && !ALLOWED_EDITORIAL_STATUSES.has(record.editorial_status)) {
      warnings.push(`${label}.editorial_status: unknown value ${record.editorial_status}`);
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
    schema_version: "frus-printed-attachment-registry-validation-v1",
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
    console.log(`FRUS printed attachment registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(
      `FRUS printed attachment registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS printed attachment registry validation failed: ${error.message}`);
  process.exit(1);
}
