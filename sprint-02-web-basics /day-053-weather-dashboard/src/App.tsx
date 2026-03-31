import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// Types
interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  visibility: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  dt: number;
  uvi?: number;
}

interface HourlyPoint {
  time: string;
  temp: number;
  icon: string;
}

interface DailyPoint {
  day: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
  humidity: number;
}

// Mock data — realistic Nigerian city weather
const MOCK_DATA: Record<string, WeatherData> = {
  Lagos: { city: "Lagos", country: "NG", temp: 31, feelsLike: 36, tempMin: 27, tempMax: 34, humidity: 82, windSpeed: 3.8, windDeg: 210, pressure: 1011, visibility: 8000, description: "scattered clouds", icon: "03d", sunrise: Date.now()/1000 - 21600, sunset: Date.now()/1000 + 18000, dt: Date.now()/1000 },
  Abuja: { city: "Abuja", country: "NG", temp: 28, feelsLike: 31, tempMin: 24, tempMax: 32, humidity: 65, windSpeed: 4.2, windDeg: 180, pressure: 1014, visibility: 10000, description: "clear sky", icon: "01d", sunrise: Date.now()/1000 - 21600, sunset: Date.now()/1000 + 18200, dt: Date.now()/1000 },
  Kano: { city: "Kano", country: "NG", temp: 35, feelsLike: 38, tempMin: 30, tempMax: 38, humidity: 28, windSpeed: 5.1, windDeg: 45, pressure: 1009, visibility: 10000, description: "clear sky", icon: "01d", sunrise: Date.now()/1000 - 21400, sunset: Date.now()/1000 + 17800, dt: Date.now()/1000 },
  "Port Harcourt": { city: "Port Harcourt", country: "NG", temp: 29, feelsLike: 34, tempMin: 26, tempMax: 32, humidity: 90, windSpeed: 2.9, windDeg: 225, pressure: 1010, visibility: 5000, description: "heavy rain", icon: "10d", sunrise: Date.now()/1000 - 21600, sunset: Date.now()/1000 + 18100, dt: Date.now()/1000 },
  Ibadan: { city: "Ibadan", country: "NG", temp: 30, feelsLike: 34, tempMin: 26, tempMax: 33, humidity: 74, windSpeed: 3.4, windDeg: 195, pressure: 1012, visibility: 9000, description: "few clouds", icon: "02d", sunrise: Date.now()/1000 - 21600, sunset: Date.now()/1000 + 17900, dt: Date.now()/1000 },
  Enugu: { city: "Enugu", country: "NG", temp: 27, feelsLike: 30, tempMin: 23, tempMax: 30, humidity: 78, windSpeed: 3.1, windDeg: 170, pressure: 1013, visibility: 9500, description: "light rain", icon: "10d", sunrise: Date.now()/1000 - 21500, sunset: Date.now()/1000 + 18000, dt: Date.now()/1000 },
};

const MOCK_HOURLY: HourlyPoint[] = [
  { time: "Now", temp: 31, icon: "03d" },
  { time: "1PM", temp: 32, icon: "03d" },
  { time: "2PM", temp: 33, icon: "01d" },
  { time: "3PM", temp: 34, icon: "01d" },
  { time: "4PM", temp: 33, icon: "02d" },
  { time: "5PM", temp: 31, icon: "02d" },
  { time: "6PM", temp: 29, icon: "03d" },
  { time: "7PM", temp: 28, icon: "03n" },
  { time: "8PM", temp: 27, icon: "03n" },
];

const MOCK_DAILY: DailyPoint[] = [
  { day: "Today",    tempMin: 27, tempMax: 34, icon: "03d", description: "scattered clouds", humidity: 82 },
  { day: "Tomorrow", tempMin: 26, tempMax: 33, icon: "10d", description: "light rain",        humidity: 88 },
  { day: "Wed",      tempMin: 27, tempMax: 35, icon: "01d", description: "clear sky",         humidity: 70 },
  { day: "Thu",      tempMin: 28, tempMax: 36, icon: "01d", description: "clear sky",         humidity: 65 },
  { day: "Fri",      tempMin: 26, tempMax: 32, icon: "10d", description: "moderate rain",     humidity: 92 },
  { day: "Sat",      tempMin: 25, tempMax: 30, icon: "11d", description: "thunderstorm",      humidity: 95 },
  { day: "Sun",      tempMin: 27, tempMax: 33, icon: "02d", description: "few clouds",        humidity: 75 },
];

