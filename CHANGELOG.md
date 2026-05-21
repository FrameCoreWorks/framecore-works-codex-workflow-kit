# Changelog

## Unreleased

- Added a beginner-safe guided project-local installer with checks, doctor/preflight, onboarding, post-onboarding dry-run, and final install confirmation.
- Required explicit `--confirm-global` for global installs and documented the advanced global install path separately from project-local setup.
- Added numbered backups for manifest rewrites during update/repair and documented how update, repair, uninstall, and backup preservation behave.
- Added maintainer-focused repository settings guidance for branch rulesets, optional PR/status-check mode, Actions safety, public issue hygiene, and release readiness.
- Added validation and tests for repository settings documentation so public maintenance guidance remains present and aligned with the repo safety model.
- Strengthened public issue template hygiene and validation so support, bug, docs, and feature reports warn against posting sensitive data.
- Added compatibility guidance for runtime requirements, operating systems, Codex assumptions, install modes, manifests, and support baseline.
- Added repo formatting defaults through `.editorconfig`, `.gitattributes`, and validation coverage for cross-platform line-ending consistency.
- Added public contract fixtures so every artifact schema has validated fixture coverage.
- Added machine-checked `workflow.json` manifests for all public examples.
- Added artifact schema registry validation for gate-required artifacts, templates, and example fixtures.
- Added managed file hashes to new manifests and taught `doctor` to warn about missing or changed FrameCore-managed files.
- Added a non-mutating `doctor` preflight command for checking install targets before dry-run, install, update, repair, or uninstall.
- Added non-mutating `--help` output for the main installer, onboarding, agent rendering, validation, privacy audit, and AppleDouble cleanup scripts.
- Added release readiness documentation, a non-publishing release-check workflow, install support issue intake, and validation coverage for release governance files.
- Hardened repo path resolution for cross-platform Node execution and expanded CI to Linux, macOS, and Windows on Node 20 and 22.
- Hardened project-local install ownership, uninstall path validation, and user-owned file protection.
- Clarified native Codex/ChatGPT GPT Image 2 policy for text-bearing raster graphics.
- Improved onboarding explanation and default role-name flow.
- Added public repository health files, issue templates, pull request template, package metadata, and stronger CI checks.
- Added deeper quickstart, troubleshooting, architecture, workflow stages, structured examples, and an end-to-end creative workflow specimen.
- Expanded all core `SKILL.md` files into operational contracts with inputs, outputs, process, decision rules, guardrails, handoffs, and QA checklists.
- Added validation and tests that reject stub skills, missing skill contract sections, and frontmatter name drift.
- Strengthened privacy audit coverage for cross-platform local paths, secret-bearing filenames, credential-shaped values, and private cloud references.
- Replaced fragile gate and handoff string checks with structured Markdown table validation for workflow registry files.
- Added config validation before rendering or installation, removed dead `install_scope` config emission, and split `update` from manifest-only `repair` behavior.

## 0.1.0 - 2026-05-20

- Initial public scaffold for FrameCore Works Skill Kit.
- Adds provider-neutral role-based agents, skills, onboarding, validation, privacy audit, Humanizer, HyperFrames workflow knowledge, Hipson Adapter, and workflow self-improvement governance.
