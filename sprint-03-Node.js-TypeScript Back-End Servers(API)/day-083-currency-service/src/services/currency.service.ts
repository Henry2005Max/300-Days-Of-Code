// CurrencyService: the complete business logic layer.
//
// Key concepts introduced today (beyond Day 73):
//
// 1. HISTORICAL SNAPSHOTS
//    Every time the cron refreshes rates, we append a snapshot row for each
//    currency. This builds a time series we can query for trend analysis.
//    Old snapshots are pruned on each refresh to keep storage bounded.
//
// 2. CROSS-RATE CALCULATION
//    We only store USD-based rates (or whatever BASE_CURRENCY is set to).
//    To convert NGN → GBP we derive the cross-rate in memory:
//      NGN/GBP = (1 / rate_USD_NGN) * rate_USD_GBP
//    This is standard forex arithmetic — all pairs route through a common base.
//
// 3. TREND ANALYSIS
//    Given N snapshots for a pair, we compute: start, current, high, low,
//    average, absolute change, percentage change, and direction.
//    All computed in-app from the raw snapshot rows — no extra DB queries.
//
// 4. RATE ALERTS
//    On every refresh we check all active alerts. If a pair's current rate
//    crossed the threshold in the configured direction, we record triggered_at.
//    Alerts are never auto-deleted — the user must DELETE them explicitly.
//    This lets them see the full history of when alerts fired.

import db from "../db/database";
import { stmts } from "../db/statements";
import { fetchRates } from "./exchange";
import { LiveRate, RateSnapshot, RateAlert, ConversionLog, TrendSummary } from "../types";
import { NotFoundError, BadRequestError, UnprocessableError } from "../middleware/errorHandler";

const BASE                = (process.env.BASE_CURRENCY || "USD").toUpperCase();
const RETENTION_DAYS      = Number(process.env.HISTORY_RETENTION_DAYS) || 30;

// ── Refresh (called by cron + on demand) ─────────────────────────────────────

export async function refreshRates(): Promise<{ base: string; count: number }> {
    const { base, rates } = await fetchRates(BASE);

    // Upsert live_rates + append snapshots — all in one transaction
    const refresh = db.transaction(() => {
        for (const [currency, rate] of Object.entries(rates)) {
            stmts.upsertRate.run({ base, currency, rate });
            stmts.insertSnapshot.run({ base, currency, rate });
        }
    });
    refresh();

    // Prune snapshots older than retention window
    stmts.pruneSnapshots.run({ cutoff: `-${RETENTION_DAYS} days` });

    // Check rate alerts against the new data
    checkAlerts(rates, base);

    console.log(`[currency] Refreshed ${Object.keys(rates).length} rates for base ${base}`);
    return { base, count: Object.keys(rates).length };
}

// ── Live rates ────────────────────────────────────────────────────────────────

export function getLiveRates(
    base: string,
    filter: string[]
): LiveRate[] {
    const rows = stmts.getAllRates.all({ base: base.toUpperCase() }) as LiveRate[];
    if (!rows.length) {
        throw new UnprocessableError(
            `No rates found for base "${base}". Try GET /rates/refresh first.`
        );
    }
    if (filter.length > 0) {
        return rows.filter((r) => filter.includes(r.currency));
    }
    return rows;
}

// Get a single live rate between any two currencies using cross-rate arithmetic
export function getCrossRate(from: string, to: string): number {
    if (from === to) return 1;

    const fromRate = stmts.getLiveRate.get({ base: BASE, currency: from }) as LiveRate | undefined;
    const toRate   = stmts.getLiveRate.get({ base: BASE, currency: to   }) as LiveRate | undefined;

    // Also check if from or to IS the base currency
    const fromIsBase = from === BASE;
    const toIsBase   = to   === BASE;

    if (!fromIsBase && !fromRate) throw new UnprocessableError(`No live rate for currency "${from}". Run a refresh first.`);
    if (!toIsBase   && !toRate)   throw new UnprocessableError(`No live rate for currency "${to}". Run a refresh first.`);

    // Cross-rate: from → base → to
    // rate means: 1 BASE = X currency
    // So: 1 from = (1 / fromRate) BASE = (1 / fromRate) * toRate to
    const fromR = fromIsBase ? 1 : fromRate!.rate;
    const toR   = toIsBase   ? 1 : toRate!.rate;

    return toR / fromR;
}

