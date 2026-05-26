const sourceTopics = [
  { id: "volume-control", title: "Volume Control" },
  { id: "strategy", title: "Strategy of Engagement and Enlargement" },
  { id: "directives", title: "PRD/PDD Architecture" },
  { id: "public-case", title: "Public Case for Engagement" },
  { id: "democracy-markets", title: "Democracy, Markets, and Human Rights" },
  { id: "institutions", title: "Institutions, Alliances, and Global Governance" },
  { id: "force-peacekeeping", title: "Use of Force and Peace Operations" },
  { id: "transnational", title: "Transnational Threats and Global Issues" },
  { id: "handoff", title: "Second-Term Globalization Handoff" }
];

const chronologyPeriods = [
  {
    id: "pre-1993",
    number: "Before 1993",
    title: "Campaign And Transition Premises",
    range: "1991-1992",
    start: "1991-01-01",
    end: "1992-12-31",
    summary:
      "Use campaign statements, transition memoranda, advisory papers, and inherited end-of-Cold-War assumptions only when they explain later governing premises.",
    focus: ["campaign", "transition", "incoming framework"]
  },
  {
    id: "1993-setup",
    number: "Jan.-Aug. 1993",
    title: "Process Reset And Review Machinery",
    range: "1993-01-01 to 1993-08-31",
    start: "1993-01-01",
    end: "1993-08-31",
    summary:
      "Open with the first-day PRD/PDD system, NSC organization, early democracy and resources reviews, and the strategy review path.",
    focus: ["PDD-1", "PDD-2", "PRD reviews"]
  },
  {
    id: "1993-1994-doctrine",
    number: "Sept. 1993-1994",
    title: "Enlargement Doctrine And First Strategy",
    range: "1993-09-01 to 1994-12-31",
    start: "1993-09-01",
    end: "1994-12-31",
    summary:
      "Move from Lake's enlargement speech and the UN public case into NATO adaptation, peacekeeping doctrine, and the 1994 National Security Strategy.",
    focus: ["enlargement", "UNGA", "NSS 1994"]
  },
  {
    id: "1995-1996-consolidation",
    number: "1995-1996",
    title: "First-Term Consolidation",
    range: "1995-01-01 to 1996-12-31",
    start: "1995-01-01",
    end: "1996-12-31",
    summary:
      "Track how national strategy, democracy, markets, institutions, counterterrorism, organized crime, and speech drafting mature before the second term.",
    focus: ["NSS 1995/1996", "UN 50", "PDD-39/42"]
  },
  {
    id: "1997-1998-new-century",
    number: "1997-1998",
    title: "New-Century Strategy And Threat Frame",
    range: "1997-01-01 to 1998-12-31",
    start: "1997-01-01",
    end: "1998-12-31",
    summary:
      "Use second-term strategy, speechwriting, contingency management, critical infrastructure, and unconventional threats as the chronology shifts toward globalization.",
    focus: ["NSS 1997", "PDD-56", "PDD-63"]
  },
  {
    id: "1999-2000-handoff",
    number: "1999-2000",
    title: "Late-Term Handoff",
    range: "1999-01-01 to 2000-12-31",
    start: "1999-01-01",
    end: "2000-12-31",
    summary:
      "Close with new-century strategy, public diplomacy, global integration, and the source handoff into adjacent topical volumes.",
    focus: ["NSS 1999/2000", "globalization", "handoff"]
  }
];

const sourceLeads = [
  {
    title: "FRUS 1993-2000, Volume I official page",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Volume anchor",
    priority: "Anchor",
    date: "1993-2000",
    identifier: "frus1993-00v01",
    url: "https://history.state.gov/historicaldocuments/frus1993-00v01",
    note:
      "Official volume title and public status. The page identifies Volume I as Foundations of Foreign Policy and marks it Being Researched.",
    tags: ["official", "status", "volume"]
  },
  {
    title: "Clinton administration FRUS volume list",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Subseries boundary",
    priority: "Anchor",
    date: "1993-2000",
    identifier: "Clinton subseries",
    url: "https://history.state.gov/historicaldocuments/clinton",
    note:
      "Places Volume I beside the Clinton administration topical volumes, which is essential for preventing Volume I from absorbing implementation records.",
    tags: ["official", "boundary", "topical volumes"]
  },
  {
    title: "Status of the Series entry",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Status anchor",
    priority: "Anchor",
    date: "current",
    identifier: "Being Researched",
    url: "https://history.state.gov/historicaldocuments/status-of-the-series",
    note:
      "Controls how the page describes the volume: source map and pull list, not a published-document edition.",
    tags: ["official", "status", "research"]
  },
  {
    title: "About the Foreign Relations series",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Editorial standard",
    priority: "High",
    date: "current",
    identifier: "FRUS statute and method",
    url: "https://history.state.gov/historicaldocuments/about-frus",
    note:
      "Useful for applying the FRUS selection test: major foreign policy decisions and significant diplomatic activity, with reliable source notes.",
    tags: ["method", "selection", "statute"]
  },
  {
    title: "National Security Council collection",
    institution: "Clinton Digital Library",
    lane: "directives",
    type: "Office collection",
    priority: "High",
    date: "1993-2001",
    identifier: "CDL collection 27",
    url: "https://clinton.presidentiallibraries.us/collections/show/27",
    note:
      "Collection-level guide for Clinton NSC leadership, foreign-policy speechwriting, records management, and document movement through the President and National Security Advisor.",
    tags: ["NSC", "Lake", "Berger", "records management"]
  },
  {
    title: "Presidential Directives guide",
    institution: "Clinton Presidential Library",
    lane: "directives",
    type: "Directive index",
    priority: "High",
    date: "1993-2000",
    identifier: "PDD/PRD list",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    note:
      "Public index explaining PRDs and PDDs and listing the directive series that replaced the Bush-era NSR/NSD framework.",
    tags: ["PDD", "PRD", "NSC"]
  },
  {
    title: "Records of the NSC Records Management Office",
    institution: "National Archives Catalog",
    lane: "directives",
    type: "Collection",
    priority: "High",
    date: "Clinton administration",
    identifier: "NAID 7388808",
    url: "https://catalog.archives.gov/id/7388808",
    note:
      "Parent collection for PRS/RMS files, directive records, and cross-cutting NSC records that may carry source-note-ready locators.",
    tags: ["NAID 7388808", "PRS", "RMS"]
  },
  {
    title: "Records of the NSC Speechwriting Office",
    institution: "National Archives Catalog",
    lane: "public-case",
    type: "Collection",
    priority: "High",
    date: "Clinton administration",
    identifier: "NAID 7388842",
    url: "https://catalog.archives.gov/id/7388842",
    note:
      "Parent collection for speechwriting records, including Boorstin, Blinken, Widmer, and other staff files.",
    tags: ["NAID 7388842", "speechwriting", "public doctrine"]
  },
  {
    title: "Antony Blinken NSC Speechwriter files",
    institution: "Clinton Presidential Library",
    lane: "public-case",
    type: "Finding aid",
    priority: "High",
    date: "1994-1998",
    identifier: "2006-0459-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0459-f-antony-tony-blinken-nsc-speechwriter",
    note:
      "Large speechwriting body with drafts, final delivered speeches, State of the Union foreign-policy sections, Lake/Berger speeches, and foreign-policy theme material.",
    tags: ["Blinken", "speech drafts", "Lake", "Berger"]
  },
  {
    title: "Robert Boorstin NSC Speechwriter files",
    institution: "Clinton Presidential Library",
    lane: "public-case",
    type: "Finding aid",
    priority: "High",
    date: "1994-1995",
    identifier: "2006-0460-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0460-f-robert-o-boorstin-nsc-speechwriter",
    note:
      "Speech drafts and background files for Clinton, Lake, Berger, and Christopher, including UN 50th anniversary, G-7, NATO, democracy, and nonproliferation files.",
    tags: ["Boorstin", "UN 50th", "G7", "NATO"]
  },
  {
    title: "Edward Widmer NSC Speechwriter files",
    institution: "Clinton Presidential Library",
    lane: "handoff",
    type: "Finding aid",
    priority: "High",
    date: "1997-2000",
    identifier: "2006-0471-F",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/edward-ted-widmer-nsc-speechwriter",
    note:
      "Second-term foreign-policy speechwriting files, useful for globalization, China, Russia, Northern Ireland, Mexico, and new-century doctrine.",
    tags: ["Widmer", "globalization", "second term"]
  },
  {
    title: "Office of Press and Communications - P.J. Crowley",
    institution: "Clinton Digital Library",
    lane: "public-case",
    type: "Digital collection",
    priority: "Medium",
    date: "1993-1994",
    identifier: "CDL collection 106",
    url: "https://clinton.presidentiallibraries.us/collections/show/106",
    note:
      "Press and communications files provide public framing, press lines, interview prep, and first-year doctrine messaging around foreign and domestic renewal.",
    tags: ["press guidance", "P.J. Crowley", "public case"]
  },
  {
    title: "Presidential Daily Diary",
    institution: "National Archives Catalog",
    lane: "volume-control",
    type: "Chronology source",
    priority: "Medium",
    date: "1993-2001",
    identifier: "NAID 101784492",
    url: "https://catalog.archives.gov/id/101784492",
    note:
      "Schedule-control source for high-level speeches, meetings, and calls that need dating before archival promotion.",
    tags: ["chronology", "daily diary", "schedule"]
  },
  {
    title: "Presidential Daily Diary 2010-0083-F online file-unit search",
    institution: "National Archives Catalog",
    lane: "volume-control",
    type: "File-unit result set",
    priority: "High",
    date: "1993-2000",
    identifier: "2010-0083-F / WJC*",
    url: "https://catalog.archives.gov/search?q=%222010-0083-F%22&collectionIdentifier=WJC*",
    note:
      "NARA Catalog search set used for this page's Daily Diary section. The result set supplied 59 online file units to check calls, meetings, briefings, summit preparation, and doctrine-event chronology.",
    tags: ["2010-0083-F", "daily diary", "chronology"]
  },
  {
    title: "Records of the NSC Executive Secretary",
    institution: "National Archives Catalog",
    lane: "directives",
    type: "Collection",
    priority: "High",
    date: "Clinton administration",
    identifier: "NAID 7386739",
    url: "https://catalog.archives.gov/id/7386739",
    note:
      "Cross-cutting NSC subject-file and routing source for high-level policy coordination and interagency paper flow.",
    tags: ["Executive Secretary", "routing", "subject files"]
  },
  {
    title: "National Security Strategy archive",
    institution: "DOD Historical Office",
    lane: "strategy",
    type: "Published strategy series",
    priority: "High",
    date: "1994-2000",
    identifier: "NSS archive",
    url: "https://history.defense.gov/Historical-Sources/National-Security-Strategy/lang/en/",
    note:
      "Official archive for the Clinton-era National Security Strategy reports that give the published strategy baseline.",
    tags: ["NSS", "engagement", "new century"]
  },
  {
    title: "GovInfo Public Papers of the Presidents",
    institution: "GovInfo",
    lane: "public-case",
    type: "Public Papers",
    priority: "High",
    date: "1993-2000",
    identifier: "PPP collection",
    url: "https://www.govinfo.gov/app/collection/ppp",
    note:
      "Public Papers anchor for delivered presidential remarks, statements, letters, exchanges, and public messages.",
    tags: ["Public Papers", "speeches", "chronology"]
  },
  {
    title: "FRUS 1969-1976, Volume I precedent",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Precedent volume",
    priority: "High",
    date: "1969-1972",
    identifier: "frus1969-76v01",
    url: "https://history.state.gov/historicaldocuments/frus1969-76v01",
    note:
      "Precedent Foundations volume using speeches, public articles, essays, presidential letters, memoranda, Cabinet reports, public messages, and editorial notes.",
    tags: ["precedent", "document types", "Nixon"]
  },
  {
    title: "FRUS 1969-1976, Volume XXXVIII, Part 1 precedent",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Precedent volume",
    priority: "High",
    date: "1973-1976",
    identifier: "frus1969-76v38p1",
    url: "https://history.state.gov/historicaldocuments/frus1969-76v38p1",
    note:
      "Precedent Foundations volume using background briefings, HAK/President memcons, White House tapes, Cabinet and NSC minutes, NSSM/NSDM files, annual reports, and Kissinger speech files.",
    tags: ["precedent", "document types", "Nixon-Ford"]
  },
  {
    title: "FRUS 1977-1980, Volume I precedent",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Precedent volume",
    priority: "High",
    date: "1974-1980",
    identifier: "frus1977-80v01",
    url: "https://history.state.gov/historicaldocuments/frus1977-80v01",
    note:
      "Precedent Foundations volume using campaign speeches, transition memoranda, NSC weekly reports, PRC minutes, congressional testimony, public addresses, and Policy Planning memoranda.",
    tags: ["precedent", "document types", "Carter"]
  },
  {
    title: "FRUS 1981-1988, Volume I precedent",
    institution: "Office of the Historian",
    lane: "volume-control",
    type: "Precedent volume",
    priority: "High",
    date: "1975-1988",
    identifier: "frus1981-88v01",
    url: "https://history.state.gov/historicaldocuments/frus1981-88v01",
    note:
      "Precedent Foundations volume using public statements, campaign and transition records, speech drafts, NSC/Executive Secretariat files, Policy Planning memoranda, briefing books, and talking points.",
    tags: ["precedent", "document types", "Reagan"]
  },
  {
    title: "White House archived releases",
    institution: "Archived White House",
    lane: "public-case",
    type: "Public release archive",
    priority: "Medium",
    date: "1993-2000",
    identifier: "clintonwhitehouse6",
    url: "https://clintonwhitehouse6.archives.gov/",
    note:
      "Useful for exact-date releases, press briefings, speech texts, and public statements that can be paired with speechwriting files.",
    tags: ["released text", "press", "speeches"]
  }
];

