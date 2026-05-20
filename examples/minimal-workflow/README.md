# Minimal Workflow Example

## Purpose

Show the smallest useful FrameCore route for a simple planning task.

## Starting User Request

```text
Help me turn a rough creative idea into a clear brief and next-step plan. Do not generate assets yet.
```

## Inputs And Assumptions

- The idea is incomplete.
- The user needs structure before specialist work.
- No external tools are required.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Project State
- Brief Contract
- Delivery Manifest

## Example Output Skeleton

- confirmed goal
- excluded scope
- work mode
- brief objective
- deliverables
- constraints
- recommended next action

## QA Checklist

- Goal is clear.
- Unknowns are separated from decisions.
- Next action is specific.
- No generation or external execution occurred.

## Failure Or Loopback Case

If the user request contains multiple unrelated goals, return to `intent-confirmation` and split the work before brief creation.

## Privacy And No-Private-Content Note

Do not include private client names, local paths, secrets, generated outputs, or user-specific config.

## Related Docs And Skills

- [Quickstart](../../docs/quickstart.md)
- [Workflow Stages](../../docs/workflow-stages.md)
- [Pipeline Core](../../.agents/skills/pipeline-core/SKILL.md)
