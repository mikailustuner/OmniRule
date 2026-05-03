---
name: mongodb-patterns
description: "MongoDB Patterns: Schema design, aggregation pipeline, indexing, data modeling."
---

# MongoDB Patterns

**Focus:** Document modeling, query optimization, aggregation

## 1. Schema Design

```
Embedded (when):
├── One-to-few (order + line items)
├── Data queried together
├── No growth limit (embedded array)
└── Consistency important

Reference (when):
├── One-to-many (author + books)
├── Data grows unbounded
├── Different access patterns
└── Need to query independently
```

---

## 2. When to Use MongoDB

```
Use MongoDB when:
├── Flexible schema needed
├── JSON-like documents
├── Hierarchical data
├── Rapid prototyping
├── Large data volumes
└── Horizontal scaling needed

Avoid when:
├── Strong consistency required (ACID)
├── Complex joins
├── Fixed schema
└── Small data, simple queries
```

---

## 3. Aggregation Pipeline

```
Pipeline stages:
├── $match - filter documents
├── $project - shape output
├── $group - aggregate
├── $sort - order results
├── $limit - pagination
└── $lookup - join collections

Performance: Place filters early
```

---

## 4. Indexing Strategy

```
Index types:
├── Single field - simple queries
├── Compound - multi-field queries
├── Multikey - arrays
├── Text - search
└── Hashed - sharding

Avoid: Over-indexing (write overhead)
```

---

## 5. Data Modeling Patterns

```
Pattern: Polymorphic
├── Same collection, different docs
└── Type field distinguishes

Pattern: Bucket
├── Time-series data
└── Groups by time window

Pattern: Attribute
├── Many optional fields
└── Single array query
```

---

## 6. Sharding Strategy

```
Shard key selection:
├── High cardinality
├── Even distribution
├── Common query filter
└── Avoid monotonically increasing

Shard patterns:
├── Range-based (contiguous)
└── Hash-based (random)
```

---

## 7. Performance Tips

```
Query optimization:
├── Project only needed fields
├── Use covered queries
├── Limit result set
├── Avoid $regex where possible

Aggregation:
├── Use $limit early
├── Stage ordering matters
└── Allow use of indexes
```

---

## Key Patterns

1. **Embed** - colocate related data
2. **Reference** - normalize when needed
3. **Index** - common queries
4. **Project** - minimize data transfer
5. **Stage ordering** - filter early

(End of file - 79 lines)