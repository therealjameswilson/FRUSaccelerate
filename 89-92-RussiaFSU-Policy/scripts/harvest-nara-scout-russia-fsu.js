#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SCOUT_APP_URL = "https://therealjameswilson.github.io/nara-scout/app.js";
const SCOUT_SEARCH_URL =
  "https://therealjameswilson.github.io/nara-scout/#q=%28Soviet+OR+USSR+OR+Russia+OR+Yeltsin+OR+Gorbachev+OR+Ukraine+OR+Belarus+OR+Kazakhstan+OR+%22Nunn-Lugar%22+OR+Lisbon%29&from=1989&to=1993&sort=relevance&perColl=25&perPage=50&scope=bush41%2C2163580";
const DEFAULT_OUT_PATH = path.join(
  __dirname,
  "..",
  "reports",
  "nara-scout-russia-fsu-search.json"
);

const WITHDRAWAL_RE = /withdraw(al)?\s*(sheet|notice|card)|NA\s*Form\s*1402[13]/i;
const MAX_PARALLEL = 8;

function extractStringConstant(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*'([^']+)'`));
  if (!match) throw new Error(`Could not extract ${name} from NARA Scout app.js`);
  return match[1];
}

function extractArrayConstant(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*'([^']+)'\\.split\\(','\\)`));
  if (!match) throw new Error(`Could not extract ${name} from NARA Scout app.js`);
  return match[1].split(",").filter(Boolean);
}

function parseScoutHash(url) {
  const hash = new URL(url).hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    q: params.get("q") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
    sort: params.get("sort") || "relevance",
    perColl: Number(params.get("perColl") || 25),
    perPage: Number(params.get("perPage") || 50),
    scope: (params.get("scope") || "").split(",").filter(Boolean)
  };
}

