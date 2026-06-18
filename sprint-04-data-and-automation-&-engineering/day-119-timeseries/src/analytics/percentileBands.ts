import { getPool } from '../db/pool';
import { PercentileBandRow, QueryOptions } from '../types';

/**
 * Assigns each reading a percentile position within its sensor's
 * distribution using PERCENT_RANK(), and buckets it into a named band
 * using NTILE(4) (quartiles).
 *
 * PERCENT_RANK() OVER (PARTITION BY sensor_id ORDER BY value)
 *   returns 0.0–1.0 (0 = lowest reading ever, 1 = highest).
 *
 * NTILE(4) OVER (PARTITION BY sensor_id ORDER BY value)
 *   splits readings into four equal-sized buckets (quartiles):
 *   1 = bottom 25%, 2 = 25–50%, 3 = 50–75%, 4 = top 25%.
 *   We map these to named bands (Low / Below Average / Above Average / High).
 */
export async function getPercentileBands(options: QueryOptions): Promise<PercentileBandRow[]> {
  const pool = getPool();
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let i = 1;

  if (options.sensorId)   { conditions.push(`sensor_id = $${i++}`);   params.push(options.sensorId); }
  if (options.city)       { conditions.push(`city = $${i++}`);        params.push(options.city); }
  if (options.metricType) { conditions.push(`metric_type = $${i++}`); params.push(options.metricType); }
  if (options.from)       { conditions.push(`recorded_at >= $${i++}`);params.push(options.from); }
  if (options.to)         { conditions.push(`recorded_at <= $${i++}`);params.push(options.to); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const limit = options.limit ?? 200;

  const result = await pool.query<PercentileBandRow>(
    `SELECT
       recorded_at::text,
       sensor_id,
       value::float,
       ROUND(
         PERCENT_RANK() OVER (PARTITION BY sensor_id ORDER BY value) * 100,
         1
       )::float AS percentile,
       CASE NTILE(4) OVER (PARTITION BY sensor_id ORDER BY value)
         WHEN 1 THEN 'Low'
         WHEN 2 THEN 'Below Average'
         WHEN 3 THEN 'Above Average'
         WHEN 4 THEN 'High'
       END AS band
     FROM metrics
     ${where}
     ORDER BY sensor_id, recorded_at
     LIMIT $${i}`,
    [...params, limit]
  );

  return result.rows;
}
