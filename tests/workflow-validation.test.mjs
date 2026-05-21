import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;

function run(args, options = {}) {
  return execFileSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

function failRun(args, options = {}) {
  return spawnSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

function copyRepoFixture(prefix) {
  const dir = join(mkdtempSync(join(tmpdir(), prefix)), "repo");
  cpSync(root, dir, {
    recursive: true,
    filter(source) {
      const normalized = source.replaceAll("\\", "/");
      return !normalized.includes("/.git/") && !normalized.endsWith("/.git") && !normalized.includes("/node_modules/");
    }
  });
  return dir;
}

function hidden(value) {
  return Buffer.from(value, "base64").toString("utf8");
}

function combinedOutput(result) {
  return `${result.stdout}${result.stderr}`;
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function runInteractiveOnboarding(dir) {
  return new Promise((resolve, reject) => {
    const child = spawn(node, ["scripts/onboard.mjs", "--target", dir], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const answers = ["", "", "", "", "", "", "", "yes"];
    let answerIndex = 0;

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if ((text.includes(": ") || text.includes("setup. ")) && answerIndex < answers.length) {
        child.stdin.write(`${answers[answerIndex]}\n`);
        answerIndex += 1;
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

test("validation passes on the repo scaffold", () => {
  assert.match(run(["scripts/validate.mjs"]), /workflow validation passed/);
});

test("validation rejects stub skills", () => {
  const dir = copyRepoFixture("framecore-validate-stub-");
  writeFileSync(join(dir, ".agents/skills/brief-architect/SKILL.md"), [
    "---",
    "name: brief-architect",
    "description: Use this skill to create a brief.",
    "---",
    "",
    "# Brief Architect",
    "",
    "Create a brief."
  ].join("\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /SKILL_STUB/);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_SKILL_SECTION/);
});

test("validation rejects missing skill contract sections", () => {
  const dir = copyRepoFixture("framecore-validate-section-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("\n## Guardrails\n", "\n## Safety Notes\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_SKILL_SECTION/);
});

test("validation rejects skill frontmatter names that drift from folder names", () => {
  const dir = copyRepoFixture("framecore-validate-name-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("name: humanizer", "name: copy-polisher"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /SKILL_NAME_MISMATCH/);
});

test("privacy audit passes on the repo scaffold", () => {
  assert.match(run(["scripts/audit-privacy.mjs"]), /privacy audit passed/);
});

test("privacy audit catches private paths, emails, secrets, provider remnants, and AppleDouble files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-audit-"));
  const banned = ["f", "al", ".", "ai"].join("");
  const other = hidden("TWFnbmlmaWM=");
  const tool = ["gen", "media"].join("");
  const localPath = ["/", "Users", "/", "example", "/", "private"].join("");
  const linuxPath = ["/", "home", "/", "example", "/", "private"].join("");
  const windowsPath = ["C:", "\\", "Users", "\\", "example", "\\", "private"].join("");
  const email = ["person", "@", "example", ".", "com"].join("");
  const secret = ["api", "_", "key", "=", "abcdefghijklmnopqrstuvwxyz"].join("");
  const cloud = [
    "https://drive.google.com/drive/folders/",
    "1AaBbCcDdEeFfGgHhIiJjKkLlMm"
  ].join("");
  writeFileSync(join(dir, "bad.md"), [
    banned,
    other,
    tool,
    localPath,
    linuxPath,
    windowsPath,
    email,
    secret,
    cloud
  ].join("\n"));
  writeFileSync(join(dir, "._bad.md"), "");
  const result = failRun(["scripts/audit-privacy.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /BANNED_TERM/);
  assert.match(`${result.stderr}${result.stdout}`, /LOCAL_ABSOLUTE_PATH/);
  assert.match(`${result.stderr}${result.stdout}`, /EMAIL_ADDRESS/);
  assert.match(`${result.stderr}${result.stdout}`, /SECRET_LIKE_VALUE/);
  assert.match(`${result.stderr}${result.stdout}`, /PRIVATE_CLOUD_REFERENCE/);
  assert.match(`${result.stderr}${result.stdout}`, /APPLEDOUBLE_FILE/);
});

test("privacy audit catches secret filenames and credential-shaped values", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-audit-secret-files-"));
  const privateKey = ["-----BEGIN ", "OPENSSH PRIVATE KEY", "-----"].join("");
  const token = ["ghp_", "abcdefghijklmnopqrstuvwxyz123456"].join("");
  writeFileSync(join(dir, ".env"), "LOCAL_ONLY=1\n");
  writeFileSync(join(dir, "credentials.pem"), privateKey);
  writeFileSync(join(dir, "tokens.txt"), token);

  const result = failRun(["scripts/audit-privacy.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /SECRET_FILE_NAME/);
  assert.match(`${result.stderr}${result.stdout}`, /SECRET_LIKE_VALUE/);
});

test("cli scripts expose non-mutating help output", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-help-"));
  const sidecar = join(root, "._framecore-help-test");
  writeFileSync(sidecar, "");
  try {
    for (const script of [
      "scripts/install.mjs",
      "scripts/doctor.mjs",
      "scripts/onboard.mjs",
      "scripts/render-agents.mjs",
      "scripts/validate.mjs",
      "scripts/audit-privacy.mjs",
      "scripts/cleanup-appledouble.mjs",
    ]) {
      const output = run([script, "--help", "--target", dir]);
      assert.match(output, /Usage:/);
      assert.match(output, /Purpose:/);
      assert.match(output, /Options:/);
    }
    assert.equal(existsSync(join(dir, "framecore.config.json")), false);
    assert.equal(existsSync(join(dir, ".framecore/manifest.json")), false);
    assert.equal(existsSync(join(dir, ".codex/agents")), false);
    assert.equal(existsSync(sidecar), true);
  } finally {
    rmSync(sidecar, { force: true });
  }
});

test("doctor passes clean target without mutating or leaking target path", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-clean-"));
  const output = run(["scripts/doctor.mjs", "--target", dir]);
  assert.match(output, /FrameCore doctor: project-local preflight/);
  assert.match(output, /\[pass\] Target workspace exists/);
  assert.match(output, /\[warn\] framecore\.config\.json is missing/);
  assert.equal(output.includes(dir), false);
  assert.equal(existsSync(join(dir, "framecore.config.json")), false);
  assert.equal(existsSync(join(dir, ".framecore/manifest.json")), false);
  assert.equal(existsSync(join(dir, ".agents")), false);
});

test("doctor rejects missing targets without mutating parent folders", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-doctor-missing-parent-"));
  const missing = join(parent, "missing-target");
  const result = failRun(["scripts/doctor.mjs", "--target", missing]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /Target workspace does not exist/);
  assert.equal(output.includes(missing), false);
  assert.equal(existsSync(missing), false);
});

test("doctor rejects invalid config before any target writes", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-bad-config-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.output_dir = "../outside";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config, null, 2));

  const result = failRun(["scripts/doctor.mjs", "--target", dir]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /framecore\.config\.json is invalid/);
  assert.equal(existsSync(join(dir, ".framecore/manifest.json")), false);
  assert.equal(existsSync(join(dir, ".codex/agents")), false);
});

test("doctor reports user-owned conflicts and force behavior without backups", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-conflict-"));
  const conflict = join(dir, ".agents/skills/humanizer/SKILL.md");
  mkdirSync(dirname(conflict), { recursive: true });
  writeFileSync(conflict, "user-owned\n");

  const blocked = failRun(["scripts/doctor.mjs", "--target", dir]);
  assert.notEqual(blocked.status, 0);
  assert.match(combinedOutput(blocked), /user-owned path\(s\) would block/);
  assert.equal(readFileSync(conflict, "utf8"), "user-owned\n");
  assert.equal(existsSync(`${conflict}.bak`), false);

  const forced = failRun(["scripts/doctor.mjs", "--target", dir, "--force"]);
  assert.equal(forced.status, 0);
  assert.match(combinedOutput(forced), /would be overwritten with backups because --force is set/);
  assert.equal(readFileSync(conflict, "utf8"), "user-owned\n");
  assert.equal(existsSync(`${conflict}.bak`), false);
});

test("doctor validates existing installs and operation-specific manifest requirements", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-installed-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);
  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.kit.name, "framecore-works-codex-workflow-kit");
  assert.equal(manifest.kit.version, "0.1.0");
  assert.match(manifest.managed_hashes[".agents/skills/humanizer/SKILL.md"], /^[a-f0-9]{64}$/);
  assert.equal(
    manifest.managed_hashes[".agents/skills/humanizer/SKILL.md"],
    sha256(join(dir, ".agents/skills/humanizer/SKILL.md"))
  );
  assert.equal(".framecore/manifest.json" in manifest.managed_hashes, false);

  for (const mode of ["update", "repair", "uninstall"]) {
    const output = run(["scripts/doctor.mjs", "--mode", mode, "--target", dir]);
    assert.match(output, new RegExp(`FrameCore doctor: ${mode} preflight`));
    assert.match(output, /Manifest found/);
    assert.match(output, /Managed file hashes match/);
    assert.equal(output.includes(dir), false);
  }

  const noManifest = mkdtempSync(join(tmpdir(), "framecore-doctor-no-manifest-"));
  const result = failRun(["scripts/doctor.mjs", "--mode", "update", "--target", noManifest]);
  assert.notEqual(result.status, 0);
  assert.match(combinedOutput(result), /update requires \.framecore\/manifest\.json/);
});

test("doctor reports managed file drift and legacy manifests without failing", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-drift-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  writeFileSync(join(dir, ".agents/skills/humanizer/SKILL.md"), "local edit\n");
  const changed = run(["scripts/doctor.mjs", "--mode", "update", "--target", dir]);
  assert.match(changed, /managed file\(s\) differ from the manifest hash/);
  assert.equal(changed.includes(dir), false);

  rmSync(join(dir, ".agents/skills/humanizer/SKILL.md"), { force: true });
  const missing = run(["scripts/doctor.mjs", "--mode", "repair", "--target", dir]);
  assert.match(missing, /managed file\(s\) recorded in the manifest are missing/);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  delete manifest.managed_hashes;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  const legacy = run(["scripts/doctor.mjs", "--mode", "update", "--target", dir]);
  assert.match(legacy, /Manifest has no managed file hashes/);
});

test("doctor reports partial manifest hash coverage without failing", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-partial-hashes-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.managed_hashes = {};
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const output = run(["scripts/doctor.mjs", "--mode", "update", "--target", dir]);
  assert.match(output, /managed file\(s\) have no manifest hash metadata/);
  assert.equal(output.includes(dir), false);
});

