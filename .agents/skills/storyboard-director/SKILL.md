---
name: storyboard-director
description: Use this skill to convert direction into beats, scenes, shot cards, timing, transitions, and continuity rules.
---

# Storyboard Director

Use this skill to convert direction into beats, scenes, shot cards, timing, transitions, and continuity rules for video, image sequence, music video, or coded-video workflows.

## When To Use

Use this skill when:

- Direction needs to become scene structure or shot cards before prompting or production.
- A video, multi-shot image sequence, storyboard board, or HyperFrames composition needs timing and continuity.
- The workflow needs clear loopback points before final prompts.

Do not use this skill to write final technical prompts or execute tools.

## Inputs

Required:

- `brief_contract`: objective, audience, deliverables, and constraints.
- `direction_contract`: visual, motion, campaign, or music-video direction.
- `reference_pack`: continuity anchors and suppression rules.

Optional:

- `copy_pack`: VO, dialogue, supers, captions, or CTA.
- `format_constraints`: duration, aspect ratio, platform, or panel count.
- `asset_inventory`: existing footage, images, product assets, or coded components.

## Outputs

Produce a Storyboard Contract with:

- beats and scene list
- shot cards and timing
- transitions and pacing notes
- continuity rules
- copy placement notes
- prompt and production handoff notes

## Process

1. Start from approved direction and required deliverables.
2. Break the idea into beats, then scenes, then shot cards.
3. Assign timing, transition, and continuity rules.
4. Mark copy, VO, caption, or board dependencies.
5. Hand off to prompt, board, or coded-video roles after structure is stable.

## Decision Rules

- If direction is missing, route back to the relevant direction skill.
- Use timing to serve comprehension, not just pacing.
- Keep shot cards concrete enough for prompts but not overloaded with generator syntax.
- If copy placement affects shot design, route through `copy-voice` before final prompt work.

## Guardrails

- Do not invent unapproved story beats, claims, or product behavior.
- Do not write final generator prompts.
- Do not skip continuity anchors or suppression rules.
- Do not execute media tools.

## Handoff

Review gate: `structure_fit`.

Hand off to `video-prompting`, `storyboard-board-architect`, or `hyperframes-producer` with:

- `storyboard_contract`
- `shot_cards`
- `timing`
- `continuity_rules`
- `copy_dependencies`

## QA Checklist

- Beat order supports the objective.
- Each shot has purpose, timing, and continuity notes.
- Copy dependencies are visible.
- Structure can be prompted or produced without reconstructing direction.
- No final execution or prompt generation is included.
