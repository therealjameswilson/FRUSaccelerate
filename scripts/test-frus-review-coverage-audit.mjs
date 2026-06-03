#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runAudit(args) {
  return spawnSync(process.execPath, ["scripts/audit-frus-review-coverage.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-review-coverage-test-"));

try {
  const unitsPath = path.join(tmpDir, "units.json");
  const outputPath = path.join(tmpDir, "output.json");
  const badOutputPath = path.join(tmpDir, "bad-output.json");

  const units = {
    schema_version: "frus-extracted-units-v1",
    units: [
      {
        unit_id: "source-note-0001",
        unit_type: "source_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/footnotes.xml",
        location: "Footnote 1",
        exact_text: "Source: Reagan Library, NSC Files. No classification. See https://example.invalid.",
        display_text: "Source: Reagan Library, NSC Files. No classification. See https://example.invalid.",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      },
      {
        unit_id: "editorial-note-0001",
        unit_type: "editorial_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Editorial note",
        exact_text: "Editorial Note. The memorandum is printed as Document 4.",
        display_text: "Editorial Note. The memorandum is printed as Document 4.",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      },
      {
        unit_id: "transcribed-document-text-0001",
        unit_type: "transcribed_document_text",
        editability: "context_only",
        edit_safety: "comment_only",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Document body",
        exact_text: "The President approved the recommendation.",
        display_text: "The President approved the recommendation.",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      }
    ]
  };

  const output = {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "pass_with_comments",
      summary: "Coverage audit fixture.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "comment_only_review",
      safe_to_apply_tracked_changes: false,
      readiness_summary: "Coverage audit fixture.",
      gates: []
    },
    checks: [
      {
        unit_id: "source-note-0001",
        rule_id: "FAS-SN-002",
        severity: "major",
        category: "source_note",
        finding: "The source note includes a discovery URL that needs source-surrogate review.",
        standard: "Discovery URLs must not substitute for controlling provenance.",
        recommended_action: "comment_only",
        original_text: "",
        replacement_text: "",
        comment_text: "Verify whether the discovery URL should remain outside the printed source note.",
        evidence_request: "source_surrogate_basis",
        verification_target: "Source surrogate relationship for source-note-0001"
      },
      {
        unit_id: "editorial-note-0001",
        rule_id: "FAS-STAT-001",
        severity: "info",
        category: "publication_status",
        finding: "The cross-reference uses publication-status language and should remain tied to status context.",
        standard: "Publication-status language must match official status context.",
        recommended_action: "no_change",
        original_text: "",
        replacement_text: "",
        comment_text: "",
        evidence_request: "publication_status",
        verification_target: "Official status context for the referenced document"
      }
    ],
    global_comments: [],
    style_discrepancy_tally: []
  };

  fs.writeFileSync(unitsPath, `${JSON.stringify(units, null, 2)}\n`);
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);

  const normal = runAudit([
    "--units",
    unitsPath,
    "--output",
    outputPath,
    "--matrix",
    "reports/frus-annotation-permutation-matrix.json",
    "--format",
    "json"
  ]);
  if (normal.status !== 0) {
    process.stderr.write(normal.stdout);
    process.stderr.write(normal.stderr);
    process.exit(normal.status || 1);
  }
  const normalReport = JSON.parse(normal.stdout);
  assert(normalReport.status === "pass", "expected normal coverage audit to pass");
  assert(normalReport.summary.reviewable_units === 2, "expected two reviewable units");
  assert(normalReport.summary.reviewed_units === 2, "expected both reviewable units to be covered");
  assert(normalReport.summary.unreviewed_units === 0, "expected no unreviewed reviewable units");

  const exhaustive = runAudit([
    "--units",
    unitsPath,
    "--output",
    outputPath,
    "--matrix",
    "reports/frus-annotation-permutation-matrix.json",
    "--review-mode",
    "exhaustive",
    "--format",
    "json"
  ]);
  if (exhaustive.status !== 0) {
    process.stderr.write(exhaustive.stdout);
    process.stderr.write(exhaustive.stderr);
    process.exit(exhaustive.status || 1);
  }
  const exhaustiveReport = JSON.parse(exhaustive.stdout);
  assert(exhaustiveReport.status === "warning", "expected exhaustive coverage audit to warn on signal gaps");
  assert(exhaustiveReport.summary.signal_category_gaps > 0, "expected signal-category gaps");

  const badOutput = { ...output, checks: [{ ...output.checks[0], unit_id: "missing-unit-9999" }] };
  fs.writeFileSync(badOutputPath, `${JSON.stringify(badOutput, null, 2)}\n`);
  const bad = runAudit(["--units", unitsPath, "--output", badOutputPath, "--format", "json"]);
  assert(bad.status !== 0, "expected unknown unit reference to fail");
  assert(bad.stdout.includes("unknown unit missing-unit-9999"), "expected unknown-unit failure detail");

  console.log("FRUS review coverage audit test passed: normal coverage, exhaustive signal gaps, and unknown-unit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
