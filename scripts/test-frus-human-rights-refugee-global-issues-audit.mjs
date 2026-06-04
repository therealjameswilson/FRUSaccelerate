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

const registry = "reports/frus-human-rights-refugee-global-issues-registry.sample.json";
const units = "reports/frus-human-rights-refugee-global-issues-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-humanitarian-test-"));

try {
  const validation = run("scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected human-rights/refugee/global-issues registry validation pass");
  assert(validationReport.summary.records === 12, "expected twelve human-rights/refugee/global-issues records");
  assert(
    validationReport.summary.by_record_type.population_policy_public_controversy === 2,
    "expected two population-policy records"
  );
  assert(
    validationReport.summary.by_record_type.environmental_global_issue === 2,
    "expected two environmental global-issues records"
  );
  assert(validationReport.summary.by_record_type.pl480_food_assistance === 1, "expected one PL 480 record");
  assert(
    validationReport.summary.by_record_type.refugee_relief_and_food_assistance === 1,
    "expected one refugee relief/food assistance record"
  );

  const audit = run("scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v41",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for cross-volume, variant, and unmatched fixtures");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(
    report.summary.human_rights_refugee_global_issues_usages === 13,
    "expected thirteen human-rights/refugee/global-issues usages"
  );
  assert(report.summary.by_usage_status.approved === 11, "expected eleven approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_human_rights_refugee_global_issues_context === 1,
    "expected one cross-volume context usage"
  );
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(
    report.summary.unmatched_human_rights_refugee_global_issues_like_units === 1,
    "expected one unmatched human-rights/refugee/global-issues-like unit"
  );
  assert(
    report.usages.some((usage) => usage.humanitarian_id === "humanitarian-v41-d220-pl480-title-001"),
    "expected PL 480 Title II food-aid usage"
  );
  assert(
    report.usages.some((usage) => usage.humanitarian_id === "humanitarian-v41-d276-unfpa-amount-001"),
    "expected UNFPA amount usage"
  );
  assert(
    report.usages.some((usage) => usage.humanitarian_id === "humanitarian-v41-d349-ozone-convention-001"),
    "expected ozone convention usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe humanitarian direct edit fixture.",
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
            unit_id: "humanitarian-0008",
            rule_id: "FAS-HUM-001",
            severity: "major",
            category: "human_rights_refugee_global_issues",
            finding: "Unsafe guessed refugee/asylum status.",
            standard: "Do not invent refugee, asylum, waiver, or relief status.",
            recommended_action: "replace_text",
            original_text: "Section 416 refugee resettlement waiver and PRM asylum migration claims",
            replacement_text: "Section 416 certified PRM asylum migration waivers",
            comment_text: "",
            evidence_request: "humanitarian_rights_basis",
            verification_target: "target-volume human-rights/refugee/global-issues registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v41",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe human-rights/refugee/global-issues direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_human_rights_refugee_global_issues_edit_conflicts === 1,
    "expected one human-rights/refugee/global-issues direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved humanitarian direct edit fixture.",
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
            unit_id: "humanitarian-0004",
            rule_id: "FAS-HUM-002",
            severity: "minor",
            category: "human_rights_refugee_global_issues",
            finding: "Known target-volume UNFPA subject can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "U.S. Contribution to UNFPA",
            replacement_text: "Your Meeting on the US Contribution to UNFPA",
            comment_text: "",
            evidence_request: "amount_or_metric",
            verification_target: "target-volume human-rights/refugee/global-issues registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v41",
    "--format",
    "json"
  ]);
  assert(safe.status === 0, "expected registry-approved human-rights/refugee/global-issues edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_human_rights_refugee_global_issues_edit_conflicts === 0,
    "expected zero direct-edit conflicts for approved replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.records[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed human-rights/refugee/global-issues registry validation to fail");

  console.log(
    "FRUS human-rights/refugee/global-issues audit test passed: human-rights reports, AIDS/HIV, famine, PL 480, USAID, UNFPA, population, ozone/CFC, status routing, variants, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
