#!/usr/bin/env node

import fs from "node:fs";

const COMMUNICATIONS_TYPES = new Set([
  "telegram",
  "telegram_with_special_designator",
  "presidential_message",
  "joint_state_defense_message",
  "referenced_telegram",
  "source_note_telegram_reference",
  "memorandum_of_conversation",
  "telcon",
  "message",
  "diplomatic_letter_delivery",
  "joint_statement_exchange",
  "joint_statement",
  "reciprocal_statement",
  "unilateral_statement",
  "exchange_of_notes",
  "unknown"
]);

const VERIFICATION_STATUSES = new Set([
  "verified_published_communications_record",
  "verified_local_communications_record",
  "needs_message_identifier",
  "needs_date_time_group",
  "needs_origin_addressee",
  "needs_source_note_basis",
  "unknown"
]);

const OPTIONAL_EMPTY_FIELDS = new Set([
  "special_designator",
  "date_time_group",
  "drafting_clearance_approval",
  "reference_context"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-communications-registry.mjs --registry <communications-registry.json|-> [--format json|text]");
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
  if (!registryPath || !new Set(["json", "text"]).has(format)) usage();
  return { registryPath, format };
}

function readJson(file) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeForm(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function requireString(value, label, errors, { nonempty = true } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
  } else if (nonempty && value.length === 0) {
    errors.push(`${label}: must not be empty`);
  }
}

function duplicateValues(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== "frus-communications-registry-v1") {
    errors.push("$.schema_version: must be frus-communications-registry-v1");
  }
  requireString(registry.communications_registry_id, "$.communications_registry_id", errors);
  requireString(registry.captured_at, "$.captured_at", errors);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(registry.captured_at || "")) {
    errors.push("$.captured_at: expected YYYY-MM-DD");
  }
  if (!Array.isArray(registry.source_urls) || registry.source_urls.length === 0) {
    errors.push("$.source_urls: expected non-empty array");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("$.records: expected array");
    return { errors, warnings };
  }

  const ids = new Set();
  const formMap = new Map();
  const typeCounts = {};
  const statusCounts = {};

  registry.records.forEach((record, index) => {
    const label = `$.records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "communications_id",
      "volume_id",
      "document_id",
      "document_number",
      "communications_type",
      "approved_heading_form",
      "message_identifier",
      "special_designator",
      "origin",
      "addressees",
      "date_time_line",
      "date_time_group",
      "subject_or_title",
      "source_family",
      "source_note_form",
      "classification_or_handling_summary",
      "drafting_clearance_approval",
      "reference_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors, { nonempty: !OPTIONAL_EMPTY_FIELDS.has(key) });
    }
    if (ids.has(record.communications_id)) {
      errors.push(`${label}.communications_id: duplicate ${record.communications_id}`);
    }
    ids.add(record.communications_id);
    if (!COMMUNICATIONS_TYPES.has(record.communications_type)) {
      errors.push(`${label}.communications_type: invalid value ${JSON.stringify(record.communications_type)}`);
    }
    if (!VERIFICATION_STATUSES.has(record.verification_status)) {
      errors.push(`${label}.verification_status: invalid value ${JSON.stringify(record.verification_status)}`);
    }
    if (record.communications_type === "telegram_with_special_designator" && !String(record.special_designator || "").trim()) {
      errors.push(`${label}.special_designator: required for telegram_with_special_designator`);
    }
    if (record.special_designator && !String(record.message_identifier || "").includes(record.special_designator)) {
      warnings.push(`${label}.message_identifier: does not include special_designator ${JSON.stringify(record.special_designator)}`);
    }
    if (!Array.isArray(record.variant_forms)) {
      errors.push(`${label}.variant_forms: expected array`);
    } else {
      const normalizedVariants = record.variant_forms.map(normalizeForm).filter(Boolean);
      for (const dupe of duplicateValues(normalizedVariants)) {
        warnings.push(`${label}.variant_forms: repeated normalized variant ${JSON.stringify(dupe)}`);
      }
    }
    if (!/^https:\/\/history\.state\.gov\/historicaldocuments\//.test(record.source_url || "")) {
      warnings.push(`${label}.source_url: not a history.state.gov historicaldocuments URL`);
    }

    typeCounts[record.communications_type] = (typeCounts[record.communications_type] || 0) + 1;
    statusCounts[record.verification_status] = (statusCounts[record.verification_status] || 0) + 1;

    const forms = [
      record.approved_heading_form,
      record.message_identifier,
      record.date_time_line,
      record.date_time_group,
      record.source_note_form,
      record.reference_context,
      ...(record.variant_forms || [])
    ]
      .map(normalizeForm)
      .filter(Boolean);
    for (const form of forms) {
      const key = `${record.volume_id}\u0000${record.document_id}\u0000${form}`;
      const existing = formMap.get(key);
      if (existing && existing !== record.communications_id) {
        warnings.push(`${label}: communications form ${JSON.stringify(form)} also appears in ${existing}`);
      } else {
        formMap.set(key, record.communications_id);
      }
    }
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_communications_type: typeCounts,
      by_verification_status: statusCounts
    }
  };
}

function renderText(result) {
  if (result.status === "pass" || result.status === "warning") {
    const lines = [
      `FRUS communications registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`
    ];
    for (const warning of result.warnings) lines.push(`warning: ${warning}`);
    return `${lines.join("\n")}\n`;
  }
  const lines = [`FRUS communications registry validation failed: ${result.errors.length} errors.`];
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-communications-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || {
      records: 0,
      by_communications_type: {},
      by_verification_status: {}
    },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (result.status === "fail") process.exit(1);
} catch (error) {
  console.error(`FRUS communications registry validation failed: ${error.message}`);
  process.exit(1);
}
