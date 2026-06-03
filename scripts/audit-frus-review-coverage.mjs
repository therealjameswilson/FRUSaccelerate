#!/usr/bin/env node

import fs from "node:fs";

const REVIEWABLE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "document_heading",
  "attachment_note",
  "declassification_note",
  "persons_entry",
  "abbreviation_entry",
  "index_entry",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);

const UNIT_TYPE_BASE_CATEGORIES = {
  source_note: ["source_note"],
  follow_on_footnote: ["citation", "annotation"],
  editorial_note: ["editorial_note", "citation", "chronology"],
  document_heading: ["document_metadata", "format", "wording"],
  attachment_note: ["attachment", "printed_nested_attachment"],
  declassification_note: ["declassification", "classification_handling"],
  persons_entry: ["authority_control"],
  abbreviation_entry: ["authority_control", "format"],
  index_entry: ["authority_control"],
  front_matter: ["source_list_front_matter", "authority_control", "volume_preparation_scope"],
  source_list_entry: ["source_list_front_matter", "source_note", "authority_control"],
  unknown_editorial_text: ["annotation", "wording", "format"],
  transcribed_document_text: []
};

const SIGNALS = [
  {
    category: "publication_status",
    evidence_request: "publication_status",
    pattern: /\b(?:printed in|printed as|scheduled for publication|forthcoming|anticipated|being cleared|being researched|planned|published in \d{4})\b/i,
    note: "publication-status phrase"
  },
  {
    category: "classification_handling",
    evidence_request: "classification_marking",
    pattern: /\b(?:no classification|no classification marking|top secret|secret|confidential|sensitive|noforn|nodis|exdis|handling restriction)\b/i,
    note: "classification or handling phrase"
  },
  {
    category: "declassification",
    evidence_request: "declassification_status",
    pattern: /\b(?:declassified|sanitized|excised|redacted|released in part|released in full)\b/i,
    note: "release/declassification phrase"
  },
  {
    category: "attachment",
    evidence_request: "attachment_status",
    pattern: /\b(?:attached|attachment|tab|enclosure|annex|appendix|not attached|not found attached)\b/i,
    note: "attachment or child-document phrase"
  },
  {
    category: "source_surrogate_release",
    evidence_request: "source_surrogate_basis",
    pattern: /\b(?:NLR|RAC|FOIA|catalog|scan|digital copy|https?:\/\/)\b/i,
    note: "source surrogate, release package, or discovery URL"
  },
  {
    category: "document_status_lifecycle",
    evidence_request: "document_status_basis",
    pattern: /\b(?:draft|final|copy|original|signed|unsigned|initialed|approved|cleared|sent for action|sent for information)\b/i,
    note: "document lifecycle/status phrase"
  },
  {
    category: "communications_record",
    evidence_request: "communications_metadata",
    pattern: /\b(?:telegram|cable|telcon|telephone conversation|memorandum of conversation|message number|date-time group|DTG)\b/i,
    note: "communications-record phrase"
  },
  {
    category: "decision_process_directive",
    evidence_request: "decision_process_basis",
    pattern: /\b(?:NSC|NSPG|NSDD|NSD|directive|decision memorandum|option paper|interagency)\b/i,
    note: "decision-process or directive phrase"
  },
  {
    category: "chronology",
    evidence_request: "chronology",
    pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/,
    note: "calendar date"
  },
  {
    category: "authority_control",
    evidence_request: "authority_control",
    pattern: /\b(?:Persons|Abbreviations and Terms|Index|biographic|abbreviation)\b/i,
    note: "authority-control/front-matter phrase"
  },
  {
    category: "source_list_front_matter",
    evidence_request: "source_list_basis",
    pattern: /\b(?:Source List|Bibliography|References|abbreviations list|source note list)\b/i,
    note: "source-list/front-matter phrase"
  }
];

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-review-coverage.mjs --units <extracted-units.json|-> --output <checker-output.json> [--matrix matrix.json] [--review-mode light|normal|exhaustive] [--format json|text] [--fail-on-warning]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let outputPath = null;
  let matrixPath = null;
  let reviewMode = "normal";
  let format = "json";
  let failOnWarning = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      outputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--matrix") {
      matrixPath = argv[index + 1];
      index += 1;
    } else if (arg === "--review-mode") {
      reviewMode = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else if (arg === "--fail-on-warning") {
      failOnWarning = true;
    } else {
      usage();
    }
  }

  if (
    !unitsPath ||
    !outputPath ||
    (unitsPath === "-" && outputPath === "-") ||
    !new Set(["light", "normal", "exhaustive"]).has(reviewMode) ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }
  return { unitsPath, outputPath, matrixPath, reviewMode, format, failOnWarning };
}

