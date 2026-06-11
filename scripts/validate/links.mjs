import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { isAppleDouble } from "../common.mjs";

export function run(ctx) {
  const { anchorsFor, createFindings, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);

  for (const file of ctx.files) {
    if (isAppleDouble(file)) continue;
    const text = read(file);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = match[1].trim();
      if (/^(https?:|mailto:|#)/i.test(href)) continue;
      const [pathPart, anchor] = href.split("#");
      const target = resolve(dirname(file), pathPart || ".");
      if (!existsSync(target)) {
        addFinding("BROKEN_MARKDOWN_LINK", `Broken markdown link: ${href}`, [file]);
        continue;
      }
      if (anchor && anchor.length > 0) {
        const targetText = read(target);
        if (!anchorsFor(targetText).has(anchor.toLowerCase())) {
          addFinding("BROKEN_MARKDOWN_ANCHOR", `Broken markdown anchor: ${href}`, [file]);
        }
      }
    }
  }

  return findings;
}
