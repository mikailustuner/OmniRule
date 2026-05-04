#!/usr/bin/env tsx
/**
 * OmniRule Git Sentinel
 *
 * Pre-commit and branch intelligence gate. Catches:
 * - Hardcoded secrets / credentials
 * - Focused tests (.only) / skipped tests
 * - console.log leaks with sensitive data
 * - debugger statements
 * - @ts-nocheck / @ts-ignore overuse
 * - Large files accidentally staged
 * - Commit message quality (Conventional Commits)
 * - Branch naming conventions
 *
 * Usage:
 *   npm run tool:git              — full pre-commit check on staged files
 *   npm run tool:git -- summary   — git state summary
 *   npm run tool:git -- branch    — validate branch name
 *   npm run tool:git -- msg "feat: add login"  — validate commit message
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export type SentinelResult = {
  passed: boolean;
  violations: Violation[];
  warnings: Warning[];
  summary: string;
};

interface Violation { file: string; line: number; rule: string; match: string; severity: 'block' | 'warn' }
interface Warning   { message: string }

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'AWS Access Key',      pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Key',      pattern: /aws_secret_access_key\s*=\s*["']?[A-Za-z0-9/+=]{40}/ },
  { name: 'Generic API Key',     pattern: /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i },
  { name: 'Generic Secret',      pattern: /(?:secret|password|passwd|token)\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: 'Private Key Header',  pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'JWT Token',           pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'GitHub Token',        pattern: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  { name: 'Stripe Key',          pattern: /sk_(?:live|test)_[A-Za-z0-9]{24,}/ },
  { name: 'Slack Token',         pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Google API Key',      pattern: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Connection String',   pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@/ },
  { name: 'Basic Auth URL',      pattern: /https?:\/\/[^:]+:[^@]+@/ },
];

const CODE_RULES: Array<{ name: string; pattern: RegExp; severity: 'block' | 'warn'; message: string }> = [
  { name: 'focused-test',       pattern: /\.(only|skip)\s*\(/,          severity: 'block', message: 'Focused/skipped test left in — will break CI' },
  { name: 'console-log',        pattern: /console\.(log|debug)\s*\(/,   severity: 'warn',  message: 'console.log in production code' },
  { name: 'console-sensitive',  pattern: /console\.\w+\s*\([^)]*(?:password|token|secret|key)/i, severity: 'block', message: 'Logging sensitive data' },
  { name: 'debugger',           pattern: /\bdebugger\b/,                 severity: 'block', message: 'debugger statement left in code' },
  { name: 'ts-nocheck',         pattern: /\/\/\s*@ts-nocheck/,           severity: 'block', message: '@ts-nocheck disables all type checking' },
  { name: 'ts-ignore',          pattern: /\/\/\s*@ts-ignore/,            severity: 'warn',  message: '@ts-ignore suppresses type safety' },
  { name: 'any-cast',           pattern: /as\s+any\b/,                   severity: 'warn',  message: 'Unsafe "as any" cast' },
  { name: 'todo-fixme',         pattern: /(?:TODO|FIXME|HACK|XXX)\s*:/,  severity: 'warn',  message: 'TODO/FIXME not resolved' },
];

const MAX_FILE_SIZE_KB = 500;
const COMMIT_TYPES = ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf', 'ci', 'build', 'revert'];
const CONVENTIONAL_COMMIT = /^(feat|fix|chore|docs|style|refactor|test|perf|ci|build|revert)(\(.+\))?(!)?:\s.{1,72}$/;
const VALID_BRANCH = /^(?:feat|fix|chore|docs|refactor|test|hotfix|release|perf)\/[a-z0-9][a-z0-9-]{1,50}$/;

function lintCommitMessage(msg: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const trimmed = msg.trim();
  if (!CONVENTIONAL_COMMIT.test(trimmed)) {
    issues.push(`Must follow Conventional Commits: <type>(<scope>): <description>`);
    issues.push(`Valid types: ${COMMIT_TYPES.join(', ')}`);
    issues.push(`Example: "feat(auth): add OAuth2 login"`);
  }
  if (trimmed.length > 72) issues.push(`Subject line too long (${trimmed.length} chars, max 72)`);
  if (trimmed.endsWith('.')) issues.push('Subject line should not end with a period');
  return { valid: issues.length === 0, issues };
}

function lintBranchName(branch: string): { valid: boolean; issue?: string } {
  if (['main', 'master', 'develop', 'staging', 'production'].includes(branch)) return { valid: true };
  if (!VALID_BRANCH.test(branch)) {
    return { valid: false, issue: `Branch "${branch}" should follow: <type>/<description> (e.g., feat/user-auth)` };
  }
  return { valid: true };
}

function scanFile(filePath: string): Violation[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  const sizeKB = fs.statSync(filePath).size / 1024;
  if (sizeKB > MAX_FILE_SIZE_KB) {
    violations.push({ file: filePath, line: 0, rule: 'large-file', match: `${Math.round(sizeKB)}KB`, severity: 'warn' });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isComment = line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#');

    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({ file: filePath, line: i + 1, rule: `secret:${name}`, match: line.trim().substring(0, 60), severity: 'block' });
      }
    }

    if (!isComment) {
      for (const { name, pattern, severity } of CODE_RULES) {
        if (pattern.test(line)) {
          violations.push({ file: filePath, line: i + 1, rule: name, match: line.trim().substring(0, 60), severity });
        }
      }
    }
  }
  return violations;
}

function getStagedFiles(): string[] {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n').filter(f => f.trim() && /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs)$/.test(f) && fs.existsSync(f));
  } catch { return []; }
}

function getCurrentBranch(): string {
  try { return execSync('git branch --show-current', { encoding: 'utf-8' }).trim(); } catch { return ''; }
}

function generateSummary(): void {
  try {
    const branch = getCurrentBranch();
    const staged = execSync('git diff --cached --stat', { encoding: 'utf-8' }).trim();
    const recent = execSync('git log -5 --oneline', { encoding: 'utf-8' }).trim();
    const status = execSync('git status --short', { encoding: 'utf-8' }).trim();
    console.log(`\n[Git Sentinel] Branch: ${branch}`);
    const check = lintBranchName(branch);
    if (!check.valid) console.log(`  ⚠ ${check.issue}`);
    console.log(`\n=== Staged ===\n${staged || '(none)'}`);
    console.log(`\n=== Status ===\n${status || '(clean)'}`);
    console.log(`\n=== Recent Commits ===\n${recent}`);
  } catch (e) { console.error('Git not available:', (e as Error).message); }
}

function writeReport(result: SentinelResult): void {
  const dir = path.join(process.cwd(), '.omnirule', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const blocks = result.violations.filter(v => v.severity === 'block');
  const warns  = result.violations.filter(v => v.severity === 'warn');
  const md = `# Git Sentinel Report\n> ${new Date().toISOString()} | ${result.passed ? '✅ PASSED' : '❌ BLOCKED'}\n\n## Blockers\n${blocks.length === 0 ? '✅ None' : blocks.map(v => `- **${v.rule}** \`${v.file}:${v.line}\`\n  \`${v.match}\``).join('\n')}\n\n## Warnings\n${warns.length === 0 ? '✅ None' : warns.map(v => `- **${v.rule}** \`${v.file}:${v.line}\`\n  \`${v.match}\``).join('\n')}\n`;
  fs.writeFileSync(path.join(dir, 'git-sentinel.md'), md);
}

export async function runSentinel(mode = 'check'): Promise<SentinelResult> {
  if (mode === 'summary') { generateSummary(); return { passed: true, violations: [], warnings: [], summary: '' }; }
  if (mode === 'branch') {
    const branch = getCurrentBranch();
    const result = lintBranchName(branch);
    console.log(result.valid ? `✅ Branch "${branch}" is valid` : `❌ ${result.issue}`);
    return { passed: result.valid, violations: [], warnings: [], summary: result.issue ?? '' };
  }
  if (mode.startsWith('msg ')) {
    const msg = mode.slice(4);
    const result = lintCommitMessage(msg);
    if (result.valid) console.log('✅ Commit message is valid');
    else result.issues.forEach(i => console.log(`❌ ${i}`));
    return { passed: result.valid, violations: [], warnings: result.issues.map(m => ({ message: m })), summary: '' };
  }

  const files = getStagedFiles();
  if (files.length === 0) {
    console.log('[Git Sentinel] No staged source files to check');
    return { passed: true, violations: [], warnings: [], summary: 'No staged files' };
  }

  console.log(`\n[Git Sentinel] Scanning ${files.length} staged file(s)...`);
  const allViolations: Violation[] = [];
  for (const file of files) {
    const v = scanFile(file);
    allViolations.push(...v);
    if (v.length) console.log(`  ⚠ ${file}: ${v.length} issue(s)`);
  }

  const blockers = allViolations.filter(v => v.severity === 'block');
  const passed = blockers.length === 0;
  const result: SentinelResult = {
    passed,
    violations: allViolations,
    warnings: [],
    summary: passed ? `✅ All ${files.length} files clean` : `❌ ${blockers.length} blocker(s) — commit blocked`,
  };

  writeReport(result);
  console.log(`\n[Git Sentinel] ${result.summary}`);
  if (!passed) { blockers.forEach(v => console.log(`  BLOCK ${v.rule} @ ${v.file}:${v.line}`)); process.exit(1); }
  return result;
}

if (process.argv[1]?.endsWith('git-sentinel.ts')) {
  const mode = process.argv.slice(2).join(' ') || 'check';
  runSentinel(mode).catch(console.error);
}
