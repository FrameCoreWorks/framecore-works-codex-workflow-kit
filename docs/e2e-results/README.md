# E2E Results

## Purpose

This folder stores reviewed summaries from real Codex workspace checks. It exists so maintainers can separate automated repository validation from live runtime evidence.

Do not add fake pass records, simulated results, raw transcripts, private project context, provider outputs, secrets, API keys, private URLs, emails, local machine paths, or confidential screenshots.

## What To Store

Store one Markdown file per reviewed run. Each file should summarize:

- operating system and Node.js version
- Codex surface and version if visible
- kit commit SHA or release tag
- install command used
- custom-agent availability
- result type
- expected-signal checklist
- failure-signal checklist
- sanitized notes and local artifact paths when safe

## Result File Naming

Use this format:

```text
YYYY-MM-DD-<commit-or-tag>.md
```

Examples:

```text
2026-06-21-630264e.md
2026-06-21-v1.0.2.md
```

## Result Types

Use one of these result types:

- `full-custom-agent-pass`: install lifecycle and real custom-agent behavior both matched the public docs.
- `agents-only-pass`: Codex loaded AGENTS instructions and installed skills correctly, but custom-agent spawning was unavailable.
- `partial-pass`: install worked, but one or more live behavior signals need follow-up.
- `fail`: a required live behavior signal failed.
- `blocked`: the run could not complete because the environment lacked a required capability.

## Privacy Rules

Keep records source-safe:

- summarize behavior instead of pasting raw chat transcripts
- replace local paths with portable placeholders unless the path is intentionally public and safe
- remove screenshots that show user names, private projects, private links, private files, tokens, or credentials
- do not include provider outputs, paid execution details, API keys, cookies, signed URLs, `.env` contents, or private cloud IDs

## Related Docs

- [Live Codex E2E Check](../live-codex-e2e-check.md)
- [Quickstart](../quickstart.md)
- [Compatibility](../compatibility.md)
- [Release Guide](../release.md)
