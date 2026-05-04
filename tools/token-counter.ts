#!/usr/bin/env tsx
/**
 * OmniRule Token Counter & Cost Estimator
 *
 * Estimates token counts for files/directories and calculates
 * API cost per Claude model — adapted from CldSRC token estimation logic.
 *
 * Usage:
 *   npm run tool:tokens -- src/
 *   npm run tool:tokens -- src/app/page.tsx
 *   npm run tool:tokens -- src/ --model sonnet-4-6
 *   npm run tool:tokens -- src/ --budget 8000     (check if fits in budget)
 *   npm run tool:tokens -- --models               (list all model prices)
 */

import * as fs from 'fs';
import * as path from 'path';
import { formatCost, formatFileSize, formatNumber, formatTokens } from '../lib/format.js';

const ROOT = process.cwd();

// ─── Model pricing ($/Mtok) — from CldSRC/src/utils/modelCost.ts ─────────────

interface ModelCost {
  name: string;
  inputPerMtok: number;
  outputPerMtok: number;
  cacheWritePerMtok: number;
  cacheReadPerMtok: number;
  contextWindow: number;
}

const MODELS: Record<string, ModelCost> = {
  'haiku-4-5': {
    name: 'Claude Haiku 4.5',
    inputPerMtok: 1, outputPerMtok: 5,
    cacheWritePerMtok: 1.25, cacheReadPerMtok: 0.1,
    contextWindow: 200_000,
  },
  'haiku-3-5': {
    name: 'Claude Haiku 3.5',
    inputPerMtok: 0.8, outputPerMtok: 4,
    cacheWritePerMtok: 1, cacheReadPerMtok: 0.08,
    contextWindow: 200_000,
  },
  'sonnet-4-6': {
    name: 'Claude Sonnet 4.6',
    inputPerMtok: 3, outputPerMtok: 15,
    cacheWritePerMtok: 3.75, cacheReadPerMtok: 0.3,
    contextWindow: 200_000,
  },
  'sonnet-4-5': {
    name: 'Claude Sonnet 4.5',
    inputPerMtok: 3, outputPerMtok: 15,
    cacheWritePerMtok: 3.75, cacheReadPerMtok: 0.3,
    contextWindow: 200_000,
  },
  'opus-4-6': {
    name: 'Claude Opus 4.6',
    inputPerMtok: 5, outputPerMtok: 25,
    cacheWritePerMtok: 6.25, cacheReadPerMtok: 0.5,
    contextWindow: 200_000,
  },
  'opus-4': {
    name: 'Claude Opus 4',
    inputPerMtok: 15, outputPerMtok: 75,
    cacheWritePerMtok: 18.75, cacheReadPerMtok: 1.5,
    contextWindow: 200_000,
  },
};

const DEFAULT_MODEL = 'sonnet-4-6';

// ─── Token estimation — from CldSRC/src/services/tokenEstimation.ts ──────────

/**
 * Returns bytes-per-token ratio for a file extension.
 * Dense JSON has ~2 bytes/token; code/prose ~4 bytes/token.
 */
function bytesPerToken(ext: string): number {
  switch (ext.toLowerCase().replace('.', '')) {
    case 'json': case 'jsonl': case 'jsonc': return 2;
    case 'minjs': case 'mincss': return 2;
    default: return 4;
  }
}

function estimateTokens(content: string, ext = ''): number {
  return Math.round(content.length / bytesPerToken(ext));
}

// ─── File discovery ───────────────────────────────────────────────────────────

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.omnirule', '.design']);
const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs',
  '.json', '.jsonc', '.jsonl',
  '.md', '.mdx', '.txt', '.yaml', '.yml', '.toml', '.env',
  '.css', '.scss', '.sass', '.less',
  '.html', '.htm', '.xml', '.svg',
  '.sh', '.bash', '.zsh',
  '.py', '.rb', '.go', '.rs', '.java', '.cpp', '.c', '.h',
  '.prisma', '.graphql', '.gql',
]);

interface FileEntry {
  path: string;
  ext: string;
  bytes: number;
  tokens: number;
}

function processPath(inputPath: string): FileEntry[] {
  const abs = path.isAbsolute(inputPath) ? inputPath : path.join(ROOT, inputPath);

  if (!fs.existsSync(abs)) {
    console.error(`  Not found: ${inputPath}`);
    return [];
  }

  const stat = fs.statSync(abs);

  if (stat.isFile()) {
    return [processFile(abs)].filter(Boolean) as FileEntry[];
  }

  // Directory: walk recursively
  const results: FileEntry[] = [];
  walkDir(abs, results);
  return results;
}

function walkDir(dir: string, results: FileEntry[]): void {
  let entries: fs.Dirent[];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }

  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, results);
    else if (e.isFile()) {
      const entry = processFile(full);
      if (entry) results.push(entry);
    }
  }
}

function processFile(filePath: string): FileEntry | null {
  const ext = path.extname(filePath);
  if (!TEXT_EXTS.has(ext) && ext !== '') return null;

  let content: string;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return null; }

  const bytes = Buffer.byteLength(content, 'utf-8');
  const tokens = estimateTokens(content, ext);

  return { path: filePath, ext, bytes, tokens };
}

// ─── Cost calculator ──────────────────────────────────────────────────────────

function estimateCost(tokens: number, model: ModelCost): {
  input: number;
  withCache: number;
  contextFitPct: number;
} {
  const input = (tokens / 1_000_000) * model.inputPerMtok;
  const withCache = (tokens / 1_000_000) * model.cacheReadPerMtok; // cache hit
  const contextFitPct = Math.min(100, (tokens / model.contextWindow) * 100);
  return { input, withCache, contextFitPct };
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

function contextBar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  const color = pct > 90 ? c.red : pct > 70 ? c.yellow : c.green;
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return color(bar) + ` ${pct.toFixed(1)}%`;
}

