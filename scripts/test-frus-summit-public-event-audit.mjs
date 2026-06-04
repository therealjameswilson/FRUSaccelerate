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

const registry = "reports/frus-summit-public-event-registry.sample.json";
const units = "reports/frus-summit-public-event-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-summit-event-test-"));

try {
  const validation = run("scripts/validate-frus-summit-public-event-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected summit/public-event registry validation pass");
  assert(validationReport.summary.events === 6, "expected six summit/public-event records");
  assert(validationReport.summary.by_event_type.united_nations_address === 2, "expected two UN address records");
  assert(validationReport.summary.by_event_type.signing_ceremony === 1, "expected one signing ceremony record");
  assert(validationReport.summary.by_event_type.news_conference === 1, "expected one news conference record");
  assert(
    validationReport.summary.by_event_family.summit_travel === 1,
    "expected one summit-travel family record"
  );

  const audit = run("scripts/audit-frus-summit-public-event-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for variants, cross-volume context, and unmatched fixture");
  assert(report.summary.units_scanned === 7, "expected seven units scanned");
  assert(report.summary.summit_public_event_usages === 9, "expected nine summit/public-event usages");
  assert(report.summary.by_usage_status.approved === 3, "expected three approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_summit_public_event_context === 4,
    "expected four cross-volume event usages"
  );
  assert(report.summary.by_usage_status.variant_needs_review === 2, "expected two target-volume variant usages");
  assert(report.summary.unmatched_summit_public_event_like_units === 1, "expected one unmatched event-like unit");
  assert(report.summary.by_event_type.signing_ceremony === 2, "expected signing ceremony approved plus variant usage");
  assert(report.summary.by_event_type.news_conference === 2, "expected news conference approved plus variant usage");
  assert(
    report.usages.some((usage) => usage.event_id === "event-v31-d245-start-signing-remarks"),
    "expected START signing event usage"
  );
  assert(
    report.usages.some((usage) => usage.event_id === "event-v01-d33-reagan-cronkite-interview"),
    "expected Reagan Cronkite interview event usage"
  );
  assert(
    report.usages.some((usage) => usage.event_id === "event-v01-d206-reagan-un-general-assembly"),
    "expected Reagan UN General Assembly event usage"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe summit/public-event direct edit fixture.",
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
            unit_id: "summit-event-0007",
            rule_id: "FAS-EVENT-001",
            severity: "major",
            category: "summit_public_event",
            finding: "Unsafe guessed summit event chronology.",
            standard: "Do not invent event date, time, sequence, or public-source basis.",
            recommended_action: "replace_text",
            original_text: "NATO summit press gaggle took place at 9 a.m.",
            replacement_text: "NATO summit press conference began at 8:30 a.m. after the signing ceremony.",
            comment_text: "",
            evidence_request: "event_chronology",
            verification_target: "target-volume summit/public-event registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-summit-public-event-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe summit/public-event direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_summit_public_event_edit_conflicts === 1,
    "expected one summit/public-event direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved summit/public-event direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses target-volume event registry phrase.",
          gates: []
        },
        checks: [
          {
            unit_id: "summit-event-0002",
            rule_id: "FAS-EVENT-002",
            severity: "minor",
            category: "summit_public_event",
            finding: "Known target-volume London event phrase can be restored.",
            standard: "Use the published target-volume form.",
            recommended_action: "replace_text",
            original_text: "London Economic Summit news conference",
            replacement_text: "In an evening news conference at the London Economic Summit on July 17",
            comment_text: "",
            evidence_request: "event_chronology",
            verification_target: "target-volume summit/public-event registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-summit-public-event-usage.mjs", [
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
  assert(safe.status === 0, "expected registry-approved summit/public-event edit not to fail");
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_summit_public_event_edit_conflicts === 0,
    "expected zero direct-edit conflicts for approved event replacement"
  );

  const badRegistry = path.join(tmpDir, "bad-registry.json");
  const bad = JSON.parse(fs.readFileSync(registry, "utf8"));
  bad.events[0].variant_forms = "not-an-array";
  fs.writeFileSync(badRegistry, `${JSON.stringify(bad, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-summit-public-event-registry.mjs", [
    "--registry",
    badRegistry,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed summit/public-event registry validation to fail");

  console.log(
    "FRUS summit/public-event audit test passed: Moscow START signing, London Economic Summit news conference, Moscow summit working sequence, Reagan UN addresses, Cronkite interview, variants, unmatched warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
