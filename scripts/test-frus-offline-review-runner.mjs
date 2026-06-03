#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readZip, writeZip } from "./apply-frus-track-changes.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function minimalDocxEntries() {
  return new Map([
    [
      "[Content_Types].xml",
      {
        name: "[Content_Types].xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
            `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
            `<Default Extension="xml" ContentType="application/xml"/>` +
            `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
            `<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>` +
            `</Types>`,
          "utf8"
        )
      }
    ],
    [
      "_rels/.rels",
      {
        name: "_rels/.rels",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
            `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
            `</Relationships>`,
          "utf8"
        )
      }
    ],
    [
      "word/document.xml",
      {
        name: "word/document.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:body><w:p><w:r><w:t>FRUS offline review runner fixture.</w:t></w:r></w:p></w:body>` +
            `</w:document>`,
          "utf8"
        )
      }
    ],
    [
      "word/footnotes.xml",
      {
        name: "word/footnotes.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:footnote w:id="1"><w:p><w:r><w:t>Source: https://example.invalid/catalog-record. The document was attached to a memorandum for the record.</w:t></w:r></w:p></w:footnote>` +
            `<w:footnote w:id="2"><w:p><w:r><w:t>Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.</w:t></w:r></w:p></w:footnote>` +
            `</w:footnotes>`,
          "utf8"
        )
      }
    ]
  ]);
}

function checkerOutputFixture() {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Offline runner fixture with one evidence comment and one safe direct edit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Fixture anchors are safe for one comment and one direct edit.",
      gates: [
        {
          gate_id: "word_anchoring",
          gate_status: "pass",
          finding: "All direct-edit anchors are single-run exact matches.",
          required_action: ""
        },
        {
          gate_id: "evidence_basis",
          gate_status: "warning",
          finding: "One source-note item still needs archival path verification.",
          required_action: "Treat the URL-only source note as a Word comment and evidence queue item."
        },
        {
          gate_id: "wrapper_output",
          gate_status: "pass",
          finding: "Wrapper smoke test should validate output comments and revisions.",
          required_action: ""
        }
      ]
    },
    checks: [
      {
        unit_id: "source-note-0001",
        rule_id: "FAS-SN-002",
        severity: "major",
        category: "source_note",
        finding: "The source note leads with a discovery URL instead of a controlling repository or selected published source.",
        standard: "FRUS source notes should identify the controlling repository path or selected published source before discovery aids.",
        recommended_action: "comment_only",
        original_text: "",
        replacement_text: "",
        comment_text: "Replace the URL-only locator with the controlling repository path or selected published source before final style.",
        evidence_request: "archival_path",
        verification_target: "Repository, collection, series, folder, file, or selected published source for source-note-0001"
      },
      {
        unit_id: "source-note-0002",
        rule_id: "FAS-CLS-002",
        severity: "minor",
        category: "classification_handling",
        finding: "The source note says no classification rather than identifying the absence of a classification marking.",
        standard: "When the source image supports absence of a marking, distinguish original classification markings from release/declassification status.",
        recommended_action: "replace_text",
        original_text: "No classification.",
        replacement_text: "No classification marking.",
        comment_text: "",
        evidence_request: "none",
        verification_target: ""
      }
    ],
    global_comments: [
      {
        severity: "info",
        comment_text: "Offline runner fixture global comment remains in the audit report."
      }
    ],
    style_discrepancy_tally: [
      {
        discrepancy_id: "style-discrepancy-0001",
        category: "source_note",
        style_question: "How much source-surrogate detail should appear in final source notes when a discovery URL is present?",
        variant_a: "Keep the discovery URL in audit context only.",
        variant_b: "Mention the URL in the printed source note after the controlling source path.",
        unit_ids: ["source-note-0001"],
        published_or_local_examples: ["Offline runner fixture"],
        count: 1,
        risk: "medium",
        checker_action: "comment_only",
        general_editor_question: "Should URL-only discovery leads remain comments until a controlling source path is supplied?",
        status: "open",
        first_seen: "offline-runner-fixture",
        last_seen: "offline-runner-fixture",
        resolution_note: ""
      }
    ]
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-offline-review-runner-test-"));

