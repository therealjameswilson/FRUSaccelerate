#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const REVIEWABLE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "document_heading",
  "attachment_note",
  "declassification_note",
  "persons_entry",
  "abbreviation_entry",
  "index_entry",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);

function usage() {
  console.error(
    "Usage: node scripts/build-frus-llm-review-chunks.mjs --units <extracted-units.json> --out-dir DIR [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--annotation-sheet-profile profile.json] [--status-registry registry.json] [--status-claims claims.json] [--authority-registry registry.json] [--source-list-registry registry.json] [--document-metadata-registry registry.json] [--classification-registry registry.json] [--declassification-registry registry.json] [--translation-registry registry.json] [--printed-attachment-registry registry.json] [--visual-material-registry registry.json] [--handwritten-transcription-registry registry.json] [--document-handling-registry registry.json] [--chronology-registry registry.json] [--time-zone-registry registry.json] [--summit-public-event-registry registry.json] [--selection-balance-registry registry.json] [--decision-process-registry registry.json] [--public-source-registry registry.json] [--retrospective-account-registry registry.json] [--treaty-registry registry.json] [--foreign-org-registry registry.json] [--congressional-legal-registry registry.json] [--economic-financial-registry registry.json] [--military-crisis-registry registry.json] [--intelligence-law-enforcement-registry registry.json] [--human-rights-refugee-global-issues-registry registry.json] [--footnote-referback-registry registry.json] [--recurring-risk-registry registry.json] [--negative-search-registry registry.json] [--document-relationship-registry registry.json] [--communications-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--max-units N] [--max-chars N] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
  let outDir = null;
  let guidePath = "reports/frus-annotation-checker-core.md";
  let schemaPath = "reports/frus-annotation-checker-output.schema.json";
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
  let handwrittenTranscriptionRegistryPath = null;
  let documentHandlingRegistryPath = null;
  let chronologyRegistryPath = null;
  let timeZoneRegistryPath = null;
  let summitPublicEventRegistryPath = null;
  let selectionBalanceRegistryPath = null;
  let decisionProcessRegistryPath = null;
  let publicSourceRegistryPath = null;
  let retrospectiveAccountRegistryPath = null;
  let treatyRegistryPath = null;
  let foreignOrgRegistryPath = null;
  let congressionalLegalRegistryPath = null;
  let economicFinancialRegistryPath = null;
  let militaryCrisisRegistryPath = null;
  let intelligenceLawEnforcementRegistryPath = null;
  let humanRightsRefugeeGlobalIssuesRegistryPath = null;
  let footnoteReferbackRegistryPath = null;
  let recurringRiskRegistryPath = null;
  let negativeSearchRegistryPath = null;
  let documentRelationshipRegistryPath = null;
  let communicationsRegistryPath = null;
  let preparationRouterPath = null;
  let permutationMatrixPath = null;
  let targetVolume = "";
  let runId = `frus-review-chunks-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let maxUnits = 12;
  let maxChars = 18_000;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--out-dir") {
      outDir = argv[index + 1];
      index += 1;
    } else if (arg === "--guide") {
      guidePath = argv[index + 1];
      index += 1;
    } else if (arg === "--schema") {
      schemaPath = argv[index + 1];
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
    } else if (arg === "--handwritten-transcription-registry") {
      handwrittenTranscriptionRegistryPath = argv[index + 1];
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
    } else if (arg === "--summit-public-event-registry") {
      summitPublicEventRegistryPath = argv[index + 1];
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
    } else if (arg === "--congressional-legal-registry") {
      congressionalLegalRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--economic-financial-registry") {
      economicFinancialRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--military-crisis-registry") {
      militaryCrisisRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--intelligence-law-enforcement-registry") {
      intelligenceLawEnforcementRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--human-rights-refugee-global-issues-registry") {
      humanRightsRefugeeGlobalIssuesRegistryPath = argv[index + 1];
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
    } else if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
    } else if (arg === "--max-units") {
      maxUnits = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--max-chars") {
      maxChars = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (
    !unitsPath ||
    !outDir ||
    !Number.isInteger(maxUnits) ||
    maxUnits < 1 ||
    !Number.isInteger(maxChars) ||
    maxChars < 1000 ||
    !new Set(["json", "text"]).has(format)
  ) {
    usage();
  }

  return {
    unitsPath,
    outDir,
    guidePath,
    schemaPath,
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
    handwrittenTranscriptionRegistryPath,
    documentHandlingRegistryPath,
    chronologyRegistryPath,
    timeZoneRegistryPath,
    summitPublicEventRegistryPath,
    selectionBalanceRegistryPath,
    decisionProcessRegistryPath,
    publicSourceRegistryPath,
    retrospectiveAccountRegistryPath,
    treatyRegistryPath,
    foreignOrgRegistryPath,
    congressionalLegalRegistryPath,
    economicFinancialRegistryPath,
    militaryCrisisRegistryPath,
    intelligenceLawEnforcementRegistryPath,
    humanRightsRefugeeGlobalIssuesRegistryPath,
    footnoteReferbackRegistryPath,
    recurringRiskRegistryPath,
    negativeSearchRegistryPath,
    documentRelationshipRegistryPath,
    communicationsRegistryPath,
    preparationRouterPath,
    permutationMatrixPath,
    targetVolume,
    runId,
    maxUnits,
    maxChars,
    format
  };
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateUnits(unitsDocument, label) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) return [`${label}: expected extracted-units object`];
  if (unitsDocument.schema_version !== "frus-extracted-units-v1") {
    errors.push(`${label}.schema_version: must be frus-extracted-units-v1`);
  }
  if (!Array.isArray(unitsDocument.units)) {
    errors.push(`${label}.units: expected array`);
    return errors;
  }
  const seen = new Set();
  unitsDocument.units.forEach((unit, index) => {
    const unitLabel = `${label}.units[${index}]`;
    if (!isPlainObject(unit)) {
      errors.push(`${unitLabel}: expected object`);
      return;
    }
    if (typeof unit.unit_id !== "string" || unit.unit_id.length === 0) {
      errors.push(`${unitLabel}.unit_id: expected non-empty string`);
    } else if (seen.has(unit.unit_id)) {
      errors.push(`${unitLabel}.unit_id: duplicate ${unit.unit_id}`);
    } else {
      seen.add(unit.unit_id);
    }
  });
  return errors;
}

function unitCost(unit) {
  return JSON.stringify(unit).length;
}

function reviewRequired(unit) {
  if (!unit || unit.word_part === "word/comments.xml") return false;
  if (!String(unit.exact_text || unit.display_text || "").trim()) return false;
  return REVIEWABLE_UNIT_TYPES.has(unit.unit_type);
}

function chunkUnits(units, maxUnits, maxChars) {
  const chunks = [];
  let current = [];
  let currentChars = 0;
  for (const unit of units) {
    const cost = unitCost(unit);
    const full = current.length >= maxUnits || (current.length > 0 && currentChars + cost > maxChars);
    if (full) {
      chunks.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(unit);
    currentChars += cost;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function compactJson(value) {
  return JSON.stringify(value || {}, null, 2);
}

function fencedJson(value) {
  return `\`\`\`json\n${compactJson(value)}\n\`\`\``;
}

function subsetStatusClaims(statusClaims, unitIds) {
  if (!statusClaims || !Array.isArray(statusClaims.claims)) return null;
  const unitSet = new Set(unitIds);
  return {
    ...statusClaims,
    claims: statusClaims.claims.filter((claim) => unitSet.has(claim.unit_id)),
    summary: {
      ...(statusClaims.summary || {}),
      claims_found: statusClaims.claims.filter((claim) => unitSet.has(claim.unit_id)).length
    }
  };
}

function compactAuthorityRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    authority_registry_id: registry.authority_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      authority_item_id: record.authority_item_id,
      authority_type: record.authority_type,
      volume_id: record.volume_id,
      approved_display_form: record.approved_display_form,
      variant_forms: record.variant_forms || [],
      role_or_expansion: record.role_or_expansion,
      date_span: record.date_span,
      index_or_front_matter_behavior: record.index_or_front_matter_behavior,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactSourceListRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    source_list_registry_id: registry.source_list_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      source_item_id: record.source_item_id,
      source_type: record.source_type,
      volume_id: record.volume_id,
      approved_source_form: record.approved_source_form,
      variant_forms: record.variant_forms || [],
      repository_or_parent: record.repository_or_parent,
      front_matter_section: record.front_matter_section,
      source_note_usage: record.source_note_usage,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactDocumentMetadataRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    document_metadata_registry_id: registry.document_metadata_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      document_metadata_id: record.document_metadata_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      document_type: record.document_type,
      approved_heading_form: record.approved_heading_form,
      variant_forms: record.variant_forms || [],
      date_line: record.date_line,
      subject_or_title: record.subject_or_title,
      sender_or_originator: record.sender_or_originator,
      recipient_or_audience: record.recipient_or_audience,
      attachment_behavior: record.attachment_behavior,
      source_note_basis: record.source_note_basis,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactClassificationRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    classification_registry_id: registry.classification_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      classification_item_id: record.classification_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      approved_marking: record.approved_marking,
      marking_components: record.marking_components || [],
      handling_controls: record.handling_controls || [],
      variant_forms: record.variant_forms || [],
      direct_edit_safe_variants: record.direct_edit_safe_variants || [],
      source_note_basis: record.source_note_basis,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactDeclassificationRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    declassification_registry_id: registry.declassification_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      declassification_id: record.declassification_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      declassification_type: record.declassification_type,
      approved_phrase: record.approved_phrase,
      quantity: record.quantity,
      quantity_unit: record.quantity_unit,
      review_outcome: record.review_outcome,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactTranslationRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    translation_registry_id: registry.translation_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      translation_id: record.translation_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      translation_type: record.translation_type,
      approved_phrase: record.approved_phrase,
      language_or_origin: record.language_or_origin,
      translation_status: record.translation_status,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactPrintedAttachmentRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    printed_attachment_registry_id: registry.printed_attachment_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      printed_attachment_id: record.printed_attachment_id,
      volume_id: record.volume_id,
      parent_document_id: record.parent_document_id,
      parent_document_number: record.parent_document_number,
      child_unit_label: record.child_unit_label,
      relationship_type: record.relationship_type,
      approved_phrase: record.approved_phrase,
      tab_or_attachment_label: record.tab_or_attachment_label,
      child_heading: record.child_heading,
      child_date_or_place: record.child_date_or_place,
      child_title_or_subject: record.child_title_or_subject,
      child_source_note_or_footnote: record.child_source_note_or_footnote,
      child_classification_or_marking: record.child_classification_or_marking,
      editorial_status: record.editorial_status,
      printed_target: record.printed_target,
      cross_reference_target: record.cross_reference_target,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactVisualMaterialRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    visual_material_registry_id: registry.visual_material_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      visual_material_id: record.visual_material_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      visual_type: record.visual_type,
      approved_phrase: record.approved_phrase,
      caption_or_title: record.caption_or_title,
      visual_description: record.visual_description,
      relationship_to_document: record.relationship_to_document,
      attachment_or_publication_status: record.attachment_or_publication_status,
      source_image_or_url: record.source_image_or_url,
      printed_target: record.printed_target,
      cross_reference_target: record.cross_reference_target,
      identification_basis: record.identification_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactHandwrittenTranscriptionRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    handwritten_transcription_registry_id: registry.handwritten_transcription_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      handwritten_item_id: record.handwritten_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      transcription_type: record.transcription_type,
      approved_phrase: record.approved_phrase,
      handwritten_source_status: record.handwritten_source_status,
      editor_transcription_basis: record.editor_transcription_basis,
      facsimile_or_appendix_target: record.facsimile_or_appendix_target,
      original_text_convention: record.original_text_convention,
      unclear_or_illegible_handling: record.unclear_or_illegible_handling,
      cut_off_or_missing_text: record.cut_off_or_missing_text,
      physical_location_or_margin: record.physical_location_or_margin,
      related_event_or_diary_basis: record.related_event_or_diary_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactDocumentHandlingRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    document_handling_registry_id: registry.document_handling_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      document_handling_id: record.document_handling_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      handling_type: record.handling_type,
      approved_phrase: record.approved_phrase,
      actor: record.actor,
      action: record.action,
      mark_location: record.mark_location,
      mark_text_or_summary: record.mark_text_or_summary,
      routing_or_decision_status: record.routing_or_decision_status,
      copy_or_transcription_status: record.copy_or_transcription_status,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactNegativeSearchRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    negative_search_registry_id: registry.negative_search_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      negative_search_id: record.negative_search_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      record_type: record.record_type,
      approved_phrase: record.approved_phrase,
      variant_forms: record.variant_forms || [],
      search_scope_or_basis: record.search_scope_or_basis,
      relationship_to_document: record.relationship_to_document,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactDocumentRelationshipRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    document_relationship_registry_id: registry.document_relationship_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      relationship_id: record.relationship_id,
      volume_id: record.volume_id,
      source_document_id: record.source_document_id,
      source_document_number: record.source_document_number,
      source_unit_label: record.source_unit_label,
      relationship_type: record.relationship_type,
      approved_phrase: record.approved_phrase,
      variant_forms: record.variant_forms || [],
      relationship_basis: record.relationship_basis,
      target_document_id: record.target_document_id,
      target_document_number: record.target_document_number,
      target_label: record.target_label,
      source_url: record.source_url,
      target_url: record.target_url,
      verification_status: record.verification_status
    }))
  };
}

function compactCommunicationsRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    communications_registry_id: registry.communications_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      communications_id: record.communications_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      communications_type: record.communications_type,
      approved_heading_form: record.approved_heading_form,
      message_identifier: record.message_identifier,
      special_designator: record.special_designator,
      origin: record.origin,
      addressees: record.addressees,
      date_time_line: record.date_time_line,
      date_time_group: record.date_time_group,
      subject_or_title: record.subject_or_title,
      source_family: record.source_family,
      source_note_form: record.source_note_form,
      classification_or_handling_summary: record.classification_or_handling_summary,
      drafting_clearance_approval: record.drafting_clearance_approval,
      reference_context: record.reference_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactChronologyRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    chronology_registry_id: registry.chronology_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      chronology_id: record.chronology_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      chronology_type: record.chronology_type,
      approved_phrase: record.approved_phrase,
      event_date: record.event_date,
      start_time: record.start_time,
      end_time: record.end_time,
      time_basis: record.time_basis,
      place: record.place,
      participants_or_actors: record.participants_or_actors,
      relationship_to_document: record.relationship_to_document,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactTimeZoneRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    time_zone_registry_id: registry.time_zone_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      time_zone_item_id: record.time_zone_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      time_claim_type: record.time_claim_type,
      approved_phrase: record.approved_phrase,
      source_time_basis: record.source_time_basis,
      display_time: record.display_time,
      conversion_status: record.conversion_status,
      chronological_placement: record.chronological_placement,
      event_or_document_context: record.event_or_document_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactSummitPublicEventRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.events) ? registry.events : [];
  return {
    schema_version: registry.schema_version,
    event_chronology_registry_id: registry.event_chronology_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    events: records.map((record) => ({
      event_id: record.event_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      event_family: record.event_family,
      event_type: record.event_type,
      approved_phrase: record.approved_phrase,
      date_span: record.date_span,
      place: record.place,
      public_source_basis: record.public_source_basis,
      schedule_or_diary_basis: record.schedule_or_diary_basis,
      related_full_record_target: record.related_full_record_target,
      press_or_ceremony_component: record.press_or_ceremony_component,
      participants_or_actors: record.participants_or_actors,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactSelectionBalanceRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    selection_balance_registry_id: registry.selection_balance_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      selection_item_id: record.selection_item_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      selection_issue_type: record.selection_issue_type,
      approved_phrase: record.approved_phrase,
      coverage_dimension: record.coverage_dimension,
      decision_point_or_scope: record.decision_point_or_scope,
      related_volume_or_target: record.related_volume_or_target,
      selection_status: record.selection_status,
      blocking_posture: record.blocking_posture,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactDecisionProcessRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    decision_process_registry_id: registry.decision_process_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      decision_process_id: record.decision_process_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      process_type: record.process_type,
      approved_phrase: record.approved_phrase,
      process_identifier: record.process_identifier,
      process_body: record.process_body,
      decision_stage: record.decision_stage,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactPublicSourceRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    public_source_registry_id: registry.public_source_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      public_source_id: record.public_source_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      public_source_type: record.public_source_type,
      approved_phrase: record.approved_phrase,
      public_event_or_document: record.public_event_or_document,
      publication_or_broadcast_basis: record.publication_or_broadcast_basis,
      delivery_or_release_date: record.delivery_or_release_date,
      selected_or_supplemental_status: record.selected_or_supplemental_status,
      full_text_or_source_target: record.full_text_or_source_target,
      archival_or_draft_context: record.archival_or_draft_context,
      relationship_to_document: record.relationship_to_document,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactRetrospectiveAccountRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    retrospective_account_registry_id: registry.retrospective_account_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      retrospective_account_id: record.retrospective_account_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      record_type: record.record_type,
      approved_phrase: record.approved_phrase,
      account_author_or_source: record.account_author_or_source,
      publication_or_collection: record.publication_or_collection,
      page_or_locator: record.page_or_locator,
      event_or_document_described: record.event_or_document_described,
      official_record_relationship: record.official_record_relationship,
      selected_or_supplemental_status: record.selected_or_supplemental_status,
      corroborating_record: record.corroborating_record,
      conflict_status: record.conflict_status,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactTreatyRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    treaty_registry_id: registry.treaty_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      treaty_id: record.treaty_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      treaty_component_type: record.treaty_component_type,
      approved_phrase: record.approved_phrase,
      instrument_or_package: record.instrument_or_package,
      component_label: record.component_label,
      signature_or_publication_date: record.signature_or_publication_date,
      publication_or_source_basis: record.publication_or_source_basis,
      selected_or_supplemental_status: record.selected_or_supplemental_status,
      integral_or_associated_status: record.integral_or_associated_status,
      legal_status_or_process: record.legal_status_or_process,
      relationship_to_document: record.relationship_to_document,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactForeignOrgRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    foreign_org_registry_id: registry.foreign_org_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      foreign_org_id: record.foreign_org_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      entity_type: record.entity_type,
      approved_phrase: record.approved_phrase,
      entity_or_body: record.entity_or_body,
      country_or_region: record.country_or_region,
      role_or_context: record.role_or_context,
      identity_basis: record.identity_basis,
      selected_or_supplemental_status: record.selected_or_supplemental_status,
      relationship_to_document: record.relationship_to_document,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactCongressionalLegalRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    congressional_legal_registry_id: registry.congressional_legal_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      congressional_legal_id: record.congressional_legal_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      legal_type: record.legal_type,
      approved_phrase: record.approved_phrase,
      legal_instrument_or_body: record.legal_instrument_or_body,
      legal_action_or_stage: record.legal_action_or_stage,
      citation_or_locator: record.citation_or_locator,
      public_or_archival_basis: record.public_or_archival_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactEconomicFinancialRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    economic_financial_registry_id: registry.economic_financial_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      economic_financial_id: record.economic_financial_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      financial_type: record.financial_type,
      approved_phrase: record.approved_phrase,
      institution_or_program: record.institution_or_program,
      amount_or_metric: record.amount_or_metric,
      policy_context: record.policy_context,
      citation_or_locator: record.citation_or_locator,
      public_or_archival_basis: record.public_or_archival_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactMilitaryCrisisRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    military_crisis_registry_id: registry.military_crisis_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      military_crisis_id: record.military_crisis_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      military_type: record.military_type,
      approved_phrase: record.approved_phrase,
      operation_or_crisis: record.operation_or_crisis,
      actor_or_force: record.actor_or_force,
      stage_or_role: record.stage_or_role,
      chronology_or_location_basis: record.chronology_or_location_basis,
      citation_or_locator: record.citation_or_locator,
      public_or_archival_basis: record.public_or_archival_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactIntelligenceLawEnforcementRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    intelligence_law_enforcement_registry_id: registry.intelligence_law_enforcement_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      intelligence_law_enforcement_id: record.intelligence_law_enforcement_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      ile_type: record.ile_type,
      approved_phrase: record.approved_phrase,
      case_or_program: record.case_or_program,
      agency_or_actor: record.agency_or_actor,
      stage_or_role: record.stage_or_role,
      chronology_or_jurisdiction_basis: record.chronology_or_jurisdiction_basis,
      citation_or_locator: record.citation_or_locator,
      public_or_archival_basis: record.public_or_archival_basis,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactHumanRightsRefugeeGlobalIssuesRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    human_rights_refugee_global_issues_registry_id: registry.human_rights_refugee_global_issues_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      humanitarian_id: record.humanitarian_id,
      volume_id: record.volume_id,
      document_id: record.document_id,
      document_number: record.document_number,
      unit_scope: record.unit_scope,
      record_type: record.record_type,
      approved_phrase: record.approved_phrase,
      issue_area: record.issue_area,
      institution_or_actor: record.institution_or_actor,
      source_family: record.source_family,
      public_or_archival_basis: record.public_or_archival_basis,
      legal_or_program_basis: record.legal_or_program_basis,
      quantity_or_metric: record.quantity_or_metric,
      stage_or_status: record.stage_or_status,
      source_or_context: record.source_or_context,
      variant_forms: record.variant_forms || [],
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactFootnoteReferbackRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    footnote_referback_registry_id: registry.footnote_referback_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    repeat_threshold: registry.repeat_threshold,
    repeat_threshold_action: registry.repeat_threshold_action || "",
    target_volume: targetVolume,
    target_records: targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [],
    records: records.map((record) => ({
      referback_id: record.referback_id,
      volume_id: record.volume_id,
      source_document_id: record.source_document_id,
      source_document_number: record.source_document_number,
      source_unit_label: record.source_unit_label,
      referback_type: record.referback_type,
      approved_phrase: record.approved_phrase,
      variant_forms: record.variant_forms || [],
      target_references: record.target_references || [],
      rule_basis: record.rule_basis,
      source_url: record.source_url,
      verification_status: record.verification_status
    }))
  };
}

function compactRecurringRiskRegistry(registry) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  return {
    schema_version: registry.schema_version,
    recurring_risk_registry_id: registry.recurring_risk_registry_id,
    captured_at: registry.captured_at,
    source_basis: registry.source_basis || "",
    scope: registry.scope || "",
    records: records.map((record) => ({
      risk_id: record.risk_id,
      risk_family: record.risk_family,
      title: record.title,
      anti_pattern: record.anti_pattern,
      approved_practice: record.approved_practice,
      unit_types: record.unit_types || [],
      detector_patterns: record.detector_patterns || [],
      direct_edit_policy: record.direct_edit_policy,
      evidence_request: record.evidence_request,
      comment_template: record.comment_template,
      severity: record.severity,
      source_basis: record.source_basis,
      variant_forms: record.variant_forms || []
    }))
  };
}

function compactAnnotationSheetProfile(profile) {
  if (!profile) return null;
  return {
    schema_version: profile.schema_version,
    profile_id: profile.profile_id,
    captured_at: profile.captured_at,
    source_label: profile.source_label,
    source_basis: profile.source_basis || {},
    style_policy: profile.style_policy || {},
    pseudo_marker_policy: profile.pseudo_marker_policy || {},
    lexical_unit_patterns: profile.lexical_unit_patterns || [],
    profile_checks: profile.profile_checks || []
  };
}

function renderPacket({
  chunk,
  manifest,
  guide,
  schema,
  annotationSheetProfile,
  statusRegistry,
  statusClaims,
  authorityRegistry,
  sourceListRegistry,
  documentMetadataRegistry,
  classificationRegistry,
  declassificationRegistry,
  translationRegistry,
  printedAttachmentRegistry,
  visualMaterialRegistry,
  handwrittenTranscriptionRegistry,
  documentHandlingRegistry,
  chronologyRegistry,
  timeZoneRegistry,
  summitPublicEventRegistry,
  selectionBalanceRegistry,
  decisionProcessRegistry,
  publicSourceRegistry,
  retrospectiveAccountRegistry,
  treatyRegistry,
  foreignOrgRegistry,
  congressionalLegalRegistry,
  economicFinancialRegistry,
  militaryCrisisRegistry,
  intelligenceLawEnforcementRegistry,
  humanRightsRefugeeGlobalIssuesRegistry,
  footnoteReferbackRegistry,
  recurringRiskRegistry,
  negativeSearchRegistry,
  documentRelationshipRegistry,
  communicationsRegistry,
  router,
  matrix
}) {
  const chunkUnitsDocument = {
    schema_version: "frus-extracted-units-v1",
    source: `Chunk ${chunk.chunk_id} extracted units from ${manifest.source_files.units}`,
    units: chunk.units
  };
  const chunkClaims = subsetStatusClaims(statusClaims, chunk.unit_ids);
  return [
    "# FRUS Annotation Review Packet Chunk",
    "",
    `- run_id: ${manifest.run_id}`,
    `- chunk_id: ${chunk.chunk_id}`,
    `- chunk_index: ${chunk.chunk_index}`,
    `- chunk_count: ${manifest.chunk_count}`,
    `- unit_id_range: ${chunk.first_unit_id} to ${chunk.last_unit_id}`,
    `- target_volume: ${manifest.target_volume || "not supplied"}`,
    "",
    "Return only one valid `checker-output-v1` JSON object for this chunk. Every reviewable unit in this chunk needs a checker entry; use `no_change` when the unit is sound.",
    "",
    "Do not include units outside this chunk. Do not claim to edit the Word file directly. The wrapper will merge and validate chunk outputs before applying Word comments or tracked changes.",
    "",
    "## Chunk Manifest",
    "",
    fencedJson({
      schema_version: "frus-llm-review-chunk-v1",
      run_id: manifest.run_id,
      chunk_id: chunk.chunk_id,
      chunk_index: chunk.chunk_index,
      chunk_count: manifest.chunk_count,
      unit_ids: chunk.unit_ids,
      reviewable_unit_ids: chunk.reviewable_unit_ids
    }),
    "",
    "## Runtime FRUS Annotation Checker Guide",
    "",
    guide.trim(),
    "",
    "## Output JSON Schema",
    "",
    fencedJson(schema),
    "",
    "## Extracted Word Units For This Chunk",
    "",
    fencedJson(chunkUnitsDocument),
    "",
    "## Annotation Sheet Profile Context",
    "",
    "Use this to recognize finished-form FRUS annotation-sheet structure when Word styles are flat. Lexical FRUS apparatus patterns outrank Word paragraph styles. Preserve or reversibly map production pseudo-markers; use comment-only when a direct edit would touch or split them.",
    "",
    fencedJson(annotationSheetProfile || {}),
    "",
    "## Extracted Status Claims For This Chunk",
    "",
    fencedJson(chunkClaims || {}),
    "",
    "## Status Registry Context",
    "",
    fencedJson(statusRegistry || {}),
    "",
    "## Authority Registry Context",
    "",
    fencedJson(authorityRegistry || {}),
    "",
    "## Source List And Front Matter Registry Context",
    "",
    fencedJson(sourceListRegistry || {}),
    "",
    "## Document Metadata Registry Context",
    "",
    fencedJson(documentMetadataRegistry || {}),
    "",
    "## Classification And Handling Registry Context",
    "",
    "Use this to check original classification markings, handling controls, and verified absence-of-marking phrases. Do not confuse original markings with later release, redaction, or declassification status. Treat cross-volume or variant classification forms as comment-only unless the registry proves the direct edit.",
    "",
    fencedJson(classificationRegistry || {}),
    "",
    "## Declassification And Omission Registry Context",
    "",
    "Use this to check bracketed omission quantities, pages not declassified, handling-restriction-not-declassified phrases, whole-document withholdings, and About the Series review-statistics language. Do not change omission quantities, bracket wording, page counts, or review statistics unless the registry proves the direct edit.",
    "",
    fencedJson(declassificationRegistry || {}),
    "",
    "## Translation And Foreign-Origin Registry Context",
    "",
    "Use this to check official, unofficial, informal, Language Services, editor-transcribed, original-language, foreign-copy, and foreign-text-in-file apparatus. Do not simplify translation status, original-language basis, foreign-copy provenance, or selected-versus-supplemental foreign-origin records unless the registry proves the direct edit.",
    "",
    fencedJson(translationRegistry || {}),
    "",
    "## Printed And Nested Attachment Registry Context",
    "",
    "Use this to check printed-in-parent child papers, attached-but-not-printed details, printed-as-document targets, tab/enclosure labels, child headings, child date/place lines, child source notes, child classification markings, and parent-child maps. Do not change printed targets, child apparatus, tab labels, or attached/not-printed status unless the registry proves the direct edit.",
    "",
    fencedJson(printedAttachmentRegistry || {}),
    "",
    "## Visual Material Registry Context",
    "",
    "Use this to check maps, photographs, charts, images, graphic attachments, appendix images, captions, visual titles, not-found/not-attached visual items, visual descriptions, source-image references, printed targets, and person/object/place identification. Do not change captions, image links, visual descriptions, or attachment/not-found status unless the registry proves the direct edit.",
    "",
    fencedJson(visualMaterialRegistry || {}),
    "",
    "## Handwritten And Facsimile Transcription Registry Context",
    "",
    "Use this to check handwritten notes and letters, editor-transcribed portions, original brackets and ellipses, unclear or illegible readings, cut-off lines, appendix or facsimile images, marginalia and transcribed margin notes, source-image basis, and reverse appendix targets. Treat transcription status, original-bracket or ellipsis claims, uncertain readings, image or appendix target, cut-off or missing-text claims, and marginalia wording as comment-only unless the target-volume handwritten/facsimile registry proves the exact direct edit.",
    "",
    fencedJson(handwrittenTranscriptionRegistry || {}),
    "",
    "## Document Handling And Marginalia Registry Context",
    "",
    "Use this to check initials, handwritten marginalia, underlining, checkmarks, stamped notations, saw notations, sent-for-action/sent-for-information routing, copy status, bracket/original-status phrases, and approval/disapproval language. Do not change document-face handling, mark locations, actors, routing status, or copy status unless the registry proves the direct edit.",
    "",
    fencedJson(documentHandlingRegistry || {}),
    "",
    "## Chronology And Time Registry Context",
    "",
    "Use this to check President's Daily Diary, meeting-time, call-time, no-precise-time, actual-versus-planned, diary/schedule, place, attendance, and event-sequence language. Do not change times, dates, places, attendance, sequence, or no-minutes/no-precise-time caveats unless the target-volume chronology registry proves the direct edit.",
    "",
    fencedJson(chronologyRegistry || {}),
    "",
    "## Time-Zone And Date-Time Group Registry Context",
    "",
    "Use this to check Washington-time rules, local-time labels, GMT/Z/Zulu date-time groups, EST/EDT labels, no-precise-time caveats, deadlines, treaty timing rules, and chronological placement. Preserve time labels exactly; do not convert, drop `Z`, add local time, or move a document chronologically unless the target-volume time-zone registry proves the direct edit.",
    "",
    fencedJson(timeZoneRegistry || {}),
    "",
    "## Summit Travel And Public Event Registry Context",
    "",
    "Use this to check summit travel, public signing ceremonies, public remarks, news conferences, interviews, public addresses, United Nations addresses, toasts, arrival/departure events, public-source basis, diary/schedule basis, press basis, event sequence, participants, place, date/time, and full-record-elsewhere targets. Treat event date, time, place, sequence, participant, public-source basis, press basis, diary/schedule basis, time-zone relationship, and full-record target as comment-only unless the target-volume summit/public-event registry proves the exact direct edit.",
    "",
    fencedJson(summitPublicEventRegistry || {}),
    "",
    "## Selection Balance And Completeness Registry Context",
    "",
    "Use this to check principles of selection, chapter or volume scope, excerpted portions, omitted non-scope material, related-volume boundaries, scheduled-publication targets, complete-record-elsewhere claims, withheld-document effects, and known gaps. Treat complete, balanced, representative, or no-other-record claims as comment-only unless target-volume selection-balance evidence and General Editor review support the claim.",
    "",
    fencedJson(selectionBalanceRegistry || {}),
    "",
    "## Decision Process And Directive Registry Context",
    "",
    "Use this to check NSR, NSD, NSDD, NSSD, PCC, DC, NSC meeting, tab, tasking, record-of-decision, interagency-paper, directive-heading, scheduled-publication, and decision-stage language. Treat directive numbers, committee/body names, tabs, and decision stages as comment-only unless the target-volume decision-process registry proves the exact direct edit.",
    "",
    fencedJson(decisionProcessRegistry || {}),
    "",
    "## Public Source And Public Diplomacy Registry Context",
    "",
    "Use this to check speeches, public remarks, press releases, press conferences, briefings, interviews, broadcasts, testimony, Public Papers, Department of State Bulletin/Dispatch, Congressional Record, official transcripts, newspaper excerpts, full-text targets, archival draft or briefing-file context, diary context, and selected-versus-supplemental public-source status. Do not change publication details, delivery or broadcast basis, full-text targets, archival draft context, or selected-public-document status unless the target-volume public-source registry proves the direct edit.",
    "",
    fencedJson(publicSourceRegistry || {}),
    "",
    "## Retrospective Account Registry Context",
    "",
    "Use this to check memoirs, published or personal diaries, oral histories, later interviews, recollections, press retrospectives, newspaper accounts, author/source, publication, page locator, event match, selected-versus-supplemental status, official-record relationship, corroborating records, and conflict status. Do not let retrospective accounts replace official records; use comment-only unless the target-volume retrospective-account registry proves the exact direct edit.",
    "",
    fencedJson(retrospectiveAccountRegistry || {}),
    "",
    "## Treaty And Legal Instrument Registry Context",
    "",
    "Use this to check treaty text, protocols, annexes, memoranda of understanding, associated-but-not-integral documents, Senate transmittal packages, ratification, entry-into-force, legal-authority, and draft treaty-package language. Do not change component identity, integral/associated status, source basis, legal process, ratification, or entry-into-force language unless the target-volume treaty registry proves the direct edit.",
    "",
    fencedJson(treatyRegistry || {}),
    "",
    "## Foreign And International Organization Registry Context",
    "",
    "Use this to check country names, successor-state references, alliances, international organizations, regional bodies, summit/conference names, international financial institutions, trade regimes, UN resolution forms, and treaty-party language. Do not change entity identity, acronym expansion, body role, successor-state status, treaty-party status, or translation/authority basis unless the target-volume foreign-org registry proves the direct edit.",
    "",
    fencedJson(foreignOrgRegistry || {}),
    "",
    "## Congressional And Legal Authority Registry Context",
    "",
    "Use this to check Senate advice-and-consent, Senate information packages, treaty transmittal and ratification footnotes, congressional hearings, public-law/statute citations, appropriations and authorizations, budget authority, budget rescissions and deferrals, congressional notices, Presidential Determinations, Arms Export Control Act language, and Federal Register publication claims. Treat committee names, hearing titles, public-law numbers, Stat. citations, budget figures, advice-and-consent status, and publication-stage claims as comment-only unless the target-volume congressional/legal registry proves the exact direct edit.",
    "",
    fencedJson(congressionalLegalRegistry || {}),
    "",
    "## Economic And Financial Registry Context",
    "",
    "Use this to check dollar amounts, percentages, debt metrics, IMF quotas and resources, General Arrangements to Borrow, World Bank and MDB funding, Paris Club debt relief, Baker Plan references, Eximbank/OPIC/ESF/AID program labels, arrears, loans, grants, budget claims, trade-finance, exchange-rate, commodity-policy, and foreign economic policy scope language. Treat figures, institution names, program labels, debt-relief mechanics, and policy-plan labels as comment-only unless the target-volume economic/financial registry proves the exact direct edit.",
    "",
    fencedJson(economicFinancialRegistry || {}),
    "",
    "## Military And Crisis Operations Registry Context",
    "",
    "Use this to check operation names, Gulf of Sidra/Bay of Sidra and Persian Gulf freedom-of-navigation claims, force presence, naval incidents, shootdowns/intercepts, military assistance and FMS/IMET terms, Sixth Fleet/command references, Libyan CW/Rabta language, inspection/verification or dismantlement claims, host-nation/base-access, evacuation/embassy-security, and crisis chronology. Treat operation labels, aircraft/force identities, deployment claims, CW capability language, ROE, and legal/notification posture as comment-only unless the target-volume military/crisis registry proves the exact direct edit.",
    "",
    fencedJson(militaryCrisisRegistry || {}),
    "",
    "## Intelligence And Law Enforcement Registry Context",
    "",
    "Use this to check CIA, INR, National Intelligence Council, intelligence-source/handling, covert/sensitive-source, counterterrorism, terrorist-incident, hostage/hijacking, arrest-warrant, Interpol, extradition/prosecution, FBI/DEA liaison, counternarcotics, narcoterrorism, and Department of Justice language. Treat agency identity, intelligence basis, sensitive-source posture, case status, jurisdiction, terrorist-incident chronology, prosecution/extradition posture, and counternarcotics claims as comment-only unless the target-volume intelligence/law-enforcement registry proves the exact direct edit.",
    "",
    fencedJson(intelligenceLawEnforcementRegistry || {}),
    "",
    "## Human Rights Refugee And Global Issues Registry Context",
    "",
    "Use this to check human-rights reports, Country Reports, refugee, immigration, asylum, migration, famine, emergency relief, food aid, PL 480, Section 416/206, AID/USAID, PRM, HA/HR/IO, WHO/UNICEF/UNDRO/UNEP/WMO, AIDS/HIV, population/UNFPA, environmental/ozone/CFC, whaling, sanctions, waiver, certification, determination, public-report, international-organization, PVO, and global-issues language. Treat report basis, country/population scope, relief stage, legal/program authority, amount/metric, public/archival basis, international-organization role, PVO role, sanctions/waiver status, and environmental/treaty status as comment-only unless the target-volume registry proves the exact direct edit.",
    "",
    fencedJson(humanRightsRefugeeGlobalIssuesRegistry || {}),
    "",
    "## Footnote Refer-Back Registry Context",
    "",
    "Use this to check repeated-reference footnote discipline in follow-on footnotes and source notes. Reagan Foundations models cross-document `footnote N, Document X`, same-document `above` or local above-context, and `Document X and footnote Y thereto`; Document 146 separately models a three-target footnote/document cluster. Apply the registry `repeat_threshold`: the first and second full citation occurrences may stand, but the third full citation occurrence itself and every later full citation occurrence, including plain source-note citations outside parentheses, are production-review triggers for a possible refer-back. Do not wait for a fourth occurrence. Do not invent refer-back targets; use comment-only unless the registry proves the exact direct edit.",
    "",
    fencedJson(footnoteReferbackRegistry || {}),
    "",
    "## Recurring Compiler Risk Registry Context",
    "",
    "Use this as a practical spellcheck list for recurring compiler mistakes: leading-zero telegram numbers, non-State telegram copies without eRecords/drafting checks, incomplete cross-reference slugs, missing page breaks, old heading-footnote practice, Word autoformatting, incomplete documents or source notes, unhighlighted quoted backup text, missing telegram headers/film numbers, and Style Guide inconsistency. Treat these as generalized risk checks, not as personal criticism.",
    "",
    fencedJson(recurringRiskRegistry || {}),
    "",
    "## Negative Search And No-Record Registry Context",
    "",
    "Use this to check `No minutes were found`, `Not found`, `Not attached`, `Not found attached`, no-memcon/no-telcon, missing-attachment, and RAC attachment-ambiguity language. Do not collapse one no-record relationship into another unless the registry proves the direct edit.",
    "",
    fencedJson(negativeSearchRegistry || {}),
    "",
    "## Document Relationship Registry Context",
    "",
    "Use this to check `Attached but not printed`, `Printed as Document [n]`, `See Document [n]`, tab/enclosure references, not-attached items, and mixed attachment notes. Do not change target document numbers, tab labels, or attachment status unless the registry proves the same source-document relationship.",
    "",
    fencedJson(documentRelationshipRegistry || {}),
    "",
    "## Communications Metadata Registry Context",
    "",
    "Use this to check telegram/cable/message identifiers, SECTO/TOSEC/special designators, origin/addressee lines, date-time groups, source-family electronic telegram identifiers, precedence/routing, and drafting/clearance/approval strings. Do not change identifiers, date-time groups, origin/addressee, or precedence unless the registry proves the direct edit.",
    "",
    fencedJson(communicationsRegistry || {}),
    "",
    "## Preparation Router Context",
    "",
    fencedJson(router || {}),
    "",
    "## Permutation Matrix Context",
    "",
    fencedJson(matrix || {}),
    "",
    "## Final Output Reminder",
    "",
    "Return only one JSON object with top-level keys: `schema_version`, `document_assessment`, `batch_readiness`, `checks`, `global_comments`, and `style_discrepancy_tally`."
  ].join("\n") + "\n";
}

function buildChunks(options) {
  const unitsDocument = readJson(options.unitsPath);
  const errors = validateUnits(unitsDocument, options.unitsPath);
  if (errors.length > 0) throw new Error(errors.join("\n"));

  const guide = readText(options.guidePath);
  const schema = readJson(options.schemaPath);
  const annotationSheetProfile = options.annotationSheetProfilePath ? readJson(options.annotationSheetProfilePath) : null;
  const statusRegistry = options.statusRegistryPath ? readJson(options.statusRegistryPath) : null;
  const statusClaims = options.statusClaimsPath ? readJson(options.statusClaimsPath) : null;
  const authorityRegistry = options.authorityRegistryPath ? readJson(options.authorityRegistryPath) : null;
  const sourceListRegistry = options.sourceListRegistryPath ? readJson(options.sourceListRegistryPath) : null;
  const documentMetadataRegistry = options.documentMetadataRegistryPath ? readJson(options.documentMetadataRegistryPath) : null;
  const classificationRegistry = options.classificationRegistryPath ? readJson(options.classificationRegistryPath) : null;
  const declassificationRegistry = options.declassificationRegistryPath
    ? readJson(options.declassificationRegistryPath)
    : null;
  const translationRegistry = options.translationRegistryPath ? readJson(options.translationRegistryPath) : null;
  const printedAttachmentRegistry = options.printedAttachmentRegistryPath
    ? readJson(options.printedAttachmentRegistryPath)
    : null;
  const visualMaterialRegistry = options.visualMaterialRegistryPath ? readJson(options.visualMaterialRegistryPath) : null;
  const handwrittenTranscriptionRegistry = options.handwrittenTranscriptionRegistryPath
    ? readJson(options.handwrittenTranscriptionRegistryPath)
    : null;
  const documentHandlingRegistry = options.documentHandlingRegistryPath ? readJson(options.documentHandlingRegistryPath) : null;
  const negativeSearchRegistry = options.negativeSearchRegistryPath ? readJson(options.negativeSearchRegistryPath) : null;
  const documentRelationshipRegistry = options.documentRelationshipRegistryPath
    ? readJson(options.documentRelationshipRegistryPath)
    : null;
  const communicationsRegistry = options.communicationsRegistryPath ? readJson(options.communicationsRegistryPath) : null;
  const chronologyRegistry = options.chronologyRegistryPath ? readJson(options.chronologyRegistryPath) : null;
  const timeZoneRegistry = options.timeZoneRegistryPath ? readJson(options.timeZoneRegistryPath) : null;
  const summitPublicEventRegistry = options.summitPublicEventRegistryPath
    ? readJson(options.summitPublicEventRegistryPath)
    : null;
  const selectionBalanceRegistry = options.selectionBalanceRegistryPath ? readJson(options.selectionBalanceRegistryPath) : null;
  const decisionProcessRegistry = options.decisionProcessRegistryPath
    ? readJson(options.decisionProcessRegistryPath)
    : null;
  const publicSourceRegistry = options.publicSourceRegistryPath ? readJson(options.publicSourceRegistryPath) : null;
  const retrospectiveAccountRegistry = options.retrospectiveAccountRegistryPath
    ? readJson(options.retrospectiveAccountRegistryPath)
    : null;
  const treatyRegistry = options.treatyRegistryPath ? readJson(options.treatyRegistryPath) : null;
  const foreignOrgRegistry = options.foreignOrgRegistryPath ? readJson(options.foreignOrgRegistryPath) : null;
  const congressionalLegalRegistry = options.congressionalLegalRegistryPath
    ? readJson(options.congressionalLegalRegistryPath)
    : null;
  const economicFinancialRegistry = options.economicFinancialRegistryPath
    ? readJson(options.economicFinancialRegistryPath)
    : null;
  const militaryCrisisRegistry = options.militaryCrisisRegistryPath ? readJson(options.militaryCrisisRegistryPath) : null;
  const intelligenceLawEnforcementRegistry = options.intelligenceLawEnforcementRegistryPath
    ? readJson(options.intelligenceLawEnforcementRegistryPath)
    : null;
  const humanRightsRefugeeGlobalIssuesRegistry = options.humanRightsRefugeeGlobalIssuesRegistryPath
    ? readJson(options.humanRightsRefugeeGlobalIssuesRegistryPath)
    : null;
  const footnoteReferbackRegistry = options.footnoteReferbackRegistryPath
    ? readJson(options.footnoteReferbackRegistryPath)
    : null;
  const recurringRiskRegistry = options.recurringRiskRegistryPath ? readJson(options.recurringRiskRegistryPath) : null;
  const router = options.preparationRouterPath ? readJson(options.preparationRouterPath) : null;
  const matrix = options.permutationMatrixPath ? readJson(options.permutationMatrixPath) : null;
  const authorityRegistryContext = compactAuthorityRegistry(authorityRegistry, options.targetVolume);
  const sourceListRegistryContext = compactSourceListRegistry(sourceListRegistry, options.targetVolume);
  const documentMetadataRegistryContext = compactDocumentMetadataRegistry(documentMetadataRegistry, options.targetVolume);
  const classificationRegistryContext = compactClassificationRegistry(classificationRegistry, options.targetVolume);
  const declassificationRegistryContext = compactDeclassificationRegistry(
    declassificationRegistry,
    options.targetVolume
  );
  const translationRegistryContext = compactTranslationRegistry(translationRegistry, options.targetVolume);
  const printedAttachmentRegistryContext = compactPrintedAttachmentRegistry(
    printedAttachmentRegistry,
    options.targetVolume
  );
  const visualMaterialRegistryContext = compactVisualMaterialRegistry(visualMaterialRegistry, options.targetVolume);
  const handwrittenTranscriptionRegistryContext = compactHandwrittenTranscriptionRegistry(
    handwrittenTranscriptionRegistry,
    options.targetVolume
  );
  const documentHandlingRegistryContext = compactDocumentHandlingRegistry(documentHandlingRegistry, options.targetVolume);
  const negativeSearchRegistryContext = compactNegativeSearchRegistry(negativeSearchRegistry, options.targetVolume);
  const documentRelationshipRegistryContext = compactDocumentRelationshipRegistry(
    documentRelationshipRegistry,
    options.targetVolume
  );
  const communicationsRegistryContext = compactCommunicationsRegistry(communicationsRegistry, options.targetVolume);
  const chronologyRegistryContext = compactChronologyRegistry(chronologyRegistry, options.targetVolume);
  const timeZoneRegistryContext = compactTimeZoneRegistry(timeZoneRegistry, options.targetVolume);
  const summitPublicEventRegistryContext = compactSummitPublicEventRegistry(
    summitPublicEventRegistry,
    options.targetVolume
  );
  const selectionBalanceRegistryContext = compactSelectionBalanceRegistry(
    selectionBalanceRegistry,
    options.targetVolume
  );
  const decisionProcessRegistryContext = compactDecisionProcessRegistry(
    decisionProcessRegistry,
    options.targetVolume
  );
  const publicSourceRegistryContext = compactPublicSourceRegistry(publicSourceRegistry, options.targetVolume);
  const retrospectiveAccountRegistryContext = compactRetrospectiveAccountRegistry(
    retrospectiveAccountRegistry,
    options.targetVolume
  );
  const treatyRegistryContext = compactTreatyRegistry(treatyRegistry, options.targetVolume);
  const foreignOrgRegistryContext = compactForeignOrgRegistry(foreignOrgRegistry, options.targetVolume);
  const congressionalLegalRegistryContext = compactCongressionalLegalRegistry(
    congressionalLegalRegistry,
    options.targetVolume
  );
  const economicFinancialRegistryContext = compactEconomicFinancialRegistry(
    economicFinancialRegistry,
    options.targetVolume
  );
  const militaryCrisisRegistryContext = compactMilitaryCrisisRegistry(militaryCrisisRegistry, options.targetVolume);
  const intelligenceLawEnforcementRegistryContext = compactIntelligenceLawEnforcementRegistry(
    intelligenceLawEnforcementRegistry,
    options.targetVolume
  );
  const humanRightsRefugeeGlobalIssuesRegistryContext = compactHumanRightsRefugeeGlobalIssuesRegistry(
    humanRightsRefugeeGlobalIssuesRegistry,
    options.targetVolume
  );
  const footnoteReferbackRegistryContext = compactFootnoteReferbackRegistry(
    footnoteReferbackRegistry,
    options.targetVolume
  );
  const recurringRiskRegistryContext = compactRecurringRiskRegistry(recurringRiskRegistry);
  const annotationSheetProfileContext = compactAnnotationSheetProfile(annotationSheetProfile);
  const unitChunks = chunkUnits(unitsDocument.units, options.maxUnits, options.maxChars);

  fs.mkdirSync(options.outDir, { recursive: true });
  const manifest = {
    schema_version: "frus-llm-chunk-manifest-v1",
    generated_at: new Date().toISOString(),
    run_id: options.runId,
    target_volume: options.targetVolume,
    chunk_count: unitChunks.length,
    source_files: {
      units: normalizePathForOutput(options.unitsPath),
      guide: normalizePathForOutput(options.guidePath),
      schema: normalizePathForOutput(options.schemaPath),
      annotation_sheet_profile: options.annotationSheetProfilePath ? normalizePathForOutput(options.annotationSheetProfilePath) : "",
      status_registry: options.statusRegistryPath ? normalizePathForOutput(options.statusRegistryPath) : "",
      status_claims: options.statusClaimsPath ? normalizePathForOutput(options.statusClaimsPath) : "",
      authority_registry: options.authorityRegistryPath ? normalizePathForOutput(options.authorityRegistryPath) : "",
      source_list_registry: options.sourceListRegistryPath ? normalizePathForOutput(options.sourceListRegistryPath) : "",
      document_metadata_registry: options.documentMetadataRegistryPath ? normalizePathForOutput(options.documentMetadataRegistryPath) : "",
      classification_registry: options.classificationRegistryPath ? normalizePathForOutput(options.classificationRegistryPath) : "",
      declassification_registry: options.declassificationRegistryPath ? normalizePathForOutput(options.declassificationRegistryPath) : "",
      translation_registry: options.translationRegistryPath ? normalizePathForOutput(options.translationRegistryPath) : "",
      printed_attachment_registry: options.printedAttachmentRegistryPath ? normalizePathForOutput(options.printedAttachmentRegistryPath) : "",
      visual_material_registry: options.visualMaterialRegistryPath ? normalizePathForOutput(options.visualMaterialRegistryPath) : "",
      handwritten_transcription_registry: options.handwrittenTranscriptionRegistryPath
        ? normalizePathForOutput(options.handwrittenTranscriptionRegistryPath)
        : "",
      document_handling_registry: options.documentHandlingRegistryPath ? normalizePathForOutput(options.documentHandlingRegistryPath) : "",
      chronology_registry: options.chronologyRegistryPath ? normalizePathForOutput(options.chronologyRegistryPath) : "",
      time_zone_registry: options.timeZoneRegistryPath ? normalizePathForOutput(options.timeZoneRegistryPath) : "",
      summit_public_event_registry: options.summitPublicEventRegistryPath
        ? normalizePathForOutput(options.summitPublicEventRegistryPath)
        : "",
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
      congressional_legal_registry: options.congressionalLegalRegistryPath
        ? normalizePathForOutput(options.congressionalLegalRegistryPath)
        : "",
      economic_financial_registry: options.economicFinancialRegistryPath
        ? normalizePathForOutput(options.economicFinancialRegistryPath)
        : "",
      military_crisis_registry: options.militaryCrisisRegistryPath
        ? normalizePathForOutput(options.militaryCrisisRegistryPath)
        : "",
      intelligence_law_enforcement_registry: options.intelligenceLawEnforcementRegistryPath
        ? normalizePathForOutput(options.intelligenceLawEnforcementRegistryPath)
        : "",
      human_rights_refugee_global_issues_registry: options.humanRightsRefugeeGlobalIssuesRegistryPath
        ? normalizePathForOutput(options.humanRightsRefugeeGlobalIssuesRegistryPath)
        : "",
      footnote_referback_registry: options.footnoteReferbackRegistryPath
        ? normalizePathForOutput(options.footnoteReferbackRegistryPath)
        : "",
      recurring_risk_registry: options.recurringRiskRegistryPath ? normalizePathForOutput(options.recurringRiskRegistryPath) : "",
      negative_search_registry: options.negativeSearchRegistryPath ? normalizePathForOutput(options.negativeSearchRegistryPath) : "",
      document_relationship_registry: options.documentRelationshipRegistryPath ? normalizePathForOutput(options.documentRelationshipRegistryPath) : "",
      communications_registry: options.communicationsRegistryPath ? normalizePathForOutput(options.communicationsRegistryPath) : "",
      preparation_router: options.preparationRouterPath ? normalizePathForOutput(options.preparationRouterPath) : "",
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : ""
    },
    limits: {
      max_units: options.maxUnits,
      max_chars: options.maxChars
    },
    summary: {
      units_total: unitsDocument.units.length,
      reviewable_units: unitsDocument.units.filter(reviewRequired).length,
      annotation_sheet_profile_checks: annotationSheetProfile?.profile_checks?.length || 0,
      authority_registry_records: authorityRegistry?.records?.length || 0,
      source_list_registry_records: sourceListRegistry?.records?.length || 0,
      document_metadata_registry_records: documentMetadataRegistry?.records?.length || 0,
      classification_registry_records: classificationRegistry?.records?.length || 0,
      declassification_registry_records: declassificationRegistry?.records?.length || 0,
      translation_registry_records: translationRegistry?.records?.length || 0,
      printed_attachment_registry_records: printedAttachmentRegistry?.records?.length || 0,
      visual_material_registry_records: visualMaterialRegistry?.records?.length || 0,
      handwritten_transcription_registry_records: handwrittenTranscriptionRegistry?.records?.length || 0,
      document_handling_registry_records: documentHandlingRegistry?.records?.length || 0,
      chronology_registry_records: chronologyRegistry?.records?.length || 0,
      time_zone_registry_records: timeZoneRegistry?.records?.length || 0,
      summit_public_event_registry_records: summitPublicEventRegistry?.events?.length || 0,
      selection_balance_registry_records: selectionBalanceRegistry?.records?.length || 0,
      decision_process_registry_records: decisionProcessRegistry?.records?.length || 0,
      public_source_registry_records: publicSourceRegistry?.records?.length || 0,
      retrospective_account_registry_records: retrospectiveAccountRegistry?.records?.length || 0,
      treaty_registry_records: treatyRegistry?.records?.length || 0,
      foreign_org_registry_records: foreignOrgRegistry?.records?.length || 0,
      congressional_legal_registry_records: congressionalLegalRegistry?.records?.length || 0,
      economic_financial_registry_records: economicFinancialRegistry?.records?.length || 0,
      military_crisis_registry_records: militaryCrisisRegistry?.records?.length || 0,
      intelligence_law_enforcement_registry_records: intelligenceLawEnforcementRegistry?.records?.length || 0,
      human_rights_refugee_global_issues_registry_records:
        humanRightsRefugeeGlobalIssuesRegistry?.records?.length || 0,
      footnote_referback_registry_records: footnoteReferbackRegistry?.records?.length || 0,
      recurring_risk_registry_records: recurringRiskRegistry?.records?.length || 0,
      negative_search_registry_records: negativeSearchRegistry?.records?.length || 0,
      document_relationship_registry_records: documentRelationshipRegistry?.records?.length || 0,
      communications_registry_records: communicationsRegistry?.records?.length || 0
    },
    chunks: []
  };

  unitChunks.forEach((units, index) => {
    const chunkId = `chunk-${String(index + 1).padStart(4, "0")}`;
    const unitIds = units.map((unit) => unit.unit_id);
    const reviewableUnitIds = units.filter(reviewRequired).map((unit) => unit.unit_id);
    const chunk = {
      chunk_id: chunkId,
      chunk_index: index + 1,
      unit_count: units.length,
      reviewable_unit_count: reviewableUnitIds.length,
      first_unit_id: unitIds[0] || "",
      last_unit_id: unitIds[unitIds.length - 1] || "",
      unit_ids: unitIds,
      reviewable_unit_ids: reviewableUnitIds,
      units_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-units.json`)),
      packet_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-review-packet.md`)),
      expected_output_file: normalizePathForOutput(path.join(options.outDir, `${chunkId}-checker-output.json`)),
      units
    };
    manifest.chunks.push(Object.fromEntries(Object.entries(chunk).filter(([key]) => key !== "units")));
    fs.writeFileSync(
      path.join(options.outDir, `${chunkId}-units.json`),
      `${JSON.stringify({ schema_version: "frus-extracted-units-v1", source: `${chunkId} units`, units }, null, 2)}\n`
    );
    fs.writeFileSync(
      path.join(options.outDir, `${chunkId}-review-packet.md`),
      renderPacket({
        chunk,
        manifest,
        guide,
        schema,
        annotationSheetProfile: annotationSheetProfileContext,
        statusRegistry,
        statusClaims,
        authorityRegistry: authorityRegistryContext,
        sourceListRegistry: sourceListRegistryContext,
        documentMetadataRegistry: documentMetadataRegistryContext,
        classificationRegistry: classificationRegistryContext,
        declassificationRegistry: declassificationRegistryContext,
        translationRegistry: translationRegistryContext,
        printedAttachmentRegistry: printedAttachmentRegistryContext,
        visualMaterialRegistry: visualMaterialRegistryContext,
        handwrittenTranscriptionRegistry: handwrittenTranscriptionRegistryContext,
        documentHandlingRegistry: documentHandlingRegistryContext,
        chronologyRegistry: chronologyRegistryContext,
        timeZoneRegistry: timeZoneRegistryContext,
        summitPublicEventRegistry: summitPublicEventRegistryContext,
        selectionBalanceRegistry: selectionBalanceRegistryContext,
        decisionProcessRegistry: decisionProcessRegistryContext,
        publicSourceRegistry: publicSourceRegistryContext,
        retrospectiveAccountRegistry: retrospectiveAccountRegistryContext,
        treatyRegistry: treatyRegistryContext,
        foreignOrgRegistry: foreignOrgRegistryContext,
        congressionalLegalRegistry: congressionalLegalRegistryContext,
        economicFinancialRegistry: economicFinancialRegistryContext,
        militaryCrisisRegistry: militaryCrisisRegistryContext,
        intelligenceLawEnforcementRegistry: intelligenceLawEnforcementRegistryContext,
        humanRightsRefugeeGlobalIssuesRegistry: humanRightsRefugeeGlobalIssuesRegistryContext,
        footnoteReferbackRegistry: footnoteReferbackRegistryContext,
        recurringRiskRegistry: recurringRiskRegistryContext,
        negativeSearchRegistry: negativeSearchRegistryContext,
        documentRelationshipRegistry: documentRelationshipRegistryContext,
        communicationsRegistry: communicationsRegistryContext,
        router,
        matrix
      })
    );
  });

  fs.writeFileSync(path.join(options.outDir, "chunk-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function renderText(manifest) {
  return `FRUS LLM review chunks built: ${manifest.chunk_count} chunks, ${manifest.summary.units_total} units, ${manifest.summary.reviewable_units} reviewable units.\nManifest: ${normalizePathForOutput(path.join(process.cwd(), "chunk-manifest.json"))}\n`;
}

try {
  const options = parseArgs(process.argv);
  const manifest = buildChunks(options);
  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    process.stdout.write(
      `FRUS LLM review chunks built: ${manifest.chunk_count} chunks, ${manifest.summary.units_total} units, ${manifest.summary.reviewable_units} reviewable units.\nManifest: ${normalizePathForOutput(path.join(options.outDir, "chunk-manifest.json"))}\n`
    );
  }
} catch (error) {
  console.error(`FRUS LLM review chunk build failed: ${error.message}`);
  process.exit(1);
}
