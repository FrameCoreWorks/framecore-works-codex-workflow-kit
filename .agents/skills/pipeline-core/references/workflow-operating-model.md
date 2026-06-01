# Workflow Operating Model

Default flow:

1. Intent lock.
2. Workflow request diagnostic when the request shape is unclear.
3. Workflow route.
4. Brief and reference authority.
5. Evidence when facts, docs, models, costs, or claims may change.
6. Direction and structure.
7. Copy and prompt packs.
8. Tool routing and execution manifest when execution is requested.
9. Asset manifest.
10. QA and iteration.
11. Delivery documentation.
12. Workflow self-improvement only when explicitly requested or enabled as a report-only review.

Parallel work is allowed when dependencies are clear. The workflow-orchestrator remains responsible for state and loopbacks.

## Workflow Request Diagnostic

Use a Workflow Request Diagnostic before routing when the user request could be
misclassified. It is especially useful for beginner install help, broad
creative requests, prompt packs, QA reviews, delivery requests, provider
execution plans, or workflow improvement requests.

```yaml
request_diagnostic:
  request_classification:
  user_intent:
  work_mode:
  first_safe_output:
  recommended_route:
  missing_inputs:
  blocked_actions:
  next_action:
  provider_execution_allowed: false
  upload_allowed: false
```

The diagnostic chooses the safest useful first output. It does not authorize
provider execution, uploads, destructive work, global installs, pushes, or API
calls.

## Reasoning Route Layer

Record a compact `reasoning_route` inside Project State when the task needs
more than direct execution.

```yaml
reasoning_route:
  task_class:
  complexity: trivial | low | medium | high
  risk: low | medium | high
  reasoning_strategy: direct | decompose | verify | compare | tool_loop | branch | search
  selected_methods:
  candidate_count:
  selection_criteria:
  verification_questions:
  escalation_triggers:
  downgrade_triggers:
  stop_condition:
  raw_trace_storage: forbidden
```

Default routing:

- `direct`: simple answers, small docs, or mechanical edits.
- `decompose`: multi-step work that needs Plan-and-Solve or Least-to-Most.
- `verify`: factual, QA, delivery, or claim-sensitive work using CQoT or CoVe.
- `compare`: several plausible routes, prompts, or copy variants using Best-of-N lite and reranking.
- `tool_loop`: local checks or approved tool plans using ReAct-style summaries.
- `branch`: bounded ToT-lite or GoT-lite when linear planning is insufficient.
- `search`: bounded prompt/template search only with a budget, fixture, and stop condition.

Do not store raw chain-of-thought, raw reasoning traces, raw debate transcripts,
or copied private context. Store only the selected strategy, method list,
candidate limit, verification questions, and stop condition.

## Runtime Route Layer

When model or runtime choice matters, record a lightweight `runtime_route`.
Prefer tiers and reasoning effort levels over brittle exact model names.

```yaml
runtime_route:
  recommended_runtime_tier:
  reasoning_effort: none | minimal | low | medium | high
  runtime_assignment: current_runtime | automation_config | subagent_spawn | unavailable_record_only
  provider_execution_allowed: false
  openai_api_allowed: false
  external_router_adopted_raw: false
```

A runtime route is a planning note, not permission to call OpenAI API, route
through an external provider, upload files, push, run destructive commands, or
install external routing infrastructure.

## Self-Improvement Sufficiency Gate

Workflow self-improvement remains explicit-only and proposal-first. When the
user explicitly asks for implementation, the workflow-orchestrator uses this
gate before another patch batch and again after validation:

```yaml
self_improvement_sufficiency_gate:
  objective:
  current_evidence:
  remaining_gap:
  next_patch_scope:
  expected_benefit:
  diminishing_returns_check:
  no_action_option:
  decision: stop_sufficient | patch_one_gap | ask_user
  approval_reason:
  stop_reason:
```

Decision rules:

- `stop_sufficient` when the objective is met, validation passes, the next work
  is optional polish, or the expected benefit is speculative.
- `patch_one_gap` when one concrete observed gap remains and the patch is
  bounded.
- `ask_user` only when the next step crosses a protected boundary: destructive
  command, provider/API execution, upload, push, global install, high-authority
  policy change, or genuinely ambiguous scope.

QA rejects open-ended improvement loops, speculative polishing, missing
diminishing-returns checks, and any continuation after the stop condition is
met.
