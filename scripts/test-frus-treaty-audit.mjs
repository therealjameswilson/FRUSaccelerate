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

const registry = "reports/frus-treaty-registry.sample.json";
const units = "reports/frus-treaty-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-treaty-audit-test-"));

try {
  const validation = run("scripts/validate-frus-treaty-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected treaty registry validation pass");
  assert(validationReport.summary.records === 13, "expected thirteen treaty registry records");

  const audit = run("scripts/audit-frus-treaty-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for variant, cross-volume examples, and unmatched unit");
  assert(report.summary.units_scanned === 14, "expected fourteen units scanned");
  assert(report.summary.treaty_usages === 13, "expected thirteen matched treaty usages");
  assert(report.summary.by_usage_status.approved === 6, "expected six approved usages");
  assert(report.summary.by_usage_status.cross_volume_treaty === 4, "expected four cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 3, "expected three variant usages");
  assert(report.summary.unmatched_treaty_like_units === 1, "expected one unmatched treaty-like unit");
  assert(report.usages.some((usage) => usage.treaty_component_type === "treaty_text"), "expected treaty text match");
  assert(report.usages.some((usage) => usage.treaty_component_type === "protocol"), "expected protocol match");
  assert(
    report.usages.some((usage) => usage.treaty_component_type === "memorandum_of_understanding"),
    "expected MOU match"
  );
  assert(
    report.usages.some((usage) => usage.treaty_component_type === "verification_regime"),
    "expected START verification-regime match"
  );
  assert(
    report.usages.some((usage) => usage.treaty_component_type === "technical_definition"),
    "expected arms-control technical-definition match"
  );
  assert(
    report.usages.some((usage) => usage.treaty_component_type === "arms_control_constraint"),
    "expected arms-control constraint match"
  );
  assert(
    report.usages.some((usage) => usage.approved_phrase.includes("telemetry protocol")),
    "expected telemetry protocol technical-verification match"
  );
  assert(
    report.usages.some((usage) => usage.approved_phrase.includes("throw-weight of heavy ICBM")),
    "expected heavy ICBM throw-weight constraint match"
  );

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe treaty direct edit fixture.",
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
            unit_id: "treaty-0003",
            rule_id: "FAS-TREATY-001",
            severity: "major",
            category: "treaty_legal_instrument",
            finding: "Unsafe treaty component edit.",
            standard: "Treaty direct edits require target-volume registry support.",
            recommended_action: "replace_text",
            original_text: "Protocol on Conversion/Elimination",
            replacement_text: "Protocol on Notifications",
            comment_text: "",
            evidence_request: "treaty_component",
            verification_target: "Target-volume treaty registry"
          },
          {
            unit_id: "treaty-0013",
            rule_id: "FAS-GEN-000",
            severity: "major",
            category: "wording",
            finding: "Unsafe technical wording edit.",
            standard: "START heavy ICBM throw-weight/downloading language is treaty technical-verification language, not ordinary prose.",
            recommended_action: "replace_text",
            original_text: "no increase in launch weight or throw-weight of heavy ICBM s",
            replacement_text: "no increase in launch weight or throw-weight of heavy missiles",
            comment_text: "",
            evidence_request: "none",
            verification_target: "Target-volume START technical-verification registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-treaty-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe treaty direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_treaty_edit_conflicts === 2, "expected two direct treaty edit conflicts");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-treaty-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed treaty registry validation to fail");

  console.log(
    "FRUS treaty audit test passed: registry validation, START treaty text, integral components, START telemetry/inspection/JCIC/throw-weight technical-verification language, Reagan draft MOU/protocols, Reagan ABM terminology, variants, cross-volume warnings, unmatched units, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
