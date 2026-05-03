---
name: logging-patterns
description: "Logging: Log levels, structured logging, log aggregation, and debugging strategies."
---

# Logging Patterns

**Focus:** Log management, debugging, compliance

---

## 1. Log Levels

```
When to use each level:

├── ERROR
│   └── Unexpected failures
│   └── Impact: request failed, action not completed
│   └── Example: exception, timeout, connection refused
│
├── WARN
│   └── Known limitations, degraded behavior
│   └── Impact: working but suboptimal
│   └── Example: retry after multiple attempts, fallback used
│
├── INFO
│   └── Significant business events
│   └── Impact: normal operations
│   └── Example: user action, payment processed, order created
│
├── DEBUG
│   └── Detailed diagnostic info
│   └── Only in development/staging
│   └── Example: variable values, loop iterations
│
└── TRACE
    └── Finest granularity
    └── Heavy instrumentation
    └── Example: entry/exit of every function
```

---

## 2. Structured Logging

```
When to use structured vs plain text:

├── Structured (JSON)
│   └── Use when: log aggregation (ELK, Loki)
│   └── Use when: programmatic parsing
│   └── Use when: need to search/filter fields
│   └── Include: timestamp, level, message, context
│
└── Plain text
    └── Use when: human readability in console
    └── Use when: simple scripts
    └── Avoid: in production systems
```

```
Standard fields for structured logs:
├── timestamp: ISO 8601 format
├── level: ERROR, WARN, INFO, DEBUG
├── message: human-readable description
├── service: name of service
├── trace_id: correlation ID
├── user_id: user context (if applicable)
├── metadata: key-value pairs for context
```

---

## 3. Log Aggregation

```
When to use each aggregation system:

├── ELK Stack (Elasticsearch, Logstash, Kibana)
│   └── Use when: full-text search needed
│   └── Use when: complex queries
│   └── Good for: high log volume, rich analysis
│
├── Loki (with Grafana)
│   └── Use when: already using Prometheus/Grafana
│   └── Use when: cost-effective storage needed
│   └── Good for: labels-based filtering
│
├── CloudWatch Logs
│   └── Use when: AWS infrastructure
│   └── Use when: native AWS integration
│   └── Good for: serverless applications
│
└── Datadog
    └── Use when: APM integration needed
    └── Use when: unified monitoring
    └── Good for: distributed systems
```

---

## 4. What to Log

```
Log these events:

├── Request lifecycle
│   ├── Incoming request (method, path, ID)
│   ├── Outgoing calls (service, duration, status)
│   └── Response (status, duration)
│
├── Business events
│   ├── User actions (login, purchase, signup)
│   ├── State changes (order placed, status updated)
│   └── Important decisions (fraud detected, approved)
│
└── Errors and warnings
    ├── Exceptions (stack trace, context)
    ├── Degraded behavior (fallback activated)
    └── Configuration issues (missing/invalid)
```

```
Avoid logging:
├── Sensitive data (passwords, tokens, PII)
├── Large payloads (request bodies unless needed)
├── High-frequency debug logs in production
└── Duplicate information
```

---

## 5. Log Performance

```
How to handle logging at scale:

├── Async logging
│   └── Non-blocking writes
│   └── Queue-based (discard on overflow)
│
├── Sampling
│   └── Log 1 in N requests
│   └── Always log errors
│   └── Useful for high-volume services
│
├── Buffering
│   └── Batch writes
│   └── Reduce I/O overhead
│
└── Compression
    └── Compress logs before storage
    └── Reduces storage costs
```

---

## Key Patterns

1. **Correlation IDs** — Pass trace_id through entire request
2. **Sensitive data** — Never log passwords, tokens, credit cards
3. **Parseable format** — JSON preferred for production
4. **Contextual logging** — Include request ID, user ID, service name
5. **Retention policy** — Define what to keep and for how long