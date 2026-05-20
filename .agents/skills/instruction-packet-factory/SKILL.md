---
name: instruction-packet-factory
description: Use this skill to create bounded instruction packets, research maps, internet mapping packets, review packets, and execution packets for role-based workflow agents.
---

# Instruction Packet Factory

Use this skill to create bounded instruction packets for workflow roles. It converts routing intent into a compact, testable packet with target role, goal, context, exclusions, evidence rules, acceptance criteria, output schema, and handoff target.

## When To Use

Use this skill when:

- `workflow-orchestrator` needs to delegate a bounded task to a role.
- A research map, review packet, execution packet, or specialist instruction needs clear acceptance criteria.
- The next role should not reconstruct context from the entire conversation.

Do not use this skill to replace orchestration, perform full research by default, or write final image or video prompt packs.

## Inputs

Required:

- `target_role`: the role ID receiving the packet.
- `packet_type`: instruction, research map, review, or execution packet.
- `goal`: the concrete result the receiver must produce.
- `context`: only the context needed for that receiver.
- `exclusions`: what the receiver must avoid.

Optional:

- `source_rules`: allowed evidence, docs, or local files.
- `acceptance_criteria`: how the packet output will be checked.
- `output_schema`: required shape of the receiver's response or artifact.

## Outputs

Produce an Instruction Packet with:

- packet ID and target role
- packet type and goal
- context summary and exclusions
- required inputs and method
- evidence or source rules
- acceptance criteria
- output schema
- handoff target

## Process

1. Confirm the packet belongs to a known role.
2. Remove context the receiving role does not need.
3. Put exclusions before the method so boundaries are visible.
4. Define acceptance criteria and output schema before handoff.
5. Return the packet to orchestration or directly to the target role when routed.

## Decision Rules

- If the target role is unknown, route back to `workflow-orchestrator`.
- If the task needs deep research, create a research map rather than pretending the packet verifies facts.
- If execution is involved, require explicit approval and an execution manifest path.
- Prefer one packet per role and outcome.

## Guardrails

- Do not execute tools, upload files, or run provider workflows.
- Do not include private context, secrets, local paths, or unapproved source data.
- Do not write final prompts when prompt roles own that output.
- Do not make the packet broad enough to bypass review gates.

## Handoff

Review gate: `instruction_packet_fit`.

Hand off with:

- `packet_id`
- `target_role`
- `goal`
- `source_rules`
- `acceptance_criteria`
- `output_schema`
- `handoff_target`

## QA Checklist

- Target role and goal are unambiguous.
- Context is minimal and sufficient.
- Exclusions are explicit.
- Acceptance criteria are testable.
- Output schema is concrete.
- The packet does not replace specialist ownership or review gates.
