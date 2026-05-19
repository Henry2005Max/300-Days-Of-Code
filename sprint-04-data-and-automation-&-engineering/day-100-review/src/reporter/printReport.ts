import { FullReport, QueryPlan } from '../types';

const NAIRA  = (n: number) => `NGN ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const PAD    = (s: string, len: number) => s.slice(0, len).padEnd(len);
const LINE   = (len = 72) => '─'.repeat(len);
const DLINE  = (len = 72) => '═'.repeat(len);

export function printReport(report: FullReport): void {
    const { summary, topProducts, topCategories, cityBreakdown, monthlyTrend,
        customerSegments, revenuePercentiles, weekdayRevenue } = report;

    console.log('\n' + DLINE());
    console.log('  CSV ANALYZER v2 — SPRINT 4 REVIEW REPORT');
    console.log(DLINE());

    // Summary
    console.log('\n  SUMMARY');
    console.log('  ' + LINE());
    console.log(`  Total Records      : ${summary.totalRecords.toLocaleString()}`);
    console.log(`  Total Revenue      : ${NAIRA(summary.totalRevenue)}`);
    console.log(`  Avg Order Value    : ${NAIRA(summary.avgOrderValue)}`);
    console.log(`  Max Order Value    : ${NAIRA(summary.maxOrderValue)}`);
    console.log(`  Unique Products    : ${summary.uniqueProducts}`);
    console.log(`  Unique Customers   : ${summary.uniqueCustomers}`);
    console.log(`  Unique Cities      : ${summary.uniqueCities}`);
    console.log(`  Date Range         : ${summary.dateRange.from} → ${summary.dateRange.to}`);

    // Revenue Percentiles (NEW)
    const p = revenuePercentiles;
    console.log('\n  REVENUE PERCENTILES  [NEW]');
    console.log('  ' + LINE());
    console.log(`  P25 (bottom 25%)   : ${NAIRA(p.p25)}`);
    console.log(`  P50 (median)       : ${NAIRA(p.p50)}`);
    console.log(`  P75                : ${NAIRA(p.p75)}`);
    console.log(`  P90                : ${NAIRA(p.p90)}`);
    console.log(`  P99 (top 1%)       : ${NAIRA(p.p99)}`);

    // Customer Segments (NEW)
    console.log('\n  CUSTOMER SEGMENTS  [NEW — NTILE window function]');
    console.log('  ' + LINE());
    console.log(
        `  ${'Segment'.padEnd(14)} ${'Customers'.padStart(10)} ${'Total Revenue'.padStart(22)} ${'Avg Spend'.padStart(18)}`
    );
    console.log('  ' + LINE(68));
    customerSegments.forEach((s) => {
        console.log(
            `  ${PAD(s.segment, 14)} ${String(s.customerCount).padStart(10)} ${NAIRA(s.totalRevenue).padStart(22)} ${NAIRA(s.avgSpend).padStart(18)}`
        );
    });

    // Top Products
    console.log('\n  TOP 10 PRODUCTS');
    console.log('  ' + LINE());
    console.log(`  ${'Product'.padEnd(30)} ${'Category'.padEnd(15)} ${'Revenue'.padStart(20)}  ${'Qty'.padStart(6)}`);
    console.log('  ' + LINE(76));
    topProducts.forEach((p) => {
        console.log(
            `  ${PAD(p.product, 30)} ${PAD(p.category, 15)} ${NAIRA(p.totalRevenue).padStart(20)}  ${String(p.totalQuantity).padStart(6)}`
        );
    });

    // Categories
    console.log('\n  REVENUE BY CATEGORY');
    console.log('  ' + LINE());
    topCategories.forEach((c) => {
        console.log(`  ${PAD(c.category, 20)} ${NAIRA(c.totalRevenue).padStart(22)}  ${String(c.revenueShare).padStart(6)}%  (${c.orderCount} orders)`);
    });

    // Top Cities
    console.log('\n  TOP 10 CITIES');
    console.log('  ' + LINE());
    cityBreakdown.forEach((c) => {
        console.log(`  ${PAD(c.city, 20)} ${PAD(c.state, 14)} ${NAIRA(c.totalRevenue).padStart(22)}  (${c.orderCount} orders)`);
    });

    // Monthly Trend
    console.log('\n  MONTHLY TREND');
    console.log('  ' + LINE());
    monthlyTrend.forEach((m) => {
        console.log(`  ${m.month}  ${NAIRA(m.totalRevenue).padStart(24)}  ${String(m.orderCount).padStart(4)} orders  avg: ${NAIRA(m.avgOrderValue)}`);
    });

    // Weekday Revenue (NEW)
    console.log('\n  REVENUE BY DAY OF WEEK  [NEW]');
    console.log('  ' + LINE());
    weekdayRevenue.forEach((w) => {
        const bar = '▓'.repeat(Math.round(w.orderCount / 2));
        console.log(`  ${w.day.padEnd(12)} ${NAIRA(w.totalRevenue).padStart(22)}  ${String(w.orderCount).padStart(3)} orders  ${bar}`);
    });

    console.log('\n' + DLINE() + '\n');
}

export function printQueryPlans(plans: QueryPlan[]): void {
    console.log('\n' + DLINE());
    console.log('  EXPLAIN ANALYZE — QUERY PERFORMANCE');
    console.log(DLINE());

    for (const plan of plans) {
        console.log(`\n  Query: ${plan.query}`);
        console.log('  ' + LINE(60));
        plan.planLines.forEach((line) => console.log(`  ${line}`));
        console.log(`\n  Total round-trip: ${plan.executionMs}ms`);
    }

    console.log('\n' + DLINE() + '\n');
}