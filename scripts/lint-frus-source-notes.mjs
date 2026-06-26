#!/usr/bin/env node

import fs from "node:fs";

const DIRECT_ACTIONS = new Set(["replace_text", "insert_after_text", "delete_text"]);
const SOURCE_NOTE_TYPES = new Set(["source_note", "inline_source_note", "footnote_source_note"]);
const SOURCE_NOTE_EVIDENCE_REQUESTS = new Set([
  "archival_path",
  "source_image",
  "source_family",
  "source_surrogate_basis",
  "source_list_basis"
]);

const ROLE_PATTERNS = [
  {
    role: "source_label",
    pattern: /(^|\n)\s*(?:\d+\s+)?Source:/i
  },
  {
    role: "repository",
    pattern:
      /\b(American Presidency Project|Archived White House|Congress\.gov|Congressional Research Service|Reagan Library|Ronald Reagan Presidential Library|George H\.?\s*W\.?\s*Bush (?:Presidential )?(?:Library|Presidential Library and Museum)|Bush (?:Presidential )?Library|William J\. Clinton Presidential Library|Clinton (?:Presidential )?(?:Library|Digital Library)|Library of Congress|National Archives|NARA (?:Center for Legislative Archives|ISCAP)|National Security Archive|National Security Council|Department of State|Department of Justice|Department of the Air Force|Federal Bureau of Investigation|Federation of American Scientists|Central Intelligence Agency|CIA|Department of Defense|The White House|White House|Office of the Historian|Foreign Relations of the United States|FRUS|Public Law|Public Papers|GovInfo|NATO|OSCE|OSTI|Presidential Library|Yale Law School Avalon Project)\b|\([A-Z][A-Za-z .&':-]+,\s*\d{4}\)/i
  },
  {
    role: "series_subseries",
    pattern: /\b(Records|Files|Papers|H-Files|NSC\/DC Meetings Files|NSC Meetings Files|NSR Files|NSD Files|CFPF|Lot File|Executive Secretariat|Subject File|Day File|OA\/ID)\b/i
  },
  {
    role: "locator",
    pattern: /\b(Box|Folder|OA\/ID|Lot|D[0-9]{6}|N[0-9]{6}|Document|Telegram|File|vol\.|p\.|pp\.)\b/i
  },
  {
    role: "classification",
    pattern: /\b(Top Secret|Secret|Confidential|Limited Official Use|No classification marking|Unclassified)\b/i
  },
  {
    role: "document_status",
    pattern: /\b(Draft|Final|Original|Copy|Memorandum|Telegram|Letter|Paper|Summary of Conclusions|signed|unsigned|initialed)\b/i
  },
  {
    role: "drafting_clearance_routing",
    pattern: /\b(drafted|cleared|approved|sent for action|sent for information|sent through|distributed|transmitted)\b/i
  },
  {
    role: "read_by_physical",
    pattern: /\b(stamped notation|handwritten|marginalia|wrote|underlined|highlighted|checkmark|saw the memorandum|initialed)\b/i
  },
  {
    role: "attachment_negative_search",
    pattern: /\b(Attached but not printed|Not found attached|Not attached|Not found|No minutes were found|Printed as Document)\b/i
  },
  {
    role: "cross_reference",
    pattern: /\b(See Document|See footnote|Scheduled for publication|printed in|Foreign Relations)\b/i
  }
];

const SURROGATE_PATTERN = /\b(https?:\/\/|www\.|NLR|RAC|FOIA|catalog|scan|PDF)\b/i;

function usage() {
  console.error(
    "Usage: node scripts/lint-frus-source-notes.mjs --units <extracted-units.json|-> [--checker-output output.json] [--format text|json]"
  );
  process.exit(2);
}

function readJson(file) {
  const text = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file}: invalid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function parseArgs(argv) {
  let unitsPath = null;
  let checkerOutputPath = null;
  let format = "text";

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--units") {
      unitsPath = argv[index + 1];
      index += 1;
    } else if (arg === "--checker-output") {
      checkerOutputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      format = argv[index + 1];
      index += 1;
    } else {
      usage();
    }
  }

  if (!unitsPath || !new Set(["text", "json"]).has(format)) {
    usage();
  }

  return { unitsPath, checkerOutputPath, format };
}

