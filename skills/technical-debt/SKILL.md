---
name: technical-debt
description: "Technical Debt: Identification, prioritization, payoff strategy, prevention." 
triggers:
  keywords: ["refactor", "technical debt", "cleanup", "legacy", "TODO", "FIXME", "complexity", "coupling"]
auto_load_when: "Addressing technical debt or refactoring"
agent: architect
tools: ["Read", "Write", "Bash"]
---

# Technical Debt Patterns

**Focus:** Managing, prioritizing, reducing debt over time

## 1. What is Technical Debt

```
Debt types:
├── Code debt (poor code quality)
├── Architecture debt (bad structure)
├── Test debt (low coverage)
├── Documentation debt (missing docs)
├── Infrastructure debt (outdated ops)

Origin:
├── Shortcuts for speed
├── Missing knowledge
├── Time pressure
└── Abandoned experiments
```

---

## 2. Identification

```
Signs of debt:
├── Feature development slows
├── Bugs increase
├── Onboarding time grows
├── Tests are flaky
├── Fear to change code
└── CircleCI takes forever

Tools:
├── Code coverage
├── Complexity metrics
├── Code review patterns
└── Team retrospective
```

---

## 3. Prioritization

```
Factors to consider:
├── Impact on development speed
├── Risk level
├── Effort to fix
├── Dependencies
└── Business value

Prioritize:
├── High impact, low effort first
├── Critical paths over edge cases
└── Infrastructure before features
```

---

## 4. Payoff Strategies

```
Strategies:
├── Dedicated "debt Friday"
├── Include in estimates
├── Boy scout rule (leave better)
├── Rewrite vs refactor
└── Feature work includes cleanup

Better: Prevent than fix
```

---

## 5. Measurement

```
Metrics:
├── Cyclomatic complexity
├── Coupling (imports)
├── Test coverage %
├── Time to run tests
├── Build times

Track over time to see trends
```

---

## 6. Communication

```
To stakeholders:
├── Show impact on velocity
├── Estimate slowdown %
├── Link to bugs/delays
└── Propose investment

Not: "Code is bad, we should fix"
Yes: "Cleanup gives 20% velocity boost"
```

---

## 7. Prevention

```
Prevent debt:
├── Code standards + linter
├── Pull request reviews
├── Test requirements (80%+)
├── Architecture review
├── Pair programming
└── Technical spikes before stories
```

---

## Key Patterns

1. **Track** - visible backlog
2. **Prioritize** - impact vs effort
3. **Prevent** - standards + review
4. **Communicate** - business value
5. **Pay regularly** - small batches

(End of file - 77 lines)

---

## Anti-Patterns

```
❌ "We'll fix it later" with no ticket created
✅ Log all debt immediately with TODO + ticket reference

❌ Paying all debt in one big refactor sprint
✅ Boy Scout Rule — leave code cleaner than you found it

❌ Ignoring debt until it causes an outage
✅ Track debt metric (complexity, coverage) in CI

❌ Rewriting everything instead of targeted refactors
✅ Strangler Fig: replace incrementally, keep working at all times

❌ Debt that no one owns
✅ Each debt item has an assigned owner and deadline
```

---

## Quick Reference

| Debt type | Detection | Remedy |
|---|---|---|
| Design debt | Arch review, complexity score | Targeted refactor |
| Code debt | High cyclomatic complexity | Extract + simplify |
| Test debt | Low coverage, flaky tests | Add tests before feature |
| Dependency debt | Outdated/vulnerable packages | Dependency sentinel |
| Documentation debt | No README, stale docs | docs-agent |
| Performance debt | CWV regressions | Perf audit + fix |
