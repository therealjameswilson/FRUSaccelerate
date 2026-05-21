#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "memcons.json");
const JS_PATH = path.join(__dirname, "..", "data", "memcons.js");
const SEARCH_REPORT_PATH = path.join(__dirname, "..", "reports", "central-chronology-374000108-search.json");
const SEED_REPORT_PATH = path.join(__dirname, "..", "reports", "central-chronology-374000108-seed.json");

const seedBatch = "central-chronology-374000108-2026-05-21";

const volumeIv = {
  id: "frus1989-92v04",
  title:
    "Foreign Relations of the United States, 1989-1992, Volume IV, Soviet Union, Russia, and Post-Soviet States: Policy",
  url: "https://history.state.gov/historicaldocuments/frus1989-92v04",
  status: "Being Researched"
};

const chapters = {
  soviet: { number: 2, name: "Soviet Reform and Arms Control Policy" },
  collapse: { number: 3, name: "Collapse and Republics Policy" },
  archives: { number: 4, name: "Archive Leads" }
};

const selected = [
  {
    naid: "470761671",
    chapter: chapters.soviet,
    subjectLine:
      "December 1989 central chronology folder for Malta follow-up, East-West change, U.S.-Soviet summit implementation, and early post-Malta tasking.",
    topics: ["Malta", "Gorbachev", "START", "U.S.-Soviet relations"],
    nextAction:
      "Request or review the full folder behind the placeholder PDF for Malta follow-up memoranda, Scowcroft/Rice tasking, and summit implementation notes."
  },
  {
    naid: "470761682",
    chapter: chapters.soviet,
    subjectLine:
      "March 1990 central chronology folder for Lithuania's independence declaration and the administration's Baltic nonrecognition/crisis posture.",
    topics: ["Lithuania", "Baltic states", "Gorbachev", "Self-determination"],
    nextAction:
      "Check the full folder for Baltic options papers, public-guidance drafts, and notes on managing Lithuania without derailing the Gorbachev channel."
  },
  {
    naid: "470761686",
    chapter: chapters.soviet,
    subjectLine:
      "April 1990 central chronology folder for Soviet pressure on Lithuania, allied consultations, and possible U.S. response options.",
    topics: ["Lithuania", "Soviet sanctions", "Allied consultations", "Baltic crisis"],
    nextAction:
      "Use as a control file for memoranda on Soviet economic pressure, sanctions options, and Bush consultations with Congress and allies."
  },
  {
    naid: "470761693",
    chapter: chapters.soviet,
    subjectLine:
      "May 1990 central chronology folder for Washington summit preparation, START/CFE, Soviet economic questions, and Lithuania spillover.",
    topics: ["Washington summit", "Gorbachev", "START", "CFE", "Lithuania"],
    nextAction:
      "Request the folder for summit briefing papers, economic-cooperation memoranda, arms-control talking points, and Baltic contingency material."
  },
  {
    naid: "470761735",
    chapter: chapters.soviet,
    subjectLine:
      "January 1991 central chronology folder for Soviet military action in Lithuania and the administration's Baltic crisis response.",
    topics: ["Lithuania", "Soviet military intervention", "Baltic crisis", "Crisis response"],
    nextAction:
      "Mine the folder for situation reports, sanctions recommendations, public lines, and presidential decision notes on Soviet force in Lithuania."
  },
  {
    naid: "470761765",
    chapter: chapters.soviet,
    subjectLine:
      "July 1991 central chronology folder for the Moscow summit, START signing, and the Kiev/Ukraine policy line before the August coup.",
    topics: ["Moscow summit", "START I", "Kiev", "Ukraine", "Kravchuk"],
    nextAction:
      "Use as the chronology control point for START signing, Kiev speech drafts, Ukraine guidance, and republic-policy memoranda."
  },
  {
    naid: "470761771",
    chapter: chapters.collapse,
    subjectLine:
      "August 1991 central chronology folder likely spanning the coup crisis, Yeltsin/Gorbachev contacts, Ukraine, Nazarbayev, and Baltic follow-up.",
    topics: ["August coup", "Yeltsin", "Gorbachev", "Ukraine", "Nazarbayev", "Baltic states"],
    nextAction:
      "Request the full folder and compare against August 19-22 Daily Files, NSC/DC crisis records, and Volume III telcon anchors."
  },
  {
    naid: "470761772",
    chapter: chapters.collapse,
    subjectLine:
      "Second August 1991 central chronology folder with heavy Yeltsin/Gorbachev/Ukraine/Kravchuk matching for coup and immediate post-coup policy.",
    topics: ["August coup", "Yeltsin", "Gorbachev", "Ukraine", "Kravchuk"],
    nextAction:
      "Use this as an additional August coup control folder for decision chronology, republic contacts, and post-coup recognition planning."
  },
  {
    naid: "470761776",
    chapter: chapters.collapse,
    subjectLine:
      "September 1991 central chronology folder for post-coup nuclear initiatives, START, CFE, Gorbachev/Yeltsin, and republic policy.",
    topics: ["Presidential Nuclear Initiatives", "START", "CFE", "Yeltsin", "Gorbachev"],
    nextAction:
      "Mine for memoranda behind the September 27 nuclear initiatives, Soviet/republic responses, and arms-control implementation planning."
  },
  {
    naid: "470761782",
    chapter: chapters.collapse,
    subjectLine:
      "November 1991 central chronology folder for food assistance, Yeltsin/Gorbachev/Kravchuk contacts, and the late-Soviet republic transition.",
    topics: ["Food assistance", "Yeltsin", "Gorbachev", "Kravchuk", "Republics policy"],
    nextAction:
      "Request the folder to connect food-aid decisions, republic debt/distribution questions, and dissolution planning."
  },
  {
    naid: "470761788",
    chapter: chapters.collapse,
    subjectLine:
      "December 1991 central chronology folder for Soviet dissolution, CIS recognition, Ukraine, Russia, nuclear control, and FREEDOM Support groundwork.",
    topics: ["Soviet dissolution", "CIS", "Recognition", "Ukraine", "Nuclear control"],
    nextAction:
      "Review with the December 25 Public Papers statements and Daily File packets for recognition, embassy transition, and nuclear assurance memoranda."
  },
  {
    naid: "470761794",
    chapter: chapters.collapse,
    subjectLine:
      "February 1992 central chronology folder for Russia/Ukraine/Kazakhstan, Nunn-Lugar, START, nuclear issues, CFE, and early post-Soviet assistance.",
    topics: ["Nunn-Lugar", "Ukraine", "Kazakhstan", "START", "Nuclear inheritance"],
    nextAction:
      "Use as a bridge between the Kravchuk/Nazarbayev visit files, Nunn-Lugar source copies, and early nuclear-removal policy."
  },
  {
    naid: "470761800",
    chapter: chapters.collapse,
    subjectLine:
      "March 1992 central chronology folder matching Nunn-Lugar, Lisbon, Kravchuk, Kazakhstan, START, and nuclear assistance terms.",
    topics: ["Nunn-Lugar", "Lisbon Protocol", "Ukraine", "Kazakhstan", "START", "Nuclear assistance"],
    nextAction:
      "Search for Lisbon Protocol preparation, Nunn-Lugar implementation, and Ukraine/Kazakhstan nuclear-withdrawal material."
  },
  {
    naid: "470761802",
    chapter: chapters.collapse,
    subjectLine:
      "April 1992 central chronology folder for the former Soviet Union aid package, FREEDOM Support legislation, START/CFE, and republic policy.",
    topics: ["FREEDOM Support Act", "Aid package", "START", "CFE", "Former Soviet Union"],
    nextAction:
      "Request the full file for administration strategy on assistance legislation, G-7/IMF coordination, and congressional messaging."
  },
  {
    naid: "470761810",
    chapter: chapters.collapse,
    subjectLine:
      "May 1992 central chronology folder for Kravchuk and Nazarbayev visit month, Lisbon/START protocol, nuclear inheritance, and republic relations.",
    topics: ["Kravchuk", "Nazarbayev", "Lisbon Protocol", "START", "Nuclear inheritance"],
    nextAction:
      "Use alongside Kravchuk/Nazarbayev memcons and Daily Files to identify missing policy memoranda, briefing tabs, and follow-up tasking."
  },
  {
    naid: "470761817",
    chapter: chapters.collapse,
    subjectLine:
      "June 1992 central chronology folder for the Yeltsin summit package, Lisbon/START, Nunn-Lugar, strategic arms, nuclear safety, and COCOM.",
    topics: ["Yeltsin", "START II", "Nunn-Lugar", "COCOM", "Nuclear safety"],
    nextAction:
      "Mine for Yeltsin summit implementation material, weapons-safeguarding agreement follow-up, defense conversion, and export-control policy."
  },
  {
    naid: "470761823",
    chapter: chapters.collapse,
    subjectLine:
      "August 1992 central chronology folder for Nunn-Lugar, Ukraine, Belarus, Kazakhstan, Yeltsin, nuclear issues, and post-Lisbon implementation.",
    topics: ["Nunn-Lugar", "Ukraine", "Belarus", "Kazakhstan", "Nuclear implementation"],
    nextAction:
      "Request the full folder for post-Lisbon implementation, assistance authorities, and non-Russian republic nuclear-removal follow-up."
  },
  {
    naid: "470761829",
    chapter: chapters.collapse,
    subjectLine:
      "October 1992 central chronology folder for Nunn-Lugar, Lisbon/START, FREEDOM Support Act signing, Ukraine, and nuclear implementation.",
    topics: ["FREEDOM Support Act", "Nunn-Lugar", "Lisbon Protocol", "START", "Ukraine"],
    nextAction:
      "Use as the NSC chronology control for FREEDOM Support signing and late-1992 nuclear assistance implementation."
  },
  {
    naid: "470761837",
    chapter: chapters.collapse,
    subjectLine:
      "December 1992 central chronology folder for START II, Nunn-Lugar, Lisbon/START ratification, Ukraine, Yeltsin, and transition handoff.",
    topics: ["START II", "Nunn-Lugar", "Lisbon Protocol", "Yeltsin", "Transition"],
    nextAction:
      "Request the folder for final Bush administration START II, Nunn-Lugar, Ukraine nuclear, and transition memoranda."
  }
];

