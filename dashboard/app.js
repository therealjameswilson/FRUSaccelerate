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
    title: "Add metadata, annotation, and TEI QA assists",
    summary:
      "Target repetitive descriptive work such as glossary support, person and term lists, entity extraction, and preflight checks ahead of publication."
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
  heroEyebrow: document.querySelector("#heroEyebrow"),
  heroHeadline: document.querySelector("#heroHeadline"),
  heroSubhead: document.querySelector("#heroSubhead"),
  heroSummary: document.querySelector("#heroSummary"),
  heroHighlights: document.querySelector("#heroHighlights"),
  pressureGrid: document.querySelector("#pressureGrid"),
  generatedAtLabel: document.querySelector("#generatedAtLabel"),
  guardrailList: document.querySelector("#guardrailList"),
  projectGrid: document.querySelector("#projectGrid"),
  ideaFamilyGrid: document.querySelector("#ideaFamilyGrid"),
  findingGrid: document.querySelector("#findingGrid"),
  programPanel: document.querySelector("#programPanel"),
  precedentList: document.querySelector("#precedentList"),
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
    '<div class="empty-state">The portal could not load its data. Make sure you are running `npm run dashboard` from this project.</div>';
});

async function init() {
  const reportUrl = new URL("../reports/frus-ai-opportunities.json", window.location.href);
  const contextUrl = new URL("../data/frus-context.json", window.location.href);
  const [reportResponse, contextResponse] = await Promise.all([fetch(reportUrl), fetch(contextUrl)]);

  if (!reportResponse.ok || !contextResponse.ok) {
    throw new Error("Failed to load portal data.");
  }

  state.report = await reportResponse.json();
  state.context = await contextResponse.json();
  state.selectedUseCaseId = state.report.topUseCasesOverall[0]?.id || null;

  renderFrame();
  bindEvents();
  applyFilters();
}

function renderFrame() {
  renderHero();
  renderTopProjects();
  renderIdeaFamilies();
  renderFindings();
  renderProgramPanel();
  renderPrecedentList();
  renderPortfolio();
  renderStageTabs();
  renderRoadmap();
  renderAgencyList();
  populateFilters();
}

