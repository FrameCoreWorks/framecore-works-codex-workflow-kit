# FrameCore Works v1.1.0

## Version

- Tag: `v1.1.0`
- Date: 2026-06-23
- Release type: minor

## Summary

FrameCore Works v1.1.0 adds Loop Protocol workflow governance to the kit. The workflow now has a public, validated loop model for non-trivial work: `brief -> checklist -> execute -> evaluate -> critique -> repair -> repeat -> stop`.

This release is for users who want stronger QA, clearer iteration control, safer repair loops, and better recovery state when creative or workflow tasks need more than one pass.

## Install And Update Notes

- project-local install compatibility: unchanged; project-local install remains the default and recommended path.
- Update behavior: existing installs can use the normal `update` path after reviewing doctor/preflight output.
- Repair behavior: `repair` remains manifest-scoped and rewrites only managed files recorded in the installed manifest.
- Uninstall behavior: unchanged; uninstall removes only manifest-recorded managed files and refuses directory removals.
- Migration notes: existing installs do not need a manual migration, but users who want Loop Protocol behavior should update their installed managed files from this release.

## Onboarding Notes

- New or changed onboarding questions: none required for Loop Protocol.
- New or changed local config fields: none.
- Defaults that changed: none.
- Optional features that remain opt-in: Memory Cache initialization, full Hipson connection intent, workflow self-improvement review, external delivery, and all provider execution remain opt-in.

## Workflow Changes

- Agent template changes: `workflow-orchestrator` now records `loop_state` and `loop_evidence_refs` for non-trivial iterative work; `qa-iteration` now reports root cause, loopback target, regression check, and stop recommendation.
- Skill changes: `pipeline-core` now includes the canonical Loop Protocol reference; `output-critic-iteration` now supports loop-aware critique and stop decisions.
- Gate, handoff, or artifact contract changes: added `loop_control_fit`, added the `Loop State` artifact, added schema and fixture coverage, and connected loop handoffs between orchestration and QA/iteration.
- Example workflow changes: public workflow examples that route through QA/iteration now declare `loop_control_fit` and `Loop State`.
- Documentation changes: added Loop Protocol user documentation and a repo integration plan, and updated workflow map, workflow stages, artifact schema docs, agent roster, included agents/skills, Memory Cache, and usage guidance.
- Validation changes: validators now check the Loop Protocol reference, required loop gate coverage, Loop State template coverage, example workflow loop coverage, and agent compliance fields.

## Validation And Package Checks

Confirm these passed before publishing:

- `npm run release:check`
- `npm run release:readiness`
- `npm run secret:scan`
- `npm run syntax:check`
- `npm run agent:check`
- `npm run package:audit`
- `npm run package:list`
- latest GitHub Actions `validate` run on `main`
- path-sensitive or manual `cross-platform` run when portability-sensitive behavior changed

## Security And Privacy Review

- No secrets, credentials, private URLs, local machine paths, private cloud IDs, generated confidential outputs, or user-specific configs are included.
- No bundled external paid execution providers, provider CLIs, endpoint catalogs, credentials, or API-key setup flows are included.
- Loop Protocol stores compact decision summaries, evidence references, stop decisions, and repair targets. It does not store raw chain-of-thought, private transcripts, secrets, or provider responses.
- The text-bearing image policy still uses native Codex/ChatGPT image generation powered by GPT Image 2.
- Full Hipson remains separate and optional; this kit ships only the lightweight adapter.

## Known Limitations

- `.codex/agents/*.toml` requires a Codex environment that supports custom-agent role files.
- Chat-only environments can use the docs and prompts, but cannot run the installer directly.
- Loop Protocol is a workflow governance layer, not a live model evaluator or automatic external execution system.
- Transactional rollback for interrupted installs remains outside this release; current recovery still uses the incomplete manifest and `doctor` signal.
- Coverage, formatter, mutation, and entropy-based secret gates remain roadmap items.

## Links

- [README](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/README.md)
- [Quickstart](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/quickstart.md)
- [Troubleshooting](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/troubleshooting.md)
- [Compatibility](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/compatibility.md)
- [Loop Protocol](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/loop-protocol.md)
- [Loop Protocol Integration Plan](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/loop-protocol-integration-plan.md)
- [Roadmap](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/roadmap.md)
- [Release Process](https://github.com/FrameCoreWorks/framecore-works-codex-workflow-kit/blob/v1.1.0/docs/release.md)
