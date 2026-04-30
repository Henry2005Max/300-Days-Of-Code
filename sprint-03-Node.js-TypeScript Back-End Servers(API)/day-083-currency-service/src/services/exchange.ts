// Exchange rate API wrapper.
//
// Primary:  exchangerate-api.com (free tier, 250 req/month, requires API key)
//   GET https://v6.exchangerate-api.com/v6/{key}/latest/{base}
//
// Fallback: open.er-api.com (no key required, more rate-limited)
//   GET https://open.er-api.com/v6/latest/{base}
//
// Both return the same response shape:
//   { base_code: "USD", conversion_rates: { NGN: 1612.5, GBP: 0.79, ... } }
//
// If no API key is set in .env we automatically use the fallback URL.
// This means the server works out of the box without any sign-up.

import axios from "axios";
import { ServiceUnavailableError } from "../middleware/errorHandler";

const TIMEOUT = Number(process.env.WEATHER_FETCH_TIMEOUT_MS) || 6000;

export interface ExchangeRateResponse {
    base: string;
    rates: Record<string, number>; // { NGN: 1612.5, GBP: 0.79, ... }
}

export async function fetchRates(base: string): Promise<ExchangeRateResponse> {
    const key = process.env.EXCHANGE_API_KEY;
    const url  = (!key || key === "your_api_key_here")
        ? `https://open.er-api.com/v6/latest/${base}`
        : `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`;

    try {
        const res = await axios.get(url, { timeout: TIMEOUT });

        // Both APIs put rates under different keys — normalise here
        const rates: Record<string, number> =
            res.data.conversion_rates ?? res.data.rates ?? {};

        if (!Object.keys(rates).length) {
            throw new ServiceUnavailableError("Exchange rate API returned empty rates");
        }

        return { base: base.toUpperCase(), rates };
    } catch (err: any) {
        if (err instanceof ServiceUnavailableError) throw err;
        if (err.response?.status === 403 || err.response?.status === 401) {
            throw new ServiceUnavailableError(
                "Exchange rate API key is invalid. Check EXCHANGE_API_KEY in .env, or remove it to use the no-key fallback."
            );
        }
        throw new ServiceUnavailableError(`Exchange rate fetch failed: ${err.message}`);
    }
}