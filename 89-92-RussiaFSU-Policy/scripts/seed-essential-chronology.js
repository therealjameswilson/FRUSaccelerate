const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "memcons.json");
const JS_PATH = path.join(__dirname, "..", "data", "memcons.js");
const HARVEST_PATH = path.join(__dirname, "..", "reports", "essential-collections-harvest.json");
const DRIVE_REPORT_PATH = path.join(__dirname, "..", "reports", "google-drive-source-hits.json");
const SEED_REPORT_PATH = path.join(__dirname, "..", "reports", "essential-chronology-seed.json");

const seedBatch = "essential-collections-and-drive-2026-05-20";

const volumeIv = {
  id: "frus1989-92v04",
  title:
    "Foreign Relations of the United States, 1989-1992, Volume IV, Soviet Union, Russia, and Post-Soviet States: Policy",
  url: "https://history.state.gov/historicaldocuments/frus1989-92v04",
  status: "Being Researched"
};

const chapters = {
  anchors: { number: 1, name: "Volume III High-Level Contacts" },
  soviet: { number: 2, name: "Soviet Reform and Arms Control Policy" },
  collapse: { number: 3, name: "Collapse and Republics Policy" },
  archives: { number: 4, name: "Archive Leads" }
};

const sources = {
  "Scowcroft Papers": {
    type: "Collection",
    naid: "4522156",
    title: "Brent Scowcroft Papers",
    shortName: "Scowcroft Papers",
    url: "https://catalog.archives.gov/id/4522156"
  },
  "Presidential Daily Files": {
    type: "Series",
    naid: "595141",
    title: "Presidential Daily Files",
    shortName: "Presidential Daily Files",
    url: "https://catalog.archives.gov/id/595141"
  },
  "NSC Meeting Files": {
    type: "Series",
    naid: "312293887",
    title: "H-Files - National Security Council (NSC) Meeting Files",
    shortName: "NSC Meeting Files",
    url: "https://catalog.archives.gov/id/312293887"
  },
  "NSC/DC Meetings": {
    type: "Series",
    naid: "312294079",
    title: "H-Files - National Security Council (NSC)/Deputies Committee (DC) Meetings Files",
    shortName: "NSC/DC Meetings",
    url: "https://catalog.archives.gov/id/312294079"
  },
  "NSC/DC Follow-up": {
    type: "Series",
    naid: "312294094",
    title: "H-Files - National Security Council (NSC)/Deputies Committee (DC) Meetings Follow-up Files",
    shortName: "NSC/DC Follow-up",
    url: "https://catalog.archives.gov/id/312294094"
  },
  "NSR Files": {
    type: "Series",
    naid: "313189297",
    title: "H-Files - National Security Review (NSR) Files",
    shortName: "NSR Files",
    url: "https://catalog.archives.gov/id/313189297"
  },
  "NSD Files": {
    type: "Series",
    naid: "313189290",
    title: "National Security Directives (NSD) Files",
    shortName: "NSD Files",
    url: "https://catalog.archives.gov/id/313189290"
  },
  "IF Transition": {
    type: "Series",
    naid: "348937136",
    title: "National Security Council (NSC) Institutional Files (IF) Transition Files",
    shortName: "IF Transition Files",
    url: "https://catalog.archives.gov/id/348937136"
  }
};

const driveSource = {
  type: "Source Copy",
  title: "User Google Drive source copy",
  shortName: "Google Drive source copy",
  url: "https://drive.google.com"
};

