import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  description: string;
  icon: string;
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  dt: number;
}

interface ForecastItem {
  dt: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_KEY = "de853ecab447326c8b163cd9289e7a86"; // Replace with your OpenWeatherMap API key
const BASE = "https://api.openweathermap.org/data/2.5";

const NIGERIAN_CITIES = [
  "Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan",
  "Enugu", "Kaduna", "Benin City", "Calabar", "Jos"
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getWeatherBg(icon: string): string {
  if (icon.includes("01")) return "bg-clear";
  if (icon.includes("02") || icon.includes("03") || icon.includes("04")) return "bg-cloudy";
  if (icon.includes("09") || icon.includes("10")) return "bg-rain";
  if (icon.includes("11")) return "bg-storm";
  if (icon.includes("13")) return "bg-snow";
  return "bg-mist";
}

// ─── Mock Data (fallback when no API key) ────────────────────────────────────

const MOCK_WEATHER: WeatherData = {
  city: "Lagos", country: "NG", temp: 32, feels_like: 36,
  temp_min: 28, temp_max: 35, humidity: 78, wind_speed: 4.2,
  wind_deg: 210, description: "scattered clouds", icon: "03d",
  visibility: 10000, pressure: 1012,
  sunrise: Date.now() / 1000 - 21600,
  sunset: Date.now() / 1000 + 21600,
  dt: Date.now() / 1000,
};

const MOCK_FORECAST: ForecastItem[] = [
  { dt: Date.now() / 1000 + 86400, temp_min: 27, temp_max: 34, description: "light rain", icon: "10d", humidity: 82 },
  { dt: Date.now() / 1000 + 172800, temp_min: 26, temp_max: 33, description: "moderate rain", icon: "10d", humidity: 88 },
  { dt: Date.now() / 1000 + 259200, temp_min: 28, temp_max: 35, description: "clear sky", icon: "01d", humidity: 70 },
  { dt: Date.now() / 1000 + 345600, temp_min: 27, temp_max: 34, description: "few clouds", icon: "02d", humidity: 74 },
  { dt: Date.now() / 1000 + 432000, temp_min: 26, temp_max: 32, description: "scattered clouds", icon: "03d", humidity: 80 },
];

// ─── Components ───────────────────────────────────────────────────────────────

const WeatherIcon: React.FC<{ icon: string; size?: number }> = ({ icon, size = 64 }) => (
  <img
    src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
    alt="weather icon"
    width={size}
    height={size}
    className="weather-icon"
  />
);

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="stat-card">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
    {sub && <span className="stat-sub">{sub}</span>}
  </div>
);

const ForecastCard: React.FC<{ item: ForecastItem }> = ({ item }) => (
  <div className="forecast-card">
    <span className="fc-day">{formatDay(item.dt)}</span>
    <WeatherIcon icon={item.icon} size={40} />
    <span className="fc-desc">{item.description}</span>
    <div className="fc-temps">
      <span className="fc-max">{Math.round(item.temp_max)}°</span>
      <span className="fc-min">{Math.round(item.temp_min)}°</span>
    </div>
    <span className="fc-humidity">💧 {item.humidity}%</span>
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [isMock, setIsMock] = useState(false);

  const fetchWeather = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    if (API_KEY === "de853ecab447326c8b163cd9289e7a86") {
      await new Promise((r) => setTimeout(r, 600));
      setWeather(MOCK_WEATHER);
      setForecast(MOCK_FORECAST);
      setIsMock(true);
      setLoading(false);
      return;
    }

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`${BASE}/weather`, { params: { q: city, appid: API_KEY, units: unit } }),
        axios.get(`${BASE}/forecast`, { params: { q: city, appid: API_KEY, units: unit } }),
      ]);

      const w = weatherRes.data;
      setWeather({
        city: w.name, country: w.sys.country,
        temp: w.main.temp, feels_like: w.main.feels_like,
        temp_min: w.main.temp_min, temp_max: w.main.temp_max,
        humidity: w.main.humidity, wind_speed: w.wind.speed,
        wind_deg: w.wind.deg, description: w.weather[0].description,
        icon: w.weather[0].icon, visibility: w.visibility,
        pressure: w.main.pressure, sunrise: w.sys.sunrise,
        sunset: w.sys.sunset, dt: w.dt,
      });

      // Get one entry per day from 3h forecast
      const days: Record<string, ForecastItem> = {};
      forecastRes.data.list.forEach((item: any) => {
        const day = new Date(item.dt * 1000).toDateString();
        if (!days[day]) {
          days[day] = {
            dt: item.dt, temp_min: item.main.temp_min,
            temp_max: item.main.temp_max, description: item.weather[0].description,
            icon: item.weather[0].icon, humidity: item.main.humidity,
          };
        } else {
          days[day].temp_min = Math.min(days[day].temp_min, item.main.temp_min);
          days[day].temp_max = Math.max(days[day].temp_max, item.main.temp_max);
        }
      });
      setForecast(Object.values(days).slice(1, 6));
      setIsMock(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "City not found. Please try another.");
    } finally {
      setLoading(false);
    }
  }, [unit]);

  // Load Lagos on mount
  useEffect(() => { fetchWeather("Lagos"); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { fetchWeather(search); setSearch(""); }
  };

  const tempUnit = unit === "metric" ? "°C" : "°F";
  const bgClass = weather ? getWeatherBg(weather.icon) : "bg-clear";

  return (
    <div className={`app ${bgClass}`}>
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 39</span>
          <h1 className="header-title">Weather App</h1>
          <div className="unit-toggle">
            <button className={`unit-btn ${unit === "metric" ? "active" : ""}`} onClick={() => setUnit("metric")}>°C</button>
            <button className={`unit-btn ${unit === "imperial" ? "active" : ""}`} onClick={() => setUnit("imperial")}>°F</button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn" type="submit">Search</button>
        </form>

        {/* Quick cities */}
        <div className="quick-cities">
          {NIGERIAN_CITIES.map((c) => (
            <button key={c} className="city-chip" onClick={() => fetchWeather(c)}>{c}</button>
          ))}
        </div>

        {/* Mock banner */}
        {isMock && (
          <div className="mock-banner">
            Demo mode — add your OpenWeatherMap API key in App.tsx to fetch live data
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <span>Fetching weather...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-card">{error}</div>
        )}

        {/* Weather Card */}
        {weather && !loading && (
          <>
            <div className="weather-card">
              <div className="wc-top">
                <div className="wc-left">
                  <div className="wc-city">{weather.city}, {weather.country}</div>
                  <div className="wc-date">{formatDay(weather.dt)}</div>
                  <div className="wc-desc">{weather.description}</div>
                  <div className="wc-temp">
                    {Math.round(weather.temp)}<span className="wc-unit">{tempUnit}</span>
                  </div>
                  <div className="wc-range">
                    H: {Math.round(weather.temp_max)}{tempUnit} &nbsp;·&nbsp; L: {Math.round(weather.temp_min)}{tempUnit}
                  </div>
                </div>
                <div className="wc-right">
                  <WeatherIcon icon={weather.icon} size={100} />
                  <div className="wc-feels">Feels like {Math.round(weather.feels_like)}{tempUnit}</div>
                </div>
              </div>

              <div className="stats-grid">
                <StatCard label="Humidity" value={`${weather.humidity}%`} />
                <StatCard label="Wind" value={`${weather.wind_speed} m/s`} sub={windDirection(weather.wind_deg)} />
                <StatCard label="Pressure" value={`${weather.pressure} hPa`} />
                <StatCard label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
                <StatCard label="Sunrise" value={formatTime(weather.sunrise)} />
                <StatCard label="Sunset" value={formatTime(weather.sunset)} />
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="forecast-section">
                <h2 className="forecast-title">5-Day Forecast</h2>
                <div className="forecast-grid">
                  {forecast.map((item) => <ForecastCard key={item.dt} item={item} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;