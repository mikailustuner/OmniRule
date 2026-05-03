---
name: documentation-patterns
description: "Documentation Patterns: What to document, README structure, API docs, keeping docs fresh."
---

# Documentation Patterns

**Focus:** Essential docs, maintainability, discoverability

## 1. What to Document

```
Must have:
├── Getting started guide
├── Architecture overview
├── API reference (if applicable)
├── Deployment steps
└── Troubleshooting

Should have:
├── Coding standards
├── Environment setup
├── Runbook for ops
└── Security considerations

Avoid:
├── Outdated docs
├── Obvious code comments
├── Duplicate information
└── Internal team quirks
```

---

## 2. README Structure

```
Standard README:
├── One-liner description
├── Quick start (3-5 steps)
├── Features overview
├── Prerequisites
├── Installation
├── Configuration
├── Usage examples
├── Testing
├── Deployment
├── Contributing
├── License

Keep under 100 lines, link details
```

---

## 3. API Documentation

```
Include:
├── Endpoint list (method, path)
├── Request format
├── Response format
├── Error codes
├── Authentication
├── Example requests/responses

Tools: OpenAPI/Swagger, Postman
```

---

## 4. Architecture Docs

```
Architecture decision:
├── System diagram
├── Component descriptions
├── Data flow
├── Technology choices
├── Rationale for decisions

Template: ADRs (Architecture Decision Records)
```

---

## 5. When to Document

```
Write docs when:
├── New project starts
├── Onboarding new member
├── Complex logic added
├── New developer joins
└── Before you forget

Update docs when:
├── Requirements change
├── Breaking changes
└── Bugs found (add to troubleshooting)
```

---

## 6. Doc Maintenance

```
Keep docs fresh:
├── Treat docs like code (review)
├── Link from code where possible
├── Docs in same repo
├── Automate where possible
└── Remove stale content

If docs rot, remove them
```

---

## 7. Decision Trees

```
What to document:
├── If question asked twice → doc it
├── If setup takes > 5 steps → doc it
├── If error is non-obvious → doc it
└── If it's a rule → doc it

What not to document:
├── Obvious code behavior
├── Code comments are enough
├── Outdated content
└── Duplicate sources
```

---

## Key Patterns

1. **README first** - essential start
2. **Code examples** - show usage
3. **Living docs** - keep updated
4. **ADRs** - record decisions
5. **Treat code** - version together

(End of file - 73 lines)