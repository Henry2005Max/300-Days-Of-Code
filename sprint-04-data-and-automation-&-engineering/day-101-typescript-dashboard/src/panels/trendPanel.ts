import { DashboardMetrics }        from '../types';
import { ANSI, c, naira, miniBar } from '../renderer/ansi';

export function trendPanel(metrics: DashboardMetrics): string[] {
    const { monthlyTrend } = metrics;
    const lines: string[]  = [];
    const maxRevenue = Math.max(...monthlyTrend.map((m) => m.totalRevenue), 1);

    lines.push('');
    lines.push(
        `  ${c(ANSI.dim, 'Month'.padEnd(10))} ${c(ANSI.dim, 'Revenue'.padStart(14))}  ${c(ANSI.dim, 'Orders'.padStart(7))}  ${c(ANSI.dim, 'Trend')}`
    );
    lines.push(`  ${'─'.repeat(55)}`);

    for (const m of monthlyTrend) {
        const month  = m.month.padEnd(10);
        const rev    = naira(m.totalRevenue).padStart(14);
        const orders = String(m.orderCount).padStart(7);
        const bar    = miniBar(m.totalRevenue, maxRevenue, 12);
        lines.push(
            `  ${c(ANSI.brightCyan, month)} ${c(ANSI.yellow, rev)}  ${c(ANSI.brightWhite, orders)}  ${bar}`
        );
    }

    lines.push('');
    return lines;
}