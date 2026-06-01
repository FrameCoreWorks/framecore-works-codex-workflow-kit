#!/usr/bin/env node
import { hasHelpFlag, printHelpAndExit } from "./common.mjs";
import { runNpmPackDryRun } from "./package-common.mjs";

function listPackage() {
  const result = runNpmPackDryRun([]);

  if (result.error) throw result.error;
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.status ?? 1;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/package-list.mjs

Purpose:
  List npm package dry-run contents with a temporary npm cache for reproducible release review.

Options:
  --help, -h  Show this help output.

Notes:
  This is a read-only package preview. Use npm run package:audit for the enforced package gate.
`);
}

try {
  process.exit(listPackage());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
