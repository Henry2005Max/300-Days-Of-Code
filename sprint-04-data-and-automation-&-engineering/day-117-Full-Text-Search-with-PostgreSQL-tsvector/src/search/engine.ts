import { getPool } from '../db/pool';
import { SearchOptions, SearchResponse, SearchResult, Article } from '../types';

/**
 * Determines which tsquery function to use based on the query string:
 *
 * - "phrase search" (quoted)  → phraseto_tsquery   — words must appear in order
 * - word1 & word2 / word1 | word2 — websearch_to_tsquery — allows AND/OR/NOT/-
 * - plain words               → plainto_tsquery    — ANDs all words together
 *
 * Falls back to plainto_tsquery for safety.
 */
function tsqueryFn(query: string): string {
  if (query.startsWith('"') && query.endsWith('"')) return 'phraseto_tsquery';
  if (/[&|!-]/.test(query)) return 'websearch_to_tsquery';
  return 'plainto_tsquery';
}

/**
 * Full-text search over articles.
 *
 * Uses ts_rank_cd (cover density ranking) which rewards documents where
 * the query terms appear close together, rather than just counting
 * occurrences. Results are ordered by rank DESC.
 *
 * ts_headline generates a short snippet of body text with the matching
 * terms highlighted in <b> tags, with a max of 30 words shown.
 */
export async function searchArticles(options: SearchOptions): Promise<SearchResponse> {
  const pool = getPool();
  const { query, category, author, language = 'english', limit = 10, offset = 0 } = options;

  const fn = tsqueryFn(query);

  const conditions: string[] = [`search_vector @@ ${fn}($1, $2)`];
  const params: (string | number)[] = [language, query];
  let paramIdx = 3;

  if (category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(category);
  }

  if (author) {
    conditions.push(`author ILIKE $${paramIdx++}`);
    params.push(`%${author}%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM articles ${whereClause}`,
    params
  );
  const total = countResult.rows[0].total;

  const rows = await pool.query(
    `SELECT
       id, title, body, author, category, tags, published_at,
       ts_rank_cd(search_vector, ${fn}($1, $2)) AS rank,
       ts_headline(
         $1,
         body,
         ${fn}($1, $2),
         'MaxWords=30, MinWords=15, MaxFragments=2, StartSel=<b>, StopSel=</b>'
       ) AS headline
     FROM articles
     ${whereClause}
     ORDER BY rank DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  return {
    query,
    total,
    limit,
    offset,
    results: rows.rows as SearchResult[],
  };
}

/**
 * Returns a list of lexemes (stemmed words) from the articles table that
 * share the same stem as the provided prefix — useful for autocomplete
 * or "did you mean" suggestions. Uses ts_stat on all search_vectors to
 * find the most frequently occurring matching lexemes, sorted by document
 * frequency descending.
 */
export async function suggestTerms(prefix: string, limit = 5): Promise<string[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT word
     FROM ts_stat('SELECT search_vector FROM articles')
     WHERE word LIKE $1
     ORDER BY ndoc DESC
     LIMIT $2`,
    [`${prefix.toLowerCase()}%`, limit]
  );

  return result.rows.map((r) => r.word);
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, title, body, author, category, tags, published_at FROM articles WHERE id = $1',
    [id]
  );
  return result.rows[0] as Article | undefined;
}

export async function listCategories(): Promise<string[]> {
  const pool = getPool();
  const result = await pool.query('SELECT DISTINCT category FROM articles ORDER BY category');
  return result.rows.map((r) => r.category);
}

export async function listAuthors(): Promise<string[]> {
  const pool = getPool();
  const result = await pool.query('SELECT DISTINCT author FROM articles ORDER BY author');
  return result.rows.map((r) => r.author);
}
