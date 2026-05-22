# Codex-Assisted Install

## Purpose

This guide is for users who want Codex to install the kit for them from a GitHub link.

The user should paste the install instruction into Codex from the workspace where the kit should be installed. Codex should then clone the repo into a temporary or tools folder outside the target workspace, read the docs, run checks, run onboarding, preview the install, and install project-locally.

## Paste-In Instruction

```text
Clone https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit.git into a temporary or tools folder outside the target workspace, read its README, docs/quickstart.md, and docs/codex-assisted-install.md, then install it into my current workspace.

Follow this order:
1. Run the guided project-local installer if available.
2. If guided install completes successfully, show me the changed files and final installed tree, then stop.
3. If guided install is not available or fails before writing managed files, use this manual fallback:
   - Run the repository checks in the kit repo.
   - Run doctor/preflight against my current workspace.
   - Run onboarding for my current workspace.
   - Run install dry-run against my current workspace after onboarding.
   - Install project-local only.
   - Show me the changed files and final installed tree.

Do not use global install and do not enable external execution tools unless I explicitly ask for them.
```

## What Codex Should Do

Codex should:

- clone or download the kit outside the target workspace
- read `README.md`, `docs/quickstart.md`, and this guide before installing
- run repository checks before writing target workspace files
- run doctor/preflight against the target workspace
- run onboarding before install dry-run
- run install dry-run after onboarding
- stop on user-owned file conflicts
- install project-local only
- show changed files and installed tree
- avoid global install unless the user explicitly asks for it
- avoid external execution tools, provider credentials, provider CLIs, endpoint catalogs, and API-key setup flows

## Onboarding Questions

During interactive onboarding, Codex should explain the setup and ask for:

- working language
- response tone
- output directory, using a safe relative path such as `output/framecore`, not an absolute path, `~`, URL, cloud sync path, or machine-specific folder
- QA strictness
- delivery upload behavior
- explicit user-request requirement before delivery or export
- QA requirement before generated asset delivery
- optional 24-hour workflow self-improvement review
- optional full Hipson expansion configured outside this kit; onboarding records intent but does not clone or install full Hipson
- whether to keep default neutral role display names
- local display names for role IDs if the user does not keep defaults

The defaults are conservative: project-local install, no automatic upload, standard QA, recurring review disabled, lightweight Hipson Adapter only, and neutral role display names.

## Stop Conditions

Codex should stop and ask the user before continuing when:

- the target workspace does not exist
- repository checks fail
- doctor/preflight reports an unsafe target
- onboarding config validation fails
- dry-run reports user-owned file conflicts
- the target already contains files that would be overwritten
- the user asks for global install without confirming the advanced path
- an external execution tool, credential, private cloud setting, or provider-specific setup is required

## Expected Result

After project-local install, the target workspace should contain:

- `framecore.config.json`
- `.framecore/manifest.json`
- `.agents/skills/...`
- `.codex/agents/...`
- `AGENTS.md` when the project did not already have one
- `AGENTS.framecore.md` when the project already had `AGENTS.md`

Codex should tell the user which files changed and how to ask Codex to read the installed project instructions.
