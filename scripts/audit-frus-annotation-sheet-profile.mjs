#!/usr/bin/env node

import fs from "node:fs";

const PROFILE_SCHEMA_VERSION = "frus-annotation-sheet-profile-v1";
const AUDIT_SCHEMA_VERSION = "frus-annotation-sheet-profile-audit-v1";
const UNITS_SCHEMA_VERSION = "frus-extracted-units-v1";
const CHECKER_SCHEMA_VERSION = "checker-output-v1";
const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-annotation-sheet-profile.mjs --profile profile.json [--units extracted-units.json|->] [--checker-output checker-output.json] [--format json|text] [--fail-on-warning]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let profilePath = null;
  let unitsPath = null;
  let checkerOutputPath = null;
  let format = "text";
  let failOnWarning = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--profile") {
      profilePath = argv[index + 1];
      index += 1;
    } else if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
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
    !profilePath ||
    (profilePath === "-" && unitsPath === "-") ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }
  return { profilePath, unitsPath, checkerOutputPath, format, failOnWarning };
}

function readJson(file, label) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label, errors, { nonempty = true } = {}) {
  if (typeof value !== "string") {
    errors.push(`${label}: expected string`);
  } else if (nonempty && value.length === 0) {
    errors.push(`${label}: must not be empty`);
  }
}

function requireNumber(value, label, errors) {
  if (!Number.isFinite(value) || value < 0) errors.push(`${label}: expected non-negative number`);
}

function validateProfile(profile) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(profile)) return { errors: ["profile: expected object"], warnings };
  if (profile.schema_version !== PROFILE_SCHEMA_VERSION) {
    errors.push(`$.schema_version: must be ${PROFILE_SCHEMA_VERSION}`);
  }
  requireString(profile.profile_id, "$.profile_id", errors);
  requireString(profile.captured_at, "$.captured_at", errors);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(profile.captured_at || "")) {
    errors.push("$.captured_at: expected YYYY-MM-DD");
  }
  requireString(profile.source_label, "$.source_label", errors);
  if (!isPlainObject(profile.source_basis)) {
    errors.push("$.source_basis: expected object");
  } else {
    for (const key of [
      "paragraphs",
      "nonempty_paragraphs",
      "word_comments",
      "tracked_revision_runs",
      "footnote_parts",
      "endnote_parts",
      "tables",
      "hyperlink_paragraphs"
    ]) {
      requireNumber(profile.source_basis[key], `$.source_basis.${key}`, errors);
    }
    if (!Array.isArray(profile.source_basis.primary_word_styles)) {
      errors.push("$.source_basis.primary_word_styles: expected array");
    }
    if (!Array.isArray(profile.source_basis.marker_inventory)) {
      errors.push("$.source_basis.marker_inventory: expected array");
    }
  }
  if (!isPlainObject(profile.style_policy)) {
    errors.push("$.style_policy: expected object");
  } else {
    requireString(profile.style_policy.unitization_basis, "$.style_policy.unitization_basis", errors);
    if (typeof profile.style_policy.do_not_depend_on_word_styles !== "boolean") {
      errors.push("$.style_policy.do_not_depend_on_word_styles: expected boolean");
    }
    if (profile.style_policy.flat_style_warning_threshold !== undefined) {
      const threshold = profile.style_policy.flat_style_warning_threshold;
      if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
        errors.push("$.style_policy.flat_style_warning_threshold: expected number between 0 and 1");
      }
    }
  }
  if (!isPlainObject(profile.pseudo_marker_policy)) {
    errors.push("$.pseudo_marker_policy: expected object");
  } else {
    if (!Array.isArray(profile.pseudo_marker_policy.allowed_tokens) || profile.pseudo_marker_policy.allowed_tokens.length === 0) {
      errors.push("$.pseudo_marker_policy.allowed_tokens: expected non-empty array");
    }
    for (const key of ["numeric_marker_min", "numeric_marker_max"]) {
      requireNumber(profile.pseudo_marker_policy[key], `$.pseudo_marker_policy.${key}`, errors);
    }
    if (typeof profile.pseudo_marker_policy.preserve_literal_markers !== "boolean") {
      errors.push("$.pseudo_marker_policy.preserve_literal_markers: expected boolean");
    }
  }
  if (!Array.isArray(profile.lexical_unit_patterns) || profile.lexical_unit_patterns.length === 0) {
    errors.push("$.lexical_unit_patterns: expected non-empty array");
  } else {
    profile.lexical_unit_patterns.forEach((pattern, index) => {
      const label = `$.lexical_unit_patterns[${index}]`;
      if (!isPlainObject(pattern)) {
        errors.push(`${label}: expected object`);
        return;
      }
      for (const key of ["pattern_id", "unit_type", "regex", "severity", "note"]) {
        requireString(pattern[key], `${label}.${key}`, errors);
      }
      if (pattern.severity && !new Set(["info", "warning", "fail"]).has(pattern.severity)) {
        errors.push(`${label}.severity: invalid value ${JSON.stringify(pattern.severity)}`);
      }
      try {
        new RegExp(pattern.regex);
      } catch (error) {
        errors.push(`${label}.regex: invalid regex: ${error.message}`);
      }
    });
  }
  if (!Array.isArray(profile.profile_checks) || profile.profile_checks.length === 0) {
    warnings.push("$.profile_checks: no named profile checks supplied");
  }
  return { errors, warnings };
}

