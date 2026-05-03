---
name: prisma-expert
description: "Prisma: Schema design patterns, Query optimization strategy, Transaction patterns, When to use what."
---

# Prisma Architecture Patterns

**Version:** Prisma 7 | **Focus:** Schema, queries, transactions

## 1. Schema Design Strategy

```
When to use relations:
├── One-to-One: use @unique on child, NOT separate table
├── One-to-Many: parent has children array
├── Many-to-Many: implicit (array on both) OR explicit (join table)
└── Self-referential: use Optional for nullable

Indexes strategy:
├── Foreign keys: auto-indexed, add custom only if filtering
├── Composite: when querying multiple fields together
├── Partial: when filtering with same condition (WHERE active)
└── Unique: when field must be unique

Enums vs Strings:
├── Use enum: fixed values, won't change (Role.ADMIN vs "admin")
└── Use string: flexible, might expand (status field)
```

---

## 2. Query Decision Tree

```
How to fetch related data?
├── Need ENTIRE related object → include
│   └── User with ALL posts: include: { posts: true }
│
├── Need SPECIFIC fields → select
│   └── User with post titles only: select: { posts: { select: { title: true } } }
│
├── Need nested depth → nested select/include
│   └── User → posts → comments: select: { posts: { include: { comments: true } } }
│
└── Count only → count or _count
    └── User with post count: include: { _count: { select: { posts: true } } }
```

---

## 3. Performance Strategy

```
Query optimization order:
├── 1. Select only needed fields (select, not include)
├── 2. Add pagination (take/skip, cursor)
├── 3. Add indexes on WHERE/ORDER BY columns
├── 4. Use compound indexes for multi-column
├── 5. Check query plan with EXPLAIN
└── 6. Use $queryRaw only if ORM can't express

When to worry about performance:
├── Query returns >1000 rows → paginate
├── N+1 problem → use include or batch
├── Slow joins → denormalize or cache
└── Large JSON fields → separate table or index
```

---

## 4. Transaction Decision

```
When to use transactions:
├── Multiple writes that must succeed together
│   └── Order + OrderItems + Inventory update
│
├── Read-then-write (conditional)
│   └── Check balance, then deduct
│
├── Idempotency important
│   └── Same operation multiple times = same result

When NOT to use:
├── Single write → just write
├── Independent writes → parallel or sequential
└── Read-only operations → just read
```

---

## 5. Connection Strategy

```
When to use connection pooling:
├── Serverless functions (Vercel, Lambda)
├── High concurrency (100+ connections)
└── Long-running processes with many instances

How to choose:
├── Prisma Accelerate → managed, includes caching
├── PgBouncer → self-hosted, just pooling
├── Prisma Postgres → managed DB with native pooling
└── Direct connection → single instance, low traffic
```

---

## 6. Migration Strategy

```
When to migrate:
├── Development: migrate dev (creates migration)
├── Staging/Prod: migrate deploy (applies)
└── Never: migrate reset in production

Schema change workflow:
├── 1. Change schema.prisma
├── 2. Run migrate dev (creates .sql)
├── 3. Review migration SQL
├── 4. Push to repo
├── 5. CI runs migrate deploy
└── 6. Monitor for errors
```

---

## 7. Soft Delete Pattern

```
When to implement soft delete:
├── Need audit trail
├── Can't permanently delete (compliance)
├── Need "trash" functionality
└── Related data should also be hidden

Implementation approaches:
├── Middleware: transform delete to update
├── Query filter: automatically filter deletedAt: null
└── Composite unique: allow multiple with different deletedAt
```

---

## Key Patterns

1. **select over include** - Only fetch what's needed
2. **Transactions for atomicity** - Multiple writes together
3. **Connection pooling for serverless** - Prevent exhaustion
4. **Indexes on WHERE/ORDER BY** - Not just foreign keys
5. **Soft delete middleware** - Single place, not every query