function firstIndex(text, pattern) {
  const match = pattern.exec(text);
  return match ? match.index : -1;
}

function countMatches(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  return [...text.matchAll(re)].length;
}

function detectComponents(text) {
  return ROLE_PATTERNS.map(({ role, pattern }) => ({
    role,
    present: pattern.test(text),
    index: firstIndex(text, pattern)
  }));
}

function componentIndex(components, role) {
  return components.find((component) => component.role === role)?.index ?? -1;
}

function addDiagnostic(diagnostics, unit, issue) {
  diagnostics.push({
    unit_id: unit.unit_id,
    location: unit.location || "",
    ...issue
  });
}

function lintSourceNote(unit) {
  const text = unit.exact_text || unit.display_text || "";
  const diagnostics = [];
  const components = detectComponents(text);
  const sourceLabelIndex = componentIndex(components, "source_label");
  const repositoryIndex = componentIndex(components, "repository");
  const classificationIndex = componentIndex(components, "classification");
  const surrogateIndex = firstIndex(text, SURROGATE_PATTERN);
  const duplicateSourceLabels = countMatches(text, /\bSource:/i);

  if (sourceLabelIndex === -1) {
    addDiagnostic(diagnostics, unit, {
      rule_id: "FAS-SN-001",
      severity: "major",
      category: "source_note",
      component_role: "source_label",
      finding: "Source note is missing a `Source:` label or accepted flat-sheet numbered source label.",
      recommended_action: "comment_only",
      evidence_request: "source_image"
    });
  }

  if (duplicateSourceLabels > 1) {
    addDiagnostic(diagnostics, unit, {
      rule_id: "FAS-SN-005",
      severity: "major",
      category: "source_note",
      component_role: "source_label",
      finding: "Source note contains more than one source label.",
      recommended_action: "comment_only",
      evidence_request: "wrapper_safety"
    });
  }

  if (repositoryIndex === -1) {
    const ruleId = surrogateIndex !== -1 ? "FAS-SN-002" : "FAS-SN-001";
    addDiagnostic(diagnostics, unit, {
      rule_id: ruleId,
      severity: "major",
      category: "source_note",
      component_role: "repository",
      finding:
        ruleId === "FAS-SN-002"
          ? "Source note appears to rely on a discovery aid, URL, release id, scan, or catalog locator without a controlling repository or selected published source."
          : "Source note lacks a controlling repository or selected published source.",
      recommended_action: "comment_only",
      evidence_request: "archival_path"
    });
  }

  if (surrogateIndex !== -1 && repositoryIndex !== -1 && surrogateIndex < repositoryIndex) {
    addDiagnostic(diagnostics, unit, {
      rule_id: "FAS-SN-002",
      severity: "major",
      category: "source_note",
      component_role: "repository",
      finding: "Discovery-aid or release-surrogate text appears before the controlling source path.",
      recommended_action: "comment_only",
      evidence_request: "archival_path"
    });
  }

  if (classificationIndex !== -1 && repositoryIndex !== -1 && classificationIndex < repositoryIndex) {
    addDiagnostic(diagnostics, unit, {
      rule_id: "FAS-SN-005",
      severity: "minor",
      category: "source_note",
      component_role: "classification",
      finding: "Classification or no-marking language appears before the controlling source path.",
      recommended_action: "comment_only",
      evidence_request: "source_image"
    });
  }

  if (unit.expected_components && isPlainObject(unit.expected_components)) {
    for (const [role, expected] of Object.entries(unit.expected_components)) {
      if (!expected) continue;
      const component = components.find((item) => item.role === role);
      if (!component || !component.present) {
        addDiagnostic(diagnostics, unit, {
          rule_id: role === "classification" ? "FAS-CLS-001" : "FAS-SN-005",
          severity: "major",
          category: role === "classification" ? "classification_handling" : "source_note",
          component_role: role,
          finding: `Expected source-note component is missing: ${role}.`,
          recommended_action: "comment_only",
          evidence_request: role === "classification" ? "classification_marking" : "source_image"
        });
      }
    }
  }

  const protectedCompact =
    diagnostics.length === 0 &&
    repositoryIndex !== -1 &&
    classificationIndex !== -1 &&
    !unit.expected_components;

  return { components, diagnostics, protectedCompact };
}

