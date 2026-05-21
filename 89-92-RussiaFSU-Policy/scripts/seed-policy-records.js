const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "data", "memcons.json");
const jsPath = path.join(__dirname, "..", "data", "memcons.js");

const volumeIv = {
  id: "frus1989-92v04",
  title:
    "Foreign Relations of the United States, 1989-1992, Volume IV, Soviet Union, Russia, and Post-Soviet States: Policy",
  url: "https://history.state.gov/historicaldocuments/frus1989-92v04",
  status: "Being Researched"
};

const chapters = {
  soviet: { number: 2, name: "Soviet Reform and Arms Control Policy" },
  collapse: { number: 3, name: "Collapse and Republics Policy" }
};

const sources = {
  blackwillSubject: {
    type: "Series",
    naid: "2554653",
    title: "Robert D. Blackwill's Subject Files",
    shortName: "Blackwill Subject Files",
    url: "https://catalog.archives.gov/id/2554653"
  },
  nsd: {
    type: "Series",
    naid: "313189290",
    title: "National Security Directives (NSD) Files",
    shortName: "NSD Files",
    url: "https://catalog.archives.gov/id/313189290"
  },
  nsr: {
    type: "Series",
    naid: "313189297",
    title: "H-Files - National Security Review (NSR) Files",
    shortName: "NSR Files",
    url: "https://catalog.archives.gov/id/313189297"
  },
  dcMeetings: {
    type: "Series",
    naid: "312294079",
    title: "H-Files - National Security Council (NSC)/Deputies Committee (DC) Meetings Files",
    shortName: "NSC/DC Meetings Files",
    url: "https://catalog.archives.gov/id/312294079"
  },
  dcFollowUp: {
    type: "Series",
    naid: "312294094",
    title: "H-Files - National Security Council (NSC)/Deputies Committee (DC) Meetings Follow-up Files",
    shortName: "NSC/DC Follow-up Files",
    url: "https://catalog.archives.gov/id/312294094"
  },
  howe: {
    type: "Series",
    naid: "2554916",
    title: "Rear Admiral Jonathan Howe's Files",
    shortName: "Jonathan Howe Files",
    url: "https://catalog.archives.gov/id/2554916"
  },
  summitBriefing: {
    type: "Series",
    naid: "376217868",
    title: "Summit Briefing Books Files",
    shortName: "Summit Briefing Books",
    url: "https://catalog.archives.gov/id/376217868"
  },
  bromley: {
    type: "Series",
    naid: "2595246",
    title: "Allan D. Bromley Files",
    shortName: "Bromley Files",
    url: "https://catalog.archives.gov/id/2595246"
  },
  oneilRussia: {
    type: "Series",
    naid: "312350431",
    title: "John O'Neil Russia Subject Files",
    shortName: "O'Neil Russia Subject Files",
    url: "https://catalog.archives.gov/id/312350431"
  },
  oneilFsu: {
    type: "Series",
    naid: "313174377",
    title: "John O'Neil Former Soviet Union Subject Files",
    shortName: "O'Neil FSU Subject Files",
    url: "https://catalog.archives.gov/id/313174377"
  }
};

function catalogUrl(naid) {
  return `https://catalog.archives.gov/id/${naid}`;
}

function sourceNote(record, source) {
  const objectNote = record.objectFilename ? ` Digital object: ${record.objectFilename}.` : "";
  return `Source: National Archives Catalog, ${source.title}, ${record.localIdentifier}, NAID ${record.naid}.${objectNote}`;
}

