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

const registry = "reports/frus-selection-balance-registry.sample.json";
const units = "reports/frus-selection-balance-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-selection-balance-test-"));

try {
  const validation = run("scripts/validate-frus-selection-balance-registry.mjs", [
    "--registry",
    registry,
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected selection-balance registry validation pass");
  assert(validationReport.summary.records === 8, "expected eight selection-balance records");
  assert(
    validationReport.summary.by_selection_issue_type.principles_of_selection === 2,
    "expected two principles-of-selection records"
  );

  const audit = run("scripts/audit-frus-selection-balance-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched selection examples");
  assert(report.summary.units_scanned === 9, "expected nine units scanned");
  assert(report.summary.selection_usages === 8, "expected eight matched selection-balance usages");
  assert(report.summary.by_usage_status.approved === 6, "expected six approved target-volume usages");
  assert(report.summary.by_usage_status.cross_volume_selection_context === 2, "expected two cross-volume selection usages");
  assert(report.summary.unmatched_selection_like_units === 2, "expected two unmatched selection-like units");
  assert(report.summary.direct_selection_edit_conflicts === 0, "expected no direct-edit conflicts without checker output");
  assert(
    report.usages.some((usage) => usage.selection_issue_type === "omitted_non_scope_material"),
    "expected omitted non-scope material usage"
  );
  assert(
    report.usages.some((usage) => usage.selection_issue_type === "complete_record_elsewhere"),
    "expected complete-record-elsewhere usage"
  );
  assert(
    report.unmatched_selection_like_units.some((unit) => unit.unit_id === "selection-balance-0008"),
    "expected unsupported complete coverage claim to be unmatched"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe selection-balance direct edit fixture.",
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
            unit_id: "selection-balance-0008",
            rule_id: "FAS-SEL-001",
            severity: "major",
            category: "selection_balance_completeness",
            finding: "Unsafe selection-balance edit.",
            standard: "Selection-balance claims are comment-only by default.",
            recommended_action: "replace_text",
            original_text: "complete and balanced coverage",
            replacement_text: "representative coverage",
            comment_text: "",
            evidence_request: "selection_balance_basis",
            verification_target: "General Editor selection-balance review"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-selection-balance-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe selection-balance direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_selection_edit_conflicts === 1, "expected one direct selection edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-selection-balance-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed selection-balance registry validation to fail");

  console.log(
    "FRUS selection-balance audit test passed: principles of selection, excerpt/omission, complete-record-elsewhere, related-volume boundaries, cross-volume warnings, unmatched completeness claims, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
