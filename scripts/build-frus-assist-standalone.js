const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const { OFFICIAL_VOLUMES, OMITTED_PAGES, PAGES } = require("./frus-assist-standalone-config");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT_DIR = path.join(ROOT, "standalone-frus-assist");
const BUILD_DIR = path.join(ROOT, "build");
const SCHEMA_VERSION = "compiler-assist-standalone-v1";

const args = process.argv.slice(2);
const includeCaches = args.includes("--include-cache");
const includeDocuments = args.includes("--include-documents");
const createArchive = args.includes("--archive");
const outFlagIndex = args.indexOf("--out");
const outDir = outFlagIndex >= 0 && args[outFlagIndex + 1]
  ? path.resolve(ROOT, args[outFlagIndex + 1])
  : DEFAULT_OUT_DIR;

const pageBySlug = new Map(PAGES.map((page) => [page.slug, page]));
const officialVolumeIds = [...new Set(PAGES.flatMap((page) => page.officialVolumes))];

const skipDirectoryNames = new Set([
  ".git",
  ".github",
  ".hg",
  ".svn",
  ".venv",
  "__pycache__",
  "node_modules",
  "site",
  "dist",
  ".next",
  "coverage"
]);

if (!includeCaches) {
  skipDirectoryNames.add(".cache");
  skipDirectoryNames.add("tmp");
}

if (!includeDocuments) {
  skipDirectoryNames.add("documents");
  skipDirectoryNames.add("sources");
}

const skipFileNames = new Set([".DS_Store"]);
const textExtensions = new Set([
  ".css",
  ".csv",
  ".html",
  ".htm",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".txt",
  ".xml",
  ".yml",
  ".yaml"
]);

function posixPath(value) {
  return value.split(path.sep).join("/");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function ensureSafeOutputDir(targetDir) {
  const resolved = path.resolve(targetDir);
  if (resolved === ROOT || resolved === path.dirname(ROOT) || resolved === path.parse(resolved).root) {
    throw new Error(`Refusing to remove unsafe output directory: ${resolved}`);
  }
  if (!path.basename(resolved).includes("standalone")) {
    throw new Error(`Output directory name must include "standalone": ${resolved}`);
  }
}

function splitUrlPath(rawPath) {
  let value = rawPath || "/";
  let hash = "";
  const hashIndex = value.indexOf("#");
  if (hashIndex >= 0) {
    hash = value.slice(hashIndex);
    value = value.slice(0, hashIndex);
  }

  const queryIndex = value.indexOf("?");
  if (queryIndex >= 0) {
    value = value.slice(0, queryIndex);
  }

  value = value.replace(/^\/+/, "");
  if (!value || value.endsWith("/")) {
    value = `${value}index.html`;
  }
  if (value.endsWith(".md")) {
    value = `${value.slice(0, -3)}.html`;
  }
  return { hash, pathPart: value };
}

function relativeHref(fromFile, targetFile, hash = "") {
  const fromDir = path.dirname(fromFile);
  let href = posixPath(path.relative(fromDir, targetFile));
  if (!href.startsWith(".")) {
    href = `./${href}`;
  }
  return `${href}${hash}`;
}

function targetForCompilerAssistUrl(slug, rawPath, fromFile) {
  if (slug === "Compiler-Assist" || slug === "FRUSaccelerate") {
    return relativeHref(fromFile, path.join(outDir, "index.html"));
  }

  if (!pageBySlug.has(slug)) {
    return null;
  }

  const { hash, pathPart } = splitUrlPath(rawPath);
  if (!includeDocuments && (pathPart.startsWith("documents/") || pathPart.startsWith("sources/"))) {
    return null;
  }
  return relativeHref(fromFile, path.join(outDir, "pages", slug, pathPart), hash);
}

function rewriteKnownLinks(content, fromFile) {
  let rewritten = content.replace(
    /https:\/\/therealjameswilson\.github\.io\/([A-Za-z0-9_.-]+)(\/[^\s"'<>)]*)?/g,
    (match, slug, rawPath = "/") => targetForCompilerAssistUrl(slug, rawPath, fromFile) || match
  );

  rewritten = rewritten.replace(
    /https:\/\/history\.state\.gov\/historicaldocuments\/(frus[0-9a-z-]+)/g,
    (match, volumeId) => {
      if (!OFFICIAL_VOLUMES[volumeId]) {
        return match;
      }
      return relativeHref(fromFile, path.join(outDir, "official", `${volumeId}.html`));
    }
  );

  return rewritten;
}

function copyDirectory(sourceDir, targetDir, stats) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (skipFileNames.has(entry.name)) {
      stats.skippedFiles += 1;
      continue;
    }
    if (entry.isDirectory() && skipDirectoryNames.has(entry.name)) {
      stats.skippedDirectories += 1;
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath, stats);
      continue;
    }

    if (entry.isSymbolicLink()) {
      const linkTarget = fs.readlinkSync(sourcePath);
      try {
        fs.symlinkSync(linkTarget, targetPath);
      } catch (error) {
        if (error.code !== "EEXIST") {
          throw error;
        }
      }
      stats.files += 1;
      continue;
    }

    if (!entry.isFile()) {
      stats.skippedFiles += 1;
      continue;
    }

    copyFileReadWrite(sourcePath, targetPath);
    const fileStats = fs.statSync(sourcePath);
    stats.files += 1;
    stats.bytes += fileStats.size;
  }
}

