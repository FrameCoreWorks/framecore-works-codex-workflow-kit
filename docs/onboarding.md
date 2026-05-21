# Onboarding

## Purpose

Onboarding creates local configuration for one workspace. It should run before installation unless the user explicitly provides a complete `framecore.config.json`.

The goal is not to change the public workflow logic. The goal is to tune how the installed workflow behaves in this one workspace: language, tone, output location, QA strictness, local agent display names, delivery preferences, and optional expansion choices.

## Defaults

Default choices are conservative:

- project-local installation
- no automatic upload
- standard QA strictness
- lightweight Hipson Adapter only
- recurring self-improvement review disabled
- neutral role IDs kept as display names unless the user chooses local names

If onboarding is skipped, the installer can still render agents with built-in defaults. That is useful for automation, but it gives the user a less personalized setup.

## Interactive Questions

Interactive onboarding asks:

- `Working language`, the default language Codex should use in this workspace.
- `Response tone`, the preferred communication style.
- `Output directory`, the local folder for workflow outputs and delivery material.
- `QA strictness`, one of `light`, `standard`, or `strict`.
- `Enable 24-hour workflow self-improvement review?`, disabled by default.
- `Connect full Hipson now?`, disabled by default.
- `Use default role names?`, enabled by default.

If the user chooses not to keep default role names, onboarding asks for a local display name for every neutral role ID. These display names are local preferences, not source repo names.

## Installed Files

Onboarding itself writes:

- `framecore.config.json`
- `.framecore/automation-recipes/workflow-self-improvement-review.json` only when the recurring review is explicitly enabled

The later project-local install writes the managed FrameCore workflow assets, rendered agent files, project instructions, and `.framecore/manifest.json`.

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

## Safety Boundaries

Onboarding does not change public workflow logic:

- skill contracts
- role IDs
- gates and handoffs
- provider-neutral boundary
- privacy rules
- installer safety rules

Existing project instructions are protected. If a target workspace already has `AGENTS.md`, project-local install writes FrameCore instructions to `AGENTS.framecore.md` unless the user explicitly passes `--force`.

## Generated Files

User-specific onboarding files should stay local to the workspace where they were generated. Do not commit local config, local agent display names, private project context, secrets, local paths, private cloud links, generated outputs, or delivery material unless the team intentionally accepts that scope.
