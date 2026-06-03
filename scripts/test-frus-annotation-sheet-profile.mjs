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