function copyFileReadWrite(sourcePath, targetPath) {
  const data = fs.readFileSync(sourcePath);
  fs.writeFileSync(targetPath, data);
  const sourceStats = fs.statSync(sourcePath);
  fs.chmodSync(targetPath, sourceStats.mode);
}

function walkFiles(rootDir, callback) {
  if (!fs.existsSync(rootDir)) {
    return;
  }
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

function rewriteCopiedTextFiles(rootDir) {
  let rewrittenFiles = 0;
  walkFiles(rootDir, (filePath) => {
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) {
      return;
    }
    const original = fs.readFileSync(filePath, "utf8");
    const rewritten = rewriteKnownLinks(original, filePath);
    if (rewritten !== original) {
      fs.writeFileSync(filePath, rewritten);
      rewrittenFiles += 1;
    }
  });
  return rewrittenFiles;
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return { body: markdown, frontMatter: {} };
  }

  const end = markdown.indexOf("\n---", 4);
  if (end < 0) {
    return { body: markdown, frontMatter: {} };
  }

  const frontMatterText = markdown.slice(4, end).trim();
  const body = markdown.slice(end + 4).replace(/^\s+/, "");
  const frontMatter = {};
  for (const line of frontMatterText.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (match) {
      frontMatter[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return { body, frontMatter };
}

function normalizeMarkdownLink(url) {
  if (/^(https?:|mailto:|#)/i.test(url)) {
    return url;
  }
  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const queryIndex = withoutHash.indexOf("?");
  let pathPart = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  if (pathPart.endsWith(".md")) {
    pathPart = `${pathPart.slice(0, -3)}.html`;
  }
  if (pathPart.endsWith("/")) {
    pathPart = `${pathPart}index.html`;
  }
  return `${pathPart}${hash}`;
}

function renderInlineMarkdown(value) {
  const codeSpans = [];
  let text = String(value).replace(/`([^`]+)`/g, (match, code) => {
    const token = `@@CODE${codeSpans.length}@@`;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  text = escapeHtml(text);
  text = text.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, (_match, url) => {
    return `<a href="${escapeAttribute(url)}">${escapeHtml(url)}</a>`;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const cleanUrl = normalizeMarkdownLink(url.trim());
    return `<a href="${escapeAttribute(cleanUrl)}">${renderInlineMarkdown(label)}</a>`;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  codeSpans.forEach((html, index) => {
    text = text.replace(`@@CODE${index}@@`, html);
  });

  return text;
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderMarkdownBody(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([A-Za-z0-9_-]+)?\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1] || "";
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      html.push(`<pre><code class="language-${escapeAttribute(language)}">${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (index + 1 < lines.length && line.includes("|") && isTableSeparator(lines[index + 1])) {
      const headerCells = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      html.push("<div class=\"table-wrap\"><table><thead><tr>");
      html.push(headerCells.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join(""));
      html.push("</tr></thead><tbody>");
      for (const row of rows) {
        html.push("<tr>");
        html.push(row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join(""));
        html.push("</tr>");
      }
      html.push("</tbody></table></div>");
      continue;
    }

    const unorderedMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (unorderedMatch) {
      html.push("<ul>");
      while (index < lines.length) {
        const match = lines[index].match(/^\s*[-*]\s+(.+)$/);
        if (!match) {
          break;
        }
        html.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index += 1;
      }
      html.push("</ul>");
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      html.push("<ol>");
      while (index < lines.length) {
        const match = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!match) {
          break;
        }
        html.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index += 1;
      }
      html.push("</ol>");
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${renderMarkdownBody(quote.join("\n"))}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^```/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function renderMarkdownPage(markdown, sourceFile, targetFile) {
  const { body, frontMatter } = parseFrontMatter(markdown);
  const firstHeading = body.match(/^#\s+(.+)$/m);
  const title = frontMatter.title || (firstHeading ? firstHeading[1] : path.basename(sourceFile, ".md"));
  const backHref = relativeHref(targetFile, path.join(outDir, "index.html"));
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - Compiler Assist Standalone</title>
    <style>
      body { margin: 0; color: #1f2933; background: #fbf7ef; font-family: Georgia, "Times New Roman", serif; }
      main { max-width: 1120px; margin: 0 auto; padding: 32px 22px 56px; }
      nav { margin-bottom: 24px; }
      nav a, main a { color: #8a3b14; font-weight: 700; }
      article { background: #fffdf8; border: 1px solid #e4d5bb; border-radius: 8px; padding: 28px; box-shadow: 0 16px 32px rgba(55, 34, 12, 0.08); }
      h1, h2, h3, h4 { color: #2b1b12; line-height: 1.15; }
      p, li { line-height: 1.6; }
      code { background: #f3eadc; padding: 0 0.22em; border-radius: 4px; }
      pre { overflow: auto; background: #28170f; color: #f7ead7; padding: 16px; border-radius: 8px; }
      blockquote { border-left: 4px solid #c9953a; margin-left: 0; padding-left: 16px; color: #55483c; }
      .table-wrap { overflow-x: auto; margin: 18px 0; }
      table { border-collapse: collapse; width: 100%; font-size: 0.94rem; }
      th, td { border: 1px solid #e0d1b9; padding: 8px 10px; vertical-align: top; }
      th { background: #f1e2ca; text-align: left; }
    </style>
  </head>
  <body>
    <main>
      <nav><a href="${escapeAttribute(backHref)}">Compiler Assist standalone index</a></nav>
      <article>
${renderMarkdownBody(body)}
      </article>
    </main>
  </body>
</html>
`;
}

function materializeMarkdownHtml(rootDir) {
  let generated = 0;
  walkFiles(rootDir, (filePath) => {
    if (path.extname(filePath).toLowerCase() !== ".md") {
      return;
    }
    const targetPath = `${filePath.slice(0, -3)}.html`;
    if (fs.existsSync(targetPath)) {
      return;
    }
    const markdown = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(targetPath, renderMarkdownPage(markdown, filePath, targetPath));
    generated += 1;
  });
  return generated;
}

function generateStandaloneIndex() {
  const sourceIndex = path.join(ROOT, "index.html");
  const targetIndex = path.join(outDir, "index.html");
  let html = fs.readFileSync(sourceIndex, "utf8");
  html = rewriteKnownLinks(html, targetIndex);
  html = html
    .replace("<title>Compiler Assist</title>", "<title>Compiler Assist - Standalone</title>")
    .replace("Volume Directory Edition", "Standalone Volume Directory Edition")
    .replace("Live FRUS Assist pages", "Standalone FRUS Assist pages")
    .replace("Official volume-title links", "Offline title references")
    .replace("links to the local assist page, and keeps the official History Office volume page beside it.", "links to the bundled assist page, and keeps an offline official volume-title reference beside it.")
    .replace("keeps the official History Office volume page beside it.", "keeps an offline official volume-title reference beside it.");
  fs.writeFileSync(targetIndex, html);
}

function generateOfficialVolumePages() {
  const officialDir = path.join(outDir, "official");
  fs.mkdirSync(officialDir, { recursive: true });

  const rows = officialVolumeIds.map((volumeId) => {
    const volume = OFFICIAL_VOLUMES[volumeId];
    return `<tr><td><a href="./${volumeId}.html">${escapeHtml(volumeId)}</a></td><td>${escapeHtml(volume.period)}</td><td>${escapeHtml(volume.volumeLabel)}</td><td>${escapeHtml(volume.title)}</td></tr>`;
  }).join("\n");

  const indexHtml = renderSimplePage(
    "Official FRUS Volume References",
    `<p>This local index records the official History Office volume pages represented by the bundled Compiler Assist pages. Original public URLs are preserved as text on each volume page for later checking on an internet-connected machine.</p>
    <table><thead><tr><th>Volume ID</th><th>Period</th><th>Volume</th><th>Title</th></tr></thead><tbody>${rows}</tbody></table>`,
    path.join(officialDir, "index.html")
  );
  fs.writeFileSync(path.join(officialDir, "index.html"), indexHtml);

  for (const volumeId of officialVolumeIds) {
    const volume = OFFICIAL_VOLUMES[volumeId];
    const pages = PAGES.filter((page) => page.officialVolumes.includes(volumeId));
    const pageLinks = pages.map((page) => {
      const href = relativeHref(path.join(officialDir, `${volumeId}.html`), path.join(outDir, "pages", page.slug, "index.html"));
      return `<li><a href="${escapeAttribute(href)}">${escapeHtml(page.title)}</a></li>`;
    }).join("\n");
    const originalUrl = `https://history.state.gov/historicaldocuments/${volumeId}`;
    const body = `<p><strong>${escapeHtml(volume.period)}, ${escapeHtml(volume.volumeLabel)}</strong></p>
      <p>${escapeHtml(volume.title)}</p>
      <h2>Bundled assist page</h2>
      <ul>${pageLinks}</ul>
      <h2>Original public URL</h2>
      <p><code>${escapeHtml(originalUrl)}</code></p>`;
    fs.writeFileSync(path.join(officialDir, `${volumeId}.html`), renderSimplePage(`${volumeId}: ${volume.title}`, body, path.join(officialDir, `${volumeId}.html`)));
  }
}

function renderSimplePage(title, body, targetFile) {
  const backHref = relativeHref(targetFile, path.join(outDir, "index.html"));
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - Compiler Assist Standalone</title>
    <style>
      body { margin: 0; color: #1f2933; background: #fbf7ef; font-family: Georgia, "Times New Roman", serif; }
      main { max-width: 1000px; margin: 0 auto; padding: 32px 22px 56px; }
      a { color: #8a3b14; font-weight: 700; }
      section { background: #fffdf8; border: 1px solid #e4d5bb; border-radius: 8px; padding: 28px; box-shadow: 0 16px 32px rgba(55, 34, 12, 0.08); }
      h1, h2 { color: #2b1b12; }
      p, li { line-height: 1.6; }
      code { background: #f3eadc; padding: 0.1em 0.28em; border-radius: 4px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e0d1b9; padding: 8px 10px; text-align: left; vertical-align: top; }
      th { background: #f1e2ca; }
    </style>
  </head>
  <body>
    <main>
      <p><a href="${escapeAttribute(backHref)}">Compiler Assist standalone index</a></p>
      <section>
        <h1>${escapeHtml(title)}</h1>
        ${body}
      </section>
    </main>
  </body>
</html>
`;
}

function generateReadme(manifest) {
  const lines = [
    "# Compiler Assist Standalone Export",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "Open `index.html` directly in a browser, or serve the folder on a closed network:",
    "",
    "```bash",
    "python3 -m http.server 8080 --directory standalone-frus-assist",
    "```",
    "",
    "Then open `http://127.0.0.1:8080/` from the machine hosting the bundle.",
    "",
    "## Contents",
    "",
    `- ${manifest.counts.pages} bundled FRUS Assist page folders under \`pages/\`.`,
    `- ${manifest.counts.officialVolumes} local official-volume reference pages under \`official/\`.`,
    "- `manifest.json` records every copied source folder and volume title.",
    "- `external-links.tsv` inventories remaining public URLs that are references, not closed-network dependencies.",
    "",
    "## Omitted By Request",
    "",
    ...OMITTED_PAGES.map((page) => `- \`${page.slug}\`: ${page.title}. ${page.reason}`),
    "",
    "## Default Exclusions",
    "",
    "The builder excludes `.git`, dependency folders, temporary folders, harvest caches, and raw document/source payload folders by default. Rebuild with `--include-documents` only after confirming every source file is fully local, and add `--include-cache` only if a transfer needs raw scrape/cache directories too.",
    "",
    "## Rebuild",
    "",
    "From the repository root:",
    "",
    "```bash",
    "node scripts/build-frus-assist-standalone.js --archive",
    "node scripts/verify-frus-assist-standalone.js",
    "```"
  ];
  fs.writeFileSync(path.join(outDir, "README.md"), `${lines.join("\n")}\n`);
}

function collectExternalLinks() {
  const urlPattern = /https?:\/\/[^\s"'<>)]*/g;
  const links = new Map();
  let scannedFiles = 0;
  let skippedLargeFiles = 0;

  walkFiles(outDir, (filePath) => {
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) {
      return;
    }
    const stats = fs.statSync(filePath);
    if (stats.size > 5 * 1024 * 1024) {
      skippedLargeFiles += 1;
      return;
    }
    scannedFiles += 1;
    const relativeFile = posixPath(path.relative(outDir, filePath));
    const content = fs.readFileSync(filePath, "utf8");
    for (const match of content.matchAll(urlPattern)) {
      const url = match[0].replace(/[.,;:]+$/, "");
      if (!links.has(url)) {
        links.set(url, new Set());
      }
      links.get(url).add(relativeFile);
    }
  });

  const rows = ["url\tfile_count\texample_files"];
  for (const [url, files] of [...links.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    rows.push(`${url}\t${files.size}\t${[...files].slice(0, 5).join(";")}`);
  }
  fs.writeFileSync(path.join(outDir, "external-links.tsv"), `${rows.join("\n")}\n`);
  return { scannedFiles, skippedLargeFiles, uniqueUrls: links.size };
}

function plannedArchivePath() {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return path.join(BUILD_DIR, `compiler-assist-standalone-${stamp}.tar.gz`);
}

function createTarball(archivePath) {
  const result = childProcess.spawnSync("tar", ["-czf", archivePath, "-C", outDir, "."], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`tar failed: ${result.stderr || result.stdout}`);
  }
  return archivePath;
}

function main() {
  ensureSafeOutputDir(outDir);
  fs.rmSync(outDir, { force: true, recursive: true });
  fs.mkdirSync(path.join(outDir, "pages"), { recursive: true });

  const pageResults = [];
  for (const page of PAGES) {
    const sourceDir = path.join(ROOT, page.slug);
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Missing source directory for ${page.slug}: ${sourceDir}`);
    }
    const targetDir = path.join(outDir, "pages", page.slug);
    const stats = { bytes: 0, files: 0, skippedDirectories: 0, skippedFiles: 0 };
    copyDirectory(sourceDir, targetDir, stats);
    pageResults.push({
      ...page,
      sourceDir: page.slug,
      targetDir: posixPath(path.relative(outDir, targetDir)),
      copiedFiles: stats.files,
      copiedBytes: stats.bytes,
      skippedDirectories: stats.skippedDirectories,
      skippedFiles: stats.skippedFiles
    });
  }

  const rewrittenFiles = rewriteCopiedTextFiles(path.join(outDir, "pages"));
  const generatedMarkdownHtml = materializeMarkdownHtml(path.join(outDir, "pages"));
  rewriteCopiedTextFiles(path.join(outDir, "pages"));
  generateStandaloneIndex();
  generateOfficialVolumePages();

  const externalLinkInventory = collectExternalLinks();
  const archivePath = createArchive ? plannedArchivePath() : null;

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    generator: "scripts/build-frus-assist-standalone.js",
    outputDir: posixPath(path.relative(ROOT, outDir)),
    archive: archivePath ? posixPath(path.relative(ROOT, archivePath)) : null,
    defaultExclusions: [...skipDirectoryNames].sort(),
    counts: {
      pages: pageResults.length,
      officialVolumes: officialVolumeIds.length,
      generatedMarkdownHtml,
      rewrittenFiles,
      externalUrls: externalLinkInventory.uniqueUrls
    },
    omitted: OMITTED_PAGES,
    pages: pageResults,
    officialVolumes: officialVolumeIds.map((volumeId) => ({
      id: volumeId,
      ...OFFICIAL_VOLUMES[volumeId],
      originalUrl: `https://history.state.gov/historicaldocuments/${volumeId}`
    })),
    externalLinkInventory
  };

  fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  generateReadme(manifest);
  if (archivePath) {
    createTarball(archivePath);
  }

  console.log(`Built ${manifest.outputDir}`);
  console.log(`Pages: ${manifest.counts.pages}`);
  console.log(`Official volume references: ${manifest.counts.officialVolumes}`);
  console.log(`Generated Markdown HTML files: ${manifest.counts.generatedMarkdownHtml}`);
  console.log(`External URLs inventoried: ${manifest.counts.externalUrls}`);
  if (archivePath) {
    console.log(`Archive: ${posixPath(path.relative(ROOT, archivePath))}`);
  }
}

main();
