const lanes = [
  {
    id: "official-frame",
    title: "Official Frame",
    status: "Planned",
    lead: "Use the volume page and status page as the boundary anchor before building any source queue.",
    actions: ["Record current FRUS status", "Separate published facts from inferred chapter needs"]
  },
  {
    id: "usia-state",
    title: "USIA-State Reorganization",
    status: "Institutional",
    lead: "Track USIA, the Under Secretary for Public Diplomacy and Public Affairs, IIP, ECA, and State transition files.",
    actions: ["Pull USIA and Evelyn Lieberman batches", "Keep core organization policy in Volumes II-III"]
  },
  {
    id: "broadcasting",
    title: "International Broadcasting",
    status: "Program",
    lead: "VOA, RFE/RL, Radio Marti, BBG, and PDD-68 show operational public diplomacy and information strategy.",
    actions: ["Start with VOA and International Broadcasting batches", "Flag audience-impact evidence"]
  },
  {
    id: "public-line",
    title: "Presidential Public Line",
    status: "Message",
    lead: "Speechwriter, public papers, press guidance, and NSC clearance trails explain how foreign-policy arguments became public.",
    actions: ["Pull speechwriter files", "Pair public statements with internal memoranda"]
  },
  {
    id: "culture-exchanges",
    title: "Culture and Exchanges",
    status: "Program",
    lead: "Culture, exchange, and visitor programs document public diplomacy beyond crisis messaging.",
    actions: ["Review Culture and Diplomacy conference files", "Look for exchange-program decision records"]
  },
  {
    id: "regional-campaigns",
    title: "Regional Campaigns",
    status: "Boundary",
    lead: "Kosovo, Serbia, Northern Ireland, Cuba, China, Africa, and counterterrorism can supply public diplomacy documents while policy decisions stay in adjacent volumes.",
    actions: ["Capture public-diplomacy records only", "Route policy substance to regional desks"]
  },
  {
    id: "audience-reaction",
    title: "Audience and Media Reaction",
    status: "Evidence",
    lead: "Foreign media reaction, polling, audience research, embassy reporting, and public affairs cables test whether a message had foreign-policy significance.",
    actions: ["Search RG 59 and State archive", "Prioritize records with foreign audience evidence"]
  },
  {
    id: "source-notes",
    title: "Source-Note Readiness",
    status: "Editorial",
    lead: "Every candidate needs repository, collection, series, file unit, and release facts before it becomes a volume-ready item.",
    actions: ["Keep item IDs in tracking fields", "Draft provenance only after file-level review"]
  }
];

