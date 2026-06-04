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
For source-family checks, transfer a volume-specific source-family registry so
the checker can preserve PROFS, W Files, System IV, H-Files, CFPF reels, lot
files, presidential-library collections, and public-source families without
flattening them into generic repository labels. The bundled sample is
`reports/frus-source-family-registry.sample.json`.
For source-surrogate/release checks, transfer a target-volume registry covering
RAC, NLR, no-N-number, FOIA/MDR, NARA catalog, PDF, scan, URL, release-package,
W Files, PROFS, eRecords, internet-resource, transfer-to-NARA, and provisional
discovery labels. The bundled sample is
`reports/frus-source-surrogate-registry.sample.json`.
For document-status/lifecycle checks, transfer a target-volume registry covering
prepared-by, drafted-by, cleared-by, copied-to, sent-for-action, sent-through,
stamped/read/signed, copy/version, draft/prior-version, no-minutes/no-record,
missing-page, and incomplete-copy language. The bundled sample is
`reports/frus-document-status-lifecycle-registry.sample.json`.
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
For translation/foreign-origin checks, transfer a volume-specific translation
registry built from published source notes, headings, attachment notes, and
follow-on footnotes, including official, unofficial, informal, Language
Services, editor-transcribed, original-language, foreign-copy, and
foreign-text-in-file apparatus. The bundled sample is
`reports/frus-translation-registry.sample.json`.
For printed/nested attachment checks, transfer a volume-specific printed
attachment registry built from published child headings, tabs, enclosures,
attached-but-not-printed notes, printed-as-document targets, child source notes,
child classification markings, and parent-child maps. The bundled sample is
`reports/frus-printed-attachment-registry.sample.json`.
For visual-material checks, transfer a volume-specific visual-material registry
built from published maps, photographs, charts, images, graphic attachments,
appendix images, captions/titles, not-found or not-attached visual items,
source-image links, printed targets, and visual-identification notes. The
bundled sample is `reports/frus-visual-material-registry.sample.json`.
For handwritten/facsimile transcription checks, transfer a target-volume
registry for handwritten notes and letters, editor-transcribed portions,
original brackets and ellipses, unclear or illegible readings, cut-off lines,
appendix/facsimile images, marginalia and transcribed margin notes,
source-image basis, and reverse appendix targets. The bundled sample is
`reports/frus-handwritten-transcription-registry.sample.json`.
For document-handling/marginalia checks, transfer a volume-specific document
handling registry built from published initials, handwritten notes,
marginalia, underlining, checkmarks, stamped notations, read-by/seen language,
sent-for-action or sent-for-information routing, copy status,
bracket/original-status phrases, approval/disapproval, unknown-hand marks, and
signed status. The bundled sample is
`reports/frus-document-handling-registry.sample.json`.
For chronology/time checks, transfer a volume-specific chronology registry
built from published President's Daily Diary entries, meeting and call times,
place and attendance, actual-versus-planned meeting times, schedule/diary
absences, no-precise-time caveats, and event-sequence facts. The bundled sample
is `reports/frus-chronology-registry.sample.json`.
For meeting attendance/participant-list checks, transfer a volume-specific
meeting attendance registry built from published President's Daily Diary
attendance notes, NSC meeting notes, exact participants, partial attendance
windows, participant-list not-attached or attached-but-not-printed status, and
no-minutes/no-memcon caveats. The bundled sample is
`reports/frus-meeting-attendance-registry.sample.json`.
For time-zone/date-time-group checks, transfer a volume-specific time-zone
registry built from published Washington-time rules, local-time labels,
GMT/Z/Zulu date-time groups, EST/EDT labels, no-precise-time caveats,
deadlines, treaty timing rules, conversions, and chronological placement. The
bundled sample is `reports/frus-time-zone-registry.sample.json`.
For summit/public-event checks, transfer a volume-specific event registry built
from published summit travel, signing ceremonies, public remarks, public
addresses, news conferences, interviews, United Nations addresses, toasts,
arrival/departure events, diary/schedule basis, press basis, event sequence,
participants, place, date/time, public-source basis, and full-record-elsewhere
targets. The bundled sample is
`reports/frus-summit-public-event-registry.sample.json`.
For selection-balance/completeness checks, transfer a volume-specific
selection-balance registry built from published principles of selection,
chapter or volume scope, excerpted portions, omitted non-scope material,
complete records printed or scheduled elsewhere, related-volume boundaries,
withheld-document effects, known gaps, and General Editor scope decisions. The
bundled sample is `reports/frus-selection-balance-registry.sample.json`.
For decision-process/directive checks, transfer a volume-specific decision-
process registry built from published NSR, NSD, NSDD, NSSD, NSC/DC, PCC,
Deputies or Principals Committee, NSC meeting, tab, tasking, interagency paper,
directive heading, draft directive, record-of-decision, scheduled-publication
boundary, and decision-stage language. The bundled sample is
`reports/frus-decision-process-registry.sample.json`.
For public-source/public-diplomacy checks, transfer a volume-specific
public-source registry built from published speeches, public remarks, press
conferences, briefings, interviews, broadcasts, testimony, Public Papers,
Department of State Bulletin/Dispatch, Congressional Record, official
transcripts, newspaper excerpts, full-text targets, archival speech or briefing
files, diary context, and selected-versus-supplemental public-source status.
The bundled sample is `reports/frus-public-source-registry.sample.json`.
For retrospective-account checks, transfer a volume-specific retrospective-
account registry built from published memoir, personal-diary, oral-history,
later-interview, recollection, press-retrospective, newspaper-account, page-
locator, selected-versus-supplemental, official-record-relationship,
corroborating-record, and conflict-status examples. The bundled sample is
`reports/frus-retrospective-account-registry.sample.json`.
For treaty/legal-instrument checks, transfer a volume-specific treaty registry
built from treaty text, protocols, annexes, memoranda of understanding,
associated but non-integral documents, Senate transmittal packages, Treaty Doc.
references, ratification, entry-into-force, legal authority, and draft
treaty-package language. The bundled sample is
`reports/frus-treaty-registry.sample.json`.
For foreign/international-organization checks, transfer a volume-specific
foreign-org registry built from country names, successor-state references,
alliances, international organizations, regional bodies, summit/conference
names, international financial institutions, trade regimes, UN resolution
forms, political parties, and treaty-party language. The bundled sample is
`reports/frus-foreign-org-registry.sample.json`.
For economic/financial checks, transfer a volume-specific economic-financial
registry built from dollar amounts, percentages, debt metrics, IMF quotas and
resources, General Arrangements to Borrow, World Bank and MDB funding, Paris
Club debt relief, Baker Plan references, Eximbank/OPIC/ESF/AID program labels,
arrears, loans, grants, budget claims, trade-finance, exchange-rate,
commodity-policy, and foreign economic policy scope language. The bundled
sample is `reports/frus-economic-financial-registry.sample.json`.
For military/crisis checks, transfer a target-volume military-crisis registry
for operation names, force presence, Gulf of Sidra/Bay of Sidra and Persian
Gulf navigation claims, naval incidents, shootdowns/intercepts, military
assistance and FMS/IMET terms, Sixth Fleet and command references, Libyan
CW/Rabta language, inspection/verification or dismantlement claims,
host-nation/base access, evacuation/embassy-security, and crisis chronology.
The bundled sample is `reports/frus-military-crisis-registry.sample.json`.
For intelligence/law-enforcement checks, transfer a target-volume registry for
CIA, INR, National Intelligence Council, intelligence-source/handling,
covert/sensitive-source, counterterrorism, terrorist-incident,
hostage/hijacking, arrest-warrant, Interpol, extradition/prosecution, FBI/DEA
liaison, counternarcotics, narcoterrorism, and Department of Justice language.
The bundled sample is
`reports/frus-intelligence-law-enforcement-registry.sample.json`.
For human-rights/refugee/global-issues checks, transfer a target-volume
registry for human-rights reports, Country Reports, refugee, immigration,
asylum, migration, famine, emergency relief, food aid, PL 480, Section 416/206,
AID/USAID, PRM, HA/HR/IO, WHO/UNICEF/UNDRO/UNEP/WMO, AIDS/HIV,
population/UNFPA, environmental/ozone/CFC, whaling, sanctions, waiver,
certification, determination, public-report, international-organization, PVO,
and global-issues language. The bundled sample is
`reports/frus-human-rights-refugee-global-issues-registry.sample.json`.
For editorial-method/original-text checks, transfer a target-volume registry
for original brackets and ellipses, original footnotes, underlining, italics,
checkmarks, source-quoted spelling, capitalization, punctuation,
abbreviations, contractions, telegram numbers, and SECTO/TOSEC forms. The
bundled Bush START I/Reagan Foundations sample is
`reports/frus-editorial-method-registry.sample.json`.
For footnote refer-back checks, transfer a target-volume footnote refer-back
registry when possible; the bundled Reagan Foundations sample preserves the
three-times repeated-citation trigger and published `footnote N, Document X`,
same-document `above`, and `Document X and footnote Y thereto` forms. The
bundled sample is
`reports/frus-footnote-referback-registry.sample.json`.
For recurring compiler-risk checks, keep the bundled recurring-risk registry in
the packet unless a project-specific version supersedes it. It covers
leading-zero telegram numbers, non-State telegram copies without eRecords or
drafting checks, incomplete cross-reference slugs, missing page breaks, old
heading-footnote practice, Word autoformatting, incomplete documents or source
notes, unhighlighted quoted backup text, missing telegram headers or film/DPN
reel data, and Style Guide inconsistency. The bundled sample is
`reports/frus-recurring-risk-registry.sample.json`.
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
node scripts/build-frus-llm-review-packet.mjs --units extracted-units.json --out review-packet.md --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --source-family-registry source-family-registry.json --source-surrogate-registry source-surrogate-registry.json --document-status-lifecycle-registry document-status-lifecycle-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --editorial-method-registry editorial-method-registry.json --translation-registry translation-registry.json --printed-attachment-registry printed-attachment-registry.json --visual-material-registry visual-material-registry.json --handwritten-transcription-registry handwritten-transcription-registry.json --document-handling-registry document-handling-registry.json --chronology-registry chronology-registry.json --meeting-attendance-registry meeting-attendance-registry.json --time-zone-registry time-zone-registry.json --summit-public-event-registry summit-public-event-registry.json --selection-balance-registry selection-balance-registry.json --decision-process-registry decision-process-registry.json --public-source-registry public-source-registry.json --retrospective-account-registry retrospective-account-registry.json --treaty-registry treaty-registry.json --foreign-org-registry foreign-org-registry.json --congressional-legal-registry congressional-legal-registry.json --economic-financial-registry economic-financial-registry.json --military-crisis-registry military-crisis-registry.json --intelligence-law-enforcement-registry intelligence-law-enforcement-registry.json --human-rights-refugee-global-issues-registry human-rights-refugee-global-issues-registry.json --footnote-referback-registry footnote-referback-registry.json --recurring-risk-registry recurring-risk-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID
```

   Upload `review-packet.md` to the LLM. Send only editorial apparatus and
   needed context to the model. Do not ask the LLM to write `.docx`, OOXML,
   base64, or raw Track Changes markup. Save the model's single JSON object as
   `output.json`.

   If the closed-network LLM cannot fit the full packet, build chunk packets
   instead. Upload each `chunk-####-review-packet.md` separately and save each
   result as the corresponding `chunk-####-checker-output.json`.

