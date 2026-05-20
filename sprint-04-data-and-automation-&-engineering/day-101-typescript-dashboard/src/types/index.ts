export interface DashboardMetrics {
    summary:        SummaryMetrics;
    topProducts:    ProductRow[];
    categories:     CategoryRow[];
    monthlyTrend:   TrendRow[];
    lastUpdated:    Date;
}

export interface SummaryMetrics {
    totalRevenue:   number;
    totalOrders:    number;
    avgOrderValue:  number;
    uniqueProducts: number;
    uniqueCities:   number;
}

export interface ProductRow {
    product:      string;
    category:     string;
    totalRevenue: number;
    orderCount:   number;
}

export interface CategoryRow {
    category:     string;
    totalRevenue: number;
    orderCount:   number;
    revenueShare: number;
}

export interface TrendRow {
    month:        string;
    totalRevenue: number;
    orderCount:   number;
}

export interface Panel {
    title:  string;
    width:  number;
    height: number;
    render: (metrics: DashboardMetrics) => string[];
}