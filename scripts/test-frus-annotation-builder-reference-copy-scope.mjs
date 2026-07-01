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
const pdfPath = "tmp/pdfs/frus-builder-test/nsdd-reference-copy/reagan-nsdd250-reference-copy.pdf";
const archivalPdfUrl = "https://www.reaganlibrary.gov/public/archives/reference/scanned-nsdds/nsdd250.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d152";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "archival_reference_copy_pdf",
  "archival_reference_copy_status",
  "reference_copy_source_path_note",
  "reference_copy_authority_basis",
  "direct reference-copy URL",
  "FRUS source note remains the authority",
  "Do not replace the FRUS source note",
  "Do not silently backfill missing words"
], "agent");

requirePhrases(lessons, [
  "Digitized archival reference copies need source-path separation",
  "`archival_reference_copy_pdf`",
  "`reference_copy_source_path_note`",
  "Do not replace the source-note collection/box/folder"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "NSDD Digitized Reference Copies context",
  "Box SR-094",
  "poor embedded OCR/redaction-mask status",
  "do not backfill missing OCR/redacted words"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Pages:           14",
    "Adobe Acrobat Pro 11.0.15 Paper Capture Plug-in",
    "PDF version:     1.3"
  ], "archival reference-copy PDF metadata");

  const firstPage = execFileSync(
    "pdftotext",
    ["-layout", "-f", "1", "-l", "1", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(firstPage, [
    "TOP",
    "Reykjavik",
    "ABM",
    "SDI"
  ], "archival reference-copy first-page OCR");
  assert(
    firstPage.includes("VIRECTIVE") || firstPage.includes("NAT 10 NA"),
    "expected visible OCR degradation in archival reference-copy first page"
  );

  const finalPage = execFileSync(
    "pdftotext",
    ["-layout", "-f", "14", "-l", "14", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(finalPage, [
    "Associated Tasking",
    "Director of Central Intelliqence",
    "effective verification",
    "offensive ballistic",
    "missiles within ten years",
    "Reykjavik",
    "Access to this NSDD"
  ], "archival reference-copy final-page OCR");
}

console.log("FRUS annotation builder archival reference-copy scope checks passed.");
