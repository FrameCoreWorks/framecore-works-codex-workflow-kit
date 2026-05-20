# Changelog

## Unreleased

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
