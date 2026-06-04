#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readZip } from "./apply-frus-track-changes.mjs";

const EDITABLE_UNIT_TYPES = new Set([
  "source_note",
  "follow_on_footnote",
  "editorial_note",
  "document_heading",
  "attachment_note",
  "declassification_note",
  "persons_entry",
  "abbreviation_entry",
  "index_entry",
  "front_matter",
  "source_list_entry",
  "unknown_editorial_text"
]);

function usage() {
  console.error(
    "Usage: node scripts/extract-frus-docx-units.mjs --docx <input.docx> [--out extracted-units.json] [--format json|text]"
  );
  process.exit(2);
}

function parseArgs(argv) {
  let docxPath = null;
  let outPath = null;
  let format = "json";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--docx") {
      docxPath = argv[index + 1];
      index += 1;
    } else if (arg === "--out") {
      outPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!docxPath || !new Set(["json", "text"]).has(format)) usage();
  return { docxPath, outPath, format };
}

function decodeXmlText(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)));
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function xmlAttribute(xml, names) {
  for (const name of names) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}="([^"]*)"`);
    const match = xml.match(pattern);
    if (match) return decodeXmlText(match[1]);
  }
  return "";
}

function textFormsFromXml(xml) {
  const tokenPattern =
    /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:delText\b[^>]*>([\s\S]*?)<\/w:delText>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>|<w:footnoteReference\b[^>]*w:id="([^"]+)"[^>]*\/>|<w:endnoteReference\b[^>]*w:id="([^"]+)"[^>]*\/>|<w:commentReference\b[^>]*w:id="([^"]+)"[^>]*\/>/g;
  let exactText = "";
  let displayText = "";
  let match;

  while ((match = tokenPattern.exec(xml))) {
    if (match[1] !== undefined || match[2] !== undefined) {
      const decoded = decodeXmlText(match[1] !== undefined ? match[1] : match[2]);
      exactText += decoded;
      displayText += decoded;
    } else if (match[0].startsWith("<w:tab")) {
      exactText += "\t";
      displayText += "\t";
    } else if (match[0].startsWith("<w:br") || match[0].startsWith("<w:cr")) {
      exactText += "\n";
      displayText += "\n";
    } else if (match[3] !== undefined) {
      displayText += `[footnote ${decodeXmlText(match[3])}]`;
    } else if (match[4] !== undefined) {
      displayText += `[endnote ${decodeXmlText(match[4])}]`;
    } else if (match[5] !== undefined) {
      displayText += `[comment ${decodeXmlText(match[5])}]`;
    }
  }

  return { exactText, displayText };
}

function paragraphStyle(paragraphXml) {
  const styleMatch = paragraphXml.match(/<w:pStyle\b[^>]*>/);
  return styleMatch ? xmlAttribute(styleMatch[0], ["w:val", "val"]) : "";
}

function runCount(xml) {
  return (xml.match(/<w:r\b/g) || []).length;
}

function commentIds(xml) {
  const ids = new Set();
  const pattern = /<w:(?:commentRangeStart|commentRangeEnd|commentReference)\b[^>]*w:id="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(xml))) {
    ids.add(decodeXmlText(match[1]));
  }
  return [...ids];
}

function noteReferenceIds(xml, tagName) {
  const ids = [];
  const pattern = new RegExp(`<w:${tagName}Reference\\b[^>]*w:id="([^"]+)"[^>]*\\/>`, "g");
  let match;
  while ((match = pattern.exec(xml))) ids.push(decodeXmlText(match[1]));
  return ids;
}

function hasExistingRevisions(xml) {
  return /<w:(?:ins|del|moveFrom|moveTo)\b/.test(xml);
}