function policyRecord(record) {
  const releaseStatus = record.accessStatus
    ? `PDF available; NARA access status ${record.accessStatus}`
    : "PDF available";
  const source = record.source;
  return {
    id: record.id,
    date: record.date,
    sortDate: record.sortDate || record.date,
    sortOrder: record.sortOrder,
    type: "Policy Memorandum",
    title: record.title,
    documentTitle: record.documentTitle || record.title,
    participants: record.participants,
    countries: record.countries,
    chapter: record.chapter,
    releaseStatus,
    accessRestrictionStatus: record.accessStatus,
    naid: record.naid,
    catalogUrl: catalogUrl(record.naid),
    pdfUrl: record.pdfUrl,
    localIdentifier: record.localIdentifier,
    objectFilename: record.objectFilename,
    digitalObjects: record.pdfUrl ? 1 : 0,
    source,
    dateLine: record.dateLine,
    subjectLine: record.subjectLine,
    sourceNote: sourceNote(record, source),
    frusSourceNote: `Source: George H.W. Bush Presidential Library, ${source.title}, ${record.localIdentifier}, NAID ${record.naid}.`,
    topics: record.topics,
    potentialFrusDocument: true,
    countStatus: "Candidate Volume IV policy memorandum",
    nextAction: record.nextAction,
    extractionStatus: record.extractionStatus,
    volumeRole: "volume-iv-policy-candidate",
    volumeStatus: "Volume IV research candidate",
    frusVolume: volumeIv
  };
}

