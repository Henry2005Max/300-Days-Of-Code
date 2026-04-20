/* ── DB row shapes ── */
export interface RateSnapshotRow {
    id: number;
    base: string;
    fetched_at: string;
    rates_json: string;  /* full JSON object of all rates */
}

/* ── Clean API shapes ── */
export interface RateSnapshot {
    id: number;
    base: string;
    fetchedAt: string;
    rates: Record<string, number>;
}

export interface ConversionResult {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    inverseRate: number;
    fetchedAt: string;
}

export interface NgnSummary {
    ngnPerUsd: number;
    ngnPerGbp: number;
    ngnPerEur: number;
    usdPerNgn: number;
    fetchedAt: string;
}

/* ── Key currencies we always include ── */
export const KEY_CURRENCIES = [
    "USD", "EUR", "GBP", "NGN", "GHS", "KES",
    "ZAR", "JPY", "CAD", "AUD", "CNY", "INR",
] as const;

export type KeyCurrency = typeof KEY_CURRENCIES[number];