const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const intake = require("../annotation-mistakes/app.js");
const baseRegistry = require("../reports/frus-recurring-risk-registry.sample.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sampleMistakes = [
  "I write telegram 01234 and forget to strip the leading zero.",
  "I use WHSR copies of outgoing Nodis telegrams without going back to eRecords for drafting data.",
  "I leave Doc. XX clues without the date, sender, recipient, type, or above/below direction.",
  "I repeat a full citation after the third reference instead of using the footnote refer-back form."
].join("\n");

const registry = intake.buildRegistry({
  inputText: sampleMistakes,
  compilerName: "Test compiler",
  volumeHint: "Reagan Foundations",
  severity: "major",
  baseRegistry
});

const customRecords = intake.customRecords(registry);
const customFamilies = new Set(customRecords.map((record) => record.risk_family));

assert(registry.schema_version === "frus-recurring-risk-registry-v1", "registry schema mismatch");
assert(registry.records.length === baseRegistry.records.length + 4, "expected base plus four custom records");
assert(customFamilies.has("telegram_numbering"), "expected telegram_numbering custom family");
assert(customFamilies.has("telegram_copy_basis"), "expected telegram_copy_basis custom family");
assert(customFamilies.has("document_xx_construction"), "expected document_xx_construction custom family");
assert(customFamilies.has("footnote_referback"), "expected footnote_referback custom family");
assert(customRecords.every((record) => Array.isArray(record.detector_patterns) && record.detector_patterns.length > 0), "detectors required");
assert(
  intake.buildCheckerCommands("custom-recurring-risk-registry.json").includes("--recurring-risk-registry custom-recurring-risk-registry.json"),
  "checker commands must wire recurring-risk registry"
);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-mistake-intake-"));
const registryPath = path.join(tempDir, "custom-recurring-risk-registry.json");
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

const validation = spawnSync(
  process.execPath,
  ["scripts/validate-frus-recurring-risk-registry.mjs", "--registry", registryPath, "--format", "json"],
  { cwd: path.resolve(__dirname, ".."), encoding: "utf8" }
);

assert(validation.status === 0, validation.stderr || validation.stdout);
const validationResult = JSON.parse(validation.stdout);
assert(validationResult.status === "pass", `registry validation ${validationResult.status}`);

fs.rmSync(tempDir, { recursive: true, force: true });
console.log("FRUS mistake intake site test passed.");
