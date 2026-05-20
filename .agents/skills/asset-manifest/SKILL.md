---
name: asset-manifest
description: Use this skill to organize workflow assets, file lists, versions, source traceability, exclusions, and reproducibility notes.
---

# Asset Manifest

Use this skill to make produced files auditable before QA or delivery. It records what exists, where it came from, what should be excluded, and what the next role can trust.

## When To Use

Use this skill when:

- Produced files, drafts, prompts, exports, or source materials need a traceable file list.
- QA needs a clear allowlist, exclusion list, version note, or source summary.
- Delivery would be risky without knowing which files are final, rejected, duplicated, or temporary.

Do not use this skill to review creative quality, rewrite assets, upload files, or decide final acceptance.

## Inputs

Required:

- `file_list`: files or folders to inventory.
- `source_notes`: origin of important files, including user-provided inputs, generated outputs, or edited derivatives.
- `acceptance_criteria`: what makes an asset eligible for QA or delivery.

Optional:

- `version_notes`: naming, revision, or export notes.
- `checksums`: use when reproducibility or audit strength matters.
- `exclusions`: files that must never be delivered or packaged.

## Outputs

Produce an Asset Manifest with:

- managed file list, version labels, and source traceability
- excluded files with reasons
- missing or ambiguous files
- checksum or reproducibility notes when useful
- handoff notes for `qa-iteration` or `delivery-documentation`

## Process

1. Inspect the requested files and classify them as source, working, final candidate, rejected, cache, or metadata.
2. Record only reviewable assets and explicit exclusions.
3. Preserve relative paths when possible so the manifest remains portable.
4. Flag missing source context, uncertain versions, or files that need human confirmation.
5. Hand off only files that can be explained and traced.

## Decision Rules

- Prefer a smaller reviewed allowlist over a broad folder dump.
- Treat generated outputs as final candidates only after they pass the requested QA gate.
- Include checksums when files will be transferred, archived, or compared across machines.
- Keep manifest language factual; do not add creative approval language.

## Guardrails

- Do not include secrets, credentials, private cloud links, local-only sensitive paths, or user-private notes.
- Do not include metadata sidecars, caches, logs, backups, temporary files, or hidden operating-system files as workflow assets.
- Do not upload, publish, compress, or delete files.
- Do not approve assets for delivery without `qa-iteration` when generated assets exist.

## Handoff

Review gate: `asset_manifest_fit`.

Hand off to `qa-iteration` with:

- `file_list`
- `source_traceability`
- `excluded_files`
- `acceptance_criteria`
- `open_questions`

Hand off to `delivery-documentation` only after QA identifies accepted assets.

## QA Checklist

- Every included file has a role and source note.
- Final candidates are separated from working files and exclusions.
- Exclusions explain why the file is not deliverable.
- Paths are portable and public-safe.
- The manifest does not contain hidden metadata, caches, secrets, or private links.
- Open questions are explicit instead of hidden in prose.
