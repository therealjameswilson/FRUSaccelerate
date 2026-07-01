#!/usr/bin/env node

import fs from "node:fs";
import { execFileSync } from "node:child_process";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

const sourceListPath = "reports/frus-carter-reagan-bush-source-list/frus-admin-source-list.json";
const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const lessonsPath = "reports/frus-annotation-sheet-builder-recent-published-lessons.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";

const sourceList = readJson(sourceListPath);
const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

assert(sourceList.schema_version === "1.0", "expected source-list schema v1");

const carterWesternEurope = sourceList.volumes.find(
  (volume) => volume.volume_id === "frus1977-80v27"
);
assert(carterWesternEurope, "expected Carter Volume XXVII source-list record");
assert(carterWesternEurope.administration === "carter", "expected Carter administration");
assert(
  carterWesternEurope.history_state_url ===
    "https://history.state.gov/historicaldocuments/frus1977-80v27",
  "expected official Carter Volume XXVII history.state.gov URL"
);
assert(
  carterWesternEurope.epub_url ===
    "https://static.history.state.gov/frus/frus1977-80v27/ebook/frus1977-80v27.epub",
  "expected official Carter Volume XXVII EPUB URL"
);
assert(carterWesternEurope.document_members === 399, "expected 399 Carter Volume XXVII document members");
assert(
  carterWesternEurope.document_source_note_status_counts?.source_note === 100,
  "expected 100 cleared Carter Volume XXVII document Source notes"
);
assert(
  carterWesternEurope.document_source_note_status_counts?.pending_placeholder === 299,
  "expected 299 pending Carter Volume XXVII placeholder records"
);
assert(
  fs.existsSync(carterWesternEurope.cached_epub),
  `expected cached Carter Volume XXVII EPUB at ${carterWesternEurope.cached_epub}`
);

const epubBytes = fs.readFileSync(carterWesternEurope.cached_epub);
assert(epubBytes.length > 0, "expected non-empty Carter Volume XXVII EPUB");
const titleHtml = execFileSync("unzip", ["-p", carterWesternEurope.cached_epub, "OEBPS/title.html"], {
  encoding: "utf8"
});
const placeholderHtml = execFileSync("unzip", ["-p", carterWesternEurope.cached_epub, "OEBPS/d1.html"], {
  encoding: "utf8"
});
const sourcesHtml = execFileSync("unzip", ["-p", carterWesternEurope.cached_epub, "OEBPS/sources.html"], {
  encoding: "utf8"
});
assert(titleHtml.includes("Foreign Relations of the United States, 1977"), "expected Carter Volume XXVII title evidence in EPUB");
assert(placeholderHtml.includes("This document will be published once its chapter has been cleared for publication"), "expected Carter Volume XXVII placeholder wording in EPUB");
assert(sourcesHtml.includes("This list of sources was generated from the source notes of the documents that have been cleared for publication"), "expected partial Sources-section scope wording in EPUB");

for (const [label, text] of [
  ["agent", agent],
  ["lessons", lessons],
  ["stress", stress]
]) {
  assert(text.includes("frus1977-80v27"), `${label} missing Carter Volume XXVII id`);
  assert(text.includes("incremental_chapter_placeholder"), `${label} missing incremental placeholder archetype`);
}

assert(
  agent.includes("not_annotation_sheet_incremental_placeholder") &&
    agent.includes("publication_placeholder_triage") &&
    agent.includes("partial_volume_source_scope"),
  "agent missing incremental placeholder schema values"
);
assert(
  lessons.includes("pending chapter placeholders") &&
    lessons.includes("generated from documents cleared for publication"),
  "lessons missing Carter incremental-publication evidence"
);
assert(
  stress.includes("not_annotation_sheet_incremental_placeholder") &&
    stress.includes("withheld-in-full, omitted-body, OCR-failure, or source-register-only"),
  "stress expectations missing incremental-placeholder negative controls"
);

console.log(
  "FRUS annotation builder recent-scope test passed: Carter Volume XXVII incremental placeholder evidence is represented and guarded."
);
