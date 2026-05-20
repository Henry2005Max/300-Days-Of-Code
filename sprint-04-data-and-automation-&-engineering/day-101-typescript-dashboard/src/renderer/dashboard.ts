import { DashboardMetrics } from '../types';
import { ANSI }             from '../renderer/ansi';
import { drawBox }          from '../renderer/box';
import { summaryPanel }     from '../panels/summaryPanel';
import { topProductsPanel } from '../panels/productsPanel';
import { categoryPanel }    from '../panels/categoryPanel';
import { trendPanel }       from '../panels/trendPanel';
import { statusBar }        from '../panels/statusBar';

const REFRESH_MS = parseInt(process.env.REFRESH_INTERVAL_MS || '3000', 10);
const BOX_WIDTH  = 70;

export function renderDashboard(metrics: DashboardMetrics): void {
    const lines: string[] = [];

    lines.push('');
    lines.push(...drawBox('SUMMARY STATISTICS', summaryPanel(metrics), BOX_WIDTH));
    lines.push('');
    lines.push(...drawBox('TOP 6 PRODUCTS BY REVENUE', topProductsPanel(metrics), BOX_WIDTH));
    lines.push('');
    lines.push(...drawBox('REVENUE BY CATEGORY', categoryPanel(metrics), BOX_WIDTH));
    lines.push('');
    lines.push(...drawBox('MONTHLY TREND', trendPanel(metrics), BOX_WIDTH));
    lines.push('');
    lines.push(statusBar(metrics, REFRESH_MS));
    lines.push('');

    // Move cursor home and overwrite — avoids flicker vs clearScreen
    const output = ANSI.home + lines.join('\n');
    process.stdout.write(output);
}