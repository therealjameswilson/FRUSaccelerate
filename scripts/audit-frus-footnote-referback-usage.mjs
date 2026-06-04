#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const REFERBACK_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "unknown_editorial_text"
]);
const FOOTNOTE_SIGNAL = /\b(?:see\s+)?(?:fn\.?|footnote)\s+(?:\d+|TK|TBD|XX|\?\?)/i;
const FOOTNOTE_DOCUMENT_PAIR = /\bfootnote\s+(\d+)\s*,\s*Document\s+(\d+)\b/gi;
const DIRECT_FOOTNOTE_PATTERN = /\b(?:footnote|fn\.?|Document\s+\d+\s+and\s+footnote)\b/i;
const CITATION_PATTERNS = [
  {
    source_type: "public_papers",
    pattern:
      /\bPublic Papers:\s*Reagan,\s*\d{4}(?:[-–]\d{4})?,\s*Book\s+[IVX]+,\s*pp?\.\s*[A-Z]?\d+(?:[-–]\d+)?(?:,\s*[A-Z]?\d+(?:[-–][A-Z]?\d+)?)*/gi
  },
  {
    source_type: "department_bulletin",
    pattern:
      /\bDepartment of State Bulletin,\s*[A-Z][a-z]+\s+\d{4},\s*pp?\.\s*[A-Z]?\d+(?:[-–]\d+)?(?:,\s*[A-Z]?\d+(?:[-–][A-Z]?\d+)?)*/gi
  },
  {
    source_type: "newspaper",
    pattern:
      /\b(?:New York Times|Washington Post),\s*[A-Z][a-z]+\s+\d{1,2},\s*\d{4},\s*pp?\.\s*[A-Z]?\d+(?:[-–][A-Z]?\d+)?(?:,\s*[A-Z]?\d+(?:[-–][A-Z]?\d+)?)*/gi
  },
  {
    source_type: "reagan_diaries",
    pattern:
      /\bBrinkley,\s*ed\.,\s*The Reagan Diaries,\s*vol\.\s*[IVX]+,\s*[A-Z][a-z]+\s+\d{4}[-–][A-Z][a-z]+\s+\d{4},\s*p\.\s*\d+/gi
  },
  {
    source_type: "congress_and_the_nation",
    pattern: /\bCongress and the Nation,\s*vol\.\s*[IVX]+,\s*\d{4}[-–]\d{4},\s*p\.\s*\d+/gi
  },
  {
    source_type: "central_foreign_policy_file",
    pattern:
      /\bDepartment of State,\s*Central Foreign Policy File,\s*Electronic Telegrams,\s*[A-Z]\d{6}[-–]\d{4}/gi
  },
  {
    source_type: "presidential_daily_diary",
    pattern: /\bReagan Library,\s*President[’']s Daily Diary\b/gi
  },
  {
    source_type: "parenthetical_source_citation",
    pattern:
      /\((?=[^)]*(?:Public Papers|Department of State Bulletin|New York Times|Washington Post|Reagan Library|Foreign Relations|Brinkley|Congress and the Nation|Central Foreign Policy File))[^)]{35,}\)/gi
  }
];

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-footnote-referback-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume VOLUME-ID] [--format text|json]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
  let targetVolume = "";
  let format = "text";
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--registry") {
      registryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--target-volume") {
      targetVolume = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }
  if (!unitsPath || !registryPath || !new Set(["text", "json"]).has(format)) usage();
  return { unitsPath, registryPath, checkerOutputPath, targetVolume, format };
}

function readJson(file, label) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeForm(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function validateUnits(unitsDocument) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) return ["units: expected extracted-units object"];
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

