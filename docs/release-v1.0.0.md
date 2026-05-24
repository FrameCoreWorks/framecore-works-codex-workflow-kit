# FrameCore Works v1.0.0

## Version

- Tag: `v1.0.0`
- Date: 2026-05-24
- Release type: major

## Summary

FrameCore Works v1.0.0 is the first public-ready release of the Creative Workflow Skill Kit for Codex. It installs a provider-neutral, project-local workflow layer for creative production work such as graphics, video, storyboards, campaign assets, e-commerce visuals, prompt workflows, QA, delivery, and long-session recovery.

## Install And Update Notes

- New users should start with `npm run install:guided -- --target <path>`.
- Project-local install remains the default and recommended path.
- Existing installs can use `update` or `repair` through `scripts/install.mjs` after reviewing doctor/preflight output.
- Uninstall removes only manifest-recorded managed files and refuses directory removals.
- Global install remains advanced-only and requires explicit confirmation.

## Onboarding Notes

The kit includes first-run onboarding for working language, tone, output paths, QA strictness, delivery preferences, local display names, optional Hipson expansion intent, and report-only workflow self-improvement.

This release also adds `Memory Cache/` and `Context/` templates for long Codex sessions. `Context/` stores user-supplied inputs and references. `Memory Cache/` stores durable recovery state, checkpoint IDs, safe resume notes, source maps, decision logs, and artifact indexes.

## Workflow Changes

- Adds role-based Codex agent templates and public-safe skill contracts.
- Adds validated gate, handoff, artifact, fixture, and example workflow contracts.
- Adds Humanizer, HyperFrames workflow knowledge, lightweight Hipson Adapter, workflow self-improvement governance, and long-session recovery tooling.
- Adds local semantic memory commands that work without API access by default.
- Adds OpenAI API activation lock for API-capable semantic workflows.

## Validation And Package Checks

Validated before release:

- `npm run release:check`
- `npm run release:readiness`
- `npm run secret:scan`
- `npm run syntax:check`
- `npm run agent:check`
- `npm run package:audit`
- latest GitHub Actions `validate` run on `main`
- latest GitHub Actions `cross-platform` run on `main`

## Security And Privacy Review

- No secrets, credentials, private URLs, local machine paths, private cloud IDs, generated confidential outputs, or user-specific configs are included.
- No bundled external paid execution providers, provider CLIs, endpoint catalogs, credentials, or API-key setup flows are included.
- Text-bearing raster graphic policy uses native Codex/ChatGPT image generation powered by GPT Image 2 when available.
- Full Hipson remains separate and optional; this kit ships only the lightweight adapter.

## Known Limitations

- `.codex/agents/*.toml` requires a Codex environment that supports custom-agent role files.
- Chat-only environments can still use the docs and workflow contracts, but cannot run the installer directly.
- The kit installs routing, contracts, QA, examples, and recovery structure. Project-specific brand knowledge and private references stay local to the user.
- Local semantic memory is lightweight by default. Hosted embeddings are optional and activation-gated.

## Links

- [README](../README.md)
- [Quickstart](quickstart.md)
- [Troubleshooting](troubleshooting.md)
- [Compatibility](compatibility.md)
- [Memory Cache](memory-cache.md)
- [Semantic Memory](semantic-memory.md)
- [OpenAI API Policy](openai-api-policy.md)
