# Clinton Foundations of Foreign Policy, 1993-2000

A static GitHub Pages source map for *Foreign Relations of the United States,
1993-2000, Volume I, Foundations of Foreign Policy*.

The Office of the Historian currently lists the volume as **Being Researched**,
so the page is built as a compiler-facing workbench rather than a published
document edition. It gathers:

- official FRUS status and subseries anchors
- a chronology-first section for released, declassified, and publicly accessible document controls
- chronological volume structure
- Clinton Library reading-room pull clusters from 2013-0185-M finding aids
- Presidential Daily Diary references from the NARA 2010-0083-F search set
- searchable source leads
- precedent document-type cards based on the Nixon/Ford, Carter, and Reagan Foundations volumes
- candidate record and file-unit leads
- FRUS-style source-note targets for candidate records
- public statement anchors
- PRD/PDD directive tracking
- person-list seed data
- chronology milestones
- compiler gap register and next-pull checklist

## Files

- `index.html`: page structure and workbench sections
- `styles.css`: responsive visual system
- `app.js`: source data, filters, rendering, gap board, and source-lead/record/statement/person CSV exports
- `chronology-export.js`: first-section document chronology and triage CSV exports
- `library-pull-export.js`: Clinton Library OA/ID pull-sheet, onsite agenda, Daily Diary controls, compiler runbook, source-note audit, source-note template, verification queue, request-packet, request-batch, and correspondence-draft CSV exports
- `assets/foundations-source-map.svg`: source map visual
- `reports/compiler-gap-analysis.md`: source-gap treatment report

## Local Finding Aids Incorporated

The Library Sprint section incorporates the supplied local PDFs
`2013-0185-M_Part1.pdf` through `2013-0185-M_Part4.pdf`. These are not copied
into the repository. They are used as folder-title intelligence for a reading
room pull order: directives and PRS chronologies, speechwriting drafts, NATO
and Europe files, UN and multilateral files, senior-principal process records,
global economy folders, transnational-threat records, and press/backgrounder
support files. The section can be exported as `clinton-library-pull-sheet.csv`
with one row per OA/ID request, and as `clinton-library-onsite-agenda.csv` with
day/phase sequencing, first moves, capture fields, promotion tests, and stop
rules for reading-room work.

## Source Notes

Candidate records carry provisional `Source:` notes shaped after FRUS practice:
repository, collection or office, file unit or directive, date when known, then
classification/copy/version or verification status. Folder-level Clinton
Library leads remain explicitly provisional until an item-level pull supplies
box, folder, date, markings, and release status.

The gap register includes `clinton-foundations-source-note-audit.csv`, a
combined source-note reconciliation export across chronology controls,
candidate records, Daily Diary controls, directives, public statements, and
Library pull clusters. It also exports
`clinton-foundations-source-note-templates.csv`, a reusable pattern sheet for
directive packets, Daily Diary controls, speech drafts, public strategy papers,
public speeches, Clinton Library items, and editorial-note bridges;
`clinton-foundations-verification-queue.csv`, which sorts the same evidence
into a source-note readiness worklist, and
`clinton-foundations-request-packets.csv`, which turns those tasks into
repository-facing ask text and capture fields. The companion
`clinton-foundations-request-batches.csv` groups those rows by repository and
request type for handoff planning, and
`clinton-foundations-correspondence-drafts.csv` turns those grouped batches
into ready-to-edit subject lines, recipient hints, ask text, identifiers,
capture fields, source-note targets, and URLs. Use these worksheets for
checking which leads are still locators, which have enough item-level evidence
for final FRUS source-note treatment, and which are ready for reading-room or
remote-reference outreach.

## Presidential Daily Diary Search

The Daily Diary section incorporates the NARA Catalog search for
`2010-0083-F` under `collectionIdentifier=WJC*`. The search set returned 59
online file units. The page uses selected calls, meetings, briefings, summit
preparations, and public-event controls only as chronology and source-trail
evidence. Each entry points to an item-level Catalog record and includes a
FRUS-style provisional source note; a diary entry still needs a paired call
transcript, memorandum of conversation, meeting paper, speech draft, or Public
Papers text before it can support final document selection. The section exports
`clinton-foundations-daily-diary-controls.csv` with one row per call, meeting,
briefing, summit-prep, or public-event entry, preserving the NAID, file-unit
title, follow-up target, and promotion rule.

The Source Leads section exports `clinton-foundations-source-leads.csv`,
respecting the active search, period, and institution filters. Use it to turn
the page's broad source universe into repository-specific scout lists before
writing request packets.

## Primary Anchors

- <https://history.state.gov/historicaldocuments/frus1993-00v01>
- <https://history.state.gov/historicaldocuments/clinton>
- <https://history.state.gov/historicaldocuments/status-of-the-series>
- <https://www.clintonlibrary.gov/research/presidential-directives>
- <https://clinton.presidentiallibraries.us/collections/show/27>
- <https://catalog.archives.gov/id/7388808>
- <https://catalog.archives.gov/id/7388842>
- <https://catalog.archives.gov/search?q=%222010-0083-F%22&collectionIdentifier=WJC*>
- <https://history.defense.gov/Historical-Sources/National-Security-Strategy/lang/en/>
- <https://history.state.gov/historicaldocuments/frus1969-76v01>
- <https://history.state.gov/historicaldocuments/frus1969-76v38p1>
- <https://history.state.gov/historicaldocuments/frus1977-80v01>
- <https://history.state.gov/historicaldocuments/frus1981-88v01>

## Compiler Approach

Volume I is treated as a doctrine and process volume: engagement and
enlargement, national security strategy, public doctrine, NSC directive
machinery, democracy and markets, institutions and alliances, use-of-force
rules, transnational threats, and second-term globalization handoff.

The page now leads with document chronology. That section is intentionally
ordered by date before office, topic, or record type, so a compiler can see the
sequence of released/declassified controls first: PRD/PDD anchors, Daily Diary
file units, public strategy papers, speech draft trails, and late-term handoff
records. It can be exported as `clinton-foundations-document-chronology.csv`
for reading-room pull sheets or source-note reconciliation. The companion
`clinton-foundations-chronology-triage.csv` export turns the same sequence into
a promotion worksheet with evidence roles, pairing requirements, source-note
actions, and volume-boundary cautions.

The source-note audit, verification queue, request-packet export, grouped
request batches, and correspondence drafts are the second reconciliation layer:
they keep the working source-note target, verification need, next pull,
repository ask, capture fields, and outreach text together for each evidence
group, then sort and group the tasks so archival pulls do not lose their
FRUS-style citation requirements.

The Research Ingest Checklist also exports
`clinton-foundations-compiler-runbook.csv`, a manifest that sequences every
major worksheet by compiler move, page section, export button, output filename,
decision supported, and stop condition.

The largest risk is over-collection. NATO, Russia, Balkans, arms control,
counterterrorism, economic policy, and global-issues implementation records
belong mainly to adjacent Clinton volumes unless they explain the broader
foreign-policy foundation.

The precedent-volume pass widens the document-type model. Earlier Foundations
and Nixon-Ford companion volumes selected speeches, background briefings,
campaign statements, transition reports, public articles and essays,
presidential letters, senior memoranda and memcons, Cabinet/NSC/PRC minutes,
NSSM/NSDM files, congressional testimony, briefing papers, diary/trip controls,
White House tape evidence, and editorial notes. The Clinton page now treats
those forms, or their Clinton-era equivalents, as legitimate candidate types
when they document broad doctrine, process, or source context.