function validateRegistry(registry) {
  const errors = [];
  if (!isPlainObject(registry)) return ["registry: expected footnote-referback-registry object"];
  if (registry.schema_version !== "frus-footnote-referback-registry-v1") {
    errors.push("registry.schema_version: must be frus-footnote-referback-registry-v1");
  }
  if (!Number.isInteger(registry.repeat_threshold) || registry.repeat_threshold < 2 || registry.repeat_threshold > 5) {
    errors.push("registry.repeat_threshold: expected integer between 2 and 5");
  }
  if (typeof registry.repeat_threshold_action !== "string" || registry.repeat_threshold_action.trim() === "") {
    errors.push("registry.repeat_threshold_action: expected non-empty string");
  }
  if (!Array.isArray(registry.records)) errors.push("registry.records: expected array");
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!output) return errors;
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
}

function appliesToUnit(unit) {
  return REFERBACK_UNIT_TYPES.has(unit.unit_type) || FOOTNOTE_SIGNAL.test(unitText(unit));
}

function makeLiteralPattern(form) {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}\\.?(?![A-Za-z0-9])`, "gi");
}

function registryForms(registry) {
  const forms = [];
  for (const record of registry.records || []) {
    for (const form of [record.approved_phrase, ...(record.variant_forms || [])]) {
      if (!String(form || "").trim()) continue;
      forms.push({
        form,
        normalized_form: normalizeForm(form),
        record
      });
    }
  }
  return forms;
}

function approvedMatchesForUnit(unit, forms) {
  const text = unitText(unit);
  const matches = [];
  const seen = new Set();
  for (const item of forms) {
    const pattern = makeLiteralPattern(item.form);
    for (const match of text.matchAll(pattern)) {
      const key = `${item.record.referback_id}:${match.index}:${match[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        referback_id: item.record.referback_id,
        referback_type: item.record.referback_type,
        approved_phrase: item.record.approved_phrase,
        matched_text: match[0],
        match_kind: normalizeForm(match[0]) === normalizeForm(item.record.approved_phrase) ? "approved_phrase" : "variant_form",
        source_unit_label: item.record.source_unit_label,
        source_document_id: item.record.source_document_id,
        source_url: item.record.source_url,
        rule_basis: item.record.rule_basis,
        offset: match.index || 0,
        length: match[0].length
      });
    }
  }
  return suppressContainedApprovedMatches(matches);
}

function suppressContainedApprovedMatches(matches) {
  const sorted = matches
    .slice()
    .sort((a, b) => b.length - a.length || a.offset - b.offset || a.referback_id.localeCompare(b.referback_id));
  const accepted = [];
  for (const match of sorted) {
    const start = match.offset;
    const end = match.offset + match.length;
    const contained = accepted.some((item) => {
      const itemStart = item.offset;
      const itemEnd = item.offset + item.length;
      return match.referback_id === item.referback_id && start >= itemStart && end <= itemEnd;
    });
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || a.referback_id.localeCompare(b.referback_id));
}

function approvedSpanMatches(text, forms) {
  const spans = [];
  for (const item of forms) {
    const pattern = makeLiteralPattern(item.form);
    for (const match of text.matchAll(pattern)) {
      spans.push({ start: match.index || 0, end: (match.index || 0) + match[0].length });
    }
  }
  return spans;
}

function insideSpan(index, spans) {
  return spans.some((span) => index >= span.start && index < span.end);
}

function localAboveBelowContext(text, index, matchLength) {
  const before = text.slice(Math.max(0, index - 90), index);
  const after = text.slice(index + matchLength, Math.min(text.length, index + matchLength + 70));
  return /\b(?:above|below|same separate page|same page|attachment thereto|tab thereto)\b/i.test(`${before} ${after}`);
}

function footnoteDocumentPairCount(text) {
  return [...text.matchAll(FOOTNOTE_DOCUMENT_PAIR)].length;
}

