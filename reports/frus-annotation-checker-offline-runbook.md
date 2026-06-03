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
For authority-control checks, transfer a volume-specific authority registry
covering Persons, Abbreviations and Terms, Source List/front matter,
document-number, public-title, and index forms when available. The bundled
sample is `reports/frus-authority-registry.sample.json`.
For source-list/front-matter checks, transfer a volume-specific source-list
registry built from the target volume's Sources page, repository families, lot
files, Presidential Library files, electronic file systems, and published
sources. The bundled sample is `reports/frus-source-list-registry.sample.json`.
For document-metadata checks, transfer a volume-specific document-metadata
registry built from published document pages, including document number,
heading, date line, subject/title, sender/recipient, attachment behavior, and
editorial-note form. The bundled sample is
`reports/frus-document-metadata-registry.sample.json`.
For classification/handling checks, transfer a volume-specific classification
registry built from published source notes and attachment notes, including
original classification markings, handling controls, and verified
`No classification marking` phrases. The bundled sample is
`reports/frus-classification-registry.sample.json`.
For declassification/omission checks, transfer a volume-specific
declassification registry built from published document pages and About the
Series language, including bracketed omitted-line/paragraph counts, pages not
declassified, handling restrictions not declassified, whole-document
withholding entries, and volume review statistics. The bundled sample is
`reports/frus-declassification-registry.sample.json`.
For negative-search/no-record checks, transfer a volume-specific
negative-search registry built from published notes, including no-minutes,
not-found, not-attached, not-found-attached, no-memcon/no-telcon,
missing-attachment, and RAC attachment-ambiguity phrases. The bundled sample is
`reports/frus-negative-search-registry.sample.json`.
For document-relationship checks, transfer a volume-specific relationship
registry built from published notes, including `Attached but not printed`,
`Printed as Document [n]`, `See Document [n]`, tab/enclosure labels,
not-attached items, and mixed attachment notes. The bundled sample is
`reports/frus-document-relationship-registry.sample.json`.
For communications checks, transfer a volume-specific communications registry
built from published telegrams, cables, special-designator messages, source
families, message identifiers, date-time groups, origin/addressee lines,
precedence/routing, drafting, clearance, and approval strings. The bundled
sample is `reports/frus-communications-registry.sample.json`.
For finished-form annotation-sheet checks, transfer
`reports/frus-annotation-sheet-profile.sample.json`. It records the uploaded
good-form exemplar's flat Word structure, lexical FRUS apparatus patterns, and
literal production pseudo-marker policy.

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
3. Extract publication-status claims when current status context is available,
   then build the per-document Markdown packet that the closed-network LLM
   should receive. The sample packet is
   `reports/frus-llm-review-packet.sample.md`.

```sh
node scripts/extract-frus-status-claims.mjs --units extracted-units.json --registry reports/frus-status-series-1981-1992.current.json --out status-claims.json --format text
node scripts/build-frus-llm-review-packet.mjs --units extracted-units.json --out review-packet.md --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID
```

   Upload `review-packet.md` to the LLM. Send only editorial apparatus and
   needed context to the model. Do not ask the LLM to write `.docx`, OOXML,
   base64, or raw Track Changes markup. Save the model's single JSON object as
   `output.json`.

   If the closed-network LLM cannot fit the full packet, build chunk packets
   instead. Upload each `chunk-####-review-packet.md` separately and save each
   result as the corresponding `chunk-####-checker-output.json`.

```sh
node scripts/build-frus-llm-review-chunks.mjs --units extracted-units.json --out-dir review-chunks --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID --max-units 12
```

   After all chunks are reviewed, merge them into the single checker output
   consumed by the rest of this runbook. The merger enforces the chunk manifest:
   it fails if a chunk output cites a unit assigned to another chunk, if a chunk
   is missing, or if reviewable units have no checker entry.

