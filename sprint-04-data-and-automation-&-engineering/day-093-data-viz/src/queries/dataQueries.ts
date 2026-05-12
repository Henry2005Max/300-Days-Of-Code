import { getPool } from '../db/pool';
import { CategoryRevenue, MonthlyTrend, TopProduct, CityRevenue, StockLevel } from '../types';

export async function getCategoryRevenue(): Promise<CategoryRevenue[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      category,
      SUM(total_amount)  AS total_revenue,
      COUNT(*)           AS order_count
    FROM sales_records
    GROUP BY category
    ORDER BY total_revenue DESC
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        category:      r.category,
        total_revenue: parseFloat(r.total_revenue),
        order_count:   parseInt(r.order_count, 10),
    }));
}

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      TO_CHAR(order_date, 'Mon YYYY') AS month,
      TO_CHAR(order_date, 'YYYY-MM')  AS sort_key,
      SUM(total_amount)               AS total_revenue,
      COUNT(*)                        AS order_count
    FROM sales_records
    GROUP BY month, sort_key
    ORDER BY sort_key ASC
  `);
    return (rows as Record<string, string>[]).map((r) => ({
        month:         r.month,
        total_revenue: parseFloat(r.total_revenue),
        order_count:   parseInt(r.order_count, 10),
    }));
}

export async function getTopProducts(limit = 8): Promise<TopProduct[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      product,
      category,
      SUM(total_amount) AS total_revenue,
      SUM(quantity)     AS total_quantity
    FROM sales_records
    GROUP BY product, category
    ORDER BY total_revenue DESC
    LIMIT $1
  `, [limit]);
    return (rows as Record<string, string>[]).map((r) => ({
        product:        r.product,
        category:       r.category,
        total_revenue:  parseFloat(r.total_revenue),
        total_quantity: parseInt(r.total_quantity, 10),
    }));
}

export async function getCityRevenue(limit = 8): Promise<CityRevenue[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      city,
      state,
      SUM(total_amount) AS total_revenue,
      COUNT(*)          AS order_count
    FROM sales_records
    GROUP BY city, state
    ORDER BY total_revenue DESC
    LIMIT $1
  `, [limit]);
    return (rows as Record<string, string>[]).map((r) => ({
        city:          r.city,
        state:         r.state,
        total_revenue: parseFloat(r.total_revenue),
        order_count:   parseInt(r.order_count, 10),
    }));
}

export async function getStockLevels(limit = 10): Promise<StockLevel[]> {
    const pool = getPool();
    const { rows } = await pool.query(`
    SELECT
      product,
      category,
      SUM(quantity) AS quantity
    FROM sales_records
    GROUP BY product, category
    ORDER BY quantity DESC
    LIMIT $1
  `, [limit]);
    return (rows as Record<string, string>[]).map((r) => ({
        product:  r.product,
        category: r.category,
        quantity: parseInt(r.quantity, 10),
    }));
}