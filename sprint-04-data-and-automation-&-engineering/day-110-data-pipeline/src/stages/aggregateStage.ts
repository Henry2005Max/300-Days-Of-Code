import { Transform, TransformCallback } from 'stream';
import { EnrichedRow, CategoryAggregate, StageStats } from '../types';

export class AggregateStage extends Transform {
    public stats: StageStats = { in: 0, out: 0, dropped: 0 };

    // Category aggregation maps
    private catRevenue  = new Map<string, number>();
    private catOrders   = new Map<string, number>();
    private catQty      = new Map<string, number>();
    private catProducts = new Map<string, Map<string, number>>();

    // Monthly totals
    private monthRevenue = new Map<string, number>();
    private monthOrders  = new Map<string, number>();

    // City revenue
    private cityRevenue  = new Map<string, number>();

    constructor() {
        super({ objectMode: true });
    }

    _transform(row: EnrichedRow, _encoding: string, callback: TransformCallback): void {
        this.stats.in++;

        const { category, product, total_amount, quantity, month, city } = row;

        // Category aggregation
        this.catRevenue.set(category, (this.catRevenue.get(category) || 0) + total_amount);
        this.catOrders.set(category,  (this.catOrders.get(category)  || 0) + 1);
        this.catQty.set(category,     (this.catQty.get(category)     || 0) + quantity);

        if (!this.catProducts.has(category)) this.catProducts.set(category, new Map());
        const prodMap = this.catProducts.get(category)!;
        prodMap.set(product, (prodMap.get(product) || 0) + total_amount);

        // Monthly
        this.monthRevenue.set(month, (this.monthRevenue.get(month) || 0) + total_amount);
        this.monthOrders.set(month,  (this.monthOrders.get(month)  || 0) + 1);

        // City
        this.cityRevenue.set(city, (this.cityRevenue.get(city) || 0) + total_amount);

        this.stats.out++;
        callback(null, row);
    }

    public getCategories(): CategoryAggregate[] {
        const result: CategoryAggregate[] = [];
        for (const [category, revenue] of this.catRevenue) {
            const orders    = this.catOrders.get(category)  || 0;
            const qty       = this.catQty.get(category)     || 0;
            const prodMap   = this.catProducts.get(category) || new Map();
            let topProduct  = '';
            let topRev      = 0;
            for (const [p, r] of prodMap) {
                if (r > topRev) { topProduct = p; topRev = r; }
            }
            result.push({
                category,
                orderCount:    orders,
                totalRevenue:  parseFloat(revenue.toFixed(2)),
                avgOrderValue: parseFloat((revenue / orders).toFixed(2)),
                totalQuantity: qty,
                topProduct,
                topProductRev: parseFloat(topRev.toFixed(2)),
            });
        }
        return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    public getMonthlyTotals() {
        return [...this.monthRevenue.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({
                month,
                revenue:  parseFloat(revenue.toFixed(2)),
                orders:   this.monthOrders.get(month) || 0,
            }));
    }

    public getTopCities(n = 10) {
        return [...this.cityRevenue.entries()]
            .sort(([, a], [, b]) => b - a)
            .slice(0, n)
            .map(([city, revenue]) => ({ city, revenue: parseFloat(revenue.toFixed(2)) }));
    }
}