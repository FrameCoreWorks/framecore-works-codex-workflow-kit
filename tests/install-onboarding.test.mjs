import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { combinedOutput, copyRepoFixture, failRun, hidden, root, run, runInteractiveOnboarding, sha256 } from "./helpers.mjs";

test("onboarding renders project-local config and agent templates", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-"));
  const output = run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  assert.match(output, /Next steps:/);
  assert.match(output, /npm run install:dry-run/);
  assert.match(output, /project-local/);
  assert.match(output, /docs\/using-the-kit\.md/);
  run(["scripts/render-agents.mjs", "--target", dir]);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.equal("install_scope" in config, false);
  assert.equal(config.output_dir, "output/workflow");
  assert.equal(config.work_profile.primary_work, "creative production: graphics, video, storyboards, campaign assets, and e-commerce assets");
  const rendered = readdirSync(join(dir, ".codex/agents")).filter((file) => file.endsWith(".toml"));
  assert.equal(rendered.length, 20);
  const sample = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.match(sample, /intent-confirmation/);
  assert.match(sample, /Workspace profile: primary work = creative production/);
  const assetManifest = readFileSync(join(dir, ".codex/agents/asset-manifest.toml"), "utf8");
  assert.match(assetManifest, /Workspace profile: primary work = creative production/);
  assert.match(assetManifest, /Use en for workflow artifacts/);
  const orchestrator = readFileSync(join(dir, ".codex/agents/workflow-orchestrator.toml"), "utf8");
  assert.match(orchestrator, /Use this profile when choosing route depth/);
  assert.match(orchestrator, /openai\/gpt-image-2 through native Codex\/ChatGPT image generation/);
});

test("onboarding rejects missing targets unless explicitly created", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-onboard-missing-parent-"));
  const missing = join(parent, "missing-target");

  const result = failRun(["scripts/onboard.mjs", "--defaults", "--target", missing]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  run(["scripts/onboard.mjs", "--defaults", "--target", missing, "--create-target"]);
  assert.ok(existsSync(join(missing, "framecore.config.json")));
});

test("onboarding rotates config backups instead of overwriting them", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-onboard-backup-"));
  const configPath = join(dir, "framecore.config.json");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  writeFileSync(configPath, "first config\n");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  writeFileSync(configPath, "second config\n");
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  assert.equal(readFileSync(join(dir, "framecore.config.json.bak"), "utf8"), "first config\n");
  assert.equal(readFileSync(join(dir, "framecore.config.json.bak.1"), "utf8"), "second config\n");
});

test("config validation rejects invalid local config before rendering", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-bad-config-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.qa_strictness = "maximum";
  config.agent_display_names = { "unknown-role": "Unknown" };
  config.output_dir = "../outside";
  config.work_profile.primary_work = "";
  config.work_profile.workflow_style = "x".repeat(401);
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config, null, 2));

  const result = failRun(["scripts/render-agents.mjs", "--target", dir]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /invalid framecore\.config\.json/);
  assert.match(`${result.stderr}${result.stdout}`, /qa_strictness/);
  assert.match(`${result.stderr}${result.stdout}`, /unknown-role/);
  assert.match(`${result.stderr}${result.stdout}`, /output_dir/);
  assert.match(`${result.stderr}${result.stdout}`, /work_profile\.primary_work/);
  assert.match(`${result.stderr}${result.stdout}`, /work_profile\.workflow_style/);
});

