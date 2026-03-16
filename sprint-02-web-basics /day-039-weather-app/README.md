# Day 39: Weather App UI (Fetch Data)

## Description
A weather app built with React, TypeScript, and Axios that fetches live data from the OpenWeatherMap API. Shows current conditions, a 6-stat detail grid, and a 5-day forecast. The background gradient changes dynamically based on weather conditions. Loads Lagos on startup with 10 Nigerian city quick-links. Works in demo mode without an API key.

## Features
- Fetches live weather and 5-day forecast from OpenWeatherMap API using Axios
- Background gradient changes dynamically: blue for clear, grey for cloudy, dark for rain/storm
- Current conditions: temperature, feels like, high/low, description, weather icon
- 6-stat detail grid: humidity, wind speed/direction, pressure, visibility, sunrise, sunset
- 5-day forecast cards with daily high/low, icon, description, humidity
- 10 Nigerian city quick-select chips: Lagos, Abuja, Kano, Port Harcourt, Ibadan and more
- Celsius / Fahrenheit toggle
- Spinner loading state, error card for invalid cities
- Demo mode with mock Lagos data when no API key is set
- Glassmorphism UI with backdrop-filter blur
- Responsive layout

## Technologies Used
- React 18
- TypeScript
- Axios
- Vite
- OpenWeatherMap API (https://openweathermap.org/api)
- CSS (glassmorphism, custom properties, keyframe animations)
- Google Fonts (Plus Jakarta Sans, Barlow Condensed)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Adding Your API Key

1. Sign up free at https://openweathermap.org/api
2. Go to API Keys in your account dashboard
3. Copy your key
4. Open src/App.tsx and replace:
   ```
   const API_KEY = "REPLACE_WITH_YOUR_OPENWEATHERMAP_KEY";
   ```
   with your actual key

## Testing — Step by Step

Step 1 — Page loads with Lagos weather in demo mode. You'll see the mock banner at the top.

Step 2 — Click any of the 10 Nigerian city chips. The loading spinner appears, then the weather card updates with that city's data.

Step 3 — Type any city in the search box (e.g. "London" or "New York") and press Enter or click Search.

Step 4 — Watch the background gradient change based on the weather condition of each city.

Step 5 — Toggle between °C and °F using the buttons in the top-right header.

Step 6 — Scroll down to the 5-Day Forecast section. Each card shows day, icon, description, high/low temps, and humidity.

Step 7 — Type an invalid city name. The error card appears: "City not found."

Step 8 — Add your API key to get live data. The demo mode banner disappears.

## What I Learned
- Running two Axios requests in parallel with Promise.all for weather and forecast
- Processing OpenWeatherMap's 3-hourly forecast into daily summaries by grouping on date string
- Dynamic background classes based on weather icon codes
- Glassmorphism: backdrop-filter blur + semi-transparent backgrounds
- Demo/mock mode pattern — detect missing API key and serve local data instead of crashing
- useCallback for stable fetch function reference used in useEffect

## Challenge Info
**Day:** 39/300
**Sprint:** 2 - Web Basics
**Date:** MON, MAR 16
**Previous Day:** [Day 38 - Dark Mode with Context API](../day-038-dark-mode)
**Next Day:** [Day 40 - Review: Add Tailwind to Day 31](../day-040-tailwind-review)

---

Part of my 300 Days of Code Challenge!
