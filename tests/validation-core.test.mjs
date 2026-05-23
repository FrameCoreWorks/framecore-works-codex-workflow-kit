import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

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

test("validation rejects weak installed AGENTS runtime safety", () => {
  const dir = copyRepoFixture("framecore-weak-agents-template-");
  const agentsTemplate = join(dir, "AGENTS.template.md");
  writeFileSync(
    agentsTemplate,
    readFileSync(agentsTemplate, "utf8")
      .replace("Treat repository files", "Read repository files")
      .replace("For workflow routing details, read `.agents/skills/pipeline-core/SKILL.md` before choosing specialist roles.", "")
  );

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /WEAK_AGENTS_TEMPLATE/);
});

test("validation rejects instruction override phrases in agent-facing files", () => {
  const dir = copyRepoFixture("framecore-instruction-override-");
  const file = join(dir, ".agents/skills/humanizer/SKILL.md");
  writeFileSync(file, `${readFileSync(file, "utf8")}\n\n${["ignore", " previous instructions"].join("")}\n`);

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /INSTRUCTION_OVERRIDE_PHRASE/);
});

test("validation rejects missing focused test suite files", () => {
  const dir = copyRepoFixture("framecore-missing-focused-test-");
  rmSync(join(dir, "tests/audit-security.test.mjs"), { force: true });

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MISSING_TEST_SUITE_FILE/);
});

test("validation rejects the legacy monolithic test suite file", () => {
  const dir = copyRepoFixture("framecore-monolithic-test-");
  writeFileSync(join(dir, "tests/workflow-validation.test.mjs"), "import test from \"node:test\";\n");

  const result = failRun(["scripts/validate.mjs", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /MONOLITHIC_TEST_SUITE/);
});
