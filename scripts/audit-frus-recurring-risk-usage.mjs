#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-recurring-risk-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--format text|json]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
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
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }
  if (!unitsPath || !registryPath || !new Set(["text", "json"]).has(format)) usage();
  return { unitsPath, registryPath, checkerOutputPath, format };
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
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
  if (!Array.isArray(unitsDocument.units)) errors.push("units.units: expected array");
  return errors;
}

function validateRegistry(registry) {
  const errors = [];
  if (!isPlainObject(registry)) return ["registry: expected object"];
  if (registry.schema_version !== "frus-recurring-risk-registry-v1") {
    errors.push("registry.schema_version: must be frus-recurring-risk-registry-v1");
  }
  if (!Array.isArray(registry.records)) errors.push("registry.records: expected array");
  return errors;
}

function validateOutput(output) {
  if (!output) return [];
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  const errors = [];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
}

function recordAppliesToUnit(record, unit) {
  if (!Array.isArray(record.unit_types) || record.unit_types.length === 0) return true;
  return record.unit_types.includes("*") || record.unit_types.includes(unit.unit_type);
}

function riskMatchesForUnit(unit, registry) {
  const text = unitText(unit);
  const matches = [];
  for (const record of registry.records || []) {
    if (!recordAppliesToUnit(record, unit)) continue;
    const patterns = Array.isArray(record.detector_patterns) ? record.detector_patterns : [];
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "i");
      const match = regex.exec(text);
      if (!match) continue;
      matches.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        risk_id: record.risk_id,
        risk_family: record.risk_family,
        title: record.title,
        severity: record.severity,
        matched_text: match[0],
        anti_pattern: record.anti_pattern,
        approved_practice: record.approved_practice,
        direct_edit_policy: record.direct_edit_policy,
        recommended_action: "comment_only",
        evidence_request: record.evidence_request,
        comment_text: record.comment_template,
        source_basis: record.source_basis
      });
      break;
    }
  }
  return matches;
}

function checkerRiskDirectEdits(output) {
  if (!output || !Array.isArray(output.checks)) return [];
  return output.checks.filter(
    (check) =>
      isPlainObject(check) &&
      DIRECT_ACTIONS.has(check.recommended_action) &&
      (/^FAS-RISK-\d{3}$/.test(check.rule_id || "") ||
        ["communications_metadata", "cross_reference", "wrapper_safety", "source_image", "source_family"].includes(
          check.evidence_request
        ))
  );
}

function auditRecurringRisks({ unitsDocument, registry, checkerOutput }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-recurring-risk-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        risk_matches: 0,
        direct_recurring_risk_edit_conflicts: 0,
        by_risk_family: {},
        by_severity: {}
      },
      matches: [],
      direct_edit_conflicts: []
    };
  }

  const matches = [];
  const matchesByUnit = new Map();
  for (const unit of unitsDocument.units) {
    const unitMatches = riskMatchesForUnit(unit, registry);
    if (unitMatches.length > 0) {
      matches.push(...unitMatches);
      matchesByUnit.set(unit.unit_id, unitMatches);
    }
  }

  const directConflicts = [];
  for (const check of checkerRiskDirectEdits(checkerOutput)) {
    const matchedRisks = matchesByUnit.get(check.unit_id) || [];
    const commentOnlyRisk = matchedRisks.find((risk) => risk.direct_edit_policy === "comment_only_by_default");
    if (commentOnlyRisk) {
      directConflicts.push({
        unit_id: check.unit_id,
        rule_id: check.rule_id || "",
        risk_id: commentOnlyRisk.risk_id,
        original_text: check.original_text || "",
        replacement_text: check.replacement_text || "",
        finding: "Direct edit touches a recurring compiler-risk pattern that is comment-only by default.",
        required_action: "Downgrade to comment_only unless the exact source image, eRecords copy, backup page/header, or Word-boundary evidence is supplied."
      });
    }
  }

  const warnings = matches.map((match) => `${match.unit_id}: ${match.title}`);
  const hardErrors = directConflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    risk_matches: matches.length,
    direct_recurring_risk_edit_conflicts: directConflicts.length,
    by_risk_family: countBy(matches.map((item) => item.risk_family)),
    by_severity: countBy(matches.map((item) => item.severity))
  };
  const status = hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-recurring-risk-usage-audit-v1",
    status,
    errors: hardErrors,
    warnings,
    summary,
    matches,
    direct_edit_conflicts: directConflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS recurring-risk usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(`FRUS recurring-risk usage audit ${result.status}: ${result.summary.risk_matches} matches across ${result.summary.units_scanned} units.`);
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditRecurringRisks({
    unitsDocument: readJson(options.unitsPath),
    registry: readJson(options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath) : null
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS recurring-risk usage audit failed: ${error.message}`);
  process.exit(1);
}
