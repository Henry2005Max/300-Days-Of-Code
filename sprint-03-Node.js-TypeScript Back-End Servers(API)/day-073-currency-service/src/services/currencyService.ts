import axios from "axios";
import { db } from "../db/database";
import { RateSnapshotRow, RateSnapshot, ConversionResult, NgnSummary, KEY_CURRENCIES } from "../types";

const EXCHANGE_API = process.env.EXCHANGE_API_URL || "https://open.er-api.com/v6";

/* ── Row converter ── */
function toSnapshot(row: RateSnapshotRow): RateSnapshot {
    return {
        id:        row.id,
        base:      row.base,
        fetchedAt: row.fetched_at,
        rates:     JSON.parse(row.rates_json),
    };
}

/* ── Fetch from API and store in DB ──────────────────────────────────
   Called by the background scheduler and the manual refresh endpoint.
   Returns the new snapshot.
────────────────────────────────────────────────────────────────────── */
export async function fetchAndStore(base: string = "USD"): Promise<RateSnapshot> {
    const start = Date.now();
    console.log(`[CURRENCY] Fetching rates for base ${base} from open.er-api.com...`);

    try {
        const { data } = await axios.get(`${EXCHANGE_API}/latest/${base.toUpperCase()}`, {
            timeout: 10_000,
        });

        if (data.result !== "success") {
            throw new Error(`API error: ${data["error-type"] ?? "unknown"}`);
        }

        const result = db.prepare(`
      INSERT INTO rate_snapshots (base, rates_json)
      VALUES (@base, @ratesJson)
    `).run({
            base:      data.base_code,
            ratesJson: JSON.stringify(data.rates),
        });

        /* Log success */
        db.prepare(`
      INSERT INTO refresh_log (success, duration_ms)
      VALUES (1, @duration)
    `).run({ duration: Date.now() - start });

        const newRow = db.prepare(
            "SELECT * FROM rate_snapshots WHERE id = ?"
        ).get(result.lastInsertRowid) as RateSnapshotRow;

        console.log(`[CURRENCY] Stored snapshot ID ${newRow.id} for ${base} (${Object.keys(data.rates).length} currencies)`);

        return toSnapshot(newRow);

    } catch (err: any) {
        /* Log failure */
        db.prepare(`
      INSERT INTO refresh_log (success, duration_ms, error)
      VALUES (0, @duration, @error)
    `).run({ duration: Date.now() - start, error: err.message });

        throw err;
    }
}

/* ── Get the latest snapshot from DB ─────────────────────────────────
   Called by every read endpoint — no API call, just DB.
────────────────────────────────────────────────────────────────────── */
export function getLatestSnapshot(base: string = "USD"): RateSnapshot | null {
    const row = db.prepare(`
    SELECT * FROM rate_snapshots
    WHERE base = ?
    ORDER BY fetched_at DESC
    LIMIT 1
  `).get(base.toUpperCase()) as RateSnapshotRow | undefined;

    return row ? toSnapshot(row) : null;
}

/* ── Get key currencies only from a snapshot ── */
export function getKeyRates(base: string = "USD"): {
    snapshot: RateSnapshot;
    keyRates: Record<string, number>;
} | null {
    const snapshot = getLatestSnapshot(base);
    if (!snapshot) return null;

    const keyRates: Record<string, number> = {};
    KEY_CURRENCIES.forEach((code) => {
        if (snapshot.rates[code] !== undefined) {
            keyRates[code] = snapshot.rates[code];
        }
    });

    return { snapshot, keyRates };
}

/* ── Convert an amount between two currencies ────────────────────────
   If the snapshot base is USD and we want NGN→GBP:
   1. Get USD→NGN rate and USD→GBP rate from the snapshot
   2. amount_in_GBP = amount_in_NGN * (USD→GBP / USD→NGN)
   This is called cross-rate calculation.
────────────────────────────────────────────────────────────────────── */
export function convert(
    from: string,
    to: string,
    amount: number
): ConversionResult | null {
    const snapshot = getLatestSnapshot("USD");
    if (!snapshot) return null;

    const fromUpper = from.toUpperCase();
    const toUpper   = to.toUpperCase();

    const rates = snapshot.rates;

    /* Get rate of from-currency in USD terms */
    const fromRate = fromUpper === "USD" ? 1 : rates[fromUpper];
    const toRate   = toUpper   === "USD" ? 1 : rates[toUpper];

    if (!fromRate || !toRate) return null;

    /* Cross-rate: from → USD → to */
    const rate    = toRate / fromRate;
    const result  = amount * rate;

    return {
        from:        fromUpper,
        to:          toUpper,
        amount,
        result:      Math.round(result * 100) / 100,
        rate:        Math.round(rate * 10000) / 10000,
        inverseRate: Math.round((1 / rate) * 10000) / 10000,
        fetchedAt:   snapshot.fetchedAt,
    };
}

/* ── NGN summary — Naira-specific view ── */
export function getNgnSummary(): NgnSummary | null {
    const snapshot = getLatestSnapshot("USD");
    if (!snapshot) return null;

    const r = snapshot.rates;
    const ngn = r["NGN"];
    const gbp = r["GBP"];
    const eur = r["EUR"];

    if (!ngn) return null;

    return {
        ngnPerUsd: Math.round(ngn * 100) / 100,
        ngnPerGbp: Math.round((ngn / gbp) * 100) / 100,
        ngnPerEur: Math.round((ngn / eur) * 100) / 100,
        usdPerNgn: Math.round((1 / ngn) * 10000) / 10000,
        fetchedAt: snapshot.fetchedAt,
    };
}

/* ── Snapshot history — last N snapshots ── */
export function getHistory(base: string = "USD", limit: number = 24): RateSnapshot[] {
    const rows = db.prepare(`
    SELECT * FROM rate_snapshots
    WHERE base = ?
    ORDER BY fetched_at DESC
    LIMIT ?
  `).all(base.toUpperCase(), limit) as RateSnapshotRow[];

    return rows.map(toSnapshot);
}

/* ── Refresh log — last N job runs ── */
export function getRefreshLog(limit: number = 20) {
    return db.prepare(`
    SELECT * FROM refresh_log
    ORDER BY ran_at DESC
    LIMIT ?
  `).all(limit);
}

/* ── Service stats ── */
export function getStats() {
    const totalSnapshots = (db.prepare(
        "SELECT COUNT(*) as c FROM rate_snapshots"
    ).get() as any).c;

    const latest = getLatestSnapshot("USD");
    const refreshes = (db.prepare(
        "SELECT COUNT(*) as c FROM refresh_log WHERE success = 1"
    ).get() as any).c;
    const failures = (db.prepare(
        "SELECT COUNT(*) as c FROM refresh_log WHERE success = 0"
    ).get() as any).c;

    return {
        totalSnapshots,
        successfulRefreshes: refreshes,
        failedRefreshes:     failures,
        latestSnapshot:      latest ? { base: latest.base, fetchedAt: latest.fetchedAt } : null,
    };
}