test("repair refreshes managed hashes after local drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-repair-hashes-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const skillPath = join(dir, ".agents/skills/humanizer/SKILL.md");
  const manifestPath = join(dir, ".framecore/manifest.json");
  writeFileSync(skillPath, "local edit\n");
  assert.match(run(["scripts/doctor.mjs", "--mode", "repair", "--target", dir]), /managed file\(s\) differ from the manifest hash/);

  run(["scripts/install.mjs", "--mode", "repair", "--target", dir]);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.managed_hashes[".agents/skills/humanizer/SKILL.md"], sha256(skillPath));
  assert.notEqual(readFileSync(skillPath, "utf8"), "local edit\n");
});

test("doctor rejects malformed and unsafe manifests", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-bad-manifest-"));
  const localPath = ["/", "Users", "/", "example", "/", "private"].join("");
  mkdirSync(join(dir, ".framecore"), { recursive: true });
  writeFileSync(join(dir, ".framecore/manifest.json"), JSON.stringify({
    schema_version: 2,
    managed_paths: ["AGENTS.md", "AGENTS.md", localPath, "../escape"],
    managed_hashes: {
      "AGENTS.md": "not-a-hash",
      "../escape": "a".repeat(64),
      "missing.md": "b".repeat(64)
    }
  }, null, 2));

  const result = failRun(["scripts/doctor.mjs", "--mode", "update", "--target", dir]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /schema_version must be 1/);
  assert.match(output, /duplicate managed path/);
  assert.match(output, /unsafe managed path entry/);
  assert.match(output, /managed_hashes contains a path not listed/);
  assert.match(output, /managed_hashes values must be sha256 hex strings/);
  assert.equal(output.includes(localPath), false);
});

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

