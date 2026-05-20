---
name: hyperframes-workflow
description: Use this skill for HyperFrames coded-video workflow planning, HTML-to-video structure, scene timing, composition requirements, render QA, and delivery manifest requirements.
---

# HyperFrames Workflow

Use this when the output is a coded video composition or HTML-to-video production.

## When To Use

Use this skill when:

- The requested output is a coded video composition, HTML-to-video sequence, animated title system, captioned scene, or render-ready motion layout.
- A workflow needs scene structure, timing, visual hierarchy, asset needs, and render QA before implementation.
- HyperFrames is the coded-video path, not a paid media-provider integration.

Do not use this skill for static raster generation, final delivery packaging, or tool execution without explicit instruction.

## Inputs

Required:

- `brief_contract`: objective, audience, format, and constraints.
- `storyboard_contract`: scenes, beats, timing, or required structure.
- `copy_locks`: exact captions, overlays, titles, labels, or VO text.

Optional:

- `asset_manifest`: source files, approved assets, and exclusions.
- `gsap_motion_notes`: timeline, easing, and transition behavior.
- `delivery_requirements`: output duration, resolution, file type, or manifest needs.

## Outputs

Produce a HyperFrames Workflow Brief with:

- scene list and timing
- composition size and visual hierarchy
- text and caption timing
- asset needs and source notes
- motion or transition requirements
- render QA checklist
- delivery manifest requirements

## Process

1. Confirm the output is coded video and not a raster graphic replacement.
2. Map scenes, timing, and copy locks before describing animation.
3. Identify required assets and missing inputs.
4. Add render QA checks for blank frames, overlap, readability, clipping, and duration drift.
5. Hand off to prompting or production only after the structure is complete.

## Decision Rules

- If scene structure is missing, route to `storyboard-architect`.
- If motion details are needed, use `hyperframes-gsap-guidance`.
- If implementation prompt detail is needed, use `hyperframes-prompting`.
- Keep coded-video planning provider-neutral and tool-agnostic until the user chooses a runtime.

## Guardrails

- Do not treat HyperFrames as a paid external media-provider path.
- Do not run rendering, install tools, or publish files unless explicitly requested.
- Do not use coded overlays to bypass the one-pass policy for raster graphics with visible text.
- Do not include private paths, unapproved assets, or hidden metadata.

## Handoff

Review gate: `structure_fit`.

Hand off to `hyperframes-prompting` or `hyperframes-producer` with:

- `scene_list`
- `timing`
- `copy_locks`
- `asset_needs`
- `render_constraints`
- `render_qa_checklist`

## QA Checklist

- The plan is clearly coded-video, not static raster generation.
- Every scene has timing and hierarchy.
- Text and captions are readable and timed.
- Asset needs and exclusions are explicit.
- Render QA covers technical and visual failure modes.
