# FRUS Annotation Review Packet Chunk

- run_id: chunk-workflow-test
- chunk_id: chunk-0002
- chunk_index: 2
- chunk_count: 2
- unit_id_range: source-note-0003 to source-note-0003
- target_volume: frus1989-92v31

Return only one valid `checker-output-v1` JSON object for this chunk. Every reviewable unit in this chunk needs a checker entry; use `no_change` when the unit is sound.

Do not include units outside this chunk. Do not claim to edit the Word file directly. The wrapper will merge and validate chunk outputs before applying Word comments or tracked changes.

## Chunk Manifest

```json
{
  "schema_version": "frus-llm-review-chunk-v1",
  "run_id": "chunk-workflow-test",
  "chunk_id": "chunk-0002",
  "chunk_index": 2,
  "chunk_count": 2,
  "unit_ids": [
    "source-note-0003"
  ],
  "reviewable_unit_ids": [
    "source-note-0003"
  ]
}
```

## Runtime FRUS Annotation Checker Guide

# FRUS Annotation Checker Core Prompt

Version: 2026-06-04

Use this compact file when a closed-network LLM cannot fit the full
`frus-annotation-checker.md` standard in context. This file is a standalone
operating prompt for reviewing Microsoft Word annotation sheets. It preserves
the core behavior: act as a bespoke FRUS annotation spellcheck, return strict
JSON, and let a wrapper apply real Word tracked changes.

The full reference standard remains `reports/frus-annotation-checker.md`.
Wrappers can validate LLM output with
`reports/frus-annotation-checker-output.schema.json` before applying tracked
changes.
For no-dependency DOCX unit extraction, run
`node scripts/extract-frus-docx-units.mjs --docx input.docx --out extracted-units.json --format text`.
For uploaded annotation sheets that resemble the finished-form exemplar, audit
flat Word structure, lexical unitization, and production pseudo-markers with
`node scripts/audit-frus-annotation-sheet-profile.mjs --profile reports/frus-annotation-sheet-profile.sample.json --units extracted-units.json --checker-output output.json --format text`.
For the per-document Markdown packet that a closed-network LLM should review,
run
`node scripts/build-frus-llm-review-packet.mjs --units extracted-units.json --out review-packet.md --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --source-family-registry reports/frus-source-family-registry.sample.json --source-surrogate-registry reports/frus-source-surrogate-registry.sample.json --document-status-lifecycle-registry reports/frus-document-status-lifecycle-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --classification-registry reports/frus-classification-registry.sample.json --declassification-registry reports/frus-declassification-registry.sample.json --editorial-method-registry reports/frus-editorial-method-registry.sample.json --translation-registry reports/frus-translation-registry.sample.json --printed-attachment-registry reports/frus-printed-attachment-registry.sample.json --visual-material-registry reports/frus-visual-material-registry.sample.json --handwritten-transcription-registry reports/frus-handwritten-transcription-registry.sample.json --document-handling-registry reports/frus-document-handling-registry.sample.json --chronology-registry reports/frus-chronology-registry.sample.json --meeting-attendance-registry reports/frus-meeting-attendance-registry.sample.json --time-zone-registry reports/frus-time-zone-registry.sample.json --summit-public-event-registry reports/frus-summit-public-event-registry.sample.json --selection-balance-registry reports/frus-selection-balance-registry.sample.json --decision-process-registry reports/frus-decision-process-registry.sample.json --public-source-registry reports/frus-public-source-registry.sample.json --treaty-registry reports/frus-treaty-registry.sample.json --foreign-org-registry reports/frus-foreign-org-registry.sample.json --congressional-legal-registry reports/frus-congressional-legal-registry.sample.json --economic-financial-registry reports/frus-economic-financial-registry.sample.json --military-crisis-registry reports/frus-military-crisis-registry.sample.json --intelligence-law-enforcement-registry reports/frus-intelligence-law-enforcement-registry.sample.json --human-rights-refugee-global-issues-registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --footnote-referback-registry reports/frus-footnote-referback-registry.sample.json --recurring-risk-registry reports/frus-recurring-risk-registry.sample.json --negative-search-registry reports/frus-negative-search-registry.sample.json --document-relationship-registry reports/frus-document-relationship-registry.sample.json --communications-registry reports/frus-communications-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID`.
For small-context LLMs that cannot fit a whole sheet, build chunk packets with
`node scripts/build-frus-llm-review-chunks.mjs --units extracted-units.json --out-dir review-chunks --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --source-family-registry reports/frus-source-family-registry.sample.json --source-surrogate-registry reports/frus-source-surrogate-registry.sample.json --document-status-lifecycle-registry reports/frus-document-status-lifecycle-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --classification-registry reports/frus-classification-registry.sample.json --declassification-registry reports/frus-declassification-registry.sample.json --editorial-method-registry reports/frus-editorial-method-registry.sample.json --translation-registry reports/frus-translation-registry.sample.json --printed-attachment-registry reports/frus-printed-attachment-registry.sample.json --visual-material-registry reports/frus-visual-material-registry.sample.json --handwritten-transcription-registry reports/frus-handwritten-transcription-registry.sample.json --document-handling-registry reports/frus-document-handling-registry.sample.json --chronology-registry reports/frus-chronology-registry.sample.json --meeting-attendance-registry reports/frus-meeting-attendance-registry.sample.json --time-zone-registry reports/frus-time-zone-registry.sample.json --summit-public-event-registry reports/frus-summit-public-event-registry.sample.json --selection-balance-registry reports/frus-selection-balance-registry.sample.json --decision-process-registry reports/frus-decision-process-registry.sample.json --public-source-registry reports/frus-public-source-registry.sample.json --treaty-registry reports/frus-treaty-registry.sample.json --foreign-org-registry reports/frus-foreign-org-registry.sample.json --congressional-legal-registry reports/frus-congressional-legal-registry.sample.json --economic-financial-registry reports/frus-economic-financial-registry.sample.json --military-crisis-registry reports/frus-military-crisis-registry.sample.json --intelligence-law-enforcement-registry reports/frus-intelligence-law-enforcement-registry.sample.json --human-rights-refugee-global-issues-registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --footnote-referback-registry reports/frus-footnote-referback-registry.sample.json --recurring-risk-registry reports/frus-recurring-risk-registry.sample.json --negative-search-registry reports/frus-negative-search-registry.sample.json --document-relationship-registry reports/frus-document-relationship-registry.sample.json --communications-registry reports/frus-communications-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID --max-units 12`, then merge outputs with
`node scripts/merge-frus-checker-chunks.mjs --manifest review-chunks/chunk-manifest.json --output chunk-0001=review-chunks/chunk-0001-checker-output.json --output chunk-0002=review-chunks/chunk-0002-checker-output.json --out output.json`, repeating `--output` for every chunk listed in the manifest.
For automatic publication-status claim extraction before packet building or
runner preflight, run
`node scripts/extract-frus-status-claims.mjs --units extracted-units.json --registry reports/frus-status-series-1981-1992.current.json --checker-output output.json --out status-claims.json --format text`.
For per-document review coverage, run
`node scripts/audit-frus-review-coverage.mjs --units extracted-units.json --output output.json --matrix reports/frus-annotation-permutation-matrix.json`.
For authority-control validation and direct-edit safety, run
`node scripts/validate-frus-authority-registry.mjs --registry reports/frus-authority-registry.sample.json --format text` and
`node scripts/audit-frus-authority-usage.mjs --units extracted-units.json --registry reports/frus-authority-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For source-list/front-matter validation and direct-edit safety, run
`node scripts/validate-frus-source-list-registry.mjs --registry reports/frus-source-list-registry.sample.json --format text` and
`node scripts/audit-frus-source-list-usage.mjs --units extracted-units.json --registry reports/frus-source-list-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For source-family validation and direct-edit safety, run
`node scripts/validate-frus-source-family-registry.mjs --registry reports/frus-source-family-registry.sample.json --format text` and
`node scripts/audit-frus-source-family-usage.mjs --units extracted-units.json --registry reports/frus-source-family-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`; preserve PROFS, W Files, System IV, H-Files, CFPF reels, and public-source families rather than flattening them into generic repository paths.
For source-surrogate/release validation and direct-edit safety, run
`node scripts/validate-frus-source-surrogate-registry.mjs --registry reports/frus-source-surrogate-registry.sample.json --format text` and
`node scripts/audit-frus-source-surrogate-usage.mjs --units extracted-units.json --registry reports/frus-source-surrogate-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For document-status/lifecycle validation and direct-edit safety, run
`node scripts/validate-frus-document-status-lifecycle-registry.mjs --registry reports/frus-document-status-lifecycle-registry.sample.json --format text` and
`node scripts/audit-frus-document-status-lifecycle-usage.mjs --units extracted-units.json --registry reports/frus-document-status-lifecycle-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For document-metadata validation and direct-edit safety, run
`node scripts/validate-frus-document-metadata-registry.mjs --registry reports/frus-document-metadata-registry.sample.json --format text` and
`node scripts/audit-frus-document-metadata-usage.mjs --units extracted-units.json --registry reports/frus-document-metadata-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For classification/handling validation and direct-edit safety, run
`node scripts/validate-frus-classification-registry.mjs --registry reports/frus-classification-registry.sample.json --format text` and
`node scripts/audit-frus-classification-usage.mjs --units extracted-units.json --registry reports/frus-classification-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For declassification/omission validation and direct-edit safety, run
`node scripts/validate-frus-declassification-registry.mjs --registry reports/frus-declassification-registry.sample.json --format text` and
`node scripts/audit-frus-declassification-usage.mjs --units extracted-units.json --registry reports/frus-declassification-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For editorial-method/original-text validation and direct-edit safety, run
`node scripts/validate-frus-editorial-method-registry.mjs --registry reports/frus-editorial-method-registry.sample.json --format text` and
`node scripts/audit-frus-editorial-method-usage.mjs --units extracted-units.json --registry reports/frus-editorial-method-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For translation/foreign-origin validation and direct-edit safety, run
`node scripts/validate-frus-translation-registry.mjs --registry reports/frus-translation-registry.sample.json --format text` and
`node scripts/audit-frus-translation-usage.mjs --units extracted-units.json --registry reports/frus-translation-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For printed/nested attachment validation and direct-edit safety, run
`node scripts/validate-frus-printed-attachment-registry.mjs --registry reports/frus-printed-attachment-registry.sample.json --format text` and
`node scripts/audit-frus-printed-attachment-usage.mjs --units extracted-units.json --registry reports/frus-printed-attachment-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For visual-material validation and direct-edit safety, run
`node scripts/validate-frus-visual-material-registry.mjs --registry reports/frus-visual-material-registry.sample.json --format text` and
`node scripts/audit-frus-visual-material-usage.mjs --units extracted-units.json --registry reports/frus-visual-material-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For handwritten/facsimile transcription validation and direct-edit safety, run
`node scripts/validate-frus-handwritten-transcription-registry.mjs --registry reports/frus-handwritten-transcription-registry.sample.json --format text` and
`node scripts/audit-frus-handwritten-transcription-usage.mjs --units extracted-units.json --registry reports/frus-handwritten-transcription-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For document-handling/marginalia validation and direct-edit safety, run
`node scripts/validate-frus-document-handling-registry.mjs --registry reports/frus-document-handling-registry.sample.json --format text` and
`node scripts/audit-frus-document-handling-usage.mjs --units extracted-units.json --registry reports/frus-document-handling-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For chronology/time validation and direct-edit safety, run
`node scripts/validate-frus-chronology-registry.mjs --registry reports/frus-chronology-registry.sample.json --format text` and
`node scripts/audit-frus-chronology-usage.mjs --units extracted-units.json --registry reports/frus-chronology-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For meeting attendance and participant-list validation, run
`node scripts/validate-frus-meeting-attendance-registry.mjs --registry reports/frus-meeting-attendance-registry.sample.json --format text` and
`node scripts/audit-frus-meeting-attendance-usage.mjs --units extracted-units.json --registry reports/frus-meeting-attendance-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`. Use the registry to protect Daily Diary attendance basis, exact participant names, partial attendance windows, participant-list status, and no-minutes/no-memcon caveats; direct edits that add or remove attendees, flatten partial attendance, infer a participant list, or change no-record language require target-volume registry support.
For time-zone/date-time-group validation and direct-edit safety, run
`node scripts/validate-frus-time-zone-registry.mjs --registry reports/frus-time-zone-registry.sample.json --format text` and
`node scripts/audit-frus-time-zone-usage.mjs --units extracted-units.json --registry reports/frus-time-zone-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For summit/public-event validation and direct-edit safety, run
`node scripts/validate-frus-summit-public-event-registry.mjs --registry reports/frus-summit-public-event-registry.sample.json --format text` and
`node scripts/audit-frus-summit-public-event-usage.mjs --units extracted-units.json --registry reports/frus-summit-public-event-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For selection-balance/completeness validation and direct-edit safety, run
`node scripts/validate-frus-selection-balance-registry.mjs --registry reports/frus-selection-balance-registry.sample.json --format text` and
`node scripts/audit-frus-selection-balance-usage.mjs --units extracted-units.json --registry reports/frus-selection-balance-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For decision-process/directive validation and direct-edit safety, run
`node scripts/validate-frus-decision-process-registry.mjs --registry reports/frus-decision-process-registry.sample.json --format text` and
`node scripts/audit-frus-decision-process-usage.mjs --units extracted-units.json --registry reports/frus-decision-process-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For public-source/public-diplomacy validation and direct-edit safety, run
`node scripts/validate-frus-public-source-registry.mjs --registry reports/frus-public-source-registry.sample.json --format text` and
`node scripts/audit-frus-public-source-usage.mjs --units extracted-units.json --registry reports/frus-public-source-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For treaty/legal-instrument validation and direct-edit safety, run
`node scripts/validate-frus-treaty-registry.mjs --registry reports/frus-treaty-registry.sample.json --format text` and
`node scripts/audit-frus-treaty-usage.mjs --units extracted-units.json --registry reports/frus-treaty-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For foreign/international-organization validation and direct-edit safety, run
`node scripts/validate-frus-foreign-org-registry.mjs --registry reports/frus-foreign-org-registry.sample.json --format text` and
`node scripts/audit-frus-foreign-org-usage.mjs --units extracted-units.json --registry reports/frus-foreign-org-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For congressional/legal authority validation and direct-edit safety, run
`node scripts/validate-frus-congressional-legal-registry.mjs --registry reports/frus-congressional-legal-registry.sample.json --format text` and
`node scripts/audit-frus-congressional-legal-usage.mjs --units extracted-units.json --registry reports/frus-congressional-legal-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For economic/financial validation and direct-edit safety, run
`node scripts/validate-frus-economic-financial-registry.mjs --registry reports/frus-economic-financial-registry.sample.json --format text` and
`node scripts/audit-frus-economic-financial-usage.mjs --units extracted-units.json --registry reports/frus-economic-financial-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For military/crisis validation and direct-edit safety, run
`node scripts/validate-frus-military-crisis-registry.mjs --registry reports/frus-military-crisis-registry.sample.json --format text` and
`node scripts/audit-frus-military-crisis-usage.mjs --units extracted-units.json --registry reports/frus-military-crisis-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For intelligence/law-enforcement validation and direct-edit safety, run
`node scripts/validate-frus-intelligence-law-enforcement-registry.mjs --registry reports/frus-intelligence-law-enforcement-registry.sample.json --format text` and
`node scripts/audit-frus-intelligence-law-enforcement-usage.mjs --units extracted-units.json --registry reports/frus-intelligence-law-enforcement-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For human-rights/refugee/global-issues validation and direct-edit safety, run
`node scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs --registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --format text` and
`node scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs --units extracted-units.json --registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For footnote refer-back validation and direct-edit safety, run
`node scripts/validate-frus-footnote-referback-registry.mjs --registry reports/frus-footnote-referback-registry.sample.json --format text` and
`node scripts/audit-frus-footnote-referback-usage.mjs --units extracted-units.json --registry reports/frus-footnote-referback-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For recurring compiler-risk spellcheck validation, run
`node scripts/validate-frus-recurring-risk-registry.mjs --registry reports/frus-recurring-risk-registry.sample.json --format text` and
`node scripts/audit-frus-recurring-risk-usage.mjs --units extracted-units.json --registry reports/frus-recurring-risk-registry.sample.json --checker-output output.json --format text`.
For negative-search/no-record validation and direct-edit safety, run
`node scripts/validate-frus-negative-search-registry.mjs --registry reports/frus-negative-search-registry.sample.json --format text` and
`node scripts/audit-frus-negative-search-usage.mjs --units extracted-units.json --registry reports/frus-negative-search-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For document-relationship validation and direct-edit safety, run
`node scripts/validate-frus-document-relationship-registry.mjs --registry reports/frus-document-relationship-registry.sample.json --format text` and
`node scripts/audit-frus-document-relationship-usage.mjs --units extracted-units.json --registry reports/frus-document-relationship-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For communications metadata validation and direct-edit safety, run
`node scripts/validate-frus-communications-registry.mjs --registry reports/frus-communications-registry.sample.json --format text` and
`node scripts/audit-frus-communications-usage.mjs --units extracted-units.json --registry reports/frus-communications-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
For a no-dependency smoke test, run
`node scripts/validate-frus-checker-output.mjs reports/frus-annotation-checker-sample-output.json`.
For direct-edit anchor preflight, run
`node scripts/preflight-frus-checker-plan.mjs --units reports/frus-annotation-checker-extracted-units.sample.json --output reports/frus-annotation-checker-direct-edit-sample-output.json`.
For narrow tracked-change application after validation and preflight, run
`node scripts/apply-frus-track-changes.mjs --docx input.docx --units extracted-units.json --checker-output output.json --out revised.docx`.
For safe `comment_only` findings, run
`node scripts/apply-frus-word-comments.mjs --docx input.docx --units extracted-units.json --checker-output output.json --out commented.docx`.
For post-write DOCX release validation, run
`node scripts/validate-frus-docx-output.mjs --docx revised.docx --expect-comments N --expect-insertions N --expect-deletions N`.
For the full wrapper pass after the LLM returns checker JSON, run
`node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID`.
For status-sensitive Reagan/Bush packets, add
`--annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --source-family-registry reports/frus-source-family-registry.sample.json --source-surrogate-registry reports/frus-source-surrogate-registry.sample.json --document-status-lifecycle-registry reports/frus-document-status-lifecycle-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --classification-registry reports/frus-classification-registry.sample.json --declassification-registry reports/frus-declassification-registry.sample.json --editorial-method-registry reports/frus-editorial-method-registry.sample.json --translation-registry reports/frus-translation-registry.sample.json --printed-attachment-registry reports/frus-printed-attachment-registry.sample.json --visual-material-registry reports/frus-visual-material-registry.sample.json --handwritten-transcription-registry reports/frus-handwritten-transcription-registry.sample.json --document-handling-registry reports/frus-document-handling-registry.sample.json --chronology-registry reports/frus-chronology-registry.sample.json --meeting-attendance-registry reports/frus-meeting-attendance-registry.sample.json --time-zone-registry reports/frus-time-zone-registry.sample.json --summit-public-event-registry reports/frus-summit-public-event-registry.sample.json --selection-balance-registry reports/frus-selection-balance-registry.sample.json --decision-process-registry reports/frus-decision-process-registry.sample.json --public-source-registry reports/frus-public-source-registry.sample.json --treaty-registry reports/frus-treaty-registry.sample.json --foreign-org-registry reports/frus-foreign-org-registry.sample.json --congressional-legal-registry reports/frus-congressional-legal-registry.sample.json --economic-financial-registry reports/frus-economic-financial-registry.sample.json --military-crisis-registry reports/frus-military-crisis-registry.sample.json --intelligence-law-enforcement-registry reports/frus-intelligence-law-enforcement-registry.sample.json --human-rights-refugee-global-issues-registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --footnote-referback-registry reports/frus-footnote-referback-registry.sample.json --recurring-risk-registry reports/frus-recurring-risk-registry.sample.json --negative-search-registry reports/frus-negative-search-registry.sample.json --document-relationship-registry reports/frus-document-relationship-registry.sample.json --communications-registry reports/frus-communications-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --today YYYY-MM-DD`.
If status-bearing phrases have been extracted into a claims file, also add
`--status-claims status-claims.json`.
For status-language preflight, run
`node scripts/preflight-frus-status-claims.mjs --registry reports/frus-status-registry-1981-1992.sample.json --claims reports/frus-status-claims.sample.json --today 2026-06-03`.
For real Reagan/Bush 1981-1992 status and cross-reference review, validate and
use `reports/frus-status-series-1981-1992.current.json` with
`scripts/validate-frus-status-registry.mjs` before direct status-language edits.
For real Reagan/Bush 1981-1992 authority-control review, replace the sample
authority registry with a volume-specific registry built from the target
volume's Persons, Abbreviations and Terms, Source List/front matter, and Index
forms; validate it with `scripts/validate-frus-authority-registry.mjs` before
direct authority-control edits.
For real Reagan/Bush 1981-1992 source-list/front-matter review, replace the
sample source-list registry with a volume-specific registry built from the
target volume's Sources page, repository families, lot files, Presidential
Library files, electronic file systems, and published sources; validate it with
`scripts/validate-frus-source-list-registry.mjs` before direct source-list
edits.
For real Reagan/Bush 1981-1992 source-surrogate/release review, replace the
sample source-surrogate registry with target-volume records for RAC, NLR,
no-N-number, FOIA/MDR, NARA catalog, PDF, scan, URL, release-package, W Files,
PROFS, eRecords, internet-resource, transfer-to-NARA, and provisional discovery
labels. Treat those identifiers as locators or access context, not proof of a
repository path, source family, classification, attachment status, physical-file
completeness, or source-image content unless the registry proves the exact
direct edit; validate it with
`scripts/validate-frus-source-surrogate-registry.mjs` before direct
source-surrogate edits.
For real Reagan/Bush 1981-1992 document-status/lifecycle review, replace the
sample document-status lifecycle registry with target-volume records for
prepared-by, drafted-by, cleared-by, copied-to, sent-for-action, sent-through,
stamped/read/signed, copy/version, draft/prior-version, no-minutes/no-record,
missing-page, and incomplete-copy language. Treat lifecycle facts as evidence,
not ornament: do not upgrade `saw` into approval, do not drop uninitialed-copy
or draft-version status, and do not infer routing or clearance without source
image or target-volume registry support.
For real Reagan/Bush 1981-1992 document-metadata review, replace the sample
document-metadata registry with target-volume document-page records covering
document number, heading, date line, subject/title, sender/recipient,
attachment behavior, editorial-note form, and source-note linkage; validate it
with `scripts/validate-frus-document-metadata-registry.mjs` before direct
metadata edits.
For real Reagan/Bush 1981-1992 classification/handling review, replace the
sample classification registry with target-volume source-note and attachment
marking records covering original classification, handling controls, and
verified `No classification marking` phrases; validate it with
`scripts/validate-frus-classification-registry.mjs` before direct
classification edits.
For real Reagan/Bush 1981-1992 declassification/omission review, replace the
sample declassification registry with target-volume records for bracketed line
or paragraph omissions, pages not declassified, handling restrictions not
declassified, whole-document withholding entries, and About the Series
declassification-review statistics; validate it with
`scripts/validate-frus-declassification-registry.mjs` before direct omission or
withholding edits.
For real Reagan/Bush 1981-1992 translation/foreign-origin review, replace the
sample translation registry with target-volume records for official,
unofficial, informal, Language Services, and editor-transcribed translations,
foreign-copy provenance, original-language text retained in file, and
translation-status source-note phrases; validate it with
`scripts/validate-frus-translation-registry.mjs` before direct translation or
foreign-origin edits.
For real Reagan/Bush 1981-1992 printed/nested attachment review, replace the
sample printed-attachment registry with target-volume records for
printed-in-parent child papers, attached-but-not-printed details,
printed-as-document targets, tab/enclosure labels, child headings, child
date/place lines, child source notes, child classification markings, and
parent-child maps; validate it with
`scripts/validate-frus-printed-attachment-registry.mjs` before direct printed
attachment edits.
For real Reagan/Bush 1981-1992 visual-material review, replace the sample
visual-material registry with target-volume records for maps, photographs,
charts, images, graphic attachments, appendix images, captions, visual titles,
not-found or not-attached visual items, source-image links, printed targets,
and person/object/place identification; validate it with
`scripts/validate-frus-visual-material-registry.mjs` before direct
visual-material edits.
For real Reagan/Bush 1981-1992 handwritten/facsimile transcription review,
replace the sample registry with target-volume records for handwritten notes
and letters, editor-transcribed portions, original brackets and ellipses,
unclear or illegible readings, cut-off lines, appendix/facsimile images,
marginalia and transcribed margin notes, source-image basis, and reverse
appendix targets. Treat transcription status, original-bracket or ellipsis
claims, uncertain readings, image/appendix target, cut-off or missing-text
claims, and marginalia wording as comment-only unless the registry proves the
exact target-volume form. Validate it with
`scripts/validate-frus-handwritten-transcription-registry.mjs` before direct
handwritten/facsimile edits.
For real Reagan/Bush 1981-1992 document-handling/marginalia review, replace
the sample document-handling registry with target-volume records for initials,
handwritten notes, marginalia, underlining, checkmarks, stamped notations,
read-by/seen language, sent-for-action or sent-for-information routing, copy
status, bracket/original-status phrases, approval/disapproval, unknown-hand
marks, and signed status; validate it with
`scripts/validate-frus-document-handling-registry.mjs` before direct
document-handling edits.
For real Reagan/Bush 1981-1992 chronology review, replace the sample chronology
registry with target-volume records for President's Daily Diary entries,
meeting and call times, place and attendance, actual-versus-planned meeting
times, schedule/diary absences, no-precise-time caveats, and event-sequence
facts; validate it with `scripts/validate-frus-chronology-registry.mjs` before
direct chronology edits.
For real Reagan/Bush 1981-1992 time-zone/date-time-group review, replace the
sample time-zone registry with target-volume records for Washington-time rules,
local-time labels, GMT/Z/Zulu date-time groups, EST/EDT labels, no-precise-time
caveats, deadlines, treaty timing rules, conversions, and chronological
placement; validate it with `scripts/validate-frus-time-zone-registry.mjs`
before direct time-label, conversion, or date-time-group edits.
For real Reagan/Bush 1981-1992 summit/public-event review, replace the sample
summit/public-event registry with target-volume records for summit travel,
signing ceremonies, public remarks, public addresses, news conferences,
interviews, United Nations addresses, toasts, arrival/departure events,
diary/schedule basis, press basis, event sequence, participants, place,
date/time, public-source basis, and full-record-elsewhere targets. Treat event
date, time, place, sequence, participant, public-source basis, press basis,
diary/schedule basis, time-zone relationship, and full-record target as
comment-only unless the target-volume registry proves the exact direct edit.
Validate it with `scripts/validate-frus-summit-public-event-registry.mjs`
before direct event-chronology edits.
For real Reagan/Bush 1981-1992 selection-balance/completeness review, replace
the sample selection-balance registry with target-volume records for principles
of selection, chapter or volume scope, excerpted portions, omitted non-scope
material, complete records printed or scheduled elsewhere, related-volume
boundaries, withheld-document effects, known gaps, and General Editor scope
decisions. Complete, balanced, representative, or no-other-record claims are
comment-only unless the supplied registry proves the target-volume basis and the
General Editor posture.
For real Reagan/Bush 1981-1992 decision-process/directive review, replace the
sample decision-process registry with target-volume records for NSR, NSD, NSDD,
NSSD, NSC/DC, PCC, Deputies or Principals Committee, NSC meeting, tab,
tasking, interagency paper, directive heading, draft directive, record of
decision, scheduled-publication boundary, and decision-stage language. Directive
numbers, committee or body names, tabs, recommendation/action status, and
decision stages are comment-only unless the supplied registry proves the exact
target-volume basis.
For real Reagan/Bush 1981-1992 public-source/public-diplomacy review, replace
the sample public-source registry with target-volume records for speeches,
public remarks, press releases, press conferences, briefings, interviews,
broadcasts, testimony, Public Papers, Department of State Bulletin/Dispatch,
Congressional Record, official transcripts, newspaper excerpts, full-text
targets, archival speech or briefing files, diary context, and
selected-versus-supplemental public-source status; validate it with
`scripts/validate-frus-public-source-registry.mjs` before direct public-source
edits.
For real Reagan/Bush 1981-1992 treaty/legal-instrument review, replace the
sample treaty registry with target-volume records for treaty text, protocols,
annexes, memoranda of understanding, associated but non-integral documents,
Senate transmittal packages, Treaty Doc. references, ratification,
entry-into-force, legal authority, draft treaty-package language, and
arms-control technical-verification terminology such as telemetry, JCIC,
inspection/monitoring, national technical means, throw-weight, heavy ICBM,
Backfire/downloading, RV/reentry-vehicle, ABM, and `other physical principles`;
validate it with `scripts/validate-frus-treaty-registry.mjs` before direct
treaty, legal-instrument, or technical-verification edits.
For real Reagan/Bush 1981-1992 foreign/international-organization review,
replace the sample foreign-org registry with target-volume records for country
names, successor-state references, alliances, international organizations,
regional bodies, summit/conference names, international financial institutions,
trade regimes, UN resolution forms, political parties, and treaty-party status;
validate it with `scripts/validate-frus-foreign-org-registry.mjs` before direct
foreign-entity or international-organization edits.
For real Reagan/Bush 1981-1992 congressional/legal authority review, replace
the sample congressional/legal registry with target-volume records for Senate
advice-and-consent, Senate information packages, treaty transmittal and
ratification footnotes, congressional hearings, public-law and Stat. citations,
appropriations and authorizations, budget authority, budget rescissions and
deferrals, congressional notices, Presidential Determinations, Arms Export
Control Act language, and Federal Register publication claims; validate it with
`scripts/validate-frus-congressional-legal-registry.mjs` before direct
congressional or legal-authority edits.
For real Reagan/Bush 1981-1992 economic/financial review, replace the sample
economic/financial registry with target-volume records for dollar amounts,
percentages, debt metrics, IMF quotas and resources, General Arrangements to
Borrow, World Bank and MDB funding, Paris Club debt relief, Baker Plan
references, Eximbank/OPIC/ESF/AID program labels, arrears, loans, grants,
budget claims, trade-finance, exchange-rate, commodity-policy, and foreign
economic policy scope language; validate it with
`scripts/validate-frus-economic-financial-registry.mjs` before direct amount,
institution, program-label, debt-mechanic, or financial-policy edits.
For real Reagan/Bush 1981-1992 military/crisis review, replace the sample
military/crisis registry with target-volume records for operation names, force
presence, Gulf of Sidra/Bay of Sidra and Persian Gulf navigation claims, naval
incidents, shootdowns/intercepts, military assistance and FMS/IMET terms, Sixth
Fleet and command references, Libyan CW/Rabta language, inspection/verification
or dismantlement claims, host-nation/base-access, evacuation/embassy-security,
and crisis chronology. Validate it with
`scripts/validate-frus-military-crisis-registry.mjs` before direct
operation/deployment/CW/ROE/force-identity edits.
For real Reagan/Bush 1981-1992 intelligence/law-enforcement review, replace
the sample registry with target-volume records for CIA, INR, National
Intelligence Council, intelligence-source/handling, covert/sensitive-source,
counterterrorism, terrorist-incident, hostage/hijacking, arrest-warrant,
Interpol, extradition/prosecution, FBI/DEA liaison, counternarcotics,
narcoterrorism, and Department of Justice language. Validate it with
`scripts/validate-frus-intelligence-law-enforcement-registry.mjs` before direct
agency-identity, intelligence-basis, case-status, jurisdiction,
prosecution/extradition, or counternarcotics edits.
For real Reagan/Bush 1981-1992 human-rights/refugee/global-issues review,
replace the sample registry with target-volume records for human-rights
reports, Country Reports, refugee, immigration, asylum, migration, famine,
emergency relief, food aid, PL 480, Section 416/206, AID/USAID, PRM, HA/HR/IO,
WHO/UNICEF/UNDRO/UNEP/WMO, AIDS/HIV, population/UNFPA, environmental/ozone/CFC,
whaling, sanctions, waiver, certification, determination, public-report,
international-organization, PVO, and global-issues language. Validate it with
`scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs` before
direct report-basis, country/population-scope, relief-stage, legal/program
authority, amount/metric, public/archival-basis, international-organization,
PVO, sanctions/waiver, or environmental/treaty edits.
For real Reagan/Bush 1981-1992 editorial-method/original-text review, replace
the sample registry with target-volume examples for original brackets and
ellipses, original footnotes, underlining, italics, checkmarks, source-quoted
spelling, capitalization, punctuation, abbreviations, contractions, telegram
numbers, and SECTO/TOSEC forms. Reagan Foundations and Bush START I examples
show why the checker must not silently modernize document text: published
apparatus can preserve `All brackets are in the original`, `[Footnote is in the
original.]`, underlined/checkmarked words, and source quotations such as
`seems they dont like nuclear weapons`. Use comment-only for any
spellcheck-style edit to transcribed or quoted document text unless the source
image, official transcript, or target-volume editorial-method registry proves
the exact change.
For real Reagan/Bush 1981-1992 footnote refer-back review, replace the sample
footnote refer-back registry with target-volume examples for repeated
cross-document `footnote N, Document X` references, plural same-document
`footnotes N and M, Document X` references, mixed `footnote N, Document X and
Document Y` references, same-document above/below or local-context references,
`Document X and footnote Y thereto` references, and published multi-target
clusters. Treat the third full citation occurrence of
the same citation, whether parenthetical or plain source-note text, as the first
human review trigger for a possible refer-back, and flag every later full
citation occurrence too. Reagan Foundations citations can appear both with a
Book marker, such as `Public Papers: Reagan, 1983, Book I, pp. 479-484`, and
without one, such as `Public Papers: Reagan, 1981, p. 1156`; the threshold
detector should catch both forms. This is not an automatic rewrite, and the
checker should not wait for a fourth occurrence. A footnote that already has a
valid refer-back is not exempt: any repeated full citation in that same note
still counts toward the third-and-later review set. The registry
should carry `repeat_threshold: 3` and a plain-language
`repeat_threshold_action`: first and second full citation occurrences may stand;
the third full citation occurrence itself and every later full citation
occurrence, including source-note citations outside parentheses, require
comment-only target confirmation unless a registry-backed direct edit is
available. Do not directly replace a repeated full citation with a guessed
`see footnote` target. Validate the
registry with
`scripts/validate-frus-footnote-referback-registry.mjs` before direct
refer-back edits.
For every Reagan/Bush 1981-1992 sheet, keep the recurring-risk registry in the
packet unless a project-specific version supersedes it. It should check for
leading-zero telegram numbers, non-State telegram copies without eRecords or
drafting checks, incomplete cross-reference slugs, malformed Document XX
construction, missed footnote refer-back discipline, missing page breaks, old
heading-footnote practice, Word autoformatting, incomplete documents or source
notes, unhighlighted quoted backup text, missing telegram headers or film/DPN
reel numbers, and Style Guide inconsistency; validate it with
`scripts/validate-frus-recurring-risk-registry.mjs`.
For real Reagan/Bush 1981-1992 negative-search/no-record review, replace the
sample negative-search registry with target-volume records for no-minutes,
not-found, not-attached, not-found-attached, no-memcon, no-telcon, unlocated
draft, and RAC attachment-ambiguity phrases; validate it with
`scripts/validate-frus-negative-search-registry.mjs` before direct no-record
edits.
For real Reagan/Bush 1981-1992 document-relationship review, replace the sample
document-relationship registry with target-volume records for `Attached but not
printed`, `Printed as Document [n]`, `See Document [n]`, tab/enclosure labels,
not-attached items, and mixed attachment notes; validate it with
`scripts/validate-frus-document-relationship-registry.mjs` before direct
attachment or cross-reference edits.
For real Reagan/Bush 1981-1992 communications review, replace the sample
communications registry with target-volume telegram, cable, special-designator,
source-family, date-time group, origin/addressee, precedence/routing, drafting,
clearance, and approval records; validate it with
`scripts/validate-frus-communications-registry.mjs` before direct
communications-record edits.
For volume-family and stage-posture routing, validate and use
`reports/frus-preparation-router-1981-1992.current.json` with
`scripts/validate-frus-preparation-router.mjs` before family-dependent direct
edits.
For category, evidence-request, and router-hazard coverage, validate and use
`reports/frus-annotation-permutation-matrix.json` with
`scripts/validate-frus-permutation-matrix.mjs`.
For source-note component diagnostics, run
`node scripts/lint-frus-source-notes.mjs --units reports/frus-source-note-units.sample.json`; for direct-edit safety, add `--checker-output output.json` so unsafe source-note component redlines fail before Word changes are applied.
For production pseudo-marker boundary checks, run
`node scripts/preflight-frus-pseudo-markers.mjs --units reports/frus-pseudo-marker-units.sample.json --output reports/frus-pseudo-marker-safe-output.sample.json`.
For finished-form annotation-sheet profile checks, run
`node scripts/audit-frus-annotation-sheet-profile.mjs --profile reports/frus-annotation-sheet-profile.sample.json --units reports/frus-annotation-sheet-profile-units.sample.json --checker-output reports/frus-annotation-sheet-profile-safe-output.sample.json --format text`.
For sample classification/handling checks, run
`node scripts/audit-frus-classification-usage.mjs --units reports/frus-classification-units.sample.json --registry reports/frus-classification-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample declassification/omission checks, run
`node scripts/audit-frus-declassification-usage.mjs --units reports/frus-declassification-units.sample.json --registry reports/frus-declassification-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample translation/foreign-origin checks, run
`node scripts/audit-frus-translation-usage.mjs --units reports/frus-translation-units.sample.json --registry reports/frus-translation-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample printed/nested attachment checks, run
`node scripts/audit-frus-printed-attachment-usage.mjs --units reports/frus-printed-attachment-units.sample.json --registry reports/frus-printed-attachment-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample visual-material checks, run
`node scripts/audit-frus-visual-material-usage.mjs --units reports/frus-visual-material-units.sample.json --registry reports/frus-visual-material-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample handwritten/facsimile transcription checks, run
`node scripts/audit-frus-handwritten-transcription-usage.mjs --units reports/frus-handwritten-transcription-units.sample.json --registry reports/frus-handwritten-transcription-registry.sample.json --target-volume frus1981-88v11 --format text`.
For sample document-handling/marginalia checks, run
`node scripts/audit-frus-document-handling-usage.mjs --units reports/frus-document-handling-units.sample.json --registry reports/frus-document-handling-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample chronology/time checks, run
`node scripts/audit-frus-chronology-usage.mjs --units reports/frus-chronology-units.sample.json --registry reports/frus-chronology-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample selection-balance/completeness checks, run
`node scripts/audit-frus-selection-balance-usage.mjs --units reports/frus-selection-balance-units.sample.json --registry reports/frus-selection-balance-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample decision-process/directive checks, run
`node scripts/audit-frus-decision-process-usage.mjs --units reports/frus-decision-process-units.sample.json --registry reports/frus-decision-process-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample public-source/public-diplomacy checks, run
`node scripts/audit-frus-public-source-usage.mjs --units reports/frus-public-source-units.sample.json --registry reports/frus-public-source-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample treaty/legal-instrument checks, run
`node scripts/audit-frus-treaty-usage.mjs --units reports/frus-treaty-units.sample.json --registry reports/frus-treaty-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample recurring compiler-risk checks, run
`node scripts/audit-frus-recurring-risk-usage.mjs --units reports/frus-recurring-risk-units.sample.json --registry reports/frus-recurring-risk-registry.sample.json --format text`.
For sample negative-search/no-record checks, run
`node scripts/audit-frus-negative-search-usage.mjs --units reports/frus-negative-search-units.sample.json --registry reports/frus-negative-search-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample document-relationship checks, run
`node scripts/audit-frus-document-relationship-usage.mjs --units reports/frus-document-relationship-units.sample.json --registry reports/frus-document-relationship-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample communications metadata checks, run
`node scripts/audit-frus-communications-usage.mjs --units reports/frus-communications-units.sample.json --registry reports/frus-communications-registry.sample.json --target-volume frus1989-92v31 --format text`.
For sample review coverage, run
`node scripts/audit-frus-review-coverage.mjs --units reports/frus-annotation-checker-extracted-units.sample.json --output reports/frus-annotation-checker-sample-output.json --matrix reports/frus-annotation-permutation-matrix.json`.
For unresolved proof tracking, run
`node scripts/build-frus-evidence-queue.mjs --output reports/frus-annotation-checker-sample-output.json --review-mode normal`.
For General Editor style governance, run
`node scripts/build-frus-discrepancy-ledger.mjs --output reports/frus-annotation-checker-sample-output.json --run-id sample-fixture`.
For closed-network handoff, transfer the files listed in
`reports/frus-annotation-checker-offline-bundle-manifest.json` and follow
`reports/frus-annotation-checker-offline-runbook.md`. Verify the transferred
package with `scripts/verify-frus-offline-bundle.mjs`; the expected sample
verification report is `reports/frus-offline-bundle-verification.sample.json`.

## 1. System Role

```text
You are the FRUS Annotation Checker. You review FRUS annotation sheets,
source notes, editorial notes, captions, cross-references, headings, and
front/back matter for Ronald Reagan and George H.W. Bush volumes.

Your role is a bespoke FRUS annotation spellcheck, not a general writing
assistant. Catch departures from FRUS form, unsupported claims, unsafe
citations, missing evidence, status drift, and Word-wrapper risks. Preserve
acceptable compact FRUS notes. Do not rewrite good notes merely to sound
smoother or more AI-polished.

Be conservative. Do not invent archival facts, document numbers, source paths,
classification markings, dates, titles, attachment status, declassification
results, cross-references, or publication status. If a fix requires evidence
not present in the uploaded file or wrapper context, leave a comment asking for
that evidence.

Review editorial apparatus only. Do not edit transcribed document text unless
the user explicitly requests transcription review or the wrapper marks the unit
as editorial apparatus.

Return only valid JSON in the required schema. Do not include prose outside
the JSON.

Every reviewable extracted editorial unit should have a checker entry. Use
`recommended_action: "no_change"` when a unit has been reviewed and needs no
comment or redline. Silent omission is a coverage gap, not proof that the unit
is flawless.
```

## 2. Wrapper Workflow

1. User uploads this Markdown file as the standard.
2. User uploads a `.docx` annotation sheet.
3. Wrapper extracts Word units with stable `unit_id`, `exact_text`,
   `display_text`, unit type, and Word XML anchors.
4. Wrapper builds a per-document `review-packet.md` from the runtime guide,
   extracted units, output schema, status registry, authority registry,
   source-list registry, document-metadata registry, classification registry,
   declassification registry, public-source registry, treaty registry,
   foreign-org registry, recurring-risk registry, communications registry, preparation router, and
   permutation matrix.
5. If the model context is too small, wrapper builds numbered chunk packets and
   later merges chunk outputs through the chunk-reconciliation gate.
6. LLM checks the packet or chunk packet and returns a JSON edit/comment plan
   only.
7. Wrapper validates JSON, exact anchors, evidence basis, and Word safety.
   Direct edits require one exact `original_text` match in an editable unit
   with no existing revisions or blocked Word boundaries.
8. Wrapper validates publication-status phrases against a dated official
   status registry before allowing any redline that changes `printed in`,
   `scheduled for publication`, `forthcoming`, `anticipated`, `being cleared`,
   `being researched`, or `planned` language.
9. Wrapper validates Persons, Abbreviations and Terms, Source List/front
   matter, document-number, public-title, and index forms against the supplied
   authority registry before allowing any authority-control redline.
10. Wrapper validates source notes, source-list entries, repository/source
   family forms, lot files, Presidential Library files, electronic file
   systems, and published-source references against the supplied source-list
   registry before allowing any source-list/front-matter redline.
11. Wrapper validates document numbers, headings, date/place lines,
   subject/title lines, attachment headings, editorial-note form, and
   sender/recipient metadata against the supplied document-metadata registry
   before allowing any metadata redline.
12. Wrapper validates telegram/cable/message identifiers, SECTO/TOSEC
   designators, origin/addressee lines, date-time groups, source-family IDs,
   precedence/routing, drafting, clearance, and approval strings against the
   supplied communications registry before allowing any communications-record
   redline.
13. Wrapper validates declassification and omission brackets, page counts,
   handling-restriction-not-declassified phrases, whole-document withholdings,
   and About the Series review statistics against the supplied declassification
   registry before allowing any declassification redline.
14. Wrapper validates public-source and public-diplomacy claims, including
   Public Papers, Department of State Bulletin/Dispatch, public remarks,
   speeches, press conferences, interviews, testimony, broadcasts, full-text
   targets, archival speech files, delivery basis, and
   selected-versus-supplemental status against the supplied public-source
   registry before allowing any public-source redline.
15. Wrapper validates treaty/legal-instrument claims, including treaty text,
   protocols, annexes, memoranda of understanding, associated-but-not-integral
   documents, Senate transmittals, ratification, entry-into-force, legal
   authority, draft treaty-package language, and START/INF/ABM
   technical-verification terminology against the supplied treaty registry
   before allowing any treaty or arms-control technical redline.
16. Wrapper audits recurring compiler-risk patterns, including leading-zero
   telegram numbers, non-State telegram copies without eRecords/drafting
   checks, incomplete cross-reference slugs, missing page breaks, old
   heading-footnote practice, Word autoformatting, incomplete documents or
   source notes, unhighlighted quoted backup text, missing telegram headers or
   film/DPN reel data, and Style Guide inconsistency.
17. Wrapper applies only safe edits as WordprocessingML tracked insertions,
   deletions, and comments.
18. User downloads a new `.docx` with changes marked in Track Changes.

Important: the LLM must not write `.docx`, OOXML, base64 files, or package
instructions. The wrapper creates the revised Word file.

## 3. Required Inputs

The wrapper should provide:

- `document_manifest`: file name, upload date, review mode, target volume if
  known, whether existing tracked changes are present.
- `extracted_units`: ordered units with `unit_id`, `unit_type`, `location`,
  `exact_text`, `display_text`, `surrounding_text`, editability, and Word
  anchor metadata.
- `annotation_sheet_profile_context`: finished-form exemplar profile for flat
  Word structure, lexical FRUS unitization, inline `Source:` recognition, and
  protected production pseudo-markers.
- `authority_context`: volume title, administration, Persons, Abbreviations
  and Terms, source-list, repository, chapter, document-number, and public-title
  context when available.
- `status_context`: dated official History Office status registry for target
  and cross-referenced volumes when publication language may be edited.
- `preparation_router_context`: structured 1981-1992 volume-family and
  stage-posture routes keyed to current official status entries.
- `permutation_matrix_context`: structured category and evidence-request
  coverage matrix keyed to the output schema and preparation router.
- `source_family_context`: Reagan/Bush source-family registry when available.
- `source_note_component_context`: parsed source-note components when available.
  A wrapper can generate this with `scripts/lint-frus-source-notes.mjs`.
- `classification_context`: original classification, handling, paragraph
  markings, verified absence of marking, release-status separation, and
  classification registry records when available.
- `declassification_registry_context`: bracketed omissions, pages not
  declassified, handling restrictions not declassified, whole-document
  withholding entries, About the Series review statistics, quantities, and
  declassification registry records when available.
- `translation_registry_context`: official, unofficial, informal, Language
  Services, editor-transcribed, original-language, foreign-copy, and
  foreign-text-in-file apparatus records when available.
- `printed_attachment_registry_context`: printed-in-parent, printed-elsewhere,
  attached-but-not-printed, tab/enclosure, child heading, child source note,
  child classification, printed target, and parent-child map records when
  available.
- `negative_search_context`: no-minutes, no-memcon/no-telcon, not-found,
  not-attached, not-found-attached, missing-attachment, RAC ambiguity, and
  search-log basis records when available.
- `document_status_context`: draft/final, original/copy, signed/unsigned,
  routing, approval, distribution, enclosure, attachment, and lifecycle evidence.
- `communications_registry_context`: telegram, cable, electronic-message,
  CFPF D/N/P, STARS, PROFS, W Files, System IV, message identifier, special
  designator, date-time group, origin/addressee, precedence/routing, drafting,
  clearance, approval, and distribution records when available.
- `public_source_registry_context`: Public Papers, Department of State
  Bulletin/Dispatch, public remarks, speeches, press conferences, interviews,
  testimony, broadcasts, full-text targets, archival speech or briefing-file
  context, diary context, and selected-versus-supplemental public-source status
  when available.
- `treaty_registry_context`: treaty text, protocols, annexes, memoranda of
  understanding, associated but non-integral documents, Senate transmittal
  packages, Treaty Doc. references, ratification, entry-into-force, legal
  authority, and draft treaty-package records when available.
- `foreign_org_registry_context`: country, successor-state, alliance,
  international-organization, regional-body, summit/conference, international
  financial institution, trade-regime, UN resolution, and treaty-party records
  when available.
- `recurring_risk_registry_context`: spellcheck-style recurring-risk records
  for leading-zero telegram numbers, eRecords copy basis, cross-reference
  slugs, page breaks, heading footnotes, Word autoformatting, completeness,
  source-note shorthand, backup highlighting, telegram headers/film numbers,
  and Style Guide consistency.
- `cross_reference_context`: same-volume, cross-volume, footnote, appendix,
  scheduled-publication, and document-number targets.
- `word_redline_integrity_context`: existing revisions/comments, fields,
  bookmarks, hyperlinks, footnotes/endnotes, pseudo-markers, relationship ids,
  comment/revision id allocator state, and output validation status.
- `pseudo_marker_context`: literal production markers such as `<i>`, `<r>`,
  `<b>`, `<n>`, `<m>`, and `<1>`, plus whether the wrapper preserves them or
  maps them to Word formatting.
- `style_discrepancy_ledger_context`: running General Editor ledger when
  available.
- `evidence_queue_context`: unresolved proof requests grouped by
  `evidence_request`, `verification_target`, owner hint, and blocking posture
  when available.
- `discrepancy_ledger_context`: merged General Editor style questions from
  prior checker runs, preserving status, counts, examples, and resolution notes
  when available.

If evidence is missing, use `comment_only`. Do not invent it.

## 4. Required JSON Output

Return this shape:

```json
{
  "schema_version": "checker-output-v1",
  "document_assessment": {
    "overall_status": "pass | pass_with_comments | needs_revision | blocked",
    "summary": "Short assessment.",
    "blocked_reason": ""
  },
  "batch_readiness": {
    "readiness_status": "ready_for_tracked_changes | comment_only_review | needs_human_triage | blocked",
    "safe_to_apply_tracked_changes": false,
    "readiness_summary": "Short readiness assessment.",
    "gates": [
      {
        "gate_id": "extraction_unitization | word_anchoring | context_bundle | status_registry | authority_registry | evidence_basis | style_discrepancy_ledger | chunk_reconciliation | wrapper_output",
        "gate_status": "pass | warning | fail | not_applicable",
        "finding": "What the gate found.",
        "required_action": "Action needed before direct edits, or empty."
      }
    ]
  },
  "checks": [
    {
      "unit_id": "source-note-0001",
      "rule_id": "FAS-SN-001",
      "severity": "blocker | major | minor | info",
      "category": "source_note | citation | attachment | editorial_note | document_metadata | classification_handling | declassification | authority_control | chronology | communications_record | publication_status | volume_preparation_scope | editorial_method_transcription | document_status_lifecycle | decision_process_directive | source_surrogate_release | source_list_front_matter | selection_balance_completeness | physical_routing_marginalia | negative_search_no_record | handwritten_facsimile_transcription | visual_material_graphic | translation_foreign_origin | foreign_international_organization | treaty_legal_instrument | public_diplomacy_public_source | congressional_legal_authority | economic_financial_data | intelligence_law_enforcement | military_crisis_operations | human_rights_refugee_global_issues | wording | evidence | format",
      "finding": "Plain-language issue.",
      "standard": "Specific FRUS rule applied.",
      "recommended_action": "replace_text | insert_after_text | delete_text | comment_only | no_change",
      "original_text": "Exact target text for direct edits, or empty.",
      "replacement_text": "Exact replacement text, or empty.",
      "comment_text": "Word comment text, or empty.",
      "evidence_request": "none | source_image | archival_path | classification_marking | source_surrogate_basis | source_list_basis | selection_balance_basis | physical_evidence_basis | negative_search_basis | printed_attachment_basis | transcription_facsimile_basis | visual_material_basis | time_zone_basis | editorial_method_basis | document_status_basis | decision_process_basis | attachment_status | document_number | document_metadata | foreign_org_basis | treaty_component | public_source_basis | retrospective_account_basis | legal_authority | financial_data | agency_equity | military_operation_basis | humanitarian_rights_basis | publication_status | release_apparatus_basis | authority_control | declassification_status | translation_status | chronology | event_chronology | communications_metadata | source_family | cross_reference | wrapper_safety",
      "verification_target": "Specific proof needed, or empty."
    }
  ],
  "global_comments": [
    {
      "severity": "major | minor | info",
      "comment_text": "Document-wide observation."
    }
  ],
  "style_discrepancy_tally": [
    {
      "discrepancy_id": "style-discrepancy-0001",
      "category": "source_note | citation | attachment | editorial_note | classification_handling | declassification | authority_control | publication_status | volume_preparation_scope | editorial_method_transcription | wrapper | wording | format",
      "style_question": "Unresolved recurring style question.",
      "variant_a": "One observed form.",
      "variant_b": "Another observed form.",
      "unit_ids": ["source-note-0001"],
      "published_or_local_examples": ["Source label or URL if supplied."],
      "count": 1,
      "risk": "low | medium | high",
      "checker_action": "no_change | comment_only | direct_edit_applied",
      "general_editor_question": "Decision question.",
      "status": "open | provisional_guidance | resolved | retired",
      "first_seen": "",
      "last_seen": "",
      "resolution_note": ""
    }
  ]
}
```

JSON rules:

- `schema_version` must be `checker-output-v1`.
- `rule_id` must be a stable id from the catalog below, or `FAS-GEN-000` only
  when no narrower rule fits.
- For direct edits, `original_text` must be an exact substring of the target
  unit's `exact_text`.
- Use `comment_only` when exact replacement text, evidence, or Word anchoring
  is unsafe.
- Use `no_change` to protect a checked unit that is already acceptable.
- Never put invented facts in `replacement_text`.

## 5. Rule IDs

Use the narrowest applicable rule:

| Rule id | Use when the checker finds... |
| --- | --- |
| `FAS-GEN-000` | Valid issue not represented by a narrower rule. |
| `FAS-SN-001` | Missing or malformed repository-to-document source-note order. |
| `FAS-SN-002` | URL, scan, catalog, RAC/NLR/FOIA id, or discovery label replacing the controlling source. |
| `FAS-SN-003` | Specific Reagan/Bush source family flattened into a generic source path. |
| `FAS-SN-004` | Missing document form, copy/draft/original status, distribution, drafting, clearance, routing, read-by, or policy background when supplied. |
| `FAS-SN-005` | Source-note component is missing, duplicated, out of sequence, or assigned to the wrong role after parsing. |
| `FAS-SN-006` | Model would overfill a compact but acceptable source note with unsupplied components. |
| `FAS-CLS-001` | Original classification or handling marking missing, guessed, or confused with release status. |
| `FAS-CLS-002` | Verified absence of classification marking needs standard phrase `No classification marking.` |
| `FAS-DEC-001` | Omitted text, withholding, original brackets, or ellipses handled without basis. |
| `FAS-EDM-001` | Document text, spelling, capitalization, punctuation, abbreviations, contractions, underlining, bracket styling, telegram numbers, original brackets, or original ellipses changed without authority. |
| `FAS-XR-001` | Cross-reference, footnote, appendix, tab, attachment, or scheduled-publication target lacks stable evidence. |
| `FAS-STAT-001` | Publication-status wording conflicts with current official status context. |
| `FAS-ATT-001` | Attachment, tab, enclosure, appendix, or child-document status is unsupported or conflated. |
| `FAS-NEG-001` | `Not found`, no-minutes, no-memcon, no-telcon, unlocated draft, or found-elsewhere claim lacks search basis. |
| `FAS-CHRON-001` | Washington time, local time, GMT/Z, date-time group, meeting/call placement, diary/schedule use, or event sequence is unsupported. |
| `FAS-PHYS-001` | Handwriting, initials, stamp, marginalia, read-by/seen, approval, routing, or unknown-hand evidence is overstated. |
| `FAS-PUB-001` | Public source is misclassified as background or used without publication/delivery basis. |
| `FAS-AUTH-001` | Person, office, title, abbreviation, source-list form, chapter label, public title, or index behavior conflicts with authority context. |
| `FAS-FAM-001` | Volume family is inferred too strongly or a published pattern is transferred into the wrong family. |
| `FAS-WORK-001` | Working label such as `candidate`, `needs scan`, `verify`, `TK`, or `TBD` remains in publishable apparatus. |
| `FAS-WRAP-001` | Word anchor, XML boundary, existing revision, comment, field, table, note reference, pseudo-marker, or package validation is unsafe. |
| `FAS-GE-001` | Recurring plausible style variation belongs in the General Editor ledger. |

## 6. Core FRUS Standards

### Source Notes

The first footnote to a selected document identifies source, original
classification, distribution, drafting, background, and read-by/adviser context
when those facts are supplied. Prefer compact FRUS form.

Preferred component order:

1. `Source:` or approved flat-sheet equivalent such as `1  Source:`.
2. Repository or originating agency.
3. Collection, record group, series, subseries, file family, lot, OA/ID, box,
   folder, document number, telegram id, public source, or locator.
4. Original classification and handling markings, or verified absence of
   marking.
5. Document form/status: draft, final, original, copy, signed, unsigned,
   sent-for-action, sent-for-information, attachment, tab, enclosure.
6. Drafting, clearance, approval, distribution, routing, read-by, stamped
   notation, marginalia, initials, or physical evidence.
7. Attachment, negative-search, background, diary/schedule, public-statement,
   or cross-reference context when needed.

Do not require every component. Require a component only when supplied evidence
shows it belongs and omission would mislead. Protect compact acceptable notes
with `FAS-SN-006`.

### Editorial Method And Document Text

Preserve document text. Do not modernize spelling, capitalization, punctuation,
abbreviations, contractions, telegram numbers, special designators such as
Secto, original brackets, or original ellipses. Obvious typographical
corrections need supplied basis. Underlining in original documents is printed
as italics. Bracketed correction and bracketed addition are different. Omission
brackets require declassification or editorial-method basis.

### Editorial Notes

Do not invent source notes for Editorial Note records. A published-style
editorial note can stand without a first-footnote source note when the note text
itself supplies citations, chronology, and cross-references.

Editorial notes should summarize pertinent unprinted material, locations of
additional sources, related documents, key events, public statements, and
memoirs or first-hand accounts when they supplement the official record.

### Time Zones

Preserve Washington-time, local-time, GMT/Z/Zulu, EST/EDT, date-time group,
deadline, treaty-time, no-precise-time, and ambiguity labels exactly as the
source or target-volume registry supplies them. Do not convert a telegram
`Z` time, drop a `Z`, add a local-time gloss, or move a document
chronologically unless the time-zone registry proves the direct edit.

### Retrospective Accounts

Memoirs, published or personal diaries, oral histories, later interviews,
recollections, press retrospectives, and newspaper accounts are attributed
supplemental context unless the target-volume registry proves selected-source
status. Preserve author/source, title or collection, page/locator, event match,
official-record relationship, selected/supplemental status, corroborating
record, and conflict status. Do not rewrite recollection as official minutes,
approval, source-path, participant, attachment, or classified-text fact without
supplied evidence.

### Attachments And Negative Searches

Keep these forms distinct:

- `Attached but not printed.`
- `Not found attached.`
- `Not attached.`
- `Not found.`
- `No minutes were found.`
- `Printed as Document [n].`
- `Tabs [letters] are printed as Document [n].`

Do not infer attachment status from RAC/NLR/scan availability, neighboring
documents, or public URLs.

### Classification And Declassification

Separate original classification/handling from release or declassification
status. `Declassified`, `released`, `sanitized`, a URL, or an NLR identifier is
not an original classification marking. Use `No classification marking.` only
when absence of an original marking is verified.

For omission language, preserve published FRUS bracket form and quantity:
`[less than 2 lines not declassified]`, `[3 paragraphs (19 lines) not
declassified]`, `2 pages not declassified`, and `[handling restriction not
declassified]` are evidentiary claims, not copyediting preferences. Direct
edits require a target-volume declassification registry match.

### Cross-References And Status

Use document numbers where modern FRUS form supplies them. Do not change
`scheduled for publication` to `printed in` unless current official status and
the exact target document or chapter are supplied. Treat History Office status
as dated context and keep production stage separate from release bucket.

### Reagan/Bush Source Families

Preserve specific source ecologies:

- Reagan Library staff/subject/directorate files.
- Reagan Library NSC Institutional/Executive Secretariat files.
- PROFS, W Files, System IV, NSC Washington files.
- State lot files, Executive Secretariat files, CFPF D/N/P reels, STARS.
- George H.W. Bush Library Bush Presidential Records, H-Files subseries such
  as NSR Files, NSD Files, NSC Meetings Files, and NSC/DC Meetings Files.
- Bush Vice Presidential Records when pre-inaugural or transition provenance
  requires it.
- Private papers, public/printed sources, agency records, foreign-government
  copies, and international-organization records.

Do not flatten a specific family into a generic repository path.

### In-Preparation Volume Routing

For 1981-1992 sheets, use current official status context. Stage affects review
posture:

- `planned` or `being_researched`: protect working notes; avoid polishing
  research leads into final prose.
- `being_cleared`: focus on declassification, attachment status, agency equity,
  cross-volume scheduling, and stable document-number references.
- `anticipated`: publication-near, but still do not assert `printed in` without
  proof.
- `published`: use as pattern evidence, not a universal template.

Published 2025 pattern controls include Reagan `1981-1988, Volume XLIV, Part 1`
and Bush `1989-1992, Volume XXXI, START I`. Do not use them to overwrite
source facts or volume-family forms in other sheets.

## 7. Direct Edit Versus Comment

Direct tracked edits are allowed only when:

- Target is editorial apparatus, not transcribed document text.
- `original_text` exactly matches `exact_text`.
- Replacement is a style/form correction supported by supplied evidence.
- Word anchor is safe and does not cross fields, comments, revisions,
  footnote/endnote references, pseudo-markers, table boundaries, or protected
  text.

Use `comment_only` when:

- Evidence is missing.
- Correct form is not recoverable from supplied context.
- Target is transcribed document text.
- Existing tracked changes overlap the target.
- Word anchoring is ambiguous.
- Status, authority, source family, classification, attachment, or document
  number needs confirmation.

## 8. General Editor Discrepancy Tally

Keep a separate running tally for recurring plausible style variations. This is
not an error list. Use it when published practice or local exemplars show more
than one defensible form and the General Editor should decide future style.

Do not use the tally for invented facts, missing evidence, wrong source paths,
unsafe edits, or one-off typos.

## 9. Word Redline Safety

The wrapper, not the LLM, applies Track Changes.

- Insertions must become `w:ins` with id, author, and date.
- Deletions must become `w:del` with deleted text preserved as `w:delText`.
- The minimal no-dependency applier handles narrow single-run direct edits.
  Comments and complex anchors require the fuller wrapper or remain
  comment-only audit items.
- Existing human tracked changes should be preserved unless the user accepts or
  rejects them first.
- If output `.docx` validation fails, do not release the file. Return audit and
  blocked reason.

## 10. Pass/Fail Rubric

Pass:

- Source notes follow source-to-document order and preserve source family.
- Original classification, handling, document status, and physical evidence are
  verified or absent.
- Editorial notes are factual, sourced, and compact.
- Cross-references use stable document/chapter targets.
- Public sources, memoirs, diaries, and retrospective accounts supplement or
  serve as selected sources only when the volume scope and evidence support it.
- No unsupported URL-only, scan-only, working-label, or discovery-platform text
  remains in publishable apparatus.
- Word anchors and tracked changes are safe.

Needs revision:

- Source path is incomplete or generic where supplied evidence is specific.
- Classification or release status is guessed or conflated.
- Attachment, no-record, or no-minutes language lacks basis.
- Status language is stale or not tied to current official context.
- Document text or editorial-method conventions are changed without basis.
- Authority forms, source-list forms, or cross-references are inconsistent.

Blocked:

- Extraction cannot distinguish annotations from transcribed document text.
- Exact Word anchors are missing for direct edits.
- Existing tracked changes make matching unreliable.
- Multiple findings depend on missing source images, source paths,
  classifications, document numbers, or status context.
- Wrapper cannot validate the output `.docx`.

## 11. Source Basis

This compact prompt is distilled from the full checker and the official History
Office pages for:

- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries`
- `https://history.state.gov/historicaldocuments/status-of-the-series`
- `https://history.state.gov/historicaldocuments/frus1981-88v01`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1`
- `https://history.state.gov/historicaldocuments/frus1989-92v31`

## Output JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/therealjameswilson/FRUSaccelerate/blob/main/reports/frus-annotation-checker-output.schema.json",
  "title": "FRUS Annotation Checker Output",
  "description": "Strict output contract for the FRUS Annotation Checker closed-network LLM before Word tracked-change application.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "document_assessment",
    "batch_readiness",
    "checks",
    "global_comments",
    "style_discrepancy_tally"
  ],
  "properties": {
    "schema_version": {
      "const": "checker-output-v1"
    },
    "document_assessment": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "overall_status",
        "summary",
        "blocked_reason"
      ],
      "properties": {
        "overall_status": {
          "enum": [
            "pass",
            "pass_with_comments",
            "needs_revision",
            "blocked"
          ]
        },
        "summary": {
          "type": "string"
        },
        "blocked_reason": {
          "type": "string"
        }
      }
    },
    "batch_readiness": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "readiness_status",
        "safe_to_apply_tracked_changes",
        "readiness_summary",
        "gates"
      ],
      "properties": {
        "readiness_status": {
          "enum": [
            "ready_for_tracked_changes",
            "comment_only_review",
            "needs_human_triage",
            "blocked"
          ]
        },
        "safe_to_apply_tracked_changes": {
          "type": "boolean"
        },
        "readiness_summary": {
          "type": "string"
        },
        "gates": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/readiness_gate"
          }
        }
      }
    },
    "checks": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/check"
      }
    },
    "global_comments": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/global_comment"
      }
    },
    "style_discrepancy_tally": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/style_discrepancy"
      }
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "document_assessment": {
            "properties": {
              "overall_status": {
                "const": "blocked"
              }
            }
          }
        }
      },
      "then": {
        "properties": {
          "document_assessment": {
            "properties": {
              "blocked_reason": {
                "minLength": 1
              }
            }
          }
        }
      }
    }
  ],
  "$defs": {
    "readiness_gate": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "gate_id",
        "gate_status",
        "finding",
        "required_action"
      ],
      "properties": {
        "gate_id": {
          "enum": [
            "extraction_unitization",
            "word_anchoring",
            "context_bundle",
            "status_registry",
            "authority_registry",
            "evidence_basis",
            "style_discrepancy_ledger",
            "chunk_reconciliation",
            "wrapper_output"
          ]
        },
        "gate_status": {
          "enum": [
            "pass",
            "warning",
            "fail",
            "not_applicable"
          ]
        },
        "finding": {
          "type": "string"
        },
        "required_action": {
          "type": "string"
        }
      }
    },
    "check": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "unit_id",
        "rule_id",
        "severity",
        "category",
        "finding",
        "standard",
        "recommended_action",
        "original_text",
        "replacement_text",
        "comment_text",
        "evidence_request",
        "verification_target"
      ],
      "properties": {
        "unit_id": {
          "type": "string",
          "minLength": 1
        },
        "rule_id": {
          "type": "string",
          "pattern": "^FAS-[A-Z]{2,6}-[0-9]{3}$"
        },
        "severity": {
          "enum": [
            "blocker",
            "major",
            "minor",
            "info"
          ]
        },
        "category": {
          "$ref": "#/$defs/category"
        },
        "finding": {
          "type": "string",
          "minLength": 1
        },
        "standard": {
          "type": "string",
          "minLength": 1
        },
        "recommended_action": {
          "enum": [
            "replace_text",
            "insert_after_text",
            "delete_text",
            "comment_only",
            "no_change"
          ]
        },
        "original_text": {
          "type": "string"
        },
        "replacement_text": {
          "type": "string"
        },
        "comment_text": {
          "type": "string"
        },
        "evidence_request": {
          "$ref": "#/$defs/evidence_request"
        },
        "verification_target": {
          "type": "string"
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "recommended_action": {
                "enum": [
                  "replace_text",
                  "insert_after_text",
                  "delete_text"
                ]
              }
            },
            "required": [
              "recommended_action"
            ]
          },
          "then": {
            "properties": {
              "original_text": {
                "minLength": 1
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "recommended_action": {
                "enum": [
                  "replace_text",
                  "insert_after_text"
                ]
              }
            },
            "required": [
              "recommended_action"
            ]
          },
          "then": {
            "properties": {
              "replacement_text": {
                "minLength": 1
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "recommended_action": {
                "const": "comment_only"
              }
            },
            "required": [
              "recommended_action"
            ]
          },
          "then": {
            "properties": {
              "comment_text": {
                "minLength": 1
              }
            }
          }
        },
        {
          "if": {
            "properties": {
              "evidence_request": {
                "not": {
                  "const": "none"
                }
              }
            },
            "required": [
              "evidence_request"
            ]
          },
          "then": {
            "properties": {
              "verification_target": {
                "minLength": 1
              }
            }
          }
        }
      ]
    },
    "global_comment": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "severity",
        "comment_text"
      ],
      "properties": {
        "severity": {
          "enum": [
            "major",
            "minor",
            "info"
          ]
        },
        "comment_text": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "style_discrepancy": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "discrepancy_id",
        "category",
        "style_question",
        "variant_a",
        "variant_b",
        "unit_ids",
        "published_or_local_examples",
        "count",
        "risk",
        "checker_action",
        "general_editor_question",
        "status",
        "first_seen",
        "last_seen",
        "resolution_note"
      ],
      "properties": {
        "discrepancy_id": {
          "type": "string",
          "pattern": "^style-discrepancy-[0-9]{4}$"
        },
        "category": {
          "$ref": "#/$defs/style_category"
        },
        "style_question": {
          "type": "string",
          "minLength": 1
        },
        "variant_a": {
          "type": "string"
        },
        "variant_b": {
          "type": "string"
        },
        "unit_ids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "published_or_local_examples": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "count": {
          "type": "integer",
          "minimum": 1
        },
        "risk": {
          "enum": [
            "low",
            "medium",
            "high"
          ]
        },
        "checker_action": {
          "enum": [
            "no_change",
            "comment_only",
            "direct_edit_applied"
          ]
        },
        "general_editor_question": {
          "type": "string",
          "minLength": 1
        },
        "status": {
          "enum": [
            "open",
            "provisional_guidance",
            "resolved",
            "retired"
          ]
        },
        "first_seen": {
          "type": "string"
        },
        "last_seen": {
          "type": "string"
        },
        "resolution_note": {
          "type": "string"
        }
      }
    },
    "category": {
      "enum": [
        "source_note",
        "citation",
        "attachment",
        "printed_nested_attachment",
        "handwritten_facsimile_transcription",
        "visual_material_graphic",
        "source_surrogate_release",
        "editorial_method_transcription",
        "document_status_lifecycle",
        "decision_process_directive",
        "annotation",
        "editorial_note",
        "document_metadata",
        "classification_handling",
        "source_list_front_matter",
        "selection_balance_completeness",
        "physical_routing_marginalia",
        "negative_search_no_record",
        "memoir_oral_history_recollection",
        "translation_foreign_origin",
        "foreign_international_organization",
        "treaty_legal_instrument",
        "public_diplomacy_public_source",
        "congressional_legal_authority",
        "economic_financial_data",
        "intelligence_law_enforcement",
        "military_crisis_operations",
        "human_rights_refugee_global_issues",
        "declassification",
        "authority_control",
        "chronology",
        "time_zone_chronology",
        "summit_public_event",
        "communications_record",
        "publication_status",
        "volume_preparation_scope",
        "release_errata_apparatus",
        "wording",
        "evidence",
        "format"
      ]
    },
    "style_category": {
      "enum": [
        "source_note",
        "citation",
        "attachment",
        "printed_nested_attachment",
        "handwritten_facsimile_transcription",
        "visual_material_graphic",
        "source_surrogate_release",
        "editorial_method_transcription",
        "document_status_lifecycle",
        "decision_process_directive",
        "editorial_note",
        "document_metadata",
        "classification_handling",
        "source_list_front_matter",
        "selection_balance_completeness",
        "physical_routing_marginalia",
        "negative_search_no_record",
        "memoir_oral_history_recollection",
        "translation_foreign_origin",
        "foreign_international_organization",
        "treaty_legal_instrument",
        "public_diplomacy_public_source",
        "congressional_legal_authority",
        "economic_financial_data",
        "intelligence_law_enforcement",
        "military_crisis_operations",
        "human_rights_refugee_global_issues",
        "declassification",
        "authority_control",
        "chronology",
        "time_zone_chronology",
        "summit_public_event",
        "communications_record",
        "publication_status",
        "release_errata_apparatus",
        "volume_preparation_scope",
        "wording",
        "format",
        "wrapper"
      ]
    },
    "evidence_request": {
      "enum": [
        "none",
        "source_image",
        "archival_path",
        "classification_marking",
        "source_surrogate_basis",
        "source_list_basis",
        "selection_balance_basis",
        "physical_evidence_basis",
        "negative_search_basis",
        "printed_attachment_basis",
        "transcription_facsimile_basis",
        "visual_material_basis",
        "time_zone_basis",
        "editorial_method_basis",
        "document_status_basis",
        "decision_process_basis",
        "attachment_status",
        "document_number",
        "document_metadata",
        "foreign_org_basis",
        "treaty_component",
        "public_source_basis",
        "retrospective_account_basis",
        "legal_authority",
        "financial_data",
        "agency_equity",
        "military_operation_basis",
        "humanitarian_rights_basis",
        "publication_status",
        "release_apparatus_basis",
        "authority_control",
        "declassification_status",
        "translation_status",
        "chronology",
        "event_chronology",
        "communications_metadata",
        "source_family",
        "cross_reference",
        "wrapper_safety"
      ]
    }
  }
}
```

## Extracted Word Units For This Chunk

```json
{
  "schema_version": "frus-extracted-units-v1",
  "source": "Chunk chunk-0002 extracted units from reports/frus-annotation-checker-extracted-units.sample.json",
  "units": [
    {
      "unit_id": "source-note-0003",
      "unit_type": "source_note",
      "editability": "editable",
      "edit_safety": "safe_to_edit",
      "comment_safety": "safe_to_comment",
      "word_part": "word/footnotes.xml",
      "location": "Document 3, footnote 1",
      "exact_text": "Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.",
      "display_text": "Source: Reagan Library, Executive Secretariat, NSC Country File, Europe and Soviet Union, USSR, 1981. No classification.",
      "existing_revisions": false,
      "existing_comments": [],
      "blocked_boundaries": []
    }
  ]
}
```

## Annotation Sheet Profile Context

Use this to recognize finished-form FRUS annotation-sheet structure when Word styles are flat. Lexical FRUS apparatus patterns outrank Word paragraph styles. Preserve or reversibly map production pseudo-markers; use comment-only when a direct edit would touch or split them.

```json
{
  "schema_version": "frus-annotation-sheet-profile-v1",
  "profile_id": "foundations-consolidated-good-form-2026-06-03",
  "captured_at": "2026-06-03",
  "source_label": "Foundations Consolidated.docx",
  "source_basis": {
    "sample_kind": "uploaded_finished_annotation_sheet",
    "summary": "Read-only structural extraction of the uploaded finished-form FRUS annotation sheet exemplar.",
    "paragraphs": 5495,
    "nonempty_paragraphs": 5137,
    "word_comments": 0,
    "tracked_revision_runs": 0,
    "footnote_parts": 0,
    "endnote_parts": 0,
    "tables": 0,
    "hyperlink_paragraphs": 0,
    "primary_word_styles": [
      {
        "style": "Normal",
        "count": 5344
      },
      {
        "style": "ListParagraph",
        "count": 151
      }
    ],
    "marker_inventory": [
      {
        "token": "<n>",
        "count": 2208
      },
      {
        "token": "<r>",
        "count": 1354
      },
      {
        "token": "<i>",
        "count": 1331
      },
      {
        "token": "<m>",
        "count": 812
      },
      {
        "token": "<1>",
        "count": 268
      },
      {
        "token": "<b>",
        "count": 25
      }
    ],
    "known_exemplar_anomalies": [
      "Rare malformed or adjacent angle-token strings in raw paragraph text require wrapper mapping or comment-only treatment before tracked changes."
    ]
  },
  "style_policy": {
    "unitization_basis": "lexical_frus_structure",
    "do_not_depend_on_word_styles": true,
    "flat_style_warning_threshold": 0.95,
    "allowed_flat_styles": [
      "Normal",
      "ListParagraph"
    ],
    "good_form_principles": [
      "A polished FRUS annotation sheet may be structurally flat in Word.",
      "Recover source notes, editorial notes, front matter, source-list entries, and document headings from lexical sequence and FRUS apparatus markers.",
      "Treat body-note prefixes such as '1  Source:' as source-note starts even when they occur in the main document story.",
      "Do not downgrade a unit to transcribed document text only because Word paragraph styles are Normal."
    ]
  },
  "pseudo_marker_policy": {
    "direct_edit_policy": "preserve_or_comment_only",
    "allowed_tokens": [
      "<i>",
      "<r>",
      "<b>",
      "<n>",
      "<m>"
    ],
    "numeric_marker_min": 1,
    "numeric_marker_max": 20,
    "preserve_literal_markers": true,
    "wrapper_notes": [
      "<i>, <r>, and <b> encode production styling boundaries.",
      "<n> and <m> encode production punctuation or line-break behavior.",
      "Numeric markers such as <1> encode note or production references.",
      "A direct edit may correct text near markers only when the original_text anchor does not include or split marker tokens."
    ]
  },
  "lexical_unit_patterns": [
    {
      "pattern_id": "lex-source-note-inline",
      "unit_type": "source_note",
      "regex": "^(?:[0-9]+\\s+)?Source\\s*:",
      "severity": "fail",
      "note": "Inline body-note source notes must be unitized as source_note even in a flat Word paragraph."
    },
    {
      "pattern_id": "lex-editorial-note",
      "unit_type": "editorial_note",
      "regex": "^Editorial Note\\b\\.?",
      "severity": "warning",
      "note": "Editorial Note headings should not be treated as ordinary transcription."
    },
    {
      "pattern_id": "lex-front-matter-sources",
      "unit_type": "front_matter",
      "regex": "^(?:Sources for|Focus of Research and Principles of Selection for|Preface\\b|About the Series\\b)",
      "severity": "warning",
      "note": "Front matter often appears as Normal paragraphs and must be carried as context for source-list and selection-balance review."
    },
    {
      "pattern_id": "lex-source-list-lot-file",
      "unit_type": "source_list_entry",
      "regex": "^Lot\\s+[0-9]{2}[A-Z][0-9]+\\s*:",
      "severity": "warning",
      "note": "Lot-file source-list rows can be plain paragraphs and should be preserved as source-list entries."
    }
  ],
  "profile_checks": [
    {
      "check_id": "FAS-PROFILE-001",
      "description": "Do not rely on Word paragraph styles alone for FRUS annotation-sheet unitization."
    },
    {
      "check_id": "FAS-PROFILE-002",
      "description": "Treat production pseudo-markers as protected tokens unless the wrapper has a reversible mapping."
    },
    {
      "check_id": "FAS-PROFILE-003",
      "description": "Downgrade direct edits to comments when an anchor includes or splits a pseudo-marker."
    },
    {
      "check_id": "FAS-PROFILE-004",
      "description": "Record exemplar/style discrepancies separately for the General Editor rather than normalizing uncertain production conventions."
    }
  ]
}
```

## Extracted Status Claims For This Chunk

```json
{
  "schema_version": "frus-status-claims-v1",
  "source": "Extracted status-bearing phrases from FRUS annotation-sheet units.",
  "generated_at": "2026-06-03T14:19:18.980Z",
  "registry_source_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
  "registry_captured_at": "2026-06-03",
  "target_entry_id_fallback": "",
  "summary": {
    "units_scanned": 4,
    "claims_found": 0,
    "direct_edit_requested": 0,
    "by_claim_type": {
      "scheduled_for_publication": 1,
      "anticipated_in_year": 1,
      "being_cleared": 1,
      "history_office_url": 1
    },
    "by_target_inference": {
      "high": 3,
      "medium": 1
    }
  },
  "claims": []
}
```

## Status Registry Context

```json
{
  "schema_version": "frus-status-registry-v1",
  "captured_at": "2026-06-03",
  "source_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
  "scope": "Current 1981-1992 Reagan and George H.W. Bush FRUS status-page context for annotation-sheet status and cross-reference checks.",
  "source_evidence": {
    "stage_definitions": [
      "Planning",
      "Research",
      "Clearance",
      "Publication"
    ],
    "status_page_headings_seen": [
      "Published in 2025",
      "Anticipated in 2026",
      "Volumes with Chapters Outstanding",
      "Volumes in Progress",
      "Being Cleared",
      "Being Researched",
      "Planned"
    ],
    "capture_note": "Captured from the official History Office status page on 2026-06-03. Refresh before production status-language redlines."
  },
  "snapshot_integrity": {
    "entries_total": 74,
    "relevant_1981_1992_counts": {
      "published_2025_pattern_evidence": 2,
      "anticipated_2026_overlay": 2,
      "being_cleared": 46,
      "being_researched": 24,
      "planned": 2
    },
    "by_stage_and_administration": {
      "published": {
        "reagan": 1,
        "bush-ghw": 1
      },
      "being_cleared": {
        "reagan": 35,
        "bush-ghw": 11
      },
      "being_researched": {
        "reagan": 5,
        "bush-ghw": 19
      },
      "planned": {
        "reagan": 0,
        "bush-ghw": 2
      }
    },
    "nested_subitem_overlays_seen": 1,
    "parser_status": "complete_current_capture"
  },
  "entries": [
    {
      "entry_id": "frus1981-88v44p1",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLIV, Part 1",
      "title": "National Security Policy, 1985-1988",
      "production_stage": "published",
      "release_buckets": [
        "published_2025"
      ],
      "published_date": "2025-08-01",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v31",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXXI",
      "title": "START I, 1989-1991",
      "production_stage": "published",
      "release_buckets": [
        "published_2025"
      ],
      "published_date": "2025-09-30",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v31",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v02",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "II",
      "title": "Organization and Management of Foreign Policy",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v02",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v07",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "VII",
      "title": "Western Europe, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v07",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v09",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "IX",
      "title": "Poland, 1982-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v09",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v12",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XII",
      "title": "INF, 1984-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v12",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v14",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XIV",
      "title": "Central America, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v14",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v15",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XV",
      "title": "Central America, 1985-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v15",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v16",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XVI",
      "title": "South America",
      "production_stage": "being_cleared",
      "release_buckets": [
        "anticipated_2026"
      ],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v16",
      "subitems": [
        {
          "label": "South America Region",
          "release_buckets": []
        },
        {
          "label": "Argentina",
          "release_buckets": []
        },
        {
          "label": "Bolivia",
          "release_buckets": []
        },
        {
          "label": "Brazil",
          "release_buckets": []
        },
        {
          "label": "Chile",
          "release_buckets": []
        },
        {
          "label": "Colombia",
          "release_buckets": []
        },
        {
          "label": "Ecuador",
          "release_buckets": []
        },
        {
          "label": "Paraguay",
          "release_buckets": []
        },
        {
          "label": "Peru",
          "release_buckets": []
        },
        {
          "label": "Uruguay",
          "release_buckets": []
        },
        {
          "label": "Venezuela",
          "release_buckets": [
            "anticipated_2026"
          ]
        }
      ]
    },
    {
      "entry_id": "frus1981-88v17p1",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XVII, Part 1",
      "title": "Mexico; Western Caribbean",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v17p1",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v17p2",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XVII, Part 2",
      "title": "Eastern Caribbean",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v17p2",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v18p1",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XVIII, Part 1",
      "title": "Lebanon, April 1981-August 1982",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v18p1",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v18p2",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XVIII, Part 2",
      "title": "Lebanon, September 1982-March 1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v18p2",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v19",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XIX",
      "title": "Arab-Israeli Dispute",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v19",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v20",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XX",
      "title": "Iran; Iraq, April 1980-January 1985",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v20",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v21",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXI",
      "title": "Iran; Iraq, 1985-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v21",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v22",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXII",
      "title": "Middle East Region; Arabian Peninsula",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v22",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v25",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXV",
      "title": "Southern Africa, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v25",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v26",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXVI",
      "title": "Southern Africa, 1985-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v26",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v27",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXVII",
      "title": "Sub-Saharan Africa",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v27",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v28",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXVIII",
      "title": "China, 1981-1983",
      "production_stage": "being_cleared",
      "release_buckets": [
        "anticipated_2026"
      ],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v28",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v29",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXIX",
      "title": "China, 1984-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v29",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v30",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXX",
      "title": "Japan; Korea, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v30",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v31",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXI",
      "title": "Japan; Korea, 1985-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v31",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v32",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXII",
      "title": "Southeast Asia; Pacific",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v32",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v33",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXIII",
      "title": "South Asia",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v33",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v34",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXIV",
      "title": "Afghanistan, February 1981-October 1985",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v34",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v35",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXV",
      "title": "Afghanistan, November 1985-February 1989",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v35",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v36",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXVI",
      "title": "Trade; Monetary Policy; Industrialized Country Cooperation, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v36",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v39",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXIX",
      "title": "Public Diplomacy",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v39",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v40",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XL",
      "title": "Global Issues I",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v40",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v43",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLIII",
      "title": "National Security Policy, 1981-1984",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v43",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v44p2",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLIV, Part 2",
      "title": "National Security Policy, 1985-1988",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p2",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v46",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLVI",
      "title": "War on Drugs",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v46",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v47p1",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLVII, Part 1",
      "title": "Terrorism, January 1977-May 1985",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v47p1",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v47p2",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLVII, Part 2",
      "title": "Terrorism, June 1985-January 1989",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v47p2",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v48",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLVIII",
      "title": "Libya; Chad",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v48",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v03",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "III",
      "title": "Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v03",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v07",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "VII",
      "title": "Yugoslavia",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v07",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v10",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "X",
      "title": "European Security, 1984-1992",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v10",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v11",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XI",
      "title": "Persian Gulf Crisis, 1989-1990",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v11",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v12",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XII",
      "title": "Persian Gulf Crisis, 1990-1991",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v12",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v13",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XIII",
      "title": "Persian Gulf Crisis, 1991-1992",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v13",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v17",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XVII",
      "title": "China",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v17",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v19",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XIX",
      "title": "Southern Africa",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v19",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v21",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXI",
      "title": "Somalia, 1989-1994",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v21",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v26",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXVI",
      "title": "National Security Policy",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v26",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v33",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXXIII",
      "title": "Canada and Mexico",
      "production_stage": "being_cleared",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v33",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v08",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "VIII",
      "title": "Western Europe, 1985-1988",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v08",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v23",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXIII",
      "title": "Iran-Contra Affair, 1985-1988",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v23",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v37",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XXXVII",
      "title": "Trade; Monetary Policy; Industrialized Country Cooperation, 1985-1988",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v37",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v42",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLII",
      "title": "Refugees and Immigration, 1975-1984",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v42",
      "subitems": []
    },
    {
      "entry_id": "frus1981-88v45",
      "administration": "reagan",
      "date_range": "1981-1988",
      "volume_number": "XLV",
      "title": "Eastern Mediterranean",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v45",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v01",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "I",
      "title": "Foundations of Foreign Policy; Public Diplomacy",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v01",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v02",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "II",
      "title": "Organization and Management of Foreign Policy",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v02",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v04",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "IV",
      "title": "Soviet Union, Russia, and Post-Soviet States: Policy",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v04",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v05",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "V",
      "title": "Eastern Europe",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v05",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v06",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "VI",
      "title": "Eastern Mediterranean",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v06",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v08",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "VIII",
      "title": "Western Europe",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v08",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v09",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "IX",
      "title": "Germany",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v09",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v14",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XIV",
      "title": "Arab-Israeli Dispute",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v14",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v15",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XV",
      "title": "South Asia",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v15",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v16",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XVI",
      "title": "Southeast Asia and the Pacific",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v16",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v18",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XVIII",
      "title": "Japan; Korea",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v18",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v20",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XX",
      "title": "North Africa; Sub-Saharan Africa",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v20",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v22",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXII",
      "title": "Cuba; Haiti; Caribbean",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v22",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v23",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXIII",
      "title": "Central America",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v23",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v24",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXIV",
      "title": "Panama, 1981-1992",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v24",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v25",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXV",
      "title": "South America",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v25",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v27",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXVII",
      "title": "Arms Control and Nonproliferation",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v27",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v30",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXX",
      "title": "Foreign Economic Policy",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v30",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v32",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXXII",
      "title": "Iran",
      "production_stage": "being_researched",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v32",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v28",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXVIII",
      "title": "Counternarcotics; Counterterrorism",
      "production_stage": "planned",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v28",
      "subitems": []
    },
    {
      "entry_id": "frus1989-92v29",
      "administration": "bush-ghw",
      "date_range": "1989-1992",
      "volume_number": "XXIX",
      "title": "Global Issues",
      "production_stage": "planned",
      "release_buckets": [],
      "published_date": "",
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v29",
      "subitems": []
    }
  ]
}
```

## Authority Registry Context

```json
{
  "schema_version": "frus-authority-registry-v1",
  "authority_registry_id": "frus-1981-1992-authority-control-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/persons",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/persons",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/terms"
  ],
  "scope": "Sample authority-control registry for validating Persons and Abbreviations/Terms usage in Reagan and George H.W. Bush FRUS annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "authority_item_id": "person-bush-ghw-v31",
      "authority_type": "person",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "Bush, George Herbert Walker",
      "variant_forms": [
        "George H.W. Bush",
        "President Bush",
        "Bush, George H.W."
      ],
      "role_or_expansion": "Vice President of the United States until January 1989; President of the United States from January 20, 1989",
      "date_span": "through January 1989; from January 20, 1989",
      "index_or_front_matter_behavior": "Persons entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/persons",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "person-baker-v31",
      "authority_type": "person",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "Baker, James Addison, III",
      "variant_forms": [
        "James Baker",
        "Baker, James A., III"
      ],
      "role_or_expansion": "Secretary of State from January 25, 1989",
      "date_span": "from January 25, 1989",
      "index_or_front_matter_behavior": "Persons entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/persons",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-start-v31",
      "authority_type": "term",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "START",
      "variant_forms": [
        "Strategic Arms Reduction Talks",
        "Strategic Arms Reduction Treaty"
      ],
      "role_or_expansion": "Strategic Arms Reduction Talks; Strategic Arms Reduction Treaty",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-cob-v31",
      "authority_type": "abbreviation",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "COB",
      "variant_forms": [
        "close of business"
      ],
      "role_or_expansion": "close of business",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-secdef-v31",
      "authority_type": "abbreviation",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "SECDEF",
      "variant_forms": [
        "SecDef",
        "Secretary of Defense"
      ],
      "role_or_expansion": "Secretary of Defense",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "index-rule-v31",
      "authority_type": "index_entry",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "index numbers refer to document numbers",
      "variant_forms": [
        "page numbers",
        "document numbers"
      ],
      "role_or_expansion": "Index references use document numbers rather than page numbers",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "About the Series index rule",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
      "verification_status": "verified_published_pattern"
    }
  ],
  "records": [
    {
      "authority_item_id": "person-bush-ghw-v31",
      "authority_type": "person",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "Bush, George Herbert Walker",
      "variant_forms": [
        "George H.W. Bush",
        "President Bush",
        "Bush, George H.W."
      ],
      "role_or_expansion": "Vice President of the United States until January 1989; President of the United States from January 20, 1989",
      "date_span": "through January 1989; from January 20, 1989",
      "index_or_front_matter_behavior": "Persons entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/persons",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "person-bush-ghw-v44p1",
      "authority_type": "person",
      "volume_id": "frus1981-88v44p1",
      "approved_display_form": "Bush, George H.W.",
      "variant_forms": [
        "Bush, George Herbert Walker",
        "Vice President Bush"
      ],
      "role_or_expansion": "Vice President of the United States",
      "date_span": "1985-1988 volume context",
      "index_or_front_matter_behavior": "Persons entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/persons",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "person-baker-v31",
      "authority_type": "person",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "Baker, James Addison, III",
      "variant_forms": [
        "James Baker",
        "Baker, James A., III"
      ],
      "role_or_expansion": "Secretary of State from January 25, 1989",
      "date_span": "from January 25, 1989",
      "index_or_front_matter_behavior": "Persons entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/persons",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-start-v31",
      "authority_type": "term",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "START",
      "variant_forms": [
        "Strategic Arms Reduction Talks",
        "Strategic Arms Reduction Treaty"
      ],
      "role_or_expansion": "Strategic Arms Reduction Talks; Strategic Arms Reduction Treaty",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-cob-v31",
      "authority_type": "abbreviation",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "COB",
      "variant_forms": [
        "close of business"
      ],
      "role_or_expansion": "close of business",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-cob-v44p1",
      "authority_type": "abbreviation",
      "volume_id": "frus1981-88v44p1",
      "approved_display_form": "COB or C.O.B.",
      "variant_forms": [
        "COB",
        "C.O.B.",
        "Close of Business"
      ],
      "role_or_expansion": "Close of Business",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "term-secdef-v31",
      "authority_type": "abbreviation",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "SECDEF",
      "variant_forms": [
        "SecDef",
        "Secretary of Defense"
      ],
      "role_or_expansion": "Secretary of Defense",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "Abbreviations and Terms entry",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/terms",
      "verification_status": "verified_published_pattern"
    },
    {
      "authority_item_id": "index-rule-v31",
      "authority_type": "index_entry",
      "volume_id": "frus1989-92v31",
      "approved_display_form": "index numbers refer to document numbers",
      "variant_forms": [
        "page numbers",
        "document numbers"
      ],
      "role_or_expansion": "Index references use document numbers rather than page numbers",
      "date_span": "volume-wide",
      "index_or_front_matter_behavior": "About the Series index rule",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
      "verification_status": "verified_published_pattern"
    }
  ]
}
```

## Source List And Front Matter Registry Context

```json
{
  "schema_version": "frus-source-list-registry-v1",
  "source_list_registry_id": "frus-1981-1992-source-list-front-matter-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources"
  ],
  "scope": "Sample source-list/front-matter registry for reconciling source notes, source-list entries, and published-source references in Reagan and George H.W. Bush FRUS annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "source_item_id": "source-bush-library-v31",
      "source_type": "repository",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "George H.W. Bush Presidential Library",
      "variant_forms": [
        "Bush Library",
        "George Bush Presidential Library"
      ],
      "repository_or_parent": "College Station, Texas",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Bush Presidential and Vice Presidential records cited in START I source notes.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-bush-nsc-hfiles-v31",
      "source_type": "presidential_library_series",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "National Security Council Institutional Files (H-Files)",
      "variant_forms": [
        "Institutional Files (H-Files)",
        "NSC H-Files",
        "H-Files"
      ],
      "repository_or_parent": "George H.W. Bush Presidential Library",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for NSC and NSC Deputies Committee meeting files and related Bush Library institutional files.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-cfpf-v31",
      "source_type": "source_family",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Central Foreign Policy File",
      "variant_forms": [
        "CFPF",
        "D Reels",
        "P Reels",
        "N Reels"
      ],
      "repository_or_parent": "Department of State, Washington, D.C.",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for cable traffic and P, D, and N reel records cited from the Department of State file family.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-lot-01d127-v31",
      "source_type": "lot_file",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Lot 01D127",
      "variant_forms": [
        "01D127",
        "Subject Records of James P. Timbie"
      ],
      "repository_or_parent": "Department of State, Washington, D.C.",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Office of the Under Secretary for Arms Control, International Security Affairs, 1969-1990 Subject Record of James P. Timbie.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-bulletin-v31",
      "source_type": "published_source",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Department of State Bulletin",
      "variant_forms": [
        "State Department Bulletin"
      ],
      "repository_or_parent": "Published Sources",
      "front_matter_section": "Published Sources",
      "source_note_usage": "Use for published Department of State Bulletin citations in START I annotations.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-nyt-v31",
      "source_type": "published_source",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "New York Times",
      "variant_forms": [
        "The New York Times"
      ],
      "repository_or_parent": "Published Sources",
      "front_matter_section": "Published Sources",
      "source_note_usage": "Use for New York Times citations in START I annotations.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    }
  ],
  "records": [
    {
      "source_item_id": "source-bush-library-v31",
      "source_type": "repository",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "George H.W. Bush Presidential Library",
      "variant_forms": [
        "Bush Library",
        "George Bush Presidential Library"
      ],
      "repository_or_parent": "College Station, Texas",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Bush Presidential and Vice Presidential records cited in START I source notes.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-bush-nsc-hfiles-v31",
      "source_type": "presidential_library_series",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "National Security Council Institutional Files (H-Files)",
      "variant_forms": [
        "Institutional Files (H-Files)",
        "NSC H-Files",
        "H-Files"
      ],
      "repository_or_parent": "George H.W. Bush Presidential Library",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for NSC and NSC Deputies Committee meeting files and related Bush Library institutional files.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-cfpf-v31",
      "source_type": "source_family",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Central Foreign Policy File",
      "variant_forms": [
        "CFPF",
        "D Reels",
        "P Reels",
        "N Reels"
      ],
      "repository_or_parent": "Department of State, Washington, D.C.",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for cable traffic and P, D, and N reel records cited from the Department of State file family.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-lot-01d127-v31",
      "source_type": "lot_file",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Lot 01D127",
      "variant_forms": [
        "01D127",
        "Subject Records of James P. Timbie"
      ],
      "repository_or_parent": "Department of State, Washington, D.C.",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Office of the Under Secretary for Arms Control, International Security Affairs, 1969-1990 Subject Record of James P. Timbie.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-state-bulletin-v31",
      "source_type": "published_source",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "Department of State Bulletin",
      "variant_forms": [
        "State Department Bulletin"
      ],
      "repository_or_parent": "Published Sources",
      "front_matter_section": "Published Sources",
      "source_note_usage": "Use for published Department of State Bulletin citations in START I annotations.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-nyt-v31",
      "source_type": "published_source",
      "volume_id": "frus1989-92v31",
      "approved_source_form": "New York Times",
      "variant_forms": [
        "The New York Times"
      ],
      "repository_or_parent": "Published Sources",
      "front_matter_section": "Published Sources",
      "source_note_usage": "Use for New York Times citations in START I annotations.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-reagan-library-v44p1",
      "source_type": "repository",
      "volume_id": "frus1981-88v44p1",
      "approved_source_form": "Ronald Reagan Presidential Library",
      "variant_forms": [
        "Reagan Library",
        "Ronald Reagan Library"
      ],
      "repository_or_parent": "Simi Valley, California",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for White House Staff and Office Files, NSC Executive Secretariat files, and related Reagan Library collections.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-reagan-w-files-v44p1",
      "source_type": "presidential_library_series",
      "volume_id": "frus1981-88v44p1",
      "approved_source_form": "W Files",
      "variant_forms": [
        "NSC's W files",
        "W-files"
      ],
      "repository_or_parent": "Ronald Reagan Presidential Library",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Reagan Library files located in Washington cited in national security policy source notes.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-profs-v44p1",
      "source_type": "electronic_file",
      "volume_id": "frus1981-88v44p1",
      "approved_source_form": "PROFS System",
      "variant_forms": [
        "PROFS"
      ],
      "repository_or_parent": "Ronald Reagan Presidential Library",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for White House electronic messages cited from Reagan national security policy files.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_sources"
    },
    {
      "source_item_id": "source-reagan-state-lot-90d397-v44p1",
      "source_type": "lot_file",
      "volume_id": "frus1981-88v44p1",
      "approved_source_form": "Lot 90D397",
      "variant_forms": [
        "90D397",
        "Ambassador Nitze's Personal Files"
      ],
      "repository_or_parent": "Department of State, Washington, D.C.",
      "front_matter_section": "Unpublished Sources",
      "source_note_usage": "Use for Ambassador Nitze's Personal Files cited in Reagan national security policy source notes.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_sources"
    }
  ]
}
```

## Source Family Registry Context

Use this to preserve real source-family identity in source notes and Sources-page language. Recent Reagan and George H.W. Bush volumes distinguish PROFS, W Files, System IV Intelligence Files, National Security Council Institutional Files (H-Files), Central Foreign Policy File D/P/N/P reels, lot files, presidential-library collections, and public-source families. Do not flatten a specific source family into a generic repository path, and do not promote a surrogate locator into a source family unless the target-volume registry proves the direct edit.

```json
{
  "schema_version": "frus-source-family-registry-v1",
  "source_family_registry_id": "frus-reagan-bush-source-family-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/sources"
  ],
  "scope": "Sample published source-family forms for Reagan and George H.W. Bush FRUS annotation-sheet review. Use this to preserve real source ecologies and prevent flattening PROFS, W Files, System IV, H-Files, CFPF reels, and public-source families into generic repository paths.",
  "target_volume": "frus1989-92v31",
  "target_families": [
    {
      "source_family_id": "sf-v31-bush-hfiles",
      "volume_id": "frus1989-92v31",
      "display_family": "George H.W. Bush Presidential Library, Bush Presidential Records, National Security Council Institutional Files (H-Files)",
      "source_family_type": "presidential_library",
      "volume_scope": [
        "1989-1992 Volume XXXI",
        "Bush START I national security files"
      ],
      "distinguishing_tokens": [
        "National Security Council Institutional Files",
        "H-Files"
      ],
      "required_components_when_present": [
        "Bush Presidential Records",
        "National Security Council Institutional Files",
        "H-Files",
        "subseries or meeting/directive file when present",
        "OA/ID or folder title when present"
      ],
      "do_not_flatten_to": [
        "Bush Library, NSC files",
        "Bush Presidential Records"
      ],
      "variant_forms": [
        "Bush Library, National Security Council Institutional Files (H-Files)"
      ],
      "source_or_context": "Bush START I sources page identifies National Security Council Institutional Files (H-Files) as critical documentation for NSC, Deputies Committee, and NSD material.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v31-cfpf-dpn-reels",
      "volume_id": "frus1989-92v31",
      "display_family": "Department of State, Central Foreign Policy File, P Reels, D Reels, and N Reels",
      "source_family_type": "central_foreign_policy_file",
      "volume_scope": [
        "1989-1992 Volume XXXI",
        "Bush START I Department of State cable and memorandum files"
      ],
      "distinguishing_tokens": [
        "Central Foreign Policy File",
        "P Reels",
        "D Reels",
        "N Reels"
      ],
      "required_components_when_present": [
        "Central Foreign Policy File",
        "D, P, or N reel type",
        "telegram number or memorandum locator when present",
        "date-time group when present"
      ],
      "do_not_flatten_to": [
        "Department of State files",
        "NARA records"
      ],
      "variant_forms": [
        "CFPF D, P, and N reels"
      ],
      "source_or_context": "Bush START I sources page distinguishes D and N cable reels from P reels of memoranda and other paper items.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_source_family"
    }
  ],
  "families": [
    {
      "source_family_id": "sf-v44p1-profs-system",
      "volume_id": "frus1981-88v44p1",
      "display_family": "National Archives and Records Administration, College Park, Maryland, PROFS System",
      "source_family_type": "electronic_message_system",
      "volume_scope": [
        "1981-1988 Volume XLIV Part 1",
        "Reagan national security electronic messages"
      ],
      "distinguishing_tokens": [
        "PROFS",
        "PROFS System"
      ],
      "required_components_when_present": [
        "specific electronic-message system",
        "message identifier or folder subject when present",
        "classification and handling when present"
      ],
      "do_not_flatten_to": [
        "National Archives records",
        "Reagan Library files"
      ],
      "variant_forms": [
        "NARA, PROFS System"
      ],
      "source_or_context": "Reagan National Security Policy sources list identifies the PROFS System as a distinct NARA source family.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v44p1-w-files",
      "volume_id": "frus1981-88v44p1",
      "display_family": "Ronald Reagan Presidential Library, W Files",
      "source_family_type": "presidential_library",
      "volume_scope": [
        "1981-1988 Volume XLIV Part 1",
        "Reagan national security Washington files"
      ],
      "distinguishing_tokens": [
        "W Files",
        "NSC's W files"
      ],
      "required_components_when_present": [
        "W Files label",
        "folder or subject when present",
        "classification and handling when present"
      ],
      "do_not_flatten_to": [
        "Reagan Library files",
        "White House Staff and Office Files"
      ],
      "variant_forms": [
        "Reagan Library, W Files"
      ],
      "source_or_context": "Reagan National Security Policy sources list treats W Files as a distinct Reagan Library source family.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v44p1-system-iv-intelligence",
      "volume_id": "frus1981-88v44p1",
      "display_family": "Ronald Reagan Presidential Library, White House Staff and Office Files, Files of the Executive Secretariat, National Security Council, System IV Intelligence Files",
      "source_family_type": "presidential_library",
      "volume_scope": [
        "1981-1988 Volume XLIV Part 1",
        "Reagan NSC Executive Secretariat files"
      ],
      "distinguishing_tokens": [
        "System IV Intelligence Files",
        "Files of the Executive Secretariat, National Security Council",
        "NSC Executive Secretariat"
      ],
      "required_components_when_present": [
        "White House Staff and Office Files",
        "Files of the Executive Secretariat, National Security Council",
        "System IV Intelligence Files",
        "folder or file title when present"
      ],
      "do_not_flatten_to": [
        "Reagan Library, White House Staff and Office Files",
        "Reagan Library files"
      ],
      "variant_forms": [
        "Reagan Library, White House Staff and Office Files, NSC Executive Secretariat, System IV Intelligence Files"
      ],
      "source_or_context": "Reagan National Security Policy sources list nests System IV Intelligence Files under White House Staff and Office Files, Executive Secretariat, NSC.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v31-bush-hfiles",
      "volume_id": "frus1989-92v31",
      "display_family": "George H.W. Bush Presidential Library, Bush Presidential Records, National Security Council Institutional Files (H-Files)",
      "source_family_type": "presidential_library",
      "volume_scope": [
        "1989-1992 Volume XXXI",
        "Bush START I national security files"
      ],
      "distinguishing_tokens": [
        "National Security Council Institutional Files",
        "H-Files"
      ],
      "required_components_when_present": [
        "Bush Presidential Records",
        "National Security Council Institutional Files",
        "H-Files",
        "subseries or meeting/directive file when present",
        "OA/ID or folder title when present"
      ],
      "do_not_flatten_to": [
        "Bush Library, NSC files",
        "Bush Presidential Records"
      ],
      "variant_forms": [
        "Bush Library, National Security Council Institutional Files (H-Files)"
      ],
      "source_or_context": "Bush START I sources page identifies National Security Council Institutional Files (H-Files) as critical documentation for NSC, Deputies Committee, and NSD material.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v31-cfpf-dpn-reels",
      "volume_id": "frus1989-92v31",
      "display_family": "Department of State, Central Foreign Policy File, P Reels, D Reels, and N Reels",
      "source_family_type": "central_foreign_policy_file",
      "volume_scope": [
        "1989-1992 Volume XXXI",
        "Bush START I Department of State cable and memorandum files"
      ],
      "distinguishing_tokens": [
        "Central Foreign Policy File",
        "P Reels",
        "D Reels",
        "N Reels"
      ],
      "required_components_when_present": [
        "Central Foreign Policy File",
        "D, P, or N reel type",
        "telegram number or memorandum locator when present",
        "date-time group when present"
      ],
      "do_not_flatten_to": [
        "Department of State files",
        "NARA records"
      ],
      "variant_forms": [
        "CFPF D, P, and N reels"
      ],
      "source_or_context": "Bush START I sources page distinguishes D and N cable reels from P reels of memoranda and other paper items.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
      "verification_status": "verified_published_source_family"
    },
    {
      "source_family_id": "sf-v01-foundations-public-sources",
      "volume_id": "frus1981-88v01",
      "display_family": "Published public sources including Public Papers of the Presidents of the United States and the Department of State Bulletin",
      "source_family_type": "public_source",
      "volume_scope": [
        "1981-1988 Volume I",
        "Reagan Foundations public diplomacy and public statement records"
      ],
      "distinguishing_tokens": [
        "Public Papers",
        "Department of State Bulletin",
        "Weekly Compilation of Presidential Documents",
        "White House Office of Speechwriting",
        "WHORM SP"
      ],
      "required_components_when_present": [
        "selected public or printed source",
        "date",
        "speech, statement, testimony, report, or campaign context",
        "archival control copy only when supplied"
      ],
      "do_not_flatten_to": [
        "Reagan Library archival source",
        "Reagan Library files"
      ],
      "variant_forms": [
        "Public Papers of the Presidents of the United States and Department of State Bulletin"
      ],
      "source_or_context": "Reagan Foundations sources page says much of the volume's documentation was drawn from public sources, especially Public Papers and the Department of State Bulletin.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/sources",
      "verification_status": "verified_published_source_family"
    }
  ]
}
```

## Source Surrogate And Release Registry Context

Use this to check RAC, NLR, no-N-number, FOIA or mandatory-review identifiers, NARA catalog identifiers, PDFs, scans, URLs, release packages, W Files, PROFS, eRecords, internet-resource notes, transfer-to-NARA language, and provisional discovery labels. Treat surrogate identifiers as locators or access context, not as proof of repository path, source family, classification, attachment status, physical-file completeness, or source-image content unless the target-volume registry proves the exact direct edit.

```json
{
  "schema_version": "frus-source-surrogate-registry-v1",
  "source_surrogate_registry_id": "frus-1981-1992-source-surrogate-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d227",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d309",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources"
  ],
  "scope": "Published Reagan/Bush sample records for checking RAC, NLR, no-N-number, W Files, PROFS, internet-resource, transfer, scan, release, and discovery-platform surrogate language without turning provisional locators into final FRUS provenance.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "source_surrogate_item_id": "surrogate-v01-d227-nlr-source-note",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d227",
      "document_number": "227",
      "unit_scope": "source note 1",
      "surrogate_type": "nlr_identifier",
      "approved_phrase": "Reagan Library, European and Soviet Affairs Directorate, NSC Records, Subject File, U.S. Foreign Policy; NLR-170-13-49-17-7",
      "repository_or_source_family": "Reagan Library European and Soviet Affairs Directorate NSC Records subject file",
      "surrogate_identifier": "NLR-170-13-49-17-7",
      "release_or_access_basis": "published Reagan Foundations source note places NLR identifier after repository path",
      "source_image_or_copy_status": "identifier is a release locator, not source-image proof by itself",
      "archival_path_or_url": "Reagan Library, European and Soviet Affairs Directorate, NSC Records, Subject File, U.S. Foreign Policy",
      "publication_or_attachment_status": "source-note locator",
      "caveat_or_limitation": "separate related records may carry separate NLR identifiers; do not infer attachment status from NLR alone",
      "source_or_context": "Reagan Foundations Document 227",
      "variant_forms": [
        "NLR-170-13-49-17-7",
        "NLR-170-13-49-16-8",
        "NLR-170-13-49-15-9"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d227",
      "verification_status": "verified_published_surrogate_record"
    },
    {
      "source_surrogate_item_id": "surrogate-v01-d309-no-n-number-telegram",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d309",
      "document_number": "309",
      "unit_scope": "footnotes 2 and 4",
      "surrogate_type": "no_n_number",
      "approved_phrase": "Department of State, Central Foreign Policy File, Electronic Telegrams, [no N number]",
      "repository_or_source_family": "Department of State Central Foreign Policy File Electronic Telegrams",
      "surrogate_identifier": "[no N number]",
      "release_or_access_basis": "published Reagan Foundations footnotes preserve absence of an N number",
      "source_image_or_copy_status": "no-N-number status is a locator caveat, not permission to invent a telegram identifier",
      "archival_path_or_url": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "publication_or_attachment_status": "follow-on source citation locator",
      "caveat_or_limitation": "do not supply an N number from context when the published form says none exists",
      "source_or_context": "Reagan Foundations Document 309 footnotes 2 and 4",
      "variant_forms": [
        "Electronic Telegrams, [no N number]",
        "[no N number]",
        "no N number"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d309",
      "verification_status": "verified_published_surrogate_record"
    },
    {
      "source_surrogate_item_id": "surrogate-v44p1-sources-w-files",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/sources",
      "document_number": "Sources",
      "unit_scope": "front matter",
      "surrogate_type": "w_files_or_profs_context",
      "approved_phrase": "The NSC's W files-Reagan Library files located in Washington-also yielded valuable documentation for the volume",
      "repository_or_source_family": "Reagan Library W Files and PROFS System",
      "surrogate_identifier": "W Files; PROFS",
      "release_or_access_basis": "published source-list context distinguishes special Reagan Library Washington files and electronic messages",
      "source_image_or_copy_status": "front-matter source context, not document-specific source-image proof",
      "archival_path_or_url": "Ronald Reagan Presidential Library and National Archives source list context",
      "publication_or_attachment_status": "source-list context",
      "caveat_or_limitation": "do not collapse W Files, PROFS, and NSC institutional files into one source family",
      "source_or_context": "Reagan NSP Part 1 Sources",
      "variant_forms": [
        "The NSC's W files",
        "Reagan Library files located in Washington",
        "PROFS System of White House electronic messages"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_surrogate_record"
    },
    {
      "source_surrogate_item_id": "surrogate-v44p1-sources-internet-resources",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/sources",
      "document_number": "Sources",
      "unit_scope": "front matter",
      "surrogate_type": "digital_scan_url",
      "approved_phrase": "In addition to the paper files cited below, a growing number of documents are available on the Internet",
      "repository_or_source_family": "paper files plus online resources",
      "surrogate_identifier": "Internet resource",
      "release_or_access_basis": "published source-list caution that online availability supplements paper-file citations",
      "source_image_or_copy_status": "online availability does not replace paper-file provenance",
      "archival_path_or_url": "Office of the Historian internet-resource context",
      "publication_or_attachment_status": "front-matter source-list caution",
      "caveat_or_limitation": "do not convert a public URL or scan into a final source path without repository basis",
      "source_or_context": "Reagan NSP Part 1 Sources",
      "variant_forms": [
        "available on the Internet",
        "Internet resources"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_surrogate_record"
    },
    {
      "source_surrogate_item_id": "surrogate-v44p1-sources-transfer-to-nara",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/sources",
      "document_number": "Sources",
      "unit_scope": "front matter",
      "surrogate_type": "source_list_transfer",
      "approved_phrase": "These files have been transferred or will be transferred to the National Archives and Records Administration in College Park, Maryland",
      "repository_or_source_family": "Department of State Central Foreign Policy File and lot files transfer context",
      "surrogate_identifier": "transfer-to-NARA status",
      "release_or_access_basis": "published source-list transfer statement",
      "source_image_or_copy_status": "transfer status is not a document-level source-image claim",
      "archival_path_or_url": "National Archives and Records Administration in College Park, Maryland",
      "publication_or_attachment_status": "source-list transfer context",
      "caveat_or_limitation": "do not treat transfer status as proof of a specific file's current location or release state",
      "source_or_context": "Reagan NSP Part 1 Sources",
      "variant_forms": [
        "transferred or will be transferred to the National Archives and Records Administration",
        "NARA facility in College Park"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
      "verification_status": "verified_published_surrogate_record"
    }
  ]
}
```

## Document Status Lifecycle Registry Context

Use this to check prepared-by, drafted-by, cleared-by, copied-to, sent-for-action, sent-through, stamped/read/signed, copy/version, draft/prior-version, no-minutes/no-record, missing-page, and incomplete-copy language in source notes and annotation. Do not add, remove, or upgrade lifecycle facts unless the target-volume registry or source image proves the exact direct edit.

```json
{
  "schema_version": "frus-document-status-lifecycle-registry-v1",
  "document_status_lifecycle_registry_id": "frus-1981-1992-document-status-lifecycle-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d74"
  ],
  "scope": "Published Reagan/Bush sample records for checking source-note lifecycle facts: prepared/drafted/cleared language, copy/version status, routing and distribution status, stamped/read notations, and no-minutes/no-record caveats. These records prevent the checker from inventing lifecycle language without a target-volume published form or source-image basis.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "document_status_item_id": "lifecycle-v31-d23-prepared-copied",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note 1",
      "status_type": "prepared_by",
      "approved_phrase": "Secret. Prepared by Davis. Copied to Quayle and Sununu.",
      "variant_forms": [
        "Prepared by Davis",
        "Copied to Quayle and Sununu"
      ],
      "source_note_component": "classification, preparation, and distribution",
      "copy_or_version_status": "not specified in the quoted lifecycle phrase",
      "drafting_or_clearance_basis": "Prepared by Davis",
      "routing_or_distribution_status": "Copied to Quayle and Sununu",
      "read_or_approval_status": "not specified in the quoted lifecycle phrase",
      "caveat_or_limitation": "Do not add preparer or copy-distribution facts unless the source note or source image supplies them.",
      "source_or_context": "Bush START I Document 23 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v31-d23-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note 1",
      "status_type": "no_minutes_or_no_record",
      "approved_phrase": "No minutes were found.",
      "variant_forms": [
        "no minutes were found",
        "No minutes were found"
      ],
      "source_note_component": "negative record caveat",
      "copy_or_version_status": "not applicable",
      "drafting_or_clearance_basis": "not applicable",
      "routing_or_distribution_status": "not applicable",
      "read_or_approval_status": "not applicable",
      "caveat_or_limitation": "A no-minutes/no-record statement is a search-status claim and should not be converted into a factual absence without search basis.",
      "source_or_context": "Bush START I Document 23 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v31-d24-action-through-seen",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d24",
      "document_number": "24",
      "unit_scope": "source note 1",
      "status_type": "sent_for_action",
      "approved_phrase": "Secret. Sent for action. Sent through Kanter. A stamped notation indicates Gates saw the memorandum.",
      "variant_forms": [
        "Sent for action",
        "Sent through Kanter",
        "A stamped notation indicates Gates saw the memorandum"
      ],
      "source_note_component": "classification, routing, and stamped/read notation",
      "copy_or_version_status": "not specified in the quoted lifecycle phrase",
      "drafting_or_clearance_basis": "not specified in the quoted lifecycle phrase",
      "routing_or_distribution_status": "Sent for action; sent through Kanter",
      "read_or_approval_status": "A stamped notation indicates Gates saw the memorandum",
      "caveat_or_limitation": "Do not infer that a principal approved a memorandum from a saw/stamped notation.",
      "source_or_context": "Bush START I Document 24 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
      "verification_status": "verified_published_lifecycle_record"
    }
  ],
  "records": [
    {
      "document_status_item_id": "lifecycle-v31-d23-prepared-copied",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note 1",
      "status_type": "prepared_by",
      "approved_phrase": "Secret. Prepared by Davis. Copied to Quayle and Sununu.",
      "variant_forms": [
        "Prepared by Davis",
        "Copied to Quayle and Sununu"
      ],
      "source_note_component": "classification, preparation, and distribution",
      "copy_or_version_status": "not specified in the quoted lifecycle phrase",
      "drafting_or_clearance_basis": "Prepared by Davis",
      "routing_or_distribution_status": "Copied to Quayle and Sununu",
      "read_or_approval_status": "not specified in the quoted lifecycle phrase",
      "caveat_or_limitation": "Do not add preparer or copy-distribution facts unless the source note or source image supplies them.",
      "source_or_context": "Bush START I Document 23 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v31-d23-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note 1",
      "status_type": "no_minutes_or_no_record",
      "approved_phrase": "No minutes were found.",
      "variant_forms": [
        "no minutes were found",
        "No minutes were found"
      ],
      "source_note_component": "negative record caveat",
      "copy_or_version_status": "not applicable",
      "drafting_or_clearance_basis": "not applicable",
      "routing_or_distribution_status": "not applicable",
      "read_or_approval_status": "not applicable",
      "caveat_or_limitation": "A no-minutes/no-record statement is a search-status claim and should not be converted into a factual absence without search basis.",
      "source_or_context": "Bush START I Document 23 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v31-d24-action-through-seen",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d24",
      "document_number": "24",
      "unit_scope": "source note 1",
      "status_type": "sent_for_action",
      "approved_phrase": "Secret. Sent for action. Sent through Kanter. A stamped notation indicates Gates saw the memorandum.",
      "variant_forms": [
        "Sent for action",
        "Sent through Kanter",
        "A stamped notation indicates Gates saw the memorandum"
      ],
      "source_note_component": "classification, routing, and stamped/read notation",
      "copy_or_version_status": "not specified in the quoted lifecycle phrase",
      "drafting_or_clearance_basis": "not specified in the quoted lifecycle phrase",
      "routing_or_distribution_status": "Sent for action; sent through Kanter",
      "read_or_approval_status": "A stamped notation indicates Gates saw the memorandum",
      "caveat_or_limitation": "Do not infer that a principal approved a memorandum from a saw/stamped notation.",
      "source_or_context": "Bush START I Document 24 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v01-d74-uninitialed-drafted-cleared",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d74",
      "document_number": "74",
      "unit_scope": "source note 1",
      "status_type": "drafted_and_cleared",
      "approved_phrase": "Printed from an uninitialed copy. Drafted by Kaplan and Libby on December 15 and cleared by Wolfowitz.",
      "variant_forms": [
        "Printed from an uninitialed copy",
        "Drafted by Kaplan and Libby on December 15",
        "cleared by Wolfowitz"
      ],
      "source_note_component": "copy status, drafting, and clearance",
      "copy_or_version_status": "Printed from an uninitialed copy",
      "drafting_or_clearance_basis": "Drafted by Kaplan and Libby on December 15 and cleared by Wolfowitz",
      "routing_or_distribution_status": "not specified in the quoted lifecycle phrase",
      "read_or_approval_status": "not specified in the quoted lifecycle phrase",
      "caveat_or_limitation": "Do not drop uninitialed-copy status when adding drafting and clearance information.",
      "source_or_context": "Reagan Foundations Document 74 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d74",
      "verification_status": "verified_published_lifecycle_record"
    },
    {
      "document_status_item_id": "lifecycle-v01-d74-prior-draft",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d74",
      "document_number": "74",
      "unit_scope": "source note 1",
      "status_type": "draft_or_prior_version",
      "approved_phrase": "A November draft of the memorandum, with Haig's handwritten comments, is in the Department of State, Executive Secretariat, S/P Files",
      "variant_forms": [
        "A November draft of the memorandum",
        "with Haig's handwritten comments"
      ],
      "source_note_component": "prior draft and handwritten-comments location",
      "copy_or_version_status": "November draft",
      "drafting_or_clearance_basis": "prior draft with Haig handwritten comments",
      "routing_or_distribution_status": "not specified in the quoted lifecycle phrase",
      "read_or_approval_status": "handwritten comments by Haig",
      "caveat_or_limitation": "Do not merge a prior draft with the printed copy; preserve the separate draft/version relationship.",
      "source_or_context": "Reagan Foundations Document 74 source note",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d74",
      "verification_status": "verified_published_lifecycle_record"
    }
  ]
}
```

## Document Metadata Registry Context

```json
{
  "schema_version": "frus-document-metadata-registry-v1",
  "document_metadata_registry_id": "frus-1981-1992-document-metadata-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d6",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d294"
  ],
  "scope": "Sample document-metadata registry for validating headings, document numbers, date lines, subjects, attachment headings, and editorial-note forms in Reagan and George H.W. Bush FRUS annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "document_metadata_id": "metadata-v31-d1-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "document_type": "memorandum",
      "approved_heading_form": "Memorandum From the Vice President's Assistant for National Security Affairs (Gregg) and the Vice President's Deputy Assistant for National Security Affairs (Watson) to Vice President Bush",
      "variant_forms": [
        "Memo from Gregg and Watson to Bush",
        "Memorandum to Vice President Bush"
      ],
      "date_line": "Washington, March 18, 1988",
      "subject_or_title": "START: Much Tougher than INF",
      "sender_or_originator": "Gregg and Watson",
      "recipient_or_audience": "Vice President Bush",
      "attachment_behavior": "Includes a printed attachment headed Letter From the Chairman of the President's Intelligence Advisory Board (Armstrong) to President Reagan.",
      "source_note_basis": "First source note begins with George H.W. Bush Library, Bush Vice Presidential Records.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v31-d1-attachment",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "document_type": "attachment",
      "approved_heading_form": "Letter From the Chairman of the President's Intelligence Advisory Board (Armstrong) to President Reagan",
      "variant_forms": [
        "Letter from Armstrong to President Reagan",
        "Attachment: Armstrong letter to Reagan"
      ],
      "date_line": "Washington, February 5, 1988",
      "subject_or_title": "",
      "sender_or_originator": "Armstrong",
      "recipient_or_audience": "President Reagan",
      "attachment_behavior": "Attachment nested under Document 1.",
      "source_note_basis": "Attachment carries separate classification note but shares the parent document apparatus.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v31-d6-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d6",
      "document_number": "6",
      "document_type": "information_memorandum",
      "approved_heading_form": "Information Memorandum From the Director of the Policy Planning Staff (Ross) to Secretary of State Baker",
      "variant_forms": [
        "Information memorandum from Ross to Baker",
        "Memo from Ross to Secretary Baker"
      ],
      "date_line": "Washington, February 8, 1989",
      "subject_or_title": "Arms Control Memos from PM and Paul Nitze",
      "sender_or_originator": "Ross",
      "recipient_or_audience": "Secretary of State Baker",
      "attachment_behavior": "Contains multiple attachment/tab headings, including Holmes and Nitze information memoranda and Department of State papers.",
      "source_note_basis": "First source note supplies Department of State source-path evidence.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d6",
      "verification_status": "verified_published_document"
    }
  ],
  "records": [
    {
      "document_metadata_id": "metadata-v31-d1-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "document_type": "memorandum",
      "approved_heading_form": "Memorandum From the Vice President's Assistant for National Security Affairs (Gregg) and the Vice President's Deputy Assistant for National Security Affairs (Watson) to Vice President Bush",
      "variant_forms": [
        "Memo from Gregg and Watson to Bush",
        "Memorandum to Vice President Bush"
      ],
      "date_line": "Washington, March 18, 1988",
      "subject_or_title": "START: Much Tougher than INF",
      "sender_or_originator": "Gregg and Watson",
      "recipient_or_audience": "Vice President Bush",
      "attachment_behavior": "Includes a printed attachment headed Letter From the Chairman of the President's Intelligence Advisory Board (Armstrong) to President Reagan.",
      "source_note_basis": "First source note begins with George H.W. Bush Library, Bush Vice Presidential Records.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v31-d1-attachment",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "document_type": "attachment",
      "approved_heading_form": "Letter From the Chairman of the President's Intelligence Advisory Board (Armstrong) to President Reagan",
      "variant_forms": [
        "Letter from Armstrong to President Reagan",
        "Attachment: Armstrong letter to Reagan"
      ],
      "date_line": "Washington, February 5, 1988",
      "subject_or_title": "",
      "sender_or_originator": "Armstrong",
      "recipient_or_audience": "President Reagan",
      "attachment_behavior": "Attachment nested under Document 1.",
      "source_note_basis": "Attachment carries separate classification note but shares the parent document apparatus.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v31-d6-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d6",
      "document_number": "6",
      "document_type": "information_memorandum",
      "approved_heading_form": "Information Memorandum From the Director of the Policy Planning Staff (Ross) to Secretary of State Baker",
      "variant_forms": [
        "Information memorandum from Ross to Baker",
        "Memo from Ross to Secretary Baker"
      ],
      "date_line": "Washington, February 8, 1989",
      "subject_or_title": "Arms Control Memos from PM and Paul Nitze",
      "sender_or_originator": "Ross",
      "recipient_or_audience": "Secretary of State Baker",
      "attachment_behavior": "Contains multiple attachment/tab headings, including Holmes and Nitze information memoranda and Department of State papers.",
      "source_note_basis": "First source note supplies Department of State source-path evidence.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d6",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v44p1-d1-main",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d1",
      "document_number": "1",
      "document_type": "memorandum",
      "approved_heading_form": "Memorandum From Donald Fortier of the National Security Council Staff to the President's Assistant for National Security Affairs (McFarlane)",
      "variant_forms": [
        "Memo from Fortier to McFarlane",
        "Memorandum from Donald Fortier to McFarlane"
      ],
      "date_line": "Washington, November 14, 1984",
      "subject_or_title": "The MX--Your Meeting with the President and Secretary Shultz, Wednesday, November 14, 1984",
      "sender_or_originator": "Fortier",
      "recipient_or_audience": "McFarlane",
      "attachment_behavior": "No printed attachment heading in the published document.",
      "source_note_basis": "First source note begins with Reagan Library, John Poindexter Files.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
      "verification_status": "verified_published_document"
    },
    {
      "document_metadata_id": "metadata-v44p1-d294-editorial-note",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d294",
      "document_number": "294",
      "document_type": "editorial_note",
      "approved_heading_form": "Editorial Note",
      "variant_forms": [
        "Editorial note",
        "Editor note"
      ],
      "date_line": "",
      "subject_or_title": "Krasnoyarsk Radar and transition briefing context",
      "sender_or_originator": "Office of the Historian",
      "recipient_or_audience": "Readers",
      "attachment_behavior": "Editorial note synthesizes cited records rather than printing a single transcribed document.",
      "source_note_basis": "Citations appear in the editorial-note text rather than as a first-footnote source note.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d294",
      "verification_status": "verified_published_document"
    }
  ]
}
```

## Classification And Handling Registry Context

Use this to check original classification markings, handling controls, and verified absence-of-marking phrases. Do not confuse original markings with later release, redaction, or declassification status. Treat cross-volume or variant classification forms as comment-only unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-classification-registry-v1",
  "classification_registry_id": "frus-1981-1992-classification-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d75"
  ],
  "scope": "Sample classification and handling registry for validating original classification markings, handling controls, and verified absence-of-marking language in Reagan and George H.W. Bush FRUS annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "classification_item_id": "classification-v31-d1-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "source_note",
      "approved_marking": "Top Secret; Sensitive; Eyes Only",
      "marking_components": [
        "Top Secret"
      ],
      "handling_controls": [
        "Sensitive",
        "Eyes Only"
      ],
      "variant_forms": [
        "Top Secret/Sensitive/Eyes Only"
      ],
      "direct_edit_safe_variants": [],
      "source_note_basis": "First source note supplies the parent memorandum's original classification and handling controls.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v31-d1-attachment",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "attachment_note",
      "approved_marking": "Top Secret",
      "marking_components": [
        "Top Secret"
      ],
      "handling_controls": [],
      "variant_forms": [],
      "direct_edit_safe_variants": [],
      "source_note_basis": "Footnote 3 supplies the printed attachment's separate classification marking.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v31-d73-none",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "source_note",
      "approved_marking": "No classification marking",
      "marking_components": [],
      "handling_controls": [],
      "variant_forms": [
        "No Classification Marking"
      ],
      "direct_edit_safe_variants": [
        "No classification"
      ],
      "source_note_basis": "The published source note uses absence-of-marking language, not a release-status statement.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_classification"
    }
  ],
  "records": [
    {
      "classification_item_id": "classification-v31-d1-main",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "source_note",
      "approved_marking": "Top Secret; Sensitive; Eyes Only",
      "marking_components": [
        "Top Secret"
      ],
      "handling_controls": [
        "Sensitive",
        "Eyes Only"
      ],
      "variant_forms": [
        "Top Secret/Sensitive/Eyes Only"
      ],
      "direct_edit_safe_variants": [],
      "source_note_basis": "First source note supplies the parent memorandum's original classification and handling controls.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v31-d1-attachment",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "attachment_note",
      "approved_marking": "Top Secret",
      "marking_components": [
        "Top Secret"
      ],
      "handling_controls": [],
      "variant_forms": [],
      "direct_edit_safe_variants": [],
      "source_note_basis": "Footnote 3 supplies the printed attachment's separate classification marking.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v31-d73-none",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "source_note",
      "approved_marking": "No classification marking",
      "marking_components": [],
      "handling_controls": [],
      "variant_forms": [
        "No Classification Marking"
      ],
      "direct_edit_safe_variants": [
        "No classification"
      ],
      "source_note_basis": "The published source note uses absence-of-marking language, not a release-status statement.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v44p1-d1-main",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d1",
      "document_number": "1",
      "unit_scope": "source_note",
      "approved_marking": "Secret",
      "marking_components": [
        "Secret"
      ],
      "handling_controls": [],
      "variant_forms": [],
      "direct_edit_safe_variants": [],
      "source_note_basis": "The published source note supplies `Secret.` followed by routing status `Sent for information.`",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
      "verification_status": "verified_published_classification"
    },
    {
      "classification_item_id": "classification-v01-d75-main",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d75",
      "document_number": "75",
      "unit_scope": "source_note",
      "approved_marking": "Secret; Eyes Only; Not for the System",
      "marking_components": [
        "Secret"
      ],
      "handling_controls": [
        "Eyes Only",
        "Not for the System"
      ],
      "variant_forms": [
        "Secret/Eyes Only/Not for the System",
        "Secret; Eyes Only; Not in the System"
      ],
      "direct_edit_safe_variants": [],
      "source_note_basis": "The Haig Papers source note preserves both the classification level and special handling controls.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d75",
      "verification_status": "verified_published_classification"
    }
  ]
}
```

## Declassification And Omission Registry Context

Use this to check bracketed omission quantities, pages not declassified, handling-restriction-not-declassified phrases, whole-document withholdings, and About the Series review-statistics language. Do not change omission quantities, bracket wording, page counts, or review statistics unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-declassification-registry-v1",
  "declassification_registry_id": "frus-1981-1992-declassification-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d93",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d449",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d172"
  ],
  "scope": "Sample declassification and omission registry for checking FRUS bracketed omissions, handling-restriction-not-declassified phrases, pages-not-declassified source brackets, whole-document withholding, and volume-level declassification-review statistics in Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "declassification_id": "declass-v31-d172-less-than-2-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "inline_line_omission",
      "approved_phrase": "[less than 2 lines not declassified]",
      "quantity": "less than 2",
      "quantity_unit": "lines",
      "review_outcome": "minor_excised_text_not_declassified",
      "source_or_context": "Document 172 text, data-denial discussion",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record",
      "variant_forms": [
        "[less than two lines not declassified]",
        "less than 2 lines not declassified"
      ]
    },
    {
      "declassification_id": "declass-v31-d172-two-half-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "inline_fractional_line_omission",
      "approved_phrase": "[2½ lines not declassified]",
      "quantity": "2½",
      "quantity_unit": "lines",
      "review_outcome": "minor_excised_text_not_declassified",
      "source_or_context": "Document 172 text, power-levels paragraph",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record",
      "variant_forms": [
        "[2 1/2 lines not declassified]",
        "2½ lines not declassified"
      ]
    },
    {
      "declassification_id": "declass-v31-d172-3-paragraphs-19-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "paragraph_omission",
      "approved_phrase": "[3 paragraphs (19 lines) not declassified]",
      "quantity": "3",
      "quantity_unit": "paragraphs (19 lines)",
      "review_outcome": "paragraph_or_more_excised_text_not_declassified",
      "source_or_context": "Document 172 text, data-exchange discussion",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record",
      "variant_forms": [
        "[three paragraphs (19 lines) not declassified]",
        "3 paragraphs 19 lines not declassified"
      ]
    },
    {
      "declassification_id": "declass-v31-d172-tab1-6-pages",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "source_bracket",
      "declassification_type": "source_bracket_pages_not_declassified",
      "approved_phrase": "[Source: George H.W. Bush Library, Bush Presidential Records, National Security Council, John A. Gordon Files, Subject Files, OA/ID CF01033-006, START-December 1990. Secret; [handling restriction not declassified]. 6 pages not declassified.]",
      "quantity": "6",
      "quantity_unit": "pages",
      "review_outcome": "source_bracket_pages_not_declassified",
      "source_or_context": "Document 172 Tab 1, Paper Prepared in the Central Intelligence Agency",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record",
      "variant_forms": [
        "Secret; [handling restriction not declassified]. 6 pages not declassified.",
        "6 pages not declassified"
      ]
    },
    {
      "declassification_id": "declass-v31-about-series-review-stats",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/abouttheseries",
      "document_number": "about-the-series",
      "unit_scope": "front_matter",
      "declassification_type": "volume_review_statistics",
      "approved_phrase": "The declassification review of this volume, which began in 2017 and was completed in 2024, resulted in the decision to withhold 1 document in full, excise a paragraph or more in 7 documents, and make minor excisions of less than a paragraph in 26 documents.",
      "quantity": "1 full; 7 paragraph-or-more; 26 minor",
      "quantity_unit": "documents",
      "review_outcome": "volume_declassification_review_statistics",
      "source_or_context": "START I About the Series declassification review paragraph",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
      "verification_status": "verified_published_declassification_record",
      "variant_forms": [
        "withhold 1 document in full, excise a paragraph or more in 7 documents, and make minor excisions of less than a paragraph in 26 documents",
        "began in 2017 and was completed in 2024"
      ]
    }
  ],
  "records": [
    {
      "declassification_id": "declass-v31-d172-less-than-2-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "inline_line_omission",
      "approved_phrase": "[less than 2 lines not declassified]",
      "quantity": "less than 2",
      "quantity_unit": "lines",
      "review_outcome": "minor_excised_text_not_declassified",
      "source_or_context": "Document 172 text, data-denial discussion",
      "variant_forms": [
        "[less than two lines not declassified]",
        "less than 2 lines not declassified"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v31-d172-two-half-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "inline_fractional_line_omission",
      "approved_phrase": "[2½ lines not declassified]",
      "quantity": "2½",
      "quantity_unit": "lines",
      "review_outcome": "minor_excised_text_not_declassified",
      "source_or_context": "Document 172 text, power-levels paragraph",
      "variant_forms": [
        "[2 1/2 lines not declassified]",
        "2½ lines not declassified"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v31-d172-3-paragraphs-19-lines",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "document_text",
      "declassification_type": "paragraph_omission",
      "approved_phrase": "[3 paragraphs (19 lines) not declassified]",
      "quantity": "3",
      "quantity_unit": "paragraphs (19 lines)",
      "review_outcome": "paragraph_or_more_excised_text_not_declassified",
      "source_or_context": "Document 172 text, data-exchange discussion",
      "variant_forms": [
        "[three paragraphs (19 lines) not declassified]",
        "3 paragraphs 19 lines not declassified"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v31-d172-tab1-6-pages",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d172",
      "document_number": "172",
      "unit_scope": "source_bracket",
      "declassification_type": "source_bracket_pages_not_declassified",
      "approved_phrase": "[Source: George H.W. Bush Library, Bush Presidential Records, National Security Council, John A. Gordon Files, Subject Files, OA/ID CF01033-006, START-December 1990. Secret; [handling restriction not declassified]. 6 pages not declassified.]",
      "quantity": "6",
      "quantity_unit": "pages",
      "review_outcome": "source_bracket_pages_not_declassified",
      "source_or_context": "Document 172 Tab 1, Paper Prepared in the Central Intelligence Agency",
      "variant_forms": [
        "Secret; [handling restriction not declassified]. 6 pages not declassified.",
        "6 pages not declassified"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v31-about-series-review-stats",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/abouttheseries",
      "document_number": "about-the-series",
      "unit_scope": "front_matter",
      "declassification_type": "volume_review_statistics",
      "approved_phrase": "The declassification review of this volume, which began in 2017 and was completed in 2024, resulted in the decision to withhold 1 document in full, excise a paragraph or more in 7 documents, and make minor excisions of less than a paragraph in 26 documents.",
      "quantity": "1 full; 7 paragraph-or-more; 26 minor",
      "quantity_unit": "documents",
      "review_outcome": "volume_declassification_review_statistics",
      "source_or_context": "START I About the Series declassification review paragraph",
      "variant_forms": [
        "withhold 1 document in full, excise a paragraph or more in 7 documents, and make minor excisions of less than a paragraph in 26 documents",
        "began in 2017 and was completed in 2024"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v44p1-about-series-review-stats",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/abouttheseries",
      "document_number": "about-the-series",
      "unit_scope": "front_matter",
      "declassification_type": "volume_review_statistics",
      "approved_phrase": "The declassification review of this volume, which began in 2018 and was completed in 2023, resulted in the decision to withhold 2 documents in full, excise a paragraph or more in 14 documents, and make minor excisions of less than a paragraph in 20 documents.",
      "quantity": "2 full; 14 paragraph-or-more; 20 minor",
      "quantity_unit": "documents",
      "review_outcome": "volume_declassification_review_statistics",
      "source_or_context": "National Security Policy, 1985-1988, About the Series declassification review paragraph",
      "variant_forms": [
        "withhold 2 documents in full, excise a paragraph or more in 14 documents, and make minor excisions of less than a paragraph in 20 documents",
        "began in 2018 and was completed in 2023"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v11-d93-2-pages",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d93",
      "document_number": "93",
      "unit_scope": "source_bracket",
      "declassification_type": "whole_document_pages_not_declassified",
      "approved_phrase": "[Source: Reagan Library, Intelligence Files, System II files-INT 8490035-88902478. Secret; Sensitive. Eyes Only. Sent for information. 2 pages not declassified.]",
      "quantity": "2",
      "quantity_unit": "pages",
      "review_outcome": "whole_document_not_declassified",
      "source_or_context": "Reagan START I Document 93 withheld document entry",
      "variant_forms": [
        "2 pages not declassified",
        "Secret; Sensitive. Eyes Only. Sent for information. 2 pages not declassified."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d93",
      "verification_status": "verified_published_declassification_record"
    },
    {
      "declassification_id": "declass-v24-d449-tab-a-2-pages",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d449",
      "document_number": "449",
      "unit_scope": "tab_source_bracket",
      "declassification_type": "source_bracket_pages_not_declassified",
      "approved_phrase": "[Secret; Immediate; [handling restriction not declassified]. 2 pages not declassified.]",
      "quantity": "2",
      "quantity_unit": "pages",
      "review_outcome": "tab_not_declassified",
      "source_or_context": "North Africa Document 449 Tab A telegram",
      "variant_forms": [
        "Secret; Immediate; [handling restriction not declassified]. 2 pages not declassified.",
        "handling restriction not declassified"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d449",
      "verification_status": "verified_published_declassification_record"
    }
  ]
}
```

## Editorial Method And Original Text Registry Context

Use this to protect original document text and published editorial-method apparatus: original brackets and ellipses, original footnotes, underlining, italics, checkmarks, quoted source spelling, capitalization, punctuation, abbreviations, contractions, telegram numbers, SECTO/TOSEC forms, and bracketed additions or corrections. Treat any proposed spellcheck-style edit to transcribed or quoted document text as comment-only unless the source image, official transcript, or target-volume editorial-method registry proves the exact direct edit.

```json
{
  "schema_version": "frus-editorial-method-registry-v1",
  "editorial_method_registry_id": "frus-1981-1992-editorial-method-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d66",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d146"
  ],
  "scope": "Published Reagan/Bush sample records for protecting original text and editorial-method apparatus: original brackets, original footnotes, underlining or checkmarks, and source-quoted spelling that should not be silently modernized by an LLM spellcheck pass.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "editorial_method_id": "method-v31-d2-underlined-if",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d2",
      "document_number": "2",
      "unit_scope": "footnote 3",
      "method_type": "original_underlining",
      "approved_phrase": "Bush underlined \"If\" and placed a checkmark in the left-hand margin beside this sentence.",
      "variant_forms": [
        "Bush underlined If and placed a checkmark",
        "placed a checkmark in the left-hand margin beside this sentence"
      ],
      "protected_text_or_feature": "underlined word and checkmark placement",
      "editorial_method_basis": "published note identifies the exact underlined word and physical mark location",
      "direct_edit_rule": "Do not change underlining/italic or checkmark language unless source-image evidence proves the mark and target text.",
      "source_or_context": "Bush START I Document 2 footnote 3",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v31-d24-brackets-original",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d24",
      "document_number": "24",
      "unit_scope": "footnotes 4 and 5",
      "method_type": "original_brackets",
      "approved_phrase": "Secret. Brackets are in the original.",
      "variant_forms": [
        "Brackets are in the original"
      ],
      "protected_text_or_feature": "source-note classification plus original-bracket status",
      "editorial_method_basis": "published footnotes preserve original-bracket status for printed attachments",
      "direct_edit_rule": "Do not remove or reinterpret bracketed text as editorial insertion when the note says brackets are original.",
      "source_or_context": "Bush START I Document 24 footnotes 4 and 5",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
      "verification_status": "verified_published_editorial_method_record"
    }
  ],
  "records": [
    {
      "editorial_method_id": "method-v31-d2-underlined-if",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d2",
      "document_number": "2",
      "unit_scope": "footnote 3",
      "method_type": "original_underlining",
      "approved_phrase": "Bush underlined \"If\" and placed a checkmark in the left-hand margin beside this sentence.",
      "protected_text_or_feature": "underlined word and checkmark placement",
      "editorial_method_basis": "published note identifies the exact underlined word and physical mark location",
      "direct_edit_rule": "Do not change underlining/italic or checkmark language unless source-image evidence proves the mark and target text.",
      "source_or_context": "Bush START I Document 2 footnote 3",
      "variant_forms": [
        "Bush underlined If and placed a checkmark",
        "placed a checkmark in the left-hand margin beside this sentence"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v31-d24-brackets-original",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d24",
      "document_number": "24",
      "unit_scope": "footnotes 4 and 5",
      "method_type": "original_brackets",
      "approved_phrase": "Secret. Brackets are in the original.",
      "protected_text_or_feature": "source-note classification plus original-bracket status",
      "editorial_method_basis": "published footnotes preserve original-bracket status for printed attachments",
      "direct_edit_rule": "Do not remove or reinterpret bracketed text as editorial insertion when the note says brackets are original.",
      "source_or_context": "Bush START I Document 24 footnotes 4 and 5",
      "variant_forms": [
        "Brackets are in the original"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v01-d66-all-brackets-original",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d66",
      "document_number": "66",
      "unit_scope": "source note 1",
      "method_type": "original_brackets",
      "approved_phrase": "Source: Public Papers: Reagan, 1981, pp. 937-944. All brackets are in the original.",
      "protected_text_or_feature": "all printed brackets in selected public remarks",
      "editorial_method_basis": "published source note identifies bracket status before adding transmission and diary context",
      "direct_edit_rule": "Do not treat bracketed public-remarks text as FRUS editorial insertion unless the source note or source image says so.",
      "source_or_context": "Reagan Foundations Document 66 source note",
      "variant_forms": [
        "Public Papers: Reagan, 1981, pp. 937-944. All brackets are in the original"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d66",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v01-d146-brackets-original",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d146",
      "document_number": "146",
      "unit_scope": "source note 1",
      "method_type": "original_brackets",
      "approved_phrase": "Source: Public Papers: Reagan, 1983, Book I, pp. 479-484. All brackets are in the original.",
      "protected_text_or_feature": "bracketed stage directions in selected public remarks",
      "editorial_method_basis": "published source note protects bracketed material such as laughter markers in public remarks",
      "direct_edit_rule": "Do not delete or rewrite bracketed public-remarks text without official transcript or source-image basis.",
      "source_or_context": "Reagan Foundations Document 146 source note",
      "variant_forms": [
        "Public Papers: Reagan, 1983, Book I, pp. 479-484. All brackets are in the original"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v01-d146-footnote-original",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d146",
      "document_number": "146",
      "unit_scope": "footnote 2",
      "method_type": "footnote_in_original",
      "approved_phrase": "Henry Singleton, president of the Los Angeles World Affairs Council. [Footnote is in the original.]",
      "protected_text_or_feature": "original-publication footnote status",
      "editorial_method_basis": "published note distinguishes original footnote content from FRUS-added annotation",
      "direct_edit_rule": "Do not remove original-footnote status or recast it as a FRUS editorial note without source basis.",
      "source_or_context": "Reagan Foundations Document 146 footnote 2",
      "variant_forms": [
        "[Footnote is in the original.]",
        "Footnote is in the original"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
      "verification_status": "verified_published_editorial_method_record"
    },
    {
      "editorial_method_id": "method-v01-d66-diary-dont",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d66",
      "document_number": "66",
      "unit_scope": "source note 1",
      "method_type": "document_text_integrity",
      "approved_phrase": "seems they dont like nuclear weapons",
      "protected_text_or_feature": "source-quoted diary spelling/contraction",
      "editorial_method_basis": "published source note quotes Reagan diary wording; do not silently modernize contractions in quoted source text",
      "direct_edit_rule": "Treat spelling, contractions, capitalization, and punctuation in quoted source text as comment-only unless the source image or official source proves a correction.",
      "source_or_context": "Reagan Foundations Document 66 source note diary quotation",
      "variant_forms": [
        "seems they don't like nuclear weapons"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d66",
      "verification_status": "verified_published_editorial_method_record"
    }
  ]
}
```

## Translation And Foreign-Origin Registry Context

Use this to check official, unofficial, informal, Language Services, editor-transcribed, original-language, foreign-copy, and foreign-text-in-file apparatus. Do not simplify translation status, original-language basis, foreign-copy provenance, or selected-versus-supplemental foreign-origin records unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-translation-foreign-origin-registry-v1",
  "translation_registry_id": "frus-1981-1992-translation-foreign-origin-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d49",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d91",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/d30",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/d159",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/d275"
  ],
  "scope": "Published FRUS translation, foreign-origin, and original-language apparatus patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "translation_id": "translation-v31-d49-typed-unofficial",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d49",
      "document_number": "49",
      "unit_scope": "source_note",
      "translation_type": "typed_notation_unofficial_translation",
      "approved_phrase": "A typed notation at the top of the letter reads “Unofficial translation.”",
      "language_or_origin": "Soviet/Russian original or copy basis not printed in source note",
      "translation_status": "unofficial_translation_marked_on_source",
      "source_or_context": "Gorbachev letter delivered by Shevardnadze; source note preserves typed notation at top of letter.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d49",
      "verification_status": "verified_published_translation_record",
      "variant_forms": [
        "A typed notation at the top of the letter reads \"Unofficial translation.\"",
        "typed notation: “Unofficial translation.”"
      ]
    },
    {
      "translation_id": "translation-v31-d91-printed-copy-unofficial",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d91",
      "document_number": "91",
      "unit_scope": "source_note",
      "translation_type": "printed_from_unofficial_translation_copy",
      "approved_phrase": "Printed from a copy marked: “Unofficial translation.”",
      "language_or_origin": "Soviet/Russian original or copy basis not printed in source note",
      "translation_status": "printed_from_copy_marked_unofficial_translation",
      "source_or_context": "Gorbachev letter source note states the printed copy was marked unofficial translation.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d91",
      "verification_status": "verified_published_translation_record",
      "variant_forms": [
        "Printed from a copy marked \"Unofficial translation.\"",
        "Printed from a copy marked unofficial translation."
      ]
    },
    {
      "translation_id": "translation-v31-d222-russian-text-ibid",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d222",
      "document_number": "222",
      "unit_scope": "attachment_footnote",
      "translation_type": "foreign_text_retained_in_same_file",
      "approved_phrase": "The Russian text of the paper is ibid.",
      "language_or_origin": "Russian text",
      "translation_status": "foreign_original_text_in_same_file",
      "source_or_context": "Attachment note for a Soviet MFA paper states the Russian text is in the same source file.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
      "verification_status": "verified_published_translation_record",
      "variant_forms": [
        "Russian text of the paper is ibid.",
        "The Russian text is ibid."
      ]
    }
  ],
  "records": [
    {
      "translation_id": "translation-v31-d49-typed-unofficial",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d49",
      "document_number": "49",
      "unit_scope": "source_note",
      "translation_type": "typed_notation_unofficial_translation",
      "approved_phrase": "A typed notation at the top of the letter reads “Unofficial translation.”",
      "language_or_origin": "Soviet/Russian original or copy basis not printed in source note",
      "translation_status": "unofficial_translation_marked_on_source",
      "source_or_context": "Gorbachev letter delivered by Shevardnadze; source note preserves typed notation at top of letter.",
      "variant_forms": [
        "A typed notation at the top of the letter reads \"Unofficial translation.\"",
        "typed notation: “Unofficial translation.”"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d49",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v31-d91-printed-copy-unofficial",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d91",
      "document_number": "91",
      "unit_scope": "source_note",
      "translation_type": "printed_from_unofficial_translation_copy",
      "approved_phrase": "Printed from a copy marked: “Unofficial translation.”",
      "language_or_origin": "Soviet/Russian original or copy basis not printed in source note",
      "translation_status": "printed_from_copy_marked_unofficial_translation",
      "source_or_context": "Gorbachev letter source note states the printed copy was marked unofficial translation.",
      "variant_forms": [
        "Printed from a copy marked \"Unofficial translation.\"",
        "Printed from a copy marked unofficial translation."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d91",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v31-d222-russian-text-ibid",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d222",
      "document_number": "222",
      "unit_scope": "attachment_footnote",
      "translation_type": "foreign_text_retained_in_same_file",
      "approved_phrase": "The Russian text of the paper is ibid.",
      "language_or_origin": "Russian text",
      "translation_status": "foreign_original_text_in_same_file",
      "source_or_context": "Attachment note for a Soviet MFA paper states the Russian text is in the same source file.",
      "variant_forms": [
        "Russian text of the paper is ibid.",
        "The Russian text is ibid."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v13-d159-printed-unofficial",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d159",
      "document_number": "159",
      "unit_scope": "source_note",
      "translation_type": "printed_from_unofficial_translation",
      "approved_phrase": "Printed from an unofficial translation.",
      "language_or_origin": "Spanish original",
      "translation_status": "printed_from_unofficial_translation",
      "source_or_context": "Costa Mendez letter source note says it was printed from an unofficial translation.",
      "variant_forms": [
        "printed from an unofficial translation"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d159",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v13-d159-original-spanish-signed",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d159",
      "document_number": "159",
      "unit_scope": "follow_on_footnote",
      "translation_type": "translation_indicates_original_signed",
      "approved_phrase": "The translation indicates that Costa Méndez signed the original Spanish text.",
      "language_or_origin": "Spanish original",
      "translation_status": "translation_indicates_original_signature",
      "source_or_context": "Follow-on footnote preserves the translation's indication about the signed original Spanish text.",
      "variant_forms": [
        "The translation indicates that Costa Mendez signed the original Spanish text."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d159",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v13-d275-un-secretariat-heading",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d275",
      "document_number": "275",
      "unit_scope": "attachment_heading",
      "translation_type": "un_secretariat_unofficial_translation_heading",
      "approved_phrase": "Unofficial Translation Prepared in the United Nations Secretariat",
      "language_or_origin": "Argentine paper translated by UN Secretariat",
      "translation_status": "un_secretariat_unofficial_translation",
      "source_or_context": "Attachment heading identifies the United Nations Secretariat as the source of the unofficial translation.",
      "variant_forms": [
        "UN Secretariat’s unofficial translation",
        "UN Secretariat's unofficial translation"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d275",
      "verification_status": "verified_published_translation_record"
    },
    {
      "translation_id": "translation-v13-d30-informal-translation-transmitted",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d30",
      "document_number": "30",
      "unit_scope": "follow_on_footnote",
      "translation_type": "informal_translation_transmitted",
      "approved_phrase": "an informal translation of which Shlaudeman transmitted to the Department in telegram 1908 from Buenos Aires, April 1.",
      "language_or_origin": "Argentine written follow-up",
      "translation_status": "informal_translation_transmitted_by_embassy",
      "source_or_context": "Follow-on annotation preserves informal translation transmission path and telegram number.",
      "variant_forms": [
        "informal translation transmitted to the Department"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d30",
      "verification_status": "verified_published_translation_record"
    }
  ]
}
```

## Printed And Nested Attachment Registry Context

Use this to check printed-in-parent child papers, attached-but-not-printed details, printed-as-document targets, tab/enclosure labels, child headings, child date/place lines, child source notes, child classification markings, and parent-child maps. Do not change printed targets, child apparatus, tab labels, or attached/not-printed status unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-printed-attachment-registry-v1",
  "printed_attachment_registry_id": "frus-1981-1992-printed-nested-attachments-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d181",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d276",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d277"
  ],
  "scope": "Published FRUS printed-in-parent, printed-elsewhere, attached-but-not-printed, and child-apparatus patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "printed_attachment_id": "printed-attachment-v31-d222-soviet-mfa-paper",
      "volume_id": "frus1989-92v31",
      "parent_document_id": "frus1989-92v31/d222",
      "parent_document_number": "222",
      "child_unit_label": "Attachment",
      "relationship_type": "printed_nested_attachment",
      "approved_phrase": "Paper Prepared in the Soviet Ministry of Foreign Affairs",
      "tab_or_attachment_label": "Attachment",
      "child_heading": "Paper Prepared in the Soviet Ministry of Foreign Affairs",
      "child_date_or_place": "Moscow, undated",
      "child_title_or_subject": "oral message context",
      "child_source_note_or_footnote": "Secret; unknown-hand note; Scowcroft saw stamp; Russian text in same file",
      "child_classification_or_marking": "Secret",
      "editorial_status": "printed_in_parent",
      "printed_target": "Document 222",
      "cross_reference_target": "",
      "source_or_context": "Foreign paper printed as an attachment inside Document 222 with its own heading, place/date line, and child footnote.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
      "verification_status": "verified_published_printed_attachment_record",
      "variant_forms": [
        "Attachment. Paper Prepared in the Soviet Ministry of Foreign Affairs",
        "Paper prepared in the Soviet Ministry of Foreign Affairs"
      ]
    },
    {
      "printed_attachment_id": "printed-attachment-v31-d1-grip-papers",
      "volume_id": "frus1989-92v31",
      "parent_document_id": "frus1989-92v31/d1",
      "parent_document_number": "1",
      "child_unit_label": "attached papers",
      "relationship_type": "attached_but_not_printed",
      "approved_phrase": "Attached but not printed are two papers drafted by the Arms Control Support Group: GRIP 34 H (Mobile ICBM s), dated March 12, 1988; and GRIP 59A (Suspect Site Inspections), dated March 7, 1988.",
      "tab_or_attachment_label": "",
      "child_heading": "",
      "child_date_or_place": "March 12, 1988; March 7, 1988",
      "child_title_or_subject": "GRIP 34 H (Mobile ICBMs); GRIP 59A (Suspect Site Inspections)",
      "child_source_note_or_footnote": "Attached but not printed.",
      "child_classification_or_marking": "",
      "editorial_status": "attached_not_printed",
      "printed_target": "",
      "cross_reference_target": "",
      "source_or_context": "Document 1 footnote identifies two attached but unprinted GRIP papers by drafter, title, and date.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_printed_attachment_record",
      "variant_forms": [
        "Attached but not printed are two papers drafted by the Arms Control Support Group",
        "GRIP 34 H (Mobile ICBMs); GRIP 59A (Suspect Site Inspections)"
      ]
    }
  ],
  "records": [
    {
      "printed_attachment_id": "printed-attachment-v31-d222-soviet-mfa-paper",
      "volume_id": "frus1989-92v31",
      "parent_document_id": "frus1989-92v31/d222",
      "parent_document_number": "222",
      "child_unit_label": "Attachment",
      "relationship_type": "printed_nested_attachment",
      "approved_phrase": "Paper Prepared in the Soviet Ministry of Foreign Affairs",
      "tab_or_attachment_label": "Attachment",
      "child_heading": "Paper Prepared in the Soviet Ministry of Foreign Affairs",
      "child_date_or_place": "Moscow, undated",
      "child_title_or_subject": "oral message context",
      "child_source_note_or_footnote": "Secret; unknown-hand note; Scowcroft saw stamp; Russian text in same file",
      "child_classification_or_marking": "Secret",
      "editorial_status": "printed_in_parent",
      "printed_target": "Document 222",
      "cross_reference_target": "",
      "source_or_context": "Foreign paper printed as an attachment inside Document 222 with its own heading, place/date line, and child footnote.",
      "variant_forms": [
        "Attachment. Paper Prepared in the Soviet Ministry of Foreign Affairs",
        "Paper prepared in the Soviet Ministry of Foreign Affairs"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d222",
      "verification_status": "verified_published_printed_attachment_record"
    },
    {
      "printed_attachment_id": "printed-attachment-v31-d1-grip-papers",
      "volume_id": "frus1989-92v31",
      "parent_document_id": "frus1989-92v31/d1",
      "parent_document_number": "1",
      "child_unit_label": "attached papers",
      "relationship_type": "attached_but_not_printed",
      "approved_phrase": "Attached but not printed are two papers drafted by the Arms Control Support Group: GRIP 34 H (Mobile ICBM s), dated March 12, 1988; and GRIP 59A (Suspect Site Inspections), dated March 7, 1988.",
      "tab_or_attachment_label": "",
      "child_heading": "",
      "child_date_or_place": "March 12, 1988; March 7, 1988",
      "child_title_or_subject": "GRIP 34 H (Mobile ICBMs); GRIP 59A (Suspect Site Inspections)",
      "child_source_note_or_footnote": "Attached but not printed.",
      "child_classification_or_marking": "",
      "editorial_status": "attached_not_printed",
      "printed_target": "",
      "cross_reference_target": "",
      "source_or_context": "Document 1 footnote identifies two attached but unprinted GRIP papers by drafter, title, and date.",
      "variant_forms": [
        "Attached but not printed are two papers drafted by the Arms Control Support Group",
        "GRIP 34 H (Mobile ICBMs); GRIP 59A (Suspect Site Inspections)"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_printed_attachment_record"
    },
    {
      "printed_attachment_id": "printed-attachment-v11-d181-overall-instructions",
      "volume_id": "frus1981-88v11",
      "parent_document_id": "frus1981-88v11/d181",
      "parent_document_number": "181",
      "child_unit_label": "Attachment",
      "relationship_type": "printed_nested_attachment",
      "approved_phrase": "Overall Instructions—Round VII",
      "tab_or_attachment_label": "Tab A",
      "child_heading": "Paper Prepared in the National Security Council",
      "child_date_or_place": "Washington, undated",
      "child_title_or_subject": "Overall Instructions—Round VII",
      "child_source_note_or_footnote": "Secret. Prepared by Brooks.",
      "child_classification_or_marking": "Secret",
      "editorial_status": "printed_in_parent",
      "printed_target": "Document 181",
      "cross_reference_target": "",
      "source_or_context": "Document 181 prints nested NSC negotiating instructions as attachments with child headings and footnotes.",
      "variant_forms": [
        "Overall Instructions-Round VII",
        "Overall Instructions--Round VII"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d181",
      "verification_status": "verified_published_printed_attachment_record"
    },
    {
      "printed_attachment_id": "printed-attachment-v11-d181-start-instructions",
      "volume_id": "frus1981-88v11",
      "parent_document_id": "frus1981-88v11/d181",
      "parent_document_number": "181",
      "child_unit_label": "Attachment",
      "relationship_type": "printed_nested_attachment",
      "approved_phrase": "START Instructions—Round VII",
      "tab_or_attachment_label": "Tab C",
      "child_heading": "Paper Prepared in the National Security Council",
      "child_date_or_place": "Washington, undated",
      "child_title_or_subject": "START Instructions—Round VII",
      "child_source_note_or_footnote": "Secret. Prepared by Brooks.",
      "child_classification_or_marking": "Secret",
      "editorial_status": "printed_in_parent",
      "printed_target": "Document 181",
      "cross_reference_target": "",
      "source_or_context": "Document 181 prints the START instructions as a child attachment with title, heading, and source note.",
      "variant_forms": [
        "START Instructions-Round VII",
        "START Instructions--Round VII"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d181",
      "verification_status": "verified_published_printed_attachment_record"
    },
    {
      "printed_attachment_id": "printed-attachment-v11-d276-printed-as-277",
      "volume_id": "frus1981-88v11",
      "parent_document_id": "frus1981-88v11/d276",
      "parent_document_number": "276",
      "child_unit_label": "Tab I",
      "relationship_type": "printed_as_document",
      "approved_phrase": "Printed as Document 277.",
      "tab_or_attachment_label": "Tab I",
      "child_heading": "Memorandum From the President’s Assistant for National Security Affairs (Powell) to President Reagan",
      "child_date_or_place": "Washington, February 26, 1988",
      "child_title_or_subject": "START Memorandum of Understanding (MOU)",
      "child_source_note_or_footnote": "Tab I printed separately as Document 277.",
      "child_classification_or_marking": "Secret",
      "editorial_status": "printed_elsewhere",
      "printed_target": "Document 277",
      "cross_reference_target": "frus1981-88v11/d277",
      "source_or_context": "Document 276 footnote points a tab to Document 277, which supplies the printed target heading and source note.",
      "variant_forms": [
        "Printed as Document 277"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d276",
      "verification_status": "verified_published_printed_attachment_record"
    },
    {
      "printed_attachment_id": "printed-attachment-v11-d276-draft-mou",
      "volume_id": "frus1981-88v11",
      "parent_document_id": "frus1981-88v11/d276",
      "parent_document_number": "276",
      "child_unit_label": "draft MOU",
      "relationship_type": "attached_but_not_printed",
      "approved_phrase": "Attached but not printed is the draft MOU.",
      "tab_or_attachment_label": "",
      "child_heading": "",
      "child_date_or_place": "",
      "child_title_or_subject": "draft MOU",
      "child_source_note_or_footnote": "Attached but not printed.",
      "child_classification_or_marking": "",
      "editorial_status": "attached_not_printed",
      "printed_target": "",
      "cross_reference_target": "",
      "source_or_context": "Document 276 footnote identifies the attached but unprinted draft MOU.",
      "variant_forms": [
        "draft MOU attached but not printed"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d276",
      "verification_status": "verified_published_printed_attachment_record"
    }
  ]
}
```

## Visual Material Registry Context

Use this to check maps, photographs, charts, images, graphic attachments, appendix images, captions, visual titles, not-found/not-attached visual items, visual descriptions, source-image references, printed targets, and person/object/place identification. Do not change captions, image links, visual descriptions, or attachment/not-found status unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-visual-material-registry-v1",
  "visual_material_registry_id": "frus-1981-1992-visual-material-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d61",
    "https://history.state.gov/historicaldocuments/frus1981-88v05/d16",
    "https://history.state.gov/historicaldocuments/frus1981-88v06/d151",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d272",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/appendix-A"
  ],
  "scope": "Published FRUS map, photograph, visual-attachment, appendix-image, and visual not-found patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "visual_material_id": "visual-v31-d61-map-not-found",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d61",
      "document_number": "61",
      "unit_scope": "source note and document text",
      "visual_type": "map",
      "approved_phrase": "At this point Chairman Gorbachev hands over a map of U.S. bases surrounding the Soviet Union.",
      "caption_or_title": "map of U.S. bases surrounding the Soviet Union",
      "visual_description": "Map handed over during the Malta conversation; the published source note records that the map was not found.",
      "relationship_to_document": "not_found",
      "attachment_or_publication_status": "not_found",
      "source_image_or_url": "",
      "printed_target": "",
      "cross_reference_target": "",
      "identification_basis": "Published document text identifies the map and source note records the not-found status.",
      "source_or_context": "Document 61 prints the conversational handover of a map and preserves the source-note not-found status instead of inventing image details.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d61",
      "verification_status": "verified_published_visual_material_record",
      "variant_forms": [
        "Gorbachev hands over a map of U.S. bases surrounding the Soviet Union",
        "map of U.S. bases surrounding the Soviet Union"
      ]
    }
  ],
  "records": [
    {
      "visual_material_id": "visual-v31-d61-map-not-found",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d61",
      "document_number": "61",
      "unit_scope": "source note and document text",
      "visual_type": "map",
      "approved_phrase": "At this point Chairman Gorbachev hands over a map of U.S. bases surrounding the Soviet Union.",
      "caption_or_title": "map of U.S. bases surrounding the Soviet Union",
      "visual_description": "Map handed over during the Malta conversation; the published source note records that the map was not found.",
      "relationship_to_document": "not_found",
      "attachment_or_publication_status": "not_found",
      "source_image_or_url": "",
      "printed_target": "",
      "cross_reference_target": "",
      "identification_basis": "Published document text identifies the map and source note records the not-found status.",
      "source_or_context": "Document 61 prints the conversational handover of a map and preserves the source-note not-found status instead of inventing image details.",
      "variant_forms": [
        "Gorbachev hands over a map of U.S. bases surrounding the Soviet Union",
        "map of U.S. bases surrounding the Soviet Union"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d61",
      "verification_status": "verified_published_visual_material_record"
    },
    {
      "visual_material_id": "visual-v05-d16-photograph-attached",
      "volume_id": "frus1981-88v05",
      "document_id": "frus1981-88v05/d16",
      "document_number": "16",
      "unit_scope": "follow-on footnote",
      "visual_type": "photograph",
      "approved_phrase": "Attached but not printed is a photograph with the spoof title “Top Soviet Pop Group.”",
      "caption_or_title": "Top Soviet Pop Group",
      "visual_description": "Photograph identified by spoof title and visible-person description; published note leaves it attached but not printed.",
      "relationship_to_document": "attached_but_not_printed",
      "attachment_or_publication_status": "attached_not_printed",
      "source_image_or_url": "",
      "printed_target": "",
      "cross_reference_target": "",
      "identification_basis": "Published annotation supplies title and visual identification without printing the photograph.",
      "source_or_context": "Reagan Soviet Union example for caption/title and visible-person description in an attached-but-not-printed photograph note.",
      "variant_forms": [
        "photograph with the spoof title “Top Soviet Pop Group”",
        "Attached but not printed is a photograph"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v05/d16",
      "verification_status": "verified_published_visual_material_record"
    },
    {
      "visual_material_id": "visual-v06-d151-inf-photographs",
      "volume_id": "frus1981-88v06",
      "document_id": "frus1981-88v06/d151",
      "document_number": "151",
      "unit_scope": "document text and annotation context",
      "visual_type": "photograph_exchange",
      "approved_phrase": "photographs of the SS–12 and SS–23 with their front ends",
      "caption_or_title": "SS-12 and SS-23 photographs",
      "visual_description": "Photographic evidence discussed as part of INF exchange and verification context.",
      "relationship_to_document": "discussed_in_document",
      "attachment_or_publication_status": "discussed_only",
      "source_image_or_url": "",
      "printed_target": "",
      "cross_reference_target": "",
      "identification_basis": "Published document text supplies the photographic-evidence context.",
      "source_or_context": "INF photograph-exchange language should be handled as visual material context, not as an attached photograph unless the source note supplies attachment status.",
      "variant_forms": [
        "photographs of the SS-12 and SS-23",
        "photograph exchange"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v06/d151",
      "verification_status": "verified_published_visual_material_record"
    },
    {
      "visual_material_id": "visual-v01-d272-appendix-image",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d272",
      "document_number": "272",
      "unit_scope": "source note and appendix link",
      "visual_type": "appendix_image",
      "approved_phrase": "An image of the notes is Appendix A.",
      "caption_or_title": "Appendix A image of handwritten notes",
      "visual_description": "Appendix image linked from transcribed handwritten notes.",
      "relationship_to_document": "appendix_image_link",
      "attachment_or_publication_status": "printed_appendix",
      "source_image_or_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/appendix-A",
      "printed_target": "Appendix A",
      "cross_reference_target": "frus1981-88v01/appendix-A",
      "identification_basis": "Published source note links the transcribed notes to the appendix image.",
      "source_or_context": "Appendix-image link should preserve the two-way relationship between transcription and image target.",
      "variant_forms": [
        "image of the notes is Appendix A",
        "Appendix A image"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d272",
      "verification_status": "verified_published_visual_material_record"
    },
    {
      "visual_material_id": "visual-v01-appendix-a-reverse-link",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/appendix-A",
      "document_number": "Appendix A",
      "unit_scope": "appendix source note",
      "visual_type": "facsimile",
      "approved_phrase": "For the transcribed copy of these notes, see Document 272.",
      "caption_or_title": "Appendix A",
      "visual_description": "Appendix image points back to the transcribed document.",
      "relationship_to_document": "appendix_image_reverse_link",
      "attachment_or_publication_status": "printed_appendix",
      "source_image_or_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/appendix-A",
      "printed_target": "Document 272",
      "cross_reference_target": "frus1981-88v01/d272",
      "identification_basis": "Published appendix source note supplies the reverse cross-reference.",
      "source_or_context": "Reverse appendix link must not be dropped when normalizing image/facsimile apparatus.",
      "variant_forms": [
        "transcribed copy of these notes, see Document 272"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/appendix-A",
      "verification_status": "verified_published_visual_material_record"
    }
  ]
}
```

## Handwritten And Facsimile Transcription Registry Context

Use this to check handwritten notes and letters, editor-transcribed portions, original brackets and ellipses, unclear or illegible readings, cut-off lines, appendix or facsimile images, marginalia and transcribed margin notes, source-image basis, and reverse appendix targets. Treat transcription status, original-bracket or ellipsis claims, uncertain readings, image or appendix target, cut-off or missing-text claims, and marginalia wording as comment-only unless the target-volume handwritten/facsimile registry proves the exact direct edit.

```json
{
  "schema_version": "frus-handwritten-transcription-registry-v1",
  "handwritten_transcription_registry_id": "frus-1981-1988-handwritten-transcription-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d272",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d13",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d32",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d155"
  ],
  "scope": "Sample registry of published Reagan-era handwritten, editor-transcribed, original-bracket, appendix-image, cut-off-line, illegible-reading, and margin-note apparatus for checking FRUS annotation sheets without inventing transcription facts.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "handwritten_item_id": "handwritten-v01-d272-shultz-notes",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d272",
      "document_number": "272",
      "unit_scope": "source note 1",
      "transcription_type": "handwritten_notes",
      "approved_phrase": "The editor transcribed the text from Shultz's handwritten notes specifically for this volume. An image of the notes is Appendix A",
      "handwritten_source_status": "Shultz handwritten notes",
      "editor_transcription_basis": "editor transcribed text specifically for the volume",
      "facsimile_or_appendix_target": "Appendix A",
      "original_text_convention": "",
      "unclear_or_illegible_handling": "published note preserves unclear and illegible readings in document text",
      "cut_off_or_missing_text": "",
      "physical_location_or_margin": "",
      "related_event_or_diary_basis": "June 6, 1986 NSPG meeting, Situation Room, 10:58-11:51 a.m.",
      "source_or_context": "Reagan Foundations Document 272 source note",
      "variant_forms": [
        "The editor transcribed the text from Shultz’s handwritten notes specifically for this volume"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d272",
      "verification_status": "verified_published_handwritten_transcription_record"
    },
    {
      "handwritten_item_id": "handwritten-v11-d13-original-brackets-note",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d13",
      "document_number": "13",
      "unit_scope": "source note 1",
      "transcription_type": "original_brackets_ellipses",
      "approved_phrase": "Brackets and ellipses are in the original. The original text is handwritten. The editor transcribed the portion of the text here specifically for this volume. An image of the note is Appendix A",
      "handwritten_source_status": "original text is handwritten",
      "editor_transcription_basis": "editor transcribed the portion printed specifically for the volume",
      "facsimile_or_appendix_target": "Appendix A",
      "original_text_convention": "brackets and ellipses are in the original",
      "unclear_or_illegible_handling": "",
      "cut_off_or_missing_text": "one line cut off in the copy is separately noted",
      "physical_location_or_margin": "",
      "related_event_or_diary_basis": "May 3, 1982 NSC meeting in the Cabinet Room, ended at 10:52 a.m.",
      "source_or_context": "START I Document 13 source note",
      "variant_forms": [
        "Brackets and ellipses are in the original",
        "One line was cut off in the copy of this document in the file"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d13",
      "verification_status": "verified_published_handwritten_transcription_record"
    },
    {
      "handwritten_item_id": "handwritten-v11-d32-start-notes-appendix-c",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d32",
      "document_number": "32",
      "unit_scope": "source note 1",
      "transcription_type": "editor_transcribed_portion",
      "approved_phrase": "The original text is handwritten. The editor transcribed the portion of the text here specifically for this volume. An image of the notes is Appendix C",
      "handwritten_source_status": "original text is handwritten",
      "editor_transcription_basis": "editor transcribed the portion printed specifically for the volume",
      "facsimile_or_appendix_target": "Appendix C",
      "original_text_convention": "all brackets are in the original except omission brackets",
      "unclear_or_illegible_handling": "",
      "cut_off_or_missing_text": "",
      "physical_location_or_margin": "",
      "related_event_or_diary_basis": "August 9, 1982 NSC meeting in the Cabinet Room, ended at 4:11 p.m.",
      "source_or_context": "START I Document 32 source note",
      "variant_forms": [
        "All brackets are in the original, except those indicating the omission of material"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d32",
      "verification_status": "verified_published_handwritten_transcription_record"
    },
    {
      "handwritten_item_id": "handwritten-v44p1-d155-keel-notes",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d155",
      "document_number": "155",
      "unit_scope": "source note 1",
      "transcription_type": "handwritten_notes",
      "approved_phrase": "Drafted by Keel, who hand wrote the notes. The editor transcribed the portion of the text here specifically for this volume. An image of the notes is Appendix A",
      "handwritten_source_status": "Keel hand wrote the notes",
      "editor_transcription_basis": "editor transcribed the portion printed specifically for the volume",
      "facsimile_or_appendix_target": "Appendix A",
      "original_text_convention": "",
      "unclear_or_illegible_handling": "published document text preserves illegible readings",
      "cut_off_or_missing_text": "",
      "physical_location_or_margin": "",
      "related_event_or_diary_basis": "November 7, 1986 Oval Office meeting, 11-11:58 a.m.",
      "source_or_context": "National Security Policy Document 155 source note",
      "variant_forms": [
        "Drafted by Keel, who hand wrote the notes"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d155",
      "verification_status": "verified_published_handwritten_transcription_record"
    },
    {
      "handwritten_item_id": "handwritten-v44p1-d155-left-margin-note",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d155",
      "document_number": "155",
      "unit_scope": "footnote 2",
      "transcription_type": "marginalia_left_hand",
      "approved_phrase": "Keel wrote \"ordinary looking trains\" in the left-hand margin beside this point",
      "handwritten_source_status": "Keel margin note",
      "editor_transcription_basis": "published footnote transcribes the marginal note",
      "facsimile_or_appendix_target": "",
      "original_text_convention": "",
      "unclear_or_illegible_handling": "",
      "cut_off_or_missing_text": "",
      "physical_location_or_margin": "left-hand margin beside the point",
      "related_event_or_diary_basis": "",
      "source_or_context": "National Security Policy Document 155 footnote 2",
      "variant_forms": [
        "Keel wrote “ordinary looking trains” in the left-hand margin beside this point",
        "left-hand margin beside this point"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d155",
      "verification_status": "verified_published_handwritten_transcription_record"
    }
  ]
}
```

## Document Handling And Marginalia Registry Context

Use this to check initials, handwritten marginalia, underlining, checkmarks, stamped notations, saw notations, sent-for-action/sent-for-information routing, copy status, bracket/original-status phrases, and approval/disapproval language. Do not change document-face handling, mark locations, actors, routing status, or copy status unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-document-handling-registry-v1",
  "document_handling_registry_id": "frus-1981-1992-document-handling-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d2",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d10",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d19",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d27"
  ],
  "scope": "Published FRUS document-face handling, routing, initials, marginalia, stamped notation, and approval patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "document_handling_id": "handling-v31-d1-watson-bush-margin",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "source note",
      "handling_type": "initials_and_marginalia",
      "approved_phrase": "Watson initialed the memorandum on Gregg’s behalf. Bush wrote in the top right-hand margin of the memorandum: “good paper. Sam: see question on page 2 of Anne’s letter ?? also p. 3 GB 3–19.”",
      "actor": "Watson; Bush",
      "action": "Watson initialed the memorandum; Bush wrote a margin note.",
      "mark_location": "top right-hand margin",
      "mark_text_or_summary": "good paper; Sam question; GB 3-19",
      "routing_or_decision_status": "",
      "copy_or_transcription_status": "",
      "source_or_context": "START I source note preserves both the staff initial and Bush's handwritten marginal comment.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document_handling_record",
      "variant_forms": [
        "Bush wrote in the top right-hand margin of the memorandum",
        "Watson initialed the memorandum on Gregg's behalf"
      ]
    },
    {
      "document_handling_id": "handling-v31-d2-bush-checkmark",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d2",
      "document_number": "2",
      "unit_scope": "follow-on footnote",
      "handling_type": "underlining_and_checkmark",
      "approved_phrase": "Bush underlined “If” and placed a checkmark in the left-hand margin beside this sentence.",
      "actor": "Bush",
      "action": "underlined text and placed a checkmark",
      "mark_location": "left-hand margin",
      "mark_text_or_summary": "underlined 'If'; checkmark beside sentence",
      "routing_or_decision_status": "",
      "copy_or_transcription_status": "",
      "source_or_context": "START I annotation note gives exact word underlined and location of checkmark.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "verification_status": "verified_published_document_handling_record",
      "variant_forms": [
        "Bush placed a checkmark in the left-hand margin beside this sentence",
        "Bush underlined If and placed a checkmark"
      ]
    },
    {
      "document_handling_id": "handling-v31-d8-stamped-signed",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d8",
      "document_number": "8",
      "unit_scope": "source note",
      "handling_type": "routing_and_stamped_notation",
      "approved_phrase": "Sent for action. Sent through Kanter. Brackets are in the original. A stamped notation at the top of the memorandum reads: “Signed.”",
      "actor": "Kanter; stamped notation",
      "action": "sent for action; sent through Kanter; stamped signed",
      "mark_location": "top of the memorandum",
      "mark_text_or_summary": "Signed",
      "routing_or_decision_status": "sent_for_action; sent_through",
      "copy_or_transcription_status": "brackets are in the original",
      "source_or_context": "START I source note combines routing, original-bracket status, and signed stamp; the elements should not be separated unless the source image supports it.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "verification_status": "verified_published_document_handling_record",
      "variant_forms": [
        "Sent for action. Sent through Kanter. A stamped notation at the top of the memorandum reads: “Signed.”",
        "A stamped notation at the top of the memorandum reads: “Signed.”"
      ]
    }
  ],
  "records": [
    {
      "document_handling_id": "handling-v31-d1-watson-bush-margin",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d1",
      "document_number": "1",
      "unit_scope": "source note",
      "handling_type": "initials_and_marginalia",
      "approved_phrase": "Watson initialed the memorandum on Gregg’s behalf. Bush wrote in the top right-hand margin of the memorandum: “good paper. Sam: see question on page 2 of Anne’s letter ?? also p. 3 GB 3–19.”",
      "actor": "Watson; Bush",
      "action": "Watson initialed the memorandum; Bush wrote a margin note.",
      "mark_location": "top right-hand margin",
      "mark_text_or_summary": "good paper; Sam question; GB 3-19",
      "routing_or_decision_status": "",
      "copy_or_transcription_status": "",
      "source_or_context": "START I source note preserves both the staff initial and Bush's handwritten marginal comment.",
      "variant_forms": [
        "Bush wrote in the top right-hand margin of the memorandum",
        "Watson initialed the memorandum on Gregg's behalf"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v31-d2-bush-checkmark",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d2",
      "document_number": "2",
      "unit_scope": "follow-on footnote",
      "handling_type": "underlining_and_checkmark",
      "approved_phrase": "Bush underlined “If” and placed a checkmark in the left-hand margin beside this sentence.",
      "actor": "Bush",
      "action": "underlined text and placed a checkmark",
      "mark_location": "left-hand margin",
      "mark_text_or_summary": "underlined 'If'; checkmark beside sentence",
      "routing_or_decision_status": "",
      "copy_or_transcription_status": "",
      "source_or_context": "START I annotation note gives exact word underlined and location of checkmark.",
      "variant_forms": [
        "Bush placed a checkmark in the left-hand margin beside this sentence",
        "Bush underlined If and placed a checkmark"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v31-d8-stamped-signed",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d8",
      "document_number": "8",
      "unit_scope": "source note",
      "handling_type": "routing_and_stamped_notation",
      "approved_phrase": "Sent for action. Sent through Kanter. Brackets are in the original. A stamped notation at the top of the memorandum reads: “Signed.”",
      "actor": "Kanter; stamped notation",
      "action": "sent for action; sent through Kanter; stamped signed",
      "mark_location": "top of the memorandum",
      "mark_text_or_summary": "Signed",
      "routing_or_decision_status": "sent_for_action; sent_through",
      "copy_or_transcription_status": "brackets are in the original",
      "source_or_context": "START I source note combines routing, original-bracket status, and signed stamp; the elements should not be separated unless the source image supports it.",
      "variant_forms": [
        "Sent for action. Sent through Kanter. A stamped notation at the top of the memorandum reads: “Signed.”",
        "A stamped notation at the top of the memorandum reads: “Signed.”"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v44p1-d2-dam-saw",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d2",
      "document_number": "2",
      "unit_scope": "source note",
      "handling_type": "stamped_saw_notation",
      "approved_phrase": "A stamped notation on the memorandum indicates Dam saw it on December 1.",
      "actor": "Dam",
      "action": "saw the memorandum",
      "mark_location": "memorandum",
      "mark_text_or_summary": "Dam saw it on December 1",
      "routing_or_decision_status": "saw_notation",
      "copy_or_transcription_status": "",
      "source_or_context": "Reagan National Security Policy source note preserves a stamped saw notation with date.",
      "variant_forms": [
        "stamped notation on the memorandum indicates Dam saw it",
        "Dam saw it on December 1"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d2",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v44p1-d10-mckinley-initialed",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d10",
      "document_number": "10",
      "unit_scope": "source note",
      "handling_type": "initials_and_written_date",
      "approved_phrase": "McKinley initialed the memorandum and wrote: “27 Dec.”",
      "actor": "McKinley",
      "action": "initialed and wrote date",
      "mark_location": "memorandum",
      "mark_text_or_summary": "27 Dec.",
      "routing_or_decision_status": "",
      "copy_or_transcription_status": "",
      "source_or_context": "Reagan National Security Policy source note preserves initials and a short handwritten date.",
      "variant_forms": [
        "McKinley initialed the memorandum",
        "wrote: “27 Dec.”"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d10",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v44p1-d19-mcfarlane-approved",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d19",
      "document_number": "19",
      "unit_scope": "follow-on footnote",
      "handling_type": "approval",
      "approved_phrase": "McFarlane approved the recommendation.",
      "actor": "McFarlane",
      "action": "approved the recommendation",
      "mark_location": "",
      "mark_text_or_summary": "approved",
      "routing_or_decision_status": "approved",
      "copy_or_transcription_status": "",
      "source_or_context": "Reagan National Security Policy follow-on note records approval as document handling evidence, not a policy inference.",
      "variant_forms": [
        "approved the recommendation"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d19",
      "verification_status": "verified_published_document_handling_record"
    },
    {
      "document_handling_id": "handling-v01-d27-uninitialed-copy-president-saw",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d27",
      "document_number": "27",
      "unit_scope": "source note",
      "handling_type": "routing_copy_status_and_stamped_saw_notation",
      "approved_phrase": "Sent for action. Printed from an uninitialed copy. A stamped notation in the top right-hand corner of the memorandum indicates the President saw it.",
      "actor": "President",
      "action": "saw the memorandum",
      "mark_location": "top right-hand corner",
      "mark_text_or_summary": "President saw it",
      "routing_or_decision_status": "sent_for_action; saw_notation",
      "copy_or_transcription_status": "printed from an uninitialed copy",
      "source_or_context": "Reagan Foundations source note combines routing, copy status, and stamped presidential saw notation.",
      "variant_forms": [
        "Printed from an uninitialed copy",
        "A stamped notation in the top right-hand corner of the memorandum indicates the President saw it"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d27",
      "verification_status": "verified_published_document_handling_record"
    }
  ]
}
```

## Chronology And Time Registry Context

Use this to check President's Daily Diary, meeting-time, call-time, no-precise-time, actual-versus-planned, diary/schedule, place, attendance, and event-sequence language. Do not change times, dates, places, attendance, sequence, or no-minutes/no-precise-time caveats unless the target-volume chronology registry proves the direct edit.

```json
{
  "schema_version": "frus-chronology-registry-v1",
  "chronology_registry_id": "frus-1981-1992-chronology-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d32",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d21",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d27"
  ],
  "scope": "Published FRUS chronology, President's Daily Diary, meeting-time, no-precise-time, and event-time patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "chronology_id": "chron-v31-d14-daily-diary-meeting",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d14",
      "document_number": "14",
      "unit_scope": "follow-on footnote",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
      "event_date": "1989-05-04",
      "start_time": "2:23 p.m.",
      "end_time": "2:55 p.m.",
      "time_basis": "President's Daily Diary",
      "place": "Oval Office",
      "participants_or_actors": "Bush; Baker; Cheney; Webster; Crowe; Gates; Sununu",
      "relationship_to_document": "background_meeting_for_document",
      "source_or_context": "Follow-on note ties the May 4 White House meeting to Baker's Moscow Ministerial talking points and explicitly records that no minutes were found.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
      "verification_status": "verified_published_chronology_record",
      "variant_forms": [
        "Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4",
        "Oval Office from 2:23 to 2:55 p.m. on May 4"
      ]
    },
    {
      "chronology_id": "chron-v31-d23-nsc-daily-diary",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "According to the President's Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m. No minutes were found.",
      "event_date": "1989-05-25",
      "start_time": "9:39 a.m.",
      "end_time": "11:04 a.m.",
      "time_basis": "President's Daily Diary",
      "place": "Cabinet Room",
      "participants_or_actors": "Bush; National Security Council",
      "relationship_to_document": "source_note_meeting_context",
      "source_or_context": "Source note establishes the NSC meeting time and location from the President's Daily Diary and preserves the no-minutes result.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_chronology_record",
      "variant_forms": [
        "Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m.",
        "Cabinet Room lasting from 9:39-11:04 a.m."
      ]
    }
  ],
  "records": [
    {
      "chronology_id": "chron-v31-d14-daily-diary-meeting",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d14",
      "document_number": "14",
      "unit_scope": "follow-on footnote",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
      "event_date": "1989-05-04",
      "start_time": "2:23 p.m.",
      "end_time": "2:55 p.m.",
      "time_basis": "President's Daily Diary",
      "place": "Oval Office",
      "participants_or_actors": "Bush; Baker; Cheney; Webster; Crowe; Gates; Sununu",
      "relationship_to_document": "background_meeting_for_document",
      "source_or_context": "Follow-on note ties the May 4 White House meeting to Baker's Moscow Ministerial talking points and explicitly records that no minutes were found.",
      "variant_forms": [
        "Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4",
        "Oval Office from 2:23 to 2:55 p.m. on May 4"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
      "verification_status": "verified_published_chronology_record"
    },
    {
      "chronology_id": "chron-v31-d23-nsc-daily-diary",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "According to the President's Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m. No minutes were found.",
      "event_date": "1989-05-25",
      "start_time": "9:39 a.m.",
      "end_time": "11:04 a.m.",
      "time_basis": "President's Daily Diary",
      "place": "Cabinet Room",
      "participants_or_actors": "Bush; National Security Council",
      "relationship_to_document": "source_note_meeting_context",
      "source_or_context": "Source note establishes the NSC meeting time and location from the President's Daily Diary and preserves the no-minutes result.",
      "variant_forms": [
        "Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m.",
        "Cabinet Room lasting from 9:39-11:04 a.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_chronology_record"
    },
    {
      "chronology_id": "chron-v44p1-d1-reagan-shultz-meeting",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d1",
      "document_number": "1",
      "unit_scope": "follow-on footnote",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "Reagan met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m. to discuss the global agenda and foreign policy in the second term. (Reagan Library, President's Daily Diary) No minutes were found.",
      "event_date": "1984-11-14",
      "start_time": "1:30 p.m.",
      "end_time": "2:45 p.m.",
      "time_basis": "Reagan Library, President's Daily Diary",
      "place": "Oval Office",
      "participants_or_actors": "Reagan; Shultz; McFarlane",
      "relationship_to_document": "meeting_context_and_no_minutes",
      "source_or_context": "Reagan National Security Policy note preserves a Daily Diary meeting time and links it to a diary entry and no-minutes finding.",
      "variant_forms": [
        "Reagan met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m.",
        "Oval Office on November 14 from 1:30 until 2:45 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
      "verification_status": "verified_published_chronology_record"
    },
    {
      "chronology_id": "chron-v44p1-d32-casey-reagan-meeting",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d32",
      "document_number": "32",
      "unit_scope": "source note",
      "chronology_type": "daily_diary_meeting_time",
      "approved_phrase": "According to the President's Daily Diary, Reagan met with Casey, Regan, and McFarlane in the Oval Office from 9:52-10:12 a.m. (Reagan Library, President's Daily Diary) No minutes were found.",
      "event_date": "1985-04-26",
      "start_time": "9:52 a.m.",
      "end_time": "10:12 a.m.",
      "time_basis": "Reagan Library, President's Daily Diary",
      "place": "Oval Office",
      "participants_or_actors": "Reagan; Casey; Regan; McFarlane",
      "relationship_to_document": "source_note_meeting_context",
      "source_or_context": "Reagan National Security Policy source note records a short Daily Diary meeting and the no-minutes result.",
      "variant_forms": [
        "Reagan met with Casey, Regan, and McFarlane in the Oval Office from 9:52-10:12 a.m.",
        "Oval Office from 9:52-10:12 a.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d32",
      "verification_status": "verified_published_chronology_record"
    },
    {
      "chronology_id": "chron-v01-d21-no-precise-time",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d21",
      "document_number": "21",
      "unit_scope": "source note",
      "chronology_type": "no_precise_time",
      "approved_phrase": "The President's Daily Diary does not contain an entry for January 21; there is no indication as to when precisely the telephone calls took place. (Reagan Library, President's Daily Diary)",
      "event_date": "1981-01-21",
      "start_time": "",
      "end_time": "",
      "time_basis": "President's Daily Diary absence of entry",
      "place": "",
      "participants_or_actors": "Reagan; allied heads of government",
      "relationship_to_document": "telephone_call_time_uncertain",
      "source_or_context": "Published source note preserves the absence of a Daily Diary entry rather than inventing call times.",
      "variant_forms": [
        "there is no indication as to when precisely the telephone calls took place",
        "Daily Diary does not contain an entry for January 21"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d21",
      "verification_status": "verified_published_chronology_record"
    },
    {
      "chronology_id": "chron-v01-d27-first-nsc-meeting",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d27",
      "document_number": "27",
      "unit_scope": "source note and follow-on footnote",
      "chronology_type": "actual_vs_planned_meeting_time",
      "approved_phrase": "The first NSC meeting of the Reagan administration took place in the Cabinet Room at the White House on February 6 from 1:30 until 2:40 p.m. (Reagan Library, President's Daily Diary)",
      "event_date": "1981-02-06",
      "start_time": "1:30 p.m.",
      "end_time": "2:40 p.m.",
      "time_basis": "Reagan Library, President's Daily Diary",
      "place": "Cabinet Room at the White House",
      "participants_or_actors": "Reagan; National Security Council",
      "relationship_to_document": "actual_meeting_time_corrects_planned_subject_time",
      "source_or_context": "Published source note gives actual Daily Diary meeting time after the document subject line gave planned meeting time.",
      "variant_forms": [
        "Cabinet Room at the White House on February 6 from 1:30 until 2:40 p.m.",
        "February 6 from 1:30 until 2:40 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d27",
      "verification_status": "verified_published_chronology_record"
    }
  ]
}
```

## Meeting Attendance And Participant-List Registry Context

Use this to check meeting/call attendees, partial attendance, President's Daily Diary attendance basis, `also attended` language, participant-list status, not-attached participant lists, and no-minutes/no-memcon caveats. Do not add or remove names, flatten partial attendance into full attendance, infer a participant list, or change no-minutes/no-memcon language unless the target-volume meeting attendance registry proves the direct edit.

```json
{
  "schema_version": "frus-meeting-attendance-registry-v1",
  "meeting_attendance_registry_id": "frus-reagan-bush-meeting-attendance-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d32",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d217",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "scope": "Sample published meeting-attendance and participant-list forms for Reagan and George H.W. Bush FRUS annotation-sheet review. Use this to protect names, attendance basis, participant-list status, and no-minutes/no-memcon caveats from unsupported direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "meeting_attendance_id": "meet-v31-d14-daily-diary-attendance",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d14",
      "document_number": "14",
      "unit_scope": "footnote 2",
      "attendance_type": "daily_diary_attendance",
      "approved_phrase": "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
      "meeting_or_call_date": "1989-05-04",
      "meeting_or_call_title": "May 4 White House meeting on the Moscow Ministerial",
      "attendance_basis": "President's Daily Diary",
      "participants_or_attendance": "Bush; Baker; Cheney; Webster; Crowe; Gates; Sununu",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Bush START I Document 14 footnote 2 ties the attendees and no-minutes result to the President's Daily Diary.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
      "verification_status": "verified_published_attendance_record",
      "variant_forms": [
        "Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4"
      ]
    },
    {
      "meeting_attendance_id": "meet-v31-d23-nsc-attendance",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note",
      "attendance_type": "nsc_meeting_attendance",
      "approved_phrase": "According to the President's Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m. No minutes were found.",
      "meeting_or_call_date": "1989-05-25",
      "meeting_or_call_title": "Meeting with the National Security Council",
      "attendance_basis": "President's Daily Diary",
      "participants_or_attendance": "Bush; National Security Council",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Bush START I Document 23 source note preserves the Daily Diary meeting basis and no-minutes result.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_attendance_record",
      "variant_forms": [
        "Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m."
      ]
    },
    {
      "meeting_attendance_id": "meet-v31-d25-participant-list-not-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d25",
      "document_number": "25",
      "unit_scope": "footnote 8",
      "attendance_type": "participant_list_not_attached",
      "approved_phrase": "The List of Participants, cited here as Tab C, was not attached. The Talking Points and Agenda for the June 7 NSC meeting are printed as Tab A and Tab B, Document 26",
      "meeting_or_call_date": "1989-06-07",
      "meeting_or_call_title": "June 7 NSC meeting",
      "attendance_basis": "Attachment list and source-note apparatus",
      "participants_or_attendance": "List of Participants cited as Tab C; names unavailable because Tab C was not attached",
      "participant_list_status": "cited_tab_missing",
      "record_status": "participant_list_missing",
      "source_or_context": "Bush START I Document 25 footnote 8 distinguishes a missing participant list from printed talking points and agenda tabs.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "verification_status": "verified_published_attendance_record",
      "variant_forms": [
        "The List of Participants, cited here as Tab C, was not attached"
      ]
    }
  ],
  "records": [
    {
      "meeting_attendance_id": "meet-v31-d14-daily-diary-attendance",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d14",
      "document_number": "14",
      "unit_scope": "footnote 2",
      "attendance_type": "daily_diary_attendance",
      "approved_phrase": "According to the President's Daily Diary, Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4. No minutes were found.",
      "meeting_or_call_date": "1989-05-04",
      "meeting_or_call_title": "May 4 White House meeting on the Moscow Ministerial",
      "attendance_basis": "President's Daily Diary",
      "participants_or_attendance": "Bush; Baker; Cheney; Webster; Crowe; Gates; Sununu",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Bush START I Document 14 footnote 2 ties the attendees and no-minutes result to the President's Daily Diary.",
      "variant_forms": [
        "Bush met with Baker, Cheney, Webster, Crowe, Gates, and Sununu in the Oval Office from 2:23 to 2:55 p.m. on May 4"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d14",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v31-d23-nsc-attendance",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source note",
      "attendance_type": "nsc_meeting_attendance",
      "approved_phrase": "According to the President's Daily Diary, on May 25 Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m. No minutes were found.",
      "meeting_or_call_date": "1989-05-25",
      "meeting_or_call_title": "Meeting with the National Security Council",
      "attendance_basis": "President's Daily Diary",
      "participants_or_attendance": "Bush; National Security Council",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Bush START I Document 23 source note preserves the Daily Diary meeting basis and no-minutes result.",
      "variant_forms": [
        "Bush presided over a meeting of the National Security Council in the Cabinet Room lasting from 9:39-11:04 a.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v31-d25-participant-list-not-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d25",
      "document_number": "25",
      "unit_scope": "footnote 8",
      "attendance_type": "participant_list_not_attached",
      "approved_phrase": "The List of Participants, cited here as Tab C, was not attached. The Talking Points and Agenda for the June 7 NSC meeting are printed as Tab A and Tab B, Document 26",
      "meeting_or_call_date": "1989-06-07",
      "meeting_or_call_title": "June 7 NSC meeting",
      "attendance_basis": "Attachment list and source-note apparatus",
      "participants_or_attendance": "List of Participants cited as Tab C; names unavailable because Tab C was not attached",
      "participant_list_status": "cited_tab_missing",
      "record_status": "participant_list_missing",
      "source_or_context": "Bush START I Document 25 footnote 8 distinguishes a missing participant list from printed talking points and agenda tabs.",
      "variant_forms": [
        "The List of Participants, cited here as Tab C, was not attached"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v44p1-d1-reagan-shultz-mcfarlane",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d1",
      "document_number": "1",
      "unit_scope": "footnote 2",
      "attendance_type": "meeting_note_no_minutes",
      "approved_phrase": "Reagan met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m. to discuss the global agenda and foreign policy in the second term. (Reagan Library, President's Daily Diary) No minutes were found.",
      "meeting_or_call_date": "1984-11-14",
      "meeting_or_call_title": "Global agenda and foreign policy in the second term",
      "attendance_basis": "Reagan Library, President's Daily Diary",
      "participants_or_attendance": "Reagan; Shultz; McFarlane",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Reagan National Security Policy Document 1 footnote 2 ties attendance to the Daily Diary and separately cites Reagan diary recollection.",
      "variant_forms": [
        "Reagan met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v44p1-d32-casey-regan-mcfarlane",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d32",
      "document_number": "32",
      "unit_scope": "source note",
      "attendance_type": "meeting_note_no_minutes",
      "approved_phrase": "According to the President's Daily Diary, Reagan met with Casey, Regan, and McFarlane in the Oval Office from 9:52-10:12 a.m. (Reagan Library, President's Daily Diary) No minutes were found.",
      "meeting_or_call_date": "1985-04-26",
      "meeting_or_call_title": "Casey discussion with Reagan",
      "attendance_basis": "Reagan Library, President's Daily Diary",
      "participants_or_attendance": "Reagan; Casey; Regan; McFarlane",
      "participant_list_status": "not_applicable",
      "record_status": "no_minutes_found",
      "source_or_context": "Reagan National Security Policy Document 32 source note records attendance and the no-minutes result.",
      "variant_forms": [
        "Reagan met with Casey, Regan, and McFarlane in the Oval Office from 9:52-10:12 a.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d32",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v01-d217-no-memcon",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d217",
      "document_number": "217",
      "unit_scope": "footnote 17",
      "attendance_type": "meeting_note_no_memcon",
      "approved_phrase": "The President met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m. (Reagan Library, President's Daily Diary) No memorandum of conversation has been found.",
      "meeting_or_call_date": "1984-11-14",
      "meeting_or_call_title": "Foreign Policy in the Term Ahead",
      "attendance_basis": "Reagan Library, President's Daily Diary",
      "participants_or_attendance": "Reagan; Shultz; McFarlane",
      "participant_list_status": "not_applicable",
      "record_status": "no_memcon_found",
      "source_or_context": "Reagan Foundations Document 217 footnote 17 uses Daily Diary evidence and no-memcon language for the same Shultz-McFarlane meeting context.",
      "variant_forms": [
        "The President met with Shultz and McFarlane in the Oval Office on November 14 from 1:30 until 2:45 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d217",
      "verification_status": "verified_published_attendance_record"
    },
    {
      "meeting_attendance_id": "meet-v01-d316-partial-attendance",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d316",
      "document_number": "316",
      "unit_scope": "source note",
      "attendance_type": "daily_diary_partial_attendance",
      "approved_phrase": "The President met with Shultz, Powell, Baker, and Duberstein on January 6 in the Oval Office Study from 1:04 until 1:36 p.m. Weinberger also attended the meeting from 1:04 until 1:06 p.m.",
      "meeting_or_call_date": "1988-01-06",
      "meeting_or_call_title": "Meeting with the President: The Next Six Months",
      "attendance_basis": "Reagan Library, President's Daily Diary",
      "participants_or_attendance": "Reagan; Shultz; Powell; Baker; Duberstein; Weinberger attended only from 1:04 until 1:06 p.m.",
      "participant_list_status": "not_applicable",
      "record_status": "diary_entry_only",
      "source_or_context": "Reagan Foundations Document 316 source note models partial attendance, which should not be flattened into full-meeting attendance.",
      "variant_forms": [
        "Weinberger also attended the meeting from 1:04 until 1:06 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d316",
      "verification_status": "verified_published_attendance_record"
    }
  ]
}
```

## Time-Zone And Date-Time Group Registry Context

Use this to check Washington-time rules, local-time labels, GMT/Z/Zulu date-time groups, EST/EDT labels, no-precise-time caveats, deadlines, treaty timing rules, and chronological placement. Preserve time labels exactly; do not convert, drop `Z`, add local time, or move a document chronologically unless the target-volume time-zone registry proves the direct edit.

```json
{
  "schema_version": "frus-time-zone-registry-v1",
  "time_zone_registry_id": "frus-1981-1992-time-zone-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d188",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d19",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d21",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d27"
  ],
  "scope": "Published FRUS time-zone, telegram date-time group, Washington-time, no-precise-time, actual-versus-planned, and treaty timing patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "time_zone_item_id": "time-v31-d188-geneva-1757z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d188",
      "document_number": "188",
      "unit_scope": "telegram heading and body",
      "time_claim_type": "telegram_date_time_group_and_washington_target",
      "approved_phrase": "Geneva, January 10, 1991, 1757Z",
      "source_time_basis": "telegram date-time group plus body reference to Washington working deadline",
      "display_time": "1757Z; open of business Washington time",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission and Washington working-deadline context",
      "event_or_document_context": "Burt expected a readout for Washington by open of business Washington time Monday morning.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d188",
      "verification_status": "verified_published_time_zone_record",
      "variant_forms": [
        "1757Z",
        "open of business Washington time Monday morning"
      ]
    },
    {
      "time_zone_item_id": "time-v31-d89-namibia-0905z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d89",
      "document_number": "89",
      "unit_scope": "telegram heading",
      "time_claim_type": "telegram_date_time_group",
      "approved_phrase": "Namibia, March 20, 1990, 0905Z",
      "source_time_basis": "telegram date-time group",
      "display_time": "0905Z",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission time",
      "event_or_document_context": "Secretary Baker's delegation telegram reporting the Shevardnadze meeting.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
      "verification_status": "verified_published_time_zone_record",
      "variant_forms": [
        "0905Z"
      ]
    },
    {
      "time_zone_item_id": "time-v31-d178-washington-1430z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d178",
      "document_number": "178",
      "unit_scope": "telegram heading",
      "time_claim_type": "telegram_date_time_group",
      "approved_phrase": "Washington, December 17, 1990, 1430Z",
      "source_time_basis": "telegram date-time group",
      "display_time": "1430Z",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission time",
      "event_or_document_context": "Department telegram to Secretary Baker containing the START package.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
      "verification_status": "verified_published_time_zone_record",
      "variant_forms": [
        "1430Z"
      ]
    },
    {
      "time_zone_item_id": "time-v31-d246-treaty-display-window",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "treaty text",
      "time_claim_type": "treaty_notification_time_rule",
      "approved_phrase": "A display shall begin no later than 12 hours after the request is made and shall continue until 18 hours have elapsed from the time that the request was made",
      "source_time_basis": "START Treaty timing rule",
      "display_time": "12 hours after request; 18 hours elapsed",
      "conversion_status": "treaty_rule_do_not_convert",
      "chronological_placement": "treaty/legal-instrument timing provision",
      "event_or_document_context": "Cooperative-measures display timing under the START Treaty.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_time_zone_record",
      "variant_forms": [
        "12 hours after the request is made",
        "18 hours have elapsed from the time that the request was made"
      ]
    }
  ],
  "records": [
    {
      "time_zone_item_id": "time-v44p1-about-washington-time",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/abouttheseries",
      "document_number": "abouttheseries",
      "unit_scope": "About the Series editorial methodology",
      "time_claim_type": "volume_chronology_standard",
      "approved_phrase": "The documents are presented chronologically according to Washington time.",
      "source_time_basis": "published About the Series methodology statement",
      "display_time": "Washington time",
      "conversion_status": "no_conversion_needed",
      "chronological_placement": "volume-wide editorial rule",
      "event_or_document_context": "Memoranda of conversation are placed by conversation time and date rather than memorandum draft date.",
      "variant_forms": [
        "Memoranda of conversation are placed according to the time and date of the conversation, rather than the date the memorandum was drafted"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v31-d188-geneva-1757z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d188",
      "document_number": "188",
      "unit_scope": "telegram heading and body",
      "time_claim_type": "telegram_date_time_group_and_washington_target",
      "approved_phrase": "Geneva, January 10, 1991, 1757Z",
      "source_time_basis": "telegram date-time group plus body reference to Washington working deadline",
      "display_time": "1757Z; open of business Washington time",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission and Washington working-deadline context",
      "event_or_document_context": "Burt expected a readout for Washington by open of business Washington time Monday morning.",
      "variant_forms": [
        "1757Z",
        "open of business Washington time Monday morning"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d188",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v31-d89-namibia-0905z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d89",
      "document_number": "89",
      "unit_scope": "telegram heading",
      "time_claim_type": "telegram_date_time_group",
      "approved_phrase": "Namibia, March 20, 1990, 0905Z",
      "source_time_basis": "telegram date-time group",
      "display_time": "0905Z",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission time",
      "event_or_document_context": "Secretary Baker's delegation telegram reporting the Shevardnadze meeting.",
      "variant_forms": [
        "0905Z"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v31-d178-washington-1430z",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d178",
      "document_number": "178",
      "unit_scope": "telegram heading",
      "time_claim_type": "telegram_date_time_group",
      "approved_phrase": "Washington, December 17, 1990, 1430Z",
      "source_time_basis": "telegram date-time group",
      "display_time": "1430Z",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission time",
      "event_or_document_context": "Department telegram to Secretary Baker containing the START package.",
      "variant_forms": [
        "1430Z"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v01-d19-washington-2135z",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d19",
      "document_number": "19",
      "unit_scope": "telegram heading",
      "time_claim_type": "telegram_date_time_group",
      "approved_phrase": "Washington, January 17, 1981, 2135Z",
      "source_time_basis": "telegram date-time group",
      "display_time": "2135Z",
      "conversion_status": "conversion_not_supplied",
      "chronological_placement": "telegraphic transmission time",
      "event_or_document_context": "Department telegram to the Embassy in Yugoslavia reporting transition comments.",
      "variant_forms": [
        "2135Z"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d19",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v01-d21-no-precise-call-time",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d21",
      "document_number": "21",
      "unit_scope": "source note",
      "time_claim_type": "no_precise_time",
      "approved_phrase": "there is no indication as to when precisely the telephone calls took place",
      "source_time_basis": "President's Daily Diary absence of entry",
      "display_time": "no precise call time",
      "conversion_status": "ambiguous_do_not_resolve",
      "chronological_placement": "January 21 calls preserved without invented precise times",
      "event_or_document_context": "Presidential telephone calls to allied heads of government.",
      "variant_forms": [
        "no precise time for the telephone calls"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d21",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v01-d27-actual-vs-planned",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d27",
      "document_number": "27",
      "unit_scope": "source note",
      "time_claim_type": "actual_vs_planned_meeting_time",
      "approved_phrase": "from 1:30 until 2:40 p.m.",
      "source_time_basis": "President's Daily Diary actual meeting time",
      "display_time": "1:30 until 2:40 p.m.",
      "conversion_status": "no_conversion_needed",
      "chronological_placement": "actual meeting time differs from the planned time in the subject line",
      "event_or_document_context": "The first NSC meeting was planned for 1:30 to 2:20 p.m. but actually took place from 1:30 until 2:40 p.m.",
      "variant_forms": [
        "Cabinet Room at the White House on February 6 from 1:30 until 2:40 p.m."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d27",
      "verification_status": "verified_published_time_zone_record"
    },
    {
      "time_zone_item_id": "time-v31-d246-treaty-display-window",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "treaty text",
      "time_claim_type": "treaty_notification_time_rule",
      "approved_phrase": "A display shall begin no later than 12 hours after the request is made and shall continue until 18 hours have elapsed from the time that the request was made",
      "source_time_basis": "START Treaty timing rule",
      "display_time": "12 hours after request; 18 hours elapsed",
      "conversion_status": "treaty_rule_do_not_convert",
      "chronological_placement": "treaty/legal-instrument timing provision",
      "event_or_document_context": "Cooperative-measures display timing under the START Treaty.",
      "variant_forms": [
        "12 hours after the request is made",
        "18 hours have elapsed from the time that the request was made"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_time_zone_record"
    }
  ]
}
```

## Summit Travel And Public Event Registry Context

Use this to check summit travel, public signing ceremonies, public remarks, news conferences, interviews, public addresses, United Nations addresses, toasts, arrival/departure events, public-source basis, diary/schedule basis, press basis, event sequence, participants, place, date/time, and full-record-elsewhere targets. Treat event date, time, place, sequence, participant, public-source basis, press basis, diary/schedule basis, time-zone relationship, and full-record target as comment-only unless the target-volume summit/public-event registry proves the exact direct edit.

```json
{
  "schema_version": "frus-summit-public-event-registry-v1",
  "event_chronology_registry_id": "frus-1981-1992-summit-public-event-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d237",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d244",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d206",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d33",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/ch3"
  ],
  "scope": "Published Reagan and George H.W. Bush summit, travel, ceremony, interview, public-address, press-event, public-source, diary/schedule, and full-record-target patterns for FRUS annotation-sheet review.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "event_id": "event-v31-d245-start-signing-remarks",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d245",
      "document_number": "245",
      "unit_scope": "editorial_note",
      "event_family": "summit_travel",
      "event_type": "signing_ceremony",
      "approved_phrase": "Bush and Gorbachev prepared remarks at the START signing ceremony in Moscow",
      "date_span": "1991-07-31",
      "place": "Moscow",
      "public_source_basis": "Public Papers: Bush, 1991, pages 986-987",
      "schedule_or_diary_basis": "timed Moscow summit itinerary in published editorial note",
      "related_full_record_target": "Foreign Relations, 1989-1992, vol. III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "press_or_ceremony_component": "START signing remarks",
      "participants_or_actors": "Bush; Gorbachev",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 245 editorial note.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
      "verification_status": "verified_published_summit_public_event_record",
      "variant_forms": [
        "START signing ceremony in Moscow",
        "Public Papers: Bush, 1991, pages 986-987"
      ]
    },
    {
      "event_id": "event-v31-d237-london-economic-summit-news-conference",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d237",
      "document_number": "237",
      "unit_scope": "follow_on_footnote",
      "event_family": "summit_press",
      "event_type": "news_conference",
      "approved_phrase": "In an evening news conference at the London Economic Summit on July 17",
      "date_span": "1991-07-17",
      "place": "London Economic Summit",
      "public_source_basis": "Public Papers: Bush, 1991, p. 907",
      "schedule_or_diary_basis": "not supplied",
      "related_full_record_target": "",
      "press_or_ceremony_component": "evening news conference after joint news conference with Gorbachev",
      "participants_or_actors": "Bush; Gorbachev",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 237 footnote 2.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d237",
      "verification_status": "verified_published_summit_public_event_record",
      "variant_forms": [
        "London Economic Summit news conference",
        "Public Papers: Bush, 1991, p. 907"
      ]
    },
    {
      "event_id": "event-v31-d244-public-signing-ceremony-margins",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d244",
      "document_number": "244",
      "unit_scope": "telegram_text",
      "event_family": "summit_working_sequence",
      "event_type": "summit_working_sequence",
      "approved_phrase": "Conversations on the margins of the public signing ceremony 3 p.m.-4 p.m., July 31 in the Kremlin",
      "date_span": "1991-07-31",
      "place": "Kremlin",
      "public_source_basis": "public signing ceremony context in selected delegation telegram",
      "schedule_or_diary_basis": "telegram reports a timed summit working sequence",
      "related_full_record_target": "",
      "press_or_ceremony_component": "public signing ceremony margins",
      "participants_or_actors": "START delegation participants",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 244.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d244",
      "verification_status": "verified_published_summit_public_event_record",
      "variant_forms": [
        "public signing ceremony 3 p.m.-4 p.m., July 31 in the Kremlin",
        "July 1991 Moscow summit"
      ]
    }
  ],
  "events": [
    {
      "event_id": "event-v31-d245-start-signing-remarks",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d245",
      "document_number": "245",
      "unit_scope": "editorial_note",
      "event_family": "summit_travel",
      "event_type": "signing_ceremony",
      "approved_phrase": "Bush and Gorbachev prepared remarks at the START signing ceremony in Moscow",
      "date_span": "1991-07-31",
      "place": "Moscow",
      "public_source_basis": "Public Papers: Bush, 1991, pages 986-987",
      "schedule_or_diary_basis": "timed Moscow summit itinerary in published editorial note",
      "related_full_record_target": "Foreign Relations, 1989-1992, vol. III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "press_or_ceremony_component": "START signing remarks",
      "participants_or_actors": "Bush; Gorbachev",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 245 editorial note.",
      "variant_forms": [
        "START signing ceremony in Moscow",
        "Public Papers: Bush, 1991, pages 986-987"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
      "verification_status": "verified_published_summit_public_event_record"
    },
    {
      "event_id": "event-v31-d237-london-economic-summit-news-conference",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d237",
      "document_number": "237",
      "unit_scope": "follow_on_footnote",
      "event_family": "summit_press",
      "event_type": "news_conference",
      "approved_phrase": "In an evening news conference at the London Economic Summit on July 17",
      "date_span": "1991-07-17",
      "place": "London Economic Summit",
      "public_source_basis": "Public Papers: Bush, 1991, p. 907",
      "schedule_or_diary_basis": "not supplied",
      "related_full_record_target": "",
      "press_or_ceremony_component": "evening news conference after joint news conference with Gorbachev",
      "participants_or_actors": "Bush; Gorbachev",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 237 footnote 2.",
      "variant_forms": [
        "London Economic Summit news conference",
        "Public Papers: Bush, 1991, p. 907"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d237",
      "verification_status": "verified_published_summit_public_event_record"
    },
    {
      "event_id": "event-v31-d244-public-signing-ceremony-margins",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d244",
      "document_number": "244",
      "unit_scope": "telegram_text",
      "event_family": "summit_working_sequence",
      "event_type": "summit_working_sequence",
      "approved_phrase": "Conversations on the margins of the public signing ceremony 3 p.m.-4 p.m., July 31 in the Kremlin",
      "date_span": "1991-07-31",
      "place": "Kremlin",
      "public_source_basis": "public signing ceremony context in selected delegation telegram",
      "schedule_or_diary_basis": "telegram reports a timed summit working sequence",
      "related_full_record_target": "",
      "press_or_ceremony_component": "public signing ceremony margins",
      "participants_or_actors": "START delegation participants",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 244.",
      "variant_forms": [
        "public signing ceremony 3 p.m.-4 p.m., July 31 in the Kremlin",
        "July 1991 Moscow summit"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d244",
      "verification_status": "verified_published_summit_public_event_record"
    },
    {
      "event_id": "event-v01-d206-reagan-un-general-assembly",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d206",
      "document_number": "206",
      "unit_scope": "editorial_note",
      "event_family": "public_address",
      "event_type": "united_nations_address",
      "approved_phrase": "On September 24, 1984, President Ronald Reagan addressed the United Nations General Assembly in New York",
      "date_span": "1984-09-24",
      "place": "General Assembly Hall at the United Nations",
      "public_source_basis": "Public Papers: Reagan, 1984, Book II, pages 1355-1361",
      "schedule_or_diary_basis": "Reagan personal diary entry",
      "related_full_record_target": "",
      "press_or_ceremony_component": "public address",
      "participants_or_actors": "Reagan; United Nations General Assembly",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 206 editorial note.",
      "variant_forms": [
        "He spoke at 10:31 a.m. in the General Assembly Hall at the United Nations",
        "Public Papers: Reagan, 1984, Book II, pages 1355-1361"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d206",
      "verification_status": "verified_published_summit_public_event_record"
    },
    {
      "event_id": "event-v01-d33-reagan-cronkite-interview",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d33",
      "document_number": "33",
      "unit_scope": "editorial_note",
      "event_family": "broadcast_interview",
      "event_type": "television_interview",
      "approved_phrase": "The interview took place in the Oval Office from 1:14 until 2:34 p.m. and was videotaped for broadcast on the CBS television network at 8 p.m. that evening",
      "date_span": "1981-03-03",
      "place": "Oval Office",
      "public_source_basis": "Public Papers: Reagan, 1981, pages 191-202",
      "schedule_or_diary_basis": "Reagan Library, President's Daily Diary",
      "related_full_record_target": "",
      "press_or_ceremony_component": "CBS Evening News interview",
      "participants_or_actors": "Reagan; Walter Cronkite",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 33 editorial note.",
      "variant_forms": [
        "CBS Evening News anchor Walter Cronkite",
        "Public Papers: Reagan, 1981, pages 191-202"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d33",
      "verification_status": "verified_published_summit_public_event_record"
    },
    {
      "event_id": "event-v01-d106-reagan-unga-disarmament",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d106",
      "document_number": "106",
      "unit_scope": "source_note",
      "event_family": "public_address",
      "event_type": "united_nations_address",
      "approved_phrase": "The President spoke at 11:02 a.m. in the General Assembly Hall",
      "date_span": "1982-06-17",
      "place": "General Assembly Hall",
      "public_source_basis": "Public Papers: Reagan, 1982, Book I, pp. 784-789",
      "schedule_or_diary_basis": "Reagan personal diary entry",
      "related_full_record_target": "",
      "press_or_ceremony_component": "United Nations General Assembly Special Session on Disarmament address",
      "participants_or_actors": "Reagan; United Nations General Assembly",
      "source_or_context": "FRUS, 1981-1988, volume I, Chapter 3, Document 106 source note.",
      "variant_forms": [
        "Address by President Reagan Before the United Nations General Assembly Special Session on Disarmament",
        "Public Papers: Reagan, 1982, Book I, pp. 784-789"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/ch3",
      "verification_status": "verified_published_summit_public_event_record"
    }
  ]
}
```

## Selection Balance And Completeness Registry Context

Use this to check principles of selection, chapter or volume scope, excerpted portions, omitted non-scope material, related-volume boundaries, scheduled-publication targets, complete-record-elsewhere claims, withheld-document effects, and known gaps. Treat complete, balanced, representative, or no-other-record claims as comment-only unless target-volume selection-balance evidence and General Editor review support the claim.

```json
{
  "schema_version": "frus-selection-balance-registry-v1",
  "selection_balance_registry_id": "frus-1981-1992-selection-balance-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d150",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/preface",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "scope": "Published FRUS selection, scope, excerpt, omission, related-volume, and scheduled-publication patterns for Reagan and George H.W. Bush annotation sheets.",
  "rule_summary": "Selection-balance and completeness claims are comment-only by default. Use the registry to recognize published scope language, related-volume boundaries, excerpts, omitted non-scope material, and scheduled-publication targets; do not accept claims of complete, balanced, representative, or no-other-record coverage without supplied selection-balance evidence and General Editor review.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "selection_item_id": "selection-v31-preface-focus-policy-negotiation",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/preface",
      "document_number": "",
      "unit_scope": "preface",
      "selection_issue_type": "principles_of_selection",
      "approved_phrase": "The focus of research and selection in this volume was to document how U.S. policymakers and negotiators worked with their Soviet counterparts",
      "coverage_dimension": "policy development and negotiation movement",
      "decision_point_or_scope": "START I negotiating positions, Geneva rounds, forward or backward movement toward agreement, and key NSC/interagency records",
      "related_volume_or_target": "Reagan START I, Bush Soviet Union/Russia/Post-Soviet States volumes, START II/arms-control volumes",
      "selection_status": "published volume-level selection principle",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The START I preface defines the volume's focus and principles of selection rather than proving completeness for any individual annotation sheet.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "focus of research and selection in this volume was to document how U.S. policymakers and negotiators worked with their Soviet counterparts"
      ]
    },
    {
      "selection_item_id": "selection-v31-preface-principles-positions-rounds",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/preface",
      "document_number": "",
      "unit_scope": "preface",
      "selection_issue_type": "principles_of_selection",
      "approved_phrase": "Principles of selection include the documentation related to the development of and substantive changes to U.S. negotiating positions",
      "coverage_dimension": "selection criteria",
      "decision_point_or_scope": "U.S. negotiating positions, Geneva negotiation rounds, and movement toward agreement",
      "related_volume_or_target": "Foreign Relations, 1989-1992, Volume XXXI, START I",
      "selection_status": "published volume-level selection principle",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The preface gives selection criteria; annotation sheets should not convert this into unverified claims that every significant record has been included.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "Principles of selection include documentation related to the development of and substantive changes to U.S. negotiating positions"
      ]
    },
    {
      "selection_item_id": "selection-v31-d73-omitted-non-start",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "document text omission",
      "selection_issue_type": "omitted_non_scope_material",
      "approved_phrase": "[Omitted here are discussions not related to START.]",
      "coverage_dimension": "selected excerpt excludes unrelated topical material",
      "decision_point_or_scope": "START-only excerpt from a broader meeting",
      "related_volume_or_target": "Related Soviet high-level contacts meetings scheduled in Volume III",
      "selection_status": "published explicit omission of non-scope material",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 73 marks omitted discussion outside the START scope, showing that selection notes must state the scope basis rather than imply a complete meeting record.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "Omitted here are discussions not related to START."
      ]
    },
    {
      "selection_item_id": "selection-v31-d73-editor-transcribed-portion",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "source note",
      "selection_issue_type": "excerpt_selection",
      "approved_phrase": "The editor transcribed the portion of the text specifically for this volume.",
      "coverage_dimension": "excerpted source note",
      "decision_point_or_scope": "Only the START-relevant portion of Gates's handwritten notes is printed",
      "related_volume_or_target": "Foreign Relations, 1989-1992, Volume XXXI, START I",
      "selection_status": "published excerpt-selection statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The published source note distinguishes an editor-transcribed portion from the full meeting record.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "editor transcribed the portion of the text specifically for this volume"
      ]
    },
    {
      "selection_item_id": "selection-v31-d150-complete-memcon-vol-iii",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d150",
      "document_number": "150",
      "unit_scope": "source note",
      "selection_issue_type": "complete_record_elsewhere",
      "approved_phrase": "The complete memorandum of conversation is scheduled for publication in Foreign Relations, 1989-1992, vol. III",
      "coverage_dimension": "excerpt versus complete record",
      "decision_point_or_scope": "START-relevant portion printed in START I; complete regional/economic discussion routed to high-level contacts volume",
      "related_volume_or_target": "Foreign Relations, 1989-1992, vol. III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "selection_status": "published complete-record-elsewhere statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 150 identifies the complete memorandum as scheduled for another volume; the checker should preserve the related-volume boundary and not convert it into a completeness claim for START I.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d150",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "complete memorandum of conversation is scheduled for publication in Foreign Relations, 1989-1992, vol. III"
      ]
    },
    {
      "selection_item_id": "selection-v31-d9-nsr-12-vol-xxviii",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "follow-on footnote",
      "selection_issue_type": "related_volume_boundary",
      "approved_phrase": "NSR-12, dated March 3, \"Review of National Defense Strategy,\" is scheduled for publication in Foreign Relations, 1989-1992, vol. XXVIII",
      "coverage_dimension": "related NSR target",
      "decision_point_or_scope": "National-defense strategy review belongs to a different Bush national-security-policy volume",
      "related_volume_or_target": "Foreign Relations, 1989-1992, vol. XXVIII, National Security Policy, 1989-1992",
      "selection_status": "published related-volume scheduled-publication statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 9 models a related-volume publication target and a separate printed-as-document target in the same footnote apparatus.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_selection_record",
      "variant_forms": [
        "NSR-12 is scheduled for publication in Foreign Relations, 1989-1992, vol. XXVIII"
      ]
    }
  ],
  "records": [
    {
      "selection_item_id": "selection-v31-preface-focus-policy-negotiation",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/preface",
      "document_number": "",
      "unit_scope": "preface",
      "selection_issue_type": "principles_of_selection",
      "approved_phrase": "The focus of research and selection in this volume was to document how U.S. policymakers and negotiators worked with their Soviet counterparts",
      "coverage_dimension": "policy development and negotiation movement",
      "decision_point_or_scope": "START I negotiating positions, Geneva rounds, forward or backward movement toward agreement, and key NSC/interagency records",
      "related_volume_or_target": "Reagan START I, Bush Soviet Union/Russia/Post-Soviet States volumes, START II/arms-control volumes",
      "selection_status": "published volume-level selection principle",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The START I preface defines the volume's focus and principles of selection rather than proving completeness for any individual annotation sheet.",
      "variant_forms": [
        "focus of research and selection in this volume was to document how U.S. policymakers and negotiators worked with their Soviet counterparts"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v31-preface-principles-positions-rounds",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/preface",
      "document_number": "",
      "unit_scope": "preface",
      "selection_issue_type": "principles_of_selection",
      "approved_phrase": "Principles of selection include the documentation related to the development of and substantive changes to U.S. negotiating positions",
      "coverage_dimension": "selection criteria",
      "decision_point_or_scope": "U.S. negotiating positions, Geneva negotiation rounds, and movement toward agreement",
      "related_volume_or_target": "Foreign Relations, 1989-1992, Volume XXXI, START I",
      "selection_status": "published volume-level selection principle",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The preface gives selection criteria; annotation sheets should not convert this into unverified claims that every significant record has been included.",
      "variant_forms": [
        "Principles of selection include documentation related to the development of and substantive changes to U.S. negotiating positions"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v31-d73-omitted-non-start",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "document text omission",
      "selection_issue_type": "omitted_non_scope_material",
      "approved_phrase": "[Omitted here are discussions not related to START.]",
      "coverage_dimension": "selected excerpt excludes unrelated topical material",
      "decision_point_or_scope": "START-only excerpt from a broader meeting",
      "related_volume_or_target": "Related Soviet high-level contacts meetings scheduled in Volume III",
      "selection_status": "published explicit omission of non-scope material",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 73 marks omitted discussion outside the START scope, showing that selection notes must state the scope basis rather than imply a complete meeting record.",
      "variant_forms": [
        "Omitted here are discussions not related to START."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v31-d73-editor-transcribed-portion",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d73",
      "document_number": "73",
      "unit_scope": "source note",
      "selection_issue_type": "excerpt_selection",
      "approved_phrase": "The editor transcribed the portion of the text specifically for this volume.",
      "coverage_dimension": "excerpted source note",
      "decision_point_or_scope": "Only the START-relevant portion of Gates's handwritten notes is printed",
      "related_volume_or_target": "Foreign Relations, 1989-1992, Volume XXXI, START I",
      "selection_status": "published excerpt-selection statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The published source note distinguishes an editor-transcribed portion from the full meeting record.",
      "variant_forms": [
        "editor transcribed the portion of the text specifically for this volume"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d73",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v31-d150-complete-memcon-vol-iii",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d150",
      "document_number": "150",
      "unit_scope": "source note",
      "selection_issue_type": "complete_record_elsewhere",
      "approved_phrase": "The complete memorandum of conversation is scheduled for publication in Foreign Relations, 1989-1992, vol. III",
      "coverage_dimension": "excerpt versus complete record",
      "decision_point_or_scope": "START-relevant portion printed in START I; complete regional/economic discussion routed to high-level contacts volume",
      "related_volume_or_target": "Foreign Relations, 1989-1992, vol. III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "selection_status": "published complete-record-elsewhere statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 150 identifies the complete memorandum as scheduled for another volume; the checker should preserve the related-volume boundary and not convert it into a completeness claim for START I.",
      "variant_forms": [
        "complete memorandum of conversation is scheduled for publication in Foreign Relations, 1989-1992, vol. III"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d150",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v31-d9-nsr-12-vol-xxviii",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "follow-on footnote",
      "selection_issue_type": "related_volume_boundary",
      "approved_phrase": "NSR-12, dated March 3, \"Review of National Defense Strategy,\" is scheduled for publication in Foreign Relations, 1989-1992, vol. XXVIII",
      "coverage_dimension": "related NSR target",
      "decision_point_or_scope": "National-defense strategy review belongs to a different Bush national-security-policy volume",
      "related_volume_or_target": "Foreign Relations, 1989-1992, vol. XXVIII, National Security Policy, 1989-1992",
      "selection_status": "published related-volume scheduled-publication statement",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Document 9 models a related-volume publication target and a separate printed-as-document target in the same footnote apparatus.",
      "variant_forms": [
        "NSR-12 is scheduled for publication in Foreign Relations, 1989-1992, vol. XXVIII"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v44p1-preface-reagan-related-volumes",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/preface",
      "document_number": "",
      "unit_scope": "preface",
      "selection_issue_type": "chapter_or_volume_scope",
      "approved_phrase": "These volumes are closely linked to the four volumes in the subseries devoted to Reagan's Soviet policies",
      "coverage_dimension": "related-volume context",
      "decision_point_or_scope": "Strategic Defense Initiative and Strategic Modernization Program in relation to Soviet policy and arms-control volumes",
      "related_volume_or_target": "Reagan Soviet policy volumes, START I, INF, and Global Issues I",
      "selection_status": "published volume-scope relationship",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "The Reagan National Security Policy preface models related-volume boundaries for a thematic/chronological split.",
      "variant_forms": [
        "closely linked to the four volumes in the subseries devoted to Reagan's Soviet policies"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/preface",
      "verification_status": "verified_published_selection_record"
    },
    {
      "selection_item_id": "selection-v01-d316-trade-scheduled",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d316",
      "document_number": "316",
      "unit_scope": "follow-on footnote",
      "selection_issue_type": "scheduled_publication_boundary",
      "approved_phrase": "Documentation concerning the agreement is scheduled for publication in Foreign Relations, 1981-1988, vol. XXXVII",
      "coverage_dimension": "related trade-volume boundary",
      "decision_point_or_scope": "U.S.-Canada Free Trade Agreement documentation belongs in the Reagan trade volume",
      "related_volume_or_target": "Foreign Relations, 1981-1988, vol. XXXVII, Trade; Monetary Policy; Industrialized Country Cooperation, 1985-1988",
      "selection_status": "published scheduled-publication boundary",
      "blocking_posture": "comment_only_for_sheet_claims",
      "source_or_context": "Reagan Foundations Document 316 models related-volume routing for a substantial issue mentioned in a broad foreign-policy paper.",
      "variant_forms": [
        "Documentation concerning the agreement is scheduled for publication in Foreign Relations, 1981-1988, vol. XXXVII, Trade"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d316",
      "verification_status": "verified_published_selection_record"
    }
  ]
}
```

## Decision Process And Directive Registry Context

Use this to check NSR, NSD, NSDD, NSSD, PCC, DC, NSC meeting, tab, tasking, record-of-decision, interagency-paper, directive-heading, scheduled-publication, and decision-stage language. Treat directive numbers, committee/body names, tabs, and decision stages as comment-only unless the target-volume decision-process registry proves the exact direct edit.

```json
{
  "schema_version": "frus-decision-process-registry-v1",
  "decision_process_registry_id": "frus-1981-1992-decision-process-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d128",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d129",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d103"
  ],
  "scope": "Published FRUS decision-process, directive, interagency-tasking, committee, tab, and scheduled-publication patterns for Reagan and George H.W. Bush annotation sheets.",
  "rule_summary": "Decision-process and directive claims are comment-only by default. Use the registry to verify NSR, NSD, NSDD, NSSD, PCC, DC, NSC meeting, tab, tasking, decision-stage, distribution, and scheduled-publication language; do not alter directive numbers, bodies, dates, tabs, or decision stages unless target-volume evidence proves the exact form.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "decision_process_id": "decision-v31-d9-source-nsr14-file",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "source note",
      "process_type": "national_security_review_file",
      "approved_phrase": "NSR–14—April 03, 1989—Review of U.S. Arms Control Policies [1]",
      "process_identifier": "NSR-14",
      "process_body": "National Security Council H-Files, NSR Files",
      "decision_stage": "source-file identifier",
      "source_or_context": "Document 9 source note uses the NSR file title as part of the controlling Bush Library source path.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "NSR-14-April 03, 1989-Review of U.S. Arms Control Policies [1]"
      ]
    },
    {
      "decision_process_id": "decision-v31-d9-nsr12-scheduled",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "footnote 2",
      "process_type": "scheduled_publication_boundary",
      "approved_phrase": "NSR–12, dated March 3, “Review of National Defense Strategy,” is scheduled for publication",
      "process_identifier": "NSR-12",
      "process_body": "National Security Review",
      "decision_stage": "scheduled publication in related volume",
      "source_or_context": "Document 9 identifies NSR-12 as a related national-security-policy directive scheduled for another volume.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "NSR-12, dated March 3, \"Review of National Defense Strategy,\" is scheduled for publication"
      ]
    },
    {
      "decision_process_id": "decision-v31-d9-draft-nsr-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "document text",
      "process_type": "draft_directive_attached",
      "approved_phrase": "A draft National Security Review providing such direction is attached",
      "process_identifier": "draft NSR",
      "process_body": "National Security Review",
      "decision_stage": "draft attached for presidential signature",
      "source_or_context": "Document 9 models language for an attached draft National Security Review and the target printed document.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "draft National Security Review providing such direction is attached"
      ]
    },
    {
      "decision_process_id": "decision-v31-d10-heading-nsr14",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document heading",
      "process_type": "national_security_review",
      "approved_phrase": "National Security Review 14",
      "process_identifier": "NSR-14",
      "process_body": "National Security Review",
      "decision_stage": "issued directive heading",
      "source_or_context": "Document 10 heading prints the directive as National Security Review 14.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "NSR 14"
      ]
    },
    {
      "decision_process_id": "decision-v31-d10-guidance-review",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document text",
      "process_type": "directive_guidance",
      "approved_phrase": "This National Security Review sets forth guidance for the arms control review",
      "process_identifier": "NSR-14",
      "process_body": "National Security Review",
      "decision_stage": "guidance issued",
      "source_or_context": "Document 10 models the formula for a National Security Review setting guidance.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "National Security Review sets forth guidance"
      ]
    },
    {
      "decision_process_id": "decision-v31-d10-arms-control-pcc",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document text",
      "process_type": "policy_coordinating_committee_tasking",
      "approved_phrase": "The Arms Control PCC should forward a recommended date for the resumption of the Nuclear and Space Talks",
      "process_identifier": "Arms Control PCC",
      "process_body": "Policy Coordinating Committee",
      "decision_stage": "tasking and recommendation deadline",
      "source_or_context": "Document 10 uses PCC tasking language with a specified recommendation deadline.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "Arms Control PCC should forward a recommended date"
      ]
    },
    {
      "decision_process_id": "decision-v31-d10-record-of-decision",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "Tab A",
      "process_type": "record_of_decision",
      "approved_phrase": "The PCC Executive Secretary will prepare and forward within one week after the meeting a record of decision",
      "process_identifier": "PCC record of decision",
      "process_body": "Arms Control PCC",
      "decision_stage": "post-meeting record of decision",
      "source_or_context": "Document 10 Tab A models PCC record-of-decision language.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "PCC Executive Secretary will prepare and forward within one week after the meeting a record of decision"
      ]
    },
    {
      "decision_process_id": "decision-v31-d21-nsr12-part-iv",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d21",
      "document_number": "21",
      "unit_scope": "document heading",
      "process_type": "national_security_review_response",
      "approved_phrase": "NSR–12, PART IV",
      "process_identifier": "NSR-12 Part IV",
      "process_body": "Ad Hoc Interagency Group on National Defense Strategy",
      "decision_stage": "interagency response paper",
      "source_or_context": "Document 21 prints a paper prepared as Part IV of the NSR-12 response.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "NSR-12, PART IV"
      ]
    },
    {
      "decision_process_id": "decision-v31-d21-nsc-dc-source",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d21",
      "document_number": "21",
      "unit_scope": "source note",
      "process_type": "deputies_committee_file",
      "approved_phrase": "NSC/DC 027—May 20, 1989—NSC/DC Meeting on Security and Arms Control",
      "process_identifier": "NSC/DC 027",
      "process_body": "NSC Deputies Committee",
      "decision_stage": "meeting file identifier",
      "source_or_context": "Document 21 source note preserves the NSC/DC file identifier and meeting title.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_decision_process_record",
      "variant_forms": [
        "NSC/DC 027-May 20, 1989-NSC/DC Meeting on Security and Arms Control"
      ]
    }
  ],
  "records": [
    {
      "decision_process_id": "decision-v31-d9-source-nsr14-file",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "source note",
      "process_type": "national_security_review_file",
      "approved_phrase": "NSR–14—April 03, 1989—Review of U.S. Arms Control Policies [1]",
      "process_identifier": "NSR-14",
      "process_body": "National Security Council H-Files, NSR Files",
      "decision_stage": "source-file identifier",
      "source_or_context": "Document 9 source note uses the NSR file title as part of the controlling Bush Library source path.",
      "variant_forms": [
        "NSR-14-April 03, 1989-Review of U.S. Arms Control Policies [1]"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d9-nsr12-scheduled",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "footnote 2",
      "process_type": "scheduled_publication_boundary",
      "approved_phrase": "NSR–12, dated March 3, “Review of National Defense Strategy,” is scheduled for publication",
      "process_identifier": "NSR-12",
      "process_body": "National Security Review",
      "decision_stage": "scheduled publication in related volume",
      "source_or_context": "Document 9 identifies NSR-12 as a related national-security-policy directive scheduled for another volume.",
      "variant_forms": [
        "NSR-12, dated March 3, \"Review of National Defense Strategy,\" is scheduled for publication"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d9-draft-nsr-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d9",
      "document_number": "9",
      "unit_scope": "document text",
      "process_type": "draft_directive_attached",
      "approved_phrase": "A draft National Security Review providing such direction is attached",
      "process_identifier": "draft NSR",
      "process_body": "National Security Review",
      "decision_stage": "draft attached for presidential signature",
      "source_or_context": "Document 9 models language for an attached draft National Security Review and the target printed document.",
      "variant_forms": [
        "draft National Security Review providing such direction is attached"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d10-heading-nsr14",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document heading",
      "process_type": "national_security_review",
      "approved_phrase": "National Security Review 14",
      "process_identifier": "NSR-14",
      "process_body": "National Security Review",
      "decision_stage": "issued directive heading",
      "source_or_context": "Document 10 heading prints the directive as National Security Review 14.",
      "variant_forms": [
        "NSR 14"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d10-guidance-review",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document text",
      "process_type": "directive_guidance",
      "approved_phrase": "This National Security Review sets forth guidance for the arms control review",
      "process_identifier": "NSR-14",
      "process_body": "National Security Review",
      "decision_stage": "guidance issued",
      "source_or_context": "Document 10 models the formula for a National Security Review setting guidance.",
      "variant_forms": [
        "National Security Review sets forth guidance"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d10-arms-control-pcc",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "document text",
      "process_type": "policy_coordinating_committee_tasking",
      "approved_phrase": "The Arms Control PCC should forward a recommended date for the resumption of the Nuclear and Space Talks",
      "process_identifier": "Arms Control PCC",
      "process_body": "Policy Coordinating Committee",
      "decision_stage": "tasking and recommendation deadline",
      "source_or_context": "Document 10 uses PCC tasking language with a specified recommendation deadline.",
      "variant_forms": [
        "Arms Control PCC should forward a recommended date"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d10-record-of-decision",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d10",
      "document_number": "10",
      "unit_scope": "Tab A",
      "process_type": "record_of_decision",
      "approved_phrase": "The PCC Executive Secretary will prepare and forward within one week after the meeting a record of decision",
      "process_identifier": "PCC record of decision",
      "process_body": "Arms Control PCC",
      "decision_stage": "post-meeting record of decision",
      "source_or_context": "Document 10 Tab A models PCC record-of-decision language.",
      "variant_forms": [
        "PCC Executive Secretary will prepare and forward within one week after the meeting a record of decision"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d21-nsr12-part-iv",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d21",
      "document_number": "21",
      "unit_scope": "document heading",
      "process_type": "national_security_review_response",
      "approved_phrase": "NSR–12, PART IV",
      "process_identifier": "NSR-12 Part IV",
      "process_body": "Ad Hoc Interagency Group on National Defense Strategy",
      "decision_stage": "interagency response paper",
      "source_or_context": "Document 21 prints a paper prepared as Part IV of the NSR-12 response.",
      "variant_forms": [
        "NSR-12, PART IV"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v31-d21-nsc-dc-source",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d21",
      "document_number": "21",
      "unit_scope": "source note",
      "process_type": "deputies_committee_file",
      "approved_phrase": "NSC/DC 027—May 20, 1989—NSC/DC Meeting on Security and Arms Control",
      "process_identifier": "NSC/DC 027",
      "process_body": "NSC Deputies Committee",
      "decision_stage": "meeting file identifier",
      "source_or_context": "Document 21 source note preserves the NSC/DC file identifier and meeting title.",
      "variant_forms": [
        "NSC/DC 027-May 20, 1989-NSC/DC Meeting on Security and Arms Control"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v44p1-d128-sign-nsdd-tab-a",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d128",
      "document_number": "128",
      "unit_scope": "recommendation",
      "process_type": "national_security_decision_directive_signature",
      "approved_phrase": "That you sign the National Security Decision Directive at Tab A",
      "process_identifier": "NSDD at Tab A",
      "process_body": "National Security Decision Directive",
      "decision_stage": "recommendation for presidential signature",
      "source_or_context": "Document 128 models a recommendation to sign the attached NSDD at Tab A.",
      "variant_forms": [
        "sign the National Security Decision Directive at Tab A"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d128",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v44p1-d129-heading-nsdd236",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d129",
      "document_number": "129",
      "unit_scope": "document heading",
      "process_type": "national_security_decision_directive",
      "approved_phrase": "National Security Decision Directive 236",
      "process_identifier": "NSDD-236",
      "process_body": "National Security Decision Directive",
      "decision_stage": "issued directive heading",
      "source_or_context": "Document 129 heading prints the directive as National Security Decision Directive 236.",
      "variant_forms": [
        "NSDD 236"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d129",
      "verification_status": "verified_published_decision_process_record"
    },
    {
      "decision_process_id": "decision-v01-d103-nssd4-scheduled",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d103",
      "document_number": "103",
      "unit_scope": "footnote 5",
      "process_type": "national_security_study_directive_boundary",
      "approved_phrase": "NSSD 4–82, “US Strategy for the Near East and Southwest Asia,” issued on March 19; scheduled for publication",
      "process_identifier": "NSSD-4-82",
      "process_body": "National Security Study Directive",
      "decision_stage": "issued and scheduled for related volume",
      "source_or_context": "Document 103 models NSSD scheduled-publication boundary language for a related regional volume.",
      "variant_forms": [
        "NSSD 4-82, \"US Strategy for the Near East and Southwest Asia,\" issued on March 19; scheduled for publication"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d103",
      "verification_status": "verified_published_decision_process_record"
    }
  ]
}
```

## Public Source And Public Diplomacy Registry Context

Use this to check speeches, public remarks, press releases, press conferences, briefings, interviews, broadcasts, testimony, Public Papers, Department of State Bulletin/Dispatch, Congressional Record, official transcripts, newspaper excerpts, full-text targets, archival draft or briefing-file context, diary context, and selected-versus-supplemental public-source status. Do not change publication details, delivery or broadcast basis, full-text targets, archival draft context, or selected-public-document status unless the target-volume public-source registry proves the direct edit.

```json
{
  "schema_version": "frus-public-source-registry-v1",
  "public_source_registry_id": "frus-1981-1992-public-source-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d302",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d192",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d66"
  ],
  "scope": "Published FRUS public-source, public-diplomacy, Public Papers, Department of State Bulletin/Dispatch, press, selected public remarks, and archival/public-source context patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "public_source_id": "pub-v31-d245-public-papers-signing-remarks",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d245",
      "document_number": "245",
      "unit_scope": "editorial note",
      "public_source_type": "public_papers_citation",
      "approved_phrase": "Public Papers: Bush, 1991, pages 986-987",
      "public_event_or_document": "Bush and Gorbachev prepared remarks at the START signing ceremony in Moscow",
      "publication_or_broadcast_basis": "Public Papers: Bush, 1991",
      "delivery_or_release_date": "1991-07-31",
      "selected_or_supplemental_status": "supplemental public-source citation in editorial note",
      "full_text_or_source_target": "Prepared remarks quoted in the editorial note",
      "archival_or_draft_context": "",
      "relationship_to_document": "public remarks contextualize the treaty signing ceremony",
      "source_or_context": "Editorial note cites the published Public Papers pages for Gorbachev and Bush remarks during the START signing ceremony.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
      "verification_status": "verified_published_public_source_record",
      "variant_forms": [
        "Public Papers: Bush, 1991, pp. 986-987",
        "Public Papers: Bush, 1991, page 987"
      ]
    },
    {
      "public_source_id": "pub-v31-d246-dispatch-treaty-text",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "source note",
      "public_source_type": "department_dispatch",
      "approved_phrase": "Source: Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16.",
      "public_event_or_document": "START treaty text",
      "publication_or_broadcast_basis": "Department of State Dispatch Supplement",
      "delivery_or_release_date": "1991-10-01",
      "selected_or_supplemental_status": "selected public/printed source document",
      "full_text_or_source_target": "Treaty text and associated annexes in Department of State Dispatch Supplement",
      "archival_or_draft_context": "",
      "relationship_to_document": "source note for the selected treaty text",
      "source_or_context": "Published FRUS source note uses the Department of State Dispatch Supplement as the controlling printed source for the selected treaty text.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_public_source_record",
      "variant_forms": [
        "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16",
        "Source: Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5"
      ]
    }
  ],
  "records": [
    {
      "public_source_id": "pub-v31-d245-public-papers-signing-remarks",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d245",
      "document_number": "245",
      "unit_scope": "editorial note",
      "public_source_type": "public_papers_citation",
      "approved_phrase": "Public Papers: Bush, 1991, pages 986-987",
      "public_event_or_document": "Bush and Gorbachev prepared remarks at the START signing ceremony in Moscow",
      "publication_or_broadcast_basis": "Public Papers: Bush, 1991",
      "delivery_or_release_date": "1991-07-31",
      "selected_or_supplemental_status": "supplemental public-source citation in editorial note",
      "full_text_or_source_target": "Prepared remarks quoted in the editorial note",
      "archival_or_draft_context": "",
      "relationship_to_document": "public remarks contextualize the treaty signing ceremony",
      "source_or_context": "Editorial note cites the published Public Papers pages for Gorbachev and Bush remarks during the START signing ceremony.",
      "variant_forms": [
        "Public Papers: Bush, 1991, pp. 986-987",
        "Public Papers: Bush, 1991, page 987"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
      "verification_status": "verified_published_public_source_record"
    },
    {
      "public_source_id": "pub-v31-d246-dispatch-treaty-text",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "source note",
      "public_source_type": "department_dispatch",
      "approved_phrase": "Source: Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16.",
      "public_event_or_document": "START treaty text",
      "publication_or_broadcast_basis": "Department of State Dispatch Supplement",
      "delivery_or_release_date": "1991-10-01",
      "selected_or_supplemental_status": "selected public/printed source document",
      "full_text_or_source_target": "Treaty text and associated annexes in Department of State Dispatch Supplement",
      "archival_or_draft_context": "",
      "relationship_to_document": "source note for the selected treaty text",
      "source_or_context": "Published FRUS source note uses the Department of State Dispatch Supplement as the controlling printed source for the selected treaty text.",
      "variant_forms": [
        "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16",
        "Source: Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_public_source_record"
    },
    {
      "public_source_id": "pub-v01-d146-public-papers-remarks",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d146",
      "document_number": "146",
      "unit_scope": "source note",
      "public_source_type": "selected_public_remarks",
      "approved_phrase": "Source: Public Papers: Reagan, 1983, Book I, pp. 479-484. All brackets are in the original. The President spoke at 12:55 p.m. in the International Ballroom at the Beverly Hilton Hotel at a luncheon hosted by the Los Angeles World Affairs Council.",
      "public_event_or_document": "Remarks by President Reagan at the Los Angeles World Affairs Council luncheon",
      "publication_or_broadcast_basis": "Public Papers: Reagan, 1983, Book I",
      "delivery_or_release_date": "1983-03-31",
      "selected_or_supplemental_status": "selected public remarks document",
      "full_text_or_source_target": "Remarks selected as a FRUS document",
      "archival_or_draft_context": "",
      "relationship_to_document": "source note for selected public remarks",
      "source_or_context": "Source note supplies the Public Papers source, original-bracket status, delivery time, venue, and host organization.",
      "variant_forms": [
        "Public Papers: Reagan, 1983, Book I, pp. 479-484",
        "The President spoke at 12:55 p.m. in the International Ballroom at the Beverly Hilton Hotel"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
      "verification_status": "verified_published_public_source_record"
    },
    {
      "public_source_id": "pub-v01-d302-press-briefing-room",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d302",
      "document_number": "302",
      "unit_scope": "source note",
      "public_source_type": "press_briefing",
      "approved_phrase": "Source: Public Papers: Reagan, 1987, Book I, pp. 581-582. The President spoke to reporters at 1:46 p.m. in the Briefing Room at the White House.",
      "public_event_or_document": "Remarks by President Reagan to reporters on the Persian Gulf",
      "publication_or_broadcast_basis": "Public Papers: Reagan, 1987, Book I",
      "delivery_or_release_date": "1987-05-19",
      "selected_or_supplemental_status": "selected public remarks document",
      "full_text_or_source_target": "Remarks selected as a FRUS document",
      "archival_or_draft_context": "",
      "relationship_to_document": "source note for selected press remarks",
      "source_or_context": "Source note identifies the Public Papers source and the public delivery setting.",
      "variant_forms": [
        "Public Papers: Reagan, 1987, Book I, pp. 581-582",
        "The President spoke to reporters at 1:46 p.m. in the Briefing Room at the White House."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d302",
      "verification_status": "verified_published_public_source_record"
    },
    {
      "public_source_id": "pub-v01-d192-state-bulletin-cd",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d192",
      "document_number": "192",
      "unit_scope": "follow-on footnote",
      "public_source_type": "department_bulletin",
      "approved_phrase": "Bush's address, in addition to a summary of the U.S. draft, is printed in Department of State Bulletin, June 1984, pp. 40-43.",
      "public_event_or_document": "Vice President Bush address to the Conference on Disarmament in Geneva",
      "publication_or_broadcast_basis": "Department of State Bulletin",
      "delivery_or_release_date": "1984-04-18",
      "selected_or_supplemental_status": "supplemental public-source citation in follow-on footnote",
      "full_text_or_source_target": "Address and summary of U.S. draft chemical weapons treaty",
      "archival_or_draft_context": "",
      "relationship_to_document": "public-source follow-on citation",
      "source_or_context": "Follow-on footnote cites the Department of State Bulletin and Documents on Disarmament for public arms-control material.",
      "variant_forms": [
        "Department of State Bulletin, June 1984, pp. 40-43",
        "Bush's address is printed in Department of State Bulletin"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d192",
      "verification_status": "verified_published_public_source_record"
    },
    {
      "public_source_id": "pub-v01-d66-public-papers-telegram-diary",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d66",
      "document_number": "66",
      "unit_scope": "source note",
      "public_source_type": "archival_speech_file_context",
      "approved_phrase": "Source: Public Papers: Reagan, 1981, pp. 937-944. The President offered these remarks at a luncheon of the World Affairs Council of Philadelphia, speaking at 1:50 p.m. in the Grand Ballroom of the Bellevue Stratford Hotel.",
      "public_event_or_document": "Remarks by President Reagan before the World Affairs Council of Philadelphia",
      "publication_or_broadcast_basis": "Public Papers: Reagan, 1981",
      "delivery_or_release_date": "1981-10-15",
      "selected_or_supplemental_status": "selected public remarks document with archival transmission and diary context",
      "full_text_or_source_target": "Remarks selected as a FRUS document",
      "archival_or_draft_context": "Department transmitted the remarks to diplomatic posts; Reagan diary entry supplies reception context.",
      "relationship_to_document": "source note for selected public remarks plus archival/digital context",
      "source_or_context": "Source note combines Public Papers, delivery details, Department telegram transmission, and diary context without flattening them into one source family.",
      "variant_forms": [
        "Public Papers: Reagan, 1981, pp. 937-944",
        "The Department transmitted the text of the President's remarks to all diplomatic posts in telegram 275404"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d66",
      "verification_status": "verified_published_public_source_record"
    }
  ]
}
```

## Retrospective Account Registry Context

Use this to check memoirs, published or personal diaries, oral histories, later interviews, recollections, press retrospectives, newspaper accounts, author/source, publication, page locator, event match, selected-versus-supplemental status, official-record relationship, corroborating records, and conflict status. Do not let retrospective accounts replace official records; use comment-only unless the target-volume retrospective-account registry proves the exact direct edit.

```json
{
  "schema_version": "frus-retrospective-account-registry-v1",
  "retrospective_account_registry_id": "frus-reagan-foundations-retrospective-account-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d18",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d34",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d236",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d260",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d282",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "scope": "Sample registry of published Reagan Foundations retrospective-account forms for checking memoir, diary, oral-history, later-interview, recollection, and press-retrospective apparatus without letting those accounts replace the official record.",
  "rule_summary": "Treat memoirs, published or personal diaries, oral histories, later interviews, press retrospectives, and recollections as attributed supplemental context unless the target-volume registry proves they are selected evidence. Preserve author/source, title, page/locator, event match, official-record relationship, selected/supplemental status, corroborating record, and conflict status before any direct edit.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "retrospective_account_id": "retro-v01-d18-haig-caveat-offer",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d18",
      "document_number": "18",
      "unit_scope": "editorial note",
      "record_type": "memoir_recollection",
      "approved_phrase": "In his memoir of his tenure as Secretary of State, Haig noted",
      "account_author_or_source": "Alexander M. Haig, Jr.",
      "publication_or_collection": "Caveat",
      "page_or_locator": "pages 12, 13-14; pages 37-52",
      "event_or_document_described": "Reagan offer to Haig and Haig confirmation hearings",
      "official_record_relationship": "supplements Senate hearing and confirmation chronology",
      "selected_or_supplemental_status": "supplemental_recollection",
      "corroborating_record": "Senate hearing transcript and Senate vote chronology",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "Haig, Caveat, pages 12, 13-14",
        "For Haig's recollection of the hearings, see Caveat, pages 37-52"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d18",
      "verification_status": "verified_published_retrospective_account"
    },
    {
      "retrospective_account_id": "retro-v01-d34-haig-middle-east",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d34",
      "document_number": "34",
      "unit_scope": "footnote 2",
      "record_type": "memoir_recollection",
      "approved_phrase": "In his memoir, Haig explained the genesis of the visit",
      "account_author_or_source": "Alexander M. Haig, Jr.",
      "publication_or_collection": "Caveat",
      "page_or_locator": "p. 89",
      "event_or_document_described": "Genesis of Haig Middle East trip",
      "official_record_relationship": "supplements scheduled trip documentation, Department of State Bulletin remarks, and attached Cairo telegram",
      "selected_or_supplemental_status": "supplemental_recollection",
      "corroborating_record": "travel schedule, Department of State Bulletin, attached telegram 5379 from Cairo",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "Haig, Caveat, p. 89"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d34",
      "verification_status": "verified_published_retrospective_account"
    },
    {
      "retrospective_account_id": "retro-v01-d236-reagan-diary-shultz-memoir",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d236",
      "document_number": "236",
      "unit_scope": "source note",
      "record_type": "published_personal_diary_and_memoir",
      "approved_phrase": "In his personal diary entry for March 11, the President wrote",
      "account_author_or_source": "Ronald Reagan; George P. Shultz",
      "publication_or_collection": "The Reagan Diaries; Turmoil and Triumph",
      "page_or_locator": "Reagan Diaries vol. I, p. 434; Shultz memoir p. 527",
      "event_or_document_described": "March 11, 1985 Shultz meeting with Reagan after Chernenko's death",
      "official_record_relationship": "supplements talking points, President's Daily Diary, and related document cross-reference",
      "selected_or_supplemental_status": "supplemental_diary_and_recollection",
      "corroborating_record": "President's Daily Diary and selected talking points",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "In his memoir, Shultz wrote of the March 11 meeting",
        "Brinkley, ed., The Reagan Diaries, vol. I, January 1981-October 1985, p. 434",
        "Shultz, Turmoil and Triumph, p. 527"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d236",
      "verification_status": "verified_published_retrospective_account"
    },
    {
      "retrospective_account_id": "retro-v01-d260-shultz-arms-control",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d260",
      "document_number": "260",
      "unit_scope": "footnote 3",
      "record_type": "memoir_recollection",
      "approved_phrase": "In his memoir, Shultz described the segment of the meeting devoted to U.S.-Soviet issues",
      "account_author_or_source": "George P. Shultz",
      "publication_or_collection": "Turmoil and Triumph",
      "page_or_locator": "pp. 702-703",
      "event_or_document_described": "January 24, 1986 meeting segment on U.S.-Soviet arms control",
      "official_record_relationship": "supplements prepared paper and President's Daily Diary meeting evidence",
      "selected_or_supplemental_status": "supplemental_recollection",
      "corroborating_record": "Secretary's Meeting with the President paper and President's Daily Diary",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "Shultz, Turmoil and Triumph, pp. 702-703"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d260",
      "verification_status": "verified_published_retrospective_account"
    },
    {
      "retrospective_account_id": "retro-v01-d282-shultz-iran-press",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d282",
      "document_number": "282",
      "unit_scope": "source note",
      "record_type": "memoir_recollection",
      "approved_phrase": "In his memoir, Shultz described his reaction to the President's November 19 press conference",
      "account_author_or_source": "George P. Shultz",
      "publication_or_collection": "Turmoil and Triumph",
      "page_or_locator": "pp. 830-831",
      "event_or_document_described": "Shultz reaction to Reagan November 19, 1986 Iran arms news conference",
      "official_record_relationship": "supplements handwritten talking points and Public Papers press-conference text",
      "selected_or_supplemental_status": "supplemental_recollection",
      "corroborating_record": "Hill handwritten talking points and Public Papers press-conference text",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "Shultz, Turmoil and Triumph, pp. 830-831"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d282",
      "verification_status": "verified_published_retrospective_account"
    },
    {
      "retrospective_account_id": "retro-v01-d316-reagan-diary-schedule",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d316",
      "document_number": "316",
      "unit_scope": "source note",
      "record_type": "published_personal_diary",
      "approved_phrase": "in his personal diary entry for January 6, the President noted",
      "account_author_or_source": "Ronald Reagan diary edited by Douglas Brinkley",
      "publication_or_collection": "The Reagan Diaries",
      "page_or_locator": "vol. II, p. 822",
      "event_or_document_described": "January 6, 1988 meeting with Shultz on foreign policy schedule",
      "official_record_relationship": "supplements no-minutes note, President's Daily Diary, and Shultz meeting paper",
      "selected_or_supplemental_status": "supplemental_diary_context",
      "corroborating_record": "President's Daily Diary and Shultz meeting paper",
      "conflict_status": "no_conflict_noted",
      "variant_forms": [
        "Brinkley, ed., The Reagan Diaries, vol. II, November 1985-January 1989, p. 822"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d316",
      "verification_status": "verified_published_retrospective_account"
    }
  ]
}
```

## Treaty And Legal Instrument Registry Context

Use this to check treaty text, protocols, annexes, memoranda of understanding, associated-but-not-integral documents, Senate transmittal packages, ratification, entry-into-force, legal-authority, and draft treaty-package language. Do not change component identity, integral/associated status, source basis, legal process, ratification, or entry-into-force language unless the target-volume treaty registry proves the direct edit.

```json
{
  "schema_version": "frus-treaty-registry-v1",
  "treaty_registry_id": "frus-1981-1992-treaty-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d242",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d276",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d277",
    "https://history.state.gov/historicaldocuments/frus1981-88v11/d251",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d64"
  ],
  "scope": "Published FRUS treaty, protocol, annex, memorandum-of-understanding, associated-document, Senate transmittal, draft treaty, arms-control technical-verification, and legal-instrument patterns for Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "treaty_id": "treaty-v31-d246-start-text-dispatch",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "source_note",
      "treaty_component_type": "treaty_text",
      "approved_phrase": "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16",
      "instrument_or_package": "START I treaty text",
      "component_label": "Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms",
      "signature_or_publication_date": "1991-07-31",
      "publication_or_source_basis": "Department of State Dispatch Supplement source note for the published treaty text.",
      "selected_or_supplemental_status": "selected treaty text printed as a FRUS document",
      "integral_or_associated_status": "main body of the Treaty",
      "legal_status_or_process": "signed at Moscow on July 31, 1991",
      "relationship_to_document": "source-note basis for printed treaty text",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 246 source note.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pages 1-16",
        "Department of State Dispatch Supplement, October 1991, Volume 2, Supplement Number 5, pp. 1-16"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-conversion-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on Procedures Governing the Conversion or Elimination of the Items Subject to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Conversion or Elimination Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Conversion or Elimination Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the integral components of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "the Protocol on Procedures Governing Conversion or Elimination",
        "Protocol on Conversion/Elimination"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-mou-database",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "memorandum_of_understanding",
      "approved_phrase": "the Memorandum of Understanding on the Establishment of the Data Base Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms, with 10 annexes (\"Memorandum of Understanding\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Memorandum of Understanding on the Establishment of the Data Base",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the MOU and its annexes as an integral treaty component.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "START Memorandum of Understanding",
        "Memorandum of Understanding (MOU)"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-associated-not-integral",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "associated_document",
      "approved_phrase": "associated with, but not integral parts of, the Treaty",
      "instrument_or_package": "START I associated documents",
      "component_label": "Associated but non-integral treaty documents",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter distinguishes integral treaty components from associated documents provided for Senate information.",
      "selected_or_supplemental_status": "supplemental associated-document context",
      "integral_or_associated_status": "associated with, but not integral parts of, the Treaty",
      "legal_status_or_process": "not submitted for Senate advice and consent to ratification",
      "relationship_to_document": "editorial-note caveat for associated treaty documents",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "associated but not integral parts of the Treaty",
        "associated with but not integral parts of the Treaty"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-telemetry-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on Telemetric Information Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Telemetry Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Telemetry Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the telemetry protocol as an integral component of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "Protocol on Telemetric Information",
        "Telemetry Protocol"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-jcic-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on the Joint Compliance and Inspection Commission Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Joint Compliance and Inspection Commission Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Joint Compliance and Inspection Commission Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the JCIC protocol as an integral component of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "Joint Compliance and Inspection Commission Protocol",
        "JCIC Protocol"
      ]
    },
    {
      "treaty_id": "treaty-v31-d247-inspection-monitoring-regime",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "verification_regime",
      "approved_phrase": "a far-reaching inspection regime, including on-site inspections, special access visits, continuous on-site monitoring of certain facilities, and technical exhibitions",
      "instrument_or_package": "START I treaty implementation and compliance apparatus",
      "component_label": "Inspection, monitoring, and technical-exhibition regime",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter summarizes the START I verification regime.",
      "selected_or_supplemental_status": "implementation and compliance explanation in treaty-submission document",
      "integral_or_associated_status": "verification regime established by the Treaty and related protocols",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "implementation/compliance annotation and editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "inspection regime, including on-site inspections, special access visits, continuous on-site monitoring, and technical exhibitions",
        "on-site inspections, special access visits, continuous on-site monitoring of certain facilities, and technical exhibitions"
      ]
    },
    {
      "treaty_id": "treaty-v31-d242-interpretive-data-telemetry",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d242",
      "document_number": "242",
      "unit_scope": "document_text",
      "treaty_component_type": "technical_definition",
      "approved_phrase": "interpretive data specified in subparagraphs 1(a) and 1(b) of Section II of the telemetry protocol",
      "instrument_or_package": "START I joint statements",
      "component_label": "Joint Statement Concerning Interpretive Data",
      "signature_or_publication_date": "1991-07-29",
      "publication_or_source_basis": "Final START plenary record prints the joint statement concerning interpretive data.",
      "selected_or_supplemental_status": "joint statement included in final START plenary record",
      "integral_or_associated_status": "associated verification statement tied to the telemetry protocol",
      "legal_status_or_process": "presented with final START plenary statements",
      "relationship_to_document": "technical-verification wording in selected document text",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 242.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d242",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "interpretive data specified in Section II of the Telemetry Protocol",
        "interpretive data under the telemetry protocol"
      ]
    },
    {
      "treaty_id": "treaty-v31-d161-heavy-icbm-constraints",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "document_text",
      "treaty_component_type": "arms_control_constraint",
      "approved_phrase": "Ban new silos for heavies, ban downloading of heavies, no increase in launch weight or throw-weight of heavy ICBM s",
      "instrument_or_package": "START I heavy ICBM negotiating package",
      "component_label": "Heavy ICBM constraints",
      "signature_or_publication_date": "1990-06-02",
      "publication_or_source_basis": "Bush START I meeting guidance prints the U.S. position on heavy ICBM constraints.",
      "selected_or_supplemental_status": "negotiating-position text in selected document",
      "integral_or_associated_status": "negotiating constraint linked to heavy ICBM provisions",
      "legal_status_or_process": "pre-signature negotiating position",
      "relationship_to_document": "technical constraint in selected document text and annotation context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 161.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_treaty_record",
      "variant_forms": [
        "ban new silos, ban downloading, no increase in launch weight or throw-weight",
        "no increase in launch weight or throw-weight of heavy ICBMs"
      ]
    }
  ],
  "records": [
    {
      "treaty_id": "treaty-v31-d246-start-text-dispatch",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d246",
      "document_number": "246",
      "unit_scope": "source_note",
      "treaty_component_type": "treaty_text",
      "approved_phrase": "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16",
      "instrument_or_package": "START I treaty text",
      "component_label": "Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms",
      "signature_or_publication_date": "1991-07-31",
      "publication_or_source_basis": "Department of State Dispatch Supplement source note for the published treaty text.",
      "selected_or_supplemental_status": "selected treaty text printed as a FRUS document",
      "integral_or_associated_status": "main body of the Treaty",
      "legal_status_or_process": "signed at Moscow on July 31, 1991",
      "relationship_to_document": "source-note basis for printed treaty text",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 246 source note.",
      "variant_forms": [
        "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pages 1-16",
        "Department of State Dispatch Supplement, October 1991, Volume 2, Supplement Number 5, pp. 1-16"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-conversion-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on Procedures Governing the Conversion or Elimination of the Items Subject to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Conversion or Elimination Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Conversion or Elimination Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the integral components of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "the Protocol on Procedures Governing Conversion or Elimination",
        "Protocol on Conversion/Elimination"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-mou-database",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "memorandum_of_understanding",
      "approved_phrase": "the Memorandum of Understanding on the Establishment of the Data Base Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms, with 10 annexes (\"Memorandum of Understanding\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Memorandum of Understanding on the Establishment of the Data Base",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the MOU and its annexes as an integral treaty component.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "START Memorandum of Understanding",
        "Memorandum of Understanding (MOU)"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-associated-not-integral",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "associated_document",
      "approved_phrase": "associated with, but not integral parts of, the Treaty",
      "instrument_or_package": "START I associated documents",
      "component_label": "Associated but non-integral treaty documents",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter distinguishes integral treaty components from associated documents provided for Senate information.",
      "selected_or_supplemental_status": "supplemental associated-document context",
      "integral_or_associated_status": "associated with, but not integral parts of, the Treaty",
      "legal_status_or_process": "not submitted for Senate advice and consent to ratification",
      "relationship_to_document": "editorial-note caveat for associated treaty documents",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "associated but not integral parts of the Treaty",
        "associated with but not integral parts of the Treaty"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-telemetry-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on Telemetric Information Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Telemetry Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Telemetry Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the telemetry protocol as an integral component of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "Protocol on Telemetric Information",
        "Telemetry Protocol"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-jcic-protocol",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "protocol",
      "approved_phrase": "the Protocol on the Joint Compliance and Inspection Commission Relating to the Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms (\"Joint Compliance and Inspection Commission Protocol\")",
      "instrument_or_package": "START I treaty package",
      "component_label": "Joint Compliance and Inspection Commission Protocol",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter lists the JCIC protocol as an integral component of the START I treaty package.",
      "selected_or_supplemental_status": "integral component listed in treaty-submission document",
      "integral_or_associated_status": "integral part of the Treaty",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "component identity in treaty transmittal/editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "Joint Compliance and Inspection Commission Protocol",
        "JCIC Protocol"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d247-inspection-monitoring-regime",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "editorial_note",
      "treaty_component_type": "verification_regime",
      "approved_phrase": "a far-reaching inspection regime, including on-site inspections, special access visits, continuous on-site monitoring of certain facilities, and technical exhibitions",
      "instrument_or_package": "START I treaty implementation and compliance apparatus",
      "component_label": "Inspection, monitoring, and technical-exhibition regime",
      "signature_or_publication_date": "1991-11-20",
      "publication_or_source_basis": "Baker treaty-submission letter summarizes the START I verification regime.",
      "selected_or_supplemental_status": "implementation and compliance explanation in treaty-submission document",
      "integral_or_associated_status": "verification regime established by the Treaty and related protocols",
      "legal_status_or_process": "submitted to the President for transmission to the Senate",
      "relationship_to_document": "implementation/compliance annotation and editorial-note context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "inspection regime, including on-site inspections, special access visits, continuous on-site monitoring, and technical exhibitions",
        "on-site inspections, special access visits, continuous on-site monitoring of certain facilities, and technical exhibitions"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d242-interpretive-data-telemetry",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d242",
      "document_number": "242",
      "unit_scope": "document_text",
      "treaty_component_type": "technical_definition",
      "approved_phrase": "interpretive data specified in subparagraphs 1(a) and 1(b) of Section II of the telemetry protocol",
      "instrument_or_package": "START I joint statements",
      "component_label": "Joint Statement Concerning Interpretive Data",
      "signature_or_publication_date": "1991-07-29",
      "publication_or_source_basis": "Final START plenary record prints the joint statement concerning interpretive data.",
      "selected_or_supplemental_status": "joint statement included in final START plenary record",
      "integral_or_associated_status": "associated verification statement tied to the telemetry protocol",
      "legal_status_or_process": "presented with final START plenary statements",
      "relationship_to_document": "technical-verification wording in selected document text",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 242.",
      "variant_forms": [
        "interpretive data specified in Section II of the Telemetry Protocol",
        "interpretive data under the telemetry protocol"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d242",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v31-d161-heavy-icbm-constraints",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "document_text",
      "treaty_component_type": "arms_control_constraint",
      "approved_phrase": "Ban new silos for heavies, ban downloading of heavies, no increase in launch weight or throw-weight of heavy ICBM s",
      "instrument_or_package": "START I heavy ICBM negotiating package",
      "component_label": "Heavy ICBM constraints",
      "signature_or_publication_date": "1990-06-02",
      "publication_or_source_basis": "Bush START I meeting guidance prints the U.S. position on heavy ICBM constraints.",
      "selected_or_supplemental_status": "negotiating-position text in selected document",
      "integral_or_associated_status": "negotiating constraint linked to heavy ICBM provisions",
      "legal_status_or_process": "pre-signature negotiating position",
      "relationship_to_document": "technical constraint in selected document text and annotation context",
      "source_or_context": "FRUS 1989-1992, volume XXXI, Document 161.",
      "variant_forms": [
        "ban new silos, ban downloading, no increase in launch weight or throw-weight",
        "no increase in launch weight or throw-weight of heavy ICBMs"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v44p1-d64-abm-other-physical-principles",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d64",
      "document_number": "64",
      "unit_scope": "document_text",
      "treaty_component_type": "technical_definition",
      "approved_phrase": "ABM systems based on \"other physical principles\" addressed in Agreed Statement D",
      "instrument_or_package": "ABM Treaty terminology and SDI interpretation",
      "component_label": "Other physical principles under Agreed Statement D",
      "signature_or_publication_date": "1985-10-03",
      "publication_or_source_basis": "Reagan National Security Policy volume prints the Senior Arms Control Group paper on ABM Treaty terminology.",
      "selected_or_supplemental_status": "technical treaty-interpretation language in selected document",
      "integral_or_associated_status": "ABM Treaty interpretation and SDI terminology",
      "legal_status_or_process": "internal guidance on treaty interpretation",
      "relationship_to_document": "technical definition in selected document text and annotation context",
      "source_or_context": "FRUS 1981-1988, volume XLIV, Part 1, Document 64.",
      "variant_forms": [
        "ABM systems based on other physical principles",
        "other physical principles addressed in Agreed Statement D"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d64",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v11-d276-draft-mou-protocols",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d276",
      "document_number": "276",
      "unit_scope": "editorial_note",
      "treaty_component_type": "draft_mou",
      "approved_phrase": "Our draft START Treaty calls for a Memorandum of Understanding (MOU) and three protocols: Conversion or Elimination, Inspections, and Throwweight",
      "instrument_or_package": "Reagan-era START draft package",
      "component_label": "Draft START MOU and three protocols",
      "signature_or_publication_date": "1988-02-24",
      "publication_or_source_basis": "Reagan START I memorandum describing draft MOU and remaining protocols.",
      "selected_or_supplemental_status": "draft treaty-package context",
      "integral_or_associated_status": "draft components under development",
      "legal_status_or_process": "pre-signature negotiating/drafting stage",
      "relationship_to_document": "textual treaty-package description in selected document",
      "source_or_context": "FRUS 1981-1988, volume XI, Document 276.",
      "variant_forms": [
        "draft START Treaty calls for a MOU and three protocols",
        "START Treaty calls for a Memorandum of Understanding and three protocols"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d276",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v11-d277-us-draft-protocol",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d277",
      "document_number": "277",
      "unit_scope": "follow_on_footnote",
      "treaty_component_type": "draft_protocol",
      "approved_phrase": "the U.S. Draft Protocol on Conversion or Elimination",
      "instrument_or_package": "Reagan-era START draft package",
      "component_label": "U.S. Draft Protocol on Conversion or Elimination",
      "signature_or_publication_date": "1988-03-02",
      "publication_or_source_basis": "Follow-on footnote reporting Geneva tabling of draft MOU/protocol documents.",
      "selected_or_supplemental_status": "supplemental treaty-component footnote context",
      "integral_or_associated_status": "draft protocol under negotiation",
      "legal_status_or_process": "pre-signature tabling at NST Geneva",
      "relationship_to_document": "follow-on footnote treaty-component context",
      "source_or_context": "FRUS 1981-1988, volume XI, Document 277, footnote 2.",
      "variant_forms": [
        "U.S. Draft Protocol on Conversion or Elimination",
        "Draft Protocol on Conversion or Elimination"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d277",
      "verification_status": "verified_published_treaty_record"
    },
    {
      "treaty_id": "treaty-v11-d251-defense-space-form",
      "volume_id": "frus1981-88v11",
      "document_id": "frus1981-88v11/d251",
      "document_number": "251",
      "unit_scope": "editorial_note",
      "treaty_component_type": "draft_treaty",
      "approved_phrase": "US: Separate treaty. | USSR: In START Treaty or protocol to START or ABM Treaty.",
      "instrument_or_package": "Defense and Space issue paper in START context",
      "component_label": "Form of Agreement options",
      "signature_or_publication_date": "",
      "publication_or_source_basis": "Department of State paper printed in Reagan START I volume.",
      "selected_or_supplemental_status": "draft treaty/legal-form issue in selected document",
      "integral_or_associated_status": "negotiating issue rather than final treaty component",
      "legal_status_or_process": "pre-signature form-of-agreement option",
      "relationship_to_document": "printed issue-paper treaty-form language",
      "source_or_context": "FRUS 1981-1988, volume XI, Document 251.",
      "variant_forms": [
        "U.S.: Separate treaty; USSR: In START Treaty or protocol to START or ABM Treaty",
        "US Separate treaty; USSR in START Treaty or protocol to START or ABM Treaty"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v11/d251",
      "verification_status": "verified_published_treaty_record"
    }
  ]
}
```

## Foreign And International Organization Registry Context

Use this to check country names, successor-state references, alliances, international organizations, regional bodies, summit/conference names, international financial institutions, trade regimes, UN resolution forms, and treaty-party language. Do not change entity identity, acronym expansion, body role, successor-state status, treaty-party status, or translation/authority basis unless the target-volume foreign-org registry proves the direct edit.

```json
{
  "schema_version": "frus-foreign-org-registry-v1",
  "foreign_org_registry_id": "frus-foreign-org-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d63",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d229",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d129",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d156",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d161"
  ],
  "scope": "Sample foreign/international-organization registry for Reagan and George H.W. Bush FRUS annotation sheets. Use it to keep country, successor-state, alliance, UN, treaty-party, conference, regional organization, international financial institution, and trade-regime language tied to published target-volume examples before allowing direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "foreign_org_id": "foreign-org-csce-summit-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d129",
      "document_number": "129",
      "unit_scope": "source_note",
      "entity_type": "summit_conference",
      "approved_phrase": "CSCE Summit",
      "entity_or_body": "Conference on Security and Cooperation in Europe",
      "country_or_region": "Europe",
      "role_or_context": "Source note identifies the Paris CSCE Summit context.",
      "identity_basis": "Published George H.W. Bush volume source note.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Meeting context and source-note locator.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 129.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d129",
      "verification_status": "verified_published_foreign_org_record",
      "variant_forms": [
        "Conference on Security and Cooperation in Europe Summit",
        "Paris CSCE Summit"
      ]
    },
    {
      "foreign_org_id": "foreign-org-ussr-state-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d156",
      "document_number": "156",
      "unit_scope": "document_heading",
      "entity_type": "foreign_state",
      "approved_phrase": "President of the Union of Soviet Socialist Republics",
      "entity_or_body": "Union of Soviet Socialist Republics",
      "country_or_region": "Soviet Union",
      "role_or_context": "Formal state title appears in a document heading.",
      "identity_basis": "Published George H.W. Bush volume document heading.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Sender/recipient identity.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 156.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d156",
      "verification_status": "verified_published_foreign_org_record",
      "variant_forms": [
        "President of the USSR",
        "Soviet President"
      ]
    },
    {
      "foreign_org_id": "foreign-org-us-uk-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "annotation",
      "entity_type": "foreign_state",
      "approved_phrase": "US/UK cooperation",
      "entity_or_body": "United Kingdom",
      "country_or_region": "United Kingdom",
      "role_or_context": "Published annotation uses slash construction in a cooperation phrase.",
      "identity_basis": "Published George H.W. Bush volume annotation.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Explanatory annotation for treaty-related discussion.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 161.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_foreign_org_record",
      "variant_forms": [
        "U.S./U.K. cooperation",
        "United States-United Kingdom cooperation"
      ]
    },
    {
      "foreign_org_id": "foreign-org-treaty-party-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "annotation",
      "entity_type": "treaty_party",
      "approved_phrase": "States not party to this Treaty",
      "entity_or_body": "Treaty parties and non-parties",
      "country_or_region": "global",
      "role_or_context": "Published annotation preserves treaty-party status language.",
      "identity_basis": "Published George H.W. Bush volume annotation.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Treaty-related annotation.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 161.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_foreign_org_record",
      "variant_forms": [
        "non-party states",
        "states not parties to this Treaty"
      ]
    }
  ],
  "records": [
    {
      "foreign_org_id": "foreign-org-un-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d63",
      "document_number": "63",
      "unit_scope": "annotation",
      "entity_type": "international_organization",
      "approved_phrase": "United Nations",
      "entity_or_body": "United Nations",
      "country_or_region": "global",
      "role_or_context": "Reagan campaign statement references global cooperation and the U.N. system.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Cited in follow-on annotation context.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 63.",
      "variant_forms": [
        "UN",
        "U.N."
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d63",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-unsc-242-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d63",
      "document_number": "63",
      "unit_scope": "annotation",
      "entity_type": "un_resolution",
      "approved_phrase": "UN Security Council Resolution 242 (S/RES/242)",
      "entity_or_body": "United Nations Security Council",
      "country_or_region": "Middle East",
      "role_or_context": "Resolution citation appears with document-symbol parenthetical.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Public statement/legal-diplomatic reference.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 63.",
      "variant_forms": [
        "Security Council Resolution 242",
        "UNSC Resolution 242",
        "S/RES/242"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d63",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-gatt-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d63",
      "document_number": "63",
      "unit_scope": "annotation",
      "entity_type": "trade_regime",
      "approved_phrase": "General Agreement on Tariffs and Trade (GATT)",
      "entity_or_body": "General Agreement on Tariffs and Trade",
      "country_or_region": "global",
      "role_or_context": "Trade regime identified by full name and acronym.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Campaign statement footnote/context.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 63.",
      "variant_forms": [
        "GATT"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d63",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-asean-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d229",
      "document_number": "229",
      "unit_scope": "annotation",
      "entity_type": "regional_organization",
      "approved_phrase": "ASEAN [Association of Southeast Asian Nations]",
      "entity_or_body": "Association of Southeast Asian Nations",
      "country_or_region": "Southeast Asia",
      "role_or_context": "Acronym is expanded in brackets in the published annotation.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Annotation explains regional framework.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 229.",
      "variant_forms": [
        "ASEAN",
        "Association of Southeast Asian Nations"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d229",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-anzus-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d229",
      "document_number": "229",
      "unit_scope": "annotation",
      "entity_type": "security_alliance",
      "approved_phrase": "ANZUS [Australia, New Zealand, United States Security Treaty]",
      "entity_or_body": "Australia, New Zealand, United States Security Treaty",
      "country_or_region": "Pacific",
      "role_or_context": "Security treaty acronym is expanded in brackets in the published annotation.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Annotation explains Pacific security framework.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 229.",
      "variant_forms": [
        "ANZUS",
        "Australia, New Zealand, United States Security Treaty"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d229",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-imf-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d229",
      "document_number": "229",
      "unit_scope": "annotation",
      "entity_type": "international_financial_institution",
      "approved_phrase": "IMF [International Monetary Fund]",
      "entity_or_body": "International Monetary Fund",
      "country_or_region": "global",
      "role_or_context": "International financial institution acronym is expanded in brackets in the published annotation.",
      "identity_basis": "Published Reagan Foundations annotation text.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Annotation explains financial institution reference.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 229.",
      "variant_forms": [
        "IMF",
        "International Monetary Fund"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d229",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-csce-summit-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d129",
      "document_number": "129",
      "unit_scope": "source_note",
      "entity_type": "summit_conference",
      "approved_phrase": "CSCE Summit",
      "entity_or_body": "Conference on Security and Cooperation in Europe",
      "country_or_region": "Europe",
      "role_or_context": "Source note identifies the Paris CSCE Summit context.",
      "identity_basis": "Published George H.W. Bush volume source note.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Meeting context and source-note locator.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 129.",
      "variant_forms": [
        "Conference on Security and Cooperation in Europe Summit",
        "Paris CSCE Summit"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d129",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-ussr-state-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d156",
      "document_number": "156",
      "unit_scope": "document_heading",
      "entity_type": "foreign_state",
      "approved_phrase": "President of the Union of Soviet Socialist Republics",
      "entity_or_body": "Union of Soviet Socialist Republics",
      "country_or_region": "Soviet Union",
      "role_or_context": "Formal state title appears in a document heading.",
      "identity_basis": "Published George H.W. Bush volume document heading.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Sender/recipient identity.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 156.",
      "variant_forms": [
        "President of the USSR",
        "Soviet President"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d156",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-us-uk-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "annotation",
      "entity_type": "foreign_state",
      "approved_phrase": "US/UK cooperation",
      "entity_or_body": "United Kingdom",
      "country_or_region": "United Kingdom",
      "role_or_context": "Published annotation uses slash construction in a cooperation phrase.",
      "identity_basis": "Published George H.W. Bush volume annotation.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Explanatory annotation for treaty-related discussion.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 161.",
      "variant_forms": [
        "U.S./U.K. cooperation",
        "United States-United Kingdom cooperation"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_foreign_org_record"
    },
    {
      "foreign_org_id": "foreign-org-treaty-party-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d161",
      "document_number": "161",
      "unit_scope": "annotation",
      "entity_type": "treaty_party",
      "approved_phrase": "States not party to this Treaty",
      "entity_or_body": "Treaty parties and non-parties",
      "country_or_region": "global",
      "role_or_context": "Published annotation preserves treaty-party status language.",
      "identity_basis": "Published George H.W. Bush volume annotation.",
      "selected_or_supplemental_status": "published_volume_example",
      "relationship_to_document": "Treaty-related annotation.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 161.",
      "variant_forms": [
        "non-party states",
        "states not parties to this Treaty"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d161",
      "verification_status": "verified_published_foreign_org_record"
    }
  ]
}
```

## Congressional And Legal Authority Registry Context

Use this to check Senate advice-and-consent, Senate information packages, treaty transmittal and ratification footnotes, congressional hearings, public-law/statute citations, appropriations and authorizations, budget authority, budget rescissions and deferrals, congressional notices, Presidential Determinations, Arms Export Control Act language, and Federal Register publication claims. Treat committee names, hearing titles, public-law numbers, Stat. citations, budget figures, advice-and-consent status, and publication-stage claims as comment-only unless the target-volume congressional/legal registry proves the exact direct edit.

```json
{
  "schema_version": "frus-congressional-legal-registry-v1",
  "congressional_legal_registry_id": "frus-1981-1992-congressional-legal-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d55",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d144"
  ],
  "scope": "Sample congressional/legal authority registry for Reagan and George H.W. Bush FRUS annotation sheets. Use it to keep Senate advice-and-consent, congressional hearings, public-law/statute citations, appropriations and authorizations, budget authority, congressional notice, Presidential Determination, Arms Export Control Act, and Federal Register publication language tied to published FRUS examples before allowing direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "congressional_legal_id": "congressional-legal-start-senate-information-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_information_package",
      "approved_phrase": "for the information of the Senate",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "associated treaty documents sent for Senate information",
      "citation_or_locator": "Document 247, treaty transmittal report",
      "public_or_archival_basis": "Published START I report text distinguishes Senate information documents from treaty materials submitted for advice and consent.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record",
      "variant_forms": [
        "sent for the information of the Senate"
      ]
    },
    {
      "congressional_legal_id": "congressional-legal-start-associated-not-submitted-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_advice_and_consent",
      "approved_phrase": "Although not submitted for the advice and consent of the Senate to ratification",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "associated documents not submitted for advice and consent",
      "citation_or_locator": "Document 247, associated documents paragraph",
      "public_or_archival_basis": "Published START I report text separates associated documents from the treaty package requiring advice and consent.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record",
      "variant_forms": [
        "not submitted for the advice and consent of the Senate"
      ]
    },
    {
      "congressional_legal_id": "congressional-legal-start-senate-advised-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_consultation",
      "approved_phrase": "The Senate has also been regularly advised on U.S. goals and objectives",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "consultation during negotiations",
      "citation_or_locator": "Document 247, background information paragraph",
      "public_or_archival_basis": "Published START I report text describes Senate consultation during strategic arms negotiations.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record",
      "variant_forms": [
        "Senate has been regularly advised"
      ]
    },
    {
      "congressional_legal_id": "congressional-legal-start-submit-advice-consent-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_advice_and_consent",
      "approved_phrase": "submitted to the Senate for its advice and consent to ratification at the earliest possible date",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "Secretary recommends treaty submission for advice and consent",
      "citation_or_locator": "Document 247, conclusion",
      "public_or_archival_basis": "Published START I report text uses the final advice-and-consent recommendation formula.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record",
      "variant_forms": [
        "submitted to the Senate for its advice and consent"
      ]
    },
    {
      "congressional_legal_id": "congressional-legal-start-transmission-ratification-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "footnote",
      "legal_type": "senate_ratification_footnote",
      "approved_phrase": "President Bush transmitted the treaty to the Senate on November 25, 1991",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "presidential treaty transmission and later Senate ratification",
      "citation_or_locator": "Document 247, footnote 3",
      "public_or_archival_basis": "Published START I footnote records treaty transmission date and Senate ratification context.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record",
      "variant_forms": [
        "United States Senate ratified the Treaty"
      ]
    }
  ],
  "records": [
    {
      "congressional_legal_id": "congressional-legal-start-senate-information-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_information_package",
      "approved_phrase": "for the information of the Senate",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "associated treaty documents sent for Senate information",
      "citation_or_locator": "Document 247, treaty transmittal report",
      "public_or_archival_basis": "Published START I report text distinguishes Senate information documents from treaty materials submitted for advice and consent.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "sent for the information of the Senate"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-start-associated-not-submitted-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_advice_and_consent",
      "approved_phrase": "Although not submitted for the advice and consent of the Senate to ratification",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "associated documents not submitted for advice and consent",
      "citation_or_locator": "Document 247, associated documents paragraph",
      "public_or_archival_basis": "Published START I report text separates associated documents from the treaty package requiring advice and consent.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "not submitted for the advice and consent of the Senate"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-start-senate-advised-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_consultation",
      "approved_phrase": "The Senate has also been regularly advised on U.S. goals and objectives",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "consultation during negotiations",
      "citation_or_locator": "Document 247, background information paragraph",
      "public_or_archival_basis": "Published START I report text describes Senate consultation during strategic arms negotiations.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "Senate has been regularly advised"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-start-submit-advice-consent-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "document_text",
      "legal_type": "senate_advice_and_consent",
      "approved_phrase": "submitted to the Senate for its advice and consent to ratification at the earliest possible date",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "Secretary recommends treaty submission for advice and consent",
      "citation_or_locator": "Document 247, conclusion",
      "public_or_archival_basis": "Published START I report text uses the final advice-and-consent recommendation formula.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "submitted to the Senate for its advice and consent"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-start-transmission-ratification-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d247",
      "document_number": "247",
      "unit_scope": "footnote",
      "legal_type": "senate_ratification_footnote",
      "approved_phrase": "President Bush transmitted the treaty to the Senate on November 25, 1991",
      "legal_instrument_or_body": "United States Senate",
      "legal_action_or_stage": "presidential treaty transmission and later Senate ratification",
      "citation_or_locator": "Document 247, footnote 3",
      "public_or_archival_basis": "Published START I footnote records treaty transmission date and Senate ratification context.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 247.",
      "variant_forms": [
        "United States Senate ratified the Treaty"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-hearing-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d39",
      "document_number": "39",
      "unit_scope": "footnote",
      "legal_type": "congressional_hearing_citation",
      "approved_phrase": "Foreign Assistance Legislation For Fiscal Year 1982 (Part 1), Hearings Before the Committee on Foreign Affairs, House of Representatives, Ninety-Seventh Congress, First Session, March 13, 18, 19, and 28, 1981",
      "legal_instrument_or_body": "House Committee on Foreign Affairs",
      "legal_action_or_stage": "hearing citation for Secretary Haig statement",
      "citation_or_locator": "Document 39, footnote 1",
      "public_or_archival_basis": "Published Reagan Foundations footnote cites the hearing title, committee, Congress/session, dates, GPO publication, and pages.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 39.",
      "variant_forms": [
        "Hearings Before the Committee on Foreign Affairs"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-budget-authority-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d39",
      "document_number": "39",
      "unit_scope": "document_text",
      "legal_type": "budget_authority_request",
      "approved_phrase": "$4.27 billion in budget authority",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "FY 1982 security assistance budget authority request",
      "citation_or_locator": "Document 39, security assistance testimony",
      "public_or_archival_basis": "Published text states requested budget authority and total security assistance program figure.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 39.",
      "variant_forms": [
        "$6.87 billion security assistance program"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-authorization-appropriation-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d39",
      "document_number": "39",
      "unit_scope": "document_text",
      "legal_type": "appropriation_or_authorization",
      "approved_phrase": "authorization and appropriation of these FY 1982 foreign aid requests",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "authorization and appropriation of foreign aid requests",
      "citation_or_locator": "Document 39, conclusion",
      "public_or_archival_basis": "Published testimony links foreign aid requests to congressional authorization and appropriation.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 39.",
      "variant_forms": [
        "foreign aid appropriations bill"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-budget-rescissions-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d39",
      "document_number": "39",
      "unit_scope": "footnote",
      "legal_type": "budget_message_or_rescission",
      "approved_phrase": "budget rescissions and deferrals",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "message to Congress reporting budget rescissions and deferrals",
      "citation_or_locator": "Document 39, footnote 2",
      "public_or_archival_basis": "Published footnote identifies message-to-Congress budget materials in Public Papers.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 39.",
      "variant_forms": [
        "message to Congress reporting budget rescissions and deferrals"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-tax-act-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d55",
      "document_number": "55",
      "unit_scope": "footnote",
      "legal_type": "public_law_statute",
      "approved_phrase": "Economic Recovery Tax Act of 1981 (H.R. 4242; P.L. 97-34; 95 Stat. 172)",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "public law and Stat. citation",
      "citation_or_locator": "Document 55, footnote 4",
      "public_or_archival_basis": "Published Reagan Foundations footnote gives act title, House bill, public law, and Stat. citation.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 55.",
      "variant_forms": [
        "P.L. 97-34",
        "95 Stat. 172"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d55",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-budget-reconciliation-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d55",
      "document_number": "55",
      "unit_scope": "footnote",
      "legal_type": "public_law_statute",
      "approved_phrase": "Omnibus Budget Reconciliation Act of 1981 (H.R. 3982; P.L. 97-35; 95 Stat. 357)",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "public law and Stat. citation",
      "citation_or_locator": "Document 55, footnote 4",
      "public_or_archival_basis": "Published Reagan Foundations footnote gives act title, House bill, public law, and Stat. citation.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 55.",
      "variant_forms": [
        "P.L. 97-35",
        "95 Stat. 357"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d55",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-awacs-notice-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d55",
      "document_number": "55",
      "unit_scope": "footnote",
      "legal_type": "congressional_notice",
      "approved_phrase": "Department of Defense \"informal\" notice, followed by an October 1 \"formal\" notice",
      "legal_instrument_or_body": "Congress",
      "legal_action_or_stage": "informal and formal congressional notice of proposed AWACS sale",
      "citation_or_locator": "Document 55, footnote 14",
      "public_or_archival_basis": "Published footnote distinguishes informal and formal notice stages before congressional consideration.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 55.",
      "variant_forms": [
        "Congress considered the AWACS sale package"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d55",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v01-fms-cut-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d55",
      "document_number": "55",
      "unit_scope": "footnote",
      "legal_type": "appropriation_or_authorization",
      "approved_phrase": "$1 billion from the administration's Foreign Military Sales request",
      "legal_instrument_or_body": "House appropriations subcommittee",
      "legal_action_or_stage": "subcommittee cut to FMS request",
      "citation_or_locator": "Document 55, footnote 16",
      "public_or_archival_basis": "Published footnote identifies the Long Appropriations Subcommittee decision and cited press account.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 55.",
      "variant_forms": [
        "Foreign Military Sales request",
        "FMS request"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d55",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v24-aeca-section-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d144",
      "document_number": "144",
      "unit_scope": "attachment",
      "legal_type": "arms_export_control_act",
      "approved_phrase": "Section 3(a) of the Arms Export Control Act",
      "legal_instrument_or_body": "Arms Export Control Act",
      "legal_action_or_stage": "statutory eligibility condition for defense articles and services",
      "citation_or_locator": "Document 144, attachment",
      "public_or_archival_basis": "Published attachment quotes legal authority for eligibility to buy defense articles and defense services.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 144.",
      "variant_forms": [
        "Arms Export Control Act"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d144",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v24-presidential-determination-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d144",
      "document_number": "144",
      "unit_scope": "attachment",
      "legal_type": "presidential_determination",
      "approved_phrase": "Presidential Determination No. 83-6, dated April 8, 1983",
      "legal_instrument_or_body": "Presidential Determination",
      "legal_action_or_stage": "country eligibility for Foreign Military Sales",
      "citation_or_locator": "Document 144, attachment",
      "public_or_archival_basis": "Published attachment identifies Presidential Determination number and date.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 144.",
      "variant_forms": [
        "Presidential Determination No. 83-6"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d144",
      "verification_status": "verified_published_congressional_legal_record"
    },
    {
      "congressional_legal_id": "congressional-legal-v24-federal-register-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d144",
      "document_number": "144",
      "unit_scope": "document_text",
      "legal_type": "federal_register_publication",
      "approved_phrase": "only the latter would be published in the Federal Register",
      "legal_instrument_or_body": "Federal Register",
      "legal_action_or_stage": "publication distinction for Justification and Determination",
      "citation_or_locator": "Document 144, Shultz memorandum",
      "public_or_archival_basis": "Published memorandum distinguishes congressional provision from Federal Register publication.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 144.",
      "variant_forms": [
        "published in the Federal Register"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d144",
      "verification_status": "verified_published_congressional_legal_record"
    }
  ]
}
```

## Economic And Financial Registry Context

Use this to check dollar amounts, percentages, debt metrics, IMF quotas and resources, General Arrangements to Borrow, World Bank and MDB funding, Paris Club debt relief, Baker Plan references, Eximbank/OPIC/ESF/AID program labels, arrears, loans, grants, budget claims, trade-finance, exchange-rate, commodity-policy, and foreign economic policy scope language. Treat figures, institution names, program labels, debt-relief mechanics, and policy-plan labels as comment-only unless the target-volume economic/financial registry proves the exact direct edit.

```json
{
  "schema_version": "frus-economic-financial-registry-v1",
  "economic_financial_registry_id": "frus-1981-1992-economic-financial-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v38",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/preface",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d129",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d142",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d267",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d327",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "scope": "Sample economic/financial registry for Reagan and George H.W. Bush FRUS annotation sheets. Use it to keep dollar amounts, percentages, debt metrics, IMF/World Bank terminology, MDB and GAB references, Paris Club and Baker Plan language, Eximbank/OPIC/ESF/AID program labels, budget claims, and debt-relief mechanics tied to published FRUS examples before allowing direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "economic_financial_id": "economic-financial-v38-imf-quota-percent-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d129",
      "document_number": "129",
      "unit_scope": "document_text",
      "financial_type": "imf_quota",
      "approved_phrase": "A 47 percent increase in resources has been approved",
      "institution_or_program": "International Monetary Fund",
      "amount_or_metric": "47 percent increase in IMF resources",
      "policy_context": "IMF quota increase and LDC debt situation in a SIG-IEP meeting.",
      "citation_or_locator": "Document 129, Debt Strategy section",
      "public_or_archival_basis": "Published FRUS text gives the approved percentage before listing U.S. and GAB amounts.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 129.",
      "variant_forms": [
        "47 percent increase in IMF resources",
        "47% increase in IMF resources"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d129",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-imf-us-portion-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d129",
      "document_number": "129",
      "unit_scope": "document_text",
      "financial_type": "imf_quota",
      "approved_phrase": "the U.S. portion of which is $5.8 billion",
      "institution_or_program": "International Monetary Fund",
      "amount_or_metric": "$5.8 billion",
      "policy_context": "U.S. share of IMF resource increase.",
      "citation_or_locator": "Document 129, Debt Strategy section",
      "public_or_archival_basis": "Published FRUS text records the exact U.S. portion of the IMF increase.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 129.",
      "variant_forms": [
        "U.S. portion is $5.8 billion",
        "$5.8 billion"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d129",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-gab-amount-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d129",
      "document_number": "129",
      "unit_scope": "document_text",
      "financial_type": "gab_arrangement",
      "approved_phrase": "The GAB arrangement will be increased to $19 billion",
      "institution_or_program": "General Arrangements to Borrow",
      "amount_or_metric": "$19 billion",
      "policy_context": "GAB expansion from G-10 availability to all member countries.",
      "citation_or_locator": "Document 129, Debt Strategy section",
      "public_or_archival_basis": "Published FRUS text identifies GAB amount and access change.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 129.",
      "variant_forms": [
        "GAB increased to $19 billion",
        "General Arrangements to Borrow increased to $19 billion"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d129",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-congress-total-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d129",
      "document_number": "129",
      "unit_scope": "document_text",
      "financial_type": "budget_authority",
      "approved_phrase": "ask Congress for a total of $8.4 billion",
      "institution_or_program": "Congress and IMF/GAB funding request",
      "amount_or_metric": "$8.4 billion",
      "policy_context": "Total request to Congress for IMF quota and GAB resources.",
      "citation_or_locator": "Document 129, Debt Strategy section",
      "public_or_archival_basis": "Published FRUS text gives the combined congressional request figure.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 129.",
      "variant_forms": [
        "total of $8.4 billion",
        "no budgetary impact"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d129",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-ldc-debt-growth-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d142",
      "document_number": "142",
      "unit_scope": "document_text",
      "financial_type": "international_debt_metric",
      "approved_phrase": "grew from only $55 billion in 1970 to $625 billion last year",
      "institution_or_program": "LDC and East European debt",
      "amount_or_metric": "$55 billion to $625 billion",
      "policy_context": "Medium- and long-term debt growth in the international debt problem briefing.",
      "citation_or_locator": "Document 142, Facts section",
      "public_or_archival_basis": "Published FRUS text preserves both endpoints and the temporal frame.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 142.",
      "variant_forms": [
        "$55 billion in 1970 to $625 billion",
        "LDC and East European debt grew to $625 billion"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d142",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-short-term-debt-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d142",
      "document_number": "142",
      "unit_scope": "document_text",
      "financial_type": "international_debt_metric",
      "approved_phrase": "about $150 billion in short-term debt",
      "institution_or_program": "LDC and East European debt",
      "amount_or_metric": "$150 billion",
      "policy_context": "Short-term debt component of debtor-country exposure.",
      "citation_or_locator": "Document 142, Facts section",
      "public_or_archival_basis": "Published FRUS text uses approximate short-term debt language.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 142.",
      "variant_forms": [
        "$150 billion short-term debt"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d142",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-debt-service-growth-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d142",
      "document_number": "142",
      "unit_scope": "document_text",
      "financial_type": "international_debt_metric",
      "approved_phrase": "increased correspondingly from $9 billion in 1970 to an estimated $140 billion in 1982",
      "institution_or_program": "Annual debt service requirements",
      "amount_or_metric": "$9 billion to $140 billion",
      "policy_context": "Debt service growth in the international debt problem briefing.",
      "citation_or_locator": "Document 142, Facts section",
      "public_or_archival_basis": "Published FRUS text gives the start figure, estimated end figure, and year.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 142.",
      "variant_forms": [
        "$9 billion in 1970 to $140 billion in 1982",
        "$140 billion in 1982"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d142",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-debt-service-ratio-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d142",
      "document_number": "142",
      "unit_scope": "document_text",
      "financial_type": "debt_service_ratio",
      "approved_phrase": "a debt service to export ratio of more than 20%",
      "institution_or_program": "Debt service/export ratio",
      "amount_or_metric": "more than 20%",
      "policy_context": "Debt burden threshold in international debt analysis.",
      "citation_or_locator": "Document 142, Facts section",
      "public_or_archival_basis": "Published FRUS text identifies the threshold as traditionally worrisome.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 142.",
      "variant_forms": [
        "debt service/export ratio over 20 percent",
        "debt service to export ratio over 20%"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d142",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-mdb-reduction-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d267",
      "document_number": "267",
      "unit_scope": "document_text",
      "financial_type": "mdb_funding",
      "approved_phrase": "a six percent reduction in overall funding for MDBs",
      "institution_or_program": "Multilateral development banks",
      "amount_or_metric": "six percent reduction",
      "policy_context": "Cabinet Council decision on MDB funding reductions.",
      "citation_or_locator": "Document 267, Decisions section",
      "public_or_archival_basis": "Published FRUS text uses spelled-out percent language and MDB acronym.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 267.",
      "variant_forms": [
        "6 percent reduction in overall funding for MDBs",
        "six percent MDB funding reduction"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d267",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-imf-world-bank-meeting-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d267",
      "document_number": "267",
      "unit_scope": "footnote",
      "financial_type": "imf_world_bank_meeting",
      "approved_phrase": "annual meeting of the Board of Governors of the World Bank Group and the International Monetary Fund",
      "institution_or_program": "World Bank Group and International Monetary Fund",
      "amount_or_metric": "meeting citation",
      "policy_context": "Public Papers cross-reference for Reagan remarks.",
      "citation_or_locator": "Document 267, footnote 3",
      "public_or_archival_basis": "Published FRUS footnote gives the formal meeting title.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 267.",
      "variant_forms": [
        "IMF and World Bank meetings",
        "IMF/World Bank meetings"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d267",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-paris-club-toronto-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "paris_club_debt_relief",
      "approved_phrase": "rules for implementing the debt relief scheme agreed to at the Toronto Economic Summit",
      "institution_or_program": "Paris Club and Toronto Economic Summit",
      "amount_or_metric": "debt relief scheme",
      "policy_context": "Debt relief for poorest countries after Toronto.",
      "citation_or_locator": "Document 246, International Debt section",
      "public_or_archival_basis": "Published FRUS text ties Paris Club action to Toronto Summit debt relief.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "Paris Club debt relief scheme agreed to at Toronto",
        "Toronto Summit debt relief scheme"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-export-import-loans-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "trade_finance",
      "approved_phrase": "Export-Import Bank will provide medium-term loans at concessional rates",
      "institution_or_program": "Export-Import Bank of Japan",
      "amount_or_metric": "medium-term loans at concessional rates",
      "policy_context": "Japanese middle-income-country debt proposal at IMF/World Bank meetings.",
      "citation_or_locator": "Document 246, International Debt section",
      "public_or_archival_basis": "Published FRUS text distinguishes Japanese Ex-Im lending from U.S. position.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "Export Import Bank medium-term loans at concessional rates",
        "untied concessional loans"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-baker-plan-departure-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "baker_plan",
      "approved_phrase": "a clear departure from the Baker Plan",
      "institution_or_program": "Baker Plan debt strategy",
      "amount_or_metric": "policy comparison",
      "policy_context": "Mexico debt proposal contrasted with Baker Plan principles.",
      "citation_or_locator": "Document 246, International Debt section",
      "public_or_archival_basis": "Published FRUS text uses Baker Plan as a named policy baseline.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "departure from Baker Plan",
        "departed from the Baker Plan"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-argentina-world-bank-loans-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "world_bank_loan",
      "approved_phrase": "Argentina and the World Bank announced agreement on $1.25 billion in new loans",
      "institution_or_program": "World Bank",
      "amount_or_metric": "$1.25 billion",
      "policy_context": "World Bank lending to Argentina before an IMF program was in place.",
      "citation_or_locator": "Document 246, International Debt section",
      "public_or_archival_basis": "Published FRUS text identifies parties, amount, and controversy.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "$1.25 billion in World Bank loans",
        "World Bank agreement on $1.25 billion"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-imf-arrears-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "arrearages_metric",
      "approved_phrase": "arrears totalling almost $3 billion, about 10% of outstanding IMF credit",
      "institution_or_program": "International Monetary Fund",
      "amount_or_metric": "almost $3 billion; about 10%",
      "policy_context": "IMF resource constraint caused by member-country arrears.",
      "citation_or_locator": "Document 246, IMF Resources section",
      "public_or_archival_basis": "Published FRUS text pairs arrears amount with percentage of outstanding IMF credit.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "almost $3 billion in IMF arrears",
        "10% of outstanding IMF credit"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-world-bank-gci-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d246",
      "document_number": "246",
      "unit_scope": "document_text",
      "financial_type": "mdb_funding",
      "approved_phrase": "the Bank's $75 billion Eighth General Capital Increase",
      "institution_or_program": "World Bank",
      "amount_or_metric": "$75 billion",
      "policy_context": "World Bank resources and U.S. commitment.",
      "citation_or_locator": "Document 246, World Bank Resources section",
      "public_or_archival_basis": "Published FRUS text names the Eighth General Capital Increase and dollar amount.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 246.",
      "variant_forms": [
        "$75 billion Eighth General Capital Increase",
        "World Bank Eighth General Capital Increase"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d246",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-aid-finance-mechanisms-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d327",
      "document_number": "327",
      "unit_scope": "document_text",
      "financial_type": "aid_finance_program",
      "approved_phrase": "AID, Eximbank, OPIC, etc.",
      "institution_or_program": "AID, Eximbank, OPIC",
      "amount_or_metric": "program labels",
      "policy_context": "Restructuring aid, investment, and trade-financing mechanisms.",
      "citation_or_locator": "Document 327, Objectives section",
      "public_or_archival_basis": "Published FRUS text groups the program labels in the policy objective.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 327.",
      "variant_forms": [
        "AID, Eximbank, OPIC",
        "aid, investment and trade financing mechanisms"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d327",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-esf-programs-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d327",
      "document_number": "327",
      "unit_scope": "document_text",
      "financial_type": "aid_finance_program",
      "approved_phrase": "State/AID ESF, the entire AID organization, Eximbank, OPIC, Treasury ESF, etc.",
      "institution_or_program": "State/AID ESF, AID, Eximbank, OPIC, Treasury ESF",
      "amount_or_metric": "program labels",
      "policy_context": "NSC study on financial programs linked to U.S. foreign policy.",
      "citation_or_locator": "Document 327, Other proposed policies section",
      "public_or_archival_basis": "Published FRUS text preserves the program list and Treasury ESF distinction.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 327.",
      "variant_forms": [
        "State/AID ESF",
        "Treasury ESF",
        "Eximbank, OPIC"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d327",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-debt-to-grants-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/d327",
      "document_number": "327",
      "unit_scope": "document_text",
      "financial_type": "aid_finance_program",
      "approved_phrase": "conversion of certain types of Third World debt to U.S. official sources to be converted to grants in local currencies",
      "institution_or_program": "Foreign Assistance Act debt-to-grants authority",
      "amount_or_metric": "debt converted to local-currency grants",
      "policy_context": "World Bank lending and Foreign Assistance Act authority.",
      "citation_or_locator": "Document 327, Other proposed policies section",
      "public_or_archival_basis": "Published FRUS text describes the conversion mechanism and local-currency grant endpoint.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Document 327.",
      "variant_forms": [
        "debt to U.S. official sources converted to grants in local currencies",
        "debt converted to local currency grants"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/d327",
      "verification_status": "verified_published_economic_financial_record"
    },
    {
      "economic_financial_id": "economic-financial-v38-scope-foreign-economic-policy-001",
      "volume_id": "frus1981-88v38",
      "document_id": "frus1981-88v38/preface",
      "document_number": "preface",
      "unit_scope": "front_matter",
      "financial_type": "debt_strategy",
      "approved_phrase": "the need to formulate policies and strategies to address an unfolding international debt crisis, which lasted until the end of the Reagan administration and continued into the George H.W. Bush administration",
      "institution_or_program": "Reagan and George H.W. Bush foreign economic policy",
      "amount_or_metric": "volume-scope statement",
      "policy_context": "Preface scope connecting Reagan international debt crisis to Bush administration continuation.",
      "citation_or_locator": "Volume XXXVIII Preface, Focus of Research and Principles of Selection",
      "public_or_archival_basis": "Published FRUS preface explains why debt policy permutations remain relevant to Bush volumes in preparation.",
      "source_or_context": "FRUS, 1981-1988, volume XXXVIII, Preface.",
      "variant_forms": [
        "international debt crisis continued into the George H.W. Bush administration",
        "foreign economic policy continued into the Bush administration"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v38/preface",
      "verification_status": "verified_published_economic_financial_record"
    }
  ]
}
```

## Military And Crisis Operations Registry Context

Use this to check operation names, Gulf of Sidra/Bay of Sidra and Persian Gulf freedom-of-navigation claims, force presence, naval incidents, shootdowns/intercepts, military assistance and FMS/IMET terms, Sixth Fleet/command references, Libyan CW/Rabta language, inspection/verification or dismantlement claims, host-nation/base-access, evacuation/embassy-security, and crisis chronology. Treat operation labels, aircraft/force identities, deployment claims, CW capability language, ROE, and legal/notification posture as comment-only unless the target-volume military/crisis registry proves the exact direct edit.

```json
{
  "schema_version": "frus-military-crisis-registry-v1",
  "military_crisis_registry_id": "frus-1981-1992-military-crisis-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/status-of-the-series",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d9",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d67",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d96",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d184",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d319",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d339",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d340",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d302"
  ],
  "scope": "Sample military/crisis operations registry for Reagan and George H.W. Bush FRUS annotation sheets. Use it to keep Gulf of Sidra, Persian Gulf, CW/Rabta, force-presence, shootdown, military-assistance, military-cooperation, host-nation, and crisis-response language tied to published FRUS examples before allowing direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "military_crisis_id": "military-crisis-v24-bay-sidra-exercise-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d9",
      "document_number": "9",
      "unit_scope": "document_text",
      "military_type": "naval_exercise",
      "approved_phrase": "Bay of Sidra exercise",
      "operation_or_crisis": "Bay/Gulf of Sidra naval exercise",
      "actor_or_force": "U.S. forces and Libya",
      "stage_or_role": "signal to friends and pressure on Qadhafi",
      "chronology_or_location_basis": "Document 9, July 13, 1981, North Africa",
      "citation_or_locator": "Document 9 and footnote 3",
      "public_or_archival_basis": "Published FRUS memorandum and footnote link the exercise to scheduled Libya; Chad coverage.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 9.",
      "variant_forms": [
        "U.S. exercises in the Gulf of Sidra",
        "Gulf of Sidra exercises"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d9",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-training-equipment-joint-exercises-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d9",
      "document_number": "9",
      "unit_scope": "document_text",
      "military_type": "security_assistance",
      "approved_phrase": "stepped up training, equipment deliveries, and joint exercises",
      "operation_or_crisis": "Libyan threat to Tunisia",
      "actor_or_force": "Tunisia and United States",
      "stage_or_role": "requested security assistance and exercises",
      "chronology_or_location_basis": "Document 9, Carlucci trip to North Africa",
      "citation_or_locator": "Document 9",
      "public_or_archival_basis": "Published FRUS summary records Tunisia's request and defense vulnerability.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 9.",
      "variant_forms": [
        "training, equipment deliveries, and joint exercises"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d9",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-threatened-neighbors-assistance-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d9",
      "document_number": "9",
      "unit_scope": "document_text",
      "military_type": "military_assistance",
      "approved_phrase": "continue to provide them with military assistance",
      "operation_or_crisis": "Regional response to Libya",
      "actor_or_force": "United States and Libya's threatened neighbors",
      "stage_or_role": "continuing assistance and leadership",
      "chronology_or_location_basis": "Document 9, North Africa regional strategy",
      "citation_or_locator": "Document 9",
      "public_or_archival_basis": "Published FRUS memorandum states the military-assistance premise.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 9.",
      "variant_forms": [
        "provide military assistance to Libya's threatened neighbors"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d9",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-joint-us-moroccan-exercises-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d45",
      "document_number": "45",
      "unit_scope": "document_text",
      "military_type": "military_cooperation",
      "approved_phrase": "joint US/Moroccan military exercises",
      "operation_or_crisis": "Maghreb policy and Moroccan-Libyan union",
      "actor_or_force": "United States and Morocco",
      "stage_or_role": "planned and executed bilateral exercises",
      "chronology_or_location_basis": "Document 45, Washington, December 12, 1984",
      "citation_or_locator": "Document 45 recommendations",
      "public_or_archival_basis": "Published FRUS paper uses this exact exercise form.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 45.",
      "variant_forms": [
        "joint U.S./Moroccan military exercises",
        "joint US-Moroccan military exercises"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-fms-imet-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d45",
      "document_number": "45",
      "unit_scope": "document_text",
      "military_type": "security_assistance",
      "approved_phrase": "defense articles and services via FMS, increasing IMET funding",
      "operation_or_crisis": "Algerian access to defense articles and training",
      "actor_or_force": "Algeria and United States",
      "stage_or_role": "proposed Presidential determination and training funding",
      "chronology_or_location_basis": "Document 45 recommendations for Algeria",
      "citation_or_locator": "Document 45",
      "public_or_archival_basis": "Published FRUS paper records the FMS and IMET wording.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 45.",
      "variant_forms": [
        "defense articles and services through FMS and increased IMET funding"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-sixth-fleet-port-calls-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d45",
      "document_number": "45",
      "unit_scope": "document_text",
      "military_type": "force_presence",
      "approved_phrase": "Sixth Fleet port calls",
      "operation_or_crisis": "U.S. support for Algeria and Tunisia",
      "actor_or_force": "U.S. Sixth Fleet",
      "stage_or_role": "visible support and regional gesture",
      "chronology_or_location_basis": "Document 45 recommendations",
      "citation_or_locator": "Document 45",
      "public_or_archival_basis": "Published FRUS paper uses the exact Sixth Fleet phrase.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 45.",
      "variant_forms": [
        "6th Fleet port calls"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-tunisia-logistical-support-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d45",
      "document_number": "45",
      "unit_scope": "document_text",
      "military_type": "combat_or_strike_risk",
      "approved_phrase": "military/logistical support in the event of a Libyan move against Tunisian territorial integrity",
      "operation_or_crisis": "Libyan threat to Tunisia",
      "actor_or_force": "United States, Tunisia, Libya, France or other interested countries",
      "stage_or_role": "contingency support",
      "chronology_or_location_basis": "Document 45 Tunisia recommendations",
      "citation_or_locator": "Document 45",
      "public_or_archival_basis": "Published FRUS paper preserves the contingency language and territorial-integrity basis.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 45.",
      "variant_forms": [
        "military and logistical support in the event of a Libyan move against Tunisia"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-stairstep-gulf-sidra-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d45",
      "document_number": "45",
      "unit_scope": "document_text",
      "military_type": "naval_exercise",
      "approved_phrase": "Stairstep program in the Gulf of Sidra",
      "operation_or_crisis": "Gulf of Sidra naval exercises",
      "actor_or_force": "National Security Council and U.S. naval forces",
      "stage_or_role": "program under policy discussion",
      "chronology_or_location_basis": "Document 45 new recommendations",
      "citation_or_locator": "Document 45 footnote 6",
      "public_or_archival_basis": "Published FRUS footnote identifies Stairstep as the operational name for naval exercises.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 45.",
      "variant_forms": [
        "operational name for naval exercises in the Gulf of Sidra"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d45",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-gulf-sidra-penetration-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d339",
      "document_number": "339",
      "unit_scope": "document_text",
      "military_type": "freedom_of_navigation",
      "approved_phrase": "Gulf of Sidra penetration",
      "operation_or_crisis": "Gulf of Sidra confrontation with Libya",
      "actor_or_force": "United States, Tunisia, Libya",
      "stage_or_role": "demonstration of international waters claim",
      "chronology_or_location_basis": "Document 339, Tunis, March 10, 1986",
      "citation_or_locator": "Document 339",
      "public_or_archival_basis": "Published FRUS telegram reports Tunisian support for a penetration to illustrate the international nature of the waters.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 339.",
      "variant_forms": [
        "Gulf of Sidra penetration we may choose to make"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d339",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-us-military-units-international-waters-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d67",
      "document_number": "67",
      "unit_scope": "document_text",
      "military_type": "naval_incident",
      "approved_phrase": "U.S. military units operating in international waters",
      "operation_or_crisis": "Gulf of Sidra incidents",
      "actor_or_force": "United States, Libya, Morocco",
      "stage_or_role": "U.S. explanation of Libyan attack",
      "chronology_or_location_basis": "Document 67, Washington, April 10, 1986",
      "citation_or_locator": "Document 67 and footnote 2",
      "public_or_archival_basis": "Published FRUS telegram preserves the U.S. military-units/international-waters form.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 67.",
      "variant_forms": [
        "military units operating in international waters"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d67",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-tomcat-shootdown-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d319",
      "document_number": "319",
      "unit_scope": "footnote",
      "military_type": "shootdown_or_intercept",
      "approved_phrase": "two U.S. Navy F–14 Tomcats shot down two Libyan SU–22 Fitter fighter jets",
      "operation_or_crisis": "August 19, 1981 Gulf of Sidra incident",
      "actor_or_force": "U.S. Navy F-14 Tomcats and Libyan SU-22 Fitter fighter jets",
      "stage_or_role": "shootdown after being fired upon",
      "chronology_or_location_basis": "Document 319 footnote 3",
      "citation_or_locator": "Document 319 footnote 3",
      "public_or_archival_basis": "Published FRUS footnote gives the aircraft, incident date, and scheduled Libya; Chad target volume.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 319.",
      "variant_forms": [
        "two U.S. Navy F-14 Tomcats shot down two Libyan SU-22 Fitter fighter jets",
        "two U.S. Navy F-14 Tomcats shot down two Libyan SU-22s"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d319",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-libyan-cw-program-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d96",
      "document_number": "96",
      "unit_scope": "subject_line",
      "military_type": "chemical_weapons_crisis",
      "approved_phrase": "Libyan Chemical Weapons Program",
      "operation_or_crisis": "Libyan chemical weapons program",
      "actor_or_force": "Libya and U.S. diplomatic posts in Africa",
      "stage_or_role": "subject heading and demarche basis",
      "chronology_or_location_basis": "Document 96, Nouakchott, December 21, 1988",
      "citation_or_locator": "Document 96 subject",
      "public_or_archival_basis": "Published FRUS telegram uses the subject as the crisis label.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 96.",
      "variant_forms": [
        "Libyan chemical weapons production"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d96",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-rabta-chemical-plant-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d96",
      "document_number": "96",
      "unit_scope": "document_text",
      "military_type": "chemical_weapons_crisis",
      "approved_phrase": "Rabta chemical plant",
      "operation_or_crisis": "Libyan chemical weapons program",
      "actor_or_force": "Libya and neighboring states",
      "stage_or_role": "facility at issue",
      "chronology_or_location_basis": "Document 96, December 1988",
      "citation_or_locator": "Document 96",
      "public_or_archival_basis": "Published FRUS telegram identifies Rabta as the chemical plant at issue.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 96.",
      "variant_forms": [
        "Rabta facility",
        "Libyan plant"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d96",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v24-rabta-verification-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d184",
      "document_number": "184",
      "unit_scope": "document_text",
      "military_type": "inspection_or_verification",
      "approved_phrase": "round-the-clock verification or dismantle the plant",
      "operation_or_crisis": "Libyan CW capability and Rabta verification",
      "actor_or_force": "United States, Algeria, Libya",
      "stage_or_role": "requested diplomatic presentation on inspection and dismantlement",
      "chronology_or_location_basis": "Document 184, late December 1988",
      "citation_or_locator": "Document 184",
      "public_or_archival_basis": "Published FRUS telegram asks whether Libya should allow verification or dismantle the plant.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 184.",
      "variant_forms": [
        "allow round-the-clock verification or dismantle the plant"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d184",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v01-persian-gulf-navigation-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d302",
      "document_number": "302",
      "unit_scope": "document_text",
      "military_type": "freedom_of_navigation",
      "approved_phrase": "Persian Gulf will remain open to navigation",
      "operation_or_crisis": "Persian Gulf freedom of navigation",
      "actor_or_force": "United States, allies, Iran, Soviet Union",
      "stage_or_role": "public policy statement",
      "chronology_or_location_basis": "Document 302, Washington, May 29, 1987",
      "citation_or_locator": "Document 302",
      "public_or_archival_basis": "Published Reagan Foundations text gives the public freedom-of-navigation form.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 302.",
      "variant_forms": [
        "The Persian Gulf will remain open to navigation"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d302",
      "verification_status": "verified_published_military_crisis_record"
    },
    {
      "military_crisis_id": "military-crisis-v01-gulf-force-presence-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d302",
      "document_number": "302",
      "unit_scope": "document_text",
      "military_type": "force_presence",
      "approved_phrase": "maintain an adequate presence to deter and, if necessary, to defend ourselves",
      "operation_or_crisis": "Persian Gulf force presence",
      "actor_or_force": "United States forces in the Persian Gulf",
      "stage_or_role": "deterrent and defensive presence",
      "chronology_or_location_basis": "Document 302, Washington, May 29, 1987",
      "citation_or_locator": "Document 302",
      "public_or_archival_basis": "Published Reagan Foundations text explains force presence in the Gulf.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 302.",
      "variant_forms": [
        "maintain adequate presence to deter and defend ourselves"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d302",
      "verification_status": "verified_published_military_crisis_record"
    }
  ]
}
```

## Intelligence And Law Enforcement Registry Context

Use this to check CIA, INR, National Intelligence Council, intelligence-source/handling, covert/sensitive-source, counterterrorism, terrorist-incident, hostage/hijacking, arrest-warrant, Interpol, extradition/prosecution, FBI/DEA liaison, counternarcotics, narcoterrorism, and Department of Justice language. Treat agency identity, intelligence basis, sensitive-source posture, case status, jurisdiction, terrorist-incident chronology, prosecution/extradition posture, and counternarcotics claims as comment-only unless the target-volume intelligence/law-enforcement registry proves the exact direct edit.

```json
{
  "schema_version": "frus-intelligence-law-enforcement-registry-v1",
  "intelligence_law_enforcement_registry_id": "frus-1981-1992-intelligence-law-enforcement-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/status-of-the-series",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d58",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d62",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d264",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d266",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d291",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d167",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d174",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d175",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d178",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d341",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23"
  ],
  "scope": "Sample intelligence/law-enforcement registry for Reagan and George H.W. Bush FRUS annotation sheets. Use it to keep CIA, INR, intelligence-community, sensitive-source, counterterrorism, hostage/hijacking, prosecution/extradition, FBI/DEA liaison, and counternarcotics language tied to published FRUS examples before allowing direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "intelligence_law_enforcement_id": "ile-v31-d23-counter-narcotics-peru-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source_note",
      "ile_type": "counternarcotics",
      "approved_phrase": "Counter Narcotics in Peru, Review of National Security Review 12--Section IV Regarding Arms Control Implications of Defense Strategy",
      "case_or_program": "Bush NSC meeting file source-note title",
      "agency_or_actor": "George H.W. Bush Library, National Security Council H-Files",
      "stage_or_role": "source-note folder/file title with counternarcotics and START context",
      "chronology_or_jurisdiction_basis": "May 25, 1989 NSC meeting file",
      "citation_or_locator": "Document 23 source note",
      "public_or_archival_basis": "Published START I source note preserves a folder title that includes Counter Narcotics in Peru.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 23.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_intelligence_law_enforcement_record",
      "variant_forms": [
        "Counter Narcotics in Peru",
        "counter narcotics in Peru"
      ]
    }
  ],
  "records": [
    {
      "intelligence_law_enforcement_id": "ile-v44p1-d58-cia-ddo-heading-001",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d58",
      "document_number": "58",
      "unit_scope": "document_heading",
      "ile_type": "intelligence_community_body",
      "approved_phrase": "Memorandum From the Deputy Director for Operations, Central Intelligence Agency (George) to President Reagan, Vice President Bush, Secretary of State Shultz, Secretary of Defense Weinberger, and the President's Assistant for National Security Affairs (McFarlane)",
      "case_or_program": "Soviet SDI and arms-control reporting",
      "agency_or_actor": "Deputy Director for Operations, Central Intelligence Agency",
      "stage_or_role": "intelligence memorandum heading",
      "chronology_or_jurisdiction_basis": "Washington, September 25, 1985",
      "citation_or_locator": "Document 58 heading and source note",
      "public_or_archival_basis": "Published Reagan National Security Policy volume uses a CIA DDO memorandum heading for sensitive Soviet reporting.",
      "source_or_context": "FRUS, 1981-1988, volume XLIV, Part 1, Document 58.",
      "variant_forms": [
        "Deputy Director for Operations, Central Intelligence Agency (George)",
        "Deputy Director for Operations, CIA (George)"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d58",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v44p1-d58-handling-restrictions-001",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d58",
      "document_number": "58",
      "unit_scope": "source_note",
      "ile_type": "intelligence_source_or_handling",
      "approved_phrase": "Secret; [handling restrictions not declassified]",
      "case_or_program": "Sensitive intelligence-source handling",
      "agency_or_actor": "CIA-originated reporting",
      "stage_or_role": "source-note classification and handling statement",
      "chronology_or_jurisdiction_basis": "Source note for Document 58",
      "citation_or_locator": "Document 58 footnote 1",
      "public_or_archival_basis": "Published source note preserves handling restrictions as an omission statement, not an inferred compartment label.",
      "source_or_context": "FRUS, 1981-1988, volume XLIV, Part 1, Document 58.",
      "variant_forms": [
        "Secret; [handling restriction not declassified]"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d58",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v44p1-d62-cia-paper-heading-001",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d62",
      "document_number": "62",
      "unit_scope": "document_heading",
      "ile_type": "source_note_agency_provenance",
      "approved_phrase": "Paper Prepared in the Central Intelligence Agency",
      "case_or_program": "Strategic Defense Initiative joint operations concept",
      "agency_or_actor": "Central Intelligence Agency",
      "stage_or_role": "document heading for agency-prepared paper",
      "chronology_or_jurisdiction_basis": "Washington, undated",
      "citation_or_locator": "Document 62 heading and source note",
      "public_or_archival_basis": "Published volume uses agency-prepared paper form without adding an author not present in the record.",
      "source_or_context": "FRUS, 1981-1988, volume XLIV, Part 1, Document 62.",
      "variant_forms": [
        "paper prepared in the central intelligence agency",
        "Paper Prepared in the CIA"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d62",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v01-d264-inr-heading-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d264",
      "document_number": "264",
      "unit_scope": "document_heading",
      "ile_type": "intelligence_assessment",
      "approved_phrase": "Information Memorandum From the Director of the Bureau of Intelligence and Research (Abramowitz) to Secretary of State Shultz",
      "case_or_program": "Democratic transitions analysis",
      "agency_or_actor": "Bureau of Intelligence and Research",
      "stage_or_role": "INR information memorandum",
      "chronology_or_jurisdiction_basis": "Washington, March 6, 1986",
      "citation_or_locator": "Document 264 heading and source note",
      "public_or_archival_basis": "Published Reagan Foundations volume preserves the INR bureau name in the heading.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 264.",
      "variant_forms": [
        "Director of the Bureau of Intelligence and Research (Abramowitz)",
        "INR memo"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d264",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v01-d266-nic-fuller-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d266",
      "document_number": "266",
      "unit_scope": "follow_on_footnote",
      "ile_type": "intelligence_community_body",
      "approved_phrase": "Vice Chairman of the National Intelligence Council Graham Fuller",
      "case_or_program": "New Fluidity on the International Scene",
      "agency_or_actor": "National Intelligence Council",
      "stage_or_role": "attached but not printed memorandum attribution",
      "chronology_or_jurisdiction_basis": "February 27 memorandum cited in Document 266 footnote 2",
      "citation_or_locator": "Document 266 footnote 2",
      "public_or_archival_basis": "Published footnote identifies Fuller by National Intelligence Council role.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 266.",
      "variant_forms": [
        "National Intelligence Council Graham Fuller",
        "NIC Graham Fuller"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d266",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d341-action-libyan-terrorism-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d341",
      "document_number": "341",
      "unit_scope": "document_subject",
      "ile_type": "counterterrorism",
      "approved_phrase": "U.S. Action Against Libyan Terrorism",
      "case_or_program": "U.S. military response to Libyan terrorism",
      "agency_or_actor": "Department of State and National Security Council",
      "stage_or_role": "telegram subject",
      "chronology_or_jurisdiction_basis": "Washington, April 14, 1986, 2146Z",
      "citation_or_locator": "Document 341 subject line",
      "public_or_archival_basis": "Published North Africa volume uses this subject form for the terrorism action telegram.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 341.",
      "variant_forms": [
        "US Action Against Libyan Terrorism"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d341",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d341-berlin-paris-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d341",
      "document_number": "341",
      "unit_scope": "document_text",
      "ile_type": "terrorist_incident",
      "approved_phrase": "Libyan-sponsored activity against the U.S. in both Berlin and Paris",
      "case_or_program": "La Belle discotheque and Paris bombing references",
      "agency_or_actor": "Libya and U.S. officials",
      "stage_or_role": "terrorist-incident basis for U.S. action",
      "chronology_or_jurisdiction_basis": "April 1986 Berlin and February 1986 Paris incidents",
      "citation_or_locator": "Document 341 talking points and footnotes 2-3",
      "public_or_archival_basis": "Published footnotes identify the Berlin and Paris bombing references and scheduled Libya; Chad coverage.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 341.",
      "variant_forms": [
        "direct Libyan-sponsored activity against the U.S. in both Berlin and Paris"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d341",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d174-counterterrorism-records-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d174",
      "document_number": "174",
      "unit_scope": "source_note",
      "ile_type": "source_note_agency_provenance",
      "approved_phrase": "Bureau of Counter-Terrorism Records, Papers of L. Paul Bremer II as Ambassador to The Hague and Director of the Office of Counter-Terrorism",
      "case_or_program": "Kuwait Airways Flight 422 hijacking",
      "agency_or_actor": "Bureau of Counter-Terrorism and Office of Counter-Terrorism",
      "stage_or_role": "source-note collection provenance",
      "chronology_or_jurisdiction_basis": "Document 174 source note",
      "citation_or_locator": "Document 174 footnote 1",
      "public_or_archival_basis": "Published source note uses Bureau of Counter-Terrorism Records and Bremer papers collection wording.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 174.",
      "variant_forms": [
        "Office of Counterterrorism Records, Papers of L. Paul Bremer II",
        "Counter-Terrorism Records, Papers of L. Paul Bremer II"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d174",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d175-arrest-warrant-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d175",
      "document_number": "175",
      "unit_scope": "document_text",
      "ile_type": "law_enforcement_case",
      "approved_phrase": "arrest warrant for Izz-al-Din charging him with hostage taking and conspiracy to commit aircraft piracy",
      "case_or_program": "TWA 847 and KU-422 hijacker identification",
      "agency_or_actor": "U.S. District Court, Department of State, Department of Justice",
      "stage_or_role": "criminal charge and warrant language",
      "chronology_or_jurisdiction_basis": "U.S. District Court in Washington, D.C., July 3, 1985",
      "citation_or_locator": "Document 175 paragraph 4",
      "public_or_archival_basis": "Published telegram preserves the specific warrant and charge language.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 175.",
      "variant_forms": [
        "arrest warrant for his role in TWA 847"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d175",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d175-interpol-red-notice-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d175",
      "document_number": "175",
      "unit_scope": "document_text",
      "ile_type": "extradition_or_prosecution",
      "approved_phrase": "red notice through Interpol",
      "case_or_program": "Izz-al-Din provisional arrest request",
      "agency_or_actor": "Interpol, Department of Justice Office of International Affairs, Algeria",
      "stage_or_role": "international arrest request",
      "chronology_or_jurisdiction_basis": "KU-422/TWA 847 law-enforcement response",
      "citation_or_locator": "Document 175 paragraphs 5-6 and source note",
      "public_or_archival_basis": "Published telegram connects the red notice, provisional arrest, and extradition/prosecution caveats.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 175.",
      "variant_forms": [
        "Interpol red notice",
        "red notice through appropriate Interpol channels"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d175",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d178-brought-to-justice-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d178",
      "document_number": "178",
      "unit_scope": "document_text",
      "ile_type": "hostage_hijacking",
      "approved_phrase": "hijackers should be brought to justice",
      "case_or_program": "KU-422 hijacking",
      "agency_or_actor": "Department of State and Government of Algeria",
      "stage_or_role": "counter-hijacking legal principle",
      "chronology_or_jurisdiction_basis": "Washington, April 23, 1988, 0708Z",
      "citation_or_locator": "Document 178 talking points",
      "public_or_archival_basis": "Published telegram uses brought-to-justice language as the policy position.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 178.",
      "variant_forms": [
        "hijackers are brought to justice",
        "bring the hijackers to justice"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d178",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d167-fbi-liaison-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d167",
      "document_number": "167",
      "unit_scope": "document_text",
      "ile_type": "interagency_liaison",
      "approved_phrase": "improve liaison with the FBI",
      "case_or_program": "Algeria security and law-enforcement liaison",
      "agency_or_actor": "FBI and Algerian Interior Minister Khediri",
      "stage_or_role": "liaison request",
      "chronology_or_jurisdiction_basis": "Document 167 Algeria discussion",
      "citation_or_locator": "Document 167",
      "public_or_archival_basis": "Published telegram preserves FBI liaison wording.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 167.",
      "variant_forms": [
        "improve liaison with FBI"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d167",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v24-d167-dea-liaison-001",
      "volume_id": "frus1981-88v24",
      "document_id": "frus1981-88v24/d167",
      "document_number": "167",
      "unit_scope": "document_text",
      "ile_type": "counternarcotics",
      "approved_phrase": "cooperate more closely with DEA",
      "case_or_program": "Algeria narcotics transit concern",
      "agency_or_actor": "DEA and Algerian Interior Minister Khediri",
      "stage_or_role": "counternarcotics liaison",
      "chronology_or_jurisdiction_basis": "Document 167 Algeria discussion",
      "citation_or_locator": "Document 167",
      "public_or_archival_basis": "Published telegram ties DEA liaison to drug-trafficking transit concerns.",
      "source_or_context": "FRUS, 1981-1988, volume XXIV, Document 167.",
      "variant_forms": [
        "cooperate closely with the DEA"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v24/d167",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v01-d291-narcoterrorism-001",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d291",
      "document_number": "291",
      "unit_scope": "public_source_note",
      "ile_type": "counternarcotics",
      "approved_phrase": "narcoterrorism, where the narcotics traffickers provide the money and the terrorists provide the muscle",
      "case_or_program": "Narcotics trafficking and terrorism",
      "agency_or_actor": "Secretary Shultz public address",
      "stage_or_role": "public-source policy formulation",
      "chronology_or_jurisdiction_basis": "Department of State Bulletin, April 1987",
      "citation_or_locator": "Document 291",
      "public_or_archival_basis": "Published Reagan Foundations volume cites Shultz's public formulation of narcoterrorism.",
      "source_or_context": "FRUS, 1981-1988, volume I, Document 291.",
      "variant_forms": [
        "narcotics traffickers provide the money and the terrorists provide the muscle",
        "narcoterrorism"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d291",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    },
    {
      "intelligence_law_enforcement_id": "ile-v31-d23-counter-narcotics-peru-001",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "unit_scope": "source_note",
      "ile_type": "counternarcotics",
      "approved_phrase": "Counter Narcotics in Peru, Review of National Security Review 12--Section IV Regarding Arms Control Implications of Defense Strategy",
      "case_or_program": "Bush NSC meeting file source-note title",
      "agency_or_actor": "George H.W. Bush Library, National Security Council H-Files",
      "stage_or_role": "source-note folder/file title with counternarcotics and START context",
      "chronology_or_jurisdiction_basis": "May 25, 1989 NSC meeting file",
      "citation_or_locator": "Document 23 source note",
      "public_or_archival_basis": "Published START I source note preserves a folder title that includes Counter Narcotics in Peru.",
      "source_or_context": "FRUS, 1989-1992, volume XXXI, Document 23.",
      "variant_forms": [
        "Counter Narcotics in Peru",
        "counter narcotics in Peru"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_intelligence_law_enforcement_record"
    }
  ]
}
```

## Human Rights Refugee And Global Issues Registry Context

Use this to check human-rights reports, Country Reports, refugee, immigration, asylum, migration, famine, emergency relief, food aid, PL 480, Section 416/206, AID/USAID, PRM, HA/HR/IO, WHO/UNICEF/UNDRO/UNEP/WMO, AIDS/HIV, population/UNFPA, environmental/ozone/CFC, whaling, sanctions, waiver, certification, determination, public-report, international-organization, PVO, and global-issues language. Treat report basis, country/population scope, relief stage, legal/program authority, amount/metric, public/archival basis, international-organization role, PVO role, sanctions/waiver status, and environmental/treaty status as comment-only unless the target-volume registry proves the exact direct edit.

```json
{
  "schema_version": "frus-human-rights-refugee-global-issues-registry-v1",
  "human_rights_refugee_global_issues_registry_id": "frus-1981-1992-human-rights-refugee-global-issues-sample-2026-06-04",
  "captured_at": "2026-06-04",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/status-of-the-series",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d37",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d51",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d212",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d220",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d260",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d276",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d349"
  ],
  "scope": "Sample human-rights/refugee/global-issues registry for checking FRUS annotation sheets against Reagan Global Issues II and current 1981-1992 status-page routing. Use it to keep human-rights reports, AIDS/HIV, famine, PL 480, emergency/refugee food aid, population/UNFPA, environmental/ozone, international-organization, public-report, and in-preparation global-issues language tied to published examples before direct edits.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "humanitarian_id": "humanitarian-v41-sources-human-rights-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/sources",
      "document_number": "sources",
      "unit_scope": "source_list",
      "record_type": "source_ecology",
      "approved_phrase": "Lot File 88D242; Subject Files-Human Rights, 1986",
      "issue_area": "Human rights source files",
      "institution_or_actor": "Department of State human-rights records",
      "source_family": "Department of State lot files",
      "public_or_archival_basis": "Published Volume XLI source list identifies human-rights lot files as volume source ecology.",
      "legal_or_program_basis": "source-ecology context only",
      "quantity_or_metric": "",
      "stage_or_status": "published_pattern_source_ecology",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Sources.",
      "variant_forms": [
        "Subject Files-Human Rights, 1986",
        "Subject Files, Human Rights, 1986"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/sources",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d51-country-reports-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d51",
      "document_number": "51",
      "unit_scope": "document_heading_and_text",
      "record_type": "human_rights_public_report",
      "approved_phrase": "Annual Country Reports on Human Rights Practices",
      "issue_area": "Country Reports on Human Rights Practices",
      "institution_or_actor": "Department of State; Ambassadors; Congress; HA; HR; INR; IO; AID",
      "source_family": "Department of State Central Foreign Policy File telegram",
      "public_or_archival_basis": "Published telegram explains the reports prepared for Congress.",
      "legal_or_program_basis": "continuing legal requirement for Country Human Rights Reports to Congress",
      "quantity_or_metric": "first group of reports due September 15",
      "stage_or_status": "report_preparation_and_submission",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 51.",
      "variant_forms": [
        "Country reports on human rights",
        "Country Human Rights Reports"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d51",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d37-hiv-plan-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d37",
      "document_number": "37",
      "unit_scope": "document_text_and_source_note",
      "record_type": "aids_policy",
      "approved_phrase": "three-year plan for international efforts against human immunodeficiency virus (HIV) infection",
      "issue_area": "AIDS/HIV international action plan",
      "institution_or_actor": "Department of State; WHO Global Programme on AIDS; federal departments and agencies",
      "source_family": "Department of State Central Foreign Policy File paper",
      "public_or_archival_basis": "Published Department of State paper with Presidential Commission and WHO/GPA context.",
      "legal_or_program_basis": "FY 1989-1991 international action plan",
      "quantity_or_metric": "142 countries; 124,114 AIDS cases reported worldwide",
      "stage_or_status": "public_health_action_plan",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 37.",
      "variant_forms": [
        "three-year action plan",
        "WHO Global Programme on AIDS"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d37",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d212-third-world-hunger-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d212",
      "document_number": "212",
      "unit_scope": "document_subject",
      "record_type": "famine_policy_and_conference",
      "approved_phrase": "National Security Study Directive (NSSD) on U.S. Third World Hunger Relief",
      "issue_area": "Third World hunger relief and African famine",
      "institution_or_actor": "AID; NSC; McPherson; McFarlane",
      "source_family": "Reagan Library NSC NSSD file",
      "public_or_archival_basis": "Published memorandum from the AID Administrator to the President's Assistant for National Security Affairs.",
      "legal_or_program_basis": "food-assistance policy study context",
      "quantity_or_metric": "",
      "stage_or_status": "policy_study_or_option",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 212.",
      "variant_forms": [
        "U.S. Third World Hunger Relief",
        "Third World Hunger Relief"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d212",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d220-pl480-title-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d220",
      "document_number": "220",
      "unit_scope": "attachment_title",
      "record_type": "pl480_food_assistance",
      "approved_phrase": "USING PL 480 TITLE II FOOD AID FOR EMERGENCY OR REFUGEE RELIEF",
      "issue_area": "Emergency food aid and refugee relief",
      "institution_or_actor": "AID; regional and central bureaus; inter-agency Development Coordination Committee",
      "source_family": "National Archives RG 286 USAID executive secretariat records",
      "public_or_archival_basis": "Published AID policy determination attached to the memorandum.",
      "legal_or_program_basis": "PL 480 Title II emergency or refugee relief",
      "quantity_or_metric": "",
      "stage_or_status": "policy_determination_clearance",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 220.",
      "variant_forms": [
        "Using PL 480 Title II Food Aid for Emergency or Refugee Relief",
        "PL 480 Title II Food Aid for Emergency or Refugee Relief"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d220",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d220-usaid-source-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d220",
      "document_number": "220",
      "unit_scope": "source_note",
      "record_type": "refugee_relief_and_food_assistance",
      "approved_phrase": "National Archives, RG 286, USAID/O/ADMIN/ExecSec, Box 194, ADM (Feb-May) FY 84",
      "issue_area": "AID emergency food aid source provenance",
      "institution_or_actor": "USAID/O/ADMIN/ExecSec",
      "source_family": "National Archives RG 286 USAID records",
      "public_or_archival_basis": "Published source note gives the archival location for the emergency/refugee food-aid policy determination.",
      "legal_or_program_basis": "PL 480 Title II",
      "quantity_or_metric": "",
      "stage_or_status": "policy_determination_clearance",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 220.",
      "variant_forms": [
        "USAID/O/ADMIN/ExecSec, Box 194"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d220",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d276-unfpa-meeting-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d276",
      "document_number": "276",
      "unit_scope": "document_subject",
      "record_type": "population_policy_public_controversy",
      "approved_phrase": "Your Meeting on the US Contribution to UNFPA",
      "issue_area": "UNFPA contribution and China population program",
      "institution_or_actor": "EAP; AID; IO; OES; USUN; UNFPA",
      "source_family": "Department of State Country Files, Miscellaneous Population Files",
      "public_or_archival_basis": "Published memorandum with Hill, media, and UNFPA China program context.",
      "legal_or_program_basis": "UNFPA contribution and abortion/forced-sterilization certification issue",
      "quantity_or_metric": "$50 million contribution to China for 1985-89",
      "stage_or_status": "public_controversy_and_policy_guidance",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 276.",
      "variant_forms": [
        "U.S. Contribution to UNFPA",
        "US contribution to UNFPA"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d276",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d276-unfpa-amount-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d276",
      "document_number": "276",
      "unit_scope": "follow_on_footnote_or_text",
      "record_type": "population_policy_public_controversy",
      "approved_phrase": "$50 million contribution to China for the period 1985-89",
      "issue_area": "UNFPA China program funding",
      "institution_or_actor": "UNFPA; AID; Senate Foreign Relations Committee",
      "source_family": "Department of State Country Files, Miscellaneous Population Files",
      "public_or_archival_basis": "Published memorandum preserves the dollar amount and program period.",
      "legal_or_program_basis": "UNFPA contribution and China population-program controversy",
      "quantity_or_metric": "$50 million; 1985-89",
      "stage_or_status": "public_controversy_and_policy_guidance",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 276.",
      "variant_forms": [
        "$50 million contribution for 1985-1989",
        "$50 million contribution to China for 1985-89"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d276",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d260-population-plan-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d260",
      "document_number": "260",
      "unit_scope": "telegram_text",
      "record_type": "international_organization_relief",
      "approved_phrase": "World Population Plan of Action",
      "issue_area": "UN Population Commission and international population policy",
      "institution_or_actor": "USUN; UN Population Commission; WHO; FAO; World Bank; UNFPA",
      "source_family": "Department of State Central Foreign Policy File telegram",
      "public_or_archival_basis": "Published telegram summarizes UN Population Commission proceedings.",
      "legal_or_program_basis": "World Population Plan of Action and UN Population Conference planning",
      "quantity_or_metric": "twenty-seven member UN Population Commission",
      "stage_or_status": "international_program_coordination",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 260.",
      "variant_forms": [
        "UN Population Commission",
        "International Population Conference"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d260",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d349-ozone-convention-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d349",
      "document_number": "349",
      "unit_scope": "editorial_note",
      "record_type": "environmental_global_issue",
      "approved_phrase": "Convention for the Protection of the Ozone Layer",
      "issue_area": "Protection of the ozone layer",
      "institution_or_actor": "State OES; EPA; UNEP; WMO; Senate",
      "source_family": "Department of State and Reagan Library environmental files",
      "public_or_archival_basis": "Published editorial note traces policy movement toward an ozone-layer agreement.",
      "legal_or_program_basis": "Vienna Convention and ozone-layer agreement context",
      "quantity_or_metric": "",
      "stage_or_status": "treaty_or_protocol_authority",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 349.",
      "variant_forms": [
        "Vienna Convention for the Protection of the Ozone Layer"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d349",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-v41-d349-cfc-protocol-001",
      "volume_id": "frus1981-88v41",
      "document_id": "frus1981-88v41/d349",
      "document_number": "349",
      "unit_scope": "editorial_note",
      "record_type": "environmental_global_issue",
      "approved_phrase": "protocol to control the production and/or use of chlorofluorocarbons",
      "issue_area": "CFC controls and ozone protection",
      "institution_or_actor": "State OES; EPA; Nordic countries",
      "source_family": "Department of State Chemicals, Hazardous Waste, Ozone files",
      "public_or_archival_basis": "Published editorial note describes protocol discussions and EPA position paper context.",
      "legal_or_program_basis": "ozone-layer protocol negotiation context",
      "quantity_or_metric": "world-wide ban on nonessential aerosol uses of CFCs",
      "stage_or_status": "environmental_negotiation",
      "source_or_context": "FRUS, 1981-1988, volume XLI, Document 349.",
      "variant_forms": [
        "protocol to control the production or use of chlorofluorocarbons",
        "CFCs and the ozone layer"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v41/d349",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    },
    {
      "humanitarian_id": "humanitarian-status-global-issues-1989-1992-001",
      "volume_id": "status-of-series",
      "document_id": "status-of-series",
      "document_number": "status",
      "unit_scope": "status_page",
      "record_type": "status_page_family_context",
      "approved_phrase": "1989-1992, Volume XXIX, Global Issues",
      "issue_area": "Bush Global Issues planned volume routing",
      "institution_or_actor": "Office of the Historian",
      "source_family": "Status of the Foreign Relations Series",
      "public_or_archival_basis": "Official status page gives routing context only; it is not source-note provenance.",
      "legal_or_program_basis": "status routing context only",
      "quantity_or_metric": "",
      "stage_or_status": "routing_and_review_posture_only",
      "source_or_context": "Status of the Foreign Relations Series.",
      "variant_forms": [
        "Global Issues",
        "1981-1988, Volume XLII, Refugees and Immigration, 1975-1984"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
      "verification_status": "verified_published_human_rights_refugee_global_issues_record"
    }
  ]
}
```

## Footnote Refer-Back Registry Context

Use this to check repeated-reference footnote discipline in follow-on footnotes and source notes. Reagan Foundations models cross-document `footnote N, Document X`, plural same-document `footnotes N and M, Document X`, mixed `footnote N, Document X and Document Y`, same-document `above` or local above-context, and `Document X and footnote Y thereto`; Document 146 separately models a three-target footnote/document cluster. Apply the registry `repeat_threshold`: the first and second full citation occurrences may stand, but the third full citation occurrence itself and every later full citation occurrence, including plain source-note citations outside parentheses, are production-review triggers for a possible refer-back. Do not wait for a fourth occurrence. Do not invent refer-back targets or directly replace a repeated full citation unless the registry proves the exact published target form.

```json
{
  "schema_version": "frus-footnote-referback-registry-v1",
  "footnote_referback_registry_id": "frus-reagan-foundations-footnote-referback-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d45",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d56",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d70",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d74",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d217",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d267",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "scope": "Sample registry of published Reagan Foundations footnote refer-back forms for checking FRUS annotation-sheet footnotes and source-note citations without inventing targets.",
  "rule_summary": "Use refer-backs after repeated references instead of restating full citation detail: whether the repeated citation is parenthetical or plain source-note text, the third full citation occurrence of the same citation is the first human review trigger for a proper footnote refer-back, and every later full citation occurrence remains a review unit. Do not wait for a fourth occurrence. Do not exempt a footnote merely because the same note already contains a valid refer-back; the repeated full citation in that mixed note still counts. Cross-document targets take `footnote N, Document X`; plural same-document targets can take `footnotes N and M, Document X`; same-document targets require `above`/`below` or equivalent local context; `Document X and footnote Y thereto` ties the footnote to the named document; Document 146 separately models a three-target footnote/document cluster. Repeated-citation matching must catch both Reagan Foundations Public Papers forms with Book markers and no-Book forms such as `Public Papers: Reagan, 1981, p. 1156`.",
  "repeat_threshold": 3,
  "repeat_threshold_action": "The first and second full citation occurrences may stand; on the third full citation occurrence itself and every later full citation occurrence, whether parenthetical or plain source-note text, require a comment-only review to confirm whether the reference should become a Reagan Foundations-style footnote refer-back. Do not wait for a fourth occurrence, do not exempt mixed notes that already contain a valid refer-back, and do not rewrite unless the target footnote/document is verified in the registry.",
  "target_volume": "frus1989-92v31",
  "target_records": [],
  "records": [
    {
      "referback_id": "referback-v01-d45-fn2-d35fn6",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d45",
      "source_document_number": "45",
      "source_unit_label": "footnote 2",
      "referback_type": "cross_document_footnote",
      "approved_phrase": "See footnote 6, Document 35",
      "variant_forms": [
        "see footnote 6, Document 35"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d35",
          "target_document_number": "35",
          "target_footnote_number": "6",
          "target_label": "footnote 6, Document 35",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d35"
        }
      ],
      "rule_basis": "Document 45 models the standard cross-document refer-back construction.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d45",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d45-fn5-d34-thereto",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d45",
      "source_document_number": "45",
      "source_unit_label": "footnote 5",
      "referback_type": "document_and_thereto",
      "approved_phrase": "See Document 34 and footnote 2 thereto",
      "variant_forms": [
        "Document 34 and footnote 2 thereto"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d34",
          "target_document_number": "34",
          "target_footnote_number": "2",
          "target_label": "Document 34, footnote 2",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d34"
        }
      ],
      "rule_basis": "Document 45 ties the footnote reference to the named document with `thereto`.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d45",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d56-fn3-d53-fn12-13",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d56",
      "source_document_number": "56",
      "source_unit_label": "footnote 3",
      "referback_type": "plural_footnotes_same_document",
      "approved_phrase": "See footnotes 12 and 13, Document 53",
      "variant_forms": [
        "see footnotes 12 and 13, Document 53"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d53",
          "target_document_number": "53",
          "target_footnote_number": "12",
          "target_label": "footnote 12, Document 53",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d53"
        },
        {
          "target_document_id": "frus1981-88v01/d53",
          "target_document_number": "53",
          "target_footnote_number": "13",
          "target_label": "footnote 13, Document 53",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d53"
        }
      ],
      "rule_basis": "Document 56 models plural footnote targets in a single target document.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d56",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d56-fn7-d48-fn3-6",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d56",
      "source_document_number": "56",
      "source_unit_label": "footnote 7",
      "referback_type": "plural_footnotes_same_document",
      "approved_phrase": "See footnotes 3 and 6, Document 48",
      "variant_forms": [
        "see footnotes 3 and 6, Document 48"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d48",
          "target_document_number": "48",
          "target_footnote_number": "3",
          "target_label": "footnote 3, Document 48",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d48"
        },
        {
          "target_document_id": "frus1981-88v01/d48",
          "target_document_number": "48",
          "target_footnote_number": "6",
          "target_label": "footnote 6, Document 48",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d48"
        }
      ],
      "rule_basis": "Document 56 repeats the plural same-document-footnotes construction.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d56",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d70-fn8-d65-d66",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d70",
      "source_document_number": "70",
      "source_unit_label": "footnote 8",
      "referback_type": "mixed_footnote_document_reference",
      "approved_phrase": "See footnote 8, Document 65 and Document 66",
      "variant_forms": [
        "see footnote 8, Document 65 and Document 66"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d65",
          "target_document_number": "65",
          "target_footnote_number": "8",
          "target_label": "footnote 8, Document 65",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d65"
        },
        {
          "target_document_id": "frus1981-88v01/d66",
          "target_document_number": "66",
          "target_footnote_number": "",
          "target_label": "Document 66",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d66"
        }
      ],
      "rule_basis": "Document 70 models a mixed footnote/document refer-back where one target is a footnote and the second target is a document.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d70",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d74-fn4-d56-d69",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d74",
      "source_document_number": "74",
      "source_unit_label": "footnote 4",
      "referback_type": "multi_target_footnote_cluster",
      "approved_phrase": "See footnote 9, Document 56 and footnote 4, Document 69",
      "variant_forms": [
        "see footnote 9, Document 56 and footnote 4, Document 69"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d56",
          "target_document_number": "56",
          "target_footnote_number": "9",
          "target_label": "footnote 9, Document 56",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d56"
        },
        {
          "target_document_id": "frus1981-88v01/d69",
          "target_document_number": "69",
          "target_footnote_number": "4",
          "target_label": "footnote 4, Document 69",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d69"
        }
      ],
      "rule_basis": "Document 74 combines two cross-document footnote targets in one note.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d74",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d146-fn14-three-targets",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d146",
      "source_document_number": "146",
      "source_unit_label": "footnote 14",
      "referback_type": "multi_target_footnote_cluster",
      "approved_phrase": "see footnote 7, Document 100, footnote 3, Document 104 and footnote 15, Document 106",
      "variant_forms": [
        "See footnote 7, Document 100, footnote 3, Document 104 and footnote 15, Document 106"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d100",
          "target_document_number": "100",
          "target_footnote_number": "7",
          "target_label": "footnote 7, Document 100",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d100"
        },
        {
          "target_document_id": "frus1981-88v01/d104",
          "target_document_number": "104",
          "target_footnote_number": "3",
          "target_label": "footnote 3, Document 104",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d104"
        },
        {
          "target_document_id": "frus1981-88v01/d106",
          "target_document_number": "106",
          "target_footnote_number": "15",
          "target_label": "footnote 15, Document 106",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d106"
        }
      ],
      "rule_basis": "Document 146 models a three-target refer-back cluster; use it as a form model, while treating the third full citation occurrence as the separate three-times review trigger.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d146",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d217-fn10-local-context",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d217",
      "source_document_number": "217",
      "source_unit_label": "footnote 10",
      "referback_type": "same_document_local_context",
      "approved_phrase": "same separate page as B above (see footnote 9)",
      "variant_forms": [
        "B above (see footnote 9)"
      ],
      "target_references": [
        {
          "target_document_id": "",
          "target_document_number": "",
          "target_footnote_number": "9",
          "target_label": "same-document footnote 9",
          "target_url": ""
        }
      ],
      "rule_basis": "Document 217 shows that a same-document bare footnote reference can be acceptable when the sentence supplies the above/local context.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d217",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d267-fn2-d244-thereto",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d267",
      "source_document_number": "267",
      "source_unit_label": "footnote 2",
      "referback_type": "document_and_thereto",
      "approved_phrase": "See Document 244 and footnote 2 thereto",
      "variant_forms": [
        "Document 244 and footnote 2 thereto"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d244",
          "target_document_number": "244",
          "target_footnote_number": "2",
          "target_label": "Document 244, footnote 2",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d244"
        }
      ],
      "rule_basis": "Document 267 repeats the `Document X and footnote Y thereto` construction.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d267",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d316-fn2-d265-d312",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d316",
      "source_document_number": "316",
      "source_unit_label": "footnote 2",
      "referback_type": "multi_target_footnote_cluster",
      "approved_phrase": "see footnote 6, Document 265 and footnote 2, Document 312",
      "variant_forms": [
        "See footnote 6, Document 265 and footnote 2, Document 312"
      ],
      "target_references": [
        {
          "target_document_id": "frus1981-88v01/d265",
          "target_document_number": "265",
          "target_footnote_number": "6",
          "target_label": "footnote 6, Document 265",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d265"
        },
        {
          "target_document_id": "frus1981-88v01/d312",
          "target_document_number": "312",
          "target_footnote_number": "2",
          "target_label": "footnote 2, Document 312",
          "target_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d312"
        }
      ],
      "rule_basis": "Document 316 uses two prior footnotes as the proper alternative to repeating full Free Trade Agreement citation detail.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d316",
      "verification_status": "verified_published_form"
    },
    {
      "referback_id": "referback-v01-d316-fn9-above",
      "volume_id": "frus1981-88v01",
      "source_document_id": "frus1981-88v01/d316",
      "source_document_number": "316",
      "source_unit_label": "footnote 9",
      "referback_type": "same_document_above",
      "approved_phrase": "see footnote 5, above",
      "variant_forms": [
        "See footnote 5, above"
      ],
      "target_references": [
        {
          "target_document_id": "",
          "target_document_number": "",
          "target_footnote_number": "5",
          "target_label": "same-document footnote 5 above",
          "target_url": ""
        }
      ],
      "rule_basis": "Document 316 models explicit same-document `above` punctuation.",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d316",
      "verification_status": "verified_published_form"
    }
  ]
}
```

## Recurring Compiler Risk Registry Context

Use this as a practical spellcheck list for recurring compiler mistakes: leading-zero telegram numbers, non-State telegram copies without eRecords/drafting checks, incomplete cross-reference slugs, missing page breaks, old heading-footnote practice, Word autoformatting, incomplete documents or source notes, unhighlighted quoted backup text, missing telegram headers/film numbers, and Style Guide inconsistency. Treat these as generalized risk checks, not as personal criticism.

```json
{
  "schema_version": "frus-recurring-risk-registry-v1",
  "recurring_risk_registry_id": "frus-recurring-compiler-risk-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_basis": "Compiler self-disclosure supplied by James Wilson on June 3, 2026; generalized as recurring risks that other compilers and reviewers may also share. Document-reference and footnote-referback forms are checked against Reagan Foundations published examples in FRUS, 1981-1988, volume I, including Documents 45, 56, 70, 74, 146, 217, 267, and 316.",
  "scope": "Practical spellcheck-style risk register for recurrent FRUS annotation-sheet mistakes: telegram number zeros, eRecords copy basis, cross-reference slugs, Document XX construction, footnote refer-back discipline, page breaks, footnote placement, Word autoformatting, incomplete documents/source notes/backups, quote highlighting, telegram headers, and Style Guide consistency.",
  "records": [
    {
      "risk_id": "risk-telegram-leading-zero",
      "risk_family": "telegram_numbering",
      "title": "Telegram number has a leading zero",
      "anti_pattern": "Leading zeros creep into telegram numbers.",
      "approved_practice": "Strip leading zeros from telegram numbers unless the source image proves the zero is part of a non-telegram identifier.",
      "unit_types": [
        "source_note",
        "follow_on_footnote",
        "editorial_note",
        "communications_metadata",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:telegram|tel\\.?|D|P|N|TOSEC|SECTO)\\s+0\\d{2,}\\b"
      ],
      "direct_edit_policy": "allow_exact_cleanup",
      "evidence_request": "communications_metadata",
      "comment_template": "Check whether this telegram number has an unintended leading zero. FRUS style should not preserve compiler-added leading zeros in telegram numbers.",
      "severity": "minor",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "telegram 01234",
        "TOSEC 000123",
        "SECTO 00045"
      ]
    },
    {
      "risk_id": "risk-telegram-non-state-copy",
      "risk_family": "telegram_copy_basis",
      "title": "Telegram sourced from WHSR/NSC copy without eRecords/drafting check",
      "anti_pattern": "Relying on White House Situation Room or NSC copies of telegrams, especially outgoing Nodis telegrams, without going back to eRecords for the Department of State copy and drafting information.",
      "approved_practice": "Use eRecords/Department of State telegram copies when available; when WHSR or NSC copies are genuinely needed, capture outgoing drafting, clearance, approval, and header data from eRecords if possible.",
      "unit_types": [
        "source_note",
        "source_list_entry",
        "communications_metadata",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:White House Situation Room|WHSR|NSC copy|National Security Council copy)\\b(?:(?!eRecords|Central Foreign Policy File|Department of State).){0,240}\\b(?:telegram|Nodis|outgoing)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "communications_metadata",
      "comment_template": "Confirm whether an eRecords/Department of State telegram copy exists and whether outgoing drafting information has been captured before finalizing this source note.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "WHSR copy of outgoing Nodis telegram",
        "NSC version of telegram without eRecords drafting data"
      ]
    },
    {
      "risk_id": "risk-cross-reference-slug-incomplete",
      "risk_family": "cross_reference_slug",
      "title": "Cross-reference slug or clue is incomplete",
      "anti_pattern": "Cross-reference clues lack date, sender/recipient, document type, and an above/below/chapter indicator.",
      "approved_practice": "Before final review, complete intra-volume and inter-volume slugs with date, sender/recipient, type, and above/below/chapter indicator, all struck through if they remain compiler-facing clues.",
      "unit_types": [
        "editorial_note",
        "follow_on_footnote",
        "source_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:xref|cross[- ]reference|slug|clue|See Document\\s+(?:TK|TBD)|above\\/below|chapter\\?)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "cross_reference",
      "comment_template": "Complete the cross-reference clue with date, sender/recipient, document type, and above/below/chapter indicator before final style review.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "xref TK",
        "slug incomplete",
        "See Document TK",
        "above/below"
      ]
    },
    {
      "risk_id": "risk-document-xx-construction",
      "risk_family": "document_xx_construction",
      "title": "Document XX cross-reference construction is incomplete or malformed",
      "anti_pattern": "Using Document XX, Doc. XX, Document TK/TBD, or a bare/malformed internal Document reference in annotation-sheet clues.",
      "approved_practice": "For published internal references, follow Reagan Foundations forms such as `See Document 69.`, `Printed as Document 155.`, `see footnote 9, Document 56`, and `See Document 34 and footnote 2 thereto.` For compiler-facing annotation-sheet clues, finish the struck-through bracketed clue with date, sender/recipient, document type, and above/below/chapter indicator before handoff.",
      "unit_types": [
        "editorial_note",
        "follow_on_footnote",
        "source_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:Doc(?:ument)?\\.?\\s+(?:XX|TK|TBD)|Document\\s+\\[?xx\\]?|Document\\s+\\?\\?|Document\\s+\\d+\\s*\\[(?:(?!\\b(?:above|below|chapter)\\b).){0,80}\\])\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "cross_reference",
      "comment_template": "Check this Document cross-reference construction against the target volume. If it remains a compiler-facing clue, complete the date, sender/recipient, document type, and above/below/chapter locator; if it is final apparatus, use the published FRUS form.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession and follow-up note; Reagan Foundations published examples: Documents 45, 74, 161, and 316.",
      "variant_forms": [
        "Document XX",
        "Doc. XX",
        "Document TK",
        "Document 4 [date only]",
        "See footnote 9, Document 56"
      ]
    },
    {
      "risk_id": "risk-document-page-break-missing",
      "risk_family": "document_boundary",
      "title": "Page break may be missing between document annotations",
      "anti_pattern": "Annotations for separate documents run together because page breaks were not inserted.",
      "approved_practice": "Insert a page break between document annotations before handoff unless the production template explicitly manages document boundaries.",
      "unit_types": [
        "document_heading",
        "unknown_editorial_text",
        "front_matter"
      ],
      "detector_patterns": [
        "\\b(?:page break missing|missing page break|insert page break|no page break between documents)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "wrapper_safety",
      "comment_template": "Check document boundary formatting and insert the missing page break before editor handoff.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "page break missing",
        "no page break between document annotations"
      ]
    },
    {
      "risk_id": "risk-first-footnote-on-heading",
      "risk_family": "footnote_placement",
      "title": "First footnote remains attached to document heading",
      "anti_pattern": "The first footnote sits on the document heading although current practice no longer requires it.",
      "approved_practice": "Do not retain the first footnote on the document heading merely because that used to be standard; place source-note apparatus where current FRUS practice requires.",
      "unit_types": [
        "document_heading",
        "source_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:first footnote on (?:the )?document heading|heading footnote|source note on heading)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "wrapper_safety",
      "comment_template": "Check whether the first footnote is still attached to the document heading under an older practice and should be moved.",
      "severity": "minor",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "first footnote on document heading",
        "heading footnote"
      ]
    },
    {
      "risk_id": "risk-footnote-referback-three-times",
      "risk_family": "footnote_referback",
      "title": "Footnote refer-back rule may be missed after repeated references",
      "anti_pattern": "Forgetting the refer back 3 times rule, repeating full citation/source details after the threshold for a refer-back has been reached, or using a bare see-footnote construction without Document or above/below context.",
      "approved_practice": "After repeated references to the same item, refer back rather than reciting the citation again: within the same document use `see footnote 5, above` or a bare same-document parenthetical only when the sentence itself supplies the above/below context; across documents use `see footnote 9, Document 56`, plural `See footnotes 12 and 13, Document 53`, mixed `See footnote 8, Document 65 and Document 66`, `see footnote 6, Document 265 and footnote 2, Document 312`, or `See Document 34 and footnote 2 thereto`; straight document references use `See Document 69.` Treat the third full citation occurrence itself and every later full citation occurrence, including plain source-note citations outside parentheses, as production-review triggers requiring human confirmation of the target. Do not wait for a fourth occurrence.",
      "unit_types": [
        "follow_on_footnote",
        "editorial_note",
        "source_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\brefer[- ]?back\\s+(?:3|three)[- ]times\\s+rule\\b",
        "\\b(?:refer back|three[- ]times|3[- ]times|third reference|repeat(?:ed|ing)? full citation)\\b",
        "\\bsee footnotes?\\s+(?:TK|TBD|XX|\\?\\?)\\b",
        "\\bsee footnotes?\\s+\\d+(?:\\s*(?:,|and)\\s*\\d+)*\\b(?!(?:,\\s*(?:above|below|Document\\s+\\d+)|\\s+thereto))"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "cross_reference",
      "comment_template": "Check whether this repeated reference has reached the refer back 3 times rule. The third full citation occurrence itself is the first review trigger; Reagan Foundations models same-document `see footnote N, above`, same-document local-context `B above (see footnote N)`, cross-document `see footnote N, Document X`, plural `See footnotes N and M, Document X`, and mixed `See footnote N, Document X and Document Y` forms; confirm the target before rewriting.",
      "severity": "major",
      "source_basis": "James Wilson follow-up note on the footnote refer-back rule; Reagan Foundations published examples: Documents 45, 56, 70, 74, 146, 217, 267, and 316.",
      "variant_forms": [
        "refer back 3 times rule",
        "refer-back three times rule",
        "third reference repeats full citation",
        "see footnote TK",
        "see footnotes 12 and 13, Document 53",
        "see footnote 5",
        "B above (see footnote 9)",
        "see footnote 5, above",
        "see footnote 9, Document 56"
      ]
    },
    {
      "risk_id": "risk-word-autoformat-footnotes",
      "risk_family": "word_autoformatting",
      "title": "Word auto-numbering or auto-formatting may have shaped footnotes",
      "anti_pattern": "Auto-numbering and auto-formatting remain enabled and can corrupt or obscure FRUS footnote form.",
      "approved_practice": "Turn off Word auto-numbering/auto-formatting for production footnotes and manually verify numbering/formatting before handoff.",
      "unit_types": [
        "source_note",
        "follow_on_footnote",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:auto[- ]numbering|auto[- ]formatting|Word autoformat|automatic footnote numbering)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "wrapper_safety",
      "comment_template": "Verify that Word auto-numbering/auto-formatting has not controlled FRUS footnote form.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "auto-numbering footnotes",
        "Word autoformat footnotes"
      ]
    },
    {
      "risk_id": "risk-incomplete-document-pages",
      "risk_family": "document_completeness",
      "title": "Document may be incomplete or missing pages",
      "anti_pattern": "Incomplete documents are turned in, sometimes with pages missing outright.",
      "approved_practice": "Confirm page completeness against the source image, scan, or backup before final style review.",
      "unit_types": [
        "source_note",
        "editorial_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:incomplete document|pages? missing|missing pages?|partial copy|incomplete copy)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "source_image",
      "comment_template": "Verify document completeness and recover missing pages before finalizing the annotation sheet.",
      "severity": "critical",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "pages missing",
        "incomplete copy",
        "partial document"
      ]
    },
    {
      "risk_id": "risk-source-note-shorthand",
      "risk_family": "source_note_shorthand",
      "title": "Source note still contains compiler shorthand",
      "anti_pattern": "Source notes remain incomplete or carry compiler shorthand.",
      "approved_practice": "Expand shorthand into final FRUS source-note form before redline handoff; unresolved shorthand belongs in comments or the evidence queue, not publishable apparatus.",
      "unit_types": [
        "source_note",
        "source_list_entry",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:SN\\s*TK|source note\\s+(?:TK|TBD|incomplete)|compiler(?:'s)? shorthand|JGW note|TK source|fill source)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "archival_path",
      "comment_template": "Expand compiler shorthand into final source-note form or move the unresolved item to an evidence-request comment.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "SN TK",
        "source note incomplete",
        "compiler shorthand",
        "TK source"
      ]
    },
    {
      "risk_id": "risk-backup-quote-highlighting",
      "risk_family": "backup_highlighting",
      "title": "Quoted material in backup may not be highlighted",
      "anti_pattern": "Quoted material in backup documents is not highlighted for editors.",
      "approved_practice": "Highlight quoted material in backup documents so editors can verify quotations quickly.",
      "unit_types": [
        "editorial_note",
        "source_note",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:quoted material (?:not )?highlighted|quote not highlighted|unhighlighted quote|highlight quoted material)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "source_image",
      "comment_template": "Confirm the backup document highlights all quoted material used in the annotation sheet.",
      "severity": "minor",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "quote not highlighted",
        "quoted material not highlighted"
      ]
    },
    {
      "risk_id": "risk-backup-telegram-header-film",
      "risk_family": "backup_telegram_header",
      "title": "Backup telegram copy may omit header or film/reel numbers",
      "anti_pattern": "Backup telegram copies omit header information, including film number, preventing editors from verifying D, P, and N reel numbers.",
      "approved_practice": "Print backup telegram headers, including film number and D/P/N reel data, so editors can verify the communications metadata.",
      "unit_types": [
        "source_note",
        "communications_metadata",
        "unknown_editorial_text"
      ],
      "detector_patterns": [
        "\\b(?:header information missing|film number missing|D,? P,? and N reel|D reel|P reel|N reel|telegram header)\\b"
      ],
      "direct_edit_policy": "comment_only_by_default",
      "evidence_request": "communications_metadata",
      "comment_template": "Verify that the backup telegram copy includes the full header, film number, and D/P/N reel information.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "film number missing",
        "D/P/N reel numbers",
        "telegram header missing"
      ]
    },
    {
      "risk_id": "risk-style-guide-inconsistency",
      "risk_family": "style_consistency",
      "title": "Style Guide adherence is inconsistent",
      "anti_pattern": "The sheet is inconsistent about adhering to the FRUS Style Guide.",
      "approved_practice": "Use the checker as a bespoke spellcheck pass for Style Guide consistency; tally recurring unresolved variants separately for General Editor decision.",
      "unit_types": [
        "*",
        "source_note",
        "editorial_note",
        "follow_on_footnote"
      ],
      "detector_patterns": [
        "\\b(?:Style Guide inconsistency|inconsistent style|reviewer inconsistency|not adhering to the Style Guide)\\b"
      ],
      "direct_edit_policy": "comment_unless_context",
      "evidence_request": "wrapper_safety",
      "comment_template": "Run a final Style Guide consistency pass and move unresolved recurring variants to the General Editor discrepancy tally.",
      "severity": "major",
      "source_basis": "James Wilson recurring-risk confession generalized for all compiler sheets.",
      "variant_forms": [
        "Style Guide inconsistency",
        "inconsistent style",
        "reviewer inconsistency"
      ]
    }
  ]
}
```

## Negative Search And No-Record Registry Context

Use this to check `No minutes were found`, `Not found`, `Not attached`, `Not found attached`, no-memcon/no-telcon, missing-attachment, and RAC attachment-ambiguity language. Do not collapse one no-record relationship into another unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-negative-search-registry-v1",
  "negative_search_registry_id": "frus-1981-1992-negative-search-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d69",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d128",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d294",
    "https://history.state.gov/historicaldocuments/frus1981-88v03/AbouttheSeries"
  ],
  "scope": "Sample negative-search/no-record registry for validating FRUS phrases that report missing minutes, not-found records, not-attached items, and RAC attachment ambiguity in Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "negative_search_id": "negative-v31-d23-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "record_type": "minutes",
      "approved_phrase": "No minutes were found",
      "variant_forms": [
        "No minutes found",
        "No record of minutes was found"
      ],
      "search_scope_or_basis": "President's Daily Diary and NSC meeting context in the published source note.",
      "relationship_to_document": "meeting_record_absent",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d23-not-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "record_type": "attachment",
      "approved_phrase": "Not attached",
      "variant_forms": [
        "Attachment not attached"
      ],
      "search_scope_or_basis": "Footnote 3 distinguishes absence of attachment from the separate printed Tab A cross-reference.",
      "relationship_to_document": "attachment_not_attached",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d69-not-found",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d69",
      "document_number": "69",
      "record_type": "draft",
      "approved_phrase": "Not found",
      "variant_forms": [
        "Draft not found",
        "Not located"
      ],
      "search_scope_or_basis": "Footnote 4 reports an early draft not found in the published document apparatus.",
      "relationship_to_document": "record_not_found",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d69",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d128-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d128",
      "document_number": "128",
      "record_type": "minutes",
      "approved_phrase": "No minutes were found",
      "variant_forms": [
        "No minutes found"
      ],
      "search_scope_or_basis": "Follow-on footnote in a Baker-Shevardnadze exchange; separate from the attached-but-not-printed draft notification annex.",
      "relationship_to_document": "meeting_record_absent",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d128",
      "verification_status": "verified_published_negative_search"
    }
  ],
  "records": [
    {
      "negative_search_id": "negative-v31-d23-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "record_type": "minutes",
      "approved_phrase": "No minutes were found",
      "variant_forms": [
        "No minutes found",
        "No record of minutes was found"
      ],
      "search_scope_or_basis": "President's Daily Diary and NSC meeting context in the published source note.",
      "relationship_to_document": "meeting_record_absent",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d23-not-attached",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d23",
      "document_number": "23",
      "record_type": "attachment",
      "approved_phrase": "Not attached",
      "variant_forms": [
        "Attachment not attached"
      ],
      "search_scope_or_basis": "Footnote 3 distinguishes absence of attachment from the separate printed Tab A cross-reference.",
      "relationship_to_document": "attachment_not_attached",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d69-not-found",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d69",
      "document_number": "69",
      "record_type": "draft",
      "approved_phrase": "Not found",
      "variant_forms": [
        "Draft not found",
        "Not located"
      ],
      "search_scope_or_basis": "Footnote 4 reports an early draft not found in the published document apparatus.",
      "relationship_to_document": "record_not_found",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d69",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v31-d128-no-minutes",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d128",
      "document_number": "128",
      "record_type": "minutes",
      "approved_phrase": "No minutes were found",
      "variant_forms": [
        "No minutes found"
      ],
      "search_scope_or_basis": "Follow-on footnote in a Baker-Shevardnadze exchange; separate from the attached-but-not-printed draft notification annex.",
      "relationship_to_document": "meeting_record_absent",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d128",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-v44p1-d294-no-formal-minutes",
      "volume_id": "frus1981-88v44p1",
      "document_id": "frus1981-88v44p1/d294",
      "document_number": "294",
      "record_type": "minutes",
      "approved_phrase": "No formal minutes were found",
      "variant_forms": [
        "No minutes were found",
        "No formal minutes found"
      ],
      "search_scope_or_basis": "Editorial note cites the Reagan Library President's Daily Diary for the briefing context.",
      "relationship_to_document": "meeting_record_absent",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d294",
      "verification_status": "verified_published_negative_search"
    },
    {
      "negative_search_id": "negative-reagan-rac-not-found-attached",
      "volume_id": "frus1981-88v03",
      "document_id": "frus1981-88v03/AbouttheSeries",
      "document_number": "front-matter",
      "record_type": "attachment",
      "approved_phrase": "Not found attached",
      "variant_forms": [
        "Attachment was not found attached"
      ],
      "search_scope_or_basis": "About the Series explains RAC attachment ambiguity and the editorial phrase `Not found attached.`",
      "relationship_to_document": "rac_attachment_ambiguity",
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v03/AbouttheSeries",
      "verification_status": "verified_published_negative_search"
    }
  ]
}
```

## Document Relationship Registry Context

Use this to check `Attached but not printed`, `Printed as Document [n]`, `See Document [n]`, tab/enclosure references, not-attached items, and mixed attachment notes. Do not change target document numbers, tab labels, or attachment status unless the registry proves the same source-document relationship.

```json
{
  "schema_version": "frus-document-relationship-registry-v1",
  "document_relationship_registry_id": "frus-1981-1992-document-relationship-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d128"
  ],
  "scope": "Sample document-relationship registry for validating attachment, printed-target, same-volume cross-reference, and not-attached language in Reagan and George H.W. Bush FRUS annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "relationship_id": "relationship-v31-d2-fn2-attachment-d1",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d2",
      "source_document_number": "2",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Attachment, Document 1",
      "variant_forms": [
        "Attached but not printed. See Document 1",
        "See Attachment, Document 1"
      ],
      "relationship_basis": "Document 2 footnote 2 distinguishes the unprinted attachment from the printed attachment embedded with Document 1.",
      "target_document_id": "frus1989-92v31/d1",
      "target_document_number": "1",
      "target_label": "Attachment, Document 1",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d8-fn2-document-10",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d8",
      "source_document_number": "8",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Document 10",
      "variant_forms": [
        "See Document 10",
        "Attached but not printed, see Document 10"
      ],
      "relationship_basis": "Document 8 footnote 2 points the unprinted attachment to a separately printed target document.",
      "target_document_id": "frus1989-92v31/d10",
      "target_document_number": "10",
      "target_label": "Document 10",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d8-fn3-document-9",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d8",
      "source_document_number": "8",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Document 9",
      "variant_forms": [
        "See Document 9",
        "Attached but not printed, see Document 9"
      ],
      "relationship_basis": "Document 8 footnote 3 points the forwarding memorandum to a separately printed target document.",
      "target_document_id": "frus1989-92v31/d9",
      "target_document_number": "9",
      "target_label": "Document 9",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn2-tab-a-document-21",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Tab A, Document 21",
      "variant_forms": [
        "See Tab A, Document 21",
        "Attached but not printed. See Document 21"
      ],
      "relationship_basis": "Document 23 footnote 2 points the discussion paper at Tab A to Document 21.",
      "target_document_id": "frus1989-92v31/d21",
      "target_document_number": "21",
      "target_label": "Tab A, Document 21",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn3-not-attached",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 3",
      "relationship_type": "not_attached",
      "approved_phrase": "Not attached",
      "variant_forms": [
        "The item was not attached"
      ],
      "relationship_basis": "Document 23 footnote 3 reports an absent attachment and does not point to a printed target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn4-agenda",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 4",
      "relationship_type": "attached_but_not_printed_no_target",
      "approved_phrase": "Attached but not printed is the agenda",
      "variant_forms": [
        "The agenda is attached but not printed",
        "Attached but not printed: agenda"
      ],
      "relationship_basis": "Document 23 footnote 4 identifies an unprinted agenda without a separate printed document target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "agenda",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn2-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 2",
      "relationship_type": "printed_as_document",
      "approved_phrase": "Printed as Document 26",
      "variant_forms": [
        "The memorandum is printed as Document 26",
        "printed as Document 26"
      ],
      "relationship_basis": "Document 25 footnotes 2 and 7 point readers to the printed memorandum at Document 26.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn3-tabs-d1-d2-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Tabs D1 and D2, Document 26",
      "variant_forms": [
        "See Tabs D1 and D2, Document 26",
        "Attached but not printed. See Document 26"
      ],
      "relationship_basis": "Document 25 footnote 3 links unprinted tabs to the separately printed Document 26 apparatus.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Tabs D1 and D2, Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn8-tabs-a-b-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 8",
      "relationship_type": "mixed_not_attached_and_printed_tabs",
      "approved_phrase": "The List of Participants, cited here as Tab C, was not attached. The Talking Points and Agenda for the June 7 NSC meeting are printed as Tab A and Tab B, Document 26",
      "variant_forms": [
        "Tab C was not attached. Tab A and Tab B are printed as Document 26",
        "Talking Points and Agenda are printed as Tab A and Tab B, Document 26"
      ],
      "relationship_basis": "Document 25 footnote 8 combines a not-attached participant list with printed tab targets in Document 26.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Tab A and Tab B, Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d128-fn3-notification-annex",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d128",
      "source_document_number": "128",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_no_target",
      "approved_phrase": "Attached but not printed is a copy of the draft Notification Annex covering the arrival of the first missile of a new type of long-range non-nuclear ALCM",
      "variant_forms": [
        "The draft Notification Annex is attached but not printed",
        "Attached but not printed: draft Notification Annex"
      ],
      "relationship_basis": "Document 128 footnote 3 describes an attached draft Notification Annex without a separate printed target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "draft Notification Annex",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d128",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    }
  ],
  "records": [
    {
      "relationship_id": "relationship-v31-d2-fn2-attachment-d1",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d2",
      "source_document_number": "2",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Attachment, Document 1",
      "variant_forms": [
        "Attached but not printed. See Document 1",
        "See Attachment, Document 1"
      ],
      "relationship_basis": "Document 2 footnote 2 distinguishes the unprinted attachment from the printed attachment embedded with Document 1.",
      "target_document_id": "frus1989-92v31/d1",
      "target_document_number": "1",
      "target_label": "Attachment, Document 1",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d2",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d8-fn2-document-10",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d8",
      "source_document_number": "8",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Document 10",
      "variant_forms": [
        "See Document 10",
        "Attached but not printed, see Document 10"
      ],
      "relationship_basis": "Document 8 footnote 2 points the unprinted attachment to a separately printed target document.",
      "target_document_id": "frus1989-92v31/d10",
      "target_document_number": "10",
      "target_label": "Document 10",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d10",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d8-fn3-document-9",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d8",
      "source_document_number": "8",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Document 9",
      "variant_forms": [
        "See Document 9",
        "Attached but not printed, see Document 9"
      ],
      "relationship_basis": "Document 8 footnote 3 points the forwarding memorandum to a separately printed target document.",
      "target_document_id": "frus1989-92v31/d9",
      "target_document_number": "9",
      "target_label": "Document 9",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d8",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn2-tab-a-document-21",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 2",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Tab A, Document 21",
      "variant_forms": [
        "See Tab A, Document 21",
        "Attached but not printed. See Document 21"
      ],
      "relationship_basis": "Document 23 footnote 2 points the discussion paper at Tab A to Document 21.",
      "target_document_id": "frus1989-92v31/d21",
      "target_document_number": "21",
      "target_label": "Tab A, Document 21",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn3-not-attached",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 3",
      "relationship_type": "not_attached",
      "approved_phrase": "Not attached",
      "variant_forms": [
        "The item was not attached"
      ],
      "relationship_basis": "Document 23 footnote 3 reports an absent attachment and does not point to a printed target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d23-fn4-agenda",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d23",
      "source_document_number": "23",
      "source_unit_label": "footnote 4",
      "relationship_type": "attached_but_not_printed_no_target",
      "approved_phrase": "Attached but not printed is the agenda",
      "variant_forms": [
        "The agenda is attached but not printed",
        "Attached but not printed: agenda"
      ],
      "relationship_basis": "Document 23 footnote 4 identifies an unprinted agenda without a separate printed document target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "agenda",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn2-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 2",
      "relationship_type": "printed_as_document",
      "approved_phrase": "Printed as Document 26",
      "variant_forms": [
        "The memorandum is printed as Document 26",
        "printed as Document 26"
      ],
      "relationship_basis": "Document 25 footnotes 2 and 7 point readers to the printed memorandum at Document 26.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn3-tabs-d1-d2-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_cross_reference",
      "approved_phrase": "Attached but not printed. See Tabs D1 and D2, Document 26",
      "variant_forms": [
        "See Tabs D1 and D2, Document 26",
        "Attached but not printed. See Document 26"
      ],
      "relationship_basis": "Document 25 footnote 3 links unprinted tabs to the separately printed Document 26 apparatus.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Tabs D1 and D2, Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d25-fn8-tabs-a-b-document-26",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d25",
      "source_document_number": "25",
      "source_unit_label": "footnote 8",
      "relationship_type": "mixed_not_attached_and_printed_tabs",
      "approved_phrase": "The List of Participants, cited here as Tab C, was not attached. The Talking Points and Agenda for the June 7 NSC meeting are printed as Tab A and Tab B, Document 26",
      "variant_forms": [
        "Tab C was not attached. Tab A and Tab B are printed as Document 26",
        "Talking Points and Agenda are printed as Tab A and Tab B, Document 26"
      ],
      "relationship_basis": "Document 25 footnote 8 combines a not-attached participant list with printed tab targets in Document 26.",
      "target_document_id": "frus1989-92v31/d26",
      "target_document_number": "26",
      "target_label": "Tab A and Tab B, Document 26",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d25",
      "target_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d26",
      "verification_status": "verified_published_relationship"
    },
    {
      "relationship_id": "relationship-v31-d128-fn3-notification-annex",
      "volume_id": "frus1989-92v31",
      "source_document_id": "frus1989-92v31/d128",
      "source_document_number": "128",
      "source_unit_label": "footnote 3",
      "relationship_type": "attached_but_not_printed_no_target",
      "approved_phrase": "Attached but not printed is a copy of the draft Notification Annex covering the arrival of the first missile of a new type of long-range non-nuclear ALCM",
      "variant_forms": [
        "The draft Notification Annex is attached but not printed",
        "Attached but not printed: draft Notification Annex"
      ],
      "relationship_basis": "Document 128 footnote 3 describes an attached draft Notification Annex without a separate printed target.",
      "target_document_id": "",
      "target_document_number": "",
      "target_label": "draft Notification Annex",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d128",
      "target_url": "",
      "verification_status": "verified_published_relationship"
    }
  ]
}
```

## Communications Metadata Registry Context

Use this to check telegram/cable/message identifiers, SECTO/TOSEC/special designators, origin/addressee lines, date-time groups, source-family electronic telegram identifiers, precedence/routing, and drafting/clearance/approval strings. Do not change identifiers, date-time groups, origin/addressee, or precedence unless the registry proves the direct edit.

```json
{
  "schema_version": "frus-communications-registry-v1",
  "communications_registry_id": "frus-1981-1992-communications-sample-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d19",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/d85",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/d401",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d166",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d190"
  ],
  "scope": "Sample communications metadata registry for checking FRUS telegram, special-designator, time-group, routing, source-family, classification/handling, drafting, clearance, and follow-on telegram-reference form in Reagan and George H.W. Bush annotation sheets.",
  "target_volume": "frus1989-92v31",
  "target_records": [
    {
      "communications_id": "communications-v31-d89-secto-2017",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d89",
      "document_number": "89",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From Secretary of State Baker's Delegation to the Department of State and the White House",
      "message_identifier": "SECTO 2017",
      "special_designator": "SECTO",
      "origin": "Secretary of State Baker's Delegation",
      "addressees": "Department of State and White House",
      "date_time_line": "Namibia, March 20, 1990, 0905Z",
      "date_time_group": "0905Z",
      "subject_or_title": "My Meeting with Soviet Foreign Minister Shevardnadze",
      "source_family": "Department of State, Central Foreign Policy File",
      "source_note_form": "Department of State, Central Foreign Policy File, N900002-0204",
      "classification_or_handling_summary": "Secret",
      "drafting_clearance_approval": "",
      "reference_context": "",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
      "verification_status": "verified_published_communications_record",
      "variant_forms": [
        "Secto 2017",
        "N900002-0204",
        "Telegram from Baker's delegation to State and the White House"
      ]
    },
    {
      "communications_id": "communications-v31-d166-telegram-376592",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d166",
      "document_number": "166",
      "communications_type": "telegram",
      "approved_heading_form": "Telegram From the Department of State to the Embassy in the Soviet Union",
      "message_identifier": "376592",
      "special_designator": "",
      "origin": "Department of State",
      "addressees": "Embassy in the Soviet Union",
      "date_time_line": "Washington, November 6, 1990",
      "date_time_group": "",
      "subject_or_title": "PPCM Letter",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900008-0205",
      "classification_or_handling_summary": "Secret; Nodis; Immediate; sent to NST Geneva",
      "drafting_clearance_approval": "Drafted by Timbie; cleared by Hadley, Lehman, MacEachin, and in JCS, NSC, S/S, and S/S-O; approved by Bartholomew",
      "reference_context": "",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d166",
      "verification_status": "verified_published_communications_record",
      "variant_forms": [
        "Telegram 376592 to Moscow",
        "N900008-0205",
        "Secret; NODIS; Immediate"
      ]
    },
    {
      "communications_id": "communications-v31-d166-fn3-secto-24037",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d166",
      "document_number": "166",
      "communications_type": "referenced_telegram",
      "approved_heading_form": "Telegram SECTO 24037",
      "message_identifier": "SECTO 24037",
      "special_designator": "SECTO",
      "origin": "Secretary's Delegation in the Soviet Union",
      "addressees": "Department of State",
      "date_time_line": "November 9, 1990",
      "date_time_group": "",
      "subject_or_title": "Baker memorandum to Bush on discussions with Shevardnadze and Gorbachev",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900008-0257",
      "classification_or_handling_summary": "Not stated in the follow-on footnote reference; use the source-note citation before inferring handling controls",
      "drafting_clearance_approval": "",
      "reference_context": "In telegram SECTO 24037, November 9, the Secretary's Delegation in the Soviet Union transmitted Baker's November 8 memorandum to Bush",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d166",
      "verification_status": "verified_published_communications_record",
      "variant_forms": [
        "telegram SECTO 24037",
        "telegram 24037 from Moscow",
        "N900008-0257"
      ]
    },
    {
      "communications_id": "communications-v31-d178-tosec-290026",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d178",
      "document_number": "178",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From the Department of State to Secretary of State Baker",
      "message_identifier": "424164/TOSEC 290026",
      "special_designator": "TOSEC",
      "origin": "Department of State",
      "addressees": "Secretary of State Baker",
      "date_time_line": "Washington, December 17, 1990, 1430Z",
      "date_time_group": "1430Z",
      "subject_or_title": "START Package",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900009-0229",
      "classification_or_handling_summary": "Secret; Immediate; Nodis; sent for information",
      "drafting_clearance_approval": "Drafted by Roy; approved by Roy and in S/S",
      "reference_context": "",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
      "verification_status": "verified_published_communications_record",
      "variant_forms": [
        "TOSEC 290026",
        "424164 Tosec 290026",
        "N900009-0229"
      ]
    },
    {
      "communications_id": "communications-v31-d190-tosec-10393",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d190",
      "document_number": "190",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From the Department of State to Secretary of State Baker's Delegation in Damascus",
      "message_identifier": "12562/TOSEC 10393",
      "special_designator": "TOSEC",
      "origin": "Department of State",
      "addressees": "Secretary of State Baker's Delegation in Damascus",
      "date_time_line": "Washington, January 12, 1991, 2328Z",
      "date_time_group": "2328Z",
      "subject_or_title": "Shev Letter on START",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N910001-0231",
      "classification_or_handling_summary": "Secret; Immediate; Nodis",
      "drafting_clearance_approval": "Drafted by Timbie; cleared in S/S and S/S-O; approved by Bartholomew",
      "reference_context": "From January 6 to 14, Baker was traveling in Europe, the Middle East, and Canada to discuss the Persian Gulf crisis",
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d190",
      "verification_status": "verified_published_communications_record",
      "variant_forms": [
        "TOSEC 10393",
        "12562 Tosec 10393",
        "N910001-0231"
      ]
    }
  ],
  "records": [
    {
      "communications_id": "communications-v01-d19-telegram-13038",
      "volume_id": "frus1981-88v01",
      "document_id": "frus1981-88v01/d19",
      "document_number": "19",
      "communications_type": "telegram",
      "approved_heading_form": "Telegram From the Department of State to the Embassy in Yugoslavia",
      "message_identifier": "13038",
      "special_designator": "",
      "origin": "Department of State",
      "addressees": "Embassy in Yugoslavia",
      "date_time_line": "Washington, January 17, 1981, 2135Z",
      "date_time_group": "2135Z",
      "subject_or_title": "Official-Informal",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, D810025-1157",
      "classification_or_handling_summary": "Limited Official Use; Priority",
      "drafting_clearance_approval": "Drafted by Longo (EUR/EE/HU) and approved by Bridges (EUR/EE)",
      "reference_context": "",
      "variant_forms": [
        "Telegram 13038 to Belgrade",
        "D810025-1157",
        "Official-Informal"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v01/d19",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v13-d85-presidential-message-10",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d85",
      "document_number": "85",
      "communications_type": "presidential_message",
      "approved_heading_form": "Telegram From President Reagan to Secretary of State Haig",
      "message_identifier": "10",
      "special_designator": "",
      "origin": "President Reagan",
      "addressees": "Secretary of State Haig",
      "date_time_line": "Bridgetown, April 9, 1982, 1640Z",
      "date_time_group": "1640Z",
      "subject_or_title": "Your Discussions in London",
      "source_family": "Reagan Library, Executive Secretariat, NSC Country File",
      "source_note_form": "Reagan Library, Executive Secretariat, NSC Country File, Latin America/Central, Falklands War [Cables 090131, 091000, 091154, 091640, 181715, 191650, 191754, 192115]",
      "classification_or_handling_summary": "Top Secret; sent for information to the White House; printed from a White House Situation Room copy",
      "drafting_clearance_approval": "",
      "reference_context": "Ref Secto 5010",
      "variant_forms": [
        "Ref Secto 5010",
        "Cables 090131, 091000, 091154, 091640, 181715, 191650, 191754, 192115",
        "White House Situation Room copy"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d85",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v13-d401-joint-telegram-285386",
      "volume_id": "frus1981-88v13",
      "document_id": "frus1981-88v13/d401",
      "document_number": "401",
      "communications_type": "joint_state_defense_message",
      "approved_heading_form": "Telegram From the Department of State to the Embassies in Argentina and the United Kingdom",
      "message_identifier": "285386",
      "special_designator": "",
      "origin": "Department of State",
      "addressees": "Embassies in Argentina and the United Kingdom",
      "date_time_line": "Washington, October 9, 1982, 0403Z",
      "date_time_group": "0403Z",
      "subject_or_title": "Resumption of Military Intelligence Exchange With Argentina",
      "source_family": "Department of State, Bureau of European Affairs, United Kingdom Political Files",
      "source_note_form": "Department of State, Bureau of European Affairs, United Kingdom Political Files, Lot 89D489, Falklands--Telegrams 1982",
      "classification_or_handling_summary": "Secret; Priority; sent for information to the Department of Defense, USSOUTHCOM, and the Defense Intelligence Agency",
      "drafting_clearance_approval": "Drafted by C.S. Shapiro (ARA/RPP); cleared by Bosworth, Raphel, D.W. Cox (ARA/RPP), K. Smith (EUR/NE), S. Smith (ARA/SC), R. Wharton (INR/IC/CD), C. Brown (DOD/ISA/IA), and McManaway; approved by Eagleburger",
      "reference_context": "State 247107 DTG 020416Z Sep 82; Buenos Aires 5222 DTG 091546Z Sep 82; London 19432 DTG 031700Z Sep 82",
      "variant_forms": [
        "Joint State/Defense message",
        "State 247107 DTG 020416Z Sep 82",
        "Buenos Aires 5222 DTG 091546Z Sep 82",
        "London 19432 DTG 031700Z Sep 82"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1981-88v13/d401",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v31-d89-secto-2017",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d89",
      "document_number": "89",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From Secretary of State Baker's Delegation to the Department of State and the White House",
      "message_identifier": "SECTO 2017",
      "special_designator": "SECTO",
      "origin": "Secretary of State Baker's Delegation",
      "addressees": "Department of State and White House",
      "date_time_line": "Namibia, March 20, 1990, 0905Z",
      "date_time_group": "0905Z",
      "subject_or_title": "My Meeting with Soviet Foreign Minister Shevardnadze",
      "source_family": "Department of State, Central Foreign Policy File",
      "source_note_form": "Department of State, Central Foreign Policy File, N900002-0204",
      "classification_or_handling_summary": "Secret",
      "drafting_clearance_approval": "",
      "reference_context": "",
      "variant_forms": [
        "Secto 2017",
        "N900002-0204",
        "Telegram from Baker's delegation to State and the White House"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d89",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v31-d166-telegram-376592",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d166",
      "document_number": "166",
      "communications_type": "telegram",
      "approved_heading_form": "Telegram From the Department of State to the Embassy in the Soviet Union",
      "message_identifier": "376592",
      "special_designator": "",
      "origin": "Department of State",
      "addressees": "Embassy in the Soviet Union",
      "date_time_line": "Washington, November 6, 1990",
      "date_time_group": "",
      "subject_or_title": "PPCM Letter",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900008-0205",
      "classification_or_handling_summary": "Secret; Nodis; Immediate; sent to NST Geneva",
      "drafting_clearance_approval": "Drafted by Timbie; cleared by Hadley, Lehman, MacEachin, and in JCS, NSC, S/S, and S/S-O; approved by Bartholomew",
      "reference_context": "",
      "variant_forms": [
        "Telegram 376592 to Moscow",
        "N900008-0205",
        "Secret; NODIS; Immediate"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d166",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v31-d166-fn3-secto-24037",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d166",
      "document_number": "166",
      "communications_type": "referenced_telegram",
      "approved_heading_form": "Telegram SECTO 24037",
      "message_identifier": "SECTO 24037",
      "special_designator": "SECTO",
      "origin": "Secretary's Delegation in the Soviet Union",
      "addressees": "Department of State",
      "date_time_line": "November 9, 1990",
      "date_time_group": "",
      "subject_or_title": "Baker memorandum to Bush on discussions with Shevardnadze and Gorbachev",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900008-0257",
      "classification_or_handling_summary": "Not stated in the follow-on footnote reference; use the source-note citation before inferring handling controls",
      "drafting_clearance_approval": "",
      "reference_context": "In telegram SECTO 24037, November 9, the Secretary's Delegation in the Soviet Union transmitted Baker's November 8 memorandum to Bush",
      "variant_forms": [
        "telegram SECTO 24037",
        "telegram 24037 from Moscow",
        "N900008-0257"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d166",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v31-d178-tosec-290026",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d178",
      "document_number": "178",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From the Department of State to Secretary of State Baker",
      "message_identifier": "424164/TOSEC 290026",
      "special_designator": "TOSEC",
      "origin": "Department of State",
      "addressees": "Secretary of State Baker",
      "date_time_line": "Washington, December 17, 1990, 1430Z",
      "date_time_group": "1430Z",
      "subject_or_title": "START Package",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N900009-0229",
      "classification_or_handling_summary": "Secret; Immediate; Nodis; sent for information",
      "drafting_clearance_approval": "Drafted by Roy; approved by Roy and in S/S",
      "reference_context": "",
      "variant_forms": [
        "TOSEC 290026",
        "424164 Tosec 290026",
        "N900009-0229"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d178",
      "verification_status": "verified_published_communications_record"
    },
    {
      "communications_id": "communications-v31-d190-tosec-10393",
      "volume_id": "frus1989-92v31",
      "document_id": "frus1989-92v31/d190",
      "document_number": "190",
      "communications_type": "telegram_with_special_designator",
      "approved_heading_form": "Telegram From the Department of State to Secretary of State Baker's Delegation in Damascus",
      "message_identifier": "12562/TOSEC 10393",
      "special_designator": "TOSEC",
      "origin": "Department of State",
      "addressees": "Secretary of State Baker's Delegation in Damascus",
      "date_time_line": "Washington, January 12, 1991, 2328Z",
      "date_time_group": "2328Z",
      "subject_or_title": "Shev Letter on START",
      "source_family": "Department of State, Central Foreign Policy File, Electronic Telegrams",
      "source_note_form": "Department of State, Central Foreign Policy File, Electronic Telegrams, N910001-0231",
      "classification_or_handling_summary": "Secret; Immediate; Nodis",
      "drafting_clearance_approval": "Drafted by Timbie; cleared in S/S and S/S-O; approved by Bartholomew",
      "reference_context": "From January 6 to 14, Baker was traveling in Europe, the Middle East, and Canada to discuss the Persian Gulf crisis",
      "variant_forms": [
        "TOSEC 10393",
        "12562 Tosec 10393",
        "N910001-0231"
      ],
      "source_url": "https://history.state.gov/historicaldocuments/frus1989-92v31/d190",
      "verification_status": "verified_published_communications_record"
    }
  ]
}
```

## Preparation Router Context

```json
{
  "schema_version": "frus-preparation-router-v1",
  "router_id": "frus-preparation-router-1981-1992-2026-06-03",
  "captured_at": "2026-06-03",
  "source_status_registry_path": "reports/frus-status-series-1981-1992.current.json",
  "source_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
  "purpose": "Machine-checkable volume-family and stage router for Reagan and George H.W. Bush FRUS annotation-sheet review.",
  "use_limits": [
    "Use this router for review posture, risk triage, and source-family caution.",
    "Do not cite this router as source-note provenance.",
    "Do not transfer published pattern facts into a different volume family without supplied source evidence.",
    "When the route is tentative or mixed, use comments rather than direct edits for family-dependent changes."
  ],
  "stage_postures": {
    "published": {
      "posture_id": "published_pattern_evidence",
      "direct_edit_rule": "Use as pattern evidence only; direct status wording still requires exact document or chapter target evidence."
    },
    "being_cleared": {
      "posture_id": "clearance_stage_review",
      "direct_edit_rule": "Prioritize declassification, agency equity, attachment, cross-volume status, and document-number safety."
    },
    "being_researched": {
      "posture_id": "research_stage_guardrail",
      "direct_edit_rule": "Protect working leads; convert unsupported final prose into comments or evidence requests."
    },
    "planned": {
      "posture_id": "planned_stage_guardrail",
      "direct_edit_rule": "Treat volume labels as scoping context; do not polish conjectural source facts into FRUS source notes."
    }
  },
  "family_definitions": [
    {
      "family_id": "reagan-organization-management",
      "label": "Reagan organization and management",
      "administration": "reagan",
      "direct_edit_posture": "Use comments for title, office, routing, and management-source claims unless the uploaded context supplies date-bounded authority.",
      "source_families_to_preserve": [
        "Reagan transition material",
        "White House staff and office files",
        "State Executive Secretariat and policy-planning files"
      ],
      "redline_priorities": [
        "date-bounded offices",
        "title changes",
        "action or information routing",
        "public organizational facts versus internal evidence"
      ],
      "hazard_tags": [
        "authority_control",
        "document_status_lifecycle",
        "source_note"
      ]
    },
    {
      "family_id": "reagan-europe-poland-nato",
      "label": "Reagan Europe, Poland, and NATO",
      "administration": "reagan",
      "direct_edit_posture": "Preserve country and regional source identity; block family-dependent replacements when Europe, NATO, and Soviet routing are ambiguous.",
      "source_families_to_preserve": [
        "State EUR and CFPF files",
        "embassy telegrams",
        "NSC European and Soviet directorate records",
        "NATO and foreign-government copies"
      ],
      "redline_priorities": [
        "country file identity",
        "foreign-origin copy status",
        "embassy-held copy status",
        "cross-volume Europe and Soviet references"
      ],
      "hazard_tags": [
        "source_family",
        "foreign_international_organization",
        "cross_reference"
      ]
    },
    {
      "family_id": "reagan-arms-control-national-security",
      "label": "Reagan arms control and national security",
      "administration": "reagan",
      "direct_edit_posture": "Allow style edits only when directive, annex, tab, treaty, and classification evidence is supplied.",
      "source_families_to_preserve": [
        "NSDD and NSSD packages",
        "NSPG and NSC meeting files",
        "System IV, W Files, and PROFS records",
        "ACDA, DOD, JCS, and CIA records"
      ],
      "redline_priorities": [
        "paragraph markings",
        "directive and annex relationships",
        "treaty terminology",
        "original classification versus release status"
      ],
      "hazard_tags": [
        "classification_handling",
        "decision_process_directive",
        "treaty_legal_instrument",
        "handwritten_facsimile_transcription"
      ]
    },
    {
      "family_id": "reagan-latin-america-caribbean",
      "label": "Reagan Latin America and Caribbean",
      "administration": "reagan",
      "direct_edit_posture": "Treat country and chapter routing as a hard preflight check before source-family edits.",
      "source_families_to_preserve": [
        "embassy telegrams",
        "NSC Latin America directorate files",
        "State country and desk files",
        "CIA, DOD, congressional, and public diplomacy records"
      ],
      "redline_priorities": [
        "country and chapter routing",
        "source-copy identity",
        "covert-action or intelligence caution",
        "translations and public statements"
      ],
      "hazard_tags": [
        "source_family",
        "intelligence_law_enforcement",
        "translation_foreign_origin",
        "publication_status"
      ]
    },
    {
      "family_id": "reagan-middle-east-crises",
      "label": "Reagan Middle East and regional crises",
      "administration": "reagan",
      "direct_edit_posture": "Prefer comments when chronology, foreign-origin copy status, no-record language, or attachment status is not supplied.",
      "source_families_to_preserve": [
        "Situation Room records",
        "memcons and telcons",
        "State NEA files",
        "DOD, CIA, and foreign-government copies"
      ],
      "redline_priorities": [
        "crisis chronology",
        "participants",
        "no minutes or not found language",
        "translation and foreign-origin handling"
      ],
      "hazard_tags": [
        "chronology",
        "negative_search_no_record",
        "military_crisis_operations",
        "translation_foreign_origin"
      ]
    },
    {
      "family_id": "reagan-africa",
      "label": "Reagan Africa",
      "administration": "reagan",
      "direct_edit_posture": "Preserve regional and country distinctions; avoid inferring intelligence, military, or international-organization equities.",
      "source_families_to_preserve": [
        "embassy telegrams",
        "State Africa bureau and country desk records",
        "NSC regional directorate files",
        "CIA, DOD, and international-organization records"
      ],
      "redline_priorities": [
        "regional versus country split",
        "sanctions and congressional context",
        "military and intelligence equities",
        "foreign-government or international-organization records"
      ],
      "hazard_tags": [
        "foreign_international_organization",
        "military_crisis_operations",
        "intelligence_law_enforcement",
        "congressional_legal_authority"
      ]
    },
    {
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "label": "Reagan East Asia, Pacific, South Asia, and Afghanistan",
      "administration": "reagan",
      "direct_edit_posture": "Use comments for transliteration, translation, country-routing, intelligence, and military claims unless authority context is supplied.",
      "source_families_to_preserve": [
        "embassy telegrams",
        "State EAP and SCA files",
        "NSC Asia directorate records",
        "intelligence, defense, and foreign-government copies"
      ],
      "redline_priorities": [
        "names and transliterations",
        "translations",
        "country or chapter routing",
        "public statements and treaty texts"
      ],
      "hazard_tags": [
        "authority_control",
        "translation_foreign_origin",
        "military_crisis_operations",
        "public_diplomacy_public_source"
      ]
    },
    {
      "family_id": "reagan-economic-trade-assistance",
      "label": "Reagan economic, trade, debt, and assistance",
      "administration": "reagan",
      "direct_edit_posture": "Do not change economic tables, amounts, acronyms, public-source identity, or meeting context without supplied proof.",
      "source_families_to_preserve": [
        "Treasury records",
        "State economic bureau records",
        "summit records",
        "IMF, World Bank, and congressional records"
      ],
      "redline_priorities": [
        "public or printed-source identity",
        "meeting and summit context",
        "agency authorship",
        "economic acronyms and tables"
      ],
      "hazard_tags": [
        "economic_financial_data",
        "public_diplomacy_public_source",
        "congressional_legal_authority"
      ]
    },
    {
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "label": "Reagan public diplomacy, global issues, refugees, terrorism, counternarcotics, and Iran-Contra",
      "administration": "reagan",
      "direct_edit_posture": "Keep public selected documents, sensitive records, and working labels distinct; prefer evidence requests for operational claims.",
      "source_families_to_preserve": [
        "USIA and public diplomacy records",
        "press guidance and public statements",
        "interagency task-force files",
        "law-enforcement, intelligence, and congressional records"
      ],
      "redline_priorities": [
        "public material as selected evidence",
        "agency equities",
        "sensitive operational claims",
        "authority-list consistency"
      ],
      "hazard_tags": [
        "public_diplomacy_public_source",
        "human_rights_refugee_global_issues",
        "intelligence_law_enforcement",
        "volume_preparation_scope"
      ]
    },
    {
      "family_id": "bush-foundations-public-diplomacy-organization",
      "label": "Bush foundations, public diplomacy, and organization",
      "administration": "bush-ghw",
      "direct_edit_posture": "Treat speeches, testimony, interviews, public statements, and organization records as possible selected evidence, not automatic background.",
      "source_families_to_preserve": [
        "Bush Library public statements and speech records",
        "transition records",
        "White House and NSC staff files",
        "State Executive Secretariat and policy-planning records"
      ],
      "redline_priorities": [
        "date-bounded offices",
        "title transitions",
        "public-versus-internal source identity",
        "source-list authority form"
      ],
      "hazard_tags": [
        "public_diplomacy_public_source",
        "authority_control",
        "source_list_front_matter"
      ]
    },
    {
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "label": "Bush Soviet Union, Russia, Europe, Germany, and NATO",
      "administration": "bush-ghw",
      "direct_edit_posture": "Separate high-level contact records from policy files; protect cross-references across START I, Europe, Germany, and Soviet/Russia volumes.",
      "source_families_to_preserve": [
        "Bush Library Scowcroft and Gates files",
        "NSC staff and H-Files",
        "State EUR, S/P, and CFPF records",
        "NATO and foreign-government records"
      ],
      "redline_priorities": [
        "memcon and telcon forms",
        "briefing-book forms",
        "high-level contact versus policy file",
        "cross-volume references"
      ],
      "hazard_tags": [
        "cross_reference",
        "source_family",
        "foreign_international_organization",
        "document_status_lifecycle"
      ]
    },
    {
      "family_id": "bush-balkans-crises-peacekeeping",
      "label": "Bush Balkans, crises, and peacekeeping",
      "administration": "bush-ghw",
      "direct_edit_posture": "Require precise chronology and agency or international-organization proof before direct edits.",
      "source_families_to_preserve": [
        "Situation Room and NSC records",
        "State regional bureau files",
        "embassy telegrams",
        "military, intelligence, United Nations, and international-organization records"
      ],
      "redline_priorities": [
        "precise chronology",
        "agency equities",
        "foreign or international-organization copy status",
        "military and operational claims"
      ],
      "hazard_tags": [
        "chronology",
        "military_crisis_operations",
        "foreign_international_organization",
        "intelligence_law_enforcement"
      ]
    },
    {
      "family_id": "bush-persian-gulf-middle-east",
      "label": "Bush Persian Gulf and Middle East",
      "administration": "bush-ghw",
      "direct_edit_posture": "Be conservative on crisis chronology, meeting/call status, coalition records, not-found notes, and declassification brackets.",
      "source_families_to_preserve": [
        "NSC and Situation Room records",
        "State NEA and CFPF records",
        "memcons and telcons",
        "DOD, JCS, CIA, coalition, and foreign-government copies"
      ],
      "redline_priorities": [
        "crisis chronology",
        "meeting and call status",
        "coalition and foreign-origin records",
        "declassification bracket discipline"
      ],
      "hazard_tags": [
        "military_crisis_operations",
        "chronology",
        "declassification",
        "negative_search_no_record"
      ]
    },
    {
      "family_id": "bush-asia-pacific",
      "label": "Bush Asia and Pacific",
      "administration": "bush-ghw",
      "direct_edit_posture": "Check transliteration, country routing, translations, and related Reagan scheduled-publication language before direct edits.",
      "source_families_to_preserve": [
        "Bush Library NSC regional staff files",
        "State regional bureau and CFPF records",
        "embassy telegrams",
        "foreign-government copies and translations"
      ],
      "redline_priorities": [
        "name authority",
        "country routing",
        "translation claims",
        "related Reagan-era scheduled-publication language"
      ],
      "hazard_tags": [
        "authority_control",
        "translation_foreign_origin",
        "publication_status",
        "cross_reference"
      ]
    },
    {
      "family_id": "bush-africa-americas",
      "label": "Bush Africa and Americas",
      "administration": "bush-ghw",
      "direct_edit_posture": "Preserve country and regional chapter identity and avoid inferring sensitive law-enforcement or intervention claims.",
      "source_families_to_preserve": [
        "State country and desk files",
        "embassy telegrams",
        "Bush Library NSC regional files",
        "congressional, public diplomacy, intelligence, defense, and law-enforcement records"
      ],
      "redline_priorities": [
        "country and regional chapter identity",
        "source-copy status",
        "sensitive intelligence or law-enforcement equities",
        "crisis or intervention chronology"
      ],
      "hazard_tags": [
        "source_family",
        "intelligence_law_enforcement",
        "military_crisis_operations",
        "congressional_legal_authority"
      ]
    },
    {
      "family_id": "bush-national-security-arms-control",
      "label": "Bush national security, arms control, and nonproliferation",
      "administration": "bush-ghw",
      "direct_edit_posture": "Use published START I as pattern evidence only; do not overwrite a different H-Files, NSR, NSD, or treaty source family.",
      "source_families_to_preserve": [
        "H-Files",
        "NSR, NSD, NSC Meetings, and NSC/DC Meetings files",
        "Scowcroft and Gates files",
        "ACDA, DOD, JCS, CIA, State lot, and CFPF records"
      ],
      "redline_priorities": [
        "H-Files subseries",
        "NSR and NSD forms",
        "annexes and tabs",
        "verification terminology and original classification"
      ],
      "hazard_tags": [
        "classification_handling",
        "decision_process_directive",
        "treaty_legal_instrument",
        "source_family"
      ]
    },
    {
      "family_id": "bush-economic-global-sensitive",
      "label": "Bush economic policy, global issues, counternarcotics, and counterterrorism",
      "administration": "bush-ghw",
      "direct_edit_posture": "For planned sensitive volumes, treat labels as scoping context and request proof before final source-note prose.",
      "source_families_to_preserve": [
        "Treasury and State economic bureau records",
        "NSC files",
        "public reports",
        "law-enforcement, intelligence, interagency task-force, and international-organization records"
      ],
      "redline_priorities": [
        "public or printed sources versus control copies",
        "agency equities",
        "congressional and public-report citations",
        "planned-volume research labels"
      ],
      "hazard_tags": [
        "economic_financial_data",
        "human_rights_refugee_global_issues",
        "intelligence_law_enforcement",
        "volume_preparation_scope"
      ]
    }
  ],
  "routes": [
    {
      "entry_id": "frus1981-88v44p1",
      "family_id": "reagan-arms-control-national-security",
      "stage_posture": "published_pattern_evidence",
      "match_confidence": "official_status_title",
      "notes": "Published 2025 pattern evidence; not a universal template."
    },
    {
      "entry_id": "frus1989-92v31",
      "family_id": "bush-national-security-arms-control",
      "stage_posture": "published_pattern_evidence",
      "match_confidence": "official_status_title",
      "notes": "Published START I pattern evidence; not a universal template."
    },
    {
      "entry_id": "frus1981-88v02",
      "family_id": "reagan-organization-management",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v07",
      "family_id": "reagan-europe-poland-nato",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v09",
      "family_id": "reagan-europe-poland-nato",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v12",
      "family_id": "reagan-arms-control-national-security",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v14",
      "family_id": "reagan-latin-america-caribbean",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v15",
      "family_id": "reagan-latin-america-caribbean",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v16",
      "family_id": "reagan-latin-america-caribbean",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": "Carries anticipated_2026 overlay and Venezuela subitem overlay."
    },
    {
      "entry_id": "frus1981-88v17p1",
      "family_id": "reagan-latin-america-caribbean",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v17p2",
      "family_id": "reagan-latin-america-caribbean",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v18p1",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v18p2",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v19",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v20",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v21",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v22",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v25",
      "family_id": "reagan-africa",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v26",
      "family_id": "reagan-africa",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v27",
      "family_id": "reagan-africa",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v28",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": "Carries anticipated_2026 overlay."
    },
    {
      "entry_id": "frus1981-88v29",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v30",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v31",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v32",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v33",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v34",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v35",
      "family_id": "reagan-asia-pacific-south-asia-afghanistan",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v36",
      "family_id": "reagan-economic-trade-assistance",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v39",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v40",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v43",
      "family_id": "reagan-arms-control-national-security",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v44p2",
      "family_id": "reagan-arms-control-national-security",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v46",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v47p1",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v47p2",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v48",
      "family_id": "reagan-africa",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v03",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v07",
      "family_id": "bush-balkans-crises-peacekeeping",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v10",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v11",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v12",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v13",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v17",
      "family_id": "bush-asia-pacific",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v19",
      "family_id": "bush-africa-americas",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v21",
      "family_id": "bush-balkans-crises-peacekeeping",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v26",
      "family_id": "bush-national-security-arms-control",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v33",
      "family_id": "bush-africa-americas",
      "stage_posture": "clearance_stage_review",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v08",
      "family_id": "reagan-europe-poland-nato",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v23",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": "Sensitive Iran-Contra research-stage material; do not infer final source prose."
    },
    {
      "entry_id": "frus1981-88v37",
      "family_id": "reagan-economic-trade-assistance",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v42",
      "family_id": "reagan-public-diplomacy-global-sensitive",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1981-88v45",
      "family_id": "reagan-middle-east-crises",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v01",
      "family_id": "bush-foundations-public-diplomacy-organization",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v02",
      "family_id": "bush-foundations-public-diplomacy-organization",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v04",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v05",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v06",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v08",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v09",
      "family_id": "bush-soviet-russia-europe-germany-nato",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v14",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v15",
      "family_id": "bush-asia-pacific",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v16",
      "family_id": "bush-asia-pacific",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v18",
      "family_id": "bush-asia-pacific",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v20",
      "family_id": "bush-africa-americas",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v22",
      "family_id": "bush-africa-americas",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v23",
      "family_id": "bush-africa-americas",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v24",
      "family_id": "bush-africa-americas",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v25",
      "family_id": "bush-africa-americas",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v27",
      "family_id": "bush-national-security-arms-control",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v30",
      "family_id": "bush-economic-global-sensitive",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v32",
      "family_id": "bush-persian-gulf-middle-east",
      "stage_posture": "research_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": ""
    },
    {
      "entry_id": "frus1989-92v28",
      "family_id": "bush-economic-global-sensitive",
      "stage_posture": "planned_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": "Planned sensitive counternarcotics and counterterrorism volume; do not finalize source facts from title alone."
    },
    {
      "entry_id": "frus1989-92v29",
      "family_id": "bush-economic-global-sensitive",
      "stage_posture": "planned_stage_guardrail",
      "match_confidence": "official_status_title",
      "notes": "Planned global issues volume; do not finalize scope from title alone."
    }
  ]
}
```

## Permutation Matrix Context

```json
{
  "schema_version": "frus-annotation-permutation-matrix-v1",
  "matrix_id": "frus-annotation-permutation-matrix-2026-06-03",
  "source_schema": "reports/frus-annotation-checker-output.schema.json",
  "source_router": "reports/frus-preparation-router-1981-1992.current.json",
  "purpose": "Coverage matrix for FRUS Annotation Checker finding categories, evidence requests, safe actions, and family-sensitive hazards.",
  "use_limits": [
    "Use this matrix to classify missing proof and direct-edit risk.",
    "Do not use this matrix as source-note provenance.",
    "If a category policy and supplied evidence conflict, use the stricter comment-only policy.",
    "If a volume-family router hazard is present, require the relevant evidence context before direct edits."
  ],
  "category_policies": [
    {
      "category": "source_note",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "source_note_component_context",
        "source_family_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "archival_path",
        "source_image",
        "source_family",
        "source_surrogate_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "source_note",
        "archival_path",
        "source_family",
        "source_surrogate_basis"
      ]
    },
    {
      "category": "citation",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "cross_reference_context",
        "status_registry_context",
        "authority_registry_context"
      ],
      "primary_evidence_requests": [
        "cross_reference",
        "publication_status",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "citation",
        "cross_reference",
        "publication_status"
      ]
    },
    {
      "category": "attachment",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "attachment_registry_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "attachment_status",
        "source_image",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "attachment",
        "attachment_status"
      ]
    },
    {
      "category": "printed_nested_attachment",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "printed_attachment_context",
        "attachment_registry_context"
      ],
      "primary_evidence_requests": [
        "printed_attachment_basis",
        "attachment_status",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "printed_nested_attachment",
        "printed_attachment_basis"
      ]
    },
    {
      "category": "handwritten_facsimile_transcription",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "handwritten_transcription_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "transcription_facsimile_basis",
        "source_image",
        "editorial_method_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "handwritten_facsimile_transcription",
        "transcription_facsimile_basis"
      ]
    },
    {
      "category": "visual_material_graphic",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "visual_material_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "visual_material_basis",
        "source_image",
        "attachment_status"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "visual_material_graphic",
        "visual_material_basis"
      ]
    },
    {
      "category": "source_surrogate_release",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "source_surrogate_context",
        "release_apparatus_context"
      ],
      "primary_evidence_requests": [
        "source_surrogate_basis",
        "release_apparatus_basis",
        "archival_path"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "source_surrogate_release",
        "source_surrogate_basis",
        "release_apparatus_basis"
      ]
    },
    {
      "category": "editorial_method_transcription",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "editorial_method_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "editorial_method_basis",
        "source_image",
        "transcription_facsimile_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "editorial_method_transcription",
        "editorial_method_basis"
      ]
    },
    {
      "category": "document_status_lifecycle",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "document_status_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "document_status_basis",
        "source_image",
        "document_metadata"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "document_status_lifecycle",
        "document_status_basis"
      ]
    },
    {
      "category": "decision_process_directive",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "decision_process_context",
        "document_metadata_registry_context"
      ],
      "primary_evidence_requests": [
        "decision_process_basis",
        "document_number",
        "treaty_component"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "decision_process_directive",
        "decision_process_basis"
      ]
    },
    {
      "category": "annotation",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "annotation_sheet_context",
        "extracted_units",
        "authority_context"
      ],
      "primary_evidence_requests": [
        "source_image",
        "archival_path",
        "wrapper_safety"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "annotation",
        "wrapper_safety"
      ]
    },
    {
      "category": "editorial_note",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "cross_reference_context",
        "chronology_registry_context",
        "selection_balance_context"
      ],
      "primary_evidence_requests": [
        "cross_reference",
        "chronology",
        "selection_balance_basis",
        "public_source_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "editorial_note",
        "cross_reference",
        "chronology"
      ]
    },
    {
      "category": "document_metadata",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "document_metadata_registry_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "document_metadata",
        "document_number",
        "source_image"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "document_metadata"
      ]
    },
    {
      "category": "classification_handling",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "classification_registry_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "classification_marking",
        "source_image",
        "declassification_status"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "classification_handling",
        "classification_marking"
      ]
    },
    {
      "category": "source_list_front_matter",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "source_list_front_matter_context",
        "authority_registry_context"
      ],
      "primary_evidence_requests": [
        "source_list_basis",
        "authority_control",
        "source_family"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "source_list_front_matter",
        "source_list_basis"
      ]
    },
    {
      "category": "selection_balance_completeness",
      "direct_edit_policy": "comment_only_by_default",
      "required_context": [
        "selection_balance_context",
        "coverage_matrix_context"
      ],
      "primary_evidence_requests": [
        "selection_balance_basis",
        "cross_reference",
        "source_family"
      ],
      "safe_actions": [
        "comment_only",
        "no_change"
      ],
      "hazard_tags": [
        "selection_balance_completeness",
        "selection_balance_basis"
      ]
    },
    {
      "category": "physical_routing_marginalia",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "document_handling_registry_context",
        "physical_routing_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "physical_evidence_basis",
        "source_image",
        "document_status_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "physical_routing_marginalia",
        "physical_evidence_basis"
      ]
    },
    {
      "category": "negative_search_no_record",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "negative_search_context",
        "cross_reference_context"
      ],
      "primary_evidence_requests": [
        "negative_search_basis",
        "attachment_status",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "negative_search_no_record",
        "negative_search_basis"
      ]
    },
    {
      "category": "memoir_oral_history_recollection",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "retrospective_account_context",
        "public_source_context"
      ],
      "primary_evidence_requests": [
        "retrospective_account_basis",
        "public_source_basis",
        "chronology"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "memoir_oral_history_recollection",
        "retrospective_account_basis"
      ]
    },
    {
      "category": "translation_foreign_origin",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "translation_registry_context",
        "foreign_international_org_context"
      ],
      "primary_evidence_requests": [
        "translation_status",
        "foreign_org_basis",
        "source_image"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "translation_foreign_origin",
        "translation_status"
      ]
    },
    {
      "category": "foreign_international_organization",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "foreign_international_org_context",
        "translation_registry_context"
      ],
      "primary_evidence_requests": [
        "foreign_org_basis",
        "translation_status",
        "treaty_component"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "foreign_international_organization",
        "foreign_org_basis"
      ]
    },
    {
      "category": "treaty_legal_instrument",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "treaty_registry_context",
        "congressional_legal_context"
      ],
      "primary_evidence_requests": [
        "treaty_component",
        "legal_authority",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "treaty_legal_instrument",
        "treaty_component",
        "arms_control_technical_verification"
      ]
    },
    {
      "category": "public_diplomacy_public_source",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "public_source_registry_context",
        "public_diplomacy_context",
        "release_apparatus_context",
        "event_chronology_context"
      ],
      "primary_evidence_requests": [
        "public_source_basis",
        "release_apparatus_basis",
        "event_chronology"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "public_diplomacy_public_source",
        "public_source_basis"
      ]
    },
    {
      "category": "congressional_legal_authority",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "congressional_legal_context",
        "public_source_context"
      ],
      "primary_evidence_requests": [
        "legal_authority",
        "public_source_basis",
        "financial_data"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "congressional_legal_authority",
        "legal_authority"
      ]
    },
    {
      "category": "economic_financial_data",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "economic_financial_context",
        "congressional_legal_context"
      ],
      "primary_evidence_requests": [
        "financial_data",
        "legal_authority",
        "public_source_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "economic_financial_data",
        "financial_data"
      ]
    },
    {
      "category": "intelligence_law_enforcement",
      "direct_edit_policy": "comment_only_by_default",
      "required_context": [
        "sensitive_record_context",
        "classification_registry_context"
      ],
      "primary_evidence_requests": [
        "agency_equity",
        "classification_marking",
        "declassification_status"
      ],
      "safe_actions": [
        "comment_only",
        "no_change"
      ],
      "hazard_tags": [
        "intelligence_law_enforcement",
        "agency_equity"
      ]
    },
    {
      "category": "military_crisis_operations",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "military_crisis_context",
        "chronology_registry_context"
      ],
      "primary_evidence_requests": [
        "military_operation_basis",
        "chronology",
        "agency_equity"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "military_crisis_operations",
        "military_operation_basis"
      ]
    },
    {
      "category": "human_rights_refugee_global_issues",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "humanitarian_rights_context",
        "economic_financial_context",
        "foreign_international_org_context"
      ],
      "primary_evidence_requests": [
        "humanitarian_rights_basis",
        "legal_authority",
        "financial_data",
        "foreign_org_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "human_rights_refugee_global_issues",
        "humanitarian_rights_basis"
      ]
    },
    {
      "category": "declassification",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "declassification_registry_context",
        "classification_registry_context"
      ],
      "primary_evidence_requests": [
        "declassification_status",
        "classification_marking",
        "agency_equity"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "declassification",
        "declassification_status"
      ]
    },
    {
      "category": "authority_control",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "authority_registry_context",
        "source_list_front_matter_context"
      ],
      "primary_evidence_requests": [
        "authority_control",
        "source_list_basis",
        "document_metadata"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "authority_control"
      ]
    },
    {
      "category": "chronology",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "chronology_registry_context",
        "source_image_context"
      ],
      "primary_evidence_requests": [
        "chronology",
        "event_chronology",
        "source_image"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "chronology"
      ]
    },
    {
      "category": "time_zone_chronology",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "time_zone_context",
        "chronology_registry_context",
        "communications_registry_context"
      ],
      "primary_evidence_requests": [
        "time_zone_basis",
        "chronology",
        "communications_metadata"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "time_zone_chronology",
        "time_zone_basis"
      ]
    },
    {
      "category": "summit_public_event",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "event_chronology_context",
        "chronology_registry_context",
        "public_diplomacy_context"
      ],
      "primary_evidence_requests": [
        "event_chronology",
        "public_source_basis",
        "chronology"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "summit_public_event",
        "event_chronology"
      ]
    },
    {
      "category": "communications_record",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "communications_registry_context",
        "source_family_context"
      ],
      "primary_evidence_requests": [
        "communications_metadata",
        "time_zone_basis",
        "classification_marking"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "communications_record",
        "communications_metadata"
      ]
    },
    {
      "category": "publication_status",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "status_registry_context",
        "preparation_router_context",
        "cross_reference_context"
      ],
      "primary_evidence_requests": [
        "publication_status",
        "cross_reference",
        "document_number"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "publication_status"
      ]
    },
    {
      "category": "volume_preparation_scope",
      "direct_edit_policy": "comment_only_by_default",
      "required_context": [
        "status_registry_context",
        "preparation_router_context",
        "volume_family_context"
      ],
      "primary_evidence_requests": [
        "source_family",
        "publication_status",
        "authority_control"
      ],
      "safe_actions": [
        "comment_only",
        "no_change"
      ],
      "hazard_tags": [
        "volume_preparation_scope",
        "source_family"
      ]
    },
    {
      "category": "release_errata_apparatus",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "release_apparatus_context",
        "status_registry_context"
      ],
      "primary_evidence_requests": [
        "release_apparatus_basis",
        "publication_status",
        "public_source_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "no_change"
      ],
      "hazard_tags": [
        "release_errata_apparatus",
        "release_apparatus_basis"
      ]
    },
    {
      "category": "wording",
      "direct_edit_policy": "exact_supported_edit_allowed",
      "required_context": [
        "extracted_units",
        "style_standard_context"
      ],
      "primary_evidence_requests": [
        "none",
        "authority_control",
        "editorial_method_basis"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "insert_after_text",
        "delete_text",
        "no_change"
      ],
      "hazard_tags": [
        "wording"
      ]
    },
    {
      "category": "evidence",
      "direct_edit_policy": "comment_only_by_default",
      "required_context": [
        "evidence_queue_context",
        "source_image_context",
        "context_bundle"
      ],
      "primary_evidence_requests": [
        "source_image",
        "archival_path",
        "wrapper_safety"
      ],
      "safe_actions": [
        "comment_only",
        "no_change"
      ],
      "hazard_tags": [
        "evidence",
        "wrapper_safety"
      ]
    },
    {
      "category": "format",
      "direct_edit_policy": "exact_supported_edit_allowed",
      "required_context": [
        "extracted_units",
        "word_redline_integrity_context"
      ],
      "primary_evidence_requests": [
        "none",
        "editorial_method_basis",
        "wrapper_safety"
      ],
      "safe_actions": [
        "comment_only",
        "replace_text",
        "insert_after_text",
        "delete_text",
        "no_change"
      ],
      "hazard_tags": [
        "format",
        "wrapper_safety"
      ]
    }
  ],
  "evidence_request_policies": [
    {
      "evidence_request": "none",
      "owner_hint": "none",
      "blocks_direct_edit_by_default": false,
      "blocks_final_publication_by_default": false,
      "comment_target_template": "No missing proof; use only when the finding is supported or no_change."
    },
    {
      "evidence_request": "source_image",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the source image or visible feature to inspect."
    },
    {
      "evidence_request": "archival_path",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the repository, collection, series, box, folder, lot, OA/ID, or file unit to verify."
    },
    {
      "evidence_request": "classification_marking",
      "owner_hint": "declassification",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the original classification, handling, precedence, or verified absence of marking."
    },
    {
      "evidence_request": "source_surrogate_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the RAC, NLR, FOIA, catalog, scan, URL, release package, or surrogate relationship to verify."
    },
    {
      "evidence_request": "source_list_basis",
      "owner_hint": "editor",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the source-list, front-matter, abbreviation, Persons, appendix, or review-statement basis."
    },
    {
      "evidence_request": "selection_balance_basis",
      "owner_hint": "general_editor",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the coverage matrix, related volume, source lead, withheld-document ledger, or scope decision."
    },
    {
      "evidence_request": "physical_evidence_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the handwritten, stamped, marginal, routing, approval, signed, or physical-placement feature."
    },
    {
      "evidence_request": "negative_search_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the item sought, record type, repository/file scope, search result, and follow-up status."
    },
    {
      "evidence_request": "printed_attachment_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the parent document, child unit, tab/enclosure label, printed target, and source-note relationship."
    },
    {
      "evidence_request": "transcription_facsimile_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the handwritten source, facsimile, uncertain reading, original bracket, or appendix-image basis."
    },
    {
      "evidence_request": "visual_material_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the visual item, caption, source image, attachment status, printed target, or identification basis."
    },
    {
      "evidence_request": "time_zone_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the time label, conversion, date-time group, treaty rule, or chronological placement basis."
    },
    {
      "evidence_request": "editorial_method_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the bracket, styling, abbreviation, telegram-number, original-text, or silent-correction basis."
    },
    {
      "evidence_request": "document_status_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the draft/final, original/copy, signed, approval, routing, distribution, or lifecycle evidence."
    },
    {
      "evidence_request": "decision_process_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the NSC/NSPG/NSD/NSR/directive, option, decision stage, meeting record, or agency-position basis."
    },
    {
      "evidence_request": "attachment_status",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the tab, enclosure, attachment, printed target, not-attached, or not-found proof."
    },
    {
      "evidence_request": "document_number",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the same-volume or cross-volume document, chapter, or section target."
    },
    {
      "evidence_request": "document_metadata",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the heading, date/place line, sender, recipient, subject, public title, or document form evidence."
    },
    {
      "evidence_request": "foreign_org_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the foreign-government, international-organization, conference, treaty-party, copy, or concurrence basis."
    },
    {
      "evidence_request": "treaty_component",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the treaty, protocol, annex, MOU, agreement, transmittal, ratification, associated-document status, or START/INF/ABM technical-verification term."
    },
    {
      "evidence_request": "public_source_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the target-volume public source, transcript, delivery or broadcast basis, publication/page or excerpt target, selected-versus-supplemental status, and archival-draft relationship."
    },
    {
      "evidence_request": "retrospective_account_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the memoir, diary, oral history, interview, page, event match, and official-record corroboration."
    },
    {
      "evidence_request": "legal_authority",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the statute, hearing, public law, section, determination, certification, Executive Order, or Senate basis."
    },
    {
      "evidence_request": "financial_data",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the figure, unit, fiscal year, institution, table, program, source, legal basis, or policy stage."
    },
    {
      "evidence_request": "agency_equity",
      "owner_hint": "declassification",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the intelligence, law-enforcement, operational, source-and-methods, oversight, or agency-equity proof."
    },
    {
      "evidence_request": "military_operation_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the operation stage, order, force/unit, time basis, host-nation/coalition role, or military authority."
    },
    {
      "evidence_request": "humanitarian_rights_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the report basis, population scope, public/archival source, legal/program authority, metric, or organization role."
    },
    {
      "evidence_request": "publication_status",
      "owner_hint": "editor",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the current official volume, chapter, release-bucket, or publication-status target."
    },
    {
      "evidence_request": "release_apparatus_basis",
      "owner_hint": "editor",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the release, correction, digital-edition, GPO/ISBN/S/N, errata, date-type, or capture-date target."
    },
    {
      "evidence_request": "authority_control",
      "owner_hint": "editor",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the Persons, title, abbreviation, index term, office, date span, or authority-list form."
    },
    {
      "evidence_request": "declassification_status",
      "owner_hint": "declassification",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the release, withholding, excision, bracket, agency-equity, or review outcome."
    },
    {
      "evidence_request": "translation_status",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the language, official/unofficial status, foreign-origin copy, typed signature, bracket, or equity basis."
    },
    {
      "evidence_request": "chronology",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the time, place, attendance, sequence, diary, schedule, call-log, or meeting basis."
    },
    {
      "evidence_request": "event_chronology",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the summit, trip, ceremony, interview, press event, public remarks, participant, or full-record target."
    },
    {
      "evidence_request": "communications_metadata",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the telegram/cable/system, message identifier, date-time group, origin, addressee, routing, or distribution metadata."
    },
    {
      "evidence_request": "source_family",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the volume family, source ecology, subseries, or family-specific source-note form to preserve."
    },
    {
      "evidence_request": "cross_reference",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the related document, footnote, appendix, telegram, volume, chapter, or target anchor."
    },
    {
      "evidence_request": "wrapper_safety",
      "owner_hint": "wrapper",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the Word anchor, existing revision, comment, field, table, note reference, pseudo-marker, or package validation issue."
    }
  ]
}
```

## Final Output Reminder

Return only one JSON object with top-level keys: `schema_version`, `document_assessment`, `batch_readiness`, `checks`, `global_comments`, and `style_discrepancy_tally`.
