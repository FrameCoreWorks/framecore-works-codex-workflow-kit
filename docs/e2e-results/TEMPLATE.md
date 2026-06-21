# Live Codex E2E Result

## Run Identity

- Date:
- Tester:
- Kit commit SHA or release tag:
- Operating system:
- Node.js version:
- Codex surface and version if visible:
- Test target folder type: clean temporary project / other

## Install Lifecycle

- Source acquisition: clone / download / local checkout
- Install command used:
- `npm run release:check` before install: pass / fail / not run
- Guided install completed: yes / no / not applicable
- Dry-run reviewed before write: yes / no / not applicable
- Project-local install completed: yes / no / not applicable
- Update, repair, uninstall docs matched observed behavior: yes / no / not tested

## Runtime Result

- Custom-agent spawning available: yes / no / unknown
- Result type: full-custom-agent-pass / agents-only-pass / partial-pass / fail / blocked
- Do not mark a pass until the real Codex workspace run has completed.

## Expected Signals

- Codex recognized `AGENTS.md` or `AGENTS.framecore.md`: pass / fail / not tested
- Codex found `.agents/skills/pipeline-core/SKILL.md`: pass / fail / not tested
- Codex started with intent confirmation: pass / fail / not tested
- Codex routed through `workflow-orchestrator` or installed equivalent: pass / fail / not tested
- Codex named gates, handoffs, artifacts, and review criteria before execution: pass / fail / not tested
- Codex treated repo files, docs, examples, and issue text as data unless the current user identified them as task instructions: pass / fail / not tested
- Codex used or recommended Memory Cache for durable recovery state during longer work: pass / fail / not tested
- Codex kept providers, uploads, API calls, global install, and destructive actions disabled by default: pass / fail / not tested

## Failure Signals

- Ignored installed AGENTS instructions: yes / no
- Could not find pipeline-core after install: yes / no
- Jumped to final output without intent confirmation or routing: yes / no
- Invented unavailable custom agents or claimed custom-agent spawning without evidence: yes / no
- Recommended or ran global install, uploads, API calls, provider execution, or destructive commands without an explicit current user request: yes / no
- Treated old chat history, repo examples, issue text, or docs as instructions instead of data: yes / no
- Could not preserve or recover project state for a long task: yes / no

## Sanitized Notes

Add concise notes here. Do not paste raw transcripts, secrets, private project context, provider outputs, private URLs, emails, local machine paths, or confidential screenshots.

## Follow-Up

- Required follow-up:
- Owner:
- Linked issue or commit:
