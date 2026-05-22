# Workflow Stages

FrameCore Works routes work through explicit stages. Each stage has a role, an input, an artifact, a review gate, and a valid handoff. The goal is to prevent Codex from skipping from a vague request directly into prompts, execution, or delivery.

Read each row as an operational contract: the owner receives input, produces the artifact, passes the gate, then hands off only to an allowed next role.

## Purpose

This guide gives maintainers and new users a compact map of the default pipeline. It does not replace the gate registry, handoff matrix, workflow blueprints, artifact schemas, or agent templates. Those files remain the canonical source for validation.

Use this page when deciding where a task should enter the pipeline, which artifact should exist before the next role acts, and which stage owns a loopback.

## Stage Matrix

| Stage | Owner Role | Input | Output Artifact | Gate | Next Handoff |
| --- | --- | --- | --- | --- | --- |
| Intent lock | `intent-confirmation` | raw user request | Task Confirmation | `intent_lock` | `workflow-orchestrator` |
| Route | `workflow-orchestrator` | task confirmation, local config | Project State | `workflow_route` | specialist role or `instruction-packet-factory` |
| Brief | `brief-architect` | goal, raw context, constraints | Brief Contract | `brief_completeness` | `reference-curator` |
| References | `reference-curator` | brief, reference needs | Reference Pack | `reference_authority_fit` | direction role |
| Research | `research-evidence` | bounded research question | Evidence Note | `evidence_fit` | requesting role |
| Instruction packet | `instruction-packet-factory` | target role, goal, exclusions | Instruction Packet | `instruction_packet_fit` | target specialist |
| Direction | `static-direction`, `motion-direction`, `music-video-direction` | brief, references | Direction Contract | `direction_fit` | structure, copy, or prompt role |
| Structure | `storyboard-architect` | motion direction, timing constraints | Storyboard Contract | `structure_fit` | video prompt or HyperFrames |
| Storyboard board | `storyboard-board-architect` | storyboard, visual direction | Board Artifact Prompt | `storyboard_board_fit` | `image-prompting` or `qa-iteration` |
| Copy | `copy-voice` | direction, tone, audience | Copy Pack | `copy_fit` | prompt role |
| Prompting | `image-prompting`, `video-prompting` | direction, copy, references | Prompt Pack | `promptability_fit` | `tool-routing-cost` or QA |
| Tool routing | `tool-routing-cost` | prompt pack, approval status | Tool Routing Plan | `schema_pricing_fit` | `execution-manifest` |
| Execution manifest | `execution-manifest`, `hyperframes-producer` | selected tool, approved inputs | Execution Manifest or HyperFrames Production Brief | `execution_manifest_fit` | `asset-manifest` |
| Asset manifest | `asset-manifest` | output files, source notes | Asset Manifest | `asset_manifest_fit` | `qa-iteration` |
| QA / iteration | `qa-iteration` | artifacts, assets, criteria | QA / Iteration Report | `post_execution_fit` | delivery or loopback |
| Delivery | `delivery-documentation` | accepted assets and caveats | Delivery Manifest | `delivery_fit` | user-facing final response |

## Loopback Rules

- If the brief is incomplete, return to `brief-architect`.
- If references conflict or lack roles, return to `reference-curator`.
- If direction is not promptable, return to the relevant direction role.
- If visible text is needed in a static raster graphic, lock exact copy before image prompting.
- If a generated or produced asset fails QA, return to the role that can correct the source instruction.
- If delivery is requested without QA for generated assets, route through `qa-iteration` first.

Loopbacks should preserve accepted upstream artifacts unless the failed gate proves that an upstream decision is wrong or incomplete.

## Durable Project State

Project State is the recovery ledger for long-running work. It should be updated whenever the route changes, a review gate is completed, a blocker appears, or the next role changes.

At minimum, Project State records the selected workflow blueprint, active roles, completed or existing artifacts, last completed gate, required handoffs, review gates, pending decisions, blocked items, touched files, visible risks, next role, next action, and a recovery prompt.

When context is lost, a new Codex session should read `AGENTS.md`, `AGENTS.framecore.md` when present, and the latest Project State before continuing. If Project State is missing, reconstruct it from available artifacts before producing new specialist deliverables.

## No-Provider Mode

The workflow remains useful without external execution. In no-provider mode, stop at planning artifacts such as Brief Contract, Reference Pack, Direction Contract, Prompt Pack, QA criteria, and Delivery Manifest.

Do not route into `tool-routing-cost`, `execution-manifest`, or provider-specific execution unless the user explicitly asks for execution and the project has a separate provider policy.

## Common Blueprints

Common workflow routes live in [Workflow Blueprints](../.agents/skills/pipeline-core/references/workflow-blueprints.md). Use them as starting routes for static/e-commerce graphics, video storyboards, storyboard boards, HyperFrames coded video, prompt packs without execution, QA/delivery-only work, and explicit workflow self-improvement reviews.

## Example Routes

Public examples include checked `workflow.json` manifests. Each manifest lists route roles, gates, artifacts, and handoffs. Validation rejects unknown role IDs, unknown gates, unknown artifacts, and route handoffs that are not listed in the handoff matrix.

Use examples to teach routing patterns, not to define new canonical stages.

## Validation

`npm run validate` checks the canonical files behind this page:

- role IDs from `config/agent-naming.schema.json`
- review gates from the gate registry
- handoff pairs from the handoff matrix
- artifacts from `config/artifact-schemas.json`
- example workflow manifests from `examples/*/workflow.json`

If this guide changes the expected route language, update the canonical files and tests in the same change.

## Related Files

- [Gate Registry](../.agents/skills/pipeline-core/references/gate-registry.md)
- [Handoff Matrix](../.agents/skills/pipeline-core/references/handoff-matrix.md)
- [Workflow Blueprints](../.agents/skills/pipeline-core/references/workflow-blueprints.md)
- [Artifact Templates](../.agents/skills/pipeline-core/templates/artifact-templates.md)
- [Storyboard Board Example](../examples/storyboard-board/README.md)
- [End-To-End Creative Workflow Example](../examples/end-to-end-creative-workflow/README.md)