// ── Convert ───────────────────────────────────────────────────────────────────

export function convert(
    from: string, to: string, amount: number
): { from: string; to: string; amount: number; result: number; rate: number } {
    const rate   = getCrossRate(from, to);
    const result = Math.round(amount * rate * 100) / 100;

    // Log every conversion for history
    stmts.insertConversion.run({
        from_currency: from,
        to_currency:   to,
        from_amount:   amount,
        to_amount:     result,
        rate,
    });

    return { from, to, amount, result, rate };
}

// ── Trend ─────────────────────────────────────────────────────────────────────

export function getTrend(base: string, currency: string, days: number): TrendSummary {
    // Validate the pair exists
    const live = stmts.getLiveRate.get({
        base: base.toUpperCase(), currency: currency.toUpperCase(),
    }) as LiveRate | undefined;

    if (!live) {
        throw new UnprocessableError(
            `No data for pair ${base}/${currency}. Run a refresh first.`
        );
    }

    const snapshots = stmts.getSnapshots.all({
        base:     base.toUpperCase(),
        currency: currency.toUpperCase(),
        since:    `-${days} days`,
    }) as RateSnapshot[];

    if (snapshots.length === 0) {
        // Return minimal summary with just the live rate
        return {
            base: base.toUpperCase(),
            currency: currency.toUpperCase(),
            days,
            current_rate: live.rate,
            start_rate:   live.rate,
            change:       0,
            change_pct:   0,
            high:         live.rate,
            low:          live.rate,
            average:      live.rate,
            direction:    "flat",
            snapshots:    [],
        };
    }

    const rates       = snapshots.map((s) => s.rate);
    const startRate   = rates[0];
    const currentRate = live.rate;
    const high        = Math.max(...rates);
    const low         = Math.min(...rates);
    const average     = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10000) / 10000;
    const change      = Math.round((currentRate - startRate) * 10000) / 10000;
    const changePct   = Math.round(((currentRate - startRate) / startRate) * 10000) / 100;
    const direction   = change > 0.0001 ? "up" : change < -0.0001 ? "down" : "flat";

    return {
        base:         base.toUpperCase(),
        currency:     currency.toUpperCase(),
        days,
        current_rate: currentRate,
        start_rate:   startRate,
        change,
        change_pct:   changePct,
        high,
        low,
        average,
        direction,
        snapshots:    snapshots.map((s) => ({ rate: s.rate, recorded_at: s.recorded_at })),
    };
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function createAlert(data: {
    base: string; currency: string;
    direction: "above" | "below"; threshold: number; label: string;
}): RateAlert {
    const result = stmts.insertAlert.run(data);
    return db.prepare("SELECT * FROM rate_alerts WHERE id = ?").get(result.lastInsertRowid) as RateAlert;
}

export function listAlerts(activeOnly = false): RateAlert[] {
    return (activeOnly ? stmts.getActiveAlerts.all() : stmts.listAlerts.all()) as RateAlert[];
}

export function deleteAlert(id: number): void {
    const existing = db.prepare("SELECT id FROM rate_alerts WHERE id = ?").get(id);
    if (!existing) throw new NotFoundError("Alert", id);
    stmts.deleteAlert.run(id);
}

// ── Conversion log ────────────────────────────────────────────────────────────

export function getConversionLog(
    limit: number, offset: number
): { rows: ConversionLog[]; total: number } {
    const rows  = stmts.getConversionLog.all({ limit, offset }) as ConversionLog[];
    const total = (stmts.countConversions.get() as { count: number }).count;
    return { rows, total };
}

// ── Internal: alert evaluation ────────────────────────────────────────────────

function checkAlerts(rates: Record<string, number>, base: string): void {
    const active = stmts.getActiveAlerts.all() as RateAlert[];

    for (const alert of active) {
        // Only check alerts that match the base we just refreshed
        if (alert.base !== base) continue;

        const currentRate = rates[alert.currency];
        if (currentRate === undefined) continue;

        const triggered =
            (alert.direction === "above" && currentRate > alert.threshold) ||
            (alert.direction === "below" && currentRate < alert.threshold);

        if (triggered) {
            stmts.triggerAlert.run(alert.id);
            console.log(
                `[alert] Triggered: ${alert.base}/${alert.currency} is ${currentRate} ` +
                `(${alert.direction} ${alert.threshold}) — "${alert.label}"`
            );
        }
    }
}