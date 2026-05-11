export interface OrderSummary {
    orderId: number;
    customerName: string;
    city: string;
    state: string;
    status: string;
    totalAmount: number;
    itemCount: number;
    createdAt: Date;
}

export interface ProductSalesReport {
    productId: number;
    productName: string;
    category: string;
    totalQuantitySold: number;
    totalRevenue: number;
    orderCount: number;
}

export interface CustomerReport {
    userId: number;
    name: string;
    city: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
}

export interface CategoryRevenue {
    category: string;
    totalRevenue: number;
    totalOrders: number;
    productCount: number;
}

export interface LowStockAlert {
    productId: number;
    name: string;
    category: string;
    stock: number;
    price: number;
}