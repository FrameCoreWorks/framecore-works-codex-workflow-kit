#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { hasHelpFlag, isAppleDouble, printHelpAndExit, relativePosix, repoRoot, reportFindings, walkFiles } from "./common.mjs";

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/validate.mjs [repo-root]

Purpose:
  Validate the workflow kit structure and public repository readiness.

Options:
  repo-root  Optional repository root to validate. Defaults to this repo.

Checks:
  Agent templates, skill contracts, gates, handoffs, artifact templates, docs, examples, Markdown links, text-image policy, and release governance.
`);
}

const validationRoot = resolve(process.argv[2] ?? repoRoot);
const findings = [];

function addFinding(code, message, files) {
  findings.push({ code, message, files: files.map((file) => relativePosix(validationRoot, file)) });
}

function read(file) {
  return readFileSync(file, "utf8");
}

function markdownSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function anchorsFor(text) {
  const anchors = new Set();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    anchors.add(markdownSlug(match[1]));
  }
  return anchors;
}

function validateMarkdownLinks(files) {
  for (const file of files) {
    if (isAppleDouble(file)) continue;
    const text = read(file);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = match[1].trim();
      if (/^(https?:|mailto:|#)/i.test(href)) continue;
      const [pathPart, anchor] = href.split("#");
      const target = resolve(dirname(file), pathPart || ".");
      if (!existsSync(target)) {
        addFinding("BROKEN_MARKDOWN_LINK", `Broken markdown link: ${href}`, [file]);
        continue;
      }
      if (anchor && anchor.length > 0) {
        const targetText = read(target);
        if (!anchorsFor(targetText).has(anchor.toLowerCase())) {
          addFinding("BROKEN_MARKDOWN_ANCHOR", `Broken markdown anchor: ${href}`, [file]);
        }
      }
    }
  }
}

const instructionOverridePatterns = [
  /ignore (all )?(previous|prior) instructions/i,
  /disregard (all )?(previous|prior) instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /disable (the )?safety/i,
  /bypass (the )?safety/i,
  /\bjailbreak\b/i,
  /\bdeveloper mode\b/i,
];

function validateInstructionOverridePhrases(files) {
  for (const file of files) {
    if (isAppleDouble(file)) continue;
    const text = read(file);
    const matchedPattern = instructionOverridePatterns.find((pattern) => pattern.test(text));
    if (matchedPattern) {
      addFinding(
        "INSTRUCTION_OVERRIDE_PHRASE",
        "Agent-facing files must not include instruction-override or prompt-exfiltration phrases.",
        [file]
      );
    }
  }
}

function cleanCell(value) {
  return value.trim().replace(/^`|`$/g, "").trim();
}

function parseMarkdownTable(text, headerNames) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().startsWith("|"));
  const rows = [];
  let header = null;

  for (const line of lines) {
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length === 0) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    if (cells.length !== header.length) continue;
    rows.push(Object.fromEntries(headerNames.map((name, index) => [name, cleanCell(cells[index] ?? "")])));
  }

  return rows;
}

function artifactAlternatives(value) {
  return value.split(/\s+or\s+/i).map((item) => item.trim()).filter(Boolean);
}

function markdownSections(text) {
  return new Set([...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()));
}

function markdownSectionBody(text, section) {
  const lines = text.split(/\r?\n/);
  const body = [];
  let active = false;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (active) break;
      active = heading[1].trim() === section;
      continue;
    }
    if (active) body.push(line);
  }
  return body.join("\n");
}

function artifactFieldSet(text) {
  return new Set([...text.matchAll(/^-\s+([A-Za-z][A-Za-z0-9_ /-]*):/gm)].map((match) => match[1].trim()));
}

function appearsInOrder(text, phrases) {
  let index = -1;
  for (const phrase of phrases) {
    const nextIndex = text.indexOf(phrase, index + 1);
    if (nextIndex === -1) return false;
    index = nextIndex;
  }
  return true;
}

function isConditionalBlueprintLine(line) {
  return /\bwhen\b|\bif\b|\boptional\b|\bas needed\b|\bor\b/i.test(line);
}

function backtickTokens(line) {
  return [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim()).filter(Boolean);
}

function parseWorkflowBlueprintContracts(text) {
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

function isPublicFixturePath(value) {
  if (typeof value !== "string") return false;
  if (!value.startsWith("examples/") || !value.endsWith(".md")) return false;
  return !value.split(/[\\/]+/).some((segment) => segment.startsWith(".") || segment.startsWith("._") || segment.length === 0);
}

const requiredRoles = JSON.parse(readFileSync(join(validationRoot, "config/agent-naming.schema.json"), "utf8")).roles;
const requiredRoleSet = new Set(requiredRoles);
const agentDir = join(validationRoot, ".codex/agents");
const missingAgents = requiredRoles
  .map((role) => join(agentDir, `${role}.toml.template`))
  .filter((path) => !existsSync(path));
if (missingAgents.length > 0) {
  addFinding("MISSING_AGENT_TEMPLATE", "Required role-based agent template is missing.", missingAgents);
}

const agentTemplateGates = new Map();
for (const role of requiredRoles) {
  const file = join(agentDir, `${role}.toml.template`);
  if (!existsSync(file)) continue;
  const text = read(file);
  for (const marker of ["Role:", "Scope:", "Inputs:", "Outputs:", "Forbidden:", "Review gate:", "Handoff rules:"]) {
    if (!text.includes(marker)) {
      addFinding("WEAK_AGENT_TEMPLATE", `Agent template ${role} is missing marker ${marker}`, [file]);
    }
  }
  const gateMatch = text.match(/Review gate:\s*`?([a-z0-9_]+)`?\./);
  if (!gateMatch) {
    addFinding("MISSING_AGENT_REVIEW_GATE", `Agent template ${role} must declare a review gate.`, [file]);
  } else {
    agentTemplateGates.set(role, gateMatch[1]);
  }
}

const skillFiles = walkFiles(join(validationRoot, ".agents/skills")).filter((file) => file.endsWith("SKILL.md"));
if (skillFiles.length < 25) {
  addFinding("MISSING_SKILLS", "Expected full skill pack is incomplete.", [join(validationRoot, ".agents/skills")]);
}
const requiredSkillSections = [
  "## When To Use",
  "## Inputs",
  "## Outputs",
  "## Process",
  "## Decision Rules",
  "## Guardrails",
  "## Handoff",
  "## QA Checklist"
];
for (const file of skillFiles) {
  const text = read(file);
  const nameMatch = text.match(/^---\nname:\s*([-a-z0-9]+)/m);
  if (!nameMatch || !/\ndescription:\s*/m.test(text)) {
    addFinding("INVALID_SKILL_FRONTMATTER", "Skill frontmatter must include name and description.", [file]);
    continue;
  }
  const expectedName = basename(dirname(file));
  if (nameMatch[1] !== expectedName) {
    addFinding("SKILL_NAME_MISMATCH", `Skill frontmatter name must match folder name: ${expectedName}`, [file]);
  }
  const body = text.replace(/^---[\s\S]*?---\n/, "");
  const bodyWordCount = (body.match(/\b[\w'-]+\b/g) ?? []).length;
  if (bodyWordCount < 120 || (body.match(/^##\s+/gm) ?? []).length < 6) {
    addFinding("SKILL_STUB", "Skill body is too thin to function as an operational contract.", [file]);
  }
  for (const section of requiredSkillSections) {
    if (!text.includes(section)) {
      addFinding("MISSING_SKILL_SECTION", `Skill is missing required section: ${section}`, [file]);
    }
  }
}

const gateRegistry = join(validationRoot, ".agents/skills/pipeline-core/references/gate-registry.md");
const handoffMatrix = join(validationRoot, ".agents/skills/pipeline-core/references/handoff-matrix.md");
const workflowBlueprints = join(validationRoot, ".agents/skills/pipeline-core/references/workflow-blueprints.md");
const artifactTemplates = join(validationRoot, ".agents/skills/pipeline-core/templates/artifact-templates.md");
const artifactSchemasPath = join(validationRoot, "config/artifact-schemas.json");
for (const file of [gateRegistry, handoffMatrix, workflowBlueprints, artifactTemplates]) {
  if (!existsSync(file)) addFinding("MISSING_PIPELINE_FILE", "Required pipeline core file is missing.", [file]);
}

let artifactSchemas = null;
let artifactSchemaNames = new Set();
let knownGates = new Map();
let knownHandoffPairs = new Set();
let knownWorkflowBlueprints = new Set();
let workflowBlueprintContracts = new Map();
if (existsSync(artifactSchemasPath)) {
  try {
    artifactSchemas = JSON.parse(read(artifactSchemasPath));
  } catch (error) {
    addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", `Artifact schema registry must be valid JSON: ${error.message}`, [artifactSchemasPath]);
  }
} else {
  addFinding("MISSING_REPO_FILE", "Required public repo file is missing: config/artifact-schemas.json", [artifactSchemasPath]);
}
if (artifactSchemas) {
  if (artifactSchemas.schema_version !== 1) {
    addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", "Artifact schema registry schema_version must be 1.", [artifactSchemasPath]);
  }
  if (!isPlainObject(artifactSchemas.artifacts)) {
    addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", "Artifact schema registry must define an artifacts object.", [artifactSchemasPath]);
  } else {
    artifactSchemaNames = new Set(Object.keys(artifactSchemas.artifacts));
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
  for (const gate of ["intent_lock", "workflow_route", "brief_completeness", "reference_authority_fit", "evidence_fit", "instruction_packet_fit", "direction_fit", "structure_fit", "storyboard_board_fit", "copy_fit", "promptability_fit", "schema_pricing_fit", "execution_manifest_fit", "asset_manifest_fit", "post_execution_fit", "delivery_fit"]) {
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
      if (!requiredRoleSet.has(owner)) {
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
      const hasSchema = artifactAlternatives(row.requiredArtifact).some((artifact) => artifactSchemaNames.has(artifact));
      if (artifactSchemaNames.size > 0 && !hasSchema) {
        addFinding("MISSING_ARTIFACT_SCHEMA", `Gate ${row.gate} requires artifact without a matching schema: ${row.requiredArtifact}`, [gateRegistry, artifactSchemasPath]);
      }
    }
  }
  for (const [role, gate] of agentTemplateGates) {
    const row = gates.get(gate);
    if (!row) {
      addFinding("UNKNOWN_AGENT_REVIEW_GATE", `Agent ${role} references unknown review gate: ${gate}`, [join(agentDir, `${role}.toml.template`)]);
      continue;
    }
    const owners = row.ownerRoles.split(",").map((owner) => cleanCell(owner)).filter(Boolean);
    if (!owners.includes(role)) {
      addFinding("AGENT_GATE_OWNER_MISMATCH", `Agent ${role} uses gate ${gate}, but gate owner list is: ${owners.join(", ")}`, [join(agentDir, `${role}.toml.template`), gateRegistry]);
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
    if (!requiredRoleSet.has(row.from)) {
      addFinding("UNKNOWN_HANDOFF_ROLE", `Handoff references unknown From role: ${row.from}`, [handoffMatrix]);
    }
    if (!requiredRoleSet.has(row.to)) {
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
  workflowBlueprintContracts = parseWorkflowBlueprintContracts(blueprintText);
  for (const section of ["Minimal Planning Route", "Static Campaign Or E-Commerce Graphic", "Video Campaign Or Storyboard", "Storyboard Board Artifact", "HyperFrames Coded Video", "Prompt Pack Without Execution", "Document Or Text Workflow", "QA And Delivery Only", "Workflow Self-Improvement Review"]) {
    if (!sections.has(section)) addFinding("WEAK_WORKFLOW_BLUEPRINTS", `Workflow blueprints are missing required section: ${section}`, [workflowBlueprints]);
  }
}

if (existsSync(artifactTemplates)) {
  const text = read(artifactTemplates);
  const sections = markdownSections(text);
  for (const section of ["Task Confirmation", "Brief Contract", "Reference Pack", "Instruction Packet", "Storyboard Contract", "Board Artifact Prompt", "Prompt Pack", "Execution Manifest", "HyperFrames Production Brief", "QA / Iteration Report", "Delivery Manifest"]) {
    if (!sections.has(section)) addFinding("MISSING_TEMPLATE_SECTION", `Artifact template section is missing: ${section}`, [artifactTemplates]);
  }
  if (artifactSchemas?.artifacts) {
    for (const [artifactName, schema] of Object.entries(artifactSchemas.artifacts)) {
      if (!sections.has(artifactName)) {
        addFinding("ARTIFACT_SCHEMA_WITHOUT_TEMPLATE", `Artifact schema has no matching template section: ${artifactName}`, [artifactSchemasPath, artifactTemplates]);
        continue;
      }
      if (!isPlainObject(schema) || !Array.isArray(schema.required_fields) || schema.required_fields.length === 0) {
        addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema must define required_fields: ${artifactName}`, [artifactSchemasPath]);
        continue;
      }
      const templateFields = artifactFieldSet(markdownSectionBody(text, artifactName));
      for (const field of schema.required_fields) {
        if (typeof field !== "string" || field.trim().length === 0) {
          addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema required_fields must contain non-empty strings: ${artifactName}`, [artifactSchemasPath]);
          continue;
        }
        if (!templateFields.has(field)) {
          addFinding("ARTIFACT_SCHEMA_FIELD_MISSING_TEMPLATE", `Artifact ${artifactName} requires field missing from its template: ${field}`, [artifactSchemasPath, artifactTemplates]);
        }
      }
      if (!Array.isArray(schema.example_paths) || schema.example_paths.length === 0) {
        addFinding("MISSING_ARTIFACT_FIXTURE_COVERAGE", `Artifact schema must register at least one public fixture: ${artifactName}`, [artifactSchemasPath]);
      }
      for (const examplePath of schema.example_paths ?? []) {
        if (typeof examplePath !== "string" || examplePath.startsWith("/") || examplePath.split(/[\\/]+/).includes("..")) {
          addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema example path must be repo-relative and safe: ${artifactName}`, [artifactSchemasPath]);
          continue;
        }
        if (!isPublicFixturePath(examplePath)) {
          addFinding("INVALID_ARTIFACT_FIXTURE_PATH", `Artifact schema example path must point to a public Markdown fixture under examples/: ${artifactName}`, [artifactSchemasPath]);
          continue;
        }
        const exampleFile = join(validationRoot, examplePath);
        if (!existsSync(exampleFile)) {
          addFinding("MISSING_ARTIFACT_EXAMPLE", `Artifact example file is missing: ${examplePath}`, [artifactSchemasPath]);
          continue;
        }
        const exampleFields = artifactFieldSet(read(exampleFile));
        for (const field of schema.required_fields) {
          if (!exampleFields.has(field)) {
            addFinding("EXAMPLE_ARTIFACT_MISSING_FIELD", `Example artifact ${examplePath} is missing required field: ${field}`, [exampleFile, artifactSchemasPath]);
          }
        }
      }
    }
    for (const section of sections) {
      if (!artifactSchemaNames.has(section)) {
        addFinding("TEMPLATE_SECTION_MISSING_SCHEMA", `Artifact template section has no matching schema: ${section}`, [artifactTemplates, artifactSchemasPath]);
      }
    }
  }
}

