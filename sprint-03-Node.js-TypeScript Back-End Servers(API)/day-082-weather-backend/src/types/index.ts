// All shared types for the Weather Backend Service

// Current weather snapshot stored in SQLite
export interface WeatherRecord {
    id: number;
    city: string;               // normalised city name (lowercase)
    country: string;            // ISO country code e.g. "NG"
    temp: number;               // current temperature
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;           // percent
    pressure: number;           // hPa
    wind_speed: number;         // m/s
    wind_deg: number;
    visibility: number;         // metres
    condition: string;          // e.g. "Clouds", "Rain"
    description: string;        // e.g. "broken clouds"
    icon: string;               // OpenWeatherMap icon code e.g. "04d"
    sunrise: number;            // Unix timestamp
    sunset: number;
    cached_at: string;          // ISO datetime of last fetch
    created_at: string;
}

// A single 3-hour forecast slot
export interface ForecastSlot {
    id: number;
    city: string;
    dt: number;                 // Unix timestamp of the forecast period
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    condition: string;
    description: string;
    icon: string;
    pop: number;                // probability of precipitation (0–1)
    cached_at: string;
}

// A weather alert generated from threshold checks
export interface WeatherAlert {
    id: number;
    city: string;
    type: string;               // e.g. "HIGH_TEMP", "HEAVY_RAIN", "STRONG_WIND"
    severity: "info" | "warning" | "critical";
    message: string;
    value: number;              // the measured value that triggered the alert
    threshold: number;          // the threshold it crossed
    active: number;             // SQLite boolean
    triggered_at: string;
    resolved_at: string | null;
}

// Raw shapes from OpenWeatherMap API
export interface OWMCurrentResponse {
    name: string;
    sys: { country: string; sunrise: number; sunset: number };
    main: {
        temp: number; feels_like: number; temp_min: number;
        temp_max: number; humidity: number; pressure: number;
    };
    wind: { speed: number; deg: number };
    visibility: number;
    weather: { main: string; description: string; icon: string }[];
}

export interface OWMForecastResponse {
    list: {
        dt: number;
        main: { temp: number; feels_like: number; humidity: number };
        wind: { speed: number };
        weather: { main: string; description: string; icon: string }[];
        pop: number;
    }[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}