function validateCheckerOutput(output) {
  if (!output) return [];
  if (!isPlainObject(output)) return ["checker_output: expected object"];
  const errors = [];
  if (output.schema_version !== "checker-output-v1") errors.push("checker_output.schema_version: must be checker-output-v1");
  if (!Array.isArray(output.checks)) errors.push("checker_output.checks: expected array");
  return errors;
}

function isSourceNoteDirectEdit(check) {
  if (!isPlainObject(check) || !DIRECT_ACTIONS.has(check.recommended_action)) return false;
  return (
    check.category === "source_note" ||
    /^FAS-SN-\d{3}$/.test(check.rule_id || "") ||
    SOURCE_NOTE_EVIDENCE_REQUESTS.has(check.evidence_request || "")
  );
}

function replacementUnitForCheck(check, unit) {
  const original = check.original_text || "";
  const replacement = check.replacement_text || "";
  const text = unit.exact_text || unit.display_text || "";
  let replacementText = replacement;
  if (check.recommended_action === "replace_text" && original && text.includes(original)) {
    replacementText = text.replace(original, replacement);
  } else if (check.recommended_action === "insert_after_text" && original && text.includes(original)) {
    replacementText = text.replace(original, `${original}${replacement}`);
  } else if (check.recommended_action === "delete_text" && original && text.includes(original)) {
    replacementText = text.replace(original, "");
  }
  return {
    ...unit,
    unit_id: `${unit.unit_id}::proposed-replacement`,
    exact_text: replacementText,
    display_text: replacementText,
    expected_components: undefined
  };
}

function directEditConflicts({ results, checkerOutput }) {
  if (!checkerOutput || !Array.isArray(checkerOutput.checks)) return [];
  const byUnitId = new Map(results.map((result) => [result.unit.unit_id, result]));
  const conflicts = [];
  for (const check of checkerOutput.checks) {
    if (!isSourceNoteDirectEdit(check)) continue;
    const result = byUnitId.get(check.unit_id);
    if (!result) continue;
    if (result.diagnostics.length > 0) {
      conflicts.push({
        unit_id: check.unit_id,
        rule_id: check.rule_id || "",
        category: check.category || "",
        original_text: check.original_text || "",
        replacement_text: check.replacement_text || "",
        conflict_type: "source_note_component_gap",
        finding:
          "Direct source-note edit overlaps a unit with source-note component diagnostics; keep it comment-only until the missing component evidence is supplied.",
        required_action: "Change to comment_only or supply source-note component evidence."
      });
      continue;
    }
    const replacementLint = lintSourceNote(replacementUnitForCheck(check, result.unit));
    if (replacementLint.diagnostics.length > 0) {
      conflicts.push({
        unit_id: check.unit_id,
        rule_id: check.rule_id || "",
        category: check.category || "",
        original_text: check.original_text || "",
        replacement_text: check.replacement_text || "",
        conflict_type: "replacement_fails_source_note_lint",
        finding: "Proposed replacement source-note text fails component lint.",
        required_action: "Change to comment_only or revise the replacement with supplied source-note component evidence.",
        replacement_diagnostics: replacementLint.diagnostics.map((diagnostic) => ({
          rule_id: diagnostic.rule_id,
          component_role: diagnostic.component_role,
          finding: diagnostic.finding
        }))
      });
    }
  }
  return conflicts;
}

