import fs from "node:fs";
import path from "node:path";

const REPORTS_DIR = "reports";
const OUT_JSON = path.join(REPORTS_DIR, "reagan-subseries-source-note-master-list.json");
const OUT_MD = path.join(REPORTS_DIR, "reagan-subseries-source-note-master-list.md");

const SOURCE_NOTE_ORDER = [
  "Source:",
  "Repository or originating agency.",
  "Record group, office, collection, series, file unit, lot, OA/ID, box, folder, or document number.",
  "Classification and handling markings.",
  "Document status: sent for action, sent for information, draft, final, original, copy, declassified, or no classification marking when verified.",
  "Drafting, clearance, distribution, signature, routing, stamped notations, marginalia, annotations, or read-by evidence.",
  "Meeting location, Daily Diary corroboration, attachment status, or related-document cross-reference when needed."
];

const FAMILY_DEFINITIONS = [
  {
    id: "reagan-library-staff-subject-directorate",
    label: "Reagan Library staff, subject, and directorate files",
    rawFamilies: [
      "Reagan Library - Staff/Subject/Directorate Files",
      "Reagan Library - Staff/Subject Files"
    ],
    citation: "Source: Reagan Library, National Security Council, [staff member, subject file, or directorate] Files, [series], [folder title]. [Classification; handling]. [Drafting, routing, annotation, read-by, meeting-location, or attachment note.]",
    use: "Use for NSC staff member files, directorate files, subject files, and related Reagan Library staff/office control copies.",
    cautions: [
      "Do not collapse the staff member, directorate, or subject-file path into a generic Reagan Library citation.",
      "Keep verified no-classification, read-by, marginalia, and attachment facts in the final note."
    ]
  },
  {
    id: "reagan-library-nsc-institutional-executive-secretariat",
    label: "Reagan Library NSC institutional and Executive Secretariat files",
    rawFamilies: [
      "Reagan Library - NSC Institutional/Executive Secretariat Files",
      "NSC Institutional/Executive Secretariat Files"
    ],
    citation: "Source: Reagan Library, Executive Secretariat, NSC: [Agency/Cable/Subject/Meeting/NSDD/NSPG/System II/System IV series]: Records, [box, folder, document number, or directive title]. [Classification; handling]. [Distribution, approval, signature, attachment, or covering-memorandum note.]",
    alternateCitation: "Source: National Security Council, National Security Council Institutional Files, Box [number], [file title]. [Classification; handling]. [Distribution, covering-memorandum, signature, or presidential-approval note.]",
    use: "Use for Executive Secretariat, NSDD, NSPG, NSC meeting, agency, cable, subject, and Washington-held institutional control copies.",
    cautions: [
      "If the published document is a memorandum transmitting an attached directive, cite the control copy and state the attachment relationship.",
      "Use the National Security Council institutional form only when the source path is Washington-held NSC institutional files rather than Reagan Library holdings."
    ]
  },
  {
    id: "department-state-lot-executive-office",
    label: "Department of State lot, Executive Secretariat, and office files",
    rawFamilies: [
      "Department of State - Lot/Executive Secretariat/Office Files",
      "Department of State - Lot/Executive Secretariat Files"
    ],
    citation: "Source: Department of State, [office or Executive Secretariat], [records series], Lot [number], [collection title], [folder title]. [Classification; handling]. [Drafting, clearance, meeting-location, copy, or cross-reference note.]",
    use: "Use for Baker, Shultz, S/S, S/S-IRM, S/P, Under Secretary, Counselor, bureau, and office lot-file control copies.",
    cautions: [
      "Do not mix lot-file prose with Central Foreign Policy File document-number citations.",
      "Preserve lot number, office, collection title, and folder title when the metadata supplies them."
    ]
  },
  {
    id: "department-state-central-foreign-policy-file",
    label: "Department of State Central Foreign Policy File",
    rawFamilies: ["Department of State - Central Foreign Policy File"],
    citation: "Source: Department of State, Central Foreign Policy File, [Electronic Telegrams/D Reels/N Reels/P Reels], [telegram or document identifier]. [Classification; handling; precedence]. [Drafting, clearance, repeat-addressee, or related-file note.]",
    use: "Use for telegrams, airgrams, memoranda, and other central-file records where the CFPF reel, electronic telegram, or document identifier is the source control.",
    cautions: [
      "For telegrams, retain telegram numbers, precedence, repeated addressees, and special designators when present.",
      "Do not replace a CFPF identifier with a URL, NARA catalog result, or broad State Department label."
    ]
  },
  {
    id: "reagan-library-shultz-hoover-private-copies",
    label: "Reagan Library Shultz, Hoover, and private-copy files",
    rawFamilies: [
      "Reagan Library - Shultz/Hoover/Private Copies",
      "Reagan Library - Shultz/Hoover Copies"
    ],
    citation: "Source: Reagan Library, George P. Shultz Papers, [series], [folder title/date]. [Classification; handling]. [Copy, marginalia, meeting-folder notation, Daily Diary, or no-minutes note.]",
    alternateCitation: "Source: Hoover Institution, George P. Shultz Papers, [series], [box], [folder title/date]. [Classification; handling]. [Copy, marginalia, meeting-folder notation, Daily Diary, or no-minutes note.]",
    use: "Use for Shultz papers, Hoover copies, and private control copies when they provide the documentary base.",
    cautions: [
      "Name the repository actually used: Reagan Library copy or Hoover Institution copy.",
      "Keep marginalia, underlining, checkmarks, no-minutes statements, and Daily Diary corroboration explicit when they carry source value."
    ]
  },
  {
    id: "defense-agency-records",
    label: "Defense, OSD, WNRC, JCS, CIA, and agency records",
    rawFamilies: ["DOD/OSD/WNRC/JCS/Agency Records"],
    citation: "Source: National Archives, RG [number], Records of [agency or office], [series/accession], Box [number], [folder title]. [Classification; handling]. [Drafting, clearance, distribution, or routing note.]",
    use: "Use for Defense Department, OSD, WNRC, JCS, CIA, NIC, DCI, DDI, and other federal-agency holdings when those records are the control copy.",
    cautions: [
      "Replace the agency placeholder with the exact record group and office path before publication.",
      "Do not cite an agency family as National Archives unless the source path actually resolves there."
    ]
  },
  {
    id: "library-congress-private-papers",
    label: "Library of Congress and private papers",
    rawFamilies: ["Library of Congress/Private Papers"],
    citation: "Source: Library of Congress, Manuscript Division, [person] Papers, [office or series], Box [number], [folder title/date]. [Classification; handling]. [Read-by stamp, handwritten note, highlighting, underlining, checkmark, or copy note.]",
    use: "Use for Haig, Donald Regan, Paul Nitze, Weinberger, or other private papers when they provide the source copy.",
    cautions: [
      "Record marginalia exactly enough to show documentary significance.",
      "Do not convert original underlining, highlighting, or checkmarks into editorial emphasis without saying what the source shows."
    ]
  },
  {
    id: "reagan-library-profs",
    label: "Reagan Library PROFS electronic messages",
    rawFamilies: [
      "Reagan Library - PROFS",
      "Reagan Library - PROFS/Electronic Messages"
    ],
    citation: "Source: Reagan Library, PROFS System of White House Electronic Messages, [account, sender/recipient file, or folder], [message title or date]. [Classification; handling]. [Sender, recipient, copy, routing, or printout note.]",
    use: "Use for PROFS System White House electronic-message records.",
    cautions: [
      "Keep the electronic-message system name; do not rewrite PROFS as a generic staff file.",
      "Preserve sender, recipient, copy, and printout evidence when visible."
    ]
  },
  {
    id: "reagan-library-system-iv",
    label: "Reagan Library System IV Intelligence Files",
    rawFamilies: ["Reagan Library - System IV Intelligence Files"],
    citation: "Source: Reagan Library, System IV Intelligence Files, [series, document number, or file title], [date]. [Classification; handling]. [Distribution, intelligence-source, release-status, or copy note.]",
    use: "Use for System IV intelligence-file records.",
    cautions: [
      "Keep System IV as a distinct source family rather than folding it into general NSC files.",
      "Preserve intelligence distribution and release-status evidence when the source supplies it."
    ]
  },
  {
    id: "reagan-library-daily-diary",
    label: "Reagan Library President's Daily Diary and schedule",
    rawFamilies: ["Reagan Library - President's Daily Diary/Schedule"],
    citation: "Source: Reagan Library, President's Daily Diary, [date]. [Meeting or call time, place, participants, and duration].",
    use: "Use as a source note only when the diary or schedule entry itself is the selected record; otherwise cite it in annotation as corroboration for time, place, participants, or no-minutes checks.",
    cautions: [
      "Do not use the Daily Diary as a substitute for substantive minutes or memoranda when those exist.",
      "Keep diary facts separate from the archival source note for the substantive policy document."
    ]
  },
  {
    id: "public-printed-source",
    label: "Public or printed source",
    rawFamilies: ["Public/Printed Source"],
    citation: "Source: [publishing agency or publication title], [date], pp. [pages]. No classification marking. [Reason this published text is used, if needed.]",
    use: "Use public or printed sources as the document source only when no better archival control copy can be located or when the public text itself is the policy act.",
    cautions: [
      "More often, public sources belong in annotation rather than as the first-footnote source note.",
      "Do not omit page numbers for printed sources."
    ]
  },
  {
    id: "reagan-library-white-house-staff-office",
    label: "Reagan Library White House staff and office files",
    rawFamilies: ["Reagan Library - White House Staff/Office Files"],
    citation: "Source: Reagan Library, White House [office or staff member] Files, [series], [folder title]. [Classification or no classification marking]. [Draft, letterhead, venue, audience, time, handwritten notation, routing, or copy note.]",
    use: "Use for White House staff, office, speechwriting, research, WHORM, vertical, transition, or similar White House office files.",
    cautions: [
      "Preserve the exact office or staff-file path and folder title.",
      "For speech, campaign, or transition material, preserve letterhead, venue, delivery time, and campaign/transition context when supplied."
    ]
  },
  {
    id: "reagan-library-nsc-staff-files",
    label: "Reagan Library NSC staff files",
    rawFamilies: ["Reagan Library - NSC Staff Files"],
    citation: "Source: Reagan Library, [NSC staff member] Files, [series], [folder title]. [Classification; handling]. [Drafting, routing, annotation, read-by, meeting-location, or attachment note.]",
    use: "Use for named NSC staff files when the metadata distinguishes them from broader subject or directorate files.",
    cautions: [
      "Name the staff member and series; do not reduce the path to a generic NSC file.",
      "Keep visible annotations, initials, and read-by stamps in compact source-note prose."
    ]
  },
  {
    id: "reagan-library-w-files",
    label: "Reagan Library W Files",
    rawFamilies: ["Reagan Library - W Files"],
    citation: "Source: Reagan Library, W Files, [series or file], [folder or document title]. [Classification; handling]. [Presidential decision, approval, routing, annotation, or copy note.]",
    use: "Use for W Files and related high-level White House decision records.",
    cautions: [
      "Keep W Files distinct from PROFS, System IV, and general Executive Secretariat records.",
      "Preserve presidential approval, decision, and routing evidence when present."
    ]
  },
  {
    id: "economic-assistance-agency-records",
    label: "Economic, assistance, and specialized agency records",
    rawFamilies: ["Economic/Assistance Agency Records"],
    citation: "Source: National Archives, RG [number], Records of [agency], [office or series], [accession], Box [number], [folder title]. [Classification; handling]. [Drafting, clearance, routing, or attachment note.]",
    use: "Use for Treasury, AID, Commerce, USTR, USIA, or other economic/assistance agency files when those agencies provide the source copy.",
    cautions: [
      "Identify the precise agency and record group before publication.",
      "Do not use this broad family label in a final note."
    ]
  },
  {
    id: "foreign-international-organization-records",
    label: "Foreign government and international organization records",
    rawFamilies: ["Foreign/International Organization Records"],
    citation: "Source: [foreign ministry, government archive, or international organization], [collection], [series], [file identifier]. [Classification, handling, or release status if present]. [Language, translation, copy, or distribution note.]",
    use: "Use for foreign government, NATO, United Nations, IMF/World Bank, or other international organization sources.",
    cautions: [
      "Preserve language, translation, and copy-status evidence.",
      "Do not recast a foreign or international source as a U.S. repository citation."
    ]
  },
  {
    id: "other-presidential-records",
    label: "Carter, Bush, transition, or other presidential records",
    rawFamilies: [
      "Bush/Carter/Other Presidential Records",
      "Bush Transition/Bush Records"
    ],
    citation: "Source: [Presidential Library], [presidential records collection], [office or staff files], [series], [folder title]. [Classification; handling]. [Routing, annotation, initials, meeting, or transition-context note.]",
    use: "Use for Carter, Bush Vice Presidential, Bush transition, or other presidential-library records that appear inside Reagan-era source trails.",
    cautions: [
      "Do not cite pre-January 20, 1989 Bush Vice Presidential or transition material as Bush Presidential Records.",
      "Preserve the exact library, collection, office, staff-file path, and OA/ID or box/folder control when available."
    ]
  },
  {
    id: "other-archival-source",
    label: "Other archival source",
    rawFamilies: ["Other archival source"],
    citation: "Source: [repository], [record group or collection], [office or series], [box, folder, document number, or file identifier]. [Classification; handling]. [Drafting, routing, release-status, copy, or annotation note.]",
    use: "Use only after resolving the metadata to a specific repository and collection path.",
    cautions: [
      "This is a temporary normalization lane, not final copy.",
      "Promote to a specific source family whenever the repository and collection can be identified."
    ]
  },
  {
    id: "no-source-note",
    label: "No source note found / editorial-note cases",
    rawFamilies: ["No source note found"],
    citation: null,
    use: "Use no Source note when the published unit is an editorial note, appendix marker, or another apparatus item without a first-footnote source note.",
    cautions: [
      "Do not manufacture a Source note for an editorial note that intentionally has none.",
      "If the unit is actually a document, route it to source-note repair rather than leaving it in this family."
    ]
  }
];

