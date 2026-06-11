import { existsSync } from "node:fs";
import { join } from "node:path";

export function run(ctx) {
  const { createFindings, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);

  const requiredRoles = JSON.parse(read(join(ctx.root, "config/agent-naming.schema.json"))).roles;
  const requiredRoleSet = new Set(requiredRoles);
  const agentDir = join(ctx.root, ".codex/agents");
  const missingAgents = requiredRoles
    .map((role) => join(agentDir, `${role}.toml.template`))
    .filter((path) => !existsSync(path));
  if (missingAgents.length > 0) {
    addFinding("MISSING_AGENT_TEMPLATE", "Required role-based agent template is missing.", missingAgents);
  }

  const agentTemplateGates = new Map();
  for (const role of requiredRoles) {
    const file = join(agentDir, `${role}.toml.template`);
    if (!existsSync(file)) continue;
    const text = read(file);
    for (const marker of ["Role:", "Scope:", "Inputs:", "Outputs:", "Forbidden:", "Review gate:", "Handoff rules:"]) {
      if (!text.includes(marker)) {
        addFinding("WEAK_AGENT_TEMPLATE", `Agent template ${role} is missing marker ${marker}`, [file]);
      }
    }
    for (const phrase of ["Workspace profile:", "{{working_language}}", "{{response_tone}}", "{{primary_work}}"]) {
      if (!text.includes(phrase)) {
        addFinding("WEAK_AGENT_TEMPLATE", `Agent template ${role} must consume onboarding workspace profile token: ${phrase}`, [file]);
      }
    }
    const gateMatch = text.match(/Review gate:\s*`?([a-z0-9_]+)`?\./);
    if (!gateMatch) {
      addFinding("MISSING_AGENT_REVIEW_GATE", `Agent template ${role} must declare a review gate.`, [file]);
    } else {
      agentTemplateGates.set(role, gateMatch[1]);
    }
  }

  return {
    findings,
    requiredRoles,
    requiredRoleSet,
    agentDir,
    agentTemplateGates
  };
}
