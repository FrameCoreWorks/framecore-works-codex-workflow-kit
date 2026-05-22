# Security

Do not commit secrets, private keys, credentials, raw private URLs, personal cloud folder IDs, private project context, local machine paths, generated outputs, or user-specific onboarding files.

## Supported Versions

| Version | Status |
| --- | --- |
| 1.0.x | Supported for security reports and privacy fixes |
| 0.1.x | Security reports accepted; upgrade to 1.0.x is recommended |

## Reporting A Vulnerability

Use GitHub private vulnerability reporting from the repository Security tab when available.

Do not include vulnerability details, exploit steps, private URLs, credentials, or secret-like values in public issues, discussions, pull requests, or commit messages.

If private vulnerability reporting is unavailable, open a minimal public issue asking for a private security contact path. Do not include sensitive technical details in that issue.

## Response Process

Maintainers should acknowledge valid private reports as soon as practical, triage whether the issue affects installer safety, privacy, package contents, workflow files, or documentation, and keep sensitive details out of public issues until a fix is available.

Security fixes should include the smallest useful patch, relevant tests or validation updates, and release notes that describe impact without exposing exploit details or private data.

## Useful Evidence

Useful private report details include:

- affected version, tag, or commit SHA
- operating system and Node.js version
- sanitized command sequence
- sanitized finding codes or error output
- expected behavior and actual behavior
- whether the issue occurs during install, update, repair, uninstall, validation, packaging, or GitHub Actions

## Release Checks

Run before publishing:

```bash
npm run audit:privacy
npm run secret:scan
npm run validate
npm test
npm run release:check
npm run package:list
```

The privacy audit is intentionally strict. The dependency-free secret scan adds a focused credential and private-cloud reference pass without requiring third-party services or repository secrets. If either scan blocks a release, remove the sensitive content or move the test case into a temporary fixture generated at test time.

Follow the release checklist in [Release Guide](docs/release.md) before creating a public tag or GitHub release.

## Scope

Security reports should focus on installer safety, uninstall safety, path traversal, privacy leaks, secret handling, unsafe default behavior, dependency risk, and workflow files that could cause Codex to expose private user context.
