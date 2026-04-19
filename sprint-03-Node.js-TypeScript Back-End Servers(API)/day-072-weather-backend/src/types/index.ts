/* ── Location as stored in DB ── */
export interface LocationRow {
    id: number;
    slug: string;        /* url-friendly key: "lagos", "port-harcourt" */
    name: string;
    state: string;
    latitude: number;
    longitude: number;
    timezone: string;
    fetch_count: number;
    last_fetched_at: string | null;
}

/* ── Weather reading as stored in DB ── */
export interface WeatherRow {
    id: number;
    location_id: number;
    fetched_at: string;   /* ISO datetime */
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather_code: number;
    description: string;
    is_day: number;       /* 0 or 1 */
    forecast_json: string; /* JSON string of 7-day forecast array */
}

/* ── Clean API shapes ── */
export interface Location {
    id: number;
    slug: string;
    name: string;
    state: string;
    latitude: number;
    longitude: number;
    timezone: string;
    fetchCount: number;
    lastFetchedAt: string | null;
}

export interface DailyForecast {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitationSum: number;
    description: string;
}

export interface WeatherReading {
    id: number;
    locationId: number;
    fetchedAt: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    description: string;
    isDay: boolean;
    forecast: DailyForecast[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: Record<string, unknown>;
}