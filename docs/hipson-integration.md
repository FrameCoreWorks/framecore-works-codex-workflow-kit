# Hipson Integration

## Purpose

This kit includes a lightweight Hipson Adapter so Codex can prepare structured research maps and instruction packets without requiring the full Hipson system. The adapter is part of the local creative workflow layer: it helps describe what an agent should inspect, produce, avoid, and hand off next.

The adapter is useful when a task is too messy for a direct prompt but does not yet need external repo scanning, sidecar agents, or a larger Hipson knowledge base.

## Adapter Scope

The included adapter supports:

- research maps
- internet mapping packets
- bounded instruction packets for pipeline agents
- review packets
- execution packets
- handoff support inside this workflow architecture

These packets are text artifacts. They do not run external tools, call providers, upload files, or mutate the user's workspace by themselves.

## Full Hipson Boundary

Full Hipson remains separate and optional.

Canonical optional repository:

https://github.com/Hipson47/Hipson.git

The bundled adapter does not clone, install, or activate full Hipson. It only explains where the optional full system lives and how the local adapter can hand work to a future full Hipson setup.

If a user later connects the full Hipson repository, the workflow can expand into repo scanning, delta scans, sidecar review agents, full Hipson knowledge packs, cross-repo orchestration, CLI commands, and complete Hipson workflow assets.

## Onboarding Behavior

During onboarding, Codex should explain the difference between the adapter and full Hipson in plain language:

- the adapter is included now
- the full repository is optional
- the full repository is not cloned or installed during default setup
- expansion should happen only after the user explicitly asks for it

The default answer should keep the lightweight adapter enabled and leave full Hipson disconnected.

## Packet Types

A Hipson Adapter packet should include:

- target agent or role ID
- goal
- available context
- exclusions
- source or evidence rules
- acceptance criteria
- output schema
- handoff target

Research maps should focus on what must be checked and why. Review packets should focus on pass/fail criteria and risk. Execution packets should stay bounded to the requested local action.

## Privacy Rules

Hipson Adapter packets must not include secrets, provider keys, private cloud folder IDs, local absolute paths, personal email addresses, or private project context unless the user has explicitly put that context into the current workspace for this task.

Packets should prefer neutral role IDs and repo-relative paths. If a packet needs sensitive context, Codex should ask the user to provide a safe local summary instead of copying private source material into reusable templates.

## Validation

The release gate checks that this document keeps the adapter boundary, full Hipson link, onboarding behavior, packet contract, and privacy rules visible. This prevents the public kit from silently turning the adapter into an installer for a separate system.

## Related Docs

- [Workflow Map](workflow-map.md)
- [Hipson Adapter Packets Example](../examples/hipson-adapter-packets/README.md)
- [Included Agents And Skills](included-agents-and-skills.md)
