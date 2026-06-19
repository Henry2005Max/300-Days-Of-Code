// ── Domain entities ──────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  search_vector?: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  revenue: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  ordered_at: string;
}

// ── Analytics results ────────────────────────────────────────────────────────

export interface OrderWithDetails extends Order {
  customer_name: string;
  customer_city: string;
  product_name: string;
  category: string;
}

export interface RevenueWindow {
  ordered_at: string;
  product_name: string;
  category: string;
  revenue: number;
  revenue_7d_ma: number | null;
  running_total: number;
  rank_in_category: number;
}

export interface CategorySummary {
  category: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  prev_month_revenue: number | null;
  mom_change_pct: number | null;
}

export interface CustomerLTV {
  customer_id: number;
  customer_name: string;
  city: string;
  total_spent: number;
  order_count: number;
  avg_order_value: number;
  ltv_percentile: number;
  ltv_band: string;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  category: string;
  total_revenue: number;
  units_sold: number;
  rank_overall: number;
  rank_in_category: number;
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: number;
  name: string;
  category: string;
  price: number;
  rank: number;
  headline: string;
}

// ── Export ───────────────────────────────────────────────────────────────────

export interface DashboardReport {
  generatedAt: string;
  period: { from: string; to: string };
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  categoryBreakdown: CategorySummary[];
  topProducts: TopProduct[];
  topCustomers: CustomerLTV[];
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

// ── Query options ────────────────────────────────────────────────────────────

export interface FilterOptions {
  from?: string;
  to?: string;
  category?: string;
  city?: string;
  limit?: number;
}
