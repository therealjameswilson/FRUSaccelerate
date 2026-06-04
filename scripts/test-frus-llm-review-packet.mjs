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
    "--handwritten-transcription-registry",
    "reports/frus-handwritten-transcription-registry.sample.json",
    "--document-handling-registry",
    "reports/frus-document-handling-registry.sample.json",
    "--chronology-registry",
    "reports/frus-chronology-registry.sample.json",
    "--time-zone-registry",
    "reports/frus-time-zone-registry.sample.json",
    "--summit-public-event-registry",
    "reports/frus-summit-public-event-registry.sample.json",
    "--selection-balance-registry",
    "reports/frus-selection-balance-registry.sample.json",
    "--decision-process-registry",
    "reports/frus-decision-process-registry.sample.json",
    "--public-source-registry",
    "reports/frus-public-source-registry.sample.json",
    "--retrospective-account-registry",
    "reports/frus-retrospective-account-registry.sample.json",
    "--treaty-registry",
    "reports/frus-treaty-registry.sample.json",
    "--foreign-org-registry",
    "reports/frus-foreign-org-registry.sample.json",
    "--congressional-legal-registry",
    "reports/frus-congressional-legal-registry.sample.json",
    "--economic-financial-registry",
    "reports/frus-economic-financial-registry.sample.json",
    "--military-crisis-registry",
    "reports/frus-military-crisis-registry.sample.json",
    "--intelligence-law-enforcement-registry",
    "reports/frus-intelligence-law-enforcement-registry.sample.json",
    "--human-rights-refugee-global-issues-registry",
    "reports/frus-human-rights-refugee-global-issues-registry.sample.json",
    "--footnote-referback-registry",
    "reports/frus-footnote-referback-registry.sample.json",
    "--recurring-risk-registry",
    "reports/frus-recurring-risk-registry.sample.json",
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
  assert(
    markdown.includes("Handwritten And Facsimile Transcription Registry Context"),
    "expected handwritten/facsimile transcription registry section"
  );
  assert(markdown.includes("Shultz's handwritten notes"), "expected Shultz handwritten-notes transcription content");
  assert(markdown.includes("Brackets and ellipses are in the original"), "expected original brackets/ellipses content");
  assert(markdown.includes("ordinary looking trains"), "expected transcribed margin-note content");
  assert(markdown.includes("Document Handling And Marginalia Registry Context"), "expected document handling registry section");
  assert(markdown.includes("Watson initialed the memorandum on Gregg"), "expected initials and marginalia registry content");
  assert(markdown.includes("A stamped notation at the top of the memorandum reads: “Signed.”"), "expected stamped signed registry content");
  assert(markdown.includes("Chronology And Time Registry Context"), "expected chronology registry section");
  assert(markdown.includes("According to the President's Daily Diary, Bush met with Baker"), "expected chronology registry content");
  assert(markdown.includes("there is no indication as to when precisely the telephone calls took place"), "expected no-precise-time chronology content");
  assert(markdown.includes("Time-Zone And Date-Time Group Registry Context"), "expected time-zone registry section");
  assert(markdown.includes("Geneva, January 10, 1991, 1757Z"), "expected START I Z-time registry content");
  assert(markdown.includes("open of business Washington time"), "expected Washington-time deadline registry content");
  assert(markdown.includes("treaty/legal-instrument timing provision"), "expected treaty timing registry content");
  assert(markdown.includes("Summit Travel And Public Event Registry Context"), "expected summit/public-event registry section");
  assert(markdown.includes("START signing ceremony in Moscow"), "expected START signing public-event content");
  assert(markdown.includes("London Economic Summit on July 17"), "expected London Economic Summit public-event content");
  assert(markdown.includes("CBS television network"), "expected Reagan/CBS public-event content");
  assert(markdown.includes("Selection Balance And Completeness Registry Context"), "expected selection-balance registry section");
  assert(
    markdown.includes("complete memorandum of conversation is scheduled for publication"),
    "expected complete-record-elsewhere selection-balance content"
  );
  assert(markdown.includes("Decision Process And Directive Registry Context"), "expected decision-process registry section");
  assert(markdown.includes("National Security Review 14"), "expected NSR decision-process registry content");
  assert(markdown.includes("National Security Decision Directive 236"), "expected NSDD decision-process registry content");
  assert(markdown.includes("Public Source And Public Diplomacy Registry Context"), "expected public-source registry section");
  assert(markdown.includes("Public Papers: Bush, 1991, pages 986-987"), "expected Public Papers registry content");
  assert(markdown.includes("Department of State Dispatch Supplement, October 1991"), "expected Department of State Dispatch registry content");
  assert(markdown.includes("Retrospective Account Registry Context"), "expected retrospective-account registry section");
  assert(markdown.includes("In his memoir, Shultz described the segment"), "expected Shultz memoir registry content");
  assert(markdown.includes("official-record relationship"), "expected retrospective-account guardrail text");
  assert(markdown.includes("Treaty And Legal Instrument Registry Context"), "expected treaty registry section");
  assert(markdown.includes("Conversion or Elimination Protocol"), "expected treaty registry content");
  assert(markdown.includes("associated with, but not integral parts of, the Treaty"), "expected treaty associated-document content");
  assert(markdown.includes("Foreign And International Organization Registry Context"), "expected foreign-org registry section");
  assert(markdown.includes("ASEAN [Association of Southeast Asian Nations]"), "expected regional-organization registry content");
  assert(markdown.includes("President of the Union of Soviet Socialist Republics"), "expected foreign-state registry content");
  assert(markdown.includes("Congressional And Legal Authority Registry Context"), "expected congressional/legal registry section");
  assert(markdown.includes("submitted to the Senate for its advice and consent"), "expected Senate advice-and-consent registry content");
  assert(markdown.includes("Economic Recovery Tax Act of 1981"), "expected public-law registry content");
  assert(markdown.includes("Presidential Determination No. 83-6"), "expected Presidential Determination registry content");
  assert(markdown.includes("Economic And Financial Registry Context"), "expected economic/financial registry section");
  assert(markdown.includes("A 47 percent increase in resources has been approved"), "expected IMF quota registry content");
  assert(markdown.includes("the Bank's $75 billion Eighth General Capital Increase"), "expected World Bank GCI registry content");
  assert(markdown.includes("State/AID ESF, the entire AID organization"), "expected aid-finance registry content");
  assert(markdown.includes("Military And Crisis Operations Registry Context"), "expected military/crisis registry section");
  assert(markdown.includes("Stairstep program in the Gulf of Sidra"), "expected Gulf of Sidra operation registry content");
  assert(markdown.includes("Rabta chemical plant"), "expected Rabta/CW registry content");
  assert(markdown.includes("Persian Gulf will remain open to navigation"), "expected Persian Gulf navigation registry content");
  assert(
    markdown.includes("Intelligence And Law Enforcement Registry Context"),
    "expected intelligence/law-enforcement registry section"
  );
  assert(
    markdown.includes("Deputy Director for Operations, Central Intelligence Agency"),
    "expected CIA DDO registry content"
  );
  assert(markdown.includes("Bureau of Counter-Terrorism Records"), "expected counterterrorism registry content");
  assert(markdown.includes("Counter Narcotics in Peru"), "expected counternarcotics registry content");
  assert(
    markdown.includes("Human Rights Refugee And Global Issues Registry Context"),
    "expected human-rights/refugee/global-issues registry section"
  );
  assert(markdown.includes("Annual Country Reports on Human Rights Practices"), "expected Country Reports registry content");
  assert(
    markdown.includes("USING PL 480 TITLE II FOOD AID FOR EMERGENCY OR REFUGEE RELIEF"),
    "expected PL 480 food-aid registry content"
  );
  assert(
    markdown.includes("Convention for the Protection of the Ozone Layer"),
    "expected ozone convention registry content"
  );
  assert(markdown.includes("Footnote Refer-Back Registry Context"), "expected footnote refer-back registry section");
  assert(markdown.includes("repeat_threshold"), "expected footnote refer-back repeat threshold in Markdown packet");
  assert(markdown.includes("See footnote 6, Document 35"), "expected cross-document footnote refer-back content");
  assert(markdown.includes("footnote 15, Document 106"), "expected three-target footnote refer-back content");
  assert(markdown.includes("same separate page as B above"), "expected same-document local-context refer-back content");
  assert(markdown.includes("Recurring Compiler Risk Registry Context"), "expected recurring-risk registry section");
  assert(markdown.includes("Telegram number has a leading zero"), "expected recurring-risk registry content");
  assert(markdown.includes("Cross-reference slug or clue is incomplete"), "expected cross-reference recurring-risk content");
  assert(markdown.includes("Document XX cross-reference construction"), "expected Document XX recurring-risk content");
  assert(markdown.includes("Footnote refer-back rule may be missed"), "expected footnote refer-back recurring-risk content");
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
  assert(
    packet.contexts.handwritten_transcription_registry.records.length === 5,
    "expected handwritten/facsimile transcription registry records"
  );
  assert(
    packet.contexts.handwritten_transcription_registry.target_records.length === 0,
    "expected no target handwritten/facsimile records for START volume fixture"
  );
  assert(
    packet.packet_summary.handwritten_transcription_registry_records === 5,
    "expected handwritten/facsimile transcription registry count"
  );
  assert(packet.contexts.document_handling_registry.records.length === 7, "expected document handling registry records");
  assert(packet.contexts.document_handling_registry.target_records.length > 0, "expected target document handling records");
  assert(packet.packet_summary.document_handling_registry_records === 7, "expected document handling registry count");
  assert(packet.contexts.chronology_registry.records.length === 6, "expected chronology registry records");
  assert(packet.contexts.chronology_registry.target_records.length > 0, "expected target chronology records");
  assert(packet.packet_summary.chronology_registry_records === 6, "expected chronology registry count");
  assert(packet.contexts.time_zone_registry.records.length === 8, "expected time-zone registry records");
  assert(packet.contexts.time_zone_registry.target_records.length > 0, "expected target time-zone records");
  assert(packet.packet_summary.time_zone_registry_records === 8, "expected time-zone registry count");
  assert(packet.contexts.summit_public_event_registry.events.length === 6, "expected summit/public-event registry records");
  assert(
    packet.contexts.summit_public_event_registry.target_records.length === 3,
    "expected target summit/public-event records"
  );
  assert(
    packet.packet_summary.summit_public_event_registry_records === 6,
    "expected summit/public-event registry count"
  );
  assert(packet.contexts.selection_balance_registry.records.length === 8, "expected selection-balance registry records");
  assert(
    packet.contexts.selection_balance_registry.target_records.length === 6,
    "expected target selection-balance records"
  );
  assert(packet.packet_summary.selection_balance_registry_records === 8, "expected selection-balance registry count");
  assert(packet.contexts.decision_process_registry.records.length === 12, "expected decision-process registry records");
  assert(
    packet.contexts.decision_process_registry.target_records.length === 9,
    "expected target decision-process records"
  );
  assert(packet.packet_summary.decision_process_registry_records === 12, "expected decision-process registry count");
  assert(packet.contexts.public_source_registry.records.length === 6, "expected public-source registry records");
  assert(packet.contexts.public_source_registry.target_records.length > 0, "expected target public-source records");
  assert(packet.packet_summary.public_source_registry_records === 6, "expected public-source registry count");
  assert(packet.contexts.retrospective_account_registry.records.length === 6, "expected retrospective-account registry records");
  assert(
    packet.contexts.retrospective_account_registry.target_records.length === 0,
    "expected no target retrospective-account records for cross-volume Reagan sample"
  );
  assert(
    packet.packet_summary.retrospective_account_registry_records === 6,
    "expected retrospective-account registry count"
  );
  assert(packet.contexts.treaty_registry.records.length === 7, "expected treaty registry records");
  assert(packet.contexts.treaty_registry.target_records.length > 0, "expected target treaty records");
  assert(packet.packet_summary.treaty_registry_records === 7, "expected treaty registry count");
  assert(packet.contexts.foreign_org_registry.records.length === 10, "expected foreign-org registry records");
  assert(packet.contexts.foreign_org_registry.target_records.length > 0, "expected target foreign-org records");
  assert(packet.packet_summary.foreign_org_registry_records === 10, "expected foreign-org registry count");
  assert(packet.contexts.congressional_legal_registry.records.length === 16, "expected congressional/legal registry records");
  assert(
    packet.contexts.congressional_legal_registry.target_records.length === 5,
    "expected target congressional/legal records"
  );
  assert(packet.packet_summary.congressional_legal_registry_records === 16, "expected congressional/legal registry count");
  assert(packet.contexts.economic_financial_registry.records.length === 20, "expected economic/financial registry records");
  assert(
    packet.contexts.economic_financial_registry.target_records.length === 0,
    "expected zero target economic/financial records for START volume fixture"
  );
  assert(packet.packet_summary.economic_financial_registry_records === 20, "expected economic/financial registry count");
  assert(packet.contexts.military_crisis_registry.records.length === 16, "expected military/crisis registry records");
  assert(
    packet.contexts.military_crisis_registry.target_records.length === 0,
    "expected zero target military/crisis records for START volume fixture"
  );
  assert(packet.packet_summary.military_crisis_registry_records === 16, "expected military/crisis registry count");
  assert(
    packet.contexts.intelligence_law_enforcement_registry.records.length === 15,
    "expected intelligence/law-enforcement registry records"
  );
  assert(
    packet.contexts.intelligence_law_enforcement_registry.target_records.length === 1,
    "expected one target intelligence/law-enforcement record for START volume fixture"
  );
  assert(
    packet.packet_summary.intelligence_law_enforcement_registry_records === 15,
    "expected intelligence/law-enforcement registry count"
  );
  assert(
    packet.contexts.human_rights_refugee_global_issues_registry.records.length === 12,
    "expected human-rights/refugee/global-issues registry records"
  );
  assert(
    packet.contexts.human_rights_refugee_global_issues_registry.target_records.length === 0,
    "expected no target human-rights/refugee/global-issues records for START volume fixture"
  );
  assert(
    packet.packet_summary.human_rights_refugee_global_issues_registry_records === 12,
    "expected human-rights/refugee/global-issues registry count"
  );
  assert(packet.contexts.footnote_referback_registry.records.length === 8, "expected footnote refer-back registry records");
  assert(packet.contexts.footnote_referback_registry.repeat_threshold === 3, "expected footnote refer-back threshold context");
  assert(
    packet.contexts.footnote_referback_registry.target_records.length === 0,
    "expected no target footnote refer-back records for cross-volume Reagan sample"
  );
  assert(packet.packet_summary.footnote_referback_registry_records === 8, "expected footnote refer-back registry count");
  assert(packet.contexts.recurring_risk_registry.records.length === 13, "expected recurring-risk registry records");
  assert(packet.packet_summary.recurring_risk_registry_records === 13, "expected recurring-risk registry count");
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

  console.log("FRUS LLM review packet test passed: Markdown and JSON packets include units, schema, annotation-sheet profile, status, authority, source-list, document metadata, classification, declassification, translation, printed attachment, visual material, handwritten/facsimile, document handling, chronology, time-zone, summit/public-event, selection-balance, decision-process, public-source, retrospective-account, treaty, foreign-org, congressional/legal, economic/financial, military/crisis, intelligence/law-enforcement, human-rights/refugee/global-issues, footnote refer-back, recurring-risk, negative-search, document-relationship, communications, router, and matrix context.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