const records = [
  policyRecord({
    id: "1989-03-01-essg-meetings-453248109",
    date: "1989-03-01",
    sortDate: "1989-03-01",
    title: "[European Strategy Steering Group (ESSG) Meetings 3-6/89]",
    documentTitle: "European Strategy Steering Group meetings, March-June 1989",
    participants: ["Robert D. Blackwill", "National Security Council"],
    countries: ["United States", "Soviet Union", "Europe"],
    chapter: chapters.soviet,
    accessStatus: "Restricted - Possibly",
    naid: "453248109",
    localIdentifier: "CF00182-001",
    objectFilename: "41-bpr-nsc-blackwill_subj-cf00182-001.pdf",
    pdfUrl:
      "https://s3.dualstack.us-east-1.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/blackwill/subject_2554653/41-bpr-nsc-blackwill_subj-cf00182-001.pdf",
    source: sources.blackwillSubject,
    dateLine: "March-June 1989 file unit",
    subjectLine:
      "Early Bush administration European strategy sessions for Soviet policy, alliance management, and the administration's post-Reagan review.",
    topics: ["ESSG", "Soviet policy review", "European strategy", "Blackwill"],
    nextAction: "Review PDF for early 1989 strategy-review memoranda and identify decision papers that precede NSD-23.",
    extractionStatus:
      "Use as a bridge between the administration's internal policy review and the later September 1989 U.S.-Soviet directive."
  }),
  policyRecord({
    id: "1989-09-22-nsd-23-soviet-relations-446396839",
    date: "1989-09-22",
    title: "NSD-23 - September 22, 1989 - U.S. Relations with the Soviet Union",
    participants: ["George H. W. Bush", "National Security Council"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    accessStatus: "Restricted - Possibly",
    naid: "446396839",
    localIdentifier: "90003-030",
    objectFilename: "41-bpr-nsc-hfiles-nsd-23-90003-030.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSDs_313189290/41-bpr-nsc-hfiles-nsd-23-90003-030.pdf",
    source: sources.nsd,
    dateLine: "September 22, 1989",
    subjectLine:
      "Core directive for Bush administration policy toward the Soviet Union before Malta and the 1990 arms-control push.",
    topics: ["NSD-23", "U.S.-Soviet relations", "Perestroika", "Policy directive"],
    nextAction: "Review PDF for the directive text, classified excisions, distribution list, and relation to Malta summit briefing.",
    extractionStatus:
      "High-priority Volume IV candidate because it states the administration's formal U.S.-Soviet policy line."
  }),
  policyRecord({
    id: "1990-01-12-nsr-22-cocom-soviet-446394967",
    date: "1990-01-12",
    title: "NSR-22 - January 12, 1990 - COCOM Policy Towards Eastern Europe and the Soviet Union [1]",
    participants: ["National Security Council"],
    countries: ["United States", "Soviet Union", "Eastern Europe"],
    chapter: chapters.soviet,
    accessStatus: "Restricted - Possibly",
    naid: "446394967",
    localIdentifier: "90007-015",
    objectFilename: "41-bpr-nsc-hfiles-nsr-22_1-90007-015.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSRs_313189297/41-bpr-nsc-hfiles-nsr-22_1-90007-015.pdf",
    source: sources.nsr,
    dateLine: "January 12, 1990",
    subjectLine:
      "National Security Review on COCOM export-control policy as Eastern Europe opened and Soviet economic reform accelerated.",
    topics: ["NSR-22", "COCOM", "Export controls", "Eastern Europe", "Soviet Union"],
    nextAction: "Review PDF for options and interagency tasking behind the subsequent NSD-39 directive.",
    extractionStatus:
      "Pairs with NSD-39 to show how trade, technology, and controls entered the Soviet policy framework."
  }),
  policyRecord({
    id: "1990-05-01-nsd-39-cocom-soviet-446396859",
    date: "1990-05-01",
    title: "NSD-39 - May 01, 1990 - COCOM Policy toward Eastern Europe and Soviet Union",
    participants: ["George H. W. Bush", "National Security Council"],
    countries: ["United States", "Soviet Union", "Eastern Europe"],
    chapter: chapters.soviet,
    accessStatus: "Restricted - Possibly",
    naid: "446396859",
    localIdentifier: "90004-013",
    objectFilename: "41-bpr-nsc-hfiles-nsd-39-90004-013.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSDs_313189290/41-bpr-nsc-hfiles-nsd-39-90004-013.pdf",
    source: sources.nsd,
    dateLine: "May 1, 1990",
    subjectLine:
      "Presidential directive on COCOM policy toward Eastern Europe and the Soviet Union after the NSR-22 review.",
    topics: ["NSD-39", "COCOM", "Export controls", "Technology transfer", "Soviet Union"],
    nextAction: "Review PDF against NSR-22 and tag any implementation memoranda in NSC or State files.",
    extractionStatus:
      "Candidate policy document for the economic and technology-control dimension of U.S.-Soviet policy."
  }),
  policyRecord({
    id: "1990-11-17-nsc-dc-222a-crisis-contingencies-soviet-470761225",
    date: "1990-11-17",
    title: "NSC/DC 222A - November 17, 1990 - NSC/DC Meeting on Crisis Contingencies-Soviet Union",
    documentTitle: "NSC/DC 222A meeting on Soviet crisis contingencies",
    participants: ["National Security Council Deputies Committee"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    accessStatus: "Restricted - Possibly",
    naid: "470761225",
    localIdentifier: "90017-019",
    objectFilename: "41-bpr-nsc-hfiles-dc_mtgs-222a-90017-019.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSC-DC_Mtgs_312294079/41-bpr-nsc-hfiles-dc_mtgs-222a-90017-019.pdf",
    source: sources.dcMeetings,
    dateLine: "November 17, 1990",
    subjectLine:
      "Deputies Committee crisis-contingency planning for instability in the Soviet Union before the 1991 coup and dissolution period.",
    topics: ["NSC Deputies Committee", "Soviet crisis contingencies", "USSR", "Interagency policy"],
    nextAction: "Review PDF for contingency options, agency assignments, and connection to 1991 coup-response documents.",
    extractionStatus:
      "Useful for showing that collapse planning predated the August 1991 crisis and the republic recognition decisions."
  }),
  policyRecord({
    id: "1991-01-01-russia-science-technology-briefing-book-285792229",
    date: "1991-01-01",
    title: "Russia - Science and Technology Briefing Book [1991]",
    participants: ["Office of Science and Technology Policy", "Allan D. Bromley"],
    countries: ["United States", "Russia", "Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "285792229",
    localIdentifier: "62069-003",
    objectFilename: "41-ostp-admin-62069-003.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/foia/2005/2005-0336-F/41-ostp-admin-62069-003.pdf",
    source: sources.bromley,
    dateLine: "1991 file unit",
    subjectLine:
      "Science and technology briefing book for Russia as Soviet authority weakened and bilateral technical channels became policy tools.",
    topics: ["Russia", "Science and technology", "OSTP", "Bromley"],
    nextAction: "Review PDF for briefing memoranda and candidate annotation leads on science diplomacy during the Soviet transition.",
    extractionStatus:
      "Adds a non-summit policy lane that helps compilers track technical cooperation alongside diplomatic recognition."
  }),
  policyRecord({
    id: "1992-01-17-dc-former-soviet-union-470439269",
    date: "1992-01-17",
    title: "DC [Deputies Committee] Meeting, re: Former Soviet Union - January 17, 1992",
    documentTitle: "Deputies Committee meeting on the Former Soviet Union",
    participants: ["National Security Council Deputies Committee", "Jonathan Howe"],
    countries: ["United States", "Russia", "Ukraine", "Newly Independent States", "Former Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470439269",
    localIdentifier: "21365-011",
    objectFilename: "41-bpr-nsc-howe-21365-011.pdf",
    pdfUrl:
      "https://s3.dualstack.us-east-1.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/howe/howe_2554916/41-bpr-nsc-howe-21365-011.pdf",
    source: sources.howe,
    dateLine: "January 17, 1992",
    subjectLine:
      "Early post-dissolution Deputies Committee meeting on policy toward the Former Soviet Union and the newly independent states.",
    topics: ["Former Soviet Union", "Newly Independent States", "NSC Deputies Committee", "Howe"],
    nextAction: "Review PDF for the issue paper, agency tasking, and links to recognition, assistance, and nuclear-inheritance policy.",
    extractionStatus:
      "High-priority Volume IV candidate for the pivot from Soviet policy to Russia/NIS policy after December 1991."
  }),
  policyRecord({
    id: "1992-01-01-russia-reports-285792221",
    date: "1992-01-01",
    sortDate: "1992-01-18",
    title: "Russia - Reports [1992]",
    participants: ["Office of Science and Technology Policy", "Allan D. Bromley"],
    countries: ["United States", "Russia", "Newly Independent States"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "285792221",
    localIdentifier: "62068-006",
    objectFilename: "41-ostp-admin-62068-006.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/foia/2005/2005-0336-F/41-ostp-admin-62068-006.pdf",
    source: sources.bromley,
    dateLine: "1992 file unit",
    subjectLine:
      "OSTP Russia reports file for the first year of post-Soviet bilateral policy and technical cooperation.",
    topics: ["Russia", "Reports", "Science and technology", "OSTP", "Post-Soviet transition"],
    nextAction: "Review PDF for report titles and extract memoranda that support the Russia/NIS policy chronology.",
    extractionStatus:
      "File-unit lead for policy memoranda outside the summit memcon record, especially science and economic modernization issues."
  }),
  policyRecord({
    id: "1992-03-17-nsc-dc-340-technology-transfer-fsu-470761363",
    date: "1992-03-17",
    sortOrder: 1,
    title:
      "NSC/DC 340 - March 17, 1992 - NSC/DC Meeting on Combating Spread of Militarily Useful Technology From Former Soviet Union",
    documentTitle: "NSC/DC 340 on militarily useful technology from the Former Soviet Union",
    participants: ["National Security Council Deputies Committee"],
    countries: ["United States", "Russia", "Newly Independent States", "Former Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470761363",
    localIdentifier: "90021-028",
    objectFilename: "41-bpr-nsc-hfiles-dc_mtgs-340-90021-028.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSC-DC_Mtgs_312294079/41-bpr-nsc-hfiles-dc_mtgs-340-90021-028.pdf",
    source: sources.dcMeetings,
    dateLine: "March 17, 1992",
    subjectLine:
      "Deputies Committee meeting on limiting the spread of militarily useful technology from the Former Soviet Union.",
    topics: ["Technology transfers", "Nonproliferation", "Former Soviet Union", "NSC Deputies Committee"],
    nextAction: "Review PDF for export-control, scientist-redirection, and threat-reduction decision points.",
    extractionStatus:
      "Central candidate for the post-Soviet nonproliferation and technology-transfer policy lane."
  }),
  policyRecord({
    id: "1992-03-17-dc-nonproliferation-470439289",
    date: "1992-03-17",
    sortOrder: 2,
    title: "DC [Deputies Committee] Meeting, re: Non-proliferation - March 17, 1992",
    documentTitle: "Deputies Committee meeting on non-proliferation",
    participants: ["National Security Council Deputies Committee", "Jonathan Howe"],
    countries: ["United States", "Russia", "Ukraine", "Newly Independent States", "Former Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470439289",
    localIdentifier: "21365-031",
    objectFilename: "41-bpr-nsc-howe-21365-031.pdf",
    pdfUrl:
      "https://s3.dualstack.us-east-1.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/howe/howe_2554916/41-bpr-nsc-howe-21365-031.pdf",
    source: sources.howe,
    dateLine: "March 17, 1992",
    subjectLine:
      "Howe file counterpart to the same-day NSC/DC technology-transfer meeting, focused on nonproliferation policy.",
    topics: ["Nonproliferation", "Former Soviet Union", "Ukraine", "Nuclear inheritance", "Howe"],
    nextAction: "Compare with NSC/DC 340 and identify whether this file contains separate minutes, briefing tabs, or follow-up tasking.",
    extractionStatus:
      "Useful for tracing the internal policy record behind nuclear weapons, materials, and technology control in the NIS."
  }),
  policyRecord({
    id: "1992-04-01-yeltsin-kravchuk-congress-470439297",
    date: "1992-04-01",
    title: "Yeltsin / Kravchuk Teleconference with Congressional Leadership - April 1, 1992",
    participants: ["Boris Yeltsin", "Leonid Kravchuk", "Congressional leadership", "Jonathan Howe"],
    countries: ["United States", "Russia", "Ukraine", "Newly Independent States"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470439297",
    localIdentifier: "21365-039",
    objectFilename: "41-bpr-nsc-howe-21365-039.pdf",
    pdfUrl:
      "https://s3.dualstack.us-east-1.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/howe/howe_2554916/41-bpr-nsc-howe-21365-039.pdf",
    source: sources.howe,
    dateLine: "April 1, 1992",
    subjectLine:
      "Russia-Ukraine teleconference file linking Yeltsin, Kravchuk, and Congressional leadership during the NIS assistance and nuclear-security push.",
    topics: ["Yeltsin", "Kravchuk", "Congress", "Ukraine", "NIS assistance"],
    nextAction: "Review PDF for memoranda, call preparation, and Congressional assistance or nuclear-security framing.",
    extractionStatus:
      "Good policy-context lead for how the administration worked Russia and Ukraine together after Soviet dissolution."
  }),
  policyRecord({
    id: "1992-05-13-dc-nuclear-reactor-safety-fsu-470761512",
    date: "1992-05-13",
    title: "DC Meeting-Nuclear Reactor Safety in Former Soviet Union May 13, 1992 4:00 Situation Room",
    documentTitle: "Deputies Committee meeting on nuclear reactor safety in the Former Soviet Union",
    participants: ["National Security Council Deputies Committee"],
    countries: ["United States", "Russia", "Ukraine", "Newly Independent States", "Former Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470761512",
    localIdentifier: "90043-048",
    objectFilename: "41-bpr-nsc-hfiles-dc_mtgs_foll_up-90043-048.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/H-Files/NSC-DC_Mtgs_Foll-up_312294094/41-bpr-nsc-hfiles-dc_mtgs_foll_up-90043-048.pdf",
    source: sources.dcFollowUp,
    dateLine: "May 13, 1992",
    subjectLine:
      "Deputies Committee follow-up file on nuclear reactor safety in the Former Soviet Union.",
    topics: ["Nuclear reactor safety", "Former Soviet Union", "NSC Deputies Committee", "Technical assistance"],
    nextAction: "Review PDF for follow-up decisions and locate related OSTP, Energy, and State Department memoranda.",
    extractionStatus:
      "Strengthens the NIS policy lane beyond weapons inheritance by adding civilian nuclear safety and assistance."
  }),
  policyRecord({
    id: "1992-06-16-yeltsin-state-visit-briefing-book-470768955",
    date: "1992-06-16",
    title: "Presidential Briefing Book: State Visit of Russian President Boris Yeltsin, 6/16-18/92",
    participants: ["George H. W. Bush", "Boris Yeltsin", "National Security Council"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    accessStatus: "Restricted - Possibly",
    naid: "470768955",
    localIdentifier: "CF01692-011",
    objectFilename: "41-bpr-nsc-sum_brief_bks-cf01692-011.pdf",
    pdfUrl:
      "https://s3.dualstack.us-east-1.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/gb-nsc/sum_brief_books_376217868/41-bpr-nsc-sum_brief_bks-cf01692-011.pdf",
    source: sources.summitBriefing,
    dateLine: "June 16-18, 1992",
    subjectLine:
      "Briefing book for Yeltsin's state visit, a policy-context companion to the Volume III high-level-contact record.",
    topics: ["Yeltsin state visit", "Russia policy", "Briefing book", "Summit preparation"],
    nextAction: "Review PDF for issue papers, objectives, and memoranda that can annotate the June 1992 Bush-Yeltsin contacts.",
    extractionStatus:
      "Cross-volume anchor: keep summit conversations in Volume III, but mine the briefing book for Volume IV policy documents."
  }),
  policyRecord({
    id: "1992-08-14-us-russia-science-technology-consultations-285792647",
    date: "1992-08-14",
    title: "Consultations on the US-Russia Science and Technology Relationship [Aug 14, 1992]",
    participants: ["Office of Science and Technology Policy", "John O'Neil"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    accessStatus: "Unrestricted",
    naid: "285792647",
    localIdentifier: "62093-009",
    objectFilename: "41-ostp-admin-62093-009.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/foia/2005/2005-0336-F/41-ostp-admin-62093-009.pdf",
    source: sources.oneilRussia,
    dateLine: "August 14, 1992",
    subjectLine:
      "OSTP consultations file on the U.S.-Russia science and technology relationship after Soviet dissolution.",
    topics: ["U.S.-Russia science and technology", "OSTP", "Technical cooperation", "Russia"],
    nextAction: "Review PDF for meeting memoranda, agreed work streams, and references to broader Russia assistance policy.",
    extractionStatus:
      "Adds a technical-cooperation policy record that complements the national-security Deputies Committee files."
  }),
  policyRecord({
    id: "1992-08-15-former-soviet-union-science-agreements-285792661",
    date: "1992-08-15",
    title: "Bilateral Agreements - Former Soviet Union Science",
    participants: ["Office of Science and Technology Policy", "John O'Neil"],
    countries: ["United States", "Russia", "Newly Independent States", "Former Soviet Union"],
    chapter: chapters.collapse,
    accessStatus: "Unrestricted",
    naid: "285792661",
    localIdentifier: "62095-001",
    objectFilename: "41-ostp-admin-62095-001.pdf",
    pdfUrl:
      "https://s3.amazonaws.com/NARAprodstorage/lz/presidential-libraries/bush/foia/2005/2005-0336-F/41-ostp-admin-62095-001.pdf",
    source: sources.oneilFsu,
    dateLine: "1992 file unit",
    subjectLine:
      "OSTP file on bilateral science agreements with Former Soviet Union countries.",
    topics: ["Former Soviet Union", "Bilateral agreements", "Science diplomacy", "OSTP"],
    nextAction: "Review PDF for agreement texts, clearance memoranda, and country-specific NIS cooperation leads.",
    extractionStatus:
      "Useful for fleshing out the policy apparatus for NIS scientific engagement beyond leader-level diplomacy."
  })
];

const seedIds = new Set(records.map((record) => record.id));
const current = JSON.parse(fs.readFileSync(dataPath, "utf8")).filter((record) => !seedIds.has(record.id));
const archiveIndex = current.findIndex((record) => record.chapter?.name === "Archive Leads");
const nextRecords =
  archiveIndex === -1
    ? [...current, ...records]
    : [...current.slice(0, archiveIndex), ...records, ...current.slice(archiveIndex)];

fs.writeFileSync(dataPath, `${JSON.stringify(nextRecords, null, 2)}\n`);
fs.writeFileSync(jsPath, `window.MEMCONS = ${JSON.stringify(nextRecords, null, 2)};\n`);

console.log(`Seeded ${records.length} policy records into ${path.relative(process.cwd(), dataPath)}.`);
