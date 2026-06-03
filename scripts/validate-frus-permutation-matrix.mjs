#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_POLICIES = new Set([
  "exact_supported_edit_allowed",
  "comment_unless_context",
  "comment_only_by_default",
  "wrapper_gate_only",
  "no_change_or_comment"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-permutation-matrix.mjs --matrix <matrix.json|-> --schema <checker-output.schema.json> [--router <preparation-router.json>] [--format json|text]"
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
  let matrixPath = null;
  let schemaPath = null;
  let routerPath = null;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--matrix") {
      matrixPath = argv[index + 1];
      index += 1;
    } else if (arg === "--schema") {
      schemaPath = argv[index + 1];
      index += 1;
    } else if (arg === "--router") {
      routerPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!matrixPath || !schemaPath || (matrixPath === "-" && schemaPath === "-")) usage();
  if (!new Set(["json", "text"]).has(format)) usage();
  return { matrixPath, schemaPath, routerPath, format };
}

function duplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

function difference(left, right) {
  const rightSet = new Set(right);
  return [...new Set(left)].filter((value) => !rightSet.has(value)).sort();
}

function validateSchema(schema) {
  const errors = [];
  const categories = schema?.$defs?.category?.enum || [];
  const evidenceRequests = schema?.$defs?.evidence_request?.enum || [];
  const actions = schema?.$defs?.check?.properties?.recommended_action?.enum || [];

  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push("schema.$defs.category.enum: expected non-empty array");
  }
  if (!Array.isArray(evidenceRequests) || evidenceRequests.length === 0) {
    errors.push("schema.$defs.evidence_request.enum: expected non-empty array");
  }
  if (!Array.isArray(actions) || actions.length === 0) {
    errors.push("schema.$defs.check.properties.recommended_action.enum: expected non-empty array");
  }
  return { errors, categories, evidenceRequests, actions };
}

function validateCategoryPolicies(matrix, categories, evidenceRequests, actions, errors) {
  if (!Array.isArray(matrix.category_policies)) {
    errors.push("matrix.category_policies: expected array");
    return [];
  }
  const seenCategories = [];
  for (const [index, policy] of matrix.category_policies.entries()) {
    const label = `matrix.category_policies[${index}]`;
    if (!isPlainObject(policy)) {
      errors.push(`${label}: expected object`);
      continue;
    }
    if (typeof policy.category !== "string" || policy.category.length === 0) {
      errors.push(`${label}.category: expected non-empty string`);
    } else {
      seenCategories.push(policy.category);
      if (!categories.includes(policy.category)) {
        errors.push(`${label}.category: unknown category ${JSON.stringify(policy.category)}`);
      }
    }
    if (!DIRECT_POLICIES.has(policy.direct_edit_policy)) {
      errors.push(`${label}.direct_edit_policy: invalid value ${JSON.stringify(policy.direct_edit_policy)}`);
    }
    for (const key of ["required_context", "primary_evidence_requests", "safe_actions", "hazard_tags"]) {
      if (!Array.isArray(policy[key]) || policy[key].length === 0) {
        errors.push(`${label}.${key}: expected non-empty array`);
      }
    }
    for (const evidence of policy.primary_evidence_requests || []) {
      if (!evidenceRequests.includes(evidence)) {
        errors.push(`${label}.primary_evidence_requests: unknown evidence request ${JSON.stringify(evidence)}`);
      }
    }
    for (const action of policy.safe_actions || []) {
      if (!actions.includes(action)) {
        errors.push(`${label}.safe_actions: unknown action ${JSON.stringify(action)}`);
      }
    }
  }

  for (const dupe of duplicates(seenCategories)) {
    errors.push(`matrix.category_policies: duplicate category ${dupe}`);
  }
  for (const missing of difference(categories, seenCategories)) {
    errors.push(`matrix.category_policies: missing category ${missing}`);
  }
  return seenCategories;
}

