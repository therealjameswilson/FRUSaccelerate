# FRUS Annotation Review Packet Chunk

- run_id: sample-llm-chunks
- chunk_id: chunk-0001
- chunk_index: 1
- chunk_count: 2
- unit_id_range: source-note-0001 to editorial-note-0002
- target_volume: frus1989-92v31

Return only one valid `checker-output-v1` JSON object for this chunk. Every reviewable unit in this chunk needs a checker entry; use `no_change` when the unit is sound.

Do not include units outside this chunk. Do not claim to edit the Word file directly. The wrapper will merge and validate chunk outputs before applying Word comments or tracked changes.

## Chunk Manifest

```json
{
  "schema_version": "frus-llm-review-chunk-v1",
  "run_id": "sample-llm-chunks",
  "chunk_id": "chunk-0001",
  "chunk_index": 1,
  "chunk_count": 2,
  "unit_ids": [
    "source-note-0001",
    "editorial-note-0002"
  ],
  "reviewable_unit_ids": [
    "source-note-0001",
    "editorial-note-0002"
  ]
}
```

## Runtime FRUS Annotation Checker Guide

# FRUS Annotation Checker Core Prompt

Version: 2026-06-03

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
For the per-document Markdown packet that a closed-network LLM should review,
run
`node scripts/build-frus-llm-review-packet.mjs --units extracted-units.json --out review-packet.md --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID`.
For small-context LLMs that cannot fit a whole sheet, build chunk packets with
`node scripts/build-frus-llm-review-chunks.mjs --units extracted-units.json --out-dir review-chunks --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID --max-units 12`, then merge outputs with
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
For document-metadata validation and direct-edit safety, run
`node scripts/validate-frus-document-metadata-registry.mjs --registry reports/frus-document-metadata-registry.sample.json --format text` and
`node scripts/audit-frus-document-metadata-usage.mjs --units extracted-units.json --registry reports/frus-document-metadata-registry.sample.json --checker-output output.json --target-volume VOLUME-ID --format text`.
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
`--status-registry reports/frus-status-series-1981-1992.current.json --authority-registry reports/frus-authority-registry.sample.json --source-list-registry reports/frus-source-list-registry.sample.json --document-metadata-registry reports/frus-document-metadata-registry.sample.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --today YYYY-MM-DD`.
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
For real Reagan/Bush 1981-1992 document-metadata review, replace the sample
document-metadata registry with target-volume document-page records covering
document number, heading, date line, subject/title, sender/recipient,
attachment behavior, editorial-note form, and source-note linkage; validate it
with `scripts/validate-frus-document-metadata-registry.mjs` before direct
metadata edits.
For volume-family and stage-posture routing, validate and use
`reports/frus-preparation-router-1981-1992.current.json` with
`scripts/validate-frus-preparation-router.mjs` before family-dependent direct
edits.
For category, evidence-request, and router-hazard coverage, validate and use
`reports/frus-annotation-permutation-matrix.json` with
`scripts/validate-frus-permutation-matrix.mjs`.
For source-note component diagnostics, run
`node scripts/lint-frus-source-notes.mjs --units reports/frus-source-note-units.sample.json`.
For production pseudo-marker boundary checks, run
`node scripts/preflight-frus-pseudo-markers.mjs --units reports/frus-pseudo-marker-units.sample.json --output reports/frus-pseudo-marker-safe-output.sample.json`.
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
   source-list registry, document-metadata registry, preparation router, and
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
12. Wrapper applies only safe edits as WordprocessingML tracked insertions,
   deletions, and comments.
13. User downloads a new `.docx` with changes marked in Track Changes.

Important: the LLM must not write `.docx`, OOXML, base64 files, or package
instructions. The wrapper creates the revised Word file.

## 3. Required Inputs

The wrapper should provide:

- `document_manifest`: file name, upload date, review mode, target volume if
  known, whether existing tracked changes are present.
- `extracted_units`: ordered units with `unit_id`, `unit_type`, `location`,
  `exact_text`, `display_text`, `surrounding_text`, editability, and Word
  anchor metadata.
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
  markings, verified absence of marking, and release-status separation.
- `document_status_context`: draft/final, original/copy, signed/unsigned,
  routing, approval, distribution, enclosure, attachment, and lifecycle evidence.
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
  "source": "Chunk chunk-0001 extracted units from reports/frus-annotation-checker-extracted-units.sample.json",
  "units": [
    {
      "unit_id": "source-note-0001",
      "unit_type": "source_note",
      "editability": "context_only",
      "edit_safety": "comment_only",
      "comment_safety": "safe_to_comment",
      "word_part": "word/footnotes.xml",
      "location": "Document 1, footnote 1",
      "exact_text": "Source: https://example.invalid/catalog-record. The document was attached to a memorandum for the record.",
      "display_text": "Source: https://example.invalid/catalog-record. The document was attached to a memorandum for the record.",
      "existing_revisions": false,
      "existing_comments": [],
      "blocked_boundaries": [
        "provisional_url_only_source_path"
      ]
    },
    {
      "unit_id": "editorial-note-0002",
      "unit_type": "editorial_note",
      "editability": "context_only",
      "edit_safety": "comment_only",
      "comment_safety": "safe_to_comment",
      "word_part": "word/document.xml",
      "location": "Editorial Note after Document 2",
      "exact_text": "Editorial Note. On January 20, the President met with the Secretary of State. A memorandum of conversation is printed as Document 3.",
      "display_text": "Editorial Note. On January 20, the President met with the Secretary of State. A memorandum of conversation is printed as Document 3.",
      "existing_revisions": false,
      "existing_comments": [],
      "blocked_boundaries": []
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
        "treaty_component"
      ]
    },
    {
      "category": "public_diplomacy_public_source",
      "direct_edit_policy": "comment_unless_context",
      "required_context": [
        "public_diplomacy_context",
        "release_apparatus_context"
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
      "comment_target_template": "Identify the treaty, protocol, annex, MOU, agreement, transmittal, ratification, or associated-document status."
    },
    {
      "evidence_request": "public_source_basis",
      "owner_hint": "compiler",
      "blocks_direct_edit_by_default": true,
      "blocks_final_publication_by_default": true,
      "comment_target_template": "Identify the public source, transcript, delivery, publication, page, excerpt, or archival-draft relationship."
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
