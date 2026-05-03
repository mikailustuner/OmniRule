#!/usr/bin/env tsx
/**
 * OmniRule Frontend Extractor
 *
 * Launches a real browser (Playwright), captures screenshots, extracts all
 * design tokens (colors, typography, spacing, shadows, radii), and writes
 * everything to .design/{domain}/.
 *
 * Usage:
 *   npm run tool:extract -- https://apple.com
 *   npm run tool:extract -- https://apple.com --pages /,/mac,/iphone
 */

import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

const ColorMapSchema = z.record(z.number());

export interface DesignTokens {
  colors: {
    backgrounds: string[];
    text: string[];
    borders: string[];
    all: string[];
    palette: Record<string, string>;
  };
  typography: {
    fontFamilies: string[];
    fontSizes: string[];
    fontWeights: string[];
    lineHeights: string[];
    letterSpacings: string[];
  };
  spacing: {
    paddings: string[];
    margins: string[];
    gaps: string[];
    all: string[];
  };
  effects: {
    borderRadii: string[];
    shadows: string[];
    opacities: string[];
    transitions: string[];
    blurs: string[];
  };
  layout: {
    maxWidths: string[];
    breakpoints: string[];
    zIndices: string[];
    displays: string[];
  };
}

export interface ExtractionResult {
  url: string;
  domain: string;
  timestamp: string;
  pages: string[];
  tokens: DesignTokens;
  outputDir: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function domainFrom(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/[^a-z0-9]/gi, '-');
  }
}

function unique(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))].sort();
}

function normalizeValue(v: string): string {
  return v.trim().replace(/\s+/g, ' ');
}

function isRealColor(c: string): boolean {
  if (!c || c === 'none' || c === 'transparent' || c === 'inherit' || c === 'initial') return false;
  return c.startsWith('rgb') || c.startsWith('#') || c.startsWith('hsl');
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match.map(Number);
  return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
}

function buildPalette(colors: string[]): Record<string, string> {
  const palette: Record<string, string> = {};
  const hex = colors.map(rgbToHex).filter(c => c.startsWith('#'));
  const unique_hex = [...new Set(hex)];
  unique_hex.slice(0, 30).forEach((c, i) => {
    palette[`color-${i + 1}`] = c;
  });
  return palette;
}

// ─── Page-level extraction (runs inside browser context) ─────────────────────

