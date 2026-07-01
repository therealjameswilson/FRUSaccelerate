# FRUS Annotation Sheet Builder v1 - StateChat-c / ChatGPT 5.4 Launch Handoff

Generated: 2026-06-30

## Primary Upload File

- `FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md`

Upload this Markdown file to the standalone StateChat-c / ChatGPT 5.4 system as the agent instruction/context file for creating draft FRUS annotation sheets from PDF documents.

## Operator Script

- `FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Operator_Script_2026-06-30.txt`

Use this text file as the runbook for the closed-network operator. It includes model settings, upload order, drag-and-drop PDF prompts, batch mode, OCR triage, source-note-only mode, DOCX review-copy mode, post-run handling, and troubleshooting.

## Recent Published FRUS Reference

- `FRUS_Annotation_Sheet_Builder_v1_Recent_Published_FRUS_Lessons_2026-06-30.md`
- `FRUS_Annotation_Sheet_Builder_v1_PDF_Archetype_Stress_Tests_2026-07-01.md`

These optional references summarize the recent history.state.gov corpus lessons and local PDF stress tests embedded in the agent file: source-family preservation, common PDF archetypes, controlled annotation formulas, action-memo/tab packets, directive/decision packages, negotiating-instructions/draft-telegram package handling, congressional testimony/hearing/legal public-source handling, selected public speech/media handling, airgram/despatch handling, non-paper/informal-paper handling, Situation Room/watch-center product handling, law-enforcement/counterterrorism case handling, economic/financial/foreign-assistance budget handling, foreign-government/international-organization handling, visual-material/source-image handling, release/declassification/source-image packet handling, withheld-in-full/pages-not-declassified selected-document handling, excerpted/omitted-body selected-document handling, RAC/NLR/FOIA/MDR identifier handling, government-copy variant handling, correspondence/presidential-message handling, briefing/information/talking-points handling, interview/transcript/Q&A handling, shorthand meeting-notes handling, night-note/evening-report handling, formal NSC/NSPG/interagency meeting-minutes handling, Record of Decision/Summary of Conclusions handling, Presidential Finding/MON/covert-action authorization handling, PROFS/electronic-message handling, printed-attachment/enclosure handling, intelligence/estimative records, memcons/telcons and meeting records, Daily Diary/schedule support evidence, telegram/cable metadata, treaty/transmittal packages, translation/foreign-language source handling, technical tables/charts, source-register triage, public-source PDFs, editorial-note/apparatus-only PDFs, appendix/facsimile and handwritten-source handling, editorial-note limits, and date-basis separation.

## Recommended StateChat-c Setup

- Model: `gpt-5.4`
- Reasoning effort: `medium` for one clean PDF; `high` for batches, poor scans, attachments, source-note uncertainty, declassification questions, or DOCX output.
- Output: JSON-first. Use strict structured output if StateChat-c supports it.
- Temperature: low or deterministic, if configurable.
- Review posture: draft only from uploaded evidence; mark missing source provenance and archive path as evidence requests.

## Drag-And-Drop Workflow

1. Upload `FRUS_Annotation_Sheet_Builder_v1_StateChat_C_ChatGPT_5_4_Agent_2026-06-30.md`.
2. Add a short operator note with target volume/chapter if known.
3. Upload the recent-published lessons or PDF archetype stress-test reference if the operator wants the evidence summary visible in context; the key lessons are already embedded in the agent file.
4. Upload style guide, source list, manuscript spreadsheet, source register, or compiler instruction if available.
5. Drag and drop the PDF document or PDF batch into the context window.
6. Paste the standard run prompt from the operator script.
7. Save the JSON and copy-ready annotation-sheet draft together.

## Basic Operator Prompt

```text
Run FRUS Annotation Sheet Builder v1 on the uploaded PDF document inside StateChat-c with ChatGPT 5.4. Treat the PDF as a document a compiler wants to print in a FRUS volume. Inventory the file, identify extraction quality, extract visible metadata, distinguish document text from cover sheets and attachments, and produce a first-pass FRUS annotation sheet. Return JSON first using the v1 schema, then a copy-ready annotation-sheet draft. Do not invent source provenance, archive path, document number, cross-reference target, classification, declassification status, attachment treatment, participant list, drafting/clearance chain, or historical context not proved by uploaded evidence.
```

## Notes

- The builder is designed for drag-and-drop PDF intake on the standalone network.
- It produces drafts, not final publication-ready annotation sheets.
- Missing source provenance should stay visible as `[source provenance needed]`.
- Final manuscript numbers should come from compiler instruction or the FRUS Manuscript Document Numberer.
- The generated sheet should be run through FRUS Annotation Checker before final editorial use.