test("shared config merges with local overrides before agent rendering", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-shared-config-"));
  writeFileSync(join(dir, "framecore.config.shared.json"), JSON.stringify({
    working_language: "pl",
    output_dir: "output/team",
    qa_strictness: "strict",
    agent_display_names: {
      "intent-confirmation": "Shared Confirm"
    }
  }, null, 2));
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify({
    response_tone: "local concise tone",
    agent_display_names: {
      "intent-confirmation": "Local Confirm"
    }
  }, null, 2));

  run(["scripts/render-agents.mjs", "--target", dir]);
  const intent = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  const execution = readFileSync(join(dir, ".codex/agents/execution-manifest.toml"), "utf8");
  assert.match(intent, /Local Confirm/);
  assert.match(intent, /Use pl for workflow artifacts/);
  assert.match(intent, /Tone: local concise tone/);
  assert.match(intent, /Workspace profile: primary work = creative production/);
  assert.match(execution, /output\/team/);
});

test("doctor validates shared config without requiring local onboarding config", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-doctor-shared-config-"));
  writeFileSync(join(dir, "framecore.config.shared.json"), JSON.stringify({
    response_tone: "team tone",
    qa_strictness: "strict"
  }, null, 2));

  const output = run(["scripts/doctor.mjs", "--target", dir]);
  assert.match(output, /FrameCore config is valid/);
  assert.match(output, /framecore\.config\.shared\.json was included/);
  assert.doesNotMatch(output, /FrameCore config is missing/);
});

test("install rejects invalid local config before writing managed files", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-bad-install-config-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.output_dir = "/tmp/not-portable";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config, null, 2));

  const result = failRun(["scripts/install.mjs", "--mode", "project-local", "--target", dir, "--force"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /invalid framecore\.config\.json/);
  assert.equal(existsSync(join(dir, ".agents/skills/pipeline-core/SKILL.md")), false);
  assert.equal(existsSync(join(dir, ".codex/agents/intent-confirmation.toml")), false);
  assert.equal(existsSync(join(dir, ".framecore/manifest.json")), false);
});

test("install leaves an incomplete manifest when the write phase fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-incomplete-install-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  mkdirSync(join(dir, ".agents/skills/humanizer/SKILL.md"), { recursive: true });

  const result = failRun(["scripts/install.mjs", "--mode", "project-local", "--target", dir, "--force"]);
  assert.notEqual(result.status, 0);
  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.incomplete, true);
  assert.ok(manifest.managed_paths.includes(".agents/skills/humanizer/SKILL.md"));
});

test("install rejects missing targets unless explicitly created", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-install-missing-parent-"));
  const missing = join(parent, "missing-target");

  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", missing]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", missing, "--create-target"]);
  assert.match(output, /would write/);
  assert.equal(existsSync(missing), false);

  run(["scripts/install.mjs", "--mode", "project-local", "--target", missing, "--create-target"]);
  assert.ok(existsSync(join(missing, ".framecore/manifest.json")));
});

test("global install requires explicit confirmation", () => {
  const home = mkdtempSync(join(tmpdir(), "framecore-global-home-"));
  const homeRoot = parse(home).root;
  const homeDrive = homeRoot.endsWith("\\") ? homeRoot.slice(0, -1) : homeRoot.replace(/\/$/, "");
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    HOMEDRIVE: homeDrive,
    HOMEPATH: homeDrive && home.startsWith(homeDrive) ? home.slice(homeDrive.length) : home,
  };

  const blocked = failRun(["scripts/install.mjs", "--mode", "global"], { env });
  assert.notEqual(blocked.status, 0);
  assert.match(`${blocked.stderr}${blocked.stdout}`, /--confirm-global/);
  assert.equal(existsSync(join(home, ".framecore/manifest.json")), false);

  run(["scripts/install.mjs", "--mode", "global", "--confirm-global"], { env });
  assert.ok(existsSync(join(home, ".framecore/manifest.json")));
});

