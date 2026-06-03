#!/usr/bin/env node
/**
 * OmniRule Mission Cleanup
 * Removes completed/failed missions older than TTL from .omnirule/missions/
 * Runs as part of the Stop hook (after quality-gate).
 *
 * Rules:
 *   - completed missions: delete after COMPLETED_TTL_MS (default 1 hour)
 *   - failed missions:    delete after FAILED_TTL_MS    (default 24 hours)
 *   - pending/active:     never deleted automatically
 *   - cap total missions: if > MAX_MISSIONS, evict oldest completed/failed first
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const MISSIONS_DIR      = path.join(process.cwd(), '.omnirule', 'missions');
const COMPLETED_TTL_MS  = 60 * 60 * 1000;          // 1 hour
const FAILED_TTL_MS     = 24 * 60 * 60 * 1000;     // 24 hours
const MAX_MISSIONS      = 50;

function main() {
  if (!fs.existsSync(MISSIONS_DIR)) {
    process.stdout.write(JSON.stringify({ status: 'skipped', message: 'No missions directory' }));
    return;
  }

  const files = fs.readdirSync(MISSIONS_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    process.stdout.write(JSON.stringify({ status: 'ok', cleaned: 0 }));
    return;
  }

  const now     = Date.now();
  let   cleaned = 0;
  const kept    = [];

  for (const file of files) {
    const filePath = path.join(MISSIONS_DIR, file);
    let memo;
    try {
      memo = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      // Unreadable file — remove it
      fs.unlinkSync(filePath);
      cleaned++;
      continue;
    }

    const status    = memo.status ?? 'unknown';
    const createdAt = memo.createdAt ? new Date(memo.createdAt).getTime() : 0;
    const age       = now - createdAt;

    if (status === 'completed' && age > COMPLETED_TTL_MS) {
      fs.unlinkSync(filePath);
      cleaned++;
    } else if (status === 'failed' && age > FAILED_TTL_MS) {
      fs.unlinkSync(filePath);
      cleaned++;
    } else {
      kept.push({ file, status, createdAt, age });
    }
  }

  // Hard cap: if still over MAX_MISSIONS, evict oldest completed/failed
  if (kept.length > MAX_MISSIONS) {
    const evictable = kept
      .filter(m => m.status === 'completed' || m.status === 'failed')
      .sort((a, b) => a.age - b.age); // oldest first

    const toEvict = evictable.slice(0, kept.length - MAX_MISSIONS);
    for (const m of toEvict) {
      try {
        fs.unlinkSync(path.join(MISSIONS_DIR, m.file));
        cleaned++;
      } catch { /* already gone */ }
    }
  }

  process.stdout.write(JSON.stringify({
    status:  'ok',
    cleaned,
    remaining: Math.max(0, kept.length - cleaned),
    message: cleaned > 0
      ? `Mission cleanup: removed ${cleaned} stale memo(s)`
      : 'Mission cleanup: nothing to remove',
  }));
}

main();
