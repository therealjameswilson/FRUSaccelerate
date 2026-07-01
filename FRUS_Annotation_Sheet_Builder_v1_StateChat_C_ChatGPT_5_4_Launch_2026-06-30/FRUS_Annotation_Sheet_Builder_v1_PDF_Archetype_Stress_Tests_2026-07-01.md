# FRUS Annotation Sheet Builder PDF Archetype Stress Tests

Generated: 2026-07-01

Purpose: record PDF archetype tests used to harden the FRUS Annotation Sheet Builder against documents a compiler might drag into StateChat-c. These are behavior tests and evidence notes, not final annotation sheets.

## Current Official Context Checked

- Reagan administration official page: https://history.state.gov/historicaldocuments/reagan
- George H.W. Bush administration official page: https://history.state.gov/historicaldocuments/bush-ghw
- Status page: https://history.state.gov/historicaldocuments/status-of-the-series

The status page currently lists `frus1981-88v44p1` and `frus1989-92v31` among 2025 published releases, while many other Reagan/Bush volumes remain in clearance, research, planned, or anticipated status. The builder should use published examples as pattern evidence only and require target-volume authority for unpublished-volume sheets.

## Tested Local PDFs

| PDF | Pages | Archetype | Expected Builder Behavior |
| --- | ---: | --- | --- |
| `Balkans-93-95/documents/extracted/1995-08-04-dayton-1995-08-04-strategy-for-balkan-conflict.pdf` | 7 | standalone policy/strategy paper with internal attachment and annex | Draft a paper-title annotation only from visible title/date/classification; do not invent author/recipient/source path; treat the Modified Contact Group Plan annex as internal unless selected separately. |
| `Clinton-Russia-High-Level/public/documents/nara-441675758-yeltsin-kosovo-call-support.pdf` | 8 | action-memo support packet with Tab I, Tab A, marginalia, declassification stamp, and FOIA marker | Unitize cover action memo, memorandum to the President, talking points, and FOIA marker; ask whether the selected document is the cover memo, a tab, the whole packet, or excerpts. |
| `clinton-2013-0185-source-notes/source-pdfs/2013-0185-M_Part1.pdf` | 375 | source-register/release packet, withdrawal sheets, OA/ID folder-title list | Do not draft a manuscript annotation sheet; run source-register triage and extract collection, Access Management, OA/ID, folder-title, restriction, and case-number evidence. |
| `tmp/pdfs/frus-builder-test/public-source/PPP-1993-book1-doc-pg257.pdf` | 1 | public/printed source PDF from GovInfo Public Papers | Draft a public-source annotation from visible publication title, printed item title, event date, page number, and GovInfo/publication identifiers; do not invent archive path or use PDF creation metadata as the document date. |
| `tmp/pdfs/frus-builder-test/appendix-facsimile/frus1981-88v01-appendix-b-facsimile-test.pdf` | 1 | image-only appendix facsimile derived from official history.state.gov Appendix B image | Treat as appendix/facsimile and transcription evidence; preserve appendix label and source-control identifiers; do not OCR-guess handwriting or renumber as an ordinary document without target-volume authority. |
| `tmp/pdfs/frus-builder-test/directive-package/frus1981-88v44p1-d21-nsdd161-excerpt.pdf` | 9 | directive/decision package excerpt from official 2025 FRUS volume PDF | Treat as directive_or_decision_package; preserve NSDD number, title, place/date, classification and paragraph markings, McFarlane note, distribution under cover memorandum, annex/report references, and printed-elsewhere relationships without collapsing the package into a generic memorandum. |
| `tmp/pdfs/frus-builder-test/technical-table/frus1981-88v44p1-d23-technical-table-excerpt.pdf` | 5 | table/chart-heavy technical memorandum excerpt from official 2025 FRUS volume PDF | Treat tabular and list-heavy pages as technical_table_or_chart evidence; preserve column headers, rows, numeric values, units, declassification placeholders, source-note placement, and trailing next-document boundary instead of flattening the excerpt into plain prose. |
| `tmp/pdfs/frus-builder-test/memcon-telcon/frus1989-92v31-d17-memcon-meeting-excerpt.pdf` | 8 | memcon/meeting excerpt from official 2025 FRUS volume PDF | Treat as memcon_or_telcon; preserve meeting time/place, two-sided participant block, notetaker/interpreter labels, omitted-subject bracket, drafter/clearance chain, full-memcon scheduled-publication relationship, and `No minutes were found` as distinct controlled evidence. |
| `tmp/pdfs/frus-builder-test/telegram-cable/frus1989-92v31-d36-telegram-excerpt.pdf` | 4 | ordinary telegram excerpt from official 2025 FRUS volume PDF | Treat as electronic_telegram_or_cable; preserve telegram number, origin/destination, Zulu transmission time, subject, classification/precedence, Electronic Telegrams identifier, reference-telegram footnote, and leading previous-document boundary evidence. |

## Rules Added

- Added `source_register_triage` run mode.
- Added `source_register_or_finding_aid` unit/archetype values.
- Added `not_annotation_sheet_source_register_only` readiness value.
- Added action-memo/tabbed support packet handling.
- Added standalone policy paper handling.
- Added source-register/release-packet/finding-aid handling.
- Added public/printed-source PDF handling.
- Added appendix/facsimile/handwritten-source handling.
- Added directive/decision-package handling.
- Added technical table/chart and document-boundary handling.
- Added memcon/telcon, meeting-minutes, call-record, excerpt-scope, participant-list, and negative-search handling.
- Added ordinary telegram/cable metadata and reference-telegram handling.
- Added `bibliographic_basis`, `transcription_basis`, and `appendix_facsimile_relationship` evidence-request labels.
- Added `directive_package_basis` evidence-request label and `directive_package_note` note type.
- Added `table_layout_basis`, `document_boundary_basis`, `table_layout_note`, and `document_boundary_note` values.
- Added `meeting_metadata_basis`, `participant_list_basis`, `excerpt_scope_basis`, `negative_search_basis`, `meeting_metadata_note`, and `negative_search_note` values.
- Added `telegram_metadata_basis`, `telegram_reference_basis`, and `telegram_metadata_note` values.

## Regression Expectations

- A source register or release packet must not yield a final-looking `Document [TBD]` annotation sheet unless the compiler selected the register/list itself.
- A tabbed action memo must preserve the cover memorandum and attached tabs as separate candidate units.
- A freestanding policy paper with no visible author must not be recast as `Paper Prepared by...` or `Memorandum From...` without target-volume authority.
- A public-source PDF must preserve publication/event/page metadata and must not be forced into archival source-note form.
- An image-only facsimile or handwritten appendix page must request transcription/source-image authority when visual evidence is insufficient.
- A directive package must preserve directive number, cover memorandum, distribution, annex/tab classification, paragraph markings, and printed-elsewhere relationships as separate evidence claims.
- A table/chart-heavy PDF must preserve rows, columns, labels, units, declassification placeholders, and page-boundary spillover; it must not silently merge the start of the next numbered document into the selected document.
- A memcon/telcon PDF must preserve meeting/call metadata, participant-list layout, side labels, notetakers/interpreters, excerpt boundaries, full-record relationships, and negative-search claims separately.
- A telegram/cable PDF must preserve header metadata, CFPF/Electronic Telegrams identifiers, transmission/event/date distinctions, reference telegrams, and page-boundary spillover separately.