const documentTypes = [
  {
    type: "Public doctrine speeches and addresses",
    precedent:
      "Nixon/Ford, Carter, and Reagan Foundations volumes used presidential and senior-principal addresses before NATO, UNGA, veterans, press, and foreign-policy audiences.",
    clintonTargets:
      "UNGA speeches, State of the Union foreign-policy sections, Freedom House, Truman Library, NATO/UN/G7 speeches, and delivered NSS rollouts.",
    sources: ["Public Papers", "Archived White House", "NSC Speechwriting"]
  },
  {
    type: "Background briefings and on-background press sessions",
    precedent:
      "FRUS 1969-1976, Volume XXXVIII, Part 1 identifies Kissinger background briefings as a useful source for intellectual assumptions underlying policy.",
    clintonTargets:
      "Lake, Berger, Christopher, Albright, McCurry, Crowley, and senior-administration backgrounders on enlargement, globalization, NATO, UN reform, and threats.",
    sources: ["Press files", "Speechwriting", "Public affairs records"]
  },
  {
    type: "Campaign and pre-presidential foreign-policy statements",
    precedent:
      "Carter 1975-1976 foreign-policy addresses and Reagan 1980 campaign statements were included before inauguration to explain governing premises.",
    clintonTargets:
      "1991-1992 campaign speeches, candidate foreign-policy statements, Little Rock transition files, and early administration continuity notes.",
    sources: ["Campaign files", "Transition records", "Speechwriting"]
  },
  {
    type: "Articles, essays, and published intellectual frame-setters",
    precedent:
      "The Nixon volume printed Nixon's Foreign Affairs article and Kissinger's essay because they framed policy before formal decisions.",
    clintonTargets:
      "Published Lake, Berger, Christopher, Talbott, Gore, and Clinton doctrine pieces where they shaped later strategy language.",
    sources: ["Published sources", "Speech drafts", "Press files"]
  },
  {
    type: "Transition-team reports and advisory-board papers",
    precedent:
      "Carter transition priority memoranda and Reagan foreign-policy advisory-board papers showed first-six-month priorities before inauguration.",
    clintonTargets:
      "Clinton-Gore transition foreign-policy papers, State transition reports, NSC organization notes, and early priority papers.",
    sources: ["Transition records", "NSC Records Management", "Executive Secretary"]
  },
  {
    type: "Presidential letters and messages",
    precedent:
      "Prior volumes used presidential letters to Cabinet officials, foreign leaders, and arms-control principals as evidence of policy direction.",
    clintonTargets:
      "Letters to Christopher, Lake, Berger, Gore, congressional leaders, NATO/UN counterparts, and foreign leaders that frame broad policy.",
    sources: ["Public Papers", "NSC RMS", "Presidential correspondence"]
  },
  {
    type: "Memoranda to the President or senior principals",
    precedent:
      "Nixon, Carter, and Reagan volumes all used memoranda from aides, NSC staff, Policy Planning, and Cabinet officers to principals.",
    clintonTargets:
      "Lake/Berger/Steinberg memos to Clinton, S/P memoranda to Christopher or Albright, NEC/NSC memos, and Seventh Floor policy memos.",
    sources: ["NSC files", "S/P files", "Executive Secretariat"]
  },
  {
    type: "Cabinet, NSC, PRC, and interagency meeting minutes",
    precedent:
      "The Nixon/Ford and Carter volumes used Cabinet, NSC, Policy Review Committee, and bipartisan-leadership meeting minutes.",
    clintonTargets:
      "NSC/Principals/Deputies Committee minutes, economic-policy coordination, PDD review meetings, and strategy drafting meetings.",
    sources: ["NSC Institutional Files", "Executive Secretary", "Daily Diary"]
  },
  {
    type: "Congressional testimony, special messages, and hearing records",
    precedent:
      "Prior volumes included congressional testimony and special messages when they articulated broad foreign-policy programs.",
    clintonTargets:
      "Christopher, Albright, Lake, Berger, Gore, Rubin, and Barshefsky testimony on national strategy, assistance, trade, NATO, UN, and threats.",
    sources: ["Congressional Record", "Hearing prints", "Public Papers"]
  },
  {
    type: "Briefing books, talking points, and preparation papers",
    precedent:
      "Reagan sources emphasize briefing books and talking points; prior source notes also reference attached briefing materials not printed.",
    clintonTargets:
      "Summit books, UN/G7/NATO briefing papers, State of the Union policy inserts, press prep, and strategy rollout talking points.",
    sources: ["Speechwriting", "Trip files", "NSC RMS"]
  },
  {
    type: "Daily reports, diaries, trip files, and chronology controls",
    precedent:
      "Previous volumes used Presidential Daily Diary, White House tapes, trip files, evening reports, and press/trip records to control context and sequence.",
    clintonTargets:
      "Presidential Daily Diary entries, trip files, evening reports, press guidance, and schedule records for doctrine events.",
    sources: ["Presidential Daily Diary", "Trip files", "Press files"]
  },
  {
    type: "Editorial notes",
    precedent:
      "The prior Foundations volumes use editorial notes to bridge public texts, unavailable records, press coverage, and document sequences.",
    clintonTargets:
      "Use editorial notes for unavailable directive texts, published NSS drafting context, adjacent-volume handoffs, and public-record clusters.",
    sources: ["Compiler notes", "Public chronology", "Cross-volume references"]
  }
];

const libraryPulls = [
  {
    rank: "01",
    title: "Directive And Chronology Spine",
    source: "2013-0185-M Part 3",
    priority: "Start here",
    oaids: ["4116A", "4118-4120", "4122", "2268-2338", "3221-3248", "3956-3960"],
    folders:
      "PDD-1, PDD-2, PDD-39, PDD-42, PDD-56, PDD-62, PDD-63, PDD-68, PRD-1, NS Files, IFG Files, PRS Chrons.",
    why:
      "This gives the compiler the official process spine, directive sequence, and PRS chronology needed before judging speech or strategy files.",
    onsite:
      "Request PDD-1/PDD-2 first, then sample PDD-56/PDD-62/PDD-63/PDD-68 and the PRS chron ranges around promoted documents."
  },
  {
    rank: "02",
    title: "Speechwriting Doctrine Trail",
    source: "2013-0185-M Part 4",
    priority: "High yield",
    oaids: ["1850-1851", "1846-1849", "3378-3389", "2190-2191"],
    folders:
      "National Security Strategy, Tony Lake resources speech, NATO Enlargement, POTUS UNGA 1997, APEC, E.U. Summit, Widmer NSC/NATO/Steinberg files.",
    why:
      "These folders can connect public doctrine to drafts, clearance notes, principal edits, and talking points.",
    onsite:
      "Photograph folder title pages and pull three samples per speech: earliest draft, marked-up draft, and final/press version."
  },
  {
    rank: "03",
    title: "NATO And European Security Sequence",
    source: "2013-0185-M Parts 1-3",
    priority: "High yield",
    oaids: ["888-891", "899-911", "1017", "1505-1509", "1719-1722", "1841-1842"],
    folders:
      "European Security/NATO Expansion, NATO-Russia, Lake/Berger meeting papers, Enlargement, NATO Summit, MAP, Open Door, Summit Agenda Working Papers.",
    why:
      "This is the best Clinton Library path for distinguishing foundational alliance doctrine from Europe/NATO implementation.",
    onsite:
      "Start with meeting papers, key papers, talking points, and summit working papers; leave country implementation files for topical volumes."
  },
  {
    rank: "04",
    title: "UN, Multilateral, And Global Governance",
    source: "2013-0185-M Parts 3-4",
    priority: "High yield",
    oaids: ["2461-2462", "2826-2827", "3451-3452", "3904", "809-817", "1393"],
    folders:
      "POTUS UNGA visits, U.N. arrears/reform, PDDs, internal conflict and state collapse, Security Council, UNGA briefing books, Soderberg U.N. reform memos.",
    why:
      "These files can anchor the institutions and global-governance part of the chronology with briefing books and interagency evidence.",
    onsite:
      "Pull UNGA briefing books beside Wilcox and Soderberg files; capture whether the file contains briefing tabs, draft remarks, or decision memoranda."
  },
  {
    rank: "05",
    title: "Senior Principal Process Files",
    source: "2013-0185-M Parts 3-4",
    priority: "Decision record",
    oaids: ["1385-1388", "1393-1394", "1466", "1479-1481"],
    folders:
      "Lake hearing preparation, Soderberg chron files and PC/DC notes, U.N. reform memoranda, Lake NSC staff meetings, Berger foreign-policy breakfast, notes, calls, and schedules.",
    why:
      "These are the best bet for moving beyond public text into high-level process and decision context.",
    onsite:
      "Prioritize notes, policy materials, staff meeting records, PC/DC notes, and any documents with presidential or national security advisor routing."
  },
  {
    rank: "06",
    title: "Global Economy, Trade, And Open Markets",
    source: "2013-0185-M Parts 3-4",
    priority: "Cross-cutting",
    oaids: ["3384", "3379", "3381", "3389", "3380", "422-424", "1401", "1416-1419", "1479", "1493", "4159"],
    folders:
      "APEC, WTO, G-7/G-8, IMF/World Bank, debt relief, PNTR, E.U. summit, trade language, APEC communications plan, Berger and Steinberg economic summit files.",
    why:
      "The foundations volume needs economic statecraft as doctrine, not only as trade implementation.",
    onsite:
      "Sample materials that connect markets and domestic renewal to security strategy; de-prioritize routine bilateral trade folders."
  },
  {
    rank: "07",
    title: "Transnational Threats And New-Century Frame",
    source: "2013-0185-M Parts 3-4",
    priority: "Late-term",
    oaids: ["4120", "1760", "2239", "3187-3189", "3928", "4051", "7234+"],
    folders:
      "PDD-62, PDD-63, PDD-68, Transnational Threats chron files, G-8/Lyon Group, Global Taskings, Global Work Program, cyber and WTO/protest-adjacent files.",
    why:
      "These folders show how the volume can close with terrorism, infrastructure, cyber, crime, and public information as new-century themes.",
    onsite:
      "Use this as a second-day pull unless directive and speechwriting files already confirm the late-term frame."
  },
  {
    rank: "08",
    title: "Press, Backgrounders, And Communications Control",
    source: "2013-0185-M Part 3",
    priority: "Source-note support",
    oaids: ["103106", "3297", "3303", "4153"],
    folders:
      "NSC meeting, PDDs/PRDs, U.N. arrears communications plan, Berger influentials meeting memos, press and public-affairs files.",
    why:
      "These are useful for background briefings, rollout mechanics, and triangulating public doctrine with communications guidance.",
    onsite:
      "Pull only when a speech, directive, or meeting file needs public-rollout context; mark as support evidence, not the main documentary spine."
  }
];

