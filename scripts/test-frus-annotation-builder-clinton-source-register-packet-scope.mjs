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
const pdfPath = "clinton-2013-0185-source-notes/source-pdfs/2013-0185-M_Part1.pdf";

const agent = readText(agentPath);
const lessons = readText(lessonsPath);
const stress = readText(stressPath);

requirePhrases(agent, [
  "Preserve presidential-library release and finding-aid packet status",
  "Clinton Library Access Management",
  "Treat those uploads as `source_register_or_finding_aid`",
  "do not draft a manuscript annotation sheet",
  "source_register_packet_metadata",
  "source_register_row_inventory",
  "source_register_page_locator",
  "folder_title_source_note_stem",
  "source_register_ocr_status",
  "source_register_packet_basis",
  "source_register_row_basis",
  "folder_title_item_level_basis"
], "agent");

requirePhrases(lessons, [
  "Presidential-library release and finding-aid packets can look source-note ready",
  "Clinton Library Access Management release packets such as 2013-0185-M",
  "source_register_packet_metadata",
  "folder_title_source_note_stem",
  "not_annotation_sheet_source_register_only"
], "recent-published lessons");

requirePhrases(stress, [
  pdfPath,
  "Clinton Library source-register/release/finding-aid packet",
  "Withdrawal/Redaction Sheet",
  "Clinton Presidential Records",
  "2013-0185-M",
  "P3/b(3)",
  "PaperScan Scanner Software Professional Edition 4.0.10",
  "GdPicture.NET",
  "Access Management",
  "Technology Transfers to China Case Documents-Commerce, VA Documents",
  "source_register_packet_metadata",
  "source_register_row_inventory",
  "source_register_page_locator",
  "folder_title_source_note_stem",
  "source_register_ocr_status",
  "source_register_packet_basis",
  "folder_title_item_level_basis",
  "not_annotation_sheet_source_register_only"
], "archetype stress tests");

if (fs.existsSync(pdfPath)) {
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  requirePhrases(pdfInfo, [
    "Author:          PaperScan Scanner Software Professional Edition 4.0.10",
    "Creator:         PaperScan Scanner Software Professional Edition 4.0.10",
    "Producer:        GdPicture.NET",
    "CreationDate:    Thu Apr 30 14:25:20 2026 EDT",
    "Pages:           375"
  ], "2013-0185-M PDF metadata");

  const firstPagesText = execFileSync("pdftotext", ["-layout", "-f", "1", "-l", "5", pdfPath, "-"], { encoding: "utf8" });
  requirePhrases(firstPagesText, [
    "Withdrawal/Redaction Sheet",
    "Clinton Library",
    "001. list",
    "Access Management Folder Title",
    "P3/b(3)",
    "Clinton Presidential Records",
    "National Security Council",
    "2013-0185-M",
    "kh2069",
    "OA/ID",
    "1367A    Poneman Misc.",
    "1789     Technology Transfers to China Case Documents-Commerce, VA Documents",
    "Access Management-Leary, William",
    "Freedom of Information Act",
    "Access Managemeni-Leary, William"
  ], "2013-0185-M first pages text");
}

console.log("FRUS annotation builder Clinton source-register packet scope checks passed.");
