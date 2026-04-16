# FRUS AI Opportunity Report

Generated on 2026-04-16T20:27:47.826Z. This report analyzes 3,611 use cases from the 2025 Federal Agency AI Use Case Inventory against the Foreign Relations of the United States (FRUS) production workflow.

## Executive Takeaways

- FRUS's largest current bottleneck is clearance and declassification, not web publishing.
- The strongest reusable federal patterns are semantic archival search, metadata enrichment, summarization/drafting support, and FOIA-style redaction triage.
- NARA appears throughout the top matches because its archival and records-access mission is the closest analog to FRUS.
- HistoryAtState already has strong digital foundations: TEI source files, canonical document identifiers, CI-generated table-of-contents artifacts, and chapter-based release experiments.

## FRUS Findings

- FRUS has four published production stages. History.state.gov describes the current FRUS flow as Planning, Research, Clearance, and Publication, with research explicitly covering archival research, selection, annotation, and review. Source: https://history.state.gov/historicaldocuments/status-of-the-series
- Clearance is the biggest current bottleneck. The 2025 Report to Congress says declassification remains the single greatest obstacle to meeting the 30-year publication requirement; 46 volumes were in declassification review and 25 had been there for at least five years. Source: https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf
- FRUS is already moving toward incremental digital release. The 2025 report highlights a chapter-by-chapter publication approach so one uncleared chapter does not delay an entire volume, and the March 2025 HAC minutes note the first born-digital indexes across six volumes. Source: https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf
- HistoryAtState uses TEI, eXist-db, and XQuery as its digital publishing stack. The developer resources page states that article- and book-length content is encoded as TEI, stored in eXist-db, and converted into HTML and ebook forms with XQuery. Source: https://history.state.gov/developer
- The FRUS GitHub repo exposes canonical TEI sources and CI-generated publication artifacts. The FRUS repository explains that one TEI XML file represents a volume, document ids are canonical once released, tables of contents are generated automatically in CI, and releases are posted as soon as they are posted to history.state.gov. Source: https://github.com/HistoryAtState/frus
- HistoryAtState runs a multi-repo build and deployment workflow. The hsg-project README describes history.state.gov as a multi-repository project built into eXist packages, while hsg-shell documents Node, Ant, Cypress, and automated release practices for the public website. Source: https://github.com/HistoryAtState/hsg-project

## Inventory Snapshot

- Total use cases analyzed: 3,611
- Top development stages: Pre-deployment (1479), Deployed (1040), Pilot (440), Unspecified (338), Retired (314)
- Top AI classifications: Classical ML (1114), Generative AI (858), Unspecified (662), NLP (454), Computer Vision (292)
- Top FRUS-relevant agencies in this analysis: Department of Homeland Security (15), National Archives and Records Administration (14), Department of Justice (11), Department of the Interior (8), Department of the Treasury (6)

## Best-Fit Use Cases Overall

