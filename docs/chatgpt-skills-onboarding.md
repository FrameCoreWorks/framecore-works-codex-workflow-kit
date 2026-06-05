# ChatGPT Skills Onboarding

## Purpose

This guide explains how to use FrameCore Works workflow skills in ChatGPT when the user has access to ChatGPT Skills.

This is not the Codex installer. It does not clone the repository, write `.codex/agents/*.toml`, create `AGENTS.md`, run shell commands, initialize `Memory Cache/`, or install anything into a local workspace.

Use this path when:

- the user is in ChatGPT, not a shell-capable Codex workspace;
- ChatGPT Skills are available in the user's account or workspace;
- the user wants the FrameCore workflow behavior as reusable skills and guided workflow prompts;
- the user does not need project-local files, manifests, repair, uninstall, or Codex custom-agent spawning.

OpenAI documents ChatGPT Skills as reusable workflows that can be created in conversation with `skill-creator` and installed in ChatGPT. Treat that product surface as beta and user-account dependent. Do not assume every ChatGPT user can install skills yet.

## Product Boundary

The Codex path stays unchanged:

- Codex uses `AGENTS.template.md`.
- Codex can render `.codex/agents/*.toml` into project-local role agents.
- Codex can install `.agents/skills/`, run onboarding, run doctor, run dry-run, install, update, repair, uninstall, and initialize `Memory Cache/`.

The ChatGPT path is different:

- ChatGPT uses skills as reusable workflow instructions.
- ChatGPT does not receive permanent `.codex/agents/*.toml` role files from this repo.
- ChatGPT should not create a stable roster of agent files.
- ChatGPT should treat workflow roles as temporary task roles created inside the conversation by the active skill or workflow step.

## Existing Skill Guard

Some ChatGPT accounts may already contain older, private, local, or previously installed skills with names such as `workflow-orchestrator` or other workflow-specific labels. Those existing skills are not proof that this onboarding is complete.

When using this ChatGPT path:

- do not say the workflow is already installed, current, repaired, validated, or ready because existing skills are present;
- do not run or claim repository validation, package checks, doctor checks, hash checks, or Memory Cache repair, because ChatGPT Skills onboarding is not a local workspace install;
- do not call `skill-installer` unless the user explicitly asks to install a generated ChatGPT skill after onboarding;
- do not use private or local canonical skill names as the public workflow contract;
- do not rename the user's personal workflow after this source repo unless the user asks for that name;
- refer to the source repo only when needed for attribution or source lookup;
- start with onboarding questions before recommending any `$skill` invocation.

If existing local skills are detected, treat them only as optional reference material after the user approves. The first task is still to learn the user's work style and produce a neutral user workflow profile.

## Temporary Agent Model

For ChatGPT, the source repo's role-agent responsibilities become temporary workflow roles.

A temporary workflow role:

- exists only for the current task or current workflow step;
- is selected by the active skill or workflow route;
- has a bounded scope, inputs, expected artifact, review gate, and handoff target;
- must inherit the provider-neutral boundary, upload consent rule, text-image rule, and no-secret policy;
- must stop when its artifact or handoff is complete;
- must not become a stored custom agent, persistent persona, hidden daemon, or background automation.

Use this mapping:

| Codex role-agent concept | ChatGPT Skills equivalent |
| --- | --- |
| `.codex/agents/workflow-orchestrator.toml` | temporary workflow-orchestrator role invoked by the pipeline skill |
| `intent-confirmation` | temporary task-confirmation role at the start of a workflow |
| specialist role agents | temporary specialist roles selected by the relevant skill |
| handoff matrix | conversation-level handoff notes between temporary roles |
| Project State artifact | compact visible state summary in the chat or user-provided document |
| `Memory Cache/` files | not available by default; use a visible summary unless the user explicitly manages files elsewhere |

## ChatGPT Onboarding Prompt

Use this prompt in ChatGPT when the user wants to adapt the workflow without a Codex install:

