#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-handwritten-transcription-registry-v1";
const TRANSCRIPTION_TYPES = new Set([
  "handwritten_notes",
  "handwritten_letter",
  "editor_transcribed_portion",
  "original_brackets_ellipses",
  "unclear_or_illegible_reading",
  "facsimile_appendix_image",
  "marginalia_left_hand",
  "cut_off_line",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set([
  "verified_published_handwritten_transcription_record",
  "verified_local_handwritten_transcription_record",
  "needs_source_image",
  "needs_editor_transcription_basis",
  "needs_original_bracket_basis",
  "needs_unclear_or_illegible_basis",
  "needs_facsimile_target",
  "needs_cut_off_line_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-handwritten-transcription-registry.mjs --registry registry.json [--format text|json]"
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

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label, errors, { nonempty = true } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
  } else if (nonempty && value.trim() === "") {
    errors.push(`${label}: must not be empty`);
  }
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["handwritten_transcription_registry_id", "captured_at", "scope"]) {
    requireString(registry[key], key, errors);
  }
  if (!Array.isArray(registry.source_urls) || registry.source_urls.length === 0) {
    errors.push("source_urls: expected non-empty array");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("records: expected array");
    return { errors, warnings };
  }

  const seen = new Set();
  const byType = {};
  registry.records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "handwritten_item_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "transcription_type",
      "approved_phrase",
      "handwritten_source_status",
      "editor_transcription_basis",
      "facsimile_or_appendix_target",
      "original_text_convention",
      "unclear_or_illegible_handling",
      "cut_off_or_missing_text",
      "physical_location_or_margin",
      "related_event_or_diary_basis",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors, {
        nonempty: ![
          "facsimile_or_appendix_target",
          "original_text_convention",
          "unclear_or_illegible_handling",
          "cut_off_or_missing_text",
          "physical_location_or_margin",
          "related_event_or_diary_basis"
        ].includes(key)
      });
    }
    if (typeof record.handwritten_item_id === "string") {
      if (seen.has(record.handwritten_item_id)) {
        errors.push(`${label}.handwritten_item_id: duplicate ${record.handwritten_item_id}`);
      }
      seen.add(record.handwritten_item_id);
    }
    if (typeof record.transcription_type === "string" && !TRANSCRIPTION_TYPES.has(record.transcription_type)) {
      errors.push(`${label}.transcription_type: invalid value ${JSON.stringify(record.transcription_type)}`);
    }
    if (
      typeof record.verification_status === "string" &&
      !VERIFICATION_STATUSES.has(record.verification_status)
    ) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (!/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.source_url || "")) {
      warnings.push(`${label}.source_url: not a history.state.gov historicaldocuments URL`);
    }
    byType[record.transcription_type] = (byType[record.transcription_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_transcription_type: byType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-handwritten-transcription-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { records: 0, warnings: 0, errors: validation.errors.length, by_transcription_type: {} },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS handwritten/facsimile registry validation failed: ${result.errors.length} errors.`);
    for (const error of result.errors) console.log(`- ${error}`);
  } else {
    console.log(
      `FRUS handwritten/facsimile registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS handwritten/facsimile registry validation failed: ${error.message}`);
  process.exit(1);
}
