import { getPool } from './pool';

export async function runMigrations(): Promise<void> {
    const pool = getPool();
    console.log('[DB] Running migrations...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id          SERIAL PRIMARY KEY,
      title       TEXT        NOT NULL,
      summary     TEXT        NOT NULL DEFAULT '',
      url         TEXT        NOT NULL UNIQUE,
      source      VARCHAR(100) NOT NULL,
      category    VARCHAR(100) NOT NULL,
      scraped_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_articles_source   ON articles (source);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
    CREATE INDEX IF NOT EXISTS idx_articles_scraped  ON articles (scraped_at DESC);
  `);

    console.log('[DB] Table "articles" ready.');
}