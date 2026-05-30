import { DashboardData }    from '../types';
import { A, c, naira, sparkline, hbar } from '../renderer/ansi';

export function trendPanel(data: DashboardData): string[] {
    const { monthlyTotals } = data;
    const maxRev = Math.max(...monthlyTotals.map((m) => m.revenue), 1);
    const revenues = monthlyTotals.map((m) => m.revenue);
    const spark    = sparkline(revenues, 24);

    const lines: string[] = [''];
    lines.push(`  ${c(A.dim, 'Trend')}  ${c(A.brightGreen, spark)}`);
    lines.push('');

    for (const m of monthlyTotals) {
        const label = m.month.slice(5); // MM
        const bar   = hbar(m.revenue, maxRev, 14);
        const rev   = naira(m.revenue).padStart(10);
        lines.push(`  ${c(A.cyan, label)}  ${bar}  ${c(A.yellow, rev)}  ${c(A.dim, String(m.orders).padStart(5) + ' orders')}`);
    }

    lines.push('');
    return lines;
}