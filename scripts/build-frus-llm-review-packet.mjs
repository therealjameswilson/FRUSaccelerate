#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const PACKET_SCHEMA_VERSION = "frus-llm-review-packet-v1";

function usage() {
  console.error(
    "Usage: node scripts/build-frus-llm-review-packet.mjs --units <extracted-units.json> [--guide reports/frus-annotation-checker-core.md] [--schema reports/frus-annotation-checker-output.schema.json] [--annotation-sheet-profile profile.json] [--status-registry registry.json] [--status-claims claims.json] [--authority-registry registry.json] [--source-list-registry registry.json] [--document-metadata-registry registry.json] [--classification-registry registry.json] [--negative-search-registry registry.json] [--document-relationship-registry registry.json] [--communications-registry registry.json] [--preparation-router router.json] [--permutation-matrix matrix.json] [--target-volume ENTRY-ID] [--run-id RUN] [--out packet.md] [--format markdown|json]"
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
  const negativeSearchRegistry = options.negativeSearchRegistryPath
    ? readJson(options.negativeSearchRegistryPath, options.negativeSearchRegistryPath)
    : null;
  const documentRelationshipRegistry = options.documentRelationshipRegistryPath
    ? readJson(options.documentRelationshipRegistryPath, options.documentRelationshipRegistryPath)
    : null;
  const communicationsRegistry = options.communicationsRegistryPath
    ? readJson(options.communicationsRegistryPath, options.communicationsRegistryPath)
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
        "Do not invent source-note provenance, classification markings, document numbers, dates, or publication status.",
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
