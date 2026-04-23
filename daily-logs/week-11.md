## Day 71 - April 18

**Project:** WebSocket Chat API
**Time Spent:** 3.5 hours

### What I Built

A real-time chat server using Node.js, Express, and the ws library. The HTTP server and WebSocket server share the same port, HTTP handles REST endpoints and the built-in test client, WebSocket handles ws://localhost:3000/ws. Users connect, register a username, and join a room. Messages broadcast to all room members instantly. Direct messages go to a specific online user. Presence notifications (join/leave) go to all room members. A heartbeat ping/pong every 30 seconds detects and terminates zombie connections. Four default rooms exist at startup. Custom rooms are created on demand and deleted when empty. The built-in HTML client lets you open two tabs and actually chat in real time.

### What I Learned

- WebSocket connections begin as HTTP upgrade requests — the client sends Upgrade: websocket and Connection: Upgrade headers, the server responds with 101 Switching Protocols, and from that point the TCP connection speaks the WebSocket framing protocol instead of HTTP
- The ws library attaches to an existing http.Server by passing { server: httpServer } — this means HTTP and WebSocket share the same port and Node.js routes them based on the presence of the Upgrade header
- WebSocket.send() only accepts strings or Buffers — objects must be JSON.stringify()’d before sending. On the receiving end, data.toString() then JSON.parse() gives back the object.
- Extending WebSocket with a ChatClient interface lets you attach per-connection state (id, username, room) directly to the socket object, avoiding a separate Map lookup for basic client info
- Heartbeat detection uses a two-step pattern: set isAlive = false, send ping(). If the client is alive, it sends a pong which triggers the pong event and sets isAlive = true. If isAlive is still false at the next heartbeat, the connection is a zombie and gets terminated.
- readyState === WebSocket.OPEN must be checked before every send — a client can disconnect between the time you loop over the room and the time you call send()

### Resources Used

- https://github.com/websockets/ws
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- https://www.rfc-editor.org/rfc/rfc6455 (WebSocket protocol spec)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism

### Tomorrow

Day 72 — Weather Backend. A proper weather API server that fetches from Open-Meteo, stores results in SQLite, and serves historical queries.

## Day 72 - April 19

**Project:** Weather Backend
**Time Spent:** 3 hours

### What I Built

A weather API backend combining SQLite persistence with Open-Meteo API fetching. Two tables: locations (10 Nigerian cities with coordinates, fetch_count, last_fetched_at) and weather_readings (every fetched snapshot with temperature, humidity, wind, weather code, and a forecast_json column storing the 7-day forecast as a JSON string). getCurrentWeather() checks if the latest reading for a location is younger than CACHE_FRESH_MS — if yes, return it from DB; if no, call Open-Meteo, store the result, update fetch stats, and return the new reading. History endpoint returns all stored readings for a city with an average temperature summary. Stats endpoint shows total readings and top queried cities.

### What I Learned

- Storing JSON in a SQLite TEXT column is a clean pattern for nested data you don’t need to filter by — the 7-day forecast array is always fetched as a whole, so a separate forecast_days table with foreign keys would add complexity with no query benefit
- A database index on (location_id, fetched_at DESC) is essential for history queries — without it SQLite scans every row in weather_readings to find matching location_id rows and sort them. With the index it goes directly to the matching rows.
- The freshness cache pattern — get latest row timestamp, compare to Date.now(), fetch if stale — is the same whether you cache in memory (Day 67), in Redis, or in SQLite. The principle is identical.
- `fetch_count = fetch_count + 1` in a SQL UPDATE is atomic. It reads and increments in a single operation in the database engine, avoiding the read-modify-write race condition that would happen if you read the count in Node.js, added 1, and wrote it back.
- Separating service logic from route handlers is especially important when the same logic (getCurrentWeather) needs to be called from multiple routes or reused in tests — routes stay thin and focused on HTTP

### Resources Used

- https://open-meteo.com/en/docs
- https://www.sqlite.org/queryplanner.html
- https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime

### Tomorrow

Day 73 — Currency Service. Exchange rates stored in SQLite with scheduled refresh.


## Day 73 - April 20

**Project:** Currency Service
**Time Spent:** 3 hours

### What I Built

A currency exchange rate service with SQLite persistence and a node-cron background scheduler. On startup, the server checks if the DB has any data — if not, it immediately fetches rates from open.er-api.com and stores them. A background job then refreshes rates on a cron schedule (every hour by default, configurable in .env). All read endpoints (rates, NGN summary, conversion, history) always query SQLite — the external API is never in the read request path. A refresh_log table records every scheduler run with success flag, duration, and error message. The conversion endpoint uses cross-rate calculation: amount × (toRate / fromRate) with USD as the bridge currency.

### What I Learned

- node-cron uses standard 5-field cron syntax. cron.validate() returns false for invalid expressions — always validate before scheduling to avoid a silent no-op.
- Background jobs must not crash the server on failure — a network timeout fetching rates at 3am should log the error and keep the old snapshot available. Wrapping the job body in try/catch and logging to refresh_log achieves this.
- Cross-rate conversion via a common base (USD) is the standard technique: to convert NGN to GBP, calculate (USD→GBP rate) / (USD→NGN rate) × amount. All rates in the snapshot share the same base so this always works.
- An initial fetch on startup is necessary for a good first-run experience — without it the server starts but every read endpoint returns 503 until the first cron fire.
- Storing the full rates JSON in one column (rates_json) is appropriate here because we always read and write the entire rate set together. Individual rate lookups happen in JavaScript after parsing, not in SQL.
- stopScheduler() in a SIGTERM handler prevents the cron job from firing mid-shutdown — important if a job is writing to the database when the process exits.

### Resources Used

- https://www.npmjs.com/package/node-cron
- https://crontab.guru (cron expression helper)
- https://www.exchangerate-api.com/docs/free
- https://en.wikipedia.org/wiki/Exchange_rate#Cross_rate

### Tomorrow

Day 74 — Quote API. A REST API serving categorised quotes stored in SQLite, with search, favourites, and random quote endpoint.


## Day 74 - April 21

**Project:** Quote API
**Time Spent:** 3 hours

### What I Built

A self-contained Quote REST API with 60 seeded quotes across 5 categories — Nigerian proverbs, tech, motivation, philosophy, and leadership. The key features are SQLite FTS5 full-text search, cursor pagination on all list endpoints, per-quote view count incremented on every GET, and IP-keyed favourites with toggle behaviour. The FTS5 virtual table uses content=‘quotes’ to avoid data duplication, and three database triggers (AFTER INSERT, AFTER UPDATE, AFTER DELETE) keep the FTS index in sync with the main table automatically. The search endpoint JOINs back to the main quotes table and uses ORDER BY rank for relevance-sorted results.

### What I Learned

- SQLite FTS5 builds an inverted index — a data structure that maps every unique word to the rows containing it. This makes full-text search O(log n) instead of O(n) like LIKE scanning.
- A content FTS5 table (content=‘quotes’, content_rowid=‘id’) stores only the search index, not copies of the text. The tradeoff is that you must JOIN to the main table to retrieve full row data, and you must maintain the index manually via triggers.
- Database triggers are functions that run automatically inside SQLite when a specific event (INSERT, UPDATE, DELETE) occurs on a table. They are the correct way to keep a derived structure (like an FTS index) in sync with a source table.
- Pagination always needs two queries: COUNT(*) for total (to calculate pages and hasNext/hasPrev), and SELECT with LIMIT/OFFSET for the actual data slice. OFFSET = (page - 1) × limit.
- ORDER BY rank in FTS5 queries sorts results by relevance — SQLite FTS5 computes a rank score based on term frequency and inverse document frequency (TF-IDF style).
- view_count = view_count + 1 in SQL UPDATE is atomic — multiple simultaneous requests won’t produce a race condition where they both read 0 and both write 1.

