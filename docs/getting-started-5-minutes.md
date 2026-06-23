# Getting Started In 5 Minutes

## Purpose

Use this page if someone sent you this repo and you want the shortest safe path to try it in Codex.

FrameCore Works Skill Kit adds a project-local workflow layer to Codex for creative and delivery work: briefs, references, campaign direction, image and video prompt planning, storyboard work, QA, delivery notes, and long-session recovery.

It does not install paid providers, API keys, uploads, or global tools by default.

## Before You Start

Use a shell-capable Codex workspace, not a regular ChatGPT chat window.

Recommended beginner setup:

1. Open Codex.
2. Create a new empty project folder in your Codex workspace, for example `Workflow Test`.
3. Open that folder in Codex.
4. If Codex asks you to configure the sandbox or workspace, choose that new project folder.
5. Paste the prompt below into Codex.

If you do not know how to clone a repo, install [GitHub Desktop](https://desktop.github.com/) and use it only as a visual helper. GitHub Desktop does not run the installer by itself.

## Copy-Paste Prompt

```text
Install FrameCore Works Skill Kit for Codex from:
https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit

I am new to this repo. Use the safe beginner path:

1. Confirm this is a shell-capable Codex workspace, not a regular ChatGPT chat.
2. Clone the repo into a temporary or tools folder outside my project.
3. Read README.md, docs/quickstart.md, and docs/codex-assisted-install.md.
4. Explain in plain language what will be installed and what will not be installed.
5. Run repository checks.
6. Run doctor/preflight against my current workspace.
7. Run onboarding for my current workspace and explain each question before I answer.
8. Run install dry-run after onboarding.
9. Install project-local only after showing me the planned writes.
10. Ask whether I want Context/ and Memory Cache/ for long-session recovery.
11. Show changed files, the installed tree, and my first post-install prompt.

Do not use global install.
Do not use providers, uploads, API keys, or external execution tools.
```

## What Should Happen

Codex should first confirm that it is running in the right environment. Then it should explain the install, ask onboarding questions, show planned file writes, and install only into your current project folder.

The install is project-local. It should not modify unrelated projects.

After install, you should see local workflow files such as `AGENTS.md`, `AGENTS.framecore.md`, `.codex/agents/`, `.agents/skills/`, `framecore.config.json`, and `.framecore/manifest.json`, depending on the selected options.

## If Codex Cannot Run Commands

If Codex says `git` or `gh` is missing, nothing has been installed yet.

Beginner fallback:

1. Clone the repo with GitHub Desktop into a temporary, tools, or GitHub folder outside your project.
2. Return to Codex.
3. Ask Codex to continue the FrameCore install from the cloned repo.

## After Install

Use this starter prompt in your project:

```text
Read AGENTS.md and AGENTS.framecore.md if both exist. Use the installed FrameCore workflow for this task. Start by confirming the task, choose the smallest useful route, name the expected artifacts and gates, and do not use external providers, uploads, API keys, or global install.
```

## When To Use The Full Docs

Use the full docs when you want more control:

- [README](../README.md) for the complete repo overview and install prompt.
- [Quickstart](quickstart.md) for beginner and terminal paths.
- [Codex-Assisted Install](codex-assisted-install.md) for the safe Codex-guided install flow.
- [Included Agents And Skills](included-agents-and-skills.md) for the full inventory.
- [Workflow Map](workflow-map.md) for roles, skills, gates, artifacts, and handoffs.
- [Troubleshooting](troubleshooting.md) if something stops or looks unclear.
