import { getPool } from './pool';

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id         SERIAL PRIMARY KEY,
      rep_name   TEXT NOT NULL,
      region     TEXT NOT NULL,
      product    TEXT NOT NULL,
      category   TEXT NOT NULL,
      units      INTEGER NOT NULL CHECK (units > 0),
      unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
      revenue    NUMERIC(12, 2) GENERATED ALWAYS AS (units * unit_price) STORED,
      sale_date  DATE NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sales_date     ON sales (sale_date);
    CREATE INDEX IF NOT EXISTS idx_sales_region   ON sales (region);
    CREATE INDEX IF NOT EXISTS idx_sales_category ON sales (category);
  `);
}
