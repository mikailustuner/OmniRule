---
name: cron-jobs
description: "Cron jobs: Scheduling patterns, idempotency strategy, failure handling, monitoring." 
triggers:
  keywords: ["cron", "schedule", "recurring", "job", "BullMQ", "queue", "worker", "background"]
auto_load_when: "Setting up scheduled or background jobs"
agent: devops-engineer
tools: ["Read", "Write", "Bash"]
---

# Cron Jobs Patterns

**Focus:** Scheduling, reliability, failure handling

---

## 1. When to Use Cron

```
Cron makes sense when:

├── Scheduled tasks needed
│   └── Daily reports, cleanup jobs
│   └── Hourly sync, weekly summaries
│
├── Not real-time critical
│   └── Can tolerate few minutes delay
│   └── Batch processing
│
├── Predictable schedule
│   && Fixed times, known intervals
│   && Not based on events
│
└── Simple trigger mechanism
    └── Time-based only
    └── No complex dependencies
```

```
Don't use cron when:

├── Event-driven
    └── Triggers on user actions
    └── Use message queues instead
│
├── Real-time needed
    └── Sub-second requirements
    └── Use streaming
│
└── Complex dependencies
    && Job B depends on Job A result
    && Use workflow orchestrator
```

---

## 2. Idempotency Strategy

```
Why idempotency matters:

├── Cron can run multiple times
│   └── Previous run didn't complete
│   || System restarted mid-run
│
├── Network failures cause retries
└── Must handle duplicate execution

How to achieve:

├── Check before work
    && Query: "Is this already processed?"
    && Upsert instead of insert
│
├── Use unique constraints
    && Database prevents duplicates
    └── Deduplicate at source
│
├── Track processed items
    && Record each processed ID
    && Skip if already in list
│
└── Timestamp-based
    && Process records created in time window
    && No reprocessing of old records
```

---

## 3. Failure Handling

```
What to do on failure:

├── Retry strategy
    && Internal retry: 3 attempts with backoff
    && External: let cron retry next schedule
    && Exponential backoff
│
├── Dead letter
    && Move to failed queue
    && Manual investigation
    && Don't block next run
│
├── Alerts
    && Notify on failure
    && Include: job name, time, error
    && Don't alert on every retry
│
└── Partial progress
    && Save checkpoint
    && Resume from last point
    && Track what succeeded
```

---

## 4. Monitoring Strategy

```
What to monitor:

├── Execution status
    && Did it run at all?
    && Did it complete?
    && How long did it take?
│
├── Output/logs
    && Store where searchable
    && Include context (date, params)
│
└── Metrics
    && Records processed
    && Errors encountered
    && Time trend
```

```
Alerting thresholds:

├── Didn't run → Critical
    && Schedule missed
    && Cron broken
│
├── Failed → Warning
    && Business impact
    && Needs investigation
│
├── Slow → Warning
    && Resource issues
    && Data growth
│
└── Zero output → Warning
    && Business unusual?
    || Data pipeline broken
```

---

## 5. Time Zone Strategy

```
How to handle time zones:

├── UTC for infrastructure
    && Cron runs in UTC
    && Logs in UTC
    && Simple, consistent
│
├── Business timezone for business
    && "Daily report at 9am business time"
    && Calculate UTC at runtime
    && Document business hours
│
└── User timezone for UI
    && Show next run in user time
    || Store schedule in business time
```

---

## Key Patterns

1. **Always idempotent** — Handle duplicate runs
2. **Checkpoint progress** — Resume on failure
3. **Alert on failure, not every retry** — Noise reduction
4. **UTC for infrastructure** — Simpler, consistent
5. **Log everything** — Debug failures later

---

## Anti-Patterns

```
❌ Multiple instances running the same cron simultaneously
✅ Distributed lock (Redis SET NX) before executing cron job

❌ Cron jobs with no logging or alerting
✅ Log start/end/duration; alert on failure or long runtime

❌ Cron times in local timezone
✅ Always use UTC in cron expressions

❌ Heavy work blocking the cron process
✅ Cron dispatches a job to a queue; worker handles the heavy lifting

❌ No graceful shutdown handling
✅ Handle SIGTERM; complete current job, reject new during shutdown
```

---

## Quick Reference

| Expression | Meaning | Example |
|---|---|---|
| `* * * * *` | Every minute | Health check |
| `0 * * * *` | Every hour | Hourly rollup |
| `0 0 * * *` | Daily midnight UTC | Daily report |
| `0 0 * * 0` | Weekly Sunday | Weekly summary |
| `*/5 * * * *` | Every 5 minutes | Polling job |

| Library | Runtime | Note |
|---|---|---|
| node-cron | Node.js | In-process |
| BullMQ repeat | Node.js | Queue-backed |
| Inngest | Serverless | Managed |
| GitHub Actions schedule | CI | Simple periodic |


## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
