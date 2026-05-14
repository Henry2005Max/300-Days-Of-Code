import { StockAlert, EmailPayload } from '../types';
import { NAIRA, baseLayout, sectionHeading, tableHeader, tableRow } from './base';

function stockBadge(stock: number): string {
    const color  = stock === 0 ? '#dc2626' : stock <= 8 ? '#d97706' : '#2D6A4F';
    const bg     = stock === 0 ? '#fef2f2' : stock <= 8 ? '#fffbeb' : '#f0fdf4';
    const label  = stock === 0 ? 'OUT OF STOCK' : `${stock} left`;
    return `<span style="background-color:${bg};color:${color};padding:3px 8px;border-radius:4px;font-size:12px;font-weight:bold;">${label}</span>`;
}

export function buildStockAlertEmail(alerts: StockAlert[], recipients: string[]): EmailPayload {
    const critical = alerts.filter((a) => a.stock === 0);
    const low      = alerts.filter((a) => a.stock > 0);

    const body = `
    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      <strong>${alerts.length} product${alerts.length !== 1 ? 's' : ''}</strong> require${alerts.length === 1 ? 's' : ''} immediate attention.
      ${critical.length > 0 ? `<span style="color:#dc2626;font-weight:bold;"> ${critical.length} out of stock.</span>` : ''}
    </p>

    ${critical.length > 0 ? `
      ${sectionHeading('Out of Stock')}
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #fecaca;border-radius:6px;overflow:hidden;margin-bottom:32px;">
        ${tableHeader('Product', 'Category', 'Price', 'Status')}
        <tbody>
          ${critical.map((a, i) =>
        tableRow([a.product, a.category, NAIRA(a.price), stockBadge(a.stock)], i % 2 === 0)
    ).join('')}
        </tbody>
      </table>
    ` : ''}

    ${low.length > 0 ? `
      ${sectionHeading('Low Stock (Reorder Soon)')}
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:32px;">
        ${tableHeader('Product', 'Category', 'Price', 'Stock')}
        <tbody>
          ${low.map((a, i) =>
        tableRow([a.product, a.category, NAIRA(a.price), stockBadge(a.stock)], i % 2 === 0)
    ).join('')}
        </tbody>
      </table>
    ` : ''}

    <p style="margin:0;font-size:13px;color:#6b7280;">
      Please update inventory levels as soon as possible to avoid lost sales.
    </p>
  `;

    const html = baseLayout('Low Stock Alert', body);

    const text = [
        'LOW STOCK ALERT',
        '',
        `${alerts.length} product(s) need attention:`,
        ...alerts.map((a) => `  ${a.product} — ${a.stock === 0 ? 'OUT OF STOCK' : `${a.stock} units left`}`),
    ].join('\n');

    return {
        to:      recipients,
        subject: `Stock Alert — ${alerts.length} product${alerts.length !== 1 ? 's' : ''} need attention`,
        html,
        text,
    };
}