```sh
node scripts/build-frus-llm-review-chunks.mjs --units extracted-units.json --out-dir review-chunks --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --status-claims status-claims.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --source-family-registry source-family-registry.json --source-surrogate-registry source-surrogate-registry.json --document-status-lifecycle-registry document-status-lifecycle-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --editorial-method-registry editorial-method-registry.json --translation-registry translation-registry.json --printed-attachment-registry printed-attachment-registry.json --visual-material-registry visual-material-registry.json --handwritten-transcription-registry handwritten-transcription-registry.json --document-handling-registry document-handling-registry.json --chronology-registry chronology-registry.json --meeting-attendance-registry meeting-attendance-registry.json --time-zone-registry time-zone-registry.json --summit-public-event-registry summit-public-event-registry.json --selection-balance-registry selection-balance-registry.json --decision-process-registry decision-process-registry.json --public-source-registry public-source-registry.json --retrospective-account-registry retrospective-account-registry.json --treaty-registry treaty-registry.json --foreign-org-registry foreign-org-registry.json --congressional-legal-registry congressional-legal-registry.json --economic-financial-registry economic-financial-registry.json --military-crisis-registry military-crisis-registry.json --intelligence-law-enforcement-registry intelligence-law-enforcement-registry.json --human-rights-refugee-global-issues-registry human-rights-refugee-global-issues-registry.json --footnote-referback-registry footnote-referback-registry.json --recurring-risk-registry recurring-risk-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --run-id RUN-ID --max-units 12
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
node scripts/run-frus-offline-review.mjs --docx input.docx --checker-output output.json --out revised.docx --artifact-dir frus-review-artifacts --run-id RUN-ID --annotation-sheet-profile reports/frus-annotation-sheet-profile.sample.json --status-registry reports/frus-status-series-1981-1992.current.json --authority-registry authority-registry.json --source-list-registry source-list-registry.json --source-family-registry source-family-registry.json --source-surrogate-registry source-surrogate-registry.json --document-status-lifecycle-registry document-status-lifecycle-registry.json --document-metadata-registry document-metadata-registry.json --classification-registry classification-registry.json --declassification-registry declassification-registry.json --editorial-method-registry editorial-method-registry.json --translation-registry translation-registry.json --printed-attachment-registry printed-attachment-registry.json --visual-material-registry visual-material-registry.json --handwritten-transcription-registry handwritten-transcription-registry.json --document-handling-registry document-handling-registry.json --chronology-registry chronology-registry.json --meeting-attendance-registry meeting-attendance-registry.json --time-zone-registry time-zone-registry.json --summit-public-event-registry summit-public-event-registry.json --selection-balance-registry selection-balance-registry.json --decision-process-registry decision-process-registry.json --public-source-registry public-source-registry.json --retrospective-account-registry retrospective-account-registry.json --treaty-registry treaty-registry.json --foreign-org-registry foreign-org-registry.json --congressional-legal-registry congressional-legal-registry.json --economic-financial-registry economic-financial-registry.json --military-crisis-registry military-crisis-registry.json --intelligence-law-enforcement-registry intelligence-law-enforcement-registry.json --human-rights-refugee-global-issues-registry human-rights-refugee-global-issues-registry.json --footnote-referback-registry footnote-referback-registry.json --recurring-risk-registry recurring-risk-registry.json --negative-search-registry negative-search-registry.json --document-relationship-registry document-relationship-registry.json --communications-registry communications-registry.json --preparation-router reports/frus-preparation-router-1981-1992.current.json --permutation-matrix reports/frus-annotation-permutation-matrix.json --target-volume VOLUME-ID --today YYYY-MM-DD
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

9a. Run source-family validation and usage audit when source notes or front
   matter mention PROFS, W Files, System IV, H-Files, Central Foreign Policy
   File D/P/N/P reels, lot files, presidential-library collections, or public
   source families. Direct edits require target-volume registry support; do not
   flatten a specific source family into a generic repository path.

```sh
node scripts/validate-frus-source-family-registry.mjs --registry source-family-registry.json --format text
node scripts/audit-frus-source-family-usage.mjs --units extracted-units.json --registry source-family-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

