import { getPool } from '../db/pool';
import { GapRow, QueryOptions } from '../types';

/**
 * Finds gaps in sensor data — intervals where no reading was recorded
 * for longer than a specified threshold.
 *
 * Uses LEAD(recorded_at, 1) OVER (PARTITION BY sensor_id ORDER BY recorded_at)
 * to look at the next reading for the same sensor. If the gap between the
 * current reading and the next exceeds minGapHours, it is reported as a
 * gap event with its start time, end time, and duration.
 */
export async function detectGaps(
  options: QueryOptions,
  minGapHours = 2
): Promise<GapRow[]> {
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
  params.push(minGapHours);

  const result = await pool.query<GapRow>(
    `WITH lead_cte AS (
       SELECT
         sensor_id,
         recorded_at AS gap_start,
         LEAD(recorded_at, 1) OVER (
           PARTITION BY sensor_id ORDER BY recorded_at
         ) AS gap_end
       FROM metrics
       ${where}
     )
     SELECT
       sensor_id,
       gap_start::text,
       gap_end::text,
       ROUND(
         EXTRACT(EPOCH FROM (gap_end - gap_start)) / 3600,
         2
       )::float AS gap_hours
     FROM lead_cte
     WHERE gap_end IS NOT NULL
       AND EXTRACT(EPOCH FROM (gap_end - gap_start)) / 3600 > $${i}
     ORDER BY gap_hours DESC`,
    params
  );

  return result.rows;
}
