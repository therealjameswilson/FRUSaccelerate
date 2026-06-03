#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const SOURCE_LIKE_UNIT_TYPES = new Set(["source_note", "source_list_entry", "front_matter"]);
const VERIFIED_PREFIX = "verified_";

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-source-list-usage.mjs --units <extracted-units.json|-> --registry <source-list-registry.json> [--checker-output output.json] [--target-volume VOLUME-ID] [--format json|text] [--fail-on-warning]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
  let targetVolume = "";
  let format = "json";
  let failOnWarning = false;

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
    } else if (arg === "--fail-on-warning") {
      failOnWarning = true;
    } else {
      usage();
    }
  }

  if (
    !unitsPath ||
    !registryPath ||
    (unitsPath === "-" && checkerOutputPath === "-") ||
    (registryPath === "-" && checkerOutputPath === "-") ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }
  return { unitsPath, registryPath, checkerOutputPath, targetVolume, format, failOnWarning };
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
  if (!isPlainObject(registry)) return ["registry: expected source-list-registry object"];
  if (registry.schema_version !== "frus-source-list-registry-v1") {
    errors.push("registry.schema_version: must be frus-source-list-registry-v1");
  }
  if (typeof registry.source_list_registry_id !== "string" || registry.source_list_registry_id.length === 0) {
    errors.push("registry.source_list_registry_id: expected non-empty string");
  }
  if (typeof registry.captured_at !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(registry.captured_at)) {
    errors.push("registry.captured_at: expected YYYY-MM-DD");
  }
  if (!Array.isArray(registry.records)) {
    errors.push("registry.records: expected array");
    return errors;
  }
  const seen = new Set();
  registry.records.forEach((record, index) => {
    const label = `registry.records[${index}]`;
    if (!isPlainObject(record)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of [
      "source_item_id",
      "source_type",
      "volume_id",
      "approved_source_form",
      "repository_or_parent",
      "front_matter_section",
      "source_note_usage",
      "source_url",
      "verification_status"
    ]) {
      if (typeof record[key] !== "string" || record[key].length === 0) {
        errors.push(`${label}.${key}: expected non-empty string`);
      }
    }
    if (typeof record.source_item_id === "string") {
      if (seen.has(record.source_item_id)) errors.push(`${label}.source_item_id: duplicate ${record.source_item_id}`);
      seen.add(record.source_item_id);
    }
    if (!Array.isArray(record.variant_forms)) errors.push(`${label}.variant_forms: expected array`);
  });
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!output) return errors;
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  if (output.schema_version !== "checker-output-v1") {
    errors.push("checker_output.schema_version: must be checker-output-v1");
  }
  if (!Array.isArray(output.checks)) {
    errors.push("checker_output.checks: expected array");
  }
  return errors;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeLiteralPattern(form, flags = "g") {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}(?![A-Za-z0-9])`, flags);
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
}

function findMatches(text, form, kind, explicitForms = []) {
  const matches = [];
  if (!String(form || "").trim()) return matches;
  const exactPattern = makeLiteralPattern(form, "g");
  for (const match of text.matchAll(exactPattern)) {
    matches.push({
      matched_text: match[0],
      match_kind: kind,
      offset: match.index || 0,
      length: match[0].length,
      normalized_form: normalizeForm(form)
    });
  }
  const foldedPattern = makeLiteralPattern(form, "gi");
  for (const match of text.matchAll(foldedPattern)) {
    const explicitDuplicate = explicitForms.some((explicitForm) => explicitForm === match[0]);
    const exactDuplicate = matches.some(
      (item) => item.offset === (match.index || 0) && item.matched_text === match[0]
    );
    if (!explicitDuplicate && !exactDuplicate && normalizeForm(match[0]) === normalizeForm(form)) {
      matches.push({
        matched_text: match[0],
        match_kind: "case_or_punctuation_variant",
        offset: match.index || 0,
        length: match[0].length,
        normalized_form: normalizeForm(form)
      });
    }
  }
  return matches;
}

function checkerSourceListDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const sourceListSignal =
      check.category === "source_list_front_matter" ||
      check.evidence_request === "source_list_basis" ||
      check.evidence_request === "source_family" ||
      /^FAS-SLF-\d{3}$/.test(check.rule_id || "");
    if (!sourceListSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_source_list_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) {
    return "cross_volume_source";
  }
  if (match.match_kind === "approved_source_form") {
    return "approved";
  }
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved ${record.source_type} source-list form for ${record.volume_id}.`;
  }
  if (status === "cross_volume_source") {
    return `Matched a source-list form tied to ${record.volume_id}; confirm this volume's Sources/front matter before changing text.`;
  }
  if (status === "needs_source_list_context") {
    return `Matched ${record.source_type} form, but the registry record is not verified for final source-list use.`;
  }
  if (match.match_kind === "case_or_punctuation_variant") {
    return `Matched a case or punctuation variant of the approved source form ${JSON.stringify(record.approved_source_form)}.`;
  }
  return `Matched a source-list variant; review against the approved source form ${JSON.stringify(record.approved_source_form)}.`;
}

