#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-economic-financial-registry-v1";
const ALLOWED_FINANCIAL_TYPES = new Set([
  "imf_quota",
  "gab_arrangement",
  "budget_authority",
  "international_debt_metric",
  "debt_service_ratio",
  "arrearages_metric",
  "mdb_funding",
  "debt_strategy",
  "paris_club_debt_relief",
  "baker_plan",
  "world_bank_loan",
  "imf_world_bank_meeting",
  "aid_finance_program",
  "foreign_direct_investment",
  "commodity_policy",
  "exchange_rate_policy",
  "trade_finance",
  "unknown"
]);
const ALLOWED_STATUSES = new Set([
  "verified_published_economic_financial_record",
  "verified_local_economic_financial_record",
  "needs_financial_basis",
  "needs_general_editor_review",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-economic-financial-registry.mjs --registry registry.json [--format text|json]");
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
  for (const key of ["economic_financial_registry_id", "captured_at", "scope"]) {
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
      "economic_financial_id",
      "volume_id",
      "document_id",
      "document_number",
      "unit_scope",
      "financial_type",
      "approved_phrase",
      "institution_or_program",
      "amount_or_metric",
      "policy_context",
      "citation_or_locator",
      "public_or_archival_basis",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(record, key, label, errors);
    }
    if (typeof record.economic_financial_id === "string") {
      if (seen.has(record.economic_financial_id)) {
        errors.push(`${label}.economic_financial_id: duplicate ${record.economic_financial_id}`);
      }
      seen.add(record.economic_financial_id);
    }
    if (typeof record.financial_type === "string" && !ALLOWED_FINANCIAL_TYPES.has(record.financial_type)) {
      warnings.push(`${label}.financial_type: unknown value ${record.financial_type}`);
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
    schema_version: "frus-economic-financial-registry-validation-v1",
    registry: registryPath,
    status: errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    summary: {
      records: records.length,
      warnings: warnings.length,
      errors: errors.length,
      by_financial_type: countBy(records.map((record) => record.financial_type || "unknown"))
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
    console.log(`FRUS economic/financial registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS economic/financial registry validation ${result.status}: ${result.summary.records} records, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS economic/financial registry validation failed: ${error.message}`);
  process.exit(1);
}
