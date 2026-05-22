# Storyboard Board Example

## Purpose

Show how a text storyboard becomes a board/panel artifact plan with locked labels, board text, visual hierarchy, and image-prompting constraints.

## Starting User Request

```text
Prepare a four-panel storyboard board prompt for a product reveal sequence. Keep all board labels exact and stop before image generation.
```

## Inputs And Assumptions

- The product category, audience, and key reveal moment are known.
- A storyboard board is needed for planning or review, not as an executed final image.
- Any visible panel labels, captions, or board text must be locked before image prompting.
- No external execution tool or paid provider has been selected.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `motion-direction`
6. `storyboard-architect`
7. `storyboard-board-architect`
8. `image-prompting`
9. `qa-iteration`
10. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `structure_fit`
- `storyboard_board_fit`
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Project State
- Brief Contract
- Reference Pack
- Direction Contract
- Storyboard Contract
- Board Artifact Prompt
- Image Prompt Contract
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- panel count and aspect ratio
- panel-by-panel shot labels
- exact board text and label hierarchy
- safe margins and caption placement
- visual continuity anchors
- image prompt contract
- QA criteria for text legibility and panel consistency

## QA Checklist

- Panel count matches the locked storyboard structure.
- Every visible label is exact, short, and assigned to one panel.
- Board text is generated in one pass if the board is requested as a static raster graphic.
- Safe margins leave room for labels without covering key visual content.
- Image prompting does not imply execution unless the user explicitly asks for generation.

## Failure Or Loopback Case

If the board prompt has unclear panel order, missing labels, or text that is too long for a clean static raster graphic, return to `storyboard-board-architect` before image prompting.

## Privacy And No-Private-Content Note

Use generic product and shot labels in public examples. Do not include private references, confidential campaign details, credentials, local paths, generated media, or private cloud links.

## Related Docs And Skills

- [Workflow Stages](../../docs/workflow-stages.md)
- [Agent Roster](../../docs/agent-roster.md)
- [Text-Bearing Image Policy](../../docs/text-image-policy.md)
- [Storyboard Board Architect](../../.agents/skills/storyboard-board-architect/SKILL.md)
- [Image Prompt Architect](../../.agents/skills/image-prompt-architect/SKILL.md)
