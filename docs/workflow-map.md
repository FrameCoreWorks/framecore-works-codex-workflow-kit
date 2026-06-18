# Workflow Map

## Purpose

This map shows how the public FrameCore Works workflow pieces fit together: blueprints, role agents, supporting skills, artifacts, gates, handoffs, examples, and optional adapter knowledge.

Use this document when you need the full mental model before installing, customizing, reviewing, or extending the kit. For the raw inventory, see [Included Agents And Skills](included-agents-and-skills.md). For detailed role responsibilities, see [Agent Roster](agent-roster.md).

## System Layers

| Layer | Source | What it owns |
| --- | --- | --- |
| Project instructions | `AGENTS.template.md` | Installed workspace behavior, safety boundaries, local workflow entry point. |
| Role agents | `.codex/agents/*.toml.template` | Codex custom-agent role files rendered into the target workspace. |
| Workflow skills | `.agents/skills/*/SKILL.md` | Reusable contracts for when to act, required inputs, outputs, guardrails, and handoff. |
| Pipeline core | `.agents/skills/pipeline-core/` | Role routes, gates, handoffs, Project State, artifact templates, reasoning routes, and safety policy. |
| Public examples | `examples/*/workflow.json` | Machine-checked route examples for common workflow shapes. |
| Install lifecycle | `scripts/install.mjs`, `scripts/guided-install.mjs`, `scripts/doctor.mjs` | Project-local install, onboarding, dry-run, update, repair, uninstall, and diagnostics. |
| Bundle readiness | `config/bundle-map.json`, `docs/bundle-readiness.md` | Future package boundaries without changing current install behavior. |

## Blueprint Map

| Blueprint | Primary route | Main artifacts | Main gates | Example |
| --- | --- | --- | --- | --- |
| Minimal planning route | `intent-confirmation` -> `workflow-orchestrator` -> `brief-architect` -> `delivery-documentation` | Task Confirmation, Project State, Brief Contract, Delivery Manifest | `intent_lock`, `workflow_route`, `brief_completeness`, `delivery_fit` | [Minimal Workflow](../examples/minimal-workflow/README.md) |
| Static campaign or e-commerce graphic | intent, route, brief, references, static direction, copy, image prompting, QA, delivery | Brief Contract, Reference Pack, Direction Contract, Copy Pack, Prompt Pack, QA / Iteration Report | intent, route, brief, reference, direction, copy, prompt, QA, delivery gates | [Static Campaign](../examples/static-campaign/README.md), [Ecommerce Product Visual](../examples/ecommerce-product-visual/README.md) |
| Video campaign or storyboard | intent, route, brief, references, motion direction, storyboard, copy, video prompting, QA, delivery | Direction Contract, Storyboard Contract, Copy Pack, Prompt Pack, QA / Iteration Report | intent, route, brief, reference, direction, structure, copy, prompt, QA, delivery gates | [Video Storyboard](../examples/video-storyboard/README.md) |
| Storyboard board artifact | video storyboard route plus `storyboard-board-architect` and image prompting | Storyboard Contract, Board Artifact Prompt, Image Prompt Contract, QA / Iteration Report | structure, storyboard board, promptability, QA, delivery gates | [Storyboard Board](../examples/storyboard-board/README.md) |
| HyperFrames coded video | intent, route, brief, references, motion, storyboard, copy, HyperFrames producer, asset manifest, QA, delivery | HyperFrames Production Brief, Asset Manifest, QA / Iteration Report, Delivery Manifest | execution manifest, asset manifest, QA, delivery gates | [HyperFrames Video](../examples/hyperframes-video/README.md) |
| Prompt pack without execution | intent, route, brief, optional references/direction/copy, image or video prompting, QA, delivery | Prompt Pack, Image Prompt Contract when static image text matters, QA / Iteration Report | promptability, QA, delivery gates | [Image Prompt Pack](../examples/image-prompt-pack/README.md), [No External Execution Mode](../examples/no-provider-mode/README.md) |
| Document or text workflow | intent, route, brief, optional evidence, copy, QA when a draft exists, delivery | Brief Contract, Evidence Note, Copy Pack, Delivery Manifest | brief, evidence, copy, QA when needed, delivery gates | [Document Workflow](../examples/document-workflow/README.md) |
| Hipson adapter packet workflow | document workflow plus `instruction-packet-factory` for bounded packet creation | Brief Contract, Instruction Packet, Evidence Note, Copy Pack, Delivery Manifest | brief, instruction packet, evidence, copy, delivery gates | [Hipson Adapter Packets](../examples/hipson-adapter-packets/README.md) |
| QA and delivery only | intent, route, asset manifest, QA, delivery | Asset Manifest, QA / Iteration Report, Delivery Manifest | asset manifest, QA, delivery gates | [QA And Delivery Review](../examples/qa-delivery-review/README.md) |
| Workflow self-improvement review | intent, route, workflow-self-improvement, optional QA, user approval before mutation | Improvement Log, Change Proposal, Self-Improvement Sufficiency Gate | workflow route, proposal review, sufficiency gate | [Workflow Self-Improvement](workflow-self-improvement.md) |

## Role To Skill Support Map

Some roles have a same-named skill. Other roles are supported by broader specialist skills. This is intentional: role agents own handoff state, while skills provide reusable domain contracts.

