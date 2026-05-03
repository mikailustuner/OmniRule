---
name: css-variables
description: "Custom properties, theming, runtime changes"
---

# CSS Variables (Custom Properties)

Focus: Custom properties, theming, runtime changes

## 1. Custom Property Decision Tree

```
When to use custom properties:
├── Theming → yes
├── Responsive values → yes
├── Runtime changes → yes
├── Shared values → yes

When to use for:
├── Colors → yes
├── Spacing → yes
├── Typography → yes
├── Animations → yes
└── Breakpoints → yes (with calc)

When to avoid:
├── Static values → hardcode
├── Once-only → hardcode
├── Performance-critical → hardcode
└── Complex calculation → precalculate
```

## 2. Theming Decision Tree

```
When to use CSS variables:
├── Runtime theming → yes
├── Multiple themes → yes
├── User preference → yes
└── No framework → yes

When to use framework theming:
├── Design system → yes
├── Dark mode built-in → yes
├── Theme provider → yes
└── CSS-only theme → CSS variables

When to structure:
├── By category → colors/typography/spacing
├── By component → component-scoped
├── Global then scoped → yes
└── Flat → avoid for scaling
```

## 3. Scope Decision Tree

```
When to use global:
├── Shared values → yes
├── Defaults → yes
├── Token values → yes
└── Cross-component → yes

When to use scoped:
├── Component-specific → yes
├── Override global → yes
├── Shadow DOM → required
└── Isolation → yes

When to use --css-var-prefix:
├── Design system → yes
├── Third-party conflict → yes
├── All same prefix → consistent
└── No conflict → optional
```

## 4. Runtime Changes Decision Tree

```
When to change via JS:
├── User interaction → yes
├── Theme toggle → yes
├── Device preference → yes
└── Feature detection → yes

When to change via CSS:
├── Media queries → yes
├── Hover/focus → yes
├── Container queries → yes
└── @supports → yes

When to use prefers-color-scheme:
├── System dark mode → yes
├── User preference → yes
├── Fallback → yes
└── Manual toggle → also provide
```

## 5. Fallback Decision Tree

```
When to add fallback:
├── Old browser → yes
└── Unknown support → yes

Fallback syntax:
color: var(--primary, #0066cc);
padding: var(--spacing-md, 1rem);

When to use:
├── Primitive value → yes
├── Complex value → pre-define
└── Last resort → always provide

When NOT to use:
├── Always supported → no fallback needed
├── Required value → no fallback hides
└── Empty var → use differently
```

## 6. Dynamic Calculations Decision Tree

```
When to use calc():
├── Responsive sizing → yes
├── Combining variables → yes
└── Mixed units → yes

When to use clamp():
├── Fluid sizing → yes
├── Min/max bound → yes
└── Range control → yes

When to use min()/max():
├── Responsive bounds → yes
├── Fluid typography → yes
└── Container queries → yes

When to precalculate:
├── Many calculations → slow
├── Same result → pre-calc
└── Print/offline → pre-calc
```

## When to Use Decision Summary

1. Use for theming, runtime changes, shared values
2. Scope: global defaults, component overrides
3. Prefer prefers-color-scheme over manual toggle
4. Always provide fallback for critical values
5. Use calc() for responsive, clamp() for fluid