const V38_SOURCE_LIST_ADDITIONS = [
  {
    id: "v38-state-economic-business-lot-files",
    label: "Volume XXXVIII State economic and business affairs lot files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Department of State Lot Files",
      "Lot 84D247; Lot 85D193; Lot 86D76; Lot 86D112; Lot 87D73; Lot 88D345; Lot 93D490"
    ],
    supplements: "Department of State lot, Executive Secretariat, and office files",
    citation: "Source: Department of State, Bureau of Economic and Business Affairs, [office or records series], Lot [number], [collection title], [folder title]. [Classification; handling]. [Drafting, clearance, routing, attachment, or meeting note.]",
    use: "Use for EB commodity, investment policy, international finance and development, planning, UNCTAD, and economic/agricultural affairs files named on the Volume XXXVIII Sources page."
  },
  {
    id: "v38-state-executive-secretariat-economic-lot-files",
    label: "Volume XXXVIII State Executive Secretariat and E lot files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Department of State Lot Files",
      "Lot 83D288; Lot 85D308; Lot 87D327; Lot 88D99; Lot 89D139; Lot 89D149; Lot 89D154; Lot 89D155; Lot 89D156; Lot 89D378; Lot 92D630; Lot 95D334; Lot 96D262"
    ],
    supplements: "Department of State lot, Executive Secretariat, and office files",
    citation: "Source: Department of State, [Executive Secretariat, S/S-I/S/S/S/P/D records, E records, or Under Secretary for Economic Affairs files], Lot [number], [collection title], [folder title]. [Classification; handling]. [Drafting, clearance, sent-for-action, routing, copy, or cross-reference note.]",
    use: "Use for Haig, Dam, Whitehead, Policy Planning Staff, Allen Wallis, special caption, Deputy Secretary, and special handling restriction files cited by Volume XXXVIII."
  },
  {
    id: "v38-nara-rg56-treasury-secretary",
    label: "NARA RG 56 Treasury Office of the Secretary records",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, National Archives and Records Administration, RG 56",
      "Records of the Office of the Secretary of the Treasury"
    ],
    supplements: "Economic, assistance, and specialized agency records",
    citation: "Source: National Archives, RG 56, Records of the Department of the Treasury, Records of the Office of the Secretary of the Treasury, [series], Box [number], [folder title]. [Classification; handling]. [Drafting, clearance, routing, attachment, or copy note.]",
    use: "Use for Secretary of the Treasury congressional correspondence, correspondence, executive secretariat official files, official files, and subject files."
  },
  {
    id: "v38-nara-rg56-treasury-monetary-affairs",
    label: "NARA RG 56 Treasury Under Secretary for Monetary Affairs records",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, National Archives and Records Administration, RG 56",
      "Records of the Office of the Under Secretary for Monetary Affairs"
    ],
    supplements: "Economic, assistance, and specialized agency records",
    citation: "Source: National Archives, RG 56, Records of the Department of the Treasury, Records of the Office of the Under Secretary for Monetary Affairs, [series], Box [number], [folder title]. [Classification; handling]. [Drafting, clearance, routing, meeting, working group, trip, summit, or currency-talk note.]",
    use: "Use for subject files relating to meetings, working groups, trips, summits, and currency talks."
  },
  {
    id: "v38-nara-rg59-state-buckley-haig",
    label: "NARA RG 59 State Buckley and Haig files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, National Archives and Records Administration, RG 59",
      "Lot 82D352; Lot 82D370"
    ],
    supplements: "Department of State lot, Executive Secretariat, and office files",
    citation: "Source: National Archives, RG 59, General Records of the Department of State, [office or person files], Lot [number], [collection title], [folder title]. [Classification; handling]. [Drafting, clearance, routing, annotation, or copy note.]",
    use: "Use for James L. Buckley Office of the Under Secretary for Security Assistance, Science and Technology files and Alexander M. Haig, Jr. files transferred under RG 59."
  },
  {
    id: "v38-reagan-library-nsc-summit-institutional-files",
    label: "Volume XXXVIII Reagan Library Executive Secretariat NSC files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Reagan Library",
      "Executive Secretariat NSC Agency File, Meeting File, NSDD File, Subject File, and Trip File"
    ],
    supplements: "Reagan Library NSC institutional and Executive Secretariat files",
    citation: "Source: Reagan Library, Executive Secretariat, NSC: [Agency File/Meeting File/NSDD File/Subject File/Trip File], [box or folder title]. [Classification; handling]. [Distribution, presidential approval, meeting, summit, attachment, or covering-memorandum note.]",
    use: "Use for Cancun, G-7 economic summit, NSDD, NSC meeting, agency, and subject control copies identified on the Volume XXXVIII Sources page."
  },
  {
    id: "v38-reagan-library-cabinet-affairs-ccea",
    label: "Reagan Library Cabinet Affairs and CCEA records",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Reagan Library",
      "Files of the Office of Cabinet Affairs; Ralph Bledsoe Files"
    ],
    supplements: "Reagan Library White House staff and office files",
    citation: "Source: Reagan Library, White House Staff and Office Files, [Office of Cabinet Affairs or Ralph Bledsoe Files], [series], [folder title]. [Classification; handling]. [Cabinet council meeting, CCEA minutes, attendance, routing, or attachment note.]",
    use: "Use for Cabinet Council on Economic Affairs minutes and related cabinet council records."
  },
  {
    id: "v38-reagan-library-economic-staff-files",
    label: "Volume XXXVIII Reagan Library economic-policy staff files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Reagan Library",
      "Norman Bailey Files; Stephen Danzansky Files; Douglas McMinn Files; Roger Robinson Files; David Wigg Files; and related named staff files"
    ],
    supplements: "Reagan Library staff, subject, and directorate files",
    citation: "Source: Reagan Library, White House Staff and Office Files, [staff member] Files, [series], [folder title]. [Classification; handling]. [Drafting, routing, annotation, read-by, meeting, attachment, or copy note.]",
    use: "Use for named White House and NSC economic-policy staff files cited by Volume XXXVIII, especially International Economic Affairs Directorate material."
  },
  {
    id: "v38-reagan-library-whorm-commodities",
    label: "Reagan Library WHORM Commodities subject file",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Reagan Library",
      "White House Office of Records Management, Subject File, Commodities (CM)"
    ],
    supplements: "Reagan Library White House staff and office files",
    citation: "Source: Reagan Library, White House Office of Records Management, Subject File, Commodities (CM), [case file or folder title]. [Classification or no classification marking]. [Routing, annotation, attachment, or copy note.]",
    use: "Use when the WHORM Commodities subject file is the source copy rather than a staff-file duplicate."
  },
  {
    id: "v38-cia-history-nic-dci-files",
    label: "CIA History Staff, NIC, and DCI files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Central Intelligence Agency",
      "History Staff Files; National Intelligence Council Job 85-01156R; Office of the Director of Central Intelligence Job 84B00049R"
    ],
    supplements: "Defense, OSD, WNRC, JCS, CIA, and agency records",
    citation: "Source: Central Intelligence Agency, [History Staff Files/National Intelligence Council/Office of the Director of Central Intelligence], [job number and series], [box or folder title]. [Classification; handling]. [Intelligence distribution, drafting, coordination, release-status, or copy note.]",
    use: "Use for CIA perspectives and international-debt intelligence records cited by Volume XXXVIII."
  },
  {
    id: "v38-library-congress-haig-department-state-files",
    label: "Library of Congress Haig Department of State Files",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Library of Congress",
      "Papers of Alexander M. Haig, Jr., Department of State Files"
    ],
    supplements: "Library of Congress and private papers",
    citation: "Source: Library of Congress, Manuscript Division, Papers of Alexander M. Haig, Jr., Department of State Files, Box [number], [folder title]. [Classification; handling]. [Read-by stamp, handwritten notation, highlighting, underlining, checkmark, or copy note.]",
    use: "Use for Haig private-paper copies housed at the Library of Congress."
  },
  {
    id: "v38-princeton-mudd-baker-papers",
    label: "Princeton Mudd Manuscript Library James A. Baker III Papers",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Princeton University",
      "Mudd Manuscript Library, Department of Special Collections, James A. Baker III Papers"
    ],
    supplements: "Other archival source",
    citation: "Source: Princeton University, Mudd Manuscript Library, Department of Special Collections, James A. Baker III Papers, [series], Box [number], [folder title]. [Classification; handling]. [Copy, annotation, routing, meeting, or attachment note.]",
    use: "Use when the Baker Papers provide the source copy for economic, debt, or assistance records."
  },
  {
    id: "v38-wnrc-rg56-treasury-executive-secretariat",
    label: "WNRC RG 56 Treasury Executive Secretariat records",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Washington National Records Center, RG 56",
      "Records of the Executive Secretariat; Congressional Files, 1987; Secretaries Miller, Regan, and Baker Files"
    ],
    supplements: "Economic, assistance, and specialized agency records",
    citation: "Source: Washington National Records Center, RG 56, Records of the Department of the Treasury, Records of the Executive Secretariat, [series], Box [number], [folder title]. [Classification; handling]. [Drafting, clearance, congressional, routing, or copy note.]",
    use: "Use for WNRC Treasury Executive Secretariat records, including 1987 congressional files and Secretaries Miller, Regan, and Baker files."
  },
  {
    id: "v38-wnrc-rg56-treasury-international-affairs",
    label: "WNRC RG 56 Treasury International Affairs records",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Washington National Records Center, RG 56",
      "Records of the Office of the Assistant Secretary for International Affairs; Meeting and Policy Files; Under Secretary for International Affairs (Mulford) Subject Files"
    ],
    supplements: "Economic, assistance, and specialized agency records",
    citation: "Source: Washington National Records Center, RG 56, Records of the Department of the Treasury, Records of [Assistant Secretary or Under Secretary] for International Affairs, [series], Box [number], [folder title]. [Classification; handling]. [Meeting, policy, drafting, clearance, routing, or copy note.]",
    use: "Use for Treasury international affairs, meeting and policy, and Mulford subject files cited by Volume XXXVIII."
  },
  {
    id: "v38-published-periodicals",
    label: "Volume XXXVIII published periodicals and newspapers",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Published Sources",
      "Commentary Magazine; Foreign Affairs; New York Times; Washington Post"
    ],
    supplements: "Public or printed source",
    citation: "Source: [Commentary Magazine/Foreign Affairs/New York Times/Washington Post], [date], pp. [pages]. No classification marking. [Reason this published text is used, if needed.]",
    use: "Use only when the published item itself is the document source; otherwise cite in annotation."
  },
  {
    id: "v38-published-government-imf-sources",
    label: "Volume XXXVIII published government and IMF sources",
    basis: [
      "FRUS 1981-1988, Volume XXXVIII, Sources, Published Sources",
      "International Monetary Fund Annual Report 1987; Department of State Bulletin; Public Papers of Jimmy Carter and Ronald Reagan"
    ],
    supplements: "Public or printed source",
    citation: "Source: [International Monetary Fund/Department of State/National Archives and Records Administration], [publication title], [year or date], pp. [pages]. No classification marking. [Reason this published text is used, if needed.]",
    use: "Use for IMF annual report, Department of State Bulletin, and Public Papers source copies when no archival control copy is used or when the published text is the policy act."
  }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadDocuments() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => /^frus1981-88v.*annotation-corpus\.json$/.test(file))
    .sort();

  return files.flatMap((file) => {
    const data = readJson(path.join(REPORTS_DIR, file));
    const volumeId = file.replace("-annotation-corpus.json", "");
    const documents = Array.isArray(data.documents) ? data.documents : Array.isArray(data) ? data : [];
    return documents.map((document) => ({
      ...document,
      volume_id: document.volume_id || volumeId,
      source_family: document.source_family || "No source family recorded"
    }));
  });
}

