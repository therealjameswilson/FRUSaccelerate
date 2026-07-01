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

function commandExists(command) {
  try {
    execFileSync("sh", ["-c", `command -v ${command} >/dev/null 2>&1`]);
    return true;
  } catch {
    return false;
  }
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const readmePath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Launch_2026-06-30/README.md";
const pdfPath = "tmp/pdfs/frus-builder-test/archival-folder-reprint/reagan-library-ussr-1981-11-03-11-05.pdf";
const archivalPdfUrl = "https://www.reaganlibrary.gov/public/2022-07/40-748-12026383-R21-052-2022.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1981-88v03/d99";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "digitized_archival_folder_pdf",
  "whole digitized archival folder PDF",
  "Inventory each visible row as a candidate unit",
  "selected_withdrawal_sheet_row",
  "selected_archival_page_range",
  "archival_folder_candidate_rows",
  "archival_folder_selection_note",
  "withdrawal_sheet_row_basis",
  "folder_document_inventory_basis",
  "do not choose the selected document from folder title alone"
], "agent");

requirePhrases(lessons, [
  "Whole digitized archival folder PDFs require withdrawal-sheet row selection",
  "Classify these uploads as `digitized_archival_folder_pdf`",
  "Do not treat the folder title or first visible row as the selected document",
  "withdrawal_sheet_row_basis",
  "folder_document_inventory_basis"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "digitized_archival_folder_pdf",
  "USSR (11/03/1981-11/05/1981)",
  "row 170230 wrapper/attached-notes clue",
  "row 170232 `SEC. HAIG TO REAGAN RE STRATEGY` clue",
  "Do not choose the selected document from folder title alone"
], "archetype stress tests");

requirePhrases(readme, [
  "digitized archival/source-record PDF handling",
  "archival folder withdrawal-sheet selection",
  "FRUS printed-counterpart matching"
], "launch README");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, ["Pages:           17", "PDF version:"], "candidate archival folder PDF metadata");

  const pdfText = execFileSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(pdfText, [
    "Ronald Reagan Presidential Library",
    "Collection: Executive Secretariat, National",
    "Security Council: Country File",
    "USSR (11/03/1981-11/05/1981)",
    "RAC Box 21"
  ], "candidate archival folder PDF embedded text");

  if (commandExists("pdftoppm")) {
    fs.mkdirSync("tmp/pdfs/frus-builder-test/archival-folder-reprint/render", { recursive: true });
    execFileSync("pdftoppm", [
      "-png",
      "-f",
      "13",
      "-l",
      "17",
      pdfPath,
      "tmp/pdfs/frus-builder-test/archival-folder-reprint/render/selected-row"
    ]);
    const rowImage = "tmp/pdfs/frus-builder-test/archival-folder-reprint/render/selected-row-13.png";
    const profileImage = "tmp/pdfs/frus-builder-test/archival-folder-reprint/render/selected-row-17.png";
    assert(fs.existsSync(rowImage), "expected rendered row page 13 image for archival folder PDF");
    assert(fs.existsSync(profileImage), "expected rendered profile page 17 image for archival folder PDF");

    if (commandExists("tesseract")) {
      const rowOcr = execFileSync("tesseract", [rowImage, "stdout"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      }).replace(/\s+/g, " ");
      requirePhrases(rowOcr, [
        "170230",
        "BLAIR",
        "RENTSCHLER",
        "HAIG",
        "MEMO TO PRESIDENT"
      ], "candidate archival folder withdrawal-row OCR");

      const profileOcr = execFileSync("tesseract", [profileImage, "stdout"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      }).replace(/\s+/g, " ");
      requirePhrases(profileOcr, [
        "NSC/S PROFILE",
        "TO PRES",
        "05 NOV 81",
        "STRATEGY TO PREEMPT BREZHNEV",
        "BONN"
      ], "candidate archival folder profile-page OCR");
    }
  }
}

console.log("FRUS annotation builder archival-folder scope test passed: folder PDFs require withdrawal-row and page-range selection.");
