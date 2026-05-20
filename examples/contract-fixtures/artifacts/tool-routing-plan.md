# Tool Routing Plan

- selected_tool: none
- approval_status: Not approved for execution.
- required_inputs:
  - Prompt Pack
  - user approval before any external or paid execution
  - output destination if execution is later requested
- cost_note: No cost applies because this fixture stops before execution.
- risk_note: Tool selection must remain provider-neutral unless the user explicitly chooses a runtime.
- output_plan:
  - keep planning artifacts in repo examples
  - do not create generated media
- handoff_to: `execution-manifest` only after explicit execution approval