function validateUnits(unitsDocument) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) return ["units: expected extracted-units object"];
  if (unitsDocument.schema_version !== UNITS_SCHEMA_VERSION) {
    errors.push(`units.schema_version: must be ${UNITS_SCHEMA_VERSION}`);
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
    for (const key of ["unit_id", "unit_type", "exact_text", "display_text"]) {
      if (typeof unit[key] !== "string") errors.push(`${label}.${key}: expected string`);
    }
    if (typeof unit.unit_id === "string" && unit.unit_id.length > 0) {
      if (seen.has(unit.unit_id)) errors.push(`${label}.unit_id: duplicate ${unit.unit_id}`);
      seen.add(unit.unit_id);
    }
  });
  return errors;
}

function validateCheckerOutput(output) {
  const errors = [];
  if (!isPlainObject(output)) return ["checker_output: expected object"];
  if (output.schema_version !== CHECKER_SCHEMA_VERSION) {
    errors.push(`checker_output.schema_version: must be ${CHECKER_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function markerPolicy(profile) {
  const policy = profile.pseudo_marker_policy || {};
  return {
    allowedTokens: new Set(Array.isArray(policy.allowed_tokens) ? policy.allowed_tokens : []),
    numericMin: Number.isFinite(policy.numeric_marker_min) ? policy.numeric_marker_min : 1,
    numericMax: Number.isFinite(policy.numeric_marker_max) ? policy.numeric_marker_max : 20
  };
}

function findAll(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  return [...String(text || "").matchAll(re)].map((match) => ({
    token: match[0],
    start: match.index,
    end: match.index + match[0].length
  }));
}

function isAllowedMarker(token, policy) {
  if (policy.allowedTokens.has(token)) return true;
  const match = token.match(/^<([0-9]+)>$/);
  if (!match) return false;
  const value = Number(match[1]);
  return value >= policy.numericMin && value <= policy.numericMax;
}

function markerInventory(unit, policy) {
  const allAngleTokens = findAll(unit.exact_text || unit.display_text || "", /<[^>\s]+>/g);
  const allowedMarkers = allAngleTokens.filter((token) => isAllowedMarker(token.token, policy));
  const unexpectedTokens = allAngleTokens.filter((token) => !isAllowedMarker(token.token, policy));
  return { allAngleTokens, allowedMarkers, unexpectedTokens };
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function countExactMatches(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let cursor = 0;
  while (cursor <= haystack.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) break;
    count += 1;
    cursor = found + needle.length;
  }
  return count;
}

function exactMatchRange(haystack, needle) {
  const start = haystack.indexOf(needle);
  if (start === -1) return null;
  return { start, end: start + needle.length };
}

function rangeStartsOrEndsInsideToken(range, token) {
  return (
    (range.start > token.start && range.start < token.end) ||
    (range.end > token.start && range.end < token.end)
  );
}

function rangeContainsToken(range, token) {
  return range.start <= token.start && range.end >= token.end;
}

function compilePatterns(profile, errors) {
  const patterns = [];
  for (const pattern of profile.lexical_unit_patterns || []) {
    try {
      patterns.push({ ...pattern, regexObject: new RegExp(pattern.regex, "i") });
    } catch (error) {
      errors.push(`${pattern.pattern_id || "<unknown>"}.regex: invalid regex: ${error.message}`);
    }
  }
  return patterns;
}

function unitText(unit) {
  return String(unit.exact_text || unit.display_text || "").replace(/\s+/g, " ").trim();
}

function unitMatchesPatterns(unit, patterns) {
  const text = unitText(unit);
  return patterns.filter((pattern) => pattern.regexObject.test(text));
}

function directEditChecks(output) {
  if (!output || !Array.isArray(output.checks)) return [];
  return output.checks.filter((check) => isPlainObject(check) && DIRECT_ACTIONS.has(check.recommended_action));
}

function auditProfileUsage({ profile, unitsDocument, checkerOutput }) {
  const errors = [];
  const warnings = [];
  const profileValidation = validateProfile(profile);
  errors.push(...profileValidation.errors);
  warnings.push(...profileValidation.warnings);

  const summary = {
    profile_id: profile.profile_id || "",
    units_reviewed: 0,
    units_by_type: {},
    flat_style_units: 0,
    lexical_matches: 0,
    lexical_misclassifications: 0,
    marker_tokens: 0,
    pseudo_marker_units: 0,
    unexpected_angle_tokens: 0,
    direct_edits_reviewed: 0,
    direct_edit_marker_conflicts: 0,
    direct_edit_safety_conflicts: 0
  };

  const diagnostics = [];
  if (!unitsDocument) {
    return { errors, warnings, summary, diagnostics };
  }

  const unitErrors = validateUnits(unitsDocument);
  errors.push(...unitErrors);
  if (unitErrors.length > 0) return { errors, warnings, summary, diagnostics };

  const patterns = compilePatterns(profile, errors);
  const policy = markerPolicy(profile);
  const allowedFlatStyles = new Set(profile.style_policy?.allowed_flat_styles || []);
  const unitMap = new Map();

  summary.units_reviewed = unitsDocument.units.length;
  summary.units_by_type = countBy(unitsDocument.units.map((unit) => unit.unit_type));

  for (const unit of unitsDocument.units) {
    unitMap.set(unit.unit_id, unit);
    if (allowedFlatStyles.has(unit.paragraph_style || "")) summary.flat_style_units += 1;

    const inventory = markerInventory(unit, policy);
    summary.marker_tokens += inventory.allowedMarkers.length;
    summary.unexpected_angle_tokens += inventory.unexpectedTokens.length;
    if (inventory.allowedMarkers.length > 0) summary.pseudo_marker_units += 1;
    for (const token of inventory.unexpectedTokens) {
      errors.push(`${unit.unit_id}: unexpected angle token ${token.token}; map it in the wrapper or downgrade to comment-only`);
      diagnostics.push({
        diagnostic_id: `profile-token-${diagnostics.length + 1}`,
        unit_id: unit.unit_id,
        severity: "fail",
        category: "pseudo_marker",
        finding: `Unexpected angle token ${token.token}.`,
        required_action: "Map the token in the wrapper or leave the affected unit comment-only."
      });
    }

    const matches = unitMatchesPatterns(unit, patterns);
    summary.lexical_matches += matches.length;
    for (const pattern of matches) {
      if (unit.unit_type === pattern.unit_type) continue;
      summary.lexical_misclassifications += 1;
      const message = `${unit.unit_id}: lexical pattern ${pattern.pattern_id} expects ${pattern.unit_type}, got ${unit.unit_type}`;
      const diagnostic = {
        diagnostic_id: `profile-lexical-${diagnostics.length + 1}`,
        unit_id: unit.unit_id,
        severity: pattern.severity,
        category: "lexical_unitization",
        finding: message,
        required_action: pattern.note
      };
      diagnostics.push(diagnostic);
      if (pattern.severity === "fail") errors.push(message);
      else if (pattern.severity === "warning") warnings.push(message);
    }
  }

  if (checkerOutput) {
    errors.push(...validateCheckerOutput(checkerOutput));
    for (const [index, check] of directEditChecks(checkerOutput).entries()) {
      summary.direct_edits_reviewed += 1;
      const label = `checker_output.checks[${index}]`;
      const unit = unitMap.get(check.unit_id);
      if (!unit) {
        errors.push(`${label}.unit_id: no extracted unit ${JSON.stringify(check.unit_id)}`);
        continue;
      }
      if (unit.edit_safety && unit.edit_safety !== "safe_to_edit") {
        summary.direct_edit_safety_conflicts += 1;
        errors.push(`${label}: direct edit targets ${unit.unit_id} with edit_safety ${unit.edit_safety}`);
      }
      const text = unit.exact_text || "";
      const original = check.original_text || "";
      const matchCount = countExactMatches(text, original);
      if (matchCount !== 1) {
        errors.push(`${label}.original_text: expected exactly one match in ${unit.unit_id}; found ${matchCount}`);
        continue;
      }
      const range = exactMatchRange(text, original);
      const { allowedMarkers } = markerInventory(unit, policy);
      for (const marker of allowedMarkers) {
        if (rangeStartsOrEndsInsideToken(range, marker) || rangeContainsToken(range, marker)) {
          summary.direct_edit_marker_conflicts += 1;
          errors.push(`${label}.original_text: direct edit touches protected production marker ${marker.token}`);
        }
      }
    }
  }

  return { errors, warnings, summary, diagnostics };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS annotation-sheet profile audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS annotation-sheet profile audit ${result.status}: ${result.summary.units_reviewed} units, ${result.summary.lexical_matches} lexical matches, ${result.summary.marker_tokens} production markers, ${result.warnings.length} warnings.`
    );
  }
  if (result.summary.direct_edits_reviewed > 0) {
    lines.push(
      `Direct edits checked: ${result.summary.direct_edits_reviewed}; marker conflicts: ${result.summary.direct_edit_marker_conflicts}; safety conflicts: ${result.summary.direct_edit_safety_conflicts}.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const profile = readJson(options.profilePath, options.profilePath);
  const unitsDocument = options.unitsPath ? readJson(options.unitsPath, options.unitsPath) : null;
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null;
  const audit = auditProfileUsage({ profile, unitsDocument, checkerOutput });
  const status = audit.errors.length > 0 ? "fail" : audit.warnings.length > 0 ? "warning" : "pass";
  const result = {
    schema_version: AUDIT_SCHEMA_VERSION,
    profile: options.profilePath === "-" ? "stdin" : options.profilePath,
    units: options.unitsPath ? (options.unitsPath === "-" ? "stdin" : options.unitsPath) : "",
    checker_output: options.checkerOutputPath || "",
    status,
    summary: audit.summary,
    diagnostics: audit.diagnostics,
    warnings: audit.warnings,
    errors: audit.errors
  };
  if (options.format === "json") process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(renderText(result));
  if (status === "fail" || (status === "warning" && options.failOnWarning)) process.exit(1);
} catch (error) {
  console.error(`FRUS annotation-sheet profile audit failed: ${error.message}`);
  process.exit(1);
}

export { auditProfileUsage };
