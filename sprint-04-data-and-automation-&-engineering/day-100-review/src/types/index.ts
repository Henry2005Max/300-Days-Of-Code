export interface SalesRecord {
    id?: number;
    order_id: string;
    customer_name: string;
    product: string;
    category: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    city: string;
    state: string;
    order_date: string;
}

export interface RawCsvRow {
    [key: string]: string;
}

export interface ValidationResult {
    valid: SalesRecord[];
    invalid: { row: RawCsvRow; reason: string }[];
}

// --- Existing Day 91 report shapes ---
export interface SummaryStats {
    totalRecords: number;
    totalRevenue: number;
    avgOrderValue: number;
    maxOrderValue: number;
    minOrderValue: number;
    uniqueProducts: number;
    uniqueCustomers: number;
    uniqueCities: number;
    dateRange: { from: string; to: string };
}

export interface ProductStat {
    product: string;
    category: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
}

export interface CategoryStat {
    category: string;
    totalRevenue: number;
    orderCount: number;
    revenueShare: number;
}

export interface CityStat {
    city: string;
    state: string;
    totalRevenue: number;
    orderCount: number;
}

export interface MonthlyTrend {
    month: string;
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
}

// --- NEW Day 100 additions ---
export interface CustomerSegment {
    segment: string;   // 'high-value' | 'mid-value' | 'low-value'
    customerCount: number;
    totalRevenue: number;
    avgSpend: number;
    minSpend: number;
    maxSpend: number;
}

export interface ProductAffinityPair {
    category_a: string;
    category_b: string;
    coOccurrences: number;
}

export interface RevenuePercentile {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
}

export interface QueryPlan {
    query: string;
    planLines: string[];
    executionMs: number;
}

export interface FullReport {
    summary: SummaryStats;
    topProducts: ProductStat[];
    topCategories: CategoryStat[];
    cityBreakdown: CityStat[];
    monthlyTrend: MonthlyTrend[];
    // New
    customerSegments: CustomerSegment[];
    revenuePercentiles: RevenuePercentile;
    weekdayRevenue: { day: string; totalRevenue: number; orderCount: number }[];
    queryPlans?: QueryPlan[];
}