import { getClient } from '../db/client';
import {
    OrderSummary,
    ProductSalesReport,
    CustomerReport,
    CategoryRevenue,
    LowStockAlert,
} from '../types';

// All orders with customer info and item count
export async function getAllOrders(): Promise<OrderSummary[]> {
    const prisma = getClient();

    const orders = await prisma.order.findMany({
        include: {
            user: true,
            items: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
        orderId:      o.id,
        customerName: o.user.name,
        city:         o.user.city,
        state:        o.user.state,
        status:       o.status,
        totalAmount:  Number(o.totalAmount),
        itemCount:    o.items.length,
        createdAt:    o.createdAt,
    }));
}

// Top selling products by revenue
export async function getTopProducts(limit = 10): Promise<ProductSalesReport[]> {
    const prisma = getClient();

    const items = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, subtotal: true },
        _count: { orderId: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: limit,
    });

    const results: ProductSalesReport[] = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: true },
        });
        if (!product) continue;

        results.push({
            productId:          product.id,
            productName:        product.name,
            category:           product.category.name,
            totalQuantitySold:  item._sum.quantity || 0,
            totalRevenue:       Number(item._sum.subtotal || 0),
            orderCount:         item._count.orderId,
        });
    }

    return results;
}

// Top customers by total spend
export async function getTopCustomers(limit = 10): Promise<CustomerReport[]> {
    const prisma = getClient();

    const orders = await prisma.order.groupBy({
        by: ['userId'],
        _sum: { totalAmount: true },
        _count: { id: true },
        _avg: { totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: limit,
    });

    const results: CustomerReport[] = [];

    for (const o of orders) {
        const user = await prisma.user.findUnique({ where: { id: o.userId } });
        if (!user) continue;

        results.push({
            userId:        user.id,
            name:          user.name,
            city:          user.city,
            totalOrders:   o._count.id,
            totalSpent:    Number(o._sum.totalAmount || 0),
            avgOrderValue: Number(o._avg.totalAmount || 0),
        });
    }

    return results;
}

// Revenue by category
export async function getCategoryRevenue(): Promise<CategoryRevenue[]> {
    const prisma = getClient();

    const categories = await prisma.category.findMany({
        include: {
            products: {
                include: {
                    orderItems: true,
                },
            },
        },
    });

    return categories
        .map((cat) => {
            let totalRevenue = 0;
            let totalOrders = 0;

            for (const product of cat.products) {
                for (const item of product.orderItems) {
                    totalRevenue += Number(item.subtotal);
                    totalOrders++;
                }
            }

            return {
                category:     cat.name,
                totalRevenue,
                totalOrders,
                productCount: cat.products.length,
            };
        })
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Products with low stock (threshold: stock < 15)
export async function getLowStockAlerts(threshold = 15): Promise<LowStockAlert[]> {
    const prisma = getClient();

    const products = await prisma.product.findMany({
        where: { stock: { lt: threshold } },
        include: { category: true },
        orderBy: { stock: 'asc' },
    });

    return products.map((p) => ({
        productId: p.id,
        name:      p.name,
        category:  p.category.name,
        stock:     p.stock,
        price:     Number(p.price),
    }));
}

// Orders filtered by status
export async function getOrdersByStatus(status: string) {
    const prisma = getClient();

    return prisma.order.findMany({
        where: { status: status as any },
        include: {
            user: { select: { name: true, city: true } },
            items: {
                include: {
                    product: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}