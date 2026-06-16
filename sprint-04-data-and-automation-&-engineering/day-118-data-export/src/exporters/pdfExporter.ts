import PDFDocument from 'pdfkit';
import { SalesReport } from '../types';

const BRAND_GREEN = '#1F6B37';
const LIGHT_GREEN = '#E8F5E9';
const DARK_GREY = '#333333';
const MID_GREY = '#666666';

function formatNaira(n: number): string {
  return `\u20a6${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Collects PDFKit output chunks into a Buffer. PDFKit emits 'data'
 * events as it writes; we gather them all and resolve when 'end' fires.
 */
function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function drawSectionHeader(doc: PDFKit.PDFDocument, text: string): void {
  doc.moveDown(0.5);
  doc
    .fillColor(BRAND_GREEN)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(text);
  doc
    .moveTo(doc.page.margins.left, doc.y + 2)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
    .strokeColor(BRAND_GREEN)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.4);
}

interface ColDef {
  header: string;
  width: number;
  align?: 'left' | 'right' | 'center';
}

function drawTable(
  doc: PDFKit.PDFDocument,
  cols: ColDef[],
  rows: string[][],
  startX: number
): void {
  const ROW_H = 18;
  const HEADER_H = 20;
  const PADDING = 4;

  // Header
  doc.rect(startX, doc.y, cols.reduce((s, c) => s + c.width, 0), HEADER_H)
    .fill(BRAND_GREEN);
  let x = startX;
  const headerY = doc.y + PADDING;
  cols.forEach((col) => {
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
      .text(col.header, x + PADDING, headerY, { width: col.width - PADDING * 2, align: col.align ?? 'left' });
    x += col.width;
  });
  doc.y += HEADER_H;

  // Data rows
  rows.forEach((row, rowIdx) => {
    // Page break guard
    if (doc.y + ROW_H > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

    const rowY = doc.y;
    const bg = rowIdx % 2 === 1 ? LIGHT_GREEN : '#FFFFFF';
    doc.rect(startX, rowY, cols.reduce((s, c) => s + c.width, 0), ROW_H).fill(bg);

    x = startX;
    row.forEach((cell, ci) => {
      doc.fillColor(DARK_GREY).font('Helvetica').fontSize(8)
        .text(cell, x + PADDING, rowY + PADDING, {
          width: cols[ci].width - PADDING * 2,
          align: cols[ci].align ?? 'left',
          lineBreak: false,
        });
      x += cols[ci].width;
    });

    doc.y = rowY + ROW_H;
  });
}

/**
 * Builds a styled PDF report:
 *  - Cover block with title, period, and generated timestamp
 *  - Totals KPI row
 *  - Regional breakdown table
 *  - Category breakdown table
 *  - Top 10 reps table
 *  - Full transaction listing
 */
export async function buildPdf(report: SalesReport): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const bufPromise = pdfToBuffer(doc);
  const LEFT = doc.page.margins.left;

  // ── Cover ────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 90).fill(BRAND_GREEN);
  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('Sales Performance Report', LEFT, 20);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(`Period: ${report.period.from}  →  ${report.period.to}`, LEFT, 50)
    .text(`Generated: ${new Date(report.generatedAt).toLocaleString('en-NG')}`, LEFT, 65);

  doc.y = 105;

  // ── KPI totals ───────────────────────────────────────────────────────
  const kpis = [
    { label: 'Total Revenue', value: formatNaira(report.totals.revenue) },
    { label: 'Units Sold', value: String(report.totals.units) },
    { label: 'Total Deals', value: String(report.totals.deals) },
  ];
  const kpiW = (doc.page.width - LEFT * 2) / kpis.length;
  kpis.forEach((kpi, i) => {
    const kx = LEFT + i * kpiW;
    doc.rect(kx, doc.y, kpiW - 6, 44).fill(LIGHT_GREEN);
    doc.fillColor(MID_GREY).font('Helvetica').fontSize(9).text(kpi.label, kx + 6, doc.y + 6, { width: kpiW - 12 });
    doc.fillColor(BRAND_GREEN).font('Helvetica-Bold').fontSize(14).text(kpi.value, kx + 6, doc.y + 20, { width: kpiW - 12 });
  });
  doc.y += 52;

  // ── By Region ────────────────────────────────────────────────────────
  drawSectionHeader(doc, 'Revenue by Region');
  drawTable(
    doc,
    [
      { header: 'Region', width: 110 },
      { header: 'Revenue', width: 110, align: 'right' },
      { header: 'Units', width: 60, align: 'right' },
      { header: 'Deals', width: 55, align: 'right' },
      { header: 'Avg Deal', width: 100, align: 'right' },
      { header: 'Top Product', width: 85 },
    ],
    report.byRegion.map((r) => [
      r.region,
      formatNaira(r.total_revenue),
      String(r.total_units),
      String(r.deal_count),
      formatNaira(r.avg_deal_size),
      r.top_product,
    ]),
    LEFT
  );

  // ── By Category ──────────────────────────────────────────────────────
  drawSectionHeader(doc, 'Revenue by Category');
  drawTable(
    doc,
    [
      { header: 'Category', width: 160 },
      { header: 'Revenue', width: 120, align: 'right' },
      { header: 'Units', width: 80, align: 'right' },
      { header: 'Deals', width: 80, align: 'right' },
    ],
    report.byCategory.map((c) => [
      c.category,
      formatNaira(c.total_revenue),
      String(c.total_units),
      String(c.deal_count),
    ]),
    LEFT
  );

  // ── Top Reps ─────────────────────────────────────────────────────────
  drawSectionHeader(doc, 'Top Sales Reps');
  drawTable(
    doc,
    [
      { header: 'Rep Name', width: 140 },
      { header: 'Region', width: 110 },
      { header: 'Revenue', width: 110, align: 'right' },
      { header: 'Deals', width: 60, align: 'right' },
      { header: 'Avg Deal', width: 100, align: 'right' },
    ],
    report.byRep.slice(0, 10).map((r) => [
      r.rep_name,
      r.region,
      formatNaira(r.total_revenue),
      String(r.deal_count),
      formatNaira(r.avg_deal_size),
    ]),
    LEFT
  );

  // ── Transactions ─────────────────────────────────────────────────────
  doc.addPage();
  drawSectionHeader(doc, 'Transaction Listing');
  drawTable(
    doc,
    [
      { header: 'Date', width: 68 },
      { header: 'Rep', width: 100 },
      { header: 'Region', width: 72 },
      { header: 'Product', width: 100 },
      { header: 'Category', width: 78 },
      { header: 'Units', width: 36, align: 'right' },
      { header: 'Revenue', width: 66, align: 'right' },
    ],
    report.rows.map((r) => [
      r.sale_date,
      r.rep_name,
      r.region,
      r.product,
      r.category,
      String(r.units),
      formatNaira(r.revenue),
    ]),
    LEFT
  );

  // Footer on every page
  const pageCount = doc.bufferedPageRange().count + 1;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc
      .fillColor(MID_GREY)
      .font('Helvetica')
      .fontSize(8)
      .text(
        `Page ${i + 1} of ${pageCount}   •   Day 118: Data Export Pipeline — 300 Days of Code`,
        LEFT,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - LEFT * 2 }
      );
  }

  doc.end();
  return bufPromise;
}
