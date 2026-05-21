#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const VOLUME_ID = "frus1989-92v31";
const VOLUME_URL = "https://history.state.gov/historicaldocuments/frus1989-92v31";
const SOURCES_URL = `${VOLUME_URL}/sources`;
const TEI_URL = `https://raw.githubusercontent.com/HistoryAtState/frus/master/volumes/${VOLUME_ID}.xml`;
const OUT_PATH = path.join(__dirname, "..", "reports", "frus31-cited-collections.json");

const formalLeadSources = [
  {
    id: "frus31-central-foreign-policy-file",
    repository: "Department of State",
    title: "Central Foreign Policy File, P/D/N reels",
    shortName: "Central Foreign Policy File",
    sourceClass: "state-central-file",
    description:
      "Cable traffic, memoranda of conversation, letters, briefing papers, and memoranda to principals; especially NST Geneva traffic for START."
  },
  {
    id: "frus31-lot-89d149",
    repository: "Department of State",
    lot: "89D149",
    title:
      "Policy Planning Staff, Memoranda/Correspondence from the Director of the Policy Planning Staff to the Secretary and Other Seventh Floor Principals",
    shortName: "Lot 89D149, S/P director memoranda",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-89d250",
    repository: "Department of State",
    lot: "89D250",
    title:
      "Executive Secretariat, FAIM/IS Files, Miscellaneous Papers Screened from the Subject Files of Secretary Shultz and his Assistant Charles Hill Upon the Secretary's Resignation",
    shortName: "Lot 89D250, Shultz/Hill screened papers",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-91d490",
    repository: "Department of State",
    lot: "91D490",
    title:
      "Office of the Under Secretary of State for Political Affairs, Robert M. Kimmitt Special and Chron Files, January 1989-July 1991",
    shortName: "Lot 91D490, Kimmitt special/chron files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-93d187",
    repository: "Department of State",
    lot: "93D187",
    title:
      "Executive Secretariat, S/S-IRM Records, Secretary James A. Baker III's Classified Papers, January 1989-August 1992",
    shortName: "Lot 93D187, Baker classified papers",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-93d396",
    repository: "Department of State",
    lot: "93D396",
    title: "Office of the Under Secretary for Political Affairs, Files for Arnold Kanter, October 1991-January 1993",
    shortName: "Lot 93D396, Kanter files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-93d519",
    repository: "Department of State",
    lot: "93D519",
    title:
      "Executive Secretariat, S/P Files, Dennis Ross correspondence and chronology files, January 1989-January 1993",
    shortName: "Lot 93D519, Dennis Ross S/P files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-94d589",
    repository: "Department of State",
    lot: "94D589",
    title:
      "Office of the Counselor, Official Records of Robert B. Zoellick, January 1989-August 1992",
    shortName: "Lot 94D589, Zoellick Counselor files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-95d335",
    repository: "Department of State",
    lot: "95D335",
    title:
      "Office of the Deputy Secretary of State, Lawrence S. Eagleburger and Secretary/Acting Secretary chron and correspondence files, 1989-1993",
    shortName: "Lot 95D335, Eagleburger chron files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-96d234",
    repository: "Department of State",
    lot: "96D234",
    title: "Office of the Secretary of State, Office of Secretary Eagleburger, Chron and Subject File",
    shortName: "Lot 96D234, Secretary Eagleburger files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-96d258",
    repository: "Department of State",
    lot: "96D258",
    title: "Office of the Secretary of State, New Files for J. Baker Memoirs; Subject File for Secretary J. Baker",
    shortName: "Lot 96D258, Baker memoir/subject files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-96d277",
    repository: "Department of State",
    lot: "96D277",
    title: "Office of the Secretary of State, Baker's Subject Files, 1990-1994",
    shortName: "Lot 96D277, Baker subject files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-96d484",
    repository: "Department of State",
    lot: "96D484",
    title:
      "Bureau of Economic and Agricultural Affairs, Robert B. Zoellick, Under Secretary for Economic and Agricultural Affairs, subject and country records",
    shortName: "Lot 96D484, Zoellick E files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-98d550",
    repository: "Department of State",
    lot: "98D550",
    title: "Executive Secretariat, S/S Files, Secretariat Memorandums, 1990 and 1991 Special Handling Restrictions Memorandums",
    shortName: "Lot 98D550, S/S special handling memoranda",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-99d344",
    repository: "Department of State",
    lot: "99D344",
    title: "Bureau of European Affairs, Office of Russian Affairs, Russia Desk Files",
    shortName: "Lot 99D344, Russia Desk files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-01d127",
    repository: "Department of State",
    lot: "01D127",
    title:
      "Office of the Under Secretary for Arms Control, International Security Affairs, 1969-1990 Subject Record of James P. Timbie",
    shortName: "Lot 01D127, James Timbie subject record",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-02d360",
    repository: "Department of State",
    lot: "02D360",
    title: "Bureau of Arms Control, Edward M. Ifft Files",
    shortName: "Lot 02D360, Edward Ifft files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-03d102",
    repository: "Department of State",
    lot: "03D102",
    title: "Executive Secretariat, S/P Files, Dennis B. Ross Subject Files",
    shortName: "Lot 03D102, Dennis Ross subject files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-05d259",
    repository: "Department of State",
    lot: "05D259",
    title: "Office of the Under Secretary for Arms Control, International Security Affairs, Records of James Timbie",
    shortName: "Lot 05D259, James Timbie records",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-lot-06d436",
    repository: "Department of State",
    lot: "06D436",
    title: "Verification, Compliance and Implementation Subject Files, 1983-2005",
    shortName: "Lot 06D436, VCI subject files",
    sourceClass: "state-lot"
  },
  {
    id: "frus31-bush-vp-gregg",
    repository: "George H.W. Bush Presidential Library",
    title: "George H.W. Bush Vice Presidential Records, Donald P. Gregg Files",
    shortName: "Donald P. Gregg Files",
    sourceClass: "bush-vp",
    naid: "2601063",
    catalogUrl: "https://catalog.archives.gov/id/2601063"
  },
  {
    id: "frus31-bush-vp-watson",
    repository: "George H.W. Bush Presidential Library",
    title: "George H.W. Bush Vice Presidential Records, Samuel J. Watson Files",
    shortName: "Samuel J. Watson Files",
    sourceClass: "bush-vp"
  },
  {
    id: "frus31-scowcroft-gates",
    repository: "George H.W. Bush Presidential Library",
    title: "Brent Scowcroft Collection, Robert M. Gates Files",
    shortName: "Scowcroft/Gates Files",
    sourceClass: "bush-scowcroft",
    parentNaid: "4522156",
    catalogUrl: "https://catalog.archives.gov/id/4522156"
  },
  {
    id: "frus31-scowcroft-close-hold",
    repository: "George H.W. Bush Presidential Library",
    title: "Brent Scowcroft Collection, Scowcroft Close Hold Files",
    shortName: "Scowcroft Close Hold Files",
    sourceClass: "bush-scowcroft",
    parentNaid: "4522156",
    catalogUrl: "https://catalog.archives.gov/id/4522156"
  },
  {
    id: "frus31-scowcroft-special-ussr-notes",
    repository: "George H.W. Bush Presidential Library",
    title: "Brent Scowcroft Collection, Special Separate USSR Notes Files",
    shortName: "Special Separate USSR Notes Files",
    sourceClass: "bush-scowcroft",
    parentNaid: "4522156",
    catalogUrl: "https://catalog.archives.gov/id/4522156"
  },
  {
    id: "frus31-scowcroft-chronological",
    repository: "George H.W. Bush Presidential Library",
    title: "Brent Scowcroft Collection, Chronological Files",
    shortName: "Scowcroft Chronological Files",
    sourceClass: "bush-scowcroft",
    parentNaid: "4522156",
    catalogUrl: "https://catalog.archives.gov/id/4522156"
  },
  {
    id: "frus31-nsc-rice",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council, Condoleezza Rice Files",
    shortName: "Condoleezza Rice Files",
    sourceClass: "bush-nsc",
    parentNaid: "2163580",
    catalogUrl: "https://catalog.archives.gov/id/2163580"
  },
  {
    id: "frus31-nsc-intelligence",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council, Intelligence File",
    shortName: "NSC Intelligence File",
    sourceClass: "bush-nsc",
    parentNaid: "2163580",
    catalogUrl: "https://catalog.archives.gov/id/2163580"
  },
  {
    id: "frus31-nsc-gordon",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council, John A. Gordon Files",
    shortName: "John A. Gordon Files",
    sourceClass: "bush-nsc",
    parentNaid: "2163580",
    catalogUrl: "https://catalog.archives.gov/id/2163580"
  },
  {
    id: "frus31-nsc-pa",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council Presidential Acquisitions (PA) Files, 1989-1993",
    shortName: "NSC PA Files",
    sourceClass: "bush-nsc",
    naid: "312293918",
    catalogUrl: "https://catalog.archives.gov/id/312293918"
  },
  {
    id: "frus31-nsc-richard-davis",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council, Richard A. Davis Files",
    shortName: "Richard A. Davis Files",
    sourceClass: "bush-nsc",
    parentNaid: "2163580",
    catalogUrl: "https://catalog.archives.gov/id/2163580"
  },
  {
    id: "frus31-nsc-gates",
    repository: "George H.W. Bush Presidential Library",
    title: "National Security Council, Robert M. Gates Files",
    shortName: "NSC Robert M. Gates Files",
    sourceClass: "bush-nsc",
    parentNaid: "2163580",
    catalogUrl: "https://catalog.archives.gov/id/2163580"
  }
];

