#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-visual-material-registry-v1";
const ALLOWED_VISUAL_TYPES = new Set([
  "map",
  "photograph",
  "photograph_exchange",
  "chart",
  "diagram",
  "image",
  "appendix_image",
  "facsimile",
  "graphic_attachment",
  "source_image_only",
  "unknown"
]);
const ALLOWED_RELATIONSHIPS = new Set([
  "attached_but_not_printed",
  "not_found",
  "not_attached",
  "printed_in_parent",
  "printed_elsewhere",
  "printed_in_appendix",
  "appendix_image_link",
  "appendix_image_reverse_link",
  "discussed_in_document",
  "public_source_image",
  "source_image_only",
  "unknown"
]);
const ALLOWED_PUBLICATION_STATUSES = new Set([
  "attached_not_printed",
  "not_found",
  "not_attached",
  "printed_parent",
  "printed_elsewhere",
  "printed_appendix",
  "discussed_only",
  "public_source",
  "source_image_reference",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_visual_material_record",
  "verified_local_visual_material_record",
  "needs_visual_material_basis",
  "needs_source_image",
  "needs_caption",
  "needs_visual_description",
  "needs_identification_basis",
  "needs_attachment_status",
  "needs_printed_target",
  "needs_cross_reference",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-visual-material-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["visual_material_registry_id", "captured_at", "scope"]) {
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
      "visual_material_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "visual_type",
      "approved_phrase",
      "caption_or_title",
      "visual_description",
      "relationship_to_document",
      "attachment_or_publication_status",
      "source_image_or_url",
      "printed_target",
      "cross_reference_target",
      "identification_basis",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.visual_material_id === "string") {
      if (seen.has(record.visual_material_id)) errors.push(`${label}.visual_material_id: duplicate ${record.visual_material_id}`);
      seen.add(record.visual_material_id);
    }
    if (typeof record.visual_type === "string" && !ALLOWED_VISUAL_TYPES.has(record.visual_type)) {
      warnings.push(`${label}.visual_type: unknown value ${record.visual_type}`);
    }
    if (typeof record.relationship_to_document === "string" && !ALLOWED_RELATIONSHIPS.has(record.relationship_to_document)) {
      warnings.push(`${label}.relationship_to_document: unknown value ${record.relationship_to_document}`);
    }
    if (
      typeof record.attachment_or_publication_status === "string" &&
      !ALLOWED_PUBLICATION_STATUSES.has(record.attachment_or_publication_status)
    ) {
      warnings.push(`${label}.attachment_or_publication_status: unknown value ${record.attachment_or_publication_status}`);
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
    schema_version: "frus-visual-material-registry-validation-v1",
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
    console.log(`FRUS visual material registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS visual material registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS visual material registry validation failed: ${error.message}`);
  process.exit(1);
}
