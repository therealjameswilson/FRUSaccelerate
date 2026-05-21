const fs = require("fs");
const path = require("path");

const OUT_PATH = path.join(__dirname, "..", "reports", "essential-collections-harvest.json");

const collections = [
  { naid: "4522156", shortName: "Scowcroft Papers", catalogUrl: "https://catalog.archives.gov/id/4522156" },
  { naid: "595141", shortName: "Presidential Daily Files", catalogUrl: "https://catalog.archives.gov/id/595141" },
  { naid: "312293887", shortName: "NSC Meeting Files", catalogUrl: "https://catalog.archives.gov/id/312293887" },
  { naid: "312294079", shortName: "NSC/DC Meetings", catalogUrl: "https://catalog.archives.gov/id/312294079" },
  { naid: "312294094", shortName: "NSC/DC Follow-up", catalogUrl: "https://catalog.archives.gov/id/312294094" },
  { naid: "313189297", shortName: "NSR Files", catalogUrl: "https://catalog.archives.gov/id/313189297" },
  { naid: "313189290", shortName: "NSD Files", catalogUrl: "https://catalog.archives.gov/id/313189290" },
  { naid: "348937136", shortName: "IF Transition", catalogUrl: "https://catalog.archives.gov/id/348937136" }
];

const queryTerms = [
  "Soviet",
  "USSR",
  "Russia",
  "Russian",
  "Yeltsin",
  "Gorbachev",
  "Former Soviet Union",
  "Newly Independent States",
  "NIS",
  "Ukraine",
  "Kravchuk",
  "Baltic",
  "Lithuania",
  "START",
  "CFE",
  "arms control",
  "nonproliferation",
  "nuclear",
  "COCOM",
  "emigration",
  "economic initiatives"
];

function logicalDate(record) {
  return (
    record.coverageStartDate?.logicalDate ||
    record.productionDates?.[0]?.logicalDate ||
    record.inclusiveStartDate?.logicalDate ||
    ""
  );
}

function seriesAncestor(record) {
  return [...(record.ancestors || [])].reverse().find((ancestor) => ancestor.levelOfDescription === "series");
}

function digitalObject(record) {
  return (record.digitalObjects || []).find((object) => /PDF/i.test(object.objectType || "")) || record.digitalObjects?.[0];
}

function normalizedHit(collection, record, query) {
  const object = digitalObject(record);
  const series = seriesAncestor(record);
  return {
    naid: String(record.naId),
    title: record.title,
    date: logicalDate(record),
    endDate: record.coverageEndDate?.logicalDate || "",
    localIdentifier: record.localIdentifier || "",
    collectionNaid: collection.naid,
    collection: collection.shortName,
    collectionUrl: collection.catalogUrl,
    seriesNaid: series?.naId ? String(series.naId) : "",
    seriesTitle: series?.title || collection.shortName,
    catalogUrl: `https://catalog.archives.gov/id/${record.naId}`,
    pdfUrl: object?.objectUrl || "",
    objectFilename: object?.objectFilename || "",
    objectFileSize: object?.objectFileSize || null,
    accessStatus: record.accessRestriction?.status || "",
    useStatus: record.useRestriction?.status || "",
    level: record.levelOfDescription || "",
    matchedQueries: [query]
  };
}

function mergeHit(existing, next) {
  for (const query of next.matchedQueries) {
    if (!existing.matchedQueries.includes(query)) existing.matchedQueries.push(query);
  }
  return existing;
}

async function searchCollection(collection, query) {
  const url = new URL("https://catalog.archives.gov/proxy/records/search");
  url.searchParams.set("ancestorNaId", collection.naid);
  url.searchParams.set("availableOnline", "true");
  url.searchParams.set("rows", "100");
  url.searchParams.set("q", query);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  const json = await response.json();
  return json.body?.hits?.hits?.map((hit) => hit._source.record) || [];
}

async function main() {
  const byNaid = new Map();
  const queryLog = [];

  for (const collection of collections) {
    for (const query of queryTerms) {
      const records = await searchCollection(collection, query);
      queryLog.push({ collection: collection.shortName, collectionNaid: collection.naid, query, hits: records.length });
      for (const record of records) {
        const hit = normalizedHit(collection, record, query);
        if (!hit.naid || !hit.title || !hit.pdfUrl) continue;
        if (byNaid.has(hit.naid)) mergeHit(byNaid.get(hit.naid), hit);
        else byNaid.set(hit.naid, hit);
      }
    }
  }

  const records = [...byNaid.values()].sort(
    (a, b) =>
      (a.date || "9999").localeCompare(b.date || "9999") ||
      a.collection.localeCompare(b.collection) ||
      a.title.localeCompare(b.title)
  );

  const report = {
    generatedAt: new Date().toISOString(),
    source: "National Archives Catalog proxy search",
    collections,
    queryTerms,
    queryLog,
    totalRecords: records.length,
    records
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  const byCollection = records.reduce((counts, record) => {
    counts[record.collection] = (counts[record.collection] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({ outPath: OUT_PATH, totalRecords: records.length, byCollection }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
