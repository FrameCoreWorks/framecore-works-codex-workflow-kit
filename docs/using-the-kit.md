# Using The Kit

## Purpose

This guide shows what to ask Codex after FrameCore Works Skill Kit is installed in a project-local workspace.

Use it after [Quickstart](quickstart.md) or [Codex-Assisted Install](codex-assisted-install.md). Installation gives Codex the workflow contracts. Your next prompt tells Codex which route to use and how deep the workflow should go.

## First Prompt After Install

Open the target project in Codex and start with:

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files. Then confirm which FrameCore workflow assets are available in this workspace.
```

If Codex reports that `.codex/agents`, `.agents/skills`, or `.framecore/manifest.json` are missing, return to [Troubleshooting](troubleshooting.md).

## Starter Prompts

Use one of these as your first real task. Replace bracketed text with your project details.

### Route A Rough Idea

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

Use the FrameCore workflow to turn this rough idea into a clear brief and next-step plan:

[paste rough idea]

Start with intent confirmation, choose the smallest safe workflow route, create a Brief Contract, and stop before generation, provider execution, uploads, or file delivery.
```

### Build An Ecommerce Static Graphic Prompt Pack

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

Use FrameCore for an ecommerce static campaign or product visual.

Product:
[product details]

Channel and format:
[marketplace, social, ad, banner, poster, or other]

Goal:
[what the asset should achieve]

Build the brief, reference needs, visual direction, exact visible text if needed, copy, image prompt contract, and QA criteria. Do not use external execution tools. If visible text appears in a static raster graphic, keep the GPT Image 2 one-pass text policy.
```

### Build A Video Storyboard Or Shot Plan

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

Use FrameCore for a short video storyboard.

Product, service, or story:
[details]

Target audience:
[audience]

Duration or number of shots:
[duration or shot count]

Build direction, shot structure, scene beats, copy or caption needs, video prompt pack, QA criteria, and delivery notes. Stop before execution.
```

### Review Existing Assets Before Delivery

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

Use FrameCore QA and delivery review for these existing local artifacts:

[list local files or describe attached artifacts]

Create an asset manifest, QA report, pass/fail decision, known limitations, and delivery manifest. Do not upload anything. Do not change files unless I explicitly approve edits.
```

### Start A Long Session With Recovery

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

This will be a long multi-step task:

[task details]

Use FrameCore to choose the workflow route and offer to initialize Context/ and Memory Cache/ if they are missing or stale. Keep Project State current after major gates, blockers, file changes, and handoffs. Do not create recovery folders until I approve.
```

### Run A Report-Only Workflow Retrospective

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files.

Use FrameCore workflow-self-improvement to review this completed task:

[summarize task or point to local artifacts]

