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
  "history_state_web_or_print_export",
  "web_print_export_triage",
  "not_annotation_sheet_web_export_shell_only",
  "fax_or_transmission_cover_sheet",
  "cover_sheet_triage",
  "not_annotation_sheet_cover_sheet_only",
  "press_release_or_background_briefing",
  "press_release_background_briefing_note",
  "digitized_archival_record_pdf",
  "digitized_archival_folder_pdf",
  "archival_digital_object_metadata",
  "digital_object_storage_url",
  "citation_marker_page_status",
  "citation_marker_metadata",
  "paper_capture_ocr_status",
  "text_layer_classification_confidence",
  "source_note_control_number_basis",
  "digital_object_marker_note",
  "source_folder_packet_note",
  "serial_report_packet_note",
  "source_report_series_metadata",
  "report_item_inventory",
  "report_item_to_page_map",
  "selected_report_item_scope",
  "source_folder_packet_status",
  "source_folder_item_inventory",
  "frus_document_to_source_page_map",
  "image_only_source_pdf_status",
  "rendered_page_review_required",
  "selected_document_page_range_basis",
  "source_folder_packet_basis",
  "source_folder_item_inventory_basis",
  "frus_document_to_source_page_map_basis",
  "source_report_series_basis",
  "report_item_scope_basis",
  "report_packet_item_inventory_basis",
  "image_only_pdf_basis",
  "rendered_page_review_basis",
  "digital_object_metadata_basis",
  "citation_marker_basis",
  "text_layer_classification_basis",
  "agency_reading_room_record_metadata",
  "reading_room_pdf_access_status",
  "source_record_completeness_status",
  "partial_counterpart_scope_note",
  "partial_archival_counterpart_note",
  "reading_room_record_metadata_basis",
  "source_record_completeness_basis",
  "attached_paper_basis",
  "archival_reference_copy_pdf",
  "archival_reference_copy_status",
  "reference_copy_source_path_note",
  "reference_copy_authority_basis",
  "archival_folder_row_page_map",
  "folder_row_page_map_basis",
  "related_or_alternate_source_copy_pdf",
  "source_path_divergence_note",
  "alternate_copy_basis",
  "archival_record_reprint_note",
  "archival_folder_selection_note",
  "related_source_copy_note",
  "daily_intelligence_brief_or_pdb_article",
  "daily_intelligence_brief_note",
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
  "history.state.gov web/print-export handling",
  "fax/cover-sheet/routing-slip handling",
  "press-release/background-briefing handling",
  "digitized archival/source-record PDF handling",
  "Bush Library/NARA digital-object citation-marker handling",
  "Bush Library/NARA image-only source-folder packet handling",
  "serial evening-report/daily-report packet handling",
  "agency reading-room partial-counterpart handling",
  "archival reference-copy handling",
  "archival folder withdrawal-sheet selection",
  "archival folder row-to-page mapping",
  "FRUS printed-counterpart matching",
  "daily-intelligence/PDB/NID article handling",
  "history.state.gov corpus lessons"
], "README");

