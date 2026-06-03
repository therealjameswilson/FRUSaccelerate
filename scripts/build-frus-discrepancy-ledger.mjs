#!/usr/bin/env node

import fs from "node:fs";

const RISK_RANK = { low: 0, medium: 1, high: 2 };
const STATUS_RANK = {
  retired: 0,
  open: 1,
  provisional_guidance: 2,
  resolved: 3
};

function usage() {
  console.error(
    "Usage: node scripts/build-frus-discrepancy-ledger.mjs --output <checker-output.json|-> [--output <checker-output.json>] [--existing <ledger.json>] [--format json|text] [--run-id RUN]"
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

function parseArgs(argv) {
  const outputPaths = [];
  let existingPath = null;
  let format = "json";
  let runId = "current-run";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output") {
      outputPaths.push(argv[index + 1]);
      index += 1;
    } else if (arg === "--existing") {
      existingPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (outputPaths.length === 0 || !new Set(["json", "text"]).has(format) || !runId) {
    usage();
  }
  if (outputPaths.filter((path) => path === "-").length > 1 || (existingPath === "-" && outputPaths.includes("-"))) {
    usage();
  }

  return { outputPaths, existingPath, format, runId };
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function strongerRisk(a, b) {
  return RISK_RANK[b] > RISK_RANK[a] ? b : a;
}

function strongerStatus(a, b) {
  return STATUS_RANK[b] > STATUS_RANK[a] ? b : a;
}

function ledgerKey(item) {
  return `${normalizeKey(item.category)}\u0000${normalizeKey(item.style_question)}`;
}

function validateOutput(output, label) {
  const errors = [];
  if (!isPlainObject(output)) {
    errors.push(`${label}: expected checker output object`);
    return errors;
  }
  if (output.schema_version !== "checker-output-v1") {
    errors.push(`${label}.schema_version: must be checker-output-v1`);
  }
  if (!Array.isArray(output.style_discrepancy_tally)) {
    errors.push(`${label}.style_discrepancy_tally: expected array`);
  }
  return errors;
}

function validateLedger(existing, label) {
  const errors = [];
  if (!isPlainObject(existing)) {
    errors.push(`${label}: expected ledger object`);
    return errors;
  }
  if (existing.schema_version !== "frus-discrepancy-ledger-v1") {
    errors.push(`${label}.schema_version: must be frus-discrepancy-ledger-v1`);
  }
  if (!Array.isArray(existing.ledger)) {
    errors.push(`${label}.ledger: expected array`);
  }
  return errors;
}

function fromTallyItem(item, source, runId) {
  return {
    discrepancy_id: "",
    category: item.category,
    style_question: item.style_question,
    variants_observed: uniqueSorted([item.variant_a, item.variant_b]),
    unit_ids: uniqueSorted(item.unit_ids || []),
    published_or_local_examples: uniqueSorted(item.published_or_local_examples || []),
    count: Number.isInteger(item.count) ? item.count : 1,
    risk: item.risk || "medium",
    checker_actions: uniqueSorted([item.checker_action]),
    general_editor_question: item.general_editor_question,
    status: item.status || "open",
    first_seen: item.first_seen || runId,
    last_seen: item.last_seen || runId,
    resolution_note: item.resolution_note || "",
    source_discrepancy_ids: uniqueSorted([item.discrepancy_id]),
    source_runs: uniqueSorted([source])
  };
}

function fromLedgerItem(item) {
  return {
    discrepancy_id: item.discrepancy_id,
    category: item.category,
    style_question: item.style_question,
    variants_observed: uniqueSorted(item.variants_observed || [item.variant_a, item.variant_b]),
    unit_ids: uniqueSorted(item.unit_ids || []),
    published_or_local_examples: uniqueSorted(item.published_or_local_examples || item.examples || []),
    count: Number.isInteger(item.count) ? item.count : 1,
    risk: item.risk || "medium",
    checker_actions: uniqueSorted(item.checker_actions || [item.checker_action]),
    general_editor_question: item.general_editor_question || "",
    status: item.status || "open",
    first_seen: item.first_seen || "",
    last_seen: item.last_seen || "",
    resolution_note: item.resolution_note || "",
    source_discrepancy_ids: uniqueSorted(item.source_discrepancy_ids || [item.discrepancy_id]),
    source_runs: uniqueSorted(item.source_runs || [])
  };
}

function mergeItem(existing, incoming) {
  existing.variants_observed = uniqueSorted([...existing.variants_observed, ...incoming.variants_observed]);
  existing.unit_ids = uniqueSorted([...existing.unit_ids, ...incoming.unit_ids]);
  existing.published_or_local_examples = uniqueSorted([
    ...existing.published_or_local_examples,
    ...incoming.published_or_local_examples
  ]);
  existing.count += incoming.count;
  existing.risk = strongerRisk(existing.risk, incoming.risk);
  existing.checker_actions = uniqueSorted([...existing.checker_actions, ...incoming.checker_actions]);
  existing.general_editor_question = existing.general_editor_question || incoming.general_editor_question;
  existing.status = strongerStatus(existing.status, incoming.status);
  existing.first_seen = existing.first_seen || incoming.first_seen;
  existing.last_seen = incoming.last_seen || existing.last_seen;
  existing.resolution_note = existing.resolution_note || incoming.resolution_note;
  existing.source_discrepancy_ids = uniqueSorted([
    ...existing.source_discrepancy_ids,
    ...incoming.source_discrepancy_ids
  ]);
  existing.source_runs = uniqueSorted([...existing.source_runs, ...incoming.source_runs]);
}

function assignIds(items) {
  const used = new Set(items.map((item) => item.discrepancy_id).filter(Boolean));
  let next = 1;

  for (const item of items) {
    if (item.discrepancy_id) continue;
    while (used.has(`style-discrepancy-${String(next).padStart(4, "0")}`)) {
      next += 1;
    }
    item.discrepancy_id = `style-discrepancy-${String(next).padStart(4, "0")}`;
    used.add(item.discrepancy_id);
  }
}

function buildLedger({ existingLedger, outputs, runId }) {
  const itemsByKey = new Map();
  let outputsScanned = 0;
  let tallyItemsFound = 0;

  if (existingLedger) {
    for (const item of existingLedger.ledger) {
      if (!isPlainObject(item)) continue;
      const normalized = fromLedgerItem(item);
      itemsByKey.set(ledgerKey(normalized), normalized);
    }
  }

  for (const { output, source } of outputs) {
    outputsScanned += 1;
    for (const item of output.style_discrepancy_tally) {
      if (!isPlainObject(item)) continue;
      tallyItemsFound += 1;
      const incoming = fromTallyItem(item, source || runId, runId);
      const key = ledgerKey(incoming);
      if (itemsByKey.has(key)) {
        mergeItem(itemsByKey.get(key), incoming);
      } else {
        itemsByKey.set(key, incoming);
      }
    }
  }

  const ledger = [...itemsByKey.values()].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.style_question.localeCompare(b.style_question);
  });
  assignIds(ledger);

  return { ledger, outputsScanned, tallyItemsFound };
}

function summarize(ledger, outputsScanned, tallyItemsFound) {
  const summary = {
    schema_version: "frus-discrepancy-ledger-v1",
    outputs_scanned: outputsScanned,
    discrepancy_items_found: tallyItemsFound,
    ledger_items: ledger.length,
    by_status: {},
    by_risk: {},
    by_category: {}
  };

  for (const item of ledger) {
    summary.by_status[item.status] = (summary.by_status[item.status] || 0) + 1;
    summary.by_risk[item.risk] = (summary.by_risk[item.risk] || 0) + 1;
    summary.by_category[item.category] = (summary.by_category[item.category] || 0) + 1;
  }

  return summary;
}

function renderText(result) {
  const lines = [
    `FRUS discrepancy ledger: ${result.summary.ledger_items} ledger items, ${result.summary.discrepancy_items_found} new discrepancy items.`
  ];
  for (const item of result.ledger) {
    lines.push(
      `- ${item.discrepancy_id}: ${item.status} ${item.category} (${item.risk}) count ${item.count} - ${item.style_question}`
    );
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { outputPaths, existingPath, format, runId } = parseArgs(process.argv);
  const errors = [];
  let existingLedger = null;

  if (existingPath) {
    existingLedger = readJson(existingPath);
    errors.push(...validateLedger(existingLedger, existingPath));
  }

  const outputs = outputPaths.map((path) => {
    const output = readJson(path);
    errors.push(...validateOutput(output, path));
    return { output, source: runId || path };
  });

  if (errors.length > 0) {
    console.error(`FRUS discrepancy ledger build failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const { ledger, outputsScanned, tallyItemsFound } = buildLedger({ existingLedger, outputs, runId });
  const result = {
    schema_version: "frus-discrepancy-ledger-v1",
    summary: summarize(ledger, outputsScanned, tallyItemsFound),
    ledger
  };

  if (format === "text") {
    process.stdout.write(renderText(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
