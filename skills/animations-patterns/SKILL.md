---
name: animations-patterns
description: "Animation decisions, performance, accessibility"
---

# Animations Patterns

Focus: Decision framework, performance, accessibility

## 1. Animation Type Decision Tree

```
When to use CSS animation:
├── Simple properties → yes
├── Trigger: hover/focus → yes
├── One-time → yes
└── Complex sequencing → JS

When to use JS animation:
├── Dynamic values → yes
├── Physics-based → yes
├── Complex sequencing → yes
└── Interactive → yes

When to use Web Animations API:
├── Framework integration → yes
├── Performance needed → yes
├── Native alternative → yes
└── Library needed → GSAP/framer
```

## 2. Property Performance Decision Tree

```
When to animate transform:
├── Position → yes
├── Scale → yes
├── Rotation → yes
└── Always prefer → yes

When to animate opacity:
├── Fade in/out → yes
├── Visibility changes → yes
└── Use with transform → yes

When to animate other properties:
├── Avoid → layout triggers
├── Colors → acceptable
├── Shadows → expensive
└── Filter → expensive

When to use will-change:
├── Frequent animation → yes
├── Before animation starts → yes
├── After animation ends → remove
└── Default → avoid
```

## 3. Accessibility Decision Tree

```
When to respect reduced motion:
├── User preference → check
├── Essential motion → allow-animations: reduce
├── Eliminated → opacity: 0; visibility: hidden
└── Static alternative → provide

When to auto-play animations:
├── Essential info → avoid
├── Decorative → muted autoplay
├── User can pause → yes
└── No controls → add controls
```

## 4. Animation Purpose Decision Tree

```
When to animate entry:
├── Page load → yes
├── Modal open → yes
├── Accordion expand → yes
└── Single entrance → yes

When to animate state:
├── Hover/focus → microinteraction
├── Loading → skeleton preferred
├── Success/error → feedback
└── Selection → visual feedback

When to animate navigation:
├── Page transition → yes
├── Tab switch → yes
├── Scroll → scroll-behavior
└── Anchor jump → no animation
```

## 5. Timing Decision Tree

```
Duration guidelines:
├── Quick UI → 150-200ms
├── Standard → 200-300ms
├── Emphasis → 300-500ms
└── Page transition → 400-600ms

Easing selection:
├── Linear → rare
├── Ease-out → entry animations
├── Ease-in → exit animations
├── Ease-in-out → complex
└── Custom → cubic-bezier for feel

When to use spring:
├── Natural feel → yes
├── Interactive → yes
├── Bounce needed → yes
└── Simple → easing is fine
```

## When to Use Decision Summary

1. Prefer transform + opacity — avoid layout trashing
2. Respect prefers-reduced-motion — check and adapt
3. Use will-change sparingly — add before, remove after
4. Timing: fast for UI (200ms), slower for emphasis (400ms)
5. Spring for interactive, easing for one-way