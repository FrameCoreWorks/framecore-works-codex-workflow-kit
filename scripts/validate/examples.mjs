import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { isAppleDouble, relativePosix, walkFiles } from "../common.mjs";

export function run(ctx) {
  const { createFindings, isPlainObject, read } = ctx.helpers;
  const { findings, addFinding } = createFindings(ctx.root);
  const validationRoot = ctx.root;
  const { handoffMatrix, workflowBlueprints } = ctx.paths;

  const exampleReadmes = walkFiles(join(validationRoot, "examples"))
    .filter((file) => !isAppleDouble(file) && file.endsWith("README.md") && relativePosix(validationRoot, file) !== "examples/README.md");
  const requiredExampleDirectories = [
    "minimal-workflow",
    "static-campaign",
    "ecommerce-product-visual",
    "video-storyboard",
    "storyboard-board",
    "hyperframes-video",
    "image-prompt-pack",
    "document-workflow",
    "qa-delivery-review",
    "no-provider-mode",
    "end-to-end-creative-workflow"
  ];
  for (const example of requiredExampleDirectories) {
    for (const file of ["README.md", "workflow.json"]) {
      const exampleFile = join(validationRoot, "examples", example, file);
      if (!existsSync(exampleFile)) addFinding("MISSING_REQUIRED_EXAMPLE", `Required example is missing file: examples/${example}/${file}`, [exampleFile]);
    }
  }
  const requiredExampleSections = [
    "## Purpose",
    "## Starting User Request",
    "## Inputs And Assumptions",
    "## Agent Route",
    "## Gate Sequence",
    "## Artifacts Produced",
    "## Example Output Skeleton",
    "## QA Checklist",
    "## Failure Or Loopback Case",
    "## Privacy And No-Private-Content Note",
    "## Related Docs And Skills"
  ];
  for (const file of exampleReadmes) {
    const text = read(file);
    for (const section of requiredExampleSections) {
      if (!text.includes(section)) addFinding("WEAK_EXAMPLE_STRUCTURE", `Example is missing required section: ${section}`, [file]);
    }
  }

  for (const readmePath of exampleReadmes) {
    const exampleDir = dirname(readmePath);
    const workflowPath = join(exampleDir, "workflow.json");
    const expectedId = basename(exampleDir);
    if (!existsSync(workflowPath)) {
      addFinding("MISSING_EXAMPLE_WORKFLOW", `Example is missing workflow.json: ${expectedId}`, [readmePath]);
      continue;
    }
    let workflow = null;
    try {
      workflow = JSON.parse(read(workflowPath));
    } catch (error) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow.json must be valid JSON: ${error.message}`, [workflowPath]);
      continue;
    }
    if (!isPlainObject(workflow)) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow.json must be a JSON object.", [workflowPath]);
      continue;
    }
    if (workflow.schema_version !== 1) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow schema_version must be 1.", [workflowPath]);
    }
    if (workflow.example_id !== expectedId) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow example_id must match folder name: ${expectedId}`, [workflowPath]);
    }
    if (typeof workflow.blueprint !== "string" || workflow.blueprint.trim().length === 0) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define blueprint.", [workflowPath]);
    } else if (!ctx.knownWorkflowBlueprints.has(workflow.blueprint)) {
      addFinding("UNKNOWN_EXAMPLE_BLUEPRINT", `Example workflow blueprint is not listed in workflow blueprints: ${workflow.blueprint}`, [workflowPath, workflowBlueprints]);
    } else {
      const blueprintContract = ctx.workflowBlueprintContracts.get(workflow.blueprint);
      if (blueprintContract) {
        const routeSet = new Set(Array.isArray(workflow.route) ? workflow.route : []);
        const gateSet = new Set(Array.isArray(workflow.gates) ? workflow.gates : []);
        for (const role of blueprintContract.requiredRoles) {
          if (!routeSet.has(role)) {
            addFinding("MISSING_EXAMPLE_BLUEPRINT_ROLE", `Example workflow route is missing required blueprint role: ${role}`, [workflowPath, workflowBlueprints]);
          }
        }
        for (const gate of blueprintContract.requiredGates) {
          if (!gateSet.has(gate)) {
            addFinding("MISSING_EXAMPLE_BLUEPRINT_GATE", `Example workflow gates are missing required blueprint gate: ${gate}`, [workflowPath, workflowBlueprints]);
          }
        }
      }
    }
    if (typeof workflow.execution_boundary !== "string" || workflow.execution_boundary.trim().length === 0) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define execution_boundary.", [workflowPath]);
    }
    if (Array.isArray(workflow.route) && workflow.route.includes("qa-iteration")) {
      if (!Array.isArray(workflow.gates) || !workflow.gates.includes("loop_control_fit")) {
        addFinding("MISSING_EXAMPLE_LOOP_GATE", "Example workflows that route through qa-iteration must include loop_control_fit.", [workflowPath]);
      }
      if (!Array.isArray(workflow.artifacts) || !workflow.artifacts.includes("Loop State")) {
        addFinding("MISSING_EXAMPLE_LOOP_ARTIFACT", "Example workflows that route through qa-iteration must include Loop State.", [workflowPath]);
      }
    }
    if (Array.isArray(workflow.gates) && workflow.gates.includes("loop_control_fit") && (!Array.isArray(workflow.artifacts) || !workflow.artifacts.includes("Loop State"))) {
      addFinding("MISSING_EXAMPLE_LOOP_ARTIFACT", "Example workflows that use loop_control_fit must include Loop State.", [workflowPath]);
    }
    for (const [field, allowedSet, code] of [
      ["route", ctx.requiredRoleSet, "UNKNOWN_EXAMPLE_ROLE"],
      ["gates", new Set(ctx.knownGates.keys()), "UNKNOWN_EXAMPLE_GATE"],
      ["artifacts", ctx.artifactSchemaNames, "UNKNOWN_EXAMPLE_ARTIFACT"]
    ]) {
      if (!Array.isArray(workflow[field]) || workflow[field].length === 0) {
        addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow must define non-empty ${field}.`, [workflowPath]);
        continue;
      }
      for (const value of workflow[field]) {
        if (typeof value !== "string" || value.trim().length === 0) {
          addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow ${field} must contain non-empty strings.`, [workflowPath]);
        } else if (!allowedSet.has(value)) {
          addFinding(code, `Example workflow ${field} contains unknown value: ${value}`, [workflowPath]);
        }
      }
    }
    if (!Array.isArray(workflow.handoffs)) {
      addFinding("INVALID_EXAMPLE_WORKFLOW", "Example workflow must define handoffs as an array.", [workflowPath]);
    } else {
      const declaredHandoffs = new Set(workflow.handoffs);
      if (Array.isArray(workflow.route)) {
        for (let index = 0; index < workflow.route.length - 1; index += 1) {
          const from = workflow.route[index];
          const to = workflow.route[index + 1];
          if (typeof from !== "string" || typeof to !== "string") continue;
          const pair = `${from}->${to}`;
          if (!ctx.knownHandoffPairs.has(pair)) {
            addFinding("UNKNOWN_EXAMPLE_ROUTE_HANDOFF", `Example workflow route step is not listed in handoff matrix: ${pair}`, [workflowPath, handoffMatrix]);
          } else if (!declaredHandoffs.has(pair)) {
            addFinding("MISSING_EXAMPLE_ROUTE_HANDOFF", `Example workflow route step must be declared in handoffs: ${pair}`, [workflowPath]);
          }
        }
      }
      for (const pair of workflow.handoffs) {
        if (typeof pair !== "string" || !/^[a-z0-9-]+->[a-z0-9-]+$/.test(pair)) {
          addFinding("INVALID_EXAMPLE_WORKFLOW", `Example workflow handoff must use from->to format: ${pair}`, [workflowPath]);
          continue;
        }
        const [from, to] = pair.split("->");
        if (!ctx.requiredRoleSet.has(from) || !ctx.requiredRoleSet.has(to)) {
          addFinding("UNKNOWN_EXAMPLE_ROLE", `Example workflow handoff references unknown role: ${pair}`, [workflowPath]);
        } else if (!ctx.knownHandoffPairs.has(pair)) {
          addFinding("UNKNOWN_EXAMPLE_HANDOFF", `Example workflow handoff is not listed in handoff matrix: ${pair}`, [workflowPath, handoffMatrix]);
        }
      }
    }
  }

  const endToEndFiles = [
    "examples/end-to-end-creative-workflow/README.md",
    "examples/end-to-end-creative-workflow/artifacts/task-confirmation.md",
    "examples/end-to-end-creative-workflow/artifacts/brief-contract.md",
    "examples/end-to-end-creative-workflow/artifacts/reference-pack.md",
    "examples/end-to-end-creative-workflow/artifacts/direction-contract.md",
    "examples/end-to-end-creative-workflow/artifacts/prompt-pack.md",
    "examples/end-to-end-creative-workflow/artifacts/qa-iteration-report.md",
    "examples/end-to-end-creative-workflow/artifacts/delivery-manifest.md"
  ];
  for (const file of endToEndFiles) {
    if (!existsSync(join(validationRoot, file))) addFinding("MISSING_END_TO_END_EXAMPLE", `End-to-end example file is missing: ${file}`, [join(validationRoot, file)]);
  }

  const readme = read(join(validationRoot, "README.md"));
  for (const target of [...ctx.requiredDocs, ...exampleReadmes.map((file) => relativePosix(validationRoot, file))]) {
    if (!readme.includes(`](${target})`)) {
      addFinding("README_MISSING_DOC_LINK", `README must link to ${target}`, [join(validationRoot, "README.md")]);
    }
  }

  return { findings };
}
