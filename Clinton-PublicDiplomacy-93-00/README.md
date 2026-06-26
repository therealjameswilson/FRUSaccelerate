# FRUS 1993-2000 Volume XIV Assist

Static compiler-assist page for:

<https://history.state.gov/historicaldocuments/frus1993-00v14>

The official Office of the Historian page identifies the volume as *Foreign Relations of the United States, 1993-2000, Volume XIV, Public Diplomacy* and notes that its status is planned. This assist page therefore starts with source routes, pull queues, chronology pivots, search recipes, and boundary controls rather than a document-browser table.

## Local Use

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080 --directory Clinton-PublicDiplomacy-93-00
```

Then open:

<http://127.0.0.1:8080/>

## Validation

```bash
node --check app.js
```

The page has no build step and no external runtime dependencies.

## Share Report

For a GitHub-ready summary of what this assist page does and how it was checked, see:

[`reports/frus1993-00v14-public-diplomacy-github-report.md`](reports/frus1993-00v14-public-diplomacy-github-report.md)
