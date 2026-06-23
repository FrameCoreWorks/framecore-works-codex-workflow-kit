# Image Prompt Pack Example

## Purpose

Show the minimum inputs needed before writing final image prompts.

## Starting User Request

```text
Turn this approved brief and direction into a clean image prompt pack. Do not generate images.
```

## Inputs And Assumptions

- Brief, references, direction, and copy are already locked.
- The output is prompt text and QA criteria.
- Visible text is either absent or exactly locked.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `image-prompting`
4. `qa-iteration`
5. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Prompt Pack
- Image Prompt Contract when visible text is required
- Loop State
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- final prompt
- exact visible copy if applicable
- negative constraints
- expected observables
- acceptance criteria
- QA checks

## QA Checklist

- Prompt uses the approved brief and direction only.
- No unsupported claims are introduced.
- Text-bearing raster rules are stated when relevant.
- Prompt is provider-neutral unless the user chooses a tool separately.

## Failure Or Loopback Case

If the prompt cannot be evaluated against a direction contract, return to `workflow-orchestrator` or the missing upstream specialist.

## Privacy And No-Private-Content Note

Do not include private reference files, local paths, credentials, or generated output URLs.

## Related Docs And Skills

- [Text-Bearing Image Policy](../../docs/text-image-policy.md)
- [Image Prompt Architect](../../.agents/skills/image-prompt-architect/SKILL.md)
- [End-To-End Creative Workflow Example](../end-to-end-creative-workflow/README.md)
