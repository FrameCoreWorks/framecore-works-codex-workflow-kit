# Workflow Request Diagnostic

- request_classification: creative_workflow
- user_intent: Plan a generic creative workflow without executing providers.
- work_mode: plan
- first_safe_output: Task Confirmation and Project State.
- recommended_route:
  - `intent-confirmation`
  - `workflow-orchestrator`
  - `brief-architect`
- missing_inputs:
  - final audience details
  - reference requirements
- blocked_actions:
  - no provider execution
  - no upload
  - no global install
- next_action: Produce Project State and route to `brief-architect`.
- provider_execution_allowed: false
- upload_allowed: false
