# Customization

Customize locally through `framecore.config.json`.

Safe customizations:

- local display names for agents
- output directory
- QA strictness
- delivery preference
- response tone
- optional integrations outside this repo

Do not commit user-specific config, secrets, local paths, private project context, or generated outputs.

For team use, read [Team Configuration](team-configuration.md) before committing any installed workflow files or local config.

When moving reusable workflow logic from another setup, use [Migration Guide](migration-guide.md) to keep role IDs, local config, manifests, provider-neutral boundaries, and validation steps aligned.

Installer ownership is tracked in `.framecore/manifest.json`. Do not add user-owned files to this manifest. Uninstall removes only exact manifest paths and refuses directory removals. When managed hashes are present, `doctor` can warn if a FrameCore-managed file was locally edited or deleted.
