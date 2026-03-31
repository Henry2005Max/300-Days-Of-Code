# Day 53: Weather Dashboard

## Description

A full weather dashboard for Nigerian cities, going well beyond Day 39’s basic UI. Features a hero card with dynamic background, an 8-stat widget grid (humidity, wind, pressure, visibility, UV index, AQI, sunrise, sunset), a custom hourly temperature bar chart, a 7-day forecast list, and a city comparison grid for all 6 major Nigerian cities.

## Features

- 6 Nigerian cities: Lagos, Abuja, Kano, Port Harcourt, Ibadan, Enugu
- Hero card background shifts based on weather condition (clear/cloud/rain/snow)
- °C / °F toggle converting all temperature values
- 8-stat widget grid: humidity, wind speed + direction, pressure, visibility, UV index, AQI, sunrise, sunset
- UV index with colour-coded label (Low → Extreme)
- Air Quality Index with colour-coded label (Good → Unhealthy)
- Custom hourly bar chart: 9 time slots, proportional bar heights from actual temp range
- 7-day forecast list with icon, description, high/low, humidity
- City comparison grid — 6 cities at a glance, click any to switch active city
- City search in sidebar with city save/unsave toggle (star button)
- Saved cities section with quick-access chips
- 500ms loading spinner when switching cities

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS (custom properties, grid, keyframe animations)
- Google Fonts (Plus Jakarta Sans, Barlow Condensed)
- OpenWeatherMap icons (cdn)

## Installation

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Then open http://localhost:5173

## Testing — Step by Step

Step 1 — Lagos loads by default. Check the hero card gradient — blue for clear/cloud.

Step 2 — Click “Port Harcourt” in the sidebar. Spinner shows for 500ms, then the hero card turns dark blue (rain condition). Humidity shows 90% marked “High”.

Step 3 — Click “Kano”. UV index shows 7 in orange labelled “Very High”. Temperature is highest of all cities.

Step 4 — Toggle °C to °F in the header. All temperatures across the dashboard convert.

Step 5 — Click the ☆ star on any city to save it. It appears in the Saved section below the list.

Step 6 — Type “ab” in the search box — list filters to Abuja only.

Step 7 — Scroll to the Hourly Forecast. Bar heights reflect relative temperature — taller bar = hotter hour.

Step 8 — Scroll to City Comparison. All 6 cities shown side by side. Click any card to switch active city.

## What I Learned

- Dashboard layout: sidebar city list + main content is a very common real-world pattern
- Dynamic CSS classes on a component (bg-clear, bg-rain) cleanly swap the entire visual theme
- Custom bar chart without a library: normalize temps to a 0–100% scale, set CSS height percentage
- UV index and AQI colour coding: returning an object with both value and colour from a helper function
- useMemo for AQI and UV so they don’t regenerate on every render
- 500ms loading simulation makes state transitions feel more realistic

## Challenge Info

**Day:** 53/300
**Sprint:** 2 - Web Basics
**Date:** MON, MAR 30
**Previous Day:** [Day 52 - Color Picker Extended](../day-052-color-picker-extended)
**Next Day:** [Day 54 - Expense Tracker](../day-054-expense-tracker)

-----

Part of my 300 Days of Code Challenge!
