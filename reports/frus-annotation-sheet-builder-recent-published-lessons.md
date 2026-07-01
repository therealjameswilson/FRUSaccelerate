# FRUS Annotation Sheet Builder Recent Published Lessons

Generated: 2026-06-30

Purpose: summarize recent published FRUS evidence that should shape the PDF-to-annotation-sheet builder. This is a builder-facing synthesis, not a substitute for a target-volume source list or compiler instruction.

## Official Scope Anchors

- Official administration pages: https://history.state.gov/historicaldocuments/reagan and https://history.state.gov/historicaldocuments/bush-ghw.
- Official status page: https://history.state.gov/historicaldocuments/status-of-the-series.
- Current 2025 published anchors verified: `frus1981-88v44p1` and `frus1989-92v31`.
- Official EPUBs remain the preferred offline harvesting path where available because direct document-page scraping can be brittle.

## Ten-Year Published Corpus Used

The current builder learning pass used local all-document corpora derived from official history.state.gov EPUBs and pages for Reagan/Bush volumes published from 2016 through 2025:

- `frus1981-88v03` (2016)
- `frus1981-88v06` (2016)
- `frus1981-88v41` (2017)
- `frus1981-88v05` (2020)
- `frus1981-88v04` (2021)
- `frus1981-88v11` (2021)
- `frus1981-88v01` (2022)
- `frus1981-88v10` (2023)
- `frus1981-88v24` (2024)
- `frus1981-88v38` (2024)
- `frus1981-88v44p1` (2025)
- `frus1989-92v31` (2025)

Aggregate coverage from the local corpus files:

- Numbered documents parsed: 4,005.
- Appendix records parsed: 18.
- Records with source notes: 3,842.
- Footnotes detected: 17,027.
- Parse errors: 0.

The existing since-2021 aggregate validators also passed for the current Reagan and Bush published sets: Reagan, 7 volumes, 2,630 numbered documents, 16 appendix records; Bush, 1 volume, 247 numbered documents.

## Builder Lessons