const dailyDiaryReferences = [
  {
    date: "1993-01-22",
    title: "Opening intelligence and national security briefings",
    type: "Briefings",
    naid: "147870741",
    catalogTitle: "[01/20/1993-01/31/1993]",
    url: "https://catalog.archives.gov/id/147870741",
    entries: [
      "9:25-9:30 intelligence briefing with CIA briefers, McLarty, Tony Lake, and Sandy Berger.",
      "9:30-9:50 national security briefing with Vice President Gore, Lake, Berger, McLarty, and CIA briefers."
    ],
    volumeUse:
      "Use as a first-week process control for the PDD-1/PDD-2 opening machinery and the national security briefing rhythm.",
    followUp:
      "Pair with NSC Executive Secretary or Records Management files before using the briefings as evidence of policy substance.",
    tags: ["process reset", "NSC", "first week"]
  },
  {
    date: "1993-01-23",
    title: "First foreign-leader call sequence",
    type: "Calls / NSC staff control",
    naid: "147870741",
    catalogTitle: "[01/20/1993-01/31/1993]",
    url: "https://catalog.archives.gov/id/147870741",
    entries: [
      "10:30-11:00 meeting with Tony Lake and Sandy Berger.",
      "10:45-11:17 conference call with Russian President Boris Yeltsin, with Nicholas Burns, Cornelius O'Leary, Rose Gottemoeller, and a State interpreter.",
      "11:20-11:30 conference call with Israeli Prime Minister Yitzhak Rabin, with Edmund Hull, Cornelius O'Leary, and Martin Indyk."
    ],
    volumeUse:
      "High-yield chronology control for the first foreign-policy calls and NSC staffing pattern after inauguration.",
    followUp:
      "Look for memcons, call sheets, Situation Room logs, and Lake/Berger briefing notes before promotion.",
    tags: ["Russia", "Middle East", "Lake", "Berger"]
  },
  {
    date: "1993-01-26",
    title: "Ukraine call and early NSC briefing rhythm",
    type: "Calls / briefings",
    naid: "147870741",
    catalogTitle: "[01/20/1993-01/31/1993]",
    url: "https://catalog.archives.gov/id/147870741",
    entries: [
      "8:52-9:10 intelligence briefing and 9:10-9:20 national security briefing with Gore, Lake, Berger, and McLarty.",
      "11:45-11:51 meeting with Sandy Berger.",
      "11:51-12:06 conference call with Ukrainian President Leonid Kravchuk, with Nicholas Burns, Situation Room staff, and a State interpreter."
    ],
    volumeUse:
      "Controls early post-Soviet leader contact and shows the daily linkage between briefing, Berger contact, and call execution.",
    followUp:
      "Check Russia/Ukraine NSC files and any call transcript or memcon before treating the entry as more than schedule evidence.",
    tags: ["Ukraine", "post-Soviet", "briefings"]
  },
  {
    date: "1993-02-10",
    title: "Allied, Russian, and UN calls in one NSC block",
    type: "Calls",
    naid: "17367481",
    catalogTitle: "Hardcopy 1/24/93; 1/28/93; 2/6/93; 2/10/93; 2/16/93; 2/25/93",
    url: "https://catalog.archives.gov/id/17367481",
    entries: [
      "1:45-2:55 meeting with Nancy Soderberg and Jane Hall.",
      "1:51-2:15 conference call with Boris Yeltsin.",
      "2:16-2:28 conference call with British Prime Minister John Major.",
      "2:30-2:38 conference call with German Chancellor Helmut Kohl.",
      "2:44-2:50 conference call with UN Secretary General Boutros Boutros-Ghali."
    ],
    volumeUse:
      "Strong early marker for how the new NSC handled Russia, allies, and the UN in the same presidential call window.",
    followUp:
      "Prioritize Soderberg, European affairs, Situation Room, and State interpreter records for substantive call evidence.",
    tags: ["Russia", "allies", "UN", "Soderberg"]
  },
  {
    date: "1993-04-06",
    title: "Vancouver and G-7 summit briefing",
    type: "Summit briefing",
    naid: "17367492",
    catalogTitle: "Hardcopy 3/2/93; 3/8/93; 3/12/93; 4/6/93; 4/14/93; 4/27/93; 4/30/93",
    url: "https://catalog.archives.gov/id/17367492",
    entries: [
      "1:25-1:35 meeting with Vice President Gore, Secretary Christopher, and Martin Indyk.",
      "3:20-4:40 briefing on the upcoming Vancouver and G-7 Summits.",
      "Appendix C attendee list includes Gore, Christopher, Bentsen, Panetta, Lake, Rubin, Fuerth, Berger, Cutter, Strobe Talbott, Spero, Summers, Graham Allison, Soderberg, Fauver, Gati, Rosner, Speckhard, and Nicholas Burns."
    ],
    volumeUse:
      "High-value control point for Russia, economic statecraft, G-7 coordination, and the first-year strategy review environment.",
    followUp:
      "Pull summit briefing books, economic-policy papers, and Russia/NIS meeting files for decision and drafting substance.",
    tags: ["G-7", "Russia", "economic statecraft", "Vancouver"]
  },
  {
    date: "1993-09-21",
    title: "Lake enlargement speech day",
    type: "Briefings / speech coordination",
    naid: "17367517",
    catalogTitle: "Hardcopy 7/6/93; 7/16/93; 7/18/93; 8/2/93; 8/7/93; 8/20/93; 8/29/93; 9/1/93; 9/17/93; 9/21/93; 9/25/93",
    url: "https://catalog.archives.gov/id/17367517",
    entries: [
      "9:20-9:30 intelligence briefing with Gore, Lake, Berger, and Fuerth.",
      "9:30-9:45 national security briefing with Gore, Lake, Berger, and Fuerth.",
      "9:55-10:10 meeting with Gore, Paul Begala, Mandy Grunwald, David Dreyer, Robert Boorstin, and David Kusnet."
    ],
    volumeUse:
      "Chronology control for the day Lake delivered 'From Containment to Enlargement' and for locating parallel speechwriting or policy-coordination files.",
    followUp:
      "Use the Blinken/Boorstin speechwriting folders for draft history and clearance evidence.",
    tags: ["enlargement", "speechwriting", "Lake"]
  },
  {
    date: "1993-10-06",
    title: "Meeting with NATO Secretary General Manfred Woerner",
    type: "Meeting",
    naid: "17368174",
    catalogTitle: "Hardcopy 10/6/93; 10/11/93; 10/18/93; 10/26/93; 11/6/93; 11/17/93; 11/18/93; 11/30/93",
    url: "https://catalog.archives.gov/id/17368174",
    entries: [
      "11:45-12:00 meeting with Manfred Woerner, Secretary General of NATO.",
      "Appendix C attendee list includes the President, Ambassador Robert Hunter, Tony Lake, Jenonne Walker, Charles Kupchan, Woerner, Klaus Scharioth, James Foley, and Jamie Shea."
    ],
    volumeUse:
      "Controls an early NATO institutional-adaptation contact before the January 1994 Brussels summit sequence.",
    followUp:
      "Check NATO enlargement and European security folders for meeting memoranda or briefing papers.",
    tags: ["NATO", "Europe", "institutions"]
  },
  {
    date: "1993-11-17",
    title: "APEC and NAFTA public-case controls",
    type: "Meetings / public statements",
    naid: "17368174",
    catalogTitle: "Hardcopy 10/6/93; 10/11/93; 10/18/93; 10/26/93; 11/6/93; 11/17/93; 11/18/93; 11/30/93",
    url: "https://catalog.archives.gov/id/17368174",
    entries: [
      "November 17, 9:57-10:08 meeting to discuss the upcoming APEC Summit with Gore and McLarty.",
      "November 18, 8:40-9:40 coffee to discuss the upcoming APEC Summit with bipartisan members of Congress.",
      "November 18, 10:05-10:15 radio address taping on the upcoming APEC Summit and NAFTA vote.",
      "November 18, 11:28 statement to the press on House passage of NAFTA legislation and the upcoming APEC Summit."
    ],
    volumeUse:
      "Useful for connecting open-markets doctrine, domestic renewal, and Asia-Pacific economic architecture without overloading the trade volume.",
    followUp:
      "Pair with APEC communications plans, NEC/NSC records, Public Papers, and speechwriting drafts.",
    tags: ["APEC", "NAFTA", "economic statecraft"]
  },
  {
    date: "1994-01-03",
    title: "NATO summit preparation and denuclearization ceremony",
    type: "Meetings / ceremony",
    naid: "147870783",
    catalogTitle: "[01/01/1994-01/15/1994]",
    url: "https://catalog.archives.gov/id/147870783",
    entries: [
      "January 3, 10:10-10:59 meeting with Administration officials to discuss the upcoming NATO Summit in Europe.",
      "January 3, 5:15-5:51 meeting with the Joint Chiefs of Staff to discuss the upcoming NATO Summit.",
      "January 15, 11:05-11:15 signing ceremony for the Denuclearization Agreement with Russia and Ukraine, with Yeltsin and Kravchuk."
    ],
    volumeUse:
      "Chronological bridge from enlargement doctrine to NATO adaptation and post-Soviet security architecture.",
    followUp:
      "Pull NATO Summit briefing books, JCS briefing records, and Russia/Ukraine memcons before promotion.",
    tags: ["NATO", "Russia", "Ukraine", "denuclearization"]
  },
  {
    date: "1994-04-10",
    title: "Bosnia/NATO use-of-force meetings",
    type: "Meetings / calls",
    naid: "147870795",
    catalogTitle: "[04/01/1994-04/15/1994]",
    url: "https://catalog.archives.gov/id/147870795",
    entries: [
      "April 10, 3:15-3:55 meeting with Administration officials to discuss recent NATO bombing in Bosnia.",
      "April 14, 3:15-3:50 meeting with Christopher, Perry, Shalikashvili, Lake, and Berger.",
      "April 14 conference calls with British Prime Minister John Major and French President Francois Mitterrand.",
      "April 15, 9:35-11:00 foreign policy meeting with Gore, Christopher, Perry, Shalikashvili, Woolsey, Albright, Lake, Berger, and Fuerth."
    ],
    volumeUse:
      "Use only as boundary control for force, alliance, and peace-operations doctrine; detailed Bosnia implementation belongs elsewhere.",
    followUp:
      "Check PDD-25, NATO, UN, and Bosnia files for the policy documents that explain the doctrine rather than the operation.",
    tags: ["Bosnia", "NATO", "force", "boundary"]
  },
  {
    date: "1997-08-15",
    title: "Second-term foreign policy meeting",
    type: "Meeting",
    naid: "17368185",
    catalogTitle: "Hardcopy 7/1/97; 7/18/97; 7/20/97; 7/30/97; 8/3/97; 8/4/97; 8/15/97; 8/31/97; 9/3/97; 9/16/97; 9/19/97; 9/27/97; 10/1/97; 10/13/97; 10/20/97; 10/28/97; 11/1/97; 11/19/97; 11/20/97; 12/9/97; 12/10/97; 12/25/97",
    url: "https://catalog.archives.gov/id/17368185",
    entries: [
      "Appendix A lists a Foreign Policy Meeting in the Cabinet Room with the President, Gore, Albright, Cohen, Tenet, Robert Gelbard, Dennis Ross, and Brian Atwood."
    ],
    volumeUse:
      "Use as a second-term process checkpoint around the New Century strategy period and cross-regional foreign-policy coordination.",
    followUp:
      "Find the meeting agenda, minutes, briefing papers, and any Berger/Steinberg follow-up before selecting a document.",
    tags: ["second term", "Albright", "Cohen", "process"]
  },
  {
    date: "1998-03-04",
    title: "Foreign policy meeting with Berger call control",
    type: "Meeting / call",
    naid: "147870907",
    catalogTitle: "[03/01/1998-03/14/1998]",
    url: "https://catalog.archives.gov/id/147870907",
    entries: [
      "9:00-9:03 p.m. call with National Security Advisor Sandy Berger.",
      "Appendix A lists a March 4 Foreign Policy Meeting in the Cabinet Room with Gore, Albright, Cohen, Shelton, Slocombe, Richardson, Pickering, Raines, Tenet, Berger, Steinberg, Kerrick, Riedel, Podesta, and Richard Clarke."
    ],
    volumeUse:
      "Late-1990s checkpoint for foreign-policy process, global issues, and second-term threat framing.",
    followUp:
      "Check Berger, Steinberg, Richard Clarke, and NSC global-issues files for substantive meeting material.",
    tags: ["Berger", "Steinberg", "global issues", "second term"]
  },
  {
    date: "1999-04-14",
    title: "Late-term foreign policy meeting",
    type: "Meeting",
    naid: "17368193",
    catalogTitle: "Hardcopy 4/9/99; 4/14/99; 4/27/99; 4/30/99; 5/2/99; 5/20/99; 5/24/99; 5/28/99; 6/2/99; 6/10/99; 6/20/99",
    url: "https://catalog.archives.gov/id/17368193",
    entries: [
      "Appendix A lists an April 14 Foreign Policy Meeting in the Cabinet Room with the President, Albright, Cohen, Berger, Shalikashvili, Strobe Talbott, and Brian Atwood."
    ],
    volumeUse:
      "Late-term process checkpoint for NATO/Balkans overlap, democracy and assistance policy, and senior-principal coordination.",
    followUp:
      "Use as a pointer into Berger, Talbott, State, Defense, and topical volume records; do not select from the diary alone.",
    tags: ["late term", "NATO", "Balkans", "Talbott"]
  },
  {
    date: "2000-07-21",
    title: "G-7/G-8, Russia, and UN Millennium sequence",
    type: "Briefings / meetings",
    naid: "17368201",
    catalogTitle: "Hardcopy 4/4/00; 4/1200; 4/25/00; 5/7/00; 5/18/00; 5/22/00; 5/26/00; 6/7/00; 6/8/00; 6/18/00",
    url: "https://catalog.archives.gov/id/17368201",
    entries: [
      "July 21, 1:58-2:27 G-7 and G-8 Summit briefing with Administration officials.",
      "July 21, 2:28-2:43 foreign policy briefing on the upcoming meeting with Russian officials.",
      "July 21, 3:31-5:50 G-7 session.",
      "September 6, 10:55-11:22 briefing with Albright, Berger, Holbrooke, Sestanovich, NSC staff, and others.",
      "September 6, 11:29-12:26 meeting with Russian President Vladimir Putin, followed by a signing ceremony for the Strategic Stability Cooperation Initiative."
    ],
    volumeUse:
      "Controls the late-term handoff into globalization, G-8, Russia, UN, and strategic-stability themes.",
    followUp:
      "Pull G-8 summit books, UN Millennium briefing papers, Russia memcons, and Strategic Stability Initiative files.",
    tags: ["G-8", "Russia", "UN", "handoff"]
  }
];

