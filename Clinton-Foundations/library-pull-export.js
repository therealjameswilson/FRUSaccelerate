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

const requestPacketFields = [
  "rank",
  "repository_group",
  "request_type",
  "request_text",
  "identifiers",
  "capture_fields",
  "why_it_matters",
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

function repositoryGroup(row) {
  const source = row.repository_or_source || "";
  if (/Clinton (Presidential )?Library|2013-0185-M/i.test(source)) return "Clinton Presidential Library";
  if (/National Archives|NARA|NAID/i.test(source) || /NAID/i.test(row.identifier || "")) return "National Archives Catalog";
  if (/Archived White House|Public Papers|Library of Congress|GlobalSecurity|White House/i.test(source)) return "Published/Public Text";
  if (/NSC|Speechwriting|Records Management|Executive Secretary/i.test(source)) return "NSC and White House files";
  return source || "Repository to verify";
}

function captureFields(row) {
  if (/Directive/.test(row.action_group)) return "Exact title; date; classification marking; copy/version status; distribution; source packet path; release status.";
  if (/Reading-room/.test(row.action_group)) return "OA/ID; box; folder title; document date; sender/recipient; markings; version/copy status; restriction/release status.";
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Diary date; event/call/meeting time; participants; paired memcon/telcon/briefing/speech record; citation for both records.";
  if (/Draft trail/.test(row.action_group)) return "Delivered text; earliest draft; marked-up draft; clearance comments; policy memo; final/press version; diary/event control.";
  return "Repository; collection/office; series/file unit; box/folder; document date; markings; copy status; release status.";
}

function requestText(row) {
  if (/Directive/.test(row.action_group)) {
    const title = row.title.replace(new RegExp(`^${row.identifier}:\\s*`), "");
    return `Request the released text and source packet for ${row.identifier}: ${title}. Capture all markings, distribution, copy/version status, and packet provenance.`;
  }
  if (/Reading-room/.test(row.action_group)) return `Request or stage the ${row.identifier} pull cluster for ${row.title}. Use the onsite move to sample title pages, routing slips, and the first substantive document before broad review.`;
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return `Use ${row.identifier} as a schedule-control lead for ${row.title}; locate the paired call, meeting, briefing, speech draft, or Public Papers record before promotion.`;
  if (/Draft trail/.test(row.action_group)) return `Pair the public text ${row.title} with drafts, clearance comments, policy memoranda, and diary/event controls before treating it as a document candidate.`;
  return `Verify item-level provenance for ${row.title} before promotion: ${row.next_pull}`;
}

function requestPacketRows() {
  return verificationQueueRows().map((row) => ({
    rank: row.rank,
    repository_group: repositoryGroup(row),
    request_type: row.action_group,
    request_text: requestText(row),
    identifiers: row.identifier,
    capture_fields: captureFields(row),
    why_it_matters: row.why_now,
    source_note_target: row.source_note_target,
    url: row.url
  }));
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

function downloadRequestPacketCsv() {
  const rows = requestPacketRows();
  const lines = [
    requestPacketFields.join(","),
    ...rows.map((row) => requestPacketFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-request-packets.csv";
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

function makeRequestCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.rank}. ${row.repository_group}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.request_type;
  header.append(title, badge);

  const request = document.createElement("p");
  request.textContent = row.request_text;
  const fields = document.createElement("p");
  fields.className = "risk-note";
  fields.textContent = `Capture: ${row.capture_fields}`;
  const ids = document.createElement("p");
  ids.className = "gap-pull-list";
  ids.textContent = `IDs: ${row.identifiers}`;

  card.append(header, request, fields, ids);
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

  const requestSummary = document.createElement("p");
  requestSummary.id = "request-packet-summary";
  requestSummary.className = "result-summary";

  const requestButton = document.createElement("button");
  requestButton.id = "export-request-packets";
  requestButton.type = "button";
  requestButton.textContent = "Export Request Packets CSV";
  requestButton.addEventListener("click", downloadRequestPacketCsv);

  const rows = sourceNoteAuditRows();
  const queueRows = verificationQueueRows();
  const requestRows = requestPacketRows();
  const sections = new Set(rows.map((row) => row.section)).size;
  const repositories = new Set(requestRows.map((row) => row.repository_group)).size;
  summary.textContent = `${rows.length} source-note audit rows across ${sections} compiler evidence groups`;
  queueSummary.textContent = `${queueRows.length} verification tasks sorted by source-note readiness risk`;
  requestSummary.textContent = `${requestRows.length} request packets across ${repositories} repository groups`;
  button.disabled = rows.length === 0;
  queueButton.disabled = queueRows.length === 0;
  requestButton.disabled = requestRows.length === 0;

  actions.append(summary, button, queueSummary, queueButton, requestSummary, requestButton);
  const queuePreview = document.createElement("div");
  queuePreview.className = "gap-list";
  queuePreview.setAttribute("aria-label", "Top source-note verification tasks");
  queuePreview.append(...queueRows.slice(0, 6).map(makeQueueCard));

  const requestPreview = document.createElement("div");
  requestPreview.className = "gap-list";
  requestPreview.setAttribute("aria-label", "Top repository request packets");
  requestPreview.append(...requestRows.slice(0, 4).map(makeRequestCard));

  if (sectionNote) {
    sectionNote.insertAdjacentElement("afterend", actions);
    actions.insertAdjacentElement("afterend", queuePreview);
    queuePreview.insertAdjacentElement("afterend", requestPreview);
  } else {
    gapsSection.append(actions, queuePreview, requestPreview);
  }
}

if (libraryPullRoot && libraryPullSummary && exportLibraryPullsButton) {
  exportLibraryPullsButton.addEventListener("click", downloadLibraryPullCsv);
  new MutationObserver(updateLibraryPullSummary).observe(libraryPullRoot, { childList: true });
  updateLibraryPullSummary();
}

installSourceNoteAuditPanel();