async function extractTokensFromPage(page: Page): Promise<Partial<DesignTokens>> {
  return page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const sample = all.slice(0, 800); // cap for performance

    const backgrounds: string[] = [];
    const textColors: string[] = [];
    const borderColors: string[] = [];
    const fontFamilies: string[] = [];
    const fontSizes: string[] = [];
    const fontWeights: string[] = [];
    const lineHeights: string[] = [];
    const letterSpacings: string[] = [];
    const paddings: Set<string> = new Set();
    const margins: Set<string> = new Set();
    const gaps: Set<string> = new Set();
    const borderRadii: Set<string> = new Set();
    const shadows: Set<string> = new Set();
    const transitions: Set<string> = new Set();
    const maxWidths: Set<string> = new Set();
    const zIndices: Set<string> = new Set();
    const displays: Set<string> = new Set();
    const blurs: Set<string> = new Set();

    for (const el of sample) {
      const s = window.getComputedStyle(el);

      const bg = s.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') backgrounds.push(bg);

      const color = s.color;
      if (color) textColors.push(color);

      const bc = s.borderColor;
      if (bc && bc !== 'rgba(0, 0, 0, 0)') borderColors.push(bc);

      const ff = s.fontFamily;
      if (ff) fontFamilies.push(ff.split(',')[0].replace(/['"]/g, '').trim());

      const fs_ = s.fontSize;
      if (fs_) fontSizes.push(fs_);

      const fw = s.fontWeight;
      if (fw) fontWeights.push(fw);

      const lh = s.lineHeight;
      if (lh && lh !== 'normal') lineHeights.push(lh);

      const ls = s.letterSpacing;
      if (ls && ls !== 'normal') letterSpacings.push(ls);

      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(p => {
        const v = s[p as any];
        if (v && v !== '0px') paddings.add(v);
      });

      ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(m => {
        const v = s[m as any];
        if (v && v !== '0px' && v !== 'auto') margins.add(v);
      });

      const gap = s.gap;
      if (gap && gap !== 'normal' && gap !== '0px') gaps.add(gap);

      const br = s.borderRadius;
      if (br && br !== '0px') borderRadii.add(br);

      const bs = s.boxShadow;
      if (bs && bs !== 'none') shadows.add(bs);

      const tr = s.transition;
      if (tr && tr !== 'none') transitions.add(tr.split(',')[0]);

      const mw = s.maxWidth;
      if (mw && mw !== 'none') maxWidths.add(mw);

      const zi = s.zIndex;
      if (zi && zi !== 'auto') zIndices.add(zi);

      const dp = s.display;
      if (dp) displays.add(dp);

      const bdf = s.backdropFilter;
      if (bdf && bdf !== 'none') blurs.add(bdf);
    }

    return {
      colors: {
        backgrounds: [...new Set(backgrounds)],
        text: [...new Set(textColors)],
        borders: [...new Set(borderColors)],
        all: [],
        palette: {},
      },
      typography: {
        fontFamilies: [...new Set(fontFamilies)],
        fontSizes: [...new Set(fontSizes)],
        fontWeights: [...new Set(fontWeights)],
        lineHeights: [...new Set(lineHeights)],
        letterSpacings: [...new Set(letterSpacings)],
      },
      spacing: {
        paddings: [...paddings],
        margins: [...margins],
        gaps: [...gaps],
        all: [],
      },
      effects: {
        borderRadii: [...borderRadii],
        shadows: [...shadows],
        transitions: [...transitions],
        opacities: [],
        blurs: [...blurs],
      },
      layout: {
        maxWidths: [...maxWidths],
        zIndices: [...zIndices],
        displays: [...displays],
        breakpoints: [],
      },
    };
  });
}

// ─── Merge tokens from multiple pages ────────────────────────────────────────

function mergeTokens(pages: Partial<DesignTokens>[]): DesignTokens {
  const merged: DesignTokens = {
    colors: { backgrounds: [], text: [], borders: [], all: [], palette: {} },
    typography: { fontFamilies: [], fontSizes: [], fontWeights: [], lineHeights: [], letterSpacings: [] },
    spacing: { paddings: [], margins: [], gaps: [], all: [] },
    effects: { borderRadii: [], shadows: [], opacities: [], transitions: [], blurs: [] },
    layout: { maxWidths: [], breakpoints: [], zIndices: [], displays: [] },
  };

  for (const p of pages) {
    if (!p) continue;
    merged.colors.backgrounds.push(...(p.colors?.backgrounds ?? []));
    merged.colors.text.push(...(p.colors?.text ?? []));
    merged.colors.borders.push(...(p.colors?.borders ?? []));
    merged.typography.fontFamilies.push(...(p.typography?.fontFamilies ?? []));
    merged.typography.fontSizes.push(...(p.typography?.fontSizes ?? []));
    merged.typography.fontWeights.push(...(p.typography?.fontWeights ?? []));
    merged.typography.lineHeights.push(...(p.typography?.lineHeights ?? []));
    merged.typography.letterSpacings.push(...(p.typography?.letterSpacings ?? []));
    merged.spacing.paddings.push(...(p.spacing?.paddings ?? []));
    merged.spacing.margins.push(...(p.spacing?.margins ?? []));
    merged.spacing.gaps.push(...(p.spacing?.gaps ?? []));
    merged.effects.borderRadii.push(...(p.effects?.borderRadii ?? []));
    merged.effects.shadows.push(...(p.effects?.shadows ?? []));
    merged.effects.transitions.push(...(p.effects?.transitions ?? []));
    merged.effects.blurs.push(...(p.effects?.blurs ?? []));
    merged.layout.maxWidths.push(...(p.layout?.maxWidths ?? []));
    merged.layout.zIndices.push(...(p.layout?.zIndices ?? []));
    merged.layout.displays.push(...(p.layout?.displays ?? []));
  }

  // Deduplicate and filter
  merged.colors.backgrounds = unique(merged.colors.backgrounds.filter(isRealColor));
  merged.colors.text = unique(merged.colors.text.filter(isRealColor));
  merged.colors.borders = unique(merged.colors.borders.filter(isRealColor));
  merged.colors.all = unique([
    ...merged.colors.backgrounds,
    ...merged.colors.text,
    ...merged.colors.borders,
  ]);
  merged.colors.palette = buildPalette(merged.colors.all);

  merged.typography.fontFamilies = unique(merged.typography.fontFamilies).slice(0, 10);
  merged.typography.fontSizes = unique(merged.typography.fontSizes).slice(0, 20);
  merged.typography.fontWeights = unique(merged.typography.fontWeights);
  merged.typography.lineHeights = unique(merged.typography.lineHeights).slice(0, 15);
  merged.typography.letterSpacings = unique(merged.typography.letterSpacings).slice(0, 10);

  merged.spacing.paddings = unique(merged.spacing.paddings).slice(0, 20);
  merged.spacing.margins = unique(merged.spacing.margins).slice(0, 20);
  merged.spacing.gaps = unique(merged.spacing.gaps).slice(0, 15);
  merged.spacing.all = unique([
    ...merged.spacing.paddings,
    ...merged.spacing.margins,
    ...merged.spacing.gaps,
  ]).slice(0, 30);

  merged.effects.borderRadii = unique(merged.effects.borderRadii).slice(0, 15);
  merged.effects.shadows = unique(merged.effects.shadows).slice(0, 10);
  merged.effects.transitions = unique(merged.effects.transitions).slice(0, 10);
  merged.effects.blurs = unique(merged.effects.blurs).slice(0, 8);

  merged.layout.maxWidths = unique(merged.layout.maxWidths).slice(0, 10);
  merged.layout.zIndices = unique(merged.layout.zIndices).slice(0, 10);
  merged.layout.displays = unique(merged.layout.displays);

  return merged;
}

// ─── Output writers ───────────────────────────────────────────────────────────

function writeTailwindConfig(tokens: DesignTokens, dir: string): void {
  const colors: Record<string, string> = {};
  Object.entries(tokens.colors.palette).forEach(([k, v]) => {
    colors[k] = v;
  });

  const spacing: Record<string, string> = {};
  tokens.spacing.all.forEach((v, i) => {
    spacing[`space-${i + 1}`] = v;
  });

  const fontFamily: Record<string, string[]> = {};
  tokens.typography.fontFamilies.forEach((f, i) => {
    fontFamily[`font-${i + 1}`] = [f, 'sans-serif'];
  });

  const borderRadius: Record<string, string> = {};
  tokens.effects.borderRadii.forEach((r, i) => {
    borderRadius[`radius-${i + 1}`] = r;
  });

  const boxShadow: Record<string, string> = {};
  tokens.effects.shadows.slice(0, 5).forEach((s, i) => {
    boxShadow[`shadow-${i + 1}`] = s;
  });

  const config = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      fontFamily: ${JSON.stringify(fontFamily, null, 6)},
      spacing: ${JSON.stringify(spacing, null, 6)},
      borderRadius: ${JSON.stringify(borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(boxShadow, null, 6)},
    },
  },
  plugins: [],
};
`;
  fs.writeFileSync(path.join(dir, 'tailwind.config.js'), config);
}

function writeDesignRules(tokens: DesignTokens, url: string, dir: string): void {
  const md = `# Design Rules — ${url}
