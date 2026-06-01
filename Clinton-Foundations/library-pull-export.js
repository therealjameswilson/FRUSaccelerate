const libraryPullRoot = document.querySelector("#library-root");
const libraryPullSummary = document.querySelector("#library-pull-summary");
const exportLibraryPullsButton = document.querySelector("#export-library-pulls");
document.querySelector(".library-actions")?.classList.add("chronology-actions");

const libraryPullFields = [
  "rank",
  "oaid",
  "cluster",
  "priority",
  "source",
  "folder_targets",
  "why_it_earns_time",
  "reading_room_move"
];

const sourceNoteAuditFields = [
  "section",
  "date",
  "title",
  "priority_or_status",
  "repository_or_source",
  "identifier",
  "frus_use",
  "source_note_target",
  "verification_needed",
  "next_pull",
  "url"
];

function libraryTextOf(root, selector) {
  return root.querySelector(selector)?.textContent.trim() || "";
}

function stripPrefix(value, prefixPattern) {
  return value.replace(prefixPattern, "").trim();
}

function parseLibraryPullRows() {
  return [...document.querySelectorAll(".library-card")].flatMap((card) => {
    const label = libraryTextOf(card, ".record-type");
    const [priority = "", source = ""] = label.split("/").map((part) => part.trim());
    const oaids = stripPrefix(libraryTextOf(card, ".library-oaids"), /^OA\/ID pull list:\s*/i)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const baseRow = {
      rank: libraryTextOf(card, ".library-card-header > strong"),
      cluster: libraryTextOf(card, "h3"),
      priority,
      source,
      folder_targets: stripPrefix(libraryTextOf(card, "p:not(.record-type):not(.library-oaids):not(.risk-note):not(.library-onsite)"), /^Folder targets:\s*/i),
      why_it_earns_time: stripPrefix(libraryTextOf(card, ".risk-note"), /^Why it earns time:\s*/i),
      reading_room_move: stripPrefix(libraryTextOf(card, ".library-onsite"), /^Reading-room move:\s*/i)
    };

    return oaids.map((oaid) => ({ ...baseRow, oaid }));
  });
}

function updateLibraryPullSummary() {
  const rows = parseLibraryPullRows();
  const clusters = new Set(rows.map((row) => row.cluster)).size;
  libraryPullSummary.textContent = `${rows.length} OA/ID requests across ${clusters} prioritized pull clusters`;
  exportLibraryPullsButton.disabled = rows.length === 0;
}

function libraryCsvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadLibraryPullCsv() {
  const rows = parseLibraryPullRows();
  const lines = [
    libraryPullFields.join(","),
    ...rows.map((row) => libraryPullFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-library-pull-sheet.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function dataList(value) {
  return Array.isArray(value) ? value : [];
}

function sourceNoteAuditRows() {
  const chronologyItems = dataList(typeof documentChronology === "undefined" ? [] : documentChronology);
  const recordItems = dataList(typeof records === "undefined" ? [] : records);
  const diaryItems = dataList(typeof dailyDiaryReferences === "undefined" ? [] : dailyDiaryReferences);
  const directiveItems = dataList(typeof directives === "undefined" ? [] : directives);
  const statementItems = dataList(typeof statements === "undefined" ? [] : statements);
  const pullItems = dataList(typeof libraryPulls === "undefined" ? [] : libraryPulls);

  return [
    ...chronologyItems.map((item) => ({
      section: "Chronology control",
      date: item.date,
      title: item.title,
      priority_or_status: item.status,
      repository_or_source: item.source,
      identifier: item.type,
      frus_use: item.summary,
      source_note_target: item.sourceNote,
      verification_needed: /diary/i.test(item.type)
        ? "Pair schedule control with substantive call, meeting, speech, or briefing record before promotion."
        : "Verify source packet, classification marking, copy/version status, and release status before final selection.",
      next_pull: item.nextPull,
      url: item.url
    })),
    ...recordItems.map((item) => ({
      section: "Candidate record",
      date: item.date,
      title: item.title,
      priority_or_status: item.priority,
      repository_or_source: item.sourceRepository,
      identifier: item.identifier,
      frus_use: item.summary,
      source_note_target: item.sourceNote,
      verification_needed: item.risk,
      next_pull: item.risk,
      url: item.sourceUrl
    })),
    ...diaryItems.map((item) => ({
      section: "Daily Diary chronology control",
      date: item.date,
      title: item.title,
      priority_or_status: "Chronology control",
      repository_or_source: "National Archives Catalog",
      identifier: `NAID ${item.naid}`,
      frus_use: item.volumeUse,
      source_note_target: `Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, ${item.catalogTitle}, NAID ${item.naid}. Schedule-control entry; match against substantive records before promotion.`,
      verification_needed:
        "Needs a paired call transcript, memorandum of conversation, meeting paper, speech draft, briefing book, or Public Papers text.",
      next_pull: item.followUp,
      url: item.url
    })),
    ...directiveItems.map((item) => ({
      section: "PRD/PDD directive anchor",
      date: item.date,
      title: `${item.code}: ${item.title}`,
      priority_or_status: item.priority,
      repository_or_source: "Clinton Presidential Library",
      identifier: item.code,
      frus_use: item.use,
      source_note_target: `Source: Clinton Presidential Library, Presidential Directives, ${item.code}, ${item.title}, ${item.date}. Public directive index; released text, classification marking, copy status, and source packet to be verified.`,
      verification_needed: "Pull directive source packet and record exact title, date, markings, distribution/copy status, and release status.",
      next_pull: `Locate ${item.code} source packet in NSC Records Management, Executive Secretary, or responsible office files.`,
      url: item.url
    })),
    ...statementItems.map((item) => ({
      section: "Public doctrine anchor",
      date: item.date,
      title: item.title,
      priority_or_status: "Public anchor",
      repository_or_source: item.sourceRepository,
      identifier: item.identifier,
      frus_use: item.note,
      source_note_target: `Source: ${item.sourceRepository}, ${item.title}, ${item.date}, ${item.identifier}. Published public text; pair with drafting, clearance, policy, or diary records before final FRUS selection.`,
      verification_needed: "Match public text to speechwriting drafts, clearance comments, policy memoranda, or diary/event controls.",
      next_pull: "Search NSC Speechwriting, Press/Communications, Public Papers, and relevant staff files.",
      url: item.url
    })),
    ...pullItems.map((item) => ({
      section: "Clinton Library pull cluster",
      date: "1993-2000",
      title: item.title,
      priority_or_status: item.priority,
      repository_or_source: `Clinton Library 2013-0185-M / ${item.source}`,
      identifier: `OA/ID ${item.oaids.join("; ")}`,
      frus_use: item.why,
      source_note_target: `Source locator: Clinton Presidential Library, 2013-0185-M finding-aid folder intelligence, ${item.source}, ${item.folders}. Exact box, folder, document date, classification marking, copy/version status, and release status to be supplied from reading-room pull.`,
      verification_needed: "Promote only after item-level folder review supplies a FRUS-ready source note.",
      next_pull: item.onsite,
      url: "https://www.clintonlibrary.gov/research"
    }))
  ];
}

function downloadSourceNoteAuditCsv() {
  const rows = sourceNoteAuditRows();
  const lines = [
    sourceNoteAuditFields.join(","),
    ...rows.map((row) => sourceNoteAuditFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-source-note-audit.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function installSourceNoteAuditPanel() {
  const gapsSection = document.querySelector("#gaps");
  const sectionNote = gapsSection?.querySelector(".section-note");
  if (!gapsSection || document.querySelector("#export-source-note-audit")) return;

  const actions = document.createElement("div");
  actions.className = "chronology-actions";
  actions.setAttribute("aria-label", "Source note audit actions");

  const summary = document.createElement("p");
  summary.id = "source-note-audit-summary";
  summary.className = "result-summary";

  const button = document.createElement("button");
  button.id = "export-source-note-audit";
  button.type = "button";
  button.textContent = "Export Source-Note Audit CSV";
  button.addEventListener("click", downloadSourceNoteAuditCsv);

  const rows = sourceNoteAuditRows();
  const sections = new Set(rows.map((row) => row.section)).size;
  summary.textContent = `${rows.length} source-note audit rows across ${sections} compiler evidence groups`;
  button.disabled = rows.length === 0;

  actions.append(summary, button);
  if (sectionNote) {
    sectionNote.insertAdjacentElement("afterend", actions);
  } else {
    gapsSection.append(actions);
  }
}

if (libraryPullRoot && libraryPullSummary && exportLibraryPullsButton) {
  exportLibraryPullsButton.addEventListener("click", downloadLibraryPullCsv);
  new MutationObserver(updateLibraryPullSummary).observe(libraryPullRoot, { childList: true });
  updateLibraryPullSummary();
}

installSourceNoteAuditPanel();
