#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { assertNoSymlinkPath, hasHelpFlag, isMainModule, printHelpAndExit, repoRoot, readJson } from "./common.mjs";
import { assertValidFrameCoreConfig, isSafeRelativePath } from "./config-validation.mjs";

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function ensureTarget(target, createTarget) {
  if (!existsSync(target)) {
    if (!createTarget) {
      throw new Error("target workspace does not exist. Create or choose the workspace first, or rerun with --create-target.");
    }
    mkdirSync(target, { recursive: true });
  }
  if (!statSync(target).isDirectory()) {
    throw new Error("target workspace is not a directory.");
  }
}

function nextBackupPath(destination) {
  const first = `${destination}.bak`;
  if (!existsSync(first)) return first;
  let index = 1;
  while (existsSync(`${first}.${index}`)) index += 1;
  return `${first}.${index}`;
}

const onboardingCopy = {
  en: {
    intro: `
Creative Workflow Skill Kit setup

This installer adds a structured creative workflow to your current Codex workspace.
It was designed for creative production: graphics, video, storyboard, campaign,
e-commerce, prompt, QA, and delivery work. It can also be adapted to other use
cases when you profile the setup for your own work.

What will be installed project-locally:
- role-based Codex agents for planning, references, direction, prompts, QA, and delivery
- skills and templates for briefs, reference packs, prompt packs, review gates, and manifests
- Humanizer for natural rewriting and voice polish
- HyperFrames workflow knowledge for coded video planning
- a local config file with your preferences
- a local manifest so update, repair, and uninstall know what this workflow manages

What will not be configured:
- external paid execution providers
- provider credentials or API keys
- private cloud delivery settings
- automatic uploads unless you explicitly opt into that local behavior

How this improves your work:
- Codex starts by confirming the task instead of rushing into output
- larger jobs are split into clear stages and review gates
- prompts, assets, QA notes, and delivery summaries follow repeatable templates
- generated or produced assets can be reviewed before delivery
- your workspace can keep a consistent operating style across projects

Hipson in this setup:
The included Hipson Adapter is a lightweight packet layer. It helps Codex prepare
research maps, internet mapping packets, bounded agent instructions, review packets,
and execution packets inside this workflow.

Full Hipson is separate and optional:
https://github.com/Hipson47/Hipson.git

If you connect the full Hipson system later, it can add broader repo scanning,
delta reviews, sidecar review agents, cross-repo orchestration, CLI commands,
and a larger Hipson knowledge base. The adapter is enough to use this workflow now.
Onboarding only records whether you intend to connect that optional external
extension later; it does not clone, install, or activate full Hipson.
`,
    continuePrompt: "Press Enter to continue setup. ",
    profileIntro: "\nFirst, profile this workspace so the pipeline fits your work instead of staying generic.",
    profileHelp: "These answers stay local in the generated config file and help the orchestrator choose route depth, artifacts, QA strictness, and first workflow paths.",
    primaryWork: "What kind of work do you do?",
    primaryUseCases: "What should this pipeline help with most?",
    workflowStyle: "How should the pipeline fit your work style?",
    adaptationNotes: "Any adaptation notes for non-creative or specialized use cases?",
    responseTone: "Response tone",
    outputDir: "Output directory for generated files and workflow reports (safe relative path, for example output/workflow)",
    unsafeOutputDir: "Use a safe relative path inside the workspace, for example output/workflow. Do not use absolute paths, ~, URLs, or ../ segments.",
    qaStrictness: "QA strictness",
    chooseOne: (choices) => `Choose one of: ${choices.join(", ")}`,
    yes: "yes",
    no: "no",
    chooseYesNo: "Choose yes or no.",
    autoUpload: "Allow automatic delivery uploads if you later add a delivery integration? yes/no",
    deliveryRequiresRequest: "Require an explicit user request before delivery/export? yes/no",
    requireQaAllowlist: "Require QA approval before generated asset delivery? yes/no",
    recurringReview: "Enable 24-hour workflow self-improvement review? yes/no",
    fullHipson: "Record intent to connect full Hipson later as an external extension? yes/no",
    roleNamesIntro: "\nAgents use neutral role IDs by default. You can keep them or rename them locally for your own workspace.",
    defaultRoleNames: "Use default role names? yes/no",
    roleNamesHelp: "Enter local display names. Press Enter to keep a role ID.",
    wrote: "wrote",
    hipsonDone: "Hipson Adapter is enabled. Full Hipson remains optional and external; onboarding did not clone, install, or activate it.",
    nextSteps: `
Next steps:
1. Run install dry-run against this target workspace.
   npm run install:dry-run -- --target <target-workspace>
2. Review the planned writes and resolve any user-owned file conflicts.
3. Install project-locally.
   node scripts/install.mjs --mode project-local --target <target-workspace>
4. Open the target project in Codex and ask it to read AGENTS.md and AGENTS.framecore.md if both exist.
5. Use docs/using-the-kit.md for starter prompts and route selection.
`,
  },
  pl: {
    intro: `
Konfiguracja kreatywnego workflow

Ten instalator dodaje uporządkowany kreatywny workflow do wybranego workspace'u Codexa.
Został zaprojektowany z myślą o pracy kreatywnej: grafika, wideo, storyboardy,
kampanie, e-commerce, prompty, QA i przygotowanie materiałów do oddania. Można
go też zaadaptować do innych zastosowań, jeśli dobrze opiszesz swój styl pracy.

Co zostanie zainstalowane lokalnie w projekcie:
- role agentów Codexa do planowania, referencji, kierunku, promptów, QA i oddania
- skille i szablony dla briefów, paczek referencji, prompt packów, bramek review i manifestów
- Humanizer do naturalnego przepisywania i dopracowania tonu
- wiedza HyperFrames do planowania kodowanego wideo
- lokalny plik konfiguracyjny z Twoimi preferencjami
- lokalny manifest, żeby update, repair i uninstall wiedziały, co należy do tego workflow

Czego instalator nie skonfiguruje:
- zewnętrznych płatnych providerów wykonawczych
- credentiali ani API key
- prywatnych ustawień delivery do chmury
- automatycznych uploadów, chyba że później wyraźnie włączysz takie lokalne zachowanie

Jak to ma pomagać w pracy:
- Codex zaczyna od potwierdzenia zadania zamiast od razu produkować output
- większe zadania są dzielone na etapy i bramki review
- prompty, assety, notatki QA i delivery summary używają powtarzalnych szablonów
- wygenerowane lub przygotowane materiały można sprawdzić przed oddaniem
- workspace może trzymać spójny styl pracy między projektami

Hipson w tym setupie:
Dołączony Hipson Adapter jest lekką warstwą pakietów instrukcji. Pomaga Codexowi przygotować
mapy researchu, pakiety internet mapping, ograniczone instrukcje dla agentów, review packets
i execution packets wewnątrz tego workflow.

Pełny Hipson jest osobny i opcjonalny:
https://github.com/Hipson47/Hipson.git

Jeśli podłączysz pełny system Hipson później, może dodać szersze skanowanie repozytoriów,
delta reviews, sidecar review agents, cross-repo orchestration, komendy CLI
i większą bazę wiedzy Hipsona. Adapter wystarczy, żeby używać tego workflow już teraz.
Onboarding tylko zapisuje, czy planujesz podłączyć to opcjonalne rozszerzenie później;
nie klonuje, nie instaluje i nie aktywuje pełnego Hipsona.
`,
    continuePrompt: "Press Enter to continue setup. / Naciśnij Enter, aby kontynuować konfigurację. ",
    profileIntro: "\nNajpierw sprofiluj ten workspace, żeby pipeline pasował do Twojej pracy zamiast działać generycznie.",
    profileHelp: "Te odpowiedzi zostają lokalnie w wygenerowanym pliku konfiguracyjnym i pomagają orkiestratorowi dobrać głębokość ścieżki, artefakty, poziom QA i pierwsze kroki workflow.",
    primaryWork: "Czym się zajmujesz?",
    primaryUseCases: "W czym ten pipeline ma pomagać najbardziej?",
    workflowStyle: "Jak pipeline ma pasować do Twojego stylu pracy?",
    adaptationNotes: "Czy masz uwagi do adaptacji pod inne lub specjalistyczne zastosowania?",
    responseTone: "Ton odpowiedzi",
    outputDir: "Folder na wygenerowane pliki i raporty workflow (bezpieczna ścieżka względna, np. output/workflow)",
    unsafeOutputDir: "Użyj bezpiecznej ścieżki względnej wewnątrz workspace'u, np. output/workflow. Nie używaj ścieżek absolutnych, ~, URL-i ani segmentów ../.",
    qaStrictness: "Poziom QA",
    chooseOne: (choices) => `Wybierz jedną opcję: ${choices.join(", ")}`,
    yes: "tak",
    no: "nie",
    chooseYesNo: "Wybierz tak albo nie.",
    autoUpload: "Czy pozwolić na automatyczne uploady delivery, jeśli później dodasz integrację delivery? tak/nie",
    deliveryRequiresRequest: "Czy wymagać wyraźnej prośby usera przed delivery/export? tak/nie",
    requireQaAllowlist: "Czy wymagać akceptacji QA przed oddaniem wygenerowanych assetów? tak/nie",
    recurringReview: "Czy włączyć 24-godzinny report workflow self-improvement? tak/nie",
    fullHipson: "Czy zapisać zamiar podłączenia pełnego Hipsona później jako zewnętrznego rozszerzenia? tak/nie",
    roleNamesIntro: "\nAgenci domyślnie używają neutralnych role ID. Możesz je zostawić albo lokalnie nazwać po swojemu.",
    defaultRoleNames: "Czy użyć domyślnych nazw ról? tak/nie",
    roleNamesHelp: "Wpisz lokalne nazwy wyświetlane. Naciśnij Enter, żeby zostawić role ID.",
    wrote: "zapisano",
    hipsonDone: "Hipson Adapter jest włączony. Pełny Hipson pozostaje opcjonalny i zewnętrzny; onboarding go nie sklonował, nie zainstalował ani nie aktywował.",
    nextSteps: `
Następne kroki:
1. Uruchom install dry-run dla tego target workspace.
   npm run install:dry-run -- --target <target-workspace>
2. Sprawdź planowane zapisy i rozwiąż ewentualne konflikty z plikami usera.
3. Zainstaluj project-locally.
   node scripts/install.mjs --mode project-local --target <target-workspace>
4. Otwórz target project w Codexie i poproś go o przeczytanie AGENTS.md oraz AGENTS.framecore.md, jeśli oba istnieją.
5. Użyj docs/using-the-kit.md do starter promptów i wyboru ścieżki.
`,
  },
};

