---
name: bundle-optimization
description: "Code splitting, tree shaking, lazy loading"
---

# Bundle Optimization Patterns

Focus: Code splitting, tree shaking, lazy loading

## 1. Code Splitting Decision Tree

```
When to split by route:
├── SPA with routes → yes
├── Independent pages → yes
├── Different user paths → yes
└── Single page → no split needed

When to split vendor:
├── Large dependencies → yes
├── Separate updates → yes
├── Caching → yes
└── Small deps → include in app

When to split common:
├── Shared code → yes
├── Multiple routes → yes
├── Entry points → yes
└── Unused common → dynamic import
```

## 2. Dynamic Import Decision Tree

```
When to use dynamic import:
├── Route-based code → yes
├── Modal/dialog → yes
├── Heavy feature → yes
└── User interaction required → yes

When to prefetch:
├── High likelihood → yes (<link rel="prefetch">)
├── Next likely page → yes
├── Low likelihood → no
└── Slow connection → no

When to preload:
├── Critical → yes
├── Next navigation → yes
├── User action triggers → no
└── Uncertain → no
```

## 3. Tree Shaking Decision Tree

```
When tree shaking works:
├── ES modules → yes
├── Side-effect free → yes
├── Named exports → yes
├── Re-exported → depends

When tree shaking fails:
├── CommonJS → no
├── Dynamic require → no
├── Side effects → declared
├── Uglify/compress → verify

How to enable:
├── ES modules → use "type": "module"
├── sideEffects → declare
├── Clean imports → verify
└── Verify output → check bundle
```

## 4. Lazy Loading Decision Tree

```
When to lazy load:
├── Below fold → yes
├── Not in viewport → yes
├── User action required → yes
└── Heavy component → yes

When to eager load:
├── Above fold → yes
├── Likely interaction → yes
├── Initial route → yes
└── Critical UI → yes

When to use loading=lazy:
├── Images → below fold
├── Iframes → optional content
└── Native lazy → yes
```

## 5. Bundle Analysis Decision Tree

```
When to analyze:
├── Large bundle → yes
├── Unexpected size → yes
├── Before deploy → yes
└── Monitoring → yes

What to look for:
├── Duplicate code → deduplicate
├── Large dependencies → code split
├── Unused code → remove
├── Wrong format → optimize

Tools decision:
├── webpack-bundle-analyzer → webpack
├── source-map-explorer → source maps
├── rollup-plugin-visualizer → rollup
└── Package size → npm
```

## 6. Size Budget Decision Tree

```
When to set budget:
├── Any project → yes
├── Performance goals → yes
├── Team ownership → yes
└── CI integration → yes

Budget guidelines:
├── Initial load → < 170KB compressed
├── Individual chunk → < 40KB
├── Per route → < 100KB
└── Total JS → < 500KB compressed

When to exceed:
├── Trade-off documented → yes
├── Performance impact known → yes
├── No alternative → yes
└── CI warning → investigate
```

## When to Use Decision Summary

1. Split by route: dynamic imports for each route
2. Lazy load below fold, eager load above fold
3. Tree shake: ES modules, declare sideEffects
4. Analyze bundles regularly, set size budgets
5. Use prefetch for likely, preload for critical