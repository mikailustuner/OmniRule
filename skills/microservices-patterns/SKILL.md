---
name: microservices-patterns
description: "Microservices Patterns: Service decomposition, communication, data management, resilience."
---

# Microservices Patterns

**Focus:** Service boundaries, communication, distributed systems

## 1. Decomposition Strategies

```
How to split services:
├── By business capability (orders, payments, users)
├── By subdomain (DDD bounded contexts)
├── By team ( Conway's Law)
└── By operational need (scale, deployment)

Avoid:
├── By technical layer (all services share DB)
├── Too fine-grained (micromanagement)
└── Too coarse (distributed monolith)
```

---

## 2. Communication Patterns

```
Synchronous (request/response):
├── REST - CRUD, simple queries
├── gRPC - performance, contracts
└── GraphQL - flexible queries

Asynchronous (fire-and-forget):
├── Message queues (Kafka, RabbitMQ)
├── Pub/Sub patterns
└── Event-driven
```

---

## 3. Data Management

```
Database per service:
├── Each service owns its data
├── No shared databases
├── Polyglot persistence allowed

Patterns:
├── API composition (query across services)
├── CQRS (separate read/write models)
└── Saga pattern (distributed transactions)
```

---

## 4. Service Discovery

```
How services find each other:
├── Client-side (Eureka, Consul)
├── Server-side (API Gateway)
└── DNS-based (Cloud providers)

Key: Dynamic registration
```

---

## 5. Resilience Patterns

```
Circuit Breaker:
├── Fail fast after threshold
├── Fallback response
└── Auto-recovery

Retry with Backoff:
├── Exponential backoff
├── Jitter (randomization)
└── Dead letter queue

Bulkhead:
├── Isolate failures
├── Resource pools
└── Fail in isolation
```

---

## 6. API Gateway

```
What it does:
├── Routing
├── Authentication
├── Rate limiting
├── Request/response transformation
└── Protocol translation

Consider: Backend for Frontend (BFF)
```

---

## 7. Observability

```
The Three Pillars:
├── Logging - structured, correlated
├── Metrics - RED metrics (rate, errors, duration)
└── Tracing - request flow across services

Essential for debugging distributed systems
```

---

## 8. When Microservices

```
Use when:
├── Team size > 50 developers
├── Independent deployment needed
├── Different scaling requirements
└── Polyglot needed

Avoid when:
├── Team < 10
├── Tight deadline
├── Simple domain
└── No DevOps maturity
```

---

## Key Patterns

1. **API Gateway** - single entry point
2. **Circuit Breaker** - resilience
3. **Saga** - distributed transactions
4. **Service Discovery** - dynamic routing
5. **Observability** - debug distributed

(End of file - 84 lines)