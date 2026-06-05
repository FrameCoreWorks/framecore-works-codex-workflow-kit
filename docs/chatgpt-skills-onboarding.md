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

## Temporary Agent Model

For ChatGPT, FrameCore role agents become temporary workflow roles.

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
Use FrameCore Works as a ChatGPT Skills workflow, not as a Codex project-local install.

I am using ChatGPT. Do not clone the repository, run shell commands, create AGENTS.md, create .codex/agents files, initialize Memory Cache folders, upload files, use API keys, or enable external provider tools.

If ChatGPT Skills are available in this chat, help me create or adapt a FrameCore Works skill-based workflow. Use skill-creator if needed.

Important role model:
- Do not create permanent custom agents.
- Do not create a fixed agent roster as files.
- Treat FrameCore agents as temporary workflow roles created only inside the current task.
- Each temporary role must have a clear scope, required inputs, expected output artifact, review gate, handoff target, and stop condition.
- Temporary roles must inherit provider-neutral safety, no uploads without explicit request, no API keys, no external paid execution tools, and no hidden background work.

Start with onboarding. Ask me these questions one at a time, in plain language:

1. What kind of work do I want this workflow to help with?
2. What are my main use cases?
3. What outputs do I usually need?
4. Should the workflow be lightweight, standard, or strict?
5. How much QA do I want before final output?
6. Should the workflow prioritize speed, structure, creativity, evidence, or delivery readiness?
7. Do I want the conversation to continue in English, or should I type another language now?
8. Do I work mostly alone, with a team, or for clients?
9. Are there any things the workflow must never do, such as uploads, provider execution, API keys, private links, or changing files?
10. After setup, give me a reusable starter prompt for my next task.

After onboarding, summarize my workflow profile and create a compact skill-style operating guide for ChatGPT. Then show how the workflow will use temporary roles such as task confirmation, workflow orchestration, specialist production, QA, and delivery notes without storing them as permanent agents.
```

## Onboarding Outputs

The ChatGPT onboarding should produce:

- a short user workflow profile;
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
