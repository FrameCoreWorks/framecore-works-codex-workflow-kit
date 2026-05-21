# Team Configuration

## Purpose

FrameCore Works installs project-local workflow assets, but onboarding creates local preferences for one workspace. Teams should decide intentionally what stays personal and what becomes shared project policy.

The safe default is personal install: keep generated local config out of version control.

## Personal Install

Use personal install when one user wants the workflow in one local Codex workspace.

Keep these local:

- `framecore.config.json`
- local agent display names
- `.framecore/manifest.json`
- backup files such as `*.bak`
- generated outputs
- private references, local paths, credentials, and private cloud links

This mode is the safest default because it avoids publishing local preferences or user-specific workspace state.

## Shared Team Install

Use shared team install only when the team intentionally wants FrameCore workflow assets committed into a project repository.

Before committing any installed files:

- run `npm run audit:privacy`
- inspect generated agent files for personal display names
- remove or replace local paths
- remove private references and private cloud IDs
- confirm the provider-neutral boundary still applies
- confirm no generated outputs, backups, caches, or secrets are included
- document the team decision in the project repository

Team-shared display names should be role-based and neutral. Do not commit personal names unless the team intentionally accepts that naming convention.

## Recommended Team Pattern

For most teams:

- commit project instructions only when reviewed by the team
- keep `framecore.config.json` local
- keep `.framecore/manifest.json` local unless the team explicitly manages FrameCore updates together
- rerun onboarding locally for each user
- use neutral display names for any committed agent files
- keep provider credentials and external execution settings outside the repo

## Files That Should Stay Local By Default

Do not commit these by default:

- `framecore.config.json`
- `framecore.local.json`
- `framecore.config.local.json`
- `.framecore/tmp/`
- backup files
- logs
- generated output folders
- local delivery folders
- credential files
- private cloud sync folders

## When To Share Config

Sharing config can be reasonable when:

- the team wants the same QA strictness
- the team wants the same response tone
- the team wants the same neutral role display names
- the output directory is repo-relative and portable
- every value has been reviewed for privacy and portability

Even then, prefer a documented template or example over committing a user's live config.

## Privacy Review

Before sharing any configured workspace, confirm:

- no local absolute paths
- no emails or personal contact data
- no private project names
- no credentials or secret-like values
- no private cloud URLs or IDs
- no generated confidential outputs
- no excluded provider remnants
- no AppleDouble metadata files

Run:

```bash
npm run cleanup:appledouble -- --apply
npm run audit:privacy
```

## Update And Repair In Teams

If a team shares installed workflow files, choose one maintainer to run update and repair. Review the diff before merging changes.

`update` can add new FrameCore-managed paths from the current kit. `repair` rewrites only paths already recorded in the manifest. Both can create backups, and those backups should usually stay out of version control.
