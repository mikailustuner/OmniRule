---
name: debugging-strategies
description: "Debugging Strategies: Systematic approach, tools, techniques, root cause analysis." 
triggers:
  keywords: ["debug", "error", "trace", "breakpoint", "investigate", "bug", "reproduce", "root cause"]
auto_load_when: "Debugging errors or investigating unexpected behavior"
agent: qa-specialist
tools: ["Read", "Write", "Bash"]
---

# Debugging Strategies

**Focus:** Systematic debugging, tool selection, root cause analysis

## 1. The Debugging Mindset

```
Process:
├── Reproduce - make it consistent
├── Observe - gather data
├── Hypothesis - what's wrong
├── Test - verify theory
├── Fix - implement solution
└── Prevent - add test/check

Don't: Random changes, guess
```

---

## 2. Reproduction Strategies

```
Make it reproducible:
├── Write failing test
├── Simplify to minimal case
├── Check environment differences
└── Look at recent changes

Questions:
├── Does it happen locally?
├── Does it happen to others?
└── When did it start?
```

---

## 3. Tools by Scenario

```
Frontend:
├── Browser DevTools (network, console)
├── React DevTools
└── Console.log (temporary)

Backend:
├── Logger (structured)
├── Debugger (breakpoints)
├── Stack trace analyzer
└── Database query log

System:
├── curl / HTTP client
├── Database client
└── Message queue inspection
```

---

## 4. Technique Selection

```
Start with:
├── Read error message carefully
├── Check logs first
├── Simplify the problem
└── Google the error

Then:
├── Binary search (remove code)
├── Rubber duck (explain it)
└── Compare with working state
```

---

## 5. Types of Bugs

```
Logic errors:
├── Wrong condition
├── Wrong operator
└── Off-by-one

Data bugs:
├── Null/undefined
├── Wrong type
└── Wrong state

Environment:
├── Config mismatch
├── Missing env vars
└── Version differences

Race conditions:
├── Timing dependent
├── Async not handled
└── Shared state
```

---

## 6. Root Cause Analysis

```
Find the real cause:
├── 5 Whys technique
├── Look for patterns
├── Check assumptions
└── Trace back from failure

Not just: Fix symptoms
Yes: Fix underlying cause
```

---

## 7. Prevention

```
Prevent bugs:
├── Tests (unit, integration)
├── Type checking
├── Lint rules
├── Code review
└── Error boundaries

Pre-mortem: Think what could go wrong
```

---

## 8. When Stuck

```
Take a break - fresh perspective
Ask someone - rubber duck
Search - someone had same issue
Document - writing clarifies thinking
```

---

## Key Patterns

1. **Reproduce** - consistent repro
2. **Simplify** - minimal case
3. **Hypothesize** - then test
4. **Root cause** - fix underlying
5. **Prevent** - add test

(End of file - 82 lines)

---

## Anti-Patterns

```
❌ console.log debugging in production code
✅ Structured logging with log levels; remove debug logs before commit

❌ Changing multiple things at once while debugging
✅ Change one variable at a time; binary search the bug

❌ Fixing the symptom without understanding root cause
✅ Reproduce reliably → isolate → understand → fix → verify

❌ Skipping reproduction step ("I'll just fix it")
✅ Write a failing test first — it documents the bug and prevents regression

❌ Debugging in prod instead of staging
✅ Reproduce locally; add observability to prod for future incidents
```

---

## Quick Reference

| Technique | When to use | Tool |
|---|---|---|
| Breakpoints | Step through logic | DevTools / VSCode |
| Binary search | Narrow down commit | git bisect |
| Network tab | API / fetch issues | DevTools Network |
| Memory snapshot | Leak investigation | DevTools Memory |
| Performance flame | Slow renders | DevTools Performance |
| Error boundary | React render errors | React DevTools |
