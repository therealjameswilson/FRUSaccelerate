#!/usr/bin/env node

import fs from "node:fs";

const SEVERITY_RANK = {
  info: 0,
  minor: 1,
  major: 2,
  blocker: 3
};

const OWNER_HINTS = {
  wrapper: new Set(["wrapper_safety"]),
  declassification: new Set(["classification_marking", "declassification_status", "agency_equity"]),
  general_editor: new Set(["selection_balance_basis"]),
  editor: new Set(["authority_control", "publication_status", "release_apparatus_basis", "source_list_basis"]),
  compiler: new Set([
    "source_image",
    "archival_path",
    "source_surrogate_basis",
    "physical_evidence_basis",
    "negative_search_basis",
    "printed_attachment_basis",
    "transcription_facsimile_basis",
    "visual_material_basis",
    "time_zone_basis",
    "editorial_method_basis",
    "document_status_basis",
    "decision_process_basis",
    "attachment_status",
    "document_number",
    "document_metadata",
    "treaty_component",
    "foreign_org_basis",
    "public_source_basis",
    "retrospective_account_basis",
    "legal_authority",
    "financial_data",
    "military_operation_basis",
    "humanitarian_rights_basis",
    "translation_status",
    "chronology",
    "event_chronology",
    "communications_metadata",
    "source_family",
    "cross_reference"
  ])
};

function usage() {
  console.error(
    "Usage: node scripts/build-frus-evidence-queue.mjs --output <checker-output.json|-> [--format json|text] [--review-mode light|normal|exhaustive]"
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
  let outputPath = null;
  let format = "json";
  let reviewMode = "normal";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output") {
      outputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else if (arg === "--review-mode") {
      reviewMode = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!outputPath || !new Set(["json", "text"]).has(format) || !new Set(["light", "normal", "exhaustive"]).has(reviewMode)) {
    usage();
  }

  return { outputPath, format, reviewMode };
}

function ownerHint(evidenceRequest) {
  for (const [owner, values] of Object.entries(OWNER_HINTS)) {
    if (values.has(evidenceRequest)) return owner;
  }
  return "compiler";
}

function highestSeverity(values) {
  return values.reduce((highest, value) => {
    if (SEVERITY_RANK[value] > SEVERITY_RANK[highest]) return value;
    return highest;
  }, "info");
}

function blocksPublication(check, reviewMode) {
  if (check.severity === "blocker") return true;
  if (reviewMode === "light") return false;
  if (reviewMode === "normal") return check.severity === "major";
  return check.severity === "major" || check.severity === "minor";
}

function queueKey(item) {
  return [
    item.evidence_request,
    item.verification_target,
    item.owner_hint,
    item.blocking_direct_edit,
    item.blocking_publication
  ].join("\u0000");
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function validateOutput(output) {
  const errors = [];
  if (!isPlainObject(output)) {
    errors.push("$: expected checker output object");
    return errors;
  }
  if (output.schema_version !== "checker-output-v1") {
    errors.push("$.schema_version: must be checker-output-v1");
  }
  if (!Array.isArray(output.checks)) {
    errors.push("$.checks: expected array");
  }
  return errors;
}

function buildQueue(output, reviewMode) {
  const itemsByKey = new Map();
  const requests = output.checks
    .map((check, index) => ({ check, index }))
    .filter(({ check }) => isPlainObject(check) && check.evidence_request && check.evidence_request !== "none");

  for (const { check, index } of requests) {
    const item = {
      request_id: "",
      unit_ids: [check.unit_id],
      evidence_request: check.evidence_request,
      verification_target: check.verification_target || "",
      blocking_direct_edit: true,
      blocking_publication: blocksPublication(check, reviewMode),
      owner_hint: ownerHint(check.evidence_request),
      status: "open",
      resolution_note: "",
      resolved_by: "",
      resolved_at: "",
      rule_ids: [check.rule_id],
      categories: [check.category],
      highest_severity: check.severity,
      check_indexes: [index],
      representative_findings: [check.finding]
    };
    const key = queueKey(item);
    const existing = itemsByKey.get(key);
    if (!existing) {
      itemsByKey.set(key, item);
      continue;
    }
    existing.unit_ids = uniqueSorted([...existing.unit_ids, check.unit_id]);
    existing.rule_ids = uniqueSorted([...existing.rule_ids, check.rule_id]);
    existing.categories = uniqueSorted([...existing.categories, check.category]);
    existing.check_indexes = [...new Set([...existing.check_indexes, index])].sort((a, b) => a - b);
    existing.highest_severity = highestSeverity([existing.highest_severity, check.severity]);
    existing.representative_findings = uniqueSorted([...existing.representative_findings, check.finding]).slice(0, 5);
  }

  const queue = [...itemsByKey.values()].sort((a, b) => {
    if (a.owner_hint !== b.owner_hint) return a.owner_hint.localeCompare(b.owner_hint);
    if (a.evidence_request !== b.evidence_request) return a.evidence_request.localeCompare(b.evidence_request);
    return a.verification_target.localeCompare(b.verification_target);
  });

  queue.forEach((item, index) => {
    item.request_id = `evidence-request-${String(index + 1).padStart(4, "0")}`;
  });

  return { queue, requests };
}

function summarize(output, queue, requests, reviewMode) {
  const summary = {
    schema_version: "frus-evidence-queue-v1",
    review_mode: reviewMode,
    checks_scanned: output.checks.length,
    evidence_requests_found: requests.length,
    queue_items: queue.length,
    blocking_direct_edit: queue.filter((item) => item.blocking_direct_edit).length,
    blocking_publication: queue.filter((item) => item.blocking_publication).length,
    by_evidence_request: {},
    by_owner_hint: {}
  };

  for (const item of queue) {
    summary.by_evidence_request[item.evidence_request] =
      (summary.by_evidence_request[item.evidence_request] || 0) + item.unit_ids.length;
    summary.by_owner_hint[item.owner_hint] = (summary.by_owner_hint[item.owner_hint] || 0) + 1;
  }

  return summary;
}

function renderText(result) {
  const lines = [
    `FRUS evidence queue: ${result.summary.evidence_requests_found} requests, ${result.summary.queue_items} queue items, ${result.summary.blocking_publication} publication blockers.`
  ];
  for (const item of result.queue) {
    lines.push(
      `- ${item.request_id}: ${item.evidence_request} - ${item.verification_target} - owner ${item.owner_hint} - units ${item.unit_ids.join(", ")} - status ${item.status}`
    );
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { outputPath, format, reviewMode } = parseArgs(process.argv);
  const output = readJson(outputPath);
  const errors = validateOutput(output);
  if (errors.length > 0) {
    console.error(`FRUS evidence queue build failed (${errors.length} error${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const { queue, requests } = buildQueue(output, reviewMode);
  const result = {
    schema_version: "frus-evidence-queue-v1",
    source_schema_version: output.schema_version,
    document_status: output.document_assessment.overall_status,
    readiness_status: output.batch_readiness.readiness_status,
    safe_to_apply_tracked_changes: output.batch_readiness.safe_to_apply_tracked_changes,
    summary: summarize(output, queue, requests, reviewMode),
    queue
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
