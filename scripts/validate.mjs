#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { hasHelpFlag, isAppleDouble, printHelpAndExit, repoRoot, reportFindings, walkFiles } from "./common.mjs";
import {
  anchorsFor,
  appearsInOrder,
  artifactAlternatives,
  artifactFieldSet,
  backtickTokens,
  cleanCell,
  createFindings,
  isPlainObject,
  markdownSectionBody,
  markdownSections,
  markdownSlug,
  parseMarkdownTable,
  read
} from "./validate/context.mjs";
import { run as validateAgents } from "./validate/agents.mjs";
import { run as validateBundles } from "./validate/bundles.mjs";
import { run as validateContracts } from "./validate/contracts.mjs";
import { run as validateDocs } from "./validate/docs.mjs";
import { run as validateExamples } from "./validate/examples.mjs";
import { run as validateInstructionOverridePhrases } from "./validate/injection.mjs";
import { run as validateMarkdownLinks } from "./validate/links.mjs";
import { run as validateRepoGovernance } from "./validate/repo-governance.mjs";
import { run as validateSchemas } from "./validate/schemas.mjs";
import { run as validateSkills } from "./validate/skills.mjs";

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
const { findings, addFinding } = createFindings(validationRoot);
const helpers = {
  anchorsFor,
  appearsInOrder,
  artifactAlternatives,
  artifactFieldSet,
  backtickTokens,
  cleanCell,
  createFindings,
  isPlainObject,
  markdownSectionBody,
  markdownSections,
  markdownSlug,
  parseMarkdownTable,
  read
};

const agentState = validateAgents({ root: validationRoot, helpers });
findings.push(...agentState.findings);
const { requiredRoles, requiredRoleSet, agentDir, agentTemplateGates } = agentState;

const skillState = validateSkills({ root: validationRoot, helpers });
findings.push(...skillState.findings);
const { knownSkillNames } = skillState;

const gateRegistry = join(validationRoot, ".agents/skills/pipeline-core/references/gate-registry.md");
const handoffMatrix = join(validationRoot, ".agents/skills/pipeline-core/references/handoff-matrix.md");
const workflowBlueprints = join(validationRoot, ".agents/skills/pipeline-core/references/workflow-blueprints.md");
const loopProtocol = join(validationRoot, ".agents/skills/pipeline-core/references/loop-protocol.md");
const inferenceReasoningMethods = join(validationRoot, ".agents/skills/pipeline-core/references/inference-reasoning-methods.md");
const artifactTemplates = join(validationRoot, ".agents/skills/pipeline-core/templates/artifact-templates.md");
const artifactSchemasPath = join(validationRoot, "config/artifact-schemas.json");
const bundleMapPath = join(validationRoot, "config/bundle-map.json");
const paths = {
  gateRegistry,
  handoffMatrix,
  workflowBlueprints,
  loopProtocol,
  inferenceReasoningMethods,
  artifactTemplates,
  artifactSchemasPath,
  bundleMapPath
};

const schemaState = validateSchemas({ root: validationRoot, helpers, paths });
findings.push(...schemaState.findings);
const { artifactSchemaNames } = schemaState;

const bundleState = validateBundles({
  root: validationRoot,
  helpers,
  paths,
  knownSkillNames,
  requiredRoleSet
});
findings.push(...bundleState.findings);

const contractState = validateContracts({
  root: validationRoot,
  helpers,
  paths,
  requiredRoleSet,
  agentTemplateGates,
  agentDir,
  artifactSchemaNames
});
findings.push(...contractState.findings);
const { knownGates, knownHandoffPairs, knownWorkflowBlueprints, workflowBlueprintContracts } = contractState;

const docsState = validateDocs({ root: validationRoot, helpers, requiredRoles });
findings.push(...docsState.findings);
const { requiredDocs } = docsState;

const repoGovernanceState = validateRepoGovernance({ root: validationRoot, helpers });
findings.push(...repoGovernanceState.findings);

const exampleState = validateExamples({
  root: validationRoot,
  helpers,
  paths,
  requiredDocs,
  requiredRoleSet,
  artifactSchemaNames,
  knownGates,
  knownHandoffPairs,
  knownWorkflowBlueprints,
  workflowBlueprintContracts
});
findings.push(...exampleState.findings);

findings.push(...validateMarkdownLinks({
  root: validationRoot,
  helpers,
  files: walkFiles(validationRoot).filter((file) => !isAppleDouble(file) && file.endsWith(".md"))
}));

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
findings.push(...validateInstructionOverridePhrases({
  root: validationRoot,
  helpers,
  files: [...instructionFacingFiles]
}));

const textPolicy = read(join(validationRoot, "config/text-image-policy.json"));
if (!textPolicy.includes("gpt-image-2") || !textPolicy.includes("openai/gpt-image-2") || !textPolicy.includes("native Codex/ChatGPT image generator") || !textPolicy.includes("by default for generated static raster graphics") || !textPolicy.includes("Python-generated artwork") || !textPolicy.includes("one-pass generation")) {
  addFinding("WEAK_TEXT_IMAGE_POLICY", "Text-image policy is missing required native generator, model reference, or one-pass rule.", [join(validationRoot, "config/text-image-policy.json")]);
}

process.exit(reportFindings(findings, "workflow validation passed"));
