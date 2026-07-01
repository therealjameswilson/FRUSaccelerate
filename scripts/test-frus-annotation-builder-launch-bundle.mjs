#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function requirePhrases(text, phrases, label) {
  for (const phrase of phrases) {
    assert(
      text.includes(phrase),
      `${label} missing required phrase: ${phrase}`
    );
  }
}

const launchDir = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Launch_2026-06-30";
const canonicalAgent = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const canonicalLatest = "FRUS_Annotation_Sheet_Builder_v1_Latest.md";
const canonicalStress = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";
const canonicalLessons = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";

const launchAgent = path.join(launchDir, canonicalAgent);
const launchOperator = path.join(
  launchDir,
  "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Operator_Script_2026-06-30.txt"
);
const launchReadme = path.join(launchDir, "README.md");
const launchStress = path.join(
  launchDir,
  "FRUS_Annotation_Sheet_Builder_v1_PDF_Archetype_Stress_Tests_2026-07-01.md"
);
const launchLessons = path.join(
  launchDir,
  "FRUS_Annotation_Sheet_Builder_v1_Recent_Published_FRUS_Lessons_2026-06-30.md"
);
const zipPath = `${launchDir}.zip`;
const tarPath = `${launchDir}.tar.gz`;

for (const filePath of [
  launchAgent,
  launchOperator,
  launchReadme,
  launchStress,
  launchLessons,
  zipPath,
  tarPath
]) {
  assert(fs.existsSync(filePath), `missing launch artifact: ${filePath}`);
}

assert(
  fs.readFileSync(canonicalAgent).equals(fs.readFileSync(canonicalLatest)),
  "latest builder file must match canonical agent file"
);
assert(
  fs.readFileSync(canonicalAgent).equals(fs.readFileSync(launchAgent)),
  "launch agent file must match canonical agent file"
);
assert(
  fs.readFileSync(canonicalStress).equals(fs.readFileSync(launchStress)),
  "launch stress-test report must match canonical stress-test report"
);
assert(
  fs.readFileSync(canonicalLessons).equals(fs.readFileSync(launchLessons)),
  "launch lessons report must match canonical lessons report"
);

const agent = readText(canonicalAgent);
const operator = readText(launchOperator);
const readme = readText(launchReadme);
const stress = readText(canonicalStress);
const lessons = readText(canonicalLessons);
const archetypeMatch = agent.match(/"pdf_archetype": "([^"]+)"/);
assert(archetypeMatch, "canonical agent missing pdf_archetype schema enum");
const archetypes = archetypeMatch[1].split("|").map((value) => value.trim()).filter(Boolean);
const stressRows = stress.split("\n").filter((line) => line.startsWith("| `"));
const archetypeCounts = new Map(archetypes.map((archetype) => [archetype, 0]));
for (const row of stressRows) {
  for (const archetype of archetypes) {
    if (row.includes(archetype)) {
      archetypeCounts.set(archetype, archetypeCounts.get(archetype) + 1);
    }
  }
}
const zeroCoverage = [...archetypeCounts.entries()]
  .filter(([, count]) => count === 0)
  .map(([archetype]) => archetype);
assert(
  zeroCoverage.length === 0,
  `launch bundle has schema archetypes without stress rows: ${zeroCoverage.join(", ")}`
);

requirePhrases(agent, [
  "StateChat-c",
  "ChatGPT 5.4",
  "drag and drop one or more document PDFs",
  "overall_readiness",
  "pdf_to_annotation_sheet",
  "batch_pdf_to_annotation_sheet",
  "docx_production",
  "word_docx_tool_available",
  "Do not invent source provenance",
  "history.state.gov",
  "published from 2016 through 2025",
  "frus1977-80v27",
  "full_volume_or_chapter_packet",
  "volume_or_chapter_packet_triage",
  "not_annotation_sheet_volume_or_chapter_packet_only",
  "incremental_chapter_placeholder",
  "not_annotation_sheet_incremental_placeholder",
  "legacy_digitized_or_microfiche_preview",
  "legacy_digitized_triage",
  "not_annotation_sheet_legacy_preview_only",
  "archival_photocopy",
  "mixed_or_unclear"
], "canonical agent");

requirePhrases(operator, [
  "standalone-network operator",
  "StateChat-c with ChatGPT 5.4",
  "drag the PDF into the context window",
  "PART 3 - STANDARD DRAG-AND-DROP PROMPT",
  "PART 4 - BATCH PROMPT",
  "PART 5 - OCR TRIAGE PROMPT",
  "PART 6 - SOURCE-NOTE-ONLY PROMPT",
  "PART 7 - DOCX PRODUCTION PROMPT",
  "Return JSON first using the v1 schema",
  "Do not invent source provenance",
  "If no Word-writing tool is available"
], "operator script");

requirePhrases(readme, [
  "Launch Handoff",
  "standalone StateChat-c / ChatGPT 5.4 system",
  "Drag-And-Drop Workflow",
  "Drag and drop the PDF document or PDF batch into the context window",
  "Return JSON first using the v1 schema",
  "copy-ready annotation-sheet draft",
  "DOCX review-copy mode",
  "full-volume/chapter-packet triage",
  "incremental-volume/chapter-placeholder handling",
  "legacy digitized-volume/microfiche-preview handling",
  "history.state.gov corpus lessons"
], "README");

requirePhrases(stress, [
  "Purpose: record PDF archetype tests",
  "history.state.gov",
  "full_volume_or_chapter_packet",
  "not_annotation_sheet_volume_or_chapter_packet_only",
  "frus1977-80v27",
  "incremental_chapter_placeholder",
  "not_annotation_sheet_incremental_placeholder",
  "legacy_digitized_or_microfiche_preview",
  "not_annotation_sheet_legacy_preview_only",
  "archival_photocopy",
  "mixed_or_unclear"
], "stress-test report");

requirePhrases(lessons, [
  "official history.state.gov EPUBs and pages",
  "published from 2016 through 2025",
  "frus1977-80v27",
  "The official ebook page presents full-content ebook editions for offline access",
  "Full-volume and chapter exports require selection triage",
  "pending chapter placeholders",
  "Incrementally published volumes require placeholder handling",
  "2016-2018 newly digitized older printed FRUS volumes",
  "Microfiche supplements can appear as preview editions with a front-matter booklet and PDFs of documents before full text conversion",
  "Legacy digitized volumes and microfiche preview editions require scan/status treatment",
  "Archival photocopy and source-image uploads require scan-first treatment",
  "Mixed or unclear multi-document uploads require selection triage"
], "recent-published lessons");

execFileSync("zip", ["-T", zipPath], { stdio: "pipe" });
const tarListing = execFileSync("tar", ["-tzf", tarPath], { encoding: "utf8" });
for (const filePath of [
  launchAgent,
  launchOperator,
  launchReadme,
  launchStress,
  launchLessons
]) {
  assert(
    tarListing.includes(filePath),
    `tar archive missing launch file: ${filePath}`
  );
}

console.log("FRUS annotation builder launch-bundle test passed: standalone StateChat-c handoff files, prompts, canonical copies, and archives are consistent.");
