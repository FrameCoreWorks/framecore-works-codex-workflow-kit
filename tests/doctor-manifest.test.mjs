import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

test("doctor passes clean target without mutating or leaking target path", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-clean-"));
  const output = run(["scripts/doctor.mjs", "--target", dir]);
  assert.match(output, /FrameCore doctor: project-local preflight/);
  assert.match(output, /\[pass\] Target workspace exists/);
  assert.match(output, /\[warn\] FrameCore config is missing/);
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
  assert.match(output, /FrameCore config is invalid/);
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
  assert.equal(manifest.incomplete, false);
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

test("doctor reports incomplete manifests without failing valid hash checks", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-incomplete-"));
  mkdirSync(join(dir, ".framecore"), { recursive: true });
  writeFileSync(join(dir, "AGENTS.md"), "partial install\n");
  writeFileSync(join(dir, ".framecore/manifest.json"), JSON.stringify({
    schema_version: 1,
    incomplete: true,
    kit: {
      name: "framecore-works-codex-workflow-kit",
      version: "1.0.0"
    },
    managed_paths: ["AGENTS.md", ".framecore/manifest.json"],
    managed_hashes: {
      "AGENTS.md": sha256(join(dir, "AGENTS.md"))
    }
  }, null, 2));

  const output = run(["scripts/doctor.mjs", "--mode", "update", "--target", dir]);
  assert.match(output, /Manifest is marked incomplete/);
  assert.match(output, /Managed file hashes match/);
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
    incomplete: "yes",
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
  assert.match(output, /incomplete must be a boolean/);
  assert.match(output, /duplicate managed path/);
  assert.match(output, /unsafe managed path entry/);
  assert.match(output, /managed_hashes contains a path not listed/);
  assert.match(output, /managed_hashes values must be sha256 hex strings/);
  assert.equal(output.includes(localPath), false);
});
