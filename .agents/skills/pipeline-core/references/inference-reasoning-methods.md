# Inference Reasoning Methods

This reference defines public, provider-neutral reasoning routes for FrameCore
workflow work. It is an operating policy inside `pipeline-core`, not a new
agent framework, model router, provider integration, or permission to call an
API.

Use these methods only when they materially improve quality, safety, or
recoverability. Store compact decision summaries and contract fields only. Do not store raw chain-of-thought, raw reasoning traces, raw debate transcripts,
private URLs, provider responses, secrets, `.env` files, or copied private
project context.

## Reasoning Route Contract

Record a `reasoning_route` inside Project State when a task needs more than
direct execution.

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

Use `direct` for simple work. Use the smallest stronger route that preserves
the needed gate, handoff, QA, or delivery confidence.

## Runtime Route Contract

When model or runtime choice matters, record a lightweight `runtime_route`.
Prefer tiers and effort levels over brittle exact model names.

```yaml
runtime_route:
  recommended_runtime_tier:
  reasoning_effort: none | minimal | low | medium | high
  runtime_assignment: current_runtime | automation_config | subagent_spawn | unavailable_record_only
  provider_execution_allowed: false
  openai_api_allowed: false
  external_router_adopted_raw: false
```

A runtime recommendation is not permission to call OpenAI API, use external
providers, upload files, run destructive commands, or install routing
infrastructure. Provider execution remains governed by the user’s current
explicit instruction and the public provider-neutral boundary.

## Default Methods

| Method | Public owner roles | Use when | Required output fields |
|---|---|---|---|
| Plan-and-Solve / Least-to-Most | `workflow-orchestrator`, `storyboard-architect`, `instruction-packet-factory` | The task needs decomposition before specialist work. | `reasoning_strategy`, `subtasks`, `next_gate`, `stop_condition` |
| CQoT | `qa-iteration`, `research-evidence`, `copy-voice`, `image-prompting`, `video-prompting` | A claim, prompt, QA decision, or handoff needs adversarial questions. | `critical_questions`, `answers_or_gaps`, `required_correction` |
| CoVe | `qa-iteration`, `research-evidence`, `delivery-documentation` | A result must be checked before delivery or downstream use. | `verification_questions`, `verification_results`, `unresolved_risks` |
| Self-Refine / RCI | `qa-iteration`, `workflow-orchestrator`, target specialist role | A prompt, artifact, or generated output has a diagnosed failure. | `failure_inventory`, `corrected_instruction_packet`, `loopback_target`, `acceptance_test` |
| Best-of-N lite | Direction, copy, prompt, and QA roles | Several plausible strategies, lines, prompts, or routes exist. | `candidate_count`, `selection_criteria`, `selected_candidate`, `rejected_options` |
| ReAct | `research-evidence`, `tool-routing-cost`, `execution-manifest` | Work alternates between reasoning, local checks, tool plans, and observations. | `reason_action_observation_summary`, `tool_boundary`, `next_action` |
| Chain-of-Note / source notes | `reference-curator`, `research-evidence`, `asset-manifest` | Sources, references, or manifests need confidence notes. | `source_notes`, `confidence`, `reference_or_asset_risks` |
| Step-back prompting | `brief-architect`, direction roles | The request is broad, ambiguous, or strategically underspecified. | `generalized_question`, `task_classification`, `specific_route` |
| Meta-prompting / APE-lite | `instruction-packet-factory` | A packet, checklist, or prompt contract needs refinement before specialist work. | `prompt_issue`, `improved_instruction`, `acceptance_criteria` |
| LLM-as-judge / reranking | `qa-iteration`, `workflow-orchestrator` | Candidate outputs need a compact quality decision. | `judge_criteria`, `ranked_candidates`, `decision_reason_summary` |

Default candidate limits:

- Use 2 candidates for routine direction, copy, or prompt alternatives.
- Use 3 candidates for high-value campaign, storyboard, or prompt-pack choices.
- Use more than 3 only when the workflow-orchestrator records a concrete
  expected benefit and stop condition.

## Situational Methods

Use these only when the workflow-orchestrator records why a cheaper route is
insufficient.

| Method | Use when | Guardrail |
|---|---|---|
| ToT-lite | A problem has branching strategic or structural routes. | Limit to 2-3 branches and one selection pass. |
| GoT-lite | Dependencies across references, shots, assets, or manifests matter. | Store a dependency map, not raw reasoning traces. |
| MCTS / tree search | Prompt optimization or route selection needs search over candidates. | Require an eval target, budget, and stop condition. |
| Multi-agent debate | Two specialist roles disagree on a high-impact decision. | Summarize positions; do not store raw debate transcripts. |
| PoT / PAL | Computation, schema checks, naming, checksums, or validation need code-like reasoning. | Use local tools only inside approved boundaries. |
| GraphRAG | A durable corpus has many linked entities or references. | Require a defined corpus, source map, and privacy boundary. |
| PromptBreeder / APO-lite | Reusable prompt templates have fixtures or benchmarks. | Do not optimize without an acceptance test or fixture. |

## Routing Rules

The workflow-orchestrator chooses the smallest useful strategy:

1. `direct` for simple tasks.
2. `decompose` for multi-step work using Plan-and-Solve / Least-to-Most.
3. `verify` for factual, delivery, or QA-sensitive work using CoVe or CQoT.
4. `compare` for multiple candidates using Best-of-N lite and reranking.
5. `tool_loop` for ReAct workflows with local checks or approved tool plans.
6. `branch` for ToT-lite or GoT-lite when linear planning is insufficient.
7. `search` for MCTS/APO-lite only with an explicit budget and acceptance test.

QA rejects a reasoning route when it:

- stores raw reasoning traces;
- adds candidates without a selection criterion;
- continues after the stop condition is met;
- bypasses provider, upload, Memory Cache, or destructive-command locks;
- treats unverified sources, sidecar output, or old Project State as authority.
