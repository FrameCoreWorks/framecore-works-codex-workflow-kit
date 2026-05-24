import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function isMainModule(metaUrl) {
  return process.argv[1] ? resolve(fileURLToPath(metaUrl)) === resolve(process.argv[1]) : false;
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readText(path) {
  return readFileSync(path, "utf8");
}

export function hasHelpFlag() {
  return process.argv.includes("--help") || process.argv.includes("-h");
}

export function printHelpAndExit(text) {
  console.log(text.trim());
  process.exit(0);
}

export function npmCommand() {
  return process.platform === "win32" ? "cmd.exe" : "npm";
}

export function npmArgs(args) {
  return process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
}

export function decodeBase64List(values) {
  return values.map((value) => Buffer.from(value, "base64").toString("utf8"));
}

export function toPosixPath(value) {
  return value.replaceAll("\\", "/");
}

export function relativePosix(from, to) {
  return toPosixPath(relative(from, to));
}

/**
 * Refuses managed writes that would escape the target workspace or pass through
 * a symlink. This keeps install/update/repair from following pre-planted links.
 */
export function assertNoSymlinkPath(root, destination) {
  const resolvedRoot = resolve(root);
  const resolvedDestination = resolve(destination);
  if (resolvedDestination !== resolvedRoot && !resolvedDestination.startsWith(`${resolvedRoot}${sep}`)) {
    throw new Error(`refusing managed path outside target: ${relativePosix(resolvedRoot, resolvedDestination)}`);
  }

  const parts = relative(resolvedRoot, resolvedDestination).split(/[\\/]+/).filter(Boolean);
  let current = resolvedRoot;
  for (const part of parts) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) {
      throw new Error(`refusing symlink in managed path: ${relativePosix(resolvedRoot, current)}`);
    }
  }
}

/**
 * Recursively lists regular files without following symlinks. Callers can
 * report symlinks through onSymlink while keeping outside targets unread.
 */
export function walkFiles(root, options = {}) {
  const excludes = new Set((options.excludes ?? []).map(toPosixPath));
  const files = [];
  const onSymlink = typeof options.onSymlink === "function" ? options.onSymlink : () => {};

  function visit(dir) {
    if (!existsSync(dir)) return;

    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const rel = relativePosix(root, path);

      if ([...excludes].some((item) => rel === item || rel.startsWith(`${item}/`))) {
        continue;
      }

      const stats = lstatSync(path);
      if (stats.isSymbolicLink()) {
        onSymlink(path);
        continue;
      }
      if (stats.isDirectory()) {
        visit(path);
      } else if (stats.isFile()) {
        files.push(path);
      }
    }
  }

  visit(root);
  return files;
}

export function isAppleDouble(path) {
  return basename(path).startsWith("._");
}

export function reportFindings(findings, okMessage) {
  if (findings.length === 0) {
    console.log(okMessage);
    return 0;
  }

  for (const finding of findings) {
    console.error(`[${finding.code}] ${finding.message}`);
    for (const file of finding.files ?? []) {
      console.error(`  - ${file}`);
    }
  }
  return 1;
}