const requiredDocs = [
  "docs/quickstart.md",
  "docs/codex-assisted-install.md",
  "docs/using-the-kit.md",
  "docs/troubleshooting.md",
  "docs/faq.md",
  "docs/compatibility.md",
  "docs/cli-reference.md",
  "docs/provider-neutral-boundary.md",
  "docs/memory-cache.md",
  "docs/context-folder.md",
  "docs/semantic-memory.md",
  "docs/self-improvement.md",
  "docs/openai-api-policy.md",
  "docs/v1-readiness.md",
  "docs/live-codex-e2e-check.md",
  "docs/roadmap.md",
  "docs/release.md",
  "docs/release-notes-template.md",
  "docs/architecture.md",
  "docs/artifact-schemas.md",
  "docs/example-authoring.md",
  "docs/workflow-stages.md",
  "docs/onboarding.md",
  "docs/customization.md",
  "docs/team-configuration.md",
  "docs/text-image-policy.md",
  "docs/hipson-integration.md",
  "docs/hyperframes.md",
  "docs/recurring-workflow-review.md",
  "docs/workflow-self-improvement.md",
  "docs/migration-guide.md",
  "docs/agent-roster.md",
  "docs/repository-settings.md",
  "examples/README.md"
];
for (const doc of requiredDocs) {
  if (!existsSync(join(validationRoot, doc))) addFinding("MISSING_DOC", `Required documentation file is missing: ${doc}`, [join(validationRoot, doc)]);
}

