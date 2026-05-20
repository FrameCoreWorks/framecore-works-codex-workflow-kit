# Examples Index

Use these examples to choose the smallest workflow path that fits the task. Each example shows the expected stages, produced artifacts, and where the workflow stops when no external execution is requested.

Each example directory includes a `workflow.json` manifest. The manifest is the machine-checked contract for the route, gates, artifacts, declared handoffs, and execution boundary. README files explain the workflow for humans; `npm run validate` checks the manifests against the role roster, gate registry, handoff matrix, and artifact schemas.

Additional minimal contract fixtures live under `contract-fixtures/artifacts/`. They are validation fixtures for artifact schemas, not full workflow examples.

| Example | Use Case | Main Stages | Typical Artifacts | Execution Boundary |
| --- | --- | --- | --- | --- |
| [Minimal Workflow](minimal-workflow/README.md) | Small planning task or first install check | intent, route, brief | Task Confirmation, Brief Contract | stops at planning |
| [Static Campaign](static-campaign/README.md) | Ecommerce, social, launch, or product visuals | brief, references, static direction, image prompting | Brief Contract, Reference Pack, Direction Contract, Prompt Pack | prompts only unless user executes |
| [Video Storyboard](video-storyboard/README.md) | Video ad, launch clip, explainer, or sequence | brief, references, motion direction, storyboard, video prompting | Direction Contract, Storyboard Contract, Prompt Pack | prompts only unless user executes |
| [HyperFrames Video](hyperframes-video/README.md) | Coded-video or HTML-to-video workflow | storyboard, HyperFrames planning, render QA | HyperFrames Production Brief, Asset Manifest, QA / Iteration Report | coded-video plan unless user renders |
| [Image Prompt Pack](image-prompt-pack/README.md) | Final prompt pack for static image generation | references, direction, image prompting | Prompt Pack, Image Prompt Contract, QA / Iteration Report | no generation by default |
| [Document Workflow](document-workflow/README.md) | Structured documents, notes, or delivery docs | brief, writing, QA, delivery documentation | Brief Contract, Draft, Delivery Manifest | local artifact unless user requests delivery |
| [No External Execution Mode](no-provider-mode/README.md) | Planning-only workflow | route, brief, references, prompts, QA criteria | Prompt Pack and QA Criteria | explicitly stops before execution |
| [End-To-End Creative Workflow](end-to-end-creative-workflow/README.md) | Complete specimen for a creative ecommerce task | all main gates through delivery manifest | Full artifact chain | example artifacts only |

## How To Read The Examples

- Treat each example as a workflow route, not a fixed template for every task.
- Use the listed artifacts to understand what the next role expects.
- Treat `workflow.json` as the canonical checked route when contributing changes.
- Keep provider-neutral boundaries unless the user explicitly chooses an execution path.
- Keep local preferences, display names, and output paths out of public examples.