test("interactive onboarding explains the workflow and can keep default role names", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-"));
  const result = await runInteractiveOnboarding(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Onboarding language\. Press Enter for English/);
  assert.match(result.stdout, /This installer adds a structured creative workflow/);
  assert.doesNotMatch(result.stdout, /FrameCore Works/);
  assert.doesNotMatch(result.stdout, /FrameCore files/);
  assert.match(result.stdout, /output\/workflow/);
  assert.match(result.stdout, /These answers stay local in the generated config file/);
  assert.match(result.stdout, /adapted to other use\s+cases/);
  assert.match(result.stdout, /What kind of work do you do/);
  assert.match(result.stdout, /What should this pipeline help with most/);
  assert.match(result.stdout, /How should the pipeline fit your work style/);
  assert.match(result.stdout, /Any adaptation notes for non-creative or specialized use cases/);
  assert.match(result.stdout, /How this improves your work/);
  assert.match(result.stdout, /Hipson in this setup/);
  assert.match(result.stdout, /Full Hipson is a separate optional repository/);
  assert.match(result.stdout, /optional expansion layer for deeper analysis/);
  assert.match(result.stdout, /does not clone, install, activate, upload, or run anything/);
  assert.match(result.stdout, /What will not be configured/);
  assert.match(result.stdout, /Require QA approval before generated asset delivery/);
  assert.match(result.stdout, /local manifest/);
  assert.match(result.stdout, /Next steps:/);
  assert.match(result.stdout, /docs\/using-the-kit\.md/);
  assert.doesNotMatch(result.stdout, /validation and privacy audit scripts/);
  assert.match(result.stdout, /Use default role names/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.deepEqual(config.agent_display_names, {});
  assert.equal(config.delivery.auto_upload, false);
  assert.equal(config.delivery.delivery_requires_current_user_request, true);
  assert.equal(config.delivery.require_qa_allowlist_for_generated_assets, true);
  assert.equal(config.work_profile.primary_use_cases, "briefs, references, visual direction, prompt packs, QA review, and delivery preparation");
});

test("interactive onboarding can run in Polish", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-pl-"));
  const answers = ["Polish", "", "", "", "", "", "", "", "", "", "", "", "", "", "tak"];
  const result = await runInteractiveOnboarding(dir, answers);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Konfiguracja kreatywnego workflow/);
  assert.doesNotMatch(result.stdout, /FrameCore Works/);
  assert.match(result.stdout, /output\/workflow/);
  assert.match(result.stdout, /Czym się zajmujesz/);
  assert.match(result.stdout, /W czym ten pipeline ma pomagać najbardziej/);
  assert.match(result.stdout, /Pełny Hipson to osobne, opcjonalne repozytorium/);
  assert.match(result.stdout, /opcjonalnej warstwy rozszerzenia do głębszej analizy/);
  assert.match(result.stdout, /nie klonuje, nie instaluje, nie aktywuje, nie uploaduje i nie uruchamia/);
  assert.match(result.stdout, /Czy użyć domyślnych nazw ról/);
  assert.match(result.stdout, /Następne kroki:/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.equal(config.working_language, "en");
  assert.equal(config.response_tone, "calm, direct, practical");
  assert.equal(config.work_profile.primary_use_cases, "briefs, references, visual direction, prompt packs, QA review, and delivery preparation");
  assert.deepEqual(config.agent_display_names, {});
});

test("interactive onboarding re-prompts unsafe output directories", async () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-interactive-output-dir-"));
  const answers = ["", "", "", "", "", "", "", "../outside", "output/safe", "", "", "", "", "", "", "yes"];
  const result = await runInteractiveOnboarding(dir, answers);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Use a safe relative path inside the workspace/);
  const config = JSON.parse(readFileSync(join(dir, "framecore.config.json"), "utf8"));
  assert.equal(config.output_dir, "output/safe");
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

