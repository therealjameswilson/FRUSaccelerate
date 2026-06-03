#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runPacket(args) {
  return spawnSync(process.execPath, ["scripts/build-frus-llm-review-packet.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32
  });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-llm-packet-test-"));

try {
  const markdownOut = path.join(tmpDir, "review-packet.md");
  const jsonOut = path.join(tmpDir, "review-packet.json");
  const commonArgs = [
    "--units",
    "reports/frus-annotation-checker-extracted-units.sample.json",
    "--guide",
    "reports/frus-annotation-checker-core.md",
    "--schema",
    "reports/frus-annotation-checker-output.schema.json",
    "--annotation-sheet-profile",
    "reports/frus-annotation-sheet-profile.sample.json",
    "--status-registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--status-claims",
    "reports/frus-status-claims.sample.json",
    "--authority-registry",
    "reports/frus-authority-registry.sample.json",
    "--source-list-registry",
    "reports/frus-source-list-registry.sample.json",
    "--document-metadata-registry",
    "reports/frus-document-metadata-registry.sample.json",
    "--classification-registry",
    "reports/frus-classification-registry.sample.json",
    "--declassification-registry",
    "reports/frus-declassification-registry.sample.json",
    "--translation-registry",
    "reports/frus-translation-registry.sample.json",
    "--printed-attachment-registry",
    "reports/frus-printed-attachment-registry.sample.json",
    "--visual-material-registry",
    "reports/frus-visual-material-registry.sample.json",
    "--negative-search-registry",
    "reports/frus-negative-search-registry.sample.json",
    "--document-relationship-registry",
    "reports/frus-document-relationship-registry.sample.json",
    "--communications-registry",
    "reports/frus-communications-registry.sample.json",
    "--preparation-router",
    "reports/frus-preparation-router-1981-1992.current.json",
    "--permutation-matrix",
    "reports/frus-annotation-permutation-matrix.json",
    "--target-volume",
    "frus1989-92v31",
    "--run-id",
    "packet-smoke-test"
  ];

  const markdownResult = runPacket([...commonArgs, "--out", markdownOut]);
  if (markdownResult.status !== 0) {
    process.stderr.write(markdownResult.stdout);
    process.stderr.write(markdownResult.stderr);
    process.exit(markdownResult.status || 1);
  }

  const markdown = fs.readFileSync(markdownOut, "utf8");
  assert(markdown.includes("# FRUS Annotation Review Packet"), "expected packet heading");
  assert(markdown.includes("Return only one valid JSON object"), "expected strict JSON instruction");
  assert(markdown.includes("checker-output-v1"), "expected checker-output schema contract");
  assert(markdown.includes("source-note-0001"), "expected extracted unit anchor");
  assert(markdown.includes("frus1989-92v31"), "expected target volume context");
  assert(markdown.includes("Annotation Sheet Profile Context"), "expected annotation-sheet profile section");
  assert(markdown.includes("Foundations Consolidated.docx"), "expected annotation-sheet profile content");
  assert(markdown.includes("lexical_frus_structure"), "expected profile unitization policy");
  assert(markdown.includes("Extracted Status Claims"), "expected status claims section");
  assert(markdown.includes("status-claim-0001"), "expected status claim context");
  assert(markdown.includes("Authority Registry Context"), "expected authority registry section");
  assert(markdown.includes("Bush, George Herbert Walker"), "expected authority registry content");
  assert(markdown.includes("Source List And Front Matter Registry Context"), "expected source-list registry section");
  assert(markdown.includes("George H.W. Bush Presidential Library"), "expected source-list registry content");
  assert(markdown.includes("Document Metadata Registry Context"), "expected document metadata registry section");
  assert(markdown.includes("Information Memorandum From the Director of the Policy Planning Staff"), "expected document metadata registry content");
  assert(markdown.includes("Classification And Handling Registry Context"), "expected classification registry section");
  assert(markdown.includes("Top Secret; Sensitive; Eyes Only"), "expected classification registry content");
  assert(markdown.includes("No classification marking"), "expected no-classification registry content");
  assert(markdown.includes("Declassification And Omission Registry Context"), "expected declassification registry section");
  assert(markdown.includes("[less than 2 lines not declassified]"), "expected line-omission registry content");
  assert(markdown.includes("6 pages not declassified"), "expected pages-not-declassified registry content");
  assert(markdown.includes("Translation And Foreign-Origin Registry Context"), "expected translation registry section");
  assert(markdown.includes("Printed from a copy marked: “Unofficial translation.”"), "expected translation registry content");
  assert(markdown.includes("The Russian text of the paper is ibid."), "expected foreign-text registry content");
  assert(markdown.includes("Printed And Nested Attachment Registry Context"), "expected printed attachment registry section");
  assert(markdown.includes("Paper Prepared in the Soviet Ministry of Foreign Affairs"), "expected printed-in-parent attachment registry content");
  assert(markdown.includes("Attached but not printed are two papers drafted by the Arms Control Support Group"), "expected attached-but-not-printed registry content");
  assert(markdown.includes("Visual Material Registry Context"), "expected visual material registry section");
  assert(markdown.includes("map of U.S. bases surrounding the Soviet Union"), "expected map visual-material registry content");
  assert(markdown.includes("Top Soviet Pop Group"), "expected photograph caption/title registry content");
  assert(markdown.includes("An image of the notes is Appendix A"), "expected appendix-image registry content");
  assert(markdown.includes("Negative Search And No-Record Registry Context"), "expected negative-search registry section");
  assert(markdown.includes("No minutes were found"), "expected negative-search registry content");
  assert(markdown.includes("Not found attached"), "expected RAC attachment ambiguity content");
  assert(markdown.includes("Document Relationship Registry Context"), "expected document-relationship registry section");
  assert(markdown.includes("Attached but not printed. See Document 10"), "expected document-relationship registry content");
  assert(markdown.includes("Printed as Document 26"), "expected printed-as-document registry content");
  assert(markdown.includes("Communications Metadata Registry Context"), "expected communications registry section");
  assert(markdown.includes("SECTO 2017"), "expected SECTO communications registry content");
  assert(markdown.includes("424164/TOSEC 290026"), "expected TOSEC communications registry content");
  assert(markdown.includes("style_discrepancy_tally"), "expected General Editor discrepancy field");
  assert(markdown.includes("Permutation Matrix Context"), "expected permutation matrix section");

  const jsonResult = runPacket([...commonArgs, "--format", "json", "--out", jsonOut]);
  if (jsonResult.status !== 0) {
    process.stderr.write(jsonResult.stdout);
    process.stderr.write(jsonResult.stderr);
    process.exit(jsonResult.status || 1);
  }

  const packet = JSON.parse(fs.readFileSync(jsonOut, "utf8"));
  assert(packet.schema_version === "frus-llm-review-packet-v1", "expected packet schema version");
  assert(packet.run_id === "packet-smoke-test", "expected run id");
  assert(packet.extracted_units.units.length === 3, "expected three sample units");
  assert(packet.contexts.annotation_sheet_profile.profile_id === "foundations-consolidated-good-form-2026-06-03", "expected annotation-sheet profile context");
  assert(packet.packet_summary.annotation_sheet_profile_checks === 4, "expected annotation-sheet profile check count");
  assert(packet.contexts.status_registry.entries.length === 74, "expected current status entries");
  assert(packet.contexts.status_registry.target_volume.entry_id === "frus1989-92v31", "expected target status entry");
  assert(packet.contexts.status_claims.claims.length === 4, "expected extracted status claims");
  assert(packet.contexts.authority_registry.records.length === 8, "expected authority registry records");
  assert(packet.contexts.authority_registry.target_records.length > 0, "expected target authority records");
  assert(packet.contexts.source_list_registry.records.length === 10, "expected source-list registry records");
  assert(packet.contexts.source_list_registry.target_records.length > 0, "expected target source-list records");
  assert(packet.contexts.document_metadata_registry.records.length === 5, "expected document metadata registry records");
  assert(packet.contexts.document_metadata_registry.target_records.length > 0, "expected target document metadata records");
  assert(packet.contexts.classification_registry.records.length === 5, "expected classification registry records");
  assert(packet.contexts.classification_registry.target_records.length > 0, "expected target classification records");
  assert(packet.contexts.declassification_registry.records.length === 8, "expected declassification registry records");
  assert(packet.contexts.declassification_registry.target_records.length > 0, "expected target declassification records");
  assert(packet.packet_summary.declassification_registry_records === 8, "expected declassification registry count");
  assert(packet.contexts.translation_registry.records.length === 7, "expected translation registry records");
  assert(packet.contexts.translation_registry.target_records.length > 0, "expected target translation records");
  assert(packet.packet_summary.translation_registry_records === 7, "expected translation registry count");
  assert(packet.contexts.printed_attachment_registry.records.length === 6, "expected printed attachment registry records");
  assert(packet.contexts.printed_attachment_registry.target_records.length > 0, "expected target printed attachment records");
  assert(packet.packet_summary.printed_attachment_registry_records === 6, "expected printed attachment registry count");
  assert(packet.contexts.visual_material_registry.records.length === 5, "expected visual material registry records");
  assert(packet.contexts.visual_material_registry.target_records.length > 0, "expected target visual material records");
  assert(packet.packet_summary.visual_material_registry_records === 5, "expected visual material registry count");
  assert(packet.contexts.negative_search_registry.records.length === 6, "expected negative-search registry records");
  assert(packet.contexts.negative_search_registry.target_records.length > 0, "expected target negative-search records");
  assert(packet.contexts.document_relationship_registry.records.length === 10, "expected document-relationship registry records");
  assert(packet.contexts.document_relationship_registry.target_records.length > 0, "expected target document-relationship records");
  assert(packet.contexts.communications_registry.records.length === 8, "expected communications registry records");
  assert(packet.contexts.communications_registry.target_records.length > 0, "expected target communications records");
  assert(packet.contexts.preparation_router.routes.length === 74, "expected preparation routes");
  assert(packet.contexts.permutation_matrix.category_policies.length > 0, "expected matrix categories");
  assert(packet.packet_summary.output_schema.categories.includes("source_note"), "expected source_note category");

  const badUnits = path.join(tmpDir, "bad-units.json");
  fs.writeFileSync(badUnits, JSON.stringify({ schema_version: "wrong", units: [] }, null, 2));
  const badResult = runPacket(["--units", badUnits, "--format", "json"]);
  assert(badResult.status !== 0, "expected bad extracted-units document to fail");
  assert(badResult.stderr.includes("frus-extracted-units-v1"), "expected schema-version failure detail");

  console.log("FRUS LLM review packet test passed: Markdown and JSON packets include units, schema, annotation-sheet profile, status, authority, source-list, document metadata, classification, declassification, translation, printed attachment, visual material, negative-search, document-relationship, communications, router, and matrix context.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