requirePhrases(stress, [
  "Purpose: record PDF archetype tests",
  "Fixture provenance rule",
  "accepted local PDF fixtures should come from digitized archival/source records",
  "history.state.gov",
  "full_volume_or_chapter_packet",
  "not_annotation_sheet_volume_or_chapter_packet_only",
  "frus1977-80v27",
  "incremental_chapter_placeholder",
  "not_annotation_sheet_incremental_placeholder",
  "legacy_digitized_or_microfiche_preview",
  "not_annotation_sheet_legacy_preview_only",
  "history_state_web_or_print_export",
  "not_annotation_sheet_web_export_shell_only",
  "fax_or_transmission_cover_sheet",
  "not_annotation_sheet_cover_sheet_only",
  "press_release_or_background_briefing",
  "frus1981-88v01-d151-background-briefing-excerpt.pdf",
  "digitized_archival_record_pdf",
  "digitized_archival_folder_pdf",
  "reagan-library-ussr-1981-10-29-2.pdf",
  "https://www.reaganlibrary.gov/public/2022-07/40-748-12026383-R21-051-2022.pdf",
  "https://history.state.gov/historicaldocuments/frus1981-88v03/d98",
  "reagan-library-ussr-1981-11-03-11-05.pdf",
  "https://www.reaganlibrary.gov/public/2022-07/40-748-12026383-R21-052-2022.pdf",
  "https://history.state.gov/historicaldocuments/frus1981-88v03/d99",
  "reagan-phone-calls-1981-01-20-03-30.pdf",
  "https://www.reaganlibrary.gov/public/digitallibrary/smof/execssecsubject/box-048/40-753-12026365-048-002-2019.pdf",
  "https://history.state.gov/historicaldocuments/frus1981-88v01/d21",
  "archival_folder_row_page_map",
  "row 60719",
  "archival_reference_copy_pdf",
  "reagan-nsdd250-reference-copy.pdf",
  "nsdd250.pdf",
  "Box SR-094",
  "CIA-RDP05S00620R000300770003-2.pdf",
  "cia-rdp05s00620r000300770003-2",
  "https://history.state.gov/historicaldocuments/frus1977-80v12/d252",
  "partial_counterpart_scope_note",
  "source_record_completeness_status",
  "1991-05-27-gorbachev.pdf",
  "1991-05-27--Gorbachev.pdf",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d216",
  "archival_digital_object_metadata",
  "citation_marker_page_status",
  "paper_capture_ocr_status",
  "source_note_control_number_basis",
  "This is not a textual record",
  "nsc0058-start-meeting-folder.pdf",
  "Bush Library/NARA image-only source-folder packet",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d219",
  "https://history.state.gov/historicaldocuments/frus1989-92v31/d220",
  "source_folder_packet_status",
  "source_folder_item_inventory",
  "frus_document_to_source_page_map",
  "image_only_source_pdf_status",
  "rendered_page_review_required",
  "reagan-evening-reports-1984-10-11-10-25.pdf",
  "https://www.reaganlibrary.gov/public/2024-07/40-747-80694481-R07-008-2024.pdf",
  "https://history.state.gov/historicaldocuments/frus1981-88v41/d225",
  "Reagan Library serial evening-report archival packet",
  "S/S 8428407",
  "ID 158222",
  "items 2-3 as nonselected same-day report items",
  "source_report_series_metadata",
  "report_item_inventory",
  "report_item_to_page_map",
  "selected_report_item_scope",
  "reagan-bulgarian-kgb-pope-connection.pdf",
  "https://www.reaganlibrary.gov/public/2024-08/40-139-39149351-R22-036-2024.pdf",
  "https://history.state.gov/historicaldocuments/frus1981-88v10/d371",
  "related_or_alternate_source_copy_pdf",
  "related_context_only",
  "row 170232",
  "daily_intelligence_brief_or_pdb_article",
  "find a digitized archival PDB/NID source-record scan before counting it as a PDF fixture",
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
  "Official history.state.gov document pages and web exports used for browser-PDF handling",
  "history.state.gov web/print exports require web-artifact treatment",
  "Cover-sheet, routing-slip, and transmission-wrapper evidence used for wrapper handling",
  "Fax sheets, routing slips, and cover sheets require wrapper treatment",
  "Press releases, press guidance, and background briefings require public-release treatment",
  "Digitized archival/source-record PDFs require counterpart-aware treatment",
  "Whole digitized archival folder PDFs require withdrawal-sheet row selection",
  "Multi-item folder PDFs need row-to-page mapping",
  "Digitized archival reference copies need source-path separation",
  "Agency reading-room PDFs can be partial printed counterparts",
  "Public digital-object PDFs can add marker pages and unreliable text layers",
  "Image-only source-folder packets require page-range mapping before drafting",
  "Related archival folders and alternate copies require divergence handling",
  "Serial report packets and item excerpts require item-level scope",
  "Daily intelligence brief articles require article-versus-issue treatment",
  "Archival photocopy and source-image uploads require scan-first treatment",
  "Mixed or unclear multi-document uploads require selection triage"
], "recent-published lessons");

assert(
  !stress.includes("tmp/pdfs/frus-builder-test/daily-intelligence/frus1977-80v12-d192-pdb-article.pdf"),
  "published FRUS PDB extract must not be counted as a local PDF fixture"
);

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
