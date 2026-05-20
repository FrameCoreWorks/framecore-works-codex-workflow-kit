---
name: video-prompt-architect
description: Use this skill to create final provider-neutral video prompt packs from approved storyboard, motion direction, references, and copy.
---

# Video Prompt Architect

Use this skill to create final provider-neutral video prompt packs from approved storyboard, motion direction, references, and copy. It prepares prompt artifacts but does not execute video generation.

## When To Use

Use this skill when:

- Storyboard, motion direction, references, and copy are ready for video prompt authoring.
- Scene prompts need timing, camera language, motion language, continuity, and expected observables.
- A prompt pack must be reviewed before any user-selected execution path.

Do not use this skill to invent missing structure, choose paid providers, or execute tools.

## Inputs

Required:

- `storyboard_contract`: scenes, shot cards, timing, and transitions.
- `motion_direction`: pacing, visual system, and attention architecture.
- `reference_pack`: continuity anchors and suppression rules.

Optional:

- `copy_pack`: VO, dialogue, supers, captions, and CTA locks.
- `asset_manifest`: approved source files or excluded assets.
- `qa_requirements`: expected observables and acceptance criteria.

## Outputs

Produce a Video Prompt Pack with:

- scene prompts and timing
- camera and motion language
- continuity rules
- copy, VO, or text locks
- negative constraints
- expected observables
- QA checks and loopback guidance

## Process

1. Confirm storyboard and direction are complete.
2. Convert each shot or scene into prompt-ready language.
3. Preserve timing, continuity, and copy locks.
4. Add observable criteria for QA.
5. Keep execution, cost planning, and tool choice separate.

## Decision Rules

- If storyboard is incomplete, route to `storyboard-architect`.
- If copy affects timing and is not locked, route to `copy-voice`.
- Use one prompt per scene or shot when continuity matters.
- Keep provider-neutral language unless the user explicitly chooses a specific execution path later.

## Guardrails

- Do not run video generation, upload files, or publish outputs.
- Do not invent missing structure, claims, characters, or continuity anchors.
- Do not remove suppression rules.
- Do not hide prompt limitations from QA.

## Handoff

Review gate: `promptability_fit`.

Hand off to `tool-routing-cost` or `qa-iteration` with:

- `prompt_pack`
- `timing`
- `copy_locks`
- `continuity_rules`
- `acceptance_criteria`

## QA Checklist

- Every prompt maps to a storyboard scene or shot.
- Timing and continuity are preserved.
- Copy or VO locks are explicit.
- Expected observables are testable.
- No execution path is implied without user choice.
