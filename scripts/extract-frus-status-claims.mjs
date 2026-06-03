#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);

const CLAIM_PATTERNS = [
  {
    claim_type: "printed_in",
    pattern: /\bprinted\s+(?:in|as)\b[^.?!;\n]*/gi
  },
  {
    claim_type: "published_in",
    pattern: /\bpublished\s+in\s+(?:19|20)\d{2}\b[^.?!;\n]*/gi,
    yearGroup: 0
  },
  {
    claim_type: "scheduled_for_publication",
    pattern: /\bscheduled\s+for\s+publication\b[^.?!;\n]*/gi
  },
  {
    claim_type: "forthcoming",
    pattern: /\bforthcoming\b[^.?!;\n]*/gi
  },
  {
    claim_type: "anticipated_in_year",
    pattern: /\banticipated\s+(?:for|in)\s+((?:19|20)\d{2})\b[^.?!;\n]*/gi,
    yearGroup: 1
  },
  {
    claim_type: "being_cleared",
    pattern: /\b(?:being\s+cleared|in\s+clearance)\b[^.?!;\n]*/gi
  },
  {
    claim_type: "being_researched",
    pattern: /\b(?:being\s+researched|in\s+research)\b[^.?!;\n]*/gi
  },
  {
    claim_type: "planned",
    pattern: /\bplanned\b(?:\s+volume|\s+for|\s+in)?[^.?!;\n]*/gi
  },
  {
    claim_type: "history_office_url",
    pattern: /https?:\/\/history\.state\.gov\/historicaldocuments\/frus[0-9a-z-]+(?:v[0-9a-z]+(?:p[0-9]+)?)?/gi
  }
];

const ADMIN_HINTS = {
  reagan: ["reagan"],
  "bush-ghw": ["bush", "george h w bush", "george hw bush", "george h. w. bush"]
};

function usage() {
  console.error(
    "Usage: node scripts/extract-frus-status-claims.mjs --units <extracted-units.json|-> --registry <status-registry.json> [--checker-output checker-output.json] [--target-entry-id ENTRY-ID] [--out status-claims.json] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let registryPath = null;
  let checkerOutputPath = null;
  let targetEntryId = "";
  let outPath = null;
  let format = "json";

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
    } else if (arg === "--target-entry-id") {
      targetEntryId = argv[index + 1];
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!unitsPath || !registryPath || (unitsPath === "-" && registryPath === "-") || !new Set(["json", "text"]).has(format)) {
    usage();
  }
  return { unitsPath, registryPath, checkerOutputPath, targetEntryId, outPath, format };
}

function readJson(file, label) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeEntryId(value) {
  return String(value || "").trim().toLowerCase();
}

function containsPhrase(normalizedText, normalizedPhrase) {
  if (!normalizedText || !normalizedPhrase) return false;
  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

function validateInputs(unitsDocument, registry, checkerOutput) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) {
    errors.push("units: expected extracted-units object");
  } else {
    if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
      errors.push("units.schema_version: must be frus-extracted-units-v1");
    }
    if (!Array.isArray(unitsDocument.units)) {
      errors.push("units.units: expected array");
    }
  }
  if (!isPlainObject(registry)) {
    errors.push("registry: expected status-registry object");
  } else {
    if (registry.schema_version !== "frus-status-registry-v1") {
      errors.push("registry.schema_version: must be frus-status-registry-v1");
    }
    if (!Array.isArray(registry.entries)) {
      errors.push("registry.entries: expected array");
    }
  }
  if (checkerOutput !== null && (!isPlainObject(checkerOutput) || !Array.isArray(checkerOutput.checks))) {
    errors.push("checker-output.checks: expected array");
  }
  return errors;
}

function entryUrlIds(text) {
  const ids = new Set();
  const pattern = /history\.state\.gov\/historicaldocuments\/(frus[0-9a-z-]+(?:v[0-9a-z]+(?:p[0-9]+)?))/gi;
  let match;
  while ((match = pattern.exec(text))) {
    ids.add(normalizeEntryId(match[1]));
  }
  return ids;
}

function volumePhrase(entry) {
  return normalizeText(`volume ${entry.volume_number || ""}`);
}

