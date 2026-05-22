#!/usr/bin/env node
import { basename, join, resolve } from "node:path";
import { hasHelpFlag, printHelpAndExit, readJson, readText, relativePosix, repoRoot, reportFindings, walkFiles } from "./common.mjs";

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/safety-scan.mjs [repo-root]

Purpose:
  Run a dependency-free release safety scan for public source.

Options:
  repo-root  Optional repository root to scan. Defaults to this repo.

Checks:
  Sensitive filenames, credential-shaped values, private key blocks, common platform tokens, JWT-like values, and private cloud references.
`);
}

const targetRoot = process.argv[2] ? resolve(process.argv[2]) : repoRoot;
const policy = readJson(join(repoRoot, "config/privacy-audit-policy.json"));
const excludes = policy.scan_excludes ?? [];
const findings = [];

function addFinding(code, message, files) {
  findings.push({
    code,
    message,
    files: files.map((file) => relativePosix(targetRoot, file)),
  });
}

function hasCredentialLikeValue(text) {
  return [
    /(?:api[_-]?key|secret|token|bearer|password|passwd|pwd)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
    /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
    /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
  ].some((pattern) => pattern.test(text));
}

function hasPrivateCloudReference(text) {
  return [
    /\bhttps?:\/\/(?:drive|docs)\.google\.com\/(?:drive\/folders|file\/d|document\/d|spreadsheets\/d|presentation\/d)\/[A-Za-z0-9_-]{20,}/i,
    /\bhttps?:\/\/www\.notion\.so\/[A-Za-z0-9_-]*[a-f0-9]{32}\b/i,
    /\bhttps?:\/\/(?:www\.)?dropbox\.com\/[^\s"']+/i,
    /\bhttps?:\/\/[A-Za-z0-9.-]+\.sharepoint\.com\/[^\s"']+/i,
    /\bhttps?:\/\/[A-Za-z0-9.-]+\.blob\.core\.windows\.net\/[^\s"']+/i,
    /\b(?:s3|gs):\/\/[A-Za-z0-9._/-]+/i,
    /\b(?:drive|folder|file|document|spreadsheet|presentation)[_-]?id\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/i,
  ].some((pattern) => pattern.test(text));
}

const files = walkFiles(targetRoot, { excludes });
const textFiles = files.filter((file) => {
  const name = basename(file);
  return /\.(md|json|yaml|yml|toml|js|mjs|ts|tsx|txt|template)$/i.test(name) || name === "LICENSE" || name === ".gitignore";
});

const sensitiveFileHits = [];
const credentialValueHits = [];
const privateCloudHits = [];

for (const file of files) {
  const name = basename(file);
  if (/^(?:\.env(?:\..*)?|\.npmrc|\.pypirc|\.netrc|id_rsa|id_ed25519|id_dsa)$/i.test(name) || /\.(?:pem|key|p12|pfx)$/i.test(name)) {
    sensitiveFileHits.push(file);
  }
}

for (const file of textFiles) {
  let text = "";
  try {
    text = readText(file);
  } catch {
    continue;
  }

  if (hasCredentialLikeValue(text)) {
    credentialValueHits.push(file);
  }

  if (hasPrivateCloudReference(text)) {
    privateCloudHits.push(file);
  }
}

if (sensitiveFileHits.length > 0) {
  addFinding("SAFETY_SCAN_FILE_NAME", "Sensitive file names are not allowed in public repo source.", [...new Set(sensitiveFileHits)]);
}
if (credentialValueHits.length > 0) {
  addFinding("SAFETY_SCAN_VALUE", "Credential-shaped values were found.", [...new Set(credentialValueHits)]);
}
if (privateCloudHits.length > 0) {
  addFinding("SAFETY_SCAN_PRIVATE_CLOUD", "Private cloud URLs or IDs were found.", [...new Set(privateCloudHits)]);
}

process.exit(reportFindings(findings, "safety scan passed"));
