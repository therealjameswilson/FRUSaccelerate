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
      summary: "Fixture for document-relationship usage audit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Document-relationship fixture.",
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-document-relationship-audit-test-"));

try {
  const validation = run("scripts/validate-frus-document-relationship-registry.mjs", [
    "--registry",
    "reports/frus-document-relationship-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected document-relationship registry validation to pass");
  assert(validationReport.summary.records === 10, "expected ten document-relationship records");

  const audit = run("scripts/audit-frus-document-relationship-usage.mjs", [
    "--units",
    "reports/frus-document-relationship-units.sample.json",
    "--registry",
    "reports/frus-document-relationship-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-document-relationship-usage-audit-v1", "expected relationship audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 6, "expected six scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 4, "expected approved relationship matches");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 1, "expected variant relationship warning");
  assert(auditReport.summary.unmatched_relationship_like_units === 1, "expected one unmatched relationship-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "relationship-note-0001" &&
        usage.approved_phrase === "Attached but not printed. See Document 10" &&
        usage.usage_status === "approved"
    ),
    "expected approved Document 10 relationship"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "relationship-note-0004" &&
        usage.approved_phrase === "Printed as Document 26" &&
        usage.usage_status === "approved"
    ),
    "expected approved Printed as Document 26 relationship"
  );

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "relationship-note-0001",
          rule_id: "FAS-REL-001",
          severity: "major",
          category: "attachment",
          finding: "Unsafe fixture changes a target document without a registry-supported relationship.",
          standard: "Attachment and cross-reference language requires a supplied target-document relationship.",
          recommended_action: "replace_text",
          original_text: "Attached but not printed. See Document 10.",
          replacement_text: "Attached but not printed. See Document 9.",
          comment_text: "",
          evidence_request: "cross_reference",
          verification_target: "Source document, attachment label, and target document relationship"
        }
      ]),
      null,
      2
    )}\n`
  );
  const badAudit = run("scripts/audit-frus-document-relationship-usage.mjs", [
    "--units",
    "reports/frus-document-relationship-units.sample.json",
    "--registry",
    "reports/frus-document-relationship-registry.sample.json",
    "--checker-output",
    badOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(badAudit.status !== 0, "expected unsafe relationship direct edit to fail");
  const badReport = JSON.parse(badAudit.stdout);
  assert(badReport.status === "fail", "expected failed direct-edit relationship audit");
  assert(badReport.summary.direct_document_relationship_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-document-relationship-usage.mjs", [
    "--units",
    "reports/frus-document-relationship-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed relationship registry to fail");
  assert(malformed.stdout.includes("frus-document-relationship-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS document-relationship audit test passed: registry validation, attached/not-attached/printed-as-document usage, unmatched warnings, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
