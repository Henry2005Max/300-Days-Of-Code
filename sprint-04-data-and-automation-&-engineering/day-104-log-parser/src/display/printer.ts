import { AnalysisReport } from '../types';

const LINE  = (n = 72) => '─'.repeat(n);
const DLINE = (n = 72) => '═'.repeat(n);
const ms    = (n: number) => `${n}ms`;
const pct   = (n: number) => `${n}%`;

function statusGroup(code: number): string {
    if (code < 200) return '1xx';
    if (code < 300) return '2xx';
    if (code < 400) return '3xx';
    if (code < 500) return '4xx';
    return '5xx';
}

function bar(value: number, max: number, width = 12): string {
    const filled = max > 0 ? Math.round((value / max) * width) : 0;
    return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function printReport(r: AnalysisReport): void {
    console.log('\n' + DLINE());
    console.log('  LOG PARSER ANALYSIS REPORT');
    console.log(DLINE());

    // Overview
    console.log('\n  OVERVIEW');
    console.log('  ' + LINE());
    console.log(`  File           : ${r.filePath}`);
    console.log(`  Total lines    : ${r.totalLines.toLocaleString()}`);
    console.log(`  Parsed entries : ${r.parsedEntries.toLocaleString()}`);
    console.log(`  Skipped lines  : ${r.skippedLines.toLocaleString()}`);
    if (r.timeRange) {
        console.log(`  From           : ${r.timeRange.from.toISOString()}`);
        console.log(`  To             : ${r.timeRange.to.toISOString()}`);
    }
    console.log(`  Error rate     : ${pct(r.errorRate)}`);
    console.log(`  Avg response   : ${ms(r.overallAvgMs)}`);
    console.log(`  P95 response   : ${ms(r.overallP95Ms)}`);

    // Level distribution
    console.log('\n  LOG LEVELS');
    console.log('  ' + LINE());
    const maxLevel = Math.max(...Object.values(r.levelCounts), 1);
    for (const [level, count] of Object.entries(r.levelCounts)) {
        const b = bar(count, maxLevel, 14);
        console.log(`  ${level.padEnd(8)} ${String(count).padStart(6)}  ${b}`);
    }

    // Status distribution
    console.log('\n  STATUS CODE DISTRIBUTION');
    console.log('  ' + LINE());
    console.log(`  ${'Code'.padEnd(6)} ${'Count'.padStart(8)}  ${'%'.padStart(7)}  Group`);
    console.log('  ' + LINE(40));
    for (const s of r.statusDist) {
        console.log(
            `  ${String(s.code).padEnd(6)} ${String(s.count).padStart(8)}  ${pct(s.percent).padStart(7)}  ${statusGroup(s.code)}`
        );
    }

    // Top endpoints
    console.log('\n  TOP ENDPOINTS BY REQUEST COUNT');
    console.log('  ' + LINE());
    console.log(
        `  ${'Method'.padEnd(7)} ${'Endpoint'.padEnd(30)} ${'Reqs'.padStart(6)} ${'Errors'.padStart(7)} ${'Avg'.padStart(8)} ${'P95'.padStart(8)} ${'P99'.padStart(8)}`
    );
    console.log('  ' + LINE());
    for (const e of r.topEndpoints) {
        const ep = e.endpoint.slice(0, 30).padEnd(30);
        console.log(
            `  ${e.method.padEnd(7)} ${ep} ${String(e.requestCount).padStart(6)} ${String(e.errorCount).padStart(7)} ${ms(e.avgMs).padStart(8)} ${ms(e.p95Ms).padStart(8)} ${ms(e.p99Ms).padStart(8)}`
        );
    }

    // Slowest requests
    console.log('\n  SLOWEST 5 REQUESTS');
    console.log('  ' + LINE());
    for (const e of r.slowestRequests) {
        const ts = e.timestamp.toISOString().slice(11, 19);
        console.log(
            `  [${ts}]  ${e.method.padEnd(6)} ${e.endpoint.slice(0, 35).padEnd(35)}  ${String(e.statusCode)}  ${ms(e.responseMs)}`
        );
    }

    // Hourly traffic
    console.log('\n  HOURLY TRAFFIC');
    console.log('  ' + LINE());
    const maxReqs = Math.max(...r.hourlyTraffic.map((h) => h.requestCount), 1);
    for (const h of r.hourlyTraffic) {
        const b = bar(h.requestCount, maxReqs, 16);
        console.log(
            `  ${h.hour}  ${String(h.requestCount).padStart(5)} reqs  ${b}  err: ${h.errorCount}`
        );
    }

    console.log('\n' + DLINE() + '\n');
}