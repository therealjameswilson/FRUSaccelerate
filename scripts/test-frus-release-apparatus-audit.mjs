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

const registry = "reports/frus-release-apparatus-registry.sample.json";
const units = "reports/frus-release-apparatus-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-release-apparatus-audit-test-"));

try {
  const validation = run("scripts/validate-frus-release-apparatus-registry.mjs", [
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
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 8, "expected eight release-apparatus registry records");

  const audit = run("scripts/audit-frus-release-apparatus-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for variants, cross-volume examples, and unmatched unit");
  assert(report.summary.units_scanned === 8, "expected eight units scanned");
  assert(report.summary.release_apparatus_usages === 7, "expected seven matched release-apparatus usages");
  assert(report.summary.by_usage_status.approved === 3, "expected three approved target-volume usages");
  assert(report.summary.by_usage_status.cross_volume_release_apparatus === 3, "expected three cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_release_apparatus_like_units === 1, "expected one unmatched release-apparatus-like unit");
  assert(
    report.usages.some((usage) => usage.release_item_type === "status_page_publication"),
    "expected status-page publication match"
  );
  assert(
    report.usages.some((usage) => usage.release_item_type === "ebook_catalog_entry"),
    "expected ebook catalog match"
  );
  assert(
    report.usages.some((usage) => usage.release_item_type === "errata_correction"),
    "expected errata correction match"
  );
  assert(
    report.usages.some(
      (usage) =>
        usage.volume_id === "frus1989-92v31" &&
        usage.release_date === "2025-09-30" &&
        usage.ebook_last_updated === ""
    ),
    "expected Bush START I release date to remain distinct from ebook update date"
  );
  assert(
    report.usages.some(
      (usage) =>
        usage.volume_id === "frus1989-92v31" &&
        usage.ebook_last_updated === "2025-09-28" &&
        usage.release_date === ""
    ),
    "expected Bush START I ebook update date to remain distinct from release date"
  );

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe release-apparatus direct edit fixture.",
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
            unit_id: "release-0003",
            rule_id: "FAS-REL-001",
            severity: "major",
            category: "release_errata_apparatus",
            finding: "Unsafe ebook update date conversion.",
            standard: "Release and ebook update dates require separate registry support.",
            recommended_action: "replace_text",
            original_text: "Ebook last updated: September 28, 2025.",
            replacement_text: "Published September 28, 2025.",
            comment_text: "",
            evidence_request: "release_apparatus_basis",
            verification_target: "Target-volume release apparatus registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-release-apparatus-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe release-apparatus direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(
    unsafeReport.summary.direct_release_apparatus_edit_conflicts === 1,
    "expected one direct release-apparatus edit conflict"
  );

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-release-apparatus-registry.mjs", [
    "--registry",
    malformed,
    "--format",
    "json"
  ]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log(
    "FRUS release-apparatus audit test passed: registry validation, status-page publication dates, volume downloads, ebook update dates, errata, GPO/ISBN/S/N, variants, cross-volume warnings, unmatched units, and direct-edit failures work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
