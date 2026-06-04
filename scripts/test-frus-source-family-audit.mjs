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

const registry = "reports/frus-source-family-registry.sample.json";
const units = "reports/frus-source-family-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-source-family-test-"));

try {
  const validation = run("scripts/validate-frus-source-family-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected source-family registry validation pass");
  assert(validationReport.summary.families === 6, "expected six source-family records");
  assert(validationReport.summary.by_source_family_type.presidential_library === 3, "expected presidential-library count");
  assert(validationReport.summary.by_source_family_type.electronic_message_system === 1, "expected PROFS count");
  assert(validationReport.summary.by_source_family_type.central_foreign_policy_file === 1, "expected CFPF count");
  assert(validationReport.summary.by_source_family_type.public_source === 1, "expected public-source count");

  const audit = run("scripts/audit-frus-source-family-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v44p1",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for cross-volume, ambiguous, and unmatched fixtures");
  assert(report.summary.units_scanned === 7, "expected seven source-family units scanned");
  assert(report.summary.source_family_usages === 7, "expected seven source-family usages");
  assert(report.summary.unmatched_source_family_like_units === 1, "expected one unmatched source-family-like unit");
  assert(report.summary.ambiguous_source_family_units === 1, "expected one ambiguous source-family unit");
  assert(report.summary.direct_source_family_edit_conflicts === 0, "expected zero direct-edit conflicts without output");
  assert(report.summary.by_usage_status.approved === 3, "expected three target-volume approved usages");
  assert(report.summary.by_usage_status.cross_volume_source_family_context === 2, "expected two cross-volume usages");
  assert(report.summary.by_usage_status.ambiguous_source_family === 2, "expected two ambiguous usages in one unit");
  assert(
    report.usages.some((usage) => usage.source_family_id === "sf-v44p1-profs-system" && usage.match_kind === "display_family"),
    "expected PROFS display-family match"
  );
  assert(
    report.usages.some((usage) => usage.source_family_id === "sf-v31-bush-hfiles" && usage.usage_status === "cross_volume_source_family_context"),
    "expected Bush H-Files cross-volume context"
  );
  assert(
    report.usages.some((usage) => usage.source_family_id === "sf-v01-foundations-public-sources" && usage.usage_status === "cross_volume_source_family_context"),
    "expected Reagan Foundations public-source cross-volume context"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe source-family direct edit fixture.",
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
            unit_id: "source-family-0003",
            rule_id: "FAS-SF-001",
            severity: "major",
            category: "source_family",
            finding: "Unsafe flattening of a System IV source family.",
            standard: "Do not flatten specific source-family identity into a generic repository path.",
            recommended_action: "replace_text",
            original_text:
              "Ronald Reagan Presidential Library, White House Staff and Office Files, Files of the Executive Secretariat, National Security Council, System IV Intelligence Files",
            replacement_text: "Reagan Library, White House Staff and Office Files",
            comment_text: "",
            evidence_request: "source_family",
            verification_target: "target-volume source family"
          },
          {
            unit_id: "source-family-0007",
            rule_id: "FAS-SF-002",
            severity: "major",
            category: "source_family",
            finding: "Unsafe promotion of generic Reagan Library files into Bush H-Files.",
            standard: "Do not invent a specific source family without target-volume evidence.",
            recommended_action: "replace_text",
            original_text: "Source: Reagan Library files.",
            replacement_text:
              "Source: George H.W. Bush Presidential Library, Bush Presidential Records, National Security Council Institutional Files (H-Files).",
            comment_text: "",
            evidence_request: "source_family",
            verification_target: "target-volume source family"
          },
          {
            unit_id: "source-family-0004",
            rule_id: "FAS-SF-003",
            severity: "major",
            category: "source_family",
            finding: "Unsafe direct edit of cross-volume H-Files source family.",
            standard: "Do not directly rewrite cross-volume source-family context without target-volume evidence.",
            recommended_action: "replace_text",
            original_text:
              "Source: George H.W. Bush Presidential Library, Bush Presidential Records, National Security Council Institutional Files (H-Files).",
            replacement_text: "Source: Bush Library, NSC files.",
            comment_text: "",
            evidence_request: "source_family",
            verification_target: "target-volume source family"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-source-family-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v44p1",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe source-family direct edits to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_source_family_edit_conflicts === 3,
    "expected three source-family direct-edit conflicts"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", families: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-source-family-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed source-family registry validation to fail");

  console.log(
    "FRUS source-family audit test passed: PROFS, W Files, System IV, Bush H-Files, CFPF reels, public-source families, ambiguity, unmatched generic paths, and direct-edit flattening gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