function sourceLikeTextWithoutHits(unit) {
  const text = unitText(unit);
  if (unit.unit_type === "source_note" && /\bSource:\s*/i.test(text)) return true;
  if (unit.unit_type === "source_list_entry" || unit.unit_type === "front_matter") return true;
  return /\b(?:Library|Archives|Lot\s+\d|Record Group|Published Sources|Unpublished Sources|https?:\/\/)\b/i.test(text);
}

function suppressContainedMatches(matches) {
  const sorted = matches
    .slice()
    .sort((a, b) => b.length - a.length || a.offset - b.offset);
  const accepted = [];
  for (const match of sorted) {
    const contained = accepted.some(
      (item) => match.offset >= item.offset && match.offset + match.length <= item.offset + item.length
    );
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || b.length - a.length);
}

function buildSourceListUsageAudit({ unitsDocument, registry, checkerOutput, targetVolume, sourceFiles }) {
  const errors = [];
  const warnings = [];
  const directEditsByUnit = checkerSourceListDirectEdits(checkerOutput);
  const usages = [];
  const unitsWithHits = new Set();

  for (const unit of unitsDocument.units) {
    const text = unitText(unit);
    for (const record of registry.records) {
      const formEntries = [
        { form: record.approved_source_form, kind: "approved_source_form" },
        ...(record.variant_forms || []).map((form) => ({ form, kind: "variant_form" }))
      ];
      const explicitForms = formEntries.map((entry) => entry.form);
      const rawMatches = [];
      for (const entry of formEntries) {
        for (const match of findMatches(text, entry.form, entry.kind, explicitForms)) {
          rawMatches.push(match);
        }
      }
      for (const match of suppressContainedMatches(rawMatches)) {
        const status = usageStatus({ record, match, targetVolume });
        const directEditChecks = directEditsByUnit.get(unit.unit_id) || [];
        const directEditRequested = directEditChecks.length > 0;
        const usage = {
          usage_id: `source-list-usage-${String(usages.length + 1).padStart(4, "0")}`,
          unit_id: unit.unit_id,
          unit_type: unit.unit_type,
          location: unit.location || "",
          source_item_id: record.source_item_id,
          source_type: record.source_type,
          volume_id: record.volume_id,
          target_volume: targetVolume,
          matched_text: match.matched_text,
          match_kind: match.match_kind,
          approved_source_form: record.approved_source_form,
          repository_or_parent: record.repository_or_parent,
          front_matter_section: record.front_matter_section,
          source_note_usage: record.source_note_usage,
          source_url: record.source_url,
          verification_status: record.verification_status,
          usage_status: status,
          recommended_action: actionForStatus(status),
          evidence_request: status === "approved" ? "none" : "source_list_basis",
          evidence_request_detail:
            status === "approved"
              ? ""
              : "Confirm the target volume's Sources page, published-source list, repository parent, and source-family form before direct redline.",
          direct_edit_requested: directEditRequested,
          direct_edit_check_count: directEditChecks.length,
          finding: findingForStatus(status, record, match)
        };
        usages.push(usage);
        unitsWithHits.add(unit.unit_id);
        if (status !== "approved") warnings.push(`${unit.unit_id}: ${usage.finding}`);
        if (directEditRequested && status !== "approved") {
          errors.push(`${unit.unit_id}: direct source-list/front-matter edit requested while usage status is ${status}`);
        }
      }
    }
  }

  const unmatched_source_like_units = unitsDocument.units
    .filter((unit) => SOURCE_LIKE_UNIT_TYPES.has(unit.unit_type) && !unitsWithHits.has(unit.unit_id))
    .filter(sourceLikeTextWithoutHits)
    .map((unit) => ({
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      evidence_request: "source_list_basis",
      finding: "Source-like unit had no match in the supplied source-list/front-matter registry."
    }));
  for (const unit of unmatched_source_like_units) warnings.push(`${unit.unit_id}: ${unit.finding}`);

  for (const [unitId] of directEditsByUnit) {
    if (!unitsWithHits.has(unitId)) {
      errors.push(`${unitId}: direct source-list/front-matter edit requested but no supplied registry form matched the unit`);
    }
  }

  const resultStatus = errors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-source-list-usage-audit-v1",
    generated_at: new Date().toISOString(),
    status: resultStatus,
    target_volume: targetVolume,
    source_files: sourceFiles,
    source_list_registry: {
      source_list_registry_id: registry.source_list_registry_id || "",
      captured_at: registry.captured_at || "",
      source_urls: registry.source_urls || [],
      records: registry.records.length
    },
    summary: {
      units_scanned: unitsDocument.units.length,
      units_with_source_list_hits: unitsWithHits.size,
      source_list_usages: usages.length,
      unmatched_source_like_units: unmatched_source_like_units.length,
      by_source_type: countBy(usages.map((item) => item.source_type)),
      by_usage_status: countBy(usages.map((item) => item.usage_status)),
      warnings: warnings.length,
      errors: errors.length,
      direct_source_list_edit_conflicts: errors.filter((error) => error.includes("direct source-list/front-matter edit")).length
    },
    usages,
    unmatched_source_like_units,
    warnings,
    errors
  };
}

