# Quickstart

This guide installs FrameCore Works Skill Kit into one Codex workspace. The recommended path is project-local installation, which keeps the workflow assets inside the target project instead of changing your global Codex setup.

## No-Terminal Beginner Start

If you do not know Terminal, use a Codex environment that can run local shell commands and paste this into Codex from the project folder where you want the kit installed:

```text
Install FrameCore Works: Creative Workflow Skill Kit for Codex from this GitHub repo:

https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit

I am a beginner. Please guide me step by step.

First check whether this Codex environment can clone repositories and run local shell commands. If it can, clone the repo into a temporary or tools folder outside my project, read README.md, docs/quickstart.md, and docs/codex-assisted-install.md, then explain what will be installed.

Start by telling me that FrameCore Works was created for creative work such as graphics, video, storyboards, campaign assets, e-commerce assets, prompt workflows, QA, and delivery preparation, but can be adapted to other use cases.

Run repository checks, doctor/preflight, onboarding, install dry-run, then project-local install only. Explain each onboarding question before I answer, including questions about what I do, my main use cases, and how the pipeline should fit my work style. Show planned writes before installing.

Do not use global install. Do not enable paid external execution tools. Do not upload anything. Do not use API keys. Stop before overwriting existing files.

If this Codex environment cannot run shell commands, tell me I need a shell-capable Codex workspace or help from a technical user.
```

If Codex cannot run local commands, this kit still remains documented, but installation needs a terminal-capable environment or a technical helper.

## Prerequisites

- Node.js 20 or newer.
- npm.
- A target project folder where you want Codex to use the workflow.
- A local clone or downloaded copy of this repository.

The commands below are run from the root of this repository unless noted otherwise.

For command help:

```bash
node scripts/install.mjs --help
node scripts/guided-install.mjs --help
node scripts/onboard.mjs --help
node scripts/doctor.mjs --help
```

For a full command map, including which commands write files and which are read-only checks, see [CLI Reference](cli-reference.md).

## Beginner-Friendly Guided Quickstart

1. Open a terminal in this repository.

2. Choose an existing target workspace:

   ```bash
   export FRAMECORE_TARGET=/path/to/your/project
   ```

3. Run the guided installer:

   ```bash
   npm run install:guided -- --target "$FRAMECORE_TARGET"
   ```

   The guided installer runs the canonical sequence: repository checks, doctor/preflight, onboarding, install dry-run after onboarding, and project-local install. It refuses missing target folders, stops on the first failed check, does not run global install, and does not enable external execution tools.

   For a non-interactive default setup:

   ```bash
   npm run install:guided -- --target "$FRAMECORE_TARGET" --defaults --yes
   ```

## Beginner-Friendly Manual Quickstart

1. Open a terminal in this repository.

2. Check the kit before installing it:

   On macOS, if the repo was copied through Finder, AirDrop, archive extraction, or an external drive, first remove AppleDouble metadata sidecars:

   ```bash
   npm run cleanup:appledouble -- --apply
   ```

   ```bash
   npm run check
   ```

   This runs the privacy audit, workflow validation, and tests.

3. Choose a target workspace:

   ```bash
   export FRAMECORE_TARGET=/path/to/your/project
   ```

   You can also replace `$FRAMECORE_TARGET` in the commands below with the actual target path. The target folder must already exist unless you explicitly pass `--create-target` to the lower-level onboarding or install scripts.

4. Run preflight:

   ```bash
   npm run doctor -- --target "$FRAMECORE_TARGET"
   ```

   The doctor command checks target readiness without writing files.

5. Run onboarding:

   ```bash
   node scripts/onboard.mjs --target "$FRAMECORE_TARGET"
   ```

   Onboarding creates `framecore.config.json` in the target workspace. It asks for working language, tone, output folder, QA strictness, local agent display names, and optional workflow self-improvement settings. Use a safe relative output path such as `output/framecore`; do not use absolute paths, `~`, URLs, cloud sync paths, or machine-specific folders.

   At the end, onboarding prints the next safe steps: dry-run, review planned writes, install project-local, open the target project in Codex, and use [Using The Kit](using-the-kit.md) for starter prompts.

   For a non-interactive default config:

   ```bash
   node scripts/onboard.mjs --defaults --target "$FRAMECORE_TARGET"
   ```

