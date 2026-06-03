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
    "Usage: node scripts/build-frus-llm-review-chunks.mjs --units <extracted-units.json> --out-dir DIR [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--annotation-sheet-profile profile.json] [--status-registry registry.json] [--status-claims claims.json] [--authority-registry registry.json] [--source-list-registry registry.json] [--document-metadata-registry registry.json] [--classification-registry registry.json] [--declassification-registry registry.json] [--translation-registry registry.json] [--printed-attachment-registry registry.json] [--visual-material-registry registry.json] [--document-handling-registry registry.json] [--chronology-registry registry.json] [--public-source-registry registry.json] [--treaty-registry registry.json] [--foreign-org-registry registry.json] [--recurring-risk-registry registry.json] [--negative-search-registry registry.json] [--document-relationship-registry registry.json] [--communications-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--max-units N] [--max-chars N] [--format json|text]"
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
  let documentHandlingRegistryPath = null;
  let chronologyRegistryPath = null;
  let publicSourceRegistryPath = null;
  let treatyRegistryPath = null;
  let foreignOrgRegistryPath = null;
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
    } else if (arg === "--document-handling-registry") {
      documentHandlingRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--chronology-registry") {
      chronologyRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--public-source-registry") {
      publicSourceRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--treaty-registry") {
      treatyRegistryPath = argv[index + 1];
      index += 1;
    } else if (arg === "--foreign-org-registry") {
      foreignOrgRegistryPath = argv[index + 1];
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
    documentHandlingRegistryPath,
    chronologyRegistryPath,
    publicSourceRegistryPath,
    treatyRegistryPath,
    foreignOrgRegistryPath,
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
  documentHandlingRegistry,
  chronologyRegistry,
  publicSourceRegistry,
  treatyRegistry,
  foreignOrgRegistry,
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
    "## Public Source And Public Diplomacy Registry Context",
    "",
    "Use this to check speeches, public remarks, press releases, press conferences, briefings, interviews, broadcasts, testimony, Public Papers, Department of State Bulletin/Dispatch, Congressional Record, official transcripts, newspaper excerpts, full-text targets, archival draft or briefing-file context, diary context, and selected-versus-supplemental public-source status. Do not change publication details, delivery or broadcast basis, full-text targets, archival draft context, or selected-public-document status unless the target-volume public-source registry proves the direct edit.",
    "",
    fencedJson(publicSourceRegistry || {}),
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
  const documentHandlingRegistry = options.documentHandlingRegistryPath ? readJson(options.documentHandlingRegistryPath) : null;
  const negativeSearchRegistry = options.negativeSearchRegistryPath ? readJson(options.negativeSearchRegistryPath) : null;
  const documentRelationshipRegistry = options.documentRelationshipRegistryPath
    ? readJson(options.documentRelationshipRegistryPath)
    : null;
  const communicationsRegistry = options.communicationsRegistryPath ? readJson(options.communicationsRegistryPath) : null;
  const chronologyRegistry = options.chronologyRegistryPath ? readJson(options.chronologyRegistryPath) : null;
  const publicSourceRegistry = options.publicSourceRegistryPath ? readJson(options.publicSourceRegistryPath) : null;
  const treatyRegistry = options.treatyRegistryPath ? readJson(options.treatyRegistryPath) : null;
  const foreignOrgRegistry = options.foreignOrgRegistryPath ? readJson(options.foreignOrgRegistryPath) : null;
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
  const documentHandlingRegistryContext = compactDocumentHandlingRegistry(documentHandlingRegistry, options.targetVolume);
  const negativeSearchRegistryContext = compactNegativeSearchRegistry(negativeSearchRegistry, options.targetVolume);
  const documentRelationshipRegistryContext = compactDocumentRelationshipRegistry(
    documentRelationshipRegistry,
    options.targetVolume
  );
  const communicationsRegistryContext = compactCommunicationsRegistry(communicationsRegistry, options.targetVolume);
  const chronologyRegistryContext = compactChronologyRegistry(chronologyRegistry, options.targetVolume);
  const publicSourceRegistryContext = compactPublicSourceRegistry(publicSourceRegistry, options.targetVolume);
  const treatyRegistryContext = compactTreatyRegistry(treatyRegistry, options.targetVolume);
  const foreignOrgRegistryContext = compactForeignOrgRegistry(foreignOrgRegistry, options.targetVolume);
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
      document_handling_registry: options.documentHandlingRegistryPath ? normalizePathForOutput(options.documentHandlingRegistryPath) : "",
      chronology_registry: options.chronologyRegistryPath ? normalizePathForOutput(options.chronologyRegistryPath) : "",
      public_source_registry: options.publicSourceRegistryPath ? normalizePathForOutput(options.publicSourceRegistryPath) : "",
      treaty_registry: options.treatyRegistryPath ? normalizePathForOutput(options.treatyRegistryPath) : "",
      foreign_org_registry: options.foreignOrgRegistryPath ? normalizePathForOutput(options.foreignOrgRegistryPath) : "",
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
      document_handling_registry_records: documentHandlingRegistry?.records?.length || 0,
      chronology_registry_records: chronologyRegistry?.records?.length || 0,
      public_source_registry_records: publicSourceRegistry?.records?.length || 0,
      treaty_registry_records: treatyRegistry?.records?.length || 0,
      foreign_org_registry_records: foreignOrgRegistry?.records?.length || 0,
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
        documentHandlingRegistry: documentHandlingRegistryContext,
        chronologyRegistry: chronologyRegistryContext,
        publicSourceRegistry: publicSourceRegistryContext,
        treatyRegistry: treatyRegistryContext,
        foreignOrgRegistry: foreignOrgRegistryContext,
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
