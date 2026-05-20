import { DashboardMetrics }              from '../types';
import { ANSI, c, naira, truncate, miniBar } from '../renderer/ansi';

export function categoryPanel(metrics: DashboardMetrics): string[] {
    const { categories } = metrics;
    const lines: string[] = [];
    const maxRevenue = Math.max(...categories.map((c) => c.totalRevenue), 1);

    lines.push('');
    lines.push(
        `  ${c(ANSI.dim, 'Category'.padEnd(18))} ${c(ANSI.dim, 'Revenue'.padStart(14))}  ${c(ANSI.dim, 'Share')}  ${c(ANSI.dim, 'Bar')}`
    );
    lines.push(`  ${'─'.repeat(55)}`);

    for (const cat of categories) {
        const name  = truncate(cat.category, 18).padEnd(18);
        const rev   = naira(cat.totalRevenue).padStart(14);
        const share = `${String(cat.revenueShare).padStart(4)}%`;
        const bar   = miniBar(cat.totalRevenue, maxRevenue, 8);
        lines.push(`  ${c(ANSI.brightWhite, name)} ${c(ANSI.yellow, rev)}  ${c(ANSI.cyan, share)}  ${bar}`);
    }

    lines.push('');
    return lines;
}