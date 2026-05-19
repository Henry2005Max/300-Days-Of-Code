import fs   from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { z }     from 'zod';
import { RawCsvRow, SalesRecord, ValidationResult } from '../types';

const SalesRowSchema = z.object({
    order_id:      z.string().min(1),
    customer_name: z.string().min(1),
    product:       z.string().min(1),
    category:      z.string().min(1),
    quantity:      z.string().transform((v) => {
        const n = parseInt(v, 10);
        if (isNaN(n) || n <= 0) throw new Error('Invalid quantity');
        return n;
    }),
    unit_price:   z.string().transform((v) => {
        const n = parseFloat(v.replace(/[^0-9.]/g, ''));
        if (isNaN(n) || n < 0) throw new Error('Invalid unit_price');
        return n;
    }),
    total_amount: z.string().transform((v) => {
        const n = parseFloat(v.replace(/[^0-9.]/g, ''));
        if (isNaN(n) || n < 0) throw new Error('Invalid total_amount');
        return n;
    }),
    city:       z.string().min(1),
    state:      z.string().min(1),
    order_date: z.string().min(1),
});

export async function parseCsv(filePath: string): Promise<RawCsvRow[]> {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`CSV file not found: ${absolutePath}`);
    }
    return new Promise((resolve, reject) => {
        const rows: RawCsvRow[] = [];
        fs.createReadStream(absolutePath)
            .pipe(parse({ columns: true, skip_empty_lines: true, trim: true, cast: false }))
            .on('data', (row: RawCsvRow) => rows.push(row))
            .on('error', reject)
            .on('end', () => resolve(rows));
    });
}

export function validateRows(rows: RawCsvRow[]): ValidationResult {
    const valid: SalesRecord[]                             = [];
    const invalid: { row: RawCsvRow; reason: string }[]   = [];

    for (const row of rows) {
        const result = SalesRowSchema.safeParse(row);
        if (result.success) {
            const d = result.data as unknown as Record<string, unknown>;
            valid.push({
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
            });
        } else {
            invalid.push({
                row,
                reason: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
            });
        }
    }
    return { valid, invalid };
}