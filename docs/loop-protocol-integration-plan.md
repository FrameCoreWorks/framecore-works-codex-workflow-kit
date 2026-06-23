# Loop Protocol Integration Plan

## Purpose

This plan rebuilds the public FrameCore Works repo around the canonical Loop
Protocol without copying a private workspace one-to-one.

The target operating model is:

`brief -> checklist -> execute -> evaluate -> critique -> repair -> repeat -> stop`

The public repo should expose a reusable, provider-neutral version of that model:
role agents, skills, gates, handoffs, artifact contracts, examples, validation,
docs, and onboarding should all agree on the same loop language.

## Current Foundation

The first integration layer is now public:

- `loop_control_fit` is a canonical gate.
- `Loop State` is a schema-backed artifact.
- Project State can record `loop_state` and `loop_evidence_refs`.
- QA / Iteration Report includes root cause, loopback target, regression check,
  and stop decision.
- Workflow blueprints and examples with QA include loop control.
- `pipeline-core` has a public `loop-protocol.md` reference.

## Rebuild Phases

### Phase 1: Contract Foundation

Goal: make Loop Protocol visible and validated.

Files:

- `.agents/skills/pipeline-core/references/loop-protocol.md`
- `.agents/skills/pipeline-core/references/gate-registry.md`
- `.agents/skills/pipeline-core/templates/artifact-templates.md`
- `config/artifact-schemas.json`
- `examples/contract-fixtures/artifacts/loop-state.md`
- `scripts/validate/*.mjs`

Acceptance:

- `npm run validate` rejects missing loop protocol, missing loop gate, missing
  Loop State template/schema/fixture, and weak loop policy phrases.

### Phase 2: Runtime Adoption

Goal: installed Codex workspaces use the loop when work is nontrivial.

Files:

- `AGENTS.template.md`
- `.agents/skills/pipeline-core/SKILL.md`
- `.codex/agents/workflow-orchestrator.toml.template`
- `.codex/agents/qa-iteration.toml.template`
- `.agents/skills/output-critic-iteration/SKILL.md`

Acceptance:

- Orchestrator owns loop state and stop decisions.
- QA owns evidence-backed critique, root cause, regression check, and stop
  recommendation.
- The installed instructions do not encourage open-ended improvement.

### Phase 3: Blueprint And Example Migration

Goal: checked public examples teach the loop instead of treating it as optional
background knowledge.

Files:

- `.agents/skills/pipeline-core/references/workflow-blueprints.md`
- `examples/*/workflow.json`
- `examples/*/README.md` where the example explains QA/iteration
- `examples/end-to-end-creative-workflow/artifacts/qa-iteration-report.md`

Acceptance:

- Examples that include QA/iteration also include `loop_control_fit` and
  `Loop State`.
- Minimal planning examples remain lightweight and do not require loop control.

### Phase 4: User-Facing Docs

Goal: beginner and maintainer docs explain what loop control does in plain
language.

Files:

- `README.md`
- `docs/loop-protocol.md`
- `docs/workflow-map.md`
- `docs/workflow-stages.md`
- `docs/artifact-schemas.md`
- `docs/agent-roster.md`
- `docs/using-the-kit.md`

Acceptance:

- A new user understands that Loop Protocol is bounded QA/repair discipline, not
  a provider, not automation, and not a reason for endless iteration.
- Maintainers know which files must change together when loop contracts change.

### Phase 5: Installer And Onboarding Fit

Goal: onboarding explains loop behavior only when useful, without overwhelming
beginners.

Files:

- `scripts/onboard.mjs`
- `docs/onboarding.md`
- `docs/getting-started-5-minutes.md`
- `docs/codex-assisted-install.md`

Acceptance:

- Beginner onboarding stays simple.
- Advanced/custom workflow onboarding can mention QA strictness and loop depth.
- No onboarding answer grants provider, upload, push, or global install rights.

### Phase 6: CI And Regression Tightening

Goal: CI catches drift between loop docs, gates, artifacts, examples, and agent
instructions.

Files:

- `scripts/validate/contracts.mjs`
- `scripts/validate/schemas.mjs`
- `scripts/validate/docs.mjs`
- `tests/validation-contracts.test.mjs`
- `tests/docs-validation.test.mjs`

Acceptance:

- Deleting `loop-protocol.md`, `loop_control_fit`, or `Loop State` fails
  validation.
- Weakening stop decisions or removing regression checks fails validation.
- Workflow examples referencing QA without loop control are caught.

## Boundaries

Do not import private workspace-only provider routes, paid tool wrappers, user
names, private folders, personal examples, secrets, or local production context.

The public repo should keep the universal loop:

- provider-neutral;
- installable project-locally;
- beginner-safe;
- validated by local scripts;
- compatible with existing role IDs, gates, handoffs, and examples.

## Stop Rule

Stop each rebuild batch when the current phase is implemented, validation passes,
and the next improvement is speculative or belongs to a later phase.