function detectMalformedReferbacks(unit, forms) {
  const text = unitText(unit);
  const approvedSpans = approvedSpanMatches(text, forms);
  const diagnostics = [];

  const placeholder = /\b(?:see\s+)?(?:fn\.?|footnote)\s+(?:TK|TBD|XX|\?\?)/gi;
  for (const match of text.matchAll(placeholder)) {
    if (insideSpan(match.index || 0, approvedSpans)) continue;
    diagnostics.push({
      diagnostic_type: "placeholder_footnote_target",
      matched_text: match[0],
      finding: "Footnote refer-back uses a placeholder target.",
      required_action: "Resolve the footnote number and target document before final apparatus.",
      offset: match.index || 0
    });
  }

  const shorthand = /\bsee\s+(?:fn\.?|fn)\s+\d+/gi;
  for (const match of text.matchAll(shorthand)) {
    if (insideSpan(match.index || 0, approvedSpans)) continue;
    diagnostics.push({
      diagnostic_type: "footnote_shorthand",
      matched_text: match[0],
      finding: "Footnote refer-back uses shorthand instead of FRUS footnote form.",
      required_action: "Use `footnote N` in final apparatus; confirm whether a Document target or above/below context is required.",
      offset: match.index || 0
    });
  }

  const missingComma = /\bsee\s+footnote\s+\d+\s+Document\s+\d+/gi;
  for (const match of text.matchAll(missingComma)) {
    if (insideSpan(match.index || 0, approvedSpans)) continue;
    diagnostics.push({
      diagnostic_type: "missing_comma_before_document",
      matched_text: match[0],
      finding: "Cross-document footnote refer-back lacks the comma before `Document`.",
      required_action: "Use `see footnote N, Document X` after confirming the target.",
      offset: match.index || 0
    });
  }

  const lowerDocument = /\bsee\s+footnote\s+\d+\s*,\s*document\s+\d+/g;
  for (const match of text.matchAll(lowerDocument)) {
    if (insideSpan(match.index || 0, approvedSpans)) continue;
    diagnostics.push({
      diagnostic_type: "lowercase_document_target",
      matched_text: match[0],
      finding: "Cross-document footnote refer-back lowercases `Document`.",
      required_action: "Use capitalized `Document` in final FRUS apparatus.",
      offset: match.index || 0
    });
  }

  const missingThereto = /\bDocument\s+\d+\s+and\s+footnote\s+\d+\b(?!\s*(?:thereto|,\s*Document\s+\d+))/gi;
  for (const match of text.matchAll(missingThereto)) {
    if (insideSpan(match.index || 0, approvedSpans)) continue;
    diagnostics.push({
      diagnostic_type: "missing_thereto",
      matched_text: match[0],
      finding: "Document-and-footnote cross-reference is missing `thereto`.",
      required_action: "Use `See Document X and footnote Y thereto` after confirming the target.",
      offset: match.index || 0
    });
  }

  const bareFootnote = /\bsee\s+footnote\s+\d+\b(?!\s*,\s*(?:above|below|Document\s+\d+)|\s+thereto)/gi;
  for (const match of text.matchAll(bareFootnote)) {
    const index = match.index || 0;
    if (insideSpan(index, approvedSpans)) continue;
    if (localAboveBelowContext(text, index, match[0].length)) continue;
    diagnostics.push({
      diagnostic_type: "bare_footnote_without_context",
      matched_text: match[0],
      finding: "Bare same-document footnote refer-back lacks above/below or local same-document context.",
      required_action: "Add `above`/`below`, supply the surrounding local context, or use `footnote N, Document X` for a cross-document target.",
      offset: index
    });
  }

  const pairCount = footnoteDocumentPairCount(text);
  if (pairCount > 3) {
    diagnostics.push({
      diagnostic_type: "overlong_footnote_document_cluster",
      matched_text: text.match(FOOTNOTE_DOCUMENT_PAIR)?.[0] || "footnote/document cluster",
      finding: "Footnote contains more than three `footnote N, Document X` refer-back targets.",
      required_action:
        "Treat this as a production-review trigger; Reagan Foundations Document 146 models a three-target cluster, which is distinct from the third repeated-citation refer-back threshold.",
      offset: 0,
      target_count: pairCount
    });
  }

  return diagnostics.map((diagnostic) => ({
    unit_id: unit.unit_id,
    unit_type: unit.unit_type,
    location: unit.location || "",
    severity: diagnostic.diagnostic_type === "overlong_footnote_document_cluster" ? "major" : "minor",
    evidence_request: "cross_reference",
    comment_text: diagnostic.required_action,
    ...diagnostic
  }));
}

