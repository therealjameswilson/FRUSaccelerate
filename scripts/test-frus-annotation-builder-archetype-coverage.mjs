#!/usr/bin/env node

import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";

const agent = fs.readFileSync(agentPath, "utf8");
const stress = fs.readFileSync(stressPath, "utf8");

const enumMatch = agent.match(/"pdf_archetype": "([^"]+)"/);
assert(enumMatch, "expected pdf_archetype enum in builder schema");

const archetypes = enumMatch[1].split("|").map((value) => value.trim()).filter(Boolean);
const duplicateArchetypes = archetypes.filter((value, index) => archetypes.indexOf(value) !== index);
assert(duplicateArchetypes.length === 0, `duplicate archetypes: ${duplicateArchetypes.join(", ")}`);

const coverageHints = new Map([
  ["archival_photocopy", /archival photocopy|FOIA marker|declassification stamp|source backup/i],
  ["appendix_or_facsimile", /appendix_or_facsimile|appendix\/facsimile|image-only appendix facsimile/i],
  ["attachment_packet", /attachment packet|attached tabs|whole packet|excerpts/i],
  ["declassification_packet", /declassification_packet|declassification packet|release\/declassification|FOIA\/MDR marker/i],
  ["source_register_or_finding_aid", /source_register_or_finding_aid|source-register|finding aid|folder-title list/i],
  ["mixed_or_unclear", /mixed_or_unclear|mixed source packets|unclear_requires_compiler_instruction|whole packet, or excerpts/i]
]);

const missingCoverage = archetypes.filter((archetype) => {
  if (stress.includes(archetype)) return false;
  const hint = coverageHints.get(archetype);
  return !(hint && hint.test(stress));
});

assert(
  missingCoverage.length === 0,
  `missing stress coverage for pdf_archetype values: ${missingCoverage.join(", ")}`
);

assert(
  stress.includes("frus1981-88v01-d272-handwritten-notes-excerpt.pdf") &&
    stress.includes("handwritten_note_or_transcribed_source"),
  "expected official handwritten transcribed-source stress fixture"
);

assert(
  stress.includes("frus1981-88v01-appendix-a-handwritten-notes-excerpt.pdf") &&
    stress.includes("appendix_or_facsimile"),
  "expected official appendix/facsimile image stress fixture"
);

assert(
  stress.includes("frus1981-88v01-appendix-a-handwritten-notes-excerpt.pdf") &&
    stress.includes("archival_photocopy"),
  "expected official archival photocopy/source-image stress fixture"
);

assert(
  stress.includes("reagan-library-ussr-1981-10-29-2.pdf") &&
    stress.includes("digitized_archival_record_pdf") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v03/d98"),
  "expected Reagan Library digitized archival record PDF fixture with FRUS printed counterpart"
);

assert(
  stress.includes("reagan-library-ussr-1981-11-03-11-05.pdf") &&
    stress.includes("digitized_archival_folder_pdf") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v03/d99") &&
    stress.includes("row 170232"),
  "expected Reagan Library whole-folder archival PDF fixture with withdrawal-row matching"
);

assert(
  stress.includes("reagan-phone-calls-1981-01-20-03-30.pdf") &&
    stress.includes("archival_folder_row_page_map") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v01/d21") &&
    stress.includes("row 60719"),
  "expected Reagan Library whole-folder archival PDF fixture with row-to-page matching"
);

assert(
  stress.includes("reagan-bulgarian-kgb-pope-connection.pdf") &&
    stress.includes("related_or_alternate_source_copy_pdf") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v10/d371") &&
    stress.includes("related_context_only"),
  "expected Reagan Library related/alternate source-copy fixture with source-path divergence handling"
);

assert(
  stress.includes("tmp/pdfs/frus-builder-test/nsdd-reference-copy/reagan-nsdd250-reference-copy.pdf") &&
    stress.includes("archival_reference_copy_pdf") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v44p1/d152") &&
    stress.includes("Box SR-094"),
  "expected Reagan Library archival reference-copy fixture with source-path separation handling"
);

assert(
  stress.includes("CIA-RDP05S00620R000300770003-2.pdf") &&
    stress.includes("agency_reading_room_record_metadata") &&
    stress.includes("source_record_completeness_status") &&
    stress.includes("partial_counterpart_scope_note") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1977-80v12/d252") &&
    stress.includes("partial_match"),
  "expected CIA Reading Room partial-counterpart fixture with source-record completeness handling"
);

assert(
  stress.includes("1991-05-27-gorbachev.pdf") &&
    stress.includes("Bush Library/NARA digital-object source-image PDF") &&
    stress.includes("archival_digital_object_metadata") &&
    stress.includes("citation_marker_page_status") &&
    stress.includes("paper_capture_ocr_status") &&
    stress.includes("source_note_control_number_basis") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1989-92v31/d216"),
  "expected Bush Library/NARA digital-object fixture with citation-marker and OCR-confidence handling"
);

assert(
  stress.includes("nsc0058-start-meeting-folder.pdf") &&
    stress.includes("Bush Library/NARA image-only source-folder packet") &&
    stress.includes("source_folder_packet_status") &&
    stress.includes("source_folder_item_inventory") &&
    stress.includes("frus_document_to_source_page_map") &&
    stress.includes("image_only_source_pdf_status") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1989-92v31/d219") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1989-92v31/d220"),
  "expected Bush Library/NARA image-only source-folder packet fixture with shared-folder page-range mapping"
);

