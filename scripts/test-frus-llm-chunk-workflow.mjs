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
    "--economic-financial-registry",
    "reports/frus-economic-financial-registry.sample.json",
    "--military-crisis-registry",
    "reports/frus-military-crisis-registry.sample.json",
    "--intelligence-law-enforcement-registry",
    "reports/frus-intelligence-law-enforcement-registry.sample.json",
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
  assert(manifest.summary.classification_registry_records === 5, "expected classification registry record count");
  assert(manifest.summary.declassification_registry_records === 8, "expected declassification registry record count");
  assert(manifest.summary.translation_registry_records === 7, "expected translation registry record count");
  assert(manifest.summary.printed_attachment_registry_records === 6, "expected printed attachment registry record count");
  assert(manifest.summary.visual_material_registry_records === 5, "expected visual material registry record count");
  assert(manifest.summary.document_handling_registry_records === 7, "expected document handling registry record count");
  assert(manifest.summary.chronology_registry_records === 6, "expected chronology registry record count");
  assert(manifest.summary.time_zone_registry_records === 8, "expected time-zone registry record count");
  assert(manifest.summary.selection_balance_registry_records === 8, "expected selection-balance registry record count");
  assert(manifest.summary.decision_process_registry_records === 12, "expected decision-process registry record count");
  assert(manifest.summary.public_source_registry_records === 6, "expected public-source registry record count");
  assert(manifest.summary.retrospective_account_registry_records === 6, "expected retrospective-account registry record count");
  assert(manifest.summary.treaty_registry_records === 7, "expected treaty registry record count");
  assert(manifest.summary.foreign_org_registry_records === 10, "expected foreign-org registry record count");
  assert(
    manifest.summary.congressional_legal_registry_records === 16,
    "expected congressional/legal registry record count"
  );
  assert(manifest.summary.economic_financial_registry_records === 20, "expected economic/financial registry record count");
  assert(manifest.summary.military_crisis_registry_records === 16, "expected military/crisis registry record count");
  assert(
    manifest.summary.intelligence_law_enforcement_registry_records === 15,
    "expected intelligence/law-enforcement registry record count"
  );
  assert(manifest.summary.footnote_referback_registry_records === 8, "expected footnote refer-back registry record count");
  assert(manifest.summary.recurring_risk_registry_records === 13, "expected recurring-risk registry record count");
  assert(manifest.summary.negative_search_registry_records === 6, "expected negative-search registry record count");
  assert(manifest.summary.document_relationship_registry_records === 10, "expected document-relationship registry record count");
  assert(manifest.summary.communications_registry_records === 8, "expected communications registry record count");
  assert(manifest.source_files.authority_registry === "reports/frus-authority-registry.sample.json", "expected authority registry source path");
  assert(manifest.source_files.source_list_registry === "reports/frus-source-list-registry.sample.json", "expected source-list registry source path");
  assert(manifest.source_files.document_metadata_registry === "reports/frus-document-metadata-registry.sample.json", "expected document metadata registry source path");
  assert(manifest.source_files.classification_registry === "reports/frus-classification-registry.sample.json", "expected classification registry source path");
  assert(manifest.source_files.declassification_registry === "reports/frus-declassification-registry.sample.json", "expected declassification registry source path");
  assert(manifest.source_files.translation_registry === "reports/frus-translation-registry.sample.json", "expected translation registry source path");
  assert(manifest.source_files.printed_attachment_registry === "reports/frus-printed-attachment-registry.sample.json", "expected printed attachment registry source path");
  assert(manifest.source_files.visual_material_registry === "reports/frus-visual-material-registry.sample.json", "expected visual material registry source path");
  assert(manifest.source_files.document_handling_registry === "reports/frus-document-handling-registry.sample.json", "expected document handling registry source path");
  assert(manifest.source_files.chronology_registry === "reports/frus-chronology-registry.sample.json", "expected chronology registry source path");
  assert(manifest.source_files.time_zone_registry === "reports/frus-time-zone-registry.sample.json", "expected time-zone registry source path");
  assert(manifest.source_files.selection_balance_registry === "reports/frus-selection-balance-registry.sample.json", "expected selection-balance registry source path");
  assert(manifest.source_files.decision_process_registry === "reports/frus-decision-process-registry.sample.json", "expected decision-process registry source path");
  assert(manifest.source_files.public_source_registry === "reports/frus-public-source-registry.sample.json", "expected public-source registry source path");
  assert(
    manifest.source_files.retrospective_account_registry === "reports/frus-retrospective-account-registry.sample.json",
    "expected retrospective-account registry source path"
  );
  assert(manifest.source_files.treaty_registry === "reports/frus-treaty-registry.sample.json", "expected treaty registry source path");
  assert(manifest.source_files.foreign_org_registry === "reports/frus-foreign-org-registry.sample.json", "expected foreign-org registry source path");
  assert(
    manifest.source_files.footnote_referback_registry === "reports/frus-footnote-referback-registry.sample.json",
    "expected footnote refer-back registry source path"
  );
  assert(
    manifest.source_files.economic_financial_registry === "reports/frus-economic-financial-registry.sample.json",
    "expected economic/financial registry source path"
  );
  assert(
    manifest.source_files.military_crisis_registry === "reports/frus-military-crisis-registry.sample.json",
    "expected military/crisis registry source path"
  );
  assert(
    manifest.source_files.intelligence_law_enforcement_registry ===
      "reports/frus-intelligence-law-enforcement-registry.sample.json",
    "expected intelligence/law-enforcement registry source path"
  );
  assert(manifest.source_files.recurring_risk_registry === "reports/frus-recurring-risk-registry.sample.json", "expected recurring-risk registry source path");
  assert(manifest.source_files.negative_search_registry === "reports/frus-negative-search-registry.sample.json", "expected negative-search registry source path");
  assert(manifest.source_files.document_relationship_registry === "reports/frus-document-relationship-registry.sample.json", "expected document-relationship registry source path");
  assert(manifest.source_files.communications_registry === "reports/frus-communications-registry.sample.json", "expected communications registry source path");
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
  assert(firstPacket.includes("Classification And Handling Registry Context"), "expected classification registry context in chunk packet");
  assert(firstPacket.includes("Top Secret; Sensitive; Eyes Only"), "expected classification registry content in chunk packet");
  assert(firstPacket.includes("Declassification And Omission Registry Context"), "expected declassification registry context in chunk packet");
  assert(firstPacket.includes("[less than 2 lines not declassified]"), "expected declassification registry content in chunk packet");
  assert(firstPacket.includes("Translation And Foreign-Origin Registry Context"), "expected translation registry context in chunk packet");
  assert(firstPacket.includes("Printed from a copy marked: “Unofficial translation.”"), "expected translation registry content in chunk packet");
  assert(firstPacket.includes("Printed And Nested Attachment Registry Context"), "expected printed attachment registry context in chunk packet");
  assert(firstPacket.includes("Paper Prepared in the Soviet Ministry of Foreign Affairs"), "expected printed attachment registry content in chunk packet");
  assert(firstPacket.includes("Visual Material Registry Context"), "expected visual material registry context in chunk packet");
  assert(firstPacket.includes("map of U.S. bases surrounding the Soviet Union"), "expected visual material registry content in chunk packet");
  assert(firstPacket.includes("Top Soviet Pop Group"), "expected photograph caption/title content in chunk packet");
  assert(firstPacket.includes("Document Handling And Marginalia Registry Context"), "expected document handling registry context in chunk packet");
  assert(firstPacket.includes("Watson initialed the memorandum on Gregg"), "expected document handling registry content in chunk packet");
  assert(firstPacket.includes("Chronology And Time Registry Context"), "expected chronology registry context in chunk packet");
  assert(firstPacket.includes("According to the President's Daily Diary, Bush met with Baker"), "expected chronology registry content in chunk packet");
  assert(firstPacket.includes("Time-Zone And Date-Time Group Registry Context"), "expected time-zone registry context in chunk packet");
  assert(firstPacket.includes("Geneva, January 10, 1991, 1757Z"), "expected START I Z-time registry content in chunk packet");
  assert(firstPacket.includes("open of business Washington time"), "expected Washington-time deadline content in chunk packet");
  assert(firstPacket.includes("Selection Balance And Completeness Registry Context"), "expected selection-balance registry context in chunk packet");
  assert(
    firstPacket.includes("complete memorandum of conversation is scheduled for publication"),
    "expected complete-record-elsewhere content in chunk packet"
  );
  assert(firstPacket.includes("Decision Process And Directive Registry Context"), "expected decision-process registry context in chunk packet");
  assert(firstPacket.includes("National Security Review 14"), "expected NSR decision-process content in chunk packet");
  assert(firstPacket.includes("National Security Decision Directive 236"), "expected NSDD decision-process content in chunk packet");
  assert(firstPacket.includes("Public Source And Public Diplomacy Registry Context"), "expected public-source registry context in chunk packet");
  assert(firstPacket.includes("Public Papers: Bush, 1991, pages 986-987"), "expected Public Papers registry content in chunk packet");
  assert(firstPacket.includes("Retrospective Account Registry Context"), "expected retrospective-account registry context in chunk packet");
  assert(firstPacket.includes("In his memoir, Shultz described the segment"), "expected retrospective-account registry content in chunk packet");
  assert(firstPacket.includes("Treaty And Legal Instrument Registry Context"), "expected treaty registry context in chunk packet");
  assert(firstPacket.includes("Conversion or Elimination Protocol"), "expected treaty registry content in chunk packet");
  assert(firstPacket.includes("Foreign And International Organization Registry Context"), "expected foreign-org registry context in chunk packet");
  assert(firstPacket.includes("ASEAN [Association of Southeast Asian Nations]"), "expected foreign-org registry content in chunk packet");
  assert(firstPacket.includes("President of the Union of Soviet Socialist Republics"), "expected foreign-state registry content in chunk packet");
  assert(
    firstPacket.includes("Congressional And Legal Authority Registry Context"),
    "expected congressional/legal registry context in chunk packet"
  );
  assert(firstPacket.includes("Economic Recovery Tax Act of 1981"), "expected public-law registry content in chunk packet");
  assert(firstPacket.includes("Presidential Determination No. 83-6"), "expected Presidential Determination content in chunk packet");
  assert(firstPacket.includes("Economic And Financial Registry Context"), "expected economic/financial context in chunk packet");
  assert(firstPacket.includes("A 47 percent increase in resources has been approved"), "expected IMF quota content in chunk packet");
  assert(firstPacket.includes("the Bank's $75 billion Eighth General Capital Increase"), "expected World Bank GCI content in chunk packet");
  assert(firstPacket.includes("Military And Crisis Operations Registry Context"), "expected military/crisis context in chunk packet");
  assert(firstPacket.includes("Stairstep program in the Gulf of Sidra"), "expected Gulf of Sidra operation content in chunk packet");
  assert(firstPacket.includes("Rabta chemical plant"), "expected Rabta/CW registry content in chunk packet");
  assert(
    firstPacket.includes("Intelligence And Law Enforcement Registry Context"),
    "expected intelligence/law-enforcement context in chunk packet"
  );
  assert(
    firstPacket.includes("Deputy Director for Operations, Central Intelligence Agency"),
    "expected CIA DDO content in chunk packet"
  );
  assert(firstPacket.includes("Bureau of Counter-Terrorism Records"), "expected counterterrorism content in chunk packet");
  assert(firstPacket.includes("Counter Narcotics in Peru"), "expected counternarcotics content in chunk packet");
  assert(firstPacket.includes("Footnote Refer-Back Registry Context"), "expected footnote refer-back registry context in chunk packet");
  assert(firstPacket.includes("repeat_threshold"), "expected footnote refer-back repeat threshold in chunk packet");
  assert(firstPacket.includes("See footnote 6, Document 35"), "expected footnote refer-back registry content in chunk packet");
  assert(firstPacket.includes("footnote 15, Document 106"), "expected three-target refer-back content in chunk packet");
  assert(firstPacket.includes("same separate page as B above"), "expected same-document local-context content in chunk packet");
  assert(firstPacket.includes("Recurring Compiler Risk Registry Context"), "expected recurring-risk registry context in chunk packet");
  assert(firstPacket.includes("Telegram number has a leading zero"), "expected recurring-risk registry content in chunk packet");
  assert(firstPacket.includes("Document XX cross-reference construction"), "expected Document XX recurring-risk content in chunk packet");
  assert(firstPacket.includes("Footnote refer-back rule may be missed"), "expected footnote refer-back recurring-risk content in chunk packet");
  assert(firstPacket.includes("Negative Search And No-Record Registry Context"), "expected negative-search registry context in chunk packet");
  assert(firstPacket.includes("Not found attached"), "expected negative-search registry content in chunk packet");
  assert(firstPacket.includes("Document Relationship Registry Context"), "expected document-relationship registry context in chunk packet");
  assert(firstPacket.includes("Attached but not printed. See Document 10"), "expected document-relationship registry content in chunk packet");
  assert(firstPacket.includes("Communications Metadata Registry Context"), "expected communications registry context in chunk packet");
  assert(firstPacket.includes("SECTO 2017"), "expected communications registry content in chunk packet");

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

  console.log("FRUS LLM chunk workflow test passed: chunk packets include annotation-sheet profile, classification, declassification, translation, printed attachment, visual material, document handling, chronology, time-zone, selection-balance, decision-process, public-source, retrospective-account, treaty, foreign-org, congressional/legal, economic/financial, military/crisis, intelligence/law-enforcement, recurring-risk, negative-search, document-relationship, and communications context, merge, validation, and boundary failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