const sources = [
  {
    id: "frus-v14",
    title: "FRUS 1993-2000, Volume XIV, Public Diplomacy",
    repository: "Office of the Historian",
    lane: "Official Frame",
    priority: "first",
    period: "1993-2000",
    status: "Planned",
    url: "https://history.state.gov/historicaldocuments/frus1993-00v14",
    coverage:
      "Official volume placeholder. It states that the current status of the volume is planned.",
    useFor: "Volume title, official citation target, and status language.",
    trackingNote:
      "Use this as the public-facing spine until the published table of contents exists."
  },
  {
    id: "frus-status",
    title: "Status of the Foreign Relations Series",
    repository: "Office of the Historian",
    lane: "Official Frame",
    priority: "first",
    period: "Series-wide",
    status: "Reference",
    url: "https://history.state.gov/historicaldocuments/status-of-the-series",
    coverage:
      "Series status page listing Volume XIV under the planned 1993-2000 volumes.",
    useFor: "Current production status and adjacent-volume comparison.",
    trackingNote:
      "Recheck before publication claims; status pages change."
  },
  {
    id: "clinton-public-diplomacy",
    title: "FOIA 2006-0200-F - Public Diplomacy",
    repository: "Clinton Digital Library",
    lane: "Official Frame",
    priority: "first",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14560",
    coverage:
      "Clinton Library public diplomacy batch with records that can seed the initial document-candidate register.",
    useFor: "Core batch pull, people list, and first-pass source-note examples.",
    trackingNote:
      "Verify folder-level provenance from the PDFs or item metadata before drafting final notes."
  },
  {
    id: "pdd-68",
    title: "FOIA 2006-0207-F - PDD-68 - Concerning International Public Information",
    repository: "Clinton Digital Library",
    lane: "International Broadcasting",
    priority: "first",
    period: "1999",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14495",
    coverage:
      "Presidential decision directive material concerning international public information.",
    useFor: "Policy architecture for international information work and public diplomacy coordination.",
    trackingNote:
      "Treat as a core policy file; compare with State and NSC implementation records."
  },
  {
    id: "clinton-usia",
    title: "FOIA 2006-0208-F - United States Information Agency",
    repository: "Clinton Digital Library",
    lane: "USIA-State Reorganization",
    priority: "first",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14474",
    coverage:
      "USIA-specific Clinton Library batch for institutional, policy, and transition evidence.",
    useFor: "USIA baseline, transition records, and names for authority control.",
    trackingNote:
      "Separate USIA organization evidence from public diplomacy policy evidence."
  },
  {
    id: "lieberman-uspd",
    title: "FOIA 2006-0199-F - Evelyn Lieberman as Under Secretary for Public Diplomacy, 1999-2001",
    repository: "Clinton Digital Library",
    lane: "USIA-State Reorganization",
    priority: "first",
    period: "1999-2001",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14490",
    coverage:
      "Files associated with Evelyn Lieberman during the transition into State public diplomacy leadership.",
    useFor: "Late-Clinton institutional transition, early public diplomacy leadership, and program continuity.",
    trackingNote:
      "Watch the 2001 edge; include only Clinton-period records unless transition context is essential."
  },
  {
    id: "voa",
    title: "FOIA 2006-0165-F - Voice of America",
    repository: "Clinton Digital Library",
    lane: "International Broadcasting",
    priority: "first",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14542",
    coverage:
      "Voice of America batch for broadcasting, public communication, and foreign audience records.",
    useFor: "Broadcasting chapter candidates and program-evidence cross-checks.",
    trackingNote:
      "Look for policy-level decisions rather than routine programming records."
  },
  {
    id: "international-broadcasting",
    title: "FOIA 2006-0202-F - International Broadcasting/Board for International Broadcasting",
    repository: "Clinton Digital Library",
    lane: "International Broadcasting",
    priority: "first",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14493",
    coverage:
      "International broadcasting and board-related records for governance, policy, and program oversight.",
    useFor: "Board and broadcast governance records, especially when tied to foreign-policy crises.",
    trackingNote:
      "Crosswalk with VOA, RFE/RL, Radio Marti, and PDD-68."
  },
  {
    id: "rfe-rl",
    title: "FOIA 2006-0203-F - Radio Free Europe/Radio Liberty",
    repository: "Clinton Digital Library",
    lane: "International Broadcasting",
    priority: "second",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14473",
    coverage:
      "RFE/RL batch for post-Cold War broadcasting questions, regional audiences, and institutional governance.",
    useFor: "Broadcast policy candidates and Europe/Russia boundary checks.",
    trackingNote:
      "Route substantive Russia or Europe policy decisions to those volumes."
  },
  {
    id: "radio-marti",
    title: "FOIA 2006-0204-F - Radio Marti",
    repository: "Clinton Digital Library",
    lane: "Regional Campaigns",
    priority: "second",
    period: "1993-2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14494",
    coverage:
      "Radio Marti batch for Cuba-facing broadcasting, public diplomacy, and policy boundary questions.",
    useFor: "Cuba public diplomacy candidates and broadcasting governance.",
    trackingNote:
      "Do not pull Cuba policy substance unless the document turns on public diplomacy."
  },
  {
    id: "culture-diplomacy",
    title: "FOIA 2006-0201-F - White House Conference on Culture and Diplomacy",
    repository: "Clinton Digital Library",
    lane: "Culture and Exchanges",
    priority: "second",
    period: "2000",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14492",
    coverage:
      "Culture and diplomacy conference material that can broaden the volume beyond crisis-response messaging.",
    useFor: "Cultural diplomacy, exchange framing, and public diplomacy strategy.",
    trackingNote:
      "Prefer records with policy approval, interagency coordination, or international audience design."
  },
  {
    id: "ring-around-serbia",
    title: "FOIA 2006-0206-F - Ring Around Serbia",
    repository: "Clinton Digital Library",
    lane: "Regional Campaigns",
    priority: "second",
    period: "1990s",
    status: "Released batch",
    url: "https://clinton.presidentiallibraries.us/items/show/14544",
    coverage:
      "A Balkans-facing public diplomacy lead that may capture information operations around Serbia.",
    useFor: "Kosovo/Serbia public diplomacy candidates and boundary testing against Balkans volumes.",
    trackingNote:
      "Treat as public diplomacy only when the document is about audience strategy or information work."
  },
  {
    id: "speechwriters",
    title: "Clinton Speechwriter FOIA Batches",
    repository: "Clinton Digital Library",
    lane: "Presidential Public Line",
    priority: "first",
    period: "1993-2000",
    status: "Released batches",
    url: "https://clinton.presidentiallibraries.us/items/show/14572",
    coverage:
      "Speechwriter files such as Carolyn Curiel, Michael Waldman, David Shipley, Lowell Weiss, Ted Widmer, Heather Hurlburt, and Paul Orzulak.",
    useFor: "Public-line drafting trails, foreign-policy argument, and speech clearance leads.",
    trackingNote:
      "Use public papers to identify candidate speeches, then pull speechwriter records for drafts and clearance."
  },
  {
    id: "state-public-diplomacy-archive",
    title: "Department of State Archive - Public Diplomacy",
    repository: "Department of State",
    lane: "Audience and Media Reaction",
    priority: "context",
    period: "1997-2001",
    status: "Archived web",
    url: "https://1997-2001.state.gov/global/pd/",
    coverage:
      "Archived State public diplomacy web material from the late Clinton period.",
    useFor: "Public-facing program names, offices, and terminology to use in archival searches.",
    trackingNote:
      "Use as context and terminology; prefer archival records for final documentary selections."
  },
  {
    id: "rg306",
    title: "NARA Record Group 306 - Records of the U.S. Information Agency",
    repository: "National Archives",
    lane: "USIA-State Reorganization",
    priority: "first",
    period: "1953-1999",
    status: "Record group guide",
    url: "https://www.archives.gov/research/guide-fed-records/groups/306.html",
    coverage:
      "National Archives guide to USIA records, essential for locating agency-level public diplomacy records.",
    useFor: "Record-group routing, series names, and pull-slip planning.",
    trackingNote:
      "Catalog URLs and NAIDs stay in tracking fields until file-level source notes are verified."
  },
  {
    id: "rg59",
    title: "NARA Record Group 59 - General Records of the Department of State",
    repository: "National Archives",
    lane: "Audience and Media Reaction",
    priority: "first",
    period: "1789-present",
    status: "Record group guide",
    url: "https://www.archives.gov/research/guide-fed-records/groups/059.html",
    coverage:
      "State Department record group guide for cables, public affairs, embassy reporting, and policy files.",
    useFor: "State public affairs, embassy reaction, and foreign audience evidence.",
    trackingNote:
      "Expect public diplomacy evidence to be distributed across regional and functional State records."
  },
  {
    id: "public-papers",
    title: "Public Papers of the Presidents - William J. Clinton",
    repository: "GovInfo",
    lane: "Presidential Public Line",
    priority: "context",
    period: "1993-2001",
    status: "Published record",
    url: "https://www.govinfo.gov/app/collection/ppp",
    coverage:
      "Official public statements, remarks, exchanges, and messages for Clinton administration public-line checks.",
    useFor: "Speech targets, chronology pivots, and public/private comparison.",
    trackingNote:
      "Published remarks are a starting point; the volume needs internal records behind them."
  },
  {
    id: "reform-act",
    title: "Foreign Affairs Reform and Restructuring Act of 1998",
    repository: "Congress.gov",
    lane: "USIA-State Reorganization",
    priority: "context",
    period: "1998",
    status: "Statutory context",
    url: "https://www.congress.gov/105/plaws/publ277/PLAW-105publ277.pdf",
    coverage:
      "Statutory background for the reorganization that folded USIA functions into State.",
    useFor: "Date controls, institutional boundary notes, and organization-volume crosswalk.",
    trackingNote:
      "Use for context; final document selections should come from executive-branch records."
  }
];