const onboardingDoc = join(validationRoot, "docs/onboarding.md");
if (existsSync(onboardingDoc)) {
  const text = read(onboardingDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Defaults", "Interactive Questions", "Installed Files", "Completion Output", "Hipson Adapter And Full Hipson", "Safety Boundaries", "Generated Files"]) {
    if (!sections.has(section)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required section: ${section}`, [onboardingDoc]);
  }
  for (const phrase of ["Allow automatic delivery uploads", "Require an explicit user request before delivery/export", "Require QA approval before generated asset delivery", "Delivery preferences only shape local behavior"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required delivery-preference phrase: ${phrase}`, [onboardingDoc]);
  }
  for (const phrase of ["FrameCore Works was created for creative work", "created by FrameCore Works", "https://buycoffee.to/framecoreworks", "adapted to other use cases", "What kind of work do you do?", "What should this pipeline help with most?", "How should the pipeline fit your work style?", "work_profile"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required work-profile phrase: ${phrase}`, [onboardingDoc]);
  }
  for (const phrase of ["safe relative path", "do not use absolute paths", "does not clone, install, or activate full Hipson"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required setup-boundary phrase: ${phrase}`, [onboardingDoc]);
  }
  for (const phrase of ["run install dry-run", "review planned writes", "install project-locally", "AGENTS.framecore.md", "docs/using-the-kit.md"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required completion-output phrase: ${phrase}`, [onboardingDoc]);
  }
}

const teamConfigurationDoc = join(validationRoot, "docs/team-configuration.md");
if (existsSync(teamConfigurationDoc)) {
  const text = read(teamConfigurationDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Personal Install", "Shared Team Install", "Recommended Team Pattern", "Files That Should Stay Local By Default", "When To Share Config", "Privacy Review", "Update And Repair In Teams"]) {
    if (!sections.has(section)) addFinding("WEAK_TEAM_CONFIGURATION_DOC", `Team configuration guide is missing required section: ${section}`, [teamConfigurationDoc]);
  }
  for (const phrase of ["safe default is personal install", "framecore.config.json", "framecore.config.shared.json", ".framecore/manifest.json", "run `npm run audit:privacy`", "provider-neutral boundary", "Do not commit these by default", "repo-relative and portable", "update and repair"]) {
    if (!text.includes(phrase)) addFinding("WEAK_TEAM_CONFIGURATION_DOC", `Team configuration guide is missing required local-config phrase: ${phrase}`, [teamConfigurationDoc]);
  }
}

const customizationDoc = join(validationRoot, "docs/customization.md");
if (existsSync(customizationDoc)) {
  const text = read(customizationDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Local Config File", "Safe Customizations", "Unsafe Customizations", "Output Directory", "Agent Display Names", "QA Strictness", "Delivery Preferences", "Hipson Settings", "Workflow Self-Improvement Settings", "Team Customization", "Update Repair And Uninstall", "Validation Checklist", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_CUSTOMIZATION_DOC", `Customization guide is missing required section: ${section}`, [customizationDoc]);
  }
  for (const phrase of ["framecore.config.json", "framecore.config.shared.json", "safe relative path", "work_profile", "primary_work", "agent_display_names", "qa_strictness", "auto_upload", "delivery_requires_current_user_request", "require_qa_allowlist_for_generated_assets", "Full Hipson remains separate and optional", "report-and-proposals-only", ".framecore/manifest.json", "npm run release:check"]) {
    if (!text.includes(phrase)) addFinding("WEAK_CUSTOMIZATION_DOC", `Customization guide is missing required customization phrase: ${phrase}`, [customizationDoc]);
  }
}

const migrationDoc = join(validationRoot, "docs/migration-guide.md");
if (existsSync(migrationDoc)) {
  const text = read(migrationDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Migration Principles", "Source Audit", "Role And Naming Migration", "Skill And Agent Migration", "Config And Manifest Migration", "Update Repair And Rollback", "Validation Checklist", "Release Notes", "Halt Conditions"]) {
    if (!sections.has(section)) addFinding("WEAK_MIGRATION_GUIDE", `Migration guide is missing required section: ${section}`, [migrationDoc]);
  }
  for (const phrase of ["role IDs", "display names stay local", "framecore.config.json", ".framecore/manifest.json", "schema_version", "provider-neutral boundary", "do not migrate provider credentials", "update", "repair", "rollback", "npm run audit:privacy", "npm run validate", "Do not tag v1.0"]) {
    if (!text.includes(phrase)) addFinding("WEAK_MIGRATION_GUIDE", `Migration guide is missing required migration phrase: ${phrase}`, [migrationDoc]);
  }
}

const quickstartDoc = join(validationRoot, "docs/quickstart.md");
if (existsSync(quickstartDoc)) {
  const text = read(quickstartDoc);
  for (const phrase of ["## Beginner-Friendly Guided Quickstart", "npm run install:guided", "## Codex-Assisted Quickstart", "## Optional GitHub Desktop Setup", "GitHub Desktop", "visual cloning", "temporary or tools folder outside the target workspace", "safe relative output path", "PowerShell commands", "$env:FRAMECORE_TARGET", "If guided install completes successfully", "manual fallback", "npm run check", "doctor/preflight", "onboarding", "install dry-run", "after onboarding", "project-local only", "Do not use global install", "Show me the changed files", "PowerShell"]) {
    if (!text.includes(phrase)) addFinding("WEAK_INSTALL_PROMPT", `Codex-assisted quickstart is missing required safety phrase: ${phrase}`, [quickstartDoc]);
  }
  for (const phrase of ["## Advanced Global Install", "writes to the current user's home workspace", "npm run doctor -- --mode global", "node scripts/install.mjs --mode dry-run --target \"$HOME\"", "node scripts/install.mjs --mode global --confirm-global"]) {
    if (!text.includes(phrase)) addFinding("WEAK_GLOBAL_INSTALL_DOC", `Quickstart must document global install safety: ${phrase}`, [quickstartDoc]);
  }
  if (!appearsInOrder(text, ["Run npm run check", "Run doctor/preflight", "Run onboarding", "Run install dry-run", "after onboarding", "Install project-local only"])) {
    addFinding("WEAK_INSTALL_PROMPT", "Codex-assisted quickstart must keep canonical order: check, doctor, onboarding, post-onboarding dry-run, project-local install.", [quickstartDoc]);
  }
}

const codexAssistedInstallDoc = join(validationRoot, "docs/codex-assisted-install.md");
if (existsSync(codexAssistedInstallDoc)) {
  const text = read(codexAssistedInstallDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Paste-In Instruction", "What Codex Should Do", "Onboarding Questions", "Stop Conditions", "Expected Result"]) {
    if (!sections.has(section)) addFinding("WEAK_CODEX_ASSISTED_INSTALL_DOC", `Codex-assisted install guide is missing required section: ${section}`, [codexAssistedInstallDoc]);
  }
  for (const phrase of ["temporary or tools folder outside the target workspace", "guided project-local installer", "manual fallback", "Run onboarding", "Run install dry-run", "Install project-local only", "Do not use global install", "creative work such as graphics", "what I do", "main use cases", "work style", "GitHub Desktop", "visual cloning tool", "delivery upload behavior", "safe relative path", "optional full Hipson expansion", "does not clone or install full Hipson", "stop and ask the user", "user-owned file conflicts", "external execution tools", "AGENTS.framecore.md"]) {
    if (!text.includes(phrase)) addFinding("WEAK_CODEX_ASSISTED_INSTALL_DOC", `Codex-assisted install guide is missing required safety phrase: ${phrase}`, [codexAssistedInstallDoc]);
  }
}

const usingTheKitDoc = join(validationRoot, "docs/using-the-kit.md");
if (existsSync(usingTheKitDoc)) {
  const text = read(usingTheKitDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "First Prompt After Install", "Starter Prompts", "Choosing Workflow Depth", "Creative Workflow Prompts", "No External Execution Mode", "Hipson Adapter Prompts", "What Codex Should Produce", "Recovery After Context Loss", "Safety Reminders", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_USING_THE_KIT_DOC", `Using The Kit guide is missing required section: ${section}`, [usingTheKitDoc]);
  }
  for (const phrase of ["Read AGENTS.md", "AGENTS.framecore.md", "project-local", "Do not use external execution tools", "GPT Image 2", "Full Hipson remains separate and optional", "does not clone, install, or activate full Hipson", "workflow-self-improvement", "QA And Delivery Review", "workflow.json", "neutral role IDs", "Project State", "recovery_prompt"]) {
    if (!text.includes(phrase)) addFinding("WEAK_USING_THE_KIT_DOC", `Using The Kit guide is missing required usage phrase: ${phrase}`, [usingTheKitDoc]);
  }
}

const exampleAuthoringDoc = join(validationRoot, "docs/example-authoring.md");
if (existsSync(exampleAuthoringDoc)) {
  const text = read(exampleAuthoringDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "When To Add An Example", "Required Files", "`workflow.json` Contract", "README Structure", "Route And Handoff Rules", "Privacy Requirements", "Validation Steps", "Review Checklist"]) {
    if (!sections.has(section)) addFinding("WEAK_EXAMPLE_AUTHORING_DOC", `Example authoring guide is missing required section: ${section}`, [exampleAuthoringDoc]);
  }
  for (const phrase of ["README.md", "workflow.json", "example_id", "Workflow Blueprints", "Gate Registry", "Handoff Matrix", "neutral role IDs", "npm run cleanup:appledouble -- --apply", "npm run release:check", "private cloud links or IDs"]) {
    if (!text.includes(phrase)) addFinding("WEAK_EXAMPLE_AUTHORING_DOC", `Example authoring guide is missing required authoring phrase: ${phrase}`, [exampleAuthoringDoc]);
  }
}

const agentRosterDoc = join(validationRoot, "docs/agent-roster.md");
if (existsSync(agentRosterDoc)) {
  const text = read(agentRosterDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "How Role Selection Works", "Role Roster", "Common Selection Patterns", "Local Display Names", "Handoff Discipline", "Provider-Neutral Boundaries", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide is missing required section: ${section}`, [agentRosterDoc]);
  }
  for (const role of requiredRoles) {
    if (!text.includes(`\`${role}\``)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide must document role ID: ${role}`, [agentRosterDoc]);
  }
  for (const phrase of ["neutral role IDs", "local display names", "Task Confirmation", "Project State", "Review gate", "Common handoff", "Stop before `tool-routing-cost`", "GPT Image 2 one-pass policy", "Handoff Matrix"]) {
    if (!text.includes(phrase)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide is missing required role-selection phrase: ${phrase}`, [agentRosterDoc]);
  }
}

const compatibilityDoc = join(validationRoot, "docs/compatibility.md");
if (existsSync(compatibilityDoc)) {
  const text = read(compatibilityDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Runtime Requirements", "Operating Systems", "Codex Environment", "Install Modes", "Manifest Compatibility", "External Tool Boundary", "Support Baseline"]) {
    if (!sections.has(section)) addFinding("WEAK_COMPATIBILITY_DOC", `Compatibility guide is missing required section: ${section}`, [compatibilityDoc]);
  }
  for (const phrase of ["Node.js 20 or newer", "macOS", "Linux", "Windows", ".codex/agents/*.toml", "project-local", "--confirm-global", ".framecore/manifest.json", "provider-neutral", "GPT Image 2"]) {
    if (!text.includes(phrase)) addFinding("WEAK_COMPATIBILITY_DOC", `Compatibility guide is missing required compatibility phrase: ${phrase}`, [compatibilityDoc]);
  }
}

const faqDoc = join(validationRoot, "docs/faq.md");
if (existsSync(faqDoc)) {
  const text = read(faqDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Install Questions", "Configuration Questions", "Workflow Questions", "Provider And Safety Questions", "Hipson And HyperFrames", "Updates And Uninstall", "Troubleshooting", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_FAQ_DOC", `FAQ is missing required section: ${section}`, [faqDoc]);
  }
  for (const phrase of ["guided installer", "project-local install", "global install", "--confirm-global", "GitHub Desktop", "visual way to clone", "framecore.config.json", "local display names", "AGENTS.framecore.md", "provider-neutral", "GPT Image 2", "Full Hipson remains separate and optional", "does not clone, install, or activate full Hipson", "HyperFrames", "uninstall", "--yes", "npm run release:check"]) {
    if (!text.includes(phrase)) addFinding("WEAK_FAQ_DOC", `FAQ is missing required user-answer phrase: ${phrase}`, [faqDoc]);
  }
}

