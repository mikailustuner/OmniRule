---
name: animations-patterns
description: "Animation decisions, performance, accessibility" 
triggers:
  extensions: [".tsx", ".css", ".ts"]
  keywords: ["animation", "transition", "motion", "framer", "keyframe", "gsap"]
auto_load_when: "Adding animations or transitions"
agent: style-architect
tools: ["Read", "Write", "Bash"]
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

---

## Anti-Patterns

```
❌ Animating layout properties (width, height, top, left)
✅ Animate transform and opacity only — GPU-composited

❌ JavaScript setInterval for animations
✅ requestAnimationFrame or CSS transitions

❌ Blocking main thread with heavy JS during animation
✅ Use CSS animations or offload to Web Animations API

❌ Auto-playing motion with no prefers-reduced-motion check
✅ Always wrap motion in @media (prefers-reduced-motion: no-preference)

❌ Animating every interaction (overload)
✅ Reserve animation for meaningful state changes
```

---

## Quick Reference

| Scenario | Solution | Performance |
|---|---|---|
| Simple hover | CSS transition | Excellent |
| Complex sequence | Web Animations API / Framer Motion | Good |
| Enter/exit | CSS keyframes + class toggle | Excellent |
| Scroll-linked | Intersection Observer | Good |
| Canvas/game | requestAnimationFrame | Excellent |
| Reduced motion | prefers-reduced-motion media query | — |
