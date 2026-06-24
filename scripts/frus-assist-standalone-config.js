const PAGES = [
  {
    slug: "org-man-89-92",
    period: "1989-1992",
    volumeLabel: "Volume II",
    status: "Research",
    title: "Organization and Management of Foreign Policy",
    description: "State Department organization, management, public diplomacy, immigration, refugees, and policy-process source leads.",
    officialVolumes: ["frus1989-92v02"]
  },
  {
    slug: "89-92-RussiaFSU-Policy",
    period: "1989-1992",
    volumeLabel: "Volume IV",
    status: "Research",
    title: "Soviet Union, Russia, and Post-Soviet States: Policy",
    description: "Policy-volume companion to the high-level-contact record, with boundary control against Volume III summit materials.",
    officialVolumes: ["frus1989-92v04"]
  },
  {
    slug: "GCT-89-92",
    period: "1989-1992",
    volumeLabel: "Volume VI",
    status: "Research",
    title: "Eastern Mediterranean",
    description: "Greece, Cyprus, Turkey, Aegean, and regional Eastern Mediterranean research assistant.",
    officialVolumes: ["frus1989-92v06"]
  },
  {
    slug: "Bush41-Western-Europe",
    period: "1989-1992",
    volumeLabel: "Volume VIII",
    status: "Research",
    title: "Western Europe",
    description: "Bush-era Western Europe memcons, telcons, country lanes, Germany boundary control, and source-note checks.",
    officialVolumes: ["frus1989-92v08"]
  },
  {
    slug: "Bush41-SouthAsia",
    period: "1989-1992",
    volumeLabel: "Volume XV",
    status: "Research",
    title: "South Asia",
    description: "Chronology-first South Asia desk with quickstart handoff, page-boundary queue, OCR extraction notes, and gap packets.",
    officialVolumes: ["frus1989-92v15"]
  },
  {
    slug: "NorthAfrica-89-92",
    period: "1989-1992",
    volumeLabel: "Volume XX",
    status: "Research",
    title: "North Africa; Sub-Saharan Africa",
    description: "Volume XX assist page with boundary rows for Southern Africa and Somalia, document packets, persons candidates, and annotation leads.",
    officialVolumes: ["frus1989-92v20"]
  },
  {
    slug: "Bush41-LatAm",
    period: "1989-1992",
    volumeLabel: "Volume XXV",
    status: "Research",
    title: "South America",
    description: "Latin America and South America memcon/telcon desk with source-note audit, persons authority, and country-year coverage controls.",
    officialVolumes: ["frus1989-92v25"]
  },
  {
    slug: "Bush41-drugs-thugs",
    period: "1989-1992",
    volumeLabel: "Volume XXVIII",
    status: "Planned",
    title: "Counternarcotics; Counterterrorism",
    description: "Source files, selection queue, action lane, and source-note drafts for drugs, terrorism, and related transnational-security files.",
    officialVolumes: ["frus1989-92v28"]
  },
  {
    slug: "global-issues-89-92",
    period: "1989-1992",
    volumeLabel: "Volume XXIX",
    status: "Planned",
    title: "Global Issues",
    description: "Global Issues assistant with chronology, coverage matrix, ranked next actions, source packets, source-note audit, and release ledger.",
    officialVolumes: ["frus1989-92v29"]
  },
  {
    slug: "Clinton-Foundations",
    period: "1993-2000",
    volumeLabel: "Volume I",
    status: "Research",
    title: "Foundations of Foreign Policy",
    description: "Clinton foundations source map, source-lead exports, library pull workflow, and strategy-document lanes.",
    officialVolumes: ["frus1993-00v01"]
  },
  {
    slug: "Clinton-armscontrol-93-96",
    period: "1993-2000",
    volumeLabel: "Volume VII",
    status: "Planned",
    title: "Arms Control and Nonproliferation, 1993-1996",
    description: "Released-records-first arms-control desk with source packets and source maps for the first Clinton arms-control volume.",
    officialVolumes: ["frus1993-00v07"]
  },
  {
    slug: "armscontrol-97-2000",
    period: "1993-2000",
    volumeLabel: "Volume VIII",
    status: "Planned",
    title: "Arms Control and Nonproliferation, 1997-2000",
    description: "Continuation desk for post-1996 arms control, with chapter packets, closeout board, stage gates, and first-pass action queues.",
    officialVolumes: ["frus1993-00v08"]
  },
  {
    slug: "Balkans-93-95",
    period: "1993-2000",
    volumeLabel: "Volume XV",
    status: "Research",
    title: "Wars in the Balkans, 1993-1995",
    description: "Balkans compiler workspace for chronological review, BTF markings, search playbooks, and archival source pulls.",
    officialVolumes: ["frus1993-00v15"]
  },
  {
    slug: "Clinton-NATO-European-Security",
    period: "1993-2000",
    volumeLabel: "Volume XVII",
    status: "Planned",
    title: "North Atlantic Treaty Organization; European Security",
    description: "NATO and European security file desk with workbooks, promotion queues, source-note audits, and production workflow controls.",
    officialVolumes: ["frus1993-00v17"]
  },
  {
    slug: "Clinton-Russia-High-Level",
    period: "1993-2000",
    volumeLabel: "Volume XVIII",
    status: "Planned",
    title: "Russia: High-Level Contacts",
    description: "Clinton-Yeltsin chronology desk with draft selection spine, day-one next actions, reading packet, Strobe context, and hard-gap follow-up.",
    officialVolumes: ["frus1993-00v18"]
  },
  {
    slug: "Clinton-Europe",
    period: "1993-2000",
    volumeLabel: "Volumes XXII-XXIV",
    status: "Research/Planned",
    title: "Europe: High-Level Contacts; Europe: Policy, 1993-1996; Europe: Policy, 1997-2000",
    description: "Clinton Europe assister spanning high-level contacts and two Europe policy volumes, with saved work packs and source routing.",
    officialVolumes: ["frus1993-00v22", "frus1993-00v23", "frus1993-00v24"]
  },
  {
    slug: "Clinton-South-and-Southern-Africa",
    period: "1993-2000",
    volumeLabel: "Volume XXVII",
    status: "Research",
    title: "South Africa; Southern Africa",
    description: "Released and declassified records for South Africa and Southern Africa, with source-note and declassification quality gates.",
    officialVolumes: ["frus1993-00v27"]
  },
  {
    slug: "Clinton-CentralAmerica",
    period: "1993-2000",
    volumeLabel: "Volume XXXII",
    status: "Research",
    title: "Central America",
    description: "Central America compiler workspace with cross-volume boundary control, document assembly worksheets, and call-slip batches.",
    officialVolumes: ["frus1993-00v32"]
  },
  {
    slug: "PRC-PostColdWar",
    period: "1989-2001",
    volumeLabel: "Volumes XVII/XLI/XLII",
    status: "Research",
    title: "China; China, 1993-1996; China, 1997-2000",
    description: "Post-Cold War PRC source desk for Bush Volume XVII and Clinton Volumes XLI-XLII, from Tiananmen through WTO accession.",
    officialVolumes: ["frus1989-92v17", "frus1993-00v41", "frus1993-00v42"]
  }
];