function sanitizeQuery(q) {
  return q.replace(/["\u201C\u201D]/g, "").replace(/\s+/g, " ").trim();
}

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return text;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  if (/^\s*</.test(text)) throw new Error(`HTML response from ${url}`);
  return JSON.parse(text);
}

function getRecord(hit) {
  return (hit._source && (hit._source.record || hit._source)) || hit;
}

function getScore(hit) {
  return Number(hit._score || hit.score || 0);
}

function getAncestors(rec) {
  return (rec.ancestors || []).map((ancestor) => ({
    naId: String(ancestor.naId || ""),
    title: ancestor.title || ancestor.collectionTitle || "",
    level: ancestor.levelOfDescription || ""
  }));
}

function findAncestor(rec, pattern) {
  return getAncestors(rec).find((ancestor) => pattern.test(ancestor.level) || pattern.test(ancestor.title));
}

function datePart(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const year = value.year || "";
  if (!year) return "";
  const month = String(value.month || "01").padStart(2, "0");
  const day = String(value.day || "01").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateYear(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 4);
  return value.year ? String(value.year) : "";
}

function firstDigitalObject(rec) {
  const objects = Array.isArray(rec.digitalObjects) ? rec.digitalObjects : [];
  const pdf = objects.find((obj) => /\.pdf(\?|$)/i.test(obj.objectUrl || obj.url || ""));
  return pdf || objects[0] || null;
}

function digitalObjectUrl(obj) {
  if (!obj) return "";
  return obj.objectUrl || obj.url || obj.thumbnailUrl || "";
}

function classify(rec) {
  const title = (rec.title || "").toString();
  const desc = (rec.scopeAndContentNote || "").toString();
  const online = Array.isArray(rec.digitalObjects) && rec.digitalObjects.length > 0;
  const restrictions = (rec.accessRestriction && rec.accessRestriction.specificAccessRestrictions) || [];
  const restrictionTypes = restrictions.map((r) => (r.restriction || "").toString().toUpperCase());
  const hasFoia = restrictionTypes.some((r) => /FOIA/.test(r));
  const hasPra = restrictionTypes.some((r) => /PRA|PRESIDENTIAL.RECORDS/.test(r));
  const looksWithdrawal = WITHDRAWAL_RE.test(title) || WITHDRAWAL_RE.test(desc);

  let category;
  if (looksWithdrawal) category = "withdrawal";
  else if (hasFoia || hasPra) category = "withdrawal";
  else if (online) category = "declassified";
  else if (!desc.trim() || desc.trim().length < 20) category = "unprocessed";
  else category = "other";

  return {
    category,
    online,
    digitalObjects: Array.isArray(rec.digitalObjects) ? rec.digitalObjects.length : 0,
    foia: hasFoia,
    pra: hasPra,
    restrictionTypes
  };
}

function searchTerms(query) {
  return sanitizeQuery(query)
    .replace(/[()]/g, " ")
    .split(/\s+OR\s+|\s+AND\s+|\s+/i)
    .map((term) => term.trim())
    .filter((term) => term && !/^(OR|AND)$/i.test(term));
}

function matchedTerms(rec, terms) {
  const haystack = [
    rec.title,
    rec.scopeAndContentNote,
    rec.localIdentifier,
    ...getAncestors(rec).map((ancestor) => ancestor.title)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.filter((term) => haystack.includes(term.toLowerCase()));
}

function sourceRecord(hit, matchedCollectionNaid, queryTerms) {
  const rec = getRecord(hit);
  const info = classify(rec);
  const firstObject = firstDigitalObject(rec);
  const series = findAncestor(rec, /series/i) || {};
  const collection = findAncestor(rec, /collection/i) || {};
  return {
    naid: String(rec.naId || ""),
    title: rec.title || "",
    description: rec.scopeAndContentNote || "",
    startDate: datePart(rec.coverageStartDate),
    endDate: datePart(rec.coverageEndDate),
    startYear: dateYear(rec.coverageStartDate),
    endYear: dateYear(rec.coverageEndDate),
    level: rec.levelOfDescription || "",
    localIdentifier: rec.localIdentifier || "",
    category: info.category,
    digitalObjects: info.digitalObjects,
    foia: info.foia,
    pra: info.pra,
    restrictionTypes: info.restrictionTypes,
    catalogUrl: rec.naId ? `https://catalog.archives.gov/id/${rec.naId}` : "",
    digitalUrl: digitalObjectUrl(firstObject),
    objectFilename: firstObject?.objectFilename || firstObject?.filename || "",
    score: getScore(hit),
    collection: collection.title || "",
    collectionNaid: collection.naId || "",
    series: series.title || "",
    seriesNaid: series.naId || "",
    matchedCollectionNaids: [matchedCollectionNaid],
    matchedTerms: matchedTerms(rec, queryTerms),
    ancestors: getAncestors(rec)
  };
}

async function fetchOne({ proxyUrl, apiKey, naraPath, naid, search }) {
  const params = new URLSearchParams();
  params.append("q", sanitizeQuery(search.q));
  params.append("ancestorNaId", naid);
  if (search.from) params.append("startDate", search.from);
  if (search.to) params.append("endDate", search.to);
  params.append("limit", String(search.perColl));

  const url = `${proxyUrl.replace(/\/+$/, "")}${naraPath}?${params.toString()}`;
  try {
    const json = await fetchJson(url, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json"
      }
    });
    const body = json.body || json;
    const hits = (body.hits && body.hits.hits) || [];
    const totalRaw = body.hits && body.hits.total;
    const total = (totalRaw && (totalRaw.value ?? totalRaw)) || 0;
    return { naid, total, hits };
  } catch (error) {
    return { naid, total: 0, hits: [], error: error.message };
  }
}

async function mapLimit(items, limit, worker) {
  const queue = [...items];
  const results = [];
  const workers = Array(Math.min(limit, queue.length))
    .fill(0)
    .map(async () => {
      while (queue.length) {
        const item = queue.shift();
        results.push(await worker(item));
      }
    });
  await Promise.all(workers);
  return results;
}

