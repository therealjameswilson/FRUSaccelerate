#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requirePhrases(text, phrases, label) {
  for (const phrase of phrases) {
    assert(text.includes(phrase), `${label} missing required phrase: ${phrase}`);
  }
}

function commandExists(command) {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const pdfPath = "tmp/pdfs/frus-builder-test/bush-library-folder-packet/nsc0058-start-meeting-folder.pdf";
const directPdfUrl =
  "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSC_Mtgs_312293887/41-bpr-nsc-hfiles-nsc_mtgs-58-90002-028.pdf";

const agent = fs.readFileSync(agentPath, "utf8");
const lessons = fs.readFileSync(lessonsPath, "utf8");
const stress = fs.readFileSync(stressPath, "utf8");

requirePhrases(agent, [
  "Preserve image-only source-folder packet status",
  "image_only_source_pdf_status",
  "rendered_page_review_required",
  "source_folder_packet_status",
  "source_folder_item_inventory",
  "frus_document_to_source_page_map",
  "selected_document_page_range_basis",
  "source_folder_packet_note",
  "source_folder_packet_basis",
  "source_folder_item_inventory_basis",
  "frus_document_to_source_page_map_basis",
  "image_only_pdf_basis",
  "rendered_page_review_basis",
  "Do not choose Document 219 rather than Document 220",
  "Do not draft body-text, source-note, classification, or attachment claims from an empty text layer"
], "canonical agent");

requirePhrases(lessons, [
  "Image-only source-folder packets require page-range mapping before drafting",
  "Bush Library/NARA folder PDFs can be full source-folder packets with no embedded text layer",
  "source_folder_item_inventory",
  "frus_document_to_source_page_map",
  "do not treat an empty `pdftotext` result as a blank document"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  directPdfUrl,
  "Bush Library/NARA image-only source-folder packet",
  "FRUS 1989-1992, vol. XXXI, Documents 219 and 220",
  "NAID `470760966`",
  "local ID `90002-028`",
  "PaperStream Capture 2.5",
  "PFU PDF Library 1.4.2",
  "52-page count",
  "page-1 citation marker text `This is not a textual record`",
  "FOIA 2005-1003-F / 2009-0857-F",
  "02e",
  "02f",
  "03b",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d219",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d220",
  "selected_document_page_range_basis"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Creator:         PaperStream Capture 2.5",
    "Producer:        PFU PDF Library 1.4.2",
    "Pages:           52",
    "PDF version:     1.3"
  ], "NSC0058 folder-packet PDF metadata");

  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  const extractedNonWhitespace = text.replace(/[\s\f]/g, "");
  assert(
    extractedNonWhitespace.length === 0,
    `expected no embedded text layer, found ${extractedNonWhitespace.length} non-whitespace characters`
  );

  if (commandExists("pdftoppm") && commandExists("tesseract")) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-nsc0058-"));
    const prefix = path.join(tempDir, "page");
    execFileSync("pdftoppm", ["-png", "-f", "1", "-l", "3", pdfPath, prefix], { stdio: "pipe" });
    const renderedPages = fs
      .readdirSync(tempDir)
      .filter((fileName) => fileName.endsWith(".png"))
      .sort()
      .map((fileName) => path.join(tempDir, fileName));
    assert(renderedPages.length === 3, "expected pdftoppm to render pages 1-3");
    const ocrText = renderedPages
      .map((pagePath) => execFileSync("tesseract", [pagePath, "stdout", "--psm", "6"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }))
      .join("\n");
    requirePhrases(ocrText, [
      "This is not a textual record",
      "Withdrawal/Redaction",
      "02a",
      "02f",
      "03b",
      "George Bush Library",
      "NSC0058"
    ], "OCR of rendered NSC0058 marker and withdrawal pages");
  } else {
    console.warn("Optional OCR check skipped: pdftoppm or tesseract not available.");
  }
} else {
  console.warn(`Optional local PDF fixture not found, skipped binary checks: ${pdfPath}`);
}

console.log("FRUS annotation builder image-only source-folder packet scope checks passed.");
