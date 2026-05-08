---
name: accessibility-basics
description: "WCAG basics, keyboard navigation, screen reader" 
triggers:
  extensions: [".tsx", ".html"]
  directories: ["components/"]
  keywords: ["aria", "a11y", "accessibility", "wcag", "screen reader"]
auto_load_when: "Editing HTML/JSX with accessibility concerns"
agent: seo-agent
tools: ["Read", "Write", "Bash"]
---

# Accessibility Basics Patterns

Focus: WCAG fundamentals, keyboard, screen reader support

## 1. WCAG Decision Tree

```
When to meet WCAG level:
├── New project → AA target
├── Legal requirement → A + AA minimum
├── Enterprise → AAA considered
└── No requirement → A minimum

Perceivable principles:
├── Text alternatives → alt text
├── Time-based media → captions/transcript
├── Adaptable → proper structure
└── Distinguishable → contrast + size

Operable principles:
├── Keyboard accessible → yes
├── Enough time → timeouts extension
├── No seizures → 3 flashes max
├── Navigation有帮助 → clear + consistent

Understandable principles:
├── Readable → language declared
├── Predictable → consistent navigation
├── Input assistance → labels + errors

Robust principles:
├── Compatible → standards
└── Status messages → aria-live
```

## 2. Keyboard Navigation Decision Tree

```
When element needs focus:
├── Interactive → yes
├── Custom widget → yes
├── Tabular content → yes
└── Off-screen content → hidden until used

When to use tab order:
├── Logical reading order → yes
├── Visual order matches → yes
├── Explicit tabindex → avoid
└── Reverse tab → issue

When to manage focus:
├── Modal opens → trap focus
├── Modal closes → restore
├── Tab closes → move to trigger
└── Dynamic content → announce
```

## 3. Screen Reader Decision Tree

```
When to add alt text:
├── Informative image → describe
├── Decorative → empty alt
├── Complex image → description + longdesc
└── Link image → describe destination

When to use roles:
├── Native element available → use native
├── Custom widget → add role
├── Enhanced semantics → add role
└── No change → no role

When to announce changes:
├── Dynamic content → aria-live
├── Form errors → assertive
├── Loading states → polite
└── Success → polite or silent
```

## 4. Color Contrast Decision Tree

```
When to check contrast:
├── Text → minimum 4.5:1 (AA), 7:1 (AAA)
├── Large text → 3:1 (AA), 4.5:1 (AAA)
├── UI components → 3:1
└── Logo/text art → exempt

When to rely on color:
├── Error state → add icon/text
├── Selected state → add indicator
├── Links → underline or color
└── Status → not color alone

When to test:
├── All text → check
├── Dark mode → check
├── High contrast → check
└── Zoom 200% → check
```

## 5. Forms Accessibility Decision Tree

```
When to label fields:
├── All inputs → always
├── Screen reader → yes
├── Click target → yes
└── Visible label → yes

When to group:
├── Radio/checkbox group → fieldset + legend
├── Address fields → fieldset
├── Date fields → fieldset
└── Single field → no grouping

When to announce errors:
├── Inline → aria-invalid + describedby
├── Summary → focus first error
├── Field-level → announce on focus
└── Announce on submit → aria-live
```

## 6. Testing Decision Tree

```
When to test manually:
├── Keyboard only → test
├── Screen reader → test (NVDA/VoiceOver)
├── Zoom 200% → test
└── High contrast → test

Automated vs manual:
├── Automated → catches 30-40%
├── Manual → needed for rest
├── User testing → best for complex
└── A11y audit → automated first

Tools decision:
├── axe → development
├── WAVE → quick check
├── Lighthouse → screening
└── NVDA/VoiceOver → manual
```

## When to Use Decision Summary

1. WCAG AA minimum: 4.5:1 contrast, keyboard, alt text
2. Native elements: prefer over custom with ARIA
3. Focus management: modal traps, restores on close
4. Live regions: announce dynamic changes
5. Test with keyboard + screen reader + zoom

---

## Anti-Patterns

```
❌ Interactive elements without keyboard navigation
✅ All actions reachable via Tab/Enter/Space/Arrow keys

❌ Color contrast below 4.5:1 (AA standard)
✅ Use contrast checker; text on bg ≥ 4.5:1 normal, 3:1 large

❌ Images with no alt text
✅ Meaningful images: alt="description"; decorative: alt=""

❌ Custom components without ARIA roles
✅ Use semantic HTML first; ARIA only when native element unavailable

❌ Focus trapping outside modals
✅ Trap focus inside open modal; restore on close
```

---

## Quick Reference

| WCAG Level | Requirement | Check |
|---|---|---|
| A | Alt text on images | axe DevTools |
| A | Keyboard navigation | Tab through page |
| AA | Color contrast 4.5:1 | Colour Contrast Analyser |
| AA | Focus visible | Outline never display:none |
| AA | Error identification | Describe error in text |
| AAA | Enhanced contrast 7:1 | For critical text |


## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
