#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const PACKET_SCHEMA_VERSION = "frus-llm-review-packet-v1";

function usage() {
  console.error(
    "Usage: node scripts/build-frus-llm-review-packet.mjs --units <extracted-units.json> [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--annotation-sheet-profile profile.json] [--status-registry registry.json] [--status-claims claims.json] [--authority-registry registry.json] [--source-list-registry registry.json] [--document-metadata-registry registry.json] [--classification-registry registry.json] [--declassification-registry registry.json] [--translation-registry registry.json] [--printed-attachment-registry registry.json] [--visual-material-registry registry.json] [--document-handling-registry registry.json] [--chronology-registry registry.json] [--time-zone-registry registry.json] [--selection-balance-registry registry.json] [--public-source-registry registry.json] [--retrospective-account-registry registry.json] [--treaty-registry registry.json] [--foreign-org-registry registry.json] [--footnote-referback-registry registry.json] [--recurring-risk-registry registry.json] [--negative-search-registry registry.json] [--document-relationship-registry registry.json] [--communications-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--out packet.md] [--format markdown|json]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let unitsPath = null;
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
  let documentHandlingRegistryPath = null;
  let chronologyRegistryPath = null;
  let timeZoneRegistryPath = null;
  let selectionBalanceRegistryPath = null;
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
  let runId = `frus-llm-review-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  let outPath = null;
  let format = "markdown";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
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
    } else if (arg === "--run-id") {
      runId = argv[index + 1];
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!unitsPath || !guidePath || !schemaPath || !runId || !new Set(["markdown", "json"]).has(format)) {
    usage();
  }

  return {
    unitsPath,
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
    documentHandlingRegistryPath,
    chronologyRegistryPath,
    timeZoneRegistryPath,
    selectionBalanceRegistryPath,
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
    runId,
    outPath,
    format
  };
}

function readText(filePath, label) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function readJson(filePath, label) {
  const text = readText(filePath, label);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label}: invalid JSON: ${error.message}`);
  }
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateUnits(unitsDocument, label) {
  const errors = [];
  if (!isPlainObject(unitsDocument)) {
    errors.push(`${label}: expected extracted-units object`);
    return errors;
  }
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
    for (const key of ["unit_id", "unit_type", "exact_text", "display_text", "editability", "edit_safety", "comment_safety"]) {
      if (typeof unit[key] !== "string") {
        errors.push(`${unitLabel}.${key}: expected string`);
      }
    }
    if (typeof unit.unit_id === "string" && unit.unit_id.length > 0) {
      if (seen.has(unit.unit_id)) errors.push(`${unitLabel}.unit_id: duplicate ${unit.unit_id}`);
      seen.add(unit.unit_id);
    }
  });
  return errors;
}

function schemaSummary(schema) {
  const defs = schema.$defs || {};
  return {
    schema_version_required: schema.properties?.schema_version?.const || "",
    top_level_required: schema.required || [],
    readiness_gates: defs.readiness_gate?.properties?.gate_id?.enum || [],
    categories: defs.category?.enum || [],
    evidence_requests: defs.evidence_request?.enum || [],
    recommended_actions: defs.check?.properties?.recommended_action?.enum || [],
    discrepancy_statuses: defs.style_discrepancy?.properties?.status?.enum || []
  };
}

function unitSummary(unitsDocument) {
  const byType = {};
  const byEditSafety = {};
  const blockedBoundaries = {};
  for (const unit of unitsDocument.units || []) {
    byType[unit.unit_type] = (byType[unit.unit_type] || 0) + 1;
    byEditSafety[unit.edit_safety] = (byEditSafety[unit.edit_safety] || 0) + 1;
    for (const boundary of unit.blocked_boundaries || []) {
      blockedBoundaries[boundary] = (blockedBoundaries[boundary] || 0) + 1;
    }
  }
  return {
    total_units: unitsDocument.units?.length || 0,
    by_unit_type: byType,
    by_edit_safety: byEditSafety,
    blocked_boundaries: blockedBoundaries
  };
}

