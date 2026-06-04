#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "attachment_note",
  "front_matter",
  "unknown_editorial_text"
]);
const SOURCE_SURROGATE_PATTERN =
  /\b(?:RAC|Remote Archive Capture|NLR[-–—]?\d|no\s+N\s+number|NARA\s+catalog|FOIA|mandatory review|MDR|PDF|scan|scanned|source image|release package|W Files|PROFS|Internet|URL|candidate locator|needs scan|eRecords|White House Situation Room|WHSR|NSC copy|National Security Council copy)\b/i;
const NON_DEPARTMENT_COPY_PATTERN =
  /\b(?:White House Situation Room|WHSR|NSC copy|National Security Council copy|White House copy)\b/i;
const TELEGRAM_COPY_CONTEXT_PATTERN = /\b(?:telegram|cable|Nodis|NODIS|Exdis|EXDIS|TOSEC|SECTO|outgoing)\b/i;
const DEPARTMENT_COPY_BASIS_PATTERN =
  /\b(?:Department of State|Central Foreign Policy File|Electronic Telegrams|eRecords|D[0-9]{6,}|N[0-9]{6,}|P[0-9]{6,}|D Reels|P Reels|N Reels)\b/i;
const DRAFTING_METADATA_PATTERN = /\b(?:Drafted by|cleared by|approved by)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/audit-frus-source-surrogate-usage.mjs --units extracted-units.json --registry registry.json [--checker-output output.json] [--target-volume VOLUME-ID] [--format text|json]"
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

function readJson(file, label) {
  const text = fs.readFileSync(file, "utf8");
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
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] || 0) + 1;
  return counts;
}

function uniqueStrings(values) {
  return [...new Set(values)];
}

function unitText(unit) {
  const display = unit.display_text || "";
  const exact = unit.exact_text || "";
  return display === exact ? exact : `${display}\n${exact}`;
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
  if (!isPlainObject(registry)) return ["registry: expected source-surrogate-registry object"];
  if (registry.schema_version !== "frus-source-surrogate-registry-v1") {
    errors.push("registry.schema_version: must be frus-source-surrogate-registry-v1");
  }
  if (!Array.isArray(registry.records)) errors.push("registry.records: expected array");
  return errors;
}

function validateOutput(output) {
  const errors = [];
  if (!output) return errors;
  if (!isPlainObject(output)) return ["checker_output: expected checker-output object"];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function registryForms(registry) {
  const forms = [];
  for (const record of registry.records || []) {
    for (const form of [record.approved_phrase, ...(record.variant_forms || [])]) {
      if (!String(form || "").trim()) continue;
      forms.push({ form, normalized_form: normalizeForm(form), record });
    }
  }
  return forms;
}

function makeLiteralPattern(form) {
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(form)}\\.?(?![A-Za-z0-9])`, "gi");
}

function suppressContainedMatches(matches) {
  const sorted = matches
    .slice()
    .sort((a, b) => b.length - a.length || a.offset - b.offset || a.source_surrogate_item_id.localeCompare(b.source_surrogate_item_id));
  const accepted = [];
  for (const match of sorted) {
    const start = match.offset;
    const end = match.offset + match.length;
    const contained = accepted.some((item) => {
      const itemStart = item.offset;
      const itemEnd = item.offset + item.length;
      return start >= itemStart && end <= itemEnd && match.source_surrogate_item_id === item.source_surrogate_item_id;
    });
    if (!contained) accepted.push(match);
  }
  return accepted.sort((a, b) => a.offset - b.offset || a.source_surrogate_item_id.localeCompare(b.source_surrogate_item_id));
}

function approvedMatchesForUnit(unit, forms, targetVolume) {
  const text = unitText(unit);
  const matches = [];
  const seen = new Set();
  for (const item of forms) {
    const pattern = makeLiteralPattern(item.form);
    for (const match of text.matchAll(pattern)) {
      const key = `${item.record.source_surrogate_item_id}:${match.index}:${match[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const isApprovedPhrase = normalizeForm(match[0]) === normalizeForm(item.record.approved_phrase);
      const isTargetVolume = !targetVolume || item.record.volume_id === targetVolume;
      matches.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        source_surrogate_item_id: item.record.source_surrogate_item_id,
        volume_id: item.record.volume_id,
        document_id: item.record.document_id,
        document_number: item.record.document_number,
        unit_scope: item.record.unit_scope,
        surrogate_type: item.record.surrogate_type,
        approved_phrase: item.record.approved_phrase,
        matched_text: match[0],
        match_kind: isApprovedPhrase ? "approved_phrase" : "variant_form",
        usage_status: isTargetVolume ? (isApprovedPhrase ? "approved" : "variant_needs_review") : "cross_volume_source_surrogate_context",
        repository_or_source_family: item.record.repository_or_source_family,
        surrogate_identifier: item.record.surrogate_identifier,
        release_or_access_basis: item.record.release_or_access_basis,
        source_image_or_copy_status: item.record.source_image_or_copy_status,
        archival_path_or_url: item.record.archival_path_or_url,
        publication_or_attachment_status: item.record.publication_or_attachment_status,
        caveat_or_limitation: item.record.caveat_or_limitation,
        source_or_context: item.record.source_or_context,
        source_url: item.record.source_url,
        verification_status: item.record.verification_status,
        offset: match.index || 0,
        length: match[0].length
      });
    }
  }
  return suppressContainedMatches(matches);
}