const NIGERIAN_CITIES = ["Lagos", "Abuja", "Kano", "Port Harcourt", "Ibadan", "Enugu"];

// Helpers
function windDir(deg: number): string {
  return ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getUVLabel(uvi: number): { label: string; color: string } {
  if (uvi < 3)  return { label: "Low",       color: "#22c55e" };
  if (uvi < 6)  return { label: "Moderate",  color: "#f59e0b" };
  if (uvi < 8)  return { label: "High",      color: "#f97316" };
  if (uvi < 11) return { label: "Very High", color: "#ef4444" };
  return              { label: "Extreme",   color: "#7c3aed" };
}

function getAQI(): { value: number; label: string; color: string } {
  const aqi = Math.floor(Math.random() * 80) + 30;
  if (aqi < 50)  return { value: aqi, label: "Good",       color: "#22c55e" };
  if (aqi < 100) return { value: aqi, label: "Moderate",   color: "#f59e0b" };
  return              { value: aqi, label: "Unhealthy",   color: "#ef4444" };
}

// Temp bar chart
const TempChart: React.FC<{ hourly: HourlyPoint[] }> = ({ hourly }) => {
  const temps = hourly.map(h => h.temp);
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;
  const range = max - min;

  return (
    <div className="temp-chart">
      {hourly.map((h, i) => {
        const pct = ((h.temp - min) / range) * 100;
        return (
          <div key={i} className="chart-col">
            <span className="chart-temp">{h.temp}°</span>
            <div className="chart-bar-wrap">
              <div className="chart-bar" style={{ height: `${pct}%` }} />
            </div>
            <span className="chart-time">{h.time}</span>
          </div>
        );
      })}
    </div>
  );
};

// Stat widget
const StatWidget: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="stat-widget">
    <span className="sw-label">{label}</span>
    <span className="sw-value" style={color ? { color } : {}}>{value}</span>
    {sub && <span className="sw-sub">{sub}</span>}
  </div>
);

