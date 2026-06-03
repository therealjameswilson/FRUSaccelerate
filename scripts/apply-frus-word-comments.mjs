#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readZip, writeZip } from "./apply-frus-track-changes.mjs";

const COMMENT_ACTION = "comment_only";
const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const COMMENTS_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments";
const COMMENTS_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml";
const BLOCKED_COMMENT_BOUNDARIES = new Set([
  "existing_tracked_revisions",
  "field_code",
  "hyperlink_boundary",
  "content_control_boundary",
  "bookmark_boundary",
  "existing_comment_boundary",
  "note_reference_boundary",
  "production_pseudo_marker",
  "table_cell_boundary"
]);

function usage() {
  console.error(
    "Usage: node scripts/apply-frus-word-comments.mjs --docx <input.docx> --units <extracted-units.json> --checker-output <checker-output.json> --out <output.docx> [--author NAME] [--date ISO-DATE] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let docxPath = null;
  let unitsPath = null;
  let checkerOutputPath = null;
  let outPath = null;
  let author = "FRUS Annotation Checker";
  let date = new Date().toISOString();
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--docx") {
      docxPath = argv[index + 1];
      index += 1;
    } else if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--author") {
      author = argv[index + 1];
      index += 1;
    } else if (arg === "--date") {
      date = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!docxPath || !unitsPath || !checkerOutputPath || !outPath || !new Set(["json", "text"]).has(format)) {
    usage();
  }
  if (path.resolve(docxPath) === path.resolve(outPath)) {
    throw new Error("--out must differ from --docx");
  }

  return { docxPath, unitsPath, checkerOutputPath, outPath, author, date, format };
}

function readJson(file, label) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
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

function escapeXmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXmlAttribute(value) {
  return escapeXmlText(value).replace(/"/g, "&quot;");
}

function countExactMatches(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let cursor = 0;
  while (cursor <= haystack.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) break;
    count += 1;
    cursor = found + needle.length;
  }
  return count;
}

function loadUnits(unitsDocument) {
  if (!isPlainObject(unitsDocument) || unitsDocument.schema_version !== "frus-extracted-units-v1") {
    throw new Error("units: expected frus-extracted-units-v1 object");
  }
  if (!Array.isArray(unitsDocument.units)) throw new Error("units.units: expected array");
  return new Map(unitsDocument.units.map((unit) => [unit.unit_id, unit]));
}

function nextCommentId(entries) {
  let highest = -1;
  const patterns = [
    /<w:comment\b[^>]*w:id="([0-9]+)"/g,
    /<w:commentRangeStart\b[^>]*w:id="([0-9]+)"/g,
    /<w:commentRangeEnd\b[^>]*w:id="([0-9]+)"/g,
    /<w:commentReference\b[^>]*w:id="([0-9]+)"/g
  ];

  for (const entry of entries.values()) {
    if (!entry.name.endsWith(".xml")) continue;
    const xml = entry.content.toString("utf8");
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(xml))) {
        highest = Math.max(highest, Number(match[1]));
      }
    }
  }

  return highest + 1;
}

function ensureCommentsPart(entries) {
  if (!entries.has("word/comments.xml")) {
    entries.set("word/comments.xml", {
      name: "word/comments.xml",
      content: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<w:comments xmlns:w="${WORD_NS}"></w:comments>`,
        "utf8"
      )
    });
  }
  ensureCommentsContentType(entries);
  ensureCommentsRelationship(entries);
}

function ensureCommentsContentType(entries) {
  const entry = entries.get("[Content_Types].xml");
  if (!entry) throw new Error("DOCX package missing [Content_Types].xml");
  let xml = entry.content.toString("utf8");
  if (xml.includes('PartName="/word/comments.xml"')) return;
  const override = `<Override PartName="/word/comments.xml" ContentType="${COMMENTS_CONTENT_TYPE}"/>`;
  if (!xml.includes("</Types>")) throw new Error("[Content_Types].xml: missing closing Types element");
  xml = xml.replace("</Types>", `${override}</Types>`);
  entry.content = Buffer.from(xml, "utf8");
}

function ensureCommentsRelationship(entries) {
  const relsName = "word/_rels/document.xml.rels";
  if (!entries.has(relsName)) {
    entries.set(relsName, {
      name: relsName,
      content: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Relationships xmlns="${RELS_NS}"></Relationships>`,
        "utf8"
      )
    });
  }

  const entry = entries.get(relsName);
  let xml = entry.content.toString("utf8");
  if (xml.includes(COMMENTS_REL_TYPE)) return;

  let highestRid = 0;
  for (const match of xml.matchAll(/\bId="rId([0-9]+)"/g)) {
    highestRid = Math.max(highestRid, Number(match[1]));
  }
  const relationship = `<Relationship Id="rId${highestRid + 1}" Type="${COMMENTS_REL_TYPE}" Target="comments.xml"/>`;
  if (!xml.includes("</Relationships>")) {
    throw new Error(`${relsName}: missing closing Relationships element`);
  }
  xml = xml.replace("</Relationships>", `${relationship}</Relationships>`);
  entry.content = Buffer.from(xml, "utf8");
}

