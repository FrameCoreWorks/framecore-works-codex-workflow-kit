import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

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
  const sidecar = join(dir, "._framecore-help-test");
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
  const currentVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  assert.match(run(["scripts/release-readiness.mjs", "--tag", `v${currentVersion}`]), /release readiness passed/);

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
