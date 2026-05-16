import { getPool } from './pool';
import { Asset, PricePoint, PriceReport } from '../types';

export async function upsertAsset(asset: Asset): Promise<void> {
    const pool = getPool();
    await pool.query(
        `INSERT INTO assets (symbol, name, type, currency)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (symbol) DO UPDATE
       SET name = EXCLUDED.name,
           type = EXCLUDED.type,
           currency = EXCLUDED.currency`,
        [asset.symbol, asset.name, asset.type, asset.currency]
    );
}

export async function insertPricePoint(point: PricePoint): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO price_history (symbol, price, open, high, low, volume, recorded_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (symbol, recorded_at) DO NOTHING`,
        [point.symbol, point.price, point.open, point.high, point.low, point.volume]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function buildPriceReports(): Promise<PriceReport[]> {
    const pool = getPool();

    // Latest price point per symbol + previous price for change calc
    const { rows } = await pool.query(`
    WITH latest AS (
      SELECT DISTINCT ON (symbol)
        symbol, price, open, high, low, volume, recorded_at
      FROM price_history
      ORDER BY symbol, recorded_at DESC
    ),
    previous AS (
      SELECT DISTINCT ON (ph.symbol)
        ph.symbol, ph.price AS prev_price
      FROM price_history ph
      JOIN latest l ON ph.symbol = l.symbol
      WHERE ph.recorded_at < l.recorded_at
      ORDER BY ph.symbol, ph.recorded_at DESC
    )
    SELECT
      a.symbol,
      a.name,
      a.type,
      a.currency,
      l.price       AS latest_price,
      l.open,
      l.high,
      l.low,
      l.volume,
      l.recorded_at,
      p.prev_price
    FROM latest l
    JOIN assets a ON a.symbol = l.symbol
    LEFT JOIN previous p ON p.symbol = l.symbol
    ORDER BY a.type, a.symbol
  `);

    return (rows as Record<string, unknown>[]).map((r) => {
        const latest   = parseFloat(r.latest_price as string);
        const prev     = r.prev_price ? parseFloat(r.prev_price as string) : latest;
        const change   = parseFloat((latest - prev).toFixed(6));
        const changePct = prev !== 0
            ? parseFloat(((change / prev) * 100).toFixed(2))
            : 0;

        return {
            symbol:      r.symbol as string,
            name:        r.name   as string,
            type:        r.type   as 'stock' | 'forex',
            currency:    r.currency as string,
            latestPrice: latest,
            open:        parseFloat(r.open as string),
            high:        parseFloat(r.high as string),
            low:         parseFloat(r.low  as string),
            volume:      r.volume ? parseInt(r.volume as string, 10) : null,
            change,
            changePct,
            recordedAt:  new Date(r.recorded_at as string),
        };
    });
}

export async function getPriceHistory(symbol: string, limit = 10): Promise<PricePoint[]> {
    const pool = getPool();
    const { rows } = await pool.query(
        `SELECT symbol, price, open, high, low, volume, recorded_at AS "recordedAt"
     FROM price_history
     WHERE symbol = $1
     ORDER BY recorded_at DESC
     LIMIT $2`,
        [symbol, limit]
    );
    return rows.map((r: Record<string, unknown>) => ({
        symbol:     r.symbol as string,
        price:      parseFloat(r.price as string),
        open:       parseFloat(r.open  as string),
        high:       parseFloat(r.high  as string),
        low:        parseFloat(r.low   as string),
        volume:     r.volume ? parseInt(r.volume as string, 10) : null,
        recordedAt: new Date(r.recordedAt as string),
    }));
}