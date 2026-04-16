const stageTone = {
  planning: "alt",
  research: "neutral",
  clearance: "",
  publication: "alt"
};

const roadmap = [
  {
    phase: "Now",
    title: "Pilot clearance and redaction triage",
    summary:
      "Use FOIA-style review assistance on a bounded set of declassification and redaction tasks, where FRUS delay is most measurable today."
  },
  {
    phase: "Next",
    title: "Stand up a semantic research workbench",
    summary:
      "Unify prior FRUS volumes, finding aids, and planning artifacts into a search layer that reduces historian discovery time without changing editorial authority."
  },
  {
    phase: "Then",
    title: "Add metadata and annotation copilots",
    summary:
      "Target repetitive descriptive work such as glossary support, person and term lists, entity extraction, and born-digital indexing."
  }
];

const guardrails = [
  "Keep historians and declassification reviewers in the loop for all release decisions.",
  "Use AI to rank, summarize, and draft, not to publish unreviewed text.",
  "Prioritize pilots that fit FRUS's TEI and eXist publication stack instead of replacing it."
];

const state = {
  report: null,
  context: null,
  filteredUseCases: [],
  selectedStageId: "clearance",
  selectedUseCaseId: null,
  filters: {
    search: "",
    stage: "all",
    classification: "all",
    agency: "all",
    sort: "score"
  }
};

