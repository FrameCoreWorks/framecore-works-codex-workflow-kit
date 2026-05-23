import { existsSync } from "node:fs";
import { isAbsolute, join, normalize } from "node:path";
import { repoRoot, readJson } from "./common.mjs";

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  if (isAbsolute(value)) return false;
  if (/^[a-z]+:\/\//i.test(value)) return false;
  if (/^[A-Z]:[\\/]/i.test(value)) return false;
  if (/^~(?:\/|\\|$)/.test(value)) return false;
  const normalized = normalize(value).replaceAll("\\", "/");
  return normalized !== "." && !normalized.startsWith("../") && normalized !== "..";
}

function requireBoolean(value, path, errors) {
  if (typeof value !== "boolean") errors.push(`${path} must be boolean`);
}

function requireString(value, path, errors) {
  if (typeof value !== "string" || value.trim().length === 0) errors.push(`${path} must be a non-empty string`);
}

function mergeObjects(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override ?? {})) {
    if (isPlainObject(result[key]) && isPlainObject(value)) {
      result[key] = mergeObjects(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function mergeFrameCoreConfig(...configs) {
  return configs.reduce((merged, config) => mergeObjects(merged, config), {});
}

export function loadFrameCoreConfig({ target, configPath = join(target, "framecore.config.json") }) {
  const defaultsPath = join(repoRoot, "config/defaults.example.json");
  const sharedPath = join(target, "framecore.config.shared.json");
  const layers = [readJson(defaultsPath)];
  const loaded = {
    defaultsPath,
    sharedPath: existsSync(sharedPath) ? sharedPath : null,
    localPath: existsSync(configPath) ? configPath : null,
  };

  if (loaded.sharedPath) layers.push(readJson(loaded.sharedPath));
  if (loaded.localPath) layers.push(readJson(loaded.localPath));

  return {
    ...loaded,
    config: mergeFrameCoreConfig(...layers),
  };
}

export function validateFrameCoreConfig(config, { schema, roles } = {}) {
  const errors = [];
  const effectiveSchema = schema ?? readJson(join(repoRoot, "config/onboarding.schema.json"));
  const effectiveRoles = roles ?? readJson(join(repoRoot, "config/agent-naming.schema.json")).roles;
  const roleSet = new Set(effectiveRoles);

  if (!isPlainObject(config)) {
    return ["config must be a JSON object"];
  }

  for (const field of effectiveSchema.required_fields ?? []) {
    if (!(field in config)) errors.push(`missing required field: ${field}`);
  }

  if (!effectiveSchema.qa_strictness_values.includes(config.qa_strictness)) {
    errors.push(`qa_strictness must be one of: ${effectiveSchema.qa_strictness_values.join(", ")}`);
  }
  requireString(config.working_language, "working_language", errors);
  requireString(config.response_tone, "response_tone", errors);
  if (!isSafeRelativePath(config.output_dir)) {
    errors.push("output_dir must be a safe relative path");
  }

  if (!isPlainObject(config.delivery)) {
    errors.push("delivery must be an object");
  } else {
    requireBoolean(config.delivery.auto_upload, "delivery.auto_upload", errors);
    requireBoolean(config.delivery.delivery_requires_current_user_request, "delivery.delivery_requires_current_user_request", errors);
    requireBoolean(config.delivery.require_qa_allowlist_for_generated_assets, "delivery.require_qa_allowlist_for_generated_assets", errors);
  }

  if (!isPlainObject(config.agent_display_names)) {
    errors.push("agent_display_names must be an object");
  } else {
    for (const [role, displayName] of Object.entries(config.agent_display_names)) {
      if (!roleSet.has(role)) errors.push(`agent_display_names contains unknown role: ${role}`);
      if (typeof displayName !== "string" || displayName.trim().length === 0) {
        errors.push(`agent_display_names.${role} must be a non-empty string`);
      }
      if (typeof displayName === "string" && displayName.length > 80) {
        errors.push(`agent_display_names.${role} must be 80 characters or fewer`);
      }
    }
  }

  if (!isPlainObject(config.hipson)) {
    errors.push("hipson must be an object");
  } else {
    requireBoolean(config.hipson.adapter_enabled, "hipson.adapter_enabled", errors);
    requireBoolean(config.hipson.connect_full_repo, "hipson.connect_full_repo", errors);
    requireString(config.hipson.full_repo_url, "hipson.full_repo_url", errors);
  }

  if (!isPlainObject(config.workflow_self_improvement)) {
    errors.push("workflow_self_improvement must be an object");
  } else {
    requireBoolean(config.workflow_self_improvement.enabled, "workflow_self_improvement.enabled", errors);
    requireBoolean(config.workflow_self_improvement.recurring_review_enabled, "workflow_self_improvement.recurring_review_enabled", errors);
    requireString(config.workflow_self_improvement.cadence, "workflow_self_improvement.cadence", errors);
    requireString(config.workflow_self_improvement.mode, "workflow_self_improvement.mode", errors);
  }

  return errors;
}

export function assertValidFrameCoreConfig(config, options) {
  const errors = validateFrameCoreConfig(config, options);
  if (errors.length > 0) {
    throw new Error(`invalid framecore.config.json: ${errors.join("; ")}`);
  }
}
