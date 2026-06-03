#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import zlib from "node:zlib";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const ZIP_LOCAL_FILE = 0x04034b50;
const ZIP_CENTRAL_FILE = 0x02014b50;
const ZIP_END = 0x06054b50;
const ZIP_METHOD_STORE = 0;
const ZIP_METHOD_DEFLATE = 8;

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < CRC_TABLE.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[index] = value >>> 0;
}

function usage() {
  console.error(
    "Usage: node scripts/apply-frus-track-changes.mjs --docx <input.docx> --units <extracted-units.json> --checker-output <checker-output.json> --out <output.docx> [--author NAME] [--date ISO-DATE] [--format json|text]"
  );
  process.exit(2);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
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

function readZip(file) {
  const buffer = fs.readFileSync(file);
  const searchStart = Math.max(0, buffer.length - 0xffff - 22);
  let eocdOffset = -1;
  for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) === ZIP_END) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error(`${file}: ZIP end-of-central-directory record not found`);

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(cursor) !== ZIP_CENTRAL_FILE) {
      throw new Error(`${file}: invalid ZIP central directory entry ${index}`);
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const modTime = buffer.readUInt16LE(cursor + 12);
    const modDate = buffer.readUInt16LE(cursor + 14);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");

    if (buffer.readUInt32LE(localOffset) !== ZIP_LOCAL_FILE) {
      throw new Error(`${file}: invalid local ZIP header for ${name}`);
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    let content;
    if (method === ZIP_METHOD_STORE) {
      content = Buffer.from(compressed);
    } else if (method === ZIP_METHOD_DEFLATE) {
      content = zlib.inflateRawSync(compressed);
    } else {
      throw new Error(`${file}: unsupported ZIP compression method ${method} for ${name}`);
    }
    if (content.length !== uncompressedSize) {
      throw new Error(`${file}: invalid uncompressed size for ${name}`);
    }
    entries.set(name, { name, content, modTime, modDate });
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function writeZip(file, entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const normalizedEntries = [...entries.values ? entries.values() : entries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of normalizedEntries) {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    const compressed = zlib.deflateRawSync(content, { level: 6 });
    const crc = crc32(content);
    const modTime = entry.modTime || 0;
    const modDate = entry.modDate || 0;

    const local = Buffer.alloc(30 + nameBuffer.length);
    local.writeUInt32LE(ZIP_LOCAL_FILE, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(ZIP_METHOD_DEFLATE, 8);
    local.writeUInt16LE(modTime, 10);
    local.writeUInt16LE(modDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuffer.copy(local, 30);
    localParts.push(local, compressed);

    const central = Buffer.alloc(46 + nameBuffer.length);
    central.writeUInt32LE(ZIP_CENTRAL_FILE, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(ZIP_METHOD_DEFLATE, 10);
    central.writeUInt16LE(modTime, 12);
    central.writeUInt16LE(modDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuffer.copy(central, 46);
    centralParts.push(central);

    offset += local.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(ZIP_END, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(normalizedEntries.length, 8);
  end.writeUInt16LE(normalizedEntries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  fs.writeFileSync(file, Buffer.concat([...localParts, centralDirectory, end]));
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

function validateDirectCheck(check, unit, label) {
  if (!unit) throw new Error(`${label}.unit_id: no matching extracted unit ${JSON.stringify(check.unit_id)}`);
  if (unit.editability !== "editable") throw new Error(`${label}.unit_id: direct edit requires editability editable`);
  if (unit.edit_safety !== "safe_to_edit") throw new Error(`${label}.unit_id: direct edit requires edit_safety safe_to_edit`);
  if (unit.existing_revisions === true) throw new Error(`${label}.unit_id: direct edit overlaps existing tracked changes`);
  if (Array.isArray(unit.blocked_boundaries) && unit.blocked_boundaries.length > 0) {
    throw new Error(`${label}.unit_id: direct edit blocked by ${unit.blocked_boundaries.join(", ")}`);
  }
  if (check.evidence_request !== "none") {
    throw new Error(`${label}.evidence_request: direct edit has unresolved evidence request`);
  }
  if (typeof check.original_text !== "string" || check.original_text.length === 0) {
    throw new Error(`${label}.original_text: direct edit requires non-empty anchor text`);
  }
  const matchCount = countExactMatches(unit.exact_text || "", check.original_text);
  if (matchCount !== 1) {
    throw new Error(`${label}.original_text: expected exactly one match in ${check.unit_id}; found ${matchCount}`);
  }
  if ((check.recommended_action === "replace_text" || check.recommended_action === "insert_after_text") && !check.replacement_text) {
    throw new Error(`${label}.replacement_text: required for ${check.recommended_action}`);
  }
  if (check.recommended_action === "delete_text" && check.replacement_text) {
    throw new Error(`${label}.replacement_text: delete_text requires empty replacement_text`);
  }
}

function nextRevisionId(entries) {
  let highest = 0;
  const pattern = /w:id="([0-9]+)"/g;
  for (const entry of entries.values()) {
    if (!entry.name.endsWith(".xml")) continue;
    const text = entry.content.toString("utf8");
    let match;
    while ((match = pattern.exec(text))) {
      highest = Math.max(highest, Number(match[1]));
    }
  }
  return highest + 1;
}

function extractRunProperties(runXml) {
  const match = runXml.match(/<w:rPr\b[\s\S]*?<\/w:rPr>/);
  return match ? match[0] : "";
}

function textRun(text, runProperties, tag = "w:t") {
  if (text.length === 0) return "";
  return `<w:r>${runProperties}<${tag} xml:space="preserve">${escapeXmlText(text)}</${tag}></w:r>`;
}

function revisionWrapper(type, id, author, date, inner) {
  return `<w:${type} w:id="${id}" w:author="${escapeXmlAttribute(author)}" w:date="${escapeXmlAttribute(date)}">${inner}</w:${type}>`;
}

function replaceRunWithTrackedMarkup({ runXml, check, revisionIds, author, date }) {
  const textMatches = [...runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)];
  if (textMatches.length !== 1) {
    throw new Error("target run must contain exactly one w:t text node");
  }

  const originalRunText = decodeXmlText(textMatches[0][1]);
  const position = originalRunText.indexOf(check.original_text);
  if (position === -1) {
    throw new Error("target run no longer contains original_text");
  }

  const before = originalRunText.slice(0, position);
  const after = originalRunText.slice(position + check.original_text.length);
  const runProperties = extractRunProperties(runXml);

  if (check.recommended_action === "insert_after_text") {
    const retained = originalRunText.slice(0, position + check.original_text.length);
    const suffix = originalRunText.slice(position + check.original_text.length);
    return [
      textRun(retained, runProperties),
      revisionWrapper("ins", revisionIds.ins, author, date, textRun(check.replacement_text, runProperties)),
      textRun(suffix, runProperties)
    ].join("");
  }

  const deletion = revisionWrapper(
    "del",
    revisionIds.del,
    author,
    date,
    textRun(check.original_text, runProperties, "w:delText")
  );
  const insertion =
    check.recommended_action === "replace_text"
      ? revisionWrapper("ins", revisionIds.ins, author, date, textRun(check.replacement_text, runProperties))
      : "";

  return [textRun(before, runProperties), deletion, insertion, textRun(after, runProperties)].join("");
}

function applyCheckToXml(xml, check, revisionIds, author, date) {
  const runPattern = /<w:r\b[\s\S]*?<\/w:r>/g;
  const candidates = [];
  let match;
  while ((match = runPattern.exec(xml))) {
    const runXml = match[0];
    const textMatches = [...runXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)];
    if (textMatches.length !== 1) continue;
    const text = decodeXmlText(textMatches[0][1]);
    const count = countExactMatches(text, check.original_text);
    if (count > 0) {
      candidates.push({ start: match.index, end: match.index + runXml.length, runXml, count });
    }
  }

  const candidateCount = candidates.reduce((sum, candidate) => sum + candidate.count, 0);
  if (candidateCount !== 1 || candidates.length !== 1) {
    throw new Error(
      `${check.unit_id}: expected one editable single-run XML anchor for ${JSON.stringify(check.original_text)}; found ${candidateCount}`
    );
  }

  const candidate = candidates[0];
  const replacement = replaceRunWithTrackedMarkup({
    runXml: candidate.runXml,
    check,
    revisionIds,
    author,
    date
  });
  return `${xml.slice(0, candidate.start)}${replacement}${xml.slice(candidate.end)}`;
}

function validateReadiness(output, directChecks) {
  if (directChecks.length === 0) return;
  const readiness = output.batch_readiness || {};
  if (readiness.readiness_status !== "ready_for_tracked_changes" || readiness.safe_to_apply_tracked_changes !== true) {
    throw new Error("checker output is not ready_for_tracked_changes");
  }
  const failedGate = (readiness.gates || []).find((gate) => isPlainObject(gate) && gate.gate_status === "fail");
  if (failedGate) throw new Error(`checker output has failed readiness gate ${failedGate.gate_id || "unknown"}`);
}

function applyTrackChangesToEntries({ entries, unitsDocument, checkerOutput, author, date }) {
  if (!isPlainObject(checkerOutput) || checkerOutput.schema_version !== "checker-output-v1") {
    throw new Error("checker output: expected checker-output-v1 object");
  }
  if (!Array.isArray(checkerOutput.checks)) throw new Error("checker output checks: expected array");

  const units = loadUnits(unitsDocument);
  const directChecks = checkerOutput.checks.filter((check) => DIRECT_ACTIONS.has(check.recommended_action));
  validateReadiness(checkerOutput, directChecks);

  let nextId = nextRevisionId(entries);
  const applied_edits = [];
  const skipped_checks = checkerOutput.checks.length - directChecks.length;

  for (const [index, check] of directChecks.entries()) {
    const label = `checks[${index}]`;
    const unit = units.get(check.unit_id);
    validateDirectCheck(check, unit, label);
    const part = unit.word_part;
    const entry = entries.get(part);
    if (!entry) throw new Error(`${check.unit_id}: Word part ${part} not found in DOCX package`);

    const revisionIds = {
      del: check.recommended_action === "insert_after_text" ? null : nextId++,
      ins: check.recommended_action === "delete_text" ? null : nextId++
    };
    const xml = entry.content.toString("utf8");
    const updatedXml = applyCheckToXml(xml, check, revisionIds, author, date);
    entry.content = Buffer.from(updatedXml, "utf8");
    applied_edits.push({
      unit_id: check.unit_id,
      action: check.recommended_action,
      word_part: part,
      deletion_id: revisionIds.del,
      insertion_id: revisionIds.ins
    });
  }

  return {
    schema_version: "frus-track-change-application-report-v1",
    applied_edits,
    skipped_checks,
    status: "pass"
  };
}

function renderText(report, outPath) {
  return `FRUS track-change application passed: ${report.applied_edits.length} direct edits applied, ${report.skipped_checks} checks skipped, output ${outPath}.\n`;
}

function runCli() {
  const { docxPath, unitsPath, checkerOutputPath, outPath, author, date, format } = parseArgs(process.argv);
  const entries = readZip(docxPath);
  const unitsDocument = readJson(unitsPath, unitsPath);
  const checkerOutput = readJson(checkerOutputPath, checkerOutputPath);
  const report = applyTrackChangesToEntries({ entries, unitsDocument, checkerOutput, author, date });
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

export { applyTrackChangesToEntries, readZip, writeZip };