// App
const App: React.FC = () => {
  const [activeCity, setActiveCity] = useState("Lagos");
  const [savedCities, setSavedCities] = useState<string[]>(["Lagos", "Abuja"]);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const weather = MOCK_DATA[activeCity] ?? MOCK_DATA["Lagos"];
  const aqi = useMemo(() => getAQI(), [activeCity]);
  const uvi = useMemo(() => ({ value: 7, ...getUVLabel(7) }), [activeCity]);

  const toTemp = (c: number) => unit === "C" ? c : Math.round(c * 9/5 + 32);
  const tempUnit = unit === "C" ? "°C" : "°F";

  const simulateFetch = useCallback((city: string) => {
    setLoading(true);
    setTimeout(() => { setActiveCity(city); setLoading(false); }, 500);
  }, []);

  const toggleSave = (city: string) => {
    setSavedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const bgClass = weather.icon.includes("10") || weather.icon.includes("11") ? "bg-rain"
    : weather.icon.includes("01") ? "bg-clear"
    : weather.icon.includes("13") ? "bg-snow"
    : "bg-cloud";

  const filteredCities = NIGERIAN_CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 53</span>
          <h1 className="header-title">Weather Dashboard</h1>
          <div className="unit-toggle">
            <button className={unit === "C" ? "active" : ""} onClick={() => setUnit("C")}>°C</button>
            <button className={unit === "F" ? "active" : ""} onClick={() => setUnit("F")}>°F</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Sidebar */}
          <aside className="sidebar">
            <input className="search-input" placeholder="Search city..." value={search}
              onChange={e => setSearch(e.target.value)} />

            <div className="city-list">
              {filteredCities.map(city => {
                const w = MOCK_DATA[city];
                return (
                  <button key={city}
                    className={`city-btn ${activeCity === city ? "active" : ""}`}
                    onClick={() => simulateFetch(city)}>
                    <div className="city-btn-left">
                      <span className="city-name">{city}</span>
                      <span className="city-desc">{w?.description}</span>
                    </div>
                    <div className="city-btn-right">
                      <span className="city-temp">{toTemp(w?.temp ?? 0)}{tempUnit}</span>
                      <button className={`save-city-btn ${savedCities.includes(city) ? "saved" : ""}`}
                        onClick={e => { e.stopPropagation(); toggleSave(city); }}>
                        {savedCities.includes(city) ? "★" : "☆"}
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>

            {savedCities.length > 0 && (
              <div className="saved-section">
                <h3 className="saved-title">Saved</h3>
                {savedCities.map(c => (
                  <button key={c} className="saved-chip" onClick={() => simulateFetch(c)}>{c}</button>
                ))}
              </div>
            )}
          </aside>

          {/* Main content */}
          <div className="content">
            {loading ? (
              <div className="loading"><div className="spinner" /><span>Fetching weather...</span></div>
            ) : (
              <>
                {/* Hero */}
                <div className={`hero-card ${bgClass}`}>
                  <div className="hero-top">
                    <div>
                      <h2 className="hero-city">{weather.city}, {weather.country}</h2>
                      <p className="hero-desc">{weather.description}</p>
                      <p className="hero-time">Updated {formatTime(weather.dt)}</p>
                    </div>
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt="icon" className="hero-icon" />
                  </div>
                  <div className="hero-temp">{toTemp(weather.temp)}<span className="hero-unit">{tempUnit}</span></div>
                  <div className="hero-range">
                    H: {toTemp(weather.tempMax)}{tempUnit} · L: {toTemp(weather.tempMin)}{tempUnit}
                    &nbsp;·&nbsp; Feels like {toTemp(weather.feelsLike)}{tempUnit}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="stats-grid">
                  <StatWidget label="Humidity"    value={`${weather.humidity}%`} sub={weather.humidity > 80 ? "High" : "Normal"} />
                  <StatWidget label="Wind"        value={`${weather.windSpeed} m/s`} sub={windDir(weather.windDeg)} />
                  <StatWidget label="Pressure"    value={`${weather.pressure}`} sub="hPa" />
                  <StatWidget label="Visibility"  value={`${(weather.visibility/1000).toFixed(1)}`} sub="km" />
                  <StatWidget label="UV Index"    value={uvi.value.toString()} sub={uvi.label} color={uvi.color} />
                  <StatWidget label="Air Quality" value={aqi.value.toString()} sub={aqi.label} color={aqi.color} />
                  <StatWidget label="Sunrise"     value={formatTime(weather.sunrise)} />
                  <StatWidget label="Sunset"      value={formatTime(weather.sunset)} />
                </div>

                {/* Hourly chart */}
                <div className="panel">
                  <h3 className="panel-title">Hourly Forecast</h3>
                  <TempChart hourly={MOCK_HOURLY} />
                </div>

                {/* 7-day forecast */}
                <div className="panel">
                  <h3 className="panel-title">7-Day Forecast</h3>
                  <div className="daily-list">
                    {MOCK_DAILY.map((d, i) => (
                      <div key={i} className="daily-row">
                        <span className="daily-day">{d.day}</span>
                        <img src={`https://openweathermap.org/img/wn/${d.icon}.png`} alt="icon" className="daily-icon" />
                        <span className="daily-desc">{d.description}</span>
                        <div className="daily-temps">
                          <span className="daily-max">{toTemp(d.tempMax)}{tempUnit}</span>
                          <span className="daily-min">{toTemp(d.tempMin)}{tempUnit}</span>
                        </div>
                        <div className="daily-hum">💧 {d.humidity}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* City comparison */}
                <div className="panel">
                  <h3 className="panel-title">Nigerian Cities Comparison</h3>
                  <div className="comparison-grid">
                    {NIGERIAN_CITIES.map(city => {
                      const w = MOCK_DATA[city];
                      return (
                        <div key={city} className={`comp-card ${activeCity === city ? "comp-active" : ""}`}
                          onClick={() => simulateFetch(city)}>
                          <span className="comp-city">{city}</span>
                          <span className="comp-temp">{toTemp(w.temp)}{tempUnit}</span>
                          <span className="comp-desc">{w.description}</span>
                          <div className="comp-hum">💧 {w.humidity}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;