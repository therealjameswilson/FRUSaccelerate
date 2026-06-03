#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
    ...options
  });
}

function checkerOutput({ summary, checks }) {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "pass_with_comments",
      summary,
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "comment_only_review",
      safe_to_apply_tracked_changes: false,
      readiness_summary: "Chunk fixture output.",
      gates: [
        {
          gate_id: "chunk_reconciliation",
          gate_status: "pass",
          finding: "Chunk reviewed.",
          required_action: ""
        }
      ]
    },
    checks,
    global_comments: [],
    style_discrepancy_tally: []
  };
}

function noChange(unitId, category = "source_note") {
  return {
    unit_id: unitId,
    rule_id: "FAS-SN-001",
    severity: "info",
    category,
    finding: "No issue in this chunked review fixture.",
    standard: "Every reviewable extracted editorial unit should receive a checker entry.",
    recommended_action: "no_change",
    original_text: "",
    replacement_text: "",
    comment_text: "",
    evidence_request: "none",
    verification_target: ""
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-llm-chunks-test-"));

try {
  const outDir = path.join(tmpDir, "chunks");
  const mergeOut = path.join(tmpDir, "merged-output.json");
  const chunkResult = run("scripts/build-frus-llm-review-chunks.mjs", [
    "--units",
    "reports/frus-annotation-checker-extracted-units.sample.json",
    "--out-dir",
    outDir,
    "--status-registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--annotation-sheet-profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--status-claims",
    "reports/frus-status-claims.sample.json",
    "--authority-registry",
    "reports/frus-authority-registry.sample.json",
    "--source-list-registry",
    "reports/frus-source-list-registry.sample.json",
    "--document-metadata-registry",
    "reports/frus-document-metadata-registry.sample.json",
    "--preparation-router",
    "reports/frus-preparation-router-1981-1992.current.json",
    "--permutation-matrix",
    "reports/frus-annotation-permutation-matrix.json",
    "--target-volume",
    "frus1989-92v31",
    "--run-id",
    "chunk-workflow-test",
    "--max-units",
    "2",
    "--format",
    "json"
  ]);
  if (chunkResult.status !== 0) {
    process.stderr.write(chunkResult.stdout);
    process.stderr.write(chunkResult.stderr);
    process.exit(chunkResult.status || 1);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(outDir, "chunk-manifest.json"), "utf8"));
  assert(manifest.schema_version === "frus-llm-chunk-manifest-v1", "expected chunk manifest schema");
  assert(manifest.chunk_count === 2, `expected two chunks, got ${manifest.chunk_count}`);
  assert(manifest.summary.annotation_sheet_profile_checks === 4, "expected annotation-sheet profile check count");
  assert(manifest.summary.authority_registry_records === 8, "expected authority registry record count");
  assert(manifest.source_files.annotation_sheet_profile === "reports/frus-annotation-sheet-profile.sample.json", "expected annotation-sheet profile source path");
  assert(manifest.summary.source_list_registry_records === 10, "expected source-list registry record count");
  assert(manifest.summary.document_metadata_registry_records === 5, "expected document metadata registry record count");
  assert(manifest.source_files.authority_registry === "reports/frus-authority-registry.sample.json", "expected authority registry source path");
  assert(manifest.source_files.source_list_registry === "reports/frus-source-list-registry.sample.json", "expected source-list registry source path");
  assert(manifest.source_files.document_metadata_registry === "reports/frus-document-metadata-registry.sample.json", "expected document metadata registry source path");
  assert(fs.existsSync(path.join(outDir, "chunk-0001-review-packet.md")), "expected first chunk packet");
  assert(fs.existsSync(path.join(outDir, "chunk-0002-review-packet.md")), "expected second chunk packet");
  const firstPacket = fs.readFileSync(path.join(outDir, "chunk-0001-review-packet.md"), "utf8");
  assert(firstPacket.includes("Annotation Sheet Profile Context"), "expected annotation-sheet profile context in chunk packet");
  assert(firstPacket.includes("Foundations Consolidated.docx"), "expected annotation-sheet profile content in chunk packet");
  assert(firstPacket.includes("Authority Registry Context"), "expected authority registry context in chunk packet");
  assert(firstPacket.includes("Bush, George Herbert Walker"), "expected authority registry content in chunk packet");
  assert(firstPacket.includes("Source List And Front Matter Registry Context"), "expected source-list registry context in chunk packet");
  assert(firstPacket.includes("George H.W. Bush Presidential Library"), "expected source-list registry content in chunk packet");
  assert(firstPacket.includes("Document Metadata Registry Context"), "expected document metadata registry context in chunk packet");
  assert(firstPacket.includes("Information Memorandum From the Director of the Policy Planning Staff"), "expected document metadata registry content in chunk packet");

  const chunk1Output = path.join(tmpDir, "chunk-0001-output.json");
  const chunk2Output = path.join(tmpDir, "chunk-0002-output.json");
  fs.writeFileSync(
    chunk1Output,
    `${JSON.stringify(
      checkerOutput({
        summary: "Chunk 1 fixture.",
        checks: [noChange("source-note-0001"), noChange("editorial-note-0002", "editorial_note")]
      }),
      null,
      2
    )}\n`
  );
  fs.writeFileSync(
    chunk2Output,
    `${JSON.stringify(checkerOutput({ summary: "Chunk 2 fixture.", checks: [noChange("source-note-0003")] }), null, 2)}\n`
  );

  const merge = run("scripts/merge-frus-checker-chunks.mjs", [
    "--manifest",
    path.join(outDir, "chunk-manifest.json"),
    "--output",
    `chunk-0001=${chunk1Output}`,
    "--output",
    `chunk-0002=${chunk2Output}`,
    "--out",
    mergeOut,
    "--format",
    "json"
  ]);
  if (merge.status !== 0) {
    process.stderr.write(merge.stdout);
    process.stderr.write(merge.stderr);
    process.exit(merge.status || 1);
  }
  const mergeReport = JSON.parse(merge.stdout);
  assert(mergeReport.summary.checks_merged === 3, "expected three merged checks");
  assert(mergeReport.summary.covered_reviewable_units === 3, "expected all reviewable units covered");
  const validate = run("scripts/validate-frus-checker-output.mjs", [mergeOut]);
  if (validate.status !== 0) {
    process.stderr.write(validate.stdout);
    process.stderr.write(validate.stderr);
    process.exit(validate.status || 1);
  }

  const badChunk2 = path.join(tmpDir, "chunk-0002-bad-output.json");
  fs.writeFileSync(
    badChunk2,
    `${JSON.stringify(checkerOutput({ summary: "Bad chunk fixture.", checks: [noChange("source-note-0001")] }), null, 2)}\n`
  );
  const badMerge = run("scripts/merge-frus-checker-chunks.mjs", [
    "--manifest",
    path.join(outDir, "chunk-manifest.json"),
    "--output",
    `chunk-0001=${chunk1Output}`,
    "--output",
    `chunk-0002=${badChunk2}`,
    "--format",
    "json"
  ]);
  assert(badMerge.status !== 0, "expected out-of-chunk unit reference to fail");
  assert(badMerge.stdout.includes("outside chunk-0002"), "expected chunk-boundary failure detail");

  console.log("FRUS LLM chunk workflow test passed: chunk packets include annotation-sheet profile context, merge, validation, and boundary failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