try {
  const inputDocx = path.join(tmpDir, "input.docx");
  const checkerOutput = path.join(tmpDir, "checker-output.json");
  const outputDocx = path.join(tmpDir, "revised.docx");
  const artifactDir = path.join(tmpDir, "artifacts");
  const author = "FRUS Annotation Checker Test";
  writeZip(inputDocx, minimalDocxEntries());
  fs.writeFileSync(checkerOutput, `${JSON.stringify(checkerOutputFixture(), null, 2)}\n`);

  const result = spawnSync(
    process.execPath,
    [
      "scripts/run-frus-offline-review.mjs",
      "--docx",
      inputDocx,
      "--checker-output",
      checkerOutput,
      "--out",
      outputDocx,
      "--artifact-dir",
      artifactDir,
      "--run-id",
      "offline-runner-fixture",
      "--author",
      author,
      "--date",
      "2026-06-03T00:00:00.000Z",
      "--status-registry",
      "reports/frus-status-series-1981-1992.current.json",
      "--preparation-router",
      "reports/frus-preparation-router-1981-1992.current.json",
      "--permutation-matrix",
      "reports/frus-annotation-permutation-matrix.json",
      "--today",
      "2026-06-03",
      "--format",
      "json"
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  );

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }

  const audit = JSON.parse(result.stdout);
  assert(audit.status === "pass", "expected offline review audit to pass");
  assert(audit.counts.extracted_units === 3, `expected three extracted units, got ${audit.counts.extracted_units}`);
  assert(audit.counts.comments_applied === 1, "expected one Word comment");
  assert(audit.counts.tracked_edits_applied === 1, "expected one tracked edit");
  assert(audit.counts.insertions_expected === 1, "expected one insertion");
  assert(audit.counts.deletions_expected === 1, "expected one deletion");
  assert(audit.counts.evidence_queue_items === 1, "expected one evidence queue item");
  assert(audit.counts.discrepancy_ledger_items === 1, "expected one discrepancy ledger item");
  assert(audit.counts.source_note_lint_diagnostics === 1, "expected one source-note lint diagnostic");

  for (const artifact of [
    "extracted-units.json",
    "source-note-lint.json",
    "pseudo-marker-preflight.txt",
    "status-registry-validation.json",
    "preparation-router-validation.json",
    "permutation-matrix-validation.json",
    "evidence-queue.json",
    "discrepancy-ledger.json",
    "comment-application-report.json",
    "track-change-application-report.json",
    "output-validation.json",
    "audit.json"
  ]) {
    assert(fs.existsSync(path.join(artifactDir, artifact)), `expected ${artifact}`);
  }

  const validation = JSON.parse(fs.readFileSync(path.join(artifactDir, "output-validation.json"), "utf8"));
  assert(validation.status === "pass", "expected output validation artifact to pass");
  assert(audit.reports.status_registry_validation.status === "pass", "expected status registry validation report");
  assert(audit.reports.preparation_router_validation.status === "pass", "expected preparation router validation report");
  assert(audit.reports.permutation_matrix_validation.status === "pass", "expected permutation matrix validation report");

  const entries = readZip(outputDocx);
  const footnotes = entries.get("word/footnotes.xml").content.toString("utf8");
  const comments = entries.get("word/comments.xml").content.toString("utf8");
  assert(footnotes.includes("<w:commentRangeStart "), "expected generated comment range");
  assert(footnotes.includes("<w:del "), "expected generated deletion");
  assert(footnotes.includes("<w:ins "), "expected generated insertion");
  assert(comments.includes("Replace the URL-only locator"), "expected comment body text");

  console.log("FRUS offline review runner test passed: extraction, validation, queue, ledger, comments, redlines, output validation, and audit completed.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
