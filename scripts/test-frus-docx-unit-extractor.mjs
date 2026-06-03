#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeZip } from "./apply-frus-track-changes.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function minimalDocxEntries() {
  return new Map([
    [
      "[Content_Types].xml",
      {
        name: "[Content_Types].xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
            `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
            `<Default Extension="xml" ContentType="application/xml"/>` +
            `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
            `<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>` +
            `<Override PartName="/word/endnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml"/>` +
            `<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>` +
            `</Types>`,
          "utf8"
        )
      }
    ],
    [
      "_rels/.rels",
      {
        name: "_rels/.rels",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
            `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
            `</Relationships>`,
          "utf8"
        )
      }
    ],
    [
      "word/document.xml",
      {
        name: "word/document.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:body>` +
            `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>1. Memorandum From the President</w:t></w:r></w:p>` +
            `<w:p><w:r><w:t>The President approved the recommendation</w:t></w:r><w:r><w:footnoteReference w:id="1"/></w:r></w:p>` +
            `<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Source list row, Reagan Library, NSC Files.</w:t></w:r></w:p></w:tc></w:tr></w:tbl>` +
            `</w:body>` +
            `</w:document>`,
          "utf8"
        )
      }
    ],
    [
      "word/footnotes.xml",
      {
        name: "word/footnotes.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:footnote w:id="-1"><w:p><w:r><w:t>separator</w:t></w:r></w:p></w:footnote>` +
            `<w:footnote w:id="1"><w:p><w:r><w:t>Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.</w:t></w:r></w:p></w:footnote>` +
            `<w:footnote w:id="2"><w:p><w:ins w:id="7" w:author="Compiler" w:date="2026-06-03T00:00:00Z"><w:r><w:t>Existing revision in an annotation note.</w:t></w:r></w:ins></w:p></w:footnote>` +
            `</w:footnotes>`,
          "utf8"
        )
      }
    ],
    [
      "word/endnotes.xml",
      {
        name: "word/endnotes.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:endnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:endnote w:id="1"><w:p><w:r><w:t>Editorial Note. This endnote explains a cross-reference.</w:t></w:r></w:p></w:endnote>` +
            `</w:endnotes>`,
          "utf8"
        )
      }
    ],
    [
      "word/comments.xml",
      {
        name: "word/comments.xml",
        content: Buffer.from(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
            `<w:comment w:id="0" w:author="Compiler"><w:p><w:r><w:t>Need source image for the classification marking.</w:t></w:r></w:p></w:comment>` +
            `</w:comments>`,
          "utf8"
        )
      }
    ]
  ]);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-docx-extractor-test-"));

try {
  const inputDocx = path.join(tmpDir, "annotation-sheet.docx");
  const outputJson = path.join(tmpDir, "extracted-units.json");
  writeZip(inputDocx, minimalDocxEntries());

  const result = spawnSync(
    process.execPath,
    [
      "scripts/extract-frus-docx-units.mjs",
      "--docx",
      inputDocx,
      "--out",
      outputJson,
      "--format",
      "text"
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  );

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }

  const extracted = JSON.parse(fs.readFileSync(outputJson, "utf8"));
  assert(extracted.schema_version === "frus-extracted-units-v1", "expected extracted-units schema");
  assert(extracted.summary.total_units === 7, `expected seven extracted units, got ${extracted.summary.total_units}`);
  assert(extracted.summary.word_parts_scanned.includes("word/comments.xml"), "expected comments part to be scanned");

  const heading = extracted.units.find((unit) => unit.unit_type === "document_heading");
  assert(heading, "expected document heading unit");
  assert(heading.surrounding_text === "", "expected first heading to start without prior surrounding text");

  const sourceNote = extracted.units.find((unit) => unit.unit_type === "source_note");
  assert(sourceNote, "expected a source-note unit");
  assert(sourceNote.exact_text.includes("No classification."), "expected exact source-note text");
  assert(sourceNote.editability === "editable", "expected clean source note to be editable");
  assert(sourceNote.edit_safety === "safe_to_edit", "expected clean source note to be safe to edit");

  const bodyText = extracted.units.find((unit) => unit.unit_type === "transcribed_document_text");
  assert(bodyText, "expected body text unit");
  assert(bodyText.display_text.includes("[footnote 1]"), "expected footnote reference in display text");
  assert(!bodyText.exact_text.includes("[footnote 1]"), "expected exact text to omit synthetic footnote label");
  assert(bodyText.blocked_boundaries.includes("note_reference_boundary"), "expected note-reference boundary block");

  const tableUnit = extracted.units.find((unit) => unit.blocked_boundaries.includes("table_cell_boundary"));
  assert(tableUnit, "expected table cell unit to be marked with table boundary");

  const revisedUnit = extracted.units.find((unit) => unit.existing_revisions === true);
  assert(revisedUnit, "expected unit with existing revisions");
  assert(revisedUnit.blocked_boundaries.includes("existing_tracked_revisions"), "expected revision boundary block");

  const commentUnit = extracted.units.find((unit) => unit.word_part === "word/comments.xml");
  assert(commentUnit, "expected existing Word comment unit");
  assert(commentUnit.comment_safety === "unsafe", "expected existing comment unit to be unsafe for nested comments");

  console.log("FRUS DOCX unit extractor test passed: heading, body, table, footnote, endnote, comment, and revision units extracted.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
