import { existsSync } from "node:fs";
import { join } from "node:path";

function isPublicFixturePath(value) {
  if (typeof value !== "string") return false;
  if (!value.startsWith("examples/") || !value.endsWith(".md")) return false;
  return !value.split(/[\\/]+/).some((segment) => segment.startsWith(".") || segment.startsWith("._") || segment.length === 0);
}

export function run(ctx) {
  const { artifactFieldSet, createFindings, isPlainObject, markdownSectionBody, markdownSections, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);
  const { artifactSchemasPath, artifactTemplates } = ctx.paths;

  let artifactSchemas = null;
  let artifactSchemaNames = new Set();
  if (existsSync(artifactSchemasPath)) {
    try {
      artifactSchemas = JSON.parse(read(artifactSchemasPath));
    } catch (error) {
      addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", `Artifact schema registry must be valid JSON: ${error.message}`, [artifactSchemasPath]);
    }
  } else {
    addFinding("MISSING_REPO_FILE", "Required public repo file is missing: config/artifact-schemas.json", [artifactSchemasPath]);
  }
  if (artifactSchemas) {
    if (artifactSchemas.schema_version !== 1) {
      addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", "Artifact schema registry schema_version must be 1.", [artifactSchemasPath]);
    }
    if (!isPlainObject(artifactSchemas.artifacts)) {
      addFinding("INVALID_ARTIFACT_SCHEMA_REGISTRY", "Artifact schema registry must define an artifacts object.", [artifactSchemasPath]);
    } else {
      artifactSchemaNames = new Set(Object.keys(artifactSchemas.artifacts));
    }
  }

  if (existsSync(artifactTemplates)) {
    const text = read(artifactTemplates);
    const sections = markdownSections(text);
    for (const section of ["Task Confirmation", "Workflow Request Diagnostic", "Loop State", "Brief Contract", "Reference Pack", "Instruction Packet", "Storyboard Contract", "Board Artifact Prompt", "Prompt Pack", "Execution Manifest", "HyperFrames Production Brief", "QA / Iteration Report", "Delivery Manifest", "Self-Improvement Sufficiency Gate"]) {
      if (!sections.has(section)) addFinding("MISSING_TEMPLATE_SECTION", `Artifact template section is missing: ${section}`, [artifactTemplates]);
    }
    if (artifactSchemas?.artifacts) {
      for (const [artifactName, schema] of Object.entries(artifactSchemas.artifacts)) {
        if (!sections.has(artifactName)) {
          addFinding("ARTIFACT_SCHEMA_WITHOUT_TEMPLATE", `Artifact schema has no matching template section: ${artifactName}`, [artifactSchemasPath, artifactTemplates]);
          continue;
        }
        if (!isPlainObject(schema) || !Array.isArray(schema.required_fields) || schema.required_fields.length === 0) {
          addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema must define required_fields: ${artifactName}`, [artifactSchemasPath]);
          continue;
        }
        const templateFields = artifactFieldSet(markdownSectionBody(text, artifactName));
        for (const field of schema.required_fields) {
          if (typeof field !== "string" || field.trim().length === 0) {
            addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema required_fields must contain non-empty strings: ${artifactName}`, [artifactSchemasPath]);
            continue;
          }
          if (!templateFields.has(field)) {
            addFinding("ARTIFACT_SCHEMA_FIELD_MISSING_TEMPLATE", `Artifact ${artifactName} requires field missing from its template: ${field}`, [artifactSchemasPath, artifactTemplates]);
          }
        }
        if (!Array.isArray(schema.example_paths) || schema.example_paths.length === 0) {
          addFinding("MISSING_ARTIFACT_FIXTURE_COVERAGE", `Artifact schema must register at least one public fixture: ${artifactName}`, [artifactSchemasPath]);
        }
        for (const examplePath of schema.example_paths ?? []) {
          if (typeof examplePath !== "string" || examplePath.startsWith("/") || examplePath.split(/[\\/]+/).includes("..")) {
            addFinding("INVALID_ARTIFACT_SCHEMA", `Artifact schema example path must be repo-relative and safe: ${artifactName}`, [artifactSchemasPath]);
            continue;
          }
          if (!isPublicFixturePath(examplePath)) {
            addFinding("INVALID_ARTIFACT_FIXTURE_PATH", `Artifact schema example path must point to a public Markdown fixture under examples/: ${artifactName}`, [artifactSchemasPath]);
            continue;
          }
          const exampleFile = join(ctx.root, examplePath);
          if (!existsSync(exampleFile)) {
            addFinding("MISSING_ARTIFACT_EXAMPLE", `Artifact example file is missing: ${examplePath}`, [artifactSchemasPath]);
            continue;
          }
          const exampleFields = artifactFieldSet(read(exampleFile));
          for (const field of schema.required_fields) {
            if (!exampleFields.has(field)) {
              addFinding("EXAMPLE_ARTIFACT_MISSING_FIELD", `Example artifact ${examplePath} is missing required field: ${field}`, [exampleFile, artifactSchemasPath]);
            }
          }
          if (artifactName === "Image Prompt Contract") {
            const fixtureText = read(exampleFile);
            for (const phrase of ["native Codex/ChatGPT image generator", "one pass", "exact_visible_text", "QA_checks"]) {
              if (!fixtureText.includes(phrase)) {
                addFinding("WEAK_TEXT_IMAGE_ARTIFACT_FIXTURE", `Image Prompt Contract fixture must enforce text-bearing image policy phrase: ${phrase}`, [exampleFile, artifactSchemasPath]);
              }
            }
          }
        }
      }
      for (const section of sections) {
        if (!artifactSchemaNames.has(section)) {
          addFinding("TEMPLATE_SECTION_MISSING_SCHEMA", `Artifact template section has no matching schema: ${section}`, [artifactTemplates, artifactSchemasPath]);
        }
      }
    }
  }

  return {
    findings,
    artifactSchemas,
    artifactSchemaNames
  };
}
