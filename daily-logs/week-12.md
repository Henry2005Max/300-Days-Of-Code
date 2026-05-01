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


## Day 81 - April 28

**Project:** Advanced Chat API with WebSockets
**Time Spent:** 4 hours

### What I Built

Today I rebuilt the WebSocket chat from Day 71 into a production-grade API with persistent history, presence, typing indicators, and direct messages. The biggest architectural change was splitting the WebSocket layer into three focused files: `registry.ts` owns the in-memory Map of connected clients and all broadcast logic; `handlers.ts` contains one pure function per message type; and `server.ts` only deals with the WS server setup and heartbeat. This separation means I can reason about each concern independently — registry is about who is connected, handlers are about what messages mean, server is about the transport layer.

The key performance optimisation was `statements.ts`. Every prepared statement is compiled once when the module loads. In Day 71’s version, `db.prepare()` was called inside the message handler, meaning SQLite re-parsed the SQL on every incoming message. At high throughput that adds up. The same principle applies to broadcast: I serialise the JSON payload to a Buffer once before the loop and send the same buffer to every recipient, rather than calling `JSON.stringify` once per client. Both are micro-optimisations that matter at scale but cost nothing at development scale.

The typing indicator required careful timer management. `handleTypingStart` always clears any existing timer before setting a new one — this means rapid `typing_start` events refresh the window rather than stack multiple timers. Without this, a client that sends `typing_start` ten times would fire ten separate “stop typing” broadcasts over the next 8 seconds. The auto-expiry also means a client that disconnects mid-typing never leaves a stuck indicator in the room.

### What I Learned

- Pre-compiling prepared statements at module load time rather than inside handlers is the correct pattern for any hot-path database work — the cost difference is negligible at low volume but significant at high volume
- `Buffer.from(JSON.stringify(msg))` before a broadcast loop avoids N serialisation calls — the same principle as memoisation, applied to I/O serialisation
- `wss.handleUpgrade` with `noServer: true` is the correct way to share a single port between Express and WebSocket — Express handles all non-upgrade requests, the upgrade handler intercepts the protocol switch
- Timer management for typing indicators requires `clearTimeout` before `setTimeout` on every call to the start handler — without this, rapid `typing_start` events accumulate timers
- A nullable `read_at` column is sufficient for DM read receipts in a 1-to-1 system; a junction table is only needed when one message has multiple readers (group messages)
- `handleDisconnect` should be idempotent and safe to call multiple times — both the `close` and `error` events can fire on the same socket, so deregistering from the Map first and checking for undefined prevents double-broadcast of the offline presence event

### Resources Used

- https://github.com/websockets/ws#readme
- https://github.com/websockets/ws/blob/master/doc/ws.md
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
- https://www.better-sqlite3.com/api.html#preparestring—statement
- https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener

### Tomorrow

Day 82 — Weather Backend Service: an Express API that fetches current weather and forecasts for Nigerian cities from the OpenWeatherMap API, caches results in SQLite with a 10-minute TTL, and exposes weather alerts, temperature history, and a multi-city comparison endpoint.


## Day 82 - April 29

**Project:** Weather Backend Service with OpenWeatherMap
**Time Spent:** 3.5 hours

### What I Built

Today I built a weather backend that wraps the OpenWeatherMap API with a 10-minute SQLite cache, a threshold-based alert engine, and a multi-city comparison endpoint. The cache uses SQLite’s `ON CONFLICT(city) DO UPDATE SET` upsert syntax — one row per city, refreshed in place. Every time a fresh reading arrives, it runs through five alert rules: HIGH_TEMP, EXTREME_HEAT, HIGH_HUMIDITY, STRONG_WIND, and LOW_VISIBILITY. Each rule declares its own threshold, severity, and message-builder function in a rules array, so adding a new alert type is one object, not a new if-else branch.

The multi-city comparison endpoint uses `Promise.allSettled` to fetch all requested cities concurrently. Unlike `Promise.all`, `allSettled` does not reject if one city fails — if Lagos returns data and “NotACity” fails, the comparison still works with the successful results. After fetching, a one-liner reduce per metric (hottest, coolest, most humid, windiest) builds the summary. This pattern will be very reusable for any endpoint that aggregates across multiple external calls.

I also applied the lazy `initStatements()` pattern from the Day 81 fix proactively — `statements.ts` compiles no prepared statements at module load time. `initStatements()` is called in `bootstrap()` on the line immediately after `runMigrations()`. This ordering guarantee means the Day 81 “no such table” crash cannot happen here.

### What I Learned

- SQLite `ON CONFLICT(city) DO UPDATE SET` is the cleanest upsert pattern for a one-row-per-key cache — no SELECT-then-INSERT logic, no race condition, the database handles atomicity
- `Promise.allSettled` returns `{ status: "fulfilled" | "rejected", value | reason }` for each promise — filtering to `status === "fulfilled"` and mapping to `r.value` extracts successful results without a try/catch per item
- A rules array pattern for threshold evaluation is far easier to maintain than if/else chains — each rule is self-contained and the evaluation loop is generic
- `new Date(cachedAt + "Z")` is required when the timestamp comes from SQLite’s `datetime('now')` — SQLite stores UTC but without the “Z” suffix, so JavaScript parses it as local time unless you append it manually
- OpenWeatherMap returns HTTP 200 for most successful requests, but a 404 means the city wasn’t found and 401 means the key is invalid or not yet activated (new keys take up to 2 hours)

### Resources Used

- https://openweathermap.org/current
- https://openweathermap.org/forecast5
- https://www.sqlite.org/lang_upsert.html
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
- https://axios-http.com/docs/handling_errors

### Tomorrow

