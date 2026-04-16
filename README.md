# FRUSaccelerate

FRUSaccelerate is a portal and analysis project for using federal-government AI precedents to speed the production of *Foreign Relations of the United States*.

It translates the [2025 Federal Agency AI Use Case Inventory](https://github.com/ombegov/2025-Federal-Agency-AI-Use-Case-Inventory) into a practical FRUS program centered on the real bottlenecks documented by `history.state.gov` and the HistoryAtState GitHub repositories.

The working premise is simple: the fastest path is not a speculative moonshot. It is a bounded FY 2026 program, ending on **September 30, 2026**, that borrows AI patterns the federal government is already piloting or deploying for archival search, metadata drafting, redaction triage, routing, and editorial QA.

## Portal

Published site target:

<https://therealjameswilson.github.io/FRUSaccelerate/>

The portal lays out:

- the FRUS production constraints and source-backed findings
- the 10 strongest end-of-fiscal-year projects
- the full idea atlas behind those projects
- the federal precedents already in use elsewhere in government
- the searchable set of 198 shortlisted use cases

## Top 10 Projects By September 30, 2026

1. **FRUS Clearance Triage Assistant**  
   Score passages for likely sensitivity, suggest candidate redactions, and focus reviewer attention on the most likely blockers.
2. **Semantic FRUS Research Workbench**  
   Add semantic retrieval across prior FRUS volumes, finding aids, editorial notes, and archival descriptions.
3. **Metadata Autofill for Source Packets**  
   Generate draft descriptions, tags, and structured metadata for research packets and released chapters.
4. **Born-Digital Index and Glossary Builder**  
   Extract people, organizations, abbreviations, and topics for draft indexes and glossary entries.
5. **Annotation Draft Copilot**  
   Draft first-pass annotations, provenance notes, and explanatory summaries from already-selected documents.
6. **Prior-Release and FOIA Precedent Comparator**  
   Find similar previously released passages and comparable handling decisions for reviewer reference.
7. **Duplicate Detection and Document Clustering**  
   Group related documents, flag near duplicates, and improve source-packet assembly.
8. **OCR, Transcription, and Translation Intake Lane**  
   Produce historian-reviewable draft text and translation for scanned or foreign-language material.
9. **TEI Editorial QA Assistant**  
   Check TEI packages for missing descriptions, broken structures, and publication-readiness gaps.
10. **Chapter Release Readiness Cockpit**  
    Show what can be released now, what is blocked, and which sequence creates the fastest public-value gain.

## Why These 10

These projects were chosen because they are:

- directly tied to FRUS planning, research, clearance, or publication stages
- bounded enough to pilot before **September 30, 2026**
- compatible with the existing TEI and eXist-db publishing stack
- backed by federal precedents already in use, especially at NARA, DOJ, DHS, VA, NASA, NTSB, and DOI
- aimed at the most documented FRUS bottleneck: declassification and clearance delay

The strongest precedent signals include:

- `NARA - 0005` for archival screening and redaction triage
- `NARA - 0006` and `NARA - 0013` for semantic archival retrieval
- `NARA - 0007` and `NARA - 0008` for metadata drafting, summarization, and entity extraction
- `DOJ-0295` and `NTSB-0004` for precedent comparison and clustering
- `DOJ-0343` and `DHS-2540` for metadata governance and QA-oriented checks

## Run It Locally

Install dependencies if needed, then:

```bash
npm run analyze
npm run dashboard
```

Open:

`http://127.0.0.1:4173`

Validation checks:

```bash
npm test
node --check dashboard/app.js
```

Build the publishable static bundle:

```bash
npm run build:site
```

## Project Structure

- [`data/frus-context.json`](data/frus-context.json): FRUS workflow evidence, idea families, and the FY 2026 project slate
- [`reports/frus-ai-opportunities.json`](reports/frus-ai-opportunities.json): ranked shortlist of transferable federal AI use cases
- [`reports/frus-ai-opportunities.md`](reports/frus-ai-opportunities.md): narrative report version of the findings
- [`dashboard/index.html`](dashboard/index.html): portal shell
- [`dashboard/app.js`](dashboard/app.js): portal rendering and interactions
- [`dashboard/styles.css`](dashboard/styles.css): portal design system
- [`scripts/analyze-frus.js`](scripts/analyze-frus.js): use-case scoring and report generation
- [`scripts/build-site.js`](scripts/build-site.js): static publish build for GitHub Pages
- [`scripts/serve-dashboard.js`](scripts/serve-dashboard.js): lightweight local server

## Publish It

This repo is configured for GitHub Pages through `.github/workflows/deploy-pages.yml`.

To publish:

1. Merge the portal branch into `main`.
2. In GitHub, open `Settings` → `Pages`.
3. Set the source to `GitHub Actions`.
4. Let the `Deploy GitHub Pages` workflow run on `main`.

## Source Base

- OMB inventory repo: <https://github.com/ombegov/2025-Federal-Agency-AI-Use-Case-Inventory>
- FRUS overview: <https://history.state.gov/historicaldocuments/about-frus>
- FRUS status page: <https://history.state.gov/historicaldocuments/status-of-the-series>
- FRUS stages: <https://history.state.gov/historicaldocuments/frus-history/stages>
- 2025 FRUS report to Congress: <https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf>
- HistoryAtState FRUS repo: <https://github.com/HistoryAtState/frus>
- HistoryAtState hsg-project repo: <https://github.com/HistoryAtState/hsg-project>
- HistoryAtState hsg-shell repo: <https://github.com/HistoryAtState/hsg-shell>
- HistoryAtState developer resources: <https://history.state.gov/developer>
