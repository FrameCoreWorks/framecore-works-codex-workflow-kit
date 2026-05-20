---
name: character-design
description: Use this skill for provider-neutral character design systems, identity anchors, expression sheets, outfit variants, consistency rules, and prompt handoffs.
---

# Character Design

Use this skill to define repeatable character identity systems for static, motion, storyboard, or prompt workflows. It protects continuity before prompts or boards are produced.

## When To Use

Use this skill when:

- A person, mascot, avatar, creature, or recurring subject must stay consistent across assets.
- Prompting or storyboard roles need identity anchors, pose range, wardrobe, expression limits, or variation rules.
- References contain conflicting character cues that need authority and suppression rules.

Do not use this skill for one-off styling when continuity does not matter.

## Inputs

Required:

- `brief_contract`: objective, audience, and deliverable context.
- `reference_pack`: approved identity references or written character source.
- `continuity_needs`: which features must persist across outputs.

Optional:

- `variant_requirements`: outfit, age, mood, scene, or pose variants.
- `suppression_rules`: features that must not appear.
- `prompt_constraints`: generator-facing limitations or exact wording needs.

## Outputs

Produce a Character System with:

- identity anchors and immutable traits
- proportions, face, hair, wardrobe, expression, and pose rules
- allowed variation ranges
- suppression rules and conflict notes
- prompt handoff notes for `image-prompting`, `video-prompting`, or `storyboard-architect`

## Process

1. Identify canonical character facts and separate them from style inspiration.
2. Define immutable traits before variant traits.
3. Turn visual references into concise continuity language.
4. State what can change by shot, scene, format, or platform.
5. Prepare handoff notes that are concrete enough for prompt authors.

## Decision Rules

- Prefer a few strong identity anchors over a long descriptive inventory.
- If references conflict, prioritize canonical source material and document the conflict.
- Treat wardrobe, props, and expressions as controlled variants unless the brief locks them.
- Keep character design separate from final prompt wording.

## Guardrails

- Do not invent likeness rights, endorsements, biographies, or private identity details.
- Do not execute image or video generation.
- Do not use private reference material unless the user provided it for this task.
- Do not override reference-curator authority.

## Handoff

Review gate: `reference_authority_fit` when resolving identity sources, then `direction_fit` when handed into direction work.

Hand off with:

- `character_system`
- `continuity_anchors`
- `allowed_variants`
- `suppression_rules`
- `prompt_handoff_notes`

## QA Checklist

- Immutable and variable traits are separated.
- Canonical references are named or summarized.
- Suppression rules are actionable.
- Prompt handoff notes avoid vague adjectives.
- The system supports the requested formats without executing generation.
