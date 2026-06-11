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
  "tests/workflow-smoke.test.mjs",
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
