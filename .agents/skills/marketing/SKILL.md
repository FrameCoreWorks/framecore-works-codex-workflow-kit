---
name: marketing
description: Use this skill for provider-neutral campaign planning, offer framing, asset matrices, audience fit, channel adaptation, launch kits, and campaign QA.
---

# Marketing

Use this skill to plan campaign-level positioning, offer framing, audience fit, asset matrices, channel adaptation, launch kits, and campaign QA without locking final creative execution too early.

## When To Use

Use this skill when:

- A request needs campaign logic before visual direction, copy, storyboard, or prompts.
- The user asks for ecommerce, product, launch, social, creator, or promotional workflow planning.
- Offers, audiences, channels, claims, or asset variants need structure.

Do not use this skill to invent evidence, write final copy, produce final prompts, or execute media tools.

## Inputs

Required:

- `brief_contract`: objective, audience, deliverables, constraints, and acceptance criteria.
- `offer_or_subject`: product, service, idea, event, or asset focus.
- `channel_context`: ecommerce, social, email, marketplace, video, static campaign, or mixed rollout.

Optional:

- `proof_points`: verified claims, benefits, objections, or differentiators.
- `reference_pack`: positioning, competitor, style, or source references.
- `copy_constraints`: required CTA, legal wording, tone, or banned claims.

## Outputs

Produce a Marketing Plan with:

- audience and offer framing
- campaign thesis and message hierarchy
- asset matrix and channel variants
- CTA system
- proof and claim boundaries
- launch or rollout notes
- QA criteria for downstream creative roles

## Process

1. Clarify what the campaign must make the audience do or understand.
2. Separate verified claims from speculative messaging.
3. Map asset variants to channel jobs.
4. Define CTA and message hierarchy before visual execution.
5. Hand off to direction, copy, or storyboard roles.

## Decision Rules

- Keep claims evidence-backed or label them as assumptions.
- Prefer channel-specific variants over generic reuse.
- If audience or offer is unclear, route back to `brief-architect`.
- If proof is missing, avoid strong performance or outcome claims.

## Guardrails

- Do not fabricate testimonials, metrics, guarantees, certifications, or reviews.
- Do not execute media generation or choose external providers.
- Do not turn marketing strategy into final prompt language.
- Do not use private customer examples unless supplied for the task.

## Handoff

Review gate: `direction_fit` when passed into creative direction.

Hand off to `static-direction`, `motion-direction`, `copy-voice`, or `storyboard-architect` with:

- `campaign_thesis`
- `audience_offer_fit`
- `asset_matrix`
- `message_hierarchy`
- `claim_boundaries`

## QA Checklist

- Audience, offer, and channel are aligned.
- Claims are supported or labeled.
- Asset matrix matches the requested rollout.
- CTA system is clear.
- Downstream roles receive constraints, not vague inspiration.
