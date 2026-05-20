import { DashboardMetrics } from '../types';
import { ANSI, c }          from '../renderer/ansi';

export function statusBar(metrics: DashboardMetrics, refreshMs: number): string {
    const now     = new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false });
    const updated = metrics.lastUpdated.toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false });
    const refresh = `${refreshMs / 1000}s`;

    return (
        c(ANSI.bgBlue + ANSI.bold, ` SALES DASHBOARD `) +
        c(ANSI.dim,  `  Clock: `) + c(ANSI.brightWhite, now) +
        c(ANSI.dim,  `   Last fetch: `) + c(ANSI.brightGreen, updated) +
        c(ANSI.dim,  `   Refresh: `) + c(ANSI.cyan, refresh) +
        c(ANSI.dim,  `   Press `) + c(ANSI.yellow, 'Ctrl+C') + c(ANSI.dim, ' to exit')
    );
}