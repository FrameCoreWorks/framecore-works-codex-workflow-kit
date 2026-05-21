# Release Guide

## Purpose

This project uses GitHub releases as the public release record. npm publication is optional and not required for project-local installation.

## Release Principles

- Release only reusable, provider-neutral workflow assets.
- Do not bundle credentials, private URLs, private project context, local machine paths, generated outputs, or user-specific configs.
- Do not add external paid execution clients, provider CLIs, endpoint catalogs, or API-key setup flows to the kit.
- Keep role source names neutral. Local display names belong in user-generated config, not in repo source.
- Keep release checks read-only unless a maintainer explicitly performs the version bump, changelog update, commit, tag, and GitHub release.

## Pre-Release Checklist

1. Confirm the version target and release scope.
2. For v1.0, complete [v1.0 Readiness](v1-readiness.md).
3. Update `package.json` version when the release changes the package version.
4. Update `CHANGELOG.md` with user-visible changes, compatibility notes, and migration notes.
5. Run the full local release check:

   ```bash
   npm run release:check
   ```

   For a tag-specific local check before creating a GitHub release:

   ```bash
   npm run release:readiness -- --tag v1.0.0
   ```

6. Audit package contents:

   ```bash
   npm run package:audit
   ```

7. Inspect package contents when you want the raw npm dry-run list:

   ```bash
   npm run package:list
   ```

8. Confirm the package contains only intended source, docs, examples, scripts, tests, and config files.
9. Confirm the privacy audit passes without allowlisting sensitive content.
10. Confirm the text-bearing image policy still references native Codex/ChatGPT image generation powered by GPT Image 2.
11. Confirm Hipson remains a lightweight adapter unless a user explicitly connects the separate full Hipson repo.
12. Confirm public examples include validated `workflow.json` manifests.
13. Confirm workflow self-improvement remains explicit-only and proposal-only.
14. Confirm [Provider-Neutral Boundary](provider-neutral-boundary.md) still matches `config/provider-neutral-policy.json`.

## Required Checks

Run these checks before tagging or publishing release notes:

```bash
npm run audit:privacy
npm run validate
npm test
npm run check
npm run package:audit
npm run package:list
npm run release:readiness
npm run release:check
```

The release-check workflow must remain non-publishing, read-only, and secret-free. It should verify the same local gate a maintainer runs before release.

`release:readiness` checks package metadata, required package file roots, changelog coverage for the package version, and optional release tag alignment. In GitHub tag workflows, the tag must match `v` plus the `package.json` version.

Run the manual `cross-platform` workflow before a public version tag, after changes to installer behavior, path handling, manifest handling, onboarding, validation scripts, or package contents. The default `validate` workflow stays Linux-only for fast push feedback; the manual cross-platform workflow checks Ubuntu, macOS, Windows, tests, and package audit without making every commit depend on all hosted runner families.

## Package Contents Review

Review the `npm run package:audit` result before each release. The package should contain source skills, agent templates, config examples, docs, examples, scripts, and tests. It should not contain local configs, generated outputs, caches, backups, machine metadata, archives, logs, or user-specific files.

`package:audit` parses `npm pack --json --dry-run` with a temporary npm cache and rejects unexpected package roots or forbidden package file patterns. Use `npm run package:list` when you want to manually inspect the raw npm file list with the same temporary-cache behavior. Plain `npm pack --dry-run` is optional and only useful when you intentionally want to test your local npm cache as well.

Example folders should include their `workflow.json` manifests. These are source fixtures used by validation, not generated outputs.

## Privacy And Provider-Neutral Gate

Stop the release if the audit finds secrets, credentials, private URLs, private project context, local paths, private cloud IDs, generated confidential output, or user-specific onboarding data.

Stop the release if the package introduces bundled external paid execution clients, provider CLIs, endpoint catalogs, API-key setup flows, or provider-specific activation paths. The kit must stay provider-neutral and project-local by default.

## Halt Conditions

Do not release when any of these are true:

- `npm run release:check` fails.
- Package contents include unintended files.
- The changelog does not describe user-visible behavior changes.
- Install, update, repair, uninstall, onboarding, privacy, or validation behavior changed without matching docs.
- A sensitive report is unresolved.
- GitHub Actions release-check is red or has not run for the tag.

## Maintainer Sign-Off

Before creating a GitHub release, confirm:

- The tag matches `package.json` version.
- `CHANGELOG.md` has the final release entry.
- README, Quickstart, Compatibility, Roadmap, Troubleshooting, Security, Support, and this Release Guide still match current behavior.
- Repository settings match the current maintenance mode documented in [Repository Settings](repository-settings.md).
- The release notes do not include sensitive data.
- No npm publication or registry upload is happening from this release workflow.

## Tag And Release Flow

Use semantic version tags:

```bash
git tag v1.0.0
git push origin v1.0.0
```

After the tag workflow passes, create a GitHub release from the tag. Release notes should include:

- summary of workflow changes
- install, update, repair, or uninstall compatibility notes
- onboarding changes
- validation or privacy audit changes
- known limitations
- links to `README.md`, `docs/quickstart.md`, and `docs/troubleshooting.md`

Use [Release Notes Template](release-notes-template.md) to keep release notes consistent.

Do not paste secrets, private URLs, local paths, private project names, or generated confidential outputs into release notes.

## Release Check Workflow

`.github/workflows/release-check.yml` is intentionally non-publishing. It runs on manual dispatch and version tags, uses read-only permissions, runs validation and packaging checks, and does not require repository secrets.

If a future release process publishes to a registry, add that in a separate workflow with explicit maintainer review and documentation.

`.github/workflows/cross-platform.yml` is intentionally manual. It is a smoke check for operating system portability, not a publishing or deployment workflow.

## Rollback

If a release is found to contain sensitive content:

1. Remove or delete the public release artifact.
2. Revoke any exposed credentials outside this repo.
3. Remove sensitive content from source history according to the repository security policy.
4. Publish a corrected release with a new patch version.

If a release only has a workflow or documentation defect, publish a patch release after `npm run release:check` passes.
