#!/usr/bin/env node

import fs from "node:fs";

const SCHEMA_VERSION = "frus-source-family-registry-v1";
const ALLOWED_SOURCE_FAMILY_TYPES = new Set([
  "presidential_library",
  "state_department_lot_file",
  "central_foreign_policy_file",
  "electronic_message_system",
  "public_source",
  "private_papers",
  "agency_records",
  "unknown"
]);
const ALLOWED_VERIFICATION_STATUSES = new Set([
  "verified_published_source_family",
  "verified_local_source_family",
  "needs_source_family_basis",
  "unknown"
]);

function usage() {
  console.error("Usage: node scripts/validate-frus-source-family-registry.mjs --registry registry.json [--format text|json]");
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

function requireString(record, key, label, errors) {
  if (typeof record[key] !== "string" || record[key].trim() === "") {
    errors.push(`${label}.${key}: expected non-empty string`);
  }
}

function requireArray(record, key, label, errors) {
  if (!Array.isArray(record[key])) errors.push(`${label}.${key}: expected array`);
}

function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(registry)) return { errors: ["registry: expected object"], warnings };
  if (registry.schema_version !== SCHEMA_VERSION) errors.push(`schema_version: must be ${SCHEMA_VERSION}`);
  for (const key of ["source_family_registry_id", "captured_at", "scope"]) {
    if (typeof registry[key] !== "string" || registry[key].trim() === "") {
      errors.push(`${key}: expected non-empty string`);
    }
  }
  if (!Array.isArray(registry.source_urls)) errors.push("source_urls: expected array");
  if (!Array.isArray(registry.families)) {
    errors.push("families: expected array");
    return { errors, warnings };
  }

  const seen = new Set();
  const byFamilyType = {};
  registry.families.forEach((family, index) => {
    const label = `families[${index}]`;
    if (!isPlainObject(family)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "source_family_id",
      "volume_id",
      "display_family",
      "source_family_type",
      "source_or_context",
      "source_url",
      "verification_status"
    ]) {
      requireString(family, key, label, errors);
    }
    for (const key of [
      "volume_scope",
      "distinguishing_tokens",
      "required_components_when_present",
      "do_not_flatten_to",
      "variant_forms"
    ]) {
      requireArray(family, key, label, errors);
    }
    if (typeof family.source_family_id === "string") {
      if (seen.has(family.source_family_id)) {
        errors.push(`${label}.source_family_id: duplicate ${family.source_family_id}`);
      }
      seen.add(family.source_family_id);
    }
    if (typeof family.source_family_type === "string" && !ALLOWED_SOURCE_FAMILY_TYPES.has(family.source_family_type)) {
      warnings.push(`${label}.source_family_type: unknown value ${family.source_family_type}`);
    }
    if (
      typeof family.verification_status === "string" &&
      !ALLOWED_VERIFICATION_STATUSES.has(family.verification_status)
    ) {
      warnings.push(`${label}.verification_status: unknown value ${family.verification_status}`);
    }
    if (typeof family.source_url === "string" && !family.source_url.startsWith("https://history.state.gov/")) {
      warnings.push(`${label}.source_url: expected history.state.gov source URL for published examples`);
    }
    if (
      Array.isArray(family.distinguishing_tokens) &&
      family.distinguishing_tokens.filter((token) => typeof token === "string" && token.trim()).length === 0
    ) {
      warnings.push(`${label}.distinguishing_tokens: expected at least one usable token`);
    }
    byFamilyType[family.source_family_type] = (byFamilyType[family.source_family_type] || 0) + 1;
  });

  return {
    errors,
    warnings,
    summary: {
      families: registry.families.length,
      warnings: warnings.length,
      errors: errors.length,
      by_source_family_type: byFamilyType
    }
  };
}

try {
  const options = parseArgs(process.argv);
  const registry = readJson(options.registryPath);
  const validation = validateRegistry(registry);
  const result = {
    schema_version: "frus-source-family-registry-validation-v1",
    registry: options.registryPath,
    status: validation.errors.length > 0 ? "fail" : validation.warnings.length > 0 ? "warning" : "pass",
    summary: validation.summary || { families: 0, warnings: validation.warnings.length, errors: validation.errors.length },
    warnings: validation.warnings,
    errors: validation.errors
  };
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "fail") {
    console.log(`FRUS source-family registry validation failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    for (const error of result.errors) console.log(`- ${error}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  } else {
    console.log(`FRUS source-family registry validation ${result.status}: ${result.summary.families} families, ${result.summary.warnings} warnings.`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS source-family registry validation failed: ${error.message}`);
  process.exit(1);
}
