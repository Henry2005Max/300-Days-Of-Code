export interface SaleRow {
  id: number;
  rep_name: string;
  region: string;
  product: string;
  category: string;
  units: number;
  unit_price: number;
  revenue: number;
  sale_date: string;
}

export interface RegionSummary {
  region: string;
  total_revenue: number;
  total_units: number;
  deal_count: number;
  avg_deal_size: number;
  top_product: string;
}

export interface RepSummary {
  rep_name: string;
  region: string;
  total_revenue: number;
  deal_count: number;
  avg_deal_size: number;
}

export interface CategorySummary {
  category: string;
  total_revenue: number;
  total_units: number;
  deal_count: number;
}

export interface SalesReport {
  generatedAt: string;
  period: { from: string; to: string };
  totals: {
    revenue: number;
    units: number;
    deals: number;
  };
  byRegion: RegionSummary[];
  byRep: RepSummary[];
  byCategory: CategorySummary[];
  rows: SaleRow[];
}

export interface ExportOptions {
  from?: string;
  to?: string;
  region?: string;
  category?: string;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';
