---
name: monolith-to-microservices
description: "Monolith to Microservices: Strangler pattern, incremental migration, decomposition strategies."
---

# Monolith to Microservices Patterns

**Focus:** Incremental migration, risk reduction, maintaining functionality

## 1. Migration Strategies

```
Big Bang (avoid):
├── Rewrite everything at once
├── High risk, long feedback loop
└── No rollback option

Incremental (preferred):
├── Extract feature by feature
├── Keep monolith running
├── Easy to rollback
└── Continuous value delivery
```

---

## 2. Strangler Pattern

```
Strangler Fig Application:
├── New features in microservices
├── Old features remain in monolith
├── Router directs traffic
└── Gradually replace monolith

Steps:
1. Identify extractable module
2. Create new service
3. Route new traffic to service
4. Remove from monolith
5. Repeat
```

---

## 3. Feature Identification

```
What to extract first:
├── Independent domain (low coupling)
├── High change frequency
├── Resource-intensive (scaling needs)
├── Different tech requirements

What to keep in monolith:
├── Shared data models
├── Authentication/authorization
└── Tightly coupled features
```

---

## 4. Database Decomposition

```
Migration approaches:
├── Branch by abstraction
├── Change data ownership
├── Create new tables per service
└── Database view from monolith

Key: Keep schema in sync during transition
```

---

## 5. Communication Strategy

```
During transition:
├── New service ↔ monolith via API
├── Eventually: async events
└── Avoid distributed monolith

Pattern: Anti-corruption layer
├── Translate between models
└── Isolate domain changes
```

---

## 6. Routing Layer

```
How to route:
├── API Gateway layer
├── Feature flags
└── URL-based routing

Canary deployment:
├── Small % to new service
├── Monitor errors
└── Gradually increase
```

---

## 7. Parallel Running

```
Run both systems:
├── New service + monolith
├── Compare responses
├── Log discrepancies
└── Fix before full switch

Duration: Days to weeks
```

---

## 8. Extract Steps

```
1. Identify boundary
2. Create service skeleton
3. Implement new service
4. Set up data sync
5. Add routing
6. Remove old code
7. Decommission old DB
```

---

## Key Patterns

1. **Strangler** - gradually replace
2. **Branch by Abstraction** - feature toggle
3. **Anti-corruption Layer** - model translation
4. **Database per Service** - own data
5. **Canary** - test with traffic

(End of file - 74 lines)