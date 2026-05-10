import { getPool } from './pool';

const TABLE_NAME = process.env.TABLE_NAME || 'sales_records';

export async function runMigrations(): Promise<void> {
    const pool = getPool();

    console.log('[DB] Running migrations...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
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

    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_category   ON ${TABLE_NAME} (category);
    CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_order_date ON ${TABLE_NAME} (order_date);
    CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_city       ON ${TABLE_NAME} (city);
  `);

    console.log(`[DB] Table "${TABLE_NAME}" ready.`);
}

export async function truncateTable(): Promise<void> {
    const pool = getPool();
    const table = process.env.TABLE_NAME || 'sales_records';
    await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY`);
    console.log(`[DB] Table "${table}" truncated for fresh load.`);
}