---
name: cinematography
description: Use this skill for provider-neutral shot language, lens choices, camera movement, lighting, blocking, color, texture, and cinematic direction.
---

# Cinematography

Use this skill to translate direction into shot language, lighting, blocking, camera behavior, and visual texture for image, video, storyboard, or coded-video workflows.

## When To Use

Use this skill when:

- A visual or motion workflow needs concrete shot language rather than generic style.
- Storyboards, video prompts, image prompts, or HyperFrames scenes need camera and lighting guidance.
- The brief calls for cinematic consistency across multiple assets or scenes.

Do not use this skill to replace creative direction, write final prompts, or execute production tools.

## Inputs

Required:

- `brief_contract`: goal, audience, and format.
- `direction_contract`: visual or motion thesis and constraints.
- `reference_pack`: source authority, style cues, and suppression rules when available.

Optional:

- `storyboard_contract`: beats, shot cards, timing, or continuity.
- `copy_or_text_locks`: visible copy, supers, captions, or VO constraints.
- `platform_constraints`: aspect ratio, duration, or channel behavior.

## Outputs

Produce Cinematography Notes with:

- shot size, camera placement, and lens feel
- movement, blocking, and timing notes
- lighting, color, texture, and depth cues
- continuity constraints across shots
- handoff notes for prompt, storyboard, or coded-video roles

## Process

1. Start from objective and viewer attention, not from decorative style.
2. Assign camera behavior to each required beat or asset type.
3. Tie lighting and texture to mood, product readability, or narrative clarity.
4. Keep shot language concise enough to survive prompt handoff.
5. Flag any shot choice that conflicts with format, safety, or copy readability.

## Decision Rules

- Use specific visual terms only when they serve the brief.
- Prefer readable product or subject framing over dramatic but unclear shots.
- Keep motion instructions feasible for the target medium.
- If visual references conflict with the brief, preserve the brief and note the conflict.

## Guardrails

- Do not claim camera hardware, lens metadata, or production facts that are not provided.
- Do not create final generation prompts or run tools.
- Do not bury text readability constraints under cinematic language.
- Do not invent private references or brand rules.

## Handoff

Review gate: `direction_fit` for campaign direction and `structure_fit` when applied to storyboard structure.

Hand off with:

- `cinematography_notes`
- `shot_language`
- `lighting_and_texture`
- `continuity_rules`
- `prompt_constraints`

## QA Checklist

- Shot choices serve objective, audience, and format.
- Camera, lighting, and blocking are concrete.
- Text, product, or subject readability is protected.
- Continuity notes are usable by the next role.
- No final prompt or execution step is included.
