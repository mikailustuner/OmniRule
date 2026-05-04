---
name: ddd-patterns
description: "DDD Patterns: Domain logic, aggregates, value objects, bounded contexts, domain events." 
triggers:
  keywords: ["domain", "aggregate", "entity", "value object", "repository", "bounded context", "domain event", "ubiquitous language"]
auto_load_when: "Designing domain models or business logic"
agent: architect
tools: ["Read", "Write", "Bash"]
---

# Domain-Driven Design Patterns

**Focus:** Ubiquitous language, bounded contexts, domain modeling

## 1. Building Blocks

```
DDD Tactical Patterns:
├── Entities - identity, mutable
├── Value Objects - immutable, no identity
├── Aggregates - consistency boundary
├── Domain Services - stateless logic
├── Domain Events - something happened
├── Repositories - collection-like access
└── Factories - complex creation
```

---

## 2. Entity vs Value Object

```
Entity:
├── Has unique ID
├── Mutable state
├── Equality by ID
└── Example: User, Order, Product

Value Object:
├── No ID
├── Immutable
├── Equality by attributes
└── Example: Address, Money, Color
```

---

## 3. Aggregate Pattern

```
Aggregate Root:
├── Entry point for access
├── Enforces invariants
├── Controls changes
└── Example: Order (contains OrderItems)

Aggregate Rules:
├── One root per aggregate
├── Only root accessible from outside
├── Changes via root only
├── Consistency boundary
└── Transaction scope = aggregate
```

---

## 4. Bounded Context

```
What is a BC:
├── Explicit boundary
├── Own domain model
├── Own ubiquitous language
└── Own team ownership

How to identify:
├── Different domain vocabularies
├── Different team responsibilities
├── Different scaling needs
└── Different DB schemas
```

---

## 5. Domain Events

```
Event structure:
├── Unique ID
├── Occurred at timestamp
├── Event type name
├── Payload (what happened)

When to use:
├── Decouple components
├── Audit trail
├── CQRS read models
└── Event sourcing
```

---

## 6. When to Apply DDD

```
Apply DDD when:
├── Complex business domain
├── Ubiquitous language exists
├── Domain experts available
├── Long-term investment
└── Team understands patterns

Avoid when:
├── CRUD-heavy app
├── Simple domain
├── No domain expert
└── Tight timeline
```

---

## 7. Repository Pattern

```
Repository:
├── Collection metaphor
├── Methods: add, remove, getById
├── Query methods (find)
└── Implementation: DB or API

Interface in domain
Implementation in infrastructure
```

---

## 8. Service Layer vs Domain Service

```
Application Service:
├── Orchestrates use cases
├── Transaction management
├── Coordinates entities
└── Thin, declarative

Domain Service:
├── Pure business logic
├── Stateless
├── Between entities
└── When logic doesn't fit entity
```

---

## Key Patterns

1. **Aggregate** - transactional boundary
2. **Value Object** - immutable descriptors
3. **Bounded Context** - model boundary
4. **Ubiquitous Language** - shared vocabulary
5. **Domain Events** - decoupled communication

(End of file - 90 lines)

---

## Anti-Patterns

```
❌ Anemic domain model (entities are just data structs)
✅ Rich entities with behavior — User.changeEmail(), Order.place()

❌ Aggregate that spans too many entities
✅ Keep aggregates small; one transaction = one aggregate

❌ Domain events published synchronously blocking the caller
✅ Collect events in aggregate; dispatch after transaction commits

❌ Business logic in application services or controllers
✅ Logic belongs to entities and domain services

❌ Exposing aggregate internals to the outside
✅ Only aggregate root is accessible from outside; internal objects are private
```

---

## Quick Reference

| Concept | Role | Rule |
|---|---|---|
| Entity | Identity + lifecycle | Mutable; identified by ID |
| Value Object | Describe by value | Immutable; no identity |
| Aggregate | Consistency boundary | One transaction per aggregate |
| Domain Event | Side effect trigger | Immutable; past tense name |
| Repository | Persistence facade | Returns full aggregates |
| Domain Service | Stateless logic | When logic doesn't fit entity |
| Bounded Context | Linguistic boundary | Each team owns its context |
