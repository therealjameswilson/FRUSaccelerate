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

const registry = "reports/frus-chronology-registry.sample.json";
const units = "reports/frus-chronology-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-chronology-audit-test-"));

try {
  const validation = run("scripts/validate-frus-chronology-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 6, "expected six chronology registry records");

  const audit = run("scripts/audit-frus-chronology-usage.mjs", [
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
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.chronology_usages === 7, "expected seven matched chronology usages");
  assert(report.summary.by_usage_status.approved === 2, "expected two approved usages");
  assert(report.summary.by_usage_status.cross_volume_chronology === 4, "expected four cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_chronology_like_units === 1, "expected one unmatched chronology-like unit");
  assert(report.usages.some((usage) => usage.chronology_type === "daily_diary_meeting_time"), "expected Daily Diary time match");
  assert(report.usages.some((usage) => usage.chronology_type === "no_precise_time"), "expected no-precise-time match");
  assert(report.usages.some((usage) => usage.chronology_type === "actual_vs_planned_meeting_time"), "expected actual/planned time match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe chronology direct edit fixture.",
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
            unit_id: "chronology-0001",
            rule_id: "FAS-CHR-001",
            severity: "major",
            category: "chronology",
            finding: "Unsafe chronology edit.",
            standard: "Chronology direct edits require target-volume registry support.",
            recommended_action: "replace_text",
            original_text:
              "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
            replacement_text: "According to the President's Daily Diary, Bush met in the Oval Office from 3:00 to 3:30 p.m. on May 4.",
            comment_text: "",
            evidence_request: "chronology",
            verification_target: "Target-volume chronology registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-chronology-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe chronology direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_chronology_edit_conflicts === 1, "expected one direct chronology edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-chronology-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log(
    "FRUS chronology audit test passed: registry validation, Daily Diary times, no-precise-time caveats, actual/planned timing, variants, cross-volume warnings, unmatched units, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