test("validation rejects missing example workflow manifests", () => {
  const dir = copyRepoFixture("framecore-validate-example-workflow-missing-");
  rmSync(join(dir, "examples/static-campaign/workflow.json"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_EXAMPLE_WORKFLOW/);
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
  writeFileSync(packageJson, JSON.stringify(pkg, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_RELEASE_DOC_SECTION/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_CHECK_SCRIPT/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_RELEASE_WORKFLOW/);
});

test("validation rejects weak cross-platform workflow safety", () => {
  const dir = copyRepoFixture("framecore-validate-cross-platform-weak-");
  const workflow = join(dir, ".github/workflows/cross-platform.yml");
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

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_CROSS_PLATFORM_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_CROSS_PLATFORM_WORKFLOW/);
});

test("onboarding renders project-local config and agent templates", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/render-agents.mjs", "--target", dir]);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.equal("install_scope" in config, false);
  const rendered = readdirSync(join(dir, ".codex/agents")).filter((file) => file.endsWith(".toml"));
  assert.equal(rendered.length, 20);
  const sample = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.match(sample, /intent-confirmation/);
});

test("config validation rejects invalid local config before rendering", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-bad-config-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.qa_strictness = "maximum";
  config.agent_display_names = { "unknown-role": "Unknown" };
  config.output_dir = "../outside";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config, null, 2));

  const result = failRun(["scripts/render-agents.mjs", "--target", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /invalid framecore\.config\.json/);
  assert.match(`${result.stderr}${result.stdout}`, /qa_strictness/);
  assert.match(`${result.stderr}${result.stdout}`, /unknown-role/);
  assert.match(`${result.stderr}${result.stdout}`, /output_dir/);
});