function wordBoundaryHazards(xml) {
  const hazards = [];
  if (hasExistingRevisions(xml)) hazards.push("existing_tracked_revisions");
  if (/<w:(?:fldChar|instrText|fldSimple)\b/.test(xml)) hazards.push("field_code");
  if (/<w:hyperlink\b/.test(xml)) hazards.push("hyperlink_boundary");
  if (/<w:sdt\b/.test(xml)) hazards.push("content_control_boundary");
  if (/<w:bookmark(?:Start|End)\b/.test(xml)) hazards.push("bookmark_boundary");
  if (/<w:(?:commentRangeStart|commentRangeEnd|commentReference)\b/.test(xml)) hazards.push("existing_comment_boundary");
  if (/<w:(?:footnoteReference|endnoteReference)\b/.test(xml)) hazards.push("note_reference_boundary");
  return hazards;
}

function pseudoMarkerHazards(text) {
  return /<\/?(?:i|r|b|n|m|[0-9]+)>/.test(text) ? ["production_pseudo_marker"] : [];
}

function provisionalSourceHazards(unitType, text) {
  if (unitType !== "source_note") return [];
  const normalized = text.replace(/\s+/g, " ");
  const hasUrl = /\bhttps?:\/\//i.test(normalized);
  const hasArchivalPath = /\b(?:Library|Archives|Record Group|Records|Files|Collection|Box|Folder|OA\/ID|Lot File|National Security Council|Department of State)\b/i.test(
    normalized
  );
  return hasUrl && !hasArchivalPath ? ["provisional_url_only_source_path"] : [];
}

function normalizeForClassification(text) {
  return text.replace(/\s+/g, " ").trim();
}

function unitTypeFor({ text, style, partKind }) {
  const normalized = normalizeForClassification(text);
  const styleText = style.replace(/[_-]/g, " ");

  if (partKind === "comment") return "unknown_editorial_text";
  if (partKind === "footnote" || partKind === "endnote") {
    return /^(?:\d+\s+)?Source\s*:/i.test(normalized) ? "source_note" : "follow_on_footnote";
  }
  if (/^(?:\d+\s+)?Source\s*:/i.test(normalized)) return "source_note";
  if (/^Editorial Note\.?/i.test(normalized)) return "editorial_note";
  if (/^(?:Declassification|Declassified|Bracketed Note)/i.test(normalized)) return "declassification_note";
  if (/^(?:Attachment|Tab|Enclosure|Annex)\b/i.test(normalized)) return "attachment_note";
  if (/(?:^|\b)(?:Heading|Title|Subtitle)/i.test(styleText)) return "document_heading";
  if (/\bPersons?\b/i.test(styleText) || /^Persons\b/i.test(normalized)) return "persons_entry";
  if (/\bAbbreviations?\b/i.test(styleText) || /^Abbreviations?\b/i.test(normalized)) return "abbreviation_entry";
  if (/\bIndex\b/i.test(styleText)) return "index_entry";
  if (/\b(?:Source List|Bibliography|References)\b/i.test(styleText)) return "source_list_entry";
  if (partKind === "header" || partKind === "footer") return "front_matter";
  if (/\b(?:Preface|About the Series|Sources|Abbreviations and Terms)\b/i.test(normalized)) return "front_matter";
  return "transcribed_document_text";
}

function editMetadata({ unitType, blockedBoundaries, partKind }) {
  const editableApparatus = EDITABLE_UNIT_TYPES.has(unitType) && partKind !== "comment";
  const evidenceBlocked = blockedBoundaries.includes("provisional_url_only_source_path");
  const editability = editableApparatus && !evidenceBlocked ? "editable" : "context_only";
  const edit_safety = editableApparatus && blockedBoundaries.length === 0 ? "safe_to_edit" : "comment_only";
  const comment_safety =
    partKind === "comment" || blockedBoundaries.includes("existing_comment_boundary") ? "unsafe" : "safe_to_comment";
  return { editability, edit_safety, comment_safety };
}

function partKindForName(name) {
  if (name === "word/document.xml") return "document";
  if (name === "word/footnotes.xml") return "footnote";
  if (name === "word/endnotes.xml") return "endnote";
  if (name === "word/comments.xml") return "comment";
  if (/^word\/header[0-9]+\.xml$/.test(name)) return "header";
  if (/^word\/footer[0-9]+\.xml$/.test(name)) return "footer";
  return "other";
}

function nextUnitId(counters, unitType) {
  const prefix = unitType.replace(/_/g, "-");
  const next = (counters.get(unitType) || 0) + 1;
  counters.set(unitType, next);
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

function pageBreakInfo(paragraphXml) {
  const breaks = [...paragraphXml.matchAll(/<w:br\b[^>]*\/>/g)].filter((match) =>
    /\b(?:w:type|type)="page"/.test(match[0])
  );
  return {
    page_break_before_property: /<w:pageBreakBefore\b/.test(paragraphXml),
    explicit_page_breaks: breaks.length,
    starts_with_page_break: /^<w:p\b[\s\S]*?<w:br\b[^>]*(?:w:type|type)="page"[^>]*\/>/i.test(paragraphXml),
    ends_with_page_break: /<w:br\b[^>]*(?:w:type|type)="page"[^>]*\/>\s*<\/w:r>\s*<\/w:p>\s*$/i.test(paragraphXml)
  };
}

function numberingInfo(paragraphXml) {
  const numPrMatch = paragraphXml.match(/<w:numPr\b[\s\S]*?<\/w:numPr>/);
  if (!numPrMatch) {
    return {
      has_numbering: false,
      numbering_level: "",
      numbering_id: ""
    };
  }
  const numPr = numPrMatch[0];
  const ilvlMatch = numPr.match(/<w:ilvl\b[^>]*>/);
  const numIdMatch = numPr.match(/<w:numId\b[^>]*>/);
  return {
    has_numbering: true,
    numbering_level: ilvlMatch ? xmlAttribute(ilvlMatch[0], ["w:val", "val"]) : "",
    numbering_id: numIdMatch ? xmlAttribute(numIdMatch[0], ["w:val", "val"]) : ""
  };
}

function wordStructure(paragraphXml, inheritedPageBreakBefore) {
  const pageBreaks = pageBreakInfo(paragraphXml);
  const footnoteReferenceIds = noteReferenceIds(paragraphXml, "footnote");
  const endnoteReferenceIds = noteReferenceIds(paragraphXml, "endnote");
  const commentReferenceIds = noteReferenceIds(paragraphXml, "comment");
  return {
    page_break_before: Boolean(inheritedPageBreakBefore || pageBreaks.page_break_before_property || pageBreaks.starts_with_page_break),
    page_break_before_property: pageBreaks.page_break_before_property,
    explicit_page_breaks: pageBreaks.explicit_page_breaks,
    starts_with_page_break: pageBreaks.starts_with_page_break,
    ends_with_page_break: pageBreaks.ends_with_page_break,
    ...numberingInfo(paragraphXml),
    footnote_reference_ids: footnoteReferenceIds,
    endnote_reference_ids: endnoteReferenceIds,
    comment_reference_ids: commentReferenceIds,
    has_note_reference: footnoteReferenceIds.length > 0 || endnoteReferenceIds.length > 0
  };
}

function storyLabel(partKind) {
  if (partKind === "document") return "Document body";
  if (partKind === "footnote") return "Footnote";
  if (partKind === "endnote") return "Endnote";
  if (partKind === "comment") return "Comment";
  if (partKind === "header") return "Header";
  if (partKind === "footer") return "Footer";
  return "Word story";
}

function paragraphLocation({ partKind, partName, noteId, commentId, paragraphIndex, table }) {
  if (table) {
    return `${storyLabel(partKind)}${noteId ? ` ${noteId}` : ""}${commentId ? ` ${commentId}` : ""}, table ${
      table.tableIndex
    }, row ${table.rowIndex}, cell ${table.cellIndex}, paragraph ${table.paragraphIndex}`;
  }
  if (partKind === "footnote") return `Footnote ${noteId}, paragraph ${paragraphIndex}`;
  if (partKind === "endnote") return `Endnote ${noteId}, paragraph ${paragraphIndex}`;
  if (partKind === "comment") return `Comment ${commentId}, paragraph ${paragraphIndex}`;
  if (partKind === "header" || partKind === "footer") return `${partName}, paragraph ${paragraphIndex}`;
  return `Document body, paragraph ${paragraphIndex}`;
}

function buildUnit({
  counters,
  paragraphXml,
  partName,
  partKind,
  paragraphIndex,
  noteId,
  commentId,
  surroundingText,
  table,
  inheritedPageBreakBefore
}) {
  const { exactText, displayText } = textFormsFromXml(paragraphXml);
  if (!exactText.trim() && !displayText.trim()) return null;

  const style = paragraphStyle(paragraphXml);
  const structure = wordStructure(paragraphXml, inheritedPageBreakBefore);
  const unitType = unitTypeFor({ text: exactText || displayText, style, partKind });
  const blockedBoundaries = [
    ...new Set([
      ...wordBoundaryHazards(paragraphXml),
      ...pseudoMarkerHazards(exactText || displayText),
      ...provisionalSourceHazards(unitType, exactText || displayText),
      ...(table ? ["table_cell_boundary"] : [])
    ])
  ];
  const existingComments = commentIds(paragraphXml);
  const { editability, edit_safety, comment_safety } = editMetadata({ unitType, blockedBoundaries, partKind });
  const runs = runCount(paragraphXml);
  const xmlAnchor = {
    paragraph_index: paragraphIndex,
    run_start: runs > 0 ? 0 : null,
    run_end: runs > 0 ? runs - 1 : null,
    char_start: 0,
    char_end: exactText.length
  };
  if (noteId) xmlAnchor[partKind === "endnote" ? "endnote_id" : "footnote_id"] = noteId;
  if (commentId) xmlAnchor.comment_id = commentId;
  if (table) {
    xmlAnchor.table_index = table.tableIndex;
    xmlAnchor.row_index = table.rowIndex;
    xmlAnchor.cell_index = table.cellIndex;
    xmlAnchor.table_paragraph_index = table.paragraphIndex;
  }

  return {
    unit_id: nextUnitId(counters, unitType),
    unit_type: unitType,
    editability,
    edit_safety,
    comment_safety,
    word_part: partName,
    location: paragraphLocation({ partKind, partName, noteId, commentId, paragraphIndex, table }),
    xml_anchor: xmlAnchor,
    paragraph_style: style,
    word_structure: structure,
    exact_text: exactText,
    display_text: displayText,
    surrounding_text: surroundingText || "",
    existing_revisions: hasExistingRevisions(paragraphXml),
    existing_comments: existingComments,
    blocked_boundaries: blockedBoundaries
  };
}

function parseTableUnits({ counters, tableXml, partName, partKind, noteId, commentId, tableIndex, surroundingText }) {
  const units = [];
  const rows = [...tableXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)];
  rows.forEach((rowMatch, rowOffset) => {
    const rowIndex = rowOffset + 1;
    const cells = [...rowMatch[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)];
    cells.forEach((cellMatch, cellOffset) => {
      const cellIndex = cellOffset + 1;
      const paragraphs = [...cellMatch[0].matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)];
      paragraphs.forEach((paragraphMatch, paragraphOffset) => {
        const unit = buildUnit({
          counters,
          paragraphXml: paragraphMatch[0],
          partName,
          partKind,
          paragraphIndex: paragraphOffset + 1,
          noteId,
          commentId,
          surroundingText,
          table: {
            tableIndex,
            rowIndex,
            cellIndex,
            paragraphIndex: paragraphOffset + 1
          }
        });
        if (unit) units.push(unit);
      });
    });
  });
  return units;
}