function renderText(report) {
  const lines = [
    `FRUS source-list usage audit ${report.status}: ${report.summary.source_list_usages} matches across ${report.summary.units_with_source_list_hits} units.`,
    `Variants needing review: ${report.summary.by_usage_status.variant_needs_review || 0}; cross-volume sources: ${report.summary.by_usage_status.cross_volume_source || 0}; unmatched source-like units: ${report.summary.unmatched_source_like_units}.`
  ];
  for (const warning of report.warnings.slice(0, 12)) lines.push(`warning: ${warning}`);
  for (const error of report.errors.slice(0, 12)) lines.push(`error: ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const registry = readJson(options.registryPath, options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null;
  const validationErrors = [
    ...validateUnits(unitsDocument),
    ...validateRegistry(registry),
    ...validateOutput(checkerOutput)
  ];
  if (validationErrors.length > 0) {
    const report = {
      schema_version: "frus-source-list-usage-audit-v1",
      generated_at: new Date().toISOString(),
      status: "fail",
      target_volume: options.targetVolume,
      source_files: {
        units: options.unitsPath,
        registry: options.registryPath,
        checker_output: options.checkerOutputPath || ""
      },
      source_list_registry: {},
      summary: {
        units_scanned: 0,
        units_with_source_list_hits: 0,
        source_list_usages: 0,
        unmatched_source_like_units: 0,
        by_source_type: {},
        by_usage_status: {},
        warnings: 0,
        errors: validationErrors.length,
        direct_source_list_edit_conflicts: 0
      },
      usages: [],
      unmatched_source_like_units: [],
      warnings: [],
      errors: validationErrors
    };
    if (options.format === "json") process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else process.stdout.write(renderText(report));
    process.exit(1);
  }
  const report = buildSourceListUsageAudit({
    unitsDocument,
    registry,
    checkerOutput,
    targetVolume: options.targetVolume,
    sourceFiles: {
      units: options.unitsPath,
      registry: options.registryPath,
      checker_output: options.checkerOutputPath || ""
    }
  });
  if (options.format === "json") process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(renderText(report));
  if (report.status === "fail" || (options.failOnWarning && report.status === "warning")) process.exit(1);
} catch (error) {
  console.error(`FRUS source-list usage audit failed: ${error.message}`);
  process.exit(1);
}
