import { getPool } from './pool';

const TABLE = process.env.TABLE_NAME || 'sales_records';

export async function runMigrations(): Promise<void> {
    const pool = getPool();
    console.log('[DB] Running migrations...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id            SERIAL PRIMARY KEY,
      order_id      VARCHAR(50)    NOT NULL,
      customer_name VARCHAR(150)   NOT NULL,
      product       VARCHAR(150)   NOT NULL,
      category      VARCHAR(100)   NOT NULL,
      quantity      INTEGER        NOT NULL CHECK (quantity > 0),
      unit_price    NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
      total_amount  NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
      city          VARCHAR(100)   NOT NULL,
      state         VARCHAR(100)   NOT NULL,
      order_date    DATE           NOT NULL,
      created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `);

    // Day 91 indexes
    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_${TABLE}_category   ON ${TABLE} (category);
    CREATE INDEX IF NOT EXISTS idx_${TABLE}_order_date ON ${TABLE} (order_date);
    CREATE INDEX IF NOT EXISTS idx_${TABLE}_city       ON ${TABLE} (city);
  `);

    // NEW Day 100 — additional indexes for new queries
    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_${TABLE}_customer ON ${TABLE} (customer_name);
    CREATE INDEX IF NOT EXISTS idx_${TABLE}_amount   ON ${TABLE} (total_amount);
  `);

    console.log(`[DB] Table "${TABLE}" ready with all indexes.`);
}

export async function truncateTable(): Promise<void> {
    const pool  = getPool();
    const table = process.env.TABLE_NAME || 'sales_records';
    await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY`);
}