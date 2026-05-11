import dotenv from 'dotenv';
dotenv.config();

import { disconnectClient } from './db/client';
import {
    getAllOrders,
    getTopProducts,
    getTopCustomers,
    getCategoryRevenue,
    getLowStockAlerts,
} from './queries/analytics';
import {
    printOrders,
    printTopProducts,
    printTopCustomers,
    printCategoryRevenue,
    printLowStock,
} from './services/printer';

async function main(): Promise<void> {
    console.log('[App] Running Prisma ORM analytics...\n');

    try {
        const [orders, topProducts, topCustomers, categoryRevenue, lowStock] = await Promise.all([
            getAllOrders(),
            getTopProducts(10),
            getTopCustomers(10),
            getCategoryRevenue(),
            getLowStockAlerts(15),
        ]);

        printOrders(orders);
        printTopProducts(topProducts);
        printTopCustomers(topCustomers);
        printCategoryRevenue(categoryRevenue);
        printLowStock(lowStock);

        console.log('[App] Done.\n');
    } catch (err) {
        console.error('[Error]', (err as Error).message);
        process.exit(1);
    } finally {
        await disconnectClient();
    }
}

main();