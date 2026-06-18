# Hipson Adapter Packets Example

## Purpose

This example shows how the lightweight Hipson Adapter fits into the FrameCore Works workflow when a task needs a bounded research map, review packet, or instruction packet but does not need the full external Hipson system.

Use this when a user has a messy research, review, or execution-planning request and Codex needs to convert it into a safe packet for another workflow role.

## Starting User Request

```text
Create a bounded review packet for checking whether my planned ecommerce image prompt pack is ready for QA. Do not run external tools and do not install full Hipson.
```

## Inputs And Assumptions

- The user wants structured packet planning, not provider execution.
- The lightweight `hipson-adapter` skill is available from this kit.
- Full Hipson is not cloned, installed, or activated.
- No private URLs, credentials, raw transcripts, provider responses, local absolute paths, or user-specific workspace context are copied into reusable source.
- The packet should be written as a local text artifact or final answer unless the user explicitly asks to save files.

## Agent Route

1. `intent-confirmation` locks the goal, exclusions, work mode, expected output, and immediate next step.
2. `workflow-orchestrator` chooses a document/text route with an added packet step.
3. `brief-architect` turns the request into a Brief Contract.
4. `instruction-packet-factory` uses the Hipson Adapter pattern to create the bounded packet.
5. `research-evidence` verifies only the stated evidence questions if the packet needs source-backed checks.
6. `copy-voice` makes the packet readable without weakening locked facts or exclusions.
7. `delivery-documentation` packages the packet and caveats for the user.

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `brief_completeness`
- `instruction_packet_fit`
- `evidence_fit`
- `copy_fit`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Project State
- Brief Contract
- Instruction Packet
- Evidence Note
- Copy Pack
- Delivery Manifest

## Example Output Skeleton

```md
# Bounded Review Packet

- packet_id: hipson-review-packet-example
- target_role: qa-iteration
- packet_type: review_packet
- goal: Review whether the prompt pack is ready for QA.
- context: Brief summary of the prompt pack and acceptance criteria.
- exclusions:
  - Do not run external tools.
  - Do not install full Hipson.
  - Do not use provider APIs.
  - Do not upload files.
- source_rules:
  - Use only user-provided public or local-safe context.
  - Mark unverifiable claims as unresolved.
- acceptance_criteria:
  - The packet has a clear target role.
  - The review questions are bounded.
  - The stop condition is explicit.
- output_schema:
  - findings
  - risks
  - pass_or_loopback
  - next_handoff
- handoff_to: qa-iteration
```

## QA Checklist

- Packet target role is explicit.
- Packet type is one of: research map, internet mapping packet, bounded instruction packet, review packet, or execution packet.
- Goal, exclusions, evidence rules, acceptance criteria, output schema, and handoff target are present.
- The packet does not imply full Hipson installation.
- The packet does not imply sidecar agents, external execution, provider calls, uploads, or workspace mutation.
- Sensitive context is excluded or summarized safely.

## Failure Or Loopback Case

Loop back to `instruction-packet-factory` if the packet lacks a target role, clear output schema, acceptance criteria, stop condition, or explicit exclusions.

Loop back to `brief-architect` if the user goal is too broad to packetize safely.

Stop and ask the user if they request full Hipson setup, sidecar review agents, external repo scanning, uploads, provider execution, API keys, or destructive changes.

## Privacy And No-Private-Content Note

This example is public and contains no private project names, private URLs, credentials, provider keys, raw transcripts, local absolute paths, customer data, or cloud folder IDs.

Hipson Adapter packets should prefer neutral role IDs, public-safe summaries, repo-relative paths, and explicit exclusions. Full Hipson remains separate and optional.

## Related Docs And Skills

- [Workflow Map](../../docs/workflow-map.md)
- [Hipson Integration](../../docs/hipson-integration.md)
- [Included Agents And Skills](../../docs/included-agents-and-skills.md)
- [Agent Roster](../../docs/agent-roster.md)
- [Example Authoring](../../docs/example-authoring.md)
- `.agents/skills/hipson-adapter/SKILL.md`
- `.agents/skills/instruction-packet-factory/SKILL.md`
- `.agents/skills/pipeline-core/references/handoff-matrix.md`
