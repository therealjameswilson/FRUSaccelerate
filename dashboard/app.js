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

const riskRegister = [
  {
    severity: "High",
    title: "Draft outputs may be over-trusted",
    summary: "Historians or reviewers may accept plausible but incomplete machine suggestions too quickly.",
    mitigation: "Require accept/reject workflows, visible provenance, and benchmark sets before any operational rollout."
  },
  {
    severity: "High",
    title: "State-specific clearance logic is not generic FOIA logic",
    summary: "Federal precedents help, but FRUS still needs a State- and equity-aware review frame for classified historical material.",
    mitigation: "Start with ranking and retrieval, not auto-release, and tune pilots on reviewed FRUS exemplars."
  },
  {
    severity: "Medium",
    title: "Weak evaluation baselines could waste time",
    summary: "If the pilots start without measurable before/after metrics, leadership will not know which tools are actually helping.",
    mitigation: "Use bounded pilot sets with time-to-complete, recall, acceptance-rate, and rework metrics."
  },
  {
    severity: "Medium",
    title: "Integration drag could swamp quick wins",
    summary: "Over-engineering the stack would erase the advantage of bounded pilots.",
    mitigation: "Keep the first releases read-only or preflight-only and integrate into existing TEI, review, and planning workflows gradually."
  },
  {
    severity: "Medium",
    title: "Data preparation may become the hidden bottleneck",
    summary: "Corpus cleanup, OCR normalization, and citation alignment can consume more time than model work.",
    mitigation: "Choose pilots that reuse already-digitized chapters, existing finding aids, and released FRUS text first."
  }
];

const stateSpecificGaps = [
  {
    status: "Needs new State-specific layer",
    title: "Classification equity and declassification routing",
    summary:
      "Federal FOIA and archival precedents help, but FRUS needs routing logic that reflects State, NSC, intelligence, and interagency historical equities.",
    projectIds: ["frus-clearance-triage-assistant", "precedent-comparator", "release-readiness-cockpit"]
  },
  {
    status: "Adapt existing pattern",
    title: "TEI-aware editorial structures",
    summary:
      "Metadata and QA use cases exist, but FRUS still needs checks that understand TEI document structures, references, annotations, and release packaging.",
    projectIds: ["metadata-autofill-source-packets", "tei-qa-assistant", "release-readiness-cockpit"]
  },
  {
    status: "Adapt existing pattern",
    title: "Historian-grade citation and provenance control",
    summary:
      "Drafting assistants must anchor every suggestion in cited source packets, released volumes, or finding aids instead of generic language-model recall.",
    projectIds: ["semantic-frus-research-workbench", "annotation-draft-copilot", "precedent-comparator"]
  },
  {
    status: "Borrow mostly directly",
    title: "Descriptive backlog reduction",
    summary:
      "NARA and DHS already show strong models for metadata enrichment, topic extraction, and catalog-like description generation.",
    projectIds: ["metadata-autofill-source-packets", "index-glossary-builder", "tei-qa-assistant"]
  },
  {
    status: "Needs policy alignment",
    title: "Chapter-based publication sequencing",
    summary:
      "FRUS is already moving toward incremental release, but the operational rules for what ships first still need an agreed planning framework.",
    projectIds: ["release-readiness-cockpit", "index-glossary-builder", "semantic-frus-research-workbench"]
  },
  {
    status: "Needs tailored language support",
    title: "Diplomatic and foreign-language terminology",
    summary:
      "OCR and translation precedents exist, but FRUS needs historian-facing handling of diplomatic terminology, names, transliteration, and editorial conventions.",
    projectIds: ["ocr-translation-lane", "annotation-draft-copilot", "index-glossary-builder"]
  }
];

const sampleOutputs = [
  {
    id: "clearance-triage",
    projectId: "frus-clearance-triage-assistant",
    title: "Clearance triage queue",
    kicker: "Pilot 1",
    description:
      "A reviewer-facing queue that scores passages, surfaces likely equities, and preserves a human approval trail.",
    artifactLabel: "Reviewer snapshot",
    lines: [
      { label: "High-risk passages", value: "14 across 3 chapters" },
      { label: "Likely equities", value: "CIA, INR, White House" },
      { label: "Suggested action", value: "Hold 2 passages, redact 5, clear 7" }
    ],
    notes: [
      "Every suggestion is accept/reject with rationale.",
      "Prior-release matches appear beside the risky text.",
      "Audit logs support later validation and governance review."
    ]
  },
  {
    id: "semantic-research",
    projectId: "semantic-frus-research-workbench",
    title: "Semantic research workbench",
    kicker: "Pilot 2",
    description:
      "A bounded search layer over prior FRUS volumes, planning notes, and finding aids with citation-first retrieval.",
    artifactLabel: "Historian query",
    lines: [
      { label: "Prompt", value: "Show prior FRUS coverage of Middle East shuttle diplomacy and intelligence equities." },
      { label: "Top hits", value: "4 FRUS volumes, 2 finding aids, 1 planning memo" },
      { label: "Why returned", value: "Shared actors, dates, and diplomatic themes" }
    ],
    notes: [
      "Every result links back to a source volume or finding aid.",
      "Clusters expose related chapters rather than isolated hits.",
      "The interface stays read-only in the initial pilot."
    ]
  },
  {
    id: "metadata-autofill",
    projectId: "metadata-autofill-source-packets",
    title: "Metadata autofill packet",
    kicker: "Pilot 3",
    description:
      "Draft descriptive metadata for packets and chapter releases with editor review before publication.",
    artifactLabel: "Editor review queue",
    lines: [
      { label: "Suggested title", value: "Memorandum of Conversation on Nuclear Signaling" },
      { label: "Entities found", value: "3 officials, 2 agencies, 5 topics" },
      { label: "Status", value: "Editor accepted 8 of 10 metadata fields" }
    ],
    notes: [
      "Human editors approve or revise every field.",
      "Entity extraction feeds born-digital index work.",
      "Structured output can flow directly into TEI-adjacent review."
    ]
  }
];

const timelineMilestones = [
  {
    id: "april-may",
    label: "April-May 2026",
    phase: "Frame",
    summary: "Pick pilot corpora, define evaluation baselines, and secure historian and reviewer owners.",
    projectIds: ["frus-clearance-triage-assistant", "semantic-frus-research-workbench", "metadata-autofill-source-packets"]
  },
  {
    id: "june",
    label: "June 2026",
    phase: "Wave 1",
    summary: "Launch the highest-yield pilots on clearance, semantic retrieval, and metadata drafting.",
    projectIds: ["frus-clearance-triage-assistant", "semantic-frus-research-workbench", "metadata-autofill-source-packets"]
  },
  {
    id: "july",
    label: "July 2026",
    phase: "Wave 2",
    summary: "Expand to precedent comparison, clustering, TEI QA, and born-digital indexing where the data is already ready.",
    projectIds: ["index-glossary-builder", "precedent-comparator", "dedup-and-clustering", "tei-qa-assistant"]
  },
  {
    id: "august",
    label: "August 2026",
    phase: "Wave 3",
    summary: "Add annotation drafting, OCR/translation intake, and chapter release routing after the first evaluation loop.",
    projectIds: ["annotation-draft-copilot", "ocr-translation-lane", "release-readiness-cockpit"]
  },
  {
    id: "september",
    label: "September 2026",
    phase: "Decision",
    summary: "Measure outcomes, package the brief, and choose what moves from pilot into the next fiscal year operating plan.",
    projectIds: ["frus-clearance-triage-assistant", "semantic-frus-research-workbench", "release-readiness-cockpit"]
  }
];