6. Preview the install after onboarding:

   ```bash
   npm run install:dry-run -- --target "$FRAMECORE_TARGET"
   ```

   Review the planned writes from dry run. The installer should report `would write` lines and should not create managed workflow files during dry run.

7. Install project-locally:

   ```bash
   node scripts/install.mjs --mode project-local --target "$FRAMECORE_TARGET"
   ```

8. Review the installed files:

   ```bash
   find "$FRAMECORE_TARGET/.framecore" "$FRAMECORE_TARGET/.agents" "$FRAMECORE_TARGET/.codex" -maxdepth 3 -type f | sort
   ```

   PowerShell equivalent:

   ```powershell
   Get-ChildItem "$env:FRAMECORE_TARGET/.framecore", "$env:FRAMECORE_TARGET/.agents", "$env:FRAMECORE_TARGET/.codex" -Recurse -File | Sort-Object FullName
   ```

9. Open the target project in Codex and ask it to read the project instructions. If your target already had `AGENTS.md`, read both `AGENTS.md` and `AGENTS.framecore.md`.

10. For first real prompts after install, read [Using The Kit](using-the-kit.md).

## Advanced Global Install

Project-local install is the default and recommended path. Global install writes to the current user's home workspace, so use it only when you intentionally want FrameCore available outside a single project.

Preview the home-workspace impact first:

```bash
npm run doctor -- --mode global
node scripts/install.mjs --mode dry-run --target "$HOME"
```

Apply global install only after that review:

```bash
node scripts/install.mjs --mode global --confirm-global
```

## Codex-Assisted Quickstart

For the full assistant-facing guide, read [Codex-Assisted Install](codex-assisted-install.md).

From the Codex workspace where you want to install the kit, paste this instruction:

```text
Clone https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git into a temporary or tools folder outside the target workspace, read its README, docs/quickstart.md, and docs/codex-assisted-install.md, then install it into my current workspace.

Follow this order:
1. Run the guided project-local installer if available.
2. If guided install completes successfully, show me the changed files and the final installed tree, then stop.
3. If guided install is not available or fails before writing managed files, use this manual fallback:
   - Run npm run check in the kit repo.
   - Run doctor/preflight against my current workspace.
   - Run onboarding for my current workspace.
   - Run install dry-run against my current workspace after onboarding.
   - Install project-local only.
   - Show me the changed files and the final installed tree.

Do not use global install and do not enable external execution tools unless I explicitly ask for them.
```

Codex should stop if dry run reports user-owned file conflicts. Resolve those conflicts intentionally before running the real install.

## PowerShell Target Setup

On Windows PowerShell, set the target path like this:

```powershell
$env:FRAMECORE_TARGET = "C:\path\to\your\project"
```

Then run the same `npm` and `node` commands from this guide.

Common PowerShell commands:

```powershell
npm run install:guided -- --target "$env:FRAMECORE_TARGET"
npm run doctor -- --target "$env:FRAMECORE_TARGET"
node scripts/onboard.mjs --target "$env:FRAMECORE_TARGET"
npm run install:dry-run -- --target "$env:FRAMECORE_TARGET"
node scripts/install.mjs --mode project-local --target "$env:FRAMECORE_TARGET"
```

## Expected Installed Tree

For a new target project without an existing `AGENTS.md`, project-local install creates this shape:

