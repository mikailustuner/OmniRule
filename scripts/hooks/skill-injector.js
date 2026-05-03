#!/usr/bin/env node
/**
 * OmniRule Skill Injector — PostToolUse Hook (Write/Edit/Read)
 *
 * After a file is read or edited, detects the file type and
 * injects the relevant skill context into .designrules/AGENT_INSTRUCTIONS.md
 *
 * This is the DesignVault's runtime component — makes skill loading automatic.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();

const SKILL_MAP = {
  '.tsx': { skills: ['react-expert', 'typescript-expert'], agent: 'frontend-ops' },
  '.ts': { skills: ['typescript-expert'], agent: 'architect' },
  '.css': { skills: ['css-architecture', 'css-variables'], agent: 'style-architect' },
  '.scss': { skills: ['css-architecture'], agent: 'style-architect' },
  '.prisma': { skills: ['prisma-expert', 'postgres-patterns'], agent: 'context-agent' },
  '.graphql': { skills: ['graphql-patterns', 'api-design'], agent: 'architect' },
  '.yml': { skills: ['ci-cd-patterns', 'docker-patterns'], agent: 'devops-engineer' },
  '.yaml': { skills: ['ci-cd-patterns'], agent: 'devops-engineer' },
  '.tf': { skills: ['terraform-basics'], agent: 'devops-engineer' },
};

const DIR_MAP = {
  'components/': { skills: ['react-expert', 'component-design-patterns'], agent: 'frontend-ops' },
  'app/': { skills: ['nextjs-expert', 'react-expert'], agent: 'frontend-ops' },
  'api/': { skills: ['api-backend', 'security-review'], agent: 'architect' },
  'styles/': { skills: ['css-architecture', 'tailwind-expert'], agent: 'style-architect' },
  '__tests__/': { skills: ['testing-patterns'], agent: 'qa-specialist' },
  'e2e/': { skills: ['testing-patterns'], agent: 'qa-specialist' },
};

function detectSkills(filePath) {
  const ext = path.extname(filePath);
  const normalized = filePath.replace(/\\/g, '/');

  let skills = [];
  let agent = 'orchestrator';

  if (SKILL_MAP[ext]) {
    skills = [...SKILL_MAP[ext].skills];
    agent = SKILL_MAP[ext].agent;
  }

  for (const [dir, rule] of Object.entries(DIR_MAP)) {
    if (normalized.includes(dir)) {
      skills = [...new Set([...skills, ...rule.skills])];
      agent = rule.agent;
    }
  }

  return { skills, agent };
}

function loadSkillContent(skillName) {
  const p = path.join(root, 'skills', skillName, 'SKILL.md');
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf-8').substring(0, 2000);
  }
  return null;
}

function injectContext(filePath, skills, agent) {
  const outputPath = path.join(root, '.designrules', 'AGENT_INSTRUCTIONS.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sections = [
    `# OmniRule Active Context`,
    `> File: \`${path.basename(filePath)}\` | Agent: **${agent}** | Skills: ${skills.join(', ')}`,
    `> Updated: ${new Date().toISOString()}`,
    '',
    '## Auto-Invoke Rules Still Active',
    '| Condition | Action |',
    '|---|---|',
    '| URL in message | Run: npm run tool:extract -- <URL> |',
    '| "test" or "bug" | Activate qa-specialist |',
    '| "security" or auth file | Activate security-officer |',
    '| Build failure | Run: npm run omnirule:verify |',
    '',
  ];

  let loaded = 0;
  for (const skill of skills) {
    if (loaded >= 2) break;
    const content = loadSkillContent(skill);
    if (content) {
      sections.push(`---\n## Skill: ${skill}\n\n${content}\n`);
      loaded++;
    }
  }

  fs.writeFileSync(outputPath, sections.join('\n'));
}

function main() {
  let input = '';
  try { input = require('fs').readFileSync('/dev/stdin', 'utf-8'); } catch {}

  let toolInput = {};
  try { toolInput = JSON.parse(input); } catch {}

  const filePath = toolInput?.path || toolInput?.file_path || '';
  if (!filePath) {
    process.stdout.write(JSON.stringify({ action: 'allow' }));
    return;
  }

  const { skills, agent } = detectSkills(filePath);

  if (skills.length > 0) {
    injectContext(filePath, skills, agent);
    process.stdout.write(JSON.stringify({
      action: 'allow',
      message: `[SkillInjector] ${agent} activated → ${skills.join(', ')}`,
    }));
  } else {
    process.stdout.write(JSON.stringify({ action: 'allow' }));
  }
}

main();
