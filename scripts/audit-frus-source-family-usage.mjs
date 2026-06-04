#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const SOURCE_FAMILY_UNIT_TYPES = new Set([
  "source_note",
  "front_matter",
  "editorial_note",
  "follow_on_footnote",
  "attachment_note",
  "unknown_editorial_text"
]);
const SOURCE_FAMILY_PATTERN =
  /\b(?:PROFS|W Files|System IV|H[-–—]Files|Central Foreign Policy File|[DPN] Reels|Public Papers|Department of State Bulletin|White House Office of Speechwriting|WHORM|Lot \d{2}D\d+|Bush Presidential Records|White House Staff and Office Files|George Shultz Papers|Executive Secretariat|NSC Institutional Files|Presidential Library|Reagan Library files|Bush Library files)\b/i;
const SOURCE_FAMILY_CATEGORIES = new Set(["source_family"]);
const SOURCE_FAMILY_EVIDENCE = new Set(["source_family"]);

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-source-family-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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
  if (registry.schema_version !== "frus-source-family-registry-v1") {
    errors.push("registry.schema_version: must be frus-source-family-registry-v1");
  }
  if (!Array.isArray(registry.families)) errors.push("registry.families: expected array");
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

function literalPatternSource(value) {
  return escapeRegExp(value)
    .replace(/'/g, "['‘’]")
    .replace(/"/g, "[\"“”]")
    .replace(/-/g, "[-–—]");
}

function makeLiteralPattern(form, flags = "gi") {
  return new RegExp(`(?<![A-Za-z0-9])${literalPatternSource(form)}(?=$|[^A-Za-z0-9])`, flags);
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
}

function familyForms(family) {
  return [
    family.display_family,
    ...(family.variant_forms || []),
    ...(family.distinguishing_tokens || [])
  ].filter((form) => typeof form === "string" && form.trim());
}

function flattenForms(family) {
  return (family.do_not_flatten_to || []).filter((form) => typeof form === "string" && form.trim());
}

function textHasAnyForm(text, forms) {
  return forms.some((form) => makeLiteralPattern(form).test(text));
}

function findFamilyMatches(text, family) {
  const matches = [];
  const seen = new Set();
  const forms = [
    { form: family.display_family, kind: "display_family" },
    ...(family.variant_forms || []).map((form) => ({ form, kind: "variant_form" })),
    ...(family.distinguishing_tokens || []).map((form) => ({ form, kind: "distinguishing_token" }))
  ].filter((item) => typeof item.form === "string" && item.form.trim());
  for (const item of forms) {
    for (const match of text.matchAll(makeLiteralPattern(item.form))) {
      const key = `${family.source_family_id}:${match.index || 0}:${normalizeForm(match[0])}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        matched_text: match[0],
        match_kind: item.kind,
        offset: match.index || 0,
        length: match[0].length,
        normalized_form: normalizeForm(item.form)
      });
    }
  }
  return suppressContainedFamilyMatches(matches);
}

function suppressContainedFamilyMatches(matches) {
  const sorted = matches
    .slice()
    .sort((a, b) => b.length - a.length || a.offset - b.offset || a.matched_text.localeCompare(b.matched_text));
  const accepted = [];
  for (const match of sorted) {
    const start = match.offset;
    const end = match.offset + match.length;
    const contained = accepted.some((item) => start >= item.offset && end <= item.offset + item.length);
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || a.matched_text.localeCompare(b.matched_text));
}

function checkerSourceFamilyDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const reviewText = [
      check.rule_id,
      check.category,
      check.evidence_request,
      check.finding,
      check.standard,
      check.original_text,
      check.replacement_text,
      check.comment_text,
      check.verification_target
    ]
      .filter(Boolean)
      .join(" ");
    const sourceFamilySignal =
      SOURCE_FAMILY_PATTERN.test(reviewText) ||
      SOURCE_FAMILY_CATEGORIES.has(check.category || "") ||
      SOURCE_FAMILY_EVIDENCE.has(check.evidence_request || "") ||
      /^FAS-SF-\d{3}$/.test(check.rule_id || "");
    if (!sourceFamilySignal || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ family, match, targetVolume, familyCount }) {
  if (!String(family.verification_status || "").startsWith(VERIFIED_PREFIX)) return "needs_source_family_basis";
  if (targetVolume && family.volume_id !== targetVolume) return "cross_volume_source_family_context";
  if (familyCount > 1) return "ambiguous_source_family";
  if (match.match_kind === "variant_form") return "variant_needs_review";
  return "approved";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, family, match) {
  if (status === "approved") return `Matched source family ${family.display_family}.`;
  if (status === "cross_volume_source_family_context") {
    return `Matched ${family.volume_id} source-family language; confirm target-volume source family before direct edits.`;
  }
  if (status === "ambiguous_source_family") {
    return `Matched ${match.matched_text}, but the unit contains multiple source families; do not blend or flatten them.`;
  }
  if (status === "needs_source_family_basis") {
    return `Matched ${match.matched_text}, but registry status is ${family.verification_status}; source-family basis is needed before direct edits.`;
  }
  return `Matched a source-family variant; review against approved family ${JSON.stringify(family.display_family)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const raw = [];
  for (const family of registry.families || []) {
    for (const match of findFamilyMatches(text, family)) raw.push({ family, match });
  }
  const familyIds = new Set(raw.map((item) => item.family.source_family_id));
  return raw.map(({ family, match }) => {
    const status = usageStatus({ family, match, targetVolume, familyCount: familyIds.size });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      source_family_id: family.source_family_id,
      volume_id: family.volume_id,
      display_family: family.display_family,
      source_family_type: family.source_family_type,
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      required_components_when_present: family.required_components_when_present || [],
      do_not_flatten_to: family.do_not_flatten_to || [],
      source_or_context: family.source_or_context,
      source_url: family.source_url,
      verification_status: family.verification_status,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, family, match)
    };
  });
}

function directEditSupportedByFamily(check, unitFamilies, registry, targetVolume) {
  const original = check.original_text || "";
  const replacement = check.replacement_text || "";
  if (unitFamilies.length === 0) return false;
  if (unitFamilies.some((usage) => usage.usage_status !== "approved")) return false;

  const replacementFamilies = new Set();
  for (const family of registry.families || []) {
    if (textHasAnyForm(replacement, familyForms(family))) replacementFamilies.add(family.source_family_id);
  }

  if (replacementFamilies.size > 0) {
    for (const familyId of replacementFamilies) {
      const family = (registry.families || []).find((item) => item.source_family_id === familyId);
      if (!family) continue;
      const verified = String(family.verification_status || "").startsWith(VERIFIED_PREFIX);
      const sameVolume = !targetVolume || family.volume_id === targetVolume;
      const originalHadFamily = textHasAnyForm(original, familyForms(family));
      if (!verified || !sameVolume || !originalHadFamily) return false;
    }
  }

  for (const usage of unitFamilies) {
    const family = (registry.families || []).find((item) => item.source_family_id === usage.source_family_id);
    if (!family || family.volume_id !== targetVolume || !String(family.verification_status || "").startsWith(VERIFIED_PREFIX)) {
      continue;
    }
    const originalHadFamily = textHasAnyForm(original, familyForms(family));
    if (!originalHadFamily) continue;
    const replacementPreservesFamily = textHasAnyForm(replacement, familyForms(family));
    const replacementFlattensFamily = !replacementPreservesFamily && textHasAnyForm(replacement, flattenForms(family));
    if (!replacementPreservesFamily || replacementFlattensFamily) return false;
  }
  return true;
}

function auditSourceFamilyUsage({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const warnings = [];
  const usages = [];
  const unmatched = [];
  const directConflicts = [];
  const directEditsByUnit = checkerSourceFamilyDirectEdits(checkerOutput);

  for (const unit of unitsDocument.units || []) {
    if (!SOURCE_FAMILY_UNIT_TYPES.has(unit.unit_type || "")) continue;
    const text = unitText(unit);
    const unitUsages = registryMatchesForUnit(unit, registry, targetVolume);
    usages.push(...unitUsages);
    if (unitUsages.length === 0 && SOURCE_FAMILY_PATTERN.test(text)) {
      unmatched.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        matched_text: text.slice(0, 240),
        finding: "Source-family-like language did not match the supplied registry.",
        recommended_action: "comment_only",
        evidence_request: "source_family"
      });
    }
    for (const check of directEditsByUnit.get(unit.unit_id) || []) {
      if (!directEditSupportedByFamily(check, unitUsages, registry, targetVolume)) {
        directConflicts.push({
          unit_id: unit.unit_id,
          rule_id: check.rule_id || "",
          category: check.category || "",
          original_text: check.original_text || "",
          replacement_text: check.replacement_text || "",
          finding:
            "Direct source-family edit lacks target-volume registry support or flattens a specific source family into a generic path.",
          required_action: "Change to comment_only or supply target-volume source-family evidence."
        });
      }
    }
  }

  for (const usage of usages) {
    if (usage.usage_status !== "approved") warnings.push(`${usage.unit_id}: ${usage.finding}`);
  }
  for (const item of unmatched) warnings.push(`${item.unit_id}: ${item.finding}`);

  const summary = {
    units_scanned: (unitsDocument.units || []).filter((unit) => SOURCE_FAMILY_UNIT_TYPES.has(unit.unit_type || "")).length,
    source_family_usages: usages.length,
    unmatched_source_family_like_units: unmatched.length,
    ambiguous_source_family_units: new Set(
      usages.filter((usage) => usage.usage_status === "ambiguous_source_family").map((usage) => usage.unit_id)
    ).size,
    direct_source_family_edit_conflicts: directConflicts.length,
    warnings: warnings.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_source_family_type: countBy(usages.map((usage) => usage.source_family_type))
  };
  return {
    schema_version: "frus-source-family-usage-audit-v1",
    status: directConflicts.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    summary,
    usages,
    unmatched_source_family_like_units: unmatched,
    direct_source_family_edit_conflicts: directConflicts,
    warnings
  };
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath);
  const registry = readJson(options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath) : null;
  const errors = [
    ...validateUnits(unitsDocument),
    ...validateRegistry(registry),
    ...validateOutput(checkerOutput)
  ];
  if (errors.length > 0) {
    const result = {
      schema_version: "frus-source-family-usage-audit-v1",
      status: "fail",
      target_volume: options.targetVolume,
      summary: {
        units_scanned: 0,
        source_family_usages: 0,
        unmatched_source_family_like_units: 0,
        ambiguous_source_family_units: 0,
        direct_source_family_edit_conflicts: 0,
        warnings: 0
      },
      usages: [],
      unmatched_source_family_like_units: [],
      direct_source_family_edit_conflicts: [],
      warnings: [],
      errors
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  const result = auditSourceFamilyUsage({
    unitsDocument,
    registry,
    checkerOutput,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `FRUS source-family usage audit ${result.status}: ${result.summary.source_family_usages} usages, ${result.summary.unmatched_source_family_like_units} unmatched source-family-like units, ${result.summary.ambiguous_source_family_units} ambiguous units, ${result.summary.direct_source_family_edit_conflicts} direct-edit conflicts.`
    );
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
    for (const conflict of result.direct_source_family_edit_conflicts) {
      console.log(`conflict: ${conflict.unit_id}: ${conflict.finding}`);
    }
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS source-family usage audit failed: ${error.message}`);
  process.exit(1);
}
