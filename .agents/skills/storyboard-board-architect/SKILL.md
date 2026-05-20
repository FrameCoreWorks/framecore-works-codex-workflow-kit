---
name: storyboard-board-architect
description: Use this skill to specify storyboard board, production board, or shot board graphics with panel structure, board copy, labels, and layout constraints.
---

# Storyboard Board Architect

Use this skill to specify storyboard board, production board, or shot board graphics. It defines panel structure, board copy, labels, layout constraints, and acceptance criteria before a raster board or coded/vector artifact is created.

## When To Use

Use this skill when:

- The user needs a storyboard board, production board, shot board, or multi-panel planning graphic.
- Board text, shot labels, panel order, and layout must be precise.
- A raster board will include visible text and needs the one-pass text policy.

Do not use this skill to create the final board image, write the whole storyboard, or bypass copy locks.

## Inputs

Required:

- `storyboard_contract`: beats, scenes, shot cards, and timing.
- `board_goal`: what the board must communicate.
- `copy_locks`: exact labels, captions, shot names, or notes that must appear.

Optional:

- `visual_style`: layout, board density, reference style, or production look.
- `format_constraints`: aspect ratio, panel count, safe margins, and delivery size.
- `qa_requirements`: readability, panel order, and acceptance criteria.

## Outputs

Produce a Board Artifact Prompt with:

- panel count and hierarchy
- shot labels and exact board text
- safe margins and layout constraints
- visual style and density guidance
- negative constraints
- board acceptance criteria

## Process

1. Confirm the storyboard structure before board layout.
2. Lock panel count and panel order.
3. Write exact board copy and labels.
4. Specify hierarchy, safe margins, and readability constraints.
5. State generation or production requirements according to the requested artifact type.

## Decision Rules

- For raster boards with visible text, enforce the native Codex/ChatGPT GPT Image 2 one-pass policy.
- If the user explicitly requests coded or vector artwork, keep text placement in the coded/vector artifact and do not present it as raster generation.
- If copy is too long for readable generated text, reduce it before generation.
- If storyboard structure is missing, route back to `storyboard-director`.

## Guardrails

- Do not generate a text-free board background and add labels later for raster graphics.
- Do not invent shots or labels that are not in the storyboard or user request.
- Do not execute generation or publish files unless explicitly requested.
- Do not ignore safe margins or text readability.

## Handoff

Review gate: `storyboard_board_fit`.

Hand off to `image-prompting`, `hyperframes-producer`, or `delivery-documentation` with:

- `board_artifact_prompt`
- `board_copy`
- `panel_structure`
- `text_locks`
- `acceptance_criteria`

## QA Checklist

- Panel order matches the storyboard.
- Exact board text is present and not duplicated.
- Safe margins and hierarchy are specified.
- Raster boards with text follow the one-pass policy.
- Acceptance criteria cover readability and panel accuracy.
