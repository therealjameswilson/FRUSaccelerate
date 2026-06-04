#!/usr/bin/env node

import fs from "node:fs";

const VALID_STAGES = new Set([
  "published",
  "anticipated",
  "being_cleared",
  "being_researched",
  "planned"
]);

const CLAIM_TYPES = new Set([
  "printed_in",
  "published_in",
  "scheduled_for_publication",
  "forthcoming",
  "anticipated_in_year",
  "being_cleared",
  "being_researched",
  "planned",
  "history_office_url"
]);

function usage() {
  console.error(
    "Usage: node scripts/preflight-frus-status-claims.mjs --registry <status-registry.json> --claims <status-claims.json|-> [--today YYYY-MM-DD] [--max-age-days N]"
  );
  process.exit(2);
}

function readJson(file, label) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[–—]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function parseDate(value) {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value || "");
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function dayDelta(older, newer) {
  return Math.floor((newer - older) / 86_400_000);
}

function parseArgs(argv) {
  let registryPath = null;
  let claimsPath = null;
  let today = new Date().toISOString().slice(0, 10);
  let maxAgeDays = 45;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--registry") {
      registryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--claims") {
      claimsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--today") {
      today = argv[index + 1];
      index += 1;
    } else if (arg === "--max-age-days") {
      maxAgeDays = Number(argv[index + 1]);
      index += 1;
    } else {
      usage();
    }
  }

  if (!registryPath || !claimsPath || (registryPath === "-" && claimsPath === "-")) {
    usage();
  }
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 0) {
    usage();
  }

  return { registryPath, claimsPath, today, maxAgeDays };
}

function validateRegistry(registry, today, maxAgeDays, errors, warnings) {
  if (!isPlainObject(registry)) {
    errors.push("$.registry: expected object");
    return new Map();
  }
  if (registry.schema_version !== "frus-status-registry-v1") {
    errors.push("$.schema_version: must be frus-status-registry-v1");
  }
  if (typeof registry.source_url !== "string" || registry.source_url.length === 0) {
    errors.push("$.source_url: expected non-empty string");
  }

  const captured = parseDate(registry.captured_at);
  const todayDate = parseDate(today);
  if (!captured) {
    errors.push("$.captured_at: expected YYYY-MM-DD");
  } else if (!todayDate) {
    errors.push("--today: expected YYYY-MM-DD");
  } else {
    const age = dayDelta(captured, todayDate);
    if (age < 0) {
      errors.push("$.captured_at: registry capture is after --today");
    } else if (age > maxAgeDays) {
      warnings.push(`$.captured_at: registry is ${age} days old; direct publication-status edits should be blocked`);
    }
  }

  if (!Array.isArray(registry.entries)) {
    errors.push("$.entries: expected array");
    return new Map();
  }

  const entriesById = new Map();
  registry.entries.forEach((entry, index) => {
    const label = `$.entries[${index}]`;
    if (!isPlainObject(entry)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof entry.entry_id !== "string" || entry.entry_id.length === 0) {
      errors.push(`${label}.entry_id: expected non-empty string`);
      return;
    }
    if (entriesById.has(entry.entry_id)) {
      errors.push(`${label}.entry_id: duplicate entry id ${entry.entry_id}`);
    }
    if (typeof entry.title !== "string" || entry.title.length === 0) {
      errors.push(`${label}.title: expected non-empty string`);
    }
    if (!VALID_STAGES.has(entry.production_stage)) {
      errors.push(`${label}.production_stage: invalid stage ${JSON.stringify(entry.production_stage)}`);
    }
    if (!Array.isArray(entry.release_buckets)) {
      errors.push(`${label}.release_buckets: expected array`);
    }
    if (!Array.isArray(entry.subitems)) {
      errors.push(`${label}.subitems: expected array`);
    }
    entriesById.set(entry.entry_id, entry);
  });

  return entriesById;
}

function validateClaimsDocument(claimsDocument, errors) {
  if (!isPlainObject(claimsDocument)) {
    errors.push("$.claims_document: expected object");
    return [];
  }
  if (claimsDocument.schema_version !== "frus-status-claims-v1") {
    errors.push("$.schema_version: must be frus-status-claims-v1");
  }
  if (!Array.isArray(claimsDocument.claims)) {
    errors.push("$.claims: expected array");
    return [];
  }

  claimsDocument.claims.forEach((claim, index) => {
    const label = `$.claims[${index}]`;
    if (!isPlainObject(claim)) {
      errors.push(`${label}: expected object`);
      return;
    }
    if (typeof claim.claim_id !== "string" || claim.claim_id.length === 0) {
      errors.push(`${label}.claim_id: expected non-empty string`);
    }
    if (typeof claim.unit_id !== "string" || claim.unit_id.length === 0) {
      errors.push(`${label}.unit_id: expected non-empty string`);
    }
    if (typeof claim.phrase !== "string" || claim.phrase.length === 0) {
      errors.push(`${label}.phrase: expected non-empty string`);
    }
    if (!CLAIM_TYPES.has(claim.claim_type)) {
      errors.push(`${label}.claim_type: invalid value ${JSON.stringify(claim.claim_type)}`);
    }
    if (claim.direct_edit_requested !== undefined && typeof claim.direct_edit_requested !== "boolean") {
      errors.push(`${label}.direct_edit_requested: expected boolean when supplied`);
    }
  });

  return claimsDocument.claims;
}

function findSubitem(entry, label) {
  const target = normalizeText(label);
  if (!target) return null;
  return (entry.subitems || []).find((item) => normalizeText(item.label) === target) || null;
}

