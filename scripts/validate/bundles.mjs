import { existsSync } from "node:fs";
import { join } from "node:path";

function isSafeBundlePath(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  if (value.startsWith("/") || value.includes("\\") || value.includes("\0")) return false;
  const normalized = value.replace(/\/+$/, "");
  if (normalized === "") return false;
  return !normalized.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
}

function isForbiddenBundleSourcePath(value) {
  const normalized = value.replace(/\/+$/, "");
  const segments = normalized.split("/");
  const forbiddenTopLevel = new Set([
    ".framecore",
    "Context",
    "Memory Cache",
    "output",
    "outputs",
    "framecore.config.json",
  ]);
  if (forbiddenTopLevel.has(segments[0])) return true;
  return segments.some((segment) => segment === ".git" || segment === "node_modules");
}

export function run(ctx) {
  const { createFindings, isPlainObject, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);
  const bundleMapPath = ctx.paths.bundleMapPath;

  let bundleMap = null;
  if (existsSync(bundleMapPath)) {
    try {
      bundleMap = JSON.parse(read(bundleMapPath));
    } catch (error) {
      addFinding("INVALID_BUNDLE_MAP", `Bundle map must be valid JSON: ${error.message}`, [bundleMapPath]);
    }
  } else {
    addFinding("MISSING_REPO_FILE", "Required public repo file is missing: config/bundle-map.json", [bundleMapPath]);
  }
  if (bundleMap) {
    if (bundleMap.schema_version !== 1) {
      addFinding("INVALID_BUNDLE_MAP", "Bundle map schema_version must be 1.", [bundleMapPath]);
    }
    if (!isPlainObject(bundleMap.bundles)) {
      addFinding("INVALID_BUNDLE_MAP", "Bundle map must define a bundles object.", [bundleMapPath]);
    } else {
      const bundleIds = new Set(Object.keys(bundleMap.bundles));
      for (const requiredBundle of ["pipeline-core", "creative-workflow", "provider-governance", "memory-cache", "install-lifecycle"]) {
        if (!bundleIds.has(requiredBundle)) {
          addFinding("INVALID_BUNDLE_MAP", `Bundle map is missing required bundle: ${requiredBundle}`, [bundleMapPath]);
        }
      }
      for (const [bundleId, bundle] of Object.entries(bundleMap.bundles)) {
        if (!/^[a-z0-9-]+$/.test(bundleId)) {
          addFinding("INVALID_BUNDLE_MAP", `Bundle id must be lowercase kebab-case: ${bundleId}`, [bundleMapPath]);
        }
        if (!isPlainObject(bundle)) {
          addFinding("INVALID_BUNDLE_MAP", `Bundle entry must be an object: ${bundleId}`, [bundleMapPath]);
          continue;
        }
        if (typeof bundle.summary !== "string" || bundle.summary.trim() === "") {
          addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} must include summary.`, [bundleMapPath]);
        }
        if (typeof bundle.public_installable !== "boolean") {
          addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} must include boolean public_installable.`, [bundleMapPath]);
        }
        const sourcePaths = Array.isArray(bundle.source_paths) ? bundle.source_paths : null;
        const dependencies = Array.isArray(bundle.dependencies) ? bundle.dependencies : null;
        const skills = Array.isArray(bundle.skills) ? bundle.skills : null;
        const roles = Array.isArray(bundle.roles) ? bundle.roles : null;
        const examples = Array.isArray(bundle.examples) ? bundle.examples : null;
        const privateExclusions = Array.isArray(bundle.private_exclusions) ? bundle.private_exclusions : null;
        for (const [field, value] of Object.entries({ source_paths: sourcePaths, dependencies, skills, roles, examples, private_exclusions: privateExclusions })) {
          if (!Array.isArray(value)) {
            addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} field ${field} must be an array.`, [bundleMapPath]);
          }
        }
        for (const sourcePath of sourcePaths ?? []) {
          if (!isSafeBundlePath(sourcePath)) {
            addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} has unsafe source path: ${sourcePath}`, [bundleMapPath]);
            continue;
          }
          if (isForbiddenBundleSourcePath(sourcePath)) {
            addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} source path must not include private runtime path: ${sourcePath}`, [bundleMapPath]);
          }
          if (!existsSync(join(ctx.root, sourcePath))) {
            addFinding("BUNDLE_MAP_PATH_MISSING", `Bundle ${bundleId} source path does not exist: ${sourcePath}`, [bundleMapPath]);
          }
        }
        for (const dependency of dependencies ?? []) {
          if (!bundleIds.has(dependency)) {
            addFinding("BUNDLE_MAP_UNKNOWN_DEPENDENCY", `Bundle ${bundleId} references unknown dependency: ${dependency}`, [bundleMapPath]);
          }
        }
        for (const skill of skills ?? []) {
          if (!ctx.knownSkillNames.has(skill)) {
            addFinding("BUNDLE_MAP_UNKNOWN_SKILL", `Bundle ${bundleId} references unknown skill: ${skill}`, [bundleMapPath]);
          }
        }
        for (const role of roles ?? []) {
          if (!ctx.requiredRoleSet.has(role)) {
            addFinding("BUNDLE_MAP_UNKNOWN_ROLE", `Bundle ${bundleId} references unknown role: ${role}`, [bundleMapPath]);
          }
        }
        for (const example of examples ?? []) {
          if (!/^[a-z0-9-]+$/.test(example) || !existsSync(join(ctx.root, "examples", example, "workflow.json"))) {
            addFinding("BUNDLE_MAP_UNKNOWN_EXAMPLE", `Bundle ${bundleId} references unknown example workflow: ${example}`, [bundleMapPath]);
          }
        }
        const sourcePathSet = new Set(sourcePaths ?? []);
        for (const privatePath of privateExclusions ?? []) {
          if (typeof privatePath !== "string" || privatePath.trim() === "") {
            addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} contains an invalid private exclusion.`, [bundleMapPath]);
          }
          if (sourcePathSet.has(privatePath)) {
            addFinding("INVALID_BUNDLE_MAP", `Bundle ${bundleId} includes a private exclusion as a source path: ${privatePath}`, [bundleMapPath]);
          }
        }
      }
    }
  }

  return { findings, bundleMap };
}
