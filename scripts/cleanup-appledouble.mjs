#!/usr/bin/env node
import { rmSync } from "node:fs";
import { relative } from "node:path";
import { hasHelpFlag, isAppleDouble, printHelpAndExit, repoRoot, walkFiles } from "./common.mjs";

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/cleanup-appledouble.mjs [--apply]

Purpose:
  Find or remove AppleDouble metadata sidecar files from the repo workspace.

Options:
  --apply  Delete matching files. Without --apply, only reports them.

Behavior:
  Without --apply, reports AppleDouble metadata files. With --apply, deletes them from the repo workspace.
`);
}

const apply = process.argv.includes("--apply");
const files = walkFiles(repoRoot, { excludes: [".git", "node_modules"] }).filter(isAppleDouble);

for (const file of files) {
  console.log(`${apply ? "delete" : "would delete"} ${relative(repoRoot, file)}`);
  if (apply) rmSync(file);
}

if (files.length === 0) {
  console.log("no AppleDouble files found");
}
