---
name: nextjs-expert
description: "Next.js 15+: Server vs Client component decision, data fetching patterns, Server Actions, caching, App Router architecture."
triggers:
  extensions: [".tsx", ".ts"]
  directories: ["app/", "pages/"]
  filenames: ["next.config.js", "next.config.ts"]
  keywords: ["Next.js", "RSC", "server component", "server action", "App Router", "ISR", "SSR", "use client", "use server"]
auto_load_when: "Building Next.js pages, layouts, or server components"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# Next.js 15+ Architecture Patterns

**Version:** Next.js 15 | **Focus:** Server components, data fetching, caching, actions

---

## 1. Server vs Client Component Decision

```
Should this component be a Server Component?
├── Does it fetch data?                    → Server Component
├── Does it use useState/useEffect?        → Client Component ('use client')
├── Does it use browser APIs?              → Client Component
├── Does it handle events (onClick etc)?   → Client Component
├── Is it purely presentational/static?    → Server Component
└── Does it use React Context?             → Client Component

Performance rule:
└── Push 'use client' as far DOWN the tree as possible
    ✅ ServerShell → ServerList → ClientItem   (only leaf is client)
    ❌ 'use client' at page level (kills SSR for whole tree)
```

---

## 2. Data Fetching Patterns

### Server Component (preferred)
```tsx
// app/products/page.tsx — NO useEffect, NO useState needed
export default async function ProductsPage() {
  const products = await db.product.findMany({ orderBy: { name: 'asc' } });
  return <ProductList products={products} />;
}
```

### Parallel Fetching (avoid waterfalls)
```tsx
export default async function Dashboard() {
  // ✅ Parallel — both fire at the same time
  const [user, stats] = await Promise.all([
    getUser(),
    getStats(),
  ]);
  return <DashboardView user={user} stats={stats} />;
}
```

### Streaming with Suspense
```tsx
export default function Page() {
  return (
    <>
      <StaticHeader />       {/* renders immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent /> {/* streams in when ready */}
      </Suspense>
    </>
  );
}
```

---

## 3. Caching Strategy

```
fetch() cache options:
├── { cache: 'force-cache' }     → ISR — cache forever, revalidate manually
├── { next: { revalidate: 60 } } → ISR — revalidate every 60s
├── { cache: 'no-store' }        → SSR — always fresh (dynamic rendering)
└── default (no option)          → force-cache in production

Cache tags:
├── fetch(url, { next: { tags: ['products'] } })
└── revalidateTag('products')  ← call from Server Action after mutation
```

### Per-Segment Caching
```tsx
// app/dashboard/layout.tsx
export const revalidate = 300; // revalidate every 5 min
export const dynamic = 'force-dynamic'; // always dynamic
export const fetchCache = 'only-no-store'; // never cache fetches here
```

---

## 4. Server Actions

```tsx
// app/actions.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;

  // 1. Validate
  if (!name) throw new Error('Name required');

  // 2. Mutate
  await db.product.create({ data: { name } });

  // 3. Revalidate cache
  revalidateTag('products');

  // 4. Redirect (optional)
  redirect('/products');
}
```

### Form with Server Action
```tsx
// app/products/new/page.tsx (Server Component — no 'use client')
import { createProduct } from '../actions';

export default function NewProductPage() {
  return (
    <form action={createProduct}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Optimistic Updates (Client + Server Action)
```tsx
'use client'
import { useOptimistic } from 'react';
import { createProduct } from './actions';

export function ProductForm({ products }: { products: Product[] }) {
  const [optimistic, addOptimistic] = useOptimistic(products);

  async function handleSubmit(formData: FormData) {
    addOptimistic([...optimistic, { name: formData.get('name'), id: 'temp' }]);
    await createProduct(formData);
  }

  return <form action={handleSubmit}>...</form>;
}
```

---

## 5. Metadata & SEO

```tsx
// Static metadata
export const metadata: Metadata = {
  title: 'Page Title',
  description: '...',
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    openGraph: { images: [product.imageUrl] },
  };
}
```

---

## 6. Error & Loading Hierarchy

```
app/
  layout.tsx           ← wraps everything
  error.tsx            ← catches errors in this segment
  loading.tsx          ← shown during navigation (Suspense boundary)
  not-found.tsx        ← shown when notFound() called
  page.tsx
  products/
    error.tsx          ← catches only products errors
    loading.tsx        ← products-specific skeleton
    page.tsx
```

---

## 7. Route Handlers (API Routes)

```tsx
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const products = await searchProducts(query);
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = ProductSchema.parse(body);
  const product = await createProduct(validated);
  return NextResponse.json(product, { status: 201 });
}
```

---

## Anti-Patterns

```
❌ 'use client' on page.tsx — makes entire page client-side
✅ 'use client' only on interactive leaf components

❌ fetch() inside useEffect for initial data
✅ fetch in Server Component, pass as prop

❌ Separate API route for every Server Action
✅ Use Server Actions directly for mutations

❌ { cache: 'no-store' } everywhere
✅ Cache aggressively, revalidateTag() after mutations

❌ useRouter().push() after form submit in Client Component
✅ redirect() inside Server Action

❌ Large Client Component with mixed data + UI
✅ Async Server Component for data → pass to Client for interactivity
```

---

## Quick Reference

| Pattern | Solution |
|---|---|
| Fetch data | Server Component async/await |
| Mutate data | Server Action + revalidateTag |
| Client interactivity | 'use client' on leaf component |
| Cache per page | export const revalidate = N |
| Always fresh | export const dynamic = 'force-dynamic' |
| Error boundary | error.tsx in segment |
| Loading UI | loading.tsx or Suspense |
| Stream slow data | Suspense + async Server Component |
| SEO metadata | export const metadata or generateMetadata |
| API endpoint | app/api/route/route.ts |
