import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { isAbsolute, resolve, sep } from "node:path";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Resolves a manifest entry only when it is a relative file path inside target.
 * Manifest-driven operations must never accept absolute paths or traversal.
 */
export function resolveManagedPath(target, entry) {
  if (typeof entry !== "string" || entry.length === 0 || isAbsolute(entry) || entry.split(/[\\/]+/).includes("..")) {
    throw new Error(`refusing unsafe managed path: ${entry}`);
  }
  const root = resolve(target);
  const resolved = resolve(root, entry);
  if (resolved === root || !resolved.startsWith(`${root}${sep}`)) {
    throw new Error(`refusing managed path outside target: ${entry}`);
  }
  return resolved;
}

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/**
 * Validates manifest shape and ownership boundaries before doctor, repair, or
 * uninstall trust any recorded path.
 */
export function validateManifest(target, manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return ["manifest must be a JSON object"];
  if (manifest.schema_version !== 1) errors.push("manifest schema_version must be 1");
  if ("incomplete" in manifest && typeof manifest.incomplete !== "boolean") {
    errors.push("manifest incomplete must be a boolean when present");
  }
  if (!Array.isArray(manifest.managed_paths)) {
    errors.push("manifest managed_paths must be an array");
    return errors;
  }

  const seen = new Set();
  for (const entry of manifest.managed_paths) {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      errors.push("manifest managed_paths must contain non-empty strings");
      continue;
    }
    if (seen.has(entry)) {
      errors.push(`manifest contains duplicate managed path: ${entry}`);
    }
    seen.add(entry);
    try {
      const resolved = resolveManagedPath(target, entry);
      if (existsSync(resolved)) {
        const stats = lstatSync(resolved);
        if (stats.isSymbolicLink()) {
          errors.push(`manifest managed path points to a symlink: ${entry}`);
        } else if (stats.isDirectory()) {
          errors.push(`manifest managed path points to a directory: ${entry}`);
        }
      }
    } catch {
      errors.push("manifest contains an unsafe managed path entry");
    }
  }

  if ("managed_hashes" in manifest) {
    if (!isPlainObject(manifest.managed_hashes)) {
      errors.push("manifest managed_hashes must be an object when present");
    } else {
      const managedPathSet = new Set(manifest.managed_paths);
      for (const [entry, hash] of Object.entries(manifest.managed_hashes)) {
        if (!managedPathSet.has(entry)) {
          errors.push("manifest managed_hashes contains a path not listed in managed_paths");
        }
        try {
          resolveManagedPath(target, entry);
        } catch {
          errors.push("manifest managed_hashes contains an unsafe managed path entry");
        }
        if (typeof hash !== "string" || !/^[a-f0-9]{64}$/.test(hash)) {
          errors.push("manifest managed_hashes values must be sha256 hex strings");
        }
      }
    }
  }
  return errors;
}

export function assertValidManifest(target, manifest) {
  const errors = validateManifest(target, manifest);
  if (errors.length > 0) {
    throw new Error(`invalid manifest: ${errors.join("; ")}`);
  }
}