const chronology = [
  {
    date: "January 1993",
    title: "Clinton administration begins with USIA still separate",
    detail:
      "Establish the inherited public diplomacy architecture before tracking reform or message campaigns."
  },
  {
    date: "1994-1995",
    title: "Early crisis and peace-process public diplomacy",
    detail:
      "Search Balkans, Haiti, Northern Ireland, and Middle East files for public diplomacy documents that shaped foreign audiences."
  },
  {
    date: "1997",
    title: "Late-Clinton State web archive begins",
    detail:
      "Use archived State public diplomacy terminology to seed searches in State and Clinton Library records."
  },
  {
    date: "1998",
    title: "Foreign Affairs Reform and Restructuring Act",
    detail:
      "Mark the legal framework for USIA-State integration and keep organization records distinct from public diplomacy selections."
  },
  {
    date: "1999",
    title: "PDD-68 and international public information",
    detail:
      "Treat PDD-68 material as a core policy candidate for the information-strategy chapter."
  },
  {
    date: "October 1999",
    title: "USIA functions transfer into State",
    detail:
      "Use USIA and Evelyn Lieberman batches to track transition, continuity, and new public diplomacy leadership."
  },
  {
    date: "2000",
    title: "Culture and diplomacy closeout",
    detail:
      "Conference and speechwriter records can show how the administration framed public diplomacy at the end of the term."
  }
];

