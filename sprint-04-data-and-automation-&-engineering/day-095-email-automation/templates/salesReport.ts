import { SalesReport, EmailPayload } from '../types';
import { NAIRA, baseLayout, sectionHeading, statCard, tableHeader, tableRow } from './base';

export function buildSalesReportEmail(report: SalesReport, recipients: string[]): EmailPayload {
    const revenueShare = report.categoryBreakdown.map((c) => ({
        ...c,
        share: ((c.revenue / report.totalRevenue) * 100).toFixed(1),
    }));

    const body = `
    <!-- Stats row -->
    ${sectionHeading('Daily Summary')}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        ${statCard('Total Revenue',  NAIRA(report.totalRevenue))}
        ${statCard('Total Orders',   String(report.totalOrders))}
        ${statCard('Avg Order Value', NAIRA(report.totalRevenue / report.totalOrders))}
      </tr>
    </table>

    <!-- Top Products -->
    ${sectionHeading('Top 5 Products by Revenue')}
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
      ${tableHeader('Product', 'Category', 'Qty', 'Revenue')}
      <tbody>
        ${report.topProducts.map((p, i) =>
        tableRow([p.product, p.category, String(p.quantity), NAIRA(p.revenue)], i % 2 === 0)
    ).join('')}
      </tbody>
    </table>

    <!-- Category Breakdown -->
    ${sectionHeading('Revenue by Category')}
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
      ${tableHeader('Category', 'Revenue', 'Orders', 'Share')}
      <tbody>
        ${revenueShare.map((c, i) =>
        tableRow([c.category, NAIRA(c.revenue), String(c.orders), `${c.share}%`], i % 2 === 0)
    ).join('')}
      </tbody>
    </table>

    <!-- Top Cities -->
    ${sectionHeading('Top Cities by Revenue')}
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      ${tableHeader('City', 'Revenue')}
      <tbody>
        ${report.topCities.map((c, i) =>
        tableRow([c.city, NAIRA(c.revenue)], i % 2 === 0)
    ).join('')}
      </tbody>
    </table>
  `;

    const html = baseLayout(`Daily Sales Report — ${report.date}`, body);

    const text = [
        `Daily Sales Report — ${report.date}`,
        ``,
        `Total Revenue : ${NAIRA(report.totalRevenue)}`,
        `Total Orders  : ${report.totalOrders}`,
        `Avg Order     : ${NAIRA(report.totalRevenue / report.totalOrders)}`,
        ``,
        `Top Products:`,
        ...report.topProducts.map((p) => `  ${p.product} — ${NAIRA(p.revenue)}`),
    ].join('\n');

    return {
        to:      recipients,
        subject: `Sales Report — ${report.date}`,
        html,
        text,
    };
}