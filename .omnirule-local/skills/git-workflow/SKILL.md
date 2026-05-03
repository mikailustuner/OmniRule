---
name: git-workflow
description: "Git: Branch strategy, Commit patterns, Merge vs Rebase, When to use what."
---

# Git Workflow Patterns

**Focus:** Branching, commits, collaboration

## 1. Branch Strategy

```
Branch types:
├── main: production-ready, never force push
├── develop: integration branch, feature base
├── feature/*: new features, from develop
├── release/*: release preparation, from develop
└── hotfix/*: production fixes, from main

Flow:
develop → feature → develop → release → main → hotfix → main
```

**When to create branches:**
- Feature: new functionality
- Bugfix: bug fix
- Release: preparing version
- Hotfix: critical production fix

---

## 2. Commit Strategy

```
When to commit:
├── Logical unit complete
├── Tests pass
└── Works locally

Message format:
├── <type>: <description>
├── Types: feat, fix, docs, style, refactor, test, chore
├── Description: imperative, lowercase, short
└── Body: optional, explanation

What to include:
├── What changed
├── Why (if not obvious)
└── How (if complex)
```

---

## 3. Merge vs Rebase Decision

```
When to merge:
├── Feature branch into develop
├── Long-lived branches
└── Public/shared branches
└── Preserves history exactly

When to rebase:
├── Local feature branch updates
├── Keep history linear
├── Clean up commit history
└── Before PR review

NEVER rebase:
├── Public/shared branches
├── Main/master branch
└── Already pushed branches (if shared)
```

---

## 4. PR Workflow

```
Before creating PR:
├── Tests pass locally
├── Code formatted
├── Rebased on target branch
└── Self-reviewed changes

PR best practices:
├── Small PRs (easier to review)
├── Clear description
├── Screenshots for UI
└── Related issues linked

Review feedback:
├── Address all comments
├── Don't take personally
├── Ask for clarification if unclear
└── Re-request review after changes
```

---

## 5. Commit Organization

```
How to organize commits:
├── First commit: setup/scaffolding
├── Middle: logical steps
├── Last commit: final touches
└── Squash: clean before merge

Atomic commits:
├── One logical change per commit
├── Can be understood alone
├── Tests related changes together
```

---

## 6. When to Use What

```
Squash merge (GitHub default):
├── When: feature branch has multiple commits
├── Good for: clean history on main
└── Preserves: feature branch temporarily

Rebase:
├── When: update local branch with main
├── Good for: clean, linear history
└── Use on: local branches only

Merge:
├── When: combining branches
├── Good for: preserving history
└── Use on: long-lived branches
```

---

## Key Patterns

1. **Feature branches** - Isolated development
2. **Small PRs** - Faster review, less risk
3. **Rebase locally** - Linear history
4. **Squash to main** - Clean history
5. **Atomic commits** - Logical, understandable