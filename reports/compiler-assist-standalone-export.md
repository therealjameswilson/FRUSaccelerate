# Compiler Assist Standalone Export

This repo can generate a closed-network edition of the Compiler Assist website.
The export is built from the root `index.html` and the local FRUS Assist page
folders listed in `scripts/frus-assist-standalone-config.js`.

## Build

```bash
node scripts/build-frus-assist-standalone.js --archive
```

Default output:

- `standalone-frus-assist/`
- `build/compiler-assist-standalone-YYYYMMDD.tar.gz`

## Verify

```bash
node scripts/verify-frus-assist-standalone.js
```

The verifier checks that the bundle has 19 included FRUS Assist page folders,
23 official volume-reference pages, no root links to GitHub Pages or live
History Office volume pages, generated HTML for local Markdown-only pages, no
copied `.git` directories, and no links to the two omitted pages.

## Scope

Included pages are the volume-specific Compiler Assist pages listed on the root
site. The Eastern Europe 1989-1992 page and the 1981-1988 trade/monetary-policy
page remain omitted by request.

The builder excludes `.git`, dependency folders, temporary folders, harvest
caches, and raw document/source payload folders by default. It keeps page files,
reports, data, and assets. Use `--include-documents` only after confirming every
source file is fully local, and use `--include-cache` only when the receiving
network also needs the raw scrape/cache material.
