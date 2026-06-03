#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
}

function checkerOutput(checks) {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Fixture for classification usage audit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Classification fixture.",
      gates: [
        {
          gate_id: "evidence_basis",
          gate_status: "pass",
          finding: "Fixture gate.",
          required_action: ""
        }
      ]
    },
    checks,
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-classification-audit-test-"));

try {
  const validation = run("scripts/validate-frus-classification-registry.mjs", [
    "--registry",
    "reports/frus-classification-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected classification registry validation to pass");
  assert(validationReport.summary.records === 5, "expected five classification records");

  const audit = run("scripts/audit-frus-classification-usage.mjs", [
    "--units",
    "reports/frus-classification-units.sample.json",
    "--registry",
    "reports/frus-classification-registry.sample.json",
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const auditReport = JSON.parse(audit.stdout);
  assert(auditReport.schema_version === "frus-classification-usage-audit-v1", "expected classification audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 6, "expected six scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 2, "expected approved classification matches");
  assert(auditReport.summary.by_usage_status.safe_variant_normalization >= 1, "expected safe no-classification variant");
  assert(auditReport.summary.by_usage_status.cross_volume_classification >= 2, "expected cross-volume classification warnings");
  assert(auditReport.summary.release_status_confusions === 1, "expected one release-status confusion");
  assert(auditReport.summary.unmatched_classification_like_units === 1, "expected one unmatched classification-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "classification-source-note-0005" &&
        usage.usage_status === "safe_variant_normalization" &&
        usage.approved_marking === "No classification marking"
    ),
    "expected No classification safe-normalization usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "classification-source-note-0004" &&
        usage.approved_marking === "Secret; Eyes Only; Not for the System" &&
        usage.usage_status === "cross_volume_classification"
    ),
    "expected Haig handling controls cross-volume warning"
  );

  const safeOutputPath = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "classification-source-note-0005",
          rule_id: "FAS-CLS-002",
          severity: "minor",
          category: "classification_handling",
          finding: "Normalize absence-of-marking phrase.",
          standard: "Use `No classification marking.` when the source supports verified absence of a marking.",
          recommended_action: "replace_text",
          original_text: "No classification.",
          replacement_text: "No classification marking.",
          comment_text: "",
          evidence_request: "none",
          verification_target: ""
        }
      ]),
      null,
      2
    )}\n`
  );
  const safeAudit = run("scripts/audit-frus-classification-usage.mjs", [
    "--units",
    "reports/frus-classification-units.sample.json",
    "--registry",
    "reports/frus-classification-registry.sample.json",
    "--checker-output",
    safeOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(safeAudit.status === 0, "expected safe classification normalization to pass");
  const safeReport = JSON.parse(safeAudit.stdout);
  assert(safeReport.summary.direct_classification_edit_conflicts === 0, "expected no direct-edit conflicts for safe normalization");

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "classification-source-note-0003",
          rule_id: "FAS-CLS-001",
          severity: "major",
          category: "classification_handling",
          finding: "Unsafe fixture edits a cross-volume classification marking.",
          standard: "Direct classification edits require target-volume source-image or registry proof.",
          recommended_action: "replace_text",
          original_text: "Secret.",
          replacement_text: "Top Secret.",
          comment_text: "",
          evidence_request: "classification_marking",
          verification_target: "Target-volume source image"
        }
      ]),
      null,
      2
    )}\n`
  );
  const badAudit = run("scripts/audit-frus-classification-usage.mjs", [
    "--units",
    "reports/frus-classification-units.sample.json",
    "--registry",
    "reports/frus-classification-registry.sample.json",
    "--checker-output",
    badOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(badAudit.status !== 0, "expected unsafe cross-volume classification direct edit to fail");
  const badReport = JSON.parse(badAudit.stdout);
  assert(badReport.status === "fail", "expected failed direct-edit classification audit");
  assert(badReport.summary.direct_classification_edit_conflicts >= 1, "expected classification direct-edit conflict");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-classification-usage.mjs", [
    "--units",
    "reports/frus-classification-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed classification registry to fail");
  assert(malformed.stdout.includes("frus-classification-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS classification audit test passed: registry validation, approved/cross-volume/no-marking usage, release-status warnings, safe normalization, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
