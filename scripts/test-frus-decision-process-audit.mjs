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

const registry = "reports/frus-decision-process-registry.sample.json";
const units = "reports/frus-decision-process-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-decision-process-audit-test-"));

try {
  const validation = run("scripts/validate-frus-decision-process-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected decision-process registry validation pass");
  assert(validationReport.summary.records === 12, "expected twelve decision-process records");

  const audit = run("scripts/audit-frus-decision-process-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
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
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched decision-process fixture");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.decision_process_usages === 7, "expected seven decision-process matches");
  assert(report.summary.by_usage_status.approved === 5, "expected five approved target-volume usages");
  assert(report.summary.by_usage_status.cross_volume_decision_process_context === 2, "expected two cross-volume usages");
  assert(report.summary.unmatched_decision_process_like_units === 1, "expected one unmatched decision-process-like unit");
  assert(
    report.usages.some((usage) => usage.decision_process_id === "decision-v31-d10-record-of-decision"),
    "expected record-of-decision usage"
  );
  assert(
    report.usages.some((usage) => usage.decision_process_id === "decision-v44p1-d129-heading-nsdd236"),
    "expected Reagan NSDD 236 cross-volume usage"
  );
  assert(
    report.unmatched_decision_process_like_units[0].evidence_request === "decision_process_basis",
    "expected decision-process evidence request for unmatched directive shorthand"
  );

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe decision-process direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture intentionally unsafe.",
          gates: []
        },
        checks: [
          {
            unit_id: "decision-0008",
            rule_id: "FAS-DP-001",
            severity: "major",
            category: "decision_process_directive",
            finding: "Unsafe guessed directive number.",
            standard: "Directive numbers require target-volume evidence.",
            recommended_action: "replace_text",
            original_text: "NSDD TK",
            replacement_text: "NSDD 236",
            comment_text: "",
            evidence_request: "decision_process_basis",
            verification_target: "published directive number"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-decision-process-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    checkerOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe decision-process direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_decision_process_edit_conflicts === 1,
    "expected one decision-process direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-decision-process-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed decision-process registry validation to fail");

  console.log(
    "FRUS decision-process audit test passed: NSR, NSDD, NSSD, PCC, NSC/DC, record-of-decision, cross-volume warnings, unmatched directive shorthand, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
