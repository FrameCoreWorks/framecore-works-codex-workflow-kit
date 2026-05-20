# Onboarding

Onboarding creates local configuration for one workspace. It should be run before installation unless the user explicitly provides a complete config file.

It collects:

- working language
- response tone
- local display names for agents
- output directory
- QA strictness
- optional recurring workflow self-improvement review
- optional full Hipson setup guidance

Default choices are conservative: project-local install, no automatic upload, standard QA, lightweight Hipson Adapter only, and recurring self-improvement review disabled.

Onboarding writes `framecore.config.json`. The installer reads this file when rendering local agent files. If the file is missing, install can still run with built-in defaults, but tuned preferences will not be applied.

Existing project instructions are protected. If a target workspace already has `AGENTS.md`, project-local install writes FrameCore instructions to `AGENTS.framecore.md` unless the user explicitly passes `--force`.

## What Onboarding Changes

Onboarding changes local workspace behavior:

- agent display names for neutral role IDs
- language and response tone
- output folder
- QA strictness
- delivery preference
- optional report-only workflow review
- optional interest in full Hipson expansion

Onboarding does not change public workflow logic:

- skill contracts
- role IDs
- gates and handoffs
- provider-neutral boundary
- privacy rules
- installer safety rules

User-specific onboarding files should stay local to the workspace where they were generated.