test("installer refuses symlinks in managed write paths", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-symlink-target-"));
  const outside = join(mkdtempSync(join(tmpdir(), "framecore-symlink-outside-")), "outside.md");
  mkdirSync(join(dir, ".agents/skills/humanizer"), { recursive: true });
  writeFileSync(outside, "outside\n");
  try {
    symlinkSync(outside, join(dir, ".agents/skills/humanizer/SKILL.md"));
  } catch {
    t.skip("symlink creation is unavailable in this environment");
    return;
  }

  const result = failRun(["scripts/install.mjs", "--mode", "dry-run", "--target", dir, "--force"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}${result.stdout}`, /refusing symlink in managed path/);
  assert.equal(readFileSync(outside, "utf8"), "outside\n");
});

test("guided installer runs the safe project-local default path", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-guided-"));
  const output = run(["scripts/guided-install.mjs", "--target", dir, "--defaults", "--yes", "--skip-check"]);
  assert.match(output, /FrameCore guided project-local install/);
  assert.match(output, /Doctor preflight/);
  assert.match(output, /Onboarding/);
  assert.match(output, /Install dry-run/);
  assert.match(output, /Project-local install/);
  assert.match(output, /Optional next step for long sessions/);
  assert.match(output, /npm run memory:init/);
  assert.match(output, /Installed managed tree/);
  assert.match(output, /Guided install complete/);
  assert.equal(output.includes(dir), false);
  assert.ok(existsSync(join(dir, "framecore.config.json")));
  assert.ok(existsSync(join(dir, ".framecore/manifest.json")));
  assert.ok(existsSync(join(dir, ".codex/agents/workflow-orchestrator.toml")));
});

test("guided installer can initialize Memory Cache after project-local install", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-guided-memory-"));
  const output = run(["scripts/guided-install.mjs", "--target", dir, "--defaults", "--yes", "--skip-check", "--init-memory-cache"]);
  assert.match(output, /Memory Cache init/);
  assert.match(output, /Memory Cache validation/);
  assert.match(output, /memory cache validation passed/);
  assert.ok(existsSync(join(dir, "Context")));
  assert.ok(existsSync(join(dir, "Memory Cache", "project-state.md")));
  assert.ok(existsSync(join(dir, "Memory Cache", "recovery-prompt.md")));
});

test("smoke install verifies the temporary project-local golden path", () => {
  assert.match(run(["scripts/smoke-install.mjs"]), /smoke install passed/);
});

test("agent compliance fixture verifies minimum installed workflow path", () => {
  assert.match(run(["scripts/agent-compliance-check.mjs"]), /agent compliance check passed/);
});

test("guided installer rejects missing targets and kit repo self-install", () => {
  const parent = mkdtempSync(join(tmpdir(), "framecore-guided-missing-parent-"));
  const missing = join(parent, "missing-target");
  const missingResult = failRun(["scripts/guided-install.mjs", "--target", missing, "--defaults", "--yes", "--skip-check"]);
  assert.notEqual(missingResult.status, 0);
  assert.match(`${missingResult.stderr}${missingResult.stdout}`, /target workspace does not exist/);
  assert.equal(existsSync(missing), false);

  const selfResult = failRun(["scripts/guided-install.mjs", "--target", root, "--defaults", "--yes", "--skip-check"]);
  assert.notEqual(selfResult.status, 0);
  assert.match(`${selfResult.stderr}${selfResult.stdout}`, /must be outside this kit repository/);
});

test("install and uninstall preserve user-owned skills, agents, and AGENTS.md", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-owned-"));
  mkdirSync(join(dir, ".agents/skills/user-skill"), { recursive: true });
  mkdirSync(join(dir, ".codex/agents"), { recursive: true });
  writeFileSync(join(dir, ".agents/skills/user-skill/SKILL.md"), "user skill\n");
  writeFileSync(join(dir, ".codex/agents/user-agent.toml"), "name = \"user-agent\"\n");
  writeFileSync(join(dir, "AGENTS.md"), "user project instructions\n");

  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  const installOutput = run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);
  assert.match(installOutput, /existing AGENTS\.md was preserved/);
  assert.match(installOutput, /Also read AGENTS\.framecore\.md/);

  assert.equal(readFileSync(join(dir, "AGENTS.md"), "utf8"), "user project instructions\n");
  assert.ok(existsSync(join(dir, "AGENTS.framecore.md")));

  const manifest = JSON.parse(readFileSync(join(dir, ".framecore/manifest.json"), "utf8"));
  assert.equal(manifest.managed_paths.includes(".agents/skills"), false);
  assert.equal(manifest.managed_paths.includes(".codex/agents"), false);
  assert.ok(manifest.managed_paths.includes("AGENTS.framecore.md"));
  const output = run(["scripts/install.mjs", "--mode", "dry-run", "--target", dir]);
  assert.match(output, /existing AGENTS\.md was preserved/);
  assert.match(output, /Also read AGENTS\.framecore\.md/);

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
  assert.match(`${result.stderr}${result.stdout}`, /invalid manifest: manifest contains an unsafe managed path entry/);
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

test("update and repair require a manifest", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-mode-no-manifest-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);

  for (const mode of ["update", "repair"]) {
    const result = failRun(["scripts/install.mjs", "--mode", mode, "--target", dir]);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stderr}${result.stdout}`, /requires \.framecore\/manifest\.json/);
  }
});

