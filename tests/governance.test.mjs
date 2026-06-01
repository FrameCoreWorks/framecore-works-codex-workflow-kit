import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

test("workflow self-improvement is explicit and proposal-only", () => {
  const text = readFileSync(join(root, ".agents/skills/workflow-self-improvement/SKILL.md"), "utf8");
  assert.match(text, /explicit-only/);
  assert.match(text, /no uploads/);
  assert.match(text, /no external execution/);
  assert.match(text, /no edits/);
  assert.match(text, /self-improvement sufficiency gate/);
  assert.match(text, /stop_sufficient/);
  assert.match(text, /patch_one_gap/);
  assert.match(text, /ask_user/);
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
