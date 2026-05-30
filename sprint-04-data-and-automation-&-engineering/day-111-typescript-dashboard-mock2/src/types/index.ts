export interface DashboardData {
    totalRevenue:  number;
    totalOrders:   number;
    validRows:     number;
    invalidRows:   number;
    categories:    CategoryStat[];
    monthlyTotals: MonthlyTotal[];
    topCities:     CityStat[];
    notifications: Notification[];
}

export interface CategoryStat {
    category:      string;
    totalRevenue:  number;
    orderCount:    number;
    avgOrderValue: number;
    topProduct:    string;
}

export interface MonthlyTotal {
    month:   string;
    revenue: number;
    orders:  number;
}

export interface CityStat {
    city:    string;
    revenue: number;
}

export interface Notification {
    time:    string;
    level:   'info' | 'warn' | 'ok';
    message: string;
}

export interface PanelDef {
    title:  string;
    width:  number;
    render: (data: DashboardData, tick: number) => string[];
}