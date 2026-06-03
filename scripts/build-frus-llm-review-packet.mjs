#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const PACKET_SCHEMA_VERSION = "frus-llm-review-packet-v1";

function usage() {
  console.error(
    "Usage: node scripts/build-frus-llm-review-packet.mjs --units <extracted-units.json> [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--status-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--out packet.md] [--format markdown|json]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let guidePath = "reports/frus-annotation-checker-core.md";
  let schemaPath = "reports/frus-annotation-checker-output.schema.json";
  let statusRegistryPath = null;
  let preparationRouterPath = null;
  let permutationMatrixPath = null;
  let targetVolume = "";
  let runId = `frus-llm-review-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let outPath = null;
  let format = "markdown";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
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

  if (!unitsPath || !guidePath || !schemaPath || !runId || !new Set(["markdown", "json"]).has(format)) {
    usage();
  }

  return {
    unitsPath,
    guidePath,
    schemaPath,
    statusRegistryPath,
    preparationRouterPath,
    permutationMatrixPath,
    targetVolume,
    runId,
    outPath,
    format
  };
}

function readText(filePath, label) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateUnits(unitsDocument, label) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) {
    errors.push(`${label}: expected extracted-units object`);
    return errors;
  }
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
    for (const key of ["unit_id", "unit_type", "exact_text", "display_text", "editability", "edit_safety", "comment_safety"]) {
      if (typeof unit[key] !== "string") {
        errors.push(`${unitLabel}.${key}: expected string`);
      }
    }
    if (typeof unit.unit_id === "string" && unit.unit_id.length > 0) {
      if (seen.has(unit.unit_id)) errors.push(`${unitLabel}.unit_id: duplicate ${unit.unit_id}`);
      seen.add(unit.unit_id);
    }
  });
  return errors;
}

function schemaSummary(schema) {
  const defs = schema.$defs || {};
  return {
    schema_version_required: schema.properties?.schema_version?.const || "",
    top_level_required: schema.required || [],
    readiness_gates: defs.readiness_gate?.properties?.gate_id?.enum || [],
    categories: defs.category?.enum || [],
    evidence_requests: defs.evidence_request?.enum || [],
    recommended_actions: defs.check?.properties?.recommended_action?.enum || [],
    discrepancy_statuses: defs.style_discrepancy?.properties?.status?.enum || []
  };
}

function unitSummary(unitsDocument) {
  const byType = {};
  const byEditSafety = {};
  const blockedBoundaries = {};
  for (const unit of unitsDocument.units || []) {
    byType[unit.unit_type] = (byType[unit.unit_type] || 0) + 1;
    byEditSafety[unit.edit_safety] = (byEditSafety[unit.edit_safety] || 0) + 1;
    for (const boundary of unit.blocked_boundaries || []) {
      blockedBoundaries[boundary] = (blockedBoundaries[boundary] || 0) + 1;
    }
  }
  return {
    total_units: unitsDocument.units?.length || 0,
    by_unit_type: byType,
    by_edit_safety: byEditSafety,
    blocked_boundaries: blockedBoundaries
  };
}

function compactStatusRegistry(registry, targetVolume) {
  if (!registry) return null;
  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  const target = targetVolume ? entries.find((entry) => entry.entry_id === targetVolume) || null : null;
  return {
    schema_version: registry.schema_version,
    captured_at: registry.captured_at,
    source_url: registry.source_url,
    scope: registry.scope,
    snapshot_integrity: registry.snapshot_integrity,
    target_volume: target,
    entries: entries.map((entry) => ({
      entry_id: entry.entry_id,
      administration: entry.administration,
      date_range: entry.date_range,
      volume_number: entry.volume_number,
      title: entry.title,
      production_stage: entry.production_stage,
      release_buckets: entry.release_buckets || [],
      published_date: entry.published_date || "",
      history_state_url: entry.history_state_url,
      subitems: entry.subitems || []
    }))
  };
}

function compactRouter(router, targetVolume) {
  if (!router) return null;
  const routes = Array.isArray(router.routes) ? router.routes : [];
  const target = targetVolume ? routes.find((route) => route.entry_id === targetVolume) || null : null;
  return {
    schema_version: router.schema_version,
    captured_at: router.captured_at,
    source_url: router.source_url,
    target_route: target,
    stage_postures: router.stage_postures || [],
    family_definitions: router.family_definitions || [],
    routes
  };
}

function compactPermutationMatrix(matrix) {
  if (!matrix) return null;
  return {
    schema_version: matrix.schema_version,
    matrix_id: matrix.matrix_id,
    source_schema: matrix.source_schema,
    source_router: matrix.source_router,
    purpose: matrix.purpose,
    use_limits: matrix.use_limits || [],
    category_policies: matrix.category_policies || [],
    evidence_request_policies: matrix.evidence_request_policies || []
  };
}

function buildPacket(options) {
  const guideMarkdown = readText(options.guidePath, options.guidePath);
  const schema = readJson(options.schemaPath, options.schemaPath);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const errors = validateUnits(unitsDocument, options.unitsPath);
  if (errors.length > 0) {
    throw new Error(`extracted units failed validation:\n- ${errors.join("\n- ")}`);
  }

  const statusRegistry = options.statusRegistryPath ? readJson(options.statusRegistryPath, options.statusRegistryPath) : null;
  const preparationRouter = options.preparationRouterPath
    ? readJson(options.preparationRouterPath, options.preparationRouterPath)
    : null;
  const permutationMatrix = options.permutationMatrixPath
    ? readJson(options.permutationMatrixPath, options.permutationMatrixPath)
    : null;

  return {
    schema_version: PACKET_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    run_id: options.runId,
    target_volume: options.targetVolume,
    source_files: {
      guide: normalizePathForOutput(options.guidePath),
      schema: normalizePathForOutput(options.schemaPath),
      units: normalizePathForOutput(options.unitsPath),
      status_registry: options.statusRegistryPath ? normalizePathForOutput(options.statusRegistryPath) : "",
      preparation_router: options.preparationRouterPath ? normalizePathForOutput(options.preparationRouterPath) : "",
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : ""
    },
    task_contract: {
      role: "Review extracted Microsoft Word FRUS annotation-sheet units as a bespoke spellcheck engine.",
      must_return: "Return only one valid JSON object matching checker-output-v1. Do not include Markdown outside the JSON.",
      do_not_do: [
        "Do not claim to edit the Word file directly.",
        "Do not invent source-note provenance, classification markings, document numbers, dates, or publication status.",
        "Do not recommend direct text edits unless the exact extracted unit anchor and evidence basis make the edit safe.",
        "Do not collapse evidence requests into the General Editor discrepancy tally."
      ],
      reviewer_posture: [
        "Treat the LLM as a conservative proofreader, not as the authority of record.",
        "Return a checker entry for every reviewable extracted editorial unit, using no_change when the unit is already sound.",
        "Use comment_only when evidence is missing or a Word boundary is unsafe.",
        "Keep the running discrepancy tally separate for the General Editor."
      ]
    },
    packet_summary: {
      units: unitSummary(unitsDocument),
      output_schema: schemaSummary(schema),
      status_registry_entries: statusRegistry?.entries?.length || 0,
      preparation_routes: preparationRouter?.routes?.length || 0,
      matrix_categories: permutationMatrix?.category_policies?.length || 0,
      matrix_evidence_requests: permutationMatrix?.evidence_request_policies?.length || 0
    },
    guide_markdown: guideMarkdown,
    output_schema: schema,
    extracted_units: unitsDocument,
    contexts: {
      status_registry: compactStatusRegistry(statusRegistry, options.targetVolume),
      preparation_router: compactRouter(preparationRouter, options.targetVolume),
      permutation_matrix: compactPermutationMatrix(permutationMatrix)
    }
  };
}

function fencedJson(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function renderMarkdown(packet) {
  const lines = [
    "# FRUS Annotation Review Packet",
    "",
    `- schema_version: ${packet.schema_version}`,
    `- run_id: ${packet.run_id}`,
    `- generated_at: ${packet.generated_at}`,
    `- target_volume: ${packet.target_volume || "not supplied"}`,
    "",
    "## Closed-Network LLM Task",
    "",
    packet.task_contract.role,
    "",
    "**Return only one valid JSON object matching `checker-output-v1`. Do not include Markdown outside the JSON.**",
    "",
    "Do not claim to edit the Word file directly. The wrapper will validate this JSON and apply only safe Word comments or tracked changes.",
    "",
    "Every reviewable extracted editorial unit should have a checker entry. Use `recommended_action: \"no_change\"` when the unit is already sound.",
    "",
    "## Packet Summary",
    "",
    fencedJson(packet.packet_summary),
    "",
    "## Runtime FRUS Annotation Checker Guide",
    "",
    packet.guide_markdown.trim(),
    "",
    "## Output Contract Summary",
    "",
    fencedJson(packet.packet_summary.output_schema),
    "",
    "## Full Output JSON Schema",
    "",
    fencedJson(packet.output_schema),
    "",
    "## Extracted Word Units",
    "",
    "Use `unit_id` values exactly as supplied. Direct edits must use exact text from `exact_text` and must respect editability, edit_safety, comment_safety, existing revisions, comments, and blocked boundaries.",
    "",
    fencedJson(packet.extracted_units),
    "",
    "## Status Registry Context",
    "",
    "Use this only to check publication-status language and volume-stage posture. It is not source-note provenance.",
    "",
    fencedJson(packet.contexts.status_registry || {}),
    "",
    "## Preparation Router Context",
    "",
    fencedJson(packet.contexts.preparation_router || {}),
    "",
    "## Permutation Matrix Context",
    "",
    fencedJson(packet.contexts.permutation_matrix || {}),
    "",
    "## Final Output Reminder",
    "",
    "Return only one JSON object with top-level keys: `schema_version`, `document_assessment`, `batch_readiness`, `checks`, `global_comments`, and `style_discrepancy_tally`."
  ];
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const packet = buildPacket(options);
  const output = options.format === "json" ? `${JSON.stringify(packet, null, 2)}\n` : renderMarkdown(packet);
  if (options.outPath) {
    fs.mkdirSync(path.dirname(options.outPath), { recursive: true });
    fs.writeFileSync(options.outPath, output);
  } else {
    process.stdout.write(output);
  }
} catch (error) {
  console.error(`FRUS LLM review packet build failed: ${error.message}`);
  process.exit(1);
}
