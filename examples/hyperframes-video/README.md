# HyperFrames Video Example

## Purpose

Show the coded-video planning path for HyperFrames without installing a runtime or rendering output by default.

## Starting User Request

```text
Prepare a HyperFrames production brief for a short animated product title card with captions and a simple reveal transition.
```

## Inputs And Assumptions

- The user wants coded video planning.
- Runtime setup is separate from this kit.
- Captions and overlays are planned, not rendered.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `motion-direction`
4. `storyboard-architect`
5. `copy-voice`
6. `hyperframes-producer`
7. `asset-manifest`
8. `qa-iteration`
9. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `direction_fit`
- `structure_fit`
- `copy_fit`
- `execution_manifest_fit`
- `asset_manifest_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Motion Direction Contract
- Storyboard Contract
- Copy Pack
- HyperFrames Production Brief
- Asset Manifest
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- composition goal
- scenes and durations
- GSAP timeline notes
- caption rules
- render QA criteria
- delivery caveats

## QA Checklist

- Timing is explicit.
- Captions are planned with safe margins.
- Runtime assumptions are documented.
- No external paid provider is required by the kit.

## Failure Or Loopback Case

If render constraints are missing, route back to `hyperframes-producer` before delivery.

## Privacy And No-Private-Content Note

Do not include private assets, private URLs, local render paths, or generated files.

## Related Docs And Skills

- [HyperFrames](../../docs/hyperframes.md)
- [Workflow Stages](../../docs/workflow-stages.md)
- [HyperFrames Workflow Skill](../../.agents/skills/hyperframes-workflow/SKILL.md)
