import { CacheEntry } from "../types";

/* ── In-memory cache ─────────────────────────────────────────────────
   A Map where keys are URLs and values are cached scrape results.
   TTL (Time To Live) — entries expire after a set number of ms.
   Before scraping, we check the cache. If the entry exists and
   hasn't expired, we return it without making a network request.
   This is polite to the target site and faster for our API.
────────────────────────────────────────────────────────────────────── */
const cache = new Map<string, CacheEntry<unknown>>();
const TTL = Number(process.env.CACHE_TTL_MS) || 300_000; /* 5 minutes */

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  /* Check if expired */
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function cacheSet<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    cachedAt:  Date.now(),
    expiresAt: Date.now() + TTL,
  });
}

export function cacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    cachedAt:  new Date((entry as CacheEntry<unknown>).cachedAt).toISOString(),
    expiresIn: Math.max(0, Math.round(((entry as CacheEntry<unknown>).expiresAt - now) / 1000)),
  }));
  return { size: cache.size, ttlSeconds: TTL / 1000, entries };
}

export function cacheClear(): void {
  cache.clear();
}