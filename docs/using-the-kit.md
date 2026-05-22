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

Use one of these as your first real task:

```text
Use the FrameCore workflow to turn this rough idea into a clear brief and next-step plan. Stop before generation or external execution.
```

```text
Use FrameCore for an ecommerce static campaign. Build the brief, reference needs, direction, copy, and image prompt pack. Do not use external execution tools.
```

```text
Use FrameCore for a short video storyboard. Build direction, shot structure, copy needs, and video prompt pack. Stop before execution.
```

```text
Use FrameCore QA and delivery review for these existing local artifacts. Create an asset manifest, QA report, and delivery manifest. Do not upload anything.
```

```text
Use FrameCore workflow-self-improvement to review this completed task and propose workflow improvements. Produce proposals only, no automatic edits.
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

Full Hipson remains separate and optional. If you want full repository scanning or broader Hipson knowledge, connect the separate full Hipson repository outside this kit.

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
