#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "memcons.json");
const JS_PATH = path.join(__dirname, "..", "data", "memcons.js");
const REPORT_PATH = path.join(__dirname, "..", "reports", "google-drive-public-papers-cheney-hits.json");
const SEED_REPORT_PATH = path.join(
  __dirname,
  "..",
  "reports",
  "google-drive-public-papers-cheney-seed.json"
);

const seedBatch = "google-drive-public-papers-cheney-2026-05-21";

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

const publicPapersSource = {
  type: "Google Drive OCR PDF",
  title: "GHBPublicPapers.pdf",
  shortName: "Public Papers",
  url: "https://drive.google.com/file/d/1IkvlmMXlSFVjVZnKfcJkkLJg2RaCAM6b"
};

const cheneySource = {
  type: "Google Drive folder",
  title: "SecDef Cheney Public Statements",
  shortName: "Cheney Public Statements",
  url: "https://drive.google.com/drive/folders/1lNMHlCL0YsHjJbrVlBDECtKL9_QTHvU2"
};

const cheneyVolumes = [
  ["1989 Cheney Public Statements Vol 1.pdf", "https://drive.google.com/file/d/1eH9cKhYTLc5mQ34BGYD87ZZZdRb4TXkP"],
  ["1989 Cheney Public Statements Vol 2.pdf", "https://drive.google.com/file/d/1Wj-ylyTj8ngmbKeIaLP_NIzzahNmg7er"],
  ["1989 Cheney Public Statements Vol 3.pdf", "https://drive.google.com/file/d/1enSawy6JIwpOiBHWkKyNuD-sn4dAFNvn"],
  ["1990 Cheney Public Statements Vol 1.pdf", "https://drive.google.com/file/d/1A3ewJdfm8jsKTJoF-Z0G5FuHD4atab-I"],
  ["1990 Cheney Public Statements Vol 2.pdf", "https://drive.google.com/file/d/1qO1axoN0WG4ElXQj4DrkJbG2yh2n20Xj"],
  ["1990 Cheney Public Statements Vol 3.pdf", "https://drive.google.com/file/d/1c6wmrUXIqZQH9KTm-8KLng1UaqOMU-A0"],
  ["1991 Cheney Public Statements Vol 1.pdf", "https://drive.google.com/file/d/1YULvfuQalr5gE-KGx5o2b4NyQ_0iCmjc"],
  ["1991 Cheney Public Statements Vol 2.pdf", "https://drive.google.com/file/d/1aONtT3dZt2BYifiBhbMbuS1NTOV7XMTV"],
  ["1991 Cheney Public Statements Vol 3.pdf", "https://drive.google.com/file/d/1Xwniis8jvRGqQnA8kKRPG3s-V6Nxy97R"],
  ["1991 Cheney Public Statements Vol 4.pdf", "https://drive.google.com/file/d/1UP_lcC13oPzkhjTB-QZ1l_cAGPJ4oIQz"],
  ["1992 Cheney Public Statements Vol 1.pdf", "https://drive.google.com/file/d/1F8ISzuGEId4FJ7hCwo1bnsbu5lPI0J_7"]
].map(([title, url]) => ({ title, url }));

