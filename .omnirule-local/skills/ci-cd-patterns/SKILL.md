---
name: ci-cd-patterns
description: "CI/CD: Pipeline strategy, testing stages, deployment patterns, and release workflows."
---

# CI/CD Pipeline Patterns

**Focus:** Build automation, testing strategy, deployment cadence

---

## 1. Pipeline Strategy

```
When to use what pipeline model:

├── Trunk-based (short-lived branches)
│   └── Use when: small teams, fast feedback needed
│   └── Avoid when: large teams, complex integration
│
├── GitFlow (long-lived branches)
│   └── Use when: scheduled releases, mature products
│   └── Avoid when: need rapid iteration
│
└── Release branches
    └── Use when: multiple versions in production
    └── Avoid when: single version, frequent releases
```

---

## 2. Testing Stages

```
Test pyramid (bottom to top):

├── Unit tests (70%)
│   ├── Run: every commit
│   ├── Fast (< 1min total)
│   └── Coverage: core business logic
│
├── Integration tests (20%)
│   ├── Run: every PR
│   ├── Medium (1-10min)
│   └── Coverage: API contracts, DB interactions
│
├── E2E tests (10%)
│   ├── Run: before deploy
│   ├── Slow (10-30min)
│   └── Coverage: critical user journeys
│
└── Performance tests
    ├── Run: weekly or before major releases
    └── Coverage: load handling, latency
```

---

## 3. Deployment Patterns

```
When to use deployment strategy:

├── Blue-green
│   └── Use when: zero-downtime required
│   └── Swap: instant traffic switch
│   └── Rollback: instant revert
│
├── Canary
│   └── Use when: testing new version with real traffic
│   └── Approach: 1% → 10% → 100%
│   └── Rollback: redirect traffic back
│
├── Rolling
│   └── Use when: simple deployments, no downtime needed
│   └── Approach: replace instances one by one
│   └── Risk: partial deployment state
│
└── Feature flags
    └── Use when: decoupling deploy from release
    └── Approach: toggle features without redeploy
    └── Benefit: gradual rollout, quick rollback
```

---

## 4. Build Optimization

```
How to speed up CI:

├── Caching
│   ├── Dependencies: npm, pip, maven cache
│   ├── Build artifacts: compiled binaries, Docker layers
│   └── Test results: only rerun changed tests
│
├── Parallelization
│   ├── Split test suites by type
│   ├── Run independent jobs concurrently
│   └── Use matrix builds for multiple configs
│
└── Optimization
    ├── Skip builds for docs-only changes
    ├── Use shallow clones (git clone --depth 1)
    └── Cache Docker layers between runs
```

---

## 5. Release Workflow

```
Version strategy:

├── Semantic versioning (recommended)
│   ├── MAJOR: breaking changes
│   ├── MINOR: new features (backward compatible)
│   └── PATCH: bug fixes
│
├── Continuous deployment
│   └── Use when: high test confidence, fast feedback needed
│   └── Requirement: comprehensive test suite
│
└── Scheduled releases
    └── Use when: business requires coordination
    └── Requirement: release notes, changelog
```

---

## Key Patterns

1. **Fail fast** — Run fastest tests first
2. **Environment parity** — Dev, staging, prod as similar as possible
3. **Immutable artifacts** — Build once, deploy everywhere
4. **Rollback-first** — Always know how to revert
5. **Secrets management** — Never inject secrets in pipeline code