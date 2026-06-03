#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const REVIEWABLE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "document_heading",
  "attachment_note",
  "declassification_note",
  "persons_entry",
  "abbreviation_entry",
  "index_entry",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);

function usage() {
  console.error(
    "Usage: node scripts/build-frus-llm-review-chunks.mjs --units <extracted-units.json> --out-dir DIR [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--status-registry registry.json] [--status-claims claims.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--max-units N] [--max-chars N] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let outDir = null;
  let guidePath = "reports/frus-annotation-checker-core.md";
  let schemaPath = "reports/frus-annotation-checker-output.schema.json";
  let statusRegistryPath = null;
  let statusClaimsPath = null;
  let preparationRouterPath = null;
  let permutationMatrixPath = null;
  let targetVolume = "";
  let runId = `frus-review-chunks-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let maxUnits = 12;
  let maxChars = 18_000;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--out-dir") {
      outDir = argv[index + 1];
      index += 1;
    } else if (arg === "--guide") {
      guidePath = argv[index + 1];
      index += 1;
    } else if (arg === "--schema") {
      schemaPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-registry") {
      statusRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-claims") {
      statusClaimsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--preparation-router") {
      preparationRouterPath = argv[index + 1];
      index += 1;
    } else if (arg === "--permutation-matrix") {
      permutationMatrixPath = argv[index + 1];
      index += 1;
    } else if (arg === "--target-volume") {
      targetVolume = argv[index + 1];
      index += 1;
    } else if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
    } else if (arg === "--max-units") {
      maxUnits = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--max-chars") {
      maxChars = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (
    !unitsPath ||
    !outDir ||
    !Number.isInteger(maxUnits) ||
    maxUnits < 1 ||
    !Number.isInteger(maxChars) ||
    maxChars < 1000 ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }

  return {
    unitsPath,
    outDir,
    guidePath,
    schemaPath,
    statusRegistryPath,
    statusClaimsPath,
    preparationRouterPath,
    permutationMatrixPath,
    targetVolume,
    runId,
    maxUnits,
    maxChars,
    format
  };
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateUnits(unitsDocument, label) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) return [`${label}: expected extracted-units object`];
  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push(`${label}.schema_version: must be frus-extracted-units-v1`);
  }
  if (!Array.isArray(unitsDocument.units)) {
    errors.push(`${label}.units: expected array`);
    return errors;
  }
  const seen = new Set();
  unitsDocument.units.forEach((unit, index) => {
    const unitLabel = `${label}.units[${index}]`;
    if (!isPlainObject(unit)) {
      errors.push(`${unitLabel}: expected object`);
      return;
    }
    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${unitLabel}.unit_id: expected non-empty string`);
    } else if (seen.has(unit.unit_id)) {
      errors.push(`${unitLabel}.unit_id: duplicate ${unit.unit_id}`);
    } else {
      seen.add(unit.unit_id);
    }
  });
  return errors;
}

function unitCost(unit) {
  return JSON.stringify(unit).length;
}

function reviewRequired(unit) {
  if (!unit || unit.word_part === "word/comments.xml") return false;
  if (!String(unit.exact_text || unit.display_text || "").trim()) return false;
  return REVIEWABLE_UNIT_TYPES.has(unit.unit_type);
}

