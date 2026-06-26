#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const OUT_JSON = path.join(REPORTS_DIR, "frus-assist-source-note-units.json");
const OUT_MD = path.join(REPORTS_DIR, "frus-assist-source-note-units.md");

const ASSIST_DIRS = [
  "89-92-RussiaFSU-Policy",
  "Balkans-93-95",
  "Bush41-LatAm",
  "Bush41-SouthAsia",
  "Bush41-Western-Europe",
  "Bush41-drugs-thugs",
  "Clinton-CentralAmerica",
  "Clinton-Europe",
  "Clinton-Foundations",
  "Clinton-NATO-European-Security",
  "Clinton-NATO-Expansion-Documents",
  "Clinton-PublicDiplomacy-93-00",
  "Clinton-Russia-High-Level",
  "Clinton-South-and-Southern-Africa",
  "Clinton-armscontrol-93-96",
  "EE-89-92",
  "FEP-85-88",
  "GCT-89-92",
  "NorthAfrica-89-92",
  "PRC-PostColdWar",
  "Sept10-FRUS",
  "armscontrol-97-2000",
  "global-issues-89-92",
  "org-man-89-92"
];

const SKIP_DIRS = new Set([
  ".cache",
  ".git",
  ".github",
  ".next",
  "build",
  "coverage",
  "dist",
  "documents",
  "exports",
  "node_modules",
  "private",
  "render_check",
  "reports",
  "scripts",
  "site",
  "sources",
  "standalone-frus-assist",
  "tmp"
]);

