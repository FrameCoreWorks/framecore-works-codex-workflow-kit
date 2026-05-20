# Project State

- workflow_blueprint: Minimal provider-neutral planning route for a generic creative task.
- active_roles:
  - `intent-confirmation`
  - `workflow-orchestrator`
  - `brief-architect`
- completed_or_existing_artifacts:
  - Task Confirmation
- required_handoffs:
  - `intent-confirmation->workflow-orchestrator`
  - `workflow-orchestrator->brief-architect`
- review_gates:
  - `intent_lock`
  - `workflow_route`
  - `brief_completeness`
- next_role: `brief-architect`
- next_action: Produce a concise Brief Contract before specialist direction or prompting.
