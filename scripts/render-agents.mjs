#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { repoRoot, readJson } from "./common.mjs";
import { assertValidFrameCoreConfig } from "./config-validation.mjs";

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

function safeTemplateValue(value) {
  return String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/\n+/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\u0000", "");
}

function writeRenderedFile({ target, destination, content, dryRun, previousManaged, force }) {
  const rel = toManifestPath(target, destination);
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

export function renderAgents({ target, configPath, dryRun = false, previousManaged = new Set(), force = false, includeManagedPath = () => true }) {
  const sourceDir = join(repoRoot, ".codex/agents");
  const targetDir = join(target, ".codex/agents");
  const config = existsSync(configPath) ? readJson(configPath) : {};
  if (existsSync(configPath)) assertValidFrameCoreConfig(config);
  const names = config.agent_display_names ?? {};
  const language = safeTemplateValue(config.working_language ?? "en");
  const tone = safeTemplateValue(config.response_tone ?? "calm, direct, practical");
  const outputDir = safeTemplateValue(config.output_dir ?? "output/framecore");
  const planned = [];

  for (const entry of readdirSync(sourceDir)) {
    if (!entry.endsWith(".toml.template")) continue;
    const roleId = entry.replace(/\.toml\.template$/, "");
    const displayName = safeTemplateValue(names[roleId] ?? roleId);
    const rendered = readFileSync(join(sourceDir, entry), "utf8")
      .replaceAll("{{role_id}}", safeTemplateValue(roleId))
      .replaceAll("{{display_name}}", displayName)
      .replaceAll("{{working_language}}", language)
      .replaceAll("{{response_tone}}", tone)
      .replaceAll("{{output_dir}}", outputDir);
    const destination = join(targetDir, `${roleId}.toml`);
    const managedPath = toManifestPath(target, destination);
    if (!includeManagedPath(managedPath)) continue;
    planned.push(destination);
    writeRenderedFile({ target, destination, content: rendered, dryRun, previousManaged, force });
  }

  return planned;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const targetIndex = process.argv.indexOf("--target");
  const configIndex = process.argv.indexOf("--config");
  const target = targetIndex >= 0 ? process.argv[targetIndex + 1] : process.cwd();
  const configPath = configIndex >= 0 ? process.argv[configIndex + 1] : join(target, "framecore.config.json");
  const dryRun = process.argv.includes("--dry-run");
  const planned = renderAgents({ target, configPath, dryRun });
  for (const file of planned) console.log(`${dryRun ? "would render" : "rendered"} ${file}`);
}
