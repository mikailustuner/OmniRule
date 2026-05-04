---
name: code-review-patterns
description: "Code Review Patterns: Review checklist, feedback patterns, approval flow, constructive feedback." 
triggers:
  keywords: ["review", "PR", "pull request", "feedback", "code quality", "checklist"]
auto_load_when: "Reviewing code or PRs"
agent: qa-specialist
tools: ["Read", "Write", "Bash"]
---

# Code Review Patterns

**Focus:** Quality, learning, collaboration, consistency

## 1. Review Checklist

```
Functionality:
├── Does it work as intended?
├── Edge cases handled?
├── Error handling present?
└── Security considerations?

Code Quality:
├── Readable, self-documenting?
├── DRY (no duplication)?
├── Single responsibility?
└── Tests included/updated?

Architecture:
├── Follows project patterns?
├── Appropriate complexity?
├── Dependencies correct?
└── Performance implications?
```

---

## 2. Feedback Types

```
Blocking (must fix):
├── Logic errors
├── Security vulnerabilities
├── Breaking changes
├── Missing tests

Non-blocking (suggestions):
├── Naming improvements
├── Code style
├── Documentation
└── Alternative approaches

Learning (optional):
├── Educational links
├── Interesting patterns
└── Design discussions
```

---

## 3. How to Give Feedback

```
Good patterns:
├── Ask questions, don't demand
├── Explain the why
├── Suggest alternatives
├── Praise good code
└── Be specific

Avoid:
├── Vague comments ("bad")
├── Personal attacks
├── Nitpicking style (use linter)
├── Late changes without notice
└── Long review delays
```

---

## 4. Review Process

```
Steps:
1. Author: Self-review first
2. Author: Add description/context
3. Reviewer: Read PR description
4. Reviewer: Run code, test behavior
5. Reviewer: Leave comments
6. Author: Address feedback
7. Reviewer: Approve/request changes
```

---

## 5. Approval Flow

```
Common patterns:
├── 1 approval required (small team)
├── 2 approvals (larger team)
├── Specific reviewers (architecture)
└── Auto-merge when approved

When to request changes:
├── Blocker issues
├── Unclear requirements
├── Missing context
└── Tests failing
```

---

## 6. Review Timing

```
Expectations:
├── Review within 24 hours
├── Smaller PRs faster to review
├── Block other work if urgent
└── Communicate delays

PR size: Keep < 400 lines
```

---

## 7. Author Responsibilities

```
Before PR:
├── Write good description
├── Self-review changes
├── Add tests
└── Run linter locally

After review:
├── Respond to comments
├── Don't take feedback personally
├── Ask for clarification if unclear
└── Update and re-request
```

---

## Key Patterns

1. **Be specific** - with examples
2. **Explain why** - not just what
3. **Ask vs demand** - questions work
4. **Small PRs** - faster review
5. **Timely** - within 24 hours

(End of file - 78 lines)

---

## Anti-Patterns

```
❌ Review style/formatting in PR comments
✅ Automate style with Prettier/ESLint — never manual style reviews

❌ "Looks good to me" on 800-line PRs
✅ PRs should be ≤400 lines; split if larger

❌ Review comments with no actionable suggestion
✅ Every comment either asks a question or suggests a specific fix

❌ Blocking PRs over personal preference, not bugs/correctness
✅ Distinguish nit (optional) vs blocker (must fix) in comments

❌ Author defending every line under review
✅ Code review is collaborative — be curious, not defensive
```

---

## Quick Reference

| What to review | Priority | Example |
|---|---|---|
| Correctness | Must | Logic errors, off-by-one |
| Security | Must | Auth checks, input validation |
| Performance | Should | N+1 queries, missing indexes |
| Tests | Should | Coverage, edge cases |
| Readability | Nice | Variable names, comments |
| Style | Automated | Prettier/ESLint, not humans |
