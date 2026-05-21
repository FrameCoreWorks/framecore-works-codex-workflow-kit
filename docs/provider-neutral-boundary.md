# Provider-Neutral Boundary

## Purpose

FrameCore Works is provider-neutral by default. It installs workflow structure, planning contracts, role files, skills, templates, gates, examples, validation, and privacy checks. It does not install paid execution systems.

This boundary keeps the public kit reusable for different users, teams, toolchains, and budgets.

## What Provider-Neutral Means

Provider-neutral means the kit can plan, route, QA, document, and package creative workflow decisions without bundling an external paid media execution provider.

The kit may create:

- briefs, reference packs, direction contracts, prompt packs, QA reports, manifests, and delivery notes
- tool-neutral execution manifests
- user-readable instructions for later execution
- local configuration generated during onboarding

The kit must not ship:

- external paid media-provider clients
- provider CLIs
- endpoint catalogs
- provider credentials
- API-key setup flows
- provider-specific activation phrases
- private cloud delivery settings
- generated confidential outputs

## Built-In Chat Image Exception

The text-bearing image policy is an intentional built-in capability boundary, not an external paid provider integration.

When a static raster graphic needs visible text, the workflow should use native Codex or ChatGPT image generation powered by GPT Image 2 in one pass when that capability is available. The final visible text belongs in the generation prompt and should not be added later with overlays unless the user explicitly asks for a coded or vector artifact.

## Coded Video Boundary

HyperFrames is treated as coded-video workflow knowledge. It can guide scene structure, animation timing, captions, overlays, render QA, and delivery manifests.

The public kit does not treat HyperFrames guidance as a paid external media-provider bundle. Any actual rendering runtime remains user-selected and local to the user's project.

## Hipson Boundary

The included Hipson Adapter is lightweight. It creates research maps, internet mapping packets, bounded instruction packets, review packets, and execution packets inside this workflow.

Full Hipson remains separate and optional. Users can connect the full Hipson repository later if they want broader repository scanning, delta reviews, sidecar agents, full knowledge packs, cross-repo orchestration, CLI commands, and complete Hipson workflow assets.

## User-Configured Extensions

Users may add their own external tools in their own workspaces. Those integrations should stay outside this public kit unless they remain optional, provider-neutral, credential-free, and safe for public distribution.

When a user adds a local extension, document it in that user's project instructions, not in the public kit source.

## Release Gate

Stop a public release if it adds bundled external paid execution providers, provider credentials, provider CLIs, endpoint catalogs, API-key setup flows, private cloud delivery settings, or provider-specific activation paths.

Keep this boundary aligned with:

- `config/provider-neutral-policy.json`
- `config/text-image-policy.json`
- `docs/text-image-policy.md`
- `docs/compatibility.md`
- `docs/release.md`
