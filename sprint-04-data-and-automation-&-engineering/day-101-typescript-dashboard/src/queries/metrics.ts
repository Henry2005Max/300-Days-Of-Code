import { getPool } from '../db/pool';
import { DashboardMetrics, SummaryMetrics, ProductRow, CategoryRow, TrendRow } from '../types';

const TABLE = 'sales_records';

async function fetchSummary(): Promise<SummaryMetrics> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      SUM(total_amount)             AS total_revenue,
      COUNT(*)                      AS total_orders,
      AVG(total_amount)             AS avg_order_value,
      COUNT(DISTINCT product)       AS unique_products,
      COUNT(DISTINCT city)          AS unique_cities
    FROM ${TABLE}
  `);
    const r = rows[0] as Record<string, string>;
    return {
        totalRevenue:   parseFloat(r.total_revenue  || '0'),
        totalOrders:    parseInt(r.total_orders      || '0', 10),
        avgOrderValue:  parseFloat(r.avg_order_value || '0'),
        uniqueProducts: parseInt(r.unique_products   || '0', 10),
        uniqueCities:   parseInt(r.unique_cities     || '0', 10),
    };
}

async function fetchTopProducts(): Promise<ProductRow[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      product,
      category,
      SUM(total_amount) AS total_revenue,
      COUNT(*)          AS order_count
    FROM ${TABLE}
    GROUP BY product, category
    ORDER BY total_revenue DESC
    LIMIT 6
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        product:      r.product,
        category:     r.category,
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
    }));
}

async function fetchCategories(): Promise<CategoryRow[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    WITH totals AS (SELECT SUM(total_amount) AS grand FROM ${TABLE})
    SELECT
      category,
      SUM(total_amount)                              AS total_revenue,
      COUNT(*)                                       AS order_count,
      ROUND(SUM(total_amount) / totals.grand * 100, 1) AS revenue_share
    FROM ${TABLE}, totals
    GROUP BY category, totals.grand
    ORDER BY total_revenue DESC
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        category:     r.category,
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
        revenueShare: parseFloat(r.revenue_share),
    }));
}

async function fetchMonthlyTrend(): Promise<TrendRow[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      TO_CHAR(order_date, 'Mon YY') AS month,
      TO_CHAR(order_date, 'YYYY-MM') AS sort_key,
      SUM(total_amount)             AS total_revenue,
      COUNT(*)                      AS order_count
    FROM ${TABLE}
    GROUP BY month, sort_key
    ORDER BY sort_key ASC
    LIMIT 6
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        month:        r.month,
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
    }));
}

export async function fetchAllMetrics(): Promise<DashboardMetrics> {
    const [summary, topProducts, categories, monthlyTrend] = await Promise.all([
        fetchSummary(),
        fetchTopProducts(),
        fetchCategories(),
        fetchMonthlyTrend(),
    ]);
    return { summary, topProducts, categories, monthlyTrend, lastUpdated: new Date() };
}