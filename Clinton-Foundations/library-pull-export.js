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

const onsiteAgendaFields = [
  "sequence",
  "onsite_phase",
  "cluster",
  "priority",
  "source",
  "oaids",
  "folder_targets",
  "first_move",
  "capture_fields",
  "promotion_test",
  "stop_rule"
];

const callSlipQueueFields = [
  "call_slip_rank",
  "onsite_phase",
  "oaid",
  "cluster",
  "priority",
  "source",
  "folder_targets",
  "call_slip_request",
  "capture_checklist",
  "promotion_test",
  "stop_rule"
];

const dailyDiaryFields = [
  "sequence",
  "date",
  "title",
  "type",
  "naid",
  "catalog_title",
  "event_entry",
  "volume_use",
  "follow_up",
  "promotion_rule",
  "source_note_target",
  "url",
  "tags"
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

const sourceNoteIntakeFields = [
  "intake_rank",
  "action_group",
  "date",
  "title",
  "priority_or_status",
  "repository_or_source",
  "identifier",
  "required_capture_fields",
  "provisional_source_note",
  "verification_needed",
  "next_pull",
  "collection_or_office",
  "series_or_file_unit",
  "box",
  "folder",
  "document_title",
  "document_date",
  "sender_recipient",
  "classification_marking",
  "copy_version_status",
  "release_status",
  "paired_record",
  "promotion_decision",
  "final_source_note",
  "follow_up",
  "url"
];

const selectionDecisionFields = [
  "decision_rank",
  "date",
  "title",
  "action_group",
  "priority_or_status",
  "repository_or_source",
  "identifier",
  "recommended_treatment",
  "selection_gate",
  "paired_evidence_needed",
  "source_note_status",
  "volume_boundary",
  "editorial_note_use",
  "provisional_source_note",
  "final_decision",
  "compiler_note",
  "url"
];

const handoffRegisterFields = [
  "handoff_rank",
  "date",
  "title",
  "action_group",
  "priority_or_status",
  "repository_or_source",
  "identifier",
  "likely_destination",
  "why_handoff",
  "keep_in_volume_i",
  "volume_i_citation_use",
  "source_note_status",
  "next_action",
  "final_owner",
  "status",
  "url"
];

const accessTrackerFields = [
  "access_rank",
  "action_group",
  "repository_group",
  "date",
  "title",
  "identifier",
  "access_path",
  "release_question",
  "classification_or_restriction_to_capture",
  "source_note_blocker",
  "needed_before_selection",
  "next_pull",
  "owner",
  "status",
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

const requestBatchFields = [
  "batch_rank",
  "repository_group",
  "request_type",
  "request_count",
  "rank_range",
  "identifiers",
  "batch_request",
  "capture_fields",
  "source_note_targets",
  "urls"
];

const correspondenceDraftFields = [
  "draft_rank",
  "repository_group",
  "request_type",
  "subject",
  "recipient_hint",
  "message_body",
  "identifiers",
  "capture_fields",
  "source_note_targets",
  "urls"
];

const sourceNoteTemplateFields = [
  "template_id",
  "evidence_type",
  "use_when",
  "source_note_pattern",
  "required_fields",
  "do_not_promote_until",
  "paired_record_target",
  "example_source"
];

const compilerRunbookFields = [
  "sequence",
  "compiler_move",
  "page_section",
  "export_button",
  "output_file",
  "use_for",
  "decision_supported",
  "stop_condition"
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

function onsitePhase(rank) {
  const value = Number.parseInt(rank, 10);
  if (value === 1) return "Day 1 AM - directive spine";
  if (value === 2) return "Day 1 PM - speech draft trail";
  if (value >= 3 && value <= 5) return "Day 2 - doctrine and decision context";
  if (value >= 6 && value <= 7) return "Day 3 - late-term and cross-cutting frame";
  return "As-needed support pull";
}

function onsiteCaptureFields(title) {
  if (/Directive/i.test(title)) return "Title page; directive text; classification marking; distribution; copy/version status; PRS/RMS routing; release status.";
  if (/Speechwriting/i.test(title)) return "Folder title page; earliest draft; marked-up draft; final/press version; clearance comments; drafter/principal edits.";
  if (/Senior Principal/i.test(title)) return "Meeting notes; PC/DC notes; call sheets; staff meeting records; presidential or national security advisor routing.";
  if (/Press|Backgrounders|Communications/i.test(title)) return "Backgrounder text; press guidance; rollout memo; communications plan; link to speech/directive/meeting file.";
  return "Folder title page; first substantive memo; briefing tabs; routing slips; decision memo; date/sender/recipient/markings.";
}

function onsiteStopRule(title) {
  if (/Press|Backgrounders|Communications/i.test(title)) return "Stop if the file only repeats public text and cannot be tied to a promoted speech, directive, or meeting record.";
  if (/NATO|European/i.test(title)) return "Stop once the file turns into country implementation detail better assigned to Europe/NATO volumes.";
  if (/Global Economy|Trade/i.test(title)) return "Stop when the file becomes routine trade implementation rather than broad doctrine or strategy framing.";
  if (/Transnational/i.test(title)) return "Stop if operational counterterrorism, cyber, or crime implementation overwhelms foundational policy framing.";
  return "Stop after enough samples establish whether the cluster carries item-level source-note value for Volume I.";
}

function onsiteAgendaRows() {
  return dataList(typeof libraryPulls === "undefined" ? [] : libraryPulls).map((pull) => ({
    sequence: pull.rank,
    onsite_phase: onsitePhase(pull.rank),
    cluster: pull.title,
    priority: pull.priority,
    source: pull.source,
    oaids: pull.oaids.join("; "),
    folder_targets: pull.folders,
    first_move: pull.onsite,
    capture_fields: onsiteCaptureFields(pull.title),
    promotion_test: pull.why,
    stop_rule: onsiteStopRule(pull.title)
  }));
}

function callSlipQueueRows() {
  return dataList(typeof libraryPulls === "undefined" ? [] : libraryPulls).flatMap((pull) =>
    dataList(pull.oaids).map((oaid, index) => ({
      call_slip_rank: `${String(Number.parseInt(pull.rank, 10)).padStart(2, "0")}.${String(index + 1).padStart(2, "0")}`,
      onsite_phase: onsitePhase(pull.rank),
      oaid,
      cluster: pull.title,
      priority: pull.priority,
      source: pull.source,
      folder_targets: pull.folders,
      call_slip_request: `Request OA/ID ${oaid} for ${pull.title}. Folder targets: ${pull.folders}. First move: ${pull.onsite}`,
      capture_checklist: onsiteCaptureFields(pull.title),
      promotion_test: pull.why,
      stop_rule: onsiteStopRule(pull.title)
    }))
  );
}

function downloadOnsiteAgendaCsv() {
  const rows = onsiteAgendaRows();
  const lines = [
    onsiteAgendaFields.join(","),
    ...rows.map((row) => onsiteAgendaFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-library-onsite-agenda.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCallSlipQueueCsv() {
  const rows = callSlipQueueRows();
  const lines = [
    callSlipQueueFields.join(","),
    ...rows.map((row) => callSlipQueueFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-library-call-slip-queue.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function makeOnsiteAgendaCard(row) {
  const card = document.createElement("article");
  card.className = "library-card";

  const header = document.createElement("div");
  header.className = "library-card-header";
  const rank = document.createElement("strong");
  rank.textContent = row.sequence;
  const phase = document.createElement("span");
  phase.className = "chip";
  phase.textContent = row.onsite_phase;
  header.append(rank, phase);

  const title = document.createElement("h3");
  title.textContent = row.cluster;
  const firstMove = document.createElement("p");
  firstMove.className = "library-onsite";
  firstMove.textContent = `First move: ${row.first_move}`;
  const capture = document.createElement("p");
  capture.className = "risk-note";
  capture.textContent = `Capture: ${row.capture_fields}`;
  const stop = document.createElement("p");
  stop.className = "gap-pull-list";
  stop.textContent = `Stop rule: ${row.stop_rule}`;

  card.append(header, title, firstMove, capture, stop);
  return card;
}

function makeCallSlipQueueCard(row) {
  const card = document.createElement("article");
  card.className = "library-card";

  const header = document.createElement("div");
  header.className = "library-card-header";
  const rank = document.createElement("strong");
  rank.textContent = row.call_slip_rank;
  const phase = document.createElement("span");
  phase.className = "chip";
  phase.textContent = row.oaid;
  header.append(rank, phase);

  const title = document.createElement("h3");
  title.textContent = row.cluster;
  const request = document.createElement("p");
  request.className = "library-onsite";
  request.textContent = row.call_slip_request;
  const capture = document.createElement("p");
  capture.className = "risk-note";
  capture.textContent = `Capture: ${row.capture_checklist}`;
  const stop = document.createElement("p");
  stop.className = "gap-pull-list";
  stop.textContent = `Stop rule: ${row.stop_rule}`;

  card.append(header, title, request, capture, stop);
  return card;
}

function installOnsiteAgendaPanel() {
  const librarySection = document.querySelector("#library");
  const libraryActions = document.querySelector(".library-actions");
  if (!librarySection || !libraryActions || document.querySelector("#export-onsite-agenda")) return;

  const rows = onsiteAgendaRows();
  const callSlipRows = callSlipQueueRows();
  const phases = new Set(rows.map((row) => row.onsite_phase)).size;
  const clusters = new Set(callSlipRows.map((row) => row.cluster)).size;

  const callSlipSummary = document.createElement("p");
  callSlipSummary.id = "call-slip-queue-summary";
  callSlipSummary.className = "result-summary";
  callSlipSummary.textContent = `${callSlipRows.length} call-slip rows across ${clusters} pull clusters`;

  const callSlipButton = document.createElement("button");
  callSlipButton.id = "export-call-slip-queue";
  callSlipButton.type = "button";
  callSlipButton.textContent = "Export Call-Slip Queue CSV";
  callSlipButton.disabled = callSlipRows.length === 0;
  callSlipButton.addEventListener("click", downloadCallSlipQueueCsv);

  const summary = document.createElement("p");
  summary.id = "onsite-agenda-summary";
  summary.className = "result-summary";
  summary.textContent = `${rows.length} onsite agenda clusters across ${phases} work phases`;

  const button = document.createElement("button");
  button.id = "export-onsite-agenda";
  button.type = "button";
  button.textContent = "Export Onsite Agenda CSV";
  button.disabled = rows.length === 0;
  button.addEventListener("click", downloadOnsiteAgendaCsv);

  libraryActions.append(callSlipSummary, callSlipButton, summary, button);

  const callSlipPreview = document.createElement("div");
  callSlipPreview.className = "library-grid";
  callSlipPreview.setAttribute("aria-label", "Clinton Library call-slip queue preview");
  callSlipPreview.append(...callSlipRows.slice(0, 4).map(makeCallSlipQueueCard));

  const preview = document.createElement("div");
  preview.className = "library-grid";
  preview.setAttribute("aria-label", "Clinton Library onsite agenda preview");
  preview.append(...rows.slice(0, 4).map(makeOnsiteAgendaCard));
  libraryActions.insertAdjacentElement("afterend", callSlipPreview);
  callSlipPreview.insertAdjacentElement("afterend", preview);
}

function dailyDiaryRows() {
  const diaryItems = dataList(typeof dailyDiaryReferences === "undefined" ? [] : dailyDiaryReferences);
  return diaryItems.flatMap((item, index) => {
    const entries = dataList(item.entries).length > 0 ? item.entries : [""];
    return entries.map((entry, entryIndex) => ({
      sequence: `${index + 1}.${entryIndex + 1}`,
      date: item.date,
      title: item.title,
      type: item.type,
      naid: item.naid,
      catalog_title: item.catalogTitle,
      event_entry: entry,
      volume_use: item.volumeUse,
      follow_up: item.followUp,
      promotion_rule: "Use as chronology-control evidence only until paired with a substantive call, meeting, briefing, speech, or Public Papers record.",
      source_note_target: `Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, ${item.catalogTitle}, NAID ${item.naid}. Schedule-control entry; pair with substantive records before promotion.`,
      url: item.url,
      tags: dataList(item.tags).join("; ")
    }));
  });
}

function downloadDailyDiaryCsv() {
  const rows = dailyDiaryRows();
  const lines = [
    dailyDiaryFields.join(","),
    ...rows.map((row) => dailyDiaryFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-daily-diary-controls.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function installDailyDiaryPanel() {
  const diarySection = document.querySelector("#diary");
  const diaryMethod = diarySection?.querySelector(".diary-method");
  if (!diarySection || !diaryMethod || document.querySelector("#export-daily-diary-controls")) return;

  const rows = dailyDiaryRows();
  const fileUnits = new Set(rows.map((row) => row.naid)).size;

  const actions = document.createElement("div");
  actions.className = "chronology-actions";
  actions.setAttribute("aria-label", "Daily Diary controls actions");

  const summary = document.createElement("p");
  summary.id = "daily-diary-export-summary";
  summary.className = "result-summary";
  summary.textContent = `${rows.length} Daily Diary event rows across ${fileUnits} NARA file units`;

  const button = document.createElement("button");
  button.id = "export-daily-diary-controls";
  button.type = "button";
  button.textContent = "Export Daily Diary CSV";
  button.disabled = rows.length === 0;
  button.addEventListener("click", downloadDailyDiaryCsv);

  actions.append(summary, button);
  diaryMethod.insertAdjacentElement("afterend", actions);
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

function sourceNoteIntakeRows() {
  return verificationQueueRows().map((row) => ({
    intake_rank: row.rank,
    action_group: row.action_group,
    date: row.date,
    title: row.title,
    priority_or_status: row.priority_or_status,
    repository_or_source: row.repository_or_source,
    identifier: row.identifier,
    required_capture_fields: captureFields(row),
    provisional_source_note: row.source_note_target,
    verification_needed: row.verification_needed,
    next_pull: row.next_pull,
    collection_or_office: "",
    series_or_file_unit: "",
    box: "",
    folder: "",
    document_title: "",
    document_date: "",
    sender_recipient: "",
    classification_marking: "",
    copy_version_status: "",
    release_status: "",
    paired_record: "",
    promotion_decision: "",
    final_source_note: "",
    follow_up: row.next_pull,
    url: row.url
  }));
}

function recommendedTreatment(row) {
  if (/Directive source packet/.test(row.action_group)) return "Print candidate or editorial-note anchor after released text/source packet is verified.";
  if (/Reading-room pull/.test(row.action_group)) return "Print candidate only after item-level document review proves foundation-level value.";
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Chronology/editorial-note context unless paired with a substantive record.";
  if (/Draft trail pairing/.test(row.action_group)) return "Public baseline; print only with draft, clearance, or policy-file evidence.";
  if (/Item-level source note/.test(row.action_group)) return "Candidate record; decide print, editorial note, or context after provenance is complete.";
  return "Review for print, editorial-note, context-only, or handoff treatment.";
}

function selectionGate(row) {
  if (/Directive source packet/.test(row.action_group)) return "Does the directive establish broad national-security process, doctrine, or presidential decision machinery for Volume I?";
  if (/Reading-room pull/.test(row.action_group)) return "Does the item explain foundation-level doctrine/process rather than topical implementation?";
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Does the paired substantive record show policy reasoning, decision, or high-level diplomatic activity?";
  if (/Draft trail pairing/.test(row.action_group)) return "Does the draft/clearance trail show how public doctrine was formed or approved?";
  if (/Item-level source note/.test(row.action_group)) return "Does the record satisfy the FRUS standard for major foreign-policy decisions or significant diplomatic activity?";
  return "Can this source carry document-level evidence instead of only locating or contextualizing another record?";
}

function pairedEvidenceNeeded(row) {
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Call transcript, memcon/telcon, meeting paper, briefing book, speech draft, or Public Papers text.";
  if (/Draft trail pairing/.test(row.action_group)) return "Earliest draft, marked-up draft, clearance comments, policy memorandum, final public text, and diary/event control.";
  if (/Directive source packet/.test(row.action_group)) return "Released directive text, source packet, distribution/routing record, classification marking, and release status.";
  if (/Reading-room pull/.test(row.action_group)) return "Folder title page, routing slip, first substantive memo, decision memo, briefing tab, draft, or clearance note.";
  return row.verification_needed;
}

function sourceNoteStatus(row) {
  if (/Chronology|Substantive pairing|Draft trail/.test(row.action_group)) return "Locator or public control until paired evidence is cited.";
  if (/Directive source packet/.test(row.action_group)) return "Locator until released text/source packet metadata is captured.";
  if (/Reading-room pull|Item-level source note/.test(row.action_group)) return "Provisional until box, folder, item date, markings, copy status, and release status are captured.";
  return "Provisional until item-level metadata is verified.";
}

function accessPath(row) {
  if (/Directive/.test(row.action_group)) return "Clinton Presidential Library directive/source packet path; NSC Records Management, Executive Secretary, or responsible office copy.";
  if (/Reading-room/.test(row.action_group)) return "Clinton Library 2013-0185-M OA/ID reading-room pull.";
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "NARA Catalog Daily Diary or chronology lead plus paired substantive record path.";
  if (/Draft trail/.test(row.action_group)) return "Public text plus NSC Speechwriting, Press, Communications, policy, draft, or clearance file.";
  if (/Item-level source note/.test(row.action_group)) return "Repository item-level source note path.";
  return `${repositoryGroup(row)} source path.`;
}

function releaseQuestion(row) {
  if (/Directive/.test(row.action_group)) return "Is released directive text or a source packet available, and what exact markings, distribution, copy/version, and release status does it carry?";
  if (/Reading-room/.test(row.action_group)) return "Is the folder or item pullable, and what restriction or release status appears on the item?";
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Is the paired call, meeting, briefing, speech, Public Papers text, or other substantive record available and citeable?";
  if (/Draft trail/.test(row.action_group)) return "Are draft, clearance, briefing, or policy files available and tied to a stable public text?";
  if (/Item-level source note/.test(row.action_group)) return "What item-level access, restriction, release, and source-note status remains unresolved?";
  return "What access, restriction, release, or source-note status remains unresolved?";
}

function accessTrackerRows() {
  return verificationQueueRows().map((row) => ({
    access_rank: row.rank,
    action_group: row.action_group,
    repository_group: repositoryGroup(row),
    date: row.date,
    title: row.title,
    identifier: row.identifier,
    access_path: accessPath(row),
    release_question: releaseQuestion(row),
    classification_or_restriction_to_capture: captureFields(row),
    source_note_blocker: sourceNoteStatus(row),
    needed_before_selection: pairedEvidenceNeeded(row),
    next_pull: row.next_pull,
    owner: "",
    status: "",
    url: row.url
  }));
}

function volumeBoundary(row) {
  const text = `${row.title} ${row.identifier} ${row.next_pull} ${row.repository_or_source}`.toLowerCase();
  if (/nato|europe|russia|ukraine|balkans|bosnia|kosovo|arms control|strategic/.test(text)) return "Promote only if it explains broad foundations; otherwise hand off to Europe/Russia/Balkans/arms-control volumes.";
  if (/trade|economy|g-?7|g-?8|economic/.test(text)) return "Promote only broad globalization/economic-doctrine framing; hand implementation to economic volumes.";
  if (/terror|cyber|crime|infrastructure|transnational/.test(text)) return "Promote broad transnational-threat doctrine; hand operational implementation to functional volumes.";
  if (/daily diary|naid/.test(text)) return "Use for chronology unless paired with substantive evidence.";
  if (/speech|public papers|strategy|national security strategy|nss/.test(text)) return "Use public text as baseline; print only with internal drafting or clearance record.";
  return "Keep within Volume I only if it documents doctrine, process, strategy, or foundational policy framing.";
}

function editorialNoteUse(row) {
  if (/Substantive pairing|Chronology pairing/.test(row.action_group)) return "Use as editorial-note chronology if no substantive paired record is available.";
  if (/Draft trail pairing/.test(row.action_group)) return "Use public text plus draft trail in an editorial note if no single internal document is strong enough to print.";
  if (/Directive source packet/.test(row.action_group)) return "Use as editorial-note anchor if released directive text is unavailable but directive sequence is essential.";
  if (/Reading-room pull/.test(row.action_group)) return "Use as source-cluster note if folders show context but no print-worthy item emerges.";
  return "Use to bridge unavailable, public, duplicate, or adjacent-volume material.";
}

function selectionDecisionRows() {
  return verificationQueueRows().map((row) => ({
    decision_rank: row.rank,
    date: row.date,
    title: row.title,
    action_group: row.action_group,
    priority_or_status: row.priority_or_status,
    repository_or_source: row.repository_or_source,
    identifier: row.identifier,
    recommended_treatment: recommendedTreatment(row),
    selection_gate: selectionGate(row),
    paired_evidence_needed: pairedEvidenceNeeded(row),
    source_note_status: sourceNoteStatus(row),
    volume_boundary: volumeBoundary(row),
    editorial_note_use: editorialNoteUse(row),
    provisional_source_note: row.source_note_target,
    final_decision: "",
    compiler_note: "",
    url: row.url
  }));
}

function needsHandoff(row) {
  return /hand off|hand implementation|hand operational/i.test(row.volume_boundary);
}

function handoffDestination(row) {
  const text = `${row.title} ${row.identifier} ${row.volume_boundary}`.toLowerCase();
  if (/nato|europe|russia|ukraine|balkans|bosnia|kosovo|arms-control|arms control|strategic/.test(text)) {
    return "Europe/Russia/Balkans/arms-control Clinton volumes";
  }
  if (/trade|economy|economic|g-?7|g-?8/.test(text)) return "Economic policy/global economy Clinton volumes";
  if (/terror|cyber|crime|infrastructure|transnational/.test(text)) {
    return "Global issues/counterterrorism/cyber/transnational-threats Clinton volumes";
  }
  return "Adjacent Clinton topical volume to assign";
}

function volumeIKeep(row) {
  if (/Europe|Russia|Balkans|arms-control/i.test(row.likely_destination || "")) {
    return "Keep only doctrine, process, alliance architecture, or strategic-framing evidence that explains the foundations volume.";
  }
  if (/Economic/i.test(row.likely_destination || "")) return "Keep broad globalization or economic-doctrine framing; move implementation and sector detail.";
  if (/Global issues|transnational/i.test(row.likely_destination || "")) {
    return "Keep broad transnational-threat doctrine; move operational counterterrorism, cyber, infrastructure, or crime detail.";
  }
  return "Keep only foundation-level doctrine, process, strategy, or public framing.";
}

function handoffRegisterRows() {
  return selectionDecisionRows()
    .filter(needsHandoff)
    .map((row, index) => {
      const likely_destination = handoffDestination(row);
      return {
        handoff_rank: index + 1,
        date: row.date,
        title: row.title,
        action_group: row.action_group,
        priority_or_status: row.priority_or_status,
        repository_or_source: row.repository_or_source,
        identifier: row.identifier,
        likely_destination,
        why_handoff: row.volume_boundary,
        keep_in_volume_i: volumeIKeep({ ...row, likely_destination }),
        volume_i_citation_use: row.editorial_note_use,
        source_note_status: row.source_note_status,
        next_action: `Assign implementation material to ${likely_destination}; keep only Volume I framing evidence and source-note bridge text.`,
        final_owner: "",
        status: "",
        url: row.url
      };
    });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function summarizeIdentifiers(rows) {
  const identifiers = uniqueValues(rows.flatMap((row) => String(row.identifiers || "").split(";").map((value) => value.trim())));
  if (identifiers.length <= 12) return identifiers.join("; ");
  return `${identifiers.slice(0, 12).join("; ")}; +${identifiers.length - 12} more`;
}

function requestBatchRows() {
  const groups = new Map();
  for (const row of requestPacketRows()) {
    const key = `${row.repository_group}::${row.request_type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  return [...groups.values()]
    .map((rows) => {
      const sortedRows = [...rows].sort((a, b) => Number(a.rank) - Number(b.rank));
      const first = sortedRows[0];
      const ranks = sortedRows.map((row) => Number(row.rank));
      const identifiers = summarizeIdentifiers(sortedRows);
      const sourceTargets = uniqueValues(sortedRows.map((row) => row.source_note_target)).slice(0, 6).join(" | ");
      const urls = uniqueValues(sortedRows.map((row) => row.url)).slice(0, 8).join(" | ");
      return {
        batch_rank: Math.min(...ranks),
        repository_group: first.repository_group,
        request_type: first.request_type,
        request_count: sortedRows.length,
        rank_range: `${Math.min(...ranks)}-${Math.max(...ranks)}`,
        identifiers,
        batch_request: `${first.repository_group}: ${first.request_type}. Work ${sortedRows.length} related request rows together; start with ${identifiers}.`,
        capture_fields: uniqueValues(sortedRows.map((row) => row.capture_fields)).join(" | "),
        source_note_targets: sourceTargets,
        urls
      };
    })
    .sort((a, b) => Number(a.batch_rank) - Number(b.batch_rank) || a.repository_group.localeCompare(b.repository_group));
}

function recipientHint(repositoryGroupName) {
  if (/Clinton Presidential Library/i.test(repositoryGroupName)) return "Clinton Presidential Library research room or remote reference";
  if (/National Archives Catalog/i.test(repositoryGroupName)) return "NARA Catalog and reference staff";
  if (/Published\/Public Text/i.test(repositoryGroupName)) return "Compiler public-text verification checklist";
  if (/NSC and White House files/i.test(repositoryGroupName)) return "NARA or Clinton Library reference staff for NSC and White House file units";
  return `${repositoryGroupName} reference contact`;
}

function correspondenceSubject(row) {
  return `FRUS Clinton Volume I source request - ${row.request_type} (${row.request_count} rows)`;
}

function correspondenceBody(row) {
  const base =
    `I am preparing research support for Foreign Relations of the United States, 1993-2000, Volume I, Foundations of Foreign Policy. ` +
    `Could you help locate, verify, or stage this ${row.request_type.toLowerCase()} batch: ${row.batch_request} `;
  const fields =
    `Please prioritize these identifiers: ${row.identifiers}. Capture fields needed for FRUS source-note review: ${row.capture_fields}.`;
  const close =
    "If any records are not currently pullable, please point me to the closest available file-unit, finding-aid, FOIA case, or public locator so the source trail can be cited accurately.";
  if (/Published\/Public Text/i.test(row.repository_group)) {
    return `Use this as a public-text verification checklist rather than a repository email. ${fields} Confirm stable publication URLs, publication dates, titles, speakers, and any paired archival draft or clearance trail.`;
  }
  return `${base}${fields} ${close}`;
}

function correspondenceDraftRows() {
  return requestBatchRows().map((row) => ({
    draft_rank: row.batch_rank,
    repository_group: row.repository_group,
    request_type: row.request_type,
    subject: correspondenceSubject(row),
    recipient_hint: recipientHint(row.repository_group),
    message_body: correspondenceBody(row),
    identifiers: row.identifiers,
    capture_fields: row.capture_fields,
    source_note_targets: row.source_note_targets,
    urls: row.urls
  }));
}

function sourceNoteTemplateRows() {
  return [
    {
      template_id: "directive-source-packet",
      evidence_type: "PRD/PDD directive text or source packet",
      use_when: "A directive is selected as a document anchor or cited in an editorial note.",
      source_note_pattern:
        "Source: Clinton Presidential Library, [collection or NSC office], [series/file unit], [box], [folder], [directive code and title], [date]. [classification marking]; [copy/version status]; [release status].",
      required_fields: "Directive code; exact title; date; collection; series/file unit; box; folder; classification marking; copy/version status; release status.",
      do_not_promote_until: "The public directive index has been replaced by released text, source packet, or responsible office file provenance.",
      paired_record_target: "NSC Records Management file, Executive Secretary routing, responsible office packet, or released directive text.",
      example_source: "PDD-1, PDD-2, PRD-35, PDD-25, PDD-39, PDD-42, PDD-63."
    },
    {
      template_id: "daily-diary-control",
      evidence_type: "Presidential Daily Diary chronology control",
      use_when: "A Daily Diary file unit dates a call, meeting, briefing, travel event, or public doctrine event.",
      source_note_pattern:
        "Source: National Archives Catalog, Records of Oval Office Operations (Clinton Administration), Presidential Daily Diary, [file-unit title/date span], NAID [number]. Schedule-control entry; paired substantive record to be cited separately.",
      required_fields: "NAID; file-unit title/date span; event date; time if available; participants; paired record status.",
      do_not_promote_until: "A memcon, telcon, call transcript, meeting paper, briefing book, speech draft, or Public Papers text is paired with the schedule entry.",
      paired_record_target: "Call transcript, memorandum of conversation, briefing papers, meeting agenda, speech draft, or Public Papers item.",
      example_source: "2010-0083-F Daily Diary file units, including NAIDs 147870741, 17367481, 17367492, 17368174, 147870907, and 17368201."
    },
    {
      template_id: "speechwriting-draft",
      evidence_type: "NSC speechwriting draft trail",
      use_when: "A public doctrine speech needs draft, clearance, or principal-edit evidence before promotion.",
      source_note_pattern:
        "Source: Clinton Presidential Library, Records of the National Security Council, Speechwriting Office, [staff files], [OA/ID], [folder title], [document title or draft description], [date]. [draft/version status]; [markings]; [clearance or edit evidence].",
      required_fields: "Staff file; OA/ID; folder title; document title; date; draft/version status; markings; relation to delivered text.",
      do_not_promote_until: "The folder review identifies a specific draft, markup, clearance note, or policy memorandum rather than only a finding-aid folder title.",
      paired_record_target: "Delivered text, earliest draft, marked-up draft, clearance comments, policy memorandum, and diary event control.",
      example_source: "Blinken, Boorstin, and Widmer speechwriting files for Lake enlargement, UNGA, State of the Union, UN 50th anniversary, and new-century speeches."
    },
    {
      template_id: "published-strategy",
      evidence_type: "Published National Security Strategy or public strategy paper",
      use_when: "A public strategy paper supplies the doctrine baseline but needs internal drafting context.",
      source_note_pattern:
        "Source: The White House, [strategy title], [date]. Published strategy paper; [repository copy or URL]. Internal drafting, clearance, circulation, or review file to be cited separately if selected as document evidence.",
      required_fields: "Title; date; publication copy; URL or repository copy; drafting or clearance file status.",
      do_not_promote_until: "NSC drafting, clearance, circulation, or PRD/strategy review records explain authorship, review, or policy significance.",
      paired_record_target: "PRD-35, NSC drafting file, clearance memorandum, circulation copy, or editorial-note bridge.",
      example_source: "A National Security Strategy of Engagement and Enlargement, July 1994; A National Security Strategy for a New Century, May 1997 and December 1999."
    },
    {
      template_id: "public-speech",
      evidence_type: "Public speech, statement, or background briefing",
      use_when: "A public text explains doctrine but should not stand alone as internal decision evidence.",
      source_note_pattern:
        "Source: [Public Papers, archived White House, Department release, or transcript repository], [speaker], [title/event], [place], [date]. Public text; paired draft, clearance, briefing, or policy file to be cited separately.",
      required_fields: "Repository; speaker; title/event; place; date; publication citation or URL; paired internal record status.",
      do_not_promote_until: "Drafts, clearance comments, talking points, briefing books, or policy memoranda show why the public text belongs in Volume I.",
      paired_record_target: "Speechwriting draft, press guidance, briefing book, clearance note, policy memorandum, or Daily Diary event control.",
      example_source: "Lake enlargement speech, UNGA addresses, State of the Union foreign-policy sections, background briefings, and rollout guidance."
    },
    {
      template_id: "clinton-library-item",
      evidence_type: "Clinton Library item from 2013-0185-M pull cluster",
      use_when: "A reading-room pull yields an item-level document, not just a finding-aid folder lead.",
      source_note_pattern:
        "Source: Clinton Presidential Library, [collection/office], 2013-0185-M, [OA/ID], [box], [folder], [document title], [date]. [sender/recipient]; [classification marking]; [copy/version status]; [release status].",
      required_fields: "Collection/office; OA/ID; box; folder; document title; date; sender/recipient; markings; copy/version status; release status.",
      do_not_promote_until: "The compiler has captured the folder title page and item-level document metadata during reading-room review.",
      paired_record_target: "Folder title page, routing slip, first substantive memo, decision memo, briefing tab, draft, or clearance note.",
      example_source: "Directive, speechwriting, NATO, UN, senior-principal, economy, transnational-threat, and press clusters from the Library Sprint."
    },
    {
      template_id: "editorial-note-bridge",
      evidence_type: "Editorial note bridge for unavailable or cross-volume material",
      use_when: "The chronology needs context but the best source is public, unavailable, duplicated, or belongs mostly in an adjacent topical volume.",
      source_note_pattern:
        "Editorial note: [concise explanation of event/source cluster]. Cite [public text or locator] for chronology and direct the reader/compiler to [substantive file, topical volume, or pending request] for document-level evidence.",
      required_fields: "Event; reason not printed as document; public or archival locator; adjacent volume or request path; paired evidence status.",
      do_not_promote_until: "The note clearly separates chronology/context from document-level evidence and avoids substituting a locator for a final source note.",
      paired_record_target: "Topical-volume handoff, public text, request packet, source-note audit row, or verified archival item.",
      example_source: "Directive texts awaiting source packets, Daily Diary-only controls, NSS public copies, or NATO/Russia/UN implementation detail routed to adjacent volumes."
    }
  ];
}

function compilerRunbookRows() {
  return [
    {
      sequence: "01",
      compiler_move: "Establish the chronological spine",
      page_section: "Chronology Of Declassified Documents",
      export_button: "Export Chronology CSV",
      output_file: "clinton-foundations-document-chronology.csv",
      use_for: "Work released, declassified, and public controls by date before office or topic.",
      decision_supported: "Which events and documents define the volume sequence.",
      stop_condition: "Stop when every row has a provisional source-note target and next pull."
    },
    {
      sequence: "02",
      compiler_move: "Triage promotion status",
      page_section: "Chronology Of Declassified Documents",
      export_button: "Export Triage CSV",
      output_file: "clinton-foundations-chronology-triage.csv",
      use_for: "Separate anchors, locators, diary controls, public-text trails, and strategy baselines.",
      decision_supported: "Promote, pair first, cite as context, or route to a topical volume.",
      stop_condition: "Stop when every chronology row has a pairing target and volume-boundary caution."
    },
    {
      sequence: "03",
      compiler_move: "Reconcile Daily Diary event controls",
      page_section: "Calls And Meetings To Reconcile Chronologically",
      export_button: "Export Daily Diary CSV",
      output_file: "clinton-foundations-daily-diary-controls.csv",
      use_for: "Turn the 2010-0083-F search set into event-level rows for calls, briefings, meetings, summit prep, and public doctrine controls.",
      decision_supported: "Which schedule entries need memcons, call transcripts, briefing books, speech drafts, or Public Papers pairing.",
      stop_condition: "Stop when every event row has a paired-record target or a context-only decision."
    },
    {
      sequence: "04",
      compiler_move: "Survey the source lead universe",
      page_section: "Source Leads",
      export_button: "Export CSV",
      output_file: "clinton-foundations-source-leads.csv",
      use_for: "Export the filtered source-lead set by repository, topic, priority, date range, identifier, URL, and note.",
      decision_supported: "Which repositories, finding aids, public sources, and precedent anchors deserve follow-up before request writing.",
      stop_condition: "Stop when the active source leads can be assigned to chronology, Library pull, NARA scout, public-text, or topical handoff work."
    },
    {
      sequence: "05",
      compiler_move: "Stage Clinton Library pulls",
      page_section: "Clinton Library Sprint",
      export_button: "Export Pull Sheet CSV",
      output_file: "clinton-library-pull-sheet.csv",
      use_for: "Turn 2013-0185-M finding-aid intelligence into OA/ID-level reading-room requests.",
      decision_supported: "Which folders deserve first-pass box time.",
      stop_condition: "Stop when each OA/ID request has a reason, folder target, and reading-room move."
    },
    {
      sequence: "06",
      compiler_move: "Queue reading-room call slips",
      page_section: "Clinton Library Sprint",
      export_button: "Export Call-Slip Queue CSV",
      output_file: "clinton-library-call-slip-queue.csv",
      use_for: "Turn every OA/ID in the Library Sprint into a row-level request with phase, folder targets, capture checklist, promotion test, and stop rule.",
      decision_supported: "Which exact OA/ID requests can be handed to the reading room without retyping pull clusters.",
      stop_condition: "Stop when each OA/ID has call-slip request text and an item-level capture checklist."
    },
    {
      sequence: "07",
      compiler_move: "Plan onsite reading-room order",
      page_section: "Clinton Library Sprint",
      export_button: "Export Onsite Agenda CSV",
      output_file: "clinton-library-onsite-agenda.csv",
      use_for: "Convert pull clusters into day/phase sequencing, first moves, capture fields, tests, and stop rules.",
      decision_supported: "What to request first at the Clinton Library and when to stop sampling.",
      stop_condition: "Stop when the day plan covers directive, speech, process, strategy, and support clusters."
    },
    {
      sequence: "08",
      compiler_move: "Apply FRUS-style source-note patterns",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Source-Note Templates CSV",
      output_file: "clinton-foundations-source-note-templates.csv",
      use_for: "Keep directive packets, diary controls, speech drafts, public texts, library items, and editorial notes in citation form.",
      decision_supported: "What fields must be captured before a locator becomes a source note.",
      stop_condition: "Stop when every evidence type has required fields and a no-promotion condition."
    },
    {
      sequence: "09",
      compiler_move: "Capture item-level source-note metadata",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Source-Note Intake CSV",
      output_file: "clinton-foundations-source-note-intake.csv",
      use_for: "Record box, folder, item title, date, markings, copy status, release status, paired record, promotion decision, and final source note while reviewing pulled material.",
      decision_supported: "Which provisional locators have been converted into FRUS-ready item-level source notes.",
      stop_condition: "Stop when every promoted item has source-note metadata, paired-record status, and a final citation or follow-up."
    },
    {
      sequence: "10",
      compiler_move: "Track access and release blockers",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Access Tracker CSV",
      output_file: "clinton-foundations-access-tracker.csv",
      use_for: "Work repository access, release status, classification or restriction capture, stable public access, and paired-record availability before final selection.",
      decision_supported: "Which candidates still need access, restriction, release, or paired-record verification before source-note promotion.",
      stop_condition: "Stop when every row has owner, status, access path, and remaining release or restriction blocker captured."
    },
    {
      sequence: "11",
      compiler_move: "Decide print, editorial-note, context, or handoff treatment",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Selection Matrix CSV",
      output_file: "clinton-foundations-selection-matrix.csv",
      use_for: "Apply the FRUS selection gate to each verified or provisional source path before over-collecting adjacent-volume material.",
      decision_supported: "Which candidates should be printed, handled in an editorial note, kept as context, or handed to another Clinton volume.",
      stop_condition: "Stop when every row has a final decision, boundary note, and compiler rationale."
    },
    {
      sequence: "12",
      compiler_move: "Register adjacent-volume handoffs",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Handoff Register CSV",
      output_file: "clinton-foundations-handoff-register.csv",
      use_for: "Extract selection rows whose boundary warning points to Europe, Russia, Balkans, arms-control, economic, global-issues, or transnational-threat volumes.",
      decision_supported: "Which implementation records leave Volume I, what framing stays, and who owns the follow-up.",
      stop_condition: "Stop when every handoff row has a receiving volume/owner, Volume I citation use, and status."
    },
    {
      sequence: "13",
      compiler_move: "Audit source-note readiness",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Source-Note Audit CSV",
      output_file: "clinton-foundations-source-note-audit.csv",
      use_for: "Reconcile chronology controls, candidates, diary pointers, directives, public texts, and library clusters.",
      decision_supported: "Which rows remain locators and which have enough item-level evidence.",
      stop_condition: "Stop when no promoted row lacks verification need, next pull, and source-note target."
    },
    {
      sequence: "14",
      compiler_move: "Work the readiness queue",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Verification Queue CSV",
      output_file: "clinton-foundations-verification-queue.csv",
      use_for: "Sort the highest-risk verification work before writing requests.",
      decision_supported: "Which directive packets, diary pairings, draft trails, and library pulls come first.",
      stop_condition: "Stop when priority rows are assigned to a repository request or onsite action."
    },
    {
      sequence: "15",
      compiler_move: "Write repository-facing asks",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Request Packets CSV",
      output_file: "clinton-foundations-request-packets.csv",
      use_for: "Convert verification rows into request text, capture fields, identifiers, and source-note targets.",
      decision_supported: "What to ask NARA, Clinton Library, or public-record repositories for.",
      stop_condition: "Stop when each ask has identifiers, capture fields, and a source-note target."
    },
    {
      sequence: "16",
      compiler_move: "Batch the handoff",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Request Batches CSV",
      output_file: "clinton-foundations-request-batches.csv",
      use_for: "Group request packets by repository and request type for reading-room or remote-reference work.",
      decision_supported: "Which request groups can be sent or staged together.",
      stop_condition: "Stop when each repository has a compact batch list rather than row-by-row requests."
    },
    {
      sequence: "17",
      compiler_move: "Draft repository correspondence",
      page_section: "Gap Register And Pull Controls",
      export_button: "Export Correspondence Drafts CSV",
      output_file: "clinton-foundations-correspondence-drafts.csv",
      use_for: "Turn grouped request batches into ready-to-edit email or call-slip language.",
      decision_supported: "What subject, recipient hint, ask text, identifiers, capture fields, source-note targets, and URLs belong in each outgoing request.",
      stop_condition: "Stop when each batch has correspondence text that preserves the FRUS source-note capture requirements."
    },
    {
      sequence: "18",
      compiler_move: "Review candidate file units",
      page_section: "Records To Pull, Check, Or Promote",
      export_button: "Export CSV",
      output_file: "clinton-foundations-records.csv",
      use_for: "Filter candidate records by priority, period, and source repository.",
      decision_supported: "Which file units can become document candidates after verification.",
      stop_condition: "Stop when high-priority candidates have item-level risk notes and repository URLs."
    },
    {
      sequence: "19",
      compiler_move: "Pair public doctrine statements",
      page_section: "Public Statements And Strategy Texts",
      export_button: "Export CSV",
      output_file: "clinton-foundations-statements.csv",
      use_for: "Track public speeches, strategy papers, and statements that need draft or clearance evidence.",
      decision_supported: "Which public texts belong as documents, editorial-note anchors, or context only.",
      stop_condition: "Stop when each public text has a paired archival target or context-only decision."
    },
    {
      sequence: "20",
      compiler_move: "Check principal context",
      page_section: "People And Offices",
      export_button: "Export CSV",
      output_file: "clinton-foundations-persons.csv",
      use_for: "Keep principals, staff offices, and period responsibilities available while source notes are drafted.",
      decision_supported: "Which office or person likely owns the next pull.",
      stop_condition: "Stop when open pulls have an office/person path for follow-up."
    }
  ];
}

function downloadCompilerRunbookCsv() {
  const rows = compilerRunbookRows();
  const lines = [
    compilerRunbookFields.join(","),
    ...rows.map((row) => compilerRunbookFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-compiler-runbook.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function downloadSourceNoteIntakeCsv() {
  const rows = sourceNoteIntakeRows();
  const lines = [
    sourceNoteIntakeFields.join(","),
    ...rows.map((row) => sourceNoteIntakeFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-source-note-intake.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadAccessTrackerCsv() {
  const rows = accessTrackerRows();
  const lines = [
    accessTrackerFields.join(","),
    ...rows.map((row) => accessTrackerFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-access-tracker.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadSelectionDecisionCsv() {
  const rows = selectionDecisionRows();
  const lines = [
    selectionDecisionFields.join(","),
    ...rows.map((row) => selectionDecisionFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-selection-matrix.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadHandoffRegisterCsv() {
  const rows = handoffRegisterRows();
  const lines = [
    handoffRegisterFields.join(","),
    ...rows.map((row) => handoffRegisterFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-handoff-register.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadSourceNoteTemplatesCsv() {
  const rows = sourceNoteTemplateRows();
  const lines = [
    sourceNoteTemplateFields.join(","),
    ...rows.map((row) => sourceNoteTemplateFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-source-note-templates.csv";
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

function downloadRequestBatchCsv() {
  const rows = requestBatchRows();
  const lines = [
    requestBatchFields.join(","),
    ...rows.map((row) => requestBatchFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-request-batches.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCorrespondenceDraftCsv() {
  const rows = correspondenceDraftRows();
  const lines = [
    correspondenceDraftFields.join(","),
    ...rows.map((row) => correspondenceDraftFields.map((field) => libraryCsvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-correspondence-drafts.csv";
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

function makeBatchCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.batch_rank}. ${row.repository_group}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = `${row.request_count} rows`;
  header.append(title, badge);

  const request = document.createElement("p");
  request.textContent = row.batch_request;
  const fields = document.createElement("p");
  fields.className = "risk-note";
  fields.textContent = `Capture: ${row.capture_fields}`;
  const ids = document.createElement("p");
  ids.className = "gap-pull-list";
  ids.textContent = `IDs: ${row.identifiers}`;

  card.append(header, request, fields, ids);
  return card;
}

function makeCorrespondenceDraftCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.draft_rank}. ${row.repository_group}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.request_type;
  header.append(title, badge);

  const subject = document.createElement("p");
  subject.textContent = `Subject: ${row.subject}`;
  const recipient = document.createElement("p");
  recipient.className = "risk-note";
  recipient.textContent = `Recipient: ${row.recipient_hint}`;
  const ids = document.createElement("p");
  ids.className = "gap-pull-list";
  ids.textContent = `IDs: ${row.identifiers}`;

  card.append(header, subject, recipient, ids);
  return card;
}

function makeSourceNoteIntakeCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.intake_rank}. ${row.title}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.action_group;
  header.append(title, badge);

  const required = document.createElement("p");
  required.textContent = `Required fields: ${row.required_capture_fields}`;
  const provisional = document.createElement("p");
  provisional.className = "risk-note";
  provisional.textContent = `Provisional note: ${row.provisional_source_note}`;
  const blanks = document.createElement("p");
  blanks.className = "gap-pull-list";
  blanks.textContent = "Blank capture columns: box, folder, item date, markings, release status, paired record, promotion decision, final source note.";

  card.append(header, required, provisional, blanks);
  return card;
}

function makeAccessTrackerCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.access_rank}. ${row.title}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = "Access";
  header.append(title, badge);

  const question = document.createElement("p");
  question.textContent = `Question: ${row.release_question}`;
  const capture = document.createElement("p");
  capture.className = "risk-note";
  capture.textContent = `Capture: ${row.classification_or_restriction_to_capture}`;
  const blocker = document.createElement("p");
  blocker.className = "gap-pull-list";
  blocker.textContent = `Blocker: ${row.source_note_blocker}`;

  card.append(header, question, capture, blocker);
  return card;
}

function makeSelectionDecisionCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.decision_rank}. ${row.title}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.action_group;
  header.append(title, badge);

  const treatment = document.createElement("p");
  treatment.textContent = `Treatment: ${row.recommended_treatment}`;
  const gate = document.createElement("p");
  gate.className = "risk-note";
  gate.textContent = `Selection gate: ${row.selection_gate}`;
  const boundary = document.createElement("p");
  boundary.className = "gap-pull-list";
  boundary.textContent = `Boundary: ${row.volume_boundary}`;

  card.append(header, treatment, gate, boundary);
  return card;
}

function makeHandoffRegisterCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.handoff_rank}. ${row.title}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = "Handoff";
  header.append(title, badge);

  const why = document.createElement("p");
  why.textContent = "Why handoff: implementation or operational detail belongs outside Volume I.";
  const keep = document.createElement("p");
  keep.className = "risk-note";
  keep.textContent = `Keep in Volume I: ${row.keep_in_volume_i}`;
  const action = document.createElement("p");
  action.className = "gap-pull-list";
  action.textContent = "Next action: assign receiving volume owner and status; keep only Volume I framing.";

  card.append(header, why, keep, action);
  return card;
}

function makeSourceNoteTemplateCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = row.evidence_type;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.template_id;
  header.append(title, badge);

  const pattern = document.createElement("p");
  pattern.textContent = row.source_note_pattern;
  const fields = document.createElement("p");
  fields.className = "risk-note";
  fields.textContent = `Required: ${row.required_fields}`;
  const caution = document.createElement("p");
  caution.className = "gap-pull-list";
  caution.textContent = `Do not promote until: ${row.do_not_promote_until}`;

  card.append(header, pattern, fields, caution);
  return card;
}

function makeCompilerRunbookCard(row) {
  const card = document.createElement("article");
  card.className = "gap-card";

  const header = document.createElement("div");
  header.className = "gap-card-header";
  const title = document.createElement("h3");
  title.textContent = `${row.sequence}. ${row.compiler_move}`;
  const badge = document.createElement("span");
  badge.className = "chip gap-badge";
  badge.textContent = row.output_file;
  header.append(title, badge);

  const use = document.createElement("p");
  use.textContent = row.use_for;
  const decision = document.createElement("p");
  decision.className = "risk-note";
  decision.textContent = `Decision: ${row.decision_supported}`;
  const stop = document.createElement("p");
  stop.className = "gap-pull-list";
  stop.textContent = `Stop: ${row.stop_condition}`;

  card.append(header, use, decision, stop);
  return card;
}

function installCompilerRunbookPanel() {
  const ingestSection = document.querySelector("#ingest");
  const checklist = ingestSection?.querySelector(".checklist");
  if (!ingestSection || !checklist || document.querySelector("#export-compiler-runbook")) return;

  const rows = compilerRunbookRows();

  const actions = document.createElement("div");
  actions.className = "chronology-actions";
  actions.setAttribute("aria-label", "Compiler runbook actions");

  const summary = document.createElement("p");
  summary.id = "compiler-runbook-summary";
  summary.className = "result-summary";
  summary.textContent = `${rows.length} compiler moves sequenced across page worksheets`;

  const button = document.createElement("button");
  button.id = "export-compiler-runbook";
  button.type = "button";
  button.textContent = "Export Runbook CSV";
  button.disabled = rows.length === 0;
  button.addEventListener("click", downloadCompilerRunbookCsv);

  actions.append(summary, button);

  const preview = document.createElement("div");
  preview.className = "gap-list";
  preview.setAttribute("aria-label", "Compiler runbook preview");
  preview.append(...rows.slice(0, 4).map(makeCompilerRunbookCard));

  checklist.insertAdjacentElement("beforebegin", actions);
  actions.insertAdjacentElement("afterend", preview);
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

  const intakeSummary = document.createElement("p");
  intakeSummary.id = "source-note-intake-summary";
  intakeSummary.className = "result-summary";

  const intakeButton = document.createElement("button");
  intakeButton.id = "export-source-note-intake";
  intakeButton.type = "button";
  intakeButton.textContent = "Export Source-Note Intake CSV";
  intakeButton.addEventListener("click", downloadSourceNoteIntakeCsv);

  const accessSummary = document.createElement("p");
  accessSummary.id = "access-tracker-summary";
  accessSummary.className = "result-summary";

  const accessButton = document.createElement("button");
  accessButton.id = "export-access-tracker";
  accessButton.type = "button";
  accessButton.textContent = "Export Access Tracker CSV";
  accessButton.addEventListener("click", downloadAccessTrackerCsv);

  const selectionSummary = document.createElement("p");
  selectionSummary.id = "selection-matrix-summary";
  selectionSummary.className = "result-summary";

  const selectionButton = document.createElement("button");
  selectionButton.id = "export-selection-matrix";
  selectionButton.type = "button";
  selectionButton.textContent = "Export Selection Matrix CSV";
  selectionButton.addEventListener("click", downloadSelectionDecisionCsv);

  const handoffSummary = document.createElement("p");
  handoffSummary.id = "handoff-register-summary";
  handoffSummary.className = "result-summary";

  const handoffButton = document.createElement("button");
  handoffButton.id = "export-handoff-register";
  handoffButton.type = "button";
  handoffButton.textContent = "Export Handoff Register CSV";
  handoffButton.addEventListener("click", downloadHandoffRegisterCsv);

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

  const batchSummary = document.createElement("p");
  batchSummary.id = "request-batch-summary";
  batchSummary.className = "result-summary";

  const batchButton = document.createElement("button");
  batchButton.id = "export-request-batches";
  batchButton.type = "button";
  batchButton.textContent = "Export Request Batches CSV";
  batchButton.addEventListener("click", downloadRequestBatchCsv);

  const correspondenceSummary = document.createElement("p");
  correspondenceSummary.id = "correspondence-draft-summary";
  correspondenceSummary.className = "result-summary";

  const correspondenceButton = document.createElement("button");
  correspondenceButton.id = "export-correspondence-drafts";
  correspondenceButton.type = "button";
  correspondenceButton.textContent = "Export Correspondence Drafts CSV";
  correspondenceButton.addEventListener("click", downloadCorrespondenceDraftCsv);

  const templateSummary = document.createElement("p");
  templateSummary.id = "source-note-template-summary";
  templateSummary.className = "result-summary";

  const templateButton = document.createElement("button");
  templateButton.id = "export-source-note-templates";
  templateButton.type = "button";
  templateButton.textContent = "Export Source-Note Templates CSV";
  templateButton.addEventListener("click", downloadSourceNoteTemplatesCsv);

  const rows = sourceNoteAuditRows();
  const intakeRows = sourceNoteIntakeRows();
  const accessRows = accessTrackerRows();
  const selectionRows = selectionDecisionRows();
  const handoffRows = handoffRegisterRows();
  const queueRows = verificationQueueRows();
  const requestRows = requestPacketRows();
  const batchRows = requestBatchRows();
  const correspondenceRows = correspondenceDraftRows();
  const templateRows = sourceNoteTemplateRows();
  const sections = new Set(rows.map((row) => row.section)).size;
  const repositories = new Set(requestRows.map((row) => row.repository_group)).size;
  summary.textContent = `${rows.length} source-note audit rows across ${sections} compiler evidence groups`;
  intakeSummary.textContent = `${intakeRows.length} source-note intake rows with blank item-level capture fields`;
  accessSummary.textContent = `${accessRows.length} access and release checks queued for source-note clearance`;
  selectionSummary.textContent = `${selectionRows.length} selection decisions queued for print, note, context, or handoff review`;
  handoffSummary.textContent = `${handoffRows.length} adjacent-volume handoff rows isolated from the selection matrix`;
  queueSummary.textContent = `${queueRows.length} verification tasks sorted by source-note readiness risk`;
  requestSummary.textContent = `${requestRows.length} request packets across ${repositories} repository groups`;
  batchSummary.textContent = `${batchRows.length} grouped request batches for repository handoff`;
  correspondenceSummary.textContent = `${correspondenceRows.length} correspondence drafts for repository outreach`;
  templateSummary.textContent = `${templateRows.length} source-note templates for common Clinton evidence types`;
  button.disabled = rows.length === 0;
  intakeButton.disabled = intakeRows.length === 0;
  accessButton.disabled = accessRows.length === 0;
  selectionButton.disabled = selectionRows.length === 0;
  handoffButton.disabled = handoffRows.length === 0;
  queueButton.disabled = queueRows.length === 0;
  requestButton.disabled = requestRows.length === 0;
  batchButton.disabled = batchRows.length === 0;
  correspondenceButton.disabled = correspondenceRows.length === 0;
  templateButton.disabled = templateRows.length === 0;

  actions.append(
    summary,
    button,
    intakeSummary,
    intakeButton,
    accessSummary,
    accessButton,
    selectionSummary,
    selectionButton,
    handoffSummary,
    handoffButton,
    queueSummary,
    queueButton,
    requestSummary,
    requestButton,
    batchSummary,
    batchButton,
    correspondenceSummary,
    correspondenceButton,
    templateSummary,
    templateButton
  );
  const queuePreview = document.createElement("div");
  queuePreview.className = "gap-list";
  queuePreview.setAttribute("aria-label", "Top source-note verification tasks");
  queuePreview.append(...queueRows.slice(0, 6).map(makeQueueCard));

  const intakePreview = document.createElement("div");
  intakePreview.className = "gap-list";
  intakePreview.setAttribute("aria-label", "Source-note intake worksheet preview");
  intakePreview.append(...intakeRows.slice(0, 4).map(makeSourceNoteIntakeCard));

  const accessPreview = document.createElement("div");
  accessPreview.className = "gap-list";
  accessPreview.setAttribute("aria-label", "Access and release tracker preview");
  accessPreview.append(...accessRows.slice(0, 4).map(makeAccessTrackerCard));

  const selectionPreview = document.createElement("div");
  selectionPreview.className = "gap-list";
  selectionPreview.setAttribute("aria-label", "Selection decision matrix preview");
  selectionPreview.append(...selectionRows.slice(0, 4).map(makeSelectionDecisionCard));

  const handoffPreview = document.createElement("div");
  handoffPreview.className = "gap-list";
  handoffPreview.setAttribute("aria-label", "Adjacent-volume handoff register preview");
  handoffPreview.append(...handoffRows.slice(0, 4).map(makeHandoffRegisterCard));

  const requestPreview = document.createElement("div");
  requestPreview.className = "gap-list";
  requestPreview.setAttribute("aria-label", "Top repository request packets");
  requestPreview.append(...requestRows.slice(0, 4).map(makeRequestCard));

  const batchPreview = document.createElement("div");
  batchPreview.className = "gap-list";
  batchPreview.setAttribute("aria-label", "Grouped repository request batches");
  batchPreview.append(...batchRows.slice(0, 5).map(makeBatchCard));

  const correspondencePreview = document.createElement("div");
  correspondencePreview.className = "gap-list";
  correspondencePreview.setAttribute("aria-label", "Repository correspondence drafts");
  correspondencePreview.append(...correspondenceRows.slice(0, 4).map(makeCorrespondenceDraftCard));

  const templatePreview = document.createElement("div");
  templatePreview.className = "gap-list";
  templatePreview.setAttribute("aria-label", "Source-note citation templates");
  templatePreview.append(...templateRows.slice(0, 4).map(makeSourceNoteTemplateCard));

  if (sectionNote) {
    sectionNote.insertAdjacentElement("afterend", actions);
    actions.insertAdjacentElement("afterend", intakePreview);
    intakePreview.insertAdjacentElement("afterend", accessPreview);
    accessPreview.insertAdjacentElement("afterend", selectionPreview);
    selectionPreview.insertAdjacentElement("afterend", handoffPreview);
    handoffPreview.insertAdjacentElement("afterend", queuePreview);
    queuePreview.insertAdjacentElement("afterend", requestPreview);
    requestPreview.insertAdjacentElement("afterend", batchPreview);
    batchPreview.insertAdjacentElement("afterend", correspondencePreview);
    correspondencePreview.insertAdjacentElement("afterend", templatePreview);
  } else {
    gapsSection.append(
      actions,
      intakePreview,
      accessPreview,
      selectionPreview,
      handoffPreview,
      queuePreview,
      requestPreview,
      batchPreview,
      correspondencePreview,
      templatePreview
    );
  }
}

if (libraryPullRoot && libraryPullSummary && exportLibraryPullsButton) {
  exportLibraryPullsButton.addEventListener("click", downloadLibraryPullCsv);
  new MutationObserver(updateLibraryPullSummary).observe(libraryPullRoot, { childList: true });
  updateLibraryPullSummary();
}

installOnsiteAgendaPanel();
installDailyDiaryPanel();
installCompilerRunbookPanel();
installSourceNoteAuditPanel();
