#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { hasHelpFlag, npmArgs, npmCommand, printHelpAndExit, repoRoot } from "./common.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function isInsideRepo(target) {
  const rel = relative(repoRoot, target);
  return rel === "" || (!rel.startsWith("..") && rel !== "." && !isAbsolute(rel));
}

function requireExistingTarget(target) {
  if (!target) {
    throw new Error("missing --target. Choose an existing Codex workspace folder.");
  }
  if (!existsSync(target)) {
    throw new Error("target workspace does not exist. Create or choose the workspace first, then rerun guided install.");
  }
  if (!statSync(target).isDirectory()) {
    throw new Error("target workspace is not a directory.");
  }
  if (isInsideRepo(target)) {
    throw new Error("target workspace must be outside this kit repository. Choose the project where Codex should use FrameCore.");
  }
}

function redacted(text, target) {
  return text.replaceAll(target, "<target>");
}

function printOutput(result, target) {
  if (result.stdout) process.stdout.write(redacted(result.stdout, target));
  if (result.stderr) process.stderr.write(redacted(result.stderr, target));
}

function runNodeStep(label, args, { target, interactive = false } = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: interactive ? undefined : "utf8",
    stdio: interactive ? "inherit" : "pipe",
  });
  if (!interactive) printOutput(result, target);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`step failed: ${label}`);
}

function runNpmCheck({ target }) {
  console.log("\n== Repository checks ==");
  const result = spawnSync(npmCommand(), npmArgs(["run", "check"]), {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE ?? join(tmpdir(), "framecore-npm-cache"),
    },
  });
  printOutput(result, target);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("step failed: Repository checks");
}

function printAgentsInstructionPlan(target) {
  const agentsPath = join(target, "AGENTS.md");
  if (existsSync(agentsPath)) {
    console.log("\nAGENTS.md already exists in the target. Project-local install will preserve it and write AGENTS.framecore.md.");
  } else {
    console.log("\nNo AGENTS.md found in the target. Project-local install will write AGENTS.md.");
  }
}

function printInstalledManifest(target) {
  const manifestPath = join(target, ".framecore/manifest.json");
  if (!existsSync(manifestPath)) {
    console.log("Manifest was not found after install.");
    return;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const managed = [...new Set(manifest.managed_paths ?? [])].sort();
  console.log("\nInstalled managed tree:");
  for (const entry of managed) console.log(`- ${entry}`);
}

async function confirmInstall() {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question("\nApply project-local install now? yes/no (no): ");
  rl.close();
  return /^y/i.test(answer.trim());
}

export async function runGuidedInstall({
  target = argValue("--target", null),
  defaults = hasFlag("--defaults"),
  yes = hasFlag("--yes"),
  skipCheck = hasFlag("--skip-check"),
} = {}) {
  const resolvedTarget = target ? resolve(target) : null;
  requireExistingTarget(resolvedTarget);

  console.log("FrameCore guided project-local install");
  console.log("Target: <target>");
  console.log("Mode: project-local only");
  console.log("External execution tools: not enabled");

  if (!skipCheck) runNpmCheck({ target: resolvedTarget });
  else console.log("\n== Repository checks ==\nskipped by --skip-check");

  runNodeStep("Doctor preflight", ["scripts/doctor.mjs", "--mode", "project-local", "--target", resolvedTarget], { target: resolvedTarget });
  runNodeStep("Onboarding", ["scripts/onboard.mjs", "--target", resolvedTarget, ...(defaults ? ["--defaults"] : [])], { target: resolvedTarget, interactive: !defaults });
  runNodeStep("Install dry-run", ["scripts/install.mjs", "--mode", "dry-run", "--target", resolvedTarget], { target: resolvedTarget });
  printAgentsInstructionPlan(resolvedTarget);

  if (!yes) {
    const confirmed = await confirmInstall();
    if (!confirmed) {
      console.log("stopped before writing managed workflow files");
      return 0;
    }
  }

  runNodeStep("Project-local install", ["scripts/install.mjs", "--mode", "project-local", "--target", resolvedTarget], { target: resolvedTarget });
  printInstalledManifest(resolvedTarget);
  console.log("\nGuided install complete.");
  console.log("Next: open the target workspace in Codex and ask it to read AGENTS.md or AGENTS.framecore.md.");
  return 0;
}

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/guided-install.mjs --target <path> [--defaults] [--yes] [--skip-check]

Purpose:
  Run the beginner-safe project-local install flow in the canonical order:
  repository checks, doctor/preflight, onboarding, post-onboarding dry-run, project-local install.

Options:
  --target <path>  Existing Codex workspace to install into. Required.
  --defaults       Use default onboarding answers without interactive questions.
  --yes            Apply the final project-local install after dry-run without asking.
  --skip-check     Skip repository checks. Intended for tests and maintainer troubleshooting only.

Safety:
  This script refuses missing targets, never runs global install, never enables external execution tools,
  and stops on the first failed check.
`);
}

try {
  process.exit(await runGuidedInstall());
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
