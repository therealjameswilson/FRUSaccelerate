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
3. Send only editorial apparatus and needed context to the LLM. Do not ask the
   LLM to write `.docx`, OOXML, base64, or raw Track Changes markup.
4. Validate the LLM JSON:

```sh
node scripts/validate-frus-checker-output.mjs output.json
```

5. Run direct-edit preflight:

```sh
node scripts/preflight-frus-checker-plan.mjs --units extracted-units.json --output output.json
```

6. Run status preflight when the packet contains publication-status language:

```sh
node scripts/validate-frus-status-registry.mjs --registry status-registry.json --today YYYY-MM-DD
node scripts/validate-frus-preparation-router.mjs --router preparation-router.json --status-registry status-registry.json
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

9. Apply only accepted edits as real WordprocessingML tracked insertions,
   deletions, and comments. Preserve existing human revisions unless the user
   chose to accept or reject them before the checker run.
10. Reopen and validate the revised `.docx`. Do not release the file if XML,
    comments, relationships, tracked-change ids, marker boundaries, or audit
    counts fail validation.

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
node scripts/preflight-frus-checker-plan.mjs --units reports/frus-annotation-checker-extracted-units.sample.json --output reports/frus-annotation-checker-direct-edit-sample-output.json
node scripts/validate-frus-status-registry.mjs --registry reports/frus-status-series-1981-1992.current.json --today 2026-06-03
node scripts/validate-frus-preparation-router.mjs --router reports/frus-preparation-router-1981-1992.current.json --status-registry reports/frus-status-series-1981-1992.current.json
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
