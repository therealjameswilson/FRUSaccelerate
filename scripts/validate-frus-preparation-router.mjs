#!/usr/bin/env node

import fs from "node:fs";

const VALID_CONFIDENCE = new Set(["official_status_title", "wrapper_confirmed", "tentative", "mixed"]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-preparation-router.mjs --router <router.json|-> --status-registry <status-registry.json> [--format json|text]"
  );
  process.exit(2);
}

function readJson(file, label) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function parseArgs(argv) {
  let routerPath = null;
  let statusRegistryPath = null;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--router") {
      routerPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-registry") {
      statusRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!routerPath || !statusRegistryPath || (routerPath === "-" && statusRegistryPath === "-")) usage();
  if (!new Set(["json", "text"]).has(format)) usage();
  return { routerPath, statusRegistryPath, format };
}

function countBy(values) {
  const result = {};
  for (const value of values) {
    result[value] = (result[value] || 0) + 1;
  }
  return result;
}

function validateStatusRegistry(registry, errors) {
  if (!isPlainObject(registry)) {
    errors.push("status_registry: expected object");
    return [];
  }
  if (registry.schema_version !== "frus-status-registry-v1") {
    errors.push("status_registry.schema_version: must be frus-status-registry-v1");
  }
  if (!Array.isArray(registry.entries)) {
    errors.push("status_registry.entries: expected array");
    return [];
  }
  return registry.entries.filter((entry, index) => {
    if (!isPlainObject(entry)) {
      errors.push(`status_registry.entries[${index}]: expected object`);
      return false;
    }
    if (typeof entry.entry_id !== "string" || entry.entry_id.length === 0) {
      errors.push(`status_registry.entries[${index}].entry_id: expected non-empty string`);
      return false;
    }
    if (typeof entry.production_stage !== "string" || entry.production_stage.length === 0) {
      errors.push(`status_registry.entries[${index}].production_stage: expected non-empty string`);
    }
    return true;
  });
}

function validateRouter(router, statusEntries) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(router)) {
    return { errors: ["router: expected object"], warnings, summary: {} };
  }
  if (router.schema_version !== "frus-preparation-router-v1") {
    errors.push("router.schema_version: must be frus-preparation-router-v1");
  }
  if (typeof router.captured_at !== "string" || router.captured_at.length === 0) {
    errors.push("router.captured_at: expected non-empty string");
  }
  if (!isPlainObject(router.stage_postures)) {
    errors.push("router.stage_postures: expected object");
  }
  if (!Array.isArray(router.family_definitions)) {
    errors.push("router.family_definitions: expected array");
  }
  if (!Array.isArray(router.routes)) {
    errors.push("router.routes: expected array");
  }

  const familyIds = new Set();
  for (const [index, family] of (router.family_definitions || []).entries()) {
    const label = `router.family_definitions[${index}]`;
    if (!isPlainObject(family)) {
      errors.push(`${label}: expected object`);
      continue;
    }
    if (typeof family.family_id !== "string" || family.family_id.length === 0) {
      errors.push(`${label}.family_id: expected non-empty string`);
    } else if (familyIds.has(family.family_id)) {
      errors.push(`${label}.family_id: duplicate ${family.family_id}`);
    } else {
      familyIds.add(family.family_id);
    }
    for (const key of ["label", "administration", "direct_edit_posture"]) {
      if (typeof family[key] !== "string" || family[key].length === 0) {
        errors.push(`${label}.${key}: expected non-empty string`);
      }
    }
    for (const key of ["source_families_to_preserve", "redline_priorities", "hazard_tags"]) {
      if (!Array.isArray(family[key]) || family[key].length === 0) {
        errors.push(`${label}.${key}: expected non-empty array`);
      }
    }
  }

  const statusIds = new Set(statusEntries.map((entry) => entry.entry_id));
  const statusById = new Map(statusEntries.map((entry) => [entry.entry_id, entry]));
  const routeIds = new Set();
  const routeStages = [];
  const routeFamilies = [];

  for (const [index, route] of (router.routes || []).entries()) {
    const label = `router.routes[${index}]`;
    if (!isPlainObject(route)) {
      errors.push(`${label}: expected object`);
      continue;
    }
    if (typeof route.entry_id !== "string" || route.entry_id.length === 0) {
      errors.push(`${label}.entry_id: expected non-empty string`);
      continue;
    }
    if (routeIds.has(route.entry_id)) {
      errors.push(`${label}.entry_id: duplicate ${route.entry_id}`);
    }
    routeIds.add(route.entry_id);
    if (!statusIds.has(route.entry_id)) {
      errors.push(`${label}.entry_id: not present in status registry`);
    }
    if (typeof route.family_id !== "string" || !familyIds.has(route.family_id)) {
      errors.push(`${label}.family_id: unknown family ${JSON.stringify(route.family_id)}`);
    } else {
      routeFamilies.push(route.family_id);
    }
    if (!VALID_CONFIDENCE.has(route.match_confidence)) {
      errors.push(`${label}.match_confidence: invalid value ${JSON.stringify(route.match_confidence)}`);
    }

    const statusEntry = statusById.get(route.entry_id);
    if (statusEntry) {
      const expectedPosture = router.stage_postures?.[statusEntry.production_stage]?.posture_id;
      if (!expectedPosture) {
        errors.push(`router.stage_postures.${statusEntry.production_stage}: missing posture for ${route.entry_id}`);
      } else if (route.stage_posture !== expectedPosture) {
        errors.push(`${label}.stage_posture: expected ${expectedPosture} for stage ${statusEntry.production_stage}`);
      }
      routeStages.push(statusEntry.production_stage);
    }
  }

  for (const entry of statusEntries) {
    if (!routeIds.has(entry.entry_id)) {
      errors.push(`router.routes: missing route for ${entry.entry_id}`);
    }
  }

  return {
    errors,
    warnings,
    summary: {
      status_entries: statusEntries.length,
      family_definitions: familyIds.size,
      routes: routeIds.size,
      by_stage: countBy(routeStages),
      by_family: countBy(routeFamilies)
    }
  };
}

function renderText(result) {
  if (result.status === "pass") {
    return `FRUS preparation router validation passed: ${result.summary.routes} routes, ${result.summary.family_definitions} families, ${result.summary.status_entries} status entries covered.\n`;
  }
  const lines = [`FRUS preparation router validation failed: ${result.errors.length} error${result.errors.length === 1 ? "" : "s"}.`];
  for (const error of result.errors) {
    lines.push(`- ${error}`);
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { routerPath, statusRegistryPath, format } = parseArgs(process.argv);
  const registryErrors = [];
  const statusRegistry = readJson(statusRegistryPath, statusRegistryPath);
  const statusEntries = validateStatusRegistry(statusRegistry, registryErrors);
  const router = readJson(routerPath, routerPath);
  const routerResult = validateRouter(router, statusEntries);
  const errors = [...registryErrors, ...routerResult.errors];
  const result = {
    schema_version: "frus-preparation-router-validation-v1",
    router: routerPath === "-" ? "stdin" : routerPath,
    status_registry: statusRegistryPath,
    captured_at: router.captured_at || "",
    summary: routerResult.summary,
    warnings: routerResult.warnings,
    errors,
    status: errors.length === 0 ? "pass" : "fail"
  };

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "pass") {
    process.stdout.write(renderText(result));
  } else {
    process.stderr.write(renderText(result));
  }

  process.exit(result.status === "pass" ? 0 : 1);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
