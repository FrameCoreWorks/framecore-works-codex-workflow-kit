# Workflow Blueprints

Use these blueprints as starting routes. The workflow-orchestrator may shorten or expand them, but it must preserve required gates, handoffs, and missing-artifact loopbacks.

## Minimal Planning Route

Use for small planning requests, first-install smoke tests, and tasks where the user needs a clean brief or delivery note without the full creative pipeline.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `delivery-documentation` when a final summary or package note is needed

Required gates:

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `delivery_fit` when delivery documentation is produced

Boundary: stop at planning unless the user asks for references, direction, prompt packs, execution, QA, or delivery packaging.

## Static Campaign Or E-Commerce Graphic

Use for posters, banners, product graphics, paid/social creative, marketplace images, and static campaign assets.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `static-direction`
6. `copy-voice` when visible text or campaign wording matters
7. `image-prompting`
8. `tool-routing-cost` only when execution is explicitly requested
9. `asset-manifest` when outputs exist
10. `qa-iteration`
11. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `copy_fit` when copy is used
- `promptability_fit`
- `asset_manifest_fit` when outputs exist
- `post_execution_fit`
- `delivery_fit`

Special rule: static raster graphics with visible text must use the native Codex/ChatGPT image generator powered by GPT Image 2 in one pass with final copy included.

## Video Campaign Or Storyboard

Use for video ads, motion concepts, shot lists, social video, storyboard sequences, and video prompt packs.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `motion-direction`
6. `storyboard-architect`
7. `copy-voice` when VO, supers, captions, or dialogue are needed
8. `video-prompting`
9. `tool-routing-cost` only when execution is explicitly requested
10. `asset-manifest` when outputs exist
11. `qa-iteration`
12. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `structure_fit`
- `copy_fit` when copy is used
- `promptability_fit`
- `asset_manifest_fit` when outputs exist
- `post_execution_fit`
- `delivery_fit`

Loopback: if the storyboard lacks timing, camera intent, or continuity, return to `storyboard-architect` before prompting.

## Storyboard Board Artifact

Use when the user needs a board/panel artifact for planning or review, not only a text storyboard.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `motion-direction` or `music-video-direction`
6. `storyboard-architect`
7. `storyboard-board-architect`
8. `image-prompting` when the board will be generated as an image
9. `qa-iteration`
10. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `structure_fit`
- `storyboard_board_fit`
- `promptability_fit` when image prompting is used
- `post_execution_fit`
- `delivery_fit`

Special rule: if the board is a static raster graphic with visible labels, lock final text before image prompting.

## HyperFrames Coded Video

Use when the output is a coded video composition, animation, caption system, website-to-video concept, or render-ready HyperFrames plan.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `motion-direction`
6. `storyboard-architect`
7. `copy-voice` when captions, titles, VO, or overlays matter
8. `hyperframes-producer`
9. `asset-manifest` when rendered or source assets exist
10. `qa-iteration`
11. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `structure_fit`
- `copy_fit` when copy is used
- `execution_manifest_fit`
- `asset_manifest_fit` when outputs exist
- `post_execution_fit`
- `delivery_fit`

Boundary: HyperFrames is a coded-video workflow path, not a paid media-provider integration.

## Prompt Pack Without Execution

Use when the user wants prompts, structured instructions, or a ready-to-run pack, but does not ask Codex to execute external tools.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator` when visual, factual, or continuity references matter
5. direction role as needed
6. `copy-voice` when text quality matters
7. `image-prompting` or `video-prompting`
8. `qa-iteration`
9. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit` when a draft/output is reviewed
- `brief_completeness`
- `reference_authority_fit` when references are used
- `direction_fit` when direction is used
- `copy_fit` when copy is used
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

Boundary: stop before `tool-routing-cost` unless the current user request explicitly asks for execution planning.

## Document Or Text Workflow

Use for structured notes, written documents, delivery text, research-backed text, summaries, and workspace documentation tasks.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `research-evidence` when factual support is needed
5. `copy-voice` when wording, tone, or readability matters
6. `qa-iteration` when there is a concrete draft or output to review
7. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit` when a draft/output is reviewed
- `brief_completeness`
- `evidence_fit` when research is used
- `copy_fit` when copy is produced or polished
- `post_execution_fit` when a draft/output is reviewed
- `delivery_fit`

Boundary: this path produces local text artifacts by default. Upload, publishing, or external delivery requires an explicit user request.

## QA And Delivery Only

Use when assets or artifacts already exist and the user asks for review, polish, packaging, or delivery notes.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `asset-manifest` when files or versions need traceability
4. `qa-iteration`
5. source role loopback when fixes are needed
6. `delivery-documentation`

Required gates:

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `asset_manifest_fit` when assets exist
- `post_execution_fit`
- `delivery_fit`

Loopback: if QA identifies a source-instruction issue, return to the role that owns the failed artifact instead of patching delivery notes around the problem.

## Workflow Self-Improvement Review

Use only when the user explicitly asks for retrospection or when the local opt-in report-only review recipe is enabled.

Route:

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `workflow-self-improvement`
4. optional `qa-iteration` only when routed by the orchestrator
5. user approval before any workflow mutation

Required gates:

- `intent_lock`
- `workflow_route`
- proposal review by the user before adoption

Boundary: this blueprint produces retrospective logs and change proposals only. It does not mutate workflow files, upload files, run providers, or create hidden daemons.
