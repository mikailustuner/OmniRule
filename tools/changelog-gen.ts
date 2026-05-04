#!/usr/bin/env tsx
/**
 * OmniRule Changelog Generator
 *
 * Reads git log (Conventional Commits) → generates CHANGELOG.md
 * Groups by version tags, sections by commit type.
 *
 * Usage:
 *   npm run tool:changelog
 *   npm run tool:changelog -- --from v1.0.0 --to HEAD
 *   npm run tool:changelog -- --unreleased          (only unreleased commits)
 *   npm run tool:changelog -- --out CHANGELOG.md
 *   npm run tool:changelog -- --dry-run             (print, don't write)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();

const args = process.argv.slice(2);
const fromTag   = args.find(a => a.startsWith('--from='))?.split('=')[1];
const toRef     = args.find(a => a.startsWith('--to='))?.split('=')[1] ?? 'HEAD';
const outFile   = args.find(a => a.startsWith('--out='))?.split('=')[1] ?? 'CHANGELOG.md';
const dryRun    = args.includes('--dry-run');
const unreleased = args.includes('--unreleased');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Commit {
  hash: string;
  shortHash: string;
  type: string;
  scope?: string;
  subject: string;
  body: string;
  breaking: boolean;
  date: string;
}

interface VersionGroup {
  version: string;
  date: string;
  commits: Commit[];
}

// ─── Git helpers ──────────────────────────────────────────────────────────────

function git(cmd: string): string {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim(); }
  catch { return ''; }
}

function getTags(): Array<{ name: string; date: string; hash: string }> {
  const out = git('git tag --sort=-creatordate --format=%(refname:short)|%(creatordate:short)|%(objectname:short)');
  if (!out) return [];
  return out.split('\n').filter(Boolean).map(line => {
    const [name, date, hash] = line.split('|');
    return { name, date, hash };
  });
}

function getCommitsBetween(from: string, to: string): string[] {
  const range = from ? `${from}..${to}` : to;
  const out = git(`git log ${range} --pretty=format:%H|%h|%s|%b|%ai --no-merges`);
  if (!out) return [];
  return out.split('\n').filter(Boolean);
}

// ─── Commit parser ────────────────────────────────────────────────────────────

// Conventional Commits regex
const CC_RE = /^(?<type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<subject>.+)$/;

function parseCommit(raw: string): Commit | null {
  const parts = raw.split('|');
  if (parts.length < 3) return null;

  const [hash, shortHash, subject, body = '', dateStr = ''] = parts;
  const match = CC_RE.exec(subject.trim());

  if (!match?.groups) return null;

  const { type, scope, breaking, subject: subj } = match.groups;
  const isBreaking = !!breaking || (body ?? '').includes('BREAKING CHANGE:');

  // Extract date (first 10 chars of ISO date)
  const date = dateStr.trim().slice(0, 10) || new Date().toISOString().slice(0, 10);

  return { hash, shortHash, type, scope, subject: subj, body: body ?? '', breaking: isBreaking, date };
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS: Array<{ types: string[]; title: string; emoji: string }> = [
  { types: ['feat'],               title: 'Features',            emoji: '✨' },
  { types: ['fix'],                title: 'Bug Fixes',           emoji: '🐛' },
  { types: ['perf'],               title: 'Performance',         emoji: '⚡' },
  { types: ['security'],           title: 'Security',            emoji: '🔒' },
  { types: ['refactor'],           title: 'Refactoring',         emoji: '♻️' },
  { types: ['docs'],               title: 'Documentation',       emoji: '📖' },
  { types: ['test'],               title: 'Tests',               emoji: '✅' },
  { types: ['build', 'ci'],        title: 'Build & CI',          emoji: '🏗️' },
  { types: ['chore', 'style'],     title: 'Chores',              emoji: '🔧' },
  { types: ['revert'],             title: 'Reverts',             emoji: '⏪' },
];

// ─── Markdown renderer ────────────────────────────────────────────────────────

function formatCommit(commit: Commit, remoteUrl?: string): string {
  const scope = commit.scope ? `**${commit.scope}**: ` : '';
  const breaking = commit.breaking ? ' 🚨' : '';
  const hash = remoteUrl
    ? `[\`${commit.shortHash}\`](${remoteUrl}/commit/${commit.hash})`
    : `\`${commit.shortHash}\``;

  return `- ${scope}${commit.subject}${breaking} (${hash})`;
}

function renderVersion(group: VersionGroup, remoteUrl?: string): string {
  const lines: string[] = [];

  // Header
  if (remoteUrl && group.version !== 'Unreleased') {
    lines.push(`## [${group.version}](${remoteUrl}/releases/tag/${group.version}) — ${group.date}`);
  } else {
    lines.push(`## ${group.version === 'Unreleased' ? '[Unreleased]' : group.version} — ${group.date}`);
  }
  lines.push('');

  // Breaking changes block
  const breaking = group.commits.filter(c => c.breaking);
  if (breaking.length > 0) {
    lines.push('### 🚨 Breaking Changes');
    lines.push('');
    breaking.forEach(c => {
      lines.push(`- **${c.scope ? c.scope + ': ' : ''}${c.subject}**`);
      // Extract BREAKING CHANGE description from body
      const bcMatch = c.body.match(/BREAKING CHANGE:\s*(.+)/i);
      if (bcMatch) lines.push(`  > ${bcMatch[1].trim()}`);
    });
    lines.push('');
  }

  // Sections
  for (const section of SECTIONS) {
    const sectionCommits = group.commits.filter(c => section.types.includes(c.type));
    if (sectionCommits.length === 0) continue;

    lines.push(`### ${section.emoji} ${section.title}`);
    lines.push('');
    sectionCommits.forEach(c => lines.push(formatCommit(c, remoteUrl)));
    lines.push('');
  }

  return lines.join('\n');
}

function getRemoteUrl(): string | undefined {
  const remote = git('git remote get-url origin');
  if (!remote) return undefined;
  // Convert SSH to HTTPS
  return remote
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^git@gitlab\.com:/, 'https://gitlab.com/')
    .replace(/\.git$/, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan:  (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim:   (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
  yellow:(s: string) => `\x1b[33m${s}\x1b[0m`,
};

function main(): void {
  console.log(`\n${c.bold('[Changelog]')} Generating from git history...\n`);

  const remoteUrl = getRemoteUrl();
  const tags = getTags();

  console.log(`  Tags found: ${tags.length}`);
  if (remoteUrl) console.log(`  Remote: ${c.dim(remoteUrl)}`);

  const groups: VersionGroup[] = [];

  if (unreleased || tags.length === 0) {
    // Only unreleased (or no tags)
    const latestTag = tags[0]?.name;
    const rawCommits = getCommitsBetween(latestTag ?? '', 'HEAD');
    const commits = rawCommits.map(parseCommit).filter((c): c is Commit => c !== null);

    if (commits.length > 0) {
      groups.push({
        version: 'Unreleased',
        date: new Date().toISOString().slice(0, 10),
        commits,
      });
    }

    if (!unreleased) {
      console.log(c.yellow('  No tags found — generating unreleased section only'));
    }
  } else {
    // Unreleased section (commits after latest tag)
    const latestTag = tags[0];
    const unreleasedRaw = getCommitsBetween(latestTag.name, 'HEAD');
    const unreleasedCommits = unreleasedRaw.map(parseCommit).filter((c): c is Commit => c !== null);

    if (unreleasedCommits.length > 0) {
      groups.push({
        version: 'Unreleased',
        date: new Date().toISOString().slice(0, 10),
        commits: unreleasedCommits,
      });
    }

    // Per-version sections
    const effectiveTags = fromTag
      ? tags.filter((_, i) => i <= tags.findIndex(t => t.name === fromTag))
      : tags;

    for (let i = 0; i < effectiveTags.length; i++) {
      const current = effectiveTags[i];
      const previous = effectiveTags[i + 1];

      const rawCommits = getCommitsBetween(previous?.name ?? '', current.name);
      const commits = rawCommits.map(parseCommit).filter((c): c is Commit => c !== null);

      if (commits.length > 0) {
        groups.push({ version: current.name, date: current.date, commits });
      }
    }
  }

  if (groups.length === 0) {
    console.log(c.yellow('  No conventional commits found in range'));
    console.log(c.dim('  Commit format: feat(scope): description'));
    return;
  }

  // Count commits
  const totalCommits = groups.reduce((sum, g) => sum + g.commits.length, 0);
  const totalBreaking = groups.reduce((sum, g) => sum + g.commits.filter(c => c.breaking).length, 0);
  console.log(`  Versions: ${groups.length} | Commits: ${totalCommits} | Breaking: ${totalBreaking}\n`);

  // Build document
  const projectName = (() => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
      return pkg.name ?? 'Changelog';
    } catch { return 'Changelog'; }
  })();

  const docLines = [
    `# Changelog — ${projectName}`,
    '',
    `All notable changes are documented here. Format: [Conventional Commits](https://www.conventionalcommits.org/).`,
    '',
    ...groups.map(g => renderVersion(g, remoteUrl)),
  ];

  const doc = docLines.join('\n');

  if (dryRun) {
    console.log(doc);
    return;
  }

  const outPath = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);
  fs.writeFileSync(outPath, doc, 'utf-8');

  const relOut = path.relative(ROOT, outPath);
  console.log(c.green(`  ✓ Written: ${relOut}`));
  console.log(c.dim(`  ${groups.length} version(s), ${totalCommits} commit(s)\n`));
}

main();
