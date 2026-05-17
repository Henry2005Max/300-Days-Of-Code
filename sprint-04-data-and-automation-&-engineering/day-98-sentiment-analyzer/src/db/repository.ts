import { getPool }        from './pool';
import { SentimentResult, AggregateReport } from '../types';

export async function upsertResult(result: SentimentResult): Promise<number> {
    const pool = getPool();

    const { rows } = await pool.query(
        `INSERT INTO sentiment_results
       (input_id, text, source, category, label, score, magnitude, word_count, analyzed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     ON CONFLICT (input_id) DO UPDATE SET
       label       = EXCLUDED.label,
       score       = EXCLUDED.score,
       magnitude   = EXCLUDED.magnitude,
       word_count  = EXCLUDED.word_count,
       analyzed_at = NOW()
     RETURNING id`,
        [result.inputId, result.text, result.source, result.category,
            result.label, result.score, result.magnitude, result.wordCount]
    );

    const resultId = (rows[0] as { id: number }).id;

    // Replace entities and keywords on upsert
    await pool.query(`DELETE FROM sentiment_entities WHERE result_id = $1`, [resultId]);
    await pool.query(`DELETE FROM sentiment_keywords WHERE result_id = $1`, [resultId]);

    for (const entity of result.entities) {
        await pool.query(
            `INSERT INTO sentiment_entities (result_id, text, type) VALUES ($1,$2,$3)`,
            [resultId, entity.text, entity.type]
        );
    }

    for (const keyword of result.keywords) {
        await pool.query(
            `INSERT INTO sentiment_keywords (result_id, keyword) VALUES ($1,$2)`,
            [resultId, keyword]
        );
    }

    return resultId;
}

export async function getAggregateReport(): Promise<AggregateReport> {
    const pool = getPool();

    const { rows: summary } = await pool.query(`
    SELECT
      COUNT(*)                        AS total,
      SUM(CASE WHEN label = 'positive' THEN 1 ELSE 0 END) AS positive_count,
      SUM(CASE WHEN label = 'negative' THEN 1 ELSE 0 END) AS negative_count,
      SUM(CASE WHEN label = 'neutral'  THEN 1 ELSE 0 END) AS neutral_count,
      ROUND(AVG(score)::NUMERIC, 4)                        AS avg_score,
      ROUND(AVG(magnitude)::NUMERIC, 4)                    AS avg_magnitude
    FROM sentiment_results
  `);

    const { rows: keywords } = await pool.query(`
    SELECT keyword, COUNT(*) AS count
    FROM sentiment_keywords
    GROUP BY keyword
    ORDER BY count DESC
    LIMIT 10
  `);

    const { rows: entities } = await pool.query(`
    SELECT text, type, COUNT(*) AS count
    FROM sentiment_entities
    GROUP BY text, type
    ORDER BY count DESC
    LIMIT 10
  `);

    const { rows: categories } = await pool.query(`
    SELECT category, ROUND(AVG(score)::NUMERIC, 4) AS avg_score, COUNT(*) AS count
    FROM sentiment_results
    GROUP BY category
    ORDER BY count DESC
  `);

    const s = summary[0] as Record<string, string>;

    return {
        totalAnalyzed:    parseInt(s.total, 10),
        positiveCount:    parseInt(s.positive_count, 10),
        negativeCount:    parseInt(s.negative_count, 10),
        neutralCount:     parseInt(s.neutral_count,  10),
        avgScore:         parseFloat(s.avg_score),
        avgMagnitude:     parseFloat(s.avg_magnitude),
        topKeywords:      (keywords as Record<string, string>[]).map((r) => ({
            keyword: r.keyword,
            count:   parseInt(r.count, 10),
        })),
        topEntities:      (entities as Record<string, string>[]).map((r) => ({
            text:  r.text,
            type:  r.type,
            count: parseInt(r.count, 10),
        })),
        categoryBreakdown: (categories as Record<string, string>[]).map((r) => ({
            category: r.category,
            avgScore: parseFloat(r.avg_score),
            count:    parseInt(r.count, 10),
        })),
    };
}

export async function getAllResults(): Promise<SentimentResult[]> {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT
      sr.input_id   AS "inputId",
      sr.text,
      sr.source,
      sr.category,
      sr.label,
      sr.score,
      sr.magnitude,
      sr.word_count AS "wordCount",
      sr.analyzed_at AS "analyzedAt",
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('text', se.text, 'type', se.type))
        FILTER (WHERE se.id IS NOT NULL), '[]'
      ) AS entities,
      COALESCE(
        array_agg(DISTINCT sk.keyword) FILTER (WHERE sk.keyword IS NOT NULL), '{}'
      ) AS keywords
    FROM sentiment_results sr
    LEFT JOIN sentiment_entities se ON se.result_id = sr.id
    LEFT JOIN sentiment_keywords sk ON sk.result_id = sr.id
    GROUP BY sr.id
    ORDER BY sr.analyzed_at DESC
  `);

    return rows.map((r: Record<string, unknown>) => ({
        inputId:    r.inputId   as string,
        text:       r.text      as string,
        source:     r.source    as string,
        category:   r.category  as 'news' | 'review' | 'social' | 'finance',
        label:      r.label     as 'positive' | 'negative' | 'neutral',
        score:      parseFloat(r.score      as string),
        magnitude:  parseFloat(r.magnitude  as string),
        wordCount:  r.wordCount as number,
        analyzedAt: new Date(r.analyzedAt   as string),
        entities:   r.entities  as { text: string; type: 'person' | 'place' | 'organization' | 'topic' }[],
        keywords:   r.keywords  as string[],
    }));
}