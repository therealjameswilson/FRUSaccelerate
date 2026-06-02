const sourceCollections = [
  {
    id: "frus-bush-china",
    title: "FRUS 1989-1992, Volume XVII, China",
    institution: "Office of the Historian",
    repository: "FRUS",
    lane: "FRUS spine",
    priority: "first",
    period: "1989-1992",
    status: "Being Cleared",
    url: "https://history.state.gov/historicaldocuments/frus1989-92v17",
    coverage:
      "The official documentary-record frame for Bush administration China policy. Use it to set scope, then work backward into Bush Library file units.",
    useFor: "Volume boundary, selection logic, source-note model, and clearance watch.",
    sourceNote:
      "Office of the Historian, Foreign Relations of the United States, 1989-1992, Volume XVII, China, status page."
  },
  {
    id: "frus-clinton-xli",
    title: "FRUS 1993-2000, Volume XLI, China, 1993-1996",
    institution: "Office of the Historian",
    repository: "FRUS",
    lane: "FRUS spine",
    priority: "first",
    period: "1993-1996",
    status: "Planned",
    url: "https://history.state.gov/historicaldocuments/frus1993-00v41",
    coverage:
      "The planned Clinton China volume covering MFN linkage, early engagement, Taiwan Strait crisis, and the first Clinton-Jiang meetings.",
    useFor: "Chapter boundary, likely document types, and FRUS status evidence.",
    sourceNote:
      "Office of the Historian, Foreign Relations of the United States, 1993-2000, Volume XLI, China, 1993-1996, status page."
  },
  {
    id: "frus-clinton-xlii",
    title: "FRUS 1993-2000, Volume XLII, China, 1997-2000",
    institution: "Office of the Historian",
    repository: "FRUS",
    lane: "FRUS spine",
    priority: "first",
    period: "1997-2000",
    status: "Planned",
    url: "https://history.state.gov/historicaldocuments/frus1993-00v42",
    coverage:
      "The planned Clinton China volume for summitry, strategic partnership language, Zhu Rongji, WTO accession negotiations, PNTR, and late-term handoff.",
    useFor: "Late-Clinton chapter boundary and source-gap tracking.",
    sourceNote:
      "Office of the Historian, Foreign Relations of the United States, 1993-2000, Volume XLII, China, 1997-2000, status page."
  },
  {
    id: "frus-about",
    title: "FRUS Statutory Method and Series Status",
    institution: "Office of the Historian",
    repository: "FRUS",
    lane: "FRUS spine",
    priority: "context",
    period: "Series-wide",
    status: "Reference",
    url: "https://history.state.gov/historicaldocuments/about-frus",
    coverage:
      "Explains FRUS as the official documentary record and the requirement to draw on the national security establishment.",
    useFor: "Method note for why presidential, NSC, State, Defense, CIA, and other agency files belong in the same source map.",
    sourceNote:
      "Office of the Historian, About the Foreign Relations of the United States Series."
  },
  {
    id: "bush-selected-china",
    title: "Records on Selected China Files",
    institution: "George H.W. Bush Presidential Library",
    repository: "Bush Library",
    lane: "Tiananmen aftermath",
    priority: "first",
    period: "1989-1992",
    status: "FOIA 2000-0116-F",
    url: "https://www.bush41library.gov/digital-research-room/finding-aid/foia/records-selected-china-files",
    coverage:
      "Selected China files on MFN status, Tiananmen, general bilateral relations, NSC China files, public liaison material, and some online PDFs.",
    useFor: "Bush baseline dossier and early post-Cold War policy repair.",
    sourceNote:
      "George H.W. Bush Presidential Library, FOIA 2000-0116-F, Records on Selected China Files."
  },
  {
    id: "bush-tiananmen",
    title: "Selected China Files on Tiananmen Square",
    institution: "George H.W. Bush Presidential Library",
    repository: "Bush Library",
    lane: "Tiananmen aftermath",
    priority: "first",
    period: "1989",
    status: "FOIA 2000-0950-F",
    url: "https://www.bush41library.gov/digital-research-room/finding-aid/foia/selected-china-files-tiananmen-square",
    coverage:
      "Public mail, memoranda, reports, cables, meeting notes, and news clippings on the protests and crackdown, with many cables still classified.",
    useFor: "U.S. reaction, sanctions, public pressure, congressional pressure, and closed-cable gap tracking.",
    sourceNote:
      "George H.W. Bush Presidential Library, FOIA 2000-0950-F, Selected China Files on Tiananmen Square."
  },
  {
    id: "bush-scowcroft-trip",
    title: "Records on Brent Scowcroft's China Trip With Lawrence Eagleburger",
    institution: "George H.W. Bush Presidential Library",
    repository: "Bush Library",
    lane: "Tiananmen aftermath",
    priority: "first",
    period: "1989",
    status: "FOIA 2000-0957-F",
    url: "https://www.bush41library.gov/digital-research-room/finding-aid/foia/records-brent-scrowcrofts-china-trip-lawrence-eagleburger",
    coverage:
      "Documents from NSC, public liaison, and related offices concerning the Scowcroft-Eagleburger China missions after Tiananmen.",
    useFor: "Back-channel diplomacy, repair strategy, and the sanctions-versus-engagement argument.",
    sourceNote:
      "George H.W. Bush Presidential Library, FOIA 2000-0957-F, Records on Brent Scowcroft's China Trip With Lawrence Eagleburger."
  },
  {
    id: "bush-world-bank",
    title: "Records on World Bank Loans to China",
    institution: "George H.W. Bush Presidential Library",
    repository: "Bush Library",
    lane: "Trade and finance",
    priority: "second",
    period: "1990",
    status: "FOIA 2000-1204-F",
    url: "https://www.bush41library.gov/digital-research-room/finding-aid/foia/records-world-bank-loans-china",
    coverage:
      "Materials concerning President Bush's decision to support resumption of World Bank loans to China in July 1990.",
    useFor: "Financial sanctions, multilateral lending, and normalization mechanics after Tiananmen.",
    sourceNote:
      "George H.W. Bush Presidential Library, FOIA 2000-1204-F, Records on World Bank Loans to China."
  },
  {
    id: "bush-trip-1989",
    title: "Records on President Bush's Trip to China: February 1989",
    institution: "George H.W. Bush Presidential Library",
    repository: "Bush Library",
    lane: "Summitry",
    priority: "second",
    period: "1989",
    status: "FOIA 2000-0949-F",
    url: "https://www.bush41library.gov/digital-research-room/finding-aid/foia/records-president-bushs-trip-china-february-1989",
    coverage:
      "Trip books, speech backup, schedules, and related material for the February 1989 presidential visit to Beijing.",
    useFor: "Pre-crackdown expectations and the personal diplomacy context Bush brought into June 1989.",
    sourceNote:
      "George H.W. Bush Presidential Library, FOIA 2000-0949-F, Records on President Bush's Trip to China: February 1989."
  },
  {
    id: "bush-public-papers-june-1989",
    title: "Bush Public Papers: June 5, 1989 Statement",
    institution: "George H.W. Bush Presidential Library",
    repository: "Public Papers",
    lane: "Public argument",
    priority: "first",
    period: "1989",
    status: "Published",
    url: "https://bush41library.tamu.edu/archives/public-papers/494",
    coverage:
      "The public sanctions statement after the Tiananmen crackdown, including suspension of military sales and military visits.",
    useFor: "Public baseline for sanctions, rights language, and later comparison with private reassurance and repair.",
    sourceNote:
      "George H.W. Bush Presidential Library, Public Papers, Statement by the President, June 5, 1989."
  },
  {
    id: "clinton-mfn-1993",
    title: "Declassified Documents Concerning China",
    institution: "William J. Clinton Presidential Library",
    repository: "Clinton Library",
    lane: "MFN and rights",
    priority: "first",
    period: "1993",
    status: "MDR 2016-0557-M",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/declassified-documents-concerning-china",
    coverage:
      "Records related to China and 1993 Most Favored Nation discussions, including briefing papers, reports, and memoranda.",
    useFor: "Early Clinton linkage policy and the first human-rights trade bargain.",
    sourceNote:
      "William J. Clinton Presidential Library, MDR 2016-0557-M, Declassified Documents Concerning China."
  },
  {
    id: "clinton-wto-kantor-barshefsky",
    title: "China, WTO, Ambassador Kantor, and Ambassador Barshefsky",
    institution: "William J. Clinton Presidential Library",
    repository: "Clinton Library",
    lane: "Trade and finance",
    priority: "first",
    period: "1993-2001",
    status: "FOIA 2010-1024-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/china-world-trade-organization-wto-ambassador-michael-kantor-and",
    coverage:
      "Approximately 10,824 pages on China, WTO, Kantor, Barshefsky, accession documents, correspondence, legislation, email, and press guidance.",
    useFor: "WTO accession, USTR-adjacent material, congressional correspondence, and late-1990s trade negotiations.",
    sourceNote:
      "William J. Clinton Presidential Library, FOIA 2010-1024-F, China, the World Trade Organization, Ambassador Michael Kantor, and Ambassador Charlene Barshefsky."
  },
  {
    id: "clinton-pntr",
    title: "China's Permanent Trade Status, 1993-2001",
    institution: "William J. Clinton Presidential Library",
    repository: "Clinton Library",
    lane: "Trade and finance",
    priority: "first",
    period: "2000",
    status: "FOIA 2010-1026-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/chinas-permanent-trade-status-1993-2001",
    coverage:
      "Spring and June 2000 briefing books prepared around House and Senate PNTR votes, with economics, security, human rights, labor, WTO, and agriculture material.",
    useFor: "The administration's public and congressional case for PNTR.",
    sourceNote:
      "William J. Clinton Presidential Library, FOIA 2010-1026-F, China's Permanent Trade Status, 1993-2001."
  },
  {
    id: "clinton-jiang",
    title: "Jiang Zemin - President of the People's Republic of China",
    institution: "William J. Clinton Presidential Library",
    repository: "Clinton Library",
    lane: "Summitry",
    priority: "first",
    period: "1993-2000",
    status: "FOIA 2014-1039-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/jiang-zemin-president-peoples-republic-china",
    coverage:
      "Approximately 5,998 pages and 64 electronic files on Clinton-Jiang meetings, China travel, 1999 trade issues, NSC records, talking points, memos, and emails.",
    useFor: "Summit preparation, meeting notes, 1997 visit, 1998 China trip, Zhu Rongji, WTO, and strategic partnership language.",
    sourceNote:
      "William J. Clinton Presidential Library, FOIA 2014-1039-F, Jiang Zemin - President of the People's Republic of China."
  },
  {
    id: "clinton-daily-diary",
    title: "Clinton Presidential Daily Diary",
    institution: "William J. Clinton Presidential Library",
    repository: "Clinton Library",
    lane: "Summitry",
    priority: "second",
    period: "1993-2000",
    status: "Searchable diary",
    url: "https://www.clintonlibrary.gov/research/daily-diary",
    coverage:
      "Searchable day-level entries for President Clinton's meetings, calls, events, travel, topics, participants, and linked documents where available.",
    useFor: "Date control for Jiang, Zhu, congressional, business, and NSC interactions.",
    sourceNote:
      "William J. Clinton Presidential Library, Presidential Daily Diary."
  },
  {
    id: "clinton-digital-memcons",
    title: "Clinton Digital Library Memcons",
    institution: "Clinton Digital Library",
    repository: "Clinton Library",
    lane: "Summitry",
    priority: "second",
    period: "1993-2000",
    status: "Digitized items",
    url: "https://clinton.presidentiallibraries.us/items/show/101542",
    coverage:
      "Digitized memorandum of conversation item for Vice President Al Gore and President Jiang Zemin, plus a wider memcon collection to search.",
    useFor: "Leader and vice-presidential conversations, item-level citations, and digital-library trails.",
    sourceNote:
      "Clinton Digital Library, Memorandum of Conversation - Vice President Al Gore and President Jiang Zemin of China, November 16, 1998."
  },
  {
    id: "clinton-eo-12850",
    title: "Executive Order 12850 and 1993 MFN Statement",
    institution: "Clinton White House Archive",
    repository: "Public Papers",
    lane: "MFN and rights",
    priority: "first",
    period: "1993",
    status: "Published",
    url: "https://clintonwhitehouse6.archives.gov/1993/05/1993-05-28-executive-order-12850-on-china-mfn.html",
    coverage:
      "The order conditioning the 1994 renewal of China's MFN status on specified human-rights progress, alongside public presidential framing.",
    useFor: "Text of linkage policy and the measurable conditions selected by the administration.",
    sourceNote:
      "Clinton White House Archive, Executive Order 12850, Conditions for Renewal of Most-Favored-Nation Status for the People's Republic of China in 1994, May 28, 1993."
  },
  {
    id: "clinton-1994-mfn-news-conference",
    title: "Clinton News Conference on China MFN",
    institution: "American Presidency Project",
    repository: "Public Papers",
    lane: "MFN and rights",
    priority: "first",
    period: "1994",
    status: "Published",
    url: "https://www.presidency.ucsb.edu/documents/the-presidents-news-conference-1085",
    coverage:
      "President Clinton's May 26, 1994 explanation for extending MFN and shifting toward engagement after the 1993 conditional approach.",
    useFor: "The delinking pivot and presidential rationale for engagement.",
    sourceNote:
      "American Presidency Project, William J. Clinton, The President's News Conference, May 26, 1994."
  },
  {
    id: "joint-statement-1997",
    title: "Joint United States-China Statement, October 29, 1997",
    institution: "GovInfo",
    repository: "Public Papers",
    lane: "Summitry",
    priority: "first",
    period: "1997",
    status: "Published",
    url: "https://www.govinfo.gov/app/details/PPP-1997-book2/PPP-1997-book2-doc-pg1452",
    coverage:
      "Public summit statement from the Jiang state visit, including cooperation language, nonproliferation, global issues, and the strategic-partnership frame.",
    useFor: "Public definition of the 1997 summit agenda and partnership language.",
    sourceNote:
      "GovInfo, Public Papers of the Presidents, William J. Clinton, Joint United States-China Statement, October 29, 1997."
  },
  {
    id: "clinton-jiang-1998-press",
    title: "Clinton-Jiang Press Availability in Beijing",
    institution: "Clinton White House Archive",
    repository: "Public Papers",
    lane: "Summitry",
    priority: "second",
    period: "1998",
    status: "Published",
    url: "https://clintonwhitehouse6.archives.gov/1998/06/1998-06-27-press-availability-with-presidents-clinton-and-jiang.html",
    coverage:
      "Public exchange during Clinton's China visit, useful for human-rights language, strategic-partnership rhetoric, and public diplomacy.",
    useFor: "Comparing public statements with briefing books and meeting records.",
    sourceNote:
      "Clinton White House Archive, Press Availability with President Clinton and President Jiang, Beijing, June 27, 1998."
  },
  {
    id: "hr-4444",
    title: "H.R. 4444, U.S.-China Relations Act of 2000",
    institution: "Congress.gov",
    repository: "Congress and law",
    lane: "Trade and finance",
    priority: "first",
    period: "2000",
    status: "Public Law 106-286",
    url: "https://www.congress.gov/bill/106th-congress/house-bill/4444/all-info",
    coverage:
      "Bill history, actions, text links, and public-law status for PNTR and the statutory framework for U.S.-PRC relations after WTO accession.",
    useFor: "Legislative chronology, roll-call trails, statutory language, and congressional framing.",
    sourceNote:
      "Congress.gov, H.R. 4444, 106th Congress, U.S.-China Relations Act of 2000."
  },
  {
    id: "pl-106-286",
    title: "Public Law 106-286 PDF",
    institution: "GovInfo",
    repository: "Congress and law",
    lane: "Trade and finance",
    priority: "first",
    period: "2000",
    status: "Statute",
    url: "https://www.govinfo.gov/content/pkg/PLAW-106publ286/pdf/PLAW-106publ286.pdf",
    coverage:
      "Authenticated public law granting normal trade relations treatment to the PRC and establishing a framework for relations.",
    useFor: "Exact statutory language and source-note-ready legal citation.",
    sourceNote:
      "Public Law 106-286, U.S.-China Relations Act of 2000, October 10, 2000."
  },
  {
    id: "crs-clinton-chronology",
    title: "China-U.S. Relations: Chronology During the Clinton Administration",
    institution: "Congressional Research Service",
    repository: "Congress and law",
    lane: "Chronology control",
    priority: "context",
    period: "1992-1999",
    status: "CRS report",
    url: "https://digital.library.unt.edu/ark:/67531/metadc806195/",
    coverage:
      "A congressional chronology of major U.S.-China developments during the Clinton administration and the 103rd through 106th Congresses.",
    useFor: "Date control, congressional leads, and event checklists before archival pulls.",
    sourceNote:
      "Congressional Research Service, China-U.S. Relations: Chronology of Developments During the Clinton Administration, July 25, 2000."
  },
  {
    id: "nara-foreign-policy",
    title: "NARA U.S. Foreign Affairs Research",
    institution: "National Archives",
    repository: "State and NARA",
    lane: "State files",
    priority: "context",
    period: "Record-group guide",
    status: "Research guide",
    url: "https://www.archives.gov/research/foreign-policy",
    coverage:
      "National Archives guide to foreign affairs records across State, Defense, intelligence, and other agencies.",
    useFor: "Repository routing for State Department central files, bureau files, and agency records not in presidential libraries.",
    sourceNote:
      "National Archives, U.S. Foreign Affairs Research."
  },
  {
    id: "state-central-files",
    title: "Department of State Central Files, RG 59",
    institution: "National Archives",
    repository: "State and NARA",
    lane: "State files",
    priority: "context",
    period: "Record-group guide",
    status: "Research guide",
    url: "https://www.archives.gov/research/foreign-policy/state-dept/rg-59-central-files",
    coverage:
      "NARA guide to State Department central files as the major starting point for U.S. diplomatic reporting and policy records.",
    useFor: "Planning State cable, airgram, memorandum, and bureau-file research.",
    sourceNote:
      "National Archives, Department of State Central Files, Record Group 59."
  },
  {
    id: "nsarchive-tiananmen",
    title: "Tiananmen Square, 1989: The Declassified History",
    institution: "National Security Archive",
    repository: "Document sets",
    lane: "Tiananmen aftermath",
    priority: "second",
    period: "1989",
    status: "Electronic briefing book",
    url: "https://nsarchive2.gwu.edu/NSAEBB/NSAEBB16/documents/index.html",
    coverage:
      "A curated set of declassified documents on Tiananmen and U.S.-China relations, including diplomatic reporting and post-crackdown themes.",
    useFor: "Quick document access, cross-checking Bush Library records, and identifying document titles for follow-up.",
    sourceNote:
      "National Security Archive, Tiananmen Square, 1989: The Declassified History, Electronic Briefing Book No. 16."
  },
  {
    id: "dnsa-china",
    title: "China and the United States: From Hostility to Engagement, 1960-1998",
    institution: "Digital National Security Archive",
    repository: "Document sets",
    lane: "State files",
    priority: "context",
    period: "1960-1998",
    status: "Subscription collection",
    url: "https://proquest.libguides.com/dnsa/china",
    coverage:
      "Subscription primary-source collection with memos, cables, studies, security relationship documents, and intelligence estimates.",
    useFor: "Document discovery when university or NARA access to DNSA is available.",
    sourceNote:
      "Digital National Security Archive, China and the United States: From Hostility to Engagement, 1960-1998."
  }
];

