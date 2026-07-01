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
const pdfPath = "tmp/pdfs/frus-builder-test/press-release-background-briefing/frus1981-88v01-d151-background-briefing-excerpt.pdf";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "press_release_or_background_briefing",
  "press_release_background_briefing_note",
  "press_release_metadata",
  "background_briefing_metadata",
  "press_guidance_metadata",
  "attribution_ground_rules",
  "embargo_status",
  "public_release_or_transcript_version",
  "briefing_room_or_venue",
  "speaker_or_attribution_label",
  "press_pool_or_outlet",
  "released_text_status",
  "press_release_basis",
  "background_briefing_basis",
  "press_guidance_basis",
  "embargo_or_attribution_basis",
  "public_release_version_basis",
  "Do not treat the Office press release itself as a selected historical document unless the compiler explicitly selects it",
  "embargo language is release-status evidence rather than classification"
], "agent");

requirePhrases(lessons, [
  "Press releases, press guidance, and background briefings require public-release treatment",
  "press_release_or_background_briefing",
  "release or briefing date/time",
  "speaker or attribution label",
  "embargo or release status",
  "public transcript/version basis",
  "Do not recast them as memcons, interviews, ordinary public speeches, public-affairs strategy memoranda, or archival source-note records"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  "editorial-note/background briefing excerpt from official 2022 FRUS volume PDF",
  "Treat as editorial_note with press_release_or_background_briefing and public_or_printed_source evidence",
  "April 27, 1983 6 p.m. briefing time",
  "White House Briefing Room venue",
  "senior-administration-official attribution rule",
  "embargo-until-speech status",
  "Do not invent an archival Source note for the editorial note",
  "A press release, press guidance, or background-briefing PDF must preserve release/briefing type"
], "archetype stress tests");

requirePhrases(readme, [
  "press-release/background-briefing handling",
  "history.state.gov corpus lessons"
], "launch README");

if (fs.existsSync(pdfPath)) {
  const pdfText = execFileSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
  const normalizedPdfText = pdfText.replace(/\s+/g, " ");
  requirePhrases(normalizedPdfText, [
    "151. Editorial Note",
    "On April 27, 1983, at 6 p.m.",
    "background briefing to the press",
    "White House Briefing Room",
    "Lyndon Allin",
    "senior administration officials",
    "embargoed until Reagan gave his speech",
    "The text of the President",
    "address is printed as Document 152.",
    "152. Address by President Reagan Before a Joint Session"
  ], "candidate PDF text");
}

console.log("FRUS annotation builder press-release/background-briefing scope test passed: Document 151 PDF is represented and guarded.");
