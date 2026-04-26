## Day 79 - April 26

**Project:** Map API Integration with Geocoding and Haversine Distance
**Time Spent:** 4 hours

### What I Built

Today I built a map API that wraps the Google Maps Geocoding API, adds a 24-hour SQLite cache in front of it, and computes distances between any two stored locations using the Haversine formula. The geocoding service parses the `address_components` array from the Google response to extract structured fields — city, state, country, and postal code — by searching for components whose `types` array contains the relevant type string like `"locality"` or `"administrative_area_level_1"`. This is more robust than accessing a fixed index because the number and order of components varies by country.

The Haversine implementation was the most satisfying part to write. I implemented it from scratch in `haversine.ts` — it is about 15 lines of pure maths. The formula converts lat/lng degree differences to radians, applies the spherical law of cosines, and multiplies by Earth's mean radius (6371 km) to get the surface distance. I extended it with a bearing calculation using `Math.atan2` so the response tells you not just how far but in which compass direction — Lagos to Abuja is 925 km North-East, for example. The Nigerian cities table is seeded at startup with 15 cities and their real coordinates, so you can use the distance and bearing endpoints immediately without setting up a Google API key.

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
