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

const registry = "reports/frus-handwritten-transcription-registry.sample.json";
const units = "reports/frus-handwritten-transcription-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-handwritten-transcription-test-"));

try {
  const validation = run("scripts/validate-frus-handwritten-transcription-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected handwritten/facsimile registry validation pass");
  assert(validationReport.summary.records === 5, "expected five handwritten/facsimile records");
  assert(validationReport.summary.by_transcription_type.handwritten_notes === 2, "expected two handwritten-note records");
  assert(validationReport.summary.by_transcription_type.marginalia_left_hand === 1, "expected left-margin record");

  const audit = run("scripts/audit-frus-handwritten-transcription-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v11",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched fixtures");
  assert(report.summary.units_scanned === 6, "expected six units scanned");
  assert(report.summary.handwritten_transcription_usages === 7, "expected seven registry usages");
  assert(report.summary.unmatched_handwritten_transcription_like_units === 1, "expected one unmatched handwritten-like unit");
  assert(report.summary.by_usage_status.approved === 2, "expected two target-volume approved usages");
  assert(report.summary.by_usage_status.variant_needs_review === 2, "expected two target-volume variant usages");
  assert(
    report.summary.by_usage_status.cross_volume_handwritten_transcription_context === 3,
    "expected three cross-volume context usages"
  );
  assert(report.summary.by_transcription_type.original_brackets_ellipses === 2, "expected START I Document 13 forms");
  assert(report.summary.by_transcription_type.editor_transcribed_portion === 2, "expected START I Document 32 forms");
  assert(
    report.usages.some((usage) => usage.handwritten_item_id === "handwritten-v11-d13-original-brackets-note"),
    "expected START I original-brackets handwritten model"
  );
  assert(
    report.usages.some((usage) => usage.handwritten_item_id === "handwritten-v44p1-d155-left-margin-note"),
    "expected Keel left-margin published model"
  );
  assert(report.unmatched_units[0].unit_id === "handwritten-0006", "expected unsupported handwritten unit warning");

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe handwritten fixture.",
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
            unit_id: "handwritten-0006",
            rule_id: "FAS-HAND-001",
            severity: "major",
            category: "handwritten_facsimile_transcription",
            finding: "Invents an appendix-image transcription basis.",
            standard: "Do not invent handwritten transcription or facsimile targets.",
            recommended_action: "replace_text",
            original_text:
              "The source appears to be handwritten and the editor probably transcribed it; an image may be in the backup file.",
            replacement_text:
              "The original text is handwritten. The editor transcribed the text specifically for this volume. An image of the notes is Appendix B.",
            comment_text: "",
            evidence_request: "transcription_facsimile_basis",
            verification_target: "published handwritten/facsimile registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-handwritten-transcription-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v11",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe handwritten/facsimile direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_handwritten_transcription_edit_conflicts === 1,
    "expected one handwritten/facsimile direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved handwritten fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses target-volume registry form.",
          gates: []
        },
        checks: [
          {
            unit_id: "handwritten-0002",
            rule_id: "FAS-HAND-002",
            severity: "minor",
            category: "handwritten_facsimile_transcription",
            finding: "Known target-volume source note can be normalized.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "The original text is handwritten.",
            replacement_text:
              "Brackets and ellipses are in the original. The original text is handwritten. The editor transcribed the portion of the text here specifically for this volume. An image of the note is Appendix A",
            comment_text: "",
            evidence_request: "transcription_facsimile_basis",
            verification_target: "published handwritten/facsimile registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-handwritten-transcription-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v11",
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
    safeReport.summary.direct_handwritten_transcription_edit_conflicts === 0,
    "expected registry-approved handwritten replacement not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(
    malformed,
    `${JSON.stringify(
      {
        ...JSON.parse(fs.readFileSync(registry, "utf8")),
        records: [
          {
            ...JSON.parse(fs.readFileSync(registry, "utf8")).records[0],
            variant_forms: "not-an-array"
          }
        ]
      },
      null,
      2
    )}\n`
  );
  const badValidation = run("scripts/validate-frus-handwritten-transcription-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed handwritten/facsimile registry validation to fail");

  console.log(
    "FRUS handwritten/facsimile transcription audit test passed: Reagan Foundations Shultz notes, START I original brackets and appendix images, Keel handwritten notes and margin note, variants, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
