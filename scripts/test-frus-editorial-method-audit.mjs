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

const registry = "reports/frus-editorial-method-registry.sample.json";
const units = "reports/frus-editorial-method-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-editorial-method-test-"));

try {
  const validation = run("scripts/validate-frus-editorial-method-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected editorial-method registry validation pass");
  assert(validationReport.summary.records === 6, "expected six editorial-method records");

  const audit = run("scripts/audit-frus-editorial-method-usage.mjs", [
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
  assert(report.schema_version === "frus-editorial-method-usage-audit-v1", "expected editorial-method audit schema");
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched method units");
  assert(report.summary.units_scanned === 7, "expected seven units scanned");
  assert(report.summary.editorial_method_usages === 6, "expected six editorial-method usages");
  assert(report.summary.unmatched_editorial_method_like_units === 2, "expected two unmatched original-text/method units");
  assert(report.summary.by_usage_status.approved === 4, "expected four target-volume approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_editorial_method_context === 2,
    "expected two cross-volume editorial-method usages"
  );
  assert(report.summary.by_method_type.original_brackets === 3, "expected original-brackets usage count");
  assert(report.summary.by_method_type.document_text_integrity === 1, "expected document-text integrity usage");
  assert(
    report.usages.some((usage) => usage.editorial_method_id === "method-v01-d66-diary-dont"),
    "expected source-quoted diary contraction record"
  );
  assert(
    report.unmatched_units.some((unit) => unit.unit_id === "editorial-method-0007"),
    "expected transcribed document text to be protected when no method registry match exists"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe editorial-method fixture.",
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
            unit_id: "editorial-method-0007",
            rule_id: "FAS-EDM-001",
            severity: "major",
            category: "editorial_method_transcription",
            finding: "Grammar cleanup fixture changes original document text.",
            standard: "Do not modernize original text without source-image or editorial-method basis.",
            recommended_action: "replace_text",
            original_text: "defenses then our",
            replacement_text: "defenses than our",
            comment_text: "",
            evidence_request: "none",
            verification_target: "source image"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-editorial-method-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsupported editorial-method direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_editorial_method_edit_conflicts === 1,
    "expected one direct editorial-method conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-editorial-method-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed editorial-method registry validation to fail");

  console.log(
    "FRUS editorial-method audit test passed: original brackets, original footnotes, underlining/checkmarks, protected quoted spelling, unmatched method warnings, and original-text direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