test("install rejects invalid local config before writing managed files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-bad-install-config-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.output_dir = "/tmp/not-portable";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config, null, 2));

  const result = failRun(["scripts/install.mjs", "--mode", "project-local", "--target", dir, "--force"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /invalid framecore\.config\.json/);
  assert.equal(existsSync(join(dir, ".agents/skills/pipeline-core/SKILL.md")), false);
  assert.equal(existsSync(join(dir, ".codex/agents/intent-confirmation.toml")), false);
  assert.equal(existsSync(join(dir, ".framecore/manifest.json")), false);
});

test("interactive onboarding explains the workflow and can keep default role names", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-"));
  const result = await runInteractiveOnboarding(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /This installer adds a structured creative workflow/);
  assert.match(result.stdout, /How this improves your work/);
  assert.match(result.stdout, /Hipson in this setup/);
  assert.match(result.stdout, /Use default role names/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.deepEqual(config.agent_display_names, {});
});

test("installer dry run reports writes without mutating target", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-dry-"));
  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.match(output, /would write/);
  assert.equal(existsSync(join(dir, "AGENTS.md")), false);
});

test("installer dry run fails on user-owned file conflicts", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-conflict-"));
  mkdirSync(join(dir, ".agents/skills/humanizer"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/humanizer/SKILL.md"), "user-owned humanizer\n");
  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /refusing to overwrite user-owned file/);
  assert.equal(readFileSync(join(dir, ".agents/skills/humanizer/SKILL.md"), "utf8"), "user-owned humanizer\n");
});

test("install and uninstall preserve user-owned skills, agents, and AGENTS.md", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-owned-"));
  mkdirSync(join(dir, ".agents/skills/user-skill"), { recursive: true });
  mkdirSync(join(dir, ".codex/agents"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/user-skill/SKILL.md"), "user skill\n");
  writeFileSync(join(dir, ".codex/agents/user-agent.toml"), "name = \"user-agent\"\n");
  writeFileSync(join(dir, "AGENTS.md"), "user project instructions\n");

  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, "AGENTS.framecore.md")));

  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.managed_paths.includes(".agents/skills"), false);
  assert.equal(manifest.managed_paths.includes(".codex/agents"), false);
  assert.ok(manifest.managed_paths.includes("AGENTS.framecore.md"));

  run(["scripts/install.mjs", "--mode", "uninstall", "--target", dir, "--yes"]);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, ".agents/skills/user-skill/SKILL.md")));
  assert.ok(existsSync(join(dir, ".codex/agents/user-agent.toml")));
  assert.equal(existsSync(join(dir, "AGENTS.framecore.md")), false);
  assert.equal(existsSync(join(dir, ".agents/skills/pipeline-core/SKILL.md")), false);
});

