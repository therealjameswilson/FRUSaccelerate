#!/usr/bin/env node

import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const agentPath = "FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md";
const stressPath = "reports/frus-annotation-sheet-builder-archetype-stress-tests.md";

const agent = fs.readFileSync(agentPath, "utf8");
const stress = fs.readFileSync(stressPath, "utf8");

const enumMatch = agent.match(/"pdf_archetype": "([^"]+)"/);
assert(enumMatch, "expected pdf_archetype enum in builder schema");

const archetypes = enumMatch[1].split("|").map((value) => value.trim()).filter(Boolean);
const duplicateArchetypes = archetypes.filter((value, index) => archetypes.indexOf(value) !== index);
assert(duplicateArchetypes.length === 0, `duplicate archetypes: ${duplicateArchetypes.join(", ")}`);

const coverageHints = new Map([
  ["archival_photocopy", /archival photocopy|FOIA marker|declassification stamp|source backup/i],
  ["appendix_or_facsimile", /appendix_or_facsimile|appendix\/facsimile|image-only appendix facsimile/i],
  ["attachment_packet", /attachment packet|attached tabs|whole packet|excerpts/i],
  ["declassification_packet", /declassification_packet|declassification packet|release\/declassification|FOIA\/MDR marker/i],
  ["source_register_or_finding_aid", /source_register_or_finding_aid|source-register|finding aid|folder-title list/i],
  ["mixed_or_unclear", /mixed_or_unclear|mixed source packets|unclear_requires_compiler_instruction|whole packet, or excerpts/i]
]);

const missingCoverage = archetypes.filter((archetype) => {
  if (stress.includes(archetype)) return false;
  const hint = coverageHints.get(archetype);
  return !(hint && hint.test(stress));
});

assert(
  missingCoverage.length === 0,
  `missing stress coverage for pdf_archetype values: ${missingCoverage.join(", ")}`
);

assert(
  stress.includes("frus1981-88v01-d272-handwritten-notes-excerpt.pdf") &&
    stress.includes("handwritten_note_or_transcribed_source"),
  "expected official handwritten transcribed-source stress fixture"
);

assert(
  stress.includes("frus1981-88v01-appendix-a-handwritten-notes-excerpt.pdf") &&
    stress.includes("appendix_or_facsimile"),
  "expected official appendix/facsimile image stress fixture"
);

assert(
  stress.includes("frus1981-88v06-d182-telephone-conversation-excerpt.pdf") &&
    stress.includes("memcon_or_telcon"),
  "expected official memorandum of telephone conversation stress fixture"
);

assert(
  stress.includes("frus1989-92v31-d247-treaty-transmittal-excerpt.pdf") &&
    stress.includes("treaty_or_transmittal_package"),
  "expected official treaty transmittal package stress fixture"
);

assert(
  stress.includes("frus1981-88v01-d299-tape-transcript-recorded-proceeding-excerpt.pdf") &&
    stress.includes("recorded_proceeding_or_tape_transcript"),
  "expected official recorded proceeding/tape transcript stress fixture"
);

assert(
  stress.includes("frus1981-88v01-sources-section-excerpt.pdf") &&
    stress.includes("source_register_or_finding_aid"),
  "expected official Sources section/finding-aid stress fixture"
);

assert(
  stress.includes("frus1981-88v11-d6-nssd3-82-excerpt.pdf") &&
    stress.includes("policy_review_or_study_directive"),
  "expected official National Security Study Directive stress fixture"
);

console.log(
  `FRUS annotation builder archetype coverage test passed: ${archetypes.length} schema archetypes have stress coverage or explicit fallback coverage.`
);
