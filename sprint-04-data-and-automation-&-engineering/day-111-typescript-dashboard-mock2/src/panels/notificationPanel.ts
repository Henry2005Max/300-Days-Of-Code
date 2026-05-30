import { DashboardData }  from '../types';
import { A, c }           from '../renderer/ansi';

function levelIcon(level: string): string {
    if (level === 'ok')   return c(A.brightGreen, '✓');
    if (level === 'warn') return c(A.yellow,      '⚠');
    return c(A.cyan, 'ℹ');
}

function levelColor(level: string): string {
    if (level === 'ok')   return A.brightGreen;
    if (level === 'warn') return A.yellow;
    return A.brightCyan;
}

export function notificationPanel(data: DashboardData, tick: number): string[] {
    const lines: string[] = [''];

    const notes = [...data.notifications];
    // Cycle the list slowly so it looks live
    const offset = Math.floor(tick / 5) % notes.length;
    const visible = [...notes.slice(offset), ...notes.slice(0, offset)].slice(0, 6);

    for (const n of visible) {
        const icon = levelIcon(n.level);
        const msg  = c(levelColor(n.level), n.message.slice(0, 50));
        lines.push(`  ${icon}  ${c(A.dim, n.time)}  ${msg}`);
    }

    lines.push('');
    return lines;
}