const queueItems = [
  {
    title: "Verify official status and volume boundary",
    sourceId: "frus-v14",
    priority: "first",
    why: "The page is a planned-volume placeholder, so the assist page must not imply a published document corpus.",
    steps: ["Save current status-page language", "List adjacent Clinton organization/global/regional volumes"]
  },
  {
    title: "Pull the Public Diplomacy FOIA batch",
    sourceId: "clinton-public-diplomacy",
    priority: "first",
    why: "This is the most direct Clinton Library batch for a first document-candidate register.",
    steps: ["Download item PDFs", "Extract titles, dates, authors, recipients, folders, and release paths"]
  },
  {
    title: "Build the PDD-68 mini-dossier",
    sourceId: "pdd-68",
    priority: "first",
    why: "PDD-68 can anchor the policy architecture for international public information.",
    steps: ["Identify directive, staff papers, implementation memoranda", "Crosswalk with NSC and State records"]
  },
  {
    title: "Map USIA and integration records",
    sourceId: "clinton-usia",
    priority: "first",
    why: "The volume needs USIA records but must avoid becoming an organization-and-management volume.",
    steps: ["Separate public diplomacy decisions from structure-only records", "Capture names for authority control"]
  },
  {
    title: "Sort broadcasting batches by decision value",
    sourceId: "international-broadcasting",
    priority: "first",
    why: "Broadcasting files are high volume; selection should favor policy choices, crises, audiences, and interagency review.",
    steps: ["Review VOA, RFE/RL, Radio Marti, and BBG-related files", "Flag routine programming for exclusion"]
  },
  {
    title: "Pair speeches with internal drafts",
    sourceId: "speechwriters",
    priority: "first",
    why: "Public speeches become FRUS-worthy when drafts, clearances, or strategy memos show foreign-policy intent.",
    steps: ["Use public papers to identify candidate remarks", "Pull corresponding speechwriter folders"]
  }
];

