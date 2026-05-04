#!/usr/bin/env tsx
/**
 * OmniRule Env Validator
 *
 * Three-way check:
 *   1. .env.example defines what's required
 *   2. .env (if exists) has all required vars
 *   3. Source code only references vars declared in .env.example
 *
 * Usage:
 *   npm run tool:env
 *   npm run tool:env -- --strict    (fail on any warning)
 *   npm run tool:env -- --fix       (add missing vars to .env with empty values)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const autoFix = args.includes('--fix');

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnvVar {
  name: string;
  hasValue: boolean;
  comment?: string;
}

interface ValidationResult {
  missingInEnv: string[];           // in .env.example but not in .env
  extraInEnv: string[];             // in .env but not in .env.example
  emptyRequired: string[];          // in .env with empty value (required)
  undeclaredInCode: string[];       // process.env.X where X not in .env.example
  unusedInExample: string[];        // in .env.example but never referenced in code
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseEnvFile(filePath: string): Map<string, EnvVar> {
  const vars = new Map<string, EnvVar>();
  if (!fs.existsSync(filePath)) return vars;

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  let lastComment = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { lastComment = ''; continue; }
    if (trimmed.startsWith('#')) { lastComment = trimmed.slice(1).trim(); continue; }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const name = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    if (/^[A-Z_][A-Z0-9_]*$/.test(name)) {
      vars.set(name, { name, hasValue: value.length > 0, comment: lastComment || undefined });
    }
    lastComment = '';
  }

  return vars;
}

function scanCodeForEnvRefs(srcDir: string): Map<string, string[]> {
  // Returns: varName → [file:line, ...]
  const refs = new Map<string, string[]>();
  const IGNORE = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.omnirule']);
  const ENV_RE = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  const NEXT_ENV_RE = /(?:NEXT_PUBLIC_|process\.env\[['"]([A-Z_][A-Z0-9_]*)['"])/g;

  function walk(dir: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const e of entries) {
      if (IGNORE.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }

      if (!/\.(ts|tsx|js|jsx|mjs|cjs|mts)$/.test(e.name)) continue;

      let content: string;
      try { content = fs.readFileSync(full, 'utf-8'); }
      catch { continue; }

      const rel = path.relative(ROOT, full);
      const lines = content.split('\n');

      lines.forEach((line, i) => {
        ENV_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = ENV_RE.exec(line)) !== null) {
          const varName = m[1];
          const loc = `${rel}:${i + 1}`;
          if (!refs.has(varName)) refs.set(varName, []);
          refs.get(varName)!.push(loc);
        }
      });

      // Also check .env file itself and config files
    }
  }

  walk(path.join(ROOT, 'src'));
  walk(path.join(ROOT, 'app'));
  walk(path.join(ROOT, 'lib'));
  walk(path.join(ROOT, 'pages'));
  walk(path.join(ROOT, 'server'));
  walk(path.join(ROOT, 'scripts'));

  return refs;
}

function validate(
  example: Map<string, EnvVar>,
  actual: Map<string, EnvVar>,
  codeRefs: Map<string, string[]>
): ValidationResult {
  const exampleKeys = new Set(example.keys());
  const actualKeys = new Set(actual.keys());
  const codeKeys = new Set(codeRefs.keys());

  // 1. In example but not in .env
  const missingInEnv = [...exampleKeys].filter(k => !actualKeys.has(k));

  // 2. In .env but not in example (undocumented)
  const extraInEnv = [...actualKeys].filter(k => !exampleKeys.has(k));

  // 3. Empty values for vars that appear required (no default comment)
  const emptyRequired = [...actualKeys].filter(k => {
    const v = actual.get(k);
    return v && !v.hasValue;
  });

  // 4. Code references vars not in .env.example
  const undeclaredInCode = [...codeKeys].filter(k => {
    // Skip known framework vars
    if (k === 'NODE_ENV' || k === 'PORT' || k === 'HOST') return false;
    return !exampleKeys.has(k);
  });

  // 5. Vars in example never used in code
  const unusedInExample = [...exampleKeys].filter(k => {
    // Skip vars that are likely used via process.env at runtime or in config
    if (k.startsWith('NEXT_PUBLIC_')) return false;
    return !codeKeys.has(k);
  });

  return { missingInEnv, extraInEnv, emptyRequired, undeclaredInCode, unusedInExample };
}

// ─── Auto-fix ─────────────────────────────────────────────────────────────────

function applyFix(missingInEnv: string[], example: Map<string, EnvVar>): void {
  const envPath = path.join(ROOT, '.env');
  const additions = missingInEnv.map(k => {
    const ev = example.get(k);
    const comment = ev?.comment ? `# ${ev.comment}\n` : '';
    return `${comment}${k}=`;
  }).join('\n');

  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  const separator = existing.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(envPath, existing + separator + '\n# Added by env-validator\n' + additions + '\n');
  console.log(`  ✓ Added ${missingInEnv.length} missing vars to .env (values empty — fill them in)`);
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

const c = {
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function main(): void {
  console.log(`\n${c.bold('[Env Validator]')} Checking environment variables...\n`);

  const examplePath = path.join(ROOT, '.env.example');
  const envPath     = path.join(ROOT, '.env');
  const envLocalPath = path.join(ROOT, '.env.local');

  if (!fs.existsSync(examplePath)) {
    console.log(c.yellow('  ⚠  No .env.example found — skipping example checks'));
    console.log(c.dim('  Create .env.example to document all required environment variables\n'));
  }

  const example = parseEnvFile(examplePath);
  const actual  = parseEnvFile(fs.existsSync(envLocalPath) ? envLocalPath : envPath);
  const hasEnv  = fs.existsSync(envPath) || fs.existsSync(envLocalPath);

  console.log(`  .env.example:  ${example.size} vars defined`);
  console.log(`  .env:          ${hasEnv ? `${actual.size} vars` : c.dim('not found (CI mode)')}`);

  console.log('\n  Scanning source code for process.env references...');
  const codeRefs = scanCodeForEnvRefs(ROOT);
  console.log(`  Code references: ${codeRefs.size} unique env vars\n`);

  const result = validate(example, actual, codeRefs);

  let hasErrors = false;
  let hasWarnings = false;

  // ─── Missing in .env ──────────────────────────────────────────────────────

  if (result.missingInEnv.length > 0 && hasEnv) {
    hasErrors = true;
    console.log(c.red(`MISSING FROM .env (${result.missingInEnv.length}) — required by .env.example:`));
    result.missingInEnv.forEach(k => {
      const ev = example.get(k);
      const note = ev?.comment ? c.dim(` — ${ev.comment}`) : '';
      console.log(`  ${c.red('✗')} ${k}${note}`);
    });
    console.log('');

    if (autoFix) applyFix(result.missingInEnv, example);
  }

  // ─── Undeclared in example ────────────────────────────────────────────────

  if (result.undeclaredInCode.length > 0) {
    hasErrors = true;
    console.log(c.red(`UNDOCUMENTED VARS IN CODE (${result.undeclaredInCode.length}) — used in code but not in .env.example:`));
    result.undeclaredInCode.forEach(k => {
      const locs = codeRefs.get(k) ?? [];
      const locStr = locs.slice(0, 2).join(', ') + (locs.length > 2 ? ` +${locs.length - 2}` : '');
      console.log(`  ${c.red('✗')} ${k} ${c.dim(`(${locStr})`)}`);
    });
    console.log('');
  }

  // ─── Extra in .env ────────────────────────────────────────────────────────

  if (result.extraInEnv.length > 0) {
    hasWarnings = true;
    console.log(c.yellow(`UNDOCUMENTED IN .env (${result.extraInEnv.length}) — not in .env.example:`));
    result.extraInEnv.forEach(k => console.log(`  ${c.yellow('⚠')} ${k}`));
    console.log('');
  }

  // ─── Empty values ─────────────────────────────────────────────────────────

  if (result.emptyRequired.length > 0) {
    hasWarnings = true;
    console.log(c.yellow(`EMPTY VARS (${result.emptyRequired.length}) — defined but have no value:`));
    result.emptyRequired.forEach(k => console.log(`  ${c.yellow('⚠')} ${k}`));
    console.log('');
  }

  // ─── Unused in example ────────────────────────────────────────────────────

  if (result.unusedInExample.length > 0) {
    console.log(c.dim(`POSSIBLY UNUSED (${result.unusedInExample.length}) — in .env.example but no process.env ref found:`));
    result.unusedInExample.slice(0, 10).forEach(k => console.log(`  ${c.dim('·')} ${k}`));
    if (result.unusedInExample.length > 10) console.log(c.dim(`  ... and ${result.unusedInExample.length - 10} more`));
    console.log('');
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  const totalErrors = result.missingInEnv.length + result.undeclaredInCode.length;
  const totalWarnings = result.extraInEnv.length + result.emptyRequired.length;

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(c.green('  ✓ All environment variables are properly declared and documented'));
  } else {
    const statusParts = [];
    if (totalErrors > 0) statusParts.push(c.red(`${totalErrors} errors`));
    if (totalWarnings > 0) statusParts.push(c.yellow(`${totalWarnings} warnings`));
    console.log(`  Result: ${statusParts.join(', ')}`);
  }

  // Write report
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const lines = [
    '# Env Validator Report',
    `> ${new Date().toISOString()}`,
    `> .env.example: ${example.size} vars | Code refs: ${codeRefs.size} vars`,
    '',
    `## Missing from .env (${result.missingInEnv.length})`,
    result.missingInEnv.length === 0 ? '_None_' : result.missingInEnv.map(k => `- \`${k}\``).join('\n'),
    '',
    `## Undocumented in code (${result.undeclaredInCode.length})`,
    result.undeclaredInCode.length === 0 ? '_None_' : result.undeclaredInCode.map(k => {
      const locs = (codeRefs.get(k) ?? []).slice(0, 3).join(', ');
      return `- \`${k}\` — ${locs}`;
    }).join('\n'),
    '',
    `## Extra in .env (${result.extraInEnv.length})`,
    result.extraInEnv.length === 0 ? '_None_' : result.extraInEnv.map(k => `- \`${k}\``).join('\n'),
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'env-validator.md'), lines.join('\n'));
  console.log(c.dim('\n  Report: .omnirule/reports/env-validator.md\n'));

  const exitCode = (hasErrors || (strict && hasWarnings)) ? 1 : 0;
  process.exit(exitCode);
}

main();
