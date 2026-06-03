#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const STATUS_RANK = {
  pass: 0,
  pass_with_comments: 1,
  needs_revision: 2,
  blocked: 3
};
const READINESS_RANK = {
  ready_for_tracked_changes: 0,
  comment_only_review: 1,
  needs_human_triage: 2,
  blocked: 3
};
const SEVERITY_RANK = {
  info: 0,
  minor: 1,
  major: 2,
  blocker: 3
};

function usage() {
  console.error(
    "Usage: node scripts/merge-frus-checker-chunks.mjs --manifest chunk-manifest.json --output chunk-id=output.json [--output chunk-id=output.json] [--out merged-output.json] [--format json|text] [--allow-missing-coverage]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let manifestPath = null;
  const outputSpecs = [];
  let outPath = null;
  let format = "json";
  let allowMissingCoverage = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--manifest") {
      manifestPath = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      outputSpecs.push(argv[index + 1]);
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else if (arg === "--allow-missing-coverage") {
      allowMissingCoverage = true;
    } else {
      usage();
    }
  }

  if (!manifestPath || outputSpecs.length === 0 || !new Set(["json", "text"]).has(format)) usage();
  return { manifestPath, outputSpecs, outPath, format, allowMissingCoverage };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function validateManifest(manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return ["manifest: expected object"];
  if (manifest.schema_version !== "frus-llm-chunk-manifest-v1") {
    errors.push("manifest.schema_version: must be frus-llm-chunk-manifest-v1");
  }
  if (!Array.isArray(manifest.chunks)) {
    errors.push("manifest.chunks: expected array");
    return errors;
  }
  const seenUnits = new Map();
  const seenChunks = new Set();
  manifest.chunks.forEach((chunk, index) => {
    const label = `manifest.chunks[${index}]`;
    if (!isPlainObject(chunk)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof chunk.chunk_id !== "string" || chunk.chunk_id.length === 0) {
      errors.push(`${label}.chunk_id: expected non-empty string`);
    } else if (seenChunks.has(chunk.chunk_id)) {
      errors.push(`${label}.chunk_id: duplicate ${chunk.chunk_id}`);
    } else {
      seenChunks.add(chunk.chunk_id);
    }
    if (!Array.isArray(chunk.unit_ids)) errors.push(`${label}.unit_ids: expected array`);
    if (!Array.isArray(chunk.reviewable_unit_ids)) errors.push(`${label}.reviewable_unit_ids: expected array`);
    for (const unitId of chunk.unit_ids || []) {
      if (seenUnits.has(unitId)) {
        errors.push(`${label}.unit_ids: unit ${unitId} also appears in ${seenUnits.get(unitId)}`);
      } else {
        seenUnits.set(unitId, chunk.chunk_id);
      }
    }
  });
  return errors;
}

function parseOutputSpec(spec) {
  const eq = spec.indexOf("=");
  if (eq === -1) return { chunkId: "", filePath: spec };
  return {
    chunkId: spec.slice(0, eq),
    filePath: spec.slice(eq + 1)
  };
}

function validateOutput(output, label) {
  const errors = [];
  if (!isPlainObject(output)) return [`${label}: expected checker-output object`];
  if (output.schema_version !== "checker-output-v1") errors.push(`${label}.schema_version: must be checker-output-v1`);
  for (const key of ["document_assessment", "batch_readiness"]) {
    if (!isPlainObject(output[key])) errors.push(`${label}.${key}: expected object`);
  }
  for (const key of ["checks", "global_comments", "style_discrepancy_tally"]) {
    if (!Array.isArray(output[key])) errors.push(`${label}.${key}: expected array`);
  }
  return errors;
}

function strongest(values, rank, fallback) {
  return values.reduce((current, value) => (rank[value] > rank[current] ? value : current), fallback);
}

function directKey(check) {
  if (!DIRECT_ACTIONS.has(check.recommended_action)) return "";
  return [check.unit_id, check.recommended_action, check.original_text, check.replacement_text].join("\u0000");
}

function mergeOutputs({ manifest, outputSpecs, allowMissingCoverage }) {
  const errors = validateManifest(manifest);
  const warnings = [];
  const chunksById = new Map((manifest.chunks || []).map((chunk) => [chunk.chunk_id, chunk]));
  const outputsByChunk = new Map();
  const specs = outputSpecs.map(parseOutputSpec);

  specs.forEach((spec, index) => {
    const chunkId = spec.chunkId || manifest.chunks?.[index]?.chunk_id || "";
    if (!chunkId) {
      errors.push(`--output ${spec.filePath}: cannot infer chunk id`);
      return;
    }
    if (!chunksById.has(chunkId)) {
      errors.push(`--output ${spec.filePath}: unknown chunk id ${chunkId}`);
      return;
    }
    if (outputsByChunk.has(chunkId)) {
      errors.push(`--output ${spec.filePath}: duplicate output for ${chunkId}`);
      return;
    }
    const output = readJson(spec.filePath);
    errors.push(...validateOutput(output, spec.filePath));
    outputsByChunk.set(chunkId, { output, filePath: spec.filePath });
  });

  for (const chunk of manifest.chunks || []) {
    if (!outputsByChunk.has(chunk.chunk_id)) errors.push(`missing output for ${chunk.chunk_id}`);
  }

  const mergedChecks = [];
  const mergedGlobalComments = [];
  const mergedDiscrepancies = [];
  const directKeys = new Map();
  const coveredUnitIds = new Set();
  const chunkSummaries = [];
  const statuses = [];
  const readinessStatuses = [];
  let safeToApply = true;

  for (const chunk of manifest.chunks || []) {
    const item = outputsByChunk.get(chunk.chunk_id);
    if (!item) continue;
    const unitSet = new Set(chunk.unit_ids || []);
    const reviewableSet = new Set(chunk.reviewable_unit_ids || []);
    const output = item.output;
    statuses.push(output.document_assessment?.overall_status || "blocked");
    readinessStatuses.push(output.batch_readiness?.readiness_status || "blocked");
    safeToApply = safeToApply && output.batch_readiness?.safe_to_apply_tracked_changes === true;

    for (const [index, check] of (output.checks || []).entries()) {
      if (!unitSet.has(check.unit_id)) {
        errors.push(`${item.filePath}.checks[${index}].unit_id: ${check.unit_id} is outside ${chunk.chunk_id}`);
        continue;
      }
      coveredUnitIds.add(check.unit_id);
      const key = directKey(check);
      if (key) {
        if (directKeys.has(key)) {
          errors.push(`${item.filePath}.checks[${index}]: duplicate direct edit also seen in ${directKeys.get(key)}`);
        } else {
          directKeys.set(key, `${item.filePath}.checks[${index}]`);
        }
      }
      mergedChecks.push(check);
    }

    for (const [index, discrepancy] of (output.style_discrepancy_tally || []).entries()) {
      for (const unitId of discrepancy.unit_ids || []) {
        if (!unitSet.has(unitId)) {
          errors.push(`${item.filePath}.style_discrepancy_tally[${index}].unit_ids: ${unitId} is outside ${chunk.chunk_id}`);
        }
      }
      mergedDiscrepancies.push(discrepancy);
    }

    mergedGlobalComments.push(
      ...(output.global_comments || []).map((comment) => ({
        severity: comment.severity,
        comment_text: `[${chunk.chunk_id}] ${comment.comment_text}`
      }))
    );

    const missingCoverage = [...reviewableSet].filter((unitId) => !coveredUnitIds.has(unitId));
    chunkSummaries.push({
      chunk_id: chunk.chunk_id,
      output_file: item.filePath,
      unit_count: chunk.unit_ids.length,
      reviewable_unit_count: reviewableSet.size,
      checks: output.checks.length,
      missing_reviewable_unit_ids: missingCoverage
    });
  }

  const allReviewable = (manifest.chunks || []).flatMap((chunk) => chunk.reviewable_unit_ids || []);
  const missingReviewable = allReviewable.filter((unitId) => !coveredUnitIds.has(unitId));
  if (missingReviewable.length > 0) {
    const message = `reviewable units missing checker entries: ${missingReviewable.join(", ")}`;
    if (allowMissingCoverage) warnings.push(message);
    else errors.push(message);
  }

  mergedDiscrepancies.forEach((item, index) => {
    item.discrepancy_id = `style-discrepancy-${String(index + 1).padStart(4, "0")}`;
  });

  const overallStatus = errors.length > 0 ? "blocked" : strongest(statuses, STATUS_RANK, "pass");
  const readinessStatus = errors.length > 0 ? "blocked" : strongest(readinessStatuses, READINESS_RANK, "ready_for_tracked_changes");
  const highestSeverity = strongest(mergedChecks.map((check) => check.severity), SEVERITY_RANK, "info");
  const summary = {
    schema_version: "frus-chunk-reconciliation-v1",
    run_id: manifest.run_id || "",
    chunk_count: manifest.chunk_count || manifest.chunks?.length || 0,
    chunks_received: outputsByChunk.size,
    units_total: manifest.summary?.units_total || 0,
    reviewable_units: allReviewable.length,
    covered_reviewable_units: allReviewable.length - missingReviewable.length,
    checks_merged: mergedChecks.length,
    global_comments_merged: mergedGlobalComments.length,
    style_discrepancies_merged: mergedDiscrepancies.length,
    direct_edits_merged: mergedChecks.filter((check) => DIRECT_ACTIONS.has(check.recommended_action)).length,
    missing_reviewable_unit_ids: missingReviewable,
    highest_severity: highestSeverity,
    warnings,
    errors,
    chunks: chunkSummaries
  };

  const merged = {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: overallStatus,
      summary: `Merged ${mergedChecks.length} checks from ${outputsByChunk.size} FRUS LLM review chunks.`,
      blocked_reason: errors.length > 0 ? errors.join("; ") : ""
    },
    batch_readiness: {
      readiness_status: readinessStatus,
      safe_to_apply_tracked_changes: errors.length === 0 && readinessStatus === "ready_for_tracked_changes" && safeToApply,
      readiness_summary: `Chunk reconciliation ${errors.length === 0 ? "passed" : "failed"} for ${outputsByChunk.size} chunk outputs.`,
      gates: [
        {
          gate_id: "chunk_reconciliation",
          gate_status: errors.length === 0 ? (warnings.length > 0 ? "warning" : "pass") : "fail",
          finding: errors.length === 0 ? "Chunk outputs align with the chunk manifest." : errors.join("; "),
          required_action: errors.length === 0 ? "" : "Rerun or repair the affected chunk outputs before applying Word changes."
        }
      ]
    },
    checks: mergedChecks,
    global_comments: [
      ...mergedGlobalComments,
      {
        severity: errors.length > 0 || warnings.length > 0 ? "major" : "info",
        comment_text: `Chunk reconciliation: ${summary.covered_reviewable_units}/${summary.reviewable_units} reviewable units covered across ${summary.chunks_received}/${summary.chunk_count} chunks.`
      }
    ],
    style_discrepancy_tally: mergedDiscrepancies
  };

  return { summary, merged };
}

function renderText(result) {
  const { summary } = result;
  const lines = [
    `FRUS checker chunk merge ${summary.errors.length === 0 ? "passed" : "failed"}: ${summary.checks_merged} checks from ${summary.chunks_received}/${summary.chunk_count} chunks, ${summary.covered_reviewable_units}/${summary.reviewable_units} reviewable units covered.`
  ];
  for (const warning of summary.warnings) lines.push(`warning: ${warning}`);
  for (const error of summary.errors) lines.push(`error: ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const manifest = readJson(options.manifestPath);
  const result = mergeOutputs({ manifest, outputSpecs: options.outputSpecs, allowMissingCoverage: options.allowMissingCoverage });
  if (options.outPath) writeJson(options.outPath, result.merged);
  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(result));
  }
  if (result.summary.errors.length > 0) process.exit(1);
} catch (error) {
  console.error(`FRUS checker chunk merge failed: ${error.message}`);
  process.exit(1);
}
