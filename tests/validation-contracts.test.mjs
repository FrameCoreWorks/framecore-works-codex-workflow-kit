import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

test("validation rejects unknown handoff roles", () => {
  const dir = copyRepoFixture("framecore-validate-handoff-");
  const file = join(dir, ".agents/skills/pipeline-core/references/handoff-matrix.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, `${text}\n| image-prompting | fake-role | prompt_pack |\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /UNKNOWN_HANDOFF_ROLE/);
});

test("validation rejects gate registry drift", () => {
  const dir = copyRepoFixture("framecore-validate-gate-");
  const file = join(dir, ".agents/skills/pipeline-core/references/gate-registry.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("`brief-architect` | Brief Contract", "`unknown-role` | Missing Artifact"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /UNKNOWN_GATE_OWNER_ROLE/);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_GATE_ARTIFACT_TEMPLATE/);
});

test("validation rejects duplicate gate and handoff rows", () => {
  const dir = copyRepoFixture("framecore-validate-duplicates-");
  const gateFile = join(dir, ".agents/skills/pipeline-core/references/gate-registry.md");
  const handoffFile = join(dir, ".agents/skills/pipeline-core/references/handoff-matrix.md");
  writeFileSync(gateFile, `${readFileSync(gateFile, "utf8")}\n| \`intent_lock\` | \`intent-confirmation\` | Task Confirmation |\n`);
  writeFileSync(handoffFile, `${readFileSync(handoffFile, "utf8")}\n| intent-confirmation | workflow-orchestrator | confirmed_goal |\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /DUPLICATE_GATE/);
  assert.match(`${result.stderr}${result.stdout}`, /DUPLICATE_HANDOFF/);
});

test("validation rejects weak workflow blueprints", () => {
  const dir = copyRepoFixture("framecore-validate-blueprints-");
  const file = join(dir, ".agents/skills/pipeline-core/references/workflow-blueprints.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("## HyperFrames Coded Video", "## Coded Video"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_WORKFLOW_BLUEPRINTS/);
});

test("validation rejects weak inference reasoning policy", () => {
  const dir = copyRepoFixture("framecore-validate-inference-policy-");
  const file = join(dir, ".agents/skills/pipeline-core/references/inference-reasoning-methods.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("raw_trace_storage: forbidden", "raw_trace_storage: optional"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_INFERENCE_REASONING_POLICY/);
});

test("validation rejects weak loop protocol", () => {
  const dir = copyRepoFixture("framecore-validate-loop-policy-");
  const file = join(dir, ".agents/skills/pipeline-core/references/loop-protocol.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("bounded_execution_packet", "execution_notes"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_LOOP_PROTOCOL/);
});

test("validation rejects missing artifact schemas for gate-required artifacts", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-schema-missing-");
  const schemaFile = join(dir, "config/artifact-schemas.json");
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  delete schema.artifacts["Brief Contract"];
  writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_ARTIFACT_SCHEMA/);
});

test("validation rejects artifact schema fields missing from templates", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-schema-field-");
  const schemaFile = join(dir, "config/artifact-schemas.json");
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  schema.artifacts["Brief Contract"].required_fields.push("missing_field");
  writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /ARTIFACT_SCHEMA_FIELD_MISSING_TEMPLATE/);
  assert.match(`${result.stderr}${result.stdout}`, /EXAMPLE_ARTIFACT_MISSING_FIELD/);
});

test("validation rejects artifact schemas without fixture coverage", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-fixture-coverage-");
  const schemaFile = join(dir, "config/artifact-schemas.json");
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  delete schema.artifacts["Project State"].example_paths;
  writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_ARTIFACT_FIXTURE_COVERAGE/);
});

test("validation rejects registered artifact fixture paths that are missing", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-fixture-missing-");
  rmSync(join(dir, "examples/contract-fixtures/artifacts/project-state.md"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_ARTIFACT_EXAMPLE/);
});

test("validation rejects artifact fixture paths outside public Markdown examples", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-fixture-path-");
  const schemaFile = join(dir, "config/artifact-schemas.json");
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  schema.artifacts["Project State"].example_paths = [
    "docs/artifact-schemas.md",
    "examples/contract-fixtures/artifacts/._project-state.md"
  ];
  writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /INVALID_ARTIFACT_FIXTURE_PATH/);
});

test("validation ignores AppleDouble markdown sidecars during link and example scans", () => {
  const dir = copyRepoFixture("framecore-validate-appledouble-ignore-");
  writeFileSync(join(dir, "._CHANGELOG.md"), "[broken](missing.md)\n");
  writeFileSync(join(dir, "examples/._README.md"), [
    "# Sidecar",
    "[broken](missing.md)"
  ].join("\n"));

  assert.match(run(["scripts/validate.mjs", dir]), /workflow validation passed/);
});

test("validation rejects example artifact fixtures missing required fields", () => {
  const dir = copyRepoFixture("framecore-validate-artifact-example-");
  const file = join(dir, "examples/end-to-end-creative-workflow/artifacts/brief-contract.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("- objective: Prepare", "- goal: Prepare"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /EXAMPLE_ARTIFACT_MISSING_FIELD/);
});

test("validation rejects weak text-bearing image prompt fixtures", () => {
  const dir = copyRepoFixture("framecore-validate-text-image-fixture-");
  const file = join(dir, "examples/contract-fixtures/artifacts/image-prompt-contract.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace(" in one pass", ""));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_TEXT_IMAGE_ARTIFACT_FIXTURE/);
});

test("validation rejects missing example workflow manifests", () => {
  const dir = copyRepoFixture("framecore-validate-example-workflow-missing-");
  rmSync(join(dir, "examples/static-campaign/workflow.json"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_EXAMPLE_WORKFLOW/);
});

test("validation rejects missing required examples", () => {
  const dir = copyRepoFixture("framecore-validate-required-example-missing-");
  rmSync(join(dir, "examples/storyboard-board/README.md"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_REQUIRED_EXAMPLE/);
});

test("validation rejects unknown example workflow blueprints", () => {
  const dir = copyRepoFixture("framecore-validate-example-blueprint-");
  const file = join(dir, "examples/static-campaign/workflow.json");
  const workflow = JSON.parse(readFileSync(file, "utf8"));
  workflow.blueprint = "unregistered-blueprint";
  writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /UNKNOWN_EXAMPLE_BLUEPRINT/);
});

test("validation rejects example workflows missing required blueprint coverage", () => {
  const dir = copyRepoFixture("framecore-validate-example-blueprint-coverage-");
  const file = join(dir, "examples/static-campaign/workflow.json");
  const workflow = JSON.parse(readFileSync(file, "utf8"));
  workflow.route = workflow.route.filter((role) => role !== "delivery-documentation");
  workflow.gates = workflow.gates.filter((gate) => gate !== "delivery_fit");
  writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  const output = `${result.stderr}${result.stdout}`;
  assert.notEqual(result.status, 0);
  assert.match(output, /MISSING_EXAMPLE_BLUEPRINT_ROLE/);
  assert.match(output, /MISSING_EXAMPLE_BLUEPRINT_GATE/);
});

test("validation rejects example routes without declared handoff continuity", () => {
  const dir = copyRepoFixture("framecore-validate-example-route-continuity-");
  const file = join(dir, "examples/static-campaign/workflow.json");
  const workflow = JSON.parse(readFileSync(file, "utf8"));
  workflow.handoffs = workflow.handoffs.filter((pair) => pair !== "copy-voice->image-prompting");
  writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_EXAMPLE_ROUTE_HANDOFF/);
});

test("validation rejects example workflow route, gate, artifact, and handoff drift", () => {
  const dir = copyRepoFixture("framecore-validate-example-workflow-drift-");
  const file = join(dir, "examples/static-campaign/workflow.json");
  const workflow = JSON.parse(readFileSync(file, "utf8"));
  workflow.route.push("unknown-role");
  workflow.gates.push("unknown_gate");
  workflow.artifacts.push("Unknown Artifact");
  workflow.handoffs.push("static-direction->delivery-documentation");
  writeFileSync(file, JSON.stringify(workflow, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  const output = `${result.stderr}${result.stdout}`;
  assert.notEqual(result.status, 0);
  assert.match(output, /UNKNOWN_EXAMPLE_ROLE/);
  assert.match(output, /UNKNOWN_EXAMPLE_GATE/);
  assert.match(output, /UNKNOWN_EXAMPLE_ARTIFACT/);
  assert.match(output, /UNKNOWN_EXAMPLE_HANDOFF/);
});

test("validation rejects agent templates with unknown review gates", () => {
  const dir = copyRepoFixture("framecore-validate-agent-gate-");
  const file = join(dir, ".codex/agents/brief-architect.toml.template");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("Review gate: brief_completeness.", "Review gate: missing_gate."));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /UNKNOWN_AGENT_REVIEW_GATE/);
});

test("validation rejects missing release readiness files", () => {
  const dir = copyRepoFixture("framecore-validate-release-");
  rmSync(join(dir, "docs/release.md"), { force: true });
  rmSync(join(dir, ".github/workflows/release-check.yml"), { force: true });
  rmSync(join(dir, ".github/ISSUE_TEMPLATE/install_support.yml"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_DOC/);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_REPO_FILE/);
});

test("validation rejects weak Dependabot config", () => {
  const dir = copyRepoFixture("framecore-validate-dependabot-");
  const file = join(dir, ".github/dependabot.yml");
  writeFileSync(file, [
    "version: 2",
    "updates:",
    "  - package-ecosystem: npm",
    "    directory: /",
  ].join("\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_DEPENDABOT_CONFIG/);
});

test("validation rejects weak repository format config", () => {
  const dir = copyRepoFixture("framecore-validate-format-config-");
  const editorconfig = join(dir, ".editorconfig");
  const gitattributes = join(dir, ".gitattributes");

  writeFileSync(editorconfig, readFileSync(editorconfig, "utf8").replace("end_of_line = lf", "end_of_line = crlf"));
  writeFileSync(gitattributes, readFileSync(gitattributes, "utf8").replace("* text=auto eol=lf", "* text=auto"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_REPO_FORMAT_CONFIG/);
});

test("validation rejects weak NOTICE file", () => {
  const dir = copyRepoFixture("framecore-validate-notice-");
  const notice = join(dir, "NOTICE");
  writeFileSync(notice, "FrameCore Works\n");

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_NOTICE_FILE/);
});

test("validation rejects weak issue template hygiene", () => {
  const dir = copyRepoFixture("framecore-validate-issue-template-");
  const config = join(dir, ".github/ISSUE_TEMPLATE/config.yml");
  const documentationTemplate = join(dir, ".github/ISSUE_TEMPLATE/documentation.yml");

  writeFileSync(config, readFileSync(config, "utf8").replace("blank_issues_enabled: false", "blank_issues_enabled: true"));
  writeFileSync(documentationTemplate, readFileSync(documentationTemplate, "utf8").replace("Do not include secrets", "Include details"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_ISSUE_TEMPLATE_HYGIENE/);
});
