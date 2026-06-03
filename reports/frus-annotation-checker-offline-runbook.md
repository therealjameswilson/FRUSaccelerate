# FRUS Annotation Checker Offline Runbook

Use this runbook when moving the FRUS Annotation Checker onto a closed network.
The LLM is only the spellcheck engine. The wrapper extracts Word units,
validates output, applies safe changes as Track Changes, and builds audit
queues for unresolved evidence and General Editor style questions.

## Bundle

Transfer the files listed in
`reports/frus-annotation-checker-offline-bundle-manifest.json`.

Minimum runtime requirement: Node.js that can run ECMAScript modules. The
scripts have no external package dependencies.

For Reagan/Bush 1981-1992 status and cross-volume checks, transfer the current
context file `reports/frus-status-series-1981-1992.current.json`. Refresh this
file from the official History Office status page before any production batch
that may change publication-status wording.
For volume-family routing, transfer
`reports/frus-preparation-router-1981-1992.current.json` and validate it against
the status registry before family-dependent direct edits.
For category and evidence-request coverage, transfer
`reports/frus-annotation-permutation-matrix.json`; it maps every checker
category to required context, evidence requests, safe actions, and router
hazards.

Verify the package before transfer and again after installation:

```sh
node scripts/verify-frus-offline-bundle.mjs --format text
```

## Workflow

1. Load `reports/frus-annotation-checker.md` as the full standard, or
   `reports/frus-annotation-checker-core.md` for a small-context model.
2. Extract the uploaded `.docx` into `extracted_units` with stable `unit_id`,
   `exact_text`, `display_text`, unit type, Word part, editability, existing
   revision state, blocked boundaries, and marker policy.

```sh
node scripts/extract-frus-docx-units.mjs --docx input.docx --out extracted-units.json --format text
```

   The bundled extractor reads body paragraphs, tables, footnotes, endnotes,
   comments, headers, and footers. It marks complex Word boundaries as
   comment-only instead of making them eligible for direct edits.
3. Send only editorial apparatus and needed context to the LLM. Do not ask the
   LLM to write `.docx`, OOXML, base64, or raw Track Changes markup.
4. Validate the LLM JSON:

```sh
node scripts/validate-frus-checker-output.mjs output.json
```

   Preferred one-command wrapper path after validation:

```sh
node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID
```

   The runner extracts units, reruns checker-output validation, runs exact-anchor
   preflight, runs source-note lint and pseudo-marker preflight, builds the
   evidence queue and discrepancy ledger, applies safe Word comments, applies
   safe tracked changes, validates the final `.docx`, and writes `audit.json`
   plus component reports. Use the remaining commands in this workflow for
   diagnosis, reruns, or manual operation.

   For packets that contain publication-status language or family-dependent
   Reagan/Bush routing, add the current context files:

```sh
node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID --status-registry reports/frus-status-series-1981-1992.current.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --today YYYY-MM-DD
```

   If the wrapper has extracted status-bearing phrases into
   `status-claims.json`, add `--status-claims status-claims.json` so direct
   publication-status edits are checked against the current registry.

5. Run direct-edit preflight:

```sh
node scripts/preflight-frus-checker-plan.mjs --units extracted-units.json --output output.json
```

6. Run status preflight when the packet contains publication-status language:

```sh
node scripts/validate-frus-status-registry.mjs --registry status-registry.json --today YYYY-MM-DD
node scripts/validate-frus-preparation-router.mjs --router preparation-router.json --status-registry status-registry.json
node scripts/validate-frus-permutation-matrix.mjs --matrix permutation-matrix.json --schema reports/frus-annotation-checker-output.schema.json --router preparation-router.json
node scripts/preflight-frus-status-claims.mjs --registry status-registry.json --claims status-claims.json --today YYYY-MM-DD
```

7. Run source-note and production-marker checks when those unit types are
   present:

```sh
node scripts/lint-frus-source-notes.mjs --units extracted-units.json
node scripts/preflight-frus-pseudo-markers.mjs --units extracted-units.json --output output.json
```

8. Build the separate evidence queue and General Editor discrepancy ledger:

```sh
node scripts/build-frus-evidence-queue.mjs --output output.json --review-mode normal > evidence-queue.json
node scripts/build-frus-discrepancy-ledger.mjs --output output.json --existing prior-ledger.json --run-id RUN-ID > discrepancy-ledger.json
```

