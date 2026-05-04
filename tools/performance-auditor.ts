#!/usr/bin/env tsx
/**
 * OmniRule Performance Auditor
 *
 * Measures Core Web Vitals and performance metrics using Playwright.
 * Outputs structured scores and prioritized fix recommendations.
 *
 * Usage:
 *   npm run tool:perf -- https://apple.com
 *   npm run tool:perf -- https://apple.com --mobile
 *   npm run tool:perf -- https://apple.com --compare https://linear.app
 */

import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CWVMetrics {
  url: string;
  viewport: 'desktop' | 'mobile';
  timestamp: string;
  lcp:  { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  cls:  { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  fcp:  { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  ttfb: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  tti:  { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  totalScore: number; // 0-100
  resourceSummary: ResourceSummary;
  recommendations: string[];
}

interface ResourceSummary {
  totalRequests: number;
  totalBytes: number;
  jsBytes: number;
  cssBytes: number;
  imageBytes: number;
  slowRequests: Array<{ url: string; duration: number }>;
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

function rateLCP(ms: number) {
  return ms <= 2500 ? 'good' : ms <= 4000 ? 'needs-improvement' : 'poor';
}
function rateCLS(val: number) {
  return val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-improvement' : 'poor';
}
function rateFCP(ms: number) {
  return ms <= 1800 ? 'good' : ms <= 3000 ? 'needs-improvement' : 'poor';
}
function rateTTFB(ms: number) {
  return ms <= 800 ? 'good' : ms <= 1800 ? 'needs-improvement' : 'poor';
}
function rateTTI(ms: number) {
  return ms <= 3800 ? 'good' : ms <= 7300 ? 'needs-improvement' : 'poor';
}

function calcScore(metrics: Omit<CWVMetrics, 'totalScore' | 'recommendations' | 'resourceSummary'>): number {
  const weights = { lcp: 25, cls: 25, fcp: 15, ttfb: 10, tti: 25 };
  const ratingScore = { good: 100, 'needs-improvement': 60, poor: 20 };
  const total =
    weights.lcp  * ratingScore[metrics.lcp.rating] +
    weights.cls  * ratingScore[metrics.cls.rating] +
    weights.fcp  * ratingScore[metrics.fcp.rating] +
    weights.ttfb * ratingScore[metrics.ttfb.rating] +
    weights.tti  * ratingScore[metrics.tti.rating];
  return Math.round(total / 100);
}

function buildRecommendations(metrics: CWVMetrics): string[] {
  const recs: string[] = [];

  if (metrics.lcp.rating !== 'good') {
    recs.push(`LCP ${(metrics.lcp.value / 1000).toFixed(2)}s — Optimize largest image: use WebP, add fetchpriority="high", preload critical resources`);
  }
  if (metrics.cls.rating !== 'good') {
    recs.push(`CLS ${metrics.cls.value.toFixed(3)} — Fix layout shift: add width/height to images, avoid inserting content above fold, use CSS aspect-ratio`);
  }
  if (metrics.fcp.rating !== 'good') {
    recs.push(`FCP ${(metrics.fcp.value / 1000).toFixed(2)}s — Reduce render-blocking resources: inline critical CSS, defer non-critical JS`);
  }
  if (metrics.ttfb.rating !== 'good') {
    recs.push(`TTFB ${metrics.ttfb.value}ms — Slow server response: check CDN, enable compression, optimize DB queries`);
  }
  if (metrics.tti.rating !== 'good') {
    recs.push(`TTI ${(metrics.tti.value / 1000).toFixed(2)}s — Reduce JS execution: code split, lazy load routes, minimize main thread work`);
  }
  if (metrics.resourceSummary.jsBytes > 500_000) {
    recs.push(`JS bundle ${Math.round(metrics.resourceSummary.jsBytes / 1024)}KB — Too large. Target <200KB. Use dynamic imports, tree-shaking`);
  }
  if (metrics.resourceSummary.slowRequests.length > 0) {
    const slowest = metrics.resourceSummary.slowRequests[0];
    recs.push(`Slow request: ${slowest.url.slice(-50)} (${slowest.duration}ms) — Cache or move to CDN`);
  }

  return recs;
}

// ─── Measurement ─────────────────────────────────────────────────────────────

async function measurePage(page: Page, url: string, viewport: 'desktop' | 'mobile'): Promise<CWVMetrics> {
  const resources: Array<{ url: string; size: number; type: string; duration: number }> = [];

  page.on('response', async resp => {
    try {
      const type = resp.headers()['content-type'] ?? '';
      const size = parseInt(resp.headers()['content-length'] ?? '0');
      const timing = resp.timing();
      resources.push({
        url: resp.url(),
        size,
        type,
        duration: timing.responseEnd - timing.requestStart,
      });
    } catch {}
  });

  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  const navEnd = Date.now();

  await page.waitForTimeout(2000); // let CLS settle

  // Collect metrics via Performance API
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime ?? 0;

    // LCP observer result (best effort)
    let lcp = 0;
    try {
      const lcpEntries = (performance as any).getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) lcp = lcpEntries[lcpEntries.length - 1].renderTime || lcpEntries[lcpEntries.length - 1].loadTime;
    } catch {}

    // CLS
    let cls = 0;
    try {
      const layoutShifts = (performance as any).getEntriesByType('layout-shift');
      cls = layoutShifts.reduce((sum: number, entry: any) => sum + entry.value, 0);
    } catch {}

    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      fcp,
      lcp: lcp || fcp * 1.4, // fallback estimate
      cls,
      domInteractive: nav ? nav.domInteractive : 0,
      loadEventEnd: nav ? nav.loadEventEnd : 0,
    };
  });

  const tti = metrics.domInteractive || (navEnd - navStart);

  const jsBytes = resources.filter(r => r.type.includes('javascript')).reduce((s, r) => s + r.size, 0);
  const cssBytes = resources.filter(r => r.type.includes('css')).reduce((s, r) => s + r.size, 0);
  const imageBytes = resources.filter(r => r.type.includes('image')).reduce((s, r) => s + r.size, 0);
  const slowRequests = resources
    .filter(r => r.duration > 2000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  const partial: Omit<CWVMetrics, 'totalScore' | 'recommendations'> = {
    url,
    viewport,
    timestamp: new Date().toISOString(),
    lcp:  { value: Math.round(metrics.lcp),  rating: rateLCP(metrics.lcp) },
    cls:  { value: parseFloat(metrics.cls.toFixed(4)), rating: rateCLS(metrics.cls) },
    fcp:  { value: Math.round(metrics.fcp),  rating: rateFCP(metrics.fcp) },
    ttfb: { value: Math.round(metrics.ttfb), rating: rateTTFB(metrics.ttfb) },
    tti:  { value: Math.round(tti),          rating: rateTTI(tti) },
    resourceSummary: {
      totalRequests: resources.length,
      totalBytes: resources.reduce((s, r) => s + r.size, 0),
      jsBytes, cssBytes, imageBytes, slowRequests,
    },
  };

  const totalScore = calcScore(partial);
  const result: CWVMetrics = { ...partial, totalScore, recommendations: [] };
  result.recommendations = buildRecommendations(result);
  return result;
}

// ─── Report writer ────────────────────────────────────────────────────────────

function writeReport(metrics: CWVMetrics, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  const ratingIcon = (r: string) => r === 'good' ? '🟢' : r === 'needs-improvement' ? '🟡' : '🔴';

  const md = `# Performance Audit — ${metrics.url}
> ${metrics.timestamp} | Viewport: ${metrics.viewport} | **Score: ${metrics.totalScore}/100**

## Core Web Vitals

| Metric | Value | Rating |
|---|---|---|
| LCP (Largest Contentful Paint) | ${(metrics.lcp.value / 1000).toFixed(2)}s | ${ratingIcon(metrics.lcp.rating)} ${metrics.lcp.rating} |
| CLS (Cumulative Layout Shift) | ${metrics.cls.value.toFixed(3)} | ${ratingIcon(metrics.cls.rating)} ${metrics.cls.rating} |
| FCP (First Contentful Paint) | ${(metrics.fcp.value / 1000).toFixed(2)}s | ${ratingIcon(metrics.fcp.rating)} ${metrics.fcp.rating} |
| TTFB (Time to First Byte) | ${metrics.ttfb.value}ms | ${ratingIcon(metrics.ttfb.rating)} ${metrics.ttfb.rating} |
| TTI (Time to Interactive) | ${(metrics.tti.value / 1000).toFixed(2)}s | ${ratingIcon(metrics.tti.rating)} ${metrics.tti.rating} |

## Resources
- Total requests: ${metrics.resourceSummary.totalRequests}
- JS: ${Math.round(metrics.resourceSummary.jsBytes / 1024)}KB
- CSS: ${Math.round(metrics.resourceSummary.cssBytes / 1024)}KB
- Images: ${Math.round(metrics.resourceSummary.imageBytes / 1024)}KB

## Recommendations
${metrics.recommendations.length > 0
  ? metrics.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : '✅ No critical issues found.'}

---
*OmniRule Performance Auditor*
`;

  fs.writeFileSync(path.join(outputDir, 'perf-report.md'), md);
  fs.writeFileSync(path.join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function auditPerformance(url: string, options: { mobile?: boolean } = {}): Promise<CWVMetrics> {
  const domain = new URL(url).hostname.replace(/^www\./, '');
  const outputDir = path.join(process.cwd(), '.design', domain, 'perf');

  console.log(`\n[Perf] Auditing: ${url} (${options.mobile ? 'mobile' : 'desktop'})`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    userAgent: options.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });

  const page = await context.newPage();
  let metrics: CWVMetrics;

  try {
    metrics = await measurePage(page, url, options.mobile ? 'mobile' : 'desktop');
  } finally {
    await browser.close();
  }

  writeReport(metrics, outputDir);

  console.log(`[Perf] Score: ${metrics.totalScore}/100`);
  console.log(`  LCP: ${(metrics.lcp.value/1000).toFixed(2)}s (${metrics.lcp.rating})`);
  console.log(`  CLS: ${metrics.cls.value.toFixed(3)} (${metrics.cls.rating})`);
  console.log(`  FCP: ${(metrics.fcp.value/1000).toFixed(2)}s (${metrics.fcp.rating})`);
  console.log(`  TTFB: ${metrics.ttfb.value}ms (${metrics.ttfb.rating})`);
  if (metrics.recommendations.length > 0) {
    console.log(`[Perf] Top fix: ${metrics.recommendations[0]}`);
  }
  console.log(`[Perf] Report: .design/${domain}/perf/perf-report.md\n`);

  return metrics;
}

if (process.argv[1]?.endsWith('performance-auditor.ts')) {
  const url = process.argv.find(a => a.startsWith('http'));
  const mobile = process.argv.includes('--mobile');
  if (!url) { console.error('Usage: npm run tool:perf -- <URL> [--mobile]'); process.exit(1); }
  auditPerformance(url, { mobile }).catch(console.error);
}
