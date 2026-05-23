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
npm run secret:scan
npm run syntax:check
npm run agent:check
npm run smoke:install
npm run release:check
npm run package:list
```

The default validate workflow runs on pull requests and pushes to `main` on Ubuntu with Node 20 and 22. The path-sensitive cross-platform workflow covers Ubuntu, macOS, and Windows with Node 20 for installer, test, config, package, and workflow changes, and can still be run manually before releases. Keep path handling portable and avoid shell-specific assumptions in scripts and tests.

The repo uses `.editorconfig` and `.gitattributes` to keep text files UTF-8, LF-normalized, final-newline terminated, and space-indented across macOS, Linux, and Windows.

Pull requests should explain:

- what changed
- why the change is needed
- what files are affected
- how it was verified
- whether release notes, package contents, or tag planning are affected
- whether install, update, repair, uninstall, onboarding, or generated agent files are affected

## Docs Update Rule

If a pull request changes a skill contract, role, gate, handoff, artifact template, install behavior, or validation rule, update the matching docs or examples in the same pull request. At minimum, check whether these files need edits:

- `docs/workflow-stages.md`
- `docs/architecture.md`
- `docs/onboarding.md`
- `docs/example-authoring.md`
- `docs/release.md`
- `examples/README.md`
- the closest workflow example under `examples/`

Do not include generated outputs, local configs, private project context, credentials, user-specific agent names, or local machine paths.

For versioned releases, follow [Release Guide](docs/release.md).