const policyLanes = [
  {
    title: "FRUS Spine",
    question: "Where will the official documentary record place the China story?",
    mustRead: ["frus-bush-china", "frus-clinton-xli", "frus-clinton-xlii"],
    searches: ["FRUS China 1989 1992", "FRUS 1993 2000 XLI XLII", "status of series China"],
    output: "A volume-boundary memo separating Bush, Clinton early, and Clinton late evidence."
  },
  {
    title: "Tiananmen Aftermath",
    question: "How did sanctions, private reassurance, and congressional pressure interact after June 1989?",
    mustRead: ["bush-tiananmen", "bush-scowcroft-trip", "bush-public-papers-june-1989"],
    searches: ["CO034 Tiananmen", "Scowcroft Eagleburger China", "China Crisis"],
    output: "A sanctions-and-repair chronology with closed-cable flags."
  },
  {
    title: "MFN And Human Rights",
    question: "When did the U.S. link, condition, delink, or reframe trade and rights?",
    mustRead: ["clinton-mfn-1993", "clinton-eo-12850", "clinton-1994-mfn-news-conference"],
    searches: ["Most Favored Nation China", "MFN human rights", "CO038 China MFN"],
    output: "A linkage matrix tracking rights, trade, proliferation, and congressional leverage."
  },
  {
    title: "Trade, PNTR, And WTO",
    question: "How did WTO accession become the endpoint of engagement policy?",
    mustRead: ["clinton-wto-kantor-barshefsky", "clinton-pntr", "hr-4444", "pl-106-286"],
    searches: ["China WTO 1999", "PNTR resource book", "H.R. 4444 China"],
    output: "A trade-policy dossier from USTR-adjacent files to Public Law 106-286."
  },
  {
    title: "Summitry",
    question: "What was decided in leader meetings and what was merely announced afterward?",
    mustRead: ["clinton-jiang", "joint-statement-1997", "clinton-jiang-1998-press"],
    searches: ["Jiang Zemin meeting notes", "1997 Jiang visit", "Zhu Rongji visit"],
    output: "A meeting-by-meeting grid of agenda items, talking points, memcons, and public statements."
  },
  {
    title: "Taiwan And Security",
    question: "How did Washington manage Taiwan, military signaling, and the one-China policy?",
    mustRead: ["crs-clinton-chronology", "clinton-jiang", "state-central-files"],
    searches: ["Taiwan Strait crisis", "Lee Teng-hui Cornell", "one China policy Clinton"],
    output: "A Taiwan crisis file tying public statements to NSC and congressional sources."
  },
  {
    title: "State Files",
    question: "Which State Department records can fill the cable and bureau-file gaps?",
    mustRead: ["nara-foreign-policy", "state-central-files", "dnsa-china"],
    searches: ["Central Foreign Policy File China", "EAP China files", "Beijing cable"],
    output: "A NARA/State research plan with record-group targets and FOIA/MDR candidates."
  },
  {
    title: "Public Argument",
    question: "How did presidents, Congress, and agencies explain engagement to domestic audiences?",
    mustRead: ["bush-public-papers-june-1989", "joint-statement-1997", "hr-4444"],
    searches: ["China human rights trade speech", "constructive strategic partnership", "PNTR statement"],
    output: "A rhetoric-to-record table comparing speeches, laws, and internal policy files."
  }
];

