#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const ILE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_heading",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);
const ILE_PATTERN =
  /\b(?:Central Intelligence Agency|CIA|Deputy Director for Operations|Director of the Bureau of Intelligence and Research|Bureau of Intelligence and Research|INR|National Intelligence Council|intelligence|handling restrictions not declassified|KGB|GRU|covert|finding|counter[-\s]?terrorism|Office of Counter[-\s]?Terrorism|S\/CT|terroris[mt]|hijack(?:er|ing|ed)?|hostages?|aircraft piracy|arrest warrant|Interpol|extradit(?:e|ion)|prosecut(?:e|ion|ed|or)|brought to justice|FBI|DEA|Department of Justice|DOJ|anti[-\s]?narcotics|counter[-\s]?narcotics|counternarcotics|narcotics trafficking|drug traffickers?|drug smugglers?|war on drugs|Anti[-\s]?Drug Abuse Act|narcoterrorism)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-intelligence-law-enforcement-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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
  if (registry.schema_version !== "frus-intelligence-law-enforcement-registry-v1") {
    errors.push("registry.schema_version: must be frus-intelligence-law-enforcement-registry-v1");
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

function checkerIleDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const categorySignal = check.category === "intelligence_law_enforcement";
    const evidenceSignal = [
      "intelligence_law_enforcement_basis",
      "intelligence_basis",
      "law_enforcement_basis",
      "counterterrorism_basis",
      "counternarcotics_basis",
      "case_status",
      "agency_identity"
    ].includes(check.evidence_request);
    const ruleSignal = /^FAS-(?:INTEL|ILE|LAW)-\d{3}$/.test(check.rule_id || "");
    const textSignal = ILE_PATTERN.test(original) || ILE_PATTERN.test(replacement);
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
  if (!String(record.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_intelligence_law_enforcement_context";
  if (targetVolume && record.volume_id !== targetVolume) return "cross_volume_intelligence_law_enforcement_context";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, record, match) {
  if (status === "approved") {
    return `Matched approved intelligence/law-enforcement phrase for ${record.document_id} ${record.ile_type}.`;
  }
  if (status === "cross_volume_intelligence_law_enforcement_context") {
    return `Matched intelligence/law-enforcement language tied to ${record.volume_id}; confirm target volume before changing agency identity, intelligence basis, case status, counterterrorism, counternarcotics, prosecution, or source-protection language.`;
  }
  if (status === "needs_intelligence_law_enforcement_context") {
    return `Matched ${match.matched_text}, but registry status is ${record.verification_status}; intelligence/law-enforcement basis is needed before direct edits.`;
  }
  return `Matched an intelligence/law-enforcement variant; review against the approved phrase ${JSON.stringify(record.approved_phrase)}.`;
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
      intelligence_law_enforcement_id: record.intelligence_law_enforcement_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      ile_type: record.ile_type,
      approved_phrase: record.approved_phrase,
      case_or_program: record.case_or_program,
      agency_or_actor: record.agency_or_actor,
      stage_or_role: record.stage_or_role,
      chronology_or_jurisdiction_basis: record.chronology_or_jurisdiction_basis,
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

function isIleLikeUnit(unit) {
  return ILE_UNIT_TYPES.has(unit.unit_type) && ILE_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status === "approved" && replacement === normalizeForm(usage.approved_phrase)) return true;
  }
  return false;
}

function auditIle({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-intelligence-law-enforcement-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        intelligence_law_enforcement_usages: 0,
        warnings: 0,
        unmatched_intelligence_law_enforcement_like_units: 0,
        direct_intelligence_law_enforcement_edit_conflicts: 0,
        by_usage_status: {},
        by_ile_type: {}
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
    if (unitUsages.length === 0 && isIleLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_intelligence_law_enforcement_like_unit",
        finding:
          "Unit contains intelligence/law-enforcement language but no supplied registry record matched it.",
        required_action:
          "Confirm agency identity, source/protection posture, case status, terrorism/counternarcotics basis, and jurisdiction before direct edits.",
        evidence_request: "intelligence_law_enforcement_basis"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerIleDirectEdits(checkerOutput);
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
            "Direct edit touches intelligence/law-enforcement language without a target-volume registry-approved phrase.",
          required_action:
            "Downgrade to comment_only unless the target-volume registry proves the agency, case, terrorism/counternarcotics, prosecution, or sensitive-source form."
        });
      }
    }
  }

  const errorsOut = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  return {
    schema_version: "frus-intelligence-law-enforcement-usage-audit-v1",
    status: errorsOut.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: errorsOut,
    warnings,
    summary: {
      units_scanned: unitsDocument.units.length,
      intelligence_law_enforcement_usages: usages.length,
      warnings: warnings.length,
      unmatched_intelligence_law_enforcement_like_units: unmatched,
      direct_intelligence_law_enforcement_edit_conflicts: conflicts.length,
      by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
      by_ile_type: countBy(usages.map((usage) => usage.ile_type))
    },
    usages,
    diagnostics,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS intelligence/law-enforcement usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS intelligence/law-enforcement usage audit ${result.status}: ${result.summary.intelligence_law_enforcement_usages} registry usages, ${result.summary.unmatched_intelligence_law_enforcement_like_units} unmatched intelligence/law-enforcement-like units, ${result.summary.direct_intelligence_law_enforcement_edit_conflicts} direct-edit conflicts.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditIle({
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
  console.error(`FRUS intelligence/law-enforcement usage audit failed: ${error.message}`);
  process.exit(1);
}
