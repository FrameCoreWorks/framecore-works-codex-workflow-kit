import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

test("validation rejects weak onboarding guide and assisted install prompt", () => {
  const dir = copyRepoFixture("framecore-validate-onboarding-docs-");
  const readme = join(dir, "README.md");
  const onboardingDoc = join(dir, "docs/onboarding.md");
  const quickstartDoc = join(dir, "docs/quickstart.md");
  writeFileSync(
    readme,
    readFileSync(readme, "utf8")
      .replaceAll(", docs/quickstart.md,", "")
      .replaceAll("Run doctor/preflight", "Run install dry-run")
  );
  writeFileSync(
    onboardingDoc,
    readFileSync(onboardingDoc, "utf8")
      .replace("## Interactive Questions", "## Setup Questions")
      .replace("does not clone, install, or activate full Hipson", "may install full Hipson")
  );
  writeFileSync(quickstartDoc, readFileSync(quickstartDoc, "utf8").replaceAll("project-local only", "project-local"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_README_INSTALL_PROMPT/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_ONBOARDING_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_INSTALL_PROMPT/);
});

test("validation rejects weak team configuration guide", () => {
  const dir = copyRepoFixture("framecore-validate-team-configuration-");
  const doc = join(dir, "docs/team-configuration.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Shared Team Install", "## Shared Setup")
      .replace("Do not commit these by default", "Avoid these files")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_TEAM_CONFIGURATION_DOC/);
});

test("validation rejects weak customization guide", () => {
  const dir = copyRepoFixture("framecore-validate-customization-");
  const doc = join(dir, "docs/customization.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Delivery Preferences", "## Delivery")
      .replace("safe relative path", "path")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CUSTOMIZATION_DOC/);
});

test("validation rejects weak migration guide", () => {
  const dir = copyRepoFixture("framecore-validate-migration-guide-");
  const doc = join(dir, "docs/migration-guide.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Validation Checklist", "## Checks")
      .replace("do not migrate provider credentials", "migrate provider settings when useful")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_MIGRATION_GUIDE/);
});

test("validation rejects weak Codex-assisted install guide", () => {
  const dir = copyRepoFixture("framecore-validate-codex-assisted-install-");
  const doc = join(dir, "docs/codex-assisted-install.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Stop Conditions", "## Notes")
      .replace("temporary or tools folder outside the target workspace", "temporary or tools folder")
      .replace("Install project-local only", "Install")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CODEX_ASSISTED_INSTALL_DOC/);
});

test("validation rejects weak post-install usage guide", () => {
  const dir = copyRepoFixture("framecore-validate-using-the-kit-");
  const doc = join(dir, "docs/using-the-kit.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Starter Prompts", "## Prompts")
      .replace("does not clone, install, or activate full Hipson", "may install full Hipson")
      .replace("Do not use external execution tools", "Use tools when helpful")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_USING_THE_KIT_DOC/);
});

test("validation rejects weak example authoring guide", () => {
  const dir = copyRepoFixture("framecore-validate-example-authoring-");
  const doc = join(dir, "docs/example-authoring.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## `workflow.json` Contract", "## Workflow File")
      .replace("neutral role IDs", "role names")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_EXAMPLE_AUTHORING_DOC/);
});

test("validation rejects weak agent roster guide", () => {
  const dir = copyRepoFixture("framecore-validate-agent-roster-");
  const doc = join(dir, "docs/agent-roster.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## How Role Selection Works", "## Role Notes")
      .replace("`workflow-orchestrator`", "`route-owner`")
      .replace("local display names", "local names")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_AGENT_ROSTER_DOC/);
});

test("validation rejects weak compatibility documentation", () => {
  const dir = copyRepoFixture("framecore-validate-compatibility-");
  const compatibilityDoc = join(dir, "docs/compatibility.md");
  writeFileSync(
    compatibilityDoc,
    readFileSync(compatibilityDoc, "utf8")
      .replace("## Runtime Requirements", "## Runtime")
      .replace("Node.js 20 or newer", "Node.js")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_COMPATIBILITY_DOC/);
});

test("validation rejects weak FAQ documentation", () => {
  const dir = copyRepoFixture("framecore-validate-faq-");
  const faqDoc = join(dir, "docs/faq.md");
  writeFileSync(
    faqDoc,
    readFileSync(faqDoc, "utf8")
      .replace("## Provider And Safety Questions", "## Provider Questions")
      .replaceAll("GitHub Desktop", "desktop client")
      .replace("does not clone, install, or activate full Hipson", "can install full Hipson")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_FAQ_DOC/);
});

test("validation rejects weak CLI reference documentation", () => {
  const dir = copyRepoFixture("framecore-validate-cli-reference-");
  const cliReferenceDoc = join(dir, "docs/cli-reference.md");
  writeFileSync(
    cliReferenceDoc,
    readFileSync(cliReferenceDoc, "utf8")
      .replace("## Mutating Commands", "## Write Commands")
      .replace("Do not enable external execution providers", "Enable providers when useful")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CLI_REFERENCE_DOC/);
});

