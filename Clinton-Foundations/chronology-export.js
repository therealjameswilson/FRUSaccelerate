const chronologyRoot = document.querySelector("#document-chronology-root");
const chronologySummary = document.querySelector("#document-chronology-summary");
const exportChronologyButton = document.querySelector("#export-document-chronology");
const chronologyTriageSummary = document.querySelector("#chronology-triage-summary");
const exportChronologyTriageButton = document.querySelector("#export-chronology-triage");

const chronologyFields = [
  "date",
  "title",
  "period",
  "type",
  "status",
  "source",
  "url",
  "summary",
  "source_note",
  "next_pull",
  "tags"
];

const triageFields = [
  "sequence",
  "date",
  "title",
  "evidence_role",
  "recommended_use",
  "source_note_action",
  "pair_before_promotion",
  "next_pull",
  "volume_boundary",
  "source",
  "url"
];

function textOf(root, selector) {
  return root.querySelector(selector)?.textContent.trim() || "";
}

function parseChronologyRows() {
  return [...document.querySelectorAll(".doc-chrono-row")].map((row) => {
    const date = row.querySelector(".doc-chrono-date");
    const label = textOf(row, ".record-type");
    const [type = "", status = ""] = label.split("/").map((part) => part.trim());
    const chips = [...row.querySelectorAll(".doc-chrono-meta .priority-chip, .doc-chrono-meta .chip")].map((chip) =>
      chip.textContent.trim()
    );
    const link = row.querySelector(".doc-chrono-meta a");
    const nextPull = textOf(row, ".risk-note").replace(/^Next pull:\s*/i, "");

    return {
      date: date?.dateTime || date?.textContent.trim() || "",
      title: textOf(row, "h3"),
      period: chips[0] || "",
      type,
      status,
      source: chips[1] || "",
      url: link?.href || "",
      summary: textOf(row, ".doc-chrono-body > p:not(.record-type):not(.source-note):not(.risk-note)"),
      source_note: textOf(row, ".source-note"),
      next_pull: nextPull,
      tags: chips.slice(2).join("; ")
    };
  });
}

function evidenceRole(row) {
  if (/Directive anchor/i.test(row.type)) return "Directive anchor";
  if (/Directive locator/i.test(row.type)) return "Directive locator";
  if (/diary/i.test(row.type)) return "Chronology control";
  if (/Public text plus draft trail/i.test(row.type)) return "Public doctrine draft trail";
  if (/Published strategy/i.test(row.type)) return "Published strategy baseline";
  return row.type || "Candidate control";
}

function recommendedUse(row) {
  if (/Directive anchor/i.test(row.type)) return "Promote after released text or source packet confirms markings, distribution, copy status, and final title.";
  if (/Directive locator/i.test(row.type)) return "Use as a locator until the review packet or responsible office file proves document-level value.";
  if (/diary/i.test(row.type)) return "Use to date calls, meetings, briefings, and travel only after pairing with substantive records.";
  if (/Public text plus draft trail/i.test(row.type)) return "Promote after drafts, clearance comments, policy memoranda, or diary controls show policy formation behind the public text.";
  if (/Published strategy/i.test(row.type)) return "Use as a public baseline; promote through an archival drafting or clearance file, or handle with an editorial note.";
  return "Evaluate for framework, process, public doctrine, or high-level strategy value before promotion.";
}

function sourceNoteAction(row) {
  if (/Clinton Presidential Library/i.test(row.source) && /Directive/i.test(row.type)) return "Replace public directive-index locator with final source packet note once text, markings, and copy status are verified.";
  if (/National Archives Catalog/i.test(row.source) || /diary/i.test(row.type)) return "Keep as a schedule-control note unless a paired memcon, telcon, briefing paper, or speech file supplies document evidence.";
  if (/Speechwriting|draft/i.test(row.source) || /draft/i.test(row.type)) return "Cite the exact draft folder, draft date, markings, and relation to delivered text after folder review.";
  if (/Published strategy/i.test(row.type)) return "Pair public citation with NSC drafting, clearance, or circulation file before final FRUS source-note treatment.";
  return "Record repository, collection, series, file unit, folder, document date, markings, and release status.";
}

