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

const registry = "reports/frus-foreign-org-registry.sample.json";
const units = "reports/frus-foreign-org-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-foreign-org-audit-test-"));

try {
  const validation = run("scripts/validate-frus-foreign-org-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected foreign-org registry validation pass");
  assert(validationReport.summary.records === 10, "expected ten foreign-org registry records");

  const audit = run("scripts/audit-frus-foreign-org-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched examples");
  assert(report.summary.units_scanned === 11, "expected eleven units scanned");
  assert(report.summary.foreign_org_usages === 10, "expected ten matched foreign-org usages");
  assert(report.summary.by_usage_status.approved === 3, "expected three approved usages");
  assert(report.summary.by_usage_status.cross_volume_foreign_org === 6, "expected six cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_foreign_org_like_units === 1, "expected one unmatched foreign-org-like unit");
  assert(report.summary.by_entity_type.international_organization === 1, "expected international organization match");
  assert(report.summary.by_entity_type.summit_conference === 1, "expected summit/conference match");
  assert(report.summary.by_entity_type.treaty_party === 1, "expected treaty-party match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe foreign-org direct edit fixture.",
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
            unit_id: "foreign-org-0007",
            rule_id: "FAS-FOREIGN-ORG-001",
            severity: "major",
            category: "foreign_international_organization",
            finding: "Unsafe conference identity edit.",
            standard: "Foreign/international-organization direct edits require target-volume registry support.",
            recommended_action: "replace_text",
            original_text: "CSCE Summit",
            replacement_text: "Conference on Security and Cooperation in Europe Summit",
            comment_text: "",
            evidence_request: "foreign_org_basis",
            verification_target: "Target-volume foreign-org registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-foreign-org-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe foreign-org direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_foreign_org_edit_conflicts === 1, "expected one direct foreign-org edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-foreign-org-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed foreign-org registry validation to fail");

  console.log(
    "FRUS foreign-org audit test passed: registry validation, UN/UNSC/GATT, ASEAN/ANZUS/IMF, CSCE, USSR, US/UK, treaty-party, unmatched units, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