const documentChronology = [
  {
    date: "1993-01-20",
    title: "PDD-1 - Establishment of Presidential Review and Decision Series",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "First-day reset of the Clinton PRD/PDD system. This should lead the documentary chronology because it defines how later national security reviews and decisions were recorded.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-1, Establishment of Presidential Review and Decision Series, January 20, 1993. Public directive index; released text, classification marking, and copy status to be verified.",
    nextPull: "Pull Records Management or Executive Secretary copies for classification, distribution, and implementation context.",
    tags: ["PDD-1", "process", "first day"]
  },
  {
    date: "1993-01-20",
    title: "PDD-2 - Organization of the National Security Council",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Foundational NSC organization document. It controls the early chronology because it explains the institutional channel for presidential foreign-policy choices.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-2, Organization of the National Security Council, January 20, 1993. Public directive index; pull NSC Executive Secretary or Records Management copy for final classification and distribution details.",
    nextPull: "Match to NSC Executive Secretary routing files and first-week Daily Diary briefings.",
    tags: ["PDD-2", "NSC", "process"]
  },
  {
    date: "1993-01-22",
    title: "First intelligence and national security briefings",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/147870741",
    summary:
      "Daily Diary control for the first regular briefings with CIA briefers, McLarty, Lake, Berger, and Gore.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, [01/20/1993-01/31/1993], NAID 147870741. Schedule-control entry; match against substantive records before promotion.",
    nextPull: "Use this to date the first-week PDD-1/PDD-2 source packets and any NSC briefing memoranda.",
    tags: ["Daily Diary", "briefings", "NAID 147870741"]
  },
  {
    date: "1993-01-23",
    title: "Yeltsin and Rabin call controls",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/147870741",
    summary:
      "Early presidential foreign-leader call sequence, with Lake/Berger meeting control and NSC staffing for Russia and Middle East calls.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, [01/20/1993-01/31/1993], NAID 147870741. Schedule-control entry; call transcripts and memcons to be located separately.",
    nextPull: "Search Situation Room, Lake/Berger, Russia/NIS, and Near East files for call records.",
    tags: ["Russia", "Middle East", "calls"]
  },
  {
    date: "1993-02-10",
    title: "Russia, allied, and UN call block",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/17367481",
    summary:
      "One chronological block captures calls with Yeltsin, Major, Kohl, and Boutros-Ghali around a Soderberg/Hall NSC staff meeting.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, hardcopy file including February 10, 1993, NAID 17367481. Schedule-control entry; substantive call records to be verified.",
    nextPull: "Prioritize Soderberg, European affairs, UN, Situation Room, and interpreter records.",
    tags: ["Russia", "allies", "UN"]
  },
  {
    date: "1993-04-06",
    title: "Vancouver and G-7 summit briefing",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/17367492",
    summary:
      "Senior national security and economic-policy attendees make this one of the best early controls for Russia, G-7, and economic statecraft.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, hardcopy file including April 6, 1993, NAID 17367492. Schedule-control entry; briefing papers and summit books to be located separately.",
    nextPull: "Pull summit briefing books, Russia/NIS files, and economic-policy meeting papers.",
    tags: ["G-7", "Russia", "summit prep"]
  },
  {
    date: "1993-04-13",
    title: "PRD-26 - Democracy Programs",
    type: "Directive locator",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Early review directive for democracy promotion as a governing instrument, not just a speech theme.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PRD-26, Democracy Programs, April 13, 1993. Public directive index; responsible office files and release status to be verified.",
    nextPull: "Search NSC Records Management and democracy-program review files for the packet and follow-up papers.",
    tags: ["PRD-26", "democracy", "review"]
  },
  {
    date: "1993-06-11",
    title: "PRD-35 - National Security Review - Strategy",
    type: "Directive locator",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Likely bridge between early policy-review machinery and the 1994 National Security Strategy.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PRD-35, National Security Review - Strategy, June 11, 1993. Public directive index; source packet, drafting office, and distribution status to be verified.",
    nextPull: "Locate strategy review records and compare them against the July 1994 NSS text.",
    tags: ["PRD-35", "strategy", "NSS"]
  },
  {
    date: "1993-09-21",
    title: "Tony Lake, From Containment to Enlargement",
    type: "Public text plus draft trail",
    status: "Public text; archival draft folder lead",
    source: "NSC Speechwriting / Clinton Library",
    url: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0459-f-antony-tony-blinken-nsc-speechwriter",
    summary:
      "Signature public doctrine event. Its place in the chronology is strongest when paired with Blinken/Boorstin drafts and the same-day Daily Diary controls.",
    sourceNote:
      "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, Antony 'Tony' Blinken Files, OA/ID 3386, Lake, From Containment to Enlargement. Public text available separately; draft date, classification marking, and clearance markings to be verified.",
    nextPull: "Pull the Blinken and Boorstin enlargement files, then compare drafts to delivered text.",
    tags: ["enlargement", "Lake", "speech draft"]
  },
  {
    date: "1993-10-06",
    title: "Meeting with NATO Secretary General Manfred Woerner",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/17368174",
    summary:
      "Early NATO institutional-adaptation contact before the January 1994 Brussels and Partnership for Peace sequence.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, hardcopy file including October 6, 1993, NAID 17368174. Schedule-control entry; meeting papers to be located separately.",
    nextPull: "Check NATO enlargement, European security, and Kupchan/Hunter files for briefing papers or memcons.",
    tags: ["NATO", "Europe", "meeting"]
  },
  {
    date: "1994-01-03",
    title: "NATO summit preparation and denuclearization sequence",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/147870783",
    summary:
      "Diary controls for NATO summit preparation and the January 15 denuclearization ceremony with Yeltsin and Kravchuk.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, [01/01/1994-01/15/1994], NAID 147870783. Schedule-control entry; briefing books and memcons to be located separately.",
    nextPull: "Pair with NATO Summit briefing books, JCS briefing records, and Russia/Ukraine memcons.",
    tags: ["NATO", "Russia", "Ukraine"]
  },
  {
    date: "1994-05-03",
    title: "PDD-25 - Reforming Multilateral Peace Operations",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Doctrine-setting peace operations record. This belongs in the chronology if the volume needs use-of-force criteria, not Bosnia or Somalia implementation detail.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-25, U.S. Policy on Reforming Multilateral Peace Operations, May 3, 1994. Public directive index; released text, classification marking, and review file to be verified.",
    nextPull: "Pull the PDD-25 source packet and separate general doctrine from regional implementation.",
    tags: ["PDD-25", "peace operations", "force"]
  },
  {
    date: "1994-07-01",
    title: "A National Security Strategy of Engagement and Enlargement",
    type: "Published strategy",
    status: "Public online text",
    source: "DOD Historical Office",
    url: "https://history.defense.gov/Portals/70/Documents/nss/nss1994.pdf",
    summary:
      "First Clinton National Security Strategy and central published doctrine baseline for the volume.",
    sourceNote:
      "Source: The White House, A National Security Strategy of Engagement and Enlargement, July 1994. Published strategy paper; internal NSC drafting, review, and clearance file to be supplied for archival source note.",
    nextPull: "Match against PRD-35 and NSC drafting or clearance files before final selection.",
    tags: ["NSS 1994", "engagement", "enlargement"]
  },
  {
    date: "1995-06-21",
    title: "PDD-39 - U.S. Policy on Counterterrorism",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Broad transnational-threat doctrine marker for the first-term turn toward terrorism as a national security concern.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-39, U.S. Policy on Counterterrorism, June 21, 1995. Public directive index; released text, classification marking, and implementation-file boundary to be verified.",
    nextPull: "Use only the foundational policy frame; route operational counterterrorism records to the topical volume.",
    tags: ["PDD-39", "terrorism", "transnational"]
  },
  {
    date: "1995-10-21",
    title: "PDD-42 - International Organized Crime",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Shows organized crime entering the national security and foreign-policy frame.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-42, International Organized Crime, October 21, 1995. Public directive index; final source note requires released text, classification marking, and implementation-file boundary.",
    nextPull: "Pair with transnational-threat and global-issues files, then keep implementation records out of Volume I.",
    tags: ["PDD-42", "organized crime", "global issues"]
  },
  {
    date: "1997-05-01",
    title: "A National Security Strategy for a New Century",
    type: "Published strategy",
    status: "Public online text",
    source: "Archived White House",
    url: "https://clintonwhitehouse3.archives.gov/WH/EOP/NSC/Strategy/",
    summary:
      "Second-term strategy marker for the shift from enlargement language toward integration, globalization, and new-century architecture.",
    sourceNote:
      "Source: The White House, A National Security Strategy for a New Century, May 1997. Published strategy paper; NSC drafting and clearance file to be supplied for FRUS source-note treatment.",
    nextPull: "Search Berger, Steinberg, and Widmer files for draft and clearance evidence.",
    tags: ["NSS 1997", "new century", "globalization"]
  },
  {
    date: "1998-03-04",
    title: "Second-term foreign-policy meeting control",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/147870907",
    summary:
      "Diary appendix lists a foreign-policy meeting with Albright, Cohen, Shelton, Richardson, Tenet, Berger, Steinberg, Kerrick, Riedel, Podesta, and Richard Clarke.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, [03/01/1998-03/14/1998], NAID 147870907. Schedule-control entry; meeting papers to be located separately.",
    nextPull: "Search Berger, Steinberg, Clarke, and global-issues files for meeting agenda, papers, and follow-up.",
    tags: ["foreign policy meeting", "Berger", "Steinberg"]
  },
  {
    date: "1998-05-20",
    title: "PDD-63 - Critical Infrastructure Protection",
    type: "Directive anchor",
    status: "Released index; source packet pending",
    source: "Clinton Presidential Library",
    url: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Late-term marker for cyber, infrastructure, and new security categories in the globalization handoff.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-63, Critical Infrastructure Protection, May 20, 1998. Public directive index; source packet and declassification status to be verified.",
    nextPull: "Pull the directive source packet and public rollout records before using it as a volume-closing document.",
    tags: ["PDD-63", "cyber", "infrastructure"]
  },
  {
    date: "1999-12-01",
    title: "A National Security Strategy for a New Century",
    type: "Published strategy",
    status: "Public online text",
    source: "Library of Congress",
    url: "https://www.loc.gov/item/2023693030/",
    summary:
      "Late-administration strategy with stable public metadata; useful for closing the volume's chronology.",
    sourceNote:
      "Source: The White House, A National Security Strategy for a New Century, December 1999. Published strategy paper; Library of Congress copy supplies public metadata pending NSC drafting file review.",
    nextPull: "Pair with Widmer, Berger, Steinberg, and NSS drafting files.",
    tags: ["NSS 1999", "new century", "handoff"]
  },
  {
    date: "2000-07-21",
    title: "G-7/G-8, Russia, and UN Millennium sequence",
    type: "Declassified diary file unit",
    status: "Online Catalog file unit",
    source: "National Archives Catalog",
    url: "https://catalog.archives.gov/id/17368201",
    summary:
      "Late-term Diary controls for G-7/G-8 briefing, a Russia briefing, Putin meeting, UN Millennium events, and the Strategic Stability Cooperation Initiative.",
    sourceNote:
      "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, hardcopy file including July-September 2000 entries, NAID 17368201. Schedule-control entry; summit books and memcons to be located separately.",
    nextPull: "Pull G-8 summit books, UN Millennium briefing papers, Russia memcons, and Strategic Stability Initiative files.",
    tags: ["G-8", "Russia", "UN", "handoff"]
  }
];