1. Treat recent published examples as pattern evidence only. They can guide first-pass form, but they never prove the uploaded PDF's missing repository, box, folder, date, copy basis, classification, attachment treatment, or cross-reference.
2. Preserve source-family identity. Recent source notes distinguish Department of State lot files, Executive Secretariat files, Central Foreign Policy File records, Reagan Library NSC institutional files, Reagan Library staff/directorate files, Shultz/Hoover/private copies, Daily Diary/schedule evidence, DOD/CIA/agency records, Bush Presidential Records, H-Files, Scowcroft files, STARS records, and public or printed sources.
3. Expect many PDF archetypes, not one document template: memoranda, telegrams, memcons, telcons, letters, presidential messages, diplomatic notes, minutes, papers, action memoranda, directive packages, talking points, public statements, treaty transmittals, editorial notes, appendix/facsimile records, handwritten notes, and attachment packets.
4. Keep controlled annotation formulas controlled: `See Document [n].`, `See footnote [n], Document [n].`, `In telegram [n]...`, `Attached but not printed...`, `Not found.`, `Scheduled for publication in Foreign Relations...`, `Brackets are in the original.`, `Printed as Document [n].`, `No minutes were found.`, `Not found attached.`, and appendix cross-references require exact supporting evidence.
5. Distinguish page evidence from source-note prose. Release stamps, withdrawal sheets, local file paths, HTML print headers, scan labels, FOIA markers, and export watermarks are evidence ledger material unless compiler/source authority says they belong in the final source note.
6. Preserve date bases separately. Recent volumes frequently separate document date, meeting date, transmission date, packet date, diary/schedule date, transmittal date, and publication or release date.
7. Daily Diary, schedule, calendar, and meeting-log records are support evidence unless selected directly. Recent volumes use them for date, time range, place, chronology, and sometimes attendance, while keeping them separate from substantive minutes, memoranda of conversation, later diary/memoir recollections, and negative-search claims such as `No substantive record of the conversation has been found.`
8. Directive and decision packages require directive-specific extraction. Recent volumes use NSDDs/NSDs, covering memoranda, annexes, tabs, distribution lists, paragraph classification markings, and printed-elsewhere relationships. Keep directive number, package layer, classification scope, distribution evidence, and cross-volume reference authority distinct.
9. Technical tables, charts, matrices, and list-heavy documents require layout preservation. Recent volumes include cost tables, column-level excisions, line/paragraph redactions, units, acronyms, and numeric comparisons where row/column relationships carry meaning. Preserve structure and flag OCR/layout uncertainty.
10. Intelligence and estimative records require analytic-source treatment. Recent volumes print DIA, CIA, INR, NIC, JCS, and other agency products with product numbers, information-as-of dates, paragraph markings, handling restrictions, not-declassified placeholders, receipt stamps, and agency-specific source paths. Keep those claims separate from ordinary classification and declassification fields.
11. Memcons, telcons, meeting minutes, and call records require meeting-specific extraction. Recent volumes use meeting time ranges, places, two-sided participant blocks, notetaker/interpreter labels, omitted-topic brackets, source-note meeting locations, drafter/clearance chains, full-record scheduled-publication notes, and negative-search notes such as `No minutes were found.` Keep those claims separate.
12. Telegrams and cables require full header and routing extraction. Recent volumes include telegram number, origin/destination, transmission time, classification, precedence, CFPF/Electronic Telegrams identifiers, referenced telegrams, and page-boundary spillover. Keep transmission date, event date, referenced telegrams, and editorial ordering evidence distinct.
13. Treaty and transmittal packages require package-specific treatment. Recent volumes distinguish transmittal letters, treaty text, protocols, annexes, memoranda of understanding, article-by-article analyses, proposed presidential messages, documents integral to the treaty, documents associated with but not integral to the treaty, public transmittal, Senate ratification, and entry-into-force evidence. Keep selection status, attachment status, public-source evidence, and archival source path distinct.
14. Translated and foreign-language sources require translation-specific extraction. Recent volumes print translated minutes and diplomatic texts while preserving translation date, translating office, original-language or original-bracket status, omitted material, and attached-but-not-printed annexes. Keep original document date, meeting date, translation date, annex status, and page-boundary spillover distinct.
15. Public or printed sources can be selected documents in recent volumes. Do not force them into archival-source form when the selected record is a speech, statement, testimony, interview, treaty text, public paper, printed report, or editorial note. Preserve publication title, item title, event date, publication date, page number, issuing body, and URL/granule metadata separately.
16. Appendix and facsimile records require special handling. Recent volumes use lettered appendix images, bracketed document numbers, and transcribed-copy cross-references. Keep the facsimile, transcription, and source-control evidence distinct.
17. Editorial notes can lack conventional `Source:` footnotes. Recent volumes use them for chronology, public-citation synthesis, scheduled-publication pointers, cross-volume references, and quoted public text. Do not force an editorial note into archival source-note form, and do not use a source-less editorial-note model for a memorandum, telegram, minutes, memcon, directive, or selected public text unless the target document is proved to be an editorial note.
18. Letters and presidential messages require correspondence-specific treatment. Recent volumes preserve salutations, closings, signatures, no-classification markings, backchannel or privacy-channel delivery notes, government-copy variants, unofficial translations, response cross-references, and scheduled-publication notes. Unitize initiating letters and replies separately, and keep letter date, delivery/transmission date, referenced-letter date, copy status, translation status, and adjacent document boundaries distinct.
19. Briefing memoranda, information memoranda, and talking-points materials require briefing-specific treatment. Recent volumes preserve memo wrappers, action-or-information status, subjects, preparers, recipients, drafter/clearance data, stamped review notations, source sensitivity markings, recommended language, nested bullet/list hierarchy, Q&A or quotation blocks, and related-document cross-references. Keep preparation date, event/meeting date, referenced-document date, source-note evidence, and adjacent document boundaries distinct, and do not present proposed talking points as actions actually taken.
