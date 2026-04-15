import { CacheEntry } from "../types";

/* ── Generic TTL cache ───────────────────────────────────────────────
   Same pattern as Day 67 but now supports a per-entry TTL.
   Different proxy routes have different freshness requirements:
   - Weather: 10 minutes (changes often)
   - Countries: 24 hours (almost never changes)
   - Exchange rates: 1 hour (changes throughout the day)
────────────────────────────────────────────────────────────────────── */
const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): { data: T; cachedAt: number; expiresAt: number } | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, {
    data,
    cachedAt:  Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

export function cacheStats() {
  const now = Date.now();
  return {
    size: store.size,
    entries: Array.from(store.entries()).map(([key, e]) => {
      const entry = e as CacheEntry<unknown>;
      return {
        key,
        cachedAt:        new Date(entry.cachedAt).toISOString(),
        expiresInSeconds: Math.max(0, Math.round((entry.expiresAt - now) / 1000)),
      };
    }),
  };
}

export function cacheClear(): void { store.clear(); }