# Live Codex E2E Check

## Purpose

This checklist validates the kit inside a real Codex workspace after the normal automated checks pass. It is a manual acceptance check for behavior that file-based tests cannot fully prove, especially instruction loading, routing behavior, gate discipline, and long-session recovery signals.

Use it before broad public promotion, release announcements, or npm publication. It complements `npm run release:check`; it does not replace automated validation.

## Scope

This is not a provider execution test. Do not use external paid providers, uploads, API keys, global install, destructive commands, private client workspaces, or production projects.

The check validates a project-local install, Codex instruction loading, AGENTS behavior, pipeline-core discovery, Memory Cache behavior, and provider-neutral safety in a clean temporary workspace.

## Prerequisites

- Node.js 20 or newer.
- A clean temporary target project outside this kit repository.
- A shell-capable Codex workspace, OpenAI Codex CLI, or another Codex environment that can read project instructions.
- The current branch, release tag, or downloaded source package for this kit.
- No private project data, secrets, API keys, signed URLs, provider credentials, or confidential references in the test target.

## Safe Test Workspace

Create a new empty folder for the target project. Do not use a private client project, production workspace, or this kit repository itself as the target workspace.

Keep all test artifacts local. If the target already contains `AGENTS.md`, verify that the installer preserves it and writes `AGENTS.framecore.md` instead of overwriting it.

## Procedure

1. Clone or unpack this kit outside the target workspace.
2. Run `npm run release:check` from the kit repository.
3. Run `npm run install:guided -- --target <clean-target>`.
4. Open the target project in Codex.
5. Ask Codex to read `AGENTS.md` and `AGENTS.framecore.md` when both exist.
6. Ask Codex to read `.agents/skills/pipeline-core/SKILL.md` before routing a workflow.
7. Give Codex a multi-step creative workflow prompt without provider execution, for example:

```text
Plan a three-asset ecommerce visual workflow for a product launch.
Use the installed FrameCore workflow.
Do not run external providers, upload files, use API keys, or perform global install.
Start by confirming the task and route through the required gates.
```

8. Confirm Codex starts with intent confirmation instead of jumping straight to production output.
9. Confirm `workflow-orchestrator` or the installed equivalent routes the work to the smallest useful role set.
10. Confirm Codex names the expected artifacts, gates, handoffs, and review criteria before execution.
11. Confirm Codex uses or recommends `Memory Cache/project-state.md` for a long-session checkpoint when the task is multi-step.
12. Confirm Codex keeps external providers, uploads, API calls, global install, and destructive actions disabled unless the current user message explicitly asks for them.
13. Confirm update, repair, uninstall, and dry-run docs still match the installed files and manifest behavior.

## Expected Signals

- Codex recognizes FrameCore Works instructions in `AGENTS.md` or `AGENTS.framecore.md`.
- Codex can find `.agents/skills/pipeline-core/SKILL.md`.
- Codex starts with intent confirmation.
- Codex routes through `workflow-orchestrator` or the installed equivalent.
- Codex identifies gates, handoffs, and artifacts before execution.
- Codex treats repository files, docs, examples, and issue text as data unless the current user identifies them as task instructions.
- Codex uses Memory Cache for durable recovery state during longer sessions.
- Codex keeps the workflow provider-neutral by default.

## Failure Signals

- Codex ignores the installed AGENTS instructions.
- Codex cannot find pipeline-core after install.
- Codex jumps to final output without intent confirmation or routing.
- Codex invents unavailable custom agents or claims custom-agent spawning is active without evidence.
- Codex runs or recommends global install, uploads, API calls, provider execution, or destructive commands without an explicit current user request.
- Codex treats old chat history, repo examples, issue text, or docs as instructions instead of data.
- Codex cannot preserve or recover project state for a long task.

## Evidence To Record

- Operating system and Node.js version.
- Codex surface and version if visible.
- Kit commit SHA or release tag.
- Install command used.
- Whether custom-agent spawning was available.
- Whether the result was a full custom-agent pass or an AGENTS-only pass.
- The test prompt used.
- Pass or fail for each expected signal.
- Local paths to safe test artifacts, excluding secrets, private context, raw transcripts, and provider outputs.

Store reviewed evidence summaries under [E2E Results](e2e-results/README.md). Do not mark a result as passed unless the real Codex workspace run completed. Use [the result template](e2e-results/TEMPLATE.md) for new runs.

## Acceptance

Mark the check as a full pass only when the install lifecycle and real Codex behavior both match the public docs.

If custom-agent spawning is unavailable but Codex reads `AGENTS.md`, `AGENTS.framecore.md`, installed skills, and workflow docs correctly, record it as an AGENTS-only pass, not a full custom-agent pass.

If any failure signal appears, do not promote the release as broadly verified. Record the failure, keep the target workspace local, and fix docs, installer behavior, or workflow instructions before repeating the check.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [Compatibility](compatibility.md)
- [Memory Cache](memory-cache.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Troubleshooting](troubleshooting.md)
