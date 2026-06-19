import { getPool } from '../db/pool';
import { SearchResult } from '../types';

export async function searchProducts(query: string, limit = 10): Promise<SearchResult[]> {
  const pool = getPool();
  const result = await pool.query<SearchResult>(
    `SELECT
       id, name, category, price::float,
       ts_rank_cd(search_vector, plainto_tsquery('english', $1)) AS rank,
       ts_headline(
         'english', description,
         plainto_tsquery('english', $1),
         'MaxWords=20, MinWords=10, StartSel=<b>, StopSel=</b>'
       ) AS headline
     FROM products
     WHERE search_vector @@ plainto_tsquery('english', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    [query, limit]
  );
  return result.rows;
}
