#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const KNOWN_RULE_IDS = new Set([
  "FAS-GEN-000",
  "FAS-SN-001",
  "FAS-SN-002",
  "FAS-SN-003",
  "FAS-SN-004",
  "FAS-SN-005",
  "FAS-SN-006",
  "FAS-CLS-001",
  "FAS-CLS-002",
  "FAS-DEC-001",
  "FAS-EDM-001",
  "FAS-XR-001",
  "FAS-STAT-001",
  "FAS-ATT-001",
  "FAS-NEG-001",
  "FAS-CHRON-001",
  "FAS-PHYS-001",
  "FAS-PUB-001",
  "FAS-AUTH-001",
  "FAS-FAM-001",
  "FAS-WORK-001",
  "FAS-WRAP-001",
  "FAS-GE-001"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-checker-output.mjs [--schema reports/frus-annotation-checker-output.schema.json] <output.json|->"
  );
  process.exit(2);
}

function readJson(file) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function asSet(values) {
  return new Set(values || []);
}

function keysOf(object) {
  return object && typeof object === "object" && !Array.isArray(object)
    ? Object.keys(object)
    : [];
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label}: expected object`);
    return false;
  }
  return true;
}

function requireArray(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label}: expected array`);
    return false;
  }
  return true;
}

function requireString(value, label, errors, { nonempty = false } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
    return;
  }
  if (nonempty && value.length === 0) {
    errors.push(`${label}: must not be empty`);
  }
}

function rejectExtraKeys(value, label, allowed, errors) {
  for (const key of keysOf(value)) {
    if (!allowed.has(key)) {
      errors.push(`${label}.${key}: unexpected field`);
    }
  }
}

function requireKeys(value, label, required, errors) {
  for (const key of required) {
    if (!(key in value)) {
      errors.push(`${label}.${key}: missing required field`);
    }
  }
}

function requireEnum(value, label, allowed, errors) {
  if (!allowed.has(value)) {
    errors.push(`${label}: invalid value ${JSON.stringify(value)}`);
  }
}

function loadArgs(argv) {
  let schemaPath = "reports/frus-annotation-checker-output.schema.json";
  let inputPath = null;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--schema") {
      schemaPath = argv[i + 1];
      i += 1;
      if (!schemaPath) usage();
    } else if (!inputPath) {
      inputPath = arg;
    } else {
      usage();
    }
  }
  if (!inputPath) usage();
  return { schemaPath, inputPath };
}