const elements = {
  pressureGrid: document.querySelector("#pressureGrid"),
  generatedAtLabel: document.querySelector("#generatedAtLabel"),
  guardrailList: document.querySelector("#guardrailList"),
  portfolioGrid: document.querySelector("#portfolioGrid"),
  stageTabs: document.querySelector("#stageTabs"),
  stageSpotlight: document.querySelector("#stageSpotlight"),
  roadmap: document.querySelector("#roadmap"),
  agencyList: document.querySelector("#agencyList"),
  detailPanel: document.querySelector("#detailPanel"),
  searchInput: document.querySelector("#searchInput"),
  stageFilter: document.querySelector("#stageFilter"),
  classificationFilter: document.querySelector("#classificationFilter"),
  agencyFilter: document.querySelector("#agencyFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  resultsMeta: document.querySelector("#resultsMeta"),
  opportunityGrid: document.querySelector("#opportunityGrid")
};

init().catch((error) => {
  console.error(error);
  elements.opportunityGrid.innerHTML =
    '<div class="empty-state">The dashboard could not load its data. Make sure you are running `npm run dashboard` from this project.</div>';
});

async function init() {
  const reportUrl = new URL("../reports/frus-ai-opportunities.json", window.location.href);
  const contextUrl = new URL("../data/frus-context.json", window.location.href);
  const [reportResponse, contextResponse] = await Promise.all([
    fetch(reportUrl),
    fetch(contextUrl)
  ]);

  state.report = await reportResponse.json();
  state.context = await contextResponse.json();
  state.selectedUseCaseId = state.report.topUseCasesOverall[0]?.id || null;

  renderFrame();
  bindEvents();
  applyFilters();
}

function renderFrame() {
  renderHero();
  renderPortfolio();
  renderStageTabs();
  renderRoadmap();
  renderAgencyList();
  populateFilters();
}

function renderHero() {
  const metrics = state.report.frusMetrics;
  const cards = [
    ["Relevant use cases", state.report.relevantUseCaseCount],
    ["Volumes in declassification review", metrics.volumesInDeclassificationReview],
    ["Volumes in review for 5+ years", metrics.volumesInDeclassificationReviewFiveYearsOrMore],
    ["Published FRUS volumes online", metrics.publishedVolumesHostedOnline]
  ];

  elements.generatedAtLabel.textContent = formatDateTime(state.report.generatedAt);
  elements.pressureGrid.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="pressure-card">
          <span class="label">${escapeHtml(label)}</span>
          <strong class="metric">${Number(value).toLocaleString()}</strong>
        </article>
      `
    )
    .join("");

  elements.guardrailList.innerHTML = guardrails.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderPortfolio() {
  elements.portfolioGrid.innerHTML = state.report.portfolioRecommendations
    .map(
      (item) => `
        <article class="portfolio-card">
          <div class="card-topline">
            <span class="card-badge">${item.stageIds.map(toTitleCase).join(" + ")}</span>
            <span class="chip neutral">${item.exemplars.length} precedents</span>
          </div>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p class="card-copy">${escapeHtml(item.why)}</p>
          </div>
          <p class="summary-text"><strong>FRUS benefit:</strong> ${escapeHtml(item.frusBenefit)}</p>
          <div class="mini-list">
            ${item.exemplars
              .slice(0, 3)
              .map((example) => `<span class="chip ${pickChipTone(example.classification)}">${escapeHtml(example.id)}</span>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderStageTabs() {
  const stageReports = state.report.stageReports;
  elements.stageTabs.innerHTML = stageReports
    .map(
      (stage) => `
        <button
          class="stage-tab"
          type="button"
          data-stage-id="${stage.stageId}"
          role="tab"
          aria-selected="${String(stage.stageId === state.selectedStageId)}"
        >
          <strong>${escapeHtml(stage.title)}</strong>
          <span>${escapeHtml(stage.description)}</span>
        </button>
      `
    )
    .join("");

  renderStageSpotlight();
}

function renderStageSpotlight() {
  const stage = state.report.stageReports.find((entry) => entry.stageId === state.selectedStageId);
  if (!stage) {
    return;
  }

  const relatedPortfolio = state.report.portfolioRecommendations.find((item) => item.stageIds.includes(stage.stageId));

  elements.stageSpotlight.innerHTML = `
    <h3>${escapeHtml(stage.title)}</h3>
    <p class="spotlight-meta">${escapeHtml(stage.description)}</p>
    ${
      relatedPortfolio
        ? `<div class="detail-block">
            <strong>Recommended move</strong>
            <p class="detail-copy">${escapeHtml(relatedPortfolio.name)}. ${escapeHtml(relatedPortfolio.frusBenefit)}</p>
          </div>`
        : ""
    }
    <div class="spotlight-grid">
      ${stage.topMatches
        .slice(0, 4)
        .map(
          (match) => `
            <article class="opportunity-card" data-opportunity-id="${escapeHtml(match.id)}" tabindex="0">
              <div class="card-topline">
                <span class="score-pill">${match.overallScore}</span>
                <span class="chip ${pickChipTone(match.classification)}">${escapeHtml(match.classification)}</span>
              </div>
              <div>
                <h3>${escapeHtml(match.use_case_name)}</h3>
                <p class="card-copy">${escapeHtml(match.agency)} • ${escapeHtml(match.development_stage)}</p>
              </div>
              <p class="summary-text">${escapeHtml(match.summary)}</p>
              <div class="mini-list">
                ${match.matchedThemes.map((theme) => `<span class="chip neutral">${escapeHtml(theme)}</span>`).join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderRoadmap() {
  elements.roadmap.innerHTML = roadmap
    .map(
      (item) => `
        <article class="roadmap-card">
          <span class="phase">${escapeHtml(item.phase)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
        </article>
      `
    )
    .join("");
}

function renderAgencyList() {
  const maxCount = Math.max(...state.report.agencyHighlights.map((entry) => entry.count), 1);
  elements.agencyList.innerHTML = state.report.agencyHighlights
    .slice(0, 6)
    .map(
      (entry) => `
        <article class="agency-row">
          <div>
            <strong>${escapeHtml(entry.agency)}</strong>
            <span>${entry.count} shortlisted use cases • avg score ${entry.averageScore}</span>
            <div class="agency-bar"><i style="width:${(entry.count / maxCount) * 100}%"></i></div>
          </div>
        </article>
      `
    )
    .join("");
}

function populateFilters() {
  fillSelect(elements.stageFilter, [
    ["all", "All stages"],
    ...state.report.stageReports.map((stage) => [stage.stageId, stage.title])
  ]);

  fillSelect(elements.classificationFilter, [
    ["all", "All classifications"],
    ...uniqueValues(state.report.relevantUseCases.map((item) => item.classification)).map((value) => [value, value])
  ]);

  fillSelect(elements.agencyFilter, [
    ["all", "All agencies"],
    ...uniqueValues(state.report.relevantUseCases.map((item) => item.agency_name)).map((value) => [value, value])
  ]);
}

function bindEvents() {
  elements.stageTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage-id]");
    if (!button) {
      return;
    }

    state.selectedStageId = button.dataset.stageId;
    renderStageTabs();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  elements.stageFilter.addEventListener("change", (event) => {
    state.filters.stage = event.target.value;
    applyFilters();
  });

  elements.classificationFilter.addEventListener("change", (event) => {
    state.filters.classification = event.target.value;
    applyFilters();
  });

  elements.agencyFilter.addEventListener("change", (event) => {
    state.filters.agency = event.target.value;
    applyFilters();
  });

  elements.sortFilter.addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    applyFilters();
  });

  document.addEventListener("click", (event) => {
    const opportunity = event.target.closest("[data-opportunity-id]");
    if (!opportunity) {
      return;
    }

    state.selectedUseCaseId = opportunity.dataset.opportunityId;
    renderOpportunityGrid();
    renderDetailPanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const opportunity = event.target.closest("[data-opportunity-id]");
    if (!opportunity) {
      return;
    }

    event.preventDefault();
    state.selectedUseCaseId = opportunity.dataset.opportunityId;
    renderOpportunityGrid();
    renderDetailPanel();
  });
}

function applyFilters() {
  const filtered = state.report.relevantUseCases
    .filter((item) => {
      if (state.filters.search) {
        const haystack = [
          item.use_case_name,
          item.agency_name,
          item.id,
          item.classification,
          item.summary,
          ...(item.matchedThemes || []),
          ...(item.stageRanking || []).map((stage) => stage.title)
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(state.filters.search)) {
          return false;
        }
      }

      if (state.filters.stage !== "all" && !(item.stageRanking || []).some((stage) => stage.stageId === state.filters.stage)) {
        return false;
      }

      if (state.filters.classification !== "all" && item.classification !== state.filters.classification) {
        return false;
      }

      if (state.filters.agency !== "all" && item.agency_name !== state.filters.agency) {
        return false;
      }

      return true;
    })
    .sort(sortUseCases);

  state.filteredUseCases = filtered;

  if (!filtered.some((item) => item.id === state.selectedUseCaseId)) {
    state.selectedUseCaseId = filtered[0]?.id || null;
  }

  renderOpportunityGrid();
  renderResultsMeta();
  renderDetailPanel();
}

function renderResultsMeta() {
  const total = state.report.relevantUseCases.length;
  const shown = state.filteredUseCases.length;
  elements.resultsMeta.innerHTML = `
    <span>${shown.toLocaleString()} of ${total.toLocaleString()} shortlisted use cases</span>
    <span>${state.filters.stage === "all" ? "All FRUS stages" : `Filtered for ${toTitleCase(state.filters.stage)}`}</span>
  `;
}

function renderOpportunityGrid() {
  if (state.filteredUseCases.length === 0) {
    elements.opportunityGrid.innerHTML =
      '<div class="empty-state">No use cases match the current filters. Try widening the stage or agency scope.</div>';
    return;
  }

  elements.opportunityGrid.innerHTML = state.filteredUseCases
    .slice(0, 24)
    .map((item) => {
      const selectedClass = item.id === state.selectedUseCaseId ? "is-selected" : "";
      const bestStage = item.stageRanking[0];
      return `
        <article class="opportunity-card ${selectedClass}" data-opportunity-id="${escapeHtml(item.id)}" tabindex="0">
          <div class="card-topline">
            <span class="score-pill">${item.overallScore}</span>
            <span class="chip ${pickChipTone(item.classification)}">${escapeHtml(item.classification)}</span>
          </div>
          <div>
            <h3>${escapeHtml(item.use_case_name)}</h3>
            <p class="card-copy">${escapeHtml(item.agency_name)} • ${escapeHtml(item.development_stage)}</p>
          </div>
          <div class="mini-list">
            <span class="chip ${stageTone[bestStage?.stageId] || "neutral"}">${escapeHtml(bestStage?.title || "General fit")}</span>
            <span class="chip neutral">${escapeHtml(item.id)}</span>
          </div>
          <p class="summary-text">${escapeHtml(item.summary)}</p>
          <div class="theme-list">
            ${item.matchedThemes.slice(0, 3).map((theme) => `<span class="chip neutral">${escapeHtml(theme)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDetailPanel() {
  const selected = state.report.relevantUseCases.find((item) => item.id === state.selectedUseCaseId);
  if (!selected) {
    elements.detailPanel.innerHTML = '<p class="detail-empty">Select a card below to inspect its fit, stage alignment, and themes.</p>';
    return;
  }

  const relatedPortfolio = state.report.portfolioRecommendations.filter((item) =>
    item.exemplars.some((example) => example.id === selected.id)
  );

  elements.detailPanel.innerHTML = `
    <article class="detail-block">
      <div class="card-topline">
        <span class="score-pill">${selected.overallScore}</span>
        <span class="chip ${pickChipTone(selected.classification)}">${escapeHtml(selected.classification)}</span>
      </div>
      <h3>${escapeHtml(selected.use_case_name)}</h3>
      <p class="detail-copy">${escapeHtml(selected.agency_name)} • ${escapeHtml(selected.development_stage)} • ${escapeHtml(selected.id)}</p>
      <p class="summary-text">${escapeHtml(selected.summary)}</p>
    </article>
    <article class="detail-block">
      <strong>Stage fit</strong>
      <div class="detail-list">
        ${selected.stageRanking
          .map((stage) => `<span class="chip ${stageTone[stage.stageId] || "neutral"}">${escapeHtml(stage.title)} ${stage.score}</span>`)
          .join("")}
      </div>
    </article>
    <article class="detail-block">
      <strong>Themes</strong>
      <div class="detail-list">
        ${selected.matchedThemes.map((theme) => `<span class="chip neutral">${escapeHtml(theme)}</span>`).join("")}
      </div>
    </article>
    <article class="detail-block">
      <strong>Signal strength</strong>
      <div class="detail-list">
        <span class="chip neutral">Document signals ${selected.documentSignalCount}</span>
        <span class="chip neutral">Archival signals ${selected.archivalSpecificCount}</span>
      </div>
    </article>
    ${
      relatedPortfolio.length
        ? `<article class="detail-block">
            <strong>Appears in portfolio</strong>
            <div class="detail-list">
              ${relatedPortfolio.map((item) => `<span class="chip alt">${escapeHtml(item.name)}</span>`).join("")}
            </div>
          </article>`
        : ""
    }
  `;
}

function sortUseCases(left, right) {
  switch (state.filters.sort) {
    case "agency":
      return left.agency_name.localeCompare(right.agency_name) || right.overallScore - left.overallScore;
    case "classification":
      return left.classification.localeCompare(right.classification) || right.overallScore - left.overallScore;
    case "stage":
      return (right.stageRanking[0]?.score || 0) - (left.stageRanking[0]?.score || 0) || right.overallScore - left.overallScore;
    case "score":
    default:
      return right.overallScore - left.overallScore;
  }
}

function fillSelect(select, options) {
  select.innerHTML = options
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function pickChipTone(classification) {
  if (classification === "Generative AI") {
    return "";
  }
  if (classification === "NLP") {
    return "alt";
  }
  return "neutral";
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
