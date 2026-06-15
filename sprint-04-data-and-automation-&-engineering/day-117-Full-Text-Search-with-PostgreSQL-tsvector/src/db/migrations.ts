import { getPool } from './pool';

/**
 * Creates the articles table with:
 *  - a tsvector column (search_vector) holding the pre-computed full-text
 *    index combining title (weight A), body (weight B), author and tags
 *    (weight C)
 *  - a GIN index on search_vector for fast FTS queries
 *  - a trigger that auto-updates search_vector whenever a row is inserted
 *    or updated, so the index is always current without any app-level work
 */
export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      body         TEXT NOT NULL,
      author       TEXT NOT NULL,
      category     TEXT NOT NULL,
      tags         TEXT[]  NOT NULL DEFAULT '{}',
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      search_vector TSVECTOR
    );
  `);

  // GIN index makes tsvector lookups fast (vs the default GIST which is
  // faster to build but slower at lookups).
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_articles_search_vector
    ON articles USING GIN (search_vector);
  `);

  // Supporting indexes for common filter columns.
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
    CREATE INDEX IF NOT EXISTS idx_articles_author   ON articles (author);
  `);

  // Trigger function: rebuilds the tsvector by concatenating the four
  // fields, weighted A (title) > B (body) > C (author, tags).
  await pool.query(`
    CREATE OR REPLACE FUNCTION articles_tsvector_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.body, '')), 'B')  ||
        setweight(to_tsvector('english', coalesce(NEW.author, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS trg_articles_tsvector ON articles;

    CREATE TRIGGER trg_articles_tsvector
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_tsvector_update();
  `);
}