const publicPaperRecords = [
  {
    id: "public-papers-1989-02-16-soviet-withdrawal-afghanistan",
    date: "1989-02-16",
    title: "Statement on the Soviet Withdrawal From Afghanistan",
    participants: ["George H. W. Bush", "White House Office of the Press Secretary"],
    countries: ["United States", "Soviet Union", "Afghanistan"],
    chapter: chapters.soviet,
    subjectLine:
      "Early Bush administration public baseline on Soviet retrenchment, regional conflicts, and the U.S.-Soviet relationship after the Afghan withdrawal.",
    topics: ["Afghanistan", "Soviet withdrawal", "Regional conflicts", "U.S.-Soviet relations"],
    nextAction:
      "Use as a public-policy anchor for internal memoranda on Soviet regional retrenchment and the early Bush review of policy toward Gorbachev.",
    textLine: 36357
  },
  {
    id: "public-papers-1989-09-23-gorbachev-summit-statement",
    date: "1989-09-23",
    title: "Statement on the Summit Meeting With Soviet President Gorbachev",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "James A. Baker III", "Eduard Shevardnadze"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Public framing of the post-Wyoming U.S.-Soviet agenda: human rights, bilateral relations, arms control, regional issues, and transnational issues.",
    topics: ["Malta lead-up", "U.S.-Soviet agenda", "Arms control", "Human rights"],
    nextAction:
      "Pair with Scowcroft/Rice and State preparatory memoranda for the Malta and Washington summit lanes.",
    textLine: 109626
  },
  {
    id: "public-papers-1989-12-04-malta-fact-sheet",
    date: "1989-12-04",
    title: "White House Fact Sheet on the Meeting With Soviet Chairman Mikhail Gorbachev in Malta",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "White House Office of the Press Secretary"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Public summary of Malta follow-up on summit timing, foreign-minister preparation, trade/MFN, GATT observer status, technical economic cooperation, export credits, and a bilateral investment treaty.",
    topics: ["Malta", "Trade", "Technical economic cooperation", "Bilateral investment treaty"],
    nextAction:
      "Use the public fact-sheet bullets as checklist items when mining Malta follow-up memoranda and economic-policy tasking.",
    textLine: 132401
  },
  {
    id: "public-papers-1990-03-11-lithuanian-independence",
    date: "1990-03-11",
    title: "Statement by Press Secretary Fitzwater on the Restoration of Lithuanian Independence",
    participants: ["Marlin Fitzwater", "White House Office of the Press Secretary"],
    countries: ["United States", "Lithuania", "Soviet Union", "Estonia", "Latvia"],
    chapter: chapters.soviet,
    subjectLine:
      "Baltic nonrecognition policy and U.S. request that Moscow resolve Lithuania's declaration peacefully through negotiations.",
    topics: ["Lithuania", "Baltic states", "Self-determination", "Nonrecognition policy"],
    nextAction:
      "Cross-check against NSC and State memoranda on Baltic recognition, crisis response, and managing relations with Gorbachev.",
    textLine: 170044
  },
  {
    id: "public-papers-1990-04-20-soviet-sanctions-lithuania",
    date: "1990-04-20",
    title: "Statement by Press Secretary Fitzwater on Soviet Economic Sanctions Against Lithuania",
    participants: ["Marlin Fitzwater", "George H. W. Bush", "White House Office of the Press Secretary"],
    countries: ["United States", "Lithuania", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Public warning that Soviet economic pressure on Lithuania triggered allied consultations and possible U.S. response options.",
    topics: ["Lithuania", "Soviet sanctions", "Allied consultations", "Baltic crisis"],
    nextAction:
      "Mine Scowcroft and NSC files for options papers around sanctions, allied coordination, and summit-management tradeoffs.",
    textLine: 180801
  },
  {
    id: "public-papers-1991-01-13-lithuania-military-intervention",
    date: "1991-01-13",
    title: "Remarks on Soviet Military Intervention in Lithuania and a Question-and-Answer Session With Reporters",
    participants: ["George H. W. Bush", "White House press corps"],
    countries: ["United States", "Lithuania", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Public crisis statement after Soviet military action in Lithuania, useful for reconstructing the administration's Baltic force-use response.",
    topics: ["Lithuania", "Soviet military intervention", "Baltic crisis", "Crisis response"],
    nextAction:
      "Match against January 1991 NSC, State, and Scowcroft memoranda on sanctions, arms control linkage, and Gorbachev messaging.",
    textLine: 269645
  },
  {
    id: "public-papers-1991-07-31-start-fact-sheet",
    date: "1991-07-31",
    title: "White House Fact Sheet on The Strategic Arms Reduction Treaty (START)",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "White House Office of the Press Secretary"],
    countries: ["United States", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "Official public explanation of START central limits, warhead accountability, downloading, verification, inspections, notifications, and elimination procedures.",
    topics: ["START I", "Strategic arms", "Verification", "Moscow summit"],
    nextAction:
      "Use as the public-control document when selecting internal START implementation, ratification, and republic-succession memoranda.",
    textLine: 321877
  },
  {
    id: "public-papers-1991-08-01-kiev-supreme-soviet",
    date: "1991-08-01",
    title: "Remarks to the Supreme Soviet of the Republic of the Ukraine in Kiev, Soviet Union",
    participants: ["George H. W. Bush", "Leonid Kravchuk", "Supreme Soviet of Ukraine"],
    countries: ["United States", "Ukraine", "Soviet Union"],
    chapter: chapters.soviet,
    subjectLine:
      "The Kiev address lays out the administration's pre-coup position on reform, republican autonomy, nationalism, democracy, economic liberty, and U.S. relations with Ukraine.",
    topics: ["Ukraine", "Kiev", "Republics policy", "Democracy", "Economic reform"],
    nextAction:
      "Use as a public anchor for internal debate over Gorbachev, republican movements, and the 'Chicken Kiev' policy line before the August coup.",
    textLine: 322328
  },
  {
    id: "public-papers-1991-08-19-attempted-coup",
    date: "1991-08-19",
    title: "Statement on the Attempted Coup in the Soviet Union",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "Boris Yeltsin", "Gennady Yanayev"],
    countries: ["United States", "Soviet Union", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Presidential statement on the coup against Gorbachev, constitutional legitimacy, Yeltsin's resistance, and the U.S. crisis posture.",
    topics: ["August coup", "Gorbachev", "Yeltsin", "Crisis management"],
    nextAction:
      "Triangulate with August 19-22 Daily Files, NSC/DC crisis files, and Volume III telcons to reconstruct decision timing.",
    textLine: 326044
  },
  {
    id: "public-papers-1991-09-25-kravchuk-meeting",
    date: "1991-09-25",
    title: "Statement by Press Secretary Fitzwater on the President's Meeting With Chairman Leonid M. Kravchuk of the Supreme Rada of the Republic of the Ukraine",
    participants: ["George H. W. Bush", "Leonid Kravchuk", "Marlin Fitzwater", "Ed Hewett"],
    countries: ["United States", "Ukraine", "Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Post-coup White House statement on Ukraine's democratic and economic transition, trade promotion, OPIC/Ex-Im/CCC contacts, and Babi Yar follow-up.",
    topics: ["Ukraine", "Kravchuk", "Economic reform", "Trade"],
    nextAction:
      "Find the White House and State memoranda behind the Kravchuk meeting and the economic-team follow-up led by Ed Hewett.",
    textLine: 336119
  },
  {
    id: "public-papers-1991-09-27-nuclear-initiatives",
    date: "1991-09-27",
    title: "Address to the Nation on Reducing United States and Soviet Nuclear Weapons",
    participants: ["George H. W. Bush", "Dick Cheney", "Mikhail Gorbachev", "Boris Yeltsin"],
    countries: ["United States", "Soviet Union", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Presidential Nuclear Initiatives speech: tactical nuclear withdrawals, strategic standdowns, Soviet reciprocal requests, nuclear safety, dismantlement, and command-control cooperation.",
    topics: ["Presidential Nuclear Initiatives", "Tactical nuclear weapons", "Nuclear safety", "Command and control"],
    nextAction:
      "Pair with Bartholomew/NSC PNI memoranda and Cheney/JCS implementation files, especially republic custody and dismantlement concerns.",
    textLine: 336626
  },
  {
    id: "public-papers-1991-11-20-food-assistance-soviet-union",
    date: "1991-11-20",
    title: "Statement by Press Secretary Fitzwater on Food Assistance to the Soviet Union",
    participants: ["George H. W. Bush", "Edward Madigan", "White House Office of the Press Secretary"],
    countries: ["United States", "Soviet Union", "Russia", "Armenia", "Ukraine", "Kazakhstan", "Uzbekistan"],
    chapter: chapters.collapse,
    subjectLine:
      "Public decision to provide $1.5 billion more in food assistance, including CCC credits, humanitarian aid, and technical assistance to Union and republic food systems.",
    topics: ["Food assistance", "Humanitarian aid", "CCC credits", "Republics policy"],
    nextAction:
      "Mine agriculture, State, NSC, and Daily File material for policy tradeoffs over humanitarian aid, debt responsibility, and republic distribution.",
    textLine: 356643
  },
  {
    id: "public-papers-1991-12-25-gorbachev-resignation",
    date: "1991-12-25",
    sortOrder: 1,
    title: "Statement on the Resignation of Mikhail Gorbachev as President of the Soviet Union",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "Eduard Shevardnadze"],
    countries: ["United States", "Soviet Union", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Public appraisal of Gorbachev's resignation, reform legacy, end of the cold war, arms reductions, and the basis for working with successor states.",
    topics: ["Gorbachev resignation", "Soviet dissolution", "Cold War end", "Arms reductions"],
    nextAction:
      "Use with December 1991 recognition files and transition memoranda to anchor the shift from Soviet policy to Russia/NIS policy.",
    textLine: 367263
  },
  {
    id: "public-papers-1991-12-25-cis-address",
    date: "1991-12-25",
    sortOrder: 2,
    title: "Address to the Nation on the Commonwealth of Independent States",
    participants: ["George H. W. Bush", "Mikhail Gorbachev", "Boris Yeltsin"],
    countries: [
      "United States",
      "Russia",
      "Ukraine",
      "Armenia",
      "Kazakhstan",
      "Belarus",
      "Kyrgyzstan",
      "Moldova",
      "Turkmenistan",
      "Azerbaijan",
      "Tajikistan",
      "Georgia",
      "Uzbekistan"
    ],
    chapter: chapters.collapse,
    subjectLine:
      "Christmas 1991 recognition address: Russia, Ukraine, Armenia, Kazakhstan, Belarus, Kyrgyzstan, and the remaining former Soviet republics; nuclear safety, democracy, and free-market assurances.",
    topics: ["CIS", "Recognition", "Russia", "Ukraine", "Nuclear safety"],
    nextAction:
      "Cross-reference with recognition options papers, embassy transition files, UN-seat memoranda, and nuclear-control assurances from the new states.",
    textLine: 367297
  },
  {
    id: "public-papers-1992-02-27-kravchuk-telcon",
    date: "1992-02-27",
    title: "Statement by Press Secretary Fitzwater on the President's Telephone Conversation With President Leonid Kravchuk of Ukraine",
    participants: ["George H. W. Bush", "Leonid Kravchuk", "Marlin Fitzwater"],
    countries: ["United States", "Ukraine", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Public readout that Kravchuk pledged tactical nuclear withdrawal, START support, CFE support, and a May 1992 Washington visit.",
    topics: ["Ukraine", "Tactical nuclear weapons", "START", "CFE", "Kravchuk"],
    nextAction:
      "Compare with the underlying telcon file, Nunn-Lugar leads, and Ukraine nuclear-withdrawal intelligence/source copies.",
    textLine: 395470
  },
  {
    id: "public-papers-1992-04-01-aid-former-soviet-union",
    date: "1992-04-01",
    title: "The President's News Conference on Aid to the States of the Former Soviet Union",
    participants: ["George H. W. Bush", "James A. Baker III", "Nicholas Brady", "Edward Madigan"],
    countries: ["United States", "Russia", "Ukraine", "Belarus", "Armenia", "Former Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Comprehensive public roll-out of the aid package for Russia, Ukraine, and other successor states, including IFI support, FREEDOM Support legislation, and agricultural credits.",
    topics: ["Aid package", "FREEDOM Support Act", "IFI", "Russia reform", "Ukraine"],
    nextAction:
      "Use to organize internal records on the April 1992 assistance package, allied coordination, IMF/G-7 diplomacy, and congressional strategy.",
    textLine: 405650
  },
  {
    id: "public-papers-1992-04-03-freedom-support-proposed",
    date: "1992-04-03",
    title: "Message to the Congress Transmitting the FREEDOM Support Act Proposed Legislation",
    participants: ["George H. W. Bush", "United States Congress"],
    countries: ["United States", "Russia", "Ukraine", "Armenia", "Former Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Legislative transmittal defining FREEDOM Support Act authorities: humanitarian aid, demilitarization, nuclear power safety, technical assistance, democratization, military-to-military programs, trade, investment, IMF, and U.S. presence.",
    topics: ["FREEDOM Support Act", "Demilitarization", "Nuclear safety", "Technical assistance", "Trade"],
    nextAction:
      "Follow the ten elements into NSC, State, Defense, Treasury, AID, and congressional liaison memoranda.",
    textLine: 406449
  },
  {
    id: "public-papers-1992-05-06-ukraine-joint-declaration",
    date: "1992-05-06",
    title: "Joint Declaration With President Leonid Kravchuk of Ukraine",
    participants: ["George H. W. Bush", "Leonid Kravchuk"],
    countries: ["United States", "Ukraine", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "U.S.-Ukrainian democratic partnership declaration, with attention to Ukraine's sovereignty, nuclear removal/NPT commitments, Chernobyl, science and technology, trade, investment, and Peace Corps ties.",
    topics: ["Ukraine", "Kravchuk", "NPT", "Nuclear removal", "Economic assistance"],
    nextAction:
      "Mine the Kravchuk briefing book, Daily File packet, and Nunn-Lugar source copies for the internal commitments behind the declaration.",
    textLine: 416082
  },
  {
    id: "public-papers-1992-05-19-kazakhstan-joint-declaration",
    date: "1992-05-19",
    title: "Joint Declaration With President Nursultan Nazarbayev of Kazakhstan",
    participants: ["George H. W. Bush", "Nursultan Nazarbayev"],
    countries: ["United States", "Kazakhstan", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "U.S.-Kazakhstan declaration on START, Kazakhstan's NPT accession as a non-nuclear state, elimination of nuclear weapons, nonproliferation controls, reform, trade, OPIC, and bilateral dialogue.",
    topics: ["Kazakhstan", "Nazarbayev", "NPT", "START", "Nuclear inheritance"],
    nextAction:
      "Use with the Nazarbayev memcon and Daily File packet to extract policy on Kazakhstan's nuclear inheritance and U.S. assistance.",
    textLine: 421206
  },
  {
    id: "public-papers-1992-06-17-yeltsin-news-conference",
    date: "1992-06-17",
    sortOrder: 1,
    title: "The President's News Conference With President Boris Yeltsin of Russia",
    participants: ["George H. W. Bush", "Boris Yeltsin", "Yegor Gaydar", "Dmitri Volkogonov"],
    countries: ["United States", "Russia", "Former Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "First U.S.-Russia summit news conference: Washington Charter, strategic reductions, FREEDOM Support, IMF/G-7 support, POW/MIA and KAL archives, global defense, and assistance.",
    topics: ["Yeltsin", "Washington Charter", "FREEDOM Support Act", "POW/MIA", "Assistance"],
    nextAction:
      "Link the public claims to the June 1992 briefing book, U.S.-Russia agreements, assistance files, and congressional strategy records.",
    textLine: 430583
  },
  {
    id: "public-papers-1992-06-17-joint-understanding-strategic-arms",
    date: "1992-06-17",
    sortOrder: 2,
    title: "Joint Understanding on Reductions in Strategic Offensive Arms",
    participants: ["George H. W. Bush", "Boris Yeltsin"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Bush-Yeltsin agreement to pursue START II-level reductions, including 3,000-3,500 warheads, elimination of MIRVed ICBMs, SLBM limits, and START-based procedures.",
    topics: ["START II", "Strategic offensive arms", "Yeltsin", "Nuclear reductions"],
    nextAction:
      "Use as the public companion for internal START II negotiation, financing, and Russia ratification records.",
    textLine: 431120
  },
  {
    id: "public-papers-1992-06-17-global-protection-system",
    date: "1992-06-17",
    sortOrder: 3,
    title: "Joint United States-Russian Statement on a Global Protection System",
    participants: ["George H. W. Bush", "Boris Yeltsin"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Joint statement to explore ballistic missile defenses, early-warning sharing, and legal bases for cooperation as part of a nonproliferation strategy.",
    topics: ["Global Protection System", "Ballistic missile defense", "Early warning", "Nonproliferation"],
    nextAction:
      "Follow into Defense, State, and NSC memoranda on SDI/GPS cooperation, ABM implications, and Russian technical engagement.",
    textLine: 431171
  },
  {
    id: "public-papers-1992-06-17-defense-conversion",
    date: "1992-06-17",
    sortOrder: 4,
    title: "Joint Russian-American Declaration on Defense Conversion",
    participants: ["George H. W. Bush", "Boris Yeltsin"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "Joint declaration creating a defense-conversion channel through trade, investment, export controls, business centers, resident advisers, and U.S.-Russian military contacts.",
    topics: ["Defense conversion", "Export controls", "COCOM", "Business development", "Military-to-military"],
    nextAction:
      "Mine Commerce, Defense, NSC, and State files for conversion implementation records and export-control policy toward Russia/NIS.",
    textLine: 431226
  },
  {
    id: "public-papers-1992-06-19-start-protocol-senate",
    date: "1992-06-19",
    title: "Message to the Senate Transmitting a Protocol to the Strategic Arms Reduction Treaty",
    participants: ["George H. W. Bush", "United States Senate"],
    countries: ["United States", "Russia", "Ukraine", "Belarus", "Kazakhstan"],
    chapter: chapters.collapse,
    subjectLine:
      "Senate transmittal of the START protocol binding Belarus, Kazakhstan, Russia, and Ukraine and obligating Belarus, Kazakhstan, and Ukraine to join the NPT as non-nuclear states.",
    topics: ["Lisbon Protocol", "START I", "NPT", "Ukraine", "Belarus", "Kazakhstan"],
    nextAction:
      "Use with Lisbon Protocol files, Senate ratification materials, and Nunn-Lugar records on nuclear weapons removal from the non-Russian republics.",
    textLine: 432546
  },
  {
    id: "public-papers-1992-10-24-freedom-support-act-signing",
    date: "1992-10-24",
    title: "Statement on Signing the FREEDOM Support Act",
    participants: ["George H. W. Bush", "United States Congress"],
    countries: ["United States", "Russia", "Ukraine", "Armenia", "Former Soviet Union"],
    chapter: chapters.collapse,
    subjectLine:
      "Signing statement for Public Law 102-511, authorizing assistance for free market and democratic reforms, IMF support, bilateral aid, demilitarization, humanitarian aid, nuclear reactor safety, exchanges, and weapons destruction.",
    topics: ["FREEDOM Support Act", "Demilitarization", "Weapons destruction", "Humanitarian assistance", "NIS"],
    nextAction:
      "Track implementation records across State/AID, Defense Nunn-Lugar, Treasury/IMF, and NSC coordinating files.",
    textLine: 486489
  },
  {
    id: "public-papers-1992-11-19-baltic-russian-cis-forces-withdrawal",
    date: "1992-11-19",
    title: "Letter to Congressional Leaders Transmitting a Report on Withdrawal of Russian and Commonwealth of Independent States Armed Forces from the Baltic Countries",
    participants: ["George H. W. Bush", "United States Congress"],
    countries: ["United States", "Russia", "Estonia", "Latvia", "Lithuania", "Commonwealth of Independent States"],
    chapter: chapters.collapse,
    subjectLine:
      "Public transmittal of a report on Russian/CIS force withdrawal from Estonia, Latvia, and Lithuania and negotiations for a timetable.",
    topics: ["Baltic states", "Russian forces", "CIS forces", "Troop withdrawal"],
    nextAction:
      "Find the attached report and related State/NSC memoranda on Baltic troop withdrawal diplomacy.",
    textLine: 498275
  },
  {
    id: "public-papers-1992-12-30-start-ii-announcement",
    date: "1992-12-30",
    title: "Remarks on the START II Treaty and the Situation in Somalia and an Exchange With Reporters",
    participants: ["George H. W. Bush", "Boris Yeltsin", "Lawrence Eagleburger", "Dick Cheney", "Colin Powell"],
    countries: ["United States", "Russia"],
    chapter: chapters.collapse,
    subjectLine:
      "End-of-administration announcement that U.S. and Russian teams completed agreement on START II and that Bush and Yeltsin would sign at Sochi.",
    topics: ["START II", "Yeltsin", "Eagleburger", "Cheney", "Transition"],
    nextAction:
      "Use as a final 1992 public anchor for START II negotiation files and Bush-Clinton transition handoff records.",
    textLine: 500938
  }
];

const sourceLeads = [
  {
    id: "source-lead-google-drive-public-papers-1989-1992",
    date: "1989-01-20",
    sortDate: "1989-01-20",
    sortOrder: 1200,
    type: "Source Lead",
    title: "Public Papers of the President, 1989-1992, Google Drive OCR file",
    documentTitle: "GHBPublicPapers.pdf",
    participants: ["George H. W. Bush", "White House Office of the Press Secretary", "Google Drive"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter: chapters.archives,
    releaseStatus: "Google Drive file located and text extracted locally",
    catalogUrl: publicPapersSource.url,
    pdfUrl: publicPapersSource.url,
    digitalObjects: 1,
    source: publicPapersSource,
    dateLine: "Google Drive search, May 21, 2026",
    subjectLine:
      "Drive search located a single OCR PDF covering George H. W. Bush Public Papers; local extraction produced a searchable text corpus used for this curated pass.",
    sourceNote: `Source: user Google Drive, ${publicPapersSource.title}, ${publicPapersSource.url}. Local OCR/text extraction: 15,526-page PDF, approximately 30 MB text file.`,
    frusSourceNote:
      "Public Papers companion source; cite official Public Papers item or the Drive source copy only after reconciling with preferred publication text.",
    topics: ["Public Papers", "Google Drive", "Public source", "Research corpus"],
    potentialFrusDocument: false,
    countStatus: "Public Papers source lead",
    nextAction:
      "Reconcile high-value Public Papers hits with official public-papers citations and use them as public-policy anchors for internal document selection.",
    extractionStatus:
      "Drive connector located GHBPublicPapers.pdf; file was downloaded through the connector and processed with pdftotext for term mining.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    googleDriveMining: {
      sourceFile: publicPapersSource.url,
      extractedTextPath: "local-cache/frus-drive-public-papers/GHBPublicPapers.txt",
      pdfPages: 15526,
      selectedPublicPapers: publicPaperRecords.length
    },
    seedBatch
  },
  {
    id: "source-lead-google-drive-cheney-public-statements",
    date: "1989-03-20",
    sortDate: "1989-03-20",
    sortOrder: 1201,
    type: "Source Lead",
    title: "Secretary of Defense Cheney Public Statements, Google Drive OCR queue",
    documentTitle: "SecDef Cheney Public Statements, 1989-1992",
    participants: ["Dick Cheney", "Department of Defense", "Google Drive"],
    countries: ["United States", "Soviet Union", "Russia", "Former Soviet Union"],
    chapter: chapters.archives,
    releaseStatus: "Google Drive folder located; PDF volumes require OCR before deep mining",
    catalogUrl: cheneySource.url,
    pdfUrl: cheneySource.url,
    digitalObjects: cheneyVolumes.length,
    source: cheneySource,
    dateLine: "Google Drive search, May 21, 2026",
    subjectLine:
      "Drive folder contains 11 Cheney public-statement volumes for 1989-1992; connector text extraction returned empty content for sampled PDFs, so the set is staged as an OCR queue.",
    sourceNote: `Source: user Google Drive, ${cheneySource.title}, ${cheneySource.url}. Folder contains ${cheneyVolumes.length} PDF volumes plus a separate 901207 Cheney press-conference PDF hit.`,
    frusSourceNote:
      "Defense public-statement source lead only; OCR and reconcile against official DOD/Secretary of Defense Public Statements citations before FRUS use.",
    topics: ["Cheney", "Defense policy", "Public statements", "OCR queue", "Nuclear posture"],
    potentialFrusDocument: false,
    countStatus: "Google Drive source lead; OCR required",
    nextAction:
      "OCR the Cheney volumes and search for Soviet, USSR, Russia, Yeltsin, Gorbachev, Ukraine, START, Nunn-Lugar, CFE, nuclear, base force, and defense conversion terms.",
    extractionStatus:
      "Drive connector listed the folder and 11 PDF volumes. Text fetch returned empty content on sampled items, indicating image-only or non-extracted PDFs.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "Source lead",
    frusVolume: volumeIv,
    googleDriveMining: {
      sourceFolder: cheneySource.url,
      volumes: cheneyVolumes,
      sampledEmptyText: [
        "1991 Cheney Public Statements Vol 4.pdf",
        "1992 Cheney Public Statements Vol 1.pdf",
        "901207 Cheney Press Conference at DPC and NPC.pdf"
      ]
    },
    seedBatch
  },
  {
    id: "drive-1990-12-07-cheney-press-conference-ocr-lead",
    date: "1990-12-07",
    sortDate: "1990-12-07",
    sortOrder: 1,
    type: "Policy Lead",
    title: "901207 Cheney Press Conference at DPC and NPC.pdf",
    documentTitle: "Cheney Press Conference at DPC and NPC",
    participants: ["Dick Cheney", "Department of Defense", "Defense Policy Council", "National Press Club"],
    countries: ["United States", "Soviet Union", "Russia"],
    chapter: chapters.soviet,
    releaseStatus: "Google Drive PDF hit; connector text extraction returned empty content",
    catalogUrl: "https://drive.google.com/file/d/0B4xiXXj9ooNgY1lPQTQtWlJNSHFMazdXV3FibXN3dTc5dmJJ",
    pdfUrl: "https://drive.google.com/file/d/0B4xiXXj9ooNgY1lPQTQtWlJNSHFMazdXV3FibXN3dTc5dmJJ",
    digitalObjects: 1,
    source: {
      type: "Google Drive PDF",
      title: "901207 Cheney Press Conference at DPC and NPC.pdf",
      shortName: "Cheney DPC/NPC press conference",
      url: "https://drive.google.com/file/d/0B4xiXXj9ooNgY1lPQTQtWlJNSHFMazdXV3FibXN3dTc5dmJJ"
    },
    dateLine: "December 7, 1990",
    subjectLine:
      "Standalone Cheney press-conference PDF located by the Drive search; likely useful for defense posture and post-Cold War public framing once OCR is available.",
    sourceNote:
      "Source copy found in user Google Drive: 901207 Cheney Press Conference at DPC and NPC.pdf, https://drive.google.com/file/d/0B4xiXXj9ooNgY1lPQTQtWlJNSHFMazdXV3FibXN3dTc5dmJJ.",
    frusSourceNote:
      "Drive source-copy lead; OCR and reconcile against official Department of Defense Public Statements citation before use.",
    topics: ["Cheney", "Defense policy", "Public statements", "OCR queue", "Post-Cold War force posture"],
    potentialFrusDocument: false,
    countStatus: "Cheney public-statement OCR lead",
    nextAction:
      "Run OCR, then search for Soviet, Russia, Gorbachev, Yeltsin, CFE, START, nuclear, base force, and defense conversion references.",
    extractionStatus:
      "Drive search found two copies of this PDF. Fetching text through the connector returned an empty content field, so it is staged for OCR rather than text-mined selection.",
    volumeRole: "volume-iv-source-lead",
    volumeStatus: "OCR required",
    frusVolume: volumeIv,
    seedBatch
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

function dateLine(date) {
  const value = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function publicPapersRecord(record, index) {
  return {
    id: record.id,
    date: record.date,
    sortDate: record.date,
    sortOrder: record.sortOrder || index + 1,
    type: "Policy Lead",
    title: record.title,
    documentTitle: record.title,
    participants: record.participants,
    countries: record.countries,
    chapter: record.chapter,
    releaseStatus: "Public Papers text located in Google Drive OCR corpus",
    catalogUrl: publicPapersSource.url,
    pdfUrl: publicPapersSource.url,
    digitalObjects: 1,
    source: publicPapersSource,
    dateLine: dateLine(record.date),
    subjectLine: record.subjectLine,
    sourceNote: `Source: Public Papers of the Presidents, George H. W. Bush, ${record.title}, ${dateLine(
      record.date
    )}; source copy mined from user Google Drive ${publicPapersSource.url}. Extracted-text line anchor: ${record.textLine}.`,
    frusSourceNote:
      "Public Papers companion document; use to triangulate public policy framing, then cite archival/internal documents for FRUS selection.",
    topics: record.topics,
    potentialFrusDocument: false,
    countStatus: "Public Papers companion policy document",
    nextAction: record.nextAction,
    extractionStatus:
      "Selected from the Drive-hosted Public Papers OCR corpus by targeted Russia/FSU policy mining; staged as a chronological public-policy anchor, not as a substitute for archival memoranda.",
    volumeRole: "volume-iv-public-companion",
    volumeStatus: "Public companion lead",
    frusVolume: volumeIv,
    publicPapersTextLine: record.textLine,
    seedBatch
  };
}

function reportFor(records, combined) {
  return {
    generatedAt: new Date().toISOString(),
    source: "Google Drive searches for Public Papers of the President and Secretary Cheney Public Statements",
    seedBatch,
    driveSources: {
      publicPapers: {
        ...publicPapersSource,
        extractedTextPath: "local-cache/frus-drive-public-papers/GHBPublicPapers.txt",
        pdfPages: 15526,
        textMegabytesApprox: 30
      },
      cheney: {
        ...cheneySource,
        volumes: cheneyVolumes,
        textExtractionStatus:
          "Connector text extraction returned empty content for sampled PDFs; OCR required before reliable term mining."
      },
      cheneyStandaloneHit: {
        title: "901207 Cheney Press Conference at DPC and NPC.pdf",
        url: "https://drive.google.com/file/d/0B4xiXXj9ooNgY1lPQTQtWlJNSHFMazdXV3FibXN3dTc5dmJJ",
        textExtractionStatus: "Connector fetch returned empty content; OCR required."
      }
    },
    searchedTerms: [
      "Soviet",
      "USSR",
      "Russia",
      "Yeltsin",
      "Gorbachev",
      "Ukraine",
      "Belarus",
      "Byelarus",
      "Kazakhstan",
      "Nunn-Lugar",
      "START",
      "Lisbon",
      "FREEDOM Support",
      "Commonwealth of Independent States",
      "Cheney",
      "defense conversion",
      "nuclear"
    ],
    addedRecords: records.length,
    publicPapersSelected: publicPaperRecords.length,
    sourceLeads: sourceLeads.length,
    totalRecords: combined.length,
    selectedPublicPapers: publicPaperRecords.map((record) => ({
      id: record.id,
      date: record.date,
      title: record.title,
      chapter: record.chapter.name,
      topics: record.topics,
      textLine: record.textLine,
      nextAction: record.nextAction
    })),
    cheneyFindings: {
      folderLocated: cheneySource.url,
      volumeCount: cheneyVolumes.length,
      conclusion:
        "The Cheney Public Statements set is present in Drive but needs OCR; no clean text selections were made from the volumes in this pass.",
      nextAction:
        "Download/OCR the 11 volumes and the 901207 standalone press-conference PDF, then run the Russia/FSU/arms-control query set against the OCR text."
    }
  };
}

function main() {
  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const seeded = [...sourceLeads, ...publicPaperRecords.map(publicPapersRecord)];
  const seededIds = new Set();

  for (const record of seeded) {
    if (seededIds.has(record.id)) throw new Error(`Duplicate seed id: ${record.id}`);
    seededIds.add(record.id);
  }

  const existing = records.filter((record) => record.seedBatch !== seedBatch && !seededIds.has(record.id));
  const combined = [...existing, ...seeded].sort(byChapterThenDate);
  const report = reportFor(seeded, combined);

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(combined, null, 2)}\n`);
  fs.writeFileSync(JS_PATH, `window.MEMCONS = ${JSON.stringify(combined, null, 2)};\n`);
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    SEED_REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: report.generatedAt,
        seedBatch,
        sourceReport: REPORT_PATH,
        addedRecords: seeded.length,
        publicPapersSelected: publicPaperRecords.length,
        sourceLeads: sourceLeads.length,
        totalRecords: combined.length,
        selectedIds: seeded.map((record) => record.id)
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
        publicPapersSelected: publicPaperRecords.length,
        sourceLeads: sourceLeads.length,
        totalRecords: combined.length
      },
      null,
      2
    )
  );
}

main();
