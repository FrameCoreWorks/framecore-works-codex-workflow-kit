import { existsSync } from "node:fs";
import { join } from "node:path";

export function run(ctx) {
  const { appearsInOrder, createFindings, markdownSections, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);
  const { requiredRoles } = ctx;
  const validationRoot = ctx.root;

  const requiredDocs = [
    "docs/quickstart.md",
    "docs/codex-assisted-install.md",
    "docs/using-the-kit.md",
    "docs/troubleshooting.md",
    "docs/tester-feedback.md",
    "docs/faq.md",
    "docs/compatibility.md",
    "docs/cli-reference.md",
    "docs/provider-neutral-boundary.md",
    "docs/memory-cache.md",
    "docs/context-folder.md",
    "docs/semantic-memory.md",
    "docs/self-improvement.md",
    "docs/openai-api-policy.md",
    "docs/v1-readiness.md",
    "docs/live-codex-e2e-check.md",
    "docs/roadmap.md",
    "docs/release.md",
    "docs/release-notes-template.md",
    "docs/architecture.md",
    "docs/included-agents-and-skills.md",
    "docs/workflow-map.md",
    "docs/artifact-schemas.md",
    "docs/example-authoring.md",
    "docs/workflow-stages.md",
    "docs/onboarding.md",
    "docs/customization.md",
    "docs/team-configuration.md",
    "docs/text-image-policy.md",
    "docs/hipson-integration.md",
    "docs/hyperframes.md",
    "docs/recurring-workflow-review.md",
    "docs/workflow-self-improvement.md",
    "docs/migration-guide.md",
    "docs/agent-roster.md",
    "docs/repository-settings.md",
    "examples/README.md"
  ];
  for (const doc of requiredDocs) {
    if (!existsSync(join(validationRoot, doc))) addFinding("MISSING_DOC", `Required documentation file is missing: ${doc}`, [join(validationRoot, doc)]);
  }
  
  const onboardingDoc = join(validationRoot, "docs/onboarding.md");
  if (existsSync(onboardingDoc)) {
    const text = read(onboardingDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Defaults", "Interactive Questions", "Installed Files", "Completion Output", "Hipson Adapter And Full Hipson", "Safety Boundaries", "Generated Files"]) {
      if (!sections.has(section)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required section: ${section}`, [onboardingDoc]);
    }
    for (const phrase of ["Allow automatic delivery uploads", "Require an explicit user request before delivery/export", "Require QA approval before generated asset delivery", "Delivery preferences only shape local behavior"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required delivery-preference phrase: ${phrase}`, [onboardingDoc]);
    }
    for (const phrase of ["created for creative work", "adapted to other use cases", "What kind of work do you do?", "What should this pipeline help with most?", "How should the pipeline fit your work style?", "work_profile", "type your preferred language", "does not lock the later conversation language"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required work-profile phrase: ${phrase}`, [onboardingDoc]);
    }
    for (const phrase of ["safe relative path", "do not use absolute paths", "does not clone, install, or activate full Hipson"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required setup-boundary phrase: ${phrase}`, [onboardingDoc]);
    }
    for (const phrase of ["run install dry-run", "review planned writes", "install project-locally", "AGENTS.framecore.md", "docs/using-the-kit.md"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ONBOARDING_DOC", `Onboarding guide is missing required completion-output phrase: ${phrase}`, [onboardingDoc]);
    }
  }
  
  const teamConfigurationDoc = join(validationRoot, "docs/team-configuration.md");
  if (existsSync(teamConfigurationDoc)) {
    const text = read(teamConfigurationDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Personal Install", "Shared Team Install", "Recommended Team Pattern", "Files That Should Stay Local By Default", "When To Share Config", "Privacy Review", "Update And Repair In Teams"]) {
      if (!sections.has(section)) addFinding("WEAK_TEAM_CONFIGURATION_DOC", `Team configuration guide is missing required section: ${section}`, [teamConfigurationDoc]);
    }
    for (const phrase of ["safe default is personal install", "framecore.config.json", "framecore.config.shared.json", ".framecore/manifest.json", "run `npm run audit:privacy`", "provider-neutral boundary", "Do not commit these by default", "repo-relative and portable", "update and repair"]) {
      if (!text.includes(phrase)) addFinding("WEAK_TEAM_CONFIGURATION_DOC", `Team configuration guide is missing required local-config phrase: ${phrase}`, [teamConfigurationDoc]);
    }
  }
  
  const customizationDoc = join(validationRoot, "docs/customization.md");
  if (existsSync(customizationDoc)) {
    const text = read(customizationDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Local Config File", "Safe Customizations", "Unsafe Customizations", "Output Directory", "Agent Display Names", "QA Strictness", "Delivery Preferences", "Hipson Settings", "Workflow Self-Improvement Settings", "Team Customization", "Update Repair And Uninstall", "Validation Checklist", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_CUSTOMIZATION_DOC", `Customization guide is missing required section: ${section}`, [customizationDoc]);
    }
    for (const phrase of ["framecore.config.json", "framecore.config.shared.json", "safe relative path", "work_profile", "primary_work", "agent_display_names", "qa_strictness", "auto_upload", "delivery_requires_current_user_request", "require_qa_allowlist_for_generated_assets", "Full Hipson remains separate and optional", "report-and-proposals-only", ".framecore/manifest.json", "npm run release:check"]) {
      if (!text.includes(phrase)) addFinding("WEAK_CUSTOMIZATION_DOC", `Customization guide is missing required customization phrase: ${phrase}`, [customizationDoc]);
    }
  }
  
  const migrationDoc = join(validationRoot, "docs/migration-guide.md");
  if (existsSync(migrationDoc)) {
    const text = read(migrationDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Migration Principles", "Source Audit", "Role And Naming Migration", "Skill And Agent Migration", "Config And Manifest Migration", "Update Repair And Rollback", "Validation Checklist", "Release Notes", "Halt Conditions"]) {
      if (!sections.has(section)) addFinding("WEAK_MIGRATION_GUIDE", `Migration guide is missing required section: ${section}`, [migrationDoc]);
    }
    for (const phrase of ["role IDs", "display names stay local", "framecore.config.json", ".framecore/manifest.json", "schema_version", "provider-neutral boundary", "do not migrate provider credentials", "update", "repair", "rollback", "npm run audit:privacy", "npm run validate", "Do not tag v1.0"]) {
      if (!text.includes(phrase)) addFinding("WEAK_MIGRATION_GUIDE", `Migration guide is missing required migration phrase: ${phrase}`, [migrationDoc]);
    }
  }
  
  const quickstartDoc = join(validationRoot, "docs/quickstart.md");
  if (existsSync(quickstartDoc)) {
    const text = read(quickstartDoc);
    for (const phrase of ["## Beginner-Friendly Guided Quickstart", "npm run install:guided", "## Codex-Assisted Quickstart", "## Optional GitHub Desktop Setup", "GitHub Desktop", "visual cloning", "temporary or tools folder outside the target workspace", "safe relative output path", "PowerShell commands", "$env:FRAMECORE_TARGET", "If guided install completes successfully", "manual fallback", "npm run check", "doctor/preflight", "onboarding", "install dry-run", "after onboarding", "project-local only", "Do not use global install", "Show me the changed files", "npm run memory:init", "npm run memory:validate", "regular ChatGPT chat window", "nothing was installed", "PowerShell"]) {
      if (!text.includes(phrase)) addFinding("WEAK_INSTALL_PROMPT", `Codex-assisted quickstart is missing required safety phrase: ${phrase}`, [quickstartDoc]);
    }
    for (const phrase of ["## Advanced Global Install", "writes to the current user's home workspace", "npm run doctor -- --mode global", "node scripts/install.mjs --mode dry-run --target \"$HOME\"", "node scripts/install.mjs --mode global --confirm-global"]) {
      if (!text.includes(phrase)) addFinding("WEAK_GLOBAL_INSTALL_DOC", `Quickstart must document global install safety: ${phrase}`, [quickstartDoc]);
    }
    if (!appearsInOrder(text, ["Run npm run check", "Run doctor/preflight", "Run onboarding", "Run install dry-run", "after onboarding", "Install project-local only"])) {
      addFinding("WEAK_INSTALL_PROMPT", "Codex-assisted quickstart must keep canonical order: check, doctor, onboarding, post-onboarding dry-run, project-local install.", [quickstartDoc]);
    }
  }
  
  const codexAssistedInstallDoc = join(validationRoot, "docs/codex-assisted-install.md");
  if (existsSync(codexAssistedInstallDoc)) {
    const text = read(codexAssistedInstallDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Paste-In Instruction", "What Codex Should Do", "Onboarding Questions", "Stop Conditions", "Expected Result"]) {
      if (!sections.has(section)) addFinding("WEAK_CODEX_ASSISTED_INSTALL_DOC", `Codex-assisted install guide is missing required section: ${section}`, [codexAssistedInstallDoc]);
    }
    for (const phrase of ["temporary or tools folder outside the target workspace", "guided project-local installer", "manual fallback", "Run onboarding", "Run install dry-run", "Install project-local only", "Do not use global install", "creative work such as graphics", "what I do", "main use cases", "work style", "GitHub Desktop", "visual cloning tool", "delivery upload behavior", "safe relative path", "optional full Hipson expansion", "does not clone or install full Hipson", "stop and ask the user", "user-owned file conflicts", "external execution tools", "AGENTS.framecore.md", "Memory Cache", "npm run memory:init", "regular ChatGPT chat window", "chat-only environment", "workspace files and shell commands"]) {
      if (!text.includes(phrase)) addFinding("WEAK_CODEX_ASSISTED_INSTALL_DOC", `Codex-assisted install guide is missing required safety phrase: ${phrase}`, [codexAssistedInstallDoc]);
    }
  }
  
  const usingTheKitDoc = join(validationRoot, "docs/using-the-kit.md");
  if (existsSync(usingTheKitDoc)) {
    const text = read(usingTheKitDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "First Prompt After Install", "Starter Prompts", "Choosing Workflow Depth", "Creative Workflow Prompts", "No External Execution Mode", "Hipson Adapter Prompts", "What Codex Should Produce", "Long Session Recovery Offer", "Recovery After Context Loss", "Safety Reminders", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_USING_THE_KIT_DOC", `Using The Kit guide is missing required section: ${section}`, [usingTheKitDoc]);
    }
    for (const phrase of ["Read AGENTS.md", "AGENTS.framecore.md", "project-local", "Do not use external execution tools", "GPT Image 2", "Full Hipson remains separate and optional", "does not clone, install, or activate full Hipson", "workflow-self-improvement", "QA And Delivery Review", "workflow.json", "neutral role IDs", "Project State", "recovery_prompt", "Long Session Recovery Offer", "context compaction", "Should I create and validate those recovery folders now?", "npm run memory:init", "npm run memory:validate"]) {
      if (!text.includes(phrase)) addFinding("WEAK_USING_THE_KIT_DOC", `Using The Kit guide is missing required usage phrase: ${phrase}`, [usingTheKitDoc]);
    }
  }
  
  const exampleAuthoringDoc = join(validationRoot, "docs/example-authoring.md");
  if (existsSync(exampleAuthoringDoc)) {
    const text = read(exampleAuthoringDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "When To Add An Example", "Required Files", "`workflow.json` Contract", "README Structure", "Route And Handoff Rules", "Privacy Requirements", "Validation Steps", "Review Checklist"]) {
      if (!sections.has(section)) addFinding("WEAK_EXAMPLE_AUTHORING_DOC", `Example authoring guide is missing required section: ${section}`, [exampleAuthoringDoc]);
    }
    for (const phrase of ["README.md", "workflow.json", "example_id", "Workflow Blueprints", "Gate Registry", "Handoff Matrix", "neutral role IDs", "npm run cleanup:appledouble -- --apply", "npm run release:check", "private cloud links or IDs"]) {
      if (!text.includes(phrase)) addFinding("WEAK_EXAMPLE_AUTHORING_DOC", `Example authoring guide is missing required authoring phrase: ${phrase}`, [exampleAuthoringDoc]);
    }
  }
  
  const agentRosterDoc = join(validationRoot, "docs/agent-roster.md");
  if (existsSync(agentRosterDoc)) {
    const text = read(agentRosterDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "How Role Selection Works", "Role Roster", "Common Selection Patterns", "Local Display Names", "Handoff Discipline", "Provider-Neutral Boundaries", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide is missing required section: ${section}`, [agentRosterDoc]);
    }
    for (const role of requiredRoles) {
      if (!text.includes(`\`${role}\``)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide must document role ID: ${role}`, [agentRosterDoc]);
    }
    for (const phrase of ["neutral role IDs", "local display names", "Task Confirmation", "Project State", "Review gate", "Common handoff", "Stop before `tool-routing-cost`", "GPT Image 2 one-pass policy", "Handoff Matrix"]) {
      if (!text.includes(phrase)) addFinding("WEAK_AGENT_ROSTER_DOC", `Agent roster guide is missing required role-selection phrase: ${phrase}`, [agentRosterDoc]);
    }
  }
  
  const compatibilityDoc = join(validationRoot, "docs/compatibility.md");
  if (existsSync(compatibilityDoc)) {
    const text = read(compatibilityDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Runtime Requirements", "Operating Systems", "Codex Environment", "Install Modes", "Manifest Compatibility", "External Tool Boundary", "Support Baseline"]) {
      if (!sections.has(section)) addFinding("WEAK_COMPATIBILITY_DOC", `Compatibility guide is missing required section: ${section}`, [compatibilityDoc]);
    }
    for (const phrase of ["Node.js 20 or newer", "macOS", "Linux", "Windows", ".codex/agents/*.toml", "project-local", "--confirm-global", ".framecore/manifest.json", "provider-neutral", "GPT Image 2"]) {
      if (!text.includes(phrase)) addFinding("WEAK_COMPATIBILITY_DOC", `Compatibility guide is missing required compatibility phrase: ${phrase}`, [compatibilityDoc]);
    }
  }
  
  const faqDoc = join(validationRoot, "docs/faq.md");
  if (existsSync(faqDoc)) {
    const text = read(faqDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Install Questions", "Configuration Questions", "Workflow Questions", "Provider And Safety Questions", "Hipson And HyperFrames", "Updates And Uninstall", "Troubleshooting", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_FAQ_DOC", `FAQ is missing required section: ${section}`, [faqDoc]);
    }
    for (const phrase of ["guided installer", "project-local install", "global install", "--confirm-global", "GitHub Desktop", "visual way to clone", "framecore.config.json", "local display names", "AGENTS.framecore.md", "provider-neutral", "GPT Image 2", "Full Hipson remains separate and optional", "does not clone, install, or activate full Hipson", "HyperFrames", "uninstall", "--yes", "npm run release:check"]) {
      if (!text.includes(phrase)) addFinding("WEAK_FAQ_DOC", `FAQ is missing required user-answer phrase: ${phrase}`, [faqDoc]);
    }
  }
  
  const cliReferenceDoc = join(validationRoot, "docs/cli-reference.md");
  if (existsSync(cliReferenceDoc)) {
    const text = read(cliReferenceDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Command Groups", "Safe Install Order", "Non-Mutating Checks", "Mutating Commands", "Install Modes", "Packaging And Release Checks", "Safety Rules", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_CLI_REFERENCE_DOC", `CLI reference is missing required section: ${section}`, [cliReferenceDoc]);
    }
    for (const phrase of ["guided project-local installer", "npm run install:guided", "npm run doctor", "npm run install:dry-run", "npm run secret:scan", "npm run release:check", "npm run package:list", "project-local", "global install", "--confirm-global", "uninstall", "--yes", "Do not enable external execution providers"]) {
      if (!text.includes(phrase)) addFinding("WEAK_CLI_REFERENCE_DOC", `CLI reference is missing required command phrase: ${phrase}`, [cliReferenceDoc]);
    }
  }
  
  const artifactSchemasDoc = join(validationRoot, "docs/artifact-schemas.md");
  if (existsSync(artifactSchemasDoc)) {
    const text = read(artifactSchemasDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Files", "Schema Contract", "Fixture Rules", "Validation", "Adding An Artifact", "Halt Conditions"]) {
      if (!sections.has(section)) addFinding("WEAK_ARTIFACT_SCHEMAS_DOC", `Artifact schemas guide is missing required section: ${section}`, [artifactSchemasDoc]);
    }
    for (const phrase of ["config/artifact-schemas.json", "required_fields", "example_paths", "gate-required artifacts", "matching template section", "public fixture path", "provider-neutral", "private project context", "local absolute paths"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ARTIFACT_SCHEMAS_DOC", `Artifact schemas guide is missing required schema phrase: ${phrase}`, [artifactSchemasDoc]);
    }
  }
  
  const workflowStagesDoc = join(validationRoot, "docs/workflow-stages.md");
  if (existsSync(workflowStagesDoc)) {
    const text = read(workflowStagesDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Stage Matrix", "Loopback Rules", "No-Provider Mode", "Common Blueprints", "Example Routes", "Validation", "Related Files"]) {
      if (!sections.has(section)) addFinding("WEAK_WORKFLOW_STAGES_DOC", `Workflow stages guide is missing required section: ${section}`, [workflowStagesDoc]);
    }
    for (const phrase of ["role IDs", "review gates", "handoff matrix", "config/artifact-schemas.json", "examples/*/workflow.json", "tool-routing-cost", "execution-manifest", "qa-iteration", "Delivery Manifest"]) {
      if (!text.includes(phrase)) addFinding("WEAK_WORKFLOW_STAGES_DOC", `Workflow stages guide is missing required routing phrase: ${phrase}`, [workflowStagesDoc]);
    }
  }
  
  const providerNeutralDoc = join(validationRoot, "docs/provider-neutral-boundary.md");
  if (existsSync(providerNeutralDoc)) {
    const text = read(providerNeutralDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "What Provider-Neutral Means", "Decision Matrix", "Built-In Chat Image Exception", "Coded Video Boundary", "Hipson Boundary", "User-Configured Extensions", "Release Gate"]) {
      if (!sections.has(section)) addFinding("WEAK_PROVIDER_NEUTRAL_BOUNDARY_DOC", `Provider-neutral boundary guide is missing required section: ${section}`, [providerNeutralDoc]);
    }
    for (const phrase of ["external paid media-provider clients", "provider CLIs", "endpoint catalogs", "provider credentials", "API-key setup flows", "Allowed", "Conditional", "Forbidden", "GPT Image 2", "HyperFrames", "Full Hipson remains separate and optional", "config/provider-neutral-policy.json"]) {
      if (!text.includes(phrase)) addFinding("WEAK_PROVIDER_NEUTRAL_BOUNDARY_DOC", `Provider-neutral boundary guide is missing required boundary phrase: ${phrase}`, [providerNeutralDoc]);
    }
  }
  
  const textImagePolicyDoc = join(validationRoot, "docs/text-image-policy.md");
  if (existsSync(textImagePolicyDoc)) {
    const text = read(textImagePolicyDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Built-In Generation Path", "One-Pass Rule", "Prompt Requirements", "Allowed Exceptions", "Failure Handling", "Validation"]) {
      if (!sections.has(section)) addFinding("WEAK_TEXT_IMAGE_POLICY_DOC", `Text-bearing image policy guide is missing required section: ${section}`, [textImagePolicyDoc]);
    }
    for (const phrase of ["GPT Image 2", "built-in Codex/ChatGPT image generation", "static raster graphics should use", "by default", "Python-generated artwork", "one pass", "exact final copy", "safe margins", "no extra words", "coded or vector artifact", "Do not silently replace", "not an external provider integration"]) {
      if (!text.includes(phrase)) addFinding("WEAK_TEXT_IMAGE_POLICY_DOC", `Text-bearing image policy guide is missing required policy phrase: ${phrase}`, [textImagePolicyDoc]);
    }
  }
  
  const hipsonIntegrationDoc = join(validationRoot, "docs/hipson-integration.md");
  if (existsSync(hipsonIntegrationDoc)) {
    const text = read(hipsonIntegrationDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Adapter Scope", "Full Hipson Boundary", "Onboarding Behavior", "Packet Types", "Privacy Rules", "Validation"]) {
      if (!sections.has(section)) addFinding("WEAK_HIPSON_INTEGRATION_DOC", `Hipson integration guide is missing required section: ${section}`, [hipsonIntegrationDoc]);
    }
    for (const phrase of ["Full Hipson remains separate and optional", "https://github.com/Hipson47/Hipson.git", "does not clone, install, or activate full Hipson", "research maps", "bounded instruction packets", "review packets", "execution packets", "target agent", "acceptance criteria", "must not include secrets"]) {
      if (!text.includes(phrase)) addFinding("WEAK_HIPSON_INTEGRATION_DOC", `Hipson integration guide is missing required adapter phrase: ${phrase}`, [hipsonIntegrationDoc]);
    }
  }
  
  const hyperframesDoc = join(validationRoot, "docs/hyperframes.md");
  if (existsSync(hyperframesDoc)) {
    const text = read(hyperframesDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "When To Use", "Workflow Route", "Production Brief Requirements", "Captions And Overlays", "Render QA", "Provider-Neutral Boundary", "Delivery"]) {
      if (!sections.has(section)) addFinding("WEAK_HYPERFRAMES_DOC", `HyperFrames guide is missing required section: ${section}`, [hyperframesDoc]);
    }
    for (const phrase of ["coded-video workflow path", "not as a paid media-provider integration", "scene timing", "GSAP", "captions", "render QA", "delivery manifest", "source files"]) {
      if (!text.includes(phrase)) addFinding("WEAK_HYPERFRAMES_DOC", `HyperFrames guide is missing required workflow phrase: ${phrase}`, [hyperframesDoc]);
    }
  }
  
  const recurringWorkflowReviewDoc = join(validationRoot, "docs/recurring-workflow-review.md");
  if (existsSync(recurringWorkflowReviewDoc)) {
    const text = read(recurringWorkflowReviewDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Default State", "Opt-In Recipe", "Report-Only Rules", "User-Facing Output", "Forbidden Actions", "Disable Or Remove", "Validation"]) {
      if (!sections.has(section)) addFinding("WEAK_RECURRING_WORKFLOW_REVIEW_DOC", `Recurring workflow review guide is missing required section: ${section}`, [recurringWorkflowReviewDoc]);
    }
    for (const phrase of ["Default: disabled", "every 24 hours", "report-only", "mutation: disabled", "uploads: disabled", "external execution: disabled", "Workflow Improvement Alert", "does not edit workflow files", "explicit user or maintainer approval"]) {
      if (!text.includes(phrase)) addFinding("WEAK_RECURRING_WORKFLOW_REVIEW_DOC", `Recurring workflow review guide is missing required governance phrase: ${phrase}`, [recurringWorkflowReviewDoc]);
    }
  }
  
  const workflowSelfImprovementDoc = join(validationRoot, "docs/workflow-self-improvement.md");
  if (existsSync(workflowSelfImprovementDoc)) {
    const text = read(workflowSelfImprovementDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Invocation Rules", "Evidence Inputs", "Report-Only Automation", "Proposal Contract", "Adoption Flow", "Forbidden Actions", "Validation And Release Checks", "Halt Conditions", "Output Summary"]) {
      if (!sections.has(section)) addFinding("WEAK_WORKFLOW_SELF_IMPROVEMENT_DOC", `Workflow self-improvement guide is missing required section: ${section}`, [workflowSelfImprovementDoc]);
    }
    for (const phrase of ["explicit-only", "report-only", "no automatic edits", "no uploads", "no external execution", "no destructive operations", "workflow-orchestrator", "qa-iteration", "explicit user or maintainer approval", "config/automation-recipes/workflow-self-improvement-review.example.json", "templates/improvement-log.md", "templates/change-proposal.md"]) {
      if (!text.includes(phrase)) addFinding("WEAK_WORKFLOW_SELF_IMPROVEMENT_DOC", `Workflow self-improvement guide is missing required governance phrase: ${phrase}`, [workflowSelfImprovementDoc]);
    }
  }
  
  const v1ReadinessDoc = join(validationRoot, "docs/v1-readiness.md");
  if (existsSync(v1ReadinessDoc)) {
    const text = read(v1ReadinessDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Required State", "Install And Lifecycle", "Onboarding", "Examples", "Documentation", "Validation Gates", "Halt Conditions", "Sign-Off"]) {
      if (!sections.has(section)) addFinding("WEAK_V1_READINESS_DOC", `v1.0 readiness guide is missing required section: ${section}`, [v1ReadinessDoc]);
    }
    for (const phrase of ["project-local install is the default", "global install is clearly marked advanced", "provider-neutral boundary is documented and validated", "GPT Image 2 one-pass policy", "Full Hipson remains separate and optional", "workflow.json", "npm run release:readiness -- --tag v1.0.0", "npm run syntax:check", "npm run agent:check", "path-sensitive cross-platform GitHub Actions workflow", "Do not tag v1.0"]) {
      if (!text.includes(phrase)) addFinding("WEAK_V1_READINESS_DOC", `v1.0 readiness guide is missing required release-readiness phrase: ${phrase}`, [v1ReadinessDoc]);
    }
  }
  
  const roadmapDoc = join(validationRoot, "docs/roadmap.md");
  if (existsSync(roadmapDoc)) {
    const text = read(roadmapDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Current Scope", "Known Limitations", "Near-Term Priorities", "Future Candidates", "v1.0 Readiness", "Non-Goals", "Release Discipline"]) {
      if (!sections.has(section)) addFinding("WEAK_ROADMAP_DOC", `Roadmap is missing required section: ${section}`, [roadmapDoc]);
    }
    for (const phrase of ["provider-neutral", "project-local", "guided installer", "artifact schemas", "full Hipson", "v1.0", "no bundled external paid execution provider"]) {
      if (!text.includes(phrase)) addFinding("WEAK_ROADMAP_DOC", `Roadmap is missing required planning phrase: ${phrase}`, [roadmapDoc]);
    }
  }
  
  const liveCodexE2EDoc = join(validationRoot, "docs/live-codex-e2e-check.md");
  if (existsSync(liveCodexE2EDoc)) {
    const text = read(liveCodexE2EDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Scope", "Prerequisites", "Safe Test Workspace", "Procedure", "Expected Signals", "Failure Signals", "Evidence To Record", "Acceptance", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_LIVE_CODEX_E2E_DOC", `Live Codex E2E checklist is missing required section: ${section}`, [liveCodexE2EDoc]);
    }
    for (const phrase of ["real Codex workspace", "project-local install", "Do not use external paid providers", "AGENTS.md", "AGENTS.framecore.md", ".agents/skills/pipeline-core/SKILL.md", "intent confirmation", "workflow-orchestrator", "Memory Cache/project-state.md", "custom-agent spawning", "AGENTS-only pass"]) {
      if (!text.includes(phrase)) addFinding("WEAK_LIVE_CODEX_E2E_DOC", `Live Codex E2E checklist is missing required phrase: ${phrase}`, [liveCodexE2EDoc]);
    }
  }
  
  const releaseNotesTemplate = join(validationRoot, "docs/release-notes-template.md");
  if (existsSync(releaseNotesTemplate)) {
    const text = read(releaseNotesTemplate);
    const sections = markdownSections(text);
    for (const section of ["Version", "Summary", "Install And Update Notes", "Onboarding Notes", "Workflow Changes", "Validation And Package Checks", "Security And Privacy Review", "Known Limitations", "Links"]) {
      if (!sections.has(section)) addFinding("WEAK_RELEASE_NOTES_TEMPLATE", `Release notes template is missing required section: ${section}`, [releaseNotesTemplate]);
    }
    for (const phrase of ["provider-neutral", "project-local", "npm run release:check", "npm run release:readiness", "npm run secret:scan", "npm run syntax:check", "npm run agent:check", "npm run package:audit", "npm run package:list", "No secrets", "No bundled external paid execution providers", "GPT Image 2", "Full Hipson remains separate and optional"]) {
      if (!text.includes(phrase)) addFinding("WEAK_RELEASE_NOTES_TEMPLATE", `Release notes template is missing required release-safety phrase: ${phrase}`, [releaseNotesTemplate]);
    }
  }
  
  const readmePath = join(validationRoot, "README.md");
  if (existsSync(readmePath)) {
    const text = read(readmePath);
    for (const phrase of ["docs/quickstart.md", "docs/codex-assisted-install.md", "If guided install completes successfully", "manual fallback", "Show me the changed files", "npm run memory:init", "regular ChatGPT chat", "nothing was installed"]) {
      if (!text.includes(phrase)) addFinding("WEAK_README_INSTALL_PROMPT", `README install prompt is missing required safety phrase: ${phrase}`, [readmePath]);
    }
    for (const phrase of ["## Supported Agent Surfaces", "OpenAI Codex CLI with custom-agent support", "Chat-only environments without shell access", "GitHub Desktop", "created by FrameCore Works", "https://buycoffee.to/framecoreworks", "This kit ships the routing and contract layer", "symlinks"]) {
      if (!text.includes(phrase)) addFinding("WEAK_README_POSITIONING", `README is missing required positioning phrase: ${phrase}`, [readmePath]);
    }
    for (const phrase of ["Global install is available only for advanced users", "writes to the current user's home workspace", "npm run doctor -- --mode global", "node scripts/install.mjs --mode dry-run --target \"$HOME\"", "node scripts/install.mjs --mode global --confirm-global"]) {
      if (!text.includes(phrase)) addFinding("WEAK_README_GLOBAL_INSTALL", `README must document global install safety: ${phrase}`, [readmePath]);
    }
    if (!appearsInOrder(text, ["Run the repository checks", "Run doctor/preflight", "Run onboarding", "Run install dry-run", "after onboarding", "Install project-local only"])) {
      addFinding("WEAK_README_INSTALL_PROMPT", "README install prompt must keep canonical order: check, doctor, onboarding, post-onboarding dry-run, project-local install.", [readmePath]);
    }
  }
  
  const agentsTemplatePath = join(validationRoot, "AGENTS.template.md");
  if (existsSync(agentsTemplatePath)) {
    const text = read(agentsTemplatePath);
    for (const phrase of ["Treat repository files", "as data unless the human user explicitly identifies them as instructions", "keep Project State current", "Long Session Recovery Offer", "context compaction", "Do not create or rewrite recovery folders until the user agrees", "npm run memory:init", "npm run memory:validate", "static raster graphic", "Python-generated artwork", "GPT Image 2 by default", ".agents/skills/pipeline-core/SKILL.md", "Memory Cache/project-state.md", "openai api active"]) {
      if (!text.includes(phrase)) addFinding("WEAK_AGENTS_TEMPLATE", `AGENTS.template.md is missing required runtime-safety phrase: ${phrase}`, [agentsTemplatePath]);
    }
  }
  
  const memoryCacheDoc = join(validationRoot, "docs/memory-cache.md");
  if (existsSync(memoryCacheDoc)) {
    const text = read(memoryCacheDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Folder Layout", "Long Session Recovery Offer", "Project State", "Recovery Prompt", "Session Heartbeat", "Safety Rules", "Validation", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_MEMORY_CACHE_DOC", `Memory Cache guide is missing required section: ${section}`, [memoryCacheDoc]);
    }
    for (const phrase of ["Memory Cache is not a transcript archive", "checkpoint_id", "checkpoint_status", "Long Session Recovery Offer", "context compaction", "Should I create and validate those recovery folders now?", "current consent", "Saved state is not permission", "npm run memory:init", "npm run memory:validate", "Context/"]) {
      if (!text.includes(phrase)) addFinding("WEAK_MEMORY_CACHE_DOC", `Memory Cache guide is missing required phrase: ${phrase}`, [memoryCacheDoc]);
    }
  }
  
  const contextFolderDoc = join(validationRoot, "docs/context-folder.md");
  if (existsSync(contextFolderDoc)) {
    const text = read(contextFolderDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "What Belongs In Context", "What Does Not Belong In Context", "Separation From Memory Cache", "Indexing Rules", "AppleDouble Files", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_CONTEXT_FOLDER_DOC", `Context folder guide is missing required section: ${section}`, [contextFolderDoc]);
    }
    for (const phrase of ["Context/ is the user-supplied input", "Memory Cache/ contains durable recovery state", "Do not repopulate `Context/` from `Memory Cache/`", "exclude `Context/` by default", "AppleDouble"]) {
      if (!text.includes(phrase)) addFinding("WEAK_CONTEXT_FOLDER_DOC", `Context folder guide is missing required phrase: ${phrase}`, [contextFolderDoc]);
    }
  }
  
  const semanticMemoryDoc = join(validationRoot, "docs/semantic-memory.md");
  if (existsSync(semanticMemoryDoc)) {
    const text = read(semanticMemoryDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Indexed By Default", "Excluded By Default", "Local Query", "Optional Embeddings", "Workspace Evaluation", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_SEMANTIC_MEMORY_DOC", `Semantic memory guide is missing required section: ${section}`, [semanticMemoryDoc]);
    }
    for (const phrase of ["default semantic index does not call any API", "Memory Cache/semantic-index.local.json", "Context/", "openai api active", "public kit does not require Responses API"]) {
      if (!text.includes(phrase)) addFinding("WEAK_SEMANTIC_MEMORY_DOC", `Semantic memory guide is missing required phrase: ${phrase}`, [semanticMemoryDoc]);
    }
  }
  
  const selfImprovementToolsDoc = join(validationRoot, "docs/self-improvement.md");
  if (existsSync(selfImprovementToolsDoc)) {
    const text = read(selfImprovementToolsDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Audit Command", "Local Improvement Command", "Adoption Rule", "Safe Patch Bias", "Forbidden Actions", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_SELF_IMPROVEMENT_TOOLS_DOC", `Self-improvement tools guide is missing required section: ${section}`, [selfImprovementToolsDoc]);
    }
    for (const phrase of ["do not patch repo files by themselves", "Memory Cache/self-improvement-queue.md", "Adoption requires", "Prefer expansion over rebuild", "Do not upload"]) {
      if (!text.includes(phrase)) addFinding("WEAK_SELF_IMPROVEMENT_TOOLS_DOC", `Self-improvement tools guide is missing required phrase: ${phrase}`, [selfImprovementToolsDoc]);
    }
  }
  
  const openAiPolicyDoc = join(validationRoot, "docs/openai-api-policy.md");
  if (existsSync(openAiPolicyDoc)) {
    const text = read(openAiPolicyDoc);
    const sections = markdownSections(text);
    for (const section of ["Purpose", "Activation Phrase", "API-Gated Capabilities", "Never Send", "Semantic Memory", "Text-Bearing Graphics", "Related Docs"]) {
      if (!sections.has(section)) addFinding("WEAK_OPENAI_API_POLICY_DOC", `OpenAI API policy is missing required section: ${section}`, [openAiPolicyDoc]);
    }
    for (const phrase of ["inactive by default", "openai api active", "OPENAI_API_KEY", "Without activation", "Native Codex or ChatGPT image generation", "does not depend on Responses API"]) {
      if (!text.includes(phrase)) addFinding("WEAK_OPENAI_API_POLICY_DOC", `OpenAI API policy is missing required phrase: ${phrase}`, [openAiPolicyDoc]);
    }
  }
  
  
  return { findings, requiredDocs };
}
