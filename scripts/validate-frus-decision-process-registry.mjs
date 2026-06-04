#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-decision-process-registry-v1";
const PROCESS_TYPES = new Set([
  "national_security_review",
  "national_security_review_file",
  "national_security_review_response",
  "national_security_decision_directive",
  "national_security_decision_directive_signature",
  "national_security_study_directive",
  "national_security_study_directive_boundary",
  "draft_directive_attached",
  "directive_guidance",
  "policy_coordinating_committee_tasking",
  "deputies_committee_file",
  "nsc_meeting_or_tasking",
  "interagency_group_paper",
  "record_of_decision",
  "scheduled_publication_boundary",
  "printed_directive_target",
  "work_program_or_tab",
  "unknown"
]);
const VERIFICATION_STATUSES = new Set([
  "verified_published_decision_process_record",
  "verified_local_decision_process_record",
  "needs_decision_process_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-decision-process-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["decision_process_registry_id", "captured_at", "scope", "rule_summary"]) {
    requireString(registry[key], key, errors);
  }
  if (!Array.isArray(registry.source_urls) || registry.source_urls.length === 0) {
    errors.push("source_urls: expected non-empty array");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("records: expected array");
    return { errors, warnings, summary: { records: 0, by_process_type: {} } };
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
      "decision_process_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "process_type",
      "approved_phrase",
      "process_identifier",
      "process_body",
      "decision_stage",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record[key], `${label}.${key}`, errors, {
        nonempty: !["document_number"].includes(key)
      });
    }
    if (typeof record.decision_process_id === "string") {
      if (seen.has(record.decision_process_id)) errors.push(`${label}.decision_process_id: duplicate ${record.decision_process_id}`);
      seen.add(record.decision_process_id);
    }
    if (typeof record.process_type === "string" && !PROCESS_TYPES.has(record.process_type)) {
      warnings.push(`${label}.process_type: unknown value ${record.process_type}`);
    }
    if (typeof record.verification_status === "string" && !VERIFICATION_STATUSES.has(record.verification_status)) {
      warnings.push(`${label}.verification_status: unknown value ${record.verification_status}`);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.source_url === "string" && !record.source_url.startsWith("https://history.state.gov/historicaldocuments/")) {
      warnings.push(`${label}.source_url: expected history.state.gov historicaldocuments URL`);
    }
    byType[record.process_type] = (byType[record.process_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      records: registry.records.length,
      by_process_type: byType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-decision-process-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary,
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS decision-process registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS decision-process registry validation ${result.status}: ${result.summary.records} records, ${result.warnings.length} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS decision-process registry validation failed: ${error.message}`);
  process.exit(1);
}
