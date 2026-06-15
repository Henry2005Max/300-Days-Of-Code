import { getPool } from '../db/pool';

/**
 * Returns the raw tsvector stored for a given article, broken down into
 * its individual lexemes with position and weight info. Useful for
 * understanding exactly what the FTS index knows about a document.
 */
export async function inspectVector(articleId: number): Promise<string> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT search_vector::text AS vector FROM articles WHERE id = $1`,
    [articleId]
  );
  return result.rows[0]?.vector ?? '(not found)';
}

/**
 * Converts a plain-English query to its tsquery form and shows the
 * resulting tsquery string, making it easy to see how PostgreSQL
 * interprets the search before running it.
 */
export async function explainQuery(query: string, language = 'english'): Promise<string> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT plainto_tsquery($1, $2)::text AS tsquery`,
    [language, query]
  );
  return result.rows[0]?.tsquery ?? '';
}

/**
 * Returns ts_stat data: every distinct lexeme across all articles, with
 * the number of documents (ndoc) and total occurrences (nentry) it
 * appears in, sorted by document frequency. Useful for seeing which
 * terms dominate the corpus.
 */
export async function corpusStats(topN = 20): Promise<{ word: string; ndoc: number; nentry: number }[]> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT word, ndoc, nentry
     FROM ts_stat('SELECT search_vector FROM articles')
     ORDER BY ndoc DESC
     LIMIT $1`,
    [topN]
  );
  return result.rows;
}
