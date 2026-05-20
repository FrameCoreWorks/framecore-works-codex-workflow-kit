---
name: humanizer
description: Use this skill for natural-sounding writing, rewriting, copy polish, VO and dialogue cleanup, tone adaptation, final summary polish, and reducing generic AI phrasing while preserving facts and approved wording.
---

# Humanizer

Use this skill to make approved text sound natural, specific, and useful while preserving facts, required wording, and workflow locks.

## When To Use

Use this skill when:

- Draft copy, VO, dialogue, captions, summaries, or delivery notes feel generic, stiff, repetitive, or too AI-like.
- Approved facts must stay intact while rhythm, clarity, and audience fit improve.
- A final user-facing response needs polish without changing the substance.

Do not use this skill to invent claims, rewrite legal text beyond allowed style polish, or bypass copy approval.

## Inputs

Required:

- `source_text`: the draft to polish.
- `locked_facts`: claims, names, numbers, product details, or compliance wording that must remain unchanged.
- `tone_target`: the desired voice, audience, and level of formality.

Optional:

- `exact_copy_locks`: phrases that must remain verbatim.
- `channel_context`: social post, VO, email, delivery summary, landing section, or script.
- `avoid_list`: banned words, cliches, claims, or style habits.

## Outputs

Produce polished text with:

- clearer rhythm and sentence variety
- concrete language and smoother transitions
- audience-fit tone
- unchanged locked facts and exact required copy
- short change notes when useful

## Process

1. Identify facts, claims, and wording that must not move.
2. Remove generic phrasing before adding style.
3. Improve rhythm through sentence structure, not unsupported detail.
4. Preserve required terminology and approved tone.
5. Return the full revised text when the user needs a usable artifact.

## Decision Rules

- If copy is legally or brand locked, only improve surrounding wording.
- If a claim feels weak but unsupported, flag it instead of strengthening it.
- If the text is for a prompt, keep operational precision above literary polish.
- If the user asks for alternatives, keep each variant meaningfully distinct.

## Guardrails

- Do not add unsupported claims, fake testimonials, invented metrics, or new product promises.
- Do not remove compliance wording or exact copy locks.
- Do not change names, numbers, dates, or required terminology without explicit permission.
- Do not make the text sound casual when the user requested restraint.

## Handoff

Review gate: `copy_fit`.

Hand off to `copy-voice`, `image-prompting`, `video-prompting`, or `delivery-documentation` with:

- `polished_text`
- `locked_facts_preserved`
- `tone_notes`
- `copy_locks`
- `open_questions`

## QA Checklist

- Meaning is unchanged unless a change is explicitly requested.
- Required copy and legal wording are preserved.
- Unsupported claims were not added.
- Tone matches the requested audience and channel.
- The revised text is complete, not a patch fragment, when used as final output.
