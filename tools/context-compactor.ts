#!/usr/bin/env tsx
/**
 * OmniRule Context Compactor
 *
 * When the AI context window fills up, critical state must survive compaction.
 * This tool builds a dense "critical context block" that gets re-injected.
 *
 * What it preserves:
 * - Active design tokens (.design/)
 * - Active mission memos (.omnirule/missions/)
 * - Current skill context (.designrules/)
 * - Recent audit reports (.omnirule/reports/)
 * - Agent fleet status
 *
 * Usage:
 *   npm run tool:compact
 *   Automatically invoked by the session.compacting hook
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CompactedContext {
  timestamp: string;
  designSystems: string[];
  activeMissions: Array<{ id: string; target: string; task: string; status: string }>;
  activeSkills: string[];
  lastAuditScore?: number;
  agentFleet: string[];
  criticalNotes: string[];
}

function readJsonSafe<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function collectDesignSystems(root: string): string[] {
  const designDir = path.join(root, '.design');
  if (!fs.existsSync(designDir)) return [];
  return fs.readdirSync(designDir)
    .filter(d => fs.statSync(path.join(designDir, d)).isDirectory())
    .map(d => {
      const tokenPath = path.join(designDir, d, 'tokens', 'colors.json');
      const tokens = readJsonSafe<{ palette?: Record<string, string> }>(tokenPath);
      const colorCount = tokens?.palette ? Object.keys(tokens.palette).length : 0;
      return `${d} (${colorCount} colors, tailwind.config.js available)`;
    });
}

function collectMissions(root: string): CompactedContext['activeMissions'] {
  const dir = path.join(root, '.omnirule', 'missions');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJsonSafe<{ id: string; target: string; task: string; status: string }>(path.join(dir, f)))
    .filter(Boolean)
    .filter(m => m!.status !== 'completed')
    .slice(0, 10) as CompactedContext['activeMissions'];
}

function collectActiveSkills(root: string): string[] {
  const instructionsPath = path.join(root, '.designrules', 'AGENT_INSTRUCTIONS.md');
  if (!fs.existsSync(instructionsPath)) return [];
  const content = fs.readFileSync(instructionsPath, 'utf-8');
  const match = content.match(/Skills:\s*([^\n]+)/);
  if (!match) return [];
  return match[1].split(',').map(s => s.trim()).filter(Boolean);
}

function getLastAuditScore(root: string): number | undefined {
  const reportPath = path.join(root, '.omnirule', 'reports', 'dependency-report.json');
  const report = readJsonSafe<{ score: number }>(reportPath);
  return report?.score;
}

export function buildCompactedContext(root: string = process.cwd()): CompactedContext {
  return {
    timestamp: new Date().toISOString(),
    designSystems: collectDesignSystems(root),
    activeMissions: collectMissions(root),
    activeSkills: collectActiveSkills(root),
    lastAuditScore: getLastAuditScore(root),
    agentFleet: [
      'orchestrator (primary)',
      'architect', 'style-architect', 'frontend-ops',
      'qa-specialist', 'security-officer', 'devops-engineer',
      'infra-specialist', 'seo-agent', 'researcher',
      'docs-agent', 'context-agent',
    ],
    criticalNotes: [
      'All commands are in commands/ — use /orchestrate, /extract, /design, /agent, /plan, /tdd, /security, /refactor',
      'Tools: npm run tool:extract -- <URL> | tool:skills | tool:security | tool:deps | tool:compact',
      'Design output: .design/{domain}/ — tokens/, screenshots/, DESIGN_RULES.md, tailwind.config.js',
      'Mission memos: .omnirule/missions/ | Artifacts: .omnirule/artifacts/',
    ],
  };
}

function renderMarkdown(ctx: CompactedContext): string {
  return `# OmniRule Critical Context — ${ctx.timestamp}

## Design Systems Available
${ctx.designSystems.length > 0 ? ctx.designSystems.map(d => `- ${d}`).join('\n') : '- None extracted yet. Use: npm run tool:extract -- <URL>'}

## Active Missions (${ctx.activeMissions.length})
${ctx.activeMissions.length > 0
  ? ctx.activeMissions.map(m => `- [${m.status.toUpperCase()}] **${m.target}**: ${m.task}`).join('\n')
  : '- No active missions'}

## Active Skills
${ctx.activeSkills.length > 0 ? ctx.activeSkills.map(s => `- ${s}`).join('\n') : '- None loaded (run npm run tool:skills)'}

## Agent Fleet
${ctx.agentFleet.map(a => `- ${a}`).join('\n')}

## Quality Score
${ctx.lastAuditScore !== undefined ? `Dependency score: ${ctx.lastAuditScore}/100` : 'Not yet run (use npm run tool:deps)'}

## Critical Notes
${ctx.criticalNotes.map(n => `> ${n}`).join('\n')}

---
*Restore this context to any agent session to continue seamlessly.*
`;
}

export function runCompactor(root: string = process.cwd()): string {
  const ctx = buildCompactedContext(root);
  const md = renderMarkdown(ctx);

  const outputDir = path.join(root, '.omnirule');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'context-snapshot.md'), md);
  fs.writeFileSync(path.join(outputDir, 'context-snapshot.json'), JSON.stringify(ctx, null, 2));

  console.log('\n[Compactor] Context snapshot saved to .omnirule/context-snapshot.md');
  console.log(`[Compactor] Design systems: ${ctx.designSystems.length}`);
  console.log(`[Compactor] Active missions: ${ctx.activeMissions.length}`);
  console.log(`[Compactor] Active skills: ${ctx.activeSkills.length}\n`);

  return md;
}

if (process.argv[1]?.endsWith('context-compactor.ts')) {
  runCompactor();
}
