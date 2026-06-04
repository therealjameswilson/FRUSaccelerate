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

const registry = "reports/frus-military-crisis-registry.sample.json";
const units = "reports/frus-military-crisis-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-military-crisis-test-"));

try {
  const validation = run("scripts/validate-frus-military-crisis-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected military/crisis registry validation pass");
  assert(validationReport.summary.records === 16, "expected sixteen military/crisis records");
  assert(validationReport.summary.by_military_type.naval_exercise === 2, "expected two naval exercise records");
  assert(validationReport.summary.by_military_type.chemical_weapons_crisis === 2, "expected two CW crisis records");
  assert(validationReport.summary.by_military_type.force_presence === 2, "expected two force-presence records");

  const audit = run("scripts/audit-frus-military-crisis-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v24",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for variants, cross-volume context, and unmatched fixture");
  assert(report.summary.units_scanned === 7, "expected seven units scanned");
  assert(report.summary.military_crisis_usages === 16, "expected sixteen registry usages");
  assert(report.summary.by_usage_status.approved === 12, "expected twelve approved usages");
  assert(report.summary.by_usage_status.variant_needs_review === 2, "expected two variant usages");
  assert(report.summary.by_usage_status.cross_volume_military_crisis_context === 2, "expected two cross-volume context usages");
  assert(report.summary.unmatched_military_crisis_like_units === 1, "expected one unmatched military/crisis-like unit");
  assert(report.summary.by_military_type.security_assistance === 2, "expected two security-assistance usages");
  assert(report.summary.by_military_type.freedom_of_navigation === 2, "expected two freedom-of-navigation usages");
  assert(report.summary.by_military_type.chemical_weapons_crisis === 2, "expected two CW crisis usages");
  assert(
    report.usages.some((usage) => usage.military_crisis_id === "military-crisis-v24-stairstep-gulf-sidra-001"),
    "expected Stairstep/Gulf of Sidra usage"
  );
  assert(
    report.usages.some((usage) => usage.military_crisis_id === "military-crisis-v24-tomcat-shootdown-001"),
    "expected F-14/SU-22 shootdown usage"
  );
  assert(
    report.usages.some((usage) => usage.military_crisis_id === "military-crisis-v01-gulf-force-presence-001"),
    "expected cross-volume Persian Gulf force-presence usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe military/crisis direct edit fixture.",
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
            unit_id: "military-crisis-0007",
            rule_id: "FAS-MILITARY-CRISIS-001",
            severity: "major",
            category: "military_crisis_operations",
            finding: "Unsafe guessed operation label.",
            standard: "Do not invent operation or force-deployment language.",
            recommended_action: "replace_text",
            original_text: "The draft says the rules of engagement for Operation Desert Shield changed.",
            replacement_text: "The rules of engagement for Operation Desert Storm changed.",
            comment_text: "",
            evidence_request: "military_crisis_basis",
            verification_target: "target-volume military/crisis registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-military-crisis-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v24",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe military/crisis direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_military_crisis_edit_conflicts === 1,
    "expected one military/crisis direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved military/crisis direct edit fixture.",
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
            unit_id: "military-crisis-0002",
            rule_id: "FAS-MILITARY-CRISIS-002",
            severity: "minor",
            category: "military_crisis_operations",
            finding: "Known target-volume exercise phrase can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "joint U.S./Moroccan military exercises",
            replacement_text: "joint US/Moroccan military exercises",
            comment_text: "",
            evidence_request: "military_crisis_basis",
            verification_target: "target-volume military/crisis registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-military-crisis-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v24",
    "--format",
    "json"
  ]);
  assert(safe.status === 0, "expected registry-approved military/crisis direct edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_military_crisis_edit_conflicts === 0,
    "expected zero military/crisis direct-edit conflicts for approved replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.records[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-military-crisis-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed military/crisis registry validation to fail");

  console.log(
    "FRUS military/crisis audit test passed: Gulf of Sidra, Stairstep, F-14/SU-22 shootdown, security assistance, Sixth Fleet, FMS/IMET, Libya/Tunisia contingency support, Rabta/CW, Persian Gulf force presence, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
