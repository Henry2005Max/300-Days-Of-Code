import { getRedisClient } from './redisClient';
import { CacheStats } from '../types';

type StatName = 'hits' | 'misses' | 'sets';

/**
 * Increments a named cache statistic counter in Redis (cache:stats:hits,
 * cache:stats:misses, cache:stats:sets). Stored in Redis itself so the
 * counts persist across server restarts. No-op if Redis is unreachable.
 */
export async function incrementStat(stat: StatName): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;
  await client.incr(`cache:stats:${stat}`);
}

/**
 * Reads the current hit/miss/set counters and derives a hit rate
 * percentage. Returns all zeros if Redis is unreachable.
 */
export async function getStats(): Promise<CacheStats> {
  const client = await getRedisClient();
  if (!client) {
    return { hits: 0, misses: 0, sets: 0, hitRate: '0.00%' };
  }

  const [hits, misses, sets] = await Promise.all([
    client.get('cache:stats:hits'),
    client.get('cache:stats:misses'),
    client.get('cache:stats:sets'),
  ]);

  const h = Number(hits) || 0;
  const m = Number(misses) || 0;
  const total = h + m;
  const hitRate = total === 0 ? '0.00%' : `${((h / total) * 100).toFixed(2)}%`;

  return { hits: h, misses: m, sets: Number(sets) || 0, hitRate };
}

export async function resetStats(): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;
  await client.del(['cache:stats:hits', 'cache:stats:misses', 'cache:stats:sets']);
}