function citationText(value) {
  return String(value || "")
    .trim()
    .replace(/^\((.*)\)$/s, "$1")
    .replace(/^Source:\s*/i, "")
    .replace(/\s+/g, " ")
    .replace(/[.;,\s]+$/g, "");
}

function citationKey(value) {
  return normalizeForm(citationText(value)).replace(/\bpp?\b/g, "p");
}

function citationCandidatesForUnit(unit) {
  const text = unitText(unit);
  const candidates = [];
  const seen = new Set();
  for (const { source_type: sourceType, pattern } of CITATION_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const candidateText = citationText(match[0]);
      const key = citationKey(candidateText);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      candidates.push({
        matched_text: candidateText,
        source_type: sourceType,
        offset: match.index || 0
      });
    }
  }
  return candidates;
}

function ordinal(value) {
  const suffix =
    value % 100 >= 11 && value % 100 <= 13
      ? "th"
      : value % 10 === 1
        ? "st"
        : value % 10 === 2
          ? "nd"
          : value % 10 === 3
            ? "rd"
            : "th";
  return `${value}${suffix}`;
}

function repeatedCitationThresholds(units, repeatThreshold, repeatThresholdAction) {
  const groups = new Map();
  for (const unit of units) {
    const text = unitText(unit);
    if (/\bsee\s+footnote\b/i.test(text) || /\bfootnote\s+\d+\s*,\s*Document\s+\d+\b/i.test(text)) continue;
    for (const candidate of citationCandidatesForUnit(unit)) {
      const key = citationKey(candidate.matched_text);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        matched_text: candidate.matched_text,
        source_type: candidate.source_type,
        offset: candidate.offset
      });
    }
  }
  const thresholds = [];
  for (const [key, occurrences] of groups.entries()) {
    const uniqueUnits = [...new Map(occurrences.map((item) => [item.unit_id, item])).values()].map(
      (item, index) => ({
        ...item,
        occurrence_number: index + 1,
        threshold_status:
          index + 1 < repeatThreshold
            ? "full_citation_may_stand"
            : index + 1 === repeatThreshold
              ? "first_referback_review_trigger"
              : "later_referback_review_trigger"
      })
    );
    if (uniqueUnits.length < repeatThreshold) continue;
    const triggerUnit = uniqueUnits[repeatThreshold - 1];
    const reviewUnits = uniqueUnits.slice(repeatThreshold - 1);
    thresholds.push({
      citation_key: key,
      repeat_threshold: repeatThreshold,
      occurrence_count: uniqueUnits.length,
      trigger_unit: triggerUnit,
      first_review_unit: triggerUnit,
      allowed_full_citation_units: uniqueUnits.slice(0, repeatThreshold - 1),
      review_units: reviewUnits,
      units: uniqueUnits,
      finding: `Same full citation reaches the ${ordinal(repeatThreshold)} occurrence without a footnote refer-back.`,
      required_action: repeatThresholdAction
    });
  }
  return thresholds;
}

function directEditConflicts(output, registry, matchesByUnit, diagnosticsByUnit) {
  if (!output || !Array.isArray(output.checks)) return [];
  const approvedForms = new Set(registryForms(registry).map((item) => item.normalized_form));
  const conflicts = [];
  for (const check of output.checks) {
    if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const touchesReferback =
      DIRECT_FOOTNOTE_PATTERN.test(original) ||
      DIRECT_FOOTNOTE_PATTERN.test(replacement) ||
      (check.evidence_request || "") === "cross_reference";
    if (!touchesReferback) continue;
    const replacementApproved = approvedForms.has(normalizeForm(replacement));
    if (!replacementApproved) {
      conflicts.push({
        unit_id: check.unit_id || "",
        rule_id: check.rule_id || "",
        original_text: original,
        replacement_text: replacement,
        finding: "Direct edit touches a footnote refer-back without a registry-approved published form and clean target context.",
        required_action: "Downgrade to comment_only unless the replacement exactly matches a published-model registry form for the target volume."
      });
    }
  }
  return conflicts;
}

