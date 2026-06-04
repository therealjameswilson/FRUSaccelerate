#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runAudit(args) {
  return spawnSync(process.execPath, ["scripts/audit-frus-annotation-sheet-profile.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
}

function checkerOutput(checks) {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Annotation-sheet profile regression fixture.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Regression fixture.",
      gates: [
        {
          gate_id: "word_anchoring",
          gate_status: "pass",
          finding: "Fixture gate.",
          required_action: ""
        }
      ]
    },
    checks,
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-annotation-sheet-profile-test-"));

try {
  const goodResult = runAudit([
    "--profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--units",
    "reports/frus-annotation-sheet-profile-units.sample.json",
    "--checker-output",
    "reports/frus-annotation-sheet-profile-safe-output.sample.json",
    "--format",
    "json"
  ]);
  if (goodResult.status !== 0) {
    process.stderr.write(goodResult.stdout);
    process.stderr.write(goodResult.stderr);
    process.exit(goodResult.status || 1);
  }
  const goodAudit = JSON.parse(goodResult.stdout);
  assert(goodAudit.schema_version === "frus-annotation-sheet-profile-audit-v1", "expected audit schema");
  assert(goodAudit.status === "pass", `expected profile fixture to pass, got ${goodAudit.status}`);
  assert(goodAudit.summary.units_reviewed === 3, "expected three profile fixture units");
  assert(goodAudit.summary.lexical_matches === 3, "expected three lexical matches");
  assert(goodAudit.summary.marker_tokens === 5, `expected five production marker tokens, got ${goodAudit.summary.marker_tokens}`);
  assert(goodAudit.summary.direct_edits_reviewed === 0, "expected no direct edits in safe profile fixture");
  assert(goodAudit.summary.lexical_misclassifications === 0, "expected no lexical misclassifications");

  const profileOnly = runAudit(["--profile", "reports/frus-annotation-sheet-profile.sample.json", "--format", "text"]);
  assert(profileOnly.status === 0, "expected profile-only validation to pass");
  assert(profileOnly.stdout.includes("0 units"), "expected profile-only text summary");

  const badUnitsPath = path.join(tmpDir, "bad-units.json");
  const goodUnits = JSON.parse(fs.readFileSync("reports/frus-annotation-sheet-profile-units.sample.json", "utf8"));
  goodUnits.units[1].unit_type = "transcribed_document_text";
  fs.writeFileSync(badUnitsPath, `${JSON.stringify(goodUnits, null, 2)}\n`);
  const badUnitResult = runAudit([
    "--profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--units",
    badUnitsPath,
    "--format",
    "json"
  ]);
  assert(badUnitResult.status !== 0, "expected source-note lexical misclassification to fail");
  assert(badUnitResult.stdout.includes("lex-source-note-inline"), "expected lexical pattern failure detail");

  const badAssemblyPath = path.join(tmpDir, "bad-assembly-units.json");
  const badAssemblyUnits = JSON.parse(fs.readFileSync("reports/frus-annotation-sheet-profile-units.sample.json", "utf8"));
  badAssemblyUnits.units.push(
    {
      unit_id: "profile-heading-0004",
      unit_type: "document_heading",
      editability: "context_only",
      edit_safety: "comment_only",
      comment_safety: "safe_to_comment",
      word_part: "word/document.xml",
      location: "Document body, paragraph 4",
      xml_anchor: {
        paragraph_index: 4,
        run_start: 0,
        run_end: 1,
        char_start: 0,
        char_end: 38
      },
      paragraph_style: "Heading1",
      word_structure: {
        page_break_before: false,
        explicit_page_breaks: 0,
        has_numbering: false,
        footnote_reference_ids: ["1"],
        endnote_reference_ids: [],
        comment_reference_ids: [],
        has_note_reference: true
      },
      exact_text: "1. Memorandum From the President",
      display_text: "1. Memorandum From the President[footnote 1]",
      surrounding_text: "",
      existing_revisions: false,
      existing_comments: [],
      blocked_boundaries: ["note_reference_boundary"]
    },
    {
      unit_id: "profile-source-note-0005",
      unit_type: "source_note",
      editability: "editable",
      edit_safety: "safe_to_edit",
      comment_safety: "safe_to_comment",
      word_part: "word/document.xml",
      location: "Document body, paragraph 5",
      xml_anchor: {
        paragraph_index: 5,
        run_start: 0,
        run_end: 0,
        char_start: 0,
        char_end: 72
      },
      paragraph_style: "Normal",
      word_structure: {
        page_break_before: false,
        explicit_page_breaks: 0,
        has_numbering: true,
        numbering_level: "0",
        numbering_id: "9",
        footnote_reference_ids: [],
        endnote_reference_ids: [],
        comment_reference_ids: [],
        has_note_reference: false
      },
      exact_text: "Source: Reagan Library, Executive Secretariat, NSC Files. Secret.",
      display_text: "Source: Reagan Library, Executive Secretariat, NSC Files. Secret.",
      surrounding_text: "1. Memorandum From the President",
      existing_revisions: false,
      existing_comments: [],
      blocked_boundaries: []
    },
    {
      unit_id: "profile-heading-0006",
      unit_type: "document_heading",
      editability: "context_only",
      edit_safety: "comment_only",
      comment_safety: "safe_to_comment",
      word_part: "word/document.xml",
      location: "Document body, paragraph 6",
      xml_anchor: {
        paragraph_index: 6,
        run_start: 0,
        run_end: 0,
        char_start: 0,
        char_end: 34
      },
      paragraph_style: "Heading1",
      word_structure: {
        page_break_before: false,
        explicit_page_breaks: 0,
        has_numbering: false,
        footnote_reference_ids: [],
        endnote_reference_ids: [],
        comment_reference_ids: [],
        has_note_reference: false
      },
      exact_text: "2. Telegram From State to Moscow",
      display_text: "2. Telegram From State to Moscow",
      surrounding_text: "1. Memorandum From the President",
      existing_revisions: false,
      existing_comments: [],
      blocked_boundaries: []
    }
  );
  fs.writeFileSync(badAssemblyPath, `${JSON.stringify(badAssemblyUnits, null, 2)}\n`);
  const badAssemblyResult = runAudit([
    "--profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--units",
    badAssemblyPath,
    "--format",
    "json"
  ]);
  assert(badAssemblyResult.status === 0, "expected assembly warnings to keep audit non-fatal");
  const badAssemblyAudit = JSON.parse(badAssemblyResult.stdout);
  assert(badAssemblyAudit.status === "warning", "expected assembly fixture to warn");
  assert(badAssemblyAudit.summary.assembly_warnings === 3, "expected three assembly warnings");
  assert(badAssemblyAudit.summary.heading_note_reference_units === 1, "expected one heading note-reference warning");
  assert(badAssemblyAudit.summary.note_numbering_units === 1, "expected one source-note numbering warning");
  assert(badAssemblyAudit.summary.document_headings_without_page_break === 1, "expected one missing page-break warning");
  assert(
    badAssemblyAudit.warnings.some((warning) => warning.includes("page-break evidence")),
    "expected page-break evidence warning"
  );

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "profile-source-note-0002",
          rule_id: "FAS-WRAP-001",
          severity: "minor",
          category: "format",
          finding: "Bad fixture touches production marker.",
          standard: "Direct edits must not touch production markers.",
          recommended_action: "replace_text",
          original_text: "<i>Turmoil and Triumph<r>",
          replacement_text: "Turmoil and Triumph",
          comment_text: "",
          evidence_request: "none",
          verification_target: ""
        }
      ]),
      null,
      2
    )}\n`
  );
  const badOutputResult = runAudit([
    "--profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--units",
    "reports/frus-annotation-sheet-profile-units.sample.json",
    "--checker-output",
    badOutputPath,
    "--format",
    "json"
  ]);
  assert(badOutputResult.status !== 0, "expected direct marker-touching edit to fail");
  assert(badOutputResult.stdout.includes("protected production marker <i>"), "expected marker conflict detail");

  const badProfilePath = path.join(tmpDir, "bad-profile.json");
  fs.writeFileSync(badProfilePath, `${JSON.stringify({ schema_version: "wrong" }, null, 2)}\n`);
  const badProfileResult = runAudit(["--profile", badProfilePath, "--format", "text"]);
  assert(badProfileResult.status !== 0, "expected malformed profile to fail");
  assert(badProfileResult.stdout.includes("frus-annotation-sheet-profile-v1"), "expected schema failure detail");

  console.log("FRUS annotation-sheet profile test passed: profile validation, lexical unitization, pseudo-marker protection, and failure modes work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
