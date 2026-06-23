import { existsSync } from "node:fs";
import { join } from "node:path";

function isConditionalBlueprintLine(line) {
  return /\bwhen\b|\bif\b|\boptional\b|\bas needed\b|\bor\b/i.test(line);
}

function parseWorkflowBlueprintContracts(text, helpers) {
  const { backtickTokens, markdownSectionBody, markdownSections, markdownSlug } = helpers;
  const contracts = new Map();
  for (const section of markdownSections(text)) {
    const body = markdownSectionBody(text, section);
    const contract = { requiredRoles: new Set(), requiredGates: new Set() };
    let mode = null;
    for (const rawLine of body.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (line === "Route:") {
        mode = "route";
        continue;
      }
      if (line === "Required gates:") {
        mode = "gates";
        continue;
      }
      if (mode === "route" && /^\d+\.\s+/.test(line) && !isConditionalBlueprintLine(line)) {
        for (const token of backtickTokens(line)) contract.requiredRoles.add(token);
      }
      if (mode === "gates" && /^-\s+/.test(line) && !isConditionalBlueprintLine(line)) {
        for (const token of backtickTokens(line)) contract.requiredGates.add(token);
      }
    }
    contracts.set(markdownSlug(section), contract);
  }
  return contracts;
}

export function run(ctx) {
  const {
    artifactAlternatives,
    cleanCell,
    createFindings,
    markdownSections,
    markdownSlug,
    parseMarkdownTable,
    read
  } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);
  const { artifactSchemasPath, artifactTemplates, gateRegistry, handoffMatrix, inferenceReasoningMethods, loopProtocol, workflowBlueprints } = ctx.paths;

  let knownGates = new Map();
  let knownHandoffPairs = new Set();
  let knownWorkflowBlueprints = new Set();
  let workflowBlueprintContracts = new Map();

  for (const file of [gateRegistry, handoffMatrix, workflowBlueprints, inferenceReasoningMethods, loopProtocol, artifactTemplates]) {
    if (!existsSync(file)) addFinding("MISSING_PIPELINE_FILE", "Required pipeline core file is missing.", [file]);
  }

  if (existsSync(loopProtocol)) {
    const text = read(loopProtocol);
    for (const phrase of [
      "brief -> checklist -> execute -> evaluate -> critique -> repair -> repeat -> stop",
      "loop_control_fit",
      "checklist",
      "bounded_execution_packet",
      "evidence",
      "root_cause",
      "regression_check",
      "stop_sufficient | patch_one_gap | ask_user | blocked",
      "Do not store raw chain-of-thought",
      "Do not treat a loop state"
    ]) {
      if (!text.includes(phrase)) {
        addFinding("WEAK_LOOP_PROTOCOL", `Loop protocol is missing required phrase: ${phrase}`, [loopProtocol]);
      }
    }
  }

  if (existsSync(inferenceReasoningMethods)) {
    const text = read(inferenceReasoningMethods);
    for (const phrase of [
      "reasoning_route",
      "runtime_route",
      "raw_trace_storage: forbidden",
      "direct | decompose | verify | compare | tool_loop | branch | search",
      "Do not store raw chain-of-thought",
      "A runtime recommendation is not permission",
      "provider_execution_allowed: false",
      "openai_api_allowed: false",
      "external_router_adopted_raw: false"
    ]) {
      if (!text.includes(phrase)) {
        addFinding("WEAK_INFERENCE_REASONING_POLICY", `Inference reasoning policy is missing required phrase: ${phrase}`, [inferenceReasoningMethods]);
      }
    }
  }

  if (existsSync(gateRegistry)) {
    const text = read(gateRegistry);
    if (!text.includes("| Gate | Owner role | Required artifact |")) {
      addFinding("WEAK_GATE_TABLE", "Gate registry must use columns: Gate, Owner role, Required artifact.", [gateRegistry]);
    }
    const gateRows = parseMarkdownTable(text, ["gate", "ownerRoles", "requiredArtifact"]);
    const seenGates = new Set();
    const gates = new Map(gateRows.map((row) => [row.gate, row]));
    knownGates = gates;
    for (const gate of ["intent_lock", "workflow_route", "loop_control_fit", "brief_completeness", "reference_authority_fit", "evidence_fit", "instruction_packet_fit", "direction_fit", "structure_fit", "storyboard_board_fit", "copy_fit", "promptability_fit", "schema_pricing_fit", "execution_manifest_fit", "asset_manifest_fit", "post_execution_fit", "delivery_fit"]) {
      if (!gates.has(gate)) addFinding("MISSING_GATE", `Gate is missing: ${gate}`, [gateRegistry]);
    }
    for (const row of gateRows) {
      if (seenGates.has(row.gate)) {
        addFinding("DUPLICATE_GATE", `Gate is duplicated: ${row.gate}`, [gateRegistry]);
      }
      seenGates.add(row.gate);
      if (!row.gate || !row.ownerRoles || !row.requiredArtifact) {
        addFinding("WEAK_GATE_ROW", "Gate registry rows must include gate, owner role, and required artifact.", [gateRegistry]);
        continue;
      }
      const owners = row.ownerRoles.split(",").map((role) => cleanCell(role)).filter(Boolean);
      for (const owner of owners) {
        if (!ctx.requiredRoleSet.has(owner)) {
          addFinding("UNKNOWN_GATE_OWNER_ROLE", `Gate ${row.gate} references unknown owner role: ${owner}`, [gateRegistry]);
        }
      }
    }
    if (existsSync(artifactTemplates)) {
      const sections = markdownSections(read(artifactTemplates));
      for (const row of gateRows) {
        const hasTemplate = artifactAlternatives(row.requiredArtifact).some((artifact) => sections.has(artifact));
        if (!hasTemplate) {
          addFinding("MISSING_GATE_ARTIFACT_TEMPLATE", `Gate ${row.gate} requires artifact without a matching template: ${row.requiredArtifact}`, [gateRegistry, artifactTemplates]);
        }
        const hasSchema = artifactAlternatives(row.requiredArtifact).some((artifact) => ctx.artifactSchemaNames.has(artifact));
        if (ctx.artifactSchemaNames.size > 0 && !hasSchema) {
          addFinding("MISSING_ARTIFACT_SCHEMA", `Gate ${row.gate} requires artifact without a matching schema: ${row.requiredArtifact}`, [gateRegistry, artifactSchemasPath]);
        }
      }
    }
    for (const [role, gate] of ctx.agentTemplateGates) {
      const row = gates.get(gate);
      if (!row) {
        addFinding("UNKNOWN_AGENT_REVIEW_GATE", `Agent ${role} references unknown review gate: ${gate}`, [join(ctx.agentDir, `${role}.toml.template`)]);
        continue;
      }
      const owners = row.ownerRoles.split(",").map((owner) => cleanCell(owner)).filter(Boolean);
      if (!owners.includes(role)) {
        addFinding("AGENT_GATE_OWNER_MISMATCH", `Agent ${role} uses gate ${gate}, but gate owner list is: ${owners.join(", ")}`, [join(ctx.agentDir, `${role}.toml.template`), gateRegistry]);
      }
    }
  }

  if (existsSync(handoffMatrix)) {
    const text = read(handoffMatrix);
    if (!text.includes("| From | To | Required fields |")) {
      addFinding("WEAK_HANDOFF_TABLE", "Handoff matrix must use columns: From, To, Required fields.", [handoffMatrix]);
    }
    const handoffRows = parseMarkdownTable(text, ["from", "to", "requiredFields"]);
    const seenHandoffs = new Set();
    for (const row of handoffRows) {
      const pair = `${row.from}->${row.to}`;
      if (seenHandoffs.has(pair)) {
        addFinding("DUPLICATE_HANDOFF", `Handoff is duplicated: ${pair}`, [handoffMatrix]);
      }
      seenHandoffs.add(pair);
      if (!ctx.requiredRoleSet.has(row.from)) {
        addFinding("UNKNOWN_HANDOFF_ROLE", `Handoff references unknown From role: ${row.from}`, [handoffMatrix]);
      }
      if (!ctx.requiredRoleSet.has(row.to)) {
        addFinding("UNKNOWN_HANDOFF_ROLE", `Handoff references unknown To role: ${row.to}`, [handoffMatrix]);
      }
      if (!row.requiredFields || row.requiredFields === "-") {
        addFinding("HANDOFF_FIELD_EMPTY", `Handoff ${row.from} -> ${row.to} must list required fields.`, [handoffMatrix]);
      }
    }
    const handoffPairs = new Set(handoffRows.map((row) => `${row.from}->${row.to}`));
    knownHandoffPairs = handoffPairs;
    for (const pair of ["intent-confirmation->workflow-orchestrator", "workflow-orchestrator->instruction-packet-factory", "image-prompting->tool-routing-cost", "video-prompting->tool-routing-cost", "qa-iteration->delivery-documentation"]) {
      if (!handoffPairs.has(pair)) {
        addFinding("MISSING_HANDOFF", `Required handoff is missing: ${pair}`, [handoffMatrix]);
      }
    }
  }

  if (existsSync(workflowBlueprints)) {
    const blueprintText = read(workflowBlueprints);
    const sections = markdownSections(blueprintText);
    knownWorkflowBlueprints = new Set([...sections].map((section) => markdownSlug(section)));
    workflowBlueprintContracts = parseWorkflowBlueprintContracts(blueprintText, ctx.helpers);
    for (const section of ["Minimal Planning Route", "Static Campaign Or E-Commerce Graphic", "Video Campaign Or Storyboard", "Storyboard Board Artifact", "HyperFrames Coded Video", "Prompt Pack Without Execution", "Document Or Text Workflow", "QA And Delivery Only", "Workflow Self-Improvement Review"]) {
      if (!sections.has(section)) addFinding("WEAK_WORKFLOW_BLUEPRINTS", `Workflow blueprints are missing required section: ${section}`, [workflowBlueprints]);
    }
  }

  return {
    findings,
    knownGates,
    knownHandoffPairs,
    knownWorkflowBlueprints,
    workflowBlueprintContracts
  };
}
