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

Pull requests should explain:

- what changed
- why the change is needed
- what files are affected
- how it was verified
- whether install, update, repair, uninstall, onboarding, or generated agent files are affected

Do not include generated outputs, local configs, private project context, credentials, user-specific agent names, or local machine paths.
