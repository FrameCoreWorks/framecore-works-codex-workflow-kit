#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { hasHelpFlag, printHelpAndExit, repoRoot, reportFindings, walkFiles } from "./common.mjs";

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
  findings.push({ code, message, files: files.map((file) => relative(validationRoot, file)) });
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

function anchorsFor(text) {
  const anchors = new Set();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    anchors.add(markdownSlug(match[1]));
  }
  return anchors;
}

function validateMarkdownLinks(files) {
  for (const file of files) {
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
const artifactTemplates = join(validationRoot, ".agents/skills/pipeline-core/templates/artifact-templates.md");
for (const file of [gateRegistry, handoffMatrix, artifactTemplates]) {
  if (!existsSync(file)) addFinding("MISSING_PIPELINE_FILE", "Required pipeline core file is missing.", [file]);
}

if (existsSync(gateRegistry)) {
  const text = read(gateRegistry);
  if (!text.includes("| Gate | Owner role | Required artifact |")) {
    addFinding("WEAK_GATE_TABLE", "Gate registry must use columns: Gate, Owner role, Required artifact.", [gateRegistry]);
  }
  const gateRows = parseMarkdownTable(text, ["gate", "ownerRoles", "requiredArtifact"]);
  const seenGates = new Set();
  const gates = new Map(gateRows.map((row) => [row.gate, row]));
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
  for (const pair of ["intent-confirmation->workflow-orchestrator", "workflow-orchestrator->instruction-packet-factory", "image-prompting->tool-routing-cost", "video-prompting->tool-routing-cost", "qa-iteration->delivery-documentation"]) {
    if (!handoffPairs.has(pair)) {
      addFinding("MISSING_HANDOFF", `Required handoff is missing: ${pair}`, [handoffMatrix]);
    }
  }
}

if (existsSync(artifactTemplates)) {
  const text = read(artifactTemplates);
  const sections = markdownSections(text);
  for (const section of ["Task Confirmation", "Brief Contract", "Reference Pack", "Instruction Packet", "Storyboard Contract", "Board Artifact Prompt", "Prompt Pack", "Execution Manifest", "QA / Iteration Report", "Delivery Manifest"]) {
    if (!sections.has(section)) addFinding("MISSING_TEMPLATE_SECTION", `Artifact template section is missing: ${section}`, [artifactTemplates]);
  }
}

const requiredDocs = [
  "docs/quickstart.md",
  "docs/troubleshooting.md",
  "docs/release.md",
  "docs/architecture.md",
  "docs/workflow-stages.md",
  "docs/onboarding.md",
  "docs/customization.md",
  "docs/text-image-policy.md",
  "docs/hipson-integration.md",
  "docs/hyperframes.md",
  "docs/recurring-workflow-review.md",
  "docs/workflow-self-improvement.md",
  "docs/migration-guide.md",
  "docs/agent-roster.md",
  "examples/README.md"
];
for (const doc of requiredDocs) {
  if (!existsSync(join(validationRoot, doc))) addFinding("MISSING_DOC", `Required documentation file is missing: ${doc}`, [join(validationRoot, doc)]);
}

const requiredRepoFiles = [
  ".github/workflows/validate.yml",
  ".github/workflows/release-check.yml",
  ".github/ISSUE_TEMPLATE/install_support.yml",
  ".github/pull_request_template.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "CODE_OF_CONDUCT.md"
];
for (const file of requiredRepoFiles) {
  if (!existsSync(join(validationRoot, file))) addFinding("MISSING_REPO_FILE", `Required public repo file is missing: ${file}`, [join(validationRoot, file)]);
}

const releaseDoc = join(validationRoot, "docs/release.md");
if (existsSync(releaseDoc)) {
  const sections = markdownSections(read(releaseDoc));
  for (const section of ["Purpose", "Release Principles", "Pre-Release Checklist", "Required Checks", "Package Contents Review", "Privacy And Provider-Neutral Gate", "Halt Conditions", "Maintainer Sign-Off", "Tag And Release Flow", "Release Check Workflow", "Rollback"]) {
    if (!sections.has(section)) addFinding("MISSING_RELEASE_DOC_SECTION", `Release guide is missing required section: ${section}`, [releaseDoc]);
  }
}

const packageJsonPath = join(validationRoot, "package.json");
if (existsSync(packageJsonPath)) {
  const releaseCheck = JSON.parse(read(packageJsonPath)).scripts?.["release:check"] ?? "";
  if (!releaseCheck.includes("npm run check") || !releaseCheck.includes("npm pack --dry-run")) {
    addFinding("WEAK_RELEASE_CHECK_SCRIPT", "package.json release:check must run npm run check and npm pack --dry-run.", [packageJsonPath]);
  }
}

const releaseWorkflow = join(validationRoot, ".github/workflows/release-check.yml");
if (existsSync(releaseWorkflow)) {
  const text = read(releaseWorkflow);
  if (!text.includes("workflow_dispatch") || !text.includes("tags:") || !text.includes("npm run release:check") || !/permissions:\s*\n\s*contents:\s*read/.test(text)) {
    addFinding("WEAK_RELEASE_WORKFLOW", "release-check workflow must be manual/tag-triggered, read-only, and run npm run release:check.", [releaseWorkflow]);
  }
  const unsafePatterns = [
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
  if (unsafePatterns.some((pattern) => pattern.test(text))) {
    addFinding("UNSAFE_RELEASE_WORKFLOW", "release-check workflow must not publish, upload artifacts, use secrets, or request write permissions.", [releaseWorkflow]);
  }
}

const exampleReadmes = walkFiles(join(validationRoot, "examples"))
  .filter((file) => file.endsWith("README.md") && relative(validationRoot, file).replaceAll("\\", "/") !== "examples/README.md");
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
for (const target of [...requiredDocs, ...exampleReadmes.map((file) => relative(validationRoot, file).replaceAll("\\", "/"))]) {
  if (!readme.includes(`](${target})`)) {
    addFinding("README_MISSING_DOC_LINK", `README must link to ${target}`, [join(validationRoot, "README.md")]);
  }
}

validateMarkdownLinks(walkFiles(validationRoot).filter((file) => file.endsWith(".md")));

const textPolicy = read(join(validationRoot, "config/text-image-policy.json"));
if (!textPolicy.includes("gpt-image-2") || !textPolicy.includes("native Codex/ChatGPT image generator") || !textPolicy.includes("one-pass generation")) {
  addFinding("WEAK_TEXT_IMAGE_POLICY", "Text-image policy is missing required native generator, model reference, or one-pass rule.", [join(validationRoot, "config/text-image-policy.json")]);
}

process.exit(reportFindings(findings, "workflow validation passed"));
