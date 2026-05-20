# End-To-End Creative Workflow Example

## Purpose

This example shows how FrameCore Works can structure a neutral ecommerce creative task from first intent confirmation to delivery notes without external provider execution.

## Starting User Request

```text
Create a provider-neutral prompt pack and QA plan for a set of ecommerce visuals promoting a compact modular desk lamp. I need a clean hero image, two lifestyle variants, and a short storyboard idea for a product reveal clip. Do not generate assets yet.
```

## Inputs And Assumptions

- Product: compact modular desk lamp.
- Audience: remote workers, students, small-space apartment users.
- Deliverables: prompt pack, QA criteria, and delivery manifest.
- Execution mode: planning only, no external provider runs.
- Text-bearing raster graphics: use the native Codex/ChatGPT GPT Image 2 path only when image generation is explicitly requested.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `static-direction`
6. `copy-voice`
7. `image-prompting`
8. `qa-iteration`
9. `delivery-documentation`

## Gate Sequence

| Gate | Artifact |
| --- | --- |
| `intent_lock` | [Task Confirmation](artifacts/task-confirmation.md) |
| `brief_completeness` | [Brief Contract](artifacts/brief-contract.md) |
| `reference_authority_fit` | [Reference Pack](artifacts/reference-pack.md) |
| `direction_fit` | [Direction Contract](artifacts/direction-contract.md) |
| `promptability_fit` | [Prompt Pack](artifacts/prompt-pack.md) |
| `post_execution_fit` | [QA / Iteration Report](artifacts/qa-iteration-report.md) |
| `delivery_fit` | [Delivery Manifest](artifacts/delivery-manifest.md) |

## Artifacts Produced

- `artifacts/task-confirmation.md`
- `artifacts/brief-contract.md`
- `artifacts/reference-pack.md`
- `artifacts/direction-contract.md`
- `artifacts/prompt-pack.md`
- `artifacts/qa-iteration-report.md`
- `artifacts/delivery-manifest.md`

## Example Output Skeleton

The workflow should produce locked decisions before prompt writing:

- confirmed goal and exclusions
- clear audience and deliverable matrix
- reference roles and suppression rules
- static direction thesis
- copy and text constraints
- prompt pack with acceptance criteria
- QA notes and delivery caveats

## QA Checklist

- Every prompt maps back to a brief objective.
- Every visual reference has a role, not just a mood label.
- Exact visible text is either locked or intentionally absent.
- No external provider is selected or invoked.
- Delivery manifest distinguishes final files from planning artifacts.

## Failure Or Loopback Case

If the brief lacks product dimensions, target aspect ratios, or required visible copy, route back to `brief-architect` before prompt writing. If a prompt introduces claims not present in the brief, route back to `copy-voice` or `static-direction`.

## Privacy And No-Private-Content Note

This example uses a fictional generic product category. It does not include private brands, local paths, emails, credentials, generated outputs, or paid provider setup.

## Related Docs And Skills

- [Quickstart](../../docs/quickstart.md)
- [Architecture](../../docs/architecture.md)
- [Text-Bearing Image Policy](../../docs/text-image-policy.md)
- [Pipeline Core](../../.agents/skills/pipeline-core/SKILL.md)
- [Image Prompt Architect](../../.agents/skills/image-prompt-architect/SKILL.md)