function releaseBucketMatches(entry, claim) {
  const expected = claim.claimed_year ? `anticipated_${claim.claimed_year}` : null;
  if (!expected) return false;

  const subitem = findSubitem(entry, claim.target_subitem);
  if (subitem && Array.isArray(subitem.release_buckets)) {
    return subitem.release_buckets.includes(expected);
  }

  return Array.isArray(entry.release_buckets) && entry.release_buckets.includes(expected);
}

function directTargetSupplied(claim) {
  return Boolean(claim.target_document || claim.target_chapter || claim.target_subitem);
}

function evaluateClaim(claim, entriesById) {
  const issues = [];
  const notes = [];
  const entry = entriesById.get(claim.target_entry_id);

  if (!entry) {
    issues.push({
      severity: "major",
      reason: `no registry entry for ${JSON.stringify(claim.target_entry_id)}`
    });
    return { issues, notes };
  }

  if (claim.target_title && normalizeText(claim.target_title) !== normalizeText(entry.title)) {
    issues.push({
      severity: "major",
      reason: "claim target title does not match registry entry title"
    });
  }

  if (claim.target_volume_number && normalizeText(claim.target_volume_number) !== normalizeText(entry.volume_number)) {
    issues.push({
      severity: "major",
      reason: "claim target volume number does not match registry entry volume number"
    });
  }

  if (claim.target_subitem && !findSubitem(entry, claim.target_subitem)) {
    issues.push({
      severity: "major",
      reason: "target subitem is not listed in the registry entry"
    });
  }

  if (claim.claim_type === "printed_in" || claim.claim_type === "published_in") {
    if (entry.production_stage !== "published") {
      issues.push({
        severity: "major",
        reason: `${claim.claim_type} claim targets a volume whose production_stage is ${entry.production_stage}`
      });
    } else if (!directTargetSupplied(claim)) {
      issues.push({
        severity: "minor",
        reason: `${claim.claim_type} claim needs a target document, chapter, or subitem before direct redline`
      });
    }
  }

  if (claim.claim_type === "scheduled_for_publication" || claim.claim_type === "forthcoming") {
    if (entry.production_stage === "published") {
      issues.push({
        severity: "info",
        reason: "target is now published; comment for update, but direct `printed in` wording still needs exact target evidence"
      });
    }
  }

  if (claim.claim_type === "anticipated_in_year") {
    if (!claim.claimed_year) {
      issues.push({ severity: "major", reason: "anticipated_in_year claim requires claimed_year" });
    } else if (!releaseBucketMatches(entry, claim)) {
      issues.push({
        severity: "major",
        reason: `anticipated_${claim.claimed_year} is not listed for this target or subitem`
      });
    } else if (entry.production_stage !== "published") {
      notes.push(`${claim.target_entry_id} has an anticipated release overlay and production_stage ${entry.production_stage}`);
    }
  }

  if (claim.claim_type === "being_cleared" && entry.production_stage !== "being_cleared") {
    issues.push({ severity: "major", reason: `registry stage is ${entry.production_stage}, not being_cleared` });
  }
  if (claim.claim_type === "being_researched" && entry.production_stage !== "being_researched") {
    issues.push({ severity: "major", reason: `registry stage is ${entry.production_stage}, not being_researched` });
  }
  if (claim.claim_type === "planned" && entry.production_stage !== "planned") {
    issues.push({ severity: "major", reason: `registry stage is ${entry.production_stage}, not planned` });
  }
  if (claim.claim_type === "history_office_url") {
    notes.push("History Office URL identifies a target but does not itself prove publication status or source-note provenance");
  }

  if (claim.direct_edit_requested && !directTargetSupplied(claim)) {
    issues.push({
      severity: "blocker",
      reason: "status-language direct edit needs an exact document, chapter, or subitem target; volume-level status context is comment-only"
    });
  }

  if (claim.direct_edit_requested && issues.length > 0) {
    issues.push({
      severity: "blocker",
      reason: "status-dependent direct edit requested despite unresolved status mismatch"
    });
  }

  return { issues, notes };
}

try {
  const { registryPath, claimsPath, today, maxAgeDays } = parseArgs(process.argv);
  const errors = [];
  const warnings = [];
  const registry = readJson(registryPath, registryPath);
  const claimsDocument = readJson(claimsPath, claimsPath);
  const entriesById = validateRegistry(registry, today, maxAgeDays, errors, warnings);
  const claims = validateClaimsDocument(claimsDocument, errors);

  let okCount = 0;
  let commentRequiredCount = 0;
  let blockerCount = 0;

  for (const claim of claims) {
    const result = evaluateClaim(claim, entriesById);
    const label = claim.claim_id || claim.unit_id || "claim";

    if (result.issues.length === 0) {
      okCount += 1;
    } else {
      commentRequiredCount += 1;
    }

    for (const note of result.notes) {
      console.error(`note: ${label}: ${note}`);
    }

    for (const issue of result.issues) {
      const message = `${label}: ${issue.severity}: ${issue.reason}`;
      if (issue.severity === "blocker") {
        blockerCount += 1;
        errors.push(message);
      } else if (claim.direct_edit_requested) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  for (const warning of warnings) {
    console.error(`warning: ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`FRUS status claim preflight failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `FRUS status claim preflight passed: ${claims.length} claims, ${okCount} current/compatible, ${commentRequiredCount} comment-required, ${blockerCount} direct-edit blockers.`
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
