#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const COMMENT_ACTIONS = new Set(["comment_only", "no_change"]);

function usage() {
  console.error(
    "Usage: node scripts/preflight-frus-checker-plan.mjs --units <extracted-units.json> --output <checker-output.json|->"
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
  let unitsPath = null;
  let outputPath = null;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      outputPath = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!unitsPath || !outputPath || (unitsPath === "-" && outputPath === "-")) {
    usage();
  }

  return { unitsPath, outputPath };
}

function countExactMatches(haystack, needle) {
  if (!needle) return 0;

  let count = 0;
  let cursor = 0;

  while (cursor <= haystack.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) break;
    count += 1;
    cursor = found + needle.length;
  }

  return count;
}

function loadUnits(unitsDocument, errors) {
  if (!isPlainObject(unitsDocument)) {
    errors.push("$.units_document: expected object");
    return new Map();
  }

  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push("$.schema_version: must be frus-extracted-units-v1");
  }

  if (!Array.isArray(unitsDocument.units)) {
    errors.push("$.units: expected array");
    return new Map();
  }

  const units = new Map();

  unitsDocument.units.forEach((unit, index) => {
    const label = `$.units[${index}]`;

    if (!isPlainObject(unit)) {
      errors.push(`${label}: expected object`);
      return;
    }

    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${label}.unit_id: expected non-empty string`);
      return;
    }

    if (units.has(unit.unit_id)) {
      errors.push(`${label}.unit_id: duplicate unit id ${unit.unit_id}`);
    }

    if (typeof unit.exact_text !== "string") {
      errors.push(`${label}.exact_text: expected string`);
    }

    if (typeof unit.unit_type !== "string" || unit.unit_type.length === 0) {
      errors.push(`${label}.unit_type: expected non-empty string`);
    }

    if (typeof unit.word_part !== "string" || unit.word_part.length === 0) {
      errors.push(`${label}.word_part: expected non-empty string`);
    }

    if (!Array.isArray(unit.blocked_boundaries)) {
      errors.push(`${label}.blocked_boundaries: expected array`);
    }

    units.set(unit.unit_id, unit);
  });

  return units;
}

function validateReadiness(output, directEditCount, errors) {
  const readiness = output.batch_readiness;

  if (!isPlainObject(readiness)) {
    errors.push("$.batch_readiness: expected object");
    return;
  }

  const gates = Array.isArray(readiness.gates) ? readiness.gates : [];
  const failedGateIds = gates
    .filter((gate) => isPlainObject(gate) && gate.gate_status === "fail")
    .map((gate) => gate.gate_id || "unknown_gate");

  if (directEditCount > 0) {
    if (readiness.readiness_status !== "ready_for_tracked_changes") {
      errors.push("$.batch_readiness.readiness_status: direct edits require ready_for_tracked_changes");
    }
    if (readiness.safe_to_apply_tracked_changes !== true) {
      errors.push("$.batch_readiness.safe_to_apply_tracked_changes: direct edits require true");
    }
    if (failedGateIds.length > 0) {
      errors.push(`$.batch_readiness.gates: direct edits blocked by failed gates ${failedGateIds.join(", ")}`);
    }
  }
}

function validateCheckAgainstUnit(check, unit, label, errors, warnings) {
  const action = check.recommended_action;

  if (DIRECT_ACTIONS.has(action)) {
    if (unit.editability !== "editable") {
      errors.push(`${label}.unit_id: direct edit requires editability editable`);
    }
    if (unit.edit_safety !== "safe_to_edit") {
      errors.push(`${label}.unit_id: direct edit requires edit_safety safe_to_edit`);
    }
    if (unit.existing_revisions === true) {
      errors.push(`${label}.unit_id: direct edit overlaps existing tracked changes`);
    }
    if (Array.isArray(unit.blocked_boundaries) && unit.blocked_boundaries.length > 0) {
      errors.push(`${label}.unit_id: direct edit blocked by ${unit.blocked_boundaries.join(", ")}`);
    }
    if (unit.unit_type === "transcribed_document_text" && unit.allow_transcription_review !== true) {
      errors.push(`${label}.unit_id: direct edits to transcribed document text require allow_transcription_review true`);
    }
    if (check.evidence_request !== "none") {
      errors.push(`${label}.evidence_request: direct edit has unresolved evidence request`);
    }
    if (typeof check.original_text !== "string" || check.original_text.length === 0) {
      errors.push(`${label}.original_text: direct edit requires non-empty anchor text`);
      return;
    }

    const matchCount = countExactMatches(unit.exact_text || "", check.original_text);
    if (matchCount !== 1) {
      errors.push(`${label}.original_text: expected exactly one match in ${check.unit_id}; found ${matchCount}`);
    }

    if ((action === "replace_text" || action === "insert_after_text") && !check.replacement_text) {
      errors.push(`${label}.replacement_text: required for ${action}`);
    }
    if (action === "delete_text" && check.replacement_text) {
      errors.push(`${label}.replacement_text: delete_text requires empty replacement_text`);
    }
    if (action === "replace_text" && check.original_text === check.replacement_text) {
      warnings.push(`${label}: replacement_text is identical to original_text`);
    }
  } else if (COMMENT_ACTIONS.has(action)) {
    if (unit.comment_safety === "unsafe") {
      errors.push(`${label}.unit_id: comment anchor is marked unsafe`);
    }
  } else {
    errors.push(`${label}.recommended_action: unsupported action ${JSON.stringify(action)}`);
  }
}

function validateOutput(output, units) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(output)) {
    errors.push("$: expected checker-output object");
    return { errors, warnings, directEditCount: 0, commentActionCount: 0 };
  }

  if (!Array.isArray(output.checks)) {
    errors.push("$.checks: expected array");
    return { errors, warnings, directEditCount: 0, commentActionCount: 0 };
  }

  const directEditCount = output.checks.filter((check) => DIRECT_ACTIONS.has(check.recommended_action)).length;
  const commentActionCount = output.checks.filter((check) => COMMENT_ACTIONS.has(check.recommended_action)).length;

  validateReadiness(output, directEditCount, errors);

  output.checks.forEach((check, index) => {
    const label = `$.checks[${index}]`;
    if (!isPlainObject(check)) {
      errors.push(`${label}: expected object`);
      return;
    }

    const unit = units.get(check.unit_id);
    if (!unit) {
      errors.push(`${label}.unit_id: no matching extracted unit ${JSON.stringify(check.unit_id)}`);
      return;
    }

    validateCheckAgainstUnit(check, unit, label, errors, warnings);
  });

  if (Array.isArray(output.style_discrepancy_tally)) {
    output.style_discrepancy_tally.forEach((item, index) => {
      const label = `$.style_discrepancy_tally[${index}]`;
      if (!isPlainObject(item) || !Array.isArray(item.unit_ids)) return;

      item.unit_ids.forEach((unitId, unitIndex) => {
        if (!units.has(unitId)) {
          errors.push(`${label}.unit_ids[${unitIndex}]: no matching extracted unit ${JSON.stringify(unitId)}`);
        }
      });
    });
  }

  return { errors, warnings, directEditCount, commentActionCount };
}

try {
  const { unitsPath, outputPath } = parseArgs(process.argv);
  const unitErrors = [];
  const unitsDocument = readJson(unitsPath, unitsPath);
  const output = readJson(outputPath, outputPath);
  const units = loadUnits(unitsDocument, unitErrors);
  const result = validateOutput(output, units);
  const errors = [...unitErrors, ...result.errors];

  for (const warning of result.warnings) {
    console.error(`warning: ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`FRUS checker preflight failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `FRUS checker preflight passed: ${result.directEditCount} direct edits, ${result.commentActionCount} comment/no-change checks, ${units.size} extracted units.`
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
