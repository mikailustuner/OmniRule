#!/usr/bin/env node
/**
 * OmniRule Session Start Hook
 * Runs at SessionStart. Detects project stack, injects skills, initializes dirs.
 * Output to stdout is shown to the agent as context.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function detectStack() {
  const indicators = {};
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['next']) indicators['nextjs-expert'] = true;
    if (deps['react']) indicators['react-expert'] = true;
    if (deps['tailwindcss']) indicators['tailwind-expert'] = true;
    if (deps['@prisma/client']) indicators['prisma-expert'] = true;
    if (deps['playwright']) indicators['testing-patterns'] = true;
    if (deps['typescript']) indicators['typescript-expert'] = true;
  }
  if (fs.existsSync(path.join(root, 'tailwind.config.js'))) indicators['tailwind-expert'] = true;
  if (fs.existsSync(path.join(root, 'schema.prisma'))) indicators['prisma-expert'] = true;
  if (fs.existsSync(path.join(root, 'Dockerfile'))) indicators['docker-patterns'] = true;
  return Object.keys(indicators);
}

function buildAgentInstructions(skills) {
  const sections = [
    '# OmniRule Agent Instructions',
    `> Session started: ${new Date().toISOString()}`,
    `> Detected skills: ${skills.join(', ') || 'none'}`,
    '',
    '## Active Agent Fleet',
    'Entry point: **ORCHESTRATOR** — reads every task and dispatches to the right specialist.',
    '',
    '| Agent | Auto-triggers when |',
    '|---|---|',
    '| style-architect | URL given, CSS/Tailwind file edited, design request |',
    '| architect | Architecture question, planning, new feature design |',
    '| frontend-ops | .tsx/.jsx edited, state/bundle/perf issue |',
    '| qa-specialist | Test file edited, "test" or "bug" in request |',
    '| security-officer | Auth file edited, pre-commit, API route changed |',
    '| devops-engineer | CI/CD, Dockerfile, deployment topic |',
    '| infra-specialist | Schema, DB query, caching topic |',
    '',
    '## Auto-Invoke Rules',
    'Agents MUST automatically use these tools without waiting for slash commands:',
    '',
    '| Condition | Auto Action |',
    '|---|---|',
    '| User provides a URL | Run: `npm run tool:extract -- <URL>` |',
    '| Session starts | Run: `npm run tool:skills` |',
    '| .tsx/.ts file edited | Load react-expert or typescript-expert skill |',
    '| .prisma file edited | Load prisma-expert + postgres-patterns skills |',
    '| Tailwind config edited | Load tailwind-expert skill |',
    '| Before any commit | Run: `npm run tool:security` |',
    '| Build fails | Activate devops-engineer, run: `npm run omnirule:verify` |',
    '| Context window filling | Run: `npm run tool:compact` |',
    '',
  ];

  // Load top skill contents
  for (const skill of skills.slice(0, 2)) {
    const skillPath = path.join(root, 'skills', skill, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      sections.push(`---\n## Active Skill: ${skill}\n`);
      sections.push(fs.readFileSync(skillPath, 'utf-8').substring(0, 1500));
      sections.push('');
    }
  }

  return sections.join('\n');
}

function collectDesignSystems() {
  const designDir = path.join(root, '.design');
  if (!fs.existsSync(designDir)) return [];
  return fs.readdirSync(designDir).filter(d =>
    fs.statSync(path.join(designDir, d)).isDirectory()
  );
}

function main() {
  ensureDir(path.join(root, '.designrules'));
  ensureDir(path.join(root, '.omnirule', 'missions'));
  ensureDir(path.join(root, '.omnirule', 'artifacts'));
  ensureDir(path.join(root, '.omnirule', 'reports'));

  const skills = detectStack();
  const instructions = buildAgentInstructions(skills);
  fs.writeFileSync(path.join(root, '.designrules', 'AGENT_INSTRUCTIONS.md'), instructions);

  const designSystems = collectDesignSystems();

  // Output JSON for OpenCode/Claude to parse as hook result
  const result = {
    status: 'ready',
    skills,
    designSystems,
    message: `OmniRule initialized. Skills: [${skills.join(', ')}]. Design systems: [${designSystems.join(', ') || 'none'}]. Agent fleet on standby.`,
  };

  process.stdout.write(JSON.stringify(result));
}

main();