function validate(output, schema) {
  const errors = [];
  const warnings = [];

  const enums = {
    overallStatus: asSet(schema.properties.document_assessment.properties.overall_status.enum),
    readinessStatus: asSet(schema.properties.batch_readiness.properties.readiness_status.enum),
    gateId: asSet(schema.$defs.readiness_gate.properties.gate_id.enum),
    gateStatus: asSet(schema.$defs.readiness_gate.properties.gate_status.enum),
    severity: asSet(schema.$defs.check.properties.severity.enum),
    category: asSet(schema.$defs.category.enum),
    action: asSet(schema.$defs.check.properties.recommended_action.enum),
    evidenceRequest: asSet(schema.$defs.evidence_request.enum),
    globalSeverity: asSet(schema.$defs.global_comment.properties.severity.enum),
    styleCategory: asSet(schema.$defs.style_category.enum),
    risk: asSet(schema.$defs.style_discrepancy.properties.risk.enum),
    checkerAction: asSet(schema.$defs.style_discrepancy.properties.checker_action.enum),
    discrepancyStatus: asSet(schema.$defs.style_discrepancy.properties.status.enum)
  };

  const topKeys = new Set([
    "schema_version",
    "document_assessment",
    "batch_readiness",
    "checks",
    "global_comments",
    "style_discrepancy_tally"
  ]);
  const assessmentKeys = new Set(["overall_status", "summary", "blocked_reason"]);
  const readinessKeys = new Set([
    "readiness_status",
    "safe_to_apply_tracked_changes",
    "readiness_summary",
    "gates"
  ]);
  const gateKeys = new Set(["gate_id", "gate_status", "finding", "required_action"]);
  const checkKeys = new Set([
    "unit_id",
    "rule_id",
    "severity",
    "category",
    "finding",
    "standard",
    "recommended_action",
    "original_text",
    "replacement_text",
    "comment_text",
    "evidence_request",
    "verification_target"
  ]);
  const globalCommentKeys = new Set(["severity", "comment_text"]);
  const discrepancyKeys = new Set([
    "discrepancy_id",
    "category",
    "style_question",
    "variant_a",
    "variant_b",
    "unit_ids",
    "published_or_local_examples",
    "count",
    "risk",
    "checker_action",
    "general_editor_question",
    "status",
    "first_seen",
    "last_seen",
    "resolution_note"
  ]);

  if (!requireObject(output, "$", errors)) return { errors, warnings };
  rejectExtraKeys(output, "$", topKeys, errors);
  requireKeys(output, "$", topKeys, errors);
  if (output.schema_version !== "checker-output-v1") {
    errors.push("$.schema_version: must be checker-output-v1");
  }

  if (requireObject(output.document_assessment, "$.document_assessment", errors)) {
    const item = output.document_assessment;
    rejectExtraKeys(item, "$.document_assessment", assessmentKeys, errors);
    requireKeys(item, "$.document_assessment", assessmentKeys, errors);
    requireEnum(item.overall_status, "$.document_assessment.overall_status", enums.overallStatus, errors);
    requireString(item.summary, "$.document_assessment.summary", errors, { nonempty: true });
    requireString(item.blocked_reason, "$.document_assessment.blocked_reason", errors);
    if (item.overall_status === "blocked" && item.blocked_reason.length === 0) {
      errors.push("$.document_assessment.blocked_reason: required when overall_status is blocked");
    }
  }

  let directEditCount = 0;
  if (requireObject(output.batch_readiness, "$.batch_readiness", errors)) {
    const item = output.batch_readiness;
    rejectExtraKeys(item, "$.batch_readiness", readinessKeys, errors);
    requireKeys(item, "$.batch_readiness", readinessKeys, errors);
    requireEnum(item.readiness_status, "$.batch_readiness.readiness_status", enums.readinessStatus, errors);
    if (typeof item.safe_to_apply_tracked_changes !== "boolean") {
      errors.push("$.batch_readiness.safe_to_apply_tracked_changes: expected boolean");
    }
    requireString(item.readiness_summary, "$.batch_readiness.readiness_summary", errors, { nonempty: true });
    if (requireArray(item.gates, "$.batch_readiness.gates", errors)) {
      item.gates.forEach((gate, index) => {
        const label = `$.batch_readiness.gates[${index}]`;
        if (!requireObject(gate, label, errors)) return;
        rejectExtraKeys(gate, label, gateKeys, errors);
        requireKeys(gate, label, gateKeys, errors);
        requireEnum(gate.gate_id, `${label}.gate_id`, enums.gateId, errors);
        requireEnum(gate.gate_status, `${label}.gate_status`, enums.gateStatus, errors);
        requireString(gate.finding, `${label}.finding`, errors);
        requireString(gate.required_action, `${label}.required_action`, errors);
      });
    }
  }

  if (requireArray(output.checks, "$.checks", errors)) {
    output.checks.forEach((check, index) => {
      const label = `$.checks[${index}]`;
      if (!requireObject(check, label, errors)) return;
      rejectExtraKeys(check, label, checkKeys, errors);
      requireKeys(check, label, checkKeys, errors);
      requireString(check.unit_id, `${label}.unit_id`, errors, { nonempty: true });
      requireString(check.rule_id, `${label}.rule_id`, errors, { nonempty: true });
      if (typeof check.rule_id === "string" && !/^FAS-[A-Z]{2,6}-[0-9]{3}$/.test(check.rule_id)) {
        errors.push(`${label}.rule_id: invalid FRUS Annotation Spellcheck id`);
      } else if (typeof check.rule_id === "string" && !KNOWN_RULE_IDS.has(check.rule_id)) {
        errors.push(`${label}.rule_id: unknown FRUS Annotation Spellcheck id`);
      }
      requireEnum(check.severity, `${label}.severity`, enums.severity, errors);
      requireEnum(check.category, `${label}.category`, enums.category, errors);
      requireString(check.finding, `${label}.finding`, errors, { nonempty: true });
      requireString(check.standard, `${label}.standard`, errors, { nonempty: true });
      requireEnum(check.recommended_action, `${label}.recommended_action`, enums.action, errors);
      requireString(check.original_text, `${label}.original_text`, errors);
      requireString(check.replacement_text, `${label}.replacement_text`, errors);
      requireString(check.comment_text, `${label}.comment_text`, errors);
      requireEnum(check.evidence_request, `${label}.evidence_request`, enums.evidenceRequest, errors);
      requireString(check.verification_target, `${label}.verification_target`, errors);

      if (DIRECT_ACTIONS.has(check.recommended_action)) {
        directEditCount += 1;
        if (!check.original_text) {
          errors.push(`${label}.original_text: required for direct edits`);
        }
        if (check.evidence_request !== "none") {
          errors.push(`${label}.evidence_request: direct edits must not carry unresolved evidence requests`);
        }
      }
      if (
        (check.recommended_action === "replace_text" || check.recommended_action === "insert_after_text") &&
        !check.replacement_text
      ) {
        errors.push(`${label}.replacement_text: required for ${check.recommended_action}`);
      }
      if (check.recommended_action === "comment_only" && !check.comment_text) {
        errors.push(`${label}.comment_text: required for comment_only`);
      }
      if (check.recommended_action === "no_change") {
        if (check.evidence_request !== "none") {
          errors.push(`${label}.evidence_request: no_change findings must use none`);
        }
        if (check.original_text || check.replacement_text || check.comment_text || check.verification_target) {
          warnings.push(`${label}: no_change usually leaves edit/comment fields empty`);
        }
      }
      if (check.evidence_request !== "none" && !check.verification_target) {
        errors.push(`${label}.verification_target: required when evidence_request is not none`);
      }
    });
  }

  const readiness = output.batch_readiness || {};
  if (
    directEditCount > 0 &&
    (readiness.readiness_status !== "ready_for_tracked_changes" ||
      readiness.safe_to_apply_tracked_changes !== true)
  ) {
    errors.push(
      "$.checks: direct edits require readiness_status ready_for_tracked_changes and safe_to_apply_tracked_changes true"
    );
  }

  if (requireArray(output.global_comments, "$.global_comments", errors)) {
    output.global_comments.forEach((comment, index) => {
      const label = `$.global_comments[${index}]`;
      if (!requireObject(comment, label, errors)) return;
      rejectExtraKeys(comment, label, globalCommentKeys, errors);
      requireKeys(comment, label, globalCommentKeys, errors);
      requireEnum(comment.severity, `${label}.severity`, enums.globalSeverity, errors);
      requireString(comment.comment_text, `${label}.comment_text`, errors, { nonempty: true });
    });
  }

  if (requireArray(output.style_discrepancy_tally, "$.style_discrepancy_tally", errors)) {
    output.style_discrepancy_tally.forEach((item, index) => {
      const label = `$.style_discrepancy_tally[${index}]`;
      if (!requireObject(item, label, errors)) return;
      rejectExtraKeys(item, label, discrepancyKeys, errors);
      requireKeys(item, label, discrepancyKeys, errors);
      requireString(item.discrepancy_id, `${label}.discrepancy_id`, errors, { nonempty: true });
      if (typeof item.discrepancy_id === "string" && !/^style-discrepancy-[0-9]{4}$/.test(item.discrepancy_id)) {
        errors.push(`${label}.discrepancy_id: invalid discrepancy id`);
      }
      requireEnum(item.category, `${label}.category`, enums.styleCategory, errors);
      requireString(item.style_question, `${label}.style_question`, errors, { nonempty: true });
      requireString(item.variant_a, `${label}.variant_a`, errors);
      requireString(item.variant_b, `${label}.variant_b`, errors);
      requireArray(item.unit_ids, `${label}.unit_ids`, errors);
      requireArray(item.published_or_local_examples, `${label}.published_or_local_examples`, errors);
      if (!Number.isInteger(item.count) || item.count < 1) {
        errors.push(`${label}.count: expected positive integer`);
      }
      requireEnum(item.risk, `${label}.risk`, enums.risk, errors);
      requireEnum(item.checker_action, `${label}.checker_action`, enums.checkerAction, errors);
      requireString(item.general_editor_question, `${label}.general_editor_question`, errors, { nonempty: true });
      requireEnum(item.status, `${label}.status`, enums.discrepancyStatus, errors);
      requireString(item.first_seen, `${label}.first_seen`, errors);
      requireString(item.last_seen, `${label}.last_seen`, errors);
      requireString(item.resolution_note, `${label}.resolution_note`, errors);
    });
  }

  return { errors, warnings };
}

const { schemaPath, inputPath } = loadArgs(process.argv);
const schema = readJson(schemaPath);
const output = readJson(inputPath);
const result = validate(output, schema);

for (const warning of result.warnings) {
  console.error(`warning: ${warning}`);
}

if (result.errors.length > 0) {
  console.error(`FRUS checker output validation failed (${result.errors.length} error${result.errors.length === 1 ? "" : "s"}):`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `FRUS checker output validation passed: ${output.checks.length} checks, ${output.global_comments.length} global comments, ${output.style_discrepancy_tally.length} discrepancy items.`
);