Day 83 — Currency Service: revisit Day 73’s currency scheduler with a more complete implementation — live exchange rates from an API, historical rate storage, cross-rate calculation for any pair, and a rate trend/chart endpoint showing how a currency moved over the past 7 days.


## Day 83 - April 30

**Project:** Currency Service with Historical Rates and Trend Analysis
**Time Spent:** 3.5 hours

### What I Built

Today I extended Day 73's currency scheduler into a full-featured service with four additions: historical snapshots, cross-rate arithmetic, trend analysis, and threshold alerts. The biggest architectural decision was keeping only USD-based rates in `live_rates` (N rows) and deriving any other pair in-app — converting NGN to GBP means dividing the GBP rate by the NGN rate since both are already expressed relative to USD. This is standard forex arithmetic and avoids storing N² pairs while still supporting any combination.

The snapshot system uses an append-only pattern: every cron tick inserts one row per currency into `rate_snapshots`. Old rows are pruned at the end of each refresh using `datetime('now', '-30 days')` as the cutoff. The trend endpoint reads those rows, sorts them by time, and computes start rate, current rate, high, low, average, absolute change, and percentage change entirely in-app — no aggregate SQL needed. This keeps the query simple and the computation transparent.

Rate alerts check on every refresh by scanning `rate_alerts WHERE active = 1`, comparing each alert's threshold against the freshly fetched rate, and writing `triggered_at` if the condition is met. Alerts are never auto-deleted, so the history of when they fired is preserved. The server also gracefully handles a failed initial rate fetch at startup — it logs a warning and continues, so a temporary API outage does not prevent the server from starting.

### What I Learned

- Cross-rate arithmetic: `rate(A→B) = rateBase_B / rateBase_A` — both rates already exist in the database, so the computation is two lookups and one division with no additional API call
- `Math.max(...array)` spreads the array as arguments and throws "Maximum call stack size exceeded" for arrays with tens of thousands of elements; `reduce` with `Math.max` is the safe alternative
- Appending snapshots on every refresh rather than updating is the correct time-series pattern — pruning by date keeps storage bounded without needing soft-deletes or versioning
- Storing `triggered_at` as a nullable TEXT (ISO datetime) rather than a boolean `triggered` gives you history for free: you can see both whether an alert has ever fired and exactly when it last fired
- Wrapping the startup rate fetch in a try/catch that logs a warning (instead of crashing) is important for production reliability — a transient API failure at boot should not prevent the server from starting

### Resources Used

- https://www.exchangerate-api.com/docs/standard-requests
- https://open.er-api.com/v6/latest/USD
- https://www.investopedia.com/terms/c/crossrate.asp
- https://www.npmjs.com/package/node-cron
- https://www.sqlite.org/lang_datefunc.html

### Tomorrow

Day 84 — Quote API: full-text search over a Nigerian and African quotes collection, favourites, view counts, random quote of the day, and tag-based filtering — building on Day 74's FTS5 foundation with richer features.

## Day 84 - May 01

**Project:** Quote API with FTS5 Search, Tags, Favourites, and View Counts
**Time Spent:** 3.5 hours

### What I Built

Today I built a quote API with 30 seeded Nigerian and African quotes, full-text search via SQLite's FTS5 engine, a many-to-many tag system, per-user favourites, and a deterministic quote-of-the-day. The FTS5 setup required three manual sync triggers — AFTER INSERT, AFTER DELETE, and AFTER UPDATE on the `quotes` table — because SQLite does not automatically keep a content FTS table in sync. Each trigger writes to the virtual `quotes_fts` table using the special `'delete'` prefix syntax for removals. This is more verbose than FTS4 but gives better search quality and explicit control.

The quote-of-the-day requires no cron job or extra table. I compute the day-of-year as `floor((now - Jan 1) / 86400000)`, take modulo the total quote count, and use that as an OFFSET into the `quotes` table ordered by id. The result is deterministic — every call on the same day returns the same quote — and resets naturally at midnight. If new quotes are added the mapping shifts slightly, which is acceptable behaviour for a daily quote.

The tag system uses a classic junction table: `quote_tags(quote_id, tag_id)`. Rather than joining tags in every query (which gets complex with FTS5 joins), I enrich each result set in a second pass — one `getTagsFor(id)` call per quote. For a result set of 10–20 quotes this N+1 is not measurable, but I documented the GROUP_CONCAT alternative for when it matters.

### What I Learned

- FTS5 content tables need manual AFTER INSERT/DELETE/UPDATE triggers — the `'delete'` prefix in the INSERT statement is FTS5's special syntax for removing a document from the index, not a regular SQL INSERT
- FTS5 `rank` is negative and closer to zero means better relevance — `ORDER BY rank ASC` is correct, which feels backwards compared to most ranking systems
- User input to FTS5 MATCH must be sanitised — `"`, `*`, and `:` are FTS5 syntax characters and will cause an error if passed raw. Wrapping in double quotes and stripping specials is the safe default
- `ConflictError` (HTTP 409) is semantically correct for duplicate favourites — the request itself is valid, but it conflicts with existing state. 400 is for malformed requests
- Day-of-year modulo total quotes is a zero-dependency, zero-cron way to implement a stable daily selection — the same pattern could be adapted for "featured item of the week" or "monthly spotlight"

### Resources Used

- https://www.sqlite.org/fts5.html
- https://www.sqlite.org/fts5.html#full_text_query_syntax
- https://www.sqlite.org/fts5.html#the_content_and_content_rowid_options
- https://www.npmjs.com/package/better-sqlite3
- https://brainyquote.com (reference for quote verification)

### Tomorrow

Day 85 — User Registration with bcrypt: full user lifecycle including registration, email verification tokens, login with JWT, password reset flow, login history, and account lockout after repeated failed attempts.
