#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "memcons.json");
const JS_PATH = path.join(__dirname, "..", "data", "memcons.js");
const SCOUT_REPORT_PATH = path.join(__dirname, "..", "reports", "nara-scout-russia-fsu-search.json");
const SEED_REPORT_PATH = path.join(__dirname, "..", "reports", "nara-scout-russia-fsu-seed.json");

const seedBatch = "nara-scout-russia-fsu-2026-05-21";

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

const selectedScout = [
  {
    naid: "286185811",
    date: "1990-08-09",
    type: "Policy Lead",
    participants: ["Michael J. Boskin", "Council of Economic Advisers", "Interagency policy process"],
    countries: ["United States", "Soviet Union"],
    subjectLine:
      "Interagency meeting file for the IMF-led study of the Soviet economy, useful for reconstructing the Bush administration's economic-reform and assistance baseline.",
    topics: ["Soviet economy", "IMF-led study", "Economic assistance", "Trade"],
    nextAction:
      "Review PDF for meeting agenda, memoranda, participant lists, and analytic papers on Soviet economic reform."
  },
  {
    naid: "470417302",
    date: "1991-08-20",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Soviet Union", "Russia"],
    subjectLine:
      "Presidential Daily File packet for the second day of the Soviet coup crisis, a control-file lead for White House decision materials and call preparation.",
    topics: ["August coup", "Presidential Daily Files", "Crisis management"],
    nextAction:
      "Open the Daily File PDF and extract Soviet coup memoranda, briefing notes, call sheets, and routing evidence."
  },
  {
    naid: "470417304",
    date: "1991-08-21",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Soviet Union", "Russia"],
    subjectLine:
      "Presidential Daily File packet for the day of the Bush-Yeltsin and Bush-Gorbachev crisis contacts during the coup collapse.",
    topics: ["August coup", "Yeltsin", "Gorbachev", "Presidential Daily Files"],
    nextAction:
      "Use as a file-control bridge between the Volume III telcons and the policy memoranda surrounding recognition, aid, and coup response."
  },
  {
    naid: "470417306",
    date: "1991-08-22",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Soviet Union", "Russia"],
    subjectLine:
      "Immediate post-coup Presidential Daily File packet for follow-up policy, public messaging, and republic-transition tracking.",
    topics: ["August coup", "Post-coup policy", "Presidential Daily Files"],
    nextAction:
      "Extract post-coup memoranda and compare against NSC/DC 300, 307, and 308 policy files."
  },
  {
    naid: "470761786",
    date: "1991-12-01",
    dateLine: "December 1991 file unit",
    type: "Policy Lead",
    participants: ["National Security Council", "European and Eurasian Directorate"],
    countries: ["United States", "Soviet Union", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    subjectLine:
      "NSC European and Eurasian Directorate central chronology file for the month of the USSR's dissolution and the emergence of the CIS.",
    topics: ["CIS", "Recognition", "Soviet dissolution", "NSC chronology"],
    nextAction:
      "Review the month file for recognition options, republic-policy memoranda, assistance planning, and presidential talking points."
  },
  {
    naid: "470417516",
    date: "1991-12-26",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Soviet Union", "Russia"],
    subjectLine:
      "Presidential Daily File packet for the first full day after Gorbachev's resignation and the end of the Soviet Union.",
    topics: ["Soviet dissolution", "Russia recognition", "Presidential Daily Files"],
    nextAction:
      "Check for memoranda and call materials documenting U.S. policy immediately after the Soviet state ceased to exist."
  },
  {
    naid: "470439278",
    date: "1992-01-29",
    type: "Policy Memorandum",
    participants: ["Rear Admiral Jonathan Howe", "National Security Council", "George H. W. Bush"],
    countries: ["United States", "Russia"],
    subjectLine:
      "Pre-briefing file for Bush's January 1992 Yeltsin meeting, tying the new Russia channel to assistance, reform, and nuclear-security questions.",
    topics: ["Yeltsin", "Russia policy", "Camp David", "Briefing materials"],
    nextAction:
      "Extract the briefing memorandum, tabs, and any guidance for the Bush-Yeltsin Camp David meeting."
  },
  {
    naid: "470761792",
    date: "1992-01-01",
    dateLine: "January 1992 file unit",
    type: "Policy Lead",
    participants: ["National Security Council", "European and Eurasian Directorate"],
    countries: ["United States", "Russia", "Former Soviet Union"],
    subjectLine:
      "NSC European and Eurasian Directorate central chronology file for the first month of formal post-Soviet Russia/FSU policy.",
    topics: ["Russia", "Former Soviet Union", "NSC chronology", "Economic assistance"],
    nextAction:
      "Review for memoranda on recognition implementation, embassy relationships, assistance, and early Russia policy."
  },
  {
    naid: "428082171",
    date: "1992-04-28",
    type: "Policy Memorandum",
    participants: ["George H. W. Bush", "Yegor Gaydar", "National Security Council"],
    countries: ["United States", "Russia"],
    subjectLine:
      "Memorandum of meeting with Russia's first deputy prime minister on reform politics, economic assistance, and the administration's Russia channel.",
    topics: ["Gaidar", "Gaydar", "Russia reform", "Economic assistance"],
    nextAction:
      "Use as policy-context contact material, not as a duplicate Volume III anchor; extract references to assistance and reform commitments."
  },
  {
    naid: "470417758",
    date: "1992-05-06",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Ukraine", "Russia"],
    subjectLine:
      "Presidential Daily File packet for President Kravchuk's visit, a key control file for Ukraine recognition, nuclear inheritance, and assistance policy.",
    topics: ["Ukraine", "Kravchuk", "Nuclear inheritance", "Presidential Daily Files"],
    nextAction:
      "Extract Ukraine visit briefing memoranda and compare against Nunn-Lugar, START, and security-assurance materials."
  },
  {
    naid: "428082201",
    date: "1992-05-19",
    type: "Policy Memorandum",
    participants: ["George H. W. Bush", "Nursultan Nazarbayev", "National Security Council"],
    countries: ["United States", "Kazakhstan", "Russia"],
    subjectLine:
      "Memorandum of meeting with Kazakhstan's president, important for republic policy, nuclear inheritance, assistance, and post-Soviet regional alignment.",
    topics: ["Kazakhstan", "Nazarbayev", "Nuclear inheritance", "CIS"],
    nextAction:
      "Extract the meeting memorandum and identify passages on nuclear weapons, Russia, economic assistance, and recognition."
  },
  {
    naid: "470417786",
    date: "1992-05-19",
    sortOrder: 1,
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Kazakhstan", "Russia"],
    subjectLine:
      "Presidential Daily File packet for the Nazarbayev meeting, useful for briefing tabs and follow-up material around Kazakhstan policy.",
    topics: ["Kazakhstan", "Nazarbayev", "Presidential Daily Files", "Nuclear inheritance"],
    nextAction:
      "Review alongside the released Nazarbayev meeting memorandum for briefing tabs and implementation follow-up."
  },
  {
    naid: "470761811",
    date: "1992-05-01",
    dateLine: "May 1992 file unit",
    type: "Policy Lead",
    participants: ["National Security Council", "European and Eurasian Directorate"],
    countries: ["United States", "Russia", "Ukraine", "Kazakhstan"],
    subjectLine:
      "NSC European and Eurasian Directorate central chronology file covering the Ukraine and Kazakhstan visit month.",
    topics: ["Ukraine", "Kazakhstan", "Russia", "NSC chronology"],
    nextAction:
      "Search the file unit for Kravchuk, Nazarbayev, Nunn-Lugar, START, and republic-assistance memoranda."
  },
  {
    naid: "428082281",
    date: "1992-07-08",
    type: "Policy Memorandum",
    participants: ["George H. W. Bush", "Boris Yeltsin", "G-7 heads of delegation"],
    countries: ["United States", "Russia", "Germany"],
    subjectLine:
      "Heads-of-delegation meeting with Yeltsin at the Munich Economic Summit, bridging Russian reform, Western assistance, and G-7 coordination.",
    topics: ["Yeltsin", "Munich Economic Summit", "G-7", "Russia assistance"],
    nextAction:
      "Extract the meeting memorandum and align it with NSC/DC and economic-assistance files for July 1992."
  },
  {
    naid: "285792663",
    date: "1992-01-01",
    sortOrder: 2,
    dateLine: "1992 file unit",
    type: "Policy Memorandum",
    participants: ["John O'Neil", "Office of Science and Technology Policy"],
    countries: ["United States", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    subjectLine:
      "OSTP figures on 1992 science and technology cooperation with former Soviet republics, useful for assistance and technical-cooperation policy context.",
    topics: ["Science and technology", "Former Soviet republics", "Assistance", "OSTP"],
    nextAction:
      "Extract tables and memoranda that document technical cooperation with Russia and the newly independent states."
  },
  {
    naid: "285792683",
    date: "1992-05-06",
    sortOrder: 1,
    dateLine: "1992 Ukraine file unit",
    type: "Policy Lead",
    participants: ["John O'Neil", "Office of Science and Technology Policy"],
    countries: ["United States", "Ukraine"],
    subjectLine:
      "OSTP Ukraine subject file, a likely lead for technical cooperation, nuclear safety, and post-Soviet scientific-assistance material.",
    topics: ["Ukraine", "Science and technology", "Nuclear safety", "OSTP"],
    nextAction:
      "Review the PDF for Ukraine-specific memoranda and cross-reference the Kravchuk visit and Nunn-Lugar files."
  },
  {
    naid: "285792649",
    date: "1992-10-07",
    type: "Policy Lead",
    participants: ["John O'Neil", "Office of Science and Technology Policy", "Deputy Minister Yakobashvili"],
    countries: ["United States", "Russia"],
    subjectLine:
      "OSTP meeting file with Russia's science leadership, a late-1992 lead on bilateral science cooperation and technology policy.",
    topics: ["Russia", "Science and technology", "Yakobashvili", "OSTP"],
    nextAction:
      "Extract meeting notes and memoranda and compare with the broader U.S.-Russia science and technology relationship files."
  },
  {
    naid: "470761838",
    date: "1992-12-01",
    dateLine: "December 1992 file unit",
    type: "Policy Lead",
    participants: ["National Security Council", "European and Eurasian Directorate"],
    countries: ["United States", "Russia", "Ukraine", "Former Soviet Union"],
    subjectLine:
      "NSC European and Eurasian Directorate central chronology file for the final Bush administration month of Russia/FSU policy.",
    topics: ["Transition", "Russia", "Ukraine", "NSC chronology"],
    nextAction:
      "Review for handoff memoranda, late assistance decisions, START II material, and Ukraine nuclear-policy follow-up."
  },
  {
    naid: "470418237",
    date: "1992-12-09",
    type: "Policy Lead",
    participants: ["George H. W. Bush", "White House Office of the President"],
    countries: ["United States", "Russia", "Former Soviet Union"],
    subjectLine:
      "Presidential Daily File packet from the transition period after the election, useful for final Bush administration Russia/FSU policy actions.",
    topics: ["Transition", "Presidential Daily Files", "Russia", "Former Soviet Union"],
    nextAction:
      "Open the Daily File PDF for final memoranda, briefing notes, and transition handoff evidence."
  }
];

function catalogUrl(naid) {
  return `https://catalog.archives.gov/id/${naid}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 88);
}

function byChapterThenDate(a, b) {
  return (
    a.chapter.number - b.chapter.number ||
    (a.sortDate || a.date).localeCompare(b.sortDate || b.date) ||
    (a.sortOrder || 0) - (b.sortOrder || 0) ||
    a.title.localeCompare(b.title)
  );
}

function dateLine(date) {
  const value = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function shortSourceTitle(title) {
  return title
    .replace(/^H-Files - /, "")
    .replace(/^Records of the /, "")
    .replace(/\s*\(George H\. W\. Bush Administration\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceFromScout(hit) {
  const sourceNaid = hit.seriesNaid || hit.collectionNaid || hit.naid;
  const title = hit.series || hit.collection || hit.title;
  return {
    type: hit.series ? "Series" : "File Unit",
    naid: sourceNaid,
    title,
    shortName: shortSourceTitle(title),
    url: catalogUrl(sourceNaid)
  };
}

function releaseStatus(hit) {
  if (!hit.digitalUrl) return "Catalog lead; digital object not detected by Scout";
  if (hit.category === "declassified") return "PDF available; NARA Scout classified as declassified";
  if (hit.category === "withdrawal") {
    return "PDF available; Catalog metadata still carries withdrawal/FOIA/PRA restriction flags";
  }
  return `PDF available; NARA Scout category ${hit.category}`;
}

function sourceNote(hit, source) {
  const objectNote = hit.objectFilename ? ` Digital object: ${hit.objectFilename}.` : "";
  const local = hit.localIdentifier ? `${hit.localIdentifier}, ` : "";
  return `Source: National Archives Catalog, ${source.title}, ${local}NAID ${hit.naid}.${objectNote}`;
}

function scoutPolicyRecord(selection, hit, index) {
  const source = sourceFromScout(hit);
  const chapter = selection.date >= "1991-08-19" ? chapters.collapse : chapters.soviet;
  const id = `scout-${selection.date}-${slugify(hit.title)}-${hit.naid}`;
  return {
    id,
    date: selection.date,
    sortDate: selection.date,
    sortOrder: selection.sortOrder || index,
    type: selection.type,
    title: hit.title,
    documentTitle: hit.title,
    participants: selection.participants,
    countries: selection.countries,
    chapter,
    releaseStatus: releaseStatus(hit),
    accessRestrictionStatus: hit.category,
    naid: hit.naid,
    catalogUrl: hit.catalogUrl || catalogUrl(hit.naid),
    pdfUrl: hit.digitalUrl,
    localIdentifier: hit.localIdentifier,
    objectFilename: hit.objectFilename,
    digitalObjects: hit.digitalObjects || (hit.digitalUrl ? 1 : 0),
    source,
    dateLine: selection.dateLine || dateLine(selection.date),
    subjectLine: selection.subjectLine,
    sourceNote: sourceNote(hit, source),
    frusSourceNote: `Source: George H.W. Bush Presidential Library, ${source.title}, ${hit.localIdentifier || "file unit"}, NAID ${hit.naid}.`,
    topics: selection.topics,
    potentialFrusDocument: true,
    countStatus:
      selection.type === "Policy Memorandum"
        ? "Candidate Volume IV policy memorandum"
        : "Scout-selected Volume IV policy lead",
    nextAction: selection.nextAction,
    extractionStatus:
      "Selected from the exact NARA Scout Russia/FSU query supplied by the user; PDF/link verified in the Scout harvest report and staged for compiler extraction.",
    volumeRole: "volume-iv-policy-candidate",
    volumeStatus: "Volume IV research candidate",
    frusVolume: volumeIv,
    scoutSearchUrl:
      "https://therealjameswilson.github.io/nara-scout/#q=%28Soviet+OR+USSR+OR+Russia+OR+Yeltsin+OR+Gorbachev+OR+Ukraine+OR+Belarus+OR+Kazakhstan+OR+%22Nunn-Lugar%22+OR+Lisbon%29&from=1989&to=1993&sort=relevance&perColl=25&perPage=50&scope=bush41%2C2163580",
    seedBatch
  };
}

function scoutSourceLead(report, sortOrder) {
  return {
    id: "source-lead-nara-scout-russia-fsu-search",
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder,
    type: "Source Lead",
    title: "NARA Scout Russia/FSU broad search",
    documentTitle: "NARA Scout Russia/FSU broad search over Bush 41 collections",
    participants: ["National Archives Catalog", "George H. W. Bush Presidential Library"],
    countries: ["United States", "Soviet Union", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    chapter: chapters.archives,
    releaseStatus: "NARA Scout search report generated",
    catalogUrl: report.scoutSearchUrl,
    pdfUrl: "",
    digitalObjects: report.totals.uniqueRecords,
    source: {
      type: "Research Tool",
      title: "NARA Scout",
      shortName: "NARA Scout",
      url: report.toolUrl
    },
    dateLine: "Scout search, May 21, 2026",
    subjectLine: `Exact Scout query harvested ${report.totals.uniqueRecords} unique records from ${report.scope.resolvedCollectionCount} Bush 41 collection scopes; ${report.totals.categories.declassified || 0} were classified as declassified and ${report.totals.categories.withdrawal || 0} as withdrawal/MDR leads.`,
    sourceNote: `Source: NARA Scout search report generated from ${report.scoutSearchUrl}.`,
    frusSourceNote:
      "Compiler research lead only; cite individual National Archives Catalog records after document selection.",
    topics: ["NARA Scout", "Russia/FSU", "MDR leads", "Digital objects"],
    potentialFrusDocument: false,
    countStatus: "Scout search source lead",
    nextAction:
      "Use reports/nara-scout-russia-fsu-search.json to triage declassified PDFs, withdrawal sheets, and MDR candidates by NAID.",
    extractionStatus:
      "Broad search report preserved separately from curated document selections to keep the working chronology readable.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    seedBatch
  };
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const report = JSON.parse(fs.readFileSync(SCOUT_REPORT_PATH, "utf8"));
  const byNaid = new Map(report.records.map((record) => [record.naid, record]));
  const seededRecords = selectedScout.map((selection, index) => {
    const hit = byNaid.get(selection.naid);
    if (!hit) throw new Error(`No Scout result for NAID ${selection.naid}`);
    return scoutPolicyRecord(selection, hit, index + 1);
  });

  const seeded = [scoutSourceLead(report, 900), ...seededRecords];
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
  const duplicates = seededRecords.filter((record) => record.naid && existingNaids.has(record.naid));
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
        scoutReport: SCOUT_REPORT_PATH,
        scoutSearchUrl: report.scoutSearchUrl,
        scoutTotals: report.totals,
        addedRecords: seeded.length,
        sourceLeads: 1,
        policyMemoranda: seededRecords.filter((record) => record.type === "Policy Memorandum").length,
        policyLeads: seededRecords.filter((record) => record.type === "Policy Lead").length,
        selectedNaids: seededRecords.map((record) => record.naid),
        totalRecords: combined.length
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
        policyMemoranda: seededRecords.filter((record) => record.type === "Policy Memorandum").length,
        policyLeads: seededRecords.filter((record) => record.type === "Policy Lead").length,
        totalRecords: combined.length
      },
      null,
      2
    )
  );
}

main();
