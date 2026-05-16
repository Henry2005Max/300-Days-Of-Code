import { getPool } from './pool';

export async function runMigrations(): Promise<void> {
    const pool = getPool();
    console.log('[DB] Running migrations...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      symbol   VARCHAR(20)  PRIMARY KEY,
      name     VARCHAR(150) NOT NULL,
      type     VARCHAR(10)  NOT NULL CHECK (type IN ('stock', 'forex')),
      currency VARCHAR(10)  NOT NULL
    )
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS price_history (
      id          SERIAL PRIMARY KEY,
      symbol      VARCHAR(20)    NOT NULL REFERENCES assets(symbol) ON DELETE CASCADE,
      price       NUMERIC(18, 6) NOT NULL,
      open        NUMERIC(18, 6) NOT NULL,
      high        NUMERIC(18, 6) NOT NULL,
      low         NUMERIC(18, 6) NOT NULL,
      volume      BIGINT,
      recorded_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
      UNIQUE (symbol, recorded_at)
    )
  `);

    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history (symbol);
    CREATE INDEX IF NOT EXISTS idx_price_history_time   ON price_history (recorded_at DESC);
  `);

    console.log('[DB] Tables "assets" and "price_history" ready.');
}