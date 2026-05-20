---
name: hyperframes-prompting
description: Use this skill to create precise production prompts and implementation briefs for HyperFrames-coded video scenes, transitions, captions, overlays, and motion systems.
---

# HyperFrames Prompting

Use this skill to write precise production prompts and implementation briefs for HyperFrames-coded video scenes, transitions, captions, overlays, and motion systems.

## When To Use

Use this skill when:

- A storyboard or coded-video plan must become an implementation-ready HyperFrames brief.
- Scenes require exact timing, layout, text timing, motion intent, and render checks.
- A producer needs clear instructions without reinterpreting the creative direction.

Do not use this skill to skip storyboard, copy locks, or render QA.

## Inputs

Required:

- `storyboard_contract`: scenes, beats, timing, and continuity.
- `copy_locks`: captions, supers, labels, or VO text that must remain exact.
- `render_constraints`: composition size, duration, format, and delivery needs.

Optional:

- `asset_manifest`: approved files and source notes.
- `gsap_motion_notes`: timeline and animation guidance.
- `visual_direction`: style, hierarchy, and suppression rules.

## Outputs

Produce a HyperFrames Production Prompt with:

- composition size and scene timings
- asset placement and visual hierarchy
- exact text timing
- motion intent and transition behavior
- implementation constraints
- render QA checks

## Process

1. Start from approved storyboard and copy locks.
2. Convert each scene into implementation instructions with timing and layout.
3. Add motion notes only where they serve the beat.
4. Include render checks directly in the brief.
5. Keep the prompt executable by a coded-video producer without extra interpretation.

## Decision Rules

- If storyboard timing is missing, return to `storyboard-architect`.
- If copy is not locked, mark text-dependent implementation as provisional.
- Keep layout instructions stable across scenes unless a transition requires change.
- Use coded-video language, not generic image or video generation phrasing.

## Guardrails

- Do not invent missing storyboard beats.
- Do not add later text overlays to raster graphics as a workaround.
- Do not execute rendering or publish outputs.
- Do not include private files, local-only paths, or unapproved assets.

## Handoff

Review gate: `promptability_fit`.

Hand off to `hyperframes-producer` with:

- `hyperframes_prompt`
- `scene_timing`
- `copy_locks`
- `asset_requirements`
- `render_qa_checks`

## QA Checklist

- Every scene has timing and purpose.
- Copy locks are exact and placed intentionally.
- Asset placement is concrete.
- Motion and transition behavior are feasible.
- Render checks are included before delivery.