const records = [
  {
    title: "PDD-1 - Establishment of Presidential Review and Decision Series",
    lane: "directives",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive anchor",
    priority: "High",
    date: "1993-01-20",
    identifier: "PDD-1",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Foundational source for the new Clinton PRD/PDD system and for explaining why early 1993 review directives matter to Volume I.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-1, Establishment of Presidential Review and Decision Series, January 20, 1993. Public directive index; released text, classification marking, and copy status to be verified.",
    risk: "Use the public index as locator only; pull released text or source folder before quoting."
  },
  {
    title: "PDD-2 - Organization of the National Security Council",
    lane: "directives",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive anchor",
    priority: "High",
    date: "1993-01-20",
    identifier: "PDD-2",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Core source for the administration's NSC structure, interagency process, and how national-security decisions moved through the White House.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-2, Organization of the National Security Council, January 20, 1993. Public directive index; pull NSC Executive Secretary or Records Management copy for final classification and distribution details.",
    risk: "Needs comparison with NSC Executive Secretary and Records Management files for implementation evidence."
  },
  {
    title: "PRD-35 - National Security Review - Strategy",
    lane: "strategy",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive locator",
    priority: "High",
    date: "1993-06-11",
    identifier: "PRD-35",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Likely bridge between early policy review machinery and the 1994 National Security Strategy of Engagement and Enlargement.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PRD-35, National Security Review - Strategy, June 11, 1993. Public directive index; source packet, drafting office, and distribution status to be verified.",
    risk: "The public index lists the directive, but the release/source packet needs exact pull verification."
  },
  {
    title: "Tony Lake, From Containment to Enlargement",
    lane: "strategy",
    sourceRepository: "NSC Speechwriting / public text",
    sourceType: "Speech draft trail",
    priority: "High",
    date: "1993-09-21",
    identifier: "Blinken OA/ID 3386",
    sourceUrl: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0459-f-antony-tony-blinken-nsc-speechwriter",
    alternateUrl: "https://www.globalsecurity.org/wmd/library/news/usa/1993/usa-930921.htm",
    summary:
      "Signature public doctrine event for the shift from containment to enlargement. The Blinken finding aid lists Lake enlargement files that can connect public text to draft evidence.",
    sourceNote:
      "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, Antony 'Tony' Blinken Files, OA/ID 3386, Lake, From Containment to Enlargement. Public text available separately; draft date, classification marking, and clearance markings to be verified.",
    risk: "Treat GlobalSecurity text as public copy; use Clinton Library folder provenance for source-note confidence."
  },
  {
    title: "President Clinton, Address to the United Nations General Assembly",
    lane: "public-case",
    sourceRepository: "Archived White House",
    sourceType: "Public speech",
    priority: "High",
    date: "1993-09-27",
    identifier: "UNGA 1993",
    sourceUrl: "https://clintonwhitehouse6.archives.gov/1993/09/1993-09-27-presidents-address-to-the-un.html",
    summary:
      "Early public articulation of the administration's post-Cold War foreign-policy themes before the UN.",
    sourceNote:
      "Source: Public Papers: Clinton, 1993, page citation to be supplied; also available at the archived White House website. Public speech; match against NSC Speechwriting drafts and clearance notes before promotion.",
    risk: "Needs matching NSC speechwriting draft, clearance notes, or briefing papers."
  },
  {
    title: "A National Security Strategy of Engagement and Enlargement",
    lane: "strategy",
    sourceRepository: "DOD Historical Office",
    sourceType: "Published strategy",
    priority: "High",
    date: "1994-07-01",
    identifier: "NSS 1994",
    sourceUrl: "https://history.defense.gov/Portals/70/Documents/nss/nss1994.pdf",
    summary:
      "First Clinton-era National Security Strategy report and the central published doctrine baseline for Volume I.",
    sourceNote:
      "Source: The White House, A National Security Strategy of Engagement and Enlargement, July 1994. Published strategy paper; internal NSC drafting, review, and clearance file to be supplied for archival source note.",
    risk: "Needs internal drafting and policy-review trail before becoming more than a published baseline."
  },
  {
    title: "A National Security Strategy of Engagement and Enlargement",
    lane: "strategy",
    sourceRepository: "DOD Historical Office",
    sourceType: "Published strategy",
    priority: "High",
    date: "1995-02-01",
    identifier: "NSS 1995",
    sourceUrl: "https://history.defense.gov/Portals/70/Documents/nss/nss1995.pdf",
    summary:
      "Follow-on published strategy that can be compared against 1994 language to identify continuity and adjustment.",
    sourceNote:
      "Source: The White House, A National Security Strategy of Engagement and Enlargement, February 1995. Published strategy paper; draft record and interagency comment trail to be supplied.",
    risk: "Draft record and interagency comment trail still need source discovery."
  },
  {
    title: "A National Security Strategy of Engagement and Enlargement",
    lane: "strategy",
    sourceRepository: "DOD Historical Office",
    sourceType: "Published strategy",
    priority: "High",
    date: "1996-02-01",
    identifier: "NSS 1996",
    sourceUrl: "https://history.defense.gov/Portals/70/Documents/nss/nss1996.pdf",
    summary:
      "Late-first-term strategy report useful for showing how enlargement, trade, democracy promotion, and new threats were carried into the 1996 election year.",
    sourceNote:
      "Source: The White House, A National Security Strategy of Engagement and Enlargement, February 1996. Published strategy paper; internal policy-selection records to be supplied before final document selection.",
    risk: "Do not overuse published language without internal policy-selection records."
  },
  {
    title: "A National Security Strategy for a New Century",
    lane: "handoff",
    sourceRepository: "Archived White House",
    sourceType: "Published strategy",
    priority: "High",
    date: "1997-05-01",
    identifier: "NSS 1997",
    sourceUrl: "https://clintonwhitehouse3.archives.gov/WH/EOP/NSC/Strategy/",
    summary:
      "Second-term strategy marker for moving from enlargement language toward integration, globalization, and new-century architecture.",
    sourceNote:
      "Source: The White House, A National Security Strategy for a New Century, May 1997. Published strategy paper; NSC drafting and clearance file to be supplied for FRUS source-note treatment.",
    risk: "Needs source trail for drafting and review; public web text is not itself a decision file."
  },
  {
    title: "A National Security Strategy for a New Century",
    lane: "handoff",
    sourceRepository: "Library of Congress",
    sourceType: "Published strategy",
    priority: "High",
    date: "1999-12-01",
    identifier: "LCCN 2023693030",
    sourceUrl: "https://www.loc.gov/item/2023693030/",
    summary:
      "Late-administration published strategy with formal bibliographic metadata, useful for the volume's concluding frame.",
    sourceNote:
      "Source: The White House, A National Security Strategy for a New Century, December 1999. Published strategy paper; Library of Congress copy supplies public metadata pending NSC drafting file review.",
    risk: "Use as public baseline; pull NSC/White House drafting records for compiler use."
  },
  {
    title: "Boorstin files - UN 50th anniversary speech drafts",
    lane: "institutions",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Finding-aid folder lead",
    priority: "High",
    date: "1995-06 to 1995-10",
    identifier: "2006-0460-F / OA-ID 424",
    sourceUrl: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0460-f-robert-o-boorstin-nsc-speechwriter",
    summary:
      "Folder lead for UN 50th anniversary drafts, briefings, background articles, and public doctrine around reforming or renewing postwar institutions.",
    sourceNote:
      "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, Robert O. Boorstin Files, 2006-0460-F, OA/ID 424, UN 50th anniversary speech drafts. Finding-aid folder lead; document-level date, classification marking, and copy status to be verified.",
    risk: "Folder-level lead only; document-level page counts and exact draft dates are pending."
  },
  {
    title: "Blinken files - State of the Union foreign-policy sections",
    lane: "public-case",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Finding-aid folder lead",
    priority: "High",
    date: "1996-1998",
    identifier: "2006-0459-F / OA-IDs 3387-3389",
    sourceUrl: "https://www.clintonlibrary.gov/research/archives/finding-aids/2006-0459-f-antony-tony-blinken-nsc-speechwriter",
    summary:
      "Foreign-policy sections and theme memos for State of the Union drafting, useful for public-case evolution and presidential edits.",
    sourceNote:
      "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, Antony 'Tony' Blinken Files, 2006-0459-F, OA/IDs 3387-3389, State of the Union foreign-policy sections. Finding-aid folder lead; item-level date, version, and clearance notes to be verified.",
    risk: "Needs item-level review to separate speech packaging from substantive NSC edits."
  },
  {
    title: "PDD-25 - U.S. Policy on Reforming Multilateral Peace Operations",
    lane: "force-peacekeeping",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive anchor",
    priority: "High",
    date: "1994-05-03",
    identifier: "PDD-25",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "High-value use-of-force and peacekeeping policy anchor, but detailed Somalia, Haiti, Bosnia, or Rwanda records should remain in topical volumes.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-25, U.S. Policy on Reforming Multilateral Peace Operations, May 3, 1994. Public directive index; released text, classification marking, and review file to be verified.",
    risk: "Volume I should select only the doctrine-setting record or review trail."
  },
  {
    title: "PRD-26 - Democracy Programs",
    lane: "democracy-markets",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive locator",
    priority: "High",
    date: "1993-04-13",
    identifier: "PRD-26",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Key review directive for democracy promotion as a broad foreign-policy instrument.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PRD-26, Democracy Programs, April 13, 1993. Public directive index; responsible office files and release status to be verified.",
    risk: "Needs released text or responsible office files before source-note promotion."
  },
  {
    title: "PDD-39 and PDD-42 threat-policy frame",
    lane: "transnational",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive anchors",
    priority: "High",
    date: "1995-06 to 1995-10",
    identifier: "PDD-39 / PDD-42",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Broad policy anchor for counterterrorism and international organized crime as post-Cold War transnational threats.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-39 and PDD-42, June-October 1995. Public directive index; final source note requires released text, exact directive title, classification marking, and implementation-file boundary.",
    risk: "Detailed implementation belongs to counterterrorism, narcotics, law-enforcement, or global-issues volumes."
  },
  {
    title: "PDD-63 - Critical Infrastructure Protection",
    lane: "handoff",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Directive anchor",
    priority: "Medium",
    date: "1998-05-20",
    identifier: "PDD-63",
    sourceUrl: "https://www.clintonlibrary.gov/research/presidential-directives",
    summary:
      "Late-term marker for new security categories, cyber/infrastructure vulnerability, and the globalization handoff.",
    sourceNote:
      "Source: Clinton Presidential Library, Presidential Directives, PDD-63, Critical Infrastructure Protection, May 20, 1998. Public directive index; source packet and declassification status to be verified.",
    risk: "Use sparingly unless internal records show it shaped the administration's foundational narrative."
  },
  {
    title: "Widmer files - second-term foreign-policy speeches",
    lane: "handoff",
    sourceRepository: "Clinton Presidential Library",
    sourceType: "Finding aid",
    priority: "High",
    date: "1997-2000",
    identifier: "2006-0471-F",
    sourceUrl: "https://www.clintonlibrary.gov/research/archives/finding-aids/edward-ted-widmer-nsc-speechwriter",
    summary:
      "Second-term speech drafts and revisions, including globalization-era themes and presidential edits.",
    sourceNote:
      "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, Edward 'Ted' Widmer Files, 2006-0471-F. Finding-aid collection lead; pull folder titles, item dates, and version markings before drafting final source note.",
    risk: "Needs sample pull before it can support claims about presidential revision patterns."
  },
  {
    title: "Presidential Daily Diary strategy event control",
    lane: "volume-control",
    sourceRepository: "National Archives Catalog",
    sourceType: "Chronology control",
    priority: "Medium",
    date: "1993-2000",
    identifier: "NAID 101784492",
    sourceUrl: "https://catalog.archives.gov/id/101784492",
    summary:
      "Control source for dating doctrine speeches, NSC meetings, summit travel, and public events before aligning drafts and released remarks.",
    sourceNote:
      "Source: National Archives Catalog, Presidential Daily Diary Collection, NAID 101784492. Chronology-control source; use to date events unless paired with a substantive memorandum, speech draft, or meeting record.",
    risk: "Schedule entries are not decision records; use them to verify chronology and event context."
  }
];

const statements = [
  {
    title: "President Clinton's Inaugural Address",
    lane: "public-case",
    date: "1993-01-20",
    sourceRepository: "Archived White House",
    identifier: "1993 inaugural",
    url: "https://clintonwhitehouse6.archives.gov/1993/01/1993-01-20-president-clinton-inaugural-speech.html",
    note:
      "Sets the domestic-foreign linkage: renewal at home, leadership abroad, and the post-Cold War obligation to shape change."
  },
  {
    title: "Tony Lake, From Containment to Enlargement",
    lane: "strategy",
    date: "1993-09-21",
    sourceRepository: "NSC Speechwriting / public text",
    identifier: "SAIS speech",
    url: "https://www.globalsecurity.org/wmd/library/news/usa/1993/usa-930921.htm",
    note:
      "The most direct public statement of enlargement as successor to containment; must be paired with NSC draft folders."
  },
  {
    title: "Address to the United Nations General Assembly",
    lane: "public-case",
    date: "1993-09-27",
    sourceRepository: "Archived White House",
    identifier: "UNGA 1993",
    url: "https://clintonwhitehouse6.archives.gov/1993/09/1993-09-27-presidents-address-to-the-un.html",
    note:
      "Early global audience statement for democracy, development, nonproliferation, peacekeeping, and UN engagement."
  },
  {
    title: "Address Before a Joint Session on the State of the Union",
    lane: "public-case",
    date: "1994-01-25",
    sourceRepository: "Archived White House",
    identifier: "SOTU 1994",
    url: "https://clintonwhitehouse6.archives.gov/1994/01/1994-01-25-presidents-state-of-the-union-address-as-delivered.html",
    note:
      "Public baseline for democracy as a security strategy and the domestic case for international leadership."
  },
  {
    title: "Speech to Future European Leaders",
    lane: "institutions",
    date: "1994-01-09",
    sourceRepository: "Archived White House",
    identifier: "Brussels 1994",
    url: "https://clintonwhitehouse6.archives.gov/1994/01/1994-01-09-presidents-speech-to-future-european-leaders.html",
    note:
      "European security architecture and post-Cold War democratic community frame; keep implementation details for Europe/NATO volumes."
  },
  {
    title: "Remarks at the North Atlantic Council Summit",
    lane: "institutions",
    date: "1994-01-10",
    sourceRepository: "Archived White House",
    identifier: "NAC 1994",
    url: "https://clintonwhitehouse6.archives.gov/1994/01/1994-01-10-presidents-remarks-at-north-atlantic-council-summit.html",
    note:
      "Institutional adaptation and Partnership for Peace public frame; useful only for broad foundations unless draft trail shows doctrine."
  },
  {
    title: "Freedom House remarks on democracy and leadership",
    lane: "democracy-markets",
    date: "1995-10-06",
    sourceRepository: "Archived White House",
    identifier: "Freedom House",
    url: "https://clintonwhitehouse6.archives.gov/1995/10/1995-10-06-president-remarks-in-freedom-house-speech.html",
    note:
      "Strong public statement tying democracy, markets, security, and American leadership."
  },
  {
    title: "Truman Library Institute dinner remarks",
    lane: "institutions",
    date: "1995-10-25",
    sourceRepository: "Archived White House",
    identifier: "Truman Library",
    url: "https://clintonwhitehouse6.archives.gov/1995/10/1995-10-25-president-remarks-at-truman-library-institute-dinner.html",
    note:
      "Uses Truman-era analogies to defend engagement, NATO, UN, and Bosnia policy in the post-Cold War setting."
  },
  {
    title: "A National Security Strategy for a New Century",
    lane: "handoff",
    date: "1997-05-01",
    sourceRepository: "Archived White House",
    identifier: "NSS 1997",
    url: "https://clintonwhitehouse3.archives.gov/WH/EOP/NSC/Strategy/",
    note:
      "Second-term public strategy baseline; useful for new-century language and globalization frame."
  },
  {
    title: "A National Security Strategy for a New Century",
    lane: "handoff",
    date: "1999-12-01",
    sourceRepository: "Library of Congress",
    identifier: "LCCN 2023693030",
    url: "https://www.loc.gov/item/2023693030/",
    note:
      "Late-administration formal strategy report with stable bibliographic metadata and unrestricted online access."
  }
];