const recipes = [
  {
    title: "Clinton Library public diplomacy sweep",
    target: "Clinton Library",
    query: '"public diplomacy" OR USIA OR "international public information" OR PDD-68 OR "Voice of America"'
  },
  {
    title: "USIA transition",
    target: "Clinton Digital Library",
    query: '"United States Information Agency" "Evelyn Lieberman" "Under Secretary for Public Diplomacy"'
  },
  {
    title: "Broadcasting governance",
    target: "Clinton Digital Library",
    query: '"International Broadcasting" OR "Board for International Broadcasting" OR "Radio Free Europe" OR "Radio Liberty" OR "Radio Marti"'
  },
  {
    title: "Speechwriter foreign-policy line",
    target: "Clinton Digital Library",
    query: 'speechwriter Kosovo NATO China Northern Ireland Cuba Africa "public diplomacy"'
  },
  {
    title: "State audience evidence",
    target: "NARA/State",
    query: '"public affairs" "media reaction" "foreign media" "public diplomacy" "American Embassy" Clinton'
  },
  {
    title: "Volume boundary check",
    target: "FRUS status page",
    query: '"1993-2000" "Public Diplomacy" "Organization and Management" "Global Issues"'
  }
];

const boundaries = [
  {
    title: "Organization and Management, Volumes II-III",
    rule: "Keep structural reform, personnel, and institutional design there unless the document turns on public diplomacy substance.",
    tests: ["Does the record discuss public audiences, messages, programs, or information policy?", "Could it stand without a reorganization chapter?"]
  },
  {
    title: "Regional Policy Volumes",
    rule: "Balkans, Cuba, Northern Ireland, China, Africa, and Russia policy choices belong in regional volumes unless the public diplomacy method is the document's point.",
    tests: ["Is the main action a regional policy decision?", "Is the public diplomacy element only implementation?"]
  },
  {
    title: "Domestic Politics",
    rule: "Campaign, public opinion, and domestic messaging records need foreign-policy audience evidence before inclusion.",
    tests: ["Is the target audience foreign?", "Does an agency or embassy treat the message as diplomacy?"]
  },
  {
    title: "Routine Program Administration",
    rule: "Broadcast schedules, exchange logistics, and conference planning should be excluded unless senior review or policy choice is visible.",
    tests: ["Is there a decision, conflict, clearance, or strategic rationale?", "Does the record explain why the program mattered?"]
  }
];

const sourceNoteSkeleton = `Repository or originating agency, record group/collection, series, file unit or item title, document title/date, classification and handling, release or declassification facts.

Tracking fields outside note prose:
- Public URL or item ID
- NAID or catalog URL
- Local filename or extraction path
- Search query that found the item
- Compiler disposition and boundary rationale`;

const sourceRoot = document.querySelector("#source-root");
const sourceSummary = document.querySelector("#source-summary");
const repositoryFilter = document.querySelector("#repository-filter");
const laneFilter = document.querySelector("#lane-filter");
const priorityFilter = document.querySelector("#priority-filter");
const sourceSearch = document.querySelector("#source-search");

function normalize(value) {
  return String(value || "").toLowerCase();
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, values, allLabel) {
  if (!select) return;
  select.replaceChildren(
    new Option(allLabel, ""),
    ...values.map((value) => new Option(value, value))
  );
}

function sourceText(source) {
  return [
    source.title,
    source.repository,
    source.lane,
    source.priority,
    source.period,
    source.status,
    source.coverage,
    source.useFor,
    source.trackingNote
  ].join(" ");
}

function filteredSources() {
  const query = normalize(sourceSearch?.value);
  const repository = repositoryFilter?.value || "";
  const lane = laneFilter?.value || "";
  const priority = priorityFilter?.value || "";

  return sources.filter((source) => {
    if (repository && source.repository !== repository) return false;
    if (lane && source.lane !== lane) return false;
    if (priority && source.priority !== priority) return false;
    if (query && !normalize(sourceText(source)).includes(query)) return false;
    return true;
  });
}

function createChip(text) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = text;
  return chip;
}

