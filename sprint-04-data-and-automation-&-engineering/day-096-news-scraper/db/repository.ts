import { getPool } from './pool';
import { Article, DigestSection } from '../types';

export async function insertArticle(article: Article): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO articles (title, summary, url, source, category, scraped_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (url) DO NOTHING`,
        [article.title, article.summary, article.url, article.source, article.category]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function getRecentArticles(limit = 50): Promise<Article[]> {
    const pool = getPool();
    const { rows } = await pool.query(
        `SELECT id, title, summary, url, source, category, scraped_at AS "scrapedAt"
     FROM articles
     ORDER BY scraped_at DESC
     LIMIT $1`,
        [limit]
    );
    return rows as Article[];
}

export async function getDigestSections(): Promise<DigestSection[]> {
    const pool = getPool();

    const { rows: categories } = await pool.query(
        `SELECT DISTINCT category FROM articles ORDER BY category`
    );

    const sections: DigestSection[] = [];

    for (const { category } of categories as { category: string }[]) {
        const { rows } = await pool.query(
            `SELECT id, title, summary, url, source, category, scraped_at AS "scrapedAt"
       FROM articles
       WHERE category = $1
       ORDER BY scraped_at DESC
       LIMIT 5`,
            [category]
        );
        sections.push({ category, articles: rows as Article[] });
    }

    return sections;
}

export async function getTotalCount(): Promise<number> {
    const pool = getPool();
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM articles`);
    return parseInt((rows[0] as { count: string }).count, 10);
}