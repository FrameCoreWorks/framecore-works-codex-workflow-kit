# Workflow Self-Improvement

## Purpose

The workflow self-improvement skill turns completed work into auditable improvement logs and change proposals.

It is governance, not automation that silently rewrites the workflow. The skill helps maintainers notice repeated friction, QA failures, unclear handoffs, missing docs, or weak artifacts, then propose bounded changes for human review.

## Invocation Rules

Use workflow self-improvement only when:

- the user explicitly asks for retrospective review, workflow audit, lessons learned, or improvement proposals
- the local user opted into the report-only recurring review recipe during onboarding
- the workflow-orchestrator routes a completed task into retrospective review

It is explicit-only. It must not run as a hidden daemon, background learner, automatic editor, upload process, provider runner, or destructive maintenance job.

## Evidence Inputs

Use evidence from completed work only:

- accepted and rejected artifacts
- QA / Iteration Reports
- Delivery Manifests
- failed validations or tests
- user feedback
- repeated handoff gaps
- documented support or troubleshooting cases

Separate facts, inferences, and suggestions. Do not invent lessons when there is no evidence.

Do not include private project context, secrets, local paths, private cloud links, emails, generated confidential output, or provider credentials in public logs or proposals.

## Report-Only Automation

The optional automation recipe lives at `config/automation-recipes/workflow-self-improvement-review.example.json`.

It is disabled by default during onboarding. If the user enables it, the recipe remains report-only:

- no automatic edits
- no uploads
- no external execution
- no destructive operations
- no provider activation
- no hidden daemon behavior

Recurring review may create retrospective notes and change proposals only. It may not mutate skills, agents, `AGENTS.md`, docs, config, gates, handoffs, tests, or release files.

## Proposal Contract

Use `.agents/skills/workflow-self-improvement/templates/improvement-log.md` for retrospective notes.

Use `.agents/skills/workflow-self-improvement/templates/change-proposal.md` for proposed workflow changes.

Every change proposal must include:

- problem
- evidence labels
- affected agents, gates, handoffs, skills, docs, tests, or files
- proposed change
- expected benefit
- risk
- rollback note
- acceptance test
- decision owner
- status

Weak proposals should stay in draft status. A proposal without evidence, risk, rollback, and acceptance test is not ready for adoption.

## Adoption Flow

Workflow self-improvement can propose changes, but it cannot adopt them by itself.

Adoption requires:

1. workflow-orchestrator review of scope and routing
2. explicit user or maintainer approval before mutation
3. a patch that changes the smallest relevant files
4. updated docs, tests, examples, or validation when behavior changes
5. successful verification before release or handoff

Use `qa-iteration` only when the workflow-orchestrator routes a proposal for QA review.

## Forbidden Actions

The skill must not:

- edit workflow files without explicit approval
- rewrite `AGENTS.md`, skills, agents, gates, handoffs, templates, or docs automatically
- upload logs, reports, artifacts, or proposals
- run provider tools or external execution
- run destructive operations
- store hidden memory
- convert a report-only recurring review into an auto-patching workflow
- weaken privacy, provider-neutrality, text-image policy, install safety, or release gates

## Validation And Release Checks

Before adopting a workflow self-improvement proposal in this repo, run the relevant local checks:

```bash
npm run audit:privacy
npm run validate
npm test
npm run release:check
```

For release-facing changes, update `CHANGELOG.md`, release notes, examples, and docs as needed.

## Halt Conditions

Stop adoption when:

- evidence is missing or speculative
- the proposal requires private project context
- the proposal would add bundled provider execution or credential handling
- the change would mutate user-owned files by default
- rollback is unclear
- validation or tests fail
- the user or maintainer has not explicitly approved mutation

## Output Summary

Every proposal must produce only logs, proposals, or summaries until adoption is explicitly approved.

The final summary should say what was observed, what was proposed, what remains unapproved, and which checks would be needed before any workflow mutation.
