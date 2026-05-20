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

## Validation

`npm run validate` checks that:

- every gate-required artifact has a matching schema or a valid alternative schema;
- every schema has a matching template section;
- every required schema field appears in its template section;
- every schema registers at least one public fixture path;
- every registered example fixture exists;
- every registered example fixture contains all required fields.

## Adding An Artifact

When adding a new workflow artifact:

1. Add the artifact section to `artifact-templates.md`.
2. Add the artifact and its `required_fields` to `config/artifact-schemas.json`.
3. Register at least one safe repo-relative fixture path in `example_paths`.
4. Update the gate registry or handoff matrix only if the artifact changes workflow routing.
5. Run `npm run validate`.

Contract fixtures are validation assets. They show the minimum required field shape and should stay generic, provider-neutral, and free of private project context.
