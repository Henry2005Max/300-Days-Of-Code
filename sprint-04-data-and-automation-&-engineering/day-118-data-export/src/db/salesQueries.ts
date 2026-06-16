import { getPool } from '../db/pool';
import { ExportOptions, SaleRow, RegionSummary, RepSummary, CategorySummary, SalesReport } from '../types';

function buildWhere(options: ExportOptions): { clause: string; params: (string | number)[] } {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let i = 1;

  if (options.from)     { conditions.push(`sale_date >= $${i++}`); params.push(options.from); }
  if (options.to)       { conditions.push(`sale_date <= $${i++}`); params.push(options.to); }
  if (options.region)   { conditions.push(`region = $${i++}`);     params.push(options.region); }
  if (options.category) { conditions.push(`category = $${i++}`);   params.push(options.category); }

  return {
    clause: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
  };
}

export async function fetchSalesReport(options: ExportOptions = {}): Promise<SalesReport> {
  const pool = getPool();
  const { clause, params } = buildWhere(options);

  // Raw rows
  const rowsResult = await pool.query<SaleRow>(
    `SELECT id, rep_name, region, product, category, units,
            unit_price::float AS unit_price, revenue::float AS revenue,
            sale_date::text AS sale_date
     FROM sales ${clause} ORDER BY sale_date, id`,
    params
  );

  // Totals
  const totalsResult = await pool.query(
    `SELECT COALESCE(SUM(revenue),0)::float AS revenue,
            COALESCE(SUM(units),0)::int    AS units,
            COUNT(*)::int                  AS deals
     FROM sales ${clause}`,
    params
  );

  // By region — top_product via a lateral subquery
  const regionResult = await pool.query<RegionSummary>(
    `SELECT s.region,
            SUM(s.revenue)::float    AS total_revenue,
            SUM(s.units)::int        AS total_units,
            COUNT(*)::int            AS deal_count,
            (AVG(s.revenue))::float  AS avg_deal_size,
            (SELECT product FROM sales s2
             WHERE s2.region = s.region ${options.from ? `AND s2.sale_date >= '${options.from}'` : ''}
                                        ${options.to   ? `AND s2.sale_date <= '${options.to}'`   : ''}
             GROUP BY product ORDER BY SUM(revenue) DESC LIMIT 1
            ) AS top_product
     FROM sales s ${clause}
     GROUP BY s.region ORDER BY total_revenue DESC`,
    params
  );

  // By rep
  const repResult = await pool.query<RepSummary>(
    `SELECT rep_name, region,
            SUM(revenue)::float  AS total_revenue,
            COUNT(*)::int        AS deal_count,
            AVG(revenue)::float  AS avg_deal_size
     FROM sales ${clause}
     GROUP BY rep_name, region ORDER BY total_revenue DESC`,
    params
  );

  // By category
  const catResult = await pool.query<CategorySummary>(
    `SELECT category,
            SUM(revenue)::float AS total_revenue,
            SUM(units)::int     AS total_units,
            COUNT(*)::int       AS deal_count
     FROM sales ${clause}
     GROUP BY category ORDER BY total_revenue DESC`,
    params
  );

  const t = totalsResult.rows[0];
  return {
    generatedAt: new Date().toISOString(),
    period: { from: options.from || 'all', to: options.to || 'all' },
    totals: { revenue: t.revenue, units: t.units, deals: t.deals },
    byRegion: regionResult.rows,
    byRep: repResult.rows,
    byCategory: catResult.rows,
    rows: rowsResult.rows,
  };
}
