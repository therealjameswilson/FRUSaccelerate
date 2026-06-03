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
- `authority_context`, if available: volume title, administration, date range,
  known document numbers, Persons authority list, abbreviations list, repository
  authority list, and neighboring-volume references.

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
  "document_assessment": {
    "overall_status": "pass | pass_with_comments | needs_revision | blocked",
    "summary": "Short assessment of annotation quality.",
    "blocked_reason": "Only if overall_status is blocked."
  },
  "checks": [
    {
      "unit_id": "footnote-0012",
      "severity": "blocker | major | minor | info",
      "category": "source_note | citation | attachment | annotation | editorial_note | declassification | authority_control | chronology | wording | evidence | format",
      "finding": "Plain-language issue.",
      "standard": "Specific FRUS rule applied.",
      "recommended_action": "replace_text | insert_after_text | delete_text | comment_only | no_change",
      "original_text": "Exact text to be changed, or empty for comment_only.",
      "replacement_text": "Exact replacement text, or empty if not applicable.",
      "comment_text": "Comment to place in Word, explaining rationale or needed verification."
    }
  ],
  "global_comments": [
    {
      "severity": "major | minor | info",
      "comment_text": "Document-wide observation."
    }
  ]
}
```

Rules for JSON edits:

- `original_text` must be an exact substring of the extracted unit when
  `recommended_action` is `replace_text`, `insert_after_text`, or
  `delete_text`.
- For `insert_after_text`, treat `original_text` as the exact anchor and insert
  `replacement_text` immediately after that anchor.
- Use `comment_only` when the LLM cannot safely supply exact replacement text.
- Use `no_change` only when the unit was checked and no issue was found.
- Never include invented facts inside `replacement_text`.
- Keep `comment_text` concise enough to fit as a Word comment.

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

## 7. Direct-Edit Rules

The LLM may propose direct tracked changes only when:

- The target text is clearly editorial apparatus, not transcribed document text.
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

Examples:

Direct replacement is acceptable:

```json
{
  "recommended_action": "replace_text",
  "original_text": "No classification.",
  "replacement_text": "No classification marking.",
  "comment_text": "Use the standard FRUS phrase when the document itself has no original classification marking."
}
```

Better as comment-only:

```json
{
  "recommended_action": "comment_only",
  "original_text": "",
  "replacement_text": "",
  "comment_text": "Verify OA/ID, folder title, and original classification against the control copy before finalizing this source note."
}
```

## 8. Standard Check Sequence

For every extracted unit, run checks in this order:

1. Identify unit type and whether it is safe to edit.
2. Check for invented or unverifiable facts.
3. Check source-note order and completeness.
4. Check classification and handling language.
5. Check attachment, tab, and not-found claims.
6. Check cross-references and follow-on citation form.
7. Check annotation purpose and concision.
8. Check declassification and omission language.
9. Check chronology, diary, schedule, and call-log usage.
10. Check Persons, abbreviations, and index authority issues.
11. Decide direct edit versus comment-only.
12. Return strict JSON.

## 9. Audit Report Summary Template

The wrapper may generate a human-readable report after applying changes:

```text
FRUS Annotation Checker Report

Input file: [filename]
Output file: [filename.frus-annotation-check.docx]
Run date: [date]

Overall status: [pass/pass_with_comments/needs_revision/blocked]

Counts:
- Blocker findings: [n]
- Major findings: [n]
- Minor findings: [n]
- Info comments: [n]
- Direct tracked edits applied: [n]
- Comments inserted: [n]
- LLM edits rejected by validator: [n]

Major issues:
- [unit_id]: [finding]

Rejected edits:
- [unit_id]: original_text was not found exactly in target unit.
```

## 10. Closed-Network Deployment Notes

Minimum components:

- `.docx` extractor that reads body paragraphs, footnotes, endnotes, comments,
  tables, headings, and tracked changes.
- LLM prompt runner with this Markdown standard loaded.
- JSON schema validator.
- WordprocessingML edit applier that can create real tracked insertions,
  deletions, and comments.
- Export step that writes a new `.docx`.

Operational cautions:

- Run the checker on a copy of the document.
- Keep original uploaded files unchanged.
- Record the exact checker version used.
- Preserve an audit log of all LLM outputs, validator rejections, and applied
  changes.
- Do not allow the LLM to access the open internet on the closed network.
- Do not treat the checker as a declassification authority.
- Do not accept checker edits automatically for publication; human FRUS editors
  must review every tracked change.

## 11. Quick Pass/Fail Rubric

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

## 12. Source Basis

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
