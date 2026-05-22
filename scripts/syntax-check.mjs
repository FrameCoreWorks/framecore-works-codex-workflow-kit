#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { hasHelpFlag, isAppleDouble, printHelpAndExit, relativePosix, repoRoot, walkFiles } from "./common.mjs";

function syntaxFiles() {
  return walkFiles(repoRoot, {
    excludes: [".git", "node_modules", ".framecore", "coverage", "dist", "build", "output", "outputs", "cache", ".cache", "tmp", "temp"],
  }).filter((file) => file.endsWith(".mjs") && !isAppleDouble(file));
}

export function runSyntaxCheck() {
  const findings = [];
  const files = syntaxFiles();

  for (const file of files) {
    if (!existsSync(file)) continue;
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    if (result.error) throw result.error;
    if (result.status !== 0) {
      findings.push({
        file: relativePosix(repoRoot, file),
        output: `${result.stdout}${result.stderr}`.trim(),
      });
    }
  }

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`[SYNTAX_CHECK] ${finding.file}`);
      if (finding.output) console.error(finding.output);
    }
    return 1;
  }

  console.log(`syntax check passed (${files.length} files)`);
  return 0;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/syntax-check.mjs

Purpose:
  Verify JavaScript module syntax without installing lint or formatting dependencies.

Options:
  --help, -h  Show this help output.

Checks:
  Runs node --check against repository .mjs files under scripts and tests while excluding
  git metadata, generated output, caches, package folders, and temporary directories.
`);
}

try {
  process.exit(runSyntaxCheck());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