| Rank | Agency | ID | Use Case | Stage Fit | Why It Matters |
| --- | --- | --- | --- | --- | --- |
| 1 | National Archives and Records Administration | NARA - 0005 | AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records | Research, Clearance, Planning, Publication | The AI is intended to solve the problem of manual processing bottlenecks and privacy risks by automating the identification and redaction o… |
| 2 | National Archives and Records Administration | NARA - 0008 | Topic Summarizer and Entity Extraction using AI | Research, Publication, Planning | The AI is intended to solve the problem of unsearchable digital collections caused by massive descriptive backlogs, automating the creation… |
| 3 | National Archives and Records Administration | NARA - 0007 | Auto-fill of Descriptive Metadata for Archival Descriptions | Research, Publication, Planning | The AI is intended to solve the problem of the "descriptive gap" created by labor-intensive manual cataloging by automatically generating m… |
| 4 | Department of Homeland Security | DHS-2454 | LIGER Generative AI Toolkit | Research, Publication, Planning, Clearance | LIGER® for FPS will enable FPS users to employ the power of a Large Language Model (LLM) against non-public and sensitive Agency documents… |
| 5 | National Archives and Records Administration | NARA - 0002 | A1 Museum AI Project | Publication, Research, Planning | The AI is intended to solve the problem of limited document discoverability and intensive manual labor by using automated tagging to person… |
| 6 | National Archives and Records Administration | NARA - 0004 | Amelia Earhart AI Search | Publication, Research, Clearance, Planning | The AI is intended to solve the manual search limitations when processing massive historical datasets by using Natural Language Processing… |
| 7 | Department of Justice | DOJ-0343 | AI Powered Data Governance | Publication, Research, Planning, Clearance | This initiative deploys AI-driven data governance and metadata management to auto-tag, catalog, and enforce retention, while identifying du… |
| 8 | Department of Justice | DOJ-0197 | Informatica - CLAIRE | Research, Publication, Planning, Clearance | Manual scanning and cataloging of data sets related to data analytics' mass data correction, business rules translation, data/column simila… |
| 9 | Department of the Interior | DOI-0053 | Assessment Inventory and Monitoring (AIM) Chatbot | Research, Publication, Planning, Clearance | The AIM program provides access to data from 73,000+ monitoring locations and offers tools, guidance, and workflows to support BLM staff in… |
| 10 | Department of Homeland Security | DHS-2666 | License Plate Capture and Analysis | Research, Publication, Planning, Clearance | The AI is intended to solve the problem of time-consuming manual reviews of license plate images and data, which makes it challenging for i… |
| 11 | Department of Homeland Security | DHS-2540 | Open Metadata | Research, Publication, Planning | Metadata catalog identification. |
| 12 | Department of Justice | DOJ-0295 | FOIA Production Tools | Clearance, Publication, Planning, Research | Enhances and streamlines the processing of Freedom of Information Act (FOIA) requests. Automates tasks such as document classification, int… |
| 13 | National Archives and Records Administration | NARA - 0014 | Automated Data Discovery and Classification Pilot | Research, Publication, Clearance, Planning | The AI is intended to solve the problem of inefficient manual data governance and risk assessment by testing automated data classification… |
| 14 | Department of Veterans Affairs | VA-24-2545 | Privacy Act Automation | Clearance, Publication, Research, Planning | VBA receives over 160,000 Privacy Act requests each year requiring personnel to retrieve, review, and release these records to the Veteran.… |
| 15 | Department of the Interior | DOI-0011 | ePermits: Cognitive Search Capability | Publication, Research, Planning, Clearance | Current native search capabilities don't offer semantic search features that understand user intent and content meaning. |
| 16 | Department of Veterans Affairs | VA-25-1102 | OpenAI Embedding Generation for Future Vector Search of Banking Data | Research, Publication, Planning | The current design of a long term document for a banking partner consists of cloud blob storage which are registered into a database with m… |
| 17 | Department of Justice | DOJ-0199 | Axon | Research, Clearance, Publication, Planning | No AI utilized. But, the use case captures raw video and audio footage that are accessed only to the extent needed for prosecution or inves… |
| 18 | Department of Veterans Affairs | VA-25-3275 | Concept Clustering | Research, Publication, Clearance, Planning | Electronic discovery (e-discovery) refers to discovery in legal proceedings such as litigation, government investigations, or Freedom of In… |
| 19 | National Archives and Records Administration | NARA - 0011 | Freedom of Information Act (FOIA) Discovery AI Pilot | Clearance, Research, Planning, Publication | The AI is intended to solve the problem of larger FOIA backlogs and manual review bottlenecks by automating the discovery of relevant recor… |
| 20 | National Aeronautics and Space Administration | NASA-870 | Natural Language query processor for Common Metadata Repository | Publication, Research, Planning | A chatgpt-like prompt query interface that uses large language models to extract intent from chat query to determine spatial, temporal and… |

## Planning

Grand conceptualization, volume conceptualization, backlog prioritization, release scheduling, and workload balancing.

- National Archives and Records Administration NARA - 0005 - AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records (Pilot, Generative AI). The AI is intended to solve the problem of manual processing bottlenecks and privacy risks by automating the identification and redaction of sensitive personal… Matched themes: Semantic Search and Retrieval, Planning Analytics and Workflow Routing.
- National Archives and Records Administration NARA - 0007 - Auto-fill of Descriptive Metadata for Archival Descriptions (Pre-deployment, Generative AI). The AI is intended to solve the problem of the "descriptive gap" created by labor-intensive manual cataloging by automatically generating metadata and summarie… Matched themes: Semantic Search and Retrieval, Summarization and Drafting Assistance.
- National Archives and Records Administration NARA - 0008 - Topic Summarizer and Entity Extraction using AI (Pre-deployment, Generative AI). The AI is intended to solve the problem of unsearchable digital collections caused by massive descriptive backlogs, automating the creation of metadata for bil… Matched themes: Semantic Search and Retrieval, Summarization and Drafting Assistance.
- National Archives and Records Administration NARA - 0004 - Amelia Earhart AI Search (Deployed, NLP). The AI is intended to solve the manual search limitations when processing massive historical datasets by using Natural Language Processing to accurately locate… Matched themes: Semantic Search and Retrieval.
- National Archives and Records Administration NARA - 0006 - AI based Semantic Search for National Archives Catalog (aka ArchiAI) (Pilot, NLP). The AI is intended to solve the problem of "unsophisticated" keyword-based search limitations by implementing semantic search that understands user intent and… Matched themes: Semantic Search and Retrieval.

