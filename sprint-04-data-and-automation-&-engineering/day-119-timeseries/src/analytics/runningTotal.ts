import { getPool } from '../db/pool';
import { RunningTotalRow, QueryOptions } from '../types';

/**
 * Computes a cumulative running total per sensor, ordered by time,
 * plus a RANK() of each reading within its calendar day.
 *
 * SUM(value) OVER (PARTITION BY sensor_id ORDER BY recorded_at
 *                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
 * gives the cumulative total at each point in time.
 *
 * RANK() OVER (PARTITION BY sensor_id, DATE(recorded_at)
 *              ORDER BY value DESC)
 * shows where each reading sits in the daily ranking for that sensor
 * (rank 1 = highest reading of the day).
 */
export async function getRunningTotals(options: QueryOptions): Promise<RunningTotalRow[]> {
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

  const result = await pool.query<RunningTotalRow>(
    `SELECT
       recorded_at::text,
       sensor_id,
       value::float,
       SUM(value) OVER (
         PARTITION BY sensor_id
         ORDER BY recorded_at
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       )::float AS running_total,
       RANK() OVER (
         PARTITION BY sensor_id, DATE(recorded_at)
         ORDER BY value DESC
       )::int AS daily_rank
     FROM metrics
     ${where}
     ORDER BY sensor_id, recorded_at
     LIMIT $${i}`,
    [...params, limit]
  );

  return result.rows;
}