```text
Use the workflow from this source GitHub repo as source material for a ChatGPT Skills workflow, not as a Codex project-local install.

Source repo URL: https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit

I am using ChatGPT. Do not clone the repository, run shell commands, create AGENTS.md, create .codex/agents files, initialize Memory Cache folders, upload files, use API keys, or enable external provider tools.

If ChatGPT Skills are available in this chat, help me create or adapt a neutral skill-based workflow for my own work. Use skill-creator only if needed.

Important existing-skill guard:
- If this ChatGPT account already has workflow-orchestrator, local, private, or older workflow skills installed, do not treat that as completed setup.
- Do not say the workspace is already installed, current, validated, repaired, or ready because existing skills are present.
- Do not run or claim doctor checks, package checks, hash checks, repository validation, or Memory Cache repair in ChatGPT.
- Do not call skill-installer unless I explicitly ask to install a generated skill after onboarding.
- Do not recommend any $skill invocation before onboarding is complete.
- Do not name my personal workflow after the source repo unless I ask for that name. Use neutral wording such as "your workflow", "this workflow", or the name I provide.
- Refer to the source repo only when needed for attribution or source lookup.

Important role model:
- Do not create permanent custom agents.
- Do not create a fixed agent roster as files.
- Treat source repo role-agent concepts as temporary workflow roles created only inside the current task.
- Each temporary role must have a clear scope, required inputs, expected output artifact, review gate, handoff target, and stop condition.
- Temporary roles must inherit provider-neutral safety, no uploads without explicit request, no API keys, no external paid execution tools, and no hidden background work.

Start with onboarding before checking, invoking, or relying on any existing workflow skills. I pasted this prompt in English, but the onboarding setup should start by choosing the setup language. Ask me these questions one at a time, in plain language:

1. What language should I use for this onboarding setup? I can answer in any language. If I say "default", continue in English.
2. What kind of work do I want this workflow to help with?
3. What are my main use cases?
4. What outputs do I usually need?
5. Should the workflow be lightweight, standard, or strict?
6. How much QA do I want before final output?
7. Should the workflow prioritize speed, structure, creativity, evidence, or delivery readiness?
8. Do I work mostly alone, with a team, or for clients?
9. Are there any things the workflow must never do, such as uploads, provider execution, API keys, private links, or changing files?
10. After setup, give me a reusable starter prompt for my next task.

After I answer question 1, switch to the selected setup language. Before asking question 2, give me a short beginner-friendly preflight explanation in that language. Explain:
- what this source workflow is: a reusable workflow and skill setup for organizing work with ChatGPT Skills;
- what will happen next: you will ask onboarding questions one at a time, then create a neutral workflow profile, compact operating guide, and reusable starter prompt for my work;
- how it will work in ChatGPT: it will use temporary task roles inside the conversation, not permanent custom agents or local `.codex/agents` files;
- what will not happen in ChatGPT: no repo cloning, no shell commands, no local files, no local Memory Cache folders, no uploads, no API keys, and no external provider tools;
- when the Codex path is needed: if I want a real project-local install with files, manifests, rendered agents, update, repair, uninstall, or Memory Cache.

Keep the preflight concise and beginner-safe. Then ask question 2.

After onboarding, summarize my workflow profile and create a compact skill-style operating guide for ChatGPT. Then show how the workflow will use temporary roles such as task confirmation, workflow orchestration, specialist production, QA, and delivery notes without storing them as permanent agents.

Your first response should ask onboarding question 1 about setup language. Do not summarize setup as complete until all onboarding questions have been answered.
```

Expected first response shape:

```text
I will set this up as a ChatGPT Skills workflow for your own work. This is not a local Codex install, and existing installed skills do not mean onboarding is complete.

Question 1: What language should I use for this onboarding setup? You can answer in any language. If you say "default", I will continue in English.
```

Expected second response shape after the user chooses a language:

```text
Before we start, here is what we are setting up:

- This is a ChatGPT Skills workflow setup for your own work.
- I will ask a few onboarding questions, then create your workflow profile, operating guide, and starter prompt.
- In ChatGPT, this does not install local repo files or create permanent agents. It uses temporary task roles inside the conversation.
- I will not clone repos, run shell commands, upload files, use API keys, or enable external provider tools.
- If you want a real local workspace install later, use the Codex install path.

Question 2: What kind of work do you want this workflow to help with?
```

Failure pattern to avoid:

```text
Done. Your workspace already has the current source workflow skill kit. Validation passed. You can now use $workflow-orchestrator.
```

## Onboarding Outputs

The ChatGPT onboarding should produce:

- a short user workflow profile;
- the selected onboarding setup language;
- a beginner preflight summary shown before workflow-profile questions;
- a list of common task routes;
- the temporary roles allowed for those routes;
- the artifacts each temporary role may produce;
- the safety boundaries that always apply;
- a starter prompt the user can reuse;
- a note that Codex project-local install remains the full local workspace path.

## Stop Conditions

ChatGPT should stop and explain the boundary when:

- the user expects repository files to be installed into a local workspace;
- the user asks ChatGPT to run shell commands without a connected execution environment;
- the user expects `.codex/agents/*.toml` to become native ChatGPT agents;
- the user asks for hidden persistent agents, background automation, uploads, provider execution, API-key setup, or private cloud access without explicit current approval.

## Skill Packaging Notes

For ChatGPT, prefer one compact root skill or a small group of focused skills over a large agent roster.

Healthy packaging shape:

- `framecore-workflow-intake` for onboarding, task confirmation, and route choice;
- `framecore-creative-workflow` for creative production routes;
- `framecore-provider-governance` for provider-neutral and text-bearing image policy;
- optional future focused skills for ecommerce, storyboard, QA, delivery, or coded-video planning.

Do not package `.codex/agents/*.toml` as ChatGPT agents. Keep them as Codex-specific source. ChatGPT should use their responsibilities only as temporary role descriptions inside skills.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [Using The Kit](using-the-kit.md)
- [Bundle Readiness](bundle-readiness.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Text Image Policy](text-image-policy.md)
