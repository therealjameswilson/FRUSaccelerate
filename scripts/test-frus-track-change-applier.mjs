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
            `<w:body><w:p><w:r><w:t>FRUS test document.</w:t></w:r></w:p></w:body>` +
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
            `<w:footnote w:id="1"><w:p><w:r><w:t>Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.</w:t></w:r></w:p></w:footnote>` +
            `</w:footnotes>`,
          "utf8"
        )
      }
    ]
  ]);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-track-change-test-"));

try {
  const inputDocx = path.join(tmpDir, "input.docx");
  const outputDocx = path.join(tmpDir, "output.docx");
  writeZip(inputDocx, minimalDocxEntries());

  const result = spawnSync(
    process.execPath,
    [
      "scripts/apply-frus-track-changes.mjs",
      "--docx",
      inputDocx,
      "--units",
      "reports/frus-annotation-checker-extracted-units.sample.json",
      "--checker-output",
      "reports/frus-annotation-checker-direct-edit-sample-output.json",
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
  assert(report.applied_edits.length === 1, "expected one applied direct edit");
  assert(report.applied_edits[0].unit_id === "source-note-0003", "expected source-note-0003 edit");

  const entries = readZip(outputDocx);
  const footnotes = entries.get("word/footnotes.xml").content.toString("utf8");
  assert(footnotes.includes("<w:del "), "expected tracked deletion wrapper");
  assert(footnotes.includes("<w:ins "), "expected tracked insertion wrapper");
  assert(footnotes.includes("<w:delText xml:space=\"preserve\">No classification.</w:delText>"), "expected deleted source text");
  assert(footnotes.includes("<w:t xml:space=\"preserve\">No classification marking.</w:t>"), "expected inserted replacement text");
  assert(footnotes.includes('w:author="FRUS Annotation Checker Test"'), "expected checker author on revisions");

  console.log("FRUS track-change applier test passed: 1 direct edit produced w:del and w:ins markup.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
