# Handoff Matrix

| From | To | Required fields |
|---|---|---|
| intent-confirmation | workflow-orchestrator | confirmed_goal, excluded_scope, work_mode, expected_output, immediate_next_step |
| workflow-orchestrator | brief-architect | goal, raw_context, constraints, expected_artifact, request_diagnostic, reasoning_route when useful |
| workflow-orchestrator | asset-manifest | existing_files, review_goal, acceptance_criteria, delivery_need, source_notes |
| workflow-orchestrator | instruction-packet-factory | target_role, packet_type, context, goal, exclusions, output_need, reasoning_route, selected_methods, stop_condition |
| workflow-orchestrator | qa-iteration | loop_state, artifacts_under_review, acceptance_matrix, regression_scope, stop_condition |
| instruction-packet-factory | research-evidence | packet_id, goal, source_rules, acceptance_criteria, output_schema, verification_questions |
| instruction-packet-factory | reference-curator | packet_id, reference_goals, suppression_rules, output_schema, source_notes_need |
| brief-architect | reference-curator | brief_contract, reference_needs, constraints |
| brief-architect | research-evidence | brief_contract, research_questions, source_rules |
| brief-architect | instruction-packet-factory | brief_contract, target_role, packet_type, constraints, exclusions, acceptance_criteria |
| brief-architect | delivery-documentation | brief_contract, accepted_scope, delivery_notes |
| reference-curator | static-direction | reference_pack, continuity_anchors, suppression_rules |
| reference-curator | motion-direction | reference_pack, continuity_anchors, suppression_rules |
| research-evidence | copy-voice | evidence_note, claims, citations, uncertainty, verification_questions, source_notes |
| static-direction | copy-voice | direction_contract, audience, copy_requirements |
| static-direction | image-prompting | direction_contract, prompt_constraints, copy_requirements |
| motion-direction | copy-voice | motion_direction, audience, VO_or_caption_needs |
| motion-direction | storyboard-architect | motion_direction, timing_constraints, continuity_rules |
| storyboard-architect | copy-voice | storyboard_contract, shot_context, VO_or_caption_needs |
| storyboard-architect | storyboard-board-architect | storyboard_contract, visual_direction, panel_count, timing, label_requirements |
| storyboard-architect | video-prompting | storyboard_contract, shot_cards, continuity_rules |
| storyboard-architect | hyperframes-producer | storyboard_contract, timing, copy, render_constraints |
| storyboard-board-architect | image-prompting | board_artifact_prompt, exact_board_text, panel_layout, safe_margins, acceptance_criteria |
| storyboard-board-architect | qa-iteration | board_artifact_prompt, expected_observables, acceptance_criteria |
| copy-voice | image-prompting | exact_copy, tone_notes, text_lock |
| copy-voice | video-prompting | VO, dialogue, supers, tone_notes |
| copy-voice | hyperframes-producer | captions, titles, VO, overlay_text, tone_notes |
| copy-voice | delivery-documentation | final_text, tone_notes, caveats |
| image-prompting | qa-iteration | prompt_pack, expected_observables, acceptance_criteria, selected_methods, verification_questions |
| image-prompting | tool-routing-cost | prompt_pack, asset_requirements, acceptance_criteria |
| video-prompting | qa-iteration | prompt_pack, timing, expected_observables, acceptance_criteria, selected_methods, verification_questions |
| video-prompting | tool-routing-cost | prompt_pack, timing, acceptance_criteria |
| tool-routing-cost | execution-manifest | selected_tool, approval_status, required_inputs, output_plan, risks |
| execution-manifest | asset-manifest | output_files, params_summary, source_notes, redaction_status |
| hyperframes-producer | asset-manifest | source_files, render_outputs, dependencies, traceability |
| asset-manifest | qa-iteration | file_list, source_traceability, acceptance_criteria |
| qa-iteration | workflow-orchestrator | QA status, severity, root_cause, loopback_target, regression_check, stop_recommendation |
| qa-iteration | delivery-documentation | accepted_assets, excluded_assets, QA status, verification_results, stop_condition, caveats |

Invalid handoffs:

- prompt roles directly to delivery without QA when generated assets exist
- delivery without explicit user delivery request
- execution without tool-routing-cost when a user-configured tool is needed
- workflow self-improvement proposals adopted without explicit approval
- reasoning routes that store raw reasoning traces or continue after stop_condition
- runtime routes treated as provider/API/upload permission
