---
name: component-design-patterns
description: "Component design: Atomic design, composition, prop design, state placement."
---

# Component Design Patterns

**Focus:** Design principles, composition, reusability

---

## 1. Component Size Decision

```
When to split components:

├── Component does too much
│   └── Multiple responsibilities
│   └── Hard to test
│   └── Can describe in one sentence?
│
├── Component is reused in multiple places
│   └── But with different content
│   └── Props control everything
│   └── Use children/slots instead
│
├── Component renders different states
│   └── Loading, error, empty, data
│   └── Extract each to separate component
│
└── Component is hard to maintain
    └── 200+ lines
    └── Multiple concerns
    └── Several reasons to change
```

```
When NOT to split:

├── Components are tightly coupled
│   └── Always used together
│   └── Split would make harder
│
├── Premature abstraction
│   └── Not used anywhere else yet
│   └── Wait until second use
│
└── Simplicity is priority
    └── Over-abstraction = complexity
    └── Trade-off: balance needed
```

---

## 2. Props Design

```
Props principles:

├── Explicit over implicit
    └── Name clearly indicates purpose
    └── Avoid: data, value, params
│
├── Prefer objects over primitives
    └── Related props together
    └── Easier to extend
│
├── Boolean props
    └── Use sparingly
    └── Better: explicit prop for state
    └── Example: isLoading vs loadingState
│
└── Callbacks: verb prefix
    └── onClick, onSubmit, onLogin
    └── Past tense for handlers: onDataFetched
```

```
When to use children:

├── Content is component's responsibility
    └── Button with icon + text
    └── Card with header/body/footer
│
├── Content varies from caller
    └── Not predictable props
    └── Use slots for flexibility
│
└── When NOT to use children:

    └── Simple data display
    └── Predictable content
    └── Props more explicit
```

---

## 3. Component Composition

```
How to compose:

├── Wrapper components
    └── Layout: margin, padding, max-width
    └── Applies container rules
    └── Children are content
│
├── Slot components
    └── Card with header/body/footer slots
    └── Optional sections
    └── Caller controls what's where
│
└── Higher-order components (use carefully)
    └── Add behavior (loading, error)
    └── Compose multiple behaviors
    └── Hooks often better alternative
```

```
Composition vs inheritance:

├── Composition preferred
    └── Flexible, interchangeable
    └── Props control behavior
    └── Easy to test
│
└── Inheritance:
    └── Avoid for UI components
    └── Tight coupling
    └── Hard to override
    └── Use composition instead
```

---

## 4. Atomic Design Levels

```
When to use each level:

├── Atoms (basic elements)
    └── Button, Input, Label
    └── Smallest reusable units
    └── No dependencies on other components
│
├── Molecules (simple groups)
    └── FormField (Label + Input)
    && SearchBar (Input + Button)
    && Consistent units working together
│
├── Organisms (complex UI)
    && Header, Sidebar, ProductCard
    && Distinct section of UI
    && Multiple molecules/atoms
│
├── Templates (page structure)
    && Layout, ArticleTemplate
    && Blueprint for pages
    && Placeholders for content
│
└── Pages (full templates)
    && HomePage, ProductPage
    && Instantiated templates
    && Connect to data, state
```

---

## 5. State Placement

```
Where to put state:

├── Component-local state
    └── useState for UI state
    └── Only used in this component
    └── Not passed elsewhere
│
├── Shared state (lift up)
    └── Used by multiple children
    └── Closest common ancestor
    └── Pass down via props or context
│
├── Global state
    └── Many components need access
    && User session, theme
    && Use: Zustand, Context
│
└── Server state
    && API data
    && Use: React Query, SWR
    && NOT component state
```

---

## Key Patterns

1. **Split when reused** - Not before
2. **Props explicit** - Avoid too generic names
3. **Children for content slots** - Props for configuration
4. **Composition over inheritance** - Flexibility
5. **State in lowest common ancestor** - But not lower than needed