import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { closePool } from './db/pool';
import {
    getCategoryRevenue,
    getMonthlyTrend,
    getTopProducts,
    getCityRevenue,
} from './queries/dataQueries';
import {
    renderCategoryBar,
    renderMonthlyLine,
    renderCategoryPie,
    renderTopProductsBar,
    renderCityBar,
} from './charts/renderer';
import { printSummary } from './services/printer';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';

async function main(): Promise<void> {
    console.log('[App] Fetching data from PostgreSQL...');

    try {
        const [categories, monthly, products, cities] = await Promise.all([
            getCategoryRevenue(),
            getMonthlyTrend(),
            getTopProducts(8),
            getCityRevenue(8),
        ]);

        printSummary(categories, monthly, products, cities);

        console.log('[Charts] Rendering charts to PNG...\n');

        const [p1, p2, p3, p4, p5] = await Promise.all([
            renderCategoryBar(
                categories.map((c) => c.category),
                categories.map((c) => c.total_revenue),
                OUTPUT_DIR
            ),
            renderMonthlyLine(
                monthly.map((m) => m.month),
                monthly.map((m) => m.total_revenue),
                monthly.map((m) => m.order_count),
                OUTPUT_DIR
            ),
            renderCategoryPie(
                categories.map((c) => c.category),
                categories.map((c) => c.total_revenue),
                OUTPUT_DIR
            ),
            renderTopProductsBar(
                products.map((p) => p.product),
                products.map((p) => p.total_revenue),
                OUTPUT_DIR
            ),
            renderCityBar(
                cities.map((c) => c.city),
                cities.map((c) => c.total_revenue),
                OUTPUT_DIR
            ),
        ]);

        const outputPath = path.resolve(OUTPUT_DIR);
        console.log(`[Charts] All charts saved to: ${outputPath}\n`);
        console.log(`  chart-01-category-revenue.png  →  ${path.basename(p1)}`);
        console.log(`  chart-02-monthly-trend.png     →  ${path.basename(p2)}`);
        console.log(`  chart-03-category-pie.png      →  ${path.basename(p3)}`);
        console.log(`  chart-04-top-products.png      →  ${path.basename(p4)}`);
        console.log(`  chart-05-city-revenue.png      →  ${path.basename(p5)}`);
        console.log('\n[App] Done.\n');
    } catch (err) {
        console.error('[Error]', (err as Error).message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();