# Project State

## Purpose

Durable recovery state for one operational chat or project folder.

## Checkpoint

- checkpoint_id: initial-setup
- checkpoint_status: active
- updated_utc: replace-me
- last_completed_gate: none
- current_gate: intent-confirmation
- next_action: define the next safe action

## Blocked Items

- none

## Files Touched

- none

## Decisions

- Memory Cache stores durable recovery state.
- Context stores user-supplied input and reference material.
- Do not repopulate Context from Memory Cache unless the current user explicitly asks for it.

## Loop State

- loop_id: none
- iteration: 0
- max_iterations: 0
- phase: stop
- stop_decision: stop_sufficient
- loop_evidence_refs: none

## Risks

- none recorded

## Safe Resume Point

Read AGENTS.md and the pipeline skill, then continue from `checkpoint_id`.

## Recovery Prompt

Use `recovery-prompt.md` as the paste-ready recovery instruction.

Saved state is not permission to push, upload, run providers, run APIs, run global install, or perform destructive actions.