const existingProjectSources = new Set([
  "frus31-nsc-nsd-nsr",
  "frus31-nsc-meeting-files",
  "frus31-nsc-dc-meetings",
  "frus31-scowcroft-parent"
]);

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function stripTags(xml) {
  return decodeEntities(
    xml
      .replace(/<note\b[\s\S]*?<\/note>/g, " ")
      .replace(/<pb\b[^>]*\/>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function cleanText(xml) {
  return decodeEntities(
    xml
      .replace(/<pb\b[^>]*\/>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function fetchText(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return text;
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : "";
}

function extractDocuments(xml) {
  const docs = [];
  const docPattern =
    /<div\b(?=[^>]*\btype="document")(?=[^>]*\bxml:id="d(\d+)")[^>]*>([\s\S]*?)(?=<div\b(?=[^>]*\btype="document")(?=[^>]*\bxml:id="d\d+")[^>]*>|<\/body>)/g;
  let match;
  while ((match = docPattern.exec(xml))) {
    const number = Number(match[1]);
    const body = match[2];
    const headXml = firstMatch(body, /<head\b[^>]*>([\s\S]*?)<\/head>/) || "";
    const title = stripTags(headXml).replace(/^\d+\.\s*/, "");
    const date =
      firstMatch(body, /<date\b[^>]*\bwhen="([^"]+)"/) ||
      firstMatch(body, /<date\b[^>]*\bnotBefore="([^"]+)"/) ||
      "";
    const sourceNotes = [];
    const notes = body.matchAll(/<note\b[^>]*>([\s\S]*?)<\/note>/g);
    for (const noteMatch of notes) {
      const noteText = cleanText(noteMatch[1]);
      if (/^Source:/i.test(noteText)) sourceNotes.push(noteText);
    }
    docs.push({
      number,
      id: `d${number}`,
      url: `${VOLUME_URL}/d${number}`,
      title,
      date: date.slice(0, 10),
      sourceNote: sourceNotes[0] || "",
      sourceCollections: sourceNotes.map(classifySourceNote)
    });
  }
  return docs.sort((a, b) => a.number - b.number);
}

function classifySourceNote(note) {
  const text = note.replace(/\s+/g, " ").trim();
  const upper = text.toUpperCase();
  const lot = text.match(/Lot\s+(\d{2}D\d+)/i)?.[1]?.toUpperCase() || "";
  let key = "";

  if (/Central Foreign Policy File/i.test(text)) key = "frus31-central-foreign-policy-file";
  else if (lot) key = `frus31-lot-${lot.toLowerCase()}`;
  else if (/Donald P\.?\s+Gregg Files/i.test(text)) key = "frus31-bush-vp-gregg";
  else if (/Samuel J\.?\s+Watson Files/i.test(text)) key = "frus31-bush-vp-watson";
  else if (/Brent Scowcroft Collection/i.test(text) && /Robert M\.?\s+Gates Files/i.test(text)) key = "frus31-scowcroft-gates";
  else if (/Close Hold/i.test(text)) key = "frus31-scowcroft-close-hold";
  else if (/Special Separate\s+USSR\s+Notes/i.test(text)) key = "frus31-scowcroft-special-ussr-notes";
  else if (/Brent Scowcroft Collection/i.test(text) && /Chronological Files/i.test(text)) key = "frus31-scowcroft-chronological";
  else if (/Condoleezza Rice Files/i.test(text)) key = "frus31-nsc-rice";
  else if (/Intelligence File/i.test(text)) key = "frus31-nsc-intelligence";
  else if (/John A\.?\s+Gordon Files/i.test(text)) key = "frus31-nsc-gordon";
  else if (/\bPA Files\b|Presidential Acquisitions/i.test(text)) key = "frus31-nsc-pa";
  else if (/Richard A\.?\s+Davis Files/i.test(text)) key = "frus31-nsc-richard-davis";
  else if (/National Security Council/i.test(text) && /Robert M\.?\s+Gates Files/i.test(text)) key = "frus31-nsc-gates";
  else if (/NSC\/DC Meetings/i.test(text)) key = "frus31-nsc-dc-meetings";
  else if (/NSC Meeting Files/i.test(text)) key = "frus31-nsc-meeting-files";
  else if (/NSD|NSR|National Security Directive|National Security Review/i.test(text)) key = "frus31-nsc-nsd-nsr";
  else if (/Brent Scowcroft/i.test(text)) key = "frus31-scowcroft-parent";
  else if (/George H\.W\. Bush Library|Bush Library/i.test(text)) key = "frus31-bush-library-unmapped";
  else if (/Department of State|National Archives, RG 59/i.test(text)) key = "frus31-state-unmapped";

  return {
    key: key || "frus31-unmapped",
    repository: repositoryFor(text),
    lot,
    noteSnippet: text.slice(0, 420),
    hasClassification: /Top Secret|Secret|Confidential/i.test(text),
    isBushLibrary: /Bush Library/i.test(text),
    isStateDepartment: /Department of State|National Archives, RG 59/i.test(text),
    mentionsStart: /\bSTART\b/i.test(upper)
  };
}

function repositoryFor(text) {
  if (/George H\.W\. Bush Library|Bush Library/i.test(text)) return "George H.W. Bush Presidential Library";
  if (/National Archives, RG 59/i.test(text)) return "National Archives, RG 59";
  if (/Department of State/i.test(text)) return "Department of State";
  return "Other";
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function citationCounts(documents) {
  const citations = documents.flatMap((document) =>
    document.sourceCollections.map((source) => ({ ...source, documentNumber: document.number }))
  );
  const byCollection = countBy(citations, (source) => source.key);
  const byRepository = countBy(citations, (source) => source.repository);
  const byLot = countBy(
    citations.filter((source) => source.lot),
    (source) => source.lot
  );
  return { totalSourceNotes: citations.length, byRepository, byCollection, byLot };
}

function buildLeadSources(documents, counts) {
  return formalLeadSources.map((source) => {
    const citedDocuments = documents
      .filter((document) => document.sourceCollections.some((collection) => collection.key === source.id))
      .map((document) => ({
        number: document.number,
        date: document.date,
        title: document.title,
        url: document.url
      }));
    return {
      ...source,
      sourcePageUrl: SOURCES_URL,
      documentCitationCount: counts.byCollection[source.id] || 0,
      citedDocuments,
      alreadyRepresentedInProject: existingProjectSources.has(source.id)
    };
  });
}

function extractSourcePageSummary(xml) {
  const sourcesXml = firstMatch(xml, /<div\b[^>]*xml:id="sources"[^>]*>([\s\S]*?)<\/div>\s*<div\b/) || "";
  const text = cleanText(sourcesXml);
  return {
    mentionsCriticalBushLibrary: /most critical documentation.*George H\.W\. Bush/i.test(text),
    mentionsTimbieLots: /Lot 01D127.*Lot 05D259/i.test(text),
    mentionsCentralForeignPolicyFile: /Central Foreign Policy File/i.test(text),
    extractedText: text.slice(0, 5000)
  };
}

async function main() {
  const xml = await fetchText(TEI_URL);
  const documents = extractDocuments(xml);
  const counts = citationCounts(documents);
  const leadSources = buildLeadSources(documents, counts);
  const report = {
    generatedAt: new Date().toISOString(),
    volume: {
      id: VOLUME_ID,
      title: "Foreign Relations of the United States, 1989-1992, Volume XXXI, START I, 1989-1991",
      url: VOLUME_URL,
      sourcesUrl: SOURCES_URL,
      teiUrl: TEI_URL
    },
    method:
      "Parsed the official HistoryAtState TEI XML to extract the Sources page, document headings, dates, and source notes beginning with 'Source:'. Classified cited collections into compiler-facing source leads.",
    sourcePageSummary: extractSourcePageSummary(xml),
    totals: {
      documents: documents.length,
      documentsWithSourceNotes: documents.filter((document) => document.sourceNote).length,
      formalLeadSources: leadSources.length,
      newLeadSourcesForThisProject: leadSources.filter((source) => !source.alreadyRepresentedInProject).length
    },
    citationCounts: counts,
    leadSources,
    documents
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        outPath: OUT_PATH,
        documents: report.totals.documents,
        documentsWithSourceNotes: report.totals.documentsWithSourceNotes,
        formalLeadSources: report.totals.formalLeadSources,
        newLeadSourcesForThisProject: report.totals.newLeadSourcesForThisProject,
        topCollections: Object.entries(counts.byCollection).slice(0, 12)
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