function validateEvidencePolicies(matrix, evidenceRequests, errors) {
  if (!Array.isArray(matrix.evidence_request_policies)) {
    errors.push("matrix.evidence_request_policies: expected array");
    return [];
  }
  const seenEvidence = [];
  for (const [index, policy] of matrix.evidence_request_policies.entries()) {
    const label = `matrix.evidence_request_policies[${index}]`;
    if (!isPlainObject(policy)) {
      errors.push(`${label}: expected object`);
      continue;
    }
    if (typeof policy.evidence_request !== "string" || policy.evidence_request.length === 0) {
      errors.push(`${label}.evidence_request: expected non-empty string`);
    } else {
      seenEvidence.push(policy.evidence_request);
      if (!evidenceRequests.includes(policy.evidence_request)) {
        errors.push(`${label}.evidence_request: unknown evidence request ${JSON.stringify(policy.evidence_request)}`);
      }
    }
    if (typeof policy.owner_hint !== "string" || policy.owner_hint.length === 0) {
      errors.push(`${label}.owner_hint: expected non-empty string`);
    }
    for (const key of ["blocks_direct_edit_by_default", "blocks_final_publication_by_default"]) {
      if (typeof policy[key] !== "boolean") {
        errors.push(`${label}.${key}: expected boolean`);
      }
    }
    if (typeof policy.comment_target_template !== "string" || policy.comment_target_template.length === 0) {
      errors.push(`${label}.comment_target_template: expected non-empty string`);
    }
  }

  for (const dupe of duplicates(seenEvidence)) {
    errors.push(`matrix.evidence_request_policies: duplicate evidence_request ${dupe}`);
  }
  for (const missing of difference(evidenceRequests, seenEvidence)) {
    errors.push(`matrix.evidence_request_policies: missing evidence_request ${missing}`);
  }
  return seenEvidence;
}

function validateRouterCoverage(router, categories, evidenceRequests, matrix, errors) {
  if (!router) return { router_hazard_tags: 0 };
  if (router.schema_version !== "frus-preparation-router-v1") {
    errors.push("router.schema_version: must be frus-preparation-router-v1");
    return { router_hazard_tags: 0 };
  }
  const allowed = new Set([...categories, ...evidenceRequests]);
  const matrixHazards = new Set(
    (matrix.category_policies || []).flatMap((policy) => (Array.isArray(policy.hazard_tags) ? policy.hazard_tags : []))
  );
  const routerHazards = new Set();

  for (const [index, family] of (router.family_definitions || []).entries()) {
    if (!Array.isArray(family.hazard_tags)) {
      errors.push(`router.family_definitions[${index}].hazard_tags: expected array`);
      continue;
    }
    for (const tag of family.hazard_tags) {
      routerHazards.add(tag);
      if (!allowed.has(tag)) {
        errors.push(`router.family_definitions[${index}].hazard_tags: unknown tag ${JSON.stringify(tag)}`);
      }
      if (!matrixHazards.has(tag) && !evidenceRequests.includes(tag)) {
        errors.push(`matrix.category_policies.hazard_tags: missing router hazard ${tag}`);
      }
    }
  }

  return { router_hazard_tags: routerHazards.size };
}

function renderText(result) {
  if (result.status === "pass") {
    return `FRUS permutation matrix validation passed: ${result.summary.categories_covered} categories, ${result.summary.evidence_requests_covered} evidence requests, ${result.summary.router_hazard_tags} router hazards.\n`;
  }
  const lines = [`FRUS permutation matrix validation failed: ${result.errors.length} error${result.errors.length === 1 ? "" : "s"}.`];
  for (const error of result.errors) {
    lines.push(`- ${error}`);
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { matrixPath, schemaPath, routerPath, format } = parseArgs(process.argv);
  const matrix = readJson(matrixPath, matrixPath);
  const schema = readJson(schemaPath, schemaPath);
  const schemaResult = validateSchema(schema);
  const errors = [...schemaResult.errors];
  const router = routerPath ? readJson(routerPath, routerPath) : null;

  if (!isPlainObject(matrix)) {
    errors.push("matrix: expected object");
  } else if (matrix.schema_version !== "frus-annotation-permutation-matrix-v1") {
    errors.push("matrix.schema_version: must be frus-annotation-permutation-matrix-v1");
  }

  const seenCategories = isPlainObject(matrix)
    ? validateCategoryPolicies(matrix, schemaResult.categories, schemaResult.evidenceRequests, schemaResult.actions, errors)
    : [];
  const seenEvidence = isPlainObject(matrix)
    ? validateEvidencePolicies(matrix, schemaResult.evidenceRequests, errors)
    : [];
  const routerSummary = isPlainObject(matrix)
    ? validateRouterCoverage(router, schemaResult.categories, schemaResult.evidenceRequests, matrix, errors)
    : { router_hazard_tags: 0 };

  const result = {
    schema_version: "frus-permutation-matrix-validation-v1",
    matrix: matrixPath === "-" ? "stdin" : matrixPath,
    schema: schemaPath,
    router: routerPath || "",
    summary: {
      categories_covered: new Set(seenCategories).size,
      evidence_requests_covered: new Set(seenEvidence).size,
      router_hazard_tags: routerSummary.router_hazard_tags
    },
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
