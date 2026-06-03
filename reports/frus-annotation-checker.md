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
- `source_family_registry_context`, if available: structured source-family
  controls derived from published FRUS source lists and local authority files,
  including family ids, volume scope, required path components, distinguishing
  tokens, allowed variants, and no-flattening rules.
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
      "category": "source_note | citation | attachment | annotation | editorial_note | declassification | authority_control | chronology | publication_status | wording | evidence | format",
      "finding": "Plain-language issue.",
      "standard": "Specific FRUS rule applied.",
      "recommended_action": "replace_text | insert_after_text | delete_text | comment_only | no_change",
      "original_text": "Exact text to be changed, or empty for comment_only.",
      "replacement_text": "Exact replacement text, or empty if not applicable.",
      "comment_text": "Comment to place in Word, explaining rationale or needed verification.",
      "evidence_request": "none | source_image | archival_path | classification_marking | attachment_status | document_number | publication_status | authority_control | declassification_status | translation_status | chronology | source_family | cross_reference | wrapper_safety",
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
      "category": "source_note | citation | attachment | editorial_note | declassification | authority_control | publication_status | wording | format | wrapper",
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
              "declassification",
              "authority_control",
              "chronology",
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
              "attachment_status",
              "document_number",
              "publication_status",
              "authority_control",
              "declassification_status",
              "translation_status",
              "chronology",
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
              "declassification",
              "authority_control",
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
  `declassification`, `attachment`, `chronology`, or `authority_control` when
  the required proof is absent from the uploaded unit or wrapper context.
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

### 6.9 Interagency And Foreign-Government Records

Rules:

- Cite the U.S. archival control copy used for transcription unless the foreign
  copy, treaty text, or published source is the selected document.
- Identify foreign-government documents, translations, and non-U.S. copies when
  provenance affects reliability.
- Track agency equities in comments when the note needs verification.
- For joint papers, identify the office or interagency body controlling the
  printed version.
- Do not convert an embassy-held informational copy into the originating source.

Flag unsupported claims about originator control, translation, foreign
government concurrence, or agency review.

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
- Source note from public/printed source: check edition, publication date,
  page/range, issuing office, delivery or release facts, and whether archival
  draft/control-copy context is available.
- Telegram source note: check CFPF or other source family, telegram number,
  origin/addressee, date/time group, classification/precedence, drafter and
  approval when present, and related telegram citations.
- Memcon/telcon/minutes note: check meeting/call location, date/time, source
  type, participants only when supported, Diary/schedule corroboration, and
  whether a full record is scheduled elsewhere.
- Directive or decision package: check parent memo, directive, annex, tabs,
  distribution list, paragraph markings, cover memorandum, approval/signed
  status, and whether each printed component needs separate annotation.
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
  classification, attachment status, document number, declassification outcome,
  authority control, or wrapper safety.
- If the checker sees a working label such as `TK`, `candidate`, `needs scan`,
  or `verify`, the comment should preserve the research value of the label
  while directing the compiler to the evidence needed for final style.

Evidence-request categories:

| Category | Use when the blocker is... | Comment should tell the compiler... |
| --- | --- | --- |
| `source_image` | A scan, facsimile, or control copy must be inspected. | Which visible feature to check, such as marking, marginalia, stamp, attachment, or handwriting. |
| `archival_path` | Repository, collection, series, box, folder, lot, OA/ID, or file unit is missing or suspect. | Which part of the source path needs confirmation. |
| `classification_marking` | Original classification or handling is missing, guessed, or confused with release status. | To verify the original marking on the document, not the declassification result. |
| `attachment_status` | Attached, not attached, printed elsewhere, tabbed, enclosed, or not found claims are uncertain. | Which tab, enclosure, paper, or list must be checked. |
| `document_number` | Same-volume or cross-volume reference lacks a stable document number. | Which target document, chapter, or volume must be matched. |
| `publication_status` | `printed in` versus `scheduled for publication` depends on current official status. | Which volume or chapter status must be confirmed. |
| `authority_control` | Persons, titles, abbreviations, index terms, names, offices, or dates need authority-list review. | Which name, office, acronym, date span, or index term needs control. |
| `declassification_status` | Release, withholding, excision, agency-equity, or bracket language is not final. | Which review outcome or bracket claim cannot yet be asserted. |
| `translation_status` | Language, translation, foreign-origin copy, or translated excerpt is uncertain. | Which language/copy/translation fact needs verification. |
| `chronology` | Diary, schedule, call-log, meeting, or sequence evidence is incomplete. | Which time, place, attendance, or sequence point needs corroboration. |
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
| `classification_marking` | yes | yes |
| `attachment_status` | yes | yes when the note asserts attached, not attached, tabbed, enclosed, printed, or not found |
| `document_number` | yes for cross-reference edits | yes when same-volume or cross-volume references are unstable |
| `publication_status` | yes for `printed in` or `scheduled for publication` edits | yes for final style if publication language is present |
| `authority_control` | yes when a date, identity, title, acronym, or index form is uncertain | yes for final style if repeated or reader-facing |
| `declassification_status` | yes | yes |
| `translation_status` | yes when language, translation, or foreign-copy identity is asserted | yes when the printed document depends on the claim |
| `chronology` | yes when time, attendance, or sequence is rewritten | yes when chronology is central to the note |
| `source_family` | yes when source hierarchy or subseries would be rewritten | no for light review; yes for final style |
| `cross_reference` | yes | yes when the reference appears in publishable apparatus |
| `wrapper_safety` | yes | yes for generated `.docx` release until the edit is downgraded or safely anchored |

Owner hints:

- `compiler`: source images, archival path, attachment status, document numbers,
  source family, chronology, and translation status.
- `editor`: wording, cross-reference form, source-list consistency,
  publication-status wording, and General Editor discrepancy preparation.
- `declassification`: classification markings, declassification outcomes,
  withholding, excision, and agency-equity language.
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
5. Match source notes against the source-family registry when supplied.
6. Check classification and handling language.
7. Check attachment, tab, enclosure, appendix, facsimile, and not-found claims
   against the attachment registry when supplied.
8. Check cross-references and follow-on citation form against the
   cross-reference registry when supplied.
9. Check annotation purpose and concision.
10. Check declassification, omission, original-bracket, release-status, and
    whole-document withholding language against the declassification registry
    when supplied.
11. Check target-volume status and whether the note is research-stage,
   clearance-stage, anticipated, planned, or published.
12. Route the unit through the relevant volume family when a 1981-1992
    in-preparation family is known or can be tentatively inferred.
13. Check chronology, diary, schedule, call-log, meeting, briefing, travel, and
    no-record usage against the chronology registry when supplied.
14. Check Persons, abbreviations, and index authority issues.
15. Assign specific evidence requests and verification targets for unresolved
    proof.
16. Decide direct edit versus comment-only.
17. Return strict JSON.
18. After schema and semantic validation, aggregate all unresolved evidence
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
  attachment status, agency equities, cross-volume scheduling, and stable
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
- Merge repeated scheduled-publication questions by target volume or chapter.
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
- At least one foundations/public diplomacy or organization/management note in
  which public text is the selected evidence, not a defect.
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
- Public-source test: preserve selected public, printed, speech, hearing,
  testimony, interview, or treaty text when the volume family makes that source
  appropriate.
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
- Variations in `No classification marking`, classification/handling order,
  declassification phrasing, or omission/bracket language where the underlying
  evidence is sound.
- Variations in `Attached but not printed`, `Not found attached`, `Printed as
  Document [n]`, appendix, tab, enclosure, or facsimile wording.
- Variations in `scheduled for publication`, `printed in`, same-volume
  cross-references, footnote cross-references, or document-number style.
- Different Persons, abbreviations, source-list, or index authority forms that
  may reflect volume-specific practice rather than error.
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
- The wrapper should merge duplicate discrepancy items across the uploaded
  packet and, if configured, across prior runs of the same project.
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
Source-family registry: [source_family_registry_id and capture date]
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
- Source-family unmatched or ambiguous matches: [n]
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

Source-family warnings:
- [unit_id or global]: [source-family issue] - [registry target or unmatched family]

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
- Source-family registry validator that preserves published and local source
  ecologies, distinguishes public/printed selected sources from archival
  control copies, and blocks flattening of specific repositories into generic
  source paths.
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
- Record source-family registry version, unmatched or ambiguous family matches,
  direct source-family edits, and source-family discrepancy questions.
