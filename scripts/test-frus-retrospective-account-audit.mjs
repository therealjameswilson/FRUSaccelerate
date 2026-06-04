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

const registry = "reports/frus-retrospective-account-registry.sample.json";
const units = "reports/frus-retrospective-account-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-retrospective-account-test-"));

try {
  const validation = run("scripts/validate-frus-retrospective-account-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected retrospective-account registry validation pass");
  assert(validationReport.summary.records === 6, "expected six retrospective-account records");

  const audit = run("scripts/audit-frus-retrospective-account-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for unmatched retrospective-account fixture");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.retrospective_account_usages === 8, "expected eight retrospective-account usages");
  assert(report.summary.unmatched_retrospective_like_units === 2, "expected two unmatched retrospective-like units");
  assert(report.summary.direct_retrospective_account_edit_conflicts === 0, "expected zero direct conflicts without checker output");
  assert(report.summary.by_record_type.memoir_recollection === 5, "expected five memoir-recollection usages");
  assert(report.summary.by_record_type.published_personal_diary_and_memoir === 2, "expected two diary-and-memoir usages");
  assert(report.summary.by_record_type.published_personal_diary === 1, "expected one personal-diary usage");
  assert(
    report.usages.some((usage) => usage.retrospective_account_id === "retro-v01-d316-reagan-diary-schedule"),
    "expected Reagan diary schedule match"
  );
  assert(
    report.diagnostics.some((diagnostic) => diagnostic.unit_id === "retro-0008"),
    "expected unmatched oral-history diagnostic"
  );

  const crossVolume = run("scripts/audit-frus-retrospective-account-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  if (crossVolume.status !== 0) {
    process.stderr.write(crossVolume.stdout);
    process.stderr.write(crossVolume.stderr);
    process.exit(crossVolume.status || 1);
  }
  const crossVolumeReport = JSON.parse(crossVolume.stdout);
  assert(
    crossVolumeReport.summary.by_usage_status.cross_volume_retrospective_account === 8,
    "expected all sample matches to be cross-volume warnings for a Bush target"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe direct edit fixture.",
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
            unit_id: "retro-0007",
            rule_id: "FAS-RET-001",
            severity: "major",
            category: "memoir_oral_history_recollection",
            finding: "Unsafe memoir conversion.",
            standard: "Do not let retrospective accounts replace official records.",
            recommended_action: "replace_text",
            original_text: "Shultz's memoir proves that the President approved the arms-control plan.",
            replacement_text: "The official record proves the President approved the arms-control plan.",
            comment_text: "",
            evidence_request: "retrospective_account_basis",
            verification_target: "target-volume retrospective-account registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-retrospective-account-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe retrospective-account direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_retrospective_account_edit_conflicts === 1,
    "expected one retrospective-account direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Registry-supported direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses supplied registry evidence.",
          gates: []
        },
        checks: [
          {
            unit_id: "retro-0004",
            rule_id: "FAS-RET-002",
            severity: "minor",
            category: "memoir_oral_history_recollection",
            finding: "Restore supplied page locator.",
            standard: "Preserve retrospective-account publication details.",
            recommended_action: "insert_after_text",
            original_text: "In his memoir, Shultz described the segment of the meeting devoted to U.S.-Soviet issues.",
            replacement_text: " Shultz, Turmoil and Triumph, pp. 702-703",
            comment_text: "",
            evidence_request: "retrospective_account_basis",
            verification_target: "target-volume retrospective-account registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-retrospective-account-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  if (safe.status !== 0) {
    process.stderr.write(safe.stdout);
    process.stderr.write(safe.stderr);
    process.exit(safe.status || 1);
  }
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_retrospective_account_edit_conflicts === 0,
    "expected registry-supported page locator edit not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-retrospective-account-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed retrospective-account registry validation to fail");

  console.log(
    "FRUS retrospective-account audit test passed: Reagan Foundations memoir, diary, variant, unmatched, cross-volume, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
