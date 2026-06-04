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

const registry = "reports/frus-document-status-lifecycle-registry.sample.json";
const units = "reports/frus-document-status-lifecycle-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-document-status-lifecycle-test-"));

try {
  const validation = run("scripts/validate-frus-document-status-lifecycle-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected document-status lifecycle registry validation pass");
  assert(validationReport.summary.records === 5, "expected five document-status lifecycle records");
  assert(validationReport.summary.by_status_type.prepared_by === 1, "expected one prepared-by record");
  assert(validationReport.summary.by_status_type.sent_for_action === 1, "expected one sent-for-action record");
  assert(validationReport.summary.by_status_type.drafted_and_cleared === 1, "expected one drafted-and-cleared record");

  const audit = run("scripts/audit-frus-document-status-lifecycle-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched lifecycle fixture");
  assert(report.summary.units_scanned === 5, "expected five lifecycle units scanned");
  assert(report.summary.document_status_lifecycle_usages === 5, "expected five lifecycle usages");
  assert(report.summary.unmatched_document_status_like_units === 1, "expected one unmatched lifecycle-like unit");
  assert(report.summary.direct_document_status_lifecycle_edit_conflicts === 0, "expected zero direct conflicts without checker output");
  assert(report.summary.by_usage_status.approved === 3, "expected three target-volume approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_document_status_context === 2,
    "expected two cross-volume lifecycle context usages"
  );
  assert(
    report.usages.some((usage) => usage.document_status_item_id === "lifecycle-v31-d23-prepared-copied"),
    "expected Bush START prepared/copied model"
  );
  assert(
    report.usages.some((usage) => usage.document_status_item_id === "lifecycle-v31-d24-action-through-seen"),
    "expected Bush START sent-through/stamped-seen model"
  );
  assert(
    report.usages.some((usage) => usage.document_status_item_id === "lifecycle-v01-d74-uninitialed-drafted-cleared"),
    "expected Reagan Foundations uninitialed-copy drafted/cleared model"
  );
  assert(report.unmatched_units[0].unit_id === "lifecycle-0005", "expected incomplete compiler shorthand to be unmatched");

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe lifecycle fixture.",
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
            unit_id: "lifecycle-0005",
            rule_id: "FAS-LIFE-001",
            severity: "major",
            category: "document_status_lifecycle",
            finding: "Unsafe invented lifecycle repair.",
            standard: "Do not invent drafting, routing, read, or copy-status facts.",
            recommended_action: "replace_text",
            original_text: "Drafted by J. Smith. Cleared by TK. Sent through XXX.",
            replacement_text: "Secret. Drafted by J. Smith and cleared by Wolfowitz. Sent for action.",
            comment_text: "",
            evidence_request: "document_status_basis",
            verification_target: "source-image lifecycle basis"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-document-status-lifecycle-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe document-status lifecycle direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_document_status_lifecycle_edit_conflicts === 1,
    "expected one lifecycle direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved lifecycle fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses a registry-published replacement.",
          gates: []
        },
        checks: [
          {
            unit_id: "lifecycle-0002",
            rule_id: "FAS-LIFE-002",
            severity: "minor",
            category: "document_status_lifecycle",
            finding: "Known target can be normalized.",
            standard: "Use the published target-volume lifecycle form.",
            recommended_action: "replace_text",
            original_text: "Secret. Sent for action through Kanter. Gates saw it.",
            replacement_text: "Secret. Sent for action. Sent through Kanter. A stamped notation indicates Gates saw the memorandum.",
            comment_text: "",
            evidence_request: "document_status_basis",
            verification_target: "published lifecycle registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-document-status-lifecycle-usage.mjs", [
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
    safeReport.summary.direct_document_status_lifecycle_edit_conflicts === 0,
    "expected registry-approved lifecycle replacement not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-document-status-lifecycle-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed lifecycle registry validation to fail");

  console.log(
    "FRUS document-status lifecycle audit test passed: Bush START prepared/copied, no-minutes, sent-through/stamped-seen, Reagan Foundations uninitialed-copy and draft-version forms, unmatched shorthand warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
