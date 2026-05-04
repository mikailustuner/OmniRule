#!/usr/bin/env tsx
/**
 * OmniRule Mission Runner
 *
 * Reads .omnirule/missions/*.json, shows status dashboard,
 * and manages mission lifecycle.
 *
 * Usage:
 *   npm run tool:missions              — show dashboard
 *   npm run tool:missions -- status    — list all missions
 *   npm run tool:missions -- new       — create a new mission interactively
 *   npm run tool:missions -- complete <id>
 *   npm run tool:missions -- fail <id> <reason>
 *   npm run tool:missions -- clear     — remove completed missions
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MissionMemo {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'blocked';
  priority: 'P0' | 'P1' | 'P2';
  depends_on: string[];
  task: string;
  context: { files: string[]; skills: string[]; tools: string[] };
  definition_of_done?: string;
  artifacts: string[];
  created_at: string;
  updated_at: string;
  failure_reason?: string;
}

const MISSIONS_DIR = path.join(process.cwd(), '.omnirule', 'missions');
const DASHBOARD_FILE = path.join(process.cwd(), '.omnirule', 'DASHBOARD.md');

// ─── Mission CRUD ─────────────────────────────────────────────────────────────

function readMissions(): MissionMemo[] {
  if (!fs.existsSync(MISSIONS_DIR)) return [];
  return fs.readdirSync(MISSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(MISSIONS_DIR, f), 'utf-8')) as MissionMemo; }
      catch { return null; }
    })
    .filter(Boolean) as MissionMemo[];
}

function writeMission(mission: MissionMemo): void {
  fs.mkdirSync(MISSIONS_DIR, { recursive: true });
  fs.writeFileSync(path.join(MISSIONS_DIR, `${mission.id}.json`), JSON.stringify(mission, null, 2));
}

export function createMission(params: Partial<MissionMemo> & { target: string; task: string }): MissionMemo {
  const mission: MissionMemo = {
    id: params.id ?? randomUUID().slice(0, 8),
    source: params.source ?? 'orchestrator',
    target: params.target,
    status: 'pending',
    priority: params.priority ?? 'P1',
    depends_on: params.depends_on ?? [],
    task: params.task,
    context: params.context ?? { files: [], skills: [], tools: [] },
    definition_of_done: params.definition_of_done,
    artifacts: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  writeMission(mission);
  return mission;
}

export function updateMissionStatus(id: string, status: MissionMemo['status'], details?: { reason?: string; artifacts?: string[] }): void {
  const filePath = path.join(MISSIONS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) { console.error(`Mission ${id} not found`); return; }
  const mission = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as MissionMemo;
  mission.status = status;
  mission.updated_at = new Date().toISOString();
  if (details?.reason) mission.failure_reason = details.reason;
  if (details?.artifacts) mission.artifacts.push(...details.artifacts);
  writeMission(mission);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function statusIcon(status: MissionMemo['status']): string {
  return { pending: '⏳', active: '🔄', completed: '✅', failed: '❌', blocked: '🚫' }[status] ?? '?';
}

function priorityIcon(p: string): string {
  return { P0: '🔴', P1: '🟡', P2: '🟢' }[p] ?? '';
}

export function generateDashboard(): string {
  const missions = readMissions();
  const byStatus = (s: MissionMemo['status']) => missions.filter(m => m.status === s);

  const active = byStatus('active');
  const pending = byStatus('pending');
  const blocked = byStatus('blocked');
  const failed = byStatus('failed');
  const completed = byStatus('completed');

  const lines = [
    '# OmniRule Mission Dashboard',
    `> Updated: ${new Date().toISOString()}`,
    `> Total: ${missions.length} | Active: ${active.length} | Pending: ${pending.length} | Done: ${completed.length} | Failed: ${failed.length}`,
    '',
  ];

  if (active.length > 0) {
    lines.push('## 🔄 Active');
    active.forEach(m => lines.push(`- ${priorityIcon(m.priority)} \`${m.id}\` **${m.target}**: ${m.task}`));
    lines.push('');
  }

  if (blocked.length > 0) {
    lines.push('## 🚫 Blocked');
    blocked.forEach(m => lines.push(`- ${priorityIcon(m.priority)} \`${m.id}\` **${m.target}**: ${m.task}`));
    lines.push('');
  }

  if (pending.length > 0) {
    lines.push('## ⏳ Pending');
    pending.sort((a, b) => ['P0','P1','P2'].indexOf(a.priority) - ['P0','P1','P2'].indexOf(b.priority));
    pending.forEach(m => {
      const deps = m.depends_on.length > 0 ? ` _(waits: ${m.depends_on.join(', ')})_` : '';
      lines.push(`- ${priorityIcon(m.priority)} \`${m.id}\` **${m.target}**: ${m.task}${deps}`);
    });
    lines.push('');
  }

  if (failed.length > 0) {
    lines.push('## ❌ Failed');
    failed.forEach(m => lines.push(`- \`${m.id}\` **${m.target}**: ${m.task}\n  Reason: ${m.failure_reason ?? 'unknown'}`));
    lines.push('');
  }

  if (completed.length > 0) {
    lines.push('## ✅ Completed (last 5)');
    completed.slice(-5).forEach(m => lines.push(`- \`${m.id}\` **${m.target}**: ${m.task}`));
    lines.push('');
  }

  lines.push('---', '*Run `npm run tool:missions` to refresh*');

  return lines.join('\n');
}

function writeDashboard(): void {
  const md = generateDashboard();
  fs.mkdirSync(path.dirname(DASHBOARD_FILE), { recursive: true });
  fs.writeFileSync(DASHBOARD_FILE, md);
  console.log(`[Missions] Dashboard updated: .omnirule/DASHBOARD.md`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function printStatus(): void {
  const missions = readMissions();
  if (missions.length === 0) { console.log('[Missions] No missions found'); return; }
  console.log(`\n[Missions] ${missions.length} total\n`);
  for (const m of missions) {
    console.log(`  ${statusIcon(m.status)} ${m.id} [${m.priority}] ${m.target}: ${m.task.slice(0, 60)}`);
  }
  console.log('');
}

function clearCompleted(): void {
  const missions = readMissions();
  let count = 0;
  for (const m of missions) {
    if (m.status === 'completed') {
      fs.unlinkSync(path.join(MISSIONS_DIR, `${m.id}.json`));
      count++;
    }
  }
  console.log(`[Missions] Cleared ${count} completed mission(s)`);
}

if (process.argv[1]?.endsWith('mission-runner.ts')) {
  const cmd = process.argv[2] ?? 'dashboard';
  const arg = process.argv[3];

  switch (cmd) {
    case 'status': printStatus(); break;
    case 'complete': updateMissionStatus(arg, 'completed'); console.log(`✅ ${arg} marked complete`); break;
    case 'fail': updateMissionStatus(arg, 'failed', { reason: process.argv[4] }); console.log(`❌ ${arg} marked failed`); break;
    case 'clear': clearCompleted(); break;
    default: writeDashboard(); printStatus(); break;
  }
}