async function ask(rl, prompt, fallback) {
  const answer = await rl.question(`${prompt} (${fallback}): `);
  return answer.trim() || fallback;
}

async function askOnboardingLanguage(rl) {
  while (true) {
    const value = (await ask(rl, "Onboarding language. Press Enter for English, or type your preferred language for the setup conversation", "en")).toLowerCase();
    if (["en", "english", "angielski"].includes(value)) return "en";
    if (["pl", "polish", "polski"].includes(value)) return "pl";
    console.log("This CLI currently includes built-in English and Polish setup text. Continuing in English.");
    return "en";
  }
}

async function askChoice(rl, prompt, fallback, choices, copy) {
  while (true) {
    const value = await ask(rl, prompt, fallback);
    if (choices.includes(value)) return value;
    console.log(copy.chooseOne(choices));
  }
}

async function askSafeRelativePath(rl, prompt, fallback, copy) {
  while (true) {
    const value = await ask(rl, prompt, fallback);
    if (isSafeRelativePath(value)) return value;
    console.log(copy.unsafeOutputDir);
  }
}

async function askYesNo(rl, prompt, fallback, copy) {
  const fallbackText = fallback ? copy.yes : copy.no;
  while (true) {
    const value = (await ask(rl, prompt, fallbackText)).toLowerCase();
    if (["yes", "y", "tak", "t"].includes(value)) return true;
    if (["no", "n", "nie"].includes(value)) return false;
    console.log(copy.chooseYesNo);
  }
}

