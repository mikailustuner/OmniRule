---
name: debugging-strategies
description: "Debugging Strategies: Systematic approach, tools, techniques, root cause analysis."
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