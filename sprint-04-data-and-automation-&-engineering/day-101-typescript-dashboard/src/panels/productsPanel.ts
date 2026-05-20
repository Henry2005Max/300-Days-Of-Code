import { DashboardMetrics }        from '../types';
import { ANSI, c, naira, truncate, miniBar } from '../renderer/ansi';

export function topProductsPanel(metrics: DashboardMetrics): string[] {
    const { topProducts } = metrics;
    const lines: string[]  = [];
    const maxRevenue = Math.max(...topProducts.map((p) => p.totalRevenue), 1);

    lines.push('');
    lines.push(
        `  ${c(ANSI.dim, 'Product'.padEnd(22))} ${c(ANSI.dim, 'Revenue'.padStart(12))}  ${c(ANSI.dim, 'Bar')}`
    );
    lines.push(`  ${'─'.repeat(52)}`);

    for (const p of topProducts) {
        const name = truncate(p.product, 22);
        const rev  = naira(p.totalRevenue).padStart(12);
        const bar  = miniBar(p.totalRevenue, maxRevenue, 12);
        lines.push(`  ${c(ANSI.brightWhite, name.padEnd(22))} ${c(ANSI.yellow, rev)}  ${bar}`);
    }

    lines.push('');
    return lines;
}