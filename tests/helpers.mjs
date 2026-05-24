import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const node = process.execPath;

export function run(args, options = {}) {
  return execFileSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

export function failRun(args, options = {}) {
  return spawnSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

export function copyRepoFixture(prefix) {
  const dir = join(mkdtempSync(join(tmpdir(), prefix)), "repo");
  cpSync(root, dir, {
    recursive: true,
    filter(source) {
      const normalized = source.replaceAll("\\", "/");
      return !normalized.includes("/.git/") && !normalized.endsWith("/.git") && !normalized.includes("/node_modules/");
    }
  });
  return dir;
}

export function hidden(value) {
  return Buffer.from(value, "base64").toString("utf8");
}

export function combinedOutput(result) {
  return `${result.stdout}${result.stderr}`;
}

export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function runInteractiveOnboarding(dir) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(node, ["scripts/onboard.mjs", "--target", dir], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const answers = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "yes"];
    let answerIndex = 0;

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if ((text.includes(": ") || text.includes("setup. ")) && answerIndex < answers.length) {
        child.stdin.write(`${answers[answerIndex]}\n`);
        answerIndex += 1;
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (status) => {
      resolvePromise({ status, stdout, stderr });
    });
  });
}
