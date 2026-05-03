---
name: responsive-images
description: "Image formats, srcset, picture element, lazy loading"
---

# Responsive Images Patterns

Focus: Formats, srcset, picture element, lazy loading

## 1. Image Format Decision Tree

```
When to use WebP:
├── Browser support → 96%+ support
├── Transparency → yes
├── Animation → yes
├── Size reduction → 25-35% smaller
└── Fallback → JPEG/PNG

When to use AVIF:
├── Chrome/Firefox → yes
├── Highest compression → yes
├── HDR support → yes
├── Fallback → WebP/JPEG

When to use SVG:
├── Icons/logos → yes
├── Simple graphics → yes
├── Responsive → yes
├── Animation → yes

When to use JPEG:
├── Photos → yes
├── Compatibility → best
└── No transparency → yes
```

## 2. Srcset Decision Tree

```
When to use srcset:
├── Responsive → yes
├── Multiple widths → yes
├── Bandwidth variation → yes
└── Browser selection → yes

When to use sizes:
├── Same crop → srcset + sizes
├── Different crop → picture element
├── Viewport-based → media queries
└── Single image → no srcset needed

Sizes guidelines:
├── Full width → 100vw
├── Half width → 50vw
├── Third width → 33vw
└── Specific breakpoint → media query
```

## 3. Picture Element Decision Tree

```
When to use picture:
├── Art direction → yes (different crops)
├── Format switching → yes (AVIF/WebP/JPEG)
├── Dpr switching → yes (1x/2x/3x)
└── Viewport-based art → yes

Format switching pattern:
├── <picture> + <source type="image/avif">
├── <source type="image/webp">
└── <img> fallback (JPEG or PNG)

When multiple sources:
├── Type + media → both in source
├── Order matters → most capable first
└──.img fallback → last
```

## 4. Lazy Loading Decision Tree

```
When to use loading=lazy:
├── Below fold → yes
├── Not in viewport → yes
├── Not immediate → yes
└── Large number → yes

When to eager load:
├── Above fold → yes (eager or default)
├── First 1-2 images → yes
├── LCP element → yes
└── User scrolls immediately → yes

When to use IntersectionObserver:
├── Custom threshold → yes
├── Progressive loading → yes
├── Animation trigger → yes
└── Native lazy not supported → no (legacy)
```

## 5. Responsive Image Decision Trees

```
When to preload:
├── LCP image → yes
├── Critical → yes
├── Above fold → above fold
└── Not critical → no preload

Preload syntax:
<link rel="preload" as="image" href="large.jpg">
<link rel="preload" as="image" href="large.avif" type="image/avif">

When to decode:
├── Large image → async
├── Blocking render → sync (avoid)
└── Progressive → async

When to use decoding attribute:
├── Above fold → sync (if LCP)
├── Below fold → async
└── Largest content → sync
```

## 6. Image Performance Decision Tree

```
When image is biggest resource:
├── Optimize format → AVIF/WebP
├── Right size → srcset + sizes
├── Compression → lossy acceptable
└── CDN → use

When to use src:
├── Single size → src only
├── Static size → src only
├── Responsive → srcset or picture
└── Different crop → picture

When to check metrics:
├── Lighthouse → yes
├── Field data → yes
├── RUM → if possible
└── All formats → test each
```

## When to Use Decision Summary

1. Format: AVIF > WebP > JPEG for photos, SVG for icons
2. Srcset for size changes, picture for format/crop changes
3. Lazy load below fold, eager load above fold
4. Preload LCP image
5. Test with Lighthouse + RUM