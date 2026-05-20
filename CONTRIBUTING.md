# Contributing

FrameCore Works Skill Kit is provider-neutral and configurable for user language preferences during onboarding.

## Contribution Scope

Contributions must:

- use neutral role IDs, not private names
- avoid private project context and local paths
- keep skills concise and progressively disclosed
- preserve the text-bearing image policy
- keep external execution integrations optional and user-configured
- include validation coverage for new gates, handoffs, or templates

Good contribution types:

- installer safety fixes
- onboarding clarity
- workflow skill improvements
- examples and documentation
- validation and privacy-audit coverage
- provider-neutral HyperFrames, Humanizer, Hipson Adapter, QA, and delivery workflow improvements

## Pull Request Checklist

Before opening a pull request, run:

```bash
npm run check
npm pack --dry-run
```

CI runs the same checks on Linux, macOS, and Windows with Node 20 and 22. Keep path handling portable and avoid shell-specific assumptions in scripts and tests.

Pull requests should explain:

- what changed
- why the change is needed
- what files are affected
- how it was verified
- whether install, update, repair, uninstall, onboarding, or generated agent files are affected

## Docs Update Rule

If a pull request changes a skill contract, role, gate, handoff, artifact template, install behavior, or validation rule, update the matching docs or examples in the same pull request. At minimum, check whether these files need edits:

- `docs/workflow-stages.md`
- `docs/architecture.md`
- `docs/onboarding.md`
- `examples/README.md`
- the closest workflow example under `examples/`

Do not include generated outputs, local configs, private project context, credentials, user-specific agent names, or local machine paths.
