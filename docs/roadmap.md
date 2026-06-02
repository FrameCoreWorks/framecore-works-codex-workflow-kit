# Roadmap

## Purpose

This roadmap explains the current scope, known limitations, likely next work, and non-goals for FrameCore Works Skill Kit.

It is a planning guide for maintainers and contributors. It is not an automatic release promise.

## Current Scope

The current kit focuses on a provider-neutral Codex workflow baseline:

- project-local installation by default
- guided installer, doctor/preflight, onboarding, dry-run, update, repair, and uninstall flows
- role-based Codex agent templates
- operational skill contracts for creative workflow stages
- workflow gates, handoffs, artifact schemas, and validated examples
- Humanizer, HyperFrames workflow knowledge, lightweight Hipson Adapter, and explicit workflow self-improvement governance
- privacy audit, package audit, release checks, and public repo hygiene

## Known Limitations

- Custom-agent spawning depends on the local Codex environment. The installed instructions and skills remain useful without spawning, but routed subagent execution depends on local support.
- Artifact schemas are lightweight contract checks, not full formal JSON Schema validation for every artifact paragraph.
- Cross-platform coverage is split between the default Linux validation workflow and a path-sensitive cross-platform workflow that also supports manual dispatch.
- The Hipson Adapter is lightweight by default. Full Hipson remains separate and optional.
- The kit does not ship external paid execution providers, provider credentials, endpoint catalogs, private cloud delivery settings, generated outputs, or private project context.

## Near-Term Priorities

- Keep project-local installation safer and easier to understand.
- Improve onboarding explanations without adding private defaults.
- Expand validated public examples for common creative workflow paths.
- Keep artifact contracts, gate coverage, and handoff continuity machine-checked.
- Keep package contents, privacy audit, release checks, issue templates, and repository settings aligned with public-source safety.

## Future Candidates

Potential future work:

- richer example packs for ecommerce graphics, storyboard planning, coded video, and document workflows
- more granular artifact fixtures and validation coverage
- migration helpers for older installed manifests
- optional team-sharing guidance for local configuration
- deeper HyperFrames planning examples
- clearer adapter boundaries for optional full Hipson usage
- bundle-readiness mapping for future Codex plugin or package shapes, without changing the current project-local install flow

## v1.0 Readiness

Before a v1.0 release, maintainers should follow [v1.0 Readiness](v1-readiness.md) and confirm:

- installation, update, repair, and uninstall behavior are stable across supported operating systems
- onboarding copy is clear for beginner users
- public examples cover the main workflow paths
- privacy and package audits block sensitive or unintended files
- release notes, compatibility docs, and repository settings match current behavior
- no bundled external paid execution provider integration is required for the default workflow

## Non-Goals

This repo should not become:

- a paid media-provider integration bundle
- a credential or API-key setup system
- a private project context package
- a generated output archive
- a replacement for separate full Hipson development
- a global install requirement for every user

## Release Discipline

Every roadmap item that changes user-visible behavior should update:

- `CHANGELOG.md`
- relevant docs
- examples when workflow behavior changes
- validation or tests when a new contract becomes required

Release work should keep the public kit provider-neutral, project-local by default, and free of private user context.
