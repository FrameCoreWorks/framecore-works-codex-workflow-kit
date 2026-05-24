# FrameCore Works v1.0.2

## Version

- Tag: `v1.0.2`
- Date: 2026-05-24
- Release type: patch

## Summary

FrameCore Works v1.0.2 tightens the beginner onboarding and release safety path after v1.0.1. It adds an optional long-session recovery step to guided install, threads onboarding profile answers through every rendered agent, and removes tests from the npm package while keeping them required in the source repository.

## Install And Update Notes

- New users can run `npm run install:guided -- --target <path> --defaults --yes --init-memory-cache` to initialize `Context/` and `Memory Cache/` immediately after project-local install.
- Users who skip the new flag can still run `npm run memory:init -- --target <path>` and `npm run memory:validate -- --target <path>` later.
- Project-local install remains the default and recommended path.
- Existing installs can use `update` or `repair` through `scripts/install.mjs` after reviewing doctor/preflight output.
- No migration is required for existing `framecore.config.json` files.

## Onboarding Notes

- Guided install now offers long-session recovery setup after the managed install completes.
- Interactive onboarding validates `output_dir` immediately and re-prompts for unsafe absolute paths, URLs, home-relative paths, or `../` traversal.
- Beginner-facing setup prompts now explicitly ask whether the user wants `Context/` and `Memory Cache/` initialized.
- The existing profile questions for work type, use cases, workflow style, adaptation notes, language, and tone are unchanged.

## Workflow Changes

- Every rendered `.codex/agents/*.toml` template now consumes the onboarding workspace profile, working language, and response tone.
- Text-bearing image routing is rendered from `config/text-image-policy.json` instead of being hard-coded inside agent templates.
- Image Prompt Contract fixture validation now checks for the native Codex/ChatGPT generator path, one-pass generation, exact visible text, and QA checks.
- `tests/` is no longer included in the npm tarball.
- `npm publish` remains guarded by `npm run release:check`.
- Tag-time release checks run on Node.js 20 and 22.

## Validation And Package Checks

Validated before release:

- `npm run release:check`
- `npm run validate`
- `npm test`
- `npm run package:audit`
- `npm run release:readiness`
- `git diff --check`

Latest local results:

- 115/115 tests passed.
- Package audit passed with 197 files.
- Smoke install passed.
- Release readiness passed for `framecore-works-codex-workflow-kit@1.0.2`.

## Security And Privacy Review

- No secrets, credentials, private URLs, local machine paths, private cloud IDs, generated confidential outputs, or user-specific configs are included.
- No bundled external paid execution providers, provider CLIs, endpoint catalogs, credentials, or API-key setup flows are included.
- `Context/` remains user-supplied input/reference material and is not treated as recovery state.
- `Memory Cache/` remains durable recovery state and should not contain secrets, raw transcripts, provider credentials, or AppleDouble files.
- The text-bearing image policy still uses native Codex/ChatGPT image generation powered by GPT Image 2.
- Full Hipson remains separate and optional; this kit ships only the lightweight adapter.

## Known Limitations

- `.codex/agents/*.toml` requires a Codex environment that supports custom-agent role files.
- Chat-only environments can use the docs and prompts, but cannot run the installer directly.
- Transactional rollback for interrupted installs is not included in this patch; the current behavior still relies on the incomplete manifest and `doctor` recovery signal.
- Coverage, formatter, mutation, and entropy-based secret gates remain roadmap items.

## Links

- [README](../README.md)
- [Quickstart](quickstart.md)
- [Troubleshooting](troubleshooting.md)
- [Compatibility](compatibility.md)
- [Memory Cache](memory-cache.md)
- [OpenAI API Policy](openai-api-policy.md)
- [Release Process](release.md)
