import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

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

test("validation rejects weak installed AGENTS runtime safety", () => {
  const dir = copyRepoFixture("framecore-weak-agents-template-");
  const agentsTemplate = join(dir, "AGENTS.template.md");
  writeFileSync(
    agentsTemplate,
    readFileSync(agentsTemplate, "utf8")
      .replace("Treat repository files", "Read repository files")
      .replace("For workflow routing details, read `.agents/skills/pipeline-core/SKILL.md` before choosing specialist roles.", "")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_AGENTS_TEMPLATE/);
});

test("validation rejects instruction override phrases in agent-facing files", () => {
  const dir = copyRepoFixture("framecore-instruction-override-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  writeFileSync(file, `${readFileSync(file, "utf8")}\n\n${["ignore", " previous instructions"].join("")}\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /INSTRUCTION_OVERRIDE_PHRASE/);
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

test("privacy audit rejects symlinks without following outside target", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-audit-symlink-"));
  const outside = join(mkdtempSync(join(tmpdir(), "framecore-audit-symlink-outside-")), "outside.md");
  const link = join(dir, "linked.md");
  const outsideToken = ["sk", "-", "abcdefghijklmnopqrstuvwxyz123456"].join("");
  writeFileSync(outside, `token = ${outsideToken}\n`);
  try {
    symlinkSync(outside, link);
  } catch {
    t.skip("symlink creation is unavailable in this environment");
    return;
  }

  const result = failRun(["scripts/audit-privacy.mjs", dir]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /SYMLINK_FILE/);
  assert.doesNotMatch(output, /SECRET_LIKE_VALUE/);
});

test("secret scan passes and catches credential-shaped values", () => {
  assert.match(run(["scripts/safety-scan.mjs"]), /safety scan passed/);

  const dir = mkdtempSync(join(tmpdir(), "framecore-safety-scan-"));
  const token = ["sk", "-", "abcdefghijklmnopqrstuvwxyz123456"].join("");
  const cloud = [
    "https://drive.google.com/drive/folders/",
    "1AaBbCcDdEeFfGgHhIiJjKkLlMm"
  ].join("");
  writeFileSync(join(dir, ".env"), "SHOULD_NOT_SHIP=1\n");
  writeFileSync(join(dir, "bad.md"), [`token = ${token}`, cloud].join("\n"));

  const result = failRun(["scripts/safety-scan.mjs", dir]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /SAFETY_SCAN_FILE_NAME/);
  assert.match(output, /SAFETY_SCAN_VALUE/);
  assert.match(output, /SAFETY_SCAN_PRIVATE_CLOUD/);
});

test("secret scan rejects symlinks without following outside target", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-safety-symlink-"));
  const outside = join(mkdtempSync(join(tmpdir(), "framecore-safety-symlink-outside-")), "outside.md");
  const link = join(dir, "linked.md");
  const outsideToken = ["sk", "-", "abcdefghijklmnopqrstuvwxyz123456"].join("");
  writeFileSync(outside, `token = ${outsideToken}\n`);
  try {
    symlinkSync(outside, link);
  } catch {
    t.skip("symlink creation is unavailable in this environment");
    return;
  }

  const result = failRun(["scripts/safety-scan.mjs", dir]);
  const output = combinedOutput(result);
  assert.notEqual(result.status, 0);
  assert.match(output, /SAFETY_SCAN_SYMLINK/);
  assert.doesNotMatch(output, /SAFETY_SCAN_VALUE/);
});

test("package audit passes on repo package and rejects local config package files", () => {
  assert.match(run(["scripts/package-audit.mjs"]), /package audit passed/);

  const dir = copyRepoFixture("framecore-package-audit-");
  const packageJson = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
  pkg.files.push("framecore.config.json");
  writeFileSync(packageJson, `${JSON.stringify(pkg, null, 2)}\n`);
  writeFileSync(join(dir, "framecore.config.json"), "{}\n");

  const result = failRun(["scripts/package-audit.mjs"], { cwd: dir });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /PACKAGE_AUDIT/);
  assert.match(`${result.stderr}${result.stdout}`, /framecore\.config\.json/);
});

