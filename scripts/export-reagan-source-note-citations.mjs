import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPORTS_DIR = "reports";
const OUT_DIR = path.join(REPORTS_DIR, "reagan-subseries-source-note-offline-export");
const EPUB_DIR = path.join(OUT_DIR, "epub-cache");
const CACHE_JSON = path.join(OUT_DIR, "source-note-cache.json");
const OUT_JSON = path.join(OUT_DIR, "reagan-subseries-source-note-full-citations.json");
const OUT_CSV = path.join(OUT_DIR, "reagan-subseries-source-note-full-citations.csv");
const OUT_MD = path.join(OUT_DIR, "reagan-subseries-source-note-full-citations.md");
const OUT_HTML = path.join(OUT_DIR, "reagan-subseries-source-note-full-citations.html");
const OUT_UNIQUE_JSON = path.join(OUT_DIR, "reagan-subseries-source-note-unique-citations.json");
const OUT_UNIQUE_CSV = path.join(OUT_DIR, "reagan-subseries-source-note-unique-citations.csv");
const OUT_UNIQUE_MD = path.join(OUT_DIR, "reagan-subseries-source-note-unique-citations.md");
const OUT_README = path.join(OUT_DIR, "README.md");

const BASE_URL = "https://history.state.gov";
const USER_AGENT = "FRUS-Source-Note-Offline-Exporter/1.0";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const RETRY_STATUSES = new Set(["fetch_error", "missing_source_note", "first_footnote_not_source", "not_in_cache"]);
const EPUB_DOWNLOADS = new Map();

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const concurrencyArg = process.argv.find((arg) => arg.startsWith("--concurrency="));
const refresh = args.has("--refresh");
const offlineOnly = args.has("--offline-only");
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : null;
const concurrency = Math.max(1, Math.min(24, concurrencyArg ? Number.parseInt(concurrencyArg.split("=")[1], 10) : 8));

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadDocuments() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => /^frus1981-88v.*-annotation-corpus\.json$/.test(file))
    .sort();
  const seen = new Set();
  const documents = [];
  for (const file of files) {
    const data = readJson(path.join(REPORTS_DIR, file), {});
    const volumeId = file.replace("-annotation-corpus.json", "");
    const epubUrl = data.source_epub || data.epub || "";
    const rows = Array.isArray(data.documents) ? data.documents : [];
    for (const row of rows) {
      const docId = row.doc_id || String(row.doc_no || "").replace(/^d/, "");
      const key = `${row.volume_id || volumeId}/d${docId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      documents.push({
        key,
        volume_id: row.volume_id || volumeId,
        volume: row.volume || "",
        chapter: row.chapter || "",
        doc_id: docId,
        doc_no: row.doc_no ?? docId,
        doc_type: row.doc_type || "",
        source_family: row.source_family || "No source family recorded",
        has_source_note: Boolean(row.has_source_note),
        footnote_count: row.footnote_count ?? null,
        member: row.member || `OEBPS/d${docId}.html`,
        epub_url: epubUrl,
        url: row.url || `${BASE_URL}/historicaldocuments/${row.volume_id || volumeId}/d${docId}`
      });
    }
  }
  return Number.isFinite(limit) ? documents.slice(0, limit) : documents;
}

function loadCache() {
  const cache = readJson(CACHE_JSON, { entries: [] });
  const map = new Map();
  for (const entry of cache.entries || []) map.set(entry.key, entry);
  return map;
}

function saveCache(entries) {
  const sorted = [...entries.values()].sort(compareEntries);
  fs.writeFileSync(
    CACHE_JSON,
    `${JSON.stringify({
      schema_version: "1.0",
      generated_at: new Date().toISOString(),
      entries: sorted
    }, null, 2)}\n`
  );
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-");
}

function htmlToText(html) {
  return decodeEntities(
    String(html || "")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|h[1-6]|li|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s*↩\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstFootnoteHtml(html) {
  const footnoteMatches = [...String(html || "").matchAll(/<li\b[^>]*class="[^"]*\bfootnote\b[^"]*"[^>]*>[\s\S]*?<\/li>/gi)];
  let footnoteHtml = "";
  if (footnoteMatches.length) {
    const valueOne = footnoteMatches.find((match) => /\bvalue=["']?1["']?/i.test(match[0]));
    footnoteHtml = (valueOne || footnoteMatches[0])[0];
  } else {
    const footnotesAt = String(html || "").search(/<div\b[^>]*class=["'][^"']*\bfootnotes\b/i);
    if (footnotesAt >= 0) {
      const footnotesHtml = String(html || "").slice(footnotesAt);
      const divFootnote = footnotesHtml.match(
        /<div\b(?![^>]*class=["'][^"']*\bfootnotes\b)[^>]*>\s*(?:<p\b[^>]*>\s*)?<a\b[^>]*class=["'][^"']*\bfootnote\b[^"']*["'][\s\S]*?<\/div>/i
      );
      footnoteHtml = divFootnote ? divFootnote[0] : "";
    }
  }
  return footnoteHtml
    .replace(/<a\b[^>]*class="[^"]*\bfootnote\b[^"]*"[^>]*>[\s\S]*?<\/a>/i, " ")
    .replace(/<a\b[^>]*class="[^"]*\bfn-back\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, " ")
    .replace(/<a\b[^>]*href="#fnref:[^"]*"[^>]*>[\s\S]*?<\/a>/gi, " ");
}

function extractDocumentHtml(html, doc) {
  const h2 =
    String(html || "").match(/<h[23]\b[^>]*class="[^"]*\btei-head[^"]*"[^>]*>([\s\S]*?)<\/h[23]>/i) ||
    String(html || "").match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i) ||
    String(html || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const dateline =
    String(html || "").match(/<div\b[^>]*class="[^"]*\btei-dateline\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    String(html || "").match(/<div\b[^>]*class="[^"]*\bopener\b[^"]*"[^>]*>[\s\S]*?<span\b[^>]*>([\s\S]*?)<\/span>/i);
  const firstFootnoteHtml = extractFirstFootnoteHtml(html);
  const sourceNote = htmlToText(firstFootnoteHtml);
  const title = htmlToText(h2 ? h2[1] : "").replace(/\s+\d+$/, "");
  const dateLine = htmlToText(dateline ? dateline[1] : "");
  const status = !doc.has_source_note
    ? "no_source_note_expected"
    : sourceNote.startsWith("Source:")
      ? "source_note"
      : sourceNote
        ? "first_footnote_not_source"
        : "missing_source_note";
  return { title, dateLine, sourceNote, status };
}

function epubPath(volumeId) {
  return path.join(EPUB_DIR, `${volumeId}.epub`);
}

async function ensureEpub(doc) {
  if (!doc.epub_url) return "";
  const file = epubPath(doc.volume_id);
  if (fs.existsSync(file) && !refresh) return file;
  if (EPUB_DOWNLOADS.has(doc.volume_id)) return EPUB_DOWNLOADS.get(doc.volume_id);
  const download = downloadEpub(doc, file);
  EPUB_DOWNLOADS.set(doc.volume_id, download);
  try {
    return await download;
  } finally {
    EPUB_DOWNLOADS.delete(doc.volume_id);
  }
}

async function downloadEpub(doc, file) {
  ensureDir(EPUB_DIR);
  const response = await fetch(doc.epub_url, {
    headers: {
      "User-Agent": BROWSER_USER_AGENT,
      Accept: "application/epub+zip,application/octet-stream,*/*"
    }
  });
  if (!response.ok) throw new Error(`EPUB HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const tempFile = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tempFile, buffer);
  fs.renameSync(tempFile, file);
  return file;
}

