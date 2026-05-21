#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const OUT_PATH = path.join(__dirname, "..", "reports", "central-chronology-374000108-search.json");
const COLLECTION = {
  naid: "374000108",
  title: "European and Eurasian Directorate Central Chronological Files",
  shortName: "NSC European/Eurasian Central Chronology",
  url: "https://catalog.archives.gov/id/374000108"
};

const queryTerms = [
  "Soviet",
  "USSR",
  "Russia",
  "Russian",
  "Yeltsin",
  "Gorbachev",
  "Ukraine",
  "Kravchuk",
  "Belarus",
  "Byelarus",
  "Kazakhstan",
  "Nazarbayev",
  "Nunn-Lugar",
  "Lisbon",
  "START",
  "CFE",
  "nuclear",
  "FREEDOM Support",
  "Commonwealth of Independent States",
  "CIS",
  "Baltic",
  "Lithuania",
  "COCOM",
  "aid",
  "assistance"
];

function datePart(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value.logicalDate) return value.logicalDate;
  if (!value.year) return "";
  return `${String(value.year).padStart(4, "0")}-${String(value.month || 1).padStart(2, "0")}-${String(
    value.day || 1
  ).padStart(2, "0")}`;
}

function seriesAncestor(record) {
  return [...(record.ancestors || [])].reverse().find((ancestor) => ancestor.levelOfDescription === "series");
}

function collectionAncestor(record) {
  return [...(record.ancestors || [])].find((ancestor) => ancestor.levelOfDescription === "collection");
}

function digitalObject(record) {
  return (
    (record.digitalObjects || []).find((object) => /PDF/i.test(object.objectType || "")) ||
    (record.digitalObjects || [])[0] ||
    null
  );
}

function normalizedHit(record, query) {
  const object = digitalObject(record);
  const series = seriesAncestor(record);
  const collection = collectionAncestor(record);
  const restrictions = record.accessRestriction?.specificAccessRestrictions || [];
  return {
    naid: String(record.naId),
    title: record.title || "",
    date: datePart(record.coverageStartDate || record.inclusiveStartDate || record.productionDates?.[0]),
    endDate: datePart(record.coverageEndDate || record.inclusiveEndDate),
    localIdentifier: record.localIdentifier || "",
    level: record.levelOfDescription || "",
    catalogUrl: `https://catalog.archives.gov/id/${record.naId}`,
    pdfUrl: object?.objectUrl || "",
    objectFilename: object?.objectFilename || "",
    objectFileSize: object?.objectFileSize || null,
    digitalObjects: record.digitalObjects?.length || 0,
    accessStatus: record.accessRestriction?.status || "",
    useStatus: record.useRestriction?.status || "",
    restrictionTypes: restrictions.map((restriction) => restriction.restriction).filter(Boolean),
    seriesNaid: String(series?.naId || COLLECTION.naid),
    seriesTitle: series?.title || COLLECTION.title,
    collectionNaid: String(collection?.naId || ""),
    collectionTitle: collection?.title || "",
    matchedQueries: [query],
    ancestors: record.ancestors || []
  };
}

function mergeHit(existing, next) {
  for (const query of next.matchedQueries) {
    if (!existing.matchedQueries.includes(query)) existing.matchedQueries.push(query);
  }
  return existing;
}

async function searchCollection(query) {
  const url = new URL("https://catalog.archives.gov/proxy/records/search");
  url.searchParams.set("ancestorNaId", COLLECTION.naid);
  url.searchParams.set("availableOnline", "true");
  url.searchParams.set("limit", "100");
  url.searchParams.set("q", query);
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
  if (/^\s*</.test(text)) throw new Error(`HTML response for ${url}`);
  const json = JSON.parse(text);
  const hits = json.body?.hits?.hits || [];
  const total = json.body?.hits?.total?.value ?? json.body?.hits?.total ?? hits.length;
  return { total, records: hits.map((hit) => hit._source.record) };
}

async function main() {
  const byNaid = new Map();
  const queryLog = [];

  for (const query of queryTerms) {
    const { total, records } = await searchCollection(query);
    queryLog.push({ query, total, returned: records.length });
    for (const record of records) {
      const hit = normalizedHit(record, query);
      if (!hit.naid || !hit.title) continue;
      if (byNaid.has(hit.naid)) mergeHit(byNaid.get(hit.naid), hit);
      else byNaid.set(hit.naid, hit);
    }
  }

  const records = [...byNaid.values()].sort(
    (a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.title.localeCompare(b.title)
  );
  const byYear = records.reduce((acc, record) => {
    const year = (record.date || "").slice(0, 4) || "unknown";
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const likelyWithdrawalCount = records.filter(
    (record) => record.objectFileSize && Number(record.objectFileSize) < 3000
  ).length;

  const report = {
    generatedAt: new Date().toISOString(),
    source: "National Archives Catalog proxy search",
    collection: COLLECTION,
    queryTerms,
    queryLog,
    totalUniqueRecords: records.length,
    likelyWithdrawalOrPlaceholderPdfs: likelyWithdrawalCount,
    byYear,
    records
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        outPath: OUT_PATH,
        totalUniqueRecords: records.length,
        likelyWithdrawalOrPlaceholderPdfs: likelyWithdrawalCount,
        byYear,
        queryLog
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
