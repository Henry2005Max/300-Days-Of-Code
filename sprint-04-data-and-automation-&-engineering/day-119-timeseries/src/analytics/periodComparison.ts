import { getPool } from '../db/pool';
import { PeriodComparisonRow, QueryOptions } from '../types';

/**
 * Aggregates readings by calendar month per sensor, then uses LAG() to
 * pull the previous month's average into the same row, giving a clean
 * month-over-month comparison with percentage change.
 *
 * The window function runs over the CTE result:
 *   LAG(avg_value, 1) OVER (PARTITION BY sensor_id ORDER BY period)
 *
 * RANK() OVER (PARTITION BY period ORDER BY avg_value DESC) ranks each
 * sensor within its month by average value.
 */
export async function getPeriodComparison(options: QueryOptions): Promise<PeriodComparisonRow[]> {
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

  const result = await pool.query<PeriodComparisonRow>(
    `WITH monthly AS (
       SELECT
         TO_CHAR(DATE_TRUNC('month', recorded_at), 'YYYY-MM') AS period,
         sensor_id,
         ROUND(AVG(value)::numeric, 4)::float AS avg_value
       FROM metrics
       ${where}
       GROUP BY period, sensor_id
     )
     SELECT
       period,
       sensor_id,
       avg_value,
       LAG(avg_value, 1) OVER (
         PARTITION BY sensor_id ORDER BY period
       )::float AS prev_avg,
       ROUND(
         (avg_value - LAG(avg_value, 1) OVER (PARTITION BY sensor_id ORDER BY period))
         / NULLIF(LAG(avg_value, 1) OVER (PARTITION BY sensor_id ORDER BY period), 0)
         * 100,
         2
       )::float AS change_pct,
       RANK() OVER (
         PARTITION BY period ORDER BY avg_value DESC
       )::int AS rank_in_period
     FROM monthly
     ORDER BY sensor_id, period`,
    params
  );

  return result.rows;
}