function byChapterThenDate(a, b) {
  return (
    a.chapter.number - b.chapter.number ||
    (a.sortDate || a.date).localeCompare(b.sortDate || b.date) ||
    (a.sortOrder || 0) - (b.sortOrder || 0) ||
    a.title.localeCompare(b.title)
  );
}

function monthYear(date) {
  const value = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(value);
}

function sourceLead(report) {
  return {
    id: "source-lead-central-chronology-374000108-search",
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder: 1300,
    type: "Source Lead",
    title: "NSC European/Eurasian Central Chronology collection search",
    documentTitle: "European and Eurasian Directorate Central Chronological Files, NAID 374000108",
    participants: ["National Security Council", "European and Eurasian Directorate", "George Bush Library"],
    countries: ["United States", "Soviet Union", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    chapter: chapters.archives,
    releaseStatus: "Collection-specific NARA Catalog search report generated",
    catalogUrl: report.collection.url,
    pdfUrl: "",
    digitalObjects: report.totalUniqueRecords,
    source: {
      type: "Series",
      naid: report.collection.naid,
      title: report.collection.title,
      shortName: report.collection.shortName,
      url: report.collection.url
    },
    dateLine: "NARA Catalog search, May 21, 2026",
    subjectLine: `Searched NAID ${report.collection.naid} and harvested ${report.totalUniqueRecords} unique online file units from the NSC European/Eurasian central chronology series.`,
    sourceNote: `Source: National Archives Catalog, ${report.collection.title}, NAID ${report.collection.naid}. Collection-specific search report: reports/central-chronology-374000108-search.json.`,
    frusSourceNote:
      "Compiler source lead only; cite individual file units and full folder contents after Bush Library review or MDR/FOIA reconciliation.",
    topics: ["NSC chronology", "European and Eurasian Directorate", "NARA Catalog search", "Source mining"],
    potentialFrusDocument: false,
    countStatus: "Central chronology source lead",
    nextAction:
      "Use reports/central-chronology-374000108-search.json to request high-value file units and reconcile placeholder PDFs with full folder contents at the Bush Library.",
    extractionStatus:
      "The Catalog returns online PDFs for the file units, but every harvested object is about 1.2 KB, indicating placeholder or withdrawal-sheet PDFs rather than fully extracted folder content.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    centralChronologySearch: {
      reportPath: SEARCH_REPORT_PATH,
      totalUniqueRecords: report.totalUniqueRecords,
      likelyWithdrawalOrPlaceholderPdfs: report.likelyWithdrawalOrPlaceholderPdfs,
      byYear: report.byYear
    },
    seedBatch
  };
}

