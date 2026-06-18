# Included Agents And Skills

## Purpose

This inventory shows what the public FrameCore Works Skill Kit includes before installation.

The kit installs a project-local workflow layer for Codex: role-agent templates, workflow skills, onboarding, docs, examples, artifact contracts, gates, handoffs, validation scripts, and provider-neutral safety rules. It does not install paid external media providers, API keys, endpoint catalogs, provider CLIs, or background upload tooling.

## Summary

| Category | Count | Installed path or source path |
| --- | ---: | --- |
| Codex role-agent templates | 20 | `.codex/agents/*.toml.template` rendered into `.codex/agents/*.toml` |
| Workflow skills | 27 | `.agents/skills/*/SKILL.md` |
| Core workflow references | 5 | `.agents/skills/pipeline-core/references/` |
| Artifact schemas | 1 registry | `config/artifact-schemas.json` |
| Example workflows | 11 | `examples/*/workflow.json` |
| Installer and validation scripts | multiple | `scripts/*.mjs` and `tools/*.mjs` |

## Installed Agent Templates

These are Codex role-agent templates. During install, they are rendered into the target workspace as `.codex/agents/<role-id>.toml` with local onboarding preferences.

| Role ID | Main job |
| --- | --- |
| `intent-confirmation` | Lock the request, scope, exclusions, expected output, and immediate next step. |
| `workflow-orchestrator` | Choose the workflow route, active roles, gates, handoffs, loopbacks, and Project State. |
| `brief-architect` | Turn rough goals, notes, and constraints into a structured Brief Contract. |
| `reference-curator` | Organize visual, brand, product, continuity, and source references into a Reference Pack. |
| `research-evidence` | Verify claims, tool limits, public facts, and source-backed decisions. |
| `instruction-packet-factory` | Build bounded instruction packets, research maps, review packets, and execution packets. |
| `static-direction` | Create visual direction for static graphics, campaign assets, posters, banners, and ecommerce visuals. |
| `motion-direction` | Create direction for video, motion concepts, ad sequences, and storyboard routes. |
| `music-video-direction` | Convert song, artist, rhythm, motif, and emotional arc into a music-video direction contract. |
| `storyboard-architect` | Build beats, scenes, shot cards, transitions, timing, and continuity rules. |
| `storyboard-board-architect` | Specify storyboard board graphics, panel layout, labels, hierarchy, and board text. |
| `copy-voice` | Produce or polish copy, VO, dialogue, captions, supers, product text, and tone. |
| `image-prompting` | Produce final static image prompt packs with visible-text and reference constraints. |
| `video-prompting` | Produce final video prompt packs with timing, motion, continuity, and acceptance criteria. |
| `tool-routing-cost` | Plan execution only when the user explicitly asks to use their own configured tools. |
| `execution-manifest` | Record approved execution parameters, source assets, output plan, and risk notes. |
| `asset-manifest` | Index output files, versions, source traceability, exclusions, and reproducibility notes. |
| `qa-iteration` | Review outputs, prompts, and artifacts against brief, references, locks, and acceptance criteria. |
| `delivery-documentation` | Package accepted files, QA status, usage notes, caveats, and delivery manifest. |
| `hyperframes-producer` | Plan coded-video structure, animation system, captions, render QA, and manifest details. |

For detailed inputs, outputs, gates, and common handoffs, see [Agent Roster](agent-roster.md).

## Installed Workflow Skills

Skills are workflow contracts. They define when a capability should be used, what input it needs, what artifact it should produce, and which safety rules apply. They are not paid provider integrations.