const cliReferenceDoc = join(validationRoot, "docs/cli-reference.md");
if (existsSync(cliReferenceDoc)) {
  const text = read(cliReferenceDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Command Groups", "Safe Install Order", "Non-Mutating Checks", "Mutating Commands", "Install Modes", "Packaging And Release Checks", "Safety Rules", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_CLI_REFERENCE_DOC", `CLI reference is missing required section: ${section}`, [cliReferenceDoc]);
  }
  for (const phrase of ["guided project-local installer", "npm run install:guided", "npm run doctor", "npm run install:dry-run", "npm run secret:scan", "npm run release:check", "npm run package:list", "project-local", "global install", "--confirm-global", "uninstall", "--yes", "Do not enable external execution providers"]) {
    if (!text.includes(phrase)) addFinding("WEAK_CLI_REFERENCE_DOC", `CLI reference is missing required command phrase: ${phrase}`, [cliReferenceDoc]);
  }
}

const artifactSchemasDoc = join(validationRoot, "docs/artifact-schemas.md");
if (existsSync(artifactSchemasDoc)) {
  const text = read(artifactSchemasDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Files", "Schema Contract", "Fixture Rules", "Validation", "Adding An Artifact", "Halt Conditions"]) {
    if (!sections.has(section)) addFinding("WEAK_ARTIFACT_SCHEMAS_DOC", `Artifact schemas guide is missing required section: ${section}`, [artifactSchemasDoc]);
  }
  for (const phrase of ["config/artifact-schemas.json", "required_fields", "example_paths", "gate-required artifacts", "matching template section", "public fixture path", "provider-neutral", "private project context", "local absolute paths"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ARTIFACT_SCHEMAS_DOC", `Artifact schemas guide is missing required schema phrase: ${phrase}`, [artifactSchemasDoc]);
  }
}

const workflowStagesDoc = join(validationRoot, "docs/workflow-stages.md");
if (existsSync(workflowStagesDoc)) {
  const text = read(workflowStagesDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Stage Matrix", "Loopback Rules", "No-Provider Mode", "Common Blueprints", "Example Routes", "Validation", "Related Files"]) {
    if (!sections.has(section)) addFinding("WEAK_WORKFLOW_STAGES_DOC", `Workflow stages guide is missing required section: ${section}`, [workflowStagesDoc]);
  }
  for (const phrase of ["role IDs", "review gates", "handoff matrix", "config/artifact-schemas.json", "examples/*/workflow.json", "tool-routing-cost", "execution-manifest", "qa-iteration", "Delivery Manifest"]) {
    if (!text.includes(phrase)) addFinding("WEAK_WORKFLOW_STAGES_DOC", `Workflow stages guide is missing required routing phrase: ${phrase}`, [workflowStagesDoc]);
  }
}

const providerNeutralDoc = join(validationRoot, "docs/provider-neutral-boundary.md");
if (existsSync(providerNeutralDoc)) {
  const text = read(providerNeutralDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "What Provider-Neutral Means", "Decision Matrix", "Built-In Chat Image Exception", "Coded Video Boundary", "Hipson Boundary", "User-Configured Extensions", "Release Gate"]) {
    if (!sections.has(section)) addFinding("WEAK_PROVIDER_NEUTRAL_BOUNDARY_DOC", `Provider-neutral boundary guide is missing required section: ${section}`, [providerNeutralDoc]);
  }
  for (const phrase of ["external paid media-provider clients", "provider CLIs", "endpoint catalogs", "provider credentials", "API-key setup flows", "Allowed", "Conditional", "Forbidden", "GPT Image 2", "HyperFrames", "Full Hipson remains separate and optional", "config/provider-neutral-policy.json"]) {
    if (!text.includes(phrase)) addFinding("WEAK_PROVIDER_NEUTRAL_BOUNDARY_DOC", `Provider-neutral boundary guide is missing required boundary phrase: ${phrase}`, [providerNeutralDoc]);
  }
}

const textImagePolicyDoc = join(validationRoot, "docs/text-image-policy.md");
if (existsSync(textImagePolicyDoc)) {
  const text = read(textImagePolicyDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Built-In Generation Path", "One-Pass Rule", "Prompt Requirements", "Allowed Exceptions", "Failure Handling", "Validation"]) {
    if (!sections.has(section)) addFinding("WEAK_TEXT_IMAGE_POLICY_DOC", `Text-bearing image policy guide is missing required section: ${section}`, [textImagePolicyDoc]);
  }
  for (const phrase of ["GPT Image 2", "built-in Codex/ChatGPT image generation", "one pass", "exact final copy", "safe margins", "no extra words", "coded or vector artifact", "Do not silently replace", "not an external provider integration"]) {
    if (!text.includes(phrase)) addFinding("WEAK_TEXT_IMAGE_POLICY_DOC", `Text-bearing image policy guide is missing required policy phrase: ${phrase}`, [textImagePolicyDoc]);
  }
}

const hipsonIntegrationDoc = join(validationRoot, "docs/hipson-integration.md");
if (existsSync(hipsonIntegrationDoc)) {
  const text = read(hipsonIntegrationDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Adapter Scope", "Full Hipson Boundary", "Onboarding Behavior", "Packet Types", "Privacy Rules", "Validation"]) {
    if (!sections.has(section)) addFinding("WEAK_HIPSON_INTEGRATION_DOC", `Hipson integration guide is missing required section: ${section}`, [hipsonIntegrationDoc]);
  }
  for (const phrase of ["Full Hipson remains separate and optional", "https://github.com/Hipson47/Hipson.git", "does not clone, install, or activate full Hipson", "research maps", "bounded instruction packets", "review packets", "execution packets", "target agent", "acceptance criteria", "must not include secrets"]) {
    if (!text.includes(phrase)) addFinding("WEAK_HIPSON_INTEGRATION_DOC", `Hipson integration guide is missing required adapter phrase: ${phrase}`, [hipsonIntegrationDoc]);
  }
}

const hyperframesDoc = join(validationRoot, "docs/hyperframes.md");
if (existsSync(hyperframesDoc)) {
  const text = read(hyperframesDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "When To Use", "Workflow Route", "Production Brief Requirements", "Captions And Overlays", "Render QA", "Provider-Neutral Boundary", "Delivery"]) {
    if (!sections.has(section)) addFinding("WEAK_HYPERFRAMES_DOC", `HyperFrames guide is missing required section: ${section}`, [hyperframesDoc]);
  }
  for (const phrase of ["coded-video workflow path", "not as a paid media-provider integration", "scene timing", "GSAP", "captions", "render QA", "delivery manifest", "source files"]) {
    if (!text.includes(phrase)) addFinding("WEAK_HYPERFRAMES_DOC", `HyperFrames guide is missing required workflow phrase: ${phrase}`, [hyperframesDoc]);
  }
}

const recurringWorkflowReviewDoc = join(validationRoot, "docs/recurring-workflow-review.md");
if (existsSync(recurringWorkflowReviewDoc)) {
  const text = read(recurringWorkflowReviewDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Default State", "Opt-In Recipe", "Report-Only Rules", "User-Facing Output", "Forbidden Actions", "Disable Or Remove", "Validation"]) {
    if (!sections.has(section)) addFinding("WEAK_RECURRING_WORKFLOW_REVIEW_DOC", `Recurring workflow review guide is missing required section: ${section}`, [recurringWorkflowReviewDoc]);
  }
  for (const phrase of ["Default: disabled", "every 24 hours", "report-only", "mutation: disabled", "uploads: disabled", "external execution: disabled", "Workflow Improvement Alert", "does not edit workflow files", "explicit user or maintainer approval"]) {
    if (!text.includes(phrase)) addFinding("WEAK_RECURRING_WORKFLOW_REVIEW_DOC", `Recurring workflow review guide is missing required governance phrase: ${phrase}`, [recurringWorkflowReviewDoc]);
  }
}

const workflowSelfImprovementDoc = join(validationRoot, "docs/workflow-self-improvement.md");
if (existsSync(workflowSelfImprovementDoc)) {
  const text = read(workflowSelfImprovementDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Invocation Rules", "Evidence Inputs", "Report-Only Automation", "Proposal Contract", "Adoption Flow", "Forbidden Actions", "Validation And Release Checks", "Halt Conditions", "Output Summary"]) {
    if (!sections.has(section)) addFinding("WEAK_WORKFLOW_SELF_IMPROVEMENT_DOC", `Workflow self-improvement guide is missing required section: ${section}`, [workflowSelfImprovementDoc]);
  }
  for (const phrase of ["explicit-only", "report-only", "no automatic edits", "no uploads", "no external execution", "no destructive operations", "workflow-orchestrator", "qa-iteration", "explicit user or maintainer approval", "config/automation-recipes/workflow-self-improvement-review.example.json", "templates/improvement-log.md", "templates/change-proposal.md"]) {
    if (!text.includes(phrase)) addFinding("WEAK_WORKFLOW_SELF_IMPROVEMENT_DOC", `Workflow self-improvement guide is missing required governance phrase: ${phrase}`, [workflowSelfImprovementDoc]);
  }
}

