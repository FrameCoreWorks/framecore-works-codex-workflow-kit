# Agent Roster

## Purpose

This guide is the canonical role-responsibility reference for public FrameCore Works role IDs: what each role is allowed to own, which artifact it should produce, which gate reviews it, and where it can hand off next. It is not the inventory source for total counts.

The source repo uses neutral role IDs only. During onboarding, each user may assign local display names for their own workspace. Those display names stay in local config and should not be committed back to the public kit.

## How Role Selection Works

Start with the smallest safe route:

1. Confirm the request with `intent-confirmation`.
2. Let `workflow-orchestrator` choose the route, gates, handoffs, and stopping point.
3. Add specialist roles only when their artifact is needed.
4. Stop before `tool-routing-cost` unless the user explicitly asks for execution planning.
5. Stop before uploads, publishing, or external tools unless the user explicitly requests them.

The active route should name the role IDs, required gates, expected artifacts, handoff target, execution boundary, and loopback condition if QA fails. Nontrivial iterative work should also name the Loop State and stop decision path.

## Role Roster

| Role ID | When to use | Primary input | Primary artifact | Review gate | Common handoff |
| --- | --- | --- | --- | --- | --- |
| `intent-confirmation` | A new or ambiguous user request needs scope, exclusions, and output expectations locked. | Raw user request | Task Confirmation | `intent_lock` | `workflow-orchestrator` |
| `workflow-orchestrator` | The workflow route, depth, handoffs, loopbacks, Loop State, and stopping point need ownership. | Task Confirmation, local config | Project State, Loop State when iteration applies | `workflow_route`, `loop_control_fit` when iteration applies | Specialist role, `instruction-packet-factory`, `qa-iteration`, or `asset-manifest` |
| `brief-architect` | A rough idea needs conversion into a usable creative or production brief. | Goal, raw context, constraints | Brief Contract | `brief_completeness` | `reference-curator`, `research-evidence`, or `delivery-documentation` |
| `reference-curator` | Visual, brand, product, continuity, or inspiration references need structure. | Brief Contract, reference needs | Reference Pack | `reference_authority_fit` | `static-direction` or `motion-direction` |
| `research-evidence` | Claims, tool limits, public facts, or source-backed decisions need verification. | Bounded research question, source rules | Evidence Note | `evidence_fit` | Requesting role or `copy-voice` |
| `instruction-packet-factory` | A specialist needs a bounded packet, research map, review packet, or execution packet. | Target role, goal, context, exclusions | Instruction Packet | `instruction_packet_fit` | Target specialist, `research-evidence`, or `reference-curator` |
| `static-direction` | A static campaign, ecommerce graphic, poster, banner, or social asset needs visual direction. | Brief Contract, Reference Pack | Static Direction Contract | `direction_fit` | `copy-voice` or `image-prompting` |
| `motion-direction` | A video campaign, motion concept, ad sequence, or storyboard needs direction. | Brief Contract, Reference Pack | Motion Direction Contract | `direction_fit` | `copy-voice` or `storyboard-architect` |
| `music-video-direction` | A music video or rhythm-led sequence needs a visual system and treatment logic. | Brief Contract, track or mood notes, references | Music Video Direction Contract | `direction_fit` | `storyboard-architect` or `copy-voice` |
| `storyboard-architect` | A motion route needs beats, scenes, shot cards, continuity, and timing. | Motion Direction Contract, timing constraints | Storyboard Contract | `structure_fit` | `copy-voice`, `video-prompting`, or `hyperframes-producer` |
| `storyboard-board-architect` | A storyboard board artifact needs panel layout, labels, hierarchy, and board text locked. | Storyboard Contract, visual direction | Board Artifact Prompt | `storyboard_board_fit` | `image-prompting` or delivery review |
| `copy-voice` | Copy, voiceover, dialogue, captions, supers, product text, or tone polish is needed. | Direction, audience, tone preferences | Copy Pack | `copy_fit` | `image-prompting`, `video-prompting`, `hyperframes-producer`, or `delivery-documentation` |
| `image-prompting` | Static image prompts need final generator-ready structure and visible-text constraints. | Direction, Copy Pack, references | Image Prompt Pack | `promptability_fit` | `qa-iteration` or `tool-routing-cost` |
| `video-prompting` | Video prompts need timing, shot continuity, motion language, and acceptance criteria. | Storyboard Contract, Copy Pack, references | Video Prompt Pack | `promptability_fit` | `qa-iteration` or `tool-routing-cost` |
| `tool-routing-cost` | The user explicitly asks to plan execution with their own configured tools. | Prompt Pack, approval status | Tool Routing Plan | `schema_pricing_fit` | `execution-manifest` |
| `execution-manifest` | An approved execution run needs traceability, parameters, output plan, and risk notes. | Selected tool, approved inputs | Execution Manifest | `execution_manifest_fit` | `asset-manifest` |
| `asset-manifest` | Existing or produced files need indexing, versions, provenance, and traceability. | Output files, source notes | Asset Manifest | `asset_manifest_fit` | `qa-iteration` |
| `qa-iteration` | Outputs, prompts, or artifacts need acceptance review, evidence-backed critique, regression check, and loopback decisions. | Artifacts, assets, criteria, Loop State | QA / Iteration Report | `post_execution_fit`, `loop_control_fit` support | `delivery-documentation`, `workflow-orchestrator`, or source role loopback |
| `delivery-documentation` | Accepted work needs packaging notes, caveats, final summary, or delivery manifest. | Accepted assets and caveats | Delivery Manifest | `delivery_fit` | User-facing final response |
| `hyperframes-producer` | A coded-video route needs scene structure, animation system, captions, render QA, and manifest planning. | Storyboard, copy, render constraints | HyperFrames Production Brief | `execution_manifest_fit` | `asset-manifest` |

