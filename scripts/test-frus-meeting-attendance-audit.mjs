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

const registry = "reports/frus-meeting-attendance-registry.sample.json";
const units = "reports/frus-meeting-attendance-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-meeting-attendance-test-"));

function checkerOutput(checks) {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Meeting attendance direct-edit fixture.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Fixture output.",
      gates: []
    },
    checks,
    global_comments: [],
    style_discrepancy_tally: []
  };
}

try {
  const validation = run("scripts/validate-frus-meeting-attendance-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected meeting attendance registry validation pass");
  assert(validationReport.summary.records === 7, "expected seven meeting attendance records");
  assert(
    validationReport.summary.by_attendance_type.daily_diary_partial_attendance === 1,
    "expected partial attendance registry record"
  );
  assert(
    validationReport.summary.by_attendance_type.participant_list_not_attached === 1,
    "expected participant-list-not-attached registry record"
  );

  const audit = run("scripts/audit-frus-meeting-attendance-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched attendance fixture");
  assert(report.summary.units_scanned === 7, "expected seven units scanned");
  assert(report.summary.meeting_attendance_usages === 6, "expected six meeting attendance usages");
  assert(report.summary.unmatched_meeting_attendance_like_units === 1, "expected one unmatched attendance-like unit");
  assert(report.summary.direct_meeting_attendance_edit_conflicts === 0, "expected no direct edit conflicts without checker output");
  assert(report.summary.by_usage_status.approved === 3, "expected three approved target-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant review usage");
  assert(report.summary.by_usage_status.cross_volume_attendance_context === 2, "expected two cross-volume attendance usages");
  assert(report.summary.by_attendance_type.daily_diary_attendance === 2, "expected Daily Diary attendance usage count");
  assert(report.summary.by_attendance_type.nsc_meeting_attendance === 1, "expected NSC attendance usage count");
  assert(
    report.summary.by_attendance_type.participant_list_not_attached === 1,
    "expected participant-list-not-attached usage count"
  );
  assert(
    report.usages.some((usage) => usage.meeting_attendance_id === "meet-v31-d25-participant-list-not-attached"),
    "expected participant-list not-attached usage"
  );
  assert(
    report.usages.some((usage) => usage.meeting_attendance_id === "meet-v01-d316-partial-attendance"),
    "expected partial attendance usage"
  );

  const typographicUnits = path.join(tmpDir, "typographic-units.json");
  fs.writeFileSync(
    typographicUnits,
    `${JSON.stringify(
      {
        schema_version: "frus-extracted-units-v1",
        units: [
          {
            unit_id: "attendance-typographic-0001",
            unit_type: "source_note",
            location: "typographic fixture",
            display_text:
              "According to the President’s Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39—11:04 a.m. No minutes were found.",
            exact_text:
              "According to the President’s Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39—11:04 a.m. No minutes were found."
          }
        ]
      },
      null,
      2
    )}\n`
  );
  const typographic = run("scripts/audit-frus-meeting-attendance-usage.mjs", [
    "--units",
    typographicUnits,
    "--registry",
    registry,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  if (typographic.status !== 0) {
    process.stderr.write(typographic.stdout);
    process.stderr.write(typographic.stderr);
    process.exit(typographic.status || 1);
  }
  const typographicReport = JSON.parse(typographic.stdout);
  assert(typographicReport.status === "pass", "expected typographic attendance fixture to pass");
  assert(typographicReport.summary.meeting_attendance_usages === 1, "expected one typographic attendance usage");
  assert(
    typographicReport.usages[0].meeting_attendance_id === "meet-v31-d23-nsc-attendance",
    "expected typographic fixture to match the NSC attendance record"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "attendance-0001",
          rule_id: "FAS-MEET-001",
          severity: "major",
          category: "chronology",
          finding: "Unsafe attendance change.",
          standard: "Do not add or remove attendees without Daily Diary or participant-list basis.",
          recommended_action: "replace_text",
          original_text:
            "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
          replacement_text:
            "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, Sununu, and Scowcroft in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
          comment_text: "",
          evidence_request: "chronology",
          verification_target: "President's Daily Diary attendance basis"
        },
        {
          unit_id: "attendance-0006",
          rule_id: "FAS-ATTEND-002",
          severity: "major",
          category: "chronology",
          finding: "Unsafe partial-attendance flattening.",
          standard: "Do not convert partial attendance into full meeting attendance.",
          recommended_action: "replace_text",
          original_text: "Weinberger also attended the meeting from 1:04 until 1:06 p.m.",
          replacement_text: "Weinberger attended the meeting.",
          comment_text: "",
          evidence_request: "chronology",
          verification_target: "Daily Diary partial-attendance basis"
        }
      ]),
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-meeting-attendance-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe meeting attendance direct edits to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_meeting_attendance_edit_conflicts === 2,
    "expected two meeting attendance direct-edit conflicts"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "attendance-0004",
          rule_id: "FAS-MEET-003",
          severity: "minor",
          category: "chronology",
          finding: "Known shortened attendance note can be normalized.",
          standard: "Use the published Daily Diary attendance wording when the target is verified.",
          recommended_action: "replace_text",
          original_text:
            "Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4.",
          replacement_text:
            "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
          comment_text: "",
          evidence_request: "chronology",
          verification_target: "President's Daily Diary attendance basis"
        }
      ]),
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-meeting-attendance-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1989-92v31",
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
    safeReport.summary.direct_meeting_attendance_edit_conflicts === 0,
    "expected registry-approved attendance replacement not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-meeting-attendance-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed meeting attendance registry validation to fail");

  console.log(
    "FRUS meeting attendance audit test passed: Daily Diary attendance, NSC attendance, participant-list status, no-minutes/no-memcon language, partial attendance, unmatched units, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