10. Run source-surrogate/release validation and usage audit when notes or front
   matter mention RAC, NLR, no N number, FOIA/MDR, NARA catalog, PDFs, scans,
   URLs, W Files, PROFS, eRecords, internet availability, transfer-to-NARA, or
   candidate/needs-scan locators. Direct edits require target-volume registry
   support. Do not infer repository path, source family, classification,
   attachment status, physical completeness, or source-image content from a
   surrogate locator alone.

```sh
node scripts/validate-frus-source-surrogate-registry.mjs --registry source-surrogate-registry.json --format text
node scripts/audit-frus-source-surrogate-usage.mjs --units extracted-units.json --registry source-surrogate-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

11. Run document-status/lifecycle validation and usage audit when source notes or
   annotations mention prepared-by, drafted-by, cleared-by, copied-to,
   sent-for-action, sent-through, stamped/read/signed, copy/version,
   draft/prior-version, no-minutes/no-record, missing-page, or incomplete-copy
   language. The usage audit fails if the model proposes a direct lifecycle
   edit that is only compiler shorthand, a cross-volume pattern, or unsupported
   by the supplied document-status lifecycle registry.

```sh
node scripts/validate-frus-document-status-lifecycle-registry.mjs --registry document-status-lifecycle-registry.json --format text
node scripts/audit-frus-document-status-lifecycle-usage.mjs --units extracted-units.json --registry document-status-lifecycle-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

12. Run document-metadata validation and usage audit when document headings,
   date/place lines, subject/title lines, attachment headings, editorial notes,
   sender/recipient lines, or document numbers appear. The usage audit fails if
   the model proposes a direct metadata edit that is only a shorthand variant,
   cross-volume heading, or unsupported by the supplied document-page registry.