const sourceLeads = [
  ["Scowcroft Papers", 231, "Use the Scowcroft file-unit PDFs and Drive copies to isolate memoranda from Brent Scowcroft, Rice, Blackwill, Gates, and Rostow on Soviet strategy, collapse, and republic policy."],
  ["Presidential Daily Files", 296, "Use Daily Files as White House control files to triangulate meeting-day packets, briefing papers, and presidential reading on Soviet/Russian policy."],
  ["NSC Meeting Files", 52, "Review NSC meeting files for presidential-level policy decisions that sit outside the completed Volume III conversation lane."],
  ["NSC/DC Meetings", 150, "Review Deputies Committee meeting packets for interagency policy formulation, especially START/CFE, COCOM, Soviet contingency planning, assistance, and nonproliferation."],
  ["NSC/DC Follow-up", 43, "Use follow-up files to find memoranda, tasking, and implementation papers attached to DC decisions."],
  ["NSR Files", 46, "Use National Security Reviews to recover option papers and interagency policy reviews that precede NSDs."],
  ["NSD Files", 64, "Use National Security Directives for final presidential decisions and policy guidance."],
  ["IF Transition", 29, "Use transition materials to reconstruct the Reagan-to-Bush baseline for Soviet policy, arms control, COCOM, and institutional process."]
];

