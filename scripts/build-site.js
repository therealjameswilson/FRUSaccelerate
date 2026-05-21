const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_ROOT = path.join(ROOT, "site");

const PUBLISH_ITEMS = [
  ["index.html", "index.html"],
  ["dashboard", "dashboard"],
  ["89-92-RussiaFSU-Policy", "89-92-RussiaFSU-Policy"],
  ["reports/frus-ai-opportunities.json", "reports/frus-ai-opportunities.json"],
  ["reports/frus-ai-opportunities.md", "reports/frus-ai-opportunities.md"],
  ["data/frus-context.json", "data/frus-context.json"]
];

function ensureParentDirectory(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function copyItem(sourceRelativePath, targetRelativePath) {
  const sourcePath = path.join(ROOT, sourceRelativePath);
  const targetPath = path.join(SITE_ROOT, targetRelativePath);
  ensureParentDirectory(targetPath);
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function main() {
  fs.rmSync(SITE_ROOT, { recursive: true, force: true });
  fs.mkdirSync(SITE_ROOT, { recursive: true });

  for (const [source, target] of PUBLISH_ITEMS) {
    copyItem(source, target);
  }

  fs.writeFileSync(path.join(SITE_ROOT, ".nojekyll"), "");

  console.log(`Built publishable site at ${path.relative(ROOT, SITE_ROOT)}`);
}

main();