const v1ReadinessDoc = join(validationRoot, "docs/v1-readiness.md");
if (existsSync(v1ReadinessDoc)) {
  const text = read(v1ReadinessDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Required State", "Install And Lifecycle", "Onboarding", "Examples", "Documentation", "Validation Gates", "Halt Conditions", "Sign-Off"]) {
    if (!sections.has(section)) addFinding("WEAK_V1_READINESS_DOC", `v1.0 readiness guide is missing required section: ${section}`, [v1ReadinessDoc]);
  }
  for (const phrase of ["project-local install is the default", "global install is clearly marked advanced", "provider-neutral boundary is documented and validated", "GPT Image 2 one-pass policy", "Full Hipson remains separate and optional", "workflow.json", "npm run release:readiness -- --tag v1.0.0", "npm run syntax:check", "npm run agent:check", "path-sensitive cross-platform GitHub Actions workflow", "Do not tag v1.0"]) {
    if (!text.includes(phrase)) addFinding("WEAK_V1_READINESS_DOC", `v1.0 readiness guide is missing required release-readiness phrase: ${phrase}`, [v1ReadinessDoc]);
  }
}

const roadmapDoc = join(validationRoot, "docs/roadmap.md");
if (existsSync(roadmapDoc)) {
  const text = read(roadmapDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Current Scope", "Known Limitations", "Near-Term Priorities", "Future Candidates", "v1.0 Readiness", "Non-Goals", "Release Discipline"]) {
    if (!sections.has(section)) addFinding("WEAK_ROADMAP_DOC", `Roadmap is missing required section: ${section}`, [roadmapDoc]);
  }
  for (const phrase of ["provider-neutral", "project-local", "guided installer", "artifact schemas", "full Hipson", "v1.0", "no bundled external paid execution provider"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ROADMAP_DOC", `Roadmap is missing required planning phrase: ${phrase}`, [roadmapDoc]);
  }
}

const liveCodexE2EDoc = join(validationRoot, "docs/live-codex-e2e-check.md");
if (existsSync(liveCodexE2EDoc)) {
  const text = read(liveCodexE2EDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Scope", "Prerequisites", "Safe Test Workspace", "Procedure", "Expected Signals", "Failure Signals", "Evidence To Record", "Acceptance", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_LIVE_CODEX_E2E_DOC", `Live Codex E2E checklist is missing required section: ${section}`, [liveCodexE2EDoc]);
  }
  for (const phrase of ["real Codex workspace", "project-local install", "Do not use external paid providers", "AGENTS.md", "AGENTS.framecore.md", ".agents/skills/pipeline-core/SKILL.md", "intent confirmation", "workflow-orchestrator", "Memory Cache/project-state.md", "custom-agent spawning", "AGENTS-only pass"]) {
    if (!text.includes(phrase)) addFinding("WEAK_LIVE_CODEX_E2E_DOC", `Live Codex E2E checklist is missing required phrase: ${phrase}`, [liveCodexE2EDoc]);
  }
}

const releaseNotesTemplate = join(validationRoot, "docs/release-notes-template.md");
if (existsSync(releaseNotesTemplate)) {
  const text = read(releaseNotesTemplate);
  const sections = markdownSections(text);
  for (const section of ["Version", "Summary", "Install And Update Notes", "Onboarding Notes", "Workflow Changes", "Validation And Package Checks", "Security And Privacy Review", "Known Limitations", "Links"]) {
    if (!sections.has(section)) addFinding("WEAK_RELEASE_NOTES_TEMPLATE", `Release notes template is missing required section: ${section}`, [releaseNotesTemplate]);
  }
  for (const phrase of ["provider-neutral", "project-local", "npm run release:check", "npm run release:readiness", "npm run secret:scan", "npm run syntax:check", "npm run agent:check", "npm run package:audit", "npm run package:list", "No secrets", "No bundled external paid execution providers", "GPT Image 2", "Full Hipson remains separate and optional"]) {
    if (!text.includes(phrase)) addFinding("WEAK_RELEASE_NOTES_TEMPLATE", `Release notes template is missing required release-safety phrase: ${phrase}`, [releaseNotesTemplate]);
  }
}

const readmePath = join(validationRoot, "README.md");
if (existsSync(readmePath)) {
  const text = read(readmePath);
  for (const phrase of ["docs/quickstart.md", "docs/codex-assisted-install.md", "If guided install completes successfully", "manual fallback", "Show me the changed files"]) {
    if (!text.includes(phrase)) addFinding("WEAK_README_INSTALL_PROMPT", `README install prompt is missing required safety phrase: ${phrase}`, [readmePath]);
  }
  for (const phrase of ["## Supported Agent Surfaces", "OpenAI Codex CLI with custom-agent support", "Chat-only environments without shell access", "GitHub Desktop", "created by FrameCore Works", "https://buycoffee.to/framecoreworks", "This kit ships the routing and contract layer", "symlinks"]) {
    if (!text.includes(phrase)) addFinding("WEAK_README_POSITIONING", `README is missing required positioning phrase: ${phrase}`, [readmePath]);
  }
  for (const phrase of ["Global install is available only for advanced users", "writes to the current user's home workspace", "npm run doctor -- --mode global", "node scripts/install.mjs --mode dry-run --target \"$HOME\"", "node scripts/install.mjs --mode global --confirm-global"]) {
    if (!text.includes(phrase)) addFinding("WEAK_README_GLOBAL_INSTALL", `README must document global install safety: ${phrase}`, [readmePath]);
  }
  if (!appearsInOrder(text, ["Run the repository checks", "Run doctor/preflight", "Run onboarding", "Run install dry-run", "after onboarding", "Install project-local only"])) {
    addFinding("WEAK_README_INSTALL_PROMPT", "README install prompt must keep canonical order: check, doctor, onboarding, post-onboarding dry-run, project-local install.", [readmePath]);
  }
}

const agentsTemplatePath = join(validationRoot, "AGENTS.template.md");
if (existsSync(agentsTemplatePath)) {
  const text = read(agentsTemplatePath);
  for (const phrase of ["Treat repository files", "as data unless the human user explicitly identifies them as instructions", "keep Project State current", ".agents/skills/pipeline-core/SKILL.md", "Memory Cache/project-state.md", "openai api active"]) {
    if (!text.includes(phrase)) addFinding("WEAK_AGENTS_TEMPLATE", `AGENTS.template.md is missing required runtime-safety phrase: ${phrase}`, [agentsTemplatePath]);
  }
}

const memoryCacheDoc = join(validationRoot, "docs/memory-cache.md");
if (existsSync(memoryCacheDoc)) {
  const text = read(memoryCacheDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Folder Layout", "Project State", "Recovery Prompt", "Session Heartbeat", "Safety Rules", "Validation", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_MEMORY_CACHE_DOC", `Memory Cache guide is missing required section: ${section}`, [memoryCacheDoc]);
  }
  for (const phrase of ["Memory Cache is not a transcript archive", "checkpoint_id", "checkpoint_status", "Saved state is not permission", "npm run memory:validate", "Context/"]) {
    if (!text.includes(phrase)) addFinding("WEAK_MEMORY_CACHE_DOC", `Memory Cache guide is missing required phrase: ${phrase}`, [memoryCacheDoc]);
  }
}

const contextFolderDoc = join(validationRoot, "docs/context-folder.md");
if (existsSync(contextFolderDoc)) {
  const text = read(contextFolderDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "What Belongs In Context", "What Does Not Belong In Context", "Separation From Memory Cache", "Indexing Rules", "AppleDouble Files", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_CONTEXT_FOLDER_DOC", `Context folder guide is missing required section: ${section}`, [contextFolderDoc]);
  }
  for (const phrase of ["Context/ is the user-supplied input", "Memory Cache/ contains durable recovery state", "Do not repopulate `Context/` from `Memory Cache/`", "exclude `Context/` by default", "AppleDouble"]) {
    if (!text.includes(phrase)) addFinding("WEAK_CONTEXT_FOLDER_DOC", `Context folder guide is missing required phrase: ${phrase}`, [contextFolderDoc]);
  }
}

const semanticMemoryDoc = join(validationRoot, "docs/semantic-memory.md");
if (existsSync(semanticMemoryDoc)) {
  const text = read(semanticMemoryDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Indexed By Default", "Excluded By Default", "Local Query", "Optional Embeddings", "Workspace Evaluation", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_SEMANTIC_MEMORY_DOC", `Semantic memory guide is missing required section: ${section}`, [semanticMemoryDoc]);
  }
  for (const phrase of ["default semantic index does not call any API", "Memory Cache/semantic-index.local.json", "Context/", "openai api active", "public kit does not require Responses API"]) {
    if (!text.includes(phrase)) addFinding("WEAK_SEMANTIC_MEMORY_DOC", `Semantic memory guide is missing required phrase: ${phrase}`, [semanticMemoryDoc]);
  }
}

const selfImprovementToolsDoc = join(validationRoot, "docs/self-improvement.md");
if (existsSync(selfImprovementToolsDoc)) {
  const text = read(selfImprovementToolsDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Audit Command", "Local Improvement Command", "Adoption Rule", "Safe Patch Bias", "Forbidden Actions", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_SELF_IMPROVEMENT_TOOLS_DOC", `Self-improvement tools guide is missing required section: ${section}`, [selfImprovementToolsDoc]);
  }
  for (const phrase of ["do not patch repo files by themselves", "Memory Cache/self-improvement-queue.md", "Adoption requires", "Prefer expansion over rebuild", "Do not upload"]) {
    if (!text.includes(phrase)) addFinding("WEAK_SELF_IMPROVEMENT_TOOLS_DOC", `Self-improvement tools guide is missing required phrase: ${phrase}`, [selfImprovementToolsDoc]);
  }
}

