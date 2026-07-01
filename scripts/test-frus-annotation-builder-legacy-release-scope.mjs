#!/usr/bin/env node

import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function requirePhrases(text, phrases, label) {
  for (const phrase of phrases) {
    assert(text.includes(phrase), `${label} missing required phrase: ${phrase}`);
  }
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const readmePath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Launch_2026-06-30/README.md";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "legacy_digitized_or_microfiche_preview",
  "legacy_digitized_triage",
  "not_annotation_sheet_legacy_preview_only",
  "legacy_preview_only_no_annotation_sheet",
  "legacy_digitization_note",
  "legacy_digitization_metadata",
  "original_print_publication",
  "quarterly_release_or_digitization_date",
  "microfiche_preview_status",
  "front_matter_booklet_status",
  "document_pdf_bundle_status",
  "preview_or_full_text_status",
  "scan_ocr_quality",
  "microfiche_frame_or_page",
  "legacy_digitization_basis",
  "microfiche_preview_basis",
  "front_matter_booklet_basis",
  "document_pdf_bundle_basis",
  "full_text_edition_basis",
  "scan_ocr_quality_basis",
  "Do not treat digitization date, ebook update date, quarterly-release date, scan filename, page-image header, microfiche frame number, or preview-edition generation date as the historical document date"
], "agent");

requirePhrases(lessons, [
  "Official quarterly releases page: https://history.state.gov/historicaldocuments/quarterly-releases",
  "2016-2018 newly digitized older printed FRUS volumes",
  "Microfiche supplements can appear as preview editions with a front-matter booklet and PDFs of documents before full text conversion",
  "legacy_digitized_or_microfiche_preview",
  "Legacy digitized volumes and microfiche preview editions require scan/status treatment"
], "recent-published lessons");

requirePhrases(stress, [
  "https://history.state.gov/historicaldocuments/quarterly-releases",
  "legacy_digitized_or_microfiche_preview",
  "legacy_digitized_triage",
  "not_annotation_sheet_legacy_preview_only",
  "front-matter booklet",
  "PDFs of documents bundle status",
  "do not use digitization date as document date or source provenance",
  "do not treat a preview shell as a full-text edition",
  "A legacy digitized-volume or microfiche-preview PDF must remain legacy_digitized_or_microfiche_preview context"
], "archetype stress tests");

requirePhrases(readme, [
  "legacy digitized-volume/microfiche-preview handling",
  "history.state.gov corpus lessons"
], "launch README");

console.log("FRUS annotation builder legacy-release scope test passed: quarterly-release and microfiche-preview PDF handling is represented and guarded.");
