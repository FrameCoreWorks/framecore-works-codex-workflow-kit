---
name: pipeline-core
description: Use this skill for FrameCore Works workflow routing, role-based agents, gates, handoffs, project state, artifact templates, reasoning routes, request diagnostics, QA allowlists, delivery discipline, text-bearing image policy, Humanizer routing, HyperFrames routing, Hipson Adapter routing, and governance rules.
---

# Pipeline Core

Use this skill when a task needs the FrameCore Works workflow system.

It is the contract layer for roles, gates, handoffs, artifacts, request diagnostics, reasoning routes, text-bearing image policy, Humanizer routing, HyperFrames routing, Hipson Adapter routing, and workflow governance.

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
- Workflow Request Diagnostic
- role route and gate sequence
- reasoning route and runtime route when useful
- handoff notes
- loopback decision
- delivery or governance recommendation

## Process

1. `intent-confirmation` locks goal, exclusions, work mode, expected output, and immediate next step.
2. `workflow-orchestrator` chooses blueprint, roles, gates, handoffs, reasoning route when useful, and next action.
3. Specialist roles produce contracts, not loose opinions.
4. `qa-iteration` reviews produced outputs when assets exist.
5. `delivery-documentation` packages final notes only after QA or explicit acceptance.

## References

Read only what is needed:

- `references/agent-roster.md` for role list and responsibilities.
- `references/workflow-operating-model.md` for stage order and review gates.
- `references/workflow-blueprints.md` for common task routes and loopback boundaries.
- `references/handoff-matrix.md` for allowed handoffs and required fields.
- `references/gate-registry.md` for canonical gate names.
- `references/inference-reasoning-methods.md` for compact reasoning routes, runtime route boundaries, candidate limits, and raw trace prohibitions.
- `references/text-image-generation-policy.md` for visible text in raster graphics.
- `references/humanizer-routing.md` for copy polish routing.
- `references/hyperframes-workflow.md` for coded-video workflow.

## Decision Rules

- Prefer the smallest route that preserves gates and handoffs.
- Use a Workflow Request Diagnostic when the request could be mistaken for install help, a simple prompt, a full creative workflow, QA, delivery, provider execution planning, or workflow improvement.
- Record a compact `reasoning_route` when the task needs decomposition, verification, comparison, a tool loop, branching, or bounded search.
- Prefer public runtime tiers and reasoning effort levels over brittle exact model names when a `runtime_route` is useful.
- Start from a workflow blueprint when the request matches a known pattern, then shrink or expand it based on available artifacts.
- Use role IDs from the public kit and local display names only from onboarding config.
- Do not skip upstream gates when later roles depend on their artifacts.
- Route text, VO, captions, and user-facing polish through `humanizer` when copy quality matters.
- Route coded-video planning through HyperFrames skills when the requested artifact is a coded video composition.
- Route Hipson-style packets through `hipson-adapter` unless the user chooses full Hipson separately.

## Guardrails

- Use role IDs and local display names from onboarding.
- Do not skip upstream gates.
- Generated static raster graphics should use the native Codex/ChatGPT image generator powered by GPT Image 2 by default when available.
- Static raster graphics with visible text must use the native Codex/ChatGPT image generator powered by GPT Image 2 in one pass with text included.
- Do not substitute Python-generated artwork, SVG, HTML/canvas, Sharp/composited PNG, or other coded artwork unless the user explicitly asks for coded, vector, template, or editable source output.
- Delivery follows QA when generated assets exist.
- Upload, publish, or external delivery requires an explicit current user request.
- Workflow self-improvement creates proposals, not automatic mutations; when implementation is requested, use the self-improvement sufficiency gate to choose `stop_sufficient`, `patch_one_gap`, or `ask_user`.
- Do not store raw chain-of-thought, raw reasoning traces, raw debate transcripts, private URLs, provider responses, secrets, `.env` files, or copied private project context.
- A runtime route or model recommendation is not permission to call an API, use an external provider, upload files, run destructive commands, or install routing infrastructure.
- Do not add private project context, secrets, local machine paths, or provider-specific execution dependencies.

## Handoff

Review gate: `workflow_route`.

Hand off with:

- `workflow_blueprint`
- `active_roles`
- `completed_or_existing_artifacts`
- `last_completed_gate`
- `required_handoffs`
- `review_gates`
- `request_diagnostic`
- `reasoning_route`
- `runtime_route`
- `pending_decisions`
- `blocked_items`
- `files_touched`
- `risks`
- `next_role`
- `next_action`
- `recovery_prompt`

## QA Checklist

- First move confirms intent before specialist work.
- Selected roles match the task and available inputs.
- Required gates and handoffs are named.
- Reasoning routes are compact, bounded, and do not store raw reasoning traces.
- Runtime routes keep provider/API/upload permissions false unless the current user explicitly asks for the protected action.
- Missing artifacts trigger loopback instead of guesswork.
- External delivery or execution is not implied without user instruction.
- Public-neutral boundaries remain intact.
