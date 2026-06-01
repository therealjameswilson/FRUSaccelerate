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

const verificationQueueFields = [
  "rank",
  "action_group",
  "date",
  "title",
  "priority_or_status",
  "repository_or_source",
  "identifier",
  "why_now",
  "verification_needed",
  "next_pull",
  "source_note_target",
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

function verificationAction(row) {
  if (/PRD\/PDD/.test(row.section)) return "Directive source packet";
  if (/Library pull/.test(row.section)) return "Reading-room pull";
  if (/Daily Diary/.test(row.section)) return "Substantive pairing";
  if (/Public doctrine/.test(row.section)) return "Draft trail pairing";
  if (/Candidate record/.test(row.section)) return "Item-level source note";
  if (/diary/i.test(row.identifier)) return "Chronology pairing";
  return "Source-note verification";
}

function verificationScore(row) {
  const priorityScore = {
    Critical: 0,
    High: 1,
    Anchor: 1,
    "Chronology control": 2,
    "Public anchor": 3,
    Medium: 4,
    Review: 5
  }[row.priority_or_status] ?? 4;
  const sectionScore = {
    "PRD/PDD directive anchor": 0,
    "Candidate record": 1,
    "Clinton Library pull cluster": 1,
    "Chronology control": 2,
    "Daily Diary chronology control": 3,
    "Public doctrine anchor": 4
  }[row.section] ?? 5;
  return priorityScore * 10 + sectionScore;
}

function verificationWhy(row) {
  const action = verificationAction(row);
  if (action === "Directive source packet") return "Directive titles are high-value locators but need release status, markings, copy status, and packet provenance before source-note promotion.";
  if (action === "Reading-room pull") return "Finding-aid intelligence must become item-level box, folder, date, marking, and release-status evidence before it can support final selection.";
  if (action === "Substantive pairing") return "Daily Diary controls date the event but need paired call, meeting, briefing, speech, or Public Papers evidence.";
  if (action === "Draft trail pairing") return "Public doctrine anchors need drafts, clearance comments, policy memoranda, or diary controls before becoming document candidates.";
  if (action === "Item-level source note") return "Candidate records need document-level provenance and a promotion decision before entering the final chronology.";
  return "Chronology controls need source-note reconciliation before the compiler relies on them.";
}

function verificationQueueRows() {
  return sourceNoteAuditRows()
    .map((row) => ({
      action_group: verificationAction(row),
      date: row.date,
      title: row.title,
      priority_or_status: row.priority_or_status,
      repository_or_source: row.repository_or_source,
      identifier: row.identifier,
      why_now: verificationWhy(row),
      verification_needed: row.verification_needed,
      next_pull: row.next_pull,
      source_note_target: row.source_note_target,
      url: row.url,
      score: verificationScore(row)
    }))
    .sort((a, b) => a.score - b.score || String(a.date).localeCompare(String(b.date)) || a.title.localeCompare(b.title))
    .map((row, index) => {
      const { score, ...rest } = row;
      return { rank: index + 1, ...rest };
    });
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

function downloadVerificationQueueCsv() {
  const rows = verificationQueueRows();
  const lines = [
    verificationQueueFields.join(","),
    ...rows.map((row) => verificationQueueFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-verification-queue.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function makeQueueCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.rank}. ${row.title}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.action_group;
  header.append(title, badge);

  const why = document.createElement("p");
  why.textContent = `Why now: ${row.why_now}`;
  const verify = document.createElement("p");
  verify.textContent = `Verify: ${row.verification_needed}`;
  const next = document.createElement("p");
  next.className = "risk-note";
  next.textContent = `Next pull: ${row.next_pull}`;
  const pullList = document.createElement("p");
  pullList.className = "gap-pull-list";
  pullList.textContent = [row.priority_or_status, row.repository_or_source, row.identifier, row.date].filter(Boolean).join(" / ");

  card.append(header, why, verify, next, pullList);
  return card;
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

  const queueSummary = document.createElement("p");
  queueSummary.id = "verification-queue-summary";
  queueSummary.className = "result-summary";

  const queueButton = document.createElement("button");
  queueButton.id = "export-verification-queue";
  queueButton.type = "button";
  queueButton.textContent = "Export Verification Queue CSV";
  queueButton.addEventListener("click", downloadVerificationQueueCsv);

  const rows = sourceNoteAuditRows();
  const queueRows = verificationQueueRows();
  const sections = new Set(rows.map((row) => row.section)).size;
  summary.textContent = `${rows.length} source-note audit rows across ${sections} compiler evidence groups`;
  queueSummary.textContent = `${queueRows.length} verification tasks sorted by source-note readiness risk`;
  button.disabled = rows.length === 0;
  queueButton.disabled = queueRows.length === 0;

  actions.append(summary, button, queueSummary, queueButton);
  const queuePreview = document.createElement("div");
  queuePreview.className = "gap-list";
  queuePreview.setAttribute("aria-label", "Top source-note verification tasks");
  queuePreview.append(...queueRows.slice(0, 6).map(makeQueueCard));

  if (sectionNote) {
    sectionNote.insertAdjacentElement("afterend", actions);
    actions.insertAdjacentElement("afterend", queuePreview);
  } else {
    gapsSection.append(actions, queuePreview);
  }
}

if (libraryPullRoot && libraryPullSummary && exportLibraryPullsButton) {
  exportLibraryPullsButton.addEventListener("click", downloadLibraryPullCsv);
  new MutationObserver(updateLibraryPullSummary).observe(libraryPullRoot, { childList: true });
  updateLibraryPullSummary();
}

installSourceNoteAuditPanel();
