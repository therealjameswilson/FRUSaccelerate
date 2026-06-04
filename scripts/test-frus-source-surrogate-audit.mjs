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

const registry = "reports/frus-source-surrogate-registry.sample.json";
const units = "reports/frus-source-surrogate-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-source-surrogate-test-"));

try {
  const validation = run("scripts/validate-frus-source-surrogate-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected source-surrogate registry validation pass");
  assert(validationReport.summary.records === 8, "expected eight source-surrogate records");
  assert(validationReport.summary.by_surrogate_type.nlr_identifier === 1, "expected one NLR record");
  assert(validationReport.summary.by_surrogate_type.no_n_number === 1, "expected one no-N-number record");
  assert(validationReport.summary.by_surrogate_type.w_files_or_profs_context === 1, "expected one W Files/PROFS record");
  assert(
    validationReport.summary.by_surrogate_type.department_state_erecords_copy === 2,
    "expected two Department/eRecords copy-basis records"
  );
  assert(
    validationReport.summary.by_surrogate_type.white_house_situation_room_copy_exception === 1,
    "expected one White House Situation Room copy exception"
  );

  const audit = run("scripts/audit-frus-source-surrogate-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for cross-volume and unmatched source-surrogate fixture");
  assert(report.summary.units_scanned === 10, "expected ten source-surrogate units scanned");
  assert(report.summary.source_surrogate_usages === 13, "expected thirteen source-surrogate usages");
  assert(report.summary.unmatched_source_surrogate_like_units === 2, "expected two unmatched source-surrogate-like units");
  assert(report.summary.source_copy_basis_warnings === 1, "expected one WHSR/NSC source-copy basis warning");
  assert(report.summary.direct_source_surrogate_edit_conflicts === 0, "expected zero direct conflicts without checker output");
  assert(report.summary.by_usage_status.approved === 2, "expected two target-volume approved usages");
  assert(
    report.summary.by_usage_status.cross_volume_source_surrogate_context === 11,
    "expected eleven cross-volume source-surrogate context usages"
  );
  assert(report.summary.by_surrogate_type.nlr_identifier === 1, "expected NLR usage");
  assert(report.summary.by_surrogate_type.no_n_number === 1, "expected no-N-number usage");
  assert(report.summary.by_surrogate_type.department_state_erecords_copy === 7, "expected Department/eRecords usage");
  assert(report.summary.by_surrogate_type.white_house_situation_room_copy_exception === 1, "expected WHSR exception usage");
  assert(report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v01-d227-nlr-source-note"), "expected Document 227 NLR model");
  assert(report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v01-d309-no-n-number-telegram"), "expected Document 309 no-N-number model");
  assert(report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v44p1-sources-w-files"), "expected Reagan NSP W Files model");
  assert(
    report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v44p1-sources-cfpf-cable-traffic"),
    "expected Reagan NSP CFPF cable/reel model"
  );
  assert(
    report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v31-d166-erecords-drafting-model"),
    "expected Bush START I Department/eRecords drafting model"
  );
  assert(
    report.usages.some((usage) => usage.source_surrogate_item_id === "surrogate-v13-d85-whsr-copy-exception"),
    "expected Reagan WHSR copy exception model"
  );
  assert(report.unmatched_units[0].unit_id === "surrogate-0006", "expected unsupported RAC/catalog locator to be unmatched");
  assert(
    report.source_copy_basis_warnings[0].unit_id === "surrogate-0010" &&
      report.source_copy_basis_warnings[0].missing_department_copy_basis &&
      report.source_copy_basis_warnings[0].missing_drafting_metadata,
    "expected unsupported WHSR outgoing Nodis telegram to require Department/eRecords and drafting metadata"
  );

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe source-surrogate fixture.",
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
            unit_id: "surrogate-0006",
            rule_id: "FAS-SUR-001",
            severity: "minor",
            category: "source_surrogate_release",
            finding: "Unsafe invented source-surrogate identifier.",
            standard: "Do not invent RAC, NLR, NARA catalog, scan, or release identifiers.",
            recommended_action: "replace_text",
            original_text: "Source: Candidate locator from RAC scan and NARA catalog URL; needs scan before final source note.",
            replacement_text: "Source: Reagan Library, RAC scan, NLR-999-1-1-1-1.",
            comment_text: "",
            evidence_request: "source_surrogate_basis",
            verification_target: "published source-surrogate registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-source-surrogate-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe source-surrogate direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_source_surrogate_edit_conflicts === 1,
    "expected one source-surrogate direct-edit conflict"
  );

  const unsafeCopyBasisOutput = path.join(tmpDir, "unsafe-copy-basis-output.json");
  fs.writeFileSync(
    unsafeCopyBasisOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe WHSR/NSC source-copy basis fixture.",
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
            unit_id: "surrogate-0010",
            rule_id: "FAS-SUR-003",
            severity: "major",
            category: "source_surrogate_release",
            finding: "Unsafe non-Department telegram copy basis.",
            standard: "Do not finalize WHSR/NSC telegram copy basis without Department/eRecords and drafting metadata support.",
            recommended_action: "replace_text",
            original_text: "Source: WHSR copy of outgoing Nodis telegram 376592; no State copy checked; drafting info TK.",
            replacement_text: "Source: WHSR copy of outgoing Nodis telegram 376592.",
            comment_text: "",
            evidence_request: "communications_metadata",
            verification_target: "Department/eRecords source-copy basis"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafeCopyBasis = run("scripts/audit-frus-source-surrogate-usage.mjs", [
    "--units",
    units,
    "--registry",
    registry,
    "--checker-output",
    unsafeCopyBasisOutput,
    "--target-volume",
    "frus1981-88v01",
    "--format",
    "json"
  ]);
  assert(unsafeCopyBasis.status !== 0, "expected unsafe WHSR/NSC telegram-copy edit to fail");
  const unsafeCopyBasisReport = JSON.parse(unsafeCopyBasis.stdout);
  assert(
    unsafeCopyBasisReport.direct_edit_conflicts.some((conflict) =>
      conflict.finding.includes("White House Situation Room/NSC telegram-copy basis")
    ),
    "expected direct-edit conflict for unsupported WHSR/NSC telegram-copy basis"
  );

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Approved source-surrogate fixture.",
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
            unit_id: "surrogate-0001",
            rule_id: "FAS-SUR-002",
            severity: "minor",
            category: "source_surrogate_release",
            finding: "Known target can be normalized.",
            standard: "Use the published target-volume source-surrogate form.",
            recommended_action: "replace_text",
            original_text: "NLR-170-13-49-17-7",
            replacement_text: "Reagan Library, European and Soviet Affairs Directorate, NSC Records, Subject File, U.S. Foreign Policy; NLR-170-13-49-17-7",
            comment_text: "",
            evidence_request: "source_surrogate_basis",
            verification_target: "published source-surrogate registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run("scripts/audit-frus-source-surrogate-usage.mjs", [
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
    safeReport.summary.direct_source_surrogate_edit_conflicts === 0,
    "expected registry-approved source-surrogate replacement not to be a direct-edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-source-surrogate-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed source-surrogate registry validation to fail");

  console.log(
    "FRUS source-surrogate audit test passed: Reagan Foundations NLR/no-N-number forms, Reagan NSP W Files/PROFS/CFPF cable-reel context, Bush START I Department/eRecords drafting model, Reagan WHSR copy exception, unmatched locator warnings, source-copy basis warnings, and direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
