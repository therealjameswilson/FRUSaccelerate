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
const readmePath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Launch_2026-06-30/README.md";
const pdfPath = "tmp/pdfs/frus-builder-test/daily-intelligence/frus1977-80v12-d192-pdb-article.pdf";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "daily_intelligence_brief_or_pdb_article",
  "daily_intelligence_brief_note",
  "daily_intelligence_brief_metadata",
  "daily_intelligence_series",
  "article_or_annex_status",
  "full_daily_brief_version_status",
  "for_the_president_only_status",
  "codeword_or_handling_restriction_status",
  "daily_brief_publication_date",
  "intelligence_article_title",
  "daily_intelligence_brief_basis",
  "pdb_or_nid_series_basis",
  "article_or_annex_basis",
  "full_daily_brief_version_basis",
  "codeword_handling_basis",
  "Preserve the difference between the selected article or annex and the full daily publication",
  "full daily brief was not filed with the collection is an availability/copy-basis fact"
], "agent");

requirePhrases(lessons, [
  "Daily intelligence brief articles require article-versus-issue treatment",
  "President's Daily Brief or National Intelligence Daily articles and annexes",
  "daily_intelligence_brief_or_pdb_article",
  "full-daily-version availability",
  "Do not infer full PDB/NID contents"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  "President's Daily Brief article from official 2018 FRUS volume PDF",
  "Treat as daily_intelligence_brief_or_pdb_article with intelligence_or_estimate evidence",
  "Document 192 heading",
  "For the President Only handling",
  "full-PDB-not-filed status",
  "article-found-in-this-form copy basis",
  "Do not infer the full President's Daily Brief contents"
], "archetype stress tests");

requirePhrases(readme, [
  "daily-intelligence/PDB/NID article handling",
  "history.state.gov corpus lessons"
], "launch README");

if (fs.existsSync(pdfPath)) {
  const pdfText = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  const normalizedPdfText = pdfText.replace(/\s+/g, " ");
  requirePhrases(normalizedPdfText, [
    "192. Article in the President",
    "Daily Brief",
    "Washington, February 1, 1980",
    "USSR: Propaganda line on Afghanistan",
    "Central Intelligence Agency, Office of the Director of Central Intelligence",
    "Afghanistan Crisis",
    "PDBs",
    "Top Secret",
    "For the President Only",
    "The full version of this President",
    "article printed here was found in this form"
  ], "candidate PDF text");
}

console.log("FRUS annotation builder daily-intelligence/PDB scope test passed: Document 192 PDF is represented and guarded.");
