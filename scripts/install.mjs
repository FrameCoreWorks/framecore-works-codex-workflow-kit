#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { homedir } from "node:os";
import { repoRoot } from "./common.mjs";
import { renderAgents } from "./render-agents.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function targetForMode(mode) {
  if (mode === "global") return homedir();
  return argValue("--target", process.cwd());
}

function writeManagedFile(destination, content, dryRun, planned) {
  planned.push(destination);
  if (dryRun) return;
  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination)) {
    writeFileSync(`${destination}.bak`, readFileSync(destination, "utf8"));
  }
  writeFileSync(destination, content);
}

function copyDir(source, destination, dryRun, planned) {
  planned.push(destination);
  if (dryRun) return;
  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination)) {
    cpSync(destination, `${destination}.bak`, { recursive: true, force: true });
  }
  cpSync(source, destination, { recursive: true, force: true });
}

function install({ mode }) {
  const dryRun = mode === "dry-run";
  const target = targetForMode(mode);
  const planned = [];

  if (mode === "uninstall") {
    const manifestPath = join(target, ".framecore/manifest.json");
    if (!existsSync(manifestPath)) {
      console.log("no manifest found");
      return;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const file of manifest.managed_paths ?? []) {
      console.log(`remove ${file}`);
      if (!process.argv.includes("--yes")) continue;
      rmSync(join(target, file), { recursive: true, force: true });
    }
    return;
  }

  const configPath = join(target, "framecore.config.json");
  const skillsTarget = mode === "global" ? join(homedir(), ".agents/skills") : join(target, ".agents/skills");
  const agentsTarget = mode === "global" ? join(homedir(), ".codex/agents") : join(target, ".codex/agents");

  copyDir(join(repoRoot, ".agents/skills"), skillsTarget, dryRun, planned);
  planned.push(...renderAgents({ target: mode === "global" ? homedir() : target, configPath, dryRun }));
  writeManagedFile(join(target, "AGENTS.md"), readFileSync(join(repoRoot, "AGENTS.template.md"), "utf8"), dryRun, planned);

  if (!dryRun) {
    mkdirSync(join(target, ".framecore"), { recursive: true });
    writeFileSync(join(target, ".framecore/manifest.json"), `${JSON.stringify({
      schema_version: 1,
      managed_paths: [
        relative(target, skillsTarget),
        relative(target, agentsTarget),
        "AGENTS.md"
      ]
    }, null, 2)}\n`);
  }

  for (const item of planned) {
    console.log(`${dryRun ? "would write" : "wrote"} ${item}`);
  }
}

const mode = argValue("--mode", "dry-run");
const allowed = new Set(["dry-run", "project-local", "global", "update", "repair", "uninstall"]);
if (!allowed.has(mode)) {
  console.error(`unknown mode: ${mode}`);
  process.exit(1);
}

install({ mode: mode === "update" || mode === "repair" ? "project-local" : mode });
