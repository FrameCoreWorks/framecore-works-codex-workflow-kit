# Document Workflow Example

## Purpose

Show a non-media workflow for turning rough notes into a structured document draft.

## Starting User Request

```text
Turn these rough notes into a clear one-page project brief and polish the language. Keep it concise.
```

## Inputs And Assumptions

- Source notes are user-provided.
- No external research is required unless explicitly requested.
- The output is a document-ready text artifact.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `brief-architect`
4. `research-evidence`
5. `copy-voice`
6. `delivery-documentation`

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `evidence_fit`
- `copy_fit`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Brief Contract
- Evidence Note when research is needed
- Copy Pack or polished draft
- Delivery Manifest

## Example Output Skeleton

- objective
- audience
- scope
- constraints
- polished draft
- caveats and unresolved unknowns

## QA Checklist

- Draft matches the user notes.
- Unknowns are not invented.
- Tone matches onboarding preference.
- Research claims are sourced when research is requested.

## Failure Or Loopback Case

If the notes contain unresolved factual claims, route to `research-evidence` before final copy polish.

## Privacy And No-Private-Content Note

Do not include confidential notes, private links, personal data, or local file paths in examples.

## Related Docs And Skills

- [Workflow Stages](../../docs/workflow-stages.md)
- [Brief Architect](../../.agents/skills/brief-architect/SKILL.md)
- [Humanizer](../../.agents/skills/humanizer/SKILL.md)
