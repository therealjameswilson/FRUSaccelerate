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

const registry = "reports/frus-public-source-registry.sample.json";
const units = "reports/frus-public-source-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-public-source-audit-test-"));

try {
  const validation = run("scripts/validate-frus-public-source-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 6, "expected six public-source registry records");

  const audit = run("scripts/audit-frus-public-source-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
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
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for variant, cross-volume examples, and unmatched unit");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.public_source_usages === 7, "expected seven matched public-source usages");
  assert(report.summary.by_usage_status.approved === 2, "expected two approved usages");
  assert(report.summary.by_usage_status.cross_volume_public_source === 4, "expected four cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_public_source_like_units === 1, "expected one unmatched public-source-like unit");
  assert(report.usages.some((usage) => usage.public_source_type === "public_papers_citation"), "expected Public Papers match");
  assert(report.usages.some((usage) => usage.public_source_type === "department_dispatch"), "expected Department of State Dispatch match");
  assert(report.usages.some((usage) => usage.public_source_type === "department_bulletin"), "expected Department of State Bulletin match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe public-source direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture intentionally unsafe.",
          gates: []
        },
        checks: [
          {
            unit_id: "public-source-0001",
            rule_id: "FAS-PUB-001",
            severity: "major",
            category: "public_diplomacy_public_source",
            finding: "Unsafe public-source edit.",
            standard: "Public-source direct edits require target-volume registry support.",
            recommended_action: "replace_text",
            original_text: "Public Papers: Bush, 1991, pages 986-987",
            replacement_text: "Public Papers: Bush, 1991, pages 990-991",
            comment_text: "",
            evidence_request: "public_source_basis",
            verification_target: "Target-volume public-source registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-public-source-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    checkerOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe public-source direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_public_source_edit_conflicts === 1, "expected one direct public-source edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-public-source-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log(
    "FRUS public-source audit test passed: registry validation, Public Papers, Department of State Bulletin/Dispatch, selected public remarks, variants, cross-volume warnings, unmatched units, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