function readJson(filePath, label) {
  const text = filePath === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function countBy(values) {
  const counts = {};
  for (const value of values) {
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function validateUnits(unitsDocument) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) {
    return ["units: expected extracted-units object"];
  }
  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push("units.schema_version: must be frus-extracted-units-v1");
  }
  if (!Array.isArray(unitsDocument.units)) {
    errors.push("units.units: expected array");
    return errors;
  }
  const seen = new Set();
  unitsDocument.units.forEach((unit, index) => {
    const label = `units.units[${index}]`;
    if (!isPlainObject(unit)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${label}.unit_id: expected non-empty string`);
    } else if (seen.has(unit.unit_id)) {
      errors.push(`${label}.unit_id: duplicate ${unit.unit_id}`);
    } else {
      seen.add(unit.unit_id);
    }
    for (const key of ["unit_type", "exact_text", "display_text"]) {
      if (typeof unit[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
  });
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!isPlainObject(output)) {
    return ["output: expected checker-output object"];
  }
  if (output.schema_version !== "checker-output-v1") {
    errors.push("output.schema_version: must be checker-output-v1");
  }
  if (!Array.isArray(output.checks)) {
    errors.push("output.checks: expected array");
  }
  return errors;
}

function matrixPolicies(matrix) {
  if (!matrix) return { categories: new Set(), evidenceRequests: new Set(), directPolicies: new Map(), evidencePolicies: new Map() };
  return {
    categories: new Set((matrix.category_policies || []).map((policy) => policy.category).filter(Boolean)),
    evidenceRequests: new Set((matrix.evidence_request_policies || []).map((policy) => policy.evidence_request).filter(Boolean)),
    directPolicies: new Map((matrix.category_policies || []).map((policy) => [policy.category, policy])),
    evidencePolicies: new Map((matrix.evidence_request_policies || []).map((policy) => [policy.evidence_request, policy]))
  };
}

function reviewRequired(unit) {
  if (!unit || unit.word_part === "word/comments.xml") return false;
  if (!String(unit.exact_text || unit.display_text || "").trim()) return false;
  return REVIEWABLE_UNIT_TYPES.has(unit.unit_type);
}

function signalMatches(unit) {
  const text = `${unit.display_text || ""}\n${unit.exact_text || ""}`;
  return SIGNALS.filter((signal) => signal.pattern.test(text)).map((signal) => ({
    category: signal.category,
    evidence_request: signal.evidence_request,
    note: signal.note
  }));
}

function expectedCategoriesForUnit(unit, signals) {
  return uniqueSorted([...(UNIT_TYPE_BASE_CATEGORIES[unit.unit_type] || []), ...signals.map((signal) => signal.category)]);
}

function buildCoverage({ unitsDocument, output, matrix, reviewMode }) {
  const policies = matrixPolicies(matrix);
  const unitsById = new Map(unitsDocument.units.map((unit) => [unit.unit_id, unit]));
  const checksByUnit = new Map();
  const unknownUnitReferences = [];
  const unknownCategories = [];
  const unknownEvidenceRequests = [];

  for (const [index, check] of output.checks.entries()) {
    if (!isPlainObject(check)) continue;
    if (!unitsById.has(check.unit_id)) {
      unknownUnitReferences.push({ check_index: index, unit_id: check.unit_id, rule_id: check.rule_id || "" });
    } else {
      const list = checksByUnit.get(check.unit_id) || [];
      list.push({ ...check, check_index: index });
      checksByUnit.set(check.unit_id, list);
    }
    if (matrix && check.category && !policies.categories.has(check.category)) {
      unknownCategories.push({ check_index: index, category: check.category, unit_id: check.unit_id || "" });
    }
    if (matrix && check.evidence_request && !policies.evidenceRequests.has(check.evidence_request)) {
      unknownEvidenceRequests.push({
        check_index: index,
        evidence_request: check.evidence_request,
        unit_id: check.unit_id || ""
      });
    }
  }

  const unitCoverage = unitsDocument.units.map((unit) => {
    const signals = signalMatches(unit);
    const expectedCategories = expectedCategoriesForUnit(unit, signals);
    const checks = checksByUnit.get(unit.unit_id) || [];
    const checkedCategories = uniqueSorted(checks.map((check) => check.category));
    const checkedEvidenceRequests = uniqueSorted(checks.map((check) => check.evidence_request));
    const missingSignalCategories = signals
      .map((signal) => signal.category)
      .filter((category) => !checkedCategories.includes(category));
    const required = reviewRequired(unit);
    let coverageStatus = "not_review_required";
    if (required && checks.length === 0) coverageStatus = "unreviewed";
    if (required && checks.length > 0) coverageStatus = "reviewed";
    if (required && reviewMode === "exhaustive" && missingSignalCategories.length > 0) {
      coverageStatus = "reviewed_with_signal_gaps";
    }
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      review_required: required,
      edit_safety: unit.edit_safety || "",
      comment_safety: unit.comment_safety || "",
      expected_categories: expectedCategories,
      signal_categories: signals,
      checked_categories: checkedCategories,
      checked_evidence_requests: checkedEvidenceRequests,
      check_indexes: checks.map((check) => check.check_index),
      coverage_status: coverageStatus,
      missing_signal_categories: uniqueSorted(missingSignalCategories)
    };
  });

  const reviewable = unitCoverage.filter((unit) => unit.review_required);
  const uncovered = reviewable.filter((unit) => unit.coverage_status === "unreviewed");
  const signalGaps = unitCoverage.filter((unit) => unit.missing_signal_categories.length > 0);
  const checkedCategories = output.checks.map((check) => (isPlainObject(check) ? check.category : ""));
  const checkedEvidenceRequests = output.checks.map((check) => (isPlainObject(check) ? check.evidence_request : ""));
  const categoriesSeen = uniqueSorted(checkedCategories);
  const evidenceSeen = uniqueSorted(checkedEvidenceRequests);
  const applicableCategories = uniqueSorted(unitCoverage.flatMap((unit) => unit.expected_categories));
  const applicableEvidenceRequests = uniqueSorted(unitCoverage.flatMap((unit) => unit.signal_categories.map((signal) => signal.evidence_request)));

  const warnings = [];
  for (const unit of uncovered) {
    warnings.push(`${unit.unit_id}: reviewable ${unit.unit_type} unit has no checker entry`);
  }
  if (reviewMode === "exhaustive") {
    for (const unit of signalGaps) {
      warnings.push(`${unit.unit_id}: signal categories not checked: ${unit.missing_signal_categories.join(", ")}`);
    }
  }
  if (reviewMode !== "light" && output.checks.length === 0 && reviewable.length > 0) {
    warnings.push("checker output has no checks for a document with reviewable editorial units");
  }

  const errors = [];
  for (const item of unknownUnitReferences) {
    errors.push(`output.checks[${item.check_index}].unit_id: unknown unit ${item.unit_id}`);
  }
  for (const item of unknownCategories) {
    errors.push(`output.checks[${item.check_index}].category: not present in permutation matrix: ${item.category}`);
  }
  for (const item of unknownEvidenceRequests) {
    errors.push(
      `output.checks[${item.check_index}].evidence_request: not present in permutation matrix: ${item.evidence_request}`
    );
  }

  return {
    schema_version: "frus-review-coverage-audit-v1",
    review_mode: reviewMode,
    summary: {
      units_total: unitsDocument.units.length,
      reviewable_units: reviewable.length,
      reviewed_units: reviewable.length - uncovered.length,
      unreviewed_units: uncovered.length,
      checks_total: output.checks.length,
      checked_unit_references: [...checksByUnit.keys()].length,
      unknown_unit_references: unknownUnitReferences.length,
      categories_seen: categoriesSeen.length,
      evidence_requests_seen: evidenceSeen.length,
      applicable_categories: applicableCategories.length,
      signal_category_gaps: signalGaps.length,
      matrix_categories: policies.categories.size,
      matrix_evidence_requests: policies.evidenceRequests.size
    },
    counts: {
      by_unit_type: countBy(unitsDocument.units.map((unit) => unit.unit_type)),
      by_coverage_status: countBy(unitCoverage.map((unit) => unit.coverage_status)),
      by_checked_category: countBy(checkedCategories),
      by_checked_evidence_request: countBy(checkedEvidenceRequests)
    },
    applicable_categories: applicableCategories,
    applicable_evidence_requests: applicableEvidenceRequests,
    categories_seen: categoriesSeen,
    evidence_requests_seen: evidenceSeen,
    unit_coverage: unitCoverage,
    unknown_unit_references: unknownUnitReferences,
    unknown_categories: unknownCategories,
    unknown_evidence_requests: unknownEvidenceRequests,
    warnings,
    errors
  };
}

function renderText(result) {
  const lines = [
    `FRUS review coverage audit ${result.status}: ${result.summary.reviewed_units}/${result.summary.reviewable_units} reviewable units covered, ${result.summary.unreviewed_units} unreviewed, ${result.summary.signal_category_gaps} signal-category gaps.`
  ];
  if (result.errors.length > 0) {
    lines.push("Errors:");
    for (const error of result.errors) lines.push(`- ${error}`);
  }
  if (result.warnings.length > 0) {
    lines.push("Warnings:");
    for (const warning of result.warnings) lines.push(`- ${warning}`);
  }
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const output = readJson(options.outputPath, options.outputPath);
  const matrix = options.matrixPath ? readJson(options.matrixPath, options.matrixPath) : null;
  const validationErrors = [...validateUnits(unitsDocument), ...validateOutput(output)];
  if (matrix && matrix.schema_version !== "frus-annotation-permutation-matrix-v1") {
    validationErrors.push("matrix.schema_version: must be frus-annotation-permutation-matrix-v1");
  }
  if (validationErrors.length > 0) {
    const result = {
      schema_version: "frus-review-coverage-audit-v1",
      status: "fail",
      errors: validationErrors,
      warnings: []
    };
    if (options.format === "json") {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stdout.write(`FRUS review coverage audit failed: ${validationErrors.length} error(s).\n`);
      for (const error of validationErrors) process.stdout.write(`- ${error}\n`);
    }
    process.exit(1);
  }

  const result = buildCoverage({ unitsDocument, output, matrix, reviewMode: options.reviewMode });
  result.status = result.errors.length > 0 ? "fail" : result.warnings.length > 0 ? "warning" : "pass";

  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(result));
  }
  if (result.status === "fail" || (options.failOnWarning && result.status === "warning")) {
    process.exit(1);
  }
} catch (error) {
  console.error(`FRUS review coverage audit failed: ${error.message}`);
  process.exit(1);
}
