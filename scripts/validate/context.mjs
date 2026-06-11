import { readFileSync } from "node:fs";
import { relativePosix } from "../common.mjs";

export function createFindings(validationRoot) {
  const findings = [];
  function addFinding(code, message, files) {
    findings.push({ code, message, files: files.map((file) => relativePosix(validationRoot, file)) });
  }
  return { findings, addFinding };
}

export function read(file) {
  return readFileSync(file, "utf8");
}

export function markdownSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function anchorsFor(text) {
  const anchors = new Set();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    anchors.add(markdownSlug(match[1]));
  }
  return anchors;
}

export function cleanCell(value) {
  return value.trim().replace(/^`|`$/g, "").trim();
}

export function parseMarkdownTable(text, headerNames) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().startsWith("|"));
  const rows = [];
  let header = null;

  for (const line of lines) {
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length === 0) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    if (cells.length !== header.length) continue;
    rows.push(Object.fromEntries(headerNames.map((name, index) => [name, cleanCell(cells[index] ?? "")])));
  }

  return rows;
}

export function artifactAlternatives(value) {
  return value.split(/\s+or\s+/i).map((item) => item.trim()).filter(Boolean);
}

export function markdownSections(text) {
  return new Set([...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()));
}

export function markdownSectionBody(text, section) {
  const lines = text.split(/\r?\n/);
  const body = [];
  let active = false;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (active) break;
      active = heading[1].trim() === section;
      continue;
    }
    if (active) body.push(line);
  }
  return body.join("\n");
}

export function artifactFieldSet(text) {
  return new Set([...text.matchAll(/^-\s+([A-Za-z][A-Za-z0-9_ /-]*):/gm)].map((match) => match[1].trim()));
}

export function appearsInOrder(text, phrases) {
  let index = -1;
  for (const phrase of phrases) {
    const nextIndex = text.indexOf(phrase, index + 1);
    if (nextIndex === -1) return false;
    index = nextIndex;
  }
  return true;
}

export function backtickTokens(line) {
  return [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim()).filter(Boolean);
}