| Role agent | Supporting skill or knowledge | Primary artifact | Review gate |
| --- | --- | --- | --- |
| `intent-confirmation` | `pipeline-core`, `workflow-orchestrator` | Task Confirmation | `intent_lock` |
| `workflow-orchestrator` | `workflow-orchestrator`, `pipeline-core` | Project State, Workflow Request Diagnostic | `workflow_route`, `request_diagnostic_fit` |
| `brief-architect` | `brief-architect` | Brief Contract | `brief_completeness` |
| `reference-curator` | `reference-pack-curator`, `hipson-adapter` when a packet helps | Reference Pack | `reference_authority_fit` |
| `research-evidence` | `hipson-adapter`, `instruction-packet-factory`, `pipeline-core` | Evidence Note | `evidence_fit` |
| `instruction-packet-factory` | `instruction-packet-factory`, `hipson-adapter` | Instruction Packet | `instruction_packet_fit` |
| `static-direction` | `commercial-visual-campaign-director`, `marketing`, `character-design`, `storytelling` | Direction Contract | `direction_fit` |
| `motion-direction` | `commercial-video-campaign-director`, `cinematography`, `storytelling`, `ugc` | Motion Direction Contract | `direction_fit` |
| `music-video-direction` | `creative-music-video-director`, `cinematography`, `storytelling` | Music Video Direction Contract | `direction_fit` |
| `storyboard-architect` | `storyboard-director`, `cinematography`, `storytelling` | Storyboard Contract | `structure_fit` |
| `storyboard-board-architect` | `storyboard-board-architect`, `image-prompt-architect` | Board Artifact Prompt | `storyboard_board_fit` |
| `copy-voice` | `humanizer`, `marketing`, `ugc` | Copy Pack | `copy_fit` |
| `image-prompting` | `image-prompt-architect`, `pipeline-core` text-image policy | Prompt Pack or Image Prompt Contract | `promptability_fit` |
| `video-prompting` | `video-prompt-architect`, `cinematography`, `storytelling` | Video Prompt Pack | `promptability_fit` |
| `tool-routing-cost` | `pipeline-core`, provider-neutral policy docs | Tool Routing Plan | `schema_pricing_fit` |
| `execution-manifest` | `asset-manifest`, `pipeline-core` | Execution Manifest | `execution_manifest_fit` |
| `hyperframes-producer` | `hyperframes-workflow`, `hyperframes-prompting`, `hyperframes-gsap-guidance` | HyperFrames Production Brief | `execution_manifest_fit` |
| `asset-manifest` | `asset-manifest` | Asset Manifest | `asset_manifest_fit` |
| `qa-iteration` | `output-critic-iteration`, `pipeline-core` | QA / Iteration Report | `post_execution_fit` |
| `delivery-documentation` | `delivery-documentation`, `humanizer` when copy polish matters | Delivery Manifest | `delivery_fit` |

## Knowledge Packs

| Knowledge pack | Source | Use when |
| --- | --- | --- |
| Humanizer | `.agents/skills/humanizer/`, `pipeline-core/references/humanizer-routing.md` | Text needs natural voice, tone adaptation, or final wording polish while preserving locked facts. |
| HyperFrames | `.agents/skills/hyperframes-*`, `docs/hyperframes.md` | A coded-video or HTML-to-video plan needs scenes, timing, animation guidance, captions, render QA, or manifest planning. |
| Hipson Adapter | `.agents/skills/hipson-adapter/`, `docs/hipson-integration.md` | A task needs research maps, internet mapping packets, review packets, or bounded instruction packets without installing full Hipson. |
| Memory Cache | `templates/Memory Cache/`, `docs/memory-cache.md`, `docs/context-folder.md` | Long Codex sessions need local state, recovery prompts, decision logs, and context folding. |
| Provider governance | `config/provider-neutral-policy.json`, `config/text-image-policy.json`, `docs/provider-neutral-boundary.md` | A workflow touches execution planning, visible text in graphics, OpenAI API boundaries, uploads, or external-provider safety. |

## Handoff Discipline

The workflow should move through the smallest route that preserves required artifacts and gates. A later role should not invent missing upstream data. If required fields are absent, route back to the role that owns the missing artifact.

Common loopbacks:

- Missing audience, deliverables, constraints, or acceptance criteria: return to `brief-architect`.
- Weak or conflicting references: return to `reference-curator`.
- Factual uncertainty or claim risk: route to `research-evidence`.
- Weak direction or unclear visual system: return to `static-direction`, `motion-direction`, or `music-video-direction`.
- Missing timing, shot continuity, or panel logic: return to `storyboard-architect` or `storyboard-board-architect`.
- Prompt lacks observable success criteria: return to `image-prompting` or `video-prompting`.
- Output fails QA: return to the source role instead of hiding the issue in delivery notes.

## Public Additions Checklist

When adding a new role, skill, workflow blueprint, or example:

1. Add or update the source skill or role file.
2. Add the artifact owner to [Gate Registry](../.agents/skills/pipeline-core/references/gate-registry.md) when a new gate is required.
3. Add allowed handoffs to [Handoff Matrix](../.agents/skills/pipeline-core/references/handoff-matrix.md).
4. Add or update artifact fields in [Artifact Schemas](artifact-schemas.md) and `config/artifact-schemas.json`.
5. Add a checked example under `examples/` when the behavior is user-facing.
6. Add the bundle boundary in `config/bundle-map.json`.
7. Run `npm run check` before committing.

## Related Docs

- [Included Agents And Skills](included-agents-and-skills.md)
- [Agent Roster](agent-roster.md)
- [Workflow Stages](workflow-stages.md)
- [Artifact Schemas](artifact-schemas.md)
- [Example Authoring](example-authoring.md)
- [Bundle Readiness](bundle-readiness.md)
