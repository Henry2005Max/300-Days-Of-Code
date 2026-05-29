import { Transform, TransformCallback } from 'stream';
import { z }                            from 'zod';
import { RawRow, ValidRow, StageStats } from '../types';

const RowSchema = z.object({
    order_id:      z.string().min(1),
    customer_name: z.string().min(1),
    product:       z.string().min(1),
    category:      z.string().min(1),
    quantity:      z.string().transform((v) => {
        const n = parseInt(v, 10);
        if (isNaN(n) || n <= 0) throw new Error('invalid quantity');
        return n;
    }),
    unit_price: z.string().transform((v) => {
        const n = parseFloat(v);
        if (isNaN(n) || n <= 0) throw new Error('invalid unit_price');
        return n;
    }),
    total_amount: z.string().transform((v) => {
        const n = parseFloat(v);
        if (isNaN(n) || n <= 0) throw new Error('invalid total_amount');
        return n;
    }),
    city:       z.string().min(1),
    state:      z.string().min(1),
    order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
});

export class ValidateStage extends Transform {
    public stats: StageStats = { in: 0, out: 0, dropped: 0 };
    private skipInvalid: boolean;
    private logEvery: number;

    constructor(skipInvalid = true, logEvery = 1000) {
        super({ objectMode: true });
        this.skipInvalid = skipInvalid;
        this.logEvery    = logEvery;
    }

    _transform(row: RawRow, _encoding: string, callback: TransformCallback): void {
        this.stats.in++;

        const result = RowSchema.safeParse(row);

        if (!result.success) {
            this.stats.dropped++;
            if (!this.skipInvalid) {
                callback(new Error(`Row ${this.stats.in}: ${result.error.errors[0].message}`));
                return;
            }
            callback();
            return;
        }

        this.stats.out++;

        if (this.stats.in % this.logEvery === 0) {
            process.stdout.write(`\r  [Validate] Processed ${this.stats.in.toLocaleString()} rows...`);
        }

        const d = result.data as unknown as Record<string, unknown>;
        const valid: ValidRow = {
            order_id:      d.order_id      as string,
            customer_name: d.customer_name as string,
            product:       d.product       as string,
            category:      d.category      as string,
            quantity:      d.quantity      as number,
            unit_price:    d.unit_price    as number,
            total_amount:  d.total_amount  as number,
            city:          d.city          as string,
            state:         d.state         as string,
            order_date:    d.order_date    as string,
        };

        callback(null, valid);
    }
}