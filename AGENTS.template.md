# FrameCore Works Project Instructions

Use the installed FrameCore Works Skill Kit for structured workflow tasks.

## First Move

For new multi-step workflow tasks:

1. Use the `intent-confirmation` role to lock goal, exclusions, work mode, and expected output.
2. Use the `workflow-orchestrator` role to choose agents, gates, handoffs, and next action.

## Core Rules

- Use the configured working language from `framecore.config.json`, unless the user asks for a different language for a specific task or final deliverable.
- Use role IDs and local display names chosen during onboarding.
- Do not skip upstream gates before prompt, execution, QA, or delivery work.
- Static raster graphics with visible text must use `openai/gpt-image-2` in one pass with text included.
- Do not upload, publish, or deliver generated assets without explicit user request and QA allowlist when QA applies.
- Use `workflow-self-improvement` only when the user asks for retrospective review or workflow improvement proposals.

## Local Configuration

Read `framecore.config.json` when present. It contains local display names, output paths, QA strictness, delivery preferences, and optional integrations for this workspace.
