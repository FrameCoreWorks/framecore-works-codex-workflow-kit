# Repository Settings

## Purpose

This guide describes recommended GitHub repository settings for maintainers of the public FrameCore Works kit.

These settings protect the public repo. They are not part of project-local installation and they are not required for people who only install the kit into their own Codex workspace.

## Recommended Minimum

For a solo maintainer using GitHub Desktop and direct pushes, start with a lightweight ruleset on `main`:

- Ruleset name: `main-safety`
- Enforcement status: active
- Target branch: `main`
- Restrict deletions: enabled
- Block force pushes: enabled

This prevents accidental branch deletion and history replacement while still allowing normal direct pushes during early maintenance.

Keep the bypass list empty unless you have a clear operational reason. If a bypass is needed, limit it to maintainers who are responsible for releases.

## Stronger PR Workflow

Enable these rules when the repo is ready for pull-request-based maintenance:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Select the `validate` workflow checks that GitHub reports for the current Node.js matrix.
- Require conversation resolution when public review comments are used.

Keep signed commits optional unless every maintainer already signs commits. Requiring signed commits too early can block useful contributions for a policy issue unrelated to the kit itself.

Require linear history only if the project intentionally uses squash or rebase merges. Do not enable it if maintainers need merge commits for release branches.

## GitHub Actions

The default Actions setup is intentionally conservative:

- `validate` runs on pull requests and pushes to `main`.
- `release-check` runs on manual dispatch and version tags.
- `cross-platform` is path-sensitive for installer, test, config, package, and workflow changes, and can also be run manually before public version tags.
- Workflows use read-only permissions and should not require repository secrets.

For public fork pull requests, keep maintainer approval for first-time contributor workflow runs enabled when GitHub offers that setting. Review the diff before approving a workflow run from an unfamiliar fork.

Do not add publishing, package upload, provider execution, or secret-dependent jobs to the default validation path.

## Public Issue Hygiene

Public issue templates should keep users from posting sensitive material. Maintainers should remove or redact:

- credentials, tokens, or secret-like values
- private URLs or cloud IDs
- local machine paths
- emails and personal contact data
- private project context
- generated confidential output

When asking for logs, ask contributors to replace sensitive values with placeholders before posting.

If sensitive data appears in a public issue, hide or redact it where GitHub allows, ask the reporter to rotate exposed secrets, and move security discussion out of public issues.

## Before Release

Before creating a public tag or GitHub release:

```bash
npm run release:check
npm run secret:scan
npm run smoke:install
npm run package:audit
npm run package:list
```

Then confirm:

- the latest `validate` run on `main` is green
- the path-sensitive cross-platform workflow is green for portability-sensitive changes, or a manual run is green before a public tag
- branch deletion and force push protections are active
- release notes do not include sensitive data
- the repo still ships provider-neutral workflow assets only

## What Stays Optional

These controls are useful, but not mandatory for early solo maintenance:

- required pull requests
- required status checks for direct pushes
- signed commits
- linear history
- CODEOWNERS reviews
- automatic code review requests
- code scanning gates
- Discussions
- auto-assignment or project boards
- npm publishing workflows

Add them when they improve maintainability without blocking routine safe updates.

## When To Revisit

Review these settings:

- before a public version tag
- before adding new maintainers
- before adding any publishing workflow
- before adding any workflow that needs secrets
- after install, release, package, path, or workflow behavior changes
