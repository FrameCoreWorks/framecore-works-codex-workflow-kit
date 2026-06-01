---
name: workflow-self-improvement
description: Use this explicit-only skill for post-task retrospectives, workflow audits, improvement notes, recurring process review prompts, and approval-gated change proposals. It must not mutate workflow files, upload, run external tools, or act as a hidden daemon.
---

# Workflow Self-Improvement

This skill turns completed work into auditable workflow improvements. It creates logs and proposals, not adopted rules.

Use only when explicitly requested or when an opted-in report-only recurring review asks for it.

## When To Use

Use this skill when:

- The user explicitly asks for workflow retrospective, process audit, improvement proposals, or recurring report review.
- A completed workflow has lessons, defects, friction, or repeated manual steps worth documenting.
- A report-only automation asks for proposals without mutation.

Do not use this skill as a hidden daemon, automatic editor, external executor, or upload process.

## Inputs

Required:

- `completed_work_context`: task summary, artifacts, decisions, and known results.
- `evidence`: QA notes, delivery notes, errors, user feedback, or observed friction.
- `scope`: which workflow surface may be analyzed.

Optional:

- `improvement_log_template`: local template for retrospective notes.
- `change_proposal_template`: local template for proposed workflow changes.
- `adoption_owner`: role or maintainer who can approve changes.

## Outputs

Produce one or more:

- Improvement Log
- Workflow Change Proposal
- Workflow Improvement Alert

Every proposal needs evidence labels, affected surface, proposed change, benefit, risk, acceptance test, rollback, owner, and status.

## Process

1. Collect only evidence from the completed or reviewed workflow.
2. Separate facts, inferences, and recommendations.
3. Write logs or proposals without changing workflow files.
4. State the affected surface and adoption owner.
5. Hand proposals to `workflow-orchestrator` for adoption decisions.

## Decision Rules

- If there is no evidence, do not invent a process lesson.
- If a change would affect public repo behavior, require explicit maintainer approval.
- If QA validation is needed, route through `qa-iteration` only when orchestrated.
- Keep recurring review report-only unless the user explicitly asks for a patch.
- When implementation is explicitly requested, use a self-improvement sufficiency gate before another patch batch and again after validation.
- Choose `stop_sufficient` when the objective is met, `patch_one_gap` for one concrete bounded gap, or `ask_user` only for protected boundaries or ambiguous scope.

## Self-Improvement Sufficiency Gate

Use this compact contract when a requested improvement could continue into
another patch:

- `objective`
- `current_evidence`
- `remaining_gap`
- `next_patch_scope`
- `expected_benefit`
- `diminishing_returns_check`
- `no_action_option`
- `decision`: `stop_sufficient`, `patch_one_gap`, or `ask_user`
- `approval_reason`
- `stop_reason`

Do not continue improving only because more polishing is imaginable.

## Guardrails

- no autonomous daemon
- no hidden learning
- no uploads
- no external execution
- no destructive operations
- no edits to instructions, skills, agents, gates, or handoffs without explicit approval
- workflow-orchestrator decides adoption
- qa-iteration validates only when routed
- no open-ended self-improvement loops after the stop condition is met

## Handoff

Review gate: `post_execution_fit` for lessons from completed work, then `workflow_route` for adoption decisions.

Hand off with:

- `improvement_log`
- `change_proposal`
- `evidence_labels`
- `affected_surface`
- `risk`
- `acceptance_test`
- `rollback`
- `status`

## QA Checklist

- Invocation is explicit or from an opted-in report-only review.
- Evidence is labeled and traceable.
- Proposal does not mutate workflow files by itself.
- Risks, tests, rollback, and owner are present.
- No upload, external execution, destructive operation, or hidden learning occurs.
