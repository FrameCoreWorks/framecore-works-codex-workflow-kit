---
name: onboarding-preference-tuning
description: Use this skill for first-run setup of FrameCore Works Skill Kit, including user preferences, local agent display names, output paths, QA strictness, delivery behavior, optional recurring workflow review, and optional full Hipson expansion.
---

# Onboarding Preference Tuning

Use this skill to guide first-run setup and local preference tuning. It explains what the kit installs, what stays neutral in the public repo, and what the user can personalize locally.

## When To Use

Use this skill when:

- A new user installs or tests the kit for the first time.
- Local display names, language, tone, output path, QA strictness, or delivery behavior need to be configured.
- The user needs a plain explanation of the workflow before answering setup questions.

Do not use this skill to rewrite public repo defaults, enable global install without consent, or connect optional external tools automatically.

## Inputs

Required:

- `install_scope`: project-local by default, global only when explicitly chosen.
- `workspace_target`: the local workspace where files will be installed.
- `user_preferences`: answers from onboarding prompts or defaults.

Optional:

- `agent_display_names`: local names for neutral role IDs.
- `workflow_types`: common work such as graphics, video, ecommerce, storyboard, documents, or coded video.
- `hipson_interest`: whether the user wants only the adapter or later full Hipson expansion.
- `recurring_review_opt_in`: explicit choice for report-only workflow review.

## Outputs

Produce local onboarding configuration with:

- working language and response tone
- local agent display names
- output directory
- QA strictness and delivery behavior
- lightweight Hipson Adapter default
- optional recurring review recipe only when opted in

## Process

1. Explain the kit in plain language before collecting preferences.
2. State that skills and roles are workflow contracts, while onboarding only tunes local behavior.
3. Ask only for preferences needed to render local config.
4. Default to project-local install and standard QA.
5. Render local config without committing user-specific preferences to the public repo.

## Decision Rules

- Use defaults when the user presses enter or gives no strong preference.
- Keep recurring workflow review disabled unless the user opts in.
- Keep full Hipson separate and optional.
- If the user asks for global install, explain scope before applying it.

## Guardrails

- Do not collect secrets, API keys, private cloud credentials, or private project data.
- Do not overwrite existing user files without backup or confirmation.
- Do not enable upload, publishing, external execution, or recurring review silently.
- Do not commit local display names or user preference files into the public repo.

## Handoff

Review gate: `workflow_route`.

Hand off to installer or renderer with:

- `install_scope`
- `workspace_target`
- `agent_display_names`
- `working_language`
- `response_tone`
- `output_dir`
- `qa_strictness`
- `optional_features`

## QA Checklist

- User understands what is being installed.
- Project-local is the default scope.
- Personalization is local and not committed.
- Hipson Adapter is lightweight by default.
- Recurring review is opt-in and report-only.
- Existing files are protected by backup or refusal.
