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

const registry = "reports/frus-time-zone-registry.sample.json";
const units = "reports/frus-time-zone-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-time-zone-test-"));

try {
  const validation = run("scripts/validate-frus-time-zone-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected time-zone registry validation pass");
  assert(validationReport.summary.records === 8, "expected eight time-zone records");

  const audit = run("scripts/audit-frus-time-zone-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for unmatched and cross-volume time-zone fixture");
  assert(report.summary.units_scanned === 10, "expected ten units scanned");
  assert(report.summary.time_zone_usages === 9, "expected nine time-zone usages");
  assert(report.summary.unmatched_time_zone_like_units === 1, "expected one unmatched time-zone-like unit");
  assert(report.summary.direct_time_zone_edit_conflicts === 0, "expected zero direct conflicts without checker output");
  assert(report.summary.by_usage_status.approved === 4, "expected four approved START I target-volume matches");
  assert(report.summary.by_usage_status.cross_volume_time_zone === 4, "expected four cross-volume warnings");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant needing review");
  assert(report.summary.by_time_claim_type.telegram_date_time_group === 4, "expected four telegram date-time group usages");
  assert(report.summary.by_time_claim_type.treaty_notification_time_rule === 1, "expected treaty timing usage");
  assert(
    report.usages.some((usage) => usage.time_zone_item_id === "time-v31-d188-geneva-1757z"),
    "expected START I Geneva 1757Z match"
  );
  assert(
    report.diagnostics.some((diagnostic) => diagnostic.unit_id === "time-0010"),
    "expected missing-Z unsupported conversion diagnostic"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe time-zone conversion fixture.",
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
            unit_id: "time-0009",
            rule_id: "FAS-TIME-001",
            severity: "major",
            category: "time_zone_chronology",
            finding: "Unsupported conversion.",
            standard: "Do not convert Z/GMT/local/Washington time without registry evidence.",
            recommended_action: "replace_text",
            original_text: "Convert 0905Z to 11:05 a.m. local time in the heading.",
            replacement_text: "Namibia, March 20, 1990, 11:05 a.m. local time.",
            comment_text: "",
            evidence_request: "time_zone_basis",
            verification_target: "target-volume time-zone registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-time-zone-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe time-zone direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_time_zone_edit_conflicts === 1, "expected one time-zone direct-edit conflict");

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Registry-supported date-time group fixture.",
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
            unit_id: "time-0004",
            rule_id: "FAS-TIME-002",
            severity: "minor",
            category: "time_zone_chronology",
            finding: "Restore supplied Z label.",
            standard: "Preserve telegram date-time groups exactly.",
            recommended_action: "replace_text",
            original_text: "Washington, December 17, 1990, 1430",
            replacement_text: "Washington, December 17, 1990, 1430Z",
            comment_text: "",
            evidence_request: "time_zone_basis",
            verification_target: "target-volume time-zone registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-time-zone-usage.mjs", [
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
  assert(safeReport.summary.direct_time_zone_edit_conflicts === 0, "expected registry-supported Z edit not to conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-time-zone-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed time-zone registry validation to fail");

  console.log(
    "FRUS time-zone audit test passed: Washington-time, Z date-time groups, no-precise-time, actual-vs-planned, treaty timing, cross-volume, unmatched, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
