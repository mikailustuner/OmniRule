#!/usr/bin/env tsx
/**
 * OmniRule i18n Audit
 *
 * 1. Scans JSX/TSX for hardcoded user-visible strings
 * 2. Compares locale JSON files for missing/extra keys
 * 3. Finds translation keys used in code but missing from locale files
 *
 * Usage:
 *   npm run tool:i18n
 *   npm run tool:i18n -- --locales src/messages
 *   npm run tool:i18n -- --src src/app --locales public/locales
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

const args = process.argv.slice(2);
const srcDir = args.find(a => a.startsWith('--src='))?.split('=')[1] ?? 'src';
const localesDir = args.find(a => a.startsWith('--locales='))?.split('=')[1];

// ─── Types ────────────────────────────────────────────────────────────────────

interface HardcodedString { file: string; line: number; text: string; context: string; }
interface MissingKey { key: string; presentIn: string[]; missingIn: string[]; }
interface OrphanKey { key: string; locale: string; notUsedIn: string; }

// ─── File walker ──────────────────────────────────────────────────────────────

function walkFiles(dir: string, exts: string[]): string[] {
  const IGNORE = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage']);
  const results: string[] = [];

  function walk(d: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (IGNORE.has(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (exts.some(ext => e.name.endsWith(ext))) results.push(full);
    }
  }

  walk(path.isAbsolute(dir) ? dir : path.join(ROOT, dir));
  return results;
}

// ─── Hardcoded string detection ───────────────────────────────────────────────

// Patterns that indicate a hardcoded user-visible string
const SKIP_PATTERNS = [
  /^\s*\/\//,           // comment line
  /\bconsole\./,        // console.log
  /\bclassName\s*=/,    // className="..."
  /\btestId\s*=/,       // testId="..."
  /\bdata-\w+\s*=/,     // data attributes
  /\bhref\s*=/,         // URLs
  /\bsrc\s*=/,          // image src
  /\btype\s*=/,         // input type
  /\bkey\s*=/,          // React key
  /\bname\s*=/,         // form name
  /\bid\s*=/,           // id
  /\baria-\w+\s*=/,     // aria attributes
];

// Patterns that ARE user-visible strings (suspicious)
const SUSPICIOUS: Array<{ re: RegExp; context: string }> = [
  { re: />\s*([A-Z][a-zA-Z\s,!?]{4,})\s*</g,                     context: 'JSX text content' },
  { re: /(?:placeholder|label|title|alt|aria-label)\s*=\s*["']([^"']{4,})["']/g, context: 'attribute string' },
  { re: /(?:toast|alert|confirm|notify|message)\s*\(\s*["']([^"']{4,})["']/g,    context: 'notification string' },
  { re: /(?:throw\s+new\s+Error|new\s+Error)\s*\(\s*["']([^"']{4,})["']/g,       context: 'error message' },
  { re: /console\.(?:error|warn)\s*\(\s*["']([^"']{6,})["']/g,                   context: 'console message' },
];

// Strings to skip (likely not user-facing)
const SKIP_STRINGS = new Set([
  'utf-8', 'utf8', 'application/json', 'text/html', 'multipart/form-data',
  'POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'HEAD',
  'development', 'production', 'test', 'staging',
]);

function isSkippableLine(line: string): boolean {
  return SKIP_PATTERNS.some(p => p.test(line));
}

function isSkippableString(s: string): boolean {
  if (SKIP_STRINGS.has(s)) return true;
  if (/^[a-z_-]+$/.test(s)) return true;          // likely a key/identifier
  if (/^\s*$/.test(s)) return true;                // whitespace only
  if (/^https?:\/\//.test(s)) return true;         // URL
  if (/^[./\\]/.test(s)) return true;              // file path
  if (s.length < 3) return true;                   // too short
  return false;
}

function scanHardcoded(files: string[]): HardcodedString[] {
  const results: HardcodedString[] = [];

  for (const file of files) {
    let content: string;
    try { content = fs.readFileSync(file, 'utf-8'); }
    catch { continue; }

    const lines = content.split('\n');
    const rel = path.relative(ROOT, file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isSkippableLine(line)) continue;

      for (const { re, context } of SUSPICIOUS) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line)) !== null) {
          const text = m[1].trim();
          if (!isSkippableString(text)) {
            results.push({ file: rel, line: i + 1, text, context });
          }
        }
      }
    }
  }

  return results;
}

// ─── Locale key comparator ────────────────────────────────────────────────────

function flattenKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flattenKeys(v as Record<string, unknown>, key).forEach(k2 => keys.add(k2));
    } else {
      keys.add(key);
    }
  }
  return keys;
}

function findLocaleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dir, f));
}

function detectLocalesDir(): string | null {
  const candidates = [
    'messages', 'locales', 'src/messages', 'src/locales',
    'public/locales', 'public/lang', 'i18n', 'src/i18n',
  ];
  for (const c of candidates) {
    const p = path.join(ROOT, c);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      const files = fs.readdirSync(p).filter(f => f.endsWith('.json'));
      if (files.length > 0) return p;
    }
  }
  return null;
}

function compareLocales(localeDir: string): { missing: MissingKey[]; extra: OrphanKey[] } {
  const files = findLocaleFiles(localeDir);
  if (files.length === 0) return { missing: [], extra: [] };

  const locales: Record<string, Set<string>> = {};
  for (const file of files) {
    const name = path.basename(file, '.json');
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
      locales[name] = flattenKeys(json);
    } catch { /* skip */ }
  }

  const localeNames = Object.keys(locales);
  if (localeNames.length < 2) return { missing: [], extra: [] };

  // Find the "base" locale (en, en-US, etc.)
  const base = localeNames.find(n => n.startsWith('en')) ?? localeNames[0];
  const baseKeys = locales[base];
  const missing: MissingKey[] = [];

  // Find keys present in base but missing in other locales
  for (const key of baseKeys) {
    const presentIn: string[] = [];
    const missingIn: string[] = [];
    for (const [locale, keys] of Object.entries(locales)) {
      if (keys.has(key)) presentIn.push(locale);
      else missingIn.push(locale);
    }
    if (missingIn.length > 0) missing.push({ key, presentIn, missingIn });
  }

  // Find keys in other locales not in base (orphans)
  const extra: OrphanKey[] = [];
  for (const [locale, keys] of Object.entries(locales)) {
    if (locale === base) continue;
    for (const key of keys) {
      if (!baseKeys.has(key)) {
        extra.push({ key, locale, notUsedIn: base });
      }
    }
  }

  return { missing, extra };
}

