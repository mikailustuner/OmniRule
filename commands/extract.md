# Command: Extract — Frontend Design Extractor

Extracts a complete design system from any live URL using a real browser.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax, any AGENTS.md runner.

---

## Invocation

```
/extract <URL> [--pages /path1,/path2,/path3]
```

**Examples:**
```
/extract https://apple.com
/extract https://stripe.com --pages /,/pricing,/docs
/extract https://linear.app --pages /,/features,/changelog
```

---

## What Happens

1. Playwright (Chromium, headless) opens the URL
2. Full-page screenshots captured — desktop (1440px) and mobile (390px)
3. All computed CSS extracted from 800 DOM elements per page
4. Tokens deduplicated and structured
5. Output written to `.design/{domain}/`

---

## Output Structure

```
.design/
  {domain}/
    screenshots/
      {page}-desktop.png
      {page}-mobile.png
    tokens/
      colors.json       ← hex palette, bg/text/border breakdown
      typography.json   ← font families, sizes, weights, line-heights
      spacing.json      ← padding, margin, gap values
      effects.json      ← shadows, border-radius, blurs, transitions
      layout.json       ← max-widths, z-index scale, display modes
    DESIGN_RULES.md     ← human-readable design summary
    tailwind.config.js  ← ready-to-use Tailwind config with extracted tokens
```

---

## Agent Execution Protocol

When this command is invoked, the executing agent MUST:

1. Activate `style-architect` persona (load `agents/STYLE_AGENT.md`)
2. Load skills: `tailwind-expert`, `css-architecture`, `css-variables`, `responsive-design`
3. Run: `npm run tool:extract -- $ARGUMENTS`
4. Wait for extraction to complete
5. Read `.design/{domain}/DESIGN_RULES.md`
6. Present a structured summary:
   - Color palette (top 10 hex values)
   - Font families detected
   - Key spacing values
   - Notable effects (shadows, radii)
7. Ask: "Want me to apply this design system to your project?"

---

## Setup (first time only)

```bash
npm run tool:extract:install
```

This installs the Playwright Chromium browser.

---

## Underlying Tool

**Source:** `tools/frontend-extractor.ts`
**Direct run:** `npm run tool:extract -- <URL>`

---

*OmniRule Tool Catalog — tools/frontend-extractor.ts*