```sh
node scripts/validate-frus-document-metadata-registry.mjs --registry document-metadata-registry.json --format text
node scripts/audit-frus-document-metadata-usage.mjs --units extracted-units.json --registry document-metadata-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

13. Run classification/handling validation and usage audit when source notes,
   attachment notes, or classification/declassification notes contain original
   markings, handling controls, or `No classification marking` language. The
   usage audit fails if the model proposes a direct classification edit that is
   only a variant, cross-volume marking, release-status statement, or
   unsupported by the supplied classification registry.

```sh
node scripts/validate-frus-classification-registry.mjs --registry classification-registry.json --format text
node scripts/audit-frus-classification-usage.mjs --units extracted-units.json --registry classification-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

14. Run declassification/omission validation and usage audit when document text,
   source notes, attachment notes, or About the Series/front matter contain
   bracketed omissions, pages not declassified, handling restrictions not
   declassified, whole-document withholding entries, or review statistics. The
   usage audit fails if the model proposes a direct omission or withholding edit
   unsupported by the supplied declassification registry.

```sh
node scripts/validate-frus-declassification-registry.mjs --registry declassification-registry.json --format text
node scripts/audit-frus-declassification-usage.mjs --units extracted-units.json --registry declassification-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

15. Run editorial-method/original-text validation and usage audit when source
   notes, follow-on footnotes, editorial notes, attachments, quoted document
   text, or transcribed document text mention original brackets, ellipses,
   original footnotes, underlining, italics, checkmarks, source-quoted
   spelling, capitalization, punctuation, abbreviations, contractions, telegram
   numbers, or SECTO/TOSEC forms. Treat spellcheck-style edits to original
   document text as comment-only unless the source image, official transcript,
   or target-volume editorial-method registry proves the exact change.

```sh
node scripts/validate-frus-editorial-method-registry.mjs --registry editorial-method-registry.json --format text
node scripts/audit-frus-editorial-method-usage.mjs --units extracted-units.json --registry editorial-method-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

16. Run translation/foreign-origin validation and usage audit when source notes,
   headings, attachment notes, or follow-on footnotes contain official,
   unofficial, informal, Language Services, editor-transcribed,
   original-language, foreign-copy, or foreign-text-in-file apparatus. The
   usage audit fails if the model proposes a direct translation-status or
   foreign-origin edit unsupported by the supplied translation registry.

```sh
node scripts/validate-frus-translation-registry.mjs --registry translation-registry.json --format text
node scripts/audit-frus-translation-usage.mjs --units extracted-units.json --registry translation-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

17. Run printed/nested attachment validation and usage audit when source notes,
   headings, follow-on footnotes, editorial notes, or attachment notes contain
   printed-in-parent child papers, attached-but-not-printed details,
   printed-as-document targets, tab/enclosure labels, child headings, child
   source notes, child classifications, or parent-child maps. The usage audit
   fails if the model proposes a direct printed-attachment edit unsupported by
   the supplied printed attachment registry.

```sh
node scripts/validate-frus-printed-attachment-registry.mjs --registry printed-attachment-registry.json --format text
node scripts/audit-frus-printed-attachment-usage.mjs --units extracted-units.json --registry printed-attachment-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

18. Run visual-material validation and usage audit when source notes, follow-on
   footnotes, editorial notes, captions, appendix links, or document text contain
   maps, photographs, charts, images, graphic attachments, appendix images,
   captions/titles, not-found or not-attached visual items, source-image links,
   printed targets, visual descriptions, or person/object/place identification.
   The usage audit fails if the model proposes a direct visual-material edit
   unsupported by the supplied visual material registry.

```sh
node scripts/validate-frus-visual-material-registry.mjs --registry visual-material-registry.json --format text
node scripts/audit-frus-visual-material-usage.mjs --units extracted-units.json --registry visual-material-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

19. Run handwritten/facsimile transcription validation and usage audit when
   source notes, follow-on footnotes, editorial notes, captions, appendix links,
   or document text contain handwritten notes or letters, editor-transcribed
   portions, original brackets or ellipses, unclear or illegible readings,
   cut-off lines, appendix/facsimile images, marginalia or transcribed margin
   notes, source-image basis, or reverse appendix targets. Treat transcription
   status, original-bracket or ellipsis claims, uncertain readings, image or
   appendix target, cut-off or missing-text claims, and marginalia wording as
   unsafe for direct edit unless the supplied target-volume registry proves the
   exact form.

```sh
node scripts/validate-frus-handwritten-transcription-registry.mjs --registry handwritten-transcription-registry.json --format text
node scripts/audit-frus-handwritten-transcription-usage.mjs --units extracted-units.json --registry handwritten-transcription-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

20. Run document-handling/marginalia validation and usage audit when source
   notes, follow-on footnotes, editorial notes, or attachment notes contain
   initials, handwritten notes, marginalia, underlining, checkmarks, stamped
   notations, read-by/seen language, sent-for-action or sent-for-information
   routing, copy status, bracket/original-status phrases, approval/disapproval,
   unknown-hand marks, or signed status. The usage audit fails if the model
   proposes a direct document-handling edit unsupported by the supplied document
   handling registry.

```sh
node scripts/validate-frus-document-handling-registry.mjs --registry document-handling-registry.json --format text
node scripts/audit-frus-document-handling-usage.mjs --units extracted-units.json --registry document-handling-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

21. Run chronology/time validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, or attachment notes contain
   President's Daily Diary entries, meeting or call times, place and attendance,
   actual-versus-planned meeting times, diary/schedule absences,
   no-precise-time caveats, or event-sequence facts. The usage audit fails if
   the model proposes a direct chronology edit unsupported by the supplied
   chronology registry.

```sh
node scripts/validate-frus-chronology-registry.mjs --registry chronology-registry.json --format text
node scripts/audit-frus-chronology-usage.mjs --units extracted-units.json --registry chronology-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

