# Troubleshooting

This page covers common installation and workflow issues for FrameCore Works Skill Kit.

## `npm run check` Fails

Run the parts separately to identify the failing gate:

```bash
npm run audit:privacy
npm run validate
npm test
```

Use the failure category to decide the next step:

- `audit:privacy` failure: remove AppleDouble sidecar files, local machine paths, email addresses, secrets, or excluded provider/tool remnants from public source files.
- `validate` failure: a required agent template, skill file, pipeline reference, gate, handoff, or text-image policy marker is missing.
- `npm test` failure: inspect the named test and keep fixes focused on the behavior under test.

## Node Version Is Too Old

The package requires Node.js 20 or newer. Check your version:

```bash
node --version
```

Upgrade Node, then rerun:

```bash
npm run check
```

## Dry Run Reports User-Owned File Conflicts

The installer refuses to overwrite files that were not previously recorded in `.framecore/manifest.json`.

Typical message:

```text
refusing to overwrite user-owned file: .agents/skills/example/SKILL.md. Re-run with --force only if this is intentional.
```

Recommended response:

1. Open the conflicting file and decide whether it is truly replaceable.
2. If it is user-owned, keep it and do not force the install.
3. If replacing it is intentional, rerun with `--force`.
4. Prefer backing up or moving user-owned content before using `--force`.

## `AGENTS.md` Was Not Replaced

This is expected when the target project already has `AGENTS.md`.

Project-local install preserves the existing project instructions and writes FrameCore instructions to:

```text
AGENTS.framecore.md
```

Ask Codex to read both files, or manually merge the guidance if your project should keep one instruction file.

## Install Warns That `framecore.config.json` Is Missing

The installer can render agents with built-in defaults, but onboarding is recommended first:

```bash
node scripts/onboard.mjs --target /path/to/your/project
```

For default non-interactive setup:

```bash
node scripts/onboard.mjs --defaults --target /path/to/your/project
```

Then install again:

```bash
node scripts/install.mjs --mode project-local --target /path/to/your/project
```

## Installed Agents Use Neutral Role IDs

Source templates use neutral role IDs by design. Local display names are generated during onboarding and rendered into target `.codex/agents/*.toml` files.

To change local names:

1. Rerun onboarding.
2. Enter custom display names when prompted.
3. Rerun project-local install or repair.

## Codex Does Not Seem To Use The Installed Workflow

Check these items:

- The files were installed into the same project Codex is using.
- The target contains `.codex/agents/*.toml`.
- The target contains `.agents/skills/*/SKILL.md`.
- The target contains `AGENTS.md` or `AGENTS.framecore.md`.
- Codex has read the current project instructions after installation.

If the project had an existing `AGENTS.md`, explicitly tell Codex:

```text
Read AGENTS.md and AGENTS.framecore.md before continuing.
```

## Repair Creates Backup Files

When repair rewrites an existing managed file, it creates a `.bak` file first. This preserves the previous content for review.

If the backup is no longer needed, remove it intentionally after comparing it with the current managed file.

## Uninstall Did Not Remove Everything

Uninstall removes only exact files recorded in `.framecore/manifest.json`. It refuses unsafe paths and directory removals.

Preview first:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project
```

Apply:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project --yes
```

User-owned files, directories, local configs, and files not listed in the manifest are intentionally preserved.

## External Execution Tools Are Not Installed

This kit is provider-neutral. It installs workflow instructions, agents, skills, templates, gates, and local configuration. It does not install external paid media-provider clients, API keys, endpoint catalogs, or paid execution routes.

If a workflow needs an external tool later, add that integration separately and document the local policy in your project instructions.

## Static Graphics With Visible Text

The public workflow policy says visible text in static raster graphics should be generated directly through the native Codex or ChatGPT image generation path powered by GPT Image 2, in one pass.

Do not work around that rule by generating a blank background and adding text later unless the user explicitly asks for a coded or vector artifact.
