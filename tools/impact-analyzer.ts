#!/usr/bin/env tsx
/**
 * OmniRule Impact Analyzer
 *
 * Before changing a file, find everything that depends on it.
 * Traverses the full import graph to show direct + transitive dependents.
 *
 * Usage:
 *   npm run tool:impact -- src/lib/auth.ts
 *   npm run tool:impact -- src/lib/auth.ts --depth 3
 *   npm run tool:impact -- src/lib/auth.ts --json
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, '.omnirule', 'reports');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];
const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.omnirule']);

// ─── File discovery ───────────────────────────────────────────────────────────

function walkFiles(dir: string, files: string[] = []): string[] {
  let entries: fs.Dirent[];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return files; }

  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, files);
    else if (EXTENSIONS.some(ext => e.name.endsWith(ext))) files.push(full);
  }
  return files;
}

// ─── Import parsing ───────────────────────────────────────────────────────────

const IMPORT_RE = /(?:import|from)\s+['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\(['"]([^'"]+)['"]\)/g;
const DYNAMIC_RE = /import\(['"]([^'"]+)['"]\)/g;

function extractImports(filePath: string): string[] {
  let content: string;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return []; }

  const imports: string[] = [];
  for (const re of [IMPORT_RE, REQUIRE_RE, DYNAMIC_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      imports.push(m[1]);
    }
  }
  return imports;
}

function resolveImport(from: string, spec: string): string | null {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null; // external module

  const dir = path.dirname(from);
  const candidate = path.resolve(dir, spec);

  // Try exact
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;

  // Try with extensions
  for (const ext of EXTENSIONS) {
    const p = candidate + ext;
    if (fs.existsSync(p)) return p;
  }

  // Try index file
  for (const ext of EXTENSIONS) {
    const p = path.join(candidate, `index${ext}`);
    if (fs.existsSync(p)) return p;
  }

  return null;
}

// ─── Graph builder ────────────────────────────────────────────────────────────

type ImportGraph = Map<string, Set<string>>; // file → files it imports
type ReverseGraph = Map<string, Set<string>>; // file → files that import it

function buildGraph(allFiles: string[]): { forward: ImportGraph; reverse: ReverseGraph } {
  const forward: ImportGraph = new Map();
  const reverse: ReverseGraph = new Map();

  for (const file of allFiles) {
    if (!forward.has(file)) forward.set(file, new Set());
    if (!reverse.has(file)) reverse.set(file, new Set());
  }

  for (const file of allFiles) {
    const imports = extractImports(file);
    for (const spec of imports) {
      const resolved = resolveImport(file, spec);
      if (!resolved) continue;
      forward.get(file)!.add(resolved);
      if (!reverse.has(resolved)) reverse.set(resolved, new Set());
      reverse.get(resolved)!.add(file);
    }
  }

  return { forward, reverse };
}

// ─── Impact traversal ─────────────────────────────────────────────────────────

interface ImpactResult {
  target: string;
  direct: string[];
  transitive: string[];
  apiRoutes: string[];
  pageFiles: string[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  totalAffected: number;
}

function classifyFile(f: string): 'api' | 'page' | 'test' | 'other' {
  const rel = path.relative(ROOT, f);
  if (rel.includes('/api/') && rel.endsWith('route.ts')) return 'api';
  if (rel.endsWith('page.tsx') || rel.endsWith('page.ts')) return 'page';
  if (rel.includes('.test.') || rel.includes('.spec.')) return 'test';
  return 'other';
}

function analyzeImpact(targetFile: string, reverse: ReverseGraph, maxDepth: number): ImpactResult {
  const absTarget = path.isAbsolute(targetFile)
    ? targetFile
    : path.resolve(ROOT, targetFile);

  const direct = [...(reverse.get(absTarget) ?? [])];
  const visited = new Set<string>([absTarget]);
  const queue: Array<{ file: string; depth: number }> = direct.map(f => ({ file: f, depth: 1 }));
  const allAffected: string[] = [];

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);
    allAffected.push(file);

    if (depth < maxDepth) {
      const parents = [...(reverse.get(file) ?? [])];
      for (const p of parents) {
        if (!visited.has(p)) queue.push({ file: p, depth: depth + 1 });
      }
    }
  }

  const transitive = allAffected.filter(f => !direct.includes(f));
  const apiRoutes = allAffected.filter(f => classifyFile(f) === 'api');
  const pageFiles = allAffected.filter(f => classifyFile(f) === 'page');

  const total = allAffected.length;
  const riskScore: ImpactResult['riskScore'] =
    apiRoutes.length >= 3 || total >= 50 ? 'CRITICAL' :
    apiRoutes.length >= 1 || total >= 20 ? 'HIGH' :
    total >= 5 ? 'MEDIUM' : 'LOW';

  return { target: absTarget, direct, transitive, apiRoutes, pageFiles, riskScore, totalAffected: total };
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  LOW: '\x1b[32m', MEDIUM: '\x1b[33m', HIGH: '\x1b[31m', CRITICAL: '\x1b[35m',
};
const RESET = '\x1b[0m';

function rel(f: string) { return path.relative(ROOT, f); }

function printResult(r: ImpactResult): void {
  const risk = `${RISK_COLOR[r.riskScore]}${r.riskScore}${RESET}`;
  console.log(`\n⚡ Impact Analysis: ${rel(r.target)}`);
  console.log(`   Risk Score:      ${risk}`);
  console.log(`   Total Affected:  ${r.totalAffected} files\n`);

  if (r.apiRoutes.length > 0) {
    console.log(`🔴 API Routes Affected (${r.apiRoutes.length}):`);
    r.apiRoutes.forEach(f => console.log(`   ${rel(f)}`));
    console.log('');
  }

  if (r.pageFiles.length > 0) {
    console.log(`📄 Pages Affected (${r.pageFiles.length}):`);
    r.pageFiles.forEach(f => console.log(`   ${rel(f)}`));
    console.log('');
  }

  if (r.direct.length > 0) {
    console.log(`📎 Direct Dependents (${r.direct.length}):`);
    r.direct.slice(0, 15).forEach(f => console.log(`   ${rel(f)}`));
    if (r.direct.length > 15) console.log(`   ... and ${r.direct.length - 15} more`);
    console.log('');
  }

  if (r.transitive.length > 0) {
    console.log(`🔗 Transitive Dependents (${r.transitive.length}):`);
    r.transitive.slice(0, 10).forEach(f => console.log(`   ${rel(f)}`));
    if (r.transitive.length > 10) console.log(`   ... and ${r.transitive.length - 10} more`);
    console.log('');
  }

  if (r.totalAffected === 0) {
    console.log('✓ No dependents found — safe to change freely.\n');
  }
}

function writeReport(r: ImpactResult): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const name = path.basename(r.target).replace(/\.[^.]+$/, '');
  const lines = [
    `# Impact Analysis: ${rel(r.target)}`,
    `> Generated: ${new Date().toISOString()}`,
    `> Risk: **${r.riskScore}** | Total affected: **${r.totalAffected}**`,
    '',
    '## API Routes Affected',
    r.apiRoutes.length === 0 ? '_none_' : r.apiRoutes.map(f => `- \`${rel(f)}\``).join('\n'),
    '',
    '## Direct Dependents',
    r.direct.length === 0 ? '_none_' : r.direct.map(f => `- \`${rel(f)}\``).join('\n'),
    '',
    '## Transitive Dependents',
    r.transitive.length === 0 ? '_none_' : r.transitive.map(f => `- \`${rel(f)}\``).join('\n'),
  ];
  const outPath = path.join(REPORT_DIR, `impact-${name}.md`);
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`📄 Report: .omnirule/reports/impact-${name}.md`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const targetArg = args.find(a => !a.startsWith('--'));
const maxDepth = parseInt(args.find(a => a.startsWith('--depth='))?.split('=')[1] ?? '99');
const jsonMode = args.includes('--json');

if (!targetArg) {
  console.error('Usage: npm run tool:impact -- <file> [--depth=N] [--json]');
  process.exit(1);
}

console.log('[Impact] Scanning project files...');
const allFiles = walkFiles(ROOT);
console.log(`[Impact] Indexing ${allFiles.length} files...`);
const { reverse } = buildGraph(allFiles);
const result = analyzeImpact(targetArg, reverse, maxDepth);

if (jsonMode) {
  console.log(JSON.stringify({
    target: rel(result.target),
    riskScore: result.riskScore,
    totalAffected: result.totalAffected,
    direct: result.direct.map(rel),
    transitive: result.transitive.map(rel),
    apiRoutes: result.apiRoutes.map(rel),
    pageFiles: result.pageFiles.map(rel),
  }, null, 2));
} else {
  printResult(result);
  writeReport(result);
}