function parseStoryBlocks({ counters, xml, partName, partKind, noteId, commentId, surroundingText }) {
  const units = [];
  const blockPattern = /<w:p\b[\s\S]*?<\/w:p>|<w:tbl\b[\s\S]*?<\/w:tbl>/g;
  let paragraphIndex = 0;
  let tableIndex = 0;
  let currentSurroundingText = surroundingText || "";
  let pendingPageBreakBefore = false;
  let match;

  while ((match = blockPattern.exec(xml))) {
    const blockXml = match[0];
    if (blockXml.startsWith("<w:tbl")) {
      tableIndex += 1;
      units.push(
        ...parseTableUnits({
          counters,
          tableXml: blockXml,
          partName,
          partKind,
          noteId,
          commentId,
          tableIndex,
          surroundingText: currentSurroundingText
        })
      );
      pendingPageBreakBefore = false;
      continue;
    }

    paragraphIndex += 1;
    const unit = buildUnit({
      counters,
      paragraphXml: blockXml,
      partName,
      partKind,
      paragraphIndex,
      noteId,
      commentId,
      surroundingText: currentSurroundingText,
      inheritedPageBreakBefore: pendingPageBreakBefore
    });
    if (!unit) {
      const emptyBreakInfo = pageBreakInfo(blockXml);
      if (emptyBreakInfo.explicit_page_breaks > 0 || emptyBreakInfo.page_break_before_property) {
        pendingPageBreakBefore = true;
      }
      continue;
    }
    units.push(unit);
    pendingPageBreakBefore = unit.word_structure.ends_with_page_break;
    if (unit.unit_type === "document_heading" && unit.display_text.trim()) {
      currentSurroundingText = unit.display_text.trim();
    }
  }

  return units;
}