## Common Selection Patterns

- Planning only: `intent-confirmation` -> `workflow-orchestrator` -> `brief-architect`
- Static ecommerce graphic: `intent-confirmation` -> `workflow-orchestrator` -> `brief-architect` -> `reference-curator` -> `static-direction` -> `copy-voice` -> `image-prompting`
- Video storyboard: `intent-confirmation` -> `workflow-orchestrator` -> `brief-architect` -> `reference-curator` -> `motion-direction` -> `storyboard-architect` -> `copy-voice` -> `video-prompting`
- Storyboard board: video storyboard route plus `storyboard-board-architect`, then `image-prompting` if a board image prompt is needed.
- HyperFrames coded video: video storyboard route plus `hyperframes-producer`, then `asset-manifest`, `qa-iteration`, and `delivery-documentation` after local files or renders exist.
- Existing asset review: `intent-confirmation` -> `workflow-orchestrator` -> `asset-manifest` -> `qa-iteration` -> `delivery-documentation`
- Workflow self-improvement: route only when explicitly requested, produce logs and proposals, and do not mutate workflow files without approval.

## Local Display Names

Onboarding can assign local display names to roles. These names are only aliases for the local user experience. The installed agent files, docs, examples, tests, and public source should keep using neutral role IDs.

If multiple users share a project, keep display names out of public examples and reusable templates unless the team intentionally agrees to share that local convention.

## Handoff Discipline

Every role should produce its artifact before handing off. If the next role does not have the required fields from the handoff matrix, route back to the owner role instead of inventing missing context.

Do not skip QA when generated or produced assets exist. Do not send prompt packs directly to delivery unless the workflow is explicitly a prompt-only delivery with no generated assets.

## Provider-Neutral Boundaries

The roster can plan, prompt, QA, document, and package work without bundling paid external execution tools. `tool-routing-cost` and `execution-manifest` stay provider-neutral and only describe user-approved execution planning.

Static raster graphics with visible text are the built-in exception to a purely textual workflow boundary: when generation is explicitly requested and available in Codex or ChatGPT, keep the GPT Image 2 one-pass policy.

## Related Docs

- [Workflow Stages](workflow-stages.md)
- [Workflow Blueprints](../.agents/skills/pipeline-core/references/workflow-blueprints.md)
- [Gate Registry](../.agents/skills/pipeline-core/references/gate-registry.md)
- [Handoff Matrix](../.agents/skills/pipeline-core/references/handoff-matrix.md)
- [Using The Kit](using-the-kit.md)
