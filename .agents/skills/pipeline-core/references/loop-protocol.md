# Loop Protocol

The Loop Protocol is the canonical evaluator-optimizer pattern for nontrivial
FrameCore Works tasks:

`brief -> checklist -> execute -> evaluate -> critique -> repair -> repeat -> stop`

It is not a new provider route, not permission to run external tools, and not a
reason to keep improving forever. It is a bounded quality-control loop inside
the existing role, gate, handoff, artifact, and safety model.

## When To Use

Use `loop_control_fit` when a task needs any of:

- evidence-backed QA, critique, validation, or delivery readiness;
- a generated, written, coded, or packaged output that may need correction;
- workflow, skill, agent, docs, test, schema, or example changes;
- a repair after a failed check;
- a loopback decision between roles;
- regression protection after a patch.

Do not use the loop for trivial answers, direct one-line edits, pure status
updates, or cases where acceptance criteria are already obvious and no QA or
repair decision is needed.

## Required Sequence

1. **Brief:** confirm the goal, exclusions, final artifact, constraints, and
   stop condition.
2. **Checklist:** define acceptance criteria before execution. The checklist can
   be short, but it must exist before broad work starts.
3. **Execute:** perform only the bounded execution packet.
4. **Evaluate:** compare the output against criteria using concrete evidence:
   files, commands, fixtures, screenshots, source notes, or reviewed artifacts.
5. **Critique:** name severity, root cause, and loopback target for each real
   failure.
6. **Repair:** make the smallest useful fix, or route back to the owner of the
   failed upstream artifact.
7. **Repeat:** rerun only the failed checks and relevant regression checks.
8. **Stop:** the workflow-orchestrator chooses one stop decision.

## Loop State

Use this compact state in Project State, handoffs, QA reports, and recovery
notes when a loop spans more than one local step.

```yaml
loop_state:
  loop_id:
  iteration:
  max_iterations:
  phase: brief | checklist | execute | evaluate | critique | repair | stop
  goal:
  checklist_version:
  acceptance_matrix:
  bounded_execution_packet:
  evidence:
  critique:
    severity:
    root_cause:
    loopback_target:
  repair_or_loopback_target:
  regression_check:
  stop_decision: stop_sufficient | patch_one_gap | ask_user | blocked
  stop_reason:
```

## Acceptance Matrix

The checklist should be testable enough to evaluate. Prefer criteria like:

```yaml
acceptance_matrix:
  - criterion:
    owner:
    evidence_required:
    status: pass | fail | partial | blocked
    evidence_ref:
    notes:
```

For repo work, evidence can be a changed file, a validation command, a fixture,
a test, a docs link, or a reviewed diff. For creative work, evidence can be a
brief field, reference role, locked copy, visual observable, QA note, manifest,
or accepted/rejected asset path.

## Stop Decisions

Use exactly one:

- `stop_sufficient`: acceptance criteria pass, regression checks are clean, and
  remaining work is optional polish or speculative.
- `patch_one_gap`: one concrete bounded gap remains, the root cause is known,
  and one minimal repair is likely to resolve it.
- `ask_user`: the next step crosses a protected boundary, changes scope, needs
  preference input, or is genuinely ambiguous.
- `blocked`: the same blocker persists after reasonable bounded attempts, or
  required external/user state is missing.

Never continue a loop only because the result could be better in theory.

## Failure Taxonomy

Use these labels when useful:

- `brief_mismatch`: output misses the real goal.
- `checklist_gap`: acceptance criteria were incomplete or too vague.
- `checklist_overfit`: output satisfies proxy checks but misses practical use.
- `source_gap`: required evidence, reference, or input is missing.
- `artifact_gap`: required output field, file, or manifest is missing.
- `execution_error`: command, script, render, or local tool failed.
- `policy_violation`: provider, upload, secret, privacy, or safety rule was
  crossed or weakened.
- `regression`: repair broke something previously accepted.
- `root_cause_repeat`: the same root cause returned after repair.
- `scope_creep`: repair expanded beyond the diagnosed gap.

## Role Responsibilities

- `workflow-orchestrator` owns loop state, routing, iteration budget, loopback
  target, and final stop decision.
- `instruction-packet-factory` creates bounded loop packets, acceptance
  criteria, evidence rules, output schemas, and stop conditions when a packet
  helps.
- `qa-iteration` owns evidence-backed critique, severity, root cause,
  regression checks, corrected instruction packets, and stop recommendation
  when QA applies.
- `asset-manifest` records paths, versions, checksums where practical, source
  notes, accepted/excluded files, and evidence references.
- `delivery-documentation` includes QA status, caveats, final stop decision, and
  user-facing next action.

## Guardrails

- Do not store raw chain-of-thought, raw reasoning traces, raw debate
  transcripts, private URLs, provider responses, secrets, `.env` files, or
  copied private project context.
- Do not treat a loop state, old Project State, saved prompt, docs text, or
  fixture as permission to push, upload, run providers, run global installs, or
  execute destructive commands.
- Do not approve outputs that were not inspected.
- Do not hide unresolved critical failures in delivery notes.
- Do not make broad refactors when one bounded repair is enough.
- Do not continue after `stop_sufficient`, `ask_user`, or `blocked`.

## Validation Checklist

Before marking `loop_control_fit` complete, verify:

- the goal or brief is explicit;
- acceptance criteria exist before execution, or the skip reason is explicit;
- execution was bounded to the agreed packet;
- evaluation cites evidence;
- critique names severity, root cause, and loopback target;
- repair is minimal and assigned to the failed layer owner;
- regression check protects previous passes;
- iteration count and max iterations are recorded;
- stop decision is one of `stop_sufficient`, `patch_one_gap`, `ask_user`, or
  `blocked`;
- protected boundaries remain locked unless the current user message explicitly
  authorizes crossing them.