const chronology = [
  {
    date: "1989-02-25",
    title: "President Bush visits Beijing",
    summary:
      "The February China trip supplies the pre-Tiananmen baseline for Bush's personal diplomacy and assumptions about the bilateral relationship.",
    sources: ["bush-trip-1989"]
  },
  {
    date: "1989-06-05",
    title: "Bush announces sanctions after Tiananmen",
    summary:
      "The public statement suspends military sales and military visits while keeping broader relationship review open.",
    sources: ["bush-public-papers-june-1989", "bush-tiananmen"]
  },
  {
    date: "1989-12-03",
    title: "Scowcroft-Eagleburger repair mission becomes the central back-channel file",
    summary:
      "The Bush Library trip files are the first stop for the private diplomacy that followed public sanctions.",
    sources: ["bush-scowcroft-trip", "nsarchive-tiananmen"]
  },
  {
    date: "1990-07-01",
    title: "World Bank lending question tests sanctions policy",
    summary:
      "The World Bank loans file helps show how the administration handled multilateral finance after the crackdown.",
    sources: ["bush-world-bank"]
  },
  {
    date: "1993-05-28",
    title: "Clinton conditions 1994 MFN renewal",
    summary:
      "Executive Order 12850 links the next renewal to human-rights progress and creates the first Clinton-era test of linkage.",
    sources: ["clinton-eo-12850", "clinton-mfn-1993"]
  },
  {
    date: "1994-05-26",
    title: "Clinton shifts toward engagement and extends MFN",
    summary:
      "The presidential news conference supplies the public rationale for delinking MFN from the annual human-rights test.",
    sources: ["clinton-1994-mfn-news-conference"]
  },
  {
    date: "1995-06-01",
    title: "Taiwan question becomes a central security lane",
    summary:
      "The Lee Teng-hui visit and the 1995-1996 Taiwan Strait crisis belong in the security lane and should be tracked through CRS, State, NSC, and Clinton Library files.",
    sources: ["crs-clinton-chronology", "clinton-jiang"]
  },
  {
    date: "1997-10-29",
    title: "Jiang state visit and joint statement",
    summary:
      "The public summit statement frames cooperation, nonproliferation, global issues, and the strategic-partnership vocabulary.",
    sources: ["joint-statement-1997", "clinton-jiang"]
  },
  {
    date: "1998-06-27",
    title: "Clinton-Jiang Beijing press availability",
    summary:
      "The public exchange during Clinton's China trip is a key companion to meeting notes, briefing books, and rule-of-law files.",
    sources: ["clinton-jiang-1998-press", "clinton-jiang"]
  },
  {
    date: "1999-11-15",
    title: "U.S.-China bilateral WTO agreement",
    summary:
      "Clinton Library WTO, Jiang, NEC, NSC, and PNTR records carry the internal trail toward congressional approval.",
    sources: ["clinton-wto-kantor-barshefsky", "clinton-jiang", "clinton-pntr"]
  },
  {
    date: "2000-10-10",
    title: "U.S.-China Relations Act becomes law",
    summary:
      "Public Law 106-286 closes the annual trade-status fight and creates a statutory framework around PNTR.",
    sources: ["hr-4444", "pl-106-286"]
  },
  {
    date: "2001-12-11",
    title: "WTO accession becomes the postscript",
    summary:
      "China's formal WTO accession sits just beyond the Clinton FRUS span and should be treated as consequence or handoff unless the book extends into Bush 43.",
    sources: ["clinton-wto-kantor-barshefsky", "clinton-pntr"]
  }
];

const pullQueue = [
  {
    rank: 1,
    label: "FRUS boundary",
    title: "Set the volume spine and date partitions",
    detail:
      "Use the Bush China XVII and Clinton XLI-XLII pages to keep the book's evidence map aligned with official FRUS boundaries.",
    next: "Create a three-column table: Bush 1989-1992, Clinton 1993-1996, Clinton 1997-2000.",
    sources: ["frus-bush-china", "frus-clinton-xli", "frus-clinton-xlii"]
  },
  {
    rank: 2,
    label: "Bush dossier",
    title: "Pull Tiananmen, Scowcroft, MFN, and World Bank files",
    detail:
      "These files establish the transition from public sanctions to private repair and continued engagement.",
    next: "Start with FOIA 2000-0950-F and 2000-0957-F, then add Selected China Files and World Bank loans.",
    sources: ["bush-tiananmen", "bush-scowcroft-trip", "bush-selected-china", "bush-world-bank"]
  },
  {
    rank: 3,
    label: "MFN pivot",
    title: "Build the Clinton linkage-to-delinkage file",
    detail:
      "The 1993 MDR, Executive Order 12850, and 1994 news conference define the central policy turn.",
    next: "Extract conditions, agency recommendations, congressional objections, and the final presidential rationale.",
    sources: ["clinton-mfn-1993", "clinton-eo-12850", "clinton-1994-mfn-news-conference"]
  },
  {
    rank: 4,
    label: "WTO/PNTR",
    title: "Assemble the trade accession dossier",
    detail:
      "Kantor/Barshefsky, PNTR briefing books, Jiang files, and H.R. 4444 form the core of the late-Clinton trade story.",
    next: "Separate USTR-adjacent negotiation evidence from White House congressional sales material.",
    sources: ["clinton-wto-kantor-barshefsky", "clinton-pntr", "clinton-jiang", "hr-4444"]
  },
  {
    rank: 5,
    label: "Summit trail",
    title: "Pair public statements with meeting preparation",
    detail:
      "The 1997 and 1998 public statements should be read against NSC Asian Affairs, NEC, and WHORM files.",
    next: "Create a meeting grid for APEC 1993, New York 1995, Jiang 1997, Beijing 1998, Zhu 1999, and Millennium 2000.",
    sources: ["clinton-jiang", "joint-statement-1997", "clinton-jiang-1998-press", "clinton-daily-diary"]
  },
  {
    rank: 6,
    label: "State/NARA",
    title: "Plan the diplomatic-record search",
    detail:
      "Presidential libraries will not be enough. Build State, EAP, embassy Beijing, and central-file trails for cables and memos.",
    next: "Draft FOIA/MDR targets by subject: Taiwan Strait, WTO, human rights dialogue, nonproliferation, and Hong Kong.",
    sources: ["nara-foreign-policy", "state-central-files", "dnsa-china"]
  }
];

