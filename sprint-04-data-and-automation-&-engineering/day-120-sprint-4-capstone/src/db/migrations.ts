import { getPool } from './pool';

/**
 * Full schema for the capstone:
 *  - products  with tsvector FTS (Day 117 pattern)
 *  - customers
 *  - orders    with GENERATED ALWAYS AS revenue (Day 118 pattern)
 *  - BRIN index on orders.ordered_at (Day 119 pattern)
 *  - GIN index on products.search_vector
 */
export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      category      TEXT NOT NULL,
      price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
      stock         INTEGER NOT NULL DEFAULT 0,
      search_vector TSVECTOR,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      city       TEXT NOT NULL,
      state      TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_id  INTEGER NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
      quantity    INTEGER NOT NULL CHECK (quantity > 0),
      unit_price  NUMERIC(12,2) NOT NULL,
      revenue     NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
      status      TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
      ordered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- GIN for FTS (Day 117)
    CREATE INDEX IF NOT EXISTS idx_products_fts  ON products USING GIN (search_vector);
    -- BRIN for time-series orders (Day 119)
    CREATE INDEX IF NOT EXISTS idx_orders_brin   ON orders   USING BRIN (ordered_at);
    CREATE INDEX IF NOT EXISTS idx_orders_cat    ON orders   (product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_cust   ON orders   (customer_id);

    -- Trigger: auto-update search_vector on products (Day 117)
    CREATE OR REPLACE FUNCTION products_fts_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name,        '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.category,    '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_products_fts ON products;
    CREATE TRIGGER trg_products_fts
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION products_fts_update();
  `);
}
