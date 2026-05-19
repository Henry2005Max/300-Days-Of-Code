import { getPool } from '../db/pool';
import {
    SummaryStats, ProductStat, CategoryStat, CityStat, MonthlyTrend,
    CustomerSegment, RevenuePercentile, QueryPlan,
} from '../types';

const TABLE   = process.env.TABLE_NAME || 'sales_records';
const EXPLAIN = process.env.EXPLAIN === 'true';

async function maybeExplain(label: string, sql: string, params: unknown[] = []): Promise<QueryPlan | null> {
    if (!EXPLAIN) return null;
    const pool = getPool();
    const start = Date.now();
    const { rows } = await pool.query(`EXPLAIN ANALYZE ${sql}`, params);
    return {
        query:       label,
        planLines:   rows.map((r: Record<string, string>) => r['QUERY PLAN']),
        executionMs: Date.now() - start,
    };
}

// ── Day 91 queries (unchanged) ────────────────────────────────────────────

export async function getSummary(): Promise<SummaryStats> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      COUNT(*)                      AS total_records,
      SUM(total_amount)             AS total_revenue,
      AVG(total_amount)             AS avg_order_value,
      MAX(total_amount)             AS max_order_value,
      MIN(total_amount)             AS min_order_value,
      COUNT(DISTINCT product)       AS unique_products,
      COUNT(DISTINCT customer_name) AS unique_customers,
      COUNT(DISTINCT city)          AS unique_cities,
      MIN(order_date)::TEXT         AS date_from,
      MAX(order_date)::TEXT         AS date_to
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

export async function getTopProducts(limit = 10): Promise<ProductStat[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT product, category,
           SUM(total_amount) AS total_revenue,
           SUM(quantity)     AS total_quantity,
           COUNT(*)          AS order_count
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

export async function getCategoryBreakdown(): Promise<CategoryStat[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    WITH totals AS (SELECT SUM(total_amount) AS grand_total FROM ${TABLE})
    SELECT
      category,
      SUM(total_amount)                                        AS total_revenue,
      COUNT(*)                                                 AS order_count,
      ROUND(SUM(total_amount) / totals.grand_total * 100, 2)  AS revenue_share
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

export async function getCityBreakdown(limit = 10): Promise<CityStat[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT city, state, SUM(total_amount) AS total_revenue, COUNT(*) AS order_count
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

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
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

// ── NEW Day 100 queries ───────────────────────────────────────────────────

// Customer segmentation using window functions
export async function getCustomerSegments(): Promise<CustomerSegment[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    WITH customer_spend AS (
      SELECT
        customer_name,
        SUM(total_amount) AS total_spent
      FROM ${TABLE}
      GROUP BY customer_name
    ),
    segmented AS (
      SELECT
        customer_name,
        total_spent,
        NTILE(3) OVER (ORDER BY total_spent DESC) AS tile
      FROM customer_spend
    )
    SELECT
      CASE tile
        WHEN 1 THEN 'high-value'
        WHEN 2 THEN 'mid-value'
        ELSE        'low-value'
      END                    AS segment,
      COUNT(*)               AS customer_count,
      SUM(total_spent)       AS total_revenue,
      AVG(total_spent)       AS avg_spend,
      MIN(total_spent)       AS min_spend,
      MAX(total_spent)       AS max_spend
    FROM segmented
    GROUP BY tile
    ORDER BY tile
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        segment:       r.segment,
        customerCount: parseInt(r.customer_count, 10),
        totalRevenue:  parseFloat(r.total_revenue),
        avgSpend:      parseFloat(r.avg_spend),
        minSpend:      parseFloat(r.min_spend),
        maxSpend:      parseFloat(r.max_spend),
    }));
}

// Revenue percentiles using PostgreSQL percentile_cont
export async function getRevenuePercentiles(): Promise<RevenuePercentile> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_amount) AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_amount) AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_amount) AS p75,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_amount) AS p90,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY total_amount) AS p99
    FROM ${TABLE}
  `);
    const r = rows[0] as Record<string, string>;
    return {
        p25: parseFloat(r.p25),
        p50: parseFloat(r.p50),
        p75: parseFloat(r.p75),
        p90: parseFloat(r.p90),
        p99: parseFloat(r.p99),
    };
}

// Revenue by day of week
export async function getWeekdayRevenue(): Promise<{ day: string; totalRevenue: number; orderCount: number }[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      TO_CHAR(order_date, 'Day') AS day,
      EXTRACT(DOW FROM order_date)::INT AS day_num,
      SUM(total_amount) AS total_revenue,
      COUNT(*) AS order_count
    FROM ${TABLE}
    GROUP BY day, day_num
    ORDER BY day_num
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        day:          r.day.trim(),
        totalRevenue: parseFloat(r.total_revenue),
        orderCount:   parseInt(r.order_count, 10),
    }));
}

// EXPLAIN ANALYZE on key queries
export async function runExplainAnalyze(): Promise<QueryPlan[]> {
    const plans: QueryPlan[] = [];

    const queries: { label: string; sql: string }[] = [
        {
            label: 'Category GROUP BY',
            sql: `SELECT category, SUM(total_amount) FROM ${TABLE} GROUP BY category ORDER BY 2 DESC`,
        },
        {
            label: 'Monthly trend TO_CHAR',
            sql: `SELECT TO_CHAR(order_date, 'YYYY-MM'), COUNT(*), SUM(total_amount) FROM ${TABLE} GROUP BY 1 ORDER BY 1`,
        },
        {
            label: 'Top products ORDER BY revenue',
            sql: `SELECT product, SUM(total_amount) AS rev FROM ${TABLE} GROUP BY product ORDER BY rev DESC LIMIT 10`,
        },
        {
            label: 'Customer NTILE segmentation',
            sql: `SELECT customer_name, NTILE(3) OVER (ORDER BY SUM(total_amount) DESC) FROM ${TABLE} GROUP BY customer_name`,
        },
    ];

    const pool = getPool();
    for (const q of queries) {
        const start = Date.now();
        const { rows } = await pool.query(`EXPLAIN ANALYZE ${q.sql}`);
        plans.push({
            query:       q.label,
            planLines:   rows.map((r: Record<string, string>) => r['QUERY PLAN']),
            executionMs: Date.now() - start,
        });
    }

    return plans;
}