function buildRawFamilyIndex(documents) {
  const index = new Map();
  for (const document of documents) {
    const family = document.source_family;
    if (!index.has(family)) {
      index.set(family, {
        rawFamily: family,
        count: 0,
        byVolume: {},
        sampleDocuments: []
      });
    }
    const row = index.get(family);
    row.count += 1;
    row.byVolume[document.volume_id] = (row.byVolume[document.volume_id] || 0) + 1;
    if (row.sampleDocuments.length < 5 && document.url) {
      row.sampleDocuments.push({
        volume_id: document.volume_id,
        doc_no: document.doc_no ?? document.doc_id ?? null,
        doc_type: document.doc_type || null,
        url: document.url
      });
    }
  }
  return index;
}

function buildMasterList(documents) {
  const rawIndex = buildRawFamilyIndex(documents);
  const coveredRawFamilies = new Set();

  const rows = FAMILY_DEFINITIONS.map((definition) => {
    const rawFamilies = definition.rawFamilies.map((rawFamily) => rawIndex.get(rawFamily)).filter(Boolean);
    definition.rawFamilies.forEach((rawFamily) => coveredRawFamilies.add(rawFamily));
    const count = rawFamilies.reduce((sum, row) => sum + row.count, 0);
    const byVolume = {};
    const sampleDocuments = [];
    for (const rawFamily of rawFamilies) {
      for (const [volume, volumeCount] of Object.entries(rawFamily.byVolume)) {
        byVolume[volume] = (byVolume[volume] || 0) + volumeCount;
      }
      sampleDocuments.push(...rawFamily.sampleDocuments);
    }

    return {
      id: definition.id,
      label: definition.label,
      document_count: count,
      source_note_status: definition.citation ? "citation-pattern" : "not-a-source-note",
      frus_style_citation: definition.citation,
      alternate_citation: definition.alternateCitation || null,
      use: definition.use,
      cautions: definition.cautions,
      raw_families: definition.rawFamilies.filter((rawFamily) => rawIndex.has(rawFamily)),
      by_volume: Object.fromEntries(Object.entries(byVolume).sort(([a], [b]) => a.localeCompare(b))),
      sample_documents: sampleDocuments.slice(0, 5)
    };
  });

  const uncategorized = [...rawIndex.keys()].filter((rawFamily) => !coveredRawFamilies.has(rawFamily));
  if (uncategorized.length) {
    rows.push({
      id: "uncategorized-source-family",
      label: "Uncategorized source family",
      document_count: uncategorized.reduce((sum, rawFamily) => sum + rawIndex.get(rawFamily).count, 0),
      source_note_status: "needs-taxonomy",
      frus_style_citation: "Source: [repository], [collection], [series], [box/folder or document identifier]. [Classification; handling]. [Document-specific provenance note.]",
      alternate_citation: null,
      use: "Temporary row for source-family labels not yet mapped by the generator.",
      cautions: ["Map each raw family before using this row as final source-note guidance."],
      raw_families: uncategorized,
      by_volume: {},
      sample_documents: []
    });
  }

  return rows
    .sort((a, b) => b.document_count - a.document_count || a.label.localeCompare(b.label))
    .map((row, index) => ({ rank: index + 1, ...row }));
}