function extractNotes({ counters, xml, partName, partKind }) {
  const units = [];
  const tag = partKind === "endnote" ? "endnote" : "footnote";
  const notePattern = new RegExp(`<w:${tag}\\b[\\s\\S]*?<\\/w:${tag}>`, "g");
  let match;

  while ((match = notePattern.exec(xml))) {
    const noteXml = match[0];
    const noteId = xmlAttribute(noteXml, ["w:id", "id"]);
    if (noteId === "-1" || noteId === "0") continue;
    units.push(...parseStoryBlocks({ counters, xml: noteXml, partName, partKind, noteId }));
  }

  return units;
}

function extractComments({ counters, xml, partName }) {
  const units = [];
  const commentPattern = /<w:comment\b[\s\S]*?<\/w:comment>/g;
  let match;

  while ((match = commentPattern.exec(xml))) {
    const commentXml = match[0];
    const commentId = xmlAttribute(commentXml, ["w:id", "id"]);
    const author = xmlAttribute(commentXml, ["w:author", "author"]);
    const surroundingText = author ? `Existing Word comment by ${author}` : "Existing Word comment";
    units.push(
      ...parseStoryBlocks({
        counters,
        xml: commentXml,
        partName,
        partKind: "comment",
        commentId,
        surroundingText
      })
    );
  }

  return units;
}

function extractGenericPart({ counters, entries, partName }) {
  const entry = entries.get(partName);
  if (!entry) return [];
  const xml = entry.content.toString("utf8");
  const partKind = partKindForName(partName);
  if (partKind === "footnote" || partKind === "endnote") {
    return extractNotes({ counters, xml, partName, partKind });
  }
  if (partKind === "comment") {
    return extractComments({ counters, xml, partName });
  }
  return parseStoryBlocks({ counters, xml, partName, partKind });
}

function discoverPartNames(entries) {
  return [...entries.keys()]
    .filter((name) => {
      if (name === "word/document.xml") return true;
      if (name === "word/footnotes.xml") return true;
      if (name === "word/endnotes.xml") return true;
      if (name === "word/comments.xml") return true;
      if (/^word\/header[0-9]+\.xml$/.test(name)) return true;
      if (/^word\/footer[0-9]+\.xml$/.test(name)) return true;
      return false;
    })
    .sort((a, b) => {
      const order = ["word/document.xml", "word/footnotes.xml", "word/endnotes.xml", "word/comments.xml"];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      return a.localeCompare(b);
    });
}

