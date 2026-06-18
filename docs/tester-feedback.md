# Tester Feedback Guide

## Purpose

Use this guide when someone tests FrameCore Works Skill Kit and wants to report what happened. It is designed for non-technical testers, so exact wording and screenshots are more useful than guesses.

Good feedback should answer three questions:

- Which environment did the tester use?
- What did they paste or run?
- Where did the flow stop, succeed, or become confusing?

Do not include API keys, private links, client data, credentials, `.env` files, private cloud folders, personal emails, or full private project context in feedback.

## Quick Feedback Template

Copy this block and fill in what you know:

```text
Tester name or handle:
Date:

Environment:
- Codex / ChatGPT / other:
- App or CLI version if visible:
- Operating system:
- Was the Codex sandbox or workspace folder configured? yes / no / not sure
- Could Codex run shell commands? yes / no / not sure
- Was git available? yes / no / not sure

Install or onboarding path:
- Beginner Start prompt / guided installer / manual commands / ChatGPT Skills onboarding / update existing install:
- Repo link used:
- Target project folder was new and empty? yes / no / not sure
- GitHub Desktop used? yes / no

What I pasted or ran:
Paste the exact prompt or commands here if safe.
Do not paste secrets, tokens, private URLs, or client data.

Result:
- Completed successfully? yes / no / partly
- Where did it stop?
- Exact error or confusing message:
- Screenshot attached? yes / no

What I expected:

What actually happened:

Was anything unclear?

If installed successfully:
- Did onboarding questions make sense? yes / no / partly
- Did Codex explain what it was installing? yes / no / partly
- Did Codex show changed files and final installed tree? yes / no / partly
- First workflow task tried after install:
- Did the workflow route through agents/skills as expected? yes / no / not sure

If using ChatGPT Skills:
- Did onboarding start before setup was called complete? yes / no
- Did ChatGPT avoid claiming local install, doctor checks, hash checks, or Memory Cache repair? yes / no / not sure
- Did it avoid creating permanent Codex agents? yes / no / not sure

Privacy check:
- This feedback contains no secrets, API keys, private cloud links, client data, or personal credentials: yes / no
```

## Minimal Feedback

If the tester does not want to fill the full template, ask for this minimum:

```text
1. Was this Codex, ChatGPT, or something else?
2. What exact text did you paste?
3. What was the first confusing or failing message?
4. Screenshot, if available.
5. Did anything get installed, or was it only an explanation?
```

## Common Labels

Use these labels when organizing feedback:

| Label | Use when |
| --- | --- |
| `beginner-install` | A beginner tried the README prompt or guided install. |
| `chatgpt-skills` | The tester used ChatGPT Skills onboarding instead of Codex. |
| `sandbox-setup` | Codex needed workspace or sandbox configuration. |
| `git-missing` | Shell worked, but `git` or `gh` was unavailable. |
| `onboarding-confusing` | The tester reached onboarding but did not understand a question. |
| `update-existing-install` | The tester already had an install and tried to update it. |
| `workflow-routing` | Install worked, but a later workflow did not route clearly. |
| `provider-boundary` | The tester expected generation, upload, provider calls, PDFs, or API execution. |
| `docs-gap` | The issue was unclear wording or a missing explanation. |

## What Maintainers Should Check

When feedback arrives, inspect in this order:

1. Confirm whether the tester used Codex, ChatGPT, or another surface.
2. Confirm whether the environment could run shell commands.
3. Confirm whether the tester used a fresh target project folder, not the kit repo itself.
4. Check whether `.framecore/manifest.json` exists if they report an existing install or update.
5. If setup stopped, identify the step: clone, repository checks, doctor/preflight, onboarding, dry-run, install, Memory Cache, or first workflow task.
6. If the tester expected media/PDF/provider execution, confirm whether they were using the workflow kit as planning/onboarding or an execution tool.
7. If the issue is unclear docs, update README, Quickstart, FAQ, Troubleshooting, or this feedback guide.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [ChatGPT Skills Onboarding](chatgpt-skills-onboarding.md)
- [Troubleshooting](troubleshooting.md)
- [Using The Kit](using-the-kit.md)
