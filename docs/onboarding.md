# Onboarding

## Purpose

Onboarding creates local configuration for one workspace. It should run before installation unless the user explicitly provides a complete `framecore.config.json`.

The goal is not to change the public workflow logic. The goal is to tune how the installed workflow behaves in this one workspace: language, tone, output location, QA strictness, local agent display names, delivery preferences, and optional expansion choices.

The guided installer invokes onboarding before dry-run and project-local install. That order matters because rendered agent files should use the final local config, not generic defaults.

Onboarding requires an existing target workspace by default. Use `--create-target` only when you intentionally want the onboarding command to create a new folder.

## Defaults

Default choices are conservative:

- project-local installation
- no automatic upload
- standard QA strictness
- lightweight Hipson Adapter only
- recurring self-improvement review disabled
- neutral role IDs kept as display names unless the user chooses local names

If onboarding is skipped, the installer can still render agents with built-in defaults. That is useful for automation, but it gives the user a less personalized setup.

Use `--defaults` for a non-interactive guided setup when the target workspace should start with conservative defaults:

```bash
npm run install:guided -- --target /path/to/your/project --defaults --yes
```

## Interactive Questions

Interactive onboarding asks:

- `Working language`, the default language Codex should use in this workspace.
- `Response tone`, the preferred communication style.
- `Output directory`, the local folder for workflow outputs and delivery material. Use a safe relative path such as `output/framecore`; do not use absolute paths, `~`, URLs, cloud sync paths, or machine-specific folders.
- `QA strictness`, one of `light`, `standard`, or `strict`.
- `Allow automatic delivery uploads if you later add a delivery integration?`, disabled by default.
- `Require an explicit user request before delivery/export?`, enabled by default.
- `Require QA approval before generated asset delivery?`, enabled by default.
- `Enable 24-hour workflow self-improvement review?`, disabled by default.
- `Connect full Hipson later as an external extension?`, disabled by default. Onboarding records this preference only; it does not clone, install, or activate full Hipson.
- `Use default role names?`, enabled by default.

If the user chooses not to keep default role names, onboarding asks for a local display name for every neutral role ID. These display names are local preferences, not source repo names.

## Installed Files

Onboarding itself writes:

- `framecore.config.json`
- `.framecore/automation-recipes/workflow-self-improvement-review.json` only when the recurring review is explicitly enabled

When `framecore.config.json` already exists, onboarding writes a numbered backup before replacing it, starting with `framecore.config.json.bak`, then `framecore.config.json.bak.1`, and so on.

The later project-local install writes the managed FrameCore workflow assets, rendered agent files, project instructions, and `.framecore/manifest.json`.

When a later update or repair rewrites the manifest, the previous manifest is saved as `.framecore/manifest.json.bak`, `.framecore/manifest.json.bak.1`, and so on.

## Completion Output

After writing `framecore.config.json`, onboarding prints the next safe steps:

- run install dry-run against the target workspace
- review planned writes and user-owned file conflicts
- install project-locally
- open the target project in Codex
- ask Codex to read `AGENTS.md` and `AGENTS.framecore.md` when both exist
- use `docs/using-the-kit.md` for starter prompts and route selection

This output is guidance only. Onboarding does not install managed workflow files by itself.

## Hipson Adapter And Full Hipson

This repo includes the lightweight Hipson Adapter. Inside this architecture it works as a packet layer for:

- research maps
- internet mapping packets
- bounded agent instructions
- review packets
- execution packets

Full Hipson is separate and optional:

https://github.com/Hipson47/Hipson.git

If the user connects the full Hipson system later, it can add broader repository scanning, delta reviews, sidecar review agents, cross-repo orchestration, CLI commands, and a larger Hipson knowledge base. The adapter is enough to use this workflow without that expansion.

Onboarding does not clone, install, or activate full Hipson. It only records whether the user intends to connect that optional external extension outside this kit.

## Safety Boundaries

Onboarding does not change public workflow logic:

- skill contracts
- role IDs
- gates and handoffs
- provider-neutral boundary
- privacy rules
- installer safety rules

Delivery preferences only shape local behavior. They do not add cloud credentials, upload targets, external execution tools, or provider-specific delivery integrations.

Existing project instructions are protected. If a target workspace already has `AGENTS.md`, project-local install writes FrameCore instructions to `AGENTS.framecore.md` unless the user explicitly passes `--force`.

## Generated Files

User-specific onboarding files should stay local to the workspace where they were generated. Do not commit local config, local agent display names, private project context, secrets, local paths, private cloud links, generated outputs, or delivery material unless the team intentionally accepts that scope.