const searchRecipes = [
  {
    title: "Bush Digital Research Room",
    repository: "Bush Library",
    query:
      '"China - MFN" OR "China Crisis" OR "Scowcroft Trip" OR "World Bank Loans to China" OR "Fang Lizhi" OR "Wan Li"',
    targets: ["FOIA 2000-0116-F", "FOIA 2000-0950-F", "FOIA 2000-0957-F", "FOIA 2000-1204-F"],
    url: "https://www.bush41library.gov/digital-research-room"
  },
  {
    title: "Clinton Library China Files",
    repository: "Clinton Library",
    query:
      '"CO038" OR "CO038-02" OR "China WTO" OR "Jiang Zemin" OR "Zhu Rongji" OR "Permanent Normal Trade Relations"',
    targets: ["FOIA 2010-1024-F", "FOIA 2010-1026-F", "FOIA 2014-1039-F", "MDR 2016-0557-M"],
    url: "https://www.clintonlibrary.gov/research/search-digitized-records"
  },
  {
    title: "Public Papers",
    repository: "GovInfo and APP",
    query:
      '"China" "Most-Favored-Nation" OR "Permanent Normal Trade Relations" OR "Jiang Zemin" OR "Taiwan" OR "human rights"',
    targets: ["Public Papers of the Presidents", "American Presidency Project", "Clinton White House Archive"],
    url: "https://www.govinfo.gov/app/collection/PPP"
  },
  {
    title: "Congress And Statutes",
    repository: "Congress.gov",
    query:
      '"H.R. 4444" OR "U.S.-China Relations Act of 2000" OR "China MFN" OR "PNTR" OR "Taiwan Strait"',
    targets: ["Bill text", "Roll calls", "Committee reports", "Congressional Record"],
    url: "https://www.congress.gov/"
  },
  {
    title: "NARA And State Department",
    repository: "State and NARA",
    query:
      "\"People's Republic of China\" \"Central Foreign Policy File\" OR \"Beijing\" \"cable\" OR \"EAP\" \"China\"",
    targets: ["RG 59", "EAP bureau files", "Embassy Beijing cables", "NARA Catalog"],
    url: "https://www.archives.gov/research/foreign-policy"
  },
  {
    title: "Document Sets",
    repository: "DNSA and NSA",
    query:
      '"Tiananmen" "Scowcroft" OR "China WTO" OR "U.S.-PRC military relationship" OR "China intelligence estimates"',
    targets: ["National Security Archive", "Digital National Security Archive", "CIA Reading Room"],
    url: "https://nsarchive.gwu.edu/virtual-reading-room"
  }
];

