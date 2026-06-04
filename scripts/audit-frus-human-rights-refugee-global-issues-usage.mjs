#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const HUMANITARIAN_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_heading",
  "front_matter",
  "source_list_entry",
  "public_source_note",
  "unknown_editorial_text"
]);
const HUMANITARIAN_PATTERN =
  /\b(?:human rights?|Country Reports?|refugee|refugees|immigration|asylum|migration|famine|hunger|starvation|malnutrition|emergency relief|food aid|food assistance|PL\s*480|Title II|Section 416|Section 206|WFP|PVO|A\.?I\.?D\.?|USAID|PRM|HA|HR|IO|WHO|WHO\/GPA|UNICEF|UNDRO|UNEP|WMO|sanctions?|waivers?|certification|determination|public reports?|AIDS|HIV|population policy|UNFPA|environmental?|ozone|CFCs?|chlorofluorocarbons?|whaling|global issues?)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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
  if (registry.schema_version !== "frus-human-rights-refugee-global-issues-registry-v1") {
    errors.push("registry.schema_version: must be frus-human-rights-refugee-global-issues-registry-v1");
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

function checkerHumanitarianDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const categorySignal = check.category === "human_rights_refugee_global_issues";
    const evidenceSignal = [
      "humanitarian_rights_basis",
      "report_basis",
      "country_or_population_scope",
      "refugee_status",
      "relief_stage",
      "legal_or_program_authority",
      "amount_or_metric",
      "sanctions_or_waiver_basis",
      "international_org_basis",
      "pvo_basis"
    ].includes(check.evidence_request);
    const ruleSignal = /^FAS-(?:HR|HUM|REF|GI)-\d{3}$/.test(check.rule_id || "");
    const textSignal = HUMANITARIAN_PATTERN.test(original) || HUMANITARIAN_PATTERN.test(replacement);
    if (!(categorySignal || evidenceSignal || ruleSignal || textSignal) || !DIRECT_ACTIONS.has(check.recommended_action)) {
      continue;
    }
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_human_rights_refugee_global_issues_context";
  }
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_human_rights_refugee_global_issues_context";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved human-rights/refugee/global-issues phrase for ${record.document_id} ${record.record_type}.`;
  }
  if (status === "cross_volume_human_rights_refugee_global_issues_context") {
    return `Matched human-rights/refugee/global-issues language tied to ${record.volume_id}; confirm target volume before changing report basis, country/population scope, relief stage, legal/program authority, public-health metric, international-organization role, or environmental/treaty status.`;
  }
  if (status === "needs_human_rights_refugee_global_issues_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; human-rights/refugee/global-issues basis is needed before direct edits.`;
  }
  return `Matched a human-rights/refugee/global-issues variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
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
      humanitarian_id: record.humanitarian_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      record_type: record.record_type,
      approved_phrase: record.approved_phrase,
      issue_area: record.issue_area,
      institution_or_actor: record.institution_or_actor,
      source_family: record.source_family,
      public_or_archival_basis: record.public_or_archival_basis,
      legal_or_program_basis: record.legal_or_program_basis,
      quantity_or_metric: record.quantity_or_metric,
      stage_or_status: record.stage_or_status,
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

function isHumanitarianLikeUnit(unit) {
  return HUMANITARIAN_UNIT_TYPES.has(unit.unit_type) && HUMANITARIAN_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status === "approved" && replacement === normalizeForm(usage.approved_phrase)) return true;
  }
  return false;
}

function auditHumanitarian({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-human-rights-refugee-global-issues-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        human_rights_refugee_global_issues_usages: 0,
        warnings: 0,
        unmatched_human_rights_refugee_global_issues_like_units: 0,
        direct_human_rights_refugee_global_issues_edit_conflicts: 0,
        by_usage_status: {},
        by_record_type: {}
      },
      usages: [],
      diagnostics: [],
      direct_edit_conflicts: []
    };
  }

  const warnings = [];
  const usages = [];
  const diagnostics = [];
  const usagesByUnit = new Map();
  let unmatched = 0;

  for (const unit of unitsDocument.units) {
    const unitUsages = registryMatchesForUnit(unit, registry, targetVolume);
    if (unitUsages.length > 0) {
      usages.push(...unitUsages);
      usagesByUnit.set(unit.unit_id, unitUsages);
      for (const item of unitUsages) {
        if (item.recommended_action === "comment_only") warnings.push(`${item.unit_id}: ${item.finding}`);
      }
    }
    if (unitUsages.length === 0 && isHumanitarianLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_human_rights_refugee_global_issues_like_unit",
        finding:
          "Unit contains human-rights/refugee/global-issues language but no supplied registry record matched it.",
        required_action:
          "Confirm report basis, country/population scope, relief stage, legal/program authority, amount or metric, international-organization role, public/archival basis, and status before direct edits.",
        evidence_request: "humanitarian_rights_basis"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerHumanitarianDirectEdits(checkerOutput);
  const conflicts = [];
  for (const [unitId, checks] of directEdits.entries()) {
    const unitUsages = usagesByUnit.get(unitId) || [];
    for (const check of checks) {
      if (!directEditSupported(check, unitUsages)) {
        conflicts.push({
          unit_id: unitId,
          rule_id: check.rule_id || "",
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding:
            "Direct edit touches human-rights/refugee/global-issues language without a target-volume registry-approved phrase.",
          required_action:
            "Downgrade to comment_only unless the target-volume registry proves the report basis, country/population scope, relief stage, legal/program authority, amount/metric, international-organization role, or status."
        });
      }
    }
  }

  const errorsOut = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  return {
    schema_version: "frus-human-rights-refugee-global-issues-usage-audit-v1",
    status: errorsOut.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: errorsOut,
    warnings,
    summary: {
      units_scanned: unitsDocument.units.length,
      human_rights_refugee_global_issues_usages: usages.length,
      warnings: warnings.length,
      unmatched_human_rights_refugee_global_issues_like_units: unmatched,
      direct_human_rights_refugee_global_issues_edit_conflicts: conflicts.length,
      by_usage_status: countBy(usages.map((usageItem) => usageItem.usage_status)),
      by_record_type: countBy(usages.map((usageItem) => usageItem.record_type))
    },
    usages,
    diagnostics,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(
      `FRUS human-rights/refugee/global-issues usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`
    );
  } else {
    lines.push(
      `FRUS human-rights/refugee/global-issues usage audit ${result.status}: ${result.summary.human_rights_refugee_global_issues_usages} registry usages, ${result.summary.unmatched_human_rights_refugee_global_issues_like_units} unmatched human-rights/refugee/global-issues-like units, ${result.summary.direct_human_rights_refugee_global_issues_edit_conflicts} direct-edit conflicts.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditHumanitarian({
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
  console.error(`FRUS human-rights/refugee/global-issues usage audit failed: ${error.message}`);
  process.exit(1);
}
