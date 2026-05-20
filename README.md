# FrameCore Works: Creative Workflow Skill Kit for Codex

From the Codex workspace where you want to install the kit, give Codex this instruction:

```text
Clone https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git into a temporary or tools folder, read its README, then install it into my current workspace.

Follow this order:
1. Run the repository checks.
2. Run install dry-run against my current workspace.
3. Run onboarding for my current workspace.
4. Install project-local only.

Do not use global install and do not enable external execution tools unless I explicitly ask for them.
```

FrameCore Works Skill Kit is an English-only, provider-neutral workflow system for Codex. It installs role-based agents, skills, templates, handoff rules, QA gates, Humanizer, HyperFrames workflow knowledge, a lightweight Hipson Adapter, and an explicit workflow self-improvement loop.

## What It Installs

- Role-based Codex agent templates with local display-name customization.
- Workflow skills for intake, references, research, direction, copy, prompts, QA, delivery, and retrospectives.
- Humanizer for natural copy polish and voice consistency.
- HyperFrames workflow knowledge for coded video planning, scene structure, animation guidance, caption planning, render QA, and delivery manifests.
- Hipson Adapter for research maps, internet mapping packets, bounded instruction packets, review packets, and execution packets.
- Validation and privacy audit scripts.

## Privacy And Scope

This kit contains reusable workflow assets: role-based agents, skills, templates, onboarding, validation, and project-local configuration.

## Install Flow

1. Clone or download this repo.
2. Run a dry run:

   ```bash
   npm run install:dry-run -- --target /path/to/your/project
   ```

3. Run onboarding:

   ```bash
   node scripts/onboard.mjs --target /path/to/your/project
   ```

4. Install project-local:

   ```bash
   node scripts/install.mjs --mode project-local --target /path/to/your/project
   ```

Global install is available for advanced users:

```bash
node scripts/install.mjs --mode global
```

Use `--mode dry-run` first for every install target.

## First-Run Onboarding

Onboarding collects:

- working language and response tone
- primary workflow types
- local display names for role-based agents
- output folder
- QA strictness
- delivery behavior
- optional recurring workflow self-improvement review
- optional full Hipson expansion

Agent source files in this repo use neutral role IDs only. User-specific display names are generated locally and should not be committed.

## Text-Bearing Image Policy

Static raster graphics with visible text must use `openai/gpt-image-2` in one pass with all visible text included directly in the generated image. The workflow must not generate a text-free background first and add typography later with overlays, compositing, design tools, or manual editing.

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

```bash
npm run audit:privacy
npm run validate
npm test
npm run check
```

`npm run check` is the expected CI path.