const sourceNotes = [
  {
    title: "Bush Library FOIA",
    note:
      "George H.W. Bush Presidential Library, FOIA [number], [collection title], [series], [file unit], [container/local ID], National Archives Identifier [NAID]."
  },
  {
    title: "Clinton Library FOIA",
    note:
      "William J. Clinton Presidential Library, FOIA [number], [collection title], [office/staff files], [folder title], [OA/ID], National Archives and Records Administration."
  },
  {
    title: "FRUS Status Page",
    note:
      "Office of the Historian, Foreign Relations of the United States, [subseries], Volume [number], [title], status page, accessed June 1, 2026."
  },
  {
    title: "Public Papers",
    note:
      "Public Papers of the Presidents of the United States: William J. Clinton, [year], Book [number], [document title], [date], GovInfo."
  },
  {
    title: "Congress",
    note:
      "U.S. Congress, H.R. 4444, 106th Cong., U.S.-China Relations Act of 2000, Public Law 106-286, October 10, 2000."
  },
  {
    title: "Digital Item",
    note:
      '"[Item title]," [digital repository], [date], [collection], [stable URL], accessed June 1, 2026.'
  }
];

const sourceById = new Map(sourceCollections.map((source) => [source.id, source]));

const sourceRoot = document.querySelector("#source-root");
const sourceSummary = document.querySelector("#source-summary");
const sourceSearch = document.querySelector("#source-search");
const repositoryFilter = document.querySelector("#repository-filter");
const laneFilter = document.querySelector("#lane-filter");
const priorityFilter = document.querySelector("#priority-filter");
const clearFilters = document.querySelector("#clear-filters");
const downloadSources = document.querySelector("#download-sources");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = String(value);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${dateString}T00:00:00Z`));
}

function addOptions(select, values, label) {
  if (!select) return;
  select.replaceChildren(
    new Option(label, ""),
    ...values.map((value) => new Option(value, value))
  );
}

function priorityLabel(priority) {
  return {
    first: "First pull",
    second: "Second pass",
    context: "Context"
  }[priority] || priority;
}

function copyText(text, button) {
  const done = () => {
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  done();
}

function renderStats() {
  setText("#source-count", sourceCollections.length);
  setText("#lane-count", policyLanes.length);
  setText("#chronology-count", chronology.length);
  setText("#priority-count", sourceCollections.filter((source) => source.priority === "first").length);
}

function renderLanes() {
  const root = document.querySelector("#lanes-root");
  if (!root) return;

  root.innerHTML = policyLanes
    .map((lane, index) => {
      const linkedSources = lane.mustRead
        .map((id) => sourceById.get(id))
        .filter(Boolean)
        .map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(source.title)}</a></li>`)
        .join("");

      return `
        <article class="lane-card">
          <header>
            <div>
              <h3>${escapeHtml(lane.title)}</h3>
              <p>${escapeHtml(lane.question)}</p>
            </div>
            <span class="lane-number">${String(index + 1).padStart(2, "0")}</span>
          </header>
          <ul>${linkedSources}</ul>
          <p><strong>Output:</strong> ${escapeHtml(lane.output)}</p>
        </article>
      `;
    })
    .join("");
}

