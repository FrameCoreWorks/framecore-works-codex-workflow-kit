# Video Storyboard Example

## Purpose

Show how a motion idea becomes storyboard and video prompt planning without immediate video generation.

## Starting User Request

```text
Prepare a six-shot storyboard and video prompt pack for a short product reveal clip. Keep it provider-neutral.
```

## Inputs And Assumptions

- Product and audience are known at category level.
- Timing is approximate.
- No video model or external tool has been selected.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. `motion-direction`
6. `storyboard-architect`
7. `copy-voice`
8. `video-prompting`
9. `qa-iteration`
10. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `brief_completeness`
- `reference_authority_fit`
- `direction_fit`
- `structure_fit`
- `copy_fit`
- `promptability_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Motion Direction Contract
- Storyboard Contract
- Copy Pack
- Video Prompt Pack
- Loop State
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- motion thesis
- scene beats
- shot cards
- timing notes
- continuity locks
- video prompts
- QA criteria

## QA Checklist

- Each shot advances the reveal.
- Camera movement is feasible and specific.
- Product continuity is preserved.
- Prompt pack does not imply provider execution.

## Failure Or Loopback Case

If the storyboard lacks continuity anchors, return to `storyboard-architect` before video prompting.

## Privacy And No-Private-Content Note

Do not include private footage, private reference links, credentials, or local paths.

## Related Docs And Skills

- [Workflow Stages](../../docs/workflow-stages.md)
- [Video Prompt Architect](../../.agents/skills/video-prompt-architect/SKILL.md)
- [Storyboard Director](../../.agents/skills/storyboard-director/SKILL.md)
