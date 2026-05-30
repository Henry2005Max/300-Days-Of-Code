import { A, c } from '../renderer/ansi';

export function statusBar(refreshMs: number, source: string): string {
    const now = new Date().toLocaleTimeString('en-NG', {
        timeZone: 'Africa/Lagos', hour12: false,
    });
    return (
        c(A.bgBlue + A.bold, ' SALES DASHBOARD v2 ') +
        c(A.dim, '  Clock: ') + c(A.brightWhite, now) +
        c(A.dim, '  Refresh: ') + c(A.cyan, `${refreshMs / 1000}s`) +
        c(A.dim, '  Source: ') + c(A.brightCyan, source) +
        c(A.dim, '  Press ') + c(A.yellow, 'Ctrl+C') + c(A.dim, ' to exit')
    );
}