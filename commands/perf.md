# Command: Perf — Performance Audit

Measure and analyze web performance metrics using a real browser.
Works in: Claude Code, OpenCode, Codex, Antigravity, Minimax.

---

## Invocation

```
/perf https://apple.com
/perf https://myapp.com --mobile
/perf https://myapp.com --compare https://competitor.com
/perf src/               — static analysis of perf anti-patterns in code
```

---

## Metrics Captured

### Core Web Vitals
| Metric | Good | Needs Work | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | <2.5s | 2.5-4s | >4s |
| CLS (Cumulative Layout Shift) | <0.1 | 0.1-0.25 | >0.25 |
| INP (Interaction to Next Paint) | <200ms | 200-500ms | >500ms |
| TTFB (Time to First Byte) | <800ms | 800ms-1.8s | >1.8s |
| FCP (First Contentful Paint) | <1.8s | 1.8-3s | >3s |

### Bundle Analysis
- Total JS size
- Largest dependencies
- Unused CSS percentage
- Image optimization score

---

## Output

```
.design/{domain}/
  perf/
    metrics.json       — raw CWV data
    perf-report.md     — human-readable analysis
    recommendations.md — prioritized fixes
```

---

## Agent Execution Protocol

1. Activate `frontend-ops` agent, load `web-performance` + `bundle-optimization` skills
2. Run `npm run tool:perf -- $ARGUMENTS`
3. Read `.design/{domain}/perf/metrics.json`
4. For each failing metric, provide specific fix with code example
5. If `--compare`: diff two sites and highlight gaps

---

*OmniRule — tools/performance-auditor.ts + agents/FRONTEND_OPS_AGENT.md*
