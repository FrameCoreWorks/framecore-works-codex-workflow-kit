#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { hasHelpFlag, printHelpAndExit, readJson, readText, repoRoot } from "./common.mjs";

const expected = {
  name: "framecore-works-codex-workflow-kit",
  license: "Apache-2.0",
  repositoryUrl: "git+https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git",
  bugsUrl: "https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/issues",
  homepage: "https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit#readme",
};

const requiredPackageFiles = [
  ".agents/",
  ".codex/",
  "config/",
  "docs/",
  "examples/",
  "scripts/",
  "templates/",
  "tools/",
  "tests/",
  "AGENTS.template.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "NOTICE",
  "README.md",
  "SECURITY.md",
  "SUPPORT.md",
];

function argValue(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

function releaseTag() {
  const explicit = argValue("--tag") ?? process.env.FRAMECORE_RELEASE_TAG;
  if (explicit) return explicit;
  const githubRef = process.env.GITHUB_REF_NAME;
  if (githubRef?.startsWith("v")) return githubRef;
  return undefined;
}

function isSemver(value) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

function add(finding, message) {
  finding.push(message);
}

export function runReleaseReadiness() {
  const findings = [];
  const packagePath = join(repoRoot, "package.json");
  const changelogPath = join(repoRoot, "CHANGELOG.md");
  const releaseTemplatePath = join(repoRoot, "docs/release-notes-template.md");

  if (!existsSync(packagePath)) add(findings, "package.json is missing.");
  if (!existsSync(changelogPath)) add(findings, "CHANGELOG.md is missing.");
  if (!existsSync(releaseTemplatePath)) add(findings, "docs/release-notes-template.md is missing.");
  if (findings.length > 0) return fail(findings);

  const pkg = readJson(packagePath);
  const changelog = readText(changelogPath);

  if (pkg.name !== expected.name) add(findings, `package name must be ${expected.name}.`);
  if (pkg.private !== false) add(findings, "package private must be false for public release readiness.");
  if (pkg.license !== expected.license) add(findings, `package license must be ${expected.license}.`);
  if (pkg.repository?.url !== expected.repositoryUrl) add(findings, "package repository URL does not match the public GitHub repo.");
  if (pkg.bugs?.url !== expected.bugsUrl) add(findings, "package bugs URL does not match the public GitHub issues URL.");
  if (pkg.homepage !== expected.homepage) add(findings, "package homepage does not match the public README URL.");
  if (!isSemver(pkg.version)) add(findings, `package version is not valid semver: ${pkg.version}`);
  if (!String(pkg.packageManager ?? "").startsWith("npm@")) add(findings, "packageManager must pin npm.");
  if (pkg.scripts?.prepublishOnly !== "npm run release:check") {
    add(findings, "package scripts.prepublishOnly must run npm run release:check.");
  }

  const packageFiles = new Set(pkg.files ?? []);
  for (const file of requiredPackageFiles) {
    if (!packageFiles.has(file)) add(findings, `package files must include ${file}.`);
  }

  if (!changelog.includes("## Unreleased")) add(findings, "CHANGELOG.md must contain an Unreleased section.");
  if (!changelog.includes(`## ${pkg.version} -`)) {
    add(findings, `CHANGELOG.md must contain a release entry for package version ${pkg.version}.`);
  }

  const tag = releaseTag();
  if (tag && tag !== `v${pkg.version}`) {
    add(findings, `release tag ${tag} must match package version v${pkg.version}.`);
  }

  if (findings.length > 0) return fail(findings);
  const tagNote = tag ? `tag ${tag}` : "no tag context";
  console.log(`release readiness passed (${pkg.name}@${pkg.version}, ${tagNote})`);
  return 0;
}

function fail(findings) {
  for (const finding of findings) console.error(`[RELEASE_READINESS] ${finding}`);
  return 1;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/release-readiness.mjs [--tag v1.0.0]

Purpose:
  Verify release metadata, changelog entries, and optional tag/version alignment.

Options:
  --tag <tag>  Check an explicit release tag against package.json version.
  --help, -h   Show this help output.

Environment:
  FRAMECORE_RELEASE_TAG  Optional tag value, equivalent to --tag.
  GITHUB_REF_NAME        Used automatically when it starts with "v".
`);
}

process.exit(runReleaseReadiness());
