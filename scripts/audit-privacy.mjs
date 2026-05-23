#!/usr/bin/env node
import { basename, join, resolve } from "node:path";
import { decodeBase64List, hasHelpFlag, isAppleDouble, printHelpAndExit, readJson, readText, relativePosix, repoRoot, reportFindings, walkFiles } from "./common.mjs";

if (hasHelpFlag()) {
  printHelpAndExit(`
Usage:
  node scripts/audit-privacy.mjs [repo-root]

Purpose:
  Scan source files for content that should not be committed to the public kit.

Options:
  repo-root  Optional repository root to audit. Defaults to this repo.

Checks:
  Private names, excluded provider remnants, local paths, emails, secret-like values,
  secret-bearing filenames, private cloud references, symlinks, and AppleDouble files.
`);
}

const targetRoot = process.argv[2] ? resolve(process.argv[2]) : repoRoot;
const policy = readJson(join(repoRoot, "config/privacy-audit-policy.json"));
const bannedTerms = [
  ...decodeBase64List(policy.encoded_banned_terms_base64),
  ...decodeBase64List(policy.encoded_private_agent_names_base64),
];
const excludes = policy.scan_excludes ?? [];
const findings = [];

function addFinding(code, message, files) {
  findings.push({
    code,
    message,
    files: files.map((file) => relativePosix(targetRoot, file)),
  });
}

const symlinkHits = [];
const files = walkFiles(targetRoot, {
  excludes,
  onSymlink: (file) => symlinkHits.push(file),
});
if (symlinkHits.length > 0) {
  addFinding("SYMLINK_FILE", "Symlinks are not allowed in public repo source scans.", [...new Set(symlinkHits)]);
}

const appleDouble = files.filter(isAppleDouble);
if (appleDouble.length > 0) {
  addFinding("APPLEDOUBLE_FILE", "AppleDouble metadata files are not allowed.", appleDouble);
}

const textFiles = files.filter((file) => {
  const name = basename(file);
  return /\.(md|json|yaml|yml|toml|js|mjs|ts|tsx|txt|template)$/i.test(name) || name === "LICENSE" || name === ".gitignore";
});

const bannedHits = [];
const localPathHits = [];
const emailHits = [];
const secretHits = [];
const secretFileHits = [];
const privateCloudHits = [];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(text, term) {
  const boundary = "(^|[^A-Za-z0-9_-])";
  const pattern = new RegExp(`${boundary}${escapeRegExp(term)}(?=$|[^A-Za-z0-9_-])`, "i");
  return pattern.test(text);
}

function hasLocalMachinePath(text) {
  return [
    /(^|[\s"'(])\/(?:Users|Volumes|private\/var|home|root)\/[A-Za-z0-9._ -]+/i,
    /(^|[\s"'(])[A-Z]:[\\/](?:Users|Documents and Settings)[\\/][A-Za-z0-9._ -]+/i,
    /(^|[\s"'(])\/mnt\/[a-z]\/Users\/[A-Za-z0-9._ -]+/i,
    /(^|[\s"'(])file:\/\/\/(?:Users|Volumes|home|root)\/[A-Za-z0-9._ -]+/i,
    /(^|[\s"'(])\\\\[A-Za-z0-9._-]+\\[A-Za-z0-9$._-]+\\[A-Za-z0-9._ -]+/i,
  ].some((pattern) => pattern.test(text));
}

function hasSecretLikeValue(text) {
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

for (const file of files) {
  const name = basename(file);
  if (/^(?:\.env(?:\..*)?|\.npmrc|\.pypirc|\.netrc|id_rsa|id_ed25519|id_dsa)$/i.test(name) || /\.(?:pem|key|p12|pfx)$/i.test(name)) {
    secretFileHits.push(file);
  }
}

for (const file of textFiles) {
  let text = "";
  try {
    text = readText(file);
  } catch {
    continue;
  }

  for (const term of bannedTerms) {
    if (term && containsTerm(text, term)) {
      bannedHits.push(file);
      break;
    }
  }

  if (hasLocalMachinePath(text)) {
    localPathHits.push(file);
  }

  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    emailHits.push(file);
  }

  if (hasSecretLikeValue(text)) {
    secretHits.push(file);
  }

  if (hasPrivateCloudReference(text)) {
    privateCloudHits.push(file);
  }
}

if (bannedHits.length > 0) {
  addFinding("BANNED_TERM", "Private names or excluded provider/tool remnants were found.", [...new Set(bannedHits)]);
}
if (localPathHits.length > 0) {
  addFinding("LOCAL_ABSOLUTE_PATH", "Local absolute machine paths were found.", [...new Set(localPathHits)]);
}
if (emailHits.length > 0) {
  addFinding("EMAIL_ADDRESS", "Email addresses are not allowed in public repo source.", [...new Set(emailHits)]);
}
if (secretHits.length > 0) {
  addFinding("SECRET_LIKE_VALUE", "Secret-like values were found.", [...new Set(secretHits)]);
}
if (secretFileHits.length > 0) {
  addFinding("SECRET_FILE_NAME", "Secret-bearing file names are not allowed in public repo source.", [...new Set(secretFileHits)]);
}
if (privateCloudHits.length > 0) {
  addFinding("PRIVATE_CLOUD_REFERENCE", "Private cloud URLs or IDs were found.", [...new Set(privateCloudHits)]);
}

process.exit(reportFindings(findings, "privacy audit passed"));
