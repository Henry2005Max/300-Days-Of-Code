import ExcelJS from 'exceljs';
import { SalesReport } from '../types';

const BRAND_GREEN = '1F6B37';
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_GREEN } };
const NAIRA_FMT = '₦#,##0.00';
const ALT_ROW: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };

function headerRow(ws: ExcelJS.Worksheet, cols: string[]): void {
  const row = ws.addRow(cols);
  row.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function autoWidth(ws: ExcelJS.Worksheet): void {
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 2, 40);
  });
}

/**
 * Builds a multi-sheet Excel workbook:
 *  Sheet 1 — Summary (totals, by-region, by-category)
 *  Sheet 2 — By Rep (individual rep performance)
 *  Sheet 3 — Transactions (all raw sale rows)
 * Returns the workbook as a Buffer ready to stream to the client.
 */
export async function buildExcel(report: SalesReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Henry Ehindero — 300 Days of Code';
  wb.created = new Date();

  // ── Sheet 1: Summary ─────────────────────────────────────────────────
  const summary = wb.addWorksheet('Summary');

  summary.mergeCells('A1:D1');
  const titleCell = summary.getCell('A1');
  titleCell.value = `Sales Report — ${report.period.from} → ${report.period.to}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };
  summary.addRow([]);

  // Totals block
  summary.addRow(['Metric', 'Value']);
  ['A3', 'B3'].forEach((addr) => {
    const c = summary.getCell(addr);
    c.font = HEADER_FONT;
    c.fill = HEADER_FILL;
  });
  summary.addRow(['Total Revenue', report.totals.revenue]);
  summary.getCell('B4').numFmt = NAIRA_FMT;
  summary.addRow(['Total Units Sold', report.totals.units]);
  summary.addRow(['Total Deals', report.totals.deals]);
  summary.addRow([]);

  // By region
  summary.addRow(['By Region', '', '', '', '', '']);
  summary.getCell(`A${summary.rowCount}`).font = { bold: true, size: 12 };
  headerRow(summary, ['Region', 'Revenue', 'Units', 'Deals', 'Avg Deal', 'Top Product']);
  report.byRegion.forEach((r, i) => {
    const row = summary.addRow([r.region, r.total_revenue, r.total_units, r.deal_count, r.avg_deal_size, r.top_product]);
    if (i % 2 === 1) row.eachCell((c) => { c.fill = ALT_ROW; });
    summary.getCell(`B${row.number}`).numFmt = NAIRA_FMT;
    summary.getCell(`E${row.number}`).numFmt = NAIRA_FMT;
  });
  summary.addRow([]);

  // By category
  summary.addRow(['By Category', '', '', '']);
  summary.getCell(`A${summary.rowCount}`).font = { bold: true, size: 12 };
  headerRow(summary, ['Category', 'Revenue', 'Units', 'Deals']);
  report.byCategory.forEach((c, i) => {
    const row = summary.addRow([c.category, c.total_revenue, c.total_units, c.deal_count]);
    if (i % 2 === 1) row.eachCell((cell) => { cell.fill = ALT_ROW; });
    summary.getCell(`B${row.number}`).numFmt = NAIRA_FMT;
  });

  autoWidth(summary);

  // ── Sheet 2: By Rep ───────────────────────────────────────────────────
  const repSheet = wb.addWorksheet('By Rep');
  headerRow(repSheet, ['Rep Name', 'Region', 'Revenue', 'Deals', 'Avg Deal Size']);
  report.byRep.forEach((r, i) => {
    const row = repSheet.addRow([r.rep_name, r.region, r.total_revenue, r.deal_count, r.avg_deal_size]);
    if (i % 2 === 1) row.eachCell((c) => { c.fill = ALT_ROW; });
    repSheet.getCell(`C${row.number}`).numFmt = NAIRA_FMT;
    repSheet.getCell(`E${row.number}`).numFmt = NAIRA_FMT;
  });
  autoWidth(repSheet);

  // ── Sheet 3: Transactions ─────────────────────────────────────────────
  const txSheet = wb.addWorksheet('Transactions');
  headerRow(txSheet, ['ID', 'Date', 'Rep', 'Region', 'Product', 'Category', 'Units', 'Unit Price', 'Revenue']);
  report.rows.forEach((r, i) => {
    const row = txSheet.addRow([
      r.id, r.sale_date, r.rep_name, r.region,
      r.product, r.category, r.units, r.unit_price, r.revenue,
    ]);
    if (i % 2 === 1) row.eachCell((c) => { c.fill = ALT_ROW; });
    txSheet.getCell(`H${row.number}`).numFmt = NAIRA_FMT;
    txSheet.getCell(`I${row.number}`).numFmt = NAIRA_FMT;
  });
  autoWidth(txSheet);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
