---
name: commercial-video-campaign-director
description: Use this skill to create provider-neutral motion direction for commercial video campaigns, launch videos, product reveals, social clips, and motion asset systems.
---

# Commercial Video Campaign Director

Use this skill to turn a commercial objective into a motion direction system for video campaigns, launch clips, product reveals, social edits, or motion asset families.

## When To Use

Use this skill when:

- A campaign needs motion strategy before storyboard or video prompting.
- The user asks for launch videos, product motion, social clips, short ads, or motion variants.
- Direction must define pacing, attention, placement behavior, and asset needs.

Do not use this skill to write final video prompts, run tools, or package final files.

## Inputs

Required:

- `brief_contract`: objective, audience, offer, deliverables, and constraints.
- `reference_pack`: approved references, continuity anchors, and suppression rules.
- `campaign_goal`: what the motion work must make the viewer notice, understand, or do.

Optional:

- `copy_pack`: VO, supers, CTA, or text locks.
- `channel_requirements`: aspect ratio, duration, placement, or social format.
- `asset_inventory`: product renders, footage, stills, logos, or source graphics.

## Outputs

Produce a Motion Direction Contract with:

- motion thesis and attention architecture
- pacing, rhythm, transitions, and reveal logic
- product or subject placement behavior
- visual system and asset requirements
- storyboard handoff constraints
- QA criteria for motion clarity

## Process

1. Identify the commercial job of the video.
2. Define the viewer attention path from first frame to final action.
3. Set pacing and reveal logic before shot-level structure.
4. Translate references into motion rules, not copied shots.
5. Prepare a clean handoff to `storyboard-architect` or `video-prompting`.

## Decision Rules

- Prefer one clear motion thesis over a list of effects.
- Keep product or offer readability above cinematic complexity.
- Use platform duration and crop constraints to limit scope.
- If copy is not locked, mark text-dependent scenes as provisional.

## Guardrails

- Do not execute external tools or choose paid providers.
- Do not create final generator-ready prompts.
- Do not invent claims, testimonials, or product capabilities.
- Do not ignore reference suppression rules.

## Handoff

Review gate: `direction_fit`.

Hand off to `storyboard-architect` with:

- `motion_direction`
- `timing_constraints`
- `continuity_rules`
- `asset_requirements`
- `copy_dependencies`

## QA Checklist

- Motion thesis supports the brief and audience.
- Attention path is understandable without extra explanation.
- Pacing and duration fit the target format.
- Asset needs and copy dependencies are explicit.
- The handoff is ready for storyboard work, not final execution.
