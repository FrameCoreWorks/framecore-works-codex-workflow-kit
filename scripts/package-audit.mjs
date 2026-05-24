#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { hasHelpFlag, npmArgs, npmCommand, printHelpAndExit } from "./common.mjs";

const allowedRoots = new Set([
  ".agents",
  ".codex",
  "config",
  "docs",
  "examples",
  "scripts",
  "tests",
]);

const allowedRootFiles = new Set([
  ".editorconfig",
  ".gitattributes",
  "AGENTS.template.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "MAINTAINERS.md",
  "NOTICE",
  "README.md",
  "SECURITY.md",
  "SUPPORT.md",
  "package.json",
]);

const forbiddenSegments = new Set([
  ".git",
  ".framecore",
  "node_modules",
  "coverage",
  "dist",
  "build",
  "output",
  "outputs",
  "cache",
  ".cache",
  "tmp",
  "temp",
]);

const forbiddenFilePatterns = [
  /^package-lock\.json$/,
  /^npm-debug\.log$/,
  /^\.DS_Store$/,
  /^._/,
  /^\.env(?:\.|$)/,
  /^\.npmrc$/,
  /\.bak(?:\.\d+)?$/,
  /\.log$/,
  /\.tgz$/,
  /\.zip$/,
  /\.tar$/,
  /\.tar\.gz$/,
  /\.pem$/,
  /\.key$/,
  /credential/i,
  /secret/i,
  /token/i,
];

function packageFiles() {
  const result = spawnSync(npmCommand(), npmArgs(["pack", "--json", "--dry-run"]), {
    encoding: "utf8",
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE ?? join(tmpdir(), "framecore-npm-cache"),
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error("npm pack --json --dry-run failed");
  }
  const packages = JSON.parse(result.stdout);
  const files = packages?.[0]?.files;
  if (!Array.isArray(files)) throw new Error("npm pack output did not include a files list");
  return files.map((entry) => entry.path);
}

function auditPath(path) {
  const findings = [];
  const segments = path.split("/");
  const root = segments[0];
  const fileName = basename(path);

  if (!allowedRoots.has(root) && !allowedRootFiles.has(path)) {
    findings.push(`unexpected package path root: ${path}`);
  }
  for (const segment of segments) {
    if (forbiddenSegments.has(segment)) findings.push(`forbidden package path segment: ${path}`);
  }
  for (const pattern of forbiddenFilePatterns) {
    if (pattern.test(fileName)) findings.push(`forbidden package file pattern: ${path}`);
  }
  return findings;
}

export function runPackageAudit() {
  const findings = [];
  const files = packageFiles();
  for (const file of files) findings.push(...auditPath(file));

  if (findings.length > 0) {
    for (const finding of findings) console.error(`[PACKAGE_AUDIT] ${finding}`);
    return 1;
  }

  console.log(`package audit passed (${files.length} files)`);
  return 0;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/package-audit.mjs

Purpose:
  Verify npm package dry-run contents before release.

Options:
  --help, -h  Show this help output.

Checks:
  Runs npm pack --json --dry-run with a temporary npm cache, then rejects unexpected roots,
  local configs, generated output, caches, backups, logs, archives, secrets, and AppleDouble files.
`);
}

try {
  process.exit(runPackageAudit());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