function readEpubMember(file, member) {
  return execFileSync("unzip", ["-p", file, member], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          Referer: `${BASE_URL}/historicaldocuments`
        }
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return { status: response.status, text };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw lastError;
}

async function buildEntry(doc, cache) {
  const cached = cache.get(doc.key);
  if (cached && !refresh && !RETRY_STATUSES.has(cached.status)) return cached;
  if (!doc.has_source_note) {
    return {
      ...doc,
      title: "",
      date_line: "",
      source_note: "",
      status: "no_source_note_expected",
      fetched_at: null,
      http_status: null,
      error: null
    };
  }
  if (offlineOnly) {
    return {
      ...doc,
      title: cached?.title || "",
      date_line: cached?.date_line || "",
      source_note: cached?.source_note || "",
      status: cached?.status || "not_in_cache",
      fetched_at: cached?.fetched_at || null,
      http_status: cached?.http_status || null,
      error: cached?.error || "Not fetched: --offline-only and no cached source note."
    };
  }
  try {
    let html = "";
    let httpStatus = null;
    let extractionSource = "document-page";
    if (doc.epub_url) {
      const file = await ensureEpub(doc);
      html = readEpubMember(file, doc.member);
      extractionSource = "epub";
    } else {
      const fetched = await fetchWithRetry(doc.url);
      html = fetched.text;
      httpStatus = fetched.status;
    }
    const extracted = extractDocumentHtml(html, doc);
    return {
      ...doc,
      title: extracted.title,
      date_line: extracted.dateLine,
      source_note: extracted.sourceNote,
      status: extracted.status,
      extraction_source: extractionSource,
      fetched_at: new Date().toISOString(),
      http_status: httpStatus,
      error: null
    };
  } catch (error) {
    return {
      ...doc,
      title: cached?.title || "",
      date_line: cached?.date_line || "",
      source_note: cached?.source_note || "",
      status: cached?.status || "fetch_error",
      fetched_at: cached?.fetched_at || null,
      http_status: cached?.http_status || null,
      error: String(error?.message || error)
    };
  }
}

