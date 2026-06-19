import { Request, Response, NextFunction } from 'express';
import { getRedis } from './redis';
import * as chalk from 'chalk';

export function cacheKey(req: Request): string {
  return `cap:${req.method}:${req.originalUrl}`;
}

export function cacheMiddleware(ttl: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const r = await getRedis();
    if (!r) { next(); return; }

    const key = cacheKey(req);
    try {
      const cached = await r.get(key);
      if (cached !== null) {
        console.log(chalk.green(`[cache HIT]  ${key}`));
        res.set('X-Cache', 'HIT').set('Content-Type', 'application/json').send(cached);
        return;
      }
    } catch { next(); return; }

    console.log(chalk.yellow(`[cache MISS] ${key}`));
    res.set('X-Cache', 'MISS');

    const orig = res.json.bind(res);
    res.json = ((body: unknown) => {
      r.set(key, JSON.stringify(body), { EX: ttl }).catch(() => undefined);
      console.log(chalk.cyan(`[cache SET]  ${key} (ttl ${ttl}s)`));
      return orig(body);
    }) as Response['json'];

    next();
  };
}

export async function invalidatePattern(pattern: string): Promise<number> {
  const r = await getRedis();
  if (!r) return 0;
  let cursor = 0; let deleted = 0;
  do {
    const res = await r.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = res.cursor;
    if (res.keys.length) deleted += await r.del(res.keys);
  } while (cursor !== 0);
  if (deleted) console.log(chalk.magenta(`[cache INVALIDATE] ${pattern} (${deleted} keys)`));
  return deleted;
}