function auditFootnoteReferbacks({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-footnote-referback-usage-audit-v1",
      status: "fail",
      target_volume: targetVolume,
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        approved_referback_usages: 0,
        malformed_referbacks: 0,
        overlong_referback_clusters: 0,
        repeated_citation_thresholds: 0,
        repeated_citation_review_units: 0,
        repeat_threshold: registry.repeat_threshold || 0,
        direct_footnote_referback_edit_conflicts: 0,
        warnings: 0,
        by_referback_type: {},
        by_diagnostic_type: {}
      },
      approved_matches: [],
      diagnostics: [],
      repeated_citation_thresholds: [],
      direct_edit_conflicts: []
    };
  }

  const forms = registryForms(registry);
  const approvedMatches = [];
  const diagnostics = [];
  const matchesByUnit = new Map();
  const diagnosticsByUnit = new Map();
  for (const unit of unitsDocument.units) {
    if (!appliesToUnit(unit)) continue;
    const unitMatches = approvedMatchesForUnit(unit, forms);
    const unitDiagnostics = detectMalformedReferbacks(unit, forms);
    if (unitMatches.length > 0) {
      approvedMatches.push(...unitMatches);
      matchesByUnit.set(unit.unit_id, unitMatches);
    }
    if (unitDiagnostics.length > 0) {
      diagnostics.push(...unitDiagnostics);
      diagnosticsByUnit.set(unit.unit_id, unitDiagnostics);
    }
  }
  const repeatThreshold = registry.repeat_threshold;
  const thresholds = repeatedCitationThresholds(unitsDocument.units, repeatThreshold, registry.repeat_threshold_action);
  const conflicts = directEditConflicts(checkerOutput, registry, matchesByUnit, diagnosticsByUnit);
  const warnings = [
    ...diagnostics.map((diagnostic) => `${diagnostic.unit_id}: ${diagnostic.finding}`),
    ...thresholds.map(
      (threshold) =>
        `${threshold.review_units.map((unit) => unit.unit_id).join(",")}: ${threshold.finding} First two full citation occurrences may stand; flag the third occurrence and every later occurrence for target confirmation.`
    )
  ];
  const hardErrors = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    approved_referback_usages: approvedMatches.length,
    malformed_referbacks: diagnostics.filter((diagnostic) => diagnostic.diagnostic_type !== "overlong_footnote_document_cluster").length,
    overlong_referback_clusters: diagnostics.filter((diagnostic) => diagnostic.diagnostic_type === "overlong_footnote_document_cluster").length,
    repeated_citation_thresholds: thresholds.length,
    repeated_citation_review_units: thresholds.reduce((total, threshold) => total + threshold.review_units.length, 0),
    repeat_threshold: repeatThreshold,
    direct_footnote_referback_edit_conflicts: conflicts.length,
    warnings: warnings.length,
    by_referback_type: countBy(approvedMatches.map((match) => match.referback_type)),
    by_diagnostic_type: countBy(diagnostics.map((diagnostic) => diagnostic.diagnostic_type))
  };
  return {
    schema_version: "frus-footnote-referback-usage-audit-v1",
    status: hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: hardErrors,
    warnings,
    summary,
    approved_matches: approvedMatches,
    diagnostics,
    repeated_citation_thresholds: thresholds,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS footnote refer-back usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS footnote refer-back usage audit ${result.status}: ${result.summary.approved_referback_usages} approved matches, ${result.summary.malformed_referbacks} malformed refer-backs, ${result.summary.repeated_citation_thresholds} repeated-citation thresholds at ${result.summary.repeat_threshold}, ${result.summary.repeated_citation_review_units} third-and-later review units.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditFootnoteReferbacks({
    unitsDocument: readJson(options.unitsPath, options.unitsPath),
    registry: readJson(options.registryPath, options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS footnote refer-back usage audit failed: ${error.message}`);
  process.exit(1);
}
