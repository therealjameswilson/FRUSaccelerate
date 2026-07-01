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
const pdfPath = "tmp/pdfs/frus-builder-test/archival-record-reprint/reagan-library-ussr-1981-10-29-2.pdf";
const archivalPdfUrl = "https://www.reaganlibrary.gov/public/2022-07/40-748-12026383-R21-051-2022.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1981-88v03/d98";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "digitized_archival_record_pdf",
  "Digitized archival record PDFs and FRUS printed-counterpart handling",
  "printed-counterpart authority only",
  "archival_record_pdf_url",
  "archival_record_repository",
  "archival_record_folder_title",
  "archival_record_control_identifier",
  "ocr_text_layer_status",
  "frus_printed_counterpart_url",
  "frus_printed_counterpart_volume_document",
  "printed_counterpart_match_status",
  "archival_record_reprint_note",
  "archival_record_pdf_basis",
  "digitized_source_record_url_basis",
  "frus_printed_counterpart_basis",
  "printed_counterpart_match_basis",
  "ocr_text_layer_basis",
  "Use published FRUS pages/volumes only as pattern evidence and printed-match authority"
], "agent");

requirePhrases(lessons, [
  "Digitized archival/source-record PDFs require counterpart-aware treatment",
  "presidential-library, NARA, CIA Reading Room/CREST, FOIA/MDR",
  "digitized_archival_record_pdf",
  "Use FRUS pages as printed-match authority and style evidence",
  "not as accepted PDF fixtures or source-record substitutes"
], "recent-published lessons");

requirePhrases(stress, [
  "Fixture provenance rule",
  "accepted local PDF fixtures should come from digitized archival/source records",
  "not from published FRUS volume/chapter/page extracts",
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "USSR (10/29/1981) (2)",
  "withdrawal-sheet rows 170222-170225",
  "sparse embedded OCR status",
  "do not use the FRUS page as the source-record PDF",
  "find a digitized archival PDB/NID source-record scan before counting it as a PDF fixture"
], "archetype stress tests");

requirePhrases(readme, [
  "digitized archival/source-record PDF handling",
  "FRUS printed-counterpart matching",
  "history.state.gov corpus lessons"
], "launch README");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, ["Pages:           27", "PDF version:"], "candidate archival PDF metadata");

  const pdfText = execFileSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(pdfText, [
    "Ronald Reagan Presidential Library",
    "Collection: Executive Secretariat, National",
    "Security Council: Country File",
    "USSR (10/29/1981) (2 of 2)",
    "RAC Box 21"
  ], "candidate archival PDF embedded text");

  if (commandExists("pdftoppm")) {
    fs.mkdirSync("tmp/pdfs/frus-builder-test/archival-record-reprint/render", { recursive: true });
    execFileSync("pdftoppm", [
      "-png",
      "-f",
      "4",
      "-l",
      "4",
      pdfPath,
      "tmp/pdfs/frus-builder-test/archival-record-reprint/render/ocr-page"
    ]);
    const pageImage = "tmp/pdfs/frus-builder-test/archival-record-reprint/render/ocr-page-04.png";
    assert(fs.existsSync(pageImage), "expected rendered page 4 image for archival PDF");

    if (commandExists("tesseract")) {
      const ocrText = execFileSync("tesseract", [pageImage, "stdout"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      }).replace(/\s+/g, " ");
      requirePhrases(ocrText, [
        "MEMORANDUM FOR THE PRESIDENT",
        "The State of the Soviet Economy",
        "Role of East-West Trade",
        "CIA Paper"
      ], "candidate archival PDF rendered-page OCR");
    }
  }
}

console.log("FRUS annotation builder archival-record reprint scope test passed: archival source PDF and FRUS printed counterpart are separated.");