const projectBlueprints = {
  "frus-clearance-triage-assistant": {
    owner: "Historical Office editors and declassification coordinators",
    partners: ["Reviewer representatives", "FOIA/privacy counsel", "Digital support"],
    valueScore: 96,
    feasibilityScore: 82,
    wave: "Wave 1",
    timelineWindow: "May-June 2026",
    pilotBoundary: "Use two already-digitized chapters and one long-stalled review queue as the initial benchmark set.",
    borrowedPattern:
      "Borrow archival PII screening and FOIA production ranking patterns, but keep release judgment entirely with human reviewers.",
    stateGapStatus: "Needs State-specific tailoring",
    stateGapSummary:
      "The model must learn State and interagency historical equity patterns rather than generic public-release logic.",
    dependencies: [
      "Digitized chapters with known historical review outcomes",
      "Passage-level tagging rubric for sensitive content",
      "Reviewer feedback capture for accepted and rejected suggestions"
    ],
    successMetrics: [
      "Reduce low-risk reviewer touch time by at least 25 percent in the pilot set",
      "Surface most historically known sensitive passages before manual review",
      "Maintain a complete audit trail of model suggestions and reviewer decisions"
    ],
    evidence: [
      {
        title: "The bottleneck is already documented",
        summary:
          "The 2025 Report to Congress names declassification as the single greatest obstacle to meeting FRUS's statutory timeline.",
        sourceUrl: "https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf"
      },
      {
        title: "There is a close federal analogue",
        summary:
          "NARA's archival PII-screening pilot shows that archival screening and redaction ranking is already under way in the federal inventory.",
        precedentIds: ["NARA - 0005", "DOJ-0295"]
      }
    ]
  },
  "semantic-frus-research-workbench": {
    owner: "FRUS historians and digital initiatives staff",
    partners: ["HistoryAtState developers", "Reference archivists", "Planning leads"],
    valueScore: 92,
    feasibilityScore: 78,
    wave: "Wave 1",
    timelineWindow: "May-July 2026",
    pilotBoundary: "Index a bounded corpus of prior FRUS volumes, one planning memo set, and selected finding aids in read-only mode.",
    borrowedPattern:
      "Borrow semantic archival retrieval patterns while enforcing source-citation-first historian review.",
    stateGapStatus: "Adapt existing pattern",
    stateGapSummary:
      "The retrieval layer must be tuned to FRUS naming conventions, citation habits, and series planning materials.",
    dependencies: [
      "A bounded, citation-ready FRUS corpus",
      "Stable links back to volumes and finding aids",
      "Evaluation prompts from historians doing real volume planning"
    ],
    successMetrics: [
      "Cut time to first relevant source cluster on pilot tasks",
      "Return cited sources for the majority of accepted historian queries",
      "Improve discovery of comparable prior FRUS coverage and planning artifacts"
    ],
    evidence: [
      {
        title: "FRUS already has reusable digital sources",
        summary:
          "HistoryAtState publishes canonical TEI sources with stable identifiers, which makes them suitable for a bounded retrieval layer.",
        sourceUrl: "https://github.com/HistoryAtState/frus"
      },
      {
        title: "NARA is already piloting this pattern",
        summary:
          "NARA's semantic search and natural-language archival access use cases are the closest mission analogue in the federal inventory.",
        precedentIds: ["NARA - 0006", "NARA - 0013", "DOI-0053"]
      }
    ]
  },
  "metadata-autofill-source-packets": {
    owner: "FRUS editors and publication staff",
    partners: ["Metadata librarians", "TEI editors", "Digital publication engineers"],
    valueScore: 86,
    feasibilityScore: 88,
    wave: "Wave 1",
    timelineWindow: "June-July 2026",
    pilotBoundary: "Apply draft metadata generation only to source packets and chapter release assets that are already editorially selected.",
    borrowedPattern:
      "Borrow archival description and metadata generation patterns that are already underway at NARA and DHS.",
    stateGapStatus: "Borrow mostly directly",
    stateGapSummary:
      "Most of the technique is transferable, but field mapping still has to match FRUS publication and TEI expectations.",
    dependencies: [
      "A review queue for editor acceptance and revision",
      "Field-level mapping between output suggestions and FRUS metadata needs",
      "Entity and topic extraction rules for diplomatic material"
    ],
    successMetrics: [
      "Reduce time spent drafting descriptive metadata per packet",
      "Improve completeness of packet and chapter metadata fields",
      "Feed accepted entities into index and glossary work"
    ],
    evidence: [
      {
        title: "The descriptive backlog pattern already exists federally",
        summary:
          "NARA's metadata and summarization pilots are directly aimed at making digital collections discoverable faster.",
        precedentIds: ["NARA - 0007", "NARA - 0008", "DHS-2540"]
      },
      {
        title: "FRUS publication depends on metadata quality",
        summary:
          "HistoryAtState's digital stack already relies on structured publication assets, which makes metadata quality a real throughput issue rather than a cosmetic one.",
        sourceUrl: "https://history.state.gov/developer"
      }
    ]
  },
  "index-glossary-builder": {
    owner: "Publication editors and index/glossary support",
    partners: ["Historians", "Digital publication team"],
    valueScore: 82,
    feasibilityScore: 76,
    wave: "Wave 2",
    timelineWindow: "July-August 2026",
    pilotBoundary: "Generate draft born-digital index terms and glossary candidates for a small set of chapters already slated for release.",
    borrowedPattern:
      "Borrow entity extraction and metadata enrichment for born-digital back matter rather than trying to automate final index judgment.",
    stateGapStatus: "Adapt existing pattern",
    stateGapSummary:
      "Final inclusion rules for named people, organizations, and terms remain editorial decisions tied to FRUS conventions.",
    dependencies: [
      "Accepted entity extraction from packet or chapter text",
      "Editorial rules for when an entity becomes an index entry",
      "Chapter-level release set to test the born-digital workflow"
    ],
    successMetrics: [
      "Produce usable first-pass index candidate lists for pilot chapters",
      "Reduce time spent assembling born-digital glossary and term lists",
      "Keep false positive rates within editor-manageable bounds"
    ],
    evidence: [
      {
        title: "FRUS is already moving toward born-digital indexes",
        summary:
          "The 2025 FRUS reporting notes the first born-digital indexes and chapter-by-chapter publication practices.",
        sourceUrl: "https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf"
      },
      {
        title: "Federal entity extraction precedents are mature enough to borrow",
        summary:
          "NARA's topic summarizer and related tagging pilots provide a strong template for draft index extraction.",
        precedentIds: ["NARA - 0008", "NARA - 0002", "NASA-870"]
      }
    ]
  },
  "annotation-draft-copilot": {
    owner: "FRUS historians and annotation editors",
    partners: ["Research editors", "Digital support"],
    valueScore: 80,
    feasibilityScore: 72,
    wave: "Wave 3",
    timelineWindow: "August-September 2026",
    pilotBoundary: "Generate first-pass drafts only for annotations and summaries tied to already-selected documents and clearly cited background sources.",
    borrowedPattern:
      "Borrow summarization and drafting support, but keep acceptance, wording, and citation decisions entirely with historians.",
    stateGapStatus: "Needs historian-grade controls",
    stateGapSummary:
      "Draft generation is only safe if every suggestion is linked to source passages and supporting citations.",
    dependencies: [
      "A bounded set of already-selected documents",
      "Supporting citation retrieval into prior FRUS or reference notes",
      "Editorial rubric for acceptable first-pass draft structure"
    ],
    successMetrics: [
      "Reduce historian time spent on repetitive annotation boilerplate",
      "Keep every accepted draft anchored in cited supporting material",
      "Show measurable acceptance or heavy-edit rates during pilot review"
    ],
    evidence: [
      {
        title: "Research stage explicitly includes annotation and review",
        summary:
          "FRUS stage descriptions on history.state.gov make annotation part of the existing research pipeline, so this project targets real historian workload.",
        sourceUrl: "https://history.state.gov/historicaldocuments/status-of-the-series"
      },
      {
        title: "Drafting precedents exist, but must stay human-in-the-loop",
        summary:
          "NARA and DHS use cases show that summarization and extraction can create useful first drafts without replacing final editorial authority.",
        precedentIds: ["NARA - 0008", "DHS-2454", "DOJ-0197"]
      }
    ]
  },
  "precedent-comparator": {
    owner: "Clearance reviewers and research editors",
    partners: ["FOIA/compliance advisors", "Digital retrieval support"],
    valueScore: 84,
    feasibilityScore: 74,
    wave: "Wave 2",
    timelineWindow: "July-August 2026",
    pilotBoundary: "Limit the first version to retrieval over released FRUS material and comparable precedent records with no automatic clearance decision-making.",
    borrowedPattern:
      "Borrow FOIA production and precedent-comparison logic to cut time spent rediscovering similar prior release outcomes.",
    stateGapStatus: "Needs State-specific tailoring",
    stateGapSummary:
      "The comparator must surface analogues without claiming that FOIA and FRUS release contexts are interchangeable.",
    dependencies: [
      "A corpus of released FRUS text and comparable prior handling",
      "Similarity scoring tuned to diplomatic text and recurring names",
      "Reviewer-facing interface that preserves rationale capture"
    ],
    successMetrics: [
      "Reduce time spent locating comparable prior releases",
      "Increase consistency across repeated reviewer decisions",
      "Show that reviewers find the comparable-case panel useful in practice"
    ],
    evidence: [
      {
        title: "Reviewers repeatedly face analogous text and decisions",
        summary:
          "FRUS delay is concentrated in interagency review, so surfacing prior release handling has a direct chance to reduce repeat labor.",
        sourceUrl: "https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf"
      },
      {
        title: "Federal FOIA tooling already combines redaction and discovery support",
        summary:
          "DOJ and NTSB precedents show comparable retrieval, redaction support, and FOIA review acceleration patterns already in government use.",
        precedentIds: ["DOJ-0295", "NARA - 0011", "NTSB-0004"]
      }
    ]
  },
  "dedup-and-clustering": {
    owner: "Research editors and digital records staff",
    partners: ["Historians", "Review queue managers"],
    valueScore: 76,
    feasibilityScore: 84,
    wave: "Wave 2",
    timelineWindow: "July-August 2026",
    pilotBoundary: "Run offline over selected document batches so historians can inspect clusters before anything changes in the production flow.",
    borrowedPattern:
      "Borrow e-discovery and duplicate-identification patterns to reduce manual sorting and near-duplicate review.",
    stateGapStatus: "Borrow mostly directly",
    stateGapSummary:
      "The main State-specific work is aligning clustering with how FRUS source packets are assembled, not inventing a new capability.",
    dependencies: [
      "A pilot batch with known duplicate or near-duplicate behavior",
      "Similarity thresholds tuned to documentary record structure",
      "Historian review criteria for distinct versus redundant records"
    ],
    successMetrics: [
      "Reduce manual sorting time for candidate packets",
      "Flag near duplicates early enough to improve packet assembly",
      "Keep useful cluster quality high enough for editor trust"
    ],
    evidence: [
      {
        title: "Clustering is already common in e-discovery-like federal use cases",
        summary:
          "DOJ and VA use cases show clustering and duplicate detection as well-understood patterns in records-heavy environments.",
        precedentIds: ["DOJ-0295", "VA-25-3275", "DOJ-0197"]
      },
      {
        title: "FRUS research effort is document-heavy and packet-based",
        summary:
          "Because FRUS research and review rely on document selection and comparison, clustering offers a bounded productivity gain without changing editorial authority.",
        sourceUrl: "https://history.state.gov/historicaldocuments/status-of-the-series"
      }
    ]
  },
  "ocr-translation-lane": {
    owner: "Historians and language/OCR support",
    partners: ["Digitization staff", "Reference archivists"],
    valueScore: 74,
    feasibilityScore: 70,
    wave: "Wave 3",
    timelineWindow: "August-September 2026",
    pilotBoundary: "Apply only to a selected set of scanned or foreign-language material that is currently slowing historian review.",
    borrowedPattern:
      "Borrow OCR and translation acceleration, but keep human validation for diplomatic terminology, names, and transliteration.",
    stateGapStatus: "Needs tailored language support",
    stateGapSummary:
      "Generic OCR and translation outputs are not enough for publication-quality diplomatic history work without historian correction.",
    dependencies: [
      "A selected set of scanned or foreign-language records",
      "Confidence scoring and human review handoff",
      "Editorial conventions for names, places, and transliteration"
    ],
    successMetrics: [
      "Reduce time from discovery to readable review copy",
      "Track correction rates for OCR and translation drafts",
      "Show historian usefulness on targeted pilot sets"
    ],
    evidence: [
      {
        title: "This is a classic intake bottleneck, not a publishing gamble",
        summary:
          "The project targets the lag between archival discovery and usable historian text, which is well suited to a bounded pilot.",
        sourceUrl: "https://history.state.gov/historicaldocuments/status-of-the-series"
      },
      {
        title: "Federal OCR and translation precedents already exist",
        summary:
          "DHS and NARA use cases show that digitized record extraction and translation support are already in the government AI landscape.",
        precedentIds: ["DHS-2705", "DHS-2569", "NARA - 0005"]
      }
    ]
  },
  "tei-qa-assistant": {
    owner: "TEI editors and digital publication engineers",
    partners: ["Publication editors", "Quality reviewers"],
    valueScore: 78,
    feasibilityScore: 86,
    wave: "Wave 2",
    timelineWindow: "July-August 2026",
    pilotBoundary: "Run as a preflight advisory layer over TEI packages before release rather than as a publishing-system rewrite.",
    borrowedPattern:
      "Borrow AI-assisted data governance and metadata QA patterns, then adapt them to TEI completeness and publication readiness checks.",
    stateGapStatus: "Adapt existing pattern",
    stateGapSummary:
      "FRUS still needs TEI-specific structural and editorial completeness checks that generic metadata tools do not understand by default.",
    dependencies: [
      "Representative TEI packages with known quality issues",
      "A checklist of missing descriptions, references, and metadata gaps",
      "Preflight report format that editors can act on quickly"
    ],
    successMetrics: [
      "Catch avoidable TEI issues earlier in the release cycle",
      "Reduce late-stage cleanup work before chapter publication",
      "Keep false positives manageable for editors"
    ],
    evidence: [
      {
        title: "HistoryAtState already publishes through TEI and eXist",
        summary:
          "Because the publication stack is stable and explicit, advisory QA checks can plug into a known workflow instead of forcing replacement.",
        sourceUrl: "https://history.state.gov/developer"
      },
      {
        title: "Federal metadata governance tooling is already close",
        summary:
          "DOJ and DHS precedents show that metadata, tagging, and quality-oriented checks are already operationally credible patterns.",
        precedentIds: ["DOJ-0343", "DHS-2540", "DOJ-0197"]
      }
    ]
  },
  "release-readiness-cockpit": {
    owner: "FRUS leadership and publication schedulers",
    partners: ["Clearance coordinators", "Publication editors", "Planning leads"],
    valueScore: 88,
    feasibilityScore: 80,
    wave: "Wave 3",
    timelineWindow: "August-September 2026",
    pilotBoundary: "Start as a decision-support board over chapter status, blockers, and next-release sequencing without changing policy authority.",
    borrowedPattern:
      "Borrow workflow routing and backlog analytics, then adapt them to chapter-based release sequencing and inter-stage dependencies.",
    stateGapStatus: "Needs policy alignment",
    stateGapSummary:
      "The tooling is feasible, but release sequencing still needs agreed operational rules so the board reflects real decision authority.",
    dependencies: [
      "Reliable chapter and volume status inputs",
      "A shared taxonomy for blocked, review-ready, and publishable states",
      "Leadership agreement on what the cockpit is allowed to recommend"
    ],
    successMetrics: [
      "Expose which chapters can ship now without waiting on blocked material",
      "Improve visibility into blocked dependencies and queue health",
      "Support a more transparent next-release sequence for leadership review"
    ],
    evidence: [
      {
        title: "FRUS is already moving toward chapter-by-chapter release",
        summary:
          "The 2025 reporting explicitly notes the move to incremental chapter release, which makes routing and readiness views timely rather than hypothetical.",
        sourceUrl: "https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf"
      },
      {
        title: "Routing and governance precedents already exist",
        summary:
          "DOJ and DOI use cases show workflow routing and backlog-visibility patterns that can be adapted to FRUS sequencing decisions.",
        precedentIds: ["DOJ-0343", "NARA - 0005", "DOI-0053"]
      }
    ]
  }
};