function sourceSearchText(source) {
  return [
    source.title,
    source.institution,
    source.repository,
    source.lane,
    source.period,
    source.status,
    source.coverage,
    source.useFor,
    source.sourceNote
  ]
    .join(" ")
    .toLowerCase();
}

function currentFilters() {
  return {
    query: sourceSearch?.value.trim().toLowerCase() || "",
    repository: repositoryFilter?.value || "",
    lane: laneFilter?.value || "",
    priority: priorityFilter?.value || ""
  };
}

function filteredSources() {
  const filters = currentFilters();
  return sourceCollections.filter((source) => {
    const matchesQuery = !filters.query || sourceSearchText(source).includes(filters.query);
    const matchesRepository = !filters.repository || source.repository === filters.repository;
    const matchesLane = !filters.lane || source.lane === filters.lane;
    const matchesPriority = !filters.priority || source.priority === filters.priority;
    return matchesQuery && matchesRepository && matchesLane && matchesPriority;
  });
}

function renderSources() {
  if (!sourceRoot || !sourceSummary) return;
  const sources = filteredSources();

  sourceSummary.textContent = `${sources.length} of ${sourceCollections.length} source anchors shown`;
  sourceRoot.innerHTML =
    sources
      .map(
        (source) => `
          <article class="source-card">
            <header>
              <div>
                <h3>${escapeHtml(source.title)}</h3>
                <p>${escapeHtml(source.institution)}</p>
              </div>
            </header>
            <div class="source-meta">
              <span>${escapeHtml(source.repository)}</span>
              <span>${escapeHtml(source.lane)}</span>
              <span>${escapeHtml(priorityLabel(source.priority))}</span>
              <span>${escapeHtml(source.period)}</span>
            </div>
            <p>${escapeHtml(source.coverage)}</p>
            <p><strong>Use for:</strong> ${escapeHtml(source.useFor)}</p>
            <footer>
              <a href="${escapeHtml(source.url)}" rel="noreferrer">Open Source</a>
              <button type="button" data-copy="${escapeHtml(source.sourceNote)}">Copy Note</button>
            </footer>
          </article>
        `
      )
      .join("") || '<p class="loading">No source anchors match the current filters.</p>';
}