function printIntro(language) {
  console.log(onboardingCopy[language].intro);
}

function printNextSteps(language) {
  console.log(onboardingCopy[language].nextSteps);
}

export async function runOnboarding({ target = process.cwd(), defaults = false, createTarget = false } = {}) {
  ensureTarget(target, createTarget);
  const defaultsConfig = readJson(join(repoRoot, "config/defaults.example.json"));
  const configPath = join(target, "framecore.config.json");
  const config = structuredClone(defaultsConfig);
  const roles = readJson(join(repoRoot, "config/agent-naming.schema.json")).roles;
  let onboardingLanguage = "en";

  if (!defaults) {
    const rl = readline.createInterface({ input, output });
    onboardingLanguage = await askOnboardingLanguage(rl);
    const copy = onboardingCopy[onboardingLanguage];
    printIntro(onboardingLanguage);
    await rl.question(copy.continuePrompt);
    console.log(copy.profileIntro);
    console.log(copy.profileHelp);
    config.work_profile.primary_work = await ask(rl, copy.primaryWork, config.work_profile.primary_work);
    config.work_profile.primary_use_cases = await ask(rl, copy.primaryUseCases, config.work_profile.primary_use_cases);
    config.work_profile.workflow_style = await ask(rl, copy.workflowStyle, config.work_profile.workflow_style);
    config.work_profile.adaptation_notes = await ask(rl, copy.adaptationNotes, config.work_profile.adaptation_notes);
    config.response_tone = await ask(rl, copy.responseTone, config.response_tone);
    config.output_dir = await askSafeRelativePath(rl, copy.outputDir, config.output_dir, copy);
    config.qa_strictness = await askChoice(rl, copy.qaStrictness, config.qa_strictness, ["light", "standard", "strict"], copy);
    config.delivery.auto_upload = await askYesNo(rl, copy.autoUpload, config.delivery.auto_upload, copy);
    config.delivery.delivery_requires_current_user_request = await askYesNo(rl, copy.deliveryRequiresRequest, config.delivery.delivery_requires_current_user_request, copy);
    config.delivery.require_qa_allowlist_for_generated_assets = await askYesNo(rl, copy.requireQaAllowlist, config.delivery.require_qa_allowlist_for_generated_assets, copy);
    config.workflow_self_improvement.recurring_review_enabled = await askYesNo(rl, copy.recurringReview, config.workflow_self_improvement.recurring_review_enabled, copy);
    config.hipson.connect_full_repo = await askYesNo(rl, copy.fullHipson, config.hipson.connect_full_repo, copy);

    console.log(copy.roleNamesIntro);
    const defaultRoleNames = await askYesNo(rl, copy.defaultRoleNames, true, copy);
    if (!defaultRoleNames) {
      console.log(copy.roleNamesHelp);
      for (const role of roles) {
        const value = await ask(rl, role, role);
        if (value !== role) config.agent_display_names[role] = value;
      }
    }
    rl.close();
  }

  assertValidFrameCoreConfig(config);
  assertNoSymlinkPath(target, configPath);

  if (existsSync(configPath)) {
    writeFileSync(nextBackupPath(configPath), readFileSync(configPath, "utf8"));
  }

  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  if (config.workflow_self_improvement.recurring_review_enabled) {
    const recipeSource = join(repoRoot, "config/automation-recipes/workflow-self-improvement-review.example.json");
    const recipeTarget = join(target, ".framecore/automation-recipes/workflow-self-improvement-review.json");
    assertNoSymlinkPath(target, recipeTarget);
    mkdirSync(dirname(recipeTarget), { recursive: true });
    writeFileSync(recipeTarget, readFileSync(recipeSource, "utf8"));
  }

  const outputLanguage = onboardingLanguage;
  console.log(`${onboardingCopy[outputLanguage].wrote} ${configPath}`);
  console.log(onboardingCopy[outputLanguage].hipsonDone);
  printNextSteps(outputLanguage);
  return configPath;
}

if (isMainModule(import.meta.url)) {
  if (hasHelpFlag()) {
    printHelpAndExit(`
Usage:
  node scripts/onboard.mjs [--target <path>] [--defaults] [--create-target]

Purpose:
  Create a local framecore.config.json with workspace preferences.

Options:
  --target <path>  Workspace where framecore.config.json should be written.
  --defaults       Write default preferences without interactive questions.
  --create-target  Create the target folder if it does not exist.

Output:
  Writes framecore.config.json and, when explicitly enabled, an optional report-only automation recipe.
`);
  }
  await runOnboarding({
    target: argValue("--target", process.cwd()),
    defaults: process.argv.includes("--defaults"),
    createTarget: process.argv.includes("--create-target"),
  });
}
