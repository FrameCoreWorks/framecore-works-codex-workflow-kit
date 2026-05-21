# FrameCore Works: Creative Workflow Skill Kit for Codex

[![validate](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/actions/workflows/validate.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Licensed under Apache-2.0. See [NOTICE](NOTICE) for redistribution notice details.

From the Codex workspace where you want to install the kit, give Codex this instruction:

```text
Clone https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git into a temporary or tools folder, read its README, then install it into my current workspace.

Follow this order:
1. Run the guided project-local installer if available.
2. If guided install completes successfully, show me the changed files and final installed tree, then stop.
3. If guided install is not available or fails before writing managed files, use this manual fallback:
   - Run the repository checks.
   - Run doctor/preflight against my current workspace.
   - Run onboarding for my current workspace.
   - Run install dry-run against my current workspace after onboarding.
   - Install project-local only.
   - Show me the changed files and final installed tree.

Do not use global install and do not enable external execution tools unless I explicitly ask for them.
```

FrameCore Works Skill Kit is a provider-neutral workflow system for Codex. It installs role-based agents, skills, templates, handoff rules, QA gates, Humanizer, HyperFrames workflow knowledge, a lightweight Hipson Adapter, and an explicit workflow self-improvement loop.

Provider-neutral means this kit does not ship external paid media-provider clients, endpoint catalogs, provider CLIs, API-key workflows, or paid execution routes. The text-bearing image rule may still route to the native Codex/ChatGPT image generator when that built-in capability is available.

## Mental Model

Skills are workflow contracts, not personality presets. A skill defines when a workflow role should act, what input it needs, what artifact it must produce, which QA gate applies, and where the handoff goes next.

Onboarding does not rewrite that workflow logic. It tunes the local workspace: language, tone, output paths, QA strictness, and local display names for neutral role IDs.

## Start Here

- New to the kit: read [Quickstart](docs/quickstart.md).
- Installation failed or produced an unexpected result: read [Troubleshooting](docs/troubleshooting.md).
- Checking supported environments and install modes: read [Compatibility](docs/compatibility.md).
- Want the mental model first: read [Architecture](docs/architecture.md).
- Want to understand current limits and planned direction: read [Roadmap](docs/roadmap.md).
- Want to compare workflow paths: open [Examples Index](examples/README.md).
- Want to see a complete workflow specimen: open [End-To-End Creative Workflow Example](examples/end-to-end-creative-workflow/README.md).
- Maintaining example routes: use each example's checked `workflow.json`.
- Maintaining artifact contracts: read [Artifact Schemas](docs/artifact-schemas.md).
- Preparing a release or repo maintenance change: read [Release Guide](docs/release.md).
- Configuring GitHub protections for this public repo: read [Repository Settings](docs/repository-settings.md).
- Already installing: use the short install flow below.

## What It Installs

- Role-based Codex agent templates with local display-name customization.
- Workflow skills for intake, references, research, direction, copy, prompts, QA, delivery, and retrospectives.
- Humanizer for natural copy polish and voice consistency.
- HyperFrames workflow knowledge for coded video planning, scene structure, animation guidance, caption planning, render QA, and delivery manifests.
- Hipson Adapter for research maps, internet mapping packets, bounded instruction packets, review packets, and execution packets.

Project-local install writes only exact FrameCore-managed files:

- `.agents/skills/<framecore-skill>/...`
- `.codex/agents/<role-id>.toml`
- `AGENTS.md` when no project `AGENTS.md` exists yet
- `AGENTS.framecore.md` when the project already has its own `AGENTS.md`
- `.framecore/manifest.json`

The repo also includes validation and privacy audit scripts for checking this kit before installation or contribution. The audit rejects private names, excluded provider remnants, local machine paths, emails, secret files, secret-like values, private cloud links/IDs, and AppleDouble metadata files.

## Privacy And Scope

This kit contains reusable workflow assets: role-based agents, skills, templates, onboarding, validation, and project-local configuration.

Public docs and source assets are English. Installed workspaces can still use local language and tone preferences through onboarding.

## Install Flow

For the beginner-safe guided path, run:

```bash
npm run install:guided -- --target /path/to/your/project
```

For a non-interactive default setup in an existing target workspace:

```bash
npm run install:guided -- --target /path/to/your/project --defaults --yes
```

The guided installer refuses missing targets, runs repository checks, runs doctor/preflight, runs onboarding, performs a post-onboarding dry-run, asks before the final install unless `--yes` is used, and installs project-local only.

Manual fallback:

1. Clone or download this repo.
2. Check the repository:

   ```bash
   npm run check
   ```

3. Run preflight:

   ```bash
   npm run doctor -- --target /path/to/your/project
   ```

4. Review the preflight result. The installer refuses to overwrite user-owned files by default.

5. Run onboarding:

   ```bash
   node scripts/onboard.mjs --target /path/to/your/project
   ```

6. Run dry run after onboarding so rendered agents use the final local config:

   ```bash
   npm run install:dry-run -- --target /path/to/your/project
   ```

7. Install project-local:

   ```bash
   node scripts/install.mjs --mode project-local --target /path/to/your/project
   ```

If your project already has `AGENTS.md`, the installer writes `AGENTS.framecore.md` instead. Use `--force` only when you intentionally want FrameCore to overwrite a conflicting user-owned file.

Global install is available only for advanced users. It writes to the current user's home workspace, so preview it first:

```bash
npm run doctor -- --mode global
node scripts/install.mjs --mode dry-run --target "$HOME"
```

Apply global install only when that is intentional:

```bash
node scripts/install.mjs --mode global --confirm-global
```

Use `--mode dry-run` first for every install target.

## Update, Repair, And Uninstall

Update requires an existing `.framecore/manifest.json`, upgrades the current FrameCore-managed set, and refuses user-owned conflicts:

```bash
node scripts/install.mjs --mode update --target /path/to/your/project
```

Repair also requires a manifest, but rewrites only paths already recorded in that manifest. It does not add new managed paths:

```bash
node scripts/install.mjs --mode repair --target /path/to/your/project
```

Before update or repair rewrites managed files or the manifest, it creates numbered `.bak` backups such as `AGENTS.md.bak` or `.framecore/manifest.json.bak`.

Uninstall previews removals by default:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project
```

Apply uninstall with:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project --yes
```

Uninstall removes only exact files recorded in the manifest. It refuses directory removals and unsafe paths.

Backup files are not added to the manifest and are preserved for manual review or removal.

## First-Run Onboarding

Onboarding collects:

- working language and response tone
- local display names for role-based agents
- output folder
- QA strictness
- optional recurring workflow self-improvement review
- optional full Hipson expansion

Agent source files in this repo use neutral role IDs only. User-specific display names are generated locally and should not be committed.

`framecore.config.json` is validated before rendering or installation. Invalid config values stop installation before managed files are written.

## Text-Bearing Image Policy

Static raster graphics with visible text must use the built-in Codex/ChatGPT image generation capability powered by GPT Image 2 in one pass, with all visible text included directly in the generated image.

This is a native chat-window generation path, not an external provider integration, API key requirement, CLI, or paid media-provider workflow. The workflow must not generate a text-free background first and add typography later with overlays, compositing, design tools, or manual editing unless the user explicitly asks for a coded or vector artifact.

## Hipson Adapter

This repo includes only the lightweight Hipson Adapter. It works inside this architecture as a packet factory for:

- research maps
- internet mapping packets
- bounded instruction packets
- review packets
- execution packets

The full Hipson system is maintained separately at:

https://github.com/Hipson47/Hipson.git

Onboarding explains the current adapter scope and lets the user choose whether to connect the full Hipson system later.

## Workflow Self-Improvement

The `workflow-self-improvement` skill is explicit-only. It creates retrospective notes and change proposals. It does not run as a hidden daemon, edit instructions automatically, upload files, run external tools, or perform destructive operations.

Onboarding can optionally create a report-only 24-hour review recipe. The default is disabled.

## Development

This is a GitHub-first repo. `package.json` provides local scripts, package metadata, and packaging checks; npm publication is optional and not required for project-local installation.

```bash
npm run audit:privacy
npm run validate
npm test
npm run check
npm run release:check
npm pack --dry-run
node scripts/doctor.mjs --help
node scripts/install.mjs --help
```

`npm run check` is the expected CI path.

See also:

- [Quickstart](docs/quickstart.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Compatibility](docs/compatibility.md)
- [Release Guide](docs/release.md)
- [Release Notes Template](docs/release-notes-template.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Artifact Schemas](docs/artifact-schemas.md)
- [Workflow Stages](docs/workflow-stages.md)
- [Onboarding](docs/onboarding.md)
- [Customization](docs/customization.md)
- [Text-Bearing Image Policy](docs/text-image-policy.md)
- [Hipson Integration](docs/hipson-integration.md)
- [HyperFrames](docs/hyperframes.md)
- [Recurring Workflow Review](docs/recurring-workflow-review.md)
- [Workflow Self-Improvement](docs/workflow-self-improvement.md)
- [Migration Guide](docs/migration-guide.md)
- [Agent Roster](docs/agent-roster.md)
- [Repository Settings](docs/repository-settings.md)
- [Examples Index](examples/README.md)
- [End-To-End Creative Workflow Example](examples/end-to-end-creative-workflow/README.md)
- [Minimal Workflow Example](examples/minimal-workflow/README.md)
- [Static Campaign Example](examples/static-campaign/README.md)
- [Video Storyboard Example](examples/video-storyboard/README.md)
- [HyperFrames Video Example](examples/hyperframes-video/README.md)
- [Image Prompt Pack Example](examples/image-prompt-pack/README.md)
- [Document Workflow Example](examples/document-workflow/README.md)
- [No External Execution Mode Example](examples/no-provider-mode/README.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Support](SUPPORT.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
