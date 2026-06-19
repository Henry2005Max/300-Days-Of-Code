import PDFDocument from 'pdfkit';
import { DashboardReport } from '../types';

const G = '#1F6B37';
const LG = '#E8F5E9';
const GREY = '#555555';

function naira(n: number) {
  return `\u20a6${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function pdfBuf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((res, rej) => {
    const c: Buffer[] = [];
    doc.on('data', (d: Buffer) => c.push(d));
    doc.on('end', () => res(Buffer.concat(c)));
    doc.on('error', rej);
  });
}

function section(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.5)
    .fillColor(G).font('Helvetica-Bold').fontSize(13).text(title)
    .moveTo(doc.page.margins.left, doc.y + 2)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
    .strokeColor(G).lineWidth(1).stroke()
    .moveDown(0.4);
}

interface Col { header: string; width: number; align?: 'left' | 'right'; }

function table(doc: PDFKit.PDFDocument, cols: Col[], rows: string[][], left: number): void {
  const RH = 18, HH = 20, P = 4;
  const totalW = cols.reduce((s, c) => s + c.width, 0);

  doc.rect(left, doc.y, totalW, HH).fill(G);
  let x = left;
  const hy = doc.y + P;
  cols.forEach((col) => {
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8.5)
      .text(col.header, x + P, hy, { width: col.width - P * 2, align: col.align ?? 'left' });
    x += col.width;
  });
  doc.y += HH;

  rows.forEach((row, ri) => {
    if (doc.y + RH > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const ry = doc.y;
    doc.rect(left, ry, totalW, RH).fill(ri % 2 ? LG : '#fff');
    x = left;
    row.forEach((cell, ci) => {
      doc.fillColor(GREY).font('Helvetica').fontSize(8)
        .text(cell, x + P, ry + P, { width: cols[ci].width - P * 2, align: cols[ci].align ?? 'left', lineBreak: false });
      x += cols[ci].width;
    });
    doc.y = ry + RH;
  });
}

export async function buildPdf(report: DashboardReport): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buf = pdfBuf(doc);
  const L = doc.page.margins.left;

  // Cover
  doc.rect(0, 0, doc.page.width, 85).fill(G);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(20)
    .text('E-Commerce Analytics Dashboard', L, 18);
  doc.fontSize(10).font('Helvetica')
    .text(`Period: ${report.period.from}  →  ${report.period.to}`, L, 48)
    .text(`Generated: ${new Date(report.generatedAt).toLocaleString('en-NG')}`, L, 62);
  doc.y = 100;

  // KPIs
  const kpis = [
    { label: 'Total Revenue',    value: naira(report.totalRevenue) },
    { label: 'Total Orders',     value: String(report.totalOrders) },
    { label: 'Total Customers',  value: String(report.totalCustomers) },
  ];
  const kw = (doc.page.width - L * 2) / 3;
  kpis.forEach((k, i) => {
    const kx = L + i * kw;
    doc.rect(kx, doc.y, kw - 6, 42).fill(LG);
    doc.fillColor(GREY).font('Helvetica').fontSize(8).text(k.label, kx + 6, doc.y + 5, { width: kw - 12 });
    doc.fillColor(G).font('Helvetica-Bold').fontSize(13).text(k.value, kx + 6, doc.y + 18, { width: kw - 12 });
  });
  doc.y += 50;

  // Category breakdown
  section(doc, 'Category Breakdown');
  table(doc,
    [
      { header: 'Category', width: 140 },
      { header: 'Revenue', width: 110, align: 'right' },
      { header: 'Orders', width: 60, align: 'right' },
      { header: 'Avg Order', width: 100, align: 'right' },
      { header: 'MoM %', width: 65, align: 'right' },
      { header: 'Prev Month', width: 45, align: 'right' },
    ],
    report.categoryBreakdown.map((c) => [
      c.category,
      naira(c.total_revenue),
      String(c.total_orders),
      naira(c.avg_order_value),
      c.mom_change_pct != null ? `${c.mom_change_pct}%` : '—',
      c.prev_month_revenue != null ? naira(c.prev_month_revenue) : '—',
    ]),
    L
  );

  // Top products
  section(doc, 'Top Products');
  table(doc,
    [
      { header: '#', width: 28 },
      { header: 'Product', width: 160 },
      { header: 'Category', width: 100 },
      { header: 'Revenue', width: 100, align: 'right' },
      { header: 'Units', width: 50, align: 'right' },
      { header: 'Cat Rank', width: 60, align: 'right' },
    ],
    report.topProducts.map((p) => [
      String(p.rank_overall), p.product_name, p.category,
      naira(p.total_revenue), String(p.units_sold), String(p.rank_in_category),
    ]),
    L
  );

  // Top customers
  section(doc, 'Top Customers by LTV');
  table(doc,
    [
      { header: 'Customer', width: 140 },
      { header: 'City', width: 90 },
      { header: 'Total Spent', width: 110, align: 'right' },
      { header: 'Orders', width: 55, align: 'right' },
      { header: 'Avg Order', width: 95, align: 'right' },
      { header: 'Band', width: 68 },
    ],
    report.topCustomers.map((c) => [
      c.customer_name, c.city,
      naira(c.total_spent), String(c.order_count),
      naira(c.avg_order_value), c.ltv_band,
    ]),
    L
  );

  // Footers
  const pages = doc.bufferedPageRange().count + 1;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    doc.fillColor(GREY).font('Helvetica').fontSize(8)
      .text(
        `Page ${i + 1} of ${pages}   •   Day 120: Sprint 4 Capstone — 300 Days of Code`,
        L, doc.page.height - 28,
        { align: 'center', width: doc.page.width - L * 2 }
      );
  }

  doc.end();
  return buf;
}
