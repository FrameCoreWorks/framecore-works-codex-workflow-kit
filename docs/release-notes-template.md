# Release Notes Template

Use this template for GitHub releases. Keep release notes public-safe, provider-neutral, and focused on user-visible changes.

## Version

- Tag:
- Date:
- Release type: patch, minor, or major

## Summary

Briefly describe what changed and who benefits from the release.

## Install And Update Notes

- project-local install compatibility:
- Update behavior:
- Repair behavior:
- Uninstall behavior:
- Migration notes:

## Onboarding Notes

- New or changed onboarding questions:
- New or changed local config fields:
- Defaults that changed:
- Optional features that remain opt-in:

## Workflow Changes

- Agent template changes:
- Skill changes:
- Gate, handoff, or artifact contract changes:
- Example workflow changes:

## Validation And Package Checks

Confirm these passed before publishing:

- `npm run release:check`
- `npm run release:readiness`
- `npm run package:audit`
- `npm run package:list`
- `npm pack --dry-run`
- latest GitHub Actions `validate` run on `main`
- manual `cross-platform` run when portability-sensitive behavior changed

## Security And Privacy Review

- No secrets, credentials, private URLs, local machine paths, private cloud IDs, generated confidential outputs, or user-specific configs are included.
- No bundled external paid execution providers, provider CLIs, endpoint catalogs, credentials, or API-key setup flows are included.
- The text-bearing image policy still uses native Codex/ChatGPT image generation powered by GPT Image 2.
- Full Hipson remains separate and optional; this kit ships only the lightweight adapter.

## Known Limitations

List current limitations that matter to users of this release.

## Links

- README:
- Quickstart:
- Troubleshooting:
- Compatibility:
- Roadmap:
