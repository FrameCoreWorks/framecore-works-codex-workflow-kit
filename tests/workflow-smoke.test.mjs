import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import test from "node:test";
import { root } from "./helpers.mjs";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function relativePath(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadAgentIds() {
  return new Set(
    readdirSync(join(root, ".codex/agents"))
      .filter((file) => file.endsWith(".toml.template"))
      .map((file) => file.replace(/\.toml\.template$/, ""))
  );
}

function loadBlueprintIds() {
  const text = readFileSync(join(root, ".agents/skills/pipeline-core/references/workflow-blueprints.md"), "utf8");
  return new Set(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^##\s+(.+)$/)?.[1])
      .filter(Boolean)
      .map(slugifyHeading)
  );
}

function loadGateIds() {
  const text = readFileSync(join(root, ".agents/skills/pipeline-core/references/gate-registry.md"), "utf8");
  const gates = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|/);
    if (match) gates.add(match[1]);
  }
  return gates;
}

function loadArtifactTypes() {
  return new Set(Object.keys(readJson(join(root, "config/artifact-schemas.json")).artifacts));
}

function loadHandoffPairs() {
  const text = readFileSync(join(root, ".agents/skills/pipeline-core/references/handoff-matrix.md"), "utf8");
  const pairs = new Set();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([a-z0-9-]+)\s*\|\s*([a-z0-9-]+)\s*\|/);
    if (match) pairs.add(`${match[1]}->${match[2]}`);
  }
  return pairs;
}

function loadWorkflowFiles() {
  const examplesDir = join(root, "examples");
  return readdirSync(examplesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(examplesDir, entry.name, "workflow.json"))
    .filter((file) => existsSync(file))
    .sort();
}

function assertStringArray(workflow, field, label) {
  assert.ok(Array.isArray(workflow[field]), `${label}: ${field} must be an array`);
  assert.ok(workflow[field].length > 0, `${label}: ${field} must not be empty`);
  for (const value of workflow[field]) {
    assert.equal(typeof value, "string", `${label}: ${field} values must be strings`);
    assert.notEqual(value.trim(), "", `${label}: ${field} values must not be blank`);
  }
  return workflow[field];
}

test("example workflow manifests reference live workflow contracts", () => {
  const agentIds = loadAgentIds();
  const blueprintIds = loadBlueprintIds();
  const gateIds = loadGateIds();
  const artifactTypes = loadArtifactTypes();
  const handoffPairs = loadHandoffPairs();
  const workflowFiles = loadWorkflowFiles();

  assert.ok(workflowFiles.length > 0, "expected at least one example workflow manifest");

  for (const file of workflowFiles) {
    const label = relativePath(file);
    const workflow = readJson(file);
    const expectedId = basename(dirname(file));

    assert.equal(workflow.schema_version, 1, `${label}: schema_version must be 1`);
    assert.equal(workflow.example_id, expectedId, `${label}: example_id must match directory name`);
    assert.equal(typeof workflow.execution_boundary, "string", `${label}: execution_boundary must be a string`);
    assert.notEqual(workflow.execution_boundary.trim(), "", `${label}: execution_boundary must not be blank`);

    assert.equal(typeof workflow.blueprint, "string", `${label}: blueprint must be a string`);
    assert.ok(blueprintIds.has(workflow.blueprint), `${label}: unknown blueprint ${workflow.blueprint}`);

    const route = assertStringArray(workflow, "route", label);
    const gates = assertStringArray(workflow, "gates", label);
    const artifacts = assertStringArray(workflow, "artifacts", label);
    const handoffs = assertStringArray(workflow, "handoffs", label);

    for (const roleId of route) {
      assert.ok(agentIds.has(roleId), `${label}: route references unknown agent role ${roleId}`);
    }
    for (const gateId of gates) {
      assert.ok(gateIds.has(gateId), `${label}: gates reference unknown gate ${gateId}`);
    }
    for (const artifactType of artifacts) {
      assert.ok(artifactTypes.has(artifactType), `${label}: artifacts reference unknown type ${artifactType}`);
    }

    const declaredHandoffs = new Set(handoffs);
    for (let index = 0; index < route.length - 1; index += 1) {
      const pair = `${route[index]}->${route[index + 1]}`;
      assert.ok(handoffPairs.has(pair), `${label}: route step is not listed in handoff matrix: ${pair}`);
      assert.ok(declaredHandoffs.has(pair), `${label}: route step is not declared in handoffs: ${pair}`);
    }

    for (const pair of handoffs) {
      assert.match(pair, /^[a-z0-9-]+->[a-z0-9-]+$/, `${label}: handoff must use from->to format: ${pair}`);
      const [from, to] = pair.split("->");
      assert.ok(agentIds.has(from), `${label}: handoff references unknown source role ${from}`);
      assert.ok(agentIds.has(to), `${label}: handoff references unknown target role ${to}`);
      assert.ok(handoffPairs.has(pair), `${label}: handoff is not listed in handoff matrix: ${pair}`);
    }
  }
});
