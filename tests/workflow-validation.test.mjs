import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const node = process.execPath;

function run(args, options = {}) {
  return execFileSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

function failRun(args, options = {}) {
  return spawnSync(node, args, { cwd: root, encoding: "utf8", ...options });
}

function copyRepoFixture(prefix) {
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

function hidden(value) {
  return Buffer.from(value, "base64").toString("utf8");
}

function runInteractiveOnboarding(dir) {
  return new Promise((resolve, reject) => {
    const child = spawn(node, ["scripts/onboard.mjs", "--target", dir], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const answers = ["", "", "", "", "", "", "", "yes"];
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
      resolve({ status, stdout, stderr });
    });
  });
}

test("validation passes on the repo scaffold", () => {
  assert.match(run(["scripts/validate.mjs"]), /workflow validation passed/);
});

test("validation rejects stub skills", () => {
  const dir = copyRepoFixture("framecore-validate-stub-");
  writeFileSync(join(dir, ".agents/skills/brief-architect/SKILL.md"), [
    "---",
    "name: brief-architect",
    "description: Use this skill to create a brief.",
    "---",
    "",
    "# Brief Architect",
    "",
    "Create a brief."
  ].join("\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /SKILL_STUB/);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_SKILL_SECTION/);
});

test("validation rejects missing skill contract sections", () => {
  const dir = copyRepoFixture("framecore-validate-section-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("\n## Guardrails\n", "\n## Safety Notes\n"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_SKILL_SECTION/);
});

test("validation rejects skill frontmatter names that drift from folder names", () => {
  const dir = copyRepoFixture("framecore-validate-name-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  const text = readFileSync(file, "utf8");
  writeFileSync(file, text.replace("name: humanizer", "name: copy-polisher"));

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /SKILL_NAME_MISMATCH/);
});

test("privacy audit passes on the repo scaffold", () => {
  assert.match(run(["scripts/audit-privacy.mjs"]), /privacy audit passed/);
});

test("privacy audit catches private paths, emails, secrets, provider remnants, and AppleDouble files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-audit-"));
  const banned = ["f", "al", ".", "ai"].join("");
  const other = hidden("TWFnbmlmaWM=");
  const tool = ["gen", "media"].join("");
  const localPath = ["/", "Users", "/", "example", "/", "private"].join("");
  const email = ["person", "@", "example", ".", "com"].join("");
  const secret = ["api", "_", "key", "=", "abcdefghijklmnopqrstuvwxyz"].join("");
  writeFileSync(join(dir, "bad.md"), [
    banned,
    other,
    tool,
    localPath,
    email,
    secret
  ].join("\n"));
  writeFileSync(join(dir, "._bad.md"), "");
  const result = failRun(["scripts/audit-privacy.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /BANNED_TERM/);
  assert.match(`${result.stderr}${result.stdout}`, /LOCAL_ABSOLUTE_PATH/);
  assert.match(`${result.stderr}${result.stdout}`, /EMAIL_ADDRESS/);
  assert.match(`${result.stderr}${result.stdout}`, /SECRET_LIKE_VALUE/);
  assert.match(`${result.stderr}${result.stdout}`, /APPLEDOUBLE_FILE/);
});

test("onboarding renders project-local config and agent templates", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/render-agents.mjs", "--target", dir]);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  const rendered = readdirSync(join(dir, ".codex/agents")).filter((file) => file.endsWith(".toml"));
  assert.equal(rendered.length, 20);
  const sample = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.match(sample, /intent-confirmation/);
});

test("interactive onboarding explains the workflow and can keep default role names", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-"));
  const result = await runInteractiveOnboarding(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /This installer adds a structured creative workflow/);
  assert.match(result.stdout, /How this improves your work/);
  assert.match(result.stdout, /Hipson in this setup/);
  assert.match(result.stdout, /Use default role names/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.deepEqual(config.agent_display_names, {});
});

test("installer dry run reports writes without mutating target", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-dry-"));
  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.match(output, /would write/);
  assert.equal(existsSync(join(dir, "AGENTS.md")), false);
});

test("installer dry run fails on user-owned file conflicts", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-conflict-"));
  mkdirSync(join(dir, ".agents/skills/humanizer"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/humanizer/SKILL.md"), "user-owned humanizer\n");
  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /refusing to overwrite user-owned file/);
  assert.equal(readFileSync(join(dir, ".agents/skills/humanizer/SKILL.md"), "utf8"), "user-owned humanizer\n");
});

test("install and uninstall preserve user-owned skills, agents, and AGENTS.md", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-owned-"));
  mkdirSync(join(dir, ".agents/skills/user-skill"), { recursive: true });
  mkdirSync(join(dir, ".codex/agents"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/user-skill/SKILL.md"), "user skill\n");
  writeFileSync(join(dir, ".codex/agents/user-agent.toml"), "name = \"user-agent\"\n");
  writeFileSync(join(dir, "AGENTS.md"), "user project instructions\n");

  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, "AGENTS.framecore.md")));

  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.managed_paths.includes(".agents/skills"), false);
  assert.equal(manifest.managed_paths.includes(".codex/agents"), false);
  assert.ok(manifest.managed_paths.includes("AGENTS.framecore.md"));

  run(["scripts/install.mjs", "--mode", "uninstall", "--target", dir, "--yes"]);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, ".agents/skills/user-skill/SKILL.md")));
  assert.ok(existsSync(join(dir, ".codex/agents/user-agent.toml")));
  assert.equal(existsSync(join(dir, "AGENTS.framecore.md")), false);
  assert.equal(existsSync(join(dir, ".agents/skills/pipeline-core/SKILL.md")), false);
});

