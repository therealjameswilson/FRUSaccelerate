#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requirePhrases(text, phrases, label) {
  for (const phrase of phrases) {
    assert(text.includes(phrase), `${label} missing required phrase: ${phrase}`);
  }
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const pdfPath = "tmp/pdfs/frus-builder-test/bush-library-digital-object/1991-05-27-gorbachev.pdf";

const agent = fs.readFileSync(agentPath, "utf8");
const stress = fs.readFileSync(stressPath, "utf8");
const lessons = fs.readFileSync(lessonsPath, "utf8");

requirePhrases(agent, [
  "Preserve public digital-object status",
  "archival_digital_object_metadata",
  "digital_object_storage_url",
  "citation_marker_page_status",
  "citation_marker_metadata",
  "paper_capture_ocr_status",
  "text_layer_classification_confidence",
  "source_note_control_number_basis",
  "digital_object_marker_note",
  "digital_object_metadata_basis",
  "citation_marker_basis",
  "text_layer_classification_basis",
  "Do not turn citation-marker metadata into body text"
], "canonical agent");

requirePhrases(stress, [
  "1991-05-27--Gorbachev.pdf",
  "Bush Library/NARA digital-object source-image PDF",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d216",
  "archival_digital_object_metadata",
  "digital_object_storage_url",
  "citation_marker_page_status",
  "paper_capture_ocr_status",
  "text_layer_classification_confidence",
  "source_note_control_number_basis",
  "Adobe Acrobat 9.2 Paper Capture Plug-in",
  "This is not a textual record",
  "OA/ID CF01730",
  "OA/ID CF01664",
  "9103951",
  "do not replace the FRUS source-note"
], "stress report");

requirePhrases(lessons, [
  "Public digital-object PDFs can add marker pages and unreliable text layers",
  "archival_digital_object_metadata",
  "digital_object_storage_url",
  "citation_marker_page_status",
  "citation_marker_metadata",
  "paper_capture_ocr_status",
  "text_layer_classification_confidence",
  "source_note_control_number_basis"
], "lessons report");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Producer:        Adobe Acrobat 9.2 Paper Capture Plug-in",
    "Pages:           4"
  ], "local Bush Library PDF pdfinfo");

  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(text, [
    "MEMORANDUM OF TELEPHONE CONVERSATION",
    "Telcon with President Gorbachev of the USSR",
    "CITATION",
    "This is not a textual record",
    "FOIA(s):",
    "2000-0429-F",
    "OA/ID Number:",
    "CF01730",
    "Folder ID Number:",
    "CF01730-006",
    "SECRE'f'"
  ], "local Bush Library PDF text layer");

  assert(
    text.includes("~)") || text.includes("<T>"),
    "expected damaged Paper Capture classification or portion-marking OCR"
  );
} else {
  console.warn(`Optional local PDF fixture not found, skipped binary checks: ${pdfPath}`);
}

console.log("FRUS annotation builder digital-object marker scope test passed.");
