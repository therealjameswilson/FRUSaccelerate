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
const pdfPath = "tmp/pdfs/frus-builder-test/presidential-phone-folder/reagan-phone-calls-1981-01-20-03-30.pdf";
const archivalPdfUrl = "https://www.reaganlibrary.gov/public/digitallibrary/smof/execssecsubject/box-048/40-753-12026365-048-002-2019.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1981-88v01/d21";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "archival_folder_row_page_map",
  "folder_row_page_map_basis",
  "A selected FRUS source row may appear dozens of pages after the cover",
  "Do not draft from the first visible document",
  "selected row and page range"
], "agent");

requirePhrases(lessons, [
  "Multi-item folder PDFs need row-to-page mapping",
  "`archival_folder_row_page_map`",
  "Do not draft from the first visible released document",
  "`folder_row_page_map_basis`"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "archival_folder_row_page_map",
  "withdrawal-sheet row 60719",
  "likely selected page range 45-46",
  "State Department courtesy talking-points packet",
  "first released item"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Pages:           60",
    "Xerox DocuMate 6480",
    "Adobe Acrobat Pro DC 19 Paper Capture Plug-in"
  ], "phone-calls folder PDF metadata");

  const firstPagesText = execFileSync("pdftotext", ["-layout", "-f", "1", "-l", "3", pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(firstPagesText, [
    "Ronald Reagan Presidential Library",
    "Collection: Executive Secretariat, NSC: Subject",
    "Memorandums of Conversations",
    "President Reagan [Phone Calls: 01/20/1981-03/30/1981]",
    "Box: 48",
    "F2002-072/1",
    "60719 MEMO",
    "ALLEN TO MEESE/BRADY",
    "PRESIDENTIAL TELEPHONE CALL TO",
    "HEADS OF ALLIED GOVERNMENTS"
  ], "phone-calls folder cover and withdrawal text");

  const selectedPagesText = execFileSync("pdftotext", ["-layout", "-f", "45", "-l", "46", pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(selectedPagesText, [
    "January 22, 1981",
    "MEMORANDUM FOR:",
    "JAMES BRADY",
    "DICK ALLEN",
    "Presidential Telephone Call to Heads of",
    "Allied Governments",
    "Prime Minister Pierre Elliot Trudeau",
    "Prime Minister Margaret Thatcher",
    "Prime Minister Zenko Suzuki",
    "These highlights are for your background"
  ], "phone-calls selected pages text");

  const earlierPagesText = execFileSync("pdftotext", ["-layout", "-f", "5", "-l", "8", pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(earlierPagesText, [
    "Courtesy Talking Points for the President",
    "CANADA",
    "UNITED KINGDOM"
  ], "phone-calls earlier released item text");
}

console.log("FRUS annotation builder archival folder row-page map scope checks passed.");
