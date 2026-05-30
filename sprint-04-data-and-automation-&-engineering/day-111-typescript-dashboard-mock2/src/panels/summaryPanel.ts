import { DashboardData } from '../types';
import { A, c, naira }   from '../renderer/ansi';

export function summaryPanel(data: DashboardData, tick: number): string[] {
    const uptimeSec = Math.round(process.uptime());
    const mm  = String(Math.floor(uptimeSec / 60)).padStart(2, '0');
    const ss  = String(uptimeSec % 60).padStart(2, '0');
    const uptime = `${mm}:${ss}`;

    const validPct   = ((data.validRows / (data.validRows + data.invalidRows)) * 100).toFixed(1);
    const pulse      = tick % 2 === 0 ? c(A.brightGreen, '●') : c(A.green, '○');

    return [
        '',
        `  ${c(A.dim, 'Total Revenue')}    ${c(A.brightGreen + A.bold, naira(data.totalRevenue))}`,
        `  ${c(A.dim, 'Total Orders')}     ${c(A.brightWhite, data.totalOrders.toLocaleString())}`,
        `  ${c(A.dim, 'Avg Order Value')}  ${c(A.yellow, naira(data.totalRevenue / data.totalOrders))}`,
        `  ${c(A.dim, 'Valid Rows')}       ${c(A.brightGreen, data.validRows.toLocaleString())}  ${c(A.dim, `(${validPct}%)`)}`,
        `  ${c(A.dim, 'Invalid Dropped')}  ${c(A.yellow, data.invalidRows.toLocaleString())}`,
        `  ${c(A.dim, 'Uptime')}           ${c(A.cyan, uptime)}  ${pulse}`,
        '',
    ];
}