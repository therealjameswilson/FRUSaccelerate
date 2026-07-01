#!/usr/bin/env node

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

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);
const readme = readText(readmePath);

requirePhrases(agent, [
  "fax_or_transmission_cover_sheet",
  "transmission_or_routing_cover_sheet",
  "cover_sheet_triage",
  "not_annotation_sheet_cover_sheet_only",
  "cover_sheet_only_no_annotation_sheet",
  "cover_sheet_transmission_note",
  "transmission_cover_metadata",
  "fax_transmission_metadata",
  "routing_slip_metadata",
  "cover_memorandum_metadata",
  "delivery_instruction",
  "routing_chain",
  "received_or_presented_to",
  "wrapper_payload_relationship",
  "attached_document_reference",
  "s_s_or_control_number",
  "page_count_or_transmission_count",
  "cover_sheet_basis",
  "fax_transmission_basis",
  "routing_slip_basis",
  "delivery_instruction_basis",
  "wrapper_payload_selection_basis",
  "attached_document_basis",
  "Do not convert them into the selected document's source note, document date, classification, drafting/clearance, approval, read status, or manuscript order",
  "ask whether the selected unit is the wrapper, the payload, both as one packet, or only the payload"
], "agent");

requirePhrases(lessons, [
  "Cover-sheet, routing-slip, and transmission-wrapper evidence used for wrapper handling",
  "Recent Reagan volumes preserve routing-slip evidence",
  "attached cover sheets, fax sheets, facsimile transmissions, and S/S cover sheets",
  "fax_or_transmission_cover_sheet",
  "cover_sheet_triage",
  "not_annotation_sheet_cover_sheet_only",
  "Do not use fax/routing date, receipt stamp, delivery instruction, page count, or cover-sheet addressee as the selected document date"
], "recent-published lessons");

requirePhrases(stress, [
  "https://history.state.gov/historicaldocuments/frus1981-88v04/ch3",
  "https://history.state.gov/historicaldocuments/frus1981-88v05/ch3",
  "https://history.state.gov/historicaldocuments/frus1969-76v09/ch1",
  "fax_or_transmission_cover_sheet",
  "transmission_or_routing_cover_sheet",
  "cover_sheet_triage",
  "not_annotation_sheet_cover_sheet_only",
  "cover_sheet_only_no_annotation_sheet",
  "A fax sheet, routing slip, S/S cover sheet, or transmission cover page must remain fax_or_transmission_cover_sheet"
], "archetype stress tests");

requirePhrases(readme, [
  "fax/cover-sheet/routing-slip handling",
  "history.state.gov corpus lessons"
], "launch README");

console.log("FRUS annotation builder cover-sheet scope test passed: fax, routing, and wrapper pages are represented and guarded.");
