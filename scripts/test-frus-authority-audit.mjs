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

function checkerOutputWithDirectAuthorityEdit() {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Fixture with an unsafe authority-control direct edit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "This should be stopped by the authority audit.",
      gates: [
        {
          gate_id: "authority_registry",
          gate_status: "warning",
          finding: "Authority variant still needs review.",
          required_action: "Do not directly redline authority forms until the volume authority list is supplied."
        }
      ]
    },
    checks: [
      {
        unit_id: "persons-entry-0002",
        rule_id: "FAS-AUTH-001",
        severity: "major",
        category: "authority_control",
        finding: "Unsafe fixture direct edit of a cross-volume/variant authority form.",
        standard: "Authority-control redlines require supplied volume authority evidence.",
        recommended_action: "replace_text",
        original_text: "Bush, George H.W.",
        replacement_text: "Bush, George Herbert Walker",
        comment_text: "",
        evidence_request: "authority_control",
        verification_target: "Volume-specific Persons list"
      }
    ],
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-authority-audit-test-"));

try {
  const validation = run("scripts/validate-frus-authority-registry.mjs", [
    "--registry",
    "reports/frus-authority-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(["pass", "warning"].includes(validationReport.status), "expected registry validation to pass or warn");
  assert(validationReport.summary.records === 8, "expected eight authority records");

  const audit = run("scripts/audit-frus-authority-usage.mjs", [
    "--units",
    "reports/frus-authority-units.sample.json",
    "--registry",
    "reports/frus-authority-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-authority-usage-audit-v1", "expected authority audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 4, "expected four scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 2, "expected approved published forms");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 2, "expected variants needing review");
  assert(auditReport.summary.by_usage_status.cross_volume_variant >= 1, "expected cross-volume variants");
  assert(auditReport.summary.unmatched_authority_units === 1, "expected one unmatched source-list unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "persons-entry-0002" &&
        usage.matched_text === "Bush, George H.W." &&
        usage.usage_status === "variant_needs_review"
    ),
    "expected START I Bush variant warning"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "abbreviation-entry-0003" &&
        usage.matched_text === "C.O.B." &&
        usage.usage_status === "cross_volume_variant"
    ),
    "expected Reagan C.O.B. cross-volume warning for START I target"
  );

  const checkerOutput = path.join(tmpDir, "checker-output.json");
  fs.writeFileSync(checkerOutput, `${JSON.stringify(checkerOutputWithDirectAuthorityEdit(), null, 2)}\n`);
  const directEditAudit = run("scripts/audit-frus-authority-usage.mjs", [
    "--units",
    "reports/frus-authority-units.sample.json",
    "--registry",
    "reports/frus-authority-registry.sample.json",
    "--checker-output",
    checkerOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(directEditAudit.status !== 0, "expected unsafe authority direct edit to fail");
  const directEditReport = JSON.parse(directEditAudit.stdout);
  assert(directEditReport.status === "fail", "expected failed direct-edit authority audit");
  assert(directEditReport.summary.direct_authority_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-authority-usage.mjs", [
    "--units",
    "reports/frus-authority-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed authority registry to fail");
  assert(malformed.stdout.includes("frus-authority-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS authority audit test passed: registry validation, usage audit, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
