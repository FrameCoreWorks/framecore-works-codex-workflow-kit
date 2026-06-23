# Ecommerce Product Visual Example

## Purpose

Show a provider-neutral route for planning ecommerce product visuals, marketplace images, and social product assets without executing image generation by default.

## Starting User Request

```text
Create a prompt-ready planning pack for an ecommerce product visual set: hero product image, lifestyle scene, feature close-up, and marketplace thumbnail. Do not generate images yet.
```

## Inputs And Assumptions

- Product details are generic and fictional.
- The user has not provided private product files or brand assets.
- Marketplace rules, aspect ratios, and visible text are not fully locked.
- The output should be a reusable planning and prompt pack.

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
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `copy_fit`
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Project State
- Loop State
- Brief Contract
- Reference Pack
- Direction Contract
- Copy Pack
- Prompt Pack
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- product role and buyer context
- channel matrix for hero, lifestyle, feature close-up, and marketplace thumbnail
- visual hierarchy and composition rules
- copy status for visible labels or callouts
- prompt pack with one prompt per asset type
- QA checks for product accuracy, channel fit, text policy, and privacy

## QA Checklist

- Product identity stays consistent across all image prompts.
- Each asset has a clear commercial role and channel.
- Marketplace thumbnail remains simple and inspectable.
- Lifestyle scene supports the product rather than hiding it.
- Feature close-up has a specific feature and framing rule.
- Visible text is locked before generation and follows the GPT Image 2 one-pass policy when generation is explicitly requested.
- No provider-specific endpoint, credential, or paid execution route is selected.

## Failure Or Loopback Case

If marketplace constraints are unclear, return to `brief-architect` or `reference-curator` before static direction. If visible labels or callouts are not final, return to `copy-voice` before image prompting.

## Privacy And No-Private-Content Note

Use fictional or generic product context only. Do not include private product photos, private brand files, local machine paths, customer data, credentials, or private cloud references.

## Related Docs And Skills

- [Provider-Neutral Boundary](../../docs/provider-neutral-boundary.md)
- [Text-Bearing Image Policy](../../docs/text-image-policy.md)
- [Workflow Stages](../../docs/workflow-stages.md)
- [Commercial Visual Campaign Director](../../.agents/skills/commercial-visual-campaign-director/SKILL.md)
- [Image Prompt Architect](../../.agents/skills/image-prompt-architect/SKILL.md)
