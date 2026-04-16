const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INVENTORY_PATH = path.join(ROOT, "data", "2025_individually_reported_AI_use_cases.csv");
const CONTEXT_PATH = path.join(ROOT, "data", "frus-context.json");
const JSON_REPORT_PATH = path.join(ROOT, "reports", "frus-ai-opportunities.json");
const MARKDOWN_REPORT_PATH = path.join(ROOT, "reports", "frus-ai-opportunities.md");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === "\"") {
        const next = text[index + 1];
        if (next === "\"") {
          field += "\"";
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header, index) => {
    if (index === 0) {
      return header.replace(/^\uFEFF/, "");
    }
    return header;
  });

  return rows.slice(1).filter((fields) => fields.some((value) => value !== "")).map((fields) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = fields[index] ?? "";
    });
    return record;
  });
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function countBy(records, key) {
  const counts = {};
  for (const record of records) {
    const normalized = normalizeWhitespace(record[key]) || "Unspecified";
    counts[normalized] = (counts[normalized] || 0) + 1;
  }
  return sortCountMap(counts);
}

function sortCountMap(counts) {
  return Object.fromEntries(
    Object.entries(counts).sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0]);
    })
  );
}

function getTopEntries(countMap, limit) {
  return Object.entries(countMap)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function textIncludes(text, keyword) {
  return text.includes(keyword.toLowerCase());
}

function buildSearchText(record) {
  return [
    record.use_case_name,
    record.agency_name,
    record.agency_bureau,
    record.topic_area,
    record.classification,
    record.problem_solved,
    record.benefits,
    record.system_outputs,
    record.data_description
  ]
    .map(normalizeWhitespace)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreRecord(record, context) {
  const searchText = buildSearchText(record);
  const stageScores = Object.fromEntries(context.stageProfiles.map((stage) => [stage.id, 0]));
  const matchedThemes = [];
  const matchedStageKeywords = {};

  for (const theme of context.capabilityThemes) {
    const hits = theme.keywords.filter((keyword) => textIncludes(searchText, keyword));
    if (hits.length === 0) {
      continue;
    }

    const themeScore = theme.weight + (hits.length - 1) * 2;
    matchedThemes.push({
      id: theme.id,
      name: theme.name,
      hits: hits.slice(0, 6),
      score: themeScore
    });

    for (const stageId of theme.stageIds) {
      stageScores[stageId] += themeScore;
    }
  }

  for (const stage of context.stageProfiles) {
    const hits = stage.keywords.filter((keyword) => textIncludes(searchText, keyword));
    if (hits.length === 0) {
      continue;
    }

    stageScores[stage.id] += hits.length;
    matchedStageKeywords[stage.id] = hits.slice(0, 8);
  }

  const classification = normalizeWhitespace(record.classification);
  const developmentStage = normalizeWhitespace(record.development_stage);
  const impact = normalizeWhitespace(record.is_high_impact);
  const withheld = normalizeWhitespace(record.is_withheld);
  const topicArea = normalizeWhitespace(record.topic_area).toLowerCase();
  const useCaseName = normalizeWhitespace(record.use_case_name).toLowerCase();

  const classificationBonus = {
    "NLP": 8,
    "Generative AI": 7,
    "Classical ML": 3,
    "Computer Vision": 1
  }[classification] || 0;

  const developmentBonus = {
    "Deployed": 8,
    "Pilot": 6,
    "Pre-deployment": 4,
    "Initiated": 3,
    "Retired": -5
  }[developmentStage] || 0;

  let governanceBonus = 0;
  if (impact === "Not High-impact" || impact === "Presumed High-Impact, but Not High-impact") {
    governanceBonus += 2;
  } else if (impact === "High-impact") {
    governanceBonus -= 5;
  }

  if (withheld.startsWith("Yes")) {
    governanceBonus -= 2;
  }

  const documentSignals = [
    "record",
    "records",
    "document",
    "documents",
    "catalog",
    "metadata",
    "redaction",
    "foia",
    "archive",
    "archival"
  ].filter((keyword) => textIncludes(searchText, keyword));

  const archivalSpecificSignals = [
    "archive",
    "archival",
    "historical",
    "catalog",
    "collections",
    "descriptive",
    "metadata",
    "public release",
    "digitized",
    "foia",
    "declass",
    "redaction",
    "index",
    "public access",
    "digital objects",
    "archival descriptions"
  ].filter((keyword) => textIncludes(searchText, keyword));

  const archivalBonus = documentSignals.length >= 2 ? 6 : documentSignals.length;
  const archivalSpecificBonus = archivalSpecificSignals.length * 5;

  let domainPenalty = 0;
  const unrelatedOperationalTerms = [
    "biometric",
    "facial recognition",
    "vessel",
    "aircraft",
    "cargo",
    "border",
    "surveillance",
    "engine"
  ];
  const hasUnrelatedSignals = unrelatedOperationalTerms.some((keyword) => textIncludes(searchText, keyword));
  if (hasUnrelatedSignals && documentSignals.length === 0 && !textIncludes(searchText, "search")) {
    domainPenalty -= 6;
  }

  if (topicArea.includes("law enforcement") && archivalSpecificSignals.length === 0 && !textIncludes(searchText, "foia")) {
    domainPenalty -= 8;
  }

  const genericEnterpriseSignals = [
    "productivity",
    "workplace",
    "position descriptions",
    "statement of work",
    "professional emails",
    "workforce announcements",
    "budget forecasting",
    "code generation",
    "procurement",
    "meeting notes",
    "spend plan",
    "contracting actions"
  ].filter((keyword) => textIncludes(searchText, keyword));

  if (genericEnterpriseSignals.length > 0 && archivalSpecificSignals.length < 2) {
    domainPenalty -= 18;
  }

  if (
    matchedThemes.every((theme) => theme.id === "drafting_summarization" || theme.id === "planning_analytics") &&
    matchedThemes.length > 0
  ) {
    domainPenalty -= 30;
  }

  if (textIncludes(useCaseName, "chatbot") && archivalSpecificSignals.length === 0 && documentSignals.length < 3) {
    domainPenalty -= 12;
  }

  const coreThemeIds = new Set([
    "semantic_search",
    "metadata_enrichment",
    "transcription_translation",
    "redaction_clearance",
    "publication_experience"
  ]);

  const hasCoreTheme = matchedThemes.some((theme) => coreThemeIds.has(theme.id));
  const hasStrongArchivalFit =
    archivalSpecificSignals.length >= 1 ||
    documentSignals.length >= 3 ||
    textIncludes(searchText, "foia") ||
    textIncludes(searchText, "public release");

  const matchedThemeScore = matchedThemes.reduce((sum, theme) => sum + theme.score, 0);
  const overallScore =
    matchedThemeScore +
    Object.values(stageScores).reduce((sum, score) => sum + score, 0) +
    classificationBonus +
    developmentBonus +
    governanceBonus +
    archivalBonus +
    archivalSpecificBonus +
    domainPenalty;

  const stageRanking = Object.entries(stageScores)
    .sort((left, right) => right[1] - left[1])
    .filter(([, score]) => score > 0)
    .map(([stageId, score]) => ({
      stageId,
      score,
      title: context.stageProfiles.find((stage) => stage.id === stageId).title
    }));

  const shortSummary =
    normalizeWhitespace(record.problem_solved) ||
    normalizeWhitespace(record.benefits) ||
    normalizeWhitespace(record.system_outputs) ||
    "No summary provided.";

  return {
    ...record,
    overallScore,
    stageScores,
    stageRanking,
    matchedThemes,
    matchedStageKeywords,
    shortSummary,
    documentSignalCount: documentSignals.length,
    archivalSpecificCount: archivalSpecificSignals.length,
    hasCoreTheme,
    hasStrongArchivalFit
  };
}

function shorten(text, limit = 160) {
  const cleaned = normalizeWhitespace(text);
  if (cleaned.length <= limit) {
    return cleaned;
  }
  return `${cleaned.slice(0, limit - 1).trimEnd()}…`;
}

function buildStageReports(scoredRecords, context) {
  return context.stageProfiles.map((stage) => {
    const topMatches = scoredRecords
      .filter((record) => record.stageScores[stage.id] > 0)
      .sort((left, right) => {
        const leftRank = left.stageScores[stage.id] + left.archivalSpecificCount * 8 + left.documentSignalCount * 2;
        const rightRank = right.stageScores[stage.id] + right.archivalSpecificCount * 8 + right.documentSignalCount * 2;
        if (rightRank !== leftRank) {
          return rightRank - leftRank;
        }
        return right.overallScore - left.overallScore;
      })
      .slice(0, 8)
      .map((record) => ({
        agency: normalizeWhitespace(record.agency_name),
        id: normalizeWhitespace(record.id),
        use_case_name: normalizeWhitespace(record.use_case_name),
        development_stage: normalizeWhitespace(record.development_stage) || "Unspecified",
        classification: normalizeWhitespace(record.classification) || "Unspecified",
        overallScore: record.overallScore,
        stageScore: record.stageScores[stage.id],
        matchedThemes: record.matchedThemes
          .filter((theme) => context.capabilityThemes.find((entry) => entry.id === theme.id).stageIds.includes(stage.id))
          .map((theme) => theme.name),
        summary: shorten(record.shortSummary)
      }));

    return {
      stageId: stage.id,
      title: stage.title,
      description: stage.description,
      topMatches
    };
  });
}

function buildPortfolioRecommendations(scoredRecords, context) {
  return context.recommendedPortfolio.map((item) => {
    const minimumPreferredHits = item.minimumPreferredHits || 1;
    const exemplars = scoredRecords
      .map((record) => {
        const matchedThemeCount = record.matchedThemes.filter((theme) => item.themeIds.includes(theme.id)).length;
        const searchText = buildSearchText(record);
        const preferredHits = (item.preferredKeywords || []).filter((keyword) => textIncludes(searchText, keyword)).length;
        const excludeHits = (item.excludeKeywords || []).filter((keyword) => textIncludes(searchText, keyword)).length;
        return {
          record,
          matchedThemeCount,
          preferredHits,
          excludeHits,
          rankScore: record.overallScore + matchedThemeCount * 20 + preferredHits * 10
        };
      })
      .filter((entry) => entry.matchedThemeCount > 0 && entry.preferredHits >= minimumPreferredHits && entry.excludeHits === 0)
      .sort((left, right) => right.rankScore - left.rankScore)
      .slice(0, 5)
      .map(({ record }) => ({
        agency: normalizeWhitespace(record.agency_name),
        id: normalizeWhitespace(record.id),
        use_case_name: normalizeWhitespace(record.use_case_name),
        development_stage: normalizeWhitespace(record.development_stage) || "Unspecified",
        classification: normalizeWhitespace(record.classification) || "Unspecified",
        matchedThemes: record.matchedThemes
          .filter((theme) => item.themeIds.includes(theme.id))
          .map((theme) => theme.name),
        summary: shorten(record.shortSummary, 140)
      }));

    return {
      ...item,
      exemplars
    };
  });
}

function normalizeRelevantRecord(record) {
  return {
    agency_name: normalizeWhitespace(record.agency_name),
    id: normalizeWhitespace(record.id),
    use_case_name: normalizeWhitespace(record.use_case_name),
    development_stage: normalizeWhitespace(record.development_stage),
    classification: normalizeWhitespace(record.classification),
    overallScore: record.overallScore,
    documentSignalCount: record.documentSignalCount,
    archivalSpecificCount: record.archivalSpecificCount,
    stageRanking: record.stageRanking,
    matchedThemes: record.matchedThemes.map((theme) => theme.name),
    summary: shorten(record.shortSummary)
  };
}

function buildAgencyHighlights(scoredRecords) {
  const agencyMap = new Map();

  for (const record of scoredRecords.slice(0, 80)) {
    const agency = normalizeWhitespace(record.agency_name) || "Unknown";
    const entry = agencyMap.get(agency) || { agency, count: 0, scoreTotal: 0, example: null };
    entry.count += 1;
    entry.scoreTotal += record.overallScore;
    if (!entry.example) {
      entry.example = {
        id: normalizeWhitespace(record.id),
        use_case_name: normalizeWhitespace(record.use_case_name)
      };
    }
    agencyMap.set(agency, entry);
  }

  return [...agencyMap.values()]
    .map((entry) => ({
      agency: entry.agency,
      count: entry.count,
      averageScore: Number((entry.scoreTotal / entry.count).toFixed(1)),
      example: entry.example
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return right.averageScore - left.averageScore;
    })
    .slice(0, 10);
}

function renderMarkdown(report, context) {
  const lines = [];

  lines.push("# FRUS AI Opportunity Report");
  lines.push("");
  lines.push(`Generated on ${report.generatedAt}. This report analyzes ${report.inventory.totalUseCases.toLocaleString()} use cases from the 2025 Federal Agency AI Use Case Inventory against the Foreign Relations of the United States (FRUS) production workflow.`);
  lines.push("");
  lines.push("## Executive Takeaways");
  lines.push("");
  lines.push("- FRUS's largest current bottleneck is clearance and declassification, not web publishing.");
  lines.push("- The strongest reusable federal patterns are semantic archival search, metadata enrichment, summarization/drafting support, and FOIA-style redaction triage.");
  lines.push("- NARA appears throughout the top matches because its archival and records-access mission is the closest analog to FRUS.");
  lines.push("- HistoryAtState already has strong digital foundations: TEI source files, canonical document identifiers, CI-generated table-of-contents artifacts, and chapter-based release experiments.");
  lines.push("");
  lines.push("## FRUS Findings");
  lines.push("");

  for (const finding of context.frusFindings) {
    lines.push(`- ${finding.headline} ${finding.detail} Source: ${finding.sourceUrl}`);
  }

  lines.push("");
  lines.push("## Inventory Snapshot");
  lines.push("");
  lines.push(`- Total use cases analyzed: ${report.inventory.totalUseCases.toLocaleString()}`);
  lines.push(`- Top development stages: ${report.inventory.topDevelopmentStages.map((entry) => `${entry.name} (${entry.count})`).join(", ")}`);
  lines.push(`- Top AI classifications: ${report.inventory.topClassifications.map((entry) => `${entry.name} (${entry.count})`).join(", ")}`);
  lines.push(`- Top FRUS-relevant agencies in this analysis: ${report.agencyHighlights.slice(0, 5).map((entry) => `${entry.agency} (${entry.count})`).join(", ")}`);
  lines.push("");
  lines.push("## Best-Fit Use Cases Overall");
  lines.push("");
  lines.push("| Rank | Agency | ID | Use Case | Stage Fit | Why It Matters |");
  lines.push("| --- | --- | --- | --- | --- | --- |");

  report.topUseCasesOverall.forEach((record, index) => {
    const stageFit = record.stageRanking.map((stage) => stage.title).join(", ");
    const why = shorten(record.summary, 140).replace(/\|/g, "\\|");
    lines.push(
      `| ${index + 1} | ${record.agency_name.replace(/\|/g, "\\|")} | ${record.id.replace(/\|/g, "\\|")} | ${record.use_case_name.replace(/\|/g, "\\|")} | ${stageFit || "General"} | ${why} |`
    );
  });

  for (const stage of report.stageReports) {
    lines.push("");
    lines.push(`## ${stage.title}`);
    lines.push("");
    lines.push(stage.description);
    lines.push("");
    for (const match of stage.topMatches.slice(0, 5)) {
      const themeText = match.matchedThemes.length > 0 ? match.matchedThemes.join(", ") : "General relevance";
      lines.push(`- ${match.agency} ${match.id} - ${match.use_case_name} (${match.development_stage}, ${match.classification}). ${match.summary} Matched themes: ${themeText}.`);
    }
  }

  lines.push("");
  lines.push("## Recommended FRUS Portfolio");
  lines.push("");
  for (const item of report.portfolioRecommendations) {
    lines.push(`### ${item.name}`);
    lines.push("");
    lines.push(`- Why: ${item.why}`);
    lines.push(`- FRUS benefit: ${item.frusBenefit}`);
    lines.push(`- Example federal precedents: ${item.exemplars.slice(0, 3).map((example) => `${example.agency} ${example.id} (${example.use_case_name})`).join("; ")}`);
    lines.push("");
  }

  lines.push("## Suggested Next Steps");
  lines.push("");
  lines.push("- Pilot semantic search on a bounded FRUS corpus: one subseries plan, one set of archival finding aids, and a handful of published TEI volumes.");
  lines.push("- Add historian-in-the-loop metadata and annotation drafting, but keep TEI authoring and final notes under editorial control.");
  lines.push("- Focus the first clearance pilot on redaction triage and prior-release comparison, since clearance is the largest measurable delay.");
  lines.push("- Extend existing chapter-based publication work with automated index and discovery enhancements rather than waiting for full-volume automation.");
  lines.push("");
  lines.push("## Source Links");
  lines.push("");
  lines.push(`- OMB Inventory: ${context.inventorySource.repositoryUrl}`);
  lines.push(`- About FRUS: https://history.state.gov/historicaldocuments/about-frus`);
  lines.push(`- FRUS Status: https://history.state.gov/historicaldocuments/status-of-the-series`);
  lines.push(`- FRUS Stages: https://history.state.gov/historicaldocuments/frus-history/stages`);
  lines.push(`- 2025 Report to Congress: https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf`);
  lines.push(`- HistoryAtState FRUS Repo: https://github.com/HistoryAtState/frus`);
  lines.push(`- HistoryAtState hsg-project Repo: https://github.com/HistoryAtState/hsg-project`);
  lines.push(`- HistoryAtState hsg-shell Repo: https://github.com/HistoryAtState/hsg-shell`);
  lines.push(`- HistoryAtState Developer Resources: https://history.state.gov/developer`);
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildReport(records, context) {
  const scoredRecords = records
    .filter((record) => normalizeWhitespace(record.id))
    .map((record) => scoreRecord(record, context))
    .filter((record) => record.overallScore >= 35 && record.hasCoreTheme && record.hasStrongArchivalFit)
    .sort((left, right) => right.overallScore - left.overallScore);

  const byDevelopmentStage = countBy(records, "development_stage");
  const byClassification = countBy(records, "classification");
  const byAgency = countBy(records, "agency_name");
  const byTopicArea = countBy(records, "topic_area");

  return {
    generatedAt: new Date().toISOString(),
    inventory: {
      totalUseCases: records.length,
      byDevelopmentStage,
      byClassification,
      byAgency,
      byTopicArea,
      topDevelopmentStages: getTopEntries(byDevelopmentStage, 5),
      topClassifications: getTopEntries(byClassification, 5),
      topAgencies: getTopEntries(byAgency, 10)
    },
    frusMetrics: context.frusMetrics,
    agencyHighlights: buildAgencyHighlights(scoredRecords),
    topUseCasesOverall: scoredRecords.slice(0, 20).map(normalizeRelevantRecord),
    relevantUseCases: scoredRecords.map(normalizeRelevantRecord),
    relevantUseCaseCount: scoredRecords.length,
    stageReports: buildStageReports(scoredRecords, context),
    portfolioRecommendations: buildPortfolioRecommendations(scoredRecords, context)
  };
}

function runChecks(report) {
  const failures = [];

  if (report.inventory.totalUseCases < 3000) {
    failures.push("Expected at least 3,000 inventory records.");
  }

  if (report.relevantUseCaseCount < 20) {
    failures.push("Expected at least 20 FRUS-relevant matches.");
  }

  const clearanceStage = report.stageReports.find((stage) => stage.stageId === "clearance");
  if (!clearanceStage || clearanceStage.topMatches.length === 0) {
    failures.push("Expected at least one clearance-stage recommendation.");
  }

  if (!report.topUseCasesOverall.some((record) => record.agency_name.includes("National Archives"))) {
    failures.push("Expected at least one National Archives use case in the top results.");
  }

  if (failures.length > 0) {
    throw new Error(failures.join(" "));
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const inventoryText = fs.readFileSync(INVENTORY_PATH, "utf8");
  const context = JSON.parse(fs.readFileSync(CONTEXT_PATH, "utf8"));
  const records = parseCsv(inventoryText);
  const report = buildReport(records, context);
  const markdown = renderMarkdown(report, context);

  fs.writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(MARKDOWN_REPORT_PATH, markdown);

  if (args.has("--check")) {
    runChecks(report);
  }

  if (!args.has("--silent")) {
    console.log(`Analyzed ${report.inventory.totalUseCases} use cases.`);
    console.log(`Saved JSON report to ${path.relative(ROOT, JSON_REPORT_PATH)}.`);
    console.log(`Saved Markdown report to ${path.relative(ROOT, MARKDOWN_REPORT_PATH)}.`);
    console.log(`Flagged ${report.relevantUseCaseCount} FRUS-relevant use cases.`);
  }
}

main();