const openAiPolicyDoc = join(validationRoot, "docs/openai-api-policy.md");
if (existsSync(openAiPolicyDoc)) {
  const text = read(openAiPolicyDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Activation Phrase", "API-Gated Capabilities", "Never Send", "Semantic Memory", "Text-Bearing Graphics", "Related Docs"]) {
    if (!sections.has(section)) addFinding("WEAK_OPENAI_API_POLICY_DOC", `OpenAI API policy is missing required section: ${section}`, [openAiPolicyDoc]);
  }
  for (const phrase of ["inactive by default", "openai api active", "OPENAI_API_KEY", "Without activation", "Native Codex or ChatGPT image generation", "does not depend on Responses API"]) {
    if (!text.includes(phrase)) addFinding("WEAK_OPENAI_API_POLICY_DOC", `OpenAI API policy is missing required phrase: ${phrase}`, [openAiPolicyDoc]);
  }
}

const requiredRepoFiles = [
  ".editorconfig",
  ".gitattributes",
  ".github/dependabot.yml",
  ".github/workflows/validate.yml",
  ".github/workflows/release-check.yml",
  ".github/workflows/cross-platform.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/documentation.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/install_support.yml",
  ".github/pull_request_template.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "MAINTAINERS.md",
  "CODE_OF_CONDUCT.md",
  "NOTICE",
  "config/artifact-schemas.json",
  "scripts/doctor.mjs",
  "scripts/guided-install.mjs",
  "scripts/package-list.mjs",
  "scripts/package-audit.mjs",
  "scripts/safety-scan.mjs",
  "scripts/release-readiness.mjs",
  "scripts/manifest.mjs",
  "tools/init-memory-cache.mjs",
  "tools/validate-memory-cache.mjs",
  "tools/context-budget-audit.mjs",
  "tools/cleanup-appledouble.mjs",
  "tools/semantic-memory-index.mjs",
  "tools/semantic-workspace-evaluate.mjs",
  "tools/skill-agent-auditor.mjs",
  "templates/Memory Cache/project-state.md",
  "templates/Memory Cache/recovery-prompt.md",
  "templates/Memory Cache/session-heartbeat.md",
  "templates/Memory Cache/decision-log.md",
  "templates/Memory Cache/change-log.md",
  "templates/Memory Cache/source-map.md",
  "templates/Memory Cache/open-questions.md",
  "templates/Memory Cache/artifacts-index.md"
];
for (const file of requiredRepoFiles) {
  if (!existsSync(join(validationRoot, file))) addFinding("MISSING_REPO_FILE", `Required public repo file is missing: ${file}`, [join(validationRoot, file)]);
}

const requiredTestFiles = [
  "tests/audit-security.test.mjs",
  "tests/docs-validation.test.mjs",
  "tests/doctor-manifest.test.mjs",
  "tests/governance.test.mjs",
  "tests/install-onboarding.test.mjs",
  "tests/memory-cache.test.mjs",
  "tests/validation-contracts.test.mjs",
  "tests/validation-core.test.mjs",
  "tests/helpers.mjs"
];
for (const file of requiredTestFiles) {
  if (!existsSync(join(validationRoot, file))) addFinding("MISSING_TEST_SUITE_FILE", `Required focused test suite file is missing: ${file}`, [join(validationRoot, file)]);
}
const legacyMonolithTest = join(validationRoot, "tests/workflow-validation.test.mjs");
if (existsSync(legacyMonolithTest)) {
  addFinding("MONOLITHIC_TEST_SUITE", "Tests should stay split by concern instead of returning to the workflow-validation monolith.", [legacyMonolithTest]);
}

const contributingDoc = join(validationRoot, "CONTRIBUTING.md");
if (existsSync(contributingDoc)) {
  const text = read(contributingDoc);
  for (const phrase of ["default validate workflow", "Ubuntu with Node 20 and 22", "path-sensitive cross-platform workflow", "Ubuntu, macOS, and Windows with Node 20", ".editorconfig", ".gitattributes", "npm run secret:scan", "npm run package:list"]) {
    if (!text.includes(phrase)) addFinding("WEAK_CONTRIBUTING_CI_DOC", `Contributing guide must accurately describe CI coverage: ${phrase}`, [contributingDoc]);
  }
  if (/CI runs the same checks on Linux, macOS, and Windows with Node 20 and 22/.test(text)) {
    addFinding("WEAK_CONTRIBUTING_CI_DOC", "Contributing guide must not imply every PR runs cross-platform Node 20/22 checks.", [contributingDoc]);
  }
}

const pullRequestTemplate = join(validationRoot, ".github/pull_request_template.md");
if (existsSync(pullRequestTemplate)) {
  const text = read(pullRequestTemplate);
  for (const phrase of ["npm run check", "npm run secret:scan", "npm run syntax:check", "npm run agent:check", "npm run release:check", "npm run package:list", "No secrets", "Neutral role IDs", "Text-bearing image policy", "Release Impact"]) {
    if (!text.includes(phrase)) addFinding("WEAK_PULL_REQUEST_TEMPLATE", `Pull request template is missing required review phrase: ${phrase}`, [pullRequestTemplate]);
  }
}

const noticeFile = join(validationRoot, "NOTICE");
if (existsSync(noticeFile)) {
  const text = read(noticeFile);
  for (const phrase of ["FrameCore Works: Creative Workflow Skill Kit for Codex", "Apache-2.0", "third-party notices"]) {
    if (!text.includes(phrase)) addFinding("WEAK_NOTICE_FILE", `NOTICE is missing required redistribution phrase: ${phrase}`, [noticeFile]);
  }
}

const editorconfigFile = join(validationRoot, ".editorconfig");
if (existsSync(editorconfigFile)) {
  const text = read(editorconfigFile);
  for (const phrase of ["root = true", "charset = utf-8", "end_of_line = lf", "insert_final_newline = true", "trim_trailing_whitespace = true"]) {
    if (!text.includes(phrase)) addFinding("WEAK_REPO_FORMAT_CONFIG", `.editorconfig is missing required format rule: ${phrase}`, [editorconfigFile]);
  }
}

const gitattributesFile = join(validationRoot, ".gitattributes");
if (existsSync(gitattributesFile)) {
  const text = read(gitattributesFile);
  for (const phrase of ["* text=auto eol=lf", "*.png binary", "*.pdf binary"]) {
    if (!text.includes(phrase)) addFinding("WEAK_REPO_FORMAT_CONFIG", `.gitattributes is missing required normalization rule: ${phrase}`, [gitattributesFile]);
  }
}

const dependabotConfig = join(validationRoot, ".github/dependabot.yml");
if (existsSync(dependabotConfig)) {
  const text = read(dependabotConfig);
  for (const phrase of ["version: 2", "package-ecosystem: github-actions", "package-ecosystem: npm", "directory: /", "interval: weekly"]) {
    if (!text.includes(phrase)) addFinding("WEAK_DEPENDABOT_CONFIG", `Dependabot config is missing required phrase: ${phrase}`, [dependabotConfig]);
  }
}

const issueTemplateConfig = join(validationRoot, ".github/ISSUE_TEMPLATE/config.yml");
if (existsSync(issueTemplateConfig)) {
  const text = read(issueTemplateConfig);
  for (const phrase of ["blank_issues_enabled: false", "Security-sensitive report", "/security"]) {
    if (!text.includes(phrase)) addFinding("WEAK_ISSUE_TEMPLATE_HYGIENE", `Issue template config is missing required safety phrase: ${phrase}`, [issueTemplateConfig]);
  }
}

