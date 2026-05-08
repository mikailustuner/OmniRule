/**
 * OmniRule Plugin — Core Hooks & DesignVault
 *
 * Implements the event-driven automation layer:
 * - DesignVault: maps file types → skills → injects context
 * - Hooks: file.edited, session.created, compacting, permission.ask
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OmniRuleEvent =
  | 'file.edited'
  | 'file.created'
  | 'session.created'
  | 'session.compacting'
  | 'permission.ask'
  | 'tool.before'
  | 'tool.after'
  | 'stop';

export interface FileEditedPayload {
  path: string;
  type: 'edit' | 'create' | 'delete';
}

export interface PermissionPayload {
  tool: string;
  path?: string;
}

export interface HookResult {
  action: 'allow' | 'block' | 'warn';
  message?: string;
  injectedContext?: string;
}

// ─── Skill Mapping ────────────────────────────────────────────────────────────

interface SkillRule {
  skills: string[];
  agent?: string;
  confidence: number;
}

const SKILL_MAP: Record<string, SkillRule> = {
  // Extension-based
  '.tsx': { skills: ['react-expert', 'typescript-expert', 'component-design-patterns'], agent: 'frontend-ops', confidence: 1.0 },
  '.ts': { skills: ['typescript-expert', 'nodejs-expert'], agent: 'architect', confidence: 0.9 },
  '.css': { skills: ['css-architecture', 'css-variables', 'responsive-design'], agent: 'style-architect', confidence: 1.0 },
  '.scss': { skills: ['css-architecture', 'css-variables'], agent: 'style-architect', confidence: 1.0 },
  '.prisma': { skills: ['prisma-expert', 'postgres-patterns', 'ddd-patterns'], agent: 'context-agent', confidence: 1.0 },
  '.graphql': { skills: ['graphql-patterns', 'api-design'], agent: 'architect', confidence: 1.0 },
  '.yml': { skills: ['ci-cd-patterns', 'docker-patterns'], agent: 'devops-engineer', confidence: 0.8 },
  '.yaml': { skills: ['ci-cd-patterns', 'kubernetes-basics'], agent: 'devops-engineer', confidence: 0.8 },
  '.tf': { skills: ['terraform-basics', 'ci-cd-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  '.dart': { skills: ['flutter-patterns', 'mobile-patterns'], agent: 'mobile-ops', confidence: 1.0 },
  '.proto': { skills: ['grpc-patterns', 'api-design'], agent: 'architect', confidence: 1.0 },
  // Directory-based
  'app/': { skills: ['nextjs-expert', 'nextjs-routing', 'react-expert'], agent: 'frontend-ops', confidence: 1.0 },
  'api/': { skills: ['api-backend', 'api-design', 'security-review', 'rest-api-patterns'], agent: 'architect', confidence: 1.0 },
  'components/': { skills: ['react-expert', 'component-design-patterns', 'css-architecture'], agent: 'frontend-ops', confidence: 1.0 },
  'styles/': { skills: ['css-architecture', 'css-variables', 'tailwind-expert'], agent: 'style-architect', confidence: 1.0 },
  '__tests__/': { skills: ['testing-patterns', 'debugging-strategies'], agent: 'qa-specialist', confidence: 1.0 },
  'e2e/': { skills: ['testing-patterns'], agent: 'qa-specialist', confidence: 1.0 },
  'infra/': { skills: ['terraform-basics', 'docker-patterns', 'kubernetes-basics'], agent: 'devops-engineer', confidence: 1.0 },
  // NEW: REST & API
  'rest/': { skills: ['rest-api-patterns', 'api-backend'], agent: 'architect', confidence: 1.0 },
  'endpoints/': { skills: ['rest-api-patterns', 'api-backend'], agent: 'architect', confidence: 1.0 },
  'webhooks/': { skills: ['webhook-handling', 'api-backend'], agent: 'architect', confidence: 1.0 },
  // NEW: Serverless
  'functions/': { skills: ['serverless-patterns', 'nodejs-expert'], agent: 'devops-engineer', confidence: 1.0 },
  'lambda/': { skills: ['serverless-patterns', 'aws-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  // NEW: Observability
  'monitoring/': { skills: ['observability-patterns', 'monitoring-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  'telemetry/': { skills: ['observability-patterns', 'monitoring-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  // NEW: Incident Response
  'runbooks/': { skills: ['incident-response', 'debugging-strategies'], agent: 'devops-engineer', confidence: 1.0 },
  // Filename-based
  'tailwind.config': { skills: ['tailwind-expert', 'css-variables'], agent: 'style-architect', confidence: 1.0 },
  'next.config': { skills: ['nextjs-expert', 'bundle-optimization'], agent: 'frontend-ops', confidence: 1.0 },
  'docker-compose': { skills: ['docker-patterns', 'ci-cd-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  'Dockerfile': { skills: ['docker-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  'package.json': { skills: ['nodejs-expert', 'bundle-optimization'], agent: 'architect', confidence: 0.7 },
  'serverless.yml': { skills: ['serverless-patterns', 'aws-patterns'], agent: 'devops-engineer', confidence: 1.0 },
  'astro.config': { skills: ['astro-patterns', 'tailwind-expert'], agent: 'frontend-ops', confidence: 1.0 },
};

// ─── DesignVault ──────────────────────────────────────────────────────────────

export class DesignVault {
  private root: string;
  private skillsDir: string;
  private outputFile: string;

  constructor(root: string = process.cwd()) {
    this.root = root;
    this.skillsDir = path.join(root, 'skills');
    this.outputFile = path.join(root, '.designrules', 'AGENT_INSTRUCTIONS.md');
  }

  detectSkills(filePath: string): SkillRule[] {
    const matches: SkillRule[] = [];
    const normalized = filePath.replace(/\\/g, '/');
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    // Extension match
    if (SKILL_MAP[ext]) matches.push(SKILL_MAP[ext]);

    // Directory match
    for (const [pattern, rule] of Object.entries(SKILL_MAP)) {
      if (pattern.endsWith('/') && normalized.includes(pattern)) {
        matches.push(rule);
      }
    }

    // Filename match
    for (const [pattern, rule] of Object.entries(SKILL_MAP)) {
      if (!pattern.startsWith('.') && !pattern.endsWith('/') && basename.startsWith(pattern)) {
        matches.push(rule);
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  loadSkillContent(skillName: string): string | null {
    const skillFile = path.join(this.skillsDir, skillName, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      return fs.readFileSync(skillFile, 'utf-8');
    }
    return null;
  }

  injectContext(filePath: string): { skills: string[]; agent: string; injected: boolean } {
    const rules = this.detectSkills(filePath);
    if (rules.length === 0) return { skills: [], agent: 'orchestrator', injected: false };

    // Hot focus: highest confidence rule
    const hotRule = rules[0];
    const allSkills = [...new Set(rules.flatMap(r => r.skills))];

    const sections: string[] = [
      `# OmniRule Active Context`,
      `> Auto-injected by DesignVault | File: \`${path.basename(filePath)}\``,
      `> Active Agent: **${hotRule.agent ?? 'orchestrator'}** | Skills: ${allSkills.join(', ')}`,
      '',
    ];

    // Load top 3 skills' SKILL.md
    let loaded = 0;
    for (const skill of allSkills) {
      if (loaded >= 3) break;
      const content = this.loadSkillContent(skill);
      if (content) {
        sections.push(`---\n## Skill: ${skill}\n`);
        sections.push(content);
        sections.push('');
        loaded++;
      }
    }

    const output = sections.join('\n');

    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, output);

    return { skills: allSkills, agent: hotRule.agent ?? 'orchestrator', injected: true };
  }

  buildCriticalSnapshot(): string {
    const sections: string[] = ['# OmniRule Critical Context Snapshot\n'];

    // Design tokens
    const designDir = path.join(this.root, '.design');
    if (fs.existsSync(designDir)) {
      const domains = fs.readdirSync(designDir).filter(d =>
        fs.statSync(path.join(designDir, d)).isDirectory()
      );
      if (domains.length > 0) {
        sections.push('## Active Design Systems');
        domains.forEach(d => sections.push(`- \`.design/${d}/\` — tokens + tailwind.config.js available`));
        sections.push('');
      }
    }

    // Active missions
    const missionsDir = path.join(this.root, '.omnirule', 'missions');
    if (fs.existsSync(missionsDir)) {
      const missions = fs.readdirSync(missionsDir).filter(f => f.endsWith('.json'));
      if (missions.length > 0) {
        sections.push('## Active Missions');
        missions.slice(0, 5).forEach(m => {
          try {
            const memo = JSON.parse(fs.readFileSync(path.join(missionsDir, m), 'utf-8'));
            if (memo.status !== 'completed') {
              sections.push(`- **${memo.target}**: ${memo.task} [${memo.status}]`);
            }
          } catch {}
        });
        sections.push('');
      }
    }

    // Current AGENT_INSTRUCTIONS
    if (fs.existsSync(this.outputFile)) {
      sections.push('## Active Skill Context');
      sections.push('> See `.designrules/AGENT_INSTRUCTIONS.md` for full skill context');
      sections.push('');
    }

    sections.push('## Agent Fleet');
    sections.push('Orchestrator → [architect, style-architect, frontend-ops, qa-specialist, security-officer, devops-engineer, infra-specialist, seo-agent, researcher, docs-agent, context-agent]');

    return sections.join('\n');
  }
}

// ─── Hook Handlers ────────────────────────────────────────────────────────────

const vault = new DesignVault();

export function onFileEdited(payload: FileEditedPayload): HookResult {
  if (payload.type === 'delete') return { action: 'allow' };

  const result = vault.injectContext(payload.path);

  if (result.injected) {
    return {
      action: 'allow',
      message: `[DesignVault] Context updated → ${result.agent} | Skills: ${result.skills.slice(0, 3).join(', ')}`,
      injectedContext: `.designrules/AGENT_INSTRUCTIONS.md updated`,
    };
  }

  return { action: 'allow' };
}

export function onSessionCreated(): HookResult {
  // Initialize .designrules
  const designrulesDir = path.join(process.cwd(), '.designrules');
  fs.mkdirSync(designrulesDir, { recursive: true });

  // Initialize .omnirule/missions
  fs.mkdirSync(path.join(process.cwd(), '.omnirule', 'missions'), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), '.omnirule', 'artifacts'), { recursive: true });

  // Write initial snapshot
  const snapshot = vault.buildCriticalSnapshot();
  fs.writeFileSync(path.join(designrulesDir, 'AGENT_INSTRUCTIONS.md'), snapshot);

  return {
    action: 'allow',
    message: '[OmniRule] Session initialized. DesignVault ready. Agent fleet on standby.',
  };
}

export function onSessionCompacting(): HookResult {
  const snapshot = vault.buildCriticalSnapshot();
  const snapshotPath = path.join(process.cwd(), '.omnirule', 'context-snapshot.md');
  fs.writeFileSync(snapshotPath, snapshot);

  return {
    action: 'allow',
    message: '[OmniRule] Context compacting — critical state preserved to .omnirule/context-snapshot.md',
    injectedContext: snapshot,
  };
}

export function onPermissionAsk(payload: PermissionPayload): HookResult {
  const safeTools = ['Read', 'Bash', 'Grep', 'Glob'];
  const safeWritePaths = ['.designrules/', '.omnirule/'];

  if (safeTools.includes(payload.tool)) {
    return { action: 'allow', message: `[OmniRule] Auto-approved read op: ${payload.tool}` };
  }

  if (payload.path && safeWritePaths.some(p => payload.path!.includes(p))) {
    return { action: 'allow', message: `[OmniRule] Auto-approved safe write: ${payload.path}` };
  }

  return { action: 'allow' };
}

// ─── OmniRule Plugin Export ───────────────────────────────────────────────────

export const OmniRulePlugin = {
  name: 'omnirule-core',
  version: '1.11.0',
  vault,
  hooks: {
    'file.edited': onFileEdited,
    'file.created': (p: FileEditedPayload) => onFileEdited({ ...p, type: 'create' }),
    'session.created': onSessionCreated,
    'session.compacting': onSessionCompacting,
    'permission.ask': onPermissionAsk,
  },
  dispatch(event: OmniRuleEvent, payload?: unknown): HookResult {
    switch (event) {
      case 'file.edited':
      case 'file.created':
        return onFileEdited(payload as FileEditedPayload);
      case 'session.created':
        return onSessionCreated();
      case 'session.compacting':
        return onSessionCompacting();
      case 'permission.ask':
        return onPermissionAsk(payload as PermissionPayload);
      default:
        return { action: 'allow' };
    }
  },
};

export default OmniRulePlugin;
