import { getPool } from '../db/pool';
import {
  RevenueWindow,
  CategorySummary,
  CustomerLTV,
  TopProduct,
  DashboardReport,
  FilterOptions,
} from '../types';

function buildWhere(opts: FilterOptions, alias = 'o'): { clause: string; params: (string | number)[] } {
  const conds: string[] = [];
  const params: (string | number)[] = [];
  let i = 1;
  if (opts.from)     { conds.push(`${alias}.ordered_at >= $${i++}`); params.push(opts.from); }
  if (opts.to)       { conds.push(`${alias}.ordered_at <= $${i++}`); params.push(opts.to); }
  if (opts.category) { conds.push(`p.category = $${i++}`);           params.push(opts.category); }
  if (opts.city)     { conds.push(`c.city = $${i++}`);               params.push(opts.city); }
  return { clause: conds.length ? 'WHERE ' + conds.join(' AND ') : '', params };
}

/**
 * 7-day moving average + running cumulative total + rank within category.
 * Uses three OVER clauses on the same base query (Day 119 pattern).
 */
export async function getRevenueWindows(opts: FilterOptions): Promise<RevenueWindow[]> {
  const pool = getPool();
  const { clause, params } = buildWhere(opts);
  const limit = opts.limit ?? 200;

  const result = await pool.query<RevenueWindow>(
    `SELECT
       o.ordered_at::text,
       p.name AS product_name,
       p.category,
       o.revenue::float,
       AVG(o.revenue) OVER (
         PARTITION BY p.category
         ORDER BY o.ordered_at
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       )::float AS revenue_7d_ma,
       SUM(o.revenue) OVER (
         ORDER BY o.ordered_at
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       )::float AS running_total,
       RANK() OVER (
         PARTITION BY p.category
         ORDER BY o.revenue DESC
       )::int AS rank_in_category
     FROM orders o
     JOIN products  p ON p.id = o.product_id
     JOIN customers c ON c.id = o.customer_id
     ${clause}
     ORDER BY o.ordered_at
     LIMIT $${params.length + 1}`,
    [...params, limit]
  );
  return result.rows;
}

/**
 * Monthly revenue per category, with LAG for previous month and MoM %
 * change. (Day 117 + 119 CTE pattern)
 */
export async function getCategorySummary(opts: FilterOptions): Promise<CategorySummary[]> {
  const pool = getPool();
  const { clause, params } = buildWhere(opts);

  const result = await pool.query<CategorySummary>(
    `WITH monthly AS (
       SELECT
         p.category,
         TO_CHAR(DATE_TRUNC('month', o.ordered_at), 'YYYY-MM') AS month,
         SUM(o.revenue)::float  AS total_revenue,
         COUNT(*)::int          AS total_orders,
         AVG(o.revenue)::float  AS avg_order_value
       FROM orders o
       JOIN products  p ON p.id = o.product_id
       JOIN customers c ON c.id = o.customer_id
       ${clause}
       GROUP BY p.category, month
     )
     SELECT
       category,
       SUM(total_revenue)::float  AS total_revenue,
       SUM(total_orders)::int     AS total_orders,
       AVG(avg_order_value)::float AS avg_order_value,
       LAG(SUM(total_revenue), 1) OVER (
         PARTITION BY category ORDER BY MAX(month)
       )::float AS prev_month_revenue,
       ROUND(
         (SUM(total_revenue) - LAG(SUM(total_revenue),1) OVER (PARTITION BY category ORDER BY MAX(month)))
         / NULLIF(LAG(SUM(total_revenue),1) OVER (PARTITION BY category ORDER BY MAX(month)), 0)
         * 100, 2
       )::float AS mom_change_pct
     FROM monthly
     GROUP BY category, month
     ORDER BY total_revenue DESC`,
    params
  );
  return result.rows;
}

/**
 * Customer lifetime value with PERCENT_RANK and NTILE(4) band.
 * (Day 119 percentile band pattern applied to customer spend)
 */
export async function getCustomerLTV(opts: FilterOptions): Promise<CustomerLTV[]> {
  const pool = getPool();
  const { clause, params } = buildWhere(opts);
  const limit = opts.limit ?? 50;

  const result = await pool.query<CustomerLTV>(
    `SELECT
       c.id AS customer_id,
       c.name AS customer_name,
       c.city,
       SUM(o.revenue)::float  AS total_spent,
       COUNT(o.id)::int       AS order_count,
       AVG(o.revenue)::float  AS avg_order_value,
       ROUND(
         PERCENT_RANK() OVER (ORDER BY SUM(o.revenue)) * 100, 1
       )::float AS ltv_percentile,
       CASE NTILE(4) OVER (ORDER BY SUM(o.revenue))
         WHEN 1 THEN 'Bronze'
         WHEN 2 THEN 'Silver'
         WHEN 3 THEN 'Gold'
         WHEN 4 THEN 'Platinum'
       END AS ltv_band
     FROM orders o
     JOIN products  p ON p.id = o.product_id
     JOIN customers c ON c.id = o.customer_id
     ${clause}
     GROUP BY c.id, c.name, c.city
     ORDER BY total_spent DESC
     LIMIT $${params.length + 1}`,
    [...params, limit]
  );
  return result.rows;
}

/**
 * Top products ranked overall and within category using two RANK()
 * window functions in the same query.
 */
export async function getTopProducts(opts: FilterOptions): Promise<TopProduct[]> {
  const pool = getPool();
  const { clause, params } = buildWhere(opts);
  const limit = opts.limit ?? 20;

  const result = await pool.query<TopProduct>(
    `SELECT
       p.id AS product_id,
       p.name AS product_name,
       p.category,
       SUM(o.revenue)::float  AS total_revenue,
       SUM(o.quantity)::int   AS units_sold,
       RANK() OVER (ORDER BY SUM(o.revenue) DESC)::int                    AS rank_overall,
       RANK() OVER (PARTITION BY p.category ORDER BY SUM(o.revenue) DESC)::int AS rank_in_category
     FROM orders o
     JOIN products  p ON p.id = o.product_id
     JOIN customers c ON c.id = o.customer_id
     ${clause}
     GROUP BY p.id, p.name, p.category
     ORDER BY rank_overall
     LIMIT $${params.length + 1}`,
    [...params, limit]
  );
  return result.rows;
}

/** Builds the full dashboard report for export. */
export async function getDashboardReport(opts: FilterOptions): Promise<DashboardReport> {
  const pool = getPool();
  const { clause, params } = buildWhere(opts);

  const totals = await pool.query(
    `SELECT
       COALESCE(SUM(o.revenue),0)::float AS total_revenue,
       COUNT(o.id)::int                  AS total_orders,
       COUNT(DISTINCT o.customer_id)::int AS total_customers
     FROM orders o
     JOIN products  p ON p.id = o.product_id
     JOIN customers c ON c.id = o.customer_id
     ${clause}`,
    params
  );

  const [catRows, prodRows, custRows] = await Promise.all([
    getCategorySummary(opts),
    getTopProducts({ ...opts, limit: 10 }),
    getCustomerLTV({ ...opts, limit: 10 }),
  ]);

  const t = totals.rows[0];
  return {
    generatedAt: new Date().toISOString(),
    period: { from: opts.from || 'all', to: opts.to || 'all' },
    totalRevenue: t.total_revenue,
    totalOrders: t.total_orders,
    totalCustomers: t.total_customers,
    categoryBreakdown: catRows,
    topProducts: prodRows,
    topCustomers: custRows,
  };
}
