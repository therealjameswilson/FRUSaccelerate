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

const registry = "reports/frus-printed-attachment-registry.sample.json";
const units = "reports/frus-printed-attachment-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-printed-attachment-audit-test-"));

try {
  const validation = run("scripts/validate-frus-printed-attachment-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 6, "expected six printed attachment registry records");

  const audit = run("scripts/audit-frus-printed-attachment-usage.mjs", [
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
  assert(report.summary.units_scanned === 6, "expected six units scanned");
  assert(report.summary.printed_attachment_usages === 5, "expected five matched printed attachment usages");
  assert(report.summary.by_usage_status.approved === 2, "expected two approved usages");
  assert(report.summary.by_usage_status.cross_volume_printed_attachment === 2, "expected two cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_printed_attachment_like_units === 1, "expected one unmatched printed attachment-like unit");
  assert(report.usages.some((usage) => usage.approved_phrase === "Paper Prepared in the Soviet Ministry of Foreign Affairs"), "expected Soviet MFA paper match");
  assert(report.usages.some((usage) => usage.approved_phrase === "Printed as Document 277."), "expected printed-as-document match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe printed attachment direct edit fixture.",
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
            unit_id: "printed-attachment-0004",
            rule_id: "FAS-PNA-001",
            severity: "major",
            category: "printed_nested_attachment",
            finding: "Unsafe target document change.",
            standard: "Printed attachment targets must be supported by the target-volume registry.",
            recommended_action: "replace_text",
            original_text: "Printed as Document 277.",
            replacement_text: "Printed as Document 276.",
            comment_text: "",
            evidence_request: "printed_attachment_basis",
            verification_target: "Printed target"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-printed-attachment-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe printed attachment direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_printed_attachment_edit_conflicts === 1, "expected one direct printed attachment edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-printed-attachment-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log("FRUS printed attachment audit test passed: registry validation, printed-in-parent, attached-but-not-printed, printed-as-document, variants, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
