#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join, relative, sep } from "node:path";
import { hasHelpFlag, npmArgs, npmCommand, printHelpAndExit, repoRoot, walkFiles } from "./common.mjs";
import { resolveManagedPath, sha256File, validateManifest } from "./manifest.mjs";
import { assertValidFrameCoreConfig, loadFrameCoreConfig } from "./config-validation.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function toManifestPath(target, destination) {
  return relative(target, destination).replaceAll(sep, "/");
}

function readManifest(target) {
  const manifestPath = join(target, ".framecore/manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function reportManifestIntegrity(target, manifest, ok, warn) {
  if (!manifest?.managed_hashes) {
    warn("Manifest has no managed file hashes. Run update or repair to refresh integrity metadata.");
    return;
  }

  let missing = 0;
  let changed = 0;
  let untracked = 0;
  const hashedEntries = new Set(Object.keys(manifest.managed_hashes));
  for (const [entry, expectedHash] of Object.entries(manifest.managed_hashes)) {
    const path = resolveManagedPath(target, entry);
    if (!existsSync(path)) {
      missing += 1;
      continue;
    }
    if (!statSync(path).isFile()) continue;
    if (sha256File(path) !== expectedHash) changed += 1;
  }
  for (const entry of manifest.managed_paths ?? []) {
    if (entry === ".framecore/manifest.json") continue;
    const path = resolveManagedPath(target, entry);
    if (existsSync(path) && statSync(path).isFile() && !hashedEntries.has(entry)) {
      untracked += 1;
    }
  }
  if (missing > 0) warn(`${missing} managed file(s) recorded in the manifest are missing.`);
  if (changed > 0) warn(`${changed} managed file(s) differ from the manifest hash.`);
  if (untracked > 0) warn(`${untracked} managed file(s) have no manifest hash metadata.`);
  if (missing === 0 && changed === 0 && untracked === 0) ok("Managed file hashes match the current manifest.");
}

function targetForMode(mode) {
  if (mode === "global") return homedir();
  return argValue("--target", process.cwd());
}

function collectSkillDestinations(target, mode, previousManaged) {
  const skillsTarget = mode === "global" ? join(homedir(), ".agents/skills") : join(target, ".agents/skills");
  const source = join(repoRoot, ".agents/skills");
  return walkFiles(source)
    .map((file) => join(skillsTarget, relative(source, file)))
    .filter((destination) => mode !== "repair" || previousManaged.has(toManifestPath(target, destination)));
}

function collectAgentDestinations(target, mode, previousManaged) {
  const agentTarget = mode === "global" ? homedir() : target;
  const targetDir = join(agentTarget, ".codex/agents");
  return readdirSync(join(repoRoot, ".codex/agents"))
    .filter((entry) => entry.endsWith(".toml.template"))
    .map((entry) => join(targetDir, `${entry.replace(/\.toml\.template$/, "")}.toml`))
    .filter((destination) => mode !== "repair" || previousManaged.has(toManifestPath(target, destination)));
}

function chooseAgentsInstructionPath(target, previousManaged, mode, force) {
  const primary = join(target, "AGENTS.md");
  const primaryRel = toManifestPath(target, primary);
  if (mode === "repair") {
    if (previousManaged.has(primaryRel)) return primary;
    const framecore = join(target, "AGENTS.framecore.md");
    const framecoreRel = toManifestPath(target, framecore);
    return previousManaged.has(framecoreRel) ? framecore : null;
  }
  if (!existsSync(primary) || previousManaged.has(primaryRel) || force) return primary;
  return join(target, "AGENTS.framecore.md");
}

function push(items, level, message) {
  items.push({ level, message });
}

function printReport(items, failures, mode) {
  console.log(`FrameCore doctor: ${mode} preflight`);
  console.log("Target: selected workspace");
  for (const item of items) {
    console.log(`[${item.level}] ${item.message}`);
  }
  if (failures.length > 0) {
    console.log("Next: fix the failed item(s), then rerun doctor.");
  } else {
    console.log("Next: run installer dry-run before any real install or update.");
  }
}

function npmVersion() {
  const result = spawnSync(npmCommand(), npmArgs(["--version"]), { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function runDoctor({ mode }) {
  const force = process.argv.includes("--force");
  const target = targetForMode(mode);
  const items = [];
  const failures = [];

  const ok = (message) => push(items, "pass", message);
  const warn = (message) => push(items, "warn", message);
  const fail = (message) => {
    failures.push(message);
    push(items, "fail", message);
  };

  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor >= 20) ok(`Node.js ${process.versions.node} satisfies the >=20 requirement.`);
  else fail(`Node.js ${process.versions.node} is too old. Use Node.js 20 or newer.`);

  const npm = npmVersion();
  if (npm) ok(`npm ${npm} is available.`);
  else warn("npm was not detected. The kit scripts can still run through Node, but README commands use npm.");

  if (!existsSync(target)) {
    fail("Target workspace does not exist.");
    printReport(items, failures, mode);
    return 1;
  }
  if (!statSync(target).isDirectory()) {
    fail("Target workspace is not a directory.");
    printReport(items, failures, mode);
    return 1;
  }
  ok("Target workspace exists.");

  if ((statSync(target).mode & 0o222) === 0) {
    warn("Target workspace does not appear writable from file mode bits.");
  } else {
    ok("Target workspace appears writable.");
  }

  for (const sourcePath of [".agents/skills", ".codex/agents", "AGENTS.template.md", "config/agent-naming.schema.json"]) {
    if (existsSync(join(repoRoot, sourcePath))) ok(`Kit source found: ${sourcePath}`);
    else fail(`Kit source is missing: ${sourcePath}`);
  }

  const configPath = join(target, "framecore.config.json");
  const loadedConfig = loadFrameCoreConfig({ target, configPath });
  if (loadedConfig.localPath || loadedConfig.sharedPath) {
    try {
      assertValidFrameCoreConfig(loadedConfig.config);
      ok("FrameCore config is valid.");
      if (loadedConfig.sharedPath) ok("framecore.config.shared.json was included.");
      if (loadedConfig.localPath) ok("framecore.config.json was included.");
    } catch (error) {
      fail(`FrameCore config is invalid: ${error.message}`);
    }
  } else if (mode === "project-local" || mode === "update" || mode === "repair") {
    warn("FrameCore config is missing. Run onboarding before installation for tuned preferences.");
  } else {
    ok("No FrameCore config required for this preflight mode.");
  }

  let manifest = null;
  try {
    manifest = readManifest(target);
  } catch (error) {
    fail(`manifest cannot be read: ${error.message}`);
  }
  const manifestErrors = manifest ? validateManifest(target, manifest) : [];
  for (const error of manifestErrors) fail(error);
  const previousManaged = manifest && manifestErrors.length === 0 ? new Set(manifest.managed_paths) : new Set();

  if ((mode === "update" || mode === "repair" || mode === "uninstall") && !manifest) {
    fail(`${mode} requires .framecore/manifest.json.`);
  }
  if (manifest) ok("Manifest found.");
  else if (mode === "project-local" || mode === "dry-run") ok("No existing manifest required for first install or dry-run.");
  if (manifest?.incomplete === true) {
    warn("Manifest is marked incomplete. A previous install, update, or repair may have been interrupted.");
  }
  if (manifest && manifestErrors.length === 0) reportManifestIntegrity(target, manifest, ok, warn);

  if (mode === "uninstall") {
    for (const entry of manifest?.managed_paths ?? []) {
      try {
        const resolved = resolveManagedPath(target, entry);
        if (existsSync(resolved) && statSync(resolved).isDirectory()) {
          fail(`Uninstall would refuse directory managed path: ${entry}`);
        }
      } catch {
        fail("manifest contains an unsafe managed path entry");
      }
    }
    printReport(items, failures, mode);
    return failures.length > 0 ? 1 : 0;
  }

  const planned = [
    ...collectSkillDestinations(target, mode, previousManaged),
    ...collectAgentDestinations(target, mode, previousManaged),
  ];
  const agentsInstruction = chooseAgentsInstructionPath(target, previousManaged, mode, force);
  if (agentsInstruction) planned.push(agentsInstruction);
  planned.push(join(target, ".framecore/manifest.json"));

  let conflicts = 0;
  for (const destination of planned) {
    const rel = toManifestPath(target, destination);
    if (existsSync(destination) && !previousManaged.has(rel)) conflicts += 1;
  }

  if (conflicts > 0 && !force) {
    fail(`${conflicts} user-owned path(s) would block this install mode. Run installer dry-run for exact paths.`);
  } else if (conflicts > 0 && force) {
    warn(`${conflicts} user-owned path(s) would be overwritten with backups because --force is set.`);
  } else {
    ok("No user-owned file conflicts detected for this install mode.");
  }

  ok(`${planned.length} managed path(s) checked.`);
  printReport(items, failures, mode);
  return failures.length > 0 ? 1 : 0;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/doctor.mjs [--mode <dry-run|project-local|global|update|repair|uninstall>] [--target <path>] [--force]

Purpose:
  Run a non-mutating preflight check before installing, updating, repairing, or uninstalling FrameCore-managed files.

Options:
  --mode <mode>    Preflight mode. Defaults to project-local.
  --target <path>  Target workspace for project-local, dry-run, update, repair, or uninstall checks.
  --force          Report conflict behavior as if the installer would run with --force.
`);
}

const mode = argValue("--mode", "project-local");
const allowed = new Set(["dry-run", "project-local", "global", "update", "repair", "uninstall"]);
if (!allowed.has(mode)) {
  console.error(`unknown mode: ${mode}`);
  process.exit(1);
}

process.exit(runDoctor({ mode }));
