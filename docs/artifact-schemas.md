# Artifact Schemas

FrameCore Works treats workflow artifacts as contracts. The Markdown templates describe the human-readable shape of each artifact, and `config/artifact-schemas.json` records the required fields that validation can check.

## Purpose

The schema registry prevents drift between:

- gate-required artifacts
- artifact template sections
- example artifact fixtures
- future workflow additions

It is intentionally lightweight. It is not a full JSON Schema system and it does not constrain artifact prose, nested bullets, or creative content. It checks that required contract fields exist where the workflow depends on them.

## Files

- `config/artifact-schemas.json`: canonical registry of artifact names, required fields, and optional example fixture paths.
- `.agents/skills/pipeline-core/templates/artifact-templates.md`: human-readable artifact templates.
- `examples/end-to-end-creative-workflow/artifacts/*.md`: validated example fixtures for the public end-to-end workflow.
- `examples/contract-fixtures/artifacts/*.md`: minimal validation fixtures for artifact contracts that do not naturally appear in the end-to-end example.

## Schema Contract

Each schema entry should describe one artifact contract that the workflow can validate. Use:

- `name` for the exact artifact heading used by templates, gates, and examples.
- `required_fields` for the human-readable field labels that must appear in the template and fixture.
- `example_paths` for safe repo-relative Markdown fixtures that prove the contract is usable.

Keep field names stable once public examples rely on them. If a field needs to change, update the schema, template section, fixture, example workflow manifest, and changelog together.

Project State is the durable recovery artifact for active workflow runs. Its schema should keep enough information for a new Codex session to resume safely: last completed gate, unresolved decisions, blockers, touched files, visible risks, next action, and `recovery_prompt`.

## Fixture Rules

Fixtures are public validation assets, not private production examples. They should be:

- provider-neutral
- generic enough for public reuse
- free of private project context
- free of local absolute paths
- free of secrets, credentials, personal emails, and private cloud IDs
- short enough to show the required shape without pretending to be a full client delivery

Use `examples/contract-fixtures/artifacts/` for minimal fixtures when the artifact is not naturally present in the end-to-end example.

## Validation

`npm run validate` checks that:

- every gate-required artifact has a matching schema or a valid alternative schema;
- every schema has a matching template section;
- every required schema field appears in its template section;
- every schema registers at least one public fixture path;
- every registered example fixture exists;
- every registered example fixture contains all required fields.

Validation does not judge creative quality. It only checks that artifact contracts have enough structure for gates, handoffs, examples, and downstream roles to agree on the same fields.

## Adding An Artifact

When adding a new workflow artifact:

1. Add the artifact section to `artifact-templates.md`.
2. Add the artifact and its `required_fields` to `config/artifact-schemas.json`.
3. Register at least one safe repo-relative fixture path in `example_paths`.
4. Update the gate registry or handoff matrix only if the artifact changes workflow routing.
5. Run `npm run validate`.

Contract fixtures are validation assets. They show the minimum required field shape and should stay generic, provider-neutral, and free of private project context.

## Halt Conditions

Do not merge an artifact change when:

- a gate-required artifact has no schema;
- a schema has no matching template section;
- a template section omits a required field;
- `example_paths` points outside public Markdown examples;
- the fixture uses private project context, credentials, local absolute paths, or external provider execution state;
- the route in `workflow.json` references an artifact that the schema registry cannot validate.