test("uninstall rejects managed paths outside the target", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-hostile-"));
  const outside = join(tmpdir(), "framecore-hostile-outside.txt");
  mkdirSync(join(dir, ".framecore"), { recursive: true });
  writeFileSync(outside, "keep\n");
  writeFileSync(join(dir, ".framecore/manifest.json"), JSON.stringify({
    schema_version: 1,
    managed_paths: ["../framecore-hostile-outside.txt"]
  }));

  const result = failRun(["scripts/install.mjs", "--mode", "uninstall", "--target", dir, "--yes"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /refusing unsafe managed path/);
  assert.equal(readFileSync(outside, "utf8"), "keep\n");
});

test("repair install backs up user-owned files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-repair-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);
  writeFileSync(join(dir, "AGENTS.md"), "local user content\n");
  run(["scripts/install.mjs", "--mode", "repair", "--target", dir]);
  assert.match(readFileSync(join(dir, "AGENTS.md.bak"), "utf8"), /local user content/);
});

test("agent rendering escapes local display names and config values", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-render-"));
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify({
    agent_display_names: {
      "intent-confirmation": "Agent \"Quoted\"\nname = \"evil\""
    },
    working_language: "en",
    response_tone: "calm \"quoted\" tone",
    output_dir: "output/\"quoted\""
  }));

  run(["scripts/render-agents.mjs", "--target", dir]);
  const rendered = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.equal(rendered.match(/^name = /gm).length, 1);
  assert.doesNotMatch(rendered, /\nname = "evil"/);
  assert.match(rendered, /Agent \\"Quoted\\" name = \\"evil\\"/);
});

test("workflow self-improvement is explicit and proposal-only", () => {
  const text = readFileSync(join(root, ".agents/skills/workflow-self-improvement/SKILL.md"), "utf8");
  assert.match(text, /explicit-only/);
  assert.match(text, /no uploads/);
  assert.match(text, /no external execution/);
  assert.match(text, /no edits/);
});

test("Hipson Adapter documents full repo expansion and defaults to lightweight scope", () => {
  const skill = readFileSync(join(root, ".agents/skills/hipson-adapter/SKILL.md"), "utf8");
  const config = JSON.parse(readFileSync(join(root, "config/hipson.example.json"), "utf8"));
  assert.match(skill, /lightweight adapter/);
  assert.equal(config.connect_full_repo, false);
  assert.equal(config.full_repo_url, "https://github.com/Hipson47/Hipson.git");
});

test("recurring self-improvement automation is opt-in and report-only", () => {
  const defaults = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  const recipe = JSON.parse(readFileSync(join(root, "config/automation-recipes/workflow-self-improvement-review.example.json"), "utf8"));
  assert.equal(defaults.workflow_self_improvement.recurring_review_enabled, false);
  assert.equal(recipe.mode, "report-and-proposals-only");
  assert.equal(recipe.mutation, false);
  assert.equal(recipe.uploads, false);
  assert.equal(recipe.external_execution, false);
});
