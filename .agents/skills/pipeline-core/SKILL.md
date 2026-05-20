---
name: pipeline-core
description: Use this skill for FrameCore Works workflow routing, role-based agents, gates, handoffs, project state, artifact templates, QA allowlists, delivery discipline, text-bearing image policy, Humanizer routing, HyperFrames routing, Hipson Adapter routing, and governance rules.
---

# Pipeline Core

Use this skill when a task needs the FrameCore Works workflow system.

It is the contract layer for roles, gates, handoffs, artifacts, text-bearing image policy, Humanizer routing, HyperFrames routing, Hipson Adapter routing, and workflow governance.

## When To Use

Use this skill when:

- A request needs more than one workflow stage or role.
- The task involves brief, references, direction, prompting, QA, delivery, onboarding, or governance.
- The user asks how the kit routes work or what the installed roles do.

Do not use this skill to bypass specialist skills, run tools, upload files, or replace the user's local preferences.

## Inputs

Required:

- `user_request`: the current task, goal, and any explicit exclusions.
- `workspace_context`: installed config, available artifacts, and current files when relevant.
- `mode`: analyze, plan, edit, generate, review, install, or deliver.

Optional:

- `existing_project_state`: prior gates, handoffs, artifacts, or decisions.
- `local_preferences`: language, tone, QA strictness, display names, and output path.
- `artifact_paths`: brief, reference pack, prompt pack, QA report, or manifests.

## Outputs

Produce one or more of:

- Task Confirmation
- Project State
- role route and gate sequence
- handoff notes
- loopback decision
- delivery or governance recommendation

## Process

1. `intent-confirmation` locks goal, exclusions, work mode, expected output, and immediate next step.
2. `workflow-orchestrator` chooses blueprint, roles, gates, handoffs, and next action.
3. Specialist roles produce contracts, not loose opinions.
4. `qa-iteration` reviews produced outputs when assets exist.
5. `delivery-documentation` packages final notes only after QA or explicit acceptance.

## References

Read only what is needed:

- `references/agent-roster.md` for role list and responsibilities.
- `references/workflow-operating-model.md` for stage order and review gates.
- `references/handoff-matrix.md` for allowed handoffs and required fields.
- `references/gate-registry.md` for canonical gate names.
- `references/text-image-generation-policy.md` for visible text in raster graphics.
- `references/humanizer-routing.md` for copy polish routing.
- `references/hyperframes-workflow.md` for coded-video workflow.

## Decision Rules

- Prefer the smallest route that preserves gates and handoffs.
- Use role IDs from the public kit and local display names only from onboarding config.
- Do not skip upstream gates when later roles depend on their artifacts.
- Route text, VO, captions, and user-facing polish through `humanizer` when copy quality matters.
- Route coded-video planning through HyperFrames skills when the requested artifact is a coded video composition.
- Route Hipson-style packets through `hipson-adapter` unless the user chooses full Hipson separately.

## Guardrails

- Use role IDs and local display names from onboarding.
- Do not skip upstream gates.
- Static raster graphics with visible text must use the native Codex/ChatGPT image generator powered by GPT Image 2 in one pass with text included.
- Delivery follows QA when generated assets exist.
- Upload, publish, or external delivery requires an explicit current user request.
- Workflow self-improvement creates proposals, not automatic mutations.
- Do not add private project context, secrets, local machine paths, or provider-specific execution dependencies.

## Handoff

Review gate: `workflow_route`.

Hand off with:

- `workflow_blueprint`
- `active_roles`
- `completed_or_existing_artifacts`
- `required_handoffs`
- `review_gates`
- `next_role`
- `next_action`

## QA Checklist

- First move confirms intent before specialist work.
- Selected roles match the task and available inputs.
- Required gates and handoffs are named.
- Missing artifacts trigger loopback instead of guesswork.
- External delivery or execution is not implied without user instruction.
- Public-neutral boundaries remain intact.
