# Workflow Stages

FrameCore Works routes work through explicit stages. Each stage has a role, an input, an artifact, a review gate, and a valid handoff. The goal is to prevent Codex from skipping from a vague request directly into prompts, execution, or delivery.

Read each row as an operational contract: the owner receives input, produces the artifact, passes the gate, then hands off only to an allowed next role.

| Stage | Owner Role | Input | Output Artifact | Gate | Next Handoff |
| --- | --- | --- | --- | --- | --- |
| Intent lock | `intent-confirmation` | raw user request | Task Confirmation | `intent_lock` | `workflow-orchestrator` |
| Route | `workflow-orchestrator` | task confirmation, local config | Project State | `workflow_route` | specialist role or `instruction-packet-factory` |
| Brief | `brief-architect` | goal, raw context, constraints | Brief Contract | `brief_completeness` | `reference-curator` |
| References | `reference-curator` | brief, reference needs | Reference Pack | `reference_authority_fit` | direction role |
| Research | `research-evidence` | bounded research question | Evidence Note | `evidence_fit` | requesting role |
| Instruction packet | `instruction-packet-factory` | target role, goal, exclusions | Instruction Packet | `instruction_packet_fit` | target specialist |
| Direction | `static-direction`, `motion-direction`, `music-video-direction` | brief, references | Direction Contract | `direction_fit` | structure, copy, or prompt role |
| Structure | `storyboard-architect` | motion direction, timing constraints | Structure Contract | `structure_fit` | video prompt or HyperFrames |
| Storyboard board | `storyboard-board-architect` | storyboard, visual direction | Board Artifact Prompt | `storyboard_board_fit` | image prompt or delivery review |
| Copy | `copy-voice` | direction, tone, audience | Copy Pack | `copy_fit` | prompt role |
| Prompting | `image-prompting`, `video-prompting` | direction, copy, references | Prompt Pack | `promptability_fit` | `tool-routing-cost` or QA |
| Tool routing | `tool-routing-cost` | prompt pack, approval status | Tool Routing Plan | `schema_pricing_fit` | `execution-manifest` |
| Execution manifest | `execution-manifest`, `hyperframes-producer` | selected tool, approved inputs | Execution Manifest or Production Brief | `execution_manifest_fit` | `asset-manifest` |
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

## No-Provider Mode

The workflow remains useful without external execution. In no-provider mode, stop at planning artifacts such as Brief Contract, Reference Pack, Direction Contract, Prompt Pack, QA criteria, and Delivery Manifest.

## Related Files

- [Gate Registry](../.agents/skills/pipeline-core/references/gate-registry.md)
- [Handoff Matrix](../.agents/skills/pipeline-core/references/handoff-matrix.md)
- [Artifact Templates](../.agents/skills/pipeline-core/templates/artifact-templates.md)
- [End-To-End Creative Workflow Example](../examples/end-to-end-creative-workflow/README.md)
