# Security

Do not commit secrets, private keys, credentials, raw private URLs, personal cloud folder IDs, private project context, local machine paths, generated outputs, or user-specific onboarding files.

## Supported Versions

| Version | Status |
| --- | --- |
| 0.1.x | Supported for security reports and privacy fixes |

## Reporting A Vulnerability

Use GitHub private vulnerability reporting from the repository Security tab when available.

Do not include vulnerability details, exploit steps, private URLs, credentials, or secret-like values in public issues, discussions, pull requests, or commit messages.

If private vulnerability reporting is unavailable, open a minimal public issue asking for a private security contact path. Do not include sensitive technical details in that issue.

## Release Checks

Run before publishing:

```bash
npm run audit:privacy
npm run validate
npm test
npm pack --dry-run
```

The privacy audit is intentionally strict. If it blocks a release, remove the sensitive content or move the test case into a temporary fixture generated at test time.

## Scope

Security reports should focus on installer safety, uninstall safety, path traversal, privacy leaks, secret handling, unsafe default behavior, dependency risk, and workflow files that could cause Codex to expose private user context.
