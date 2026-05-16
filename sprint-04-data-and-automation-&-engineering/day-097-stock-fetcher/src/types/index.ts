export type AssetType = 'stock' | 'forex';

export interface Asset {
    symbol: string;
    name: string;
    type: AssetType;
    currency: string;
}

export interface PricePoint {
    symbol:    string;
    price:     number;
    open:      number;
    high:      number;
    low:       number;
    volume:    number | null;
    recordedAt: Date;
}

export interface PriceReport {
    symbol:      string;
    name:        string;
    type:        AssetType;
    currency:    string;
    latestPrice: number;
    open:        number;
    high:        number;
    low:         number;
    change:      number;
    changePct:   number;
    volume:      number | null;
    recordedAt:  Date;
}

export interface FetchResult {
    symbol:  string;
    success: boolean;
    points:  number;
    error?:  string;
}