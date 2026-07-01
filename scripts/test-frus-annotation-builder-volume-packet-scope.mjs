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
  "full_volume_or_chapter_packet",
  "volume_or_chapter_context",
  "volume_or_chapter_packet_triage",
  "not_annotation_sheet_volume_or_chapter_packet_only",
  "volume_or_chapter_packet_no_annotation_sheet",
  "volume_context_note",
  "volume_context_metadata",
  "volume_title_or_id",
  "chapter_or_section_title",
  "full_volume_pdf_status",
  "chapter_packet_status",
  "table_of_contents_or_document_list",
  "front_or_back_matter_status",
  "ebook_or_html_export_status",
  "volume_publication_or_update_date",
  "page_numbering_basis",
  "volume_or_chapter_context_basis",
  "selected_page_range_basis",
  "selected_document_range_basis",
  "table_of_contents_basis",
  "document_list_basis",
  "Do not draft one final-looking `Document [TBD]` annotation sheet from a whole volume or chapter packet",
  "Do not treat a volume publication date, ebook update date, chapter publication date, table-of-contents date, index heading, running header, or downloaded filename as the selected document date"
], "agent");

requirePhrases(lessons, [
  "Official ebooks page: https://history.state.gov/historicaldocuments/ebooks",
  "The official ebook page presents full-content ebook editions for offline access",
  "a growing number of volumes are published incrementally as individual chapters are cleared",
  "full_volume_or_chapter_packet",
  "Full-volume and chapter exports require selection triage"
], "recent-published lessons");

requirePhrases(stress, [
  "https://history.state.gov/historicaldocuments/ebooks",
  "full_volume_or_chapter_packet",
  "volume_or_chapter_packet_triage",
  "not_annotation_sheet_volume_or_chapter_packet_only",
  "do not use ebook update or volume publication date as selected document date/source provenance/declassification evidence",
  "whole-volume PDF, chapter export, table of contents, document list, or many-document packet"
], "archetype stress tests");

requirePhrases(readme, [
  "full-volume/chapter-packet triage",
  "history.state.gov corpus lessons"
], "launch README");

console.log("FRUS annotation builder volume-packet scope test passed: full-volume/chapter uploads are represented and guarded.");
