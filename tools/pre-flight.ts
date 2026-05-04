#!/usr/bin/env tsx
/**
 * OmniRule Pre-flight Check
 *
 * Single GO / NO-GO command before pushing. Runs all quality gates
 * on staged/changed files only — fast, targeted, actionable.
 *
 * Usage:
 *   npm run tool:preflight
 *   npm run tool:preflight -- --all     (check entire codebase, not just changed)
 *   npm run tool:preflight -- --fix     (auto-fix what can be fixed)
 */

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

const args = process.argv.slice(2);
const checkAll = args.includes('--all');
const autoFix = args.includes('--fix');

// ─── Colors ───────────────────────────────────────────────────────────────────

const c = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
};

// ─── Git helpers ──────────────────────────────────────────────────────────────

function getChangedFiles(): string[] {
  try {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { cwd: ROOT })
      .toString().trim();
    const unstaged = execSync('git diff --name-only --diff-filter=ACMR', { cwd: ROOT })
      .toString().trim();
    const combined = [...new Set([...staged.split('\n'), ...unstaged.split('\n')])];
    return combined.filter(f => f && fs.existsSync(path.join(ROOT, f)));
  } catch {
    return [];
  }
}

function getCurrentBranch(): string {
  try { return execSync('git branch --show-current', { cwd: ROOT }).toString().trim(); }
  catch { return 'unknown'; }
}

// ─── Check runners ────────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  blocking: boolean;
  issues: string[];
  detail?: string;
  duration: number;
}

function runCheck(name: string, fn: () => { passed: boolean; issues: string[]; detail?: string }, blocking = true): CheckResult {
  const start = Date.now();
  try {
    const { passed, issues, detail } = fn();
    return { name, passed, blocking, issues, detail, duration: Date.now() - start };
  } catch (err: any) {
    return { name, passed: false, blocking, issues: [err.message ?? 'Check threw an error'], duration: Date.now() - start };
  }
}

// 1. TypeScript
function checkTypeScript(files: string[]): CheckResult {
  return runCheck('TypeScript', () => {
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    if (tsFiles.length === 0) return { passed: true, issues: [], detail: 'no TS files changed' };

    const result = spawnSync('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
      cwd: ROOT, encoding: 'utf-8', timeout: 30000,
    });

    if (result.status === 0) return { passed: true, issues: [] };

    const lines = (result.stdout + result.stderr).split('\n').filter(l => l.includes('error TS'));
    return {
      passed: false,
      issues: lines.slice(0, 10),
      detail: lines.length > 10 ? `+${lines.length - 10} more errors` : undefined,
    };
  });
}

// 2. Secrets scan
function checkSecrets(files: string[]): CheckResult {
  return runCheck('Secrets', () => {
    const SECRET_PATTERNS = [
      { re: /(?<![A-Z0-9])[A-Z0-9]{20}(?:[A-Z0-9\/+]{20})[A-Z0-9]{8,}/, name: 'AWS-like key' },
      { re: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI key' },
      { re: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub token' },
      { re: /xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}/, name: 'Slack token' },
      { re: /(?:password|passwd|secret|api_key|apikey)\s*[:=]\s*['"][^'"]{8,}['"]/i, name: 'Hardcoded credential' },
      { re: /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}/, name: 'JWT token' },
    ];

    const issues: string[] = [];
    for (const file of files) {
      if (file.endsWith('.env') || file.includes('.example')) continue;
      try {
        const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
        for (const { re, name } of SECRET_PATTERNS) {
          if (re.test(content)) issues.push(`${file}: possible ${name}`);
        }
      } catch { /* skip */ }
    }
    return { passed: issues.length === 0, issues };
  });
}