const OFFICIAL_VOLUMES = {
  "frus1989-92v02": { period: "1989-1992", volumeLabel: "Volume II", title: "Organization and Management of Foreign Policy" },
  "frus1989-92v04": { period: "1989-1992", volumeLabel: "Volume IV", title: "Soviet Union, Russia, and Post-Soviet States: Policy" },
  "frus1989-92v06": { period: "1989-1992", volumeLabel: "Volume VI", title: "Eastern Mediterranean" },
  "frus1989-92v08": { period: "1989-1992", volumeLabel: "Volume VIII", title: "Western Europe" },
  "frus1989-92v15": { period: "1989-1992", volumeLabel: "Volume XV", title: "South Asia" },
  "frus1989-92v17": { period: "1989-1992", volumeLabel: "Volume XVII", title: "China" },
  "frus1989-92v20": { period: "1989-1992", volumeLabel: "Volume XX", title: "North Africa; Sub-Saharan Africa" },
  "frus1989-92v25": { period: "1989-1992", volumeLabel: "Volume XXV", title: "South America" },
  "frus1989-92v28": { period: "1989-1992", volumeLabel: "Volume XXVIII", title: "Counternarcotics; Counterterrorism" },
  "frus1989-92v29": { period: "1989-1992", volumeLabel: "Volume XXIX", title: "Global Issues" },
  "frus1993-00v01": { period: "1993-2000", volumeLabel: "Volume I", title: "Foundations of Foreign Policy" },
  "frus1993-00v07": { period: "1993-2000", volumeLabel: "Volume VII", title: "Arms Control and Nonproliferation, 1993-1996" },
  "frus1993-00v08": { period: "1993-2000", volumeLabel: "Volume VIII", title: "Arms Control and Nonproliferation, 1997-2000" },
  "frus1993-00v15": { period: "1993-2000", volumeLabel: "Volume XV", title: "Wars in the Balkans, 1993-1995" },
  "frus1993-00v17": { period: "1993-2000", volumeLabel: "Volume XVII", title: "North Atlantic Treaty Organization; European Security" },
  "frus1993-00v18": { period: "1993-2000", volumeLabel: "Volume XVIII", title: "Russia: High-Level Contacts" },
  "frus1993-00v22": { period: "1993-2000", volumeLabel: "Volume XXII", title: "Europe: High-Level Contacts" },
  "frus1993-00v23": { period: "1993-2000", volumeLabel: "Volume XXIII", title: "Europe: Policy, 1993-1996" },
  "frus1993-00v24": { period: "1993-2000", volumeLabel: "Volume XXIV", title: "Europe: Policy, 1997-2000" },
  "frus1993-00v27": { period: "1993-2000", volumeLabel: "Volume XXVII", title: "South Africa; Southern Africa" },
  "frus1993-00v32": { period: "1993-2000", volumeLabel: "Volume XXXII", title: "Central America" },
  "frus1993-00v41": { period: "1993-2000", volumeLabel: "Volume XLI", title: "China, 1993-1996" },
  "frus1993-00v42": { period: "1993-2000", volumeLabel: "Volume XLII", title: "China, 1997-2000" }
};

const OMITTED_PAGES = [
  {
    slug: "EE-89-92",
    title: "Eastern Europe; Yugoslavia",
    reason: "Omitted from Compiler Assist by user request."
  },
  {
    slug: "FEP-85-88",
    title: "Trade; Monetary Policy; Industrialized Country Cooperation",
    reason: "Omitted from Compiler Assist by user request."
  }
];

module.exports = {
  OFFICIAL_VOLUMES,
  OMITTED_PAGES,
  PAGES
};
