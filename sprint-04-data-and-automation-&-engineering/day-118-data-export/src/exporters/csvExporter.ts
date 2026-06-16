import { stringify } from 'csv-stringify/sync';
import { SalesReport } from '../types';

function formatNaira(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Builds a multi-section CSV: a summary block at the top (totals,
 * by-region, by-category), then the full transaction rows below it.
 * Returns the CSV as a Buffer ready to pipe to the response.
 */
export function buildCsv(report: SalesReport): Buffer {
  const sections: string[] = [];

  // Header meta
  sections.push(
    stringify([['Sales Report'], [`Generated: ${report.generatedAt}`], [`Period: ${report.period.from} → ${report.period.to}`], []])
  );

  // Totals
  sections.push(
    stringify(
      [
        ['TOTALS', '', ''],
        ['Total Revenue', 'Total Units', 'Total Deals'],
        [formatNaira(report.totals.revenue), report.totals.units, report.totals.deals],
        [],
      ]
    )
  );

  // By region
  sections.push(
    stringify([
      ['BY REGION', '', '', '', '', ''],
      ['Region', 'Revenue', 'Units', 'Deals', 'Avg Deal', 'Top Product'],
      ...report.byRegion.map((r) => [
        r.region,
        formatNaira(r.total_revenue),
        r.total_units,
        r.deal_count,
        formatNaira(r.avg_deal_size),
        r.top_product,
      ]),
      [],
    ])
  );

  // By category
  sections.push(
    stringify([
      ['BY CATEGORY', '', '', ''],
      ['Category', 'Revenue', 'Units', 'Deals'],
      ...report.byCategory.map((c) => [
        c.category,
        formatNaira(c.total_revenue),
        c.total_units,
        c.deal_count,
      ]),
      [],
    ])
  );

  // Transaction rows
  sections.push(
    stringify([
      ['TRANSACTIONS', '', '', '', '', '', '', '', ''],
      ['ID', 'Date', 'Rep', 'Region', 'Product', 'Category', 'Units', 'Unit Price', 'Revenue'],
      ...report.rows.map((r) => [
        r.id,
        r.sale_date,
        r.rep_name,
        r.region,
        r.product,
        r.category,
        r.units,
        formatNaira(r.unit_price),
        formatNaira(r.revenue),
      ]),
    ])
  );

  return Buffer.from(sections.join('\n'));
}
