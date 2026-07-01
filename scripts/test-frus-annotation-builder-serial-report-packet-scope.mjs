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
const pdfPath =
  "tmp/pdfs/frus-builder-test/evening-report-packet/reagan-evening-reports-1984-10-11-10-25.pdf";
const archivalPdfUrl =
  "https://www.reaganlibrary.gov/public/2024-07/40-747-80694481-R07-008-2024.pdf";
const frusCounterpartUrl =
  "https://history.state.gov/historicaldocuments/frus1981-88v41/d225";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "Preserve serial report packet and item-excerpt status",
  "source_report_series_metadata",
  "report_item_inventory",
  "report_item_to_page_map",
  "selected_report_item_scope",
  "serial_report_packet_note",
  "source_report_series_basis",
  "report_item_scope_basis",
  "report_packet_item_inventory_basis",
  "source_path_divergence_basis",
  "Do not import other numbered items",
  "do not replace the printed Source note with the packet cover collection"
], "canonical agent");

requirePhrases(lessons, [
  "Serial report packets and item excerpts require item-level scope",
  "Reagan Library source-record PDFs can expose a whole folder of recurring evening reports",
  "source_report_series_metadata",
  "report_item_inventory",
  "report_item_to_page_map",
  "selected_report_item_scope",
  "do not import adjacent report dates, other numbered items in the same report, folder-level metadata, or alternate source-copy paths"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  archivalPdfUrl,
  frusCounterpartUrl,
  "Reagan Library serial evening-report archival packet",
  "FRUS 1981-1988, vol. XLI, Document 225",
  "cover collection `Executive Secretariat, NSC: Agency File`",
  "Secretary of State's Evening Reports (10/01/1984-11/20/1984)",
  "RAC Box 7",
  "ID 158222",
  "S/S 8428407",
  "Kenneth W. Dam",
  "Sub-Saharan Food Crisis",
  "items 2-3 as nonselected same-day report items",
  "source-copy divergence",
  "AF Famine: [10/11/84-10/25/84]"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Creator:         HP LJ Pro M428fM429f TWAIN",
    "Producer:        Adobe Acrobat Pro (64-bit) 24 Paper Capture Plug-in",
    "Pages:           47",
    "PDF version:     1.7"
  ], "serial evening-report packet PDF metadata");

  const coverAndWithdrawalText = execFileSync(
    "pdftotext",
    ["-layout", "-f", "1", "-l", "4", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(coverAndWithdrawalText, [
    "This is a PDF of a folder from our textual collections.",
    "Collection: Executive Secretariat, NSC:",
    "Agency File",
    "Secretary of State",
    "Evening Reports",
    "(10/01/1984-11/20/1984)",
    "RAC Box 7",
    "158222",
    "DAM TO RR",
    "10/12/1984"
  ], "serial evening-report packet cover and withdrawal text");

  const selectedReportPageText = execFileSync(
    "pdftotext",
    ["-layout", "-f", "15", "-l", "15", pdfPath, "-"],
    { encoding: "utf8" }
  );
  requirePhrases(selectedReportPageText, [
    "S/S 8428407",
    "October 12, 1984",
    "Kenneth W. Dam",
    "Sub-Saharan Food Crisis",
    "The Philippines:",
    "Under Secretary Armacost Meeting with Nicaraguan"
  ], "October 12, 1984 evening-report page text");

  assert(
    selectedReportPageText.includes("Sub-Saharan Food Crisis") &&
      selectedReportPageText.includes("The Philippines:") &&
      selectedReportPageText.includes("Under Secretary Armacost"),
    "expected the October 12 report page to prove one selected item plus nonselected same-day items"
  );
} else {
  console.warn(`Optional local PDF fixture not found, skipped binary checks: ${pdfPath}`);
}

console.log("FRUS annotation builder serial report packet scope checks passed.");