test("update rotates manifest backups before rewriting", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-manifest-backup-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const firstManifest = readFileSync(manifestPath, "utf8");
  assert.equal(existsSync(`${manifestPath}.bak`), false);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.equal(readFileSync(`${manifestPath}.bak`, "utf8"), firstManifest);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.ok(existsSync(`${manifestPath}.bak.1`));
});

test("repair only rewrites manifest-recorded paths while update expands managed set", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-repair-update-"));
  run(["scripts/onboard.mjs", "--defaults", "--target", dir]);
  run(["scripts/install.mjs", "--mode", "project-local", "--target", dir]);

  const manifestPath = join(dir, ".framecore/manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.managed_paths = manifest.managed_paths.filter((item) => !item.startsWith(".agents/skills/humanizer/"));
  delete manifest.managed_hashes;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  rmSync(join(dir, ".agents/skills/humanizer"), { recursive: true, force: true });

  run(["scripts/install.mjs", "--mode", "repair", "--target", dir]);
  assert.equal(existsSync(join(dir, ".agents/skills/humanizer/SKILL.md")), false);

  run(["scripts/install.mjs", "--mode", "update", "--target", dir]);
  assert.equal(existsSync(join(dir, ".agents/skills/humanizer/SKILL.md")), true);
  const updatedManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(updatedManifest.managed_paths.includes(".agents/skills/humanizer/SKILL.md"), true);
  assert.match(updatedManifest.managed_hashes[".agents/skills/humanizer/SKILL.md"], /^[a-f0-9]{64}$/);
});

test("agent rendering escapes local display names and config values", () => {
  const dir = mkdtempSync(join(tmpdir(), "framecore-render-"));
  const config = JSON.parse(readFileSync(join(root, "config/defaults.example.json"), "utf8"));
  config.agent_display_names = {
    "intent-confirmation": "Agent \"Quoted\"\nname = \"evil\""
  };
  config.response_tone = "calm \"quoted\" tone";
  config.output_dir = "output/\"quoted\"";
  config.work_profile.primary_work = "Creative \"quoted\"\nname = \"evil2\"";
  writeFileSync(join(dir, "framecore.config.json"), JSON.stringify(config));

  run(["scripts/render-agents.mjs", "--target", dir]);
  const rendered = readFileSync(join(dir, ".codex/agents/intent-confirmation.toml"), "utf8");
  assert.equal(rendered.match(/^name = /gm).length, 1);
  assert.doesNotMatch(rendered, /\nname = "evil"/);
  assert.doesNotMatch(rendered, /\nname = "evil2"/);
  assert.match(rendered, /Agent \\"Quoted\\" name = \\"evil\\"/);
  assert.match(rendered, /Creative \\"quoted\\" name = \\"evil2\\"/);
});