22. Run meeting attendance/participant-list validation and usage audit when
   source notes, follow-on footnotes, editorial notes, headings, or attachment
   notes contain President's Daily Diary attendance, NSC meeting attendance,
   `also attended` language, partial attendance, participant lists,
   not-attached or attached-but-not-printed participant-list status, or
   no-minutes/no-memcon caveats. Treat attendee names, partial attendance
   windows, participant-list status, and no-record caveats as unsafe for direct
   edit unless the supplied target-volume registry proves the exact form.

```sh
node scripts/validate-frus-meeting-attendance-registry.mjs --registry meeting-attendance-registry.json --format text
node scripts/audit-frus-meeting-attendance-usage.mjs --units extracted-units.json --registry meeting-attendance-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

23. Run time-zone/date-time-group validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, treaty text, or attachment
   notes contain Washington-time rules, local-time labels, GMT/Z/Zulu date-time
   groups, EST/EDT labels, no-precise-time caveats, deadlines, treaty timing
   rules, conversions, or chronological placement. The usage audit fails if the
   model proposes a direct time-label, conversion, or date-time-group edit
   unsupported by the supplied time-zone registry.

```sh
node scripts/validate-frus-time-zone-registry.mjs --registry time-zone-registry.json --format text
node scripts/audit-frus-time-zone-usage.mjs --units extracted-units.json --registry time-zone-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

24. Run summit/public-event validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, or public-source notes
   contain summit travel, signing ceremonies, public remarks, public addresses,
   news conferences, interviews, United Nations addresses, toasts,
   arrival/departure events, diary/schedule basis, press basis, event sequence,
   participants, place, date/time, public-source basis, or full-record
   elsewhere targets. Treat event date, time, place, sequence, participant,
   public-source basis, press basis, diary/schedule basis, time-zone
   relationship, and full-record target as unsafe for direct edit unless the
   supplied target-volume registry proves the exact form.

```sh
node scripts/validate-frus-summit-public-event-registry.mjs --registry summit-public-event-registry.json --format text
node scripts/audit-frus-summit-public-event-usage.mjs --units extracted-units.json --registry summit-public-event-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

25. Run selection-balance/completeness validation and usage audit when source
   notes, follow-on footnotes, editorial notes, headings, front matter, or
   selection comments contain principles of selection, chapter or volume scope,
   excerpted portions, omitted non-scope material, complete-record-elsewhere
   notes, related-volume boundaries, withheld-document effects, known gaps, or
   claims that the selected documentation is complete, balanced,
   representative, or exhaustive. The usage audit fails if the model proposes a
   direct selection-balance edit unsupported by the supplied registry.

```sh
node scripts/validate-frus-selection-balance-registry.mjs --registry selection-balance-registry.json --format text
node scripts/audit-frus-selection-balance-usage.mjs --units extracted-units.json --registry selection-balance-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

26. Run decision-process/directive validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, tabs, or front matter contain
   NSR, NSD, NSDD, NSSD, NSC/DC, PCC, Deputies or Principals Committee, NSC
   meeting, tab, tasking, interagency paper, directive heading, draft
   directive, record-of-decision, scheduled-publication boundary, or
   decision-stage language. The usage audit fails if the model proposes a
   direct directive number, committee/body, tab, recommendation/action status,
   or decision-stage edit unsupported by the supplied decision-process registry.

```sh
node scripts/validate-frus-decision-process-registry.mjs --registry decision-process-registry.json --format text
node scripts/audit-frus-decision-process-usage.mjs --units extracted-units.json --registry decision-process-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

27. Run public-source/public-diplomacy validation and usage audit when source
   notes, follow-on footnotes, editorial notes, headings, or front-matter
   entries contain speeches, public remarks, press releases, press conferences,
   briefings, interviews, broadcasts, testimony, Public Papers, Department of
   State Bulletin/Dispatch, Congressional Record, official transcripts,
   newspaper excerpts, full-text targets, archival speech or briefing-file
   context, diary context, or selected-versus-supplemental public-source
   status. The usage audit fails if the model proposes a direct public-source
   edit unsupported by the supplied public-source registry.

```sh
node scripts/validate-frus-public-source-registry.mjs --registry public-source-registry.json --format text
node scripts/audit-frus-public-source-usage.mjs --units extracted-units.json --registry public-source-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

28. Run retrospective-account validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, or front-matter entries
   contain memoirs, published or personal diaries, oral histories, later
   interviews, recollections, press retrospectives, newspaper accounts,
   author/source, publication title, page locator, event match, selected-versus-
   supplemental status, official-record relationship, corroborating record, or
   conflict status. The usage audit fails if the model proposes a direct
   retrospective-account edit unsupported by the supplied registry.

```sh
node scripts/validate-frus-retrospective-account-registry.mjs --registry retrospective-account-registry.json --format text
node scripts/audit-frus-retrospective-account-usage.mjs --units extracted-units.json --registry retrospective-account-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

29. Run treaty/legal-instrument validation and usage audit when source notes,
   follow-on footnotes, editorial notes, headings, or front-matter entries
   contain treaty text, protocols, annexes, memoranda of understanding,
   associated but non-integral documents, Senate transmittal packages, Treaty
   Doc. references, ratification, entry-into-force, legal authority, or draft
   treaty-package language. The usage audit fails if the model proposes a
   direct treaty edit unsupported by the supplied treaty registry.

```sh
node scripts/validate-frus-treaty-registry.mjs --registry treaty-registry.json --format text
node scripts/audit-frus-treaty-usage.mjs --units extracted-units.json --registry treaty-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

