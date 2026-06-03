#!/usr/bin/env node
/**
 * OmniRule Quality Gate — Stop Event Hook
 *
 * Runs at the end of every agent response (Stop event).
 * Batches expensive checks here instead of on every file edit.
 * Only blocks if critical issues found.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function run(cmd, label) {
  try {
    const out = execSync(cmd, { cwd: root, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, label, output: out.trim() };
  } catch (err) {
    return { ok: false, label, output: err.stdout?.trim() || err.message };
  }
}

function hasTypeScript() {
  return fs.existsSync(path.join(root, 'tsconfig.json'));
}

function hasEslint() {
  return (
    fs.existsSync(path.join(root, '.eslintrc.json')) ||
    fs.existsSync(path.join(root, '.eslintrc.js')) ||
    fs.existsSync(path.join(root, 'eslint.config.mjs'))
  );
}

function getChangedFiles() {
  try {
    return execSync('git diff --name-only HEAD 2>/dev/null', { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  const results = [];
  const changed = getChangedFiles();

  // TypeScript check — only if TS files changed
  if (hasTypeScript() && changed.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
    results.push(run('npx tsc --noEmit 2>&1 | head -20', 'TypeScript'));
  }

  // ESLint — only on changed files
  if (hasEslint() && changed.length > 0) {
    const tsFiles = changed.filter(f => /\.(ts|tsx|js|jsx)$/.test(f)).join(' ');
    if (tsFiles) {
      results.push(run(`npx eslint ${tsFiles} --max-warnings=10 2>&1 | head -30`, 'ESLint'));
    }
  }

  const failed = results.filter(r => !r.ok);
  const passed = results.filter(r => r.ok);

  if (results.length === 0) {
    // Nothing to check
    process.stdout.write(JSON.stringify({ status: 'skipped', message: 'No qualifying changes to check' }));
    return;
  }

  const tsFailed = failed.filter(r => r.label === 'TypeScript');
  const lintFailed = failed.filter(r => r.label === 'ESLint');

  const errorDetails = failed
    .map(r => `\n[${r.label}]\n${r.output}`)
    .join('\n');

  const output = {
    status: tsFailed.length > 0 ? 'failed' : lintFailed.length > 0 ? 'warnings' : 'passed',
    passed: passed.map(r => r.label),
    errors: tsFailed.map(r => ({ check: r.label, output: r.output })),
    warnings: lintFailed.map(r => ({ check: r.label, output: r.output })),
    message: failed.length === 0
      ? `Quality gate passed (${passed.map(r => r.label).join(', ')})`
      : tsFailed.length > 0
        ? `QUALITY GATE FAILED — TypeScript errors must be fixed before committing:${errorDetails}`
        : `Quality warnings (ESLint): review before committing:${errorDetails}`,
  };

  process.stdout.write(JSON.stringify(output));
}

main();