// 3. Test coverage gaps
function checkTestCoverage(files: string[]): CheckResult {
  return runCheck('Test Coverage', () => {
    const srcFiles = files.filter(f =>
      (f.endsWith('.ts') || f.endsWith('.tsx')) &&
      !f.includes('.test.') && !f.includes('.spec.') &&
      !f.includes('__tests__') && !f.includes('node_modules')
    );

    const issues: string[] = [];
    for (const file of srcFiles) {
      const base = file.replace(/\.(ts|tsx)$/, '');
      const testVariants = [
        `${base}.test.ts`, `${base}.test.tsx`,
        `${base}.spec.ts`, `${base}.spec.tsx`,
        file.replace('src/', 'src/__tests__/').replace(/\.(ts|tsx)$/, '.test.$1'),
        file.replace(/^(src|app|lib)\//, '__tests__/').replace(/\.(ts|tsx)$/, '.test.$1'),
      ];
      const hasTest = testVariants.some(t => fs.existsSync(path.join(ROOT, t)));
      if (!hasTest) issues.push(`${file}: no test file found`);
    }
    return { passed: issues.length === 0, issues, detail: issues.length > 0 ? 'new files without tests' : undefined };
  }, false); // non-blocking
}

// 4. Code complexity
function checkComplexity(files: string[]): CheckResult {
  return runCheck('Complexity', () => {
    const MAX_COMPLEXITY = 15;
    const MAX_FUNC_LENGTH = 80;
    const issues: string[] = [];

    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    for (const file of tsFiles) {
      let content: string;
      try { content = fs.readFileSync(path.join(ROOT, file), 'utf-8'); }
      catch { continue; }

      // Cyclomatic complexity estimate
      const complexityTokens = (content.match(/\b(if|else if|for|while|case|catch|\?\?|&&|\|\||\?\.)\b/g) ?? []).length;
      if (complexityTokens > MAX_COMPLEXITY) {
        issues.push(`${file}: complexity ~${complexityTokens} (max ${MAX_COMPLEXITY})`);
      }

      // Function length
      const funcMatches = content.matchAll(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|\w+)\s*=>)\s*\{/g);
      for (const match of funcMatches) {
        const start = content.lastIndexOf('\n', match.index) + 1;
        const lineNum = content.slice(0, match.index).split('\n').length;
        // Rough line count estimate
        const snippet = content.slice(match.index ?? 0, (match.index ?? 0) + 3000);
        const lines = snippet.split('\n').length;
        if (lines > MAX_FUNC_LENGTH) {
          issues.push(`${file}:${lineNum}: function may be too long (>${MAX_FUNC_LENGTH} lines)`);
        }
      }
    }

    return { passed: issues.length === 0, issues };
  }, false); // non-blocking — advisory
}

// 5. Dead env vars / missing .env.example entries
function checkEnv(files: string[]): CheckResult {
  return runCheck('Env Vars', () => {
    const examplePath = path.join(ROOT, '.env.example');
    if (!fs.existsSync(examplePath)) return { passed: true, issues: [], detail: 'no .env.example' };

    const exampleContent = fs.readFileSync(examplePath, 'utf-8');
    const definedVars = new Set(
      exampleContent.split('\n')
        .filter(l => l.match(/^[A-Z_]+=/) )
        .map(l => l.split('=')[0])
    );

    const issues: string[] = [];
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js')) continue;
      try {
        const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
        const matches = content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
        for (const m of matches) {
          if (!definedVars.has(m[1])) {
            issues.push(`${file}: process.env.${m[1]} not in .env.example`);
          }
        }
      } catch { /* skip */ }
    }

    return { passed: issues.length === 0, issues };
  }, false);
}

// 6. Console.log / debugger in changed files
function checkDebugStatements(files: string[]): CheckResult {
  return runCheck('Debug Statements', () => {
    const issues: string[] = [];
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      try {
        const lines = fs.readFileSync(path.join(ROOT, file), 'utf-8').split('\n');
        lines.forEach((line, i) => {
          if (/\bconsole\.(log|debug|warn|error)\b/.test(line) && !line.trim().startsWith('//')) {
            issues.push(`${file}:${i + 1}: console.${line.match(/console\.(\w+)/)![1]}`);
          }
          if (/\bdebugger\b/.test(line)) {
            issues.push(`${file}:${i + 1}: debugger statement`);
          }
          if (/\.only\(/.test(line)) {
            issues.push(`${file}:${i + 1}: focused test (.only) — will skip all others`);
          }
        });
      } catch { /* skip */ }
    }
    return { passed: issues.length === 0, issues };
  });
}

