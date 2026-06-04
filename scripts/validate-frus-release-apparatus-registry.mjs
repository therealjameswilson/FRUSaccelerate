#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-release-apparatus-registry-v1";
const ALLOWED_RELEASE_ITEM_TYPES = new Set([
  "status_page_publication",
  "volume_page_downloads",
  "ebook_catalog_entry",
  "press_release",
  "media_note",
  "gpo_bookstore_link",
  "errata_correction",
  "online_correction",
  "print_revision_note",
  "unknown"
]);
const ALLOWED_DATE_TYPES = new Set([
  "release_date",
  "ebook_last_updated",
  "correction_date",
  "download_capture_date",
  "status_capture_date",
  "not_applicable",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_release_record",
  "verified_published_download_record",
  "verified_published_ebook_record",
  "verified_published_errata_record",
  "verified_local_release_record",
  "needs_release_basis",
  "needs_download_basis",
  "needs_ebook_basis",
  "needs_errata_basis",
  "needs_gpo_or_isbn_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-release-apparatus-registry.mjs --registry registry.json [--format text|json]");
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

function validateDate(value, label, warnings) {
  if (typeof value !== "string" || value.trim() === "") return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) warnings.push(`${label}: expected YYYY-MM-DD when a precise date is supplied`);
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["release_apparatus_registry_id", "captured_at", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
  validateDate(registry.captured_at, "captured_at", warnings);
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
      "release_item_id",
      "volume_id",
      "document_id",
      "unit_scope",
      "release_item_type",
      "approved_phrase",
      "release_date",
      "public_url",
      "gpo_or_isbn",
      "ebook_last_updated",
      "errata_or_correction_status",
      "printed_volume_revision_status",
      "date_type",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (!Array.isArray(record.digital_formats)) errors.push(`${label}.digital_formats: expected array`);
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.release_item_id === "string") {
      if (seen.has(record.release_item_id)) errors.push(`${label}.release_item_id: duplicate ${record.release_item_id}`);
      seen.add(record.release_item_id);
    }
    if (typeof record.release_item_type === "string" && !ALLOWED_RELEASE_ITEM_TYPES.has(record.release_item_type)) {
      warnings.push(`${label}.release_item_type: unknown value ${record.release_item_type}`);
    }
    if (typeof record.date_type === "string" && !ALLOWED_DATE_TYPES.has(record.date_type)) {
      warnings.push(`${label}.date_type: unknown value ${record.date_type}`);
    }
    if (typeof record.verification_status === "string" && !ALLOWED_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    validateDate(record.release_date, `${label}.release_date`, warnings);
    validateDate(record.ebook_last_updated, `${label}.ebook_last_updated`, warnings);
    if (
      typeof record.source_url === "string" &&
      record.source_url &&
      !record.source_url.startsWith("https://history.state.gov/") &&
      !record.source_url.startsWith("https://static.history.state.gov/")
    ) {
      warnings.push(`${label}.source_url: expected history.state.gov or static.history.state.gov source URL`);
    }
  });
  return { errors, warnings };
}

function resultFor(registryPath, registry) {
  const { errors, warnings } = validateRegistry(registry);
  return {
    schema_version: "frus-release-apparatus-registry-validation-v1",
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
    console.log(`FRUS release-apparatus registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS release-apparatus registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS release-apparatus registry validation failed: ${error.message}`);
  process.exit(1);
}