> Auto-extracted by OmniRule Frontend Extractor
> Generated: ${new Date().toISOString()}

---

## Color Palette

| Token | Hex |
|---|---|
${Object.entries(tokens.colors.palette).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}

### Background Colors (${tokens.colors.backgrounds.length} unique)
\`\`\`
${tokens.colors.backgrounds.slice(0, 20).join('\n')}
\`\`\`

### Text Colors (${tokens.colors.text.length} unique)
\`\`\`
${tokens.colors.text.slice(0, 15).join('\n')}
\`\`\`

---

## Typography

### Font Families
${tokens.typography.fontFamilies.map(f => `- \`${f}\``).join('\n')}

### Font Sizes
${tokens.typography.fontSizes.map(f => `- \`${f}\``).join('\n')}

### Font Weights
${tokens.typography.fontWeights.map(f => `- \`${f}\``).join('\n')}

### Line Heights
${tokens.typography.lineHeights.map(f => `- \`${f}\``).join('\n')}

---

## Spacing System

### Padding Values
${tokens.spacing.paddings.map(v => `- \`${v}\``).join('\n')}

### Gap Values
${tokens.spacing.gaps.map(v => `- \`${v}\``).join('\n')}

---

## Effects

### Border Radii
${tokens.effects.borderRadii.map(v => `- \`${v}\``).join('\n')}

### Box Shadows
${tokens.effects.shadows.map(v => `- \`${v}\``).join('\n')}

### Backdrop Blurs
${tokens.effects.blurs.map(v => `- \`${v}\``).join('\n')}

---

## Layout

