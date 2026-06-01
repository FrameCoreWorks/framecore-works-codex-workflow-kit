import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { npmArgs, npmCommand, repoRoot } from "./common.mjs";

const PACKAGE_STAGE_PREFIX = "framecore-package-stage-";
const PACKAGE_PACK_TIMEOUT_MS = 30_000;

function packageFileEntries() {
  const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
  return [...new Set(["package.json", ...(packageJson.files ?? [])])];
}

function assertInsideRepo(path) {
  const resolvedRoot = resolve(repoRoot);
  const resolvedPath = resolve(path);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${sep}`)) {
    throw new Error(`refusing to stage package path outside repo: ${path}`);
  }
}

function stagePackageSource() {
  const stageRoot = mkdtempSync(join(tmpdir(), PACKAGE_STAGE_PREFIX));

  for (const entry of packageFileEntries()) {
    const cleanEntry = entry.replace(/\/+$/, "");
    if (!cleanEntry) continue;

    const source = resolve(repoRoot, cleanEntry);
    assertInsideRepo(source);
    if (!existsSync(source)) continue;

    const destination = join(stageRoot, cleanEntry);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination, {
      dereference: false,
      preserveTimestamps: true,
      recursive: true,
    });
  }

  return stageRoot;
}

export function runNpmPackDryRun(args) {
  const stageRoot = stagePackageSource();

  try {
    return spawnSync(npmCommand(), npmArgs(["pack", "--dry-run", ...args]), {
      cwd: stageRoot,
      encoding: "utf8",
      timeout: PACKAGE_PACK_TIMEOUT_MS,
      env: {
        ...process.env,
        NO_UPDATE_NOTIFIER: "1",
        NPM_CONFIG_AUDIT: "false",
        NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE ?? join(tmpdir(), "framecore-npm-cache"),
        NPM_CONFIG_FUND: "false",
        NPM_CONFIG_UPDATE_NOTIFIER: "false",
        npm_config_audit: "false",
        npm_config_cache: process.env.NPM_CONFIG_CACHE ?? join(tmpdir(), "framecore-npm-cache"),
        npm_config_fund: "false",
        npm_config_update_notifier: "false",
      },
    });
  } finally {
    rmSync(stageRoot, { force: true, recursive: true });
  }
}
