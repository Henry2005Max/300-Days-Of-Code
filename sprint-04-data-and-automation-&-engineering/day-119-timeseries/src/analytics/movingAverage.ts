import { getPool } from '../db/pool';
import { MovingAverageRow, QueryOptions } from '../types';

/**
 * Computes 7-day and 30-day moving averages alongside the raw value,
 * plus the previous reading via LAG() and the percentage change between
 * consecutive readings.
 *
 * Window frame:
 *   AVG(value) OVER (
 *     PARTITION BY sensor_id
 *     ORDER BY recorded_at
 *     ROWS BETWEEN 6 PRECEDING AND CURRENT ROW   -- 7-day
 *   )
 *
 * LAG(value, 1) OVER (PARTITION BY sensor_id ORDER BY recorded_at)
 * returns the immediately preceding reading for the same sensor.
 */
export async function getMovingAverages(options: QueryOptions): Promise<MovingAverageRow[]> {
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

  const result = await pool.query<MovingAverageRow>(
    `SELECT
       recorded_at::text,
       sensor_id,
       value::float,
       AVG(value) OVER (
         PARTITION BY sensor_id
         ORDER BY recorded_at
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       )::float AS ma_7,
       AVG(value) OVER (
         PARTITION BY sensor_id
         ORDER BY recorded_at
         ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
       )::float AS ma_30,
       LAG(value, 1) OVER (
         PARTITION BY sensor_id ORDER BY recorded_at
       )::float AS prev_value,
       ROUND(
         (value - LAG(value, 1) OVER (PARTITION BY sensor_id ORDER BY recorded_at))
         / NULLIF(LAG(value, 1) OVER (PARTITION BY sensor_id ORDER BY recorded_at), 0)
         * 100,
         2
       )::float AS change_pct
     FROM metrics
     ${where}
     ORDER BY sensor_id, recorded_at
     LIMIT $${i}`,
    [...params, limit]
  );

  return result.rows;
}