test("validation rejects weak artifact schema and workflow stage guides", () => {
  const dir = copyRepoFixture("framecore-validate-workflow-contract-docs-");
  const artifactSchemasDoc = join(dir, "docs/artifact-schemas.md");
  const workflowStagesDoc = join(dir, "docs/workflow-stages.md");
  writeFileSync(
    artifactSchemasDoc,
    readFileSync(artifactSchemasDoc, "utf8")
      .replace("## Schema Contract", "## Schema Notes")
      .replace("provider-neutral", "tool-specific")
  );
  writeFileSync(
    workflowStagesDoc,
    readFileSync(workflowStagesDoc, "utf8")
      .replace("## Stage Matrix", "## Stages")
      .replace("handoff matrix", "handoff list")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_ARTIFACT_SCHEMAS_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_WORKFLOW_STAGES_DOC/);
});

test("validation rejects weak provider-neutral boundary documentation", () => {
  const dir = copyRepoFixture("framecore-validate-provider-neutral-boundary-");
  const providerNeutralDoc = join(dir, "docs/provider-neutral-boundary.md");
  writeFileSync(
    providerNeutralDoc,
    readFileSync(providerNeutralDoc, "utf8")
      .replace("## Built-In Chat Image Exception", "## Image Notes")
      .replace("## Decision Matrix", "## Boundary List")
      .replace("provider credentials", "credentials")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_PROVIDER_NEUTRAL_BOUNDARY_DOC/);
});

test("validation rejects weak boundary workflow docs", () => {
  const dir = copyRepoFixture("framecore-validate-boundary-workflow-docs-");
  const textImageDoc = join(dir, "docs/text-image-policy.md");
  const hipsonDoc = join(dir, "docs/hipson-integration.md");
  const hyperframesDoc = join(dir, "docs/hyperframes.md");
  const recurringDoc = join(dir, "docs/recurring-workflow-review.md");
  writeFileSync(
    textImageDoc,
    readFileSync(textImageDoc, "utf8")
      .replace("## One-Pass Rule", "## Generation Notes")
      .replace("Do not silently replace", "Replace")
  );
  writeFileSync(
    hipsonDoc,
    readFileSync(hipsonDoc, "utf8")
      .replace("## Full Hipson Boundary", "## Full System")
      .replace("does not clone, install, or activate full Hipson", "can install full Hipson")
  );
  writeFileSync(
    hyperframesDoc,
    readFileSync(hyperframesDoc, "utf8")
      .replace("## Render QA", "## Render Checks")
      .replace("not as a paid media-provider integration", "as a paid media-provider integration")
  );
  writeFileSync(
    recurringDoc,
    readFileSync(recurringDoc, "utf8")
      .replace("## Default State", "## Default")
      .replace("mutation: disabled", "mutation: enabled")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_TEXT_IMAGE_POLICY_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_HIPSON_INTEGRATION_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_HYPERFRAMES_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RECURRING_WORKFLOW_REVIEW_DOC/);
});

test("validation rejects weak workflow self-improvement governance docs", () => {
  const dir = copyRepoFixture("framecore-validate-workflow-self-improvement-doc-");
  const doc = join(dir, "docs/workflow-self-improvement.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Report-Only Automation", "## Automation")
      .replace("explicit user or maintainer approval", "approval")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_WORKFLOW_SELF_IMPROVEMENT_DOC/);
});

test("validation rejects weak v1 readiness documentation", () => {
  const dir = copyRepoFixture("framecore-validate-v1-readiness-");
  const v1ReadinessDoc = join(dir, "docs/v1-readiness.md");
  writeFileSync(
    v1ReadinessDoc,
    readFileSync(v1ReadinessDoc, "utf8")
      .replace("## Validation Gates", "## Checks")
      .replace("npm run release:readiness -- --tag v1.0.0", "npm run release:readiness")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_V1_READINESS_DOC/);
});

test("validation rejects weak roadmap documentation", () => {
  const dir = copyRepoFixture("framecore-validate-roadmap-");
  const roadmapDoc = join(dir, "docs/roadmap.md");
  writeFileSync(
    roadmapDoc,
    readFileSync(roadmapDoc, "utf8")
      .replace("## Known Limitations", "## Notes")
      .replace("project-local", "workspace")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_ROADMAP_DOC/);
});

test("validation rejects weak release notes template", () => {
  const dir = copyRepoFixture("framecore-validate-release-notes-template-");
  const template = join(dir, "docs/release-notes-template.md");
  writeFileSync(
    template,
    readFileSync(template, "utf8")
      .replace("## Security And Privacy Review", "## Review")
      .replace("No bundled external paid execution providers", "External providers")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_NOTES_TEMPLATE/);
});

