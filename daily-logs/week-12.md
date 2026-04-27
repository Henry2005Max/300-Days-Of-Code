## Day 79 - April 26

**Project:** Map API Integration with Geocoding and Haversine Distance
**Time Spent:** 4 hours

### What I Built

Today I built a map API that wraps the Google Maps Geocoding API, adds a 24-hour SQLite cache in front of it, and computes distances between any two stored locations using the Haversine formula. The geocoding service parses the `address_components` array from the Google response to extract structured fields, city, state, country, and postal code, by searching for components whose `types` array contains the relevant type string like `"locality"` or `"administrative_area_level_1"`. This is more robust than accessing a fixed index because the number and order of components varies by country.

The Haversine implementation was the most satisfying part to write. I implemented it from scratch in `haversine.ts` — it is about 15 lines of pure maths. The formula converts lat/lng degree differences to radians, applies the spherical law of cosines, and multiplies by Earth's mean radius (6371 km) to get the surface distance. I extended it with a bearing calculation using `Math.atan2` so the response tells you not just how far but in which compass direction, Lagos to Abuja is 925 km North-East, for example. The Nigerian cities table is seeded at startup with 15 cities and their real coordinates, so you can use the distance and bearing endpoints immediately without setting up a Google API key.

I also made the cache key normalisation explicit: `rawAddress.toLowerCase().trim()` before every lookup ensures "Lagos" and "lagos" and " LAGOS " all resolve to the same cached row. Without this, identical logical queries generate duplicate database rows, which wastes both storage and API quota.

### What I Learned

- Google's Geocoding API response structure has `address_components` as an unordered array — you must search by `types` rather than assume a fixed position for city or state fields
- The Haversine formula is the standard great-circle distance algorithm; it produces the shortest path along the Earth's surface (what a plane flies), not the straight-line chord through the Earth
- `Math.atan2(y, x)` returns `[-π, π]` — adding 360 and applying modulo 360 converts this to `[0°, 360°]` clockwise from North
- Google returns `"REQUEST_DENIED"` (not an HTTP 4xx) when your API key lacks the Geocoding API scope — you must inspect `response.data.status`, not just `response.status`
- A 24-hour TTL on physical address geocoding is aggressive caching but correct — street addresses almost never change, so serving stale data for up to a day is a safe trade-off for eliminating repeated API calls

### Resources Used

- https://developers.google.com/maps/documentation/geocoding/requests-geocoding
- https://developers.google.com/maps/documentation/geocoding/overview#geocoding-responses
- https://en.wikipedia.org/wiki/Haversine_formula
- https://www.movable-type.co.uk/scripts/latlong.html
- https://axios-http.com/docs/req_config

### Tomorrow

Day 80 — Lagos Traffic Mock API: build an Express API that simulates real-time Lagos traffic data — routes between major Lagos landmarks, traffic conditions (light/moderate/heavy), estimated travel times, and incident reports — all generated from realistic mock data stored in SQLite.

## Day 80 - April 27

**Project:** Lagos Traffic Mock API
**Time Spent:** 3.5 hours

### What I Built

Today I built a Lagos traffic simulation API that continuously updates its own state using a node-cron scheduler. The simulation engine reads the current hour, looks up a pre-built hourly congestion table (the Lagos 07:00–09:00 and 16:00–20:00 rush hours are modelled explicitly), applies a route-specific multiplier for structurally congested roads like Apapa–Oshodi Expressway (1.5×) and Third Mainland Bridge (1.4×), adds variance from a seeded pseudo-random function, then factors in the severity of any active incidents on that route. The result is written to `traffic_states` as the current condition and also appended to `traffic_history` as a time-series snapshot. The entire tick runs in a single SQLite transaction, so all 12 routes update atomically.

The incident system feeds directly into the simulation. When a high-severity incident is reported on Route 7, the next cron tick adds 30 percentage points of congestion to that route's calculation. Incidents auto-resolve after 3 hours via a cleanup query at the end of each tick — no separate scheduler needed. This design means the system degrades gracefully: if you never report incidents, it still behaves realistically based on time-of-day alone.

I also built an overview endpoint that aggregates the current state into a single response: worst three routes, best three routes, average city-wide congestion, and active incident count. This is the kind of endpoint a dashboard would poll every minute.

### What I Learned

- A pre-built hourly lookup array is the right tool for time-of-day modelling — real traffic patterns are irregular and domain-specific, not smooth mathematical functions
- Separating global state (time-of-day congestion) from local state (route multiplier) from event state (incident impact) into additive layers makes the simulation easy to tune — you change one number, not a formula
- Running one simulation tick immediately before `app.listen()` eliminates the cold-start problem where the first few requests get seed data instead of simulated data
- An append-only time-series table with no UPDATE statements is the correct pattern for history — it preserves the full audit trail and never needs conflict resolution
- `node-cron` uses standard Unix cron syntax (`*/2 * * * *` = every 2 minutes) and runs callbacks in the same Node.js process, making it lightweight for this use case versus a separate worker
- Auto-resolving stale incidents inside the simulation tick (rather than a dedicated cleanup cron) keeps all database writes to traffic data in one place, which makes the code easier to reason about

### Resources Used

- https://www.npmjs.com/package/node-cron
- https://en.wikipedia.org/wiki/Lagos_traffic
- https://www.vanguardngr.com/category/metro-crime/ (Lagos road names reference)
- https://www.openstreetmap.org/#map=11/6.5244/3.3792 (Lagos coordinates)
- https://www.better-sqlite3.com/api.html#transactionfunction---function

### Tomorrow

Day 81 — Chat API with WebSockets: build a multi-room chat API using the `ws` library with persistent message history in SQLite, user presence tracking, typing indicators, and private direct messages — a more advanced version of Day 71's WebSocket chat.