function renderTimeline() {
  const root = document.querySelector("#chronology-root");
  if (!root) return;

  root.innerHTML = chronology
    .map((item) => {
      const links = item.sources
        .map((id) => sourceById.get(id))
        .filter(Boolean)
        .map((source) => `<a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(source.title)}</a>`)
        .join(" | ");

      return `
        <article class="timeline-card">
          <div class="timeline-date">${formatDate(item.date)}</div>
          <div class="timeline-body">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <p>${links}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPullQueue() {
  const root = document.querySelector("#queue-root");
  if (!root) return;

  root.innerHTML = pullQueue
    .map((item) => {
      const sourceLinks = item.sources
        .map((id) => sourceById.get(id))
        .filter(Boolean)
        .map((source) => `<a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(source.title)}</a>`)
        .join(" | ");

      return `
        <article class="queue-card">
          <div class="queue-rank">${item.rank}</div>
          <div>
            <span>${escapeHtml(item.label)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
            <p>${sourceLinks}</p>
          </div>
          <p class="next">${escapeHtml(item.next)}</p>
        </article>
      `;
    })
    .join("");
}

function renderRecipes() {
  const root = document.querySelector("#recipes-root");
  if (!root) return;

  root.innerHTML = searchRecipes
    .map(
      (recipe) => `
        <article class="recipe-card">
          <h3>${escapeHtml(recipe.title)}</h3>
          <p>${escapeHtml(recipe.repository)}</p>
          <div class="query-box">${escapeHtml(recipe.query)}</div>
          <ul>
            ${recipe.targets.map((target) => `<li>${escapeHtml(target)}</li>`).join("")}
          </ul>
          <div class="recipe-actions">
            <a href="${escapeHtml(recipe.url)}" rel="noreferrer">Open Repository</a>
            <button type="button" data-copy="${escapeHtml(recipe.query)}">Copy Query</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSourceNotes() {
  const root = document.querySelector("#notes-root");
  if (!root) return;

  root.innerHTML = sourceNotes
    .map(
      (item) => `
        <article class="note-card">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="source-note">${escapeHtml(item.note)}</div>
          <div class="note-actions">
            <button type="button" data-copy="${escapeHtml(item.note)}">Copy Note</button>
          </div>
        </article>
      `
    )
    .join("");
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadSourceCsv() {
  const headers = ["title", "institution", "repository", "lane", "priority", "period", "status", "url", "useFor"];
  const rows = filteredSources().map((source) =>
    headers.map((header) => csvEscape(source[header])).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "post-cold-war-prc-sources.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  addOptions(repositoryFilter, uniqueSorted(sourceCollections.map((source) => source.repository)), "All repositories");
  addOptions(laneFilter, uniqueSorted(sourceCollections.map((source) => source.lane)), "All lanes");

  for (const node of [sourceSearch, repositoryFilter, laneFilter, priorityFilter]) {
    node?.addEventListener("input", renderSources);
  }

  clearFilters?.addEventListener("click", () => {
    if (sourceSearch) sourceSearch.value = "";
    if (repositoryFilter) repositoryFilter.value = "";
    if (laneFilter) laneFilter.value = "";
    if (priorityFilter) priorityFilter.value = "";
    renderSources();
  });

  downloadSources?.addEventListener("click", downloadSourceCsv);

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    copyText(button.getAttribute("data-copy"), button);
  });
}

function init() {
  renderStats();
  renderLanes();
  bindEvents();
  renderSources();
  renderTimeline();
  renderPullQueue();
  renderRecipes();
  renderSourceNotes();
}

init();