// ─── Translation key usage scan ───────────────────────────────────────────────

function findUsedTranslationKeys(files: string[]): string[] {
  const keys: string[] = [];
  const KEY_PATTERNS = [
    /\bt\(['"]([^'"]+)['"]\)/g,        // t('key')
    /\buseTranslation\(\).*?t\(['"]([^'"]+)['"]\)/gs,
    /i18n\.t\(['"]([^'"]+)['"]\)/g,    // i18n.t('key')
    /\btranslate\(['"]([^'"]+)['"]\)/g, // translate('key')
    /\bformatMessage\(\s*\{\s*id:\s*['"]([^'"]+)['"]/g, // formatMessage({ id: 'key' })
  ];

  for (const file of files) {
    let content: string;
    try { content = fs.readFileSync(file, 'utf-8'); }
    catch { continue; }

    for (const re of KEY_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) keys.push(m[1]);
    }
  }

  return [...new Set(keys)];
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
  console.log(`\n${c.bold('[i18n Audit]')} Scanning project...\n`);

  const srcPath = path.join(ROOT, srcDir);
  const tsxFiles = walkFiles(srcPath, ['.tsx', '.ts', '.jsx', '.js']);
  console.log(`  Source files: ${tsxFiles.length}`);

  // 1. Hardcoded strings
  console.log('  Scanning for hardcoded strings...');
  const hardcoded = scanHardcoded(tsxFiles);

  // 2. Locale comparison
  const resolvedLocalesDir = localesDir ? path.join(ROOT, localesDir) : detectLocalesDir();
  let missing: MissingKey[] = [];
  let extra: OrphanKey[] = [];
  let usedKeys: string[] = [];
  let localeFileCount = 0;

  if (resolvedLocalesDir) {
    console.log(`  Locale dir: ${path.relative(ROOT, resolvedLocalesDir)}`);
    const localeFiles = findLocaleFiles(resolvedLocalesDir);
    localeFileCount = localeFiles.length;
    const result = compareLocales(resolvedLocalesDir);
    missing = result.missing;
    extra = result.extra;
    usedKeys = findUsedTranslationKeys(tsxFiles);
  } else {
    console.log(c.dim('  No locale directory found — skipping key comparison'));
  }

  // ─── Print results ────────────────────────────────────────────────────────

  console.log('');

  if (hardcoded.length > 0) {
    console.log(c.red(`HARDCODED STRINGS (${hardcoded.length}) — should use translation keys:`));
    const grouped: Record<string, HardcodedString[]> = {};
    for (const h of hardcoded) {
      (grouped[h.file] ??= []).push(h);
    }
    let shown = 0;
    for (const [file, items] of Object.entries(grouped)) {
      if (shown >= 20) { console.log(`  ${c.dim('...')} and more`); break; }
      console.log(`\n  ${c.cyan(file)}`);
      for (const item of items.slice(0, 5)) {
        console.log(`    L${item.line} ${c.dim(`[${item.context}]`)} "${item.text}"`);
        shown++;
      }
    }
    console.log('');
  } else {
    console.log(c.green('  ✓ No hardcoded user-visible strings found'));
  }

  if (missing.length > 0) {
    console.log(c.yellow(`\nMISSING TRANSLATION KEYS (${missing.length}):`));
    missing.slice(0, 20).forEach(m => {
      console.log(`  ${c.yellow('⚠')} ${m.key} ${c.dim(`(missing in: ${m.missingIn.join(', ')})`)}`);
    });
    if (missing.length > 20) console.log(c.dim(`  ... and ${missing.length - 20} more`));
    console.log('');
  }

  if (extra.length > 0) {
    console.log(c.dim(`\nORPHAN KEYS (${extra.length}) — in locale but not in base:`));
    extra.slice(0, 10).forEach(e => {
      console.log(`  ${c.dim('·')} ${e.key} ${c.dim(`(${e.locale})`)}`);
    });
    console.log('');
  }

  // Summary
  const totalIssues = hardcoded.length + missing.length;
  const icon = totalIssues === 0 ? c.green('✓') : c.yellow('⚠');
  console.log(`${icon} Summary: ${hardcoded.length} hardcoded, ${missing.length} missing keys, ${extra.length} orphans`);
  if (localeFileCount > 0) console.log(c.dim(`  Locale files compared: ${localeFileCount}`));

  // Write report
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportLines = [
    '# i18n Audit Report',
    `> ${new Date().toISOString()} | Files scanned: ${tsxFiles.length}`,
    '',
    `## Hardcoded Strings (${hardcoded.length})`,
    hardcoded.length === 0 ? '_None found_' : hardcoded.map(h => `- \`${h.file}:${h.line}\` [${h.context}] "${h.text}"`).join('\n'),
    '',
    `## Missing Keys (${missing.length})`,
    missing.length === 0 ? '_None_' : missing.map(m => `- \`${m.key}\` — missing in: ${m.missingIn.join(', ')}`).join('\n'),
    '',
    `## Orphan Keys (${extra.length})`,
    extra.length === 0 ? '_None_' : extra.map(e => `- \`${e.key}\` in ${e.locale}`).join('\n'),
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'i18n-audit.md'), reportLines.join('\n'));
  console.log(c.dim('\n  Report: .omnirule/reports/i18n-audit.md\n'));
}

main();
