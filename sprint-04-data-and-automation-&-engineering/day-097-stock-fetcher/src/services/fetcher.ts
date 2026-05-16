import { PricePoint, Asset } from '../types';

const BASE_URL = 'https://www.alphavantage.co/query';

// Realistic mock data used when API key is 'demo' or rate limit is hit
const MOCK_PRICES: Record<string, Omit<PricePoint, 'symbol' | 'recordedAt'>> = {
    AAPL:    { price: 189.30, open: 188.50, high: 190.20, low: 187.80, volume: 54_320_100 },
    MSFT:    { price: 415.80, open: 413.20, high: 417.50, low: 412.60, volume: 21_450_300 },
    GOOGL:   { price: 176.40, open: 175.10, high: 177.90, low: 174.50, volume: 18_760_400 },
    META:    { price: 502.60, open: 499.30, high: 505.10, low: 498.20, volume: 15_230_500 },
    AMZN:    { price: 185.90, open: 184.40, high: 187.20, low: 183.80, volume: 31_540_200 },
    'USD/NGN': { price: 1582.50, open: 1580.00, high: 1590.00, low: 1575.00, volume: null },
    'GBP/NGN': { price: 2021.30, open: 2018.00, high: 2028.00, low: 2015.00, volume: null },
    'EUR/NGN': { price: 1723.80, open: 1720.00, high: 1730.00, low: 1716.00, volume: null },
};

function isMockMode(): boolean {
    const key = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    return key === 'demo';
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchStockQuote(symbol: string, apiKey: string): Promise<PricePoint | null> {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as Record<string, unknown>;

    // Alpha Vantage rate limit returns an Information key
    if (data['Information'] || data['Note']) {
        throw new Error('Rate limit reached');
    }

    const quote = data['Global Quote'] as Record<string, string> | undefined;
    if (!quote || !quote['05. price']) return null;

    return {
        symbol,
        price:      parseFloat(quote['05. price']),
        open:       parseFloat(quote['02. open']),
        high:       parseFloat(quote['03. high']),
        low:        parseFloat(quote['04. low']),
        volume:     parseInt(quote['06. volume'], 10) || null,
        recordedAt: new Date(),
    };
}

async function fetchForexRate(fromSymbol: string, toSymbol: string, apiKey: string): Promise<PricePoint | null> {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromSymbol}&to_currency=${toSymbol}&apikey=${apiKey}`;

    const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as Record<string, unknown>;

    if (data['Information'] || data['Note']) {
        throw new Error('Rate limit reached');
    }

    const rate = data['Realtime Currency Exchange Rate'] as Record<string, string> | undefined;
    if (!rate || !rate['5. Exchange Rate']) return null;

    const price = parseFloat(rate['5. Exchange Rate']);
    return {
        symbol:     `${fromSymbol}/${toSymbol}`,
        price,
        open:       price,
        high:       price,
        low:        price,
        volume:     null,
        recordedAt: new Date(),
    };
}

function getMockPoint(asset: Asset): PricePoint {
    const mock = MOCK_PRICES[asset.symbol];
    return {
        symbol:     asset.symbol,
        recordedAt: new Date(),
        ...mock,
    };
}

export async function fetchPricePoint(asset: Asset): Promise<PricePoint> {
    if (isMockMode()) {
        console.log(`  [Mock] ${asset.symbol} — using mock data (set ALPHA_VANTAGE_API_KEY for live data)`);
        return getMockPoint(asset);
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY!;

    try {
        let point: PricePoint | null = null;

        if (asset.type === 'stock') {
            point = await fetchStockQuote(asset.symbol, apiKey);
        } else {
            const [from, to] = asset.symbol.split('/');
            point = await fetchForexRate(from, to, apiKey);
        }

        if (!point) throw new Error('Empty response from API');

        // Alpha Vantage free tier: max 5 requests/min
        await sleep(12000);
        return point;
    } catch (err) {
        console.warn(`  [Fallback] ${asset.symbol} — ${(err as Error).message}. Using mock data.`);
        return getMockPoint(asset);
    }
}