function loadUnits(document) {
  if (!isPlainObject(document)) {
    throw new Error("$.units_document: expected object");
  }
  if (!Array.isArray(document.units)) {
    throw new Error("$.units: expected array");
  }
  return document.units.filter((unit) => isPlainObject(unit) && SOURCE_NOTE_TYPES.has(unit.unit_type));
}

function summarize(results) {
  const summary = {
    schema_version: "frus-source-note-lint-v1",
    source_notes_seen: results.length,
    diagnostics_count: 0,
    protected_compact_count: 0,
    direct_edit_conflicts: 0,
    diagnostics_by_rule: {},
    diagnostics_by_component_role: {},
    component_presence: {}
  };

  for (const result of results) {
    summary.diagnostics_count += result.diagnostics.length;
    if (result.protectedCompact) summary.protected_compact_count += 1;
    for (const diagnostic of result.diagnostics) {
      summary.diagnostics_by_rule[diagnostic.rule_id] = (summary.diagnostics_by_rule[diagnostic.rule_id] || 0) + 1;
      summary.diagnostics_by_component_role[diagnostic.component_role] =
        (summary.diagnostics_by_component_role[diagnostic.component_role] || 0) + 1;
    }
    for (const component of result.components) {
      if (!component.present) continue;
      summary.component_presence[component.role] = (summary.component_presence[component.role] || 0) + 1;
    }
  }

  return summary;
}

function renderText(output) {
  const lines = [
    `FRUS source-note lint ${output.status}: ${output.summary.source_notes_seen} source notes, ${output.summary.diagnostics_count} diagnostics, ${output.summary.protected_compact_count} compact notes protected, ${output.summary.direct_edit_conflicts} direct-edit conflicts.`
  ];

  for (const diagnostic of output.diagnostics) {
    lines.push(
      `- ${diagnostic.unit_id}: ${diagnostic.rule_id} ${diagnostic.severity} ${diagnostic.component_role}: ${diagnostic.finding}`
    );
  }
  for (const conflict of output.direct_edit_conflicts) {
    lines.push(`conflict: ${conflict.unit_id}: ${conflict.finding}`);
  }

  return `${lines.join("\n")}\n`;
}

try {
  const { unitsPath, checkerOutputPath, format } = parseArgs(process.argv);
  const document = readJson(unitsPath);
  const checkerOutput = checkerOutputPath ? readJson(checkerOutputPath) : null;
  const outputErrors = validateCheckerOutput(checkerOutput);
  if (outputErrors.length > 0) {
    const output = {
      schema_version: "frus-source-note-lint-v1",
      status: "fail",
      summary: {
        schema_version: "frus-source-note-lint-v1",
        source_notes_seen: 0,
        diagnostics_count: 0,
        protected_compact_count: 0,
        direct_edit_conflicts: 0,
        diagnostics_by_rule: {},
        diagnostics_by_component_role: {},
        component_presence: {}
      },
      diagnostics: [],
      direct_edit_conflicts: [],
      errors: outputErrors
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  const sourceNotes = loadUnits(document);
  const results = sourceNotes.map((unit) => ({ unit, ...lintSourceNote(unit) }));
  const diagnostics = results.flatMap((result) => result.diagnostics);
  const conflicts = directEditConflicts({ results, checkerOutput });
  const summary = summarize(results);
  summary.direct_edit_conflicts = conflicts.length;
  const output = {
    schema_version: "frus-source-note-lint-v1",
    status: conflicts.length > 0 ? "fail" : diagnostics.length > 0 ? "warning" : "pass",
    summary,
    diagnostics,
    direct_edit_conflicts: conflicts
  };

  if (format === "json") {
    console.log(JSON.stringify(output, null, 2));
  } else {
    process.stdout.write(renderText(output));
  }
  process.exit(output.status === "fail" ? 1 : 0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