const directives = [
  {
    code: "PDD-1",
    series: "PDD",
    title: "Establishment of Presidential Review and Decision Series",
    date: "1993-01-20",
    lane: "directives",
    priority: "High",
    use: "Explains the new directive system and first-day process reset.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-2",
    series: "PDD",
    title: "Organization of the National Security Council",
    date: "1993-01-20",
    lane: "directives",
    priority: "High",
    use: "Core NSC process and structure source.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PRD-20",
    series: "PRD",
    title: "International Programs and Resources",
    date: "1993-03-08",
    lane: "democracy-markets",
    priority: "Medium",
    use: "Budget, program, and resources bridge for broad foreign-policy capacity.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PRD-26",
    series: "PRD",
    title: "Democracy Programs",
    date: "1993-04-13",
    lane: "democracy-markets",
    priority: "High",
    use: "Review spine for democracy promotion as policy instrument.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PRD-35",
    series: "PRD",
    title: "National Security Review - Strategy",
    date: "1993-06-11",
    lane: "strategy",
    priority: "High",
    use: "Likely source path into the 1994 National Security Strategy.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-25",
    series: "PDD",
    title: "U.S. Policy on Reforming Multilateral Peace Operations",
    date: "1994-05-03",
    lane: "force-peacekeeping",
    priority: "High",
    use: "General peacekeeping doctrine and selection criteria.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PRD-46",
    series: "PRD",
    title: "U.S. Policy Toward International Migration and Refugee Affairs",
    date: "1994-05-31",
    lane: "transnational",
    priority: "Medium",
    use: "Connects refugee and migration policy to broader post-Cold War instability.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-39",
    series: "PDD",
    title: "U.S. Policy on Counterterrorism",
    date: "1995-06-21",
    lane: "transnational",
    priority: "High",
    use: "Broad transnational-threat doctrine and later counterterrorism handoff.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-42",
    series: "PDD",
    title: "International Organized Crime",
    date: "1995-10-21",
    lane: "transnational",
    priority: "High",
    use: "Organized crime as a national security and foreign-policy concern.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-56",
    series: "PDD",
    title: "Managing Complex Contingency Operations",
    date: "1997",
    lane: "force-peacekeeping",
    priority: "Medium",
    use: "Second-term coordination doctrine for crisis and contingency management.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-62",
    series: "PDD",
    title: "Protection Against Unconventional Threats",
    date: "1998-05-22",
    lane: "transnational",
    priority: "Medium",
    use: "Terrorism and unconventional threats in the late-term security frame.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-63",
    series: "PDD",
    title: "Critical Infrastructure Protection",
    date: "1998-05-20",
    lane: "handoff",
    priority: "Medium",
    use: "Cyber/infrastructure marker for new-century threat language.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    code: "PDD-68",
    series: "PDD",
    title: "International Public Information",
    date: "1999",
    lane: "handoff",
    priority: "Medium",
    use: "Late-term public diplomacy and international information policy lead.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  }
];

const people = [
  {
    name: "William J. Clinton",
    role: "President",
    lane: "public-case",
    years: "1993-2001",
    source: "Public Papers; Presidential Daily Diary; NSC Records",
    note:
      "Final public voice and presidential decision point; match delivered speeches to drafts and diary entries."
  },
  {
    name: "Albert Gore, Jr.",
    role: "Vice President",
    lane: "democracy-markets",
    years: "1993-2001",
    source: "Public Papers; White House releases; economic and environmental files",
    note:
      "Key actor for global economy, environment, telecommunications, Russia assistance, and Summit of the Americas framing."
  },
  {
    name: "Warren Christopher",
    role: "Secretary of State",
    lane: "institutions",
    years: "1993-1997",
    source: "State/NSC files; Boorstin and Blinken speech drafts",
    note:
      "Foreign-policy framing, Europe/NATO, Asia, democracy, and early Clinton doctrine."
  },
  {
    name: "Madeleine K. Albright",
    role: "Secretary of State / UN Ambassador",
    lane: "institutions",
    years: "1993-2001",
    source: "UN records; Public Papers; NSC speechwriting",
    note:
      "Institutional reform, use of force, UN, NATO, and second-term public doctrine."
  },
  {
    name: "Anthony Lake",
    role: "National Security Advisor",
    lane: "strategy",
    years: "1993-1997",
    source: "NSC collection; Blinken and Boorstin speechwriting files",
    note:
      "Principal architect and public explainer of enlargement; core Volume I figure."
  },
  {
    name: "Samuel R. Berger",
    role: "Deputy National Security Advisor / National Security Advisor",
    lane: "handoff",
    years: "1993-2001",
    source: "NSC collection; Blinken and Widmer files",
    note:
      "Bridges first-term enlargement and second-term new-century/globalization strategy."
  },
  {
    name: "James B. Steinberg",
    role: "Deputy National Security Advisor",
    lane: "handoff",
    years: "1996-2000",
    source: "NSC collection; Blinken and Widmer speechwriting files",
    note:
      "Late-term policy coordination and strategy speech source trail."
  },
  {
    name: "Nancy Soderberg",
    role: "Deputy National Security Advisor",
    lane: "force-peacekeeping",
    years: "1995-1996",
    source: "NSC collection",
    note:
      "Peacekeeping, UN, and complex contingency policy actor."
  },
  {
    name: "Robert E. Rubin",
    role: "NEC Director / Treasury Secretary",
    lane: "democracy-markets",
    years: "1993-1999",
    source: "Public Papers; economic policy files",
    note:
      "Global markets, trade, financial crises, and domestic economic strength as foreign-policy foundation."
  },
  {
    name: "Charlene Barshefsky",
    role: "USTR",
    lane: "democracy-markets",
    years: "1993-2001",
    source: "Public Papers; trade records",
    note:
      "Trade-opening and global economic architecture lead, especially WTO/APEC-era records."
  },
  {
    name: "Strobe Talbott",
    role: "Ambassador-at-Large / Deputy Secretary of State",
    lane: "strategy",
    years: "1993-2001",
    source: "State Department records; companion Russia pages",
    note:
      "Russia/NIS and enlargement strategy figure; use only where his records bear on broad doctrine."
  },
  {
    name: "Richard C. Holbrooke",
    role: "Assistant Secretary / Special Envoy",
    lane: "force-peacekeeping",
    years: "1994-1996",
    source: "State/NSC records; Balkans source maps",
    note:
      "Implementation figure for Bosnia; include in Volume I only for general use-of-force or diplomacy doctrine."
  },
  {
    name: "Robert O. Boorstin",
    role: "NSC Speechwriter",
    lane: "public-case",
    years: "1994-1995",
    source: "Finding aid 2006-0460-F",
    note:
      "Draft trail for first-term foreign-policy speeches, UN 50th, G7, NATO, democracy, and public doctrine."
  },
  {
    name: "Antony Blinken",
    role: "NSC Speechwriter",
    lane: "public-case",
    years: "1994-1998",
    source: "Finding aid 2006-0459-F",
    note:
      "Drafts and final speeches for Clinton, Lake, Berger, Steinberg, and Kerrick; key speech-source control."
  },
  {
    name: "Edward Widmer",
    role: "NSC Speechwriter",
    lane: "handoff",
    years: "1997-2000",
    source: "Finding aid 2006-0471-F",
    note:
      "Second-term foreign-policy speechwriting and presidential revision trail."
  },
  {
    name: "Philip J. Crowley",
    role: "NSC Press and Communications",
    lane: "public-case",
    years: "1993-1997",
    source: "Clinton Digital Library collection 106",
    note:
      "Press guidance and communications files for first-year public framing."
  }
];

const gaps = [
  {
    title: "Official volume shell has no public chapter outline",
    priority: "High",
    lane: "volume-control",
    status: "Open",
    evidence:
      "The public FRUS page currently provides title and research status but no arrangement or document list.",
    problem:
      "The page must avoid pretending a final table of contents exists.",
    needed:
      "Keep the chronology provisional and anchored to pullable source paths.",
    nextActions: [
      "Recheck the Office of the Historian volume page and status page before publication.",
      "Treat every period heading as a compiler aid, not an official chapter title."
    ],
    targetRecords: ["frus1993-00v01", "Clinton subseries"]
  },
  {
    title: "Public doctrine must be paired with internal record evidence",
    priority: "Critical",
    lane: "public-case",
    status: "Open",
    evidence:
      "The strongest public statements are speeches and National Security Strategy reports.",
    problem:
      "Public texts alone can overstate rhetoric and under-document decision-making.",
    needed:
      "Match speeches to draft folders, clearance comments, policy memos, and diary/schedule controls.",
    nextActions: [
      "Pull Blinken, Boorstin, Widmer, and Crowley folders for high-value speeches.",
      "Compare final delivered texts against draft and comment chains."
    ],
    targetRecords: ["2006-0459-F", "2006-0460-F", "2006-0471-F", "CDL 106"]
  },
  {
    title: "PRD/PDD records need exact source-note verification",
    priority: "High",
    lane: "directives",
    status: "Open",
    evidence:
      "The Clinton Library public directive index is strong but often functions as a locator rather than an item-level source note.",
    problem:
      "A directive title is not enough for compiler use without release status, repository path, and document extent.",
    needed:
      "Create directive-by-directive source packets for PDD-1, PDD-2, PRD-35, PRD-26, PDD-25, PDD-39, PDD-42, PDD-63, and PDD-68.",
    nextActions: [
      "Search NSC Records Management Office files for PRD/PDD packets.",
      "Record release status, date, title, and repository path for each directive."
    ],
    targetRecords: ["PDD-1", "PDD-2", "PRD-35"]
  },
  {
    title: "Adjacent-volume overlap can swamp the foundations frame",
    priority: "High",
    lane: "institutions",
    status: "Open",
    evidence:
      "NATO, Russia, Balkans, arms control, economic policy, counterterrorism, and global issues all have their own Clinton subseries homes.",
    problem:
      "Implementation records can crowd out the broad policy foundation Volume I should document.",
    needed:
      "Use a strict doctrine-selection gate and link implementation records to neighboring pages.",
    nextActions: [
      "Mark every candidate with a handoff note when it belongs to another volume.",
      "Keep only records that explain general principles, interagency process, or public doctrine."
    ],
    targetRecords: ["NSS 1994", "PDD-25", "PDD-39"]
  },
  {
    title: "Second-term globalization frame is under-pulled",
    priority: "Medium",
    lane: "handoff",
    status: "Open",
    evidence:
      "The page has solid public NSS anchors for 1997 and 1999 but fewer internal second-term drafting records.",
    problem:
      "The volume could overrepresent early enlargement and underrepresent late new-century strategy.",
    needed:
      "Pull Widmer, Berger, Steinberg, critical infrastructure, international public information, and NSS 1999 source trails.",
    nextActions: [
      "Search Widmer files for globalization, new century, China, Russia, and speeches on international economy.",
      "Search Records Management for PDD-63 and PDD-68 source packets."
    ],
    targetRecords: ["2006-0471-F", "PDD-63", "PDD-68", "NSS 1999"]
  },
  {
    title: "Chronology controls are not decision evidence",
    priority: "Medium",
    lane: "volume-control",
    status: "Open",
    evidence:
      "Daily Diary and schedule records can confirm meetings, speeches, and travel but not policy reasoning.",
    problem:
      "They are useful support sources, but should not be promoted as substantive documents.",
    needed:
      "Use diary entries to date and verify source packets, not as standalone candidate documents.",
    nextActions: [
      "Pair diary entries with speech drafts, memcons, directive packets, or briefing books.",
      "Record diary use in source notes as chronology control."
    ],
    targetRecords: ["NAID 101784492"]
  }
];

const milestones = [
  {
    date: "1993-01-20",
    title: "PDD-1 and PDD-2 reset the NSC directive system",
    lane: "directives",
    summary:
      "The Clinton administration replaced the NSR/NSD system with PRDs and PDDs and organized its NSC machinery on the first day.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    date: "1993-01-20",
    title: "Inaugural address ties renewal at home to leadership abroad",
    lane: "public-case",
    summary:
      "Clinton presented domestic renewal and international engagement as connected tasks for the post-Cold War era.",
    url: "https://clintonwhitehouse6.archives.gov/1993/01/1993-01-20-president-clinton-inaugural-speech.html"
  },
  {
    date: "1993-04-13",
    title: "PRD-26 launches democracy-program review path",
    lane: "democracy-markets",
    summary:
      "The directive index identifies Democracy Programs as an early PRD, making it a source trail for democracy-promotion doctrine.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    date: "1993-06-11",
    title: "PRD-35 National Security Review - Strategy",
    lane: "strategy",
    summary:
      "Potential bridge into the first Clinton National Security Strategy; exact source packet still needs verification.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    date: "1993-09-21",
    title: "Lake announces enlargement doctrine",
    lane: "strategy",
    summary:
      "Anthony Lake's SAIS speech publicly framed enlargement as the post-containment strategy.",
    url: "https://www.globalsecurity.org/wmd/library/news/usa/1993/usa-930921.htm"
  },
  {
    date: "1993-09-27",
    title: "Clinton addresses the UN General Assembly",
    lane: "public-case",
    summary:
      "Early public statement of democracy, nonproliferation, peacekeeping, and international engagement.",
    url: "https://clintonwhitehouse6.archives.gov/1993/09/1993-09-27-presidents-address-to-the-un.html"
  },
  {
    date: "1994-01-10",
    title: "NATO summit and Partnership for Peace public frame",
    lane: "institutions",
    summary:
      "Institutional adaptation and European security frame appear in the January 1994 Brussels sequence.",
    url: "https://clintonwhitehouse6.archives.gov/1994/01/1994-01-10-presidents-remarks-at-north-atlantic-council-summit.html"
  },
  {
    date: "1994-05-03",
    title: "PDD-25 peace operations policy",
    lane: "force-peacekeeping",
    summary:
      "High-value source path for peacekeeping reform and use-of-force criteria.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    date: "1994-07-01",
    title: "First Clinton National Security Strategy",
    lane: "strategy",
    summary:
      "Published National Security Strategy of Engagement and Enlargement provides the central doctrine baseline.",
    url: "https://history.defense.gov/Portals/70/Documents/nss/nss1994.pdf"
  },
  {
    date: "1995-10-06",
    title: "Freedom House democracy and leadership speech",
    lane: "democracy-markets",
    summary:
      "Public case for democracy, markets, peace, and prosperity as linked goals.",
    url: "https://clintonwhitehouse6.archives.gov/1995/10/1995-10-06-president-remarks-in-freedom-house-speech.html"
  },
  {
    date: "1997-05-01",
    title: "National Security Strategy for a New Century",
    lane: "handoff",
    summary:
      "Second-term strategy language emphasizes integration, open societies, open markets, and new-century institutions.",
    url: "https://clintonwhitehouse3.archives.gov/WH/EOP/NSC/Strategy/"
  },
  {
    date: "1998-05-20",
    title: "PDD-63 critical infrastructure protection",
    lane: "handoff",
    summary:
      "New-security and critical-infrastructure marker for late-term globalization and technology risks.",
    url: "https://www.clintonlibrary.gov/research/presidential-directives"
  },
  {
    date: "1999-12-01",
    title: "Late-term National Security Strategy",
    lane: "handoff",
    summary:
      "The Library of Congress record provides a stable public copy and metadata for the December 1999 strategy.",
    url: "https://www.loc.gov/item/2023693030/"
  }
];

const topicById = new Map(sourceTopics.map((topic) => [topic.id, topic]));
const periodById = new Map(chronologyPeriods.map((period) => [period.id, period]));

const leadCount = document.querySelector("#lead-count");
const periodCount = document.querySelector("#period-count");
const libraryCount = document.querySelector("#library-count");
const diaryCount = document.querySelector("#diary-count");
const recordCount = document.querySelector("#record-count");
const statementCount = document.querySelector("#statement-count");
const directiveCount = document.querySelector("#directive-count");
const personCountStat = document.querySelector("#person-count-stat");
const milestoneCount = document.querySelector("#milestone-count");
const gapCount = document.querySelector("#gap-count");

const periodsRoot = document.querySelector("#periods-root");
const libraryRoot = document.querySelector("#library-root");
const diaryRoot = document.querySelector("#diary-root");
const leadsRoot = document.querySelector("#leads-root");
const recordsRoot = document.querySelector("#records-root");
const statementsRoot = document.querySelector("#statements-root");
const directivesRoot = document.querySelector("#directives-root");
const peopleRoot = document.querySelector("#people-root");
const milestonesRoot = document.querySelector("#milestones-root");
const gapsRoot = document.querySelector("#gaps-root");
const typesRoot = document.querySelector("#types-root");
const documentChronologyRoot = document.querySelector("#document-chronology-root");

const leadSearch = document.querySelector("#lead-search");
const periodFilter = document.querySelector("#period-filter");
const institutionFilter = document.querySelector("#institution-filter");
const clearLeadFilters = document.querySelector("#clear-lead-filters");
const leadSummary = document.querySelector("#lead-summary");

const recordSearch = document.querySelector("#record-search");
const recordPeriodFilter = document.querySelector("#record-period-filter");
const recordPriorityFilter = document.querySelector("#record-priority-filter");
const recordSourceFilter = document.querySelector("#record-source-filter");
const clearRecordFilters = document.querySelector("#clear-record-filters");
const exportRecords = document.querySelector("#export-records");
const recordSummary = document.querySelector("#record-summary");

const statementSearch = document.querySelector("#statement-search");
const statementPeriodFilter = document.querySelector("#statement-period-filter");
const statementYearFilter = document.querySelector("#statement-year-filter");
const clearStatementFilters = document.querySelector("#clear-statement-filters");
const exportStatements = document.querySelector("#export-statements");
const statementSummary = document.querySelector("#statement-summary");

const directiveSearch = document.querySelector("#directive-search");
const directiveSeriesFilter = document.querySelector("#directive-series-filter");
const directivePeriodFilter = document.querySelector("#directive-period-filter");
const clearDirectiveFilters = document.querySelector("#clear-directive-filters");
const directiveSummary = document.querySelector("#directive-summary");

const peopleSearch = document.querySelector("#people-search");
const peoplePeriodFilter = document.querySelector("#people-period-filter");
const peopleRoleFilter = document.querySelector("#people-role-filter");
const clearPeopleFilters = document.querySelector("#clear-people-filters");
const exportPeople = document.querySelector("#export-people");
const peopleSummary = document.querySelector("#people-summary");

function formatDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function option(label, value = "") {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function makeChip(text, className = "chip") {
  const chip = document.createElement("span");
  chip.className = className;
  chip.textContent = text;
  return chip;
}

function makeLink(url, label) {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noreferrer";
  link.textContent = label;
  return link;
}

function topicTitle(id) {
  return topicById.get(id)?.title || id || "Unassigned";
}

function dateToStamp(value, endOfUnit = false) {
  const [, year, month, day] = value;
  const normalizedMonth = month || (endOfUnit ? "12" : "01");
  let normalizedDay = day || (endOfUnit ? "31" : "01");
  if (endOfUnit && month && !day) {
    normalizedDay = new Date(Number(year), Number(month), 0).getDate().toString().padStart(2, "0");
  }
  return Date.parse(`${year}-${normalizedMonth}-${normalizedDay}T00:00:00Z`);
}

function dateRange(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/clinton administration|current/i.test(text)) {
    return {
      start: Date.parse("1993-01-01T00:00:00Z"),
      end: Date.parse("2000-12-31T00:00:00Z")
    };
  }

  const matches = [...text.matchAll(/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/g)];
  if (!matches.length) return null;
  const first = matches[0];
  const last = matches[matches.length - 1];
  return {
    start: dateToStamp(first, false),
    end: dateToStamp(last, true)
  };
}

function periodRange(period) {
  return {
    start: Date.parse(`${period.start}T00:00:00Z`),
    end: Date.parse(`${period.end}T00:00:00Z`)
  };
}

function rangesOverlap(left, right) {
  return left.start <= right.end && right.start <= left.end;
}

function matchesPeriod(value, periodId) {
  if (!periodId) return true;
  const period = periodById.get(periodId);
  const range = dateRange(value);
  if (!period || !range) return false;
  return rangesOverlap(range, periodRange(period));
}

function periodTitleForValue(value) {
  const range = dateRange(value);
  if (!range) return "";
  const fullStart = Date.parse("1993-01-01T00:00:00Z");
  const fullEnd = Date.parse("2000-12-31T00:00:00Z");
  if (range.start <= fullStart && range.end >= fullEnd) return "Full Clinton term";
  return chronologyPeriods.find((period) => rangesOverlap(range, periodRange(period)))?.title || "";
}

function chronologicalSort(a, b) {
  const left = dateRange(a.date || a.years)?.start ?? Number.MAX_SAFE_INTEGER;
  const right = dateRange(b.date || b.years)?.start ?? Number.MAX_SAFE_INTEGER;
  return left - right || String(a.title || a.name || a.code).localeCompare(String(b.title || b.name || b.code));
}

function setStats() {
  leadCount.textContent = sourceLeads.length.toString();
  periodCount.textContent = chronologyPeriods.length.toString();
  libraryCount.textContent = libraryPulls.length.toString();
  diaryCount.textContent = dailyDiaryReferences.length.toString();
  recordCount.textContent = records.length.toString();
  statementCount.textContent = statements.length.toString();
  directiveCount.textContent = directives.length.toString();
  personCountStat.textContent = people.length.toString();
  milestoneCount.textContent = milestones.length.toString();
  gapCount.textContent = gaps.length.toString();
}

function populatePeriodFilter(select) {
  select.replaceChildren(option("All periods"));
  for (const period of chronologyPeriods) select.append(option(period.number, period.id));
}

function populateFilters() {
  populatePeriodFilter(periodFilter);
  populatePeriodFilter(recordPeriodFilter);
  populatePeriodFilter(statementPeriodFilter);
  populatePeriodFilter(directivePeriodFilter);
  populatePeriodFilter(peoplePeriodFilter);

  institutionFilter.replaceChildren(option("All institutions"));
  for (const institution of unique(sourceLeads.map((lead) => lead.institution))) {
    institutionFilter.append(option(institution, institution));
  }

  recordPriorityFilter.replaceChildren(option("All priorities"));
  for (const priority of unique(records.map((item) => item.priority))) {
    recordPriorityFilter.append(option(priority, priority));
  }

  recordSourceFilter.replaceChildren(option("All sources"));
  for (const source of unique(records.map((item) => item.sourceRepository))) {
    recordSourceFilter.append(option(source, source));
  }

  statementYearFilter.replaceChildren(option("All years"));
  for (const year of unique(statements.map((item) => (item.date || "").slice(0, 4)))) {
    statementYearFilter.append(option(year, year));
  }

  directiveSeriesFilter.replaceChildren(option("All series"));
  for (const series of unique(directives.map((item) => item.series))) {
    directiveSeriesFilter.append(option(series, series));
  }

  peopleRoleFilter.replaceChildren(option("All roles"));
  for (const role of unique(people.map((item) => item.role))) {
    peopleRoleFilter.append(option(role, role));
  }
}

function countInPeriod(items, field, periodId) {
  return items.filter((item) => matchesPeriod(item[field], periodId)).length;
}

function renderChronology() {
  const cards = chronologyPeriods.map((period) => {
    const card = document.createElement("article");
    card.className = "period-card";
    card.id = `period-${period.id}`;

    const number = document.createElement("strong");
    number.textContent = period.number;

    const title = document.createElement("h3");
    title.textContent = period.title;

    const summary = document.createElement("p");
    summary.textContent = period.summary;

    const meta = document.createElement("div");
    meta.className = "period-meta";
    meta.append(makeChip(period.range, "priority-chip"));
    meta.append(makeChip(`${countInPeriod(records, "date", period.id)} records`));
    meta.append(makeChip(`${countInPeriod(statements, "date", period.id)} statements`));
    meta.append(makeChip(`${countInPeriod(directives, "date", period.id)} directives`));
    for (const focus of period.focus) meta.append(makeChip(focus));

    card.append(number, title, summary, meta);
    return card;
  });

  periodsRoot.replaceChildren(...cards);
}

function renderDocumentChronology() {
  const cards = [...documentChronology].sort(chronologicalSort).map((item) => {
    const card = document.createElement("article");
    card.className = "doc-chrono-row";

    const date = document.createElement("time");
    date.className = "doc-chrono-date";
    date.dateTime = item.date;
    date.textContent = formatDate(item.date);

    const body = document.createElement("div");
    body.className = "doc-chrono-body";

    const label = document.createElement("p");
    label.className = "record-type";
    label.textContent = `${item.type} / ${item.status}`;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const summary = document.createElement("p");
    summary.textContent = item.summary;

    const sourceNote = document.createElement("p");
    sourceNote.className = "source-note";
    sourceNote.textContent = item.sourceNote;

    const nextPull = document.createElement("p");
    nextPull.className = "risk-note";
    nextPull.textContent = `Next pull: ${item.nextPull}`;

    const meta = document.createElement("div");
    meta.className = "doc-chrono-meta";
    meta.append(makeChip(periodTitleForValue(item.date), "priority-chip"));
    meta.append(makeChip(item.source));
    for (const tag of item.tags) meta.append(makeChip(tag));
    meta.append(makeLink(item.url, "Open source"));

    body.append(label, title, summary, sourceNote, nextPull, meta);
    card.append(date, body);
    return card;
  });

  documentChronologyRoot.replaceChildren(...cards);
}

function renderLibraryPulls() {
  const cards = libraryPulls.map((pull) => {
    const card = document.createElement("article");
    card.className = "library-card";

    const header = document.createElement("div");
    header.className = "library-card-header";

    const rank = document.createElement("strong");
    rank.textContent = pull.rank;

    const titleWrap = document.createElement("div");
    const label = document.createElement("p");
    label.className = "record-type";
    label.textContent = `${pull.priority} / ${pull.source}`;
    const title = document.createElement("h3");
    title.textContent = pull.title;
    titleWrap.append(label, title);
    header.append(rank, titleWrap);

    const oaids = document.createElement("p");
    oaids.className = "library-oaids";
    oaids.textContent = `OA/ID pull list: ${pull.oaids.join(", ")}`;

    const folders = document.createElement("p");
    folders.textContent = `Folder targets: ${pull.folders}`;

    const why = document.createElement("p");
    why.className = "risk-note";
    why.textContent = `Why it earns time: ${pull.why}`;

    const onsite = document.createElement("p");
    onsite.className = "library-onsite";
    onsite.textContent = `Reading-room move: ${pull.onsite}`;

    const tags = document.createElement("div");
    tags.className = "item-tags";
    tags.append(makeChip(pull.priority, "priority-chip"));
    tags.append(makeChip(pull.source));
    for (const id of pull.oaids.slice(0, 3)) tags.append(makeChip(id));

    card.append(header, oaids, folders, why, onsite, tags);
    return card;
  });

  libraryRoot.replaceChildren(...cards);
}

function renderDailyDiaryReferences() {
  const cards = [...dailyDiaryReferences].sort(chronologicalSort).map((item) => {
    const card = document.createElement("article");
    card.className = "diary-card";

    const header = document.createElement("div");
    header.className = "diary-card-header";

    const date = document.createElement("time");
    date.className = "diary-date";
    date.dateTime = item.date;
    date.textContent = formatDate(item.date);

    const titleWrap = document.createElement("div");
    const label = document.createElement("p");
    label.className = "record-type";
    label.textContent = `${item.type} / NAID ${item.naid}`;
    const title = document.createElement("h3");
    title.textContent = item.title;
    titleWrap.append(label, title);
    header.append(date, titleWrap);

    const entries = document.createElement("ul");
    entries.className = "diary-entries";
    for (const entry of item.entries) {
      const line = document.createElement("li");
      line.textContent = entry;
      entries.append(line);
    }

    const volumeUse = document.createElement("p");
    volumeUse.className = "diary-use";
    volumeUse.textContent = `Volume use: ${item.volumeUse}`;

    const followUp = document.createElement("p");
    followUp.className = "risk-note";
    followUp.textContent = `Follow-up pull: ${item.followUp}`;

    const sourceNote = document.createElement("p");
    sourceNote.className = "source-note";
    sourceNote.textContent = `Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, ${item.catalogTitle}, NAID ${item.naid}. Schedule-control entry; match against substantive records before promotion.`;

    const links = document.createElement("div");
    links.className = "item-links";
    links.append(makeLink(item.url, "Open Catalog record"));

    const tags = document.createElement("div");
    tags.className = "item-tags";
    tags.append(makeChip(periodTitleForValue(item.date), "priority-chip"));
    for (const tag of item.tags) tags.append(makeChip(tag));

    card.append(header, entries, volumeUse, followUp, sourceNote, links, tags);
    return card;
  });

  diaryRoot.replaceChildren(...cards);
}

function renderDocumentTypes() {
  const cards = documentTypes.map((item) => {
    const card = document.createElement("article");
    card.className = "type-card";

    const label = document.createElement("p");
    label.className = "record-type";
    label.textContent = "Precedent document type";

    const title = document.createElement("h3");
    title.textContent = item.type;

    const precedent = document.createElement("p");
    precedent.textContent = item.precedent;

    const target = document.createElement("p");
    target.className = "risk-note";
    target.textContent = `Clinton targets: ${item.clintonTargets}`;

    const tags = document.createElement("div");
    tags.className = "item-tags";
    for (const source of item.sources) tags.append(makeChip(source));

    card.append(label, title, precedent, target, tags);
    return card;
  });

  typesRoot.replaceChildren(...cards);
}

function searchableText(item, fields) {
  return fields
    .flatMap((field) => {
      const value = item[field];
      return Array.isArray(value) ? value : [value];
    })
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredLeads() {
  const query = leadSearch.value.trim().toLowerCase();
  const period = periodFilter.value;
  const institution = institutionFilter.value;

  return sourceLeads.filter((lead) => {
    if (period && !matchesPeriod(lead.date, period)) return false;
    if (institution && lead.institution !== institution) return false;
    return (
      !query ||
      searchableText(lead, ["title", "institution", "lane", "type", "priority", "date", "identifier", "note", "tags"]).includes(query) ||
      topicTitle(lead.lane).toLowerCase().includes(query)
    );
  });
}

function renderLeads() {
  const items = filteredLeads().sort(chronologicalSort);
  leadSummary.textContent = `${items.length} of ${sourceLeads.length} source leads shown`;

  if (!items.length) {
    leadsRoot.replaceChildren(emptyState("No source leads match the current filters."));
    return;
  }

  const cards = items.map((lead) =>
    renderItemCard({
      type: `${lead.type} / ${lead.institution}`,
      title: lead.title,
      summary: lead.note,
      url: lead.url,
      linkLabel: "Open source",
      period: periodTitleForValue(lead.date),
      side: [lead.priority, lead.date, lead.identifier],
      tags: lead.tags || []
    })
  );

  leadsRoot.replaceChildren(...cards);
}

function filteredRecords() {
  const query = recordSearch.value.trim().toLowerCase();
  const period = recordPeriodFilter.value;
  const priority = recordPriorityFilter.value;
  const source = recordSourceFilter.value;

  return records.filter((item) => {
    if (period && !matchesPeriod(item.date, period)) return false;
    if (priority && item.priority !== priority) return false;
    if (source && item.sourceRepository !== source) return false;
    return (
      !query ||
      searchableText(item, [
        "title",
        "lane",
        "sourceRepository",
        "sourceType",
        "priority",
        "date",
        "identifier",
        "summary",
        "sourceNote",
        "risk"
      ]).includes(query) ||
      topicTitle(item.lane).toLowerCase().includes(query)
    );
  });
}

function renderRecords() {
  const items = filteredRecords().sort(chronologicalSort);
  const highCount = items.filter((item) => item.priority === "High").length;
  recordSummary.textContent = `${items.length} of ${records.length} candidate records shown; ${highCount} high-priority source paths in view`;

  if (!items.length) {
    recordsRoot.replaceChildren(emptyState("No candidate records match the current filters."));
    return;
  }

  const cards = items.map((item) =>
    renderItemCard({
      type: `${item.sourceType} / ${item.sourceRepository}`,
      title: item.title,
      summary: item.summary,
      url: item.sourceUrl,
      linkLabel: "Open source",
      alternateUrl: item.alternateUrl,
      period: periodTitleForValue(item.date),
      side: [item.priority, item.date, item.identifier],
      tags: [item.sourceType, item.sourceRepository],
      sourceNote: item.sourceNote,
      risk: item.risk
    })
  );

  recordsRoot.replaceChildren(...cards);
}

function filteredStatements() {
  const query = statementSearch.value.trim().toLowerCase();
  const period = statementPeriodFilter.value;
  const year = statementYearFilter.value;

  return statements.filter((item) => {
    if (period && !matchesPeriod(item.date, period)) return false;
    if (year && !`${item.date || ""}`.startsWith(year)) return false;
    return (
      !query ||
      searchableText(item, ["title", "lane", "date", "sourceRepository", "identifier", "note"]).includes(query) ||
      topicTitle(item.lane).toLowerCase().includes(query)
    );
  });
}

function renderStatements() {
  const items = filteredStatements().sort(chronologicalSort);
  statementSummary.textContent = `${items.length} of ${statements.length} public doctrine anchors shown`;

  if (!items.length) {
    statementsRoot.replaceChildren(emptyState("No public statements match the current filters."));
    return;
  }

  const cards = items.map((item) => {
    const card = renderItemCard({
      type: `${item.sourceRepository} / ${item.identifier}`,
      title: item.title,
      summary: item.note,
      url: item.url,
      linkLabel: "Open record",
      period: periodTitleForValue(item.date),
      side: [formatDate(item.date)],
      tags: [item.sourceRepository]
    });
    card.classList.add("statement-card");
    return card;
  });

  statementsRoot.replaceChildren(...cards);
}

function filteredDirectives() {
  const query = directiveSearch.value.trim().toLowerCase();
  const series = directiveSeriesFilter.value;
  const period = directivePeriodFilter.value;

  return directives.filter((item) => {
    if (series && item.series !== series) return false;
    if (period && !matchesPeriod(item.date, period)) return false;
    return (
      !query ||
      searchableText(item, ["code", "series", "title", "date", "lane", "priority", "use"]).includes(query) ||
      topicTitle(item.lane).toLowerCase().includes(query)
    );
  });
}

function renderDirectives() {
  const items = filteredDirectives().sort(chronologicalSort);
  directiveSummary.textContent = `${items.length} of ${directives.length} PRD/PDD anchors shown`;

  if (!items.length) {
    directivesRoot.replaceChildren(emptyState("No directives match the current filters."));
    return;
  }

  const cards = items.map((item) => {
    const card = document.createElement("article");
    card.className = "item-card directive-card";

    const code = document.createElement("div");
    code.className = "directive-code";
    code.textContent = item.code;

    const main = document.createElement("div");
    const type = document.createElement("p");
    type.className = "record-type";
    type.textContent = `${item.series} / ${formatDate(item.date)}`;
    const title = document.createElement("h3");
    title.textContent = item.title;
    const summary = document.createElement("p");
    summary.textContent = item.use;
    const tags = document.createElement("div");
    tags.className = "item-tags";
    tags.append(makeChip(periodTitleForValue(item.date), "priority-chip"));
    tags.append(makeChip(item.priority));
    main.append(type, title, summary, makeLink(item.url, "Open directive index"), tags);

    const side = document.createElement("div");
    side.className = "item-side";
    side.append(makeChip(item.series, "priority-chip"));
    side.append(makeChip(item.priority));

    card.append(code, main, side);
    return card;
  });

  directivesRoot.replaceChildren(...cards);
}

function filteredPeople() {
  const query = peopleSearch.value.trim().toLowerCase();
  const period = peoplePeriodFilter.value;
  const role = peopleRoleFilter.value;

  return people.filter((item) => {
    if (period && !matchesPeriod(item.years, period)) return false;
    if (role && item.role !== role) return false;
    return (
      !query ||
      searchableText(item, ["name", "role", "lane", "years", "source", "note"]).includes(query) ||
      topicTitle(item.lane).toLowerCase().includes(query)
    );
  });
}

function renderPeople() {
  const items = filteredPeople().sort(chronologicalSort);
  peopleSummary.textContent = `${items.length} of ${people.length} person leads shown`;

  if (!items.length) {
    peopleRoot.replaceChildren(emptyState("No person leads match the current filters."));
    return;
  }

  const cards = items.map((person) => {
    const card = document.createElement("article");
    card.className = "person-card";

    const top = document.createElement("div");
    top.className = "person-topline";
    const title = document.createElement("h3");
    title.textContent = person.name;
    top.append(title, makeChip(person.role, "priority-chip"));

    const note = document.createElement("p");
    note.textContent = person.note;

    const tags = document.createElement("div");
    tags.className = "item-tags";
    tags.append(makeChip(person.years));
    tags.append(makeChip(person.source));

    card.append(top, note, tags);
    return card;
  });

  peopleRoot.replaceChildren(...cards);
}

function renderMilestones() {
  const cards = [...milestones]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((milestone) => {
      const card = document.createElement("article");
      card.className = "milestone-card";

      const date = document.createElement("div");
      date.className = "milestone-date";
      date.textContent = formatDate(milestone.date);

      const body = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = milestone.title;
      const summary = document.createElement("p");
      summary.textContent = milestone.summary;
      const tags = document.createElement("div");
      tags.className = "item-tags";
      tags.append(makeChip(periodTitleForValue(milestone.date), "priority-chip"));
      tags.append(makeLink(milestone.url, "Open record"));

      body.append(title, summary, tags);
      card.append(date, body);
      return card;
    });

  milestonesRoot.replaceChildren(...cards);
}

function gapPriorityRank(priority) {
  return { Critical: 0, High: 1, Medium: 2, Review: 3 }[priority] ?? 4;
}

function renderGaps() {
  const metrics = document.createElement("div");
  metrics.className = "gap-metrics";

  const highCount = gaps.filter((gap) => ["Critical", "High"].includes(gap.priority)).length;
  const pullCount = new Set(gaps.flatMap((gap) => gap.targetRecords || [])).size;
  for (const item of [
    ["Open gaps", gaps.length, "Tracked compiler-risk issues"],
    ["Critical/high", highCount, "Needs review before promotion"],
    ["Pull targets", pullCount, "Named packets or anchors to verify"],
    ["Chronology anchors", milestones.length, "Dated records to reconcile"]
  ]) {
    const card = document.createElement("article");
    card.className = "gap-metric";
    const value = document.createElement("strong");
    value.textContent = item[1].toString();
    const label = document.createElement("span");
    label.textContent = item[0];
    const note = document.createElement("p");
    note.textContent = item[2];
    card.append(value, label, note);
    metrics.append(card);
  }

  const list = document.createElement("div");
  list.className = "gap-list";
  for (const gap of [...gaps].sort(
    (a, b) => gapPriorityRank(a.priority) - gapPriorityRank(b.priority) || a.title.localeCompare(b.title)
  )) {
    const card = document.createElement("article");
    card.className = `gap-card gap-priority-${String(gap.priority || "review").toLowerCase()}`;

    const header = document.createElement("div");
    header.className = "gap-card-header";
    const heading = document.createElement("h3");
    heading.textContent = gap.title;
    header.append(heading, makeChip(gap.priority, "gap-badge"));

    const meta = document.createElement("div");
    meta.className = "gap-meta";
    meta.append(makeChip(gap.status));
    meta.append(makeChip(`${gap.targetRecords.length} target IDs`));

    const evidence = document.createElement("p");
    evidence.textContent = `Evidence: ${gap.evidence}`;
    const problem = document.createElement("p");
    problem.textContent = `Problem: ${gap.problem}`;
    const needed = document.createElement("p");
    needed.textContent = `Needed: ${gap.needed}`;

    const actions = document.createElement("ul");
    actions.className = "gap-actions";
    for (const action of gap.nextActions) {
      const item = document.createElement("li");
      item.textContent = action;
      actions.append(item);
    }

    const pullList = document.createElement("p");
    pullList.className = "gap-pull-list";
    pullList.textContent = `Pull list: ${gap.targetRecords.join(", ")}`;

    card.append(header, meta, evidence, problem, needed, actions, pullList);
    list.append(card);
  }

  gapsRoot.replaceChildren(metrics, list);
}

function renderItemCard(config) {
  const card = document.createElement("article");
  card.className = "item-card";

  const main = document.createElement("div");
  const type = document.createElement("p");
  type.className = "record-type";
  type.textContent = config.type;

  const title = document.createElement("h3");
  title.textContent = config.title;

  const summary = document.createElement("p");
  summary.textContent = config.summary;

  const links = document.createElement("div");
  links.className = "item-links";
  if (config.url) links.append(makeLink(config.url, config.linkLabel || "Open source"));
  if (config.alternateUrl) links.append(makeLink(config.alternateUrl, "Open public copy"));

  const tags = document.createElement("div");
  tags.className = "item-tags";
  if (config.period) tags.append(makeChip(config.period, "priority-chip"));
  for (const tag of config.tags || []) tags.append(makeChip(tag));

  main.append(type, title, summary);
  if (config.sourceNote) {
    const sourceNote = document.createElement("p");
    sourceNote.className = "source-note";
    sourceNote.textContent = config.sourceNote;
    main.append(sourceNote);
  }
  if (config.risk) {
    const risk = document.createElement("p");
    risk.className = "risk-note";
    risk.textContent = `Compiler risk: ${config.risk}`;
    main.append(risk);
  }
  main.append(links, tags);

  const side = document.createElement("div");
  side.className = "item-side";
  for (const value of config.side || []) {
    if (!value) continue;
    side.append(makeChip(value, value === "High" || value === "Anchor" ? "priority-chip" : "chip"));
  }

  card.append(main, side);
  return card;
}

function emptyState(text) {
  const empty = document.createElement("p");
  empty.className = "loading";
  empty.textContent = text;
  return empty;
}

function exportCsv(fileName, rows, fields) {
  const header = fields.map((field) => field.label).join(",");
  const body = rows.map((row) =>
    fields
      .map((field) => {
        const value = field.value(row);
        return `"${String(value ?? "").replaceAll('"', '""')}"`;
      })
      .join(",")
  );
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  for (const control of [leadSearch, periodFilter, institutionFilter]) {
    control.addEventListener("input", renderLeads);
    control.addEventListener("change", renderLeads);
  }

  for (const control of [recordSearch, recordPeriodFilter, recordPriorityFilter, recordSourceFilter]) {
    control.addEventListener("input", renderRecords);
    control.addEventListener("change", renderRecords);
  }

  for (const control of [statementSearch, statementPeriodFilter, statementYearFilter]) {
    control.addEventListener("input", renderStatements);
    control.addEventListener("change", renderStatements);
  }

  for (const control of [directiveSearch, directiveSeriesFilter, directivePeriodFilter]) {
    control.addEventListener("input", renderDirectives);
    control.addEventListener("change", renderDirectives);
  }

  for (const control of [peopleSearch, peoplePeriodFilter, peopleRoleFilter]) {
    control.addEventListener("input", renderPeople);
    control.addEventListener("change", renderPeople);
  }

  clearLeadFilters.addEventListener("click", () => {
    leadSearch.value = "";
    periodFilter.value = "";
    institutionFilter.value = "";
    renderLeads();
    leadSearch.focus();
  });

  clearRecordFilters.addEventListener("click", () => {
    recordSearch.value = "";
    recordPeriodFilter.value = "";
    recordPriorityFilter.value = "";
    recordSourceFilter.value = "";
    renderRecords();
    recordSearch.focus();
  });

  clearStatementFilters.addEventListener("click", () => {
    statementSearch.value = "";
    statementPeriodFilter.value = "";
    statementYearFilter.value = "";
    renderStatements();
    statementSearch.focus();
  });

  clearDirectiveFilters.addEventListener("click", () => {
    directiveSearch.value = "";
    directiveSeriesFilter.value = "";
    directivePeriodFilter.value = "";
    renderDirectives();
    directiveSearch.focus();
  });

  clearPeopleFilters.addEventListener("click", () => {
    peopleSearch.value = "";
    peoplePeriodFilter.value = "";
    peopleRoleFilter.value = "";
    renderPeople();
    peopleSearch.focus();
  });

  exportRecords.addEventListener("click", () => {
    exportCsv("clinton-foundations-records.csv", filteredRecords(), [
      { label: "title", value: (row) => row.title },
      { label: "period", value: (row) => periodTitleForValue(row.date) },
      { label: "priority", value: (row) => row.priority },
      { label: "date", value: (row) => row.date },
      { label: "identifier", value: (row) => row.identifier },
      { label: "source", value: (row) => row.sourceRepository },
      { label: "url", value: (row) => row.sourceUrl },
      { label: "summary", value: (row) => row.summary },
      { label: "source_note", value: (row) => row.sourceNote },
      { label: "risk", value: (row) => row.risk }
    ]);
  });

  exportStatements.addEventListener("click", () => {
    exportCsv("clinton-foundations-statements.csv", filteredStatements(), [
      { label: "title", value: (row) => row.title },
      { label: "period", value: (row) => periodTitleForValue(row.date) },
      { label: "date", value: (row) => row.date },
      { label: "source", value: (row) => row.sourceRepository },
      { label: "identifier", value: (row) => row.identifier },
      { label: "url", value: (row) => row.url },
      { label: "note", value: (row) => row.note }
    ]);
  });

  exportPeople.addEventListener("click", () => {
    exportCsv("clinton-foundations-persons.csv", filteredPeople(), [
      { label: "name", value: (row) => row.name },
      { label: "role", value: (row) => row.role },
      { label: "period", value: (row) => periodTitleForValue(row.years) },
      { label: "years", value: (row) => row.years },
      { label: "source", value: (row) => row.source },
      { label: "note", value: (row) => row.note }
    ]);
  });
}

setStats();
populateFilters();
renderDocumentChronology();
renderChronology();
renderLibraryPulls();
renderDailyDiaryReferences();
renderDocumentTypes();
renderLeads();
renderRecords();
renderStatements();
renderDirectives();
renderPeople();
renderMilestones();
renderGaps();
bindEvents();
