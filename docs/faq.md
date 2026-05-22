# FAQ

## Purpose

This FAQ answers the questions a new user is most likely to ask before installing or using FrameCore Works Skill Kit. It is a short orientation layer; the detailed procedures live in Quickstart, Codex-Assisted Install, CLI Reference, and Troubleshooting.

## Install Questions

### Do I paste the GitHub link into Codex or run commands myself?

Both paths are supported. Beginners can paste the README instruction into Codex and ask it to clone the repo into a temporary or tools folder outside the target workspace. Advanced users can clone the repo manually and run the guided installer.

### What is the safest install command?

Use the guided installer:

```bash
npm run install:guided -- --target /path/to/your/project
```

It runs checks, doctor/preflight, onboarding, dry-run, and project-local install in the expected order.

### Does setup require global install?

No. Project-local install is the default and recommended path. Global install is advanced-only and requires an explicit `--confirm-global` flag.

### Can I install into a missing folder?

The beginner path expects the target workspace to already exist. Lower-level scripts can create a target only when `--create-target` is explicitly passed, but that should be intentional.

## Configuration Questions

### Where are my preferences stored?

Onboarding writes `framecore.config.json` in the target workspace. It stores local choices such as language, tone, output directory, QA strictness, delivery behavior, local display names, and optional workflow self-improvement preference.

### Can I rename the agents?

Yes. Public source uses neutral role IDs, while onboarding can render local display names into the installed workspace. Those local display names should not be committed back to the public repo.

### What happens if my project already has `AGENTS.md`?

The installer preserves the existing project instructions and writes FrameCore instructions to `AGENTS.framecore.md`. The user or maintainer can then decide how to merge local project instructions.

## Workflow Questions

### What kind of work is this kit for?

The kit is built for creative workflow planning and production support: graphics, video, storyboards, ecommerce assets, prompt packs, coded-video briefs, QA reports, delivery manifests, and workflow retrospectives.

### Does it generate final media by itself?

No external media execution is enabled by default. The kit produces workflow artifacts, prompts, manifests, QA notes, and delivery documentation. Execution tools can be added separately by the user.

### What should I ask Codex after installation?

Start with a concrete workflow request, for example: "Plan a static ecommerce campaign for this product using the installed FrameCore workflow. Do not use external execution tools." See Using The Kit for starter prompts.

## Provider And Safety Questions

### What does provider-neutral mean?

Provider-neutral means this repo does not ship external paid media-provider clients, provider CLIs, endpoint catalogs, provider credentials, API-key setup flows, or paid execution routes.

### What about text-bearing graphics?

Static raster graphics with visible text use the built-in Codex/ChatGPT image generation capability powered by GPT Image 2 in one pass when that capability is available. Do not add text later with overlays unless the user explicitly asks for a coded or vector artifact.

### Does the repo include secrets or private project context?

It should not. The privacy audit rejects private names, local absolute paths, personal emails, secret-like values, private cloud links or IDs, excluded provider remnants, and AppleDouble metadata files.

## Hipson And HyperFrames

### Is full Hipson installed?

No. This kit includes a lightweight Hipson Adapter only. Full Hipson remains separate and optional, and setup does not clone, install, or activate full Hipson.

### What does the Hipson Adapter do?

It prepares research maps, internet mapping packets, bounded instruction packets, review packets, execution packets, and handoff support inside this workflow architecture.

### What is HyperFrames in this kit?

HyperFrames is treated as a coded-video workflow path, not as a paid media-provider integration. The kit includes planning guidance for scene structure, GSAP motion notes, captions, render QA, and delivery manifests.

## Updates And Uninstall

### How do updates work?

Use `node scripts/install.mjs --mode update --target <path>` after reviewing doctor/preflight and dry-run behavior. Update requires `.framecore/manifest.json` so it can distinguish managed files from user-owned files.

### How does repair differ from update?

Repair recreates only manifest-recorded files. Update can expand the managed file set when the kit adds new managed files.

### How do I uninstall?

Run uninstall first as a preview:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project
```

Apply removals only after reviewing the preview:

```bash
node scripts/install.mjs --mode uninstall --target /path/to/your/project --yes
```

## Troubleshooting

### What should I run before opening an issue?

Run:

```bash
npm run cleanup:appledouble -- --apply
npm run release:check
```

If install failed in a target workspace, also run doctor/preflight for that target and include sanitized finding codes in the report.

### What should I not paste into an issue?

Do not paste secrets, tokens, provider keys, personal emails, private cloud folder IDs, local absolute paths, private client context, or generated outputs that contain private material.

## Related Docs

- [Quickstart](quickstart.md)
- [Codex-Assisted Install](codex-assisted-install.md)
- [CLI Reference](cli-reference.md)
- [Using The Kit](using-the-kit.md)
- [Troubleshooting](troubleshooting.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Hipson Integration](hipson-integration.md)
- [HyperFrames](hyperframes.md)
