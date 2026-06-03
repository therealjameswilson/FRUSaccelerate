#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readZip } from "./apply-frus-track-changes.mjs";

const COMMENTS_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments";
const COMMENTS_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml";

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-docx-output.mjs --docx <output.docx> [--author NAME] [--expect-comments N] [--expect-insertions N] [--expect-deletions N] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let docxPath = null;
  let author = "FRUS Annotation Checker";
  let expectComments = null;
  let expectInsertions = null;
  let expectDeletions = null;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--docx") {
      docxPath = argv[index + 1];
      index += 1;
    } else if (arg === "--author") {
      author = argv[index + 1];
      index += 1;
    } else if (arg === "--expect-comments") {
      expectComments = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--expect-insertions") {
      expectInsertions = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--expect-deletions") {
      expectDeletions = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!docxPath || !new Set(["json", "text"]).has(format)) usage();
  for (const [label, value] of [
    ["--expect-comments", expectComments],
    ["--expect-insertions", expectInsertions],
    ["--expect-deletions", expectDeletions]
  ]) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      throw new Error(`${label}: expected a non-negative integer`);
    }
  }

  return { docxPath, author, expectComments, expectInsertions, expectDeletions, format };
}

function decodeXmlText(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)));
}

function xmlAttribute(xml, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`\\b${escaped}="([^"]*)"`));
  return match ? decodeXmlText(match[1]) : "";
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function xmlTagName(tag) {
  return tag
    .replace(/^<\//, "")
    .replace(/^</, "")
    .replace(/\/>$/, "")
    .replace(/>$/, "")
    .trim()
    .split(/\s+/)[0];
}

function checkWellFormedXml(xml, label, problems) {
  const stack = [];
  const tagPattern = /<[^>]+>/g;
  let match;

  while ((match = tagPattern.exec(xml))) {
    const tag = match[0];
    if (tag.startsWith("<?") || tag.startsWith("<!--") || tag.startsWith("<!")) continue;
    if (tag.startsWith("</")) {
      const name = xmlTagName(tag);
      const open = stack.pop();
      if (open !== name) {
        problems.push(`${label}: XML tag mismatch, expected closing ${open || "<none>"} but found ${name}`);
        return;
      }
    } else if (!tag.endsWith("/>")) {
      stack.push(xmlTagName(tag));
    }
  }

  if (stack.length > 0) {
    problems.push(`${label}: XML has unclosed tag ${stack[stack.length - 1]}`);
  }
}

function xmlEntries(entries) {
  return [...entries.values()].filter((entry) => entry.name.endsWith(".xml"));
}

function wordStoryEntries(entries) {
  return [...entries.values()].filter(
    (entry) => entry.name.startsWith("word/") && entry.name.endsWith(".xml") && entry.name !== "word/comments.xml"
  );
}

function collectElementChunks(entries, tagName) {
  const chunks = [];
  const pattern = new RegExp(`<w:${tagName}\\b[\\s\\S]*?<\\/w:${tagName}>`, "g");

  for (const entry of entries) {
    const xml = entry.content.toString("utf8");
    let match;
    while ((match = pattern.exec(xml))) {
      chunks.push({ part: entry.name, xml: match[0] });
    }
  }

  return chunks;
}

function validatePackage(entries, problems) {
  for (const required of ["[Content_Types].xml", "_rels/.rels", "word/document.xml"]) {
    if (!entries.has(required)) {
      problems.push(`package: missing ${required}`);
    }
  }

  for (const entry of xmlEntries(entries)) {
    checkWellFormedXml(entry.content.toString("utf8"), entry.name, problems);
  }
}

function validateGeneratedRevisions(entries, author, problems) {
  const generatedRevisionIds = new Set();
  const duplicateRevisionIds = new Set();
  const insertions = [];
  const deletions = [];
  const storyEntries = wordStoryEntries(entries);

  for (const item of collectElementChunks(storyEntries, "ins")) {
    if (xmlAttribute(item.xml, "w:author") !== author) continue;
    insertions.push(item);
    const id = xmlAttribute(item.xml, "w:id");
    const date = xmlAttribute(item.xml, "w:date");
    if (!id) problems.push(`${item.part}: generated w:ins missing w:id`);
    if (!date) problems.push(`${item.part}: generated w:ins ${id || "<missing-id>"} missing w:date`);
    if (!/<w:t\b/.test(item.xml)) problems.push(`${item.part}: generated w:ins ${id || "<missing-id>"} missing w:t text`);
    if (id && generatedRevisionIds.has(id)) duplicateRevisionIds.add(id);
    if (id) generatedRevisionIds.add(id);
  }

  for (const item of collectElementChunks(storyEntries, "del")) {
    if (xmlAttribute(item.xml, "w:author") !== author) continue;
    deletions.push(item);
    const id = xmlAttribute(item.xml, "w:id");
    const date = xmlAttribute(item.xml, "w:date");
    if (!id) problems.push(`${item.part}: generated w:del missing w:id`);
    if (!date) problems.push(`${item.part}: generated w:del ${id || "<missing-id>"} missing w:date`);
    if (!/<w:delText\b/.test(item.xml)) {
      problems.push(`${item.part}: generated w:del ${id || "<missing-id>"} missing w:delText deleted text`);
    }
    if (id && generatedRevisionIds.has(id)) duplicateRevisionIds.add(id);
    if (id) generatedRevisionIds.add(id);
  }

  for (const id of duplicateRevisionIds) {
    problems.push(`generated revision id ${id}: reused across checker revisions`);
  }

  return { insertions: insertions.length, deletions: deletions.length };
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function validateComments(entries, author, problems) {
  const commentBodyIds = new Set();
  const generatedCommentIds = new Set();
  const rangeStarts = new Map();
  const rangeEnds = new Map();
  const references = new Map();

  const commentsEntry = entries.get("word/comments.xml");
  const contentTypesEntry = entries.get("[Content_Types].xml");
  const documentRelsEntry = entries.get("word/_rels/document.xml.rels");

  if (commentsEntry) {
    const commentsXml = commentsEntry.content.toString("utf8");
    if (/<w:(?:commentRangeStart|commentRangeEnd|commentReference)\b/.test(commentsXml)) {
      problems.push("word/comments.xml: comment range markers must not appear inside comment bodies");
    }

    if (!contentTypesEntry || !contentTypesEntry.content.toString("utf8").includes(`ContentType="${COMMENTS_CONTENT_TYPE}"`)) {
      problems.push("package: word/comments.xml is present but [Content_Types].xml lacks the comments override");
    }
    if (!documentRelsEntry || !documentRelsEntry.content.toString("utf8").includes(COMMENTS_REL_TYPE)) {
      problems.push("package: word/comments.xml is present but word/_rels/document.xml.rels lacks the comments relationship");
    }

    const commentPattern = /<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g;
    let match;
    while ((match = commentPattern.exec(commentsXml))) {
      const attrs = match[1];
      const body = match[2];
      const id = xmlAttribute(attrs, "w:id");
      const itemAuthor = xmlAttribute(attrs, "w:author");
      const date = xmlAttribute(attrs, "w:date");
      if (!id) problems.push("word/comments.xml: comment missing w:id");
      if (id && commentBodyIds.has(id)) problems.push(`word/comments.xml: duplicate comment body id ${id}`);
      if (id) commentBodyIds.add(id);
      if (itemAuthor === author) {
        if (!date) problems.push(`word/comments.xml: generated comment ${id || "<missing-id>"} missing w:date`);
        if (!/<w:t\b[^>]*>[\s\S]*?\S[\s\S]*?<\/w:t>/.test(body)) {
          problems.push(`word/comments.xml: generated comment ${id || "<missing-id>"} has no non-empty text`);
        }
        if (id) generatedCommentIds.add(id);
      }
    }
  }

  for (const entry of wordStoryEntries(entries)) {
    const xml = entry.content.toString("utf8");
    for (const match of xml.matchAll(/<w:commentRangeStart\b[^>]*w:id="([0-9]+)"[^>]*\/>/g)) {
      increment(rangeStarts, match[1]);
    }
    for (const match of xml.matchAll(/<w:commentRangeEnd\b[^>]*w:id="([0-9]+)"[^>]*\/>/g)) {
      increment(rangeEnds, match[1]);
    }
    for (const match of xml.matchAll(/<w:commentReference\b[^>]*w:id="([0-9]+)"[^>]*\/>/g)) {
      increment(references, match[1]);
    }
  }

  for (const id of new Set([...rangeStarts.keys(), ...rangeEnds.keys(), ...references.keys()])) {
    if (!commentBodyIds.has(id)) problems.push(`comment ${id}: story anchor/reference has no comment body`);
    const starts = rangeStarts.get(id) || 0;
    const ends = rangeEnds.get(id) || 0;
    const refs = references.get(id) || 0;
    if (starts !== ends) problems.push(`comment ${id}: range start/end count mismatch (${starts}/${ends})`);
    if (starts > 0 && refs === 0) problems.push(`comment ${id}: range anchor has no commentReference`);
    if (ends > 0 && refs === 0) problems.push(`comment ${id}: range end has no commentReference`);
  }

  for (const id of generatedCommentIds) {
    if ((rangeStarts.get(id) || 0) === 0) problems.push(`generated comment ${id}: missing commentRangeStart`);
    if ((rangeEnds.get(id) || 0) === 0) problems.push(`generated comment ${id}: missing commentRangeEnd`);
    if ((references.get(id) || 0) === 0) problems.push(`generated comment ${id}: missing commentReference`);
  }

  return {
    comments: generatedCommentIds.size,
    comment_bodies: commentBodyIds.size,
    comment_references: [...references.values()].reduce((sum, value) => sum + value, 0)
  };
}

function compareExpected(label, actual, expected, problems) {
  if (expected !== null && actual !== expected) {
    problems.push(`${label}: expected ${expected}, found ${actual}`);
  }
}

function validateDocxOutput({ docxPath, author, expectComments, expectInsertions, expectDeletions }) {
  const entries = readZip(docxPath);
  const problems = [];
  validatePackage(entries, problems);
  const revisions = validateGeneratedRevisions(entries, author, problems);
  const comments = validateComments(entries, author, problems);

  compareExpected("generated comments", comments.comments, expectComments, problems);
  compareExpected("generated insertions", revisions.insertions, expectInsertions, problems);
  compareExpected("generated deletions", revisions.deletions, expectDeletions, problems);

  return {
    schema_version: "frus-docx-output-validation-v1",
    docx: normalizePathForOutput(docxPath),
    author,
    xml_files_checked: xmlEntries(entries).length,
    generated: {
      comments: comments.comments,
      comment_bodies: comments.comment_bodies,
      comment_references: comments.comment_references,
      insertions: revisions.insertions,
      deletions: revisions.deletions
    },
    status: problems.length === 0 ? "pass" : "fail",
    problems
  };
}

function renderText(result) {
  if (result.status === "pass") {
    return `FRUS DOCX output validation passed: ${result.generated.comments} generated comments, ${result.generated.insertions} insertions, ${result.generated.deletions} deletions, ${result.xml_files_checked} XML files checked.\n`;
  }

  const lines = [`FRUS DOCX output validation failed: ${result.problems.length} problem${result.problems.length === 1 ? "" : "s"}.`];
  for (const problem of result.problems) lines.push(`- ${problem}`);
  return `${lines.join("\n")}\n`;
}

function runCli() {
  const options = parseArgs(process.argv);
  const result = validateDocxOutput(options);
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "pass") {
    process.stdout.write(renderText(result));
  } else {
    process.stderr.write(renderText(result));
  }
  process.exit(result.status === "pass" ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export { validateDocxOutput };
