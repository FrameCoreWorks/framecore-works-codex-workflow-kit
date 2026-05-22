# Examples Index

Use these examples to choose the smallest workflow path that fits the task. Each example shows the expected stages, produced artifacts, and where the workflow stops when no external execution is requested.

Each example directory includes a `workflow.json` manifest. The manifest is the machine-checked contract for the blueprint, route, gates, artifacts, declared handoffs, and execution boundary. README files explain the workflow for humans; `npm run validate` checks the manifests against the workflow blueprints, role roster, gate registry, handoff matrix, and artifact schemas.

Additional minimal contract fixtures live under `contract-fixtures/artifacts/`. They are validation fixtures for artifact schemas, not full workflow examples.

| Example | Use Case | Main Stages | Typical Artifacts | Execution Boundary |
| --- | --- | --- | --- | --- |
| [Minimal Workflow](minimal-workflow/README.md) | Small planning task or first install check | intent, route, brief | Task Confirmation, Brief Contract | stops at planning |
| [Static Campaign](static-campaign/README.md) | Ecommerce, social, launch, or product visuals | brief, references, static direction, image prompting | Brief Contract, Reference Pack, Direction Contract, Prompt Pack | prompts only unless user executes |
| [Ecommerce Product Visual](ecommerce-product-visual/README.md) | Product hero, lifestyle, feature close-up, and marketplace assets | brief, references, static direction, copy, image prompting | Brief Contract, Reference Pack, Direction Contract, Copy Pack, Prompt Pack | prompt-ready plan only |
| [Video Storyboard](video-storyboard/README.md) | Video ad, launch clip, explainer, or sequence | brief, references, motion direction, storyboard, video prompting | Direction Contract, Storyboard Contract, Prompt Pack | prompts only unless user executes |
| [Storyboard Board](storyboard-board/README.md) | Board/panel artifact with locked labels, hierarchy, and image prompt constraints | storyboard, board artifact, image prompting, QA | Board Artifact Prompt, Image Prompt Contract, QA / Iteration Report | board prompt only unless user generates |
| [HyperFrames Video](hyperframes-video/README.md) | Coded-video or HTML-to-video workflow | storyboard, HyperFrames planning, render QA | HyperFrames Production Brief, Asset Manifest, QA / Iteration Report | coded-video plan unless user renders |
| [Image Prompt Pack](image-prompt-pack/README.md) | Final prompt pack for static image generation | references, direction, image prompting | Prompt Pack, Image Prompt Contract, QA / Iteration Report | no generation by default |
| [Document Workflow](document-workflow/README.md) | Structured documents, notes, or delivery docs | brief, writing, QA, delivery documentation | Brief Contract, Draft, Delivery Manifest | local artifact unless user requests delivery |
| [QA And Delivery Review](qa-delivery-review/README.md) | Review existing assets or artifacts before packaging | asset manifest, QA, delivery documentation | Asset Manifest, QA / Iteration Report, Delivery Manifest | reviews existing local artifacts only |
| [No External Execution Mode](no-provider-mode/README.md) | Planning-only workflow | route, brief, references, prompts, QA criteria | Prompt Pack and QA Criteria | explicitly stops before execution |
| [End-To-End Creative Workflow](end-to-end-creative-workflow/README.md) | Complete specimen for a creative ecommerce task | all main gates through delivery manifest | Full artifact chain | example artifacts only |

## How To Read The Examples

- Treat each example as a workflow route, not a fixed template for every task.
- For starter prompts after installation, read [Using The Kit](../docs/using-the-kit.md).
- Use the listed artifacts to understand what the next role expects.
- Treat `workflow.json` as the canonical checked route when contributing changes.
- Keep `blueprint` aligned with a section slug from [Workflow Blueprints](../.agents/skills/pipeline-core/references/workflow-blueprints.md).
- Keep provider-neutral boundaries unless the user explicitly chooses an execution path.
- Keep local preferences, display names, and output paths out of public examples.
