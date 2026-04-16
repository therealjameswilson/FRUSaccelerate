# FRUS AI Use Case Mapper

This project analyzes the 2025 Federal Agency AI Use Case Inventory and ranks the use cases that are most transferable to accelerating Foreign Relations of the United States (FRUS) production.

It combines:

- The 2025 OMB AI inventory and data dictionary
- FRUS workflow evidence from `history.state.gov`
- Digital publishing details from the `HistoryAtState` GitHub repositories

## What it produces

Run the analysis to generate:

- [reports/frus-ai-opportunities.md](/Users/jameswilson/Documents/New project/reports/frus-ai-opportunities.md)
- [reports/frus-ai-opportunities.json](/Users/jameswilson/Documents/New project/reports/frus-ai-opportunities.json)

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

Launch the local dashboard:

```bash
npm run dashboard
```

Then open `http://127.0.0.1:4173`.

## Project structure

- [data/frus-context.json](/Users/jameswilson/Documents/New project/data/frus-context.json): FRUS stage model, source-backed findings, and capability themes
- [scripts/analyze-frus.js](/Users/jameswilson/Documents/New project/scripts/analyze-frus.js): CSV parser, scoring logic, and report generator
- [scripts/serve-dashboard.js](/Users/jameswilson/Documents/New project/scripts/serve-dashboard.js): local static server for the dashboard
- [dashboard/index.html](/Users/jameswilson/Documents/New project/dashboard/index.html): dashboard shell
- [dashboard/app.js](/Users/jameswilson/Documents/New project/dashboard/app.js): dashboard data wiring and interactions
- [dashboard/styles.css](/Users/jameswilson/Documents/New project/dashboard/styles.css): dashboard visual system
- [data/2025_individually_reported_AI_use_cases.csv](/Users/jameswilson/Documents/New project/data/2025_individually_reported_AI_use_cases.csv): downloaded OMB inventory snapshot
- [data/ai_inventory_data_dictionary.json](/Users/jameswilson/Documents/New project/data/ai_inventory_data_dictionary.json): downloaded OMB data dictionary

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