const INCLUDED_EXTENSIONS = new Set([".csv", ".html", ".htm", ".js", ".json", ".md", ".mjs", ".txt"]);
const SOURCE_LINE_EXTENSIONS = new Set([".html", ".htm", ".txt"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const SOURCE_NOTE_KEYS = new Set([
  "current_source_note",
  "draft_source_note",
  "frus_source_note",
  "frus_style_source_note",
  "packet_source_note",
  "source_note",
  "source_note_draft",
  "source_note_text",
  "source_notes",
  "working_source_note"
]);
const NON_NOTE_KEY_PARTS = [
  "action",
  "addendum",
  "basis",
  "flag",
  "gap",
  "issue",
  "order",
  "present",
  "priority",
  "provenance",
  "review",
  "status",
  "target",
  "verification"
];
const JS_SOURCE_FIELD =
  /(?:frusSourceNote|sourceNoteDraft|draftSourceNote|currentSourceNote|workingSourceNote|packetSourceNote|sourceNote|source_note|frus_source_note|source_note_draft|current_source_note|working_source_note|packet_source_note|source_notes)\b\s*[:=]\s*(["'`])([\s\S]*?)\1/g;
const SOURCEY_TEXT =
  /\b(American Presidency Project|Archived White House|Bush Library|Central Intelligence Agency|CIA|Clinton (?:Presidential )?(?:Library|Digital Library)|Congress\.gov|Congressional Research Service|Department of (?:Defense|Justice|State|the Air Force)|Federal Bureau of Investigation|Federation of American Scientists|Foreign Relations of the United States|George H\.?\s*W\.?\s*Bush|GovInfo|Library of Congress|NARA|National Archives|National Security Council|NATO|Office of the Historian|OSCE|OSTI|Public Law|Public Papers|Reagan Library|The White House|White House|William J\. Clinton Presidential Library|\([A-Z][A-Za-z .&'-]+,\s*\d{4}\)|\bpp?\.)\b/i;
const NON_PUBLICATION_NOTE =
  /^(?:Boundary authority|Citation sheet extraction pending|Classify\b|Compiler source-mining report only|Integrate\b|Item-level page ranges\b|Keep\b|Prioritize\b|Recovered from\b|Run\b|Screen\b|Separate\b|Source copy found\b|Track\b|Use\b)|\b(?:archival copy and markings require verification|before treating|do not cite|final FRUS source note still needs|meeting record, briefing text, and distribution require verification|minutes, participant list|NARA Scout search trail|needs? verification|original .* require[s]? verification|requires? archival verification|requires? repository verification|requires? verification|search trail|source lead)\b/i;

function posixPath(value) {
  return value.split(path.sep).join("/");
}

function hash(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function keyToSnake(value) {
  return String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isSourceNoteKey(key) {
  const normalized = keyToSnake(key);
  if (!normalized.includes("source_note")) return false;
  if (NON_NOTE_KEY_PARTS.some((part) => normalized.includes(part))) return false;
  return SOURCE_NOTE_KEYS.has(normalized);
}

function hasPreferredFrusSourceNote(value) {
  return (
    (typeof value.frusSourceNote === "string" && value.frusSourceNote.trim()) ||
    (typeof value.frus_source_note === "string" && value.frus_source_note.trim())
  );
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value) {
  return decodeHtml(String(value))
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function normalizeSourceNote(value, { inferredLabel = false } = {}) {
  let text = normalizeWhitespace(stripTags(value));
  text = text.replace(/^["'`]+|["'`]+$/g, "").trim();
  if (!text) return "";
  if (!/\bSource:\s*/i.test(text) && inferredLabel) {
    text = `Source: ${text}`;
  }
  return text;
}

function shouldSkipNonPublicationNote(value, { inferredLabel = false } = {}) {
  const raw = normalizeWhitespace(stripTags(value)).replace(/^["'`]+|["'`]+$/g, "").trim();
  const text = raw.replace(/^\s*Source:\s*/i, "").trim();
  if (!text) return true;
  if (NON_PUBLICATION_NOTE.test(text)) return true;
  if (inferredLabel && !/^\s*Source:\s*/i.test(raw) && !SOURCEY_TEXT.test(text)) return true;
  return false;
}

function splitSourceNoteText(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  const parts = text.split(/\r?\n\s*\r?\n(?=\s*Source:\s*)/i).map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

function shouldSkipDirectory(name) {
  return SKIP_DIRS.has(name) || name.startsWith(".tmp") || name.startsWith("render_check");
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && shouldSkipDirectory(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && INCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const stats = fs.statSync(fullPath);
      if (stats.size <= MAX_FILE_BYTES) files.push(fullPath);
    }
  }
  return files;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes && char === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function extractFromJsonValue(value, context, results) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => extractFromJsonValue(item, `${context}[${index}]`, results));
    return;
  }
  if (!value || typeof value !== "object") return;
  const hasFrusSourceNote = hasPreferredFrusSourceNote(value);
  for (const [key, item] of Object.entries(value)) {
    const nextContext = `${context}.${key}`;
    if (keyToSnake(key) === "source_note" && hasFrusSourceNote) {
      extractFromJsonValue(item, nextContext, results);
      continue;
    }
    if (typeof item === "string" && isSourceNoteKey(key)) {
      splitSourceNoteText(item).forEach((text, index) => {
        results.push({
          context: index ? `${nextContext}[source-note-${index + 1}]` : nextContext,
          inferredLabel: true,
          text,
          type: "json_field"
        });
      });
    }
    if (Array.isArray(item) && isSourceNoteKey(key)) {
      item.forEach((entry, index) => {
        if (typeof entry === "string") {
          splitSourceNoteText(entry).forEach((text, sourceNoteIndex) => {
            results.push({
              context: sourceNoteIndex
                ? `${nextContext}[${index}][source-note-${sourceNoteIndex + 1}]`
                : `${nextContext}[${index}]`,
              inferredLabel: true,
              text,
              type: "json_field"
            });
          });
        }
      });
    }
    extractFromJsonValue(item, nextContext, results);
  }
}

function extractJson(text, filePath) {
  try {
    const parsed = JSON.parse(text);
    const results = [];
    extractFromJsonValue(parsed, "$", results);
    return results;
  } catch {
    return [];
  }
}

function unescapeJsString(value) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

function extractJsFields(text) {
  const results = [];
  for (const match of text.matchAll(JS_SOURCE_FIELD)) {
    const raw = match[2];
    if (raw.length > 5000) continue;
    results.push({ context: `offset:${match.index}`, inferredLabel: true, text: unescapeJsString(raw), type: "js_field" });
  }
  return results;
}

function extractCsvFields(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((cell) => cell.trim());
  const sourceNoteColumns = header
    .map((name, index) => ({ index, name }))
    .filter(({ name }) => isSourceNoteKey(name));
  const results = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    for (const column of sourceNoteColumns) {
      const text = row[column.index] || "";
      if (text.trim()) {
        splitSourceNoteText(text).forEach((sourceNoteText, sourceNoteIndex) => {
          results.push({
            context:
              sourceNoteIndex > 0
                ? `row:${rowIndex + 1} column:${column.name} source-note:${sourceNoteIndex + 1}`
                : `row:${rowIndex + 1} column:${column.name}`,
            inferredLabel: true,
            text: sourceNoteText,
            type: "csv_field"
          });
        });
      }
    }
  }
  return results;
}

function extractSourceLines(text) {
  const results = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/\bdata-[\w-]+\s*=/i.test(line)) continue;
    if (/<code>\s*Source:\s*<\/code>/i.test(line)) continue;
    const sourceStart = line.search(/\bSource:\s*/i);
    if (sourceStart === -1) continue;
    const clean = normalizeSourceNote(line.slice(sourceStart));
    if (!clean || clean.length < 20 || clean.length > 3500) continue;
    results.push({ context: `line:${index + 1}`, inferredLabel: false, text: clean, type: "source_line" });
  }
  return results;
}

function extractFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const text = fs.readFileSync(filePath, "utf8");
  const extracts = [];
  if (ext === ".json") extracts.push(...extractJson(text, filePath));
  if (ext === ".csv") extracts.push(...extractCsvFields(text));
  if ([".js", ".mjs", ".html", ".htm"].includes(ext)) extracts.push(...extractJsFields(text));
  if (SOURCE_LINE_EXTENSIONS.has(ext)) extracts.push(...extractSourceLines(text));
  return extracts;
}

function makeUnit({ site, filePath, extract }) {
  if (shouldSkipNonPublicationNote(extract.text, { inferredLabel: extract.inferredLabel })) return null;
  const text = normalizeSourceNote(extract.text, { inferredLabel: extract.inferredLabel });
  if (!text || !/\bSource:\s*/i.test(text)) return null;
  const relativePath = posixPath(path.relative(ROOT, filePath));
  return {
    unit_id: `${site}-${hash(`${relativePath}\n${extract.context}\n${text}`)}`,
    unit_type: "source_note",
    location: `${relativePath}:${extract.context}`,
    exact_text: text,
    display_text: text,
    metadata: {
      site,
      source_file: relativePath,
      extraction_type: extract.type,
      source_label_inferred: Boolean(extract.inferredLabel)
    }
  };
}

function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const units = [];
  const seen = new Set();
  const bySite = {};
  const skippedSites = [];
  let scannedFiles = 0;

  for (const site of ASSIST_DIRS) {
    const siteDir = path.join(ROOT, site);
    if (!fs.existsSync(siteDir)) {
      skippedSites.push(site);
      continue;
    }
    const files = walk(siteDir);
    scannedFiles += files.length;
    let siteCount = 0;
    for (const filePath of files) {
      for (const extract of extractFromFile(filePath)) {
        const unit = makeUnit({ site, filePath, extract });
        if (!unit) continue;
        const dedupeKey = `${site}\n${unit.exact_text}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        units.push(unit);
        siteCount += 1;
      }
    }
    bySite[site] = siteCount;
  }

  const document = {
    schema_version: "frus-assist-source-note-units-v1",
    generated_at: new Date().toISOString(),
    source: "scripts/extract-frus-assist-source-notes.mjs",
    scope: "FRUS Assist webpage source-note fields and Source: prose in local site files",
    scanned_files: scannedFiles,
    skipped_sites: skippedSites,
    counts: {
      sites: Object.keys(bySite).length,
      source_note_units: units.length,
      by_site: bySite
    },
    units
  };

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(document, null, 2)}\n`);

  const lines = [
    "# FRUS Assist Source Note Extraction",
    "",
    `Generated: ${document.generated_at}`,
    "",
    `Scanned files: ${document.scanned_files}`,
    `Source-note units: ${document.counts.source_note_units}`,
    "",
    "## Units By Site",
    "",
    "| Site | Units |",
    "| --- | ---: |",
    ...Object.entries(bySite).map(([site, count]) => `| ${site} | ${count} |`),
    "",
    "## Notes",
    "",
    "- Source-note data fields are normalized with a `Source:` label for checker input when the field name itself supplies the source-note role.",
    "- Duplicate source-note texts within the same site are collapsed before linting.",
    "- Raw document/source folders, caches, temporary folders, and generated standalone bundles are excluded."
  ];
  fs.writeFileSync(OUT_MD, `${lines.join("\n")}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_JSON)} with ${units.length} source-note units.`);
}

main();
