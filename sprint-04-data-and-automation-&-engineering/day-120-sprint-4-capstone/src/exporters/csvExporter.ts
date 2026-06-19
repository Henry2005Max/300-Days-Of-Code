import { stringify } from 'csv-stringify/sync';
import { DashboardReport } from '../types';

function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export function buildCsv(report: DashboardReport): Buffer {
  const sections: string[] = [];

  sections.push(stringify([
    ['E-Commerce Analytics Dashboard'],
    [`Generated: ${report.generatedAt}`],
    [`Period: ${report.period.from} → ${report.period.to}`],
    [],
    ['TOTALS', '', ''],
    ['Total Revenue', 'Total Orders', 'Total Customers'],
    [naira(report.totalRevenue), report.totalOrders, report.totalCustomers],
    [],
  ]));

  sections.push(stringify([
    ['CATEGORY BREAKDOWN', '', '', '', '', ''],
    ['Category', 'Revenue', 'Orders', 'Avg Order', 'Prev Month', 'MoM Change'],
    ...report.categoryBreakdown.map((c) => [
      c.category,
      naira(c.total_revenue),
      c.total_orders,
      naira(c.avg_order_value),
      c.prev_month_revenue != null ? naira(c.prev_month_revenue) : 'N/A',
      c.mom_change_pct != null ? `${c.mom_change_pct}%` : 'N/A',
    ]),
    [],
  ]));

  sections.push(stringify([
    ['TOP PRODUCTS', '', '', '', '', ''],
    ['Rank', 'Product', 'Category', 'Revenue', 'Units', 'Category Rank'],
    ...report.topProducts.map((p) => [
      p.rank_overall, p.product_name, p.category,
      naira(p.total_revenue), p.units_sold, p.rank_in_category,
    ]),
    [],
  ]));

  sections.push(stringify([
    ['TOP CUSTOMERS', '', '', '', '', ''],
    ['Customer', 'City', 'Total Spent', 'Orders', 'Avg Order', 'LTV Band'],
    ...report.topCustomers.map((c) => [
      c.customer_name, c.city,
      naira(c.total_spent), c.order_count,
      naira(c.avg_order_value), c.ltv_band,
    ]),
  ]));

  return Buffer.from(sections.join('\n'));
}
