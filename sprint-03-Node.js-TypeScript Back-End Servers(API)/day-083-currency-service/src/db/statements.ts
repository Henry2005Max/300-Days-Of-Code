// Lazy prepared statements — compiled only after runMigrations() via initStatements().
// Avoids the "no such table" crash that hit Day 81.

import db from "./database";

type Stmts = ReturnType<typeof buildStatements>;
let _stmts: Stmts | null = null;

function buildStatements() {
    return {
        // ── Live rates ─────────────────────────────────────────────────────
        upsertRate: db.prepare(`
      INSERT INTO live_rates (base, currency, rate, fetched_at)
      VALUES (@base, @currency, @rate, datetime('now'))
      ON CONFLICT(base, currency) DO UPDATE SET
        rate       = excluded.rate,
        fetched_at = datetime('now')
    `),
        getLiveRate:   db.prepare("SELECT * FROM live_rates WHERE base = @base AND currency = @currency"),
        getAllRates:   db.prepare("SELECT * FROM live_rates WHERE base = @base ORDER BY currency"),
        listBases:     db.prepare("SELECT DISTINCT base FROM live_rates ORDER BY base"),

        // ── Snapshots ──────────────────────────────────────────────────────
        insertSnapshot: db.prepare(`
      INSERT INTO rate_snapshots (base, currency, rate)
      VALUES (@base, @currency, @rate)
    `),
        getSnapshots: db.prepare(`
      SELECT * FROM rate_snapshots
      WHERE base = @base AND currency = @currency
        AND recorded_at >= datetime('now', @since)
      ORDER BY recorded_at ASC
    `),
        pruneSnapshots: db.prepare(`
      DELETE FROM rate_snapshots
      WHERE recorded_at < datetime('now', @cutoff)
    `),

        // ── Alerts ─────────────────────────────────────────────────────────
        insertAlert: db.prepare(`
      INSERT INTO rate_alerts (base, currency, direction, threshold, label)
      VALUES (@base, @currency, @direction, @threshold, @label)
    `),
        getActiveAlerts: db.prepare(`
      SELECT * FROM rate_alerts WHERE active = 1 ORDER BY created_at DESC
    `),
        listAlerts: db.prepare(`
      SELECT * FROM rate_alerts ORDER BY created_at DESC LIMIT 100
    `),
        triggerAlert: db.prepare(`
      UPDATE rate_alerts SET triggered_at = datetime('now') WHERE id = ?
    `),
        deleteAlert: db.prepare("DELETE FROM rate_alerts WHERE id = ?"),

        // ── Conversion log ─────────────────────────────────────────────────
        insertConversion: db.prepare(`
      INSERT INTO conversion_log (from_currency, to_currency, from_amount, to_amount, rate)
      VALUES (@from_currency, @to_currency, @from_amount, @to_amount, @rate)
    `),
        getConversionLog: db.prepare(`
      SELECT * FROM conversion_log ORDER BY converted_at DESC LIMIT @limit OFFSET @offset
    `),
        countConversions: db.prepare("SELECT COUNT(*) as count FROM conversion_log"),
    };
}

export function initStatements(): void {
    _stmts = buildStatements();
    console.log("[db] Prepared statements compiled");
}

export const stmts = new Proxy({} as Stmts, {
    get(_target, prop: string) {
        if (!_stmts) throw new Error("initStatements() must be called after runMigrations()");
        return (_stmts as any)[prop];
    },
});