#!/usr/bin/env node

import { execFileSync } from "node:child_process";
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
const pdfPath =
  "tmp/pdfs/frus-builder-test/chron-file-packet/reagan-matlock-chron-december-1986-1of4.pdf";
const archivalPdfUrl =
  "https://www.reaganlibrary.gov/public/digitallibrary/smof/nsc-europeanandsovietaffairs/matlock/box-019/40-351-7452064-019-004-2018.pdf";
const frusCounterpartUrl =
  "https://history.state.gov/historicaldocuments/frus1981-88v06/d8";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "Preserve chronological-file packet and forwarding-cover separation",
  "chronological_file_packet_pdf",
  "chron_file_packet_triage",
  "chron_file_packet_note",
  "chron_file_packet_metadata",
  "chron_file_item_inventory",
  "selected_chron_file_item_status",
  "selected_item_tab_or_attachment_status",
  "forwarding_cover_evidence",
  "source_note_forwarding_cover_quote",
  "chron_file_packet_basis",
  "chron_file_item_inventory_basis",
  "selected_chron_file_item_basis",
  "forwarding_cover_basis",
  "tab_attachment_basis",
  "Do not turn a chron-file cover page",
  "forwarding cover into the selected document body"
], "canonical agent");

requirePhrases(lessons, [
  "Chronological-file packet evidence used for wrapper and selected-item separation",
  "Reagan Library chronological-file PDFs can preserve a whole month folder",
  "Recent FRUS source notes can quote a forwarding memorandum",
  "Chronological-file packets require selected-item and forwarding-cover separation",
  "chronological_file_packet_pdf",
  "chron_file_packet_metadata",
  "selected_chron_file_item_status",
  "source_note_forwarding_cover_quote",
  "do not draft from the whole chron file"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "Reagan Library chronological-file source-record packet",
  "FRUS 1981-1988, vol. VI, Document 8",
  "cover collection `Matlock, Jack F.: Files`",
  "Matlock Chron December 1986 (1)",
  "Box 19",
  "withdrawal-sheet rows 8692-8699",
  "row 8693 Keel-to-Reagan forwarding memorandum",
  "row 8694 Shultz-to-Reagan memorandum dated November 14, 1986",
  "row 8695 attached paper",
  "Tab A label",
  "Keel forwarding-cover evidence quoted in the FRUS Source note",
  "chron_file_packet_metadata",
  "chron_file_item_inventory",
  "selected_chron_file_item_status",
  "selected_item_tab_or_attachment_status",
  "forwarding_cover_evidence",
  "source_note_forwarding_cover_quote",
  "do not promote the Keel forwarding memorandum into the Shultz memorandum body"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Creator:         Xerox DocuMate 6480",
    "Producer:        Adobe Acrobat Pro DC 19 Paper Capture Plug-in",
    "Pages:           56",
    "PDF version:     1.6"
  ], "chron-file packet PDF metadata");

  const coverAndWithdrawalText = execFileSync(
    "pdftotext",
    ["-layout", "-f", "1", "-l", "3", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(coverAndWithdrawalText, [
    "This is a PDF of a folder from our textual collections.",
    "Collection: Matlock, Jack F.: Files",
    "Folder Title: Matlock Chron December 1986 (1)",
    "Box: 19",
    "MATLOCK CHRON DECEMBER 1986 (1/4)",
    "8693",
    "KEEL TO PRESIDENT REAGAN",
    "8694",
    "SHULTZ TO PRESIDENT REAGAN",
    "8695",
    "BRINGING THE SOVIETS TO CLOSURE"
  ], "chron-file packet cover and withdrawal text");

  const wrapperAndSelectedText = execFileSync(
    "pdftotext",
    ["-layout", "-f", "8", "-l", "18", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(wrapperAndSelectedText, [
    "MEMORANDUM FOR THE PRESIDENT",
    "FROM:             ALTON G. KEEL",
    "George Shultz has sent you a memorandum",
    "Tab A      Memorandum from Secretary Shultz of November 14, 1986",
    "FROM:               George P. Shultz",
    "SUBJECT:            Strategy for the Soviets",
    "The outcome of the Vienna meeting",
    "Attachment:   Paper:",
    "Bringing the Soviets to Closure on START"
  ], "chron-file packet wrapper and selected item text");

  assert(
    wrapperAndSelectedText.includes("FROM:             ALTON G. KEEL") &&
      wrapperAndSelectedText.includes("FROM:               George P. Shultz"),
    "expected the PDF to prove a forwarding cover distinct from the selected Shultz memorandum"
  );
} else {
  console.warn(`Optional local PDF fixture not found, skipped binary checks: ${pdfPath}`);
}

console.log("FRUS annotation builder chron-file packet scope checks passed.");
