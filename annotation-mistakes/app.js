(function bootstrap(global) {
  const SCHEMA_VERSION = "frus-recurring-risk-registry-v1";
  const BASE_REGISTRY_PATH = "../reports/frus-recurring-risk-registry.sample.json";

  const SOURCE_MODELS = [
    {
      label: "Reagan Foundations",
      citation: "FRUS, 1981-1988, volume I",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v01",
      uses: [
        "Document-reference forms such as `See Document 69.` and `Printed as Document 155.`",
        "Footnote refer-back forms with above/below or target-document context",
        "Source-note and editorial-note placement in finished FRUS apparatus"
      ]
    },
    {
      label: "Bush START I",
      citation: "FRUS, 1989-1992, volume XXXI",
      url: "https://history.state.gov/historicaldocuments/frus1989-92v31",
      uses: [
        "Document heading, date, subject, and source-note completeness",
        "Telegram and memorandum metadata discipline",
        "Published style for high-level bilateral and arms-control records"
      ]
    },
    {
      label: "Reagan NSP Part 1",
      citation: "FRUS, 1981-1988, volume XLIV, part 1",
      url: "https://history.state.gov/historicaldocuments/frus1981-88v44p1",
      uses: [
        "Source-note wording for sensitive policy-process documentation",
        "Editorial-note scope and document status signals",
        "Consistency checks for document metadata and provenance statements"
      ]
    }
  ];

  const FAMILY_RULES = [
    {
      family: "telegram_numbering",
      label: "Telegram numbering",
      score: [/telegram/i, /\b0\d{2,}\b/, /leading zero/i, /TOSEC|SECTO|NODIS/i],
      detector: "\\b(?:telegram|tel\\.?|D|P|N|TOSEC|SECTO)\\s+0\\d{2,}\\b",
      title: "Compiler-entered telegram number may carry an unintended leading zero",
      approved:
        "Strip compiler-added leading zeros from telegram numbers unless the source image proves the zero belongs to a different identifier.",
      evidence: "communications_metadata",
      units: ["source_note", "follow_on_footnote", "editorial_note", "communications_metadata", "unknown_editorial_text"],
      policy: "allow_exact_cleanup",
      severity: "minor"
    },
    {
      family: "telegram_copy_basis",
      label: "Telegram copy basis",
      score: [/WHSR|White House Situation Room|NSC|National Security Council/i, /eRecords|Department of State/i, /draft|clear|outgoing/i, /telegram|Nodis/i],
      detector:
        "\\b(?:White House Situation Room|WHSR|NSC copy|National Security Council copy)\\b(?:(?!eRecords|Central Foreign Policy File|Department of State).){0,240}\\b(?:telegram|Nodis|outgoing)\\b",
      title: "Telegram copy basis may need Department/eRecords confirmation",
      approved:
        "Prefer Department of State/eRecords telegram copies when available; when WHSR or NSC copies are necessary, capture outgoing drafting, clearance, approval, and header data from Department records when possible.",
      evidence: "communications_metadata",
      units: ["source_note", "source_list_entry", "communications_metadata", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "cross_reference_slug",
      label: "Cross-reference slug",
      score: [/slug|clue|xref|cross[- ]reference/i, /above|below|chapter|intra-volume|inter-volume/i, /date|sender|recipient|type/i],
      detector: "\\b(?:xref|cross[- ]reference|slug|clue|See Document\\s+(?:TK|TBD)|above\\/below|chapter\\?)\\b",
      title: "Compiler-facing cross-reference clue may be incomplete",
      approved:
        "Finish compiler-facing slugs with date, sender/recipient, document type, and above/below or volume/chapter direction before handoff.",
      evidence: "cross_reference",
      units: ["editorial_note", "follow_on_footnote", "source_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "document_xx_construction",
      label: "Document XX construction",
      score: [/Document\s+(XX|TK|TBD|\?\?)/i, /\bDoc\.?\s+(XX|TK|TBD|\?\?)/i, /Document reference|Document construction/i, /printed as Document|see Document/i],
      detector:
        "\\b(?:Doc(?:ument)?\\.?\\s+(?:XX|TK|TBD)|Document\\s+\\[?xx\\]?|Document\\s+\\?\\?|Document\\s+\\d+\\s*\\[(?:(?!\\b(?:above|below|chapter)\\b).){0,80}\\])\\b",
      title: "Document cross-reference construction may be malformed or unfinished",
      approved:
        "For final apparatus, use published FRUS forms such as `See Document 69.`, `Printed as Document 155.`, or `see footnote 9, Document 56`; for internal clues, complete the struck-through date, sender/recipient, document type, and direction.",
      evidence: "cross_reference",
      units: ["editorial_note", "follow_on_footnote", "source_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "document_boundary",
      label: "Document boundary",
      score: [/page break|document boundary|run together/i, /between documents|between document annotations/i],
      detector: "\\b(?:page break missing|missing page break|insert page break|no page break between documents|document annotations run together)\\b",
      title: "Document annotations may be missing a page break",
      approved:
        "Keep separate document annotations visually and structurally separate before editor handoff unless the production template supplies the boundary.",
      evidence: "wrapper_safety",
      units: ["document_heading", "unknown_editorial_text", "front_matter"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "footnote_placement",
      label: "Heading footnote placement",
      score: [/first footnote|heading footnote|document heading/i, /old standard|used to be/i],
      detector: "\\b(?:first footnote on (?:the )?document heading|heading footnote|source note on heading)\\b",
      title: "First footnote may still be attached to the document heading",
      approved:
        "Do not keep a first footnote on the document heading merely because an older annotation-sheet practice did so; check the current FRUS form.",
      evidence: "wrapper_safety",
      units: ["document_heading", "source_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "minor"
    },
    {
      family: "footnote_referback",
      label: "Footnote refer-back",
      score: [/refer[- ]?back|refer back|three times|3 times|third reference/i, /repeat.*citation|full citation/i, /see footnotes?/i],
      detector:
        "\\b(?:refer[- ]?back\\s+(?:3|three)[- ]times\\s+rule|third reference|repeat(?:ed|ing)? full citation|see footnotes?\\s+(?:TK|TBD|XX|\\?\\?))\\b",
      title: "Footnote refer-back threshold may be missed",
      approved:
        "After the third full citation occurrence, refer back rather than reciting the citation again; include above/below or Document context as the published Reagan Foundations examples do.",
      evidence: "cross_reference",
      units: ["follow_on_footnote", "editorial_note", "source_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "word_autoformatting",
      label: "Word autoformatting",
      score: [/auto[- ]number|auto[- ]format|automatic footnote|Word/i, /footnote/i],
      detector: "\\b(?:auto[- ]numbering|auto[- ]formatting|Word autoformat|automatic footnote numbering)\\b",
      title: "Word auto-numbering or auto-formatting may have shaped footnotes",
      approved:
        "Turn off Word auto-numbering/auto-formatting for production footnotes and verify numbering, spacing, and footnote markers manually.",
      evidence: "wrapper_safety",
      units: ["source_note", "follow_on_footnote", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "document_completeness",
      label: "Document completeness",
      score: [/incomplete|missing pages|partial copy|pages missing|missing outright/i, /document|copy|backup/i],
      detector: "\\b(?:incomplete document|pages? missing|missing pages?|partial copy|incomplete copy)\\b",
      title: "Document or backup copy may be incomplete",
      approved: "Confirm page completeness against the source image, scan, or backup before final annotation review.",
      evidence: "source_image",
      units: ["source_note", "editorial_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "critical"
    },
    {
      family: "source_note_shorthand",
      label: "Source-note shorthand",
      score: [/source note|SN/i, /shorthand|TK|TBD|fill source|compiler/i],
      detector: "\\b(?:SN\\s*TK|source note\\s+(?:TK|TBD|incomplete)|compiler(?:'s)? shorthand|TK source|fill source)\\b",
      title: "Source note may still contain compiler shorthand",
      approved:
        "Expand shorthand into final FRUS source-note form; unresolved shorthand belongs in a comment or evidence queue, not publishable apparatus.",
      evidence: "archival_path",
      units: ["source_note", "source_list_entry", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "backup_highlighting",
      label: "Backup quote highlighting",
      score: [/highlight|highlighted/i, /quoted material|quote/i, /backup/i],
      detector: "\\b(?:quoted material (?:not )?highlighted|quote not highlighted|unhighlighted quote|highlight quoted material)\\b",
      title: "Quoted backup material may not be highlighted",
      approved: "Highlight quoted passages in backup documents so editors can verify quotations quickly.",
      evidence: "source_image",
      units: ["editorial_note", "source_note", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "minor"
    },
    {
      family: "backup_telegram_header",
      label: "Backup telegram header",
      score: [/telegram header|header information|film number|D\/?P\/?N|D,? P,? and N|reel/i],
      detector: "\\b(?:header information missing|film number missing|D,? P,? and N reel|D reel|P reel|N reel|telegram header)\\b",
      title: "Backup telegram copy may omit header, film, or D/P/N reel data",
      approved:
        "Print backup telegram headers, including film number and D/P/N reel data, so editors can verify communications metadata.",
      evidence: "communications_metadata",
      units: ["source_note", "communications_metadata", "unknown_editorial_text"],
      policy: "comment_only_by_default",
      severity: "major"
    },
    {
      family: "style_consistency",
      label: "Style consistency",
      score: [/Style Guide|style inconsistency|inconsistent style|reviewer inconsistency|adhering/i],
      detector: "\\b(?:Style Guide inconsistency|inconsistent style|reviewer inconsistency|not adhering to the Style Guide|style varies)\\b",
      title: "Style Guide adherence may be inconsistent",
      approved:
        "Use the checker as a bespoke FRUS spellcheck pass and carry unresolved variants into the General Editor discrepancy tally.",
      evidence: "wrapper_safety",
      units: ["*", "source_note", "editorial_note", "follow_on_footnote"],
      policy: "comment_unless_context",
      severity: "major"
    }
  ];

  const UNKNOWN_RULE = {
    family: "unknown",
    label: "Unclassified recurring risk",
    detector: "\\b(?:TK|TBD|check style|verify|incomplete)\\b",
    title: "Compiler-described recurring risk needs General Editor classification",
    approved:
      "Flag the pattern for human review and add it to the discrepancy tally until a volume-specific FRUS standard is confirmed.",
    evidence: "wrapper_safety",
    units: ["*", "unknown_editorial_text"],
    policy: "comment_only_by_default",
    severity: "major"
  };

  const state = {
    baseRegistry: null,
    baseRegistryLoaded: false,
    lastRegistry: null
  };

  function escapeRegExp(value) {
    return String(value).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42);
  }

  function stripBullet(value) {
    return value.replace(/^\s*(?:[-*]|\d+[.)])\s+/, "").trim();
  }

  function splitMistakes(input) {
    const normalized = String(input || "")
      .replace(/\r\n/g, "\n")
      .replace(/\u2022/g, "\n")
      .replace(/\t/g, " ");
    const lineParts = normalized
      .split(/\n+/)
      .map(stripBullet)
      .filter(Boolean);
    if (lineParts.length > 1) return lineParts;
    return normalized
      .split(/(?:;\s+|\.\s+(?=[A-Z0-9"'(]))/)
      .map(stripBullet)
      .map((item) => item.replace(/\.$/, "").trim())
      .filter(Boolean);
  }

  function scoreRule(text, rule) {
    return rule.score.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
  }

  function ruleByFamily(family) {
    return FAMILY_RULES.find((rule) => rule.family === family);
  }

  function detectFamily(text) {
    if (/\bDoc(?:ument)?\.?\s+(?:XX|TK|TBD|\?\?)\b/i.test(text) || /\bDocument\s+\[?xx\]?/i.test(text)) {
      return ruleByFamily("document_xx_construction");
    }
    if (/\b(?:refer[- ]?back|refer back|three times|3 times|third reference|see footnotes?)\b/i.test(text)) {
      return ruleByFamily("footnote_referback");
    }
    const matches = FAMILY_RULES.map((rule) => ({ rule, score: scoreRule(text, rule) }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score);
    return matches.length > 0 ? matches[0].rule : UNKNOWN_RULE;
  }

  function buildPhrasePattern(text) {
    const words = String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4 && !["because", "about", "which", "there", "their", "sometimes"].includes(word));
    const unique = Array.from(new Set(words)).slice(0, 4);
    if (unique.length < 2) return null;
    return `\\b(?:${unique.map(escapeRegExp).join("|")})\\b`;
  }

  function evidenceSourceBasis(rule) {
    if (rule.family === "document_xx_construction" || rule.family === "footnote_referback") {
      return "Compiler mistake intake checked against Reagan Foundations published Document-reference and footnote refer-back models in FRUS, 1981-1988, volume I.";
    }
    if (rule.family === "telegram_copy_basis" || rule.family === "telegram_numbering" || rule.family === "backup_telegram_header") {
      return "Compiler mistake intake checked against published Bush START I and Reagan NSP source-note and communications-metadata forms.";
    }
    return "Compiler mistake intake generalized as a recurring annotation-sheet risk and checked against published Reagan/Bush FRUS apparatus forms.";
  }

  function makeRiskRecord(text, index, options = {}) {
    const rule = detectFamily(text);
    const phrasePattern = buildPhrasePattern(text);
    const detectorPatterns = phrasePattern && phrasePattern !== rule.detector ? [rule.detector, phrasePattern] : [rule.detector];
    const severity = rule.severity === "critical" ? "critical" : options.severity || rule.severity || "major";
    const suffix = slugify(text) || `entry-${index + 1}`;
    return {
      risk_id: `risk-compiler-intake-${String(index + 1).padStart(3, "0")}-${suffix}`,
      risk_family: rule.family,
      title: rule.title,
      anti_pattern: text,
      approved_practice: rule.approved,
      unit_types: rule.units,
      detector_patterns: detectorPatterns,
      direct_edit_policy: rule.policy,
      evidence_request: rule.evidence,
      comment_template: `Recurring compiler-risk check: ${rule.approved} Confirm against the target volume before accepting any direct rewrite.`,
      severity,
      source_basis: evidenceSourceBasis(rule),
      variant_forms: [text, rule.label]
    };
  }

  function dedupeRecords(records) {
    const seen = new Set();
    return records.map((record, index) => {
      let riskId = record.risk_id || `risk-compiler-intake-${index + 1}`;
      if (seen.has(riskId)) riskId = `${riskId}-${index + 1}`;
      seen.add(riskId);
      return { ...record, risk_id: riskId };
    });
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function buildRegistry(options = {}) {
    const mistakes = splitMistakes(options.inputText || "");
    const baseRecords = Array.isArray(options.baseRegistry?.records) ? options.baseRegistry.records : [];
    const customRecords = mistakes.map((mistake, index) =>
      makeRiskRecord(mistake, index, { severity: options.severity || "major" })
    );
    const capturedAt = todayIso();
    const compiler = options.compilerName ? ` Compiler/team: ${options.compilerName}.` : "";
    const volume = options.volumeHint ? ` Volume/chapter: ${options.volumeHint}.` : "";
    return {
      schema_version: SCHEMA_VERSION,
      recurring_risk_registry_id: `frus-recurring-compiler-risk-intake-${capturedAt}`,
      captured_at: capturedAt,
      source_basis:
        `Compiler mistake intake generated in the FRUS Annotation Mistake Intake site.${compiler}${volume} Published form anchors: Reagan Foundations, Bush START I, and Reagan NSP Part 1 on history.state.gov.`,
      scope:
        "Closed-network-ready recurring-risk registry for FRUS annotation sheets. Use as a bespoke spellcheck watchlist and keep unresolved variants in the General Editor discrepancy tally.",
      records: dedupeRecords([...baseRecords, ...customRecords])
    };
  }

  function customRecords(registry) {
    return (registry.records || []).filter((record) => /^risk-compiler-intake-/.test(record.risk_id));
  }

  function countByFamily(records) {
    return records.reduce((counts, record) => {
      counts[record.risk_family] = (counts[record.risk_family] || 0) + 1;
      return counts;
    }, {});
  }

  function buildCheckerCommands(registryPath = "custom-recurring-risk-registry.json") {
    return [
      `node scripts/validate-frus-recurring-risk-registry.mjs --registry ${registryPath} --format text`,
      `node scripts/audit-frus-recurring-risk-usage.mjs --units extracted-units.json --registry ${registryPath} --checker-output output.json --format text`,
      `node scripts/build-frus-llm-review-packet.mjs --units extracted-units.json --out review-packet.md --recurring-risk-registry ${registryPath} --target-volume VOLUME-ID --run-id RUN-ID`,
      `node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --recurring-risk-registry ${registryPath} --run-id RUN-ID`
    ].join("\n");
  }

  function buildAgentNote(registry) {
    const records = customRecords(registry);
    const tally = countByFamily(records);
    const tallyLines = Object.entries(tally)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([family, count]) => `- ${family}: ${count}`)
      .join("\n");
    const recordLines =
      records.length > 0
        ? records
            .map(
              (record) =>
                `- ${record.risk_id}: ${record.title}\n  - Anti-pattern: ${record.anti_pattern}\n  - Approved practice: ${record.approved_practice}\n  - Evidence request: ${record.evidence_request}\n  - Direct edit policy: ${record.direct_edit_policy}`
            )
            .join("\n")
        : "- No custom compiler mistakes entered yet.";
    return `# FRUS Annotation Checker Compiler-Mistake Intake

Use this note with the generated \`custom-recurring-risk-registry.json\` file when importing the checker into a standalone closed network.

## Operating posture

Treat these entries as a bespoke spellcheck watchlist for draft FRUS annotation sheets. Look for exact and similar mistakes, but keep comment-only behavior unless the registry marks a narrow exact cleanup as safe and the source evidence supports it. Carry unresolved variants into the General Editor discrepancy tally.

## Family tally

${tallyLines || "- No custom family counts yet."}

## Custom watchlist

${recordLines}

## Checker commands

\`\`\`sh
${buildCheckerCommands("custom-recurring-risk-registry.json")}
\`\`\`

## Published model anchors

- Reagan Foundations: ${SOURCE_MODELS[0].url}
- Bush START I: ${SOURCE_MODELS[1].url}
- Reagan NSP Part 1: ${SOURCE_MODELS[2].url}
`;
  }

  function formatJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function setText(id, text) {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  async function copyText(text, label) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`);
      return;
    }
    const scratch = document.createElement("textarea");
    scratch.value = text;
    document.body.appendChild(scratch);
    scratch.select();
    document.execCommand("copy");
    scratch.remove();
    showToast(`${label} copied`);
  }

  function downloadText(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderSources() {
    const grid = document.getElementById("sourceGrid");
    if (!grid) return;
    grid.innerHTML = SOURCE_MODELS.map(
      (source) => `<article class="source-card">
        <p class="section-label">${source.label}</p>
        <h3><a href="${source.url}">${source.citation}</a></h3>
        <ul>${source.uses.map((use) => `<li>${use}</li>`).join("")}</ul>
      </article>`
    ).join("");
  }

  function renderRiskList(records) {
    const list = document.getElementById("riskList");
    if (!list) return;
    if (records.length === 0) {
      list.innerHTML = '<p class="empty-state">Enter recurring mistakes to generate checker-ready watchlist records.</p>';
      return;
    }
    list.innerHTML = records
      .map(
        (record) => `<article class="risk-item" data-family="${record.risk_family}">
          <div class="risk-meta">
            <span class="chip">${record.risk_family}</span>
            <span class="chip">${record.severity}</span>
            <span class="chip">${record.direct_edit_policy}</span>
          </div>
          <h3>${record.title}</h3>
          <p>${record.approved_practice}</p>
        </article>`
      )
      .join("");
  }

  function renderTally(records) {
    const tally = document.getElementById("riskTally");
    if (!tally) return;
    const counts = countByFamily(records);
    tally.innerHTML = Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([family, count]) => `<span class="chip">${family}: ${count}</span>`)
      .join("");
  }

  function currentOptions() {
    return {
      inputText: document.getElementById("mistakeText")?.value || "",
      compilerName: document.getElementById("compilerName")?.value.trim() || "",
      volumeHint: document.getElementById("volumeHint")?.value.trim() || "",
      severity: document.getElementById("severityMode")?.value || "major",
      baseRegistry: state.baseRegistry
    };
  }

  function render() {
    const registry = buildRegistry(currentOptions());
    state.lastRegistry = registry;
    const records = customRecords(registry);
    setText("riskCount", `${records.length} rule${records.length === 1 ? "" : "s"} ready`);
    setText("registryPreview", formatJson(registry));
    setText("commandPreview", buildCheckerCommands("custom-recurring-risk-registry.json"));
    renderRiskList(records);
    renderTally(records);
  }

  async function loadBaseRegistry() {
    const status = document.getElementById("baseRegistryStatus");
    try {
      const response = await fetch(BASE_REGISTRY_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.baseRegistry = await response.json();
      state.baseRegistryLoaded = true;
      if (status) {
        status.textContent = `${state.baseRegistry.records?.length || 0} base rules loaded`;
        status.classList.add("ready");
      }
    } catch (error) {
      state.baseRegistry = null;
      if (status) {
        status.textContent = "Custom rules only";
        status.classList.add("fallback");
        status.title = `Base registry not loaded: ${error.message}`;
      }
    } finally {
      render();
    }
  }

  function init() {
    renderSources();
    loadBaseRegistry();
    const form = document.getElementById("mistakeForm");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
      showToast("Mistakes analyzed");
    });
    for (const id of ["mistakeText", "compilerName", "volumeHint", "severityMode"]) {
      document.getElementById(id)?.addEventListener("input", render);
    }
    document.getElementById("clearButton")?.addEventListener("click", () => {
      document.getElementById("mistakeText").value = "";
      render();
      showToast("Input cleared");
    });
    document.getElementById("copyJsonButton")?.addEventListener("click", () => {
      copyText(formatJson(state.lastRegistry || buildRegistry(currentOptions())), "Registry JSON");
    });
    document.getElementById("downloadJsonButton")?.addEventListener("click", () => {
      downloadText("custom-recurring-risk-registry.json", formatJson(state.lastRegistry || buildRegistry(currentOptions())), "application/json");
    });
    document.getElementById("copyCommandsButton")?.addEventListener("click", () => {
      copyText(buildCheckerCommands("custom-recurring-risk-registry.json"), "Checker commands");
    });
    document.getElementById("copyNoteButton")?.addEventListener("click", () => {
      copyText(buildAgentNote(state.lastRegistry || buildRegistry(currentOptions())), "Agent note");
    });
    document.getElementById("downloadNoteButton")?.addEventListener("click", () => {
      downloadText("frus-annotation-checker-compiler-mistakes.md", buildAgentNote(state.lastRegistry || buildRegistry(currentOptions())), "text/markdown");
    });
  }

  const api = {
    SOURCE_MODELS,
    FAMILY_RULES,
    splitMistakes,
    detectFamily,
    makeRiskRecord,
    buildRegistry,
    buildAgentNote,
    buildCheckerCommands,
    customRecords
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.FrusMistakeIntake = api;
  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", init);
})(typeof globalThis !== "undefined" ? globalThis : this);
