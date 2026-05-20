import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, relative, resolve } from "node:path";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readText(path) {
  return readFileSync(path, "utf8");
}

export function decodeBase64List(values) {
  return values.map((value) => Buffer.from(value, "base64").toString("utf8"));
}

export function walkFiles(root, options = {}) {
  const excludes = new Set(options.excludes ?? []);
  const files = [];

  function visit(dir) {
    if (!existsSync(dir)) return;

    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const rel = relative(root, path);

      if ([...excludes].some((item) => rel === item || rel.startsWith(`${item}/`))) {
        continue;
      }

      const stats = statSync(path);
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
