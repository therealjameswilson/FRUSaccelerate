#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "memcons.json");
const JS_PATH = path.join(__dirname, "..", "data", "memcons.js");
const MINE_REPORT_PATH = path.join(__dirname, "..", "reports", "frus31-cited-collections.json");
const SEED_REPORT_PATH = path.join(__dirname, "..", "reports", "frus31-cited-collections-seed.json");

const seedBatch = "frus31-cited-collections-2026-05-21";

const volumeIv = {
  id: "frus1989-92v04",
  title:
    "Foreign Relations of the United States, 1989-1992, Volume IV, Soviet Union, Russia, and Post-Soviet States: Policy",
  url: "https://history.state.gov/historicaldocuments/frus1989-92v04",
  status: "Being Researched"
};

const chapter = { number: 4, name: "Archive Leads" };

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function byChapterThenDate(a, b) {
  return (
    a.chapter.number - b.chapter.number ||
    (a.sortDate || a.date).localeCompare(b.sortDate || b.date) ||
    (a.sortOrder || 0) - (b.sortOrder || 0) ||
    a.title.localeCompare(b.title)
  );
}

function nextActionFor(source) {
  if (source.sourceClass === "state-central-file") {
    return "Mine Central Foreign Policy File P/D/N reels for NST Geneva traffic, START cables, Soviet policy guidance, and post-START policy spillover relevant to Volume IV.";
  }
  if (source.sourceClass === "state-lot") {
    return `Use FRUS XXXI citations as folder and document cues, then request or reconcile ${source.lot} material for Soviet/Russia policy memoranda, Baker briefing material, and arms-control follow-up.`;
  }
  if (source.sourceClass === "bush-vp") {
    return "Use the Vice Presidential records as Reagan-to-Bush continuity files for START, Soviet strategy, verification, and the inherited arms-control baseline.";
  }
  if (source.sourceClass === "bush-scowcroft") {
    return "Mine Scowcroft subfiles for presidential memoranda, Gates/Scowcroft decision notes, Soviet strategy papers, and attachments that explain policy choices outside Volume III conversations.";
  }
  if (source.sourceClass === "bush-nsc") {
    return "Search the Bush NSC cited file group for START, Soviet/Russia, NSR/NSD, arms-control, coup, republic, and nonproliferation policy records.";
  }
  return "Review the cited collection for Volume IV Soviet/Russia/FSU policy leads.";
}

function topicsFor(source) {
  const topics = ["FRUS XXXI", "START I", "Source mining"];
  if (source.lot) topics.push(source.lot);
  if (/Timbie/i.test(source.title)) topics.push("James Timbie");
  if (/Baker/i.test(source.title)) topics.push("James Baker");
  if (/Zoellick/i.test(source.title)) topics.push("Robert Zoellick");
  if (/Gates/i.test(source.title)) topics.push("Robert Gates");
  if (/Gordon/i.test(source.title)) topics.push("John Gordon");
  if (/Rice/i.test(source.title)) topics.push("Condoleezza Rice");
  if (/Russia Desk/i.test(source.title)) topics.push("Russia Desk");
  if (/Central Foreign Policy File/i.test(source.title)) topics.push("Central Foreign Policy File");
  return topics;
}

function sourceLead(source, index, report) {
  const citationText = source.documentCitationCount
    ? `${source.documentCitationCount} document-level source-note citation${source.documentCitationCount === 1 ? "" : "s"} in FRUS Volume XXXI`
    : "cited on the FRUS Volume XXXI Sources page";
  const catalogUrl = source.catalogUrl || source.sourcePageUrl || report.volume.sourcesUrl;
  const record = {
    id: `source-lead-${source.id}`,
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder: 1100 + index,
    type: "Source Lead",
    title: `${source.shortName} cited by FRUS XXXI`,
    documentTitle: source.title,
    participants: [source.repository, "FRUS Volume XXXI source base"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter,
    releaseStatus: `FRUS XXXI cited collection; ${citationText}`,
    catalogUrl,
    pdfUrl: "",
    digitalObjects: source.documentCitationCount || 0,
    source: {
      type: "FRUS-cited collection",
      title: source.title,
      shortName: source.shortName,
      url: catalogUrl,
      lot: source.lot || "",
      repository: source.repository
    },
    dateLine: "FRUS XXXI source mining, May 21, 2026",
    subjectLine: `${source.title}. ${citationText}.`,
    sourceNote: `Source lead mined from ${report.volume.title}, Sources page and document-level source notes. Collection: ${source.title}.`,
    frusSourceNote: `Source lead mined from ${report.volume.title}; verify individual files against repository citations before FRUS Volume IV selection.`,
    topics: topicsFor(source),
    potentialFrusDocument: false,
    countStatus: "FRUS XXXI cited source collection",
    nextAction: nextActionFor(source),
    extractionStatus:
      "Collection lead generated from the official FRUS Volume XXXI TEI source-note mining report; not an individual document selection.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    frus31SourceMining: {
      citedDocumentCount: source.documentCitationCount,
      citedDocuments: source.citedDocuments.slice(0, 12),
      sourceClass: source.sourceClass,
      sourcePageUrl: source.sourcePageUrl
    },
    seedBatch
  };
  if (source.naid) record.naid = source.naid;
  if (source.parentNaid) record.parentNaid = source.parentNaid;
  return record;
}