function chunkUnits(units, maxUnits, maxChars) {
  const chunks = [];
  let current = [];
  let currentChars = 0;
  for (const unit of units) {
    const cost = unitCost(unit);
    const full = current.length >= maxUnits || (current.length > 0 && currentChars + cost > maxChars);
    if (full) {
      chunks.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(unit);
    currentChars += cost;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function compactJson(value) {
  return JSON.stringify(value || {}, null, 2);
}

function fencedJson(value) {
  return `\`\`\`json\n${compactJson(value)}\n\`\`\``;
}

function subsetStatusClaims(statusClaims, unitIds) {
  if (!statusClaims || !Array.isArray(statusClaims.claims)) return null;
  const unitSet = new Set(unitIds);
  return {
    ...statusClaims,
    claims: statusClaims.claims.filter((claim) => unitSet.has(claim.unit_id)),
    summary: {
      ...(statusClaims.summary || {}),
      claims_found: statusClaims.claims.filter((claim) => unitSet.has(claim.unit_id)).length
    }
  };
}

function renderPacket({ chunk, manifest, guide, schema, statusRegistry, statusClaims, router, matrix }) {
  const chunkUnitsDocument = {
    schema_version: "frus-extracted-units-v1",
    source: `Chunk ${chunk.chunk_id} extracted units from ${manifest.source_files.units}`,
    units: chunk.units
  };
  const chunkClaims = subsetStatusClaims(statusClaims, chunk.unit_ids);
  return [
    "# FRUS Annotation Review Packet Chunk",
    "",
    `- run_id: ${manifest.run_id}`,
    `- chunk_id: ${chunk.chunk_id}`,
    `- chunk_index: ${chunk.chunk_index}`,
    `- chunk_count: ${manifest.chunk_count}`,
    `- unit_id_range: ${chunk.first_unit_id} to ${chunk.last_unit_id}`,
    `- target_volume: ${manifest.target_volume || "not supplied"}`,
    "",
    "Return only one valid `checker-output-v1` JSON object for this chunk. Every reviewable unit in this chunk needs a checker entry; use `no_change` when the unit is sound.",
    "",
    "Do not include units outside this chunk. Do not claim to edit the Word file directly. The wrapper will merge and validate chunk outputs before applying Word comments or tracked changes.",
    "",
    "## Chunk Manifest",
    "",
    fencedJson({
      schema_version: "frus-llm-review-chunk-v1",
      run_id: manifest.run_id,
      chunk_id: chunk.chunk_id,
      chunk_index: chunk.chunk_index,
      chunk_count: manifest.chunk_count,
      unit_ids: chunk.unit_ids,
      reviewable_unit_ids: chunk.reviewable_unit_ids
    }),
    "",
    "## Runtime FRUS Annotation Checker Guide",
    "",
    guide.trim(),
    "",
    "## Output JSON Schema",
    "",
    fencedJson(schema),
    "",
    "## Extracted Word Units For This Chunk",
    "",
    fencedJson(chunkUnitsDocument),
    "",
    "## Extracted Status Claims For This Chunk",
    "",
    fencedJson(chunkClaims || {}),
    "",
    "## Status Registry Context",
    "",
    fencedJson(statusRegistry || {}),
    "",
    "## Preparation Router Context",
    "",
    fencedJson(router || {}),
    "",
    "## Permutation Matrix Context",
    "",
    fencedJson(matrix || {}),
    "",
    "## Final Output Reminder",
    "",
    "Return only one JSON object with top-level keys: `schema_version`, `document_assessment`, `batch_readiness`, `checks`, `global_comments`, and `style_discrepancy_tally`."
  ].join("\n") + "\n";
}

function buildChunks(options) {
  const unitsDocument = readJson(options.unitsPath);
  const errors = validateUnits(unitsDocument, options.unitsPath);
  if (errors.length > 0) throw new Error(errors.join("\n"));

  const guide = readText(options.guidePath);
  const schema = readJson(options.schemaPath);
  const statusRegistry = options.statusRegistryPath ? readJson(options.statusRegistryPath) : null;
  const statusClaims = options.statusClaimsPath ? readJson(options.statusClaimsPath) : null;
  const router = options.preparationRouterPath ? readJson(options.preparationRouterPath) : null;
  const matrix = options.permutationMatrixPath ? readJson(options.permutationMatrixPath) : null;
  const unitChunks = chunkUnits(unitsDocument.units, options.maxUnits, options.maxChars);

  fs.mkdirSync(options.outDir, { recursive: true });
  const manifest = {
    schema_version: "frus-llm-chunk-manifest-v1",
    generated_at: new Date().toISOString(),
    run_id: options.runId,
    target_volume: options.targetVolume,
    chunk_count: unitChunks.length,
    source_files: {
      units: normalizePathForOutput(options.unitsPath),
      guide: normalizePathForOutput(options.guidePath),
      schema: normalizePathForOutput(options.schemaPath),
      status_registry: options.statusRegistryPath ? normalizePathForOutput(options.statusRegistryPath) : "",
      status_claims: options.statusClaimsPath ? normalizePathForOutput(options.statusClaimsPath) : "",
      preparation_router: options.preparationRouterPath ? normalizePathForOutput(options.preparationRouterPath) : "",
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : ""
    },
    limits: {
      max_units: options.maxUnits,
      max_chars: options.maxChars
    },
    summary: {
      units_total: unitsDocument.units.length,
      reviewable_units: unitsDocument.units.filter(reviewRequired).length
    },
    chunks: []
  };

  unitChunks.forEach((units, index) => {
    const chunkId = `chunk-${String(index + 1).padStart(4, "0")}`;
    const unitIds = units.map((unit) => unit.unit_id);
    const reviewableUnitIds = units.filter(reviewRequired).map((unit) => unit.unit_id);
    const chunk = {
      chunk_id: chunkId,
      chunk_index: index + 1,
      unit_count: units.length,
      reviewable_unit_count: reviewableUnitIds.length,
      first_unit_id: unitIds[0] || "",
      last_unit_id: unitIds[unitIds.length - 1] || "",
      unit_ids: unitIds,
      reviewable_unit_ids: reviewableUnitIds,
      units_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-units.json`)),
      packet_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-review-packet.md`)),
      expected_output_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-checker-output.json`)),
      units
    };
    manifest.chunks.push(Object.fromEntries(Object.entries(chunk).filter(([key]) => key !== "units")));
    fs.writeFileSync(
      path.join(options.outDir, `${chunkId}-units.json`),
      `${JSON.stringify({ schema_version: "frus-extracted-units-v1", source: `${chunkId} units`, units }, null, 2)}\n`
    );
    fs.writeFileSync(path.join(options.outDir, `${chunkId}-review-packet.md`), renderPacket({ chunk, manifest, guide, schema, statusRegistry, statusClaims, router, matrix }));
  });

  fs.writeFileSync(path.join(options.outDir, "chunk-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function renderText(manifest) {
  return `FRUS LLM review chunks built: ${manifest.chunk_count} chunks, ${manifest.summary.units_total} units, ${manifest.summary.reviewable_units} reviewable units.\nManifest: ${normalizePathForOutput(path.join(process.cwd(), "chunk-manifest.json"))}\n`;
}

try {
  const options = parseArgs(process.argv);
  const manifest = buildChunks(options);
  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    process.stdout.write(
      `FRUS LLM review chunks built: ${manifest.chunk_count} chunks, ${manifest.summary.units_total} units, ${manifest.summary.reviewable_units} reviewable units.\nManifest: ${normalizePathForOutput(path.join(options.outDir, "chunk-manifest.json"))}\n`
    );
  }
} catch (error) {
  console.error(`FRUS LLM review chunk build failed: ${error.message}`);
  process.exit(1);
}
