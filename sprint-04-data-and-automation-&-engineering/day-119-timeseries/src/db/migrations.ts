import { getPool } from './pool';

/**
 * Creates the metrics table with a BRIN index on recorded_at.
 *
 * BRIN (Block Range Index) is ideal for time-series data that is inserted
 * in roughly chronological order: it stores only the min/max value per
 * block range (128 pages by default) rather than an entry per row, so it
 * is tiny compared to a B-tree index and very fast for date range scans
 * where rows are physically ordered by time on disk.
 */
export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS metrics (
      id          BIGSERIAL PRIMARY KEY,
      sensor_id   TEXT        NOT NULL,
      city        TEXT        NOT NULL,
      metric_type TEXT        NOT NULL,
      value       NUMERIC(10, 4) NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_metrics_brin
      ON metrics USING BRIN (recorded_at);

    CREATE INDEX IF NOT EXISTS idx_metrics_sensor
      ON metrics (sensor_id, recorded_at);

    CREATE INDEX IF NOT EXISTS idx_metrics_city
      ON metrics (city, metric_type);
  `);
}
