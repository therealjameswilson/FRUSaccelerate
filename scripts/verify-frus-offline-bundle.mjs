#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_SCHEMA_VERSION = "frus-annotation-checker-offline-bundle-v1";
const VERIFICATION_SCHEMA_VERSION = "frus-offline-bundle-verification-v1";

function usage() {
  console.error(
    "Usage: node scripts/verify-frus-offline-bundle.mjs [--manifest reports/frus-annotation-checker-offline-bundle-manifest.json] [--format json|text] [--skip-smoke]"
  );
  process.exit(2);
}

function readJson(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function parseArgs(argv) {
  let manifestPath = "reports/frus-annotation-checker-offline-bundle-manifest.json";
  let format = "text";
  let skipSmoke = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--manifest") {
      manifestPath = argv[index + 1];
      index += 1;
      if (!manifestPath) usage();
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
      if (!format) usage();
    } else if (arg === "--skip-smoke") {
      skipSmoke = true;
    } else {
      usage();
    }
  }

  if (!new Set(["json", "text"]).has(format)) usage();
  return { manifestPath, format, skipSmoke };
}

function validateRelativePath(filePath, label, problems) {
  if (typeof filePath !== "string" || filePath.length === 0) {
    problems.push(`${label}: expected non-empty relative path`);
    return false;
  }
  if (path.isAbsolute(filePath)) {
    problems.push(`${label}: expected a relative bundle path, got ${filePath}`);
    return false;
  }
  const normalized = path.normalize(filePath);
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    problems.push(`${label}: path must not leave the bundle root`);
    return false;
  }
  return true;
}

function displayPath(root, absolutePath) {
  return normalizePathForOutput(path.relative(root, absolutePath));
}

function resolveBundlePath(root, filePath) {
  return path.resolve(root, filePath);
}

function validateManifest(manifest) {
  const problems = [];
  if (!isPlainObject(manifest)) {
    return ["manifest: expected object"];
  }
  if (manifest.schema_version !== EXPECTED_SCHEMA_VERSION) {
    problems.push(`manifest.schema_version: expected ${EXPECTED_SCHEMA_VERSION}`);
  }
  if (!Array.isArray(manifest.required_files)) {
    problems.push("manifest.required_files: expected array");
  } else {
    manifest.required_files.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        problems.push(`manifest.required_files[${index}]: expected object`);
        return;
      }
      if (typeof entry.path !== "string" || entry.path.length === 0) {
        problems.push(`manifest.required_files[${index}].path: expected non-empty string`);
      }
      if (typeof entry.role !== "string" || entry.role.length === 0) {
        problems.push(`manifest.required_files[${index}].role: expected non-empty string`);
      }
    });
  }
  if (!Array.isArray(manifest.sample_files)) {
    problems.push("manifest.sample_files: expected array");
  } else {
    manifest.sample_files.forEach((entry, index) => {
      if (typeof entry !== "string" || entry.length === 0) {
        problems.push(`manifest.sample_files[${index}]: expected non-empty string`);
      }
    });
  }
  if (manifest.context_files !== undefined) {
    if (!Array.isArray(manifest.context_files)) {
      problems.push("manifest.context_files: expected array");
    } else {
      manifest.context_files.forEach((entry, index) => {
        if (!isPlainObject(entry)) {
          problems.push(`manifest.context_files[${index}]: expected object`);
          return;
        }
        if (typeof entry.path !== "string" || entry.path.length === 0) {
          problems.push(`manifest.context_files[${index}].path: expected non-empty string`);
        }
        if (typeof entry.role !== "string" || entry.role.length === 0) {
          problems.push(`manifest.context_files[${index}].role: expected non-empty string`);
        }
      });
    }
  }
  if (!Array.isArray(manifest.smoke_tests)) {
    problems.push("manifest.smoke_tests: expected array");
  } else {
    manifest.smoke_tests.forEach((entry, index) => {
      if (typeof entry !== "string" || entry.length === 0) {
        problems.push(`manifest.smoke_tests[${index}]: expected non-empty string`);
      }
    });
  }
  return problems;
}

function listedRequiredFiles(manifest) {
  if (!Array.isArray(manifest.required_files)) return [];
  return manifest.required_files
    .filter((entry) => isPlainObject(entry) && typeof entry.path === "string")
    .map((entry) => entry.path);
}

function listedSampleFiles(manifest) {
  if (!Array.isArray(manifest.sample_files)) return [];
  return manifest.sample_files.filter((entry) => typeof entry === "string");
}

function listedContextFiles(manifest) {
  if (!Array.isArray(manifest.context_files)) return [];
  return manifest.context_files
    .filter((entry) => isPlainObject(entry) && typeof entry.path === "string")
    .map((entry) => entry.path);
}

function listedSmokeTests(manifest) {
  if (!Array.isArray(manifest.smoke_tests)) return [];
  return manifest.smoke_tests.filter((entry) => typeof entry === "string");
}

function checkFiles(root, filePaths, label, problems) {
  const missing = [];
  for (const filePath of filePaths) {
    if (!validateRelativePath(filePath, `${label}.${filePath || "<empty>"}`, problems)) continue;
    const absolutePath = resolveBundlePath(root, filePath);
    if (!fs.existsSync(absolutePath)) {
      missing.push(normalizePathForOutput(filePath));
      problems.push(`${label}: missing ${normalizePathForOutput(filePath)}`);
    }
  }
  return {
    count: filePaths.length,
    missing
  };
}