function appliesToUnit(unit) {
  return UNIT_TYPES.has(unit.unit_type) || SOURCE_SURROGATE_PATTERN.test(unitText(unit));
}

function hasPublishedNonDepartmentCopyException(unitMatches) {
  return unitMatches.some(
    (match) =>
      match.surrogate_type === "white_house_situation_room_copy_exception" &&
      match.verification_status === "verified_published_surrogate_record"
  );
}

function sourceCopyBasisWarningForUnit(unit, unitMatches) {
  const text = unitText(unit);
  if (!NON_DEPARTMENT_COPY_PATTERN.test(text) || !TELEGRAM_COPY_CONTEXT_PATTERN.test(text)) return null;
  if (hasPublishedNonDepartmentCopyException(unitMatches)) return null;
  const hasDepartmentBasis = DEPARTMENT_COPY_BASIS_PATTERN.test(text);
  const hasDraftingMetadata = DRAFTING_METADATA_PATTERN.test(text);
  if (hasDepartmentBasis && hasDraftingMetadata) return null;
  return {
    unit_id: unit.unit_id,
    unit_type: unit.unit_type,
    location: unit.location || "",
    finding:
      "Telegram source note relies on a White House Situation Room/NSC copy without both Department/eRecords copy basis and outgoing drafting metadata.",
    recommended_action: "comment_only",
    evidence_request: "communications_metadata",
    missing_department_copy_basis: !hasDepartmentBasis,
    missing_drafting_metadata: !hasDraftingMetadata,
    required_action:
      "Confirm whether a Department of State/eRecords or Central Foreign Policy File copy exists; for outgoing telegrams, capture drafting, clearance, approval, and header metadata before final source-note edits."
  };
}

function directEditConflicts(output, registry, targetVolume) {
  if (!output || !Array.isArray(output.checks)) return [];
  const targetForms = registryForms(registry).filter((item) => !targetVolume || item.record.volume_id === targetVolume);
  const approvedTargetForms = new Set(targetForms.map((item) => normalizeForm(item.record.approved_phrase)));
  const approvedNonDepartmentCopyForms = new Set(
    targetForms
      .filter((item) => item.record.surrogate_type === "white_house_situation_room_copy_exception")
      .map((item) => normalizeForm(item.record.approved_phrase))
  );
  const conflicts = [];
  for (const check of output.checks) {
    if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const original = check.original_text || "";
    const replacement = check.replacement_text || "";
    const touchesSourceSurrogate =
      SOURCE_SURROGATE_PATTERN.test(`${original} ${replacement}`) ||
      check.category === "source_surrogate_release" ||
      check.evidence_request === "source_surrogate_basis" ||
      /^FAS-SUR-\d{3}$/.test(check.rule_id || "");
    if (!touchesSourceSurrogate) continue;
    const replacementApproved = approvedTargetForms.has(normalizeForm(replacement));
    if (!replacementApproved) {
      conflicts.push({
        unit_id: check.unit_id || "",
        rule_id: check.rule_id || "",
        original_text: original,
        replacement_text: replacement,
        finding:
          "Direct edit touches source-surrogate or release-identification apparatus without a target-volume registry-approved published form.",
        required_action:
          "Downgrade to comment_only unless the replacement exactly matches a supplied target-volume source-surrogate registry form."
      });
    }
    const replacementTouchesNonDepartmentTelegram =
      NON_DEPARTMENT_COPY_PATTERN.test(replacement) && TELEGRAM_COPY_CONTEXT_PATTERN.test(`${original} ${replacement}`);
    const replacementHasDepartmentBasis = DEPARTMENT_COPY_BASIS_PATTERN.test(replacement);
    const replacementHasDraftingMetadata = DRAFTING_METADATA_PATTERN.test(replacement);
    const replacementIsApprovedException = approvedNonDepartmentCopyForms.has(normalizeForm(replacement));
    if (
      replacementTouchesNonDepartmentTelegram &&
      !replacementIsApprovedException &&
      (!replacementHasDepartmentBasis || !replacementHasDraftingMetadata)
    ) {
      conflicts.push({
        unit_id: check.unit_id || "",
        rule_id: check.rule_id || "",
        original_text: original,
        replacement_text: replacement,
        finding:
          "Direct edit would finalize a White House Situation Room/NSC telegram-copy basis without Department/eRecords and drafting metadata support.",
        required_action:
          "Downgrade to comment_only unless the replacement exactly matches a target-volume published copy exception or includes verified Department/eRecords copy basis plus outgoing drafting, clearance, and approval metadata."
      });
    }
  }
  return conflicts;
}

