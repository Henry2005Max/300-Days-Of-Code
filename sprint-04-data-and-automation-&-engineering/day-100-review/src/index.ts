import dotenv from 'dotenv';
dotenv.config();

import { runMigrations, truncateTable } from './db/migrations';
import { closePool }                   from './db/pool';
import { parseCsv, validateRows }      from './parser/csvParser';
import { bulkInsertConcurrent }        from './loader/bulkInsert';
import {
    getSummary, getTopProducts, getCategoryBreakdown,
    getCityBreakdown, getMonthlyTrend,
    getCustomerSegments, getRevenuePercentiles, getWeekdayRevenue,
    runExplainAnalyze,
} from './analytics/queries';
import { printReport, printQueryPlans } from './reporter/printReport';
import { FullReport } from './types';

const CSV_PATH  = process.env.CSV_FILE_PATH || './data/sales.csv';
const DO_EXPLAIN = process.env.EXPLAIN === 'true';

async function bootstrap(): Promise<void> {
    await runMigrations();
}

async function ingest(): Promise<void> {
    console.log(`\n[Parser] Reading CSV: ${CSV_PATH}`);
    const rawRows = await parseCsv(CSV_PATH);
    const { valid, invalid } = validateRows(rawRows);

    console.log(`[Validator] ${valid.length} valid | ${invalid.length} invalid`);
    if (invalid.length > 0) {
        invalid.slice(0, 3).forEach(({ row, reason }) =>
            console.log(`  [!] ${row.order_id || 'N/A'} — ${reason}`)
        );
    }
    if (valid.length === 0) throw new Error('No valid records to insert.');

    await truncateTable();
    const inserted = await bulkInsertConcurrent(valid, 4);
    console.log(`[Loader] ${inserted} records inserted.\n`);
}

async function analyze(): Promise<FullReport> {
    console.log('[Analytics] Running queries...');

    const [
        summary, topProducts, topCategories, cityBreakdown, monthlyTrend,
        customerSegments, revenuePercentiles, weekdayRevenue,
    ] = await Promise.all([
        getSummary(),
        getTopProducts(10),
        getCategoryBreakdown(),
        getCityBreakdown(10),
        getMonthlyTrend(),
        getCustomerSegments(),
        getRevenuePercentiles(),
        getWeekdayRevenue(),
    ]);

    const queryPlans = DO_EXPLAIN ? await runExplainAnalyze() : undefined;

    return {
        summary, topProducts, topCategories, cityBreakdown, monthlyTrend,
        customerSegments, revenuePercentiles, weekdayRevenue, queryPlans,
    };
}

async function main(): Promise<void> {
    console.log('[App] CSV Analyzer v2 — Day 100 Sprint 4 Review\n');

    try {
        await bootstrap();
        await ingest();
        const report = await analyze();
        printReport(report);
        if (report.queryPlans) printQueryPlans(report.queryPlans);
    } catch (err) {
        console.error('[Error]', (err as Error).message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();