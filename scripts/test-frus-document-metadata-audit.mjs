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

function checkerOutputWithDirectMetadataEdit() {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Fixture with an unsafe document-metadata direct edit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "This should be stopped by the document-metadata audit.",
      gates: [
        {
          gate_id: "evidence_basis",
          gate_status: "warning",
          finding: "Document heading variant still needs target document-page verification.",
          required_action: "Do not directly redline document metadata until the target document-page form is supplied."
        }
      ]
    },
    checks: [
      {
        unit_id: "document-heading-0002",
        rule_id: "FAS-DM-001",
        severity: "major",
        category: "document_metadata",
        finding: "Unsafe fixture direct edit of shorthand document heading.",
        standard: "Document metadata redlines require supplied target document-page evidence.",
        recommended_action: "replace_text",
        original_text: "Memo from Ross to Secretary Baker",
        replacement_text: "Information Memorandum From the Director of the Policy Planning Staff (Ross) to Secretary of State Baker",
        comment_text: "",
        evidence_request: "document_metadata",
        verification_target: "Target-volume document page"
      }
    ],
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-document-metadata-audit-test-"));

try {
  const validation = run("scripts/validate-frus-document-metadata-registry.mjs", [
    "--registry",
    "reports/frus-document-metadata-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected document-metadata registry validation to pass");
  assert(validationReport.summary.records === 5, "expected five document-metadata records");

  const audit = run("scripts/audit-frus-document-metadata-usage.mjs", [
    "--units",
    "reports/frus-document-metadata-units.sample.json",
    "--registry",
    "reports/frus-document-metadata-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-document-metadata-usage-audit-v1", "expected metadata audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 5, "expected five scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 4, "expected approved document metadata matches");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 1, "expected metadata variant warning");
  assert(auditReport.summary.by_usage_status.cross_volume_metadata >= 2, "expected cross-volume metadata warnings");
  assert(auditReport.summary.unmatched_metadata_units === 1, "expected one unmatched metadata-like unit");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "document-heading-0002" &&
        usage.matched_text === "Memo from Ross to Secretary Baker" &&
        usage.usage_status === "variant_needs_review"
    ),
    "expected Ross-to-Baker shorthand heading variant warning"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "document-heading-0003" &&
        usage.document_id === "frus1981-88v44p1/d1" &&
        usage.usage_status === "cross_volume_metadata"
    ),
    "expected Reagan document heading cross-volume warning for START I target"
  );

  const checkerOutput = path.join(tmpDir, "checker-output.json");
  fs.writeFileSync(checkerOutput, `${JSON.stringify(checkerOutputWithDirectMetadataEdit(), null, 2)}\n`);
  const directEditAudit = run("scripts/audit-frus-document-metadata-usage.mjs", [
    "--units",
    "reports/frus-document-metadata-units.sample.json",
    "--registry",
    "reports/frus-document-metadata-registry.sample.json",
    "--checker-output",
    checkerOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(directEditAudit.status !== 0, "expected unsafe document-metadata direct edit to fail");
  const directEditReport = JSON.parse(directEditAudit.stdout);
  assert(directEditReport.status === "fail", "expected failed direct-edit metadata audit");
  assert(directEditReport.summary.direct_document_metadata_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-document-metadata-usage.mjs", [
    "--units",
    "reports/frus-document-metadata-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed document-metadata registry to fail");
  assert(malformed.stdout.includes("frus-document-metadata-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS document-metadata audit test passed: registry validation, metadata usage audit, variant/cross-volume warnings, unmatched metadata units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
