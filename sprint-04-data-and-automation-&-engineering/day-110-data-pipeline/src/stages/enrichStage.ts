import { Transform, TransformCallback } from 'stream';
import { ValidRow, EnrichedRow, StageStats } from '../types';

function getQuarter(date: Date): string {
    const q = Math.ceil((date.getMonth() + 1) / 3);
    return `${date.getFullYear()}-Q${q}`;
}

function getDayOfWeek(date: Date): string {
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
}

function getRevenueBand(total: number): 'low' | 'mid' | 'high' {
    if (total < 20_000)  return 'low';
    if (total < 200_000) return 'mid';
    return 'high';
}

function getDiscountPct(unitPrice: number, qty: number, total: number): number {
    const expected = unitPrice * qty;
    if (expected === 0) return 0;
    return parseFloat((((expected - total) / expected) * 100).toFixed(2));
}

export class EnrichStage extends Transform {
    public stats: StageStats = { in: 0, out: 0, dropped: 0 };

    constructor() {
        super({ objectMode: true });
    }

    _transform(row: ValidRow, _encoding: string, callback: TransformCallback): void {
        this.stats.in++;

        const date: Date = new Date(row.order_date);

        const enriched: EnrichedRow = {
            ...row,
            month:        row.order_date.slice(0, 7),
            quarter:      getQuarter(date),
            revenue_band: getRevenueBand(row.total_amount),
            discount_pct: getDiscountPct(row.unit_price, row.quantity, row.total_amount),
            day_of_week:  getDayOfWeek(date),
        };

        this.stats.out++;
        callback(null, enriched);
    }
}