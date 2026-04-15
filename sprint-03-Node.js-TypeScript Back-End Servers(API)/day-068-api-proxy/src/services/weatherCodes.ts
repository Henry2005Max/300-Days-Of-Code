/* ── WMO Weather Interpretation Codes ───────────────────────────────
   Open-Meteo uses WMO (World Meteorological Organization) codes
   to describe weather conditions. We map them to readable strings.
────────────────────────────────────────────────────────────────────── */
const WMO_CODES: Record<number, string> = {
  0:  "Clear sky",
  1:  "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code] ?? `Unknown (code ${code})`;
}