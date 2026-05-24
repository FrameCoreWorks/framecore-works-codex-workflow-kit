# FrameCore Works: Creative Workflow Skill Kit for Codex

[![validate](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/actions/workflows/validate.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Licensed under Apache-2.0. See [NOTICE](NOTICE) for redistribution notice details.

## Beginner Start

If someone sent you this repo and you do not know Terminal, start here.

Recommended helper: install [GitHub Desktop](https://desktop.github.com/) if cloning a repository feels unfamiliar. It gives you a visual way to clone this repo, choose where it lives on your computer, see changed files, commit changes, and push to GitHub without memorizing Git commands. GitHub Desktop is optional; it does not run the installer by itself, and the kit can still be installed from a shell-capable Codex workspace or terminal.

1. Open Codex.
2. Open the project folder where you want to use this workflow.
3. Paste this into Codex:

```text
Install FrameCore Works: Creative Workflow Skill Kit for Codex from this GitHub repo:

https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit

I am a beginner. Please guide me step by step.

First check whether this Codex environment can clone repositories and run local shell commands.
If it can, clone the repo into a temporary or tools folder outside my project, read README.md, docs/quickstart.md, and docs/codex-assisted-install.md, then explain in plain language what will be installed and how it will improve my workflow.
Start by telling me that FrameCore Works was created for creative work such as graphics, video, storyboards, campaign assets, e-commerce assets, prompt workflows, QA, and delivery preparation, but can be adapted to other use cases.

Then follow the safe install path:
1. Run the repository checks.
2. Run doctor/preflight against my current workspace.
3. Run onboarding for my current workspace and explain each question before I answer, including questions about what I do, my main use cases, and how the pipeline should fit my work style.
4. Run install dry-run after onboarding.
5. Install project-local only after showing me the planned writes.
6. Show me the changed files, final installed tree, and first prompt I should use after installation.

Do not use global install.
Do not enable paid external execution tools.
Do not upload anything.
Do not use API keys.
Do not run provider tools.
Stop and ask me before overwriting any existing file.

If this Codex environment cannot run shell commands, tell me that I need a shell-capable Codex workspace or help from a technical user, then show me the manual Quickstart link.
If I do not know how to clone the repository, recommend GitHub Desktop as the easiest visual cloning tool and remind me to clone this repo into a temporary or tools folder outside my project.
```

If Codex says it cannot run commands, ask a technical user to follow [Quickstart](docs/quickstart.md) for you.

If your Codex environment can clone repositories and run local shell commands, for example OpenAI Codex CLI with workspace write access, give Codex this instruction from the workspace where you want to install the kit.
If your agent or chat surface cannot run shell commands, use the manual [Install Flow](#install-flow) instead.

```text
Clone https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git into a temporary or tools folder outside the target workspace, read its README, docs/quickstart.md, and docs/codex-assisted-install.md, then install it into my current workspace.

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

FrameCore Works Skill Kit is a provider-neutral workflow system for Codex. It was created for creative work such as graphics, video, storyboards, campaign assets, e-commerce assets, prompt workflows, QA, and delivery preparation, and it can be adapted to other use cases during onboarding. It installs role-based agents, skills, templates, handoff rules, QA gates, Humanizer, HyperFrames workflow knowledge, a lightweight Hipson Adapter, and an explicit workflow self-improvement loop.

Provider-neutral means this kit does not ship external paid media-provider clients, endpoint catalogs, provider CLIs, API-key workflows, or paid execution routes. The text-bearing image rule may still route to the native Codex/ChatGPT image generator when that built-in capability is available. See [Provider-Neutral Boundary](docs/provider-neutral-boundary.md).

This kit ships the routing and contract layer for creative work. It gives Codex roles, gates, handoffs, artifact templates, examples, QA discipline, and safety boundaries. It does not replace your own domain knowledge, brand context, references, or user-configured execution tools.

## Supported Agent Surfaces

| Surface | What works | Notes |
| --- | --- | --- |
| OpenAI Codex CLI with custom-agent support | Full project-local install, `AGENTS.md`, skills, rendered `.codex/agents/*.toml`, guided install, doctor, update, repair, uninstall | Recommended full experience. |
| OpenAI Codex or ChatGPT environments that read project instructions but do not expose custom-agent spawning | `AGENTS.md`, installed skills, workflow docs, examples, artifact contracts | `.codex/agents/*.toml` may be inert, but the workflow contracts remain useful. |
| Other AGENTS-aware coding agents or editors | `AGENTS.md`, docs, examples, and reusable skill files when read manually | Custom-agent `.toml` files are Codex-specific and may not be consumed. |
| Chat-only environments without shell access | Documentation and manual guidance only | Clone and run the install commands from a local terminal or shell-capable Codex workspace. |

## Execution Boundary

| Path | Included in this repo | What it does |
| --- | --- | --- |
| Prompt-only workflow | Yes | Produces briefs, reference packs, direction, prompt packs, QA criteria, and delivery notes. |
| Built-in Codex/ChatGPT image generation for text-bearing raster graphics | Policy only | Allowed when available and explicitly requested; visible text is generated in one pass. |
| External paid media-provider execution | No | Users may add their own tools outside this public kit. |
| Full Hipson | No | The included Hipson Adapter is lightweight; full Hipson remains separate and optional. |

## Mental Model

Skills are workflow contracts, not personality presets. A skill defines when a workflow role should act, what input it needs, what artifact it must produce, which QA gate applies, and where the handoff goes next.

Onboarding does not rewrite that workflow logic. It tunes the local workspace: work profile, language, tone, output paths, QA strictness, and local display names for neutral role IDs.

## Start Here

- New to the kit: read [Quickstart](docs/quickstart.md).
- Installing by pasting a GitHub link into Codex: read [Codex-Assisted Install](docs/codex-assisted-install.md).
- Already installed and ready to work: read [Using The Kit](docs/using-the-kit.md).
- Installation failed or produced an unexpected result: read [Troubleshooting](docs/troubleshooting.md).
- Need quick answers first: read [FAQ](docs/faq.md).
- Checking supported environments and install modes: read [Compatibility](docs/compatibility.md).
- Want command behavior and safety boundaries: read [CLI Reference](docs/cli-reference.md).
- Want the mental model first: read [Architecture](docs/architecture.md).
- Running long Codex sessions or handoffs: read [Memory Cache](docs/memory-cache.md) and [Context Folder](docs/context-folder.md).
- Using local semantic lookup: read [Semantic Memory](docs/semantic-memory.md).
- Need the local OpenAI API boundary: read [OpenAI API Policy](docs/openai-api-policy.md).
- Want to understand current limits and planned direction: read [Roadmap](docs/roadmap.md).
- Preparing for a stable public release: read [v1.0 Readiness](docs/v1-readiness.md).
- Checking what provider-neutral allows and forbids: read [Provider-Neutral Boundary](docs/provider-neutral-boundary.md).
- Want to compare workflow paths: open [Examples Index](examples/README.md).
- Using the kit with a team: read [Team Configuration](docs/team-configuration.md).
- Want to see a complete workflow specimen: open [End-To-End Creative Workflow Example](examples/end-to-end-creative-workflow/README.md).
- Maintaining example routes: use each example's checked `workflow.json`.
- Adding or maintaining public examples: read [Example Authoring](docs/example-authoring.md).
- Maintaining artifact contracts: read [Artifact Schemas](docs/artifact-schemas.md).
- Preparing a release or repo maintenance change: read [Release Guide](docs/release.md).
- Migrating reusable workflow logic from another setup: read [Migration Guide](docs/migration-guide.md).
- Configuring GitHub protections for this public repo: read [Repository Settings](docs/repository-settings.md).
- Already installing: use the short install flow below.

## What It Installs

- Role-based Codex agent templates with local display-name customization.
- Workflow skills for intake, references, research, direction, copy, prompts, QA, delivery, and retrospectives.
- Humanizer for natural copy polish and voice consistency.
- HyperFrames workflow knowledge for coded video planning, scene structure, animation guidance, caption planning, render QA, and delivery manifests.
- Hipson Adapter for research maps, internet mapping packets, bounded instruction packets, review packets, and execution packets.
- Project State templates for durable run-state, context recovery, blockers, touched files, and next-action handoff.
- Memory Cache templates and local tools for long-session recovery, context-budget checks, semantic lookup, and report-only self-improvement queues.

Project-local install writes only exact FrameCore-managed files:

- `.agents/skills/<framecore-skill>/...`
- `.codex/agents/<role-id>.toml`
- `AGENTS.md` when no project `AGENTS.md` exists yet
- `AGENTS.framecore.md` when the project already has its own `AGENTS.md`
- `.framecore/manifest.json`

The repo also includes validation and privacy audit scripts for checking this kit before installation or contribution. The audit rejects private names, excluded provider remnants, local machine paths, emails, secret files, secret-like values, private cloud links/IDs, symlinks, and AppleDouble metadata files.

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

To verify the golden install path in a temporary target without touching a real project:

```bash
npm run smoke:install
```

The smoke check runs default onboarding, guided project-local install, expected file checks, manifest hash checks, doctor/preflight, and uninstall preview.

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

`framecore.config.json` is validated before rendering or installation. Invalid config values stop installation before managed files are written. Teams can add an optional `framecore.config.shared.json` for reviewed shared defaults; local `framecore.config.json` still takes precedence.

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

The full Hipson system is an optional external extension maintained separately at:

https://github.com/Hipson47/Hipson.git

Onboarding explains the current adapter scope and lets the user record whether they intend to connect the full Hipson system later. It does not clone, install, or activate full Hipson during kit setup.

## Workflow Self-Improvement

The `workflow-self-improvement` skill is explicit-only. It creates retrospective notes and change proposals. It does not run as a hidden daemon, edit instructions automatically, upload files, run external tools, or perform destructive operations.

Onboarding can optionally create a report-only 24-hour review recipe. The default is disabled.

The local `self:audit` and `self:improve:local` commands write proposal queues into a valid `Memory Cache/`. They do not patch source files.

## Long Session Recovery

For long-running projects, create an operational folder with separate `Context/` and `Memory Cache/` folders:

```bash
npm run memory:init -- --target /path/to/operational-folder --create-target
npm run memory:validate -- --target /path/to/operational-folder
```

`Context/` is for user-supplied briefs, references, attachments, and source data. `Memory Cache/` is for durable recovery state, checkpoint IDs, safe resume notes, decision logs, source maps, and artifact indexes. The tools do not repopulate `Context/` from `Memory Cache/`.

Local semantic memory works without API access:

```bash
npm run semantic:index -- --target /path/to/operational-folder
npm run semantic:query -- --target /path/to/operational-folder --query "recovery prompt"
```

OpenAI API paths require the exact activation phrase `openai api active`. Without that phrase, API-gated commands stop before any API-capable work.

## Development

This is a GitHub-first repo. `package.json` provides local scripts, package metadata, and packaging checks; npm publication is optional and not required for project-local installation.

```bash
npm run audit:privacy
npm run secret:scan
npm run syntax:check
npm run validate
npm run agent:check
npm test
npm run check
npm run smoke:install
npm run release:check
npm run package:list
npm run memory:validate -- --target /path/to/operational-folder
npm run workflow:context-budget -- --target /path/to/operational-folder
node scripts/doctor.mjs --help
node scripts/install.mjs --help
```

`npm run check` is the expected CI path. It runs the privacy audit, dependency-free secret scan, syntax check, workflow validation, deterministic agent compliance, and tests. `npm run release:check` adds the install smoke test, package audit, and release-readiness gate.

See also:

- [Quickstart](docs/quickstart.md)
- [Codex-Assisted Install](docs/codex-assisted-install.md)
- [Using The Kit](docs/using-the-kit.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)
- [Compatibility](docs/compatibility.md)
- [CLI Reference](docs/cli-reference.md)
- [Provider-Neutral Boundary](docs/provider-neutral-boundary.md)
- [Memory Cache](docs/memory-cache.md)
- [Context Folder](docs/context-folder.md)
- [Semantic Memory](docs/semantic-memory.md)
- [Self-Improvement Tools](docs/self-improvement.md)
- [OpenAI API Policy](docs/openai-api-policy.md)
- [v1.0 Readiness](docs/v1-readiness.md)
- [Release Guide](docs/release.md)
- [Release Notes Template](docs/release-notes-template.md)
- [Roadmap](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Artifact Schemas](docs/artifact-schemas.md)
- [Example Authoring](docs/example-authoring.md)
- [Workflow Stages](docs/workflow-stages.md)
- [Onboarding](docs/onboarding.md)
- [Customization](docs/customization.md)
- [Team Configuration](docs/team-configuration.md)
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
- [Ecommerce Product Visual Example](examples/ecommerce-product-visual/README.md)
- [Video Storyboard Example](examples/video-storyboard/README.md)
- [Storyboard Board Example](examples/storyboard-board/README.md)
- [HyperFrames Video Example](examples/hyperframes-video/README.md)
- [Image Prompt Pack Example](examples/image-prompt-pack/README.md)
- [Document Workflow Example](examples/document-workflow/README.md)
- [QA And Delivery Review Example](examples/qa-delivery-review/README.md)
- [No External Execution Mode Example](examples/no-provider-mode/README.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Support](SUPPORT.md)
- [Maintainers](MAINTAINERS.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