function printModels(): void {
  console.log(`\n${c.bold('Claude Model Pricing')} (per million tokens)\n`);
  console.log('  Model'.padEnd(20) + 'Input'.padEnd(10) + 'Output'.padEnd(10) + 'Cache Read'.padEnd(12) + 'Context');
  console.log('  ' + '─'.repeat(62));
  for (const [slug, m] of Object.entries(MODELS)) {
    const row = [
      `  ${m.name}`.padEnd(22),
      `$${m.inputPerMtok}/Mtok`.padEnd(10),
      `$${m.outputPerMtok}/Mtok`.padEnd(10),
      `$${m.cacheReadPerMtok}/Mtok`.padEnd(12),
      `${formatNumber(m.contextWindow)}`,
    ].join('');
    console.log(row + c.dim(` (${slug})`));
  }
  console.log('');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const showModels = args.includes('--models');
const _modelIdx  = args.indexOf('--model');
const modelArg   = args.find(a => a.startsWith('--model='))?.split('=')[1] ??
                   (_modelIdx !== -1 && args[_modelIdx + 1] && !args[_modelIdx + 1].startsWith('--')
                     ? args[_modelIdx + 1] : undefined);
const budgetArg  = parseInt(args.find(a => a.startsWith('--budget='))?.split('=')[1] ?? '0');
const targets    = args.filter(a => !a.startsWith('--'));

if (showModels) { printModels(); process.exit(0); }

const modelSlug = modelArg ?? DEFAULT_MODEL;
const model = MODELS[modelSlug];

if (!model) {
  console.error(`Unknown model: ${modelSlug}. Use --models to list.`);
  process.exit(1);
}

if (targets.length === 0) {
  console.error('Usage: npm run tool:tokens -- <path> [--model=<slug>] [--budget=<tokens>] [--models]');
  process.exit(1);
}

console.log(`\n${c.bold('Token Counter')} ${c.dim(`[${model.name}]`)}\n`);

let allFiles: FileEntry[] = [];
for (const target of targets) {
  const files = processPath(target);
  allFiles = allFiles.concat(files);
}

if (allFiles.length === 0) {
  console.log('  No text files found.');
  process.exit(0);
}

// Sort by token count descending
allFiles.sort((a, b) => b.tokens - a.tokens);

const totalTokens = allFiles.reduce((s, f) => s + f.tokens, 0);
const totalBytes  = allFiles.reduce((s, f) => s + f.bytes, 0);

// Print top files
const TOP_N = 15;
if (allFiles.length > 1) {
  console.log(`${c.bold('Top files by token count:')}\n`);
  allFiles.slice(0, TOP_N).forEach(f => {
    const rel = path.relative(ROOT, f.path);
    const tokenStr = formatTokens(f.tokens).padStart(7);
    const sizeStr  = formatFileSize(f.bytes).padStart(8);
    const bar = contextBar(Math.min(100, (f.tokens / Math.max(1, allFiles[0]!.tokens)) * 100), 12);
    console.log(`  ${tokenStr} tokens  ${sizeStr}  ${bar}  ${c.dim(rel)}`);
  });
  if (allFiles.length > TOP_N) {
    console.log(c.dim(`  ... and ${allFiles.length - TOP_N} more files`));
  }
  console.log('');
}

// Summary
const cost = estimateCost(totalTokens, model);
const ctxBar = contextBar(cost.contextFitPct);

console.log('─'.repeat(60));
console.log(`\n  ${c.bold('Files:         ')} ${allFiles.length}`);
console.log(`  ${c.bold('Total size:    ')} ${formatFileSize(totalBytes)}`);
console.log(`  ${c.bold('Total tokens:  ')} ${c.cyan(formatTokens(totalTokens))}  (estimated)`);
console.log(`  ${c.bold('Context usage: ')} ${ctxBar}`);
console.log('');
console.log(`  ${c.bold('Cost (input):  ')} ${c.yellow(formatCost(cost.input))}  — single request`);
console.log(`  ${c.bold('Cost (cached): ')} ${c.green(formatCost(cost.withCache))}  — cache hit`);

if (budgetArg > 0) {
  const fits = totalTokens <= budgetArg;
  const pct  = ((totalTokens / budgetArg) * 100).toFixed(1);
  const icon = fits ? c.green('✓') : c.red('✗');
  console.log(`\n  ${icon} Budget ${formatTokens(budgetArg)}: ${totalTokens} / ${budgetArg} tokens (${pct}%)`);
  if (!fits) {
    const excess = totalTokens - budgetArg;
    console.log(`  ${c.red(`  Over by ${formatTokens(excess)} tokens`)}`);
  }
}

// Extension breakdown
const byExt: Record<string, { count: number; tokens: number }> = {};
for (const f of allFiles) {
  const ext = f.ext || '(no ext)';
  if (!byExt[ext]) byExt[ext] = { count: 0, tokens: 0 };
  byExt[ext].count++;
  byExt[ext].tokens += f.tokens;
}

const topExts = Object.entries(byExt)
  .sort((a, b) => b[1].tokens - a[1].tokens)
  .slice(0, 6);

if (topExts.length > 1) {
  console.log(`\n  ${c.dim('By extension:')}`);
  topExts.forEach(([ext, { count, tokens }]) => {
    const pct = ((tokens / totalTokens) * 100).toFixed(0);
    console.log(`  ${c.dim(ext.padEnd(8))} ${formatTokens(tokens).padStart(7)} tokens  ${String(count).padStart(4)} files  ${pct}%`);
  });
}

console.log('');
