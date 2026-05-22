# Maintainers

FrameCore Works maintains this repository as a public, provider-neutral Codex workflow kit.

## Maintainer Responsibilities

Maintainers are responsible for:

- keeping the public source free of private project context, credentials, local machine paths, generated confidential outputs, and provider-specific execution bundles
- keeping install, update, repair, uninstall, onboarding, validation, package, and release behavior aligned with the docs
- reviewing changes to workflow gates, handoffs, artifacts, agent templates, skills, privacy rules, package contents, and GitHub Actions before release
- running the documented release checks before public tags or release notes
- triaging public support issues without asking users to paste secrets or private workspace material

## Release Ownership

Each public release should have one release owner. The release owner confirms:

- `npm run release:check` passes locally
- GitHub Actions validation is green for the release commit or tag
- package contents are reviewed
- release notes do not contain sensitive data
- provider-neutral boundaries are intact
- known limitations are documented

## Escalation

Security-sensitive reports should follow `SECURITY.md`. General support should follow `SUPPORT.md`.

When in doubt, block the release and ask for a smaller, safer patch.
