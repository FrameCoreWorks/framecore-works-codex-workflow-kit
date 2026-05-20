---
name: ugc
description: Use this skill for provider-neutral UGC-style creator ads, talking-head scripts, social proof concepts, direct-response hooks, and creator-read copy.
---

# UGC

Use this skill to plan UGC-style creator ads, talking-head scripts, social proof concepts, direct-response hooks, objection handling, and creator-read copy while keeping claims honest and provider-neutral.

## When To Use

Use this skill when:

- The user asks for creator-style ads, social proof, talking-head scripts, hooks, or short-form direct response.
- A product, offer, or ecommerce workflow needs human-feeling script structure.
- Claims, proof, objection handling, and CTA need to be kept within evidence boundaries.

Do not use this skill to fake testimonials, identities, personal experience, or results.

## Inputs

Required:

- `brief_contract`: objective, audience, deliverable, and constraints.
- `offer_or_product_facts`: verified features, benefits, proof points, and limits.
- `platform_context`: channel, duration, format, and creator style.

Optional:

- `voice_notes`: desired creator tone or brand voice.
- `objections`: known hesitations or buying barriers.
- `copy_locks`: required CTA, legal copy, or banned phrasing.

## Outputs

Produce a UGC Script Pack with:

- hook options
- creator angle and setup
- proof point framing
- objection handling
- CTA variants
- platform fit notes
- claim boundaries

## Process

1. Identify the audience problem and credible angle.
2. Build hooks that do not rely on fake experience.
3. Use only verified proof points or clearly labeled assumptions.
4. Keep script variants distinct by angle, not just wording.
5. Route final polish through `humanizer` when the script should sound more natural.

## Decision Rules

- If proof is missing, write softer framing instead of inventing authority.
- Use first-person only when the user authorizes that voice and facts support it.
- Keep short-form scripts tight and concrete.
- If visual production is needed, hand off to direction or storyboard roles.

## Guardrails

- Do not fabricate testimonials, reviews, identities, outcomes, or before-after claims.
- Do not create deceptive social proof.
- Do not execute video generation or choose external providers.
- Do not change legal copy or required disclaimers.

## Handoff

Review gate: `copy_fit`.

Hand off to `copy-voice`, `motion-direction`, `storyboard-architect`, or `video-prompting` with:

- `ugc_script_pack`
- `claim_boundaries`
- `creator_angle`
- `copy_locks`
- `platform_notes`

## QA Checklist

- Claims are supported or softened.
- Hooks are distinct and plausible.
- CTA matches the brief.
- No fake testimonial or identity is implied.
- Script can be read naturally by a creator.
