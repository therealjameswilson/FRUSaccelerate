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

const registry = "reports/frus-footnote-referback-registry.sample.json";
const units = "reports/frus-footnote-referback-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-footnote-referback-test-"));

try {
  const validation = run("scripts/validate-frus-footnote-referback-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected footnote refer-back registry validation pass");
  assert(validationReport.summary.records === 8, "expected eight footnote refer-back records");
  assert(validationReport.summary.repeat_threshold === 3, "expected three-times refer-back threshold");

  const audit = run("scripts/audit-frus-footnote-referback-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  if (audit.status !== 0) {
    process.stderr.write(audit.stdout);
    process.stderr.write(audit.stderr);
    process.exit(audit.status || 1);
  }
  const report = JSON.parse(audit.stdout);
  assert(report.status === "warning", "expected warning status for malformed refer-back fixture");
  assert(report.summary.units_scanned === 15, "expected fifteen units scanned");
  assert(report.summary.approved_referback_usages === 6, "expected six approved refer-back matches");
  assert(report.summary.malformed_referbacks === 5, "expected five malformed refer-backs");
  assert(report.summary.overlong_referback_clusters === 1, "expected one overlong refer-back cluster");
  assert(report.summary.repeated_citation_thresholds === 1, "expected repeated citation threshold");
  assert(report.summary.repeated_citation_review_units === 2, "expected third-and-later repeat review units");
  assert(report.summary.repeat_threshold === 3, "expected audit to use registry repeat threshold");
  assert(report.summary.by_referback_type.multi_target_footnote_cluster === 2, "expected two approved multi-target clusters");
  assert(report.summary.by_referback_type.same_document_local_context === 1, "expected same-document local-context match");
  assert(report.summary.by_diagnostic_type.missing_comma_before_document === 1, "expected missing comma diagnostic");
  assert(report.summary.by_diagnostic_type.lowercase_document_target === 1, "expected lowercase Document diagnostic");
  assert(report.summary.by_diagnostic_type.missing_thereto === 1, "expected missing thereto diagnostic");
  assert(report.summary.by_diagnostic_type.bare_footnote_without_context === 2, "expected two bare-footnote diagnostics");
  assert(
    report.approved_matches.some((match) => match.referback_id === "referback-v01-d146-fn14-three-targets"),
    "expected Reagan Foundations three-target refer-back model"
  );
  assert(
    report.approved_matches.some((match) => match.referback_id === "referback-v01-d217-fn10-local-context"),
    "expected same-document local-context model not to be flagged"
  );
  assert(
    report.repeated_citation_thresholds[0].occurrence_count === 4,
    "expected third and later repeated citations to trigger refer-back reminder"
  );
  assert(
    report.repeated_citation_thresholds[0].trigger_unit.unit_id === "referback-0014",
    "expected third repeated citation unit to be the trigger unit"
  );
  assert(
    report.repeated_citation_thresholds[0].allowed_full_citation_units.length === 2,
    "expected first two repeated citations to be allowed full-citation units"
  );
  assert(
    report.repeated_citation_thresholds[0].review_units.map((unit) => unit.unit_id).join(",") ===
      "referback-0014,referback-0015",
    "expected third and fourth repeated citations to be review units"
  );
  assert(
    report.repeated_citation_thresholds[0].review_units[0].threshold_status === "first_referback_review_trigger",
    "expected third occurrence to be marked as first review trigger"
  );
  assert(
    report.repeated_citation_thresholds[0].review_units[1].threshold_status === "later_referback_review_trigger",
    "expected fourth occurrence to be marked as later review trigger"
  );
  assert(
    report.repeated_citation_thresholds[0].required_action.includes("third full repeat itself and every later full repeat"),
    "expected registry threshold action in repeated-citation warning"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe direct edit fixture.",
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
            unit_id: "referback-0007",
            rule_id: "FAS-FOOTNOTE-001",
            severity: "minor",
            category: "cross_reference",
            finding: "Unsafe guessed footnote target.",
            standard: "Do not invent footnote refer-back targets.",
            recommended_action: "replace_text",
            original_text: "See footnote 9 Document 56.",
            replacement_text: "See footnote 9, Document 57.",
            comment_text: "",
            evidence_request: "cross_reference",
            verification_target: "published target footnote"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-footnote-referback-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeOutput,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  assert(unsafe.status !== 0, "expected unsafe refer-back direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_footnote_referback_edit_conflicts === 1,
    "expected one footnote refer-back direct-edit conflict"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Fixture uses a registry-published replacement.",
          gates: []
        },
        checks: [
          {
            unit_id: "referback-0007",
            rule_id: "FAS-FOOTNOTE-002",
            severity: "minor",
            category: "cross_reference",
            finding: "Known target can be normalized.",
            standard: "Use the published target form.",
            recommended_action: "replace_text",
            original_text: "See footnote 9 Document 56.",
            replacement_text: "See footnote 9, Document 56 and footnote 4, Document 69",
            comment_text: "",
            evidence_request: "cross_reference",
            verification_target: "published target footnote"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-footnote-referback-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    safeOutput,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  if (safe.status !== 0) {
    process.stderr.write(safe.stdout);
    process.stderr.write(safe.stderr);
    process.exit(safe.status || 1);
  }
  const safeReport = JSON.parse(safe.stdout);
  assert(
    safeReport.summary.direct_footnote_referback_edit_conflicts === 0,
    "expected registry-approved replacement not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-footnote-referback-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed footnote refer-back registry validation to fail");

  console.log(
    "FRUS footnote refer-back audit test passed: Reagan Foundations cross-document, thereto, same-document local-context, above, three-target cluster, malformed forms, repeated-citation threshold, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
