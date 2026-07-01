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
3. Expect many PDF archetypes, not one document template: memoranda, telegrams, memcons, telcons, letters, minutes, papers, action memoranda, directive packages, talking points, public statements, treaty transmittals, editorial notes, appendix/facsimile records, handwritten notes, and attachment packets.
4. Keep controlled annotation formulas controlled: `See Document [n].`, `See footnote [n], Document [n].`, `In telegram [n]...`, `Attached but not printed...`, `Not found.`, `Scheduled for publication in Foreign Relations...`, `Brackets are in the original.`, `Printed as Document [n].`, `No minutes were found.`, `Not found attached.`, and appendix cross-references require exact supporting evidence.
5. Distinguish page evidence from source-note prose. Release stamps, withdrawal sheets, local file paths, HTML print headers, scan labels, FOIA markers, and export watermarks are evidence ledger material unless compiler/source authority says they belong in the final source note.
6. Preserve date bases separately. Recent volumes frequently separate document date, meeting date, transmission date, packet date, diary/schedule date, transmittal date, and publication or release date.
7. Public or printed sources can be selected documents in recent volumes. Do not force them into archival-source form when the selected record is a speech, statement, testimony, interview, treaty text, public paper, printed report, or editorial note.
8. Editorial notes can lack conventional `Source:` footnotes. Do not use a source-less editorial-note model for a memorandum, telegram, minutes, memcon, directive, or selected public text unless the target document is proved to be an editorial note.