function titleScore(entry, normalized) {
  const title = normalizeText(entry.title || "");
  if (!title) return 0;
  if (containsPhrase(normalized, title)) return 40;
  const words = title.split(" ").filter((word) => word.length > 3);
  if (words.length >= 2 && words.filter((word) => containsPhrase(normalized, word)).length >= Math.min(3, words.length)) {
    return 24;
  }
  return 0;
}

function adminScore(entry, normalized) {
  const hints = ADMIN_HINTS[entry.administration] || [];
  return hints.some((hint) => containsPhrase(normalized, normalizeText(hint))) ? 10 : 0;
}

function subitemMatch(entry, normalized) {
  const subitems = Array.isArray(entry.subitems) ? entry.subitems : [];
  return subitems.find((item) => normalizeText(item.label).length > 0 && containsPhrase(normalized, normalizeText(item.label))) || null;
}

function hasAnticipatedYear(entry, subitem, claimedYear) {
  if (!claimedYear) return false;
  const bucket = `anticipated_${claimedYear}`;
  if (Array.isArray(subitem?.release_buckets) && subitem.release_buckets.includes(bucket)) return true;
  return Array.isArray(entry.release_buckets) && entry.release_buckets.includes(bucket);
}

function inferTarget({ phrase, contextText, registry, targetEntryId, claimType, claimedYear }) {
  const fullText = `${phrase}\n${contextText || ""}`;
  const normalized = normalizeText(fullText);
  const urlIds = entryUrlIds(fullText);
  const entries = registry.entries || [];
  const fallbackTarget = targetEntryId ? entries.find((entry) => normalizeEntryId(entry.entry_id) === normalizeEntryId(targetEntryId)) : null;
  const scored = [];

  for (const entry of entries) {
    let score = 0;
    const entryId = normalizeEntryId(entry.entry_id);
    const normalizedEntryId = normalizeText(entry.entry_id);
    const normalizedDateRange = normalizeText(entry.date_range);
    const normalizedVolumePhrase = volumePhrase(entry);
    const subitem = subitemMatch(entry, normalized);

    if (urlIds.has(entryId)) score += 120;
    if (normalizedEntryId && containsPhrase(normalized, normalizedEntryId)) score += 100;
    if (
      normalizedDateRange &&
      containsPhrase(normalized, normalizedDateRange) &&
      normalizedVolumePhrase &&
      containsPhrase(normalized, normalizedVolumePhrase)
    ) {
      score += 70;
    } else if (normalizedVolumePhrase && containsPhrase(normalized, normalizedVolumePhrase)) {
      score += 30;
    }
    score += titleScore(entry, normalized);
    score += adminScore(entry, normalized);
    if (subitem) score += 18;
    if (claimType === "anticipated_in_year" && hasAnticipatedYear(entry, subitem, claimedYear)) score += 80;
    if (fallbackTarget && fallbackTarget.entry_id === entry.entry_id && score === 0) score += 12;

    if (score > 0) {
      scored.push({ entry, score, subitem });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.entry.entry_id.localeCompare(b.entry.entry_id));
  const best = scored[0];
  if (!best || best.score < 24) {
    return {
      entry: fallbackTarget || null,
      subitem: null,
      confidence: fallbackTarget ? "fallback_target" : "unresolved",
      note: fallbackTarget ? "used supplied target-entry-id fallback" : "no registry target inferred"
    };
  }
  const tied = scored.filter((candidate) => candidate.score === best.score);
  if (tied.length > 1 && best.score < 70) {
    return {
      entry: null,
      subitem: null,
      confidence: "ambiguous",
      note: `ambiguous target candidates: ${tied.map((candidate) => candidate.entry.entry_id).join(", ")}`
    };
  }
  return {
    entry: best.entry,
    subitem: best.subitem,
    confidence: best.score >= 70 ? "high" : "medium",
    note: `target inferred with score ${best.score}`
  };
}

function directEditUnits(checkerOutput) {
  const direct = new Map();
  if (!checkerOutput || !Array.isArray(checkerOutput.checks)) return direct;
  for (const check of checkerOutput.checks) {
    if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) continue;
    const statusRelated =
      check.category === "publication_status" ||
      check.evidence_request === "publication_status" ||
      /\b(?:printed in|printed as|published in|scheduled for publication|forthcoming|anticipated|being cleared|being researched|planned)\b/i.test(
        `${check.original_text || ""} ${check.replacement_text || ""} ${check.finding || ""} ${check.comment_text || ""}`
      );
    if (!statusRelated) continue;
    const list = direct.get(check.unit_id) || [];
    list.push(check.rule_id || "direct-status-edit");
    direct.set(check.unit_id, list);
  }
  return direct;
}

