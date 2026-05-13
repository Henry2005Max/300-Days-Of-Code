import { ForexSnapshot, ForexRate } from '../types';

const TRACKED_CURRENCIES: Omit<ForexRate, 'rateToNGN'>[] = [
    { currency: 'USD', symbol: 'US Dollar',       flag: '🇺🇸' },
    { currency: 'GBP', symbol: 'British Pound',   flag: '🇬🇧' },
    { currency: 'EUR', symbol: 'Euro',             flag: '🇪🇺' },
    { currency: 'CAD', symbol: 'Canadian Dollar',  flag: '🇨🇦' },
    { currency: 'AED', symbol: 'UAE Dirham',       flag: '🇦🇪' },
    { currency: 'CNY', symbol: 'Chinese Yuan',     flag: '🇨🇳' },
];

// Mock rates as fallback when no API key is set
// These represent approximate NGN exchange rates
const MOCK_RATES: Record<string, number> = {
    USD: 1580.00,
    GBP: 2020.00,
    EUR: 1720.00,
    CAD: 1160.00,
    AED: 430.00,
    CNY: 218.00,
};

export async function fetchForexRates(): Promise<ForexSnapshot> {
    const apiKey  = process.env.EXCHANGE_RATE_API_KEY;
    const baseUrl = process.env.EXCHANGE_RATE_BASE_URL;

    // If no API key, use mock data (useful for dry runs and testing)
    if (!apiKey || apiKey === 'your_exchange_rate_api_key_here') {
        console.log('[Forex] No API key set — using mock rates for dry run.');
        return buildSnapshot(MOCK_RATES);
    }

    try {
        const url      = `${baseUrl}/${apiKey}/latest/NGN`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Exchange rate API responded with ${response.status}`);
        }

        const data = await response.json() as {
            result: string;
            conversion_rates: Record<string, number>;
        };

        if (data.result !== 'success') {
            throw new Error('Exchange rate API returned unsuccessful result');
        }

        // API gives NGN-based rates — invert to get units of currency per NGN
        // e.g. 1 NGN = 0.000633 USD, so 1 USD = 1/0.000633 = 1580 NGN
        const invertedRates: Record<string, number> = {};
        for (const currency of TRACKED_CURRENCIES) {
            const rate = data.conversion_rates[currency.currency];
            if (rate) {
                invertedRates[currency.currency] = parseFloat((1 / rate).toFixed(2));
            }
        }

        return buildSnapshot(invertedRates);
    } catch (err) {
        console.warn(`[Forex] API fetch failed: ${(err as Error).message}. Falling back to mock rates.`);
        return buildSnapshot(MOCK_RATES);
    }
}

function buildSnapshot(rateMap: Record<string, number>): ForexSnapshot {
    const rates: ForexRate[] = TRACKED_CURRENCIES
        .filter((c) => rateMap[c.currency] !== undefined)
        .map((c) => ({
            ...c,
            rateToNGN: rateMap[c.currency],
        }));

    return {
        base:      'NGN',
        timestamp: new Date(),
        rates,
    };
}