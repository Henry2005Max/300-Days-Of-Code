import { getRedisClient } from './redisClient';
import { logCacheEvent } from '../utils/logger';

/**
 * Deletes every cache key matching the given glob pattern (e.g.
 * 'cache:GET:/api/products*'), using SCAN so it doesn't block Redis on
 * large keyspaces. Returns the number of keys deleted. No-op (returns 0)
 * if Redis is unreachable.
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const client = await getRedisClient();
  if (!client) return 0;

  let cursor = 0;
  let deleted = 0;

  do {
    const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = result.cursor;
    if (result.keys.length > 0) {
      deleted += await client.del(result.keys);
    }
  } while (cursor !== 0);

  if (deleted > 0) {
    logCacheEvent('INVALIDATE', pattern, `${deleted} key(s) removed`);
  }

  return deleted;
}
