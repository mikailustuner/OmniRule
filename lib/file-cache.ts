/**
 * LRU file state cache — ported from CldSRC/src/utils/fileStateCache.ts
 *
 * Normalizes all path keys, enforces max entry count and byte limit.
 * Used by tools that read files repeatedly within a session.
 */

import { normalize } from 'path';

export interface FileState {
  content: string;
  timestamp: number;
  /** True when only a partial view was cached (offset/limit read) */
  isPartialView?: boolean;
  offset?: number;
  limit?: number;
}

interface LRUEntry {
  key: string;
  value: FileState;
  size: number;
}

export class FileStateCache {
  private entries = new Map<string, LRUEntry>();
  private totalSize = 0;
  readonly maxEntries: number;
  readonly maxBytes: number;

  constructor(maxEntries = 100, maxBytes = 25 * 1024 * 1024) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
  }

  private normKey(key: string): string {
    return normalize(key);
  }

  private sizeOf(value: FileState): number {
    return Math.max(1, Buffer.byteLength(value.content, 'utf-8'));
  }

  private evict(): void {
    // Evict oldest (first in Map insertion order) until within limits
    for (const [k, entry] of this.entries) {
      if (this.entries.size <= this.maxEntries && this.totalSize <= this.maxBytes) break;
      this.totalSize -= entry.size;
      this.entries.delete(k);
    }
  }

  get(key: string): FileState | undefined {
    const nk = this.normKey(key);
    const entry = this.entries.get(nk);
    if (!entry) return undefined;
    // Move to end (most-recently-used)
    this.entries.delete(nk);
    this.entries.set(nk, entry);
    return entry.value;
  }

  set(key: string, value: FileState): this {
    const nk = this.normKey(key);
    const size = this.sizeOf(value);
    const existing = this.entries.get(nk);
    if (existing) {
      this.totalSize -= existing.size;
      this.entries.delete(nk);
    }
    this.entries.set(nk, { key: nk, value, size });
    this.totalSize += size;
    this.evict();
    return this;
  }

  has(key: string): boolean {
    return this.entries.has(this.normKey(key));
  }

  delete(key: string): boolean {
    const nk = this.normKey(key);
    const entry = this.entries.get(nk);
    if (!entry) return false;
    this.totalSize -= entry.size;
    return this.entries.delete(nk);
  }

  clear(): void {
    this.entries.clear();
    this.totalSize = 0;
  }

  get size(): number { return this.entries.size; }
  get calculatedSize(): number { return this.totalSize; }

  keys(): string[] {
    return [...this.entries.keys()];
  }

  entries(): Array<[string, FileState]> {
    return [...this.entries.values()].map(e => [e.key, e.value]);
  }

  /** Merge two caches, newer timestamps win. */
  static merge(a: FileStateCache, b: FileStateCache): FileStateCache {
    const merged = new FileStateCache(a.maxEntries, a.maxBytes);
    for (const [k, v] of a.entries()) merged.set(k, v);
    for (const [k, v] of b.entries()) {
      const existing = merged.get(k);
      if (!existing || v.timestamp > existing.timestamp) merged.set(k, v);
    }
    return merged;
  }
}

/** Singleton session-level file cache for tools */
export const sessionFileCache = new FileStateCache(200, 50 * 1024 * 1024);

/** Read-through helper: returns cached content or reads from disk */
export function cachedRead(
  filePath: string,
  readFn: (p: string) => string,
): string {
  const existing = sessionFileCache.get(filePath);
  if (existing) return existing.content;
  const content = readFn(filePath);
  sessionFileCache.set(filePath, { content, timestamp: Date.now() });
  return content;
}
