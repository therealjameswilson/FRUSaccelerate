#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);

function usage() {
  console.error(
    "Usage: node scripts/run-frus-offline-review.mjs --docx <input.docx> --checker-output <checker-output.json> --out <revised.docx> [--artifact-dir DIR] [--audit audit.json] [--existing-ledger ledger.json] [--status-registry registry.json] [--status-claims claims.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--today YYYY-MM-DD] [--max-age-days N] [--review-mode light|normal|exhaustive] [--run-id RUN] [--author NAME] [--date ISO-DATE] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let docxPath = null;
  let checkerOutputPath = null;
  let outPath = null;
  let artifactDir = null;
  let auditPath = null;
  let existingLedgerPath = null;
  let statusRegistryPath = null;
  let statusClaimsPath = null;
  let preparationRouterPath = null;
  let permutationMatrixPath = null;
  let today = new Date().toISOString().slice(0, 10);
  let maxAgeDays = 45;
  let reviewMode = "normal";
  let runId = `frus-review-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let author = "FRUS Annotation Checker";
  let date = new Date().toISOString();
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--docx") {
      docxPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--artifact-dir") {
      artifactDir = argv[index + 1];
      index += 1;
    } else if (arg === "--audit") {
      auditPath = argv[index + 1];
      index += 1;
    } else if (arg === "--existing-ledger") {
      existingLedgerPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-registry") {
      statusRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-claims") {
      statusClaimsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--preparation-router") {
      preparationRouterPath = argv[index + 1];
      index += 1;
    } else if (arg === "--permutation-matrix") {
      permutationMatrixPath = argv[index + 1];
      index += 1;
    } else if (arg === "--today") {
      today = argv[index + 1];
      index += 1;
    } else if (arg === "--max-age-days") {
      maxAgeDays = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--review-mode") {
      reviewMode = argv[index + 1];
      index += 1;
    } else if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
    } else if (arg === "--author") {
      author = argv[index + 1];
      index += 1;
    } else if (arg === "--date") {
      date = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (
    !docxPath ||
    !checkerOutputPath ||
    !outPath ||
    !new Set(["light", "normal", "exhaustive"]).has(reviewMode) ||
    !new Set(["json", "text"]).has(format) ||
    !Number.isInteger(maxAgeDays) ||
    maxAgeDays < 0
  ) {
    usage();
  }
  if (path.resolve(docxPath) === path.resolve(outPath)) {
    throw new Error("--out must differ from --docx");
  }

  const outputBase = path.basename(outPath, path.extname(outPath));
  const outputDir = path.dirname(outPath);
  artifactDir = artifactDir || path.join(outputDir, `${outputBase}-frus-review-artifacts`);
  auditPath = auditPath || path.join(artifactDir, "audit.json");

  return {
    docxPath,
    checkerOutputPath,
    outPath,
    artifactDir,
    auditPath,
    existingLedgerPath,
    statusRegistryPath,
    statusClaimsPath,
    preparationRouterPath,
    permutationMatrixPath,
    today,
    maxAgeDays,
    reviewMode,
    runId,
    author,
    date,
    format
  };
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function trimOutput(value) {
  return String(value || "").trim().split(/\r?\n/).slice(0, 12).join("\n");
}

function runNodeStep({ label, args, cwd, stdoutFile, parseJson = false }) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });
  const step = {
    label,
    command: ["node", ...args].join(" "),
    status: result.status,
    signal: result.signal || "",
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr)
  };
  if (result.error) {
    step.error = result.error.message;
  }
  if (result.error || result.status !== 0) {
    const message = [`${label} failed`];
    if (step.stderr) message.push(step.stderr);
    if (step.stdout) message.push(step.stdout);
    const error = new Error(message.join(": "));
    error.step = step;
    throw error;
  }
  if (stdoutFile) {
    fs.mkdirSync(path.dirname(stdoutFile), { recursive: true });
    fs.writeFileSync(stdoutFile, result.stdout);
    step.stdout_file = normalizePathForOutput(stdoutFile);
  }
  if (parseJson) {
    try {
      step.parsed = JSON.parse(result.stdout);
    } catch (error) {
      throw new Error(`${label}: expected JSON stdout: ${error.message}`);
    }
  }
  return step;
}

function countExpectedRevisions(trackReport) {
  const applied = Array.isArray(trackReport.applied_edits) ? trackReport.applied_edits : [];
  return {
    insertions: applied.filter((item) => item.insertion_id !== null && item.insertion_id !== undefined).length,
    deletions: applied.filter((item) => item.deletion_id !== null && item.deletion_id !== undefined).length
  };
}

function checkerDirectEditCount(checkerOutput) {
  if (!Array.isArray(checkerOutput.checks)) return 0;
  return checkerOutput.checks.filter((check) => DIRECT_ACTIONS.has(check.recommended_action)).length;
}

function buildAudit({ options, artifacts, steps, reports }) {
  const extracted = readJson(artifacts.extracted_units);
  const checkerOutput = readJson(options.checkerOutputPath);
  const evidenceQueue = readJson(artifacts.evidence_queue);
  const discrepancyLedger = readJson(artifacts.discrepancy_ledger);
  const commentReport = reports.comment_application;
  const trackReport = reports.track_change_application;
  const outputValidation = reports.output_validation;
  const sourceNoteLint = reports.source_note_lint;
  const expectedRevisions = countExpectedRevisions(trackReport);

  return {
    schema_version: "frus-offline-review-run-v1",
    status: outputValidation.status === "pass" ? "pass" : "fail",
    run_id: options.runId,
    review_mode: options.reviewMode,
    author: options.author,
    date: options.date,
    source_docx: normalizePathForOutput(options.docxPath),
    checker_output: normalizePathForOutput(options.checkerOutputPath),
    revised_docx: normalizePathForOutput(options.outPath),
    artifacts: Object.fromEntries(
      Object.entries(artifacts)
        .filter(([, value]) => fs.existsSync(value))
        .map(([key, value]) => [key, normalizePathForOutput(value)])
    ),
    counts: {
      extracted_units: extracted.units.length,
      checker_checks: checkerOutput.checks.length,
      checker_direct_edits: checkerDirectEditCount(checkerOutput),
      comments_applied: commentReport.applied_comments.length,
      tracked_edits_applied: trackReport.applied_edits.length,
      insertions_expected: expectedRevisions.insertions,
      deletions_expected: expectedRevisions.deletions,
      source_note_lint_diagnostics: sourceNoteLint?.summary?.diagnostics_count || 0,
      evidence_queue_items: evidenceQueue.queue.length,
      discrepancy_ledger_items: discrepancyLedger.ledger.length
    },
    readiness: {
      document_status: checkerOutput.document_assessment.overall_status,
      readiness_status: checkerOutput.batch_readiness.readiness_status,
      safe_to_apply_tracked_changes: checkerOutput.batch_readiness.safe_to_apply_tracked_changes
    },
    optional_context: {
      status_registry: options.statusRegistryPath ? normalizePathForOutput(options.statusRegistryPath) : "",
      status_claims: options.statusClaimsPath ? normalizePathForOutput(options.statusClaimsPath) : "",
      preparation_router: options.preparationRouterPath ? normalizePathForOutput(options.preparationRouterPath) : "",
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : "",
      today: options.today,
      max_age_days: options.maxAgeDays
    },
    reports,
    steps: steps.map((step) => ({
      label: step.label,
      command: step.command,
      status: step.status,
      stdout_file: step.stdout_file || "",
      stdout: step.stdout,
      stderr: step.stderr
    }))
  };
}

function renderText(audit) {
  return [
    `FRUS offline review passed: ${audit.counts.extracted_units} units, ${audit.counts.comments_applied} Word comments, ${audit.counts.tracked_edits_applied} tracked edits.`,
    `Evidence queue items: ${audit.counts.evidence_queue_items}; discrepancy ledger items: ${audit.counts.discrepancy_ledger_items}; source-note lint diagnostics: ${audit.counts.source_note_lint_diagnostics}.`,
    `Revised DOCX: ${audit.revised_docx}`,
    `Audit: ${audit.artifacts.audit}`
  ].join("\n") + "\n";
}

function runReview(options) {
  const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  fs.mkdirSync(options.artifactDir, { recursive: true });
  const artifacts = {
    extracted_units: path.join(options.artifactDir, "extracted-units.json"),
    evidence_queue: path.join(options.artifactDir, "evidence-queue.json"),
    discrepancy_ledger: path.join(options.artifactDir, "discrepancy-ledger.json"),
    source_note_lint: path.join(options.artifactDir, "source-note-lint.json"),
    pseudo_marker_preflight: path.join(options.artifactDir, "pseudo-marker-preflight.txt"),
    status_registry_validation: path.join(options.artifactDir, "status-registry-validation.json"),
    preparation_router_validation: path.join(options.artifactDir, "preparation-router-validation.json"),
    permutation_matrix_validation: path.join(options.artifactDir, "permutation-matrix-validation.json"),
    status_claims_preflight: path.join(options.artifactDir, "status-claims-preflight.txt"),
    commented_docx: path.join(options.artifactDir, "commented.docx"),
    comment_application_report: path.join(options.artifactDir, "comment-application-report.json"),
    track_change_application_report: path.join(options.artifactDir, "track-change-application-report.json"),
    output_validation: path.join(options.artifactDir, "output-validation.json"),
    audit: options.auditPath
  };
  const steps = [];

  steps.push(
    runNodeStep({
      label: "extract_docx_units",
      args: [
        "scripts/extract-frus-docx-units.mjs",
        "--docx",
        options.docxPath,
        "--out",
        artifacts.extracted_units,
        "--format",
        "text"
      ],
      cwd
    })
  );
  steps.push(
    runNodeStep({
      label: "validate_checker_output",
      args: ["scripts/validate-frus-checker-output.mjs", options.checkerOutputPath],
      cwd
    })
  );
  steps.push(
    runNodeStep({
      label: "preflight_checker_plan",
      args: [
        "scripts/preflight-frus-checker-plan.mjs",
        "--units",
        artifacts.extracted_units,
        "--output",
        options.checkerOutputPath
      ],
      cwd
    })
  );
  const sourceNoteLintStep = runNodeStep({
    label: "lint_source_notes",
    args: [
      "scripts/lint-frus-source-notes.mjs",
      "--units",
      artifacts.extracted_units,
      "--format",
      "json"
    ],
    cwd,
    stdoutFile: artifacts.source_note_lint,
    parseJson: true
  });
  steps.push(sourceNoteLintStep);
  steps.push(
    runNodeStep({
      label: "preflight_pseudo_markers",
      args: [
        "scripts/preflight-frus-pseudo-markers.mjs",
        "--units",
        artifacts.extracted_units,
        "--output",
        options.checkerOutputPath
      ],
      cwd,
      stdoutFile: artifacts.pseudo_marker_preflight
    })
  );

  const optionalReports = {
    source_note_lint: sourceNoteLintStep.parsed
  };
  if (options.statusRegistryPath) {
    const statusArgs = [
      "scripts/validate-frus-status-registry.mjs",
      "--registry",
      options.statusRegistryPath,
      "--today",
      options.today,
      "--max-age-days",
      String(options.maxAgeDays),
      "--format",
      "json"
    ];
    const statusStep = runNodeStep({
      label: "validate_status_registry",
      args: statusArgs,
      cwd,
      stdoutFile: artifacts.status_registry_validation,
      parseJson: true
    });
    steps.push(statusStep);
    optionalReports.status_registry_validation = statusStep.parsed;
  }
  if (options.preparationRouterPath) {
    if (!options.statusRegistryPath) {
      throw new Error("--preparation-router requires --status-registry");
    }
    const routerStep = runNodeStep({
      label: "validate_preparation_router",
      args: [
        "scripts/validate-frus-preparation-router.mjs",
        "--router",
        options.preparationRouterPath,
        "--status-registry",
        options.statusRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.preparation_router_validation,
      parseJson: true
    });
    steps.push(routerStep);
    optionalReports.preparation_router_validation = routerStep.parsed;
  }
  if (options.permutationMatrixPath) {
    const matrixArgs = [
      "scripts/validate-frus-permutation-matrix.mjs",
      "--matrix",
      options.permutationMatrixPath,
      "--schema",
      "reports/frus-annotation-checker-output.schema.json",
      "--format",
      "json"
    ];
    if (options.preparationRouterPath) {
      matrixArgs.push("--router", options.preparationRouterPath);
    }
    const matrixStep = runNodeStep({
      label: "validate_permutation_matrix",
      args: matrixArgs,
      cwd,
      stdoutFile: artifacts.permutation_matrix_validation,
      parseJson: true
    });
    steps.push(matrixStep);
    optionalReports.permutation_matrix_validation = matrixStep.parsed;
  }
  if (options.statusClaimsPath) {
    if (!options.statusRegistryPath) {
      throw new Error("--status-claims requires --status-registry");
    }
    steps.push(
      runNodeStep({
        label: "preflight_status_claims",
        args: [
          "scripts/preflight-frus-status-claims.mjs",
          "--registry",
          options.statusRegistryPath,
          "--claims",
          options.statusClaimsPath,
          "--today",
          options.today,
          "--max-age-days",
          String(options.maxAgeDays)
        ],
        cwd,
        stdoutFile: artifacts.status_claims_preflight
      })
    );
  }
  steps.push(
    runNodeStep({
      label: "build_evidence_queue",
      args: [
        "scripts/build-frus-evidence-queue.mjs",
        "--output",
        options.checkerOutputPath,
        "--review-mode",
        options.reviewMode,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.evidence_queue
    })
  );

  const ledgerArgs = [
    "scripts/build-frus-discrepancy-ledger.mjs",
    "--output",
    options.checkerOutputPath,
    "--run-id",
    options.runId,
    "--format",
    "json"
  ];
  if (options.existingLedgerPath) {
    ledgerArgs.splice(3, 0, "--existing", options.existingLedgerPath);
  }
  steps.push(
    runNodeStep({
      label: "build_discrepancy_ledger",
      args: ledgerArgs,
      cwd,
      stdoutFile: artifacts.discrepancy_ledger
    })
  );

  const commentStep = runNodeStep({
    label: "apply_word_comments",
    args: [
      "scripts/apply-frus-word-comments.mjs",
      "--docx",
      options.docxPath,
      "--units",
      artifacts.extracted_units,
      "--checker-output",
      options.checkerOutputPath,
      "--out",
      artifacts.commented_docx,
      "--author",
      options.author,
      "--date",
      options.date,
      "--format",
      "json"
    ],
    cwd,
    stdoutFile: artifacts.comment_application_report,
    parseJson: true
  });
  steps.push(commentStep);

  const trackStep = runNodeStep({
    label: "apply_tracked_changes",
    args: [
      "scripts/apply-frus-track-changes.mjs",
      "--docx",
      artifacts.commented_docx,
      "--units",
      artifacts.extracted_units,
      "--checker-output",
      options.checkerOutputPath,
      "--out",
      options.outPath,
      "--author",
      options.author,
      "--date",
      options.date,
      "--format",
      "json"
    ],
    cwd,
    stdoutFile: artifacts.track_change_application_report,
    parseJson: true
  });
  steps.push(trackStep);

  const expectedRevisions = countExpectedRevisions(trackStep.parsed);
  const outputValidationStep = runNodeStep({
    label: "validate_docx_output",
    args: [
      "scripts/validate-frus-docx-output.mjs",
      "--docx",
      options.outPath,
      "--author",
      options.author,
      "--expect-comments",
      String(commentStep.parsed.applied_comments.length),
      "--expect-insertions",
      String(expectedRevisions.insertions),
      "--expect-deletions",
      String(expectedRevisions.deletions),
      "--format",
      "json"
    ],
    cwd,
    stdoutFile: artifacts.output_validation,
    parseJson: true
  });
  steps.push(outputValidationStep);

  const reports = {
    ...optionalReports,
    comment_application: commentStep.parsed,
    track_change_application: trackStep.parsed,
    output_validation: outputValidationStep.parsed
  };
  const audit = buildAudit({ options, artifacts, steps, reports });
  writeJson(artifacts.audit, audit);
  return audit;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try {
    const options = parseArgs(process.argv);
    const audit = runReview(options);
    if (options.format === "json") {
      console.log(JSON.stringify(audit, null, 2));
    } else {
      process.stdout.write(renderText(audit));
    }
  } catch (error) {
    if (error.step) {
      console.error(`FRUS offline review failed at ${error.step.label}: ${error.step.stderr || error.step.stdout}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

export { runReview };
