/* ── Proxy response wrapper ──────────────────────────────────────────
   Every response from this proxy follows the same shape.
   source: the upstream API that was called
   cached: whether this came from our cache or a live request
   cachedAt / expiresIn: cache transparency for the client
────────────────────────────────────────────────────────────────────── */
export interface ProxyResponse<T> {
  success: boolean;
  source: string;
  cached: boolean;
  cachedAt?: string;
  expiresInSeconds?: number;
  data: T;
}

/* ── Weather — transformed shape ────────────────────────────────────
   Open-Meteo returns a massive object. We extract just what matters.
────────────────────────────────────────────────────────────────────── */
export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    description: string;
    isDay: boolean;
  };
  daily: {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    description: string;
  }[];
}

/* ── Country — transformed shape ── */
export interface CountryData {
  name: string;
  officialName: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  area: number;
  languages: string[];
  currencies: { code: string; name: string; symbol: string }[];
  flag: string;
  flagEmoji: string;
  timezones: string[];
  callingCode: string[];
}

/* ── Exchange rate — transformed shape ── */
export interface ExchangeData {
  base: string;
  lastUpdated: string;
  rates: Record<string, number>;
  ngnRate?: number;
}

/* ── Cache entry ── */
export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}