## Research

Collection, selection, annotation, and review of records across the national security establishment.

- National Archives and Records Administration NARA - 0008 - Topic Summarizer and Entity Extraction using AI (Pre-deployment, Generative AI). The AI is intended to solve the problem of unsearchable digital collections caused by massive descriptive backlogs, automating the creation of metadata for bil… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Summarization and Drafting Assistance.
- National Archives and Records Administration NARA - 0007 - Auto-fill of Descriptive Metadata for Archival Descriptions (Pre-deployment, Generative AI). The AI is intended to solve the problem of the "descriptive gap" created by labor-intensive manual cataloging by automatically generating metadata and summarie… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Summarization and Drafting Assistance.
- National Archives and Records Administration NARA - 0005 - AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records (Pilot, Generative AI). The AI is intended to solve the problem of manual processing bottlenecks and privacy risks by automating the identification and redaction of sensitive personal… Matched themes: Semantic Search and Retrieval, Transcription, OCR, and Translation.
- Department of Veterans Affairs VA-25-1102 - OpenAI Embedding Generation for Future Vector Search of Banking Data (Pre-deployment, Computer Vision). The current design of a long term document for a banking partner consists of cloud blob storage which are registered into a database with metadata. A future ph… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Transcription, OCR, and Translation.
- Department of Homeland Security DHS-2454 - LIGER Generative AI Toolkit (Pilot, Generative AI). LIGER® for FPS will enable FPS users to employ the power of a Large Language Model (LLM) against non-public and sensitive Agency documents to save time and eff… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Summarization and Drafting Assistance, Transcription, OCR, and Translation.

## Clearance

Declassification coordination, redaction, sensitivity review, editing preparation, and release approvals.

- National Archives and Records Administration NARA - 0005 - AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records (Pilot, Generative AI). The AI is intended to solve the problem of manual processing bottlenecks and privacy risks by automating the identification and redaction of sensitive personal… Matched themes: Redaction and Clearance Triage, Planning Analytics and Workflow Routing.
- National Transportation Safety Board NTSB-0004 - FOIAXpress AI assistant (Pilot, NLP). Timely review of documents for public release Matched themes: Redaction and Clearance Triage.
- National Archives and Records Administration NARA - 0011 - Freedom of Information Act (FOIA) Discovery AI Pilot (Pre-deployment, NLP). The AI is intended to solve the problem of larger FOIA backlogs and manual review bottlenecks by automating the discovery of relevant records and the redaction… Matched themes: Redaction and Clearance Triage.
- National Archives and Records Administration NARA - 0004 - Amelia Earhart AI Search (Deployed, NLP). The AI is intended to solve the manual search limitations when processing massive historical datasets by using Natural Language Processing to accurately locate… Matched themes: Redaction and Clearance Triage.
- Department of Justice DOJ-0033 - Veritone Redact (Deployed, Generative AI). The purpose of the AI use case in Veritone Redact is to support ATF in processing Freedom of Information Act (FOIA) requests by automating the redaction of sen… Matched themes: Redaction and Clearance Triage.

## Publication

Editing, indexing, metadata enhancement, chapter-based release, and public discovery on history.state.gov.

