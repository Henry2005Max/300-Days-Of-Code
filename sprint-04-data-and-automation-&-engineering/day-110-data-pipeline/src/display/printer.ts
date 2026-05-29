import fs                from 'fs';
import { PipelineSummary } from '../types';

const NAIRA  = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const DLINE  = '═'.repeat(72);
const LINE   = '─'.repeat(72);

export function printReport(s: PipelineSummary, reportPath: string): void {
    const lines: string[] = [];

    const push = (...args: string[]) => lines.push(...args);

    push('', DLINE);
    push('  DATA PIPELINE — EXECUTION REPORT');
    push(DLINE);
    push('');
    push(`  Input file   : ${s.inputFile}`);
    push(`  Started      : ${s.startedAt}`);
    push(`  Finished     : ${s.finishedAt}`);
    push(`  Duration     : ${s.durationMs.toLocaleString()}ms  (${(s.durationMs / 1000).toFixed(2)}s)`);
    push('');
    push('  STAGE RESULTS');
    push('  ' + LINE);
    push(`  Total rows read    : ${s.totalRows.toLocaleString()}`);
    push(`  Valid rows         : ${s.validRows.toLocaleString()}`);
    push(`  Invalid (dropped)  : ${s.invalidRows.toLocaleString()}  (${((s.invalidRows / s.totalRows) * 100).toFixed(1)}%)`);
    push(`  Enriched & written : ${s.enrichedRows.toLocaleString()}`);
    push('');
    push('  CATEGORY BREAKDOWN');
    push('  ' + LINE);
    push(
        `  ${'Category'.padEnd(14)} ${'Orders'.padStart(8)} ${'Revenue'.padStart(18)} ${'Avg Order'.padStart(14)} ${'Top Product'.padEnd(22)}`
    );
    push('  ' + LINE);

    for (const c of s.categories) {
        push(
            `  ${c.category.padEnd(14)} ${String(c.orderCount).padStart(8)} ${NAIRA(c.totalRevenue).padStart(18)} ${NAIRA(c.avgOrderValue).padStart(14)} ${c.topProduct.slice(0, 22).padEnd(22)}`
        );
    }

    push('');
    push('  MONTHLY REVENUE');
    push('  ' + LINE);
    const maxRev = Math.max(...s.monthlyTotals.map((m) => m.revenue), 1);
    for (const m of s.monthlyTotals) {
        const bar    = '█'.repeat(Math.round((m.revenue / maxRev) * 20));
        const empty  = '░'.repeat(20 - bar.length);
        push(`  ${m.month}  ${NAIRA(m.revenue).padStart(18)}  ${String(m.orders).padStart(5)} orders  ${bar}${empty}`);
    }

    push('');
    push('  TOP 10 CITIES BY REVENUE');
    push('  ' + LINE);
    for (const c of s.topCities) {
        push(`  ${c.city.padEnd(20)} ${NAIRA(c.revenue).padStart(20)}`);
    }

    push('', DLINE, '');

    const report = lines.join('\n');
    console.log(report);
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`  Report saved → ${reportPath}\n`);
}