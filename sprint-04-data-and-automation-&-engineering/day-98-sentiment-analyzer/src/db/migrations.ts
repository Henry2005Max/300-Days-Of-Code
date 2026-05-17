import { getPool } from './pool';

export async function runMigrations(): Promise<void> {
    const pool = getPool();
    console.log('[DB] Running migrations...');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS sentiment_results (
      id          SERIAL       PRIMARY KEY,
      input_id    VARCHAR(100) NOT NULL UNIQUE,
      text        TEXT         NOT NULL,
      source      VARCHAR(150) NOT NULL,
      category    VARCHAR(50)  NOT NULL,
      label       VARCHAR(20)  NOT NULL,
      score       NUMERIC(5,4) NOT NULL,
      magnitude   NUMERIC(5,4) NOT NULL,
      word_count  INTEGER      NOT NULL,
      analyzed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS sentiment_entities (
      id         SERIAL       PRIMARY KEY,
      result_id  INTEGER      NOT NULL REFERENCES sentiment_results(id) ON DELETE CASCADE,
      text       VARCHAR(200) NOT NULL,
      type       VARCHAR(50)  NOT NULL
    )
  `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS sentiment_keywords (
      id        SERIAL       PRIMARY KEY,
      result_id INTEGER      NOT NULL REFERENCES sentiment_results(id) ON DELETE CASCADE,
      keyword   VARCHAR(100) NOT NULL
    )
  `);

    await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sentiment_label    ON sentiment_results (label);
    CREATE INDEX IF NOT EXISTS idx_sentiment_category ON sentiment_results (category);
    CREATE INDEX IF NOT EXISTS idx_sentiment_score    ON sentiment_results (score);
    CREATE INDEX IF NOT EXISTS idx_entities_result    ON sentiment_entities (result_id);
    CREATE INDEX IF NOT EXISTS idx_keywords_result    ON sentiment_keywords (result_id);
    CREATE INDEX IF NOT EXISTS idx_keywords_keyword   ON sentiment_keywords (keyword);
  `);

    console.log('[DB] Tables "sentiment_results", "sentiment_entities", "sentiment_keywords" ready.');
}