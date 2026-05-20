---
name: brief-architect
description: Use this skill to convert messy notes, user requests, source material, and scattered constraints into a structured Brief Contract for the FrameCore Works workflow.
---

# Brief Architect

Use this skill to convert scattered intent into a Brief Contract that downstream roles can trust. It turns ambiguous requests into objective, audience, deliverables, constraints, exclusions, unknowns, and acceptance criteria.

## When To Use

Use this skill when:

- The user request is messy, partial, broad, or mixed with source material.
- A creative, campaign, prompt, storyboard, coded-video, or delivery workflow needs a stable brief before specialist work starts.
- The next role needs clear constraints, assumptions, success criteria, or exclusions.

Do not use this skill to create strategy, references, final copy, prompts, QA reports, or delivery manifests.

## Inputs

Required:

- `raw_context`: the user's request, notes, source material, or pasted constraints.
- `expected_output`: the artifact or decision the user expects next.
- `excluded_scope`: anything the user explicitly does not want.

Optional:

- `audience`: buyer, viewer, internal reviewer, client, or platform context.
- `brand_or_subject_notes`: approved terminology, product facts, tone, or visual constraints.
- `deadline_or_format`: size, duration, channel, file type, or delivery condition.

## Outputs

Produce a Brief Contract with:

- objective and desired outcome
- audience and use context
- deliverables and formats
- constraints, exclusions, and non-goals
- known facts, assumptions, and unknowns
- acceptance criteria for the next gate

## Process

1. Separate facts from assumptions and user preferences.
2. Collapse duplicate or conflicting asks into one clear objective.
3. Identify missing inputs that would change the target or deliverable.
4. Preserve user wording for locked names, claims, or required copy.
5. Produce a compact contract that a downstream role can use without rereading the whole conversation.

## Decision Rules

- If the missing information is minor, proceed with a labeled assumption.
- If the missing information changes audience, deliverable, budget, legal claims, or delivery location, ask one concise question.
- Keep creative ideas out unless the user explicitly asked for ideation at the brief stage.
- Do not turn an unresolved conflict into a hidden assumption.

## Guardrails

- Do not invent product claims, testimonials, metrics, brand facts, or source authority.
- Do not include private data, secrets, local-only paths, or customer-specific examples from outside the request.
- Do not skip directly to prompt generation or execution.
- Do not overwrite upstream intent-confirmation decisions.

## Handoff

Review gate: `brief_completeness`.

Hand off to `reference-curator` or `workflow-orchestrator` with:

- `brief_contract`
- `reference_needs`
- `constraints`
- `unknowns`
- `acceptance_criteria`

## QA Checklist

- The objective is singular and testable.
- Deliverables and exclusions are explicit.
- Assumptions are labeled.
- Unknowns are separated from blockers.
- Acceptance criteria can be checked by a later role.
- No strategy, final prompt, generated output, or delivery action is included.
