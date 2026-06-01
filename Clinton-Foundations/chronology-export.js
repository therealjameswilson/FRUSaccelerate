const chronologyRoot = document.querySelector("#document-chronology-root");
const chronologySummary = document.querySelector("#document-chronology-summary");
const exportChronologyButton = document.querySelector("#export-document-chronology");

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

function updateChronologySummary() {
  const rows = parseChronologyRows();
  const declassifiedCount = rows.filter((row) => /declassified/i.test(row.type)).length;
  chronologySummary.textContent = `${rows.length} chronology controls shown; ${declassifiedCount} declassified Daily Diary file-unit controls in sequence`;
  exportChronologyButton.disabled = rows.length === 0;
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

exportChronologyButton.addEventListener("click", downloadChronologyCsv);
new MutationObserver(updateChronologySummary).observe(chronologyRoot, { childList: true });
updateChronologySummary();
