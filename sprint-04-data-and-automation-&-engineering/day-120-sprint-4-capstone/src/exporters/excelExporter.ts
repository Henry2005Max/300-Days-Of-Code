import ExcelJS from 'exceljs';
import { DashboardReport } from '../types';

const GREEN = '1F6B37';
const LIGHT = 'E8F5E9';
const WHITE = 'FFFFFFFF';
const NAIRA = '₦#,##0.00';
const H_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: WHITE }, size: 10 };
const H_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } };
const ALT_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } };

function addHeader(ws: ExcelJS.Worksheet, cols: string[]): void {
  const r = ws.addRow(cols);
  r.eachCell((c) => { c.font = H_FONT; c.fill = H_FILL; c.alignment = { horizontal: 'center' }; });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function autoWidth(ws: ExcelJS.Worksheet): void {
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (c) => {
      const l = String(c.value ?? '').length;
      if (l > max) max = l;
    });
    col.width = Math.min(max + 2, 40);
  });
}

export async function buildExcel(report: DashboardReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Henry Ehindero — 300 Days of Code Day 120';
  wb.created = new Date();

  // ── Summary ──────────────────────────────────────────────────────────
  const sum = wb.addWorksheet('Summary');
  sum.mergeCells('A1:D1');
  const title = sum.getCell('A1');
  title.value = `E-Commerce Dashboard — ${report.period.from} → ${report.period.to}`;
  title.font = { bold: true, size: 14 };
  title.alignment = { horizontal: 'center' };
  sum.addRow([]);
  sum.addRow(['Metric', 'Value']);
  ['A3', 'B3'].forEach((a) => { const c = sum.getCell(a); c.font = H_FONT; c.fill = H_FILL; });
  sum.addRow(['Total Revenue', report.totalRevenue]);
  sum.getCell('B4').numFmt = NAIRA;
  sum.addRow(['Total Orders', report.totalOrders]);
  sum.addRow(['Total Customers', report.totalCustomers]);
  sum.addRow([]);

  sum.addRow(['Category Breakdown']);
  sum.getCell(`A${sum.rowCount}`).font = { bold: true, size: 12 };
  addHeader(sum, ['Category', 'Revenue', 'Orders', 'Avg Order', 'MoM Change %']);
  report.categoryBreakdown.forEach((c, i) => {
    const r = sum.addRow([c.category, c.total_revenue, c.total_orders, c.avg_order_value, c.mom_change_pct]);
    if (i % 2 === 1) r.eachCell((cell) => { cell.fill = ALT_FILL; });
    sum.getCell(`B${r.number}`).numFmt = NAIRA;
    sum.getCell(`D${r.number}`).numFmt = NAIRA;
  });
  autoWidth(sum);

  // ── Top Products ─────────────────────────────────────────────────────
  const prod = wb.addWorksheet('Top Products');
  addHeader(prod, ['Rank', 'Product', 'Category', 'Revenue', 'Units', 'Category Rank']);
  report.topProducts.forEach((p, i) => {
    const r = prod.addRow([p.rank_overall, p.product_name, p.category, p.total_revenue, p.units_sold, p.rank_in_category]);
    if (i % 2 === 1) r.eachCell((c) => { c.fill = ALT_FILL; });
    prod.getCell(`D${r.number}`).numFmt = NAIRA;
  });
  autoWidth(prod);

  // ── Top Customers ────────────────────────────────────────────────────
  const cust = wb.addWorksheet('Top Customers');
  addHeader(cust, ['Customer', 'City', 'Total Spent', 'Orders', 'Avg Order', 'LTV %ile', 'Band']);
  report.topCustomers.forEach((c, i) => {
    const r = cust.addRow([c.customer_name, c.city, c.total_spent, c.order_count, c.avg_order_value, c.ltv_percentile, c.ltv_band]);
    if (i % 2 === 1) r.eachCell((cell) => { cell.fill = ALT_FILL; });
    cust.getCell(`C${r.number}`).numFmt = NAIRA;
    cust.getCell(`E${r.number}`).numFmt = NAIRA;
  });
  autoWidth(cust);

  return Buffer.from(await wb.xlsx.writeBuffer());
}