function volumeCoverage(byVolume) {
  const entries = Object.entries(byVolume || {}).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return "None in current metadata.";
  return entries.map(([volume, count]) => `${volume}: ${count}`).join("; ");
}

function markdownFor(report) {
  const lines = [];
  lines.push("# Reagan Subseries Source Note Master List");
  lines.push("");
  lines.push(`Generated: ${report.generated_at}`);
  lines.push("");
  lines.push("Scope: available `reports/frus1981-88v*-annotation-corpus.json` metadata in this workspace, supplemented by the published Sources page for FRUS 1981-1988, Volume XXXVIII. The annotation corpora provide source-family metadata and counts, not verbatim first-footnote source-note text. The citation lines below are normalized FRUS-style patterns keyed to those metadata families, the local Reagan/Bush style-guide order, and Volume XXXVIII source-list paths.");
  lines.push("");
  lines.push("## FRUS Source Note Order");
  lines.push("");
  for (const [index, item] of SOURCE_NOTE_ORDER.entries()) {
    lines.push(`${index + 1}. ${item}`);
  }
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Documents covered: ${report.document_count}`);
  lines.push(`- Volumes covered: ${report.volumes.join(", ")}`);
  lines.push(`- Master source-family rows: ${report.master_list.length}`);
  lines.push(`- Raw source-family labels: ${report.raw_source_families.length}`);
  lines.push(`- Volume XXXVIII source-list additions: ${report.source_list_additions.length}`);
  lines.push("");
  lines.push("| Rank | Master source family | Documents | Raw metadata families | FRUS-style citation |");
  lines.push("| ---: | --- | ---: | --- | --- |");
  for (const row of report.master_list) {
    const citation = row.frus_style_citation ? `\`${row.frus_style_citation}\`` : "_No Source note; do not manufacture one._";
    lines.push(`| ${row.rank} | ${row.label} | ${row.document_count} | ${row.raw_families.join("<br>") || "None"} | ${citation} |`);
  }
  lines.push("");
  lines.push("## Volume XXXVIII Source-List Additions");
  lines.push("");
  lines.push("These rows incorporate specific source paths named on the published Volume XXXVIII Sources page that the metadata otherwise collapses into broad families such as `Economic/Assistance Agency Records`, `Other archival source`, `Public/Printed Source`, or general Reagan Library and Department of State rows. They are source-list authority rows, not additional document-count rows.");
  lines.push("");
  lines.push("| Source path | Supplements master row | FRUS-style citation |");
  lines.push("| --- | --- | --- |");
  for (const row of report.source_list_additions) {
    lines.push(`| ${row.label} | ${row.supplements} | \`${row.citation}\` |`);
  }
  lines.push("");
  for (const row of report.source_list_additions) {
    lines.push(`### ${row.label}`);
    lines.push("");
    lines.push(`- ID: \`${row.id}\``);
    lines.push(`- Supplements master row: ${row.supplements}`);
    lines.push("- Volume source-list basis:");
    for (const basis of row.basis) lines.push(`  - ${basis}`);
    lines.push("");
    lines.push("```text");
    lines.push(row.citation);
    lines.push("```");
    lines.push("");
    lines.push(`Use: ${row.use}`);
    lines.push("");
  }
  lines.push("## Detailed Master List");
  lines.push("");
  for (const row of report.master_list) {
    lines.push(`### ${row.label}`);
    lines.push("");
    lines.push(`- ID: \`${row.id}\``);
    lines.push(`- Documents in current metadata: ${row.document_count}`);
    lines.push(`- Source-note status: ${row.source_note_status}`);
    lines.push(`- Raw metadata families: ${row.raw_families.length ? row.raw_families.map((item) => `\`${item}\``).join(", ") : "None"}`);
    lines.push(`- Volume coverage: ${volumeCoverage(row.by_volume)}`);
    lines.push("");
    if (row.frus_style_citation) {
      lines.push("```text");
      lines.push(row.frus_style_citation);
      lines.push("```");
    } else {
      lines.push("_No Source note pattern. Use this row to flag editorial-note or apparatus units where the published metadata correctly contains no first-footnote source note._");
    }
    if (row.alternate_citation) {
      lines.push("");
      lines.push("Alternate supported form:");
      lines.push("");
      lines.push("```text");
      lines.push(row.alternate_citation);
      lines.push("```");
    }
    lines.push("");
    lines.push(`Use: ${row.use}`);
    lines.push("");
    lines.push("Cautions:");
    for (const caution of row.cautions) lines.push(`- ${caution}`);
    if (row.sample_documents.length) {
      lines.push("");
      lines.push("Sample metadata rows:");
      for (const sample of row.sample_documents) {
        lines.push(`- ${sample.volume_id} document ${sample.doc_no ?? "unknown"} (${sample.doc_type || "type not recorded"}): ${sample.url}`);
      }
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

const documents = loadDocuments();
const masterList = buildMasterList(documents);
const rawIndex = buildRawFamilyIndex(documents);
const report = {
  schema_version: "1.0",
  generated_at: new Date().toISOString(),
  source_metadata: fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => /^frus1981-88v.*annotation-corpus\.json$/.test(file))
    .sort()
    .map((file) => path.join(REPORTS_DIR, file)),
  style_basis: [
    "reports/frus-reagan-bush-style-guide.md",
    "reports/frus-subseries-style-basis-registry.current.json"
  ],
  document_count: documents.length,
  volumes: [...new Set(documents.map((document) => document.volume_id))].sort(),
  raw_source_families: [...rawIndex.values()].sort((a, b) => b.count - a.count || a.rawFamily.localeCompare(b.rawFamily)),
  master_list: masterList,
  source_list_authorities: [
    "https://history.state.gov/historicaldocuments/frus1981-88v38/sources"
  ],
  source_list_additions: V38_SOURCE_LIST_ADDITIONS
};

fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(OUT_MD, markdownFor(report));

console.log(`Wrote ${OUT_JSON}`);
console.log(`Wrote ${OUT_MD}`);
console.log(`Documents covered: ${report.document_count}`);
console.log(`Master rows: ${report.master_list.length}`);
console.log(`Volume XXXVIII source-list additions: ${report.source_list_additions.length}`);
