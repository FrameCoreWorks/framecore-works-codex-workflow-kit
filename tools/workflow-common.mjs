import { existsSync, lstatSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { assertNoSymlinkPath, isAppleDouble, relativePosix, repoRoot, walkFiles } from "../scripts/common.mjs";

export const MEMORY_DIR = "Memory Cache";
export const CONTEXT_DIR = "Context";
export const DEFAULT_MAX_FILE_BYTES = 200_000;
export const DEFAULT_MAX_TOTAL_BYTES = 500_000;
export const OPENAI_API_ACTIVATION = "openai api active";

export const requiredMemoryFiles = [
  "project-state.md",
  "recovery-prompt.md",
  "session-heartbeat.md",
  "decision-log.md",
  "change-log.md",
  "source-map.md",
  "open-questions.md",
  "artifacts-index.md",
];

export const requiredMemoryDirs = [
  "history",
  "handoffs",
  "chat-compactions",
];

export function parseArgs(argv = process.argv.slice(2)) {
  const options = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      options._.push(arg);
      continue;
    }
    const [key, inlineValue] = arg.split("=", 2);
    if (inlineValue !== undefined) {
      options[key.slice(2)] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      options[key.slice(2)] = next;
      index += 1;
    } else {
      options[key.slice(2)] = true;
    }
  }
  return options;
}

export function targetFromOptions(options, { create = false } = {}) {
  const target = resolve(String(options.target ?? process.cwd()));
  if (!existsSync(target)) {
    if (!create) throw new Error("target workspace does not exist. Pass --create-target to create it.");
    mkdirSync(target, { recursive: true });
  }
  if (!lstatSync(target).isDirectory()) throw new Error("target must be a directory.");
  return target;
}

export function memoryPath(target, ...parts) {
  return join(target, MEMORY_DIR, ...parts);
}

export function contextPath(target, ...parts) {
  return join(target, CONTEXT_DIR, ...parts);
}

export function templateMemoryPath(...parts) {
  return join(repoRoot, "templates", MEMORY_DIR, ...parts);
}

export function isUnsafeFileName(file) {
  const name = basename(file);
  return /^(?:\.env(?:\..*)?|\.npmrc|\.pypirc|\.netrc|id_rsa|id_ed25519|id_dsa)$/i.test(name) || /\.(?:pem|key|p12|pfx)$/i.test(name);
}

export function isTextFile(file) {
  const name = basename(file);
  return /\.(md|json|yaml|yml|toml|js|mjs|ts|tsx|txt|template)$/i.test(name) || name === "LICENSE" || name === ".gitignore";
}

export function safeReadText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

export function addFinding(findings, code, message, target, files = []) {
  findings.push({
    code,
    message,
    files: files.map((file) => relativePosix(target, file)),
  });
}

export function printFindings(findings, okMessage) {
  if (findings.length === 0) {
    console.log(okMessage);
    return 0;
  }
  for (const finding of findings) {
    console.error(`[${finding.code}] ${finding.message}`);
    for (const file of finding.files ?? []) console.error(`  - ${file}`);
  }
  return 1;
}

export function writeFileIfAllowed(root, path, text, { force = false } = {}) {
  assertNoSymlinkPath(root, path);
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && !force) return false;
  writeFileSync(path, text);
  return true;
}

export function copyMemoryTemplates(target, { force = false } = {}) {
  const sourceRoot = templateMemoryPath();
  const destinationRoot = memoryPath(target);
  const written = [];
  const skipped = [];

  mkdirSync(contextPath(target), { recursive: true });
  mkdirSync(destinationRoot, { recursive: true });
  for (const dir of requiredMemoryDirs) {
    mkdirSync(memoryPath(target, dir), { recursive: true });
  }

  for (const file of walkFiles(sourceRoot)) {
    const rel = relativePosix(sourceRoot, file);
    const destination = join(destinationRoot, rel);
    const didWrite = writeFileIfAllowed(target, destination, readFileSync(file, "utf8"), { force });
    if (didWrite) written.push(destination);
    else skipped.push(destination);
  }

  return { written, skipped };
}