function auditSourceSurrogates({ unitsDocument, registry, checkerOutput, targetVolume }) {
  const errors = [...validateUnits(unitsDocument), ...validateRegistry(registry), ...validateOutput(checkerOutput)];
  if (errors.length > 0) {
    return {
      schema_version: "frus-source-surrogate-usage-audit-v1",
      status: "fail",
      target_volume: targetVolume,
      errors,
      warnings: [],
      summary: {
        units_scanned: 0,
        source_surrogate_usages: 0,
        unmatched_source_surrogate_like_units: 0,
        direct_source_surrogate_edit_conflicts: 0,
        warnings: 0,
        by_usage_status: {},
        by_surrogate_type: {}
      },
      usages: [],
      unmatched_units: [],
      direct_edit_conflicts: []
    };
  }

  const forms = registryForms(registry);
  const usages = [];
  const unmatchedUnits = [];
  const sourceCopyBasisWarnings = [];
  for (const unit of unitsDocument.units) {
    if (!appliesToUnit(unit)) continue;
    const unitMatches = approvedMatchesForUnit(unit, forms, targetVolume);
    if (unitMatches.length > 0) {
      usages.push(...unitMatches);
    } else if (SOURCE_SURROGATE_PATTERN.test(unitText(unit))) {
      unmatchedUnits.push({
        unit_id: unit.unit_id,
        unit_type: unit.unit_type,
        location: unit.location || "",
        finding: "Source-surrogate-like unit had no match in the supplied source-surrogate registry.",
        recommended_action: "comment_only",
        evidence_request: "source_surrogate_basis"
      });
    }
    const copyBasisWarning = sourceCopyBasisWarningForUnit(unit, unitMatches);
    if (copyBasisWarning) sourceCopyBasisWarnings.push(copyBasisWarning);
  }

  const conflicts = directEditConflicts(checkerOutput, registry, targetVolume);
  const warnings = uniqueStrings([
    ...usages
      .filter((usage) => usage.usage_status !== "approved")
      .map((usage) => `${usage.unit_id}: ${usage.usage_status} for ${usage.source_surrogate_item_id}`),
    ...unmatchedUnits.map((unit) => `${unit.unit_id}: ${unit.finding}`),
    ...sourceCopyBasisWarnings.map((unit) => `${unit.unit_id}: ${unit.finding}`)
  ]);
  const hardErrors = conflicts.map((conflict) => `${conflict.unit_id}: ${conflict.finding}`);
  const summary = {
    units_scanned: unitsDocument.units.length,
    source_surrogate_usages: usages.length,
    unmatched_source_surrogate_like_units: unmatchedUnits.length,
    source_copy_basis_warnings: sourceCopyBasisWarnings.length,
    direct_source_surrogate_edit_conflicts: conflicts.length,
    warnings: warnings.length,
    by_usage_status: countBy(usages.map((usage) => usage.usage_status)),
    by_surrogate_type: countBy(usages.map((usage) => usage.surrogate_type))
  };
  return {
    schema_version: "frus-source-surrogate-usage-audit-v1",
    status: hardErrors.length > 0 ? "fail" : warnings.length > 0 ? "warning" : "pass",
    target_volume: targetVolume,
    errors: hardErrors,
    warnings,
    summary,
    usages,
    unmatched_units: unmatchedUnits,
    source_copy_basis_warnings: sourceCopyBasisWarnings,
    direct_edit_conflicts: conflicts
  };
}

function renderText(result) {
  const lines = [];
  if (result.status === "fail") {
    lines.push(`FRUS source-surrogate usage audit failed: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
  } else {
    lines.push(
      `FRUS source-surrogate usage audit ${result.status}: ${result.summary.source_surrogate_usages} matches across ${result.summary.units_scanned} units.`
    );
    lines.push(
      `Warnings: ${result.summary.warnings}; unmatched source-surrogate-like units: ${result.summary.unmatched_source_surrogate_like_units}.`
    );
    if (result.summary.source_copy_basis_warnings) {
      lines.push(`Source-copy basis warnings: ${result.summary.source_copy_basis_warnings}.`);
    }
  }
  for (const warning of result.warnings) lines.push(`warning: ${warning}`);
  for (const error of result.errors) lines.push(`- ${error}`);
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const result = auditSourceSurrogates({
    unitsDocument: readJson(options.unitsPath, options.unitsPath),
    registry: readJson(options.registryPath, options.registryPath),
    checkerOutput: options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null,
    targetVolume: options.targetVolume
  });
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(renderText(result));
  }
  process.exit(result.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(`FRUS source-surrogate usage audit failed: ${error.message}`);
  process.exit(1);
}
