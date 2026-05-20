# Static Campaign Example

## Purpose

Show a provider-neutral route for planning static campaign visuals before any image generation.

## Starting User Request

```text
Create a visual direction and prompt pack for three static ecommerce campaign images for a compact desk accessory. Do not generate the images yet.
```

## Inputs And Assumptions

- Product category is generic.
- Final aspect ratios and exact visible copy are not locked.
- The output should be a prompt-ready planning pack.

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

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `copy_fit`
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Brief Contract
- Reference Pack
- Direction Contract
- Copy Pack
- Prompt Pack
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- campaign thesis
- asset matrix
- exact copy status
- prompt for hero image
- prompt for lifestyle image
- prompt for detail image
- QA checks per prompt

## QA Checklist

- Prompts map to campaign objectives.
- Product remains visible and legible.
- Text-bearing raster graphics use the native Codex/ChatGPT GPT Image 2 path when generation is explicitly requested.
- No provider-specific endpoint or paid execution route is selected.

## Failure Or Loopback Case

If exact visible copy is missing, return to `copy-voice` before image prompting.

## Privacy And No-Private-Content Note

Use fictional or generic product context only. Do not include private references, local paths, credentials, or client materials.

## Related Docs And Skills

- [Text-Bearing Image Policy](../../docs/text-image-policy.md)
- [Workflow Stages](../../docs/workflow-stages.md)
- [Image Prompt Architect](../../.agents/skills/image-prompt-architect/SKILL.md)