const selectedNara = [
  ["446394925", "Foundational interagency review of U.S.-Soviet relations at the opening of the Bush administration.", ["NSR-3", "U.S.-Soviet relations", "Policy review"]],
  ["446394926", "Second file unit for the foundational NSR-3 review of U.S.-Soviet relations.", ["NSR-3", "U.S.-Soviet relations", "Policy review"]],
  ["470760988", "Deputies Committee meeting on NSR-3 and U.S.-Soviet economic relations.", ["NSR-3", "Economic relations", "Deputies Committee"]],
  ["446394947", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["446394948", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["446394949", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["446394950", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["446394951", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["446394952", "Arms-control review file feeding the administration's early START, CFE, and nuclear testing positions.", ["NSR-14", "Arms control", "START"]],
  ["470761002", "Deputies Committee file on START fundamental limits during the administration's arms-control review.", ["START", "Arms control", "Deputies Committee"]],
  ["470761006", "Deputies Committee file on START air-breathing systems and non-deployed missiles.", ["START", "Verification", "Arms control"]],
  ["470761007", "Deputies Committee file on mobile ICBMs, verification, and new START initiatives.", ["START", "Mobile ICBMs", "Verification"]],
  ["470761008", "Deputies Committee file on START new initiatives.", ["START", "Arms control", "Deputies Committee"]],
  ["470761019", "Deputies Committee file on Soviet emigration as part of the broader U.S.-Soviet agenda.", ["Soviet emigration", "Human rights", "Deputies Committee"]],
  ["470761023", "Second Deputies Committee file on Soviet emigration.", ["Soviet emigration", "Human rights", "Deputies Committee"]],
  ["446396838", "Presidential directive on nuclear testing and arms-control policy.", ["NSD-22", "Nuclear testing", "Arms control"]],
  ["446396844", "Presidential directive on Soviet emigration policy.", ["NSD-27", "Soviet emigration", "Human rights"]],
  ["470761074", "Deputies Committee file on Soviet noncompliance issues in arms-control policy.", ["Soviet noncompliance", "Arms control", "Compliance"]],
  ["470761076", "Deputies Committee file on CFE verification after the 1989 policy review.", ["CFE", "Verification", "Arms control"]],
  ["446394968", "Second file unit for the COCOM review toward Eastern Europe and the Soviet Union.", ["NSR-22", "COCOM", "Export controls"]],
  ["446396855", "Presidential directive on U.S.-Soviet economic initiatives.", ["NSD-35", "Economic initiatives", "U.S.-Soviet relations"]],
  ["446396856", "Presidential directive on U.S. arms-control policy.", ["NSD-36", "Arms control", "START"]],
  ["470761099", "Deputies Committee meeting on Lithuania as Soviet-republic crisis management became a policy problem.", ["Lithuania", "Baltic states", "Soviet Union"]],
  ["470761100", "Deputies Committee SVTS meeting on Lithuania.", ["Lithuania", "Baltic states", "Soviet Union"]],
  ["470761102", "Second Deputies Committee SVTS meeting on Lithuania.", ["Lithuania", "Baltic states", "Soviet Union"]],
  ["470761117", "Deputies Committee file on U.S.-Soviet relations before the Washington summit.", ["U.S.-Soviet relations", "Gorbachev", "Deputies Committee"]],
  ["446396872", "Directive record on START and CFE decisions.", ["NSD-50", "START", "CFE"]],
  ["470761234", "Deputies Committee file on CFE and Soviet data.", ["CFE", "Soviet data", "Arms control"]],
  ["470761239", "Deputies Committee file on strategic nuclear forces.", ["Strategic nuclear forces", "Arms control", "START"]],
  ["470761247", "Deputies Committee SVTS meeting on the Baltic States after the January 1991 crackdown.", ["Baltic states", "Lithuania", "Soviet Union"]],
  ["470761248", "Second Deputies Committee SVTS meeting on the Baltic States.", ["Baltic states", "Lithuania", "Soviet Union"]],
  ["470761251", "Deputies Committee file on CFE and Soviet data.", ["CFE", "Soviet data", "Arms control"]],
  ["470761322", "Deputies Committee meeting during the August 1991 Soviet coup.", ["August coup", "Soviet Union", "Crisis management"], "collapse"],
  ["470761328", "Deputies Committee file on international economic cooperation with the USSR after the coup.", ["Economic assistance", "USSR", "International coordination"], "collapse"],
  ["470761329", "Deputies Committee file on humanitarian assistance to the USSR.", ["Humanitarian assistance", "USSR", "Post-coup policy"], "collapse"],
  ["470761336", "Deputies Committee file on international coordination of humanitarian assistance to the USSR.", ["Humanitarian assistance", "USSR", "International coordination"], "collapse"],
  ["470761340", "Deputies Committee file on intra-COCOM trade in MTCR annex items.", ["COCOM", "MTCR", "Nonproliferation"], "collapse"],
  ["470761355", "Deputies Committee file on preventing militarily useful technology from spreading from the former Soviet Union.", ["Former Soviet Union", "Technology transfer", "Nonproliferation"], "collapse"],
  ["470761366", "Deputies Committee file on the non-proliferation initiative.", ["Nonproliferation", "Former Soviet Union", "Deputies Committee"], "collapse"],
  ["470761376", "Deputies Committee file on non-proliferation policy.", ["Nonproliferation", "Former Soviet Union", "Policy"], "collapse"],
  ["470761377", "Deputies Committee file on safety of Soviet-designed nuclear reactors.", ["Nuclear safety", "Former Soviet Union", "Reactors"], "collapse"],
  ["470761382", "Deputies Committee file on non-proliferation.", ["Nonproliferation", "Former Soviet Union", "Deputies Committee"], "collapse"],
  ["470761383", "Deputies Committee file on the Russian bid to launch an Inmarsat satellite.", ["Russia", "Space policy", "Technology transfer"], "collapse"],
  ["446396904", "Presidential directive on U.S. nonproliferation policy.", ["NSD-70", "Nonproliferation", "Former Soviet Union"], "collapse"],
  ["470761425", "Deputies Committee file on U.S. policy toward Russia, economic assistance, and the IMF.", ["Russia", "Economic assistance", "IMF"], "collapse"]
];

const driveRecords = [
  {
    id: "drive-1989-03-01-scowcroft-getting-ahead-of-gorbachev",
    date: "1989-03-01",
    title: "Scowcroft to Bush, \"Getting Ahead of Gorbachev\"",
    documentTitle: "Scowcroft memorandum to Bush, \"Getting Ahead of Gorbachev\"",
    url: "https://drive.google.com/file/d/0B4xiXXj9ooNgVHpFRkJBUEpZczQ4a0ZkUDd3V09ubWxkQlZ3",
    sourceTitle: "Scowcroft, Brent, Collection, USSR Collapse Files, U.S.-Soviet Relations Chronological Files",
    participants: ["Brent Scowcroft", "George H. W. Bush", "Condoleezza Rice"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Early strategy memorandum setting premises for managing Gorbachev's diplomacy, Soviet reform, NATO, arms control, Eastern Europe, COCOM, and U.S. global posture.",
    topics: ["Scowcroft", "Gorbachev", "U.S.-Soviet strategy", "NATO", "Arms control"],
    extractionStatus:
      "OCR text was available from Drive; reconcile the source copy with the Scowcroft USSR Collapse Files folder before formal citation."
  },
  {
    id: "drive-1990-02-14-rice-scowcroft-six-power-germany",
    date: "1990-02-14",
    title: "Rice and Blackwill to Scowcroft, \"Preparing for the Six Power German Peace Conference\"",
    documentTitle: "Scowcroft memorandum to Bush on preparing for the Six Power German Peace Conference",
    url: "https://drive.google.com/file/d/0B4xiXXj9ooNgUTdnMGpqNU5BeHA2WDZBZkRoUXg4LURQcjI0",
    sourceTitle: "NSC Rice Files, 1989-1990 Subject File, Germany",
    participants: ["Condoleezza Rice", "Robert D. Blackwill", "Brent Scowcroft", "George H. W. Bush"],
    countries: ["United States", "Soviet Union", "Germany"],
    chapter: chapters.soviet,
    subjectLine:
      "Strategy paper on Soviet leverage in German unification, NATO membership, CFE, nuclear deterrence, and the European security endgame.",
    topics: ["German unification", "Soviet Union", "NATO", "CFE"],
    extractionStatus:
      "Useful for Volume IV cross-reference because it shows how Soviet policy, CFE, and NATO strategy intersected with German unification."
  },
  {
    id: "drive-1990-12-13-rostow-scowcroft-all-union-treaty",
    date: "1990-12-13",
    title: "Nick Rostow to Scowcroft on All-Union Treaty",
    documentTitle: "Nick Rostow to Brent Scowcroft on the All-Union Treaty",
    url: "https://drive.google.com/file/d/1-g8jmMrqoMLc6lFJV99yJmcttQV2sgyV",
    sourceTitle: "Scowcroft, Brent, Collection, USSR Collapse Files, December 1990",
    participants: ["Nicholas Rostow", "Brent Scowcroft"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Annotated Scowcroft-file copy on the All-Union Treaty as the Soviet center tried to preserve a reworked union structure.",
    topics: ["All-Union Treaty", "Soviet collapse", "Republics"],
    extractionStatus:
      "Drive fetch returned metadata but no OCR text; page count and contents still need manual PDF review."
  },
  {
    id: "drive-1991-10-07-bartholomew-pni-republics",
    date: "1991-10-07",
    title: "Bartholomew meeting with Ukraine, Belarus, and Kazakhstan officials re PNI",
    documentTitle: "Bartholomew meeting with Ukraine, Belarus, and Kazakhstan officials on the Presidential Nuclear Initiatives",
    url: "https://drive.google.com/file/d/1S_aMKxQ5Z4b5djYl0ERMEh08dxsZOGNM",
    sourceTitle: "User Google Drive source copy",
    participants: ["Reginald Bartholomew", "Ukraine officials", "Belarus officials", "Kazakhstan officials"],
    countries: ["United States", "Ukraine", "Belarus", "Kazakhstan"],
    chapter: chapters.collapse,
    subjectLine:
      "Early post-coup nuclear-republic consultation on implementing the Presidential Nuclear Initiatives with Ukraine, Belarus, and Kazakhstan.",
    topics: ["PNI", "Ukraine", "Belarus", "Kazakhstan", "Nuclear weapons"],
    extractionStatus:
      "Drive fetch returned metadata but no OCR text; treat as a high-priority source copy for manual review."
  },
  {
    id: "drive-1992-01-30-nunn-lugar-to-bush",
    date: "1992-01-30",
    title: "Nunn and Lugar to Bush on nuclear assistance to the former Soviet Union",
    documentTitle: "Senators Nunn and Lugar letter to President Bush on former Soviet nuclear dismantlement assistance",
    url: "https://drive.google.com/file/d/1aHDdROlYcjMYekm_iPirnCDqIajs_JZP",
    sourceTitle: "State Department release, Case No. F-2014-11250",
    participants: ["Sam Nunn", "Richard Lugar", "George H. W. Bush"],
    countries: ["United States", "Russia", "Ukraine", "Belarus"],
    chapter: chapters.collapse,
    subjectLine:
      "Congressional warning before the Bush-Yeltsin Camp David meeting on using Nunn-Lugar funds for Russian nuclear dismantlement, storage, and defense conversion.",
    topics: ["Nunn-Lugar", "Nuclear dismantlement", "Russia", "CIS assistance"],
    extractionStatus:
      "OCR text was available from Drive; reconcile with the State Department case release before formal citation."
  },
  {
    id: "drive-1992-02-26-baker-gorbachev-cable",
    date: "1992-02-26",
    title: "Baker and Gorbachev cable",
    documentTitle: "Cable on Baker and Gorbachev",
    url: "https://drive.google.com/file/d/1kVS9T0_QQrsL0d4NDQBghU0D-DKDnpkJ",
    sourceTitle: "User Google Drive source copy",
    participants: ["James A. Baker III", "Mikhail Gorbachev"],
    countries: ["United States", "Russia", "Former Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Drive source-copy lead for a February 1992 Baker-Gorbachev cable after the Soviet collapse.",
    topics: ["Baker", "Gorbachev", "Russia", "Former Soviet Union"],
    extractionStatus:
      "Drive fetch returned metadata but no OCR text; manual review needed to confirm document scope."
  },
  {
    id: "drive-1992-03-10-nunn-lugar-trip-report",
    date: "1992-03-10",
    title: "Trip report: Nunn, Lugar, Warner, and Bingaman visit to the CIS",
    documentTitle: "Trip report on Nunn, Lugar, Warner, and Bingaman visit to Russia and Ukraine",
    url: "https://drive.google.com/file/d/13g3PwuIIxoSk-1XrhL8L5xoh1sJR4zaI",
    sourceTitle: "Nunn-Lugar collection of the National Security Archive",
    participants: ["Sam Nunn", "Richard Lugar", "John Warner", "Jeff Bingaman"],
    countries: ["United States", "Russia", "Ukraine", "Belarus"],
    chapter: chapters.collapse,
    subjectLine:
      "Trip report on defense conversion, nuclear/chemical weapons elimination, Russia-Ukraine-Belarus relations, and implementation of the Nunn-Lugar amendment.",
    topics: ["Nunn-Lugar", "CIS", "Defense conversion", "Nuclear weapons", "Ukraine"],
    extractionStatus:
      "OCR text was available from Drive; the report directly links congressional assistance policy to former Soviet nuclear dangers."
  },
  {
    id: "drive-1992-03-27-dia-ukraine-nuclear-withdrawal",
    date: "1992-03-27",
    title: "DIA report, Ukraine: Nuclear Withdrawal Suspension",
    documentTitle: "Defense Intelligence Report ODB 27-92, Ukraine: Nuclear Withdrawal Suspension",
    url: "https://drive.google.com/file/d/1nYwQYHHC-S_xbeVdMQArWAPLW4QbvweA",
    sourceTitle: "Nunn-Lugar collection of the National Security Archive",
    participants: ["Defense Intelligence Agency"],
    countries: ["United States", "Ukraine", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "DIA assessment of Kravchuk's halt to tactical nuclear-weapons transfers to Russia and its implications for Ukraine, Russia, CIS verification, Crimea, and START.",
    topics: ["Ukraine", "Russia", "Nuclear withdrawal", "Kravchuk", "START"],
    extractionStatus:
      "OCR text was available from Drive; high-priority Volume IV context for the Ukraine nuclear issue."
  },
  {
    id: "drive-1992-08-28-ssd-material-control",
    date: "1992-08-28",
    title: "SSD working group discussions on material control, accounting, and physical protection",
    documentTitle: "Moscow cable on U.S.-Russia SSD working group discussions on MC&A and physical protection",
    url: "https://drive.google.com/file/d/1N0ARvo9JQTITg0ta5V6UAoMGhHGwgtJl",
    sourceTitle: "State Department release, Case No. F-2014-14906",
    participants: ["U.S. Embassy Moscow", "U.S.-Russia SSD Working Group"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Cable transmitting a non-paper on possible U.S.-Russia cooperation for nuclear material control and physical protection under SSD and Nunn-Lugar.",
    topics: ["SSD", "Nunn-Lugar", "Russia", "Material control", "Nuclear security"],
    extractionStatus:
      "OCR text was available from Drive; use with NARA Deputies Committee nonproliferation records."
  },
  {
    id: "drive-1992-11-23-nunn-lugar-gorbachev-readout",
    date: "1992-11-23",
    title: "Nunn-Lugar readout with Gorbachev on Russia and Ukraine",
    documentTitle: "Moscow cable: Mikhail Gorbachev on the current situation in Russia",
    url: "https://drive.google.com/file/d/1uwPZn2_-AQFpH_EWs9hn_2JUtiUWd-0L",
    sourceTitle: "State Department release, Case No. F-2008-02188",
    participants: ["Mikhail Gorbachev", "Sam Nunn", "Richard Lugar"],
    countries: ["United States", "Russia", "Ukraine", "Georgia"],
    chapter: chapters.collapse,
    subjectLine:
      "Cable readout of Gorbachev's views on Yeltsin, Russian reform, food supply, Georgia, a new union of independent states, and Ukraine's nuclear stance.",
    topics: ["Gorbachev", "Russia", "Ukraine", "Nunn-Lugar", "CIS"],
    extractionStatus:
      "OCR text was available from Drive; useful late-1992 context for policy handoff and Russia/Ukraine nuclear questions."
  },
  {
    id: "drive-1992-11-24-nunn-lugar-yeltsin",
    date: "1992-11-24",
    title: "Yeltsin to Nunn and Lugar: U.S.-Russian relations and guarantees to Ukraine",
    documentTitle: "Moscow cable: Yeltsin to Nunn/Lugar on U.S.-Russian relations and guarantees to Ukraine",
    url: "https://drive.google.com/file/d/1BtCcnNEXSgP_5WP3uAxWeYiXRGkH7oJp",
    sourceTitle: "State Department release, Case No. F-2014-14906",
    participants: ["Boris Yeltsin", "Sam Nunn", "Richard Lugar", "Andrei Kozyrev"],
    countries: ["United States", "Russia", "Ukraine"],
    chapter: chapters.collapse,
    subjectLine:
      "Cable readout of Yeltsin's concern about a U.S.-Russian transition pause, START II, Russian nuclear storage, and possible guarantees to Ukraine.",
    topics: ["Yeltsin", "Nunn-Lugar", "Ukraine", "START II", "Security assurances"],
    extractionStatus:
      "OCR text was available from Drive; bridges Bush administration policy to the Clinton transition."
  },
  {
    id: "drive-1992-11-26-collins-kokoshin-arms-control",
    date: "1992-11-26",
    title: "Collins cable on Nunn-Lugar arms-control discussions with Kokoshin",
    documentTitle: "Moscow cable: Codel Nunn-Lugar discussions on arms control with Deputy Defense Minister Kokoshin",
    url: "https://drive.google.com/file/d/107fPZIPfGeacnVUVBI2iuAuYDIRvk4cv",
    sourceTitle: "State Department release, Case No. F-2014-14906",
    participants: ["James Collins", "Andrey Kokoshin", "Sam Nunn", "Richard Lugar"],
    countries: ["United States", "Russia", "Ukraine", "Baltic States"],
    chapter: chapters.collapse,
    subjectLine:
      "Cable on START II, SS-18 silo conversion, Ukraine nuclear control, accelerated warhead removal, Baltic troop withdrawals, and limited defenses.",
    topics: ["START II", "Ukraine", "Kokoshin", "Nuclear weapons", "Baltic troop withdrawal"],
    extractionStatus:
      "OCR text was available from Drive; high-priority context for late-1992 arms-control and republic-policy problems."
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

function dateLine(date) {
  const value = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function sourceLeadRecord([collectionName, harvestedCount, nextAction], sortOrder) {
  const source = sources[collectionName];
  return {
    id: `source-lead-${slugify(source.shortName)}-${source.naid}`,
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder,
    type: "Source Lead",
    title: `${source.shortName} essential collection`,
    documentTitle: `${source.shortName} essential collection (${harvestedCount} online hits harvested)`,
    participants: ["George H. W. Bush Presidential Library", "National Security Council"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter: chapters.archives,
    releaseStatus: "Online source collection harvested",
    naid: source.naid,
    catalogUrl: source.url,
    pdfUrl: "",
    digitalObjects: harvestedCount,
    source,
    dateLine: "Collection harvest, May 20, 2026",
    subjectLine: `Essential source collection harvested into reports/essential-collections-harvest.json (${harvestedCount} matching online records).`,
    sourceNote: `Source: National Archives Catalog, ${source.title}, NAID ${source.naid}.`,
    frusSourceNote: `Source: National Archives Catalog, ${source.title}, NAID ${source.naid}.`,
    topics: ["Essential collection", "NARA harvest", source.shortName],
    potentialFrusDocument: false,
    countStatus: "Source collection harvested",
    nextAction,
    extractionStatus:
      "Collection-level source lead; individual candidate records from this harvest are staged separately in chronological order.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    seedBatch
  };
}

function naraPolicyRecord(hit, note, topics, chapterKey = "") {
  const chapter =
    chapterKey === "collapse" || hit.date >= "1991-08-19" ? chapters.collapse : chapters.soviet;
  const source = sources[hit.collection] || {
    type: "Series",
    title: hit.seriesTitle || hit.collection,
    shortName: hit.collection,
    url: hit.collectionUrl || catalogUrl(hit.collectionNaid)
  };
  const id = `nara-${hit.date}-${slugify(hit.title)}-${hit.naid}`;
  const releaseStatus = hit.accessStatus
    ? `PDF available; NARA access status ${hit.accessStatus}`
    : "PDF available";

  return {
    id,
    date: hit.date,
    sortDate: hit.date,
    type: "Policy Memorandum",
    title: hit.title,
    documentTitle: hit.title,
    participants: ["National Security Council", "Interagency policy process"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter,
    releaseStatus,
    accessRestrictionStatus: hit.accessStatus,
    naid: hit.naid,
    catalogUrl: hit.catalogUrl || catalogUrl(hit.naid),
    pdfUrl: hit.pdfUrl,
    localIdentifier: hit.localIdentifier,
    objectFilename: hit.objectFilename,
    digitalObjects: hit.pdfUrl ? 1 : 0,
    source,
    dateLine: dateLine(hit.date),
    subjectLine: note,
    sourceNote: `Source: National Archives Catalog, ${source.title}, ${hit.localIdentifier || "file unit"}, NAID ${hit.naid}. Digital object: ${hit.objectFilename}.`,
    frusSourceNote: `Source: George H.W. Bush Presidential Library, ${source.title}, ${hit.localIdentifier || "file unit"}, NAID ${hit.naid}.`,
    topics,
    potentialFrusDocument: true,
    countStatus: "Candidate Volume IV policy memorandum",
    nextAction:
      "Open PDF and identify extractable document pages, attachments, distribution list, and any FRUS-worthy decision text.",
    extractionStatus:
      "Selected from the essential NARA harvest because the title, series, and matched terms tie directly to Soviet/Russia/FSU policy.",
    volumeRole: "volume-iv-policy-candidate",
    volumeStatus: "Volume IV research candidate",
    frusVolume: volumeIv,
    seedBatch
  };
}

function drivePolicyRecord(record, sortOrder) {
  return {
    id: record.id,
    date: record.date,
    sortDate: record.date,
    sortOrder,
    type: "Policy Memorandum",
    title: record.title,
    documentTitle: record.documentTitle || record.title,
    participants: record.participants,
    countries: record.countries,
    chapter: record.chapter,
    releaseStatus: "User Google Drive source copy; provenance and citation need reconciliation",
    catalogUrl: record.url,
    pdfUrl: record.url,
    source: {
      ...driveSource,
      title: record.sourceTitle || driveSource.title
    },
    dateLine: dateLine(record.date),
    subjectLine: record.subjectLine,
    sourceNote: `Source copy found in user Google Drive: ${record.sourceTitle || record.title}. URL: ${record.url}.`,
    frusSourceNote:
      "Source copy found in user Google Drive; reconcile against State, NARA, Bush Library, or National Security Archive citation before FRUS use.",
    topics: record.topics,
    potentialFrusDocument: true,
    countStatus: "Candidate Volume IV source-copy document",
    nextAction:
      "Verify provenance, capture formal citation, and compare against NARA/State versions before selection.",
    extractionStatus: record.extractionStatus,
    volumeRole: "volume-iv-policy-candidate",
    volumeStatus: "Volume IV research candidate",
    frusVolume: volumeIv,
    seedBatch
  };
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const harvest = JSON.parse(fs.readFileSync(HARVEST_PATH, "utf8"));
  const byNaid = new Map(harvest.records.map((record) => [record.naid, record]));
  const seededIds = new Set();

  const seeded = [
    ...sourceLeads.map(sourceLeadRecord),
    ...selectedNara.map(([naid, note, topics, chapterKey]) => {
      const hit = byNaid.get(naid);
      if (!hit) throw new Error(`No harvested NARA record for NAID ${naid}`);
      return naraPolicyRecord(hit, note, topics, chapterKey);
    }),
    ...driveRecords.map(drivePolicyRecord)
  ];

  for (const record of seeded) {
    if (seededIds.has(record.id)) throw new Error(`Duplicate seeded id: ${record.id}`);
    seededIds.add(record.id);
  }

  const existing = records.filter((record) => record.seedBatch !== seedBatch && !seededIds.has(record.id));
  const combined = [...existing, ...seeded].sort(byChapterThenDate);

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(combined, null, 2)}\n`);
  fs.writeFileSync(JS_PATH, `window.MEMCONS = ${JSON.stringify(combined, null, 2)};\n`);
  fs.writeFileSync(
    DRIVE_REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "Google Drive searches requested by user",
        searchedQueries: [
          "FRUS Russia",
          "89 92 Russia",
          "Former Soviet Union",
          "Nunn Lugar",
          "Ukraine withdrawal",
          "PNI Ukraine Belarus Kazakhstan",
          "Soviet coup",
          "USSR Collapse",
          "Scowcroft Soviet",
          "Baker Gorbachev",
          "Russia assistance 1992"
        ],
        selectedRecords: driveRecords
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(
    SEED_REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        seedBatch,
        sourceHarvest: HARVEST_PATH,
        addedRecords: seeded.length,
        sourceLeads: sourceLeads.length,
        naraRecords: selectedNara.length,
        driveRecords: driveRecords.length,
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
        sourceLeads: sourceLeads.length,
        naraRecords: selectedNara.length,
        driveRecords: driveRecords.length,
        totalRecords: combined.length
      },
      null,
      2
    )
  );
}

main();
