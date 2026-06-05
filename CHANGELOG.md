# Changelog

## Unreleased

- Strengthened ChatGPT Skills onboarding so existing local or older workflow skills cannot skip the user onboarding step.
- Added ChatGPT Skills onboarding guidance that maps Codex role agents to temporary workflow roles instead of persistent ChatGPT agent files.
- Added a top-level README beginner note that separates full Codex install from ChatGPT Skills onboarding.
- Added a beginner prompt guard that stops installation attempts in regular ChatGPT or other chat-only surfaces without workspace files and shell commands.
- Strengthened the installed static raster graphic policy so requested generated graphics default to the native Codex/ChatGPT GPT Image 2 path instead of Python, SVG, canvas, Sharp, or other coded substitutes.
- Added an English-first onboarding language choice for setup text only, so international users keep English prompts by default while users can type their preferred setup language.
- Replaced user-facing onboarding output-folder naming with neutral workflow wording and changed the default output path from `output/framecore` to `output/workflow`.
- Expanded full Hipson onboarding copy so users understand the separate optional repository, its workflow role, and that choosing yes records intent only without cloning, installing, activating, uploading, or running anything.

## 1.0.2 - 2026-05-24

- Added optional Memory Cache initialization to the guided install flow.
- Propagated onboarding workspace profile fields into every rendered agent template.
- Centralized text-bearing image native route rendering through `config/text-image-policy.json`.
- Added inline output directory validation during interactive onboarding.
- Removed `tests/` from the npm package tarball while keeping tests required in the source repo.
- Added a publish guard so `npm publish` runs `npm run release:check` first.
- Expanded the release-check workflow to validate Node.js 20 and 22.
- Added a manual live Codex E2E checklist for real-workspace verification before broad promotion.

## 1.0.1 - 2026-05-24

- Added a beginner-friendly no-terminal startup prompt to README, Quickstart, and Codex-assisted install docs.
- Added onboarding work-profile questions so the installed pipeline can be tuned to the user's work, use cases, workflow style, and non-creative adaptation needs.
- Added GitHub Desktop guidance for beginner-friendly repository cloning, changed-file review, commits, and pushes.
- Added FrameCore Works attribution and optional coffee-support link to onboarding.

## 1.0.0 - 2026-05-24