- Record attachment-registry version, unknown statuses, missing printed targets,
  bidirectional appendix/facsimile failures, and any waived attachment claims.
- Record declassification-registry version, provisional or unknown review
  statuses, omitted-text quantities, whole-document withholdings, original
  bracket notes, and unresolved release-status warnings.
- Record chronology-registry version, unknown record statuses, unsupported
  attendance, missing time/place, scheduled-but-unconnected calls, and
  no-record claims lacking search basis.
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
  declassification outcomes, authority control, or Word-wrapper safety.
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
- `https://history.state.gov/historicaldocuments/frus1981-88v01`
- `https://history.state.gov/historicaldocuments/frus1981-88v01/sources`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1`
- `https://history.state.gov/historicaldocuments/frus1981-88v44p1/sources`
- `https://history.state.gov/historicaldocuments/frus1989-92v31`
- `https://history.state.gov/historicaldocuments/frus1989-92v31/sources`

That guide distills patterns from published Reagan and Bush FRUS volumes on
history.state.gov, especially rules for source notes, annotation, editorial
notes, declassification omissions, attachments, authority control, and
cross-volume references.

Recent Reagan source incorporated:

- [Ronald Reagan Administration, 1981-1989](https://history.state.gov/historicaldocuments/reagan)
- [FRUS, 1981-1988, Volume I, Foundations of Foreign Policy](https://history.state.gov/historicaldocuments/frus1981-88v01)
- [FRUS, 1981-1988, Volume IV, Soviet Union, January 1983-March 1985](https://history.state.gov/historicaldocuments/frus1981-88v04)
- [FRUS, 1981-1988, Volume X, Eastern Europe](https://history.state.gov/historicaldocuments/frus1981-88v10)
- [FRUS, 1981-1988, Volume XI, START I](https://history.state.gov/historicaldocuments/frus1981-88v11)
- [FRUS, 1981-1988, Volume XXIV, North Africa](https://history.state.gov/historicaldocuments/frus1981-88v24)
- [FRUS, 1981-1988, Volume XXXVIII, International Economic Development; International Debt; Foreign Assistance](https://history.state.gov/historicaldocuments/frus1981-88v38)
- [FRUS, 1981-1988, Volume XLIV, Part 1, National Security Policy, 1985-1988](https://history.state.gov/historicaldocuments/frus1981-88v44p1)
- [FRUS, 1981-1988, Volume I EPUB](https://static.history.state.gov/frus/frus1981-88v01/ebook/frus1981-88v01.epub)
- [FRUS, 1981-1988, Volume IV EPUB](https://static.history.state.gov/frus/frus1981-88v04/ebook/frus1981-88v04.epub)
- [FRUS, 1981-1988, Volume X EPUB](https://static.history.state.gov/frus/frus1981-88v10/ebook/frus1981-88v10.epub)
- [FRUS, 1981-1988, Volume XI EPUB](https://static.history.state.gov/frus/frus1981-88v11/ebook/frus1981-88v11.epub)
- [FRUS, 1981-1988, Volume XXIV EPUB](https://static.history.state.gov/frus/frus1981-88v24/ebook/frus1981-88v24.epub)
- [FRUS, 1981-1988, Volume XXXVIII EPUB](https://static.history.state.gov/frus/frus1981-88v38/ebook/frus1981-88v38.epub)
- [FRUS, 1981-1988, Volume XLIV, Part 1, National Security Policy, 1985-1988 EPUB](https://static.history.state.gov/frus/frus1981-88v44p1/ebook/frus1981-88v44p1.epub)

Recent Bush source incorporated:

- [FRUS, 1989-1992, Volume XXXI, START I, 1989-1991](https://history.state.gov/historicaldocuments/frus1989-92v31)
- [FRUS, 1989-1992, Volume XXXI, START I, 1989-1991 EPUB](https://static.history.state.gov/frus/frus1989-92v31/ebook/frus1989-92v31.epub)

Current status source incorporated:

- [Status of the Foreign Relations of the United States Series](https://history.state.gov/historicaldocuments/status-of-the-series)
- [Ronald Reagan Administration, 1981-1989](https://history.state.gov/historicaldocuments/reagan)
- [George H.W. Bush Administration, 1989-1993](https://history.state.gov/historicaldocuments/bush-ghw)
