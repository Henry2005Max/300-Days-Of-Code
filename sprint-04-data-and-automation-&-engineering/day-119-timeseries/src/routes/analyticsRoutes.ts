import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getMovingAverages } from '../analytics/movingAverage';
import { getRunningTotals } from '../analytics/runningTotal';
import { getPeriodComparison } from '../analytics/periodComparison';
import { getPercentileBands } from '../analytics/percentileBands';
import { getDailyOHLC } from '../analytics/ohlc';
import { detectGaps } from '../analytics/gapDetection';
import { getPool } from '../db/pool';

const router = Router();

const querySchema = z.object({
  sensorId:   z.string().optional(),
  city:       z.string().optional(),
  metricType: z.string().optional(),
  from:       z.string().optional(),
  to:         z.string().optional(),
  limit:      z.coerce.number().int().min(1).max(1000).optional(),
});

function parseOptions(query: Record<string, unknown>) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) throw new Error(JSON.stringify(parsed.error.flatten()));
  return parsed.data;
}

// GET /api/metrics — list raw readings
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    const pool = getPool();
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let i = 1;

    if (opts.sensorId)   { conditions.push(`sensor_id = $${i++}`);    params.push(opts.sensorId); }
    if (opts.city)       { conditions.push(`city = $${i++}`);         params.push(opts.city); }
    if (opts.metricType) { conditions.push(`metric_type = $${i++}`);  params.push(opts.metricType); }
    if (opts.from)       { conditions.push(`recorded_at >= $${i++}`); params.push(opts.from); }
    if (opts.to)         { conditions.push(`recorded_at <= $${i++}`); params.push(opts.to); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = opts.limit ?? 100;

    const result = await pool.query(
      `SELECT id, sensor_id, city, metric_type, value::float, recorded_at::text
       FROM metrics ${where} ORDER BY recorded_at DESC LIMIT $${i}`,
      [...params, limit]
    );
    res.json({ count: result.rowCount, rows: result.rows });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/moving-averages
router.get('/moving-averages', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    res.json(await getMovingAverages(opts));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/running-totals
router.get('/running-totals', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    res.json(await getRunningTotals(opts));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/period-comparison
router.get('/period-comparison', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    res.json(await getPeriodComparison(opts));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/percentile-bands
router.get('/percentile-bands', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    res.json(await getPercentileBands(opts));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/ohlc
router.get('/ohlc', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    res.json(await getDailyOHLC(opts));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/gaps?minGapHours=2
router.get('/gaps', async (req: Request, res: Response) => {
  try {
    const opts = parseOptions(req.query as Record<string, unknown>);
    const minGapHours = Number(req.query.minGapHours) || 2;
    res.json(await detectGaps(opts, minGapHours));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/analytics/sensors — list distinct sensor IDs and cities
router.get('/sensors', async (req: Request, res: Response) => {
  const pool = getPool();
  const result = await pool.query(
    `SELECT DISTINCT sensor_id, city, metric_type FROM metrics ORDER BY sensor_id`
  );
  res.json(result.rows);
});

export default router;
