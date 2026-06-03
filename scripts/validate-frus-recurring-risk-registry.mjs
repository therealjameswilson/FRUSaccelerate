#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-recurring-risk-registry-v1";
const ALLOWED_RISK_FAMILIES = new Set([
  "telegram_numbering",
  "telegram_copy_basis",
  "cross_reference_slug",
  "document_xx_construction",
  "document_boundary",
  "footnote_placement",
  "footnote_referback",
  "word_autoformatting",
  "document_completeness",
  "source_note_shorthand",
  "backup_highlighting",
  "backup_telegram_header",
  "style_consistency",
  "unknown"
]);
const ALLOWED_DIRECT_EDIT_POLICIES = new Set(["comment_only_by_default", "allow_exact_cleanup", "comment_unless_context"]);
const ALLOWED_SEVERITIES = new Set(["info", "minor", "major", "critical"]);

function usage() {
  console.error("Usage: node scripts/validate-frus-recurring-risk-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["recurring_risk_registry_id", "captured_at", "source_basis", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
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
      "risk_id",
      "risk_family",
      "title",
      "anti_pattern",
      "approved_practice",
      "direct_edit_policy",
      "evidence_request",
      "comment_template",
      "severity",
      "source_basis"
    ]) {
      if (typeof record[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof record.risk_id === "string") {
      if (seen.has(record.risk_id)) errors.push(`${label}.risk_id: duplicate ${record.risk_id}`);
      seen.add(record.risk_id);
    }
    if (!Array.isArray(record.unit_types)) errors.push(`${label}.unit_types: expected array`);
    if (!Array.isArray(record.detector_patterns)) errors.push(`${label}.detector_patterns: expected array`);
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
    if (typeof record.risk_family === "string" && !ALLOWED_RISK_FAMILIES.has(record.risk_family)) {
      warnings.push(`${label}.risk_family: unknown value ${record.risk_family}`);
    }
    if (typeof record.direct_edit_policy === "string" && !ALLOWED_DIRECT_EDIT_POLICIES.has(record.direct_edit_policy)) {
      warnings.push(`${label}.direct_edit_policy: unknown value ${record.direct_edit_policy}`);
    }
    if (typeof record.severity === "string" && !ALLOWED_SEVERITIES.has(record.severity)) {
      warnings.push(`${label}.severity: unknown value ${record.severity}`);
    }
    if (Array.isArray(record.detector_patterns)) {
      record.detector_patterns.forEach((pattern, patternIndex) => {
        if (typeof pattern !== "string" || pattern.trim() === "") {
          errors.push(`${label}.detector_patterns[${patternIndex}]: expected non-empty string`);
          return;
        }
        try {
          new RegExp(pattern, "i");
        } catch (error) {
          errors.push(`${label}.detector_patterns[${patternIndex}]: invalid regex: ${error.message}`);
        }
      });
    }
  });
  return { errors, warnings };
}

function resultFor(registryPath, registry) {
  const { errors, warnings } = validateRegistry(registry);
  return {
    schema_version: "frus-recurring-risk-registry-validation-v1",
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
    console.log(`FRUS recurring-risk registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS recurring-risk registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS recurring-risk registry validation failed: ${error.message}`);
  process.exit(1);
}