30. Run foreign/international-organization validation and usage audit when
   source notes, follow-on footnotes, editorial notes, headings, or front-matter
   entries mention country names, successor states, alliances, international
   organizations, regional bodies, summit/conference names, international
   financial institutions, trade regimes, UN resolution forms, political
   parties, or treaty-party status. The usage audit fails if the model proposes
   a direct entity-identity edit unsupported by the supplied foreign-org
   registry.

```sh
node scripts/validate-frus-foreign-org-registry.mjs --registry foreign-org-registry.json --format text
node scripts/audit-frus-foreign-org-usage.mjs --units extracted-units.json --registry foreign-org-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

31. Run congressional/legal authority validation and usage audit when source
   notes, follow-on footnotes, editorial notes, attachment notes, or document
   headings contain Senate advice-and-consent, congressional hearing,
   public-law, Stat., appropriation, authorization, budget authority,
   Presidential Determination, Arms Export Control Act, Federal Register,
   congressional notice, or treaty-transmittal language. Treat direct edits to
   committee names, hearing titles, public-law numbers, legal stages, budget
   figures, advice-and-consent status, and publication-stage claims as unsafe
   unless the supplied target-volume registry proves the exact form.

```sh
node scripts/validate-frus-congressional-legal-registry.mjs --registry congressional-legal-registry.json --format text
node scripts/audit-frus-congressional-legal-usage.mjs --units extracted-units.json --registry congressional-legal-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

32. Run economic/financial validation and usage audit when source notes,
   follow-on footnotes, editorial notes, attachment notes, source-list entries,
   or front matter contain dollar amounts, percentages, debt metrics, IMF quota
   or resource language, GAB, World Bank, MDB, Paris Club, Baker Plan,
   Eximbank, OPIC, ESF, AID, arrears, loans, grants, budget, trade-finance,
   exchange-rate, commodity-policy, or foreign economic policy scope language.
   Treat direct edits to figures, institution names, program labels,
   debt-relief mechanics, and financial-policy labels as unsafe unless the
   supplied target-volume registry proves the exact form.

```sh
node scripts/validate-frus-economic-financial-registry.mjs --registry economic-financial-registry.json --format text
node scripts/audit-frus-economic-financial-usage.mjs --units extracted-units.json --registry economic-financial-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

33. Run military/crisis validation and usage audit when annotation sheets
   contain operation names, force presence, Gulf of Sidra/Bay of Sidra or
   Persian Gulf freedom-of-navigation claims, naval incidents,
   shootdowns/intercepts, military assistance or FMS/IMET references, Sixth
   Fleet or command references, Libyan CW/Rabta language, inspections,
   verification, dismantlement, host-nation/base access, evacuation,
   embassy-security, or crisis chronology. Treat direct edits to operation
   labels, aircraft or force identities, deployment claims, CW capability
   language, ROE, and legal/notification posture as unsafe unless the supplied
   target-volume registry proves the exact form.

```sh
node scripts/validate-frus-military-crisis-registry.mjs --registry military-crisis-registry.json --format text
node scripts/audit-frus-military-crisis-usage.mjs --units extracted-units.json --registry military-crisis-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

34. Run intelligence/law-enforcement validation and usage audit when annotation
   sheets contain CIA, INR, National Intelligence Council, intelligence-source
   or handling language, covert or sensitive-source posture, counterterrorism,
   terrorist incidents, hostages or hijackings, arrest warrants, Interpol,
   extradition, prosecution, FBI/DEA liaison, Department of Justice, or
   counternarcotics/narcoterrorism language. Treat agency identity,
   intelligence basis, sensitive-source posture, case status, jurisdiction,
   prosecution/extradition posture, and counternarcotics claims as unsafe for
   direct edit unless the supplied target-volume registry proves the exact
   form.

```sh
node scripts/validate-frus-intelligence-law-enforcement-registry.mjs --registry intelligence-law-enforcement-registry.json --format text
node scripts/audit-frus-intelligence-law-enforcement-usage.mjs --units extracted-units.json --registry intelligence-law-enforcement-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

35. Run human-rights/refugee/global-issues validation and usage audit when
   annotation sheets contain human-rights reports, Country Reports, refugee,
   immigration, asylum, migration, famine, emergency relief, food aid, PL 480,
   Section 416/206, AID/USAID, PRM, HA/HR/IO, WHO/UNICEF/UNDRO/UNEP/WMO,
   AIDS/HIV, population/UNFPA, environmental/ozone/CFC, whaling, sanctions,
   waiver, certification, determination, public-report,
   international-organization, PVO, or global-issues language. Treat report
   basis, country/population scope, relief stage, legal/program authority,
   amount/metric, public/archival basis, international-organization role, PVO
   role, sanctions/waiver status, and environmental/treaty status as unsafe for
   direct edit unless the supplied target-volume registry proves the exact
   form.

```sh
node scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs --registry human-rights-refugee-global-issues-registry.json --format text
node scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs --units extracted-units.json --registry human-rights-refugee-global-issues-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

36. Run footnote refer-back validation and usage audit when follow-on footnotes
   or editorial notes contain repeated citations, `see footnote`, `Document X
   and footnote Y thereto`, same-document above/below references, or clusters
   of multiple footnote/document targets. Reagan Foundations also models plural
   `See footnotes 12 and 13, Document 53` and mixed `See footnote 8, Document
   65 and Document 66` forms, so do not flatten those into a single-document
   or bare-Document reference. The Reagan Foundations three-times
   rule should be treated as a repeated-citation review trigger: when the same
   full citation appears for a third time, whether parenthetical or plain
   source-note text, confirm whether a refer-back should replace the repeated
   citation. The first and second full citation occurrences may stand; the
   third full citation occurrence itself and every later full citation
   occurrence require comment-only target confirmation unless the supplied
   registry proves the direct edit. Do not wait for a fourth occurrence. Match
   Public Papers citations with and without Book markers, since Reagan
   Foundations uses both `Public Papers: Reagan, 1983, Book I, pp. 479-484`
   and `Public Papers: Reagan, 1981, p. 1156` forms. The usage audit fails if
   the model proposes a direct refer-back edit or repeated-citation replacement
   unsupported by the supplied registry.