test("uninstall rejects managed paths outside the target", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-hostile-"));
  const outside = join(tmpdir(), "framecore-hostile-outside.txt");
  mkdirSync(join(dir, ".framecore"), { recursive: true });
  writeFileSync(outside, "keep\n");
  writeFileSync(join(dir, ".framecore/manifest.json"), JSON.stringify({
    schema_version: 1,
    managed_paths: ["../framecore-hostile-outside.txt"]
  }));

  const result = failRun(["scripts/install.mjs", "--mode", "uninstall", "--target", dir, "--yes"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /invalid manifest: manifest contains an unsafe managed path entry/);
  assert.equal(readFileSync(outside, "utf8"), "keep\n");
});

test("repair install backs up user-owned files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-repair-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);
  writeFileSync(join(dir, "AGENTS.md"), "local user content\n");
  run(["scripts/install.mjs", "--mode", "repair", "--target", dir]);
  assert.match(readFileSync(join(dir, "AGENTS.md.bak"), "utf8"), /local user content/);
});

test("update and repair require a manifest", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-mode-no-manifest-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  for (const mode of ["update", "repair"]) {
    const result = failRun(["scripts/install.mjs", "--mode", mode, "--target", dir]);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stderr}${result.stdout}`, /requires \.framecore\/manifest\.json/);
  }
});

test("repair only rewrites manifest-recorded paths while update expands managed set", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-repair-update-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.managed_paths = manifest.managed_paths.filter((item) => !item.startsWith(".agents/skills/humanizer/"));
  delete manifest.managed_hashes;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  rmSync(join(dir, ".agents/skills/humanizer"), { recursive: true, force: true });

  run(["scripts/install.mjs", "--mode", "repair", "--target", dir]);
  assert.equal(existsSync(join(dir, ".agents/skills/humanizer/SKILL.md")), false);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.equal(existsSync(join(dir, ".agents/skills/humanizer/SKILL.md")), true);
  const updatedManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(updatedManifest.managed_paths.includes(".agents/skills/humanizer/SKILL.md"), true);
  assert.match(updatedManifest.managed_hashes[".agents/skills/humanizer/SKILL.md"], /^[a-f0-9]{64}$/);
});

test("agent rendering escapes local display names and config values", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-render-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.agent_display_names = {
    "intent-confirmation": "Agent \"Quoted\"\nname = \"evil\""
  };
  config.response_tone = "calm \"quoted\" tone";
  config.output_dir = "output/\"quoted\"";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config));

  run(["scripts/render-agents.mjs", "--target", dir]);
  const rendered = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.equal(rendered.match(/^name = /gm).length, 1);
  assert.doesNotMatch(rendered, /\nname = "evil"/);
  assert.match(rendered, /Agent \\"Quoted\\" name = \\"evil\\"/);
});

test("workflow self-improvement is explicit and proposal-only", () => {
  const text = readFileSync(join(root, ".agents/skills/workflow-self-improvement/SKILL.md"), "utf8");
  assert.match(text, /explicit-only/);
  assert.match(text, /no uploads/);
  assert.match(text, /no external execution/);
  assert.match(text, /no edits/);
});

test("Hipson Adapter documents full repo expansion and defaults to lightweight scope", () => {
  const skill = readFileSync(join(root, ".agents/skills/hipson-adapter/SKILL.md"), "utf8");
  const config = JSON.parse(readFileSync(join(root, "config/hipson.example.json"), "utf8"));
  assert.match(skill, /lightweight adapter/);
  assert.equal(config.connect_full_repo, false);
  assert.equal(config.full_repo_url, "https://github.com/Hipson47/Hipson.git");
});

test("recurring self-improvement automation is opt-in and report-only", () => {
  const defaults = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  const recipe = JSON.parse(readFileSync(join(root, "config/automation-recipes/workflow-self-improvement-review.example.json"), "utf8"));
  assert.equal(defaults.workflow_self_improvement.recurring_review_enabled, false);
  assert.equal(recipe.mode, "report-and-proposals-only");
  assert.equal(recipe.mutation, false);
  assert.equal(recipe.uploads, false);
  assert.equal(recipe.external_execution, false);
});
