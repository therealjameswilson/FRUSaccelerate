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

function checkerOutputWithDirectSourceListEdit() {
  return {
    schema_version: "checker-output-v1",
    document_assessment: {
      overall_status: "needs_revision",
      summary: "Fixture with an unsafe source-list/front-matter direct edit.",
      blocked_reason: ""
    },
    batch_readiness: {
      readiness_status: "ready_for_tracked_changes",
      safe_to_apply_tracked_changes: true,
      readiness_summary: "This should be stopped by the source-list audit.",
      gates: [
        {
          gate_id: "evidence_basis",
          gate_status: "warning",
          finding: "Source-list variant still needs target-volume verification.",
          required_action: "Do not directly redline source-list/front-matter forms until the volume Sources page is supplied."
        }
      ]
    },
    checks: [
      {
        unit_id: "source-list-note-0003",
        rule_id: "FAS-SLF-001",
        severity: "major",
        category: "source_list_front_matter",
        finding: "Unsafe fixture direct edit of a cross-volume source family.",
        standard: "Source-list redlines require supplied target-volume Sources evidence.",
        recommended_action: "replace_text",
        original_text: "Reagan Library",
        replacement_text: "Ronald Reagan Presidential Library",
        comment_text: "",
        evidence_request: "source_list_basis",
        verification_target: "Target-volume Sources page"
      }
    ],
    global_comments: [],
    style_discrepancy_tally: []
  };
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-source-list-audit-test-"));

try {
  const validation = run("scripts/validate-frus-source-list-registry.mjs", [
    "--registry",
    "reports/frus-source-list-registry.sample.json",
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected source-list registry validation to pass");
  assert(validationReport.summary.records === 10, "expected ten source-list records");

  const audit = run("scripts/audit-frus-source-list-usage.mjs", [
    "--units",
    "reports/frus-source-list-units.sample.json",
    "--registry",
    "reports/frus-source-list-registry.sample.json",
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
  assert(auditReport.schema_version === "frus-source-list-usage-audit-v1", "expected source-list audit schema");
  assert(auditReport.status === "warning", `expected warning status, got ${auditReport.status}`);
  assert(auditReport.summary.units_scanned === 5, "expected five scanned units");
  assert(auditReport.summary.by_usage_status.approved >= 4, "expected approved source-list forms");
  assert(auditReport.summary.by_usage_status.variant_needs_review >= 2, "expected source-list variants needing review");
  assert(auditReport.summary.by_usage_status.cross_volume_source >= 2, "expected cross-volume source warnings");
  assert(auditReport.summary.unmatched_source_like_units === 1, "expected one unmatched URL-only source note");
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "source-list-note-0002" &&
        usage.matched_text === "Bush Library" &&
        usage.usage_status === "variant_needs_review"
    ),
    "expected Bush Library variant warning"
  );
  assert(
    auditReport.usages.some(
      (usage) =>
        usage.unit_id === "source-list-note-0003" &&
        usage.matched_text === "Reagan Library" &&
        usage.usage_status === "cross_volume_source"
    ),
    "expected Reagan Library cross-volume warning for START I target"
  );

  const checkerOutput = path.join(tmpDir, "checker-output.json");
  fs.writeFileSync(checkerOutput, `${JSON.stringify(checkerOutputWithDirectSourceListEdit(), null, 2)}\n`);
  const directEditAudit = run("scripts/audit-frus-source-list-usage.mjs", [
    "--units",
    "reports/frus-source-list-units.sample.json",
    "--registry",
    "reports/frus-source-list-registry.sample.json",
    "--checker-output",
    checkerOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(directEditAudit.status !== 0, "expected unsafe source-list direct edit to fail");
  const directEditReport = JSON.parse(directEditAudit.stdout);
  assert(directEditReport.status === "fail", "expected failed direct-edit source-list audit");
  assert(directEditReport.summary.direct_source_list_edit_conflicts >= 1, "expected direct-edit conflict count");

  const malformedRegistry = path.join(tmpDir, "bad-registry.json");
  fs.writeFileSync(malformedRegistry, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const malformed = run("scripts/audit-frus-source-list-usage.mjs", [
    "--units",
    "reports/frus-source-list-units.sample.json",
    "--registry",
    malformedRegistry,
    "--format",
    "json"
  ]);
  assert(malformed.status !== 0, "expected malformed source-list registry to fail");
  assert(malformed.stdout.includes("frus-source-list-registry-v1"), "expected schema-version failure detail");

  console.log("FRUS source-list audit test passed: registry validation, source usage audit, variant/cross-volume warnings, unmatched source-like units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
