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
            `<w:body><w:p><w:r><w:t>FRUS output validation fixture.</w:t></w:r></w:p></w:body>` +
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
            `<w:footnote w:id="3"><w:p><w:r><w:t>Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.</w:t></w:r></w:p></w:footnote>` +
            `</w:footnotes>`,
          "utf8"
        )
      }
    ]
  ]);
}

function runNode(args, cwd) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
  return result;
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-docx-output-validator-test-"));

try {
  const inputDocx = path.join(tmpDir, "input.docx");
  const commentedDocx = path.join(tmpDir, "commented.docx");
  const finalDocx = path.join(tmpDir, "final.docx");
  const brokenDocx = path.join(tmpDir, "broken.docx");
  const author = "FRUS Annotation Checker Test";
  const date = "2026-06-03T00:00:00.000Z";
  writeZip(inputDocx, minimalDocxEntries());

  runNode(
    [
      "scripts/apply-frus-word-comments.mjs",
      "--docx",
      inputDocx,
      "--units",
      "reports/frus-annotation-checker-extracted-units.sample.json",
      "--checker-output",
      "reports/frus-annotation-checker-sample-output.json",
      "--out",
      commentedDocx,
      "--author",
      author,
      "--date",
      date
    ],
    process.cwd()
  );

  runNode(
    [
      "scripts/apply-frus-track-changes.mjs",
      "--docx",
      commentedDocx,
      "--units",
      "reports/frus-annotation-checker-extracted-units.sample.json",
      "--checker-output",
      "reports/frus-annotation-checker-direct-edit-sample-output.json",
      "--out",
      finalDocx,
      "--author",
      author,
      "--date",
      date
    ],
    process.cwd()
  );

  const passResult = runNode(
    [
      "scripts/validate-frus-docx-output.mjs",
      "--docx",
      finalDocx,
      "--author",
      author,
      "--expect-comments",
      "1",
      "--expect-insertions",
      "1",
      "--expect-deletions",
      "1",
      "--format",
      "json"
    ],
    process.cwd()
  );
  const report = JSON.parse(passResult.stdout);
  assert(report.status === "pass", "expected output validation to pass");
  assert(report.generated.comments === 1, "expected one generated comment");
  assert(report.generated.insertions === 1, "expected one generated insertion");
  assert(report.generated.deletions === 1, "expected one generated deletion");

  const brokenEntries = readZip(finalDocx);
  const footnotes = brokenEntries.get("word/footnotes.xml").content.toString("utf8");
  brokenEntries.get("word/footnotes.xml").content = Buffer.from(
    footnotes.replace(/<w:commentRangeEnd\b[^>]*\/>/, ""),
    "utf8"
  );
  writeZip(brokenDocx, brokenEntries);

  const failResult = spawnSync(
    process.execPath,
    [
      "scripts/validate-frus-docx-output.mjs",
      "--docx",
      brokenDocx,
      "--author",
      author,
      "--expect-comments",
      "1",
      "--expect-insertions",
      "1",
      "--expect-deletions",
      "1"
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  );
  if (failResult.status === 0 || !failResult.stderr.includes("range start/end count mismatch")) {
    process.stderr.write(failResult.stdout);
    process.stderr.write(failResult.stderr);
    process.exit(1);
  }

  console.log("FRUS DOCX output validator test passed: generated comments/revisions validate and dangling comment anchors fail.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
