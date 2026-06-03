#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runPacket(args) {
  return spawnSync(process.execPath, ["scripts/build-frus-llm-review-packet.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32
  });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "frus-llm-packet-test-"));

try {
  const markdownOut = path.join(tmpDir, "review-packet.md");
  const jsonOut = path.join(tmpDir, "review-packet.json");
  const commonArgs = [
    "--units",
    "reports/frus-annotation-checker-extracted-units.sample.json",
    "--guide",
    "reports/frus-annotation-checker-core.md",
    "--schema",
    "reports/frus-annotation-checker-output.schema.json",
    "--status-registry",
    "reports/frus-status-series-1981-1992.current.json",
    "--status-claims",
    "reports/frus-status-claims.sample.json",
    "--authority-registry",
    "reports/frus-authority-registry.sample.json",
    "--source-list-registry",
    "reports/frus-source-list-registry.sample.json",
    "--preparation-router",
    "reports/frus-preparation-router-1981-1992.current.json",
    "--permutation-matrix",
    "reports/frus-annotation-permutation-matrix.json",
    "--target-volume",
    "frus1989-92v31",
    "--run-id",
    "packet-smoke-test"
  ];

  const markdownResult = runPacket([...commonArgs, "--out", markdownOut]);
  if (markdownResult.status !== 0) {
    process.stderr.write(markdownResult.stdout);
    process.stderr.write(markdownResult.stderr);
    process.exit(markdownResult.status || 1);
  }

  const markdown = fs.readFileSync(markdownOut, "utf8");
  assert(markdown.includes("# FRUS Annotation Review Packet"), "expected packet heading");
  assert(markdown.includes("Return only one valid JSON object"), "expected strict JSON instruction");
  assert(markdown.includes("checker-output-v1"), "expected checker-output schema contract");
  assert(markdown.includes("source-note-0001"), "expected extracted unit anchor");
  assert(markdown.includes("frus1989-92v31"), "expected target volume context");
  assert(markdown.includes("Extracted Status Claims"), "expected status claims section");
  assert(markdown.includes("status-claim-0001"), "expected status claim context");
  assert(markdown.includes("Authority Registry Context"), "expected authority registry section");
  assert(markdown.includes("Bush, George Herbert Walker"), "expected authority registry content");
  assert(markdown.includes("Source List And Front Matter Registry Context"), "expected source-list registry section");
  assert(markdown.includes("George H.W. Bush Presidential Library"), "expected source-list registry content");
  assert(markdown.includes("style_discrepancy_tally"), "expected General Editor discrepancy field");
  assert(markdown.includes("Permutation Matrix Context"), "expected permutation matrix section");

  const jsonResult = runPacket([...commonArgs, "--format", "json", "--out", jsonOut]);
  if (jsonResult.status !== 0) {
    process.stderr.write(jsonResult.stdout);
    process.stderr.write(jsonResult.stderr);
    process.exit(jsonResult.status || 1);
  }

  const packet = JSON.parse(fs.readFileSync(jsonOut, "utf8"));
  assert(packet.schema_version === "frus-llm-review-packet-v1", "expected packet schema version");
  assert(packet.run_id === "packet-smoke-test", "expected run id");
  assert(packet.extracted_units.units.length === 3, "expected three sample units");
  assert(packet.contexts.status_registry.entries.length === 74, "expected current status entries");
  assert(packet.contexts.status_registry.target_volume.entry_id === "frus1989-92v31", "expected target status entry");
  assert(packet.contexts.status_claims.claims.length === 4, "expected extracted status claims");
  assert(packet.contexts.authority_registry.records.length === 8, "expected authority registry records");
  assert(packet.contexts.authority_registry.target_records.length > 0, "expected target authority records");
  assert(packet.contexts.source_list_registry.records.length === 10, "expected source-list registry records");
  assert(packet.contexts.source_list_registry.target_records.length > 0, "expected target source-list records");
  assert(packet.contexts.preparation_router.routes.length === 74, "expected preparation routes");
  assert(packet.contexts.permutation_matrix.category_policies.length > 0, "expected matrix categories");
  assert(packet.packet_summary.output_schema.categories.includes("source_note"), "expected source_note category");

  const badUnits = path.join(tmpDir, "bad-units.json");
  fs.writeFileSync(badUnits, JSON.stringify({ schema_version: "wrong", units: [] }, null, 2));
  const badResult = runPacket(["--units", badUnits, "--format", "json"]);
  assert(badResult.status !== 0, "expected bad extracted-units document to fail");
  assert(badResult.stderr.includes("frus-extracted-units-v1"), "expected schema-version failure detail");

  console.log("FRUS LLM review packet test passed: Markdown and JSON packets include units, schema, status, authority, source-list, router, and matrix context.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
