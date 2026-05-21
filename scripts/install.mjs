#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { homedir } from "node:os";
import { hasHelpFlag, printHelpAndExit, readJson, repoRoot, walkFiles } from "./common.mjs";
import { assertValidManifest, resolveManagedPath, sha256File } from "./manifest.mjs";
import { renderAgents } from "./render-agents.mjs";
import { assertValidFrameCoreConfig } from "./config-validation.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function targetForMode(mode) {
  if (mode === "global") return homedir();
  return argValue("--target", process.cwd());
}

function ensureTarget(target, mode, createTarget) {
  if (mode === "global") return;
  if (!existsSync(target)) {
    if (!createTarget) {
      throw new Error("target workspace does not exist. Create or choose the workspace first, or rerun with --create-target.");
    }
    if (mode === "dry-run") return;
    mkdirSync(target, { recursive: true });
  }
  if (!statSync(target).isDirectory()) {
    throw new Error("target workspace is not a directory.");
  }
}

function toManifestPath(target, destination) {
  return relative(target, destination).replaceAll(sep, "/");
}

function readManifest(target) {
  const manifestPath = join(target, ".framecore/manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function buildManifest({ target, managedPaths, manifestRel }) {
  const packageInfo = readJson(join(repoRoot, "package.json"));
  const managedHashes = {};
  for (const entry of managedPaths) {
    if (entry === manifestRel) continue;
    const path = resolveManagedPath(target, entry);
    if (existsSync(path) && statSync(path).isFile()) {
      managedHashes[entry] = sha256File(path);
    }
  }
  return {
    schema_version: 1,
    kit: {
      name: packageInfo.name,
      version: packageInfo.version
    },
    managed_paths: managedPaths,
    managed_hashes: managedHashes
  };
}

function nextBackupPath(destination) {
  const first = `${destination}.bak`;
  if (!existsSync(first)) return first;
  let index = 1;
  while (existsSync(`${first}.${index}`)) index += 1;
  return `${first}.${index}`;
}

function writeManagedFile({ target, destination, content, dryRun, planned, managed, previousManaged, force, includeManagedPath = () => true }) {
  const rel = toManifestPath(target, destination);
  if (!includeManagedPath(rel)) return false;
  planned.push(destination);
  managed.push(rel);

  if (existsSync(destination) && !previousManaged.has(rel) && !force) {
    throw new Error(`refusing to overwrite user-owned file: ${rel}. Re-run with --force only if this is intentional.`);
  }

  if (dryRun) return;

  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination)) {
    writeFileSync(nextBackupPath(destination), readFileSync(destination, "utf8"));
  }
  writeFileSync(destination, content);
  return true;
}

function copySkillFiles({ target, source, destination, dryRun, planned, managed, previousManaged, force, includeManagedPath }) {
  for (const file of walkFiles(source)) {
    const rel = relative(source, file);
    writeManagedFile({
      target,
      destination: join(destination, rel),
      content: readFileSync(file, "utf8"),
      dryRun,
      planned,
      managed,
      previousManaged,
      force,
      includeManagedPath,
    });
  }
}

function chooseAgentsInstructionPath({ target, previousManaged, force, repair }) {
  const primary = join(target, "AGENTS.md");
  const primaryRel = toManifestPath(target, primary);
  if (repair) {
    if (previousManaged.has(primaryRel)) return primary;
    const framecore = join(target, "AGENTS.framecore.md");
    const framecoreRel = toManifestPath(target, framecore);
    if (previousManaged.has(framecoreRel)) return framecore;
    return null;
  }
  if (!existsSync(primary) || previousManaged.has(primaryRel) || force) return primary;
  return join(target, "AGENTS.framecore.md");
}

