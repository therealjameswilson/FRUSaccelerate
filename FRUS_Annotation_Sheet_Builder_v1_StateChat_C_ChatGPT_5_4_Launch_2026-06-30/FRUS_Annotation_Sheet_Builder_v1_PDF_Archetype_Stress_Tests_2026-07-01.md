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

## Rules Added

- Added `source_register_triage` run mode.
- Added `source_register_or_finding_aid` unit/archetype values.
- Added `not_annotation_sheet_source_register_only` readiness value.
- Added action-memo/tabbed support packet handling.
- Added standalone policy paper handling.
- Added source-register/release-packet/finding-aid handling.

## Regression Expectations

- A source register or release packet must not yield a final-looking `Document [TBD]` annotation sheet unless the compiler selected the register/list itself.
- A tabbed action memo must preserve the cover memorandum and attached tabs as separate candidate units.
- A freestanding policy paper with no visible author must not be recast as `Paper Prepared by...` or `Memorandum From...` without target-volume authority.
