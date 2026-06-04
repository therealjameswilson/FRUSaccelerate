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

const registry = "reports/frus-congressional-legal-registry.sample.json";
const units = "reports/frus-congressional-legal-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-congressional-legal-test-"));

try {
  const validation = run("scripts/validate-frus-congressional-legal-registry.mjs", [
    "--registry",
    registry,
    "--format",
    "json"
  ]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected congressional/legal registry validation pass");
  assert(validationReport.summary.records === 16, "expected sixteen congressional/legal records");
  assert(validationReport.summary.by_legal_type.public_law_statute === 2, "expected two public-law records");
  assert(validationReport.summary.by_legal_type.senate_advice_and_consent === 2, "expected two Senate advice-and-consent records");

  const audit = run("scripts/audit-frus-congressional-legal-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched fixture");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.congressional_legal_usages === 18, "expected approved and variant registry forms to match sample units");
  assert(report.summary.by_usage_status.approved === 5, "expected five target-volume approved usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one target-volume variant review usage");
  assert(
    report.summary.by_usage_status.cross_volume_congressional_legal_context === 12,
    "expected twelve cross-volume congressional/legal usages"
  );
  assert(report.summary.unmatched_congressional_legal_like_units === 1, "expected one unmatched legal-like unit");
  assert(report.summary.by_legal_type.public_law_statute === 2, "expected public-law usage count");
  assert(report.summary.by_legal_type.federal_register_publication === 1, "expected Federal Register usage count");
  assert(report.summary.by_legal_type.congressional_notice === 2, "expected congressional-notice usage count with variant");
  assert(
    report.usages.some((usage) => usage.congressional_legal_id === "congressional-legal-start-submit-advice-consent-001"),
    "expected START I Senate advice-and-consent usage"
  );
  assert(
    report.usages.some((usage) => usage.congressional_legal_id === "congressional-legal-v01-tax-act-001"),
    "expected Reagan Foundations public-law usage"
  );
  assert(
    report.usages.some((usage) => usage.congressional_legal_id === "congressional-legal-v24-presidential-determination-001"),
    "expected Presidential Determination usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe congressional/legal direct edit fixture.",
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
            unit_id: "congressional-legal-0008",
            rule_id: "FAS-CONGRESSIONAL-LEGAL-001",
            severity: "major",
            category: "congressional_legal_authority",
            finding: "Unsafe guessed public law.",
            standard: "Do not invent congressional/legal authority.",
            recommended_action: "replace_text",
            original_text: "P.L. TK and a Senate committee clearance apparently authorized the sale.",
            replacement_text: "P.L. 97-99 authorized the sale.",
            comment_text: "",
            evidence_request: "legal_authority",
            verification_target: "target-volume legal authority"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-congressional-legal-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe congressional/legal direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_congressional_legal_edit_conflicts === 1,
    "expected one congressional/legal direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved congressional/legal direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses target-volume registry phrase.",
          gates: []
        },
        checks: [
          {
            unit_id: "congressional-legal-0001",
            rule_id: "FAS-CONGRESSIONAL-LEGAL-002",
            severity: "minor",
            category: "congressional_legal_authority",
            finding: "Known target volume Senate phrase can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "submitted to the Senate",
            replacement_text: "submitted to the Senate for its advice and consent to ratification at the earliest possible date",
            comment_text: "",
            evidence_request: "legal_authority",
            verification_target: "target-volume legal authority"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-congressional-legal-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1989-92v31",
    "--format",
    "json"
  ]);
  assert(safe.status === 0, "expected registry-approved congressional/legal direct edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_congressional_legal_edit_conflicts === 0,
    "expected zero congressional/legal direct-edit conflicts for approved replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.records[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-congressional-legal-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed congressional/legal registry validation to fail");

  console.log(
    "FRUS congressional/legal audit test passed: Senate advice-and-consent, hearings, budget authority, public laws, congressional notices, FMS cuts, Presidential Determinations, Arms Export Control Act, Federal Register publication, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
