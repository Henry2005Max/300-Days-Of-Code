import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { z } from 'zod';
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
    unit_price:    z.string().transform((v) => {
        const n = parseFloat(v.replace(/[^0-9.]/g, ''));
        if (isNaN(n) || n < 0) throw new Error('Invalid unit_price');
        return n;
    }),
    total_amount:  z.string().transform((v) => {
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
            .pipe(
                parse({
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                    cast: false,
                })
            )
            .on('data', (row: RawCsvRow) => rows.push(row))
            .on('error', reject)
            .on('end', () => resolve(rows));
    });
}

export function validateRows(rows: RawCsvRow[]): ValidationResult {
    const valid: SalesRecord[] = [];
    const invalid: { row: RawCsvRow; reason: string }[] = [];

    for (const row of rows) {
        const result = SalesRowSchema.safeParse(row);

        if (result.success) {
            const data = result.data as unknown as {
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
            };
            valid.push({
                order_id:      data.order_id,
                customer_name: data.customer_name,
                product:       data.product,
                category:      data.category,
                quantity:      data.quantity,
                unit_price:    data.unit_price,
                total_amount:  data.total_amount,
                city:          data.city,
                state:         data.state,
                order_date:    data.order_date,
            });
        } else {
            const reason = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
            invalid.push({ row, reason });
        }
    }

    return { valid, invalid };
}