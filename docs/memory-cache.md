# Memory Cache

## Purpose

Memory Cache is the durable recovery layer for one operational chat or project folder. It stores the minimum state a future Codex session needs to resume work safely after context compaction, a crash, an overnight run, or a handoff to a new thread.

Memory Cache is not a transcript archive, provider log, private data store, or hidden permission layer.

## Folder Layout

Create one `Memory Cache/` folder inside each operational folder:

```text
<operational-folder>/
  Context/
  Memory Cache/
    project-state.md
    recovery-prompt.md
    session-heartbeat.md
    decision-log.md
    change-log.md
    source-map.md
    open-questions.md
    artifacts-index.md
    history/
    handoffs/
    chat-compactions/
```

Use `npm run memory:init -- --target <operational-folder>` to create this layout from the public templates.

## Long Session Recovery Offer

Codex should proactively offer Memory Cache when a task becomes long-running, multi-gate, file-heavy, interrupted, handed off to a new chat, or likely to hit context compaction.

If `Memory Cache/` is missing or stale, Codex should ask before writing anything:

```text
This looks like a long or resumable session. I can initialize Context/ and Memory Cache/ for this workspace so future Codex sessions can resume safely. Should I create and validate those recovery folders now?
```

Only after the user agrees, run:

```bash
npm run memory:init -- --target <operational-folder>
npm run memory:validate -- --target <operational-folder>
```

Do not create or rewrite recovery folders without the user's current consent. Do not use Memory Cache as permission to push, upload, run providers, use APIs, run global install, or perform destructive actions.

## Project State

`project-state.md` is the primary recovery file. Keep it current after:

- a review gate
- a checkpoint
- an error that changes the next action
- a long unattended session
- a handoff to a new chat or maintainer

It should include `checkpoint_id`, `checkpoint_status`, `last_completed_gate`, `blocked_items`, `files_touched`, `risks`, `next_action`, and a short recovery prompt pointer.

## Recovery Prompt

`recovery-prompt.md` must be short and paste-ready. The standard recovery prompt is:

```text
Read AGENTS.md and .agents/skills/pipeline-core/SKILL.md. Then read <Memory Cache>/project-state.md. Continue from checkpoint <checkpoint_id>. Use decision-log.md, source-map.md, open-questions.md, and artifacts-index.md only as supporting context. Do not infer missing instructions from old chat history. Do not skip unresolved gates. Do not push, upload, run providers, run global install, or perform destructive actions unless the current user message explicitly asks for it.
```

## Session Heartbeat

`session-heartbeat.md` records active operational state:

- running commands
- expected outputs
- blockers
- safe resume point

Keep it compact. It is for recovery, not full logging.

## Safety Rules

Do not store these in Memory Cache:

- secrets, keys, credentials, or `.env` content
- raw transcripts
- chain-of-thought
- base64 media
- signed or private URLs
- full command logs
- AppleDouble `._*` metadata files
- full Context folder copies

Saved state is not permission to push, upload, run APIs, run providers, run global install, or perform destructive actions.

## Validation

Validate an operational folder with:

```bash
npm run memory:validate -- --target <operational-folder>
```

The validator checks required files, required folders, active checkpoint status, paste-ready recovery prompt text, AppleDouble exclusions, unsafe file names, oversized files, and the separation between `Context/` and `Memory Cache/`.

## Related Docs

- [Context Folder](context-folder.md)
- [Semantic Memory](semantic-memory.md)
- [OpenAI API Policy](openai-api-policy.md)
- [Workflow Self-Improvement](workflow-self-improvement.md)
