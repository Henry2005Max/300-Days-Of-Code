import { CategoryRevenue, MonthlyTrend, TopProduct, CityRevenue } from '../types';

const NAIRA = (n: number) =>
    `NGN ${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const LINE = (len = 60) => '─'.repeat(len);

export function printSummary(
    categories: CategoryRevenue[],
    monthly: MonthlyTrend[],
    products: TopProduct[],
    cities: CityRevenue[]
): void {
    console.log('\n' + '═'.repeat(60));
    console.log('  DATA VISUALIZATION — QUERY SUMMARY');
    console.log('═'.repeat(60));

    console.log('\n  CATEGORY REVENUE');
    console.log('  ' + LINE());
    categories.forEach((c) => {
        console.log(`  ${c.category.padEnd(20)} ${NAIRA(c.total_revenue).padStart(28)}  (${c.order_count} orders)`);
    });

    console.log('\n  MONTHLY TREND');
    console.log('  ' + LINE());
    monthly.forEach((m) => {
        console.log(`  ${m.month.padEnd(12)} ${NAIRA(m.total_revenue).padStart(28)}  (${m.order_count} orders)`);
    });

    console.log('\n  TOP PRODUCTS');
    console.log('  ' + LINE());
    products.forEach((p, i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${p.product.padEnd(28)} ${NAIRA(p.total_revenue).padStart(22)}`);
    });

    console.log('\n  TOP CITIES');
    console.log('  ' + LINE());
    cities.forEach((c) => {
        console.log(`  ${c.city.padEnd(20)} ${c.state.padEnd(12)} ${NAIRA(c.total_revenue).padStart(20)}`);
    });

    console.log('\n' + '═'.repeat(60) + '\n');
}