function compactStatusRegistry(registry, targetVolume) {
  if (!registry) return null;
  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  const target = targetVolume ? entries.find((entry) => entry.entry_id === targetVolume) || null : null;
  return {
    schema_version: registry.schema_version,
    captured_at: registry.captured_at,
    source_url: registry.source_url,
    scope: registry.scope,
    snapshot_integrity: registry.snapshot_integrity,
    target_volume: target,
    entries: entries.map((entry) => ({
      entry_id: entry.entry_id,
      administration: entry.administration,
      date_range: entry.date_range,
      volume_number: entry.volume_number,
      title: entry.title,
      production_stage: entry.production_stage,
      release_buckets: entry.release_buckets || [],
      published_date: entry.published_date || "",
      history_state_url: entry.history_state_url,
      subitems: entry.subitems || []
    }))
  };
}

function compactRouter(router, targetVolume) {
  if (!router) return null;
  const routes = Array.isArray(router.routes) ? router.routes : [];
  const target = targetVolume ? routes.find((route) => route.entry_id === targetVolume) || null : null;
  return {
    schema_version: router.schema_version,
    captured_at: router.captured_at,
    source_url: router.source_url,
    target_route: target,
    stage_postures: router.stage_postures || [],
    family_definitions: router.family_definitions || [],
    routes
  };
}

function compactPermutationMatrix(matrix) {
  if (!matrix) return null;
  return {
    schema_version: matrix.schema_version,
    matrix_id: matrix.matrix_id,
    source_schema: matrix.source_schema,
    source_router: matrix.source_router,
    purpose: matrix.purpose,
    use_limits: matrix.use_limits || [],
    category_policies: matrix.category_policies || [],
    evidence_request_policies: matrix.evidence_request_policies || []
  };
}

function compactAuthorityRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    authority_registry_id: registry.authority_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    source_list_registry_id: registry.source_list_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    document_metadata_registry_id: registry.document_metadata_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    classification_registry_id: registry.classification_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    declassification_registry_id: registry.declassification_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    translation_registry_id: registry.translation_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    printed_attachment_registry_id: registry.printed_attachment_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    visual_material_registry_id: registry.visual_material_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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

function compactDocumentHandlingRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    document_handling_registry_id: registry.document_handling_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    negative_search_registry_id: registry.negative_search_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    document_relationship_registry_id: registry.document_relationship_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    communications_registry_id: registry.communications_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    chronology_registry_id: registry.chronology_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    time_zone_registry_id: registry.time_zone_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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

function compactSelectionBalanceRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    selection_balance_registry_id: registry.selection_balance_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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

function compactPublicSourceRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    public_source_registry_id: registry.public_source_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    retrospective_account_registry_id: registry.retrospective_account_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    rule_summary: registry.rule_summary || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    treaty_registry_id: registry.treaty_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
  return {
    schema_version: registry.schema_version,
    foreign_org_registry_id: registry.foreign_org_registry_id,
    captured_at: registry.captured_at,
    source_urls: registry.source_urls || [],
    scope: registry.scope || "",
    target_volume: targetVolume,
    target_records: targetRecords,
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

function compactFootnoteReferbackRegistry(registry, targetVolume) {
  if (!registry) return null;
  const records = Array.isArray(registry.records) ? registry.records : [];
  const targetRecords = targetVolume ? records.filter((record) => record.volume_id === targetVolume) : [];
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
    target_records: targetRecords,
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

function buildPacket(options) {
  const guideMarkdown = readText(options.guidePath, options.guidePath);
  const schema = readJson(options.schemaPath, options.schemaPath);
  const unitsDocument = readJson(options.unitsPath, options.unitsPath);
  const errors = validateUnits(unitsDocument, options.unitsPath);
  if (errors.length > 0) {
    throw new Error(`extracted units failed validation:\n- ${errors.join("\n- ")}`);
  }

  const statusRegistry = options.statusRegistryPath ? readJson(options.statusRegistryPath, options.statusRegistryPath) : null;
  const statusClaims = options.statusClaimsPath ? readJson(options.statusClaimsPath, options.statusClaimsPath) : null;
  const annotationSheetProfile = options.annotationSheetProfilePath
    ? readJson(options.annotationSheetProfilePath, options.annotationSheetProfilePath)
    : null;
  const authorityRegistry = options.authorityRegistryPath
    ? readJson(options.authorityRegistryPath, options.authorityRegistryPath)
    : null;
  const sourceListRegistry = options.sourceListRegistryPath
    ? readJson(options.sourceListRegistryPath, options.sourceListRegistryPath)
    : null;
  const documentMetadataRegistry = options.documentMetadataRegistryPath
    ? readJson(options.documentMetadataRegistryPath, options.documentMetadataRegistryPath)
    : null;
  const classificationRegistry = options.classificationRegistryPath
    ? readJson(options.classificationRegistryPath, options.classificationRegistryPath)
    : null;
  const declassificationRegistry = options.declassificationRegistryPath
    ? readJson(options.declassificationRegistryPath, options.declassificationRegistryPath)
    : null;
  const translationRegistry = options.translationRegistryPath
    ? readJson(options.translationRegistryPath, options.translationRegistryPath)
    : null;
  const printedAttachmentRegistry = options.printedAttachmentRegistryPath
    ? readJson(options.printedAttachmentRegistryPath, options.printedAttachmentRegistryPath)
    : null;
  const visualMaterialRegistry = options.visualMaterialRegistryPath
    ? readJson(options.visualMaterialRegistryPath, options.visualMaterialRegistryPath)
    : null;
  const documentHandlingRegistry = options.documentHandlingRegistryPath
    ? readJson(options.documentHandlingRegistryPath, options.documentHandlingRegistryPath)
    : null;
  const negativeSearchRegistry = options.negativeSearchRegistryPath
    ? readJson(options.negativeSearchRegistryPath, options.negativeSearchRegistryPath)
    : null;
  const documentRelationshipRegistry = options.documentRelationshipRegistryPath
    ? readJson(options.documentRelationshipRegistryPath, options.documentRelationshipRegistryPath)
    : null;
  const communicationsRegistry = options.communicationsRegistryPath
    ? readJson(options.communicationsRegistryPath, options.communicationsRegistryPath)
    : null;
  const chronologyRegistry = options.chronologyRegistryPath
    ? readJson(options.chronologyRegistryPath, options.chronologyRegistryPath)
    : null;
  const timeZoneRegistry = options.timeZoneRegistryPath
    ? readJson(options.timeZoneRegistryPath, options.timeZoneRegistryPath)
    : null;
  const selectionBalanceRegistry = options.selectionBalanceRegistryPath
    ? readJson(options.selectionBalanceRegistryPath, options.selectionBalanceRegistryPath)
    : null;
  const publicSourceRegistry = options.publicSourceRegistryPath
    ? readJson(options.publicSourceRegistryPath, options.publicSourceRegistryPath)
    : null;
  const retrospectiveAccountRegistry = options.retrospectiveAccountRegistryPath
    ? readJson(options.retrospectiveAccountRegistryPath, options.retrospectiveAccountRegistryPath)
    : null;
  const treatyRegistry = options.treatyRegistryPath ? readJson(options.treatyRegistryPath, options.treatyRegistryPath) : null;
  const foreignOrgRegistry = options.foreignOrgRegistryPath
    ? readJson(options.foreignOrgRegistryPath, options.foreignOrgRegistryPath)
    : null;
  const footnoteReferbackRegistry = options.footnoteReferbackRegistryPath
    ? readJson(options.footnoteReferbackRegistryPath, options.footnoteReferbackRegistryPath)
    : null;
  const recurringRiskRegistry = options.recurringRiskRegistryPath
    ? readJson(options.recurringRiskRegistryPath, options.recurringRiskRegistryPath)
    : null;
  const preparationRouter = options.preparationRouterPath
    ? readJson(options.preparationRouterPath, options.preparationRouterPath)
    : null;
  const permutationMatrix = options.permutationMatrixPath
    ? readJson(options.permutationMatrixPath, options.permutationMatrixPath)
    : null;

  return {
    schema_version: PACKET_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    run_id: options.runId,
    target_volume: options.targetVolume,
    source_files: {
      guide: normalizePathForOutput(options.guidePath),
      schema: normalizePathForOutput(options.schemaPath),
      units: normalizePathForOutput(options.unitsPath),
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
      document_handling_registry: options.documentHandlingRegistryPath ? normalizePathForOutput(options.documentHandlingRegistryPath) : "",
      chronology_registry: options.chronologyRegistryPath ? normalizePathForOutput(options.chronologyRegistryPath) : "",
      time_zone_registry: options.timeZoneRegistryPath ? normalizePathForOutput(options.timeZoneRegistryPath) : "",
      selection_balance_registry: options.selectionBalanceRegistryPath
        ? normalizePathForOutput(options.selectionBalanceRegistryPath)
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
      permutation_matrix: options.permutationMatrixPath ? normalizePathForOutput(options.permutationMatrixPath) : ""
    },
    task_contract: {
      role: "Review extracted Microsoft Word FRUS annotation-sheet units as a bespoke spellcheck engine.",
      must_return: "Return only one valid JSON object matching checker-output-v1. Do not include Markdown outside the JSON.",
      do_not_do: [
        "Do not claim to edit the Word file directly.",
        "Do not invent source-note provenance, classification markings, declassification or omission quantities, document numbers, dates, or publication status.",
        "Do not recommend direct text edits unless the exact extracted unit anchor and evidence basis make the edit safe.",
        "Do not collapse evidence requests into the General Editor discrepancy tally."
      ],
      reviewer_posture: [
        "Treat the LLM as a conservative proofreader, not as the authority of record.",
        "Return a checker entry for every reviewable extracted editorial unit, using no_change when the unit is already sound.",
        "Use comment_only when evidence is missing or a Word boundary is unsafe.",
        "Keep the running discrepancy tally separate for the General Editor."
      ]
    },
    packet_summary: {
      units: unitSummary(unitsDocument),
      output_schema: schemaSummary(schema),
      annotation_sheet_profile_checks: annotationSheetProfile?.profile_checks?.length || 0,
      annotation_sheet_profile_markers: annotationSheetProfile?.source_basis?.marker_inventory?.length || 0,
      status_registry_entries: statusRegistry?.entries?.length || 0,
      status_claims: statusClaims?.claims?.length || 0,
      authority_registry_records: authorityRegistry?.records?.length || 0,
      source_list_registry_records: sourceListRegistry?.records?.length || 0,
      document_metadata_registry_records: documentMetadataRegistry?.records?.length || 0,
      classification_registry_records: classificationRegistry?.records?.length || 0,
      declassification_registry_records: declassificationRegistry?.records?.length || 0,
      translation_registry_records: translationRegistry?.records?.length || 0,
      printed_attachment_registry_records: printedAttachmentRegistry?.records?.length || 0,
      visual_material_registry_records: visualMaterialRegistry?.records?.length || 0,
      document_handling_registry_records: documentHandlingRegistry?.records?.length || 0,
      chronology_registry_records: chronologyRegistry?.records?.length || 0,
      time_zone_registry_records: timeZoneRegistry?.records?.length || 0,
      selection_balance_registry_records: selectionBalanceRegistry?.records?.length || 0,
      public_source_registry_records: publicSourceRegistry?.records?.length || 0,
      retrospective_account_registry_records: retrospectiveAccountRegistry?.records?.length || 0,
      treaty_registry_records: treatyRegistry?.records?.length || 0,
      foreign_org_registry_records: foreignOrgRegistry?.records?.length || 0,
      footnote_referback_registry_records: footnoteReferbackRegistry?.records?.length || 0,
      recurring_risk_registry_records: recurringRiskRegistry?.records?.length || 0,
      negative_search_registry_records: negativeSearchRegistry?.records?.length || 0,
      document_relationship_registry_records: documentRelationshipRegistry?.records?.length || 0,
      communications_registry_records: communicationsRegistry?.records?.length || 0,
      preparation_routes: preparationRouter?.routes?.length || 0,
      matrix_categories: permutationMatrix?.category_policies?.length || 0,
      matrix_evidence_requests: permutationMatrix?.evidence_request_policies?.length || 0
    },
    guide_markdown: guideMarkdown,
    output_schema: schema,
    extracted_units: unitsDocument,
    contexts: {
      annotation_sheet_profile: compactAnnotationSheetProfile(annotationSheetProfile),
      status_registry: compactStatusRegistry(statusRegistry, options.targetVolume),
      status_claims: statusClaims || null,
      authority_registry: compactAuthorityRegistry(authorityRegistry, options.targetVolume),
      source_list_registry: compactSourceListRegistry(sourceListRegistry, options.targetVolume),
      document_metadata_registry: compactDocumentMetadataRegistry(documentMetadataRegistry, options.targetVolume),
      classification_registry: compactClassificationRegistry(classificationRegistry, options.targetVolume),
      declassification_registry: compactDeclassificationRegistry(declassificationRegistry, options.targetVolume),
      translation_registry: compactTranslationRegistry(translationRegistry, options.targetVolume),
      printed_attachment_registry: compactPrintedAttachmentRegistry(printedAttachmentRegistry, options.targetVolume),
      visual_material_registry: compactVisualMaterialRegistry(visualMaterialRegistry, options.targetVolume),
      document_handling_registry: compactDocumentHandlingRegistry(documentHandlingRegistry, options.targetVolume),
      chronology_registry: compactChronologyRegistry(chronologyRegistry, options.targetVolume),
      time_zone_registry: compactTimeZoneRegistry(timeZoneRegistry, options.targetVolume),
      selection_balance_registry: compactSelectionBalanceRegistry(selectionBalanceRegistry, options.targetVolume),
      public_source_registry: compactPublicSourceRegistry(publicSourceRegistry, options.targetVolume),
      retrospective_account_registry: compactRetrospectiveAccountRegistry(
        retrospectiveAccountRegistry,
        options.targetVolume
      ),
      treaty_registry: compactTreatyRegistry(treatyRegistry, options.targetVolume),
      foreign_org_registry: compactForeignOrgRegistry(foreignOrgRegistry, options.targetVolume),
      footnote_referback_registry: compactFootnoteReferbackRegistry(footnoteReferbackRegistry, options.targetVolume),
      recurring_risk_registry: compactRecurringRiskRegistry(recurringRiskRegistry),
      negative_search_registry: compactNegativeSearchRegistry(negativeSearchRegistry, options.targetVolume),
      document_relationship_registry: compactDocumentRelationshipRegistry(documentRelationshipRegistry, options.targetVolume),
      communications_registry: compactCommunicationsRegistry(communicationsRegistry, options.targetVolume),
      preparation_router: compactRouter(preparationRouter, options.targetVolume),
      permutation_matrix: compactPermutationMatrix(permutationMatrix)
    }
  };
}

function fencedJson(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function renderMarkdown(packet) {
  const lines = [
    "# FRUS Annotation Review Packet",
    "",
    `- schema_version: ${packet.schema_version}`,
    `- run_id: ${packet.run_id}`,
    `- generated_at: ${packet.generated_at}`,
    `- target_volume: ${packet.target_volume || "not supplied"}`,
    "",
    "## Closed-Network LLM Task",
    "",
    packet.task_contract.role,
    "",
    "**Return only one valid JSON object matching `checker-output-v1`. Do not include Markdown outside the JSON.**",
    "",
    "Do not claim to edit the Word file directly. The wrapper will validate this JSON and apply only safe Word comments or tracked changes.",
    "",
    "Every reviewable extracted editorial unit should have a checker entry. Use `recommended_action: \"no_change\"` when the unit is already sound.",
    "",
    "## Packet Summary",
    "",
    fencedJson(packet.packet_summary),
    "",
    "## Runtime FRUS Annotation Checker Guide",
    "",
    packet.guide_markdown.trim(),
    "",
    "## Output Contract Summary",
    "",
    fencedJson(packet.packet_summary.output_schema),
    "",
    "## Full Output JSON Schema",
    "",
    fencedJson(packet.output_schema),
    "",
    "## Extracted Word Units",
    "",
    "Use `unit_id` values exactly as supplied. Direct edits must use exact text from `exact_text` and must respect editability, edit_safety, comment_safety, existing revisions, comments, and blocked boundaries.",
    "",
    fencedJson(packet.extracted_units),
    "",
    "## Annotation Sheet Profile Context",
    "",
    "Use this to recognize finished-form FRUS annotation-sheet structure when the uploaded Word file is nearly flat. Lexical FRUS apparatus patterns outrank Word paragraph styles. Preserve or reversibly map production pseudo-markers; use comment-only when a direct edit would touch or split them.",
    "",
    fencedJson(packet.contexts.annotation_sheet_profile || {}),
    "",
    "## Status Registry Context",
    "",
    "Use this only to check publication-status language and volume-stage posture. It is not source-note provenance.",
    "",
    fencedJson(packet.contexts.status_registry || {}),
    "",
    "## Extracted Status Claims",
    "",
    "These are deterministic wrapper-extracted publication-status phrases. Use them to avoid silently missing status drift; do not treat them as provenance.",
    "",
    fencedJson(packet.contexts.status_claims || {}),
    "",
    "## Authority Registry Context",
    "",
    "Use this to check volume-specific Persons, Abbreviations and Terms, Source List/front matter, document-number, public-title, and index forms. Treat cross-volume or variant forms as comment-only unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.authority_registry || {}),
    "",
    "## Source List And Front Matter Registry Context",
    "",
    "Use this to reconcile source notes, repository/source-family forms, published-source references, Sources page entries, and front-matter source-list language. Treat source-list variants and cross-volume source families as comment-only unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.source_list_registry || {}),
    "",
    "## Document Metadata Registry Context",
    "",
    "Use this to check document numbers, headings, document-type labels, date/place lines, subject/title lines, sender/recipient forms, attachment behavior, editorial-note form, and source-note linkage. Treat metadata variants and cross-volume document forms as comment-only unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.document_metadata_registry || {}),
    "",
    "## Classification And Handling Registry Context",
    "",
    "Use this to check original classification markings, handling controls, and verified absence-of-marking phrases. Do not confuse original markings with later release, redaction, or declassification status. Treat cross-volume or variant classification forms as comment-only unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.classification_registry || {}),
    "",
    "## Declassification And Omission Registry Context",
    "",
    "Use this to check bracketed omission quantities, pages not declassified, handling-restriction-not-declassified phrases, whole-document withholdings, and About the Series review-statistics language. Do not change omission quantities, bracket wording, page counts, or review statistics unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.declassification_registry || {}),
    "",
    "## Translation And Foreign-Origin Registry Context",
    "",
    "Use this to check official, unofficial, informal, Language Services, editor-transcribed, original-language, foreign-copy, and foreign-text-in-file apparatus. Do not simplify translation status, original-language basis, foreign-copy provenance, or selected-versus-supplemental foreign-origin records unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.translation_registry || {}),
    "",
    "## Printed And Nested Attachment Registry Context",
    "",
    "Use this to check printed-in-parent child papers, attached-but-not-printed details, printed-as-document targets, tab/enclosure labels, child headings, child date/place lines, child source notes, child classification markings, and parent-child maps. Do not change printed targets, child apparatus, tab labels, or attached/not-printed status unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.printed_attachment_registry || {}),
    "",
    "## Visual Material Registry Context",
    "",
    "Use this to check maps, photographs, charts, images, graphic attachments, appendix images, captions, visual titles, not-found/not-attached visual items, visual descriptions, source-image references, printed targets, and person/object/place identification. Do not change captions, image links, visual descriptions, or attachment/not-found status unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.visual_material_registry || {}),
    "",
    "## Document Handling And Marginalia Registry Context",
    "",
    "Use this to check initials, handwritten marginalia, underlining, checkmarks, stamped notations, saw notations, sent-for-action/sent-for-information routing, copy status, bracket/original-status phrases, and approval/disapproval language. Do not change document-face handling, mark locations, actors, routing status, or copy status unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.document_handling_registry || {}),
    "",
    "## Chronology And Time Registry Context",
    "",
    "Use this to check President's Daily Diary, meeting-time, call-time, no-precise-time, actual-versus-planned, diary/schedule, place, attendance, and event-sequence language. Do not change times, dates, places, attendance, sequence, or no-minutes/no-precise-time caveats unless the target-volume chronology registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.chronology_registry || {}),
    "",
    "## Time-Zone And Date-Time Group Registry Context",
    "",
    "Use this to check Washington-time rules, local-time labels, GMT/Z/Zulu date-time groups, EST/EDT labels, no-precise-time caveats, deadlines, treaty timing rules, and chronological placement. Preserve time labels exactly; do not convert, drop `Z`, add local time, or move a document chronologically unless the target-volume time-zone registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.time_zone_registry || {}),
    "",
    "## Selection Balance And Completeness Registry Context",
    "",
    "Use this to check principles of selection, chapter or volume scope, excerpted portions, omitted non-scope material, related-volume boundaries, scheduled-publication targets, complete-record-elsewhere claims, withheld-document effects, and known gaps. Treat complete, balanced, representative, or no-other-record claims as comment-only unless target-volume selection-balance evidence and General Editor review support the claim.",
    "",
    fencedJson(packet.contexts.selection_balance_registry || {}),
    "",
    "## Public Source And Public Diplomacy Registry Context",
    "",
    "Use this to check speeches, public remarks, press releases, press conferences, briefings, interviews, broadcasts, testimony, Public Papers, Department of State Bulletin/Dispatch, Congressional Record, official transcripts, newspaper excerpts, full-text targets, archival draft or briefing-file context, diary context, and selected-versus-supplemental public-source status. Do not change publication details, delivery or broadcast basis, full-text targets, archival draft context, or selected-public-document status unless the target-volume public-source registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.public_source_registry || {}),
    "",
    "## Retrospective Account Registry Context",
    "",
    "Use this to check memoirs, published or personal diaries, oral histories, later interviews, recollections, press retrospectives, newspaper accounts, author/source, publication, page locator, event match, selected-versus-supplemental status, official-record relationship, corroborating records, and conflict status. Do not let retrospective accounts replace official records; use comment-only unless the target-volume retrospective-account registry proves the exact direct edit.",
    "",
    fencedJson(packet.contexts.retrospective_account_registry || {}),
    "",
    "## Treaty And Legal Instrument Registry Context",
    "",
    "Use this to check treaty text, protocols, annexes, memoranda of understanding, associated-but-not-integral documents, Senate transmittal packages, ratification, entry-into-force, legal-authority, and draft treaty-package language. Do not change component identity, integral/associated status, source basis, legal process, ratification, or entry-into-force language unless the target-volume treaty registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.treaty_registry || {}),
    "",
    "## Foreign And International Organization Registry Context",
    "",
    "Use this to check country names, successor-state references, alliances, international organizations, regional bodies, summit/conference names, international financial institutions, trade regimes, UN resolution forms, and treaty-party language. Do not change entity identity, acronym expansion, body role, successor-state status, treaty-party status, or translation/authority basis unless the target-volume foreign-org registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.foreign_org_registry || {}),
    "",
    "## Footnote Refer-Back Registry Context",
    "",
    "Use this to check repeated-reference footnote discipline. Reagan Foundations models cross-document `footnote N, Document X`, same-document `above` or local above-context, and `Document X and footnote Y thereto`; Document 146 separately models a three-target footnote/document cluster. Apply the registry `repeat_threshold`: the first and second full citations may stand, but the third and later full repeat are production-review triggers for a possible refer-back. Do not invent refer-back targets; use comment-only unless the registry proves the exact direct edit.",
    "",
    fencedJson(packet.contexts.footnote_referback_registry || {}),
    "",
    "## Recurring Compiler Risk Registry Context",
    "",
    "Use this as a practical spellcheck list for recurring compiler mistakes: leading-zero telegram numbers, non-State telegram copies without eRecords/drafting checks, incomplete cross-reference slugs, missing page breaks, old heading-footnote practice, Word autoformatting, incomplete documents or source notes, unhighlighted quoted backup text, missing telegram headers/film numbers, and Style Guide inconsistency. Treat these as generalized risk checks, not as personal criticism.",
    "",
    fencedJson(packet.contexts.recurring_risk_registry || {}),
    "",
    "## Negative Search And No-Record Registry Context",
    "",
    "Use this to check `No minutes were found`, `Not found`, `Not attached`, `Not found attached`, no-memcon/no-telcon, missing-attachment, and RAC attachment-ambiguity language. Do not collapse one no-record relationship into another unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.negative_search_registry || {}),
    "",
    "## Document Relationship Registry Context",
    "",
    "Use this to check `Attached but not printed`, `Printed as Document [n]`, `See Document [n]`, tab/enclosure references, not-attached items, and mixed attachment notes. Do not change target document numbers, tab labels, or attachment status unless the registry proves the same source-document relationship.",
    "",
    fencedJson(packet.contexts.document_relationship_registry || {}),
    "",
    "## Communications Metadata Registry Context",
    "",
    "Use this to check telegram/cable/message identifiers, SECTO/TOSEC/special designators, origin/addressee lines, date-time groups, source-family electronic telegram identifiers, precedence/routing, and drafting/clearance/approval strings. Do not change identifiers, date-time groups, origin/addressee, or precedence unless the registry proves the direct edit.",
    "",
    fencedJson(packet.contexts.communications_registry || {}),
    "",
    "## Preparation Router Context",
    "",
    fencedJson(packet.contexts.preparation_router || {}),
    "",
    "## Permutation Matrix Context",
    "",
    fencedJson(packet.contexts.permutation_matrix || {}),
    "",
    "## Final Output Reminder",
    "",
    "Return only one JSON object with top-level keys: `schema_version`, `document_assessment`, `batch_readiness`, `checks`, `global_comments`, and `style_discrepancy_tally`."
  ];
  return `${lines.join("\n")}\n`;
}

try {
  const options = parseArgs(process.argv);
  const packet = buildPacket(options);
  const output = options.format === "json" ? `${JSON.stringify(packet, null, 2)}\n` : renderMarkdown(packet);
  if (options.outPath) {
    fs.mkdirSync(path.dirname(options.outPath), { recursive: true });
    fs.writeFileSync(options.outPath, output);
  } else {
    process.stdout.write(output);
  }
} catch (error) {
  console.error(`FRUS LLM review packet build failed: ${error.message}`);
  process.exit(1);
}