function summarize(units, partNames) {
  const countsByType = {};
  const countsByPart = {};
  let editableUnits = 0;
  let safeDirectEditUnits = 0;
  let revisionUnits = 0;
  let commentUnits = 0;
  let blockedUnits = 0;
  let pageBreakBeforeUnits = 0;
  let numberedUnits = 0;
  let noteReferenceUnits = 0;

  for (const unit of units) {
    countsByType[unit.unit_type] = (countsByType[unit.unit_type] || 0) + 1;
    countsByPart[unit.word_part] = (countsByPart[unit.word_part] || 0) + 1;
    if (unit.editability === "editable") editableUnits += 1;
    if (unit.edit_safety === "safe_to_edit") safeDirectEditUnits += 1;
    if (unit.existing_revisions) revisionUnits += 1;
    if (unit.existing_comments.length > 0 || unit.word_part === "word/comments.xml") commentUnits += 1;
    if (unit.blocked_boundaries.length > 0) blockedUnits += 1;
    if (unit.word_structure?.page_break_before) pageBreakBeforeUnits += 1;
    if (unit.word_structure?.has_numbering) numberedUnits += 1;
    if (unit.word_structure?.has_note_reference) noteReferenceUnits += 1;
  }

  return {
    word_parts_scanned: partNames,
    total_units: units.length,
    editable_units: editableUnits,
    safe_direct_edit_units: safeDirectEditUnits,
    units_with_existing_revisions: revisionUnits,
    units_with_existing_comments: commentUnits,
    units_with_blocked_boundaries: blockedUnits,
    units_with_page_break_before: pageBreakBeforeUnits,
    units_with_word_numbering: numberedUnits,
    units_with_note_references: noteReferenceUnits,
    counts_by_type: countsByType,
    counts_by_part: countsByPart
  };
}

function extractDocxUnits(docxPath) {
  const entries = readZip(docxPath);
  if (!entries.has("word/document.xml")) {
    throw new Error(`${docxPath}: missing word/document.xml`);
  }

  const counters = new Map();
  const partNames = discoverPartNames(entries);
  const units = partNames.flatMap((partName) => extractGenericPart({ counters, entries, partName }));
  const source = path.basename(docxPath);

  return {
    schema_version: "frus-extracted-units-v1",
    source,
    generated_at: new Date().toISOString(),
    extractor: {
      name: "extract-frus-docx-units",
      version: "2026-06-03",
      note: "Conservative no-dependency WordprocessingML unit extractor for offline FRUS annotation checker preflight."
    },
    document_manifest: {
      file_name: source,
      package_parts_scanned: partNames,
      existing_revisions_present: units.some((unit) => unit.existing_revisions),
      existing_comments_present: units.some((unit) => unit.existing_comments.length > 0 || unit.word_part === "word/comments.xml")
    },
    summary: summarize(units, partNames),
    units
  };
}

function renderText(result) {
  const summary = result.summary;
  return [
    `FRUS DOCX extraction passed: ${summary.total_units} units from ${summary.word_parts_scanned.length} Word parts.`,
    `Editable units: ${summary.editable_units}; safe direct-edit units: ${summary.safe_direct_edit_units}; blocked-boundary units: ${summary.units_with_blocked_boundaries}.`,
    `Existing revisions present: ${result.document_manifest.existing_revisions_present ? "yes" : "no"}; existing comments present: ${
      result.document_manifest.existing_comments_present ? "yes" : "no"
    }.`
  ].join("\n") + "\n";
}

function runCli() {
  const { docxPath, outPath, format } = parseArgs(process.argv);
  const result = extractDocxUnits(docxPath);
  if (outPath) {
    fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(result));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

export { extractDocxUnits, textFormsFromXml };
