#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { hasHelpFlag, printHelpAndExit, readJson, repoRoot, walkFiles } from "./common.mjs";
import { assertValidFrameCoreConfig } from "./config-validation.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function toManifestPath(target, destination) {
  return relative(target, destination).replaceAll(sep, "/");
}

function resolveManagedPath(target, entry) {
  if (typeof entry !== "string" || entry.length === 0 || isAbsolute(entry) || entry.split(/[\\/]+/).includes("..")) {
    throw new Error(`unsafe managed path: ${entry}`);
  }
  const root = resolve(target);
  const resolved = resolve(root, entry);
  if (resolved === root || !resolved.startsWith(`${root}${sep}`)) {
    throw new Error(`managed path outside target: ${entry}`);
  }
  return resolved;
}

function readManifest(target) {
  const manifestPath = join(target, ".framecore/manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateManifest(target, manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return ["manifest must be a JSON object"];
  if (manifest.schema_version !== 1) errors.push("manifest schema_version must be 1");
  if (!Array.isArray(manifest.managed_paths)) {
    errors.push("manifest managed_paths must be an array");
    return errors;
  }

  const seen = new Set();
  for (const entry of manifest.managed_paths) {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      errors.push("manifest managed_paths must contain non-empty strings");
      continue;
    }
    if (seen.has(entry)) {
      errors.push(`manifest contains duplicate managed path: ${entry}`);
    }
    seen.add(entry);
    try {
      const resolved = resolveManagedPath(target, entry);
      if (existsSync(resolved) && statSync(resolved).isDirectory()) {
        errors.push(`manifest managed path points to a directory: ${entry}`);
      }
    } catch {
      errors.push("manifest contains an unsafe managed path entry");
    }
  }
  return errors;
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
  const result = spawnSync("npm", ["--version"], { encoding: "utf8" });
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
  if (existsSync(configPath)) {
    try {
      assertValidFrameCoreConfig(readJson(configPath));
      ok("framecore.config.json is valid.");
    } catch (error) {
      fail(`framecore.config.json is invalid: ${error.message}`);
    }
  } else if (mode === "project-local" || mode === "update" || mode === "repair") {
    warn("framecore.config.json is missing. Run onboarding before installation for tuned preferences.");
  } else {
    ok("No framecore.config.json required for this preflight mode.");
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
