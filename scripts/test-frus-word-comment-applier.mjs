#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readZip, writeZip } from "./apply-frus-track-changes.mjs";

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
            `<w:body><w:p><w:r><w:t>FRUS annotation checker comment test.</w:t></w:r></w:p></w:body>` +
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
            `<w:footnote w:id="1"><w:p><w:r><w:t>Source: https://example.invalid/catalog-record. The document was attached to a memorandum for the record.</w:t></w:r></w:p></w:footnote>` +
            `</w:footnotes>`,
          "utf8"
        )
      }
    ]
  ]);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-word-comment-test-"));

try {
  const inputDocx = path.join(tmpDir, "input.docx");
  const outputDocx = path.join(tmpDir, "output.docx");
  writeZip(inputDocx, minimalDocxEntries());

  const result = spawnSync(
    process.execPath,
    [
      "scripts/apply-frus-word-comments.mjs",
      "--docx",
      inputDocx,
      "--units",
      "reports/frus-annotation-checker-extracted-units.sample.json",
      "--checker-output",
      "reports/frus-annotation-checker-sample-output.json",
      "--out",
      outputDocx,
      "--author",
      "FRUS Annotation Checker Test",
      "--date",
      "2026-06-03T00:00:00.000Z",
      "--format",
      "json"
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  );

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }

  const report = JSON.parse(result.stdout);
  assert(report.applied_comments.length === 1, "expected one applied Word comment");
  assert(report.applied_comments[0].unit_id === "source-note-0001", "expected source-note-0001 comment");
  assert(report.skipped_global_comments === 1, "expected global comment to remain audit-only");

  const entries = readZip(outputDocx);
  const contentTypes = entries.get("[Content_Types].xml").content.toString("utf8");
  const rels = entries.get("word/_rels/document.xml.rels").content.toString("utf8");
  const comments = entries.get("word/comments.xml").content.toString("utf8");
  const footnotes = entries.get("word/footnotes.xml").content.toString("utf8");

  assert(contentTypes.includes('PartName="/word/comments.xml"'), "expected comments content type override");
  assert(rels.includes("relationships/comments"), "expected comments relationship");
  assert(comments.includes('w:author="FRUS Annotation Checker Test"'), "expected checker comment author");
  assert(comments.includes("Replace the URL-only locator"), "expected checker comment text");
  assert(footnotes.includes("<w:commentRangeStart "), "expected comment range start");
  assert(footnotes.includes("<w:commentRangeEnd "), "expected comment range end");
  assert(footnotes.includes("<w:commentReference "), "expected comment reference");
  assert(footnotes.includes("Source: https://example.invalid/catalog-record."), "expected original anchor text preserved");

  console.log("FRUS Word comment applier test passed: 1 comment created with body, relationship, content type, and anchor.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
