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
      summary: "Fixture for declassification usage audit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Declassification fixture.",
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-declassification-audit-test-"));

try {
  const validation = run("scripts/validate-frus-declassification-registry.mjs", [
    "--registry",
    "reports/frus-declassification-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected declassification registry validation to pass");
  assert(validationReport.summary.records === 8, "expected eight declassification records");

  const audit = run("scripts/audit-frus-declassification-usage.mjs", [
    "--units",
    "reports/frus-declassification-units.sample.json",
    "--registry",
    "reports/frus-declassification-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-declassification-usage-audit-v1", "expected declassification audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 7, "expected seven scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 4, "expected approved declassification matches");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 1, "expected variant declassification warning");
  assert(auditReport.summary.by_usage_status.cross_volume_declassification >= 1, "expected cross-volume declassification warning");
  assert(auditReport.summary.unmatched_declassification_like_units === 1, "expected one unmatched declassification-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "declass-note-0001" &&
        usage.approved_phrase === "[less than 2 lines not declassified]" &&
        usage.usage_status === "approved"
    ),
    "expected approved less-than-two-lines omission"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "declass-note-0004" &&
        usage.declassification_type === "volume_review_statistics" &&
        usage.usage_status === "approved"
    ),
    "expected approved volume review statistics"
  );

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "declass-note-0001",
          rule_id: "FAS-DEC-001",
          severity: "major",
          category: "declassification",
          finding: "Unsafe fixture changes omitted-text quantity without registry support.",
          standard: "Omitted-text quantity and review status require supplied declassification evidence.",
          recommended_action: "replace_text",
          original_text: "[less than 2 lines not declassified]",
          replacement_text: "[2 lines not declassified]",
          comment_text: "",
          evidence_request: "declassification_status",
          verification_target: "Published omission bracket, source note, and review outcome"
        }
      ]),
      null,
      2
    )}\n`
  );
  const badAudit = run("scripts/audit-frus-declassification-usage.mjs", [
    "--units",
    "reports/frus-declassification-units.sample.json",
    "--registry",
    "reports/frus-declassification-registry.sample.json",
    "--checker-output",
    badOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(badAudit.status !== 0, "expected unsafe declassification direct edit to fail");
  const badReport = JSON.parse(badAudit.stdout);
  assert(badReport.status === "fail", "expected failed direct-edit declassification audit");
  assert(badReport.summary.direct_declassification_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-declassification-usage.mjs", [
    "--units",
    "reports/frus-declassification-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed declassification registry to fail");
  assert(malformed.stdout.includes("frus-declassification-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS declassification audit test passed: registry validation, line/paragraph/page omissions, review statistics, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
