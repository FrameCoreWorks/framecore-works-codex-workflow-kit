#!/usr/bin/env node
import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { hasHelpFlag, isAppleDouble, printHelpAndExit, relativePosix, repoRoot, reportFindings, walkFiles } from "./common.mjs";
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
const inferenceReasoningMethods = join(validationRoot, ".agents/skills/pipeline-core/references/inference-reasoning-methods.md");
const artifactTemplates = join(validationRoot, ".agents/skills/pipeline-core/templates/artifact-templates.md");
const artifactSchemasPath = join(validationRoot, "config/artifact-schemas.json");
const bundleMapPath = join(validationRoot, "config/bundle-map.json");
const paths = {
  gateRegistry,
  handoffMatrix,
  workflowBlueprints,
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
