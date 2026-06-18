# Bundle Readiness

## Purpose

This guide describes how FrameCore Works Skill Kit should evolve toward future Codex plugin or bundle packaging without rewriting the current repository too early.

It is a repo-governance planning document, not a published plugin manifest, marketplace promise, or install behavior change.

## Strategic Signal

OpenAI's June 2, 2026 "Codex for every role, tool, and workflow" product note points toward Codex plugins that bundle apps, skills, instructions, and workflows for role-specific work.

FrameCore Works already follows much of that shape locally:

- project instructions in `AGENTS.template.md`
- workflow skills in `.agents/skills/`
- role agents in `.codex/agents/*.toml.template`
- routing, gates, handoffs, and artifact contracts in `pipeline-core`
- onboarding and project-local configuration
- install lifecycle commands for dry-run, project-local install, update, repair, and uninstall
- provider-neutral execution boundaries and privacy checks

The right response is controlled readiness. Keep the current public kit stable, then make bundle boundaries explicit enough that a future plugin package can be assembled without a major rewrite.

## Current Bundle-Like Assets

These assets are already reasonable public bundle candidates:

- `AGENTS.template.md` as the durable project instruction surface.
- `.agents/skills/*/SKILL.md` as reusable workflow skills.
- `.codex/agents/*.toml.template` as Codex role-agent templates.
- `.agents/skills/pipeline-core/` as the routing, gate, handoff, artifact, and policy spine.
- `docs/workflow-map.md` and `docs/included-agents-and-skills.md` as human-readable inventory and relationship maps.
- `config/artifact-schemas.json`, `config/provider-neutral-policy.json`, and `config/text-image-policy.json` as public contract registries.
- `examples/*/workflow.json` as machine-checked route examples.
- `templates/Memory Cache/` and memory tools as local recovery scaffolding.
- `scripts/install.mjs`, `scripts/guided-install.mjs`, `scripts/doctor.mjs`, and `scripts/render-agents.mjs` as the current project-local installation layer.

## Partial Readiness

Some areas are usable today but need clearer package boundaries before they become plugin-ready:

- Memory Cache is a strong recovery pattern, but it should stay local-state tooling, not a shared transcript or permission layer.
- HyperFrames guidance is safe as coded-video workflow knowledge, but rendering runtimes stay user-selected and local.
- Hipson Adapter is safe as lightweight packet guidance. Full Hipson remains separate and optional.
- Built-in Codex or ChatGPT image generation is a policy route, not an external paid provider bundle.
- ChatGPT Skills can reuse the workflow skill layer, but they should map role agents to temporary task roles instead of packaging `.codex/agents/*.toml` as persistent ChatGPT agents.
- Team configuration is documented, but default installs should remain personal and project-local.

## Packaging Blockers

These gaps should be resolved before any serious plugin or bundle packaging work:

- No explicit module boundary separates core pipeline, creative workflow, ecommerce workflow, provider governance, and delivery governance.
- Delivery integrations and cloud destinations must stay outside the public bundle unless they are optional, credential-free, and reviewed.
- Existing examples validate workflow contracts, but they do not yet classify which bundle module each example exercises.
- Live Codex custom-agent behavior remains a manual E2E check, not an automated plugin compatibility gate.

## Source Bundle Map

`config/bundle-map.json` is the current source-level bundle readiness map. It classifies existing source assets by future package boundary without changing install behavior.

The map tracks:

- `source_paths`: public repo files or directories that belong to the boundary
- `skills`: skill folders expected under `.agents/skills/`
- `roles`: role IDs expected under `.codex/agents/*.toml.template`
- `examples`: example workflow folders under `examples/`
- `dependencies`: other bundle IDs this boundary depends on
- `private_exclusions`: local or private material that must stay outside public bundles

Validation checks that mapped paths, skills, roles, examples, and dependencies exist. It does not create a plugin or split the package.

## Recommended Future Bundle Shape

