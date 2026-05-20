## Summary

- 

## Scope

- [ ] Installer, update, repair, or uninstall behavior
- [ ] Onboarding or local configuration
- [ ] Agent templates
- [ ] Skills or workflow content
- [ ] Validation or privacy audit
- [ ] Documentation or examples
- [ ] CI, package metadata, or repo health
- [ ] Release process, package contents, or maintainer operations

## Safety Checklist

- [ ] No secrets, credentials, private URLs, private project context, local machine paths, generated outputs, or user-specific configs are included.
- [ ] Neutral role IDs are preserved.
- [ ] External execution integrations remain optional and user-configured.
- [ ] Text-bearing image policy remains intact.
- [ ] User-owned files are not overwritten or removed without explicit opt-in.
- [ ] Package contents were checked when release or packaging files changed.
- [ ] Cross-platform impact was considered for scripts, paths, and tests.

## Release Impact

- [ ] No release impact
- [ ] Changelog update needed
- [ ] Version or tag planning needed
- [ ] Install, update, repair, or uninstall compatibility note needed

## Verification

- [ ] `npm run check`
- [ ] `npm run release:check`
- [ ] `npm pack --dry-run`

## Notes

Mention any migration, compatibility, or follow-up work.
