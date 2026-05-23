#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { homedir } from "node:os";
import { assertNoSymlinkPath, hasHelpFlag, printHelpAndExit, readJson, repoRoot, walkFiles } from "./common.mjs";
import { assertValidManifest, resolveManagedPath, sha256File } from "./manifest.mjs";
import { renderAgents } from "./render-agents.mjs";
import { assertValidFrameCoreConfig } from "./config-validation.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
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

/**
 * Builds the ownership record for the target workspace. Hashes are captured
 * only for files that already exist, so the first incomplete manifest can be
 * written before managed files are copied.
 */
function buildManifest({ target, managedPaths, manifestRel, incomplete = false }) {
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
    incomplete,
    kit: {
      name: packageInfo.name,
      version: packageInfo.version
    },
    managed_paths: managedPaths,
    managed_hashes: managedHashes
  };
}

/**
 * Writes the manifest and optionally rotates the previous manifest first.
 * Existing installs keep one backup before update/repair changes ownership.
 */
function writeManifestFile({ manifestPath, manifest, backupExisting }) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  if (backupExisting && existsSync(manifestPath)) {
    writeFileSync(nextBackupPath(manifestPath), readFileSync(manifestPath, "utf8"));
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function nextBackupPath(destination) {
  const first = `${destination}.bak`;
  if (!existsSync(first)) return first;
  let index = 1;
  while (existsSync(`${first}.${index}`)) index += 1;
  return `${first}.${index}`;
}

/**
 * Writes one FrameCore-managed file after ownership and symlink checks. Dry-run
 * uses the same checks so conflicts are reported before real writes.
 */
function writeManagedFile({ target, destination, content, dryRun, planned, managed, previousManaged, force, includeManagedPath = () => true }) {
  const rel = toManifestPath(target, destination);
  if (!includeManagedPath(rel)) return false;
  assertNoSymlinkPath(target, destination);
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

/**
 * Chooses whether FrameCore may own AGENTS.md or must write AGENTS.framecore.md.
 * Existing user instructions are preserved unless --force is explicit.
 */
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
  const force = hasFlag("--force");
  if (mode === "global" && !hasFlag("--confirm-global")) {
    throw new Error("global install writes to the current user's home workspace. Re-run with --confirm-global only if this is intentional.");
  }
  ensureTarget(target, mode, hasFlag("--create-target"));
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
      if (hasFlag("--yes")) rmSync(item.path, { force: true });
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
    dryRun: true,
    planned,
    managed,
    previousManaged,
    force,
    includeManagedPath,
  });

  const renderedAgents = renderAgents({ target: installTarget, configPath, dryRun: true, previousManaged, force, includeManagedPath });
  planned.push(...renderedAgents);
  managed.push(...renderedAgents.map((file) => toManifestPath(target, file)));

  const agentsInstructionPath = chooseAgentsInstructionPath({ target, previousManaged, force, repair });
  const wroteFrameCoreAgents = agentsInstructionPath && toManifestPath(target, agentsInstructionPath) === "AGENTS.framecore.md";
  if (agentsInstructionPath) {
    writeManagedFile({
      target,
      destination: agentsInstructionPath,
      content: readFileSync(join(repoRoot, "AGENTS.template.md"), "utf8"),
      dryRun: true,
      planned,
      managed,
      previousManaged,
      force,
      includeManagedPath,
    });
  }

  const manifestPath = join(target, ".framecore/manifest.json");
  assertNoSymlinkPath(target, manifestPath);
  const manifestRel = toManifestPath(target, manifestPath);
  planned.push(manifestPath);
  const manifestManaged = repair ? [...previousManaged] : [...new Set([...managed, manifestRel])].sort();
  if (!repair) managed.push(manifestRel);

  if (!dryRun) {
    writeManifestFile({
      manifestPath,
      manifest: buildManifest({ target, managedPaths: manifestManaged, manifestRel, incomplete: true }),
      backupExisting: existsSync(manifestPath),
    });

    const written = [];
    const writtenManaged = [];
    copySkillFiles({
      target,
      source: join(repoRoot, ".agents/skills"),
      destination: skillsTarget,
      dryRun: false,
      planned: written,
      managed: writtenManaged,
      previousManaged,
      force,
      includeManagedPath,
    });
    renderAgents({ target: installTarget, configPath, dryRun: false, previousManaged, force, includeManagedPath });
    if (agentsInstructionPath) {
      writeManagedFile({
        target,
        destination: agentsInstructionPath,
        content: readFileSync(join(repoRoot, "AGENTS.template.md"), "utf8"),
        dryRun: false,
        planned: written,
        managed: writtenManaged,
        previousManaged,
        force,
        includeManagedPath,
      });
    }
    writeManifestFile({
      manifestPath,
      manifest: buildManifest({ target, managedPaths: manifestManaged, manifestRel, incomplete: false }),
      backupExisting: false,
    });
  }

  for (const item of planned) {
    console.log(`${dryRun ? "would write" : "wrote"} ${item}`);
  }
  if (wroteFrameCoreAgents) {
    console.log("note: existing AGENTS.md was preserved. Ask Codex to read both AGENTS.md and AGENTS.framecore.md.");
    console.log("optional pointer for your existing AGENTS.md: Also read AGENTS.framecore.md for FrameCore Works workflow instructions.");
  }
}

const mode = argValue("--mode", "dry-run");
if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/install.mjs --mode <dry-run|project-local|global|update|repair|uninstall> [--target <path>] [--force] [--yes] [--create-target] [--confirm-global]

Purpose:
  Install, update, repair, preview, or uninstall FrameCore-managed workflow files.

Options:
  --mode <mode>    Operation mode. Defaults to dry-run.
  --target <path>  Target workspace for project-local, dry-run, update, repair, or uninstall.
  --force          Allow overwriting user-owned conflicting files after creating backups.
  --yes            Apply uninstall removals after preview.
  --create-target  Allow a missing target path. Dry-run simulates it without creating folders; write modes create it.
  --confirm-global Confirm that --mode global should write to the current user's home workspace.

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
  Global install requires --confirm-global.
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
