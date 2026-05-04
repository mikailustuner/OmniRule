---
name: data-visualization
description: "Chart types, library selection, responsive design, and accessibility patterns for data visualization." 
triggers:
  extensions: [".tsx", ".ts"]
  keywords: ["chart", "graph", "d3", "recharts", "nivo", "echarts", "visualization", "plot", "dashboard"]
auto_load_when: "Building charts or data visualizations"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# Data Visualization Patterns

## 1. Chart Type Selection

```
Which chart to use?

Comparison:
├── Bar chart: Categorical comparisons, simple
├── Column chart: Time-based comparisons
├── Grouped/stacked: Multi-variable comparison
└── Bullet chart: Target vs actual

Distribution:
├── Histogram: Binned frequency
├── Box plot: Quartiles, outliers
├── Density plot: Continuous distribution
└── Violin plot: Distribution shape

Composition:
├── Pie/donut: Parts of whole (<6 segments)
├── Stacked area: Over time, trend emphasis
├── Treemap: Hierarchical composition
└── Sankey: Flow between states

Relationship:
├── Scatter: Two continuous variables
├── Bubble: Three continuous variables
├── Line: Continuous over time (trend)
└── Heatmap: Matrix relationships

Part-to-whole:
├── Donut: Simple, limited categories
├── Treemap: Hierarchical, many items
└── Sunburst: Multi-level drill-down
```

## 2. Library Selection

```
Library decision tree:

Small/simple (< 10kb):
├── Chart.js: Quick, canvas-based
├── ApexCharts: Good defaults, animations
└── Recharts: React-only, SVG-based

Medium/features:
├── ECharts: Powerful, many chart types
├── Nivo: React, highly customizable
└── Victory: React, declarative

Enterprise/advanced:
├── D3.js: Maximum control, steep learning
├── Highcharts: Commercial, excellent support
└── Plotly: Scientific, Python/JS

Framework-specific:
├── React: Recharts, Nivo, Visx
├── Vue: Vue-chartjs, ECharts wrapper
└── Angular: ngx-charts, Highcharts
```

## 3. Responsive Patterns

```
Responsive strategy:
├── Aspect ratio: Maintain proportions
├── Mobile breakdown:
│   ├── Simplify: Fewer data points
│   ├── Scroll/zoom: Interaction patterns
│   ├── Touch: Larger touch targets
│   └── Labels: Abbreviate or hide
├── Breakpoints: 480px, 768px, 1024px
└── Debounce resize: Performance
```

## 4. Accessibility Patterns

```
Visual accessibility:
├── Color: Don't rely on color alone
│   ├── Add patterns/textures
│   ├── Use labeled legend
│   └── Provide data table alternative
├── Contrast: WCAG 4.5:1 minimum
├── Labels: Axis labels, data labels
└── Font size: 12px minimum

Screen reader:
├── ARIA labels on charts
├── Data table fallback
├── Role="img" with description
└── Announce updates via aria-live
```

## 5. Interaction Patterns

```
Interactions to consider:
├── Tooltip: Hover details
├── Click: Drill-down, selection
├── Zoom/pan: Large datasets
├── Filter: Cross-filtering
├── Export: PNG/SVG download
└── Legend toggle: Show/hide series
```

## 6. Performance Patterns

```
Large datasets (>1000 points):
├── Sampling: Show subset, aggregate
├── Canvas: Better than SVG for many points
├── Virtualization: Only render visible
├── WebGL: For 3D or massive datasets
└── Aggregation: Server-side rollups
```

## 7. Animation Patterns

```
When to animate:
├── Initial load: Context setting
├── Update: Data changes, transitions
└── Highlight: Focus attention

When to avoid:
├── Real-time streaming: Choppy
├── Accessibility: Motion sensitivity
└── Print: No animation support
```

## 8. Design System Integration

```
Consistency checklist:
├── Colors: Use design system palette
├── Typography: Match body/headings
├── Spacing: Consistent padding/margins
├── Grid: Align to 8px baseline
└── Components: Reusable chart wrapper
```

## Key Patterns

1. **Start with data** - Know data shape before choosing chart
2. **Mobile-first** - Design for mobile, enhance for desktop
3. **Accessibility first** - A11y is harder to retrofit
4. **Progressive enhancement** - Static first, then interactive
5. **Test with data** - Use real data volumes in testing

---

## Anti-Patterns

```
❌ Rendering 100,000 SVG elements directly in DOM
✅ Canvas or WebGL for large datasets; virtualize SVG lists

❌ Pie charts for comparing more than 4 values
✅ Bar chart for comparison; pie only for part-of-whole with <4 segments

❌ Dual Y-axis charts (misleading scale)
✅ Two separate charts or normalized data

❌ No loading state during data fetch
✅ Skeleton/placeholder chart while data loads

❌ Color as the only differentiator (accessibility)
✅ Color + pattern/shape; check contrast with colorblind simulation
```

---

## Quick Reference

| Chart type | When to use | Library |
|---|---|---|
| Bar | Comparison | Recharts / Chart.js |
| Line | Trend over time | Recharts / D3 |
| Scatter | Correlation | D3 / Observable Plot |
| Heatmap | 2D density | D3 |
| Treemap | Hierarchical part-of-whole | D3 |
| Large data | WebGL rendering | deck.gl / regl |