### Resources Used

- https://www.sqlite.org/fts5.html
- https://www.sqlite.org/lang_createtrigger.html
- https://use-the-index-luke.com/sql/partial-results/fetch-next-page
- https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md

### Tomorrow

Day 75 — User Registration with bcrypt. Full user auth flow: register, login, profile update, password change, account deletion.

## Day 75 - April 22

**Project:** User Registration with bcrypt
**Time Spent:** 3 hours

### What I Built

A complete user management system extending Day 65’s basic auth with a full lifecycle: register (with password confirmation and policy), login (with login attempt logging), profile updates (name/bio/avatarUrl via PATCH), password change (requires current password), email change (requires password confirmation), login history (last 10 attempts), and hard account deletion (requires password + “DELETE” string confirmation). Six distinct Zod schemas cover each flow. A database trigger automatically updates the updated_at column on every user UPDATE. The login_log table records every authentication attempt regardless of success with userId, IP, success flag, reason, and timestamp.

### What I Learned

- Zod’s .refine() adds cross-field validation to a schema — used here for password confirmation (data.password === data.confirmPassword) and for ensuring the new password differs from the current one. The path option controls which field the error is attached to in the errors array.
- Password change must verify the current password first — without this, anyone who captures a JWT token can permanently change the password and lock out the real account owner. The token proves identity but the password proves possession of the credential.
- The “DELETE” confirmation pattern for account deletion creates two independent hurdles (correct password AND correct string) — both must pass. This prevents both accidental deletion and token-based attacks.
- A database AFTER UPDATE trigger that sets updated_at = datetime(‘now’) is safer than relying on application code — it fires for every UPDATE regardless of which code path triggered it, so updated_at can never be stale.
- Recording failed login attempts in login_log is as important as recording successes — failed attempts are the signal for brute-force detection, and the combination of IP + timestamp + user_id gives security teams the data to investigate suspicious activity.
- Returning the same “Invalid email or password” error for both wrong-email and wrong-password prevents enumeration attacks — if the API distinguished between them, attackers could cheaply validate which emails are registered.

### Resources Used

- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://zod.dev/?id=superrefine
- https://www.sqlite.org/lang_createtrigger.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

### Tomorrow

Day 76 — File Upload with multer. Accepting image and document uploads, validating file type and size, storing to disk.

# Daily Log — File Upload System (Multer)

## Date
April 23, 2026

---

## Goal
Build a complete file upload system with Multer, supporting avatars and documents with database tracking.

---

## Tasks Completed

- Set up Express router for uploads
- Configured Multer middleware for:
  - Single avatar upload
  - Multiple document uploads
- Implemented file validation:
  - File size limits
  - File type filtering
- Built upload endpoints:
  - POST /uploads/avatar
  - POST /uploads/documents
- Integrated SQLite database for storing file metadata
- Created helper functions:
  - baseUrl()
  - recordUpload()
- Implemented:
  - GET /uploads (with filtering + limit)
  - GET /uploads/:id
  - GET /uploads/stats
- Built DELETE /uploads/:id with:
  - DB-first deletion strategy
  - File system cleanup
- Added structured API responses
- Logged upload activity to console

---

## Challenges Faced

- Handling Multer errors correctly (LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, etc.)
- Ensuring correct field names for file uploads
- Managing file paths across different categories
- Preventing orphaned files or database records

---

## Solutions

- Implemented custom error handling inside Multer callbacks
- Standardized field names ("avatar", "documents")
- Used environment variables for directory paths
- Applied DB-first deletion strategy to maintain consistency

---

## What I Learned

- How Multer processes multipart/form-data
- Proper error handling patterns in file uploads
- Structuring scalable upload systems
- Managing file storage alongside database records

---

## Next Steps

- Add cloud storage integration (e.g., S3)
- Implement authentication for uploads
- Add rate limiting
- Optimize images before storage
- Improve validation rules

---

## Notes

System is functional, scalable, and ready for extension into production-level features.
