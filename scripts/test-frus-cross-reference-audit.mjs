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

const registry = "reports/frus-cross-reference-registry.sample.json";
const units = "reports/frus-cross-reference-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-cross-reference-test-"));

try {
  const validation = run("scripts/validate-frus-cross-reference-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected cross-reference registry validation pass");
  assert(validationReport.summary.records === 9, "expected nine cross-reference records");
  assert(
    validationReport.summary.by_reference_type.related_volume_scheduled_publication === 3,
    "expected three related-volume scheduled-publication records"
  );

  const audit = run("scripts/audit-frus-cross-reference-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-reference fixture");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.cross_reference_usages === 6, "expected six cross-reference usages");
  assert(report.summary.warnings === 6, "expected six cross-reference warnings");
  assert(report.summary.unmatched_cross_reference_like_units === 1, "expected one unmatched cross-reference unit");
  assert(report.summary.incomplete_cross_reference_slug_units === 1, "expected one incomplete slug unit");
  assert(report.summary.direct_cross_reference_edit_conflicts === 0, "expected zero direct-edit conflicts");
  assert(report.summary.by_usage_status.approved === 2, "expected two approved target-volume usages");
  assert(report.summary.by_usage_status.cross_volume_cross_reference === 3, "expected three cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(
    report.usages.some((usage) => usage.cross_reference_id === "xref-v31-d8-fn2-d10"),
    "expected START I attached-but-not-printed cross-reference"
  );
  assert(
    report.usages.some((usage) => usage.cross_reference_id === "xref-v31-d126-ednote-vol3"),
    "expected START I related-volume scheduled-publication cross-reference"
  );
  assert(
    report.usages.some((usage) => usage.cross_reference_id === "xref-v01-d309-fn1-v06-d77"),
    "expected Reagan Foundations also-printed cross-reference"
  );
  assert(
    report.usages.some((usage) => usage.cross_reference_id === "xref-v01-d269-fn6-v44p1"),
    "expected Reagan Foundations Packard Commission cross-reference"
  );
  assert(
    report.usages.some((usage) => usage.match_kind === "case_or_punctuation_variant"),
    "expected case/punctuation variant for lowercase Document"
  );
  assert(
    report.diagnostics.some((diagnostic) => diagnostic.diagnostic_type === "incomplete_cross_reference_slug"),
    "expected incomplete cross-reference slug diagnostic"
  );
  assert(
    report.warnings.some((warning) => warning.includes("source volume, target document, target volume, and direction")),
    "expected cross-volume target confirmation warning"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe cross-reference fixture.",
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
            unit_id: "cross-reference-0001",
            rule_id: "FAS-XREF-001",
            severity: "minor",
            category: "citation",
            finding: "Unsafe guessed Document target.",
            standard: "Do not invent cross-reference targets.",
            recommended_action: "replace_text",
            original_text: "Attached but not printed. See Document 10.",
            replacement_text: "Attached but not printed. See Document 9.",
            comment_text: "",
            evidence_request: "cross_reference",
            verification_target: "published target document"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-cross-reference-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe direct cross-reference edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.status === "fail", "expected unsafe direct edit report to fail");
  assert(
    unsafeReport.summary.direct_cross_reference_edit_conflicts >= 1,
    "expected unsafe direct edit conflict count"
  );
  assert(
    unsafeReport.direct_edit_conflicts[0].replacement_text.includes("Document 9"),
    "expected unsafe guessed Document target in conflict report"
  );

  const malformedRegistry = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "bad", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/validate-frus-cross-reference-registry.mjs", [
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed registry validation to fail");
  const malformedReport = JSON.parse(malformed.stdout);
  assert(malformedReport.status === "fail", "expected malformed registry report to fail");

  console.log(
    "FRUS cross-reference audit test passed: registry validation, target-volume usage, cross-volume context, variants, incomplete slugs, unmatched references, and unsafe direct edits checked."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