```sh
node scripts/merge-frus-checker-chunks.mjs --manifest review-chunks/chunk-manifest.json --output chunk-0001=review-chunks/chunk-0001-checker-output.json --output chunk-0002=review-chunks/chunk-0002-checker-output.json --out output.json --format text
```
4. Validate the LLM JSON:

```sh
node scripts/validate-frus-checker-output.mjs output.json
```

   Then audit whether the model actually reviewed every extracted editorial
   unit. A reviewable unit with no checker entry should be treated as a silent
   coverage gap, even when the final recommendation would have been
   `no_change`.

```sh
node scripts/audit-frus-review-coverage.mjs --units extracted-units.json --output output.json --matrix reports/frus-annotation-permutation-matrix.json --format text
```

   Preferred one-command wrapper path after validation:

```sh
node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID
```

   The runner extracts units, reruns checker-output validation, runs exact-anchor
   preflight, runs source-note lint and pseudo-marker preflight, builds the
   review-coverage audit, evidence queue, and discrepancy ledger, applies safe
   Word comments, applies safe tracked changes, validates the final `.docx`,
   and writes `audit.json` plus component reports. Use the remaining commands
   in this workflow for diagnosis, reruns, or manual operation.

   For packets that contain publication-status language or family-dependent
   Reagan/Bush routing, add the current context files:

```sh
node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --today YYYY-MM-DD
```

   If the wrapper has extracted status-bearing phrases into
   `status-claims.json`, add `--status-claims status-claims.json` so direct
   publication-status edits are checked against the current registry. The
   one-command runner creates `status-claims.json` automatically when
   `--status-registry` is supplied.

5. Run direct-edit preflight:

```sh
node scripts/preflight-frus-checker-plan.mjs --units extracted-units.json --output output.json
```

6. Run annotation-sheet profile audit when the sheet resembles the finished
   exemplar or contains production pseudo-markers:

```sh
node scripts/audit-frus-annotation-sheet-profile.mjs --profile reports/frus-annotation-sheet-profile.sample.json --units extracted-units.json --checker-output output.json --format text
```

   Treat failures as release blockers. They usually mean the wrapper
   mis-unitized a flat `Source:` paragraph, encountered an unmapped angle token,
   or allowed a direct edit to touch a protected production marker.

7. Run status preflight when the packet contains publication-status language:

```sh
node scripts/extract-frus-status-claims.mjs --units extracted-units.json --registry status-registry.json --checker-output output.json --out status-claims.json --format text
node scripts/validate-frus-status-registry.mjs --registry status-registry.json --today YYYY-MM-DD
node scripts/validate-frus-preparation-router.mjs --router preparation-router.json --status-registry status-registry.json
node scripts/validate-frus-permutation-matrix.mjs --matrix permutation-matrix.json --schema reports/frus-annotation-checker-output.schema.json --router preparation-router.json
node scripts/preflight-frus-status-claims.mjs --registry status-registry.json --claims status-claims.json --today YYYY-MM-DD
```

8. Run authority-control validation and usage audit when the packet contains
   Persons, Abbreviations and Terms, Source List/front matter, document-number,
   public-title, or index language. The usage audit fails if the model proposes
   a direct authority-control edit that is only a variant, cross-volume form,
   or unsupported by the supplied registry.

```sh
node scripts/validate-frus-authority-registry.mjs --registry authority-registry.json --format text
node scripts/audit-frus-authority-usage.mjs --units extracted-units.json --registry authority-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

9. Run source-list/front-matter validation and usage audit when source notes,
   Sources pages, source-list entries, repository families, lot files,
   Presidential Library files, electronic files, or published-source references
   appear. The usage audit fails if the model proposes a direct source-list edit
   that is only a variant, cross-volume source family, or unsupported by the
   supplied source-list registry.

```sh
node scripts/validate-frus-source-list-registry.mjs --registry source-list-registry.json --format text
node scripts/audit-frus-source-list-usage.mjs --units extracted-units.json --registry source-list-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