### Max Widths
${tokens.layout.maxWidths.map(v => `- \`${v}\``).join('\n')}

### Z-Index Scale
${tokens.layout.zIndices.map(v => `- \`${v}\``).join('\n')}

---
*OmniRule — Style Architect Agent*
`;
  fs.writeFileSync(path.join(dir, 'DESIGN_RULES.md'), md);
}

function writeTokensJson(tokens: DesignTokens, dir: string): void {
  const tokensDir = path.join(dir, 'tokens');
  fs.mkdirSync(tokensDir, { recursive: true });

  fs.writeFileSync(path.join(tokensDir, 'colors.json'), JSON.stringify(tokens.colors, null, 2));
  fs.writeFileSync(path.join(tokensDir, 'typography.json'), JSON.stringify(tokens.typography, null, 2));
  fs.writeFileSync(path.join(tokensDir, 'spacing.json'), JSON.stringify(tokens.spacing, null, 2));
  fs.writeFileSync(path.join(tokensDir, 'effects.json'), JSON.stringify(tokens.effects, null, 2));
  fs.writeFileSync(path.join(tokensDir, 'layout.json'), JSON.stringify(tokens.layout, null, 2));
}

// ─── Main extraction flow ─────────────────────────────────────────────────────

export async function extractDesign(
  url: string,
  options: { extraPages?: string[]; outputRoot?: string } = {}
): Promise<ExtractionResult> {
  const domain = domainFrom(url);
  const outputRoot = options.outputRoot ?? path.join(process.cwd(), '.design');
  const outputDir = path.join(outputRoot, domain);
  const screenshotsDir = path.join(outputDir, 'screenshots');

  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log(`\n[OmniRule] Extracting design from: ${url}`);
  console.log(`[OmniRule] Output: ${outputDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const allPageTokens: Partial<DesignTokens>[] = [];
  const visitedPages: string[] = [];

  const pagesToVisit = [url, ...(options.extraPages ?? [])];

  for (const pageUrl of pagesToVisit) {
    console.log(`  → Visiting: ${pageUrl}`);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);

      // Desktop screenshot
      const slug = pageUrl.replace(/[^a-z0-9]/gi, '-').slice(-40);
      const screenshotPath = path.join(screenshotsDir, `${slug}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`    ✓ Screenshot saved: ${path.basename(screenshotPath)}`);

      // Mobile screenshot
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      const mobileScreenshotPath = path.join(screenshotsDir, `${slug}-mobile.png`);
      await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
      console.log(`    ✓ Mobile screenshot saved`);

      // Extract tokens
      const tokens = await extractTokensFromPage(page);
      allPageTokens.push(tokens);
      visitedPages.push(pageUrl);
    } catch (err) {
      console.warn(`    ✗ Failed to process ${pageUrl}:`, (err as Error).message);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  const tokens = mergeTokens(allPageTokens);

  // Write all output files
  writeTokensJson(tokens, outputDir);
  writeTailwindConfig(tokens, outputDir);
  writeDesignRules(tokens, url, outputDir);

  console.log(`\n[OmniRule] Design extraction complete!`);
  console.log(`  Colors:      ${tokens.colors.all.length} unique`);
  console.log(`  Fonts:       ${tokens.typography.fontFamilies.length} families, ${tokens.typography.fontSizes.length} sizes`);
  console.log(`  Spacing:     ${tokens.spacing.all.length} values`);
  console.log(`  Shadows:     ${tokens.effects.shadows.length} values`);
  console.log(`  Screenshots: ${visitedPages.length * 2} captured`);
  console.log(`  Output:      ${outputDir}\n`);

  return {
    url,
    domain,
    timestamp: new Date().toISOString(),
    pages: visitedPages,
    tokens,
    outputDir,
  };
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('frontend-extractor.ts')) {
  const args = process.argv.slice(2);
  const url = args.find(a => a.startsWith('http'));
  const pagesIdx = args.indexOf('--pages');
  const extraPages = pagesIdx !== -1
    ? args[pagesIdx + 1].split(',').map(p => {
        try { return new URL(p).href; } catch { return new URL(p, url).href; }
      })
    : [];

  if (!url) {
    console.error('Usage: npm run tool:extract -- <URL> [--pages /path1,/path2]');
    process.exit(1);
  }

  extractDesign(url, { extraPages }).catch(err => {
    console.error('[OmniRule] Extraction failed:', err);
    process.exit(1);
  });
}
