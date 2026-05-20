---
name: hyperframes-gsap-guidance
description: Use this skill for GSAP animation planning inside HyperFrames workflows, including timelines, easing, stagger, transitions, captions, overlays, and motion QA notes.
---

# HyperFrames GSAP Guidance

Use this skill to plan GSAP animation behavior inside HyperFrames-coded video workflows. It keeps timelines purposeful, inspectable, and render-safe.

## When To Use

Use this skill when:

- A HyperFrames scene needs timeline, easing, stagger, transition, caption, overlay, or exit behavior.
- Motion must be tied to beats, text timing, product reveals, or scene hierarchy.
- Render QA needs concrete animation checks.

Do not use this skill to replace the broader HyperFrames workflow or write final delivery documentation.

## Inputs

Required:

- `scene_structure`: scenes, beats, durations, and composition size.
- `motion_intent`: what each animation should clarify or emphasize.
- `text_or_overlay_timing`: captions, labels, supers, or visible text behavior.

Optional:

- `asset_list`: images, clips, components, or coded elements.
- `transition_rules`: scene-to-scene behavior.
- `render_constraints`: frame rate, duration, viewport, or browser limits.

## Outputs

Produce GSAP Motion Notes with:

- timeline structure and sequence
- easing, duration, delay, stagger, and exit behavior
- text, caption, and overlay timing
- transition notes
- render QA checks

## Process

1. Map animation beats to the storyboard or scene structure.
2. Define timeline order before choosing easing.
3. Keep text timing readable and aligned with the scene purpose.
4. Specify exits and transitions so elements do not linger accidentally.
5. Add render checks for timing, overlap, clipping, and blank frames.

## Decision Rules

- Prefer simple timelines that can render reliably.
- Use stagger only when it improves readability or attention.
- Keep easing consistent inside a scene unless a contrast is intentional.
- If text overlaps or becomes unreadable, simplify motion before adding effects.

## Guardrails

- Do not add unsupported libraries or paid execution dependencies.
- Do not ignore render QA because the animation looks plausible on paper.
- Do not treat decorative movement as a substitute for storyboard clarity.
- Do not create external delivery actions.

## Handoff

Review gate: `structure_fit` for timing and `execution_manifest_fit` when render steps are later recorded.

Hand off to `hyperframes-producer` with:

- `timeline_notes`
- `easing_and_timing`
- `caption_overlay_rules`
- `transition_behavior`
- `render_qa_checks`

## QA Checklist

- Each motion cue has a narrative or readability purpose.
- Timings add up to the scene duration.
- Text remains readable and does not collide.
- Entry, hold, and exit behavior are specified.
- Render QA checks cover blank frames, clipping, overlap, and timing drift.
