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

const registry = "reports/frus-intelligence-law-enforcement-registry.sample.json";
const units = "reports/frus-intelligence-law-enforcement-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-ile-test-"));

try {
  const validation = run("scripts/validate-frus-intelligence-law-enforcement-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected intelligence/law-enforcement registry validation pass");
  assert(validationReport.summary.records === 15, "expected fifteen intelligence/law-enforcement records");
  assert(validationReport.summary.by_ile_type.counternarcotics === 3, "expected three counternarcotics records");
  assert(validationReport.summary.by_ile_type.source_note_agency_provenance === 2, "expected two source-note provenance records");
  assert(validationReport.summary.by_ile_type.intelligence_community_body === 2, "expected two intelligence-community records");

  const audit = run("scripts/audit-frus-intelligence-law-enforcement-usage.mjs", [
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
  assert(report.summary.units_scanned === 9, "expected nine units scanned");
  assert(report.summary.intelligence_law_enforcement_usages === 15, "expected fifteen registry usages");
  assert(report.summary.by_usage_status.approved === 8, "expected eight approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_intelligence_law_enforcement_context === 6,
    "expected six cross-volume context usages"
  );
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(
    report.summary.unmatched_intelligence_law_enforcement_like_units === 1,
    "expected one unmatched intelligence/law-enforcement-like unit"
  );
  assert(report.summary.by_ile_type.counterterrorism === 1, "expected one counterterrorism usage");
  assert(report.summary.by_ile_type.hostage_hijacking === 1, "expected one hostage/hijacking usage");
  assert(report.summary.by_ile_type.law_enforcement_case === 1, "expected one law-enforcement case usage");
  assert(report.summary.by_ile_type.counternarcotics === 2, "expected two counternarcotics usages");
  assert(
    report.usages.some((usage) => usage.intelligence_law_enforcement_id === "ile-v44p1-d58-cia-ddo-heading-001"),
    "expected CIA DDO heading usage"
  );
  assert(
    report.usages.some((usage) => usage.intelligence_law_enforcement_id === "ile-v24-d175-arrest-warrant-001"),
    "expected arrest warrant law-enforcement usage"
  );
  assert(
    report.usages.some((usage) => usage.intelligence_law_enforcement_id === "ile-v31-d23-counter-narcotics-peru-001"),
    "expected Bush START source-note counternarcotics usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe intelligence/law-enforcement direct edit fixture.",
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
            unit_id: "ile-0007",
            rule_id: "FAS-ILE-001",
            severity: "major",
            category: "intelligence_law_enforcement",
            finding: "Unsafe guessed covert/counternarcotics case status.",
            standard: "Do not invent intelligence or law-enforcement case status.",
            recommended_action: "replace_text",
            original_text: "The draft says CIA, FBI, and DEA jointly reviewed a covert counternarcotics operation.",
            replacement_text: "CIA, FBI, and DEA jointly approved a covert counternarcotics prosecution.",
            comment_text: "",
            evidence_request: "intelligence_law_enforcement_basis",
            verification_target: "target-volume intelligence/law-enforcement registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-intelligence-law-enforcement-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe intelligence/law-enforcement direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_intelligence_law_enforcement_edit_conflicts === 1,
    "expected one intelligence/law-enforcement direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved intelligence/law-enforcement direct edit fixture.",
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
            unit_id: "ile-0004",
            rule_id: "FAS-ILE-002",
            severity: "minor",
            category: "intelligence_law_enforcement",
            finding: "Known target-volume DEA liaison phrase can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "cooperate closely with the DEA",
            replacement_text: "cooperate more closely with DEA",
            comment_text: "",
            evidence_request: "counternarcotics_basis",
            verification_target: "target-volume intelligence/law-enforcement registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-intelligence-law-enforcement-usage.mjs", [
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
  assert(safe.status === 0, "expected registry-approved intelligence/law-enforcement direct edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_intelligence_law_enforcement_edit_conflicts === 0,
    "expected zero direct-edit conflicts for approved replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.records[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-intelligence-law-enforcement-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed intelligence/law-enforcement registry validation to fail");

  console.log(
    "FRUS intelligence/law-enforcement audit test passed: CIA, INR, NIC, sensitive handling, counterterrorism, hijacking/hostage, arrest warrant, Interpol, FBI/DEA liaison, counternarcotics, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
