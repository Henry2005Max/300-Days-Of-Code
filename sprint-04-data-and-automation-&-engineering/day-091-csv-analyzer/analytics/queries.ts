import { getPool } from '../db/pool';
import {
    AnalyticsReport,
    SummaryStats,
    ProductStat,
    CategoryStat,
    CityStat,
    MonthlyTrend,
} from '../types';

const TABLE = process.env.TABLE_NAME || 'sales_records';

async function getSummary(): Promise<SummaryStats> {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                   AS total_records,
      SUM(total_amount)                          AS total_revenue,
      AVG(total_amount)                          AS avg_order_value,
      MAX(total_amount)                          AS max_order_value,
      MIN(total_amount)                          AS min_order_value,
      COUNT(DISTINCT product)                    AS unique_products,
      COUNT(DISTINCT customer_name)              AS unique_customers,
      COUNT(DISTINCT city)                       AS unique_cities,
      MIN(order_date)::TEXT                      AS date_from,
      MAX(order_date)::TEXT                      AS date_to
    FROM ${TABLE}
  `);

    const r = rows[0] as Record<string, string>;
    return {
        totalRecords:    parseInt(r.total_records, 10),
        totalRevenue:    parseFloat(r.total_revenue),
        avgOrderValue:   parseFloat(r.avg_order_value),
        maxOrderValue:   parseFloat(r.max_order_value),
        minOrderValue:   parseFloat(r.min_order_value),
        uniqueProducts:  parseInt(r.unique_products, 10),
        uniqueCustomers: parseInt(r.unique_customers, 10),
        uniqueCities:    parseInt(r.unique_cities, 10),
        dateRange:       { from: r.date_from, to: r.date_to },
    };
}

async function getTopProducts(limit = 10): Promise<ProductStat[]> {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT
      product,
      category,
      SUM(total_amount)  AS total_revenue,
      SUM(quantity)      AS total_quantity,
      COUNT(*)           AS order_count
    FROM ${TABLE}
    GROUP BY product, category
    ORDER BY total_revenue DESC
    LIMIT $1
  `, [limit]);

    return (rows as Record<string, string>[]).map((r) => ({
        product:       r.product,
        category:      r.category,
        totalRevenue:  parseFloat(r.total_revenue),
        totalQuantity: parseInt(r.total_quantity, 10),
        orderCount:    parseInt(r.order_count, 10),
    }));
}

async function getCategoryBreakdown(): Promise<CategoryStat[]> {
    const pool = getPool();

    const { rows } = await pool.query(`
    WITH totals AS (SELECT SUM(total_amount) AS grand_total FROM ${TABLE})
    SELECT
      category,
      SUM(total_amount)                                    AS total_revenue,
      COUNT(*)                                             AS order_count,
      ROUND(SUM(total_amount) / totals.grand_total * 100, 2) AS revenue_share
    FROM ${TABLE}, totals
    GROUP BY category, totals.grand_total
    ORDER BY total_revenue DESC
  `);

    return (rows as Record<string, string>[]).map((r) => ({
        category:     r.category,
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
        revenueShare: parseFloat(r.revenue_share),
    }));
}

async function getCityBreakdown(limit = 10): Promise<CityStat[]> {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT
      city,
      state,
      SUM(total_amount) AS total_revenue,
      COUNT(*)          AS order_count
    FROM ${TABLE}
    GROUP BY city, state
    ORDER BY total_revenue DESC
    LIMIT $1
  `, [limit]);

    return (rows as Record<string, string>[]).map((r) => ({
        city:         r.city,
        state:        r.state,
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
    }));
}

async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
    const pool = getPool();

    const { rows } = await pool.query(`
    SELECT
      TO_CHAR(order_date, 'YYYY-MM') AS month,
      SUM(total_amount)              AS total_revenue,
      COUNT(*)                       AS order_count,
      AVG(total_amount)              AS avg_order_value
    FROM ${TABLE}
    GROUP BY month
    ORDER BY month ASC
  `);

    return (rows as Record<string, string>[]).map((r) => ({
        month:         r.month,
        totalRevenue:  parseFloat(r.total_revenue),
        orderCount:    parseInt(r.order_count, 10),
        avgOrderValue: parseFloat(r.avg_order_value),
    }));
}

export async function buildReport(): Promise<AnalyticsReport> {
    const [summary, topProducts, topCategories, cityBreakdown, monthlyTrend] = await Promise.all([
        getSummary(),
        getTopProducts(),
        getCategoryBreakdown(),
        getCityBreakdown(),
        getMonthlyTrend(),
    ]);

    return { summary, topProducts, topCategories, cityBreakdown, monthlyTrend };
}