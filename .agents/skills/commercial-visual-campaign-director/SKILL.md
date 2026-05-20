---
name: commercial-visual-campaign-director
description: Use this skill to create provider-neutral visual direction for static commercial campaigns, product visuals, launch assets, social variants, and asset systems.
---

# Commercial Visual Campaign Director

Use this skill to create static campaign direction for ecommerce, launch, social, product, and promotional visuals before final image prompts or production boards are written.

## When To Use

Use this skill when:

- The user needs a visual campaign system rather than a single prompt.
- Product, offer, subject, or brand readability must be controlled across variants.
- Direction is needed for social graphics, ecommerce images, launch kits, or static boards.

Do not use this skill to write final generator-ready prompts, execute tools, or approve delivery.

## Inputs

Required:

- `brief_contract`: goal, audience, deliverables, and constraints.
- `reference_pack`: canonical sources, visual references, suppression rules, and continuity anchors.
- `offer_or_subject`: what must be clear in the final visuals.

Optional:

- `copy_pack`: headlines, CTA, legal copy, or text hierarchy.
- `asset_inventory`: existing product images, brand assets, or source files.
- `rollout_needs`: formats, placements, aspect ratios, or variant count.

## Outputs

Produce a Static Direction Contract with:

- visual thesis and audience fit
- product or subject governance
- composition system and hierarchy rules
- asset matrix and rollout variants
- text-bearing graphic requirements when relevant
- prompt handoff constraints for `image-prompting`

## Process

1. Define what the viewer must understand first.
2. Convert references into rules for composition, lighting, subject treatment, and variation.
3. Separate locked visual requirements from optional style cues.
4. Map the required asset variants and their differences.
5. Hand off only after direction can be evaluated against the brief.

## Decision Rules

- Optimize for clarity of product, offer, or subject before decorative style.
- Use variants to serve placement differences, not to explore unrelated directions.
- If visible text is required, preserve exact copy and hierarchy for downstream prompt work.
- If references conflict, keep canonical sources and document the suppressed cue.

## Guardrails

- Do not invent product facts, claims, logos, or private brand rules.
- Do not execute generation or choose external providers.
- Do not produce final prompts when `image-prompting` owns that output.
- Do not weaken text readability requirements for raster graphics.

## Handoff

Review gate: `direction_fit`.

Hand off to `image-prompting` or `copy-voice` with:

- `direction_contract`
- `prompt_constraints`
- `copy_requirements`
- `asset_matrix`
- `suppression_rules`

## QA Checklist

- Visual thesis fits objective, audience, and offer.
- Asset matrix matches requested formats.
- Product or subject governance is concrete.
- Text-bearing requirements are explicit when needed.
- The handoff does not contain final prompt execution steps.