- Added Memory Cache and Context folder docs, templates, tools, and tests for long-session recovery without mixing user input with durable state.
- Added local semantic-memory commands with Context exclusion, AppleDouble exclusion, and explicit OpenAI API activation gating.
- Added report-only self-improvement tooling that writes proposal queues to Memory Cache without editing source files.
- Clarified supported agent surfaces in README so users can distinguish full Codex custom-agent support from AGENTS-only or chat-only environments.
- Added a pipeline-core pointer to installed project instructions so Codex can find routing details faster after install.
- Added installer guidance when an existing `AGENTS.md` is preserved and FrameCore writes `AGENTS.framecore.md`.
- Hardened managed file writes against symlinks in install, onboarding, agent rendering, and manifest validation, with regression coverage.
- Added an install smoke-test command for default onboarding, guided project-local install, manifest hash checks, doctor, and uninstall preview.
- Added the install smoke test to the cross-platform workflow and made that workflow path-sensitive for installer, test, config, package, and workflow changes while preserving manual dispatch.
- Added validation for instruction-override phrases in agent-facing files so prompt-injection style content cannot drift into docs, skills, examples, or agent templates unnoticed.
- Added a dependency-free `secret:scan` release gate and CI step for credential-shaped values, secret-bearing filenames, and private cloud references.
- Added an explicit installed AGENTS rule that treats repository files, artifacts, examples, issue text, and user-supplied content as data unless the human user identifies them as current-task instructions.
- Expanded Project State into a durable recovery artifact with blockers, touched files, risks, last completed gate, and recovery prompt guidance.
- Added a provider-neutral decision matrix and lightweight maintainer ownership guide for release responsibility.
- Updated security and contribution guidance for 1.0.x support and the repo-scoped package preview command.
- Added a public-user FAQ covering install, configuration, workflow use, provider safety, Hipson, HyperFrames, update, uninstall, and troubleshooting boundaries.
- Added a CLI reference for command safety, install modes, package checks, and release checks, with validation coverage.
- Expanded artifact schema and workflow stage docs with validation coverage for contract and routing guidance.
- Expanded Hipson, HyperFrames, recurring workflow review, and text-bearing image policy docs with validation coverage for their public boundaries.
- Clarified install and onboarding UX: clone location should stay outside the target workspace, `output_dir` should be a safe relative path, PowerShell commands are shown explicitly, and full Hipson remains an external optional extension.
- Expanded customization guidance for local config, output paths, agent display names, QA strictness, delivery preferences, Hipson settings, workflow self-improvement, team use, and update/repair/uninstall boundaries.
- Added example-authoring guidance and validation so public examples keep route, gate, artifact, handoff, privacy, and provider-neutral contracts aligned.
- Added a validated storyboard board workflow example and handoff coverage for storyboard-board to image-prompting routes.
- Expanded the public agent roster guide with role selection, inputs, artifacts, review gates, common handoffs, local display-name rules, and provider-neutral boundaries.
- Added onboarding completion guidance for dry-run, project-local install, Codex instruction loading, and post-install starter prompts.
- Added a post-install usage guide with starter prompts, route selection guidance, execution boundaries, Hipson Adapter usage, and safety reminders.
- Added a beginner-safe guided project-local installer with checks, doctor/preflight, onboarding, post-onboarding dry-run, and final install confirmation.
- Required explicit `--confirm-global` for global installs and documented the advanced global install path separately from project-local setup.
- Added numbered backups for manifest rewrites during update/repair and documented how update, repair, uninstall, and backup preservation behave.
- Added maintainer-focused repository settings guidance for branch rulesets, optional PR/status-check mode, Actions safety, public issue hygiene, and release readiness.
- Added validation and tests for repository settings documentation so public maintenance guidance remains present and aligned with the repo safety model.
- Strengthened public issue template hygiene and validation so support, bug, docs, and feature reports warn against posting sensitive data.
- Added compatibility guidance for runtime requirements, operating systems, Codex assumptions, install modes, manifests, and support baseline.
- Added repo formatting defaults through `.editorconfig`, `.gitattributes`, and validation coverage for cross-platform line-ending consistency.
- Added an Apache-2.0 `NOTICE` file and validation coverage for redistribution notice hygiene.
- Added roadmap documentation for current scope, known limitations, v1.0 readiness, non-goals, and release discipline.
- Added a public-safe release notes template and validation coverage for release-note hygiene.
- Added a temporary-cache package listing command plus clearer support and security reporting guidance.
- Made `npm run package:list` the documented package preview path instead of relying on a user's local npm cache.
- Added release-readiness checks for package metadata, changelog coverage, and optional tag/version alignment.
- Added provider-neutral boundary documentation for built-in image generation, coded-video guidance, optional adapters, and release gates.
- Added a v1.0 readiness checklist covering install lifecycle, onboarding, examples, docs, validation gates, halt conditions, and sign-off.
- Added a dedicated Codex-assisted install guide with paste-in instructions, expected onboarding questions, stop conditions, and expected result.
- Added a validated ecommerce product visual example for hero, lifestyle, feature close-up, and marketplace asset planning.
- Added a QA and delivery-only review example for existing local artifacts, asset manifests, review reports, and delivery manifests.
- Expanded workflow self-improvement governance docs and validation for explicit-only, report-only, proposal-only change adoption.
- Added team configuration guidance for personal installs, shared team installs, local config, and privacy review.
- Expanded migration guidance for role ID migration, local config boundaries, manifests, update/repair/rollback, validation, and release notes.
- Added explicit first-run onboarding questions for delivery behavior while keeping external delivery integrations out of the public kit.
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
