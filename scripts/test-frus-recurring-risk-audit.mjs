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

const registry = "reports/frus-recurring-risk-registry.sample.json";
const units = "reports/frus-recurring-risk-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-recurring-risk-audit-test-"));

try {
  const validation = run("scripts/validate-frus-recurring-risk-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected recurring-risk registry validation pass");
  assert(validationReport.summary.records === 13, "expected thirteen recurring-risk registry records");

  const audit = run("scripts/audit-frus-recurring-risk-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for recurring-risk matches");
  assert(report.summary.units_scanned === 13, "expected thirteen units scanned");
  assert(report.summary.risk_matches === 13, "expected thirteen risk matches");
  assert(report.summary.by_risk_family.telegram_numbering === 1, "expected telegram-numbering match");
  assert(report.summary.by_risk_family.telegram_copy_basis === 1, "expected telegram-copy-basis match");
  assert(report.summary.by_risk_family.cross_reference_slug === 1, "expected cross-reference-slug match");
  assert(report.summary.by_risk_family.document_xx_construction === 1, "expected Document XX construction match");
  assert(report.summary.by_risk_family.footnote_referback === 1, "expected footnote refer-back match");
  assert(report.summary.by_risk_family.style_consistency === 1, "expected style-consistency match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe recurring-risk direct edit fixture.",
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
            unit_id: "risk-0002",
            rule_id: "FAS-RISK-002",
            severity: "major",
            category: "communications_record",
            finding: "Unsafe eRecords substitution without evidence.",
            standard: "Changing telegram copy basis requires eRecords source evidence and outgoing drafting data.",
            recommended_action: "replace_text",
            original_text: "White House Situation Room copy",
            replacement_text: "Department of State eRecords copy",
            comment_text: "",
            evidence_request: "communications_metadata",
            verification_target: "eRecords telegram copy and drafting information"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-recurring-risk-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    checkerOutput,
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe recurring-risk direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_recurring_risk_edit_conflicts === 1,
    "expected one recurring-risk direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-recurring-risk-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed recurring-risk registry validation to fail");

  console.log(
    "FRUS recurring-risk audit test passed: compiler-risk registry validation, telegram numbering, eRecords copy basis, cross-reference slugs, Document XX construction, footnote refer-back, page breaks, footnote placement, autoformatting, completeness, shorthand, backup highlighting/header, style consistency, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
