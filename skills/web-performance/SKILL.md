---
name: web-performance
description: "Core Web Vitals, LCP, FID, CLS optimization"
---

# Web Performance Patterns

Focus: Core Web Vitals measurement and optimization

## 1. Core Web Vitals Decision Tree

```
When to optimize LCP (Largest Contentful Paint):
├── Above fold content → yes (LCP element)
├── Hero image → optimize
├── Large text → optimize render
├── Slow server → optimize TTFB
└── Render-blocking → eliminate

When to optimize FID (First Input Delay):
├── JS bundles → split
├── Heavy JS → defer non-critical
├── Third-party → delayed loading
└── Event handlers → simplify

When to optimize CLS (Cumulative Layout Shift):
├── Images → dimensions specified
├── Ads/stubs → reserved space
├── Fonts → font-display: optional/swap
├── Dynamic content → reserve space
```

## 2. LCP Optimization Decision Tree

```
When to optimize server:
├── TTFB > 600ms → optimize server
├── CDN → use
├── Caching → implement
└── Database → optimize

When to optimize HTML:
├── Streaming → yes
├── Render-blocking CSS → inline critical
├── Render-blocking JS → defer
└── Preload → for LCP element

When to optimize images:
├── Above fold → preload
├── Next-gen format → WebP/AVIF
├── Proper sizing → srcset
├── Lazy load → below fold only

When to optimize fonts:
├── Preload → yes (critical font only)
├── Display swap → yes
├── Subset → if many characters
└── Variable → if used
```

## 3. FID Optimization Decision Tree

```
When to split bundles:
├── Large bundle → yes
├── Independent routes → yes
├── Third-party → separate
└── Common → shared chunk

When to defer JS:
├── Non-critical → defer
├── Below fold → defer
├── Event handlers → defer
└── Required for LCP → inline

When to delay third-party:
├── Analytics → worker or delay
├── Ads → below fold
├── Embeds → on interaction
└── Social → on interaction
```

## 4. CLS Optimization Decision Tree

```
When to add dimensions:
├── Images → yes (width + height)
├── Iframes → yes
├── Videos → yes
└── Embeds → yes (aspect-ratio)

When to reserve space:
├── Ads → min-height
├── Dynamic content → skeleton
├── Lazy loaded → placeholder
└── Expander → animation-safe

When to handle fonts:
├── FOUT → font-display: swap
├── FOIT → font-display: optional
├── Size adjustment → size-adjust
└── Font load events → for critical usage
```

## 5. Measurement Decision Tree

```
When to use RUM:
├── Real user data → yes
├── Production monitoring → yes
├── Field data → yes
└── Lab only → Lighthouse

When to use Lighthouse:
├── Development → yes
├── Debugging → yes
├── Synthetic → yes
└── Real experience → RUM

When to measure:
├── Every deploy → yes
├── PR checks → yes
├── Field data → if possible
└── Lab data → minimum
```

## 6. Quick Wins Decision Tree

```
Priority actions:
├── 1. Optimize images → typically largest gain
├── 2. Eliminate render-blocking → typically second
├── 3. Preload LCP element → typically third
├── 4. Reduce JS → typically fourth
└── 5. Improve TTFB → if needed

Image optimization:
├── Modern format → WebP/AVIF
├── Proper sizing → srcset
├── Compression → tools verify
└── Above fold → eager load

CSS optimization:
├── Critical → inline
├── Non-critical → defer
├── Unused → remove
└── Inlined for small → inline
```

## When to Use Decision Summary

1. LCP: preload critical image, inline critical CSS, defer JS
2. FID: split bundles, defer non-critical JS, delay third-party
3. CLS: reserve space for dynamic, specify dimensions, font-display
4. Measure with RUM in production, Lighthouse in dev
5. Quick wins: images, render-blocking, preload