function sortRecords(records, sortMode) {
  if (sortMode === "date") {
    return records.sort(
      (a, b) =>
        (a.startDate || a.endDate || "9999").localeCompare(b.startDate || b.endDate || "9999") ||
        a.title.localeCompare(b.title)
    );
  }
  return records.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const value = record[key] || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function outPathFromArgs() {
  const index = process.argv.indexOf("--out");
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return DEFAULT_OUT_PATH;
}

async function main() {
  const search = parseScoutHash(SCOUT_SEARCH_URL);
  const appSource = await fetchText(SCOUT_APP_URL);
  const proxyUrl = extractStringConstant(appSource, "PROXY_URL");
  const apiKey = extractStringConstant(appSource, "API_KEY");
  const naraPath = extractStringConstant(appSource, "NARA_PATH");
  const bush41Collections = extractArrayConstant(appSource, "DEFAULT_BUSH41_COLLECTIONS");

  const naids = new Set();
  for (const scope of search.scope) {
    if (scope === "bush41") bush41Collections.forEach((naid) => naids.add(naid));
    else if (/^\d+$/.test(scope)) naids.add(scope);
  }

  const selectedNaids = [...naids];
  const queryTerms = searchTerms(search.q);
  const collectionResults = await mapLimit(selectedNaids, MAX_PARALLEL, (naid) =>
    fetchOne({ proxyUrl, apiKey, naraPath, naid, search })
  );

  const merged = new Map();
  for (const result of collectionResults) {
    for (const hit of result.hits) {
      const mapped = sourceRecord(hit, result.naid, queryTerms);
      if (!mapped.naid) continue;
      if (!merged.has(mapped.naid)) {
        merged.set(mapped.naid, mapped);
      } else {
        const existing = merged.get(mapped.naid);
        existing.matchedCollectionNaids = [
          ...new Set([...existing.matchedCollectionNaids, ...mapped.matchedCollectionNaids])
        ];
        existing.score = Math.max(existing.score, mapped.score);
      }
    }
  }

  const records = sortRecords([...merged.values()], search.sort);
  const chronological = [...records].sort(
    (a, b) =>
      (a.startDate || a.endDate || "9999").localeCompare(b.startDate || b.endDate || "9999") ||
      a.title.localeCompare(b.title)
  );
  const report = {
    generatedAt: new Date().toISOString(),
    tool: "NARA Scout",
    toolUrl: "https://therealjameswilson.github.io/nara-scout/",
    scoutSearchUrl: SCOUT_SEARCH_URL,
    query: search.q,
    sanitizedQuery: sanitizeQuery(search.q),
    years: { from: search.from, to: search.to },
    sort: search.sort,
    perCollectionLimit: search.perColl,
    perPage: search.perPage,
    scope: {
      requested: search.scope,
      resolvedCollectionCount: selectedNaids.length,
      bush41CollectionCount: bush41Collections.length,
      resolvedNaids: selectedNaids
    },
    collectionResults: collectionResults
      .map((result) => ({
        naid: result.naid,
        total: result.total,
        hits: result.hits.length,
        error: result.error || null
      }))
      .sort((a, b) => Number(b.total) - Number(a.total) || a.naid.localeCompare(b.naid)),
    totals: {
      uniqueRecords: records.length,
      totalHitsAcrossCollections: collectionResults.reduce((sum, result) => sum + Number(result.total || 0), 0),
      categories: countBy(records, "category"),
      levels: countBy(records, "level"),
      series: countBy(records, "series")
    },
    topChronologicalNaids: chronological.slice(0, 75).map((record) => record.naid),
    records
  };

  const outPath = outPathFromArgs();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        outPath,
        uniqueRecords: report.totals.uniqueRecords,
        totalHitsAcrossCollections: report.totals.totalHitsAcrossCollections,
        categories: report.totals.categories,
        errors: report.collectionResults.filter((result) => result.error).length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