| Skill | Main use |
| --- | --- |
| `asset-manifest` | Organize workflow assets, file lists, versions, source traceability, exclusions, and reproducibility notes. |
| `brief-architect` | Convert messy notes, user requests, source material, and constraints into a Brief Contract. |
| `character-design` | Build character design systems, identity anchors, expression sheets, outfit variants, and consistency rules. |
| `cinematography` | Plan shot language, lens choices, camera movement, lighting, blocking, color, texture, and cinematic direction. |
| `commercial-video-campaign-director` | Create motion direction for commercial video campaigns, product reveals, social clips, and launch videos. |
| `commercial-visual-campaign-director` | Create visual direction for static commercial campaigns, product visuals, launch assets, and social variants. |
| `creative-music-video-director` | Translate song context, artist persona, motifs, rhythm, and emotional arc into a music-video direction contract. |
| `delivery-documentation` | Package final files, QA status, source lists, usage notes, caveats, excluded files, and delivery manifests. |
| `hipson-adapter` | Create lightweight Hipson-style research maps, internet mapping packets, bounded instruction packets, review packets, and execution packets. |
| `humanizer` | Polish writing, copy, VO, dialogue, tone, final summaries, and reduce generic AI phrasing while preserving facts. |
| `hyperframes-gsap-guidance` | Plan GSAP timelines, easing, stagger, transitions, captions, overlays, and animation QA for HyperFrames. |
| `hyperframes-prompting` | Create production prompts and implementation briefs for HyperFrames-coded video scenes and motion systems. |
| `hyperframes-workflow` | Plan HyperFrames coded-video structure, scene timing, render QA, and delivery manifest requirements. |
| `image-prompt-architect` | Create final provider-neutral image prompt packs from approved brief, references, direction, and copy. |
| `instruction-packet-factory` | Create bounded instruction packets, research maps, review packets, and execution packets for workflow roles. |
| `marketing` | Plan campaigns, offer framing, asset matrices, audience fit, channel adaptation, launch kits, and campaign QA. |
| `onboarding-preference-tuning` | Run first-time setup for preferences, local display names, output paths, QA strictness, delivery behavior, and optional expansions. |
| `output-critic-iteration` | Review produced outputs against brief, references, prompts, copy locks, observables, and acceptance criteria. |
| `pipeline-core` | Route workflows through roles, gates, handoffs, artifacts, request diagnostics, reasoning routes, QA, delivery, and governance. |
| `reference-pack-curator` | Structure references into canonical sources, aliases, role tags, suppression rules, conflicts, and continuity anchors. |
| `storyboard-board-architect` | Specify storyboard board, production board, or shot board graphics with panel structure and board copy. |
| `storyboard-director` | Convert direction into beats, scenes, shot cards, timing, transitions, and continuity rules. |
| `storytelling` | Plan narrative structure, story beats, emotional arcs, scene logic, continuity, and multi-shot workflows. |
| `ugc` | Plan UGC-style creator ads, talking-head scripts, social proof concepts, hooks, and creator-read copy. |
| `video-prompt-architect` | Create final provider-neutral video prompt packs from approved storyboard, motion direction, references, and copy. |
| `workflow-orchestrator` | Route workflows, maintain project state, assign role-based agents, enforce gates, and decide loopbacks. |
| `workflow-self-improvement` | Run explicit-only retrospectives, workflow audits, improvement notes, and approval-gated change proposals. |

## Other Included Workflow Assets

| Asset | What it gives the user |
| --- | --- |
| `AGENTS.template.md` | Project instruction template for installed workspaces. |
| `config/artifact-schemas.json` | Required fields and example fixtures for workflow artifacts. |
| `config/provider-neutral-policy.json` | Public boundary for what the kit does and does not install or execute. |
| `config/text-image-policy.json` | Built-in Codex/ChatGPT image generation policy for static raster graphics with visible text. |
| `examples/*/workflow.json` | Checked example routes that demonstrate role order, gates, artifacts, and handoffs. |
| `scripts/install.mjs` | Project-local install, update, repair, uninstall, manifest, backup, and symlink safety logic. |
| `scripts/guided-install.mjs` | Beginner-safe guided install path with checks, onboarding, dry-run, and confirmation. |
| `scripts/doctor.mjs` | Preflight and install-health diagnostics. |
| `scripts/validate.mjs` | Repository workflow validation. |
| `scripts/audit-privacy.mjs` and `scripts/safety-scan.mjs` | Public-source privacy and secret scanning. |
| `tools/*` | Memory Cache, semantic memory, context budget, skill audit, and cleanup helpers. |

## What Is Not Included

- No paid external media-provider clients.
- No API keys or API-key setup flows.
- No endpoint catalogs for paid providers.
- No background daemon.
- No automatic upload or publishing.
- No global install unless the user explicitly chooses the guarded global mode.
- No full Hipson install. The included Hipson Adapter is lightweight; full Hipson remains separate and optional.

## Related Docs

- [Quickstart](quickstart.md)
- [Workflow Map](workflow-map.md)
- [Agent Roster](agent-roster.md)
- [Workflow Stages](workflow-stages.md)
- [Architecture](architecture.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Compatibility](compatibility.md)
