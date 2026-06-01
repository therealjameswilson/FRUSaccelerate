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

exportLibraryPullsButton.addEventListener("click", downloadLibraryPullCsv);
new MutationObserver(updateLibraryPullSummary).observe(libraryPullRoot, { childList: true });
updateLibraryPullSummary();
