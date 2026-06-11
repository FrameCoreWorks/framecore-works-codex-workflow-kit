import { basename, dirname, join } from "node:path";
import { walkFiles } from "../common.mjs";

export function run(ctx) {
  const { createFindings, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);

  const skillFiles = walkFiles(join(ctx.root, ".agents/skills")).filter((file) => file.endsWith("SKILL.md"));
  if (skillFiles.length < 25) {
    addFinding("MISSING_SKILLS", "Expected full skill pack is incomplete.", [join(ctx.root, ".agents/skills")]);
  }
  const knownSkillNames = new Set(skillFiles.map((file) => basename(dirname(file))));
  const requiredSkillSections = [
    "## When To Use",
    "## Inputs",
    "## Outputs",
    "## Process",
    "## Decision Rules",
    "## Guardrails",
    "## Handoff",
    "## QA Checklist"
  ];
  for (const file of skillFiles) {
    const text = read(file);
    const nameMatch = text.match(/^---\nname:\s*([-a-z0-9]+)/m);
    if (!nameMatch || !/\ndescription:\s*/m.test(text)) {
      addFinding("INVALID_SKILL_FRONTMATTER", "Skill frontmatter must include name and description.", [file]);
      continue;
    }
    const expectedName = basename(dirname(file));
    if (nameMatch[1] !== expectedName) {
      addFinding("SKILL_NAME_MISMATCH", `Skill frontmatter name must match folder name: ${expectedName}`, [file]);
    }
    const body = text.replace(/^---[\s\S]*?---\n/, "");
    const bodyWordCount = (body.match(/\b[\w'-]+\b/g) ?? []).length;
    if (bodyWordCount < 120 || (body.match(/^##\s+/gm) ?? []).length < 6) {
      addFinding("SKILL_STUB", "Skill body is too thin to function as an operational contract.", [file]);
    }
    for (const section of requiredSkillSections) {
      if (!text.includes(section)) {
        addFinding("MISSING_SKILL_SECTION", `Skill is missing required section: ${section}`, [file]);
      }
    }
  }

  return {
    findings,
    skillFiles,
    knownSkillNames
  };
}
