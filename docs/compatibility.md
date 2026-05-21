# Compatibility

## Purpose

This guide defines the supported runtime, operating system, Codex environment, and install-mode assumptions for FrameCore Works Skill Kit.

Use it before opening support issues, before changing installer behavior, and before preparing a public release.

## Runtime Requirements

- Node.js 20 or newer.
- npm available from the same shell that runs the scripts.
- A local clone or downloaded copy of this repository.
- An existing target Codex workspace folder for guided install.

The package metadata declares `node >=20`. CI checks Node 20 and 22 on the default Linux validation workflow.

## Operating Systems

The scripts use Node.js standard library path handling and avoid shell-only behavior where practical.

Supported maintenance targets:

- macOS
- Linux
- Windows

The default `validate` workflow runs on Ubuntu for fast push and pull-request feedback. The manual `cross-platform` workflow should be run before public version tags and after changes to installer behavior, path handling, manifest handling, onboarding, validation scripts, or package contents.

## Codex Environment

This kit targets Codex workspaces that can read project instructions from `AGENTS.md`.

Project-local install writes rendered role files to `.codex/agents/*.toml`. A Codex environment that supports custom agents can use those role files for routed subagent work. If a local Codex environment does not expose custom-agent spawning, the installed skills, project instructions, templates, gates, and examples still provide the workflow contract, but agent spawning depends on that local environment.

If a target project already has `AGENTS.md`, project-local install writes `AGENTS.framecore.md`. Ask Codex to read both files before using the workflow.

## Install Modes

Supported install modes:

- `dry-run`, previews planned writes without creating managed workflow files.
- `project-local`, the recommended default for one workspace.
- `update`, refreshes the managed set from the current kit and can add new managed paths.
- `repair`, rewrites only paths already recorded in the manifest.
- `uninstall`, removes only exact file paths recorded in the manifest.
- `global`, advanced only and requires `--confirm-global`.

Guided install always uses the project-local path. It refuses missing targets and refuses installing into this kit repository itself.

## Manifest Compatibility

New installs write `.framecore/manifest.json` with managed paths and file hashes.

`doctor` uses the manifest to warn about missing or changed managed files. `update`, `repair`, and `uninstall` require a manifest. Legacy manifests without hashes can still be inspected, but hash-based drift checks need a manifest written by a current install, update, or repair.

Before update or repair rewrites the manifest, the installer writes numbered backups such as `.framecore/manifest.json.bak`.

## External Tool Boundary

The public kit is provider-neutral. It ships workflow contracts, role files, skills, templates, gates, examples, validation, and privacy checks.

External paid execution tools, provider credentials, endpoint catalogs, private cloud delivery settings, and user-specific local configuration belong outside this public repo and outside the default install path.

The text-bearing image policy is the intentional built-in image-generation path: static raster graphics with visible text should use native Codex or ChatGPT image generation powered by GPT Image 2 in one pass when that capability is available.

For the full boundary, see [Provider-Neutral Boundary](provider-neutral-boundary.md).

## Support Baseline

When reporting compatibility issues, include only sanitized information:

- operating system name
- Node.js version
- install mode
- whether `.framecore/manifest.json` exists
- sanitized command output with private paths, URLs, emails, and project context removed

Do not post secrets, credentials, private URLs, local machine paths, emails, or private project context in public issues.
