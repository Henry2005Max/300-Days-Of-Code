import { AnalyticsReport } from '../types';

const NAIRA = (n: number) =>
    `NGN ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PAD = (str: string, len: number) => str.slice(0, len).padEnd(len);
const LINE = (char = '─', len = 70) => char.repeat(len);

export function printReport(report: AnalyticsReport): void {
    const { summary, topProducts, topCategories, cityBreakdown, monthlyTrend } = report;

    console.log('\n' + LINE('═'));
    console.log('  CSV ANALYZER — SALES DATA REPORT');
    console.log(LINE('═'));

    // Summary
    console.log('\n  SUMMARY STATISTICS');
    console.log(LINE());
    console.log(`  Total Records      : ${summary.totalRecords.toLocaleString()}`);
    console.log(`  Total Revenue      : ${NAIRA(summary.totalRevenue)}`);
    console.log(`  Avg Order Value    : ${NAIRA(summary.avgOrderValue)}`);
    console.log(`  Max Order Value    : ${NAIRA(summary.maxOrderValue)}`);
    console.log(`  Min Order Value    : ${NAIRA(summary.minOrderValue)}`);
    console.log(`  Unique Products    : ${summary.uniqueProducts}`);
    console.log(`  Unique Customers   : ${summary.uniqueCustomers}`);
    console.log(`  Unique Cities      : ${summary.uniqueCities}`);
    console.log(`  Date Range         : ${summary.dateRange.from} → ${summary.dateRange.to}`);

    // Top Products
    console.log('\n  TOP 10 PRODUCTS BY REVENUE');
    console.log(LINE());
    console.log(`  ${'Product'.padEnd(30)} ${'Category'.padEnd(15)} ${'Revenue'.padStart(18)}  ${'Qty'.padStart(6)}`);
    console.log(`  ${LINE('-', 68)}`);
    topProducts.forEach((p) => {
        console.log(
            `  ${PAD(p.product, 30)} ${PAD(p.category, 15)} ${NAIRA(p.totalRevenue).padStart(18)}  ${String(p.totalQuantity).padStart(6)}`
        );
    });

    // Categories
    console.log('\n  REVENUE BY CATEGORY');
    console.log(LINE());
    console.log(`  ${'Category'.padEnd(20)} ${'Revenue'.padStart(20)}  ${'Orders'.padStart(8)}  ${'Share %'.padStart(8)}`);
    console.log(`  ${LINE('-', 62)}`);
    topCategories.forEach((c) => {
        console.log(
            `  ${PAD(c.category, 20)} ${NAIRA(c.totalRevenue).padStart(20)}  ${String(c.orderCount).padStart(8)}  ${String(c.revenueShare).padStart(7)}%`
        );
    });

    // Cities
    console.log('\n  TOP 10 CITIES BY REVENUE');
    console.log(LINE());
    console.log(`  ${'City'.padEnd(20)} ${'State'.padEnd(15)} ${'Revenue'.padStart(20)}  ${'Orders'.padStart(8)}`);
    console.log(`  ${LINE('-', 67)}`);
    cityBreakdown.forEach((c) => {
        console.log(
            `  ${PAD(c.city, 20)} ${PAD(c.state, 15)} ${NAIRA(c.totalRevenue).padStart(20)}  ${String(c.orderCount).padStart(8)}`
        );
    });

    // Monthly Trend
    console.log('\n  MONTHLY REVENUE TREND');
    console.log(LINE());
    console.log(`  ${'Month'.padEnd(10)} ${'Revenue'.padStart(20)}  ${'Orders'.padStart(8)}  ${'Avg Order'.padStart(16)}`);
    console.log(`  ${LINE('-', 60)}`);
    monthlyTrend.forEach((m) => {
        console.log(
            `  ${m.month.padEnd(10)} ${NAIRA(m.totalRevenue).padStart(20)}  ${String(m.orderCount).padStart(8)}  ${NAIRA(m.avgOrderValue).padStart(16)}`
        );
    });

    console.log('\n' + LINE('═') + '\n');
}