9. Apply safe `comment_only` findings as real Word comments, then apply only
   accepted direct edits as real WordprocessingML tracked insertions and
   deletions. The no-dependency appliers handle narrow, verified single-run
   anchors and fail on complex anchors rather than guessing:

```sh
node scripts/apply-frus-word-comments.mjs --docx input.docx --units extracted-units.json --checker-output output.json --out commented.docx
```

```sh
node scripts/apply-frus-track-changes.mjs --docx commented.docx --units extracted-units.json --checker-output output.json --out revised.docx
```

   The comment applier creates `word/comments.xml`, the document relationship,
   the content-type override, comment bodies, and range anchors when they are
   safe. Global comments and complex Word anchors remain audit items until a
   fuller wrapper can place them. Preserve existing human revisions unless the
   user chose to accept or reject them before the checker run.
10. Reopen and validate the revised `.docx`. Do not release the file if XML,
    comments, relationships, tracked-change ids, marker boundaries, or audit
    counts fail validation.

```sh
node scripts/validate-frus-docx-output.mjs --docx revised.docx --expect-comments N --expect-insertions N --expect-deletions N
```

   Use the counts from the comment and tracked-change application reports. If a
   visual renderer or Word/Open XML validator is available on the closed
   network, run it after this structural validator.

## Smoke Tests

Run the whole-bundle verifier first:

```sh
node scripts/verify-frus-offline-bundle.mjs --format text
```

The verifier checks the manifest, required files, sample files, JSON fixtures,
and every manifest smoke test. When diagnosing a failure, run the component
tests directly:

```sh
node scripts/verify-frus-offline-bundle.mjs --skip-smoke --format text
node scripts/validate-frus-checker-output.mjs reports/frus-annotation-checker-sample-output.json
node scripts/validate-frus-checker-output.mjs reports/frus-annotation-checker-direct-edit-sample-output.json
node scripts/test-frus-docx-unit-extractor.mjs
node scripts/preflight-frus-checker-plan.mjs --units reports/frus-annotation-checker-extracted-units.sample.json --output reports/frus-annotation-checker-direct-edit-sample-output.json
node scripts/test-frus-track-change-applier.mjs
node scripts/test-frus-word-comment-applier.mjs
node scripts/test-frus-docx-output-validator.mjs
node scripts/test-frus-offline-review-runner.mjs
node scripts/validate-frus-status-registry.mjs --registry reports/frus-status-series-1981-1992.current.json --today 2026-06-03
node scripts/validate-frus-preparation-router.mjs --router reports/frus-preparation-router-1981-1992.current.json --status-registry reports/frus-status-series-1981-1992.current.json
node scripts/validate-frus-permutation-matrix.mjs --matrix reports/frus-annotation-permutation-matrix.json --schema reports/frus-annotation-checker-output.schema.json --router reports/frus-preparation-router-1981-1992.current.json
node scripts/preflight-frus-status-claims.mjs --registry reports/frus-status-registry-1981-1992.sample.json --claims reports/frus-status-claims.sample.json --today 2026-06-03
node scripts/preflight-frus-status-claims.mjs --registry reports/frus-status-series-1981-1992.current.json --claims reports/frus-status-claims.sample.json --today 2026-06-03
node scripts/lint-frus-source-notes.mjs --units reports/frus-source-note-units.sample.json
node scripts/preflight-frus-pseudo-markers.mjs --units reports/frus-pseudo-marker-units.sample.json --output reports/frus-pseudo-marker-safe-output.sample.json
node scripts/build-frus-evidence-queue.mjs --output reports/frus-annotation-checker-sample-output.json --review-mode normal --format text
node scripts/build-frus-discrepancy-ledger.mjs --output reports/frus-annotation-checker-sample-output.json --run-id sample-fixture --format text
```

## Operating Posture

- Treat the checker like a bespoke FRUS spellcheck, not a rewriting assistant.
- Prefer comments and evidence requests over invented source facts.
- Apply direct edits only when evidence, exact anchor, Word boundary, and
  review mode all support the change.
- Keep the evidence queue separate from the General Editor discrepancy ledger.
  Missing proof is not a style variation; recurring defensible variation is not
  an error.