```text
your-project/
  AGENTS.md
  framecore.config.json
  .framecore/
    manifest.json
  .agents/
    skills/
      asset-manifest/
        SKILL.md
      brief-architect/
        SKILL.md
      character-design/
        SKILL.md
      cinematography/
        SKILL.md
      commercial-video-campaign-director/
        SKILL.md
      commercial-visual-campaign-director/
        SKILL.md
      creative-music-video-director/
        SKILL.md
      delivery-documentation/
        SKILL.md
      hipson-adapter/
        SKILL.md
        templates/
      humanizer/
        SKILL.md
      hyperframes-gsap-guidance/
        SKILL.md
      hyperframes-prompting/
        SKILL.md
      hyperframes-workflow/
        SKILL.md
      image-prompt-architect/
        SKILL.md
      instruction-packet-factory/
        SKILL.md
      marketing/
        SKILL.md
      onboarding-preference-tuning/
        SKILL.md
      output-critic-iteration/
        SKILL.md
      pipeline-core/
        SKILL.md
        references/
        templates/
      reference-pack-curator/
        SKILL.md
      storyboard-board-architect/
        SKILL.md
      storyboard-director/
        SKILL.md
      storytelling/
        SKILL.md
      ugc/
        SKILL.md
      video-prompt-architect/
        SKILL.md
      workflow-orchestrator/
        SKILL.md
      workflow-self-improvement/
        SKILL.md
        templates/
  .codex/
    agents/
      asset-manifest.toml
      brief-architect.toml
      copy-voice.toml
      delivery-documentation.toml
      execution-manifest.toml
      hyperframes-producer.toml
      image-prompting.toml
      instruction-packet-factory.toml
      intent-confirmation.toml
      motion-direction.toml
      music-video-direction.toml
      qa-iteration.toml
      reference-curator.toml
      research-evidence.toml
      static-direction.toml
      storyboard-architect.toml
      storyboard-board-architect.toml
      tool-routing-cost.toml
      video-prompting.toml
      workflow-orchestrator.toml
```

If the target already has `AGENTS.md`, the installer preserves it and writes:

```text
your-project/
  AGENTS.md
  AGENTS.framecore.md
```

If onboarding enables the optional recurring review recipe, the target also receives:

```text
your-project/
  .framecore/
    automation-recipes/
      workflow-self-improvement-review.json
```

## After Installation

- Keep `framecore.config.json` local to the target workspace. Teams that intentionally share reviewed defaults can use `framecore.config.shared.json`, with local config still taking precedence.
- Read [Team Configuration](team-configuration.md) before committing installed workflow files or local config.
- Use `.framecore/manifest.json` to see which files are FrameCore-managed.
- Run update or repair only after reviewing the current manifest. `update` can add new FrameCore-managed paths from the current kit; `repair` rewrites only paths already listed in the manifest:
- Update and repair rotate backups for rewritten managed files and `.framecore/manifest.json`; uninstall preserves backup files for manual review.

  ```bash
  node scripts/doctor.mjs --mode update --target "$FRAMECORE_TARGET"
  node scripts/install.mjs --mode update --target "$FRAMECORE_TARGET"
  node scripts/doctor.mjs --mode repair --target "$FRAMECORE_TARGET"
  node scripts/install.mjs --mode repair --target "$FRAMECORE_TARGET"
  ```

- Preview uninstall before applying it:

  ```bash
  node scripts/doctor.mjs --mode uninstall --target "$FRAMECORE_TARGET"
  node scripts/install.mjs --mode uninstall --target "$FRAMECORE_TARGET"
  node scripts/install.mjs --mode uninstall --target "$FRAMECORE_TARGET" --yes
  ```

## Next Reading

- [Architecture](architecture.md)
- [Using The Kit](using-the-kit.md)
- [Workflow Stages](workflow-stages.md)
- [Troubleshooting](troubleshooting.md)
- [Onboarding](onboarding.md)
- [Customization](customization.md)
- [Migration Guide](migration-guide.md)
- [Text-Bearing Image Policy](text-image-policy.md)
- [End-To-End Creative Workflow Example](../examples/end-to-end-creative-workflow/README.md)