Prefer several focused bundles over one oversized package:

| Bundle | Public contents | Keep outside by default |
| --- | --- | --- |
| `framecore-pipeline-core` | AGENTS template, pipeline-core, gates, handoffs, artifact schemas, Memory Cache templates | private project state, raw transcripts, local recovery folders |
| `framecore-creative-workflow` | brief, reference, direction, copy, prompt, storyboard, QA, delivery-doc skills | generated outputs, private references, client context |
| `framecore-ecommerce-workflow` | ecommerce examples and future ecommerce-specific contracts | private product data, claims, storefront credentials |
| `framecore-provider-governance` | provider-neutral policy, text-image policy, execution boundaries | provider clients, credentials, endpoint catalogs, provider CLIs |
| `framecore-chatgpt-skills-onboarding` | ChatGPT skill onboarding, temporary role mapping, skill packaging guidance | `.codex/agents/*.toml` as permanent ChatGPT agents, local manifests, workspace files |
| `framecore-hyperframes-guidance` | coded-video planning guidance and QA contracts | render runtimes, deployment targets, paid execution routes |
| `framecore-hipson-adapter` | lightweight packet templates and boundary docs | full Hipson clone, cross-repo scanning tools, private sidecars |

This repo can continue to ship one installable kit while these boundaries are documented. Actual package splitting should wait until a real plugin format or user need justifies it.

## Public Installable Files

Treat these as public, installable, or packageable source:

- `AGENTS.template.md`
- `.agents/skills/`
- `.codex/agents/*.toml.template`
- `docs/chatgpt-skills-onboarding.md`
- `config/*.json` and `config/*.example.json`
- `examples/`
- `templates/Memory Cache/`
- `scripts/` and `tools/` that are credential-free and provider-neutral by default
- public docs under `docs/`

## Local Workspace Governance

Keep these out of future public bundles by default:

- `framecore.config.json`
- `.framecore/manifest.json` from a user's installed workspace
- local agent display names that identify one private workflow
- `Context/`
- `Memory Cache/` from active projects or chats
- generated outputs, delivery folders, logs, backups, and cache folders
- private Google Drive or cloud delivery destinations
- provider credentials, endpoint catalogs, API-key setup flows, or activation scripts
- full Hipson checkout or private companion repositories
- permanent ChatGPT agent files derived from `.codex/agents/*.toml`

## Staged Readiness Plan

1. Fix public recovery and docs references so they only point to files installed by this repo.
2. Add this guide and link it from README and Roadmap.
3. Keep extending the source-level bundle map as modules become clearer.
4. Extend validation when new bundle-map fields become required.
5. Classify examples by the future bundle module they exercise.
6. Keep ChatGPT Skills support as onboarding and temporary-role guidance until a stable package target requires exported skill bundles.
7. Keep plugin-specific files out of source until the target plugin format is concrete.

## Governance Rules

- Do not rewrite the repo around a speculative plugin structure.
- Do not weaken provider-neutral policy for packaging convenience.
- Do not bundle credentials, provider CLIs, endpoint catalogs, private cloud delivery settings, generated outputs, or private project context.
- Do not split packages until the current monorepo shape becomes an actual maintenance blocker.
- Prefer branch or RFC work for plugin experiments before changing install behavior.

## Acceptance Criteria

A future bundle-readiness patch is healthy when:

- the project-local install path still works
- `npm run check` passes
- package audit still rejects private or unintended files
- public docs say what is installable and what stays local
- bundle boundaries preserve QA, provider locks, upload consent, and Memory Cache safety
- no user must understand plugin packaging to use the beginner install flow

## Related Docs

- [Architecture](architecture.md)
- [Workflow Map](workflow-map.md)
- [Provider-Neutral Boundary](provider-neutral-boundary.md)
- [Memory Cache](memory-cache.md)
- [Compatibility](compatibility.md)
- [Migration Guide](migration-guide.md)
- [Roadmap](roadmap.md)