function renderStats() {
  document.querySelector("#source-count").textContent = sources.length.toString();
  document.querySelector("#lane-count").textContent = lanes.length.toString();
  document.querySelector("#queue-count").textContent = queueItems.length.toString();
  document.querySelector("#gap-count").textContent = boundaries.length.toString();
}

function renderLanes() {
  const root = document.querySelector("#lanes-root");
  if (!root) return;
  root.replaceChildren(
    ...lanes.map((lane) => {
      const card = document.createElement("article");
      card.className = "lane-card";

      const status = document.createElement("span");
      status.textContent = lane.status;

      const title = document.createElement("h3");
      title.textContent = lane.title;

      const lead = document.createElement("p");
      lead.textContent = lane.lead;

      const list = document.createElement("ul");
      for (const action of lane.actions) {
        const item = document.createElement("li");
        item.textContent = action;
        list.append(item);
      }

      card.append(status, title, lead, list);
      return card;
    })
  );
}

function renderSources() {
  if (!sourceRoot || !sourceSummary) return;
  const visible = filteredSources();
  sourceSummary.textContent = `Showing ${visible.length} of ${sources.length} source anchors.`;

  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No sources match the current filters.";
    sourceRoot.replaceChildren(empty);
    return;
  }

  sourceRoot.replaceChildren(
    ...visible.map((source) => {
      const card = document.createElement("article");
      card.className = "source-card";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = source.repository;

      const title = document.createElement("h3");
      title.textContent = source.title;

      const chips = document.createElement("div");
      chips.className = "chips";
      chips.append(
        createChip(source.lane),
        createChip(source.priority === "first" ? "First pull" : source.priority === "second" ? "Second pass" : "Context"),
        createChip(source.period),
        createChip(source.status)
      );

      const coverage = document.createElement("p");
      coverage.textContent = source.coverage;

      const useFor = document.createElement("p");
      useFor.textContent = `Use for: ${source.useFor}`;

      const tracking = document.createElement("p");
      tracking.textContent = `Tracking note: ${source.trackingNote}`;

      const link = document.createElement("a");
      link.className = "button secondary";
      link.href = source.url;
      link.rel = "noreferrer";
      link.textContent = "Open source";

      card.append(meta, title, chips, coverage, useFor, tracking, link);
      return card;
    })
  );
}

function renderChronology() {
  const root = document.querySelector("#chronology-root");
  if (!root) return;
  root.replaceChildren(
    ...chronology.map((item) => {
      const row = document.createElement("article");
      row.className = "timeline-item";

      const date = document.createElement("div");
      date.className = "timeline-date";
      date.textContent = item.date;

      const body = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = item.title;
      const detail = document.createElement("p");
      detail.textContent = item.detail;
      body.append(title, detail);

      row.append(date, body);
      return row;
    })
  );
}

function sourceById(id) {
  return sources.find((source) => source.id === id);
}

function renderQueue() {
  const root = document.querySelector("#queue-root");
  if (!root) return;
  root.replaceChildren(
    ...queueItems.map((queue) => {
      const source = sourceById(queue.sourceId);
      const item = document.createElement("article");
      item.className = "queue-item";

      const body = document.createElement("div");
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = queue.priority === "first" ? "First pull" : "Second pass";

      const title = document.createElement("h3");
      title.textContent = queue.title;

      const why = document.createElement("p");
      why.textContent = queue.why;

      const list = document.createElement("ul");
      for (const step of queue.steps) {
        const li = document.createElement("li");
        li.textContent = step;
        list.append(li);
      }

      body.append(meta, title, why, list);

      const link = document.createElement("a");
      link.className = "button secondary";
      link.href = source?.url || "#sources";
      link.rel = "noreferrer";
      link.textContent = "Open";

      item.append(body, link);
      return item;
    })
  );
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      const original = button.textContent;
      button.textContent = "Copied";
      button.dataset.copied = "true";
      window.setTimeout(() => {
        button.textContent = original;
        delete button.dataset.copied;
      }, 1300);
    }
  } catch {
    window.prompt("Copy this text", text);
  }
}