function chronologyRecord(selection, hit, index) {
  const source = {
    type: "Series",
    naid: hit.seriesNaid,
    title: hit.seriesTitle,
    shortName: "NSC European/Eurasian Central Chronology",
    url: `https://catalog.archives.gov/id/${hit.seriesNaid}`
  };
  return {
    id: `central-chronology-${hit.date}-${hit.localIdentifier}-${hit.naid}`,
    date: hit.date,
    sortDate: hit.date,
    sortOrder: index + 1,
    type: "Policy Lead",
    title: hit.title,
    documentTitle: hit.title,
    participants: ["National Security Council", "European and Eurasian Directorate"],
    countries: ["United States", "Soviet Union", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    chapter: selection.chapter,
    releaseStatus: "Catalog file-unit lead; online PDF appears to be a placeholder or withdrawal sheet",
    accessRestrictionStatus: hit.accessStatus,
    naid: hit.naid,
    catalogUrl: hit.catalogUrl,
    pdfUrl: hit.pdfUrl,
    localIdentifier: hit.localIdentifier,
    objectFilename: hit.objectFilename,
    digitalObjects: hit.digitalObjects,
    source,
    dateLine: `${monthYear(hit.date)} file unit`,
    subjectLine: selection.subjectLine,
    sourceNote: `Source: National Archives Catalog, ${hit.seriesTitle}, ${hit.localIdentifier}, NAID ${hit.naid}. Digital object: ${hit.objectFilename}.`,
    frusSourceNote: `Source: George H.W. Bush Presidential Library, National Security Council, European and Eurasian Directorate Central Chronological Files, ${hit.localIdentifier}, NAID ${hit.naid}.`,
    topics: selection.topics,
    potentialFrusDocument: true,
    countStatus: "Central chronology file-unit lead",
    nextAction: selection.nextAction,
    extractionStatus:
      "Selected from the NAID 374000108 collection-specific search. The Catalog PDF is likely a small placeholder or withdrawal sheet, so full folder review or MDR/FOIA reconciliation is required before document extraction.",
    volumeRole: "volume-iv-policy-candidate",
    volumeStatus: "Volume IV research candidate",
    frusVolume: volumeIv,
    centralChronologySearch: {
      matchedQueries: hit.matchedQueries,
      objectFileSize: hit.objectFileSize,
      searchReport: SEARCH_REPORT_PATH
    },
    seedBatch
  };
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const report = JSON.parse(fs.readFileSync(SEARCH_REPORT_PATH, "utf8"));
  const byNaid = new Map(report.records.map((record) => [record.naid, record]));

  const seededRecords = selected.map((selection, index) => {
    const hit = byNaid.get(selection.naid);
    if (!hit) throw new Error(`No central chronology hit for NAID ${selection.naid}`);
    return chronologyRecord(selection, hit, index);
  });
  const seeded = [sourceLead(report), ...seededRecords];
  const seededIds = new Set();
  for (const record of seeded) {
    if (seededIds.has(record.id)) throw new Error(`Duplicate seed id: ${record.id}`);
    seededIds.add(record.id);
  }

  const existingNaids = new Set(
    records
      .filter((record) => record.seedBatch !== seedBatch)
      .map((record) => String(record.naid || ""))
      .filter(Boolean)
  );
  const duplicates = seededRecords.filter((record) => existingNaids.has(String(record.naid)));
  if (duplicates.length) {
    throw new Error(`Seed would duplicate existing NAIDs: ${duplicates.map((record) => record.naid).join(", ")}`);
  }

  const existing = records.filter((record) => record.seedBatch !== seedBatch && !seededIds.has(record.id));
  const combined = [...existing, ...seeded].sort(byChapterThenDate);

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(combined, null, 2)}\n`);
  fs.writeFileSync(JS_PATH, `window.MEMCONS = ${JSON.stringify(combined, null, 2)};\n`);
  fs.writeFileSync(
    SEED_REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        seedBatch,
        searchReport: SEARCH_REPORT_PATH,
        addedRecords: seeded.length,
        sourceLeads: 1,
        selectedFileUnits: seededRecords.length,
        totalRecords: combined.length,
        selectedNaids: seededRecords.map((record) => record.naid)
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
        selectedFileUnits: seededRecords.length,
        totalRecords: combined.length
      },
      null,
      2
    )
  );
}

main();