- National Archives and Records Administration NARA - 0008 - Topic Summarizer and Entity Extraction using AI (Pre-deployment, Generative AI). The AI is intended to solve the problem of unsearchable digital collections caused by massive descriptive backlogs, automating the creation of metadata for bil… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Publication and User Experience.
- National Archives and Records Administration NARA - 0007 - Auto-fill of Descriptive Metadata for Archival Descriptions (Pre-deployment, Generative AI). The AI is intended to solve the problem of the "descriptive gap" created by labor-intensive manual cataloging by automatically generating metadata and summarie… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging.
- National Archives and Records Administration NARA - 0005 - AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records (Pilot, Generative AI). The AI is intended to solve the problem of manual processing bottlenecks and privacy risks by automating the identification and redaction of sensitive personal… Matched themes: Semantic Search and Retrieval.
- National Archives and Records Administration NARA - 0002 - A1 Museum AI Project (Deployed, Generative AI). The AI is intended to solve the problem of limited document discoverability and intensive manual labor by using automated tagging to personalize the visitor ex… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Publication and User Experience.
- Department of Justice DOJ-0343 - AI Powered Data Governance (Pre-deployment, Classical ML). This initiative deploys AI-driven data governance and metadata management to auto-tag, catalog, and enforce retention, while identifying duplicate/low-value fi… Matched themes: Semantic Search and Retrieval, Metadata Enrichment and Tagging, Publication and User Experience.

## Recommended FRUS Portfolio

### Semantic FRUS Research Workbench

- Why: FRUS researchers need faster discovery across distributed archival corpora and prior FRUS volumes.
- FRUS benefit: Reduce time spent locating candidate documents, support series planning, and improve chapter-level release sequencing.
- Example federal precedents: National Archives and Records Administration NARA - 0008 (Topic Summarizer and Entity Extraction using AI); National Archives and Records Administration NARA - 0007 (Auto-fill of Descriptive Metadata for Archival Descriptions); Department of Homeland Security DHS-2454 (LIGER Generative AI Toolkit)

### Annotation and Metadata Copilot

- Why: Annotation, glossary work, provenance notes, and digital descriptions are labor-intensive and repetitive.
- FRUS benefit: Accelerate drafts for notes, term lists, person lists, and descriptive metadata while keeping historians in the loop.
- Example federal precedents: National Archives and Records Administration NARA - 0008 (Topic Summarizer and Entity Extraction using AI); National Archives and Records Administration NARA - 0007 (Auto-fill of Descriptive Metadata for Archival Descriptions); Department of Justice DOJ-0197 (Informatica - CLAIRE)

### Clearance and Redaction Triage Assistant

- Why: The Report to Congress identifies interagency declassification and redaction review as the main delay.
- FRUS benefit: Rank risky passages, surface likely equities, and cut reviewer time spent on low-risk material.
- Example federal precedents: National Archives and Records Administration NARA - 0005 (AI Pilot Project to Screen and Flag for Personally Identifiable Information (PII) in Digitized Archival Records); Department of Justice DOJ-0295 (FOIA Production Tools); National Archives and Records Administration NARA - 0004 (Amelia Earhart AI Search)

### Incremental Publication and Discovery Tooling

- Why: FRUS is already publishing cleared chapters incrementally and experimenting with born-digital indexes.
- FRUS benefit: Improve chapter release packaging, index generation, and public discovery without waiting for whole-volume completion.
- Example federal precedents: National Archives and Records Administration NARA - 0008 (Topic Summarizer and Entity Extraction using AI); National Archives and Records Administration NARA - 0002 (A1 Museum AI Project); National Archives and Records Administration NARA - 0007 (Auto-fill of Descriptive Metadata for Archival Descriptions)

## Suggested Next Steps

- Pilot semantic search on a bounded FRUS corpus: one subseries plan, one set of archival finding aids, and a handful of published TEI volumes.
- Add historian-in-the-loop metadata and annotation drafting, but keep TEI authoring and final notes under editorial control.
- Focus the first clearance pilot on redaction triage and prior-release comparison, since clearance is the largest measurable delay.
- Extend existing chapter-based publication work with automated index and discovery enhancements rather than waiting for full-volume automation.

## Source Links

- OMB Inventory: https://github.com/ombegov/2025-Federal-Agency-AI-Use-Case-Inventory
- About FRUS: https://history.state.gov/historicaldocuments/about-frus
- FRUS Status: https://history.state.gov/historicaldocuments/status-of-the-series
- FRUS Stages: https://history.state.gov/historicaldocuments/frus-history/stages
- 2025 Report to Congress: https://static.history.state.gov/reports/report-to-congress-on-frus-for-2025.pdf
- HistoryAtState FRUS Repo: https://github.com/HistoryAtState/frus
- HistoryAtState hsg-project Repo: https://github.com/HistoryAtState/hsg-project
- HistoryAtState hsg-shell Repo: https://github.com/HistoryAtState/hsg-shell
- HistoryAtState Developer Resources: https://history.state.gov/developer

