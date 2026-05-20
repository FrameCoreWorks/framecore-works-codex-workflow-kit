---
name: delivery-documentation
description: Use this skill to package final files, QA status, source lists, usage notes, caveats, excluded files, and delivery manifests.
---

# Delivery Documentation

Use this skill to package final notes, QA status, source lists, accepted files, excluded files, caveats, and usage guidance after the workflow has produced reviewable outputs.

## When To Use

Use this skill when:

- Assets, prompts, documents, or workflow artifacts are ready to summarize for the user.
- A final Delivery Manifest is needed after QA.
- The user explicitly asks for upload, publishing, packaging, or delivery instructions.

Do not use this skill to approve unreviewed outputs or perform delivery without a current explicit user request.

## Inputs

Required:

- `accepted_assets`: files or artifacts approved by QA or explicitly accepted by the user.
- `qa_status`: pass, conditional pass, rejected, or not applicable with reason.
- `source_list`: important inputs, references, prompts, manifests, or generated outputs.

Optional:

- `excluded_assets`: rejected, duplicate, temporary, or non-deliverable files.
- `usage_notes`: licensing, editability, caveats, or platform notes.
- `delivery_target`: only when the current user message requests a specific delivery action.

## Outputs

Produce a Delivery Manifest with:

- final file list and QA status
- source and traceability summary
- excluded files with reasons
- usage notes and caveats
- delivery action taken or explicit statement that delivery was not requested
- concise user-facing summary polished with `humanizer` when useful

## Process

1. Confirm QA status before describing anything as final.
2. Match accepted assets against the asset manifest when available.
3. Separate local completion from upload, publishing, or external delivery.
4. Include caveats and unresolved risks plainly.
5. Keep the final summary short enough for the user to act on.

## Decision Rules

- If generated assets exist and QA is missing, route to `qa-iteration` first.
- If the user did not explicitly ask for upload or publishing in the current message, keep artifacts local.
- If delivery target is ambiguous, ask one concise clarification before sending files externally.
- Use `humanizer` for tone polish, not for changing facts.

## Guardrails

- Do not upload, publish, email, or share files without explicit current instruction.
- Do not include secrets, private links, hidden metadata, caches, or rejected assets.
- Do not claim QA passed unless it did.
- Do not hide caveats or excluded files.

## Handoff

Review gate: `delivery_fit`.

Receive from `qa-iteration` with:

- `accepted_assets`
- `excluded_assets`
- `QA status`
- `caveats`

Return to the user with final delivery notes or a local-path summary.

## QA Checklist

- Accepted and excluded files are separated.
- QA status is visible.
- Delivery action matches an explicit current request.
- Usage notes are factual and concise.
- Final wording is clear without changing approved facts.
