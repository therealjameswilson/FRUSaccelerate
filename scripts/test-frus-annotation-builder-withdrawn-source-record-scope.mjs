#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const pdfPath =
  "tmp/pdfs/frus-builder-test/handwritten-memcon-source-packet/bush-gorbachev-sensitive-91126-002.pdf";
const archivalPdfUrl =
  "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-gbs/4708331/41-bpr-scow-ssussr-gor-91126-002.pdf";
const frusCounterpartUrl =
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d38";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "Preserve withdrawn source-record row and body-absent status",
  "withdrawn_source_record_counterpart_pdf",
  "withdrawn_source_record_status",
  "public_scan_body_absent_status",
  "selected_source_row_body_status",
  "printed_transcription_authority",
  "withdrawn_source_record_note",
  "withdrawn_source_record_body_absent",
  "withdrawn_source_record_basis",
  "public_scan_body_absent_basis",
  "printed_transcription_authority_basis",
  "do not treat the absent body as OCR failure",
  "draft from the next visible released item"
], "canonical agent");

requirePhrases(lessons, [
  "Withdrawn source-record rows can prove source path while withholding the selected body",
  "public scan omits the selected handwritten or classified body pages",
  "withdrawn_source_record_status",
  "public_scan_body_absent_status",
  "selected_source_row_body_status",
  "printed_transcription_authority",
  "do not backfill handwritten body text from FRUS unless target-volume or compiler authority is explicitly supplied"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "Bush Library withdrawn source-record row",
  "NAID `366551817`",
  "local ID `91126-002`",
  "Gorbachev (Dobrynin) Sensitive 1989 - June 1990 [2]",
  "Epson Scan 2",
  "181-page count",
  "no embedded text layer",
  "09b. Memcon Re: Memorandum of Conversation (18 pp.) 7/29/89",
  "restriction `(b)(1)`",
  "classification `S`",
  "selected_withdrawal_sheet_row",
  "printed_transcription_authority",
  "Document 38 says the July 29, 1989 memcon was handwritten"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Producer:        Epson Scan 2",
    "Pages:           181",
    "PDF version:     1.6"
  ], "withdrawn source-record PDF metadata");

  const embeddedText = execFileSync(
    "pdftotext",
    ["-layout", "-f", "1", "-l", "5", pdfPath, "-"],
    { encoding: "utf8" }
  );
  const extractedNonWhitespace = embeddedText.replace(/[\s\f]/g, "");
  assert(
    extractedNonWhitespace.length === 0,
    `expected no embedded text layer in pages 1-5, found ${extractedNonWhitespace.length} non-whitespace characters`
  );

  if (commandExists("pdftoppm") && commandExists("tesseract")) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-withdrawn-row-"));
    const firstPrefix = path.join(tempDir, "front");
    const rowPrefix = path.join(tempDir, "row");
    execFileSync("pdftoppm", ["-png", "-r", "120", "-f", "1", "-l", "4", pdfPath, firstPrefix], { stdio: "pipe" });
    execFileSync("pdftoppm", ["-png", "-r", "120", "-f", "81", "-l", "83", pdfPath, rowPrefix], { stdio: "pipe" });
    const renderedPages = fs
      .readdirSync(tempDir)
      .filter((fileName) => fileName.endsWith(".png"))
      .sort()
      .map((fileName) => path.join(tempDir, fileName));
    assert(renderedPages.length === 7, "expected pdftoppm to render pages 1-4 and 81-83");
    const ocrText = renderedPages
      .map((pagePath) => execFileSync("tesseract", [pagePath, "stdout", "--psm", "6"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }))
      .join("\n");
    requirePhrases(ocrText, [
      "This is not a textual record",
      "George H.W. Bush Presidential Records",
      "Scowcroft, Brent",
      "Special Separate USSR Notes Files",
      "Gorbachev Files",
      "OA/ID Number: 91126",
      "Folder ID Number: 91126-002",
      "09b. Memcon",
      "Memorandum of Conversation (18 pp.)",
      "7/29/89",
      "Document Originally",
      "July 21, 1989",
      "Dear Mr. Chairman"
    ], "OCR of marker, withdrawal row, and following visible document");
  } else {
    console.warn("Optional OCR check skipped: pdftoppm or tesseract not available.");
  }
} else {
  console.warn(`Optional local PDF fixture not found, skipped binary checks: ${pdfPath}`);
}

console.log("FRUS annotation builder withdrawn source-record scope checks passed.");