10. Run document-metadata validation and usage audit when document headings,
   date/place lines, subject/title lines, attachment headings, editorial notes,
   sender/recipient lines, or document numbers appear. The usage audit fails if
   the model proposes a direct metadata edit that is only a shorthand variant,
   cross-volume heading, or unsupported by the supplied document-page registry.

```sh
node scripts/validate-frus-document-metadata-registry.mjs --registry document-metadata-registry.json --format text
node scripts/audit-frus-document-metadata-usage.mjs --units extracted-units.json --registry document-metadata-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

11. Run classification/handling validation and usage audit when source notes,
   attachment notes, or classification/declassification notes contain original
   markings, handling controls, or `No classification marking` language. The
   usage audit fails if the model proposes a direct classification edit that is
   only a variant, cross-volume marking, release-status statement, or
   unsupported by the supplied classification registry.

```sh
node scripts/validate-frus-classification-registry.mjs --registry classification-registry.json --format text
node scripts/audit-frus-classification-usage.mjs --units extracted-units.json --registry classification-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

12. Run declassification/omission validation and usage audit when document text,
   source notes, attachment notes, or About the Series/front matter contain
   bracketed omissions, pages not declassified, handling restrictions not
   declassified, whole-document withholding entries, or review statistics. The
   usage audit fails if the model proposes a direct omission or withholding edit
   unsupported by the supplied declassification registry.

```sh
node scripts/validate-frus-declassification-registry.mjs --registry declassification-registry.json --format text
node scripts/audit-frus-declassification-usage.mjs --units extracted-units.json --registry declassification-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

13. Run negative-search/no-record validation and usage audit when source notes,
   follow-on footnotes, editorial notes, or attachment notes contain
   no-minutes, not-found, not-attached, not-found-attached, no-memcon,
   no-telcon, unlocated-draft, or missing-attachment language. The usage audit
   fails if the model proposes a direct no-record edit that collapses one
   relationship into another without supplied registry support.

```sh
node scripts/validate-frus-negative-search-registry.mjs --registry negative-search-registry.json --format text
node scripts/audit-frus-negative-search-usage.mjs --units extracted-units.json --registry negative-search-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

14. Run document-relationship validation and usage audit when source notes,
   follow-on footnotes, editorial notes, or attachment notes contain
   attached-but-not-printed, printed-as-document, same-volume/cross-volume
   `See Document [n]`, tab/enclosure, not-attached, or mixed attachment
   language. The usage audit fails if the model proposes a direct relationship
   edit that changes target document numbers, tab labels, or attachment status
   without supplied registry support.

```sh
node scripts/validate-frus-document-relationship-registry.mjs --registry document-relationship-registry.json --format text
node scripts/audit-frus-document-relationship-usage.mjs --units extracted-units.json --registry document-relationship-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

15. Run communications validation and usage audit when source notes, follow-on
   notes, editorial notes, headings, or attachment notes contain telegrams,
   cables, special designators, message identifiers, date-time groups,
   origin/addressee lines, precedence/routing, source-family identifiers, or
   drafting/clearance/approval strings. The usage audit fails if the model
   proposes a direct communications edit unsupported by the supplied
   communications registry.

```bash
node scripts/validate-frus-communications-registry.mjs --registry communications-registry.json --format text
node scripts/audit-frus-communications-usage.mjs --units extracted-units.json --registry communications-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

16. Run source-note and production-marker checks when those unit types are
   present:

```sh
node scripts/lint-frus-source-notes.mjs --units extracted-units.json
node scripts/preflight-frus-pseudo-markers.mjs --units extracted-units.json --output output.json
```

15. Build the separate evidence queue and General Editor discrepancy ledger:

```sh
node scripts/build-frus-evidence-queue.mjs --output output.json --review-mode normal > evidence-queue.json
node scripts/build-frus-discrepancy-ledger.mjs --output output.json --existing prior-ledger.json --run-id RUN-ID > discrepancy-ledger.json
```