const defaultComparatorIds = ["NARA - 0005", "NARA - 0008", "DOJ-0295"];

const state = {
  report: null,
  context: null,
  programProjects: [],
  precedentRecords: [],
  filteredUseCases: [],
  selectedStageId: "clearance",
  selectedUseCaseId: null,
  comparatorIds: [],
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
  orientationGrid: document.querySelector("#orientationGrid"),
  exportBriefButton: document.querySelector("#exportBriefButton"),
  projectGrid: document.querySelector("#projectGrid"),
  matrixBoard: document.querySelector("#matrixBoard"),
  matrixLegend: document.querySelector("#matrixLegend"),
  timelineRail: document.querySelector("#timelineRail"),
  workflowMapGrid: document.querySelector("#workflowMapGrid"),
  workflowSpotlight: document.querySelector("#workflowSpotlight"),
  sampleGrid: document.querySelector("#sampleGrid"),
  dossierList: document.querySelector("#dossierList"),
  compareSelect1: document.querySelector("#compareSelect1"),
  compareSelect2: document.querySelector("#compareSelect2"),
  compareSelect3: document.querySelector("#compareSelect3"),
  comparatorTable: document.querySelector("#comparatorTable"),
  ideaFamilyGrid: document.querySelector("#ideaFamilyGrid"),
  findingGrid: document.querySelector("#findingGrid"),
  programPanel: document.querySelector("#programPanel"),
  riskList: document.querySelector("#riskList"),
  gapList: document.querySelector("#gapList"),
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
  state.programProjects = state.context.topProjectsFY26.map(enrichProject);
  state.precedentRecords = collectPrecedentRecords();
  state.selectedUseCaseId = state.report.topUseCasesOverall[0]?.id || null;
  state.comparatorIds = defaultComparatorIds.filter((id) => state.precedentRecords.some((record) => record.id === id));

  if (state.comparatorIds.length < 3) {
    state.comparatorIds = state.precedentRecords.slice(0, 3).map((record) => record.id);
  }

  renderFrame();
  bindEvents();
  applyFilters();
}

