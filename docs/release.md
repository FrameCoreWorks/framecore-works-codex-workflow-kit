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
2. Update `package.json` version when the release changes the package version.
3. Update `CHANGELOG.md` with user-visible changes, compatibility notes, and migration notes.
4. Run the full local release check:

   ```bash
   npm run release:check
   ```

5. Inspect package contents:

   ```bash
   npm pack --dry-run
   ```

6. Confirm the package contains only intended source, docs, examples, scripts, tests, and config files.
7. Confirm the privacy audit passes without allowlisting sensitive content.
8. Confirm the text-bearing image policy still references native Codex/ChatGPT image generation powered by GPT Image 2.
9. Confirm Hipson remains a lightweight adapter unless a user explicitly connects the separate full Hipson repo.
10. Confirm public examples include validated `workflow.json` manifests.
11. Confirm workflow self-improvement remains explicit-only and proposal-only.

## Required Checks

Run these checks before tagging or publishing release notes:

```bash
npm run audit:privacy
npm run validate
npm test
npm run check
npm run release:check
npm pack --dry-run
```

The release-check workflow must remain non-publishing, read-only, and secret-free. It should verify the same local gate a maintainer runs before release.

## Package Contents Review

Review the `npm pack --dry-run` file list before each release. The package should contain source skills, agent templates, config examples, docs, examples, scripts, and tests. It should not contain local configs, generated outputs, caches, backups, machine metadata, or user-specific files.

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
- README, Quickstart, Troubleshooting, Security, Support, and this Release Guide still match current behavior.
- The release notes do not include sensitive data.
- No npm publication or registry upload is happening from this release workflow.

## Tag And Release Flow

Use semantic version tags:

```bash
git tag v0.1.0
git push origin v0.1.0
```

After the tag workflow passes, create a GitHub release from the tag. Release notes should include:

- summary of workflow changes
- install, update, repair, or uninstall compatibility notes
- onboarding changes
- validation or privacy audit changes
- known limitations
- links to `README.md`, `docs/quickstart.md`, and `docs/troubleshooting.md`

Do not paste secrets, private URLs, local paths, private project names, or generated confidential outputs into release notes.

## Release Check Workflow

`.github/workflows/release-check.yml` is intentionally non-publishing. It runs on manual dispatch and version tags, uses read-only permissions, runs validation and packaging checks, and does not require repository secrets.

If a future release process publishes to a registry, add that in a separate workflow with explicit maintainer review and documentation.

## Rollback

If a release is found to contain sensitive content:

1. Remove or delete the public release artifact.
2. Revoke any exposed credentials outside this repo.
3. Remove sensitive content from source history according to the repository security policy.
4. Publish a corrected release with a new patch version.

If a release only has a workflow or documentation defect, publish a patch release after `npm run release:check` passes.
