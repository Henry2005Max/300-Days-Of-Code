import { getPool } from '../db/pool';
import { DailyOHLCRow, QueryOptions } from '../types';

/**
 * Computes daily Open / High / Low / Close aggregates for each sensor —
 * the same OHLC format used for financial candlestick charts, applied
 * here to IoT sensor data.
 *
 * FIRST_VALUE and LAST_VALUE with ROWS BETWEEN UNBOUNDED PRECEDING AND
 * UNBOUNDED FOLLOWING give the first and last reading within each
 * (sensor, day) partition, which is Open and Close respectively.
 *
 * These are computed in a CTE because FIRST_VALUE / LAST_VALUE need the
 * full frame before we can GROUP BY, so we window-annotate the raw rows
 * first, then aggregate.
 */
export async function getDailyOHLC(options: QueryOptions): Promise<DailyOHLCRow[]> {
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

  const result = await pool.query<DailyOHLCRow>(
    `WITH annotated AS (
       SELECT
         DATE(recorded_at)  AS day,
         sensor_id,
         value,
         FIRST_VALUE(value) OVER (
           PARTITION BY sensor_id, DATE(recorded_at)
           ORDER BY recorded_at
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
         ) AS open_val,
         LAST_VALUE(value) OVER (
           PARTITION BY sensor_id, DATE(recorded_at)
           ORDER BY recorded_at
           ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
         ) AS close_val
       FROM metrics
       ${where}
     )
     SELECT
       day::text,
       sensor_id,
       MIN(open_val)::float  AS open,
       MAX(value)::float     AS high,
       MIN(value)::float     AS low,
       MIN(close_val)::float AS close,
       ROUND(AVG(value)::numeric, 4)::float AS avg_value,
       COUNT(*)::int         AS reading_count
     FROM annotated
     GROUP BY day, sensor_id
     ORDER BY sensor_id, day`,
    params
  );

  return result.rows;
}
