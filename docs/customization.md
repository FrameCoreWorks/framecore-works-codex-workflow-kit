# Customization

## Purpose

This guide explains what users can safely customize after installing FrameCore Works Skill Kit into a project-local Codex workspace.

Customization is local preference tuning. It should not change the public source model: neutral role IDs, provider-neutral boundaries, gates, handoffs, artifact contracts, privacy rules, and installer safety behavior stay intact.

## Local Config File

Onboarding writes local preferences to:

```text
framecore.config.json
```

This file is validated before agent rendering and installation. If it is invalid, the installer stops before writing managed workflow files.

The main fields are:

- `working_language`
- `response_tone`
- `output_dir`
- `qa_strictness`
- `work_profile`
- `delivery`
- `agent_display_names`
- `hipson`
- `workflow_self_improvement`

Use [Onboarding](onboarding.md) to regenerate a valid config instead of hand-editing JSON when possible.

## Safe Customizations

These changes are safe for a local workspace:

- choose a working language
- tune response tone
- choose a repo-relative output directory
- tune the local work profile for primary work, main use cases, preferred workflow style, and adaptation notes
- set QA strictness to `light`, `standard`, or `strict`
- assign local display names for neutral role IDs
- keep automatic uploads disabled
- require explicit delivery requests
- require QA approval before generated asset delivery
- keep the Hipson Adapter enabled without connecting full Hipson
- enable report-only workflow self-improvement review when intentionally opted in

Local preferences should help Codex behave better in the current workspace without making the public kit personal, provider-specific, or dependent on a private environment.

## Unsafe Customizations

Do not put these in local config, templates, docs, examples, tests, or committed installed files:

- credentials, tokens, API keys, private keys, or secret-like values
- emails or personal contact data
- local absolute paths
- private cloud folder links or IDs
- private project names or client context
- generated confidential outputs
- provider-specific execution routes, endpoint catalogs, or activation phrases
- user-specific agent names in public source

If a customization needs secrets or private delivery settings, keep it outside this public kit and outside any public commit.

## Output Directory

`output_dir` must be a safe relative path, for example:

```json
"output_dir": "output/framecore"
```

Do not use absolute paths, `~`, URLs, drive-root paths, parent traversal, private cloud sync paths, or machine-specific folders.

The output directory is only a local preference. It is not permission to upload, publish, or include generated outputs in source control.

## Work Profile

`work_profile` tells the installed pipeline what kind of work it should optimize for in this workspace:

```json
"work_profile": {
  "primary_work": "creative production: graphics, video, storyboards, campaign assets, and e-commerce assets",
  "primary_use_cases": "briefs, references, visual direction, prompt packs, QA review, and delivery preparation",
  "workflow_style": "structured checkpoints with concise practical outputs",
  "adaptation_notes": "adapt the creative workflow to my projects without changing provider-neutral safety boundaries"
}
```

The default profile reflects the kit's original creative-production focus. Users can adapt it for other domains, but should keep it free of secrets, private client names, provider credentials, local absolute paths, and private cloud links.

## Agent Display Names

`agent_display_names` maps neutral role IDs to local display names.

Example:

```json
"agent_display_names": {
  "workflow-orchestrator": "Producer",
  "qa-iteration": "Reviewer"
}
```

Display names are local aliases. The public source repo, docs, examples, templates, tests, and generated defaults should continue to use neutral role IDs such as `workflow-orchestrator` and `qa-iteration`.

If a team commits generated agent files, review display names first and prefer neutral role-based labels.

## QA Strictness

`qa_strictness` accepts:

- `light`, useful for quick drafts and internal planning
- `standard`, the default balance for most workflows
- `strict`, useful before delivery, release, public examples, or generated asset review

QA strictness changes review behavior. It should not bypass required gates, handoffs, privacy checks, or provider-neutral limits.

## Delivery Preferences

Delivery settings shape local behavior only:

```json
"delivery": {
  "auto_upload": false,
  "delivery_requires_current_user_request": true,
  "require_qa_allowlist_for_generated_assets": true
}
```

Recommended default:

- keep `auto_upload` false
- keep explicit delivery requests required
- keep QA approval required for generated asset delivery

These settings do not add cloud credentials, upload targets, publishing tools, or delivery integrations.

## Hipson Settings

The public kit includes only the lightweight Hipson Adapter:

```json
"hipson": {
  "adapter_enabled": true,
  "full_repo_url": "https://github.com/Hipson47/Hipson.git",
  "connect_full_repo": false
}
```

Keep `connect_full_repo` false unless the user intentionally connects the separate full Hipson repository. Full Hipson remains separate and optional.

The adapter can prepare research maps, internet mapping packets, bounded instructions, review packets, and execution packets without requiring the full repository.

## Workflow Self-Improvement Settings

Workflow self-improvement is explicit, report-only, and proposal-only by design:

```json
"workflow_self_improvement": {
  "enabled": true,
  "recurring_review_enabled": false,
  "cadence": "24h",
  "mode": "report-and-proposals-only"
}
```

The recurring review is disabled by default and should be enabled only by explicit user choice. Even when enabled, it should produce reports and proposals, not automatic edits, uploads, provider runs, destructive operations, or hidden daemons.

## Team Customization

The safe default is personal install. Keep `framecore.config.json` and `.framecore/manifest.json` local unless a team intentionally decides to manage FrameCore files together.

If a team wants shared settings, prefer `framecore.config.shared.json` over committing a live user config. Shared config is optional and may contain reviewed team defaults such as `qa_strictness`, `response_tone`, neutral `agent_display_names`, or a portable `output_dir`.

Config is merged in this order:

1. built-in defaults
2. `framecore.config.shared.json`
3. local `framecore.config.json`

Local config wins. Review every shared value for privacy, portability, and provider-neutrality.

For team decisions, read [Team Configuration](team-configuration.md).

## Update Repair And Uninstall

Installer ownership is tracked in:

```text
.framecore/manifest.json
```

Do not add user-owned files to this manifest. Uninstall removes only exact manifest paths and refuses unsafe directory removals.

`update` can add new managed files from the current kit. `repair` rewrites only files already recorded in the manifest. Both can create backups before overwriting managed files.

Run `doctor` before update, repair, or uninstall if the workspace may have local edits.

## Validation Checklist

After changing config or committed customization docs, run:

```bash
npm run cleanup:appledouble -- --apply
npm run audit:privacy
npm run validate
npm test
```

For release or package work, run:

```bash
npm run release:check
```

If validation fails, fix the config, docs, or source contract instead of bypassing checks.

## Related Docs

- [Onboarding](onboarding.md)
- [Team Configuration](team-configuration.md)
- [Migration Guide](migration-guide.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Workflow Self-Improvement](workflow-self-improvement.md)
- [Troubleshooting](troubleshooting.md)
