# CLI Reference

## Purpose

This reference explains the local commands shipped with FrameCore Works Skill Kit. It is for users and maintainers who want to understand which commands only inspect the repo, which commands write to a target workspace, and which order is safest during install, update, repair, or release review.

Default recommendation: use the guided project-local installer unless you have a reason to run lower-level commands manually.

## Command Groups

| Command | Main use | Writes files |
| --- | --- | --- |
| `npm run install:guided -- --target <path>` | beginner-safe project-local install | yes, after dry-run and confirmation |
| `npm run doctor -- --target <path>` | non-mutating preflight | no |
| `npm run onboard:defaults -- --target <path>` | default local config generation | yes |
| `node scripts/onboard.mjs --target <path>` | interactive local config generation | yes |
| `npm run install:dry-run -- --target <path>` | planned install preview | no |
| `node scripts/install.mjs --mode project-local --target <path>` | project-local install | yes |
| `node scripts/install.mjs --mode update --target <path>` | update an existing install | yes |
| `node scripts/install.mjs --mode repair --target <path>` | repair manifest-recorded files only | yes |
| `node scripts/install.mjs --mode uninstall --target <path>` | uninstall preview | no unless `--yes` is passed |
| `npm run audit:privacy` | privacy and banned-content audit | no |
| `npm run secret:scan` | dependency-free credential and private-cloud scan | no |
| `npm run syntax:check` | dependency-free JavaScript syntax check | no |
| `npm run validate` | workflow structure validation | no |
| `npm test` | automated tests | no repo writes expected |
| `npm run release:check` | full release gate | no repo writes expected |
| `npm run smoke:install` | temporary project-local install smoke test | writes only to a temporary target |
| `npm run package:list` | npm package dry-run preview | no |
| `npm run package:audit` | package contents gate | no |
| `npm run cleanup:appledouble -- --apply` | remove AppleDouble sidecars | yes, only `._*` metadata files |

## Safe Install Order

Manual install should follow this order:

1. `npm run check`
2. `npm run doctor -- --target <path>`
3. `node scripts/onboard.mjs --target <path>`
4. `node scripts/install.mjs --mode dry-run --target <path>`
5. `node scripts/install.mjs --mode project-local --target <path>`

The guided installer runs this sequence for project-local install and stops on the first failed check.

## Non-Mutating Checks

Use these before editing or releasing:

- `npm run audit:privacy`
- `npm run secret:scan`
- `npm run syntax:check`
- `npm run validate`
- `npm test`
- `npm run check`
- `npm run package:audit`
- `npm run release:check`
- `npm run smoke:install`
- `node scripts/doctor.mjs --target <path>`
- `node scripts/install.mjs --mode dry-run --target <path>`

These commands should not write managed files into the target workspace. `doctor` and `dry-run` report planned behavior so the user can stop before install.

## Mutating Commands

These commands can write or delete files:

- `node scripts/onboard.mjs --target <path>`
- `node scripts/install.mjs --mode project-local --target <path>`
- `node scripts/install.mjs --mode update --target <path>`
- `node scripts/install.mjs --mode repair --target <path>`
- `node scripts/install.mjs --mode uninstall --target <path> --yes`
- `node scripts/render-agents.mjs --target <path>`
- `npm run cleanup:appledouble -- --apply`

Mutating commands should be run against a specific target path. Global install is advanced-only and requires `--confirm-global`.

## Install Modes

- `dry-run`: report planned writes without changing files.
- `project-local`: install into one target workspace.
- `global`: install into the current user's home workspace and requires `--confirm-global`.
- `update`: update an existing install and requires `.framecore/manifest.json`.
- `repair`: recreate only manifest-recorded files and requires `.framecore/manifest.json`.
- `uninstall`: preview manifest-recorded removals; pass `--yes` to apply.

Use `--force` only when you intentionally want the installer to back up and overwrite user-owned conflicts. It does not bypass config validation.

## Packaging And Release Checks

For release review, run:

```bash
npm run cleanup:appledouble -- --apply
npm run release:check
npm run package:list
```

`release:check` runs privacy audit, secret scan, syntax check, workflow validation, tests, install smoke test, package audit, and release readiness. `package:list` is a read-only npm package dry-run preview so maintainers can inspect exactly what would ship.

## Safety Rules

- Prefer project-local install.
- Do not use global install unless the user explicitly chooses it.
- Do not enable external execution providers during setup.
- Do not skip onboarding unless using `--defaults` intentionally.
- Do not apply uninstall without reviewing the preview.
- Do not commit generated local config, backups, caches, outputs, or AppleDouble files.
- Run `npm run cleanup:appledouble -- --apply` before release checks on macOS when files were copied through Finder, archives, or external drives.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [Troubleshooting](troubleshooting.md)
- [Compatibility](compatibility.md)
- [Release Guide](release.md)
