#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const MARKER_PATTERN = /<(?:i|r|b|n|m|[0-9]+)>/g;
const ANGLE_TOKEN_PATTERN = /<[^>\s]+>/g;

function usage() {
  console.error(
    "Usage: node scripts/preflight-frus-pseudo-markers.mjs --units <extracted-units.json> --output <checker-output.json|->"
  );
  process.exit(2);
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

function parseArgs(argv) {
  let unitsPath = null;
  let outputPath = null;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      outputPath = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!unitsPath || !outputPath || (unitsPath === "-" && outputPath === "-")) {
    usage();
  }

  return { unitsPath, outputPath };
}

function findAll(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  return [...text.matchAll(re)].map((match) => ({
    token: match[0],
    start: match.index,
    end: match.index + match[0].length
  }));
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

function loadUnits(unitsDocument, errors) {
  if (!isPlainObject(unitsDocument)) {
    errors.push("$.units_document: expected object");
    return new Map();
  }
  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push("$.schema_version: must be frus-extracted-units-v1");
  }
  if (!Array.isArray(unitsDocument.units)) {
    errors.push("$.units: expected array");
    return new Map();
  }

  const units = new Map();
  unitsDocument.units.forEach((unit, index) => {
    const label = `$.units[${index}]`;
    if (!isPlainObject(unit)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${label}.unit_id: expected non-empty string`);
      return;
    }
    if (typeof unit.exact_text !== "string") {
      errors.push(`${label}.exact_text: expected string`);
    }
    units.set(unit.unit_id, unit);
  });

  return units;
}

function markerInventory(unit) {
  const text = unit.exact_text || "";
  const allowedMarkers = findAll(text, MARKER_PATTERN);
  const allAngleTokens = findAll(text, ANGLE_TOKEN_PATTERN);
  const allowedRanges = new Set(allowedMarkers.map((marker) => `${marker.start}:${marker.end}`));
  const unexpectedTokens = allAngleTokens.filter((token) => !allowedRanges.has(`${token.start}:${token.end}`));

  return { allowedMarkers, unexpectedTokens };
}

function validateMarkerInventory(units, errors, warnings) {
  let markerCount = 0;
  let unexpectedCount = 0;

  for (const unit of units.values()) {
    const inventory = markerInventory(unit);
    markerCount += inventory.allowedMarkers.length;
    unexpectedCount += inventory.unexpectedTokens.length;

    if (inventory.unexpectedTokens.length > 0) {
      const tokens = inventory.unexpectedTokens.map((token) => token.token).join(", ");
      if (unit.marker_policy === "allow_unknown_angle_tokens") {
        warnings.push(`${unit.unit_id}: unexpected angle tokens allowed by marker_policy: ${tokens}`);
      } else {
        errors.push(`${unit.unit_id}: unexpected angle tokens need wrapper mapping or comment-only handling: ${tokens}`);
      }
    }
  }

  return { markerCount, unexpectedCount };
}

function validateDirectEdit(check, unit, label, errors) {
  if (!DIRECT_ACTIONS.has(check.recommended_action)) return 0;

  const text = unit.exact_text || "";
  const original = check.original_text || "";
  const matchCount = countExactMatches(text, original);
  if (matchCount !== 1) {
    errors.push(`${label}.original_text: expected exactly one match in ${check.unit_id}; found ${matchCount}`);
    return 0;
  }

  const range = exactMatchRange(text, original);
  const { allowedMarkers } = markerInventory(unit);
  let touchedMarkers = 0;

  for (const marker of allowedMarkers) {
    if (rangeStartsOrEndsInsideToken(range, marker)) {
      errors.push(`${label}.original_text: edit boundary splits production marker ${marker.token}`);
    }
    if (rangeContainsToken(range, marker)) {
      touchedMarkers += 1;
      if (unit.allow_marker_edit !== true) {
        errors.push(`${label}.original_text: direct edit touches production marker ${marker.token}`);
      }
    }
  }

  if (unit.marker_policy === "preserve_literal" && /<(?:i|r|b|n|m|[0-9]+)>/.test(check.replacement_text || "")) {
    const originalMarkers = findAll(original, MARKER_PATTERN).map((marker) => marker.token).join(" ");
    const replacementMarkers = findAll(check.replacement_text || "", MARKER_PATTERN)
      .map((marker) => marker.token)
      .join(" ");
    if (originalMarkers !== replacementMarkers) {
      errors.push(`${label}.replacement_text: replacement changes literal production-marker sequence`);
    }
  }

  return touchedMarkers;
}

function validateOutput(output, units) {
  const errors = [];
  const warnings = [];
  let directEditCount = 0;
  let markerTouchCount = 0;

  if (!isPlainObject(output)) {
    errors.push("$: expected checker output object");
    return { errors, warnings, directEditCount, markerTouchCount, markerCount: 0, unexpectedCount: 0 };
  }
  if (!Array.isArray(output.checks)) {
    errors.push("$.checks: expected array");
    return { errors, warnings, directEditCount, markerTouchCount, markerCount: 0, unexpectedCount: 0 };
  }

  const inventory = validateMarkerInventory(units, errors, warnings);

  output.checks.forEach((check, index) => {
    const label = `$.checks[${index}]`;
    if (!isPlainObject(check)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (!DIRECT_ACTIONS.has(check.recommended_action)) return;

    directEditCount += 1;
    const unit = units.get(check.unit_id);
    if (!unit) {
      errors.push(`${label}.unit_id: no matching extracted unit ${JSON.stringify(check.unit_id)}`);
      return;
    }
    markerTouchCount += validateDirectEdit(check, unit, label, errors);
  });

  return { errors, warnings, directEditCount, markerTouchCount, ...inventory };
}

try {
  const { unitsPath, outputPath } = parseArgs(process.argv);
  const unitErrors = [];
  const units = loadUnits(readJson(unitsPath, unitsPath), unitErrors);
  const result = validateOutput(readJson(outputPath, outputPath), units);
  const errors = [...unitErrors, ...result.errors];

  for (const warning of result.warnings) {
    console.error(`warning: ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`FRUS pseudo-marker preflight failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `FRUS pseudo-marker preflight passed: ${result.directEditCount} direct edits, ${result.markerCount} production markers, ${result.markerTouchCount} markers touched, ${result.unexpectedCount} unexpected angle tokens.`
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
