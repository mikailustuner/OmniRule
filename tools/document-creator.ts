#!/usr/bin/env tsx
/**
 * OmniRule Document Creator
 *
 * Generates professional PDF (HTML→Playwright) and PPTX (pptxgenjs) documents
 * using IBM/McKinsey visual standards.
 *
 * Usage:
 *   npm run tool:document -- --type=pdf --title="Report" --input=content.md --output=report.pdf
 *   npm run tool:document -- --type=pptx --title="Deck" --input=content.md --output=slides.pptx
 *   npm run tool:document -- --type=pdf --title="Quick Brief" --output=brief.pdf  (prompts for content)
 */

import * as fs   from 'fs';
import * as path from 'path';

// ─── Theme ────────────────────────────────────────────────────────────────────

const THEME = {
  primary:  '#051C2C',
  accent:   '#0F62FE',
  accent2:  '#00B0FF',
  surface:  '#F4F4F4',
  border:   '#E0E0E0',
  text:     '#161616',
  muted:    '#6F6F6F',
  white:    '#FFFFFF',
  font:     "'IBM Plex Sans', 'Inter', system-ui, -apple-system, sans-serif",
};

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary:  ${THEME.primary};
      --accent:   ${THEME.accent};
      --accent2:  ${THEME.accent2};
      --surface:  ${THEME.surface};
      --border:   ${THEME.border};
      --text:     ${THEME.text};
      --muted:    ${THEME.muted};
    }

    @page {
      size: A4;
      margin: 20mm 25mm 22mm 25mm;
      counter-increment: page;
    }

    @page :first { margin: 0; }

    html, body {
      font-family: ${THEME.font};
      font-size: 11pt;
      color: var(--text);
      line-height: 1.55;
      background: #fff;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    /* ── Typography ── */
    h1 {
      font-size: 26pt; font-weight: 700; color: var(--primary);
      border-bottom: 3px solid var(--accent);
      padding-bottom: 10px; margin-bottom: 16px; margin-top: 0;
    }
    h2 {
      font-size: 16pt; font-weight: 600; color: var(--primary);
      margin-top: 28px; margin-bottom: 10px;
      break-before: page;
    }
    h2:first-of-type { break-before: avoid; }
    h3 {
      font-size: 12pt; font-weight: 600; color: var(--accent);
      margin-top: 18px; margin-bottom: 8px;
    }
    h4 {
      font-size: 11pt; font-weight: 600; color: var(--text);
      margin-top: 14px; margin-bottom: 6px;
    }
    p { margin-bottom: 10px; orphans: 3; widows: 3; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    a { color: var(--accent); text-decoration: none; }
    blockquote {
      border-left: 4px solid var(--accent); padding: 10px 16px;
      margin: 14px 0; background: var(--surface); break-inside: avoid;
      font-style: italic; color: var(--muted);
    }
    code {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      font-size: 9pt; background: var(--surface);
      padding: 1px 4px; border-radius: 2px;
    }
    pre {
      background: var(--surface); padding: 14px 16px; border-radius: 4px;
      font-size: 9pt; overflow: hidden; break-inside: avoid;
      border-left: 3px solid var(--accent); margin: 14px 0;
    }
    pre code { background: none; padding: 0; }
    @media print { pre { white-space: pre-wrap; word-break: break-all; } }

    /* ── Lists ── */
    ul, ol { padding-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 4px; }
    li::marker { color: var(--accent); }

    /* ── Tables ── */
    table {
      width: 100%; border-collapse: collapse; margin: 16px 0;
      break-inside: avoid; font-size: 10pt;
    }
    thead { background: var(--primary); color: #fff; }
    thead th {
      padding: 9px 12px; text-align: left; font-weight: 600;
      border: 1px solid var(--primary);
    }
    tbody td {
      padding: 8px 12px; border: 1px solid var(--border);
      vertical-align: top;
    }
    tbody tr:nth-child(even) { background: var(--surface); }
    td:last-child, th:last-child { }
    /* Right-align numeric columns */
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }

    /* ── Callout / Highlight boxes ── */
    .callout {
      background: var(--surface); border-left: 4px solid var(--accent);
      padding: 13px 16px; margin: 16px 0; break-inside: avoid;
    }
    .callout-title { font-weight: 600; color: var(--accent); margin-bottom: 4px; }

    .callout-warning { border-color: #FF832B; }
    .callout-warning .callout-title { color: #FF832B; }

    .callout-success { border-color: #198038; }
    .callout-success .callout-title { color: #198038; }

    /* ── KPI stat blocks ── */
    .kpi-row {
      display: flex; gap: 16px; margin: 16px 0; break-inside: avoid;
    }
    .kpi-block {
      flex: 1; border: 2px solid var(--accent); padding: 16px;
      text-align: center;
    }
    .kpi-value { font-size: 28pt; font-weight: 700; color: var(--accent); }
    .kpi-label { font-size: 9pt; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-delta { font-size: 10pt; font-weight: 600; color: #198038; }

    /* ── Images ── */
    img { max-width: 100%; height: auto; break-inside: avoid; }
    figure { break-inside: avoid; margin: 16px 0; }
    figcaption { font-size: 9pt; color: var(--muted); margin-top: 6px; }

    /* ── Page break utilities ── */
    .page-break  { break-before: page; }
    .no-break    { break-inside: avoid; }
    .keep-with   { break-after: avoid; }

    /* ── Cover page ── */
    .cover {
      width: 210mm; height: 297mm;
      display: flex; flex-direction: column;
      break-after: page; margin: 0 -25mm;
      position: relative;
    }
    .cover-header {
      background: var(--primary); color: #fff;
      padding: 28px 36px; display: flex;
      justify-content: space-between; align-items: center;
    }
    .cover-logo { font-size: 14pt; font-weight: 700; letter-spacing: 0.05em; }
    .cover-date { font-size: 9pt; color: rgba(255,255,255,0.6); }

    .cover-body { flex: 1; padding: 56px 36px 32px; }
    .cover-eyebrow {
      font-size: 9pt; font-weight: 600; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px;
    }
    .cover-title {
      font-size: 34pt; font-weight: 700; color: var(--primary);
      line-height: 1.15; margin-bottom: 16px; border-bottom: none; padding: 0;
    }
    .cover-subtitle { font-size: 14pt; color: var(--muted); line-height: 1.4; }

    .cover-footer {
      background: var(--surface); padding: 20px 36px;
      border-top: 4px solid var(--accent);
      display: flex; justify-content: space-between; align-items: center;
    }
    .cover-confidential {
      font-size: 8pt; font-weight: 600; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.1em;
    }
    .cover-client { font-size: 9pt; color: var(--muted); }

    /* ── Page footer (all pages except cover) ── */
    .doc-body {
      padding: 0;
    }

    hr {
      border: none; border-top: 1px solid var(--border); margin: 20px 0;
    }
  `;
}

function buildCoverPage(meta: DocMeta): string {
  return `
    <div class="cover">
      <div class="cover-header">
        <span class="cover-logo">${meta.org || 'OmniRule'}</span>
        <span class="cover-date">${meta.date}</span>
      </div>
      <div class="cover-body">
        ${meta.category ? `<div class="cover-eyebrow">${meta.category}</div>` : ''}
        <h1 class="cover-title">${meta.title}</h1>
        ${meta.subtitle ? `<p class="cover-subtitle">${meta.subtitle}</p>` : ''}
      </div>
      <div class="cover-footer">
        <span class="cover-confidential">Confidential</span>
        ${meta.client ? `<span class="cover-client">${meta.client}</span>` : ''}
      </div>
    </div>
  `;
}

function markdownToHTML(md: string): string {
  let html = md
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.slice(1, -1).split('|').map(c => c.trim());
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    })
    // Lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr>')
    // Paragraphs (double newline)
    .replace(/\n\n([^<])/g, '\n\n<p>$1')
    .replace(/([^>])\n\n/g, '$1</p>\n\n');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');

  // Wrap consecutive table rows in <table>
  html = html.replace(/(<tr>.*?<\/tr>(\n<tr>.*?<\/tr>)*)/gs, (match) => {
    const rows = match.trim().split('\n');
    if (rows.length < 2) return match;
    const [header, , ...body] = rows;
    const headerCells = header.replace(/<\/?tr>/g, '').replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
    const bodyRows = body.map(r => r).join('\n');
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  return html;
}

function buildHTMLDocument(meta: DocMeta, content: string): string {
  const bodyHTML = markdownToHTML(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <style>${buildCSS()}</style>
</head>
<body>
  ${buildCoverPage(meta)}
  <div class="doc-body">
    ${bodyHTML}
  </div>
</body>
</html>`;
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

async function generatePDF(html: string, outputPath: string): Promise<void> {
  let chromium: typeof import('playwright').chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('Playwright not installed. Run: npm run tool:extract:install');
  }

  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle' });

  await page.pdf({
    path:            outputPath,
    format:          'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width:100%; font-size:8pt; color:#6F6F6F;
                  font-family:'IBM Plex Sans',system-ui,sans-serif;
                  display:flex; justify-content:space-between;
                  padding: 0 25mm; box-sizing:border-box;">
        <span>${new Date().toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '20mm', right: '0', bottom: '14mm', left: '0' },
  });

  await browser.close();
}

// ─── PPTX Generation ──────────────────────────────────────────────────────────

interface SlideData {
  type:    'title' | 'content' | 'kpi' | 'bullets' | 'table' | 'section';
  title:   string;
  body?:   string;
  bullets?: string[];
  kpis?:   Array<{ value: string; label: string }>;
  rows?:   string[][];
}

function parseContentToSlides(content: string, presentationTitle: string): SlideData[] {
  const slides: SlideData[] = [];
  const lines = content.split('\n');

  // Title slide
  slides.push({ type: 'title', title: presentationTitle });

  let currentSlide: SlideData | null = null;
  const bodyLines: string[] = [];

  const flushSlide = () => {
    if (!currentSlide) return;
    const body = bodyLines.join('\n').trim();

    if (body.includes('KPI:') || body.includes('kpi:')) {
      currentSlide.type = 'kpi';
      currentSlide.kpis = body.split('\n')
        .filter(l => /KPI:/i.test(l))
        .map(l => {
          const m = l.match(/KPI:\s*([^|]+)\|?\s*Label:\s*(.+)/i);
          return m ? { value: m[1].trim(), label: m[2].trim() } : { value: l, label: '' };
        });
    } else if (body.startsWith('- ') || body.startsWith('* ')) {
      currentSlide.type = 'bullets';
      currentSlide.bullets = body.split('\n').filter(l => /^[-*] /.test(l)).map(l => l.replace(/^[-*] /, ''));
    } else if (body.includes('|')) {
      currentSlide.type = 'table';
      currentSlide.rows = body.split('\n')
        .filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/))
        .map(l => l.split('|').filter(Boolean).map(c => c.trim()));
    } else {
      currentSlide.type = 'content';
      currentSlide.body = body;
    }

    slides.push(currentSlide);
    bodyLines.length = 0;
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushSlide();
      currentSlide = { type: 'content', title: line.replace(/^## /, '').trim() };
    } else if (line.startsWith('### ')) {
      flushSlide();
      currentSlide = { type: 'section', title: line.replace(/^### /, '').trim() };
    } else if (currentSlide) {
      bodyLines.push(line);
    }
  }
  flushSlide();

  return slides;
}

async function generatePPTX(slides: SlideData[], outputPath: string, title: string): Promise<void> {
  let PptxGenJS: new () => any;
  try {
    const mod = await import('pptxgenjs');
    PptxGenJS = mod.default;
  } catch {
    throw new Error('pptxgenjs not installed. Run: npm install pptxgenjs');
  }

  const pptx = new PptxGenJS();
  pptx.layout  = 'LAYOUT_16x9';
  pptx.author  = 'OmniRule Document Creator';
  pptx.company = 'OmniRule';
  pptx.title   = title;

  const T = {
    primary:  '051C2C',
    accent:   '0F62FE',
    accent2:  '00B0FF',
    surface:  'F4F4F4',
    text:     '161616',
    muted:    '8D8D8D',
    white:    'FFFFFF',
    font:     'IBM Plex Sans',
  };

  const W = 10, H = 5.625;

  const addHeaderBar = (slide: any, label = '', pageNum = '') => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: W, h: 0.42,
      fill: { color: T.primary }, line: { color: T.primary },
    });
    if (label) {
      slide.addText(label.toUpperCase(), {
        x: 0.2, y: 0.04, w: 7, h: 0.34,
        fontSize: 7.5, color: T.white, bold: true, fontFace: T.font, valign: 'middle',
      });
    }
    if (pageNum) {
      slide.addText(pageNum, {
        x: 8.5, y: 0.04, w: 1.3, h: 0.34,
        fontSize: 7.5, color: T.muted, align: 'right', fontFace: T.font, valign: 'middle',
      });
    }
  };

  const total = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const sd   = slides[i]!;
    const slide = pptx.addSlide();
    const pg    = `${i + 1} / ${total}`;

    if (sd.type === 'title') {
      // Full-bleed cover
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: W, h: H,
        fill: { color: T.primary }, line: { color: T.primary },
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: H - 0.08, w: W, h: 0.08,
        fill: { color: T.accent }, line: { color: T.accent },
      });
      slide.addText(sd.title, {
        x: 0.8, y: 1.4, w: 8.4, h: 1.6,
        fontSize: 36, bold: true, color: T.white, fontFace: T.font,
        valign: 'middle',
      });
      if (sd.body) {
        slide.addText(sd.body, {
          x: 0.8, y: 3.1, w: 8.4, h: 0.7,
          fontSize: 14, color: T.accent2, fontFace: T.font,
        });
      }
      slide.addText(new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }), {
        x: 0.8, y: H - 0.45, w: 4, h: 0.3,
        fontSize: 8.5, color: T.muted, fontFace: T.font,
      });

    } else if (sd.type === 'section') {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.12, h: H,
        fill: { color: T.accent }, line: { color: T.accent },
      });
      slide.addText(sd.title, {
        x: 0.6, y: 1.8, w: 9.2, h: 1.5,
        fontSize: 28, bold: true, color: T.primary, fontFace: T.font, valign: 'middle',
      });

    } else if (sd.type === 'bullets') {
      addHeaderBar(slide, sd.title, pg);
      slide.addText(sd.title, {
        x: 0.4, y: 0.55, w: 9.2, h: 0.75,
        fontSize: 20, bold: true, color: T.primary, fontFace: T.font,
      });
      const bulletText = (sd.bullets || []).map(b => ({ text: b, options: { bullet: { code: '2022' } } }));
      slide.addText(bulletText, {
        x: 0.5, y: 1.4, w: 9, h: 3.8,
        fontSize: 13, color: T.text, fontFace: T.font,
        valign: 'top', paraSpaceAfter: 10,
      });

    } else if (sd.type === 'kpi') {
      addHeaderBar(slide, sd.title, pg);
      slide.addText(sd.title, {
        x: 0.4, y: 0.55, w: 9.2, h: 0.75,
        fontSize: 20, bold: true, color: T.primary, fontFace: T.font,
      });
      const kpis = sd.kpis || [];
      const colW = (W - 0.6) / Math.max(kpis.length, 1);
      kpis.forEach((kpi, k) => {
        const x = 0.3 + k * colW;
        slide.addShape(pptx.ShapeType.rect, {
          x, y: 1.6, w: colW - 0.3, h: 2.5,
          fill: { color: T.surface }, line: { color: T.accent, width: 2 },
        });
        slide.addText(kpi.value, {
          x, y: 1.8, w: colW - 0.3, h: 1.2,
          fontSize: 34, bold: true, color: T.accent,
          align: 'center', fontFace: T.font,
        });
        slide.addText(kpi.label, {
          x, y: 3.1, w: colW - 0.3, h: 0.7,
          fontSize: 10, color: T.muted,
          align: 'center', fontFace: T.font,
        });
      });

    } else if (sd.type === 'table' && sd.rows) {
      addHeaderBar(slide, sd.title, pg);
      slide.addText(sd.title, {
        x: 0.4, y: 0.55, w: 9.2, h: 0.75,
        fontSize: 20, bold: true, color: T.primary, fontFace: T.font,
      });
      const [headerRow, ...bodyRows] = sd.rows;
      const tableRows = [
        (headerRow || []).map(c => ({ text: c, options: { bold: true, color: T.white, fill: T.primary } })),
        ...bodyRows.map((row, ri) =>
          row.map(c => ({ text: c, options: { color: T.text, fill: ri % 2 === 0 ? T.surface : T.white } }))
        ),
      ];
      slide.addTable(tableRows, {
        x: 0.4, y: 1.45, w: 9.2,
        fontSize: 9.5, fontFace: T.font,
        border: { type: 'solid', pt: 0.5, color: 'E0E0E0' },
      });

    } else {
      // Generic content
      addHeaderBar(slide, sd.title, pg);
      slide.addText(sd.title, {
        x: 0.4, y: 0.55, w: 9.2, h: 0.75,
        fontSize: 20, bold: true, color: T.primary, fontFace: T.font,
      });
      if (sd.body) {
        slide.addText(sd.body, {
          x: 0.4, y: 1.45, w: 9.2, h: 3.8,
          fontSize: 12, color: T.text, fontFace: T.font,
          valign: 'top', wrap: true,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: outputPath });
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

interface DocMeta {
  title:     string;
  subtitle?: string;
  org?:      string;
  client?:   string;
  category?: string;
  date:      string;
}

const c = {
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

function arg(name: string): string | undefined {
  const args = process.argv.slice(2);
  const flag = args.find(a => a.startsWith(`--${name}=`));
  if (flag) return flag.split('=').slice(1).join('=');
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return undefined;
}

async function main() {
  const type     = (arg('type') ?? 'pdf') as 'pdf' | 'pptx';
  const title    = arg('title') ?? 'Untitled Document';
  const subtitle = arg('subtitle');
  const org      = arg('org') ?? 'OmniRule';
  const client   = arg('client');
  const category = arg('category');
  const inputPath= arg('input');
  const outputPath = arg('output') ?? (type === 'pdf' ? 'output.pdf' : 'output.pptx');

  const date = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  let content = '';
  if (inputPath) {
    const resolved = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
    if (!fs.existsSync(resolved)) {
      console.error(c.red(`Input file not found: ${inputPath}`));
      process.exit(1);
    }
    content = fs.readFileSync(resolved, 'utf-8');
  } else {
    // No input file — create a minimal placeholder so the tool doesn't fail
    content = `## Overview\n\nDocument generated on ${date}.\n`;
  }

  // Ensure output directory exists
  const outDir = path.dirname(path.resolve(outputPath));
  fs.mkdirSync(outDir, { recursive: true });

  const meta: DocMeta = { title, subtitle, org, client, category, date };

  console.log(`\n${c.bold('Document Creator')} ${c.dim(`[${type.toUpperCase()}]`)}\n`);
  console.log(`  ${c.dim('Title:  ')} ${title}`);
  console.log(`  ${c.dim('Output: ')} ${outputPath}`);
  if (inputPath) console.log(`  ${c.dim('Input:  ')} ${inputPath}`);
  console.log('');

  try {
    if (type === 'pdf') {
      process.stdout.write('  Building HTML… ');
      const html = buildHTMLDocument(meta, content);
      console.log(c.green('done'));

      process.stdout.write('  Rendering PDF via Playwright… ');
      await generatePDF(html, path.resolve(outputPath));
      console.log(c.green('done'));

    } else if (type === 'pptx') {
      process.stdout.write('  Parsing slides… ');
      const slides = parseContentToSlides(content, title);
      console.log(c.green(`${slides.length} slides`));

      process.stdout.write('  Building PPTX… ');
      await generatePPTX(slides, path.resolve(outputPath), title);
      console.log(c.green('done'));

    } else {
      console.error(c.red(`Unknown type: ${type}. Use --type=pdf or --type=pptx`));
      process.exit(1);
    }

    const stat = fs.statSync(path.resolve(outputPath));
    const kb   = (stat.size / 1024).toFixed(1);
    console.log(`\n  ${c.green('✓')} ${c.bold(outputPath)} ${c.dim(`(${kb} KB)`)}\n`);

  } catch (err: any) {
    console.error(`\n  ${c.red('✗')} ${err.message}\n`);
    process.exit(1);
  }
}

main();
