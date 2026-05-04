#!/usr/bin/env tsx
/**
 * OmniRule Dead Code Detector
 *
 * Finds exports that are never imported anywhere in the project.
 * Ignores Next.js entry points (page.tsx, layout.tsx, route.ts, etc.)
 * and public API entry files (index.ts).
 *
 * Usage:
 *   npm run tool:dead-code
 *   npm run tool:dead-code -- --json
 *   npm run tool:dead-code -- --strict    (also flag unused local vars)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportInfo { file: string; name: string; line: number; type: 'named' | 'default' | 're-export'; }
interface DeadExport extends ExportInfo { importedBy: string[]; }

// ─── File discovery ───────────────────────────────────────────────────────────

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.omnirule', 'public']);
const NEXT_ENTRY_FILES = new Set([
  'page.tsx', 'page.ts', 'layout.tsx', 'layout.ts',
  'route.ts', 'route.tsx', 'loading.tsx', 'loading.ts',
  'error.tsx', 'error.ts', 'not-found.tsx', 'not-found.ts',
  'global-error.tsx', 'middleware.ts', 'middleware.tsx',
  'instrumentation.ts', 'next.config.ts', 'next.config.js',
  'tailwind.config.ts', 'tailwind.config.js',
  'postcss.config.js', 'postcss.config.ts',
  'vitest.config.ts', 'jest.config.ts', 'jest.config.js',
]);

// Public entry files — exports here are expected to be used by consumers
const PUBLIC_ENTRY_RE = /(?:^|[/\\])index\.(ts|tsx|js|jsx)$/;

function isEntryFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  if (NEXT_ENTRY_FILES.has(basename)) return true;
  if (PUBLIC_ENTRY_RE.test(filePath)) return true;
  // Test files
  if (basename.includes('.test.') || basename.includes('.spec.')) return true;
  // Story files
  if (basename.includes('.stories.')) return true;
  return false;
}

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  function walk(d: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (IGNORE_DIRS.has(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|jsx|mts|cts)$/.test(e.name)) results.push(full);
    }
  }
  walk(dir);
  return results;
}

// ─── Export extraction ────────────────────────────────────────────────────────

const NAMED_EXPORT_RE = /^export\s+(?:(?:async\s+)?function|class|const|let|var|type|interface|enum)\s+(\w+)/gm;
const RE_EXPORT_RE = /^export\s*\{([^}]+)\}/gm;
const DEFAULT_EXPORT_RE = /^export\s+default\s+(?:function\s+)?(\w+)?/gm;
const NAMED_AS_RE = /\b(\w+)\s+as\s+(\w+)/g;

function extractExports(filePath: string): ExportInfo[] {
  let content: string;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return []; }

  const exports: ExportInfo[] = [];
  const rel = path.relative(ROOT, filePath);
  const lines = content.split('\n');

  function lineOf(index: number): number {
    return content.slice(0, index).split('\n').length;
  }

  // Named exports
  NAMED_EXPORT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NAMED_EXPORT_RE.exec(content)) !== null) {
    exports.push({ file: rel, name: m[1], line: lineOf(m.index), type: 'named' });
  }

  // Re-exports: export { Foo, Bar as Baz }
  RE_EXPORT_RE.lastIndex = 0;
  while ((m = RE_EXPORT_RE.exec(content)) !== null) {
    const body = m[1];
    // Skip re-exports from other modules (export { X } from '...')
    const afterMatch = content.slice(m.index + m[0].length).trimStart();
    if (afterMatch.startsWith('from')) continue;

    for (const part of body.split(',')) {
      const trimmed = part.trim();
      // "Foo as Bar" → exported as Bar
      const asMark = trimmed.match(/(\w+)\s+as\s+(\w+)/);
      const name = asMark ? asMark[2] : trimmed;
      if (name) exports.push({ file: rel, name, line: lineOf(m.index), type: 're-export' });
    }
  }

  // Default export
  DEFAULT_EXPORT_RE.lastIndex = 0;
  while ((m = DEFAULT_EXPORT_RE.exec(content)) !== null) {
    exports.push({ file: rel, name: m[1] ?? 'default', line: lineOf(m.index), type: 'default' });
  }

  return exports;
}

// ─── Import extraction ────────────────────────────────────────────────────────

const IMPORT_NAMES_RE = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
const IMPORT_DEFAULT_RE = /import\s+(?:type\s+)?(\w+)\s+from\s+['"][^'"]+['"]/g;
const IMPORT_NS_RE = /import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]+['"]/g;
const DYNAMIC_RE = /import\(['"][^'"]+['"]\)/g;
const REQUIRE_RE = /require\(['"][^'"]+['"]\)/g;

function extractImportedNames(filePath: string): Set<string> {
  let content: string;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return new Set(); }

  const names = new Set<string>();

  IMPORT_NAMES_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMPORT_NAMES_RE.exec(content)) !== null) {
    for (const part of m[1].split(',')) {
      const trimmed = part.trim();
      const asMark = trimmed.match(/(\w+)\s+as\s+(\w+)/);
      const name = asMark ? asMark[1] : trimmed.replace(/\s+type\s+/, '').trim();
      if (name) names.add(name);
    }
  }

  IMPORT_DEFAULT_RE.lastIndex = 0;
  while ((m = IMPORT_DEFAULT_RE.exec(content)) !== null) {
    names.add(m[1]);
  }

  // Namespace imports — we can't easily track which named exports are used
  // Mark all exports from namespace-imported modules as used
  IMPORT_NS_RE.lastIndex = 0;
  while ((m = IMPORT_NS_RE.exec(content)) !== null) {
    names.add(m[1]);
  }

  return names;
}

// ─── Import source resolver ───────────────────────────────────────────────────

const IMPORT_SOURCE_RE = /(?:import|from)\s+['"]([^'"]+)['"]/g;

function extractImportSources(filePath: string): string[] {
  let content: string;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return []; }

  const sources: string[] = [];
  IMPORT_SOURCE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMPORT_SOURCE_RE.exec(content)) !== null) {
    sources.push(m[1]);
  }
  return sources;
}

function resolveImport(from: string, spec: string): string | null {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null;
  const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];
  const dir = path.dirname(path.join(ROOT, from));
  const candidate = path.resolve(dir, spec);

  if (fs.existsSync(candidate) && !fs.statSync(candidate).isDirectory()) return path.relative(ROOT, candidate);
  for (const ext of EXTS) {
    const p = candidate + ext;
    if (fs.existsSync(p)) return path.relative(ROOT, p);
  }
  for (const ext of EXTS) {
    const p = path.join(candidate, `index${ext}`);
    if (fs.existsSync(p)) return path.relative(ROOT, p);
  }
  return null;
}

// ─── Dead code analysis ───────────────────────────────────────────────────────

function analyze(allFiles: string[]): DeadExport[] {
  // 1. Build export map: file → exports
  const exportMap = new Map<string, ExportInfo[]>();
  for (const file of allFiles) {
    const rel = path.relative(ROOT, file);
    if (isEntryFile(rel)) continue;
    const exports = extractExports(file);
    if (exports.length > 0) exportMap.set(rel, exports);
  }

  // 2. Build "who imports what from where" map
  // importedNames: file → Set of names it imports from each source
  const fileImportedNames = new Map<string, Map<string, Set<string>>>();
  for (const file of allFiles) {
    const rel = path.relative(ROOT, file);
    const sources = extractImportSources(rel);
    const names = extractImportedNames(file);
    const sourceMap = new Map<string, Set<string>>();

    for (const spec of sources) {
      const resolved = resolveImport(rel, spec);
      if (resolved) sourceMap.set(resolved, names);
    }
    fileImportedNames.set(rel, sourceMap);
  }

  // 3. For each export, check if any file imports it
  const dead: DeadExport[] = [];

  for (const [exportFile, exports] of exportMap) {
    for (const exp of exports) {
      const importedBy: string[] = [];

      for (const [importerFile, sourceMap] of fileImportedNames) {
        const importedNamesFromExportFile = sourceMap.get(exportFile);
        if (!importedNamesFromExportFile) continue;

        // If namespace import, mark as used
        if (importedNamesFromExportFile.size === 0) {
          importedBy.push(importerFile);
          continue;
        }

        if (exp.type === 'default') {
          // Default export — harder to track precisely; assume used if file is imported
          if (sourceMap.has(exportFile)) importedBy.push(importerFile);
        } else {
          if (importedNamesFromExportFile.has(exp.name)) {
            importedBy.push(importerFile);
          }
        }
      }

      if (importedBy.length === 0) {
        dead.push({ ...exp, importedBy });
      }
    }
  }

  return dead;
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
  console.log(`\n${c.bold('[Dead Code]')} Scanning project...\n`);

  const allFiles = walkFiles(ROOT);
  console.log(`  Files indexed: ${allFiles.length}`);

  const dead = analyze(allFiles);

  if (jsonMode) {
    console.log(JSON.stringify(dead, null, 2));
    return;
  }

  if (dead.length === 0) {
    console.log(c.green('\n  ✓ No dead exports found — clean codebase!\n'));
    return;
  }

  // Group by file
  const grouped: Record<string, DeadExport[]> = {};
  for (const d of dead) {
    (grouped[d.file] ??= []).push(d);
  }

  console.log(c.yellow(`\n  Dead exports found: ${dead.length} across ${Object.keys(grouped).length} files\n`));

  for (const [file, items] of Object.entries(grouped)) {
    console.log(`  ${c.cyan(file)}`);
    for (const item of items) {
      console.log(`    L${item.line} ${c.yellow(item.name)} ${c.dim(`[${item.type}]`)}`);
    }
  }

  // Write report
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const lines = [
    '# Dead Code Report',
    `> ${new Date().toISOString()} | Dead exports: **${dead.length}**`,
    '',
    ...Object.entries(grouped).map(([file, items]) => [
      `## \`${file}\``,
      ...items.map(i => `- Line ${i.line}: \`${i.name}\` (${i.type})`),
      '',
    ]).flat(),
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'dead-code.md'), lines.join('\n'));
  console.log(`\n  ${c.dim('Report: .omnirule/reports/dead-code.md')}\n`);
}

main();
