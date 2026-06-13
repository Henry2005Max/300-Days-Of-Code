import { Router, Request, Response } from 'express';
import { getStats, resetStats } from '../cache/cacheStats';
import { invalidateCache } from '../cache/invalidate';

const router = Router();

// GET /api/cache/stats - hit/miss/set counters and hit rate
router.get('/stats', async (req: Request, res: Response) => {
  const stats = await getStats();
  res.json(stats);
});

// DELETE /api/cache - flush every cached response and reset counters
router.delete('/', async (req: Request, res: Response) => {
  const keysDeleted = await invalidateCache('cache:*');
  await resetStats();
  res.json({ message: 'Cache cleared', keysDeleted });
});

export default router;
