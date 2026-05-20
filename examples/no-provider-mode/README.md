# No External Execution Mode

## Purpose

Show how the kit remains useful when the user does not want external execution tools.

## Starting User Request

```text
Plan the creative workflow and prepare prompts, QA criteria, and delivery notes, but do not run any external tools.
```

## Inputs And Assumptions

- Planning is allowed.
- External execution is not allowed.
- Outputs are workflow artifacts only.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `reference-curator`
5. direction role as needed
6. `copy-voice`
7. prompt role as needed
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

- workflow route
- locked assumptions
- planned prompts
- QA criteria
- execution caveats
- delivery notes

## QA Checklist

- No external tool is selected.
- No provider credentials are requested.
- No generated assets are claimed.
- Prompt and QA artifacts are usable later if the user chooses a tool.

## Failure Or Loopback Case

If the user later asks for execution, route through `tool-routing-cost` before any execution manifest.

## Privacy And No-Private-Content Note

Do not include private provider setup, secrets, local output folders, or generated media in this example.

## Related Docs And Skills

- [Architecture](../../docs/architecture.md)
- [Workflow Stages](../../docs/workflow-stages.md)
- [Pipeline Core](../../.agents/skills/pipeline-core/SKILL.md)
