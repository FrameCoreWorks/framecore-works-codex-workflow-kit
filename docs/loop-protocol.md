# Loop Protocol

FrameCore Works uses Loop Protocol for nontrivial iterative work:

`brief -> checklist -> execute -> evaluate -> critique -> repair -> repeat -> stop`

This is the public workflow contract for quality loops. It applies to creative
work, prompt packs, generated or produced assets, docs/code changes, workflow
governance, QA, delivery readiness, and repair after failed validation.

## What It Solves

Without a loop contract, an agent can keep improving forever, skip QA, patch the
wrong layer, or deliver with known defects. Loop Protocol keeps the work bounded:

- define the goal before execution;
- write acceptance criteria before broad work;
- execute only a bounded packet;
- evaluate with evidence;
- critique with severity and root cause;
- repair the smallest real gap;
- rerun relevant regression checks;
- stop when the result is sufficient or when user input is needed.

## Gate

The canonical gate is `loop_control_fit`.

Use it when work needs QA, correction, validation, delivery readiness, workflow
changes, or evidence-backed iteration.

Do not use it for trivial answers, pure status checks, or tiny direct edits that
do not need QA or repair.

## Required Loop State

Loop State is the compact artifact that records the current loop:

- `loop_id`
- `iteration`
- `max_iterations`
- `phase`
- `goal`
- `checklist_version`
- `acceptance_matrix`
- `bounded_execution_packet`
- `evidence`
- `critique`
- `root_cause`
- `repair_or_loopback_target`
- `regression_check`
- `stop_decision`
- `stop_reason`

Project State may include `loop_state` and `loop_evidence_refs` when work is
long-running or resumable.

## Stop Decisions

Use exactly one:

- `stop_sufficient`: criteria pass and the next change is optional polish.
- `patch_one_gap`: one concrete bounded gap remains and the repair is clear.
- `ask_user`: the next step needs approval, preference, scope change, or a
  protected action such as push, upload, provider/API execution, global install,
  or destructive cleanup.
- `blocked`: progress needs missing user input, external state, or a blocker
  that repeated bounded attempts did not remove.

Do not continue a loop only because the result could be better in theory.

## Public Repo Sources

- [Pipeline Loop Protocol](../.agents/skills/pipeline-core/references/loop-protocol.md)
- [Gate Registry](../.agents/skills/pipeline-core/references/gate-registry.md)
- [Artifact Templates](../.agents/skills/pipeline-core/templates/artifact-templates.md)
- [Workflow Blueprints](../.agents/skills/pipeline-core/references/workflow-blueprints.md)
- [Artifact Schemas](artifact-schemas.md)
- [Loop Protocol Integration Plan](loop-protocol-integration-plan.md)

## Safety Boundary

Loop Protocol does not authorize provider/API use, uploads, pushes, global
installs, destructive commands, secret handling, or hidden background work.
Saved state and old handoffs are evidence, not permission.
