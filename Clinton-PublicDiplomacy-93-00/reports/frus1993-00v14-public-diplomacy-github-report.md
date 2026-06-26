# FRUS 1993-2000, Volume XIV: Public Diplomacy Assist Page

Status checked: June 26, 2026

## Share Summary

This is a source-first compiler assist page for **Foreign Relations of the United States, 1993-2000, Volume XIV, Public Diplomacy**. The official Office of the Historian volume page identifies the volume as **Planned**, so the assist page is structured as a research and handoff desk rather than a published-document browser.

The page helps a reviewer or compiler start with the official volume boundary, then work through source lanes, first-pull collections, search recipes, chronology pivots, and source-note boundaries for Clinton-era public diplomacy.

## Links

- Assist page in this repo: [`../index.html`](../index.html)
- Source map asset: [`../assets/public-diplomacy-source-map.svg`](../assets/public-diplomacy-source-map.svg)
- Page README: [`../README.md`](../README.md)
- Official FRUS volume page: <https://history.state.gov/historicaldocuments/frus1993-00v14>
- Official FRUS status page: <https://history.state.gov/historicaldocuments/status-of-the-series>

If this folder is published under the existing Compiler Assist GitHub Pages hub, the expected public URL is:

<https://therealjameswilson.github.io/Compiler-Assist/Clinton-PublicDiplomacy-93-00/>

## What Was Built

- A standalone static assist page at `Clinton-PublicDiplomacy-93-00/index.html`.
- A matching stylesheet and browser script at `styles.css` and `app.js`.
- A custom SVG source map at `assets/public-diplomacy-source-map.svg`.
- A local README with run and validation notes.
- A directory tile in the main `Compiler Assist` index for Volume XIV.

## Source-First Structure

The page is organized around work a compiler can act on:

- Official FRUS title and status snapshot.
- Eight source lanes:
  - Official Frame
  - USIA-State Reorganization
  - International Broadcasting
  - Presidential Public Line
  - Culture and Exchanges
  - Regional Campaigns
  - Audience and Media Reaction
  - Source-Note Readiness
- Eighteen source anchors across Office of the Historian, Clinton Digital Library, State Department archive, NARA, GovInfo, and Congress.gov.
- Six first-pull queue items.
- Six copyable search recipes.
- Four boundary-control checks.
- A copyable source-note skeleton that keeps provenance in note prose and tracking data outside the final source note.

## First-Pull Priorities

1. Verify the official volume boundary and planned status.
2. Pull the Clinton Digital Library `Public Diplomacy` FOIA batch.
3. Build the `PDD-68` mini-dossier on international public information.
4. Map USIA and late-Clinton public diplomacy integration records.
5. Sort international broadcasting batches by decision value.
6. Pair public speeches with internal speechwriter drafts and clearance trails.

## Key Source Anchors

- `FOIA 2006-0200-F - Public Diplomacy`
- `FOIA 2006-0207-F - PDD-68 - Concerning International Public Information`
- `FOIA 2006-0208-F - United States Information Agency`
- `FOIA 2006-0199-F - Evelyn Lieberman as Under Secretary for Public Diplomacy, 1999-2001`
- `FOIA 2006-0165-F - Voice of America`
- `FOIA 2006-0202-F - International Broadcasting/Board for International Broadcasting`
- `NARA Record Group 306 - Records of the U.S. Information Agency`
- `NARA Record Group 59 - General Records of the Department of State`

## Boundary Rules

- Keep structure-only reorganization evidence in the organization-and-management volumes unless the record turns on public diplomacy substance.
- Route regional policy decisions to the relevant regional or functional FRUS volume unless audience strategy or information policy is the document's point.
- Require foreign audience evidence before treating domestic public messaging as public diplomacy.
- Exclude routine program administration unless senior review, policy choice, interagency coordination, or strategic rationale is visible.

## Validation

Completed checks:

```bash
node --check app.js
git diff --check -- Clinton-PublicDiplomacy-93-00 index.html
```

Browser smoke tests:

- Desktop render loaded the page title, SVG, 18 source cards, eight lane cards, six queue items, six recipe cards, and four boundary cards.
- Mobile-width render at 390 px showed no horizontal overflow candidates.
- Source filtering for `PDD-68` narrowed the source browser to the directive record and the crosswalked broadcasting batch.
- All 18 source URLs returned HTTP 200 during the final link sanity check.

## Share Blurb

I built a source-first FRUS Assist page for the planned Clinton public diplomacy volume. It does not pretend the unpublished volume has a document table yet. Instead, it gives a compiler or reviewer a practical starting desk: official volume status, source lanes, Clinton Library FOIA batches, NARA record-group routes, first-pull priorities, chronology pivots, search recipes, and boundary checks for keeping public diplomacy evidence separate from regional policy or organization-and-management material.