assert(
  stress.includes("bush-gorbachev-sensitive-91126-002.pdf") &&
    stress.includes("withdrawn_source_record_counterpart_pdf") &&
    stress.includes("withdrawn_source_record_status") &&
    stress.includes("public_scan_body_absent_status") &&
    stress.includes("selected_source_row_body_status") &&
    stress.includes("printed_transcription_authority") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1989-92v31/d38") &&
    stress.includes("09b. Memcon Re: Memorandum of Conversation (18 pp.) 7/29/89"),
  "expected Bush Library withdrawn selected source-row fixture with body-absent public scan handling"
);

assert(
  stress.includes("reagan-evening-reports-1984-10-11-10-25.pdf") &&
    stress.includes("Reagan Library serial evening-report archival packet") &&
    stress.includes("source_report_series_metadata") &&
    stress.includes("report_item_inventory") &&
    stress.includes("report_item_to_page_map") &&
    stress.includes("selected_report_item_scope") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v41/d225") &&
    stress.includes("S/S 8428407"),
  "expected Reagan Library serial evening-report packet fixture with item-level scope mapping"
);

assert(
  stress.includes("reagan-matlock-chron-december-1986-1of4.pdf") &&
    stress.includes("Reagan Library chronological-file source-record packet") &&
    stress.includes("chronological_file_packet_pdf") &&
    stress.includes("chron_file_packet_metadata") &&
    stress.includes("chron_file_item_inventory") &&
    stress.includes("selected_chron_file_item_status") &&
    stress.includes("selected_item_tab_or_attachment_status") &&
    stress.includes("forwarding_cover_evidence") &&
    stress.includes("source_note_forwarding_cover_quote") &&
    stress.includes("https://history.state.gov/historicaldocuments/frus1981-88v06/d8") &&
    stress.includes("row 8694 Shultz-to-Reagan memorandum dated November 14, 1986"),
  "expected Reagan Library chron-file packet fixture with forwarding-cover and selected-item separation"
);

assert(
  !stress.includes("tmp/pdfs/frus-builder-test/daily-intelligence/frus1977-80v12-d192-pdb-article.pdf"),
  "published FRUS PDB extract must not be counted as a local PDF fixture"
);

assert(
  stress.includes("frus1981-88v06-d182-telephone-conversation-excerpt.pdf") &&
    stress.includes("memcon_or_telcon"),
  "expected official memorandum of telephone conversation stress fixture"
);

assert(
  stress.includes("frus1989-92v31-d247-treaty-transmittal-excerpt.pdf") &&
    stress.includes("treaty_or_transmittal_package"),
  "expected official treaty transmittal package stress fixture"
);

assert(
  stress.includes("frus1981-88v01-d299-tape-transcript-recorded-proceeding-excerpt.pdf") &&
    stress.includes("recorded_proceeding_or_tape_transcript"),
  "expected official recorded proceeding/tape transcript stress fixture"
);

assert(
  stress.includes("frus1981-88v01-sources-section-excerpt.pdf") &&
    stress.includes("source_register_or_finding_aid"),
  "expected official Sources section/finding-aid stress fixture"
);

assert(
  stress.includes("frus1977-80v27.epub#OEBPS/d1.html") &&
    stress.includes("incremental_chapter_placeholder") &&
    stress.includes("not_annotation_sheet_incremental_placeholder"),
  "expected official Carter incremental-publication placeholder stress fixture"
);

assert(
  stress.includes("https://history.state.gov/historicaldocuments/ebooks") &&
    stress.includes("full_volume_or_chapter_packet") &&
    stress.includes("not_annotation_sheet_volume_or_chapter_packet_only"),
  "expected official full-volume/chapter-packet stress fixture"
);

assert(
  stress.includes("https://history.state.gov/historicaldocuments/quarterly-releases") &&
    stress.includes("legacy_digitized_or_microfiche_preview") &&
    stress.includes("not_annotation_sheet_legacy_preview_only"),
  "expected official quarterly-release legacy/microfiche-preview stress fixture"
);

assert(
  stress.includes("frus1981-88v44p1-about-series-declassification-excerpt.pdf") &&
    stress.includes("declassification_packet"),
  "expected official declassification-process context stress fixture"
);

assert(
  stress.includes("frus1989-92v31-d1-printed-attachment-excerpt.pdf") &&
    stress.includes("attachment_packet"),
  "expected official attachment packet stress fixture"
);

assert(
  stress.includes("frus1981-88v41-d145-d147-night-evening-report-excerpt.pdf") &&
    stress.includes("mixed_or_unclear"),
  "expected official mixed-or-unclear multi-document stress fixture"
);

assert(
  stress.includes("frus1981-88v11-d6-nssd3-82-excerpt.pdf") &&
    stress.includes("policy_review_or_study_directive"),
  "expected official National Security Study Directive stress fixture"
);

console.log(
  `FRUS annotation builder archetype coverage test passed: ${archetypes.length} schema archetypes have stress coverage or explicit fallback coverage.`
);