function uniqueJsonPaths(root, manifestPath, requiredFiles, sampleFiles, contextFiles, problems) {
  const jsonPaths = new Map();

  function add(filePath, label) {
    if (!validateRelativePath(filePath, label, problems)) return;
    if (!filePath.endsWith(".json")) return;
    const absolutePath = resolveBundlePath(root, filePath);
    jsonPaths.set(displayPath(root, absolutePath), absolutePath);
  }

  add(displayPath(root, manifestPath), "manifest");
  requiredFiles.forEach((filePath) => add(filePath, `required_files.${filePath}`));
  sampleFiles.forEach((filePath) => add(filePath, `sample_files.${filePath}`));
  contextFiles.forEach((filePath) => add(filePath, `context_files.${filePath}`));
  return [...jsonPaths.entries()].map(([relativePath, absolutePath]) => ({ relativePath, absolutePath }));
}

function checkJsonFiles(jsonPaths, problems) {
  const invalid = [];
  for (const { relativePath, absolutePath } of jsonPaths) {
    if (!fs.existsSync(absolutePath)) continue;
    try {
      readJson(absolutePath);
    } catch (error) {
      invalid.push({ path: relativePath, error: error.message });
      problems.push(`${relativePath}: invalid JSON: ${error.message}`);
    }
  }
  return {
    checked: jsonPaths.filter(({ absolutePath }) => fs.existsSync(absolutePath)).length,
    invalid
  };
}

function trimOutput(value) {
  return String(value || "").trim().split(/\r?\n/).slice(0, 8).join("\n");
}

function runSmokeTests(root, commands, skipSmoke, problems) {
  if (skipSmoke) {
    return {
      count: commands.length,
      skipped: true,
      passed: 0,
      failed: []
    };
  }

  const failed = [];
  for (const command of commands) {
    const result = spawnSync(command, {
      cwd: root,
      encoding: "utf8",
      shell: true,
      maxBuffer: 1024 * 1024 * 8
    });
    if (result.error || result.status !== 0) {
      const item = {
        command,
        status: result.status,
        signal: result.signal || "",
        error: result.error ? result.error.message : "",
        stdout: trimOutput(result.stdout),
        stderr: trimOutput(result.stderr)
      };
      failed.push(item);
      problems.push(`smoke test failed: ${command}`);
    }
  }

  return {
    count: commands.length,
    skipped: false,
    passed: commands.length - failed.length,
    failed
  };
}

function renderText(result) {
  const requiredCount = result.required_files.count;
  const sampleCount = result.sample_files.count;
  const contextCount = result.context_files.count;
  const jsonCount = result.json_files.checked;
  const smokePhrase = result.smoke_tests.skipped
    ? "smoke tests skipped"
    : `${result.smoke_tests.passed} of ${result.smoke_tests.count} smoke tests`;

  if (result.status === "pass") {
    return `FRUS offline bundle verification passed: ${requiredCount} required files, ${sampleCount} sample files, ${contextCount} context files, ${jsonCount} JSON files, ${smokePhrase}.\n`;
  }

  const lines = [
    `FRUS offline bundle verification failed: ${result.problems.length} problem${result.problems.length === 1 ? "" : "s"}.`
  ];
  for (const problem of result.problems) {
    lines.push(`- ${problem}`);
  }
  return `${lines.join("\n")}\n`;
}

try {
  const { manifestPath, format, skipSmoke } = parseArgs(process.argv);
  const root = repoRoot();
  const absoluteManifestPath = resolveBundlePath(root, manifestPath);
  const manifest = readJson(absoluteManifestPath);
  const problems = validateManifest(manifest);
  const requiredFiles = listedRequiredFiles(manifest);
  const sampleFiles = listedSampleFiles(manifest);
  const contextFiles = listedContextFiles(manifest);
  const smokeTests = listedSmokeTests(manifest);

  const requiredFileSummary = checkFiles(root, requiredFiles, "required_files", problems);
  const sampleFileSummary = checkFiles(root, sampleFiles, "sample_files", problems);
  const contextFileSummary = checkFiles(root, contextFiles, "context_files", problems);
  const jsonFiles = uniqueJsonPaths(root, absoluteManifestPath, requiredFiles, sampleFiles, contextFiles, problems);
  const jsonFileSummary = checkJsonFiles(jsonFiles, problems);
  const smokeTestSummary = runSmokeTests(root, smokeTests, skipSmoke, problems);

  const result = {
    schema_version: VERIFICATION_SCHEMA_VERSION,
    manifest: displayPath(root, absoluteManifestPath),
    bundle_schema_version: manifest.schema_version || "",
    required_files: requiredFileSummary,
    sample_files: sampleFileSummary,
    context_files: contextFileSummary,
    json_files: jsonFileSummary,
    smoke_tests: smokeTestSummary,
    status: problems.length === 0 ? "pass" : "fail",
    problems
  };

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.status === "pass") {
    process.stdout.write(renderText(result));
  } else {
    process.stderr.write(renderText(result));
  }

  process.exit(result.status === "pass" ? 0 : 1);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
