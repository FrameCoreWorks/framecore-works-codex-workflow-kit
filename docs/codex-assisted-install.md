# Codex-Assisted Install

## Purpose

This guide is for users who want Codex to install the kit for them from a GitHub link.

The user should paste the install instruction into Codex from the workspace where the kit should be installed. Codex should then clone the repo into a temporary or tools folder outside the target workspace, read the docs, run checks, run onboarding, preview the install, and install project-locally.

## Beginner Paste-In Instruction

Use this version when the user does not know Terminal and needs Codex to explain each step:

```text
Install FrameCore Works: Creative Workflow Skill Kit for Codex from this GitHub repo:

https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit

I am a beginner. Please guide me step by step.

Before doing anything else, confirm that I am using a shell-capable Codex workspace, not a regular ChatGPT chat window.
If this is a regular ChatGPT chat window or any chat-only environment without workspace files and shell commands, stop and tell me this cannot install the repo here. Tell me to open Codex, open or create a local project folder, then paste this prompt there.

First check whether this Codex environment can clone repositories and run local shell commands.
If it can, clone the repo into a temporary or tools folder outside my project, read README.md, docs/quickstart.md, and docs/codex-assisted-install.md, then explain in plain language what will be installed and how it will improve my workflow.
Start by telling me that this workflow kit was created for creative work such as graphics, video, storyboards, campaign assets, e-commerce assets, prompt workflows, QA, and delivery preparation, but can be adapted to other use cases.

Then follow the safe install path:
1. Run the repository checks.
2. Run doctor/preflight against my current workspace.
3. Run onboarding for my current workspace and explain each question before I answer, including questions about what I do, my main use cases, and how the pipeline should fit my work style.
4. Run install dry-run after onboarding.
5. Install project-local only after showing me the planned writes.
6. Ask whether I want to initialize Context/ and Memory Cache/ for long-session recovery. If I say yes, run npm run memory:init and npm run memory:validate for my current workspace.
7. Show me the changed files, final installed tree, and first prompt I should use after installation.

Do not use global install.
Do not enable paid external execution tools.
Do not upload anything.
Do not use API keys.
Do not run provider tools.
Stop and ask me before overwriting any existing file.

If this Codex environment cannot run shell commands, tell me that I need a shell-capable Codex workspace or help from a technical user, then show me the manual Quickstart link.
If I do not know how to clone the repository, recommend GitHub Desktop as the easiest visual cloning tool and remind me to clone this repo into a temporary or tools folder outside my project.
```

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
- recommend GitHub Desktop as an optional visual cloning tool when the user is not comfortable with Terminal or Git commands
- first confirm that the user is in a shell-capable Codex workspace, not a regular ChatGPT chat window
- stop if the current surface is chat-only and cannot access workspace files or run local shell commands
- read `README.md`, `docs/quickstart.md`, and this guide before installing
- run repository checks before writing target workspace files
- run doctor/preflight against the target workspace
- run onboarding before install dry-run
- run install dry-run after onboarding
- stop on user-owned file conflicts
- install project-local only
- ask whether to initialize Memory Cache for long-session recovery, then run `npm run memory:init` and `npm run memory:validate` only if the user agrees
- show changed files and installed tree
- avoid global install unless the user explicitly asks for it
- avoid external execution tools, provider credentials, provider CLIs, endpoint catalogs, and API-key setup flows

## Onboarding Questions

During interactive onboarding, Codex should explain the setup and ask for:

- onboarding prompt language only, defaulting to English for international users and allowing the user to type their preferred setup language
- what kind of work the user does
- the user's main use cases for the pipeline
- how the pipeline should fit the user's work style
- any adaptation notes for non-creative or specialized use cases
- response tone
- output directory for the user's generated files and workflow reports, using a safe relative path such as `output/workflow`, not an absolute path, `~`, URL, cloud sync path, or machine-specific folder; do not describe this as a folder for this kit's files
- QA strictness
- delivery upload behavior
- explicit user-request requirement before delivery or export
- QA requirement before generated asset delivery
- optional 24-hour workflow self-improvement review
- optional full Hipson expansion configured outside this kit; explain that full Hipson is a separate optional repository that can later add broader repository scanning, change and delta reviews, sidecar review agents, cross-repo orchestration, CLI commands, and a larger Hipson knowledge base; in this workflow it acts as an optional expansion layer for deeper analysis and structured instruction packets; onboarding records intent only and does not clone or install full Hipson
- whether to keep default neutral role display names
- local display names for role IDs if the user does not keep defaults

The defaults are conservative: project-local install, no automatic upload, standard QA, recurring review disabled, lightweight Hipson Adapter only, and neutral role display names.

## Stop Conditions

Codex should stop and ask the user before continuing when:

- the target workspace does not exist
- the user pasted the prompt into regular ChatGPT or another chat-only surface that cannot access workspace files and run shell commands
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

If the user enabled long-session recovery, Codex should also confirm that `Context/` and `Memory Cache/` were created and that `npm run memory:validate` passed.
