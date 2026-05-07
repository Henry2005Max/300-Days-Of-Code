# Day 89: Map API — Google Maps JS Full-Stack App

## Description

A full-stack Express application that serves an interactive Nigerian landmarks map powered by the Google Maps JavaScript API. The backend provides REST endpoints for landmark data (served from SQLite), address geocoding (with 24-hour cache), and route directions (with cached polylines). The frontend is a single HTML page rendered server-side with the Maps API key injected at request time — the key never appears in source files.

## What's New vs Day 79

Day 79 was a pure REST geocoding API. Day 89 adds the Google Maps **JavaScript API** (embedded map in a browser), the **Directions API** (route polyline drawn on the map), server-side HTML rendering with **API key injection** (the key never touches version control), and a polished interactive UI with category filters, landmark list, address search, and turn-by-turn direction rendering. New backend concept: serving an HTML file with `fs.readFileSync` + string replacement to embed secrets.

## Features

- Interactive map centred on Nigeria, showing 20 seeded landmarks across Lagos, Abuja, Port Harcourt, Kano, and Ibadan
- Colour-coded markers by category: culture, market, government, transport, education, bridge
- Sidebar with landmark list — click to pan and zoom the map
- Info window on each marker showing name, city, category, and description
- Category filter chips — filter both the list and the map markers in real time
- Address geocoding: type any Nigerian address, server geocodes it via Google API (or from 24h cache), drops a pin
- Directions: enter origin + destination, server fetches Google route, draws encoded polyline on map
- Distance and duration shown in the sidebar after routing
- REST API endpoints for all features — usable independently of the map UI
- Landmark keyword search: `GET /api/landmarks?q=airport`
- Works in demo mode without an API key — landmarks load from SQLite, geocoding and directions return 503

## Technologies Used

- Node.js + TypeScript
- Express 4 (API + HTML serving)
- Google Maps JavaScript API (browser)
- Google Geocoding API + Directions API (server-side)
- Axios
- better-sqlite3
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-089-maps-app/
├── src/
│   ├── db/
│   │   ├── database.ts          # Migrations + 20 Nigerian landmark seed
│   │   └── statements.ts        # Lazy prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/
│   │   └── api.ts               # /api/* JSON endpoints
│   ├── services/
│   │   └── maps.service.ts      # Geocoding, Directions, Landmark queries
│   ├── types/
│   │   └── index.ts
│   ├── views/
│   │   └── map.html             # Interactive map frontend
│   └── index.ts                 # Entry point — serves HTML + API
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-089-maps-app
cd day-089-maps-app
mkdir -p src/routes src/middleware src/db src/types src/services src/views
```

Copy all files, then:

```bash
npm install
```

## How to Run

### Getting a Google Maps API key

1. Go to https://console.cloud.google.com
2. Create or select a project
3. Go to **APIs & Services → Library** and enable:
    - **Maps JavaScript API**
    - **Geocoding API**
    - **Directions API**
4. Go to **APIs & Services → Credentials → Create Credentials → API Key**
5. Copy the key into `.env` as `GOOGLE_MAPS_API_KEY=your_key`

The app works without a key — the map loads and landmarks display from SQLite. Only geocoding and directions require the key.

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Testing Step by Step

### Step 1: Open the map in your browser

```
http://localhost:3000
```

You should see Nigeria centred on the map with coloured marker pins for all 20 landmarks.

### Step 2: Use the REST API directly

```bash
# All landmarks
curl http://localhost:3000/api/landmarks

# Filter to Lagos
curl "http://localhost:3000/api/landmarks?city=Lagos"

# Filter to education category
curl "http://localhost:3000/api/landmarks?category=education"

# Keyword search
curl "http://localhost:3000/api/landmarks?q=market"

# Single landmark
curl http://localhost:3000/api/landmarks/1
```

### Step 3: Geocode an address (requires API key)

```bash
curl "http://localhost:3000/api/geocode?address=Lekki Phase 1, Lagos, Nigeria"
```

Response includes lat, lng, formatted_address, and from_cache flag.

### Step 4: Geocode again — should hit cache

```bash
curl "http://localhost:3000/api/geocode?address=Lekki Phase 1, Lagos, Nigeria"
```

`from_cache: true` — no API call made.

### Step 5: Get directions between two locations

```bash
curl "http://localhost:3000/api/directions?origin=Murtala+Muhammed+Airport+Lagos&destination=Victoria+Island+Lagos"
```

Response includes distance_text, duration_text, and the encoded polyline.

### Step 6: View geocode history

```bash
curl http://localhost:3000/api/geocode/history
```

### Step 7: Use the map UI features

In the browser:
- Click any marker to see its info window
- Click any landmark in the sidebar list to pan to it
- Use the category filter chips (Culture, Market, etc.) to filter markers
- Type an address in the search box and click "Go" to geocode and drop a pin
- Enter origin and destination in the Directions section and click "Get Route" to draw the path

## What I Learned

- The Google Maps JavaScript API initialises via a `<script>` tag with `callback=initMap` — the function named `initMap` must be defined globally on `window` before the script loads, which is why `window.initMap = initMap` appears before the `<script>` tag
- `&libraries=geometry` must be included in the Maps JS script URL to use `google.maps.geometry.encoding.decodePath()` — the polyline decoding function lives in the optional geometry library, not the core API
- Injecting the API key server-side (reading the HTML file, replacing a placeholder, sending it) keeps the key out of version control while still making it available to the browser — a better pattern than embedding it directly in a committed HTML file
- An encoded polyline is a compact string representation of a series of lat/lng coordinates — Google's encoding algorithm uses ASCII characters so the polyline can be stored as a TEXT field in SQLite and decoded in the browser with the Maps geometry library
- `google.maps.LatLngBounds` + `map.fitBounds()` automatically calculates the correct zoom level and centre to show an entire route — no manual zoom calculation needed
- `google.maps.SymbolPath.CIRCLE` with custom `fillColor` creates colour-coded markers without needing image files — purely vector-based and scales perfectly at any zoom level

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 89 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | May 06, 2026 |
| Previous | [Day 88 — Advanced RSS Parser](../day-088-rss-advanced/) |
| Next     | [Day 90 — Sprint 3 Review & Deploy](../day-090-deploy/) |

Part of my 300 Days of Code Challenge!