// 7. Branch name check
function checkBranch(): CheckResult {
  return runCheck('Branch Name', () => {
    const branch = getCurrentBranch();
    const VALID = /^(feat|fix|chore|docs|refactor|perf|test|hotfix|release)\//;
    const PROTECTED = ['main', 'master', 'production', 'staging', 'develop'];

    if (PROTECTED.includes(branch)) {
      return {
        passed: false,
        issues: [`Committing directly to protected branch: ${branch}`],
      };
    }
    if (!VALID.test(branch)) {
      return {
        passed: false,
        issues: [`Branch "${branch}" doesn't follow convention: type/description`],
      };
    }
    return { passed: true, issues: [] };
  }, false);
}

// ─── Runner ───────────────────────────────────────────────────────────────────

function printResult(r: CheckResult): void {
  const icon = r.passed ? c.green('✓') : (r.blocking ? c.red('✗') : c.yellow('⚠'));
  const label = r.passed ? c.green(r.name) : (r.blocking ? c.red(r.name) : c.yellow(r.name));
  const duration = c.dim(`${r.duration}ms`);
  const note = r.detail ? c.dim(` — ${r.detail}`) : '';

  console.log(`  ${icon} ${label}${note} ${duration}`);

  if (!r.passed) {
    r.issues.slice(0, 5).forEach(issue => console.log(`    ${c.dim('→')} ${issue}`));
    if (r.issues.length > 5) console.log(`    ${c.dim(`... and ${r.issues.length - 5} more`)}`);
  }
}

async function main(): Promise<void> {
  const branch = getCurrentBranch();
  const files = checkAll ? [] : getChangedFiles();

  console.log(`\n${c.bold('⚡ OmniRule Pre-flight')} ${c.dim(`[${branch}]`)}`);
  console.log(c.dim(`  Checking: ${checkAll ? 'full codebase' : `${files.length} changed files`}\n`));

  const targetFiles = checkAll
    ? walkTsFiles(ROOT)
    : files;

  const checks: CheckResult[] = [
    checkBranch(),
    checkSecrets(targetFiles),
    checkDebugStatements(targetFiles),
    checkTypeScript(targetFiles),
    checkComplexity(targetFiles),
    checkTestCoverage(targetFiles),
    checkEnv(targetFiles),
  ];

  checks.forEach(printResult);

  const blockers = checks.filter(c => !c.passed && c.blocking);
  const warnings = checks.filter(c => !c.passed && !c.blocking);
  const total = Date.now();

  console.log('');
  console.log('─'.repeat(50));

  if (blockers.length === 0) {
    console.log(c.bold(c.green('\n  ✅ GO — all blocking checks passed')));
    if (warnings.length > 0) {
      console.log(c.yellow(`  ⚠  ${warnings.length} advisory warning(s) — review before merging`));
    }
  } else {
    console.log(c.bold(c.red(`\n  ❌ NO-GO — ${blockers.length} blocking issue(s) must be fixed`)));
    console.log(c.red(`  Blocking: ${blockers.map(b => b.name).join(', ')}`));
  }

  writeReport(checks, branch, targetFiles.length);
  console.log(c.dim(`\n  Report: .omnirule/reports/preflight.md\n`));

  process.exit(blockers.length > 0 ? 1 : 0);
}

function walkTsFiles(dir: string, files: string[] = []): string[] {
  const IGNORE = new Set(['node_modules', '.next', 'dist', 'build', '.git']);
  let entries: fs.Dirent[];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return files; }
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkTsFiles(full, files);
    else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx')) files.push(path.relative(ROOT, full));
  }
  return files;
}

function writeReport(checks: CheckResult[], branch: string, fileCount: number): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const blockers = checks.filter(c => !c.passed && c.blocking);
  const lines = [
    '# Pre-flight Report',
    `> Branch: \`${branch}\` | Files: ${fileCount} | ${new Date().toISOString()}`,
    `> Result: **${blockers.length === 0 ? '✅ GO' : '❌ NO-GO'}**`,
    '',
    '## Checks',
    ...checks.map(r => [
      `### ${r.passed ? '✓' : (r.blocking ? '✗' : '⚠')} ${r.name}`,
      r.issues.length === 0 ? '_Passed_' : r.issues.map(i => `- \`${i}\``).join('\n'),
    ].join('\n')),
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'preflight.md'), lines.join('\n'));
}

main();