16. Apply safe `comment_only` findings as real Word comments, then apply only
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
17. Reopen and validate the revised `.docx`. Do not release the file if XML,
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
node scripts/test-frus-llm-review-packet.mjs
node scripts/test-frus-llm-chunk-workflow.mjs
node scripts/test-frus-review-coverage-audit.mjs
node scripts/preflight-frus-checker-plan.mjs --units reports/frus-annotation-checker-extracted-units.sample.json --output reports/frus-annotation-checker-direct-edit-sample-output.json
node scripts/test-frus-track-change-applier.mjs
node scripts/test-frus-word-comment-applier.mjs
node scripts/test-frus-docx-output-validator.mjs
node scripts/test-frus-offline-review-runner.mjs
node scripts/validate-frus-status-registry.mjs --registry reports/frus-status-series-1981-1992.current.json --today 2026-06-03
node scripts/validate-frus-preparation-router.mjs --router reports/frus-preparation-router-1981-1992.current.json --status-registry reports/frus-status-series-1981-1992.current.json
node scripts/validate-frus-permutation-matrix.mjs --matrix reports/frus-annotation-permutation-matrix.json --schema reports/frus-annotation-checker-output.schema.json --router reports/frus-preparation-router-1981-1992.current.json
node scripts/test-frus-status-claim-extractor.mjs
node scripts/extract-frus-status-claims.mjs --units reports/frus-status-claim-units.sample.json --registry reports/frus-status-series-1981-1992.current.json --format text
node scripts/preflight-frus-status-claims.mjs --registry reports/frus-status-registry-1981-1992.sample.json --claims reports/frus-status-claims.sample.json --today 2026-06-03
node scripts/preflight-frus-status-claims.mjs --registry reports/frus-status-series-1981-1992.current.json --claims reports/frus-status-claims.sample.json --today 2026-06-03
node scripts/validate-frus-authority-registry.mjs --registry reports/frus-authority-registry.sample.json --format text
node scripts/audit-frus-authority-usage.mjs --units reports/frus-authority-units.sample.json --registry reports/frus-authority-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-authority-audit.mjs
node scripts/validate-frus-source-list-registry.mjs --registry reports/frus-source-list-registry.sample.json --format text
node scripts/audit-frus-source-list-usage.mjs --units reports/frus-source-list-units.sample.json --registry reports/frus-source-list-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-source-list-audit.mjs
node scripts/validate-frus-document-metadata-registry.mjs --registry reports/frus-document-metadata-registry.sample.json --format text
node scripts/audit-frus-document-metadata-usage.mjs --units reports/frus-document-metadata-units.sample.json --registry reports/frus-document-metadata-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-document-metadata-audit.mjs
node scripts/validate-frus-classification-registry.mjs --registry reports/frus-classification-registry.sample.json --format text
node scripts/audit-frus-classification-usage.mjs --units reports/frus-classification-units.sample.json --registry reports/frus-classification-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-classification-audit.mjs
node scripts/validate-frus-declassification-registry.mjs --registry reports/frus-declassification-registry.sample.json --format text
node scripts/audit-frus-declassification-usage.mjs --units reports/frus-declassification-units.sample.json --registry reports/frus-declassification-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-declassification-audit.mjs
node scripts/validate-frus-negative-search-registry.mjs --registry reports/frus-negative-search-registry.sample.json --format text
node scripts/audit-frus-negative-search-usage.mjs --units reports/frus-negative-search-units.sample.json --registry reports/frus-negative-search-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-negative-search-audit.mjs
node scripts/validate-frus-document-relationship-registry.mjs --registry reports/frus-document-relationship-registry.sample.json --format text
node scripts/audit-frus-document-relationship-usage.mjs --units reports/frus-document-relationship-units.sample.json --registry reports/frus-document-relationship-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-document-relationship-audit.mjs
node scripts/validate-frus-communications-registry.mjs --registry reports/frus-communications-registry.sample.json --format text
node scripts/audit-frus-communications-usage.mjs --units reports/frus-communications-units.sample.json --registry reports/frus-communications-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-communications-audit.mjs
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
