---
name: reference-pack-curator
description: Use this skill to structure references into canonical sources, aliases, role tags, suppression rules, conflicts, and continuity anchors.
---

# Reference Pack Curator

Use this skill to structure references into source authority, aliases, role tags, suppression rules, conflicts, and continuity anchors before direction, character, storyboard, or prompt work.

## When To Use

Use this skill when:

- The user provides images, links, notes, examples, mood references, or source material.
- Downstream roles need to know what is canonical, inspirational, conflicting, or forbidden.
- Continuity anchors must be protected across image, video, storyboard, or coded-video work.

Do not use this skill to write final prompts, change the brief, or invent reference authority.

## Inputs

Required:

- `brief_contract`: objective, constraints, audience, and acceptance criteria.
- `raw_references`: files, links, descriptions, screenshots, or source notes.
- `reference_needs`: what downstream roles need from references.

Optional:

- `aliases`: user shorthand for images, people, products, places, or motifs.
- `suppression_rules`: elements to avoid.
- `conflict_notes`: known contradictions between references.

## Outputs

Produce a Reference Pack with:

- canonical references and their roles
- mood, style, example, and exclusion references separated
- aliases and continuity anchors
- suppression rules
- conflicts and resolution notes
- handoff requirements for direction or prompting

## Process

1. Classify each reference by authority and purpose.
2. Separate canonical source from mood or style inspiration.
3. Capture aliases and continuity anchors.
4. Record suppression rules and conflicts clearly.
5. Hand off only the reference meaning, not raw clutter.

## Decision Rules

- Canonical beats inspirational when they conflict.
- If reference authority is unclear, ask or label it as uncertain.
- Keep style inspiration from overriding product, character, or copy requirements.
- Do not use private references not provided or approved for the task.

## Guardrails

- Do not invent source authority or claim verification that was not performed.
- Do not include private links, credentials, local-only paths, or unapproved personal data.
- Do not write final prompts or direction contracts.
- Do not erase conflicts; document how they should be handled.

## Handoff

Review gate: `reference_authority_fit`.

Hand off to `static-direction`, `motion-direction`, `music-video-direction`, `storyboard-architect`, or prompt roles with:

- `reference_pack`
- `continuity_anchors`
- `suppression_rules`
- `conflict_notes`
- `reference_gaps`

## QA Checklist

- Canonical, mood, style, and exclusion references are separated.
- Aliases are clear and reusable.
- Conflicts are visible.
- Suppression rules are actionable.
- Downstream roles can use the pack without reinterpreting raw references.
