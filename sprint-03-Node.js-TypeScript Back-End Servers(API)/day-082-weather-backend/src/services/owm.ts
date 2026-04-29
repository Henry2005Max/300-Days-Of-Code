// Thin wrapper around the OpenWeatherMap API.
//
// Two endpoints we use (both on the free tier):
//   Current weather: GET /weather?q={city}&units={units}&appid={key}
//   5-day forecast:  GET /forecast?q={city}&units={units}&appid={key}
//
// The forecast endpoint returns 40 slots — one per 3-hour window for 5 days.
// We store all 40 in SQLite; the service layer filters by requested day count.
//
// Error handling: OWM returns HTTP 200 for most errors but puts the message
// in response.data.message. A 404 means the city was not found.
// A 401 means the API key is invalid or not yet activated (takes ~2h after signup).

import axios from "axios";
import { OWMCurrentResponse, OWMForecastResponse } from "../types";
import {
    ServiceUnavailableError,
    UnprocessableError,
} from "../middleware/errorHandler";

const BASE    = "https://api.openweathermap.org/data/2.5";
const TIMEOUT = Number(process.env.WEATHER_FETCH_TIMEOUT_MS) || 6000;
const UNITS   = process.env.WEATHER_UNITS || "metric";

function getKey(): string {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key || key === "your_api_key_here") {
        throw new ServiceUnavailableError(
            "OPENWEATHER_API_KEY is not set. Add it to .env — see README for instructions."
        );
    }
    return key;
}

export async function fetchCurrentWeather(city: string): Promise<OWMCurrentResponse> {
    const key = getKey();
    try {
        const res = await axios.get<OWMCurrentResponse>(`${BASE}/weather`, {
            params: { q: city, units: UNITS, appid: key },
            timeout: TIMEOUT,
        });
        return res.data;
    } catch (err: any) {
        if (err.response?.status === 404) {
            throw new UnprocessableError(`City not found: "${city}". Check the spelling or try adding the country code (e.g. "Lagos,NG").`);
        }
        if (err.response?.status === 401) {
            throw new ServiceUnavailableError("OpenWeatherMap API key is invalid or not yet activated. New keys can take up to 2 hours to activate.");
        }
        throw new ServiceUnavailableError(`OpenWeatherMap request failed: ${err.message}`);
    }
}

export async function fetchForecast(city: string): Promise<OWMForecastResponse> {
    const key = getKey();
    try {
        const res = await axios.get<OWMForecastResponse>(`${BASE}/forecast`, {
            params: { q: city, units: UNITS, appid: key },
            timeout: TIMEOUT,
        });
        return res.data;
    } catch (err: any) {
        if (err.response?.status === 404) {
            throw new UnprocessableError(`City not found: "${city}".`);
        }
        if (err.response?.status === 401) {
            throw new ServiceUnavailableError("OpenWeatherMap API key is invalid or not yet activated.");
        }
        throw new ServiceUnavailableError(`OpenWeatherMap forecast request failed: ${err.message}`);
    }
}

// Unit label for display — e.g. "°C" for metric, "°F" for imperial
export function tempUnit(): string {
    return UNITS === "imperial" ? "°F" : UNITS === "standard" ? "K" : "°C";
}