import { DashboardData }       from '../types';
import { A }                   from './ansi';
import { drawBox }             from './box';
import { summaryPanel }        from '../panels/summaryPanel';
import { trendPanel }          from '../panels/trendPanel';
import { leaderboardPanel }    from '../panels/leaderboardPanel';
import { notificationPanel }   from '../panels/notificationPanel';
import { statusBar }           from '../panels/statusBar';

const REFRESH_MS = parseInt(process.env.REFRESH_MS || '2000', 10);
const WIDTH      = 72;

export function renderDashboard(data: DashboardData, tick: number, source: string): void {
    const lines: string[] = [''];

    // Row 1: Summary | Notifications side by side (each 35 chars wide)
    const summaryLines = drawBox('SUMMARY', summaryPanel(data, tick), 35);
    const notifLines   = drawBox('NOTIFICATIONS', notificationPanel(data, tick), 37);
    const row1Height   = Math.max(summaryLines.length, notifLines.length);

    for (let i = 0; i < row1Height; i++) {
        const left  = summaryLines[i]  ?? ' '.repeat(35);
        const right = notifLines[i]    ?? ' '.repeat(37);
        lines.push(`  ${left} ${right}`);
    }

    lines.push('');

    // Row 2: Full-width trend panel
    lines.push(...drawBox('MONTHLY REVENUE TREND', trendPanel(data), WIDTH).map((l) => `  ${l}`));
    lines.push('');

    // Row 3: Full-width leaderboard
    lines.push(...drawBox('LEADERBOARD', leaderboardPanel(data), WIDTH).map((l) => `  ${l}`));
    lines.push('');

    // Status bar
    lines.push(`  ${statusBar(REFRESH_MS, source)}`);
    lines.push('');

    process.stdout.write(A.home + lines.join('\n'));
}