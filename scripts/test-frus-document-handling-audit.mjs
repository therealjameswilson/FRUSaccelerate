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

const registry = "reports/frus-document-handling-registry.sample.json";
const units = "reports/frus-document-handling-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-document-handling-audit-test-"));

try {
  const validation = run("scripts/validate-frus-document-handling-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 7, "expected seven document handling registry records");

  const audit = run("scripts/audit-frus-document-handling-usage.mjs", [
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
  assert(report.summary.document_handling_usages === 7, "expected seven matched document handling usages");
  assert(report.summary.by_usage_status.approved === 2, "expected two approved usages");
  assert(report.summary.by_usage_status.cross_volume_document_handling === 4, "expected four cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_document_handling_like_units === 1, "expected one unmatched document-handling-like unit");
  assert(report.usages.some((usage) => usage.handling_type === "initials_and_marginalia"), "expected initials and marginalia match");
  assert(report.usages.some((usage) => usage.handling_type === "routing_and_stamped_notation"), "expected routing and stamped notation match");
  assert(report.usages.some((usage) => usage.handling_type === "approval"), "expected approval match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe document handling direct edit fixture.",
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
            unit_id: "document-handling-0001",
            rule_id: "FAS-HND-001",
            severity: "major",
            category: "physical_routing_marginalia",
            finding: "Unsafe document-handling edit.",
            standard: "Document-handling direct edits require target-volume handling registry support.",
            recommended_action: "replace_text",
            original_text: "Watson initialed the memorandum on Gregg’s behalf. Bush wrote in the top right-hand margin of the memorandum: “good paper. Sam: see question on page 2 of Anne’s letter ?? also p. 3 GB 3–19.”",
            replacement_text: "Bush approved the memorandum.",
            comment_text: "",
            evidence_request: "physical_evidence_basis",
            verification_target: "Target-volume document handling registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-document-handling-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe document handling direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_document_handling_edit_conflicts === 1, "expected one direct document handling edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-document-handling-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log("FRUS document handling audit test passed: registry validation, initials, marginalia, stamped notation, routing, approvals, variants, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