function pairBeforePromotion(row) {
  if (/diary/i.test(row.type)) return "Memcon, telcon, call sheet, briefing book, meeting paper, speech draft, or Public Papers record.";
  if (/Directive/i.test(row.type)) return "Released directive text, source packet, Records Management copy, Executive Secretary routing, or responsible office file.";
  if (/Public text plus draft trail/i.test(row.type)) return "Earliest draft, marked-up draft, clearance comments, policy memo, final text, and diary event control.";
  if (/Published strategy/i.test(row.type)) return "PRD-35, NSC drafting file, clearance memoranda, circulation copy, or editorial-note bridge.";
  return "Item-level source record that proves date, authorship, routing, and relevance.";
}

function volumeBoundary(row) {
  const text = `${row.title} ${row.tags}`.toLowerCase();
  if (/nato|europe|ukraine/.test(text)) return "Keep alliance doctrine, process, or architecture here; route implementation detail to Europe/NATO volumes.";
  if (/russia|g-7|g-8|summit/.test(text)) return "Use summit architecture and broad strategy here; route bilateral negotiations to topical volumes.";
  if (/terror|crime|cyber|infrastructure|transnational/.test(text)) return "Keep foundational threat framing here; route operations and implementation to functional volumes.";
  if (/un|peace operations/.test(text)) return "Keep multilateral doctrine here; route country or peacekeeping implementation to topical volumes.";
  if (/diary/i.test(row.type)) return "Do not treat schedule control as decision evidence without a paired substantive record.";
  return "Use only if it explains the administration's foundational framework, interagency process, or public doctrine.";
}

function chronologyTriageRows() {
  return parseChronologyRows().map((row, index) => ({
    sequence: index + 1,
    date: row.date,
    title: row.title,
    evidence_role: evidenceRole(row),
    recommended_use: recommendedUse(row),
    source_note_action: sourceNoteAction(row),
    pair_before_promotion: pairBeforePromotion(row),
    next_pull: row.next_pull,
    volume_boundary: volumeBoundary(row),
    source: row.source,
    url: row.url
  }));
}

function updateChronologySummary() {
  const rows = parseChronologyRows();
  const declassifiedCount = rows.filter((row) => /declassified/i.test(row.type)).length;
  chronologySummary.textContent = `${rows.length} chronology controls shown; ${declassifiedCount} declassified Daily Diary file-unit controls in sequence`;
  exportChronologyButton.disabled = rows.length === 0;
  if (chronologyTriageSummary && exportChronologyTriageButton) {
    const triageRows = chronologyTriageRows();
    const conditionedCount = triageRows.filter((row) => /after|before|until|pair|source packet|baseline/i.test(row.recommended_use)).length;
    chronologyTriageSummary.textContent = `${triageRows.length} triage rows; ${conditionedCount} carry source-packet, pairing, or boundary instructions`;
    exportChronologyTriageButton.disabled = triageRows.length === 0;
  }
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadChronologyCsv() {
  const rows = parseChronologyRows();
  const lines = [
    chronologyFields.join(","),
    ...rows.map((row) => chronologyFields.map((field) => csvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-document-chronology.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadChronologyTriageCsv() {
  const rows = chronologyTriageRows();
  const lines = [
    triageFields.join(","),
    ...rows.map((row) => triageFields.map((field) => csvEscape(row[field])).join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clinton-foundations-chronology-triage.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

exportChronologyButton.addEventListener("click", downloadChronologyCsv);
exportChronologyTriageButton?.addEventListener("click", downloadChronologyTriageCsv);
new MutationObserver(updateChronologySummary).observe(chronologyRoot, { childList: true });
updateChronologySummary();