function appendCommentBody(entries, { id, author, date, commentText }) {
  const entry = entries.get("word/comments.xml");
  let xml = entry.content.toString("utf8");
  if (!xml.includes("</w:comments>")) throw new Error("word/comments.xml: missing closing comments element");
  const body =
    `<w:comment w:id="${id}" w:author="${escapeXmlAttribute(author)}" w:date="${escapeXmlAttribute(date)}">` +
    `<w:p><w:r><w:t xml:space="preserve">${escapeXmlText(commentText)}</w:t></w:r></w:p>` +
    `</w:comment>`;
  xml = xml.replace("</w:comments>", `${body}</w:comments>`);
  entry.content = Buffer.from(xml, "utf8");
}

function extractRunProperties(runXml) {
  const match = runXml.match(/<w:rPr\b[\s\S]*?<\/w:rPr>/);
  return match ? match[0] : "";
}

function textRun(text, runProperties) {
  if (text.length === 0) return "";
  return `<w:r>${runProperties}<w:t xml:space="preserve">${escapeXmlText(text)}</w:t></w:r>`;
}

function commentReferenceRun(id) {
  return `<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="${id}"/></w:r>`;
}

function validateCommentCheck(check, unit, targetText, label) {
  if (!unit) throw new Error(`${label}.unit_id: no matching extracted unit ${JSON.stringify(check.unit_id)}`);
  if (unit.comment_safety === "unsafe") throw new Error(`${label}.unit_id: comment anchor is marked unsafe`);
  if (unit.word_part === "word/comments.xml") throw new Error(`${label}.unit_id: cannot nest checker comments inside Word comments`);
  if (typeof check.comment_text !== "string" || check.comment_text.length === 0) {
    throw new Error(`${label}.comment_text: comment_only requires non-empty comment_text`);
  }
  if (typeof unit.exact_text !== "string" || unit.exact_text.length === 0) {
    throw new Error(`${label}.unit_id: target unit has no exact_text`);
  }
  if (!targetText) throw new Error(`${label}.original_text: comment anchor text is empty`);
  const matchCount = countExactMatches(unit.exact_text, targetText);
  if (matchCount !== 1) {
    throw new Error(`${label}.original_text: expected exactly one comment anchor in ${check.unit_id}; found ${matchCount}`);
  }
  const blocked = (unit.blocked_boundaries || []).filter((boundary) => BLOCKED_COMMENT_BOUNDARIES.has(boundary));
  if (blocked.length > 0) {
    throw new Error(`${label}.unit_id: comment anchor blocked by ${blocked.join(", ")}`);
  }
}

function replaceRunWithCommentMarkup({ runXml, targetText, commentId }) {
  const textMatches = [...runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)];
  if (textMatches.length !== 1) {
    throw new Error("target comment run must contain exactly one w:t text node");
  }

  const originalRunText = decodeXmlText(textMatches[0][1]);
  const position = originalRunText.indexOf(targetText);
  if (position === -1) throw new Error("target comment run no longer contains anchor text");

  const before = originalRunText.slice(0, position);
  const after = originalRunText.slice(position + targetText.length);
  const runProperties = extractRunProperties(runXml);

  return [
    textRun(before, runProperties),
    `<w:commentRangeStart w:id="${commentId}"/>`,
    textRun(targetText, runProperties),
    `<w:commentRangeEnd w:id="${commentId}"/>`,
    commentReferenceRun(commentId),
    textRun(after, runProperties)
  ].join("");
}

