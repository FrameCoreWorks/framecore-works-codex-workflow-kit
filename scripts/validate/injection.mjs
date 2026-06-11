import { isAppleDouble } from "../common.mjs";

const instructionOverridePatterns = [
  /ignore (all )?(previous|prior) instructions/i,
  /disregard (all )?(previous|prior) instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /disable (the )?safety/i,
  /bypass (the )?safety/i,
  /\bjailbreak\b/i,
  /\bdeveloper mode\b/i,
];

export function run(ctx) {
  const { createFindings, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);

  for (const file of ctx.files) {
    if (isAppleDouble(file)) continue;
    const text = read(file);
    const matchedPattern = instructionOverridePatterns.find((pattern) => pattern.test(text));
    if (matchedPattern) {
      addFinding(
        "INSTRUCTION_OVERRIDE_PHRASE",
        "Agent-facing files must not include instruction-override or prompt-exfiltration phrases.",
        [file]
      );
    }
  }

  return findings;
}