test("validation rejects weak release readiness docs and workflow safety", () => {
  const dir = copyRepoFixture("framecore-validate-release-weak-");
  const releaseDoc = join(dir, "docs/release.md");
  const workflow = join(dir, ".github/workflows/release-check.yml");
  const packageJson = join(dir, "package.json");

  writeFileSync(releaseDoc, readFileSync(releaseDoc, "utf8").replace("## Maintainer Sign-Off", "## Maintainer Approval"));
  writeFileSync(workflow, [
    readFileSync(workflow, "utf8").replace("npm run release:check", "npm test"),
    "pull_request_target:",
    "permissions:",
    "  contents: write",
    "  id-token: write",
    "  packages: write",
    "steps:",
    "  - run: npm publish",
    "  - run: gh release create v0.0.0",
    "  - uses: actions/upload-artifact@v4",
  ].join("\n"));
  const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
  pkg.scripts["release:check"] = "npm test";
  delete pkg.scripts.prepublishOnly;
  delete pkg.scripts["package:audit"];
  writeFileSync(packageJson, JSON.stringify(pkg, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_RELEASE_DOC_SECTION/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_CHECK_SCRIPT/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_RELEASE_WORKFLOW/);
});

test("validation rejects weak live Codex E2E checklist", () => {
  const dir = copyRepoFixture("framecore-validate-live-codex-e2e-");
  const doc = join(dir, "docs/live-codex-e2e-check.md");
  writeFileSync(
    doc,
    readFileSync(doc, "utf8")
      .replace("## Evidence To Record", "## Evidence")
      .replace("AGENTS-only pass", "generic pass")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_LIVE_CODEX_E2E_DOC/);
});

test("validation rejects weak support and security docs", () => {
  const dir = copyRepoFixture("framecore-validate-support-security-");
  const supportDoc = join(dir, "SUPPORT.md");
  const securityDoc = join(dir, "SECURITY.md");
  writeFileSync(
    supportDoc,
    readFileSync(supportDoc, "utf8")
      .replace("## What To Include", "## Details")
      .replace("Node.js version", "runtime version")
  );
  writeFileSync(
    securityDoc,
    readFileSync(securityDoc, "utf8")
      .replace("## Response Process", "## Handling")
      .replace("1.0.x", "0.1.x")
      .replace("version, tag, or commit SHA", "version")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_SUPPORT_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_SECURITY_DOC/);
});

test("validation rejects weak maintainer ownership docs", () => {
  const dir = copyRepoFixture("framecore-validate-maintainers-");
  const maintainersDoc = join(dir, "MAINTAINERS.md");
  writeFileSync(
    maintainersDoc,
    readFileSync(maintainersDoc, "utf8")
      .replace("## Release Ownership", "## Release Notes")
      .replace("provider-neutral boundaries", "boundaries")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_MAINTAINERS_DOC/);
});

test("validation rejects weak repository settings documentation", () => {
  const dir = copyRepoFixture("framecore-validate-repo-settings-");
  const repoSettingsDoc = join(dir, "docs/repository-settings.md");
  writeFileSync(
    repoSettingsDoc,
    readFileSync(repoSettingsDoc, "utf8")
      .replace("## Recommended Minimum", "## Basic Setup")
      .replace("npm run package:list", "npm pack --dry-run")
      .replace("Block force pushes", "Allow force pushes")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_REPOSITORY_SETTINGS_DOC/);
});

test("validation rejects weak pull request template", () => {
  const dir = copyRepoFixture("framecore-validate-pr-template-");
  const template = join(dir, ".github/pull_request_template.md");
  writeFileSync(
    template,
    readFileSync(template, "utf8")
      .replace("npm run package:list", "npm pack --dry-run")
      .replace("Release Impact", "Release Notes")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_PULL_REQUEST_TEMPLATE/);
});

test("validation rejects weak cross-platform workflow safety", () => {
  const dir = copyRepoFixture("framecore-validate-cross-platform-weak-");
  const workflow = join(dir, ".github/workflows/cross-platform.yml");
  const contributing = join(dir, "CONTRIBUTING.md");
  writeFileSync(workflow, [
    "name: cross-platform",
    "on:",
    "  push:",
    "permissions:",
    "  contents: write",
    "jobs:",
    "  smoke:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - run: npm publish",
  ].join("\n"));
  writeFileSync(contributing, readFileSync(contributing, "utf8").replace("default validate workflow", "CI"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CROSS_PLATFORM_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_CROSS_PLATFORM_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CONTRIBUTING_CI_DOC/);
});

test("validation rejects weak default validate workflow safety", () => {
  const dir = copyRepoFixture("framecore-validate-main-workflow-weak-");
  const workflow = join(dir, ".github/workflows/validate.yml");
  writeFileSync(workflow, [
    "name: validate",
    "on:",
    "  push:",
    "permissions:",
    "  contents: write",
    "jobs:",
    "  validate:",
    "    runs-on: ubuntu-latest",
    "    env:",
    "      NPM_CONFIG_CACHE: ${{ runner.temp }}/npm-cache",
    "    steps:",
    "      - run: npm publish",
  ].join("\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_VALIDATE_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_VALIDATE_WORKFLOW/);
});
