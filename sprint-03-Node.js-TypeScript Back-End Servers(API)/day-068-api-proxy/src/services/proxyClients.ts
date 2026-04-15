import axios from "axios";
import { WeatherData, CountryData, ExchangeData } from "../types";
import { getWeatherDescription } from "./weatherCodes";

const USER_AGENT = "Day68APIProxy/1.0 (300DaysOfCode; github.com/Henry2005Max)";

const http = axios.create({
  timeout: 10_000,
  headers: { "User-Agent": USER_AGENT },
});

/* ── Weather proxy ───────────────────────────────────────────────────
   Open-Meteo API — free, no API key required.
   We pass latitude and longitude and get back current + 7-day forecast.

   The raw response has arrays like:
     current.temperature_2m, current.relative_humidity_2m etc.
   We transform this into a clean flat object.

   Nigerian cities and their coordinates are pre-mapped so you can
   call /proxy/weather/lagos instead of providing lat/lon yourself.
────────────────────────────────────────────────────────────────────── */
export const NIGERIAN_CITIES: Record<string, { lat: number; lon: number; name: string }> = {
  lagos:         { lat: 6.5244,  lon: 3.3792,  name: "Lagos" },
  abuja:         { lat: 9.0579,  lon: 7.4951,  name: "Abuja" },
  kano:          { lat: 12.0022, lon: 8.5920,  name: "Kano" },
  ibadan:        { lat: 7.3775,  lon: 3.9470,  name: "Ibadan" },
  portharcourt:  { lat: 4.8156,  lon: 7.0498,  name: "Port Harcourt" },
  enugu:         { lat: 6.4584,  lon: 7.5464,  name: "Enugu" },
  kaduna:        { lat: 10.5264, lon: 7.4383,  name: "Kaduna" },
  benincity:     { lat: 6.3350,  lon: 5.6270,  name: "Benin City" },
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const BASE = process.env.OPEN_METEO_URL!;

  const { data } = await http.get(`${BASE}/forecast`, {
    params: {
      latitude:               lat,
      longitude:              lon,
      current:                "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
      daily:                  "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
      timezone:               "auto",
      forecast_days:          7,
    },
  });

  /* ── Transform raw response → clean WeatherData ── */
  const c = data.current;
  const d = data.daily;

  const daily = (d.time as string[]).map((date: string, i: number) => ({
    date,
    tempMax:           Math.round(d.temperature_2m_max[i]),
    tempMin:           Math.round(d.temperature_2m_min[i]),
    precipitationSum:  d.precipitation_sum[i],
    description:       getWeatherDescription(d.weather_code[i]),
  }));

  return {
    location: {
      latitude:  data.latitude,
      longitude: data.longitude,
      timezone:  data.timezone,
    },
    current: {
      temperature: Math.round(c.temperature_2m),
      feelsLike:   Math.round(c.apparent_temperature),
      humidity:    c.relative_humidity_2m,
      windSpeed:   c.wind_speed_10m,
      weatherCode: c.weather_code,
      description: getWeatherDescription(c.weather_code),
      isDay:       c.is_day === 1,
    },
    daily,
  };
}

/* ── Country proxy ───────────────────────────────────────────────────
   REST Countries API — free, no API key.
   Returns tons of data. We extract just the useful fields.
────────────────────────────────────────────────────────────────────── */
export async function fetchCountry(name: string): Promise<CountryData[]> {
  const BASE = process.env.REST_COUNTRIES_URL!;
  const { data } = await http.get(`${BASE}/name/${encodeURIComponent(name)}`);

  return (data as any[]).map((c: any) => {
    /* Languages object: { eng: "English", yor: "Yoruba" } → ["English", "Yoruba"] */
    const languages = c.languages ? Object.values(c.languages) as string[] : [];

    /* Currencies object: { NGN: { name: "Nigerian naira", symbol: "₦" } } */
    const currencies = c.currencies
      ? Object.entries(c.currencies).map(([code, val]: [string, any]) => ({
          code,
          name:   val.name,
          symbol: val.symbol,
        }))
      : [];

    /* Calling codes: { root: "+2", suffixes: ["34"] } → ["+234"] */
    const callingCode = c.idd?.root
      ? (c.idd.suffixes || []).map((s: string) => `${c.idd.root}${s}`)
      : [];

    return {
      name:         c.name?.common ?? "",
      officialName: c.name?.official ?? "",
      capital:      c.capital ?? [],
      region:       c.region ?? "",
      subregion:    c.subregion ?? "",
      population:   c.population ?? 0,
      area:         c.area ?? 0,
      languages,
      currencies,
      flag:         c.flags?.png ?? "",
      flagEmoji:    c.flag ?? "",
      timezones:    c.timezones ?? [],
      callingCode,
    };
  });
}

/* ── Exchange rate proxy ─────────────────────────────────────────────
   open.er-api.com — free tier, no key needed for basic rates.
   Returns all rates relative to the base currency.
   We filter to the most relevant currencies and always include NGN.
────────────────────────────────────────────────────────────────────── */
const KEY_CURRENCIES = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR", "JPY", "CAD", "AUD"];

export async function fetchExchangeRates(base: string = "USD"): Promise<ExchangeData> {
  const BASE = process.env.EXCHANGE_RATE_URL!;
  const { data } = await http.get(`${BASE}/latest/${base.toUpperCase()}`);

  if (data.result !== "success") {
    throw new Error(`Exchange rate API error: ${data["error-type"] ?? "unknown"}`);
  }

  /* Filter to key currencies only */
  const allRates = data.rates as Record<string, number>;
  const rates: Record<string, number> = {};
  KEY_CURRENCIES.forEach((c) => {
    if (allRates[c] !== undefined) rates[c] = allRates[c];
  });

  return {
    base:        data.base_code,
    lastUpdated: data.time_last_update_utc,
    rates,
    ngnRate:     allRates["NGN"],
  };
}