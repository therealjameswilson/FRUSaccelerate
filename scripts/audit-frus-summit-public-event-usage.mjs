#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const VERIFIED_PREFIX = "verified_";
const EVENT_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "document_heading",
  "front_matter",
  "public_source_note",
  "unknown_editorial_text"
]);
const EVENT_PATTERN =
  /\b(?:summit|foreign travel|ceremony|signing ceremony|public signing|public remarks?|prepared remarks?|news conference|press conference|press availability|press event|interview|broadcast|television|CBS|Cronkite|toast|arrival|departure|public address|United Nations|UN General Assembly|General Assembly Hall|London Economic Summit|Moscow summit|Kremlin|Dacha|Novo-?Ogar[eë]vo|Public Papers|President[’']s Daily Diary|diary|schedule|itinerary|speech|remarks|participants?|joint statement)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-summit-public-event-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume ENTRY-ID] [--format text|json]"
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
  if (registry.schema_version !== "frus-summit-public-event-registry-v1") {
    errors.push("registry.schema_version: must be frus-summit-public-event-registry-v1");
  }
  if (!Array.isArray(registry.events)) errors.push("registry.events: expected array");
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

function checkerEventDirectEdits(output) {
  const byUnit = new Map();
  if (!output || !Array.isArray(output.checks)) return byUnit;
  for (const check of output.checks) {
    if (!isPlainObject(check)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const categorySignal = check.category === "summit_public_event";
    const evidenceSignal = ["event_chronology", "public_source_basis", "chronology", "time_zone_basis"].includes(
      check.evidence_request
    );
    const ruleSignal = /^FAS-(?:EVENT|SUMMIT|PUB)-\d{3}$/.test(check.rule_id || "");
    const textSignal = EVENT_PATTERN.test(original) || EVENT_PATTERN.test(replacement);
    if (!(categorySignal || evidenceSignal || ruleSignal || textSignal) || !DIRECT_ACTIONS.has(check.recommended_action)) {
      continue;
    }
    const list = byUnit.get(check.unit_id) || [];
    list.push(check);
    byUnit.set(check.unit_id, list);
  }
  return byUnit;
}

function usageStatus({ event, match, targetVolume }) {
  if (!String(event.verification_status || "").startsWith(VERIFIED_PREFIX)) {
    return "needs_summit_public_event_context";
  }
  if (targetVolume && event.volume_id !== targetVolume) return "cross_volume_summit_public_event_context";
  if (match.match_kind.startsWith("approved_")) return "approved";
  return "variant_needs_review";
}

function actionForStatus(status) {
  return status === "approved" ? "no_change" : "comment_only";
}

function findingForStatus(status, event, match) {
  if (status === "approved") {
    return `Matched approved summit/public-event phrase for ${event.document_id} ${event.event_type}.`;
  }
  if (status === "cross_volume_summit_public_event_context") {
    return `Matched summit/public-event language tied to ${event.volume_id}; confirm target volume before changing event date, time, place, sequence, participant, public-source basis, press basis, diary/schedule basis, or full-record target.`;
  }
  if (status === "needs_summit_public_event_context") {
    return `Matched ${match.matched_text}, but registry status is ${event.verification_status}; event chronology basis is needed before direct edits.`;
  }
  return `Matched a summit/public-event variant; review against the approved phrase ${JSON.stringify(event.approved_phrase)}.`;
}

function registryMatchesForUnit(unit, registry, targetVolume) {
  const text = unitText(unit);
  const rawMatches = [];
  for (const event of registry.events || []) {
    const explicitForms = [event.approved_phrase, ...(event.variant_forms || [])];
    const approved = findMatches(text, event.approved_phrase, "approved_phrase", explicitForms);
    const variants = (event.variant_forms || []).flatMap((form) => findMatches(text, form, "variant_form", explicitForms));
    for (const match of [...approved, ...variants]) rawMatches.push({ event, match });
  }
  return suppressContainedMatches(rawMatches).map(({ event, match }) => {
    const status = usageStatus({ event, match, targetVolume });
    return {
      unit_id: unit.unit_id,
      unit_type: unit.unit_type,
      location: unit.location || "",
      event_id: event.event_id,
      volume_id: event.volume_id,
      document_id: event.document_id,
      document_number: event.document_number,
      unit_scope: event.unit_scope,
      event_family: event.event_family,
      event_type: event.event_type,
      approved_phrase: event.approved_phrase,
      date_span: event.date_span,
      place: event.place,
      public_source_basis: event.public_source_basis,
      schedule_or_diary_basis: event.schedule_or_diary_basis,
      related_full_record_target: event.related_full_record_target,
      press_or_ceremony_component: event.press_or_ceremony_component,
      participants_or_actors: event.participants_or_actors,
      matched_text: match.matched_text,
      match_kind: match.match_kind,
      usage_status: status,
      recommended_action: actionForStatus(status),
      finding: findingForStatus(status, event, match),
      source_or_context: event.source_or_context,
      source_url: event.source_url,
      verification_status: event.verification_status
    };
  });
}

function isEventLikeUnit(unit) {
  return EVENT_UNIT_TYPES.has(unit.unit_type) && EVENT_PATTERN.test(unitText(unit));
}

function directEditSupported(check, unitUsages) {
  const replacement = normalizeForm(check.replacement_text || "");
  for (const usage of unitUsages) {
    if (usage.usage_status === "approved" && replacement === normalizeForm(usage.approved_phrase)) return true;
  }
  return false;
}

function auditEvents({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-summit-public-event-usage-audit-v1",
      status: "fail",
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        summit_public_event_usages: 0,
        warnings: 0,
        unmatched_summit_public_event_like_units: 0,
        direct_summit_public_event_edit_conflicts: 0,
        by_usage_status: {},
        by_event_type: {},
        by_event_family: {}
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
    if (unitUsages.length === 0 && isEventLikeUnit(unit)) {
      unmatched += 1;
      const diagnostic = {
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        diagnostic_type: "unmatched_summit_public_event_like_unit",
        finding: "Unit contains summit, travel, ceremony, interview, speech, press, diary, or public-event language but no supplied event registry record matched it.",
        required_action:
          "Confirm event date, time, place, sequence, participants, public-source basis, press basis, diary/schedule basis, and full-record target before direct edits.",
        evidence_request: "event_chronology"
      };
      diagnostics.push(diagnostic);
      warnings.push(`${unit.unit_id}: ${diagnostic.finding}`);
    }
  }

  const directEdits = checkerEventDirectEdits(checkerOutput);
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
          finding: "Direct edit touches summit/public-event language without a target-volume registry-approved phrase.",
          required_action:
            "Downgrade to comment_only unless the target-volume event registry proves the event date, time, place, sequence, participant, public-source basis, press basis, diary/schedule basis, and full-record target."
        });
      }
    }
  }

  const errorsOut = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  return {
    schema_version: "frus-summit-public-event-usage-audit-v1",
    status: errorsOut.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: errorsOut,
    warnings,
    summary: {
      units_scanned: unitsDocument.units.length,
      summit_public_event_usages: usages.length,
      warnings: warnings.length,
      unmatched_summit_public_event_like_units: unmatched,
      direct_summit_public_event_edit_conflicts: conflicts.length,
      by_usage_status: countBy(usages.map((usageItem) => usageItem.usage_status)),
      by_event_type: countBy(usages.map((usageItem) => usageItem.event_type)),
      by_event_family: countBy(usages.map((usageItem) => usageItem.event_family))
    },
    usages,
    diagnostics,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS summit/public-event usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS summit/public-event usage audit ${result.status}: ${result.summary.summit_public_event_usages} registry usages, ${result.summary.unmatched_summit_public_event_like_units} unmatched summit/public-event-like units, ${result.summary.direct_summit_public_event_edit_conflicts} direct-edit conflicts.`
    );
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditEvents({
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
  console.error(`FRUS summit/public-event usage audit failed: ${error.message}`);
  process.exit(1);
}