test("cli scripts expose non-mutating help output", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-help-"));
  const sidecar = join(root, "._framecore-help-test");
  writeFileSync(sidecar, "");
  try {
    for (const script of [
      "scripts/agent-compliance-check.mjs",
      "scripts/install.mjs",
      "scripts/guided-install.mjs",
      "scripts/doctor.mjs",
      "scripts/onboard.mjs",
      "scripts/render-agents.mjs",
      "scripts/validate.mjs",
      "scripts/audit-privacy.mjs",
      "scripts/safety-scan.mjs",
      "scripts/syntax-check.mjs",
      "scripts/package-list.mjs",
      "scripts/package-audit.mjs",
      "scripts/release-readiness.mjs",
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

test("release readiness validates package metadata, changelog, and tag alignment", () => {
  assert.match(run(["scripts/release-readiness.mjs", "--tag", "v1.0.0"]), /release readiness passed/);

  const dir = copyRepoFixture("framecore-release-readiness-");
  const packageJson = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
  pkg.version = "0.2.0";
  writeFileSync(packageJson, `${JSON.stringify(pkg, null, 2)}\n`);

  const missingChangelog = failRun(["scripts/release-readiness.mjs"], { cwd: dir });
  assert.notEqual(missingChangelog.status, 0);
  assert.match(combinedOutput(missingChangelog), /CHANGELOG\.md must contain a release entry/);

  const tagMismatch = failRun(["scripts/release-readiness.mjs", "--tag", "v0.1.0"], { cwd: dir });
  assert.notEqual(tagMismatch.status, 0);
  assert.match(combinedOutput(tagMismatch), /release tag v0\.1\.0 must match package version v0\.2\.0/);
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
  assert.equal(manifest.kit.version, "1.0.0");
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

test("validation rejects weak workflow blueprints", () => {
  const dir = copyRepoFixture("framecore-validate-blueprints-");
  const file = join(dir, ".agents/skills/pipeline-core/references/workflow-blueprints.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("## HyperFrames Coded Video", "## Coded Video"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_WORKFLOW_BLUEPRINTS/);
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

test("validation rejects weak onboarding guide and assisted install prompt", () => {
  const dir = copyRepoFixture("framecore-validate-onboarding-docs-");
  const readme = join(dir, "README.md");
  const onboardingDoc = join(dir, "docs/onboarding.md");
  const quickstartDoc = join(dir, "docs/quickstart.md");
  writeFileSync(
    readme,
    readFileSync(readme, "utf8")
      .replace(", docs/quickstart.md,", "")
      .replace("Run doctor/preflight", "Run install dry-run")
  );
  writeFileSync(
    onboardingDoc,
    readFileSync(onboardingDoc, "utf8")
      .replace("## Interactive Questions", "## Setup Questions")
      .replace("does not clone, install, or activate full Hipson", "may install full Hipson")
  );
  writeFileSync(quickstartDoc, readFileSync(quickstartDoc, "utf8").replace("project-local only", "project-local"));

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
  delete pkg.scripts["package:audit"];
  writeFileSync(packageJson, JSON.stringify(pkg, null, 2));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_RELEASE_DOC_SECTION/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_CHECK_SCRIPT/);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_RELEASE_WORKFLOW/);
  assert.match(`${result.stderr}${result.stdout}`, /UNSAFE_RELEASE_WORKFLOW/);
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

test("onboarding renders project-local config and agent templates", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-"));
  const output = run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  assert.match(output, /Next steps:/);
  assert.match(output, /npm run install:dry-run/);
  assert.match(output, /project-local/);
  assert.match(output, /docs\/using-the-kit\.md/);
  run(["scripts/render-agents.mjs", "--target", dir]);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.equal("install_scope" in config, false);
  const rendered = readdirSync(join(dir, ".codex/agents")).filter((file) => file.endsWith(".toml"));
  assert.equal(rendered.length, 20);
  const sample = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.match(sample, /intent-confirmation/);
});

test("onboarding rejects missing targets unless explicitly created", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-onboard-missing-parent-"));
  const missing = join(parent, "missing-target");

  const result = failRun(["scripts/onboard.mjs", "--defaults", "--target", missing]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  run(["scripts/onboard.mjs", "--defaults", "--target", missing, "--create-target"]);
  assert.ok(existsSync(join(missing, "framecore.config.json")));
});

test("onboarding rotates config backups instead of overwriting them", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-backup-"));
  const configPath = join(dir, "framecore.config.json");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  writeFileSync(configPath, "first config\n");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  writeFileSync(configPath, "second config\n");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  assert.equal(readFileSync(join(dir, "framecore.config.json.bak"), "utf8"), "first config\n");
  assert.equal(readFileSync(join(dir, "framecore.config.json.bak.1"), "utf8"), "second config\n");
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

test("install rejects missing targets unless explicitly created", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-install-missing-parent-"));
  const missing = join(parent, "missing-target");

  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", missing]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", missing, "--create-target"]);
  assert.match(output, /would write/);
  assert.equal(existsSync(missing), false);

  run(["scripts/install.mjs", "--mode", "project-local", "--target", missing, "--create-target"]);
  assert.ok(existsSync(join(missing, ".framecore/manifest.json")));
});

test("global install requires explicit confirmation", () => {
  const home = mkdtempSync(join(tmpdir(), "framecore-global-home-"));
  const env = { ...process.env, HOME: home, USERPROFILE: home };

  const blocked = failRun(["scripts/install.mjs", "--mode", "global"], { env });
  assert.notEqual(blocked.status, 0);
  assert.match(`${blocked.stderr}${blocked.stdout}`, /--confirm-global/);
  assert.equal(existsSync(join(home, ".framecore/manifest.json")), false);

  run(["scripts/install.mjs", "--mode", "global", "--confirm-global"], { env });
  assert.ok(existsSync(join(home, ".framecore/manifest.json")));
});

test("interactive onboarding explains the workflow and can keep default role names", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-"));
  const result = await runInteractiveOnboarding(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /This installer adds a structured creative workflow/);
  assert.match(result.stdout, /How this improves your work/);
  assert.match(result.stdout, /Hipson in this setup/);
  assert.match(result.stdout, /What will not be configured/);
  assert.match(result.stdout, /Require QA approval before generated asset delivery/);
  assert.match(result.stdout, /local manifest/);
  assert.match(result.stdout, /Next steps:/);
  assert.match(result.stdout, /docs\/using-the-kit\.md/);
  assert.doesNotMatch(result.stdout, /validation and privacy audit scripts/);
  assert.match(result.stdout, /Use default role names/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.deepEqual(config.agent_display_names, {});
  assert.equal(config.delivery.auto_upload, false);
  assert.equal(config.delivery.delivery_requires_current_user_request, true);
  assert.equal(config.delivery.require_qa_allowlist_for_generated_assets, true);
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

test("installer refuses symlinks in managed write paths", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-symlink-target-"));
  const outside = join(mkdtempSync(join(tmpdir(), "framecore-symlink-outside-")), "outside.md");
  mkdirSync(join(dir, ".agents/skills/humanizer"), { recursive: true });
  writeFileSync(outside, "outside\n");
  try {
    symlinkSync(outside, join(dir, ".agents/skills/humanizer/SKILL.md"));
  } catch {
    t.skip("symlink creation is unavailable in this environment");
    return;
  }

  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", dir, "--force"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /refusing symlink in managed path/);
  assert.equal(readFileSync(outside, "utf8"), "outside\n");
});

test("guided installer runs the safe project-local default path", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-guided-"));
  const output = run(["scripts/guided-install.mjs", "--target", dir, "--defaults", "--yes", "--skip-check"]);
  assert.match(output, /FrameCore guided project-local install/);
  assert.match(output, /Doctor preflight/);
  assert.match(output, /Onboarding/);
  assert.match(output, /Install dry-run/);
  assert.match(output, /Project-local install/);
  assert.match(output, /Installed managed tree/);
  assert.match(output, /Guided install complete/);
  assert.equal(output.includes(dir), false);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  assert.ok(existsSync(join(dir, ".framecore/manifest.json")));
  assert.ok(existsSync(join(dir, ".codex/agents/workflow-orchestrator.toml")));
});

test("smoke install verifies the temporary project-local golden path", () => {
  assert.match(run(["scripts/smoke-install.mjs"]), /smoke install passed/);
});

test("agent compliance fixture verifies minimum installed workflow path", () => {
  assert.match(run(["scripts/agent-compliance-check.mjs"]), /agent compliance check passed/);
});

test("guided installer rejects missing targets and kit repo self-install", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-guided-missing-parent-"));
  const missing = join(parent, "missing-target");
  const missingResult = failRun(["scripts/guided-install.mjs", "--target", missing, "--defaults", "--yes", "--skip-check"]);
  assert.notEqual(missingResult.status, 0);
  assert.match(`${missingResult.stderr}${missingResult.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  const selfResult = failRun(["scripts/guided-install.mjs", "--target", root, "--defaults", "--yes", "--skip-check"]);
  assert.notEqual(selfResult.status, 0);
  assert.match(`${selfResult.stderr}${selfResult.stdout}`, /must be outside this kit repository/);
});

test("install and uninstall preserve user-owned skills, agents, and AGENTS.md", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-owned-"));
  mkdirSync(join(dir, ".agents/skills/user-skill"), { recursive: true });
  mkdirSync(join(dir, ".codex/agents"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/user-skill/SKILL.md"), "user skill\n");
  writeFileSync(join(dir, ".codex/agents/user-agent.toml"), "name = \"user-agent\"\n");
  writeFileSync(join(dir, "AGENTS.md"), "user project instructions\n");

  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  const installOutput = run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);
  assert.match(installOutput, /existing AGENTS\.md was preserved/);
  assert.match(installOutput, /Also read AGENTS\.framecore\.md/);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, "AGENTS.framecore.md")));

  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.managed_paths.includes(".agents/skills"), false);
  assert.equal(manifest.managed_paths.includes(".codex/agents"), false);
  assert.ok(manifest.managed_paths.includes("AGENTS.framecore.md"));
  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.match(output, /existing AGENTS\.md was preserved/);
  assert.match(output, /Also read AGENTS\.framecore\.md/);

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

test("update rotates manifest backups before rewriting", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-manifest-backup-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const firstManifest = readFileSync(manifestPath, "utf8");
  assert.equal(existsSync(`${manifestPath}.bak`), false);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.equal(readFileSync(`${manifestPath}.bak`, "utf8"), firstManifest);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.ok(existsSync(`${manifestPath}.bak.1`));
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
