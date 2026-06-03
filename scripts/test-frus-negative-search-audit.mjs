#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
}

function checkerOutput(checks) {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Fixture for negative-search usage audit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Negative-search fixture.",
      gates: [
        {
          gate_id: "evidence_basis",
          gate_status: "pass",
          finding: "Fixture gate.",
          required_action: ""
        }
      ]
    },
    checks,
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-negative-search-audit-test-"));

try {
  const validation = run("scripts/validate-frus-negative-search-registry.mjs", [
    "--registry",
    "reports/frus-negative-search-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected negative-search registry validation to pass");
  assert(validationReport.summary.records === 6, "expected six negative-search records");

  const audit = run("scripts/audit-frus-negative-search-usage.mjs", [
    "--units",
    "reports/frus-negative-search-units.sample.json",
    "--registry",
    "reports/frus-negative-search-registry.sample.json",
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const auditReport = JSON.parse(audit.stdout);
  assert(auditReport.schema_version === "frus-negative-search-usage-audit-v1", "expected negative-search audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 6, "expected six scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 2, "expected approved negative-search matches");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 1, "expected variant negative-search warning");
  assert(auditReport.summary.by_usage_status.cross_volume_negative_search >= 2, "expected cross-volume negative-search warnings");
  assert(auditReport.summary.unmatched_negative_search_like_units === 1, "expected one unmatched negative-search-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "negative-search-note-0002" &&
        usage.approved_phrase === "Not attached" &&
        usage.usage_status === "approved"
    ),
    "expected approved Not attached usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "negative-search-note-0005" &&
        usage.approved_phrase === "Not found attached" &&
        usage.usage_status === "cross_volume_negative_search"
    ),
    "expected RAC Not found attached cross-volume warning"
  );

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "negative-search-note-0005",
          rule_id: "FAS-NEG-001",
          severity: "major",
          category: "negative_search_no_record",
          finding: "Unsafe fixture collapses RAC attachment ambiguity into a different attachment-status claim.",
          standard: "Negative-search and attachment-status phrases require supplied search basis and relationship evidence.",
          recommended_action: "replace_text",
          original_text: "Not found attached.",
          replacement_text: "Not attached.",
          comment_text: "",
          evidence_request: "negative_search_basis",
          verification_target: "Attachment search basis and source-file relationship"
        }
      ]),
      null,
      2
    )}\n`
  );
  const badAudit = run("scripts/audit-frus-negative-search-usage.mjs", [
    "--units",
    "reports/frus-negative-search-units.sample.json",
    "--registry",
    "reports/frus-negative-search-registry.sample.json",
    "--checker-output",
    badOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(badAudit.status !== 0, "expected unsafe negative-search direct edit to fail");
  const badReport = JSON.parse(badAudit.stdout);
  assert(badReport.status === "fail", "expected failed direct-edit negative-search audit");
  assert(badReport.summary.direct_negative_search_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-negative-search-usage.mjs", [
    "--units",
    "reports/frus-negative-search-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed negative-search registry to fail");
  assert(malformed.stdout.includes("frus-negative-search-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS negative-search audit test passed: registry validation, no-minutes/not-found/not-attached/RAC usage, unmatched warnings, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
