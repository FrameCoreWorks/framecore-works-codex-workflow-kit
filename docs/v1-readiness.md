# v1.0 Readiness

## Purpose

This checklist defines what maintainers should verify before calling FrameCore Works Skill Kit a v1.0 release.

It is stricter than the normal release checklist. A patch or prerelease can ship with known limitations. A v1.0 release should be stable enough for a new public user to install, understand, customize, update, repair, uninstall, and support safely.

## Required State

Before v1.0, the repo should satisfy all of these:

- project-local install is the default and documented first
- global install is clearly marked advanced and requires explicit confirmation
- guided install, manual install, update, repair, and uninstall are documented and tested
- onboarding explains what is installed, what is not installed, and how local preferences affect the workspace
- role source IDs remain neutral, with local display names generated only during onboarding
- provider-neutral boundary is documented and validated
- text-bearing raster graphics keep the GPT Image 2 one-pass policy
- Hipson Adapter remains lightweight. Full Hipson remains separate and optional.
- workflow self-improvement remains explicit-only and proposal-only
- workflow self-improvement governance documents invocation rules, evidence, report-only automation, adoption, forbidden actions, validation, and halt conditions
- examples cover the main public workflow paths
- Project State includes durable recovery fields for context loss, blockers, touched files, next action, and `recovery_prompt`
- package contents are audited before release
- security, support, issue templates, and repository settings are aligned with public-source safety

## Install And Lifecycle

v1.0 requires stable lifecycle behavior:

- `npm run install:guided` runs the safe beginner path
- `npm run doctor` reports readiness without mutating the target
- dry-run reports planned writes without writing managed workflow files
- project-local install preserves user-owned files by default
- update requires an existing manifest and may add new managed paths
- repair requires an existing manifest and rewrites only manifest-recorded paths
- uninstall removes only manifest-recorded files and refuses unsafe paths
- backups are rotated instead of silently overwritten

## Onboarding

Onboarding must be understandable to a beginner user. It should explain:

- what workflow assets will be installed
- how the kit helps with graphics, video, storyboards, ecommerce assets, prompts, QA, and delivery preparation
- what remains outside the public kit
- working language and tone preferences
- output directory
- QA strictness
- delivery behavior
- local agent display names
- optional recurring workflow self-improvement review
- lightweight Hipson Adapter scope and optional full Hipson expansion

Onboarding must not request secrets, provider credentials, private cloud paths, or private project context.

## Examples

Public examples should cover the main workflow categories:

- minimal workflow
- end-to-end creative workflow
- static campaign
- ecommerce product visual
- video storyboard
- storyboard board artifact
- image prompt pack
- HyperFrames coded-video workflow
- document workflow
- QA and delivery-only review
- no external execution mode

Each example should have a validated `workflow.json` manifest and should avoid private context, local paths, credentials, private cloud references, and generated confidential output.

## Documentation

v1.0 docs should give a new user a complete path:

- README starts with a Codex-assisted install instruction and points to Quickstart
- Quickstart covers guided install, manual install, global install safety, Windows target setup, installed tree, update, repair, and uninstall
- Using The Kit gives post-install starter prompts, route choice guidance, execution boundaries, Hipson Adapter prompts, and safety reminders
- Troubleshooting covers common install, privacy, package, config, Codex loading, update, repair, uninstall, and text-image issues
- Architecture explains roles, skills, gates, handoffs, artifacts, examples, and provider boundaries
- Example Authoring explains how maintainers add validated public examples without weakening privacy or route checks
- Compatibility explains Node.js, OS expectations, Codex assumptions, install modes, manifests, external tool boundary, and support baseline
- Migration Guide explains role ID migration, local config boundaries, manifest lifecycle, update, repair, rollback, validation, and release notes
- Release, Roadmap, Repository Settings, Security, Support, and Contributing stay aligned with current behavior
- Team Configuration explains what stays local, what may be shared intentionally, and how to review shared config

## Validation Gates

Before v1.0, these must pass locally:

```bash
npm run cleanup:appledouble -- --apply
npm run check
npm run smoke:install
npm run package:audit
npm run package:list
npm run release:readiness -- --tag v1.0.0
npm run release:check
```

The path-sensitive cross-platform GitHub Actions workflow should pass for portability-sensitive changes. Maintainers should also run it manually before creating the v1.0 tag.

## Halt Conditions

Do not tag v1.0 when any of these are true:

- privacy audit fails
- workflow validation fails
- tests fail
- package audit fails
- cross-platform workflow is red for install, path, manifest, onboarding, package, or validation behavior
- release notes omit compatibility or migration notes
- docs describe behavior that scripts do not implement
- public source contains private context, local paths, private cloud references, credentials, excluded provider remnants, generated outputs, backups, or cache files
- external paid execution providers, provider CLIs, endpoint catalogs, credential setup, or provider-specific activation paths are bundled into the public kit

## Sign-Off

Before tagging v1.0, maintainers should record:

- package version
- tag
- latest local `npm run release:check` result
- latest package audit result
- latest path-sensitive or manual cross-platform workflow result
- package contents review status
- known limitations kept in release notes
- migration notes for users updating from earlier versions
