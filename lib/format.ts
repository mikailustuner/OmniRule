/**
 * Pure display formatters — ported and adapted from CldSRC/src/utils/format.ts
 * Zero dependencies. Safe to import anywhere.
 */

/**
 * Formats a byte count to a human-readable string.
 * formatFileSize(1536) → "1.5KB"
 */
export function formatFileSize(sizeInBytes: number): string {
  const kb = sizeInBytes / 1024;
  if (kb < 1) return `${sizeInBytes} bytes`;
  if (kb < 1024) return `${kb.toFixed(1).replace(/\.0$/, '')}KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1).replace(/\.0$/, '')}MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1).replace(/\.0$/, '')}GB`;
}

/**
 * Formats milliseconds as a compact duration string.
 * formatDuration(90000) → "1m 30s"
 * formatDuration(500)   → "0s"
 */
export function formatDuration(
  ms: number,
  options: { hideTrailingZeros?: boolean; mostSignificantOnly?: boolean } = {},
): string {
  if (ms < 60_000) {
    if (ms === 0) return '0s';
    if (ms < 1) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 1000)}s`;
  }

  let days    = Math.floor(ms / 86_400_000);
  let hours   = Math.floor((ms % 86_400_000) / 3_600_000);
  let minutes = Math.floor((ms % 3_600_000) / 60_000);
  let seconds = Math.round((ms % 60_000) / 1_000);

  if (seconds === 60) { seconds = 0; minutes++; }
  if (minutes === 60) { minutes = 0; hours++; }
  if (hours   === 24) { hours = 0; days++; }

  const hide = options.hideTrailingZeros;

  if (options.mostSignificantOnly) {
    if (days    > 0) return `${days}d`;
    if (hours   > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  if (days > 0) {
    if (hide && hours === 0 && minutes === 0) return `${days}d`;
    if (hide && minutes === 0) return `${days}d ${hours}h`;
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    if (hide && minutes === 0 && seconds === 0) return `${hours}h`;
    if (hide && seconds === 0) return `${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    if (hide && seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Compact number formatter with SI suffixes.
 * formatNumber(1321) → "1.3k"
 * formatNumber(900)  → "900"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/**
 * Like formatNumber but strips trailing .0 more aggressively.
 * formatTokens(4000) → "4k"
 */
export function formatTokens(count: number): string {
  return formatNumber(count).replace('.0', '');
}

/**
 * Formats cost in USD.
 * formatCost(0.0012) → "$0.0012"
 * formatCost(1.5)    → "$1.50"
 */
export function formatCost(cost: number, maxDecimalPlaces = 4): string {
  if (cost === 0) return '$0.00';
  if (cost > 0.5) return `$${(Math.round(cost * 100) / 100).toFixed(2)}`;
  return `$${cost.toFixed(maxDecimalPlaces)}`;
}

/**
 * Formats a relative time from a date.
 * formatRelativeTime(new Date(Date.now() - 3600000)) → "1h ago"
 */
export function formatRelativeTime(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.abs(Math.trunc(diffMs / 1000));
  const past = diffMs >= 0;

  const intervals = [
    { label: 'y',  seconds: 31_536_000 },
    { label: 'mo', seconds: 2_592_000 },
    { label: 'w',  seconds: 604_800 },
    { label: 'd',  seconds: 86_400 },
    { label: 'h',  seconds: 3_600 },
    { label: 'm',  seconds: 60 },
    { label: 's',  seconds: 1 },
  ];

  for (const { label, seconds } of intervals) {
    if (diffSec >= seconds) {
      const value = Math.trunc(diffSec / seconds);
      return past ? `${value}${label} ago` : `in ${value}${label}`;
    }
  }

  return past ? 'just now' : 'now';
}

/**
 * Pads a number to a fixed width with leading zeros.
 * padNumber(3, 2) → "03"
 */
export function padNumber(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/**
 * Formats a Date as a short timestamp string.
 * formatTimestamp(new Date()) → "2026-05-04 14:32:07"
 */
export function formatTimestamp(date = new Date()): string {
  const Y = date.getFullYear();
  const M = padNumber(date.getMonth() + 1, 2);
  const D = padNumber(date.getDate(), 2);
  const h = padNumber(date.getHours(), 2);
  const m = padNumber(date.getMinutes(), 2);
  const s = padNumber(date.getSeconds(), 2);
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

/**
 * Truncates a string to maxLen, appending ellipsis if needed.
 */
export function truncate(s: string, maxLen: number, ellipsis = '…'): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - ellipsis.length) + ellipsis;
}

/**
 * Truncates a file path from the middle.
 * truncatePathMiddle('/very/long/path/to/file.ts', 20) → "/very/…/file.ts"
 */
export function truncatePathMiddle(p: string, maxLen: number): string {
  if (p.length <= maxLen) return p;
  const half = Math.floor((maxLen - 3) / 2);
  return p.slice(0, half) + '…' + p.slice(-(maxLen - half - 1));
}
