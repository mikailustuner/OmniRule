#!/usr/bin/env node
/**
 * OmniRule Skill Injector — PostToolUse Hook (Write/Edit/Read)
 *
 * Detects file type → selects relevant skills → extracts the densest
 * sections (Quick Reference + Anti-Patterns) and writes them to
 * .designrules/AGENT_INSTRUCTIONS.md which OpenCode reads every turn.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const root = process.cwd();
const OUTPUT = path.join(root, '.designrules', 'AGENT_INSTRUCTIONS.md');
const SKILLS_DIR = path.join(root, 'skills');

// ─── Extension → skills + agent ──────────────────────────────────────────────

const SKILL_MAP = {
  '.tsx':    { skills: ['react-expert', 'typescript-expert', 'component-design-patterns'], agent: 'frontend-ops' },
  '.jsx':    { skills: ['react-expert', 'component-design-patterns'],                      agent: 'frontend-ops' },
  '.ts':     { skills: ['typescript-expert'],                                               agent: 'architect' },
  '.js':     { skills: ['nodejs-expert'],                                                   agent: 'architect' },
  '.css':    { skills: ['css-architecture', 'css-variables'],                               agent: 'style-architect' },
  '.scss':   { skills: ['css-architecture', 'tailwind-expert'],                             agent: 'style-architect' },
  '.sass':   { skills: ['css-architecture'],                                                agent: 'style-architect' },
  '.prisma': { skills: ['prisma-expert', 'postgres-patterns'],                              agent: 'context-agent' },
  '.sql':    { skills: ['postgres-patterns'],                                               agent: 'context-agent' },
  '.graphql':{ skills: ['graphql-patterns', 'api-design'],                                 agent: 'architect' },
  '.gql':    { skills: ['graphql-patterns', 'api-design'],                                 agent: 'architect' },
  '.yml':    { skills: ['ci-cd-patterns', 'docker-patterns'],                              agent: 'devops-engineer' },
  '.yaml':   { skills: ['ci-cd-patterns'],                                                 agent: 'devops-engineer' },
  '.tf':     { skills: ['terraform-basics', 'kubernetes-basics'],                          agent: 'devops-engineer' },
  '.html':   { skills: ['html-semantic', 'accessibility-basics'],                          agent: 'seo-agent' },
  '.md':     { skills: ['documentation-patterns'],                                         agent: 'docs-agent' },
  '.json':   { skills: ['api-design'],                                                     agent: 'architect' },
  '.pptx':   { skills: ['professional-pptx-design'],                                        agent: 'document-creator' },
  '.pdf':    { skills: ['professional-report-design'],                                      agent: 'document-creator' },
  // New skills
  '.sol':    { skills: ['solidity-patterns', 'smart-contract-testing', 'defi-patterns'],   agent: 'blockchain-developer' },
  '.py':     { skills: ['llm-integration', 'etl-patterns', 'mlops-patterns'],              agent: 'ai-engineer' },
  '.swift':  { skills: ['swiftui-patterns', 'watchos-patterns', 'apple-design-guidelines'], agent: 'swift-developer' },
};

// ─── Directory → additional skills (merged on top of ext skills) ─────────────

const DIR_MAP = {
  'components/':   { skills: ['react-expert', 'component-design-patterns'],        agent: 'frontend-ops' },
  'app/':          { skills: ['nextjs-expert', 'nextjs-routing'],                  agent: 'frontend-ops' },
  'pages/':        { skills: ['nextjs-expert', 'nextjs-routing'],                  agent: 'frontend-ops' },
  'hooks/':        { skills: ['react-expert', 'state-management'],                 agent: 'frontend-ops' },
  'stores/':       { skills: ['state-management'],                                 agent: 'frontend-ops' },
  'api/':          { skills: ['api-backend', 'security-review'],                   agent: 'architect' },
  'server/':       { skills: ['api-backend', 'nodejs-expert'],                     agent: 'architect' },
  'routes/':       { skills: ['api-backend', 'api-design'],                        agent: 'architect' },
  'auth/':         { skills: ['authentication-patterns', 'security-review'],       agent: 'security-officer' },
  'middleware/':   { skills: ['security-review', 'edge-computing'],                agent: 'security-officer' },
  'styles/':       { skills: ['css-architecture', 'tailwind-expert'],              agent: 'style-architect' },
  'prisma/':       { skills: ['prisma-expert', 'postgres-patterns'],               agent: 'context-agent' },
  'migrations/':   { skills: ['postgres-patterns', 'prisma-expert'],               agent: 'migrator' },
  '__tests__/':    { skills: ['testing-patterns', 'debugging-strategies'],         agent: 'qa-specialist' },
  'e2e/':          { skills: ['testing-patterns'],                                 agent: 'qa-specialist' },
  'emails/':       { skills: ['email-patterns'],                                   agent: 'frontend-ops' },
  'workers/':      { skills: ['message-queues', 'event-driven-patterns'],          agent: 'infra-specialist' },
  'queues/':       { skills: ['message-queues'],                                   agent: 'infra-specialist' },
  'k8s/':          { skills: ['kubernetes-basics', 'docker-patterns'],             agent: 'devops-engineer' },
  'docker/':       { skills: ['docker-patterns', 'ci-cd-patterns'],               agent: 'devops-engineer' },
  'android/':      { skills: ['mobile-patterns'],                                  agent: 'mobile-ops' },
  'ios/':          { skills: ['mobile-patterns'],                                  agent: 'mobile-ops' },
  'contracts/':    { skills: ['web3-patterns'],                                    agent: 'architect' },
  'lib/':          { skills: ['typescript-expert'],                                agent: 'architect' },
  'utils/':        { skills: ['typescript-expert'],                                agent: 'architect' },
  'domain/':       { skills: ['ddd-patterns', 'clean-architecture'],               agent: 'architect' },
  'search/':       { skills: ['search-patterns'],                                  agent: 'infra-specialist' },
  // New directories
  'ai/':           { skills: ['llm-integration', 'mlops-patterns'],                 agent: 'ai-engineer' },
  'llm/':          { skills: ['llm-integration', 'prompt-engineering'],             agent: 'ai-engineer' },
  'models/':       { skills: ['mlops-patterns', 'llm-integration'],                 agent: 'ai-engineer' },
  'embeddings/':   { skills: ['vector-db-patterns'],                                agent: 'ai-engineer' },
  'rag/':          { skills: ['vector-db-patterns', 'llm-integration'],             agent: 'ai-engineer' },
  'prompts/':      { skills: ['prompt-engineering'],                                agent: 'ai-engineer' },
  'aws/':          { skills: ['aws-patterns'],                                       agent: 'cloud-architect' },
  'gcp/':          { skills: ['gcp-patterns'],                                       agent: 'cloud-architect' },
  'azure/':        { skills: ['azure-patterns'],                                     agent: 'cloud-architect' },
  'cloud/':        { skills: ['aws-patterns', 'gcp-patterns', 'azure-patterns'],     agent: 'cloud-architect' },
  'smart-contracts/': { skills: ['solidity-patterns', 'defi-patterns'],             agent: 'blockchain-developer' },
  'blockchain/':   { skills: ['solidity-patterns', 'smart-contract-testing'],        agent: 'blockchain-developer' },
  'defi/':         { skills: ['defi-patterns'],                                      agent: 'blockchain-developer' },
  'etl/':          { skills: ['etl-patterns', 'data-pipeline-patterns'],            agent: 'data-engineer' },
  'pipeline/':     { skills: ['etl-patterns', 'data-pipeline-patterns'],            agent: 'data-engineer' },
  'streaming/':    { skills: ['streaming-patterns'],                                agent: 'data-engineer' },
  'kafka/':        { skills: ['streaming-patterns'],                                agent: 'data-engineer' },
  'data/':         { skills: ['etl-patterns', 'streaming-patterns'],                 agent: 'data-engineer' },
  'bonds/':        { skills: ['bond-analyzer'],                                      agent: 'researcher' },
  'finance/':      { skills: ['bond-analyzer'],                                      agent: 'researcher' },
  'analysis/':     { skills: ['bond-analyzer'],                                      agent: 'researcher' },
  'network/':      { skills: ['network-security', 'cryptography-patterns'],        agent: 'security-expert' },
  'security/':     { skills: ['network-security', 'compliance-gdpr', 'cryptography-patterns'], agent: 'security-expert' },
  'crypto/':       { skills: ['cryptography-patterns'],                            agent: 'security-expert' },
  'encryption/':   { skills: ['cryptography-patterns'],                            agent: 'security-expert' },
  'compliance/':   { skills: ['compliance-gdpr'],                                   agent: 'security-expert' },
  'platform/':     { skills: ['internal-platforms', 'developer-experience'],       agent: 'platform-engineer' },
  'internal/':     { skills: ['internal-platforms', 'developer-experience'],       agent: 'platform-engineer' },
  'dx/':           { skills: ['developer-experience'],                            agent: 'platform-engineer' },
  'chaos/':        { skills: ['chaos-engineering'],                                agent: 'platform-engineer' },
  'resilience/':   { skills: ['chaos-engineering'],                                agent: 'platform-engineer' },
  // Swift/Apple platforms
  'ios/':          { skills: ['swiftui-patterns', 'apple-design-guidelines'],          agent: 'swift-developer' },
  'macos/':        { skills: ['swiftui-patterns', 'apple-design-guidelines'],          agent: 'swift-developer' },
  'swift/':        { skills: ['swiftui-patterns', 'watchos-patterns'],                agent: 'swift-developer' },
  'apple/':        { skills: ['swiftui-patterns', 'apple-design-guidelines'],          agent: 'swift-developer' },
  'watchos/':      { skills: ['watchos-patterns', 'apple-design-guidelines'],         agent: 'swift-developer' },
  'watch/':        { skills: ['watchos-patterns'],                                      agent: 'swift-developer' },
  'applewatch/':   { skills: ['watchos-patterns'],                                      agent: 'swift-developer' },
  // Web (MUST use Next.js 16)
  'web/':          { skills: ['nextjs-expert', 'typescript-expert', 'react-expert'],  agent: 'frontend-ops' },
  'frontend/':     { skills: ['nextjs-expert', 'react-expert', 'typescript-expert'],   agent: 'frontend-ops' },
  'client/':       { skills: ['nextjs-expert', 'react-expert'],                        agent: 'frontend-ops' },
  // Documents & Reports
  'reports/':       { skills: ['professional-report-design', 'documentation-patterns'], agent: 'document-creator' },
  'documents/':     { skills: ['professional-report-design', 'documentation-patterns'], agent: 'document-creator' },
  'presentation/': { skills: ['professional-pptx-design', 'professional-report-design'], agent: 'document-creator' },
  'pdf/':           { skills: ['professional-report-design'],                          agent: 'document-creator' },
};

// ─── Smart content extractor ──────────────────────────────────────────────────
// Prefers dense sections: Quick Reference → Anti-Patterns → beginning of file.
// Always truncates at a clean newline, never mid-sentence.

const MAX_CHARS_PER_SKILL = 2500;
const TARGET_SECTIONS = ['## Quick Reference', '## Anti-Patterns', '## ❌'];

function extractSkillContent(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;

  const raw = fs.readFileSync(skillPath, 'utf-8');

  // Try to extract specific sections first
  const extracted = [];
  for (const heading of TARGET_SECTIONS) {
    const idx = raw.indexOf(heading);
    if (idx === -1) continue;
    // Find next ## heading or end of file
    const nextSection = raw.indexOf('\n## ', idx + heading.length);
    const section = nextSection === -1
      ? raw.slice(idx)
      : raw.slice(idx, nextSection);
    extracted.push(section.trim());
  }

  if (extracted.length > 0) {
    const combined = extracted.join('\n\n');
    return combined.length <= MAX_CHARS_PER_SKILL
      ? combined
      : truncateAtNewline(combined, MAX_CHARS_PER_SKILL);
  }

  // Fallback: first N chars, truncated at clean newline
  return truncateAtNewline(raw, MAX_CHARS_PER_SKILL);
}

function truncateAtNewline(text, maxChars) {
  if (text.length <= maxChars) return text;
  const cut = text.lastIndexOf('\n', maxChars);
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, maxChars)) + '\n\n…';
}

// ─── Skill detection ──────────────────────────────────────────────────────────

function detectSkills(filePath) {
  const ext        = path.extname(filePath).toLowerCase();
  const normalized = filePath.replace(/\\/g, '/');

  let skills = [];
  let agent  = 'orchestrator';

  if (SKILL_MAP[ext]) {
    skills = [...SKILL_MAP[ext].skills];
    agent  = SKILL_MAP[ext].agent;
  }

  for (const [dir, rule] of Object.entries(DIR_MAP)) {
    if (normalized.includes(dir)) {
      skills = [...new Set([...skills, ...rule.skills])];
      agent  = rule.agent; // more specific dir overrides ext agent
    }
  }

  return { skills, agent };
}

// ─── Inject ───────────────────────────────────────────────────────────────────
// Loads up to 4 skills. Skips skills with no SKILL.md silently.

const MAX_SKILLS = 4;

function injectContext(filePath, skills, agent) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const header = [
    `# OmniRule Active Skill Context`,
    ``,
    `> **File:** \`${path.basename(filePath)}\`  **Agent:** ${agent}  **Updated:** ${new Date().toISOString()}`,
    `> **Skills loaded:** ${skills.slice(0, MAX_SKILLS).join(', ')}`,
    ``,
  ].join('\n');

  const sections = [header];
  let loaded = 0;

  for (const skill of skills) {
    if (loaded >= MAX_SKILLS) break;
    const content = extractSkillContent(skill);
    if (!content) continue;
    sections.push(`---\n\n## ${skill}\n\n${content}\n`);
    loaded++;
  }

  if (loaded === 0) return; // nothing to write

  fs.writeFileSync(OUTPUT, sections.join('\n'));
}

// ─── Dedup: skip if same file as last run ─────────────────────────────────────

const STATE_FILE = path.join(root, '.designrules', '.last-injected');

function alreadyInjected(filePath) {
  try {
    const last = fs.readFileSync(STATE_FILE, 'utf-8').trim();
    return last === filePath;
  } catch { return false; }
}

function markInjected(filePath) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, filePath);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  let input = '';
  try { input = fs.readFileSync('/dev/stdin', 'utf-8'); } catch {}

  let toolInput = {};
  try { toolInput = JSON.parse(input); } catch {}

  const filePath = toolInput?.path || toolInput?.file_path || '';

  if (!filePath || alreadyInjected(filePath)) {
    process.stdout.write(JSON.stringify({ action: 'allow' }));
    return;
  }

  const { skills, agent } = detectSkills(filePath);

  if (skills.length > 0) {
    injectContext(filePath, skills, agent);
    markInjected(filePath);
    process.stdout.write(JSON.stringify({
      action: 'allow',
      message: `[SkillInjector] ${agent} ← ${skills.slice(0, MAX_SKILLS).join(', ')}`,
    }));
  } else {
    process.stdout.write(JSON.stringify({ action: 'allow' }));
  }
}

main();
