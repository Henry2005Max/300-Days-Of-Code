import { DashboardMetrics } from '../types';
import { ANSI, c, naira }   from '../renderer/ansi';

export function summaryPanel(metrics: DashboardMetrics): string[] {
    const { summary } = metrics;
    const lines: string[] = [];

    lines.push('');
    lines.push(
        `  ${c(ANSI.dim, 'Total Revenue')}    ${c(ANSI.brightGreen + ANSI.bold, naira(summary.totalRevenue))}`
    );
    lines.push(
        `  ${c(ANSI.dim, 'Total Orders')}     ${c(ANSI.brightWhite, String(summary.totalOrders))}`
    );
    lines.push(
        `  ${c(ANSI.dim, 'Avg Order Value')}  ${c(ANSI.yellow, naira(summary.avgOrderValue))}`
    );
    lines.push(
        `  ${c(ANSI.dim, 'Unique Products')}  ${c(ANSI.brightWhite, String(summary.uniqueProducts))}`
    );
    lines.push(
        `  ${c(ANSI.dim, 'Unique Cities')}    ${c(ANSI.brightWhite, String(summary.uniqueCities))}`
    );
    lines.push('');

    return lines;
}