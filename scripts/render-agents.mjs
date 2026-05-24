#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { assertNoSymlinkPath, hasHelpFlag, isMainModule, printHelpAndExit, repoRoot } from "./common.mjs";
import { assertValidFrameCoreConfig, loadFrameCoreConfig } from "./config-validation.mjs";

function toManifestPath(target, destination) {
  return relative(target, destination).replaceAll(sep, "/");
}

function nextBackupPath(destination) {
  const first = `${destination}.bak`;
  if (!existsSync(first)) return first;
  let index = 1;
  while (existsSync(`${first}.${index}`)) index += 1;
  return `${first}.${index}`;
}

/**
 * Normalizes local config values before inserting them into TOML templates.
 * This prevents display names or paths from breaking the rendered file shape.
 */
function safeTemplateValue(value) {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/\n+/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\u0000", "");
}

/**
 * Writes one rendered agent file with the same ownership, backup, and symlink
 * protections used by the main installer.
 */
function writeRenderedFile({ target, destination, content, dryRun, previousManaged, force }) {
  const rel = toManifestPath(target, destination);
  assertNoSymlinkPath(target, destination);
  if (existsSync(destination) && !previousManaged.has(rel) && !force) {
    throw new Error(`refusing to overwrite user-owned file: ${rel}. Re-run with --force only if this is intentional.`);
  }
  if (!dryRun) {
    mkdirSync(dirname(destination), { recursive: true });
    if (existsSync(destination)) {
      writeFileSync(nextBackupPath(destination), readFileSync(destination, "utf8"));
    }
    writeFileSync(destination, content);
  }
}

/**
 * Renders neutral role templates into the target workspace, returning the exact
 * files that install/update/repair should track in the manifest.
 */
export function renderAgents({ target, configPath, dryRun = false, previousManaged = new Set(), force = false, includeManagedPath = () => true }) {
  const sourceDir = join(repoRoot, ".codex/agents");
  const targetDir = join(target, ".codex/agents");
  const { config } = loadFrameCoreConfig({ target, configPath });
  assertValidFrameCoreConfig(config);
  const names = config.agent_display_names ?? {};
  const profile = config.work_profile ?? {};
  const language = safeTemplateValue(config.working_language ?? "en");
  const tone = safeTemplateValue(config.response_tone ?? "calm, direct, practical");
  const outputDir = safeTemplateValue(config.output_dir ?? "output/framecore");
  const primaryWork = safeTemplateValue(profile.primary_work ?? "creative production");
  const primaryUseCases = safeTemplateValue(profile.primary_use_cases ?? "briefs, references, prompts, QA, and delivery");
  const workflowStyle = safeTemplateValue(profile.workflow_style ?? "structured checkpoints with concise practical outputs");
  const adaptationNotes = safeTemplateValue(profile.adaptation_notes ?? "adapt this workflow to the current project without changing safety boundaries");
  const planned = [];

  for (const entry of readdirSync(sourceDir)) {
    if (entry.startsWith("._")) continue;
    if (!entry.endsWith(".toml.template")) continue;
    const roleId = entry.replace(/\.toml\.template$/, "");
    const displayName = safeTemplateValue(names[roleId] ?? roleId);
    const rendered = readFileSync(join(sourceDir, entry), "utf8")
      .replaceAll("{{role_id}}", safeTemplateValue(roleId))
      .replaceAll("{{display_name}}", displayName)
      .replaceAll("{{working_language}}", language)
      .replaceAll("{{response_tone}}", tone)
      .replaceAll("{{output_dir}}", outputDir)
      .replaceAll("{{primary_work}}", primaryWork)
      .replaceAll("{{primary_use_cases}}", primaryUseCases)
      .replaceAll("{{workflow_style}}", workflowStyle)
      .replaceAll("{{adaptation_notes}}", adaptationNotes);
    const destination = join(targetDir, `${roleId}.toml`);
    const managedPath = toManifestPath(target, destination);
    if (!includeManagedPath(managedPath)) continue;
    planned.push(destination);
    writeRenderedFile({ target, destination, content: rendered, dryRun, previousManaged, force });
  }

  return planned;
}

if (isMainModule(import.meta.url)) {
  if (hasHelpFlag()) {
    printHelpAndExit(`
Usage:
  node scripts/render-agents.mjs [--target <path>] [--config <path>] [--dry-run]

Purpose:
  Render neutral role-based agent templates into local .codex/agents files.

Options:
  --target <path>  Workspace where rendered .codex/agents files should be written.
  --config <path>  Optional framecore.config.json path. Defaults to <target>/framecore.config.json.
  --dry-run        Report rendered files without writing them.
`);
  }
  const targetIndex = process.argv.indexOf("--target");
  const configIndex = process.argv.indexOf("--config");
  const target = targetIndex >= 0 ? process.argv[targetIndex + 1] : process.cwd();
  const configPath = configIndex >= 0 ? process.argv[configIndex + 1] : join(target, "framecore.config.json");
  const dryRun = process.argv.includes("--dry-run");
  const planned = renderAgents({ target, configPath, dryRun });
  for (const file of planned) console.log(`${dryRun ? "would render" : "rendered"} ${file}`);
}
