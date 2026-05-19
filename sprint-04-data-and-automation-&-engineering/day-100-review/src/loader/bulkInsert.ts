import { getPool } from '../db/pool';
import { SalesRecord } from '../types';

const TABLE      = process.env.TABLE_NAME || 'sales_records';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100', 10);

// Day 91: sequential batches
// Day 100 improvement: concurrent batches with a concurrency limit
async function insertBatch(records: SalesRecord[]): Promise<void> {
    const pool        = getPool();
    const values: unknown[] = [];
    const placeholders: string[] = [];

    records.forEach((rec, idx) => {
        const base = idx * 10;
        placeholders.push(
            `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10})`
        );
        values.push(
            rec.order_id, rec.customer_name, rec.product, rec.category,
            rec.quantity, rec.unit_price, rec.total_amount,
            rec.city, rec.state, rec.order_date
        );
    });

    await pool.query(
        `INSERT INTO ${TABLE}
       (order_id, customer_name, product, category, quantity,
        unit_price, total_amount, city, state, order_date)
     VALUES ${placeholders.join(', ')}
     ON CONFLICT DO NOTHING`,
        values
    );
}

export async function bulkInsertConcurrent(
    records: SalesRecord[],
    concurrency = 4
): Promise<number> {
    if (records.length === 0) return 0;

    // Split into batches
    const batches: SalesRecord[][] = [];
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        batches.push(records.slice(i, i + BATCH_SIZE));
    }

    let inserted   = 0;
    let batchIndex = 0;

    console.log(`[Loader] ${records.length} records → ${batches.length} batches (concurrency: ${concurrency})`);

    // Process in windows of `concurrency` batches at a time
    while (batchIndex < batches.length) {
        const window = batches.slice(batchIndex, batchIndex + concurrency);
        await Promise.all(window.map((b) => insertBatch(b)));
        inserted   += window.reduce((s, b) => s + b.length, 0);
        batchIndex += concurrency;

        const done  = Math.min(batchIndex, batches.length);
        process.stdout.write(`\r[Loader] Batch ${done}/${batches.length} complete...`);
    }

    console.log('');
    return inserted;
}