Create retrospective notes and improvement proposals only. Do not edit source files, install anything, upload anything, or apply changes without my approval.
```

## Choosing Workflow Depth

Ask for the smallest useful route:

- Planning only: use when the idea is rough and you need a clear brief.
- Prompt pack without execution: use when you want ready-to-run prompts but no generated media.
- Static campaign or ecommerce graphic: use for product visuals, posters, banners, marketplace assets, or social graphics.
- Video campaign or storyboard: use for shot lists, motion direction, storyboard planning, and video prompt packs.
- HyperFrames coded video: use for HTML/video composition planning, scene structure, captions, overlays, render QA, and delivery manifests.
- QA And Delivery Review: use when files already exist and you need review, traceability, acceptance decisions, and packaging notes.
- Workflow self-improvement: use when you want retrospective logs and change proposals.

When unsure, ask Codex to route the task first:

```text
Use FrameCore to choose the smallest safe workflow route for this task. Explain the route and stop for my approval before producing long artifacts.
```

## Creative Workflow Prompts

For static graphics:

```text
Use FrameCore for a static ecommerce product visual. Create the brief, reference pack, visual direction, exact visible text, and image prompt contract. If visible text appears in a static raster graphic, keep the GPT Image 2 one-pass policy.
```

For storyboard boards:

```text
Use FrameCore for a storyboard board artifact. Lock the panel count, shot labels, exact board text, hierarchy, and safe margins before image prompting.
```

For coded video:

```text
Use FrameCore HyperFrames workflow for a coded-video plan. Produce scene structure, timing, animation system, caption or overlay plan, render QA criteria, and delivery manifest.
```

## No External Execution Mode

Use this sentence when you want planning only:

```text
Do not use external execution tools, provider CLIs, paid media providers, uploads, or publishing. Produce workflow artifacts only.
```

Provider-neutral planning can still produce prompts, manifests, QA criteria, and delivery notes. It should not set up credentials, run providers, upload files, or publish outputs.

The built-in text-bearing image policy is separate: static raster graphics with visible text should use the native Codex or ChatGPT image generation path powered by GPT Image 2 in one pass when generation is explicitly requested and available.

## Hipson Adapter Prompts

The public kit includes only the lightweight Hipson Adapter.

Use it for bounded packets:

```text
Use the Hipson Adapter to prepare an instruction packet for the reference-curator role. Include goal, context, exclusions, source rules, acceptance criteria, output schema, and handoff target.
```

Full Hipson remains separate and optional. If you want full repository scanning or broader Hipson knowledge, connect the separate full Hipson repository outside this kit. The public kit does not clone, install, or activate full Hipson during onboarding.

## What Codex Should Produce

A good FrameCore run should name:

- selected workflow route
- active role IDs
- required gates
- expected artifacts
- handoff target
- execution boundary
- loopback condition if QA fails

Examples use `workflow.json` manifests to show machine-checked route contracts. Use [Examples Index](../examples/README.md) when you want a known path.

## Long Session Recovery Offer

If a task becomes long-running, multi-gate, file-heavy, interrupted, handed off, or likely to hit context compaction, Codex should check whether `Memory Cache/` already exists.

If `Memory Cache/` is missing or stale, Codex should proactively offer to initialize long-session recovery:

```text
This looks like a long or resumable session. I can initialize Context/ and Memory Cache/ for this workspace so future Codex sessions can resume safely. Should I create and validate those recovery folders now?
```

If you agree, Codex should run:

```bash
npm run memory:init -- --target <current-workspace-or-operational-folder>
npm run memory:validate -- --target <current-workspace-or-operational-folder>
```

Codex should then keep `Memory Cache/project-state.md` and `Memory Cache/recovery-prompt.md` current. It should not create or rewrite recovery folders without current user consent.

## Recovery After Context Loss

For multi-step or resumable work, ask Codex to keep a Project State artifact current. Treat it as the durable run-state ledger for the active task, not as a final delivery file.

Project State should include the selected route, active role IDs, completed or existing artifacts, last completed gate, request diagnostic, reasoning route, runtime route, loop state when iteration applies, loop evidence refs when iteration applies, pending decisions, blocked items, touched files, visible risks, next role, next action, and a recovery prompt.

If a session loses context, restart with:

```text
Read AGENTS.md before continuing. If this project also has AGENTS.framecore.md, read both files. Then read the latest Project State artifact and continue from its recovery_prompt. Do not skip any unresolved gates.
```

If no Project State exists, ask Codex to reconstruct one from the current artifacts before continuing specialist work.

## Safety Reminders

Keep these constraints explicit when needed:

- Use project-local workflow assets.
- Do not use global install unless intentionally requested.
- Do not use external execution tools unless explicitly requested.
- Do not upload unless explicitly requested.
- Do not include secrets, local machine paths, private cloud links, emails, or private project context in public artifacts.
- Keep user display names local; public source uses neutral role IDs.
- Use workflow-self-improvement for logs and proposals only unless mutation is explicitly approved.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [Workflow Stages](workflow-stages.md)
- [Examples Index](../examples/README.md)
- [Text-Bearing Image Policy](text-image-policy.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Hipson Integration](hipson-integration.md)
- [Workflow Self-Improvement](workflow-self-improvement.md)
- [Troubleshooting](troubleshooting.md)
