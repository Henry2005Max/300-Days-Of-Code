export interface CategoryRevenue {
    category: string;
    total_revenue: number;
    order_count: number;
}

export interface MonthlyTrend {
    month: string;
    total_revenue: number;
    order_count: number;
}

export interface TopProduct {
    product: string;
    category: string;
    total_revenue: number;
    total_quantity: number;
}

export interface CityRevenue {
    city: string;
    state: string;
    total_revenue: number;
    order_count: number;
}

export interface StockLevel {
    product: string;
    category: string;
    quantity: number;
}

export interface ChartConfig {
    width: number;
    height: number;
    outputDir: string;
}