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

const registry = "reports/frus-economic-financial-registry.sample.json";
const units = "reports/frus-economic-financial-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-economic-financial-test-"));

try {
  const validation = run("scripts/validate-frus-economic-financial-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected economic/financial registry validation pass");
  assert(validationReport.summary.records === 20, "expected twenty economic/financial records");
  assert(validationReport.summary.by_financial_type.imf_quota === 2, "expected two IMF quota records");
  assert(validationReport.summary.by_financial_type.aid_finance_program === 3, "expected three aid-finance records");

  const audit = run("scripts/audit-frus-economic-financial-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v38",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for variants and unmatched fixture");
  assert(report.summary.units_scanned === 9, "expected nine units scanned");
  assert(report.summary.economic_financial_usages === 22, "expected twenty-two approved or variant registry usages");
  assert(report.summary.by_usage_status.approved === 10, "expected ten approved usages");
  assert(report.summary.by_usage_status.variant_needs_review === 12, "expected twelve variant review usages");
  assert(report.summary.unmatched_economic_financial_like_units === 1, "expected one unmatched financial-like unit");
  assert(report.summary.by_financial_type.imf_quota === 2, "expected IMF quota usage count");
  assert(report.summary.by_financial_type.mdb_funding === 2, "expected MDB funding usage count");
  assert(report.summary.by_financial_type.aid_finance_program === 4, "expected aid-finance usage count");
  assert(
    report.usages.some((usage) => usage.economic_financial_id === "economic-financial-v38-imf-us-portion-001"),
    "expected IMF U.S. portion usage"
  );
  assert(
    report.usages.some((usage) => usage.economic_financial_id === "economic-financial-v38-argentina-world-bank-loans-001"),
    "expected Argentina World Bank loan usage"
  );
  assert(
    report.usages.some((usage) => usage.economic_financial_id === "economic-financial-v38-debt-to-grants-001"),
    "expected debt-to-grants usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe economic/financial direct edit fixture.",
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
            unit_id: "economic-financial-0009",
            rule_id: "FAS-ECONOMIC-FINANCIAL-001",
            severity: "major",
            category: "economic_financial_data",
            finding: "Unsafe guessed financial amount.",
            standard: "Do not invent economic or financial figures.",
            recommended_action: "replace_text",
            original_text: "The annotation says the IMF approved a $12.4 billion emergency facility.",
            replacement_text: "The IMF approved a $13 billion emergency facility.",
            comment_text: "",
            evidence_request: "financial_data",
            verification_target: "target-volume economic/financial registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-economic-financial-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v38",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe economic/financial direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_economic_financial_edit_conflicts === 1,
    "expected one economic/financial direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved economic/financial direct edit fixture.",
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
            unit_id: "economic-financial-0006",
            rule_id: "FAS-ECONOMIC-FINANCIAL-002",
            severity: "minor",
            category: "economic_financial_data",
            finding: "Known target-volume World Bank loan phrase can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "$1.25 billion in World Bank loans",
            replacement_text: "Argentina and the World Bank announced agreement on $1.25 billion in new loans",
            comment_text: "",
            evidence_request: "financial_data",
            verification_target: "target-volume economic/financial registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-economic-financial-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v38",
    "--format",
    "json"
  ]);
  assert(safe.status === 0, "expected registry-approved economic/financial direct edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_economic_financial_edit_conflicts === 0,
    "expected zero economic/financial direct-edit conflicts for approved replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.records[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-economic-financial-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed economic/financial registry validation to fail");

  console.log(
    "FRUS economic/financial audit test passed: IMF quotas, GAB, debt metrics, debt-service ratios, MDB funding, IMF/World Bank meetings, Paris Club debt relief, Baker Plan, World Bank loans, arrears, ESF/AID/Eximbank/OPIC program labels, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
