import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', (err) => {
      console.error('Unexpected PG pool error:', err.message);
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
