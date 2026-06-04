#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const ECONOMIC_FINANCIAL_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_heading",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);
const ECONOMIC_PATTERN =
  /\b(?:IMF|International Monetary Fund|World Bank|IBRD|GAB|General Arrangements to Borrow|MDBs?|multilateral development banks?|Paris Club|Baker Plan|Export-Import Bank|Eximbank|OPIC|ESF|AID|Treasury ESF|foreign assistance|foreign aid|budget authority|budget reductions?|appropriations?|quota(?:s)?|debt|arrears?|arrearages|loans?|grants?|refinanc(?:e|ing)|commercial banks?|exchange rates?|commodity prices?|foreign direct investment|concessional rates?|G-7|G\u20137|IMF\/IBRD|fiscal year|FY)\b|[$]\s?\d|\b\d+(?:\.\d+)?\s?(?:percent|billion|million|trillion)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-economic-financial-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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
  if (registry.schema_version !== "frus-economic-financial-registry-v1") {
    errors.push("registry.schema_version: must be frus-economic-financial-registry-v1");
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

function checkerEconomicFinancialDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const financialSignal =
      ["economic_financial_data", "congressional_legal_authority", "foreign_org_identity"].includes(check.category) ||
      ["financial_data", "economic_financial_basis", "legal_authority"].includes(check.evidence_request) ||
      /^FAS-(?:ECONOMIC-FINANCIAL|ECON|EF)-\d{3}$/.test(check.rule_id || "") ||
      ECONOMIC_PATTERN.test(original) ||
      ECONOMIC_PATTERN.test(replacement);
    if (!financialSignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ record, match, targetVolume }) {
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_financial_context";
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_economic_financial_context";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved economic/financial phrase for ${record.document_id} ${record.financial_type}.`;
  }
  if (status === "cross_volume_economic_financial_context") {
    return `Matched economic/financial language tied to ${record.volume_id}; confirm target volume before changing money, debt, IMF, World Bank, aid-finance, quota, arrears, or budget language.`;
  }
  if (status === "needs_financial_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; financial basis is needed before direct edits.`;
  }
  return `Matched an economic/financial variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
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
      economic_financial_id: record.economic_financial_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      financial_type: record.financial_type,
      approved_phrase: record.approved_phrase,
      institution_or_program: record.institution_or_program,
      amount_or_metric: record.amount_or_metric,
      policy_context: record.policy_context,
      citation_or_locator: record.citation_or_locator,
      public_or_archival_basis: record.public_or_archival_basis,
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

function isEconomicFinancialLikeUnit(unit) {
  return ECONOMIC_FINANCIAL_UNIT_TYPES.has(unit.unit_type) && ECONOMIC_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status === "approved" && replacement === normalizeForm(usage.approved_phrase)) {
      return true;
    }
  }
  return false;
}

function auditEconomicFinancial({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-economic-financial-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        economic_financial_usages: 0,
        warnings: 0,
        unmatched_economic_financial_like_units: 0,
        direct_economic_financial_edit_conflicts: 0,
        by_usage_status: {},
        by_financial_type: {}
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
    if (unitUsages.length === 0 && isEconomicFinancialLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_economic_financial_like_unit",
        finding:
          "Money, percentage, debt, IMF, World Bank, aid-finance, budget, arrears, quota, or development-bank language had no match in the supplied economic/financial registry.",
        recommended_action: "comment_only",
        evidence_request: "financial_data"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directConflicts = [];
  const directEditsByUnit = checkerEconomicFinancialDirectEdits(checkerOutput);
  for (const [unitId, checks] of directEditsByUnit) {
    const unitUsages = usagesByUnit.get(unitId) || [];
    for (const check of checks) {
      if (!directEditSupported(check, unitUsages)) {
        directConflicts.push({
          unit_id: unitId,
          rule_id: check.rule_id || "",
          category: check.category || "",
          evidence_request: check.evidence_request || "",
          recommended_action: check.recommended_action,
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding:
            "Direct edit touches economic/financial language but does not exactly match a target-volume approved registry phrase. Downgrade to comment_only or add verified registry support."
        });
      }
    }
  }

  const status = directConflicts.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass";
  return {
    schema_version: "frus-economic-financial-usage-audit-v1",
    status,
    errors: [],
    warnings,
    summary: {
      units_scanned: unitsDocument.units.length,
      economic_financial_usages: usages.length,
      warnings: warnings.length,
      unmatched_economic_financial_like_units: unmatched,
      direct_economic_financial_edit_conflicts: directConflicts.length,
      by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
      by_financial_type: countBy(usages.map((usage) => usage.financial_type || "unknown"))
    },
    usages,
    diagnostics,
    direct_edit_conflicts: directConflicts
  };
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath);
  const registry = readJson(options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath) : null;
  const result = auditEconomicFinancial({
    unitsDocument,
    registry,
    checkerOutput,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `FRUS economic/financial usage audit ${result.status}: ${result.summary.economic_financial_usages} usages, ${result.summary.warnings} warnings, ${result.summary.direct_economic_financial_edit_conflicts} direct-edit conflicts.`
    );
    for (const warning of result.warnings.slice(0, 25)) console.log(`warning: ${warning}`);
    for (const conflict of result.direct_edit_conflicts) console.log(`conflict: ${conflict.unit_id} ${conflict.rule_id}`);
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS economic/financial usage audit failed: ${error.message}`);
  process.exit(1);
}
