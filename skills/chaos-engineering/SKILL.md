---
name: chaos-engineering
description: "Chaos Engineering: Fault injection, resilience testing, game days, chaos mesh, litmus." 
triggers:
  extensions: [".yaml", ".json", ".py"]
  directories: ["chaos/", "resilience/", "testing/"]
  keywords: ["chaos", "resilience", "fault injection", "game day", "chaos mesh", "litmus", "gremlin", "failure"]
auto_load_when: "Building resilient systems or testing fault tolerance"
agent: platform-engineer
tools: ["Read", "Write", "Bash"]
---

# Chaos Engineering Patterns

**Focus:** Resilience testing, fault injection, observability

## 1. Chaos Principles

```
Chaos Engineering Principles:
├── Start by defining steady state
│   ├── Normal behavior metrics
│   └── "System should serve 99% of requests under 200ms"
│
├── Hypothesize about behavior
│   ├── "If service A fails, service B should..."
│   └── Document expected behavior
│
├── Inject real failures
│   ├── Kill processes
│   ├── Network latency
│   └── Resource exhaustion
│   └── Real problems, not simulated
│
├── Test in production (carefully)
│   ├── Or production-like staging
│   └── Small blast radius
│   && Observe, don't break
│
└── Automate & run continuously
    └── Run as part of CI/CD
    └── Reproducible
```

---

## 2. Failure Scenarios

```
Common Failure Tests:
├── Service failure
│   ├── Kill a pod/service
│   ├── CPU/memory exhaustion
│   └── Process crash
│
├── Network failure
│   ├── Latency injection
│   ├── Packet loss
│   └── DNS failure
│   └── Network partition
│
├── Dependency failure
│   ├── External API timeout
│   ├── Database unavailable
│   └── Cache unavailable
│
├── Infrastructure failure
│   ├── AZ failure
│   └── Instance termination
│   └── Disk full
│
└── Configuration failure
    ├── Bad config deploy
    └── Feature flag off
    └── Secret rotation
```

---

## 3. Implementation Patterns

```
Chaos Tools:
├── Kubernetes-native
│   ├── Chaos Mesh (CNCF)
│   ├── LitmusChaos
│   └── Crossplane for chaos
│
├── VM-based
│   ├── Gremlin
│   └── Chaos Monkey (Netflix)
│
└── Cloud-native
    ├── AWS Fault Injection Simulator
    └── GCP chaos experiments

Example Chaos Mesh YAML:
```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-kill
spec:
  action: pod-failure
  mode: one
  duration: 30s
```
```

---

## 4. Observability During Chaos

```
Observability Requirements:
├── Metrics
│   ├── Latency (p50, p95, p99)
│   ├── Error rate
│   └── Throughput
│
├── Distributed tracing
│   ├── Trace each request
│   ├── See failure propagation
│   └── Identify bottlenecks
│
├── Logging
│   ├── Correlation IDs
│   └── Structured logging
│   └── Log levels
│
└── Alerts
    ├── Threshold alerts
    └── Anomaly detection
    └── On-call rotation
```

---

## 5. Game Days

```
Game Day Process:
├── Pre-game day
│   ├── Define scenario
│   ├── Plan rollback
│   └── Communicate (don't alarm)
│
├── Execute
│   ├── Run during low traffic
│   └── Observe metrics
│   └── Document observations
│
├── Post-game day
│   ├── What worked
│   ├── What failed (intentionally and not)
│   └── Fix discovered issues
│
└── Example scenarios
    ├── "Kill database primary, verify failover"
    └── "Network partition between two services"
    └── "Add 10x load, verify auto-scaling"
```

---

## Key Patterns

1. **Start simple** - Process crash, not multi-region failure
2. **Blast radius** - Small at first, expand as confidence grows
3. **Stop on degradation** - If system degrades unexpectedly, abort
4. **Document hypothesis** - What should happen before injecting
5. **Automate** - Manual chaos is not repeatable

---

## Anti-Patterns

```
❌ Test in production without guardrails — causing outage
✅ Test in staging first, small blast radius in prod

❌ No rollback plan — can't recover
✅ Always know how to stop the experiment

❌ No hypothesis — random chaos, no learning
✅ Define: "Should X happen when Y fails"

❌ Not observability — can't see what's happening
✅ Ensure metrics/traces visible before test

❌ One-time test — no continuous validation
✅ Automate as part of CI/CD pipeline
```

---

## Quick Reference

| Tool | Focus | Environment |
|---|---|---|
| Chaos Mesh | K8s pod/network chaos | K8s |
| LitmusChaos | K8s, cloud-native | K8s |
| Gremlin | Multi-platform | Any |
| FIS | AWS | AWS |
| Pumba | Docker chaos | Docker |