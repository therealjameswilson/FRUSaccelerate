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
  "history_state_web_or_print_export",
  "web_print_export_triage",
  "not_annotation_sheet_web_export_shell_only",
  "web_export_shell_no_annotation_sheet",
  "web_export_note",
  "web_print_export_context",
  "web_export_metadata",
  "history_state_document_url",
  "history_state_volume_id",
  "web_print_header_footer",
  "html_anchor_or_fragment",
  "browser_print_date",
  "static_epub_or_tei_basis",
  "web_export_artifact_status",
  "history_state_document_url_basis",
  "web_export_body_text_basis",
  "print_header_footer_basis",
  "web_export_artifact_basis",
  "Do not treat a history.state.gov URL, document-page title, print/export date, browser header/footer, downloaded filename, local file path, page number footer, or HTML navigation label as repository provenance",
  "prefer supplied compiler/source authority"
], "agent");

requirePhrases(lessons, [
  "Official history.state.gov document pages and web exports used for browser-PDF handling",
  "The official URL and export metadata are evidence locators",
  "Static EPUB/TEI or compiler PDF remains preferred",
  "history_state_web_or_print_export",
  "web_print_export_triage",
  "not_annotation_sheet_web_export_shell_only",
  "Do not use URL/header/footer/print date as source provenance/document date"
], "recent-published lessons");

requirePhrases(stress, [
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
  "history_state_web_or_print_export",
  "web_print_export_triage",
  "not_annotation_sheet_web_export_shell_only",
  "web_export_shell_no_annotation_sheet",
  "history_state_document_url",
  "browser_print_date",
  "static_epub_or_tei_basis",
  "Do not use URL/header/footer/print date as source provenance/document date",
  "A history.state.gov web/print export PDF must remain history_state_web_or_print_export context"
], "archetype stress tests");

requirePhrases(readme, [
  "history.state.gov web/print-export handling",
  "history.state.gov corpus lessons"
], "launch README");

console.log("FRUS annotation builder web-export scope test passed: history.state.gov print/browser PDFs are represented and guarded.");
