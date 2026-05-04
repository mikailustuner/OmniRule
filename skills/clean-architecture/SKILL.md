---
name: clean-architecture
description: "Clean Architecture: Layered architecture, dependency rule, use cases, business logic isolation." 
triggers:
  keywords: ["architecture", "layer", "domain", "use case", "clean", "dependency inversion"]
auto_load_when: "Designing system architecture or layers"
agent: architect
tools: ["Read", "Write", "Bash"]
---

# Clean Architecture Patterns

**Focus:** Layer separation, dependency inversion, testable business logic

## 1. Layer Structure

```
Layers (outer to inner):
├── Frameworks/Drivers (DB, UI, API clients)
├── Interface Adapters (Controllers, Presenters, Gateways)
├── Application Layer (Use Cases, DTOs)
└── Enterprise Business Rules (Entities)

Dependency Rule:
├── Outer layers depend on inner
├── Inner = business logic, no dependencies
└── Dependencies point inward (arrows toward entities)
```

---

## 2. When to Use Clean Architecture

```
Use when:
├── Complex business logic (not CRUD)
├── Long-term project (6+ months)
├── Multiple delivery teams
├── Testability is critical
├── Need to swap DB/UI frameworks
└── Domain changes frequently

Skip when:
├── Simple CRUD app
├── Quick prototype/MVP
├── Tight deadline
└── Single developer
```

---

## 3. Use Case Structure

```
Use Case Pattern:
├── Input: Request DTO (what caller sends)
├── Output: Response DTO (what caller receives)
├── Interface: Input/Output ports
├── Logic: Orchestrate domain objects

Naming: CreateUser, UpdateOrderStatus, CalculateShipping
```

---

## 4. Dependency Injection

```
How to inject:
├── Constructor injection (preferred)
├── Method injection (for optional deps)
└── Factory injection (complex creation)

Pattern:
├── Interface in domain (port)
├── Implementation in infrastructure (adapter)
└── Wiring in composition root (main/app)
```

---

## 5. Entity vs DTO

```
Entity:
├── Has identity (ID)
├── Contains business logic
├── Can change over time
└── Lives in domain layer

DTO (Data Transfer Object):
├── No identity (just data)
├── No logic
├── For crossing boundaries
└── Lives in application layer
```

---

## 6. Layer Responsibilities

```
Domain Layer (innermost):
├── Entities (core business objects)
├── Value Objects (immutable, no identity)
├── Domain Services (complex logic)
└── Interfaces (ports)

Application Layer:
├── Use Cases (orchestration)
├── DTOs (data carriers)
└── Interfaces (output ports)

Infrastructure Layer:
├── Repositories (implementations)
├── External services (API clients)
└── Frameworks (DB, HTTP)
```

---

## Key Patterns

1. **Dependency Rule** - dependencies point inward
2. **Use Cases** - encapsulate business logic
3. **Entities** - domain core, framework-agnostic
4. **Ports & Adapters** - switch implementations
5. **Composition Root** - wire dependencies once

(End of file - 79 lines)

---

## Anti-Patterns

```
❌ Business logic in controllers/routes
✅ Logic lives in use cases and domain services

❌ Domain entities importing framework classes
✅ Domain layer has zero framework dependencies

❌ Repository implementations in domain layer
✅ Domain defines interfaces; infra implements them

❌ Anemic domain model (entities = just data bags)
✅ Rich domain model — entities enforce their own invariants

❌ Direct DB calls from UI/presentation layer
✅ Always go through use case → repository interface
```

---

## Quick Reference

| Concept | Where it lives | Rule |
|---|---|---|
| Business rules | Domain entities / services | No framework imports |
| Orchestration | Use cases (application layer) | Calls domain + repos |
| DB / HTTP | Infrastructure layer | Implements domain interfaces |
| DI wiring | Composition root | Once, at startup |
| Input validation | Application layer | Before reaching domain |
| Error types | Domain layer | No HTTP status codes inside |
