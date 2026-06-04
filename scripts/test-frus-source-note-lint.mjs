#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(args) {
  return spawnSync(process.execPath, ["scripts/lint-frus-source-notes.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8
  });
}

const units = "reports/frus-source-note-units.sample.json";
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-source-note-lint-test-"));

try {
  const base = run(["--units", units, "--format", "json"]);
  if (base.status !== 0) {
    process.stderr.write(base.stdout);
    process.stderr.write(base.stderr);
    process.exit(base.status || 1);
  }
  const baseReport = JSON.parse(base.stdout);
  assert(baseReport.status === "warning", "expected fixture lint warnings");
  assert(baseReport.summary.source_notes_seen === 5, "expected five source notes");
  assert(baseReport.summary.diagnostics_count === 3, "expected three diagnostics");
  assert(baseReport.summary.protected_compact_count === 2, "expected two compact notes protected");
  assert(baseReport.summary.direct_edit_conflicts === 0, "expected zero direct-edit conflicts without output");
  assert(baseReport.summary.diagnostics_by_rule["FAS-SN-002"] === 1, "expected URL-only diagnostic");
  assert(baseReport.summary.diagnostics_by_rule["FAS-SN-005"] === 1, "expected component diagnostic");
  assert(baseReport.summary.diagnostics_by_rule["FAS-CLS-001"] === 1, "expected classification diagnostic");
  assert(baseReport.summary.diagnostics_by_component_role.repository === 1, "expected repository component diagnostic");
  assert(baseReport.summary.diagnostics_by_component_role.source_label === 1, "expected source-label component diagnostic");
  assert(baseReport.summary.diagnostics_by_component_role.classification === 1, "expected classification component diagnostic");

  const safeOutput = path.join(tmpDir, "safe-output.json");
  fs.writeFileSync(
    safeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Safe non-source-note direct edit fixture.",
          blocked_reason: ""
        },
        batch_readiness: {
          readiness_status: "ready_for_tracked_changes",
          safe_to_apply_tracked_changes: true,
          readiness_summary: "Classification wording is handled by classification audit, not source-note component lint.",
          gates: []
        },
        checks: [
          {
            unit_id: "source-note-good-reagan-0001",
            rule_id: "FAS-CLS-002",
            severity: "minor",
            category: "classification_handling",
            finding: "Fixture classification wording edit.",
            standard: "Classification wording direct edits are gated separately.",
            recommended_action: "replace_text",
            original_text: "Secret.",
            replacement_text: "Secret; Nodis.",
            comment_text: "",
            evidence_request: "none",
            verification_target: ""
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const safe = run(["--units", units, "--checker-output", safeOutput, "--format", "json"]);
  if (safe.status !== 0) {
    process.stderr.write(safe.stdout);
    process.stderr.write(safe.stderr);
    process.exit(safe.status || 1);
  }
  const safeReport = JSON.parse(safe.stdout);
  assert(safeReport.summary.direct_edit_conflicts === 0, "expected safe non-source-note edit to pass lint");

  const unsafeOutput = path.join(tmpDir, "unsafe-output.json");
  fs.writeFileSync(
    unsafeOutput,
    `${JSON.stringify(
      {
        schema_version: "checker-output-v1",
        document_assessment: {
          overall_status: "needs_revision",
          summary: "Unsafe source-note direct edit fixture.",
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
            unit_id: "source-note-url-only-0003",
            rule_id: "FAS-SN-002",
            severity: "major",
            category: "source_note",
            finding: "Unsafe invented archival path.",
            standard: "Do not replace a URL-only source note without component evidence.",
            recommended_action: "replace_text",
            original_text: "Source: https://example.invalid/catalog-record. PDF scan, page 4.",
            replacement_text: "Source: Reagan Library, Executive Secretariat, NSC Country File. Secret.",
            comment_text: "",
            evidence_request: "archival_path",
            verification_target: "verified source path"
          },
          {
            unit_id: "source-note-good-reagan-0001",
            rule_id: "FAS-SN-005",
            severity: "major",
            category: "source_note",
            finding: "Unsafe replacement introduces duplicate source label.",
            standard: "Replacement source-note text must itself pass source-note component lint.",
            recommended_action: "replace_text",
            original_text:
              "1  Source: Reagan Library, John Poindexter Files, Subject File, Miscellaneous Meeting Items 1984. Secret. Sent for information.",
            replacement_text:
              "Source: Source: Reagan Library, John Poindexter Files, Subject File, Miscellaneous Meeting Items 1984. Secret. Sent for information.",
            comment_text: "",
            evidence_request: "source_image",
            verification_target: "source note component parser"
          }
        ],
        global_comments: [],
        style_discrepancy_tally: []
      },
      null,
      2
    )}\n`
  );
  const unsafe = run(["--units", units, "--checker-output", unsafeOutput, "--format", "json"]);
  assert(unsafe.status !== 0, "expected unsafe source-note direct edits to fail lint");
  const unsafeReport = JSON.parse(unsafe.stdout);
  assert(unsafeReport.status === "fail", "expected unsafe lint status fail");
  assert(unsafeReport.summary.direct_edit_conflicts === 2, "expected two direct-edit conflicts");
  assert(
    unsafeReport.direct_edit_conflicts.some((conflict) => conflict.conflict_type === "source_note_component_gap"),
    "expected component-gap direct-edit conflict"
  );
  assert(
    unsafeReport.direct_edit_conflicts.some((conflict) => conflict.conflict_type === "replacement_fails_source_note_lint"),
    "expected replacement-lint direct-edit conflict"
  );

  console.log(
    "FRUS source-note lint test passed: component diagnostics, compact-note protection, safe non-source-note edits, and unsafe source-note direct-edit gates work."
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
