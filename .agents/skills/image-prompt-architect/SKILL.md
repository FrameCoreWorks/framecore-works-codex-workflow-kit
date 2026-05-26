---
name: image-prompt-architect
description: Use this skill to create final provider-neutral image prompt packs from approved brief, references, direction, and copy.
---

# Image Prompt Architect

Use this skill to create final provider-neutral image prompt packs from approved brief, references, direction, and copy. It prepares prompts for review or user-selected execution, but it does not execute generation.

## When To Use

Use this skill when:

- Direction, references, and copy are ready to become generator-ready image instructions.
- A static campaign, ecommerce visual, product image, storyboard board, poster, banner, or social graphic needs a prompt pack.
- Visible text must be included in a raster graphic with exact copy and layout constraints.

Do not use this skill to invent missing strategy, approve outputs, or run generation.

## Inputs

Required:

- `brief_contract`: objective, audience, deliverables, and constraints.
- `reference_pack`: source authority, continuity anchors, and suppression rules.
- `direction_contract`: visual thesis, composition, subject governance, and variant needs.

Optional:

- `copy_pack`: exact copy, hierarchy, CTA, labels, or legal text.
- `asset_manifest`: approved source files or excluded assets.
- `qa_requirements`: expected observables and acceptance criteria.

## Outputs

Produce an Image Prompt Pack with:

- final prompt or variant prompts
- visual constraints and composition notes
- exact copy and text layout requirements when text appears
- negative constraints and suppression rules
- expected observables
- QA checks and loopback guidance

## Process

1. Confirm brief, references, and direction are approved enough to prompt.
2. Preserve exact copy and hierarchy when visible text is required.
3. Convert direction into concrete subject, composition, lighting, style, and constraint language.
4. Include expected observables that QA can check.
5. Keep execution separate from prompt authoring.

## Decision Rules

- If direction is missing, route to `static-direction`.
- If copy is required but not locked, route to `copy-voice` or label the prompt as provisional.
- For generated static raster graphics, require the native Codex/ChatGPT GPT Image 2 path by default when available.
- For raster graphics with visible text, require the native Codex/ChatGPT GPT Image 2 path in one pass when available.
- If copy is too long for clean generated text, recommend shortening before generation rather than later overlays.

## Guardrails

- Do not execute generation, choose paid external tools, or publish outputs.
- Do not substitute Python-generated artwork, SVG, HTML/canvas, Sharp/composited PNG, or coded artwork unless the user explicitly asked for coded or vector artwork.
- Do not add text later with overlays for static raster graphics unless the user explicitly asked for coded or vector artwork.
- Do not invent claims, logos, product facts, or private references.
- Do not remove suppression rules from the reference pack.

## Handoff

Review gate: `promptability_fit`.

Hand off to `tool-routing-cost` or `qa-iteration` with:

- `prompt_pack`
- `asset_requirements`
- `copy_locks`
- `expected_observables`
- `acceptance_criteria`

## QA Checklist

- Prompt follows approved brief, references, and direction.
- Exact text is included when required.
- Negative constraints are concrete.
- Expected observables are testable.
- Execution remains separate from prompt authoring.