for (const issueTemplate of [
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/documentation.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/install_support.yml"
]) {
  const file = join(validationRoot, issueTemplate);
  if (existsSync(file)) {
    const text = read(file);
    for (const phrase of ["Do not include secrets", "private URLs", "private project context", "generated confidential outputs", "emails", "local machine paths"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ISSUE_TEMPLATE_HYGIENE", `Issue template is missing required privacy warning phrase: ${phrase}`, [file]);
    }
  }
}

const releaseDoc = join(validationRoot, "docs/release.md");
if (existsSync(releaseDoc)) {
  const sections = markdownSections(read(releaseDoc));
  for (const section of ["Purpose", "Release Principles", "Pre-Release Checklist", "Required Checks", "Package Contents Review", "Privacy And Provider-Neutral Gate", "Halt Conditions", "Maintainer Sign-Off", "Tag And Release Flow", "Release Check Workflow", "Rollback"]) {
    if (!sections.has(section)) addFinding("MISSING_RELEASE_DOC_SECTION", `Release guide is missing required section: ${section}`, [releaseDoc]);
  }
}

const supportDoc = join(validationRoot, "SUPPORT.md");
if (existsSync(supportDoc)) {
  const text = read(supportDoc);
  const sections = markdownSections(text);
  for (const section of ["What To Include"]) {
    if (!sections.has(section)) addFinding("WEAK_SUPPORT_DOC", `Support guide is missing required section: ${section}`, [supportDoc]);
  }
  for (const phrase of ["kit version", "operating system", "Node.js version", "install mode", "sanitized output", ".framecore/manifest.json", "SECURITY.md"]) {
    if (!text.includes(phrase)) addFinding("WEAK_SUPPORT_DOC", `Support guide is missing required triage phrase: ${phrase}`, [supportDoc]);
  }
}

const maintainersDoc = join(validationRoot, "MAINTAINERS.md");
if (existsSync(maintainersDoc)) {
  const text = read(maintainersDoc);
  const sections = markdownSections(text);
  for (const section of ["Maintainer Responsibilities", "Release Ownership", "Escalation"]) {
    if (!sections.has(section)) addFinding("WEAK_MAINTAINERS_DOC", `Maintainers guide is missing required section: ${section}`, [maintainersDoc]);
  }
  for (const phrase of ["provider-neutral Codex workflow kit", "npm run release:check", "npm run agent:check", "GitHub Actions validation", "package contents", "provider-neutral boundaries", "SECURITY.md", "SUPPORT.md"]) {
    if (!text.includes(phrase)) addFinding("WEAK_MAINTAINERS_DOC", `Maintainers guide is missing required ownership phrase: ${phrase}`, [maintainersDoc]);
  }
}

const securityDoc = join(validationRoot, "SECURITY.md");
if (existsSync(securityDoc)) {
  const text = read(securityDoc);
  const sections = markdownSections(text);
  for (const section of ["Supported Versions", "Reporting A Vulnerability", "Response Process", "Useful Evidence", "Release Checks", "Scope"]) {
    if (!sections.has(section)) addFinding("WEAK_SECURITY_DOC", `Security guide is missing required section: ${section}`, [securityDoc]);
  }
  for (const phrase of ["1.0.x", "private vulnerability reporting", "acknowledge", "sanitized", "version, tag, or commit SHA", "operating system and Node.js version", "npm run secret:scan", "npm run syntax:check", "npm run agent:check", "npm run package:list"]) {
    if (!text.includes(phrase)) addFinding("WEAK_SECURITY_DOC", `Security guide is missing required reporting phrase: ${phrase}`, [securityDoc]);
  }
}

const repositorySettingsDoc = join(validationRoot, "docs/repository-settings.md");
if (existsSync(repositorySettingsDoc)) {
  const text = read(repositorySettingsDoc);
  const sections = markdownSections(text);
  for (const section of ["Purpose", "Recommended Minimum", "Stronger PR Workflow", "GitHub Actions", "Public Issue Hygiene", "Before Release", "What Stays Optional", "When To Revisit"]) {
    if (!sections.has(section)) addFinding("WEAK_REPOSITORY_SETTINGS_DOC", `Repository settings guide is missing required section: ${section}`, [repositorySettingsDoc]);
  }
  for (const phrase of ["GitHub Desktop", "direct pushes", "Restrict deletions", "Block force pushes", "Require status checks", "read-only permissions", "repository secrets", "fork pull requests", "rotate exposed secrets", "npm run release:check", "npm run secret:scan", "npm run syntax:check", "npm run agent:check", "npm run package:audit", "npm run package:list"]) {
    if (!text.includes(phrase)) addFinding("WEAK_REPOSITORY_SETTINGS_DOC", `Repository settings guide is missing required maintenance phrase: ${phrase}`, [repositorySettingsDoc]);
  }
}

const packageJsonPath = join(validationRoot, "package.json");
if (existsSync(packageJsonPath)) {
  const scripts = JSON.parse(read(packageJsonPath)).scripts ?? {};
  const releaseCheck = scripts["release:check"] ?? "";
  if (!releaseCheck.includes("npm run check") || !releaseCheck.includes("npm run package:audit")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json release:check must run npm run check and npm run package:audit.", [packageJsonPath]);
  }
  if (!String(scripts["package:audit"] ?? "").includes("scripts/package-audit.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose package:audit using scripts/package-audit.mjs.", [packageJsonPath]);
  }
  if (!String(scripts["package:list"] ?? "").includes("scripts/package-list.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose package:list using scripts/package-list.mjs.", [packageJsonPath]);
  }
  if (!String(scripts["release:readiness"] ?? "").includes("scripts/release-readiness.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose release:readiness using scripts/release-readiness.mjs.", [packageJsonPath]);
  }
  if (!String(scripts["secret:scan"] ?? "").includes("scripts/safety-scan.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose secret:scan using scripts/safety-scan.mjs.", [packageJsonPath]);
  }
  if (!String(scripts["syntax:check"] ?? "").includes("scripts/syntax-check.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose syntax:check using scripts/syntax-check.mjs.", [packageJsonPath]);
  }
  if (!String(scripts["agent:check"] ?? "").includes("scripts/agent-compliance-check.mjs")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json must expose agent:check using scripts/agent-compliance-check.mjs.", [packageJsonPath]);
  }
  const requiredToolScripts = {
    "memory:init": "tools/init-memory-cache.mjs",
    "memory:validate": "tools/validate-memory-cache.mjs",
    "workflow:appledouble:audit:all": "tools/cleanup-appledouble.mjs",
    "workflow:appledouble:clean:all": "tools/cleanup-appledouble.mjs --apply",
    "workflow:context-budget": "tools/context-budget-audit.mjs",
    "semantic:index": "tools/semantic-memory-index.mjs --mode index",
    "semantic:query": "tools/semantic-memory-index.mjs --mode query",
    "semantic:embed": "tools/semantic-memory-index.mjs --mode embed",
    "workspace:evaluate:semantic": "tools/semantic-workspace-evaluate.mjs",
    "self:audit": "tools/skill-agent-auditor.mjs --mode audit",
    "self:improve:local": "tools/skill-agent-auditor.mjs --mode improve",
  };
  for (const [scriptName, expectedFragment] of Object.entries(requiredToolScripts)) {
    if (!String(scripts[scriptName] ?? "").includes(expectedFragment)) {
      addFinding("WEAK_TOOL_SCRIPT", `package.json must expose ${scriptName} using ${expectedFragment}.`, [packageJsonPath]);
    }
  }
  if (!releaseCheck.includes("npm run release:readiness")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json release:check must run npm run release:readiness.", [packageJsonPath]);
  }
  if (scripts.prepublishOnly !== "npm run release:check") {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json prepublishOnly must run npm run release:check.", [packageJsonPath]);
  }
  if (!String(scripts.check ?? "").includes("npm run secret:scan")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json check must run npm run secret:scan.", [packageJsonPath]);
  }
  if (!String(scripts.check ?? "").includes("npm run syntax:check")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json check must run npm run syntax:check.", [packageJsonPath]);
  }
  if (!String(scripts.check ?? "").includes("npm run agent:check")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json check must run npm run agent:check.", [packageJsonPath]);
  }
}

const unsafeWorkflowPatterns = [
  /pull_request_target/,
  /contents:\s*write/,
  /id-token:\s*write/,
  /packages:\s*write/,
  /\bsecrets\./,
  /\bnpm\s+publish\b/,
  /\bgh\s+release\s+create\b/,
  /softprops\/action-gh-release/,
  /actions\/upload-artifact/,
];

const validateWorkflow = join(validationRoot, ".github/workflows/validate.yml");
if (existsSync(validateWorkflow)) {
  const text = read(validateWorkflow);
  if (
    !text.includes("pull_request:") ||
    !text.includes("push:") ||
    !text.includes("branches: [main]") ||
    !text.includes("ubuntu-latest") ||
    !text.includes("node-version: [20, 22]") ||
    !text.includes("npm run audit:privacy") ||
    !text.includes("npm run secret:scan") ||
    !text.includes("npm run syntax:check") ||
    !text.includes("npm run validate") ||
    !text.includes("npm run agent:check") ||
    !text.includes("npm test") ||
    !text.includes("npm run package:audit") ||
    !/permissions:\s*\n\s*contents:\s*read/.test(text)
  ) {
    addFinding("WEAK_VALIDATE_WORKFLOW", "validate workflow must be push/PR-triggered, read-only, Linux-based, test Node 20/22, and run privacy audit, secret scan, validation, tests, and package audit.", [validateWorkflow]);
  }
  if (/\$\{\{\s*runner\./.test(text)) {
    addFinding("UNSAFE_VALIDATE_WORKFLOW", "validate workflow must not use runner context in workflow or job-level expressions.", [validateWorkflow]);
  }
  if (unsafeWorkflowPatterns.some((pattern) => pattern.test(text))) {
    addFinding("UNSAFE_VALIDATE_WORKFLOW", "validate workflow must not publish, upload artifacts, use secrets, or request write permissions.", [validateWorkflow]);
  }
}

const releaseWorkflow = join(validationRoot, ".github/workflows/release-check.yml");
if (existsSync(releaseWorkflow)) {
  const text = read(releaseWorkflow);
  if (!text.includes("workflow_dispatch") || !text.includes("tags:") || !text.includes("npm run release:check") || !text.includes("node-version: [20, 22]") || !/permissions:\s*\n\s*contents:\s*read/.test(text)) {
    addFinding("WEAK_RELEASE_WORKFLOW", "release-check workflow must be manual/tag-triggered, read-only, test Node 20/22, and run npm run release:check.", [releaseWorkflow]);
  }
  if (unsafeWorkflowPatterns.some((pattern) => pattern.test(text))) {
    addFinding("UNSAFE_RELEASE_WORKFLOW", "release-check workflow must not publish, upload artifacts, use secrets, or request write permissions.", [releaseWorkflow]);
  }
}

const crossPlatformWorkflow = join(validationRoot, ".github/workflows/cross-platform.yml");
if (existsSync(crossPlatformWorkflow)) {
  const text = read(crossPlatformWorkflow);
  if (
    !text.includes("workflow_dispatch") ||
    !text.includes("pull_request:") ||
    !text.includes("paths:") ||
    !text.includes("scripts/**") ||
    !text.includes("tests/**") ||
    !text.includes("config/**") ||
    !text.includes("ubuntu-latest") ||
    !text.includes("macos-latest") ||
    !text.includes("windows-latest") ||
    !text.includes("npm run secret:scan") ||
    !text.includes("npm run syntax:check") ||
    !text.includes("npm run agent:check") ||
    !text.includes("npm run smoke:install") ||
    !text.includes("npm run package:audit") ||
    !/permissions:\s*\n\s*contents:\s*read/.test(text)
  ) {
    addFinding("WEAK_CROSS_PLATFORM_WORKFLOW", "cross-platform workflow must be manual and path-triggered, read-only, cover Ubuntu, macOS, and Windows, and run smoke install plus package audit.", [crossPlatformWorkflow]);
  }
  if (unsafeWorkflowPatterns.some((pattern) => pattern.test(text))) {
    addFinding("UNSAFE_CROSS_PLATFORM_WORKFLOW", "cross-platform workflow must not publish, upload artifacts, use secrets, or request write permissions.", [crossPlatformWorkflow]);
  }
}

const exampleReadmes = walkFiles(join(validationRoot, "examples"))
  .filter((file) => !isAppleDouble(file) && file.endsWith("README.md") && relativePosix(validationRoot, file) !== "examples/README.md");
const requiredExampleDirectories = [
  "minimal-workflow",
  "static-campaign",
  "ecommerce-product-visual",
  "video-storyboard",
  "storyboard-board",
  "hyperframes-video",
  "image-prompt-pack",
  "document-workflow",
  "qa-delivery-review",
  "no-provider-mode",
  "end-to-end-creative-workflow"
];
for (const example of requiredExampleDirectories) {
  for (const file of ["README.md", "workflow.json"]) {
    const exampleFile = join(validationRoot, "examples", example, file);
    if (!existsSync(exampleFile)) addFinding("MISSING_REQUIRED_EXAMPLE", `Required example is missing file: examples/${example}/${file}`, [exampleFile]);
  }
}
const requiredExampleSections = [
  "## Purpose",
  "## Starting User Request",
  "## Inputs And Assumptions",
  "## Agent Route",
  "## Gate Sequence",
  "## Artifacts Produced",
  "## Example Output Skeleton",
  "## QA Checklist",
  "## Failure Or Loopback Case",
  "## Privacy And No-Private-Content Note",
  "## Related Docs And Skills"
];
for (const file of exampleReadmes) {
  const text = read(file);
  for (const section of requiredExampleSections) {
    if (!text.includes(section)) addFinding("WEAK_EXAMPLE_STRUCTURE", `Example is missing required section: ${section}`, [file]);
  }
}

for (const readmePath of exampleReadmes) {
  const exampleDir = dirname(readmePath);
  const workflowPath = join(exampleDir, "workflow.json");
  const expectedId = basename(exampleDir);
  if (!existsSync(workflowPath)) {
    addFinding("MISSING_EXAMPLE_WORKFLOW", `Example is missing workflow.json: ${expectedId}`, [readmePath]);
    continue;
  }
  let workflow = null;
  try {
    workflow = JSON.parse(read(workflowPath));
  } catch (error) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow.json must be valid JSON: ${error.message}`, [workflowPath]);
    continue;
  }
  if (!isPlainObject(workflow)) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow.json must be a JSON object.", [workflowPath]);
    continue;
  }
  if (workflow.schema_version !== 1) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow schema_version must be 1.", [workflowPath]);
  }
  if (workflow.example_id !== expectedId) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow example_id must match folder name: ${expectedId}`, [workflowPath]);
  }
  if (typeof workflow.blueprint !== "string" || workflow.blueprint.trim().length === 0) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define blueprint.", [workflowPath]);
  } else if (!knownWorkflowBlueprints.has(workflow.blueprint)) {
    addFinding("UNKNOWN_EXAMPLE_BLUEPRINT", `Example workflow blueprint is not listed in workflow blueprints: ${workflow.blueprint}`, [workflowPath, workflowBlueprints]);
  } else {
    const blueprintContract = workflowBlueprintContracts.get(workflow.blueprint);
    if (blueprintContract) {
      const routeSet = new Set(Array.isArray(workflow.route) ? workflow.route : []);
      const gateSet = new Set(Array.isArray(workflow.gates) ? workflow.gates : []);
      for (const role of blueprintContract.requiredRoles) {
        if (!routeSet.has(role)) {
          addFinding("MISSING_EXAMPLE_BLUEPRINT_ROLE", `Example workflow route is missing required blueprint role: ${role}`, [workflowPath, workflowBlueprints]);
        }
      }
      for (const gate of blueprintContract.requiredGates) {
        if (!gateSet.has(gate)) {
          addFinding("MISSING_EXAMPLE_BLUEPRINT_GATE", `Example workflow gates are missing required blueprint gate: ${gate}`, [workflowPath, workflowBlueprints]);
        }
      }
    }
  }
  if (typeof workflow.execution_boundary !== "string" || workflow.execution_boundary.trim().length === 0) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define execution_boundary.", [workflowPath]);
  }
  for (const [field, allowedSet, code] of [
    ["route", requiredRoleSet, "UNKNOWN_EXAMPLE_ROLE"],
    ["gates", new Set(knownGates.keys()), "UNKNOWN_EXAMPLE_GATE"],
    ["artifacts", artifactSchemaNames, "UNKNOWN_EXAMPLE_ARTIFACT"]
  ]) {
    if (!Array.isArray(workflow[field]) || workflow[field].length === 0) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow must define non-empty ${field}.`, [workflowPath]);
      continue;
    }
    for (const value of workflow[field]) {
      if (typeof value !== "string" || value.trim().length === 0) {
        addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow ${field} must contain non-empty strings.`, [workflowPath]);
      } else if (!allowedSet.has(value)) {
        addFinding(code, `Example workflow ${field} contains unknown value: ${value}`, [workflowPath]);
      }
    }
  }
  if (!Array.isArray(workflow.handoffs)) {
    addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define handoffs as an array.", [workflowPath]);
  } else {
    const declaredHandoffs = new Set(workflow.handoffs);
    if (Array.isArray(workflow.route)) {
      for (let index = 0; index < workflow.route.length - 1; index += 1) {
        const from = workflow.route[index];
        const to = workflow.route[index + 1];
        if (typeof from !== "string" || typeof to !== "string") continue;
        const pair = `${from}->${to}`;
        if (!knownHandoffPairs.has(pair)) {
          addFinding("UNKNOWN_EXAMPLE_ROUTE_HANDOFF", `Example workflow route step is not listed in handoff matrix: ${pair}`, [workflowPath, handoffMatrix]);
        } else if (!declaredHandoffs.has(pair)) {
          addFinding("MISSING_EXAMPLE_ROUTE_HANDOFF", `Example workflow route step must be declared in handoffs: ${pair}`, [workflowPath]);
        }
      }
    }
    for (const pair of workflow.handoffs) {
      if (typeof pair !== "string" || !/^[a-z0-9-]+->[a-z0-9-]+$/.test(pair)) {
        addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow handoff must use from->to format: ${pair}`, [workflowPath]);
        continue;
      }
      const [from, to] = pair.split("->");
      if (!requiredRoleSet.has(from) || !requiredRoleSet.has(to)) {
        addFinding("UNKNOWN_EXAMPLE_ROLE", `Example workflow handoff references unknown role: ${pair}`, [workflowPath]);
      } else if (!knownHandoffPairs.has(pair)) {
        addFinding("UNKNOWN_EXAMPLE_HANDOFF", `Example workflow handoff is not listed in handoff matrix: ${pair}`, [workflowPath, handoffMatrix]);
      }
    }
  }
}

const endToEndFiles = [
  "examples/end-to-end-creative-workflow/README.md",
  "examples/end-to-end-creative-workflow/artifacts/task-confirmation.md",
  "examples/end-to-end-creative-workflow/artifacts/brief-contract.md",
  "examples/end-to-end-creative-workflow/artifacts/reference-pack.md",
  "examples/end-to-end-creative-workflow/artifacts/direction-contract.md",
  "examples/end-to-end-creative-workflow/artifacts/prompt-pack.md",
  "examples/end-to-end-creative-workflow/artifacts/qa-iteration-report.md",
  "examples/end-to-end-creative-workflow/artifacts/delivery-manifest.md"
];
for (const file of endToEndFiles) {
  if (!existsSync(join(validationRoot, file))) addFinding("MISSING_END_TO_END_EXAMPLE", `End-to-end example file is missing: ${file}`, [join(validationRoot, file)]);
}

const readme = read(join(validationRoot, "README.md"));
for (const target of [...requiredDocs, ...exampleReadmes.map((file) => relativePosix(validationRoot, file))]) {
  if (!readme.includes(`](${target})`)) {
    addFinding("README_MISSING_DOC_LINK", `README must link to ${target}`, [join(validationRoot, "README.md")]);
  }
}

validateMarkdownLinks(walkFiles(validationRoot).filter((file) => !isAppleDouble(file) && file.endsWith(".md")));

const instructionFacingFiles = new Set();
for (const file of ["README.md", "AGENTS.template.md", "CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md"]) {
  const absolute = join(validationRoot, file);
  if (existsSync(absolute)) instructionFacingFiles.add(absolute);
}
for (const directory of ["docs", "examples", ".agents", ".codex"]) {
  const absolute = join(validationRoot, directory);
  for (const file of walkFiles(absolute)) {
    if (!isAppleDouble(file) && /\.(md|ya?ml|json|template)$/.test(file)) instructionFacingFiles.add(file);
  }
}
validateInstructionOverridePhrases([...instructionFacingFiles]);

const textPolicy = read(join(validationRoot, "config/text-image-policy.json"));
if (!textPolicy.includes("gpt-image-2") || !textPolicy.includes("native Codex/ChatGPT image generator") || !textPolicy.includes("one-pass generation")) {
  addFinding("WEAK_TEXT_IMAGE_POLICY", "Text-image policy is missing required native generator, model reference, or one-pass rule.", [join(validationRoot, "config/text-image-policy.json")]);
}

process.exit(reportFindings(findings, "workflow validation passed"));
