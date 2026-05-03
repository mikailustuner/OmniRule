---
name: nextjs-expert
description: Expert guidance for Next.js 15+ development including App Router, Server Components, and performance optimization.
origin: OmniRule
---

# Next.js 15+ Expert Workflow

This skill ensures Next.js applications are built with maximum performance and modern patterns.

## When to Activate
- Developing Next.js pages or layouts.
- Implementing Server Actions.
- Optimizing for Core Web Vitals.
- Configuring `next.config.js`.

## Core Principles
1. **Server-First**: Prefer Server Components for data fetching and heavy logic.
2. **Minimal Client Code**: Use `'use client'` only when interactivity is required.
3. **Optimized Fetching**: Use `fetch` with appropriate revalidation tags.
4. **Layout-Driven Design**: Leverage `layout.tsx` for shared UI and state.

## Implementation Steps

### 1. Data Fetching Pattern
Always fetch data in Server Components where possible:
```tsx
// app/page.tsx
async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}
```

### 2. Server Actions Pattern
Use Server Actions for mutations:
```tsx
// app/actions.ts
'use server'
export async function createItem(formData: FormData) {
  // Logic here
}
```

### 3. Loading & Error States
Always implement `loading.tsx` and `error.tsx` for better UX.

## Success Metrics
- 100/100 Lighthouse performance score.
- Zero layout shift (CLS < 0.1).
- Server-side rendered content accessible without JS.