# QA And Delivery Review Example

## Purpose

Show the shortest route for reviewing existing files or workflow artifacts, creating traceability, deciding what is accepted, and preparing delivery notes.

Use this when the user already has assets, drafts, prompt packs, storyboard boards, coded-video renders, or documentation artifacts and needs quality review rather than new creative direction.

## Starting User Request

```text
Review these existing campaign assets, identify what is ready, list what needs correction, and prepare a delivery manifest. Do not generate new media or upload anything.
```

## Inputs And Assumptions

- The user provides existing files, artifact names, or a local folder summary.
- The work starts from review and packaging, not from concept creation.
- The user wants a clear accept/reject list, caveats, and next actions.
- No external execution, upload, publishing, or provider route is requested.

## Agent Route

1. `intent-confirmation`
2. `workflow-orchestrator`
3. `asset-manifest`
4. `qa-iteration`
5. `delivery-documentation`

Loop back to the source role only when QA finds a fix that belongs to a specific upstream artifact, such as prompt wording, storyboard structure, copy tone, or render instructions.

## Gate Sequence

- `intent_lock`
- `workflow_route`
- `loop_control_fit`
- `asset_manifest_fit`
- `post_execution_fit`
- `delivery_fit`

## Artifacts Produced

- Task Confirmation
- Project State
- Loop State
- Asset Manifest
- QA / Iteration Report
- Delivery Manifest

## Example Output Skeleton

- confirmed review goal
- excluded actions, such as generation and upload
- file or artifact inventory
- accepted assets
- rejected or held assets
- defects and severity
- correction route for each defect
- final delivery manifest
- caveats and known limitations

## QA Checklist

- Every reviewed file or artifact has a traceability note.
- Accepted assets have explicit acceptance criteria.
- Rejected assets have a concrete reason and next action.
- Delivery notes do not hide unresolved defects.
- No upload, publishing, generation, or external execution occurred.
- Private paths, credentials, emails, and private cloud references are not included in the public artifact.

## Failure Or Loopback Case

If QA finds that the issue comes from a source artifact, loop back to the owning role instead of editing the delivery note around the problem.

Examples:

- weak image prompt: return to `image-prompting`
- unclear storyboard timing: return to `storyboard-architect`
- copy tone mismatch: return to `copy-voice`
- missing file traceability: return to `asset-manifest`

## Privacy And No-Private-Content Note

Use generic file labels in public examples. Do not include private client names, local absolute paths, emails, private cloud links, generated confidential output, credentials, or user-specific config.

## Related Docs And Skills

- [Workflow Blueprints](../../.agents/skills/pipeline-core/references/workflow-blueprints.md)
- [Artifact Schemas](../../docs/artifact-schemas.md)
- [Team Configuration](../../docs/team-configuration.md)
- [Asset Manifest Skill](../../.agents/skills/asset-manifest/SKILL.md)
- [Output Critic Iteration Skill](../../.agents/skills/output-critic-iteration/SKILL.md)
- [Delivery Documentation Skill](../../.agents/skills/delivery-documentation/SKILL.md)
