#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);

function usage() {
  console.error(
    "Usage: node scripts/run-frus-offline-review.mjs --docx <input.docx> --checker-output <checker-output.json> --out <revised.docx> [--artifact-dir DIR] [--audit audit.json] [--existing-ledger ledger.json] [--annotation-sheet-profile profile.json] [--status-registry registry.json] [--status-claims claims.json] [--authority-registry registry.json] [--source-list-registry registry.json] [--document-metadata-registry registry.json] [--classification-registry registry.json] [--declassification-registry registry.json] [--translation-registry registry.json] [--printed-attachment-registry registry.json] [--visual-material-registry registry.json] [--document-handling-registry registry.json] [--chronology-registry registry.json] [--time-zone-registry registry.json] [--selection-balance-registry registry.json] [--decision-process-registry registry.json] [--public-source-registry registry.json] [--retrospective-account-registry registry.json] [--treaty-registry registry.json] [--foreign-org-registry registry.json] [--footnote-referback-registry registry.json] [--recurring-risk-registry registry.json] [--negative-search-registry registry.json] [--document-relationship-registry registry.json] [--communications-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--today YYYY-MM-DD] [--max-age-days N] [--review-mode light|normal|exhaustive] [--run-id RUN] [--author NAME] [--date ISO-DATE] [--format json|text]"
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
  let annotationSheetProfilePath = null;
  let statusRegistryPath = null;
  let statusClaimsPath = null;
  let authorityRegistryPath = null;
  let sourceListRegistryPath = null;
  let documentMetadataRegistryPath = null;
  let classificationRegistryPath = null;
  let declassificationRegistryPath = null;
  let translationRegistryPath = null;
  let printedAttachmentRegistryPath = null;
  let visualMaterialRegistryPath = null;
  let documentHandlingRegistryPath = null;
  let chronologyRegistryPath = null;
  let timeZoneRegistryPath = null;
  let selectionBalanceRegistryPath = null;
  let decisionProcessRegistryPath = null;
  let publicSourceRegistryPath = null;
  let retrospectiveAccountRegistryPath = null;
  let treatyRegistryPath = null;
  let foreignOrgRegistryPath = null;
  let footnoteReferbackRegistryPath = null;
  let recurringRiskRegistryPath = null;
  let negativeSearchRegistryPath = null;
  let documentRelationshipRegistryPath = null;
  let communicationsRegistryPath = null;
  let preparationRouterPath = null;
  let permutationMatrixPath = null;
  let targetVolume = "";
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
    } else if (arg === "--annotation-sheet-profile") {
      annotationSheetProfilePath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-registry") {
      statusRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--status-claims") {
      statusClaimsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--authority-registry") {
      authorityRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--source-list-registry") {
      sourceListRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--document-metadata-registry") {
      documentMetadataRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--classification-registry") {
      classificationRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--declassification-registry") {
      declassificationRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--translation-registry") {
      translationRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--printed-attachment-registry") {
      printedAttachmentRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--visual-material-registry") {
      visualMaterialRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--document-handling-registry") {
      documentHandlingRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--chronology-registry") {
      chronologyRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--time-zone-registry") {
      timeZoneRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--selection-balance-registry") {
      selectionBalanceRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--decision-process-registry") {
      decisionProcessRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--public-source-registry") {
      publicSourceRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--retrospective-account-registry") {
      retrospectiveAccountRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--treaty-registry") {
      treatyRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--foreign-org-registry") {
      foreignOrgRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--footnote-referback-registry") {
      footnoteReferbackRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--recurring-risk-registry") {
      recurringRiskRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--negative-search-registry") {
      negativeSearchRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--document-relationship-registry") {
      documentRelationshipRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--communications-registry") {
      communicationsRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--preparation-router") {
      preparationRouterPath = argv[index + 1];
      index += 1;
    } else if (arg === "--permutation-matrix") {
      permutationMatrixPath = argv[index + 1];
      index += 1;
    } else if (arg === "--target-volume") {
      targetVolume = argv[index + 1];
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
    annotationSheetProfilePath,
    statusRegistryPath,
    statusClaimsPath,
    authorityRegistryPath,
    sourceListRegistryPath,
    documentMetadataRegistryPath,
    classificationRegistryPath,
    declassificationRegistryPath,
    translationRegistryPath,
    printedAttachmentRegistryPath,
    visualMaterialRegistryPath,
    documentHandlingRegistryPath,
    chronologyRegistryPath,
    timeZoneRegistryPath,
    selectionBalanceRegistryPath,
    decisionProcessRegistryPath,
    publicSourceRegistryPath,
    retrospectiveAccountRegistryPath,
    treatyRegistryPath,
    foreignOrgRegistryPath,
    footnoteReferbackRegistryPath,
    recurringRiskRegistryPath,
    negativeSearchRegistryPath,
    documentRelationshipRegistryPath,
    communicationsRegistryPath,
    preparationRouterPath,
    permutationMatrixPath,
    targetVolume,
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
  const coverageAudit = reports.review_coverage;
  const statusClaimsPath = options.statusClaimsPath || (fs.existsSync(artifacts.status_claims) ? artifacts.status_claims : "");
  const statusClaims = statusClaimsPath ? readJson(statusClaimsPath) : null;
  const authorityAudit = reports.authority_usage_audit || null;
  const sourceListAudit = reports.source_list_usage_audit || null;
  const documentMetadataAudit = reports.document_metadata_usage_audit || null;
  const classificationAudit = reports.classification_usage_audit || null;
  const declassificationAudit = reports.declassification_usage_audit || null;
  const translationAudit = reports.translation_usage_audit || null;
  const printedAttachmentAudit = reports.printed_attachment_usage_audit || null;
  const visualMaterialAudit = reports.visual_material_usage_audit || null;
  const documentHandlingAudit = reports.document_handling_usage_audit || null;
  const chronologyAudit = reports.chronology_usage_audit || null;
  const timeZoneAudit = reports.time_zone_usage_audit || null;
  const selectionBalanceAudit = reports.selection_balance_usage_audit || null;
  const decisionProcessAudit = reports.decision_process_usage_audit || null;
  const publicSourceAudit = reports.public_source_usage_audit || null;
  const retrospectiveAccountAudit = reports.retrospective_account_usage_audit || null;
  const treatyAudit = reports.treaty_usage_audit || null;
  const foreignOrgAudit = reports.foreign_org_usage_audit || null;
  const footnoteReferbackAudit = reports.footnote_referback_usage_audit || null;
  const recurringRiskAudit = reports.recurring_risk_usage_audit || null;
  const negativeSearchAudit = reports.negative_search_usage_audit || null;
  const documentRelationshipAudit = reports.document_relationship_usage_audit || null;
  const communicationsAudit = reports.communications_usage_audit || null;
  const annotationSheetProfileAudit = reports.annotation_sheet_profile_audit || null;
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
      status_claims_extracted: Array.isArray(statusClaims?.claims) ? statusClaims.claims.length : 0,
      authority_registry_usages: authorityAudit?.summary?.authority_usages || 0,
      authority_registry_warnings: authorityAudit?.summary?.warnings || 0,
      authority_direct_edit_conflicts: authorityAudit?.summary?.direct_authority_edit_conflicts || 0,
      source_list_registry_usages: sourceListAudit?.summary?.source_list_usages || 0,
      source_list_registry_warnings: sourceListAudit?.summary?.warnings || 0,
      source_list_direct_edit_conflicts: sourceListAudit?.summary?.direct_source_list_edit_conflicts || 0,
      document_metadata_registry_usages: documentMetadataAudit?.summary?.document_metadata_usages || 0,
      document_metadata_registry_warnings: documentMetadataAudit?.summary?.warnings || 0,
      document_metadata_direct_edit_conflicts: documentMetadataAudit?.summary?.direct_document_metadata_edit_conflicts || 0,
      classification_registry_usages: classificationAudit?.summary?.classification_usages || 0,
      classification_registry_warnings: classificationAudit?.summary?.warnings || 0,
      classification_release_status_confusions: classificationAudit?.summary?.release_status_confusions || 0,
      classification_direct_edit_conflicts: classificationAudit?.summary?.direct_classification_edit_conflicts || 0,
      declassification_registry_usages: declassificationAudit?.summary?.declassification_usages || 0,
      declassification_registry_warnings: declassificationAudit?.summary?.warnings || 0,
      declassification_direct_edit_conflicts:
        declassificationAudit?.summary?.direct_declassification_edit_conflicts || 0,
      translation_registry_usages: translationAudit?.summary?.translation_usages || 0,
      translation_registry_warnings: translationAudit?.summary?.warnings || 0,
      translation_direct_edit_conflicts: translationAudit?.summary?.direct_translation_edit_conflicts || 0,
      printed_attachment_registry_usages: printedAttachmentAudit?.summary?.printed_attachment_usages || 0,
      printed_attachment_registry_warnings: printedAttachmentAudit?.summary?.warnings || 0,
      printed_attachment_direct_edit_conflicts:
        printedAttachmentAudit?.summary?.direct_printed_attachment_edit_conflicts || 0,
      visual_material_registry_usages: visualMaterialAudit?.summary?.visual_material_usages || 0,
      visual_material_registry_warnings: visualMaterialAudit?.summary?.warnings || 0,
      visual_material_direct_edit_conflicts: visualMaterialAudit?.summary?.direct_visual_material_edit_conflicts || 0,
      document_handling_registry_usages: documentHandlingAudit?.summary?.document_handling_usages || 0,
      document_handling_registry_warnings: documentHandlingAudit?.summary?.warnings || 0,
      document_handling_direct_edit_conflicts:
        documentHandlingAudit?.summary?.direct_document_handling_edit_conflicts || 0,
      chronology_registry_usages: chronologyAudit?.summary?.chronology_usages || 0,
      chronology_registry_warnings: chronologyAudit?.summary?.warnings || 0,
      chronology_direct_edit_conflicts: chronologyAudit?.summary?.direct_chronology_edit_conflicts || 0,
      time_zone_registry_usages: timeZoneAudit?.summary?.time_zone_usages || 0,
      time_zone_registry_warnings: timeZoneAudit?.summary?.warnings || 0,
      time_zone_unmatched_like_units: timeZoneAudit?.summary?.unmatched_time_zone_like_units || 0,
      time_zone_direct_edit_conflicts: timeZoneAudit?.summary?.direct_time_zone_edit_conflicts || 0,
      selection_balance_registry_usages: selectionBalanceAudit?.summary?.selection_usages || 0,
      selection_balance_registry_warnings: selectionBalanceAudit?.summary?.warnings || 0,
      selection_balance_unmatched_like_units: selectionBalanceAudit?.summary?.unmatched_selection_like_units || 0,
      selection_balance_direct_edit_conflicts:
        selectionBalanceAudit?.summary?.direct_selection_edit_conflicts || 0,
      decision_process_registry_usages: decisionProcessAudit?.summary?.decision_process_usages || 0,
      decision_process_registry_warnings: decisionProcessAudit?.summary?.warnings || 0,
      decision_process_unmatched_like_units:
        decisionProcessAudit?.summary?.unmatched_decision_process_like_units || 0,
      decision_process_direct_edit_conflicts:
        decisionProcessAudit?.summary?.direct_decision_process_edit_conflicts || 0,
      public_source_registry_usages: publicSourceAudit?.summary?.public_source_usages || 0,
      public_source_registry_warnings: publicSourceAudit?.summary?.warnings || 0,
      public_source_direct_edit_conflicts: publicSourceAudit?.summary?.direct_public_source_edit_conflicts || 0,
      retrospective_account_registry_usages: retrospectiveAccountAudit?.summary?.retrospective_account_usages || 0,
      retrospective_account_registry_warnings: retrospectiveAccountAudit?.summary?.warnings || 0,
      retrospective_account_unmatched_like_units:
        retrospectiveAccountAudit?.summary?.unmatched_retrospective_like_units || 0,
      retrospective_account_direct_edit_conflicts:
        retrospectiveAccountAudit?.summary?.direct_retrospective_account_edit_conflicts || 0,
      treaty_registry_usages: treatyAudit?.summary?.treaty_usages || 0,
      treaty_registry_warnings: treatyAudit?.summary?.warnings || 0,
      treaty_direct_edit_conflicts: treatyAudit?.summary?.direct_treaty_edit_conflicts || 0,
      foreign_org_registry_usages: foreignOrgAudit?.summary?.foreign_org_usages || 0,
      foreign_org_registry_warnings: foreignOrgAudit?.summary?.warnings || 0,
      foreign_org_direct_edit_conflicts: foreignOrgAudit?.summary?.direct_foreign_org_edit_conflicts || 0,
      footnote_referback_approved_usages: footnoteReferbackAudit?.summary?.approved_referback_usages || 0,
      footnote_referback_malformed: footnoteReferbackAudit?.summary?.malformed_referbacks || 0,
      footnote_referback_repeated_citation_thresholds:
        footnoteReferbackAudit?.summary?.repeated_citation_thresholds || 0,
      footnote_referback_direct_edit_conflicts:
        footnoteReferbackAudit?.summary?.direct_footnote_referback_edit_conflicts || 0,
      recurring_risk_matches: recurringRiskAudit?.summary?.risk_matches || 0,
      recurring_risk_direct_edit_conflicts:
        recurringRiskAudit?.summary?.direct_recurring_risk_edit_conflicts || 0,
      negative_search_registry_usages: negativeSearchAudit?.summary?.negative_search_usages || 0,
      negative_search_registry_warnings: negativeSearchAudit?.summary?.warnings || 0,
      negative_search_direct_edit_conflicts: negativeSearchAudit?.summary?.direct_negative_search_edit_conflicts || 0,
      document_relationship_registry_usages: documentRelationshipAudit?.summary?.document_relationship_usages || 0,
      document_relationship_registry_warnings: documentRelationshipAudit?.summary?.warnings || 0,
      document_relationship_direct_edit_conflicts:
        documentRelationshipAudit?.summary?.direct_document_relationship_edit_conflicts || 0,
      communications_registry_usages: communicationsAudit?.summary?.communications_usages || 0,
      communications_registry_warnings: communicationsAudit?.summary?.warnings || 0,
      communications_direct_edit_conflicts: communicationsAudit?.summary?.direct_communications_edit_conflicts || 0,
      annotation_sheet_profile_lexical_misclassifications:
        annotationSheetProfileAudit?.summary?.lexical_misclassifications || 0,
      annotation_sheet_profile_unexpected_angle_tokens:
        annotationSheetProfileAudit?.summary?.unexpected_angle_tokens || 0,
      annotation_sheet_profile_direct_edit_marker_conflicts:
        annotationSheetProfileAudit?.summary?.direct_edit_marker_conflicts || 0,
      review_coverage_unreviewed_units: coverageAudit?.summary?.unreviewed_units || 0,
      review_coverage_signal_gaps: coverageAudit?.summary?.signal_category_gaps || 0,
      evidence_queue_items: evidenceQueue.queue.length,
      discrepancy_ledger_items: discrepancyLedger.ledger.length
    },
    readiness: {
      document_status: checkerOutput.document_assessment.overall_status,
      readiness_status: checkerOutput.batch_readiness.readiness_status,
      safe_to_apply_tracked_changes: checkerOutput.batch_readiness.safe_to_apply_tracked_changes
    },
    optional_context: {
      annotation_sheet_profile: options.annotationSheetProfilePath ? normalizePathForOutput(options.annotationSheetProfilePath) : "",
      status_registry: options.statusRegistryPath ? normalizePathForOutput(options.statusRegistryPath) : "",
      status_claims: statusClaimsPath ? normalizePathForOutput(statusClaimsPath) : "",
      authority_registry: options.authorityRegistryPath ? normalizePathForOutput(options.authorityRegistryPath) : "",
      source_list_registry: options.sourceListRegistryPath ? normalizePathForOutput(options.sourceListRegistryPath) : "",
      document_metadata_registry: options.documentMetadataRegistryPath ? normalizePathForOutput(options.documentMetadataRegistryPath) : "",
      classification_registry: options.classificationRegistryPath ? normalizePathForOutput(options.classificationRegistryPath) : "",
      declassification_registry: options.declassificationRegistryPath ? normalizePathForOutput(options.declassificationRegistryPath) : "",
      translation_registry: options.translationRegistryPath ? normalizePathForOutput(options.translationRegistryPath) : "",
      printed_attachment_registry: options.printedAttachmentRegistryPath ? normalizePathForOutput(options.printedAttachmentRegistryPath) : "",
      visual_material_registry: options.visualMaterialRegistryPath ? normalizePathForOutput(options.visualMaterialRegistryPath) : "",
      document_handling_registry: options.documentHandlingRegistryPath ? normalizePathForOutput(options.documentHandlingRegistryPath) : "",
      chronology_registry: options.chronologyRegistryPath ? normalizePathForOutput(options.chronologyRegistryPath) : "",
      time_zone_registry: options.timeZoneRegistryPath ? normalizePathForOutput(options.timeZoneRegistryPath) : "",
      selection_balance_registry: options.selectionBalanceRegistryPath
        ? normalizePathForOutput(options.selectionBalanceRegistryPath)
        : "",
      decision_process_registry: options.decisionProcessRegistryPath
        ? normalizePathForOutput(options.decisionProcessRegistryPath)
        : "",
      public_source_registry: options.publicSourceRegistryPath ? normalizePathForOutput(options.publicSourceRegistryPath) : "",
      retrospective_account_registry: options.retrospectiveAccountRegistryPath
        ? normalizePathForOutput(options.retrospectiveAccountRegistryPath)
        : "",
      treaty_registry: options.treatyRegistryPath ? normalizePathForOutput(options.treatyRegistryPath) : "",
      foreign_org_registry: options.foreignOrgRegistryPath ? normalizePathForOutput(options.foreignOrgRegistryPath) : "",
      footnote_referback_registry: options.footnoteReferbackRegistryPath
        ? normalizePathForOutput(options.footnoteReferbackRegistryPath)
        : "",
      recurring_risk_registry: options.recurringRiskRegistryPath ? normalizePathForOutput(options.recurringRiskRegistryPath) : "",
      negative_search_registry: options.negativeSearchRegistryPath ? normalizePathForOutput(options.negativeSearchRegistryPath) : "",
      document_relationship_registry: options.documentRelationshipRegistryPath ? normalizePathForOutput(options.documentRelationshipRegistryPath) : "",
      communications_registry: options.communicationsRegistryPath ? normalizePathForOutput(options.communicationsRegistryPath) : "",
      preparation_router: options.preparationRouterPath ? normalizePathForOutput(options.preparationRouterPath) : "",
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : "",
      target_volume: options.targetVolume,
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
    `Evidence queue items: ${audit.counts.evidence_queue_items}; discrepancy ledger items: ${audit.counts.discrepancy_ledger_items}; source-note lint diagnostics: ${audit.counts.source_note_lint_diagnostics}; status claims: ${audit.counts.status_claims_extracted}; authority usages: ${audit.counts.authority_registry_usages}; authority warnings: ${audit.counts.authority_registry_warnings}; source-list usages: ${audit.counts.source_list_registry_usages}; source-list warnings: ${audit.counts.source_list_registry_warnings}; document-metadata usages: ${audit.counts.document_metadata_registry_usages}; document-metadata warnings: ${audit.counts.document_metadata_registry_warnings}; classification usages: ${audit.counts.classification_registry_usages}; classification warnings: ${audit.counts.classification_registry_warnings}; declassification usages: ${audit.counts.declassification_registry_usages}; declassification warnings: ${audit.counts.declassification_registry_warnings}; translation usages: ${audit.counts.translation_registry_usages}; translation warnings: ${audit.counts.translation_registry_warnings}; printed-attachment usages: ${audit.counts.printed_attachment_registry_usages}; printed-attachment warnings: ${audit.counts.printed_attachment_registry_warnings}; visual-material usages: ${audit.counts.visual_material_registry_usages}; visual-material warnings: ${audit.counts.visual_material_registry_warnings}; document-handling usages: ${audit.counts.document_handling_registry_usages}; document-handling warnings: ${audit.counts.document_handling_registry_warnings}; chronology usages: ${audit.counts.chronology_registry_usages}; chronology warnings: ${audit.counts.chronology_registry_warnings}; time-zone usages: ${audit.counts.time_zone_registry_usages}; time-zone warnings: ${audit.counts.time_zone_registry_warnings}; selection-balance usages: ${audit.counts.selection_balance_registry_usages}; selection-balance warnings: ${audit.counts.selection_balance_registry_warnings}; decision-process usages: ${audit.counts.decision_process_registry_usages}; decision-process warnings: ${audit.counts.decision_process_registry_warnings}; public-source usages: ${audit.counts.public_source_registry_usages}; public-source warnings: ${audit.counts.public_source_registry_warnings}; retrospective-account usages: ${audit.counts.retrospective_account_registry_usages}; retrospective-account warnings: ${audit.counts.retrospective_account_registry_warnings}; treaty usages: ${audit.counts.treaty_registry_usages}; treaty warnings: ${audit.counts.treaty_registry_warnings}; foreign-org usages: ${audit.counts.foreign_org_registry_usages}; foreign-org warnings: ${audit.counts.foreign_org_registry_warnings}; footnote refer-back approved: ${audit.counts.footnote_referback_approved_usages}; malformed: ${audit.counts.footnote_referback_malformed}; repeated-citation thresholds: ${audit.counts.footnote_referback_repeated_citation_thresholds}; recurring-risk matches: ${audit.counts.recurring_risk_matches}; negative-search usages: ${audit.counts.negative_search_registry_usages}; negative-search warnings: ${audit.counts.negative_search_registry_warnings}; document-relationship usages: ${audit.counts.document_relationship_registry_usages}; document-relationship warnings: ${audit.counts.document_relationship_registry_warnings}; communications usages: ${audit.counts.communications_registry_usages}; communications warnings: ${audit.counts.communications_registry_warnings}; annotation-sheet profile lexical misses: ${audit.counts.annotation_sheet_profile_lexical_misclassifications}; marker conflicts: ${audit.counts.annotation_sheet_profile_direct_edit_marker_conflicts}; unreviewed units: ${audit.counts.review_coverage_unreviewed_units}.`,
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
    review_coverage: path.join(options.artifactDir, "review-coverage.json"),
    source_note_lint: path.join(options.artifactDir, "source-note-lint.json"),
    pseudo_marker_preflight: path.join(options.artifactDir, "pseudo-marker-preflight.txt"),
    annotation_sheet_profile_audit: path.join(options.artifactDir, "annotation-sheet-profile-audit.json"),
    status_claims: path.join(options.artifactDir, "status-claims.json"),
    status_registry_validation: path.join(options.artifactDir, "status-registry-validation.json"),
    authority_registry_validation: path.join(options.artifactDir, "authority-registry-validation.json"),
    authority_usage_audit: path.join(options.artifactDir, "authority-usage-audit.json"),
    source_list_registry_validation: path.join(options.artifactDir, "source-list-registry-validation.json"),
    source_list_usage_audit: path.join(options.artifactDir, "source-list-usage-audit.json"),
    document_metadata_registry_validation: path.join(options.artifactDir, "document-metadata-registry-validation.json"),
    document_metadata_usage_audit: path.join(options.artifactDir, "document-metadata-usage-audit.json"),
    classification_registry_validation: path.join(options.artifactDir, "classification-registry-validation.json"),
    classification_usage_audit: path.join(options.artifactDir, "classification-usage-audit.json"),
    declassification_registry_validation: path.join(options.artifactDir, "declassification-registry-validation.json"),
    declassification_usage_audit: path.join(options.artifactDir, "declassification-usage-audit.json"),
    translation_registry_validation: path.join(options.artifactDir, "translation-registry-validation.json"),
    translation_usage_audit: path.join(options.artifactDir, "translation-usage-audit.json"),
    printed_attachment_registry_validation: path.join(options.artifactDir, "printed-attachment-registry-validation.json"),
    printed_attachment_usage_audit: path.join(options.artifactDir, "printed-attachment-usage-audit.json"),
    visual_material_registry_validation: path.join(options.artifactDir, "visual-material-registry-validation.json"),
    visual_material_usage_audit: path.join(options.artifactDir, "visual-material-usage-audit.json"),
    document_handling_registry_validation: path.join(options.artifactDir, "document-handling-registry-validation.json"),
    document_handling_usage_audit: path.join(options.artifactDir, "document-handling-usage-audit.json"),
    chronology_registry_validation: path.join(options.artifactDir, "chronology-registry-validation.json"),
    chronology_usage_audit: path.join(options.artifactDir, "chronology-usage-audit.json"),
    time_zone_registry_validation: path.join(options.artifactDir, "time-zone-registry-validation.json"),
    time_zone_usage_audit: path.join(options.artifactDir, "time-zone-usage-audit.json"),
    selection_balance_registry_validation: path.join(options.artifactDir, "selection-balance-registry-validation.json"),
    selection_balance_usage_audit: path.join(options.artifactDir, "selection-balance-usage-audit.json"),
    decision_process_registry_validation: path.join(options.artifactDir, "decision-process-registry-validation.json"),
    decision_process_usage_audit: path.join(options.artifactDir, "decision-process-usage-audit.json"),
    public_source_registry_validation: path.join(options.artifactDir, "public-source-registry-validation.json"),
    public_source_usage_audit: path.join(options.artifactDir, "public-source-usage-audit.json"),
    retrospective_account_registry_validation: path.join(
      options.artifactDir,
      "retrospective-account-registry-validation.json"
    ),
    retrospective_account_usage_audit: path.join(options.artifactDir, "retrospective-account-usage-audit.json"),
    treaty_registry_validation: path.join(options.artifactDir, "treaty-registry-validation.json"),
    treaty_usage_audit: path.join(options.artifactDir, "treaty-usage-audit.json"),
    foreign_org_registry_validation: path.join(options.artifactDir, "foreign-org-registry-validation.json"),
    foreign_org_usage_audit: path.join(options.artifactDir, "foreign-org-usage-audit.json"),
    footnote_referback_registry_validation: path.join(options.artifactDir, "footnote-referback-registry-validation.json"),
    footnote_referback_usage_audit: path.join(options.artifactDir, "footnote-referback-usage-audit.json"),
    recurring_risk_registry_validation: path.join(options.artifactDir, "recurring-risk-registry-validation.json"),
    recurring_risk_usage_audit: path.join(options.artifactDir, "recurring-risk-usage-audit.json"),
    negative_search_registry_validation: path.join(options.artifactDir, "negative-search-registry-validation.json"),
    negative_search_usage_audit: path.join(options.artifactDir, "negative-search-usage-audit.json"),
    document_relationship_registry_validation: path.join(options.artifactDir, "document-relationship-registry-validation.json"),
    document_relationship_usage_audit: path.join(options.artifactDir, "document-relationship-usage-audit.json"),
    communications_registry_validation: path.join(options.artifactDir, "communications-registry-validation.json"),
    communications_usage_audit: path.join(options.artifactDir, "communications-usage-audit.json"),
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
  if (options.annotationSheetProfilePath) {
    const profileStep = runNodeStep({
      label: "audit_annotation_sheet_profile",
      args: [
        "scripts/audit-frus-annotation-sheet-profile.mjs",
        "--profile",
        options.annotationSheetProfilePath,
        "--units",
        artifacts.extracted_units,
        "--checker-output",
        options.checkerOutputPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.annotation_sheet_profile_audit,
      parseJson: true
    });
    steps.push(profileStep);
    optionalReports.annotation_sheet_profile_audit = profileStep.parsed;
  }
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
  if (options.authorityRegistryPath) {
    const authorityValidationStep = runNodeStep({
      label: "validate_authority_registry",
      args: [
        "scripts/validate-frus-authority-registry.mjs",
        "--registry",
        options.authorityRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.authority_registry_validation,
      parseJson: true
    });
    steps.push(authorityValidationStep);
    optionalReports.authority_registry_validation = authorityValidationStep.parsed;

    const authorityAuditArgs = [
      "scripts/audit-frus-authority-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.authorityRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      authorityAuditArgs.push("--target-volume", options.targetVolume);
    }
    const authorityAuditStep = runNodeStep({
      label: "audit_authority_usage",
      args: authorityAuditArgs,
      cwd,
      stdoutFile: artifacts.authority_usage_audit,
      parseJson: true
    });
    steps.push(authorityAuditStep);
    optionalReports.authority_usage_audit = authorityAuditStep.parsed;
  }
  if (options.sourceListRegistryPath) {
    const sourceListValidationStep = runNodeStep({
      label: "validate_source_list_registry",
      args: [
        "scripts/validate-frus-source-list-registry.mjs",
        "--registry",
        options.sourceListRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.source_list_registry_validation,
      parseJson: true
    });
    steps.push(sourceListValidationStep);
    optionalReports.source_list_registry_validation = sourceListValidationStep.parsed;

    const sourceListAuditArgs = [
      "scripts/audit-frus-source-list-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.sourceListRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      sourceListAuditArgs.push("--target-volume", options.targetVolume);
    }
    const sourceListAuditStep = runNodeStep({
      label: "audit_source_list_usage",
      args: sourceListAuditArgs,
      cwd,
      stdoutFile: artifacts.source_list_usage_audit,
      parseJson: true
    });
    steps.push(sourceListAuditStep);
    optionalReports.source_list_usage_audit = sourceListAuditStep.parsed;
  }
  if (options.documentMetadataRegistryPath) {
    const documentMetadataValidationStep = runNodeStep({
      label: "validate_document_metadata_registry",
      args: [
        "scripts/validate-frus-document-metadata-registry.mjs",
        "--registry",
        options.documentMetadataRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.document_metadata_registry_validation,
      parseJson: true
    });
    steps.push(documentMetadataValidationStep);
    optionalReports.document_metadata_registry_validation = documentMetadataValidationStep.parsed;

    const documentMetadataAuditArgs = [
      "scripts/audit-frus-document-metadata-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.documentMetadataRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      documentMetadataAuditArgs.push("--target-volume", options.targetVolume);
    }
    const documentMetadataAuditStep = runNodeStep({
      label: "audit_document_metadata_usage",
      args: documentMetadataAuditArgs,
      cwd,
      stdoutFile: artifacts.document_metadata_usage_audit,
      parseJson: true
    });
    steps.push(documentMetadataAuditStep);
    optionalReports.document_metadata_usage_audit = documentMetadataAuditStep.parsed;
  }
  if (options.classificationRegistryPath) {
    const classificationValidationStep = runNodeStep({
      label: "validate_classification_registry",
      args: [
        "scripts/validate-frus-classification-registry.mjs",
        "--registry",
        options.classificationRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.classification_registry_validation,
      parseJson: true
    });
    steps.push(classificationValidationStep);
    optionalReports.classification_registry_validation = classificationValidationStep.parsed;

    const classificationAuditArgs = [
      "scripts/audit-frus-classification-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.classificationRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      classificationAuditArgs.push("--target-volume", options.targetVolume);
    }
    const classificationAuditStep = runNodeStep({
      label: "audit_classification_usage",
      args: classificationAuditArgs,
      cwd,
      stdoutFile: artifacts.classification_usage_audit,
      parseJson: true
    });
    steps.push(classificationAuditStep);
    optionalReports.classification_usage_audit = classificationAuditStep.parsed;
  }
  if (options.declassificationRegistryPath) {
    const declassificationValidationStep = runNodeStep({
      label: "validate_declassification_registry",
      args: [
        "scripts/validate-frus-declassification-registry.mjs",
        "--registry",
        options.declassificationRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.declassification_registry_validation,
      parseJson: true
    });
    steps.push(declassificationValidationStep);
    optionalReports.declassification_registry_validation = declassificationValidationStep.parsed;

    const declassificationAuditArgs = [
      "scripts/audit-frus-declassification-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.declassificationRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      declassificationAuditArgs.push("--target-volume", options.targetVolume);
    }
    const declassificationAuditStep = runNodeStep({
      label: "audit_declassification_usage",
      args: declassificationAuditArgs,
      cwd,
      stdoutFile: artifacts.declassification_usage_audit,
      parseJson: true
    });
    steps.push(declassificationAuditStep);
    optionalReports.declassification_usage_audit = declassificationAuditStep.parsed;
  }
  if (options.translationRegistryPath) {
    const translationValidationStep = runNodeStep({
      label: "validate_translation_registry",
      args: [
        "scripts/validate-frus-translation-registry.mjs",
        "--registry",
        options.translationRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.translation_registry_validation,
      parseJson: true
    });
    steps.push(translationValidationStep);
    optionalReports.translation_registry_validation = translationValidationStep.parsed;

    const translationAuditArgs = [
      "scripts/audit-frus-translation-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.translationRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      translationAuditArgs.push("--target-volume", options.targetVolume);
    }
    const translationAuditStep = runNodeStep({
      label: "audit_translation_usage",
      args: translationAuditArgs,
      cwd,
      stdoutFile: artifacts.translation_usage_audit,
      parseJson: true
    });
    steps.push(translationAuditStep);
    optionalReports.translation_usage_audit = translationAuditStep.parsed;
  }
  if (options.printedAttachmentRegistryPath) {
    const printedAttachmentValidationStep = runNodeStep({
      label: "validate_printed_attachment_registry",
      args: [
        "scripts/validate-frus-printed-attachment-registry.mjs",
        "--registry",
        options.printedAttachmentRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.printed_attachment_registry_validation,
      parseJson: true
    });
    steps.push(printedAttachmentValidationStep);
    optionalReports.printed_attachment_registry_validation = printedAttachmentValidationStep.parsed;

    const printedAttachmentAuditArgs = [
      "scripts/audit-frus-printed-attachment-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.printedAttachmentRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      printedAttachmentAuditArgs.push("--target-volume", options.targetVolume);
    }
    const printedAttachmentAuditStep = runNodeStep({
      label: "audit_printed_attachment_usage",
      args: printedAttachmentAuditArgs,
      cwd,
      stdoutFile: artifacts.printed_attachment_usage_audit,
      parseJson: true
    });
    steps.push(printedAttachmentAuditStep);
    optionalReports.printed_attachment_usage_audit = printedAttachmentAuditStep.parsed;
  }
  if (options.visualMaterialRegistryPath) {
    const visualMaterialValidationStep = runNodeStep({
      label: "validate_visual_material_registry",
      args: [
        "scripts/validate-frus-visual-material-registry.mjs",
        "--registry",
        options.visualMaterialRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.visual_material_registry_validation,
      parseJson: true
    });
    steps.push(visualMaterialValidationStep);
    optionalReports.visual_material_registry_validation = visualMaterialValidationStep.parsed;

    const visualMaterialAuditArgs = [
      "scripts/audit-frus-visual-material-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.visualMaterialRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      visualMaterialAuditArgs.push("--target-volume", options.targetVolume);
    }
    const visualMaterialAuditStep = runNodeStep({
      label: "audit_visual_material_usage",
      args: visualMaterialAuditArgs,
      cwd,
      stdoutFile: artifacts.visual_material_usage_audit,
      parseJson: true
    });
    steps.push(visualMaterialAuditStep);
    optionalReports.visual_material_usage_audit = visualMaterialAuditStep.parsed;
  }
  if (options.documentHandlingRegistryPath) {
    const documentHandlingValidationStep = runNodeStep({
      label: "validate_document_handling_registry",
      args: [
        "scripts/validate-frus-document-handling-registry.mjs",
        "--registry",
        options.documentHandlingRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.document_handling_registry_validation,
      parseJson: true
    });
    steps.push(documentHandlingValidationStep);
    optionalReports.document_handling_registry_validation = documentHandlingValidationStep.parsed;

    const documentHandlingAuditArgs = [
      "scripts/audit-frus-document-handling-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.documentHandlingRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      documentHandlingAuditArgs.push("--target-volume", options.targetVolume);
    }
    const documentHandlingAuditStep = runNodeStep({
      label: "audit_document_handling_usage",
      args: documentHandlingAuditArgs,
      cwd,
      stdoutFile: artifacts.document_handling_usage_audit,
      parseJson: true
    });
    steps.push(documentHandlingAuditStep);
    optionalReports.document_handling_usage_audit = documentHandlingAuditStep.parsed;
  }
  if (options.chronologyRegistryPath) {
    const chronologyValidationStep = runNodeStep({
      label: "validate_chronology_registry",
      args: [
        "scripts/validate-frus-chronology-registry.mjs",
        "--registry",
        options.chronologyRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.chronology_registry_validation,
      parseJson: true
    });
    steps.push(chronologyValidationStep);
    optionalReports.chronology_registry_validation = chronologyValidationStep.parsed;

    const chronologyAuditArgs = [
      "scripts/audit-frus-chronology-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.chronologyRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      chronologyAuditArgs.push("--target-volume", options.targetVolume);
    }
    const chronologyAuditStep = runNodeStep({
      label: "audit_chronology_usage",
      args: chronologyAuditArgs,
      cwd,
      stdoutFile: artifacts.chronology_usage_audit,
      parseJson: true
    });
    steps.push(chronologyAuditStep);
    optionalReports.chronology_usage_audit = chronologyAuditStep.parsed;
  }
  if (options.timeZoneRegistryPath) {
    const timeZoneValidationStep = runNodeStep({
      label: "validate_time_zone_registry",
      args: [
        "scripts/validate-frus-time-zone-registry.mjs",
        "--registry",
        options.timeZoneRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.time_zone_registry_validation,
      parseJson: true
    });
    steps.push(timeZoneValidationStep);
    optionalReports.time_zone_registry_validation = timeZoneValidationStep.parsed;

    const timeZoneAuditArgs = [
      "scripts/audit-frus-time-zone-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.timeZoneRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      timeZoneAuditArgs.push("--target-volume", options.targetVolume);
    }
    const timeZoneAuditStep = runNodeStep({
      label: "audit_time_zone_usage",
      args: timeZoneAuditArgs,
      cwd,
      stdoutFile: artifacts.time_zone_usage_audit,
      parseJson: true
    });
    steps.push(timeZoneAuditStep);
    optionalReports.time_zone_usage_audit = timeZoneAuditStep.parsed;
  }
  if (options.selectionBalanceRegistryPath) {
    const selectionBalanceValidationStep = runNodeStep({
      label: "validate_selection_balance_registry",
      args: [
        "scripts/validate-frus-selection-balance-registry.mjs",
        "--registry",
        options.selectionBalanceRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.selection_balance_registry_validation,
      parseJson: true
    });
    steps.push(selectionBalanceValidationStep);
    optionalReports.selection_balance_registry_validation = selectionBalanceValidationStep.parsed;

    const selectionBalanceAuditArgs = [
      "scripts/audit-frus-selection-balance-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.selectionBalanceRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      selectionBalanceAuditArgs.push("--target-volume", options.targetVolume);
    }
    const selectionBalanceAuditStep = runNodeStep({
      label: "audit_selection_balance_usage",
      args: selectionBalanceAuditArgs,
      cwd,
      stdoutFile: artifacts.selection_balance_usage_audit,
      parseJson: true
    });
    steps.push(selectionBalanceAuditStep);
    optionalReports.selection_balance_usage_audit = selectionBalanceAuditStep.parsed;
  }
  if (options.decisionProcessRegistryPath) {
    const decisionProcessValidationStep = runNodeStep({
      label: "validate_decision_process_registry",
      args: [
        "scripts/validate-frus-decision-process-registry.mjs",
        "--registry",
        options.decisionProcessRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.decision_process_registry_validation,
      parseJson: true
    });
    steps.push(decisionProcessValidationStep);
    optionalReports.decision_process_registry_validation = decisionProcessValidationStep.parsed;

    const decisionProcessAuditArgs = [
      "scripts/audit-frus-decision-process-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.decisionProcessRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      decisionProcessAuditArgs.push("--target-volume", options.targetVolume);
    }
    const decisionProcessAuditStep = runNodeStep({
      label: "audit_decision_process_usage",
      args: decisionProcessAuditArgs,
      cwd,
      stdoutFile: artifacts.decision_process_usage_audit,
      parseJson: true
    });
    steps.push(decisionProcessAuditStep);
    optionalReports.decision_process_usage_audit = decisionProcessAuditStep.parsed;
  }
  if (options.publicSourceRegistryPath) {
    const publicSourceValidationStep = runNodeStep({
      label: "validate_public_source_registry",
      args: [
        "scripts/validate-frus-public-source-registry.mjs",
        "--registry",
        options.publicSourceRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.public_source_registry_validation,
      parseJson: true
    });
    steps.push(publicSourceValidationStep);
    optionalReports.public_source_registry_validation = publicSourceValidationStep.parsed;

    const publicSourceAuditArgs = [
      "scripts/audit-frus-public-source-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.publicSourceRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      publicSourceAuditArgs.push("--target-volume", options.targetVolume);
    }
    const publicSourceAuditStep = runNodeStep({
      label: "audit_public_source_usage",
      args: publicSourceAuditArgs,
      cwd,
      stdoutFile: artifacts.public_source_usage_audit,
      parseJson: true
    });
    steps.push(publicSourceAuditStep);
    optionalReports.public_source_usage_audit = publicSourceAuditStep.parsed;
  }
  if (options.retrospectiveAccountRegistryPath) {
    const retrospectiveAccountValidationStep = runNodeStep({
      label: "validate_retrospective_account_registry",
      args: [
        "scripts/validate-frus-retrospective-account-registry.mjs",
        "--registry",
        options.retrospectiveAccountRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.retrospective_account_registry_validation,
      parseJson: true
    });
    steps.push(retrospectiveAccountValidationStep);
    optionalReports.retrospective_account_registry_validation = retrospectiveAccountValidationStep.parsed;

    const retrospectiveAccountAuditArgs = [
      "scripts/audit-frus-retrospective-account-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.retrospectiveAccountRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      retrospectiveAccountAuditArgs.push("--target-volume", options.targetVolume);
    }
    const retrospectiveAccountAuditStep = runNodeStep({
      label: "audit_retrospective_account_usage",
      args: retrospectiveAccountAuditArgs,
      cwd,
      stdoutFile: artifacts.retrospective_account_usage_audit,
      parseJson: true
    });
    steps.push(retrospectiveAccountAuditStep);
    optionalReports.retrospective_account_usage_audit = retrospectiveAccountAuditStep.parsed;
  }
  if (options.treatyRegistryPath) {
    const treatyValidationStep = runNodeStep({
      label: "validate_treaty_registry",
      args: [
        "scripts/validate-frus-treaty-registry.mjs",
        "--registry",
        options.treatyRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.treaty_registry_validation,
      parseJson: true
    });
    steps.push(treatyValidationStep);
    optionalReports.treaty_registry_validation = treatyValidationStep.parsed;

    const treatyAuditArgs = [
      "scripts/audit-frus-treaty-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.treatyRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      treatyAuditArgs.push("--target-volume", options.targetVolume);
    }
    const treatyAuditStep = runNodeStep({
      label: "audit_treaty_usage",
      args: treatyAuditArgs,
      cwd,
      stdoutFile: artifacts.treaty_usage_audit,
      parseJson: true
    });
    steps.push(treatyAuditStep);
    optionalReports.treaty_usage_audit = treatyAuditStep.parsed;
  }
  if (options.foreignOrgRegistryPath) {
    const foreignOrgValidationStep = runNodeStep({
      label: "validate_foreign_org_registry",
      args: [
        "scripts/validate-frus-foreign-org-registry.mjs",
        "--registry",
        options.foreignOrgRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.foreign_org_registry_validation,
      parseJson: true
    });
    steps.push(foreignOrgValidationStep);
    optionalReports.foreign_org_registry_validation = foreignOrgValidationStep.parsed;

    const foreignOrgAuditArgs = [
      "scripts/audit-frus-foreign-org-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.foreignOrgRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      foreignOrgAuditArgs.push("--target-volume", options.targetVolume);
    }
    const foreignOrgAuditStep = runNodeStep({
      label: "audit_foreign_org_usage",
      args: foreignOrgAuditArgs,
      cwd,
      stdoutFile: artifacts.foreign_org_usage_audit,
      parseJson: true
    });
    steps.push(foreignOrgAuditStep);
    optionalReports.foreign_org_usage_audit = foreignOrgAuditStep.parsed;
  }
  if (options.footnoteReferbackRegistryPath) {
    const footnoteReferbackValidationStep = runNodeStep({
      label: "validate_footnote_referback_registry",
      args: [
        "scripts/validate-frus-footnote-referback-registry.mjs",
        "--registry",
        options.footnoteReferbackRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.footnote_referback_registry_validation,
      parseJson: true
    });
    steps.push(footnoteReferbackValidationStep);
    optionalReports.footnote_referback_registry_validation = footnoteReferbackValidationStep.parsed;

    const footnoteReferbackAuditArgs = [
      "scripts/audit-frus-footnote-referback-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.footnoteReferbackRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      footnoteReferbackAuditArgs.push("--target-volume", options.targetVolume);
    }
    const footnoteReferbackAuditStep = runNodeStep({
      label: "audit_footnote_referback_usage",
      args: footnoteReferbackAuditArgs,
      cwd,
      stdoutFile: artifacts.footnote_referback_usage_audit,
      parseJson: true
    });
    steps.push(footnoteReferbackAuditStep);
    optionalReports.footnote_referback_usage_audit = footnoteReferbackAuditStep.parsed;
  }
  if (options.recurringRiskRegistryPath) {
    const recurringRiskValidationStep = runNodeStep({
      label: "validate_recurring_risk_registry",
      args: [
        "scripts/validate-frus-recurring-risk-registry.mjs",
        "--registry",
        options.recurringRiskRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.recurring_risk_registry_validation,
      parseJson: true
    });
    steps.push(recurringRiskValidationStep);
    optionalReports.recurring_risk_registry_validation = recurringRiskValidationStep.parsed;

    const recurringRiskAuditStep = runNodeStep({
      label: "audit_recurring_risk_usage",
      args: [
        "scripts/audit-frus-recurring-risk-usage.mjs",
        "--units",
        artifacts.extracted_units,
        "--registry",
        options.recurringRiskRegistryPath,
        "--checker-output",
        options.checkerOutputPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.recurring_risk_usage_audit,
      parseJson: true
    });
    steps.push(recurringRiskAuditStep);
    optionalReports.recurring_risk_usage_audit = recurringRiskAuditStep.parsed;
  }
  if (options.negativeSearchRegistryPath) {
    const negativeSearchValidationStep = runNodeStep({
      label: "validate_negative_search_registry",
      args: [
        "scripts/validate-frus-negative-search-registry.mjs",
        "--registry",
        options.negativeSearchRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.negative_search_registry_validation,
      parseJson: true
    });
    steps.push(negativeSearchValidationStep);
    optionalReports.negative_search_registry_validation = negativeSearchValidationStep.parsed;

    const negativeSearchAuditArgs = [
      "scripts/audit-frus-negative-search-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.negativeSearchRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      negativeSearchAuditArgs.push("--target-volume", options.targetVolume);
    }
    const negativeSearchAuditStep = runNodeStep({
      label: "audit_negative_search_usage",
      args: negativeSearchAuditArgs,
      cwd,
      stdoutFile: artifacts.negative_search_usage_audit,
      parseJson: true
    });
    steps.push(negativeSearchAuditStep);
    optionalReports.negative_search_usage_audit = negativeSearchAuditStep.parsed;
  }
  if (options.documentRelationshipRegistryPath) {
    const relationshipValidationStep = runNodeStep({
      label: "validate_document_relationship_registry",
      args: [
        "scripts/validate-frus-document-relationship-registry.mjs",
        "--registry",
        options.documentRelationshipRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.document_relationship_registry_validation,
      parseJson: true
    });
    steps.push(relationshipValidationStep);
    optionalReports.document_relationship_registry_validation = relationshipValidationStep.parsed;

    const relationshipAuditArgs = [
      "scripts/audit-frus-document-relationship-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.documentRelationshipRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      relationshipAuditArgs.push("--target-volume", options.targetVolume);
    }
    const relationshipAuditStep = runNodeStep({
      label: "audit_document_relationship_usage",
      args: relationshipAuditArgs,
      cwd,
      stdoutFile: artifacts.document_relationship_usage_audit,
      parseJson: true
    });
    steps.push(relationshipAuditStep);
    optionalReports.document_relationship_usage_audit = relationshipAuditStep.parsed;
  }
  if (options.communicationsRegistryPath) {
    const communicationsValidationStep = runNodeStep({
      label: "validate_communications_registry",
      args: [
        "scripts/validate-frus-communications-registry.mjs",
        "--registry",
        options.communicationsRegistryPath,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.communications_registry_validation,
      parseJson: true
    });
    steps.push(communicationsValidationStep);
    optionalReports.communications_registry_validation = communicationsValidationStep.parsed;

    const communicationsAuditArgs = [
      "scripts/audit-frus-communications-usage.mjs",
      "--units",
      artifacts.extracted_units,
      "--registry",
      options.communicationsRegistryPath,
      "--checker-output",
      options.checkerOutputPath,
      "--format",
      "json"
    ];
    if (options.targetVolume) {
      communicationsAuditArgs.push("--target-volume", options.targetVolume);
    }
    const communicationsAuditStep = runNodeStep({
      label: "audit_communications_usage",
      args: communicationsAuditArgs,
      cwd,
      stdoutFile: artifacts.communications_usage_audit,
      parseJson: true
    });
    steps.push(communicationsAuditStep);
    optionalReports.communications_usage_audit = communicationsAuditStep.parsed;
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
  let effectiveStatusClaimsPath = options.statusClaimsPath;
  if (options.statusRegistryPath && !effectiveStatusClaimsPath) {
    const extractionStep = runNodeStep({
      label: "extract_status_claims",
      args: [
        "scripts/extract-frus-status-claims.mjs",
        "--units",
        artifacts.extracted_units,
        "--registry",
        options.statusRegistryPath,
        "--checker-output",
        options.checkerOutputPath,
        "--out",
        artifacts.status_claims,
        "--format",
        "json"
      ],
      cwd,
      stdoutFile: artifacts.status_claims,
      parseJson: true
    });
    steps.push(extractionStep);
    optionalReports.status_claims_extraction = extractionStep.parsed;
    effectiveStatusClaimsPath = artifacts.status_claims;
  }
  if (effectiveStatusClaimsPath) {
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
          effectiveStatusClaimsPath,
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
  const coverageArgs = [
    "scripts/audit-frus-review-coverage.mjs",
    "--units",
    artifacts.extracted_units,
    "--output",
    options.checkerOutputPath,
    "--review-mode",
    options.reviewMode,
    "--format",
    "json"
  ];
  if (options.permutationMatrixPath) {
    coverageArgs.push("--matrix", options.permutationMatrixPath);
  }
  const coverageStep = runNodeStep({
    label: "audit_review_coverage",
    args: coverageArgs,
    cwd,
    stdoutFile: artifacts.review_coverage,
    parseJson: true
  });
  steps.push(coverageStep);
  optionalReports.review_coverage = coverageStep.parsed;
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