async function runQueue(documents, cache) {
  const entries = new Map(cache);
  let nextIndex = 0;
  let completed = 0;
  async function worker() {
    while (nextIndex < documents.length) {
      const index = nextIndex;
      nextIndex += 1;
      const doc = documents[index];
      const entry = await buildEntry(doc, entries);
      entries.set(doc.key, entry);
      completed += 1;
      if (completed % 50 === 0 || completed === documents.length) {
        console.log(`Processed ${completed}/${documents.length}`);
        saveCache(entries);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  saveCache(entries);
  return documents.map((doc) => entries.get(doc.key)).filter(Boolean).sort(compareEntries);
}

function compareEntries(a, b) {
  return (
    String(a.volume_id).localeCompare(String(b.volume_id)) ||
    Number(a.doc_no) - Number(b.doc_no) ||
    String(a.key).localeCompare(String(b.key))
  );
}

function citationHash(text) {
  return crypto.createHash("sha1").update(text || "").digest("hex").slice(0, 12);
}

function buildUnique(entries) {
  const byNote = new Map();
  for (const entry of entries) {
    if (!entry.source_note || !entry.source_note.startsWith("Source:")) continue;
    const normalized = entry.source_note.replace(/\s+/g, " ").trim();
    const id = citationHash(normalized);
    if (!byNote.has(id)) {
      byNote.set(id, {
        id,
        source_note: normalized,
        source_families: new Set(),
        volumes: new Set(),
        occurrences: 0,
        documents: []
      });
    }
    const row = byNote.get(id);
    row.occurrences += 1;
    row.source_families.add(entry.source_family);
    row.volumes.add(entry.volume_id);
    row.documents.push({
      key: entry.key,
      volume_id: entry.volume_id,
      doc_no: entry.doc_no,
      doc_type: entry.doc_type,
      title: entry.title,
      url: entry.url
    });
  }
  return [...byNote.values()]
    .map((row) => ({
      ...row,
      source_families: [...row.source_families].sort(),
      volumes: [...row.volumes].sort(),
      sample_documents: row.documents.slice(0, 10)
    }))
    .sort((a, b) => b.occurrences - a.occurrences || a.source_note.localeCompare(b.source_note));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(file, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
}

function writeJson(entries, unique, documents) {
  const sourceRows = entries.filter((entry) => entry.source_note?.startsWith("Source:"));
  const statuses = entries.reduce((map, entry) => {
    map[entry.status] = (map[entry.status] || 0) + 1;
    return map;
  }, {});
  const metadataFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => /^frus1981-88v.*-annotation-corpus\.json$/.test(file))
    .sort()
    .map((file) => path.join(REPORTS_DIR, file));
  const epubFiles = [...new Set(documents.filter((doc) => doc.epub_url).map((doc) => epubPath(doc.volume_id)))]
    .filter((file) => fs.existsSync(file))
    .sort();
  const report = {
    schema_version: "1.0",
    generated_at: new Date().toISOString(),
    purpose: "Closed-network export of full published source-note citations for the Reagan subseries metadata available in this workspace.",
    source: {
      metadata_files: metadataFiles,
      epub_files: epubFiles,
      pages: "Published history.state.gov document URLs are retained as reference strings. Source-note text is copied into this file from cached FRUS EPUBs, so no Internet access is required for review."
    },
    counts: {
      metadata_documents: documents.length,
      export_entries: entries.length,
      source_note_entries: sourceRows.length,
      unique_source_notes: unique.length,
      statuses
    },
    entries
  };
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    OUT_UNIQUE_JSON,
    `${JSON.stringify({
      schema_version: "1.0",
      generated_at: report.generated_at,
      unique_source_notes: unique.length,
      citations: unique
    }, null, 2)}\n`
  );
  return report;
}

function writeMarkdown(entries, unique, report) {
  const lines = [];
  lines.push("# Reagan Subseries Source Note Full Citations");
  lines.push("");
  lines.push(`Generated: ${report.generated_at}`);
  lines.push("");
  lines.push("This is a closed-network export. Every harvested published `Source:` note is copied into this file; no live history.state.gov access is required to review the citation text.");
  lines.push("");
  lines.push("## Counts");
  lines.push("");
  lines.push(`- Metadata documents: ${report.counts.metadata_documents}`);
  lines.push(`- Export entries: ${report.counts.export_entries}`);
  lines.push(`- Published Source notes copied: ${report.counts.source_note_entries}`);
  lines.push(`- Unique Source-note citation texts: ${report.counts.unique_source_notes}`);
  lines.push("");
  lines.push("## Status Counts");
  lines.push("");
  for (const [status, count] of Object.entries(report.counts.statuses).sort()) lines.push(`- ${status}: ${count}`);
  lines.push("");
  lines.push("## Full Document-by-Document Citations");
  lines.push("");
  let currentVolume = "";
  for (const entry of entries) {
    if (entry.volume_id !== currentVolume) {
      currentVolume = entry.volume_id;
      lines.push(`## ${entry.volume_id}`);
      lines.push("");
    }
    lines.push(`### ${entry.volume_id} document ${entry.doc_no}`);
    lines.push("");
    lines.push(`- Key: \`${entry.key}\``);
    lines.push(`- Type: ${entry.doc_type || "not recorded"}`);
    if (entry.title) lines.push(`- Title: ${entry.title}`);
    if (entry.date_line) lines.push(`- Dateline: ${entry.date_line}`);
    lines.push(`- Source family: ${entry.source_family}`);
    lines.push(`- Status: ${entry.status}`);
    lines.push(`- Published URL: ${entry.url}`);
    if (entry.error) lines.push(`- Fetch note: ${entry.error}`);
    lines.push("");
    if (entry.source_note) {
      lines.push("```text");
      lines.push(entry.source_note);
      lines.push("```");
    } else {
      lines.push("_No published Source note copied for this entry._");
    }
    lines.push("");
  }
  fs.writeFileSync(OUT_MD, `${lines.join("\n").trimEnd()}\n`);

  const uniqueLines = [];
  uniqueLines.push("# Reagan Subseries Unique Source Note Citations");
  uniqueLines.push("");
  uniqueLines.push(`Generated: ${report.generated_at}`);
  uniqueLines.push("");
  uniqueLines.push(`Unique citations: ${unique.length}`);
  uniqueLines.push("");
  for (const row of unique) {
    uniqueLines.push(`## ${row.id}`);
    uniqueLines.push("");
    uniqueLines.push(`- Occurrences: ${row.occurrences}`);
    uniqueLines.push(`- Volumes: ${row.volumes.join(", ")}`);
    uniqueLines.push(`- Source families: ${row.source_families.join("; ")}`);
    uniqueLines.push("");
    uniqueLines.push("```text");
    uniqueLines.push(row.source_note);
    uniqueLines.push("```");
    uniqueLines.push("");
    uniqueLines.push("Sample documents:");
    for (const doc of row.sample_documents) {
      uniqueLines.push(`- ${doc.volume_id} document ${doc.doc_no}: ${doc.title || doc.doc_type || doc.key}`);
    }
    uniqueLines.push("");
  }
  fs.writeFileSync(OUT_UNIQUE_MD, `${uniqueLines.join("\n").trimEnd()}\n`);
}

function writeHtml(entries, unique, report) {
  const data = {
    generated_at: report.generated_at,
    counts: report.counts,
    entries,
    unique
  };
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reagan Subseries Source Note Full Citations</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f7f7f5;color:#1f2933}
header{background:#18202a;color:#fff;padding:24px}
main{padding:20px;max-width:1280px;margin:auto}
.toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 180px 220px;gap:12px;margin:16px 0}
input,select{font:inherit;padding:10px;border:1px solid #b7c0ca;border-radius:4px;background:#fff}
.summary{display:flex;flex-wrap:wrap;gap:8px}
.pill{background:#e7ecef;border:1px solid #c9d1d8;border-radius:999px;padding:6px 10px}
article{background:#fff;border:1px solid #d7dde2;border-radius:6px;margin:12px 0;padding:14px}
h2,h3{margin:0 0 8px}
pre{white-space:pre-wrap;word-wrap:break-word;background:#f3f5f7;border:1px solid #d8dde3;border-radius:4px;padding:10px}
.meta{font-size:.9rem;color:#52606d;line-height:1.5}
.hidden{display:none}
</style>
</head>
<body>
<header>
<h1>Reagan Subseries Source Note Full Citations</h1>
<p>Offline export generated ${escapeHtml(report.generated_at)}. All copied source-note text is embedded in this file.</p>
</header>
<main>
<section class="summary" id="summary"></section>
<section class="toolbar">
<input id="query" type="search" placeholder="Search source notes, titles, folders, repositories">
<select id="volume"></select>
<select id="status"></select>
</section>
<section id="results"></section>
</main>
<script type="application/json" id="payload">${escapeHtml(JSON.stringify(data))}</script>
<script>
const payload = JSON.parse(document.getElementById("payload").textContent);
const entries = payload.entries;
const query = document.getElementById("query");
const volume = document.getElementById("volume");
const status = document.getElementById("status");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
summary.innerHTML = Object.entries(payload.counts).map(([key, value]) => '<span class="pill">' + key + ': ' + (typeof value === 'object' ? JSON.stringify(value) : value) + '</span>').join('');
for (const select of [volume, status]) select.innerHTML = '<option value="">All ' + select.id + 's</option>';
for (const value of [...new Set(entries.map((row) => row.volume_id))].sort()) volume.insertAdjacentHTML('beforeend', '<option>' + value + '</option>');
for (const value of [...new Set(entries.map((row) => row.status))].sort()) status.insertAdjacentHTML('beforeend', '<option>' + value + '</option>');
function esc(text){return String(text || '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function render(){
  const q = query.value.trim().toLowerCase();
  const rows = entries.filter((row) => {
    if (volume.value && row.volume_id !== volume.value) return false;
    if (status.value && row.status !== status.value) return false;
    if (!q) return true;
    return [row.key,row.title,row.date_line,row.doc_type,row.source_family,row.source_note,row.url].join(' ').toLowerCase().includes(q);
  });
  results.innerHTML = '<p class="meta">' + rows.length + ' entries shown.</p>' + rows.map((row) => '<article><h2>' + esc(row.volume_id) + ' document ' + esc(row.doc_no) + '</h2><div class="meta">' + esc(row.title || row.doc_type || '') + '<br>Status: ' + esc(row.status) + ' | Source family: ' + esc(row.source_family) + '<br>Published URL: ' + esc(row.url) + '</div><pre>' + esc(row.source_note || 'No published Source note copied for this entry.') + '</pre></article>').join('');
}
[query, volume, status].forEach((node) => node.addEventListener('input', render));
render();
</script>
</body>
</html>`;
  fs.writeFileSync(OUT_HTML, html);
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeReadme(report) {
  const readme = `# Reagan Subseries Source Note Offline Export

Generated: ${report.generated_at}

This folder is designed for a standalone or closed network. It contains copied
published source-note citation text from the Reagan subseries metadata available
in this workspace. No Internet access is required to inspect the exported
citations. The source-note text was extracted from cached FRUS EPUBs included in
the \`epub-cache/\` directory.

## Files

- \`reagan-subseries-source-note-full-citations.html\` - standalone searchable HTML review file.
- \`reagan-subseries-source-note-full-citations.md\` - document-by-document Markdown with every copied note.
- \`reagan-subseries-source-note-full-citations.csv\` - spreadsheet-friendly document-by-document export.
- \`reagan-subseries-source-note-full-citations.json\` - structured document-by-document export.
- \`reagan-subseries-source-note-unique-citations.md\` - de-duplicated citation text with occurrence counts.
- \`reagan-subseries-source-note-unique-citations.csv\` - spreadsheet-friendly unique citation export.
- \`reagan-subseries-source-note-unique-citations.json\` - structured unique citation export.
- \`source-note-cache.json\` - extraction cache used by the generator.
- \`epub-cache/*.epub\` - cached FRUS EPUBs used as the offline source-note extraction base.

## Counts

- Metadata documents: ${report.counts.metadata_documents}
- Export entries: ${report.counts.export_entries}
- Published Source notes copied: ${report.counts.source_note_entries}
- Unique Source-note citation texts: ${report.counts.unique_source_notes}

## Status Counts

${Object.entries(report.counts.statuses).sort().map(([status, count]) => `- ${status}: ${count}`).join("\n")}

`;
  fs.writeFileSync(OUT_README, readme);
}

function writeOutputs(entries, documents) {
  const unique = buildUnique(entries);
  const report = writeJson(entries, unique, documents);
  writeCsv(
    OUT_CSV,
    [
      "key",
      "volume_id",
      "doc_no",
      "doc_type",
      "title",
      "date_line",
      "source_family",
      "status",
      "has_source_note",
      "footnote_count",
      "member",
      "extraction_source",
      "url",
      "epub_url",
      "source_note",
      "error"
    ],
    entries
  );
  writeCsv(
    OUT_UNIQUE_CSV,
    ["id", "occurrences", "volumes", "source_families", "source_note", "sample_documents"],
    unique.map((row) => ({
      id: row.id,
      occurrences: row.occurrences,
      volumes: row.volumes.join("; "),
      source_families: row.source_families.join("; "),
      source_note: row.source_note,
      sample_documents: row.sample_documents.map((doc) => `${doc.volume_id}/d${doc.doc_no}`).join("; ")
    }))
  );
  writeMarkdown(entries, unique, report);
  writeHtml(entries, unique, report);
  writeReadme(report);
  return report;
}

async function main() {
  ensureDir(OUT_DIR);
  const documents = loadDocuments();
  const cache = loadCache();
  console.log(`Documents in scope: ${documents.length}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log(refresh ? "Refresh mode: refetching cached notes" : "Using cache where available");
  const entries = await runQueue(documents, cache);
  const report = writeOutputs(entries, documents);
  console.log(`Wrote ${OUT_DIR}`);
  console.log(`Copied Source notes: ${report.counts.source_note_entries}`);
  console.log(`Unique Source notes: ${report.counts.unique_source_notes}`);
  const failures = entries.filter((entry) => ["fetch_error", "missing_source_note", "first_footnote_not_source", "not_in_cache"].includes(entry.status));
  if (failures.length) {
    console.log(`Review statuses needing attention: ${failures.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
