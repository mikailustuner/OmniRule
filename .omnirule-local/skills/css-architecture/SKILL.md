---
name: css-architecture
description: "CSS organization, BEM, component patterns"
---

# CSS Architecture Patterns

Focus: Organization, naming, component isolation

## 1. Organization Strategy Decision Tree

```
When to use CSS Modules:
├── Component-based framework → yes
├── Scoped styles needed → yes
├── Dynamic theming → consider
└── Global styles needed → separate file

When to use CSS-in-JS:
├── JS-driven theming → yes
├── Critical CSS → separate
├── Zero runtime → zero-runtime solution
└── Plain CSS preferred → use CSS files

When to use utility classes:
├── Rapid prototyping → yes
├── Design system → yes (limited set)
├── Complex components → component classes
└── Many variants → composition
```

## 2. BEM Decision Tree

```
When to create block:
├── Standalone component → yes
├── Reusable piece → yes
├── Layout wrapper → yes
└── Single-use → element only

When to create element:
├── Part of block → yes
├── Meaningful alone → make block
├── Always with parent → element
└── Reusable elsewhere → make block

When to create modifier:
├── Visual variant → yes
├── State change → yes (is- prefix)
├── Behavior variant → yes
└── Same appearance → no modifier
```

## 3. Component Pattern Decision Tree

```
When to use composition:
├── Shared patterns → mixin class
├── Size variants → composition
├── Color variants → composition
└── Complex variants → component extension

When to use inheritance:
├── Slight variation → override
├── Base component → yes
├── Many overrides → composition
└── Rarely shared → single component

When to use custom properties:
├── Theming → yes
├── Responsive values → yes
├── Interactive values → yes
└── Static values → hardcode
```

## 4. File Organization Decision Tree

```
When to split files:
├── 1000+ lines → split
├── Multiple people → split
├── Clear domain → split
└── Small project → single file

Folder structure decision:
├── By component → feature teams
├── By type → role separation
├── By page → simple sites
└── Hybrid → most projects

When to use index file:
├── Re-exports needed → yes
├── Multiple entry points → yes
├── Barrel pattern → yes
└── Simple project → direct import
```

## 5. Specificity Management

```
When to add new selector:
├── Override third-party → use higher specificity
├── Component override → block override
├── Global style fix → specific selector
└── Default → keep specificity low

When to use !important:
├── Override inline styles → yes
├── Utility classes → yes (limited)
├── Print styles → yes
└── Never → for normal code

When to refactor:
├── Specificity wars → refactor to composition
├── Important overuse → refactor
├── Deep nesting → flatten
└── Duplication → extract to component
```

## When to Use Decision Summary

1. BEM for component isolation — block__element--modifier
2. Custom properties for theming — avoid hardcoded values
3. Keep specificity low — enable easy overrides
4. Organize by component — co-locate styles
5. Use index files — clean public API