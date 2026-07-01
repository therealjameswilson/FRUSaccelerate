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
const pdfPath = "tmp/pdfs/frus-builder-test/related-archival-copy/reagan-bulgarian-kgb-pope-connection.pdf";
const archivalPdfUrl = "https://www.reaganlibrary.gov/public/2024-08/40-139-39149351-R22-036-2024.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1981-88v10/d371";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "related_or_alternate_source_copy_pdf",
  "related_or_alternate_source_copy_context",
  "related_or_alternate_source_copy_status",
  "source_path_divergence_note",
  "alternate_copy_or_context_relationship",
  "related_context_only",
  "alternate_copy_unverified",
  "alternate_copy_basis",
  "source_path_divergence_basis",
  "do not force a match from title similarity alone"
], "agent");

requirePhrases(lessons, [
  "Related archival folders and alternate copies require divergence handling",
  "classify it as `related_or_alternate_source_copy_pdf`",
  "`related_context_only`",
  "`alternate_copy_unverified`",
  "do not mark the PDF as the printed source record"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "related_or_alternate_source_copy_pdf",
  "Bulgarian/KGB/Pope Connection - Assassination Attempt 1983",
  "Reagan Library System IV Intelligence Files, 1983, 400405",
  "source-path divergence review"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, ["Pages:           44", "PDF version:"], "related archival copy PDF metadata");

  const pdfText = execFileSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(pdfText, [
    "Ronald Reagan Presidential Library",
    "Collection: deGraffenreid, Kenneth E.: Files",
    "Bulgarian/KGB/Pope Connection",
    "Assassination Attempt 1983",
    "RAC Box 22",
    "F02-0083/01",
    "PRADOS",
    "179517 FOLDER",
    "MEMOS, NOTES, PAPERS"
  ], "related archival copy PDF embedded text");

  assert(
    !pdfText.includes("Assassination Attempt Against the Pope"),
    "related deGraffenreid folder should not be treated as the selected FRUS Document 371 source text without page-level match"
  );
}

console.log("FRUS annotation builder related source-copy scope checks passed.");
