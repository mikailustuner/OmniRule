---
name: responsive-design
description: "Breakpoint strategy, mobile-first, responsive images"
---

# Responsive Design Patterns

Focus: Breakpoints, mobile-first, responsive strategies

## 1. Breakpoint Strategy Decision Tree

```
When to define breakpoints:
├── Design changes → yes
├── Content reflow needed → yes
├── Existing breakpoints → extend
└── Same layout → single

When to use common breakpoints:
├── Mobile portrait → 320-480px
├── Mobile landscape → 480-768px
├── Tablet → 768-1024px
├── Desktop → 1024-1440px
├── Large desktop → 1440px+

When to use content-based:
├── Text too wide → breakpoint
├── Images pixelated → breakpoint
├── Touch targets small → breakpoint
└── Design breaks → breakpoint
```

## 2. Mobile-First Decision Tree

```
When to start mobile:
├── New project → yes
├── Unknown audience → yes
├── Mobile important → yes
└── Desktop-only → desktop-first

When to use min-width:
├── Mobile-first → base styles, then min-width
├── Additive changes → yes
├── Override at each breakpoint → yes
└── New component → mobile first

When to use max-width:
├── Desktop-first → base desktop, max-width
├── Legacy support → yes
├── Rare for new projects → min-width
└── Specific overrides → both
```

## 3. Responsive Image Decision Tree

```
When to use srcset:
├── Multiple sizes → yes
├── Art direction → picture
├── Resolution switching → srcset
└── Bandwidth considerations → srcset

When to use picture element:
├── Different crops → yes
├── Format switching → yes
├── Browser support → different formats
└── Size-based loading → media queries
```

## 4. Layout Strategy Decision Tree

```
When to use Flexbox:
├── One dimension → yes
├── Space distribution → yes
├── Alignment → yes
└── 2D layout → Grid

When to use Grid:
├── 2D layout → yes
├── Complex alignment → yes
├── Page layout → yes
└── Component → Flexbox or Grid

When to use container queries:
├── Self-contained components → yes
├── Different contexts → yes
├── Isolated responsive → yes
└── Page breakpoints sufficient → no
```

## 5. Touch Target Decision Tree

```
Touch target minimum:
├── Minimum size → 44x44px (iOS), 48x48px (Android)
├── Padding included → yes
├── Links close together → group
└── Custom sizing → ensure visibility

When to add hover states:
├── Desktop only → hide on touch
├── Hybrid devices → consider hover
├── Clear state → indicate interactable
└── Avoid stuck state → mobile-first
```

## 6. Responsive Typography Decision Tree

```
When to use fluid type:
├── Many sizes → yes
├── Smooth resizing → yes
├── Simple project → static + breakpoints
└── Large text → clamp()

When to use viewport units:
├── Full-width headers → yes
├── Hero text → yes
├── Body text → avoid (scaling issues)
└── Container-relative → use container units
```

## When to Use Decision Summary

1. Mobile-first: base styles at mobile, add with min-width
2. Use common breakpoints as starting point, adjust for content
3. Prefer content-based breakpoints over device-specific
4. Touch targets: minimum 44x44px
5. Use container queries for self-contained components