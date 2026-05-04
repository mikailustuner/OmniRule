/**
 * Minimal reactive store — ported from CldSRC/src/state/store.ts
 *
 * Usage:
 *   const store = createStore({ count: 0 });
 *   const unsub = store.subscribe(() => console.log(store.getState()));
 *   store.setState(prev => ({ ...prev, count: prev.count + 1 }));
 *   unsub();
 */

type Listener = () => void;
type OnChange<T> = (args: { newState: T; oldState: T }) => void;

export type Store<T> = {
  getState: () => T;
  setState: (updater: (prev: T) => T) => void;
  subscribe: (listener: Listener) => () => void;
};

export function createStore<T>(initialState: T, onChange?: OnChange<T>): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,

    setState: (updater) => {
      const prev = state;
      const next = updater(prev);
      if (Object.is(next, prev)) return;
      state = next;
      onChange?.({ newState: next, oldState: prev });
      for (const listener of listeners) listener();
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Derived store — recomputes when source changes.
 *
 * Usage:
 *   const count = createStore({ value: 5 });
 *   const doubled = deriveStore(count, s => s.value * 2);
 */
export function deriveStore<T, U>(source: Store<T>, selector: (state: T) => U): Store<U> {
  const derived = createStore<U>(selector(source.getState()));
  source.subscribe(() => {
    derived.setState(() => selector(source.getState()));
  });
  return derived;
}