```sh
node scripts/validate-frus-footnote-referback-registry.mjs --registry footnote-referback-registry.json --format text
node scripts/audit-frus-footnote-referback-usage.mjs --units extracted-units.json --registry footnote-referback-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

37. Run recurring compiler-risk validation and usage audit on every annotation
   sheet when the registry is available. It checks leading-zero telegram
   numbers, WHSR/NSC telegram copies that need eRecords/drafting confirmation,
   incomplete cross-reference slugs, missing page breaks, old heading-footnote
   placement, Word autoformatting, incomplete documents or source notes,
   unhighlighted quoted backup text, missing telegram headers or film/DPN reel
   data, and Style Guide inconsistency.

```sh
node scripts/validate-frus-recurring-risk-registry.mjs --registry recurring-risk-registry.json --format text
node scripts/audit-frus-recurring-risk-usage.mjs --units extracted-units.json --registry recurring-risk-registry.json --checker-output output.json --format text
```

38. Run negative-search/no-record validation and usage audit when source notes,
   follow-on footnotes, editorial notes, or attachment notes contain
   no-minutes, not-found, not-attached, not-found-attached, no-memcon,
   no-telcon, unlocated-draft, or missing-attachment language. The usage audit
   fails if the model proposes a direct no-record edit that collapses one
   relationship into another without supplied registry support.

```sh
node scripts/validate-frus-negative-search-registry.mjs --registry negative-search-registry.json --format text
node scripts/audit-frus-negative-search-usage.mjs --units extracted-units.json --registry negative-search-registry.json --checker-output output.json --target-volume VOLUME-ID --format text
```

39. Run document-relationship validation and usage audit when source notes,
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

40. Run communications validation and usage audit when source notes, follow-on
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

41. Run source-note and production-marker checks when those unit types are
   present:

```sh
node scripts/lint-frus-source-notes.mjs --units extracted-units.json --checker-output output.json
node scripts/preflight-frus-pseudo-markers.mjs --units extracted-units.json --output output.json
```

42. Build the separate evidence queue and General Editor discrepancy ledger:

```sh
node scripts/build-frus-evidence-queue.mjs --output output.json --review-mode normal > evidence-queue.json
node scripts/build-frus-discrepancy-ledger.mjs --output output.json --existing prior-ledger.json --run-id RUN-ID > discrepancy-ledger.json
```

43. Apply safe `comment_only` findings as real Word comments, then apply only
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
44. Reopen and validate the revised `.docx`. Do not release the file if XML,
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
node scripts/validate-frus-source-family-registry.mjs --registry reports/frus-source-family-registry.sample.json --format text
node scripts/audit-frus-source-family-usage.mjs --units reports/frus-source-family-units.sample.json --registry reports/frus-source-family-registry.sample.json --target-volume frus1981-88v44p1 --format text
node scripts/test-frus-source-family-audit.mjs
node scripts/validate-frus-source-surrogate-registry.mjs --registry reports/frus-source-surrogate-registry.sample.json --format text
node scripts/audit-frus-source-surrogate-usage.mjs --units reports/frus-source-surrogate-units.sample.json --registry reports/frus-source-surrogate-registry.sample.json --target-volume frus1981-88v01 --format text
node scripts/test-frus-source-surrogate-audit.mjs
node scripts/validate-frus-document-status-lifecycle-registry.mjs --registry reports/frus-document-status-lifecycle-registry.sample.json --format text
node scripts/audit-frus-document-status-lifecycle-usage.mjs --units reports/frus-document-status-lifecycle-units.sample.json --registry reports/frus-document-status-lifecycle-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-document-status-lifecycle-audit.mjs
node scripts/validate-frus-document-metadata-registry.mjs --registry reports/frus-document-metadata-registry.sample.json --format text
node scripts/audit-frus-document-metadata-usage.mjs --units reports/frus-document-metadata-units.sample.json --registry reports/frus-document-metadata-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-document-metadata-audit.mjs
node scripts/validate-frus-classification-registry.mjs --registry reports/frus-classification-registry.sample.json --format text
node scripts/audit-frus-classification-usage.mjs --units reports/frus-classification-units.sample.json --registry reports/frus-classification-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-classification-audit.mjs
node scripts/validate-frus-declassification-registry.mjs --registry reports/frus-declassification-registry.sample.json --format text
node scripts/audit-frus-declassification-usage.mjs --units reports/frus-declassification-units.sample.json --registry reports/frus-declassification-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-declassification-audit.mjs
node scripts/validate-frus-editorial-method-registry.mjs --registry reports/frus-editorial-method-registry.sample.json --format text
node scripts/audit-frus-editorial-method-usage.mjs --units reports/frus-editorial-method-units.sample.json --registry reports/frus-editorial-method-registry.sample.json --target-volume frus1981-88v01 --format text
node scripts/test-frus-editorial-method-audit.mjs
node scripts/validate-frus-translation-registry.mjs --registry reports/frus-translation-registry.sample.json --format text
node scripts/audit-frus-translation-usage.mjs --units reports/frus-translation-units.sample.json --registry reports/frus-translation-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-translation-audit.mjs
node scripts/validate-frus-printed-attachment-registry.mjs --registry reports/frus-printed-attachment-registry.sample.json --format text
node scripts/audit-frus-printed-attachment-usage.mjs --units reports/frus-printed-attachment-units.sample.json --registry reports/frus-printed-attachment-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-printed-attachment-audit.mjs
node scripts/validate-frus-visual-material-registry.mjs --registry reports/frus-visual-material-registry.sample.json --format text
node scripts/audit-frus-visual-material-usage.mjs --units reports/frus-visual-material-units.sample.json --registry reports/frus-visual-material-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-visual-material-audit.mjs
node scripts/validate-frus-handwritten-transcription-registry.mjs --registry reports/frus-handwritten-transcription-registry.sample.json --format text
node scripts/audit-frus-handwritten-transcription-usage.mjs --units reports/frus-handwritten-transcription-units.sample.json --registry reports/frus-handwritten-transcription-registry.sample.json --target-volume frus1981-88v11 --format text
node scripts/test-frus-handwritten-transcription-audit.mjs
node scripts/validate-frus-document-handling-registry.mjs --registry reports/frus-document-handling-registry.sample.json --format text
node scripts/audit-frus-document-handling-usage.mjs --units reports/frus-document-handling-units.sample.json --registry reports/frus-document-handling-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-document-handling-audit.mjs
node scripts/validate-frus-chronology-registry.mjs --registry reports/frus-chronology-registry.sample.json --format text
node scripts/audit-frus-chronology-usage.mjs --units reports/frus-chronology-units.sample.json --registry reports/frus-chronology-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-chronology-audit.mjs
node scripts/validate-frus-meeting-attendance-registry.mjs --registry reports/frus-meeting-attendance-registry.sample.json --format text
node scripts/audit-frus-meeting-attendance-usage.mjs --units reports/frus-meeting-attendance-units.sample.json --registry reports/frus-meeting-attendance-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-meeting-attendance-audit.mjs
node scripts/validate-frus-time-zone-registry.mjs --registry reports/frus-time-zone-registry.sample.json --format text
node scripts/audit-frus-time-zone-usage.mjs --units reports/frus-time-zone-units.sample.json --registry reports/frus-time-zone-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-time-zone-audit.mjs
node scripts/validate-frus-summit-public-event-registry.mjs --registry reports/frus-summit-public-event-registry.sample.json --format text
node scripts/audit-frus-summit-public-event-usage.mjs --units reports/frus-summit-public-event-units.sample.json --registry reports/frus-summit-public-event-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-summit-public-event-audit.mjs
node scripts/validate-frus-selection-balance-registry.mjs --registry reports/frus-selection-balance-registry.sample.json --format text
node scripts/audit-frus-selection-balance-usage.mjs --units reports/frus-selection-balance-units.sample.json --registry reports/frus-selection-balance-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-selection-balance-audit.mjs
node scripts/validate-frus-decision-process-registry.mjs --registry reports/frus-decision-process-registry.sample.json --format text
node scripts/audit-frus-decision-process-usage.mjs --units reports/frus-decision-process-units.sample.json --registry reports/frus-decision-process-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-decision-process-audit.mjs
node scripts/validate-frus-public-source-registry.mjs --registry reports/frus-public-source-registry.sample.json --format text
node scripts/audit-frus-public-source-usage.mjs --units reports/frus-public-source-units.sample.json --registry reports/frus-public-source-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-public-source-audit.mjs
node scripts/validate-frus-treaty-registry.mjs --registry reports/frus-treaty-registry.sample.json --format text
node scripts/audit-frus-treaty-usage.mjs --units reports/frus-treaty-units.sample.json --registry reports/frus-treaty-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-treaty-audit.mjs
node scripts/validate-frus-foreign-org-registry.mjs --registry reports/frus-foreign-org-registry.sample.json --format text
node scripts/audit-frus-foreign-org-usage.mjs --units reports/frus-foreign-org-units.sample.json --registry reports/frus-foreign-org-registry.sample.json --target-volume frus1989-92v31 --format text
node scripts/test-frus-foreign-org-audit.mjs
node scripts/validate-frus-military-crisis-registry.mjs --registry reports/frus-military-crisis-registry.sample.json --format text
node scripts/audit-frus-military-crisis-usage.mjs --units reports/frus-military-crisis-units.sample.json --registry reports/frus-military-crisis-registry.sample.json --target-volume frus1981-88v24 --format text
node scripts/test-frus-military-crisis-audit.mjs
node scripts/validate-frus-intelligence-law-enforcement-registry.mjs --registry reports/frus-intelligence-law-enforcement-registry.sample.json --format text
node scripts/audit-frus-intelligence-law-enforcement-usage.mjs --units reports/frus-intelligence-law-enforcement-units.sample.json --registry reports/frus-intelligence-law-enforcement-registry.sample.json --target-volume frus1981-88v24 --format text
node scripts/test-frus-intelligence-law-enforcement-audit.mjs
node scripts/validate-frus-human-rights-refugee-global-issues-registry.mjs --registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --format text
node scripts/audit-frus-human-rights-refugee-global-issues-usage.mjs --units reports/frus-human-rights-refugee-global-issues-units.sample.json --registry reports/frus-human-rights-refugee-global-issues-registry.sample.json --target-volume frus1981-88v41 --format text
node scripts/test-frus-human-rights-refugee-global-issues-audit.mjs
node scripts/validate-frus-footnote-referback-registry.mjs --registry reports/frus-footnote-referback-registry.sample.json --format text
node scripts/audit-frus-footnote-referback-usage.mjs --units reports/frus-footnote-referback-units.sample.json --registry reports/frus-footnote-referback-registry.sample.json --target-volume frus1981-88v01 --format text
node scripts/test-frus-footnote-referback-audit.mjs
node scripts/validate-frus-recurring-risk-registry.mjs --registry reports/frus-recurring-risk-registry.sample.json --format text
node scripts/audit-frus-recurring-risk-usage.mjs --units reports/frus-recurring-risk-units.sample.json --registry reports/frus-recurring-risk-registry.sample.json --format text
node scripts/test-frus-recurring-risk-audit.mjs
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
node scripts/test-frus-source-note-lint.mjs
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