function install({ mode }) {
  const dryRun = mode === "dry-run";
  const repair = mode === "repair";
  const update = mode === "update";
  const target = targetForMode(mode);
  const force = process.argv.includes("--force");
  ensureTarget(target, mode, process.argv.includes("--create-target"));
  const planned = [];
  const managed = [];
  const previousManifest = readManifest(target);
  if (previousManifest) assertValidManifest(target, previousManifest);

  if (mode === "uninstall") {
    const manifest = previousManifest;
    if (!manifest) {
      console.log("no manifest found");
      return;
    }
    const removals = (manifest.managed_paths ?? []).map((entry) => ({
      entry,
      path: resolveManagedPath(target, entry),
    }));
    for (const item of removals) {
      if (existsSync(item.path) && statSync(item.path).isDirectory()) {
        throw new Error(`refusing to remove directory managed path: ${item.entry}`);
      }
    }
    for (const item of removals) {
      console.log(`remove ${item.entry}`);
      if (process.argv.includes("--yes")) rmSync(item.path, { force: true });
    }
    return;
  }

  const configPath = join(target, "framecore.config.json");
  if (!existsSync(configPath) && !dryRun) {
    console.log("warning: framecore.config.json not found; rendering agents with built-in defaults. Run onboarding first for tuned preferences.");
  }
  if (existsSync(configPath)) {
    assertValidFrameCoreConfig(readJson(configPath));
  }
  const skillsTarget = mode === "global" ? join(homedir(), ".agents/skills") : join(target, ".agents/skills");
  const installTarget = mode === "global" ? homedir() : target;
  const previousManaged = new Set(previousManifest?.managed_paths ?? []);
  if ((repair || update) && !previousManifest) {
    throw new Error(`${mode} requires .framecore/manifest.json. Run project-local install first.`);
  }
  const includeManagedPath = repair ? (rel) => previousManaged.has(rel) : () => true;

  copySkillFiles({
    target,
    source: join(repoRoot, ".agents/skills"),
    destination: skillsTarget,
    dryRun,
    planned,
    managed,
    previousManaged,
    force,
    includeManagedPath,
  });

  const renderedAgents = renderAgents({ target: installTarget, configPath, dryRun, previousManaged, force, includeManagedPath });
  planned.push(...renderedAgents);
  managed.push(...renderedAgents.map((file) => toManifestPath(target, file)));

  const agentsInstructionPath = chooseAgentsInstructionPath({ target, previousManaged, force, repair });
  if (agentsInstructionPath) {
    writeManagedFile({
      target,
      destination: agentsInstructionPath,
      content: readFileSync(join(repoRoot, "AGENTS.template.md"), "utf8"),
      dryRun,
      planned,
      managed,
      previousManaged,
      force,
      includeManagedPath,
    });
  }

  const manifestPath = join(target, ".framecore/manifest.json");
  const manifestRel = toManifestPath(target, manifestPath);
  planned.push(manifestPath);
  const manifestManaged = repair ? [...previousManaged] : [...new Set([...managed, manifestRel])].sort();
  if (!repair) managed.push(manifestRel);

  if (!dryRun) {
    mkdirSync(join(target, ".framecore"), { recursive: true });
    writeFileSync(manifestPath, `${JSON.stringify(buildManifest({ target, managedPaths: manifestManaged, manifestRel }), null, 2)}\n`);
  }

  for (const item of planned) {
    console.log(`${dryRun ? "would write" : "wrote"} ${item}`);
  }
}

const mode = argValue("--mode", "dry-run");
if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/install.mjs --mode <dry-run|project-local|global|update|repair|uninstall> [--target <path>] [--force] [--yes] [--create-target]

Purpose:
  Install, update, repair, preview, or uninstall FrameCore-managed workflow files.

Options:
  --mode <mode>    Operation mode. Defaults to dry-run.
  --target <path>  Target workspace for project-local, dry-run, update, repair, or uninstall.
  --force          Allow overwriting user-owned conflicting files after creating backups.
  --yes            Apply uninstall removals after preview.
  --create-target  Allow a missing target path. Dry-run simulates it without creating folders; write modes create it.

Modes:
  dry-run        Report planned writes without changing files.
  project-local  Install into the target workspace.
  global         Install into the current user's home workspace.
  update         Update an existing install. Requires .framecore/manifest.json.
  repair         Recreate only manifest-recorded files. Requires .framecore/manifest.json.
  uninstall      Preview manifest-recorded removals. Use --yes to apply.

Safety:
  --force only bypasses user-owned file overwrite protection. It does not bypass config validation.
  By default, project-local modes require an existing target workspace.
`);
}
const allowed = new Set(["dry-run", "project-local", "global", "update", "repair", "uninstall"]);
if (!allowed.has(mode)) {
  console.error(`unknown mode: ${mode}`);
  process.exit(1);
}

try {
  install({ mode });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
