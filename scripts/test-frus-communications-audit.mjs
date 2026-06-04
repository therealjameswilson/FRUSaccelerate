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
      summary: "Fixture for communications metadata usage audit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "Communications fixture.",
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-communications-audit-test-"));

try {
  const validation = run("scripts/validate-frus-communications-registry.mjs", [
    "--registry",
    "reports/frus-communications-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected communications registry validation to pass");
  assert(validationReport.summary.records === 11, "expected eleven communications records");

  const audit = run("scripts/audit-frus-communications-usage.mjs", [
    "--units",
    "reports/frus-communications-units.sample.json",
    "--registry",
    "reports/frus-communications-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-communications-usage-audit-v1", "expected communications audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 9, "expected nine scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 6, "expected approved communications matches");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 1, "expected variant communications warning");
  assert(auditReport.summary.by_usage_status.cross_volume_communications >= 1, "expected cross-volume communications warning");
  assert(auditReport.summary.unmatched_communications_like_units === 1, "expected one unmatched communications-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0001" &&
        usage.message_identifier === "SECTO 2017" &&
        usage.usage_status === "approved"
    ),
    "expected approved SECTO 2017 communications usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0002" &&
        usage.message_identifier === "424164/TOSEC 290026" &&
        usage.usage_status === "approved"
    ),
    "expected approved TOSEC 290026 communications usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0005" &&
        usage.message_identifier === "285386" &&
        usage.usage_status === "cross_volume_communications"
    ),
    "expected cross-volume joint State/Defense communications usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0007" &&
        usage.communications_type === "joint_statement_exchange" &&
        usage.usage_status === "approved"
    ),
    "expected approved final-plenary statement-exchange communications usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0008" &&
        usage.communications_type === "joint_statement" &&
        usage.usage_status === "approved"
    ),
    "expected approved joint-statement correction communications usage"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "communications-note-0009" &&
        usage.communications_type === "diplomatic_letter_delivery" &&
        usage.usage_status === "approved"
    ),
    "expected approved diplomatic-letter delivery communications usage"
  );

  const badOutputPath = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    badOutputPath,
    `${JSON.stringify(
      checkerOutput([
        {
          unit_id: "communications-note-0003",
          rule_id: "FAS-COM-001",
          severity: "major",
          category: "communications_record",
          finding: "Unsafe fixture swaps a TOSEC identifier without a registry-supported exact unit match.",
          standard: "Message identifiers and special designators require target-volume communications registry support.",
          recommended_action: "replace_text",
          original_text: "TOSEC 10393",
          replacement_text: "424164/TOSEC 290026",
          comment_text: "",
          evidence_request: "communications_metadata",
          verification_target: "Message identifier, source note, origin/addressee, and date-time line"
        },
        {
          unit_id: "communications-note-0007",
          rule_id: "FAS-GEN-000",
          severity: "major",
          category: "wording",
          finding: "Unsafe fixture rewrites formal statement-exchange labels as generic discussion language.",
          standard: "Published final-plenary statement-exchange labels require communications registry support.",
          recommended_action: "replace_text",
          original_text: "exchanged joint and reciprocal statements",
          replacement_text: "discussed joint statements",
          comment_text: "",
          evidence_request: "none",
          verification_target: "Target-volume communications registry"
        }
      ]),
      null,
      2
    )}\n`
  );
  const badAudit = run("scripts/audit-frus-communications-usage.mjs", [
    "--units",
    "reports/frus-communications-units.sample.json",
    "--registry",
    "reports/frus-communications-registry.sample.json",
    "--checker-output",
    badOutputPath,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(badAudit.status !== 0, "expected unsafe communications direct edit to fail");
  const badReport = JSON.parse(badAudit.stdout);
  assert(badReport.status === "fail", "expected failed communications direct-edit audit");
  assert(badReport.summary.direct_communications_edit_conflicts >= 2, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-communications-usage.mjs", [
    "--units",
    "reports/frus-communications-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed communications registry to fail");
  assert(malformed.stdout.includes("frus-communications-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS communications audit test passed: registry validation, SECTO/TOSEC/DTG usage, final-plenary statement exchange, joint-statement correction, diplomatic-letter delivery, cross-volume warnings, unmatched telegram-like units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
