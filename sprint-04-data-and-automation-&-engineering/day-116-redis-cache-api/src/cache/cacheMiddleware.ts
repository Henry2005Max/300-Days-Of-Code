import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from './redisClient';
import { incrementStat } from './cacheStats';
import { logCacheEvent } from '../utils/logger';

/**
 * Builds the Redis key for a request: cache:<METHOD>:<originalUrl>.
 * Including the full URL (path + query string) means different query
 * combinations (e.g. ?page=2 vs ?page=3) get their own cache entries.
 */
export function buildCacheKey(req: Request): string {
  return `cache:${req.method}:${req.originalUrl}`;
}

/**
 * Generic read-through caching middleware.
 *
 * - On a cache HIT: responds immediately with the cached JSON, skipping
 *   the route handler entirely. Sets `X-Cache: HIT`.
 * - On a cache MISS: lets the route handler run, then intercepts
 *   res.json() to store the response body in Redis under the request's
 *   cache key for ttlSeconds before sending it. Sets `X-Cache: MISS`.
 * - If Redis is unreachable, this is a no-op (calls next() immediately),
 *   so the API still works without a cache.
 */
export function cacheMiddleware(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const client = await getRedisClient();
    if (!client) {
      next();
      return;
    }

    const key = buildCacheKey(req);

    try {
      const cached = await client.get(key);
      if (cached !== null) {
        await incrementStat('hits');
        logCacheEvent('HIT', key);
        res.set('X-Cache', 'HIT');
        res.set('Content-Type', 'application/json');
        res.send(cached);
        return;
      }
    } catch (err) {
      logCacheEvent('ERROR', key, (err as Error).message);
      next();
      return;
    }

    await incrementStat('misses');
    logCacheEvent('MISS', key);
    res.set('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      client.set(key, JSON.stringify(body), { EX: ttlSeconds }).catch((err: Error) => {
        logCacheEvent('ERROR', key, err.message);
      });
      incrementStat('sets').catch(() => undefined);
      logCacheEvent('SET', key, `ttl ${ttlSeconds}s`);
      return originalJson(body);
    }) as Response['json'];

    next();
  };
}
