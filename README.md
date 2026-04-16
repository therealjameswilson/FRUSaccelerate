# FRUS AI Use Case Mapper

This project analyzes the 2025 Federal Agency AI Use Case Inventory and ranks the use cases that are most transferable to accelerating Foreign Relations of the United States (FRUS) production.

It combines:

- The 2025 OMB AI inventory and data dictionary
- FRUS workflow evidence from `history.state.gov`
- Digital publishing details from the `HistoryAtState` GitHub repositories

## What it produces

Run the analysis to generate:

- [`reports/frus-ai-opportunities.md`](reports/frus-ai-opportunities.md)
- [`reports/frus-ai-opportunities.json`](reports/frus-ai-opportunities.json)

The report maps federal AI use cases onto FRUS's four production stages:

- Planning
- Research
- Clearance
- Publication

## Run it

```bash
npm run analyze
```

Validation check:

```bash
npm test
```

Build the publishable static site bundle:

```bash
npm run build:site
```

Launch the local dashboard:

```bash
npm run dashboard
```

Then open `http://127.0.0.1:4173`.

## Publish it

This repo is set up for GitHub Pages with a workflow at `.github/workflows/deploy-pages.yml`.

After the dashboard branch is merged into `main`:

1. In the GitHub repo, open `Settings` > `Pages`.
2. Set the build and deployment source to `GitHub Actions` if it is not already enabled.
3. Let the `Deploy GitHub Pages` workflow run on `main`.

Expected site URL:

`https://therealjameswilson.github.io/FRUSaccelerate/`

## Project structure

- [`data/frus-context.json`](data/frus-context.json): FRUS stage model, source-backed findings, and capability themes
- [`scripts/analyze-frus.js`](scripts/analyze-frus.js): CSV parser, scoring logic, and report generator
- [`scripts/build-site.js`](scripts/build-site.js): creates the minimal static publish bundle in `site/`
- [`scripts/serve-dashboard.js`](scripts/serve-dashboard.js): local static server for the dashboard
- [`index.html`](index.html): root redirect for local and published entrypoints
- [`dashboard/index.html`](dashboard/index.html): dashboard shell
- [`dashboard/app.js`](dashboard/app.js): dashboard data wiring and interactions
- [`dashboard/styles.css`](dashboard/styles.css): dashboard visual system
- [`data/2025_individually_reported_AI_use_cases.csv`](data/2025_individually_reported_AI_use_cases.csv): downloaded OMB inventory snapshot
- [`data/ai_inventory_data_dictionary.json`](data/ai_inventory_data_dictionary.json): downloaded OMB data dictionary

## Source references

- OMB inventory repo: <https://github.com/ombegov/2025-Federal-Agency-AI-Use-Case-Inventory>
- FRUS overview: <https://history.state.gov/historicaldocuments/about-frus>
- FRUS status page: <https://history.state.gov/historicaldocuments/status-of-the-series>
- FRUS stage definitions: <https://history.state.gov/historicaldocuments/frus-history/stages>
- 2025 FRUS report to Congress: <https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf>
- HistoryAtState FRUS repo: <https://github.com/HistoryAtState/frus>
- HistoryAtState hsg-project repo: <https://github.com/HistoryAtState/hsg-project>
- HistoryAtState hsg-shell repo: <https://github.com/HistoryAtState/hsg-shell>
- HistoryAtState developer resources: <https://history.state.gov/developer>