function summaryLead(report) {
  return {
    id: "source-lead-frus31-cited-collections",
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder: 1090,
    type: "Source Lead",
    title: "FRUS Volume XXXI cited collections mining",
    documentTitle: "FRUS 1989-1992 Volume XXXI START I cited collections mining",
    participants: ["Office of the Historian", "HistoryAtState FRUS TEI source"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter,
    releaseStatus: "Official FRUS source-note mining report generated",
    catalogUrl: report.volume.sourcesUrl,
    pdfUrl: "",
    digitalObjects: report.totals.documentsWithSourceNotes,
    source: {
      type: "FRUS source-note mining report",
      title: report.volume.title,
      shortName: "FRUS XXXI source-note mining",
      url: report.volume.url
    },
    dateLine: "FRUS XXXI source mining, May 21, 2026",
    subjectLine: `Parsed ${report.totals.documents} FRUS XXXI documents and ${report.totals.documentsWithSourceNotes} source-bearing records to identify ${report.totals.formalLeadSources} cited source collections for Volume IV mining.`,
    sourceNote: `Source: ${report.volume.title}, Sources page and document-level source notes, ${report.volume.url}.`,
    frusSourceNote:
      "Compiler source-mining report only; cite individual archival records after document selection.",
    topics: ["FRUS XXXI", "START I", "Source mining", "Cited collections"],
    potentialFrusDocument: false,
    countStatus: "FRUS source-note mining source lead",
    nextAction:
      "Use reports/frus31-cited-collections.json to prioritize State lot files, Bush VP files, Scowcroft subfiles, and Bush NSC staff files for Volume IV policy documents.",
    extractionStatus:
      "Summary lead for the collection-mining report; individual cited collections are staged as separate source leads.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    frus31SourceMining: {
      reportPath: MINE_REPORT_PATH,
      topCollections: Object.entries(report.citationCounts.byCollection).slice(0, 12)
    },
    seedBatch
  };
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const report = JSON.parse(fs.readFileSync(MINE_REPORT_PATH, "utf8"));
  const leadSources = report.leadSources.filter((source) => !source.alreadyRepresentedInProject);
  const seeded = [summaryLead(report), ...leadSources.map((source, index) => sourceLead(source, index, report))];
  const seededIds = new Set();

  for (const record of seeded) {
    if (seededIds.has(record.id)) throw new Error(`Duplicate seed id: ${record.id}`);
    seededIds.add(record.id);
  }

  const existing = records.filter((record) => record.seedBatch !== seedBatch && !seededIds.has(record.id));
  const existingNaids = new Set(existing.map((record) => String(record.naid || "")).filter(Boolean));
  const duplicateNaids = seeded.filter((record) => record.naid && existingNaids.has(String(record.naid)));
  if (duplicateNaids.length) {
    throw new Error(`Seed would duplicate existing NAIDs: ${duplicateNaids.map((record) => record.naid).join(", ")}`);
  }

  const combined = [...existing, ...seeded].sort(byChapterThenDate);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(combined, null, 2)}\n`);
  fs.writeFileSync(JS_PATH, `window.MEMCONS = ${JSON.stringify(combined, null, 2)};\n`);
  fs.writeFileSync(
    SEED_REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        seedBatch,
        sourceReport: MINE_REPORT_PATH,
        addedRecords: seeded.length,
        citedCollectionLeads: leadSources.length,
        totalRecords: combined.length,
        leadSources: leadSources.map((source) => ({
          id: source.id,
          shortName: source.shortName,
          lot: source.lot || "",
          documentCitationCount: source.documentCitationCount
        }))
      },
      null,
      2
    )}\n`
  );

  console.log(
    JSON.stringify(
      {
        seedBatch,
        addedRecords: seeded.length,
        citedCollectionLeads: leadSources.length,
        totalRecords: combined.length
      },
      null,
      2
    )
  );
}

main();
