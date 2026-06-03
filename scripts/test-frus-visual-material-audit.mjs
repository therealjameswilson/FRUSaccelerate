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

const registry = "reports/frus-visual-material-registry.sample.json";
const units = "reports/frus-visual-material-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-visual-material-audit-test-"));

try {
  const validation = run("scripts/validate-frus-visual-material-registry.mjs", ["--registry", registry, "--format", "json"]);
  if (validation.status !== 0) {
    process.stderr.write(validation.stdout);
    process.stderr.write(validation.stderr);
    process.exit(validation.status || 1);
  }
  const validationReport = JSON.parse(validation.stdout);
  assert(validationReport.status === "pass", "expected registry validation pass");
  assert(validationReport.summary.records === 5, "expected five visual material registry records");

  const audit = run("scripts/audit-frus-visual-material-usage.mjs", [
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
  assert(report.status === "warning", "expected warning status for variant, cross-volume examples, and unmatched unit");
  assert(report.summary.units_scanned === 6, "expected six units scanned");
  assert(report.summary.visual_material_usages === 5, "expected five matched visual material usages");
  assert(report.summary.by_usage_status.approved === 1, "expected one approved usage");
  assert(report.summary.by_usage_status.cross_volume_visual_material === 3, "expected three cross-volume usages");
  assert(report.summary.by_usage_status.variant_needs_review === 1, "expected one variant usage");
  assert(report.summary.unmatched_visual_material_like_units === 1, "expected one unmatched visual-material-like unit");
  assert(report.usages.some((usage) => usage.visual_type === "map"), "expected map match");
  assert(report.usages.some((usage) => usage.visual_type === "photograph"), "expected photograph match");
  assert(report.usages.some((usage) => usage.visual_type === "appendix_image"), "expected appendix image match");

  const checkerOutput = path.join(tmpDir, "bad-output.json");
  fs.writeFileSync(
    checkerOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe visual material direct edit fixture.",
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
            unit_id: "visual-material-0001",
            rule_id: "FAS-VIS-001",
            severity: "major",
            category: "visual_material_graphic",
            finding: "Unsafe visual-material status change.",
            standard: "Visual-material direct edits require target-volume visual registry support.",
            recommended_action: "replace_text",
            original_text: "At this point Chairman Gorbachev hands over a map of U.S. bases surrounding the Soviet Union.",
            replacement_text: "The map is printed as Appendix A.",
            comment_text: "",
            evidence_request: "visual_material_basis",
            verification_target: "Target-volume visual material registry"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run("scripts/audit-frus-visual-material-usage.mjs", [
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
  assert(unsafe.status !== 0, "expected unsafe visual material direct edit to fail");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.summary.direct_visual_material_edit_conflicts === 1, "expected one direct visual material edit conflict");

  const malformed = path.join(tmpDir, "malformed-registry.json");
  fs.writeFileSync(malformed, `${JSON.stringify({ schema_version: "wrong", records: [] }, null, 2)}\n`);
  const badValidation = run("scripts/validate-frus-visual-material-registry.mjs", ["--registry", malformed, "--format", "json"]);
  assert(badValidation.status !== 0, "expected malformed registry validation to fail");

  console.log("FRUS visual material audit test passed: registry validation, map, photograph, appendix-image, photograph-exchange, variants, cross-volume warnings, unmatched units, and direct-edit failures work.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
