---
name: typescript-expert
description: "TypeScript: Type inference strategy, Generic patterns, Utility type selection, Safety patterns."
---

# TypeScript Architecture Patterns

**Version:** TS 5.6 | **Focus:** Type safety, inference, patterns

## 1. Type Inference Strategy

```
How much to annotate?
├── Let inference do its job:
│   └── const x = 1; → x is 1 (literal), not number
│   └── function add(a, b) → return type inferred
│
├── Explicit annotations needed when:
│   ├── Function parameters (clarify intent)
│   ├── API boundaries (incoming data)
│   ├── Complex generic returns
│   └── When inference is wrong
│
└── Avoid:
    ├── Over-annotating local variables
    ├── Type on every line
    └── Using 'any' as easy way out
```

---

## 2. Generic Pattern Selection

```
When to use generics:
├── Function works with multiple types
│   └── <T>(value: T): T → identity function
│
├── Type depends on another type
│   └── type Response<T> = { data: T, error?: Error }
│
├── Constraints needed:
│   └── <T extends HasId>(item: T): T['id']
│
└── When NOT to use:
    └── Single specific type - just use the type
```

**Type parameter position:**
- Function signature: `function fn<T>(...)`
- Arrow: `const fn = <T>(...) => ...`
- Class: `class Store<T> { ... }`

---

## 3. Utility Type Decision

```
What utility to use?
├── Pick specific fields: Pick<User, 'id' | 'name'>
├── Remove specific fields: Omit<User, 'password'>
├── Make optional: Partial<User>
├── Make required: Required<Config>
├── Make readonly: Readonly<User>
├── Extract type from value: typeof user
├── Validate at runtime: z.infer<typeof Schema>
└── Function parameters: Parameters<typeof fn>
```

---

## 4. Type Safety Levels

```
Strictness hierarchy (least to most strict):
├── any - no type checking (AVOID!)
├── unknown - something, must check before use
├── object - any non-primitive
├── string/number/etc - primitives
└── Specific literal - "exact" | "value"

Pattern: Prefer strict, relax only when needed
```

---

## 5. Discriminated Union Pattern

```
When to use discriminated unions:
├── API responses with different shapes
├── State machines (loading/success/error)
├── Form validation errors
└── Any "one of many" type

Pattern:
1. Common field (status, type, kind) as discriminant
2. Type is union of objects with that field
3. TypeScript can narrow in switch/if

Example:
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
  | { status: 'loading' }
```

---

## 6. Error Handling Pattern

```
Type-safe error handling:
├── Specific error types
│   └── type AppError = { code: string; message: string }
│
├── Result type pattern
│   └── type Result<T> = { ok: true; value: T } | { ok: false; error: E }
│
└── Never use:
    └── throw in async code (harder to type)
    || Return Result instead
```

---

## 7. Zod Integration

```
When to use Zod:
├── Runtime validation needed (API input, forms)
├── Want to derive TypeScript types from schema
└── Need complex validation logic

Pattern:
├── Define schema with Zod
├── Extract type: type User = z.infer<typeof UserSchema>
├── Validate at runtime: schema.parse(data) or safeParse
├── Use inferred type in code
└── Single source of truth for validation AND types
```

---

## 8. Module Type Strategy

```
How to type modules:
├── Export interfaces/types (preferred)
│   └── export type { User, Config }
│   └── export interface { ... }
│
├── Be explicit about exports
│   └── Use package.json exports field
│   └── Define types for both import and require
│
└── Avoid:
    || Exporting 'any' types
    || Confusing default and named exports
```

---

## Key Patterns

1. **Infer first** - Let TypeScript work, add annotations sparingly
2. **Generics** - Use when type depends on usage
3. **Discriminated unions** - Type-safe conditionals
4. **Zod for input** - Runtime validation + type inference
5. **Strict by default** - any is a code smell