function enrichProject(project) {
  return {
    ...project,
    ...(projectBlueprints[project.id] || {}),
    ideaFamilies: state.context?.ideaFamilies?.filter((family) =>
      family.stageIds.some((stageId) => project.stageIds.includes(stageId))
    ) || []
  };
}

function renderFrame() {
  renderHero();
  renderOrientation();
  renderTopProjects();
  renderMatrix();
  renderTimeline();
  renderWorkflowMap();
  renderSampleOutputs();
  renderDossiers();
  populateComparatorControls();
  renderComparator();
  renderIdeaFamilies();
  renderFindings();
  renderProgramPanel();
  renderRisks();
  renderGaps();
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
    `${state.programProjects.length} projects scoped for ${fiscalYearDeadline}`,
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

function renderOrientation() {
  const [firstProject, secondProject, thirdProject] = state.programProjects;
  const routes = [
    {
      step: "Route 1",
      audience: "Leadership",
      title: "Decide what to greenlight first",
      summary:
        "Use the ranked slate, the value x feasibility board, and the fiscal-year timeline to see what can genuinely ship by September 30, 2026.",
      emphasisLabel: "Read in order",
      emphasisText: "Top 10 projects, then the matrix, then the fiscal-year timeline.",
      highlights: [
        `${state.programProjects.length} scoped pilots`,
        `Lead with #${firstProject?.rank || 1} ${firstProject?.name || "FRUS Clearance Triage Assistant"}`
      ],
      links: [
        ["Open top 10", "#topProjects"],
        ["See matrix", "#deliveryMatrix"],
        ["View timeline", "#deliveryTimeline"]
      ]
    },
    {
      step: "Route 2",
      audience: "Historians and editors",
      title: "Inspect how the pilots fit real FRUS work",
      summary:
        "Move from the workflow map into sample outputs and pilot cards to understand what each pilot would do inside historian, clearance, and publication workflows.",
      emphasisLabel: "Best starting pilots",
      emphasisText: `Begin with ${firstProject?.name || "FRUS Clearance Triage Assistant"}, ${secondProject?.name || "Semantic FRUS Research Workbench"}, and ${thirdProject?.name || "Metadata Autofill for Source Packets"}.`,
      highlights: ["Workflow-first view", "Mock outputs included"],
      links: [
        ["Workflow map", "#workflowMap"],
        ["Sample outputs", "#sampleOutputs"],
        ["Open pilot cards", "#projectDossiers"]
      ]
    },
    {
      step: "Route 3",
      audience: "Builders and partners",
      title: "Trace the federal precedents and underlying evidence",
      summary:
        "Use the comparator, idea atlas, and full browser when you need to see which existing federal patterns are strongest and what still needs State-specific tailoring.",
      emphasisLabel: "Best evidence trail",
      emphasisText: "Start with the precedent comparator, then move into the idea atlas and the full use case browser.",
      highlights: [`${state.precedentRecords.length} reusable precedents`, "Click-through source links throughout"],
      links: [
        ["Compare precedents", "#precedentComparator"],
        ["View idea atlas", "#ideaAtlas"],
        ["Browse use cases", "#opportunityBrowser"]
      ]
    }
  ];

  elements.orientationGrid.innerHTML = routes
    .map(
      (route) => `
        <article class="orientation-card">
          <div class="card-topline">
            <span class="card-badge">${escapeHtml(route.step)}</span>
            <span class="chip neutral">${escapeHtml(route.audience)}</span>
          </div>
          <div>
            <h3>${escapeHtml(route.title)}</h3>
            <p class="card-copy">${escapeHtml(route.summary)}</p>
          </div>
          <div class="mini-list">
            ${route.highlights.map((item) => `<span class="chip alt">${escapeHtml(item)}</span>`).join("")}
          </div>
          <article class="project-note orientation-note">
            <strong>${escapeHtml(route.emphasisLabel)}</strong>
            <p class="detail-copy">${escapeHtml(route.emphasisText)}</p>
          </article>
          <div class="orientation-links">
            ${route.links
              .map(
                ([label, href]) => `
                  <a class="orientation-link" href="${escapeHtml(href)}">${escapeHtml(label)}</a>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderTopProjects() {
  elements.projectGrid.innerHTML = state.programProjects
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
            <span class="chip neutral">Value ${project.valueScore}</span>
            <span class="chip neutral">Feasibility ${project.feasibilityScore}</span>
          </div>
          <div>
            <h3>${escapeHtml(project.name)}</h3>
            <p class="timing-line">${escapeHtml(project.deadline)} • ${escapeHtml(project.deliveryWindow)} • ${escapeHtml(project.wave)}</p>
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
                .map((item) =>
                  useCaseAnchor(item, item.id, {
                    className: "chip neutral chip-link",
                    title: item.use_case_name
                  })
                )
                .join("")}
            </div>
          </div>
          <a class="text-link dossier-jump" href="#dossier-${escapeHtml(project.id)}">Open pilot card</a>
        </article>
      `;
    })
    .join("");
}

function renderMatrix() {
  elements.matrixBoard.innerHTML = `
    <div class="matrix-axes">
      <span class="matrix-axis-label matrix-axis-y">Value to FRUS</span>
      <span class="matrix-axis-label matrix-axis-x">Feasibility by September 30, 2026</span>
    </div>
    <div class="matrix-quadrant matrix-q1"><span>Invest Now</span></div>
    <div class="matrix-quadrant matrix-q2"><span>Strategic Bets</span></div>
    <div class="matrix-quadrant matrix-q3"><span>Quick Wins</span></div>
    <div class="matrix-quadrant matrix-q4"><span>Specialized Builds</span></div>
    ${state.programProjects
      .map(
        (project) => `
          <a
            class="matrix-point"
            href="#dossier-${escapeHtml(project.id)}"
            style="left:${positionScore(project.feasibilityScore)}%; bottom:${positionScore(project.valueScore)}%;"
            title="${escapeHtml(project.name)}"
          >
            <span class="matrix-point-rank">#${project.rank}</span>
            <span class="matrix-point-label">${escapeHtml(project.name)}</span>
          </a>
        `
      )
      .join("")}
  `;

  const categories = [
    ["Invest Now", (project) => project.valueScore >= 85 && project.feasibilityScore >= 78],
    ["Strategic Bets", (project) => project.valueScore >= 85 && project.feasibilityScore < 78],
    ["Quick Wins", (project) => project.valueScore < 85 && project.feasibilityScore >= 78],
    ["Specialized Builds", () => true]
  ];

  const assigned = new Set();
  elements.matrixLegend.innerHTML = categories
    .map(([label, predicate]) => {
      const projects = state.programProjects.filter((project) => {
        if (assigned.has(project.id)) {
          return false;
        }
        const match = predicate(project);
        if (match) {
          assigned.add(project.id);
        }
        return match;
      });

      return `
        <article class="legend-card">
          <strong>${escapeHtml(label)}</strong>
          <div class="mini-list">
            ${projects.map((project) => `<a class="chip neutral dossier-jump" href="#dossier-${escapeHtml(project.id)}">#${project.rank}</a>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTimeline() {
  elements.timelineRail.innerHTML = timelineMilestones
    .map(
      (item) => `
        <article class="timeline-card">
          <span class="phase">${escapeHtml(item.phase)}</span>
          <h3>${escapeHtml(item.label)}</h3>
          <p class="card-copy">${escapeHtml(item.summary)}</p>
          <div class="mini-list">
            ${item.projectIds
              .map((projectId) => getProject(projectId))
              .filter(Boolean)
              .map((project) => `<a class="chip neutral dossier-jump" href="#dossier-${escapeHtml(project.id)}">#${project.rank} ${escapeHtml(project.name)}</a>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderWorkflowMap() {
  elements.workflowMapGrid.innerHTML = state.report.stageReports
    .map((stage) => {
      const projectCount = state.programProjects.filter((project) => project.stageIds.includes(stage.stageId)).length;
      const familyCount = state.context.ideaFamilies.filter((family) => family.stageIds.includes(stage.stageId)).length;

      return `
        <button
          class="workflow-stage ${stage.stageId === state.selectedStageId ? "is-active" : ""}"
          type="button"
          data-workflow-stage-id="${stage.stageId}"
        >
          <strong>${escapeHtml(stage.title)}</strong>
          <span>${projectCount} projects</span>
          <span>${familyCount} idea families</span>
        </button>
      `;
    })
    .join("");

  renderWorkflowSpotlight();
}

function renderWorkflowSpotlight() {
  const stage = state.report.stageReports.find((entry) => entry.stageId === state.selectedStageId);
  if (!stage) {
    return;
  }

  const projects = state.programProjects.filter((project) => project.stageIds.includes(stage.stageId));
  const ideas = state.context.ideaFamilies.filter((family) => family.stageIds.includes(stage.stageId));

  elements.workflowSpotlight.innerHTML = `
    <h3>${escapeHtml(stage.title)}</h3>
    <p class="spotlight-meta">${escapeHtml(stage.description)}</p>
    <article class="detail-block">
      <strong>Projects to move first</strong>
      <div class="mini-list">
        ${projects.map((project) => `<a class="chip neutral dossier-jump" href="#dossier-${escapeHtml(project.id)}">#${project.rank} ${escapeHtml(project.name)}</a>`).join("")}
      </div>
    </article>
    <article class="detail-block">
      <strong>Idea families in this stage</strong>
      <div class="mini-list">
        ${ideas.map((family) => `<span class="chip alt">${escapeHtml(family.name)}</span>`).join("")}
      </div>
    </article>
    <article class="detail-block">
      <strong>Best federal matches here</strong>
      <div class="mini-list">
        ${stage.topMatches.slice(0, 4).map((match) => useCaseAnchor(match, match.id, { className: "chip neutral chip-link", title: match.use_case_name })).join("")}
      </div>
    </article>
  `;
}

function renderSampleOutputs() {
  elements.sampleGrid.innerHTML = sampleOutputs
    .map((sample) => {
      const project = getProject(sample.projectId);
      return `
        <article class="sample-card" id="sample-${escapeHtml(sample.id)}">
          <div class="card-topline">
            <span class="card-badge">${escapeHtml(sample.kicker)}</span>
            ${project ? `<a class="chip neutral dossier-jump" href="#dossier-${escapeHtml(project.id)}">#${project.rank} ${escapeHtml(project.name)}</a>` : ""}
          </div>
          <div>
            <h3>${escapeHtml(sample.title)}</h3>
            <p class="card-copy">${escapeHtml(sample.description)}</p>
          </div>
          <div class="sample-output">
            <p class="detail-label">${escapeHtml(sample.artifactLabel)}</p>
            <div class="sample-lines">
              ${sample.lines
                .map(
                  (line) => `
                    <div class="sample-line">
                      <span>${escapeHtml(line.label)}</span>
                      <strong>${escapeHtml(line.value)}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
          <ul class="deliverable-list">
            ${sample.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");
}

function renderDossiers() {
  elements.dossierList.innerHTML = state.programProjects
    .map((project) => {
      const precedents = resolveUseCases(project.precedentIds);
      const relatedIdeas = state.context.ideaFamilies.filter((family) =>
        family.stageIds.some((stageId) => project.stageIds.includes(stageId))
      );
      const sample = sampleOutputs.find((item) => item.projectId === project.id);

      return `
        <article class="dossier-card" id="dossier-${escapeHtml(project.id)}">
          <div class="dossier-header">
            <div>
              <p class="section-kicker">Pilot card #${project.rank}</p>
              <h3>${escapeHtml(project.name)}</h3>
            </div>
            <div class="mini-list">
              <span class="chip neutral">Value ${project.valueScore}</span>
              <span class="chip neutral">Feasibility ${project.feasibilityScore}</span>
              <span class="chip alt">${escapeHtml(project.wave)}</span>
            </div>
          </div>
          <p class="summary-text">${escapeHtml(project.goal)}</p>
          <div class="dossier-meta">
            <article class="project-note">
              <strong>FRUS owner</strong>
              <p class="detail-copy">${escapeHtml(project.owner)}</p>
            </article>
            <article class="project-note">
              <strong>Pilot boundary</strong>
              <p class="detail-copy">${escapeHtml(project.pilotBoundary)}</p>
            </article>
            <article class="project-note">
              <strong>Borrowed pattern</strong>
              <p class="detail-copy">${escapeHtml(project.borrowedPattern)}</p>
            </article>
            <article class="project-note">
              <strong>State-specific need</strong>
              <p class="detail-copy">${escapeHtml(project.stateGapSummary)}</p>
            </article>
          </div>
          <div class="dossier-columns">
            <article class="project-note">
              <p class="detail-label">Partners</p>
              <div class="mini-list">
                ${project.partners.map((item) => `<span class="chip alt">${escapeHtml(item)}</span>`).join("")}
              </div>
            </article>
            <article class="project-note">
              <p class="detail-label">Idea families</p>
              <div class="mini-list">
                ${relatedIdeas.slice(0, 4).map((item) => `<span class="chip neutral">${escapeHtml(item.name)}</span>`).join("")}
              </div>
            </article>
          </div>
          <div class="dossier-columns">
            <article class="project-note">
              <p class="detail-label">Dependencies</p>
              <ul class="deliverable-list">
                ${project.dependencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
            <article class="project-note">
              <p class="detail-label">Success metrics</p>
              <ul class="deliverable-list">
                ${project.successMetrics.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
          </div>
          <div class="dossier-columns">
            <article class="project-note">
              <p class="detail-label">Deliverables</p>
              <ul class="deliverable-list">
                ${project.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
            <article class="project-note">
              <p class="detail-label">Federal precedents</p>
              <div class="mini-list">
                ${precedents
                  .map((item) =>
                    useCaseAnchor(item, item.id, {
                      className: `chip ${pickChipTone(item.classification)} chip-link`,
                      title: item.use_case_name
                    })
                  )
                  .join("")}
              </div>
              ${sample ? `<a class="text-link dossier-jump" href="#sample-${escapeHtml(sample.id)}">See sample output</a>` : ""}
            </article>
          </div>
          <details class="evidence-drawer">
            <summary>Open evidence drawer</summary>
            <div class="evidence-grid">
              ${project.evidence.map((item) => renderEvidenceCard(item)).join("")}
            </div>
          </details>
        </article>
      `;
    })
    .join("");
}

function renderEvidenceCard(item) {
  const precedentLinks = resolveUseCases(item.precedentIds || []);
  return `
    <article class="evidence-card">
      <strong>${escapeHtml(item.title)}</strong>
      <p class="card-copy">${escapeHtml(item.summary)}</p>
      ${
        item.sourceUrl
          ? `<a class="text-link precedent-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">
              <span>Source</span>
              <span class="precedent-mark" aria-hidden="true">↗</span>
            </a>`
          : ""
      }
      ${
        precedentLinks.length
          ? `<div class="mini-list">${precedentLinks
              .map((useCase) =>
                useCaseAnchor(useCase, useCase.id, {
                  className: "chip neutral chip-link",
                  title: useCase.use_case_name
                })
              )
              .join("")}</div>`
          : ""
      }
    </article>
  `;
}

function populateComparatorControls() {
  const options = state.precedentRecords.map((record) => [
    record.id,
    `${record.id} — ${record.useCase.use_case_name}`
  ]);

  fillSelect(elements.compareSelect1, options);
  fillSelect(elements.compareSelect2, options);
  fillSelect(elements.compareSelect3, options);

  [elements.compareSelect1, elements.compareSelect2, elements.compareSelect3].forEach((select, index) => {
    select.value = state.comparatorIds[index] || options[index]?.[0] || "";
  });
}

function renderComparator() {
  const selectedRecords = state.comparatorIds
    .map((id) => state.precedentRecords.find((record) => record.id === id))
    .filter(Boolean);

  const rows = [
    {
      label: "Agency",
      render: (record) => escapeHtml(record.useCase.agency_name)
    },
    {
      label: "Development stage",
      render: (record) => escapeHtml(record.useCase.development_stage)
    },
    {
      label: "Classification",
      render: (record) => escapeHtml(record.useCase.classification)
    },
    {
      label: "Used by FY 2026 projects",
      render: (record) => record.projectNames.map((name) => `<span class="chip alt">${escapeHtml(name)}</span>`).join("")
    },
    {
      label: "Idea families",
      render: (record) => record.familyNames.map((name) => `<span class="chip neutral">${escapeHtml(name)}</span>`).join("")
    },
    {
      label: "Why FRUS borrows it",
      render: (record) => `<p class="card-copy">${escapeHtml(record.useCase.summary)}</p>`
    },
    {
      label: "Source",
      render: (record) =>
        `<a class="text-link precedent-link" href="${escapeHtml(record.useCase.sourceUrl)}" target="_blank" rel="noreferrer"><span>Official inventory</span><span class="precedent-link-tag">OMB row</span><span class="precedent-mark" aria-hidden="true">↗</span></a>`
    }
  ];

  elements.comparatorTable.innerHTML = `
    <div class="compare-header">
      <div class="compare-stub">Field</div>
      ${selectedRecords
        .map(
          (record) => `
            <div class="compare-column-head">
              ${useCaseAnchor(record.useCase, record.id, { className: "chip neutral chip-link", title: record.useCase.use_case_name })}
              <strong>${useCaseAnchor(record.useCase, record.useCase.use_case_name, { className: "card-link", title: `Open ${record.id}` })}</strong>
            </div>
          `
        )
        .join("")}
    </div>
    ${rows
      .map(
        (row) => `
          <div class="compare-row">
            <div class="compare-stub">${escapeHtml(row.label)}</div>
            ${selectedRecords.map((record) => `<div class="compare-cell">${row.render(record)}</div>`).join("")}
          </div>
        `
      )
      .join("")}
  `;
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
              .map((item) =>
                useCaseAnchor(item, item.id, {
                  className: `chip ${pickChipTone(item.classification)} chip-link`,
                  title: item.use_case_name
                })
              )
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
          <a class="text-link precedent-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">
            <span>Source</span>
            <span class="precedent-mark" aria-hidden="true">↗</span>
          </a>
        </article>
      `
    )
    .join("");
}

function renderProgramPanel() {
  const topProjects = state.programProjects.slice(0, 3);

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
                <span>${escapeHtml(project.timelineWindow)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
    <article class="program-card">
      <span class="program-label">Federal footing</span>
      <p class="card-copy">
        ${state.precedentRecords.length} reusable federal precedents appear across the FY 2026 slate, with the strongest signals concentrated in NARA, DOJ, DHS, VA, and DOI.
      </p>
    </article>
  `;
}

function renderRisks() {
  elements.riskList.innerHTML = riskRegister
    .map(
      (risk) => `
        <article class="risk-card">
          <div class="card-topline">
            <span class="chip ${risk.severity === "High" ? "" : "neutral"}">${escapeHtml(risk.severity)}</span>
          </div>
          <h3>${escapeHtml(risk.title)}</h3>
          <p class="card-copy">${escapeHtml(risk.summary)}</p>
          <p class="summary-text"><strong>Mitigation:</strong> ${escapeHtml(risk.mitigation)}</p>
        </article>
      `
    )
    .join("");
}

function renderGaps() {
  elements.gapList.innerHTML = stateSpecificGaps
    .map(
      (gap) => `
        <article class="gap-card">
          <div class="card-topline">
            <span class="chip neutral">${escapeHtml(gap.status)}</span>
          </div>
          <h3>${escapeHtml(gap.title)}</h3>
          <p class="card-copy">${escapeHtml(gap.summary)}</p>
          <div class="mini-list">
            ${gap.projectIds
              .map((projectId) => getProject(projectId))
              .filter(Boolean)
              .map((project) => `<a class="chip alt dossier-jump" href="#dossier-${escapeHtml(project.id)}">#${project.rank}</a>`)
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderPrecedentList() {
  elements.precedentList.innerHTML = state.precedentRecords
    .slice(0, 8)
    .map(({ useCase, projectNames, familyNames, totalMentions }) => {
      const labels = [`${totalMentions} mentions`, ...projectNames.slice(0, 2), ...familyNames.slice(0, 1)];

      return `
        <article class="precedent-card">
          <div class="card-topline">
            ${useCaseAnchor(useCase, useCase.id, {
              className: `chip ${pickChipTone(useCase.classification)} chip-link`,
              title: useCase.use_case_name
            })}
            <span class="chip neutral">${escapeHtml(useCase.development_stage)}</span>
          </div>
          <h3>${useCaseAnchor(useCase, useCase.use_case_name, { className: "card-link", title: `Open ${useCase.id}` })}</h3>
          <p class="card-copy">${escapeHtml(useCase.agency_name)}</p>
          <p class="summary-text">${escapeHtml(useCase.summary)}</p>
          <div class="mini-list">
            ${labels.map((label) => `<span class="chip neutral">${escapeHtml(label)}</span>`).join("")}
          </div>
          <a class="text-link precedent-link" href="${escapeHtml(useCase.sourceUrl)}" target="_blank" rel="noreferrer">
            <span>Official inventory</span>
            <span class="precedent-link-tag">OMB row</span>
            <span class="precedent-mark" aria-hidden="true">↗</span>
          </a>
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
              .map((example) =>
                useCaseAnchor(example, example.id, {
                  className: `chip ${pickChipTone(example.classification)} chip-link`,
                  title: example.use_case_name
                })
              )
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
                <h3>${useCaseAnchor(match, match.use_case_name, { className: "card-link", title: `Open ${match.id}` })}</h3>
                <p class="card-copy">${escapeHtml(match.agency)} • ${escapeHtml(match.development_stage)}</p>
              </div>
              <p class="summary-text">${escapeHtml(match.summary)}</p>
              <div class="mini-list">
                ${match.matchedThemes.map((theme) => `<span class="chip neutral">${escapeHtml(theme)}</span>`).join("")}
              </div>
              <a class="text-link precedent-link card-link-inline" href="${escapeHtml(match.sourceUrl)}" target="_blank" rel="noreferrer">
                <span>Official inventory</span>
                <span class="precedent-link-tag">OMB row</span>
                <span class="precedent-mark" aria-hidden="true">↗</span>
              </a>
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

    setSelectedStage(button.dataset.stageId);
  });

  elements.workflowMapGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-workflow-stage-id]");
    if (!button) {
      return;
    }

    setSelectedStage(button.dataset.workflowStageId);
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

  [elements.compareSelect1, elements.compareSelect2, elements.compareSelect3].forEach((select, index) => {
    select.addEventListener("change", (event) => {
      state.comparatorIds[index] = event.target.value;
      renderComparator();
    });
  });

  elements.exportBriefButton.addEventListener("click", exportLeadershipBrief);

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

function setSelectedStage(stageId) {
  state.selectedStageId = stageId;
  renderWorkflowMap();
  renderStageTabs();
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
            <h3>${useCaseAnchor(item, item.use_case_name, { className: "card-link", title: `Open ${item.id}` })}</h3>
            <p class="card-copy">${escapeHtml(item.agency_name)} • ${escapeHtml(item.development_stage)}</p>
          </div>
          <div class="mini-list">
            <span class="chip ${stageChipTone(bestStage?.stageId)}">${escapeHtml(bestStage?.title || "General fit")}</span>
            ${useCaseAnchor(item, item.id, { className: "chip neutral chip-link", title: item.use_case_name })}
          </div>
          <p class="summary-text">${escapeHtml(item.summary)}</p>
          <div class="theme-list">
            ${item.matchedThemes.slice(0, 3).map((theme) => `<span class="chip neutral">${escapeHtml(theme)}</span>`).join("")}
          </div>
          <a class="text-link precedent-link card-link-inline" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">
            <span>Official inventory</span>
            <span class="precedent-link-tag">OMB row</span>
            <span class="precedent-mark" aria-hidden="true">↗</span>
          </a>
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
      <h3>${useCaseAnchor(selected, selected.use_case_name, { className: "card-link", title: `Open ${selected.id}` })}</h3>
      <p class="detail-copy">${escapeHtml(selected.agency_name)} • ${escapeHtml(selected.development_stage)} • ${useCaseAnchor(selected, selected.id, {
        className: "inline-link",
        title: selected.use_case_name
      })}</p>
      <p class="summary-text">${escapeHtml(selected.summary)}</p>
      <a class="text-link precedent-link" href="${escapeHtml(selected.sourceUrl)}" target="_blank" rel="noreferrer">
        <span>Official inventory</span>
        <span class="precedent-link-tag">OMB row</span>
        <span class="precedent-mark" aria-hidden="true">↗</span>
      </a>
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

  for (const project of state.programProjects) {
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

function getProject(id) {
  return state.programProjects.find((project) => project.id === id) || null;
}

function exportLeadershipBrief() {
  const firstThree = state.programProjects.slice(0, 3);
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>FRUS Leadership Brief</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; color: #222; line-height: 1.5; }
      h1, h2, h3 { font-family: "Palatino Linotype", serif; }
      h1 { margin-bottom: 8px; }
      .kicker { text-transform: uppercase; letter-spacing: 0.12em; color: #8b1e34; font-size: 0.82rem; font-weight: 700; }
      .section { margin-top: 28px; }
      .card { border: 1px solid #d8c3a8; padding: 16px; margin-top: 12px; }
      ul { margin: 8px 0 0 18px; }
      a { color: #8b1e34; }
    </style>
  </head>
  <body>
    <p class="kicker">FRUS Acceleration Portal</p>
    <h1>FY 2026 Leadership Brief</h1>
    <p>Generated ${escapeHtml(new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date()))}. The objective is to ship bounded, precedent-backed pilots by September 30, 2026.</p>
    <div class="section">
      <h2>Recommended first three</h2>
      ${firstThree
        .map(
          (project) => `
            <div class="card">
              <h3>#${project.rank} ${escapeHtml(project.name)}</h3>
              <p>${escapeHtml(project.goal)}</p>
              <p><strong>Why now:</strong> ${escapeHtml(project.whyAchievable)}</p>
              <p><strong>Success metrics:</strong></p>
              <ul>${project.successMetrics.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="section">
      <h2>Top 10 projects</h2>
      <ul>${state.programProjects.map((project) => `<li>#${project.rank} ${escapeHtml(project.name)} — ${escapeHtml(project.timelineWindow)}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <h2>Key risks</h2>
      <ul>${riskRegister.map((risk) => `<li><strong>${escapeHtml(risk.title)}:</strong> ${escapeHtml(risk.mitigation)}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <h2>State-specific gaps</h2>
      <ul>${stateSpecificGaps.map((gap) => `<li><strong>${escapeHtml(gap.title)}:</strong> ${escapeHtml(gap.summary)}</li>`).join("")}</ul>
    </div>
    <div class="section">
      <h2>Timeline to September 30, 2026</h2>
      <ul>${timelineMilestones.map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.summary)}</li>`).join("")}</ul>
    </div>
  </body>
</html>`;

  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (popup) {
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    return;
  }

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "frus-leadership-brief.html";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function useCaseAnchor(useCase, label, options = {}) {
  if (!useCase?.sourceUrl) {
    return escapeHtml(label);
  }

  const computedClassName = [options.className || "", "precedent-anchor"].filter(Boolean).join(" ");
  const className = computedClassName ? ` class="${escapeHtml(computedClassName)}"` : "";
  const title = options.title ? ` title="${escapeHtml(options.title)}"` : "";
  return `<a${className} href="${escapeHtml(useCase.sourceUrl)}" target="_blank" rel="noreferrer"${title}>${escapeHtml(
    label
  )}<span class="precedent-mark" aria-hidden="true">↗</span><span class="sr-only"> opens official inventory</span></a>`;
}

function positionScore(score) {
  return 8 + score * 0.84;
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
  select.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
