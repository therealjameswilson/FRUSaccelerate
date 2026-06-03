#!/usr/bin/env node

import fs from "node:fs";

const VALID_STAGES = new Set(["published", "anticipated", "being_cleared", "being_researched", "planned"]);
const COUNT_KEYS = new Set([
  "published_2025_pattern_evidence",
  "anticipated_2026_overlay",
  "being_cleared",
  "being_researched",
  "planned"
]);

function usage() {
  console.error(
    "Usage: node scripts/validate-frus-status-registry.mjs --registry <status-registry.json|-> [--today YYYY-MM-DD] [--max-age-days N] [--format json|text]"
  );
  process.exit(2);
}

function readJson(file) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
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
  let today = new Date().toISOString().slice(0, 10);
  let maxAgeDays = 45;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--registry") {
      registryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--today") {
      today = argv[index + 1];
      index += 1;
    } else if (arg === "--max-age-days") {
      maxAgeDays = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!registryPath || !Number.isInteger(maxAgeDays) || maxAgeDays < 0 || !new Set(["json", "text"]).has(format)) {
    usage();
  }

  return { registryPath, today, maxAgeDays, format };
}

function countSubitemOverlays(entries) {
  return entries.reduce((count, entry) => {
    if (!Array.isArray(entry.subitems)) return count;
    return (
      count +
      entry.subitems.filter(
        (subitem) =>
          isPlainObject(subitem) &&
          Array.isArray(subitem.release_buckets) &&
          subitem.release_buckets.some((bucket) => /^anticipated_[0-9]{4}$/.test(bucket))
      ).length
    );
  }, 0);
}

function actualCounts(entries) {
  return {
    published_2025_pattern_evidence: entries.filter(
      (entry) => entry.production_stage === "published" && entry.release_buckets.includes("published_2025")
    ).length,
    anticipated_2026_overlay: entries.filter((entry) => entry.release_buckets.includes("anticipated_2026")).length,
    being_cleared: entries.filter((entry) => entry.production_stage === "being_cleared").length,
    being_researched: entries.filter((entry) => entry.production_stage === "being_researched").length,
    planned: entries.filter((entry) => entry.production_stage === "planned").length
  };
}

function validateRegistry(registry, today, maxAgeDays) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(registry)) {
    return { errors: ["$: expected status registry object"], warnings, counts: {}, entries: [] };
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
      warnings.push(`$.captured_at: registry is ${age} days old`);
    }
  }

  if (!Array.isArray(registry.entries)) {
    errors.push("$.entries: expected array");
    return { errors, warnings, counts: {}, entries: [] };
  }

  const entryIds = new Set();
  registry.entries.forEach((entry, index) => {
    const label = `$.entries[${index}]`;
    if (!isPlainObject(entry)) {
      errors.push(`${label}: expected object`);
      return;
    }
    for (const key of ["entry_id", "administration", "date_range", "volume_number", "title", "production_stage"]) {
      if (typeof entry[key] !== "string" || entry[key].length === 0) {
        errors.push(`${label}.${key}: expected non-empty string`);
      }
    }
    if (typeof entry.entry_id === "string" && entry.entry_id.length > 0) {
      if (entryIds.has(entry.entry_id)) {
        errors.push(`${label}.entry_id: duplicate ${entry.entry_id}`);
      }
      entryIds.add(entry.entry_id);
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
    if (typeof entry.history_state_url === "string" && !entry.history_state_url.startsWith("https://history.state.gov/")) {
      errors.push(`${label}.history_state_url: expected history.state.gov URL`);
    }
  });

  const entries = registry.entries.filter(
    (entry) => isPlainObject(entry) && Array.isArray(entry.release_buckets) && Array.isArray(entry.subitems)
  );
  const counts = actualCounts(entries);
  const declaredCounts = registry.snapshot_integrity?.relevant_1981_1992_counts;
  if (isPlainObject(declaredCounts)) {
    for (const key of COUNT_KEYS) {
      if (!Number.isInteger(declaredCounts[key])) {
        errors.push(`$.snapshot_integrity.relevant_1981_1992_counts.${key}: expected integer`);
      } else if (declaredCounts[key] !== counts[key]) {
        errors.push(
          `$.snapshot_integrity.relevant_1981_1992_counts.${key}: declared ${declaredCounts[key]}, actual ${counts[key]}`
        );
      }
    }
  } else if (registry.snapshot_integrity !== undefined) {
    errors.push("$.snapshot_integrity.relevant_1981_1992_counts: expected object");
  }

  const nestedSubitemOverlays = countSubitemOverlays(entries);
  if (
    registry.snapshot_integrity &&
    Number.isInteger(registry.snapshot_integrity.nested_subitem_overlays_seen) &&
    registry.snapshot_integrity.nested_subitem_overlays_seen !== nestedSubitemOverlays
  ) {
    errors.push(
      `$.snapshot_integrity.nested_subitem_overlays_seen: declared ${registry.snapshot_integrity.nested_subitem_overlays_seen}, actual ${nestedSubitemOverlays}`
    );
  }

  return { errors, warnings, counts, entries, nestedSubitemOverlays };
}

function renderText(result) {
  const countText = [
    `${result.entries_total} entries`,
    `${result.counts.being_cleared || 0} clearance`,
    `${result.counts.being_researched || 0} research`,
    `${result.counts.planned || 0} planned`,
    `${result.counts.anticipated_2026_overlay || 0} anticipated overlays`
  ].join(", ");

  if (result.status === "pass") {
    return `FRUS status registry validation passed: ${countText}.\n`;
  }

  const lines = [`FRUS status registry validation failed: ${result.errors.length} error${result.errors.length === 1 ? "" : "s"}.`];
  for (const error of result.errors) {
    lines.push(`- ${error}`);
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { registryPath, today, maxAgeDays, format } = parseArgs(process.argv);
  const registry = readJson(registryPath);
  const { errors, warnings, counts, entries, nestedSubitemOverlays } = validateRegistry(registry, today, maxAgeDays);
  const result = {
    schema_version: "frus-status-registry-validation-v1",
    registry: registryPath === "-" ? "stdin" : registryPath,
    captured_at: registry.captured_at || "",
    entries_total: entries.length,
    counts,
    nested_subitem_overlays: nestedSubitemOverlays || 0,
    warnings,
    errors,
    status: errors.length === 0 ? "pass" : "fail"
  };

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "pass") {
    for (const warning of warnings) {
      console.error(`warning: ${warning}`);
    }
    process.stdout.write(renderText(result));
  } else {
    process.stderr.write(renderText(result));
  }

  process.exit(result.status === "pass" ? 0 : 1);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
