---
name: output-critic-iteration
description: Use this skill to review generated or produced outputs against brief, references, prompts, copy locks, expected observables, and acceptance criteria.
---

# Output Critic Iteration

Use this skill to review produced outputs against the brief, references, prompts, copy locks, expected observables, and acceptance criteria. It decides accept, fix, rerun, loop back, or exclude.

## When To Use

Use this skill when:

- Generated, edited, coded, written, or packaged outputs need quality review.
- The workflow needs a delivery allowlist or rejection list.
- Defects require corrected instructions, rerun guidance, or loopback to an upstream role.

Do not use this skill to approve unchecked, uncertain, or rejected assets for delivery.

## Inputs

Required:

- `brief_contract`: objective, constraints, and acceptance criteria.
- `reference_pack`: authority, continuity anchors, and suppression rules when relevant.
- `produced_outputs`: files, prompts, renders, copy, or artifacts to review.
- `expected_observables`: what must be visible, readable, accurate, or structurally present.

Optional:

- `prompt_pack`: prompts or implementation instructions used to create outputs.
- `asset_manifest`: file list and source traceability.
- `copy_locks`: exact text, VO, captions, labels, or legal wording.

## Outputs

Produce a QA / Iteration Report with:

- accepted assets and delivery allowlist
- excluded assets and rejection reasons
- defects grouped by severity
- corrected instruction packets or rerun guidance
- loopback target when upstream work must change
- residual caveats

## Process

1. Compare outputs against brief, references, copy locks, and expected observables.
2. Separate objective failures from taste preferences.
3. Decide accept, fix, rerun, loop back, or exclude for each asset.
4. Write corrected instructions only for the smallest necessary change.
5. Produce a clear allowlist for `delivery-documentation`.

## Decision Rules

- Reject assets with incorrect required text, broken continuity, missing subject, hidden defects, or untraceable source.
- Use loopback when the prompt, brief, reference pack, or direction was the real failure point.
- Accept with caveat only when the caveat is visible and safe for the user.
- Do not request reruns without explaining what must change.

## Guardrails

- Do not approve assets that were not inspected.
- Do not hide defects to preserve momentum.
- Do not deliver rejected or uncertain assets.
- Do not run external tools, upload, or publish files.
- Do not change approved copy or source facts during QA.

## Handoff

Review gate: `post_execution_fit`.

Hand off to `delivery-documentation` with:

- `accepted_assets`
- `excluded_assets`
- `QA status`
- `caveats`
- `allowlist`

Loop back to the responsible upstream role when defects require rework.

## QA Checklist

- Each reviewed output has a status.
- Rejections include concrete reasons.
- Acceptance criteria were applied consistently.
- Corrected instructions target the real failure.
- Delivery allowlist contains only accepted assets.