function renderHero() {
  const metrics = state.report.frusMetrics;
  const { portalNarrative, fiscalYearDeadline } = state.context;
  const cards = [
    ["Relevant use cases", state.report.relevantUseCaseCount],
    ["Volumes in declassification review", metrics.volumesInDeclassificationReview],
    ["Volumes in review for 5+ years", metrics.volumesInDeclassificationReviewFiveYearsOrMore],
    ["FY 2026 deadline", fiscalYearDeadline]
  ];

  elements.heroEyebrow.textContent = "FRUS AI Acceleration Portal";
  elements.heroHeadline.textContent = portalNarrative.headline;
  elements.heroSubhead.textContent = portalNarrative.subhead;
  elements.heroSummary.textContent = portalNarrative.summary;
  elements.heroHighlights.innerHTML = [
    `${state.report.relevantUseCaseCount} shortlisted federal precedents`,
    `${state.context.topProjectsFY26.length} projects scoped for ${fiscalYearDeadline}`,
    `${metrics.statusPageVolumesBeingCleared} volumes currently being cleared`,
    `${metrics.statusPageAnticipated2026Releases} anticipated 2026 releases on the status page`
  ]
    .map((item) => `<span class="chip neutral">${escapeHtml(item)}</span>`)
    .join("");

  elements.generatedAtLabel.textContent = formatDateTime(state.report.generatedAt);
  elements.pressureGrid.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="pressure-card">
          <span class="label">${escapeHtml(label)}</span>
          <strong class="metric ${typeof value === "number" ? "" : "metric-text"}">${escapeHtml(formatMetric(value))}</strong>
        </article>
      `
    )
    .join("");

  elements.guardrailList.innerHTML = guardrails.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderTopProjects() {
  elements.projectGrid.innerHTML = state.context.topProjectsFY26
    .map((project) => {
      const precedents = resolveUseCases(project.precedentIds);

      return `
        <article class="project-card">
          <div class="card-topline">
            <span class="rank-pill">#${project.rank}</span>
            <span class="chip neutral">${escapeHtml(project.deliveryWindow)}</span>
          </div>
          <div class="mini-list">
            ${project.stageIds.map((stageId) => stageChip(stageId)).join("")}
            <span class="chip alt">${escapeHtml(project.effort)}</span>
          </div>
          <div>
            <h3>${escapeHtml(project.name)}</h3>
            <p class="timing-line">${escapeHtml(project.deadline)} • ${escapeHtml(project.deliveryWindow)}</p>
          </div>
          <p class="summary-text">${escapeHtml(project.goal)}</p>
          <div class="project-split">
            <article class="project-note">
              <strong>Why achievable</strong>
              <p class="detail-copy">${escapeHtml(project.whyAchievable)}</p>
            </article>
            <article class="project-note">
              <strong>FRUS impact</strong>
              <p class="detail-copy">${escapeHtml(project.frusImpact)}</p>
            </article>
          </div>
          <div>
            <p class="detail-label">Pilot deliverables</p>
            <ul class="deliverable-list">
              ${project.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
          <div>
            <p class="detail-label">Federal precedents already in use</p>
            <div class="mini-list">
              ${precedents
                .map((item) => useCaseChipLink(item.id, "neutral-force", item.use_case_name))
                .join("")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderIdeaFamilies() {
  elements.ideaFamilyGrid.innerHTML = state.context.ideaFamilies
    .map((family) => {
      const precedents = resolveUseCases(family.precedentIds);

      return `
        <article class="idea-card">
          <div class="card-topline">
            <span class="card-badge">${family.stageIds.map(getStageTitle).join(" + ")}</span>
            <span class="chip neutral">${precedents.length} precedents</span>
          </div>
          <div>
            <h3>${escapeHtml(family.name)}</h3>
            <p class="card-copy">${escapeHtml(family.summary)}</p>
          </div>
          <p class="summary-text"><strong>Why it matters:</strong> ${escapeHtml(family.value)}</p>
          <div class="mini-list">
            ${precedents
              .map((item) => useCaseChipLink(item.id, item.classification, item.use_case_name))
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFindings() {
  elements.findingGrid.innerHTML = state.context.frusFindings
    .map(
      (item, index) => `
        <article class="finding-card">
          <span class="finding-index">0${index + 1}</span>
          <h3>${escapeHtml(item.headline)}</h3>
          <p class="card-copy">${escapeHtml(item.detail)}</p>
          <a class="text-link" href="${escapeHtml(item.sourceUrl)}">Open source</a>
        </article>
      `
    )
    .join("");
}

function renderProgramPanel() {
  const topProjects = state.context.topProjectsFY26.slice(0, 3);
  const precedents = collectPrecedentRecords();

  elements.programPanel.innerHTML = `
    <article class="program-card emphasis">
      <span class="program-label">Finish by</span>
      <h3>${escapeHtml(state.context.fiscalYearDeadline)}</h3>
      <p class="card-copy">
        Ship bounded pilots that reduce clearance drag, search friction, and descriptive backlog without replacing the current TEI-based workflow.
      </p>
    </article>
    <article class="program-card">
      <span class="program-label">Best first three</span>
      <div class="priority-list">
        ${topProjects
          .map(
            (project) => `
              <div class="priority-item">
                <strong>#${project.rank} ${escapeHtml(project.name)}</strong>
                <span>${escapeHtml(project.deliveryWindow)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
    <article class="program-card">
      <span class="program-label">Federal footing</span>
      <p class="card-copy">
        ${precedents.length} reusable federal precedents appear across the FY 2026 slate, with the strongest signals concentrated in NARA, DOJ, DHS, VA, and DOI.
      </p>
    </article>
  `;
}

function renderPrecedentList() {
  elements.precedentList.innerHTML = collectPrecedentRecords()
    .slice(0, 8)
    .map(({ useCase, projectNames, familyNames, totalMentions }) => {
      const labels = [
        `${totalMentions} mentions`,
        ...projectNames.slice(0, 2),
        ...familyNames.slice(0, 1)
      ];

      return `
        <article class="precedent-card">
          <div class="card-topline">
            ${useCaseChipLink(useCase.id, useCase.classification, useCase.use_case_name)}
            <span class="chip neutral">${escapeHtml(useCase.development_stage)}</span>
          </div>
          <h3>${escapeHtml(useCase.use_case_name)}</h3>
          <p class="card-copy">${escapeHtml(useCase.agency_name)}</p>
          <p class="summary-text">${escapeHtml(useCase.summary)}</p>
          <div class="mini-list">
            ${labels.map((label) => `<span class="chip neutral">${escapeHtml(label)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
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
              .map((example) => useCaseChipLink(example.id, example.classification, example.use_case_name))
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
    if (event.target.closest("a")) {
      return;
    }
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
            <span class="chip ${stageChipTone(bestStage?.stageId)}">${escapeHtml(bestStage?.title || "General fit")}</span>
            ${useCaseChipLink(item.id, "neutral-force", item.use_case_name)}
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
      <p class="detail-copy">${escapeHtml(selected.agency_name)} • ${escapeHtml(selected.development_stage)} • <a class="text-link" href="${useCaseUrl(selected.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(selected.id)}</a></p>
      <p class="summary-text">${escapeHtml(selected.summary)}</p>
    </article>
    <article class="detail-block">
      <strong>Stage fit</strong>
      <div class="detail-list">
        ${selected.stageRanking
          .map((stage) => `<span class="chip ${stageChipTone(stage.stageId)}">${escapeHtml(stage.title)} ${stage.score}</span>`)
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

function collectPrecedentRecords() {
  const records = new Map();

  for (const project of state.context.topProjectsFY26) {
    for (const precedentId of project.precedentIds) {
      const record = records.get(precedentId) || {
        id: precedentId,
        projectNames: [],
        familyNames: []
      };
      record.projectNames.push(project.name);
      records.set(precedentId, record);
    }
  }

  for (const family of state.context.ideaFamilies) {
    for (const precedentId of family.precedentIds) {
      const record = records.get(precedentId) || {
        id: precedentId,
        projectNames: [],
        familyNames: []
      };
      record.familyNames.push(family.name);
      records.set(precedentId, record);
    }
  }

  return [...records.values()]
    .map((record) => ({
      ...record,
      projectNames: uniqueValues(record.projectNames),
      familyNames: uniqueValues(record.familyNames),
      totalMentions: record.projectNames.length + record.familyNames.length,
      useCase: resolveUseCase(record.id)
    }))
    .filter((record) => record.useCase)
    .sort(
      (left, right) =>
        right.totalMentions - left.totalMentions ||
        right.useCase.overallScore - left.useCase.overallScore ||
        left.id.localeCompare(right.id)
    );
}

function resolveUseCases(ids) {
  return ids.map((id) => resolveUseCase(id)).filter(Boolean);
}

function resolveUseCase(id) {
  return state.report.relevantUseCases.find((item) => item.id === id) || state.report.topUseCasesOverall.find((item) => item.id === id);
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
  if (classification === "neutral-force") {
    return "neutral";
  }
  if (classification === "Generative AI") {
    return "";
  }
  if (classification === "NLP") {
    return "alt";
  }
  return "neutral";
}

function stageChipTone(stageId) {
  return Object.prototype.hasOwnProperty.call(stageTone, stageId) ? stageTone[stageId] : "neutral";
}

function stageChip(stageId) {
  return `<span class="chip ${stageChipTone(stageId)}">${escapeHtml(getStageTitle(stageId))}</span>`;
}

function getStageTitle(stageId) {
  return state.report.stageReports.find((stage) => stage.stageId === stageId)?.title || toTitleCase(stageId);
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMetric(value) {
  return typeof value === "number" ? value.toLocaleString() : value;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function useCaseUrl(id) {
  const query = encodeURIComponent(`"${id}"`);
  return `https://github.com/ombegov/2025-Federal-Agency-AI-Use-Case-Inventory/search?q=${query}&type=code`;
}

function useCaseChipLink(id, classification, title, extraClass) {
  const tone = pickChipTone(classification);
  const cls = ["chip", "chip-link", tone, extraClass].filter(Boolean).join(" ");
  const href = useCaseUrl(id);
  const safeTitle = title ? ` title="${escapeHtml(title)}"` : "";
  return `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer"${safeTitle}>${escapeHtml(id)}</a>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
