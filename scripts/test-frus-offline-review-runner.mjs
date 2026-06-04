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
            `<w:footnote w:id="2"><w:p><w:r><w:t>Source: Reagan Library, Executive Secretariat, NSC Country File, Europe, 1981. No classification.</w:t></w:r></w:p></w:footnote>` +
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
      "--annotation-sheet-profile",
      "reports/frus-annotation-sheet-profile.sample.json",
      "--status-registry",
      "reports/frus-status-series-1981-1992.current.json",
      "--authority-registry",
      "reports/frus-authority-registry.sample.json",
      "--source-list-registry",
      "reports/frus-source-list-registry.sample.json",
      "--document-metadata-registry",
      "reports/frus-document-metadata-registry.sample.json",
      "--classification-registry",
      "reports/frus-classification-registry.sample.json",
      "--declassification-registry",
      "reports/frus-declassification-registry.sample.json",
      "--translation-registry",
      "reports/frus-translation-registry.sample.json",
      "--printed-attachment-registry",
      "reports/frus-printed-attachment-registry.sample.json",
      "--visual-material-registry",
      "reports/frus-visual-material-registry.sample.json",
      "--document-handling-registry",
      "reports/frus-document-handling-registry.sample.json",
      "--chronology-registry",
      "reports/frus-chronology-registry.sample.json",
      "--time-zone-registry",
      "reports/frus-time-zone-registry.sample.json",
      "--selection-balance-registry",
      "reports/frus-selection-balance-registry.sample.json",
      "--decision-process-registry",
      "reports/frus-decision-process-registry.sample.json",
      "--public-source-registry",
      "reports/frus-public-source-registry.sample.json",
      "--retrospective-account-registry",
      "reports/frus-retrospective-account-registry.sample.json",
      "--treaty-registry",
      "reports/frus-treaty-registry.sample.json",
      "--foreign-org-registry",
      "reports/frus-foreign-org-registry.sample.json",
      "--congressional-legal-registry",
      "reports/frus-congressional-legal-registry.sample.json",
      "--footnote-referback-registry",
      "reports/frus-footnote-referback-registry.sample.json",
      "--recurring-risk-registry",
      "reports/frus-recurring-risk-registry.sample.json",
      "--negative-search-registry",
      "reports/frus-negative-search-registry.sample.json",
      "--document-relationship-registry",
      "reports/frus-document-relationship-registry.sample.json",
      "--communications-registry",
      "reports/frus-communications-registry.sample.json",
      "--preparation-router",
      "reports/frus-preparation-router-1981-1992.current.json",
      "--permutation-matrix",
      "reports/frus-annotation-permutation-matrix.json",
      "--target-volume",
      "frus1989-92v31",
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
  assert(audit.counts.status_claims_extracted === 0, "expected zero extracted status claims");
  assert(audit.counts.authority_registry_usages === 0, "expected zero authority registry usages");
  assert(audit.counts.authority_registry_warnings === 0, "expected zero authority registry warnings");
  assert(audit.counts.authority_direct_edit_conflicts === 0, "expected zero authority direct-edit conflicts");
  assert(audit.counts.source_list_registry_usages === 1, "expected one source-list registry usage");
  assert(audit.counts.source_list_registry_warnings === 2, "expected two source-list registry warnings");
  assert(audit.counts.source_list_direct_edit_conflicts === 0, "expected zero source-list direct-edit conflicts");
  assert(audit.counts.document_metadata_registry_usages === 0, "expected zero document metadata registry usages");
  assert(audit.counts.document_metadata_registry_warnings === 0, "expected zero document metadata registry warnings");
  assert(audit.counts.document_metadata_direct_edit_conflicts === 0, "expected zero document metadata direct-edit conflicts");
  assert(audit.counts.classification_registry_usages === 1, "expected one classification registry usage");
  assert(audit.counts.classification_registry_warnings === 0, "expected zero classification registry warnings");
  assert(audit.counts.classification_release_status_confusions === 0, "expected zero classification release-status confusions");
  assert(audit.counts.classification_direct_edit_conflicts === 0, "expected zero classification direct-edit conflicts");
  assert(audit.counts.declassification_registry_usages === 0, "expected zero declassification registry usages");
  assert(audit.counts.declassification_registry_warnings === 0, "expected zero declassification registry warnings");
  assert(audit.counts.declassification_direct_edit_conflicts === 0, "expected zero declassification direct-edit conflicts");
  assert(audit.counts.translation_registry_usages === 0, "expected zero translation registry usages");
  assert(audit.counts.translation_registry_warnings === 0, "expected zero translation registry warnings");
  assert(audit.counts.translation_direct_edit_conflicts === 0, "expected zero translation direct-edit conflicts");
  assert(audit.counts.printed_attachment_registry_usages === 0, "expected zero printed attachment registry usages");
  assert(audit.counts.printed_attachment_registry_warnings === 0, "expected zero printed attachment registry warnings");
  assert(audit.counts.printed_attachment_direct_edit_conflicts === 0, "expected zero printed attachment direct-edit conflicts");
  assert(audit.counts.visual_material_registry_usages === 0, "expected zero visual material registry usages");
  assert(audit.counts.visual_material_registry_warnings === 0, "expected zero visual material registry warnings");
  assert(audit.counts.visual_material_direct_edit_conflicts === 0, "expected zero visual material direct-edit conflicts");
  assert(audit.counts.document_handling_registry_usages === 0, "expected zero document handling registry usages");
  assert(audit.counts.document_handling_registry_warnings === 0, "expected zero document handling registry warnings");
  assert(audit.counts.document_handling_direct_edit_conflicts === 0, "expected zero document handling direct-edit conflicts");
  assert(audit.counts.chronology_registry_usages === 0, "expected zero chronology registry usages");
  assert(audit.counts.chronology_registry_warnings === 0, "expected zero chronology registry warnings");
  assert(audit.counts.chronology_direct_edit_conflicts === 0, "expected zero chronology direct-edit conflicts");
  assert(audit.counts.time_zone_registry_usages === 0, "expected zero time-zone registry usages");
  assert(audit.counts.time_zone_registry_warnings === 0, "expected zero time-zone registry warnings");
  assert(audit.counts.time_zone_unmatched_like_units === 0, "expected zero unmatched time-zone-like units");
  assert(audit.counts.time_zone_direct_edit_conflicts === 0, "expected zero time-zone direct-edit conflicts");
  assert(audit.counts.selection_balance_registry_usages === 0, "expected zero selection-balance registry usages");
  assert(audit.counts.selection_balance_registry_warnings === 0, "expected zero selection-balance registry warnings");
  assert(audit.counts.selection_balance_unmatched_like_units === 0, "expected zero unmatched selection-balance-like units");
  assert(audit.counts.selection_balance_direct_edit_conflicts === 0, "expected zero selection-balance direct-edit conflicts");
  assert(audit.counts.decision_process_registry_usages === 0, "expected zero decision-process registry usages");
  assert(audit.counts.decision_process_registry_warnings === 0, "expected zero decision-process registry warnings");
  assert(audit.counts.decision_process_unmatched_like_units === 0, "expected zero unmatched decision-process-like units");
  assert(audit.counts.decision_process_direct_edit_conflicts === 0, "expected zero decision-process direct-edit conflicts");
  assert(audit.counts.public_source_registry_usages === 0, "expected zero public-source registry usages");
  assert(audit.counts.public_source_registry_warnings === 0, "expected zero public-source registry warnings");
  assert(audit.counts.public_source_direct_edit_conflicts === 0, "expected zero public-source direct-edit conflicts");
  assert(audit.counts.retrospective_account_registry_usages === 0, "expected zero retrospective-account usages");
  assert(audit.counts.retrospective_account_registry_warnings === 0, "expected zero retrospective-account warnings");
  assert(audit.counts.retrospective_account_unmatched_like_units === 0, "expected zero unmatched retrospective-like units");
  assert(
    audit.counts.retrospective_account_direct_edit_conflicts === 0,
    "expected zero retrospective-account direct-edit conflicts"
  );
  assert(audit.counts.treaty_registry_usages === 0, "expected zero treaty registry usages");
  assert(audit.counts.treaty_registry_warnings === 0, "expected zero treaty registry warnings");
  assert(audit.counts.treaty_direct_edit_conflicts === 0, "expected zero treaty direct-edit conflicts");
  assert(audit.counts.recurring_risk_matches === 0, "expected zero recurring-risk matches");
  assert(audit.counts.recurring_risk_direct_edit_conflicts === 0, "expected zero recurring-risk direct-edit conflicts");
  assert(audit.counts.foreign_org_registry_usages === 0, "expected zero foreign-org usages");
  assert(audit.counts.foreign_org_direct_edit_conflicts === 0, "expected zero foreign-org direct-edit conflicts");
  assert(audit.counts.congressional_legal_registry_usages === 0, "expected zero congressional/legal usages");
  assert(audit.counts.congressional_legal_registry_warnings === 0, "expected zero congressional/legal warnings");
  assert(
    audit.counts.congressional_legal_unmatched_like_units === 0,
    "expected zero unmatched congressional/legal-like units"
  );
  assert(
    audit.counts.congressional_legal_direct_edit_conflicts === 0,
    "expected zero congressional/legal direct-edit conflicts"
  );
  assert(audit.counts.footnote_referback_approved_usages === 0, "expected zero footnote refer-back usages");
  assert(audit.counts.footnote_referback_malformed === 0, "expected zero malformed footnote refer-backs");
  assert(
    audit.counts.footnote_referback_repeated_citation_thresholds === 0,
    "expected zero footnote refer-back repeated-citation thresholds"
  );
  assert(
    audit.counts.footnote_referback_repeated_citation_review_units === 0,
    "expected zero footnote refer-back third-and-later review units"
  );
  assert(
    audit.counts.footnote_referback_direct_edit_conflicts === 0,
    "expected zero footnote refer-back direct-edit conflicts"
  );
  assert(audit.counts.negative_search_registry_usages === 0, "expected zero negative-search registry usages");
  assert(audit.counts.negative_search_registry_warnings === 0, "expected zero negative-search registry warnings");
  assert(audit.counts.negative_search_direct_edit_conflicts === 0, "expected zero negative-search direct-edit conflicts");
  assert(audit.counts.document_relationship_registry_usages === 0, "expected zero document-relationship registry usages");
  assert(audit.counts.document_relationship_registry_warnings === 0, "expected zero document-relationship registry warnings");
  assert(audit.counts.document_relationship_direct_edit_conflicts === 0, "expected zero document-relationship direct-edit conflicts");
  assert(audit.counts.communications_registry_usages === 0, "expected zero communications registry usages");
  assert(audit.counts.communications_registry_warnings === 0, "expected zero communications registry warnings");
  assert(audit.counts.communications_direct_edit_conflicts === 0, "expected zero communications direct-edit conflicts");
  assert(audit.counts.annotation_sheet_profile_lexical_misclassifications === 0, "expected zero profile lexical misses");
  assert(audit.counts.annotation_sheet_profile_unexpected_angle_tokens === 0, "expected zero profile unexpected angle tokens");
  assert(audit.counts.annotation_sheet_profile_direct_edit_marker_conflicts === 0, "expected zero profile marker conflicts");
  assert(audit.counts.review_coverage_unreviewed_units === 0, "expected no unreviewed reviewable units");

  for (const artifact of [
    "extracted-units.json",
    "review-coverage.json",
    "source-note-lint.json",
    "pseudo-marker-preflight.txt",
    "annotation-sheet-profile-audit.json",
    "status-claims.json",
    "status-claims-preflight.txt",
    "status-registry-validation.json",
    "authority-registry-validation.json",
    "authority-usage-audit.json",
    "source-list-registry-validation.json",
    "source-list-usage-audit.json",
    "document-metadata-registry-validation.json",
    "document-metadata-usage-audit.json",
    "classification-registry-validation.json",
    "classification-usage-audit.json",
    "declassification-registry-validation.json",
    "declassification-usage-audit.json",
    "translation-registry-validation.json",
    "translation-usage-audit.json",
    "printed-attachment-registry-validation.json",
    "printed-attachment-usage-audit.json",
    "visual-material-registry-validation.json",
    "visual-material-usage-audit.json",
    "document-handling-registry-validation.json",
    "document-handling-usage-audit.json",
    "chronology-registry-validation.json",
    "chronology-usage-audit.json",
    "time-zone-registry-validation.json",
    "time-zone-usage-audit.json",
    "selection-balance-registry-validation.json",
    "selection-balance-usage-audit.json",
    "decision-process-registry-validation.json",
    "decision-process-usage-audit.json",
    "public-source-registry-validation.json",
    "public-source-usage-audit.json",
    "retrospective-account-registry-validation.json",
    "retrospective-account-usage-audit.json",
    "treaty-registry-validation.json",
    "treaty-usage-audit.json",
    "foreign-org-registry-validation.json",
    "foreign-org-usage-audit.json",
    "congressional-legal-registry-validation.json",
    "congressional-legal-usage-audit.json",
    "footnote-referback-registry-validation.json",
    "footnote-referback-usage-audit.json",
    "recurring-risk-registry-validation.json",
    "recurring-risk-usage-audit.json",
    "negative-search-registry-validation.json",
    "negative-search-usage-audit.json",
    "document-relationship-registry-validation.json",
    "document-relationship-usage-audit.json",
    "communications-registry-validation.json",
    "communications-usage-audit.json",
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
  assert(audit.reports.authority_registry_validation.summary.records === 8, "expected authority registry validation report");
  assert(audit.reports.authority_usage_audit.status === "pass", "expected authority usage audit report");
  assert(audit.reports.source_list_registry_validation.summary.records === 10, "expected source-list registry validation report");
  assert(audit.reports.source_list_usage_audit.status === "warning", "expected source-list usage audit warning report");
  assert(audit.reports.document_metadata_registry_validation.summary.records === 5, "expected document metadata registry validation report");
  assert(audit.reports.document_metadata_usage_audit.status === "pass", "expected document metadata usage audit report");
  assert(audit.reports.declassification_registry_validation.summary.records === 8, "expected declassification registry validation report");
  assert(audit.reports.declassification_usage_audit.status === "pass", "expected declassification usage audit report");
  assert(audit.reports.translation_registry_validation.summary.records === 7, "expected translation registry validation report");
  assert(audit.reports.translation_usage_audit.status === "pass", "expected translation usage audit report");
  assert(audit.reports.printed_attachment_registry_validation.summary.records === 6, "expected printed attachment registry validation report");
  assert(audit.reports.printed_attachment_usage_audit.status === "pass", "expected printed attachment usage audit report");
  assert(audit.reports.visual_material_registry_validation.summary.records === 5, "expected visual material registry validation report");
  assert(audit.reports.visual_material_usage_audit.status === "pass", "expected visual material usage audit report");
  assert(audit.reports.document_handling_registry_validation.summary.records === 7, "expected document handling registry validation report");
  assert(audit.reports.document_handling_usage_audit.status === "pass", "expected document handling usage audit report");
  assert(audit.reports.chronology_registry_validation.summary.records === 6, "expected chronology registry validation report");
  assert(audit.reports.chronology_usage_audit.status === "pass", "expected chronology usage audit report");
  assert(audit.reports.time_zone_registry_validation.summary.records === 8, "expected time-zone registry validation report");
  assert(audit.reports.time_zone_usage_audit.status === "pass", "expected time-zone usage audit report");
  assert(
    audit.reports.selection_balance_registry_validation.summary.records === 8,
    "expected selection-balance registry validation report"
  );
  assert(audit.reports.selection_balance_usage_audit.status === "pass", "expected selection-balance usage audit report");
  assert(
    audit.reports.decision_process_registry_validation.summary.records === 12,
    "expected decision-process registry validation report"
  );
  assert(audit.reports.decision_process_usage_audit.status === "pass", "expected decision-process usage audit report");
  assert(audit.reports.public_source_registry_validation.summary.records === 6, "expected public-source registry validation report");
  assert(audit.reports.public_source_usage_audit.status === "pass", "expected public-source usage audit report");
  assert(
    audit.reports.retrospective_account_registry_validation.summary.records === 6,
    "expected retrospective-account registry validation report"
  );
  assert(
    audit.reports.retrospective_account_usage_audit.status === "pass",
    "expected retrospective-account usage audit report"
  );
  assert(audit.reports.treaty_registry_validation.summary.records === 7, "expected treaty registry validation report");
  assert(audit.reports.treaty_usage_audit.status === "pass", "expected treaty usage audit report");
  assert(audit.reports.foreign_org_registry_validation.summary.records === 10, "expected foreign-org registry validation report");
  assert(audit.reports.foreign_org_usage_audit.status === "pass", "expected foreign-org usage audit report");
  assert(
    audit.reports.congressional_legal_registry_validation.summary.records === 16,
    "expected congressional/legal registry validation report"
  );
  assert(
    audit.reports.congressional_legal_usage_audit.status === "pass",
    "expected congressional/legal usage audit report"
  );
  assert(
    audit.reports.footnote_referback_registry_validation.summary.records === 8,
    "expected footnote refer-back registry validation report"
  );
  assert(
    audit.reports.footnote_referback_registry_validation.summary.repeat_threshold === 3,
    "expected footnote refer-back registry validation threshold"
  );
  assert(audit.reports.footnote_referback_usage_audit.status === "pass", "expected footnote refer-back usage audit report");
  assert(audit.reports.recurring_risk_registry_validation.summary.records === 13, "expected recurring-risk registry validation report");
  assert(audit.reports.recurring_risk_usage_audit.status === "pass", "expected recurring-risk usage audit report");
  assert(audit.reports.document_relationship_registry_validation.summary.records === 10, "expected document relationship registry validation report");
  assert(audit.reports.document_relationship_usage_audit.status === "pass", "expected document relationship usage audit report");
  assert(audit.reports.communications_registry_validation.summary.records === 8, "expected communications registry validation report");
  assert(audit.reports.communications_usage_audit.status === "pass", "expected communications usage audit report");
  assert(audit.reports.status_claims_extraction.summary.claims_found === 0, "expected status claim extraction report");
  assert(audit.reports.preparation_router_validation.status === "pass", "expected preparation router validation report");
  assert(audit.reports.permutation_matrix_validation.status === "pass", "expected permutation matrix validation report");
  assert(audit.reports.review_coverage.status === "pass", "expected review coverage audit report");

  const entries = readZip(outputDocx);
  const footnotes = entries.get("word/footnotes.xml").content.toString("utf8");
  const comments = entries.get("word/comments.xml").content.toString("utf8");
  assert(footnotes.includes("<w:commentRangeStart "), "expected generated comment range");
  assert(footnotes.includes("<w:del "), "expected generated deletion");
  assert(footnotes.includes("<w:ins "), "expected generated insertion");
  assert(comments.includes("Replace the URL-only locator"), "expected comment body text");

  console.log("FRUS offline review runner test passed: extraction, validation, authority/source-list/document-metadata/declassification/translation/printed-attachment/visual-material/document-handling/chronology/time-zone/selection-balance/decision-process/public-source/retrospective-account/treaty/foreign-org/congressional-legal/footnote-referback/recurring-risk/document-relationship/communications audits, queue, ledger, comments, redlines, output validation, and audit completed.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
