// Raw row straight from CSV parse
export interface RawRow {
    [key: string]: string;
}

// After validation stage
export interface ValidRow {
    order_id:      string;
    customer_name: string;
    product:       string;
    category:      string;
    quantity:      number;
    unit_price:    number;
    total_amount:  number;
    city:          string;
    state:         string;
    order_date:    string;
}

// After enrichment stage — adds computed fields
export interface EnrichedRow extends ValidRow {
    month:         string;   // YYYY-MM
    quarter:       string;   // YYYY-QN
    revenue_band:  'low' | 'mid' | 'high';
    discount_pct:  number;   // % difference between unit*qty and total
    day_of_week:   string;
}

// Per-category aggregation
export interface CategoryAggregate {
    category:       string;
    orderCount:     number;
    totalRevenue:   number;
    avgOrderValue:  number;
    totalQuantity:  number;
    topProduct:     string;
    topProductRev:  number;
}

// Pipeline run summary
export interface PipelineSummary {
    inputFile:     string;
    startedAt:     string;
    finishedAt:    string;
    durationMs:    number;
    totalRows:     number;
    validRows:     number;
    invalidRows:   number;
    enrichedRows:  number;
    categories:    CategoryAggregate[];
    monthlyTotals: { month: string; revenue: number; orders: number }[];
    topCities:     { city: string; revenue: number }[];
}

export interface StageStats {
    in:      number;
    out:     number;
    dropped: number;
}