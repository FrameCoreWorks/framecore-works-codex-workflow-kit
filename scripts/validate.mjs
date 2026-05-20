#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { repoRoot, reportFindings, walkFiles } from "./common.mjs";

const findings = [];

function addFinding(code, message, files) {
  findings.push({ code, message, files: files.map((file) => relative(repoRoot, file)) });
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

const requiredRoles = JSON.parse(readFileSync(join(repoRoot, "config/agent-naming.schema.json"), "utf8")).roles;
const agentDir = join(repoRoot, ".codex/agents");
const missingAgents = requiredRoles
  .map((role) => join(agentDir, `${role}.toml.template`))
  .filter((path) => !existsSync(path));
if (missingAgents.length > 0) {
  addFinding("MISSING_AGENT_TEMPLATE", "Required role-based agent template is missing.", missingAgents);
}

for (const role of requiredRoles) {
  const file = join(agentDir, `${role}.toml.template`);
  if (!existsSync(file)) continue;
  const text = read(file);
  for (const marker of ["Role:", "Scope:", "Inputs:", "Outputs:", "Forbidden:", "Review gate:", "Handoff rules:"]) {
    if (!text.includes(marker)) {
      addFinding("WEAK_AGENT_TEMPLATE", `Agent template ${role} is missing marker ${marker}`, [file]);
    }
  }
}

const skillFiles = walkFiles(join(repoRoot, ".agents/skills")).filter((file) => file.endsWith("SKILL.md"));
if (skillFiles.length < 25) {
  addFinding("MISSING_SKILLS", "Expected full skill pack is incomplete.", [join(repoRoot, ".agents/skills")]);
}
for (const file of skillFiles) {
  const text = read(file);
  if (!/^---\nname:\s*[-a-z0-9]+/m.test(text) || !/\ndescription:\s*/m.test(text)) {
    addFinding("INVALID_SKILL_FRONTMATTER", "Skill frontmatter must include name and description.", [file]);
  }
}

const gateRegistry = join(repoRoot, ".agents/skills/pipeline-core/references/gate-registry.md");
const handoffMatrix = join(repoRoot, ".agents/skills/pipeline-core/references/handoff-matrix.md");
const artifactTemplates = join(repoRoot, ".agents/skills/pipeline-core/templates/artifact-templates.md");
for (const file of [gateRegistry, handoffMatrix, artifactTemplates]) {
  if (!existsSync(file)) addFinding("MISSING_PIPELINE_FILE", "Required pipeline core file is missing.", [file]);
}

if (existsSync(gateRegistry)) {
  const text = read(gateRegistry);
  for (const gate of ["intent_lock", "workflow_route", "brief_completeness", "reference_authority_fit", "evidence_fit", "instruction_packet_fit", "direction_fit", "structure_fit", "storyboard_board_fit", "copy_fit", "promptability_fit", "schema_pricing_fit", "execution_manifest_fit", "asset_manifest_fit", "post_execution_fit", "delivery_fit"]) {
    if (!text.includes(`\`${gate}\``)) addFinding("MISSING_GATE", `Gate is missing: ${gate}`, [gateRegistry]);
  }
}

if (existsSync(handoffMatrix)) {
  const text = read(handoffMatrix);
  for (const fragment of ["intent-confirmation | workflow-orchestrator", "image-prompting | tool-routing-cost", "video-prompting | tool-routing-cost", "qa-iteration | delivery-documentation", "instruction-packet-factory"]) {
    if (!text.includes(fragment)) addFinding("MISSING_HANDOFF", `Handoff fragment is missing: ${fragment}`, [handoffMatrix]);
  }
}

if (existsSync(artifactTemplates)) {
  const text = read(artifactTemplates);
  for (const section of ["Task Confirmation", "Brief Contract", "Reference Pack", "Instruction Packet", "Prompt Pack", "Execution Manifest", "QA / Iteration Report", "Delivery Manifest"]) {
    if (!text.includes(`## ${section}`)) addFinding("MISSING_TEMPLATE_SECTION", `Artifact template section is missing: ${section}`, [artifactTemplates]);
  }
}

const requiredDocs = [
  "docs/quickstart.md",
  "docs/troubleshooting.md",
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
  "docs/agent-roster.md"
];
for (const doc of requiredDocs) {
  if (!existsSync(join(repoRoot, doc))) addFinding("MISSING_DOC", `Required documentation file is missing: ${doc}`, [join(repoRoot, doc)]);
}

const exampleReadmes = walkFiles(join(repoRoot, "examples")).filter((file) => file.endsWith("README.md"));
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
  if (!existsSync(join(repoRoot, file))) addFinding("MISSING_END_TO_END_EXAMPLE", `End-to-end example file is missing: ${file}`, [join(repoRoot, file)]);
}

const readme = read(join(repoRoot, "README.md"));
for (const target of [...requiredDocs, ...exampleReadmes.map((file) => relative(repoRoot, file).replaceAll("\\", "/"))]) {
  if (!readme.includes(`](${target})`)) {
    addFinding("README_MISSING_DOC_LINK", `README must link to ${target}`, [join(repoRoot, "README.md")]);
  }
}

validateMarkdownLinks(walkFiles(repoRoot).filter((file) => file.endsWith(".md")));

const textPolicy = read(join(repoRoot, "config/text-image-policy.json"));
if (!textPolicy.includes("gpt-image-2") || !textPolicy.includes("native Codex/ChatGPT image generator") || !textPolicy.includes("one-pass generation")) {
  addFinding("WEAK_TEXT_IMAGE_POLICY", "Text-image policy is missing required native generator, model reference, or one-pass rule.", [join(repoRoot, "config/text-image-policy.json")]);
}

process.exit(reportFindings(findings, "workflow validation passed"));
