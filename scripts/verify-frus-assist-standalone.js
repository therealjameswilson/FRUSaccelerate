const fs = require("fs");
const path = require("path");

const { OFFICIAL_VOLUMES, OMITTED_PAGES, PAGES } = require("./frus-assist-standalone-config");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT_DIR = path.join(ROOT, "standalone-frus-assist");
const outDir = process.argv[2] ? path.resolve(ROOT, process.argv[2]) : DEFAULT_OUT_DIR;
const expectedOfficialVolumeIds = [...new Set(PAGES.flatMap((page) => page.officialVolumes))];

function posixPath(value) {
  return value.split(path.sep).join("/");
}

function fail(message) {
  throw new Error(message);
}

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${label}: ${filePath}`);
  }
}

function walk(rootDir, callback) {
  if (!fs.existsSync(rootDir)) {
    return;
  }
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      callback(fullPath, entry);
      walk(fullPath, callback);
    } else {
      callback(fullPath, entry);
    }
  }
}

function extractHrefs(html) {
  return [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]);
}

function verifyRootLinks(rootHtml) {
  const failures = [];
  for (const href of extractHrefs(rootHtml)) {
    if (!href || href.startsWith("#") || /^(mailto:|tel:)/i.test(href)) {
      continue;
    }
    if (/^https?:\/\//i.test(href)) {
      failures.push(`Root index still has external href: ${href}`);
      continue;
    }
    const localPart = href.split("#")[0].split("?")[0];
    if (!localPart) {
      continue;
    }
    const target = path.resolve(outDir, localPart);
    if (!target.startsWith(outDir)) {
      failures.push(`Root index href escapes bundle: ${href}`);
      continue;
    }
    if (!fs.existsSync(target)) {
      failures.push(`Root index href target missing: ${href}`);
    }
  }
  return failures;
}

function main() {
  assertExists(outDir, "standalone output directory");
  const manifestPath = path.join(outDir, "manifest.json");
  const indexPath = path.join(outDir, "index.html");
  const readmePath = path.join(outDir, "README.md");
  const externalLinksPath = path.join(outDir, "external-links.tsv");
  const officialIndexPath = path.join(outDir, "official", "index.html");

  assertExists(manifestPath, "manifest");
  assertExists(indexPath, "root index");
  assertExists(readmePath, "standalone README");
  assertExists(externalLinksPath, "external link inventory");
  assertExists(officialIndexPath, "official volume index");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== "compiler-assist-standalone-v1") {
    fail(`Unexpected manifest schema: ${manifest.schemaVersion}`);
  }
  if (manifest.pages.length !== PAGES.length) {
    fail(`Expected ${PAGES.length} pages, found ${manifest.pages.length}`);
  }
  if (manifest.officialVolumes.length !== expectedOfficialVolumeIds.length) {
    fail(`Expected ${expectedOfficialVolumeIds.length} official volumes, found ${manifest.officialVolumes.length}`);
  }
  if (manifest.archive) {
    assertExists(path.join(ROOT, manifest.archive), "standalone archive");
  }

  const manifestSlugs = new Set(manifest.pages.map((page) => page.slug));
  for (const page of PAGES) {
    if (!manifestSlugs.has(page.slug)) {
      fail(`Manifest missing page slug: ${page.slug}`);
    }
    const pageIndex = path.join(outDir, "pages", page.slug, "index.html");
    assertExists(pageIndex, `${page.slug} index`);
  }

  for (const omitted of OMITTED_PAGES) {
    if (manifestSlugs.has(omitted.slug)) {
      fail(`Omitted page is present in manifest: ${omitted.slug}`);
    }
    if (fs.existsSync(path.join(outDir, "pages", omitted.slug))) {
      fail(`Omitted page folder is present in bundle: ${omitted.slug}`);
    }
  }

  for (const volumeId of expectedOfficialVolumeIds) {
    if (!OFFICIAL_VOLUMES[volumeId]) {
      fail(`Expected official volume metadata is missing for ${volumeId}`);
    }
    assertExists(path.join(outDir, "official", `${volumeId}.html`), `${volumeId} official reference page`);
  }

  const rootHtml = fs.readFileSync(indexPath, "utf8");
  if (rootHtml.includes("https://therealjameswilson.github.io/")) {
    fail("Root index still links to GitHub Pages.");
  }
  if (rootHtml.includes("https://history.state.gov/historicaldocuments/")) {
    fail("Root index still links directly to history.state.gov.");
  }
  for (const page of PAGES) {
    const expectedHref = `pages/${page.slug}/index.html`;
    if (!rootHtml.includes(expectedHref)) {
      fail(`Root index does not link to bundled page: ${expectedHref}`);
    }
  }
  for (const omitted of OMITTED_PAGES) {
    if (rootHtml.includes(`pages/${omitted.slug}/`) || rootHtml.includes(`github.io/${omitted.slug}`)) {
      fail(`Root index still links to omitted page: ${omitted.slug}`);
    }
  }

  const rootLinkFailures = verifyRootLinks(rootHtml);
  if (rootLinkFailures.length) {
    fail(rootLinkFailures.join("\n"));
  }

  const gitDirs = [];
  const missingGeneratedHtml = [];
  walk(path.join(outDir, "pages"), (filePath, entry) => {
    if (entry.isDirectory() && entry.name === ".git") {
      gitDirs.push(posixPath(path.relative(outDir, filePath)));
    }
    if (entry.isFile() && path.extname(filePath).toLowerCase() === ".md") {
      const htmlPath = `${filePath.slice(0, -3)}.html`;
      if (!fs.existsSync(htmlPath)) {
        missingGeneratedHtml.push(posixPath(path.relative(outDir, htmlPath)));
      }
    }
  });
  if (gitDirs.length) {
    fail(`Bundle contains .git directories:\n${gitDirs.join("\n")}`);
  }
  if (missingGeneratedHtml.length) {
    fail(`Markdown files without generated HTML:\n${missingGeneratedHtml.join("\n")}`);
  }

  const summary = {
    outputDir: posixPath(path.relative(ROOT, outDir)),
    pages: manifest.pages.length,
    officialVolumes: manifest.officialVolumes.length,
    generatedMarkdownHtml: manifest.counts.generatedMarkdownHtml,
    externalUrls: manifest.counts.externalUrls,
    omitted: OMITTED_PAGES.map((page) => page.slug)
  };
  console.log(JSON.stringify(summary, null, 2));
  console.log("Compiler Assist standalone verification passed.");
}

main();
