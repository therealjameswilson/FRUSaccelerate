# FRUS Annotation Checker

Version: 2026-06-03

Purpose: This file is a standalone operating prompt and implementation
specification for a closed-network tool that checks Microsoft Word annotations
against FRUS editorial standards. It is forked from the Reagan-Bush FRUS Style
Guide and is designed for a rudimentary LLM plus a Word-processing wrapper.

The intended workflow is:

1. User uploads this Markdown file as the standard.
2. User uploads a Microsoft Word `.docx` file containing FRUS annotations,
   source notes, editorial notes, or draft front/back matter.
3. The tool extracts the Word document into structured text.
4. The LLM checks the extracted annotation text against the standards below.
5. The LLM returns structured proposed edits and comments.
6. The Word wrapper applies the proposed edits as tracked changes and comments.
7. User downloads a new `.docx` with changes marked in Track Changes.

Important limitation: the LLM should not be trusted to write `.docx` files
directly. The LLM should return a strict edit plan. The wrapper must create the
Word file and mark insertions, deletions, and comments using WordprocessingML
track-change markup.

## 1. System Role For The LLM

Use this role prompt inside the closed-network tool.

```text
You are the FRUS Annotation Checker. You review annotations, source notes,
editorial notes, captions, cross-references, and related front/back matter for
compliance with FRUS editorial standards for Ronald Reagan and George H.W. Bush
volumes.

You must be conservative. Do not invent archival facts, document numbers,
classification markings, dates, titles, source paths, declassification results,
or cross-references. If a correction requires evidence not present in the input,
leave a comment asking for verification instead of rewriting the text as fact.

You may propose edits only to annotation material, source notes, editorial
notes, headings, front/back matter, and related editorial apparatus. Do not edit
transcribed document text unless the input explicitly labels that text as
editorial annotation or the user asks for transcription review.

Return only valid JSON in the required schema. Do not include prose outside the
JSON.
```

## 2. Required Inputs

The wrapper should provide the LLM with:

- `standard_markdown`: this file or a current FRUS style-guide extract.
- `document_manifest`: filename, upload date, page/section metadata, and whether
  the uploaded Word file already contains tracked changes.
- `extracted_units`: an ordered list of extracted Word units.
- `chunk_manifest`, if the document is split for a small-context model:
  `packet_id`, `chunk_id`, `chunk_count`, unit id range, overlap policy, and a
  short packet-level summary supplied by the wrapper.
- `authority_context`, if available: volume title, administration, date range,
  known document numbers, Persons authority list, abbreviations list, repository
  authority list, and neighboring-volume references.
- `authority_registry_context`, if available: structured Persons,
  abbreviations, source-list, repository, chapter, document-number, and index
  registries with stable ids, approved display forms, variants, date spans, and
  source URLs or local provenance.
- `document_metadata_registry_context`, if available: structured document
  number, heading, document type, sender, recipient, offices, place/date line,
  internal document number, subject/title line, caption, public-title line,
  source-note linkage, and verification basis.
- `classification_registry_context`, if available: structured original
  classification marking, handling markings, precedence, paragraph markings,
  verified absence of classification marking, release-status separation, and
  source-image or published-pattern basis.
- `translation_registry_context`, if available: structured language,
  translation source, official/unofficial/informal translation status,
  foreign-origin provenance, copy basis, typed-signature or facsimile status,
  bracket/translator-note treatment, and agency or foreign-government equity.
- `foreign_international_org_context`, if available: structured
  foreign-government, international-organization, multilateral, regional-body,
  alliance, coalition, treaty-depositary, peacekeeping, development-bank,
  conference, published-organization-source, copy-provenance, concurrence,
  translation, and selected-versus-supplemental metadata.
- `treaty_registry_context`, if available: structured treaty, protocol, annex,
  memorandum of understanding, executive agreement, letter, declaration,
  statement, presidential transmittal, article-by-article analysis,
  ratification, entry-into-force, and associated-document metadata.
- `source_family_registry_context`, if available: structured source-family
  controls derived from published FRUS source lists and local authority files,
  including family ids, volume scope, required path components, distinguishing
  tokens, allowed variants, and no-flattening rules.
- `physical_routing_context`, if available: structured physical/source-image
  evidence for handwritten notes, initials, marginalia, highlighting,
  underlining, checkmarks, stamped notations, read-by or seen stamps, signed or
  unsigned status, approval boxes, sent-for-action or sent-for-information
  routing, correspondence profiles, distribution lists, attached routing slips,
  unknown-hand notes, and verification basis.
- `retrospective_account_context`, if available: structured memoir, published
  diary, personal diary, oral history, recollection, later interview, press
  retrospective, author/editor, publication, page, date, event described,
  relation to official record, corroborating record, and verification basis.
- `communications_registry_context`, if available: structured telegram, cable,
  STARS, CFPF, PROFS, W Files, System IV, agency-message, and other
  electronic-communications metadata with source family, message identifier,
  origin, addressee, date-time group, precedence, classification/handling,
  drafting, clearance, approval, distribution, and verification status.
- `attachment_registry_context`, if available: structured attachment, tab,
  enclosure, annex, appendix-image, and facsimile relationships with physical
  status, editorial status, printed target, source label, and verification
  basis.
- `declassification_registry_context`, if available: structured omission,
  bracket, excision, withholding, original-bracket, release-status, and
  declassification-review assertions with quantity, type, evidence basis, and
  reviewer status.
- `chronology_registry_context`, if available: structured meeting, call,
  briefing, travel, diary, schedule, memcon, telcon, minutes, and no-record
  assertions with time, place, participants, record-found status, and evidence
  basis.
- `event_chronology_context`, if available: structured summit, conference,
  ceremony, public-event, travel, interview, press conference, speech, toast,
  delegation-meeting, itinerary, and public-remarks evidence with times, places,
  participants, public-source basis, diary/schedule basis, press basis, and
  related full-record targets.
- `public_diplomacy_context`, if available: structured speeches, press
  releases, press conferences, briefings, interviews, testimony, public remarks,
  official transcripts, Public Papers citations, Department of State Bulletin
  citations, newspaper excerpts, broadcast facts, speech-file drafts, briefing
  materials, selected-public-document status, and supplemental-public-context
  metadata.
- `congressional_legal_context`, if available: structured congressional
  testimony, hearing, committee, budget message, public law, statute, continuing
  resolution, joint resolution, congressional notification, Presidential
  Determination, certification, Executive Order, independent counsel,
  congressional oversight, Senate advice-and-consent, ratification, and
  report-to-Congress metadata.
- `economic_financial_context`, if available: structured economic, debt, trade,
  foreign-assistance, international-financial-institution, budget, commodity,
  development-bank, IMF, World Bank, GATT, UNCTAD, OECD, summit, table,
  percentage, dollar amount, fiscal-year, appropriation, loan, guarantee,
  quota, conditionality, and financial-instrument metadata.
- `sensitive_record_context`, if available: structured intelligence,
  covert-action, law-enforcement, counternarcotics, counterterrorism,
  agency-equity, source-and-methods, operational, oversight,
  foreign-service-contact, redaction/sanitization, original
  classification/handling, public-policy-only, source-family, and
  verification-status metadata.
- `military_crisis_context`, if available: structured DOD, OSD, JCS, DIA,
  Situation Room, NSC crisis, combat operation, military strike, contingency
  plan, CONPLAN, deployment, port visit, exercise, security assistance,
  host-nation notification, coalition, peacekeeping, casualty/damage,
  after-action, classification/precedence, chronology, and verification-status
  metadata.
- `human_rights_refugee_context`, if available: structured human-rights report,
  refugee, immigration, asylum, migration, famine, emergency relief, food aid,
  public-health, population, environmental, sanctions, waiver, certification,
  public-report, international-organization, PVO, AID, PRM, PL 480, Section 416,
  Section 206, quantity, metric, date/deadline, source-family, public/archival
  basis, and verification-status metadata.
- `cross_reference_registry_context`, if available: structured same-volume,
  cross-volume, footnote, appendix, tab, attachment, printed-elsewhere,
  scheduled-publication, and public-source references with target status,
  document number, volume title, and verification basis.
- `series_status_context`, if available: current History Office status
  (`published`, `anticipated`, `being_cleared`, `being_researched`, or
  `planned`), target volume title, known chapter status, and any official
  status-page link.
- `status_registry_context`, if available: the dated offline registry entry
  for the target volume and any cross-referenced volume, preserving both the
  production stage (`being_cleared`, `being_researched`, `planned`, or
  `published`) and any release bucket (`published_2025`, `anticipated_2026`,
  chapters outstanding, or similar).
- `volume_family_context`, if available: likely FRUS volume family, such as
  foundations/public diplomacy, organization/management, Europe/Russia,
  Americas, Middle East, Africa, East Asia/Pacific, arms control/national
  security, economic policy, global issues, terrorism/counternarcotics, or
  mixed. This should come from the wrapper's volume-title/status match or from
  explicit user context, not from LLM guesswork alone.
- `annotation_sheet_context`, if available: whether the uploaded file is a
  research sheet, chapter annotation sheet, clearance pass, final style pass,
  source-list draft, Persons/abbreviations draft, or mixed editorial packet;
  whether source images or scans are available to the wrapper; and whether the
  user wants a light, normal, or exhaustive redline.

Each extracted unit should have a stable `unit_id`.

Example extracted unit:

```json
{
  "unit_id": "footnote-0012",
  "unit_type": "source_note",
  "location": "Document 7, footnote 1",
  "paragraph_style": "Footnote Text",
  "text": "Source: George H.W. Bush Library, Bush Presidential Records, National Security Council, H-Files, NSR Files, OA/ID 90006-025, NSR-14--April 03, 1989--Review of U.S. Arms Control Policies [1]. Secret.",
  "surrounding_text": "## 7. National Security Review 14"
}
```

Recommended `unit_type` values:

- `source_note`
- `follow_on_footnote`
- `editorial_note`
- `document_heading`
- `attachment_note`
- `declassification_note`
- `persons_entry`
- `abbreviation_entry`
- `index_entry`
- `front_matter`
- `source_list_entry`
- `unknown_editorial_text`
- `transcribed_document_text`

## 3. Required Output Schema

The LLM must return valid JSON with this shape:

```json
{
  "schema_version": "checker-output-v1",
  "document_assessment": {
    "overall_status": "pass | pass_with_comments | needs_revision | blocked",
    "summary": "Short assessment of annotation quality.",
    "blocked_reason": "Only if overall_status is blocked."
  },
  "checks": [
    {
      "unit_id": "footnote-0012",
      "severity": "blocker | major | minor | info",
      "category": "source_note | citation | attachment | annotation | editorial_note | document_metadata | classification_handling | physical_routing_marginalia | memoir_oral_history_recollection | translation_foreign_origin | foreign_international_organization | treaty_legal_instrument | public_diplomacy_public_source | congressional_legal_authority | economic_financial_data | intelligence_law_enforcement | military_crisis_operations | human_rights_refugee_global_issues | declassification | authority_control | chronology | summit_public_event | communications_record | publication_status | wording | evidence | format",
      "finding": "Plain-language issue.",
      "standard": "Specific FRUS rule applied.",
      "recommended_action": "replace_text | insert_after_text | delete_text | comment_only | no_change",
      "original_text": "Exact text to be changed, or empty for comment_only.",
      "replacement_text": "Exact replacement text, or empty if not applicable.",
      "comment_text": "Comment to place in Word, explaining rationale or needed verification.",
      "evidence_request": "none | source_image | archival_path | classification_marking | physical_evidence_basis | attachment_status | document_number | document_metadata | foreign_org_basis | treaty_component | public_source_basis | retrospective_account_basis | legal_authority | financial_data | agency_equity | military_operation_basis | humanitarian_rights_basis | publication_status | authority_control | declassification_status | translation_status | chronology | event_chronology | communications_metadata | source_family | cross_reference | wrapper_safety",
      "verification_target": "Short target for the compiler or wrapper, or empty if not applicable."
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
      "category": "source_note | citation | attachment | editorial_note | document_metadata | classification_handling | physical_routing_marginalia | memoir_oral_history_recollection | translation_foreign_origin | foreign_international_organization | treaty_legal_instrument | public_diplomacy_public_source | congressional_legal_authority | economic_financial_data | intelligence_law_enforcement | military_crisis_operations | human_rights_refugee_global_issues | declassification | authority_control | chronology | summit_public_event | communications_record | publication_status | wording | format | wrapper",
      "style_question": "Short description of the unresolved style variation.",
      "variant_a": "One observed form.",
      "variant_b": "Another observed form.",
      "unit_ids": ["footnote-0012"],
      "published_or_local_examples": ["Short source label or URL if supplied in context."],
      "count": 1,
      "risk": "low | medium | high",
      "checker_action": "no_change | comment_only | direct_edit_applied",
      "general_editor_question": "Decision question for the General Editor."
    }
  ]
}
```

Rules for JSON edits:

- `schema_version` must be `checker-output-v1`. Reject any output that omits the
  version or uses an unknown version.
- `original_text` must be an exact substring of the extracted unit when
  `recommended_action` is `replace_text`, `insert_after_text`, or
  `delete_text`.
- For `insert_after_text`, treat `original_text` as the exact anchor and insert
  `replacement_text` immediately after that anchor.
- Use `comment_only` when the LLM cannot safely supply exact replacement text.
- Use `no_change` only when the unit was checked and no issue was found.
- Never include invented facts inside `replacement_text`.
- Keep `comment_text` concise enough to fit as a Word comment.
- Use `evidence_request` and `verification_target` when the finding requires
  human or wrapper verification. Use `none` and an empty target for safe direct
  edits and `no_change` findings.
- Use `style_discrepancy_tally` for recurring style variations that should be
  reviewed by the General Editor rather than silently normalized by the checker.

### 3.1 Machine-Readable Output JSON Schema

Use this schema in the wrapper before applying any tracked changes. Passing this
schema only proves that the output is shaped correctly. The wrapper must still
run the semantic and Word-safety validators below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.invalid/frus-annotation-checker-output.schema.json",
  "title": "FRUS Annotation Checker Output",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "document_assessment",
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
          "type": "string",
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
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "unit_id",
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
            "type": "string"
          },
          "severity": {
            "type": "string",
            "enum": [
              "blocker",
              "major",
              "minor",
              "info"
            ]
          },
          "category": {
            "type": "string",
            "enum": [
              "source_note",
              "citation",
              "attachment",
              "annotation",
              "editorial_note",
              "document_metadata",
              "classification_handling",
              "physical_routing_marginalia",
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
              "summit_public_event",
              "communications_record",
              "publication_status",
              "wording",
              "evidence",
              "format"
            ]
          },
          "finding": {
            "type": "string"
          },
          "standard": {
            "type": "string"
          },
          "recommended_action": {
            "type": "string",
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
            "type": "string",
            "enum": [
              "none",
              "source_image",
              "archival_path",
              "classification_marking",
              "physical_evidence_basis",
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
          },
          "verification_target": {
            "type": "string"
          }
        }
      }
    },
    "global_comments": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "severity",
          "comment_text"
        ],
        "properties": {
          "severity": {
            "type": "string",
            "enum": [
              "major",
              "minor",
              "info"
            ]
          },
          "comment_text": {
            "type": "string"
          }
        }
      }
    },
    "style_discrepancy_tally": {
      "type": "array",
      "items": {
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
          "general_editor_question"
        ],
        "properties": {
          "discrepancy_id": {
            "type": "string",
            "pattern": "^style-discrepancy-[0-9]{4}$"
          },
          "category": {
            "type": "string",
            "enum": [
              "source_note",
              "citation",
              "attachment",
              "editorial_note",
              "document_metadata",
              "classification_handling",
              "physical_routing_marginalia",
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
              "summit_public_event",
              "communications_record",
              "publication_status",
              "wording",
              "format",
              "wrapper"
            ]
          },
          "style_question": {
            "type": "string"
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
            "type": "string",
            "enum": [
              "low",
              "medium",
              "high"
            ]
          },
          "checker_action": {
            "type": "string",
            "enum": [
              "no_change",
              "comment_only",
              "direct_edit_applied"
            ]
          },
          "general_editor_question": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

Schema validator behavior:

- Reject the entire LLM response if JSON parsing fails, the schema version is
  missing, a required top-level array is missing, or an enum value is outside
  the schema.
- Treat empty arrays as valid. A perfect packet may have no findings and no
  discrepancy-tally items.
- Reject unknown properties. Extra prose, markdown, model reasoning, or
  unrecognized fields should not pass silently into the Word wrapper.
- Preserve the raw rejected response in the audit log, but do not insert it into
  the Word file.

Semantic validator behavior:

- If `overall_status` is `blocked`, require a non-empty `blocked_reason`.
- If `overall_status` is not `blocked`, require `blocked_reason` to be empty.
- For `replace_text`, `insert_after_text`, and `delete_text`, require non-empty
  `original_text` and exact one-time matching against the mapped `exact_text`.
- For `replace_text` and `insert_after_text`, require non-empty
  `replacement_text`.
- For `delete_text`, require empty `replacement_text`.
- For `comment_only`, require non-empty `comment_text`.
- For `no_change`, require empty `original_text`, `replacement_text`,
  `comment_text`, and `verification_target`, with `evidence_request` set to
  `none`.
- If `evidence_request` is not `none`, require a non-empty
  `verification_target`.
- Reject any direct edit whose category is `publication_status`,
  `declassification`, `attachment`, `document_metadata`,
  `classification_handling`, `physical_routing_marginalia`,
  `memoir_oral_history_recollection`, `translation_foreign_origin`,
  `foreign_international_organization`, `treaty_legal_instrument`,
  `public_diplomacy_public_source`, `congressional_legal_authority`,
  `economic_financial_data`, `intelligence_law_enforcement`,
  `military_crisis_operations`, `human_rights_refugee_global_issues`,
  `chronology`, `summit_public_event`, `communications_record`, or
  `authority_control` when the required proof is absent from the uploaded unit or
  wrapper context.
- Downgrade to `comment_only` when a finding passes the JSON schema but fails a
  Word-safety, status-registry, cross-chunk, or exact-anchor validator.

## 4. Word Wrapper Requirements

The closed-network application must perform these functions outside the LLM:

1. Extract Word content from `.docx`, including footnotes, endnotes, comments,
   headings, body paragraphs, tables, and existing tracked changes.
2. Preserve stable `unit_id` mappings from extracted text back to Word XML
   locations.
3. Send only editorial apparatus and necessary surrounding context to the LLM.
4. Validate the LLM JSON against the required schema.
5. Reject any edit whose `original_text` is not found exactly in the target
   unit.
6. Apply accepted edits as Word tracked changes:
   - deleted text becomes Word deletion markup;
   - inserted or replacement text becomes Word insertion markup;
   - comments become Word comments authored by `FRUS Annotation Checker`;
   - original document text remains untouched unless explicitly targeted.
7. Preserve existing tracked changes unless the user chooses to accept or reject
   them before running the checker.
8. Export a new `.docx` with a filename such as:
   `original_filename.frus-annotation-check.docx`.
9. Generate an optional audit report listing every edit, rejected edit, and
   comment.

The wrapper, not the LLM, is responsible for the track-change layer. In `.docx`
terms, replacements should be represented as paired deletion and insertion
elements with reviewer, timestamp, and location metadata.

### 4.1 Word Extraction And Track-Change Contract

The wrapper must be stricter than the LLM. It should treat the uploaded Word
file as the authority for locations, formatting, existing revisions, comments,
footnote numbering, and table structure.

Extraction contract:

- Unzip the `.docx` and parse WordprocessingML with an XML parser. Do not use
  ad hoc string replacement inside XML parts.
- Read, at minimum, `word/document.xml`, `word/footnotes.xml`,
  `word/endnotes.xml`, `word/comments.xml`, relevant headers and footers, and
  relationship files needed to preserve comments, notes, numbering, and styles.
- Preserve the original `.docx` package parts that the checker does not edit.
  The output package should differ only where accepted edits, checker comments,
  metadata, or audit artifacts require a change.
- Keep two text forms for each unit:
  - `display_text`: readable text sent to the LLM, with footnote references,
    table cell boundaries, and comment markers represented plainly;
  - `exact_text`: the exact string reconstructed from mapped Word text runs,
    used for `original_text` matching.
- Never normalize punctuation, capitalization, line breaks, tabs, nonbreaking
  spaces, footnote references, or paragraph marks inside `exact_text` without
  recording a reversible map back to the original runs.
- Assign each unit a stable location object, not just a label. Include the Word
  part, paragraph or table-cell path, footnote/endnote/comment id when
  applicable, run sequence, and character offsets in the reconstructed
  `exact_text`.
- Store whether the unit overlaps existing tracked insertions, deletions,
  moves, comments, fields, hyperlinks, content controls, bookmarks, or tables.
  These structures change how safely the wrapper can apply edits.

Recommended extracted-unit fields:

```json
{
  "unit_id": "footnote-0012",
  "unit_type": "source_note",
  "location": "Document 7, footnote 1",
  "word_part": "word/footnotes.xml",
  "xml_anchor": {
    "footnote_id": "12",
    "paragraph_index": 0,
    "run_start": 0,
    "run_end": 14,
    "char_start": 0,
    "char_end": 286
  },
  "paragraph_style": "Footnote Text",
  "display_text": "Source: George H.W. Bush Library...",
  "exact_text": "Source: George H.W. Bush Library...",
  "surrounding_text": "## 7. National Security Review 14",
  "existing_revisions": false,
  "existing_comments": [],
  "edit_safety": "safe_to_edit"
}
```

Unitization rules:

- Treat source notes in footnotes or endnotes as distinct units even when Word
  extraction places all notes in one XML part.
- Treat document headings, supplied titles, editorial notes, attachment notes,
  and bracketed omission notes as separate units when paragraph styles or nearby
  context make the boundary clear.
- Treat tables cell by cell, preserving row and column position. Do not merge a
  source-list table row, Persons entry, or abbreviation entry with adjacent
  rows unless the Word structure explicitly spans cells.
- Treat comments already in the uploaded file as context. Do not edit existing
  human comments; add new checker comments with a distinct author.
- Treat existing tracked insertions and deletions as unresolved unless the user
  has chosen to accept or reject them before extraction. Direct edits that
  overlap unresolved tracked changes should be rejected or downgraded to
  `comment_only`.
- Treat document body paragraphs as `transcribed_document_text` by default
  unless styles, headings, or wrapper context identify them as editorial
  apparatus.

Direct-edit validator:

- Match `original_text` against `exact_text`, not `display_text`.
- Reject a direct edit when `original_text` is missing, appears more than once
  in the same unit, spans unmapped XML boundaries, or overlaps existing tracked
  changes, comments, fields, hyperlinks, content controls, bookmarks, or table
  grid changes.
- Reject a direct edit when the proposed replacement would remove a footnote
  reference, endnote reference, comment reference, bookmark boundary, field code,
  tab, table-cell boundary, or paragraph mark.
- Reject a direct edit when the LLM proposes to modify
  `transcribed_document_text` and the user did not request transcription
  review.
- Downgrade to a Word comment when the wrapper can locate the issue but cannot
  safely express the change as a valid run-level insertion or deletion.
- Record every rejected edit in the audit report with the unit id, reason, and
  original LLM recommendation.

Track-change construction:

- Use a single reviewer name, `FRUS Annotation Checker`, for all generated
  insertions, deletions, and comments.
- Use monotonically increasing revision ids within the output document.
- Represent replacements as a deletion for the removed text and an insertion
  for the new text. Preserve the surrounding run properties unless the edit
  itself changes formatting.
- For deletions, preserve the original text as deleted text, not as removed
  plain text. For insertions, keep the inserted text inside Word insertion
  markup.
- Place checker comments on the smallest safe range: the exact source phrase
  when available, otherwise the whole paragraph, footnote, table cell, or
  heading unit.
- Preserve footnote numbers and endnote numbers. Do not create new notes unless
  a human-approved wrapper feature explicitly supports that operation.
- Preserve document styles. The checker should not silently restyle paragraphs,
  renumber lists, alter table geometry, or change page setup.
- After writing the output `.docx`, reopen it and confirm that the package is
  readable, all expected parts exist, and the count of applied tracked edits and
  comments matches the audit report.

## 5. Review Severity

Use severity consistently:

- `blocker`: The note cannot be published or checked without missing core
  evidence, broken source identity, unsafe invented fact, or ambiguous target.
- `major`: The note conflicts with FRUS standards or could mislead readers.
- `minor`: The note is basically sound but needs style, form, or concision work.
- `info`: A non-blocking observation or optional improvement.

## 6. Core FRUS Annotation Standards

### 6.1 Source Notes

The first footnote to each document is the source note. It should be compact,
factual, and ordered from repository to document-specific evidence.

Preferred order:

1. `Source:`
2. Repository or originating agency.
3. Record group, office, collection, series, file unit, lot, OA/ID, box, folder,
   or document number.
4. Classification and handling markings.
5. Document status: sent for action, sent for information, draft, final,
   original, copy, declassified, or no classification marking when verified.
6. Drafting, clearance, distribution, signature, routing, stamped notations,
   marginalia, annotations, or read-by evidence.
7. Meeting location, diary corroboration, attachment status, or cross-reference
   when needed.

Flag these issues:

- Source note does not begin with `Source:`.
- Note leads with URL, PDF filename, NARA catalog number, release platform, or
  compiler assessment instead of archival path.
- Repository path is missing or out of order.
- Classification or handling marking is missing, guessed, or confused with
  release status.
- `Declassified` is used as if it were the original classification.
- `No classification marking` is asserted without evidence from the document.
- Attachment, marginalia, routing, or read-by claims are not supported.
- A Bush START source note does not fit a recognized Volume XXXI source family
  when the uploaded context provides enough evidence to identify one: Bush Vice
  Presidential Records; Bush Presidential Records H-Files, Scowcroft, Gates, or
  NSC staff files; Department of State CFPF, STARS, or lot/Executive
  Secretariat files; agency records; or public/printed source.
- A Reagan XLIV Part 1 source note does not fit a recognized source family when
  the uploaded context provides enough evidence to identify one: NSC
  Institutional/Executive Secretariat files; Reagan Library staff/subject files;
  PROFS; W Files; System IV Intelligence Files; President's Daily Diary or
  schedule records; Shultz/Hoover copies; Department of State lot or CFPF files;
  Library of Congress/private papers; DOD/OSD/WNRC/JCS/agency records; or Bush
  transition records.
- A recent Reagan-era source note is flattened into a generic form when the
  uploaded context supports a more precise family: Reagan Library
  staff/subject/directorate files; NSC Institutional/Executive Secretariat
  files; State lot/Executive Secretariat/office files; State CFPF; PROFS; W
  Files; System IV; Shultz/Hoover/private copies; Library of Congress/private
  papers; DOD/OSD/WNRC/JCS/agency records; economic/assistance agency records;
  Bush/Carter/other Presidential records; foreign/international organization
  records; or public/printed selected sources.
- PROFS, W Files, System IV, RAC, NSC Washington files, and Bush transition
  records are normalized into generic Reagan Library source paths.
- Bush H-Files source note omits the specific subseries, such as `NSR Files`,
  `NSD Files`, `NSC Meetings Files`, or `NSC/DC Meetings Files`, when the
  source path supplies it.
- A pre-January 20, 1989 Bush transition document from Vice Presidential files is
  cited as `Bush Presidential Records`.
- State STARS material lacks the STARS identifier, verified classification
  status, or available drafting and clearance information.
- Reagan foundations-volume speech or campaign material omits the archival
  Speechwriting, WHORM `SP`, Vertical File, 1980 Transition Papers, or other
  control-copy path when available.
- Public-speech source notes omit available campaign committee, letterhead,
  venue, audience, delivery time, draft status, or handwritten notation.
- Private-paper source notes omit manuscript collection, division, box,
  folder/date, handling markings, read-by stamp, or marginalia when supplied by
  the source.
- Handwritten-note source notes do not say that the editor transcribed the text
  from the handwritten original, or omit an appendix-image cross-reference when
  a facsimile is printed.
- Working notes such as "needs scan," "candidate," or URL-only locators remain
  in publishable text.

Common replacement patterns:

```text
Source: Reagan Library, [office or staff files], [series], [folder]. [Classification; handling]. [Drafting/routing/annotation note.]
```

```text
Source: Reagan Library, White House Office of Speechwriting, Research Office, [series], [folder]. [Classification or no classification marking]. [Draft/letterhead/venue/audience/time/handwritten notation/campaign context.]
```

```text
Source: Library of Congress, Manuscript Division, [person] Papers, [office or series], Box [number], [folder/date]. [Classification; handling]. [Read-by stamp/handwritten note/highlighting/underlining/checkmark.]
```

```text
Source: George H.W. Bush Library, Bush Presidential Records, National Security Council, H-Files, [file type], OA/ID [number], [folder title]. [Classification; handling]. [Routing/approval/annotation note.]
```

```text
Source: George H.W. Bush Library, Bush Vice Presidential Records, [office], [staff member files], [series], OA/ID [number], [folder title]. [Classification; handling]. [Initials/annotation/routing note.]
```

```text
Source: Department of State, Central Foreign Policy File, [Electronic Telegrams/D Reels/N Reels/P Reels], [identifier]. [Classification; handling; precedence]. [Drafting/clearance note.]
```

```text
Source: Department of State, STARS [identifier]. [Classification or no classification marking]. [Drafted by/cleared by]. [Attachment/transmittal note.]
```

Volume XXXI corpus note: the all-document pass found source notes for 239 of
247 documents. The 8 documents without source notes are editorial notes. Do not
invent a source note for an `Editorial Note`; check instead whether the note
itself gives enough documentary citations, chronology, and cross-references.

#### 6.1.1 Source-Family Registry Validation

Use a source-family registry when the wrapper can supply one. Published source
lists from Reagan national-security, Bush START, and Reagan foundations volumes
show that source families are not interchangeable. The checker should preserve
the real family form rather than replacing it with a generic repository path.

Minimum source-family registry:

```json
{
  "source_family_registry_id": "frus-1981-1992-source-families-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/sources"
  ],
  "families": [
    {
      "family_id": "reagan-nsc-exec-secretariat",
      "display_family": "Reagan Library, White House Staff and Office Files, NSC Executive Secretariat",
      "volume_scope": [
        "frus1981-88v44p1",
        "Reagan national security"
      ],
      "distinguishing_tokens": [
        "NSC Executive Secretariat",
        "NSDD",
        "NSPG",
        "System IV Intelligence Files",
        "Head of State File"
      ],
      "required_components_when_present": [
        "staff or office files",
        "series or subseries",
        "folder or file title",
        "classification and handling"
      ],
      "do_not_flatten_to": [
        "Reagan Library, White House Staff and Office Files"
      ],
      "evidence_request_if_uncertain": "source_family"
    },
    {
      "family_id": "reagan-profs-wfiles-systemiv",
      "display_family": "Reagan Library or NARA, PROFS, W Files, or System IV records",
      "volume_scope": [
        "frus1981-88v44p1",
        "Reagan national security"
      ],
      "distinguishing_tokens": [
        "PROFS",
        "W Files",
        "System IV",
        "NSC Washington files"
      ],
      "required_components_when_present": [
        "specific system or file family",
        "message or file identifier",
        "folder or subject",
        "classification and handling"
      ],
      "do_not_flatten_to": [
        "Reagan Library files",
        "White House Staff and Office Files"
      ],
      "evidence_request_if_uncertain": "source_family"
    },
    {
      "family_id": "bush-hfiles-national-security",
      "display_family": "George H.W. Bush Library, Bush Presidential Records, NSC Institutional Files (H-Files)",
      "volume_scope": [
        "frus1989-92v31",
        "Bush national security"
      ],
      "distinguishing_tokens": [
        "H-Files",
        "NSR Files",
        "NSD Files",
        "NSC Meeting Files",
        "NSC/DC Meetings Files"
      ],
      "required_components_when_present": [
        "H-Files",
        "subseries",
        "OA/ID",
        "folder title",
        "classification and handling"
      ],
      "do_not_flatten_to": [
        "Bush Library, NSC files",
        "Bush Presidential Records"
      ],
      "evidence_request_if_uncertain": "source_family"
    },
    {
      "family_id": "reagan-foundations-public-sources",
      "display_family": "Published public sources and Reagan speech/public-statement records",
      "volume_scope": [
        "frus1981-88v01",
        "foundations and public diplomacy"
      ],
      "distinguishing_tokens": [
        "Public Papers",
        "Department of State Bulletin",
        "Congressional Record",
        "Weekly Compilation",
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
        "Reagan Library archival source"
      ],
      "evidence_request_if_uncertain": "source_family"
    }
  ]
}
```

Source-family validator sequence:

1. Match source-note text against the registry before proposing a source-note
   rewrite. Look for repository labels, collection labels, system names, lot
   numbers, OA/ID values, reels, file titles, public-source titles, and
   distinctive family tokens.
2. If exactly one family matches and the uploaded unit supplies the required
   components, preserve that family in any direct edit.
3. If exactly one family matches but required components are missing, use
   `comment_only` with `evidence_request` set to `source_family` or
   `archival_path`, whichever is more specific.
4. If multiple families match, do not blend them. Comment for source-family
   confirmation and add a General Editor discrepancy only if both forms appear
   defensible in published or local exemplars.
5. If no family matches, avoid inventing a family from the volume title alone.
   Use a source-family comment for normal or exhaustive review when the note is
   publishable apparatus.
6. When a public or printed source is the selected documentary source, preserve
   the public-source family. Do not add an archival control-copy path unless
   the uploaded evidence supplies one.
7. When a Presidential Library, State, NARA, private-paper, agency, foreign, or
   international-organization copy is the selected source, preserve the selected
   copy's provenance even if another family has related background material.

Direct-edit posture:

- Safe direct edits may restore family labels already proven by the unit, such
  as adding a supplied H-Files subseries, correcting `No classification` to `No
  classification marking`, or preserving `P Reels`, `D Reels`, or `N Reels`
  when the identifier is present.
- Do not directly add a lot number, OA/ID, folder title, system name, file
  family, public-source title, or private-paper collection unless the exact
  evidence is present in the uploaded unit or wrapper context.
- Treat `source_family` findings as `major` in final style when the source note
  would otherwise publish a generic or misleading source path.
- Treat source-family uncertainty as `info` or `minor` in light research mode
  when the sheet is clearly a source lead rather than publication apparatus.

Source-family audit requirements:

- Count unmatched source families, ambiguous source-family matches, and direct
  source-family edits separately from ordinary source-note style changes.
- Preserve the registry id and source-list URLs used for the match.
- Add source-family discrepancies to the General Editor tally when the checker
  sees a recurring unresolved question, such as whether to enforce Bush H-Files
  subseries names, how much PROFS/W Files/System IV detail to preserve, or when
  a public source should be treated as selected evidence rather than context.

#### 6.1.2 Communications-Record Registry Validation

Use a communications-record registry when the wrapper can supply one. Reagan
and Bush-era volumes often rely on telegrams, cables, State electronic systems,
PROFS messages, W Files, System IV records, agency communications, and related
message forms. The checker should verify the communication metadata before it
rewrites a source note or follow-on annotation.

Minimum communications-record registry:

```json
{
  "communications_registry_id": "frus-1981-1992-communications-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/sources"
  ],
  "records": [
    {
      "record_id": "comm-state-cfpf-0001",
      "unit_id": "source-note-0012",
      "record_type": "cfpf_telegram",
      "source_family": "Department of State, Central Foreign Policy File",
      "repository_path_component": "[Electronic Telegrams, D Reels, N Reels, or P Reels]",
      "message_identifier": "[supplied CFPF identifier]",
      "origin": "[originating post or office]",
      "addressee": "[addressee post, office, or distribution if supplied]",
      "date_time_group": "[date-time group if supplied]",
      "classification": "[classification marking or no classification marking if verified]",
      "handling": "[handling markings if supplied]",
      "precedence": "[precedence if supplied]",
      "drafting": "[drafting note if supplied]",
      "clearance": "[clearance note if supplied]",
      "approval": "[approval note if supplied]",
      "distribution": "[distribution note if supplied]",
      "verification_status": "needs_source_image"
    },
    {
      "record_id": "comm-state-stars-0001",
      "unit_id": "source-note-0031",
      "record_type": "stars_record",
      "source_family": "Department of State, STARS",
      "repository_path_component": "STARS",
      "message_identifier": "[supplied STARS identifier]",
      "origin": "Department of State",
      "addressee": "[addressee if supplied]",
      "date_time_group": "[date-time group if supplied]",
      "classification": "[classification marking or no classification marking if verified]",
      "handling": "[handling markings if supplied]",
      "precedence": "",
      "drafting": "[drafted by note if supplied]",
      "clearance": "[cleared by note if supplied]",
      "approval": "",
      "distribution": "",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `cfpf_telegram`
- `stars_record`
- `profs_message`
- `w_file_message`
- `system_iv_record`
- `telegram_reference`
- `agency_cable`
- `field_report`
- `other_electronic_message`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_archival_path`
- `needs_identifier`
- `unknown`

Communications validator sequence:

1. Identify every source note, follow-on footnote, editorial note, or source-list
   entry that refers to a telegram, cable, electronic telegram, STARS item,
   CFPF D/N/P reel item, PROFS message, W File, System IV record, agency cable,
   message number, date-time group, precedence, drafting line, clearance line,
   approval line, or distribution line.
2. Match the unit against `communications_registry_context` before proposing a
   direct edit to message metadata.
3. Separate the source family from the communication form. For example, a State
   CFPF source note may need both the CFPF family and the specific reel or
   electronic-telegram identifier; a PROFS record may need both the Reagan
   Library or NARA family and the message-system identifier.
4. Preserve exact system labels supplied by the registry or unit, including
   `Electronic Telegrams`, `D Reels`, `N Reels`, `P Reels`, `STARS`, `PROFS`,
   `W Files`, and `System IV`.
5. Do not invent or normalize message identifiers, date-time groups, origin
   posts, addressees, precedence, drafting, clearance, approval, or distribution
   evidence. If these are missing, use `comment_only` with `evidence_request`
   set to `communications_metadata`, `source_image`, or `archival_path`.
6. Distinguish original classification and handling markings from release
   status. A telegram can be declassified for release while still requiring its
   original classification and handling markings in the source note.
7. Coordinate attachment and cross-reference checks when a communication is
   described as attached, enclosed, retransmitted, summarized, printed elsewhere,
   or not found.
8. For foreign, agency, or international-organization communications, comment
   for translation status, agency equity, foreign-copy provenance, or source
   image review when those facts matter and are not supplied.

Direct-edit posture:

- Safe direct edits may restore a proven system label, supplied reel component,
  supplied message identifier, or verified `No classification marking` phrase
  when the exact evidence is present.
- Do not directly add or remove origin, addressee, date-time group, precedence,
  drafting, clearance, approval, or distribution claims unless the exact
  information appears in the unit or registry.
- Treat an absent message identifier as `major` when the identifier is normally
  part of the selected source and the source note would otherwise be ambiguous.
- Treat uncertain style choices as General Editor discrepancy items rather than
  defects when both forms are factually supported.

Communications audit requirements:

- Count unmatched communications records, missing identifiers, missing
  date-time groups, unmatched source families, unsupported drafting or clearance
  claims, and direct communications-record edits separately from ordinary
  source-note style changes.
- Preserve the communications registry id, capture date, source-list URLs, and
  any unmatched message identifiers in the audit report.
- Add `communications_record` discrepancies to the General Editor tally when
  the checker sees a recurring unresolved style question, such as how much
  STARS detail to print, whether to preserve D/N/P reel labels in short source
  notes, how to handle PROFS/W Files/System IV identifiers, or whether drafting
  and clearance lines should appear when the message metadata is otherwise
  complete.

#### 6.1.2A Physical Evidence, Routing, Marginalia, And Approval Registry Validation

Published Reagan and Bush source notes frequently preserve physical evidence:
initials, handwritten marginalia, highlighting, underlining, checkmarks, read-by
stamps, stamped `Signed` or `Seen` notations, sent-for-action routing,
correspondence profiles, and attached routing slips. These are not decorative
details. They establish who saw a document, how it moved, whether an action was
approved, whether an attachment was present, and how much weight the printed
copy can bear. The checker should validate these claims before it changes them.

Use a physical/routing registry when the wrapper can supply one:

```json
{
  "physical_routing_registry_id": "frus-1981-1992-physical-routing-marginalia-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d24",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d50",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d75",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d129",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "records": [
    {
      "physical_item_id": "physical-bush-start-marginalia-0001",
      "unit_id": "document-0001",
      "record_type": "principal_marginalia",
      "source_family": "George H.W. Bush Library, Bush Vice Presidential Records, Office of National Security Affairs, Donald P. Gregg Files",
      "physical_evidence": "Watson initialed memorandum on Gregg's behalf; Bush wrote a top-right margin note on the memorandum and a bottom note on the attached letter",
      "actor_or_hand": "Samuel Watson; George H.W. Bush",
      "action_or_status": "initialed_on_behalf; handwritten_marginalia",
      "placement": "top right-hand margin of memorandum; bottom of attached letter",
      "linked_source_or_attachment": "Armstrong letter and two attached GRIP papers",
      "verification_status": "verified"
    },
    {
      "physical_item_id": "physical-bush-start-routing-0024",
      "unit_id": "document-0024",
      "record_type": "sent_for_action_and_read_by",
      "source_family": "George H.W. Bush Library, Bush Presidential Records, National Security Council, H-Files, NSC/DC Meetings Files",
      "physical_evidence": "sent-for-action status, read-by/routing evidence, and Deputies Committee meeting linkage",
      "actor_or_hand": "Gates; NSC/DC routing context",
      "action_or_status": "sent_for_action; read_by_stamp",
      "placement": "source note and follow-on footnote",
      "linked_source_or_attachment": "Summary of Conclusions for NSC/DC meeting",
      "verification_status": "verified"
    },
    {
      "physical_item_id": "physical-reagan-nsdd-approval-0050",
      "unit_id": "document-0050",
      "record_type": "approval_checkmark_and_signed_stamp",
      "source_family": "National Security Council, National Security Council Institutional Files, Box SR-090, NSDD 178",
      "physical_evidence": "sent for action; prepared by Douglass; Reagan initials in upper right-hand corner; stamped notation reads Signed; approval shown by checkmark and initials",
      "actor_or_hand": "Ronald Reagan; John Douglass",
      "action_or_status": "sent_for_action; initialed; signed; approval_checkmark",
      "placement": "upper right-hand corner and top of memorandum; recommendation line",
      "linked_source_or_attachment": "Tabs A and B printed as following document",
      "verification_status": "verified"
    },
    {
      "physical_item_id": "physical-haig-private-paper-0075",
      "unit_id": "document-0075",
      "record_type": "private_paper_marginalia",
      "source_family": "Library of Congress, Manuscript Division, Alexander Haig Papers, Department of State, Day File",
      "physical_evidence": "Haig saw stamp, handwritten top-right note, highlighting, underlining, margin note, and checkmark",
      "actor_or_hand": "Alexander Haig",
      "action_or_status": "seen_stamp; handwritten_marginalia; highlighting; underlining; checkmark",
      "placement": "top of memorandum; upper right-hand corner; right-hand margin; specific sentences",
      "linked_source_or_attachment": "",
      "verification_status": "verified"
    },
    {
      "physical_item_id": "physical-reagan-readby-routing-0129",
      "unit_id": "document-0129",
      "record_type": "read_by_stamp_and_correspondence_profile",
      "source_family": "Reagan Library, Executive Secretariat, NSC Subject File, Public Affairs (January 1983)",
      "physical_evidence": "stamped WPC HAS SEEN notation; attached NSC Correspondence Profile showing action and information routing",
      "actor_or_hand": "William P. Clark; NSC Correspondence Profile",
      "action_or_status": "seen_stamp; sent_for_action; sent_for_information",
      "placement": "source note",
      "linked_source_or_attachment": "attached NSC Correspondence Profile",
      "verification_status": "verified"
    },
    {
      "physical_item_id": "physical-shultz-meeting-folder-0316",
      "unit_id": "document-0316",
      "record_type": "unknown_hand_folder_notation",
      "source_family": "Reagan Library, George Shultz Papers, Secretary's Meetings with the President",
      "physical_evidence": "unknown-hand top-right notation identifying meeting folder; daily diary and Reagan diary provide meeting context; no minutes found",
      "actor_or_hand": "unknown hand; President's Daily Diary; Reagan diary",
      "action_or_status": "unknown_hand_notation; diary_context; no_minutes_found",
      "placement": "top-right hand corner of paper",
      "linked_source_or_attachment": "President's Daily Diary and Reagan diary entry",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `principal_marginalia`
- `private_paper_marginalia`
- `handwritten_note`
- `unknown_hand_notation`
- `initialed_on_behalf`
- `approval_checkmark_and_initials`
- `approval_checkmark_and_signed_stamp`
- `signed_or_stamped_status`
- `read_by_stamp_and_correspondence_profile`
- `sent_for_action_and_read_by`
- `sent_for_information`
- `routing_slip`
- `distribution_list`
- `highlighting_or_underlining`
- `attachment_physical_profile`
- `no_minutes_or_no_record_with_physical_context`
- `unknown`

Allowed `action_or_status` values:

- `seen_stamp`
- `read_by_stamp`
- `signed`
- `initialed`
- `initialed_on_behalf`
- `approval_checkmark`
- `handwritten_marginalia`
- `highlighting`
- `underlining`
- `checkmark`
- `sent_for_action`
- `sent_for_information`
- `prepared_by`
- `drafted_by`
- `cleared_by`
- `unknown_hand_notation`
- `attached_profile`
- `diary_context`
- `no_minutes_found`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_handwriting_basis`
- `needs_actor_or_hand_basis`
- `needs_routing_basis`
- `needs_action_status_basis`
- `needs_attachment_profile`
- `needs_placement_basis`
- `needs_diary_or_search_basis`
- `unknown`

Physical/routing validator sequence:

1. Identify every source note, follow-on footnote, editorial note, attachment
   note, caption, or annotation that names initials, marginalia, handwritten
   notes, highlighting, underlining, checkmarks, stamps, read-by/seen notations,
   signed/unsigned status, sent-for-action routing, information copies,
   correspondence profiles, approval boxes, attached routing slips, distribution
   lists, unknown hands, or top/bottom/left/right placement.
2. Match the unit against `physical_routing_context` before directly changing
   actor/hand, placement, physical status, action status, approval status, routing
   status, distribution, attachment-profile wording, or read-by/seen language.
3. Separate physical evidence from substantive policy content. A checkmark,
   initial, or `HAS SEEN` stamp can prove review or approval only to the extent
   stated by the source note or registry; it does not prove agreement with every
   statement in the document.
4. Separate source-image facts from editorial inference. Do not convert "unknown
   hand" to a named person, "initialed" to "approved," "sent for action" to
   "approved," or "read/seen" to "cleared" unless the uploaded source image or
   registry supplies exact evidence.
5. Preserve placement when it matters: upper right-hand corner, top of the
   memorandum, right-hand margin, recommendation line, bottom of an attached
   letter, attached profile, tab, or appendix image.
6. Coordinate with attachment rules when physical evidence concerns attached-but-
   not-printed tabs, attached correspondence profiles, printed attachments, or
   missing routing slips.
7. Coordinate with chronology rules when a physical notation is paired with diary
   or schedule evidence, meeting folders, no-minutes claims, or no-record claims.
8. Coordinate with classification/handling rules when a stamped notation, routing
   slip, distribution list, special-access marking, or handling control appears
   near classification language.

Direct-edit posture:

- Safe direct edits may restore exact supplied phrases such as `initialed`,
  `sent for action`, `A stamped notation reads`, `in the upper right-hand
  corner`, `attached NSC Correspondence Profile`, `checkmark`, `underlined`, or
  `highlighted` when the unit or registry supplies the evidence.
- Use `comment_only` with `evidence_request: physical_evidence_basis` when
  handwriting identity, actor/hand, placement, read-by/seen status, signed status,
  approval checkmark, sent-for-action/information routing, correspondence
  profile, distribution, attachment profile, or no-minutes/no-record physical
  context is missing, conflicting, or inferred.
- Use `evidence_request: source_image` when the blocker is visible handwriting,
  initials, stamps, marginalia, highlighting, underlining, checkmarks, or
  physical placement on the source image.
- Use `evidence_request: attachment_status` when the blocker is whether a profile,
  tab, routing slip, list, or attached memorandum was physically present.
- Add a `physical_routing_marginalia` discrepancy to the General Editor tally
  when published or local examples vary on how much physical, routing, read-by,
  approval, unknown-hand, or marginalia detail to print, and the underlying facts
  are sound.

Physical/routing audit requirements:

- Count physical evidence, handwriting, initials, marginalia, read-by/seen,
  stamp, signature, approval, routing, correspondence-profile, distribution,
  placement, and no-record-with-physical-context warnings separately from
  source-family, communications-record, attachment, chronology, and
  classification warnings.
- Preserve registry id, capture date, source URLs, record type, source family,
  physical evidence, actor or hand, action/status, placement, linked source or
  attachment, and verification status in the audit report.
- Record unresolved source-image, handwriting, actor/hand, placement, routing,
  approval, attachment-profile, distribution, diary/search, and unknown-hand
  warnings.

#### 6.1.3 Classification And Handling Registry Validation

Use a classification and handling registry when the wrapper can supply one.
Published Reagan and Bush examples show several distinct source-note patterns:
classification alone; classification plus handling; classification plus
precedence and handling; verified `No classification marking`; verified `No
classification marking; Sensitive`; and bracketed whole-document withholding
with classification and page count. The checker should not collapse these into
one phrase or confuse them with later release/declassification status.

Minimum classification and handling registry:

```json
{
  "classification_registry_id": "frus-1981-1992-classification-handling-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/ch1",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/ch3",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/ch6",
    "https://history.state.gov/historicaldocuments/frus1981-88v13/ch3"
  ],
  "records": [
    {
      "classification_item_id": "class-source-0001",
      "unit_id": "source-note-0001",
      "original_classification": "Top Secret",
      "handling_markings": [
        "Sensitive",
        "Eyes Only"
      ],
      "precedence": "",
      "paragraph_markings_present": false,
      "no_classification_marking_verified": false,
      "release_status_phrase": "",
      "source_phrase": "Top Secret; Sensitive; Eyes Only.",
      "verification_status": "verified"
    },
    {
      "classification_item_id": "class-source-0002",
      "unit_id": "source-note-0236",
      "original_classification": "",
      "handling_markings": [
        "Sensitive"
      ],
      "precedence": "",
      "paragraph_markings_present": false,
      "no_classification_marking_verified": true,
      "release_status_phrase": "",
      "source_phrase": "No classification marking; Sensitive.",
      "verification_status": "verified"
    },
    {
      "classification_item_id": "class-source-0003",
      "unit_id": "source-note-0034",
      "original_classification": "Secret",
      "handling_markings": [
        "Nodis"
      ],
      "precedence": "Flash",
      "paragraph_markings_present": false,
      "no_classification_marking_verified": false,
      "release_status_phrase": "",
      "source_phrase": "Secret; Flash, Nodis.",
      "verification_status": "needs_source_image"
    }
  ]
}
```

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_classification_marking`
- `needs_handling_marking`
- `needs_release_status_separation`
- `unknown`

Classification and handling validator sequence:

1. Identify every source note, attachment note, declassification note, appendix
   caption, editorial note, source-list entry, or document-metadata unit that
   asserts an original classification, handling marking, precedence, paragraph
   marking, absence of classification marking, whole-document withholding, or
   release/declassification status.
2. Match the unit against `classification_registry_context` before proposing a
   direct edit to original classification or handling language.
3. Preserve the difference between classification markings (`Top Secret`,
   `Secret`, `Confidential`, `Unclassified` when supplied), handling markings
   (`Sensitive`, `Nodis`, `Exdis`, `Eyes Only`, `Specat`, `Codeword`, or
   comparable controls), and telegram precedence (`Flash`, `Immediate`,
   `Priority`, `Niact Immediate`).
4. Preserve verified absence as `No classification marking`, not `No
   classification`, `Unclassified`, `Declassified`, `Released`, or `Sanitized`.
5. Keep release, declassification, RAC/NLR, sanitization, excision, and
   withholding language separate from original classification/handling. Later
   release status is not an original marking.
6. Coordinate with the communications registry for telegram precedence and
   addressee lines, and with the declassification registry for bracketed
   excisions, page counts, and whole-document withholding.
7. For directives, annexes, treaty packages, briefing books, and documents with
   paragraph markings, confirm whether markings belong to the parent document,
   each attachment, individual paragraphs, or an omitted component before
   rewriting.
8. Treat punctuation/order variations in handling strings as possible General
   Editor discrepancies when the underlying facts are supported but published
   or local examples differ.

Flag these issues:

- Classification or handling marking is missing, guessed, or copied from a
  release/declassification stamp rather than the original document.
- `No classification marking` is asserted without source-image, registry, or
  published-pattern support.
- `Declassified`, `released`, `sanitized`, `RAC`, `NLR`, or `mandatory review`
  appears where the source note needs the original marking.
- Handling markings, precedence, or distribution controls are rearranged,
  dropped, or standardized without support from the source phrase.
- Parent-document classification is applied to an attachment, annex, tab, or
  appendix item whose own marking is unknown.
- Paragraph markings are silently removed, normalized, or used as evidence for
  the whole document without source-image support.

Direct-edit posture:

- Safe direct edits may correct `No classification` to `No classification
  marking` only when the registry or unit verifies absence of an original
  classification marking.
- Safe direct edits may restore an exact supported source phrase such as a
  supplied classification/handling string when the old text maps to a single
  Word unit and the registry supplies the replacement.
- Use `comment_only` with `evidence_request: classification_marking` when the
  original marking, handling marking, precedence, paragraph marking, or verified
  absence is missing, conflicting, or inferred.
- Do not directly add, remove, reorder, or repunctuate handling markings unless
  the source phrase or classification registry supports the exact form.
- Use the General Editor discrepancy tally, not a forced edit, when the only
  issue is whether house style should prefer semicolon, comma, order, or short
  handling-string form for already verified markings.

Classification and handling audit requirements:

- Count missing original markings, unsupported `No classification marking`
  claims, handling/precedence mismatches, paragraph-marking issues, and
  release-status confusions separately from declassification/omission issues.
- Preserve the classification registry id, capture date, source URLs,
  source-phrase basis, and unresolved marking fields in the audit report.
- Add `classification_handling` discrepancies to the General Editor tally when
  the checker sees recurring unresolved style questions about handling-marking
  order, punctuation, abbreviation, paragraph-marking treatment, or
  parent-versus-attachment marking placement.

### 6.2 Follow-On Footnotes

Follow-on footnotes should be short, factual, and tied to a documentary purpose.

Preferred forms:

```text
See Document [number].
```

```text
See footnote [number], Document [number].
```

```text
For [related document], see Foreign Relations, [subseries], volume [number], [title], Document [number].
```

```text
Scheduled for publication in Foreign Relations, [subseries], volume [number], [title].
```

```text
The full memorandum of conversation is scheduled for publication in Foreign Relations, [subseries], vol. [number], [title].
```

```text
Not found.
```

```text
Not found. See footnote [number], Document [number].
```

```text
Not found attached.
```

```text
Attached but not printed is [description].
```

```text
Printed as Document [number].
```

```text
Tabs [letters/numbers] are printed as Document [number].
```

```text
Attached but not printed is the list of participants.
```

```text
No minutes were found.
```

```text
In telegram [number] to [post], [date], the Department [brief factual summary]. ([repository], [file identifier])
```

Flag these issues:

- Footnote argues with the document rather than identifying evidence.
- Cross-reference uses page numbers when document numbers are available.
- "Not found" is used where the search basis is unclear.
- `Not found.`, `Not found attached.`, and `No minutes were found.` are used
  interchangeably. They are distinct claims: unlocated document, unlocated
  attachment, and unlocated meeting record.
- "Scheduled for publication" lacks series, volume, or title context.
- Full-memcon-elsewhere language is used without identifying the FRUS series,
  volume, and title when that information is available.
- `Ibid.` is ambiguous.
- Related telegram or attachment citation lacks repository or identifier when
  available.
- `Printed as Document [number]` or tabs-printed language appears without a
  verified document number.
- `No minutes were found` appears without diary, schedule, or search context.
- Telegram-related annotation lacks telegram number, post/addressee, date, or
  repository identifier when those details are available in the cited note.
- `Attached but not printed`, `Attached but not printed is the list of
  participants`, `Printed as Document [number]`, and `Tabs [letters] are printed
  as Document [number]` are collapsed into a single generic cross-reference.

Cross-reference registry:

When the wrapper can supply document-number, footnote, appendix, tab, or volume
targets, keep them in a structured registry. Published Reagan and Bush examples
use several distinct reference forms: `See Document [n]`, `See footnote [n],
Document [n]`, `Printed as Document [n]`, `See Attachment, Document [n]`,
`Scheduled for publication...`, and public-source references. These are not
interchangeable.

```json
{
  "cross_reference_registry_id": "frus-cross-references-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d9",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d128",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d65"
  ],
  "references": [
    {
      "reference_id": "xref-doc-0009-to-0010",
      "unit_id": "footnote-0009-0003",
      "reference_type": "printed_as_document",
      "source_phrase": "Printed as Document 10.",
      "target_volume_id": "frus1989-92v31",
      "target_volume_title": "1989-1992, Volume XXXI, START I, 1989-1991",
      "target_document": "Document 10",
      "target_footnote": "",
      "target_status": "published",
      "verification_basis": "published FRUS same-volume link"
    },
    {
      "reference_id": "xref-doc-0001-to-scheduled-xliii",
      "unit_id": "footnote-0001-0005",
      "reference_type": "scheduled_publication",
      "source_phrase": "Scheduled for publication in Foreign Relations, 1981-1989, volume XLIII, National Security Policy, 1981-1984, Part 1.",
      "target_volume_id": "frus1981-88v43",
      "target_volume_title": "1981-1988, Volume XLIII, National Security Policy, 1981-1984",
      "target_document": "",
      "target_footnote": "",
      "target_status": "being_cleared",
      "verification_basis": "published FRUS note plus current status registry"
    }
  ]
}
```

Allowed `reference_type` values:

- `same_volume_document`
- `same_volume_footnote`
- `cross_volume_document`
- `scheduled_publication`
- `printed_as_document`
- `printed_as_tab_or_attachment`
- `appendix_reference`
- `public_source_reference`
- `not_found_reference`
- `full_record_elsewhere`
- `unknown`

Allowed `target_status` values:

- `published`
- `anticipated`
- `being_cleared`
- `being_researched`
- `planned`
- `unknown`

Cross-reference validator sequence:

1. Identify every `See Document`, `See footnote`, `Printed as Document`, `See
   Attachment`, appendix, scheduled-publication, public-source, not-found, and
   full-record-elsewhere reference.
2. Match each reference to the registry. If no registry target exists, use
   `comment_only` for normal or exhaustive review unless the form is plainly a
   harmless no-change same-unit comment.
3. Require `target_document` for same-volume, cross-volume, printed-as-document,
   and tab/attachment references when the wording asserts a document number.
4. Require `target_volume_title` and target status for scheduled-publication and
   cross-volume references.
5. Do not change `scheduled for publication` to `printed in` unless the target
   is `published` and the target document or chapter is supplied by the registry
   or current status context.
6. Do not turn `See footnote [n], Document [n]` into `See Document [n]` when the
   footnote is the precise target.
7. Do not turn public-source references into FRUS document references when the
   published or public source is the selected evidence.
8. Reconcile cross-references after chunk merging, because targets may appear in
   later chunks.

Direct-edit posture:

- Safe direct edits may correct narrow cross-reference punctuation or document
  number wording only when the registry supplies a stable target and the Word
  anchor is exact.
- Use `comment_only` when the target document, footnote, appendix, tab, volume
  title, chapter, publication status, or public-source citation is missing,
  stale, or inferred.
- Use `evidence_request: cross_reference` when the reference anchor or target
  type is uncertain.
- Use `evidence_request: document_number` when the missing proof is the target
  document number.
- Use `evidence_request: publication_status` when the issue is `printed in`
  versus `scheduled for publication`.

Cross-reference audit requirements:

- Count same-volume, cross-volume, scheduled-publication, footnote, appendix,
  printed-elsewhere, and public-source reference warnings separately.
- Record stale status-registry dependencies and unresolved target-document
  numbers separately from ordinary citation style issues.
- Add a General Editor discrepancy item when published or local examples vary on
  cross-reference wording, but do not tally missing target evidence as style.

### 6.2A Document Headings, Datelines, And Internal Titles

Document headings are editorial apparatus. Published Reagan and Bush FRUS
documents commonly combine a numbered FRUS heading, document form, sender and
recipient offices, a place/date line, and sometimes a subject, public-title,
meeting, briefing, or internal record label. The checker should verify this
metadata before changing a heading or moving facts between the heading, source
note, and annotation.

Use a document-metadata registry when the wrapper can supply one:

```json
{
  "document_metadata_registry_id": "frus-1981-1992-document-metadata-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d3",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d37",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d90",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d145"
  ],
  "records": [
    {
      "metadata_id": "docmeta-0001",
      "unit_id": "document-heading-0003",
      "document_number": "Document 3",
      "document_type": "memorandum",
      "heading_text": "Memorandum From [sender office/name] to [recipient]",
      "sender": "[sender name if supplied]",
      "sender_office": "[sender office or title if supplied]",
      "recipient": "[recipient name or office if supplied]",
      "place_date_line": "Washington, [date]",
      "internal_document_number": "",
      "subject_or_title_line": "[SUBJECT line if supplied]",
      "public_title_line": "",
      "source_note_linkage": "footnote 1",
      "verification_status": "verified"
    },
    {
      "metadata_id": "docmeta-0002",
      "unit_id": "document-heading-0145",
      "document_number": "Document 145",
      "document_type": "public_address",
      "heading_text": "[public address or remarks heading]",
      "sender": "President Reagan",
      "sender_office": "President",
      "recipient": "",
      "place_date_line": "[place/date line or broadcast setting if supplied]",
      "internal_document_number": "",
      "subject_or_title_line": "[speech title if supplied]",
      "public_title_line": "[Public Papers title or broadcast title if supplied]",
      "source_note_linkage": "footnote 1",
      "verification_status": "needs_source_image"
    }
  ]
}
```

Allowed `document_type` values:

- `memorandum`
- `memorandum_of_conversation`
- `telegram`
- `letter`
- `message`
- `minutes`
- `briefing`
- `decision_directive`
- `report`
- `public_address`
- `statement`
- `interview`
- `editorial_note`
- `other`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_document_image`
- `needs_date_or_place`
- `needs_heading_authority`
- `unknown`

Heading and dateline validator sequence:

1. Identify every document heading, supplied title, dateline, subject line,
   caption, internal document number, meeting title, briefing label, public
   title, source-list document title, and editorial-note heading.
2. Match the unit against `document_metadata_registry_context` before proposing
   a direct edit to heading or dateline text.
3. Preserve the distinction between FRUS heading text and original-document
   text. A `SUBJECT`, `DATE`, `LOCATION`, `TIME`, routing line, record number,
   or title printed in the source document should not be silently converted into
   editorial prose.
4. Preserve the distinction between a folder title and a document title. A
   folder label can support a source path, but it should not become the FRUS
   document heading unless the registry or source image proves that it is the
   document's title.
5. Reconcile date, place, time, meeting title, and participants across the
   heading, source note, chronology registry, diary/schedule evidence, and
   source image before applying direct edits.
6. For public speeches, remarks, statements, broadcasts, testimony, and
   interviews, preserve the selected public-source title or event description
   when supplied. Do not replace it with an archival control-copy title unless
   that copy is the selected document.
7. For memcons, telcons, minutes, and meeting records, check whether the heading
   form agrees with the record type and whether date/place/time evidence belongs
   in the heading, chronology note, source note, or annotation.
8. For telegrams and cables, coordinate with the communications registry before
   changing a telegram number, origin/addressee line, date-time group, or
   heading label.

Flag these issues:

- Heading omits the document form, sender, recipient, office/title, or date when
  the registry supplies those facts and the omission would misidentify the
  document.
- Place/date line conflicts with the source note, chronology registry, or
  source image.
- Subject line, internal record number, meeting label, or public-title line is
  moved into the wrong apparatus layer.
- A working title such as `candidate`, `possible`, `needs scan`, `TK`, or
  `draft title` remains in final-style apparatus.
- A source folder title is treated as the document title without source-image or
  registry support.
- A public speech or remarks heading is flattened into a memorandum-style
  heading.
- A memcon, telcon, minutes, briefing, or directive heading is normalized into a
  generic `Memorandum` heading when the source identifies a more specific record
  form.

Direct-edit posture:

- Safe direct edits may fix narrow punctuation, restore a supplied document
  number, or apply a verified heading form when the exact old text maps to a
  single Word unit and the registry supplies the replacement.
- Use `comment_only` with `evidence_request: document_metadata` when sender,
  recipient, date, place, subject, public title, internal number, or document
  form is missing, conflicting, or inferred.
- Use `comment_only` when the correct heading depends on source images,
  chronology evidence, or a General Editor decision about house form.
- Do not change transcribed original-document headings unless the uploaded unit
  is explicitly marked as editorial apparatus or the user requests transcription
  review.

Document-metadata audit requirements:

- Count heading, dateline, subject/title-line, public-title, internal-number,
  and source-folder-as-title issues separately from ordinary formatting issues.
- Preserve the document-metadata registry id, capture date, source URLs, and
  unresolved metadata fields in the audit report.
- Add `document_metadata` discrepancies to the General Editor tally when
  published or local examples vary on heading form, subject-line placement,
  public-title treatment, office-title detail, or whether to include an internal
  document number in the heading or source note.

### 6.3 Annotation

Annotation should help readers understand the record without substituting for
it.

Good annotation:

- Identifies related documents in the same volume.
- Points to related FRUS volumes.
- Summarizes important documents not printed in the volume.
- Explains policy events needed to understand the document.
- Cites public statements, memoirs, diaries, or published sources when they
  supplement the official record.
- Identifies marginalia, initials, distribution, routing, tabs, or missing
  attachments.
- Clarifies participants, offices, acronyms, or chronology.

Flag these issues:

- Annotation summarizes what the reader can see in the document text.
- Annotation substitutes memoir claims for available official records.
- Annotation contains unsupported interpretation or argumentative phrasing.
- Annotation uses discovery notes as final evidence.
- Annotation over-explains routine bureaucratic process.
- Public statement is treated as a substitute for internal decision record.

### 6.4 Editorial Notes

Use an `Editorial Note` when a bridge is needed and printing a full document
would duplicate another volume, distort the selection, or consume space better
used for decision documents.

Good editorial notes:

- Summarize sequences of public statements.
- Account for withheld documents in chronology.
- Describe meetings when only diary or schedule evidence is available.
- Explain related actions printed in another FRUS volume.
- Bridge long gaps between selected documents.
- Summarize routine congressional, press, or public developments that affected
  policy.
- Summarize a sequence of speeches, campaign statements, confirmation testimony,
  memoir passages, and press accounts when the volume is documenting policy
  assumptions rather than a single decision chain.

Flag these issues:

- Editorial note is unsourced.
- Editorial note is treated as missing a source note merely because it has no
  first-footnote `Source:` entry. In Volume XXXI, editorial notes can stand
  without source notes when their own text supplies documentary citations.
- Editorial note reads as argument rather than documentary chronology.
- Note hides a missing or withheld document instead of accounting for it.
- Note includes speculative claims unsupported by the uploaded context.

### 6.5 Attachments, Tabs, And Enclosures

Use only language supported by the control copy.

Preferred forms:

```text
Attached but not printed is [description].
```

```text
Attached but not printed are [description 1] and [description 2].
```

```text
Not found.
```

```text
Not found attached.
```

Flag these issues:

- Attachment status is inferred from context rather than source evidence.
- Printed attachment lacks a title or classification footnote.
- Annex classification is not distinguished from parent-document classification
  when the annex is separately marked.
- Multiple attachments are collapsed ambiguously.
- `Attached but not printed`, `printed as Document [number]`, `Tabs ... are
  printed as Document [number]`, `Not found`, and `Not found attached` are
  collapsed into one generic attachment note.
- Participant tabs are inferred or summarized when the FRUS pattern only
  supports `Attached but not printed is the list of participants.`
- `Tab [letter/number]` is used without support.
- Attached draft telegram later sent as final telegram is not identified when
  the source provides sent number/date.
- Appendix image or facsimile is not cross-referenced from the transcribed
  handwritten document, or the appendix entry does not point back to the
  transcribed document.

Attachment-status registry:

When the wrapper can extract or supply attachment data, keep a small registry
separate from the prose note. The registry should record the physical or
editorial relationship before the LLM decides whether to redline the wording.

```json
{
  "attachment_registry_id": "frus-attachment-status-2026-06-03",
  "items": [
    {
      "attachment_id": "attachment-doc-0025-tab-c",
      "parent_unit_id": "source-note-0025",
      "label_in_source": "Tab C",
      "described_item": "List of Participants",
      "physical_status": "not_attached",
      "editorial_status": "not_printed",
      "printed_target": "",
      "classification_marking": "",
      "evidence_basis": "source note or control-copy inspection",
      "confidence": "verified"
    },
    {
      "attachment_id": "attachment-doc-0025-tab-a",
      "parent_unit_id": "source-note-0025",
      "label_in_source": "Tab A",
      "described_item": "Talking Points",
      "physical_status": "attached",
      "editorial_status": "printed_elsewhere",
      "printed_target": "Document 26",
      "classification_marking": "Secret",
      "evidence_basis": "published pattern or supplied authority context",
      "confidence": "verified"
    }
  ]
}
```

Allowed `physical_status` values:

- `attached`: the item is physically present with the control copy.
- `not_attached`: the source or control-copy inspection shows the item is not
  physically attached.
- `not_found`: the item was searched for but not located; do not use this when
  the only fact is that it was not printed.
- `unknown`: the uploaded context does not prove attachment status.

Allowed `editorial_status` values:

- `printed_here`: the item is printed with the current document.
- `printed_elsewhere`: the item is printed as another document, tab, attachment,
  appendix, or volume target.
- `not_printed`: the item exists or is described but is not printed.
- `excerpted`: only part of the item is printed or summarized.
- `not_applicable`: no editorial printing relationship is asserted.

Attachment validator sequence:

1. Identify every attachment, tab, enclosure, annex, appendix image, list,
   paper, treaty text, draft telegram, and associated document named in the
   unit.
2. Separate physical status from editorial status. `Attached but not printed`
   means a physical item exists but is omitted from print; `Not found attached`
   means the expected item was not present; `Printed as Document [n]` means an
   editorial location is supplied.
3. Require a `printed_target` for `printed_elsewhere`, such as `Document 26`,
   `Tab A, Document 26`, `Attachment, Document 1`, an appendix item, or a
   scheduled-publication target supplied in context.
4. Require `attachment_status` evidence before changing any note that asserts
   attached, not attached, not found, tabbed, enclosed, printed, excerpted, or
   appendix-image status.
5. Preserve source wording for uncertain labels such as `Tab I`, `D1`, `D2`,
   `Attachment`, `Annex`, or `Enclosure` unless the wrapper supplies a stable
   normalized label.
6. If the attachment has its own classification marking, handling marking, date,
   or title, do not merge those facts into the parent document's source note
   unless the published or supplied context supports that treatment.
7. For participant lists, agendas, talking points, treaty texts, analyses,
   notification annexes, and proposed Presidential messages, preserve the
   description supplied by the source or published FRUS pattern. Do not replace
   it with a generic `attachment`.
8. For handwritten-note facsimiles and appendix images, validate both directions
   of the cross-reference: document-to-appendix and appendix-to-document.

Direct-edit posture:

- Safe direct edits may correct only the literal attachment phrase when the
  registry proves the status and the Word anchor is exact, such as changing
  `Attached and not printed` to `Attached but not printed`.
- Use `comment_only` when physical status, printed target, title, date,
  classification, or cross-reference is missing or inferred.
- Use `evidence_request: attachment_status` when the missing proof is the
  physical or editorial relationship.
- Use `evidence_request: document_number` or `cross_reference` when the problem
  is the target document, tab, appendix, or volume reference.
- Use `style_discrepancy_tally` when published or local examples vary on how
  much description to include, such as bare `Attached but not printed.` versus
  `Attached but not printed is [title].`

Attachment audit requirements:

- Count attachment-status findings by physical status and editorial status.
- Record unresolved `unknown`, missing `printed_target`, and bidirectional
  appendix/facsimile failures separately.
- Do not release a final-style `.docx` when attachment claims remain `unknown`
  in publishable apparatus unless the volume editor waives the issue and the
  waiver is included in the audit report.

### 6.6 Declassification And Omissions

Published text must indicate deletions and account for full withholdings.

Preferred forms:

```text
[1 paragraph (7 lines) not declassified]
```

```text
[Omitted here is discussion unrelated to [volume subject].]
```

```text
[Document not declassified. [x] pages.]
```

Flag these issues:

- Ellipses are used for editorial excision.
- Omitted text is not bracketed.
- Omission quantity is absent where it should be stated.
- Unrelated-topic omission and still-classified omission are blurred.
- Whole document withholding lacks heading, source note, or page count.
- Declassification statistics in front matter conflict with document-level
  brackets, if both are provided.
- Brackets from the original document are not identified, or original brackets
  are confused with editorial insertions or declassification excisions.
- Whole-document withholding is counted the same way as paragraph-or-more
  excisions or minor excisions. Keep those categories distinct in front matter
  and audit comments.

Declassification registry:

When the wrapper can supply declassification or omission information, keep it in
a structured registry. Published FRUS practice distinguishes omitted unrelated
text, material not declassified, original brackets, editor-supplied bracketed
insertions, and whole-document withholdings. The checker must not infer any of
these categories from bracket shape alone.

```json
{
  "declassification_registry_id": "frus-declassification-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d21",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d172"
  ],
  "items": [
    {
      "declassification_item_id": "declass-doc-0021-omit-001",
      "unit_id": "document-body-0021",
      "claim_type": "not_declassified",
      "quantity": "1 paragraph (10 lines)",
      "location_hint": "after safeguards paragraph",
      "text_form": "[1 paragraph (10 lines) not declassified]",
      "review_status": "final",
      "evidence_basis": "published FRUS text or supplied declassification review",
      "requires_italic": true
    },
    {
      "declassification_item_id": "declass-doc-0172-whole-001",
      "unit_id": "withheld-document-0172-tab-2",
      "claim_type": "whole_document_not_declassified",
      "quantity": "6 pages",
      "location_hint": "Tab 2 source note",
      "text_form": "[Source: ... 6 pages not declassified.]",
      "review_status": "final",
      "evidence_basis": "published FRUS text or supplied declassification review",
      "requires_italic": true
    }
  ]
}
```

Allowed `claim_type` values:

- `not_declassified`: a line, paragraph, page, or other span remains classified
  after review.
- `unrelated_omission`: text is omitted because it is outside the volume's
  subject, not because it remains classified.
- `whole_document_not_declassified`: the entire document is withheld after
  declassification review and must be accounted for chronologically.
- `original_bracket`: brackets are in the source document and should be
  identified in a footnote or note.
- `editorial_insertion`: bracketed words are supplied by the editor for clarity.
- `release_status_note`: the note describes release, declassification,
  sanitization, or review status rather than original classification marking.

Allowed `review_status` values:

- `final`: the declassification or omission status is supplied by published
  FRUS text, final review, or authoritative wrapper context.
- `provisional`: a clearance-stage or working-sheet assertion that still needs
  review confirmation.
- `unknown`: the uploaded context does not prove the claim.

Declassification validator sequence:

1. Identify every bracketed omission, whole-document withholding, original
   bracket note, editorial insertion, release-status phrase, and front-matter
   declassification statistic.
2. Classify each item by `claim_type`. Do not treat all brackets as
   declassification excisions.
3. Require a quantity when FRUS form calls for one: lines, paragraphs, pages, or
   page count for whole-document withholdings.
4. Keep unrelated-topic omissions distinct from still-classified omissions.
   They should not use the same comment, evidence request, or audit count.
5. Check whether a whole-document withholding has a heading, source note,
   chronological placement, and page count.
6. Check whether original brackets are identified. Do not rewrite original
   brackets as editor-supplied brackets or declassification brackets.
7. Check whether front-matter counts agree with document-level omission counts
   when both are supplied.
8. If the output medium can preserve italic/roman distinction, verify the
   required styling for still-classified versus unrelated omissions. If it
   cannot, require a wrapper-safety or formatting comment rather than silently
   flattening the distinction.
9. Treat `declassified`, `released`, `sanitized`, and `mandatory review` as
   release/review status, not original classification marking.

Direct-edit posture:

- Safe direct edits may fix literal bracket phrasing when the registry supplies
  final status and the Word anchor is exact, such as normalizing
  `[1 para not declassified]` to `[1 paragraph not declassified]` only when the
  quantity and status are verified.
- Use `comment_only` when the quantity, review outcome, unrelated-topic basis,
  original-bracket status, styling, or whole-document page count is missing.
- Use `evidence_request: declassification_status` for review outcome,
  withholding, excision, agency-equity, or bracket claims.
- Use `evidence_request: classification_marking` when the issue is the original
  classification or handling marking on the source document.
- Use `evidence_request: wrapper_safety` when the wrapper cannot preserve
  italic/roman distinction, bracket boundaries, or tracked changes around
  omitted text.

Declassification audit requirements:

- Count minor excisions, paragraph-or-more excisions, whole-document
  withholdings, unrelated omissions, original-bracket notes, and release-status
  warnings separately when the context supplies enough detail.
- Record unresolved `unknown` or `provisional` review statuses as blockers for
  exhaustive/final style when they affect publishable apparatus.
- Preserve source URLs or local declassification-review provenance in the audit
  report.
- Add a General Editor discrepancy item when published or local examples vary on
  bracket wording, quantity form, or how to identify original brackets, but do
  not tally unresolved review outcomes as style questions.

### 6.7 Persons, Titles, Abbreviations, And Index Terms

Check against supplied authority context when available.

Rules:

- Use the person's office at the date of the document.
- Preserve names as written inside transcribed document text.
- Resolve initials and variant spellings in the Persons list or comment, not by
  changing source text.
- Use target-volume authority forms for `Bush, George H.W.` versus `Bush,
  George Herbert Walker`.
- Preserve abbreviations in document text.
- Define recurring, obscure, or policy-critical abbreviations in the
  Abbreviations and Terms list.
- Index references should use document numbers rather than page numbers.

Flag these issues:

- Mixed authority forms for the same person.
- Office title does not match document date.
- Abbreviation is silently expanded in transcribed text.
- Abbreviation list omits a recurring or obscure term.
- Index uses page numbers when document numbers are available.

Authority registry contract:

The wrapper should supply authority material as registries rather than loose
notes. Published Reagan and Bush volumes show that source lists, Persons lists,
and Abbreviations and Terms are separate apparatus with their own forms. A good
checker must compare annotation-sheet units against those apparatus forms
without treating them as facts to invent.

Minimum authority registry:

```json
{
  "authority_registry_id": "frus-1981-1992-authority-2026-06-03",
  "captured_at": "2026-06-03",
  "persons": [
    {
      "person_id": "person-bush-george-hw",
      "display_form": "Bush, George H.W.",
      "variants": [
        "George Herbert Walker Bush",
        "George H.W. Bush",
        "President Bush"
      ],
      "office_spans": [
        {
          "office": "Vice President of the United States",
          "start": "1981-01-20",
          "end": "1989-01-20"
        },
        {
          "office": "President of the United States",
          "start": "1989-01-20",
          "end": "1993-01-20"
        }
      ],
      "volume_scope": [
        "Reagan",
        "George H.W. Bush"
      ],
      "source": "Persons list or local authority file"
    }
  ],
  "abbreviations": [
    {
      "term": "NSC",
      "definition": "National Security Council",
      "approved_forms": [
        "NSC"
      ],
      "expand_in_apparatus": true,
      "expand_in_transcribed_text": false
    }
  ],
  "repositories": [
    {
      "repository_id": "repo-bush-library-hfiles",
      "display_path": "George H.W. Bush Library, Bush Presidential Records, National Security Council, Institutional Files (H-Files)",
      "variants": [
        "Bush Library, H-Files",
        "George Bush Library, NSC Institutional Files"
      ],
      "required_subseries_when_present": [
        "NSC Meeting Files",
        "NSC/DC Meetings Files",
        "NSD Files",
        "NSR Files"
      ]
    }
  ],
  "document_numbers": [
    {
      "document_number": "Document 42",
      "chapter": "Chapter 3",
      "title_or_subject": "Known title or supplied heading",
      "status": "stable"
    }
  ]
}
```

Authority validator sequence:

1. Normalize only for comparison: trim duplicated spaces, compare case
   insensitively where appropriate, and preserve punctuation in proposed Word
   edits.
2. Match each name, acronym, repository label, chapter label, and document
   number to a registry entry or mark it `unmatched`.
3. Check the document date against any `office_spans`. If the date is missing,
   comment for verification rather than changing the title.
4. Check whether the unit is editorial apparatus or transcribed document text.
   Do not expand abbreviations or normalize names inside transcribed document
   text.
5. For source-list entries, check repository hierarchy from broad institution
   to specific file family. Do not collapse nested families such as Reagan
   Library W Files, PROFS, System IV, Bush H-Files, Scowcroft Collection, State
   lot files, CFPF reels, or Library of Congress manuscript papers into one
   generic repository label.
6. For Persons entries, preserve nicknames, initials, suffixes, particles, and
   transliterations when the authority list uses them. If two published forms
   differ, record a General Editor discrepancy instead of forcing one form.
7. For Abbreviations and Terms, flag a missing recurring term only when it is
   policy-critical, obscure, or repeated enough to burden readers. Do not add
   common acronyms mechanically.
8. For index entries, prefer document-number references and stable subject/name
   forms. Do not use page references unless the volume or wrapper context
   requires page-based indexing.
9. Reconcile authority findings across the whole packet before final output so
   the same person, acronym, repository, or index term is not corrected in one
   place and merely commented on in another without explanation.

Direct-edit posture:

- Direct edits are appropriate for simple apparatus-only authority fixes when
  the registry supplies the exact replacement and the Word anchor is safe:
  duplicated spaces, misspelled approved display form, wrong acronym expansion
  in an Abbreviations entry, or a source-list heading that exactly matches a
  known variant.
- Use `comment_only` when the fix depends on a document date, office span,
  uncertain identity, transliteration, source-list family, chapter routing,
  target document number, or General Editor decision.
- Use `style_discrepancy_tally` when two forms are both plausible: nickname
  inclusion, middle initials, office title level, `US` versus `U.S.`, `H-Files`
  punctuation, repository nesting, or source-list heading order.
- Return `blocked` only when authority ambiguity prevents safe review of the
  whole packet, such as an extracted sheet with no dates, no volume title, and
  repeated ambiguous names that affect source notes or cross-references.

Authority-specific red flags:

- One person appears under two display forms in the same packet without a
  deliberate variant rule.
- A title is correct for the person but wrong for the document date.
- A Bush transition record before January 20, 1989 is routed to Bush
  Presidential Records instead of Vice Presidential Records without evidence.
- A Reagan source-list entry treats W Files, PROFS, System IV, or NSC
  Washington institutional files as ordinary White House Staff and Office Files.
- A source list drops subseries that published-style source lists preserve, such
  as Bush NSC Meeting Files or NSC/DC Meetings Files.
- An acronym is expanded inside transcribed document text, or an abbreviation
  entry silently changes the form used in the source note.
- An index entry uses a person title or country term that conflicts with the
  target volume authority form.

### 6.8 Diary, Schedule, And Call-Log Evidence

Diary, schedule, and call-log material can corroborate chronology but rarely
supplies substantive content.

Acceptable uses:

- Time, place, duration, travel, call placement, and sequence.
- Attendance, invitees, interpreters, or staff support.
- Corroboration that a meeting or call occurred.
- Editorial note that no substantive memcon, telcon, or minutes have been found.

Flag these issues:

- Diary entry is treated as a telcon or memcon.
- Scheduled call is described as connected without evidence.
- Briefing paper is described as read without evidence.
- Diary evidence is used to infer substantive conversation content.
- "No minutes were found" is used without enough context to show what meeting or
  source search is being described.

Chronology registry:

When the wrapper can supply diary, schedule, call-log, or meeting-record
evidence, keep it in a structured registry. Published Reagan and Bush examples
use Presidential Daily Diary entries to establish that a meeting occurred, where
it occurred, and how long it lasted, while separately noting whether minutes,
memoranda of conversation, or other records were found. Do not collapse those
claims into one assertion.

```json
{
  "chronology_registry_id": "frus-chronology-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d23",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d219",
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/d1"
  ],
  "events": [
    {
      "event_id": "event-bush-nsc-1989-05-25",
      "unit_id": "source-note-0023",
      "event_type": "meeting",
      "date": "1989-05-25",
      "time_start": "09:39",
      "time_end": "11:04",
      "location": "Cabinet Room",
      "evidence_source": "President's Daily Diary",
      "participants_basis": "not supplied",
      "record_status": "no_minutes_found",
      "record_target": "NSC meeting minutes",
      "substantive_content_supported": false,
      "confidence": "verified"
    },
    {
      "event_id": "event-reagan-oval-1984-11-14",
      "unit_id": "source-note-0001",
      "event_type": "meeting",
      "date": "1984-11-14",
      "time_start": "13:30",
      "time_end": "14:45",
      "location": "Oval Office",
      "evidence_source": "Reagan Library, President's Daily Diary",
      "participants_basis": "diary and note context",
      "record_status": "no_minutes_found",
      "record_target": "meeting minutes",
      "substantive_content_supported": false,
      "confidence": "verified"
    }
  ]
}
```

Allowed `event_type` values:

- `meeting`
- `call`
- `briefing`
- `travel`
- `diary_entry`
- `schedule_entry`
- `memoir_or_personal_diary_context`
- `unknown`

Allowed `record_status` values:

- `record_printed`: a memcon, telcon, minutes, summary, or substantive record is
  printed in the same document or another cited document.
- `record_scheduled_elsewhere`: the full record is scheduled for another
  volume, chapter, or document.
- `no_minutes_found`: the search found no minutes for the meeting.
- `no_memcon_found`: the search found no memorandum of conversation.
- `no_telcon_found`: the search found no telephone conversation transcript or
  memorandum.
- `not_found`: a specific related record was not located, but the type is not
  narrowed further.
- `unknown`: the uploaded context does not prove whether a substantive record
  exists.

Chronology validator sequence:

1. Identify every meeting, call, briefing, travel event, schedule entry, diary
   reference, memoir/personal-diary supplement, and no-record claim.
2. Separate event occurrence from substantive record. A Daily Diary or schedule
   can prove time, place, sequence, and sometimes participants; it does not by
   itself prove what was said.
3. For `No minutes were found`, `No memorandum of conversation has been found`,
   and `No telcon was found`, require the event, record type, and search target
   to be clear enough for the compiler to understand the claim.
4. Check whether a scheduled call was placed, connected, completed, missed, or
   merely planned. Do not turn a scheduled call into a conversation without
   connection evidence.
5. Check whether participant lists come from the source, the diary/schedule, an
   attachment, or later editorial inference. Do not infer attendance from
   agenda distribution or briefing-paper routing.
6. When a memoir, personal diary, public account, or press report supplements a
   diary/schedule entry, keep it as corroborating or recollective context unless
   it is the selected documentary source.
7. For full-record-elsewhere language, require the target FRUS volume, document
   number, chapter, or scheduled-publication evidence before direct edits.
8. Reconcile time ranges, locations, and document dates across source note,
   heading, editorial note, and chronology registry before applying a direct
   edit.

Direct-edit posture:

- Safe direct edits may correct narrow chronology wording when the registry
  supplies final event facts and the Word anchor is exact, such as changing
  `according to the Daily Diary` to `According to the President's Daily Diary`
  when that is the supplied source form.
- Use `comment_only` when time, place, duration, attendance, call connection,
  record-found status, or target document number is missing or inferred.
- Use `evidence_request: chronology` for time, place, attendance, sequence,
  briefing, travel, diary, schedule, call-log, or meeting-record uncertainty.
- Use `evidence_request: cross_reference` or `document_number` when the problem
  is the target of a full-record-elsewhere claim.
- Use `style_discrepancy_tally` when published or local examples vary on
  `No minutes were found` versus `No memorandum of conversation has been found`
  for similar records, but do not tally an unresolved search result as style.

Chronology audit requirements:

- Count chronology warnings by event type and record status.
- Record unresolved `unknown`, missing time/place, conflicting event date,
  unsupported attendance, scheduled-but-unconnected calls, and no-record claims
  without search basis.
- Do not release a final-style `.docx` when a source note or editorial note
  asserts substantive meeting content based only on diary, schedule, or call-log
  evidence unless the volume editor waives the issue and the waiver appears in
  the audit report.

### 6.8A Summit, Travel, And Public-Event Chronology Validation

Published Reagan and Bush volumes often use editorial notes to summarize
summits, foreign travel, public ceremonies, interviews, speeches, press
conferences, toasts, arrival/departure events, and public remarks. These notes
can be excellent FRUS apparatus even when they have no first-footnote source
note, but they are vulnerable to invented sequence, unsupported attendance,
blurred public-source basis, and premature cross-volume claims.

Use an event-chronology registry when the wrapper can supply one:

```json
{
  "event_chronology_registry_id": "frus-1981-1992-public-event-chronology-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d245",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d237",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d206",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d33"
  ],
  "events": [
    {
      "event_id": "event-bush-moscow-summit-1991-07-29-31",
      "unit_id": "editorial-note-0245",
      "event_family": "summit_travel",
      "event_type": "foreign_travel_and_summit",
      "date_span": "1991-07-29/1991-08-01",
      "place": "Moscow and Kiev",
      "public_source_basis": "Public Papers: Bush, 1991, pages 986-987",
      "schedule_or_diary_basis": "travel itinerary and timed editorial chronology",
      "related_full_record_target": "Foreign Relations, 1989-1992, vol. III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts",
      "press_or_ceremony_component": "START signing remarks and live news conference",
      "verification_status": "verified"
    },
    {
      "event_id": "event-bush-london-summit-1991-07-17",
      "unit_id": "footnote-0237-0002",
      "event_family": "summit_press",
      "event_type": "news_conference",
      "date_span": "1991-07-17",
      "place": "London Economic Summit",
      "public_source_basis": "Public Papers: Bush, 1991, page 907",
      "schedule_or_diary_basis": "not supplied",
      "related_full_record_target": "",
      "press_or_ceremony_component": "evening news conference after joint news conference with Gorbachev",
      "verification_status": "verified"
    },
    {
      "event_id": "event-reagan-un-address-1984-09-24",
      "unit_id": "editorial-note-0206",
      "event_family": "public_address",
      "event_type": "united_nations_address",
      "date_span": "1984-09-24",
      "place": "United Nations General Assembly Hall",
      "public_source_basis": "Public Papers: Reagan, 1984, Book II, pages 1355-1361",
      "schedule_or_diary_basis": "Reagan personal diary excerpt",
      "related_full_record_target": "",
      "press_or_ceremony_component": "public address",
      "verification_status": "verified"
    },
    {
      "event_id": "event-reagan-cronkite-interview-1981-03-03",
      "unit_id": "editorial-note-0033",
      "event_family": "broadcast_interview",
      "event_type": "television_interview",
      "date_span": "1981-03-03",
      "place": "Oval Office",
      "public_source_basis": "Public Papers: Reagan, 1981, pages 191-202",
      "schedule_or_diary_basis": "Reagan Library, President's Daily Diary",
      "related_full_record_target": "",
      "press_or_ceremony_component": "CBS Evening News interview",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `event_type` values:

- `foreign_travel_and_summit`
- `delegation_meeting`
- `working_lunch_or_dinner`
- `arrival_or_departure`
- `signing_ceremony`
- `news_conference`
- `public_address`
- `united_nations_address`
- `television_interview`
- `toast_or_remarks`
- `press_backgrounder`
- `congressional_testimony`
- `campaign_statement`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_time_or_place`
- `needs_public_source`
- `needs_diary_or_schedule`
- `needs_press_basis`
- `needs_full_record_target`
- `needs_participant_basis`
- `unknown`

Summit/public-event validator sequence:

1. Identify editorial notes, footnotes, headings, source notes, and annotations
   that summarize summit travel, foreign visits, public ceremonies, public
   addresses, interviews, press conferences, toasts, congressional testimony, or
   campaign/public statements.
2. Match the unit against `event_chronology_context` before directly changing
   event date, time, place, event label, sequence, participant, public-source
   basis, or cross-volume full-record language.
3. Preserve the distinction between event occurrence, public remarks, press
   coverage, travel itinerary, diary/schedule corroboration, and substantive
   memcon/telcon/minutes. A signing ceremony or news conference does not prove
   the content of a private meeting.
4. Do not add a `Source:` footnote merely because an editorial note summarizes
   a public-event sequence, if the note text supplies its public sources,
   chronology, and cross-references.
5. Do not convert Public Papers, Presidential Daily Diary, press, broadcast,
   congressional, or memoir evidence into an archival control-copy citation
   unless the archival copy is the selected source.
6. Check travel and summit sequences for date, time zone, local time, place,
   event order, and whether the item is a meeting, ceremony, speech, interview,
   press availability, toast, or travel movement.
7. For full-record-elsewhere language, require a stable target volume, chapter,
   document number, or scheduled-publication basis before direct edits.
8. Coordinate with the treaty registry for signing ceremonies, ratification
   remarks, and treaty-package public events; with the chronology registry for
   diary/schedule claims; and with the cross-reference registry for
   printed-elsewhere or scheduled-volume targets.

Direct-edit posture:

- Safe direct edits may correct event labels, public-source punctuation, or
  time/place phrasing only when the uploaded unit or registry supplies the exact
  evidence and the Word anchor is safe.
- Use `comment_only` with `evidence_request: event_chronology` when event
  sequence, time zone, public-source basis, press basis, diary/schedule basis,
  participant basis, or full-record target is missing, conflicting, or inferred.
- Use `evidence_request: chronology` when the blocker is a diary, schedule,
  call-log, or no-record claim outside the public-event sequence.
- Use `evidence_request: cross_reference`, `document_number`, or
  `publication_status` when the blocker is the target of a full-record-elsewhere
  or scheduled-publication claim.
- Add a `summit_public_event` discrepancy to the General Editor tally when
  published or local examples vary on how much public-event sequence, Public
  Papers sourcing, press basis, or diary/schedule basis to print, and the
  underlying facts are sound.

Summit/public-event audit requirements:

- Count public-event chronology warnings separately from ordinary chronology
  warnings.
- Preserve event registry id, capture date, source URLs, event type, public
  source basis, diary/schedule basis, related full-record target, and
  verification status in the audit report.
- Record unresolved event-sequence, time-zone, public-source, press-basis,
  participant-basis, and full-record-target warnings so compilers can decide
  whether the note is ready for a final style pass.

### 6.8A.1 Public Diplomacy, Public Sources, Speeches, Interviews, Press, And Testimony

Public-source annotation is not second-class FRUS evidence. Recent Reagan
Foundations practice shows that speeches, press releases, press conferences,
briefings, interviews, Congressional testimony, public addresses, newspaper
excerpts, Public Papers entries, Department of State Bulletin texts, archival
speech files, briefing files, and diary corroboration can together document the
policy assumptions of a volume. The checker must not automatically demote a
public source to background merely because an archival control copy also exists.

Use a public-source registry when the wrapper can supply one:

```json
{
  "public_source_registry_id": "frus-1981-1992-public-diplomacy-source-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/pressrelease",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d33",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d206",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "public_item_id": "public-volume-scope-foundations-v01",
      "unit_id": "pressrelease-frus1981-88v01",
      "record_type": "volume_scope_statement",
      "public_source_type": "mixed_public_and_archival",
      "public_source_basis": "press release states the volume draws on speeches, press releases, press conferences and briefings, interviews, Congressional testimony, and internal records",
      "selected_or_supplemental": "volume_scope",
      "date_or_span": "2022-09-09",
      "public_event_or_publication": "FRUS Volume I press release",
      "archival_or_draft_context": "internal memoranda, correspondence, meeting minutes, and other records also used",
      "verification_status": "verified"
    },
    {
      "public_item_id": "public-cronkite-interview-0033",
      "unit_id": "document-0033",
      "record_type": "interview_editorial_note",
      "public_source_type": "television_interview",
      "public_source_basis": "Public Papers: Reagan, 1981, pages 191-202; excerpts also printed in New York Times, March 4, 1981, page A22",
      "selected_or_supplemental": "selected_public_document_with_archival_context",
      "date_or_span": "1981-03-03",
      "public_event_or_publication": "CBS Evening News interview with Walter Cronkite, videotaped in Oval Office and broadcast that evening",
      "archival_or_draft_context": "President's Daily Diary, David Gergen briefing materials, Reagan diary",
      "verification_status": "verified"
    },
    {
      "public_item_id": "public-haig-testimony-0039",
      "unit_id": "document-0039",
      "record_type": "congressional_testimony_public_text",
      "public_source_type": "department_bulletin_testimony",
      "public_source_basis": "Department of State Bulletin, May 1981, page 72",
      "selected_or_supplemental": "selected_public_document",
      "date_or_span": "1981-03-19",
      "public_event_or_publication": "Statement by Secretary Haig before the Senate Foreign Relations Committee",
      "archival_or_draft_context": "",
      "verification_status": "verified"
    },
    {
      "public_item_id": "public-un-address-0206",
      "unit_id": "document-0206",
      "record_type": "public_address_editorial_note",
      "public_source_type": "public_papers_address",
      "public_source_basis": "Public Papers: Reagan, 1984, Book II, pages 1355-1361",
      "selected_or_supplemental": "selected_public_document_with_diary_context",
      "date_or_span": "1984-09-24",
      "public_event_or_publication": "President Reagan address to the United Nations General Assembly",
      "archival_or_draft_context": "Reagan diary entry on UN General Assembly appearance",
      "verification_status": "verified"
    },
    {
      "public_item_id": "public-speech-files-source-list-v01",
      "unit_id": "sources-frus1981-88v01",
      "record_type": "source_list_public_draft_context",
      "public_source_type": "speech_file_and_published_sources",
      "public_source_basis": "Volume source list names White House Office of Speechwriting files, speeches, and published sources",
      "selected_or_supplemental": "source_ecology",
      "date_or_span": "1981-1989",
      "public_event_or_publication": "Speeches and published-source ecology for Foundations volume",
      "archival_or_draft_context": "White House Office of Speechwriting Files and White House Office of Records Management Speeches subject file",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `volume_scope_statement`
- `speech_source_note`
- `public_address_editorial_note`
- `interview_editorial_note`
- `press_conference`
- `press_briefing`
- `press_release`
- `congressional_testimony_public_text`
- `public_papers_entry`
- `department_bulletin_entry`
- `newspaper_excerpt`
- `broadcast_record`
- `speech_file_draft`
- `briefing_material`
- `diary_public_event_context`
- `source_list_public_draft_context`
- `unknown`

Allowed `public_source_type` values:

- `public_papers_address`
- `television_interview`
- `radio_address`
- `press_release`
- `press_conference`
- `press_briefing`
- `department_bulletin_testimony`
- `congressional_record`
- `newspaper`
- `official_transcript`
- `speech_file`
- `speech_file_and_published_sources`
- `briefing_file`
- `diary`
- `mixed_public_and_archival`
- `unknown`

Allowed `selected_or_supplemental` values:

- `selected_public_document`
- `selected_public_document_with_archival_context`
- `selected_public_document_with_diary_context`
- `supplemental_public_context`
- `supplemental_archival_context`
- `source_ecology`
- `volume_scope`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_publication_details`
- `needs_delivery_or_broadcast_basis`
- `needs_transcript_basis`
- `needs_archival_draft_context`
- `needs_full_text_target`
- `needs_excerpt_status`
- `needs_public_vs_archival_selection`
- `unknown`

Public-source validator sequence:

1. Identify every source note, editorial note, heading, follow-on footnote,
   source-list entry, or annotation that names speeches, public remarks, press
   releases, press conferences, press briefings, interviews, broadcasts,
   Congressional testimony, Public Papers, Department of State Bulletin,
   Congressional Record, official transcripts, newspapers, magazines, briefing
   books, speechwriting files, diary corroboration, USIA, public diplomacy, or
   press guidance.
2. Match the unit against `public_diplomacy_context` before directly changing
   public-source title, speaker, publication, edition, page, date, delivery
   place, broadcast facts, transcript status, full-text target, excerpt status,
   archival draft context, or selected-versus-supplemental status.
3. Determine whether the public source is the selected document, a supporting
   citation inside an editorial note, corroborating event chronology, or
   archival context for a public event.
4. Preserve public-source precision. Do not flatten `Public Papers`, Department
   of State Bulletin, Congressional Record, official transcript, press release,
   New York Times excerpt, diary, briefing material, or speechwriting file into
   a generic "public source" label when the evidence supplies the exact form.
5. Separate delivered/broadcast/final public text from draft speech files,
   briefing materials, press guidance, diary entries, and newspaper excerpts. A
   draft can explain preparation; it does not automatically replace the
   delivered text as the selected document.
6. Preserve full-text and excerpt relationships. If an editorial note prints an
   excerpt and points to the complete text elsewhere, do not remove the full
   target or treat the excerpt as the entire public record.
7. For interviews and press events, verify speaker, interlocutor, network or
   issuing office, recording or broadcast fact, time, place, date, publication
   details, and whether the quote is transcript text or a paraphrased summary.
8. For testimony, coordinate with the congressional/legal validator for
   committee identity, hearing, Congress/session, authorization or appropriation
   context, and official-publication basis.
9. For UN, summit, travel, ceremony, toast, and public-address material,
   coordinate with event chronology; public-source evidence does not by itself
   prove private meeting content.
10. For in-preparation Foundations/Public Diplomacy volumes, do not change a
    valid public-source selected document into an archival source note merely
    because archival materials are also present.

Direct-edit posture:

- Safe direct edits may restore supplied publication punctuation, page form,
  speaker name, title capitalization, broadcast date, or source title when the
  uploaded unit or registry supplies exact evidence.
- Use `comment_only` with `evidence_request: public_source_basis` when
  publication details, transcript status, delivery/broadcast basis, full-text
  target, excerpt status, archival draft relationship, or
  selected-versus-supplemental status is missing, conflicting, or inferred.
- Use `evidence_request: event_chronology` when the blocker is event time,
  place, participant, itinerary, diary/schedule, press basis, or full-record
  target.
- Use `evidence_request: legal_authority` when the public source is testimony,
  a hearing, committee record, budget message, public law, or Senate record.
- Add a `public_diplomacy_public_source` discrepancy to the General Editor
  tally when published or local examples vary on how much public-source,
  full-text, excerpt, diary, briefing-file, press, or archival-draft detail to
  print, and the underlying facts are sound.

Public-source audit requirements:

- Count public-diplomacy/public-source warnings separately from event,
  congressional/legal, source-family, publication-status, and authority-control
  warnings.
- Preserve registry id, capture date, source URLs, record type, public-source
  type, basis, selected/supplemental status, date/span, public event or
  publication, archival/draft context, and verification status in the audit
  report.
- Record unresolved publication details, delivery/broadcast basis, transcript
  basis, full-text target, excerpt status, archival-draft context, and
  public-versus-archival selection warnings.

### 6.8A.2 Memoirs, Published Diaries, Oral Histories, Retrospective Accounts, And Recollection Evidence

Memoirs, published diaries, oral histories, later interviews, press
retrospectives, and recollective accounts can be valuable FRUS annotation
evidence, especially in Foundations and public-diplomacy volumes. They are also
dangerous if they are allowed to replace the official record. The checker should
preserve them as retrospective, supplemental, or interpretive context unless the
published volume or supplied context clearly treats the recollection itself as
selected evidence.

Use a retrospective-account registry when the wrapper can supply one:

```json
{
  "retrospective_account_registry_id": "frus-1981-1992-memoir-oral-history-recollection-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d18",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d34",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d236",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d260",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d282",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d316"
  ],
  "records": [
    {
      "retrospective_item_id": "memoir-haig-confirmation-0018",
      "unit_id": "document-0018",
      "record_type": "memoir_recollection",
      "account_author_or_source": "Alexander M. Haig, Jr., Caveat",
      "publication_or_collection": "Haig memoir",
      "page_or_locator": "pages 12-14 and 37-52",
      "event_or_document_described": "Reagan offer to Haig and Haig confirmation hearings",
      "official_record_relationship": "supplements Senate hearing/public confirmation chronology",
      "selected_or_supplemental": "supplemental_recollection",
      "corroborating_record": "Nomination hearing transcript and Senate vote chronology",
      "verification_status": "verified"
    },
    {
      "retrospective_item_id": "memoir-haig-middle-east-0034",
      "unit_id": "document-0034",
      "record_type": "memoir_recollection",
      "account_author_or_source": "Alexander M. Haig, Jr., Caveat",
      "publication_or_collection": "Haig memoir",
      "page_or_locator": "page 89",
      "event_or_document_described": "Genesis of Haig Middle East trip",
      "official_record_relationship": "supplements scheduled FRUS trip documentation and Department of State Bulletin remarks",
      "selected_or_supplemental": "supplemental_recollection",
      "corroborating_record": "travel schedule, Department of State Bulletin, attached Cairo telegram",
      "verification_status": "verified"
    },
    {
      "retrospective_item_id": "diary-memoir-chernenko-0236",
      "unit_id": "document-0236",
      "record_type": "published_personal_diary_and_memoir",
      "account_author_or_source": "Ronald Reagan diary; George P. Shultz, Turmoil and Triumph",
      "publication_or_collection": "The Reagan Diaries; Shultz memoir",
      "page_or_locator": "Reagan Diaries vol. I, page 434; Shultz memoir page 527",
      "event_or_document_described": "March 11, 1985 Shultz meeting with Reagan after Chernenko's death",
      "official_record_relationship": "supplements talking points, Daily Diary, and related letter/document cross-reference",
      "selected_or_supplemental": "supplemental_diary_and_recollection",
      "corroborating_record": "President's Daily Diary and selected talking points",
      "verification_status": "verified"
    },
    {
      "retrospective_item_id": "memoir-shultz-arms-control-0260",
      "unit_id": "document-0260",
      "record_type": "memoir_recollection",
      "account_author_or_source": "George P. Shultz, Turmoil and Triumph",
      "publication_or_collection": "Shultz memoir",
      "page_or_locator": "pages 702-703",
      "event_or_document_described": "January 24, 1986 meeting segment on U.S.-Soviet arms control",
      "official_record_relationship": "supplements prepared paper and President's Daily Diary meeting evidence",
      "selected_or_supplemental": "supplemental_recollection",
      "corroborating_record": "Secretary's Meeting with the President paper and President's Daily Diary",
      "verification_status": "verified"
    },
    {
      "retrospective_item_id": "memoir-shultz-iran-press-0282",
      "unit_id": "document-0282",
      "record_type": "memoir_recollection",
      "account_author_or_source": "George P. Shultz, Turmoil and Triumph",
      "publication_or_collection": "Shultz memoir",
      "page_or_locator": "pages 830-831",
      "event_or_document_described": "Shultz reaction to Reagan November 19, 1986 Iran arms news conference",
      "official_record_relationship": "supplements handwritten talking points and Public Papers press-conference source",
      "selected_or_supplemental": "supplemental_recollection",
      "corroborating_record": "Hill handwritten talking points and Public Papers press-conference text",
      "verification_status": "verified"
    },
    {
      "retrospective_item_id": "diary-reagan-foreign-policy-schedule-0316",
      "unit_id": "document-0316",
      "record_type": "published_personal_diary",
      "account_author_or_source": "Ronald Reagan diary edited by Brinkley",
      "publication_or_collection": "The Reagan Diaries",
      "page_or_locator": "vol. II, page 822",
      "event_or_document_described": "January 6, 1988 meeting with Shultz on foreign policy schedule",
      "official_record_relationship": "supplements no-minutes note, Daily Diary, and Shultz meeting paper",
      "selected_or_supplemental": "supplemental_diary_context",
      "corroborating_record": "President's Daily Diary and Shultz meeting paper",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `memoir_recollection`
- `published_personal_diary`
- `published_personal_diary_and_memoir`
- `oral_history`
- `later_interview`
- `press_retrospective`
- `published_account`
- `private_diary_context`
- `editorial_recollection_context`
- `unknown`

Allowed `selected_or_supplemental` values:

- `selected_public_document`
- `supplemental_recollection`
- `supplemental_diary_context`
- `supplemental_diary_and_recollection`
- `corroborating_public_account`
- `conflicting_recollection`
- `background_only`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_publication_details`
- `needs_page_or_locator`
- `needs_author_or_editor_basis`
- `needs_event_match`
- `needs_official_record_relationship`
- `needs_corroborating_record`
- `needs_selection_status`
- `needs_conflict_check`
- `unknown`

Retrospective-account validator sequence:

1. Identify every source note, editorial note, follow-on footnote, or annotation
   that cites a memoir, published diary, personal diary, oral history, later
   interview, recollection, press retrospective, newspaper account, edited diary,
   published account, or phrase such as `in his memoir`, `in his personal diary`,
   `for his recollection`, or `according to`.
2. Match the unit against `retrospective_account_context` before directly
   changing author/editor, publication title, page/locator, date, event described,
   selected/supplemental status, or relation to an official record.
3. Separate retrospective accounts from official records. A memoir, oral history,
   diary, or newspaper account can supplement chronology, intent, reception, or
   later recollection; it does not by itself prove meeting minutes, official
   approval, participant lists, source paths, attached documents, or classified
   text.
4. Preserve attribution. Do not rewrite a recollective claim as the checker’s
   narrative voice unless the published FRUS form already does so and the account
   is clearly identified in the note.
5. Preserve publication details and page locators. Do not drop page references,
   volume numbers, editor names, publication titles, or full-text targets when the
   uploaded note supplies them.
6. Check whether the account corroborates, supplements, conflicts with, or merely
   contextualizes the official record. If the account conflicts with a diary,
   schedule, memcon, source note, or public transcript, flag the conflict rather
   than smoothing it away.
7. Coordinate with chronology rules when a diary or memoir supports time, place,
   sequence, or no-minutes/no-record claims.
8. Coordinate with public-source rules when the account is a newspaper article,
   published interview, Department of State Bulletin item, Public Papers text, or
   selected public document.
9. Coordinate with legal, congressional, economic, military, sensitive-record, or
   foreign-organization rules when a recollection claims authority, amount,
   operation stage, intelligence fact, or foreign/government role.

Direct-edit posture:

- Safe direct edits may restore exact supplied author names, titles, page forms,
  `memoir`, `personal diary`, `oral history`, `published account`, `recollection`,
  or `supplemental` wording when the uploaded unit or registry supplies exact
  evidence.
- Use `comment_only` with `evidence_request: retrospective_account_basis` when
  author/editor, title, page/locator, event match, selected/supplemental status,
  official-record relationship, corroborating record, or conflict status is
  missing, conflicting, or inferred.
- Use `evidence_request: chronology` when the blocker is a diary/schedule,
  meeting time, participant basis, no-minutes/no-record assertion, or sequence
  claim.
- Use `evidence_request: public_source_basis` when the blocker is publication,
  newspaper, interview, transcript, full-text, excerpt, or public-versus-archival
  status.
- Add a `memoir_oral_history_recollection` discrepancy to the General Editor
  tally when published or local examples vary on how much memoir, diary, oral-
  history, later-interview, newspaper, or recollective detail to print, and the
  underlying facts are sound.

Retrospective-account audit requirements:

- Count memoir, oral-history, published-diary, personal-diary, later-interview,
  recollection, press-retrospective, selected-versus-supplemental, official-record
  relationship, corroboration, and conflict warnings separately from public-source
  and chronology warnings.
- Preserve registry id, capture date, source URLs, record type, author/source,
  publication or collection, page/locator, event or document described,
  official-record relationship, selected/supplemental status, corroborating
  record, and verification status in the audit report.
- Record unresolved author/editor, publication, page/locator, event-match,
  selected/supplemental, official-record relationship, corroborating-record, and
  conflict warnings.

### 6.8B Congressional, Legal, And Public-Authority Records

Reagan and Bush annotation sheets often cite congressional testimony, hearings,
budget messages, public laws, continuing resolutions, joint resolutions,
Presidential Determinations, certifications, Executive Orders, independent
counsel actions, congressional oversight, and Senate advice-and-consent context.
These records are not just generic public sources. They often establish legal
authority, funding conditions, oversight posture, ratification posture, or the
reason a public statement mattered.

Use a congressional/legal registry when the wrapper can supply one:

```json
{
  "congressional_legal_registry_id": "frus-1981-1992-congressional-legal-authority-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d39",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d274",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d286",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d371",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/preface"
  ],
  "records": [
    {
      "legal_item_id": "legal-testimony-0039",
      "unit_id": "source-note-0039",
      "record_type": "congressional_testimony",
      "institution_or_body": "Senate Foreign Relations Committee; House Foreign Affairs Committee",
      "authority_or_citation": "Department of State Bulletin, April 1981, pp. A-C; House Foreign Affairs Committee hearing citation",
      "action_stage": "testimony_given",
      "public_or_archival_basis": "selected public testimony with archival memorandum context",
      "related_publication_or_law": "Foreign Assistance Legislation for Fiscal Year 1982",
      "verification_status": "verified"
    },
    {
      "legal_item_id": "legal-public-law-0274",
      "unit_id": "footnote-0274-0004",
      "record_type": "public_law",
      "institution_or_body": "House of Representatives; Senate; President",
      "authority_or_citation": "Public Law 99-591, 100 Stat. 3341",
      "action_stage": "enacted_signed",
      "public_or_archival_basis": "congressional vote sequence and public-law authority in annotation",
      "related_publication_or_law": "FY 1987 continuing appropriations resolution",
      "verification_status": "verified"
    },
    {
      "legal_item_id": "legal-executive-order-0286",
      "unit_id": "footnote-0286-0006",
      "record_type": "executive_order",
      "institution_or_body": "President; Special Review Board; Congress; independent counsel",
      "authority_or_citation": "Executive Order 12575",
      "action_stage": "executive_order_issued",
      "public_or_archival_basis": "Public Papers citation with congressional oversight context",
      "related_publication_or_law": "Iran arms and Contra aid investigation",
      "verification_status": "verified"
    },
    {
      "legal_item_id": "legal-determination-0371",
      "unit_id": "footnote-0371-0002",
      "record_type": "presidential_determination",
      "institution_or_body": "President; Congress; multilateral development banks",
      "authority_or_citation": "Presidential Determination No. 87-4; Section 560; Public Law 99-500",
      "action_stage": "determination_transmitted",
      "public_or_archival_basis": "archival memorandum with attached-but-not-printed certification and justification",
      "related_publication_or_law": "Foreign Assistance and Related Programs Appropriations Act, 1987",
      "verification_status": "verified"
    },
    {
      "legal_item_id": "legal-senate-advice-consent-start",
      "unit_id": "editorial-note-0247",
      "record_type": "senate_advice_and_consent",
      "institution_or_body": "Senate; President; Department of State",
      "authority_or_citation": "START I Senate advice and consent to ratification",
      "action_stage": "transmitted_for_consideration",
      "public_or_archival_basis": "public treaty transmittal and volume preface context",
      "related_publication_or_law": "START I and Lisbon Protocol context",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `congressional_testimony`
- `hearing`
- `committee_report`
- `budget_message`
- `message_to_congress`
- `congressional_notification`
- `public_law`
- `statute`
- `continuing_resolution`
- `joint_resolution`
- `authorization_or_appropriation`
- `presidential_determination`
- `presidential_certification`
- `executive_order`
- `independent_counsel`
- `oversight_investigation`
- `senate_advice_and_consent`
- `ratification`
- `report_to_congress`
- `unknown`

Allowed `action_stage` values:

- `proposed`
- `testimony_given`
- `reported`
- `voted`
- `passed_house`
- `passed_senate`
- `enacted_signed`
- `transmitted_to_congress`
- `transmitted_for_consideration`
- `determination_transmitted`
- `certification_required`
- `executive_order_issued`
- `investigation_announced`
- `ratified`
- `entered_into_force`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_committee_identity`
- `needs_hearing_citation`
- `needs_public_law_citation`
- `needs_statute_citation`
- `needs_vote_or_stage`
- `needs_transmittal_basis`
- `needs_authority_or_section`
- `needs_attachment_status`
- `needs_public_source`
- `unknown`

Congressional/legal validator sequence:

1. Identify every source note, editorial note, footnote, heading, annotation,
   attachment note, or source-list entry that names Congress, a committee,
   hearing, testimony, public law, statute, continuing resolution, joint
   resolution, budget message, congressional notification, Presidential
   Determination, certification, Executive Order, independent counsel, oversight
   inquiry, Senate advice and consent, ratification, or report to Congress.
2. Match the unit against `congressional_legal_context` before directly changing
   committee identity, hearing title, Congress/session, legal citation, public
   law number, Stat. citation, vote sequence, action stage, amount, condition,
   transmittal date, determination/certification number, Executive Order number,
   or Senate advice-and-consent language.
3. Preserve the difference between selected documentary source and supporting
   legal context. A Department of State Bulletin testimony text, Public Papers
   message, GPO hearing, public law, Presidential Determination, or Executive
   Order can be the selected document or a supporting footnote depending on the
   volume's purpose.
4. Do not convert a hearing, testimony, Public Papers message, public law,
   statute, Executive Order, or Presidential Determination into an archival
   source-note template unless the archival copy is the selected source.
5. Separate proposed requests, testimony, House action, Senate action, enacted
   law, signed law, transmitted certification, and attached-but-not-printed
   legal materials. Do not collapse these stages into a single "Congress
   approved" claim without evidence.
6. For funding, aid, waiver, certification, and notification claims, preserve
   amounts, conditions, effective dates, earmarks, release restrictions, and
   statutory section numbers only when supplied.
7. For treaty and arms-control material, coordinate with the treaty registry to
   distinguish Senate advice and consent, ratification, entry into force,
   associated-but-not-integral documents, and pre-ratification negotiation
   strategy.
8. For oversight and independent counsel material, preserve the public-source
   basis and do not treat public investigative posture as proof of underlying
   classified facts.

Direct-edit posture:

- Safe direct edits may correct narrow citation punctuation or restore a
  supplied public-law, Executive Order, committee, or hearing form when the
  uploaded unit or registry supplies the exact evidence.
- Use `comment_only` with `evidence_request: legal_authority` when committee
  identity, hearing citation, public-law citation, statutory section, vote
  sequence, action stage, transmittal basis, amount, condition, attachment
  status, or authority number is missing, conflicting, or inferred.
- Use `evidence_request: treaty_component` when the legal-authority issue is
  really treaty component identity or integral-versus-associated status.
- Use `evidence_request: publication_status`, `cross_reference`, or
  `document_number` when the blocker is whether a legal or congressional record
  is printed, scheduled elsewhere, or tied to a target document.
- Add a `congressional_legal_authority` discrepancy to the General Editor tally
  when published or local examples vary on how much legal citation, hearing
  detail, vote-stage detail, or public-law/statute form to print, and the
  underlying facts are sound.

Congressional/legal audit requirements:

- Count congressional/legal warnings separately from ordinary citation,
  publication-status, treaty, and public-source warnings.
- Preserve registry id, capture date, source URLs, record type, action stage,
  legal citation, public/archival basis, and verification status in the audit
  report.
- Record unresolved committee, hearing, public-law, Stat., section, vote-stage,
  transmittal, determination/certification, Executive Order, independent
  counsel, attachment-status, and Senate advice-and-consent warnings.

### 6.8C Economic, Debt, Trade, Assistance, And Financial Data

Economic and foreign-assistance annotation is unusually error-prone because the
same note can combine policy language, institutional acronyms, dollar amounts,
percentages, fiscal years, congressional conditions, public addresses,
multilateral meetings, tables, and attached-but-not-printed financial materials.
For Reagan trade/monetary, debt, and assistance volumes and Bush foreign
economic policy sheets, the checker must protect exact figures and institutional
relationships while still allowing public reports, speeches, hearings, and
multilateral-finance records to be selected evidence.

Use an economic/financial registry when the wrapper can supply one:

```json
{
  "economic_financial_registry_id": "frus-1981-1992-economic-financial-data-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v38/preface",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d177",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d223",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d267",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d324",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d371",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "financial_item_id": "econ-mdb-0267",
      "unit_id": "document-0267",
      "record_type": "multilateral_development_bank_policy",
      "institution_or_actor": "Cabinet Council on Economic Affairs; State; Treasury; AID; IMF; IBRD",
      "amount_or_percentage": "six percent reduction",
      "fiscal_year_or_date": "1981-09-24",
      "policy_or_program": "Assessment of multilateral development banks",
      "source_basis": "Cabinet Council minutes with Public Papers reference to IMF/World Bank remarks",
      "table_or_attachment_status": "none supplied",
      "verification_status": "verified"
    },
    {
      "financial_item_id": "econ-imf-world-bank-0177",
      "unit_id": "document-0177",
      "record_type": "imf_world_bank_meeting",
      "institution_or_actor": "IMF; World Bank; President; Treasury; State",
      "amount_or_percentage": "IMF quota increase; no exact amount supplied in unit",
      "fiscal_year_or_date": "1984-09-24/1984-09-27",
      "policy_or_program": "Annual IMF/World Bank meetings and debt-crisis strategy",
      "source_basis": "NSC memorandum with Public Papers reference",
      "table_or_attachment_status": "Tab A attached but not printed",
      "verification_status": "verified"
    },
    {
      "financial_item_id": "econ-debt-0223",
      "unit_id": "document-0223",
      "record_type": "debt_strategy",
      "institution_or_actor": "Treasury; IMF; World Bank; commercial banks; debtor countries",
      "amount_or_percentage": "new money commitments; old loans; no exact amount supplied in excerpt",
      "fiscal_year_or_date": "1987-06-19",
      "policy_or_program": "Strengthened debt strategy",
      "source_basis": "Treasury memorandum",
      "table_or_attachment_status": "none supplied",
      "verification_status": "verified"
    },
    {
      "financial_item_id": "econ-private-enterprise-0324",
      "unit_id": "document-0324",
      "record_type": "private_investment_and_trade_policy",
      "institution_or_actor": "NSC; President's Task Force on International Private Enterprise; World Bank; OPIC; Eximbank; AID",
      "amount_or_percentage": "$500 million Private Sector Loan Fund; $1 billion mixed credit fund",
      "fiscal_year_or_date": "1984-11-27",
      "policy_or_program": "Private enterprise, foreign assistance, trade, and food assistance recommendations",
      "source_basis": "NSC memorandum summarizing draft task-force recommendations",
      "table_or_attachment_status": "Tabs I-II referenced; not printed",
      "verification_status": "verified"
    },
    {
      "financial_item_id": "econ-certification-0371",
      "unit_id": "document-0371",
      "record_type": "appropriations_condition_and_certification",
      "institution_or_actor": "State; President; Congress; MDBs; international organizations",
      "amount_or_percentage": "$23 billion lending programs; $1.4 billion annualized budgetary cost; $2 billion IO and P programs; $250 million annual cost",
      "fiscal_year_or_date": "FY 1987",
      "policy_or_program": "Section 560 certification for multilateral development bank and international organization payments",
      "source_basis": "State memorandum and Presidential Determination/Public Law footnote",
      "table_or_attachment_status": "draft certification and justification attached but not printed",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `foreign_assistance_budget`
- `appropriations_condition_and_certification`
- `multilateral_development_bank_policy`
- `imf_world_bank_meeting`
- `debt_strategy`
- `trade_policy`
- `monetary_policy`
- `commodity_policy`
- `private_investment_and_trade_policy`
- `economic_summit`
- `development_policy`
- `loan_or_guarantee`
- `quota_or_replenishment`
- `table_or_statistical_data`
- `public_report_or_address`
- `international_organization_finance`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_amount`
- `needs_currency`
- `needs_fiscal_year`
- `needs_institution_identity`
- `needs_table_source`
- `needs_attachment_status`
- `needs_public_source`
- `needs_legal_authority`
- `needs_policy_stage`
- `unknown`

Economic/financial validator sequence:

1. Identify every source note, editorial note, attachment note, table cell,
   heading, footnote, annotation, source-list entry, or public-source reference
   that names foreign assistance, trade, monetary policy, industrialized-country
   cooperation, international debt, IMF, World Bank, IBRD, MDBs, UNCTAD, GATT,
   OECD, G-7, G-77, AID, OPIC, Eximbank, commodity policy, budget authority,
   fiscal year, dollar amount, percentage, loan, guarantee, quota, conditionality,
   replenishment, rescheduling, or private-sector finance.
2. Match the unit against `economic_financial_context` before directly changing
   amounts, percentages, currencies, fiscal years, institution names, acronyms,
   policy program names, meeting names, table captions, row/column labels,
   source-note basis, or attachment status.
3. Preserve institution identity. Do not collapse IMF, World Bank, IBRD, MDB,
   AID, OPIC, Eximbank, Treasury, State economic bureau, GATT, UNCTAD, OECD,
   G-7, G-77, commercial banks, Paris Club, or private-sector entities into a
   generic "financial institution" label when the source supplies the precise
   actor.
4. Preserve numeric precision and units. Do not change millions to billions,
   nominal amounts to budget authority, percentages to dollar amounts, fiscal
   years to calendar years, or proposed funding to enacted funding unless the
   registry or uploaded unit proves the change.
5. Treat tables and financial lists as structured evidence. Do not move figures
   across rows, columns, countries, institutions, fiscal years, or program
   headings merely to improve prose.
6. Separate policy stage: proposal, recommendation, study, speech, meeting
   decision, congressional request, authorized appropriation, certification,
   loan guarantee, quota increase, rescheduling agreement, or actual payment.
7. Coordinate with the congressional/legal registry when appropriations,
   authorizations, statutory sections, certifications, determinations, or
   congressional conditions control the financial claim.
8. Coordinate with event chronology for IMF/World Bank annual meetings,
   Cancun/economic summits, speeches, and press events; with attachment rules
   for tabs, reports, justifications, and tables attached but not printed.

Direct-edit posture:

- Safe direct edits may restore a supplied acronym, fiscal-year label, currency
  symbol, or narrow source-title punctuation when the uploaded unit or registry
  supplies the exact evidence.
- Use `comment_only` with `evidence_request: financial_data` when amount,
  currency, percentage, fiscal year, institution identity, table basis, program
  name, policy stage, attachment status, public-source basis, or debt/loan
  instrument identity is missing, conflicting, or inferred.
- Use `evidence_request: legal_authority` when the financial issue depends on a
  statute, appropriation, authorization, certification, determination, or
  congressional condition.
- Use `evidence_request: event_chronology` when the financial issue depends on
  the timing, venue, or sequence of a summit, annual meeting, speech, or press
  event.
- Add an `economic_financial_data` discrepancy to the General Editor tally when
  published or local examples vary on how much numeric detail, institution
  acronym expansion, table caption detail, or policy-stage explanation to print,
  and the underlying facts are sound.

Economic/financial audit requirements:

- Count financial-data warnings separately from congressional/legal,
  public-source, event, and source-note warnings.
- Preserve registry id, capture date, source URLs, record type, institution or
  actor, amount/percentage, fiscal year/date, program name, table/attachment
  status, source basis, and verification status in the audit report.
- Record unresolved amount, currency, percentage, fiscal-year, table-source,
  institution-identity, policy-stage, public-source, legal-authority, and
  attachment-status warnings.

### 6.8D Intelligence, Covert-Action, Law-Enforcement, Counternarcotics, Counterterrorism, And Agency-Equity Records

Sensitive-record annotation is a high-risk zone for a closed-network LLM.
Reagan and Bush volumes show that intelligence, covert-action, law-enforcement,
counternarcotics, counterterrorism, and agency-equity references can appear as
source families, participant lists, declassification review facts, public policy
mentions, oversight context, technical verification issues, or operational
claims. The checker must separate those roles before it proposes any tracked
change.

Use a sensitive-record registry when the wrapper can supply one:

```json
{
  "sensitive_record_registry_id": "frus-1981-1992-intelligence-law-enforcement-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d172",
    "https://history.state.gov/historicaldocuments/frus1981-88v10/d46",
    "https://history.state.gov/historicaldocuments/frus1981-88v10/d56",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d294",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "sensitive_item_id": "sensitive-source-ecology-reagan-nsp",
      "unit_id": "about-the-series-reagan-xliv-p1",
      "record_type": "agency_equity_note",
      "agency_or_equity": "NSC; CIA; DOD; JCS; Reagan Library restricted records",
      "source_family": "FRUS about-the-series source ecology and declassification statement",
      "classification_or_handling": "published front-matter statement; not an original document marking",
      "sensitive_claim": "National-security volumes may draw on agency records and declassified extracts from still-classified documents",
      "operational_detail_status": "source_ecology_only",
      "oversight_or_public_basis": "official FRUS front matter",
      "redaction_or_release_status": "declassified published material; some underlying files may remain unavailable in full",
      "verification_status": "verified"
    },
    {
      "sensitive_item_id": "sensitive-start-data-denial-0172",
      "unit_id": "document-0172",
      "record_type": "military_intelligence_record",
      "agency_or_equity": "DOD; IC; CIA; JCS; SSCI",
      "source_family": "George H.W. Bush Library, Bush Presidential Records, NSC, John A. Gordon Files",
      "classification_or_handling": "Secret; attached CIA paper with handling restriction not declassified; JCS paper Secret; Noforn",
      "sensitive_claim": "START data-denial, telemetry, Intelligence Community, DOD, CIA, JCS, and congressional intelligence committee equities",
      "operational_detail_status": "operational_detail_redacted",
      "oversight_or_public_basis": "SSCI and Senate Foreign Relations Committee ratification standard referenced in published text",
      "redaction_or_release_status": "published with multiple not-declassified passages and one 6-page CIA paper not declassified",
      "verification_status": "verified"
    },
    {
      "sensitive_item_id": "sensitive-polish-covert-action-0046",
      "unit_id": "document-0046",
      "record_type": "covert_action_source_note",
      "agency_or_equity": "CIA; NSPG; Reagan; Webster",
      "source_family": "Reagan Library, System IV Intelligence Files",
      "classification_or_handling": "Top Secret; handling restriction not declassified",
      "sensitive_claim": "covert-action funding authority and program expansion",
      "operational_detail_status": "operational_detail_supported",
      "oversight_or_public_basis": "Presidential findings and NSPG review basis in published document",
      "redaction_or_release_status": "published with not-declassified footnote and not-declassified passages",
      "verification_status": "verified"
    },
    {
      "sensitive_item_id": "sensitive-covert-action-program-0056",
      "unit_id": "document-0056",
      "record_type": "covert_action_source_note",
      "agency_or_equity": "CIA; Congress; NSDD 286 oversight context",
      "source_family": "Reagan Library, System IV Intelligence Files",
      "classification_or_handling": "Top Secret; handling restriction not declassified",
      "sensitive_claim": "covert support, media distribution, congressional briefing requirements, and not-declassified program details",
      "operational_detail_status": "operational_detail_redacted",
      "oversight_or_public_basis": "published text references congressional briefing requirements under NSDD 286",
      "redaction_or_release_status": "published with not-declassified lines, paragraphs, and footnote",
      "verification_status": "verified"
    },
    {
      "sensitive_item_id": "sensitive-andean-narcotics-terrorism-0294",
      "unit_id": "document-0294",
      "record_type": "counternarcotics_counterterrorism_policy_mention",
      "agency_or_equity": "NSC; regional ambassadors; no DEA, FBI, or operational agency proof in the cited passage",
      "source_family": "Reagan Library, African Affairs Directorate, NSC Records, Subject File",
      "classification_or_handling": "Secret",
      "sensitive_claim": "Andean Summit planning on narcotics and terrorism as a policy initiative",
      "operational_detail_status": "policy_context_only",
      "oversight_or_public_basis": "published FRUS document text",
      "redaction_or_release_status": "published",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `intelligence_requirements`
- `intelligence_assessment`
- `sanitized_intelligence_assessment`
- `covert_action_editorial_note`
- `covert_action_source_note`
- `law_enforcement_record`
- `counternarcotics_counterterrorism_policy_mention`
- `counternarcotics_interagency_meeting`
- `counterterrorism_law_enforcement_contact`
- `agency_equity_note`
- `oversight_briefing`
- `operational_claim`
- `source_and_methods`
- `military_intelligence_record`
- `foreign_intelligence_or_security_service_contact`
- `unknown`

Allowed `operational_detail_status` values:

- `source_ecology_only`
- `policy_context_only`
- `policy_requirements_not_operations`
- `public_editorial_summary_only`
- `do_not_infer_operations`
- `operational_detail_supported`
- `operational_detail_redacted`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_agency_identity`
- `needs_classification_marking`
- `needs_redaction_basis`
- `needs_oversight_basis`
- `needs_operational_basis`
- `needs_law_enforcement_basis`
- `needs_foreign_service_basis`
- `unknown`

Sensitive-record validator sequence:

1. Identify every source note, editorial note, heading, participant list,
   follow-on footnote, source-list entry, or annotation that names intelligence,
   CIA, DCI, DOD, DIA, JCS, FBI, DEA, Justice, law enforcement,
   counternarcotics, counterterrorism, covert action, source-and-methods,
   special activities, oversight committees, foreign intelligence or security
   services, sanitized/reviewed records, not-declassified text, or operational
   details.
2. Match the unit against `sensitive_record_context` before directly changing
   agency names, source-family language, operational wording, law-enforcement
   status, classification/handling, release/sanitization language, or oversight
   claims.
3. Separate source family from agency equity. A CIA, DOD, JCS, DEA, FBI, or
   Justice file path can prove source ecology without proving the content of a
   specific operation.
4. Separate original classification or handling from later release,
   sanitization, excision, whole-document withholding, and still-classified
   source availability.
5. Separate policy analysis from operations. A topical reference to narcotics,
   terrorism, intelligence, covert action, or law enforcement is not proof of a
   DEA, FBI, CIA, or foreign-service operation.
6. For covert action, verify whether the note concerns a Presidential finding,
   memorandum of notification, NSPG review, CIA paper, budget/funding issue,
   congressional notification/briefing, operational detail, or later editorial
   summary.
7. For law-enforcement, counternarcotics, and counterterrorism material, verify
   the agency identity, record type, source family, public/archival basis, and
   whether the passage is policy, diplomacy, investigation, intelligence,
   prosecution, or operational activity.
8. Do not add source-and-methods, operational, law-enforcement, or foreign
   intelligence service details from volume family, subject tags, public
   allegations, press accounts, memoirs, or neighboring documents alone.
9. Coordinate with classification/declassification rules for original markings,
   handling restrictions, paragraph markings, not-declassified quantities,
   sanitized records, and release-status language.
10. Coordinate with congressional/legal rules when intelligence committees,
    oversight bodies, statutory authorities, Presidential findings,
    notifications, NSDDs, or Senate ratification standards supply the basis.

Direct-edit posture:

- Safe direct edits may restore supplied agency acronym punctuation, exact
  source-family labels, or narrow capitalization when the uploaded unit or
  registry supplies exact evidence.
- Use `comment_only` with `evidence_request: agency_equity` when agency
  identity, operational basis, source-and-methods status, law-enforcement
  context, oversight basis, redaction/sanitization basis, foreign-service
  contact, or source-family/agency-equity distinction is missing, conflicting,
  or inferred.
- Use `evidence_request: classification_marking` when the blocker is the
  original classification, handling restriction, precedence, or paragraph
  marking.
- Use `evidence_request: declassification_status` when the blocker is release,
  withholding, excision, bracket, sanitization, or still-classified availability.
- Add an `intelligence_law_enforcement` discrepancy to the General Editor tally
  when published or local examples vary on how much agency, source-and-methods,
  oversight, operational, sanitized-record, or public-policy detail to print,
  and the underlying facts are sound.

Sensitive-record audit requirements:

- Count intelligence, covert-action, law-enforcement, counternarcotics,
  counterterrorism, source-and-methods, agency-equity, operational, oversight,
  and sanitized-record warnings separately from classification and
  declassification warnings.
- Preserve registry id, capture date, source URLs, record type, agency or
  equity, source family, classification/handling, sensitive claim, operational
  detail status, oversight/public basis, redaction/release status, and
  verification status in the audit report.
- Record unresolved agency identity, operational-basis, source-and-methods,
  law-enforcement-status, foreign-service-contact, oversight-basis,
  redaction/sanitization, classification/handling, and public-versus-archival
  basis warnings.

### 6.8E Military, Crisis, Defense, Coalition, And Situation-Room Records

Military and crisis annotation is especially sensitive because the same words
can describe a policy concern, intelligence warning, contingency plan,
host-nation notification, military assistance option, combat operation, public
statement, after-action report, or later editorial cross-reference. Recent
Reagan North Africa practice shows DOD, OSD, JCS, DIA, NSC Crisis Management
Center, State NODIS/EXDIS, and presidential-library crisis records appearing
alongside terrorism, host-government, coalition, and declassification issues.
The checker must preserve operational stage and source family before it
suggests any tracked change.

Use a military/crisis registry when the wrapper can supply one:

```json
{
  "military_crisis_registry_id": "frus-1981-1992-military-crisis-operations-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v24/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d341",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d329",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d382",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "military_item_id": "military-source-ecology-north-africa-v24",
      "unit_id": "sources-frus1981-88v24",
      "record_type": "source_ecology",
      "military_or_crisis_actor": "Department of Defense; OSD; JCS; DIA; NSC Crisis Management Center; CIA; State",
      "source_family": "Reagan Library NSC files, NSC Crisis Management Center, RG 330 OSD records, State NODIS/EXDIS telegrams, CIA records",
      "operation_or_crisis": "North Africa policy, defense relationships, terrorism, Libya, Chad, Tunisia, Western Sahara",
      "stage_or_role": "volume_source_ecology",
      "classification_or_handling": "varies by record family",
      "chronology_or_location_basis": "volume source list",
      "verification_status": "verified"
    },
    {
      "military_item_id": "military-libya-notification-0341",
      "unit_id": "document-0341",
      "record_type": "host_nation_notification",
      "military_or_crisis_actor": "Department of State; President; U.S. military aircraft; Embassy Tunisia; host-nation officials",
      "source_family": "Department of State Executive Secretariat A Bureau Central Foreign Policy Files, Lot 12D215, Top Secret Hardcopy Telegrams",
      "operation_or_crisis": "U.S. action against Libyan terrorism",
      "stage_or_role": "pre-strike_notification",
      "classification_or_handling": "Top Secret; Niact Immediate; Nodis Special Encryption",
      "chronology_or_location_basis": "Washington, April 14, 1986, 2146Z; alert after 2359 GMT",
      "verification_status": "verified"
    },
    {
      "military_item_id": "military-tunisia-contingency-0329",
      "unit_id": "document-0329",
      "record_type": "defense_contingency_planning",
      "military_or_crisis_actor": "JCS Joint Staff; OSD/ISA; DIA; USCINCEUR; USN; France; Tunisia; Algeria",
      "source_family": "Washington National Records Center, OSD Files, FRC 330-88-0058, 1985 Official Records (Top Secret)",
      "operation_or_crisis": "Tunisia security situation and possible Libyan attack",
      "stage_or_role": "contingency_planning",
      "classification_or_handling": "Secret and Top Secret paragraph markings",
      "chronology_or_location_basis": "Washington, September 3, 1985; DJSM 1794-85",
      "verification_status": "verified"
    },
    {
      "military_item_id": "military-western-sahara-dia-0382",
      "unit_id": "document-0382",
      "record_type": "military_intelligence_report",
      "military_or_crisis_actor": "Defense Intelligence Agency; OSD; POLISARIO; Morocco; Algeria; Libya; OAU",
      "source_family": "Washington National Records Center, OSD Files, FRC 330-83-0104, 1981 Official Records (Secret & Below)",
      "operation_or_crisis": "Western Sahara military activity and POLISARIO operation",
      "stage_or_role": "intelligence_assessment",
      "classification_or_handling": "Secret; handling restriction not declassified",
      "chronology_or_location_basis": "Washington, August 13, 1981; POLISARIO operation dated August 11",
      "verification_status": "verified"
    },
    {
      "military_item_id": "military-status-bush-crisis-volumes",
      "unit_id": "status-of-series-1989-1992-crisis",
      "record_type": "status_page_family_context",
      "military_or_crisis_actor": "Persian Gulf Crisis; Yugoslavia; Somalia; Panama; National Security Policy",
      "source_family": "History Office Status of the Series page",
      "operation_or_crisis": "Bush 1989-1992 in-preparation crisis and military-policy volume families",
      "stage_or_role": "routing_and_review_posture_only",
      "classification_or_handling": "not applicable",
      "chronology_or_location_basis": "status page captured 2026-06-03",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `source_ecology`
- `crisis_notification_telegram`
- `host_nation_notification`
- `defense_contingency_planning`
- `military_intelligence_report`
- `dod_osd_jcs_record`
- `situation_room_record`
- `combat_operation_record`
- `military_assistance_record`
- `security_assistance_record`
- `coalition_support_record`
- `peacekeeping_record`
- `military_exercise`
- `port_visit`
- `conplan`
- `rules_of_engagement`
- `after_action_record`
- `casualty_or_damage_claim`
- `no_record_found`
- `status_page_family_context`
- `unknown`

Allowed `stage_or_role` values:

- `volume_source_ecology`
- `policy_discussion`
- `intelligence_warning`
- `intelligence_assessment`
- `contingency_planning`
- `option_paper`
- `host_nation_notification`
- `pre-strike_notification`
- `executed_operation`
- `post_operation_report`
- `public_statement_preparation`
- `security_assistance_option`
- `coalition_or_allied_support`
- `routing_and_review_posture_only`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_source_family`
- `needs_operation_stage`
- `needs_order_or_authorization_basis`
- `needs_chronology`
- `needs_time_zone`
- `needs_force_or_unit_basis`
- `needs_casualty_or_damage_basis`
- `needs_coalition_or_host_nation_basis`
- `needs_classification_or_handling_basis`
- `needs_declassification_basis`
- `unknown`

Military/crisis validator sequence:

1. Identify every source note, editorial note, heading, footnote, chronology
   note, declassification note, or annotation that names DOD, OSD, JCS, Joint
   Staff, DIA, Defense Intelligence Agency, Situation Room, NSC Crisis
   Management Center, State NODIS/EXDIS, combat operation, military strike,
   deployment, contingency plan, CONPLAN, CVBG, USN, port visit, exercise,
   military assistance, security assistance, host-nation notification, coalition
   support, peacekeeping, casualty/damage, rules of engagement, command and
   control, logistics support, or after-action reporting.
2. Match the unit against `military_crisis_context` before directly changing
   source family, operation name, operational stage, order/authorization,
   force/unit identity, chronology, Zulu/local time, host-nation notification,
   coalition or allied role, casualty/damage claim, classification/handling, or
   declassification wording.
3. Separate source ecology from operation proof. A DOD, OSD, JCS, DIA, or
   Situation Room source family proves record custody; it does not by itself
   prove that an operation was authorized, executed, cancelled, or completed.
4. Separate policy discussion, intelligence warning, contingency planning,
   option paper, host-nation notification, execution order, executed operation,
   public statement, and after-action record. Do not move language across those
   stages merely to make prose smoother.
5. Preserve military chronology and time bases. Do not change Zulu/GMT/local
   time, date, operation window, notification sequence, or "strike underway"
   language unless the uploaded unit or registry supplies exact evidence.
6. Preserve classification, precedence, handling, paragraph markings, NODIS,
   EXDIS, Niact Immediate, Special Encryption, not-declassified references, and
   command-routing data separately from release status.
7. For coalition, allied, or host-nation references, verify whether the note
   asserts notification, consultation, support request, concurrence, basing,
   overflight, damage, or public reaction. Do not infer consent from
   notification.
8. For military-assistance and security-assistance material, coordinate with
   congressional/legal and economic/financial rules when funding, Section 506(a),
   transfer authority, equipment, ammunition, or stock diversion controls the
   claim.
9. For intelligence-derived military reporting, coordinate with sensitive-record
   rules for DIA/CIA/source-and-methods, and with declassification rules for
   handling restrictions, not-declassified references, and excised paragraphs.
10. For Bush in-preparation crisis volumes, use the status page only for
    routing and review posture. It cannot prove a source family, operation
    name, chronology, coalition role, or document number.

Direct-edit posture:

- Safe direct edits may restore supplied military acronym punctuation, exact
  source-family labels, paragraph-marking punctuation, message precedence, or
  narrow time notation when the uploaded unit or registry supplies exact
  evidence.
- Use `comment_only` with `evidence_request: military_operation_basis` when
  operation stage, order/authorization, force/unit identity, chronology,
  time-zone basis, host-nation or coalition role, casualty/damage claim,
  military-assistance authority, source family, or Situation Room/DOD/JCS/DIA
  record identity is missing, conflicting, or inferred.
- Use `evidence_request: classification_marking` when original classification,
  paragraph marking, handling, precedence, or verified absence is the blocker.
- Use `evidence_request: declassification_status` when the blocker is
  not-declassified text, withholding, excision, release status, or sanitized
  operational detail.
- Use `evidence_request: agency_equity` when the blocker is source-and-methods,
  intelligence/law-enforcement equity, DIA/CIA basis, or sensitive operational
  attribution.
- Add a `military_crisis_operations` discrepancy to the General Editor tally
  when published or local examples vary on how much operation-stage,
  force/unit, host-nation, coalition, time-zone, contingency-plan, or
  casualty/damage detail to print, and the underlying facts are sound.

Military/crisis audit requirements:

- Count military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room,
  contingency-plan, combat-operation, coalition, host-nation, and
  casualty/damage warnings separately from sensitive-record,
  foreign/international-organization, chronology, declassification, and
  congressional/legal warnings.
- Preserve registry id, capture date, source URLs, record type, military/crisis
  actor, source family, operation or crisis, stage/role, classification or
  handling, chronology/location basis, and verification status in the audit
  report.
- Record unresolved operation-stage, order/authorization, source-family,
  force/unit, chronology, time-zone, host-nation, coalition, casualty/damage,
  classification/handling, declassification, and military-assistance authority
  warnings.

### 6.8F Human Rights, Refugees, Immigration, Humanitarian Relief, And Global-Issues Records

Global-issues annotation often looks deceptively simple because many documents
have no classification marking and many notes draw on public reports, public
health sources, international organizations, or program authorities. The checker
must not treat that material as generic policy prose. Recent Reagan Volume XLI
practice shows that human-rights reports, African famine, AIDS policy,
population policy, whaling, ozone-layer protection, law-of-the-sea issues, and
international-organization records require source-family, legal/program,
quantity, status, and public-versus-archival separation before any tracked edit
is safe.

Use a human-rights/refugee/global-issues registry when the wrapper can supply
one:

```json
{
  "human_rights_refugee_registry_id": "frus-1981-1992-human-rights-refugee-global-issues-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v41/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d1",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d37",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d51",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d214",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d220",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d276",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d350",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d355",
    "https://history.state.gov/historicaldocuments/frus1981-88v41/d358",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "humanitarian_item_id": "human-rights-source-ecology-v41",
      "unit_id": "sources-frus1981-88v41",
      "record_type": "source_ecology",
      "issue_area": "AIDS policy; human rights; African famine; international population policy; ozone-layer protection; whaling; law of the sea",
      "institution_or_actor": "State HA, HR, IO, OES, L, AID; NSC; WHO; UNICEF; UNDRO; UNEP; WMO",
      "source_family": "FRUS Volume XLI sources, including State lot files, Reagan Library NSC files, AID RG 286 records, CIA records, published sources, and international-organization material",
      "public_or_archival_basis": "published source list and official volume scope",
      "legal_or_program_basis": "varies by issue area",
      "quantity_or_metric": "",
      "stage_or_status": "published_pattern_source_ecology",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "human-rights-country-reports-0051",
      "unit_id": "document-0051",
      "record_type": "human_rights_public_report",
      "issue_area": "Annual Country Reports on Human Rights Practices",
      "institution_or_actor": "Department of State; Ambassadors; Congress; HA; HR; INR; IO; AID",
      "source_family": "Department of State, Central Foreign Policy File, D810371-0204",
      "public_or_archival_basis": "archival telegram about reports prepared for Congress",
      "legal_or_program_basis": "continuing legal requirement for country human-rights reports to Congress",
      "quantity_or_metric": "first group of reports due September 15",
      "stage_or_status": "report_preparation_and_submission",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "aids-global-policy-0037",
      "unit_id": "document-0037",
      "record_type": "aids_policy",
      "issue_area": "International effort against HIV infection",
      "institution_or_actor": "Department of State; WHO Global Programme on AIDS; federal departments and agencies",
      "source_family": "Department of State, Central Foreign Policy File, P880041-2106",
      "public_or_archival_basis": "archival Department of State paper and public Presidential Commission context",
      "legal_or_program_basis": "three-year international action plan for FY 1989-1991",
      "quantity_or_metric": "142 countries; 124,114 AIDS cases reported worldwide; FY 1989-1991 plan",
      "stage_or_status": "public_health_action_plan",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "humanitarian-third-world-hunger-0214",
      "unit_id": "document-0214",
      "record_type": "famine_policy_and_conference",
      "issue_area": "Third World hunger relief and African famine",
      "institution_or_actor": "NSC; CIA steering group; John N. McMahon",
      "source_family": "Reagan Library, Executive Secretariat, NSC NSSD File, NSSD 1-84 [US Third World Hunger Relief]",
      "public_or_archival_basis": "archival national-security study directive file",
      "legal_or_program_basis": "food-assistance policy study context",
      "quantity_or_metric": "",
      "stage_or_status": "policy_study_or_option",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "humanitarian-pl480-policy-0220",
      "unit_id": "document-0220",
      "record_type": "pl480_food_assistance",
      "issue_area": "Emergency food aid and refugee relief",
      "institution_or_actor": "AID; regional and central bureaus; inter-agency Development Coordination Committee",
      "source_family": "National Archives, RG 286, USAID/O/ADMIN/ExecSec, Box 194, ADM (Feb-May) FY 84",
      "public_or_archival_basis": "archival AID policy determination attached to State memorandum",
      "legal_or_program_basis": "PL 480 Title II emergency or refugee relief",
      "quantity_or_metric": "",
      "stage_or_status": "policy_determination_clearance",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "population-unfpa-china-0276",
      "unit_id": "document-0276",
      "record_type": "population_policy_public_controversy",
      "issue_area": "UNFPA contribution and China population program",
      "institution_or_actor": "State EAP; AID; IO; USUN; UNFPA; Senate Foreign Relations Committee",
      "source_family": "Department of State, Country Files, Miscellaneous Population Files, 1974-1992, Lot 93D393",
      "public_or_archival_basis": "archival memorandum with public and Hill controversy context",
      "legal_or_program_basis": "UNFPA contribution and abortion/forced-sterilization certification issue",
      "quantity_or_metric": "$50 million contribution for 1985-1989; prior $50 million package begun in 1980",
      "stage_or_status": "public_controversy_and_policy_guidance",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "environment-ozone-convention-0350",
      "unit_id": "document-0350",
      "record_type": "environmental_global_issue",
      "issue_area": "Convention for the Protection of the Ozone Layer",
      "institution_or_actor": "State OES; L; IO; EPA; NASA; NOAA; OMB; UNEP; WMO; Senate",
      "source_family": "Reagan Library, Papers of George P. Shultz, Environment-Ozone Layer",
      "public_or_archival_basis": "archival action memorandum and attached treaty authority materials",
      "legal_or_program_basis": "Circular 175; Article II Section 2; NEPA; Executive Orders 12498, 12291, and 12114; Paperwork Reduction Act",
      "quantity_or_metric": "estimated U.S. costs up to $60,000 annually beginning in FY 1988",
      "stage_or_status": "treaty_or_protocol_authority",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "environment-ozone-protocol-0355",
      "unit_id": "document-0355",
      "record_type": "environmental_global_issue",
      "issue_area": "Montreal Protocol negotiation authority",
      "institution_or_actor": "State OES; L; IO; EPA; NASA; NOAA; Commerce; USTR; DPC; CEQ; DOE; OMB",
      "source_family": "Reagan Library, Bledsoe, Ralph: Files, 330-Stratospheric Ozone (1985 to June 1987)",
      "public_or_archival_basis": "archival memorandum authorizing protocol negotiations",
      "legal_or_program_basis": "Vienna Convention protocol negotiation authority",
      "quantity_or_metric": "",
      "stage_or_status": "treaty_or_protocol_authority",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "environment-ozone-negotiation-0358",
      "unit_id": "document-0358",
      "record_type": "environmental_global_issue",
      "issue_area": "Ozone-layer protocol negotiations",
      "institution_or_actor": "USUN Environmental Mission; EC; GATT; UNEP",
      "source_family": "Reagan Library, Bledsoe, Ralph: Files, 330-Stratospheric Ozone (1985 to June 1987)",
      "public_or_archival_basis": "archival telegram from USUN Environmental Mission",
      "legal_or_program_basis": "trade and treaty negotiation context",
      "quantity_or_metric": "",
      "stage_or_status": "environmental_negotiation",
      "verification_status": "verified"
    },
    {
      "humanitarian_item_id": "status-refugee-global-issues-1981-1992",
      "unit_id": "status-of-series-global-issues",
      "record_type": "status_page_family_context",
      "issue_area": "Reagan Refugees and Immigration; Bush Global Issues",
      "institution_or_actor": "History Office Status of the Series",
      "source_family": "official status page",
      "public_or_archival_basis": "status routing context only",
      "legal_or_program_basis": "",
      "quantity_or_metric": "",
      "stage_or_status": "routing_and_review_posture_only",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `source_ecology`
- `human_rights_public_report`
- `human_rights_sanctions`
- `human_rights_condition_or_waiver`
- `public_report_or_country_report`
- `famine_policy_and_conference`
- `refugee_relief_and_food_assistance`
- `immigration_or_asylum_policy`
- `migration_and_refugee_assistance`
- `pl480_food_assistance`
- `aids_policy`
- `population_policy_public_controversy`
- `environmental_global_issue`
- `international_organization_relief`
- `pvo_relief`
- `status_page_family_context`
- `unknown`

Allowed `stage_or_status` values:

- `published_pattern_source_ecology`
- `report_preparation_and_submission`
- `policy_recommendation_or_approval`
- `policy_study_or_option`
- `policy_determination_clearance`
- `sanctions_imposed`
- `sanctions_lifted`
- `condition_or_waiver_pending`
- `relief_recommendations_approved`
- `aid_program_planning`
- `public_health_action_plan`
- `public_controversy_and_policy_guidance`
- `treaty_or_protocol_authority`
- `environmental_negotiation`
- `international_program_coordination`
- `policy_agreement_and_public_conference_context`
- `routing_and_review_posture_only`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_report_basis`
- `needs_legal_or_program_authority`
- `needs_amount_or_metric`
- `needs_country_or_population_scope`
- `needs_public_source`
- `needs_archival_basis`
- `needs_international_org_basis`
- `needs_pvo_basis`
- `needs_sanctions_or_waiver_basis`
- `needs_stage_status`
- `unknown`

Human-rights/refugee/global-issues validator sequence:

1. Identify every source note, editorial note, follow-on footnote, heading,
   public-source note, legal note, financial note, or annotation that names human
   rights, Country Reports, refugees, immigration, asylum, migration, famine,
   emergency relief, food aid, PL 480, Section 416, Section 206, WFP, PVO, AID,
   PRM, HA, HR, IO, WHO, UNICEF, UNDRO, UNEP, WMO, sanctions, waiver,
   certification, determination, public report, AIDS, HIV, population policy,
   UNFPA, environment, ozone, whaling, or global issues.
2. Match the unit against `human_rights_refugee_context` before directly changing
   report status, country or population scope, amount, tonnage, program authority,
   agency or bureau acronym, international-organization role, sanctions/waiver
   status, public-report basis, source family, or stage/status language.
3. Separate source ecology from issue proof. A Volume XLI source-list entry proves
   that a family of records appears in the volume; it does not prove a specific
   country report, legal condition, refugee status, relief approval, population
   program decision, environmental treaty stage, or public-health metric.
4. Separate public reports from archival control copies. Human-rights country
   reports, CDC/WHO/AIDS publications, White House press briefings, Department of
   State Bulletin items, and newspaper excerpts may be selected evidence, public
   context, or a source cited inside an editorial note. Do not collapse those
   roles.
5. Separate report preparation, report transmission, report publication, hearing
   use, sanctions decision, waiver/certification, aid planning, and aid approval.
   Do not upgrade a preparatory memorandum into a published report or approved
   policy.
6. Preserve legal and program authorities exactly when supplied: PL 480 Title II,
   Section 416, Section 206, Migration and Refugee Assistance, Presidential
   Determination, certification, Country Reports, Circular 175, Article II Section
   2, NEPA, Executive Orders, or program-specific appropriation language.
7. Preserve quantities and metrics exactly. Do not change dollars, tonnage,
   fiscal years, country counts, case counts, date/deadline language, or program
   periods unless the uploaded unit or registry supplies the exact correction.
8. Verify international organizations and PVOs as actors, sources, recipients, or
   program channels. WFP, WHO, UNICEF, UNDRO, UNEP, WMO, UNFPA, EC, GATT, and
   PVOs are not interchangeable, and a public organization name does not prove a
   source path.
9. For refugee, migration, asylum, famine, and emergency-relief material, verify
   the affected population, country/region, program channel, approval status,
   monitoring condition, and source basis before polishing language.
10. For sanctions, conditions, waivers, and certifications, coordinate with the
    congressional/legal rules and do not infer imposed, lifted, waived, pending,
    or certified status from neighboring documents.
11. For amounts, food-aid tonnage, budget years, international assessments, trust
    funds, contributions, and table data, coordinate with the economic/financial
    rules.
12. For public reports, press coverage, official publications, and public-health
    publications, coordinate with the public-source rules.
13. For international-organization records, conferences, treaty parties, and
    convention/protocol material, coordinate with the foreign/international and
    treaty/legal-instrument rules.
14. Use the status page only for routing and review posture for Reagan Refugees
    and Immigration, Bush Global Issues, or other in-preparation global-issues
    families. It cannot prove document numbers, source families, program
    authority, or record-stage facts.

Direct-edit posture:

- Safe direct edits may restore exact supplied acronyms, capitalization, program
  labels, source-family labels, date/deadline forms, or units such as FY, MT,
  WHO/GPA, UNFPA, PL 480, Section 416, Section 206, PRM, PVO, WFP, UNEP, WMO, and
  AID when the uploaded unit or registry supplies the evidence.
- Use `comment_only` with `evidence_request: humanitarian_rights_basis` when a
  report basis, country/population scope, refugee or asylum status, relief stage,
  program authority, amount/metric, public/archival basis, sanctions/waiver
  status, international-organization role, PVO role, or status-page family
  context is missing, conflicting, or inferred.
- Use `evidence_request: legal_authority` when the blocker is the statute,
  regulation, Presidential Determination, certification, Circular 175 authority,
  Executive Order, treaty authority, report-to-Congress duty, condition, waiver,
  or Senate/congressional basis.
- Use `evidence_request: financial_data` when the blocker is a dollar amount,
  tonnage, fiscal year, contribution, trust fund, assessment, table, budget, or
  aid-program metric.
- Use `evidence_request: public_source_basis` when the blocker is a public report,
  CDC/WHO publication, White House press briefing, newspaper item, Public Papers
  citation, official transcript, or public-versus-archival selection status.
- Use `evidence_request: foreign_org_basis` when the blocker is WFP, WHO, UNICEF,
  UNDRO, UNEP, WMO, UNFPA, EC, GATT, PVO, regional-body, conference, or treaty
  party role.
- Add a `human_rights_refugee_global_issues` discrepancy to the General Editor
  tally when published or local examples vary on how much report basis, program
  authority, amount/metric, public-source, international-organization,
  country/population, sanctions/waiver, public-health, population-policy, or
  environmental treaty detail to print, and the underlying facts are sound.

Human-rights/refugee/global-issues audit requirements:

- Count human-rights, refugee, immigration, asylum, migration, famine, emergency
  relief, food-aid, public-health, population, environmental, global-issues,
  sanctions, waiver, certification, public-report, international-organization,
  PVO, AID, PRM, and PL 480 warnings separately from public-source,
  congressional/legal, economic/financial, foreign/international-organization,
  treaty, military/crisis, and sensitive-record warnings.
- Preserve registry id, capture date, source URLs, record type, issue area,
  institution or actor, source family, public or archival basis, legal or program
  basis, quantity or metric, stage/status, and verification status in the audit
  report.
- Record unresolved report basis, legal/program authority, amount/metric,
  country/population scope, public-source basis, archival basis, international-
  organization role, PVO role, sanctions/waiver basis, and stage/status warnings.

### 6.9 Interagency, Foreign-Government, International-Organization, And Multilateral Records

Foreign-government and international-organization annotation can be source
provenance, selected public text, meeting venue, treaty party, diplomatic actor,
policy subject, conference setting, financial institution, coalition context, or
translation problem. The checker must not flatten those different roles into a
generic "foreign source" or a generic U.S. archival source note.

Use a foreign/international-organization registry when the wrapper can supply
one:

```json
{
  "foreign_international_org_registry_id": "frus-1981-1992-foreign-international-organization-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1981-88v01/sources",
    "https://history.state.gov/historicaldocuments/frus1981-88v01/d169",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d177",
    "https://history.state.gov/historicaldocuments/frus1981-88v38/d267",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d91",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/preface",
    "https://history.state.gov/historicaldocuments/status-of-the-series"
  ],
  "records": [
    {
      "foreign_org_item_id": "foreign-org-un-source-list-v01",
      "unit_id": "sources-frus1981-88v01",
      "record_type": "published_international_organization_source",
      "body_or_actor": "United Nations",
      "role_in_unit": "published source ecology",
      "source_or_copy_basis": "Volume source list cites Public Papers of the Secretaries-General of the United Nations, UN conference reports, General Assembly official records, and Yearbook of the United Nations",
      "selected_or_supplemental": "published_source_ecology",
      "translation_or_copy_status": "not applicable",
      "treaty_or_conference_context": "UN General Assembly and UN conference publications",
      "verification_status": "verified"
    },
    {
      "foreign_org_item_id": "foreign-org-un-address-0169",
      "unit_id": "document-0169",
      "record_type": "international_organization_public_address",
      "body_or_actor": "United Nations General Assembly; NATO Special Consultative Group; Organization of American States; Contadora group",
      "role_in_unit": "venue, policy subject, and public-source context",
      "source_or_copy_basis": "Public Papers: Reagan, 1983, Book II, pages 1350-1354; diary and radio-address context supplied in note",
      "selected_or_supplemental": "selected_public_document_with_international_organization_context",
      "translation_or_copy_status": "not applicable",
      "treaty_or_conference_context": "38th Session of the United Nations General Assembly",
      "verification_status": "verified"
    },
    {
      "foreign_org_item_id": "foreign-org-imf-worldbank-0177",
      "unit_id": "document-0177",
      "record_type": "international_financial_institution_event",
      "body_or_actor": "International Monetary Fund; World Bank Group; finance ministers; central bank governors",
      "role_in_unit": "meeting context and policy actor",
      "source_or_copy_basis": "Reagan Library Roger Robinson Files; memorandum on IMF/World Bank annual meetings",
      "selected_or_supplemental": "selected_u_s_archival_record_about_international_organization",
      "translation_or_copy_status": "not applicable",
      "treaty_or_conference_context": "IMF/World Bank annual meetings, Washington, September 24-27, 1984",
      "verification_status": "verified"
    },
    {
      "foreign_org_item_id": "foreign-org-mdb-imf-0267",
      "unit_id": "document-0267",
      "record_type": "multilateral_development_bank_policy",
      "body_or_actor": "Multilateral development banks; IMF; IBRD; World Bank Group",
      "role_in_unit": "policy subject, budget target, and meeting context",
      "source_or_copy_basis": "Reagan Library Richard Darman Files, Cabinet Council on Economic Affairs minutes",
      "selected_or_supplemental": "selected_u_s_archival_record_about_international_organization",
      "translation_or_copy_status": "not applicable",
      "treaty_or_conference_context": "World Bank Group and International Monetary Fund annual meeting",
      "verification_status": "verified"
    },
    {
      "foreign_org_item_id": "foreign-org-gorbachev-letter-0091",
      "unit_id": "document-0091",
      "record_type": "foreign_government_leader_correspondence",
      "body_or_actor": "Soviet President Gorbachev; Soviet Government",
      "role_in_unit": "foreign-government selected document",
      "source_or_copy_basis": "George H.W. Bush Library, Brent Scowcroft Collection, Special Separate USSR Notes Files",
      "selected_or_supplemental": "selected_foreign_government_document_in_u_s_files",
      "translation_or_copy_status": "printed from copy marked unofficial translation",
      "treaty_or_conference_context": "START I U.S.-Soviet strategic arms negotiations",
      "verification_status": "verified"
    },
    {
      "foreign_org_item_id": "foreign-org-lisbon-protocol-preface",
      "unit_id": "preface-frus1989-92v31",
      "record_type": "foreign_successor_state_treaty_context",
      "body_or_actor": "Belarus; Ukraine; Kazakhstan; Soviet Union; Russia",
      "role_in_unit": "foreign treaty-party and cross-volume scheduling context",
      "source_or_copy_basis": "START I preface explains Soviet dissolution and scheduled Lisbon Protocol coverage",
      "selected_or_supplemental": "volume_scope_and_cross_volume_context",
      "translation_or_copy_status": "not applicable",
      "treaty_or_conference_context": "Lisbon Protocol to START I and Senate advice-and-consent posture",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `record_type` values:

- `foreign_government_original`
- `foreign_government_leader_correspondence`
- `foreign_successor_state_treaty_context`
- `embassy_held_foreign_copy`
- `unofficial_translation_foreign_document`
- `international_organization_public_address`
- `published_international_organization_source`
- `international_organization_resolution`
- `international_organization_report`
- `international_financial_institution_event`
- `multilateral_development_bank_policy`
- `regional_organization_context`
- `alliance_consultation`
- `coalition_record`
- `peacekeeping_context`
- `conference_record`
- `joint_paper`
- `treaty_depositary_or_party_context`
- `unknown`

Allowed `role_in_unit` values:

- `selected_foreign_government_document`
- `selected_foreign_government_document_in_u_s_files`
- `selected_international_organization_publication`
- `selected_u_s_archival_record_about_international_organization`
- `published_source_ecology`
- `venue`
- `policy_subject`
- `meeting_context`
- `treaty_party`
- `depositary_or_ratification_context`
- `coalition_or_alliance_context`
- `translation_or_copy_context`
- `cross_volume_context`
- `unknown`

Allowed `selected_or_supplemental` values:

- `published_source_ecology`
- `selected_public_document_with_international_organization_context`
- `selected_u_s_archival_record_about_international_organization`
- `selected_foreign_government_document_in_u_s_files`
- `volume_scope_and_cross_volume_context`
- `supplemental_context`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_foreign_copy_basis`
- `needs_translation_status`
- `needs_publication_details`
- `needs_organization_identity`
- `needs_body_role`
- `needs_concurrence_basis`
- `needs_treaty_party_status`
- `needs_conference_or_meeting_basis`
- `needs_cross_volume_status`
- `unknown`

Foreign/international-organization validator sequence:

1. Identify every source note, editorial note, heading, treaty note,
   translation note, source-list entry, Persons/abbreviations item, or
   annotation that names a foreign government, successor state, international
   organization, regional body, alliance, coalition, conference, financial
   institution, peacekeeping force, treaty party, depositary, or foreign copy.
   Typical triggers include United Nations, General Assembly, Secretary-General,
   NATO, OAS, Contadora, CSCE, IMF, World Bank, IBRD, MDB, GATT, OECD, G-7,
   G-77, Warsaw Pact, Soviet Union, Russia, Ukraine, Belarus, Kazakhstan, and
   foreign ministry or embassy copies.
2. Match the unit against `foreign_international_org_context` before directly
   changing organization name, country/successor-state identity, body role,
   copy provenance, translation status, concurrence claim, treaty-party status,
   meeting/conference title, publication title, or selected-versus-supplemental
   status.
3. Separate selected source identity from subject matter. A U.S. archival
   memorandum about the IMF, World Bank, NATO, or UN remains a U.S. archival
   record unless an international-organization publication or foreign copy is
   the selected source.
4. Separate venue from actor. A speech at the United Nations or an IMF/World
   Bank annual meeting does not by itself make the UN, IMF, or World Bank the
   source of the document.
5. Preserve exact body names and abbreviations. Do not collapse World Bank
   Group, IBRD, MDBs, IMF, United Nations General Assembly, NATO Special
   Consultative Group, OAS, Contadora, CSCE, or successor states into generic
   "international organization" wording when the evidence supplies the precise
   body.
6. For foreign-government documents in U.S. files, identify copy and
   translation status before rewriting. Coordinate with the translation registry
   for official, unofficial, informal, foreign-origin, typed-signature, and
   facsimile claims.
7. For treaty or protocol context, coordinate with treaty and congressional/legal
   validators before changing treaty party, ratification, Senate
   advice-and-consent, depositary, Lisbon Protocol, successor-state, or
   scheduled-publication language.
8. For international-organization publications, require publication details,
   document symbol, supplement number, report title, session, date span, and
   issuing body when those facts affect citation form.
9. For alliance, coalition, peacekeeping, or regional-organization context,
   distinguish selected records from policy descriptions and public remarks.
   Do not infer concurrence, approval, membership position, or operational role
   from a passing reference to the body.
10. Coordinate with event chronology for conferences, annual meetings, General
    Assembly sessions, summit meetings, and peacekeeping events; with
    public-source rules for speeches and published texts; and with economic/
    financial rules for international financial institutions.

Direct-edit posture:

- Safe direct edits may restore supplied organization acronyms, exact body
  names, source-title punctuation, or narrow copy-provenance wording when the
  uploaded unit or registry supplies exact evidence.
- Use `comment_only` with `evidence_request: foreign_org_basis` when foreign
  copy basis, organization identity, body role, concurrence, translation status,
  treaty-party status, meeting/conference identity, publication details,
  source-versus-subject status, or cross-volume successor-state context is
  missing, conflicting, or inferred.
- Use `evidence_request: translation_status` when the blocker is official,
  unofficial, informal, typed-signature, original-language, or foreign-origin
  translation treatment.
- Use `evidence_request: treaty_component` or `legal_authority` when the
  blocker is treaty-party status, ratification, Senate advice-and-consent,
  protocol coverage, depositary status, or statutory/oversight authority.
- Add a `foreign_international_organization` discrepancy to the General Editor
  tally when published or local examples vary on how much foreign-copy,
  international-organization, regional-body, treaty-party, or multilateral
  context to print, and the underlying facts are sound.

Foreign/international-organization audit requirements:

- Count foreign-government, international-organization, multilateral, alliance,
  coalition, peacekeeping, and conference warnings separately from translation,
  treaty, economic/financial, public-source, and event warnings.
- Preserve registry id, capture date, source URLs, record type, body/actor,
  role in unit, source or copy basis, selected/supplemental status, translation
  or copy status, treaty/conference context, and verification status in the
  audit report.
- Record unresolved foreign-copy, translation-status, organization-identity,
  body-role, concurrence, treaty-party, conference/meeting, publication-detail,
  and cross-volume-status warnings.

### 6.9A Translation And Foreign-Origin Copy Registry Validation

Use a translation and foreign-origin registry when the wrapper can supply one.
Published Reagan and Bush examples distinguish official Department of State
Language Services translations, Division of Language Services translations,
unofficial translations, informal translations transmitted in telegrams,
foreign-government originals, embassy-held copies, and copies bearing typed
signatures. These are evidence facts, not decorative wording.

Minimum translation and foreign-origin registry:

```json
{
  "translation_registry_id": "frus-1981-1992-translation-foreign-origin-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d49",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d91",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/ch8",
    "https://history.state.gov/historicaldocuments/frus1981-88v24/d290"
  ],
  "records": [
    {
      "translation_item_id": "translation-source-0001",
      "unit_id": "source-note-0049",
      "document_language": "[original language if supplied]",
      "translation_status": "unofficial_translation",
      "translation_source": "typed notation on the source document",
      "source_phrase": "A typed notation at the top of the letter reads \"Unofficial translation.\"",
      "foreign_origin": "Soviet",
      "copy_basis": "Bush Library copy",
      "signature_or_facsimile_status": "",
      "bracket_treatment": "",
      "agency_or_foreign_equity": "foreign-government document",
      "verification_status": "verified"
    },
    {
      "translation_item_id": "translation-source-0002",
      "unit_id": "source-note-0224",
      "document_language": "[original language if supplied]",
      "translation_status": "official_state_language_services",
      "translation_source": "Department of State Language Services",
      "source_phrase": "Printed from the official translation of the Department of State Language Services.",
      "foreign_origin": "Soviet",
      "copy_basis": "Department of State lot file",
      "signature_or_facsimile_status": "",
      "bracket_treatment": "",
      "agency_or_foreign_equity": "foreign-government document",
      "verification_status": "verified"
    },
    {
      "translation_item_id": "translation-source-0003",
      "unit_id": "source-note-0290",
      "document_language": "[original language if supplied]",
      "translation_status": "division_language_services_translation",
      "translation_source": "Division of Language Services, Department of State",
      "source_phrase": "Printed from a translation, dated November 13, prepared in the Division of Language Services, Department of State.",
      "foreign_origin": "Tunisian",
      "copy_basis": "Reagan Library copy",
      "signature_or_facsimile_status": "",
      "bracket_treatment": "Brackets are in the original.",
      "agency_or_foreign_equity": "foreign-government document",
      "verification_status": "verified"
    }
  ]
}
```

Allowed `translation_status` values:

- `official_state_language_services`
- `division_language_services_translation`
- `unofficial_translation`
- `informal_translation`
- `editor_transcription`
- `source_language_original`
- `translated_excerpt`
- `not_a_translation`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_translation_basis`
- `needs_language_confirmation`
- `needs_foreign_copy_provenance`
- `needs_agency_or_foreign_equity`
- `unknown`

Translation and foreign-origin validator sequence:

1. Identify every source note, heading, editorial note, attachment note, caption,
   appendix item, source-list entry, or follow-on footnote that asserts
   translation, original language, foreign origin, foreign-government
   provenance, embassy-held copy status, typed signature, facsimile status,
   bracket treatment, translator note, or foreign/international-organization
   equity.
2. Match the unit against `translation_registry_context` before proposing a
   direct edit to translation or foreign-origin language.
3. Preserve the difference between an official translation, an unofficial
   translation, an informal translation, a translation prepared by the Division
   or Department of State Language Services, an editor transcription, and a
   translated excerpt embedded in an annotation.
4. Preserve selected-source identity. Do not replace a foreign-government
   original, treaty text, public source, or embassy-held copy with a generic
   U.S. archival source if that foreign or translated source is the printed
   document.
5. Do not infer original language, translator, translation office, typed
   signature, facsimile status, or foreign-government concurrence from country,
   sender, addressee, or topic alone.
6. Coordinate with the attachment registry when annexes, attachments, or
   translated enclosures are attached but not printed, and with the
   declassification registry when translation notes are adjacent to omissions
   or brackets.
7. Coordinate with authority-control checks for transliterated names, titles,
   offices, geographic terms, and foreign institution names.
8. Treat variations in whether translation language appears in the source note,
   caption, heading, or follow-on footnote as possible General Editor
   discrepancies when the underlying translation fact is verified.

Flag these issues:

- Translation status is missing where the source note prints a translated
  foreign-origin document.
- `Official`, `unofficial`, `informal`, `editor-transcribed`, and
  Language-Services translation language is used interchangeably.
- Foreign-origin provenance, embassy-held copy status, or selected-source
  identity is flattened into a generic U.S. archival path.
- Typed-signature, facsimile, copy, or bracket-treatment claims are made without
  source-image or registry support.
- A translated excerpt in an annotation is treated as if the full document is
  printed in translation.
- Foreign-government concurrence, agency equity, or international-organization
  provenance is asserted without evidence.

Direct-edit posture:

- Safe direct edits may restore a supplied translation phrase, foreign-origin
  phrase, or typed-signature note when the registry supplies the exact
  replacement and the Word anchor is exact.
- Use `comment_only` with `evidence_request: translation_status` when language,
  translator, translation office, official/unofficial status, copy basis,
  typed-signature status, bracket treatment, or foreign-origin provenance is
  missing, conflicting, or inferred.
- Do not directly add `official translation`, `unofficial translation`,
  `translated by`, `printed from a translation`, or foreign-government
  concurrence unless the uploaded unit or registry supplies the evidence.
- Do not edit transcribed document text to standardize translation wording
  unless the user has explicitly requested transcription review.

Translation and foreign-origin audit requirements:

- Count missing translation status, uncertain original language, unsupported
  official/unofficial claims, foreign-origin provenance issues, typed-signature
  or facsimile issues, and foreign/agency-equity warnings separately from
  ordinary source-note issues.
- Preserve the translation registry id, capture date, source URLs,
  source-phrase basis, and unresolved language/copy/equity fields in the audit
  report.
- Add `translation_foreign_origin` discrepancies to the General Editor tally
  when published or local examples vary on where to place translation language,
  how to phrase official versus unofficial translation status, or how much
  foreign-copy provenance to print.

### 6.10 Treaty Transmittal Packages And State STARS

Rules:

- Preserve distinctions between treaty text, protocols, annexes, memoranda of
  understanding, executive agreements, letters, declarations, statements,
  correspondence, presidential messages, and article-by-article analyses.
- Distinguish documents integral to a treaty from documents associated with, but
  not integral parts of, a treaty.
- For State STARS records, check for the STARS identifier, original
  classification marking or verified absence of one, drafter, clearance chain,
  and attachment status.
- Use Public Papers citations for presidential address, treaty transmittal,
  Senate ratification, and entry into force only as annotation unless the public
  text itself is the selected document.

Flag these issues:

- Annotation collapses integral treaty documents and associated-but-not-integral
  documents.
- STARS source note omits available drafter, clearance chain, or attachment
  information.
- Public Papers citations are used as the source note for an internal treaty
  package when the archival control copy is available.
- Attached treaty text, analyses, associated documents, or proposed presidential
  message are not identified when the source note shows they were present but
  not printed.

Use a treaty/legal-instrument registry when the wrapper can supply one:

```json
{
  "treaty_registry_id": "frus-1981-1992-treaty-legal-instruments-2026-06-03",
  "captured_at": "2026-06-03",
  "source_urls": [
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d246",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d247",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d244",
    "https://history.state.gov/historicaldocuments/frus1989-92v31/d242"
  ],
  "records": [
    {
      "treaty_item_id": "treaty-start-0001",
      "unit_id": "source-note-0246",
      "instrument_family": "START I",
      "component_type": "treaty_text",
      "component_title": "Treaty Between the United States of America and the Union of Soviet Socialist Republics on the Reduction and Limitation of Strategic Offensive Arms",
      "integral_to_treaty": true,
      "associated_but_not_integral": false,
      "source_phrase": "Department of State Dispatch Supplement, October 1991, Vol. 2, Supplement No. 5, pp. 1-16.",
      "related_components": [
        "Annex on Agreed Statements",
        "Protocol on Notifications",
        "Memorandum of Understanding on the Establishment of the Data Base"
      ],
      "public_or_archival_basis": "published treaty text",
      "senate_or_ratification_status": "ratified and entered into force if supplied by annotation",
      "verification_status": "verified"
    },
    {
      "treaty_item_id": "treaty-start-0002",
      "unit_id": "editorial-note-0247",
      "instrument_family": "START I",
      "component_type": "presidential_transmittal",
      "component_title": "Report to the Senate on START I",
      "integral_to_treaty": false,
      "associated_but_not_integral": true,
      "source_phrase": "Article-by-Article Analysis of the Treaty, including its Protocols, Annexes, and Memorandum of Understanding",
      "related_components": [
        "other agreements",
        "letters",
        "statements associated with the Treaty"
      ],
      "public_or_archival_basis": "Public Papers or Senate transmittal context",
      "senate_or_ratification_status": "transmitted to Senate, ratified, entered into force",
      "verification_status": "needs_public_source"
    }
  ]
}
```

Allowed `component_type` values:

- `treaty_text`
- `protocol`
- `annex`
- `memorandum_of_understanding`
- `executive_agreement`
- `letter`
- `declaration`
- `joint_statement`
- `unilateral_statement`
- `presidential_message`
- `presidential_transmittal`
- `article_by_article_analysis`
- `senate_ratification_note`
- `entry_into_force_note`
- `associated_correspondence`
- `negotiating_record`
- `unknown`

Allowed `verification_status` values:

- `verified`
- `needs_source_image`
- `needs_component_identity`
- `needs_public_source`
- `needs_ratification_status`
- `needs_integral_status`
- `unknown`

Treaty/legal-instrument validator sequence:

1. Identify every source note, editorial note, attachment note, document heading,
   caption, source-list entry, or follow-on footnote that names a treaty,
   protocol, annex, memorandum of understanding, executive agreement, letter,
   declaration, joint or unilateral statement, article-by-article analysis,
   presidential transmittal, Senate ratification, entry into force, or related
   negotiating record.
2. Match the unit against `treaty_registry_context` before proposing a direct
   edit to component identity, integral status, public-source basis, or
   ratification language.
3. Preserve the distinction between treaty text and materials integral to the
   treaty, such as protocols, annexes, and memoranda of understanding, and
   associated-but-not-integral materials, such as related agreements, letters,
   declarations, public statements, correspondence, and transmittal material.
4. Do not convert a public treaty text, Department of State Dispatch supplement,
   Public Papers citation, Senate transmittal, or official treaty source into an
   archival source note unless the archival control copy is the selected
   document.
5. Do not assert ratification, entry-into-force, transmission to the Senate, or
   public-law/legal status without a supplied public-source or registry basis.
6. Coordinate with attachment and cross-reference registries when treaty texts,
   annexes, protocols, article-by-article analyses, presidential messages, or
   proposed letters are attached but not printed, printed elsewhere, or
   scheduled for publication.
7. Coordinate with translation and classification registries for bilingual
   treaty texts, official translations, public unclassified treaty text, and
   classified internal negotiating records.
8. Treat variations in how much treaty-component detail to print in a source
   note as possible General Editor discrepancies when the component identity is
   verified but house form is unsettled.

Direct-edit posture:

- Safe direct edits may restore a supplied component type or narrow treaty-title
  punctuation only when the exact component identity and source phrase are in
  the registry or uploaded unit.
- Use `comment_only` with `evidence_request: treaty_component` when the
  component type, integral status, related component list, public-source basis,
  or ratification/entry-into-force status is missing, conflicting, or inferred.
- Use `evidence_request: cross_reference` or `document_number` when the issue is
  where an associated treaty document is printed.
- Use `evidence_request: publication_status` when the issue is whether a treaty
  component or related volume/chapter is published or still scheduled.
- Do not directly add legal status, integral status, ratification, or entry into
  force unless the uploaded unit or registry supplies the proof.

Treaty/legal-instrument audit requirements:

- Count treaty-component identity issues, integral-versus-associated status
  issues, public-source/archival-basis conflicts, ratification/entry-into-force
  warnings, and attached-but-not-printed treaty-package warnings separately.
- Preserve the treaty registry id, capture date, source URLs, source-phrase
  basis, and unresolved component fields in the audit report.
- Add `treaty_legal_instrument` discrepancies to the General Editor tally when
  published or local examples vary on how much component detail to include, how
  to identify associated letters/declarations/statements, or where to place
  ratification and entry-into-force language.

### 6.10A Bush START I Volume XXXI Corpus Rules

The local file `reports/frus1989-92v31-annotation-corpus.md` records a derived
all-document pass over Documents 1-247. Use it as pattern evidence when checking
Bush START annotations.

Corpus facts to apply:

- Coverage: 247 documents parsed, 875 footnotes detected, 239 documents with
  source notes, and 8 editorial notes without source notes.
- Dominant source families: Department of State lot/Executive Secretariat files,
  Department of State Central Foreign Policy File, Bush Scowcroft files, Bush
  NSC H-Files, Bush NSC staff files, State STARS, Gates files, Bush Vice
  Presidential Records, and public/printed treaty source.
- Common follow-on patterns: same-volume `See Document`, `Not found`,
  scheduled-publication notes, no-minutes notes, attached-but-not-printed notes,
  original-bracket notes, full-memcon-elsewhere notes, printed-as-document
  notes, and telegram reference notes.
- Common source-note evidence: copy/draft/original/signed status, drafting or
  clearance, meeting location, read-by or marginalia evidence, no classification
  marking, Daily Diary support, and Public Papers supplementation.

Checker behavior:

- When the user uploads a Bush START annotation draft, compare the annotation's
  claimed source family and note function to the corpus pattern before
  proposing a replacement.
- Prefer `comment_only` if a note appears to need a missing OA/ID, lot number,
  telegram identifier, STARS number, folder title, or cross-volume document
  number that is not present in the uploaded context.
- Do not "regularize" all notes into one template. Volume XXXI uses distinct
  patterns for H-Files directives, State lot-file memoranda, CFPF telegrams,
  Scowcroft/Gates/staff files, STARS action records, public treaty text, and
  editorial notes.
- Treat document-number cross-references as the normal FRUS citation unit. Flag
  page-only references when a document number is available.
- Check whether marginalia, read-by evidence, routing, and drafting belong in
  the source note or a follow-on note; do not move them into transcribed
  document text.

### 6.10B Reagan XLIV Part 1 Corpus Rules

The local file `reports/frus1981-88v44p1-annotation-corpus.md` records a
derived all-document pass over Documents 1-294 plus Appendix Document A. Use it
as pattern evidence when checking Reagan national security policy annotations.

Corpus facts to apply:

- Coverage: 294 numbered documents parsed, Appendix A parsed, 1,154 footnotes
  detected in numbered documents, 1,155 footnotes detected including the
  appendix, 279 numbered documents with source notes, and 15 editorial notes
  without source notes.
- Dominant source families: NSC Institutional/Executive Secretariat files,
  Reagan Library staff/subject files, Department of State lot/Executive
  Secretariat files, Library of Congress/private papers, PROFS, Shultz/Hoover
  copies, Bush transition records, CFPF, W Files, System IV, President's Daily
  Diary/schedule records, and DOD/OSD/WNRC/JCS/agency records.
- Common follow-on patterns: same-volume `See Document`, attached-but-not-
  printed notes, `See footnote [n], Document [n]`, printed-as-document notes,
  no-minutes notes, not-found notes, original-bracket notes,
  scheduled-publication notes, not-found-attached notes, participant-list notes,
  appendix cross-references, and tabs-printed notes.
- Common source-note evidence: copy/draft/original/signed status, marginalia or
  read-by evidence, NSDD/annex/tab context, NSPG/NSC meeting context, paragraph
  classification markings, drafting or clearance, meeting location, RAC/source
  form cautions, no classification marking, and Daily Diary support.

Checker behavior:

- Do not "fix" Reagan XLIV citations by flattening special source forms. Preserve
  `PROFS`, `W Files`, `System IV Intelligence Files`, `RAC` context, NSC
  Washington institutional files, and Bush transition record paths when those
  are the control-copy evidence.
- For NSDDs and directive packages, check the parent document, annex, tabs,
  cover memorandum, distribution list, paragraph markings, and special-access
  markings separately. Do not assume the annex classification matches the parent
  directive.
- For NSPG and NSC minutes, check meeting time/place, participant treatment,
  matrices or briefing boards, attached tabs, and paragraph classification
  markings. Do not infer a participant list from a tab reference.
- Treat `No minutes were found`, `Not found`, and `Not found attached` as
  separate claims. Require diary, schedule, or search context for no-minutes
  notes.
- For Appendix A and handwritten-note material, preserve the two-way
  relationship between appendix image/facsimile and transcribed document.
- Prefer `comment_only` when a proposed correction would require a missing box,
  folder, PROFS identifier, W-file identifier, System IV source path, RAC scan
  status, appendix image reference, or cross-volume document number.

### 6.10C Reagan Volumes Published Since 2021 Corpus Rules

The local files `reports/frus-reagan-since-2021-volume-inventory.md`,
`reports/frus-reagan-since-2021-annotation-corpus.md`, and
`reports/frus-reagan-since-2021-annotation-corpus.json` record a derived pass
over the Reagan-era FRUS volumes published from 2021 through 2025: Volume IV
Soviet Union, January 1983-March 1985; Volume XI START I; Volume I Foundations
of Foreign Policy; Volume X Eastern Europe; Volume XXXVIII International
Economic Development; International Debt; Foreign Assistance; Volume XXIV North
Africa; and Volume XLIV, Part 1 National Security Policy, 1985-1988.

Corpus facts to apply:

- Coverage: 7 volumes, 2,630 numbered documents, 16 appendix records, 2,509
  records with source notes, 11,258 detected footnotes, and 0 parse errors.
- Official publication scope: selected volumes are 2021 or later. Older Reagan
  EPUBs with later ebook generation dates are excluded unless their official
  publication year is 2021 or later.
- Dominant source families: Reagan Library staff/subject/directorate files,
  Reagan Library NSC Institutional/Executive Secretariat files, Department of
  State lot/Executive Secretariat/office files, Department of State Central
  Foreign Policy File, Shultz/Hoover/private copies, DOD/OSD/WNRC/JCS/agency
  records, Library of Congress/private papers, PROFS/electronic messages, System
  IV Intelligence Files, Bush/Carter/other Presidential records, public/printed
  sources, W Files, and economic/assistance agency records.
- Common follow-on patterns: `See Document [n].`, telegram-reference notes,
  `See footnote [n], Document [n].`, attached-but-not-printed notes, `Not
  found.`, scheduled-publication notes, original-bracket notes,
  printed-as-document notes, no-minutes notes, appendix/transcribed-copy
  cross-references, not-found-attached notes, tabs-printed notes, and
  participant-list-not-printed notes.
- Common source-note evidence: classification/handling, copy/draft/original
  status, sent-for-action/information routing, drafting/clearance, read-by
  stamps, marginalia, Reagan initials, Daily Diary/schedule support,
  declassification/RAC/NLR identifiers, paragraph classification markings,
  appendix facsimile references, and cross-volume scheduling.

Checker behavior:

- Treat the aggregate corpus as pattern evidence, not as authority to invent
  facts. If a proposed correction needs a missing box, folder, file identifier,
  telegram number, NLR/RAC identifier, appendix letter, or document number, use
  `comment_only`.
- Check whether a note belongs to one of the recent Reagan source ecologies
  before normalizing it: Soviet/START/national-security notes often use NSC,
  arms-control, annex, verification, paragraph-marking, and scheduled-publication
  patterns; Eastern Europe and North Africa notes use State telegrams, regional
  directorate files, agency intelligence/economic records, and public/press
  annotation; foundations and international/economic notes often mix public
  records with internal policy files.
- Preserve exact source-family identity. Do not rewrite `PROFS`, `W Files`,
  `System IV`, `Executive Secretariat, National Security Council`, State `CFPF`
  reels, State lot files, Shultz Papers, staff/directorate files, agency
  records, or public/printed selected sources into a single house template.
- Do not require a `Source:` footnote for every editorial note. Recent Reagan
  volumes include editorial notes without source notes when the note text itself
  provides the documentary citations and chronology.
- Treat public speeches, press conferences, interviews, testimony, congressional
  records, public laws, and published Presidential papers as selectable document
  evidence when the target volume's scope makes public language itself part of
  the record.
- Keep attachment language literal. `Attached but not printed`, `Attached but
  not printed is the list of participants`, `Printed as Document [n]`, `Tabs
  [letters] are printed as Document [n]`, `Not found attached`, and appendix
  facsimile cross-references are not interchangeable.
- Require a documentary basis for `No minutes were found`: diary, schedule,
  source-note search context, or a nearby editorial explanation. Do not convert
  a no-minutes note into `Not found.`
- For handwritten notes and appendix images, check both directions of the
  relationship: the transcribed document should point to the appendix image, and
  the appendix source entry should point back to the transcribed document.

### 6.10D Reagan START I Volume XI Corpus Rules

The local files `reports/frus1981-88v11-style-lessons.md`,
`reports/frus1981-88v11-annotation-corpus.md`, and
`reports/frus1981-88v11-annotation-corpus.json` record a derived pass over
Volume XI, START I: Documents 1-330 plus Appendix Documents 331-337.

Corpus facts to apply:

- Coverage: 330 numbered documents, 7 appendix records, 337 total printed
  records, 311 records with source notes, 26 records without source notes,
  1,224 detected footnotes, and 0 parse errors.
- All 26 records without source notes are `Editorial Note` records. Do not
  demand or invent a source note for an editorial note when the note text itself
  supplies chronology, citations, and cross-references.
- Dominant source families: Reagan Library NSC Institutional/Executive
  Secretariat files; Department of State lot/Executive Secretariat/office files;
  Reagan Library staff, subject, and directorate files; State CFPF telegrams;
  Shultz/Hoover/private copies; PROFS/electronic messages; System IV
  Intelligence Files; NSC staff files; Daily Diary/schedule records; and
  foreign/international organization records.
- Common follow-on patterns: same-volume `See Document [n].`,
  attached-but-not-printed notes, `Not found.`, scheduled-publication notes,
  `See footnote [n], Document [n].`, telegram-reference notes, original-bracket
  notes, printed-as-document notes, appendix/transcribed-copy cross-references,
  no-minutes notes, full-memcon-scheduled-elsewhere notes, and
  not-found-attached notes.
- Common source-note evidence: directive package context, NSC/NSPG meeting
  context, paragraph classification markings, drafting and clearance, routing,
  read-by and marginalia evidence, not-declassified statements, attached papers,
  telegram identifiers, Daily Diary/schedule support, and appendix facsimile
  references.

Checker behavior:

- Treat START annotations as arms-control package annotation. NSDDs, NSSDs,
  NSC/NSPG minutes, annexes, tabs, papers, verification proposals, and draft
  telegram instructions may belong together, but do not merge separate printed
  records or source paths.
- Preserve precise source families. Do not rewrite NSC Institutional Files,
  Executive Secretariat files, State lot files, CFPF telegrams, PROFS, System
  IV, W Files, Shultz/Hoover copies, or staff/directorate files into a generic
  Reagan Library source note.
- Use short documentary follow-on notes. Prefer document-number and
  footnote-number references over explanatory prose when the corpus pattern
  supports a concise cross-reference.
- Keep `Not found.`, `Not found attached.`, `No minutes were found.`, and
  full-memcon-scheduled-elsewhere language distinct. Each is a different claim.
- For meeting records, use Daily Diary, schedule, diary, and memoir evidence for
  time, place, participants, and corroboration. Do not create substantive
  minutes from diary evidence.
- For Appendix Documents 331-337, preserve two-way relationships between
  appendix images/facsimiles and the transcribed documents.
- Prefer `comment_only` when a correction requires a missing box, folder,
  telegram number, source path, PROFS/System IV/W Files identifier, appendix
  letter, scheduled-publication target, or document number.

### 6.11 Foundations-Volume Public Sources And Handwritten Notes

Volume I all-document corpus facts:

- The local file `reports/frus1981-88v01-annotation-corpus.md` records a
  derived pass over all printed records in Volume I: Documents 1-335 plus
  Appendix Documents 336-338.
- Coverage: 335 numbered documents, 3 appendix records, 338 total printed
  records, 269 records with source notes, 69 records without source notes,
  1,907 detected footnotes, and 0 parse errors.
- All 69 records without source notes are `Editorial Note` records. Do not
  demand or invent a source note for an editorial note when the note text itself
  supplies chronology, citations, and cross-references.
- Dominant source families: Department of State lot/Executive Secretariat/office
  files; Reagan Library staff, subject, and directorate files; Reagan Library
  NSC Institutional/Executive Secretariat files; Shultz/Hoover/private copies;
  State CFPF; White House Staff/Office Files; public/printed sources; Daily
  Diary/schedule records; economic or assistance agency records; and private
  papers.
- Common follow-on patterns: `See footnote [n], Document [n].`, same-volume
  `See Document [n].`, scheduled-publication notes, telegram-reference notes,
  `Brackets are in the original.`, attached-but-not-printed notes, `Not found.`,
  printed-as-document notes, appendix/transcribed-copy cross-references,
  no-minutes notes, and not-found-attached notes.

Rules:

- In a foundations volume, public speeches, campaign statements, press
  conferences, background briefings, interviews, testimony, public reports,
  memoirs, and congressional records may be selected documents when they reveal
  policy assumptions, intellectual framing, or public strategy.
- Do not automatically demote public sources to fallback evidence when the
  volume's stated purpose makes public language part of the documentary record.
- Prefer archival speech drafts or control copies when available; use Public
  Papers, newspapers, hearings, and memoirs to annotate delivery, reception,
  context, or recollection.
- For handwritten notes, preserve fragments, bullets, dashes, equals signs,
  numbered points, abbreviations, and uncertain readings.
- Do not replace bracketed `unclear` or `illegible` readings with invented text.
- Identify editor-transcribed handwritten notes and any appendix facsimile.
- Use Daily Diary, schedules, and memoirs to supplement meeting context, not to
  invent substantive minutes.
- Preserve Volume I's public-record source ecology. Do not rewrite a public or
  published selected source into an archival-source template merely because most
  FRUS source notes are archival.
- Treat `See footnote [n], Document [n].`, `See Document [n].`,
  scheduled-publication notes, telegram-reference notes, `Not found.`, `Not
  found attached.`, printed-as-document notes, and appendix cross-references as
  distinct controlled forms.
- If a proposed correction needs a missing document number, footnote number,
  telegram number, appendix letter, source path, campaign/speech provenance, or
  search basis, use `comment_only`.

Preferred forms:

```text
The editor transcribed the text from [person]'s handwritten notes specifically for this volume. An image of the notes is Appendix [letter].
```

```text
For the transcribed copy of these notes, see Document [number].
```

Flag these issues:

- Public speech or testimony is treated as unsuitable merely because it is
  public, despite foundations-volume scope.
- Campaign speech annotation lacks campaign, venue, delivery, or press context
  available in the source.
- Editorial note about a public-record sequence becomes interpretive essay
  rather than chronological documentary summary.
- Handwritten notes are normalized into polished prose.
- `unclear` or `illegible` bracketed readings are silently rewritten.
- Appendix-image relationship is missing or reversed.
- Memoir quotation is used as a substitute for available official records
  instead of supplementary context.

### 6.12 Exemplar Annotation-Sheet Form From Foundations Consolidated

Use the uploaded `Foundations Consolidated.docx` file as a positive calibration
model for finished annotation form. The file is a clean exemplar: no Word
comments or tracked changes were detected. It should teach the checker what a
successful finished note sounds like; it is not a track-change implementation
model.

Observed calibration facts from the extracted exemplar:

- 264 source notes, 68 `Editorial Note` records, 51 `No classification marking`
  source notes, 66 notes with drafting information, 34 attached-but-not-printed
  notes, 28 not-found notes, 6 no-minutes notes, 40 Daily Diary references, 165
  scheduled-publication references, 3 editor-transcribed handwritten-note
  source notes, and 3 appendix-image references.
- The dominant source forms include State S/P lot files, Reagan Library staff
  and NSC files, private papers, public Presidential papers, Department of
  State Bulletin texts, campaign speech files, newspaper accounts, and Daily
  Diary support.

Positive form rules:

- Treat source notes as chains of verifiable facts, not as generic citations.
  Good notes identify the repository or public source, the controlling file or
  printed source, the original classification or verified absence of one, the
  document form, and any drafting, clearance, routing, stamp, marginalia,
  attachment, or read-by evidence.
- Do not force all selected records into archival-source form. In this exemplar,
  public speeches, campaign statements, interviews, press conferences, public
  reports, memoirs, and published Presidential papers can be selected evidence
  when the volume is documenting public foreign-policy assumptions.
- For public speeches and campaign material, check for the specific public-form
  evidence that makes the note excellent: letterhead, campaign committee or
  preparing office, venue, audience, delivery time, broadcast details, release
  time, press coverage, and whether the selected text is a statement, excerpt,
  address, interview, or published version.
- Preserve layered citation. If an archival control copy is printed and public
  reporting or printed texts supply delivery or reception context, keep the
  archival control copy first and the public context after it. If the published
  public text is the selected source, do not invent an archival control copy.
- Keep editorial notes documentary and chronological. A good editorial note can
  summarize a sequence of speeches, interviews, testimony, press accounts,
  memoir passages, and related FRUS documents without adding a `Source:` footnote
  when the note itself supplies the citations.
- Use controlled follow-on forms. `See Document [n].`, `See footnote [n],
  Document [n].`, `Scheduled for publication...`, `Attached but not printed...`,
  `Not found.`, `Not found attached.`, `No minutes were found.`, and
  `Printed as Document [n].` are separate claims and should not be rewritten
  into one generic cross-reference.
- When a note mentions handwriting, unknown hands, initials, stamped notations,
  top-right-corner notes, underlining, check marks, or read-by stamps, keep the
  physical-document description precise and modest. Do not infer motive or
  authorship unless the source supplies it.
- Use Daily Diary, schedule, and memoir evidence to establish time, place,
  sequence, attendance, or contemporary recollection. Do not use those sources
  to create substantive meeting content that is not otherwise documented.
- For handwritten notes printed as documents, preserve the finished-form pair:
  the source note says the editor transcribed the text for the volume and points
  to the appendix image; the appendix entry points back to the transcribed
  document.
- Persons and source-list material should stay compact but exact. Preserve
  date-bounded offices, variant names or nicknames where the authority list uses
  them, and repository organization from broad institution to specific file
  family.

Flag these issues:

- A draft source note gives only a URL, scan filename, discovery label, or public
  article when the uploaded context supplies a control-copy source path.
- A public speech note omits available delivery, venue, audience, broadcast,
  release, letterhead, or campaign/preparing-office facts.
- An editorial note reads like interpretation instead of a sourced documentary
  bridge.
- Physical evidence such as handwriting, initials, stamps, or marginalia is
  turned into an unsupported assertion about intent or authorship.
- A note collapses delivery context, source identity, and publication history
  into one vague sentence.
- A source note duplicates `Source:` or contains raw extraction artifacts that
  would not appear in finished FRUS form.

### 6.13 Status-Of-Series Watchlist And Stage-Aware Checks

The History Office status page is a living source and should be refreshed by the
closed-network wrapper whenever fresh status data is available. As of June 3,
2026, the official status page explains that FRUS volumes proceed through
Planning, Research, Clearance, and Publication. It also lists current and recent
publications, planned releases, chapters outstanding, and volumes at various
stages of production.

Use status as workflow context, not as documentary evidence. A volume's status
can tell the checker how mature an annotation sheet probably is; it cannot prove
a source note, classification marking, date, attachment, document number, or
cross-reference.

Current 1981-1992 status context to keep in view:

- Always prefer the full official volume title and status supplied in
  `series_status_context`. The shorthand lists below are a watchlist, not a
  substitute for the current status page.
- Published in 2025: `1981-1988, Volume XLIV, Part 1, National Security Policy,
  1985-1988`; `1989-1992, Volume XXXI, START I, 1989-1991`.
- Anticipated in 2026: `1981-1988, Volume XVI, South America`, with Venezuela
  specifically listed; `1981-1988, Volume XXVIII, China, 1981-1983`.
- Reagan volumes being cleared: II; VII; IX; XII; XIV; XV; XVI; XVII, Parts 1
  and 2; XVIII, Parts 1 and 2; XIX; XX; XXI; XXII; XXV; XXVI; XXVII; XXVIII;
  XXIX; XXX; XXXI; XXXII; XXXIII; XXXIV; XXXV; XXXVI; XXXIX; XL; XLIII; XLIV,
  Part 2; XLVI; XLVII, Parts 1 and 2; XLVIII.
- Reagan volumes being researched: VIII; XXIII; XXXVII; XLII; XLV.
- Bush volumes being cleared: III; VII; X; XI; XII; XIII; XVII; XIX; XXI; XXVI;
  XXXIII.
- Bush volumes being researched: I; II; IV; V; VI; VIII; IX; XIV; XV; XVI;
  XVIII; XX; XXII; XXIII; XXIV; XXV; XXVII; XXX; XXXII.
- Bush volumes planned: XXVIII; XXIX.

Stage-aware checker behavior:

- `published`: Treat published volumes as pattern evidence. Direct edits may
  correct draft annotation toward published FRUS form when the original text is
  exact and the correction does not invent facts. For published source notes,
  prefer exact published phrasing over a paraphrase.
- `anticipated`: Treat the manuscript as late-stage. Check for publication-ready
  style, precise document-number cross-references, chapter consistency, and
  final removal of working labels, but do not state that a chapter or volume is
  published until the official page says so.
- `being_cleared`: Treat annotation sheets as mature but still subject to
  clearance movement. Check declassification language, excision brackets,
  whole-document withholding notes, agency equities, attachment status, and
  cross-volume scheduling especially carefully. Prefer `comment_only` for any
  edit that would assert a final declassification outcome, page count, release
  status, or publication target not present in the uploaded context.
- `being_researched`: Treat source notes and annotations as more provisional.
  Encourage precise repository-to-folder source paths, search-basis comments,
  candidate document rationale, and authority-control cleanup. Do not over-edit
  into final prose if the source path, classification, attachment evidence, or
  document numbering is still missing.
- `planned`: Treat the uploaded material as scoping or research guidance rather
  than publication annotation unless the user says otherwise. Flag claims that
  present planned-volume conjecture as verified FRUS annotation. Prefer comments
  asking for archival verification and authority context.

Status-sensitive direct-edit rules:

- It is acceptable to replace working labels such as `candidate`, `needs scan`,
  `placeholder`, `TK`, `TBD`, `verify`, `draft note`, or URL-only locators with
  comments requiring verification. Do not silently delete them if they explain
  unresolved research status.
- Do not change a cross-reference from `scheduled for publication` to `printed
  in` unless the target volume or chapter is published and the document number
  is supplied.
- Do not force a source note for an editorial note merely because the target
  volume is in clearance. Published Reagan and Bush examples include editorial
  notes without first-footnote source notes when the note itself gives
  documentary citations and chronology.
- In clearance-stage files, check whether all document-number cross-references
  are stable. If not, leave a comment rather than inventing document numbers.
- In research-stage files, tolerate clearly marked compiler working notes only
  if the output is not being treated as a publication-ready annotation sheet.
  If the user asks for a final checker pass, working notes become major issues.

Topic permutations implied by the current 1981-1992 pipeline:

- Organization and management or foundations volumes: expect public statements,
  briefing books, transition records, public diplomacy material, organizational
  charts, Department/NSC management records, memoirs, and authority-list
  sensitivity around offices and dates.
- Regional bilateral volumes: expect embassy telegrams, country desk files,
  Presidential Library country files, NSC regional directorate records, CIA/DOD
  equities, foreign-government copies, translations, and public statements.
- Crisis volumes: expect situation-room material, memoranda of conversation,
  telcons, military and intelligence records, diary/schedule corroboration,
  fast-moving chronology, and attachment/missing-record notes.
- Arms-control, national-security, and nonproliferation volumes: expect NSC and
  NSPG records, NSDD/NSSD/directive packages, annexes, verification papers,
  treaty texts, STARS/CFPF telegrams, paragraph markings, and scheduled
  cross-volume publication.
- Public diplomacy, global issues, refugees, counternarcotics, terrorism, and
  war-on-drugs volumes: expect public records, interagency task-force material,
  law-enforcement or intelligence equities, congressional hearings, press
  guidance, speeches, international-organization records, and careful
  terminology authority control.
- Economic, trade, monetary, assistance, and debt volumes: expect Treasury,
  State economic bureau, NSC, World Bank/IMF, public report, summit, and
  industrialized-country cooperation records; keep public/printed sources and
  archival control copies distinct.

### 6.14 Annotation-Sheet Redline Playbook

The checker's hardest job is not knowing one ideal note form. It is deciding
whether a messy annotation-sheet unit is a publishable note, a compiler working
note, a source lead, an authority-list entry, or transcribed document text. Run
this playbook before proposing track changes.

Unit triage:

- `publication_apparatus`: source notes, follow-on footnotes, editorial notes,
  document headings, supplied titles, bracketed omission notes, attachment
  notes, source-list entries, Persons entries, abbreviations, and index entries.
  These may be directly edited when the replacement is exact and evidence-based.
- `compiler_working_note`: scan requests, candidate labels, search terms,
  source leads, archive-call notes, unresolved questions, internal reviewer
  comments, and placeholders. These should usually receive comments or
  conversion into a verification task, not silent deletion.
- `transcribed_document_text`: document body, telegram text, memorandum text,
  original footnotes, original brackets, handwritten-note transcription, and
  attachment text. Do not edit directly unless the user requested transcription
  review or the unit is explicitly editorial.
- `authority_material`: source list, abbreviations, Persons, tags, and index
  material. Check for consistency and date-bounded accuracy rather than trying
  to make every entry stylistically identical.
- `mixed_unit`: paragraphs that combine source note, annotation, and compiler
  questions. Split the recommendation logically: use direct edits only for
  publishable phrases, and use comments for unresolved evidence.

Redline priority order:

1. Prevent false facts: guessed classifications, invented document numbers,
   inferred attachments, unsupported "read by" claims, unstable
   declassification outcomes, and public/private source confusion.
2. Restore FRUS function: source note, follow-on footnote, editorial note,
   source-list entry, authority-list entry, or working note.
3. Preserve source ecology: do not flatten Presidential Library, State lot
   file, CFPF, STARS, PROFS, W Files, System IV, private-paper, public-source,
   foreign-government, or agency-record forms into one house template.
4. Tighten form: order source notes from repository to control-copy evidence;
   use concise document-number cross-references; keep not-found and attachment
   language literal.
5. Improve style only after evidence and function are right.

Track-change behavior:

- Prefer the smallest exact replacement that fixes the defect.
- Use `comment_only` when the right answer requires looking at a scan, source
  image, box/folder, original classification marking, declassification history,
  neighboring chapter, or unpublished volume manuscript.
- Do not rewrite a long source note merely because one clause is awkward. Edit
  the clause and comment on any larger uncertainty.
- If the uploaded Word file already has tracked changes, comment on conflicting
  edits rather than layering contradictory replacements.
- If a note is excellent but non-template, return `no_change` or an info comment
  explaining that the variation is supported by published FRUS practice.

No-change signals:

- Editorial note without a `Source:` footnote, when it supplies citations and
  chronology.
- Public or printed source used as the selected document in a foundations,
  public diplomacy, congressional, treaty, or speech-centered context.
- Short follow-on note such as `See Document [n].`, `Not found.`, or `Attached
  but not printed is [description].`
- Source note that preserves unusual but real source families such as PROFS, W
  Files, System IV Intelligence Files, STARS, NSC Washington institutional
  files, Bush Vice Presidential Records, Shultz/Hoover copies, private papers,
  or foreign/international organization records.
- Physical evidence stated modestly: stamped notation, initials, unknown hand,
  marginal line, underlining, checkmark, read-by notation, or top-right-corner
  annotation.

Major-issue signals:

- URL-only, scan-only, or discovery-platform-only source note when a control
  copy path is available.
- Classification/status confusion: `declassified`, `released`, `sanitized`, or
  `mandatory review` used as if it were the original classification marking.
- Working labels left in publication apparatus: `candidate`, `possible`,
  `needs image`, `verify`, `TK`, `TBD`, `ask editor`, or `not checked`.
- Attachment claims that infer from context rather than the source note:
  attached, not attached, printed elsewhere, not found attached, tabbed, or
  included in an appendix.
- Heading metadata drift: document form, sender, recipient, place/date line,
  subject/title line, public-title line, or internal record number is changed
  without registry or source-image support.
- Cross-reference drift: page references where document numbers exist, obsolete
  document numbers, missing volume title in scheduled-publication notes, or
  conversion of `scheduled for publication` to `printed` without proof.
- Authority drift: person office/title wrong for the document date; mixed name
  forms; abbreviation expanded inside transcribed text; index/page references
  used where document references are expected.

Permutation matrix for annotation sheets:

- Source note with full archival path: check repository, collection, series,
  file unit, box/folder/OA/ID/lot/identifier, classification/handling, document
  form, drafting/clearance/routing, attachments, read-by/marginalia, and
  cross-reference.
- Document heading or dateline: check document number, form, sender, recipient,
  office titles, place/date line, subject/title line, internal number, caption,
  public title, and source-note linkage.
- Source note from public/printed source: check edition, publication date,
  page/range, issuing office, delivery or release facts, and whether archival
  draft/control-copy context is available.
- Telegram source note: check CFPF or other source family, telegram number,
  origin/addressee, date/time group, classification/precedence, drafter and
  approval when present, and related telegram citations.
- Physical/routing/marginalia source note: check source image, handwriting,
  initials, actor or hand, stamp language, read-by/seen status, signed status,
  approval checkmark, sent-for-action or sent-for-information routing,
  correspondence profile, distribution, placement, attached profile, and whether
  the physical evidence proves review, approval, routing, or only copy
  provenance.
- Memcon/telcon/minutes note: check meeting/call location, date/time, source
  type, participants only when supported, Diary/schedule corroboration, and
  whether a full record is scheduled elsewhere.
- Directive or decision package: check parent memo, directive, annex, tabs,
  distribution list, paragraph markings, cover memorandum, approval/signed
  status, and whether each printed component needs separate annotation.
- Treaty or legal-instrument package: check treaty text, protocols, annexes,
  memoranda of understanding, executive agreements, letters, declarations,
  statements, article-by-article analyses, transmittal messages, ratification,
  entry into force, and whether each component is integral or associated.
- Summit, travel, ceremony, speech, interview, press conference, toast,
  testimony, or public-event package: check event sequence, local time/time
  zone, place, participants, public-source basis, diary/schedule basis, press
  basis, and whether full records are printed, scheduled elsewhere, or not
  supplied.
- Public diplomacy, speech, press, interview, broadcast, testimony, or
  public-source package: check speaker, title, issuing office, publication,
  edition, page/range, delivery or broadcast fact, transcript status,
  excerpt/full-text relationship, archival draft or briefing context,
  selected-public-document status, supplemental-public-context status, and
  whether public evidence is being used as selected text or corroboration.
- Foreign-government, international-organization, regional-body, alliance,
  coalition, peacekeeping, conference, or multilateral package: check body or
  actor identity, source-versus-subject status, foreign-copy provenance,
  translation status, concurrence basis, treaty-party or successor-state status,
  meeting/conference title, publication details, venue versus actor role, and
  selected-versus-supplemental status.
- Congressional or legal-authority package: check committee/hearing identity,
  Congress/session, testimony source, budget or message-to-Congress basis,
  public law, Stat. citation, section number, joint/continuing resolution,
  vote/action stage, amount, condition, notification, Presidential
  Determination, certification, Executive Order, independent counsel, oversight,
  Senate advice-and-consent, ratification, and attached-but-not-printed legal
  materials.
- Economic, debt, trade, assistance, or financial-data package: check
  institution identity, acronyms, dollar amounts, percentages, currencies,
  fiscal years, budget authority, loans, guarantees, quotas, replenishments,
  conditionality, debt rescheduling, table row/column labels, source basis,
  attachment status, and whether a proposal, meeting decision, legal authority,
  or actual payment is being described.
- Intelligence, covert-action, law-enforcement, counternarcotics,
  counterterrorism, or agency-equity package: check agency identity, source
  family, original classification/handling, release or sanitization status,
  operational claim basis, source-and-methods risk, oversight or committee
  basis, foreign-service contact status, and whether the note is public/policy
  context, an editorial summary, or a classified/source record.
- Military, defense, crisis, coalition, peacekeeping, or Situation Room
  package: check source family, operation or crisis name, operation stage,
  order/authorization basis, force/unit identity, chronology, time zone,
  paragraph markings, handling/precedence, host-nation notification, allied or
  coalition role, casualty/damage basis, CONPLAN or contingency-plan status,
  and whether the note is policy discussion, intelligence warning, planning,
  notification, execution, public statement, or after-action context.
- Human-rights, refugee, immigration, famine, food-aid, AIDS, population,
  environmental, or global-issues package: check report family, country or
  population scope, public/archival basis, legal/program authority, amount or
  metric, stage/status, sanctions or waiver basis, international-organization
  role, PVO role, public-health source, population-policy issue, environmental
  treaty/protocol status, and whether the note is source ecology, selected
  public evidence, policy planning, approved action, or status-page routing.
- Attachment/tab note: check `Attached but not printed`, `Printed as Document
  [n]`, `Tabs [letters] are printed as Document [n]`, `Not found attached`, and
  `Attached but not printed is the list of participants` as different claims.
- Editorial note: check documentary chronology, source citations inside the
  note, relation to omitted/unprinted documents, same-volume and cross-volume
  references, and absence of unsupported interpretation.
- Declassification/omission note: check bracket form, quantity, original versus
  editorial brackets, whole-document withholding, paragraph-or-more excision,
  minor excision, and unrelated-topic omission.
- Handwritten or appendix material: check transcription status, uncertain
  readings, preservation of fragments, appendix image reference, and reverse
  appendix-to-document reference.
- Persons/abbreviations/source-list/index material: check authority form,
  date-bounded office, acronym definition, repository hierarchy, document-number
  references, and consistency across the uploaded packet.

### 6.15 Volume-Family Router For In-Preparation 1981-1992 Sheets

Use this router with the status-aware checks and the redline playbook when the
uploaded sheet belongs, or may belong, to an in-preparation Reagan or George
H.W. Bush volume. The router is a triage aid. It does not prove source facts and
it must not be cited as evidence inside a source note.

Routing method:

1. Prefer an explicit `series_status_context.volume_title` or
   `volume_family_context` supplied by the wrapper.
2. If no title is supplied, infer only a tentative family from document
   headings, source families, country/subject vocabulary, and date span.
3. If two families are plausible, mark the unit as `mixed` and use
   `comment_only` for changes that depend on the family choice.
4. Apply the family-specific risks below before style polish.
5. Keep the published 2025 Reagan national-security and Bush START I volumes as
   pattern evidence, not as universal templates.

Reagan in-preparation routing:

| Volume family | Current in-preparation volumes | Source families to preserve | Redline priorities |
| --- | --- | --- | --- |
| Organization and management | II, Organization and Management of Foreign Policy | Reagan transition material; White House staff and office files; Executive Secretariat records; State management and policy-planning files; public organizational records | Date-bound offices, title changes, action/information routing, management memoranda, and separation of public organizational facts from internal policy evidence. |
| Europe, Poland, and NATO | VII, Western Europe, 1981-1984; VIII, Western Europe, 1985-1988; IX, Poland, 1982-1988 | State EUR and CFPF files; embassy telegrams; NSC European/Soviet directorate records; NATO and foreign-government copies; public statements | Do not flatten country files into generic regional files; preserve foreign-origin or embassy-held copy status; check document-number cross-references across related Europe and Soviet volumes. |
| Arms control and national security | XII, INF, 1984-1988; XLIII, National Security Policy, 1981-1984; XLIV, Part 2, National Security Policy, 1985-1988 | NSDD/NSSD packages; NSPG/NSC meeting files; System IV, W Files, PROFS, State lot files, ACDA, DOD/JCS/CIA records, treaty and verification papers | Guard paragraph markings, directive/annex/tab relationships, scheduled-publication wording, treaty terminology, and original classification versus later release status. |
| Latin America and Caribbean | XIV, Central America, 1981-1984; XV, Central America, 1985-1988; XVI, South America; XVII, Part 1, Mexico; Western Caribbean; XVII, Part 2, Eastern Caribbean | Embassy telegrams; NSC Latin America directorate files; State country/desk files; CIA/DOD equities; public diplomacy and congressional records; foreign-government or organization records | Check country/chapter routing, source-copy identity, covert-action or intelligence caution, missing attachments, translations, and whether public statements are selected evidence or supplemental context. |
| Middle East and regional crises | XVIII, Parts 1-2, Lebanon; XIX, Arab-Israeli Dispute; XX, Iran; Iraq, April 1980-January 1985; XXI, Iran; Iraq, 1985-1988; XXII, Middle East Region; Arabian Peninsula; XLV, Eastern Mediterranean | Situation-room records; memcons/telcons; embassy telegrams; State NEA files; NSC regional files; DOD/CIA equities; foreign-government copies; public peace-process documents | Be strict on chronology, participants, "no minutes found," attachment status, translation status, foreign-origin copy handling, and distinctions between crisis record and later memoir/public context. |
| Africa | XXV, Southern Africa, 1981-1984; XXVI, Southern Africa, 1985-1988; XXVII, Sub-Saharan Africa; XLVIII, Libya; Chad | Embassy telegrams; State Africa bureau and country desk records; NSC regional directorate files; CIA/DOD equities; international-organization records; public statements | Preserve regional/country split, sanctions and congressional context, intelligence or military equities, and cautious wording for foreign-government or international-organization records. |
| East Asia, Pacific, South Asia, and Afghanistan | XXVIII, China, 1981-1983; XXIX, China, 1984-1988; XXX, Japan; Korea, 1981-1984; XXXI, Japan; Korea, 1985-1988; XXXII, Southeast Asia; Pacific; XXXIII, South Asia; XXXIV, Afghanistan, February 1981-October 1985; XXXV, Afghanistan, November 1985-February 1989 | Embassy telegrams; State EAP/SCA files; NSC Asia directorate records; intelligence and defense files; foreign-government copies; translations; public statements | Check names, transliterations, translations, country/chapter routing, intelligence/military equities, and whether public statements or treaty texts are selected documents. |
| Economic, trade, debt, and assistance | XXXVI, Trade; Monetary Policy; Industrialized Country Cooperation, 1981-1984; XXXVII, Trade; Monetary Policy; Industrialized Country Cooperation, 1985-1988 | Treasury, State economic bureau, NSC, summit, IMF/World Bank, congressional, public report, and industrialized-country cooperation records | Preserve public/printed-source identity, meeting/summit context, agency authorship, economic acronyms, and whether a table, report, or testimony excerpt is the selected document. |
| Public diplomacy, global issues, refugees, terrorism, and counternarcotics | XXXIX, Public Diplomacy; XL, Global Issues I; XLII, Refugees and Immigration, 1975-1984; XLVI, War on Drugs; XLVII, Parts 1-2, Terrorism | Public statements; press guidance; USIA/public diplomacy records; interagency task-force files; law-enforcement and intelligence equities; congressional hearings; international organizations | Do not demote public material to mere background when it is selected evidence. Watch terminology, agency equities, sensitive operational claims, and authority-list consistency. |

Bush in-preparation routing:

| Volume family | Current in-preparation volumes | Source families to preserve | Redline priorities |
| --- | --- | --- | --- |
| Foundations, public diplomacy, and organization | I, Foundations of Foreign Policy; Public Diplomacy; II, Organization and Management of Foreign Policy | Bush Library public statements and speech records; transition records; White House/NSC staff files; State Executive Secretariat and policy-planning records; public printed sources | Treat speeches, testimony, interviews, and public statements as possible selected documents. Check date-bounded offices, title transitions, public-versus-internal source identity, and source-list authority form. |
| Soviet Union, Russia, Europe, Germany, and NATO | III, Soviet Union, Russia, and Post-Soviet States: High-Level Contacts; IV, Soviet Union, Russia, and Post-Soviet States: Policy; V, Eastern Europe; VIII, Western Europe; IX, Germany; X, European Security, 1984-1992 | Bush Library Scowcroft, Gates, NSC staff, and H-Files; State EUR/S/P/CFPF records; embassy telegrams; NATO and foreign-government records | Separate high-level contact records from policy/background files; preserve memcon/telcon and briefing-book forms; check cross-references across START I, Europe, Germany, and Soviet/Russia volumes. |
| Balkans, crises, and peacekeeping | VII, Yugoslavia; XXI, Somalia, 1989-1994 | Situation-room and NSC records; State regional bureau files; embassy telegrams; military/intelligence records; United Nations and international-organization records | Require precise chronology, agency equities, foreign/international-organization copy status, and cautious wording for operational or military claims. |
| Persian Gulf and Middle East | XI, Persian Gulf Crisis, 1989-1990; XII, Persian Gulf Crisis, 1990-1991; XIII, Persian Gulf Crisis, 1991-1992; XIV, Arab-Israeli Dispute; XXXII, Iran; VI, Eastern Mediterranean | NSC/Situation Room records; State NEA and CFPF records; memcons/telcons; DOD/JCS/CIA equities; coalition and foreign-government copies; public statements | Preserve crisis chronology, meeting/call status, coalition/foreign-origin records, not-found notes, translation status, and declassification bracket discipline. |
| Asia and Pacific | XV, South Asia; XVI, Southeast Asia and the Pacific; XVII, China; XVIII, Japan; Korea | Bush Library NSC regional staff files; State regional bureau and CFPF records; embassy telegrams; foreign-government copies; translations; public statements | Check transliteration/name authority, country routing, translation claims, intelligence/military equities, and whether related Reagan-era documents require scheduled-publication language. |
| Africa and Americas | XIX, Southern Africa; XX, North Africa; Sub-Saharan Africa; XXII, Cuba; Haiti; Caribbean; XXIII, Central America; XXIV, Panama, 1981-1992; XXV, South America; XXXIII, Canada and Mexico | State country/desk files; embassy telegrams; Bush Library NSC regional files; congressional/public diplomacy records; intelligence, defense, law-enforcement, and foreign-government records | Preserve country and regional chapter identity, source-copy status, sensitive intelligence or law-enforcement equities, and careful chronology for crises or interventions. |
| National security, arms control, and nonproliferation | XXVI, National Security Policy; XXVII, Arms Control and Nonproliferation; XXXI, START I, 1989-1991 as published pattern evidence | H-Files, NSR/NSD files, Scowcroft/Gates files, State lot files, ACDA/DOD/JCS/CIA records, CFPF D/P/N reels, treaty and verification records | Preserve H-Files subseries, NSR/NSD forms, paragraph markings, annex/tabs, verification terms, and original classification. Do not use the published START I template to overwrite a different national-security source family. |
| Economic policy, global issues, counternarcotics, and counterterrorism | XXVIII, Counternarcotics; Counterterrorism; XXIX, Global Issues; XXX, Foreign Economic Policy | Treasury and State economic bureau records; NSC files; public reports; law-enforcement, intelligence, and interagency task-force records; international-organization records | Keep public/printed sources distinct from control copies; watch agency equities, terminology, congressional/public-report citations, and planned-volume research labels. |

Family-sensitive output rules:

- When the family is known and the uploaded context supplies source evidence,
  the checker may propose exact style edits that restore the family-specific
  source form.
- When the family is only inferred, use comments to ask the compiler to confirm
  the volume title, chapter, source family, and stage before applying a direct
  replacement.
- Do not make every note look like Bush START I or Reagan XLIV Part 1. These
  volumes are excellent pattern evidence for national-security and arms-control
  annotation, but they are not templates for public diplomacy, economic policy,
  regional crisis, or authority-list material.
- Do not demote public sources automatically. Foundations, public diplomacy,
  economic, global-issues, and congressional contexts can select published text
  as documentary evidence.
- Do not upgrade working labels into facts. In research-stage and planned
  volumes, labels such as `lead`, `candidate`, `possible`, `verify`, or `needs
  scan` should become verification comments, not finished source-note prose.
- For clearance-stage crisis, arms-control, intelligence, law-enforcement, or
  foreign-government material, prefer `comment_only` when a change would imply a
  final declassification result, agency concurrence, foreign-government
  clearance, or attachment status not present in the uploaded context.

## 7. Direct-Edit Rules

The LLM may propose direct tracked changes only when:

- The target text is clearly editorial apparatus, not transcribed document text.
- The wrapper marks the unit as `safe_to_edit`, or supplies equivalent context
  showing that the proposed phrase is not inside a risky Word structure.
- The original text appears exactly in the extracted unit.
- The replacement is a style, form, or wording correction supported by the input.
- The edit does not invent facts.

The LLM must use `comment_only` when:

- The correction requires archival verification.
- A source path, classification marking, document number, date, or page count is
  missing.
- The source note may be wrong but the correct form is not recoverable from the
  uploaded context.
- The target unit is transcribed document text.
- The Word extraction is ambiguous.
- The wrapper marks `edit_safety` as blocked, ambiguous, overlapping existing
  revisions, or otherwise unsafe for direct run-level editing.

Comment quality rules:

- A useful `comment_only` finding should name the evidence needed, the place to
  check it, and the unsafe assertion to avoid.
- Do not write bare comments such as `Verify`, `Check source`, `Needs review`,
  or `Confirm.` They leave the compiler with no next action.
- Use `evidence_request` to classify the missing proof. Use
  `verification_target` to name the source image, folder path, authority list,
  status-page item, neighboring document, chapter, or Word-safety issue.
- Keep `comment_text` short enough for Word, but specific enough that the audit
  report is useful when read offline.
- If several different facts are missing in one unit, choose the evidence
  request that blocks publication first: source identity, original
  classification, attachment status, document metadata, document number,
  event chronology, declassification outcome, authority control, or wrapper
  safety.
- If the checker sees a working label such as `TK`, `candidate`, `needs scan`,
  or `verify`, the comment should preserve the research value of the label
  while directing the compiler to the evidence needed for final style.

Evidence-request categories:

| Category | Use when the blocker is... | Comment should tell the compiler... |
| --- | --- | --- |
| `source_image` | A scan, facsimile, or control copy must be inspected. | Which visible feature to check, such as marking, marginalia, stamp, attachment, or handwriting. |
| `archival_path` | Repository, collection, series, box, folder, lot, OA/ID, or file unit is missing or suspect. | Which part of the source path needs confirmation. |
| `classification_marking` | Original classification, handling, precedence, paragraph marking, or verified absence is missing, guessed, or confused with release status. | To verify the original marking evidence on the document, not the declassification result. |
| `physical_evidence_basis` | Handwriting, initials, marginalia, highlighting, underlining, checkmark, stamp, read-by/seen notation, signed status, approval box, sent-for-action or information routing, correspondence profile, distribution, physical placement, or unknown-hand evidence is uncertain. | Which visible physical feature, actor/hand, placement, routing status, approval status, profile, attachment, source image, or search/diary context must be checked. |
| `attachment_status` | Attached, not attached, printed elsewhere, tabbed, enclosed, or not found claims are uncertain. | Which tab, enclosure, paper, or list must be checked. |
| `document_number` | Same-volume or cross-volume reference lacks a stable document number. | Which target document, chapter, or volume must be matched. |
| `document_metadata` | Heading, dateline, subject/title line, public title, sender, recipient, internal number, or document form is missing or suspect. | Which heading field and evidence source must be checked before rewriting. |
| `treaty_component` | Treaty, protocol, annex, memorandum of understanding, executive agreement, letter, declaration, statement, transmittal, ratification, entry-into-force, or associated-document status is uncertain. | Which treaty component, legal status, public source, archival source, or integral-versus-associated relationship must be checked. |
| `foreign_org_basis` | Foreign-government, international-organization, multilateral, regional-body, alliance, coalition, peacekeeping, conference, treaty-party, copy-provenance, concurrence, or selected-source role is uncertain. | Which foreign copy, organization identity, body role, concurrence basis, treaty-party status, conference/meeting identity, publication detail, or source-versus-subject status must be checked. |
| `public_source_basis` | Speech, press, interview, broadcast, testimony, Public Papers, Department of State Bulletin, newspaper, official transcript, public-source selected-document, excerpt, full-text target, or archival-draft relationship is uncertain. | Which publication details, delivery or broadcast facts, transcript basis, excerpt/full-text relationship, archival draft context, or public-versus-archival selection status must be checked. |
| `retrospective_account_basis` | Memoir, published diary, personal diary, oral history, later interview, recollection, press retrospective, newspaper account, author/editor, page/locator, selected/supplemental status, official-record relationship, corroborating record, or conflict status is uncertain. | Which author/source, publication, page/locator, event match, official record, corroborating record, selection status, or conflict must be checked before using the account. |
| `legal_authority` | Congressional, statutory, executive-order, Presidential Determination, certification, hearing, testimony, vote-stage, oversight, or Senate advice-and-consent authority is uncertain. | Which committee, hearing, Congress/session, public law, Stat. citation, section, vote stage, amount, condition, transmittal, determination/certification, Executive Order, or Senate basis must be checked. |
| `financial_data` | Economic, trade, debt, assistance, budget, institutional, table, amount, percentage, fiscal-year, currency, loan, guarantee, quota, replenishment, conditionality, or policy-stage evidence is uncertain. | Which figure, unit, fiscal year, institution, program, table, source, attachment, legal basis, or policy stage must be checked. |
| `agency_equity` | Intelligence, covert-action, law-enforcement, counternarcotics, counterterrorism, source-and-methods, operational, oversight, foreign-service, or agency-equity proof is uncertain. | Which agency identity, source family, law-enforcement context, operational basis, oversight basis, release/redaction basis, or foreign-service contact must be checked. |
| `military_operation_basis` | Military, defense, crisis, operation-stage, DOD/OSD/JCS/DIA, Situation Room, contingency-plan, host-nation, coalition, chronology, force/unit, casualty/damage, or military-assistance proof is uncertain. | Which operation stage, order/authorization, force/unit, source family, time basis, host-nation/coalition role, casualty/damage basis, or military-assistance authority must be checked. |
| `humanitarian_rights_basis` | Human-rights report, refugee, immigration, asylum, migration, famine, emergency relief, food aid, public-health, population, environmental, sanctions, waiver, certification, public-report, international-organization, PVO, AID, PRM, PL 480, Section 416, or Section 206 proof is uncertain. | Which report basis, country or population scope, source family, public/archival basis, legal/program authority, amount/metric, stage/status, sanctions/waiver basis, international-organization role, or PVO role must be checked. |
| `publication_status` | `printed in` versus `scheduled for publication` depends on current official status. | Which volume or chapter status must be confirmed. |
| `authority_control` | Persons, titles, abbreviations, index terms, names, offices, or dates need authority-list review. | Which name, office, acronym, date span, or index term needs control. |
| `declassification_status` | Release, withholding, excision, agency-equity, or bracket language is not final. | Which review outcome or bracket claim cannot yet be asserted. |
| `translation_status` | Language, translation office, official/unofficial status, foreign-origin copy, typed signature, bracket treatment, or translated excerpt is uncertain. | Which language/copy/translation/equity fact needs verification. |
| `chronology` | Diary, schedule, call-log, meeting, or sequence evidence is incomplete. | Which time, place, attendance, or sequence point needs corroboration. |
| `event_chronology` | Summit, travel, ceremony, interview, press conference, speech, toast, public remarks, or public-event sequence evidence is incomplete. | Which event, time zone, place, sequence, public-source basis, press basis, diary/schedule basis, participant basis, or full-record target must be checked. |
| `source_family` | The note appears to flatten a specific source ecology into a generic form. | Which source family or subseries should be preserved. |
| `cross_reference` | Related document, footnote, appendix, telegram, or volume reference is unstable. | Which reference anchor must be checked. |
| `wrapper_safety` | Word XML anchoring, existing revisions, comments, fields, tables, or note references make editing unsafe. | Why the wrapper should reject or downgrade the direct edit. |

Evidence-request queue:

The wrapper should aggregate all non-`none` evidence requests into a separate
queue before applying Word changes. This queue is not another LLM output field;
it is derived from validated `checks`. The purpose is to make every unresolved
fact visible to compilers and editors, especially in normal and exhaustive
passes where a vague comment can hide a publication blocker.

Minimum queue item:

```json
{
  "request_id": "evidence-request-0001",
  "unit_ids": [
    "source-note-0007"
  ],
  "evidence_request": "classification_marking",
  "verification_target": "Original classification and handling markings on the source image",
  "blocking_direct_edit": true,
  "blocking_publication": true,
  "owner_hint": "compiler",
  "status": "open",
  "resolution_note": "",
  "resolved_by": "",
  "resolved_at": ""
}
```

Queue states:

- `open`: the checker identified the missing proof and no human resolution has
  been supplied.
- `resolved`: a compiler, editor, or wrapper supplied the requested evidence.
  The wrapper may rerun the affected units or unlock direct edits that now have
  exact support.
- `deferred`: the issue is real but not blocking for the selected review mode,
  such as a light research pass.
- `waived`: the General Editor or volume editor accepted the risk or chose a
  house form. Preserve the waiver note in the audit report.
- `blocked`: the missing proof prevents safe review or publication-ready
  redline of the affected unit.

Default blocking rules:

| Evidence request | Blocks direct edit by default | Blocks final publication pass by default |
| --- | --- | --- |
| `source_image` | yes | yes, if source-note, attachment, marking, handwriting, or marginalia claims depend on it |
| `archival_path` | yes | yes |
| `classification_marking` | yes | yes when source-note, handling, precedence, paragraph-marking, attachment, or no-marking claims depend on it |
| `physical_evidence_basis` | yes for handwriting, initials, marginalia, stamp, read-by/seen, signed, approval, routing, correspondence-profile, distribution, placement, or unknown-hand edits | yes when physical/source-image evidence appears in publishable apparatus |
| `attachment_status` | yes | yes when the note asserts attached, not attached, tabbed, enclosed, printed, or not found |
| `document_number` | yes for cross-reference edits | yes when same-volume or cross-volume references are unstable |
| `document_metadata` | yes for heading, dateline, title, subject, or caption edits | yes when publishable apparatus identifies the document |
| `foreign_org_basis` | yes for foreign-copy, organization identity, body role, concurrence, treaty-party, conference, publication-detail, or selected-source edits | yes when foreign-government, international-organization, multilateral, coalition, alliance, or treaty-party claims appear in publishable apparatus |
| `treaty_component` | yes for component identity, integral-versus-associated status, public/archival basis, legal-status, ratification, or entry-into-force edits | yes when the note identifies a treaty component, associated document, transmittal, ratification, or entry into force |
| `public_source_basis` | yes for public-source title, speaker, publication, page, transcript, excerpt/full-text, delivery/broadcast, archival-draft, or selected-document edits | yes when a speech, press, interview, testimony, broadcast, or public-source selected document appears in publishable apparatus |
| `retrospective_account_basis` | yes for memoir, published diary, oral-history, later-interview, recollection, author/editor, page/locator, event-match, selected/supplemental, official-record relationship, corroborating-record, or conflict edits | yes when a retrospective account appears in publishable apparatus |
| `legal_authority` | yes for congressional/legal authority, committee, hearing, public-law, statute, determination, certification, Executive Order, vote-stage, amount, condition, or Senate advice-and-consent edits | yes when congressional or legal authority appears in publishable apparatus |
| `financial_data` | yes for amount, percentage, currency, fiscal-year, institution, program, table, debt/loan/guarantee, quota, conditionality, or policy-stage edits | yes when economic, trade, debt, foreign-assistance, or financial data appears in publishable apparatus |
| `agency_equity` | yes for agency identity, sensitive source family, operational claim, source-and-methods, oversight, law-enforcement status, foreign-service contact, or sanitization edits | yes when intelligence, covert-action, law-enforcement, counternarcotics, counterterrorism, agency-equity, or operational claims appear in publishable apparatus |
| `military_operation_basis` | yes for operation stage, order/authorization, force/unit, chronology, time-zone, host-nation, coalition, casualty/damage, contingency-plan, or military-assistance edits | yes when military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room, combat-operation, coalition, peacekeeping, or security-assistance claims appear in publishable apparatus |
| `humanitarian_rights_basis` | yes for report basis, country/population scope, refugee or asylum status, relief stage, legal/program authority, amount/metric, public/archival basis, sanctions/waiver status, international-organization role, or PVO role edits | yes when human-rights, refugee, immigration, famine, emergency relief, food aid, public-health, population, environmental, sanctions, waiver, certification, public-report, or global-issues claims appear in publishable apparatus |
| `publication_status` | yes for `printed in` or `scheduled for publication` edits | yes for final style if publication language is present |
| `authority_control` | yes when a date, identity, title, acronym, or index form is uncertain | yes for final style if repeated or reader-facing |
| `declassification_status` | yes | yes |
| `translation_status` | yes when language, translation, typed-signature, bracket-treatment, or foreign-copy identity is asserted | yes when the printed document depends on the claim |
| `chronology` | yes when time, attendance, or sequence is rewritten | yes when chronology is central to the note |
| `event_chronology` | yes when public-event date, time, place, sequence, source basis, participant basis, or full-record target is rewritten | yes when a summit, travel, ceremony, speech, interview, press, testimony, or public-event sequence appears in publishable apparatus |
| `source_family` | yes when source hierarchy or subseries would be rewritten | no for light review; yes for final style |
| `cross_reference` | yes | yes when the reference appears in publishable apparatus |
| `wrapper_safety` | yes | yes for generated `.docx` release until the edit is downgraded or safely anchored |

Owner hints:

- `compiler`: source images, archival path, document metadata, attachment
  status, document numbers, source family, chronology, treaty component
  identity, event sequence, public-source basis, foreign-government or
  international-organization proof, congressional/legal proof, financial data,
  agency-equity proof, military-operation proof, human-rights/refugee/global-
  issues proof, physical/routing evidence, retrospective-account basis,
  sensitive-record source basis, translation status, and foreign-copy provenance.
- `editor`: wording, heading form, cross-reference form, source-list
  consistency, treaty/legal-instrument placement, public-event note form,
  public-source and public-diplomacy note form, congressional/legal citation
  form, foreign/international-organization note form, economic/financial table
  and note form, military/crisis note form, human-rights/refugee/global-issues
  note form, physical/routing note form, retrospective-account note form,
  sensitive-record note form, publication-status wording, and General Editor
  discrepancy preparation.
- `declassification`: classification markings, declassification outcomes,
  release-status separation, withholding, excision, source-and-methods,
  sanitization, and agency-equity language.
- `wrapper`: exact anchors, existing tracked changes, Word XML structures,
  tables, fields, comments, footnotes, and export integrity.
- `general_editor`: recurring style discrepancies, house-form decisions, and
  waivers of nonfatal variation.

Queue merge rules:

- Merge evidence requests only when they share the same `evidence_request`,
  `verification_target`, owner hint, and blocking posture.
- Do not merge requests that point to different source images, target documents,
  date spans, source-list families, or Word XML structures.
- When multiple units depend on the same missing proof, keep all representative
  `unit_ids` so a compiler can revisit every affected annotation after
  resolution.
- If a request is resolved, rerun or revalidate only the affected units unless
  the resolution changes a packet-wide authority form, source-family rule, or
  publication-status assumption.
- Count unresolved `blocked` requests separately in the audit report. They are
  stronger than ordinary comments.

Examples:

Direct replacement is acceptable:

```json
{
  "recommended_action": "replace_text",
  "original_text": "No classification.",
  "replacement_text": "No classification marking.",
  "comment_text": "Use the standard FRUS phrase when the document itself has no original classification marking.",
  "evidence_request": "none",
  "verification_target": ""
}
```

Better as comment-only:

```json
{
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify OA/ID, folder title, and original classification against the control copy before finalizing this source note.",
  "evidence_request": "archival_path",
  "verification_target": "Control copy source path and original classification marking"
}
```

### 7.1 Calibration Cases For LLM Output

Use these cases to calibrate the LLM before a closed-network run. They are not
new facts; they are examples of decision discipline. Replace placeholders only
with evidence supplied in the uploaded document or wrapper context.

Case 1: Safe style replacement.

```json
{
  "unit_id": "source-note-0001",
  "severity": "minor",
  "category": "source_note",
  "finding": "The note uses non-standard classification wording.",
  "standard": "Use `No classification marking.` when the document has no original classification marking.",
  "recommended_action": "replace_text",
  "original_text": "No classification.",
  "replacement_text": "No classification marking.",
  "comment_text": "Use the standard FRUS phrase when the absence of an original classification marking is verified.",
  "evidence_request": "none",
  "verification_target": ""
}
```

Case 2: URL-only source note.

```json
{
  "unit_id": "source-note-0002",
  "severity": "major",
  "category": "source_note",
  "finding": "The source note leads with a discovery URL instead of the archival or published control source.",
  "standard": "FRUS source notes should identify the repository or selected published source before discovery platforms, scans, or URLs.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Replace the URL-only locator with the repository-to-folder source path or selected published source before finalizing.",
  "evidence_request": "archival_path",
  "verification_target": "Repository, collection, series, box/folder, lot, OA/ID, or selected published source"
}
```

Case 3: Missing Bush H-Files subseries.

```json
{
  "unit_id": "source-note-0003",
  "severity": "major",
  "category": "source_note",
  "finding": "The Bush H-Files citation omits the specific subseries.",
  "standard": "Bush H-Files source notes should preserve subseries such as NSR Files, NSD Files, NSC Meetings Files, or NSC/DC Meetings Files when supplied.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify the H-Files subseries, OA/ID, and folder title against the control copy; do not flatten the citation to generic H-Files.",
  "evidence_request": "source_family",
  "verification_target": "Bush H-Files subseries, OA/ID, and folder title"
}
```

Case 4: Editorial note without a source footnote.

```json
{
  "unit_id": "editorial-note-0004",
  "severity": "info",
  "category": "editorial_note",
  "finding": "No issue. A source footnote is not required if the editorial note itself supplies documentary citations and chronology.",
  "standard": "Published Reagan and Bush volumes include editorial notes without first-footnote source notes when the note text carries the evidence.",
  "recommended_action": "no_change",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "",
  "evidence_request": "none",
  "verification_target": ""
}
```

Case 5: Transcribed document text mistakenly targeted.

```json
{
  "unit_id": "document-body-0005",
  "severity": "info",
  "category": "evidence",
  "finding": "The unit appears to be transcribed document text rather than editorial apparatus.",
  "standard": "Do not edit transcribed document text unless the user requested transcription review or the unit is explicitly editorial.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "This appears to be document text; restrict the checker to source notes, annotations, headings, and editorial apparatus.",
  "evidence_request": "wrapper_safety",
  "verification_target": "Unit type and edit authorization"
}
```

Case 6: Scheduled-publication language.

```json
{
  "unit_id": "follow-on-0006",
  "severity": "major",
  "category": "citation",
  "finding": "The proposed wording would change a scheduled-publication claim into a published-document claim without supplied proof.",
  "standard": "Do not change `scheduled for publication` to `printed in` unless the target volume or chapter is published and the document number is supplied.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify current publication status and target document number before changing scheduled-publication language.",
  "evidence_request": "publication_status",
  "verification_target": "Target volume/chapter status and document number"
}
```

Case 7: Working label left in publishable apparatus.

```json
{
  "unit_id": "source-note-0007",
  "severity": "major",
  "category": "format",
  "finding": "A compiler working label remains inside publishable annotation text.",
  "standard": "Working labels such as `candidate`, `needs scan`, `TK`, `TBD`, or `verify` must not remain in final FRUS apparatus.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Resolve the working label against the source image or authority context before final style pass.",
  "evidence_request": "source_image",
  "verification_target": "Source image or authority context behind the working label"
}
```

Case 8: Classification confused with release status.

```json
{
  "unit_id": "source-note-0008",
  "severity": "major",
  "category": "declassification",
  "finding": "The note appears to use release/declassification status as if it were the original classification marking.",
  "standard": "Source notes must distinguish original classification and handling markings from release, declassification, or review status.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify the original classification marking on the document; do not substitute `declassified`, `released`, or `sanitized` for the original marking.",
  "evidence_request": "classification_marking",
  "verification_target": "Original classification and handling markings on the source image"
}
```

Case 9: Excellent non-template source note.

```json
{
  "unit_id": "source-note-0009",
  "severity": "info",
  "category": "source_note",
  "finding": "No issue. The note preserves a specific source family rather than forcing a generic template.",
  "standard": "Preserve source-family identity for PROFS, W Files, System IV, STARS, private papers, public sources, Bush Vice Presidential Records, and other real source ecologies.",
  "recommended_action": "no_change",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "",
  "evidence_request": "none",
  "verification_target": ""
}
```

Case 10: Exact replacement anchor not found.

```json
{
  "unit_id": "source-note-0010",
  "severity": "blocker",
  "category": "format",
  "finding": "The proposed edit cannot be applied because the exact target text is not present in the extracted unit.",
  "standard": "Every direct edit must use an `original_text` that is an exact substring of the extracted unit.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Wrapper should reject direct edits whose original_text does not exactly match the target unit.",
  "evidence_request": "wrapper_safety",
  "verification_target": "Exact anchor mapping for original_text"
}
```

Case 11: Authority title depends on document date.

```json
{
  "unit_id": "persons-entry-0011",
  "severity": "major",
  "category": "authority_control",
  "finding": "The title may not match the person's office on the document date.",
  "standard": "Persons and annotation entries must use date-bounded offices supplied by the authority registry or ask for verification.",
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify the document date against the authority registry before changing this office title.",
  "evidence_request": "authority_control",
  "verification_target": "Document date and date-bounded office span for the named person"
}
```

## 8. Standard Check Sequence

For every extracted unit, run checks in this order:

1. Identify unit type and whether it is safe to edit.
2. Check the wrapper's `edit_safety` and exact-text mapping before considering
   any direct edit.
3. Check for invented or unverifiable facts.
4. Check source-note order and completeness.
5. Check document headings, datelines, internal document numbers, subject/title
   lines, public-title lines, and captions against the document-metadata
   registry when supplied.
6. Match source notes against the source-family registry when supplied.
7. Check telegram, cable, STARS, CFPF, PROFS, W Files, System IV, agency-cable,
   and other communications-record metadata against the communications registry
   when supplied.
8. Check physical evidence, routing, marginalia, initials, stamps, read-by/seen
   notations, approval checkmarks, correspondence profiles, distribution, and
   placement against the physical/routing registry when supplied.
9. Check classification, handling, precedence, paragraph-marking, and
   no-classification-marking language against the classification registry when
   supplied.
10. Check translation, foreign-origin copy, typed-signature, bracket-treatment,
   and agency/foreign-equity language against the translation registry when
   supplied.
11. Check foreign-government, international-organization, multilateral,
    regional-body, alliance, coalition, treaty-party, conference,
    peacekeeping, foreign-copy, and selected-versus-supplemental role evidence
    against the foreign/international-organization registry when supplied.
12. Check treaty/legal-instrument component identity, integral-versus-associated
    status, public/archival source basis, transmittal language, ratification,
    and entry-into-force language against the treaty registry when supplied.
13. Check attachment, tab, enclosure, appendix, facsimile, and not-found claims
   against the attachment registry when supplied.
14. Check cross-references and follow-on citation form against the
   cross-reference registry when supplied.
15. Check annotation purpose and concision.
16. Check declassification, omission, original-bracket, release-status, and
    whole-document withholding language against the declassification registry
    when supplied.
17. Check target-volume status and whether the note is research-stage,
   clearance-stage, anticipated, planned, or published.
18. Route the unit through the relevant volume family when a 1981-1992
    in-preparation family is known or can be tentatively inferred.
19. Check chronology, diary, schedule, call-log, meeting, briefing, travel, and
    no-record usage against the chronology registry when supplied.
20. Check summit, travel, ceremony, public address, interview, press
    conference, toast, testimony, public remarks, and public-event sequence
    evidence against the event-chronology registry when supplied.
21. Check public diplomacy, speeches, press releases, press conferences,
    briefings, interviews, broadcasts, testimony, Public Papers, Department of
    State Bulletin, newspaper excerpts, official transcripts, speech files,
    briefing materials, selected-public-document status, and
    supplemental-public-context evidence against the public-source registry when
    supplied.
22. Check memoirs, published diaries, personal diaries, oral histories, later
    interviews, recollections, press retrospectives, newspaper accounts,
    selected/supplemental status, official-record relationship, corroborating
    records, and conflict status against the retrospective-account registry when
    supplied.
23. Check congressional testimony, hearings, public laws, statutes, continuing
    resolutions, joint resolutions, congressional notifications, Presidential
    Determinations, certifications, Executive Orders, oversight, independent
    counsel, Senate advice-and-consent, and ratification context against the
    congressional/legal registry when supplied.
24. Check economic, debt, trade, monetary, foreign-assistance, budget, IMF,
    World Bank, MDB, GATT, UNCTAD, OECD, table, amount, percentage, currency,
    fiscal-year, loan, guarantee, quota, replenishment, conditionality, and
    policy-stage evidence against the economic/financial registry when supplied.
25. Check intelligence, covert-action, law-enforcement, counternarcotics,
    counterterrorism, agency-equity, source-and-methods, operational, oversight,
    foreign-service-contact, sanitized-record, redaction, and public-policy
    evidence against the sensitive-record registry when supplied.
26. Check military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room,
    combat-operation, contingency-plan, CONPLAN, host-nation notification,
    coalition, peacekeeping, force/unit, time-zone, casualty/damage, and
    military-assistance evidence against the military/crisis registry when
    supplied.
27. Check human-rights reports, refugee, immigration, asylum, migration, famine,
    emergency relief, food aid, public-health, AIDS/HIV, population policy,
    environmental, ozone, sanctions, waivers, certifications, public reports,
    international organizations, PVOs, AID/PRM, PL 480, Section 416, and Section
    206 evidence against the human-rights/refugee/global-issues registry when
    supplied.
28. Check Persons, abbreviations, and index authority issues.
29. Assign specific evidence requests and verification targets for unresolved
    proof.
30. Decide direct edit versus comment-only.
31. Return strict JSON.
32. After schema and semantic validation, aggregate all unresolved evidence
    requests into the wrapper evidence queue before applying tracked changes.

## 9. Review Modes And Batch Workflow

The wrapper may ask for a `light`, `normal`, or `exhaustive` redline through
`annotation_sheet_context`. The mode controls review intensity. It does not
change the prohibition against invented facts, unsafe Word edits, or edits to
transcribed document text without user authorization.

Mode behavior:

| Mode | Use for | Direct-edit posture | Comment posture | General Editor tally |
| --- | --- | --- | --- | --- |
| `light` | Early research sheets, source leads, scoping packets, or quick sanity checks. | Apply only unambiguous small fixes to editorial apparatus. | Prefer concise comments for missing evidence, source-family uncertainty, and working labels. | Record recurring style variations, but do not dwell on low-risk cosmetic questions. |
| `normal` | Chapter annotation sheets, routine compiler review, or mixed packets. | Apply safe style and form corrections when exact evidence is present. | Comment on unresolved source, classification, attachment, chronology, and authority issues. | Record variations that recur or could affect house style. |
| `exhaustive` | Final style pass, pre-clearance cleanup, post-clearance review, or General Editor preparation. | Apply every safe direct correction supported by exact mapped text and evidence. | Comment on every unresolved evidence, style, authority, cross-reference, declassification, and wrapper-safety issue. | Fully populate the discrepancy tally with counts and representative examples. |

Stage and mode interaction:

- `planned` or `being_researched` plus `light`: protect working notes; convert
  only obvious defects into comments; do not polish research leads into final
  prose.
- `being_researched` plus `normal`: clean authority form, source-family
  descriptions, and obvious source-note order, but keep provisional evidence
  visible.
- `being_cleared` plus `normal` or `exhaustive`: focus on declassification,
  attachment status, agency-equity proof, cross-volume scheduling, and stable
  document-number references.
- `anticipated` plus `exhaustive`: treat the sheet as publication-near, but do
  not change `scheduled for publication` to `printed in` without current proof.
- `published` plus any mode: use published form as pattern evidence, but do not
  treat one volume's idiosyncrasy as a universal rule unless the standard says
  so.

Batch workflow:

1. Preflight the upload: confirm `.docx` readability, context bundle id,
   review mode, unit count, existing tracked changes, and whether source images
   are available.
2. Unitize the Word file before calling the LLM. Keep source notes, follow-on
   footnotes, editorial notes, headings, table cells, Persons entries, and
   transcribed document text separate.
3. Review units in document order, but keep a packet-level memory of recurring
   issues so duplicate comments can be merged.
4. Prefer one clear comment per unresolved fact. Do not attach identical
   comments to every occurrence if a global comment and evidence-request count
   would serve the compiler better.
5. If two findings target the same phrase, keep the higher-severity finding and
   merge the lower-severity rationale into its comment or discrepancy tally.
6. If a direct edit and a comment both target the same defect, apply the direct
   edit only when it fully resolves the defect; otherwise use a comment.
7. After the LLM response, the wrapper validates all edits, applies only safe
   tracked changes, inserts comments, merges style-discrepancy counts, and
   writes the audit report.

Duplicate-suppression rules:

- Merge repeated URL-only source-note findings into one global comment plus
  unit-level comments only where the missing archival path differs.
- Merge repeated authority-control issues by person, office, acronym, source
  list entry, or index term.
- Merge repeated physical/routing issues by source image, actor or hand,
  physical feature, stamp or notation phrase, placement, approval/checkmark
  status, read-by/seen status, routing status, correspondence profile,
  distribution list, attached profile, or no-record/search context.
- Merge repeated scheduled-publication questions by target volume or chapter.
- Merge repeated summit/public-event chronology issues by event, date span,
  public-source basis, diary/schedule basis, press basis, or full-record target.
- Merge repeated public-source issues by speaker, event/publication, public
  source, page/range, transcript basis, excerpt/full-text target, archival-draft
  relationship, selected/supplemental status, or broadcast/delivery fact.
- Merge repeated retrospective-account issues by author/source, publication or
  collection, page/locator, event described, official-record relationship,
  selected/supplemental status, corroborating record, conflict status, or
  recollection type.
- Merge repeated foreign/international-organization issues by body or actor,
  foreign copy, translation status, treaty party, successor state,
  meeting/conference, publication, selected/source role, concurrence basis, or
  cross-volume target.
- Merge repeated congressional/legal authority issues by committee, hearing,
  public law, statute, section, vote/action stage, determination, certification,
  Executive Order, oversight body, or Senate advice-and-consent target.
- Merge repeated economic/financial issues by institution, program, table,
  amount, fiscal year, policy stage, legal basis, or attachment target.
- Merge repeated intelligence/law-enforcement issues by agency or equity,
  record type, source family, operation/event, source-and-methods basis,
  law-enforcement status, redaction/sanitization basis, oversight target, or
  foreign-service contact.
- Merge repeated military/crisis issues by operation or crisis, source family,
  record type, operation stage, order/authorization basis, force/unit,
  chronology or time zone, host-nation/coalition role, casualty/damage basis,
  contingency plan, or military-assistance authority.
- Merge repeated human-rights/refugee/global-issues problems by report family,
  country or population scope, public/archival basis, legal/program authority,
  amount or metric, stage/status, sanctions/waiver basis, international-
  organization role, PVO role, public-health source, population-policy issue, or
  environmental treaty/protocol issue.
- Merge repeated wrapper-safety issues by Word structure, such as tables,
  existing tracked changes, footnote references, fields, or comments.
- Do not merge findings that require different evidence requests or different
  verification targets.

Mode-specific output expectations:

- `light` can return `pass_with_comments` even when many research tasks remain,
  if the packet is clearly not publication-ready and no unsafe publication
  assertions were introduced.
- `normal` should return `needs_revision` when major source-note,
  classification, attachment, chronology, authority, or cross-reference
  problems remain in publishable apparatus.
- `exhaustive` should return `needs_revision` or `blocked` when evidence
  requests would prevent a final style pass from being completed.
- Any mode should return `blocked` when extraction cannot distinguish
  transcribed text from editorial apparatus, or when the wrapper cannot safely
  apply requested tracked changes.

## 10. Chunking And Cross-Chunk Reconciliation

Long annotation sheets may exceed the context window of a rudimentary
closed-network LLM. Chunking is allowed only after the wrapper has extracted and
unitized the Word file. Never chunk raw Word XML or plain text before preserving
unit ids and exact Word anchors.

Chunking rules:

- Split by stable units, not by arbitrary character count. Keep a source note,
  follow-on footnote, editorial note, table cell, Persons entry, abbreviation
  entry, source-list entry, or heading unit intact.
- Include the same packet-level context in every chunk: volume title, status,
  review mode, volume family, context bundle id, authority-list digest, known
  document-number range, and any existing tracked-change warning.
- Include a small overlap only for surrounding headings, document numbers, and
  neighboring cross-reference context. The LLM must not propose direct edits to
  overlap-only units unless those units are included as editable units in the
  current chunk.
- Mark every unit in the chunk as `editable`, `context_only`, or
  `overlap_context`. Direct edits are allowed only for `editable` units.
- Preserve document order across chunks. The wrapper should be able to sort all
  findings back into original Word order.
- If a cross-reference target falls outside the current chunk, the LLM should
  use `comment_only` with `evidence_request` set to `cross_reference` unless the
  wrapper supplies the target in authority context.

Required chunk manifest fields:

```json
{
  "packet_id": "uploaded-file-2026-06-03",
  "chunk_id": "chunk-003",
  "chunk_count": 12,
  "unit_id_start": "footnote-0041",
  "unit_id_end": "editorial-note-0057",
  "editable_unit_count": 17,
  "context_only_unit_count": 4,
  "review_mode": "normal",
  "series_status": "being_cleared",
  "volume_family": "arms control and national security",
  "context_bundle_id": "frus-1981-1992-context-2026-06-03"
}
```

Cross-chunk memory:

- The wrapper may send a compact summary of prior findings to later chunks, but
  that summary is not editable evidence. Direct edits still require an exact
  `original_text` match in the current chunk's mapped `exact_text`.
- Carry forward only stable packet-level facts: repeated missing source family,
  repeated authority-control issue, unresolved General Editor discrepancy,
  duplicate scheduled-publication target, or repeated wrapper-safety problem.
- Do not carry forward speculative corrections, guessed document numbers, or
  inferred classifications from an earlier chunk.
- If later chunks contradict earlier findings, prefer a reconciliation comment
  or General Editor discrepancy tally item over silently overwriting the earlier
  result.

Reconciliation pass:

1. Validate every chunk response against the schema.
2. Reject direct edits that target non-editable, context-only, or overlap-only
   units.
3. Merge duplicate findings according to the duplicate-suppression rules in the
   review-mode section.
4. Merge `style_discrepancy_tally` items by category, style question, and
   variants observed; preserve representative unit ids from multiple chunks.
5. Recheck cross-references whose targets appeared in later chunks. Upgrade a
   finding only if the wrapper now has exact evidence; otherwise keep
   `comment_only`.
6. Check for contradictions: one chunk says `no_change` while another flags the
   same phrase, source family, authority entry, or cross-reference as a defect.
   Resolve by severity and evidence, then record the reconciliation in the
   audit report.
7. Produce one final merged JSON object for Word application. The Word wrapper
   should apply tracked changes only from the merged object, never from raw
   per-chunk output.

Chunking failure modes:

- If chunking loses exact anchors, return `blocked`.
- If unit ids are duplicated across chunks without an overlap flag, return
  `blocked`.
- If a chunk contains only summarized text and no mapped editable units, it may
  produce global comments or discrepancy-tally items, but no direct edits.
- If the wrapper cannot reconcile duplicate or contradictory findings, preserve
  the safer `comment_only` finding and report the unresolved conflict.

## 11. Acceptance And Evaluation Protocol

Before using the checker on production annotation sheets, the closed-network
team should run a small golden packet and confirm that the LLM, validator, and
Word wrapper behave as a conservative FRUS editor would. Passing the JSON schema
is necessary but not sufficient.

Golden packet composition:

- At least one source note from a published Reagan or Bush national-security or
  arms-control volume, used as a no-change control.
- At least one classification/handling example with verified original markings,
  handling controls, precedence, `No classification marking`, or paragraph
  markings, used as a no-change or comment-only control.
- At least one physical/routing/marginalia example with initials, handwritten
  marginalia, highlighting, underlining, checkmark, stamped notation, read-by or
  seen stamp, sent-for-action routing, correspondence profile, approval box,
  unknown-hand note, or source-image placement evidence.
- At least one translated or foreign-origin document with official,
  unofficial, informal, Language Services, typed-signature, or foreign-copy
  provenance language, used as a no-change or comment-only control.
- At least one foreign-government, international-organization, regional-body,
  alliance, coalition, peacekeeping, conference, or multilateral example with
  selected-source role, venue role, policy-subject role, foreign-copy
  provenance, translation status, treaty-party status, or successor-state
  context.
- At least one treaty/legal-instrument package with treaty text, protocol,
  annex, memorandum of understanding, associated letter, declaration, statement,
  article-by-article analysis, public transmittal, ratification, or
  entry-into-force language.
- At least one document heading, dateline, subject/title line, or public-title
  line from a published Reagan or Bush volume, used as a no-change or
  comment-only metadata control.
- At least one foundations/public diplomacy or organization/management note in
  which public text is the selected evidence, not a defect.
- At least one summit, travel, ceremony, interview, public-address, press
  conference, toast, or congressional-testimony editorial note where public
  sources, diary/schedule evidence, and cross-volume full-record language must
  be kept distinct.
- At least one public-diplomacy/public-source example with a speech, press
  release, interview, broadcast, testimony, Public Papers citation, Department
  of State Bulletin citation, newspaper excerpt, full-text pointer, diary
  context, speech-file draft, or briefing material that may be selected evidence
  rather than mere background.
- At least one memoir/oral-history/recollection example with a memoir, published
  diary, personal diary, later interview, oral history, newspaper retrospective,
  selected/supplemental status, official-record relationship, corroborating
  record, or conflict with the official record.
- At least one congressional/legal-authority example with testimony, hearing,
  public law, Stat. citation, continuing or joint resolution, Presidential
  Determination, certification, Executive Order, oversight, independent counsel,
  Senate advice-and-consent, or attached-but-not-printed legal material.
- At least one economic/financial example with IMF, World Bank, MDB, Treasury,
  AID, OPIC, Eximbank, GATT, UNCTAD, OECD, debt strategy, foreign-assistance
  budget, table, dollar amount, percentage, fiscal year, loan, guarantee,
  quota, replenishment, conditionality, or attached-but-not-printed financial
  material.
- At least one intelligence, covert-action, law-enforcement, counternarcotics,
  counterterrorism, or agency-equity example with CIA/System IV, DOD, JCS,
  Intelligence Community, DEA/FBI/Justice if supplied, source-and-methods,
  redaction/sanitization, oversight committee, or public-policy-only context.
- At least one military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room,
  combat-operation, contingency-plan, coalition, host-nation notification,
  peacekeeping, security-assistance, force/unit, or casualty/damage example
  where operation stage and chronology must be preserved.
- At least one human-rights/refugee/global-issues example with a Country Report,
  refugee or food-aid policy, AIDS/HIV public-health source, population-policy
  contribution, ozone or environmental treaty/protocol item, sanctions/waiver
  issue, international organization, PVO, PL 480, Section 416, Section 206,
  amount/metric, or status-page family context.
- At least one research-stage sheet with working labels, candidate notes, URL
  locators, or missing scan requests that should become comments rather than
  polished source-note prose.
- At least one clearance-stage sheet with unresolved declassification,
  attachment, agency-equity, or scheduled-publication language.
- At least one Persons, abbreviations, source-list, or index unit with
  authority-control issues.
- At least one Word file containing footnotes, comments, tables, and existing
  tracked changes so the wrapper safety rules are exercised.
- At least one intentionally unsafe unit of transcribed document text that the
  checker must not edit.

Minimum acceptance gates:

| Gate | Must prove | Failure mode |
| --- | --- | --- |
| JSON validity | Every LLM response validates against the required output schema. | Reject the run and keep the Word file unchanged. |
| Exact-anchor discipline | Every direct edit uses an `original_text` that appears exactly once in the mapped `exact_text`. | Reject the edit and record the rejection in the audit report. |
| Word safety | Direct edits do not overlap existing revisions, fields, comments, note references, bookmarks, table boundaries, or unmapped XML. | Downgrade to `comment_only` or reject. |
| Source fidelity | The checker does not invent repository paths, classifications, document numbers, publication status, attachment status, declassification outcomes, or authority-list facts. | Treat as blocker and revise the prompt or wrapper context. |
| No-change judgment | Excellent non-template notes are left alone, especially where published FRUS practice supports the variation. | Tune calibration before production use. |
| Stage awareness | Research, clearance, anticipated, planned, and published contexts produce different behavior. | Refresh status context and retest. |
| Word output integrity | The exported `.docx` opens cleanly and the counts of tracked edits, comments, and rejected edits match the audit report. | Do not release the output file. |

Expected behavior by test family:

- Published-pattern test: return `no_change` or minor style comments for a
  strong published-style note, and do not force it into a generic template.
- Classification-handling test: preserve verified classification, handling,
  precedence, and no-marking phrases; comment rather than invent when original
  marking evidence is missing or release status is confused with original
  classification.
- Physical/routing/marginalia test: preserve exact actor/hand, stamp language,
  initials, marginalia, highlighting, underlining, checkmarks, signed/seen/read
  status, sent-for-action or information routing, correspondence profile,
  approval-line status, placement, and linked attachment context; comment rather
  than infer when physical-evidence basis is missing.
- Translation/foreign-origin test: preserve official/unofficial/informal
  translation language, foreign-copy provenance, typed-signature notes, and
  bracket-treatment facts; comment rather than invent when the translation basis
  is missing.
- Foreign/international-organization test: preserve exact body identity,
  source-versus-subject status, venue versus actor role, foreign-copy
  provenance, concurrence basis, treaty-party or successor-state status,
  publication details, and selected/supplemental role; comment rather than
  invent when the foreign or organization basis is missing.
- Treaty/legal-instrument test: preserve component identity,
  integral-versus-associated distinctions, public/archival basis, transmittal
  context, ratification, and entry-into-force language; comment rather than
  invent when the treaty component or legal-status basis is missing.
- Document-metadata test: preserve correct document headings and datelines, and
  comment rather than invent when sender, recipient, place/date, subject, public
  title, or internal number evidence is missing.
- Public-source test: preserve selected public, printed, speech, hearing,
  testimony, interview, or treaty text when the volume family makes that source
  appropriate.
- Summit/public-event test: preserve event sequence, public-source basis,
  diary/schedule basis, press basis, and full-record-elsewhere language; comment
  rather than invent when time zone, participant basis, public source, or target
  record evidence is missing.
- Public-diplomacy/public-source test: preserve selected public documents,
  Public Papers, Department of State Bulletin, official transcript, newspaper,
  broadcast, diary, speech-file, and briefing-material relationships; comment
  rather than invent when publication details, transcript status, excerpt/full
  target, delivery/broadcast basis, or public-versus-archival selection is
  missing.
- Memoir/oral-history/recollection test: preserve author/source, title,
  page/locator, event match, selected/supplemental status, official-record
  relationship, corroborating record, attribution, and conflict status; comment
  rather than letting a memoir, diary, oral history, later interview, or press
  retrospective replace the official record.
- Congressional/legal-authority test: preserve committee/hearing identity,
  public-law/statute form, action stage, amount/condition, transmittal basis,
  determination/certification number, Executive Order number, oversight posture,
  and Senate advice-and-consent language; comment rather than invent when the
  legal authority basis is missing.
- Economic/financial-data test: preserve institution identity, acronyms, dollar
  amounts, percentages, currencies, fiscal years, table cells, program names,
  policy stage, and attachment status; comment rather than invent when the
  financial-data basis is missing.
- Intelligence/law-enforcement test: preserve agency identity, source family,
  original classification/handling, source-and-methods caution, oversight
  basis, law-enforcement status, public-policy-only limits, and release or
  sanitization status; comment rather than invent when agency-equity or
  operational proof is missing.
- Military/crisis test: preserve source family, operation stage,
  order/authorization basis, force/unit identity, chronology, time zone,
  handling/precedence, host-nation/coalition role, casualty/damage basis,
  contingency-plan status, and distinction between planning, notification,
  execution, public statement, and after-action context; comment rather than
  invent when military-operation proof is missing.
- Human-rights/refugee/global-issues test: preserve report family,
  country/population scope, public versus archival basis, legal/program
  authority, amount or metric, stage/status, sanctions/waiver basis,
  international-organization role, PVO role, public-health source,
  population-policy context, and environmental treaty/protocol status; comment
  rather than invent when humanitarian-rights proof is missing.
- Research-stage test: identify working labels and missing evidence, but avoid
  converting source leads into publication-ready assertions.
- Clearance-stage test: protect declassification, attachment, agency-equity,
  and scheduled-publication claims from overconfident direct edits.
- Word-safety test: reject or comment on edits that overlap existing tracked
  changes, comments, fields, footnote references, tables, or ambiguous XML
  anchors.
- Transcribed-text test: do not edit the document body unless the user requested
  transcription review.
- Authority-control test: flag date-bounded titles, variant names, office
  changes, acronym form, repository hierarchy, or document-number indexing
  problems without inventing the replacement fact.

Suggested scoring rubric:

- `pass`: all blockers and major issues found; no invented facts; no unsafe
  direct edits; no false changes to excellent controls; Word output validates.
- `pass_with_comments`: no unsafe edits or invented facts, but some minor issues
  are missed or some comments are too general.
- `needs_revision`: any major missed issue, repeated over-editing of good
  notes, weak stage awareness, or inconsistent direct-edit/comment-only choice.
- `blocked`: any invented archival fact, unsafe edit applied to Word XML,
  corruption of the output `.docx`, or direct edit to transcribed document text
  without user authorization.

Human review requirements:

- A FRUS compiler or editor should inspect every golden-packet result before
  production use.
- For each accepted direct edit, confirm that the track change appears at the
  intended phrase and preserves surrounding footnotes, comments, formatting, and
  paragraph structure.
- For each comment-only finding, confirm that the comment is useful enough for a
  compiler to act on without searching the audit log.
- Re-run the golden packet whenever the standard Markdown, wrapper extractor,
  WordprocessingML edit applier, model, or status-page context changes.
- Keep the golden packet on the closed network, with document excerpts cleared
  for that environment.

## 12. General Editor Style Discrepancy Tally

The checker should keep a separate running tally of style discrepancies for the
General Editor. This tally is for questions where published FRUS practice,
local exemplar sheets, or in-preparation volume habits show more than one
defensible form. The checker should not flatten these variations into one style
unless the uploaded standard, General Editor guidance, or direct evidence makes
the answer clear.

Use the discrepancy tally for:

- Published or exemplar notes that use different but plausible source-note
  ordering, repository naming, collection naming, or source-family detail.
- Different treatment of public, printed, speech, hearing, testimony, treaty, or
  memoir sources as selected documents versus supporting context.
- Variations in how much summit/travel/event sequence to print in an editorial
  note, how much Public Papers, press, diary, schedule, or itinerary basis to
  name in the note text, and whether full-record-elsewhere language belongs in
  the same note or a follow-on footnote when the underlying facts are sound.
- Variations in how much public-diplomacy/public-source detail to print,
  including speech title, issuing office, broadcast facts, Public Papers,
  Department of State Bulletin, Congressional Record, official transcript,
  newspaper excerpt, full-text pointer, diary context, speech-file draft,
  briefing material, and selected-versus-supplemental source status when the
  underlying facts are sound.
- Variations in how much memoir, published diary, personal diary, oral-history,
  later-interview, press-retrospective, newspaper-recollection, page/locator,
  official-record relationship, corroborating-record, or conflict-status detail
  to print when the underlying facts are sound.
- Variations in how much congressional/legal detail to print, including
  committee and hearing names, Congress/session, Public Law and Stat. citations,
  section numbers, vote/action stage, appropriations conditions,
  determination/certification numbers, Executive Order numbers, oversight
  bodies, independent counsel language, and Senate advice-and-consent context
  when the underlying facts are sound.
- Variations in how much economic/financial detail to print, including
  institution acronyms, dollar amounts, percentages, fiscal years, table
  captions, program names, debt/loan/guarantee terminology, quota or
  replenishment language, and policy-stage explanation when the underlying facts
  are sound.
- Variations in how much intelligence, covert-action, law-enforcement,
  counternarcotics, counterterrorism, agency-equity, source-and-methods,
  oversight, sanitized-record, redaction/release, foreign-service-contact, or
  public-policy-only detail to print when the underlying facts are sound.
- Variations in how much military, defense, crisis, operation-stage,
  force/unit, host-nation notification, coalition/allied role, time-zone,
  contingency-plan, security-assistance, casualty/damage, Situation Room, DOD,
  OSD, JCS, or DIA detail to print when the underlying facts are sound.
- Variations in how much human-rights report, refugee, immigration, asylum,
  migration, famine, emergency relief, food-aid, public-health, AIDS/HIV,
  population-policy, environmental, sanctions, waiver, certification,
  public-report, international-organization, PVO, AID, PRM, PL 480, Section 416,
  Section 206, amount/metric, or stage/status detail to print when the underlying
  facts are sound.
- Variations in how much treaty component detail to print, where to place
  protocol, annex, memorandum-of-understanding, letter, declaration, statement,
  article-by-article analysis, transmittal, ratification, or entry-into-force
  language, and how to distinguish integral treaty components from associated
  but non-integral materials when the underlying facts are sound.
- Variations in `No classification marking`, classification/handling order,
  handling punctuation, paragraph-marking treatment, declassification phrasing,
  or omission/bracket language where the underlying evidence is sound.
- Variations in how much handwriting, initials, stamps, read-by/seen notations,
  signed status, approval checkmarks, highlighting, underlining, marginalia,
  sent-for-action or information routing, correspondence profiles, distribution,
  source-image placement, or unknown-hand evidence to print when the underlying
  facts are sound.
- Variations in `Attached but not printed`, `Not found attached`, `Printed as
  Document [n]`, appendix, tab, enclosure, or facsimile wording.
- Variations in `scheduled for publication`, `printed in`, same-volume
  cross-references, footnote cross-references, or document-number style.
- Variations in document-heading form, place/date line placement,
  subject/title-line treatment, public-title treatment, internal record-number
  placement, or office-title detail where the underlying metadata is sound.
- Variations in where to place translation, foreign-origin copy,
  typed-signature, facsimile, bracket-treatment, or official/unofficial
  translation language when the underlying evidence is sound.
- Variations in how much foreign-government, international-organization,
  regional-body, alliance, coalition, peacekeeping, conference, treaty-party,
  successor-state, copy-provenance, concurrence, or selected-versus-supplemental
  role detail to print when the underlying facts are sound.
- Different Persons, abbreviations, source-list, or index authority forms that
  may reflect volume-specific practice rather than error.
- Variations in telegram, cable, STARS, CFPF, PROFS, W Files, System IV, or
  agency-message detail when the message identity is sound but published or
  local examples differ on how much metadata to print.
- Repeated wrapper-safety or extraction ambiguities that suggest the tool needs
  a house rule before it can safely redline similar Word structures.

Do not use the discrepancy tally for:

- Invented facts, missing evidence, wrong source paths, guessed classifications,
  or unsafe direct edits. These are findings, not style discrepancies.
- Clear violations of the current standard, such as URL-only source notes when
  the archival path is supplied.
- One-off typos, punctuation slips, or local formatting errors that can be
  corrected directly.
- Transcribed document text that the checker is not authorized to edit.

Tally behavior:

- The LLM should add a `style_discrepancy_tally` item when it sees a real style
  variation that could affect future FRUS house practice.
- The tally should remain a separate General Editor section of the audit report,
  not a hidden validator note and not a forced redline.
- The wrapper should merge duplicate discrepancy items across the uploaded
  packet and, if configured, across prior runs of the same project.
- The wrapper should append new discrepancy items to the running project tally
  instead of overwriting prior General Editor questions. A later run may update
  counts, examples, and risk, but it should preserve the question history until
  the General Editor resolves or retires it.
- The tally should preserve representative unit ids, short examples, source
  labels or URLs supplied in context, counts, and the exact question for the
  General Editor.
- The tally should not force a redline. For the affected unit, use `no_change`
  when the note is acceptable as written, or `comment_only` when the compiler
  needs guidance before final style.
- The audit report should separate the discrepancy tally from defects. A volume
  can pass the checker while still producing style questions for future
  guidance.

Suggested tally format:

| Discrepancy id | Category | Style question | Variants observed | Count | Risk | General Editor question |
| --- | --- | --- | --- | ---: | --- | --- |
| style-discrepancy-0001 | source_note | Whether Bush H-Files citations should always name the subseries when supplied. | Generic H-Files; H-Files, NSR Files | 3 | medium | Should the checker enforce subseries naming as direct style when the subseries is present? |
| style-discrepancy-0002 | treaty_legal_instrument | How much START treaty-package component detail should appear in source notes versus editorial notes. | Treaty text only; treaty plus protocols, annexes, and memorandum of understanding; associated letters and statements in editorial note | 2 | medium | Should the checker enforce a house form for integral treaty components and associated-but-not-integral materials, or only tally the variation? |
| style-discrepancy-0003 | summit_public_event | How much summit/travel/public-event chronology should be printed inside editorial notes versus follow-on footnotes. | Chronological narrative with Public Papers citations in note text; separate follow-on footnotes for public remarks and full-record targets | 2 | medium | Should the checker enforce a standard form for summit/event editorial notes, or preserve both forms and tally the variation? |
| style-discrepancy-0004 | congressional_legal_authority | How much legal-authority detail should appear in notes when the law, hearing, or transmittal fact is sound. | Public Law and Stat. citation plus action stage; shorter public-law or committee reference with source citation elsewhere | 2 | medium | Should the checker enforce full legal-authority citation form, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0005 | economic_financial_data | How much economic/financial data detail should appear in notes when figures and source basis are sound. | Full institution acronym plus amount, fiscal year, and table/source basis; shorter policy-description form with figure citation elsewhere | 2 | medium | Should the checker enforce full financial-data citation form, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0006 | intelligence_law_enforcement | How much agency-equity, source-and-methods, oversight, redaction/sanitization, or public-policy-only detail should appear when the facts are sound. | Full agency/source-family and oversight basis in note; shorter sensitive-record phrasing with supporting detail in audit/comment context | 2 | high | Should the checker enforce a house form for sensitive-record detail, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0007 | public_diplomacy_public_source | How much public-source and archival-draft context should appear when a speech, interview, testimony, or press item is selected evidence. | Public Papers or Bulletin citation plus full-text, diary, and briefing-file context; shorter selected-public-document note with archival context elsewhere | 2 | medium | Should the checker enforce a standard public-source selected-document form, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0008 | foreign_international_organization | How much foreign-copy, international-organization, regional-body, treaty-party, successor-state, or multilateral role detail should appear when the facts are sound. | Full body/actor identity plus source-versus-subject and copy-status detail; shorter organization reference with supporting detail in source/audit context | 2 | medium | Should the checker enforce a house form for foreign/international-organization role detail, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0009 | military_crisis_operations | How much military/crisis operation-stage, force/unit, coalition, host-nation, time-zone, or casualty/damage detail should appear when the facts are sound. | Full operation-stage and chronology detail in note; shorter military/crisis phrasing with supporting detail in audit/comment context | 2 | high | Should the checker enforce a house form for military/crisis detail, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0010 | human_rights_refugee_global_issues | How much human-rights/refugee/global-issues basis should appear when the report, program, amount, source, organization, and status facts are sound. | Full report or program authority plus public/archival basis, amount/metric, organization role, and stage/status; shorter issue-area note with supporting detail in audit/comment context | 2 | medium | Should the checker enforce a house form for global-issues detail, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0011 | physical_routing_marginalia | How much physical, routing, approval, read-by, and marginalia evidence should appear when the source-image facts are sound. | Full actor/hand plus placement, stamp/notation phrase, action status, and linked attachment/profile; shorter physical-evidence note with supporting detail in audit/comment context | 2 | medium | Should the checker enforce a house form for physical and routing evidence, or tally volume-specific variation for General Editor decision? |
| style-discrepancy-0012 | memoir_oral_history_recollection | How much memoir, diary, oral-history, or later-recollection detail should appear when the account and official-record relationship are sound. | Full author/title/page plus official-record relationship and corroborating record; shorter recollection note with supporting detail in audit/comment context | 2 | medium | Should the checker enforce a house form for retrospective accounts, or tally volume-specific variation for General Editor decision? |

Risk levels:

- `low`: Variation is harmless and mostly cosmetic, but worth recording for
  consistency.
- `medium`: Variation could affect source clarity, cross-reference stability, or
  authority-control consistency.
- `high`: Variation could mislead readers if unresolved, but the checker lacks
  authority to decide the house rule.

## 13. Offline Context Bundle Requirements

The checker is designed for a closed network. That means the wrapper should not
ask the LLM to browse live History Office pages during a review run. Instead,
prepare a small, dated context bundle outside the run, load it with the uploaded
Word file, and cite the bundle version in the audit report.

Required bundle files:

- `status_snapshot`: a dated capture of the official Status of the Series page,
  including the production stages and the current entries relevant to Reagan
  and George H.W. Bush volumes.
- `volume_registry`: official volume ids, full titles, administration,
  date span, current status, chapter status if applicable, and official
  history.state.gov URL.
- `volume_family_map`: the family routing used by this checker, with each
  volume mapped to one or more families and a confidence level.
- `source_family_map`: known source ecologies for the relevant volume or
  family, such as Reagan Library NSC files, PROFS, W Files, System IV, Bush
  H-Files, Scowcroft/Gates files, State CFPF, lot files, STARS, public sources,
  private papers, agency records, or foreign/international-organization records.
- `physical_routing_map`, when available: source-image and physical-evidence
  facts for handwritten notes, initials, marginalia, highlighting, underlining,
  checkmarks, stamps, read-by/seen notations, signed status, approval lines,
  sent-for-action or sent-for-information routing, correspondence profiles,
  distribution lists, attached routing slips, actor/hand, placement,
  linked-attachment context, no-record/search context, verification status, and
  source URLs.
- `classification_marking_map`, when available: original classification,
  handling, precedence, paragraph-marking, verified absence, and source-phrase
  evidence for source notes, attachments, captions, and selected document
  components.
- `translation_map`, when available: original language, translation status,
  translation office, source phrase, foreign-origin provenance, copy basis,
  typed-signature or facsimile status, bracket treatment, and agency or
  foreign-government equity.
- `foreign_international_org_map`, when available: foreign government,
  successor state, international organization, regional body, alliance,
  coalition, peacekeeping force, conference, international financial
  institution, treaty party, depositary, body role, source-versus-subject
  status, copy provenance, translation status, concurrence basis, publication
  details, selected/supplemental status, verification status, and source URLs.
- `treaty_component_map`, when available: treaty family, component type, title,
  integral-versus-associated status, related components, public/archival basis,
  ratification or entry-into-force status, source phrase, and source URLs.
- `event_chronology_map`, when available: summit, travel, ceremony, speech,
  interview, press conference, toast, testimony, public remarks, itinerary,
  diary/schedule basis, public-source basis, press basis, participant basis,
  full-record target, verification status, and source URLs.
- `public_source_map`, when available: speech, interview, press release, press
  conference, briefing, broadcast, testimony, public remarks, Public Papers,
  Department of State Bulletin, Congressional Record, official transcript,
  newspaper excerpt, publication details, delivery/broadcast basis, full-text
  target, excerpt status, diary context, archival draft or briefing-file
  context, selected/supplemental status, verification status, and source URLs.
- `retrospective_account_map`, when available: memoir, published diary, personal
  diary, oral history, later interview, recollection, press retrospective,
  newspaper account, author/source, publication or collection, page/locator,
  event or document described, official-record relationship,
  selected/supplemental status, corroborating record, conflict status,
  verification status, and source URLs.
- `congressional_legal_map`, when available: testimony, hearing, committee,
  Congress/session, budget message, public law, Stat. citation, statutory
  section, continuing or joint resolution, vote/action stage, amount, condition,
  congressional notification, Presidential Determination, certification,
  Executive Order, independent counsel, oversight body, Senate advice-and-consent
  context, attachment status, verification status, and source URLs.
- `economic_financial_map`, when available: economic, debt, trade,
  foreign-assistance, budget, IMF, World Bank, IBRD, MDB, GATT, UNCTAD, OECD,
  AID, OPIC, Eximbank, commercial-bank, Paris Club, commodity, table, amount,
  percentage, currency, fiscal-year, loan, guarantee, quota, replenishment,
  conditionality, policy-stage, attachment-status, source-basis, and source-URL
  metadata.
- `sensitive_record_map`, when available: intelligence, covert-action,
  law-enforcement, counternarcotics, counterterrorism, agency-equity,
  source-and-methods, operational, oversight, foreign-service-contact,
  redaction/sanitization, original classification/handling, public-policy-only
  status, source-family, verification-status, and source-URL metadata.
- `military_crisis_map`, when available: DOD, OSD, JCS, DIA, Situation Room,
  NSC crisis, combat-operation, military strike, contingency plan, CONPLAN,
  deployment, port visit, exercise, security assistance, host-nation
  notification, coalition, peacekeeping, casualty/damage, after-action,
  operation-stage, force/unit, chronology, time-zone, classification/handling,
  verification-status, and source-URL metadata.
- `human_rights_refugee_map`, when available: human-rights report, refugee,
  immigration, asylum, migration, famine, emergency relief, food aid, PL 480,
  Section 416, Section 206, AID, PRM, PVO, public-health, AIDS/HIV, population
  policy, UNFPA, environmental issue, ozone, whaling, sanctions, waiver,
  certification, public-report, international-organization, country or
  population scope, public/archival basis, legal/program authority,
  amount/metric, stage/status, verification-status, and source-URL metadata.
- `authority_lists`, when available: Persons, abbreviations, source-list
  entries, index terms, known document numbers, chapter titles, and related
  volume cross-references.
- `published_pattern_extracts`: short, cleared examples from published FRUS
  pages used as no-change or style controls, with source URLs and capture date.
- `local_exemplar_notes`: approved internal examples, such as a clean
  annotation-sheet model, with provenance and any access restrictions.

Recommended bundle metadata:

```json
{
  "bundle_id": "frus-1981-1992-context-2026-06-03",
  "created_at": "2026-06-03",
  "created_by": "FRUS Annotation Checker wrapper",
  "status_snapshot_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
  "status_snapshot_captured_at": "2026-06-03",
  "included_volume_ids": [
    "frus1981-88v44p1",
    "frus1989-92v31"
  ],
  "offline_use": true,
  "internet_access_during_review": false
}
```

Bundle-use rules:

- The LLM may use the context bundle to choose review posture, identify likely
  volume family, avoid stale cross-reference wording, and decide whether a
  finding needs `comment_only`.
- The LLM must not use the bundle to invent a source note, classification
  marking, attachment status, declassification outcome, or document number that
  is not present in the uploaded Word file or explicit wrapper context.
- If the bundle status is older than the wrapper's configured freshness window,
  add a global info comment warning that publication/status checks may be stale.
- If the uploaded Word file and bundle disagree about a volume title, chapter,
  document number, or status, treat the issue as `comment_only` with
  `evidence_request` set to the most specific missing proof.
- If a volume appears in both a published-pattern extract and an in-preparation
  status list, prefer the explicit `series_status_context` supplied for the
  uploaded file and ask for confirmation rather than guessing.
- Preserve source URLs and capture dates in the audit report. On a closed
  network, provenance is part of the evidence.

Context freshness guidance:

- Refresh `status_snapshot` before any production batch, release deadline, or
  final style pass.
- Refresh `authority_lists` when document numbers, Persons entries,
  abbreviations, source-list entries, chapter titles, or cross-volume references
  change.
- Refresh `published_pattern_extracts` when a newly published Reagan or Bush
  volume becomes a better pattern for the uploaded family.
- Do not block a source-note style pass merely because the status snapshot is
  stale, unless the run would change `scheduled for publication`, `printed in`,
  document numbers, chapter status, or publication-status language.

### 13.1 Status Snapshot Registry Validation

Store status-page context as structured data, not prose. A closed-network model
should not have to infer from a pasted status page whether a volume is
published, anticipated, being cleared, being researched, or planned. The wrapper
should resolve that before review and supply a compact registry entry for the
target volume plus any cross-referenced volumes.

Keep two concepts separate:

- `production_stage`: where the manuscript sits in the FRUS production process,
  such as `being_cleared`, `being_researched`, `planned`, or `published`.
- `release_bucket`: where the public status page lists it for release tracking,
  such as `published_2025`, `anticipated_2026`, or `chapters_outstanding`.

Do not treat `anticipated_2026` as a production stage. A volume can be both
anticipated and being cleared. That is an overlay, not a contradiction.

Minimum registry entry:

```json
{
  "status_snapshot": {
    "captured_at": "2026-06-03",
    "source_url": "https://history.state.gov/historicaldocuments/status-of-the-series",
    "production_stage_terms": [
      "planning",
      "research",
      "clearance",
      "publication"
    ],
    "release_buckets_seen": [
      "published_2025",
      "anticipated_2026",
      "volumes_with_chapters_outstanding",
      "volumes_in_progress"
    ]
  },
  "entries": [
    {
      "volume_id": "frus1981-88v44p1",
      "official_title": "1981-1988, Volume XLIV, Part 1, National Security Policy, 1985-1988",
      "administration": "Reagan",
      "production_stage": "published",
      "release_bucket": "published_2025",
      "chapter_status": [],
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v44p1",
      "volume_families": [
        "arms control and national security"
      ],
      "checker_use": "published_pattern_evidence"
    },
    {
      "volume_id": "frus1989-92v31",
      "official_title": "1989-1992, Volume XXXI, START I, 1989-1991",
      "administration": "George H.W. Bush",
      "production_stage": "published",
      "release_bucket": "published_2025",
      "chapter_status": [],
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1989-92v31",
      "volume_families": [
        "arms control and national security"
      ],
      "checker_use": "published_pattern_evidence"
    },
    {
      "volume_id": "frus1981-88v16",
      "official_title": "1981-1988, Volume XVI, South America",
      "administration": "Reagan",
      "production_stage": "being_cleared",
      "release_bucket": "anticipated_2026",
      "chapter_status": [
        "Venezuela listed under anticipated 2026"
      ],
      "history_state_url": "https://history.state.gov/historicaldocuments/frus1981-88v16",
      "volume_families": [
        "Latin America and Caribbean"
      ],
      "checker_use": "late_stage_status_context"
    }
  ]
}
```

Current snapshot summary for 1981-1992 work:

- Recent published pattern controls: Reagan `1981-1988, Volume XLIV, Part 1,
  National Security Policy, 1985-1988` and Bush `1989-1992, Volume XXXI, START
  I, 1989-1991`.
- Anticipated 2026 overlay: Reagan `Volume XVI, South America`, with Venezuela
  listed, and Reagan `Volume XXVIII, China, 1981-1983`.
- In-preparation watchlist: the Reagan and Bush cleared, researched, and planned
  volume lists in section 6.13 are the working router. Refresh them from the
  official status page before any production batch.

Status-registry preflight checks:

- If the uploaded sheet names a volume that is absent from the registry, add a
  global `info` comment for a light review and a `major` comment for normal or
  exhaustive review when cross-references or publication language depend on it.
- If the uploaded sheet's volume number and title point to different registry
  entries, treat the affected cross-references as `comment_only` until the
  compiler resolves the target.
- If `printed in` or `published in` points to a registry target whose
  `production_stage` is not `published`, flag a `major` publication-status
  issue. Do not replace the phrase unless current official status and a stable
  document number are supplied.
- If `scheduled for publication` points to a registry target now marked
  `published`, comment that the language may need updating. Directly changing it
  to `printed in` still requires the exact target document or chapter evidence.
- If a volume appears in both `anticipated_2026` and `being_cleared`, preserve
  both values and do not create a discrepancy item merely for that overlay.
- If published pattern extracts disagree with the registry status for the
  uploaded sheet, prefer `series_status_context` for review posture and record
  the ambiguity in the audit report.
- If a recurring status-language variation is defensible but unsettled, add it
  to `style_discrepancy_tally` with `category` set to `publication_status`
  rather than forcing one house form.

Status-registry freshness gates:

- For any run that may alter `scheduled for publication`, `printed in`,
  anticipated-release language, chapter status, document numbers, or
  cross-volume references, treat a stale or missing status registry as a blocker
  for direct edits and use comments instead.
- For a source-note-only pass that does not alter publication language, a stale
  registry should produce an audit warning but should not stop safe edits to
  source-note form.
- For final style, post-clearance, or release-deadline work, refresh the
  registry immediately before the batch and record the capture date in the audit
  report.

## 14. Audit Report Summary Template

The wrapper may generate a human-readable report after applying changes:

```text
FRUS Annotation Checker Report

Input file: [filename]
Output file: [filename.frus-annotation-check.docx]
Run date: [date]
Checker version: [version]
Output schema: checker-output-v1
Context bundle: [bundle_id and capture date]
Authority registry: [authority_registry_id and capture date]
Document metadata registry: [document_metadata_registry_id and capture date]
Physical/routing registry: [physical_routing_registry_id and capture date]
Classification registry: [classification_registry_id and capture date]
Translation registry: [translation_registry_id and capture date]
Foreign/international-organization registry: [foreign_international_org_registry_id and capture date]
Treaty/legal-instrument registry: [treaty_registry_id and capture date]
Event chronology registry: [event_chronology_registry_id and capture date]
Public-source registry: [public_source_registry_id and capture date]
Retrospective-account registry: [retrospective_account_registry_id and capture date]
Congressional/legal registry: [congressional_legal_registry_id and capture date]
Economic/financial registry: [economic_financial_registry_id and capture date]
Sensitive/intelligence-law-enforcement registry: [sensitive_record_registry_id and capture date]
Military/crisis registry: [military_crisis_registry_id and capture date]
Human-rights/refugee/global-issues registry: [human_rights_refugee_registry_id and capture date]
Source-family registry: [source_family_registry_id and capture date]
Communications registry: [communications_registry_id and capture date]
Attachment registry: [attachment_registry_id and capture date]
Declassification registry: [declassification_registry_id and capture date]
Chronology registry: [chronology_registry_id and capture date]
Cross-reference registry: [cross_reference_registry_id and capture date]
Status snapshot: [status_snapshot URL and captured_at date]
Status registry stale: [yes/no/not supplied]
Review mode: [light/normal/exhaustive]
Chunks processed: [n]
Units reviewed: [n]

Overall status: [pass/pass_with_comments/needs_revision/blocked]

Counts:
- Blocker findings: [n]
- Major findings: [n]
- Minor findings: [n]
- Info comments: [n]
- Direct tracked edits applied: [n]
- Comments inserted: [n]
- LLM edits rejected by validator: [n]
- Evidence requests by type: [source_image n; archival_path n; classification_marking n; etc.]
- Evidence queue open/resolved/deferred/waived/blocked: [open n; resolved n; deferred n; waived n; blocked n]
- Style discrepancies tallied for General Editor: [n]
- Duplicate findings merged: [n]
- Cross-chunk conflicts reconciled: [n]
- Status registry conflicts or stale-publication warnings: [n]
- Authority registry conflicts or unmatched forms: [n]
- Document heading, dateline, title, or caption issues: [n]
- Physical evidence, routing, marginalia, read-by/seen, approval, or placement issues: [n]
- Classification, handling, precedence, or paragraph-marking issues: [n]
- Translation, foreign-origin copy, or language-services issues: [n]
- Foreign-government, international-organization, multilateral, alliance, coalition, conference, treaty-party, or foreign-copy issues: [n]
- Treaty component, integral/associated status, transmittal, ratification, or entry-into-force issues: [n]
- Summit, travel, ceremony, interview, press, testimony, or public-event chronology issues: [n]
- Public diplomacy, speech, press, interview, broadcast, testimony, transcript, full-text, excerpt, diary, or public-source issues: [n]
- Memoir, oral-history, published-diary, later-interview, recollection, selected/supplemental, official-record relationship, corroborating-record, or conflict issues: [n]
- Congressional testimony, hearing, public-law, statute, determination, certification, Executive Order, oversight, or Senate advice-and-consent issues: [n]
- Economic, debt, trade, assistance, amount, fiscal-year, institution, table, or financial-data issues: [n]
- Intelligence, law-enforcement, agency-equity, source-and-methods, operational, oversight, or sanitized-record issues: [n]
- Military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room, contingency, combat-operation, coalition, host-nation, chronology, or casualty/damage issues: [n]
- Human-rights, refugee, immigration, famine, emergency relief, food-aid, public-health, population, environmental, sanctions, waiver, certification, public-report, or global-issues issues: [n]
- Source-family unmatched or ambiguous matches: [n]
- Communications records unmatched or incomplete: [n]
- Attachment status unknown or conflicting: [n]
- Declassification/omission unresolved or conflicting: [n]
- Chronology/meeting/call record issues: [n]
- Cross-reference target, document-number, or scheduled-publication issues: [n]

Major issues:
- [unit_id]: [finding]

Evidence requests:
- [unit_id]: [evidence_request] - [verification_target]

Blocking evidence queue:
- [request_id]: [evidence_request] - [verification_target] - owner [hint] - status [state]

Publication-status warnings:
- [unit_id or global]: [status issue] - [registry target]

Authority-control warnings:
- [unit_id or global]: [authority issue] - [registry target or unmatched form]

Document-metadata warnings:
- [unit_id or global]: [metadata issue] - [heading field, evidence basis, and registry target]

Physical/routing/marginalia warnings:
- [unit_id or global]: [physical/routing issue] - [record type, source family, physical evidence, actor or hand, action/status, placement, linked source or attachment, and verification target]

Classification/handling warnings:
- [unit_id or global]: [marking issue] - [original marking, handling/precedence, and evidence basis]

Translation/foreign-origin warnings:
- [unit_id or global]: [translation/provenance issue] - [translation status, copy basis, and evidence basis]

Foreign/international-organization warnings:
- [unit_id or global]: [foreign/organization issue] - [record type, body/actor, role in unit, source or copy basis, selected/supplemental status, translation/copy status, treaty/conference context, and verification target]

Treaty/legal-instrument warnings:
- [unit_id or global]: [treaty issue] - [component type, integral/associated status, source basis, and legal-status evidence]

Summit/public-event warnings:
- [unit_id or global]: [event issue] - [event type, public-source basis, diary/schedule basis, press basis, and full-record target]

Public-source/public-diplomacy warnings:
- [unit_id or global]: [public-source issue] - [record type, public-source type, basis, selected/supplemental status, date/span, public event/publication, archival/draft context, and verification target]

Memoir/oral-history/recollection warnings:
- [unit_id or global]: [retrospective-account issue] - [record type, author/source, publication or collection, page/locator, event or document described, official-record relationship, selected/supplemental status, corroborating record, conflict status, and verification target]

Congressional/legal warnings:
- [unit_id or global]: [legal-authority issue] - [record type, authority citation, action stage, public/archival basis, and verification target]

Economic/financial warnings:
- [unit_id or global]: [financial-data issue] - [record type, institution, amount/percentage, fiscal year, table/attachment status, and source basis]

Sensitive/intelligence-law-enforcement warnings:
- [unit_id or global]: [sensitive-record issue] - [record type, agency/equity, source family, classification/handling, operational-detail status, oversight/public basis, redaction/release status, and verification target]

Military/crisis warnings:
- [unit_id or global]: [military/crisis issue] - [record type, military/crisis actor, source family, operation/crisis, stage/role, classification/handling, chronology/location basis, and verification target]

Human-rights/refugee/global-issues warnings:
- [unit_id or global]: [humanitarian-rights issue] - [record type, issue area, institution or actor, source family, public/archival basis, legal/program basis, amount or metric, stage/status, and verification target]

Source-family warnings:
- [unit_id or global]: [source-family issue] - [registry target or unmatched family]

Communications-record warnings:
- [unit_id or global]: [record issue] - [record type, identifier, and evidence basis]

Attachment warnings:
- [unit_id or global]: [attachment issue] - [physical/editorial status and target]

Declassification warnings:
- [unit_id or global]: [declassification issue] - [claim type, quantity, and review status]

Chronology warnings:
- [unit_id or global]: [chronology issue] - [event type, record status, and evidence basis]

Cross-reference warnings:
- [unit_id or global]: [cross-reference issue] - [target type, target status, and evidence basis]

Style discrepancy tally:
- [discrepancy_id]: [category] - [style_question] - count [n] - risk [level]

Rejected edits:
- [unit_id]: original_text was not found exactly in target unit.
- [unit_id]: edit rejected because unit was context-only or overlap-only.
```

## 15. Closed-Network Deployment Notes

Minimum components:

- `.docx` extractor that reads body paragraphs, footnotes, endnotes, comments,
  tables, headings, and tracked changes.
- LLM prompt runner with this Markdown standard loaded.
- JSON schema validator for `checker-output-v1`.
- Evidence-request queue builder that groups missing proof by type,
  verification target, owner hint, and blocking state before tracked changes are
  applied.
- WordprocessingML edit applier that can create real tracked insertions,
  deletions, and comments.
- Offline context-bundle loader with status, authority, source-family, and
  provenance metadata.
- Authority-registry validator that reconciles Persons, abbreviations,
  repository/source-list forms, chapter labels, document numbers, and index
  terms before track changes are applied.
- Document-metadata validator that checks document headings, datelines,
  internal document numbers, subject/title lines, public-title lines, captions,
  sender/recipient offices, and source-note linkage before tracked changes are
  applied.
- Classification/handling validator that separates original classification,
  handling controls, precedence, paragraph markings, verified absence of
  markings, and later release/declassification status before tracked changes
  are applied.
- Translation/foreign-origin validator that separates official, unofficial,
  informal, Language Services, and editor-transcribed translations; preserves
  foreign-copy provenance, typed-signature/facsimile status, bracket treatment,
  and agency/foreign-government equity before tracked changes are applied.
- Treaty/legal-instrument validator that separates treaty text, protocols,
  annexes, memoranda of understanding, executive agreements, letters,
  declarations, statements, presidential messages, article-by-article analyses,
  ratification, entry into force, and associated-but-not-integral materials
  before tracked changes are applied.
- Source-family registry validator that preserves published and local source
  ecologies, distinguishes public/printed selected sources from archival
  control copies, and blocks flattening of specific repositories into generic
  source paths.
- Physical/routing evidence validator that distinguishes handwritten notes,
  initials, marginalia, highlighting, underlining, checkmarks, stamps, read-by or
  seen notations, signed status, approval checkmarks, sent-for-action or
  sent-for-information routing, correspondence profiles, distribution lists,
  attached routing slips, actor/hand, placement, and linked attachment or search
  context before tracked changes are applied.
- Communications-record validator that checks telegram, cable, STARS, CFPF,
  PROFS, W Files, System IV, agency-message, and other electronic-message
  identifiers, origin/addressee, date-time group, precedence,
  classification/handling, drafting, clearance, approval, and distribution
  metadata before tracked changes are applied.
- Attachment-status validator that separates physical attachment status from
  editorial printing status and checks tab, enclosure, annex, appendix, and
  facsimile cross-references before tracked changes are applied.
- Declassification and omission validator that distinguishes still-classified
  excisions, unrelated omissions, original brackets, editor insertions,
  release-status notes, and whole-document withholdings before tracked changes
  are applied.
- Chronology and meeting-record validator that distinguishes diary/schedule
  corroboration, call-log evidence, memcons, telcons, minutes, no-record claims,
  and substantive meeting content before tracked changes are applied.
- Summit/public-event chronology validator that distinguishes travel
  itinerary, summit schedule, ceremony, speech, interview, press conference,
  toast, testimony, Public Papers citation, diary/schedule basis, press basis,
  participant basis, and full-record target before tracked changes are applied.
- Memoir/oral-history/recollection validator that distinguishes memoirs,
  published diaries, personal diaries, oral histories, later interviews, press
  retrospectives, newspaper accounts, author/source, publication and page
  locators, selected-versus-supplemental status, official-record relationship,
  corroborating records, and conflict status before tracked changes are applied.
- Congressional/legal-authority validator that distinguishes testimony,
  hearings, committees, Congress/session, public laws, statutes, continuing and
  joint resolutions, vote/action stages, budget or message-to-Congress basis,
  congressional notifications, Presidential Determinations, certifications,
  Executive Orders, oversight, independent counsel, Senate advice and consent,
  ratification, and attached-but-not-printed legal materials before tracked
  changes are applied.
- Economic/financial-data validator that distinguishes economic policy, debt
  strategy, trade, foreign assistance, IMF, World Bank, IBRD, MDBs, GATT,
  UNCTAD, OECD, AID, OPIC, Eximbank, commercial-bank and Paris Club references,
  tables, amounts, percentages, currencies, fiscal years, loans, guarantees,
  quotas, replenishments, conditionality, policy stages, and attached financial
  materials before tracked changes are applied.
- Sensitive-record validator that distinguishes intelligence, covert action,
  law enforcement, counternarcotics, counterterrorism, agency equity,
  source-and-methods, operational claims, oversight basis, redaction or
  sanitization, public-policy-only mentions, and foreign-service contacts before
  tracked changes are applied.
- Military/crisis validator that distinguishes DOD, OSD, JCS, DIA, Situation
  Room, NSC crisis, combat operations, contingency plans, CONPLANs, deployments,
  port visits, exercises, security assistance, host-nation notification,
  coalition or allied support, peacekeeping, casualty/damage claims,
  operation-stage evidence, force/unit identity, chronology, time-zone basis,
  and after-action context before tracked changes are applied.
- Human-rights/refugee/global-issues validator that distinguishes Country
  Reports, human-rights sanctions, refugee/immigration/asylum/migration claims,
  famine and emergency relief, PL 480, Section 416, Section 206, AID, PRM, PVOs,
  public-health and AIDS/HIV sources, population-policy contributions,
  environmental and ozone treaty/protocol material, public-report basis,
  international-organization roles, amounts/metrics, legal/program authority,
  and stage/status before tracked changes are applied.
- Public-source validator that distinguishes public diplomacy, speeches, press
  releases, press conferences, briefings, interviews, broadcasts, testimony,
  Public Papers, Department of State Bulletin, Congressional Record, official
  transcripts, newspaper excerpts, full-text targets, archival drafts, briefing
  materials, diary context, and selected-versus-supplemental status before
  tracked changes are applied.
- Foreign/international-organization validator that distinguishes foreign
  governments, successor states, international organizations, regional bodies,
  alliances, coalitions, peacekeeping forces, conferences, international
  financial institutions, treaty parties, selected-source roles, venue roles,
  policy-subject roles, copy provenance, translation status, concurrence basis,
  and publication details before tracked changes are applied.
- Cross-reference registry validator that checks same-volume documents,
  footnotes, appendix items, tabs, attachments, public-source references,
  scheduled-publication targets, and cross-volume publication status before
  tracked changes are applied.
- Status-registry validator that preserves production stage, release bucket,
  capture date, official URL, and cross-referenced volume targets before the
  LLM review begins.
- Chunker and reconciliation layer for long `.docx` packets.
- Export step that writes a new `.docx`.

Operational cautions:

- Run the checker on a copy of the document.
- Keep original uploaded files unchanged.
- Record the exact checker version used.
- Record the exact context-bundle id and capture date used.
- Record authority-registry version, unmatched forms, direct authority edits,
  comments, and unresolved General Editor questions.
- Record document-metadata registry version, heading/date/title/caption issues,
  unresolved sender or recipient evidence, public-title questions, internal
  record-number placement, and document-metadata discrepancy questions.
- Record classification-registry version, missing original markings,
  unsupported `No classification marking` claims, handling/precedence
  mismatches, paragraph-marking questions, release-status confusions, and
  classification-handling discrepancy questions.
- Record translation-registry version, missing translation status, uncertain
  original language, unsupported official/unofficial claims, foreign-copy
  provenance issues, typed-signature/facsimile questions, and
  translation-foreign-origin discrepancy questions.
- Record foreign/international-organization registry version, unresolved
  foreign-copy basis, organization identity, body role, concurrence basis,
  treaty-party or successor-state status, meeting/conference identity,
  international-organization publication details, selected-versus-supplemental
  status, and foreign-international-organization discrepancy questions.
- Record treaty-registry version, unresolved component identities,
  integral-versus-associated status, public/archival basis conflicts,
  transmittal questions, ratification or entry-into-force questions, and
  treaty-legal-instrument discrepancy questions.
- Record source-family registry version, unmatched or ambiguous family matches,
  direct source-family edits, and source-family discrepancy questions.
- Record physical/routing registry version, unresolved handwriting, initials,
  marginalia, stamps, read-by/seen status, signed status, approval checkmarks,
  actor/hand identity, placement, routing status, correspondence-profile,
  distribution, attachment-profile, no-record/search context, source-image basis,
  and physical-routing discrepancy questions.
- Record communications-registry version, unmatched message identifiers,
  missing D/N/P/STARS/PROFS/W Files/System IV data, unsupported
  origin/addressee/date-time group claims, drafting or clearance questions, and
  communications-record discrepancy questions.
- Record attachment-registry version, unknown statuses, missing printed targets,
  bidirectional appendix/facsimile failures, and any waived attachment claims.
- Record declassification-registry version, provisional or unknown review
  statuses, omitted-text quantities, whole-document withholdings, original
  bracket notes, and unresolved release-status warnings.
- Record chronology-registry version, unknown record statuses, unsupported
  attendance, missing time/place, scheduled-but-unconnected calls, and
  no-record claims lacking search basis.
- Record event-chronology registry version, unresolved summit/travel/event
  sequence issues, missing public-source basis, diary/schedule basis, press
  basis, participant basis, time-zone questions, full-record targets, and
  summit-public-event discrepancy questions.
- Record public-source registry version, unresolved publication details,
  delivery/broadcast basis, transcript basis, full-text target, excerpt status,
  diary context, archival-draft or briefing-file relationship,
  selected-versus-supplemental status, and public-diplomacy discrepancy
  questions.
- Record retrospective-account registry version, unresolved memoir, published
  diary, personal diary, oral-history, later-interview, press-retrospective,
  newspaper-account, author/source, publication, page/locator, event-match,
  selected-versus-supplemental, official-record relationship,
  corroborating-record, conflict-status, and memoir/recollection discrepancy
  questions.
- Record congressional/legal registry version, unresolved committee, hearing,
  Congress/session, public-law, Stat., statutory-section, vote/action-stage,
  amount, condition, notification, determination, certification, Executive
  Order, oversight, independent counsel, Senate advice-and-consent, ratification,
  attachment-status, and congressional-legal discrepancy questions.
- Record economic/financial registry version, unresolved amount, currency,
  percentage, fiscal-year, institution, acronym, table, program, policy-stage,
  source-basis, legal-authority, attachment-status, debt/loan/guarantee, quota,
  replenishment, conditionality, and economic-financial discrepancy questions.
- Record sensitive-record registry version, unresolved agency-equity,
  source-and-methods, operational-basis, law-enforcement-status,
  oversight-basis, redaction/sanitization, foreign-service-contact,
  public-policy-only, original-classification/handling, and
  intelligence-law-enforcement discrepancy questions.
- Record military/crisis registry version, unresolved operation stage,
  order/authorization, source family, force/unit identity, chronology,
  time-zone, host-nation notification, coalition/allied role, casualty/damage,
  contingency-plan, security-assistance authority, classification/handling,
  declassification, and military-crisis discrepancy questions.
- Record human-rights/refugee/global-issues registry version, unresolved report
  basis, country/population scope, refugee/asylum/migration status, relief stage,
  legal/program authority, amounts/metrics, public/archival source basis,
  sanctions/waiver/certification status, international-organization role, PVO
  role, public-health source, population-policy context, environmental
  treaty/protocol status, and global-issues discrepancy questions.
- Record cross-reference-registry version, unresolved target documents,
  footnotes, appendix references, scheduled-publication targets, stale status
  dependencies, and public-source references.
- Record status-registry freshness and every publication-status conflict,
  especially `scheduled for publication` or `printed in` language.
- Record the selected review mode and whether duplicate findings were merged.
- Record chunk count, unit count, and any cross-chunk conflicts.
- Preserve an audit log of all LLM outputs, validator rejections, and applied
  changes.
- Preserve evidence-request counts so reviewers can see whether a packet is
  blocked mainly by source images, archival paths, classification markings,
  declassification outcomes, agency-equity proof, authority control, or
  Word-wrapper safety.
- Preserve the evidence-request queue so unresolved `blocked` requests cannot be
  mistaken for ordinary optional comments.
- Do not allow the LLM to access the open internet on the closed network. Any
  public-source learning must enter through a dated context bundle.
- Do not treat the checker as a declassification authority.
- Do not accept checker edits automatically for publication; human FRUS editors
  must review every tracked change.

## 16. Quick Pass/Fail Rubric

Pass:

- Source notes are in repository-to-document order.
- Annotation is factual, sourced, and useful.
- Cross-references use document numbers.
- Missing attachments and withheld text are handled explicitly.
- No URLs, discovery labels, or speculative claims remain in publishable notes.

Needs revision:

- Source notes contain incomplete archival paths or guessed classifications.
- Follow-on notes are wordy, argumentative, or inconsistent.
- Attachments are inferred rather than verified.
- Diary/schedule evidence is used as substantive conversation evidence.
- Summit, travel, ceremony, press, or public-event sequence is asserted without
  public-source, diary/schedule, press, or full-record target support.
- Public diplomacy, speech, press, interview, broadcast, testimony, transcript,
  full-text, excerpt, diary, briefing-file, or archival-draft context is changed
  without supplied public-source basis.
- Memoirs, published diaries, personal diaries, oral histories, later interviews,
  press retrospectives, newspaper accounts, or recollections are used as official
  meeting records, approval evidence, source paths, attachment proof, or
  substantive conversation evidence without supplied retrospective-account basis
  and corroborating official-record context.
- Physical evidence such as handwriting, initials, marginalia, stamps,
  read-by/seen notations, signed status, approval checkmarks, sent-for-action or
  information routing, correspondence profiles, placement, distribution, or
  unknown-hand notes is changed without supplied physical-evidence basis.
- Foreign-government, international-organization, regional-body, alliance,
  coalition, peacekeeping, conference, treaty-party, successor-state,
  foreign-copy, concurrence, publication-detail, or selected-source role is
  changed without supplied foreign/organization basis.
- Congressional/legal authority is asserted without committee, hearing,
  public-law, statute, vote/action-stage, determination, certification,
  Executive Order, oversight, or Senate advice-and-consent support.
- Economic/financial data changes amount, unit, currency, fiscal year,
  institution, acronym, table cell, source basis, policy stage, or
  attachment-status without supplied proof.
- Sensitive intelligence, covert-action, law-enforcement, counternarcotics,
  counterterrorism, source-and-methods, operational, oversight, foreign-service,
  redaction/sanitization, or agency-equity claims are asserted without supplied
  source basis.
- Military, defense, crisis, DOD/OSD/JCS/DIA, Situation Room,
  combat-operation, contingency-plan, force/unit, chronology, time-zone,
  host-nation, coalition, casualty/damage, after-action, or military-assistance
  claims are asserted or changed without supplied military-operation basis.
- Human-rights reports, refugee/immigration/asylum/migration claims, famine or
  emergency relief, PL 480, Section 416, Section 206, AID/PRM/PVO roles,
  public-health or AIDS/HIV sources, population-policy contributions,
  environmental or ozone treaty/protocol material, sanctions/waiver/certification
  status, international-organization roles, amounts/metrics, legal/program
  authorities, public/archival basis, or stage/status claims are asserted or
  changed without supplied humanitarian-rights basis.
- Persons, abbreviations, or index entries are inconsistent.

Blocked:

- The uploaded document extraction cannot distinguish notes from source text.
- Required source notes are missing for selected documents. Do not apply this to
  editorial notes that properly cite sources in the note text.
- Multiple annotations depend on facts not present in the uploaded context.
- The document contains unresolved tracked changes that prevent reliable
  matching.
- The Word wrapper cannot safely apply track changes.

## 17. Source Basis

This checker is based on the local file:

- `reports/frus-reagan-bush-style-guide.md`
- `reports/frus1981-88v01-style-lessons.md`
- `reports/frus1981-88v01-annotation-corpus.md`
- `reports/frus1981-88v01-annotation-corpus.json`
- `reports/frus1981-88v11-style-lessons.md`
- `reports/frus1981-88v11-annotation-corpus.md`
- `reports/frus1981-88v11-annotation-corpus.json`
- `reports/frus1981-88v44p1-style-lessons.md`
- `reports/frus1981-88v44p1-annotation-corpus.md`
- `reports/frus1981-88v44p1-annotation-corpus.json`
- `reports/frus-reagan-since-2021-style-lessons.md`
- `reports/frus-reagan-since-2021-volume-inventory.md`
- `reports/frus-reagan-since-2021-annotation-corpus.md`
- `reports/frus-reagan-since-2021-annotation-corpus.json`
- `reports/frus1989-92v31-style-lessons.md`
- `reports/frus1989-92v31-annotation-corpus.md`
- `reports/frus1989-92v31-annotation-corpus.json`
- Uploaded exemplar Word file: `Foundations Consolidated.docx`, treated as a
  clean finished-form model for annotation style and source-note cadence.

Official History Office pages refreshed for the 1981-1992 status and volume
family router:

- `https://history.state.gov/historicaldocuments/status-of-the-series`
- `https://history.state.gov/historicaldocuments/reagan`
- `https://history.state.gov/historicaldocuments/bush-ghw`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d1`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d24`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d3`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/ch1`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/ch3`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d49`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d91`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d237`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d245`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d242`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d244`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d246`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d247`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/preface`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/ch6`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d18`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d34`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d236`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d260`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d282`
- `https://history.state.gov/historicaldocuments/frus1981-88v13/ch3`
- `https://history.state.gov/historicaldocuments/frus1981-88v24/d290`
- `https://history.state.gov/historicaldocuments/frus1981-88v24/sources`
- `https://history.state.gov/historicaldocuments/frus1981-88v24/d341`
- `https://history.state.gov/historicaldocuments/frus1981-88v24/d329`
- `https://history.state.gov/historicaldocuments/frus1981-88v24/d382`
- `https://history.state.gov/historicaldocuments/frus1981-88v41`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/sources`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d1`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d37`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d51`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d214`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d220`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d276`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d350`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d355`
- `https://history.state.gov/historicaldocuments/frus1981-88v41/d358`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/d37`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/d50`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/d90`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d145`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d33`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d39`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d75`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d129`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d169`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d274`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d286`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d206`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d316`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/preface`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/d177`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/d267`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/d223`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/d324`
- `https://history.state.gov/historicaldocuments/frus1981-88v38/d371`
- `https://history.state.gov/historicaldocuments/frus1981-88v01`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/sources`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources`
- `https://history.state.gov/historicaldocuments/frus1981-88v10/d46`
- `https://history.state.gov/historicaldocuments/frus1981-88v10/d56`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/d294`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/pressrelease`
- `https://history.state.gov/historicaldocuments/frus1989-92v31`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/d172`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/sources`

That guide distills patterns from published Reagan and Bush FRUS volumes on
history.state.gov, especially rules for source notes, annotation, editorial
notes, declassification omissions, attachments, authority control, and
cross-volume references.

Recent Reagan source incorporated:

- [Ronald Reagan Administration, 1981-1989](https://history.state.gov/historicaldocuments/reagan)
- [FRUS, 1981-1988, Volume I, Foundations of Foreign Policy](https://history.state.gov/historicaldocuments/frus1981-88v01)
- [Volume I press release describing public and archival source basis](https://history.state.gov/historicaldocuments/frus1981-88v01/pressrelease)
- [Volume I source list with speechwriting files, speeches, and published sources](https://history.state.gov/historicaldocuments/frus1981-88v01/sources)
- [Haig confirmation chronology with memoir supplementation, Document 18](https://history.state.gov/historicaldocuments/frus1981-88v01/d18)
- [Haig Middle East trip editorial note with memoir context, Document 34](https://history.state.gov/historicaldocuments/frus1981-88v01/d34)
- [Reagan Cronkite interview editorial note, Document 33](https://history.state.gov/historicaldocuments/frus1981-88v01/d33)
- [Haig Senate Foreign Relations Committee testimony, Document 39](https://history.state.gov/historicaldocuments/frus1981-88v01/d39)
- [Haig private-paper source note with read-by stamp, marginalia, highlighting, underlining, and checkmark, Document 75](https://history.state.gov/historicaldocuments/frus1981-88v01/d75)
- [NSC source note with stamped read-by notation and attached correspondence profile, Document 129](https://history.state.gov/historicaldocuments/frus1981-88v01/d129)
- [Reagan United Nations General Assembly address, Document 169](https://history.state.gov/historicaldocuments/frus1981-88v01/d169)
- [Reagan United Nations address editorial note, Document 206](https://history.state.gov/historicaldocuments/frus1981-88v01/d206)
- [Reagan diary and Shultz memoir supplementing Chernenko succession context, Document 236](https://history.state.gov/historicaldocuments/frus1981-88v01/d236)
- [Shultz memoir supplementing Daily Diary and meeting-paper evidence, Document 260](https://history.state.gov/historicaldocuments/frus1981-88v01/d260)
- [Contra aid congressional/public-law annotation, Document 274](https://history.state.gov/historicaldocuments/frus1981-88v01/d274)
- [Iran arms/Contra aid Executive Order and oversight annotation, Document 286](https://history.state.gov/historicaldocuments/frus1981-88v01/d286)
- [Shultz memoir supplementing Iran arms press-conference context, Document 282](https://history.state.gov/historicaldocuments/frus1981-88v01/d282)
- [Shultz Papers source note with unknown-hand meeting-folder notation and no-minutes context, Document 316](https://history.state.gov/historicaldocuments/frus1981-88v01/d316)
- [FRUS, 1981-1988, Volume IV, Soviet Union, January 1983-March 1985](https://history.state.gov/historicaldocuments/frus1981-88v04)
- [FRUS, 1981-1988, Volume X, Eastern Europe](https://history.state.gov/historicaldocuments/frus1981-88v10)
- [FRUS, 1981-1988, Volume XI, START I](https://history.state.gov/historicaldocuments/frus1981-88v11)
- [FRUS, 1981-1988, Volume XXIV, North Africa](https://history.state.gov/historicaldocuments/frus1981-88v24)
- [Volume XXIV source list with DOD, NSC Crisis Management Center, OSD, CIA, and State NODIS/EXDIS records](https://history.state.gov/historicaldocuments/frus1981-88v24/sources)
- [U.S. action against Libya host-nation notification, Document 341](https://history.state.gov/historicaldocuments/frus1981-88v24/d341)
- [JCS/OSD Tunisia contingency planning and military-support options, Document 329](https://history.state.gov/historicaldocuments/frus1981-88v24/d329)
- [DIA Western Sahara military-intelligence report, Document 382](https://history.state.gov/historicaldocuments/frus1981-88v24/d382)
- [FRUS, 1981-1988, Volume XLI, Global Issues II](https://history.state.gov/historicaldocuments/frus1981-88v41)
- [Volume XLI source list with human-rights, AID, WHO, UNICEF, UNDRO, population, ozone, and environmental source families](https://history.state.gov/historicaldocuments/frus1981-88v41/sources)
- [AIDS policy editorial note with CDC, White House briefing, and CFPF context, Document 1](https://history.state.gov/historicaldocuments/frus1981-88v41/d1)
- [International HIV action plan and WHO/GPA context, Document 37](https://history.state.gov/historicaldocuments/frus1981-88v41/d37)
- [Annual Country Reports on Human Rights Practices telegram, Document 51](https://history.state.gov/historicaldocuments/frus1981-88v41/d51)
- [Third World hunger relief study context, Document 214](https://history.state.gov/historicaldocuments/frus1981-88v41/d214)
- [PL 480 emergency or refugee relief policy determination, Document 220](https://history.state.gov/historicaldocuments/frus1981-88v41/d220)
- [UNFPA contribution and population-policy controversy, Document 276](https://history.state.gov/historicaldocuments/frus1981-88v41/d276)
- [Ozone-layer convention authority and Circular 175 package, Document 350](https://history.state.gov/historicaldocuments/frus1981-88v41/d350)
- [Ozone-layer protocol negotiation authority, Document 355](https://history.state.gov/historicaldocuments/frus1981-88v41/d355)
- [Ozone-layer protocol negotiation telegram, Document 358](https://history.state.gov/historicaldocuments/frus1981-88v41/d358)
- [FRUS, 1981-1988, Volume XXXVIII, International Economic Development; International Debt; Foreign Assistance](https://history.state.gov/historicaldocuments/frus1981-88v38)
- [Volume XXXVIII preface on developing-world economic policy, debt, assistance, IFIs, and companion trade/monetary volumes](https://history.state.gov/historicaldocuments/frus1981-88v38/preface)
- [IMF/World Bank annual meetings and debt-crisis context, Document 177](https://history.state.gov/historicaldocuments/frus1981-88v38/d177)
- [Multilateral development banks, IMF, and World Bank context, Document 267](https://history.state.gov/historicaldocuments/frus1981-88v38/d267)
- [Strengthened debt strategy memorandum, Document 223](https://history.state.gov/historicaldocuments/frus1981-88v38/d223)
- [Private enterprise, trade, and assistance recommendations with dollar figures, Document 324](https://history.state.gov/historicaldocuments/frus1981-88v38/d324)
- [Presidential Determination and Public Law note in Volume XXXVIII, Document 371](https://history.state.gov/historicaldocuments/frus1981-88v38/d371)
- [FRUS, 1981-1988, Volume XLIV, Part 1, National Security Policy, 1985-1988](https://history.state.gov/historicaldocuments/frus1981-88v44p1)
- [Volume XLIV, Part 1 about-the-series source and declassification statement](https://history.state.gov/historicaldocuments/frus1981-88v44p1/abouttheseries)
- [Action memorandum with Reagan initials, signed stamp, approval checkmark, and tabs printed as next document, Document 50](https://history.state.gov/historicaldocuments/frus1981-88v44p1/d50)
- [Covert-action memorandum of notification, Document 46](https://history.state.gov/historicaldocuments/frus1981-88v10/d46)
- [CIA paper on Soviet/East European program, Document 56](https://history.state.gov/historicaldocuments/frus1981-88v10/d56)
- [Andean narcotics and terrorism policy initiative, Document 294](https://history.state.gov/historicaldocuments/frus1981-88v01/d294)
- [FRUS, 1981-1988, Volume I EPUB](https://static.history.state.gov/frus/frus1981-88v01/ebook/frus1981-88v01.epub)
- [FRUS, 1981-1988, Volume IV EPUB](https://static.history.state.gov/frus/frus1981-88v04/ebook/frus1981-88v04.epub)
- [FRUS, 1981-1988, Volume X EPUB](https://static.history.state.gov/frus/frus1981-88v10/ebook/frus1981-88v10.epub)
- [FRUS, 1981-1988, Volume XI EPUB](https://static.history.state.gov/frus/frus1981-88v11/ebook/frus1981-88v11.epub)
- [FRUS, 1981-1988, Volume XXIV EPUB](https://static.history.state.gov/frus/frus1981-88v24/ebook/frus1981-88v24.epub)
- [FRUS, 1981-1988, Volume XXXVIII EPUB](https://static.history.state.gov/frus/frus1981-88v38/ebook/frus1981-88v38.epub)
- [FRUS, 1981-1988, Volume XLIV, Part 1, National Security Policy, 1985-1988 EPUB](https://static.history.state.gov/frus/frus1981-88v44p1/ebook/frus1981-88v44p1.epub)

Recent Bush source incorporated:

- [FRUS, 1989-1992, Volume XXXI, START I, 1989-1991](https://history.state.gov/historicaldocuments/frus1989-92v31)
- [Bush Vice Presidential Records source note with Watson initialing and Bush marginalia, Document 1](https://history.state.gov/historicaldocuments/frus1989-92v31/d1)
- [NSC/DC H-Files source note with sent-for-action and read-by/routing evidence, Document 24](https://history.state.gov/historicaldocuments/frus1989-92v31/d24)
- [START endgame telegram with London Economic Summit news-conference note, Document 237](https://history.state.gov/historicaldocuments/frus1989-92v31/d237)
- [Moscow Summit and START signing editorial note, Document 245](https://history.state.gov/historicaldocuments/frus1989-92v31/d245)
- [START I treaty text source note, Document 246](https://history.state.gov/historicaldocuments/frus1989-92v31/d246)
- [START I Presidential transmittal and article-by-article analysis note, Document 247](https://history.state.gov/historicaldocuments/frus1989-92v31/d247)
- [START I preface discussion of Senate ratification and Lisbon Protocol context](https://history.state.gov/historicaldocuments/frus1989-92v31/preface)
- [START I about-the-series source and declassification statement](https://history.state.gov/historicaldocuments/frus1989-92v31/abouttheseries)
- [Gorbachev letter printed from unofficial translation, Document 91](https://history.state.gov/historicaldocuments/frus1989-92v31/d91)
- [START I preface on Soviet dissolution and Lisbon Protocol successor-state context](https://history.state.gov/historicaldocuments/frus1989-92v31/preface)
- [START data-denial, intelligence, DOD, CIA, JCS, and redaction example, Document 172](https://history.state.gov/historicaldocuments/frus1989-92v31/d172)
- [FRUS, 1989-1992, Volume XXXI, START I, 1989-1991 EPUB](https://static.history.state.gov/frus/frus1989-92v31/ebook/frus1989-92v31.epub)

Current status source incorporated:

- [Status of the Foreign Relations of the United States Series](https://history.state.gov/historicaldocuments/status-of-the-series)
- [Ronald Reagan Administration, 1981-1989](https://history.state.gov/historicaldocuments/reagan)
- [George H.W. Bush Administration, 1989-1993](https://history.state.gov/historicaldocuments/bush-ghw)