function matchClaimsForUnit({ unit, registry, checkerDirectEdits, targetEntryId }) {
  const text = `${unit.display_text || ""}\n${unit.exact_text || ""}`;
  const contextText = `${unit.location || ""}\n${unit.surrounding_text || ""}\n${text}`;
  const claims = [];
  const seen = new Set();

  for (const spec of CLAIM_PATTERNS) {
    spec.pattern.lastIndex = 0;
    let match;
    while ((match = spec.pattern.exec(text))) {
      const phrase = match[0].replace(/\s+/g, " ").trim();
      if (!phrase) continue;
      const key = `${spec.claim_type}\u0000${phrase.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const claimedYear = spec.yearGroup ? match[spec.yearGroup] || "" : "";
      const target = inferTarget({
        phrase,
        contextText,
        registry,
        targetEntryId,
        claimType: spec.claim_type,
        claimedYear
      });
      const directEditRequested = checkerDirectEdits.has(unit.unit_id);
      claims.push({
        claim_id: "",
        unit_id: unit.unit_id,
        phrase,
        claim_type: spec.claim_type,
        target_entry_id: target.entry?.entry_id || "",
        target_title: target.entry?.title || "",
        target_volume_number: target.entry?.volume_number || "",
        target_subitem: target.subitem?.label || "",
        target_chapter: "",
        target_document: "",
        claimed_year: claimedYear,
        direct_edit_requested: directEditRequested,
        target_inference: target.confidence,
        inference_note: target.note,
        direct_edit_rule_ids: checkerDirectEdits.get(unit.unit_id) || []
      });
    }
  }
  return claims;
}

function buildClaims({ unitsDocument, registry, checkerOutput, targetEntryId }) {
  const checkerDirectEdits = directEditUnits(checkerOutput);
  const claims = [];
  for (const unit of unitsDocument.units || []) {
    if (!isPlainObject(unit) || typeof unit.unit_id !== "string") continue;
    claims.push(...matchClaimsForUnit({ unit, registry, checkerDirectEdits, targetEntryId }));
  }

  claims.forEach((claim, index) => {
    claim.claim_id = `status-claim-${String(index + 1).padStart(4, "0")}`;
  });

  return {
    schema_version: "frus-status-claims-v1",
    source: "Extracted status-bearing phrases from FRUS annotation-sheet units.",
    generated_at: new Date().toISOString(),
    registry_source_url: registry.source_url || "",
    registry_captured_at: registry.captured_at || "",
    target_entry_id_fallback: targetEntryId || "",
    summary: {
      units_scanned: Array.isArray(unitsDocument.units) ? unitsDocument.units.length : 0,
      claims_found: claims.length,
      direct_edit_requested: claims.filter((claim) => claim.direct_edit_requested).length,
      by_claim_type: claims.reduce((counts, claim) => {
        counts[claim.claim_type] = (counts[claim.claim_type] || 0) + 1;
        return counts;
      }, {}),
      by_target_inference: claims.reduce((counts, claim) => {
        counts[claim.target_inference] = (counts[claim.target_inference] || 0) + 1;
        return counts;
      }, {})
    },
    claims
  };
}

function renderText(document) {
  const lines = [
    `FRUS status claim extraction passed: ${document.summary.claims_found} claims from ${document.summary.units_scanned} units.`
  ];
  for (const claim of document.claims) {
    lines.push(
      `- ${claim.claim_id}: ${claim.claim_type} in ${claim.unit_id} -> ${claim.target_entry_id || "unresolved"} (${claim.target_inference})`
    );
  }
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const registry = readJson(options.registryPath, options.registryPath);
  const checkerOutput = options.checkerOutputPath ? readJson(options.checkerOutputPath, options.checkerOutputPath) : null;
  const errors = validateInputs(unitsDocument, registry, checkerOutput);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  const document = buildClaims({
    unitsDocument,
    registry,
    checkerOutput,
    targetEntryId: options.targetEntryId
  });
  if (options.outPath) {
    writeJson(options.outPath, document);
  }
  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(document));
  }
} catch (error) {
  console.error(`FRUS status claim extraction failed: ${error.message}`);
  process.exit(1);
}