export function validateMemoryCache(target, options = {}) {
  const maxFileBytes = Number(options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES);
  const findings = [];
  const memoryRoot = memoryPath(target);
  const contextRoot = contextPath(target);

  if (!existsSync(memoryRoot)) {
    addFinding(findings, "MISSING_MEMORY_CACHE", "Memory Cache folder is missing.", target, [memoryRoot]);
    return findings;
  }
  if (!lstatSync(memoryRoot).isDirectory()) {
    addFinding(findings, "INVALID_MEMORY_CACHE", "Memory Cache path must be a directory.", target, [memoryRoot]);
    return findings;
  }
  if (existsSync(contextRoot) && resolve(contextRoot) === resolve(memoryRoot)) {
    addFinding(findings, "CONTEXT_MEMORY_COLLISION", "Context and Memory Cache must be separate folders.", target, [contextRoot, memoryRoot]);
  }

  for (const file of requiredMemoryFiles) {
    const path = memoryPath(target, file);
    if (!existsSync(path)) addFinding(findings, "MISSING_MEMORY_FILE", `Required Memory Cache file is missing: ${file}`, target, [path]);
  }
  for (const dir of requiredMemoryDirs) {
    const path = memoryPath(target, dir);
    if (!existsSync(path) || !lstatSync(path).isDirectory()) {
      addFinding(findings, "MISSING_MEMORY_DIR", `Required Memory Cache directory is missing: ${dir}`, target, [path]);
    }
  }

  const symlinks = [];
  const files = walkFiles(memoryRoot, { onSymlink: (file) => symlinks.push(file) });
  if (symlinks.length > 0) addFinding(findings, "MEMORY_SYMLINK", "Memory Cache must not contain symlinks.", target, symlinks);

  const appleDouble = files.filter(isAppleDouble);
  if (appleDouble.length > 0) addFinding(findings, "MEMORY_APPLEDOUBLE", "Memory Cache must not contain AppleDouble files.", target, appleDouble);

  const unsafeNames = files.filter(isUnsafeFileName);
  if (unsafeNames.length > 0) addFinding(findings, "MEMORY_SECRET_FILE", "Memory Cache must not contain secret-bearing file names.", target, unsafeNames);

  const oversized = files.filter((file) => statSync(file).size > maxFileBytes);
  if (oversized.length > 0) addFinding(findings, "MEMORY_OVERSIZED_FILE", `Memory Cache file exceeds ${maxFileBytes} bytes.`, target, oversized);

  const unsafeTextHits = [];
  for (const file of files.filter(isTextFile)) {
    const text = safeReadText(file);
    if (/BEGIN [A-Z ]*PRIVATE KEY|X-Amz-Signature|GoogleAccessId/i.test(text)) unsafeTextHits.push(file);
    if (/[A-Za-z0-9+/]{160,}={0,2}/.test(text)) unsafeTextHits.push(file);
  }
  if (unsafeTextHits.length > 0) addFinding(findings, "MEMORY_UNSAFE_CONTENT", "Memory Cache contains unsafe recovery content.", target, [...new Set(unsafeTextHits)]);

  const projectState = memoryPath(target, "project-state.md");
  if (existsSync(projectState)) {
    const text = safeReadText(projectState);
    if (!/checkpoint_id\s*:/i.test(text)) addFinding(findings, "WEAK_PROJECT_STATE", "project-state.md must include checkpoint_id.", target, [projectState]);
    if (!/checkpoint_status\s*:\s*active/i.test(text)) addFinding(findings, "STALE_PROJECT_STATE", "project-state.md must include checkpoint_status: active.", target, [projectState]);
    if (/checkpoint_status\s*:\s*stale/i.test(text)) addFinding(findings, "STALE_PROJECT_STATE", "project-state.md is marked stale.", target, [projectState]);
    for (const phrase of ["last_completed_gate", "next_action", "Saved state is not permission"]) {
      if (!text.includes(phrase)) addFinding(findings, "WEAK_PROJECT_STATE", `project-state.md is missing required phrase: ${phrase}`, target, [projectState]);
    }
  }

  const recoveryPrompt = memoryPath(target, "recovery-prompt.md");
  if (existsSync(recoveryPrompt)) {
    const text = safeReadText(recoveryPrompt);
    for (const phrase of [
      "Read AGENTS.md and .agents/skills/pipeline-core/SKILL.md",
      "<Memory Cache>/project-state.md",
      "Continue from checkpoint <checkpoint_id>",
      "Do not push, upload, run providers, run global install, or perform destructive actions unless the current user message explicitly asks for it"
    ]) {
      if (!text.includes(phrase)) addFinding(findings, "WEAK_RECOVERY_PROMPT", `recovery-prompt.md is missing required phrase: ${phrase}`, target, [recoveryPrompt]);
    }
  }

  return findings;
}

export function safeSemanticFiles(target, options = {}) {
  const maxFileBytes = Number(options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES);
  const excludes = new Set([
    CONTEXT_DIR,
    ".git",
    ".next",
    "node_modules",
    "output",
    "outputs",
    "tmp",
    "temp",
    ".framecore",
  ]);
  const candidates = [];
  const roots = [
    "AGENTS.md",
    "PIPELINE_AGENTS.md",
    ".agents/skills",
    ".codex/agents",
    MEMORY_DIR,
  ];

  for (const root of roots) {
    const path = join(target, root);
    if (!existsSync(path)) continue;
    if (lstatSync(path).isDirectory()) {
      candidates.push(...walkFiles(path, {
        excludes: [...excludes],
      }));
    } else {
      candidates.push(path);
    }
  }

  return candidates
    .filter((file) => !isAppleDouble(file))
    .filter((file) => !isUnsafeFileName(file))
    .filter((file) => isTextFile(file))
    .filter((file) => statSync(file).size <= maxFileBytes)
    .filter((file) => !relativePosix(target, file).split("/").some((segment) => excludes.has(segment)));
}

export function requireOpenAiActivation(options) {
  if (options.activation !== OPENAI_API_ACTIVATION) {
    throw new Error(`OpenAI API paths require --activation "${OPENAI_API_ACTIVATION}".`);
  }
}