function renderRecipes() {
  const root = document.querySelector("#recipes-root");
  if (!root) return;
  root.replaceChildren(
    ...recipes.map((recipe) => {
      const card = document.createElement("article");
      card.className = "recipe-card";

      const title = document.createElement("h3");
      title.textContent = recipe.title;

      const target = document.createElement("p");
      target.textContent = `Target: ${recipe.target}`;

      const code = document.createElement("code");
      code.textContent = recipe.query;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Copy query";
      button.addEventListener("click", () => copyText(recipe.query, button));

      card.append(title, target, code, button);
      return card;
    })
  );
}

function renderBoundaries() {
  const root = document.querySelector("#boundaries-root");
  if (!root) return;
  root.replaceChildren(
    ...boundaries.map((boundary) => {
      const card = document.createElement("article");
      card.className = "boundary-card";

      const label = document.createElement("span");
      label.textContent = "Boundary check";

      const title = document.createElement("h3");
      title.textContent = boundary.title;

      const rule = document.createElement("p");
      rule.textContent = boundary.rule;

      const list = document.createElement("ul");
      for (const test of boundary.tests) {
        const item = document.createElement("li");
        item.textContent = test;
        list.append(item);
      }

      card.append(label, title, rule, list);
      return card;
    })
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function downloadSourcesCsv() {
  const fields = ["id", "title", "repository", "lane", "priority", "period", "status", "url", "coverage", "useFor", "trackingNote"];
  const rows = [fields.join(",")];
  for (const source of filteredSources()) {
    rows.push(fields.map((field) => csvEscape(source[field])).join(","));
  }
  const blob = new Blob([`${rows.join("\n")}\n`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "frus-1993-2000-v14-public-diplomacy-sources.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function compilerHandoffText() {
  const firstPull = queueItems.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  return [
    "FRUS 1993-2000, Volume XIV: Public Diplomacy",
    "Assist page: " + new URL(".", window.location.href).href,
    "Official volume: https://history.state.gov/historicaldocuments/frus1993-00v14",
    "Official status: Planned, per the Office of the Historian status page.",
    "",
    "Start order:",
    firstPull,
    "",
    "Review rule: keep the page source-first. Item IDs and URLs are tracking fields; finished source notes need repository, collection, series, file unit, classification, and release facts.",
    "",
    "Boundary rule: public diplomacy records can touch regional and functional crises, but policy decisions belong in the adjacent FRUS volume unless audience strategy or information policy is the document's point."
  ].join("\n");
}

function bindControls() {
  fillSelect(repositoryFilter, uniqueValues(sources, "repository"), "All repositories");
  fillSelect(laneFilter, uniqueValues(sources, "lane"), "All lanes");

  for (const control of [sourceSearch, repositoryFilter, laneFilter, priorityFilter]) {
    control?.addEventListener("input", renderSources);
    control?.addEventListener("change", renderSources);
  }

  document.querySelector("#clear-filters")?.addEventListener("click", () => {
    if (sourceSearch) sourceSearch.value = "";
    if (repositoryFilter) repositoryFilter.value = "";
    if (laneFilter) laneFilter.value = "";
    if (priorityFilter) priorityFilter.value = "";
    renderSources();
  });

  document.querySelector("#download-sources")?.addEventListener("click", downloadSourcesCsv);

  document.querySelector("#source-note-skeleton").textContent = sourceNoteSkeleton;
  document.querySelector("#copy-source-note")?.addEventListener("click", (event) => {
    copyText(sourceNoteSkeleton, event.currentTarget);
  });

  document.querySelector("[data-compiler-handoff]")?.addEventListener("click", (event) => {
    copyText(compilerHandoffText(), event.currentTarget);
  });
}

function init() {
  renderStats();
  renderLanes();
  bindControls();
  renderSources();
  renderChronology();
  renderQueue();
  renderRecipes();
  renderBoundaries();
}

init();
