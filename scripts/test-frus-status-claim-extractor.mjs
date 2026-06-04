#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runScript(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-status-claim-extractor-test-"));

try {
  const unitsPath = path.join(tmpDir, "status-units.json");
  const outputPath = path.join(tmpDir, "claims.json");
  const directOutputPath = path.join(tmpDir, "direct-output.json");
  const directClaimsPath = path.join(tmpDir, "direct-claims.json");

  const units = {
    schema_version: "frus-extracted-units-v1",
    source: "Status claim extractor fixture.",
    units: [
      {
        unit_id: "annotation-0042",
        unit_type: "editorial_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Editorial note",
        exact_text: "The memorandum was scheduled for publication in Foreign Relations, 1989-1992, Volume XXXI.",
        display_text: "The memorandum was scheduled for publication in Foreign Relations, 1989-1992, Volume XXXI.",
        surrounding_text: "",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      },
      {
        unit_id: "annotation-0051",
        unit_type: "editorial_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Editorial note",
        exact_text: "The Venezuela chapter was anticipated in 2026 in the South America volume.",
        display_text: "The Venezuela chapter was anticipated in 2026 in the South America volume.",
        surrounding_text: "",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      },
      {
        unit_id: "annotation-0077",
        unit_type: "editorial_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Editorial note",
        exact_text: "The related material is being cleared in the Bush National Security Policy volume.",
        display_text: "The related material is being cleared in the Bush National Security Policy volume.",
        surrounding_text: "",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      },
      {
        unit_id: "annotation-0099",
        unit_type: "editorial_note",
        editability: "editable",
        edit_safety: "safe_to_edit",
        comment_safety: "safe_to_comment",
        word_part: "word/document.xml",
        location: "Editorial note",
        exact_text: "See https://history.state.gov/historicaldocuments/frus1981-88v44p1.",
        display_text: "See https://history.state.gov/historicaldocuments/frus1981-88v44p1.",
        surrounding_text: "",
        existing_revisions: false,
        existing_comments: [],
        blocked_boundaries: []
      }
    ]
  };

  fs.writeFileSync(unitsPath, `${JSON.stringify(units, null, 2)}\n`);

  const extract = runScript("scripts/extract-frus-status-claims.mjs", [
    "--units",
    unitsPath,
    "--registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--out",
    outputPath,
    "--format",
    "json"
  ]);
  if (extract.status !== 0) {
    process.stderr.write(extract.stdout);
    process.stderr.write(extract.stderr);
    process.exit(extract.status || 1);
  }

  const claimsDoc = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert(claimsDoc.schema_version === "frus-status-claims-v1", "expected status-claims schema");
  assert(claimsDoc.summary.claims_found === 4, `expected four claims, got ${claimsDoc.summary.claims_found}`);
  const byType = new Map(claimsDoc.claims.map((claim) => [claim.claim_type, claim]));
  assert(byType.get("scheduled_for_publication").target_entry_id === "frus1989-92v31", "expected START I target");
  assert(byType.get("anticipated_in_year").target_entry_id === "frus1981-88v16", "expected South America target");
  assert(byType.get("anticipated_in_year").target_subitem === "Venezuela", "expected Venezuela subitem");
  assert(byType.get("anticipated_in_year").claimed_year === "2026", "expected anticipated year");
  assert(byType.get("being_cleared").target_entry_id === "frus1989-92v26", "expected Bush National Security Policy target");
  assert(byType.get("history_office_url").target_entry_id === "frus1981-88v44p1", "expected History Office URL target");

  const preflight = runScript("scripts/preflight-frus-status-claims.mjs", [
    "--registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--claims",
    outputPath,
    "--today",
    "2026-06-03"
  ]);
  if (preflight.status !== 0) {
    process.stderr.write(preflight.stdout);
    process.stderr.write(preflight.stderr);
    process.exit(preflight.status || 1);
  }

  const directOutput = {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Direct status edit fixture.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Direct status edit fixture.",
      gates: []
    },
    checks: [
      {
        unit_id: "annotation-0042",
        rule_id: "FAS-STAT-001",
        severity: "major",
        category: "publication_status",
        finding: "Change scheduled-for-publication language to printed-in language.",
        standard: "Publication-status redlines require current status and exact document or chapter target.",
        recommended_action: "replace_text",
        original_text: "scheduled for publication",
        replacement_text: "printed in",
        comment_text: "",
        evidence_request: "publication_status",
        verification_target: "Official status and exact target for annotation-0042"
      },
      {
        unit_id: "annotation-0077",
        rule_id: "FAS-STAT-002",
        severity: "major",
        category: "publication_status",
        finding: "Normalize volume-level clearance status language.",
        standard: "Volume-level status context is comment-only unless a document, chapter, or subitem target is supplied.",
        recommended_action: "replace_text",
        original_text: "being cleared in the Bush National Security Policy volume",
        replacement_text: "currently in clearance in Foreign Relations, 1989-1992, Volume XXVI",
        comment_text: "",
        evidence_request: "publication_status",
        verification_target: "Official status and exact target for annotation-0077"
      }
    ],
    global_comments: [],
    style_discrepancy_tally: []
  };
  fs.writeFileSync(directOutputPath, `${JSON.stringify(directOutput, null, 2)}\n`);

  const directExtract = runScript("scripts/extract-frus-status-claims.mjs", [
    "--units",
    unitsPath,
    "--registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--checker-output",
    directOutputPath,
    "--out",
    directClaimsPath,
    "--format",
    "json"
  ]);
  if (directExtract.status !== 0) {
    process.stderr.write(directExtract.stdout);
    process.stderr.write(directExtract.stderr);
    process.exit(directExtract.status || 1);
  }
  const directClaims = JSON.parse(fs.readFileSync(directClaimsPath, "utf8"));
  const directClaim = directClaims.claims.find((claim) => claim.unit_id === "annotation-0042");
  assert(directClaim.direct_edit_requested === true, "expected direct edit to be flagged");
  const directClearanceClaim = directClaims.claims.find((claim) => claim.unit_id === "annotation-0077");
  assert(directClearanceClaim.direct_edit_requested === true, "expected clearance status direct edit to be flagged");

  const directPreflight = runScript("scripts/preflight-frus-status-claims.mjs", [
    "--registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--claims",
    directClaimsPath,
    "--today",
    "2026-06-03"
  ]);
  assert(directPreflight.status !== 0, "expected direct publication-status edit to fail without exact target");
  assert(directPreflight.stderr.includes("direct"), "expected direct-edit failure detail");
  assert(
    directPreflight.stderr.includes("volume-level status context is comment-only"),
    "expected volume-level status direct edit to be blocked"
  );

  console.log("FRUS status claim extractor test passed: claims, targets, subitems, URL ids, preflight, and direct-edit blocking work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