function applyCommentAnchorToXml(xml, check, targetText, commentId) {
  const runPattern = /<w:r\b[\s\S]*?<\/w:r>/g;
  const candidates = [];
  let match;

  while ((match = runPattern.exec(xml))) {
    const runXml = match[0];
    const textMatches = [...runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)];
    if (textMatches.length !== 1) continue;
    const text = decodeXmlText(textMatches[0][1]);
    const count = countExactMatches(text, targetText);
    if (count > 0) {
      candidates.push({ start: match.index, end: match.index + runXml.length, runXml, count });
    }
  }

  const candidateCount = candidates.reduce((sum, candidate) => sum + candidate.count, 0);
  if (candidateCount !== 1 || candidates.length !== 1) {
    throw new Error(
      `${check.unit_id}: expected one editable single-run comment anchor for ${JSON.stringify(targetText)}; found ${candidateCount}`
    );
  }

  const candidate = candidates[0];
  const replacement = replaceRunWithCommentMarkup({ runXml: candidate.runXml, targetText, commentId });
  return `${xml.slice(0, candidate.start)}${replacement}${xml.slice(candidate.end)}`;
}

function commentTargetText(check, unit) {
  return check.original_text ? check.original_text : unit.exact_text;
}

function applyCommentsToEntries({ entries, unitsDocument, checkerOutput, author, date }) {
  if (!isPlainObject(checkerOutput) || checkerOutput.schema_version !== "checker-output-v1") {
    throw new Error("checker output: expected checker-output-v1 object");
  }
  if (!Array.isArray(checkerOutput.checks)) throw new Error("checker output checks: expected array");

  const units = loadUnits(unitsDocument);
  const commentChecks = checkerOutput.checks.filter((check) => check.recommended_action === COMMENT_ACTION);
  if (commentChecks.length === 0) {
    return {
      schema_version: "frus-word-comment-application-report-v1",
      applied_comments: [],
      skipped_checks: checkerOutput.checks.length,
      skipped_global_comments: Array.isArray(checkerOutput.global_comments) ? checkerOutput.global_comments.length : 0,
      status: "pass"
    };
  }

  ensureCommentsPart(entries);
  let nextId = nextCommentId(entries);
  const applied_comments = [];

  for (const [index, check] of commentChecks.entries()) {
    const label = `checks[${index}]`;
    const unit = units.get(check.unit_id);
    const targetText = commentTargetText(check, unit || {});
    validateCommentCheck(check, unit, targetText, label);
    const entry = entries.get(unit.word_part);
    if (!entry) throw new Error(`${check.unit_id}: Word part ${unit.word_part} not found in DOCX package`);

    const commentId = nextId++;
    const xml = entry.content.toString("utf8");
    const updatedXml = applyCommentAnchorToXml(xml, check, targetText, commentId);
    entry.content = Buffer.from(updatedXml, "utf8");
    appendCommentBody(entries, { id: commentId, author, date, commentText: check.comment_text });
    applied_comments.push({
      unit_id: check.unit_id,
      word_part: unit.word_part,
      comment_id: commentId,
      anchor_text: targetText
    });
  }

  return {
    schema_version: "frus-word-comment-application-report-v1",
    applied_comments,
    skipped_checks: checkerOutput.checks.length - commentChecks.length,
    skipped_global_comments: Array.isArray(checkerOutput.global_comments) ? checkerOutput.global_comments.length : 0,
    status: "pass"
  };
}

function renderText(report, outPath) {
  return `FRUS Word comment application passed: ${report.applied_comments.length} comments applied, ${report.skipped_checks} checks skipped, ${report.skipped_global_comments} global comments left for audit, output ${outPath}.\n`;
}

function runCli() {
  const { docxPath, unitsPath, checkerOutputPath, outPath, author, date, format } = parseArgs(process.argv);
  const entries = readZip(docxPath);
  const unitsDocument = readJson(unitsPath, unitsPath);
  const checkerOutput = readJson(checkerOutputPath, checkerOutputPath);
  const report = applyCommentsToEntries({ entries, unitsDocument, checkerOutput, author, date });
  writeZip(outPath, entries);

  if (format === "json") {
    console.log(JSON.stringify({ ...report, output_docx: outPath }, null, 2));
  } else {
    process.stdout.write(renderText(report, outPath));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export { applyCommentsToEntries };
