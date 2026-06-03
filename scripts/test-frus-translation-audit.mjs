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

const registry = "reports/frus-translation-registry.sample.json";
const units = "reports/frus-translation-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-translation-audit-test-"));

try {
  const validation = run("scripts/validate-frus-translation-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 7, "expected seven translation registry records");

  const audit = run("scripts/audit-frus-translation-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for variants, cross-volume examples, and unmatched unit");
  assert(report.summary.units_scanned === 7, "expected seven units scanned");
  assert(report.summary.translation_usages === 6, "expected six matched translation usages");
  assert(report.summary.by_usage_status.approved === 3, "expected three approved usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.by_usage_status.cross_volume_translation === 2, "expected two cross-volume translation usages");
  assert(report.summary.unmatched_translation_like_units === 1, "expected one unmatched translation-like unit");
  assert(report.usages.some((usage) => usage.approved_phrase.includes("Unofficial translation")), "expected unofficial translation match");
  assert(report.usages.some((usage) => usage.approved_phrase === "The Russian text of the paper is ibid."), "expected Russian text match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe translation direct edit fixture.",
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
            unit_id: "translation-note-0001",
            rule_id: "FAS-TRANS-001",
            severity: "major",
            category: "translation_foreign_origin",
            finding: "Unsafe simplification of translation status.",
            standard: "Translation status must be supported by the target-volume registry.",
            recommended_action: "replace_text",
            original_text: "Printed from a copy marked: “Unofficial translation.”",
            replacement_text: "Printed from an official translation.",
            comment_text: "",
            evidence_request: "translation_status",
            verification_target: "Translation status"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-translation-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe translation direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_translation_edit_conflicts === 1, "expected one direct translation edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-translation-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log("FRUS translation audit test passed: registry validation, unofficial translation, foreign text, variants, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
