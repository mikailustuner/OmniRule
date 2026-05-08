---
name: svelte-expert
description: "Svelte: Reactive components, Stores, Transitions, SSR with SvelteKit, Performance patterns."
triggers:
  files: ["svelte.config.js", "svelte.config.ts"]
  directories: ["src/routes/", "src/lib/"]
  keywords: ["Svelte", "sveltejs", "SvelteKit", "store", "reactive"]
auto_load_when: "Building applications with Svelte or SvelteKit"
agent: frontend-ops
tools: ["Read", "Write", "Bash"]
---

# Svelte Architecture Patterns

**Focus:** Reactive components, stores, SSR, performance

## 1. Component Patterns

```
Svelte 5 Runes (New):
<script>
  let count = $state(0);
  let double = $derived(count * 2);

  function increment() {
    count += 1;
  }

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<button onclick={increment}>
  {count} x 2 = {double}
</button>

Legacy Svelte 4:
<script>
  let count = 0;
  $: double = count * 2;
  $: console.log('Count:', count);
</script>

Component Props:
<script>
  let { name, age = 18, ...rest } = $props();
</script>

<h1 {...rest}>{name} - {age}</h1>

Component Events:
<script>
  let { onclick } = $props();
</script>

<button {onclick}>Click me</button>

export function createEventDispatcher() {
  return (type, detail) => {
    const e = new CustomEvent(type, { detail });
    dispatch('event', e);
  };
}
```

---

## 2. Stores & State

```
Writable Store:
import { writable } from 'svelte/store'

export const count = writable(0)

// Usage in component
<script>
  import { count } from './stores.js'
  $: console.log($count) // Reactive auto-subscription
</script>

<button onclick={() => $count++}>
  {$count}
</button>

Readable Store:
import { readable } from 'svelte/store'

export const time = readable(new Date(), set => {
  const interval = setInterval(() => set(new Date()), 1000)
  return () => clearInterval(interval)
})

Derived Store:
import { derived } from 'svelte/store'
export const doubled = derived(count, $count => $count * 2)

Store with Methods:
function createCounter() {
  const { subscribe, update } = writable(0)
  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => update(() => 0)
  }
}
export const counter = createCounter()
```

---

## 3. SvelteKit Routing

```
File-based Routing:
src/routes/
├── +page.svelte          → /
├── +layout.svelte        → Shared layout
├── +page.server.ts        → SSR data loading
├── +page.ts              → Client-side loading
├── +error.svelte         → Error page
├── /api/
│   └── +server.ts        → API endpoint
└── /blog/
    ├── +page.svelte      → /blog
    └── [slug]/
        └── +page.svelte  → /blog/:slug

Page Data Loading:
export const load = async ({ params }) => {
  const post = await fetchPost(params.slug)
  return { post }
}

// +page.svelte
<script>
  let { data } = $props()
</script>

<h1>{data.post.title}</h1>

Form Actions:
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData()
    await saveUser(Object.fromEntries(data))
    return { success: true }
  }
}

// +page.svelte
<form method="POST">
  <input name="name" />
  <button>Submit</button>
</form>
```

---

## 4. Transitions & Animations

```
Built-in Transitions:
<script>
  import { fade, fly, slide } from 'svelte/transition'
  let visible = true
</script>

{#if visible}
  <div transition:fade>Fades in and out</div>
  <div transition:fly={{ y: 20, duration: 300 }}>Flies in</div>
  <div transition:slide>Slides in and out</div>
{/if}

Custom Transitions:
<script>
  function spin(node, { duration }) {
    return {
      duration,
      css: t => `transform: rotate(${t * 360}deg)`
    }
  }
</script>

<div transition:spin={{ duration: 1000 }}>Spinning</div>

Keyed Transitions:
{#each items as item (item.id)}
  <div transition:fade>{item.name}</div>
{/each}

Motion (svelte/motion):
<script>
  import { spring, tweened } from 'svelte/motion'
  const count = spring(0, { stiffness: 0.1, damping: 0.4 })
  const progress = tweened(0, { duration: 500 })
</script>
```

---

## 5. SSR & Hydration

```
SSR Configuration (svelte.config.js):
import adapter from '@sveltejs/adapter-auto'

export default {
  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['*']
    }
  }
}

Client-side Navigation:
import { goto } from '$app/navigation'
import { invalidateAll } from '$app/navigation'

// Navigate
goto('/profile')

// Invalidate data
invalidateAll()

// Invalidate specific URL
invalidate('data/url')

Load Options:
export const load = async ({ fetch, data, params }) => {
  // Server + client
}

export const ssr = true // Enable SSR
export const csr = true // Enable hydration
export const prerender = true // Static generation
```

---

## Key Patterns

1. **Use Runes (Svelte 5)** — $state, $derived, $effect for reactivity
2. **Stores for global state** — Use derived stores for computed values
3. **File-based routing** — SvelteKit standard routing
4. **Transitions built-in** — Use svelte/transition for animations
5. **SSR by default** — Use +page.server.ts for server data
6. **Form actions** — Use actions for server mutations

---

## Anti-Patterns

```
❌ Mutating objects directly
✅ Use $state() or $derived() in Svelte 5

❌ Using complex stores for local state
✅ Use local let variables

❌ No error boundaries
✅ Use +error.svelte for error handling

❌ Not using key blocks for list transitions
✅ Use {#each items as item (item.id)}

❌ Fetching in component without loading state
✅ Use +page.server.ts for data loading

❌ Large bundle sizes
✅ Use dynamic imports for heavy components

❌ Not using form actions
✅ Use actions for mutations, not fetch
```

---

## Quick Reference

| Feature | Syntax | Note |
|---|---|---|
| Reactive | $state(value) | Svelte 5 |
| Derived | $derived(expr) | Svelte 5 |
| Effect | $effect(() => {}) | Svelte 5 |
| Store | writable(initial) | Global state |
| Route load | +page.server.ts | SSR data |
| Form action | actions in +page.server.ts | Server mutation |
| Transition | transition:fade | Built-in |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
