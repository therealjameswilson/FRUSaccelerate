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
const optionalPdfPath = "tmp/pdfs/frus-builder-test/cia-reading-room-partial-counterpart/cia-rdp05s00620r000300770003-2.pdf";
const ciaRecordUrl = "https://www.cia.gov/readingroom/document/cia-rdp05s00620r000300770003-2";
const ciaPdfUrl = "https://www.cia.gov/readingroom/docs/CIA-RDP05S00620R000300770003-2.pdf";
const frusCounterpartUrl = "https://history.state.gov/historicaldocuments/frus1977-80v12/d252";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "Preserve agency reading-room partial-counterpart status",
  "agency_reading_room_record_metadata",
  "reading_room_pdf_access_status",
  "source_record_completeness_status",
  "partial_counterpart_scope_note",
  "partial_archival_counterpart_note",
  "reading_room_record_metadata_basis",
  "source_record_completeness_basis",
  "attached_paper_basis",
  "direct web retrieval of an agency PDF is blocked",
  "request the actual PDF or source image before drafting body-text claims"
], "agent");

requirePhrases(lessons, [
  "Agency reading-room PDFs can be partial printed counterparts",
  "`agency_reading_room_record_metadata`",
  "`reading_room_pdf_access_status`",
  "`source_record_completeness_status`",
  "`partial_counterpart_scope_note`",
  "`partial_match`",
  "`attached_paper_basis`"
], "recent-published lessons");

requirePhrases(stress, [
  ciaRecordUrl,
  ciaPdfUrl,
  frusCounterpartUrl,
  "CIA Reading Room/CREST partial archival counterpart",
  "CIA-RDP05S00620R000300770003-2",
  "General CIA Records metadata",
  "release decision `RIPPUB`",
  "document page count `1`",
  "Job 82M00501R",
  "Box 12, C-367",
  "The one-page CIA PDF matches the Turner cover memorandum only",
  "does not prove the attached April 10 memorandum",
  "Do not backfill the absent attachment from the FRUS page",
  "`source_record_completeness_basis`",
  "`attached_paper_basis`"
], "archetype stress tests");

if (fs.existsSync(optionalPdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [optionalPdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, ["Pages:           1", "PDF version:"], "agency reading-room partial-counterpart PDF metadata");

  const pdfText = execFileSync("pdftotext", ["-layout", optionalPdfPath, "-"], { encoding: "utf8" });
  requirePhrases(pdfText, [
    "The Director of Central Intelligence",
    "MEMORANDUM FOR",
    "Zbigniew Brzezinski",
    "The Soviet Invasion of Afghanistan",
    "Aberration or Symptom",
    "Attachment"
  ], "agency reading-room partial-counterpart PDF text");
  assert(
    !pdfText.includes("The Soviet invasion of Afghanistan has precipitated a sharp debate"),
    "one-page CIA cover memo must not be treated as proving the attached April 10 paper text"
  );
}

console.log("FRUS annotation builder agency reading-room partial-counterpart scope checks passed.");
