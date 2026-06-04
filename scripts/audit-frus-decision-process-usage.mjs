#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const DECISION_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "front_matter",
  "source_list_entry",
  "document_heading",
  "unknown_editorial_text"
]);
const DECISION_PATTERN =
  /\b(?:NSR|NSD|NSDD|NSSD|NSC\/DC|PCC|Policy Coordinating Committee|Deputies Committee|National Security Review|National Security Decision Directive|National Security Study Directive|record of decision|draft instructions|draft National Security Review|Tab [A-Z]|Summary of Conclusions|interagency group|work plan|decision directive|presidential decision)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-decision-process-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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

function normalizeForm(value) {
  return String(value || "")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
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
  if (!Array.isArray(unitsDocument.units)) errors.push("units.units: expected array");
  return errors;
}

function validateRegistry(registry) {
  const errors = [];
  if (!isPlainObject(registry)) return ["registry: expected object"];
  if (registry.schema_version !== "frus-decision-process-registry-v1") {
    errors.push("registry.schema_version: must be frus-decision-process-registry-v1");
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeLiteralPattern(form, flags = "g") {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}(?=$|[^A-Za-z0-9])`, flags);
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
    const exactDuplicate = matches.some((item) => item.offset === (match.index || 0) && item.matched_text === match[0]);
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

function suppressContainedMatches(matches) {
  const sorted = matches.slice().sort((a, b) => b.match.length - a.match.length || a.match.offset - b.match.offset);
  const accepted = [];
  for (const item of sorted) {
    const contained = accepted.some(
      (acceptedItem) =>
        item.match.offset >= acceptedItem.match.offset &&
        item.match.offset + item.match.length <= acceptedItem.match.offset + acceptedItem.match.length
    );
    if (!contained) accepted.push(item);
  }
  return accepted.sort((a, b) => a.match.offset - b.match.offset || b.match.length - a.match.length);
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_decision_process_context";
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_decision_process_context";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved decision-process phrase for ${record.document_id} ${record.process_type}.`;
  }
  if (status === "cross_volume_decision_process_context") {
    return `Matched decision-process language tied to ${record.volume_id}; use it only as a style model until the target volume proves the directive number, body, and decision stage.`;
  }
  if (status === "needs_decision_process_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; decision-process evidence is needed before final apparatus.`;
  }
  return `Matched a decision-process variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const rawMatches = [];
  for (const record of registry.records || []) {
    const explicitForms = [record.approved_phrase, ...(record.variant_forms || [])];
    const approved = findMatches(text, record.approved_phrase, "approved_phrase", explicitForms);
    const variants = (record.variant_forms || []).flatMap((form) => findMatches(text, form, "variant_form", explicitForms));
    for (const match of [...approved, ...variants]) rawMatches.push({ record, match });
  }
  return suppressContainedMatches(rawMatches).map(({ record, match }) => {
    const status = usageStatus({ record, match, targetVolume });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      decision_process_id: record.decision_process_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      process_type: record.process_type,
      approved_phrase: record.approved_phrase,
      process_identifier: record.process_identifier,
      process_body: record.process_body,
      decision_stage: record.decision_stage,
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, record, match),
      source_or_context: record.source_or_context,
      source_url: record.source_url,
      verification_status: record.verification_status
    };
  });
}

function isDecisionLikeUnit(unit) {
  return DECISION_UNIT_TYPES.has(unit.unit_type) && DECISION_PATTERN.test(unitText(unit));
}

function checkerDecisionDirectEdits(output) {
  if (!output || !Array.isArray(output.checks)) return [];
  return output.checks.filter((check) => {
    if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) return false;
    return (
      check.category === "decision_process_directive" ||
      check.evidence_request === "decision_process_basis" ||
      /^FAS-DP-\d{3}$/.test(check.rule_id || "") ||
      DECISION_PATTERN.test(`${check.original_text || ""}\n${check.replacement_text || ""}`)
    );
  });
}

function directEditConflicts(output) {
  return checkerDecisionDirectEdits(output).map((check) => ({
    unit_id: check.unit_id || "",
    rule_id: check.rule_id || "",
    original_text: check.original_text || "",
    replacement_text: check.replacement_text || "",
    finding: "Direct edit touches a decision-process, directive, committee, tab, or decision-stage claim.",
    required_action:
      "Downgrade to comment_only. Directive numbers, interagency bodies, tabs, and decision stages require target-volume evidence before final apparatus."
  }));
}

function auditDecisionProcess({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-decision-process-usage-audit-v1",
      status: "fail",
      target_volume: targetVolume,
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        decision_process_usages: 0,
        unmatched_decision_process_like_units: 0,
        direct_decision_process_edit_conflicts: 0,
        warnings: 0,
        by_usage_status: {},
        by_process_type: {}
      },
      usages: [],
      unmatched_decision_process_like_units: [],
      direct_edit_conflicts: []
    };
  }

  const usages = [];
  const matchedUnits = new Set();
  for (const unit of unitsDocument.units || []) {
    const unitUsages = registryMatchesForUnit(unit, registry, targetVolume);
    if (unitUsages.length > 0) {
      usages.push(...unitUsages);
      matchedUnits.add(unit.unit_id);
    }
  }
  const unmatched = (unitsDocument.units || [])
    .filter((unit) => !matchedUnits.has(unit.unit_id) && isDecisionLikeUnit(unit))
    .map((unit) => ({
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      matched_text: unitText(unit).match(DECISION_PATTERN)?.[0] || "",
      finding: "Decision-process, directive, committee, tab, or decision-stage language had no match in the supplied decision-process registry.",
      required_action:
        "Request decision-process evidence or keep the issue in comment-only review; do not alter directive numbers, bodies, tabs, or decision stages on wording alone.",
      evidence_request: "decision_process_basis"
    }));
  const conflicts = directEditConflicts(checkerOutput);
  const warnings = [
    ...usages
      .filter((usage) => usage.usage_status !== "approved")
      .map((usage) => `${usage.unit_id}: ${usage.finding}`),
    ...unmatched.map((item) => `${item.unit_id}: ${item.finding}`)
  ];
  const hardErrors = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    decision_process_usages: usages.length,
    unmatched_decision_process_like_units: unmatched.length,
    direct_decision_process_edit_conflicts: conflicts.length,
    warnings: warnings.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_process_type: countBy(usages.map((usage) => usage.process_type))
  };
  return {
    schema_version: "frus-decision-process-usage-audit-v1",
    status: hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: hardErrors,
    warnings,
    summary,
    usages,
    unmatched_decision_process_like_units: unmatched,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS decision-process usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS decision-process usage audit ${result.status}: ${result.summary.decision_process_usages} usages, ${result.summary.unmatched_decision_process_like_units} unmatched decision-process-like units.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditDecisionProcess({
    unitsDocument: readJson(options.unitsPath),
    registry: readJson(options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath) : null,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS decision-process usage audit failed: ${error.message}`);
  process.exit(1);
}
